import 'server-only';
import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

export class DatabaseNotConfiguredError extends Error {
  constructor() {
    super('DATABASE_URL is not configured.');
    this.name = 'DatabaseNotConfiguredError';
  }
}

type Db = PostgresJsDatabase<typeof schema>;

const globalForDb = globalThis as unknown as { __koralSql?: postgres.Sql; __koralDb?: Db };

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

/**
 * Lazily creates a pooled connection. `prepare: false` keeps us compatible with
 * transaction-mode poolers (Supabase Supavisor / PgBouncer / Neon pooler).
 */
export function getDb(): Db {
  if (globalForDb.__koralDb) return globalForDb.__koralDb;
  const url = process.env.DATABASE_URL;
  if (!url) throw new DatabaseNotConfiguredError();
  const client = postgres(url, {
    max: Number(process.env.DATABASE_POOL_MAX ?? 5),
    prepare: false,
    idle_timeout: 20,
    connect_timeout: 10,
    onnotice: () => {},
  });
  const db = drizzle(client, { schema, casing: 'snake_case' });
  globalForDb.__koralSql = client;
  globalForDb.__koralDb = db;
  return db;
}

export { schema };
