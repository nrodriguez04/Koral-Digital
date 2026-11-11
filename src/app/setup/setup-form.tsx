'use client';

import { useActionState } from 'react';
import { Alert } from '@/components/ui/primitives';
import { Field, Input, SubmitButton } from '@/components/ui/form';
import { claimSuperadmin } from './actions';

export function SetupForm() {
  const [state, action] = useActionState(claimSuperadmin, {});
  return (
    <form action={action} className="space-y-4">
      {state.error ? <Alert tone="error">{state.error}</Alert> : null}
      <Field
        label="Setup token"
        htmlFor="token"
        required
        hint="The SETUP_TOKEN value from your deployment environment."
      >
        <Input id="token" name="token" type="password" autoComplete="off" required />
      </Field>
      <SubmitButton className="w-full" size="lg" pendingText="Verifying…">
        Become the first administrator
      </SubmitButton>
    </form>
  );
}
