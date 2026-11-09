import { z } from 'zod';

export const INDUSTRIES = [
  'Roofing',
  'Remodeling / construction',
  'Property maintenance',
  'Restoration',
  'HVAC / plumbing / electrical',
  'Landscaping / outdoor',
  'Solar',
  'Other home service',
] as const;

export const MONTHLY_LEAD_RANGES = ['Under 25', '25–75', '75–200', '200–500', '500+', 'Not sure'] as const;

export const TOP_PROBLEMS = [
  'Leads are slow to get a response',
  'Missed calls and after-hours inquiries',
  'Our CRM is messy or underused',
  'Estimates go out and nobody follows up',
  'Our tools do not talk to each other',
  'We cannot tell which marketing produces jobs',
  'We need a better website or lead generation',
  'Something else',
] as const;

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v ? v : undefined));

export const inquirySchema = z.object({
  name: z.string().trim().min(2, 'Please enter your name.').max(120),
  company: z.string().trim().min(2, 'Please enter your company name.').max(160),
  email: z.string().trim().toLowerCase().email('Please enter a valid email address.').max(200),
  phone: optionalText(40).refine((v) => !v || /^[0-9+().\-\s]{7,40}$/.test(v), 'Please enter a valid phone number.'),
  industry: z.enum(INDUSTRIES, { message: 'Please choose your industry.' }),
  monthlyLeads: z.enum(MONTHLY_LEAD_RANGES).optional().or(z.literal('').transform(() => undefined)),
  currentCrm: optionalText(120),
  topProblem: z.enum(TOP_PROBLEMS, { message: 'Please choose what you want help with.' }),
  message: optionalText(4000),
  serviceInterest: optionalText(80),
  consentEmail: z.boolean().default(false),
  consentSms: z.boolean().default(false),
  utmSource: optionalText(120),
  utmMedium: optionalText(120),
  utmCampaign: optionalText(160),
  utmTerm: optionalText(160),
  utmContent: optionalText(160),
  referrer: optionalText(500),
  landingPath: optionalText(300),
});

export type InquiryInput = z.infer<typeof inquirySchema>;

/** Converts FormData into a plain object for zod parsing. */
export function formDataToObject(fd: FormData) {
  const obj: Record<string, unknown> = {};
  for (const [k, v] of fd.entries()) {
    if (typeof v === 'string') obj[k] = v;
  }
  return obj;
}

export const checkbox = (v: unknown) => v === 'on' || v === 'true' || v === true;
