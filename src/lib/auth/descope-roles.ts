import type { MemberRole, StaffRole } from '@/db/schema';

/**
 * How Koral's access model is laid out in Descope, which decides who holds which role:
 *  - Staff belong to the internal tenant with one Internal:* role.
 *  - Each client company is its own tenant, created under the external tenant, and its people
 *    hold one External:Client* role there.
 * What each role may do is the app's rule, in permissions.ts.
 */
export const DESCOPE_STAFF_TENANT = 'koral-digital-internal';
export const DESCOPE_CLIENTS_PARENT_TENANT = 'koral-digital-external';

/** Descope role name for each staff role, highest first. */
export const STAFF_ROLE_NAMES: Record<StaffRole, string> = {
  owner: 'Internal:Owner',
  employee: 'Internal:Employee',
  contractor: 'Internal:Contractor',
};

/** Descope role name for each client role, highest first. */
export const MEMBER_ROLE_NAMES: Record<MemberRole, string> = {
  client_owner: 'External:ClientOwner',
  client_member: 'External:ClientMember',
  read_only: 'External:ClientReadOnly',
};

/** Descope permission each role carries, so the Descope console shows what kind of user it is. */
export const ROLE_PERMISSIONS: Record<string, string> = {
  'Internal:Owner': 'Internal:Owner',
  'Internal:Employee': 'Internal:Employee',
  'Internal:Contractor': 'Internal:Contractor',
  'External:ClientOwner': 'External:Client',
  'External:ClientMember': 'External:Client',
  'External:ClientReadOnly': 'External:Client',
};

type TenantClaims = Record<string, { roles?: unknown } | undefined>;

const rolesIn = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((r): r is string => typeof r === 'string') : [];

function highest<R extends string>(names: Record<R, string>, held: string[]): R | null {
  for (const [role, name] of Object.entries(names) as [R, string][]) if (held.includes(name)) return role;
  return null;
}

/** The staff role a verified session grants: internal-tenant roles, or project-wide ones. */
export function staffRoleFromClaims(claims: Record<string, unknown>): StaffRole | null {
  const tenants = (claims.tenants ?? {}) as TenantClaims;
  const held = [...rolesIn(tenants[DESCOPE_STAFF_TENANT]?.roles), ...rolesIn(claims.roles)];
  return highest(STAFF_ROLE_NAMES, held);
}

/**
 * The client role a verified session grants in each tenant, keyed by tenant ID. Only tenant
 * roles count: a client role says nothing until it names the company it belongs to.
 */
export function clientRolesFromClaims(claims: Record<string, unknown>): Map<string, MemberRole> {
  const tenants = (claims.tenants ?? {}) as TenantClaims;
  const out = new Map<string, MemberRole>();
  for (const [tenantId, t] of Object.entries(tenants)) {
    if (tenantId === DESCOPE_STAFF_TENANT || tenantId === DESCOPE_CLIENTS_PARENT_TENANT) continue;
    const role = highest(MEMBER_ROLE_NAMES, rolesIn(t?.roles));
    if (role) out.set(tenantId, role);
  }
  return out;
}

/** Tenant ID for a client company: readable in the Descope console, stable for its lifetime. */
export const clientTenantId = (orgSlug: string) => `client-${orgSlug}`;
