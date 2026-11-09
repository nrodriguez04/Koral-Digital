import 'server-only';
import { asc, desc, eq, sql } from 'drizzle-orm';
import { getDb } from '@/db';
import { companies, contacts, leads, organizations, proposalItems, proposals } from '@/db/schema';

import { proposalTotals } from '@/lib/proposal-math';

export { proposalTotals };

export async function getProposalWithItems(id: string) {
  const db = getDb();
  const proposal = await db.query.proposals.findFirst({ where: eq(proposals.id, id) });
  if (!proposal) return null;
  const [items, lead, org] = await Promise.all([
    db.select().from(proposalItems).where(eq(proposalItems.proposalId, id)).orderBy(asc(proposalItems.sortOrder), asc(proposalItems.id)),
    proposal.leadId ? db.query.leads.findFirst({ where: eq(leads.id, proposal.leadId) }) : null,
    proposal.orgId ? db.query.organizations.findFirst({ where: eq(organizations.id, proposal.orgId) }) : null,
  ]);
  const [company, contact] = await Promise.all([
    lead?.companyId ? db.query.companies.findFirst({ where: eq(companies.id, lead.companyId) }) : null,
    lead?.contactId ? db.query.contacts.findFirst({ where: eq(contacts.id, lead.contactId) }) : null,
  ]);
  return { proposal, items, lead, org, company, contact, totals: proposalTotals(items, proposal.depositPercent) };
}

export async function listProposals() {
  const db = getDb();
  return db
    .select({
      id: proposals.id,
      number: proposals.number,
      title: proposals.title,
      status: proposals.status,
      createdAt: proposals.createdAt,
      sentAt: proposals.sentAt,
      leadId: proposals.leadId,
      orgId: proposals.orgId,
      isDemo: proposals.isDemo,
      companyName: companies.name,
      totalCents: sql<number>`coalesce((select sum(${proposalItems.quantity} * ${proposalItems.unitPriceCents}) from ${proposalItems} where ${proposalItems.proposalId} = ${proposals.id}), 0)::int`,
    })
    .from(proposals)
    .leftJoin(leads, eq(leads.id, proposals.leadId))
    .leftJoin(companies, eq(companies.id, leads.companyId))
    .orderBy(desc(proposals.createdAt))
    .limit(200);
}

export async function nextProposalNumber(tx: Pick<ReturnType<typeof getDb>, 'execute' | 'select'>) {
  const year = new Date().getFullYear();
  await tx.execute(sql`select pg_advisory_xact_lock(hashtext('koral:proposal-number'))`);
  const rows = await tx
    .select({ n: sql<number>`count(*)::int` })
    .from(proposals)
    .where(sql`${proposals.number} like ${`KD-${year}-%`}`);
  return `KD-${year}-${String((rows[0]?.n ?? 0) + 1).padStart(3, '0')}`;
}
