import { Alert } from '@/components/ui/primitives';
import { slugify } from '@/lib/utils';

type Section = { heading: string; paragraphs: string[]; bullets?: string[] };

export function LegalDocument({
  title,
  updated,
  sections,
}: {
  title: string;
  updated: string;
  sections: Section[];
}) {
  return (
    <div className="container-page py-14 sm:py-20">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-4xl font-semibold tracking-tight">{title}</h1>
        <p className="text-ink/55 mt-2 text-sm">Last updated {updated}</p>
        <Alert tone="warning" title="Draft — pending legal review" className="mt-6">
          This document is a professionally structured draft. It will be reviewed by a qualified attorney
          against our actual vendors and data practices before it is finalized.
        </Alert>
        <nav aria-label="Contents" className="ring-ink/8 mt-8 rounded-2xl bg-white p-5 ring-1">
          <p className="text-sm font-semibold">Contents</p>
          <ol className="mt-3 grid gap-1.5 text-sm sm:grid-cols-2">
            {sections.map((s, i) => (
              <li key={s.heading}>
                <a href={`#${slugify(s.heading)}`} className="text-ocean-700 hover:underline">
                  {i + 1}. {s.heading}
                </a>
              </li>
            ))}
          </ol>
        </nav>
        <div className="mt-10 space-y-10">
          {sections.map((s, i) => (
            <section key={s.heading} id={slugify(s.heading)} className="scroll-mt-28">
              <h2 className="text-xl font-semibold tracking-tight">
                {i + 1}. {s.heading}
              </h2>
              <div className="text-ink/75 mt-3 space-y-3 leading-relaxed">
                {s.paragraphs.map((p) => (
                  <p key={p.slice(0, 50)}>{p}</p>
                ))}
                {s.bullets?.length ? (
                  <ul className="marker:text-ocean-500 list-disc space-y-1.5 pl-6">
                    {s.bullets.map((b) => (
                      <li key={b.slice(0, 50)}>{b}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
