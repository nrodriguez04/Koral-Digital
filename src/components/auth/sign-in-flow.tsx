'use client';

import { Descope } from '@descope/nextjs-sdk';
import { useSession } from '@descope/nextjs-sdk/client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Alert } from '@/components/ui/primitives';

export function SignInFlow({ flowId, next }: { flowId: string; next: string | null }) {
  const router = useRouter();
  const { isAuthenticated, isSessionLoading } = useSession();
  const [error, setError] = useState<string | null>(null);
  const continueUrl = `/auth/continue${next ? `?next=${encodeURIComponent(next)}` : ''}`;

  useEffect(() => {
    // An already-authenticated user (e.g. after a silent refresh) is sent onward.
    if (!isSessionLoading && isAuthenticated) router.replace(continueUrl);
  }, [isAuthenticated, isSessionLoading, router, continueUrl]);

  if (isSessionLoading || isAuthenticated) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-sm text-ink/60" role="status">
        <Loader2 className="size-4 animate-spin" aria-hidden="true" /> Checking your session…
      </div>
    );
  }

  return (
    <div className="space-y-4">
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
