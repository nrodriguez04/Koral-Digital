import 'server-only';
import { and, eq, gt, inArray, isNotNull, isNull, or } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { cache } from 'react';
import { getDb, isDatabaseConfigured } from '@/db';
import {
  invitations,
  memberships,
  organizations,
  users,
  type MemberRole,
  type StaffRole,
  type User,
} from '@/db/schema';
import { isDevAuthMockEnabled } from '@/lib/env';
import { log } from '@/lib/logger';
import { DEV_SESSION_COOKIE, verifyDevSession } from './dev-session';
import { getDescopeSession, loadDescopeProfile } from './descope';
import { clientRolesFromClaims, staffRoleFromClaims } from './descope-roles';
import { recordAudit } from '@/lib/audit';

export type ActorMembership = { orgId: string; orgSlug: string; orgName: string; role: MemberRole };

export type Actor = {
  user: User;
  staffRole: StaffRole | null;
  memberships: ActorMembership[];
  authMethod: 'descope' | 'dev-mock';
};

/** Development accounts only: their roles live in the database, since Descope never sees them. */
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

/**
 * Roles come from the verified Descope session: the staff role from the internal tenant, and a
 * client role for each client company's tenant. The database keeps a copy for staff and member
 * lists, updated here whenever it differs from what Descope says.
 */
async function syncDescopeAccess(
  user: User,
  claims: Record<string, unknown>,
): Promise<{ staffRole: StaffRole | null; memberships: ActorMembership[] }> {
  const db = getDb();
  const staffRole = staffRoleFromClaims(claims);
  const clientRoles = clientRolesFromClaims(claims);
  const orgs = clientRoles.size
    ? await db
        .select({
          id: organizations.id,
          slug: organizations.slug,
          name: organizations.name,
          tenantId: organizations.descopeTenantId,
        })
        .from(organizations)
        .where(
          and(
            inArray(organizations.descopeTenantId, [...clientRoles.keys()]),
            isNull(organizations.deletedAt),
          ),
        )
    : [];
  const granted: ActorMembership[] = orgs.map((o) => ({
    orgId: o.id,
    orgSlug: o.slug,
    orgName: o.name,
    role: clientRoles.get(o.tenantId!)!,
  }));

  if (user.staffRole !== staffRole) await db.update(users).set({ staffRole }).where(eq(users.id, user.id));
  const current = await db
    .select({ id: memberships.id, orgId: memberships.orgId, role: memberships.role })
    .from(memberships)
    .where(eq(memberships.userId, user.id));
  for (const g of granted) {
    const row = current.find((c) => c.orgId === g.orgId);
    if (!row)
      await db
        .insert(memberships)
        .values({ orgId: g.orgId, userId: user.id, role: g.role })
        .onConflictDoNothing();
    else if (row.role !== g.role)
      await db.update(memberships).set({ role: g.role }).where(eq(memberships.id, row.id));
  }
  const stale = current.filter((c) => !granted.some((g) => g.orgId === c.orgId)).map((c) => c.id);
  if (stale.length) await db.delete(memberships).where(inArray(memberships.id, stale));

  return { staffRole, memberships: granted };
}

function claimEmail(claims: Record<string, unknown>): { email: string | null; verified: boolean } {
  const email = typeof claims.email === 'string' ? claims.email.toLowerCase() : null;
  const verified = claims.email_verified === true || claims.verifiedEmail === true;
  return { email, verified: Boolean(email && verified) };
}

/**
 * Marks as accepted the invitations bound to this identity: delivered via Descope to this exact
 * user ID, or addressed to an email address Descope has verified for this user. Descope already
 * granted their roles when the invitation was sent.
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
    await acceptInvitationForUser(inv, user, 'auto_bound_identity', { grantLocally: false });
  }
}

/**
 * Marks the invitation used. With `grantLocally` (development accounts, which Descope never sees)
 * it also grants the invited role in the database; for everyone else Descope holds the role.
 */
export async function acceptInvitationForUser(
  inv: typeof invitations.$inferSelect,
  user: User,
  via: 'auto_bound_identity' | 'token_link',
  { grantLocally }: { grantLocally: boolean },
) {
  const db = getDb();
  await db.transaction(async (tx) => {
    const claimed = await tx
      .update(invitations)
      .set({ status: 'accepted', acceptedById: user.id, acceptedAt: new Date() })
      .where(and(eq(invitations.id, inv.id), eq(invitations.status, 'pending')))
      .returning({ id: invitations.id });
    if (claimed.length === 0) return; // already used — single use
    if (!grantLocally) return;
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
    // Fill in an email Descope could not supply at first sign-in (no management key or claim then).
    const profile = user.email ? null : await loadDescopeProfile(descopeUserId);
    await db
      .update(users)
      .set({
        lastLoginAt: new Date(),
        ...(profile?.email ? { email: profile.email, emailVerified: profile.emailVerified } : {}),
        ...(profile?.name && !user.name ? { name: profile.name } : {}),
      })
      .where(eq(users.id, user.id));
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
    const access = await syncDescopeAccess(user, ds.claims);
    return {
      user: { ...user, staffRole: access.staffRole },
      staffRole: access.staffRole,
      memberships: access.memberships,
      authMethod: 'descope',
    };
  } catch (err) {
    log.error('auth.resolve_user_failed', { err });
    return null;
  }
});
