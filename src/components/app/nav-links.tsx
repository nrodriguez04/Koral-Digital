'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  BookOpen,
  Briefcase,
  Building2,
  CheckSquare,
  CreditCard,
  FileText,
  FolderKanban,
  FolderOpen,
  LayoutDashboard,
  LifeBuoy,
  ScrollText,
  Settings,
  Users,
  Inbox,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const icons = {
  dashboard: LayoutDashboard,
  inbox: Inbox,
  building: Building2,
  file: FileText,
  briefcase: Briefcase,
  kanban: FolderKanban,
  lifebuoy: LifeBuoy,
  check: CheckSquare,
  book: BookOpen,
  chart: BarChart3,
  scroll: ScrollText,
  settings: Settings,
  users: Users,
  folder: FolderOpen,
  card: CreditCard,
};

export type NavItem = { href: string; label: string; icon: keyof typeof icons; exact?: boolean; count?: number };

export function NavLinks({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Main" className="space-y-0.5">
      {items.map((it) => {
        const Icon = icons[it.icon];
        const active = it.exact ? pathname === it.href : pathname === it.href || pathname.startsWith(`${it.href}/`);
        return (
          <Link
            key={it.href}
            href={it.href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition',
              active ? 'bg-white/12 text-white' : 'text-white/65 hover:bg-white/8 hover:text-white',
            )}
          >
            <Icon className="size-4 shrink-0" aria-hidden="true" />
            <span className="flex-1">{it.label}</span>
            {it.count ? (
              <span className="rounded-full bg-ocean-500 px-1.5 py-0.5 text-[10px] font-semibold text-white tabular-nums">
                {it.count}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
