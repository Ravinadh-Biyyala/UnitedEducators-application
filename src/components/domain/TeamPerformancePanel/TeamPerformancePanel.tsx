import { Users } from 'lucide-react';
import type { UnderwriterPerformance } from '@/shared/types/teamPerformance';
import { colors, fonts, teamPerfDims } from '@/theme/tokens';
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
    >
      <table
        style={{
          width:          '100%',
          borderCollapse: 'collapse',
          tableLayout:    'fixed',
          fontFamily:     fonts.sans,
        }}
      >
        <caption className="sr-only">Underwriter performance summary</caption>
        <colgroup>
          {COLUMN_HEADERS.map((label) => (
            <col key={label} style={{ width: teamPerfDims.columnWidth }} />
          ))}
        </colgroup>
        <thead>
          <tr
            style={{
              height:       teamPerfDims.headerRowHeight,
              background:   colors.bgMuted,
              borderBottom: `1px solid ${colors.borderDefault}`,
            }}
          >
            {COLUMN_HEADERS.map((label, i) => (
              <th
                key={label}
                scope="col"
                style={{
                  paddingLeft: i === 0 ? 20 : 0,
                  textAlign:   'left',
                  fontSize:    teamPerfDims.headerFontSize,
                  fontWeight:  700,
                  color:       colors.textMuted,
                }}
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {underwriters.length === 0 ? (
            <tr>
              <td
                colSpan={COLUMN_HEADERS.length}
                style={{
                  height:     teamPerfDims.rowHeight,
                  fontSize:   12,
                  fontWeight: 400,
                  color:      colors.textMuted,
                  paddingLeft: 20,
                }}
              >
                Team performance data will appear once underwriters log activity.
              </td>
            </tr>
          ) : (
            underwriters.map((u, i) => (
              <TeamPerformanceRow
                key={u.id}
                underwriter={u}
                isLast={i === underwriters.length - 1}
              />
            ))
          )}
        </tbody>
      </table>
    </CardShell>
  );
}
