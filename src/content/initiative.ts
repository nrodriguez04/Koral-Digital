import type { Faq, SourcedFact } from './types';

/**
 * Koral Initiative content.
 *
 * TRUTHFULNESS RULES (see docs/CLAUDE_BUILD_PROMPT.md, section 0):
 * The Koral Initiative is a PLANNED future giving program. Nothing in this file
 * may claim that a donation has been made, that a percentage of revenue or
 * profit is pledged, that Koral Digital is partnered or affiliated with any
 * organization, or that any impact has been achieved. Update this copy only
 * after a contribution has actually been made and verified.
 *
 * Every reef fact below is phrased conservatively and links to the source it
 * was checked against. Re-verify sources before changing the wording.
 */

export const reefFacts: SourcedFact[] = [
  {
    statement:
      'Coral reefs cover less than 1 percent of the ocean floor, yet they support an estimated 25 percent of all known marine species.',
    sourceName: 'NOAA, Florida Keys National Marine Sanctuary',
    sourceUrl: 'https://floridakeys.noaa.gov/corals/biodiversity.html',
  },
  {
    statement:
      'A 2014 meta-analysis of studies from the Atlantic, Pacific and Indian oceans found that coral reefs reduce wave energy by an average of about 97 percent, with the reef crest alone dissipating about 86 percent.',
    sourceName: 'Ferrario et al., Nature Communications (2014)',
    sourceUrl: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC4354160',
  },
  {
    statement:
      'U.S. coral reefs provide an estimated $1.8 billion a year in averted flood damage to property and economic activity, along with flood protection for more than 18,000 people, according to a 2019 U.S. Geological Survey assessment.',
    sourceName: 'U.S. Geological Survey, Open-File Report 2019-1027',
    sourceUrl: 'https://pubs.usgs.gov/publication/ofr20191027',
  },
  {
    statement:
      'In April 2024, NOAA and the International Coral Reef Initiative confirmed a global coral bleaching event: the fourth on record, and the second in roughly a decade.',
    sourceName: 'NOAA',
    sourceUrl: 'https://www.noaa.gov/news-release/noaa-confirms-4th-global-coral-bleaching-event',
  },
  {
    statement:
      'From 2023 into 2025, bleaching-level heat stress affected about 84 percent of the world\'s coral reef area, the most extensive of any global bleaching event on record, with mass bleaching documented in at least 83 countries and territories, according to NOAA Coral Reef Watch.',
    sourceName: 'NOAA Coral Reef Watch',
    sourceUrl: 'https://coralreefwatch.noaa.gov/satellite/research/coral_bleaching_report.php',
  },
  {
    statement:
      'Texas has coral reefs of its own. Flower Garden Banks National Marine Sanctuary, in the Gulf off the Texas and Louisiana coasts, contains the northernmost coral reefs in the continental United States, according to NOAA.',
    sourceName: 'NOAA Office of National Marine Sanctuaries',
    sourceUrl: 'https://sanctuaries.noaa.gov/science/condition/fgbnms/history.html',
  },
];

export const initiativeCommitments: { title: string; body: string }[] = [
  {
    title: 'Research before we give',
    body: 'Before any contribution, we will research and vet coral reef conservation and restoration organizations: how their work is grounded in science, how they measure and report outcomes, how transparent their finances are, and whether they are in good standing. We will not name an organization as a recipient or partner until a contribution or agreement actually exists.',
  },
  {
    title: 'Begin giving only when the business can sustain it',
    body: 'Koral Digital is a small, founder-led company. We plan to begin giving once the business can support it consistently, because a modest commitment we can keep is worth more than a large announcement we cannot. Until then, the Koral Initiative is a stated intention, not an active program.',
  },
  {
    title: 'Publish recipients and verified amounts',
    body: 'Once a contribution has actually been made, we will publish the recipient, the date and the verified amount on this page. Until that happens there is nothing to report, and we will not imply otherwise.',
  },
  {
    title: 'No percentage pledge until it is formally established',
    body: 'We are not pledging a percentage of revenue or profit today. If we adopt a formal giving policy, we will state it plainly here, including how the amount is calculated and when it takes effect.',
  },
  {
    title: 'Report progress transparently, and explore hands-on support',
    body: 'This page is where we will report progress, with dates, including when plans change. Over time we may also offer volunteer time or skills-based help, such as operations and technology support for a vetted conservation organization. If we do, we will describe exactly what was provided.',
  },
];

export const initiativeFaqs: Faq[] = [
  {
    q: 'Does Koral Digital donate to reef conservation today?',
    a: 'Not yet. The Koral Initiative is a planned future giving program, and no contributions have been made so far. When a contribution is actually made, we will publish the recipient, the date and the verified amount on this page.',
  },
  {
    q: 'Why coral reefs?',
    a: 'Our mark shows coral held in cupped hands, and our tagline is "Building a better tomorrow." Reefs are a fitting symbol for that idea: quiet, foundational systems that protect coastlines and support a remarkable share of ocean life, and that are under real pressure from warming seas. Our day-to-day work is helping businesses build stronger foundations, and we want the company\'s growth to eventually help protect these ones too.',
  },
  {
    q: 'How will you choose which organizations to support?',
    a: 'We will look for organizations doing science-based reef conservation or restoration, with clear reporting on outcomes, transparent finances and a solid track record. We will do that research before committing to anything, and we will not describe any organization as a partner or recipient until a contribution or agreement actually exists.',
  },
  {
    q: 'Where will you report progress?',
    a: 'Right here, on this page. We will post dated updates as the program develops, and once a contribution has been made we will list the recipient and the verified amount. If our plans change, we will say so here as well.',
  },
];
