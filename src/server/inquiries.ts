import 'server-only';
import { and, eq, isNull, notInArray, sql } from 'drizzle-orm';
import { getDb } from '@/db';
import { analyticsEvents, companies, contacts, leadActivities, leads } from '@/db/schema';
import { ipFingerprint } from '@/lib/crypto';
import { sendEmail } from '@/lib/email';
import { siteUrl } from '@/lib/env';
import { log } from '@/lib/logger';
import { rateLimit } from '@/lib/rate-limit';
import { getSiteSettings } from '@/lib/settings';
import { domainFromEmail, normalizeCompanyName } from '@/lib/utils';
import { inquirySchema, type InquiryInput } from '@/lib/validation';
import { recordAudit } from '@/lib/audit';

export type CaptureResult =
  | { ok: true; leadId: string | null; deduplicated: boolean; spam?: boolean }
  | { ok: false; error: string; fieldErrors?: Record<string, string[] | undefined>; rateLimited?: boolean };

export type CaptureContext = {
  ip: string;
  /** Hidden honeypot field value — humans leave it empty. */
  honeypot?: string;
  /** Epoch ms when the form was rendered/started. */
  startedAt?: number;
  now?: number;
  /** Skip outbound email (tests). */
  skipNotification?: boolean;
};

const MIN_FILL_MS = 2500;

/**
 * Persists a public inquiry as a lead in Koral's internal pipeline.
 * Spam controls: honeypot, minimum fill time, per-IP and global rate limits.
 * Dedupe: contact by email, company by business domain or normalized name, and
 * repeat submissions attach to the contact's existing open lead.
 */
export async function captureInquiry(raw: unknown, ctx: CaptureContext): Promise<CaptureResult> {
  const now = ctx.now ?? Date.now();

  if (ctx.honeypot && ctx.honeypot.trim() !== '') {
    log.info('inquiry.spam_honeypot');
    return { ok: true, leadId: null, deduplicated: false, spam: true };
  }
  if (ctx.startedAt && now - ctx.startedAt < MIN_FILL_MS) {
    log.info('inquiry.spam_too_fast');
    return { ok: true, leadId: null, deduplicated: false, spam: true };
  }

  const parsed = inquirySchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: 'Please check the highlighted fields.',
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[] | undefined>,
    };
  }
  const input = parsed.data;

  const perIp = await rateLimit(`inquiry:ip:${ipFingerprint(ctx.ip)}`, 5, 600);
  const global = await rateLimit('inquiry:global', 300, 3600);
  if (!perIp.allowed || !global.allowed) {
    log.warn('inquiry.rate_limited', { perIp: perIp.count, global: global.count });
    return {
      ok: false,
      rateLimited: true,
      error: 'We received several submissions from your connection. Please wait a few minutes and try again.',
    };
  }

  const { leadId, deduplicated } = await persistInquiry(input, now);

  let notificationStatus: 'sent' | 'not_configured' | 'failed' | 'skipped' = 'skipped';
  if (!ctx.skipNotification) {
    notificationStatus = (await notifyStaff(leadId, input, deduplicated)).status;
  }
  await getDb().update(leads).set({ notificationStatus }).where(eq(leads.id, leadId));

  await getDb()
    .insert(analyticsEvents)
    .values({
      name: 'contact_submit',
      path: input.landingPath ?? '/contact',
      utmSource: input.utmSource,
      utmMedium: input.utmMedium,
      utmCampaign: input.utmCampaign,
      referrerHost: safeHost(input.referrer),
      props: { industry: input.industry, deduplicated: String(deduplicated) },
    })
    .catch((err) => log.warn('inquiry.analytics_failed', { err }));

  log.info('inquiry.captured', { leadId, deduplicated, notificationStatus });
  return { ok: true, leadId, deduplicated };
}

function safeHost(url?: string) {
  if (!url) return null;
  try {
    return new URL(url).host.slice(0, 120);
  } catch {
    return null;
  }
}

async function persistInquiry(input: InquiryInput, now: number) {
  const db = getDb();
  return db.transaction(async (tx) => {
    // Serialize concurrent submissions for the same email to keep dedupe correct.
    await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${'inquiry:' + input.email}))`);

    const domain = domainFromEmail(input.email);
    const normalizedName = normalizeCompanyName(input.company) || input.company.toLowerCase();

    // Company: business domain first, then normalized name.
    let company =
      (domain
        ? await tx.query.companies.findFirst({
            where: and(eq(companies.domain, domain), isNull(companies.deletedAt)),
          })
        : undefined) ??
      (await tx.query.companies.findFirst({
        where: and(eq(companies.normalizedName, normalizedName), isNull(companies.deletedAt)),
      }));
    if (!company) {
      [company] = await tx
        .insert(companies)
        .values({
          name: input.company,
          normalizedName,
          domain,
          website: domain ? `https://${domain}` : null,
          industry: input.industry,
          currentCrm: input.currentCrm,
          estMonthlyLeads: input.monthlyLeads,
        })
        .returning();
    } else {
      await tx
        .update(companies)
        .set({
          currentCrm: company.currentCrm ?? input.currentCrm,
          estMonthlyLeads: company.estMonthlyLeads ?? input.monthlyLeads,
          industry: company.industry ?? input.industry,
        })
        .where(eq(companies.id, company.id));
    }

    // Contact: by email.
    let contact = await tx.query.contacts.findFirst({
      where: and(eq(contacts.email, input.email), isNull(contacts.deletedAt)),
    });
    if (!contact) {
      [contact] = await tx
        .insert(contacts)
        .values({
          companyId: company!.id,
          fullName: input.name,
          email: input.email,
          phone: input.phone,
          isPrimary: true,
        })
        .returning();
    } else if (!contact.phone && input.phone) {
      await tx.update(contacts).set({ phone: input.phone }).where(eq(contacts.id, contact.id));
    }

    // Lead: reuse an open lead for this contact.
    const open = await tx.query.leads.findFirst({
      where: and(
        eq(leads.contactId, contact!.id),
        notInArray(leads.stage, ['won', 'lost']),
        isNull(leads.deletedAt),
      ),
    });

    const submittedAt = new Date(now);
    let leadId: string;
    let deduplicated = false;
    if (open) {
      deduplicated = true;
      leadId = open.id;
      await tx
        .update(leads)
        .set({
          submissionCount: sql`${leads.submissionCount} + 1`,
          lastSubmittedAt: submittedAt,
          consentEmail: open.consentEmail || input.consentEmail,
          consentSms: open.consentSms || input.consentSms,
        })
        .where(eq(leads.id, open.id));
    } else {
      const [lead] = await tx
        .insert(leads)
        .values({
          companyId: company!.id,
          contactId: contact!.id,
          title: `${input.company} — ${input.topProblem}`.slice(0, 200),
          stage: 'new',
          source: 'website_form',
          industry: input.industry,
          topProblem: input.topProblem,
          message: input.message,
          currentCrm: input.currentCrm,
          monthlyLeads: input.monthlyLeads,
          serviceInterest: input.serviceInterest,
          consentEmail: input.consentEmail,
          consentSms: input.consentSms,
          utmSource: input.utmSource,
          utmMedium: input.utmMedium,
          utmCampaign: input.utmCampaign,
          utmTerm: input.utmTerm,
          utmContent: input.utmContent,
          referrer: input.referrer,
          landingPath: input.landingPath,
          nextAction: 'Respond to new inquiry',
          nextActionDueAt: new Date(now + 4 * 60 * 60 * 1000),
          lastSubmittedAt: submittedAt,
        })
        .returning({ id: leads.id });
      leadId = lead!.id;
    }

    await tx.insert(leadActivities).values({
      leadId,
      type: 'form_submission',
      body: [`Website inquiry: ${input.topProblem}`, input.message ? `\n${input.message}` : ''].join(''),
      metadata: {
        industry: input.industry,
        monthlyLeads: input.monthlyLeads ?? null,
        currentCrm: input.currentCrm ?? null,
        serviceInterest: input.serviceInterest ?? null,
        consentEmail: input.consentEmail,
        consentSms: input.consentSms,
        landingPath: input.landingPath ?? null,
        utmSource: input.utmSource ?? null,
        deduplicated,
      },
    });

    await recordAuditTx(leadId, deduplicated);
    return { leadId, deduplicated };
  });
}

async function recordAuditTx(leadId: string, deduplicated: boolean) {
  await recordAudit({
    actor: null,
    action: deduplicated ? 'lead.resubmitted' : 'lead.created_from_form',
    entityType: 'lead',
    entityId: leadId,
  });
}

async function notifyStaff(leadId: string, input: InquiryInput, deduplicated: boolean) {
  const settings = await getSiteSettings();
  const envList = (process.env.LEAD_NOTIFICATION_EMAILS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const to = envList.length ? envList : settings.notificationEmails;
  const lines = [
    deduplicated ? 'A returning contact submitted the form again.' : 'A new website inquiry arrived.',
    '',
    `Name: ${input.name}`,
    `Company: ${input.company}`,
    `Email: ${input.email}`,
    input.phone ? `Phone: ${input.phone}` : null,
    `Industry: ${input.industry}`,
    input.monthlyLeads ? `Monthly leads: ${input.monthlyLeads}` : null,
    input.currentCrm ? `Current CRM: ${input.currentCrm}` : null,
    `Wants help with: ${input.topProblem}`,
    input.message ? `\nMessage:\n${input.message}` : null,
    '',
    `Consent — email follow-up: ${input.consentEmail ? 'yes' : 'no'}, SMS: ${input.consentSms ? 'yes' : 'no'}`,
    '',
    `Open in Koral portal: ${siteUrl()}/app/leads/${leadId}`,
  ].filter((l) => l !== null);
  return sendEmail({
    to,
    subject: `${deduplicated ? 'Returning' : 'New'} inquiry: ${input.company} (${input.industry})`,
    text: lines.join('\n'),
    replyTo: input.email,
  });
}
