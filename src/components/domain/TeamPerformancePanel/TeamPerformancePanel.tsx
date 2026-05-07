import { Users } from 'lucide-react';
import type { UnderwriterPerformance } from '@/shared/types/teamPerformance';
import { colors, dims, fonts, teamPerfDims } from '@/theme/tokens';
import { CardShell } from '@/components/domain/CardShell';
import { TeamPerformanceRow } from '@/components/domain/TeamPerformanceRow';

interface TeamPerformancePanelProps {
  underwriters: UnderwriterPerformance[];
}

const COLUMN_HEADERS = ['UNDERWRITER', 'IN REVIEW', 'QUOTED', 'BOUND', 'HIT RATIO', 'DAYS TO QUOTE'] as const;

export function TeamPerformancePanel({ underwriters }: TeamPerformancePanelProps) {
  return (
    <CardShell
      title="TEAM PERFORMANCE"
      icon={<Users size={13} />}
      iconColor={colors.brandBlue}
      width={dims.teamPerfCardWidth}
    >
      {/* Column-headers row */}
      <div
        style={{
          display:      'flex',
          height:       teamPerfDims.headerRowHeight,
          paddingLeft:  20,
          background:   colors.bgMuted,
          borderBottom: `1px solid ${colors.borderDefault}`,
          fontFamily:   fonts.sans,
        }}
      >
        {COLUMN_HEADERS.map((label) => (
          <div
            key={label}
            style={{
              width:      teamPerfDims.columnWidth,
              flexShrink: 0,
              display:    'flex',
              alignItems: 'center',
              fontSize:   teamPerfDims.headerFontSize,
              fontWeight: 700,
              color:      colors.textMuted,
              textTransform: 'uppercase',
            }}
          >
            {label}
          </div>
        ))}
      </div>

      {/* Data rows */}
      {underwriters.length === 0 ? (
        <div
          style={{
            height:     teamPerfDims.rowHeight,
            display:    'flex',
            alignItems: 'center',
            fontSize:   12,
            fontWeight: 400,
            color:      colors.textMuted,
            fontFamily: fonts.sans,
          }}
        >
          No team performance data available.
        </div>
      ) : (
        underwriters.map((u, i) => (
          <TeamPerformanceRow
            key={u.id}
            underwriter={u}
            isLast={i === underwriters.length - 1}
          />
        ))
      )}
    </CardShell>
  );
}
