import 'dotenv/config';
import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

config({ path: '.env.local', override: false });

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.warn('[migrate] DATABASE_URL not set — skipping migrations.');
    return;
  }
  // Prefer a direct (non-pooled) connection for DDL when provided.
  const client = postgres(process.env.DATABASE_URL_UNPOOLED || url, { max: 1, prepare: false, onnotice: () => {} });
  try {
    await migrate(drizzle(client), { migrationsFolder: './drizzle' });
    console.log('[migrate] Migrations applied.');
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error('[migrate] Failed:', err);
  process.exit(1);
});
