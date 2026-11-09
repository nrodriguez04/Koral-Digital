import Link from 'next/link';
import { LifeBuoy } from 'lucide-react';
import { StatusBadge } from '@/components/app/status-badge';
import { Card, EmptyState, PageHeader, Table, Td, Th } from '@/components/ui/primitives';
import { pageRequireStaff } from '@/lib/auth/guards';
import { relativeTime } from '@/lib/utils';
import { listTicketsForStaff } from '@/server/tickets';

export const metadata = { title: 'Support' };

export default async function TicketsPage({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
  await pageRequireStaff('clients:read', '/app/tickets');
  const { view } = await searchParams;
  const rows = await listTicketsForStaff(view === 'all' ? 'all' : 'active');
  return (
    <>
      <PageHeader
        title="Support requests"
        description="Requests and questions from client portals."
        actions={
          <Link href={view === 'all' ? '/app/tickets' : '/app/tickets?view=all'} className="text-sm font-semibold text-ocean-700 hover:underline">
            {view === 'all' ? 'Show active only' : 'Show all'}
          </Link>
        }
      />
      <Card>
        {rows.length === 0 ? (
          <EmptyState icon={<LifeBuoy className="size-6" />} title="No support requests">Clients can open requests from their portal.</EmptyState>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Subject</Th>
                <Th>Client</Th>
                <Th>Status</Th>
                <Th>Priority</Th>
                <Th>Updated</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((t) => (
                <tr key={t.id}>
                  <Td>
                    <Link href={`/app/tickets/${t.id}`} className="font-semibold hover:text-ocean-700">
                      {t.subject}
                    </Link>
                  </Td>
                  <Td>{t.orgName}</Td>
                  <Td>
                    <StatusBadge status={t.status} />
                  </Td>
                  <Td>
                    <StatusBadge status={t.priority} />
                  </Td>
                  <Td className="text-ink/60">{relativeTime(t.updatedAt)}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </>
  );
}
