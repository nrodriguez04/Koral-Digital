import type { IndustryContent } from './types';

/**
 * Industry pages under /industries/[slug].
 *
 * Each trade gets its own leak points, approach and metric definitions. Keep them distinct;
 * do not copy paragraphs between trades with the nouns swapped.
 * Metrics are definitions to track, never benchmarks or promised results.
 * Example scenarios are illustrative and their titles start with "Example:".
 * Common tools are software seen in each trade, not partnerships or guaranteed integrations.
 */
export const industries: IndustryContent[] = [
  {
    slug: 'roofing',
    name: 'Roofing',
    icon: 'home',
    metaTitle: 'Roofing CRM Integrations & Lead Follow-Up',
    metaDescription:
      'Lead response, CRM integrations and estimate follow-up for roofing contractors handling storm surges, insurance claims, inspections and retail jobs.',
    headline: 'Lead response and CRM operations for roofing contractors',
    intro:
      "Roofing lead flow is uneven by nature: quiet for weeks, then a hailstorm rolls through and the phones, web forms and door-knock sheets fill up at once. Insurance work then moves on the carrier's and adjuster's schedule, not yours. We help roofers keep every inspection request, claim and estimate moving in the CRM they already use, whether that is JobNimbus, AccuLynx, Roofr or something else.",
    challenges: [
      {
        title: 'Storm surges overwhelm intake',
        body: 'After a hail or wind event, inspection requests arrive faster than the office can answer them. Leads get written on notepads, duplicate each other across forms and calls, or wait days for a callback while other crews are already knocking in the same neighborhood.',
      },
      {
        title: 'Insurance jobs stall between steps',
        body: 'Claim filed, adjuster meeting set, scope approved, supplement submitted, depreciation released: each step depends on someone outside your company. Without a dated next step on every file, claims go quiet for weeks before anyone notices.',
      },
      {
        title: 'Retail and insurance work tracked as one pipeline',
        body: 'A cash-pay replacement and an insurance claim follow different paths with different decision-makers. Forcing both through the same stages makes pipeline reports meaningless and hides where each kind of job actually gets stuck.',
      },
      {
        title: 'Canvassing and inbound leads never meet',
        body: 'Door-knocking apps, yard signs, referrals and web leads often live in separate places. The same homeowner can be knocked, call the office and fill out a form, and end up as three records owned by three reps.',
      },
      {
        title: 'Inspections that never become estimates',
        body: 'The inspection gets done and the photos get taken, but the estimate or the claim conversation never happens, especially when the person who inspects is not the person who sells.',
      },
    ],
    approach: [
      {
        title: 'Storm-ready intake',
        body: 'Forms, calls, Google Business Profile messages and canvassing leads flow into one intake path with duplicate checks on phone, email and property address. Routing rules, such as by ZIP or postal code or rep capacity, can be adjusted quickly when a storm hits.',
      },
      {
        title: 'Separate retail and insurance pipelines',
        body: 'Distinct stages for each path, including insurance steps like claim filed, adjuster meeting, approval, supplement and depreciation release, each with an owner and a dated next action.',
      },
      {
        title: 'Inspection and adjuster scheduling handoffs',
        body: "Inspections and adjuster meetings land on the right rep's calendar with the property details attached, plus a task to update the file afterward.",
      },
      {
        title: 'Human-approved follow-up',
        body: 'Reply drafts and follow-up sequences for inspection requests and open estimates, reviewed by your team before sending, with consent and opt-outs tracked for any texting.',
      },
      {
        title: 'Source-to-contract reporting',
        body: 'Reports that separate canvassing, referrals, paid ads and storm campaigns, and follow each one through inspection, estimate and signed contract.',
      },
    ],
    metrics: [
      {
        name: 'Speed to first response',
        definition:
          'Time from the inquiry timestamp (form submission, call or message) to the first human or approved reply, reported separately for business hours and after hours.',
      },
      {
        name: 'Inspection booking rate',
        definition:
          'Inspection requests that reach a scheduled inspection, divided by all new inspection requests in the same period, by lead source.',
      },
      {
        name: 'Inspection-to-estimate rate',
        definition:
          'Completed inspections that result in an issued retail estimate or a filed insurance claim, divided by all completed inspections, split by retail and insurance.',
      },
      {
        name: 'Claim cycle time',
        definition:
          'Days from claim filed to carrier approval of the scope for each insurance job, with files showing no recorded activity flagged for review.',
      },
      {
        name: 'Open estimate age',
        definition:
          'Days since each unsigned estimate was issued, so estimates without a dated next step are caught before they go cold.',
      },
      {
        name: 'Close rate by source',
        definition:
          'Signed contracts divided by issued estimates for each lead source over the same period, with retail and insurance reported separately.',
      },
    ],
    commonTools: [
      'JobNimbus',
      'AccuLynx',
      'Roofr',
      'CompanyCam',
      'EagleView',
      'Hover',
      'Xactimate',
      'SalesRabbit',
      'CallRail',
      'Google Business Profile',
      'HighLevel',
      'QuickBooks',
    ],
    exampleScenario: {
      title: 'Example: inspection requests the morning after a hailstorm',
      body: 'A hailstorm moves through the area overnight. By morning, inspection requests are arriving through the website, Google Business Profile and the main phone line, while canvassers log doors in their app. Each inquiry is checked against existing records by phone and property address, so a homeowner who called and also filled out the form becomes one lead, not two. Requests are routed by ZIP code to the rep covering that area, and each rep sees a reply draft offering inspection windows to review and send. Booked inspections land on rep calendars with the address attached. After each inspection, the job moves into the retail or insurance pipeline with a dated next step, and by end of day the owner can see how many requests came in, how many have been answered and how many are scheduled.',
    },
    faqs: [
      {
        q: 'Which roofing CRMs do you work with?',
        a: "We commonly work with roofing platforms such as JobNimbus, AccuLynx and Roofr, as well as general CRMs like HubSpot and HighLevel. We are vendor-neutral and not a certified partner of any of them. What can be automated depends on each platform's API access and your subscription plan, which we confirm before quoting.",
      },
      {
        q: 'Can you set up separate pipelines for insurance and retail roofing jobs?',
        a: 'Yes, and we usually recommend it. Insurance jobs need stages such as claim filed, adjuster meeting, approval, supplement and depreciation release, while retail jobs move more directly from inspection to estimate to contract. Separate pipelines make it clear where each type of job is stuck and who owns the next step.',
      },
      {
        q: 'How do you handle the lead surge after a storm?',
        a: 'We set up intake so every form, call and message is captured with duplicate checks, and routing rules that can be changed quickly, for example by ZIP or postal code or by rep. Reply drafts let your team respond to a high volume of requests consistently, and a simple view shows what is still unanswered. People still approve every message and confirm every inspection.',
      },
      {
        q: 'Can canvassing leads go into the same CRM as inbound leads?',
        a: 'Usually, depending on what your canvassing app can export or integrate with. Bringing them together means a homeowner who was knocked and later called in is one record with one owner. It also lets you compare canvassing to other sources all the way through to signed contract.',
      },
    ],
    services: ['lead-to-booked', 'crm-implementation', 'estimate-follow-up', 'revenue-attribution'],
  },
  {
    slug: 'remodeling-construction',
    name: 'Remodeling & Construction',
    icon: 'hammer',
    metaTitle: 'Remodeling & Construction Lead Follow-Up and CRM',
    metaDescription:
      'CRM, follow-up and handoff workflows for remodelers and builders with long sales cycles, design consultations, financing questions and change orders.',
    headline: 'Systems for remodelers and builders with long sales cycles',
    intro:
      "A kitchen, addition or whole-home remodel can take months to go from first call to signed contract, with design consultations, revisions, selections and financing conversations along the way. Then the harder part begins: keeping scope, change orders and the client's expectations aligned once the job is in production. We help remodelers and construction companies keep long-cycle prospects engaged and hand off cleanly from sales to production, using the tools already in place.",
    challenges: [
      {
        title: 'Long consideration cycles go cold',
        body: 'Homeowners can take months to commit to a major remodel. Without a planned way to stay in touch, an early inquiry gets a quick first response and then silence, and by the time the homeowner is ready they no longer remember who they talked to.',
      },
      {
        title: 'Design consultations booked without qualification',
        body: "A design consultation takes hours of a senior person's time. When budget range, timeline and scope are not clarified at intake, those hours go to projects that were never a fit.",
      },
      {
        title: 'Financing questions stall decisions',
        body: 'Many homeowners need to understand their financing options before they commit, but that conversation often happens late, informally or not at all, and the proposal sits open while they figure it out.',
      },
      {
        title: 'Sales-to-production handoff loses details',
        body: "Selections, allowances, scope notes and promises made during the sale live in a salesperson's head or inbox. Production starts without them, and the client hears different answers from different people.",
      },
      {
        title: 'Change orders handled informally',
        body: 'Changes agreed on site by text or in conversation are not written up, priced and approved the same way every time, which leads to disputes, eroded margins and uncomfortable final invoices.',
      },
    ],
    approach: [
      {
        title: 'Qualified intake before the consultation',
        body: 'Intake questions for project type, budget range, timeline and decision-makers are captured in the CRM before a design consultation is booked, so senior time goes where it counts.',
      },
      {
        title: 'Long-cycle follow-up with human approval',
        body: 'Follow-up schedules matched to how long remodeling decisions really take, with check-ins your team approves, opt-out handling and clear rules for when a prospect is closed out.',
      },
      {
        title: 'Proposal and financing follow-up',
        body: 'Every open proposal gets dated next steps, including a defined point to share financing information your office has approved, so financing is raised early rather than becoming a silent blocker.',
      },
      {
        title: 'Structured sales-to-production handoff',
        body: 'A standard handoff record carries scope, selections, allowances and customer commitments from the CRM into your project management tool, such as Buildertrend or JobTread.',
      },
      {
        title: 'Change order workflow',
        body: "A consistent path for documenting, pricing, approving and recording change orders, with a person setting every price and the customer's signed approval stored with the job.",
      },
    ],
    metrics: [
      {
        name: 'Inquiry-to-consultation rate',
        definition:
          'New inquiries that reach a booked design consultation, divided by all new inquiries in the same period, by source and project type.',
      },
      {
        name: 'Consultation-to-proposal rate',
        definition:
          'Completed design consultations that result in a delivered proposal or estimate, divided by all completed consultations.',
      },
      {
        name: 'Proposal age',
        definition:
          'Days since each open proposal was delivered without a signed contract or a recorded decision.',
      },
      {
        name: 'Sales cycle length',
        definition: 'Days from first inquiry to signed contract for won projects, measured by project type.',
      },
      {
        name: 'Change order documentation rate',
        definition:
          'Change orders that were written up, priced and approved by the customer before the work was done, divided by all change orders on completed projects.',
      },
      {
        name: 'Handoff completeness',
        definition:
          'Newly signed projects whose handoff record has scope, selections, allowances and customer commitments filled in before production kickoff, divided by all newly signed projects.',
      },
    ],
    commonTools: [
      'Buildertrend',
      'JobTread',
      'Houzz Pro',
      'Contractor Foreman',
      'HubSpot',
      'HighLevel',
      'CompanyCam',
      'CallRail',
      'Calendly',
      'Google Calendar',
      'QuickBooks',
    ],
    exampleScenario: {
      title: 'Example: from kitchen remodel inquiry to production handoff',
      body: 'A homeowner fills out a website form about a kitchen remodel. The form asks for budget range, timeline and whether both decision-makers can attend a consultation, and the answers land in the CRM. The office reviews the inquiry and sends an approved reply with a scheduling link, and the homeowner books a design consultation. After the proposal is delivered, the salesperson gets dated follow-up tasks, including a point to share the financing information the office has approved. When the homeowner signs, a handoff record with scope, selections and allowances is created in the project management tool, and the production manager is notified to schedule kickoff. Mid-project, the homeowner asks to upgrade the backsplash; the change order is written up, priced by the project manager and signed before the work is done.',
    },
    faqs: [
      {
        q: 'How do you keep long-cycle remodeling leads from going cold?',
        a: 'We set up follow-up schedules that match how long your projects actually take to decide, with useful reasons to check in rather than generic reminders. Each step is a task or a draft your team approves, opt-outs are honored, and prospects who are clearly not moving forward are closed out with a reason so the pipeline stays honest.',
      },
      {
        q: 'Can you connect our CRM to Buildertrend or JobTread?',
        a: 'It depends on the specific platforms, the API access each one offers and your plan. Where a direct integration is available we use it, and otherwise we may use a tool like Zapier, Make or n8n, or design a short, consistent manual handoff step. We confirm what is feasible before quoting.',
      },
      {
        q: 'Do you help with change order management?',
        a: "We help set up a consistent process in the tools you already use: documenting the change, pricing it, getting the customer's approval and recording it with the job. A person on your team sets every price and approves every change. The software only keeps steps from being skipped.",
      },
      {
        q: 'Do you work with general contractors and commercial builders?',
        a: 'Our focus is residential remodeling and home-service construction, where intake, follow-up and handoff problems show up most clearly. If you are a general or commercial contractor with a similar inquiry-to-contract process, we are glad to talk through whether we are a good fit.',
      },
    ],
    services: ['lead-to-booked', 'estimate-follow-up', 'crm-implementation', 'automation-integrations'],
  },
  {
    slug: 'property-maintenance',
    name: 'Property Maintenance',
    icon: 'wrench',
    metaTitle: 'Property Maintenance Work Orders & Dispatch',
    metaDescription:
      'Work order intake, dispatch support and SLA tracking for property maintenance companies serving property managers and HOAs, using your existing tools.',
    headline: 'Work order and dispatch operations for property maintenance companies',
    intro:
      'Property maintenance runs on recurring relationships, not one-off sales: property managers, HOAs and portfolio owners send a steady stream of work orders and expect fast, documented responses. The leaks are rarely about winning the first job; they are work orders lost in email, unclear dispatch, missed response windows and invoices that do not match what the client asked for. We help maintenance companies tighten that loop with their existing field-service and accounting tools.',
    challenges: [
      {
        title: 'Work orders arrive from everywhere',
        body: "Requests come in through property management portals, emails, calls to the office and texts to a technician's personal phone. Every property manager uses a different format, and some requests never make it into the dispatch system.",
      },
      {
        title: 'Dispatch depends on one person',
        body: 'Often a single dispatcher knows which tech covers which properties, who has the right skills and what is already on the board. When that person is out, work orders sit.',
      },
      {
        title: 'Service agreements are hard to prove',
        body: 'Property managers and HOAs often expect response and completion within agreed windows. Without timestamps at each step, you cannot show you met those commitments or spot the properties where you are slipping.',
      },
      {
        title: 'Documentation does not match the invoice',
        body: "Clients want photos, notes and approvals tied to each work order. When those live in a technician's camera roll, invoices go out late or get disputed.",
      },
      {
        title: 'Recurring and preventive work slips',
        body: 'Scheduled services, seasonal inspections and unit turns are easy to push aside when the board is full of urgent requests, and missed recurring work is what puts a contract renewal at risk.',
      },
    ],
    approach: [
      {
        title: 'Unified work order intake',
        body: 'Every request, whether a portal notification, email, call or text, becomes a work order in your field-service tool with the property, client, priority and requested window recorded. Where a portal offers no vendor API, we can often work from its notification emails.',
      },
      {
        title: 'Rules-based dispatch support',
        body: 'Assignment suggestions based on property, trade, priority and technician availability, with a dispatcher confirming each assignment and an escalation path when nobody accepts.',
      },
      {
        title: 'Service window tracking',
        body: 'Timestamps for received, acknowledged, scheduled, on site and completed, with an alert to the office before an agreed response or completion window is missed.',
      },
      {
        title: 'Required documentation at close-out',
        body: 'Photos, notes and approvals must be attached before a work order can be marked complete, so invoices go out with the backup clients ask for.',
      },
      {
        title: 'Client-ready reporting',
        body: 'Per-client or per-property summaries of open, completed and overdue work orders that you can share with property managers and HOA boards.',
      },
    ],
    metrics: [
      {
        name: 'Time to acknowledge',
        definition:
          'Time from when a work order is received to when the client gets a human or approved acknowledgment.',
      },
      {
        name: 'Time to dispatch',
        definition: 'Time from when a work order is received to when a technician is assigned and scheduled.',
      },
      {
        name: 'SLA adherence',
        definition:
          "Work orders acknowledged and completed within the windows agreed with that client, divided by all of that client's work orders in the period, based on recorded timestamps.",
      },
      {
        name: 'First-visit completion rate',
        definition:
          'Work orders completed on the first visit without a return trip for parts, access or approval, divided by all completed work orders.',
      },
      {
        name: 'Documentation completeness',
        definition:
          'Completed work orders with all required photos, notes and approvals attached at close-out, divided by all completed work orders.',
      },
      {
        name: 'Days to invoice',
        definition: 'Days from work order completion to the invoice being sent to the client.',
      },
    ],
    commonTools: [
      'Jobber',
      'Housecall Pro',
      'ServiceTitan',
      'AppFolio',
      'Buildium',
      'Yardi',
      'Property Meld',
      'ServiceChannel',
      'CompanyCam',
      'QuickBooks',
      'Twilio',
    ],
    exampleScenario: {
      title: 'Example: an HOA work order from request to invoice',
      body: 'A community manager for a homeowners association (HOA) emails a request about a gate at the community entrance that will not close. The email is turned into a work order in the field-service tool with the property, client and priority recorded, and the office sends an approved acknowledgment. Dispatch rules suggest the technician who covers that area and handles access-control repairs, and the dispatcher confirms the assignment. On site, the technician attaches before-and-after photos and notes and cannot mark the job complete until both are in. The work order record shows it was completed within the window agreed with that HOA, the invoice goes out with the photos attached, and at month end the community manager receives a summary of all work orders for the property.',
    },
    faqs: [
      {
        q: 'Can you pull work orders from property management portals?',
        a: 'It depends on the portal. Some offer vendor integrations or APIs, while many only send notification emails. Where there is no API, we can often turn those emails into work orders in your field-service tool, and we confirm what is feasible for each portal before quoting.',
      },
      {
        q: 'Do you replace our dispatcher?',
        a: 'No. We give your dispatcher better information and fewer manual steps: suggested assignments, visible priorities and alerts before a service window is missed. A person still confirms who goes where, especially for urgent or unusual jobs.',
      },
      {
        q: 'Can you help us show we are meeting our service agreements?',
        a: 'Yes, as long as each step is timestamped. We set up the work order stages and timestamps needed to measure response and completion against what you agreed with each client, then build reports you can share with property managers and HOA boards.',
      },
      {
        q: 'Which field-service tools do you work with?',
        a: "We commonly work with tools like Jobber, Housecall Pro and ServiceTitan, and can connect them to calendars, phone systems and QuickBooks where the vendors allow it. We are vendor-neutral and not a certified partner of any platform, and integration options depend on each vendor's API access and your plan.",
      },
    ],
    services: ['automation-integrations', 'managed-optimization', 'crm-implementation', 'lead-to-booked'],
  },
  {
    slug: 'restoration',
    name: 'Restoration',
    icon: 'droplets',
    metaTitle: 'Restoration Emergency Intake & Job Workflows',
    metaDescription:
      'Emergency intake, on-call escalation, TPA and carrier documentation, and mitigation-to-rebuild handoffs for water, fire and mold restoration companies.',
    headline: 'Emergency intake and job workflows for restoration companies',
    intro:
      "Restoration work starts with a phone call at the worst moment of someone's week, often at night or on a weekend, and the company that answers and responds quickly is often the one that gets the job. After that, the job depends on documentation: photos, moisture readings, drying logs and estimates that satisfy the carrier or third-party administrator. We help water, fire and mold restoration companies make emergency intake dependable around the clock and move jobs cleanly from mitigation to rebuild.",
    challenges: [
      {
        title: 'Missed after-hours emergency calls',
        body: 'Burst pipes and storm damage do not wait for business hours. A call that rolls to voicemail, or an answering service that cannot reach the on-call tech, is often a job that goes to the next company in the search results.',
      },
      {
        title: 'No defined on-call escalation',
        body: 'When the on-call person does not pick up, there is often no backup and no record of who was tried. Minutes turn into hours while the property owner keeps calling around.',
      },
      {
        title: 'Documentation gaps with carriers and TPAs',
        body: 'Missing photos, moisture readings or drying logs delay approvals and payment, and repeated gaps can strain a TPA program relationship. Rebuilding that documentation after the fact is slow and unreliable.',
      },
      {
        title: 'Mitigation-to-rebuild handoff falls apart',
        body: 'Many restoration companies handle both mitigation and reconstruction, but the rebuild opportunity is often lost when the mitigation file closes without a clear handoff to an estimator and a follow-up with the owner.',
      },
      {
        title: 'Referral sources go unmeasured',
        body: 'Plumbers, insurance agents, property managers and TPA programs all send work, but without consistent source tracking it is hard to see which relationships actually produce jobs and deserve more of your time.',
      },
    ],
    approach: [
      {
        title: 'Around-the-clock intake and escalation',
        body: 'Every emergency call, form and message is logged with a timestamp and routed to the on-call technician, with automatic escalation to a backup and then a manager if it is not acknowledged within the window you set.',
      },
      {
        title: 'Structured loss intake',
        body: 'Questions for loss type, source of loss, affected areas, insurance carrier, claim number and TPA program are captured at first contact, so the job file starts complete.',
      },
      {
        title: 'Documentation checklists by job stage',
        body: 'Required photos, moisture readings, drying logs and signed authorizations are tied to job stages in your job management system, with reminders before a file can move forward.',
      },
      {
        title: 'Mitigation-to-rebuild handoff',
        body: 'When mitigation wraps up, a rebuild opportunity is created with scope notes, photos and owner contact attached, and an estimator is assigned a dated follow-up.',
      },
      {
        title: 'Referral source tracking',
        body: 'Consistent source capture for plumbers, agents, property managers and TPA programs, with reporting through to completed and invoiced jobs.',
      },
    ],
    metrics: [
      {
        name: 'Speed to answer',
        definition:
          'Time from an inbound emergency call or message to a live human answer or callback, reported separately for business hours and after hours.',
      },
      {
        name: 'Time to on-site arrival',
        definition:
          "Time from first contact to the technician's recorded arrival at the property, for emergency mitigation jobs.",
      },
      {
        name: 'Escalation rate',
        definition:
          'Emergency inquiries not acknowledged by the first on-call person and escalated to a backup, divided by all emergency inquiries in the period.',
      },
      {
        name: 'File completeness at stage change',
        definition:
          'Jobs with all required photos, readings and authorizations attached when they move to the next stage, divided by all jobs that changed stage.',
      },
      {
        name: 'Mitigation-to-rebuild conversion',
        definition:
          'Completed mitigation jobs with rebuild scope that result in a signed reconstruction contract, divided by all completed mitigation jobs with rebuild scope.',
      },
      {
        name: 'Jobs by referral source',
        definition:
          'Count of completed jobs attributed to each referral source or TPA program over a period, traced from first contact through invoice.',
      },
    ],
    commonTools: [
      'Xactimate',
      'Encircle',
      'DASH',
      'Albi',
      'Magicplan',
      'CompanyCam',
      'CallRail',
      'Twilio',
      'Google Business Profile',
      'QuickBooks',
    ],
    exampleScenario: {
      title: 'Example: a 2 a.m. water loss call through to rebuild',
      body: "A homeowner calls at 2 a.m. about a burst supply line. The call rings through to the on-call technician; if it is missed, the technician and the operations manager both get an alert with the caller's number and voicemail, and a callback task is created. If nobody acknowledges it within the window the company set, the alert escalates to the backup technician. The technician calls back, and intake captures the loss source, affected rooms, carrier and claim number before the job is created in the job management system. On site, the job cannot advance to drying until initial photos, moisture readings and the signed work authorization are attached. When mitigation is complete, a rebuild opportunity is created with the scope notes and photos, and an estimator gets a dated task to contact the owner about reconstruction.",
    },
    faqs: [
      {
        q: 'How do you make sure emergency calls are answered after hours?',
        a: 'We set up routing so emergency calls, forms and messages reach the on-call person, with escalation to a backup and a manager if they are not acknowledged within the time you set. Every inquiry is logged with timestamps, so you can see afterward what was answered, how quickly and by whom. The callback itself is always made by a person.',
      },
      {
        q: 'Can you help with TPA and carrier documentation requirements?',
        a: 'We build documentation checklists into the tools you already use, so required photos, moisture readings, drying logs and authorizations are captured at the right stage. Each TPA program and carrier has its own requirements, so we work from the guidelines you provide rather than assuming them.',
      },
      {
        q: 'Do you integrate with Xactimate or restoration job management software?',
        a: 'It depends on the specific software, its API or export options and your subscription. Some platforms offer integrations or APIs and others do not, and we confirm feasibility before quoting. Where a direct connection is not possible, we design a consistent handoff step that does not depend on memory.',
      },
      {
        q: 'How do you keep rebuild work from slipping after mitigation?',
        a: 'We add a defined handoff at the end of mitigation: a rebuild opportunity is created with the scope notes, photos and owner contact, an estimator is assigned and a dated follow-up task is set. That way the reconstruction conversation happens on purpose instead of depending on someone remembering after the drying equipment is pulled.',
      },
    ],
    services: ['lead-to-booked', 'automation-integrations', 'managed-optimization', 'revenue-attribution'],
  },
];
