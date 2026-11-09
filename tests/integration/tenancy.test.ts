import { eq } from 'drizzle-orm';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getDb } from '@/db';
import {
  files,
  invitations,
  leads,
  memberships,
  organizations,
  projects,
  supportTickets,
  ticketMessages,
  users,
  type User,
} from '@/db/schema';
import type { Actor } from '@/lib/auth/session';
import { resetDb } from '../support/db';

vi.mock('next/cache', () => ({ revalidatePath: vi.fn(), revalidateTag: vi.fn() }));
const current: { actor: Actor | null } = { actor: null };
vi.mock('@/lib/auth/session', async (orig) => ({
  ...(await orig<typeof import('@/lib/auth/session')>()),
  getActor: vi.fn(async () => current.actor),
}));

const { requireOrgMember, requireStaff } = await import('@/lib/auth/guards');
const { NotFoundError, UnauthenticatedError } = await import('@/lib/auth/errors');
const { portalProject, portalProjects, portalBilling, portalFiles } = await import('@/server/portal');
const { getTicketThread } = await import('@/server/tickets');
const { authorizeFileDownload } = await import('@/server/files');
const portalActions = await import('@/app/portal/[org]/actions');
const leadActions = await import('@/app/app/leads/actions');
const settingsActions = await import('@/app/app/settings/actions');
const clientActions = await import('@/app/app/clients/actions');
const { acceptInvitationByToken, createInvitation } = await import('@/server/invitations');

type Fixture = Awaited<ReturnType<typeof seed>>;

async function seed() {
  const db = getDb();
  const mkUser = async (email: string, staffRole: User['staffRole'] = null, emailVerified = true) =>
    (
      await db
        .insert(users)
        .values({ email, emailVerified, staffRole, descopeUserId: `U-${email}` })
        .returning()
    )[0]!;
  const admin = await mkUser('admin@koral.test', 'superadmin');
  const sales = await mkUser('sales@koral.test', 'sales');
  const delivery = await mkUser('delivery@koral.test', 'delivery');
  const ownerA = await mkUser('owner@a.test');
  const readerA = await mkUser('reader@a.test');
  const ownerB = await mkUser('owner@b.test');
  const outsider = await mkUser('outsider@c.test');
  const [orgA] = await db.insert(organizations).values({ name: 'Org A', slug: 'org-a' }).returning();
  const [orgB] = await db.insert(organizations).values({ name: 'Org B', slug: 'org-b' }).returning();
  await db.insert(memberships).values([
    { orgId: orgA!.id, userId: ownerA.id, role: 'client_owner' },
    { orgId: orgA!.id, userId: readerA.id, role: 'read_only' },
    { orgId: orgB!.id, userId: ownerB.id, role: 'client_owner' },
  ]);
  const [projA] = await db.insert(projects).values({ orgId: orgA!.id, name: 'A project' }).returning();
  const [projB] = await db.insert(projects).values({ orgId: orgB!.id, name: 'B project' }).returning();
  const [hiddenA] = await db
    .insert(projects)
    .values({ orgId: orgA!.id, name: 'A hidden', clientVisible: false })
    .returning();
  const [ticketA] = await db
    .insert(supportTickets)
    .values({ orgId: orgA!.id, subject: 'A ticket' })
    .returning();
  const [ticketB] = await db
    .insert(supportTickets)
    .values({ orgId: orgB!.id, subject: 'B ticket' })
    .returning();
  await db.insert(ticketMessages).values([
    { orgId: orgA!.id, ticketId: ticketA!.id, body: 'visible' },
    { orgId: orgA!.id, ticketId: ticketA!.id, body: 'secret internal', internalNote: true },
    { orgId: orgB!.id, ticketId: ticketB!.id, body: 'B only' },
  ]);
  const [fileA] = await db
    .insert(files)
    .values({
      orgId: orgA!.id,
      name: 'a.pdf',
      contentType: 'application/pdf',
      sizeBytes: 1,
      storageDriver: 'local',
      storageKey: 'a',
      visibility: 'client',
    })
    .returning();
  const [fileAInternal] = await db
    .insert(files)
    .values({
      orgId: orgA!.id,
      name: 'internal.pdf',
      contentType: 'application/pdf',
      sizeBytes: 1,
      storageDriver: 'local',
      storageKey: 'ai',
      visibility: 'internal',
    })
    .returning();
  const [fileB] = await db
    .insert(files)
    .values({
      orgId: orgB!.id,
      name: 'b.pdf',
      contentType: 'application/pdf',
      sizeBytes: 1,
      storageDriver: 'local',
      storageKey: 'b',
      visibility: 'client',
    })
    .returning();
  const [leadX] = await db.insert(leads).values({ title: 'Lead X' }).returning();
  return {
    admin,
    sales,
    delivery,
    ownerA,
    readerA,
    ownerB,
    outsider,
    orgA: orgA!,
    orgB: orgB!,
    projA: projA!,
    projB: projB!,
    hiddenA: hiddenA!,
    ticketA: ticketA!,
    ticketB: ticketB!,
    fileA: fileA!,
    fileAInternal: fileAInternal!,
    fileB: fileB!,
    leadX: leadX!,
  };
}

async function actorFor(user: User): Promise<Actor> {
  const db = getDb();
  const fresh = (await db.query.users.findFirst({ where: eq(users.id, user.id) }))!;
  const ms = await db
    .select({
      orgId: memberships.orgId,
      role: memberships.role,
      orgSlug: organizations.slug,
      orgName: organizations.name,
    })
    .from(memberships)
    .innerJoin(organizations, eq(organizations.id, memberships.orgId))
    .where(eq(memberships.userId, user.id));
  return { user: fresh, staffRole: fresh.staffRole, memberships: ms, authMethod: 'descope' };
}
const as = async (u: User | null) => (current.actor = u ? await actorFor(u) : null);
const fd = (o: Record<string, string>) => {
  const f = new FormData();
  for (const [k, v] of Object.entries(o)) f.set(k, v);
  return f;
};
const ok = { ok: true } as const;

describe('multi-tenant isolation', () => {
  let f: Fixture;
  beforeEach(async () => {
    await resetDb();
    f = await seed();
  });

  it('rejects anonymous access', async () => {
    await as(null);
    await expect(requireOrgMember('org-a')).rejects.toBeInstanceOf(UnauthenticatedError);
    await expect(requireStaff()).rejects.toBeInstanceOf(UnauthenticatedError);
  });

  it('resolves orgs only through the actor’s own memberships', async () => {
    await as(f.ownerA);
    await expect(requireOrgMember('org-a')).resolves.toMatchObject({
      org: { id: f.orgA.id },
      role: 'client_owner',
    });
    await expect(requireOrgMember('org-b')).rejects.toBeInstanceOf(NotFoundError);
    await as(f.outsider);
    await expect(requireOrgMember('org-a')).rejects.toBeInstanceOf(NotFoundError);
  });

  it('scopes portal reads to the org and to client-visible records', async () => {
    expect(await portalProject(f.orgA.id, f.projB.id)).toBeNull();
    expect(await portalProject(f.orgA.id, f.hiddenA.id)).toBeNull();
    expect(await portalProject(f.orgA.id, f.projA.id)).not.toBeNull();
    expect((await portalProjects(f.orgA.id)).map((p) => p.id)).toEqual([f.projA.id]);
    expect((await portalFiles(f.orgA.id)).map((x) => x.id)).toEqual([f.fileA.id]);
    expect((await portalBilling(f.orgB.id)).invoices).toEqual([]);
  });

  it('never returns another org’s ticket or internal notes', async () => {
    expect(await getTicketThread(f.ticketB.id, f.orgA.id, false)).toBeNull();
    const thread = await getTicketThread(f.ticketA.id, f.orgA.id, false);
    expect(thread!.messages.map((m) => m.body)).toEqual(['visible']);
  });

  it('blocks cross-tenant writes through portal actions (URL tampering)', async () => {
    await as(f.ownerA);
    // Valid slug for A, ticket id from B → not found, nothing written.
    const r = await portalActions.portalReplyTicket(
      ok,
      fd({ org: 'org-a', ticketId: f.ticketB.id, body: 'hi' }),
    );
    expect(r).toMatchObject({ ok: false, error: 'Not found.' });
    // Slug of B → not a member → not found.
    const r2 = await portalActions.portalReplyTicket(
      ok,
      fd({ org: 'org-b', ticketId: f.ticketB.id, body: 'hi' }),
    );
    expect(r2).toMatchObject({ ok: false });
    expect(await getDb().$count(ticketMessages, eq(ticketMessages.ticketId, f.ticketB.id))).toBe(1);
  });

  it('enforces client roles: read-only cannot create tickets, members cannot manage the team', async () => {
    await as(f.readerA);
    const r = await portalActions.portalCreateTicket(
      ok,
      fd({ org: 'org-a', subject: 'Help me', body: 'Something broke', priority: 'normal' }),
    );
    expect(r.ok).toBe(false);
    const r2 = await portalActions.portalInviteTeammate(
      ok,
      fd({ org: 'org-a', email: 'x@a.test', role: 'client_member' }),
    );
    expect(r2.ok).toBe(false);
  });

  it('prevents client owners from escalating roles', async () => {
    await as(f.ownerA);
    const r = await portalActions.portalInviteTeammate(
      ok,
      fd({ org: 'org-a', email: 'x@a.test', role: 'client_owner' }),
    );
    expect(r.ok).toBe(false);
    expect(await getDb().$count(invitations)).toBe(0);
  });

  it('authorizes file downloads by tenant and visibility', async () => {
    const ownerA = await actorFor(f.ownerA);
    expect(await authorizeFileDownload(ownerA, f.fileA.id)).not.toBeNull();
    expect(await authorizeFileDownload(ownerA, f.fileB.id)).toBeNull();
    expect(await authorizeFileDownload(ownerA, f.fileAInternal.id)).toBeNull();
    const delivery = await actorFor(f.delivery);
    expect(await authorizeFileDownload(delivery, f.fileB.id)).not.toBeNull();
  });
});

describe('staff authorization on server actions', () => {
  let f: Fixture;
  beforeEach(async () => {
    await resetDb();
    f = await seed();
  });

  it('clients cannot call internal actions', async () => {
    await as(f.ownerA);
    const r = await leadActions.updateLeadStage(ok, fd({ leadId: f.leadX.id, stage: 'won' }));
    expect(r).toMatchObject({ ok: false, error: 'Koral staff access required.' });
    expect((await getDb().query.leads.findFirst({ where: eq(leads.id, f.leadX.id) }))!.stage).toBe('new');
  });

  it('delivery cannot change the sales pipeline; sales can', async () => {
    await as(f.delivery);
    expect((await leadActions.updateLeadStage(ok, fd({ leadId: f.leadX.id, stage: 'qualified' }))).ok).toBe(
      false,
    );
    await as(f.sales);
    expect(
      await leadActions.updateLeadStage(ok, fd({ leadId: f.leadX.id, stage: 'qualified' })),
    ).toMatchObject({ ok: true });
  });

  it('sales cannot edit site settings or grant roles', async () => {
    await as(f.sales);
    expect((await settingsActions.saveSiteSettings(ok, fd({ businessName: 'Hacked' }))).ok).toBe(false);
    expect(
      (await settingsActions.changeStaffRole(ok, fd({ userId: f.delivery.id, role: 'superadmin' }))).ok,
    ).toBe(false);
  });

  it('requires a lost reason and records stage history', async () => {
    await as(f.sales);
    expect(await leadActions.updateLeadStage(ok, fd({ leadId: f.leadX.id, stage: 'lost' }))).toMatchObject({
      ok: false,
    });
    expect(
      await leadActions.updateLeadStage(
        ok,
        fd({ leadId: f.leadX.id, stage: 'lost', lostReason: 'Chose in-house' }),
      ),
    ).toMatchObject({ ok: true });
  });

  it('rejects linking another org’s proposal or project', async () => {
    await as(f.admin);
    const r = await clientActions.postClientUpdate(
      ok,
      fd({ orgId: f.orgA.id, projectId: f.projB.id, kind: 'update', title: 'Hello', body: 'Body text' }),
    );
    expect(r).toMatchObject({ ok: false });
  });

  it('refuses to store credentials in integration notes', async () => {
    await as(f.admin);
    const r = await clientActions.saveIntegration(
      ok,
      fd({
        orgId: f.orgA.id,
        tool: 'JobNimbus',
        category: 'crm',
        status: 'connected',
        notes: 'api_key: abc123',
      }),
    );
    expect(r.ok).toBe(false);
  });
});

describe('invitations', () => {
  let f: Fixture;
  beforeEach(async () => {
    await resetDb();
    f = await seed();
  });

  it('accepts a valid token once, for the matching verified email only', async () => {
    const admin = await actorFor(f.admin);
    const inv = await createInvitation(admin, {
      email: 'outsider@c.test',
      orgId: f.orgB.id,
      memberRole: 'client_member',
    });
    expect(inv.delivery).toBe('manual_link');
    const token = inv.link.split('/invite/')[1]!;

    // Wrong person (verified email mismatch) is refused.
    const wrong = await acceptInvitationByToken(await actorFor(f.ownerA), token);
    expect(wrong.ok).toBe(false);

    const right = await acceptInvitationByToken(await actorFor(f.outsider), token);
    expect(right).toMatchObject({ ok: true, redirectTo: '/portal/org-b' });
    expect(await getDb().$count(memberships, eq(memberships.userId, f.outsider.id))).toBe(1);

    // Single use.
    expect((await acceptInvitationByToken(await actorFor(f.outsider), token)).ok).toBe(false);
  });

  it('requires a verified email for staff invitations', async () => {
    const admin = await actorFor(f.admin);
    const db = getDb();
    const [unverified] = await db
      .insert(users)
      .values({ email: null, emailVerified: false, descopeUserId: 'U-unverified' })
      .returning();
    const inv = await createInvitation(admin, {
      email: 'new.staff@koral.test',
      orgId: null,
      staffRole: 'sales',
    });
    const token = inv.link.split('/invite/')[1]!;
    const r = await acceptInvitationByToken(await actorFor(unverified!), token);
    expect(r.ok).toBe(false);
    expect((await db.query.users.findFirst({ where: eq(users.id, unverified!.id) }))!.staffRole).toBeNull();
  });

  it('rejects malformed and unknown tokens', async () => {
    const outsider = await actorFor(f.outsider);
    expect((await acceptInvitationByToken(outsider, "'; drop table users;--")).ok).toBe(false);
    expect((await acceptInvitationByToken(outsider, 'a'.repeat(43))).ok).toBe(false);
  });
});
