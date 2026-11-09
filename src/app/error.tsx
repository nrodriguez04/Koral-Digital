'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('page_error', error.digest);
  }, [error]);
  return (
    <div className="flex min-h-[60dvh] flex-col items-center justify-center px-6 py-16 text-center">
      <p className="eyebrow">Something went wrong</p>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight">This page could not be loaded.</h1>
      <p className="text-ink/65 mt-2 max-w-md text-sm">
        Please try again. If it keeps happening, the issue has been logged
        {error.digest ? ` (reference ${error.digest})` : ''}.
      </p>
      <div className="mt-6 flex gap-3">
        <Button onClick={reset}>Try again</Button>
        <Link
          href="/"
          className="text-ocean-700 hover:bg-ink/5 inline-flex h-10 items-center rounded-xl px-4 text-sm font-semibold"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
