'use client';

import { useActionState, useEffect, useRef, useState, type ReactNode } from 'react';
import type { ActionResult } from '@/lib/auth/guards';
import { Alert } from '@/components/ui/primitives';
import { SubmitButton } from '@/components/ui/form';
import { cn } from '@/lib/utils';

export type FormAction = (prev: ActionResult<unknown>, formData: FormData) => Promise<ActionResult<unknown>>;

const initial: ActionResult<unknown> = { ok: true };

/**
 * Generic progressive-enhancement form for server actions with inline error and
 * success feedback. Field errors are exposed via `data-error` on a wrapper so
 * individual fields can render them through <FieldError name="..." />.
 */
export function ActionForm({
  action,
  children,
  submitLabel = 'Save',
  pendingText = 'Saving…',
  className,
  resetOnSuccess = false,
  submitVariant = 'primary',
  submitSize = 'md',
  hideSubmit = false,
  confirm,
  inline = false,
}: {
  action: FormAction;
  children?: ReactNode;
  submitLabel?: ReactNode;
  pendingText?: string;
  className?: string;
  resetOnSuccess?: boolean;
  submitVariant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  submitSize?: 'sm' | 'md' | 'lg';
  hideSubmit?: boolean;
  confirm?: string;
  inline?: boolean;
}) {
  const [state, formAction] = useActionState(action, initial);
  const ref = useRef<HTMLFormElement>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (submitted && state.ok && resetOnSuccess) ref.current?.reset();
  }, [state, resetOnSuccess, submitted]);

  return (
    <form
      ref={ref}
      action={(fd) => {
        setSubmitted(true);
        return formAction(fd);
      }}
      onSubmit={(e) => {
        if (confirm && !window.confirm(confirm)) e.preventDefault();
      }}
      className={cn(inline ? 'flex flex-wrap items-end gap-2' : 'space-y-4', className)}
    >
      {!state.ok ? (
        <div className={inline ? 'w-full' : undefined}>
          <Alert tone="error">
            {state.error}
            {state.fieldErrors ? (
              <ul className="mt-1 list-disc pl-4">
                {Object.entries(state.fieldErrors).map(([k, v]) =>
                  v?.length ? <li key={k}>{`${k}: ${v[0]}`}</li> : null,
                )}
              </ul>
            ) : null}
          </Alert>
        </div>
      ) : submitted && state.message ? (
        <div className={inline ? 'w-full' : undefined}>
          <Alert tone="success">{state.message}</Alert>
        </div>
      ) : null}
      {children}
      {hideSubmit ? null : (
        <div className={inline ? undefined : 'flex justify-end'}>
          <SubmitButton variant={submitVariant} size={submitSize} pendingText={pendingText}>
            {submitLabel}
          </SubmitButton>
        </div>
      )}
    </form>
  );
}
