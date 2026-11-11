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
// Descope holds every role. This stand-in records each management call; `failNext` makes the
// next one fail, as Descope would on an outage or a rejected request.
const descope = vi.hoisted(() => ({ calls: [] as string[], failNext: false }));
vi.mock('@/lib/auth/descope', async (orig) => {
  const answer = <T extends object>(call: string, ok: T) => {
    descope.calls.push(call);
    if (!descope.failNext) return { ok: true as const, ...ok };
    descope.failNext = false;
    return { ok: false as const, reason: 'Descope is unavailable.' };
  };
  return {
    ...(await orig<typeof import('@/lib/auth/descope')>()),
    ensureTenant: vi.fn(async (i: { tenantId: string; parentTenantId: string }) =>
      answer(`tenant ${i.tenantId} under ${i.parentTenantId}`, {}),
    ),
    inviteToTenant: vi.fn(async (i: { email: string; tenantId: string; roleName: string }) =>
      answer(`invite ${i.email} ${i.tenantId} ${i.roleName}`, {
        descopeUserId: `U-${i.email}`,
        emailed: true,
      }),
    ),
    setTenantRole: vi.fn(async (userId: string, tenantId: string, roleName: string | null) =>
      answer(`role ${userId} ${tenantId} ${roleName}`, {}),
    ),
  };
});
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
  const owner = await mkUser('owner@koral.test', 'owner');
  const employee = await mkUser('employee@koral.test', 'employee');
  const contractor = await mkUser('contractor@koral.test', 'contractor');
  const ownerA = await mkUser('owner@a.test');
  const readerA = await mkUser('reader@a.test');
  const ownerB = await mkUser('owner@b.test');
  const outsider = await mkUser('outsider@c.test');
  const [orgA] = await db
    .insert(organizations)
    .values({ name: 'Org A', slug: 'org-a', descopeTenantId: 'client-org-a' })
    .returning();
  const [orgB] = await db
    .insert(organizations)
    .values({ name: 'Org B', slug: 'org-b', descopeTenantId: 'client-org-b' })
    .returning();
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
    owner,
    employee,
    contractor,
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
    descope.calls = [];
    descope.failNext = false;
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
    const contractor = await actorFor(f.contractor);
    expect(await authorizeFileDownload(contractor, f.fileB.id)).not.toBeNull();
  });
});

describe('staff authorization on server actions', () => {
  let f: Fixture;
  beforeEach(async () => {
    await resetDb();
    f = await seed();
    descope.calls = [];
    descope.failNext = false;
  });

  it('clients cannot call internal actions', async () => {
    await as(f.ownerA);
    const r = await leadActions.updateLeadStage(ok, fd({ leadId: f.leadX.id, stage: 'won' }));
    expect(r).toMatchObject({ ok: false, error: 'Koral staff access required.' });
    expect((await getDb().query.leads.findFirst({ where: eq(leads.id, f.leadX.id) }))!.stage).toBe('new');
  });

  it('contractors cannot touch the sales pipeline; employees can', async () => {
    await as(f.contractor);
    expect((await leadActions.updateLeadStage(ok, fd({ leadId: f.leadX.id, stage: 'qualified' }))).ok).toBe(
      false,
    );
    await as(f.employee);
    expect(
      await leadActions.updateLeadStage(ok, fd({ leadId: f.leadX.id, stage: 'qualified' })),
    ).toMatchObject({ ok: true });
  });

  it('employees cannot edit site settings or grant roles, and Descope is never asked', async () => {
    await as(f.employee);
    expect((await settingsActions.saveSiteSettings(ok, fd({ businessName: 'Hacked' }))).ok).toBe(false);
    expect(
      (await settingsActions.changeStaffRole(ok, fd({ userId: f.contractor.id, role: 'owner' }))).ok,
    ).toBe(false);
    expect(descope.calls).toEqual([]);
  });

  it('changes a staff role in Descope first, then in the database', async () => {
    await as(f.owner);
    expect(
      await settingsActions.changeStaffRole(ok, fd({ userId: f.contractor.id, role: 'employee' })),
    ).toMatchObject({ ok: true });
    expect(descope.calls).toEqual(['role U-contractor@koral.test koral-digital-internal Internal:Employee']);
    const db = getDb();
    expect((await db.query.users.findFirst({ where: eq(users.id, f.contractor.id) }))!.staffRole).toBe(
      'employee',
    );

    // When Descope refuses, the database keeps what Descope still says.
    descope.failNext = true;
    expect(
      (await settingsActions.changeStaffRole(ok, fd({ userId: f.contractor.id, role: 'none' }))).ok,
    ).toBe(false);
    expect((await db.query.users.findFirst({ where: eq(users.id, f.contractor.id) }))!.staffRole).toBe(
      'employee',
    );
  });

  it('removes a client member in Descope and in the database', async () => {
    await as(f.owner);
    const db = getDb();
    const m = (await db.query.memberships.findFirst({ where: eq(memberships.userId, f.readerA.id) }))!;
    expect(
      await clientActions.changeMemberRole(ok, fd({ orgId: f.orgA.id, membershipId: m.id, role: 'remove' })),
    ).toMatchObject({ ok: true });
    expect(descope.calls).toEqual(['role U-reader@a.test client-org-a null']);
    expect(await db.$count(memberships, eq(memberships.userId, f.readerA.id))).toBe(0);
  });

  it('requires a lost reason and records stage history', async () => {
    await as(f.employee);
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
    await as(f.owner);
    const r = await clientActions.postClientUpdate(
      ok,
      fd({ orgId: f.orgA.id, projectId: f.projB.id, kind: 'update', title: 'Hello', body: 'Body text' }),
    );
    expect(r).toMatchObject({ ok: false });
  });

  it('refuses to store credentials in integration notes', async () => {
    await as(f.owner);
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
    descope.calls = [];
    descope.failNext = false;
  });

  it('accepts a valid token once, for the matching verified email only', async () => {
    const owner = await actorFor(f.owner);
    const inv = await createInvitation(owner, {
      email: 'outsider@c.test',
      orgId: f.orgB.id,
      memberRole: 'client_member',
    });
    if (!inv.ok) throw new Error(inv.error);
    // Descope grants the role and emails the sign-in link.
    expect(descope.calls).toEqual(['invite outsider@c.test client-org-b External:ClientMember']);
    expect(inv.delivery).toBe('descope_email');
    const token = inv.link.split('/invite/')[1]!;

    // Wrong person (verified email mismatch) is refused.
    const wrong = await acceptInvitationByToken(await actorFor(f.ownerA), token);
    expect(wrong.ok).toBe(false);

    const right = await acceptInvitationByToken(await actorFor(f.outsider), token);
    expect(right).toMatchObject({ ok: true, redirectTo: '/portal/org-b' });
    // Accepting grants nothing locally: the role reaches the app from Descope at sign-in.
    expect(await getDb().$count(memberships, eq(memberships.userId, f.outsider.id))).toBe(0);
    expect((await getDb().query.invitations.findFirst({ where: eq(invitations.id, inv.id) }))!.status).toBe(
      'accepted',
    );

    // Single use.
    expect((await acceptInvitationByToken(await actorFor(f.outsider), token)).ok).toBe(false);
  });

  it('requires a verified email for staff invitations', async () => {
    const owner = await actorFor(f.owner);
    const db = getDb();
    const [unverified] = await db
      .insert(users)
      .values({ email: null, emailVerified: false, descopeUserId: 'U-unverified' })
      .returning();
    const inv = await createInvitation(owner, {
      email: 'new.staff@koral.test',
      orgId: null,
      staffRole: 'employee',
    });
    if (!inv.ok) throw new Error(inv.error);
    expect(descope.calls).toEqual(['invite new.staff@koral.test koral-digital-internal Internal:Employee']);
    const token = inv.link.split('/invite/')[1]!;
    const r = await acceptInvitationByToken(await actorFor(unverified!), token);
    expect(r.ok).toBe(false);
    expect((await db.query.users.findFirst({ where: eq(users.id, unverified!.id) }))!.staffRole).toBeNull();
  });

  it('records no invitation when Descope refuses it', async () => {
    const owner = await actorFor(f.owner);
    descope.failNext = true;
    const inv = await createInvitation(owner, {
      email: 'new@a.test',
      orgId: f.orgA.id,
      memberRole: 'client_member',
    });
    expect(inv).toMatchObject({ ok: false });
    expect(await getDb().$count(invitations)).toBe(0);
  });

  it('creates the client tenant under the external tenant on first use', async () => {
    const owner = await actorFor(f.owner);
    const db = getDb();
    const [orgC] = await db.insert(organizations).values({ name: 'Org C', slug: 'org-c' }).returning();
    const inv = await createInvitation(owner, {
      email: 'c@c.test',
      orgId: orgC!.id,
      memberRole: 'client_owner',
    });
    expect(inv.ok).toBe(true);
    expect(descope.calls).toEqual([
      'tenant client-org-c under koral-digital-external',
      'invite c@c.test client-org-c External:ClientOwner',
    ]);
    expect(
      (await db.query.organizations.findFirst({ where: eq(organizations.id, orgC!.id) }))!.descopeTenantId,
    ).toBe('client-org-c');
  });

  it('rejects malformed and unknown tokens', async () => {
    const outsider = await actorFor(f.outsider);
    expect((await acceptInvitationByToken(outsider, "'; drop table users;--")).ok).toBe(false);
    expect((await acceptInvitationByToken(outsider, 'a'.repeat(43))).ok).toBe(false);
  });
});
