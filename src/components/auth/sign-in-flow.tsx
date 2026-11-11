'use client';

import { Descope } from '@descope/nextjs-sdk';
import { useDescope, useSession } from '@descope/nextjs-sdk/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Alert } from '@/components/ui/primitives';

export function SignInFlow({
  flowId,
  next,
  stale = false,
}: {
  flowId: string;
  next: string | null;
  /** The server just rejected this browser's session, so it must not be trusted again. */
  stale?: boolean;
}) {
  const router = useRouter();
  const sdk = useDescope();
  const { isAuthenticated, isSessionLoading } = useSession();
  const [error, setError] = useState<string | null>(null);
  const [clearing, setClearing] = useState(stale);
  const continueUrl = `/auth/continue${next ? `?next=${encodeURIComponent(next)}` : ''}`;

  useEffect(() => {
    if (!stale) return;
    // Drop the rejected session so the flow can start fresh. If Descope can't be reached the
    // tokens may survive, but the flow is shown either way and a new sign-in replaces them.
    let active = true;
    sdk
      .logout()
      .catch(() => undefined)
      .finally(() => active && setClearing(false));
    return () => {
      active = false;
    };
  }, [stale, sdk]);

  useEffect(() => {
    // An already-authenticated user (e.g. after a silent refresh) is sent onward, unless the
    // server has just turned that session away, which would only bring them straight back.
    if (!stale && !isSessionLoading && isAuthenticated) router.replace(continueUrl);
  }, [stale, isAuthenticated, isSessionLoading, router, continueUrl]);

  if (clearing || (!stale && (isSessionLoading || isAuthenticated))) {
    return (
      <div className="text-ink/60 flex items-center justify-center gap-2 py-16 text-sm" role="status">
        <Loader2 className="size-4 animate-spin" aria-hidden="true" /> Checking your session…
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {stale ? <Alert tone="info">Your previous session has ended. Please sign in again.</Alert> : null}
      {error ? <Alert tone="error">{error}</Alert> : null}
      <Descope
        flowId={flowId}
        theme="light"
        onSuccess={() => router.replace(continueUrl)}
        onError={() => setError('Sign-in did not complete. Please try again.')}
      />
    </div>
  );
}
