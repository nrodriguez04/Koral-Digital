import 'server-only';
import { and, eq, gt, isNull } from 'drizzle-orm';
import { getDb } from '@/db';
import { invitations, organizations, users, type MemberRole, type StaffRole } from '@/db/schema';
import { recordAudit } from '@/lib/audit';
import { acceptInvitationForUser, type Actor } from '@/lib/auth/session';
import { inviteToTenant } from '@/lib/auth/descope';
import { DESCOPE_STAFF_TENANT, MEMBER_ROLE_NAMES, STAFF_ROLE_NAMES } from '@/lib/auth/descope-roles';
import { randomToken, sha256 } from '@/lib/crypto';
import { isDevAuthMockEnabled, siteUrl } from '@/lib/env';
import { auditActor } from '@/lib/auth/guards';
import { ensureOrgTenant } from './access';

const INVITE_TTL_DAYS = 7;

export type CreatedInvitation = {
  ok: true;
  id: string;
  /** Raw link — shown once to the inviter for manual delivery; never stored. */
  link: string;
  delivery: 'descope_email' | 'manual_link';
  deliveryNote?: string;
};

/**
 * Grants the role in Descope (which emails the person a sign-in link) and records the invitation.
 * Without Descope the role cannot be granted, so this fails, except for local development, where
 * the single-use link grants it in the database on acceptance.
 */
export async function createInvitation(
  inviter: Actor,
  input: {
    email: string;
    orgId: string | null;
    memberRole?: MemberRole;
    staffRole?: StaffRole;
    name?: string | null;
  },
): Promise<CreatedInvitation | { ok: false; error: string }> {
  const db = getDb();
  const email = input.email.trim().toLowerCase();
  const token = randomToken(32);
  const link = `${siteUrl()}/invite/${token}`;
  const expiresAt = new Date(Date.now() + INVITE_TTL_DAYS * 86_400_000);
  const memberRole = input.memberRole ?? 'client_member';

  let tenantId = DESCOPE_STAFF_TENANT;
  if (input.orgId) {
    const org = await db.query.organizations.findFirst({ where: eq(organizations.id, input.orgId) });
    if (!org) return { ok: false, error: 'Client not found.' };
    const tenant = await ensureOrgTenant(org);
    if (tenant.ok) tenantId = tenant.tenantId;
    else if (!isDevAuthMockEnabled()) return { ok: false, error: `Descope: ${tenant.reason}` };
  }
  const descope = await inviteToTenant({
    email,
    name: input.name,
    inviteUrl: link,
    tenantId,
    roleName: input.orgId ? MEMBER_ROLE_NAMES[memberRole] : STAFF_ROLE_NAMES[input.staffRole ?? 'contractor'],
  });
  if (!descope.ok && !isDevAuthMockEnabled()) return { ok: false, error: `Descope: ${descope.reason}` };

  // Revoke older pending invitations for the same target to keep one valid link.
  await db
    .update(invitations)
    .set({ status: 'revoked' })
    .where(
      and(
        eq(invitations.email, email),
        eq(invitations.status, 'pending'),
        input.orgId ? eq(invitations.orgId, input.orgId) : isNull(invitations.orgId),
      ),
    );

  const delivery = descope.ok && descope.emailed ? 'descope_email' : 'manual_link';
  const [row] = await db
    .insert(invitations)
    .values({
      orgId: input.orgId,
      email,
      memberRole: input.orgId ? memberRole : null,
      staffRole: input.orgId ? null : (input.staffRole ?? null),
      tokenHash: sha256(token),
      descopeUserId: descope.ok ? descope.descopeUserId : null,
      delivery,
      expiresAt,
      invitedById: inviter.user.id,
    })
    .returning({ id: invitations.id });

  await recordAudit({
    actor: auditActor(inviter),
    action: 'invitation.created',
    entityType: 'invitation',
    entityId: row!.id,
    orgId: input.orgId,
    metadata: {
      memberRole: input.orgId ? memberRole : null,
      staffRole: input.staffRole ?? null,
      delivery,
      grantedInDescope: descope.ok,
    },
  });

  return {
    ok: true,
    id: row!.id,
    link,
    delivery,
    deliveryNote: !descope.ok
      ? descope.reason
      : descope.emailed
        ? undefined
        : 'They already have a Koral sign-in, so Descope sent no email. The access is active now.',
  };
}

export async function findInvitationByToken(token: string) {
  if (!/^[A-Za-z0-9_-]{20,100}$/.test(token)) return null;
  const db = getDb();
  const inv = await db.query.invitations.findFirst({ where: eq(invitations.tokenHash, sha256(token)) });
  if (!inv) return null;
  const org = inv.orgId
    ? await db.query.organizations.findFirst({ where: eq(organizations.id, inv.orgId) })
    : null;
  const usable = inv.status === 'pending' && inv.expiresAt > new Date();
  return { inv, org, usable };
}

export type AcceptResult = { ok: true; redirectTo: string } | { ok: false; error: string };

/**
 * Token-link acceptance. Rules:
 *  - token must be pending and unexpired (single use, 7-day TTL)
 *  - if Descope has verified the user's email, it must match the invitation email
 *  - STAFF invitations additionally REQUIRE a verified, matching email
 * Accepting records the invitation as used; the role itself was granted in Descope when it was sent.
 */
export async function acceptInvitationByToken(actor: Actor, token: string): Promise<AcceptResult> {
  const found = await findInvitationByToken(token);
  if (!found || !found.usable)
    return { ok: false, error: 'This invitation is invalid, expired or already used.' };
  const { inv, org } = found;
  const user = actor.user;
  const emailKnown = Boolean(user.email && user.emailVerified);
  if (emailKnown && user.email !== inv.email) {
    return {
      ok: false,
      error: `This invitation was sent to a different email address. Sign in as ${maskEmail(inv.email)}.`,
    };
  }
  if (inv.staffRole && !emailKnown && actor.authMethod !== 'dev-mock') {
    return {
      ok: false,
      error:
        'Staff invitations require a verified email address. Sign in with the email address the invitation was sent to.',
    };
  }
  if (inv.descopeUserId && user.descopeUserId && inv.descopeUserId !== user.descopeUserId) {
    return {
      ok: false,
      error: `This invitation belongs to a different account. Sign in as ${maskEmail(inv.email)}.`,
    };
  }
  // Descope granted the role to the invited identity when the invitation was sent.
  await acceptInvitationForUser(inv, user, 'token_link', { grantLocally: actor.authMethod === 'dev-mock' });
  if (!user.email)
    await getDb()
      .update(users)
      .set({ email: inv.email })
      .where(and(eq(users.id, user.id)));
  return { ok: true, redirectTo: org ? `/portal/${org.slug}` : '/app' };
}

export function maskEmail(email: string) {
  const [local, domain] = email.split('@');
  if (!local || !domain) return 'the invited address';
  return `${local.slice(0, 2)}${'•'.repeat(Math.max(1, local.length - 2))}@${domain}`;
}

export async function pendingInvitationsForOrg(orgId: string) {
  return getDb()
    .select()
    .from(invitations)
    .where(
      and(
        eq(invitations.orgId, orgId),
        eq(invitations.status, 'pending'),
        gt(invitations.expiresAt, new Date()),
      ),
    );
}
