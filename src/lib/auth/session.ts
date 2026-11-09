import 'server-only';
import { and, eq, gt, isNotNull, or } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { cache } from 'react';
import { getDb, isDatabaseConfigured } from '@/db';
import { invitations, memberships, organizations, users, type MemberRole, type StaffRole, type User } from '@/db/schema';
import { isDevAuthMockEnabled } from '@/lib/env';
import { log } from '@/lib/logger';
import { DEV_SESSION_COOKIE, verifyDevSession } from './dev-session';
import { getDescopeSession, loadDescopeProfile } from './descope';
import { recordAudit } from '@/lib/audit';

export type ActorMembership = { orgId: string; orgSlug: string; orgName: string; role: MemberRole };

export type Actor = {
  user: User;
  staffRole: StaffRole | null;
  memberships: ActorMembership[];
  authMethod: 'descope' | 'dev-mock';
};

async function loadMemberships(userId: string): Promise<ActorMembership[]> {
  const rows = await getDb()
    .select({
      orgId: memberships.orgId,
      role: memberships.role,
      orgSlug: organizations.slug,
      orgName: organizations.name,
      deletedAt: organizations.deletedAt,
    })
    .from(memberships)
    .innerJoin(organizations, eq(organizations.id, memberships.orgId))
    .where(eq(memberships.userId, userId));
  return rows.filter((r) => !r.deletedAt).map(({ deletedAt: _d, ...r }) => r);
}

function claimEmail(claims: Record<string, unknown>): { email: string | null; verified: boolean } {
  const email = typeof claims.email === 'string' ? claims.email.toLowerCase() : null;
  const verified = claims.email_verified === true || claims.verifiedEmail === true;
  return { email, verified: Boolean(email && verified) };
}

/**
 * Accepts invitations that are cryptographically bound to this identity:
 * either delivered via Descope to this exact user ID, or addressed to an email
 * address Descope has verified for this user.
 */
async function autoAcceptBoundInvitations(user: User) {
  const db = getDb();
  const conditions = [eq(invitations.descopeUserId, user.descopeUserId ?? '__none__')];
  if (user.email && user.emailVerified) conditions.push(eq(invitations.email, user.email));
  const pending = await db
    .select()
    .from(invitations)
    .where(and(eq(invitations.status, 'pending'), gt(invitations.expiresAt, new Date()), or(...conditions)));
  for (const inv of pending) {
    await acceptInvitationForUser(inv, user, 'auto_bound_identity');
  }
}

export async function acceptInvitationForUser(
  inv: typeof invitations.$inferSelect,
  user: User,
  via: 'auto_bound_identity' | 'token_link',
) {
  const db = getDb();
  await db.transaction(async (tx) => {
    const claimed = await tx
      .update(invitations)
      .set({ status: 'accepted', acceptedById: user.id, acceptedAt: new Date() })
      .where(and(eq(invitations.id, inv.id), eq(invitations.status, 'pending')))
      .returning({ id: invitations.id });
    if (claimed.length === 0) return; // already used — single use
    if (inv.orgId && inv.memberRole) {
      await tx
        .insert(memberships)
        .values({ orgId: inv.orgId, userId: user.id, role: inv.memberRole })
        .onConflictDoNothing({ target: [memberships.orgId, memberships.userId] });
    }
    if (!inv.orgId && inv.staffRole) {
      await tx.update(users).set({ staffRole: inv.staffRole }).where(eq(users.id, user.id));
    }
  });
  await recordAudit({
    actor: { id: user.id, label: user.email ?? user.id },
    action: 'invitation.accepted',
    entityType: 'invitation',
    entityId: inv.id,
    orgId: inv.orgId,
    metadata: { via, memberRole: inv.memberRole, staffRole: inv.staffRole },
  });
}

async function resolveDescopeUser(descopeUserId: string, claims: Record<string, unknown>): Promise<User> {
  const db = getDb();
  let user = await db.query.users.findFirst({ where: eq(users.descopeUserId, descopeUserId) });
  if (!user) {
    const fromClaims = claimEmail(claims);
    const profile = fromClaims.verified ? null : await loadDescopeProfile(descopeUserId);
    const email = fromClaims.email ?? profile?.email ?? null;
    const emailVerified = fromClaims.verified || Boolean(profile?.emailVerified);
    const name = (typeof claims.name === 'string' ? claims.name : null) ?? profile?.name ?? null;
    const inserted = await db
      .insert(users)
      .values({ descopeUserId, email, emailVerified, name, lastLoginAt: new Date() })
      .onConflictDoNothing({ target: users.descopeUserId })
      .returning();
    user = inserted[0] ?? (await db.query.users.findFirst({ where: eq(users.descopeUserId, descopeUserId) }));
    if (!user) throw new Error('Failed to provision user record');
    log.info('auth.user_provisioned', { userId: user.id, emailVerified });
    await autoAcceptBoundInvitations(user);
    user = (await db.query.users.findFirst({ where: eq(users.id, user.id) }))!;
  } else if (!user.lastLoginAt || Date.now() - user.lastLoginAt.getTime() > 60 * 60 * 1000) {
    await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, user.id));
    // Pick up invitations created after first sign-in.
    await autoAcceptBoundInvitations(user);
    user = (await db.query.users.findFirst({ where: eq(users.id, user.id) }))!;
  }
  return user;
}

/** Returns the authenticated actor for this request, or null. Never trusts client-supplied roles. */
export const getActor = cache(async (): Promise<Actor | null> => {
  if (!isDatabaseConfigured()) return null;

  if (isDevAuthMockEnabled()) {
    const jar = await cookies();
    const devUserId = verifyDevSession(jar.get(DEV_SESSION_COOKIE)?.value);
    if (devUserId) {
      const user = await getDb().query.users.findFirst({
        where: and(eq(users.id, devUserId), isNotNull(users.devKey)),
      });
      if (user && user.isActive) {
        return {
          user,
          staffRole: user.staffRole,
          memberships: await loadMemberships(user.id),
          authMethod: 'dev-mock',
        };
      }
    }
  }

  const ds = await getDescopeSession();
  if (!ds) return null;
  try {
    const user = await resolveDescopeUser(ds.userId, ds.claims);
    if (!user.isActive) return null;
    return { user, staffRole: user.staffRole, memberships: await loadMemberships(user.id), authMethod: 'descope' };
  } catch (err) {
    log.error('auth.resolve_user_failed', { err });
    return null;
  }
});
