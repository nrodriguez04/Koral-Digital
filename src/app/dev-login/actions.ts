'use server';

import { and, eq, isNotNull } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getDb } from '@/db';
import { users } from '@/db/schema';
import { DEV_SESSION_COOKIE, signDevSession } from '@/lib/auth/dev-session';
import { safeNext } from '@/lib/auth/redirects';
import { isDevAuthMockEnabled } from '@/lib/env';

/** Development-only. Refuses to run unless the dev mock is enabled AND this is not a production build. */
export async function devSignIn(formData: FormData) {
  if (!isDevAuthMockEnabled()) throw new Error('Not available.');
  const userId = String(formData.get('userId') ?? '');
  const user = await getDb().query.users.findFirst({ where: and(eq(users.id, userId), isNotNull(users.devKey)) });
  if (!user) throw new Error('Unknown dev user.');
  (await cookies()).set(DEV_SESSION_COOKIE, signDevSession(user.id), {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    path: '/',
    maxAge: 60 * 60 * 8,
  });
  const next = safeNext(String(formData.get('next') ?? ''));
  redirect(`/auth/continue${next ? `?next=${encodeURIComponent(next)}` : ''}`);
}

export async function devSignOut() {
  (await cookies()).delete(DEV_SESSION_COOKIE);
  redirect('/');
}
