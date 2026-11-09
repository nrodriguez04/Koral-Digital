import Link from 'next/link';
import { and, desc, ilike, isNull, sql } from 'drizzle-orm';
import { Building2 } from 'lucide-react';
import { Badge, Card, EmptyState, PageHeader, Table, Td, Th } from '@/components/ui/primitives';
import { getDb } from '@/db';
import { companies, contacts, leads } from '@/db/schema';
import { pageRequireStaff } from '@/lib/auth/guards';
import { formatDate } from '@/lib/utils';

export const metadata = { title: 'Companies' };

export default async function CompaniesPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await pageRequireStaff('leads:read', '/app/companies');
  const { q } = await searchParams;
  const rows = await getDb()
    .select({
      id: companies.id,
      name: companies.name,
      domain: companies.domain,
      industry: companies.industry,
      currentCrm: companies.currentCrm,
      isDemo: companies.isDemo,
      createdAt: companies.createdAt,
      contacts: sql<number>`(select count(*)::int from ${contacts} where ${contacts.companyId} = ${companies.id} and ${contacts.deletedAt} is null)`,
      leads: sql<number>`(select count(*)::int from ${leads} where ${leads.companyId} = ${companies.id} and ${leads.deletedAt} is null)`,
    })
    .from(companies)
    .where(and(isNull(companies.deletedAt), q ? ilike(companies.name, `%${q.replace(/[%_\\]/g, (c) => `\\${c}`)}%`) : undefined))
    .orderBy(desc(companies.createdAt))
    .limit(200);
  return (
    <>
      <PageHeader title="Companies" description="Business profiles, de-duplicated by website domain and normalized name." />
      <Card>
        <form className="border-b border-ink/8 p-4" role="search">
          <input name="q" defaultValue={q} placeholder="Search companies…" aria-label="Search companies" className="h-10 w-full max-w-sm rounded-lg border border-ink/15 px-3 text-sm" />
        </form>
        {rows.length === 0 ? (
          <EmptyState icon={<Building2 className="size-6" />} title="No companies yet" />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Company</Th>
                <Th>Industry</Th>
                <Th>CRM</Th>
                <Th className="text-right">Contacts</Th>
                <Th className="text-right">Leads</Th>
                <Th>Added</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id}>
                  <Td>
                    <Link href={`/app/companies/${c.id}`} className="font-semibold hover:text-ocean-700">{c.name}</Link> {c.isDemo ? <Badge tone="red">Synthetic</Badge> : null}
                    <div className="text-xs text-ink/50">{c.domain ?? 'No business domain'}</div>
                  </Td>
                  <Td>{c.industry ?? '—'}</Td>
                  <Td>{c.currentCrm ?? '—'}</Td>
                  <Td className="text-right tabular-nums">{c.contacts}</Td>
                  <Td className="text-right tabular-nums">{c.leads}</Td>
                  <Td className="text-ink/60">{formatDate(c.createdAt)}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </>
  );
}
