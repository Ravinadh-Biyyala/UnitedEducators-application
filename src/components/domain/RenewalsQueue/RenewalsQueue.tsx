import { AlertOctagon, AlertTriangle, Calendar, ChevronRight } from 'lucide-react';

export type RenewalStatus =
  | 'Not Started'
  | 'In Progress'
  | 'Quoted'
  | 'Bound'
  | 'At Risk'
  | 'Lost';

export interface RenewalRow {
  id: string;
  /** Member / account name — primary operational data point. */
  memberName: string;
  /** Target effective date as a human-readable label, e.g. "May 30, 2026". */
  targetEffectiveDate: string;
  /** Signed days until the policy expires (negative = overdue). */
  daysUntilExpiry: number;
  /** Loss ratio as a whole-number percent (e.g. 118). */
  lossRatio: number;
  status: RenewalStatus;
  premium: string;
  product: string;
  assignee: string;
  broker: string;
  onOpen?: () => void;
}

/**
 * Critical stop flag — when present, dominates the card.
 * Order matters: the first matching flag wins for "primary" display.
 */
type StopFlag = {
  key: 'loss-ratio' | 'overdue' | 'at-risk';
  label: string;
  detail: string;
};

function getStopFlags(r: RenewalRow): StopFlag[] {
  const flags: StopFlag[] = [];
  if (r.lossRatio >= 100) {
    flags.push({
      key: 'loss-ratio',
      label: 'Escalated Loss Ratio',
      detail: `${r.lossRatio}% — exceeds 100% threshold`,
    });
  }
  if (r.daysUntilExpiry < 0) {
    flags.push({
      key: 'overdue',
      label: 'Overdue',
      detail: `Expired ${Math.abs(r.daysUntilExpiry)}d ago`,
    });
  }
  if (r.status === 'At Risk') {
    flags.push({
      key: 'at-risk',
      label: 'At Risk',
      detail: 'Retention is in jeopardy',
    });
  }
  return flags;
}

/**
 * Priority sort:
 *   1. Has any critical stop flag → top.
 *   2. Within that group, fewest days until expiry first.
 *   3. Within non-critical, highest loss ratio first, then by days.
 */
export function sortRenewals(rows: RenewalRow[]): RenewalRow[] {
  return [...rows].sort((a, b) => {
    const aCrit = getStopFlags(a).length > 0;
    const bCrit = getStopFlags(b).length > 0;
    if (aCrit !== bCrit) return aCrit ? -1 : 1;
    if (aCrit && bCrit) return a.daysUntilExpiry - b.daysUntilExpiry;
    if (a.lossRatio !== b.lossRatio) return b.lossRatio - a.lossRatio;
    return a.daysUntilExpiry - b.daysUntilExpiry;
  });
}

const STATUS_TAG: Record<RenewalStatus, string> = {
  'Not Started': 'text-slate-600 bg-slate-100',
  'In Progress': 'text-indigo-700 bg-indigo-50',
  Quoted: 'text-amber-700 bg-amber-50',
  Bound: 'text-emerald-700 bg-emerald-50',
  'At Risk': 'text-rose-700 bg-rose-50',
  Lost: 'text-slate-500 bg-slate-100',
};

interface RenewalsQueueProps {
  rows: RenewalRow[];
  /** Optional empty-state message. */
  emptyLabel?: string;
}

export function RenewalsQueue({ rows, emptyLabel = 'No renewals match the current filters.' }: RenewalsQueueProps) {
  const sorted = sortRenewals(rows);

  if (sorted.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-10 text-center text-xs font-medium text-slate-500">
        {emptyLabel}
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {sorted.map((row) => (
        <RenewalCard key={row.id} row={row} />
      ))}
    </ul>
  );
}

function RenewalCard({ row }: { row: RenewalRow }) {
  const flags = getStopFlags(row);
  const primaryFlag = flags[0];
  const isCritical = flags.length > 0;

  // Critical rows wear a hard left rail + tinted background. Healthy rows are quiet.
  const railClass = isCritical ? 'border-l-4 border-rose-600' : 'border-l-4 border-transparent';
  const bgClass = isCritical ? 'bg-rose-50/40' : 'bg-white';

  return (
    <li>
      <button
        type="button"
        onClick={row.onOpen}
        disabled={!row.onOpen}
        className={`group w-full text-left rounded-lg border border-slate-200 shadow-sm transition-colors hover:border-slate-300 disabled:cursor-default ${bgClass} ${railClass}`}
      >
        <div className="flex flex-col gap-3 p-4 sm:p-5">
          {/* CRITICAL STOP FLAG — dominates the card real estate when present */}
          {primaryFlag && (
            <div className="flex items-start gap-3 rounded-md bg-rose-100/70 border border-rose-200 px-3 py-2">
              <AlertOctagon size={18} className="shrink-0 text-rose-700 mt-0.5" aria-hidden />
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-bold uppercase tracking-wider text-rose-700">
                  {primaryFlag.label}
                </span>
                <span className="text-xs font-medium text-rose-700/90">{primaryFlag.detail}</span>
                {flags.length > 1 && (
                  <span className="text-xs font-medium text-rose-700/70 mt-1">
                    + {flags.length - 1} more {flags.length - 1 === 1 ? 'signal' : 'signals'}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* PRIMARY OPERATIONAL DATA — Member name + target effective date, bold + dominant */}
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex flex-col">
              <span className="text-base font-semibold text-slate-900 truncate">{row.memberName}</span>
              <div className="flex items-center gap-2 mt-1">
                <Calendar size={13} className="text-slate-400" aria-hidden />
                <span className="text-base font-semibold text-slate-900 tabular-nums">
                  {row.targetEffectiveDate}
                </span>
                <DaysHint days={row.daysUntilExpiry} />
              </div>
            </div>

            {/* Status pill — small, low contrast unless At Risk / Lost (which is already in the stop flag) */}
            <span
              className={`shrink-0 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_TAG[row.status]}`}
            >
              {row.status}
            </span>
          </div>

          {/* BACKGROUND METADATA — plain key-value text lines, NO container borders, low contrast */}
          <dl className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-1">
            <MetaLine label="Premium" value={row.premium} />
            <MetaLine label="Product" value={row.product} />
            <MetaLine label="Assignee" value={row.assignee} />
            <MetaLine label="Broker" value={row.broker} />
          </dl>
        </div>

        {row.onOpen && (
          <div className="px-4 sm:px-5 pb-3 flex justify-end">
            <ChevronRight
              size={14}
              className="text-slate-400 group-hover:text-slate-700 transition-colors"
              aria-hidden
            />
          </div>
        )}
      </button>
    </li>
  );
}

function DaysHint({ days }: { days: number }) {
  if (days < 0) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700">
        <AlertOctagon size={11} aria-hidden />
        {Math.abs(days)}d overdue
      </span>
    );
  }
  if (days <= 14) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700">
        <AlertTriangle size={11} aria-hidden />
        {days}d remaining
      </span>
    );
  }
  return <span className="text-xs font-medium text-slate-500">{days}d remaining</span>;
}

function MetaLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-1.5 min-w-0">
      <dt className="text-xs font-medium text-slate-500 shrink-0">{label}:</dt>
      <dd className="text-xs font-medium text-slate-700 truncate">{value}</dd>
    </div>
  );
}
