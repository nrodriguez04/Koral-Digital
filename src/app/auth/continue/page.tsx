import { redirect } from 'next/navigation';
import { safeNext } from '@/lib/auth/redirects';
import { getActor } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

/** Post-authentication router: sends each user to the area their server-side roles allow. */
export default async function ContinuePage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  const actor = await getActor();
  if (!actor) redirect('/sign-in');
  const target = safeNext(next);
  if (target) {
    const isApp = target.startsWith('/app');
    const isPortal = target.startsWith('/portal');
    if ((isApp && actor.staffRole) || (isPortal && actor.memberships.length) || (!isApp && !isPortal))
      redirect(target);
  }
  if (actor.staffRole) redirect('/app');
  if (actor.memberships.length === 1) redirect(`/portal/${actor.memberships[0]!.orgSlug}`);
  if (actor.memberships.length > 1) redirect('/portal');
  redirect('/no-access');
}
