import {
  BarChart3,
  CalendarCheck,
  ClipboardCheck,
  Database,
  Droplets,
  Globe,
  Hammer,
  Home,
  LineChart,
  PhoneMissed,
  Repeat,
  ShieldCheck,
  Users,
  Workflow,
  Wrench,
  Zap,
  type LucideProps,
} from 'lucide-react';
import type { IconName } from '@/content/types';

const map = {
  zap: Zap,
  database: Database,
  repeat: Repeat,
  workflow: Workflow,
  'bar-chart': BarChart3,
  'shield-check': ShieldCheck,
  globe: Globe,
  home: Home,
  hammer: Hammer,
  wrench: Wrench,
  droplets: Droplets,
  'phone-missed': PhoneMissed,
  'calendar-check': CalendarCheck,
  users: Users,
  'clipboard-check': ClipboardCheck,
  'line-chart': LineChart,
} satisfies Record<IconName, unknown>;

export function ContentIcon({ name, ...props }: { name: IconName } & LucideProps) {
  const Cmp = map[name] ?? Zap;
  return <Cmp aria-hidden="true" {...props} />;
}
