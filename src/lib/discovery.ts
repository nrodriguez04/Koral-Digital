export const DISCOVERY_QUESTIONS = [
  {
    key: 'lead_sources',
    label: 'Lead sources',
    prompt:
      'Where do inquiries come from today? (web forms, calls, ads, referrals, marketplaces, canvassing)',
  },
  {
    key: 'monthly_volume',
    label: 'Volume',
    prompt: 'Roughly how many new inquiries per month, and how seasonal is it?',
  },
  {
    key: 'response_process',
    label: 'First response',
    prompt: 'Who responds to a new inquiry, by what channel, and how quickly in practice?',
  },
  {
    key: 'after_hours',
    label: 'After hours & missed calls',
    prompt: 'What happens to calls and forms after hours, on weekends, or while the team is on jobs?',
  },
  {
    key: 'tool_stack',
    label: 'Tool stack',
    prompt:
      'CRM / job management, phone system, calendar, estimating, accounting and marketing tools in use.',
  },
  {
    key: 'estimate_followup',
    label: 'Estimate follow-up',
    prompt: 'What happens after an estimate is sent? Who follows up, how often, and where is it tracked?',
  },
  {
    key: 'reporting',
    label: 'Reporting & attribution',
    prompt: 'How do they know which marketing produces signed jobs today? What reports exist?',
  },
  {
    key: 'pain_points',
    label: 'Pain & trigger',
    prompt: 'Biggest frustration, and what prompted this conversation now?',
  },
  {
    key: 'success_criteria',
    label: 'Success criteria',
    prompt: 'What would make a pilot an obvious success in 30–60 days? Agree measurable acceptance tests.',
  },
  {
    key: 'decision',
    label: 'Decision process',
    prompt: 'Who decides, budget expectations, timeline, and any procurement steps.',
  },
  {
    key: 'access',
    label: 'Access needed',
    prompt: 'Which systems will Koral need access to, and who can grant it?',
  },
  {
    key: 'consent',
    label: 'Consent & compliance',
    prompt: 'Current consent practices for SMS/email; any legal or brand constraints on outreach.',
  },
] as const;

export type DiscoveryKey = (typeof DISCOVERY_QUESTIONS)[number]['key'];
