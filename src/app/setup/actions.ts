'use server';

import { isNotNull, sql } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { getDb } from '@/db';
import { users } from '@/db/schema';
import { recordAudit } from '@/lib/audit';
import { requireActor, auditActor } from '@/lib/auth/guards';
import { ipFingerprint, safeEqual, sha256 } from '@/lib/crypto';
import { env } from '@/lib/env';
import { rateLimit } from '@/lib/rate-limit';
import { clientIp } from '@/lib/request';

/**
 * One-time bootstrap: the first signed-in person holding SETUP_TOKEN becomes
 * superadmin — only while NO staff user exists. Afterwards this is inert.
 */
export async function claimSuperadmin(
  _prev: { error?: string },
  formData: FormData,
): Promise<{ error?: string }> {
  const configured = env().SETUP_TOKEN;
  if (!configured) return { error: 'SETUP_TOKEN is not configured on this deployment.' };
  const actor = await requireActor();
  const rl = await rateLimit(`setup:${ipFingerprint(await clientIp())}`, 5, 900);
  if (!rl.allowed) return { error: 'Too many attempts. Try again in 15 minutes.' };
  const supplied = String(formData.get('token') ?? '');
  if (!safeEqual(sha256(supplied), sha256(configured))) return { error: 'That setup token is not correct.' };

  const claimed = await getDb().transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(hashtext('koral:setup'))`);
    const existing = await tx.select({ id: users.id }).from(users).where(isNotNull(users.staffRole)).limit(1);
    if (existing.length) return false;
    await tx
      .update(users)
      .set({ staffRole: 'superadmin' })
      .where(sql`${users.id} = ${actor.user.id}`);
    return true;
  });
  if (!claimed)
    return { error: 'Setup has already been completed. Ask an existing administrator for access.' };
  await recordAudit({
    actor: auditActor(actor),
    action: 'staff.bootstrap_superadmin',
    entityType: 'user',
    entityId: actor.user.id,
  });
  redirect('/app');
}
