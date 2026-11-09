import type { LeadStage } from '@/db/schema';

type Tone = 'neutral' | 'ocean' | 'green' | 'amber' | 'red' | 'violet' | 'navy';

export const LEAD_STAGES: { value: LeadStage; label: string; tone: Tone }[] = [
  { value: 'new', label: 'New', tone: 'ocean' },
  { value: 'contacted', label: 'Contacted', tone: 'violet' },
  { value: 'qualified', label: 'Qualified', tone: 'violet' },
  { value: 'discovery', label: 'Discovery', tone: 'amber' },
  { value: 'proposal', label: 'Proposal', tone: 'amber' },
  { value: 'won', label: 'Won', tone: 'green' },
  { value: 'lost', label: 'Lost', tone: 'neutral' },
];
export const stageMeta = (s: string) => LEAD_STAGES.find((x) => x.value === s) ?? { value: s, label: s, tone: 'neutral' as Tone };

export const STATUS_TONES: Record<string, Tone> = {
  draft: 'neutral',
  sent: 'ocean',
  accepted: 'green',
  declined: 'red',
  expired: 'neutral',
  planning: 'violet',
  active: 'ocean',
  on_hold: 'amber',
  completed: 'green',
  cancelled: 'neutral',
  not_started: 'neutral',
  in_progress: 'ocean',
  blocked: 'red',
  done: 'green',
  open: 'ocean',
  waiting_on_client: 'amber',
  waiting_on_koral: 'violet',
  resolved: 'green',
  closed: 'neutral',
  partially_paid: 'amber',
  paid: 'green',
  void: 'neutral',
  onboarding: 'violet',
  paused: 'amber',
  churned: 'neutral',
  pending: 'amber',
  revoked: 'neutral',
  not_connected: 'neutral',
  access_requested: 'amber',
  connected: 'green',
  error: 'red',
  published: 'green',
  in_review: 'amber',
  archived: 'neutral',
  scheduled: 'ocean',
  no_show: 'red',
  low: 'neutral',
  normal: 'ocean',
  high: 'amber',
  urgent: 'red',
};

export const statusLabel = (s: string) => s.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase());
