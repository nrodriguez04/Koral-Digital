import { asc, isNotNull } from 'drizzle-orm';
import { ActionForm } from '@/components/app/action-form';
import { Alert, Badge, Card, CardHeader, DefinitionList, PageHeader } from '@/components/ui/primitives';
import { Checkbox, Field, Input, Select, Textarea } from '@/components/ui/form';
import { getDb } from '@/db';
import { users } from '@/db/schema';
import { pageRequireStaff } from '@/lib/auth/guards';
import { isDescopeManagementConfigured } from '@/lib/auth/descope';
import { grantableStaffRoles } from '@/lib/auth/permissions';
import { env, isDescopeConfigured, isEmailConfigured } from '@/lib/env';
import { getSiteSettings } from '@/lib/settings';
import { storageStatus } from '@/lib/storage';
import { relativeTime, titleCase } from '@/lib/utils';
import { changeStaffRole, inviteStaff, saveSiteSettings } from './actions';

export const metadata = { title: 'Settings' };

export default async function SettingsPage() {
  const actor = await pageRequireStaff('settings:write', '/app/settings');
  const s = await getSiteSettings();
  const staff = await getDb().select().from(users).where(isNotNull(users.staffRole)).orderBy(asc(users.email));
  const grantable = grantableStaffRoles(actor.staffRole);
  const e = env();
  const st = storageStatus();
  const ok = (v: boolean, yes = 'Configured', no = 'Not configured') => <Badge tone={v ? 'green' : 'amber'}>{v ? yes : no}</Badge>;
  return (
    <>
      <PageHeader title="Settings" description="Business details, public-site options and team access. Changes are audited." />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Business & website" />
          <div className="p-5">
            <ActionForm action={saveSiteSettings} submitLabel="Save settings">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Business name" htmlFor="businessName" required><Input id="businessName" name="businessName" defaultValue={s.businessName} /></Field>
                <Field label="Tagline" htmlFor="tagline" required><Input id="tagline" name="tagline" defaultValue={s.tagline} /></Field>
                <Field label="Contact email" htmlFor="contactEmail" required><Input id="contactEmail" name="contactEmail" type="email" defaultValue={s.contactEmail} /></Field>
                <Checkbox name="contactEmailVerified" defaultChecked={s.contactEmailVerified} label="I confirmed this mailbox receives mail — show it publicly" className="self-end pb-2" />
                <Field label="Phone" htmlFor="phone"><Input id="phone" name="phone" defaultValue={s.phone} /></Field>
                <Checkbox name="phoneVerified" defaultChecked={s.phoneVerified} label="Phone verified — show it publicly" className="self-end pb-2" />
                <Field label="City" htmlFor="city" required><Input id="city" name="city" defaultValue={s.city} /></Field>
                <Field label="State" htmlFor="region" required><Input id="region" name="region" defaultValue={s.region} /></Field>
                <Field label="Service areas (one per line)" htmlFor="serviceAreas" required className="sm:col-span-2"><Textarea id="serviceAreas" name="serviceAreas" defaultValue={s.serviceAreas.join('\n')} /></Field>
                <Field label="Booking URL (Calendly etc.)" htmlFor="bookingUrl"><Input id="bookingUrl" name="bookingUrl" type="url" defaultValue={s.bookingUrl} /></Field>
                <Checkbox name="bookingUrlVerified" defaultChecked={s.bookingUrlVerified} label="I tested this link end-to-end — embed it on /book" className="self-end pb-2" />
                <Field label="LinkedIn URL" htmlFor="linkedinUrl"><Input id="linkedinUrl" name="linkedinUrl" type="url" defaultValue={s.linkedinUrl} /></Field>
                <Field label="Lead notification emails" htmlFor="notificationEmails" hint="One per line. Overridden by LEAD_NOTIFICATION_EMAILS if set."><Textarea id="notificationEmails" name="notificationEmails" defaultValue={s.notificationEmails.join('\n')} className="min-h-16" /></Field>
                <Field label="Founder name" htmlFor="founderName"><Input id="founderName" name="founderName" defaultValue={s.founderName} /></Field>
                <Field label="Founder bio (About page)" htmlFor="founderBio" className="sm:col-span-2" hint="Keep it factual. Avoid claims you cannot verify."><Textarea id="founderBio" name="founderBio" defaultValue={s.founderBio} /></Field>
              </div>
              <fieldset className="space-y-3 rounded-xl bg-ivory p-4 ring-1 ring-ink/8">
                <legend className="px-1 text-sm font-semibold">Pricing display</legend>
                <Checkbox name="pricingShow" defaultChecked={s.pricing.show} label="Show “starting at” prices on the public site" />
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Pilot from (USD)" htmlFor="pilotFrom" required><Input id="pilotFrom" name="pilotFrom" type="number" min={0} defaultValue={s.pricing.pilotFrom} /></Field>
                  <Field label="Support from (USD/month)" htmlFor="supportFrom" required><Input id="supportFrom" name="supportFrom" type="number" min={0} defaultValue={s.pricing.supportFrom} /></Field>
                </div>
                <Field label="Pricing note" htmlFor="pricingNote" required><Input id="pricingNote" name="pricingNote" defaultValue={s.pricing.note} /></Field>
              </fieldset>
              <fieldset className="space-y-3 rounded-xl bg-ivory p-4 ring-1 ring-ink/8">
                <legend className="px-1 text-sm font-semibold">Koral Initiative</legend>
                <Field label="Status" htmlFor="initiativeStatus" required>
                  <Select id="initiativeStatus" name="initiativeStatus" defaultValue={s.initiative.status}>
                    <option value="planned">Planned (no contributions yet)</option>
                    <option value="active">Active (contributions made and verified)</option>
                  </Select>
                </Field>
                <Field label="Status note shown on /koral-initiative" htmlFor="initiativeStatusNote" required><Textarea id="initiativeStatusNote" name="initiativeStatusNote" defaultValue={s.initiative.statusNote} /></Field>
                <Checkbox name="initiativeConfirm" label="I confirm any “active” status reflects contributions that were actually made and can be verified." />
              </fieldset>
              <fieldset className="space-y-3 rounded-xl bg-ivory p-4 ring-1 ring-ink/8">
                <legend className="px-1 text-sm font-semibold">Search defaults</legend>
                <Field label="Default title (≤ 70 characters)" htmlFor="seoTitle" required><Input id="seoTitle" name="seoTitle" maxLength={70} defaultValue={s.seo.defaultTitle} /></Field>
                <Field label="Default description (≤ 170 characters)" htmlFor="seoDescription" required><Textarea id="seoDescription" name="seoDescription" maxLength={170} defaultValue={s.seo.defaultDescription} className="min-h-16" /></Field>
              </fieldset>
            </ActionForm>
          </div>
        </Card>
        <div className="space-y-6">
          <Card>
            <CardHeader title="Integrations status" description="Read-only. Configure via environment variables (see DEPLOYMENT.md)." />
            <DefinitionList
              items={[
                { label: 'Descope sign-in', value: ok(isDescopeConfigured()) },
                { label: 'Descope invites', value: ok(isDescopeManagementConfigured(), 'Email via Descope', 'Manual links') },
                { label: 'Email (Resend)', value: ok(isEmailConfigured()) },
                { label: 'File storage', value: ok(st.ready, `Ready (${st.driver})`, st.reason ?? 'Off') },
                { label: 'Search indexing', value: ok(e.VERCEL_ENV === 'production' || e.SITE_INDEXING === 'on', 'Allowed', 'Blocked (non-production)') },
                { label: 'Search Console tag', value: ok(Boolean(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION)) },
              ]}
            />
          </Card>
          <Card>
            <CardHeader title="Team" description="Internal Koral roles. Never granted by email domain." />
            <ul className="divide-y divide-ink/6">
              {staff.map((u) => (
                <li key={u.id} className="space-y-2 px-5 py-3 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span>
                      <span className="block font-medium">{u.name ?? u.email ?? u.id}</span>
                      <span className="block text-xs text-ink/50">{u.email} · {u.lastLoginAt ? `seen ${relativeTime(u.lastLoginAt)}` : 'never signed in'}</span>
                    </span>
                    <Badge tone="navy">{titleCase(u.staffRole ?? '')}</Badge>
                  </div>
                  {u.id !== actor.user.id && grantable.includes(u.staffRole!) ? (
                    <ActionForm action={changeStaffRole} inline submitLabel="Apply" submitSize="sm" submitVariant="outline">
                      <input type="hidden" name="userId" value={u.id} />
                      <Select name="role" defaultValue={u.staffRole!} className="h-8 w-auto text-xs" aria-label={`Role for ${u.email}`}>
                        {grantable.map((r) => <option key={r} value={r}>{titleCase(r)}</option>)}
                        <option value="none">Remove staff access</option>
                      </Select>
                    </ActionForm>
                  ) : null}
                </li>
              ))}
            </ul>
            {grantable.length ? (
              <div className="border-t border-ink/8 p-5">
                <p className="mb-3 text-sm font-semibold">Invite a team member</p>
                {!isDescopeConfigured() ? <Alert tone="warning" className="mb-3">Descope is not configured, so invitees cannot sign in yet.</Alert> : null}
                <ActionForm action={inviteStaff} submitLabel="Create invitation" resetOnSuccess submitSize="sm">
                  <Input name="email" type="email" placeholder="Email" required aria-label="Email" />
                  <Input name="name" placeholder="Name" aria-label="Name" />
                  <Select name="role" defaultValue={grantable.at(-1)} aria-label="Role">
                    {grantable.map((r) => <option key={r} value={r}>{titleCase(r)}</option>)}
                  </Select>
                </ActionForm>
              </div>
            ) : null}
          </Card>
        </div>
      </div>
    </>
  );
}
