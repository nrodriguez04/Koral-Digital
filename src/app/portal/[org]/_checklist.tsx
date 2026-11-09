import { CheckCircle2, Circle } from 'lucide-react';
import { ActionForm } from '@/components/app/action-form';
import { formatDate } from '@/lib/utils';
import { portalCompleteChecklistItem } from './actions';

export function Checklist({ org, items, canEdit }: { org: string; items: { id: string; title: string; description: string; status: string; dueAt: Date | null }[]; canEdit: boolean }) {
  if (!items.length) return <p className="px-5 py-4 text-sm text-ink/55">Nothing needed from you right now.</p>;
  return (
    <ul className="divide-y divide-ink/6">
      {items.map((t) => (
        <li key={t.id} className="flex items-start gap-3 px-5 py-3">
          {canEdit ? (
            <ActionForm action={portalCompleteChecklistItem} hideSubmit inline>
              <input type="hidden" name="org" value={org} />
              <input type="hidden" name="taskId" value={t.id} />
              <input type="hidden" name="done" value={t.status === 'done' ? 'false' : 'true'} />
              <button type="submit" className="mt-0.5 text-ocean-600" aria-label={t.status === 'done' ? `Mark “${t.title}” as not done` : `Mark “${t.title}” as done`}>
                {t.status === 'done' ? <CheckCircle2 className="size-5" /> : <Circle className="size-5" />}
              </button>
            </ActionForm>
          ) : t.status === 'done' ? (
            <CheckCircle2 className="mt-0.5 size-5 text-ocean-600" aria-hidden="true" />
          ) : (
            <Circle className="mt-0.5 size-5 text-ink/30" aria-hidden="true" />
          )}
          <div>
            <p className={`text-sm font-medium ${t.status === 'done' ? 'text-ink/45 line-through' : ''}`}>{t.title}</p>
            {t.description ? <p className="text-xs text-ink/60">{t.description}</p> : null}
            {t.dueAt && t.status !== 'done' ? <p className="text-xs text-ink/50">Requested by {formatDate(t.dueAt)}</p> : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
