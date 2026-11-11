import { z } from 'zod';

/** Shared (client + server) settings schema. Defaults are honest, launch-safe values. */
export const siteSettingsSchema = z.object({
  businessName: z.string().min(1).max(80).default('Koral Digital'),
  tagline: z.string().min(1).max(120).default('Building a better tomorrow.'),
  contactEmail: z.string().email().default('contact@koraldigital.com'),
  /** Email is only displayed publicly once someone confirms the mailbox receives mail. */
  contactEmailVerified: z.boolean().default(false),
  phone: z.string().max(40).default(''),
  phoneVerified: z.boolean().default(false),
  city: z.string().max(80).default('Frisco'),
  region: z.string().max(40).default('TX'),
  serviceAreas: z
    .array(z.string().max(60))
    .max(20)
    .default(['Frisco', 'Plano', 'McKinney', 'Prosper', 'Celina', 'Allen', 'Little Elm', 'The Colony']),
  /** Calendly or other scheduler. Embedded only once verified. */
  bookingUrl: z.string().url().or(z.literal('')).default('https://calendly.com/contact-koraldigital'),
  bookingUrlVerified: z.boolean().default(false),
  linkedinUrl: z.string().url().or(z.literal('')).default(''),
  notificationEmails: z.array(z.string().email()).max(5).default(['contact@koraldigital.com']),
  founderName: z.string().max(80).default('Nicolas Rodriguez'),
  founderBio: z
    .string()
    .max(1500)
    .default(
      'Nicolas founded Koral Digital to help home-service businesses get more value from the leads and software they already pay for. His background is hands-on: building and supporting software, and helping businesses adopt the systems they buy. Before expanding into operations and integrations, Koral Digital worked on lead generation, websites and digital marketing for roofing and home-service companies, which is where the gaps between ads, phones, CRMs and sales teams became impossible to ignore.',
    ),
  pricing: z
    .object({
      show: z.boolean().default(true),
      pilotFrom: z.number().int().min(0).max(1_000_000).default(2500),
      supportFrom: z.number().int().min(0).max(1_000_000).default(500),
      note: z
        .string()
        .max(300)
        .default(
          'Indicative founding-client pricing. Final scope and price are confirmed in a written proposal.',
        ),
    })
    .default({
      show: true,
      pilotFrom: 2500,
      supportFrom: 500,
      note: 'Indicative founding-client pricing. Final scope and price are confirmed in a written proposal.',
    }),
  initiative: z
    .object({
      status: z.enum(['planned', 'active']).default('planned'),
      statusNote: z
        .string()
        .max(600)
        .default(
          'The Koral Initiative is a planned program. No contributions have been made yet. When giving begins, we will publish the organizations we support and verified contribution amounts on this page.',
        ),
    })
    .default({
      status: 'planned',
      statusNote:
        'The Koral Initiative is a planned program. No contributions have been made yet. When giving begins, we will publish the organizations we support and verified contribution amounts on this page.',
    }),
  seo: z
    .object({
      defaultTitle: z
        .string()
        .max(70)
        .default('Koral Digital | Lead response & CRM automation for contractors'),
      defaultDescription: z
        .string()
        .max(170)
        .default(
          'Founder-led operations and automation partner in Frisco, TX. We help DFW roofing, remodeling and home-service teams turn more inquiries into booked jobs.',
        ),
    })
    .default({
      defaultTitle: 'Koral Digital | Lead response & CRM automation for contractors',
      defaultDescription:
        'Founder-led operations and automation partner in Frisco, TX. We help DFW roofing, remodeling and home-service teams turn more inquiries into booked jobs.',
    }),
});

export type SiteSettings = z.infer<typeof siteSettingsSchema>;

export const defaultSiteSettings: SiteSettings = siteSettingsSchema.parse({});
