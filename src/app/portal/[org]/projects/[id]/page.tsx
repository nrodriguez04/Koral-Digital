import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CheckCircle2, Circle, CircleDot, Download, OctagonAlert } from 'lucide-react';
import { StatusBadge } from '@/components/app/status-badge';
import { Card, CardHeader, PageHeader } from '@/components/ui/primitives';
import { pageRequireOrgMember } from '@/lib/auth/guards';
import { memberCan } from '@/lib/auth/permissions';
import { formatDate } from '@/lib/utils';
import { portalProject } from '@/server/portal';
import { Checklist } from '../../_checklist';

export const metadata = { title: 'Project' };

const icon = { done: CheckCircle2, in_progress: CircleDot, blocked: OctagonAlert, not_started: Circle };

export default async function PortalProjectPage({ params }: { params: Promise<{ org: string; id: string }> }) {
  const { org: slug, id } = await params;
  const { org, role } = await pageRequireOrgMember(slug);
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const d = await portalProject(org.id, id);
  if (!d) notFound();
  return (
    <>
      <PageHeader eyebrow={<Link href={`/portal/${org.slug}`}>← Overview</Link>} title={d.project.name} description={d.project.description} actions={<StatusBadge status={d.project.status} />} />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader title="Milestones" description={`Target completion ${formatDate(d.project.targetDate)}`} />
            <ol className="divide-y divide-ink/6">
              {d.milestones.map((m) => {
                const Icon = icon[m.status];
                return (
                  <li key={m.id} className="flex items-start gap-3 px-5 py-3">
                    <Icon className={`mt-0.5 size-5 shrink-0 ${m.status === 'done' ? 'text-ocean-600' : m.status === 'blocked' ? 'text-red-600' : 'text-ink/40'}`} aria-hidden="true" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{m.title}</p>
                      <p className="text-xs text-ink/55">{m.description}</p>
                    </div>
                    <div className="text-right">
                      <StatusBadge status={m.status} />
                      <p className="mt-1 text-xs text-ink/50">{m.completedAt ? `Done ${formatDate(m.completedAt)}` : formatDate(m.dueDate)}</p>
                    </div>
                  </li>
                );
              })}
              {d.milestones.length === 0 ? <li className="px-5 py-4 text-sm text-ink/55">Milestones will appear here.</li> : null}
            </ol>
          </Card>
          <Card>
            <CardHeader title="Updates & meeting notes" />
            {d.updates.length ? (
              <ul className="divide-y divide-ink/6">
                {d.updates.map((u) => (
                  <li key={u.id} className="px-5 py-4">
                    <p className="text-xs text-ink/50">{formatDate(u.createdAt, true)}</p>
                    <p className="mt-1 font-semibold">{u.title}</p>
                    <p className="mt-1 text-sm whitespace-pre-line text-ink/75">{u.body}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-5 py-4 text-sm text-ink/55">No updates yet.</p>
            )}
          </Card>
        </div>
        <div className="space-y-6">
          <Card>
            <CardHeader title="Your checklist" />
            <Checklist org={org.slug} items={d.checklist} canEdit={memberCan(role, 'tickets:create')} />
          </Card>
          <Card>
            <CardHeader title="Project files" />
            {d.files.length ? (
              <ul className="divide-y divide-ink/6">
                {d.files.map((f) => (
                  <li key={f.id} className="px-5 py-2.5 text-sm">
                    <a href={`/api/files/${f.id}`} className="flex items-center gap-2 hover:text-ocean-700">
                      <Download className="size-4 text-ink/40" aria-hidden="true" /> {f.name}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-5 py-4 text-sm text-ink/55">No files shared for this project.</p>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
