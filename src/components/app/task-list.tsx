import { CheckCircle2, Circle } from 'lucide-react';
import { setTaskStatus } from '@/app/app/tasks/actions';
import { formatDate } from '@/lib/utils';
import { ActionForm } from './action-form';
import { StatusBadge } from './status-badge';

type T = {
  id: string;
  title: string;
  status: string;
  dueAt: Date | null;
  priority: string;
  clientVisible?: boolean;
};

export function TaskList({ tasks, editable }: { tasks: T[]; editable: boolean }) {
  if (!tasks.length) return <p className="text-ink/50 px-5 py-4 text-sm">No tasks yet.</p>;
  return (
    <ul className="divide-ink/6 divide-y">
      {tasks.map((t) => {
        const overdue = t.status === 'open' && t.dueAt && t.dueAt < new Date();
        return (
          <li key={t.id} className="flex items-start gap-3 px-5 py-3">
            {editable ? (
              <ActionForm action={setTaskStatus} hideSubmit inline>
                <input type="hidden" name="taskId" value={t.id} />
                <input type="hidden" name="status" value={t.status === 'done' ? 'open' : 'done'} />
                <button
                  type="submit"
                  aria-label={t.status === 'done' ? `Reopen ${t.title}` : `Complete ${t.title}`}
                  className="text-ocean-600 hover:text-ocean-700 mt-0.5"
                >
                  {t.status === 'done' ? <CheckCircle2 className="size-5" /> : <Circle className="size-5" />}
                </button>
              </ActionForm>
            ) : t.status === 'done' ? (
              <CheckCircle2 className="text-ocean-600 mt-0.5 size-5" aria-hidden="true" />
            ) : (
              <Circle className="text-ink/30 mt-0.5 size-5" aria-hidden="true" />
            )}
            <div className="min-w-0 flex-1">
              <p className={`text-sm ${t.status === 'done' ? 'text-ink/45 line-through' : 'text-ink'}`}>
                {t.title}
              </p>
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
