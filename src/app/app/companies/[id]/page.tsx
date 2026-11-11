import Link from 'next/link';
import { and, desc, eq, isNull } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { ActionForm } from '@/components/app/action-form';
import { StageBadge } from '@/components/app/status-badge';
import { Card, CardHeader, PageHeader } from '@/components/ui/primitives';
import { Field, Input, Textarea } from '@/components/ui/form';
import { getDb } from '@/db';
import { companies, contacts, leads } from '@/db/schema';
import { pageRequireStaff } from '@/lib/auth/guards';
import { staffCan } from '@/lib/auth/permissions';
import { formatDate } from '@/lib/utils';
import { addContact, updateCompany } from '../actions';

export const metadata = { title: 'Company' };

export default async function CompanyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const actor = await pageRequireStaff('leads:read', `/app/companies/${id}`);
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const db = getDb();
  const c = await db.query.companies.findFirst({
    where: and(eq(companies.id, id), isNull(companies.deletedAt)),
  });
  if (!c) notFound();
  const [people, companyLeads] = await Promise.all([
    db
      .select()
      .from(contacts)
      .where(and(eq(contacts.companyId, id), isNull(contacts.deletedAt))),
    db
      .select()
      .from(leads)
      .where(and(eq(leads.companyId, id), isNull(leads.deletedAt)))
      .orderBy(desc(leads.createdAt)),
  ]);
  const canWrite = staffCan(actor.staffRole, 'leads:write');
  return (
    <>
      <PageHeader
        eyebrow={<Link href="/app/companies">← Companies</Link>}
        title={c.name}
        description={c.domain ?? undefined}
      />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Business profile" />
          <div className="p-5">
            <ActionForm action={updateCompany} hideSubmit={!canWrite}>
              <input type="hidden" name="companyId" value={c.id} />
              <fieldset disabled={!canWrite} className="grid gap-4 sm:grid-cols-2">
                <Field label="Name" htmlFor="name" required>
                  <Input id="name" name="name" defaultValue={c.name} required />
                </Field>
                <Field label="Website" htmlFor="website">
                  <Input id="website" name="website" type="url" defaultValue={c.website ?? ''} />
                </Field>
                <Field label="Industry" htmlFor="industry">
                  <Input id="industry" name="industry" defaultValue={c.industry ?? ''} />
                </Field>
                <Field label="Main phone" htmlFor="phone">
                  <Input id="phone" name="phone" defaultValue={c.phone ?? ''} />
                </Field>
                <Field label="Service area" htmlFor="serviceArea">
                  <Input
                    id="serviceArea"
                    name="serviceArea"
                    defaultValue={c.serviceArea ?? ''}
                    placeholder="e.g. county, metro area or region"
                  />
                </Field>
                <Field label="Current CRM" htmlFor="currentCrm">
                  <Input id="currentCrm" name="currentCrm" defaultValue={c.currentCrm ?? ''} />
                </Field>
                <Field
                  label="Software stack (comma-separated)"
                  htmlFor="softwareStack"
                  className="sm:col-span-2"
                >
                  <Input id="softwareStack" name="softwareStack" defaultValue={c.softwareStack.join(', ')} />
                </Field>
                <Field
                  label="Marketing channels (comma-separated)"
                  htmlFor="marketingChannels"
                  className="sm:col-span-2"
                >
                  <Input
                    id="marketingChannels"
                    name="marketingChannels"
                    defaultValue={c.marketingChannels.join(', ')}
                  />
                </Field>
                <Field label="Estimated monthly inquiries" htmlFor="estMonthlyLeads">
                  <Input id="estMonthlyLeads" name="estMonthlyLeads" defaultValue={c.estMonthlyLeads ?? ''} />
                </Field>
                <Field label="Notes" htmlFor="notes" className="sm:col-span-2">
                  <Textarea id="notes" name="notes" defaultValue={c.notes ?? ''} />
                </Field>
              </fieldset>
            </ActionForm>
          </div>
        </Card>
        <div className="space-y-6">
          <Card>
            <CardHeader title="People" />
            <ul className="divide-ink/6 divide-y">
              {people.map((p) => (
                <li key={p.id} className="px-5 py-3 text-sm">
                  <p className="font-medium">
                    {p.fullName}
                    {p.title ? <span className="text-ink/50"> · {p.title}</span> : null}
                  </p>
                  <p className="text-ink/55 text-xs">
                    {[p.email, p.phone].filter(Boolean).join(' · ') || 'No contact details'}
                  </p>
                </li>
              ))}
            </ul>
            {canWrite ? (
              <div className="border-ink/8 border-t p-5">
                <ActionForm action={addContact} submitLabel="Add person" resetOnSuccess submitSize="sm">
                  <input type="hidden" name="companyId" value={c.id} />
                  <Input name="fullName" placeholder="Full name" required aria-label="Full name" />
                  <Input name="title" placeholder="Role (e.g. Office manager)" aria-label="Role" />
                  <Input name="email" type="email" placeholder="Email" aria-label="Email" />
                  <Input name="phone" placeholder="Phone" aria-label="Phone" />
                </ActionForm>
              </div>
            ) : null}
          </Card>
          <Card>
            <CardHeader title="Leads" />
            <ul className="divide-ink/6 divide-y">
              {companyLeads.map((l) => (
                <li key={l.id} className="flex items-center justify-between gap-2 px-5 py-3 text-sm">
                  <Link href={`/app/leads/${l.id}`} className="hover:text-ocean-700">
                    {formatDate(l.createdAt)} · {l.topProblem ?? l.title}
                  </Link>
                  <StageBadge stage={l.stage} />
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </>
  );
}
