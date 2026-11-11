import type { Metadata } from 'next';
import { isNotNull } from 'drizzle-orm';
import { notFound } from 'next/navigation';
import { getDb } from '@/db';
import { users } from '@/db/schema';
import { AuthShell } from '@/components/auth/auth-shell';
import { Alert, Badge } from '@/components/ui/primitives';
import { isDevAuthMockEnabled } from '@/lib/env';
import { devSignIn } from './actions';

export const metadata: Metadata = { title: 'Development sign-in', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

export default async function DevLoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  if (!isDevAuthMockEnabled()) notFound();
  const { next } = await searchParams;
  const devUsers = await getDb().query.users.findMany({ where: isNotNull(users.devKey) });
  return (
    <AuthShell
      title="Development sign-in"
      intro="Synthetic accounts created by npm run db:seed:dev. Disabled in production builds."
    >
      <Alert tone="warning" title="Local development only" className="mb-6">
        These are fake users for testing roles and tenant isolation. They cannot sign in on a production
        deployment.
      </Alert>
      {devUsers.length === 0 ? (
        <p className="text-ink/65 text-sm">
          No dev users yet. Run <code>npm run db:seed:dev</code>.
        </p>
      ) : (
        <ul className="space-y-2">
          {devUsers.map((u) => (
            <li key={u.id}>
              <form action={devSignIn}>
                <input type="hidden" name="userId" value={u.id} />
                <input type="hidden" name="next" value={next ?? ''} />
                <button
                  type="submit"
                  className="border-ink/10 hover:border-ocean-500/50 flex w-full items-center justify-between gap-3 rounded-xl border bg-white px-4 py-3 text-left text-sm"
                  data-testid={`dev-login-${u.devKey}`}
                >
                  <span>
                    <span className="block font-medium">{u.name}</span>
                    <span className="text-ink/55 block text-xs">{u.email}</span>
                  </span>
                  <Badge tone={u.staffRole ? 'navy' : 'ocean'}>{u.staffRole ?? 'client'}</Badge>
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </AuthShell>
  );
}
