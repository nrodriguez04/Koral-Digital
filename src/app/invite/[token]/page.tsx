import type { Metadata } from 'next';
import Link from 'next/link';
import { AuthShell } from '@/components/auth/auth-shell';
import { ButtonLink } from '@/components/ui/button';
import { Alert } from '@/components/ui/primitives';
import { getActor } from '@/lib/auth/session';
import { titleCase } from '@/lib/utils';
import { findInvitationByToken, maskEmail } from '@/server/invitations';
import { AcceptForm } from './accept-form';

export const metadata: Metadata = { title: 'Invitation', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const found = await findInvitationByToken(token);
  if (!found || !found.usable) {
    return (
      <AuthShell title="This invitation link is not valid">
        <Alert tone="warning">
          The link may have expired, been replaced by a newer invitation, or already been used. Ask your Koral Digital
          contact to send a fresh invitation.
        </Alert>
        <Link href="/sign-in" className="mt-6 inline-block text-sm font-semibold text-ocean-700 hover:underline">
          Go to sign in
        </Link>
      </AuthShell>
    );
  }
  const { inv, org } = found;
  const actor = await getActor();
  const what = org
    ? `the ${org.name} client workspace as ${titleCase(inv.memberRole ?? 'member').replace('Client ', '')}`
    : `the Koral Digital team as ${titleCase(inv.staffRole ?? 'staff')}`;
  return (
    <AuthShell
      title="You have been invited"
      intro={
        <>
          This invitation gives <strong>{maskEmail(inv.email)}</strong> access to {what}. It expires{' '}
          {inv.expiresAt.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}.
        </>
      }
    >
      {actor ? (
        <>
          <p className="mb-4 text-sm text-ink/65">
            Signed in as <strong>{actor.user.email ?? 'your account'}</strong>.
          </p>
          <AcceptForm token={token} />
        </>
      ) : (
        <ButtonLink href={`/sign-in?next=${encodeURIComponent(`/invite/${token}`)}`} size="lg" className="w-full">
          Sign in to accept
        </ButtonLink>
      )}
    </AuthShell>
  );
}
