export type TemplateMilestone = { title: string; description: string; offsetDays: number };
export type TemplateTask = { title: string; description: string; clientVisible: boolean; offsetDays: number };

export const PROJECT_TEMPLATES = {
  'lead-to-booked': {
    name: 'Lead-to-Booked pilot (14 days)',
    milestones: [
      { title: 'Discovery & baseline', description: 'Confirm scope, lead sources, routing rules and baseline measurements.', offsetDays: 2 },
      { title: 'Access granted', description: 'All required system access confirmed and tested.', offsetDays: 3 },
      { title: 'Current-flow audit', description: 'Document how inquiries move today; agree acceptance tests.', offsetDays: 4 },
      { title: 'Capture, de-duplication & routing configured', description: 'Inbound sources captured into the CRM with routing and alerts.', offsetDays: 8 },
      { title: 'Response drafts & scheduling handoff', description: 'Human-approved reply templates and booking handoff in place.', offsetDays: 10 },
      { title: 'Testing', description: 'Scenario tests run against acceptance criteria; issues fixed.', offsetDays: 12 },
      { title: 'Launch', description: 'Workflows switched on; team trained.', offsetDays: 13 },
      { title: 'Handoff & reporting', description: 'Documentation delivered; first report reviewed against baseline.', offsetDays: 14 },
    ],
    tasks: [
      { title: 'Grant CRM administrator (or integration) access', description: 'Invite Koral Digital as a user or create an API key with the scopes we list.', clientVisible: true, offsetDays: 2 },
      { title: 'Share website form / landing page access', description: 'Access to the site builder or form tool that captures inquiries.', clientVisible: true, offsetDays: 2 },
      { title: 'Confirm who should receive new-lead alerts', description: 'Names, roles and preferred alert channel for each person.', clientVisible: true, offsetDays: 3 },
      { title: 'Approve response templates', description: 'Review the draft first-response messages before launch.', clientVisible: true, offsetDays: 9 },
      { title: 'Record baseline metrics', description: 'Speed to first response, booked rate and source mix for the last 30–90 days.', clientVisible: false, offsetDays: 3 },
    ],
  },
  implementation: {
    name: 'Standard implementation',
    milestones: [
      { title: 'Discovery', description: 'Goals, scope and acceptance tests confirmed.', offsetDays: 5 },
      { title: 'Access', description: 'All system access in place.', offsetDays: 7 },
      { title: 'Audit', description: 'Current state documented.', offsetDays: 12 },
      { title: 'Configure', description: 'Build and configuration complete.', offsetDays: 25 },
      { title: 'Test', description: 'Acceptance tests passed.', offsetDays: 30 },
      { title: 'Launch', description: 'Live and team trained.', offsetDays: 32 },
      { title: 'Handoff', description: 'Documentation and support plan delivered.', offsetDays: 35 },
    ],
    tasks: [
      { title: 'Grant system access', description: 'Provide the access listed in the project kickoff notes.', clientVisible: true, offsetDays: 5 },
      { title: 'Nominate a day-to-day contact', description: 'Who should we ask quick questions?', clientVisible: true, offsetDays: 3 },
    ],
  },
  blank: { name: 'Blank project', milestones: [] as TemplateMilestone[], tasks: [] as TemplateTask[] },
} as const satisfies Record<string, { name: string; milestones: readonly TemplateMilestone[]; tasks: readonly TemplateTask[] }>;

export type ProjectTemplateKey = keyof typeof PROJECT_TEMPLATES;
