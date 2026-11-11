'use server';

import { and, eq, isNull } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getDb } from '@/db';
import { companies, contacts } from '@/db/schema';
import { recordAudit } from '@/lib/audit';
import { auditActor, requireStaff, runAction, type ActionResult } from '@/lib/auth/guards';
import { normalizeCompanyName } from '@/lib/utils';

const list = (v: string | undefined) =>
  (v ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 30);

export async function updateCompany(_p: ActionResult<unknown>, fd: FormData): Promise<ActionResult<unknown>> {
  return runAction(async () => {
    const actor = await requireStaff('leads:write');
    const parsed = z
      .object({
        companyId: z.string().uuid(),
        name: z.string().trim().min(2).max(160),
        website: z.union([z.string().trim().url(), z.literal('')]).optional(),
        industry: z.string().trim().max(80).optional(),
        phone: z.string().trim().max(40).optional(),
        serviceArea: z.string().trim().max(200).optional(),
        currentCrm: z.string().trim().max(120).optional(),
        softwareStack: z.string().max(1000).optional(),
        marketingChannels: z.string().max(1000).optional(),
        estMonthlyLeads: z.string().trim().max(40).optional(),
        notes: z.string().trim().max(8000).optional(),
      })
      .safeParse(Object.fromEntries(fd));
    if (!parsed.success)
      return { ok: false, error: 'Please check the form.', fieldErrors: parsed.error.flatten().fieldErrors };
    const d = parsed.data;
    let domain: string | null = null;
    if (d.website) {
      try {
        domain = new URL(d.website).host.replace(/^www\./, '').toLowerCase();
      } catch {
        domain = null;
      }
    }
    const db = getDb();
    if (domain) {
      const clash = await db.query.companies.findFirst({
        where: and(eq(companies.domain, domain), isNull(companies.deletedAt)),
      });
      if (clash && clash.id !== d.companyId)
        return { ok: false, error: `Another company already uses ${domain}.` };
    }
    await db
      .update(companies)
      .set({
        name: d.name,
        normalizedName: normalizeCompanyName(d.name) || d.name.toLowerCase(),
        website: d.website || null,
        domain,
        industry: d.industry || null,
        phone: d.phone || null,
        serviceArea: d.serviceArea || null,
        currentCrm: d.currentCrm || null,
        softwareStack: list(d.softwareStack),
        marketingChannels: list(d.marketingChannels),
        estMonthlyLeads: d.estMonthlyLeads || null,
        notes: d.notes || null,
      })
      .where(eq(companies.id, d.companyId));
    await recordAudit({
      actor: auditActor(actor),
      action: 'company.updated',
      entityType: 'company',
      entityId: d.companyId,
    });
    revalidatePath(`/app/companies/${d.companyId}`);
    return { ok: true, message: 'Company saved.' };
  });
}

export async function addContact(_p: ActionResult<unknown>, fd: FormData): Promise<ActionResult<unknown>> {
  return runAction(async () => {
    await requireStaff('leads:write');
    const parsed = z
      .object({
        companyId: z.string().uuid(),
        fullName: z.string().trim().min(2).max(120),
        email: z.union([z.string().trim().toLowerCase().email(), z.literal('')]).optional(),
        phone: z.string().trim().max(40).optional(),
        title: z.string().trim().max(120).optional(),
      })
      .safeParse(Object.fromEntries(fd));
    if (!parsed.success)
      return {
        ok: false,
        error: 'Please check the contact.',
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    const d = parsed.data;
    const db = getDb();
    if (d.email) {
      const dup = await db.query.contacts.findFirst({
        where: and(eq(contacts.email, d.email), isNull(contacts.deletedAt)),
      });
      if (dup) return { ok: false, error: `A contact with ${d.email} already exists.` };
    }
    await db.insert(contacts).values({
      companyId: d.companyId,
      fullName: d.fullName,
      email: d.email || null,
      phone: d.phone || null,
      title: d.title || null,
    });
    revalidatePath(`/app/companies/${d.companyId}`);
    return { ok: true, message: 'Contact added.' };
  });
}
