import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { SignOutButton } from '@/components/auth/sign-out-button';
import { initials } from '@/lib/utils';
import { NavLinks, type NavItem } from './nav-links';
import { MobileSidebar } from './mobile-sidebar';

export function AppShell({
  nav,
  title,
  subtitle,
  user,
  authMethod,
  banner,
  children,
  homeHref,
}: {
  nav: NavItem[];
  title: string;
  subtitle: string;
  user: { name: string | null; email: string | null; role: string };
  authMethod: 'descope' | 'dev-mock';
  banner?: ReactNode;
  children: ReactNode;
  homeHref: string;
}) {
  const sidebar = (
    <div className="flex h-full flex-col">
      <Link href={homeHref} className="flex items-center gap-2.5 px-4 py-5">
        <Image src="/brand/koral-mark-trim.png" alt="" width={34} height={34} />
        <span className="leading-tight">
          <span className="block text-sm font-semibold tracking-[0.18em] text-white">{title}</span>
          <span className="text-ocean-300 block text-[11px]">{subtitle}</span>
        </span>
      </Link>
      <div className="flex-1 overflow-y-auto px-3 pb-4">
        <NavLinks items={nav} />
      </div>
      <div className="border-t border-white/10 p-3">
        <div className="flex items-center gap-3 px-2 py-2">
          <span className="bg-ocean-500 flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white">
            {initials(user.name ?? user.email)}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium text-white">
              {user.name ?? user.email ?? 'Signed in'}
            </span>
            <span className="block truncate text-xs text-white/55">{user.role}</span>
          </span>
        </div>
        <SignOutButton method={authMethod} inverse />
      </div>
    </div>
  );
  return (
    <div className="min-h-dvh bg-[#F6F4EF]">
      <aside className="bg-ocean-950 fixed inset-y-0 left-0 z-30 hidden w-64 lg:block">{sidebar}</aside>
      <div className="lg:pl-64">
        <header className="border-ink/8 sticky top-0 z-20 flex h-14 items-center gap-3 border-b bg-white/90 px-4 backdrop-blur lg:hidden">
          <MobileSidebar>{sidebar}</MobileSidebar>
          <span className="text-sm font-semibold tracking-[0.15em]">{title}</span>
        </header>
        {banner}
        <main id="main" className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
