'use client';

import { useActionState, useEffect, useRef } from 'react';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { submitInquiry, type InquiryState } from '@/app/(marketing)/contact/actions';
import { Alert } from '@/components/ui/primitives';
import { Checkbox, Field, Input, Select, SubmitButton, Textarea } from '@/components/ui/form';
import { getAttribution, track } from '@/components/marketing/tracker';
import { INDUSTRIES, MONTHLY_LEAD_RANGES, TOP_PROBLEMS } from '@/lib/validation';

const initial: InquiryState = { status: 'idle' };

export function InquiryForm({
  defaultService,
  defaultIndustry,
  bookingUrl,
}: {
  defaultService?: string;
  defaultIndustry?: string;
  bookingUrl?: string | null;
}) {
  const [state, action] = useActionState(submitInquiry, initial);
  const started = useRef(false);
  const startedAt = useRef(0);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  /** Adds fill-time and first-touch attribution at submit time (works without JS too, minus these extras). */
  const submit = (fd: FormData) => {
    if (startedAt.current) fd.set('startedAt', String(startedAt.current));
    const a = getAttribution();
    for (const [k, val] of Object.entries({ ...a, landingPath: a.landingPath ?? window.location.pathname })) {
      if (val) fd.set(k, String(val));
    }
    return action(fd);
  };

  useEffect(() => {
    if (state.status === 'success') {
      track('contact_submit_success');
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    if (state.status === 'error') track('contact_submit_error');
  }, [state]);

  const fe = state.status === 'error' ? state.fieldErrors ?? {} : {};
  const v = state.status === 'error' ? state.values ?? {} : {};
  const err = (k: string) => fe[k];
  const invalid = (k: string) => (fe[k] ? true : undefined);
  const described = (k: string) => (fe[k] ? `${k}-error` : undefined);

  if (state.status === 'success') {
    return (
      <div className="card p-8 text-center" role="status" aria-live="polite">
        <CheckCircle2 className="mx-auto size-12 text-ocean-500" aria-hidden="true" />
        <h2 className="mt-4 text-2xl font-semibold tracking-tight">Thank you — we have your message.</h2>
        <p className="mx-auto mt-3 max-w-lg leading-relaxed text-ink/70">
          {state.deduplicated
            ? 'We matched this to your earlier inquiry, so everything stays in one place. '
            : ''}
          A real person will read it and reply within one business day, usually sooner. There is no automated drip
          campaign on the other end.
        </p>
        {bookingUrl ? (
          <a
            href={bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            data-track="booking_click"
            data-track-label="post_submit"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-ocean-500 px-5 py-3 text-sm font-semibold text-white hover:bg-ocean-600"
          >
            Prefer to pick a time now? Open the booking calendar <ArrowRight className="size-4" aria-hidden="true" />
          </a>
        ) : null}
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      action={submit}
      noValidate
      className="card space-y-5 p-6 sm:p-8"
      onFocusCapture={() => {
        if (!started.current) {
          started.current = true;
          track('contact_start');
        }
      }}
      aria-describedby={state.status === 'error' ? 'form-error' : undefined}
    >
      {state.status === 'error' ? (
        <div id="form-error">
          <Alert tone="error" title="Your message was not sent yet">
            {state.message}
          </Alert>
        </div>
      ) : null}

      {/* Spam controls: honeypot (humans never see it) and fill-time check. */}
      <div aria-hidden="true" className="absolute -left-[10000px] h-px w-px overflow-hidden">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      {defaultService ? <input type="hidden" name="serviceInterest" value={defaultService} /> : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Your name" htmlFor="name" required error={err('name')}>
          <Input id="name" name="name" autoComplete="name" required defaultValue={v.name} aria-invalid={invalid('name')} aria-describedby={described('name')} />
        </Field>
        <Field label="Company" htmlFor="company" required error={err('company')}>
          <Input id="company" name="company" autoComplete="organization" required defaultValue={v.company} aria-invalid={invalid('company')} aria-describedby={described('company')} />
        </Field>
        <Field label="Work email" htmlFor="email" required error={err('email')}>
          <Input id="email" name="email" type="email" autoComplete="email" required defaultValue={v.email} aria-invalid={invalid('email')} aria-describedby={described('email')} />
        </Field>
        <Field label="Phone" htmlFor="phone" error={err('phone')} hint="Only if you would like a call back.">
          <Input id="phone" name="phone" type="tel" autoComplete="tel" defaultValue={v.phone} aria-invalid={invalid('phone')} aria-describedby={described('phone')} />
        </Field>
        <Field label="Industry" htmlFor="industry" required error={err('industry')}>
          <Select id="industry" name="industry" required defaultValue={v.industry ?? defaultIndustry ?? ''} aria-invalid={invalid('industry')} aria-describedby={described('industry')}>
            <option value="" disabled>
              Choose one…
            </option>
            {INDUSTRIES.map((i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Approximate new leads per month" htmlFor="monthlyLeads" error={err('monthlyLeads')}>
          <Select id="monthlyLeads" name="monthlyLeads" defaultValue={v.monthlyLeads ?? ''}>
            <option value="">Prefer not to say</option>
            {MONTHLY_LEAD_RANGES.map((i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </Select>
        </Field>
        <Field
          label="Current CRM or job-management software"
          htmlFor="currentCrm"
          error={err('currentCrm')}
          hint="e.g. JobNimbus, Jobber, AccuLynx, a spreadsheet — or none yet."
          className="sm:col-span-2"
        >
          <Input id="currentCrm" name="currentCrm" defaultValue={v.currentCrm} />
        </Field>
        <Field label="What do you most want help with?" htmlFor="topProblem" required error={err('topProblem')} className="sm:col-span-2">
          <Select id="topProblem" name="topProblem" required defaultValue={v.topProblem ?? ''} aria-invalid={invalid('topProblem')} aria-describedby={described('topProblem')}>
            <option value="" disabled>
              Choose the closest match…
            </option>
            {TOP_PROBLEMS.map((i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </Select>
        </Field>
        <Field
          label="Anything else we should know?"
          htmlFor="message"
          error={err('message')}
          hint="How leads come in today, what is frustrating, what you have already tried."
          className="sm:col-span-2"
        >
          <Textarea id="message" name="message" rows={5} maxLength={4000} defaultValue={v.message} />
        </Field>
      </div>

      <fieldset className="space-y-3 rounded-xl bg-ivory p-4 ring-1 ring-ink/8">
        <legend className="sr-only">Contact preferences</legend>
        <p className="text-sm font-medium text-ink">Contact preferences</p>
        <Checkbox
          name="consentEmail"
          defaultChecked={v.consentEmail === 'on'}
          label="You may email me occasional, relevant follow-up about my inquiry. (We reply to your inquiry either way.)"
        />
        <Checkbox
          name="consentSms"
          defaultChecked={v.consentSms === 'on'}
          label="You may text me about scheduling this consultation. Message and data rates may apply. Reply STOP to opt out. Consent is not a condition of any purchase."
        />
      </fieldset>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-relaxed text-ink/55">
          We use your details only to respond to this inquiry. See our{' '}
          <a href="/privacy" className="underline underline-offset-2 hover:text-ink">
            privacy notice
          </a>
          . We never sell your information.
        </p>
        <SubmitButton size="lg" pendingText="Sending…" data-track="cta_click" data-track-label="contact_submit">
          Request my free consultation
        </SubmitButton>
      </div>
    </form>
  );
}
