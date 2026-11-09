import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getDb, isDatabaseConfigured } from '@/db';
import { analyticsEvents } from '@/db/schema';
import { ipFingerprint } from '@/lib/crypto';
import { log } from '@/lib/logger';
import { rateLimit } from '@/lib/rate-limit';
import { clientIp } from '@/lib/request';

const ALLOWED = ['page_view', 'cta_click', 'booking_click', 'contact_start', 'contact_submit_success', 'contact_submit_error'] as const;

const schema = z.object({
  name: z.enum(ALLOWED),
  path: z.string().max(300).startsWith('/').optional(),
  sessionId: z.string().max(64).regex(/^[a-z0-9]+$/).optional(),
  utmSource: z.string().max(120).optional(),
  utmMedium: z.string().max(120).optional(),
  utmCampaign: z.string().max(160).optional(),
  referrer: z.string().max(500).optional(),
  props: z.record(z.string().max(40), z.string().max(120)).optional(),
});

function host(url?: string) {
  if (!url) return null;
  try {
    return new URL(url).host.slice(0, 120);
  } catch {
    return null;
  }
}

/** First-party, cookieless event collection. No PII accepted or stored. */
export async function POST(req: Request) {
  if (!isDatabaseConfigured()) return new NextResponse(null, { status: 204 });
  const origin = req.headers.get('origin');
  if (origin && new URL(origin).host !== req.headers.get('host')) {
    return NextResponse.json({ error: 'Cross-origin not allowed' }, { status: 403 });
  }
  const text = await req.text();
  if (text.length > 4000) return NextResponse.json({ error: 'Too large' }, { status: 413 });
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  const parsed = schema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid event' }, { status: 400 });
  try {
    const rl = await rateLimit(`events:${ipFingerprint(await clientIp())}`, 120, 60);
    if (!rl.allowed) return new NextResponse(null, { status: 429 });
    const e = parsed.data;
    await getDb()
      .insert(analyticsEvents)
      .values({
        name: e.name,
        path: e.path,
        sessionId: e.sessionId,
        utmSource: e.utmSource,
        utmMedium: e.utmMedium,
        utmCampaign: e.utmCampaign,
        referrerHost: host(e.referrer),
        props: Object.fromEntries(Object.entries(e.props ?? {}).slice(0, 8)),
      });
  } catch (err) {
    log.warn('events.write_failed', { err });
  }
  return new NextResponse(null, { status: 204 });
}
