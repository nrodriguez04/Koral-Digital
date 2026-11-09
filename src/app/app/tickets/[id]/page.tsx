import Link from 'next/link';
import { eq } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { ActionForm } from '@/components/app/action-form';
import { StatusBadge } from '@/components/app/status-badge';
import { Badge, Card, CardHeader, PageHeader } from '@/components/ui/primitives';
import { Checkbox, Select, Textarea } from '@/components/ui/form';
import { getDb } from '@/db';
import { organizations, ticketStatusEnum } from '@/db/schema';
import { pageRequireStaff } from '@/lib/auth/guards';
import { staffCan } from '@/lib/auth/permissions';
import { formatDate, titleCase } from '@/lib/utils';
import { getTicketThread } from '@/server/tickets';
import { setTicketStatus, staffReply } from '../actions';

export const metadata = { title: 'Support request' };

export default async function TicketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const actor = await pageRequireStaff('clients:read', `/app/tickets/${id}`);
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const thread = await getTicketThread(id, null, true);
  if (!thread) notFound();
  const { ticket, messages } = thread;
  const org = await getDb().query.organizations.findFirst({ where: eq(organizations.id, ticket.orgId) });
  const canWrite = staffCan(actor.staffRole, 'tickets:write');
  return (
    <>
      <PageHeader
        eyebrow={<Link href="/app/tickets">← Support</Link>}
        title={ticket.subject}
        description={`${org?.name} · opened ${formatDate(ticket.createdAt, true)}`}
        actions={
          <>
            <StatusBadge status={ticket.priority} />
            <StatusBadge status={ticket.status} />
          </>
        }
      />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Conversation" description="Internal notes are never visible to the client." />
          <ol className="divide-ink/6 divide-y">
            {messages.map((m) => (
              <li key={m.id} className={`px-5 py-4 ${m.internalNote ? 'bg-amber-50/60' : ''}`}>
                <div className="text-ink/55 flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-ink font-semibold">{m.authorName ?? m.authorEmail ?? 'Unknown'}</span>
                  <Badge tone={m.authorIsStaff ? 'navy' : 'ocean'}>
                    {m.authorIsStaff ? 'Koral' : 'Client'}
                  </Badge>
                  {m.internalNote ? <Badge tone="amber">Internal note</Badge> : null}
                  <span>{formatDate(m.createdAt, true)}</span>
                </div>
                <p className="mt-2 text-sm leading-relaxed whitespace-pre-line">{m.body}</p>
              </li>
            ))}
          </ol>
          {canWrite ? (
            <div className="border-ink/8 border-t p-5">
              <ActionForm action={staffReply} submitLabel="Send" resetOnSuccess>
                <input type="hidden" name="ticketId" value={ticket.id} />
                <Textarea name="body" required placeholder="Write a reply…" aria-label="Reply" />
                <Checkbox name="internalNote" label="Internal note (hidden from client)" />
              </ActionForm>
            </div>
          ) : null}
        </Card>
        {canWrite ? (
          <Card>
            <CardHeader title="Status" />
            <div className="p-5">
              <ActionForm action={setTicketStatus} submitLabel="Update">
                <input type="hidden" name="ticketId" value={ticket.id} />
                <Select name="status" defaultValue={ticket.status} aria-label="Status">
                  {ticketStatusEnum.enumValues.map((s) => (
                    <option key={s} value={s}>
                      {titleCase(s)}
                    </option>
                  ))}
                </Select>
                <Select name="priority" defaultValue={ticket.priority} aria-label="Priority">
                  {['low', 'normal', 'high', 'urgent'].map((s) => (
                    <option key={s} value={s}>
                      {titleCase(s)}
                    </option>
                  ))}
                </Select>
              </ActionForm>
            </div>
          </Card>
        ) : null}
      </div>
    </>
  );
}
