import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AuthShell } from '@/components/auth/auth-shell';
import { getActor } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Client portal', robots: { index: false, follow: false } };

export default async function PortalIndex() {
  const actor = await getActor();
  if (!actor) redirect('/sign-in?next=/portal');
  if (actor.memberships.length === 1) redirect(`/portal/${actor.memberships[0]!.orgSlug}`);
  if (actor.memberships.length === 0) redirect(actor.staffRole ? '/app' : '/no-access');
  return (
    <AuthShell title="Choose a workspace" intro="Your account has access to more than one organization.">
      <ul className="space-y-2">
        {actor.memberships.map((m) => (
          <li key={m.orgId}>
            <Link
              href={`/portal/${m.orgSlug}`}
              className="border-ink/10 hover:border-ocean-500/50 block rounded-xl border bg-white px-4 py-3 font-medium"
            >
              {m.orgName}
            </Link>
          </li>
        ))}
      </ul>
    </AuthShell>
  );
}
