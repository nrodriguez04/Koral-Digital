import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

export default async function setup() {
  const url = process.env.TEST_DATABASE_URL ?? 'postgres://postgres@127.0.0.1:5432/koral_test';
  const admin = postgres(url.replace(/\/[^/]+$/, '/postgres'), { max: 1, onnotice: () => {} });
  const dbName = url.split('/').pop()!;
  const exists = await admin`select 1 from pg_database where datname = ${dbName}`;
  if (!exists.length) await admin.unsafe(`create database "${dbName}"`);
  await admin.end();
  const client = postgres(url, { max: 1, onnotice: () => {} });
  await client.unsafe(
    'drop schema if exists public cascade; drop schema if exists drizzle cascade; create schema public;',
  );
  await migrate(drizzle(client), { migrationsFolder: './drizzle' });
  await client.end();
}
