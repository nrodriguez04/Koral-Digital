import { CheckCircle2, Circle } from 'lucide-react';
import { setTaskStatus } from '@/app/app/tasks/actions';
import { formatDate } from '@/lib/utils';
import { ActionForm } from './action-form';
import { StatusBadge } from './status-badge';

type T = { id: string; title: string; status: string; dueAt: Date | null; priority: string; clientVisible?: boolean };

export function TaskList({ tasks, editable }: { tasks: T[]; editable: boolean }) {
  if (!tasks.length) return <p className="px-5 py-4 text-sm text-ink/50">No tasks yet.</p>;
  return (
    <ul className="divide-y divide-ink/6">
      {tasks.map((t) => {
        const overdue = t.status === 'open' && t.dueAt && t.dueAt < new Date();
        return (
          <li key={t.id} className="flex items-start gap-3 px-5 py-3">
            {editable ? (
              <ActionForm action={setTaskStatus} hideSubmit inline>
                <input type="hidden" name="taskId" value={t.id} />
                <input type="hidden" name="status" value={t.status === 'done' ? 'open' : 'done'} />
                <button type="submit" aria-label={t.status === 'done' ? `Reopen ${t.title}` : `Complete ${t.title}`} className="mt-0.5 text-ocean-600 hover:text-ocean-700">
                  {t.status === 'done' ? <CheckCircle2 className="size-5" /> : <Circle className="size-5" />}
                </button>
              </ActionForm>
            ) : t.status === 'done' ? (
              <CheckCircle2 className="mt-0.5 size-5 text-ocean-600" aria-hidden="true" />
            ) : (
              <Circle className="mt-0.5 size-5 text-ink/30" aria-hidden="true" />
            )}
            <div className="min-w-0 flex-1">
              <p className={`text-sm ${t.status === 'done' ? 'text-ink/45 line-through' : 'text-ink'}`}>{t.title}</p>
              <p className={`text-xs ${overdue ? 'font-semibold text-red-600' : 'text-ink/50'}`}>
                {t.dueAt ? `${overdue ? 'Overdue · ' : 'Due '}${formatDate(t.dueAt)}` : 'No due date'}
                {t.clientVisible ? ' · Client-visible' : ''}
              </p>
            </div>
            {t.priority !== 'normal' ? <StatusBadge status={t.priority} /> : null}
          </li>
        );
      })}
    </ul>
  );
}
