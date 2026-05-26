import { useEffect, useRef, useState } from 'react';
import { Bell, AlertOctagon, Info, X } from 'lucide-react';

/**
 * Severity dictates the section the notification renders in.
 * - 'blocker' → file is held up; user must resolve.
 * - 'info'    → passive activity log; FYI only.
 */
export type NotificationSeverity = 'blocker' | 'info';

export interface AppNotification {
  id: string;
  severity: NotificationSeverity;
  title: string;
  /** What's blocked / what happened. One short sentence. */
  description: string;
  /** Relative timestamp e.g. "2m ago". */
  timestamp: string;
  /** Optional subject identifier, e.g. "SUB-7829". */
  subject?: string;
  onOpen?: () => void;
}

interface NotificationIndicatorProps {
  notifications: AppNotification[];
  onDismiss?: (id: string) => void;
  onMarkAllRead?: () => void;
}

/**
 * Filters and partitions the inbound stream:
 *   - blockers   → "Requires Immediate Resolution"
 *   - info       → "Informational Activity Updates"
 * The bell badge counts ONLY blockers — that's the whole point.
 */
function partition(notifications: AppNotification[]) {
  return {
    blockers: notifications.filter((n) => n.severity === 'blocker'),
    info: notifications.filter((n) => n.severity === 'info'),
  };
}

export function NotificationIndicator({
  notifications,
  onDismiss,
  onMarkAllRead,
}: NotificationIndicatorProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close on outside click + Escape — standard popover ergonomics
  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClickOutside);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const { blockers, info } = partition(notifications);
  const blockerCount = blockers.length;

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        aria-label={`Notifications${blockerCount > 0 ? ` — ${blockerCount} require resolution` : ''}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="relative inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors"
        style={{ width: 38.6, height: 38.6 }}
      >
        <Bell size={17} aria-hidden />
        {blockerCount > 0 && (
          <span
            className="absolute inline-flex items-center justify-center rounded-full bg-rose-600 text-white font-extrabold"
            style={{
              width: 16,
              height: 16,
              top: 4.8,
              right: 4.8,
              fontSize: 8.8,
              lineHeight: 1,
            }}
            aria-hidden
          >
            {blockerCount > 9 ? '9+' : blockerCount}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Notifications"
          className="absolute right-0 top-[calc(100%+8px)] z-50 w-[380px] max-w-[calc(100vw-32px)] rounded-lg border border-slate-200 bg-white shadow-lg"
        >
          <header className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
            <div className="flex flex-col">
              <h2 className="text-sm font-semibold text-slate-900">Notifications</h2>
              <p className="text-xs font-medium text-slate-500">
                {blockerCount > 0
                  ? `${blockerCount} require${blockerCount === 1 ? 's' : ''} resolution`
                  : 'All clear — no blockers'}
              </p>
            </div>
            {onMarkAllRead && notifications.length > 0 && (
              <button
                type="button"
                onClick={onMarkAllRead}
                className="text-xs font-semibold text-indigo-700 hover:underline"
              >
                Mark all read
              </button>
            )}
          </header>

          <div className="max-h-[440px] overflow-y-auto">
            <Section
              title="Requires Immediate Resolution"
              caption="Items directly holding up an underwriting file."
              tone="blocker"
              items={blockers}
              onDismiss={onDismiss}
              emptyLabel="No blockers — your queue is clear."
            />
            <Section
              title="Informational Activity Updates"
              caption="Passive log history. No action required."
              tone="info"
              items={info}
              onDismiss={onDismiss}
              emptyLabel="No recent activity."
            />
          </div>
        </div>
      )}
    </div>
  );
}

interface SectionProps {
  title: string;
  caption: string;
  tone: NotificationSeverity;
  items: AppNotification[];
  emptyLabel: string;
  onDismiss?: (id: string) => void;
}

function Section({ title, caption, tone, items, emptyLabel, onDismiss }: SectionProps) {
  const isBlocker = tone === 'blocker';
  const headingClass = isBlocker ? 'text-rose-700' : 'text-slate-500';
  const Icon = isBlocker ? AlertOctagon : Info;

  return (
    <section className="border-b border-slate-100 last:border-b-0">
      <div className="px-4 pt-3 pb-2 sticky top-0 bg-white">
        <div className="flex items-center gap-2">
          <Icon size={13} className={headingClass} aria-hidden />
          <h3 className={`text-xs font-bold ${headingClass}`}>{title}</h3>
          <span className="text-xs font-medium text-slate-400">· {items.length}</span>
        </div>
        <p className="text-xs font-medium text-slate-500 mt-0.5">{caption}</p>
      </div>

      {items.length === 0 ? (
        <p className="px-4 py-3 text-xs font-medium text-slate-400 italic">{emptyLabel}</p>
      ) : (
        <ul className="flex flex-col">
          {items.map((n) => (
            <li
              key={n.id}
              className={`flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors ${
                isBlocker ? 'border-l-2 border-rose-600' : 'border-l-2 border-transparent'
              }`}
            >
              <button
                type="button"
                onClick={n.onOpen}
                disabled={!n.onOpen}
                className="flex-1 min-w-0 text-left disabled:cursor-default"
              >
                <div className="flex items-baseline gap-2">
                  <span
                    className={`text-sm font-semibold truncate ${
                      isBlocker ? 'text-slate-900' : 'text-slate-700'
                    }`}
                  >
                    {n.title}
                  </span>
                  {n.subject && (
                    <span className="text-xs font-medium text-slate-500 shrink-0">{n.subject}</span>
                  )}
                </div>
                <p className="text-xs font-medium text-slate-500 mt-0.5 truncate">{n.description}</p>
                <p className="text-xs font-medium text-slate-400 mt-1">{n.timestamp}</p>
              </button>
              {onDismiss && (
                <button
                  type="button"
                  aria-label={`Dismiss ${n.title}`}
                  onClick={() => onDismiss(n.id)}
                  className="shrink-0 rounded p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <X size={12} aria-hidden />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
