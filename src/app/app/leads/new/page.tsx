import { ActionForm } from '@/components/app/action-form';
import { Card, PageHeader } from '@/components/ui/primitives';
import { Field, Input, Select, Textarea } from '@/components/ui/form';
import { leadSourceEnum } from '@/db/schema';
import { pageRequireStaff } from '@/lib/auth/guards';
import { titleCase } from '@/lib/utils';
import { INDUSTRIES } from '@/lib/validation';
import { createLead } from '../actions';

export const metadata = { title: 'New lead' };

export default async function NewLeadPage() {
  await pageRequireStaff('leads:write', '/app/leads/new');
  return (
    <>
      <PageHeader
        title="New lead"
        description="Add a referral, event conversation or outbound prospect. Contacts and companies are de-duplicated automatically."
      />
      <Card className="max-w-3xl p-6">
        <ActionForm action={createLead} submitLabel="Create lead">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Company name" htmlFor="companyName" required>
              <Input id="companyName" name="companyName" required />
            </Field>
            <Field label="Contact name" htmlFor="contactName" required>
              <Input id="contactName" name="contactName" required />
            </Field>
            <Field label="Email" htmlFor="email">
              <Input id="email" name="email" type="email" />
            </Field>
            <Field label="Phone" htmlFor="phone">
              <Input id="phone" name="phone" type="tel" />
            </Field>
            <Field label="Industry" htmlFor="industry">
              <Select id="industry" name="industry" defaultValue="">
                <option value="">—</option>
                {INDUSTRIES.map((i) => (
                  <option key={i}>{i}</option>
                ))}
              </Select>
            </Field>
            <Field label="Source" htmlFor="source" required>
              <Select id="source" name="source" defaultValue="referral">
                {leadSourceEnum.enumValues.map((s) => (
                  <option key={s} value={s}>
                    {titleCase(s)}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Main problem" htmlFor="topProblem" className="sm:col-span-2">
              <Input id="topProblem" name="topProblem" />
            </Field>
            <Field label="Notes" htmlFor="notes" className="sm:col-span-2">
              <Textarea id="notes" name="notes" />
            </Field>
          </div>
        </ActionForm>
      </Card>
    </>
  );
}
