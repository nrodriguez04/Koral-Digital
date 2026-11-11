/**
 * DEVELOPMENT-ONLY synthetic data. Every record is flagged is_demo / dev_key and
 * uses example.com / example.org addresses. Refuses to run in production or
 * against a non-local database unless ALLOW_DEV_SEED=true is set explicitly.
 */
import { eq, inArray, like } from 'drizzle-orm';
import {
  clientUpdates,
  companies,
  contacts,
  invoices,
  leadActivities,
  leads,
  memberships,
  organizations,
  projectMilestones,
  projects,
  supportTickets,
  tasks,
  ticketMessages,
  users,
} from '../src/db/schema';
import { scriptDb } from './_db';

async function main() {
  const url = process.env.DATABASE_URL ?? '';
  const local = /@(localhost|127\.0\.0\.1)(:\d+)?\//.test(url);
  if (
    process.env.NODE_ENV === 'production' ||
    process.env.VERCEL_ENV === 'production' ||
    (!local && process.env.ALLOW_DEV_SEED !== 'true')
  ) {
    console.error('[seed-dev] Refusing to seed synthetic data outside a local development database.');
    process.exit(1);
  }
  const { db, client } = scriptDb();
  try {
    // Reset previous synthetic data.
    const demoOrgs = await db
      .select({ id: organizations.id })
      .from(organizations)
      .where(eq(organizations.isDemo, true));
    if (demoOrgs.length)
      await db.delete(organizations).where(
        inArray(
          organizations.id,
          demoOrgs.map((o) => o.id),
        ),
      );
    await db.delete(leads).where(eq(leads.isDemo, true));
    await db.delete(contacts).where(eq(contacts.isDemo, true));
    await db.delete(companies).where(eq(companies.isDemo, true));
    await db.delete(users).where(like(users.devKey, 'dev-%'));

    const mk = (
      devKey: string,
      name: string,
      email: string,
      staffRole: 'owner' | 'employee' | 'contractor' | null,
    ) => ({ devKey, name, email, emailVerified: true, staffRole });
    const [admin, sales, delivery, ownerA, memberA, readOnlyA, ownerB, noAccess] = await db
      .insert(users)
      .values([
        mk('dev-admin', 'Dev Owner (synthetic)', 'admin@example.com', 'owner'),
        mk('dev-sales', 'Dev Employee (synthetic)', 'sales@example.com', 'employee'),
        mk('dev-delivery', 'Dev Contractor (synthetic)', 'delivery@example.com', 'contractor'),
        mk('dev-client-a-owner', 'Avery Owner (synthetic, Org A)', 'owner@acme-roofing.example', null),
        mk('dev-client-a-member', 'Alex Member (synthetic, Org A)', 'member@acme-roofing.example', null),
        mk('dev-client-a-readonly', 'Riley Viewer (synthetic, Org A)', 'viewer@acme-roofing.example', null),
        mk('dev-client-b-owner', 'Blake Owner (synthetic, Org B)', 'owner@bluebonnet-remodel.example', null),
        mk('dev-no-access', 'Nora NoAccess (synthetic)', 'nobody@example.org', null),
      ])
      .returning();

    const [coA, coB, coC] = await db
      .insert(companies)
      .values([
        {
          name: 'Acme Roofing Co (synthetic)',
          normalizedName: 'acme roofing synthetic',
          domain: 'acme-roofing.example',
          industry: 'Roofing',
          currentCrm: 'JobNimbus',
          isDemo: true,
        },
        {
          name: 'Bluebonnet Remodeling (synthetic)',
          normalizedName: 'bluebonnet remodeling synthetic',
          domain: 'bluebonnet-remodel.example',
          industry: 'Remodeling / construction',
          currentCrm: 'Spreadsheet',
          isDemo: true,
        },
        {
          name: 'Cedar Property Services (synthetic)',
          normalizedName: 'cedar property services synthetic',
          domain: 'cedar-props.example',
          industry: 'Property maintenance',
          isDemo: true,
        },
      ])
      .returning();
    const [ctA, ctB, ctC] = await db
      .insert(contacts)
      .values([
        {
          companyId: coA!.id,
          fullName: 'Avery Owner',
          email: 'owner@acme-roofing.example',
          isPrimary: true,
          isDemo: true,
        },
        {
          companyId: coB!.id,
          fullName: 'Blake Owner',
          email: 'owner@bluebonnet-remodel.example',
          isPrimary: true,
          isDemo: true,
        },
        {
          companyId: coC!.id,
          fullName: 'Casey Manager',
          email: 'casey@cedar-props.example',
          isPrimary: true,
          isDemo: true,
        },
      ])
      .returning();

    const [orgA, orgB] = await db
      .insert(organizations)
      .values([
        {
          name: 'Acme Roofing (synthetic)',
          slug: 'acme-roofing-demo',
          status: 'active',
          companyId: coA!.id,
          servicePackage: 'Lead-to-Booked pilot',
          isDemo: true,
        },
        {
          name: 'Bluebonnet Remodeling (synthetic)',
          slug: 'bluebonnet-demo',
          status: 'onboarding',
          companyId: coB!.id,
          servicePackage: 'CRM Rescue',
          isDemo: true,
        },
      ])
      .returning();

    const [leadA, , leadC] = await db
      .insert(leads)
      .values([
        {
          companyId: coA!.id,
          contactId: ctA!.id,
          title: 'Acme Roofing — slow first response',
          stage: 'won',
          source: 'referral',
          industry: 'Roofing',
          topProblem: 'Leads are slow to get a response',
          convertedOrgId: orgA!.id,
          ownerId: sales!.id,
          isDemo: true,
        },
        {
          companyId: coB!.id,
          contactId: ctB!.id,
          title: 'Bluebonnet — CRM is messy',
          stage: 'won',
          source: 'event',
          industry: 'Remodeling / construction',
          topProblem: 'Our CRM is messy or underused',
          convertedOrgId: orgB!.id,
          ownerId: sales!.id,
          isDemo: true,
        },
        {
          companyId: coC!.id,
          contactId: ctC!.id,
          title: 'Cedar Property — work order intake',
          stage: 'discovery',
          source: 'website_form',
          industry: 'Property maintenance',
          topProblem: 'Our tools do not talk to each other',
          ownerId: sales!.id,
          nextAction: 'Send discovery recap',
          nextActionDueAt: new Date(Date.now() + 86_400_000),
          isDemo: true,
        },
      ])
      .returning();
    await db.update(organizations).set({ leadId: leadA!.id }).where(eq(organizations.id, orgA!.id));
    await db.insert(leadActivities).values({
      leadId: leadC!.id,
      actorId: sales!.id,
      type: 'call',
      body: 'Synthetic: intro call held; they track work orders in email.',
    });

    await db.insert(memberships).values([
      { orgId: orgA!.id, userId: ownerA!.id, role: 'client_owner' },
      { orgId: orgA!.id, userId: memberA!.id, role: 'client_member' },
      { orgId: orgA!.id, userId: readOnlyA!.id, role: 'read_only' },
      { orgId: orgB!.id, userId: ownerB!.id, role: 'client_owner' },
    ]);

    const [projA] = await db
      .insert(projects)
      .values({
        orgId: orgA!.id,
        name: 'Acme — Lead-to-Booked pilot (synthetic)',
        status: 'active',
        ownerId: delivery!.id,
        startDate: new Date(),
        targetDate: new Date(Date.now() + 14 * 86_400_000),
      })
      .returning();
    const [projB] = await db
      .insert(projects)
      .values({
        orgId: orgB!.id,
        name: 'Bluebonnet — CRM cleanup (synthetic)',
        status: 'planning',
        ownerId: delivery!.id,
      })
      .returning();
    await db.insert(projectMilestones).values([
      {
        orgId: orgA!.id,
        projectId: projA!.id,
        title: 'Discovery & baseline',
        status: 'done',
        sortOrder: 0,
        completedAt: new Date(),
      },
      { orgId: orgA!.id, projectId: projA!.id, title: 'Access granted', status: 'in_progress', sortOrder: 1 },
      {
        orgId: orgA!.id,
        projectId: projA!.id,
        title: 'Internal QA (hidden from client)',
        status: 'not_started',
        sortOrder: 2,
        clientVisible: false,
      },
      { orgId: orgB!.id, projectId: projB!.id, title: 'Data audit', status: 'not_started', sortOrder: 0 },
    ]);
    await db.insert(tasks).values([
      {
        orgId: orgA!.id,
        projectId: projA!.id,
        title: 'Grant CRM administrator access',
        clientVisible: true,
        dueAt: new Date(Date.now() + 2 * 86_400_000),
      },
      {
        orgId: orgA!.id,
        projectId: projA!.id,
        title: 'Internal: record baseline metrics',
        clientVisible: false,
        assigneeId: delivery!.id,
      },
      { orgId: orgB!.id, projectId: projB!.id, title: 'Export current spreadsheet', clientVisible: true },
    ]);
    await db.insert(clientUpdates).values([
      {
        orgId: orgA!.id,
        projectId: projA!.id,
        title: 'Kickoff complete (synthetic)',
        body: 'Synthetic update visible to Org A.',
        clientVisible: true,
        authorId: delivery!.id,
      },
      {
        orgId: orgA!.id,
        projectId: projA!.id,
        title: 'Internal note (synthetic)',
        body: 'Not visible to the client.',
        clientVisible: false,
        authorId: delivery!.id,
      },
      {
        orgId: orgB!.id,
        projectId: projB!.id,
        title: 'Welcome (synthetic)',
        body: 'Synthetic update visible to Org B only.',
        clientVisible: true,
        authorId: delivery!.id,
      },
    ]);
    const [tA] = await db
      .insert(supportTickets)
      .values({ orgId: orgA!.id, subject: 'Question about alerts (synthetic)', createdById: ownerA!.id })
      .returning();
    const [tB] = await db
      .insert(supportTickets)
      .values({ orgId: orgB!.id, subject: 'Org B private ticket (synthetic)', createdById: ownerB!.id })
      .returning();
    await db.insert(ticketMessages).values([
      { orgId: orgA!.id, ticketId: tA!.id, authorId: ownerA!.id, body: 'Who receives the new-lead alerts?' },
      {
        orgId: orgA!.id,
        ticketId: tA!.id,
        authorId: delivery!.id,
        body: 'INTERNAL: check routing rules before replying.',
        internalNote: true,
      },
      { orgId: orgB!.id, ticketId: tB!.id, authorId: ownerB!.id, body: 'This message belongs to Org B.' },
    ]);
    await db.insert(invoices).values([
      {
        orgId: orgA!.id,
        number: 'DEMO-001',
        description: 'Synthetic deposit invoice',
        amountCents: 125000,
        status: 'sent',
        paymentUrl: 'https://example.com/pay/demo',
      },
      {
        orgId: orgA!.id,
        number: 'DEMO-002',
        description: 'Synthetic draft (hidden from client)',
        amountCents: 125000,
        status: 'draft',
      },
    ]);
    console.log(
      '[seed-dev] Synthetic dev data created. Sign in at /dev-login (AUTH_DEV_MOCK=true, dev only).',
    );
    console.log(
      `[seed-dev] Org A: /portal/${orgA!.slug}  Org B: /portal/${orgB!.slug}  (no-access user: ${noAccess!.email}, admin: ${admin!.email})`,
    );
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error('[seed-dev] Failed:', err);
  process.exit(1);
});
