import { Badge } from '@/components/ui/primitives';
import { STATUS_TONES, stageMeta, statusLabel } from '@/lib/labels';

export function StatusBadge({ status }: { status: string }) {
  return <Badge tone={STATUS_TONES[status] ?? 'neutral'}>{statusLabel(status)}</Badge>;
}

export function StageBadge({ stage }: { stage: string }) {
  const m = stageMeta(stage);
  return <Badge tone={m.tone}>{m.label}</Badge>;
}
