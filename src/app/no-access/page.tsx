import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AuthShell } from '@/components/auth/auth-shell';
import { DescopeProvider } from '@/components/auth/descope-provider';
import { SignOutButton } from '@/components/auth/sign-out-button';
import { getActor } from '@/lib/auth/session';
import { env } from '@/lib/env';

export const metadata: Metadata = { title: 'No access yet', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

export default async function NoAccessPage() {
  const actor = await getActor();
  if (!actor) redirect('/sign-in');
  if (actor.staffRole) redirect('/app');
  if (actor.memberships.length) redirect('/portal');
  return (
    <AuthShell
      title="You are signed in, but there is nothing to show yet"
      intro={
        <>
          Signed in as <strong>{actor.user.email ?? 'your account'}</strong>. Access to the Koral Digital portal is by
          invitation. If you expected access, ask your Koral Digital contact to send an invitation to this email
          address, then open the link in that email.
        </>
      }
    >
      <DescopeProvider projectId={env().NEXT_PUBLIC_DESCOPE_PROJECT_ID} baseUrl={env().NEXT_PUBLIC_DESCOPE_BASE_URL}>
        <div className="flex flex-col gap-3">
          <Link href="/" className="text-sm font-semibold text-ocean-700 hover:underline">
            ← Back to koraldigital.com
          </Link>
          <div className="max-w-40">
            <SignOutButton method={actor.authMethod} />
          </div>
        </div>
      </DescopeProvider>
    </AuthShell>
  );
}
