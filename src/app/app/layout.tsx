import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { and, eq, inArray } from 'drizzle-orm';
import { AppShell } from '@/components/app/app-shell';
import type { NavItem } from '@/components/app/nav-links';
import { DescopeProvider } from '@/components/auth/descope-provider';
import { getDb } from '@/db';
import { leads, supportTickets } from '@/db/schema';
import { pageRequireStaff } from '@/lib/auth/guards';
import { staffCan, type StaffPermission } from '@/lib/auth/permissions';
import { env } from '@/lib/env';
import { titleCase } from '@/lib/utils';

export const metadata: Metadata = {
  title: { default: 'Koral Ops', template: '%s · Koral Ops' },
  robots: { index: false, follow: false },
};
export const dynamic = 'force-dynamic';

const NAV: (NavItem & { perm: StaffPermission })[] = [
  { href: '/app', label: 'Overview', icon: 'dashboard', exact: true, perm: 'leads:read' },
  { href: '/app/leads', label: 'Leads', icon: 'inbox', perm: 'leads:read' },
  { href: '/app/companies', label: 'Companies', icon: 'building', perm: 'leads:read' },
  { href: '/app/proposals', label: 'Proposals', icon: 'file', perm: 'leads:read' },
  { href: '/app/clients', label: 'Clients', icon: 'briefcase', perm: 'clients:read' },
  { href: '/app/projects', label: 'Projects', icon: 'kanban', perm: 'clients:read' },
  { href: '/app/tickets', label: 'Support', icon: 'lifebuoy', perm: 'clients:read' },
  { href: '/app/tasks', label: 'Tasks', icon: 'check', perm: 'leads:read' },
  { href: '/app/content', label: 'Insights content', icon: 'book', perm: 'content:write' },
  { href: '/app/analytics', label: 'Acquisition', icon: 'chart', perm: 'analytics:read' },
  { href: '/app/audit', label: 'Audit log', icon: 'scroll', perm: 'audit:read' },
  { href: '/app/settings', label: 'Settings', icon: 'settings', perm: 'settings:write' },
];

export default async function InternalLayout({ children }: { children: ReactNode }) {
  const actor = await pageRequireStaff();
  const db = getDb();
  const [newLeads, openTickets] = await Promise.all([
    db.$count(leads, and(eq(leads.stage, 'new'), eq(leads.isDemo, false))),
    db.$count(supportTickets, inArray(supportTickets.status, ['open', 'waiting_on_koral'])),
  ]);
  const nav = NAV.filter((n) => staffCan(actor.staffRole, n.perm)).map(({ perm: _p, ...n }) => ({
    ...n,
    count: n.href === '/app/leads' ? newLeads : n.href === '/app/tickets' ? openTickets : undefined,
  }));
  const e = env();
  return (
    <DescopeProvider projectId={e.NEXT_PUBLIC_DESCOPE_PROJECT_ID} baseUrl={e.NEXT_PUBLIC_DESCOPE_BASE_URL}>
      <AppShell
        nav={nav}
        title="KORAL OPS"
        subtitle="Internal portal"
        homeHref="/app"
        authMethod={actor.authMethod}
        user={{ name: actor.user.name, email: actor.user.email, role: titleCase(actor.staffRole) }}
        banner={
          actor.authMethod === 'dev-mock' ? (
            <div className="bg-amber-100 px-4 py-1.5 text-center text-xs font-medium text-amber-900">
              Development sign-in — synthetic account. Not available in production.
            </div>
          ) : null
        }
      >
        {children}
      </AppShell>
    </DescopeProvider>
  );
}
