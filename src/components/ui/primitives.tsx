import type { ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

type Tone = 'neutral' | 'ocean' | 'green' | 'amber' | 'red' | 'violet' | 'navy';

const tones: Record<Tone, string> = {
  neutral: 'bg-ink/[0.06] text-ink/75 ring-ink/10',
  ocean: 'bg-ocean-50 text-ocean-700 ring-ocean-500/20',
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  amber: 'bg-amber-50 text-amber-800 ring-amber-600/25',
  red: 'bg-red-50 text-red-700 ring-red-600/20',
  violet: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
  navy: 'bg-ocean-900 text-white ring-ocean-900',
};

export function Badge({
  tone = 'neutral',
  children,
  className,
}: {
  tone?: Tone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ring-1 ring-inset',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('card', className)}>{children}</div>;
}

export function CardHeader({
  title,
  description,
  action,
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="border-ink/8 flex items-start justify-between gap-4 border-b px-5 py-4">
      <div className="min-w-0">
        <h2 className="text-ink text-base font-semibold">{title}</h2>
        {description ? <p className="text-ink/60 mt-0.5 text-sm">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

const alertStyles = {
  info: { cls: 'border-ocean-500/25 bg-ocean-50 text-ocean-900', Icon: Info },
  success: { cls: 'border-emerald-600/25 bg-emerald-50 text-emerald-900', Icon: CheckCircle2 },
  warning: { cls: 'border-amber-500/30 bg-amber-50 text-amber-900', Icon: AlertTriangle },
  error: { cls: 'border-red-500/30 bg-red-50 text-red-900', Icon: XCircle },
};

export function Alert({
  tone = 'info',
  title,
  children,
  className,
}: {
  tone?: keyof typeof alertStyles;
  title?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  const { cls, Icon } = alertStyles[tone];
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn('flex gap-3 rounded-xl border px-4 py-3 text-sm', cls, className)}
    >
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <div className="min-w-0 space-y-1">
        {title ? <p className="font-semibold">{title}</p> : null}
        {children ? <div className="leading-relaxed opacity-90">{children}</div> : null}
      </div>
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  children,
  action,
  className,
}: {
  icon?: ReactNode;
  title: ReactNode;
  children?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center px-6 py-12 text-center', className)}>
      {icon ? <div className="bg-ocean-50 text-ocean-600 mb-3 rounded-2xl p-3">{icon}</div> : null}
      <p className="text-ink font-semibold">{title}</p>
      {children ? <div className="text-ink/60 mt-1 max-w-md text-sm">{children}</div> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function PageHeader({
  title,
  description,
  actions,
  eyebrow,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  eyebrow?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow ? <div className="text-ink/55 mb-1 text-sm">{eyebrow}</div> : null}
        <h1 className="text-ink text-2xl font-semibold tracking-tight">{title}</h1>
        {description ? <p className="text-ink/60 mt-1 max-w-3xl text-sm">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function Stat({
  label,
  value,
  hint,
  href,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  href?: string;
}) {
  const inner = (
    <>
      <p className="text-ink/60 text-sm">{label}</p>
      <p className="text-ink mt-1 text-2xl font-semibold tracking-tight tabular-nums">{value}</p>
      {hint ? <p className="text-ink/50 mt-1 text-xs">{hint}</p> : null}
    </>
  );
  return href ? (
    <a
      href={href}
      className="card hover:border-ocean-500/40 block p-4 transition hover:shadow-[var(--shadow-lift)]"
    >
      {inner}
    </a>
  ) : (
    <div className="card p-4">{inner}</div>
  );
}

export function DefinitionList({ items }: { items: { label: string; value: ReactNode }[] }) {
  return (
    <dl className="divide-ink/8 divide-y">
      {items.map((it) => (
        <div key={it.label} className="grid grid-cols-3 gap-3 px-5 py-2.5 text-sm">
          <dt className="text-ink/55">{it.label}</dt>
          <dd className="text-ink col-span-2 break-words">{it.value ?? '—'}</dd>
        </div>
      ))}
    </dl>
  );
}

export function Table({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full min-w-[640px] text-left text-sm">{children}</table>
    </div>
  );
}

export function Th({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <th
      scope="col"
      className={cn(
        'border-ink/8 bg-ink/[0.02] text-ink/55 border-b px-4 py-2.5 text-xs font-semibold tracking-wide uppercase',
        className,
      )}
    >
      {children}
    </th>
  );
}

export function Td({ children, className }: { children?: ReactNode; className?: string }) {
  return <td className={cn('border-ink/6 border-b px-4 py-3 align-top', className)}>{children}</td>;
}
