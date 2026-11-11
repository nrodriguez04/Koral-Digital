import type { MemberRole, StaffRole } from '@/db/schema';

export const STAFF_PERMISSIONS = {
  'leads:read': ['superadmin', 'admin', 'sales', 'delivery'],
  'leads:write': ['superadmin', 'admin', 'sales'],
  'leads:export': ['superadmin', 'admin', 'sales'],
  'proposals:write': ['superadmin', 'admin', 'sales'],
  'clients:read': ['superadmin', 'admin', 'sales', 'delivery'],
  'clients:write': ['superadmin', 'admin', 'delivery'],
  'clients:convert': ['superadmin', 'admin', 'sales'],
  'members:manage': ['superadmin', 'admin', 'delivery'],
  'projects:write': ['superadmin', 'admin', 'delivery'],
  'tickets:write': ['superadmin', 'admin', 'delivery', 'sales'],
  'files:write': ['superadmin', 'admin', 'delivery'],
  'invoices:write': ['superadmin', 'admin', 'sales'],
  'tasks:write': ['superadmin', 'admin', 'sales', 'delivery'],
  'content:write': ['superadmin', 'admin'],
  'settings:write': ['superadmin', 'admin'],
  'staff:manage': ['superadmin', 'admin'],
  'audit:read': ['superadmin', 'admin'],
  'analytics:read': ['superadmin', 'admin', 'sales'],
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

/** Which staff roles an admin may grant. Only superadmin can grant admin/superadmin. */
export function grantableStaffRoles(granter: StaffRole | null): StaffRole[] {
  if (granter === 'superadmin') return ['superadmin', 'admin', 'sales', 'delivery'];
  if (granter === 'admin') return ['sales', 'delivery'];
  return [];
}
