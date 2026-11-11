import Link from 'next/link';
import { and, asc, desc, eq, gte, inArray, isNull, lt, sql } from 'drizzle-orm';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import { StageBadge } from '@/components/app/status-badge';
import { Alert, Card, CardHeader, PageHeader, Stat } from '@/components/ui/primitives';
import { getDb } from '@/db';
import {
  companies,
  contacts,
  leads,
  organizations,
  projects,
  proposals,
  supportTickets,
  tasks,
} from '@/db/schema';
import { pageRequireStaff } from '@/lib/auth/guards';
import { isDescopeManagementConfigured } from '@/lib/auth/descope';
import { isEmailConfigured } from '@/lib/env';
import { LEAD_STAGES } from '@/lib/labels';
import { getSiteSettings } from '@/lib/settings';
import { storageStatus } from '@/lib/storage';
import { formatDate, relativeTime } from '@/lib/utils';
import { stageCounts } from '@/server/leads';

export const metadata = { title: 'Overview' };

export default async function OverviewPage({ searchParams }: { searchParams: Promise<{ denied?: string }> }) {
  const actor = await pageRequireStaff('leads:read', '/app');
  const { denied } = await searchParams;
  const db = getDb();
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 86_400_000);
  const real = eq(leads.isDemo, false);
  const [
    counts,
    newThisWeek,
    recent,
    overdueTasks,
    dueTasks,
    proposalRows,
    clients,
    activeProjects,
    openTickets,
    s,
  ] = await Promise.all([
    stageCounts(),
    db.$count(leads, and(real, isNull(leads.deletedAt), gte(leads.createdAt, weekAgo))),
    db
      .select({
        id: leads.id,
        stage: leads.stage,
        createdAt: leads.createdAt,
        company: companies.name,
        contact: contacts.fullName,
        topProblem: leads.topProblem,
      })
      .from(leads)
      .leftJoin(companies, eq(companies.id, leads.companyId))
      .leftJoin(contacts, eq(contacts.id, leads.contactId))
      .where(and(real, isNull(leads.deletedAt)))
      .orderBy(desc(leads.createdAt))
      .limit(6),
    db.$count(tasks, and(eq(tasks.status, 'open'), lt(tasks.dueAt, now))),
    db
      .select()
      .from(tasks)
      .where(and(eq(tasks.status, 'open'), eq(tasks.assigneeId, actor.user.id)))
      .orderBy(asc(tasks.dueAt))
      .limit(6),
    db
      .select({ status: proposals.status, n: sql<number>`count(*)::int` })
      .from(proposals)
      .where(eq(proposals.isDemo, false))
      .groupBy(proposals.status),
    db.$count(
      organizations,
      and(
        isNull(organizations.deletedAt),
        eq(organizations.isDemo, false),
        inArray(organizations.status, ['onboarding', 'active']),
      ),
    ),
    db.$count(projects, and(isNull(projects.deletedAt), inArray(projects.status, ['planning', 'active']))),
    db.$count(supportTickets, inArray(supportTickets.status, ['open', 'waiting_on_koral'])),
    getSiteSettings(),
  ]);
  const overdueLeads = await db.$count(
    leads,
    and(
      real,
      isNull(leads.deletedAt),
      lt(leads.nextActionDueAt, now),
      sql`${leads.stage} not in ('won','lost')`,
    ),
  );
  const proposalMap = Object.fromEntries(proposalRows.map((r) => [r.status, r.n]));
  const openLeads = LEAD_STAGES.filter((x) => !['won', 'lost'].includes(x.value)).reduce(
    (a, x) => a + (counts[x.value] ?? 0),
    0,
  );
  const storage = storageStatus();
  const setup = [
    !isEmailConfigured() &&
      'Email notifications are off (RESEND_API_KEY / EMAIL_FROM). Check the Leads list for new inquiries.',
    !s.bookingUrlVerified &&
      'Booking link is not verified, so /book shows the contact form instead of a calendar.',
    !s.contactEmailVerified &&
      'Public contact email is hidden until you confirm the mailbox receives mail (Settings).',
    !storage.ready && `File sharing is unavailable: ${storage.reason}`,
    !isDescopeManagementConfigured() &&
      'Descope management key not set: client invitations use copy-and-send links.',
  ].filter(Boolean) as string[];

  return (
    <>
      <PageHeader
        title={`Welcome${actor.user.name ? `, ${actor.user.name.split(' ')[0]}` : ''}`}
        description="Live numbers from the database. Development/demo records are excluded."
      />
      {denied ? (
        <Alert tone="error" className="mb-6">
          You do not have permission to open that page.
        </Alert>
      ) : null}
      {setup.length ? (
        <Alert tone="warning" className="mb-6" title="Setup items">
          <ul className="list-disc space-y-0.5 pl-4">
            {setup.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
        </Alert>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="New inquiries (7 days)" value={newThisWeek} href="/app/leads?stage=all" />
        <Stat
          label="Open leads"
          value={openLeads}
          hint={`${counts.new ?? 0} not yet contacted`}
          href="/app/leads"
        />
        <Stat
          label="Overdue follow-ups"
          value={overdueLeads + overdueTasks}
          hint={`${overdueLeads} leads · ${overdueTasks} tasks`}
          href="/app/tasks"
        />
        <Stat
          label="Proposals out"
          value={proposalMap.sent ?? 0}
          hint={`${proposalMap.draft ?? 0} drafts · ${proposalMap.accepted ?? 0} accepted`}
          href="/app/proposals"
        />
        <Stat label="Active clients" value={clients} href="/app/clients" />
        <Stat label="Active projects" value={activeProjects} href="/app/projects" />
        <Stat label="Support awaiting Koral" value={openTickets} href="/app/tickets" />
        <Stat label="Won (all time)" value={counts.won ?? 0} hint={`${counts.lost ?? 0} lost`} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Pipeline"
            action={
              <Link href="/app/leads" className="text-ocean-700 text-sm font-semibold hover:underline">
                Open leads
              </Link>
            }
          />
          <div className="bg-ink/8 grid grid-cols-2 gap-px sm:grid-cols-4 lg:grid-cols-7">
            {LEAD_STAGES.map((st) => (
              <Link
                key={st.value}
                href={`/app/leads?stage=${st.value}`}
                className="hover:bg-ocean-50/50 bg-white p-4"
              >
                <p className="text-ink/55 text-xs">{st.label}</p>
                <p className="mt-1 text-xl font-semibold tabular-nums">{counts[st.value] ?? 0}</p>
              </Link>
            ))}
          </div>
          <div className="border-ink/8 border-t">
            <p className="px-5 pt-4 text-sm font-semibold">Latest inquiries</p>
            {recent.length ? (
              <ul className="divide-ink/6 divide-y">
                {recent.map((r) => (
                  <li key={r.id}>
                    <Link
                      href={`/app/leads/${r.id}`}
                      className="hover:bg-ocean-50/40 flex items-center justify-between gap-3 px-5 py-3"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium">{r.company ?? r.contact}</span>
                        <span className="text-ink/55 block truncate text-xs">{r.topProblem ?? '—'}</span>
                      </span>
                      <span className="text-ink/55 flex shrink-0 items-center gap-3 text-xs">
                        {relativeTime(r.createdAt)} <StageBadge stage={r.stage} />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-ink/55 px-5 py-6 text-sm">
                No inquiries yet. When someone submits the form on{' '}
                <Link href="/contact" className="text-ocean-700 font-semibold">
                  /contact
                </Link>
                , it appears here instantly.
              </p>
            )}
          </div>
        </Card>
        <Card>
          <CardHeader
            title="My open tasks"
            action={
              <Link href="/app/tasks" className="text-ocean-700 text-sm font-semibold hover:underline">
                All tasks
              </Link>
            }
          />
          {dueTasks.length ? (
            <ul className="divide-ink/6 divide-y">
              {dueTasks.map((t) => {
                const overdue = t.dueAt && t.dueAt < now;
                const href = t.leadId
                  ? `/app/leads/${t.leadId}`
                  : t.projectId
                    ? `/app/projects/${t.projectId}`
                    : '/app/tasks';
                return (
                  <li key={t.id}>
                    <Link href={href} className="hover:bg-ocean-50/40 flex items-start gap-2 px-5 py-3">
                      {overdue ? (
                        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-red-600" aria-label="Overdue" />
                      ) : (
                        <ArrowRight className="text-ink/30 mt-0.5 size-4 shrink-0" aria-hidden="true" />
                      )}
                      <span>
                        <span className="block text-sm">{t.title}</span>
                        <span
                          className={`block text-xs ${overdue ? 'font-semibold text-red-600' : 'text-ink/50'}`}
                        >
                          {t.dueAt ? formatDate(t.dueAt) : 'No due date'}
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-ink/55 px-5 py-6 text-sm">Nothing assigned to you.</p>
          )}
        </Card>
      </div>
    </>
  );
}
