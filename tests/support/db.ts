import { sql } from 'drizzle-orm';
import { getDb } from '@/db';

export async function resetDb() {
  const tables = [
    'analytics_events',
    'rate_limits',
    'audit_events',
    'ticket_messages',
    'support_tickets',
    'files',
    'invoices',
    'client_updates',
    'integrations',
    'tasks',
    'project_milestones',
    'projects',
    'proposal_items',
    'proposals',
    'meetings',
    'discovery_answers',
    'lead_activities',
    'invitations',
    'memberships',
    'leads',
    'organizations',
    'contacts',
    'companies',
    'site_settings',
    'articles',
    'users',
  ];
  await getDb().execute(
    sql.raw(`truncate ${tables.map((t) => `"${t}"`).join(', ')} restart identity cascade`),
  );
}
