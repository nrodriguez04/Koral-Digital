import 'server-only';
import { and, asc, desc, eq, gt, isNull, sql } from 'drizzle-orm';
import { getDb } from '@/db';
import {
  clientUpdates,
  files,
  integrations,
  invitations,
  invoices,
  memberships,
  organizations,
  projects,
  proposals,
  supportTickets,
  users,
} from '@/db/schema';

export async function listClients() {
  const db = getDb();
  return db
    .select({
      id: organizations.id,
      name: organizations.name,
      slug: organizations.slug,
      status: organizations.status,
      servicePackage: organizations.servicePackage,
      isDemo: organizations.isDemo,
      createdAt: organizations.createdAt,
      members: sql<number>`(select count(*)::int from ${memberships} where ${memberships.orgId} = ${organizations.id})`,
      activeProjects: sql<number>`(select count(*)::int from ${projects} where ${projects.orgId} = ${organizations.id} and ${projects.status} in ('planning','active') and ${projects.deletedAt} is null)`,
      openTickets: sql<number>`(select count(*)::int from ${supportTickets} where ${supportTickets.orgId} = ${organizations.id} and ${supportTickets.status} in ('open','waiting_on_koral'))`,
    })
    .from(organizations)
    .where(isNull(organizations.deletedAt))
    .orderBy(desc(organizations.createdAt));
}

export async function getClientDetail(orgId: string) {
  const db = getDb();
  const org = await db.query.organizations.findFirst({
    where: and(eq(organizations.id, orgId), isNull(organizations.deletedAt)),
  });
  if (!org) return null;
  const [
    members,
    pendingInvites,
    orgProjects,
    orgInvoices,
    orgFiles,
    orgIntegrations,
    tickets,
    updates,
    orgProposals,
  ] = await Promise.all([
    db
      .select({
        id: memberships.id,
        role: memberships.role,
        userId: users.id,
        name: users.name,
        email: users.email,
        lastLoginAt: users.lastLoginAt,
      })
      .from(memberships)
      .innerJoin(users, eq(users.id, memberships.userId))
      .where(eq(memberships.orgId, orgId))
      .orderBy(asc(users.email)),
    db
      .select()
      .from(invitations)
      .where(
        and(
          eq(invitations.orgId, orgId),
          eq(invitations.status, 'pending'),
          gt(invitations.expiresAt, new Date()),
        ),
      )
      .orderBy(desc(invitations.createdAt)),
    db
      .select()
      .from(projects)
      .where(and(eq(projects.orgId, orgId), isNull(projects.deletedAt)))
      .orderBy(desc(projects.createdAt)),
    db.select().from(invoices).where(eq(invoices.orgId, orgId)).orderBy(desc(invoices.createdAt)),
    db
      .select()
      .from(files)
      .where(and(eq(files.orgId, orgId), isNull(files.deletedAt)))
      .orderBy(desc(files.createdAt)),
    db.select().from(integrations).where(eq(integrations.orgId, orgId)).orderBy(asc(integrations.tool)),
    db
      .select()
      .from(supportTickets)
      .where(eq(supportTickets.orgId, orgId))
      .orderBy(desc(supportTickets.updatedAt))
      .limit(20),
    db
      .select()
      .from(clientUpdates)
      .where(eq(clientUpdates.orgId, orgId))
      .orderBy(desc(clientUpdates.createdAt))
      .limit(20),
    db.select().from(proposals).where(eq(proposals.orgId, orgId)).orderBy(desc(proposals.createdAt)),
  ]);
  return {
    org,
    members,
    pendingInvites,
    projects: orgProjects,
    invoices: orgInvoices,
    files: orgFiles,
    integrations: orgIntegrations,
    tickets,
    updates,
    proposals: orgProposals,
  };
}

export async function nextInvoiceNumber(tx: Pick<ReturnType<typeof getDb>, 'execute' | 'select'>) {
  const year = new Date().getFullYear();
  await tx.execute(sql`select pg_advisory_xact_lock(hashtext('koral:invoice-number'))`);
  const rows = await tx
    .select({ n: sql<number>`count(*)::int` })
    .from(invoices)
    .where(sql`${invoices.number} like ${`INV-${year}-%`}`);
  return `INV-${year}-${String((rows[0]?.n ?? 0) + 1).padStart(3, '0')}`;
}
