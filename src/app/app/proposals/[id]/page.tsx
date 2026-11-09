import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Printer, Trash2 } from 'lucide-react';
import { ActionForm } from '@/components/app/action-form';
import { StatusBadge } from '@/components/app/status-badge';
import { ButtonLink } from '@/components/ui/button';
import { Alert, Card, CardHeader, PageHeader } from '@/components/ui/primitives';
import { Field, Input, Select, Textarea } from '@/components/ui/form';
import { pageRequireStaff } from '@/lib/auth/guards';
import { staffCan } from '@/lib/auth/permissions';
import { toBusinessInput } from '@/lib/dates';
import { formatCents, formatDate } from '@/lib/utils';
import { getProposalWithItems } from '@/server/proposals';
import {
  addProposalItem,
  duplicateProposal,
  removeProposalItem,
  setProposalStatus,
  updateProposal,
} from '../actions';

export const metadata = { title: 'Proposal' };

export default async function ProposalEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const actor = await pageRequireStaff('leads:read', `/app/proposals/${id}`);
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const data = await getProposalWithItems(id);
  if (!data) notFound();
  const { proposal: p, items, lead, company, totals, org } = data;
  const canWrite = staffCan(actor.staffRole, 'proposals:write');
  const editable = canWrite && p.status === 'draft';
  return (
    <>
      <PageHeader
        eyebrow={
          lead ? (
            <Link href={`/app/leads/${lead.id}`} className="hover:text-ink">
              ← {company?.name ?? 'Lead'}
            </Link>
          ) : (
            <Link href="/app/proposals">← Proposals</Link>
          )
        }
        title={`${p.number} · ${p.title}`}
        actions={
          <>
            <StatusBadge status={p.status} />
            <ButtonLink href={`/app/proposals/${p.id}/print`} variant="outline" target="_blank">
              <Printer className="size-4" aria-hidden="true" /> Print / PDF
            </ButtonLink>
          </>
        }
      />
      {org ? (
        <Alert tone="info" className="mb-6">
          Linked to client workspace{' '}
          <Link href={`/app/clients/${org.id}`} className="font-semibold underline">
            {org.name}
          </Link>
          .
          {p.status === 'sent' || p.status === 'accepted'
            ? ' The client can view this proposal in their portal.'
            : ' Drafts are never shown to clients.'}
        </Alert>
      ) : null}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader
              title="Line items"
              description={`Fixed fee ${formatCents(totals.total)} · deposit ${formatCents(totals.deposit)} (${p.depositPercent}%) · balance ${formatCents(totals.balance)}`}
            />
            <ul className="divide-ink/6 divide-y">
              {items.map((i) => (
                <li key={i.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
                  <span className="flex-1">{i.description}</span>
                  <span className="text-ink/60 tabular-nums">
                    {i.quantity} × {formatCents(i.unitPriceCents)}
                  </span>
                  <span className="w-24 text-right font-medium tabular-nums">
                    {formatCents(i.quantity * i.unitPriceCents)}
                  </span>
                  {editable ? (
                    <ActionForm action={removeProposalItem} hideSubmit inline>
                      <input type="hidden" name="proposalId" value={p.id} />
                      <input type="hidden" name="itemId" value={i.id} />
                      <button
                        type="submit"
                        aria-label={`Remove ${i.description}`}
                        className="text-ink/40 rounded p-1 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </ActionForm>
                  ) : null}
                </li>
              ))}
              {items.length === 0 ? (
                <li className="text-ink/50 px-5 py-4 text-sm">No line items yet.</li>
              ) : null}
            </ul>
            {editable ? (
              <div className="border-ink/8 border-t p-5">
                <ActionForm
                  action={addProposalItem}
                  submitLabel="Add item"
                  resetOnSuccess
                  submitSize="sm"
                  inline
                >
                  <input type="hidden" name="proposalId" value={p.id} />
                  <Input
                    name="description"
                    placeholder="Description"
                    required
                    className="min-w-64 flex-1"
                    aria-label="Item description"
                  />
                  <Input
                    name="quantity"
                    type="number"
                    min={1}
                    defaultValue={1}
                    className="w-20"
                    aria-label="Quantity"
                  />
                  <Input
                    name="unitPrice"
                    inputMode="decimal"
                    placeholder="Unit price $"
                    className="w-32"
                    required
                    aria-label="Unit price in dollars"
                  />
                </ActionForm>
              </div>
            ) : null}
          </Card>

          <Card>
            <CardHeader
              title="Proposal content"
              description={
                editable
                  ? 'Use “- ” at the start of a line for bullet points.'
                  : 'Only drafts can be edited. Duplicate to revise.'
              }
            />
            <div className="p-5">
              <ActionForm action={updateProposal} submitLabel="Save proposal" hideSubmit={!editable}>
                <input type="hidden" name="proposalId" value={p.id} />
                <fieldset disabled={!editable} className="space-y-4">
                  <Field label="Title" htmlFor="title" required>
                    <Input id="title" name="title" defaultValue={p.title} required />
                  </Field>
                  <Field label="Summary" htmlFor="summary">
                    <Textarea id="summary" name="summary" defaultValue={p.summary} />
                  </Field>
                  <Field label="Scope of work" htmlFor="scope">
                    <Textarea id="scope" name="scope" defaultValue={p.scope} className="min-h-48" />
                  </Field>
                  <Field label="Deliverables & outcomes" htmlFor="deliverables">
                    <Textarea
                      id="deliverables"
                      name="deliverables"
                      defaultValue={p.deliverables}
                      className="min-h-40"
                    />
                  </Field>
                  <Field label="Assumptions" htmlFor="assumptions">
                    <Textarea id="assumptions" name="assumptions" defaultValue={p.assumptions} />
                  </Field>
                  <Field label="Timeline" htmlFor="timeline">
                    <Input id="timeline" name="timeline" defaultValue={p.timeline} />
                  </Field>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <Field label="Deposit %" htmlFor="depositPercent" required>
                      <Input
                        id="depositPercent"
                        name="depositPercent"
                        type="number"
                        min={0}
                        max={100}
                        defaultValue={p.depositPercent}
                      />
                    </Field>
                    <Field label="Monthly support (USD)" htmlFor="retainerMonthly">
                      <Input
                        id="retainerMonthly"
                        name="retainerMonthly"
                        inputMode="decimal"
                        defaultValue={p.retainerMonthlyCents ? String(p.retainerMonthlyCents / 100) : ''}
                      />
                    </Field>
                    <Field label="Valid until" htmlFor="validUntil">
                      <Input
                        id="validUntil"
                        name="validUntil"
                        type="date"
                        defaultValue={toBusinessInput(p.validUntil, false)}
                      />
                    </Field>
                  </div>
                  <Field label="Support description" htmlFor="retainerDescription">
                    <Input
                      id="retainerDescription"
                      name="retainerDescription"
                      defaultValue={p.retainerDescription ?? ''}
                    />
                  </Field>
                </fieldset>
              </ActionForm>
            </div>
          </Card>
        </div>
        <div className="space-y-6">
          {canWrite ? (
            <Card>
              <CardHeader title="Status" />
              <div className="space-y-3 p-5 text-sm">
                <p className="text-ink/60">
                  Created {formatDate(p.createdAt)}
                  {p.sentAt ? ` · sent ${formatDate(p.sentAt)}` : ''}
                  {p.acceptedAt ? ` · accepted ${formatDate(p.acceptedAt)}` : ''}
                </p>
                {p.acceptedByName ? <p className="text-ink/70">{p.acceptedByName}</p> : null}
                <ActionForm action={setProposalStatus} submitLabel="Update status">
                  <input type="hidden" name="proposalId" value={p.id} />
                  <Select
                    name="status"
                    defaultValue={p.status === 'draft' ? 'sent' : p.status}
                    aria-label="New status"
                  >
                    <option value="draft">Draft</option>
                    <option value="sent">Sent to client</option>
                    <option value="accepted">Accepted</option>
                    <option value="declined">Declined</option>
                    <option value="expired">Expired</option>
                  </Select>
                  <Field
                    label="Accepted by (for “Accepted”)"
                    htmlFor="acceptedByName"
                    hint="e.g. “Jane Smith, by email reply on Nov 9”. This is a record, not an e-signature."
                  >
                    <Input id="acceptedByName" name="acceptedByName" />
                  </Field>
                </ActionForm>
                <p className="text-ink/50 text-xs">
                  Send the proposal by emailing the PDF (Print → Save as PDF) or, after conversion, through
                  the client portal.
                </p>
              </div>
            </Card>
          ) : null}
          {canWrite ? (
            <ActionForm
              action={duplicateProposal}
              submitLabel="Duplicate as new draft"
              submitVariant="outline"
            >
              <input type="hidden" name="proposalId" value={p.id} />
            </ActionForm>
          ) : null}
        </div>
      </div>
    </>
  );
}
