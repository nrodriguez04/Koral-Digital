import 'server-only';
import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { appSecret } from './env';

export const sha256 = (input: string) => createHash('sha256').update(input).digest('hex');

export const hmac = (input: string) => createHmac('sha256', appSecret()).update(input).digest('hex');

export function randomToken(bytes = 32) {
  return randomBytes(bytes).toString('base64url');
}

export function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

/** Salted, non-reversible fingerprint of an IP for rate limiting. Rotates daily. */
export function ipFingerprint(ip: string) {
  const day = new Date().toISOString().slice(0, 10);
  return hmac(`ip:${day}:${ip}`).slice(0, 32);
}
