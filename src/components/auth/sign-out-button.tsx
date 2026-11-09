'use client';

import { useDescope } from '@descope/nextjs-sdk/client';
import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { devSignOut } from '@/app/dev-login/actions';
import { cn } from '@/lib/utils';

function DescopeSignOut({ className, inverse }: { className?: string; inverse?: boolean }) {
  const sdk = useDescope();
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        start(async () => {
          try {
            await sdk.logout();
          } finally {
            router.replace('/');
            router.refresh();
          }
        })
      }
      className={cn(btn(inverse), className)}
    >
      <LogOut className="size-4" aria-hidden="true" /> Sign out
    </button>
  );
}

function DevSignOut({ className, inverse }: { className?: string; inverse?: boolean }) {
  return (
    <form action={devSignOut}>
      <button type="submit" className={cn(btn(inverse), className)}>
        <LogOut className="size-4" aria-hidden="true" /> Sign out (dev)
      </button>
    </form>
  );
}

const btn = (inverse?: boolean) =>
  cn(
    'inline-flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition',
    inverse
      ? 'text-white/75 hover:bg-white/10 hover:text-white'
      : 'text-ink/70 hover:bg-ink/5 hover:text-ink',
  );

export function SignOutButton({
  method,
  className,
  inverse,
}: {
  method: 'descope' | 'dev-mock';
  className?: string;
  inverse?: boolean;
}) {
  return method === 'dev-mock' ? (
    <DevSignOut className={className} inverse={inverse} />
  ) : (
    <DescopeSignOut className={className} inverse={inverse} />
  );
}
