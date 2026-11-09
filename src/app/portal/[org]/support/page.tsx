import Link from 'next/link';
import { LifeBuoy } from 'lucide-react';
import { ActionForm } from '@/components/app/action-form';
import { StatusBadge } from '@/components/app/status-badge';
import { Card, CardHeader, EmptyState, PageHeader } from '@/components/ui/primitives';
import { Field, Input, Select, Textarea } from '@/components/ui/form';
import { pageRequireOrgMember } from '@/lib/auth/guards';
import { memberCan } from '@/lib/auth/permissions';
import { relativeTime, titleCase } from '@/lib/utils';
import { portalProjects, portalTickets } from '@/server/portal';
import { portalCreateTicket } from '../actions';

export const metadata = { title: 'Support' };

export default async function PortalSupport({ params }: { params: Promise<{ org: string }> }) {
  const { org: slug } = await params;
  const { org, role } = await pageRequireOrgMember(slug);
  const [tickets, projects] = await Promise.all([portalTickets(org.id), portalProjects(org.id)]);
  return (
    <>
      <PageHeader title="Support requests" description="Questions, change requests and issues. Replies from Koral Digital appear here." />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          {tickets.length === 0 ? (
            <EmptyState icon={<LifeBuoy className="size-6" />} title="No requests yet">Use the form to ask a question or report an issue.</EmptyState>
          ) : (
            <ul className="divide-y divide-ink/6">
              {tickets.map((t) => (
                <li key={t.id}>
                  <Link href={`/portal/${org.slug}/support/${t.id}`} className="flex items-center justify-between gap-3 px-5 py-4 hover:bg-ocean-50/40">
                    <span>
                      <span className="block font-medium">{t.subject}</span>
                      <span className="block text-xs text-ink/50">Updated {relativeTime(t.updatedAt)}</span>
                    </span>
                    <StatusBadge status={t.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
        {memberCan(role, 'tickets:create') ? (
          <Card>
            <CardHeader title="New request" />
            <div className="p-5">
              <ActionForm action={portalCreateTicket} submitLabel="Submit request">
                <input type="hidden" name="org" value={org.slug} />
                <Field label="Subject" htmlFor="subject" required><Input id="subject" name="subject" required /></Field>
                <Field label="Details" htmlFor="body" required hint="Please do not include passwords or API keys."><Textarea id="body" name="body" required /></Field>
                <Field label="Priority" htmlFor="priority" required>
                  <Select id="priority" name="priority" defaultValue="normal">
                    {['low', 'normal', 'high', 'urgent'].map((p) => <option key={p} value={p}>{titleCase(p)}</option>)}
                  </Select>
                </Field>
                {projects.length ? (
                  <Field label="Project" htmlFor="projectId">
                    <Select id="projectId" name="projectId" defaultValue="">
                      <option value="">General</option>
                      {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </Select>
                  </Field>
                ) : null}
              </ActionForm>
            </div>
          </Card>
        ) : null}
      </div>
    </>
  );
}
