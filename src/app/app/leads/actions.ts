'use server';

import { and, eq, isNull, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { getDb } from '@/db';
import {
  companies,
  contacts,
  discoveryAnswers,
  leadActivities,
  leads,
  leadSourceEnum,
  leadStageEnum,
  meetings,
  organizations,
  proposals,
  tasks,
  users,
} from '@/db/schema';
import { recordAudit } from '@/lib/audit';
import { auditActor, requireStaff, runAction, type ActionResult } from '@/lib/auth/guards';
import { parseBusinessDate } from '@/lib/dates';
import { DISCOVERY_QUESTIONS } from '@/lib/discovery';
import { domainFromEmail, normalizeCompanyName, slugify } from '@/lib/utils';


const uuid = z.string().uuid();
const opt = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => v || null);

function fail(error: z.ZodError): ActionResult<never> {
  return { ok: false, error: 'Please check the form.', fieldErrors: error.flatten().fieldErrors as Record<string, string[]> };
}

/* ---------------- Create a lead manually ---------------- */

const createSchema = z.object({
  companyName: z.string().trim().min(2).max(160),
  contactName: z.string().trim().min(2).max(120),
  email: z.string().trim().toLowerCase().email().max(200).optional().or(z.literal('').transform(() => undefined)),
  phone: opt(40),
  industry: opt(80),
  source: z.enum(leadSourceEnum.enumValues),
  topProblem: opt(200),
  notes: opt(4000),
});

export async function createLead(_p: ActionResult<unknown>, fd: FormData): Promise<ActionResult<unknown>> {
  return runAction(async () => {
    const actor = await requireStaff('leads:write');
    const parsed = createSchema.safeParse(Object.fromEntries(fd));
    if (!parsed.success) return fail(parsed.error);
    const d = parsed.data;
    const db = getDb();
    const leadId = await db.transaction(async (tx) => {
      const domain = d.email ? domainFromEmail(d.email) : null;
      const normalizedName = normalizeCompanyName(d.companyName) || d.companyName.toLowerCase();
      let company =
        (domain ? await tx.query.companies.findFirst({ where: and(eq(companies.domain, domain), isNull(companies.deletedAt)) }) : undefined) ??
        (await tx.query.companies.findFirst({ where: and(eq(companies.normalizedName, normalizedName), isNull(companies.deletedAt)) }));
      if (!company) {
        [company] = await tx
          .insert(companies)
          .values({ name: d.companyName, normalizedName, domain, website: domain ? `https://${domain}` : null, industry: d.industry })
          .returning();
      }
      let contact = d.email
        ? await tx.query.contacts.findFirst({ where: and(eq(contacts.email, d.email), isNull(contacts.deletedAt)) })
        : undefined;
      if (!contact) {
        [contact] = await tx
          .insert(contacts)
          .values({ companyId: company!.id, fullName: d.contactName, email: d.email ?? null, phone: d.phone, isPrimary: true })
          .returning();
      }
      const [lead] = await tx
        .insert(leads)
        .values({
          companyId: company!.id,
          contactId: contact!.id,
          title: `${d.companyName}${d.topProblem ? ` — ${d.topProblem}` : ''}`.slice(0, 200),
          source: d.source,
          industry: d.industry,
          topProblem: d.topProblem,
          message: d.notes,
          ownerId: actor.user.id,
          nextAction: 'First outreach',
        })
        .returning({ id: leads.id });
      await tx.insert(leadActivities).values({
        leadId: lead!.id,
        actorId: actor.user.id,
        type: 'system',
        body: `Lead created manually (source: ${d.source.replace('_', ' ')}).${d.notes ? `\n${d.notes}` : ''}`,
      });
      return lead!.id;
    });
    await recordAudit({ actor: auditActor(actor), action: 'lead.created', entityType: 'lead', entityId: leadId });
    revalidatePath('/app/leads');
    redirect(`/app/leads/${leadId}`);
  });
}

/* ---------------- Stage changes ---------------- */

export async function updateLeadStage(_p: ActionResult<unknown>, fd: FormData): Promise<ActionResult<unknown>> {
  return runAction(async () => {
    const actor = await requireStaff('leads:write');
    const parsed = z
      .object({ leadId: uuid, stage: z.enum(leadStageEnum.enumValues), lostReason: opt(300) })
      .safeParse(Object.fromEntries(fd));
    if (!parsed.success) return fail(parsed.error);
    const { leadId, stage, lostReason } = parsed.data;
    const db = getDb();
    const lead = await db.query.leads.findFirst({ where: and(eq(leads.id, leadId), isNull(leads.deletedAt)) });
    if (!lead) return { ok: false, error: 'Lead not found.' };
    if (lead.stage === stage) return { ok: true, message: 'No change.' };
    if (stage === 'lost' && !lostReason) return { ok: false, error: 'Please record why the lead was lost.' };
    await db
      .update(leads)
      .set({
        stage,
        lostReason: stage === 'lost' ? lostReason : lead.lostReason,
        wonAt: stage === 'won' ? new Date() : lead.wonAt,
        lostAt: stage === 'lost' ? new Date() : lead.lostAt,
      })
      .where(eq(leads.id, leadId));
    await db.insert(leadActivities).values({
      leadId,
      actorId: actor.user.id,
      type: 'stage_change',
      body: `Stage changed from ${lead.stage} to ${stage}${stage === 'lost' && lostReason ? ` — ${lostReason}` : ''}.`,
      metadata: { from: lead.stage, to: stage },
    });
    await recordAudit({
      actor: auditActor(actor),
      action: 'lead.stage_changed',
      entityType: 'lead',
      entityId: leadId,
      metadata: { from: lead.stage, to: stage },
    });
    revalidatePath(`/app/leads/${leadId}`);
    revalidatePath('/app');
    return { ok: true, message: `Moved to ${stage}.` };
  });
}

/* ---------------- Details: owner, next action, value ---------------- */

export async function updateLeadDetails(_p: ActionResult<unknown>, fd: FormData): Promise<ActionResult<unknown>> {
  return runAction(async () => {
    const actor = await requireStaff('leads:write');
    const parsed = z
      .object({
        leadId: uuid,
        title: z.string().trim().min(2).max(200),
        ownerId: z.union([uuid, z.literal('')]),
        nextAction: opt(200),
        nextActionDueAt: opt(20),
        estimatedValue: z.string().trim().regex(/^\d{0,7}(\.\d{0,2})?$/, 'Enter a dollar amount').optional(),
        industry: opt(80),
        source: z.enum(leadSourceEnum.enumValues),
      })
      .safeParse(Object.fromEntries(fd));
    if (!parsed.success) return fail(parsed.error);
    const d = parsed.data;
    const db = getDb();
    if (d.ownerId) {
      const owner = await db.query.users.findFirst({ where: and(eq(users.id, d.ownerId), sql`${users.staffRole} is not null`) });
      if (!owner) return { ok: false, error: 'Owner must be a Koral staff member.' };
    }
    const updated = await db
      .update(leads)
      .set({
        title: d.title,
        ownerId: d.ownerId || null,
        nextAction: d.nextAction,
        nextActionDueAt: parseBusinessDate(d.nextActionDueAt),
        estimatedValueCents: d.estimatedValue ? Math.round(Number(d.estimatedValue) * 100) : null,
        industry: d.industry,
        source: d.source,
      })
      .where(and(eq(leads.id, d.leadId), isNull(leads.deletedAt)))
      .returning({ id: leads.id });
    if (!updated.length) return { ok: false, error: 'Lead not found.' };
    await recordAudit({
      actor: auditActor(actor),
      action: 'lead.updated',
      entityType: 'lead',
      entityId: d.leadId,
      metadata: { fields: ['title', 'owner', 'nextAction', 'value', 'industry', 'source'] },
    });
    revalidatePath(`/app/leads/${d.leadId}`);
    return { ok: true, message: 'Saved.' };
  });
}

/* ---------------- Activities ---------------- */

export async function addActivity(_p: ActionResult<unknown>, fd: FormData): Promise<ActionResult<unknown>> {
  return runAction(async () => {
    const actor = await requireStaff('leads:write');
    const parsed = z
      .object({ leadId: uuid, type: z.enum(['note', 'call', 'email', 'meeting']), body: z.string().trim().min(1).max(8000) })
      .safeParse(Object.fromEntries(fd));
    if (!parsed.success) return fail(parsed.error);
    const db = getDb();
    const lead = await db.query.leads.findFirst({ where: and(eq(leads.id, parsed.data.leadId), isNull(leads.deletedAt)) });
    if (!lead) return { ok: false, error: 'Lead not found.' };
    await db.insert(leadActivities).values({ ...parsed.data, actorId: actor.user.id });
    if (lead.stage === 'new' && parsed.data.type !== 'note') {
      await db.update(leads).set({ stage: 'contacted' }).where(eq(leads.id, lead.id));
      await db.insert(leadActivities).values({
        leadId: lead.id,
        actorId: actor.user.id,
        type: 'stage_change',
        body: 'Stage changed from new to contacted (first logged outreach).',
        metadata: { from: 'new', to: 'contacted' },
      });
    }
    revalidatePath(`/app/leads/${parsed.data.leadId}`);
    return { ok: true, message: 'Activity logged.' };
  });
}

/* ---------------- Discovery checklist ---------------- */

export async function saveDiscovery(_p: ActionResult<unknown>, fd: FormData): Promise<ActionResult<unknown>> {
  return runAction(async () => {
    const actor = await requireStaff('leads:write');
    const leadId = uuid.parse(fd.get('leadId'));
    const db = getDb();
    const lead = await db.query.leads.findFirst({ where: and(eq(leads.id, leadId), isNull(leads.deletedAt)) });
    if (!lead) return { ok: false, error: 'Lead not found.' };
    let saved = 0;
    for (const q of DISCOVERY_QUESTIONS) {
      const v = fd.get(`q_${q.key}`);
      if (typeof v !== 'string') continue;
      const answer = v.trim().slice(0, 4000);
      await db
        .insert(discoveryAnswers)
        .values({ leadId, questionKey: q.key, answer, updatedById: actor.user.id })
        .onConflictDoUpdate({
          target: [discoveryAnswers.leadId, discoveryAnswers.questionKey],
          set: { answer, updatedById: actor.user.id, updatedAt: new Date() },
        });
      if (answer) saved++;
    }
    await recordAudit({ actor: auditActor(actor), action: 'lead.discovery_saved', entityType: 'lead', entityId: leadId, metadata: { answered: saved } });
    revalidatePath(`/app/leads/${leadId}`);
    return { ok: true, message: `Discovery saved (${saved}/${DISCOVERY_QUESTIONS.length} answered).` };
  });
}

/* ---------------- Meetings (consultation bookings) ---------------- */

export async function scheduleMeeting(_p: ActionResult<unknown>, fd: FormData): Promise<ActionResult<unknown>> {
  return runAction(async () => {
    const actor = await requireStaff('leads:write');
    const parsed = z
      .object({
        leadId: uuid,
        title: z.string().trim().min(2).max(200),
        scheduledAt: z.string().min(10),
        durationMinutes: z.coerce.number().int().min(10).max(480),
        location: opt(300),
      })
      .safeParse(Object.fromEntries(fd));
    if (!parsed.success) return fail(parsed.error);
    const when = parseBusinessDate(parsed.data.scheduledAt);
    if (!when) return { ok: false, error: 'Enter a valid date and time.' };
    const db = getDb();
    await db.insert(meetings).values({
      leadId: parsed.data.leadId,
      title: parsed.data.title,
      scheduledAt: when,
      durationMinutes: parsed.data.durationMinutes,
      location: parsed.data.location,
      createdById: actor.user.id,
    });
    await db.insert(leadActivities).values({
      leadId: parsed.data.leadId,
      actorId: actor.user.id,
      type: 'meeting',
      body: `Scheduled: ${parsed.data.title}`,
      metadata: { scheduledAt: when.toISOString() },
    });
    revalidatePath(`/app/leads/${parsed.data.leadId}`);
    return { ok: true, message: 'Meeting recorded.' };
  });
}

export async function updateMeetingStatus(_p: ActionResult<unknown>, fd: FormData): Promise<ActionResult<unknown>> {
  return runAction(async () => {
    await requireStaff('leads:write');
    const parsed = z
      .object({ meetingId: uuid, status: z.enum(['scheduled', 'completed', 'cancelled', 'no_show']), notes: opt(4000) })
      .safeParse(Object.fromEntries(fd));
    if (!parsed.success) return fail(parsed.error);
    const [m] = await getDb()
      .update(meetings)
      .set({ status: parsed.data.status, ...(parsed.data.notes ? { notes: parsed.data.notes } : {}) })
      .where(eq(meetings.id, parsed.data.meetingId))
      .returning({ leadId: meetings.leadId });
    if (m?.leadId) revalidatePath(`/app/leads/${m.leadId}`);
    return { ok: true, message: 'Meeting updated.' };
  });
}

/* ---------------- Tasks ---------------- */

export async function addLeadTask(_p: ActionResult<unknown>, fd: FormData): Promise<ActionResult<unknown>> {
  return runAction(async () => {
    const actor = await requireStaff('tasks:write');
    const parsed = z
      .object({
        leadId: uuid,
        title: z.string().trim().min(2).max(200),
        dueAt: opt(20),
        priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
        assigneeId: z.union([uuid, z.literal('')]).optional(),
      })
      .safeParse(Object.fromEntries(fd));
    if (!parsed.success) return fail(parsed.error);
    await getDb()
      .insert(tasks)
      .values({
        leadId: parsed.data.leadId,
        title: parsed.data.title,
        dueAt: parseBusinessDate(parsed.data.dueAt),
        priority: parsed.data.priority,
        assigneeId: parsed.data.assigneeId || actor.user.id,
        createdById: actor.user.id,
      });
    revalidatePath(`/app/leads/${parsed.data.leadId}`);
    revalidatePath('/app/tasks');
    return { ok: true, message: 'Task added.' };
  });
}

/* ---------------- Convert to client ---------------- */

export async function convertLeadToClient(_p: ActionResult<unknown>, fd: FormData): Promise<ActionResult<unknown>> {
  return runAction(async () => {
    const actor = await requireStaff('clients:convert');
    const parsed = z
      .object({ leadId: uuid, orgName: z.string().trim().min(2).max(160), servicePackage: opt(160) })
      .safeParse(Object.fromEntries(fd));
    if (!parsed.success) return fail(parsed.error);
    const db = getDb();
    const lead = await db.query.leads.findFirst({ where: and(eq(leads.id, parsed.data.leadId), isNull(leads.deletedAt)) });
    if (!lead) return { ok: false, error: 'Lead not found.' };
    if (lead.convertedOrgId) redirect(`/app/clients/${lead.convertedOrgId}`);

    const orgId = await db.transaction(async (tx) => {
      const baseSlug = slugify(parsed.data.orgName) || 'client';
      let slug = baseSlug;
      for (let i = 2; await tx.query.organizations.findFirst({ where: eq(organizations.slug, slug) }); i++) slug = `${baseSlug}-${i}`;
      const [org] = await tx
        .insert(organizations)
        .values({
          name: parsed.data.orgName,
          slug,
          status: 'onboarding',
          companyId: lead.companyId,
          leadId: lead.id,
          servicePackage: parsed.data.servicePackage,
          isDemo: lead.isDemo,
        })
        .returning({ id: organizations.id });
      await tx
        .update(leads)
        .set({ convertedOrgId: org!.id, stage: 'won', wonAt: lead.wonAt ?? new Date() })
        .where(eq(leads.id, lead.id));
      // Make this lead's sent/accepted proposals visible to the new client workspace.
      await tx
        .update(proposals)
        .set({ orgId: org!.id })
        .where(and(eq(proposals.leadId, lead.id), sql`${proposals.status} in ('sent','accepted')`));
      await tx.insert(leadActivities).values({
        leadId: lead.id,
        actorId: actor.user.id,
        type: 'stage_change',
        body: `Converted to client workspace “${parsed.data.orgName}”.`,
        metadata: { from: lead.stage, to: 'won', orgId: org!.id },
      });
      return org!.id;
    });
    await recordAudit({
      actor: auditActor(actor),
      action: 'lead.converted',
      entityType: 'organization',
      entityId: orgId,
      orgId,
      metadata: { leadId: lead.id },
    });
    revalidatePath('/app/clients');
    redirect(`/app/clients/${orgId}`);
  });
}

/* ---------------- Archive (soft delete) ---------------- */

export async function archiveLead(_p: ActionResult<unknown>, fd: FormData): Promise<ActionResult<unknown>> {
  return runAction(async () => {
    const actor = await requireStaff('settings:write');
    const leadId = uuid.parse(fd.get('leadId'));
    await getDb().update(leads).set({ deletedAt: new Date() }).where(eq(leads.id, leadId));
    await recordAudit({ actor: auditActor(actor), action: 'lead.archived', entityType: 'lead', entityId: leadId });
    revalidatePath('/app/leads');
    redirect('/app/leads');
  });
}


