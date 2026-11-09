import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ActionForm } from '@/components/app/action-form';
import { StatusBadge } from '@/components/app/status-badge';
import { Badge, Card, PageHeader } from '@/components/ui/primitives';
import { Textarea } from '@/components/ui/form';
import { pageRequireOrgMember } from '@/lib/auth/guards';
import { memberCan } from '@/lib/auth/permissions';
import { formatDate } from '@/lib/utils';
import { getTicketThread } from '@/server/tickets';
import { portalReplyTicket } from '../../actions';

export const metadata = { title: 'Support request' };

export default async function PortalTicket({ params }: { params: Promise<{ org: string; id: string }> }) {
  const { org: slug, id } = await params;
  const { org, role } = await pageRequireOrgMember(slug);
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  // Scoped to this org and excluding internal notes.
  const thread = await getTicketThread(id, org.id, false);
  if (!thread) notFound();
  return (
    <>
      <PageHeader eyebrow={<Link href={`/portal/${org.slug}/support`}>← Support</Link>} title={thread.ticket.subject} actions={<StatusBadge status={thread.ticket.status} />} />
      <Card className="max-w-3xl">
        <ol className="divide-y divide-ink/6">
          {thread.messages.map((m) => (
            <li key={m.id} className="px-5 py-4">
              <div className="flex items-center gap-2 text-xs text-ink/55">
                <span className="font-semibold text-ink">{m.authorName ?? m.authorEmail}</span>
                {m.authorIsStaff ? <Badge tone="navy">Koral Digital</Badge> : null}
                <span>{formatDate(m.createdAt, true)}</span>
              </div>
              <p className="mt-2 text-sm leading-relaxed whitespace-pre-line">{m.body}</p>
            </li>
          ))}
        </ol>
        {memberCan(role, 'tickets:create') ? (
          <div className="border-t border-ink/8 p-5">
            <ActionForm action={portalReplyTicket} submitLabel="Send reply" resetOnSuccess>
              <input type="hidden" name="org" value={org.slug} />
              <input type="hidden" name="ticketId" value={thread.ticket.id} />
              <Textarea name="body" required placeholder="Write a reply…" aria-label="Reply" />
            </ActionForm>
          </div>
        ) : null}
      </Card>
    </>
  );
}
