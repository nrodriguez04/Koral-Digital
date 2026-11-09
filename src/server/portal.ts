import 'server-only';
import { and, asc, desc, eq, inArray, isNull, ne } from 'drizzle-orm';
import { getDb } from '@/db';
import {
  clientUpdates,
  files,
  invoices,
  memberships,
  projectMilestones,
  projects,
  proposalItems,
  proposals,
  supportTickets,
  tasks,
  users,
} from '@/db/schema';

/**
 * Client-portal reads. EVERY function takes the orgId resolved by
 * requireOrgMember() (from the actor's own memberships) and filters by it,
 * plus by client visibility. Never pass an orgId taken from user input.
 */

export async function portalOverview(orgId: string) {
  const db = getDb();
  const [orgProjects, checklist, updates, openTickets] = await Promise.all([
    portalProjects(orgId),
    db
      .select()
      .from(tasks)
      .where(and(eq(tasks.orgId, orgId), eq(tasks.clientVisible, true), eq(tasks.status, 'open')))
      .orderBy(asc(tasks.dueAt))
      .limit(20),
    db
      .select()
      .from(clientUpdates)
      .where(and(eq(clientUpdates.orgId, orgId), eq(clientUpdates.clientVisible, true)))
      .orderBy(desc(clientUpdates.createdAt))
      .limit(5),
    db.$count(
      supportTickets,
      and(
        eq(supportTickets.orgId, orgId),
        inArray(supportTickets.status, ['open', 'waiting_on_koral', 'waiting_on_client']),
      ),
    ),
  ]);
  return { projects: orgProjects, checklist, updates, openTickets };
}

export async function portalProjects(orgId: string) {
  const db = getDb();
  const rows = await db
    .select()
    .from(projects)
    .where(and(eq(projects.orgId, orgId), eq(projects.clientVisible, true), isNull(projects.deletedAt)))
    .orderBy(desc(projects.createdAt));
  const ms = rows.length
    ? await db
        .select()
        .from(projectMilestones)
        .where(
          and(
            eq(projectMilestones.orgId, orgId),
            eq(projectMilestones.clientVisible, true),
            inArray(
              projectMilestones.projectId,
              rows.map((r) => r.id),
            ),
          ),
        )
        .orderBy(asc(projectMilestones.sortOrder))
    : [];
  return rows.map((p) => {
    const m = ms.filter((x) => x.projectId === p.id);
    return { ...p, milestones: m, done: m.filter((x) => x.status === 'done').length };
  });
}

export async function portalProject(orgId: string, projectId: string) {
  const db = getDb();
  const p = await db.query.projects.findFirst({
    where: and(
      eq(projects.id, projectId),
      eq(projects.orgId, orgId),
      eq(projects.clientVisible, true),
      isNull(projects.deletedAt),
    ),
  });
  if (!p) return null;
  const [milestones, checklist, updates, projectFiles] = await Promise.all([
    db
      .select()
      .from(projectMilestones)
      .where(
        and(
          eq(projectMilestones.projectId, p.id),
          eq(projectMilestones.orgId, orgId),
          eq(projectMilestones.clientVisible, true),
        ),
      )
      .orderBy(asc(projectMilestones.sortOrder)),
    db
      .select()
      .from(tasks)
      .where(and(eq(tasks.projectId, p.id), eq(tasks.orgId, orgId), eq(tasks.clientVisible, true)))
      .orderBy(asc(tasks.status), asc(tasks.dueAt)),
    db
      .select()
      .from(clientUpdates)
      .where(
        and(
          eq(clientUpdates.projectId, p.id),
          eq(clientUpdates.orgId, orgId),
          eq(clientUpdates.clientVisible, true),
        ),
      )
      .orderBy(desc(clientUpdates.createdAt)),
    db
      .select()
      .from(files)
      .where(
        and(
          eq(files.projectId, p.id),
          eq(files.orgId, orgId),
          eq(files.visibility, 'client'),
          isNull(files.deletedAt),
        ),
      )
      .orderBy(desc(files.createdAt)),
  ]);
  return { project: p, milestones, checklist, updates, files: projectFiles };
}

export async function portalFiles(orgId: string) {
  return getDb()
    .select({
      id: files.id,
      name: files.name,
      sizeBytes: files.sizeBytes,
      createdAt: files.createdAt,
      contentType: files.contentType,
    })
    .from(files)
    .where(and(eq(files.orgId, orgId), eq(files.visibility, 'client'), isNull(files.deletedAt)))
    .orderBy(desc(files.createdAt));
}

export async function portalTickets(orgId: string) {
  return getDb()
    .select()
    .from(supportTickets)
    .where(eq(supportTickets.orgId, orgId))
    .orderBy(desc(supportTickets.updatedAt));
}

export async function portalBilling(orgId: string) {
  const db = getDb();
  const [props, invs] = await Promise.all([
    db
      .select()
      .from(proposals)
      .where(
        and(
          eq(proposals.orgId, orgId),
          inArray(proposals.status, ['sent', 'accepted', 'declined', 'expired']),
        ),
      )
      .orderBy(desc(proposals.createdAt)),
    db
      .select()
      .from(invoices)
      .where(and(eq(invoices.orgId, orgId), ne(invoices.status, 'draft')))
      .orderBy(desc(invoices.createdAt)),
  ]);
  return { proposals: props, invoices: invs };
}

export async function portalProposal(orgId: string, proposalId: string) {
  const db = getDb();
  const p = await db.query.proposals.findFirst({
    where: and(
      eq(proposals.id, proposalId),
      eq(proposals.orgId, orgId),
      inArray(proposals.status, ['sent', 'accepted', 'declined', 'expired']),
    ),
  });
  if (!p) return null;
  const items = await db
    .select()
    .from(proposalItems)
    .where(eq(proposalItems.proposalId, p.id))
    .orderBy(asc(proposalItems.sortOrder));
  return { proposal: p, items };
}

export async function portalTeam(orgId: string) {
  return getDb()
    .select({
      id: memberships.id,
      role: memberships.role,
      userId: users.id,
      name: users.name,
      email: users.email,
    })
    .from(memberships)
    .innerJoin(users, eq(users.id, memberships.userId))
    .where(eq(memberships.orgId, orgId))
    .orderBy(asc(users.email));
}
