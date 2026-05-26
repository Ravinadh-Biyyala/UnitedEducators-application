import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { UnderwriterPerformance } from '@/shared/types/teamPerformance';
import { formatHitRatio }    from '@/shared/utils/formatHitRatio';
import { formatDaysToQuote } from '@/shared/utils/formatDaysToQuote';
import { colors, fonts, teamPerfDims, teamPerfStatStyles, daysToQuoteThreshold } from '@/theme/tokens';
import { Avatar } from '@/components/domain/Avatar';

interface TeamPerformanceRowProps {
  underwriter: UnderwriterPerformance;
  isLast?:     boolean;
}

const cellStyle: React.CSSProperties = {
  verticalAlign: 'middle',
  fontFamily:    fonts.sans,
};

export function TeamPerformanceRow({ underwriter: u, isLast }: TeamPerformanceRowProps) {
  const isFast = u.daysToQuote < daysToQuoteThreshold.fastUnder;
  const dtqColor = isFast ? daysToQuoteThreshold.fastColor : daysToQuoteThreshold.slowColor;
  const dtqLabel = isFast ? 'On track' : 'Above target';
  const DtqIcon = isFast ? CheckCircle2 : AlertTriangle;

  return (
    <tr
      style={{
        height:       teamPerfDims.rowHeight,
        borderBottom: isLast ? 'none' : `1px solid ${colors.borderDefault}`,
        background:   colors.bgSurface,
      }}
    >
      {/* Underwriter */}
      <th
        scope="row"
        style={{
          ...cellStyle,
          paddingLeft: 20,
          textAlign:   'left',
          fontWeight:  600,
        }}
      >
        <div className="inline-flex items-center" style={{ gap: teamPerfDims.avatarGap }}>
          <Avatar name={u.name} role={u.role} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ fontSize: teamPerfDims.nameFontSize, fontWeight: 600, color: colors.textHeading }}>
              {u.name}
            </span>
            <span style={{ fontSize: teamPerfDims.roleLabelFontSize, fontWeight: 400, color: colors.textMuted }}>
              {u.roleLabel}
            </span>
          </div>
        </div>
      </th>

      <td style={cellStyle}>
        <span
          className="tabular-nums"
          style={{ fontSize: teamPerfDims.statFontSize, fontWeight: 700, color: teamPerfStatStyles.inReview.color }}
        >
          {u.inReview}
        </span>
      </td>
      <td style={cellStyle}>
        <span
          className="tabular-nums"
          style={{ fontSize: teamPerfDims.statFontSize, fontWeight: 700, color: teamPerfStatStyles.quoted.color }}
        >
          {u.quoted}
        </span>
      </td>
      <td style={cellStyle}>
        <span
          className="tabular-nums"
          style={{ fontSize: teamPerfDims.statFontSize, fontWeight: 700, color: teamPerfStatStyles.bound.color }}
        >
          {u.bound}
        </span>
      </td>
      <td style={cellStyle}>
        <span
          className="tabular-nums"
          style={{ fontSize: teamPerfDims.scoreFontSize, fontWeight: 700, color: colors.textHeading }}
        >
          {formatHitRatio(u.hitRatioPct)}
        </span>
      </td>
      <td style={cellStyle}>
        <span
          aria-label={`${dtqLabel}: ${formatDaysToQuote(u.daysToQuote)}`}
          className="inline-flex items-center gap-1 tabular-nums"
          style={{ fontSize: teamPerfDims.scoreFontSize, fontWeight: 600, color: dtqColor }}
        >
          <DtqIcon size={12} aria-hidden />
          {formatDaysToQuote(u.daysToQuote)}
        </span>
      </td>
    </tr>
  );
}
