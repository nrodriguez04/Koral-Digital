import 'server-only';
import { headers } from 'next/headers';
import { isCloudflareWorkers } from './env';

/**
 * Best-effort client IP. Used only for hashed rate limiting.
 *
 * On Cloudflare, `cf-connecting-ip` is set by the edge and cannot be forged,
 * while `x-forwarded-for` keeps whatever the client sent and appends to it.
 * Elsewhere the platform sets x-forwarded-for / x-real-ip.
 */
export async function clientIp(): Promise<string> {
  const h = await headers();
  if (isCloudflareWorkers()) {
    const cf = h.get('cf-connecting-ip');
    if (cf) return cf;
  }
  const fwd = h.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0]!.trim();
  return h.get('x-real-ip') ?? '0.0.0.0';
}
