import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Download } from 'lucide-react';
import { ActionForm } from '@/components/app/action-form';
import { StatusBadge } from '@/components/app/status-badge';
import { TaskList } from '@/components/app/task-list';
import { Badge, Card, CardHeader, PageHeader } from '@/components/ui/primitives';
import { Checkbox, Field, Input, Select, Textarea } from '@/components/ui/form';
import { milestoneStatusEnum, projectStatusEnum } from '@/db/schema';
import { pageRequireStaff } from '@/lib/auth/guards';
import { staffCan } from '@/lib/auth/permissions';
import { toBusinessInput } from '@/lib/dates';
import { formatDate, titleCase } from '@/lib/utils';
import { getProjectDetail } from '@/server/projects';
import { postClientUpdate } from '../../clients/actions';
import { createTask } from '../../tasks/actions';
import { addMilestone, setMilestoneStatus, updateProject } from '../actions';

export const metadata = { title: 'Project' };

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const actor = await pageRequireStaff('clients:read', `/app/projects/${id}`);
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const d = await getProjectDetail(id);
  if (!d) notFound();
  const { project: p, org } = d;
  const canWrite = staffCan(actor.staffRole, 'projects:write');
  const done = d.milestones.filter((m) => m.status === 'done').length;
  return (
    <>
      <PageHeader
        eyebrow={<Link href={`/app/clients/${org.id}?tab=projects`}>← {org.name}</Link>}
        title={p.name}
        description={`${done} of ${d.milestones.length} milestones complete · ${p.clientVisible ? 'visible in client portal' : 'hidden from client'}`}
        actions={<StatusBadge status={p.status} />}
      />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader
              title="Milestones"
              description="Client-visible milestones and their status appear in the client portal."
            />
            <ol className="divide-ink/6 divide-y">
              {d.milestones.map((m, i) => (
                <li key={m.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
                  <span className="bg-ink/5 flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold tabular-nums">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">
                      {m.title} {!m.clientVisible ? <Badge>Internal</Badge> : null}
                    </p>
                    <p className="text-ink/55 text-xs">
                      {m.description ? `${m.description} · ` : ''}Due {formatDate(m.dueDate)}
                      {m.completedAt ? ` · done ${formatDate(m.completedAt)}` : ''}
                    </p>
                  </div>
                  {canWrite ? (
                    <ActionForm
                      action={setMilestoneStatus}
                      inline
                      submitLabel="Set"
                      submitSize="sm"
                      submitVariant="outline"
                    >
                      <input type="hidden" name="projectId" value={p.id} />
                      <input type="hidden" name="milestoneId" value={m.id} />
                      <Select
                        name="status"
                        defaultValue={m.status}
                        className="h-8 w-auto text-xs"
                        aria-label={`Status of ${m.title}`}
                      >
                        {milestoneStatusEnum.enumValues.map((s) => (
                          <option key={s} value={s}>
                            {titleCase(s)}
                          </option>
                        ))}
                      </Select>
                    </ActionForm>
                  ) : (
                    <StatusBadge status={m.status} />
                  )}
                </li>
              ))}
              {d.milestones.length === 0 ? (
                <li className="text-ink/50 px-5 py-4 text-sm">No milestones yet.</li>
              ) : null}
            </ol>
            {canWrite ? (
              <div className="border-ink/8 border-t p-5">
                <ActionForm
                  action={addMilestone}
                  submitLabel="Add milestone"
                  resetOnSuccess
                  inline
                  submitSize="sm"
                >
                  <input type="hidden" name="projectId" value={p.id} />
                  <Input
                    name="title"
                    placeholder="Milestone title"
                    required
                    className="min-w-56 flex-1"
                    aria-label="Milestone title"
                  />
                  <Input name="dueDate" type="date" className="w-40" aria-label="Due date" />
                  <Checkbox name="clientVisible" defaultChecked label="Client-visible" className="pb-2.5" />
                </ActionForm>
              </div>
            ) : null}
          </Card>

          <Card>
            <CardHeader
              title="Tasks & client checklist"
              description="Client-visible tasks show up as the client’s onboarding checklist (e.g. access requests)."
            />
            <TaskList tasks={d.tasks} editable={staffCan(actor.staffRole, 'tasks:write')} />
            {staffCan(actor.staffRole, 'tasks:write') ? (
              <div className="border-ink/8 border-t p-5">
                <ActionForm action={createTask} submitLabel="Add task" resetOnSuccess submitSize="sm">
                  <input type="hidden" name="projectId" value={p.id} />
                  <input type="hidden" name="orgId" value={org.id} />
                  <Input name="title" placeholder="Task title" required aria-label="Task title" />
                  <div className="flex flex-wrap items-center gap-3">
                    <Input name="dueAt" type="date" className="w-44" aria-label="Due date" />
                    <Checkbox name="clientVisible" label="Client checklist item" />
                  </div>
                </ActionForm>
              </div>
            ) : null}
          </Card>

          <Card>
            <CardHeader title="Project updates" />
            {d.updates.length ? (
              <ul className="divide-ink/6 divide-y">
                {d.updates.map((u) => (
                  <li key={u.id} className="px-5 py-4">
                    <div className="text-ink/55 flex items-center gap-2 text-xs">
                      <Badge tone={u.clientVisible ? 'ocean' : 'neutral'}>
                        {u.clientVisible ? 'Client-visible' : 'Internal'}
                      </Badge>
                      {formatDate(u.createdAt, true)}
                    </div>
                    <p className="mt-1 font-semibold">{u.title}</p>
                    <p className="text-ink/75 mt-1 text-sm whitespace-pre-line">{u.body}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-ink/50 px-5 py-4 text-sm">No updates yet.</p>
            )}
            {canWrite ? (
              <div className="border-ink/8 border-t p-5">
                <ActionForm action={postClientUpdate} submitLabel="Post update" resetOnSuccess>
                  <input type="hidden" name="orgId" value={org.id} />
                  <input type="hidden" name="projectId" value={p.id} />
                  <input type="hidden" name="kind" value="update" />
                  <Input name="title" placeholder="Update title" required aria-label="Update title" />
                  <Textarea
                    name="body"
                    placeholder="What changed, what's next, anything you need from the client"
                    required
                    aria-label="Update body"
                  />
                  <Checkbox name="clientVisible" label="Publish to the client portal" />
                </ActionForm>
              </div>
            ) : null}
          </Card>
        </div>
        <div className="space-y-6">
          <Card>
            <CardHeader title="Project details" />
            <div className="p-5">
              <ActionForm action={updateProject} hideSubmit={!canWrite}>
                <input type="hidden" name="projectId" value={p.id} />
                <fieldset disabled={!canWrite} className="space-y-4">
                  <Field label="Name" htmlFor="name" required>
                    <Input id="name" name="name" defaultValue={p.name} required />
                  </Field>
                  <Field label="Status" htmlFor="status" required>
                    <Select id="status" name="status" defaultValue={p.status}>
                      {projectStatusEnum.enumValues.map((s) => (
                        <option key={s} value={s}>
                          {titleCase(s)}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Description" htmlFor="description">
                    <Textarea id="description" name="description" defaultValue={p.description} />
                  </Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Start" htmlFor="startDate">
                      <Input
                        id="startDate"
                        name="startDate"
                        type="date"
                        defaultValue={toBusinessInput(p.startDate, false)}
                      />
                    </Field>
                    <Field label="Target" htmlFor="targetDate">
                      <Input
                        id="targetDate"
                        name="targetDate"
                        type="date"
                        defaultValue={toBusinessInput(p.targetDate, false)}
                      />
                    </Field>
                  </div>
                  <Checkbox
                    name="clientVisible"
                    defaultChecked={p.clientVisible}
                    label="Visible in the client portal"
                  />
                </fieldset>
              </ActionForm>
            </div>
          </Card>
          <Card>
            <CardHeader title="Project files" description="Upload from the client’s Files tab." />
            {d.files.length ? (
              <ul className="divide-ink/6 divide-y">
                {d.files.map((f) => (
                  <li key={f.id} className="px-5 py-2.5 text-sm">
                    <a href={`/api/files/${f.id}`} className="hover:text-ocean-700 flex items-center gap-2">
                      <Download className="text-ink/40 size-4" aria-hidden="true" /> {f.name}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-ink/50 px-5 py-4 text-sm">No files linked.</p>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
