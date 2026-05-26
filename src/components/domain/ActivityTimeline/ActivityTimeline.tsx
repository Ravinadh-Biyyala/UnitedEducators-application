import { cn } from '@/lib/cn';

export type ActivityEntryKind = 'milestone' | 'routine';

export interface ActivityEntry {
  id:        string;
  kind:      ActivityEntryKind;
  title:     string;
  timestamp: string;
  actor?:    string;
  detail?:   string;
}

interface ActivityTimelineProps {
  entries:    ActivityEntry[];
  emptyLabel?: string;
  className?:  string;
}

export function ActivityTimeline({
  entries,
  emptyLabel = 'No activity yet.',
  className,
}: ActivityTimelineProps) {
  if (entries.length === 0) {
    return (
      <p className={cn('text-sm leading-relaxed text-slate-400 italic', className)}>
        {emptyLabel}
      </p>
    );
  }

  return (
    <ol className={cn('relative ml-2 border-l border-slate-200', className)}>
      {entries.map((entry) => (
        <TimelineRow key={entry.id} entry={entry} />
      ))}
    </ol>
  );
}

function TimelineRow({ entry }: { entry: ActivityEntry }) {
  const isMilestone = entry.kind === 'milestone';

  return (
    <li className="relative pl-4 pb-5 last:pb-0">
      <span
        aria-hidden="true"
        className={cn(
          'absolute -left-1.5 top-1.5 inline-block rounded-full',
          isMilestone
            ? 'h-2.5 w-2.5 bg-blue-600 ring-4 ring-blue-50'
            : 'h-1.5 w-1.5 bg-slate-300',
        )}
      />
      <div className="flex flex-col gap-0.5">
        <span
          className={cn(
            'text-sm leading-relaxed',
            isMilestone ? 'font-semibold text-slate-900' : 'font-medium text-slate-600',
          )}
        >
          {entry.title}
        </span>
        {entry.detail && (
          <span className="text-xs leading-relaxed text-slate-500">{entry.detail}</span>
        )}
        <span className="text-xs text-slate-400">
          {entry.timestamp}
          {entry.actor ? ` · ${entry.actor}` : ''}
        </span>
      </div>
    </li>
  );
}
