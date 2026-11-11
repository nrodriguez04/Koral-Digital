import 'server-only';
import { createSdk, session } from '@descope/nextjs-sdk/server';
import { env, isDescopeConfigured } from '@/lib/env';
import { log } from '@/lib/logger';

export type VerifiedDescopeSession = {
  userId: string;
  claims: Record<string, unknown>;
};

/** Validates the Descope session JWT (DS cookie or Authorization header) server-side. */
export async function getDescopeSession(): Promise<VerifiedDescopeSession | null> {
  if (!isDescopeConfigured()) return null;
  try {
    const info = await session({
      projectId: env().NEXT_PUBLIC_DESCOPE_PROJECT_ID,
      baseUrl: env().NEXT_PUBLIC_DESCOPE_BASE_URL,
      logLevel: 'warn',
    });
    const sub = info?.token?.sub;
    if (!info || typeof sub !== 'string' || !sub) return null;
    return { userId: sub, claims: info.token as Record<string, unknown> };
  } catch (err) {
    log.warn('auth.descope_session_error', { err });
    return null;
  }
}

export const isDescopeManagementConfigured = () =>
  Boolean(env().NEXT_PUBLIC_DESCOPE_PROJECT_ID && env().DESCOPE_MANAGEMENT_KEY);

function managementSdk() {
  if (!isDescopeManagementConfigured()) return null;
  return createSdk({
    projectId: env().NEXT_PUBLIC_DESCOPE_PROJECT_ID,
    managementKey: env().DESCOPE_MANAGEMENT_KEY,
    baseUrl: env().NEXT_PUBLIC_DESCOPE_BASE_URL,
  });
}

/** Loads the verified profile for a Descope user via the management API (if configured). */
export async function loadDescopeProfile(
  userId: string,
): Promise<{ email: string | null; emailVerified: boolean; name: string | null } | null> {
  const sdk = managementSdk();
  if (!sdk) return null;
  try {
    const res = await sdk.management.user.loadByUserId(userId);
    if (!res.ok || !res.data) return null;
    const u = res.data as { email?: string; verifiedEmail?: boolean; name?: string; displayName?: string };
    return {
      email: u.email?.toLowerCase() ?? null,
      emailVerified: Boolean(u.email && u.verifiedEmail),
      name: u.name ?? u.displayName ?? null,
    };
  } catch (err) {
    log.warn('auth.descope_profile_error', { err });
    return null;
  }
}

type DescopeResult<T = unknown> = ({ ok: true } & T) | { ok: false; reason: string };

const NOT_CONFIGURED = { ok: false, reason: 'Descope management key is not configured.' } as const;
const failed = (res: { error?: { errorMessage?: string } }, fallback: string) => ({
  ok: false as const,
  reason: res.error?.errorMessage ?? fallback,
});

/**
 * Invites the person into a tenant with one role: Descope creates the user, grants the role and
 * emails them a sign-in link. Someone who already has a Descope account is not created again;
 * the role is added to their account, and the result says Descope sent no email.
 */
export async function inviteToTenant(input: {
  email: string;
  name?: string | null;
  inviteUrl: string;
  tenantId: string;
  roleName: string;
}): Promise<DescopeResult<{ descopeUserId: string; emailed: boolean }>> {
  const sdk = managementSdk();
  if (!sdk) return NOT_CONFIGURED;
  try {
    const existing = await sdk.management.user.load(input.email);
    if (existing.ok && existing.data?.userId) {
      const granted = await setTenantRole(existing.data.userId, input.tenantId, input.roleName);
      return granted.ok ? { ok: true, descopeUserId: existing.data.userId, emailed: false } : granted;
    }
    const res = await sdk.management.user.invite(input.email, {
      email: input.email,
      displayName: input.name ?? undefined,
      userTenants: [{ tenantId: input.tenantId, roleNames: [input.roleName] }],
      inviteUrl: input.inviteUrl,
      sendMail: true,
    });
    if (!res.ok || !res.data) return failed(res, 'Descope rejected the invitation.');
    const userId = (res.data as { userId?: string }).userId;
    if (!userId) return { ok: false, reason: 'Descope did not return a user ID.' };
    return { ok: true, descopeUserId: userId, emailed: true };
  } catch (err) {
    log.error('auth.descope_invite_error', { err });
    return { ok: false, reason: 'Could not reach Descope.' };
  }
}

/** Gives the user exactly this role in the tenant, or removes them from it when `roleName` is null. */
export async function setTenantRole(
  descopeUserId: string,
  tenantId: string,
  roleName: string | null,
): Promise<DescopeResult> {
  const sdk = managementSdk();
  if (!sdk) return NOT_CONFIGURED;
  try {
    if (roleName === null) {
      const res = await sdk.management.user.removeTenant(descopeUserId, tenantId);
      return res.ok ? { ok: true } : failed(res, 'Descope could not remove the access.');
    }
    const user = await sdk.management.user.loadByUserId(descopeUserId);
    if (!user.ok || !user.data) return failed(user, 'Descope user not found.');
    if (!user.data.userTenants?.some((t) => t.tenantId === tenantId)) {
      const added = await sdk.management.user.addTenant(descopeUserId, tenantId);
      if (!added.ok) return failed(added, 'Descope could not add the user to the tenant.');
    }
    const res = await sdk.management.user.setTenantRoles(descopeUserId, tenantId, [roleName]);
    return res.ok ? { ok: true } : failed(res, 'Descope could not set the role.');
  } catch (err) {
    log.error('auth.descope_role_error', { err });
    return { ok: false, reason: 'Could not reach Descope.' };
  }
}

/** Creates a tenant under `parentTenantId`, or confirms it exists already. */
export async function ensureTenant(input: {
  tenantId: string;
  name: string;
  parentTenantId: string;
}): Promise<DescopeResult> {
  const sdk = managementSdk();
  if (!sdk) return NOT_CONFIGURED;
  try {
    const found = await sdk.management.tenant.load(input.tenantId);
    if (found.ok && found.data) return { ok: true };
    const res = await sdk.management.tenant.createWithId(
      input.tenantId,
      input.name,
      [],
      undefined,
      false,
      false,
      input.parentTenantId,
    );
    return res.ok ? { ok: true } : failed(res, 'Descope could not create the tenant.');
  } catch (err) {
    log.error('auth.descope_tenant_error', { err });
    return { ok: false, reason: 'Could not reach Descope.' };
  }
}
