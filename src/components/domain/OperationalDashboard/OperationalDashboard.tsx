import { AlertOctagon, AlertTriangle, Clock, ArrowUpRight } from 'lucide-react';
import type { ReactNode } from 'react';

/**
 * Operational priority tiers. Lower number = higher urgency.
 * Tier 1: file is blocked — action required now.
 * Tier 2: file is moving but carries an underwriting risk signal.
 * Tier 3: passive status; nothing to do.
 */
export type OperationalTier = 1 | 2 | 3;

export interface OperationalItem {
  id: string;
  tier: OperationalTier;
  /** Short label of the blocker / signal, e.g. "Missing application" */
  signal: string;
  /** Subject of the work, e.g. "SUB-7829 · Riverside USD" */
  subject: string;
  /** Single-line operational context, e.g. "SLA breached 2d ago · Sarah M." */
  detail?: string;
  /** Quantified weight when present — drives intra-tier ordering (e.g. days overdue, loss ratio). */
  weight?: number;
  /** Click target for the row. Container wires this to navigation. */
  onOpen?: () => void;
}

interface OperationalDashboardProps {
  items: OperationalItem[];
  /** Optional empty-tier rendering (default: hide the section). */
  showEmptyTiers?: boolean;
}

interface TierMeta {
  title: string;
  caption: string;
  rowClasses: string;
  badgeClasses: string;
  icon: ReactNode;
  headingClasses: string;
}

const TIER_META: Record<OperationalTier, TierMeta> = {
  1: {
    title: 'Action Required / Blocked',
    caption: 'These files are stuck. Resolve before anything else moves.',
    rowClasses: 'text-rose-700 bg-rose-50 border-rose-200',
    badgeClasses: 'bg-rose-600 text-white',
    icon: <AlertOctagon size={14} aria-hidden />,
    headingClasses: 'text-rose-700',
  },
  2: {
    title: 'Underwriting Risk Signals',
    caption: 'Files moving forward but flagged for review.',
    rowClasses: 'text-amber-700 bg-amber-50/50 border-amber-200',
    badgeClasses: 'bg-amber-600 text-white',
    icon: <AlertTriangle size={14} aria-hidden />,
    headingClasses: 'text-amber-700',
  },
  3: {
    title: 'Informational Status',
    caption: 'Awareness only — no immediate action.',
    rowClasses: 'text-slate-600 bg-slate-100 border-transparent',
    badgeClasses: 'bg-slate-300 text-slate-700',
    icon: <Clock size={14} aria-hidden />,
    headingClasses: 'text-slate-500',
  },
};

/**
 * Priority-first sort: tier ascending (1 before 3), then weight descending
 * (largest blocker first within a tier), then signal alphabetical for stability.
 */
export function sortOperationalItems(items: OperationalItem[]): OperationalItem[] {
  return [...items].sort((a, b) => {
    if (a.tier !== b.tier) return a.tier - b.tier;
    const aw = a.weight ?? 0;
    const bw = b.weight ?? 0;
    if (aw !== bw) return bw - aw;
    return a.signal.localeCompare(b.signal);
  });
}

function groupByTier(items: OperationalItem[]): Record<OperationalTier, OperationalItem[]> {
  const sorted = sortOperationalItems(items);
  return {
    1: sorted.filter((i) => i.tier === 1),
    2: sorted.filter((i) => i.tier === 2),
    3: sorted.filter((i) => i.tier === 3),
  };
}

export function OperationalDashboard({ items, showEmptyTiers = false }: OperationalDashboardProps) {
  const grouped = groupByTier(items);
  const tiers: OperationalTier[] = [1, 2, 3];

  const blockedCount = grouped[1].length;

  return (
    <section
      aria-label="Action-required stream"
      className="rounded-lg border border-slate-200 bg-white shadow-sm"
    >
      <header className="flex items-center justify-between px-5 py-3 border-b border-slate-200">
        <div className="flex flex-col">
          <h2 className="text-sm font-semibold text-slate-900">Action-Required Stream</h2>
          <p className="text-xs font-medium text-slate-500">
            Sorted by operational urgency — top tier resolves first.
          </p>
        </div>
        {blockedCount > 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 border border-rose-200 px-2.5 py-1 text-xs font-semibold text-rose-700">
            <AlertOctagon size={11} aria-hidden />
            {blockedCount} blocked
          </span>
        )}
      </header>

      <div className="divide-y divide-slate-100">
        {tiers.map((tier) => {
          const tierItems = grouped[tier];
          if (tierItems.length === 0 && !showEmptyTiers) return null;
          const meta = TIER_META[tier];

          return (
            <div key={tier} className="px-5 py-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={meta.headingClasses}>{meta.icon}</span>
                  <h3 className={`text-xs font-bold ${meta.headingClasses}`}>
                    Tier {tier} · {meta.title}
                  </h3>
                  <span className="text-xs font-medium text-slate-400">· {tierItems.length}</span>
                </div>
                <p className="text-xs font-medium text-slate-500 hidden sm:block">{meta.caption}</p>
              </div>

              {tierItems.length === 0 ? (
                <p className="text-xs font-medium text-slate-400 italic">Nothing here.</p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {tierItems.map((item) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={item.onOpen}
                        disabled={!item.onOpen}
                        className={`group w-full flex items-center justify-between gap-4 rounded-md border px-3 py-2.5 text-left transition-colors hover:brightness-[0.98] disabled:cursor-default ${meta.rowClasses}`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span
                            className={`shrink-0 inline-flex items-center rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${meta.badgeClasses}`}
                          >
                            {item.signal}
                          </span>
                          <div className="min-w-0 flex flex-col">
                            <span className="text-sm font-semibold text-slate-900 truncate">
                              {item.subject}
                            </span>
                            {item.detail && (
                              <span className="text-xs font-medium text-slate-500 truncate">
                                {item.detail}
                              </span>
                            )}
                          </div>
                        </div>
                        {item.onOpen && (
                          <ArrowUpRight
                            size={14}
                            className="shrink-0 text-slate-400 group-hover:text-slate-700 transition-colors"
                            aria-hidden
                          />
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
