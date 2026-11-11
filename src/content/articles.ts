import type { ArticleSeed } from './types';

/**
 * Seed articles for /insights. Original, practitioner-written drafts.
 *
 * Editorial rules: no invented statistics, studies, survey numbers, client
 * stories or quotes. Rules of thumb are framed as judgement, not data. Vendor
 * names are examples only and never imply a partnership.
 *
 * Bodies use the limited markdown subset rendered by src/lib/markdown.tsx:
 * ## / ### headings, blank-line separated paragraphs, "- " bullets, "1. "
 * numbered lists, **bold**, *italic*, [links](/path) and "> " blockquotes.
 * No HTML, tables, images, code fences or H1.
 */

const leadsFallThroughBody = `Most contractors don't lose leads to a competitor in one dramatic moment. They lose them in the handoffs: the web form that lands in an inbox nobody checks on Saturday, the missed call that never becomes a record, the estimate that goes out and then goes quiet. Each gap is small. Together, they decide how many of the inquiries you paid for ever turn into signed work.

This article walks through where those gaps usually appear in a roofing, remodeling, restoration or property-maintenance business, why they persist even in well-run companies, and a practical way to find your own leaks in about a week without buying anything new.

## What counts as a leak

A useful working definition:

> A leak is any point where an inquiry exists but nobody clearly owns the next step.

That definition matters because it moves the conversation away from blame. Leads rarely fall through because someone didn't care. They fall through because the process assumed a handoff would happen and nothing made sure it did.

An inquiry is safe when it has four things: a **record** in the system you treat as the source of truth, an **owner**, a **next step**, and a **due date** for that step. If any of those is missing, you have a leak, even if this particular lead happened to work out.

## Where contractor leads usually go missing

### 1. The first-response gap

Inquiries arrive when your team is busy: on a roof, in a crawlspace, driving between appointments, or asleep. A web form submitted at 8 p.m. on a Friday can sit until Monday unless something routes it to a person who can act. A homeowner shopping for a contractor may reach out to more than one company, so a slow first response can quietly hand the job to someone else.

### 2. Missed calls that never become records

Phone calls are often the highest-intent inquiries and the least tracked. If a call goes to voicemail and the callback depends on someone remembering to check, there is no record, no owner and no reminder. A missed call should create something visible: a CRM record and a callback task with an owner.

### 3. Duplicates and orphaned records

The same homeowner fills out your website form, then calls, then replies to a text. Now you might have three records, two salespeople who each think the lead is theirs, or nobody who thinks it is. Duplicates also distort your reporting, because one real opportunity looks like three leads with a poor close rate.

### 4. The intake-to-scheduling handoff

In many shops, the office collects the details and a salesperson is supposed to call back to book the inspection or estimate. Those details often live on a sticky note, in a text thread on someone's personal phone, or in a forwarded email. If the salesperson is out or the note gets buried, the lead stalls somewhere between "taken" and "scheduled."

### 5. The estimate that goes quiet

Sending an estimate feels like progress, so it often marks the end of active attention. But many homeowners need time, a second opinion, a financing answer or a conversation with a spouse. Without a scheduled follow-up and a named owner, open estimates age silently. This is also one of the more fixable leaks, because the homeowner has already shown real interest.

### 6. Lead source data that disappears

If nobody records where an inquiry came from at the moment it arrives, that information is usually gone for good. You end up judging your marketing by gut feel or by raw lead volume, rather than by which channels actually produce signed jobs. Capturing source on arrival is the foundation of [revenue attribution](/services/revenue-attribution).

## Why leaks persist in well-run companies

Most contractor tech stacks were assembled one tool at a time. The ad platform came with its own lead form. The phone system came with its own voicemail. The CRM was chosen for job management. The calendar belongs to whoever books. Each tool does its own job well enough, and nobody owns the seams between them.

A few other patterns come up again and again:

- **Rules live in people's heads.** "The office manager always calls back the after-hours leads" works until the office manager is on vacation.
- **Busy season hides the problem.** When there's more work than crew, nobody notices a few missed inquiries. When things slow down, those are the leads you wish you had.
- **Notifications go to the wrong place.** An alert sent to a shared inbox, or to someone who can't act on it, is not ownership.
- **Nobody can see "not yet contacted."** If your CRM shows what happened but not what hasn't happened, the gaps are invisible by design.

## How to find your leaks in about a week

You don't need new software to diagnose this. You need a sample of real inquiries and some patience.

1. **List every way an inquiry can reach you.** Website forms, phone calls, texts, ad-platform lead forms, referral partners, social media messages, home-show sign-ups and emails sent directly to individual staff.
2. **For each channel, write down where it lands first.** An inbox, a phone, the CRM, a spreadsheet or a specific person. Note who is notified and how.
3. **Pull a sample of recent inquiries.** A few dozen from the last couple of months is usually enough to see patterns. That's a judgement call, not a statistical rule; the point is to look at real cases instead of the process as everyone remembers it.
4. **Walk each one forward.** When did it arrive? When was the first real contact attempt, and who made it? Was an appointment set? Was an estimate sent? What happened next, and where is the outcome recorded?
5. **Mark every place you had to ask someone or check a personal device.** Each of those is a seam that depends on memory.
6. **Test it yourself.** Submit your own web form after hours. Call the main line and let it go to voicemail. Note what happens and how long it takes.
7. **Look for duplicates.** Search for a handful of recent customers by phone number and email, and count how many records each one has.

As you go, ask the same plain questions at every step:

- Who is notified, and how quickly would they actually see it?
- What happens if that person is on a job site or out sick?
- Which system is the record of truth for this lead?
- How would we know if this lead was never contacted?
- Who decides when a lead is dead, and is the reason written down?

## Fixing leaks without replacing your tools

Most leaks can be closed with the tools you already pay for, connected and configured more deliberately. The principles are simple:

- **One record of truth.** Every inquiry from every channel lands in one place, deduplicated by phone number and email, with the original source attached.
- **Every lead gets an owner and a due date.** Not a team or a shared inbox: a named person with a defined next step.
- **Alerts go to someone who can act, with an escalation path.** If the first person doesn't respond within a window you choose, the alert moves to the next person.
- **"Not yet contacted" is visible.** A simple view or daily digest of untouched leads is often more useful than a sophisticated dashboard.
- **Estimates have a follow-up schedule.** Open estimates get scheduled touches and an owner until they're signed or closed with a reason. More on that in [estimate follow-up](/services/estimate-follow-up).
- **People approve customer-facing messages.** Automatically drafting a first response can save time, but a person should review it before it goes out.

If your CRM is the bottleneck, because it's half set up, full of duplicates or ignored by the field team, start there; see [CRM implementation and cleanup](/services/crm-implementation). If the problem is mostly first response and scheduling, a narrowly scoped project like the [Lead-to-Booked pilot](/services/lead-to-booked) is designed to take one or two lead sources and make them reliable end to end.

### A note on automated texts and emails

Automating follow-up raises consent questions. In the United States, automated text messages and commercial email are subject to rules such as the Telephone Consumer Protection Act and the CAN-SPAM Act, and business texting may also involve carrier registration requirements. Record how and when each person agreed to be contacted, honor opt-outs promptly, and avoid messaging at unreasonable hours. This is general information, not legal advice; if you plan to automate outbound messages, have a qualified attorney review your consent language and process.

## What "fixed" looks like

You'll know the leaks are closing when you can answer four questions about any inquiry from the last month without asking anyone: where it came from, who owned it, when they first reached the homeowner, and what happened next. That isn't really a technology milestone. It's an operations milestone that the right setup makes much easier to hold.

## Want a second set of eyes?

If you'd like help tracing your own inquiry paths, we offer a free workflow review. We'll walk through how leads reach you today, where they tend to stall, and what we would fix first using the tools you already have. There's no obligation, and you're welcome to take what we find and run with it yourself. [Request a free workflow review](/contact).`;

const nativeVsIntegrationBody = `"Should we use the automations built into our CRM, or connect something like Zapier or n8n?" Contractors tend to ask this soon after their CRM is in place, and it's a fair question. The honest answer is that it depends on where the work happens.

Here is the short version:

> Use native automations for what happens inside your CRM. Use an integration for what has to happen between systems. Document both.

The rest of this article explains why, where the exceptions are, and how to decide case by case without getting talked into more technology than you need.

## Definitions first

**Native automation** means rules built into the CRM itself. Most CRMs contractors use, including JobNimbus, AccuLynx, Jobber and ServiceTitan, offer some built-in automation, such as creating a task when a job changes status, sending a templated email, or reminding a rep about a record that hasn't moved. General-purpose platforms such as HubSpot and HighLevel include visual workflow builders. What you can actually do depends on the product and often on your plan, so check your own account rather than a feature comparison chart.

**An integration** is anything that moves data or triggers actions between two systems. Integrations come in three broad flavors:

- **Vendor-built connectors.** A connection maintained by one of the two vendors, such as a CRM's built-in link to an accounting package.
- **Integration platforms.** Tools such as Zapier, a hosted service with a large catalog of app connectors, or n8n, which can be self-hosted or used as a cloud service. They sit between your systems and run workflows you define.
- **Custom code.** Scripts or small services that talk to each vendor directly.

Two more terms come up constantly. **An API** is the set of doors a system exposes so other software can read or write its data. **A webhook** is a message one system sends to another the moment something happens, such as "new lead created." You don't need to build either, but it helps to know whether your tools offer them, because that determines what's possible.

## When native automation is the right call

Start native when most of these are true:

- **The trigger and the result live in the same system.** A job moves to "estimate sent" and the CRM creates a follow-up task for the rep. Nothing has to leave the CRM.
- **The logic is simple.** If this happens, do that, with perhaps one condition.
- **Your team needs to see and adjust it where they work.** Office staff can often find and edit a native rule. They are much less likely to log in to a separate integration platform.
- **You want the vendor to own compatibility.** When the CRM updates, its native features are generally maintained along with it.
- **Failures would be obvious.** If a task doesn't appear, someone will notice quickly.

Native automation is also the right first step when the CRM itself still needs cleanup. Automating on top of messy pipeline stages and duplicate records tends to multiply the mess. Fix the stages and required fields first; see [CRM implementation](/services/crm-implementation).

## When you need an integration

Reach for an integration when one or more of these is true:

- **Data has to cross systems.** Ad-platform lead forms, call tracking, website forms, scheduling tools, accounting and e-signature tools rarely all live in one product.
- **You need logic the CRM can't express.** Deduplicating across sources by phone and email, routing by territory or job type, branching on several fields, or cleaning up a record before it lands.
- **You need monitoring and retries.** A well-built integration logs every run, retries temporary failures and alerts someone when something breaks. Many native rules fail quietly.
- **You want the process to outlive a CRM change.** If your intake and routing logic lives outside the CRM, switching CRMs later means re-pointing a connection rather than rebuilding how leads enter your business.
- **You want AI-assisted steps with human review.** Classifying an inquiry or drafting a reply for a person to approve usually needs an integration layer. It should never mean messages go out unreviewed.

See [automation and integrations](/services/automation-integrations) for how we approach this kind of work.

## The hidden costs on each side

Neither option is free. It helps to name the trade-offs before you commit.

**Native automation costs:**

- Capabilities may depend on your plan tier, and upgrading for a single rule can be expensive.
- Run history is often thin, so troubleshooting can mean guessing.
- Rules end up scattered across settings screens, and nobody remembers who built what or why.
- Everything you build deepens your dependence on one vendor.

**Integration costs:**

- It's another system to pay for, secure and monitor.
- Connections break when someone renames a field, changes a pipeline stage or lets an access token expire.
- APIs have limits and gaps; not every field you see in the CRM is available to outside tools.
- Someone has to own it. An integration nobody monitors is just a leak with extra steps.

## A decision checklist

For each automation you're considering, answer these in order:

1. **Where does the trigger happen?** Inside the CRM, or in another tool?
2. **Where must the result show up?** In the same system, or a different one?
3. **Can your CRM do this natively on your current plan?** Test it; don't assume.
4. **What happens when it fails, and who will notice?** If the honest answer is "nobody, until a customer complains," you need logging and alerts.
5. **Who will maintain it?** Name a person, internal or external.
6. **Does it send messages to customers?** If so, consent, opt-out handling and human review need to be designed in from the start.
7. **Would this survive a CRM change?** If it's core to how leads enter your business, keeping it portable may be worth the extra setup.

If the first two answers both point to the CRM and the third is yes, use native. If either of the first two points outside the CRM, you're looking at an integration. Everything else is a judgement about reliability and ownership.

## Common patterns, side by side

These are typical patterns, not prescriptions. Your tools and process may point somewhere different.

**Usually native:**

- A status change creates a follow-up task with a due date.
- An internal notification goes out when a job is assigned to a crew.
- A reminder fires when an estimate has been open longer than a window you choose.

**Usually an integration:**

- A website or ad-platform form creates a deduplicated CRM record, assigns an owner and alerts them.
- A missed call creates a record and a callback task, instead of a voicemail nobody logs.
- A signed job syncs to accounting so the office isn't retyping it.
- The original lead source travels with the record all the way to the signed contract, so you can report revenue by source. See [revenue attribution](/services/revenue-attribution).

**Often a hybrid:** an integration handles intake, cleanup and routing, then hands a well-formed record to the CRM, where native rules manage the rest of the pipeline. Each tool does the part it's good at.

## A word on customer messaging and consent

Whichever route you choose, automated texts and emails to customers come with obligations. In the United States, rules such as the Telephone Consumer Protection Act and the CAN-SPAM Act may apply, and business texting often involves carrier registration requirements. Capture and store consent, honor opt-outs quickly, and keep a person in the loop for anything that commits you to a price or a schedule. This is general information, not legal advice; have a qualified attorney review your consent process before you automate outbound messaging.

## Owning automations after launch

Reliable setups tend to share one unglamorous habit: someone keeps an inventory. For each automation, write down what triggers it, what it does, where it lives, who owns it and when it was last tested. Review the list on a regular schedule, and again after any change to your CRM's stages or fields. If you'd rather not carry that load internally, ongoing [managed optimization](/services/managed-optimization) is one way to hand it off without losing visibility.

## Not sure which side of the line you're on?

If you'd like a vendor-neutral opinion on your current setup, we offer a free workflow review. Bring your CRM, your lead sources and the automation ideas you've been sitting on, and we'll talk through what belongs where, including the things that don't need automating at all. [Request a free workflow review](/contact).`;

const fiveMetricsBody = `Most contractors know two numbers well: how many leads came in and how much revenue went out the door. The part in between, where inquiries become conversations, appointments, estimates and signed jobs, is often a black box. These five metrics are a practical way to open it up.

They are definitions, not benchmarks. You won't find industry averages here, because the right target depends on your trade, your market, your lead sources and your pricing, and numbers quoted without context tend to cause more confusion than clarity. The goal is to measure your own process consistently and then improve it against itself.

## First, agree on definitions

Metrics fall apart when people count different things. Before you track anything, write down short answers to these questions and share them with everyone who touches leads:

- **What counts as a lead?** Do spam, existing customers, vendor pitches and duplicate submissions count? Usually they shouldn't.
- **What counts as contacted?** A two-way conversation, or any attempt? An auto-reply is not contact.
- **What counts as an appointment?** Booked, or actually run? Track both if you can.
- **What counts as an estimate presented?** Emailed, or reviewed with the homeowner?
- **What counts as signed?** Contract signed, deposit received or job scheduled?

Pick definitions you can measure from data you already capture, and change them rarely. If you do change one, note the date so you aren't comparing two different things later.

## 1. Speed to first response

**Definition:** the time between when an inquiry arrives and the first real attempt by a person on your team to contact the homeowner.

**How to measure it:** you need two timestamps for each lead: when it was created and when the first outbound call, text or email was made by your team. Many CRMs can record both, as long as leads enter the system automatically and activities are logged there rather than on personal phones.

**How to read it:** report the **median** rather than the average, because a handful of leads left over a long weekend can distort an average. Split the number by business hours versus after hours, and by lead source. The after-hours figure deserves its own line, since that's where routing gaps tend to hide.

**Common trap:** counting an automated acknowledgment as a response. An auto-reply can be helpful, but it isn't contact, and counting it hides the real delay.

## 2. Contact rate

**Definition:** the share of new, valid leads where your team reached the person and had a two-way conversation.

**How to measure it:** valid leads with a logged conversation, divided by all valid leads created in the same period.

**How to read it:** a low contact rate alongside fast response times can point to bad contact data, the wrong channel (calling people who would rather text, or the reverse), or too few attempts.

**Common trap:** stopping after one attempt. Decide in advance how many attempts, over how many days and across which channels make up a complete contact sequence, then measure against that standard.

## 3. Appointment set rate and run rate

**Definition:** **set rate** is the share of contacted, qualified leads that booked an inspection, consultation or estimate appointment. **Run rate** is the share of those booked appointments that actually happened.

**How to measure it:** count appointments booked from leads created in the period, and separately count the ones marked completed. You'll need a consistent way to record no-shows and reschedules, or this number will drift.

**How to read it:** a gap between set and run usually points to the scheduling handoff: confirmations not sent, appointments booked too far out, or the person who shows up missing the details the homeowner already gave. If set rate itself is low, look at the first conversation and at how easy it is for a homeowner to pick a time.

## 4. Estimate follow-up coverage

**Definition:** the share of open estimates that have a scheduled next follow-up with a named owner.

This is a process metric rather than an outcome metric. In my view it's often the most useful of the five, because it measures something your team directly controls.

**How to measure it:** list every estimate that is neither signed nor closed as lost. For each one, check whether a future follow-up task exists and who owns it. Coverage is the share that has both. Track the **age** of open estimates alongside it, so stale estimates don't hide inside the total.

**How to read it:** low coverage means estimates are being sent and forgotten. That's usually fixable with a defined follow-up sequence, reminders and a clear rule for when an estimate gets closed with a reason. More on that in [estimate follow-up](/services/estimate-follow-up).

## 5. Close rate by lead source

**Definition:** signed jobs divided by estimates presented, broken out by the original lead source. Pair it with **revenue by source**, so a channel that produces fewer but larger jobs isn't undervalued.

**How to measure it:** the lead source has to be captured when the inquiry arrives and carried all the way to the signed job. That's the hard part. If source is entered later from memory, or overwritten when two records are merged, this metric won't be trustworthy.

**How to read it:** this is where marketing decisions get better. A channel with plenty of leads but few signed jobs may be costing more than it appears to. A channel with modest volume and strong close rates may deserve more attention. See [revenue attribution](/services/revenue-attribution) for how to connect a lead source to a signed contract.

## Reading the five together

Each metric tells you more alongside the others. Some common combinations, and where to look first:

- **Slow response and low contact rate:** start with routing and notifications. Leads are waiting too long for an owner.
- **Fast response but low contact rate:** check contact data quality, the channels you use and the number of attempts.
- **Good contact rate but low set rate:** look at the first conversation, how leads are qualified and how scheduling is offered.
- **Good set rate but weak run rate:** tighten confirmations and the handoff between whoever books and whoever shows up.
- **Healthy early numbers but low close rate:** check estimate follow-up coverage before assuming the problem is price.

## How to start without a data project

You can begin with the CRM you already have, or with a spreadsheet if you don't have a CRM yet.

1. **Make a few fields required:** lead source, date and time created, date and time of first contact, appointment date, appointment outcome, estimate sent date, estimate amount, status, signed date and lost reason.
2. **Capture source automatically wherever possible,** so it doesn't depend on someone's memory.
3. **Give one person ownership of the weekly numbers.** Not to police anyone, but to notice when something changes.
4. **Review weekly, decide monthly.** My rule of thumb: a weekly look catches broken processes early, while monthly is a better pace for changing strategy.
5. **Change one thing at a time,** so you can tell what made the difference.

If your CRM can't produce these numbers because the data isn't there, that's useful to know in itself. It usually means intake and pipeline setup need attention before any report will be reliable; see [CRM implementation](/services/crm-implementation).

## Mistakes to avoid

- **Comparing yourself to unsourced "industry benchmarks."** You rarely know how they were defined or measured.
- **Using averages for time-based metrics.** Medians are much harder to distort.
- **Punishing honest data.** If reps get blamed for logging a lost estimate, they'll stop logging lost estimates.
- **Tracking everything.** Five metrics reviewed every week beat twenty that nobody reads.
- **Putting customer details in reports.** Keep homeowner information in the CRM and share aggregate numbers.

> You can't fix what you can't see, and you can't see what you never defined. Agree on the definitions first; honest numbers follow.

## Want help setting this up?

If you'd like help getting these five numbers out of the tools you already use, we offer a free workflow review. We'll look at what your CRM captures today, what's missing, and the simplest path to a weekly view you can trust. [Request a free workflow review](/contact).`;

export const articleSeeds: ArticleSeed[] = [
  {
    slug: 'why-contractor-leads-fall-through-the-cracks',
    title: 'Why contractor leads fall through the cracks (and how to find the leaks)',
    description:
      'Most contractor leads are lost in handoffs between ads, phones, CRM and calendar. Where the leaks hide, why they persist, and a one-week audit to find them.',
    body: leadsFallThroughBody,
    authorName: 'Nicolas Rodriguez',
    readingMinutes: 7,
    tags: ['lead response', 'operations', 'crm'],
  },
  {
    slug: 'crm-native-automations-vs-integrations',
    title: "When to use your CRM's native automations vs. an integration",
    description:
      'Native CRM automation or an integration like Zapier or n8n? A vendor-neutral guide for contractors on when each fits, the hidden costs and how to decide.',
    body: nativeVsIntegrationBody,
    authorName: 'Nicolas Rodriguez',
    readingMinutes: 6,
    tags: ['automation', 'integrations', 'crm'],
  },
  {
    slug: 'five-metrics-inquiry-to-signed-job',
    title: 'Five metrics to track between inquiry and signed job',
    description:
      'Lead counts and revenue miss what happens in between. Five practical metrics, with plain definitions, for tracking contractor leads from inquiry to signed job.',
    body: fiveMetricsBody,
    authorName: 'Nicolas Rodriguez',
    readingMinutes: 6,
    tags: ['metrics', 'sales pipeline', 'reporting'],
  },
];
