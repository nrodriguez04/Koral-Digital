import type { Metadata } from 'next';
import { isNotNull } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { getDb, isDatabaseConfigured } from '@/db';
import { users } from '@/db/schema';
import { AuthShell } from '@/components/auth/auth-shell';
import { Alert } from '@/components/ui/primitives';
import { getActor } from '@/lib/auth/session';
import { env } from '@/lib/env';
import { SetupForm } from './setup-form';

export const metadata: Metadata = { title: 'First-time setup', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

export default async function SetupPage() {
  if (!isDatabaseConfigured()) {
    return (
      <AuthShell title="First-time setup">
        <Alert tone="warning" title="Database not configured">
          Set DATABASE_URL and run migrations first.
        </Alert>
      </AuthShell>
    );
  }
  const staff = await getDb().select({ id: users.id }).from(users).where(isNotNull(users.staffRole)).limit(1);
  if (staff.length) {
    return (
      <AuthShell title="Setup is complete">
        <Alert tone="info">
          An administrator already exists. Ask them to invite you from Settings → Team.
        </Alert>
      </AuthShell>
    );
  }
  const actor = await getActor();
  if (!actor) redirect('/sign-in?next=/setup');
  return (
    <AuthShell
      title="Claim the first administrator account"
      intro={
        <>
          Signed in as <strong>{actor.user.email ?? actor.user.id}</strong>. This works once, only while no
          Koral staff account exists.
        </>
      }
    >
      {env().SETUP_TOKEN ? (
        <SetupForm />
      ) : (
        <Alert tone="warning" title="SETUP_TOKEN is not set">
          Set a long random SETUP_TOKEN environment variable and redeploy, or grant the role from a terminal
          with <code>npm run admin:grant -- --email you@example.com --role superadmin</code>.
        </Alert>
      )}
    </AuthShell>
  );
}
