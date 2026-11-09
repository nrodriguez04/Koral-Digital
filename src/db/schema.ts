import { sql } from 'drizzle-orm';
import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';

/* ------------------------------------------------------------------ */
/* Enums                                                               */
/* ------------------------------------------------------------------ */

export const staffRoleEnum = pgEnum('staff_role', ['superadmin', 'admin', 'sales', 'delivery']);
export const memberRoleEnum = pgEnum('member_role', ['client_owner', 'client_member', 'read_only']);
export const leadStageEnum = pgEnum('lead_stage', [
  'new',
  'contacted',
  'qualified',
  'discovery',
  'proposal',
  'won',
  'lost',
]);
export const leadSourceEnum = pgEnum('lead_source', [
  'website_form',
  'referral',
  'outbound',
  'event',
  'partner',
  'other',
]);
export const activityTypeEnum = pgEnum('activity_type', [
  'note',
  'call',
  'email',
  'meeting',
  'stage_change',
  'form_submission',
  'system',
]);
export const taskStatusEnum = pgEnum('task_status', ['open', 'done', 'cancelled']);
export const priorityEnum = pgEnum('priority', ['low', 'normal', 'high', 'urgent']);
export const proposalStatusEnum = pgEnum('proposal_status', ['draft', 'sent', 'accepted', 'declined', 'expired']);
export const projectStatusEnum = pgEnum('project_status', [
  'planning',
  'active',
  'on_hold',
  'completed',
  'cancelled',
]);
export const milestoneStatusEnum = pgEnum('milestone_status', ['not_started', 'in_progress', 'blocked', 'done']);
export const ticketStatusEnum = pgEnum('ticket_status', [
  'open',
  'waiting_on_client',
  'waiting_on_koral',
  'resolved',
  'closed',
]);
export const invoiceStatusEnum = pgEnum('invoice_status', ['draft', 'sent', 'partially_paid', 'paid', 'void']);
export const fileVisibilityEnum = pgEnum('file_visibility', ['internal', 'client']);
export const invitationStatusEnum = pgEnum('invitation_status', ['pending', 'accepted', 'revoked', 'expired']);
export const integrationStatusEnum = pgEnum('integration_status', [
  'not_connected',
  'access_requested',
  'connected',
  'error',
]);
export const articleStatusEnum = pgEnum('article_status', ['draft', 'in_review', 'published', 'archived']);
export const meetingStatusEnum = pgEnum('meeting_status', ['scheduled', 'completed', 'cancelled', 'no_show']);
export const orgStatusEnum = pgEnum('org_status', ['onboarding', 'active', 'paused', 'churned']);
export const updateKindEnum = pgEnum('update_kind', ['update', 'meeting_notes', 'access_request']);

const timestamps = {
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};

/* ------------------------------------------------------------------ */
/* Identity, tenancy and access                                        */
/* ------------------------------------------------------------------ */

export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    /** Descope user ID (JWT `sub`). Null only for development-only mock users. */
    descopeUserId: text('descope_user_id'),
    /** Development-only identity key used by the local auth mock. Never set in production. */
    devKey: text('dev_key'),
    email: text('email'),
    /** True only when the email came from a verified source (Descope management API / verified claim). */
    emailVerified: boolean('email_verified').notNull().default(false),
    name: text('name'),
    /** Internal Koral role. Null = not Koral staff. Only grantable server-side by an admin. */
    staffRole: staffRoleEnum('staff_role'),
    isActive: boolean('is_active').notNull().default(true),
    lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
    ...timestamps,
  },
  (t) => [
    uniqueIndex('users_descope_user_id_uq').on(t.descopeUserId),
    uniqueIndex('users_dev_key_uq').on(t.devKey),
    index('users_email_idx').on(t.email),
  ],
);

export const organizations = pgTable(
  'organizations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    status: orgStatusEnum('status').notNull().default('onboarding'),
    companyId: uuid('company_id').references(() => companies.id, { onDelete: 'set null' }),
    leadId: uuid('lead_id'),
    servicePackage: text('service_package'),
    notes: text('notes'),
    /** Optional Descope tenant mapping. Local memberships remain authoritative. */
    descopeTenantId: text('descope_tenant_id'),
    /** Synthetic development/demo data. Never shown on public pages. */
    isDemo: boolean('is_demo').notNull().default(false),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
    ...timestamps,
  },
  (t) => [uniqueIndex('organizations_slug_uq').on(t.slug)],
);

export const memberships = pgTable(
  'memberships',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orgId: uuid('org_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    role: memberRoleEnum('role').notNull().default('client_member'),
    ...timestamps,
  },
  (t) => [uniqueIndex('memberships_org_user_uq').on(t.orgId, t.userId), index('memberships_user_idx').on(t.userId)],
);

export const invitations = pgTable(
  'invitations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    /** Null for a staff invitation. */
    orgId: uuid('org_id').references(() => organizations.id, { onDelete: 'cascade' }),
    email: text('email').notNull(),
    memberRole: memberRoleEnum('member_role'),
    staffRole: staffRoleEnum('staff_role'),
    /** SHA-256 of the one-time invitation token. The raw token is never stored. */
    tokenHash: text('token_hash').notNull(),
    /** Set when the invitation was delivered through the Descope management API. */
    descopeUserId: text('descope_user_id'),
    delivery: text('delivery').notNull().default('manual_link'),
    status: invitationStatusEnum('status').notNull().default('pending'),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    invitedById: uuid('invited_by_id').references(() => users.id, { onDelete: 'set null' }),
    acceptedById: uuid('accepted_by_id').references(() => users.id, { onDelete: 'set null' }),
    acceptedAt: timestamp('accepted_at', { withTimezone: true }),
    ...timestamps,
  },
  (t) => [
    uniqueIndex('invitations_token_hash_uq').on(t.tokenHash),
    index('invitations_org_idx').on(t.orgId),
    index('invitations_email_idx').on(t.email),
    check('invitations_role_ck', sql`(${t.orgId} is not null and ${t.memberRole} is not null and ${t.staffRole} is null) or (${t.orgId} is null and ${t.staffRole} is not null and ${t.memberRole} is null)`),
  ],
);

/* ------------------------------------------------------------------ */
/* Koral's own sales pipeline (internal only — no org_id)              */
/* ------------------------------------------------------------------ */

export const companies = pgTable(
  'companies',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    normalizedName: text('normalized_name').notNull(),
    domain: text('domain'),
    website: text('website'),
    industry: text('industry'),
    phone: text('phone'),
    serviceArea: text('service_area'),
    currentCrm: text('current_crm'),
    softwareStack: jsonb('software_stack').$type<string[]>().notNull().default([]),
    marketingChannels: jsonb('marketing_channels').$type<string[]>().notNull().default([]),
    estMonthlyLeads: text('est_monthly_leads'),
    notes: text('notes'),
    isDemo: boolean('is_demo').notNull().default(false),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
    ...timestamps,
  },
  (t) => [
    uniqueIndex('companies_domain_uq').on(t.domain).where(sql`${t.domain} is not null and ${t.deletedAt} is null`),
    index('companies_normalized_name_idx').on(t.normalizedName),
  ],
);

export const contacts = pgTable(
  'contacts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    companyId: uuid('company_id').references(() => companies.id, { onDelete: 'set null' }),
    fullName: text('full_name').notNull(),
    /** Lower-cased. */
    email: text('email'),
    phone: text('phone'),
    title: text('title'),
    isPrimary: boolean('is_primary').notNull().default(false),
    notes: text('notes'),
    isDemo: boolean('is_demo').notNull().default(false),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
    ...timestamps,
  },
  (t) => [
    uniqueIndex('contacts_email_uq').on(t.email).where(sql`${t.email} is not null and ${t.deletedAt} is null`),
    index('contacts_company_idx').on(t.companyId),
  ],
);

export const leads = pgTable(
  'leads',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    companyId: uuid('company_id').references(() => companies.id, { onDelete: 'set null' }),
    contactId: uuid('contact_id').references(() => contacts.id, { onDelete: 'set null' }),
    title: text('title').notNull(),
    stage: leadStageEnum('stage').notNull().default('new'),
    source: leadSourceEnum('source').notNull().default('website_form'),
    ownerId: uuid('owner_id').references(() => users.id, { onDelete: 'set null' }),
    industry: text('industry'),
    topProblem: text('top_problem'),
    message: text('message'),
    currentCrm: text('current_crm'),
    monthlyLeads: text('monthly_leads'),
    serviceInterest: text('service_interest'),
    consentEmail: boolean('consent_email').notNull().default(false),
    consentSms: boolean('consent_sms').notNull().default(false),
    utmSource: text('utm_source'),
    utmMedium: text('utm_medium'),
    utmCampaign: text('utm_campaign'),
    utmTerm: text('utm_term'),
    utmContent: text('utm_content'),
    referrer: text('referrer'),
    landingPath: text('landing_path'),
    nextAction: text('next_action'),
    nextActionDueAt: timestamp('next_action_due_at', { withTimezone: true }),
    estimatedValueCents: integer('estimated_value_cents'),
    lostReason: text('lost_reason'),
    wonAt: timestamp('won_at', { withTimezone: true }),
    lostAt: timestamp('lost_at', { withTimezone: true }),
    convertedOrgId: uuid('converted_org_id').references(() => organizations.id, { onDelete: 'set null' }),
    /** not_configured | sent | failed | skipped */
    notificationStatus: text('notification_status'),
    submissionCount: integer('submission_count').notNull().default(1),
    lastSubmittedAt: timestamp('last_submitted_at', { withTimezone: true }),
    isDemo: boolean('is_demo').notNull().default(false),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
    ...timestamps,
  },
  (t) => [
    index('leads_stage_idx').on(t.stage),
    index('leads_owner_idx').on(t.ownerId),
    index('leads_created_idx').on(t.createdAt),
    index('leads_contact_idx').on(t.contactId),
    index('leads_company_idx').on(t.companyId),
  ],
);

export const leadActivities = pgTable(
  'lead_activities',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    leadId: uuid('lead_id')
      .notNull()
      .references(() => leads.id, { onDelete: 'cascade' }),
    actorId: uuid('actor_id').references(() => users.id, { onDelete: 'set null' }),
    type: activityTypeEnum('type').notNull(),
    body: text('body').notNull(),
    metadata: jsonb('metadata').$type<Record<string, unknown>>().notNull().default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('lead_activities_lead_idx').on(t.leadId, t.createdAt)],
);

export const discoveryAnswers = pgTable(
  'discovery_answers',
  {
    leadId: uuid('lead_id')
      .notNull()
      .references(() => leads.id, { onDelete: 'cascade' }),
    questionKey: text('question_key').notNull(),
    answer: text('answer').notNull().default(''),
    updatedById: uuid('updated_by_id').references(() => users.id, { onDelete: 'set null' }),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.leadId, t.questionKey] })],
);

export const meetings = pgTable(
  'meetings',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    leadId: uuid('lead_id').references(() => leads.id, { onDelete: 'cascade' }),
    orgId: uuid('org_id').references(() => organizations.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    scheduledAt: timestamp('scheduled_at', { withTimezone: true }).notNull(),
    durationMinutes: integer('duration_minutes').notNull().default(30),
    location: text('location'),
    status: meetingStatusEnum('status').notNull().default('scheduled'),
    notes: text('notes'),
    createdById: uuid('created_by_id').references(() => users.id, { onDelete: 'set null' }),
    ...timestamps,
  },
  (t) => [index('meetings_lead_idx').on(t.leadId), index('meetings_org_idx').on(t.orgId)],
);

/* ------------------------------------------------------------------ */
/* Proposals                                                           */
/* ------------------------------------------------------------------ */

export const proposals = pgTable(
  'proposals',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    number: text('number').notNull(),
    leadId: uuid('lead_id').references(() => leads.id, { onDelete: 'set null' }),
    /** Set when the lead converts; makes the proposal visible to that client org. */
    orgId: uuid('org_id').references(() => organizations.id, { onDelete: 'set null' }),
    title: text('title').notNull(),
    summary: text('summary').notNull().default(''),
    scope: text('scope').notNull().default(''),
    deliverables: text('deliverables').notNull().default(''),
    assumptions: text('assumptions').notNull().default(''),
    timeline: text('timeline').notNull().default(''),
    status: proposalStatusEnum('status').notNull().default('draft'),
    depositPercent: integer('deposit_percent').notNull().default(50),
    retainerMonthlyCents: integer('retainer_monthly_cents'),
    retainerDescription: text('retainer_description'),
    validUntil: timestamp('valid_until', { withTimezone: true }),
    sentAt: timestamp('sent_at', { withTimezone: true }),
    /** Records a client's acknowledgment. This is NOT a legally binding e-signature. */
    acceptedAt: timestamp('accepted_at', { withTimezone: true }),
    acceptedByName: text('accepted_by_name'),
    acceptedByUserId: uuid('accepted_by_user_id').references(() => users.id, { onDelete: 'set null' }),
    createdById: uuid('created_by_id').references(() => users.id, { onDelete: 'set null' }),
    isDemo: boolean('is_demo').notNull().default(false),
    ...timestamps,
  },
  (t) => [
    uniqueIndex('proposals_number_uq').on(t.number),
    index('proposals_lead_idx').on(t.leadId),
    index('proposals_org_idx').on(t.orgId),
    check('proposals_deposit_ck', sql`${t.depositPercent} between 0 and 100`),
  ],
);

export const proposalItems = pgTable(
  'proposal_items',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    proposalId: uuid('proposal_id')
      .notNull()
      .references(() => proposals.id, { onDelete: 'cascade' }),
    description: text('description').notNull(),
    quantity: integer('quantity').notNull().default(1),
    unitPriceCents: integer('unit_price_cents').notNull().default(0),
    sortOrder: integer('sort_order').notNull().default(0),
  },
  (t) => [
    index('proposal_items_proposal_idx').on(t.proposalId),
    check('proposal_items_qty_ck', sql`${t.quantity} > 0`),
    check('proposal_items_price_ck', sql`${t.unitPriceCents} >= 0`),
  ],
);

/* ------------------------------------------------------------------ */
/* Client delivery (every row carries org_id)                          */
/* ------------------------------------------------------------------ */

export const projects = pgTable(
  'projects',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orgId: uuid('org_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    proposalId: uuid('proposal_id').references(() => proposals.id, { onDelete: 'set null' }),
    name: text('name').notNull(),
    description: text('description').notNull().default(''),
    status: projectStatusEnum('status').notNull().default('planning'),
    ownerId: uuid('owner_id').references(() => users.id, { onDelete: 'set null' }),
    startDate: timestamp('start_date', { withTimezone: true }),
    targetDate: timestamp('target_date', { withTimezone: true }),
    clientVisible: boolean('client_visible').notNull().default(true),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
    ...timestamps,
  },
  (t) => [index('projects_org_idx').on(t.orgId)],
);

export const projectMilestones = pgTable(
  'project_milestones',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orgId: uuid('org_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    projectId: uuid('project_id')
      .notNull()
      .references(() => projects.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    description: text('description').notNull().default(''),
    status: milestoneStatusEnum('status').notNull().default('not_started'),
    dueDate: timestamp('due_date', { withTimezone: true }),
    sortOrder: integer('sort_order').notNull().default(0),
    clientVisible: boolean('client_visible').notNull().default(true),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    ...timestamps,
  },
  (t) => [index('milestones_project_idx').on(t.projectId), index('milestones_org_idx').on(t.orgId)],
);

export const tasks = pgTable(
  'tasks',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    title: text('title').notNull(),
    description: text('description').notNull().default(''),
    status: taskStatusEnum('status').notNull().default('open'),
    priority: priorityEnum('priority').notNull().default('normal'),
    dueAt: timestamp('due_at', { withTimezone: true }),
    assigneeId: uuid('assignee_id').references(() => users.id, { onDelete: 'set null' }),
    leadId: uuid('lead_id').references(() => leads.id, { onDelete: 'cascade' }),
    /** Set for client-delivery tasks. */
    orgId: uuid('org_id').references(() => organizations.id, { onDelete: 'cascade' }),
    projectId: uuid('project_id').references(() => projects.id, { onDelete: 'cascade' }),
    /** Client-visible tasks appear in the portal onboarding checklist. */
    clientVisible: boolean('client_visible').notNull().default(false),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    createdById: uuid('created_by_id').references(() => users.id, { onDelete: 'set null' }),
    ...timestamps,
  },
  (t) => [
    index('tasks_status_due_idx').on(t.status, t.dueAt),
    index('tasks_lead_idx').on(t.leadId),
    index('tasks_org_idx').on(t.orgId),
    index('tasks_project_idx').on(t.projectId),
    check('tasks_project_org_ck', sql`${t.projectId} is null or ${t.orgId} is not null`),
  ],
);

export const supportTickets = pgTable(
  'support_tickets',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orgId: uuid('org_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    projectId: uuid('project_id').references(() => projects.id, { onDelete: 'set null' }),
    subject: text('subject').notNull(),
    status: ticketStatusEnum('status').notNull().default('open'),
    priority: priorityEnum('priority').notNull().default('normal'),
    createdById: uuid('created_by_id').references(() => users.id, { onDelete: 'set null' }),
    assigneeId: uuid('assignee_id').references(() => users.id, { onDelete: 'set null' }),
    closedAt: timestamp('closed_at', { withTimezone: true }),
    ...timestamps,
  },
  (t) => [index('tickets_org_idx').on(t.orgId, t.status)],
);

export const ticketMessages = pgTable(
  'ticket_messages',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orgId: uuid('org_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    ticketId: uuid('ticket_id')
      .notNull()
      .references(() => supportTickets.id, { onDelete: 'cascade' }),
    authorId: uuid('author_id').references(() => users.id, { onDelete: 'set null' }),
    body: text('body').notNull(),
    /** Internal notes are never returned to client users. */
    internalNote: boolean('internal_note').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('ticket_messages_ticket_idx').on(t.ticketId, t.createdAt)],
);

export const files = pgTable(
  'files',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orgId: uuid('org_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    projectId: uuid('project_id').references(() => projects.id, { onDelete: 'set null' }),
    name: text('name').notNull(),
    contentType: text('content_type').notNull(),
    sizeBytes: integer('size_bytes').notNull(),
    storageDriver: text('storage_driver').notNull(),
    storageKey: text('storage_key').notNull(),
    visibility: fileVisibilityEnum('visibility').notNull().default('client'),
    uploadedById: uuid('uploaded_by_id').references(() => users.id, { onDelete: 'set null' }),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('files_org_idx').on(t.orgId), uniqueIndex('files_storage_key_uq').on(t.storageKey)],
);

export const invoices = pgTable(
  'invoices',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orgId: uuid('org_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    proposalId: uuid('proposal_id').references(() => proposals.id, { onDelete: 'set null' }),
    number: text('number').notNull(),
    description: text('description').notNull(),
    amountCents: integer('amount_cents').notNull(),
    status: invoiceStatusEnum('status').notNull().default('draft'),
    dueDate: timestamp('due_date', { withTimezone: true }),
    issuedAt: timestamp('issued_at', { withTimezone: true }),
    paidAt: timestamp('paid_at', { withTimezone: true }),
    /** Hosted payment link (e.g. Stripe Payment Link / QuickBooks invoice URL). Never card data. */
    paymentUrl: text('payment_url'),
    /** Manual note describing how payment was recorded (e.g. "ACH received, recorded manually"). */
    paymentNote: text('payment_note'),
    ...timestamps,
  },
  (t) => [
    uniqueIndex('invoices_number_uq').on(t.number),
    index('invoices_org_idx').on(t.orgId),
    check('invoices_amount_ck', sql`${t.amountCents} >= 0`),
  ],
);

export const clientUpdates = pgTable(
  'client_updates',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orgId: uuid('org_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    projectId: uuid('project_id').references(() => projects.id, { onDelete: 'set null' }),
    kind: updateKindEnum('kind').notNull().default('update'),
    title: text('title').notNull(),
    body: text('body').notNull(),
    clientVisible: boolean('client_visible').notNull().default(false),
    authorId: uuid('author_id').references(() => users.id, { onDelete: 'set null' }),
    ...timestamps,
  },
  (t) => [index('client_updates_org_idx').on(t.orgId, t.createdAt)],
);

/** Connected-tool metadata only. Credentials are NEVER stored here. */
export const integrations = pgTable(
  'integrations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orgId: uuid('org_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    tool: text('tool').notNull(),
    category: text('category').notNull().default('other'),
    status: integrationStatusEnum('status').notNull().default('not_connected'),
    notes: text('notes').notNull().default(''),
    ...timestamps,
  },
  (t) => [index('integrations_org_idx').on(t.orgId)],
);

/* ------------------------------------------------------------------ */
/* Platform                                                            */
/* ------------------------------------------------------------------ */

export const auditEvents = pgTable(
  'audit_events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    actorId: uuid('actor_id').references(() => users.id, { onDelete: 'set null' }),
    actorLabel: text('actor_label').notNull(),
    action: text('action').notNull(),
    entityType: text('entity_type').notNull(),
    entityId: text('entity_id'),
    orgId: uuid('org_id').references(() => organizations.id, { onDelete: 'set null' }),
    metadata: jsonb('metadata').$type<Record<string, unknown>>().notNull().default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('audit_created_idx').on(t.createdAt),
    index('audit_entity_idx').on(t.entityType, t.entityId),
    index('audit_org_idx').on(t.orgId),
  ],
);

export const articles = pgTable(
  'articles',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    slug: text('slug').notNull(),
    title: text('title').notNull(),
    description: text('description').notNull(),
    body: text('body').notNull(),
    status: articleStatusEnum('status').notNull().default('draft'),
    authorName: text('author_name').notNull(),
    tags: jsonb('tags').$type<string[]>().notNull().default([]),
    readingMinutes: integer('reading_minutes').notNull().default(5),
    publishedAt: timestamp('published_at', { withTimezone: true }),
    reviewedById: uuid('reviewed_by_id').references(() => users.id, { onDelete: 'set null' }),
    ...timestamps,
  },
  (t) => [uniqueIndex('articles_slug_uq').on(t.slug), index('articles_status_idx').on(t.status)],
);

export const siteSettings = pgTable('site_settings', {
  key: text('key').primaryKey(),
  value: jsonb('value').$type<Record<string, unknown>>().notNull(),
  updatedById: uuid('updated_by_id').references(() => users.id, { onDelete: 'set null' }),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

/** Fixed-window rate limit counters (serverless-safe; no Redis required). */
export const rateLimits = pgTable('rate_limits', {
  key: text('key').primaryKey(),
  count: integer('count').notNull().default(0),
  windowStart: timestamp('window_start', { withTimezone: true }).notNull().defaultNow(),
});

/** First-party, cookieless analytics. No IPs, no emails, no names. */
export const analyticsEvents = pgTable(
  'analytics_events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: text('name').notNull(),
    path: text('path'),
    /** Random per-browser-session identifier generated client-side; not linked to a person. */
    sessionId: text('session_id'),
    utmSource: text('utm_source'),
    utmMedium: text('utm_medium'),
    utmCampaign: text('utm_campaign'),
    referrerHost: text('referrer_host'),
    props: jsonb('props').$type<Record<string, string>>().notNull().default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('analytics_name_created_idx').on(t.name, t.createdAt)],
);

export type User = typeof users.$inferSelect;
export type Organization = typeof organizations.$inferSelect;
export type Lead = typeof leads.$inferSelect;
export type Proposal = typeof proposals.$inferSelect;
export type ProposalItem = typeof proposalItems.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type StaffRole = (typeof staffRoleEnum.enumValues)[number];
export type MemberRole = (typeof memberRoleEnum.enumValues)[number];
export type LeadStage = (typeof leadStageEnum.enumValues)[number];
