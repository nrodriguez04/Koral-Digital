import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { AppShell } from '@/components/app/app-shell';
import type { NavItem } from '@/components/app/nav-links';
import { DescopeProvider } from '@/components/auth/descope-provider';
import { pageRequireOrgMember } from '@/lib/auth/guards';
import { memberCan } from '@/lib/auth/permissions';
import { env } from '@/lib/env';
import { titleCase } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: { default: 'Client portal', template: '%s · Koral client portal' },
  robots: { index: false, follow: false },
};

export default async function PortalLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ org: string }>;
}) {
  const { org: orgSlug } = await params;
  const { actor, org, role } = await pageRequireOrgMember(orgSlug);
  const base = `/portal/${org.slug}`;
  const nav: NavItem[] = [
    { href: base, label: 'Overview', icon: 'dashboard', exact: true },
    { href: `${base}/support`, label: 'Support', icon: 'lifebuoy' },
    { href: `${base}/documents`, label: 'Documents', icon: 'folder' },
    { href: `${base}/billing`, label: 'Proposals & billing', icon: 'card' },
    ...(memberCan(role, 'team:manage')
      ? [{ href: `${base}/team`, label: 'Team', icon: 'users' as const }]
      : []),
  ];
  const e = env();
  return (
    <DescopeProvider projectId={e.NEXT_PUBLIC_DESCOPE_PROJECT_ID} baseUrl={e.NEXT_PUBLIC_DESCOPE_BASE_URL}>
      <AppShell
        nav={nav}
        title={org.name.toUpperCase().slice(0, 24)}
        subtitle="Koral Digital client portal"
        homeHref={base}
        authMethod={actor.authMethod}
        user={{
          name: actor.user.name,
          email: actor.user.email,
          role: titleCase(role).replace('Client ', ''),
        }}
        banner={
          org.isDemo || actor.authMethod === 'dev-mock' ? (
            <div className="bg-amber-100 px-4 py-1.5 text-center text-xs font-medium text-amber-900">
              Synthetic development workspace — not a real client.
            </div>
          ) : null
        }
      >
        {children}
      </AppShell>
    </DescopeProvider>
  );
}
