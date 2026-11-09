import 'server-only';
import { and, asc, desc, eq, ilike, inArray, isNull, or, sql, type SQL } from 'drizzle-orm';
import { getDb } from '@/db';
import {
  companies,
  contacts,
  discoveryAnswers,
  leadActivities,
  leads,
  meetings,
  proposals,
  tasks,
  users,
  type LeadStage,
} from '@/db/schema';

export const LEADS_PAGE_SIZE = 25;

export type LeadFilters = {
  q?: string;
  stage?: string;
  owner?: string;
  source?: string;
  page?: number;
  includeDemo?: boolean;
};

export function leadWhere(f: LeadFilters): SQL | undefined {
  const conds: (SQL | undefined)[] = [isNull(leads.deletedAt)];
  if (!f.includeDemo) conds.push(eq(leads.isDemo, false));
  if (f.stage && f.stage !== 'all') {
    if (f.stage === 'open') conds.push(sql`${leads.stage} not in ('won','lost')`);
    else conds.push(eq(leads.stage, f.stage as LeadStage));
  }
  if (f.owner === 'unassigned') conds.push(isNull(leads.ownerId));
  else if (f.owner) conds.push(eq(leads.ownerId, f.owner));
  if (f.source) conds.push(eq(leads.source, f.source as typeof leads.$inferSelect.source));
  if (f.q) {
    const q = `%${f.q.replace(/[%_\\]/g, (c) => `\\${c}`)}%`;
    conds.push(
      or(ilike(leads.title, q), ilike(companies.name, q), ilike(contacts.fullName, q), ilike(contacts.email, q), ilike(leads.industry, q)),
    );
  }
  return and(...conds);
}

export async function listLeads(f: LeadFilters) {
  const db = getDb();
  const page = Math.max(1, f.page ?? 1);
  const where = leadWhere(f);
  const base = db
    .select({
      id: leads.id,
      title: leads.title,
      stage: leads.stage,
      source: leads.source,
      industry: leads.industry,
      createdAt: leads.createdAt,
      nextAction: leads.nextAction,
      nextActionDueAt: leads.nextActionDueAt,
      submissionCount: leads.submissionCount,
      isDemo: leads.isDemo,
      companyName: companies.name,
      contactName: contacts.fullName,
      contactEmail: contacts.email,
      ownerName: users.name,
    })
    .from(leads)
    .leftJoin(companies, eq(companies.id, leads.companyId))
    .leftJoin(contacts, eq(contacts.id, leads.contactId))
    .leftJoin(users, eq(users.id, leads.ownerId))
    .where(where);
  const [rows, countRows] = await Promise.all([
    base.orderBy(desc(leads.createdAt)).limit(LEADS_PAGE_SIZE).offset((page - 1) * LEADS_PAGE_SIZE),
    db
      .select({ n: sql<number>`count(*)::int` })
      .from(leads)
      .leftJoin(companies, eq(companies.id, leads.companyId))
      .leftJoin(contacts, eq(contacts.id, leads.contactId))
      .where(where),
  ]);
  return { rows, total: countRows[0]?.n ?? 0, page, pageSize: LEADS_PAGE_SIZE };
}

export async function getLeadDetail(id: string) {
  const db = getDb();
  const lead = await db.query.leads.findFirst({ where: and(eq(leads.id, id), isNull(leads.deletedAt)) });
  if (!lead) return null;
  const [company, contact, owner, activities, answers, leadTasks, leadMeetings, leadProposals, companyContacts] =
    await Promise.all([
      lead.companyId ? db.query.companies.findFirst({ where: eq(companies.id, lead.companyId) }) : null,
      lead.contactId ? db.query.contacts.findFirst({ where: eq(contacts.id, lead.contactId) }) : null,
      lead.ownerId ? db.query.users.findFirst({ where: eq(users.id, lead.ownerId) }) : null,
      db
        .select({
          id: leadActivities.id,
          type: leadActivities.type,
          body: leadActivities.body,
          createdAt: leadActivities.createdAt,
          actorName: users.name,
          actorEmail: users.email,
        })
        .from(leadActivities)
        .leftJoin(users, eq(users.id, leadActivities.actorId))
        .where(eq(leadActivities.leadId, id))
        .orderBy(desc(leadActivities.createdAt))
        .limit(100),
      db.select().from(discoveryAnswers).where(eq(discoveryAnswers.leadId, id)),
      db.select().from(tasks).where(eq(tasks.leadId, id)).orderBy(asc(tasks.status), asc(tasks.dueAt)),
      db.select().from(meetings).where(eq(meetings.leadId, id)).orderBy(desc(meetings.scheduledAt)),
      db.select().from(proposals).where(eq(proposals.leadId, id)).orderBy(desc(proposals.createdAt)),
      lead.companyId
        ? db.select().from(contacts).where(and(eq(contacts.companyId, lead.companyId), isNull(contacts.deletedAt)))
        : Promise.resolve([]),
    ]);
  return { lead, company, contact, owner, activities, answers, tasks: leadTasks, meetings: leadMeetings, proposals: leadProposals, companyContacts };
}

export async function listStaff() {
  return getDb()
    .select({ id: users.id, name: users.name, email: users.email, staffRole: users.staffRole })
    .from(users)
    .where(and(sql`${users.staffRole} is not null`, eq(users.isActive, true)))
    .orderBy(asc(users.name));
}

export async function stageCounts() {
  const rows = await getDb()
    .select({ stage: leads.stage, n: sql<number>`count(*)::int` })
    .from(leads)
    .where(and(isNull(leads.deletedAt), eq(leads.isDemo, false)))
    .groupBy(leads.stage);
  return Object.fromEntries(rows.map((r) => [r.stage, r.n])) as Partial<Record<LeadStage, number>>;
}

export { inArray };
