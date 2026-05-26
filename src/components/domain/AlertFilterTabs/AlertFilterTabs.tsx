import type { AlertFilter } from '@/shared/types';
import { alertFilterStyles, fonts } from '@/theme/tokens';

interface AlertFilterTabsProps {
  activeFilter:   AlertFilter;
  onFilterChange: (next: AlertFilter) => void;
}

const TABS: { label: string; value: AlertFilter }[] = [
  { label: 'All',      value: 'all'      },
  { label: 'Critical', value: 'critical' },
  { label: 'Warning',  value: 'warning'  },
];

export function AlertFilterTabs({ activeFilter, onFilterChange }: AlertFilterTabsProps) {
  return (
    <div role="group" aria-label="Alert filter" style={{ display: 'flex', gap: 4 }}>
      {TABS.map(({ label, value }) => {
        const active = activeFilter === value;
        const s = active ? alertFilterStyles.active : alertFilterStyles.inactive;
        return (
          <button
            key={value}
            type="button"
            aria-pressed={active}
            aria-label={`Show ${label.toLowerCase()} alerts`}
            onClick={() => onFilterChange(value)}
            className="ring-custom focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-vivid"
            style={{
              height:       24,
              padding:      '1px 8px',
              fontSize:     11,
              fontWeight:   700,
              background:   s.bg,
              border:       `1px solid ${s.border}`,
              borderRadius: 0,
              color:        s.text,
              cursor:       'pointer',
              fontFamily:   fonts.sans,
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
