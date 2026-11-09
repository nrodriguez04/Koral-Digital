import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Download, Trash2 } from 'lucide-react';
import { ActionForm } from '@/components/app/action-form';
import { StatusBadge } from '@/components/app/status-badge';
import { Tabs } from '@/components/app/tabs';
import { Alert, Badge, Card, CardHeader, EmptyState, PageHeader, Table, Td, Th } from '@/components/ui/primitives';
import { Checkbox, Field, Input, Select, Textarea } from '@/components/ui/form';
import { integrationStatusEnum, invoiceStatusEnum, orgStatusEnum } from '@/db/schema';
import { pageRequireStaff } from '@/lib/auth/guards';
import { isDescopeManagementConfigured } from '@/lib/auth/descope';
import { staffCan } from '@/lib/auth/permissions';
import { isDescopeConfigured } from '@/lib/env';
import { PROJECT_TEMPLATES } from '@/lib/project-templates';
import { ALLOWED_UPLOAD_EXTENSIONS, storageStatus } from '@/lib/storage';
import { formatCents, formatDate, relativeTime, titleCase } from '@/lib/utils';
import { getClientDetail } from '@/server/clients';
import {
  changeMemberRole,
  createInvoice,
  createProject,
  deleteClientFile,
  inviteClientMember,
  postClientUpdate,
  revokeInvitation,
  saveIntegration,
  updateClient,
  updateInvoice,
  uploadClientFile,
} from '../actions';

export const metadata = { title: 'Client' };

const TABS = ['overview', 'team', 'projects', 'billing', 'files', 'integrations', 'updates'] as const;

export default async function ClientDetailPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ tab?: string }> }) {
  const { id } = await params;
  const { tab: rawTab } = await searchParams;
  const actor = await pageRequireStaff('clients:read', `/app/clients/${id}`);
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const d = await getClientDetail(id);
  if (!d) notFound();
  const tab = (TABS as readonly string[]).includes(rawTab ?? '') ? rawTab! : 'overview';
  const can = (p: Parameters<typeof staffCan>[1]) => staffCan(actor.staffRole, p);
  const storage = storageStatus();
  const { org } = d;
  return (
    <>
      <PageHeader
        eyebrow={<Link href="/app/clients">← Clients</Link>}
        title={org.name}
        description={`Portal: /portal/${org.slug}${org.servicePackage ? ` · ${org.servicePackage}` : ''}`}
        actions={
          <>
            {org.isDemo ? <Badge tone="red">Synthetic dev data</Badge> : null}
            <StatusBadge status={org.status} />
            {org.leadId ? (
              <Link href={`/app/leads/${org.leadId}`} className="text-sm font-semibold text-ocean-700 hover:underline">
                Original lead
              </Link>
            ) : null}
          </>
        }
      />
      <Tabs
        basePath={`/app/clients/${org.id}`}
        active={tab}
        tabs={[
          { key: 'overview', label: 'Overview' },
          { key: 'team', label: 'Portal access', count: d.members.length },
          { key: 'projects', label: 'Projects', count: d.projects.length },
          { key: 'billing', label: 'Proposals & invoices', count: d.invoices.length },
          { key: 'files', label: 'Files', count: d.files.length },
          { key: 'integrations', label: 'Tools', count: d.integrations.length },
          { key: 'updates', label: 'Updates', count: d.updates.length },
        ]}
      />

      {tab === 'overview' ? (
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader title="Client profile" />
            <div className="p-5">
              <ActionForm action={updateClient} hideSubmit={!can('clients:write')}>
                <input type="hidden" name="orgId" value={org.id} />
                <fieldset disabled={!can('clients:write')} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Name" htmlFor="name" required>
                      <Input id="name" name="name" defaultValue={org.name} required />
                    </Field>
                    <Field label="Status" htmlFor="status" required>
                      <Select id="status" name="status" defaultValue={org.status}>
                        {orgStatusEnum.enumValues.map((s) => (
                          <option key={s} value={s}>
                            {titleCase(s)}
                          </option>
                        ))}
                      </Select>
                    </Field>
                  </div>
                  <Field label="Service package" htmlFor="servicePackage">
                    <Input id="servicePackage" name="servicePackage" defaultValue={org.servicePackage ?? ''} />
                  </Field>
                  <Field label="Internal notes (never shown to the client)" htmlFor="notes">
                    <Textarea id="notes" name="notes" defaultValue={org.notes ?? ''} />
                  </Field>
                </fieldset>
              </ActionForm>
            </div>
          </Card>
          <Card>
            <CardHeader title="Support requests" />
            {d.tickets.length ? (
              <ul className="divide-y divide-ink/6">
                {d.tickets.map((t) => (
                  <li key={t.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
                    <Link href={`/app/tickets/${t.id}`} className="font-medium hover:text-ocean-700">
                      {t.subject}
                    </Link>
                    <StatusBadge status={t.status} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-5 py-4 text-sm text-ink/50">No support requests yet.</p>
            )}
          </Card>
        </div>
      ) : null}

      {tab === 'team' ? (
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader title="Members" description="People who can sign in to this client’s portal. They only ever see this organization." />
            {d.members.length ? (
              <Table>
                <thead>
                  <tr>
                    <Th>Person</Th>
                    <Th>Role</Th>
                    <Th>Last sign-in</Th>
                    <Th />
                  </tr>
                </thead>
                <tbody>
                  {d.members.map((m) => (
                    <tr key={m.id}>
                      <Td>
                        <span className="font-medium">{m.name ?? m.email}</span>
                        <div className="text-xs text-ink/50">{m.email}</div>
                      </Td>
                      <Td>
                        <Badge tone="ocean">{titleCase(m.role)}</Badge>
                      </Td>
                      <Td className="text-ink/60">{m.lastLoginAt ? relativeTime(m.lastLoginAt) : 'Never'}</Td>
                      <Td>
                        {can('members:manage') ? (
                          <ActionForm action={changeMemberRole} inline submitLabel="Apply" submitSize="sm" submitVariant="outline">
                            <input type="hidden" name="orgId" value={org.id} />
                            <input type="hidden" name="membershipId" value={m.id} />
                            <Select name="role" defaultValue={m.role} className="h-8 w-auto text-xs" aria-label={`Role for ${m.email}`}>
                              <option value="client_owner">Client owner</option>
                              <option value="client_member">Client member</option>
                              <option value="read_only">Read only</option>
                              <option value="remove">Remove access</option>
                            </Select>
                          </ActionForm>
                        ) : null}
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            ) : (
              <EmptyState title="No one has portal access yet">Invite the client’s owner or office manager to get started.</EmptyState>
            )}
            {d.pendingInvites.length ? (
              <div className="border-t border-ink/8 p-5">
                <p className="text-sm font-semibold">Pending invitations</p>
                <ul className="mt-2 space-y-2">
                  {d.pendingInvites.map((i) => (
                    <li key={i.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                      <span>
                        {i.email} · {titleCase(i.memberRole ?? '')} · {i.delivery === 'descope_email' ? 'emailed by Descope' : 'manual link'} · expires {formatDate(i.expiresAt)}
                      </span>
                      {can('members:manage') ? (
                        <ActionForm action={revokeInvitation} hideSubmit inline>
                          <input type="hidden" name="orgId" value={org.id} />
                          <input type="hidden" name="invitationId" value={i.id} />
                          <button type="submit" className="text-xs font-semibold text-red-600 hover:underline">
                            Revoke
                          </button>
                        </ActionForm>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </Card>
          {can('members:manage') ? (
            <Card>
              <CardHeader title="Invite to portal" />
              <div className="space-y-4 p-5">
                {!isDescopeConfigured() ? (
                  <Alert tone="warning" title="Descope is not configured">
                    Invitations can be created, but nobody can sign in until NEXT_PUBLIC_DESCOPE_PROJECT_ID is set.
                  </Alert>
                ) : !isDescopeManagementConfigured() ? (
                  <Alert tone="info">
                    Without DESCOPE_MANAGEMENT_KEY, you will get a single-use link to send yourself (shown once).
                  </Alert>
                ) : null}
                <ActionForm action={inviteClientMember} submitLabel="Create invitation" resetOnSuccess>
                  <input type="hidden" name="orgId" value={org.id} />
                  <Field label="Email" htmlFor="invite-email" required>
                    <Input id="invite-email" name="email" type="email" required />
                  </Field>
                  <Field label="Name" htmlFor="invite-name">
                    <Input id="invite-name" name="name" />
                  </Field>
                  <Field label="Role" htmlFor="invite-role" required>
                    <Select id="invite-role" name="role" defaultValue="client_owner">
                      <option value="client_owner">Client owner (can manage their team)</option>
                      <option value="client_member">Client member</option>
                      <option value="read_only">Read only</option>
                    </Select>
                  </Field>
                </ActionForm>
              </div>
            </Card>
          ) : null}
        </div>
      ) : null}

      {tab === 'projects' ? (
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader title="Projects" />
            {d.projects.length ? (
              <ul className="divide-y divide-ink/6">
                {d.projects.map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-3 px-5 py-3">
                    <div>
                      <Link href={`/app/projects/${p.id}`} className="font-semibold hover:text-ocean-700">
                        {p.name}
                      </Link>
                      <p className="text-xs text-ink/50">
                        {formatDate(p.startDate)} → {formatDate(p.targetDate)} {p.clientVisible ? '' : '· hidden from client'}
                      </p>
                    </div>
                    <StatusBadge status={p.status} />
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState title="No projects yet">Create one from a template to get milestones and an access checklist.</EmptyState>
            )}
          </Card>
          {can('projects:write') ? (
            <Card>
              <CardHeader title="New project" />
              <div className="p-5">
                <ActionForm action={createProject} submitLabel="Create project">
                  <input type="hidden" name="orgId" value={org.id} />
                  <Field label="Name" htmlFor="pname" required>
                    <Input id="pname" name="name" defaultValue={`${org.name} — Lead-to-Booked pilot`} required />
                  </Field>
                  <Field label="Template" htmlFor="template" required>
                    <Select id="template" name="template" defaultValue="lead-to-booked">
                      {Object.entries(PROJECT_TEMPLATES).map(([k, t]) => (
                        <option key={k} value={k}>
                          {t.name}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Start date" htmlFor="startDate">
                    <Input id="startDate" name="startDate" type="date" />
                  </Field>
                  <Field label="Linked proposal" htmlFor="proposalId">
                    <Select id="proposalId" name="proposalId" defaultValue="">
                      <option value="">None</option>
                      {d.proposals.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.number} · {p.title}
                        </option>
                      ))}
                    </Select>
                  </Field>
                </ActionForm>
              </div>
            </Card>
          ) : null}
        </div>
      ) : null}

      {tab === 'billing' ? (
        <div className="space-y-6">
          <Alert tone="info" title="How payments work today">
            Koral does not process cards here. Attach a hosted payment link (e.g. a Stripe Payment Link or QuickBooks invoice URL) for the client to pay, and record
            payments manually with a note. Invoice status is visible to the client in their portal.
          </Alert>
          <Card>
            <CardHeader title="Proposals visible to this client" description="Sent and accepted proposals linked to this workspace." />
            {d.proposals.length ? (
              <ul className="divide-y divide-ink/6">
                {d.proposals.map((p) => (
                  <li key={p.id} className="flex items-center justify-between px-5 py-3 text-sm">
                    <Link href={`/app/proposals/${p.id}`} className="font-medium hover:text-ocean-700">
                      {p.number} · {p.title}
                    </Link>
                    <StatusBadge status={p.status} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-5 py-4 text-sm text-ink/50">No proposals linked.</p>
            )}
          </Card>
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader title="Invoices" />
              {d.invoices.length ? (
                <ul className="divide-y divide-ink/6">
                  {d.invoices.map((inv) => (
                    <li key={inv.id} className="space-y-2 px-5 py-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-semibold">
                          {inv.number} · {inv.description}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold tabular-nums">{formatCents(inv.amountCents)}</span>
                          <StatusBadge status={inv.status} />
                        </div>
                      </div>
                      <p className="text-xs text-ink/55">
                        Due {formatDate(inv.dueDate)}
                        {inv.paymentUrl ? ' · payment link attached' : ' · no payment link'}
                        {inv.paymentNote ? ` · ${inv.paymentNote}` : ''}
                      </p>
                      {can('invoices:write') ? (
                        <ActionForm action={updateInvoice} inline submitLabel="Update" submitSize="sm" submitVariant="outline">
                          <input type="hidden" name="orgId" value={org.id} />
                          <input type="hidden" name="invoiceId" value={inv.id} />
                          <Select name="status" defaultValue={inv.status} className="h-8 w-auto text-xs" aria-label="Invoice status">
                            {invoiceStatusEnum.enumValues.map((s) => (
                              <option key={s} value={s}>
                                {titleCase(s)}
                              </option>
                            ))}
                          </Select>
                          <Input name="paymentUrl" type="url" defaultValue={inv.paymentUrl ?? ''} placeholder="https://payment link" className="h-8 w-56 text-xs" aria-label="Payment link" />
                          <Input name="paymentNote" defaultValue={inv.paymentNote ?? ''} placeholder="Payment note (e.g. ACH received 11/9)" className="h-8 w-56 text-xs" aria-label="Payment note" />
                        </ActionForm>
                      ) : null}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="px-5 py-4 text-sm text-ink/50">No invoices yet.</p>
              )}
            </Card>
            {can('invoices:write') ? (
              <Card>
                <CardHeader title="New invoice record" />
                <div className="p-5">
                  <ActionForm action={createInvoice} submitLabel="Create invoice" resetOnSuccess>
                    <input type="hidden" name="orgId" value={org.id} />
                    <Field label="Description" htmlFor="inv-desc" required>
                      <Input id="inv-desc" name="description" defaultValue="Project deposit (50%)" required />
                    </Field>
                    <Field label="Amount (USD)" htmlFor="inv-amount" required>
                      <Input id="inv-amount" name="amount" inputMode="decimal" required />
                    </Field>
                    <Field label="Due date" htmlFor="inv-due">
                      <Input id="inv-due" name="dueDate" type="date" />
                    </Field>
                    <Field label="Hosted payment link" htmlFor="inv-url" hint="Must start with https://">
                      <Input id="inv-url" name="paymentUrl" type="url" />
                    </Field>
                    <Field label="Proposal" htmlFor="inv-prop">
                      <Select id="inv-prop" name="proposalId" defaultValue="">
                        <option value="">None</option>
                        {d.proposals.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.number}
                          </option>
                        ))}
                      </Select>
                    </Field>
                  </ActionForm>
                </div>
              </Card>
            ) : null}
          </div>
        </div>
      ) : null}

      {tab === 'files' ? (
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader title="Files" description="Client-visible files appear in the client portal. Downloads use short-lived signed links." />
            {d.files.length ? (
              <ul className="divide-y divide-ink/6">
                {d.files.map((f) => (
                  <li key={f.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
                    <a href={`/api/files/${f.id}`} className="flex items-center gap-2 font-medium hover:text-ocean-700">
                      <Download className="size-4 text-ink/40" aria-hidden="true" /> {f.name}
                    </a>
                    <span className="flex items-center gap-2 text-xs text-ink/55">
                      {(f.sizeBytes / 1024).toFixed(0)} KB · {formatDate(f.createdAt)}
                      <Badge tone={f.visibility === 'client' ? 'ocean' : 'neutral'}>{f.visibility === 'client' ? 'Client-visible' : 'Internal'}</Badge>
                      {can('files:write') ? (
                        <ActionForm action={deleteClientFile} hideSubmit inline confirm={`Delete ${f.name}?`}>
                          <input type="hidden" name="orgId" value={org.id} />
                          <input type="hidden" name="fileId" value={f.id} />
                          <button type="submit" aria-label={`Delete ${f.name}`} className="rounded p-1 text-ink/40 hover:bg-red-50 hover:text-red-600">
                            <Trash2 className="size-4" />
                          </button>
                        </ActionForm>
                      ) : null}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-5 py-4 text-sm text-ink/50">No files yet.</p>
            )}
          </Card>
          {can('files:write') ? (
            <Card>
              <CardHeader title="Upload" />
              <div className="space-y-4 p-5">
                {!storage.ready ? <Alert tone="warning" title="Uploads unavailable">{storage.reason}</Alert> : null}
                <ActionForm action={uploadClientFile} submitLabel="Upload file" resetOnSuccess>
                  <input type="hidden" name="orgId" value={org.id} />
                  <Field label="File" htmlFor="file" required hint={`Max 4 MB. Allowed: ${ALLOWED_UPLOAD_EXTENSIONS.join(', ')}`}>
                    <input id="file" name="file" type="file" required className="block w-full text-sm" accept={ALLOWED_UPLOAD_EXTENSIONS.map((e) => `.${e}`).join(',')} />
                  </Field>
                  <Field label="Visibility" htmlFor="visibility" required>
                    <Select id="visibility" name="visibility" defaultValue="client">
                      <option value="client">Shared with client</option>
                      <option value="internal">Internal only</option>
                    </Select>
                  </Field>
                  <Field label="Project" htmlFor="file-project">
                    <Select id="file-project" name="projectId" defaultValue="">
                      <option value="">None</option>
                      {d.projects.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </Select>
                  </Field>
                </ActionForm>
              </div>
            </Card>
          ) : null}
        </div>
      ) : null}

      {tab === 'integrations' ? (
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader title="Client tools" description="Metadata only — which systems the client uses and their connection status. Never store credentials here." />
            {d.integrations.length ? (
              <ul className="divide-y divide-ink/6">
                {d.integrations.map((i) => (
                  <li key={i.id} className="flex items-start justify-between gap-3 px-5 py-3 text-sm">
                    <div>
                      <p className="font-semibold">{i.tool}</p>
                      <p className="text-xs text-ink/55">
                        {titleCase(i.category)}
                        {i.notes ? ` · ${i.notes}` : ''}
                      </p>
                    </div>
                    <StatusBadge status={i.status} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-5 py-4 text-sm text-ink/50">No tools recorded yet.</p>
            )}
          </Card>
          {can('clients:write') ? (
            <Card>
              <CardHeader title="Add or update a tool" />
              <div className="p-5">
                <ActionForm action={saveIntegration} submitLabel="Save tool" resetOnSuccess>
                  <input type="hidden" name="orgId" value={org.id} />
                  <Field label="Existing record" htmlFor="integrationId">
                    <Select id="integrationId" name="integrationId" defaultValue="">
                      <option value="">— New —</option>
                      {d.integrations.map((i) => (
                        <option key={i.id} value={i.id}>
                          {i.tool}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Tool" htmlFor="tool" required>
                    <Input id="tool" name="tool" placeholder="e.g. JobNimbus" required />
                  </Field>
                  <Field label="Category" htmlFor="category" required>
                    <Select id="category" name="category" defaultValue="crm">
                      {['crm', 'phone', 'calendar', 'forms', 'ads', 'email', 'accounting', 'automation', 'other'].map((c) => (
                        <option key={c} value={c}>
                          {titleCase(c)}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Status" htmlFor="istatus" required>
                    <Select id="istatus" name="status" defaultValue="not_connected">
                      {integrationStatusEnum.enumValues.map((s) => (
                        <option key={s} value={s}>
                          {titleCase(s)}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Notes" htmlFor="inotes" hint="e.g. plan tier, API availability, who owns the account. No passwords or keys.">
                    <Textarea id="inotes" name="notes" />
                  </Field>
                </ActionForm>
              </div>
            </Card>
          ) : null}
        </div>
      ) : null}

      {tab === 'updates' ? (
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader title="Updates & meeting notes" />
            {d.updates.length ? (
              <ul className="divide-y divide-ink/6">
                {d.updates.map((u) => (
                  <li key={u.id} className="px-5 py-4">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-ink/55">
                      <Badge tone={u.clientVisible ? 'ocean' : 'neutral'}>{u.clientVisible ? 'Client-visible' : 'Internal'}</Badge>
                      <span>{titleCase(u.kind)}</span>·<span>{formatDate(u.createdAt, true)}</span>
                    </div>
                    <p className="mt-1.5 font-semibold">{u.title}</p>
                    <p className="mt-1 text-sm whitespace-pre-line text-ink/75">{u.body}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-5 py-4 text-sm text-ink/50">No updates yet.</p>
            )}
          </Card>
          {can('projects:write') ? (
            <Card>
              <CardHeader title="Post an update" />
              <div className="p-5">
                <ActionForm action={postClientUpdate} submitLabel="Post update" resetOnSuccess>
                  <input type="hidden" name="orgId" value={org.id} />
                  <Field label="Type" htmlFor="kind" required>
                    <Select id="kind" name="kind" defaultValue="update">
                      <option value="update">Progress update</option>
                      <option value="meeting_notes">Meeting notes</option>
                      <option value="access_request">Access request</option>
                    </Select>
                  </Field>
                  <Field label="Project" htmlFor="u-project">
                    <Select id="u-project" name="projectId" defaultValue="">
                      <option value="">General</option>
                      {d.projects.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Title" htmlFor="u-title" required>
                    <Input id="u-title" name="title" required />
                  </Field>
                  <Field label="Body" htmlFor="u-body" required>
                    <Textarea id="u-body" name="body" required />
                  </Field>
                  <Checkbox name="clientVisible" label="Publish to the client portal" />
                </ActionForm>
              </div>
            </Card>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
