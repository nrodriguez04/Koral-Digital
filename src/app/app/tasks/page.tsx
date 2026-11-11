import Link from 'next/link';
import { and, asc, eq, sql } from 'drizzle-orm';
import { CheckSquare } from 'lucide-react';
import { ActionForm } from '@/components/app/action-form';
import { StatusBadge } from '@/components/app/status-badge';
import { Card, EmptyState, PageHeader, Table, Td, Th } from '@/components/ui/primitives';
import { getDb } from '@/db';
import { leads, organizations, projects, tasks, users } from '@/db/schema';
import { pageRequireStaff } from '@/lib/auth/guards';
import { staffCan } from '@/lib/auth/permissions';
import { formatDate } from '@/lib/utils';
import { setTaskStatus } from './actions';

export const metadata = { title: 'Tasks' };

export default async function TasksPage({ searchParams }: { searchParams: Promise<{ mine?: string }> }) {
  const actor = await pageRequireStaff('leads:read', '/app/tasks');
  const { mine } = await searchParams;
  const onlyMine = mine !== '0';
  const rows = await getDb()
    .select({
      id: tasks.id,
      title: tasks.title,
      dueAt: tasks.dueAt,
      priority: tasks.priority,
      clientVisible: tasks.clientVisible,
      leadId: tasks.leadId,
      leadTitle: leads.title,
      projectId: tasks.projectId,
      projectName: projects.name,
      orgName: organizations.name,
      assignee: users.name,
    })
    .from(tasks)
    .leftJoin(leads, eq(leads.id, tasks.leadId))
    .leftJoin(projects, eq(projects.id, tasks.projectId))
    .leftJoin(organizations, eq(organizations.id, tasks.orgId))
    .leftJoin(users, eq(users.id, tasks.assigneeId))
    .where(and(eq(tasks.status, 'open'), onlyMine ? eq(tasks.assigneeId, actor.user.id) : undefined))
    .orderBy(sql`${tasks.dueAt} asc nulls last`, asc(tasks.createdAt))
    .limit(300);
  const now = new Date();
  return (
    <>
      <PageHeader
        title="Tasks"
        description="Open follow-ups across leads and projects. Client checklist items assigned to clients appear under “Everyone”."
        actions={
          <div className="flex gap-2 text-sm">
            <Link
              href="/app/tasks"
              className={`rounded-full px-3 py-1.5 ${onlyMine ? 'bg-ocean-900 text-white' : 'ring-ink/10 bg-white ring-1'}`}
            >
              Mine
            </Link>
            <Link
              href="/app/tasks?mine=0"
              className={`rounded-full px-3 py-1.5 ${!onlyMine ? 'bg-ocean-900 text-white' : 'ring-ink/10 bg-white ring-1'}`}
            >
              Everyone
            </Link>
          </div>
        }
      />
      <Card>
        {rows.length === 0 ? (
          <EmptyState icon={<CheckSquare className="size-6" />} title="No open tasks" />
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Task</Th>
                <Th>Related to</Th>
                <Th>Assignee</Th>
                <Th>Due</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {rows.map((t) => {
                const overdue = t.dueAt && t.dueAt < now;
                return (
                  <tr key={t.id}>
                    <Td>
                      <span className="font-medium">{t.title}</span>{' '}
                      {t.priority !== 'normal' ? <StatusBadge status={t.priority} /> : null}
                      {t.clientVisible ? (
                        <div className="text-ocean-700 text-xs">Client checklist</div>
                      ) : null}
                    </Td>
                    <Td>
                      {t.leadId ? (
                        <Link href={`/app/leads/${t.leadId}`} className="hover:text-ocean-700">
                          {t.leadTitle}
                        </Link>
                      ) : t.projectId ? (
                        <Link href={`/app/projects/${t.projectId}`} className="hover:text-ocean-700">
                          {t.orgName} · {t.projectName}
                        </Link>
                      ) : (
                        (t.orgName ?? '—')
                      )}
                    </Td>
                    <Td className="text-ink/70">{t.assignee ?? (t.clientVisible ? 'Client' : '—')}</Td>
                    <Td className={overdue ? 'font-semibold text-red-600' : 'text-ink/60'}>
                      {formatDate(t.dueAt)}
                    </Td>
                    <Td>
                      {staffCan(actor.staffRole, 'tasks:write') ? (
                        <ActionForm
                          action={setTaskStatus}
                          inline
                          submitLabel="Done"
                          submitSize="sm"
                          submitVariant="outline"
                        >
                          <input type="hidden" name="taskId" value={t.id} />
                          <input type="hidden" name="status" value="done" />
                        </ActionForm>
                      ) : null}
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        )}
      </Card>
    </>
  );
}
