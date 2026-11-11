'use server';

import { and, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { getDb } from '@/db';
import {
  clientUpdates,
  files,
  integrationStatusEnum,
  integrations,
  invitations,
  invoiceStatusEnum,
  invoices,
  memberRoleEnum,
  memberships,
  orgStatusEnum,
  organizations,
  projectMilestones,
  projects,
  proposals,
  tasks,
  users,
} from '@/db/schema';
import { recordAudit } from '@/lib/audit';
import { auditActor, requireStaff, runAction, type ActionResult } from '@/lib/auth/guards';
import { parseBusinessDate } from '@/lib/dates';
import { PROJECT_TEMPLATES, type ProjectTemplateKey } from '@/lib/project-templates';
import { deleteObject } from '@/lib/storage';
import { setTenantRole } from '@/lib/auth/descope';
import { setMemberRole } from '@/server/access';
import { createInvitation } from '@/server/invitations';
import { nextInvoiceNumber } from '@/server/clients';
import { storeOrgFile } from '@/server/files';

const uuid = z.string().uuid();
const money = z
  .string()
  .trim()
  .regex(/^\d{1,7}(\.\d{0,2})?$/, 'Enter a dollar amount')
  .transform((v) => Math.round(Number(v) * 100));
const fe = (e: z.ZodError) => ({
  ok: false as const,
  error: 'Please check the form.',
  fieldErrors: e.flatten().fieldErrors as Record<string, string[]>,
});

async function orgExists(orgId: string) {
  return getDb().query.organizations.findFirst({ where: eq(organizations.id, orgId) });
}

export async function updateClient(_p: ActionResult<unknown>, fd: FormData): Promise<ActionResult<unknown>> {
  return runAction(async () => {
    const actor = await requireStaff('clients:write');
    const parsed = z
      .object({
        orgId: uuid,
        name: z.string().trim().min(2).max(160),
        status: z.enum(orgStatusEnum.enumValues),
        servicePackage: z.string().trim().max(200).optional(),
        notes: z.string().trim().max(8000).optional(),
      })
      .safeParse(Object.fromEntries(fd));
    if (!parsed.success) return fe(parsed.error);
    const d = parsed.data;
    const before = await orgExists(d.orgId);
    if (!before) return { ok: false, error: 'Client not found.' };
    await getDb()
      .update(organizations)
      .set({
        name: d.name,
        status: d.status,
        servicePackage: d.servicePackage || null,
        notes: d.notes || null,
      })
      .where(eq(organizations.id, d.orgId));
    await recordAudit({
      actor: auditActor(actor),
      action: 'client.updated',
      entityType: 'organization',
      entityId: d.orgId,
      orgId: d.orgId,
      metadata: { statusFrom: before.status, statusTo: d.status },
    });
    revalidatePath(`/app/clients/${d.orgId}`);
    return { ok: true, message: 'Client saved.' };
  });
}

/* ---------- Members & invitations ---------- */

export async function inviteClientMember(
  _p: ActionResult<unknown>,
  fd: FormData,
): Promise<ActionResult<{ link: string }>> {
  return runAction(async () => {
    const actor = await requireStaff('members:manage');
    const parsed = z
      .object({
        orgId: uuid,
        email: z.string().trim().toLowerCase().email(),
        name: z.string().trim().max(120).optional(),
        role: z.enum(memberRoleEnum.enumValues),
      })
      .safeParse(Object.fromEntries(fd));
    if (!parsed.success) return fe(parsed.error);
    const org = await orgExists(parsed.data.orgId);
    if (!org) return { ok: false, error: 'Client not found.' };
    const inv = await createInvitation(actor, {
      email: parsed.data.email,
      orgId: org.id,
      memberRole: parsed.data.role,
      name: parsed.data.name,
    });
    if (!inv.ok) return inv;
    revalidatePath(`/app/clients/${org.id}`);
    return {
      ok: true,
      data: { link: inv.link },
      message:
        inv.delivery === 'descope_email'
          ? `Invitation emailed by Descope to ${parsed.data.email}. Backup link (single use, expires in 7 days): ${inv.link}`
          : `${inv.deliveryNote ? `${inv.deliveryNote} ` : ''}Send this single-use link to ${parsed.data.email} yourself — it expires in 7 days and is shown only once: ${inv.link}`,
    };
  });
}

export async function revokeInvitation(
  _p: ActionResult<unknown>,
  fd: FormData,
): Promise<ActionResult<unknown>> {
  return runAction(async () => {
    const actor = await requireStaff('members:manage');
    const parsed = z.object({ orgId: uuid, invitationId: uuid }).safeParse(Object.fromEntries(fd));
    if (!parsed.success) return fe(parsed.error);
    const db = getDb();
    const [revoked] = await db
      .update(invitations)
      .set({ status: 'revoked' })
      .where(
        and(
          eq(invitations.id, parsed.data.invitationId),
          eq(invitations.orgId, parsed.data.orgId),
          eq(invitations.status, 'pending'),
        ),
      )
      .returning();
    // The invitation granted the role in Descope when it was sent; take it back.
    const org = revoked?.descopeUserId ? await orgExists(parsed.data.orgId) : null;
    if (revoked?.descopeUserId && org?.descopeTenantId) {
      const removed = await setTenantRole(revoked.descopeUserId, org.descopeTenantId, null);
      if (!removed.ok) return { ok: false, error: `Invitation revoked, but Descope: ${removed.reason}` };
    }
    await recordAudit({
      actor: auditActor(actor),
      action: 'invitation.revoked',
      entityType: 'invitation',
      entityId: parsed.data.invitationId,
      orgId: parsed.data.orgId,
    });
    revalidatePath(`/app/clients/${parsed.data.orgId}`);
    return { ok: true, message: 'Invitation revoked.' };
  });
}

export async function changeMemberRole(
  _p: ActionResult<unknown>,
  fd: FormData,
): Promise<ActionResult<unknown>> {
  return runAction(async () => {
    const actor = await requireStaff('members:manage');
    const parsed = z
      .object({
        orgId: uuid,
        membershipId: uuid,
        role: z.union([z.enum(memberRoleEnum.enumValues), z.literal('remove')]),
      })
      .safeParse(Object.fromEntries(fd));
    if (!parsed.success) return fe(parsed.error);
    const { orgId, membershipId, role } = parsed.data;
    const db = getDb();
    const m = await db.query.memberships.findFirst({
      where: and(eq(memberships.id, membershipId), eq(memberships.orgId, orgId)),
    });
    if (!m) return { ok: false, error: 'Member not found.' };
    const [org, target] = await Promise.all([
      orgExists(orgId),
      db.query.users.findFirst({ where: eq(users.id, m.userId) }),
    ]);
    if (!org || !target) return { ok: false, error: 'Member not found.' };
    const changed = await setMemberRole(org, target, role === 'remove' ? null : role);
    if (!changed.ok) return { ok: false, error: `Descope: ${changed.reason}` };
    await recordAudit({
      actor: auditActor(actor),
      action: role === 'remove' ? 'membership.removed' : 'membership.role_changed',
      entityType: 'membership',
      entityId: m.id,
      orgId,
      metadata: { userId: m.userId, from: m.role, to: role },
    });
    revalidatePath(`/app/clients/${orgId}`);
    return { ok: true, message: role === 'remove' ? 'Member removed.' : 'Role updated.' };
  });
}

/* ---------- Projects ---------- */

export async function createProject(_p: ActionResult<unknown>, fd: FormData): Promise<ActionResult<unknown>> {
  return runAction(async () => {
    const actor = await requireStaff('projects:write');
    const parsed = z
      .object({
        orgId: uuid,
        name: z.string().trim().min(2).max(200),
        template: z.enum(Object.keys(PROJECT_TEMPLATES) as [ProjectTemplateKey, ...ProjectTemplateKey[]]),
        startDate: z.string().optional(),
        proposalId: z.union([uuid, z.literal('')]).optional(),
      })
      .safeParse(Object.fromEntries(fd));
    if (!parsed.success) return fe(parsed.error);
    const d = parsed.data;
    const db = getDb();
    const org = await orgExists(d.orgId);
    if (!org) return { ok: false, error: 'Client not found.' };
    if (d.proposalId) {
      const prop = await db.query.proposals.findFirst({
        where: and(eq(proposals.id, d.proposalId), eq(proposals.orgId, d.orgId)),
      });
      if (!prop) return { ok: false, error: 'That proposal does not belong to this client.' };
    }
    const tpl = PROJECT_TEMPLATES[d.template];
    const start = parseBusinessDate(d.startDate) ?? new Date();
    const day = (n: number) => new Date(start.getTime() + n * 86_400_000);
    const projectId = await db.transaction(async (tx) => {
      const lastOffset = tpl.milestones.at(-1)?.offsetDays;
      const [p] = await tx
        .insert(projects)
        .values({
          orgId: d.orgId,
          name: d.name,
          description: tpl.name,
          status: 'planning',
          ownerId: actor.user.id,
          startDate: start,
          targetDate: lastOffset ? day(lastOffset) : null,
          proposalId: d.proposalId || null,
        })
        .returning({ id: projects.id });
      if (tpl.milestones.length) {
        await tx.insert(projectMilestones).values(
          tpl.milestones.map((m, i) => ({
            orgId: d.orgId,
            projectId: p!.id,
            title: m.title,
            description: m.description,
            dueDate: day(m.offsetDays),
            sortOrder: i,
          })),
        );
      }
      if (tpl.tasks.length) {
        await tx.insert(tasks).values(
          tpl.tasks.map((t) => ({
            orgId: d.orgId,
            projectId: p!.id,
            title: t.title,
            description: t.description,
            clientVisible: t.clientVisible,
            dueAt: day(t.offsetDays),
            createdById: actor.user.id,
            assigneeId: t.clientVisible ? null : actor.user.id,
          })),
        );
      }
      return p!.id;
    });
    await recordAudit({
      actor: auditActor(actor),
      action: 'project.created',
      entityType: 'project',
      entityId: projectId,
      orgId: d.orgId,
      metadata: { template: d.template },
    });
    redirect(`/app/projects/${projectId}`);
  });
}

/* ---------- Invoices (status tracking; payments via hosted link or manual record) ---------- */

export async function createInvoice(_p: ActionResult<unknown>, fd: FormData): Promise<ActionResult<unknown>> {
  return runAction(async () => {
    const actor = await requireStaff('invoices:write');
    const parsed = z
      .object({
        orgId: uuid,
        description: z.string().trim().min(2).max(300),
        amount: money,
        dueDate: z.string().optional(),
        paymentUrl: z.union([z.string().trim().url().startsWith('https://'), z.literal('')]).optional(),
        proposalId: z.union([uuid, z.literal('')]).optional(),
      })
      .safeParse(Object.fromEntries(fd));
    if (!parsed.success) return fe(parsed.error);
    const d = parsed.data;
    const db = getDb();
    if (!(await orgExists(d.orgId))) return { ok: false, error: 'Client not found.' };
    if (d.proposalId) {
      const prop = await db.query.proposals.findFirst({
        where: and(eq(proposals.id, d.proposalId), eq(proposals.orgId, d.orgId)),
      });
      if (!prop) return { ok: false, error: 'That proposal does not belong to this client.' };
    }
    const id = await db.transaction(async (tx) => {
      const number = await nextInvoiceNumber(tx);
      const [inv] = await tx
        .insert(invoices)
        .values({
          orgId: d.orgId,
          number,
          description: d.description,
          amountCents: d.amount,
          dueDate: parseBusinessDate(d.dueDate),
          paymentUrl: d.paymentUrl || null,
          proposalId: d.proposalId || null,
        })
        .returning({ id: invoices.id });
      return inv!.id;
    });
    await recordAudit({
      actor: auditActor(actor),
      action: 'invoice.created',
      entityType: 'invoice',
      entityId: id,
      orgId: d.orgId,
      metadata: { amountCents: d.amount },
    });
    revalidatePath(`/app/clients/${d.orgId}`);
    return { ok: true, message: 'Invoice record created as draft.' };
  });
}

export async function updateInvoice(_p: ActionResult<unknown>, fd: FormData): Promise<ActionResult<unknown>> {
  return runAction(async () => {
    const actor = await requireStaff('invoices:write');
    const parsed = z
      .object({
        orgId: uuid,
        invoiceId: uuid,
        status: z.enum(invoiceStatusEnum.enumValues),
        paymentUrl: z.union([z.string().trim().url().startsWith('https://'), z.literal('')]).optional(),
        paymentNote: z.string().trim().max(300).optional(),
      })
      .safeParse(Object.fromEntries(fd));
    if (!parsed.success) return fe(parsed.error);
    const d = parsed.data;
    const db = getDb();
    const inv = await db.query.invoices.findFirst({
      where: and(eq(invoices.id, d.invoiceId), eq(invoices.orgId, d.orgId)),
    });
    if (!inv) return { ok: false, error: 'Invoice not found.' };
    if ((d.status === 'paid' || d.status === 'partially_paid') && !d.paymentNote && !inv.paymentNote) {
      return {
        ok: false,
        error: 'Add a payment note describing how the payment was received (recorded manually).',
      };
    }
    await db
      .update(invoices)
      .set({
        status: d.status,
        paymentUrl: d.paymentUrl === undefined ? inv.paymentUrl : d.paymentUrl || null,
        paymentNote: d.paymentNote || inv.paymentNote,
        issuedAt: d.status === 'sent' && !inv.issuedAt ? new Date() : inv.issuedAt,
        paidAt: d.status === 'paid' ? (inv.paidAt ?? new Date()) : inv.paidAt,
      })
      .where(eq(invoices.id, inv.id));
    await recordAudit({
      actor: auditActor(actor),
      action: 'invoice.status_changed',
      entityType: 'invoice',
      entityId: inv.id,
      orgId: d.orgId,
      metadata: { from: inv.status, to: d.status },
    });
    revalidatePath(`/app/clients/${d.orgId}`);
    return { ok: true, message: 'Invoice updated.' };
  });
}

/* ---------- Integrations metadata (never credentials) ---------- */

export async function saveIntegration(
  _p: ActionResult<unknown>,
  fd: FormData,
): Promise<ActionResult<unknown>> {
  return runAction(async () => {
    const actor = await requireStaff('clients:write');
    const parsed = z
      .object({
        orgId: uuid,
        integrationId: z.union([uuid, z.literal('')]).optional(),
        tool: z.string().trim().min(2).max(80),
        category: z.enum([
          'crm',
          'phone',
          'calendar',
          'forms',
          'ads',
          'email',
          'accounting',
          'automation',
          'other',
        ]),
        status: z.enum(integrationStatusEnum.enumValues),
        notes: z.string().trim().max(1000).optional(),
      })
      .safeParse(Object.fromEntries(fd));
    if (!parsed.success) return fe(parsed.error);
    const d = parsed.data;
    if (/(api[_-]?key|secret|password|token)\s*[:=]/i.test(d.notes ?? '')) {
      return {
        ok: false,
        error: 'Do not store credentials here. Keep secrets in the client’s own vault or a password manager.',
      };
    }
    const db = getDb();
    if (!(await orgExists(d.orgId))) return { ok: false, error: 'Client not found.' };
    if (d.integrationId) {
      await db
        .update(integrations)
        .set({ tool: d.tool, category: d.category, status: d.status, notes: d.notes ?? '' })
        .where(and(eq(integrations.id, d.integrationId), eq(integrations.orgId, d.orgId)));
    } else {
      await db.insert(integrations).values({
        orgId: d.orgId,
        tool: d.tool,
        category: d.category,
        status: d.status,
        notes: d.notes ?? '',
      });
    }
    await recordAudit({
      actor: auditActor(actor),
      action: 'integration.saved',
      entityType: 'integration',
      orgId: d.orgId,
      metadata: { tool: d.tool, status: d.status },
    });
    revalidatePath(`/app/clients/${d.orgId}`);
    return { ok: true, message: 'Integration saved.' };
  });
}

/* ---------- Client updates ---------- */

export async function postClientUpdate(
  _p: ActionResult<unknown>,
  fd: FormData,
): Promise<ActionResult<unknown>> {
  return runAction(async () => {
    const actor = await requireStaff('projects:write');
    const parsed = z
      .object({
        orgId: uuid,
        projectId: z.union([uuid, z.literal('')]).optional(),
        kind: z.enum(['update', 'meeting_notes', 'access_request']),
        title: z.string().trim().min(2).max(200),
        body: z.string().trim().min(2).max(10000),
        clientVisible: z.string().optional(),
      })
      .safeParse(Object.fromEntries(fd));
    if (!parsed.success) return fe(parsed.error);
    const d = parsed.data;
    const db = getDb();
    if (!(await orgExists(d.orgId))) return { ok: false, error: 'Client not found.' };
    if (d.projectId) {
      const p = await db.query.projects.findFirst({
        where: and(eq(projects.id, d.projectId), eq(projects.orgId, d.orgId)),
      });
      if (!p) return { ok: false, error: 'Project not found for this client.' };
    }
    const [u] = await db
      .insert(clientUpdates)
      .values({
        orgId: d.orgId,
        projectId: d.projectId || null,
        kind: d.kind,
        title: d.title,
        body: d.body,
        clientVisible: d.clientVisible === 'on',
        authorId: actor.user.id,
      })
      .returning({ id: clientUpdates.id });
    await recordAudit({
      actor: auditActor(actor),
      action: 'client_update.posted',
      entityType: 'client_update',
      entityId: u!.id,
      orgId: d.orgId,
      metadata: { clientVisible: d.clientVisible === 'on' },
    });
    revalidatePath(`/app/clients/${d.orgId}`);
    if (d.projectId) revalidatePath(`/app/projects/${d.projectId}`);
    return {
      ok: true,
      message: d.clientVisible === 'on' ? 'Update published to the client portal.' : 'Internal update saved.',
    };
  });
}

/* ---------- Files ---------- */

export async function uploadClientFile(
  _p: ActionResult<unknown>,
  fd: FormData,
): Promise<ActionResult<unknown>> {
  return runAction(async () => {
    const actor = await requireStaff('files:write');
    const parsed = z
      .object({
        orgId: uuid,
        projectId: z.union([uuid, z.literal('')]).optional(),
        visibility: z.enum(['internal', 'client']),
      })
      .safeParse({
        orgId: fd.get('orgId'),
        projectId: fd.get('projectId') ?? undefined,
        visibility: fd.get('visibility'),
      });
    if (!parsed.success) return fe(parsed.error);
    if (!(await orgExists(parsed.data.orgId))) return { ok: false, error: 'Client not found.' };
    const file = fd.get('file');
    if (!(file instanceof File)) return { ok: false, error: 'Choose a file to upload.' };
    const res = await storeOrgFile(actor, parsed.data.orgId, file, {
      visibility: parsed.data.visibility,
      projectId: parsed.data.projectId || null,
    });
    if (!res.ok) return { ok: false, error: res.error };
    revalidatePath(`/app/clients/${parsed.data.orgId}`);
    if (parsed.data.projectId) revalidatePath(`/app/projects/${parsed.data.projectId}`);
    return { ok: true, message: 'File uploaded.' };
  });
}

export async function deleteClientFile(
  _p: ActionResult<unknown>,
  fd: FormData,
): Promise<ActionResult<unknown>> {
  return runAction(async () => {
    const actor = await requireStaff('files:write');
    const parsed = z.object({ orgId: uuid, fileId: uuid }).safeParse(Object.fromEntries(fd));
    if (!parsed.success) return fe(parsed.error);
    const db = getDb();
    const f = await db.query.files.findFirst({
      where: and(eq(files.id, parsed.data.fileId), eq(files.orgId, parsed.data.orgId)),
    });
    if (!f) return { ok: false, error: 'File not found.' };
    await db.update(files).set({ deletedAt: new Date() }).where(eq(files.id, f.id));
    await deleteObject(f.storageDriver, f.storageKey);
    await recordAudit({
      actor: auditActor(actor),
      action: 'file.deleted',
      entityType: 'file',
      entityId: f.id,
      orgId: f.orgId,
    });
    revalidatePath(`/app/clients/${parsed.data.orgId}`);
    return { ok: true, message: 'File deleted.' };
  });
}
