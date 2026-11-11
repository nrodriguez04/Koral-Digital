'use server';

import { and, eq, inArray } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { services } from '@/content/services';
import { getDb } from '@/db';
import { leadActivities, leads, proposalItems, proposals } from '@/db/schema';
import { recordAudit } from '@/lib/audit';
import { auditActor, requireStaff, runAction, type ActionResult } from '@/lib/auth/guards';
import { parseBusinessDate } from '@/lib/dates';
import { getSiteSettings } from '@/lib/settings';
import { nextProposalNumber } from '@/server/proposals';

const uuid = z.string().uuid();
const money = z
  .string()
  .trim()
  .regex(/^\d{0,7}(\.\d{0,2})?$/, 'Enter a dollar amount')
  .transform((v) => (v ? Math.round(Number(v) * 100) : 0));

async function editableProposal(id: string) {
  const p = await getDb().query.proposals.findFirst({ where: eq(proposals.id, id) });
  if (!p) return { error: 'Proposal not found.' as const };
  if (p.status !== 'draft')
    return { error: 'Only draft proposals can be edited. Duplicate it to make changes.' as const };
  return { p };
}

export async function createProposal(
  _p: ActionResult<unknown>,
  fd: FormData,
): Promise<ActionResult<unknown>> {
  return runAction(async () => {
    const actor = await requireStaff('proposals:write');
    const parsed = z
      .object({ leadId: uuid, template: z.enum(['pilot', 'blank']) })
      .safeParse(Object.fromEntries(fd));
    if (!parsed.success) return { ok: false, error: 'Invalid request.' };
    const db = getDb();
    const lead = await db.query.leads.findFirst({ where: eq(leads.id, parsed.data.leadId) });
    if (!lead) return { ok: false, error: 'Lead not found.' };
    const s = await getSiteSettings();
    const pilot = services.find((x) => x.slug === 'lead-to-booked')!;
    const isPilot = parsed.data.template === 'pilot';
    const id = await db.transaction(async (tx) => {
      const number = await nextProposalNumber(tx);
      const [p] = await tx
        .insert(proposals)
        .values({
          number,
          leadId: lead.id,
          orgId: lead.convertedOrgId,
          title: isPilot ? 'Lead-to-Booked Pilot' : 'Proposal',
          summary: isPilot ? pilot.summary : '',
          scope: isPilot ? pilot.included.map((i) => `- ${i.title}: ${i.body}`).join('\n') : '',
          deliverables: isPilot ? pilot.outcomes.map((o) => `- ${o}`).join('\n') : '',
          assumptions: isPilot
            ? '- Client grants required system access within 2 business days of kickoff.\n- Scope covers up to two inbound lead sources.\n- Third-party tool subscriptions are paid by the client.\n- Outbound customer messages are approved by client staff before sending.'
            : '',
          timeline: isPilot ? '14 days from the date all required access is in place.' : '',
          depositPercent: 50,
          retainerMonthlyCents: isPilot ? s.pricing.supportFrom * 100 : null,
          retainerDescription: isPilot
            ? 'Optional managed support: monitoring, fixes and monthly optimization review.'
            : null,
          validUntil: new Date(Date.now() + 30 * 86_400_000),
          createdById: actor.user.id,
          isDemo: lead.isDemo,
        })
        .returning({ id: proposals.id });
      if (isPilot) {
        await tx.insert(proposalItems).values({
          proposalId: p!.id,
          description: 'Lead-to-Booked pilot — fixed scope (14 days)',
          quantity: 1,
          unitPriceCents: s.pricing.pilotFrom * 100,
          sortOrder: 0,
        });
      }
      await tx.insert(leadActivities).values({
        leadId: lead.id,
        actorId: actor.user.id,
        type: 'system',
        body: `Draft proposal ${number} created.`,
      });
      return p!.id;
    });
    await recordAudit({
      actor: auditActor(actor),
      action: 'proposal.created',
      entityType: 'proposal',
      entityId: id,
      metadata: { leadId: lead.id },
    });
    redirect(`/app/proposals/${id}`);
  });
}

export async function updateProposal(
  _p: ActionResult<unknown>,
  fd: FormData,
): Promise<ActionResult<unknown>> {
  return runAction(async () => {
    const actor = await requireStaff('proposals:write');
    const parsed = z
      .object({
        proposalId: uuid,
        title: z.string().trim().min(2).max(200),
        summary: z.string().max(6000),
        scope: z.string().max(12000),
        deliverables: z.string().max(12000),
        assumptions: z.string().max(8000),
        timeline: z.string().max(2000),
        depositPercent: z.coerce.number().int().min(0).max(100),
        retainerMonthly: money,
        retainerDescription: z.string().max(1000),
        validUntil: z.string().optional(),
      })
      .safeParse(Object.fromEntries(fd));
    if (!parsed.success)
      return {
        ok: false,
        error: 'Please check the proposal fields.',
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    const d = parsed.data;
    const check = await editableProposal(d.proposalId);
    if ('error' in check) return { ok: false, error: check.error! };
    await getDb()
      .update(proposals)
      .set({
        title: d.title,
        summary: d.summary,
        scope: d.scope,
        deliverables: d.deliverables,
        assumptions: d.assumptions,
        timeline: d.timeline,
        depositPercent: d.depositPercent,
        retainerMonthlyCents: d.retainerMonthly || null,
        retainerDescription: d.retainerDescription || null,
        validUntil: parseBusinessDate(d.validUntil),
      })
      .where(eq(proposals.id, d.proposalId));
    await recordAudit({
      actor: auditActor(actor),
      action: 'proposal.updated',
      entityType: 'proposal',
      entityId: d.proposalId,
    });
    revalidatePath(`/app/proposals/${d.proposalId}`);
    return { ok: true, message: 'Proposal saved.' };
  });
}

export async function addProposalItem(
  _p: ActionResult<unknown>,
  fd: FormData,
): Promise<ActionResult<unknown>> {
  return runAction(async () => {
    await requireStaff('proposals:write');
    const parsed = z
      .object({
        proposalId: uuid,
        description: z.string().trim().min(2).max(300),
        quantity: z.coerce.number().int().min(1).max(1000),
        unitPrice: money,
      })
      .safeParse(Object.fromEntries(fd));
    if (!parsed.success)
      return {
        ok: false,
        error: 'Please check the line item.',
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    const check = await editableProposal(parsed.data.proposalId);
    if ('error' in check) return { ok: false, error: check.error! };
    const db = getDb();
    const count = await db.$count(proposalItems, eq(proposalItems.proposalId, parsed.data.proposalId));
    await db.insert(proposalItems).values({
      proposalId: parsed.data.proposalId,
      description: parsed.data.description,
      quantity: parsed.data.quantity,
      unitPriceCents: parsed.data.unitPrice,
      sortOrder: count,
    });
    revalidatePath(`/app/proposals/${parsed.data.proposalId}`);
    return { ok: true, message: 'Line item added.' };
  });
}

export async function removeProposalItem(
  _p: ActionResult<unknown>,
  fd: FormData,
): Promise<ActionResult<unknown>> {
  return runAction(async () => {
    await requireStaff('proposals:write');
    const parsed = z.object({ proposalId: uuid, itemId: uuid }).safeParse(Object.fromEntries(fd));
    if (!parsed.success) return { ok: false, error: 'Invalid request.' };
    const check = await editableProposal(parsed.data.proposalId);
    if ('error' in check) return { ok: false, error: check.error! };
    await getDb()
      .delete(proposalItems)
      .where(
        and(eq(proposalItems.id, parsed.data.itemId), eq(proposalItems.proposalId, parsed.data.proposalId)),
      );
    revalidatePath(`/app/proposals/${parsed.data.proposalId}`);
    return { ok: true };
  });
}

export async function setProposalStatus(
  _p: ActionResult<unknown>,
  fd: FormData,
): Promise<ActionResult<unknown>> {
  return runAction(async () => {
    const actor = await requireStaff('proposals:write');
    const parsed = z
      .object({
        proposalId: uuid,
        status: z.enum(['draft', 'sent', 'accepted', 'declined', 'expired']),
        acceptedByName: z.string().trim().max(160).optional(),
      })
      .safeParse(Object.fromEntries(fd));
    if (!parsed.success) return { ok: false, error: 'Invalid request.' };
    const { proposalId, status } = parsed.data;
    const db = getDb();
    const p = await db.query.proposals.findFirst({ where: eq(proposals.id, proposalId) });
    if (!p) return { ok: false, error: 'Proposal not found.' };
    if (status === 'sent') {
      const items = await db.$count(proposalItems, eq(proposalItems.proposalId, proposalId));
      if (!items) return { ok: false, error: 'Add at least one line item before marking as sent.' };
    }
    if (status === 'accepted' && !parsed.data.acceptedByName) {
      return { ok: false, error: 'Record who accepted the proposal (e.g. “Jane Smith via email, Nov 9”).' };
    }
    await db
      .update(proposals)
      .set({
        status,
        sentAt: status === 'sent' ? new Date() : p.sentAt,
        acceptedAt: status === 'accepted' ? new Date() : status === 'draft' ? null : p.acceptedAt,
        acceptedByName:
          status === 'accepted'
            ? `${parsed.data.acceptedByName} (recorded by Koral staff)`
            : p.acceptedByName,
      })
      .where(eq(proposals.id, proposalId));
    if (p.leadId) {
      if (status === 'sent') {
        await db
          .update(leads)
          .set({ stage: 'proposal' })
          .where(
            and(eq(leads.id, p.leadId), inArray(leads.stage, ['new', 'contacted', 'qualified', 'discovery'])),
          );
      }
      await db.insert(leadActivities).values({
        leadId: p.leadId,
        actorId: actor.user.id,
        type: 'system',
        body: `Proposal ${p.number} marked ${status}.`,
        metadata: { proposalId, status },
      });
    }
    await recordAudit({
      actor: auditActor(actor),
      action: 'proposal.status_changed',
      entityType: 'proposal',
      entityId: proposalId,
      orgId: p.orgId,
      metadata: { from: p.status, to: status },
    });
    revalidatePath(`/app/proposals/${proposalId}`);
    if (p.leadId) revalidatePath(`/app/leads/${p.leadId}`);
    return { ok: true, message: `Proposal marked ${status}.` };
  });
}

export async function duplicateProposal(
  _p: ActionResult<unknown>,
  fd: FormData,
): Promise<ActionResult<unknown>> {
  return runAction(async () => {
    const actor = await requireStaff('proposals:write');
    const id = uuid.parse(fd.get('proposalId'));
    const db = getDb();
    const src = await db.query.proposals.findFirst({ where: eq(proposals.id, id) });
    if (!src) return { ok: false, error: 'Proposal not found.' };
    const items = await db.select().from(proposalItems).where(eq(proposalItems.proposalId, id));
    const newId = await db.transaction(async (tx) => {
      const number = await nextProposalNumber(tx);
      const {
        id: _id,
        number: _n,
        createdAt: _c,
        updatedAt: _u,
        sentAt: _s,
        acceptedAt: _a,
        acceptedByName: _b,
        acceptedByUserId: _bu,
        ...rest
      } = src;
      const [p] = await tx
        .insert(proposals)
        .values({
          ...rest,
          number,
          status: 'draft',
          createdById: actor.user.id,
          title: `${src.title} (revised)`,
        })
        .returning({ id: proposals.id });
      if (items.length) {
        await tx.insert(proposalItems).values(
          items.map((i) => ({
            proposalId: p!.id,
            description: i.description,
            quantity: i.quantity,
            unitPriceCents: i.unitPriceCents,
            sortOrder: i.sortOrder,
          })),
        );
      }
      return p!.id;
    });
    await recordAudit({
      actor: auditActor(actor),
      action: 'proposal.duplicated',
      entityType: 'proposal',
      entityId: newId,
      metadata: { from: id },
    });
    redirect(`/app/proposals/${newId}`);
  });
}
