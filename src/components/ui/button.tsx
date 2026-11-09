import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'inverse' | 'danger';
type Size = 'sm' | 'md' | 'lg';

const variants: Record<Variant, string> = {
  primary:
    'bg-ocean-500 text-white shadow-sm hover:bg-ocean-600 active:bg-ocean-700 focus-visible:outline-ocean-500 disabled:bg-ocean-500/50',
  secondary: 'bg-ink text-white hover:bg-ocean-900 active:bg-black disabled:bg-ink/40',
  outline:
    'border border-ink/15 bg-white text-ink hover:border-ink/30 hover:bg-ink/[0.03] disabled:text-ink/40',
  ghost: 'text-ink hover:bg-ink/5 disabled:text-ink/40',
  inverse: 'bg-white text-ocean-900 shadow-sm hover:bg-ocean-50 disabled:bg-white/60',
  danger: 'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-600/50',
};

const sizes: Record<Size, string> = {
  sm: 'h-8 px-3 text-sm gap-1.5 rounded-lg',
  md: 'h-10 px-4 text-sm gap-2 rounded-xl',
  lg: 'h-12 px-6 text-base gap-2 rounded-xl',
};

export function buttonClasses({
  variant = 'primary',
  size = 'md',
  className,
}: { variant?: Variant; size?: Size; className?: string } = {}) {
  return cn(
    'inline-flex shrink-0 items-center justify-center font-semibold whitespace-nowrap transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed',
    variants[variant],
    sizes[size],
    className,
  );
}

export function Button({
  variant,
  size,
  className,
  type = 'button',
  ...props
}: ComponentProps<'button'> & { variant?: Variant; size?: Size }) {
  return <button type={type} className={buttonClasses({ variant, size, className })} {...props} />;
}

export function ButtonLink({
  href,
  variant,
  size,
  className,
  children,
  ...props
}: Omit<ComponentProps<typeof Link>, 'className'> & {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} className={buttonClasses({ variant, size, className })} {...props}>
      {children}
    </Link>
  );
}
