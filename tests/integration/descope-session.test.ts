import { eq } from 'drizzle-orm';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getDb } from '@/db';
import { memberships, organizations, users } from '@/db/schema';
import { resetDb } from '../support/db';

// The verified Descope session each request presents. Roles must come from here and nowhere else.
const session = vi.hoisted(() => ({ claims: null as Record<string, unknown> | null }));
vi.mock('@/lib/auth/descope', async (orig) => ({
  ...(await orig<typeof import('@/lib/auth/descope')>()),
  getDescopeSession: vi.fn(async () =>
    session.claims ? { userId: String(session.claims.sub), claims: session.claims } : null,
  ),
}));

const { getActor } = await import('@/lib/auth/session');

const signIn = (tenants: Record<string, string[]>) => {
  session.claims = {
    sub: 'U-person',
    email: 'person@example.com',
    email_verified: true,
    tenants: Object.fromEntries(
      Object.entries(tenants).map(([id, roles]) => [id, { roles, permissions: [] }]),
    ),
  };
};

describe('roles from the Descope session', () => {
  beforeEach(async () => {
    await resetDb();
    session.claims = null;
  });

  it('gives a staff member the role Descope holds, and copies it to the database', async () => {
    signIn({ 'koral-digital-internal': ['Internal:Employee'] });
    const actor = await getActor();
    expect(actor).toMatchObject({ staffRole: 'employee', memberships: [], authMethod: 'descope' });
    const row = await getDb().query.users.findFirst({ where: eq(users.descopeUserId, 'U-person') });
    expect(row).toMatchObject({ email: 'person@example.com', emailVerified: true, staffRole: 'employee' });

    // A change made in Descope wins over the database's copy at the next request.
    signIn({ 'koral-digital-internal': ['Internal:Contractor'] });
    expect((await getActor())!.staffRole).toBe('contractor');
    signIn({});
    expect((await getActor())!.staffRole).toBeNull();
    expect(
      (await getDb().query.users.findFirst({ where: eq(users.descopeUserId, 'U-person') }))!.staffRole,
    ).toBeNull();
  });

  it('ignores a staff role the database claims but Descope does not', async () => {
    await getDb()
      .insert(users)
      .values({ descopeUserId: 'U-person', email: 'person@example.com', staffRole: 'owner' });
    signIn({});
    expect((await getActor())!.staffRole).toBeNull();
  });

  it('gives a client access to exactly the companies whose tenants grant a role', async () => {
    const db = getDb();
    const [acme] = await db
      .insert(organizations)
      .values({ name: 'Acme', slug: 'acme', descopeTenantId: 'client-acme' })
      .returning();
    await db
      .insert(organizations)
      .values({ name: 'Birch', slug: 'birch', descopeTenantId: 'client-birch', deletedAt: new Date() });
    signIn({
      'client-acme': ['External:ClientOwner'],
      'client-birch': ['External:ClientMember'],
      'client-unknown': ['External:ClientOwner'],
    });
    const actor = await getActor();
    expect(actor!.staffRole).toBeNull();
    expect(actor!.memberships).toEqual([
      { orgId: acme!.id, orgSlug: 'acme', orgName: 'Acme', role: 'client_owner' },
    ]);
    const user = actor!.user;
    expect(
      await db.select({ role: memberships.role }).from(memberships).where(eq(memberships.userId, user.id)),
    ).toEqual([{ role: 'client_owner' }]);

    // Role changed, then access removed, in Descope.
    signIn({ 'client-acme': ['External:ClientReadOnly'] });
    expect((await getActor())!.memberships[0]!.role).toBe('read_only');
    signIn({});
    expect((await getActor())!.memberships).toEqual([]);
    expect(await db.$count(memberships, eq(memberships.userId, user.id))).toBe(0);
  });

  it('has no actor without a Descope session', async () => {
    expect(await getActor()).toBeNull();
  });
});
