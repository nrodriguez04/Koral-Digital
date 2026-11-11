import Link from 'next/link';
import { Briefcase } from 'lucide-react';
import { StatusBadge } from '@/components/app/status-badge';
import { Badge, Card, EmptyState, PageHeader, Table, Td, Th } from '@/components/ui/primitives';
import { pageRequireStaff } from '@/lib/auth/guards';
import { formatDate } from '@/lib/utils';
import { listClients } from '@/server/clients';

export const metadata = { title: 'Clients' };

export default async function ClientsPage() {
  await pageRequireStaff('clients:read', '/app/clients');
  const rows = await listClients();
  return (
    <>
      <PageHeader
        title="Clients"
        description="Client workspaces are created by converting a won lead. Each has its own isolated portal."
      />
      <Card>
        {rows.length === 0 ? (
          <EmptyState icon={<Briefcase className="size-6" />} title="No clients yet">
            When a lead is won, use “Convert to client” on the lead page to create the workspace.
          </EmptyState>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Client</Th>
                <Th>Status</Th>
                <Th>Package</Th>
                <Th className="text-right">Members</Th>
                <Th className="text-right">Active projects</Th>
                <Th className="text-right">Open tickets</Th>
                <Th>Since</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id}>
                  <Td>
                    <Link href={`/app/clients/${c.id}`} className="hover:text-ocean-700 font-semibold">
                      {c.name}
                    </Link>{' '}
                    {c.isDemo ? <Badge tone="red">Synthetic</Badge> : null}
                    <div className="text-ink/50 text-xs">/portal/{c.slug}</div>
                  </Td>
                  <Td>
                    <StatusBadge status={c.status} />
                  </Td>
                  <Td className="text-ink/70">{c.servicePackage ?? '—'}</Td>
                  <Td className="text-right tabular-nums">{c.members}</Td>
                  <Td className="text-right tabular-nums">{c.activeProjects}</Td>
                  <Td className="text-right tabular-nums">{c.openTickets}</Td>
                  <Td className="text-ink/60">{formatDate(c.createdAt)}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </>
  );
}
