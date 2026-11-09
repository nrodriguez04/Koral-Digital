'use server';

import { isDatabaseConfigured } from '@/db';
import { log } from '@/lib/logger';
import { clientIp } from '@/lib/request';
import { checkbox, formDataToObject } from '@/lib/validation';
import { captureInquiry } from '@/server/inquiries';

export type InquiryState =
  | { status: 'idle' }
  | { status: 'success'; deduplicated: boolean }
  | { status: 'error'; message: string; fieldErrors?: Record<string, string[] | undefined>; values?: Record<string, string> };

export async function submitInquiry(_prev: InquiryState, formData: FormData): Promise<InquiryState> {
  const raw = formDataToObject(formData);
  const values = Object.fromEntries(
    Object.entries(raw).filter(([k]) => !['website', 'startedAt'].includes(k)).map(([k, v]) => [k, String(v)]),
  );
  if (!isDatabaseConfigured()) {
    log.error('inquiry.database_not_configured');
    return {
      status: 'error',
      message:
        'Our inquiry form is temporarily unavailable. Please try again shortly — your message has not been sent.',
      values,
    };
  }
  try {
    const result = await captureInquiry(
      { ...raw, consentEmail: checkbox(raw.consentEmail), consentSms: checkbox(raw.consentSms) },
      {
        ip: await clientIp(),
        honeypot: typeof raw.website === 'string' ? raw.website : undefined,
        startedAt: Number(raw.startedAt) || undefined,
      },
    );
    if (result.ok) return { status: 'success', deduplicated: result.deduplicated };
    return { status: 'error', message: result.error, fieldErrors: result.fieldErrors, values };
  } catch (err) {
    log.error('inquiry.unhandled_error', { err });
    return {
      status: 'error',
      message: 'Something went wrong on our side and your message was not saved. Please try again in a minute.',
      values,
    };
  }
}
