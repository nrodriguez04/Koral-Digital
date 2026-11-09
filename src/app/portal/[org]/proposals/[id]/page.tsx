import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ActionForm } from '@/components/app/action-form';
import { PrintButton } from '@/components/app/print-button';
import { ProposalDocument } from '@/components/app/proposal-document';
import { Alert, Card } from '@/components/ui/primitives';
import { Checkbox, Field, Input } from '@/components/ui/form';
import { pageRequireOrgMember } from '@/lib/auth/guards';
import { memberCan } from '@/lib/auth/permissions';
import { getSiteSettings } from '@/lib/settings';
import { formatDate } from '@/lib/utils';
import { portalProposal } from '@/server/portal';
import { portalAcknowledgeProposal } from '../../actions';

export const metadata = { title: 'Proposal' };

export default async function PortalProposal({ params }: { params: Promise<{ org: string; id: string }> }) {
  const { org: slug, id } = await params;
  const { org, role, actor } = await pageRequireOrgMember(slug);
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const d = await portalProposal(org.id, id);
  if (!d) notFound();
  const s = await getSiteSettings();
  return (
    <>
      <div className="no-print mb-4 flex items-center justify-between">
        <Link href={`/portal/${org.slug}/billing`} className="text-ink/60 hover:text-ink text-sm">
          ← Proposals & billing
        </Link>
        <PrintButton />
      </div>
      {d.proposal.status === 'accepted' && d.proposal.acceptedAt ? (
        <Alert
          tone="success"
          className="no-print mb-4"
          title="Thank you — your acceptance has been recorded."
        >
          Recorded {formatDate(d.proposal.acceptedAt, true)}. Koral Digital will follow up with the services
          agreement and next steps.
        </Alert>
      ) : null}
      <Card className="overflow-hidden">
        <ProposalDocument
          proposal={d.proposal}
          items={d.items}
          clientName={org.name}
          businessName={s.businessName}
        />
      </Card>
      {d.proposal.status === 'sent' && memberCan(role, 'proposals:acknowledge') ? (
        <Card className="no-print mt-6 max-w-3xl p-6">
          <h2 className="font-semibold">Accept this proposal</h2>
          <p className="text-ink/65 mt-1 text-sm">
            Recording your acceptance tells Koral Digital to prepare the services agreement and kickoff. It is
            an acknowledgment, not an electronic signature.
          </p>
          <div className="mt-4">
            <ActionForm action={portalAcknowledgeProposal} submitLabel="Record acceptance">
              <input type="hidden" name="org" value={org.slug} />
              <input type="hidden" name="proposalId" value={d.proposal.id} />
              <Field label="Your full name" htmlFor="typedName" required>
                <Input id="typedName" name="typedName" defaultValue={actor.user.name ?? ''} required />
              </Field>
              <Checkbox
                name="confirm"
                required
                label={`I am authorized to accept this proposal on behalf of ${org.name}.`}
              />
            </ActionForm>
          </div>
        </Card>
      ) : null}
    </>
  );
}
