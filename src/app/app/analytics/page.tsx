import { and, eq, gte, isNull, sql } from 'drizzle-orm';
import { Alert, Card, CardHeader, PageHeader, Stat, Table, Td, Th } from '@/components/ui/primitives';
import { getDb } from '@/db';
import { analyticsEvents, leads } from '@/db/schema';
import { pageRequireStaff } from '@/lib/auth/guards';
import { daysAgo } from '@/lib/dates';

export const metadata = { title: 'Acquisition' };

export default async function AnalyticsPage({ searchParams }: { searchParams: Promise<{ days?: string }> }) {
  await pageRequireStaff('analytics:read', '/app/analytics');
  const { days: d } = await searchParams;
  const days = [7, 30, 90].includes(Number(d)) ? Number(d) : 30;
  const since = daysAgo(days);
  const db = getDb();
  const inRange = gte(analyticsEvents.createdAt, since);
  const [events, sessions, topPages, ctas, bySource, leadsBySource, leadsByStage] = await Promise.all([
    db.select({ name: analyticsEvents.name, n: sql<number>`count(*)::int` }).from(analyticsEvents).where(inRange).groupBy(analyticsEvents.name),
    db.select({ n: sql<number>`count(distinct ${analyticsEvents.sessionId})::int` }).from(analyticsEvents).where(and(inRange, eq(analyticsEvents.name, 'page_view'))),
    db.select({ path: analyticsEvents.path, n: sql<number>`count(*)::int` }).from(analyticsEvents).where(and(inRange, eq(analyticsEvents.name, 'page_view'))).groupBy(analyticsEvents.path).orderBy(sql`count(*) desc`).limit(10),
    db.select({ label: sql<string>`${analyticsEvents.props}->>'label'`, n: sql<number>`count(*)::int` }).from(analyticsEvents).where(and(inRange, eq(analyticsEvents.name, 'cta_click'))).groupBy(sql`${analyticsEvents.props}->>'label'`).orderBy(sql`count(*) desc`).limit(10),
    db.select({ source: sql<string>`coalesce(${analyticsEvents.utmSource}, ${analyticsEvents.referrerHost}, '(direct)')`, n: sql<number>`count(distinct ${analyticsEvents.sessionId})::int` }).from(analyticsEvents).where(and(inRange, eq(analyticsEvents.name, 'page_view'))).groupBy(sql`1`).orderBy(sql`2 desc`).limit(10),
    db.select({ source: sql<string>`coalesce(${leads.utmSource}, ${leads.source}::text)`, n: sql<number>`count(*)::int`, won: sql<number>`count(*) filter (where ${leads.stage} = 'won')::int` }).from(leads).where(and(gte(leads.createdAt, since), eq(leads.isDemo, false), isNull(leads.deletedAt))).groupBy(sql`1`).orderBy(sql`2 desc`),
    db.select({ stage: leads.stage, n: sql<number>`count(*)::int` }).from(leads).where(and(gte(leads.createdAt, since), eq(leads.isDemo, false), isNull(leads.deletedAt))).groupBy(leads.stage),
  ]);
  const ev = Object.fromEntries(events.map((e) => [e.name, e.n]));
  const starts = ev.contact_start ?? 0;
  const submits = ev.contact_submit_success ?? 0;
  const total = leadsByStage.reduce((a, r) => a + r.n, 0);
  return (
    <>
      <PageHeader
        title="Acquisition"
        description="First-party, cookieless events plus real leads. Browsers with Global Privacy Control or Do Not Track send nothing, so traffic numbers are a floor, not a total."
        actions={
          <div className="flex gap-2 text-sm">
            {[7, 30, 90].map((n) => (
              <a key={n} href={`/app/analytics?days=${n}`} className={`rounded-full px-3 py-1.5 ${days === n ? 'bg-ocean-900 text-white' : 'bg-white ring-1 ring-ink/10'}`}>{n} days</a>
            ))}
          </div>
        }
      />
      {Object.keys(ev).length === 0 && total === 0 ? <Alert tone="info" className="mb-6">No data in this period yet. Numbers appear as visitors use the public site.</Alert> : null}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Stat label="Sessions (approx.)" value={sessions[0]?.n ?? 0} />
        <Stat label="Page views" value={ev.page_view ?? 0} />
        <Stat label="Consultation CTA clicks" value={ev.cta_click ?? 0} />
        <Stat label="Form starts → submits" value={`${starts} → ${submits}`} hint={starts ? `${Math.round((submits / starts) * 100)}% completion` : undefined} />
        <Stat label="Leads created" value={total} hint={`${ev.booking_click ?? 0} booking-link clicks`} />
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Leads by source" description="UTM source when present, otherwise the recorded lead source." />
          <Table className="[&_table]:min-w-0">
            <thead><tr><Th>Source</Th><Th className="text-right">Leads</Th><Th className="text-right">Won</Th></tr></thead>
            <tbody>{leadsBySource.map((r) => <tr key={r.source}><Td>{r.source}</Td><Td className="text-right tabular-nums">{r.n}</Td><Td className="text-right tabular-nums">{r.won}</Td></tr>)}</tbody>
          </Table>
        </Card>
        <Card>
          <CardHeader title="Traffic sources (sessions)" />
          <Table className="[&_table]:min-w-0">
            <thead><tr><Th>Source</Th><Th className="text-right">Sessions</Th></tr></thead>
            <tbody>{bySource.map((r) => <tr key={r.source}><Td>{r.source}</Td><Td className="text-right tabular-nums">{r.n}</Td></tr>)}</tbody>
          </Table>
        </Card>
        <Card>
          <CardHeader title="Top pages" />
          <Table className="[&_table]:min-w-0">
            <thead><tr><Th>Path</Th><Th className="text-right">Views</Th></tr></thead>
            <tbody>{topPages.map((r) => <tr key={r.path ?? 'none'}><Td className="font-mono text-xs">{r.path}</Td><Td className="text-right tabular-nums">{r.n}</Td></tr>)}</tbody>
          </Table>
        </Card>
        <Card>
          <CardHeader title="Top calls-to-action" />
          <Table className="[&_table]:min-w-0">
            <thead><tr><Th>CTA</Th><Th className="text-right">Clicks</Th></tr></thead>
            <tbody>{ctas.map((r) => <tr key={r.label ?? 'none'}><Td className="font-mono text-xs">{r.label ?? '(unlabeled)'}</Td><Td className="text-right tabular-nums">{r.n}</Td></tr>)}</tbody>
          </Table>
        </Card>
      </div>
    </>
  );
}
