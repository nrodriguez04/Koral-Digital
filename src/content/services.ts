import type { ServiceContent } from './types';

/**
 * Service pages under /services/[slug].
 *
 * Copy rules (keep these when editing):
 * - No invented statistics, client results, testimonials, client names, certifications or partnerships.
 * - Outcomes are operational, never numeric promises. No ranking or revenue guarantees.
 * - Prices are never written here; they render from site settings via `pricingKey`.
 * - AI only classifies or drafts. People approve outbound messages, pricing and commitments.
 * - Example workflows are illustrative and their titles start with "Example:".
 * - Tool lists are tools we commonly work with or can integrate, not partnerships. Integration
 *   options always depend on each vendor's API access and the customer's plan.
 */
export const services: ServiceContent[] = [
  {
    slug: 'lead-to-booked',
    name: 'Lead-to-Booked Pilot',
    shortName: 'Lead-to-Booked',
    icon: 'zap',
    tagline:
      'A 14-day, fixed-scope pilot that makes sure every new inquiry from your chosen lead sources is captured, assigned to a person and moved toward a booked appointment.',
    summary:
      'We take one or two of your lead sources and build the path from first inquiry to scheduled estimate in the tools you already use: capture, duplicate checks, routing, human-approved replies, scheduling handoff and reporting.',
    metaTitle: 'Lead-to-Booked Pilot: 14-Day Lead Response Setup',
    metaDescription:
      'A 14-day, fixed-scope pilot for contractors: capture leads from one or two sources, route them to the right person and hand off cleanly to scheduling.',
    problem: {
      heading: 'Leads are coming in. Some of them are quietly going nowhere.',
      paragraphs: [
        'For a lot of contractors, the problem is not a shortage of inquiries. It is the lack of a reliable path for them. A web form lands in a shared inbox. A Google Business Profile message sits unread over the weekend. A call goes to voicemail while the office is on another line, and nobody is sure whether anyone called back.',
        'Each tool does its own job. The website collects the form, the phone system logs the call, the CRM holds the contact. What is missing is the handoff between them: who gets notified, who owns the reply, whether this homeowner is already in the system from last month\'s call, and when the estimate actually gets on the calendar.',
        'When those handoffs depend on someone remembering, leads slip through and you cannot see where. You paid for the click, the lead or the canvassing hours, and the opportunity disappears somewhere between the inbox and the calendar.',
        'The Lead-to-Booked Pilot fixes that path for one or two sources first, in a fixed scope, so you can see it working in your own business before committing to anything bigger.',
      ],
    },
    outcomes: [
      'Every inquiry from the pilot sources lands in one place, your CRM or an agreed intake record, with its source and timestamp recorded.',
      'Repeat contacts are caught and flagged or merged instead of becoming a second record for the same homeowner.',
      'New leads are assigned to a named person automatically, with an alert as soon as they arrive and a defined backup when that person is unavailable.',
      'Reply drafts are ready for your team to review, edit and send, so nobody starts from a blank message and nothing goes out on its own.',
      'Qualified leads have a clear next step into scheduling, whether that is a booking link, a calendar request or a call-back task.',
      'For the pilot sources, you can see how many leads came in, how long each waited for a first reply and how many reached a booked appointment.',
    ],
    included: [
      {
        title: 'Intake and source mapping',
        body: 'We document how leads from the one or two sources in scope arrive today, for example a website form, Google Business Profile, a call-tracking line or a lead vendor feed, and where each one currently ends up.',
      },
      {
        title: 'Contact capture and duplicate checks',
        body: 'Inquiries are written to your CRM or an agreed intake record with source, timestamp and contact details. Matching rules on phone number and email catch repeat contacts, and uncertain matches are flagged for a person to review.',
      },
      {
        title: 'Notification and routing rules',
        body: 'New leads trigger alerts by text, email or CRM task based on rules you approve, such as service type, ZIP code or time of day, with an escalation path if the first person does not pick it up.',
      },
      {
        title: 'Human-approved response drafts',
        body: 'Templated replies, or AI-assisted drafts if you choose, prepared from the details of each inquiry. Your team reviews, edits and sends them. Nothing goes to a customer without a person approving it.',
      },
      {
        title: 'Scheduling handoff',
        body: 'A defined path from qualified lead to appointment that matches how you schedule today: a booking link, a calendar request, or a task for your estimator or office to call and confirm a time.',
      },
      {
        title: 'Operational reporting',
        body: 'A simple report or dashboard for the pilot sources showing leads received, time to first reply, assignment and booked appointments, built from timestamps your systems already record.',
      },
      {
        title: 'Documentation and walkthrough',
        body: 'Written documentation of what was built, where it lives, who owns each step and how to switch it off, plus a walkthrough with the people who will use it.',
      },
    ],
    process: [
      {
        title: 'Free workflow review',
        body: 'A consultation, in person in North Dallas–Fort Worth or by video, to walk through how leads arrive today, which tools you use and where things fall through. If a pilot fits, we confirm the sources and scope in a written proposal.',
      },
      {
        title: 'Kickoff and access',
        body: 'We agree on owners, routing rules and what a successful pilot looks like, and you grant access to the accounts involved. The 14 days start once the access we need is in place.',
      },
      {
        title: 'Build in your tools',
        body: 'We configure capture, duplicate checks, routing, reply drafts and the scheduling handoff using your existing systems\' native features first, adding n8n, Zapier or Make only where those fall short.',
      },
      {
        title: 'Test the messy cases',
        body: 'We run test inquiries through every path, including after-hours leads, duplicates, missing phone numbers and unassigned leads, and fix what breaks before anything goes live.',
      },
      {
        title: 'Launch and tune',
        body: 'The workflow goes live on the pilot sources. We watch it closely, adjust routing and templates with your team, and check that every lead is accounted for.',
      },
      {
        title: 'Review and decide',
        body: 'We go through the pilot report together: what was captured, how quickly it was handled and where leads still stall. You keep everything that was built and decide whether to extend it, add support or stop there.',
      },
    ],
    idealFor: [
      'Contractors who pay for leads through ads, lead vendors or canvassing and cannot say with confidence what happened to each one',
      'Offices where web forms, calls and messages land in different places and rely on one person to remember them',
      'Teams that already have a CRM or field-service tool but are not using its intake and automation features',
      'Owners who want to prove the approach on a small, fixed scope before committing to a larger project',
    ],
    notIncluded: [
      'More than two lead sources. Additional sources are scoped separately after the pilot.',
      'Generating new leads. The pilot handles the inquiries you already receive; it does not buy ads or run campaigns.',
      'Unattended outbound messaging. Replies are drafted for human approval, and any automated texting or email waits until consent and opt-out handling are in place.',
      'Replacing your CRM or migrating data. If your current system is the blocker, we will tell you and scope that separately.',
    ],
    tools: [
      'JobNimbus',
      'AccuLynx',
      'Roofr',
      'Jobber',
      'Housecall Pro',
      'ServiceTitan',
      'HubSpot',
      'HighLevel',
      'CallRail',
      'Google Business Profile',
      'Calendly',
      'Google Calendar',
      'Twilio',
      'n8n',
      'Zapier',
      'Make',
    ],
    exampleWorkflow: {
      title: 'Example: an after-hours website inquiry for a roof inspection',
      steps: [
        'A homeowner submits the website form at night asking about a leak over the garage.',
        'The workflow checks the CRM for an existing contact by phone and email, finds none, and creates a new lead tagged with the website as its source.',
        'The estimator who covers that ZIP code gets a text alert with the address and request; the office manager gets a CRM task as backup for the morning.',
        'A reply draft acknowledging the request and offering inspection windows is prepared in the CRM for the estimator to review.',
        'The estimator edits the draft and sends it. The homeowner picks a time from the booking link, and the inspection lands on the estimator\'s calendar.',
        'The lead\'s timestamps for received, assigned, first reply and booked feed the pilot report.',
      ],
    },
    faqs: [
      {
        q: 'What happens during the 14-day Lead-to-Booked Pilot?',
        a: 'We connect one or two of your lead sources to a defined path: capture into your CRM, duplicate checks, notification and assignment, reply drafts your team approves, and a handoff into scheduling. We test it with real-world scenarios, launch it, and finish with a report and a walkthrough. The 14 days begin once we have the account access we need.',
      },
      {
        q: 'Do we need to switch CRMs or buy new software?',
        a: 'Usually not. The pilot is built around the tools you already pay for, using their native features first. If an integration tool such as n8n, Zapier or Make is needed to connect two systems, we explain why and what it will cost you to run before adding it.',
      },
      {
        q: 'Which lead sources can the pilot cover?',
        a: 'Common choices are website forms, Google Business Profile messages and calls, call-tracking lines, missed-call alerts from your phone system, and lead vendor feeds. What we can connect depends on each vendor\'s API access and your plan level, so we confirm feasibility for your specific sources during the workflow review, before you commit to anything.',
      },
      {
        q: 'Will AI be sending messages to our customers?',
        a: 'No. AI may help draft a reply or sort an inquiry by type if you want it to, but a person on your team reviews and sends every outbound message. Pricing, scheduling commitments and anything that reads like a promise stay with your team, and customer data is not sent to an AI provider without your agreement.',
      },
      {
        q: 'How is the pilot priced?',
        a: 'The pilot is a fixed-scope, fixed-fee engagement. Your fee is confirmed in a written proposal after the free workflow review, based on the sources and tools involved. If something comes up that falls outside the agreed scope, we discuss it with you before doing the work.',
      },
      {
        q: 'What happens when the pilot ends?',
        a: 'You keep everything that was built, along with documentation of how it works, and it stays in your own accounts. From there you can run it yourselves, extend it to more lead sources in a follow-on project, or add a monthly support plan. Ongoing support is optional and agreed separately.',
      },
    ],
    pricingKey: 'pilot',
    related: ['managed-optimization', 'crm-implementation', 'revenue-attribution'],
  },
  {
    slug: 'crm-implementation',
    name: 'CRM Rescue & Implementation',
    shortName: 'CRM Rescue',
    icon: 'database',
    tagline:
      'Get the CRM you already pay for cleaned up, configured around how you actually sell, and connected to the rest of your tools.',
    summary:
      'Cleanup, configuration, pipeline stages and integrations for contractor CRMs, with migration only where it genuinely makes sense. The goal is a system your team trusts and uses.',
    metaTitle: 'CRM Rescue & Implementation for Contractors',
    metaDescription:
      'Cleanup, pipeline setup and integrations for contractor CRMs like JobNimbus, AccuLynx, Jobber and HubSpot, with migration only when it truly makes sense.',
    problem: {
      heading: 'The CRM is full, but nobody trusts what is in it',
      paragraphs: [
        'A lot of contractor CRMs were set up in a hurry, often by whoever had a free afternoon when the subscription started. A few years later there are duplicate contacts, stages nobody uses, custom fields spelled three different ways, and jobs still marked "Lead" long after they were built and paid for.',
        'When the data is unreliable, people stop using the system. Salespeople keep notes on their phones, the office tracks follow-ups on a whiteboard or spreadsheet, and the owner cannot get a straight answer about the pipeline without asking three people.',
        'The usual reaction is to shop for a new CRM. Sometimes that is the right call. Often, though, the system you have can do the job once it is cleaned up and configured around how your business actually sells, and switching platforms brings its own cost in migration, retraining and disruption.',
        'CRM Rescue starts with an honest assessment of whether your current system can work. Then we fix it, or help you move if it truly cannot.',
      ],
    },
    outcomes: [
      'Pipeline stages match how your team actually moves a job from inquiry to signed contract, with a clear rule for when a record moves forward.',
      'Duplicate and stale records are merged, archived or flagged, so the active pipeline reflects real opportunities.',
      'Fields that reporting depends on, such as lead source, job type and assigned rep, are captured at the right step instead of filled in later or never.',
      'Your CRM exchanges data with the tools around it, such as forms, phones, calendars and accounting, where those vendors allow it.',
      'Your team has short written guidance on how the CRM is used, so new hires learn one way of doing things.',
    ],
    included: [
      {
        title: 'CRM assessment',
        body: 'A review of your current setup, data quality, user habits and plan level, ending in a plain-English recommendation: fix in place or migrate, and why.',
      },
      {
        title: 'Data cleanup',
        body: 'Deduplication, standardized lead sources, job types and statuses, archiving of dead records, and correction of the fields your reports rely on. We take a full backup before changing anything.',
      },
      {
        title: 'Pipeline and stage configuration',
        body: 'Stages, statuses, required fields, task templates and user permissions designed around your sales process, including separate pipelines where the work genuinely differs, such as retail and insurance jobs.',
      },
      {
        title: 'Integrations',
        body: 'Connections between your CRM and lead sources, phone and call tracking, calendars, field documentation or accounting, using native integrations first and an integration layer only where needed.',
      },
      {
        title: 'Migration, when warranted',
        body: 'If moving platforms is the right call, we plan the field mapping, run test imports, set a cutover date and validate the data before your team switches over.',
      },
      {
        title: 'Team rollout',
        body: 'Short training sessions for office, sales and production, plus a written usage guide, so everyone uses the system the same way.',
      },
    ],
    process: [
      {
        title: 'Assess',
        body: 'We look at how your CRM is configured and how it is actually used, talk with the people who use it every day, and review data quality.',
      },
      {
        title: 'Recommend and scope',
        body: 'You receive a written recommendation and a fixed-fee proposal covering what to clean up, what to configure, what to connect, and whether migration is warranted.',
      },
      {
        title: 'Clean and configure',
        body: 'We back up your data, then clean records and build the pipeline, fields, templates and permissions agreed in the proposal.',
      },
      {
        title: 'Connect and test',
        body: 'Integrations are built and tested with sample records before they touch live data.',
      },
      {
        title: 'Roll out and adjust',
        body: 'We train your team, hand over documentation and make adjustments during the post-launch window defined in your proposal.',
      },
    ],
    idealFor: [
      'Contractors whose CRM is full of duplicates, unused stages or inconsistent data',
      'Teams where salespeople or the office track work outside the CRM because they do not trust it',
      'Owners considering a switch to a new CRM who want an independent, vendor-neutral opinion first',
      'Growing companies moving off spreadsheets that want their first CRM set up properly',
    ],
    notIncluded: [
      'Software licenses. Your CRM and other subscriptions stay in your name and on your account.',
      'Custom software development or building a CRM from scratch.',
      'Ongoing CRM administration after the adjustment window, which is available through managed support.',
    ],
    tools: [
      'JobNimbus',
      'AccuLynx',
      'Roofr',
      'Jobber',
      'Housecall Pro',
      'ServiceTitan',
      'HubSpot',
      'HighLevel',
      'Contractor Foreman',
      'Buildertrend',
      'CompanyCam',
      'QuickBooks',
      'Zapier',
      'Make',
      'n8n',
    ],
    exampleWorkflow: {
      title: 'Example: cleaning up a roofing CRM before storm season',
      steps: [
        'Export and back up all contacts, jobs, notes and attachments the platform allows.',
        'Merge duplicate contacts matched on phone, email and property address, with uncertain matches flagged for the office to review.',
        'Collapse loosely used statuses into a defined set of stages, each with a written entry rule.',
        'Split retail and insurance work into separate pipelines, with insurance stages for claim filed, adjuster meeting, approval and supplement.',
        'Make lead source and assigned rep required when a lead is created, and backfill those fields where the history allows.',
        'Train the office and sales reps on the new stages and publish a one-page usage guide.',
      ],
    },
    faqs: [
      {
        q: 'Should we switch CRMs or fix the one we have?',
        a: 'It depends on whether your current system can support how you sell, not on which product has the newest features. We review your process, data and plan level, then give you a written recommendation. Often a cleanup and reconfiguration solves the problem with far less disruption than a migration, but when a platform is genuinely the wrong fit, we will say so.',
      },
      {
        q: 'Which CRMs do you work with?',
        a: 'We are vendor-neutral and commonly work with contractor platforms such as JobNimbus, AccuLynx, Roofr, Jobber, Housecall Pro, ServiceTitan, Buildertrend and Contractor Foreman, as well as general CRMs like HubSpot and HighLevel. We are not a certified partner or reseller of any of them. What we can configure or integrate depends on each vendor\'s features, API access and your plan.',
      },
      {
        q: 'Will we lose data during cleanup or migration?',
        a: 'We take a full export before changing anything and test merges and imports on a sample before running them on everything. Uncertain duplicate matches are flagged for a person to review rather than merged automatically. Some vendor exports leave things out, such as certain attachments or activity history, and we identify those gaps before any migration begins.',
      },
      {
        q: 'How long does a CRM rescue take?',
        a: 'It depends on the size of your database, the number of integrations and whether a migration is involved. After the assessment, you get a fixed scope and timeline in a written proposal, so you know what to expect before any work starts.',
      },
      {
        q: 'Our team will not use the CRM. Can you fix that?',
        a: 'Poor adoption is often a design problem: too many fields, stages that do not match reality, or the same information entered twice. We simplify the setup around how your team actually works and train them on it. Nobody can force people to use a tool, but we can remove the reasons they avoid it.',
      },
    ],
    pricingKey: null,
    related: ['lead-to-booked', 'automation-integrations', 'revenue-attribution'],
  },
  {
    slug: 'estimate-follow-up',
    name: 'Unsold Estimate Follow-Up',
    shortName: 'Estimate Follow-Up',
    icon: 'repeat',
    tagline:
      'Give every open estimate a visible next step, and bring the ones that went quiet back into the conversation.',
    summary:
      'We reactivate open and unsold estimates with sequenced follow-up that your team approves, and keep the pipeline clean so no estimate sits untouched.',
    metaTitle: 'Unsold Estimate Follow-Up for Contractors',
    metaDescription:
      'Follow up on open and unsold estimates with sequenced, human-approved outreach and a clean pipeline, built in the CRM you already use. Consent-aware.',
    problem: {
      heading: 'The estimate went out. Then nothing happened.',
      paragraphs: [
        'Writing an estimate takes real work: the site visit, the measurements, the pricing, the proposal. Then the homeowner says they need to think about it, and the estimate goes into a folder. Next week there is a new batch of leads to chase, and the open estimates quietly age out.',
        'Plenty of homeowners who do not sign right away have not actually said no. They are comparing bids, waiting on an insurance decision, talking it over at home or working out financing. A useful follow-up at the right moment can move them forward, but only if someone remembers to make it.',
        'Without a system, follow-up depends on how busy each salesperson is that week. Some estimates get three calls and others get none, and nobody can say which open estimates are still alive.',
      ],
    },
    outcomes: [
      'Every open estimate has an owner, a status and a dated next step in your CRM.',
      'Follow-up runs on a defined sequence your team agreed to, instead of depending on memory.',
      'Older unsold estimates are reviewed and either re-engaged, scheduled for a later check-in or closed out with a reason.',
      'Messages are drafted for salespeople to review, personalize and send, so the tone stays personal and nothing goes out unchecked.',
      'Lost reasons are recorded consistently, so you can see why estimates do not close.',
      'Opt-outs and contact preferences are recorded and respected across every follow-up channel.',
    ],
    included: [
      {
        title: 'Open estimate audit',
        body: 'We pull your open and unsold estimates, sort them by age, job size and status, and agree with you which ones are worth re-engaging.',
      },
      {
        title: 'Follow-up sequence design',
        body: 'A sequence of calls, emails and, where consent allows, texts, timed around how your customers actually decide. Each step has an owner and a genuine reason to reach out, not just "checking in."',
      },
      {
        title: 'Human-approved message drafts',
        body: 'Templates, and optional AI-assisted drafts, that pull in the job details. Salespeople review, personalize and send. Pricing changes and discounts are always a person\'s decision.',
      },
      {
        title: 'Reactivation pass',
        body: 'A one-time, carefully reviewed outreach to older unsold estimates, with anyone who previously opted out or asked not to be contacted removed first.',
      },
      {
        title: 'Pipeline hygiene rules',
        body: 'Clear status definitions, required lost reasons and reminders for estimates that sit too long without activity, so the pipeline reflects reality.',
      },
      {
        title: 'Consent and opt-out handling',
        body: 'Opt-out keywords, unsubscribe links and do-not-contact flags carried through every channel, built with awareness of TCPA rules for texting and CAN-SPAM rules for commercial email.',
      },
    ],
    process: [
      {
        title: 'Review the backlog',
        body: 'We look at your open estimates, how they are tracked today and how follow-up currently happens, rep by rep.',
      },
      {
        title: 'Design the sequence',
        body: 'Together we agree on timing, channels, message angles and who owns each step, then write the templates for your approval.',
      },
      {
        title: 'Build in your CRM',
        body: 'Tasks, reminders, templates and status rules are set up in the system you already use, with native automation wherever it exists.',
      },
      {
        title: 'Run the reactivation pass',
        body: 'Older estimates are reviewed with you and cleaned up, and the ones worth pursuing get a personal, approved follow-up.',
      },
      {
        title: 'Measure and adjust',
        body: 'We track follow-up activity and estimate outcomes, then adjust timing and messaging based on what your salespeople are hearing.',
      },
    ],
    idealFor: [
      'Contractors with a backlog of open estimates and no consistent follow-up process',
      'Roofers and remodelers with longer decision cycles, where homeowners compare bids or wait on insurance or financing',
      'Sales teams where follow-up varies widely from one rep to the next',
      'Owners who want to know which estimates are still alive and why the others were lost',
    ],
    notIncluded: [
      'Purchased contact lists or cold outreach. We work only with your own estimate contacts.',
      'Unreviewed automated messaging. Every outbound message is approved by your team.',
      'Legal advice on consent or marketing rules. We build with those rules in mind and recommend confirming your practices with your own counsel.',
      'Pricing or discounting decisions, which always stay with you.',
    ],
    tools: [
      'JobNimbus',
      'AccuLynx',
      'Roofr',
      'Jobber',
      'Housecall Pro',
      'ServiceTitan',
      'Buildertrend',
      'HubSpot',
      'HighLevel',
      'Twilio',
      'Zapier',
      'Make',
      'n8n',
    ],
    exampleWorkflow: {
      title: 'Example: a follow-up sequence for a bathroom remodel estimate',
      steps: [
        'The estimate is marked "Sent" in the CRM, and a follow-up call task is created for the salesperson a couple of business days later.',
        'The salesperson calls to answer questions and logs the outcome with a short note.',
        'If there is no decision yet, an email draft summarizing the scope and offering a time to review options is prepared for the salesperson to edit and send.',
        'If the homeowner mentions financing, the record is tagged and the next step becomes sending financing information the office has approved.',
        'After an agreed period without a response, the estimate moves to a long-term check-in list instead of sitting open indefinitely.',
        'If the homeowner declines, the salesperson records the lost reason and the estimate is closed out.',
      ],
    },
    faqs: [
      {
        q: 'Will automated estimate follow-up make us look pushy?',
        a: 'It should do the opposite. The sequence is built around useful reasons to reach out, such as answering questions, sharing a schedule opening or checking on an insurance or financing decision, rather than repeated "just checking in" messages. Your team approves every message and can pause follow-up for any customer at any time.',
      },
      {
        q: 'Can we text customers about their estimates?',
        a: 'Often, yes, but business texting carries real compliance obligations. We make sure consent and opt-outs are recorded and honored, and that your texting number is registered with carriers where required (A2P 10DLC registration in the US). This is not legal advice, and we recommend confirming your consent language with your own counsel.',
      },
      {
        q: 'How far back should we go with old estimates?',
        a: 'That depends on your trade, how much your pricing has changed and how each estimate was left. We review the backlog with you and agree on a cutoff together. Very old estimates usually need a fresh visit or updated pricing rather than a follow-up on the original number.',
      },
      {
        q: 'Does AI write the follow-up messages?',
        a: 'It can help if you want it to. AI-assisted drafting can pull job details into a message so salespeople are not starting from scratch. A person reviews, edits and sends every message, and nothing involving price, discounts or scheduling commitments is decided by software.',
      },
      {
        q: 'Do we need a specific CRM for estimate follow-up?',
        a: 'No. We build the follow-up in the system you already use, whether that is a contractor platform like JobNimbus, AccuLynx or Jobber or a general CRM like HubSpot or HighLevel. If your CRM lacks the automation needed, we may add a lightweight integration tool, depending on what your vendor\'s API and plan allow.',
      },
    ],
    pricingKey: null,
    related: ['lead-to-booked', 'crm-implementation', 'revenue-attribution'],
  },
  {
    slug: 'automation-integrations',
    name: 'Automation & Systems Integration',
    shortName: 'Automation & Integrations',
    icon: 'workflow',
    tagline:
      'Connect your forms, phones, CRM, calendars and ad platforms so information moves on its own and people stay in charge of the decisions.',
    summary:
      'Practical integrations and automations using native features, n8n, Zapier or Make, with AI-assisted classification and drafting kept under human review and clear escalation.',
    metaTitle: 'Automation & Systems Integration for Contractors',
    metaDescription:
      'Connect your forms, phones, CRM, calendars and ads using native automations, n8n, Zapier or Make, with AI-assisted steps kept under human review.',
    problem: {
      heading: 'Right now, your office staff are the integration layer',
      paragraphs: [
        'In a lot of contractor offices, people are the glue between systems. Someone copies a web lead into the CRM. Someone else re-enters the signed job into the production schedule, then again into accounting. Call notes live in one app, photos in another and appointment times in a third.',
        'Every manual handoff is a chance for a typo, a delay or a lead that never gets entered. It also ties up your best office people with copy-and-paste work instead of customers.',
        'Most of the tools you already use have some automation built in, and many can talk to each other through APIs or integration platforms. The hard part is knowing which connections are worth building, building them so they do not fail silently, and keeping a person in the loop wherever judgment matters.',
      ],
    },
    outcomes: [
      'Information entered once moves to the systems that need it, instead of being retyped.',
      'Every automation is documented, named and owned, so you know what runs, where it runs and what to do if it stops.',
      'Failures raise an alert to a person instead of failing silently.',
      'AI-assisted steps, such as sorting inquiries or drafting replies, feed a review queue rather than acting on their own.',
      'Unclear, urgent or sensitive items are escalated to a named person with the context they need to act.',
    ],
    included: [
      {
        title: 'Workflow mapping',
        body: 'We document how information moves between your tools today, where it is re-entered by hand, and which handoffs cause the most delays or errors.',
      },
      {
        title: 'Native automation first',
        body: 'We use the automation features your CRM, phone system and calendar already include before adding anything new to your stack.',
      },
      {
        title: 'Integration builds',
        body: 'Connections built in n8n, Zapier, Make or directly against vendor APIs where native options fall short, with error handling, retries and duplicate protection.',
      },
      {
        title: 'AI-assisted classification and drafting',
        body: 'Optional steps that tag inquiries by job type or urgency and draft replies or summaries. Outputs always go to a person for review before anything is sent or committed.',
      },
      {
        title: 'Escalation and alerting',
        body: 'Rules for when an item needs a human right away, plus alerts when an automation fails or receives data it does not recognize.',
      },
      {
        title: 'Documentation and ownership',
        body: 'A plain-English inventory of every automation: what triggers it, what it changes, who owns it and how to switch it off.',
      },
    ],
    process: [
      {
        title: 'Map',
        body: 'We walk through your tools and handoffs with the people who do the work, and list every place information is copied, delayed or lost.',
      },
      {
        title: 'Prioritize and scope',
        body: 'We rank candidate automations by time saved, risk reduced and effort required, confirm vendor API feasibility, and agree a fixed scope in a written proposal.',
      },
      {
        title: 'Build',
        body: 'We build with test records or in a sandbox wherever the vendor allows, using native tools first and an integration platform where needed.',
      },
      {
        title: 'Test',
        body: 'Every automation is tested with normal, messy and failure cases, including missing fields, duplicate submissions and vendor outages.',
      },
      {
        title: 'Launch and document',
        body: 'Automations go live with alerting in place, and you receive documentation your own team can follow.',
      },
    ],
    idealFor: [
      'Offices where staff re-enter the same information into two or more systems',
      'Contractors with a patchwork of Zapier or Make automations that nobody fully understands anymore',
      'Teams that want to use AI for sorting or drafting but need human review built in from the start',
      'Businesses whose tools each work fine on their own but do not talk to each other',
    ],
    notIncluded: [
      'Integrations a vendor does not support. If an API is unavailable or limited on your plan, we tell you and propose a workaround or a well-defined manual step.',
      'Unattended AI that sends messages, sets prices or makes commitments on your behalf.',
      'Custom software products or customer-facing apps.',
    ],
    tools: [
      'n8n',
      'Zapier',
      'Make',
      'JobNimbus',
      'AccuLynx',
      'Jobber',
      'Housecall Pro',
      'ServiceTitan',
      'HubSpot',
      'HighLevel',
      'CompanyCam',
      'CallRail',
      'Twilio',
      'Google Calendar',
      'Calendly',
      'Google Ads',
      'QuickBooks',
    ],
    exampleWorkflow: {
      title: 'Example: turning a signed contract into production and accounting records',
      steps: [
        'A job is marked "Signed" in the CRM.',
        'The workflow creates the project in the production tool and a matching customer in accounting, checking first that neither already exists.',
        'A photo documentation project is created with the job address so field photos are organized from the first visit.',
        'The production manager receives a notification with the scope summary and the requested start window.',
        'If any step fails, for example because the address is missing, the office receives an alert with a link to the record instead of the job silently skipping a system.',
      ],
    },
    faqs: [
      {
        q: 'Should we use n8n, Zapier or Make?',
        a: 'It depends on volume, complexity, budget and who will maintain it. Zapier is quick to set up for simple connections, Make handles more involved branching in a visual builder, and n8n can be self-hosted and suits higher-volume or more technical workflows. We recommend the simplest option that fits, and sometimes the right answer is a native integration that needs none of them.',
      },
      {
        q: 'What happens when an automation breaks?',
        a: 'Automations break when a vendor changes an API, someone renames a field or unexpected data comes in. We build in error handling and alerts so a person is notified, and we document each automation so it can be fixed quickly. Ongoing monitoring is available through managed support.',
      },
      {
        q: 'How do you use AI in contractor workflows?',
        a: 'Narrowly. AI can classify an inquiry by job type or urgency, summarize a long message or draft a reply, and those outputs go to a person to review. We do not let AI send customer messages, approve pricing or make commitments, and we do not send your customer data to an AI provider without your agreement.',
      },
      {
        q: 'Can you integrate any two systems?',
        a: 'No one can honestly promise that. Integrations depend on each vendor\'s API, what your plan includes, rate limits and sometimes vendor approval. We check feasibility before quoting, and if a connection is not possible, we suggest the most reliable alternative, even if that is a clearly defined manual step.',
      },
      {
        q: 'Who owns the automations you build?',
        a: 'You do. We build in accounts you own wherever possible and give you documentation of what each automation does. If you stop working with us, you keep the accounts, the workflows and the documentation.',
      },
    ],
    pricingKey: null,
    related: ['lead-to-booked', 'crm-implementation', 'managed-optimization'],
  },
  {
    slug: 'revenue-attribution',
    name: 'Revenue Attribution & Reporting',
    shortName: 'Revenue Attribution',
    icon: 'bar-chart',
    tagline:
      'See which lead sources turn into appointments, estimates and signed contracts, not just clicks and form fills.',
    summary:
      'Reporting that follows each lead from its source through appointment, estimate and signed contract, so marketing and sales decisions rest on your own data.',
    metaTitle: 'Revenue Attribution: Lead Source to Signed Job',
    metaDescription:
      'Track each lead from its source to appointment, estimate and signed contract. Contractor reporting built on your own CRM data, with clear definitions.',
    problem: {
      heading: 'You know what you spend on leads. You are less sure what they turn into.',
      paragraphs: [
        'Ad platforms report clicks and form fills. Lead vendors report how many leads they sent. Your CRM knows which jobs were signed. Connecting those three, so you can say which source produced the work that actually paid, rarely happens on its own.',
        'The gap usually comes down to data, not effort. Lead source is not captured consistently, calls are not tied back to campaigns, estimates are not linked to the original inquiry, and reports count things differently depending on who builds them.',
        'Without that connection, budget decisions get made on gut feel or on whichever channel reports the most leads, which is not always the one producing signed contracts.',
      ],
    },
    outcomes: [
      'Each lead carries its original source through to appointment, estimate and signed contract.',
      'Everyone works from the same written definitions of a lead, a booked appointment, an issued estimate and a signed job.',
      'You can compare lead sources by how many reach each stage, not just by lead count.',
      'Tracking gaps, such as leads with no source or estimates with no linked inquiry, are visible so they can be fixed.',
      'Where your accounts support it, signed-job outcomes can be sent back to ad platforms so campaigns optimize toward real work.',
    ],
    included: [
      {
        title: 'Tracking audit',
        body: 'We trace how lead source is captured today across forms, calls, ad platforms, referrals and the CRM, and find where the chain breaks.',
      },
      {
        title: 'Metric definitions',
        body: 'A short written glossary of stages and metrics agreed with your team, so a report means the same thing to the owner, the office and the sales team.',
      },
      {
        title: 'Source capture fixes',
        body: 'UTM parameters, call-tracking numbers, hidden form fields and required CRM fields set up so source is recorded at the point of entry, including for offline sources like referrals and canvassing.',
      },
      {
        title: 'Stage linkage',
        body: 'Configuration that connects each original inquiry to its appointment, estimate and contract records in your CRM.',
      },
      {
        title: 'Reporting dashboard',
        body: 'A dashboard or recurring report, built in your CRM, a spreadsheet or a reporting tool, showing volume and progression by source and period.',
      },
      {
        title: 'Offline conversion feedback (optional)',
        body: 'Where your ad accounts and CRM support it, sending booked-appointment or signed-job events back to platforms like Google Ads so campaigns can optimize on real outcomes.',
      },
    ],
    process: [
      {
        title: 'Audit',
        body: 'We review how each source is tracked today, from ad click or phone call through to the signed contract, and document the gaps.',
      },
      {
        title: 'Define',
        body: 'We agree on stage and metric definitions with you and write them down, so every report uses the same rules.',
      },
      {
        title: 'Fix capture',
        body: 'We correct forms, call tracking and CRM fields so source and stage data are recorded consistently from now on.',
      },
      {
        title: 'Build reports',
        body: 'We build the dashboard or recurring report and check its numbers against the underlying records.',
      },
      {
        title: 'Review together',
        body: 'We walk through the first reports with you, flag remaining data gaps and agree on how often the numbers get reviewed.',
      },
    ],
    idealFor: [
      'Contractors spending on several lead sources who cannot compare them by signed work',
      'Owners who get different numbers from marketing, sales and accounting',
      'Companies using a marketing agency or running their own ads who want independent visibility into outcomes',
      'Businesses planning to increase ad spend that want tracking in place first',
    ],
    notIncluded: [
      'Complete accuracy for history that was never captured. We fix tracking going forward and recover what we can from past records.',
      'Running your ad campaigns, which is a separate service.',
      'Accounting-grade job costing or profitability analysis.',
    ],
    tools: [
      'Google Ads',
      'Google Analytics',
      'Google Business Profile',
      'Looker Studio',
      'CallRail',
      'HubSpot',
      'HighLevel',
      'JobNimbus',
      'AccuLynx',
      'ServiceTitan',
      'Jobber',
      'QuickBooks',
    ],
    exampleWorkflow: {
      title: 'Example: tracing a Google Ads call to a signed roof replacement',
      steps: [
        'A homeowner clicks a Google Ads search ad and calls the tracking number shown on the landing page.',
        'The call-tracking system records the campaign and keyword and passes the caller\'s details to the CRM as a new lead with its source attached.',
        'The lead is booked for an inspection, and the appointment is linked to the original lead record.',
        'The estimate is issued and later marked signed, carrying the same source through each stage.',
        'The monthly report shows that campaign\'s leads, booked inspections, issued estimates and signed jobs side by side with other sources.',
        'Where configured, the signed job is uploaded to Google Ads as an offline conversion.',
      ],
    },
    faqs: [
      {
        q: 'What is revenue attribution for a contractor?',
        a: 'It means connecting each signed job back to the lead source that produced it, so you can see which channels generate real work rather than just inquiries. For most contractors this is less about complex marketing models and more about capturing source consistently and linking the inquiry, appointment, estimate and contract records.',
      },
      {
        q: 'Can you show our cost per signed job by channel?',
        a: 'Going forward, yes, as long as spend data is available and lead source is captured reliably. For past jobs, it depends on how consistently source was recorded at the time. We are clear about which numbers are solid and which are estimates.',
      },
      {
        q: 'Do we need new software for attribution reporting?',
        a: 'Usually not. Most contractor CRMs can hold the fields and links needed, and reports can be built there or in a free tool such as Looker Studio. Call tracking is often the one addition worth considering if many of your leads come in by phone.',
      },
      {
        q: 'What about leads from canvassing, referrals or yard signs?',
        a: 'Those count too. We set up source options and simple capture steps for offline channels, such as a required source field when the office creates a lead, so referrals and door-knocking appear in the same reports as paid channels.',
      },
      {
        q: 'Will this show whether our marketing agency is performing?',
        a: 'It shows what happens to the leads each channel produces, from inquiry through signed contract, using your own CRM data. That gives you an independent basis for conversations with any agency. It does not replace the agency\'s own campaign reporting.',
      },
    ],
    pricingKey: null,
    related: ['crm-implementation', 'websites-lead-generation', 'managed-optimization'],
  },
  {
    slug: 'managed-optimization',
    name: 'Managed Automation & Optimization',
    shortName: 'Managed Automation',
    icon: 'shield-check',
    tagline:
      'Ongoing monitoring, maintenance and monthly improvements, so the systems you invested in keep working as your business changes.',
    summary:
      'A monthly retainer covering monitoring, fixes, small changes and a regular optimization review of your lead response, follow-up and integration workflows.',
    metaTitle: 'Managed Automation Support & Optimization',
    metaDescription:
      'Monthly monitoring, maintenance and optimization for your contractor CRM and automations: fixes, small changes and regular reviews, with clear scope.',
    problem: {
      heading: 'Automations do not stay finished',
      paragraphs: [
        'The day an automation launches is the day it starts drifting. Vendors update their APIs, someone renames a field in the CRM, a new lead source gets added, or a staff change means alerts still go to someone who left months ago.',
        'Most of these failures are quiet. Nothing crashes. Leads just stop getting assigned, or a follow-up step stops firing, and nobody notices until a customer complains or the pipeline looks thin.',
        'Your team is busy running jobs. Managed support gives you someone whose job is to watch the plumbing, fix it when it breaks and keep improving it based on what the data shows.',
      ],
    },
    outcomes: [
      'Your key workflows are checked on a regular schedule, and failures alert someone who will act on them.',
      'Broken automations are diagnosed and fixed under agreed support terms instead of waiting for someone to find time.',
      'Small changes, such as a new team member, routing rule or template, are handled without starting a new project.',
      'You get a regular review of how leads are moving, where they stall and what to adjust next.',
      'Documentation stays current as workflows change.',
    ],
    included: [
      {
        title: 'Monitoring',
        body: 'Scheduled checks and failure alerts on the covered workflows, including lead capture, routing, follow-up steps and integrations.',
      },
      {
        title: 'Maintenance and fixes',
        body: 'Troubleshooting and repair when a vendor change, data problem or configuration change breaks something.',
      },
      {
        title: 'Small change requests',
        body: 'Routine updates like adding users, adjusting routing, editing templates or adding a field, within the monthly scope agreed in your plan.',
      },
      {
        title: 'Monthly optimization review',
        body: 'A recurring review of pipeline and workflow data with recommendations on what to tune, what to retire and what is worth building next.',
      },
      {
        title: 'Documentation upkeep',
        body: 'Your automation inventory and runbooks are updated as things change, so they stay accurate.',
      },
    ],
    process: [
      {
        title: 'Baseline',
        body: 'If we did not build your workflows, we start by reviewing and documenting what is running before taking responsibility for it.',
      },
      {
        title: 'Agree the scope in writing',
        body: 'We define which systems and workflows are covered, how requests are submitted, coverage hours and response expectations.',
      },
      {
        title: 'Monitor and maintain',
        body: 'Ongoing checks, alerts and fixes throughout the month, with each change logged.',
      },
      {
        title: 'Review monthly',
        body: 'A short review call or written summary covering issues, changes and recommendations.',
      },
      {
        title: 'Plan larger improvements',
        body: 'Bigger improvements are scoped as separate fixed-fee projects so the monthly retainer stays predictable.',
      },
    ],
    idealFor: [
      'Contractors who finished a Lead-to-Booked pilot or implementation project and want it kept running',
      'Teams without an in-house person who understands their automations and integrations',
      'Businesses with existing automations that break now and then for reasons nobody can explain',
      'Owners who want a regular, data-based conversation about where leads are stalling',
    ],
    notIncluded: [
      'Large new builds or new integrations, which are scoped as separate projects.',
      'Round-the-clock emergency response, unless it is specifically agreed in writing.',
      'Fixing problems inside a vendor\'s own software. We help you document and escalate them to the vendor.',
      'Day-to-day CRM data entry or front-office staffing.',
    ],
    tools: [
      'n8n',
      'Zapier',
      'Make',
      'JobNimbus',
      'AccuLynx',
      'Jobber',
      'Housecall Pro',
      'ServiceTitan',
      'HubSpot',
      'HighLevel',
      'CallRail',
      'Twilio',
      'Google Calendar',
    ],
    exampleWorkflow: {
      title: 'Example: a month of managed support',
      steps: [
        'A scheduled check finds that leads from one website form stopped reaching the CRM after a plugin update. The office is notified and the connection is repaired.',
        'A new estimator joins, and routing rules and calendar links are updated to include them.',
        'The office asks for a follow-up template for financing questions. It is drafted, approved by the owner and added.',
        'The monthly review shows inspection requests from one part of the service area waiting longer for assignment than others. Routing is adjusted and the change is documented.',
      ],
    },
    faqs: [
      {
        q: 'What does managed automation support cover each month?',
        a: 'Monitoring of the agreed workflows, fixes when something breaks, a defined amount of small change requests, and a monthly optimization review. The exact coverage, request process and response expectations are written into your plan, so there is no guessing about what is included.',
      },
      {
        q: 'Can you support automations someone else built?',
        a: 'Yes, after an onboarding review. We document what is running, look for fragile or undocumented steps and recommend fixes before taking on ongoing responsibility. Some inherited setups need cleanup first, which we scope separately.',
      },
      {
        q: 'How is managed support priced?',
        a: 'It is a monthly retainer. Your plan\'s scope, price and terms are confirmed in a written agreement after we review the systems to be covered, because one integration needs far less attention than a dozen. Larger new work is always quoted separately.',
      },
      {
        q: 'Do we need managed support after a pilot?',
        a: 'No. Everything built in a pilot is documented and stays in your accounts, so your team can run it. Managed support makes sense if you do not have someone in-house who can watch the workflows, fix them when a vendor changes something and keep improving them.',
      },
      {
        q: 'Is support available after hours?',
        a: 'Coverage hours are defined in your support plan. If your lead flow depends on after-hours workflows, such as emergency intake for a restoration company, we design alerting so failures reach your own on-call person as well as us. Any after-hours response commitment is put in writing.',
      },
    ],
    pricingKey: 'support',
    related: ['lead-to-booked', 'automation-integrations', 'revenue-attribution'],
  },
  {
    slug: 'websites-lead-generation',
    name: 'Websites & Lead Generation',
    shortName: 'Websites & Lead Gen',
    icon: 'globe',
    tagline:
      'Conversion-focused websites, landing pages and Google Ads management, offered selectively and built to plug into your lead response and CRM.',
    summary:
      'Koral started in contractor marketing. We still build websites and landing pages and manage Google Ads where it fits, always wired into your CRM and follow-up.',
    metaTitle: 'Contractor Websites, Landing Pages & Google Ads',
    metaDescription:
      'Conversion-focused websites, landing pages and Google Ads for contractors, wired into your CRM and lead follow-up. Offered selectively from Frisco, TX.',
    problem: {
      heading: 'More traffic does not help if the leads go nowhere',
      paragraphs: [
        'Koral Digital started in lead generation and digital marketing for roofing, solar and home-service companies: Google Ads, websites, funnels and analytics. That work made one thing clear. Producing leads is only half the job; the other half is what happens after the form is submitted.',
        'Plenty of contractor websites look fine but make it hard to request an estimate, do not tell the office where a lead came from and send submissions to an inbox nobody watches closely. Plenty of ad accounts are tuned for cheap form fills instead of booked appointments.',
        'We still take on website, landing page and Google Ads work when it fits, and we build it to connect directly to your lead response and CRM. We are not a full-service agency, and if a larger agency or a specialist is a better fit for what you need, we will tell you.',
      ],
    },
    outcomes: [
      'Your website or landing page makes it obvious what you do, where you work and how to request an estimate.',
      'Every form submission and call from the site carries its source into your CRM.',
      'Ad campaigns are structured around the jobs you actually want, in the areas you actually serve.',
      'Campaign performance is judged by booked appointments and signed work where tracking allows, not only by clicks.',
      'Your marketing and your lead follow-up are designed together instead of by separate vendors who never talk.',
    ],
    included: [
      {
        title: 'Conversion-focused websites',
        body: 'Fast, mobile-friendly sites with clear service pages, accurate service-area information, simple estimate request forms, and the real trust details customers look for, such as licensing, warranties and photos of your own work.',
      },
      {
        title: 'Landing pages and funnels',
        body: 'Focused pages for a specific service, offer or campaign, such as storm inspections or kitchen remodel consultations, with tracking in place from launch.',
      },
      {
        title: 'Google Ads / PPC management',
        body: 'Campaign setup, keyword and location targeting, ad copy, negative keywords and ongoing management, with conversion tracking tied to your CRM where possible.',
      },
      {
        title: 'Google Business Profile hygiene',
        body: 'Accurate categories, services, service areas and photos, with profile messages and calls routed into your lead process.',
      },
      {
        title: 'Sales-enablement consulting',
        body: 'Practical help with estimate presentation, follow-up scripts and the handoff between marketing and sales.',
      },
    ],
    process: [
      {
        title: 'Fit check',
        body: 'We talk through your goals, current marketing and lead process, and tell you honestly whether we are the right fit for the work.',
      },
      {
        title: 'Plan',
        body: 'A written scope covering pages or campaigns, tracking, integrations and what you will need to provide, such as photos, license details and service descriptions.',
      },
      {
        title: 'Build',
        body: 'We design and build the pages or campaigns, with form routing and source tracking connected to your CRM.',
      },
      {
        title: 'Test and launch',
        body: 'We test forms, calls and tracking end to end before anything goes live.',
      },
      {
        title: 'Review and optimize',
        body: 'Regular reviews based on booked appointments and signed work where that data is available, not just traffic.',
      },
    ],
    idealFor: [
      'Contractors whose current website makes it hard to request an estimate or does not show where leads come from',
      'Businesses running Google Ads without clear tracking from click to booked appointment',
      'Companies that want marketing and lead follow-up handled by the same partner',
      'Local contractors in North Dallas–Fort Worth who prefer to meet in person',
    ],
    notIncluded: [
      'Guaranteed rankings, lead volumes or ad results. No honest provider can promise those.',
      'Full-service agency work at scale, such as large content programs, video production or managing many ad platforms at once.',
      'Purchased lead lists, lead reselling or anything that misrepresents your business, such as fake reviews.',
    ],
    tools: [
      'Google Ads',
      'Google Business Profile',
      'Google Analytics',
      'Google Tag Manager',
      'CallRail',
      'WordPress',
      'HubSpot',
      'HighLevel',
      'Calendly',
    ],
    exampleWorkflow: {
      title: 'Example: a storm-inspection landing page wired into the CRM',
      steps: [
        'After a hailstorm, a Google Ads campaign targets roof inspection searches within the contractor\'s own service area.',
        'Ads point to a focused landing page with a short inspection request form and a tracked phone number.',
        'Form submissions and calls create leads in the CRM with the campaign and keyword attached.',
        'The lead-routing workflow alerts the estimator covering that area and prepares a reply draft for approval.',
        'Campaign reviews look at booked inspections and signed jobs by campaign, not only at form fills.',
      ],
    },
    faqs: [
      {
        q: 'Is Koral Digital a full-service marketing agency?',
        a: 'No. Koral\'s roots are in contractor lead generation, and we still build websites and landing pages and manage Google Ads where it fits. Our main focus is the systems that turn leads into booked jobs, and if you need large-scale agency work or a specialty we do not offer, we will say so.',
      },
      {
        q: 'Can you guarantee first-page Google rankings or a set number of leads?',
        a: 'No, and you should be cautious of anyone who does. Search rankings and ad performance depend on competition, budget, your reviews and many other factors outside anyone\'s control. What we can commit to is a well-built site, clean tracking and honest reporting on what is working.',
      },
      {
        q: 'Do you only work with contractors in Dallas–Fort Worth?',
        a: 'No. We are based in Frisco, Texas, and can meet in person with businesses around North Dallas–Fort Worth, including Plano, McKinney, Allen, Prosper and Celina. Website and ads work can also be done remotely for contractors in other areas.',
      },
      {
        q: 'Can you take over our existing website and ad accounts?',
        a: 'Often, yes. We start by reviewing what you have, since a full rebuild is not always necessary. We recommend that your domain, website and ad accounts stay in your name, and we set things up that way so you keep full access whether or not we keep working together.',
      },
    ],
    pricingKey: null,
    related: ['revenue-attribution', 'lead-to-booked', 'automation-integrations'],
  },
];
