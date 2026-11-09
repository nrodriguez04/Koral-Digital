import 'server-only';
import { and, asc, desc, eq, isNull, sql } from 'drizzle-orm';
import { getDb } from '@/db';
import { clientUpdates, files, organizations, projectMilestones, projects, tasks, users } from '@/db/schema';

export async function listProjects() {
  return getDb()
    .select({
      id: projects.id,
      name: projects.name,
      status: projects.status,
      targetDate: projects.targetDate,
      orgId: projects.orgId,
      orgName: organizations.name,
      isDemo: organizations.isDemo,
      ownerName: users.name,
      total: sql<number>`(select count(*)::int from ${projectMilestones} where ${projectMilestones.projectId} = ${projects.id})`,
      done: sql<number>`(select count(*)::int from ${projectMilestones} where ${projectMilestones.projectId} = ${projects.id} and ${projectMilestones.status} = 'done')`,
    })
    .from(projects)
    .innerJoin(organizations, eq(organizations.id, projects.orgId))
    .leftJoin(users, eq(users.id, projects.ownerId))
    .where(isNull(projects.deletedAt))
    .orderBy(desc(projects.createdAt));
}

export async function getProjectDetail(id: string) {
  const db = getDb();
  const project = await db.query.projects.findFirst({ where: and(eq(projects.id, id), isNull(projects.deletedAt)) });
  if (!project) return null;
  const [org, milestones, projectTasks, updates, projectFiles] = await Promise.all([
    db.query.organizations.findFirst({ where: eq(organizations.id, project.orgId) }),
    db.select().from(projectMilestones).where(eq(projectMilestones.projectId, id)).orderBy(asc(projectMilestones.sortOrder)),
    db.select().from(tasks).where(eq(tasks.projectId, id)).orderBy(asc(tasks.status), asc(tasks.dueAt)),
    db.select().from(clientUpdates).where(eq(clientUpdates.projectId, id)).orderBy(desc(clientUpdates.createdAt)),
    db.select().from(files).where(and(eq(files.projectId, id), isNull(files.deletedAt))).orderBy(desc(files.createdAt)),
  ]);
  return { project, org: org!, milestones, tasks: projectTasks, updates, files: projectFiles };
}
