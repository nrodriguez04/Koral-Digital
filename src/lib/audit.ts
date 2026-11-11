import 'server-only';
import { getDb } from '@/db';
import { auditEvents } from '@/db/schema';
import { log } from './logger';

export type AuditInput = {
  actor: { id: string | null; label: string } | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  orgId?: string | null;
  /** Never put PII or secrets here — IDs, statuses and field names only. */
  metadata?: Record<string, unknown>;
};

export async function recordAudit(input: AuditInput) {
  try {
    await getDb()
      .insert(auditEvents)
      .values({
        actorId: input.actor?.id ?? null,
        actorLabel: input.actor?.label ?? 'system',
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId ?? null,
        orgId: input.orgId ?? null,
        metadata: input.metadata ?? {},
      });
  } catch (err) {
    // Audit failure must be visible in logs but must not break the user's action.
    log.error('audit.write_failed', { action: input.action, err });
  }
}
