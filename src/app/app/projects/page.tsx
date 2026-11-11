import Link from 'next/link';
import { FolderKanban } from 'lucide-react';
import { StatusBadge } from '@/components/app/status-badge';
import { Badge, Card, EmptyState, PageHeader, Table, Td, Th } from '@/components/ui/primitives';
import { pageRequireStaff } from '@/lib/auth/guards';
import { formatDate } from '@/lib/utils';
import { listProjects } from '@/server/projects';

export const metadata = { title: 'Projects' };

export default async function ProjectsPage() {
  await pageRequireStaff('clients:read', '/app/projects');
  const rows = await listProjects();
  return (
    <>
      <PageHeader
        title="Projects"
        description="Delivery work across all clients. Create projects from a client’s Projects tab."
      />
      <Card>
        {rows.length === 0 ? (
          <EmptyState icon={<FolderKanban className="size-6" />} title="No projects yet" />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Project</Th>
                <Th>Client</Th>
                <Th>Status</Th>
                <Th>Progress</Th>
                <Th>Target</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id}>
                  <Td>
                    <Link href={`/app/projects/${p.id}`} className="hover:text-ocean-700 font-semibold">
                      {p.name}
                    </Link>
                    <div className="text-ink/50 text-xs">{p.ownerName ?? 'No owner'}</div>
                  </Td>
                  <Td>
                    <Link href={`/app/clients/${p.orgId}`} className="hover:text-ocean-700">
                      {p.orgName}
                    </Link>{' '}
                    {p.isDemo ? <Badge tone="red">Synthetic</Badge> : null}
                  </Td>
                  <Td>
                    <StatusBadge status={p.status} />
                  </Td>
                  <Td>
                    <div className="flex items-center gap-2">
                      <div className="bg-ink/10 h-1.5 w-24 overflow-hidden rounded-full">
                        <div
                          className="bg-ocean-500 h-full"
                          style={{ width: `${p.total ? (p.done / p.total) * 100 : 0}%` }}
                        />
                      </div>
                      <span className="text-ink/55 text-xs tabular-nums">
                        {p.done}/{p.total}
                      </span>
                    </div>
                  </Td>
                  <Td className="text-ink/60">{formatDate(p.targetDate)}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>
    </>
  );
}
