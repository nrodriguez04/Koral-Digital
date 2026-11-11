'use client';

import { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  CalendarCheck2,
  CheckCircle2,
  Copy,
  Inbox,
  LineChart,
  PenLine,
  RotateCcw,
} from 'lucide-react';
import { Button, ButtonLink } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const steps = [
  {
    icon: Inbox,
    title: 'Inquiry arrives',
    time: 'Tue 6:42 PM',
    body: 'A homeowner fills out the website form asking about hail damage on a roof. It is after hours and the office has gone home.',
    panel: [
      ['Source', 'Website form · Google Ads campaign “Storm – North”'],
      ['Name', 'Sample Homeowner (synthetic)'],
      ['Need', 'Roof inspection after hail'],
      ['Preferred contact', 'Text, evenings'],
    ],
  },
  {
    icon: Copy,
    title: 'Captured and de-duplicated',
    time: 'Tue 6:42 PM',
    body: 'The workflow checks the CRM for an existing contact by phone and email. None found, so it creates one contact and one job record — with the ad campaign and landing page attached.',
    panel: [
      ['CRM action', 'Created contact + lead (no duplicate found)'],
      ['Attribution', 'utm_campaign = storm-north'],
      ['Pipeline stage', 'New inquiry'],
    ],
  },
  {
    icon: Bell,
    title: 'Routed and alerted',
    time: 'Tue 6:43 PM',
    body: 'Based on the rules agreed in the plan (service type + ZIP code), the lead is assigned to the on-call sales rep, who gets a mobile alert with a one-tap link to the record.',
    panel: [
      ['Assigned to', 'On-call rep (rule: storm + north territory)'],
      ['Alert', 'Push + SMS to rep (internal staff only)'],
      ['Escalation', 'Office manager alerted if untouched in 15 min'],
    ],
  },
  {
    icon: PenLine,
    title: 'Reply drafted — a person approves',
    time: 'Tue 6:44 PM',
    body: 'A draft reply is prepared from an approved template. The rep edits one line and taps send. Nothing goes to the homeowner without a human approving it, and texts only go to people who asked to be texted.',
    panel: [
      [
        'Draft',
        '“Hi — thanks for reaching out about your roof. I can come by Thursday morning or Friday afternoon for a free inspection. Which works better?”',
      ],
      ['Status', 'Approved and sent by rep at 6:51 PM'],
      ['Consent', 'Homeowner requested text contact on the form'],
    ],
  },
  {
    icon: CalendarCheck2,
    title: 'Estimate appointment booked',
    time: 'Tue 7:05 PM',
    body: 'The homeowner replies “Thursday.” The rep books it on the shared calendar from the CRM; the appointment syncs to the crew lead and the pipeline stage updates automatically.',
    panel: [
      ['Appointment', 'Thu 9:00 AM inspection'],
      ['Pipeline stage', 'Inspection scheduled'],
      ['Speed to first response', '9 minutes (example)'],
    ],
  },
  {
    icon: LineChart,
    title: 'Reported, source to signed job',
    time: 'Weekly',
    body: 'The weekly report shows this lead in context: which campaign it came from, how fast it was answered, whether the estimate was booked and — later — whether it signed. Every number links back to the underlying records.',
    panel: [
      ['Report', 'Leads → responded → booked → estimated → signed, by source'],
      ['Owner view', 'One page, every Monday'],
      ['Data', 'Pulled from the tools you already use'],
    ],
  },
];

export function LeadFlowDemo() {
  const [i, setI] = useState(0);
  const step = steps[i]!;
  const done = i === steps.length - 1;
  return (
    <div className="grid gap-8 lg:grid-cols-12">
      <ol className="space-y-2 lg:col-span-4" aria-label="Workflow steps">
        {steps.map((s, idx) => (
          <li key={s.title}>
            <button
              type="button"
              onClick={() => setI(idx)}
              aria-current={idx === i ? 'step' : undefined}
              className={cn(
                'flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm transition',
                idx === i
                  ? 'bg-ocean-900 text-white'
                  : 'text-ink ring-ink/8 hover:bg-ocean-50 bg-white ring-1',
              )}
            >
              {idx < i ? (
                <CheckCircle2 className="text-ocean-400 size-5 shrink-0" aria-hidden="true" />
              ) : (
                <s.icon
                  className={cn('size-5 shrink-0', idx === i ? 'text-ocean-300' : 'text-ocean-600')}
                  aria-hidden="true"
                />
              )}
              <span className="font-medium">{s.title}</span>
            </button>
          </li>
        ))}
      </ol>
      <div className="lg:col-span-8">
        <div className="card overflow-hidden" aria-live="polite">
          <div className="border-ink/8 flex items-center justify-between border-b bg-amber-50 px-5 py-2 text-xs font-semibold text-amber-900">
            <span>SYNTHETIC DEMO DATA — not a real customer or client result</span>
            <span>
              Step {i + 1} of {steps.length}
            </span>
          </div>
          <div className="p-6 sm:p-8">
            <p className="text-ink/55 text-sm">{step.time}</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">{step.title}</h2>
            <p className="text-ink/75 mt-3 leading-relaxed">{step.body}</p>
            <dl className="divide-ink/8 bg-ivory ring-ink/8 mt-6 divide-y rounded-2xl ring-1">
              {step.panel.map(([k, v]) => (
                <div key={k} className="grid gap-1 px-4 py-3 text-sm sm:grid-cols-3">
                  <dt className="text-ink/55">{k}</dt>
                  <dd className="text-ink sm:col-span-2">{v}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
              <Button variant="outline" onClick={() => setI((x) => Math.max(0, x - 1))} disabled={i === 0}>
                <ArrowLeft className="size-4" aria-hidden="true" /> Back
              </Button>
              {done ? (
                <div className="flex flex-wrap gap-2">
                  <Button variant="ghost" onClick={() => setI(0)}>
                    <RotateCcw className="size-4" aria-hidden="true" /> Start over
                  </Button>
                  <ButtonLink
                    href="/contact?service=lead-to-booked"
                    data-track="cta_click"
                    data-track-label="demo_complete"
                  >
                    Talk about your workflow <ArrowRight className="size-4" aria-hidden="true" />
                  </ButtonLink>
                </div>
              ) : (
                <Button onClick={() => setI((x) => Math.min(steps.length - 1, x + 1))}>
                  Next step <ArrowRight className="size-4" aria-hidden="true" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
