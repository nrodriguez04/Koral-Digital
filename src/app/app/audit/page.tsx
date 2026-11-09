import Link from 'next/link';
import { and, desc, eq, type SQL } from 'drizzle-orm';
import { Card, PageHeader, Table, Td, Th } from '@/components/ui/primitives';
import { Pagination } from '@/components/app/pagination';
import { getDb } from '@/db';
import { auditEvents, organizations } from '@/db/schema';
import { pageRequireStaff } from '@/lib/auth/guards';
import { formatDate } from '@/lib/utils';

export const metadata = { title: 'Audit log' };
const PAGE = 50;

export default async function AuditPage({ searchParams }: { searchParams: Promise<{ entity?: string; org?: string; page?: string }> }) {
  await pageRequireStaff('audit:read', '/app/audit');
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const conds: SQL[] = [];
  if (sp.entity) conds.push(eq(auditEvents.entityType, sp.entity));
  if (sp.org && /^[0-9a-f-]{36}$/.test(sp.org)) conds.push(eq(auditEvents.orgId, sp.org));
  const where = conds.length ? and(...conds) : undefined;
  const db = getDb();
  const [rows, total] = await Promise.all([
    db
      .select({ e: auditEvents, orgName: organizations.name })
      .from(auditEvents)
      .leftJoin(organizations, eq(organizations.id, auditEvents.orgId))
      .where(where)
      .orderBy(desc(auditEvents.createdAt))
      .limit(PAGE)
      .offset((page - 1) * PAGE),
    db.$count(auditEvents, where),
  ]);
  const entities = ['lead', 'proposal', 'organization', 'membership', 'invitation', 'project', 'milestone', 'ticket', 'file', 'invoice', 'user', 'site_settings', 'article'];
  return (
    <>
      <PageHeader title="Audit log" description="Who changed what, when. Metadata never contains message bodies or personal details." />
      <div className="mb-4 flex flex-wrap gap-2">
        <Link href="/app/audit" className={`rounded-full px-3 py-1 text-xs ring-1 ring-ink/10 ${!sp.entity ? 'bg-ocean-900 text-white' : 'bg-white'}`}>All</Link>
        {entities.map((e) => (
          <Link key={e} href={`/app/audit?entity=${e}`} className={`rounded-full px-3 py-1 text-xs ring-1 ring-ink/10 ${sp.entity === e ? 'bg-ocean-900 text-white' : 'bg-white'}`}>{e}</Link>
        ))}
      </div>
      <Card>
        <Table>
          <thead>
            <tr>
              <Th>When (Central)</Th>
              <Th>Actor</Th>
              <Th>Action</Th>
              <Th>Entity</Th>
              <Th>Tenant</Th>
              <Th>Details</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ e, orgName }) => (
              <tr key={e.id}>
                <Td className="whitespace-nowrap text-ink/60">{formatDate(e.createdAt, true)}</Td>
                <Td>{e.actorLabel}</Td>
                <Td className="font-medium">{e.action}</Td>
                <Td className="text-xs text-ink/60">{e.entityType}{e.entityId ? ` · ${e.entityId.slice(0, 8)}` : ''}</Td>
                <Td>{orgName ? <Link href={`/app/audit?org=${e.orgId}`} className="hover:text-ocean-700">{orgName}</Link> : '—'}</Td>
                <Td className="max-w-xs truncate font-mono text-xs text-ink/55">{Object.keys(e.metadata).length ? JSON.stringify(e.metadata) : ''}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
        <Pagination page={page} pageSize={PAGE} total={total} basePath="/app/audit" params={{ entity: sp.entity, org: sp.org }} />
      </Card>
    </>
  );
}
