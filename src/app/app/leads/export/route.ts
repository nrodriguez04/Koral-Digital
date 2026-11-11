import { desc, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { getDb } from '@/db';
import { companies, contacts, leads, users } from '@/db/schema';
import { recordAudit } from '@/lib/audit';
import { ForbiddenError, UnauthenticatedError } from '@/lib/auth/errors';
import { auditActor, requireStaff } from '@/lib/auth/guards';
import { csvCell } from '@/lib/csv';
import { leadWhere } from '@/server/leads';

export async function GET(req: Request) {
  let actor;
  try {
    actor = await requireStaff('leads:export');
  } catch (err) {
    if (err instanceof UnauthenticatedError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (err instanceof ForbiddenError) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    throw err;
  }
  const sp = new URL(req.url).searchParams;
  const where = leadWhere({
    q: sp.get('q') ?? undefined,
    stage: sp.get('stage') ?? 'all',
    owner: sp.get('owner') ?? undefined,
    source: sp.get('source') ?? undefined,
  });
  const rows = await getDb()
    .select({
      id: leads.id,
      created: leads.createdAt,
      stage: leads.stage,
      source: leads.source,
      company: companies.name,
      contact: contacts.fullName,
      email: contacts.email,
      phone: contacts.phone,
      industry: leads.industry,
      topProblem: leads.topProblem,
      currentCrm: leads.currentCrm,
      monthlyLeads: leads.monthlyLeads,
      owner: users.name,
      nextAction: leads.nextAction,
      nextActionDue: leads.nextActionDueAt,
      consentEmail: leads.consentEmail,
      consentSms: leads.consentSms,
      utmSource: leads.utmSource,
      utmMedium: leads.utmMedium,
      utmCampaign: leads.utmCampaign,
      landingPath: leads.landingPath,
    })
    .from(leads)
    .leftJoin(companies, eq(companies.id, leads.companyId))
    .leftJoin(contacts, eq(contacts.id, leads.contactId))
    .leftJoin(users, eq(users.id, leads.ownerId))
    .where(where)
    .orderBy(desc(leads.createdAt))
    .limit(5000);
  const header = Object.keys(rows[0] ?? { id: '' });
  const csv = [
    header.join(','),
    ...rows.map((r) => header.map((h) => csvCell((r as Record<string, unknown>)[h])).join(',')),
  ].join('\r\n');
  await recordAudit({
    actor: auditActor(actor),
    action: 'leads.exported',
    entityType: 'lead',
    metadata: { count: rows.length },
  });
  return new NextResponse(csv, {
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': `attachment; filename="koral-leads-${new Date().toISOString().slice(0, 10)}.csv"`,
      'cache-control': 'no-store',
    },
  });
}
