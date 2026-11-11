import { NextResponse } from 'next/server';
import { sql } from 'drizzle-orm';
import { getDb, isDatabaseConfigured } from '@/db';
import { isDescopeConfigured, isEmailConfigured, env } from '@/lib/env';
import { log } from '@/lib/logger';

export const dynamic = 'force-dynamic';

/** Liveness + configuration summary. Reveals no secrets or data. */
export async function GET() {
  let database: 'ok' | 'not_configured' | 'error' = 'not_configured';
  if (isDatabaseConfigured()) {
    try {
      await getDb().execute(sql`select 1`);
      database = 'ok';
    } catch (err) {
      database = 'error';
      // The response stays generic; the reason goes to the Worker's logs.
      log.warn('health.database_error', { err });
    }
  }
  return NextResponse.json(
    {
      status: database === 'error' ? 'degraded' : 'ok',
      database,
      auth: isDescopeConfigured() ? 'descope' : 'not_configured',
      email: isEmailConfigured() ? 'configured' : 'not_configured',
      storage: env().STORAGE_DRIVER,
    },
    { status: database === 'error' ? 503 : 200, headers: { 'cache-control': 'no-store' } },
  );
}
