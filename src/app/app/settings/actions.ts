'use server';

import { and, eq, isNotNull } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getDb } from '@/db';
import { siteSettings, staffRoleEnum, users } from '@/db/schema';
import { recordAudit } from '@/lib/audit';
import { auditActor, requireStaff, runAction, type ActionResult } from '@/lib/auth/guards';
import { grantableStaffRoles } from '@/lib/auth/permissions';
import { siteSettingsSchema } from '@/lib/settings-schema';
import { SITE_SETTINGS_KEY, getSiteSettings } from '@/lib/settings';
import { createInvitation } from '@/server/invitations';

const lines = (v: FormDataEntryValue | null) => String(v ?? '').split(/[\n,]/).map((s) => s.trim()).filter(Boolean);
const bool = (v: FormDataEntryValue | null) => v === 'on';

export async function saveSiteSettings(_p: ActionResult<unknown>, fd: FormData): Promise<ActionResult<unknown>> {
  return runAction(async () => {
    const actor = await requireStaff('settings:write');
    const current = await getSiteSettings();
    const candidate = {
      ...current,
      businessName: String(fd.get('businessName') ?? ''),
      tagline: String(fd.get('tagline') ?? ''),
      contactEmail: String(fd.get('contactEmail') ?? ''),
      contactEmailVerified: bool(fd.get('contactEmailVerified')),
      phone: String(fd.get('phone') ?? ''),
      phoneVerified: bool(fd.get('phoneVerified')),
      city: String(fd.get('city') ?? ''),
      region: String(fd.get('region') ?? ''),
      serviceAreas: lines(fd.get('serviceAreas')),
      bookingUrl: String(fd.get('bookingUrl') ?? ''),
      bookingUrlVerified: bool(fd.get('bookingUrlVerified')),
      linkedinUrl: String(fd.get('linkedinUrl') ?? ''),
      notificationEmails: lines(fd.get('notificationEmails')),
      founderName: String(fd.get('founderName') ?? ''),
      founderBio: String(fd.get('founderBio') ?? ''),
      pricing: {
        show: bool(fd.get('pricingShow')),
        pilotFrom: Number(fd.get('pilotFrom') ?? 0),
        supportFrom: Number(fd.get('supportFrom') ?? 0),
        note: String(fd.get('pricingNote') ?? ''),
      },
      initiative: {
        status: String(fd.get('initiativeStatus') ?? 'planned'),
        statusNote: String(fd.get('initiativeStatusNote') ?? ''),
      },
      seo: { defaultTitle: String(fd.get('seoTitle') ?? ''), defaultDescription: String(fd.get('seoDescription') ?? '') },
    };
    const parsed = siteSettingsSchema.safeParse(candidate);
    if (!parsed.success) {
      return { ok: false, error: 'Please check the settings.', fieldErrors: Object.fromEntries(parsed.error.issues.map((i) => [i.path.join('.'), [i.message]])) };
    }
    if (parsed.data.bookingUrlVerified && !parsed.data.bookingUrl.startsWith('https://')) {
      return { ok: false, error: 'A verified booking link must be an https:// URL.' };
    }
    if (parsed.data.initiative.status === 'active' && current.initiative.status !== 'active' && fd.get('initiativeConfirm') !== 'on') {
      return { ok: false, error: 'Only mark the Koral Initiative active once a contribution has actually been made and verified — tick the confirmation box.' };
    }
    await getDb()
      .insert(siteSettings)
      .values({ key: SITE_SETTINGS_KEY, value: parsed.data, updatedById: actor.user.id })
      .onConflictDoUpdate({ target: siteSettings.key, set: { value: parsed.data, updatedById: actor.user.id, updatedAt: new Date() } });
    const changed = Object.keys(parsed.data).filter((k) => JSON.stringify((parsed.data as Record<string, unknown>)[k]) !== JSON.stringify((current as Record<string, unknown>)[k]));
    await recordAudit({ actor: auditActor(actor), action: 'settings.updated', entityType: 'site_settings', entityId: SITE_SETTINGS_KEY, metadata: { changed } });
    revalidatePath('/', 'layout');
    return { ok: true, message: 'Settings saved. Public pages refresh within a few minutes.' };
  });
}

export async function inviteStaff(_p: ActionResult<unknown>, fd: FormData): Promise<ActionResult<unknown>> {
  return runAction(async () => {
    const actor = await requireStaff('staff:manage');
    const parsed = z.object({ email: z.string().trim().toLowerCase().email(), name: z.string().trim().max(120).optional(), role: z.enum(staffRoleEnum.enumValues) }).safeParse(Object.fromEntries(fd));
    if (!parsed.success) return { ok: false, error: 'Please check the invitation.' };
    if (!grantableStaffRoles(actor.staffRole).includes(parsed.data.role)) return { ok: false, error: 'You cannot grant that role.' };
    const inv = await createInvitation(actor, { email: parsed.data.email, orgId: null, staffRole: parsed.data.role, name: parsed.data.name });
    return {
      ok: true,
      message:
        inv.delivery === 'descope_email'
          ? `Invitation emailed by Descope. Backup single-use link: ${inv.link}`
          : `Send this single-use link to ${parsed.data.email} (shown once, expires in 7 days). Staff invitations require a verified email at acceptance: ${inv.link}`,
    };
  });
}

export async function changeStaffRole(_p: ActionResult<unknown>, fd: FormData): Promise<ActionResult<unknown>> {
  return runAction(async () => {
    const actor = await requireStaff('staff:manage');
    const parsed = z.object({ userId: z.string().uuid(), role: z.union([z.enum(staffRoleEnum.enumValues), z.literal('none')]) }).safeParse(Object.fromEntries(fd));
    if (!parsed.success) return { ok: false, error: 'Invalid request.' };
    const { userId, role } = parsed.data;
    if (userId === actor.user.id) return { ok: false, error: 'You cannot change your own role.' };
    const db = getDb();
    const target = await db.query.users.findFirst({ where: and(eq(users.id, userId), isNotNull(users.staffRole)) });
    if (!target) return { ok: false, error: 'Staff member not found.' };
    const allowed = grantableStaffRoles(actor.staffRole);
    if (!allowed.includes(target.staffRole!) || (role !== 'none' && !allowed.includes(role))) {
      return { ok: false, error: 'You do not have permission to make that change.' };
    }
    await db.update(users).set({ staffRole: role === 'none' ? null : role }).where(eq(users.id, userId));
    await recordAudit({ actor: auditActor(actor), action: 'staff.role_changed', entityType: 'user', entityId: userId, metadata: { from: target.staffRole, to: role } });
    revalidatePath('/app/settings');
    return { ok: true, message: role === 'none' ? 'Staff access removed.' : 'Role updated.' };
  });
}
