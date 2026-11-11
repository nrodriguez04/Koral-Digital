import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { StatusBadge } from '@/components/app/status-badge';
import { Alert, Card, CardHeader, PageHeader, Table, Td, Th } from '@/components/ui/primitives';
import { pageRequireOrgMember } from '@/lib/auth/guards';
import { formatCents, formatDate } from '@/lib/utils';
import { portalBilling } from '@/server/portal';

export const metadata = { title: 'Proposals & billing' };

export default async function PortalBilling({ params }: { params: Promise<{ org: string }> }) {
  const { org: slug } = await params;
  const { org } = await pageRequireOrgMember(slug);
  const { proposals, invoices } = await portalBilling(org.id);
  return (
    <>
      <PageHeader title="Proposals & billing" description="Your scope documents and invoice status." />
      <div className="space-y-6">
        <Card>
          <CardHeader title="Proposals" />
          {proposals.length ? (
            <ul className="divide-ink/6 divide-y">
              {proposals.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/portal/${org.slug}/proposals/${p.id}`}
                    className="hover:bg-ocean-50/40 flex items-center justify-between gap-3 px-5 py-3"
                  >
                    <span className="text-sm font-medium">
                      {p.number} · {p.title}
                    </span>
                    <StatusBadge status={p.status} />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-ink/55 px-5 py-4 text-sm">No proposals shared yet.</p>
          )}
        </Card>
        <Card>
          <CardHeader
            title="Invoices"
            description="Payments are made through the secure hosted link on each invoice, or as arranged with Koral Digital."
          />
          {invoices.length ? (
            <Table>
              <thead>
                <tr>
                  <Th>Invoice</Th>
                  <Th>Status</Th>
                  <Th>Due</Th>
                  <Th className="text-right">Amount</Th>
                  <Th />
                </tr>
              </thead>
              <tbody>
                {invoices.map((i) => (
                  <tr key={i.id}>
                    <Td>
                      <span className="font-medium">{i.number}</span>
                      <div className="text-ink/55 text-xs">{i.description}</div>
                    </Td>
                    <Td>
                      <StatusBadge status={i.status} />
                    </Td>
                    <Td className="text-ink/60">{formatDate(i.dueDate)}</Td>
                    <Td className="text-right font-medium tabular-nums">{formatCents(i.amountCents)}</Td>
                    <Td>
                      {i.paymentUrl && ['sent', 'partially_paid'].includes(i.status) ? (
                        <a
                          href={i.paymentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-ocean-700 inline-flex items-center gap-1 text-sm font-semibold hover:underline"
                        >
                          Pay securely <ExternalLink className="size-3.5" aria-hidden="true" />
                        </a>
                      ) : null}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <p className="text-ink/55 px-5 py-4 text-sm">No invoices yet.</p>
          )}
        </Card>
        <Alert tone="info">Koral Digital never asks for card details through this portal or by email.</Alert>
      </div>
    </>
  );
}
