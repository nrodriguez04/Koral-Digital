import Image from 'next/image';
import type { Proposal, ProposalItem } from '@/db/schema';
import { formatCents, formatDate } from '@/lib/utils';
import { proposalTotals } from '@/lib/proposal-math';

function Block({ title, text }: { title: string; text: string }) {
  if (!text.trim()) return null;
  const lines = text.split('\n').filter((l) => l.trim());
  const isList = lines.every((l) => /^[-*]\s/.test(l));
  return (
    <section className="break-inside-avoid">
      <h2 className="text-base font-semibold tracking-tight text-ocean-900">{title}</h2>
      {isList ? (
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-ink/80 marker:text-ocean-500">
          {lines.map((l) => (
            <li key={l}>{l.replace(/^[-*]\s/, '')}</li>
          ))}
        </ul>
      ) : (
        <div className="mt-2 space-y-2 text-sm leading-relaxed text-ink/80">
          {lines.map((l) => (
            <p key={l}>{l}</p>
          ))}
        </div>
      )}
    </section>
  );
}

/** Clean, client-facing proposal used for print/PDF and in the client portal. */
export function ProposalDocument({
  proposal,
  items,
  clientName,
  contactName,
  businessName,
}: {
  proposal: Proposal;
  items: ProposalItem[];
  clientName: string;
  contactName?: string | null;
  businessName: string;
}) {
  const totals = proposalTotals(items, proposal.depositPercent);
  return (
    <article className="mx-auto max-w-3xl bg-white p-8 text-ink sm:p-12 print:p-0">
      <header className="flex items-start justify-between gap-6 border-b border-ink/10 pb-6">
        <div className="flex items-center gap-3">
          <Image src="/brand/koral-mark-transparent.png" alt="" width={44} height={44} />
          <div>
            <p className="text-sm font-semibold tracking-[0.2em]">KORAL DIGITAL</p>
            <p className="text-xs text-ocean-600">Building a better tomorrow</p>
          </div>
        </div>
        <div className="text-right text-xs text-ink/60">
          <p className="font-semibold text-ink">Proposal {proposal.number}</p>
          <p>Prepared {formatDate(proposal.createdAt)}</p>
          {proposal.validUntil ? <p>Valid until {formatDate(proposal.validUntil)}</p> : null}
        </div>
      </header>

      <div className="mt-8">
        <p className="text-xs tracking-wide text-ink/50 uppercase">Prepared for</p>
        <p className="mt-1 text-lg font-semibold">{clientName}</p>
        {contactName ? <p className="text-sm text-ink/60">Attn: {contactName}</p> : null}
        <h1 className="mt-6 text-3xl font-semibold tracking-tight">{proposal.title}</h1>
      </div>

      <div className="mt-8 space-y-7">
        <Block title="Summary" text={proposal.summary} />
        <Block title="Scope of work" text={proposal.scope} />
        <Block title="Deliverables & outcomes" text={proposal.deliverables} />
        <Block title="Timeline" text={proposal.timeline} />
        <Block title="Assumptions" text={proposal.assumptions} />

        <section className="break-inside-avoid">
          <h2 className="text-base font-semibold tracking-tight text-ocean-900">Investment</h2>
          <table className="mt-3 w-full text-sm">
            <thead>
              <tr className="border-b border-ink/15 text-left text-xs text-ink/55 uppercase">
                <th className="py-2 font-medium">Item</th>
                <th className="py-2 text-right font-medium">Qty</th>
                <th className="py-2 text-right font-medium">Unit</th>
                <th className="py-2 text-right font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {items.map((i) => (
                <tr key={i.id} className="border-b border-ink/8">
                  <td className="py-2.5 pr-3">{i.description}</td>
                  <td className="py-2.5 text-right tabular-nums">{i.quantity}</td>
                  <td className="py-2.5 text-right tabular-nums">{formatCents(i.unitPriceCents)}</td>
                  <td className="py-2.5 text-right tabular-nums">{formatCents(i.quantity * i.unitPriceCents)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} className="pt-3 text-right font-semibold">
                  Fixed project fee
                </td>
                <td className="pt-3 text-right font-semibold tabular-nums">{formatCents(totals.total)}</td>
              </tr>
              <tr>
                <td colSpan={3} className="pt-1 text-right text-ink/65">
                  Deposit due at kickoff ({proposal.depositPercent}%)
                </td>
                <td className="pt-1 text-right tabular-nums text-ink/65">{formatCents(totals.deposit)}</td>
              </tr>
              <tr>
                <td colSpan={3} className="pt-1 text-right text-ink/65">
                  Balance due on acceptance of deliverables
                </td>
                <td className="pt-1 text-right tabular-nums text-ink/65">{formatCents(totals.balance)}</td>
              </tr>
            </tfoot>
          </table>
          {proposal.retainerMonthlyCents ? (
            <p className="mt-4 rounded-lg bg-ocean-50 p-3 text-sm text-ocean-900">
              <strong>Optional ongoing support:</strong> {formatCents(proposal.retainerMonthlyCents)}/month.{' '}
              {proposal.retainerDescription}
            </p>
          ) : null}
        </section>

        <section className="break-inside-avoid border-t border-ink/10 pt-6 text-xs leading-relaxed text-ink/55">
          <p>
            This proposal describes a fixed scope. Changes to scope are agreed in writing before work begins. Third-party
            software subscriptions are the client&apos;s responsibility unless stated otherwise. {businessName} does not
            guarantee specific lead volumes, rankings or revenue outcomes; acceptance tests listed above define completion.
          </p>
          {proposal.status === 'accepted' && proposal.acceptedAt ? (
            <p className="mt-3 font-medium text-ink/70">
              Acceptance recorded {formatDate(proposal.acceptedAt, true)}
              {proposal.acceptedByName ? ` — ${proposal.acceptedByName}` : ''}. This record is an acknowledgment, not an
              electronic signature; a signed services agreement governs the engagement.
            </p>
          ) : null}
        </section>
      </div>
    </article>
  );
}
