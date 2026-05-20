import { AlertTriangle, ArrowUpRight } from 'lucide-react';
import type { Alert, AlertFilter } from '@/shared/types';
import { alertRowDims, cardDims, colors, dims, fonts } from '@/theme/tokens';
import { CardShell } from '@/components/domain/CardShell';
import { AlertRow } from '@/components/domain/AlertRow';
import { AlertFilterTabs } from '@/components/domain/AlertFilterTabs';

interface AlertsPanelProps {
  alerts:             Alert[];
  alertTimestamps:    Record<string, string>;
  activeFilter:       AlertFilter;
  onFilterChange:     (next: AlertFilter) => void;
  totalCriticalCount: number;
  totalWarningCount:  number;
  onViewAllClick?:    () => void;
}

export function AlertsPanel({
  alerts,
  alertTimestamps,
  activeFilter,
  onFilterChange,
  totalCriticalCount,
  totalWarningCount,
  onViewAllClick,
}: AlertsPanelProps) {
  return (
    <CardShell
      title="ALERTS & FLAGS"
      icon={<AlertTriangle size={13} />}
      iconColor={colors.accentGold}
      headerRight={
        <AlertFilterTabs activeFilter={activeFilter} onFilterChange={onFilterChange} />
      }
      footer={
        <div
          style={{
            display:        'flex',
            justifyContent: 'space-between',
            alignItems:     'center',
            minHeight:      cardDims.footerHeight,
            background:     colors.bgMuted,
            borderTop:      `1px solid ${colors.borderDefault}`,
            padding:        cardDims.footerPadding,
          }}
        >
          <span style={{ fontSize: 10, fontWeight: 400, color: colors.textMuted, fontFamily: fonts.sans }}>
            {totalCriticalCount} critical · {totalWarningCount} warnings
          </span>
          <button
            onClick={onViewAllClick}
            style={{
              display:    'flex',
              alignItems: 'center',
              gap:        4,
              fontSize:   10,
              fontWeight: 600,
              color:      colors.brandBlueDeep,
              background: 'none',
              border:     'none',
              cursor:     'pointer',
              fontFamily: fonts.sans,
              padding:    0,
            }}
          >
            View all
            <ArrowUpRight size={9} style={{ color: colors.brandBlueDeep }} aria-hidden />
          </button>
        </div>
      }
    >
      {alerts.length === 0 ? (
        <div
          style={{
            height:         alertRowDims.height,
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            fontSize:       12,
            fontWeight:     400,
            color:          colors.textMuted,
            fontFamily:     fonts.sans,
          }}
        >
          No alerts to show.
        </div>
      ) : (
        alerts.map((alert) => (
          <AlertRow
            key={alert.id}
            alert={alert}
            displayTimestamp={alertTimestamps[alert.id] ?? ''}
          />
        ))
      )}
    </CardShell>
  );
}
