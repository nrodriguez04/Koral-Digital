import type { Metadata } from 'next';
import Link from 'next/link';
import { AuthShell } from '@/components/auth/auth-shell';
import { DescopeProvider } from '@/components/auth/descope-provider';
import { SignInFlow } from '@/components/auth/sign-in-flow';
import { Alert } from '@/components/ui/primitives';
import { safeNext } from '@/lib/auth/redirects';
import { env, isDescopeConfigured, isDevAuthMockEnabled } from '@/lib/env';

export const metadata: Metadata = { title: 'Sign in', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  const target = safeNext(next);
  const e = env();
  return (
    <AuthShell
      title="Sign in to Koral Digital"
      intro="For Koral Digital clients and team members. If you were invited, use the same email address the invitation was sent to."
    >
      {isDescopeConfigured() ? (
        <DescopeProvider
          projectId={e.NEXT_PUBLIC_DESCOPE_PROJECT_ID}
          baseUrl={e.NEXT_PUBLIC_DESCOPE_BASE_URL}
        >
          <SignInFlow flowId={e.NEXT_PUBLIC_DESCOPE_SIGN_IN_FLOW_ID} next={target} />
        </DescopeProvider>
      ) : (
        <Alert tone="warning" title="Sign-in is not configured yet">
          Secure sign-in uses Descope, and this deployment does not have a Descope Project ID configured
          (NEXT_PUBLIC_DESCOPE_PROJECT_ID). Private areas stay locked until it is set — see DEPLOYMENT.md,
          “Descope”.
        </Alert>
      )}
      {isDevAuthMockEnabled() ? (
        <div className="mt-6">
          <Alert tone="info" title="Local development">
            The development-only sign-in is enabled.{' '}
            <Link
              href={`/dev-login${target ? `?next=${encodeURIComponent(target)}` : ''}`}
              className="font-semibold underline"
            >
              Use a synthetic dev account
            </Link>
            . This option does not exist in production builds.
          </Alert>
        </div>
      ) : null}
      <p className="text-ink/55 mt-8 text-sm">
        Not a client yet?{' '}
        <Link href="/contact" className="text-ocean-700 font-semibold hover:underline">
          Book a free consultation
        </Link>
        .
      </p>
    </AuthShell>
  );
}
