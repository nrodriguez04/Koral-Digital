import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Building2, CalendarClock, FileText, Mail, Phone } from 'lucide-react';
import { ActionForm } from '@/components/app/action-form';
import { StageBadge, StatusBadge } from '@/components/app/status-badge';
import { TaskList } from '@/components/app/task-list';
import { Alert, Badge, Card, CardHeader, DefinitionList, PageHeader } from '@/components/ui/primitives';
import { Field, Input, Select, Textarea } from '@/components/ui/form';
import { leadSourceEnum } from '@/db/schema';
import { pageRequireStaff } from '@/lib/auth/guards';
import { staffCan } from '@/lib/auth/permissions';
import { toBusinessInput } from '@/lib/dates';
import { DISCOVERY_QUESTIONS } from '@/lib/discovery';
import { LEAD_STAGES } from '@/lib/labels';
import { formatCents, formatDate, relativeTime, titleCase } from '@/lib/utils';
import { INDUSTRIES } from '@/lib/validation';
import { getLeadDetail, listStaff } from '@/server/leads';
import { createProposal } from '../../proposals/actions';
import {
  addActivity,
  addLeadTask,
  archiveLead,
  convertLeadToClient,
  saveDiscovery,
  scheduleMeeting,
  updateLeadDetails,
  updateLeadStage,
  updateMeetingStatus,
} from '../actions';

export const metadata = { title: 'Lead' };

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const actor = await pageRequireStaff('leads:read', `/app/leads/${id}`);
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const [detail, staff] = await Promise.all([getLeadDetail(id), listStaff()]);
  if (!detail) notFound();
  const { lead, company, contact, owner, activities, answers, tasks, meetings, proposals, companyContacts } = detail;
  const canWrite = staffCan(actor.staffRole, 'leads:write');
  const answerMap = Object.fromEntries(answers.map((a) => [a.questionKey, a.answer]));
  const answered = answers.filter((a) => a.answer.trim()).length;

  return (
    <>
      <PageHeader
        eyebrow={
          <Link href="/app/leads" className="hover:text-ink">
            ← Leads
          </Link>
        }
        title={company?.name ?? lead.title}
        description={lead.title}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {lead.isDemo ? <Badge tone="red">Synthetic dev data</Badge> : null}
            <StageBadge stage={lead.stage} />
            {lead.convertedOrgId ? (
              <Link href={`/app/clients/${lead.convertedOrgId}`} className="text-sm font-semibold text-ocean-700 hover:underline">
                View client workspace →
              </Link>
            ) : null}
          </div>
        }
      />

      {lead.notificationStatus === 'not_configured' ? (
        <Alert tone="warning" className="mb-6" title="No email notification was sent for this inquiry">
          Email delivery is not configured (RESEND_API_KEY / EMAIL_FROM). New inquiries still appear here — check this list
          daily until notifications are set up.
        </Alert>
      ) : lead.notificationStatus === 'failed' ? (
        <Alert tone="error" className="mb-6" title="Notification email failed to send">
          The inquiry was saved, but the staff notification email could not be delivered. Check your email provider.
        </Alert>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {canWrite ? (
            <Card>
              <CardHeader title="Pipeline stage" description="Moving a lead logs the change in its timeline and the audit log." />
              <div className="p-5">
                <ActionForm action={updateLeadStage} submitLabel="Update stage" inline>
                  <input type="hidden" name="leadId" value={lead.id} />
                  <label className="flex flex-col gap-1 text-xs font-medium text-ink/60">
                    Stage
                    <Select name="stage" defaultValue={lead.stage} className="min-w-44">
                      {LEAD_STAGES.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </Select>
                  </label>
                  <label className="flex min-w-56 flex-1 flex-col gap-1 text-xs font-medium text-ink/60">
                    Lost reason (required when lost)
                    <Input name="lostReason" defaultValue={lead.lostReason ?? ''} />
                  </label>
                </ActionForm>
              </div>
            </Card>
          ) : null}

          <Card>
            <CardHeader title="Activity" description="Notes, calls, emails and system events, newest first." />
            {canWrite ? (
              <div className="border-b border-ink/8 p-5">
                <ActionForm action={addActivity} submitLabel="Log activity" resetOnSuccess>
                  <input type="hidden" name="leadId" value={lead.id} />
                  <div className="grid gap-3 sm:grid-cols-4">
                    <Select name="type" defaultValue="note" aria-label="Activity type">
                      <option value="note">Note</option>
                      <option value="call">Call</option>
                      <option value="email">Email</option>
                      <option value="meeting">Meeting</option>
                    </Select>
                    <Textarea name="body" required placeholder="What happened? What did you learn?" className="min-h-20 sm:col-span-3" aria-label="Activity details" />
                  </div>
                </ActionForm>
              </div>
            ) : null}
            <ol className="divide-y divide-ink/6">
              {activities.map((a) => (
                <li key={a.id} className="px-5 py-4">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-ink/55">
                    <Badge tone={a.type === 'form_submission' ? 'ocean' : a.type === 'stage_change' ? 'violet' : 'neutral'}>{titleCase(a.type)}</Badge>
                    <span>{a.actorName ?? a.actorEmail ?? 'System'}</span>
                    <span>·</span>
                    <time dateTime={a.createdAt.toISOString()} title={formatDate(a.createdAt, true)}>
                      {relativeTime(a.createdAt)}
                    </time>
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed whitespace-pre-line text-ink/85">{a.body}</p>
                </li>
              ))}
            </ol>
          </Card>

          <Card>
            <CardHeader
              title="Discovery checklist"
              description={`${answered} of ${DISCOVERY_QUESTIONS.length} answered. Use during or right after the consultation.`}
            />
            <details className="group" open={answered > 0 && answered < DISCOVERY_QUESTIONS.length}>
              <summary className="cursor-pointer px-5 py-3 text-sm font-semibold text-ocean-700">Open checklist</summary>
              <div className="p-5 pt-0">
                {canWrite ? (
                  <ActionForm action={saveDiscovery} submitLabel="Save discovery">
                    <input type="hidden" name="leadId" value={lead.id} />
                    {DISCOVERY_QUESTIONS.map((q) => (
                      <Field key={q.key} label={q.label} htmlFor={`q_${q.key}`} hint={q.prompt}>
                        <Textarea id={`q_${q.key}`} name={`q_${q.key}`} defaultValue={answerMap[q.key] ?? ''} className="min-h-16" />
                      </Field>
                    ))}
                  </ActionForm>
                ) : (
                  <DefinitionList items={DISCOVERY_QUESTIONS.map((q) => ({ label: q.label, value: answerMap[q.key] || '—' }))} />
                )}
              </div>
            </details>
          </Card>

          <Card>
            <CardHeader
              title="Proposals"
              action={
                staffCan(actor.staffRole, 'proposals:write') ? (
                  <ActionForm action={createProposal} hideSubmit inline>
                    <input type="hidden" name="leadId" value={lead.id} />
                    <Select name="template" defaultValue="pilot" aria-label="Proposal template" className="h-9 w-auto text-xs">
                      <option value="pilot">Lead-to-Booked template</option>
                      <option value="blank">Blank</option>
                    </Select>
                    <button type="submit" className="h-9 rounded-lg bg-ocean-500 px-3 text-xs font-semibold text-white hover:bg-ocean-600">
                      Draft proposal
                    </button>
                  </ActionForm>
                ) : null
              }
            />
            {proposals.length === 0 ? (
              <p className="px-5 py-4 text-sm text-ink/50">No proposals yet.</p>
            ) : (
              <ul className="divide-y divide-ink/6">
                {proposals.map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-3 px-5 py-3">
                    <Link href={`/app/proposals/${p.id}`} className="flex items-center gap-2 text-sm font-medium hover:text-ocean-700">
                      <FileText className="size-4 text-ink/40" aria-hidden="true" /> {p.number} · {p.title}
                    </Link>
                    <StatusBadge status={p.status} />
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Contact" />
            <div className="space-y-2 p-5 text-sm">
              <p className="font-semibold">{contact?.fullName ?? '—'}</p>
              {contact?.email ? (
                <a href={`mailto:${contact.email}`} className="flex items-center gap-2 text-ocean-700 hover:underline">
                  <Mail className="size-4" aria-hidden="true" /> {contact.email}
                </a>
              ) : null}
              {contact?.phone ? (
                <a href={`tel:${contact.phone}`} className="flex items-center gap-2 text-ocean-700 hover:underline">
                  <Phone className="size-4" aria-hidden="true" /> {contact.phone}
                </a>
              ) : null}
              {company ? (
                <Link href={`/app/companies/${company.id}`} className="flex items-center gap-2 text-ink/70 hover:text-ink">
                  <Building2 className="size-4" aria-hidden="true" /> {company.name}
                  {company.domain ? ` · ${company.domain}` : ''}
                </Link>
              ) : null}
              {companyContacts.length > 1 ? <p className="text-xs text-ink/50">{companyContacts.length} contacts at this company</p> : null}
              <div className="flex flex-wrap gap-1 pt-1">
                <Badge tone={lead.consentEmail ? 'green' : 'neutral'}>Email follow-up: {lead.consentEmail ? 'yes' : 'no'}</Badge>
                <Badge tone={lead.consentSms ? 'green' : 'neutral'}>SMS: {lead.consentSms ? 'yes' : 'no'}</Badge>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader title="Inquiry" />
            <DefinitionList
              items={[
                { label: 'Problem', value: lead.topProblem },
                { label: 'Message', value: lead.message ? <span className="whitespace-pre-line">{lead.message}</span> : null },
                { label: 'Current CRM', value: lead.currentCrm },
                { label: 'Leads / month', value: lead.monthlyLeads },
                { label: 'Interest', value: lead.serviceInterest },
                { label: 'Submissions', value: lead.submissionCount },
                { label: 'UTM', value: [lead.utmSource, lead.utmMedium, lead.utmCampaign].filter(Boolean).join(' / ') || null },
                { label: 'Landing page', value: lead.landingPath },
                { label: 'Referrer', value: lead.referrer },
                { label: 'Received', value: formatDate(lead.createdAt, true) },
              ]}
            />
          </Card>

          <Card>
            <CardHeader title="Details" />
            <div className="p-5">
              {canWrite ? (
                <ActionForm action={updateLeadDetails}>
                  <input type="hidden" name="leadId" value={lead.id} />
                  <Field label="Title" htmlFor="title" required>
                    <Input id="title" name="title" defaultValue={lead.title} required />
                  </Field>
                  <Field label="Owner" htmlFor="ownerId" required>
                    <Select id="ownerId" name="ownerId" defaultValue={lead.ownerId ?? ''}>
                      <option value="">Unassigned</option>
                      {staff.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name ?? s.email}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Next action" htmlFor="nextAction">
                    <Input id="nextAction" name="nextAction" defaultValue={lead.nextAction ?? ''} />
                  </Field>
                  <Field label="Next action due (Central time)" htmlFor="nextActionDueAt">
                    <Input id="nextActionDueAt" name="nextActionDueAt" type="datetime-local" defaultValue={toBusinessInput(lead.nextActionDueAt)} />
                  </Field>
                  <Field label="Estimated value (USD)" htmlFor="estimatedValue">
                    <Input id="estimatedValue" name="estimatedValue" inputMode="decimal" defaultValue={lead.estimatedValueCents ? String(lead.estimatedValueCents / 100) : ''} />
                  </Field>
                  <Field label="Industry" htmlFor="industry">
                    <Select id="industry" name="industry" defaultValue={lead.industry ?? ''}>
                      <option value="">—</option>
                      {INDUSTRIES.map((i) => (
                        <option key={i}>{i}</option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Source" htmlFor="source" required>
                    <Select id="source" name="source" defaultValue={lead.source}>
                      {leadSourceEnum.enumValues.map((s) => (
                        <option key={s} value={s}>
                          {titleCase(s)}
                        </option>
                      ))}
                    </Select>
                  </Field>
                </ActionForm>
              ) : (
                <DefinitionList
                  items={[
                    { label: 'Owner', value: owner?.name ?? owner?.email ?? 'Unassigned' },
                    { label: 'Next action', value: lead.nextAction },
                    { label: 'Due', value: formatDate(lead.nextActionDueAt, true) },
                    { label: 'Value', value: formatCents(lead.estimatedValueCents) },
                  ]}
                />
              )}
            </div>
          </Card>

          <Card>
            <CardHeader title="Tasks" />
            <TaskList tasks={tasks} editable={staffCan(actor.staffRole, 'tasks:write')} />
            {staffCan(actor.staffRole, 'tasks:write') ? (
              <div className="border-t border-ink/8 p-5">
                <ActionForm action={addLeadTask} submitLabel="Add task" resetOnSuccess submitSize="sm">
                  <input type="hidden" name="leadId" value={lead.id} />
                  <Input name="title" placeholder="e.g. Send discovery recap" required aria-label="Task title" />
                  <div className="grid grid-cols-2 gap-2">
                    <Input name="dueAt" type="date" aria-label="Due date" />
                    <Select name="priority" defaultValue="normal" aria-label="Priority">
                      <option value="low">Low</option>
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </Select>
                  </div>
                </ActionForm>
              </div>
            ) : null}
          </Card>

          <Card>
            <CardHeader title="Consultations & meetings" />
            {meetings.length ? (
              <ul className="divide-y divide-ink/6">
                {meetings.map((m) => (
                  <li key={m.id} className="space-y-2 px-5 py-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="flex items-center gap-2 text-sm font-medium">
                        <CalendarClock className="size-4 text-ink/40" aria-hidden="true" /> {m.title}
                      </p>
                      <StatusBadge status={m.status} />
                    </div>
                    <p className="text-xs text-ink/55">
                      {formatDate(m.scheduledAt, true)} · {m.durationMinutes} min{m.location ? ` · ${m.location}` : ''}
                    </p>
                    {canWrite && m.status === 'scheduled' ? (
                      <ActionForm action={updateMeetingStatus} inline submitLabel="Update" submitSize="sm" submitVariant="outline">
                        <input type="hidden" name="meetingId" value={m.id} />
                        <Select name="status" defaultValue="completed" className="h-8 w-auto text-xs" aria-label="Meeting outcome">
                          <option value="completed">Completed</option>
                          <option value="no_show">No-show</option>
                          <option value="cancelled">Cancelled</option>
                        </Select>
                      </ActionForm>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-5 py-4 text-sm text-ink/50">No meetings recorded.</p>
            )}
            {canWrite ? (
              <div className="border-t border-ink/8 p-5">
                <ActionForm action={scheduleMeeting} submitLabel="Record meeting" resetOnSuccess submitSize="sm">
                  <input type="hidden" name="leadId" value={lead.id} />
                  <Input name="title" defaultValue="Free consultation" required aria-label="Meeting title" />
                  <div className="grid grid-cols-2 gap-2">
                    <Input name="scheduledAt" type="datetime-local" required aria-label="Date and time (Central)" />
                    <Input name="durationMinutes" type="number" defaultValue={30} min={10} max={480} aria-label="Duration in minutes" />
                  </div>
                  <Input name="location" placeholder="Video link or address" aria-label="Location" />
                </ActionForm>
              </div>
            ) : null}
          </Card>

          {staffCan(actor.staffRole, 'clients:convert') && !lead.convertedOrgId ? (
            <Card>
              <CardHeader title="Convert to client" description="Creates a client workspace. Sent/accepted proposals become visible to the client." />
              <div className="p-5">
                <ActionForm action={convertLeadToClient} submitLabel="Create client workspace" confirm="Create a client workspace for this lead and mark it won?">
                  <input type="hidden" name="leadId" value={lead.id} />
                  <Field label="Client organization name" htmlFor="orgName" required>
                    <Input id="orgName" name="orgName" defaultValue={company?.name ?? ''} required />
                  </Field>
                  <Field label="Service package" htmlFor="servicePackage">
                    <Input id="servicePackage" name="servicePackage" placeholder="e.g. Lead-to-Booked pilot + support" />
                  </Field>
                </ActionForm>
              </div>
            </Card>
          ) : null}

          {staffCan(actor.staffRole, 'settings:write') ? (
            <ActionForm action={archiveLead} submitLabel="Archive lead" submitVariant="ghost" submitSize="sm" confirm="Archive this lead? It will be hidden from lists (soft delete).">
              <input type="hidden" name="leadId" value={lead.id} />
            </ActionForm>
          ) : null}
        </div>
      </div>
    </>
  );
}
