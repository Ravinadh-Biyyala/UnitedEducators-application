import { Lock } from 'lucide-react';
import { cn } from '@/lib/cn';

export type SalesforceField =
  | 'memberIdentity'
  | 'brokerageFirm'
  | 'brokerContact'
  | 'quotedPremium';

export const SALESFORCE_FIELD_LABELS: Record<SalesforceField, string> = {
  memberIdentity: 'Member Identity',
  brokerageFirm:  'Brokerage Firm',
  brokerContact:  'Broker Contact',
  quotedPremium:  'Quoted Premium',
};

const SALESFORCE_TOOLTIP = 'Mastered in Salesforce — Read Only';

interface SalesforceInputGuardProps {
  field:    SalesforceField;
  value:    string;
  /** Optional label override; defaults to the canonical Salesforce field label. */
  label?:   string;
  /** Allow callers to extend the wrapper for layout, never to change the read-only treatment. */
  className?: string;
}

export function SalesforceInputGuard({
  field,
  value,
  label,
  className,
}: SalesforceInputGuardProps) {
  const resolvedLabel = label ?? SALESFORCE_FIELD_LABELS[field];

  return (
    <label className={cn('block', className)}>
      <span className="block text-xs font-medium text-slate-600">{resolvedLabel}</span>
      <div
        className="mt-1 flex items-center justify-between gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 cursor-not-allowed"
        title={SALESFORCE_TOOLTIP}
        aria-label={`${resolvedLabel} — ${SALESFORCE_TOOLTIP}`}
      >
        <input
          type="text"
          readOnly
          value={value}
          tabIndex={-1}
          aria-readonly="true"
          data-salesforce-field={field}
          className="min-w-0 flex-1 truncate border-0 bg-transparent text-sm text-slate-400 cursor-not-allowed outline-none focus:ring-0 selection:bg-transparent"
        />
        <Lock
          size={14}
          aria-hidden="true"
          className="shrink-0 text-slate-400"
        />
      </div>
    </label>
  );
}
