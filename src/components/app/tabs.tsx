import Link from 'next/link';
import { cn } from '@/lib/utils';

export function Tabs({
  tabs,
  active,
  basePath,
}: {
  tabs: { key: string; label: string; count?: number }[];
  active: string;
  basePath: string;
}) {
  return (
    <nav aria-label="Sections" className="border-ink/10 mb-6 flex gap-1 overflow-x-auto border-b">
      {tabs.map((t) => (
        <Link
          key={t.key}
          href={`${basePath}?tab=${t.key}`}
          aria-current={active === t.key ? 'page' : undefined}
          className={cn(
            '-mb-px border-b-2 px-3 py-2.5 text-sm font-medium whitespace-nowrap transition',
            active === t.key ? 'border-ocean-500 text-ink' : 'text-ink/55 hover:text-ink border-transparent',
          )}
        >
          {t.label}
          {t.count ? (
            <span className="bg-ink/8 ml-1.5 rounded-full px-1.5 text-xs tabular-nums">{t.count}</span>
          ) : null}
        </Link>
      ))}
    </nav>
  );
}
