import 'server-only';
import { and, eq, isNull } from 'drizzle-orm';
import { notFound, redirect } from 'next/navigation';
import { getDb } from '@/db';
import { organizations, type MemberRole, type Organization, type StaffRole } from '@/db/schema';
import { ForbiddenError, NotFoundError, UnauthenticatedError } from './errors';
import { memberCan, staffCan, type ClientPermission, type StaffPermission } from './permissions';
import { getActor, type Actor } from './session';

export type StaffActor = Actor & { staffRole: StaffRole };

export const actorLabel = (a: Actor) => a.user.email ?? a.user.name ?? a.user.id;
export const auditActor = (a: Actor) => ({ id: a.user.id, label: actorLabel(a) });

/* ---------- Throwing guards (server actions, route handlers, data layer) ---------- */

export async function requireActor(): Promise<Actor> {
  const actor = await getActor();
  if (!actor) throw new UnauthenticatedError();
  return actor;
}

export async function requireStaff(permission?: StaffPermission): Promise<StaffActor> {
  const actor = await requireActor();
  if (!actor.staffRole) throw new ForbiddenError('Koral staff access required.');
  if (permission && !staffCan(actor.staffRole, permission)) throw new ForbiddenError();
  return actor as StaffActor;
}

export type OrgContext = { actor: Actor; org: Organization; role: MemberRole };

/**
 * Resolves an organization ONLY through the actor's own memberships. An org the
 * actor is not a member of is reported as "not found" (no existence leak).
 */
export async function requireOrgMember(orgSlug: string, permission?: ClientPermission): Promise<OrgContext> {
  const actor = await requireActor();
  const membership = actor.memberships.find((m) => m.orgSlug === orgSlug);
  if (!membership) throw new NotFoundError();
  const org = await getDb().query.organizations.findFirst({
    where: and(eq(organizations.id, membership.orgId), isNull(organizations.deletedAt)),
  });
  if (!org) throw new NotFoundError();
  if (permission && !memberCan(membership.role, permission)) throw new ForbiddenError();
  return { actor, org, role: membership.role };
}

/* ---------- Page guards (redirect / 404 instead of throwing) ---------- */

export async function pageRequireStaff(permission?: StaffPermission, next = '/app'): Promise<StaffActor> {
  const actor = await getActor();
  if (!actor) redirect(`/sign-in?next=${encodeURIComponent(next)}`);
  if (!actor.staffRole) redirect('/no-access');
  if (permission && !staffCan(actor.staffRole, permission)) redirect('/app?denied=1');
  return actor as StaffActor;
}

export async function pageRequireOrgMember(
  orgSlug: string,
  permission?: ClientPermission,
): Promise<OrgContext> {
  const actor = await getActor();
  if (!actor) redirect(`/sign-in?next=${encodeURIComponent(`/portal/${orgSlug}`)}`);
  try {
    return await requireOrgMember(orgSlug, permission);
  } catch (err) {
    if (err instanceof NotFoundError) notFound();
    if (err instanceof ForbiddenError) redirect(`/portal/${orgSlug}?denied=1`);
    throw err;
  }
}

/* ---------- Server action result helper ---------- */

export type ActionResult<T = undefined> =
  | { ok: true; data?: T; message?: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string[] | undefined> };

/** Converts auth/validation errors into a safe, serializable result. */
export async function runAction<T>(fn: () => Promise<ActionResult<T>>): Promise<ActionResult<T>> {
  try {
    return await fn();
  } catch (err) {
    if (err instanceof UnauthenticatedError)
      return { ok: false, error: 'Your session has expired. Please sign in again.' };
    if (err instanceof ForbiddenError) return { ok: false, error: err.message };
    if (err instanceof NotFoundError) return { ok: false, error: 'Not found.' };
    // Let Next.js redirect/notFound signals propagate.
    if (err && typeof err === 'object' && 'digest' in err) throw err;
    const { log } = await import('@/lib/logger');
    log.error('action.unhandled_error', { err });
    return { ok: false, error: 'Something went wrong. Please try again.' };
  }
}
