import type { MemberRole, StaffRole } from '@/db/schema';

/**
 * What each staff role may do. Who holds which role is decided in Descope (see descope-roles.ts);
 * this table is the app's rule for what that role means. Owner: everything. Employee: everything
 * except staff, site settings and the audit log. Contractor: delivery work on client accounts,
 * with no access to leads, proposals, invoices or analytics.
 */
export const STAFF_PERMISSIONS = {
  'leads:read': ['owner', 'employee'],
  'leads:write': ['owner', 'employee'],
  'leads:export': ['owner', 'employee'],
  'proposals:write': ['owner', 'employee'],
  'clients:read': ['owner', 'employee', 'contractor'],
  'clients:write': ['owner', 'employee', 'contractor'],
  'clients:convert': ['owner', 'employee'],
  'members:manage': ['owner', 'employee'],
  'projects:write': ['owner', 'employee', 'contractor'],
  'tickets:write': ['owner', 'employee', 'contractor'],
  'files:write': ['owner', 'employee', 'contractor'],
  'invoices:write': ['owner', 'employee'],
  'tasks:write': ['owner', 'employee'],
  'content:write': ['owner', 'employee'],
  'settings:write': ['owner'],
  'staff:manage': ['owner'],
  'audit:read': ['owner'],
  'analytics:read': ['owner', 'employee'],
} as const satisfies Record<string, readonly StaffRole[]>;

export type StaffPermission = keyof typeof STAFF_PERMISSIONS;

export function staffCan(role: StaffRole | null | undefined, permission: StaffPermission): boolean {
  if (!role) return false;
  return (STAFF_PERMISSIONS[permission] as readonly StaffRole[]).includes(role);
}

export const CLIENT_PERMISSIONS = {
  'portal:read': ['client_owner', 'client_member', 'read_only'],
  'tickets:create': ['client_owner', 'client_member'],
  'files:upload': ['client_owner', 'client_member'],
  'proposals:acknowledge': ['client_owner'],
  'team:manage': ['client_owner'],
} as const satisfies Record<string, readonly MemberRole[]>;

export type ClientPermission = keyof typeof CLIENT_PERMISSIONS;

export function memberCan(role: MemberRole | null | undefined, permission: ClientPermission): boolean {
  if (!role) return false;
  return (CLIENT_PERMISSIONS[permission] as readonly MemberRole[]).includes(role);
}

/** Roles a client_owner may assign. Never staff roles, never client_owner (prevents silent elevation). */
export const CLIENT_ASSIGNABLE_ROLES: MemberRole[] = ['client_member', 'read_only'];

/** Which staff roles someone may grant from the app. Only an owner manages staff. */
export function grantableStaffRoles(granter: StaffRole | null): StaffRole[] {
  if (granter === 'owner') return ['owner', 'employee', 'contractor'];
  return [];
}
