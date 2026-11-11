import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AuthShell } from '@/components/auth/auth-shell';
import { DescopeProvider } from '@/components/auth/descope-provider';
import { SignOutButton } from '@/components/auth/sign-out-button';
import { getDescopeSession } from '@/lib/auth/descope';
import { safeNext } from '@/lib/auth/redirects';
import { getActor } from '@/lib/auth/session';
import { env } from '@/lib/env';

export const metadata: Metadata = { title: 'Signing in', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

/** Post-authentication router: sends each user to the area their server-side roles allow. */
export default async function ContinuePage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  const target = safeNext(next);
  const actor = await getActor();
  if (!actor) {
    // Signed in with Descope, but the account could not be loaded (database unreachable, account
    // deactivated). /sign-in would see the Descope session and send the browser straight back
    // here, so stop and say so instead of looping.
    if (await getDescopeSession()) return <AccountUnavailable next={target} />;
    redirect('/sign-in');
  }
  if (target) {
    const isApp = target.startsWith('/app');
    const isPortal = target.startsWith('/portal');
    if ((isApp && actor.staffRole) || (isPortal && actor.memberships.length) || (!isApp && !isPortal))
      redirect(target);
  }
  if (actor.staffRole) redirect('/app');
  if (actor.memberships.length === 1) redirect(`/portal/${actor.memberships[0]!.orgSlug}`);
  if (actor.memberships.length > 1) redirect('/portal');
  redirect('/no-access');
}

function AccountUnavailable({ next }: { next: string | null }) {
  return (
    <AuthShell
      title="We couldn't open your account"
      intro="Your sign-in worked, but the portal could not load your account just now. Please try again in a few minutes. If it keeps happening, let your Koral Digital contact know."
    >
      <DescopeProvider
        projectId={env().NEXT_PUBLIC_DESCOPE_PROJECT_ID}
        baseUrl={env().NEXT_PUBLIC_DESCOPE_BASE_URL}
      >
        <div className="flex flex-col gap-3">
          <Link
            href={`/auth/continue${next ? `?next=${encodeURIComponent(next)}` : ''}`}
            className="text-ocean-700 text-sm font-semibold hover:underline"
          >
            Try again
          </Link>
          <div className="max-w-40">
            <SignOutButton method="descope" />
          </div>
        </div>
      </DescopeProvider>
    </AuthShell>
  );
}
