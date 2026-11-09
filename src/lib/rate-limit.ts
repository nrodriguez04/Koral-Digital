import 'server-only';
import { sql } from 'drizzle-orm';
import { getDb } from '@/db';
import { rateLimits } from '@/db/schema';

/**
 * Atomic fixed-window counter stored in Postgres (works on serverless without
 * Redis). Returns whether the request is allowed.
 */
export async function rateLimit(key: string, limit: number, windowSeconds: number) {
  const db = getDb();
  const rows = await db
    .insert(rateLimits)
    .values({ key, count: 1, windowStart: new Date() })
    .onConflictDoUpdate({
      target: rateLimits.key,
      set: {
        count: sql`case when ${rateLimits.windowStart} < now() - make_interval(secs => ${windowSeconds}) then 1 else ${rateLimits.count} + 1 end`,
        windowStart: sql`case when ${rateLimits.windowStart} < now() - make_interval(secs => ${windowSeconds}) then now() else ${rateLimits.windowStart} end`,
      },
    })
    .returning({ count: rateLimits.count });
  const count = rows[0]?.count ?? 1;
  return { allowed: count <= limit, count, remaining: Math.max(0, limit - count) };
}
