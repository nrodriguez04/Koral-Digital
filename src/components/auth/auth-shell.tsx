import type { ReactNode } from 'react';
import { Logo } from '@/components/marketing/logo';

export function AuthShell({
  title,
  intro,
  children,
}: {
  title: string;
  intro?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div className="ocean-gradient wave-lines hidden flex-col justify-between p-12 text-white lg:flex">
        <Logo inverse />
        <div>
          <p className="text-3xl font-semibold tracking-tight text-balance">
            Your projects, documents and requests — in one secure place.
          </p>
          <p className="mt-4 max-w-md text-white/70">
            Access is by invitation only. Every account sees only its own organization&apos;s information.
          </p>
        </div>
        <p className="text-xs text-white/50">Building a better tomorrow.</p>
      </div>
      <div className="flex flex-col justify-center px-6 py-12 sm:px-12">
        <div className="mx-auto w-full max-w-md">
          <div className="lg:hidden">
            <Logo />
          </div>
          <h1 className="mt-8 text-2xl font-semibold tracking-tight lg:mt-0">{title}</h1>
          {intro ? <div className="text-ink/65 mt-2 text-sm leading-relaxed">{intro}</div> : null}
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
