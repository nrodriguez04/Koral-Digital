'use server';

import { redirect } from 'next/navigation';
import { requireActor } from '@/lib/auth/guards';
import { acceptInvitationByToken } from '@/server/invitations';

export async function acceptInvitation(_prev: { error?: string }, formData: FormData): Promise<{ error?: string }> {
  const token = String(formData.get('token') ?? '');
  let actor;
  try {
    actor = await requireActor();
  } catch {
    redirect(`/sign-in?next=${encodeURIComponent(`/invite/${token}`)}`);
  }
  const result = await acceptInvitationByToken(actor, token);
  if (!result.ok) return { error: result.error };
  redirect(result.redirectTo);
}
