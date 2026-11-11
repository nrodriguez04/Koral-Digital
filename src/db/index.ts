import 'server-only';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { isCloudflareWorkers } from '@/lib/env';
import * as schema from './schema';

export class DatabaseNotConfiguredError extends Error {
  constructor() {
    super('DATABASE_URL is not configured.');
    this.name = 'DatabaseNotConfiguredError';
  }
}

type Db = PostgresJsDatabase<typeof schema>;

const globalForDb = globalThis as unknown as { __koralSql?: postgres.Sql; __koralDb?: Db };

/**
 * On Cloudflare Workers a socket belongs to the request that opened it, so a
 * client kept for the next request fails there. Each request gets its own
 * client, keyed by its execution context and garbage-collected with it.
 */
const workerDbs = new WeakMap<object, Db>();

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

/**
 * `prepare: false` keeps us compatible with transaction-mode poolers
 * (Supabase Supavisor / PgBouncer / Neon pooler).
 */
function connect(url: string, options: postgres.Options<Record<string, postgres.PostgresType>> = {}) {
  const client = postgres(url, {
    max: Number(process.env.DATABASE_POOL_MAX ?? 5),
    prepare: false,
    idle_timeout: 20,
    connect_timeout: 10,
    onnotice: () => {},
    ...options,
  });
  return { client, db: drizzle(client, { schema, casing: 'snake_case' }) };
}

/** A pooled connection per process in Node; a client per request on Workers. */
export function getDb(): Db {
  if (isCloudflareWorkers()) {
    const { ctx } = getCloudflareContext();
    const existing = workerDbs.get(ctx);
    if (existing) return existing;
    const url = process.env.DATABASE_URL;
    if (!url) throw new DatabaseNotConfiguredError();
    // No native array columns (lists are jsonb), so skip the type lookup
    // that would otherwise cost every request an extra round trip.
    const { db } = connect(url, { fetch_types: false });
    workerDbs.set(ctx, db);
    return db;
  }
  if (globalForDb.__koralDb) return globalForDb.__koralDb;
  const url = process.env.DATABASE_URL;
  if (!url) throw new DatabaseNotConfiguredError();
  const { client, db } = connect(url);
  globalForDb.__koralSql = client;
  globalForDb.__koralDb = db;
  return db;
}

export { schema };
