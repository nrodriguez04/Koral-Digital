import 'server-only';
import { and, asc, desc, eq, inArray } from 'drizzle-orm';
import { getDb } from '@/db';
import { organizations, supportTickets, ticketMessages, users } from '@/db/schema';
import { recordAudit } from '@/lib/audit';
import { auditActor } from '@/lib/auth/guards';
import type { Actor } from '@/lib/auth/session';
import { sendEmail } from '@/lib/email';
import { siteUrl } from '@/lib/env';
import { getSiteSettings } from '@/lib/settings';

/** Caller must have authorized the actor for orgId. */
export async function createTicket(actor: Actor, orgId: string, input: { subject: string; body: string; priority: 'low' | 'normal' | 'high' | 'urgent'; projectId?: string | null }) {
  const db = getDb();
  const id = await db.transaction(async (tx) => {
    const [t] = await tx
      .insert(supportTickets)
      .values({ orgId, subject: input.subject, priority: input.priority, projectId: input.projectId ?? null, createdById: actor.user.id, status: actor.staffRole ? 'waiting_on_client' : 'open' })
      .returning({ id: supportTickets.id });
    await tx.insert(ticketMessages).values({ orgId, ticketId: t!.id, authorId: actor.user.id, body: input.body });
    return t!.id;
  });
  await recordAudit({ actor: auditActor(actor), action: 'ticket.created', entityType: 'ticket', entityId: id, orgId });
  if (!actor.staffRole) await notifyStaffOfTicket(orgId, id, input.subject, 'New support request');
  return id;
}

/** Caller must have authorized the actor for the ticket's org. Clients can never post internal notes. */
export async function addTicketMessage(actor: Actor, orgId: string, ticketId: string, body: string, internalNote: boolean) {
  const db = getDb();
  const ticket = await db.query.supportTickets.findFirst({ where: and(eq(supportTickets.id, ticketId), eq(supportTickets.orgId, orgId)) });
  if (!ticket) return null;
  const isStaff = Boolean(actor.staffRole);
  await db.insert(ticketMessages).values({ orgId, ticketId, authorId: actor.user.id, body, internalNote: isStaff && internalNote });
  const nextStatus = isStaff ? (internalNote ? ticket.status : 'waiting_on_client') : 'waiting_on_koral';
  await db.update(supportTickets).set({ status: ['resolved', 'closed'].includes(ticket.status) && !isStaff ? 'open' : nextStatus }).where(eq(supportTickets.id, ticketId));
  await recordAudit({ actor: auditActor(actor), action: 'ticket.message_added', entityType: 'ticket', entityId: ticketId, orgId, metadata: { internalNote: isStaff && internalNote } });
  if (!isStaff) await notifyStaffOfTicket(orgId, ticketId, ticket.subject, 'Client replied');
  return ticket;
}

export async function getTicketThread(ticketId: string, orgId: string | null, includeInternal: boolean) {
  const db = getDb();
  const where = orgId ? and(eq(supportTickets.id, ticketId), eq(supportTickets.orgId, orgId)) : eq(supportTickets.id, ticketId);
  const ticket = await db.query.supportTickets.findFirst({ where });
  if (!ticket) return null;
  const messages = await db
    .select({ id: ticketMessages.id, body: ticketMessages.body, internalNote: ticketMessages.internalNote, createdAt: ticketMessages.createdAt, authorName: users.name, authorEmail: users.email, authorIsStaff: users.staffRole })
    .from(ticketMessages)
    .leftJoin(users, eq(users.id, ticketMessages.authorId))
    .where(includeInternal ? eq(ticketMessages.ticketId, ticketId) : and(eq(ticketMessages.ticketId, ticketId), eq(ticketMessages.internalNote, false)))
    .orderBy(asc(ticketMessages.createdAt));
  return { ticket, messages };
}

export async function listTicketsForStaff(statusFilter: 'active' | 'all') {
  const db = getDb();
  return db
    .select({ id: supportTickets.id, subject: supportTickets.subject, status: supportTickets.status, priority: supportTickets.priority, updatedAt: supportTickets.updatedAt, orgId: supportTickets.orgId, orgName: organizations.name })
    .from(supportTickets)
    .innerJoin(organizations, eq(organizations.id, supportTickets.orgId))
    .where(statusFilter === 'active' ? inArray(supportTickets.status, ['open', 'waiting_on_koral', 'waiting_on_client']) : undefined)
    .orderBy(desc(supportTickets.updatedAt))
    .limit(200);
}

async function notifyStaffOfTicket(orgId: string, ticketId: string, subject: string, kind: string) {
  const s = await getSiteSettings();
  const org = await getDb().query.organizations.findFirst({ where: eq(organizations.id, orgId) });
  await sendEmail({
    to: s.notificationEmails,
    subject: `${kind}: ${subject} (${org?.name ?? 'client'})`,
    text: `${kind} from ${org?.name ?? 'a client'}.\n\nOpen: ${siteUrl()}/app/tickets/${ticketId}`,
  });
}
