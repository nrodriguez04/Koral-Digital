import Link from 'next/link';
import { ArrowRight, CalendarCheck2, FolderKanban } from 'lucide-react';
import { StatusBadge } from '@/components/app/status-badge';
import { Alert, Card, CardHeader, EmptyState, PageHeader } from '@/components/ui/primitives';
import { pageRequireOrgMember } from '@/lib/auth/guards';
import { memberCan } from '@/lib/auth/permissions';
import { getSiteSettings } from '@/lib/settings';
import { formatDate } from '@/lib/utils';
import { portalOverview } from '@/server/portal';
import { Checklist } from './_checklist';

export const metadata = { title: 'Overview' };

export default async function PortalHome({
  params,
  searchParams,
}: {
  params: Promise<{ org: string }>;
  searchParams: Promise<{ denied?: string }>;
}) {
  const { org: slug } = await params;
  const { denied } = await searchParams;
  const { actor, org, role } = await pageRequireOrgMember(slug);
  const [data, s] = await Promise.all([portalOverview(org.id), getSiteSettings()]);
  return (
    <>
      <PageHeader
        title={`Hello${actor.user.name ? `, ${actor.user.name.split(' ')[0]}` : ''}`}
        description={`${org.name} · your projects, requests and documents with Koral Digital.`}
      />
      {denied ? (
        <Alert tone="error" className="mb-6">
          Your role does not allow that action. Ask your account owner.
        </Alert>
      ) : null}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader title="Projects" />
            {data.projects.length === 0 ? (
              <EmptyState icon={<FolderKanban className="size-6" />} title="No active projects yet">
                Once your engagement kicks off, you will see milestones and progress here.
              </EmptyState>
            ) : (
              <ul className="divide-ink/6 divide-y">
                {data.projects.map((p) => {
                  const pct = p.milestones.length ? Math.round((p.done / p.milestones.length) * 100) : 0;
                  const current = p.milestones.find((m) => m.status !== 'done');
                  return (
                    <li key={p.id}>
                      <Link
                        href={`/portal/${org.slug}/projects/${p.id}`}
                        className="hover:bg-ocean-50/40 block px-5 py-4"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-semibold">{p.name}</p>
                          <StatusBadge status={p.status} />
                        </div>
                        <div className="mt-3 flex items-center gap-3">
                          <div
                            className="bg-ink/10 h-2 flex-1 overflow-hidden rounded-full"
                            role="progressbar"
                            aria-valuenow={pct}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-label={`${p.name} progress`}
                          >
                            <div className="bg-ocean-500 h-full rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-ink/60 text-xs tabular-nums">
                            {p.done}/{p.milestones.length} milestones
                          </span>
                        </div>
                        {current ? (
                          <p className="text-ink/60 mt-2 text-xs">
                            Current: {current.title}
                            {current.dueDate ? ` · target ${formatDate(current.dueDate)}` : ''}
                          </p>
                        ) : null}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
          <Card>
            <CardHeader title="Latest updates" />
            {data.updates.length ? (
              <ul className="divide-ink/6 divide-y">
                {data.updates.map((u) => (
                  <li key={u.id} className="px-5 py-4">
                    <p className="text-ink/50 text-xs">{formatDate(u.createdAt, true)}</p>
                    <p className="mt-1 font-semibold">{u.title}</p>
                    <p className="text-ink/75 mt-1 text-sm whitespace-pre-line">{u.body}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-ink/55 px-5 py-4 text-sm">No updates posted yet.</p>
            )}
          </Card>
        </div>
        <div className="space-y-6">
          <Card>
            <CardHeader
              title="What we need from you"
              description="Access and approvals that keep the project moving."
            />
            <Checklist org={org.slug} items={data.checklist} canEdit={memberCan(role, 'tickets:create')} />
          </Card>
          <Card>
            <CardHeader title="Need something?" />
            <div className="space-y-3 p-5 text-sm">
              <Link
                href={`/portal/${org.slug}/support`}
                className="text-ocean-700 flex items-center justify-between font-semibold hover:underline"
              >
                Open a support request <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <p className="text-ink/60">
                {data.openTickets} open request{data.openTickets === 1 ? '' : 's'}
              </p>
              {s.bookingUrlVerified && s.bookingUrl ? (
                <a
                  href={s.bookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ocean-700 flex items-center gap-2 font-semibold hover:underline"
                >
                  <CalendarCheck2 className="size-4" aria-hidden="true" /> Book a meeting
                </a>
              ) : null}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
