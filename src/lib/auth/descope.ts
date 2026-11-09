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

/**
 * Creates (or re-invites) the user in Descope and asks Descope to email them a
 * sign-in invitation. Returns the Descope user ID so the invitation can be bound
 * to that exact identity.
 */
export async function sendDescopeInvite(input: {
  email: string;
  name?: string | null;
  inviteUrl: string;
}): Promise<{ ok: true; descopeUserId: string } | { ok: false; reason: string }> {
  const sdk = managementSdk();
  if (!sdk) return { ok: false, reason: 'Descope management key is not configured.' };
  try {
    const res = await sdk.management.user.invite(input.email, {
      email: input.email,
      displayName: input.name ?? undefined,
      inviteUrl: input.inviteUrl,
      sendMail: true,
    });
    if (!res.ok || !res.data) {
      return { ok: false, reason: res.error?.errorMessage ?? 'Descope rejected the invitation.' };
    }
    const userId = (res.data as { userId?: string }).userId;
    if (!userId) return { ok: false, reason: 'Descope did not return a user ID.' };
    return { ok: true, descopeUserId: userId };
  } catch (err) {
    log.error('auth.descope_invite_error', { err });
    return { ok: false, reason: 'Could not reach Descope.' };
  }
}
