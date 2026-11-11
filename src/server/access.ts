import 'server-only';
import { and, eq } from 'drizzle-orm';
import { getDb } from '@/db';
import {
  memberships,
  organizations,
  users,
  type MemberRole,
  type Organization,
  type StaffRole,
  type User,
} from '@/db/schema';
import { ensureTenant, setTenantRole } from '@/lib/auth/descope';
import {
  DESCOPE_CLIENTS_PARENT_TENANT,
  DESCOPE_STAFF_TENANT,
  MEMBER_ROLE_NAMES,
  STAFF_ROLE_NAMES,
  clientTenantId,
} from '@/lib/auth/descope-roles';
import { log } from '@/lib/logger';

/**
 * Changes to who holds which role. Descope is the source of truth, so each change is made there
 * first and copied to the database only once Descope has accepted it. Development accounts have
 * no Descope identity and change in the database alone.
 */

type Result<T = unknown> = ({ ok: true } & T) | { ok: false; reason: string };

/** The client company's Descope tenant, created under the external tenant on first use. */
export async function ensureOrgTenant(
  org: Pick<Organization, 'id' | 'slug' | 'name' | 'descopeTenantId'>,
): Promise<Result<{ tenantId: string }>> {
  if (org.descopeTenantId) return { ok: true, tenantId: org.descopeTenantId };
  const tenantId = clientTenantId(org.slug);
  const created = await ensureTenant({
    tenantId,
    name: org.name,
    parentTenantId: DESCOPE_CLIENTS_PARENT_TENANT,
  });
  if (!created.ok) {
    log.warn('access.tenant_not_created', { orgId: org.id, reason: created.reason });
    return created;
  }
  await getDb().update(organizations).set({ descopeTenantId: tenantId }).where(eq(organizations.id, org.id));
  return { ok: true, tenantId };
}

/** Sets or removes (`null`) the person's staff role. */
export async function setStaffRole(target: User, role: StaffRole | null): Promise<Result> {
  if (target.descopeUserId) {
    const res = await setTenantRole(
      target.descopeUserId,
      DESCOPE_STAFF_TENANT,
      role ? STAFF_ROLE_NAMES[role] : null,
    );
    if (!res.ok) return res;
  }
  await getDb().update(users).set({ staffRole: role }).where(eq(users.id, target.id));
  return { ok: true };
}

/** Sets or removes (`null`) the person's role in a client company. */
export async function setMemberRole(
  org: Pick<Organization, 'id' | 'slug' | 'name' | 'descopeTenantId'>,
  target: User,
  role: MemberRole | null,
): Promise<Result> {
  if (target.descopeUserId) {
    const tenant = await ensureOrgTenant(org);
    if (!tenant.ok) return tenant;
    const res = await setTenantRole(
      target.descopeUserId,
      tenant.tenantId,
      role ? MEMBER_ROLE_NAMES[role] : null,
    );
    if (!res.ok) return res;
  }
  const db = getDb();
  const where = and(eq(memberships.orgId, org.id), eq(memberships.userId, target.id));
  if (role === null) await db.delete(memberships).where(where);
  else
    await db
      .insert(memberships)
      .values({ orgId: org.id, userId: target.id, role })
      .onConflictDoUpdate({ target: [memberships.orgId, memberships.userId], set: { role } });
  return { ok: true };
}
