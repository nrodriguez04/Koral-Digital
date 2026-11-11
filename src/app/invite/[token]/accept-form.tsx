'use client';

import { useActionState } from 'react';
import { Alert } from '@/components/ui/primitives';
import { SubmitButton } from '@/components/ui/form';
import { acceptInvitation } from './actions';

export function AcceptForm({ token }: { token: string }) {
  const [state, action] = useActionState(acceptInvitation, {});
  return (
    <form action={action} className="space-y-4">
      {state.error ? <Alert tone="error">{state.error}</Alert> : null}
      <input type="hidden" name="token" value={token} />
      <SubmitButton size="lg" className="w-full" pendingText="Accepting…">
        Accept invitation
      </SubmitButton>
    </form>
  );
}
