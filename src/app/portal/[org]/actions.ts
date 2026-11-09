'use server';

import { and, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { getDb } from '@/db';
import { memberships, projects, proposals, tasks } from '@/db/schema';
import { recordAudit } from '@/lib/audit';
import { auditActor, requireOrgMember, runAction, type ActionResult } from '@/lib/auth/guards';
import { CLIENT_ASSIGNABLE_ROLES } from '@/lib/auth/permissions';
import { createInvitation } from '@/server/invitations';
import { storeOrgFile } from '@/server/files';
import { addTicketMessage, createTicket } from '@/server/tickets';

const slug = z.string().regex(/^[a-z0-9-]{1,80}$/);
const uuid = z.string().uuid();

export async function portalCreateTicket(_p: ActionResult<unknown>, fd: FormData): Promise<ActionResult<unknown>> {
  return runAction(async () => {
    const parsed = z
      .object({
        org: slug,
        subject: z.string().trim().min(3).max(200),
        body: z.string().trim().min(5).max(10000),
        priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
        projectId: z.union([uuid, z.literal('')]).optional(),
      })
      .safeParse(Object.fromEntries(fd));
    if (!parsed.success) return { ok: false, error: 'Please add a subject and a short description.', fieldErrors: parsed.error.flatten().fieldErrors };
    const { actor, org } = await requireOrgMember(parsed.data.org, 'tickets:create');
    if (parsed.data.projectId) {
      const p = await getDb().query.projects.findFirst({ where: and(eq(projects.id, parsed.data.projectId), eq(projects.orgId, org.id)) });
      if (!p) return { ok: false, error: 'Project not found.' };
    }
    const id = await createTicket(actor, org.id, { subject: parsed.data.subject, body: parsed.data.body, priority: parsed.data.priority, projectId: parsed.data.projectId || null });
    redirect(`/portal/${org.slug}/support/${id}`);
  });
}

export async function portalReplyTicket(_p: ActionResult<unknown>, fd: FormData): Promise<ActionResult<unknown>> {
  return runAction(async () => {
    const parsed = z.object({ org: slug, ticketId: uuid, body: z.string().trim().min(1).max(10000) }).safeParse(Object.fromEntries(fd));
    if (!parsed.success) return { ok: false, error: 'Write a message first.' };
    const { actor, org } = await requireOrgMember(parsed.data.org, 'tickets:create');
    const t = await addTicketMessage(actor, org.id, parsed.data.ticketId, parsed.data.body, false);
    if (!t) return { ok: false, error: 'Not found.' };
    revalidatePath(`/portal/${org.slug}/support/${parsed.data.ticketId}`);
    return { ok: true, message: 'Message sent.' };
  });
}

export async function portalUploadFile(_p: ActionResult<unknown>, fd: FormData): Promise<ActionResult<unknown>> {
  return runAction(async () => {
    const orgSlug = slug.parse(fd.get('org'));
    const { actor, org } = await requireOrgMember(orgSlug, 'files:upload');
    const file = fd.get('file');
    if (!(file instanceof File)) return { ok: false, error: 'Choose a file to upload.' };
    const res = await storeOrgFile(actor, org.id, file, { visibility: 'client', projectId: null });
    if (!res.ok) return { ok: false, error: res.error };
    revalidatePath(`/portal/${org.slug}/documents`);
    return { ok: true, message: 'Uploaded. Koral Digital has been given access.' };
  });
}

export async function portalCompleteChecklistItem(_p: ActionResult<unknown>, fd: FormData): Promise<ActionResult<unknown>> {
  return runAction(async () => {
    const parsed = z.object({ org: slug, taskId: uuid, done: z.enum(['true', 'false']) }).safeParse(Object.fromEntries(fd));
    if (!parsed.success) return { ok: false, error: 'Invalid request.' };
    const { actor, org } = await requireOrgMember(parsed.data.org, 'tickets:create');
    const done = parsed.data.done === 'true';
    const [t] = await getDb()
      .update(tasks)
      .set({ status: done ? 'done' : 'open', completedAt: done ? new Date() : null })
      .where(and(eq(tasks.id, parsed.data.taskId), eq(tasks.orgId, org.id), eq(tasks.clientVisible, true)))
      .returning({ id: tasks.id, projectId: tasks.projectId });
    if (!t) return { ok: false, error: 'Not found.' };
    await recordAudit({ actor: auditActor(actor), action: 'checklist.item_toggled', entityType: 'task', entityId: t.id, orgId: org.id, metadata: { done } });
    revalidatePath(`/portal/${org.slug}`);
    if (t.projectId) revalidatePath(`/portal/${org.slug}/projects/${t.projectId}`);
    return { ok: true };
  });
}

export async function portalAcknowledgeProposal(_p: ActionResult<unknown>, fd: FormData): Promise<ActionResult<unknown>> {
  return runAction(async () => {
    const parsed = z.object({ org: slug, proposalId: uuid, typedName: z.string().trim().min(3).max(120), confirm: z.literal('on') }).safeParse(Object.fromEntries(fd));
    if (!parsed.success) return { ok: false, error: 'Type your full name and tick the confirmation box.' };
    const { actor, org } = await requireOrgMember(parsed.data.org, 'proposals:acknowledge');
    const [p] = await getDb()
      .update(proposals)
      .set({ status: 'accepted', acceptedAt: new Date(), acceptedByName: `${parsed.data.typedName} (via client portal)`, acceptedByUserId: actor.user.id })
      .where(and(eq(proposals.id, parsed.data.proposalId), eq(proposals.orgId, org.id), eq(proposals.status, 'sent')))
      .returning({ id: proposals.id });
    if (!p) return { ok: false, error: 'This proposal cannot be accepted (it may already be accepted or have expired).' };
    await recordAudit({ actor: auditActor(actor), action: 'proposal.acknowledged_by_client', entityType: 'proposal', entityId: p.id, orgId: org.id });
    revalidatePath(`/portal/${org.slug}/proposals/${p.id}`);
    return { ok: true, message: 'Thank you — your acceptance has been recorded. Koral Digital will follow up with the services agreement and next steps.' };
  });
}

export async function portalInviteTeammate(_p: ActionResult<unknown>, fd: FormData): Promise<ActionResult<unknown>> {
  return runAction(async () => {
    const parsed = z
      .object({ org: slug, email: z.string().trim().toLowerCase().email(), name: z.string().trim().max(120).optional(), role: z.enum(['client_member', 'read_only']) })
      .safeParse(Object.fromEntries(fd));
    if (!parsed.success) return { ok: false, error: 'Enter a valid email and role.' };
    const { actor, org } = await requireOrgMember(parsed.data.org, 'team:manage');
    if (!CLIENT_ASSIGNABLE_ROLES.includes(parsed.data.role)) return { ok: false, error: 'You cannot assign that role.' };
    const inv = await createInvitation(actor, { email: parsed.data.email, orgId: org.id, memberRole: parsed.data.role, name: parsed.data.name });
    revalidatePath(`/portal/${org.slug}/team`);
    return {
      ok: true,
      message:
        inv.delivery === 'descope_email'
          ? `Invitation sent to ${parsed.data.email}.`
          : `Share this single-use link with ${parsed.data.email} (expires in 7 days, shown once): ${inv.link}`,
    };
  });
}

export async function portalRemoveTeammate(_p: ActionResult<unknown>, fd: FormData): Promise<ActionResult<unknown>> {
  return runAction(async () => {
    const parsed = z.object({ org: slug, membershipId: uuid }).safeParse(Object.fromEntries(fd));
    if (!parsed.success) return { ok: false, error: 'Invalid request.' };
    const { actor, org } = await requireOrgMember(parsed.data.org, 'team:manage');
    const db = getDb();
    const m = await db.query.memberships.findFirst({ where: and(eq(memberships.id, parsed.data.membershipId), eq(memberships.orgId, org.id)) });
    if (!m) return { ok: false, error: 'Not found.' };
    if (m.userId === actor.user.id) return { ok: false, error: 'You cannot remove yourself.' };
    if (m.role === 'client_owner') return { ok: false, error: 'Owners can only be removed by Koral Digital. Contact us.' };
    await db.delete(memberships).where(eq(memberships.id, m.id));
    await recordAudit({ actor: auditActor(actor), action: 'membership.removed_by_client_owner', entityType: 'membership', entityId: m.id, orgId: org.id, metadata: { userId: m.userId } });
    revalidatePath(`/portal/${org.slug}/team`);
    return { ok: true, message: 'Access removed.' };
  });
}
