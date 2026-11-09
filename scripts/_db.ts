import 'dotenv/config';
import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../src/db/schema';

config({ path: '.env.local', override: false });

export function scriptDb() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('DATABASE_URL is not set.');
    process.exit(1);
  }
  const client = postgres(url, { max: 1, prepare: false, onnotice: () => {} });
  const db = drizzle(client, { schema, casing: 'snake_case' });
  return { db, client };
}
