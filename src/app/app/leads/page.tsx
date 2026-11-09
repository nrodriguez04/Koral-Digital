import Link from 'next/link';
import { Download, Inbox, Plus } from 'lucide-react';
import { Pagination } from '@/components/app/pagination';
import { StageBadge } from '@/components/app/status-badge';
import { ButtonLink } from '@/components/ui/button';
import { Badge, Card, EmptyState, PageHeader, Table, Td, Th } from '@/components/ui/primitives';
import { leadSourceEnum } from '@/db/schema';
import { pageRequireStaff } from '@/lib/auth/guards';
import { staffCan } from '@/lib/auth/permissions';
import { LEAD_STAGES } from '@/lib/labels';
import { formatDate, relativeTime, titleCase } from '@/lib/utils';
import { listLeads, listStaff, stageCounts } from '@/server/leads';

export const metadata = { title: 'Leads' };

type SP = { q?: string; stage?: string; owner?: string; source?: string; page?: string; demo?: string };

export default async function LeadsPage({ searchParams }: { searchParams: Promise<SP> }) {
  const actor = await pageRequireStaff('leads:read', '/app/leads');
  const sp = await searchParams;
  const filters = {
    q: sp.q?.slice(0, 100),
    stage: sp.stage ?? 'open',
    owner: sp.owner,
    source: sp.source,
    page: Number(sp.page) || 1,
    includeDemo: sp.demo === '1',
  };
  const [{ rows, total, page, pageSize }, staff, counts] = await Promise.all([
    listLeads(filters),
    listStaff(),
    stageCounts(),
  ]);
  const exportParams = new URLSearchParams(
    Object.entries({ q: sp.q, stage: filters.stage, owner: sp.owner, source: sp.source }).filter(
      ([, v]) => v,
    ) as [string, string][],
  );
  return (
    <>
      <PageHeader
        title="Leads"
        description="Every website inquiry lands here automatically. Work each lead from new to won or lost."
        actions={
          <>
            {staffCan(actor.staffRole, 'leads:export') ? (
              <ButtonLink href={`/app/leads/export?${exportParams}`} variant="outline" prefetch={false}>
                <Download className="size-4" aria-hidden="true" /> Export CSV
              </ButtonLink>
            ) : null}
            {staffCan(actor.staffRole, 'leads:write') ? (
              <ButtonLink href="/app/leads/new">
                <Plus className="size-4" aria-hidden="true" /> New lead
              </ButtonLink>
            ) : null}
          </>
        }
      />
      <div className="mb-4 flex flex-wrap gap-2">
        {[{ value: 'open', label: 'All open' }, ...LEAD_STAGES, { value: 'all', label: 'Everything' }].map(
          (s) => {
            const active = filters.stage === s.value;
            const n =
              s.value === 'open'
                ? Object.entries(counts)
                    .filter(([k]) => k !== 'won' && k !== 'lost')
                    .reduce((a, [, v]) => a + (v ?? 0), 0)
                : s.value === 'all'
                  ? undefined
                  : (counts[s.value as keyof typeof counts] ?? 0);
            return (
              <Link
                key={s.value}
                href={`/app/leads?stage=${s.value}${sp.q ? `&q=${encodeURIComponent(sp.q)}` : ''}`}
                className={`rounded-full px-3 py-1.5 text-sm font-medium ring-1 transition ring-inset ${active ? 'bg-ocean-900 ring-ocean-900 text-white' : 'text-ink/70 ring-ink/10 hover:bg-ink/5 bg-white'}`}
              >
                {s.label}
                {n !== undefined ? <span className="ml-1.5 tabular-nums opacity-70">{n}</span> : null}
              </Link>
            );
          },
        )}
      </div>
      <Card>
        <form className="border-ink/8 flex flex-wrap items-end gap-3 border-b p-4" role="search">
          <input type="hidden" name="stage" value={filters.stage} />
          <label className="text-ink/60 flex min-w-56 flex-1 flex-col gap-1 text-xs font-medium">
            Search
            <input
              name="q"
              defaultValue={sp.q}
              placeholder="Company, contact, email, industry…"
              className="border-ink/15 text-ink h-10 rounded-lg border px-3 text-sm"
            />
          </label>
          <label className="text-ink/60 flex flex-col gap-1 text-xs font-medium">
            Owner
            <select
              name="owner"
              defaultValue={sp.owner ?? ''}
              className="border-ink/15 text-ink h-10 rounded-lg border bg-white px-3 text-sm"
            >
              <option value="">Anyone</option>
              <option value="unassigned">Unassigned</option>
              {staff.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name ?? s.email}
                </option>
              ))}
            </select>
          </label>
          <label className="text-ink/60 flex flex-col gap-1 text-xs font-medium">
            Source
            <select
              name="source"
              defaultValue={sp.source ?? ''}
              className="border-ink/15 text-ink h-10 rounded-lg border bg-white px-3 text-sm"
            >
              <option value="">Any</option>
              {leadSourceEnum.enumValues.map((s) => (
                <option key={s} value={s}>
                  {titleCase(s)}
                </option>
              ))}
            </select>
          </label>
          <label className="text-ink/60 flex items-center gap-2 pb-2.5 text-xs font-medium">
            <input type="checkbox" name="demo" value="1" defaultChecked={sp.demo === '1'} /> Include dev/demo
            data
          </label>
          <button
            type="submit"
            className="bg-ink hover:bg-ocean-900 h-10 rounded-lg px-4 text-sm font-semibold text-white"
          >
            Apply
          </button>
        </form>
        {rows.length === 0 ? (
          <EmptyState icon={<Inbox className="size-6" />} title="No leads match these filters">
            Website inquiries appear here automatically the moment someone submits the contact form.
          </EmptyState>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Lead</Th>
                <Th>Stage</Th>
                <Th>Owner</Th>
                <Th>Next action</Th>
                <Th>Created</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const overdue =
                  r.nextActionDueAt && r.nextActionDueAt < new Date() && !['won', 'lost'].includes(r.stage);
                return (
                  <tr key={r.id} className="hover:bg-ocean-50/40">
                    <Td>
                      <Link
                        href={`/app/leads/${r.id}`}
                        className="text-ink hover:text-ocean-700 font-semibold"
                      >
                        {r.companyName ?? r.title}
                      </Link>
                      <div className="text-ink/55 text-xs">
                        {r.contactName}
                        {r.contactEmail ? ` · ${r.contactEmail}` : ''}
                      </div>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {r.industry ? <Badge>{r.industry}</Badge> : null}
                        <Badge tone="ocean">{titleCase(r.source)}</Badge>
                        {r.submissionCount > 1 ? (
                          <Badge tone="amber">{r.submissionCount} submissions</Badge>
                        ) : null}
                        {r.isDemo ? <Badge tone="red">Synthetic</Badge> : null}
                      </div>
                    </Td>
                    <Td>
                      <StageBadge stage={r.stage} />
                    </Td>
                    <Td className="text-ink/70">
                      {r.ownerName ?? <span className="text-ink/40">Unassigned</span>}
                    </Td>
                    <Td>
                      <span className="text-ink/80 block">{r.nextAction ?? '—'}</span>
                      {r.nextActionDueAt ? (
                        <span className={`text-xs ${overdue ? 'font-semibold text-red-600' : 'text-ink/50'}`}>
                          {overdue ? 'Overdue · ' : 'Due '}
                          {formatDate(r.nextActionDueAt, true)}
                        </span>
                      ) : null}
                    </Td>
                    <Td className="text-ink/60 whitespace-nowrap">{relativeTime(r.createdAt)}</Td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        )}
        <Pagination
          page={page}
          pageSize={pageSize}
          total={total}
          basePath="/app/leads"
          params={{ q: sp.q, stage: filters.stage, owner: sp.owner, source: sp.source, demo: sp.demo }}
        />
      </Card>
    </>
  );
}
