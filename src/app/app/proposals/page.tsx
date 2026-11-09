import Link from 'next/link';
import { FileText } from 'lucide-react';
import { StatusBadge } from '@/components/app/status-badge';
import { Badge, Card, EmptyState, PageHeader, Table, Td, Th } from '@/components/ui/primitives';
import { pageRequireStaff } from '@/lib/auth/guards';
import { formatCents, formatDate } from '@/lib/utils';
import { listProposals } from '@/server/proposals';

export const metadata = { title: 'Proposals' };

export default async function ProposalsPage() {
  await pageRequireStaff('leads:read', '/app/proposals');
  const rows = await listProposals();
  return (
    <>
      <PageHeader title="Proposals" description="Draft proposals from a lead’s page. Sent and accepted proposals become visible to the client once the lead is converted." />
      <Card>
        {rows.length === 0 ? (
          <EmptyState icon={<FileText className="size-6" />} title="No proposals yet">
            Open a lead and choose “Draft proposal”.
          </EmptyState>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Proposal</Th>
                <Th>Client</Th>
                <Th>Status</Th>
                <Th className="text-right">Fixed fee</Th>
                <Th>Created</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id}>
                  <Td>
                    <Link href={`/app/proposals/${p.id}`} className="font-semibold hover:text-ocean-700">
                      {p.number}
                    </Link>
                    <div className="text-xs text-ink/55">{p.title}</div>
                  </Td>
                  <Td>
                    {p.companyName ?? '—'} {p.isDemo ? <Badge tone="red">Synthetic</Badge> : null}
                  </Td>
                  <Td>
                    <StatusBadge status={p.status} />
                  </Td>
                  <Td className="text-right tabular-nums">{formatCents(p.totalCents)}</Td>
                  <Td className="text-ink/60">{formatDate(p.createdAt)}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </>
  );
}
