import { eq } from 'drizzle-orm';
import { beforeEach, describe, expect, it } from 'vitest';
import { getDb } from '@/db';
import { auditEvents, companies, contacts, leadActivities, leads } from '@/db/schema';
import { captureInquiry } from '@/server/inquiries';
import { resetDb } from '../support/db';

const valid = {
  name: 'Jordan Example',
  company: 'Example Roofing LLC',
  email: 'Jordan@ExampleRoofing.com',
  phone: '(214) 555-0100',
  industry: 'Roofing',
  monthlyLeads: '25–75',
  currentCrm: 'JobNimbus',
  topProblem: 'Leads are slow to get a response',
  message: 'We miss calls during storms.',
  consentEmail: true,
  consentSms: false,
  utmSource: 'google',
  landingPath: '/services/lead-to-booked',
};
const ctx = (ip = '198.51.100.1') => ({ ip, startedAt: Date.now() - 10_000, skipNotification: true });

describe('public inquiry capture', () => {
  beforeEach(resetDb);

  it('persists a lead with contact, company, activity and audit event', async () => {
    const res = await captureInquiry(valid, ctx());
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    const db = getDb();
    const lead = await db.query.leads.findFirst({ where: eq(leads.id, res.leadId!) });
    expect(lead).toMatchObject({
      stage: 'new',
      source: 'website_form',
      industry: 'Roofing',
      consentEmail: true,
      consentSms: false,
      utmSource: 'google',
      notificationStatus: 'skipped',
    });
    const contact = await db.query.contacts.findFirst({ where: eq(contacts.id, lead!.contactId!) });
    expect(contact!.email).toBe('jordan@exampleroofing.com');
    const company = await db.query.companies.findFirst({ where: eq(companies.id, lead!.companyId!) });
    expect(company).toMatchObject({ domain: 'exampleroofing.com', normalizedName: 'example roofing' });
    expect(await db.$count(leadActivities, eq(leadActivities.leadId, lead!.id))).toBe(1);
    expect(await db.$count(auditEvents, eq(auditEvents.action, 'lead.created_from_form'))).toBe(1);
  });

  it('de-duplicates a repeat submission onto the open lead', async () => {
    const a = await captureInquiry(valid, ctx());
    const b = await captureInquiry(
      { ...valid, message: 'Following up', email: 'jordan@exampleroofing.com' },
      ctx(),
    );
    expect(a.ok && b.ok).toBe(true);
    if (!a.ok || !b.ok) return;
    expect(b.leadId).toBe(a.leadId);
    expect(b.deduplicated).toBe(true);
    const db = getDb();
    expect(await db.$count(leads)).toBe(1);
    expect(await db.$count(contacts)).toBe(1);
    const lead = await db.query.leads.findFirst({ where: eq(leads.id, a.leadId!) });
    expect(lead!.submissionCount).toBe(2);
    expect(await db.$count(leadActivities, eq(leadActivities.leadId, a.leadId!))).toBe(2);
  });

  it('matches a colleague at the same business domain to the same company', async () => {
    await captureInquiry(valid, ctx());
    await captureInquiry(
      { ...valid, name: 'Sam Colleague', email: 'sam@exampleroofing.com', company: 'Example Roofing' },
      ctx(),
    );
    const db = getDb();
    expect(await db.$count(companies)).toBe(1);
    expect(await db.$count(contacts)).toBe(2);
    expect(await db.$count(leads)).toBe(2);
  });

  it('returns field errors for invalid input and saves nothing', async () => {
    const res = await captureInquiry({ ...valid, email: 'not-an-email', industry: 'Plumbing??' }, ctx());
    expect(res.ok).toBe(false);
    if (res.ok) return;
    expect(res.fieldErrors?.email).toBeTruthy();
    expect(res.fieldErrors?.industry).toBeTruthy();
    expect(await getDb().$count(leads)).toBe(0);
  });

  it('silently drops honeypot and too-fast submissions', async () => {
    const hp = await captureInquiry(valid, { ...ctx(), honeypot: 'http://spam.example' });
    const fast = await captureInquiry(valid, { ...ctx(), startedAt: Date.now() - 200 });
    expect(hp).toMatchObject({ ok: true, spam: true });
    expect(fast).toMatchObject({ ok: true, spam: true });
    expect(await getDb().$count(leads)).toBe(0);
  });

  it('rate limits repeated submissions from one IP', async () => {
    const results = [];
    for (let i = 0; i < 7; i++) {
      results.push(await captureInquiry({ ...valid, email: `p${i}@exampleroofing.com` }, ctx('192.0.2.77')));
    }
    expect(results.slice(0, 5).every((r) => r.ok)).toBe(true);
    expect(results[5]).toMatchObject({ ok: false, rateLimited: true });
    // A different visitor is unaffected.
    expect(
      (await captureInquiry({ ...valid, email: 'other@exampleroofing.com' }, ctx('192.0.2.78'))).ok,
    ).toBe(true);
  });
});
