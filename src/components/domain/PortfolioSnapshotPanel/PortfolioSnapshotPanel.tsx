import { Activity } from 'lucide-react';
import type { PortfolioStat, PortfolioStatKey } from '@/shared/types/portfolio';
import { colors, dims, fonts, statRowDims } from '@/theme/tokens';
import { CardShell } from '@/components/domain/CardShell';
import { StatRow } from '@/components/domain/StatRow';

interface PortfolioSnapshotPanelProps {
  stats:        PortfolioStat[];
  onStatClick?: (key: PortfolioStatKey) => void;
}

export function PortfolioSnapshotPanel({ stats, onStatClick }: PortfolioSnapshotPanelProps) {
  return (
    <CardShell
      title="PORTFOLIO SNAPSHOT"
      icon={<Activity size={13} color={colors.brandBlue} />}
      width={dims.rightColWidth}
    >
      <div style={{ padding: statRowDims.bodyPadding, fontFamily: fonts.sans }}>
        {stats.length === 0 ? (
          <div style={{ fontSize: 12, fontWeight: 400, color: colors.textMuted, padding: '10px 0' }}>
            No portfolio data available.
          </div>
        ) : (
          stats.map((stat, i) => (
            <StatRow
              key={stat.key}
              stat={stat}
              isLast={i === stats.length - 1}
              onClick={onStatClick}
            />
          ))
        )}
      </div>
    </CardShell>
  );
}
