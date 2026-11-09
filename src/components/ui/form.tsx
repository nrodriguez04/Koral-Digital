'use client';

import { useFormStatus } from 'react-dom';
import type { ComponentProps, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';

const control =
  'block w-full rounded-xl border border-ink/15 bg-white px-3.5 py-2.5 text-sm text-ink shadow-sm placeholder:text-ink/40 transition focus:border-ocean-500 focus:ring-4 focus:ring-ocean-500/15 focus:outline-none disabled:bg-ink/5 aria-[invalid=true]:border-red-500 aria-[invalid=true]:focus:ring-red-500/15';

export function Input({ className, ...props }: ComponentProps<'input'>) {
  return <input className={cn(control, 'h-11', className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<'textarea'>) {
  return <textarea className={cn(control, 'min-h-28', className)} {...props} />;
}

export function Select({ className, children, ...props }: ComponentProps<'select'>) {
  return (
    <select className={cn(control, 'h-11 pr-9', className)} {...props}>
      {children}
    </select>
  );
}

export function Field({
  label,
  htmlFor,
  error,
  hint,
  required,
  children,
  className,
}: {
  label: ReactNode;
  htmlFor: string;
  error?: string[] | string;
  hint?: ReactNode;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  const message = Array.isArray(error) ? error[0] : error;
  return (
    <div className={cn('space-y-1.5', className)}>
      <label htmlFor={htmlFor} className="text-ink block text-sm font-medium">
        {label}
        {required ? (
          <span className="text-ocean-600" aria-hidden="true">
            {' '}
            *
          </span>
        ) : (
          <span className="text-ink/50 font-normal"> (optional)</span>
        )}
      </label>
      {children}
      {hint && !message ? <p className="text-ink/55 text-xs">{hint}</p> : null}
      {message ? (
        <p id={`${htmlFor}-error`} className="text-xs font-medium text-red-600" role="alert">
          {message}
        </p>
      ) : null}
    </div>
  );
}

export function Checkbox({ label, className, ...props }: ComponentProps<'input'> & { label: ReactNode }) {
  return (
    <label className={cn('text-ink/80 flex cursor-pointer items-start gap-3 text-sm', className)}>
      <input
        type="checkbox"
        className="border-ink/30 text-ocean-600 accent-ocean-600 focus-visible:outline-ocean-500 mt-0.5 size-4 shrink-0 rounded focus-visible:outline-2"
        {...props}
      />
      <span>{label}</span>
    </label>
  );
}

export function SubmitButton({
  children,
  pendingText = 'Saving…',
  ...props
}: ComponentProps<typeof Button> & { pendingText?: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending || props.disabled} aria-busy={pending} {...props}>
      {pending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
      {pending ? pendingText : children}
    </Button>
  );
}
