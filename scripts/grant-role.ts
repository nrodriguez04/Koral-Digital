/**
 * Operator CLI to grant a Koral staff role to an existing user (who has signed
 * in at least once). Requires direct database access — intentionally not
 * exposed over HTTP.
 *
 *   npm run admin:grant -- --email you@koraldigital.com --role superadmin
 *   npm run admin:grant -- --descope-user-id U2abc... --role admin
 */
import { eq } from 'drizzle-orm';
import { auditEvents, staffRoleEnum, users } from '../src/db/schema';
import { scriptDb } from './_db';

function arg(name: string) {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

async function main() {
  const role = arg('role') as (typeof staffRoleEnum.enumValues)[number] | 'none' | undefined;
  const email = arg('email')?.toLowerCase();
  const descopeUserId = arg('descope-user-id');
  if (!role || (!email && !descopeUserId)) {
    console.error(
      'Usage: --role <superadmin|admin|sales|delivery|none> (--email <email> | --descope-user-id <id>)',
    );
    process.exit(1);
  }
  if (role !== 'none' && !staffRoleEnum.enumValues.includes(role)) {
    console.error(`Invalid role ${role}`);
    process.exit(1);
  }
  const { db, client } = scriptDb();
  try {
    const where = descopeUserId ? eq(users.descopeUserId, descopeUserId) : eq(users.email, email!);
    const matches = await db.select().from(users).where(where);
    if (matches.length !== 1) {
      console.error(
        matches.length === 0
          ? 'No matching user. The person must sign in once first so their account is created.'
          : 'Multiple users match that email — use --descope-user-id instead.',
      );
      process.exit(1);
    }
    const u = matches[0]!;
    await db
      .update(users)
      .set({ staffRole: role === 'none' ? null : role })
      .where(eq(users.id, u.id));
    await db.insert(auditEvents).values({
      actorLabel: 'cli:admin:grant',
      action: 'staff.role_changed',
      entityType: 'user',
      entityId: u.id,
      metadata: { from: u.staffRole, to: role },
    });
    console.log(`Updated ${u.email ?? u.descopeUserId}: staff role ${u.staffRole ?? 'none'} → ${role}`);
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
