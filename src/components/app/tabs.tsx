import Link from 'next/link';
import { cn } from '@/lib/utils';

export function Tabs({ tabs, active, basePath }: { tabs: { key: string; label: string; count?: number }[]; active: string; basePath: string }) {
  return (
    <nav aria-label="Sections" className="mb-6 flex gap-1 overflow-x-auto border-b border-ink/10">
      {tabs.map((t) => (
        <Link
          key={t.key}
          href={`${basePath}?tab=${t.key}`}
          aria-current={active === t.key ? 'page' : undefined}
          className={cn(
            '-mb-px border-b-2 px-3 py-2.5 text-sm font-medium whitespace-nowrap transition',
            active === t.key ? 'border-ocean-500 text-ink' : 'border-transparent text-ink/55 hover:text-ink',
          )}
        >
          {t.label}
          {t.count ? <span className="ml-1.5 rounded-full bg-ink/8 px-1.5 text-xs tabular-nums">{t.count}</span> : null}
        </Link>
      ))}
    </nav>
  );
}
