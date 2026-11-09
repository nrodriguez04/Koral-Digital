import type { Faq } from './types';

/**
 * Home-page FAQs. Written to be quoted accurately by buyers and AI answer
 * engines: plain language, no prices, no guarantees, no invented numbers.
 * Prices live in site settings, never in these answers.
 */
export const generalFaqs: Faq[] = [
  {
    q: 'Do we have to switch CRMs to work with Koral Digital?',
    a: 'No. Koral Digital is vendor-neutral, and our default is to make the CRM and tools you already pay for work better, whether that is JobNimbus, AccuLynx, Jobber, ServiceTitan, HubSpot, HighLevel or something else. We recommend changing systems only when there is a clear operational reason and the change fits your team, and we will explain the trade-offs before you decide. If you do not have a CRM yet, we can help you choose and set one up.',
  },
  {
    q: 'What does a free consultation include?',
    a: 'A free consultation is a working conversation about how inquiries reach your business today, where they tend to stall between first contact and signed job, and which tools you use. We will share what we notice and suggest a practical next step, which may be a scoped project, a small fix your team can make on its own, or nothing at all. There is no obligation and no hard sell.',
  },
  {
    q: 'How long does a typical project take?',
    a: 'Our Lead-to-Booked pilot is a 14-day, fixed-scope engagement focused on one or two incoming lead sources. Larger work, such as CRM cleanup, migrations or multi-system integrations, is scoped in a written proposal with deliverables and a timeline before any work begins. Timelines also depend on how quickly we can get access to the tools involved.',
  },
  {
    q: 'Do you use AI to message our customers?',
    a: 'Not on its own. We may use AI to help classify incoming inquiries or draft replies, but a person on your team reviews and approves customer-facing messages before they are sent. We do not set up unsolicited automated messaging, and any automated texts or emails should be sent only to people who have agreed to be contacted, with opt-outs honored. We recommend having your consent language reviewed by a qualified attorney.',
  },
  {
    q: 'What areas do you serve?',
    a: 'Koral Digital is based in Frisco, Texas. We work in person across North Dallas-Fort Worth, including Frisco, Plano, McKinney, Prosper, Celina and Allen, and we take on remote engagements elsewhere in the United States where the work can be done well remotely.',
  },
  {
    q: 'Who will we actually work with?',
    a: 'Koral Digital is founder-led. You work directly with the person who scopes, builds, tests and supports your workflows, not a rotating account team. If a project ever calls for specialist help, we will tell you who is involved and why before they start.',
  },
  {
    q: 'What happens after the project is finished?',
    a: 'Every project ends with a handoff: documentation of what was built, where each automation lives, how to change it and who owns each account, plus a walkthrough for your team. Your accounts and data stay yours. If you would like ongoing help, optional managed support covers monitoring, maintenance and continued optimization.',
  },
  {
    q: 'Can you guarantee more leads or higher search rankings?',
    a: 'No, and you should be cautious of anyone who does. Results depend on your market, your team and many factors outside anyone\'s control. What we commit to is clear scope, careful implementation and honest measurement, so you can see what changed and decide what to improve next.',
  },
];
