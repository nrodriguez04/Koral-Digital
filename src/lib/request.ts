import 'server-only';
import { headers } from 'next/headers';

/** Best-effort client IP (Vercel sets x-forwarded-for / x-real-ip). Used only for hashed rate limiting. */
export async function clientIp(): Promise<string> {
  const h = await headers();
  const fwd = h.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0]!.trim();
  return h.get('x-real-ip') ?? '0.0.0.0';
}
