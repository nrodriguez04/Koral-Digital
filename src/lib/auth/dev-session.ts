import 'server-only';
import { hmac, safeEqual } from '@/lib/crypto';

export const DEV_SESSION_COOKIE = 'kd_dev_session';

/** Signed value `${userId}.${expires}.${sig}` — development only. */
export function signDevSession(userId: string, ttlSeconds = 60 * 60 * 8) {
  const expires = Math.floor(Date.now() / 1000) + ttlSeconds;
  const payload = `${userId}.${expires}`;
  return `${payload}.${hmac(`dev-session:${payload}`)}`;
}

export function verifyDevSession(value: string | undefined): string | null {
  if (!value) return null;
  const parts = value.split('.');
  if (parts.length !== 3) return null;
  const [userId, expires, sig] = parts as [string, string, string];
  if (!safeEqual(sig, hmac(`dev-session:${userId}.${expires}`))) return null;
  if (Number(expires) < Date.now() / 1000) return null;
  return userId;
}
