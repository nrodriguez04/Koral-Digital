'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getDb } from '@/db';
import { tasks } from '@/db/schema';
import { recordAudit } from '@/lib/audit';
import { auditActor, requireStaff, runAction, type ActionResult } from '@/lib/auth/guards';
import { parseBusinessDate } from '@/lib/dates';

export async function setTaskStatus(_p: ActionResult<unknown>, fd: FormData): Promise<ActionResult<unknown>> {
  return runAction(async () => {
    const actor = await requireStaff('tasks:write');
    const parsed = z.object({ taskId: z.string().uuid(), status: z.enum(['open', 'done', 'cancelled']) }).safeParse(Object.fromEntries(fd));
    if (!parsed.success) return { ok: false, error: 'Invalid task.' };
    const [t] = await getDb()
      .update(tasks)
      .set({ status: parsed.data.status, completedAt: parsed.data.status === 'done' ? new Date() : null })
      .where(eq(tasks.id, parsed.data.taskId))
      .returning();
    if (!t) return { ok: false, error: 'Task not found.' };
    if (t.orgId) {
      await recordAudit({ actor: auditActor(actor), action: 'task.status_changed', entityType: 'task', entityId: t.id, orgId: t.orgId, metadata: { status: t.status } });
    }
    if (t.leadId) revalidatePath(`/app/leads/${t.leadId}`);
    if (t.projectId) revalidatePath(`/app/projects/${t.projectId}`);
    if (t.orgId) revalidatePath(`/app/clients/${t.orgId}`);
    revalidatePath('/app/tasks');
    revalidatePath('/app');
    return { ok: true };
  });
}

export async function createTask(_p: ActionResult<unknown>, fd: FormData): Promise<ActionResult<unknown>> {
  return runAction(async () => {
    const actor = await requireStaff('tasks:write');
    const parsed = z
      .object({
        title: z.string().trim().min(2).max(200),
        description: z.string().trim().max(4000).optional(),
        dueAt: z.string().optional(),
        priority: z.enum(['low', 'normal', 'high', 'urgent']).default('normal'),
        assigneeId: z.union([z.string().uuid(), z.literal('')]).optional(),
        orgId: z.union([z.string().uuid(), z.literal('')]).optional(),
        projectId: z.union([z.string().uuid(), z.literal('')]).optional(),
        clientVisible: z.string().optional(),
      })
      .safeParse(Object.fromEntries(fd));
    if (!parsed.success) return { ok: false, error: 'Please check the task fields.', fieldErrors: parsed.error.flatten().fieldErrors };
    const d = parsed.data;
    const db = getDb();
    let orgId = d.orgId || null;
    if (d.projectId) {
      const p = await db.query.projects.findFirst({ where: (pr, { eq: e }) => e(pr.id, d.projectId!) });
      if (!p) return { ok: false, error: 'Project not found.' };
      if (orgId && orgId !== p.orgId) return { ok: false, error: 'Project does not belong to that client.' };
      orgId = p.orgId;
    }
    if (d.clientVisible === 'on' && !orgId) return { ok: false, error: 'Client-visible tasks must belong to a client.' };
    const [t] = await db
      .insert(tasks)
      .values({
        title: d.title,
        description: d.description ?? '',
        dueAt: parseBusinessDate(d.dueAt),
        priority: d.priority,
        assigneeId: d.assigneeId || actor.user.id,
        orgId,
        projectId: d.projectId || null,
        clientVisible: d.clientVisible === 'on',
        createdById: actor.user.id,
      })
      .returning({ id: tasks.id });
    if (orgId) await recordAudit({ actor: auditActor(actor), action: 'task.created', entityType: 'task', entityId: t!.id, orgId });
    if (d.projectId) revalidatePath(`/app/projects/${d.projectId}`);
    if (orgId) revalidatePath(`/app/clients/${orgId}`);
    revalidatePath('/app/tasks');
    return { ok: true, message: 'Task added.' };
  });
}

