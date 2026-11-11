'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getDb } from '@/db';
import { supportTickets, ticketStatusEnum } from '@/db/schema';
import { recordAudit } from '@/lib/audit';
import { auditActor, requireStaff, runAction, type ActionResult } from '@/lib/auth/guards';
import { addTicketMessage } from '@/server/tickets';

export async function staffReply(_p: ActionResult<unknown>, fd: FormData): Promise<ActionResult<unknown>> {
  return runAction(async () => {
    const actor = await requireStaff('tickets:write');
    const parsed = z
      .object({
        ticketId: z.string().uuid(),
        body: z.string().trim().min(1).max(10000),
        internalNote: z.string().optional(),
      })
      .safeParse(Object.fromEntries(fd));
    if (!parsed.success) return { ok: false, error: 'Write a message first.' };
    const t = await getDb().query.supportTickets.findFirst({
      where: eq(supportTickets.id, parsed.data.ticketId),
    });
    if (!t) return { ok: false, error: 'Ticket not found.' };
    await addTicketMessage(actor, t.orgId, t.id, parsed.data.body, parsed.data.internalNote === 'on');
    revalidatePath(`/app/tickets/${t.id}`);
    return {
      ok: true,
      message:
        parsed.data.internalNote === 'on' ? 'Internal note added.' : 'Reply sent to the client portal.',
    };
  });
}

export async function setTicketStatus(
  _p: ActionResult<unknown>,
  fd: FormData,
): Promise<ActionResult<unknown>> {
  return runAction(async () => {
    const actor = await requireStaff('tickets:write');
    const parsed = z
      .object({
        ticketId: z.string().uuid(),
        status: z.enum(ticketStatusEnum.enumValues),
        priority: z.enum(['low', 'normal', 'high', 'urgent']),
      })
      .safeParse(Object.fromEntries(fd));
    if (!parsed.success) return { ok: false, error: 'Invalid request.' };
    const [t] = await getDb()
      .update(supportTickets)
      .set({
        status: parsed.data.status,
        priority: parsed.data.priority,
        closedAt: ['resolved', 'closed'].includes(parsed.data.status) ? new Date() : null,
      })
      .where(eq(supportTickets.id, parsed.data.ticketId))
      .returning();
    if (!t) return { ok: false, error: 'Ticket not found.' };
    await recordAudit({
      actor: auditActor(actor),
      action: 'ticket.status_changed',
      entityType: 'ticket',
      entityId: t.id,
      orgId: t.orgId,
      metadata: { status: t.status, priority: t.priority },
    });
    revalidatePath(`/app/tickets/${t.id}`);
    return { ok: true, message: 'Ticket updated.' };
  });
}
