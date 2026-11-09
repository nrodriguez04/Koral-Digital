import { notFound } from 'next/navigation';
import { ProposalDocument } from '@/components/app/proposal-document';
import { PrintButton } from '@/components/app/print-button';
import { pageRequireStaff } from '@/lib/auth/guards';
import { getSiteSettings } from '@/lib/settings';
import { getProposalWithItems } from '@/server/proposals';

export const metadata = { title: 'Proposal (print)', robots: { index: false, follow: false } };

export default async function ProposalPrintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await pageRequireStaff('leads:read', `/app/proposals/${id}/print`);
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const data = await getProposalWithItems(id);
  if (!data) notFound();
  const s = await getSiteSettings();
  return (
    <div className="-mx-4 -my-6 bg-white sm:-mx-6 lg:-mx-8 lg:-my-8">
      <div className="no-print border-ink/8 flex justify-end gap-2 border-b p-3">
        <PrintButton />
      </div>
      <ProposalDocument
        proposal={data.proposal}
        items={data.items}
        clientName={data.org?.name ?? data.company?.name ?? 'Client'}
        contactName={data.contact?.fullName}
        businessName={s.businessName}
      />
    </div>
  );
}
