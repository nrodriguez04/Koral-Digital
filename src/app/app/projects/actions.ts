'use server';

import { and, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getDb } from '@/db';
import { milestoneStatusEnum, projectMilestones, projectStatusEnum, projects } from '@/db/schema';
import { recordAudit } from '@/lib/audit';
import { auditActor, requireStaff, runAction, type ActionResult } from '@/lib/auth/guards';
import { parseBusinessDate } from '@/lib/dates';

const uuid = z.string().uuid();

export async function updateProject(_p: ActionResult<unknown>, fd: FormData): Promise<ActionResult<unknown>> {
  return runAction(async () => {
    const actor = await requireStaff('projects:write');
    const parsed = z
      .object({
        projectId: uuid,
        name: z.string().trim().min(2).max(200),
        description: z.string().trim().max(4000).optional(),
        status: z.enum(projectStatusEnum.enumValues),
        startDate: z.string().optional(),
        targetDate: z.string().optional(),
        clientVisible: z.string().optional(),
      })
      .safeParse(Object.fromEntries(fd));
    if (!parsed.success)
      return { ok: false, error: 'Please check the form.', fieldErrors: parsed.error.flatten().fieldErrors };
    const d = parsed.data;
    const db = getDb();
    const p = await db.query.projects.findFirst({ where: eq(projects.id, d.projectId) });
    if (!p) return { ok: false, error: 'Project not found.' };
    await db
      .update(projects)
      .set({
        name: d.name,
        description: d.description ?? '',
        status: d.status,
        startDate: parseBusinessDate(d.startDate),
        targetDate: parseBusinessDate(d.targetDate),
        clientVisible: d.clientVisible === 'on',
      })
      .where(eq(projects.id, p.id));
    await recordAudit({
      actor: auditActor(actor),
      action: 'project.updated',
      entityType: 'project',
      entityId: p.id,
      orgId: p.orgId,
      metadata: { statusFrom: p.status, statusTo: d.status },
    });
    revalidatePath(`/app/projects/${p.id}`);
    return { ok: true, message: 'Project saved.' };
  });
}

export async function addMilestone(_p: ActionResult<unknown>, fd: FormData): Promise<ActionResult<unknown>> {
  return runAction(async () => {
    const actor = await requireStaff('projects:write');
    const parsed = z
      .object({
        projectId: uuid,
        title: z.string().trim().min(2).max(200),
        dueDate: z.string().optional(),
        clientVisible: z.string().optional(),
      })
      .safeParse(Object.fromEntries(fd));
    if (!parsed.success) return { ok: false, error: 'Please check the milestone.' };
    const db = getDb();
    const p = await db.query.projects.findFirst({ where: eq(projects.id, parsed.data.projectId) });
    if (!p) return { ok: false, error: 'Project not found.' };
    const count = await db.$count(projectMilestones, eq(projectMilestones.projectId, p.id));
    const [m] = await db
      .insert(projectMilestones)
      .values({
        orgId: p.orgId,
        projectId: p.id,
        title: parsed.data.title,
        dueDate: parseBusinessDate(parsed.data.dueDate),
        sortOrder: count,
        clientVisible: parsed.data.clientVisible === 'on',
      })
      .returning({ id: projectMilestones.id });
    await recordAudit({
      actor: auditActor(actor),
      action: 'milestone.created',
      entityType: 'milestone',
      entityId: m!.id,
      orgId: p.orgId,
    });
    revalidatePath(`/app/projects/${p.id}`);
    return { ok: true, message: 'Milestone added.' };
  });
}

export async function setMilestoneStatus(
  _p: ActionResult<unknown>,
  fd: FormData,
): Promise<ActionResult<unknown>> {
  return runAction(async () => {
    const actor = await requireStaff('projects:write');
    const parsed = z
      .object({ projectId: uuid, milestoneId: uuid, status: z.enum(milestoneStatusEnum.enumValues) })
      .safeParse(Object.fromEntries(fd));
    if (!parsed.success) return { ok: false, error: 'Invalid request.' };
    const db = getDb();
    const [m] = await db
      .update(projectMilestones)
      .set({ status: parsed.data.status, completedAt: parsed.data.status === 'done' ? new Date() : null })
      .where(
        and(
          eq(projectMilestones.id, parsed.data.milestoneId),
          eq(projectMilestones.projectId, parsed.data.projectId),
        ),
      )
      .returning();
    if (!m) return { ok: false, error: 'Milestone not found.' };
    // Starting work on the first milestone moves a planning project to active.
    if (parsed.data.status !== 'not_started') {
      await db
        .update(projects)
        .set({ status: 'active' })
        .where(and(eq(projects.id, m.projectId), eq(projects.status, 'planning')));
    }
    await recordAudit({
      actor: auditActor(actor),
      action: 'milestone.status_changed',
      entityType: 'milestone',
      entityId: m.id,
      orgId: m.orgId,
      metadata: { status: m.status },
    });
    revalidatePath(`/app/projects/${parsed.data.projectId}`);
    return { ok: true };
  });
}
