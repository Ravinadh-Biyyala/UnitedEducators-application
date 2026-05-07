import type { UnderwriterPerformance } from '@/shared/types/teamPerformance';
import { formatHitRatio }    from '@/shared/utils/formatHitRatio';
import { formatDaysToQuote } from '@/shared/utils/formatDaysToQuote';
import { colors, fonts, teamPerfDims, teamPerfStatStyles, daysToQuoteThreshold } from '@/theme/tokens';
import { Avatar } from '@/components/domain/Avatar';

interface TeamPerformanceRowProps {
  underwriter: UnderwriterPerformance;
  isLast?:     boolean;
}

const colStyle: React.CSSProperties = {
  width:      teamPerfDims.columnWidth,
  flexShrink: 0,
  display:    'flex',
  alignItems: 'center',
  fontFamily: fonts.sans,
};

export function TeamPerformanceRow({ underwriter: u, isLast }: TeamPerformanceRowProps) {
  const dtqColor = u.daysToQuote < daysToQuoteThreshold.fastUnder
    ? daysToQuoteThreshold.fastColor
    : daysToQuoteThreshold.slowColor;

  return (
    <div
      style={{
        display:      'flex',
        height:       teamPerfDims.rowHeight,
        paddingLeft:  20,
        borderBottom: isLast ? 'none' : `1px solid ${colors.borderDefault}`,
        background:   colors.bgSurface,
      }}
    >
      {/* Underwriter column */}
      <div style={{ ...colStyle, gap: teamPerfDims.avatarGap }}>
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

      {/* In Review */}
      <div style={colStyle}>
        <span style={{ fontSize: teamPerfDims.statFontSize, fontWeight: 700, color: teamPerfStatStyles.inReview.color }}>
          {u.inReview}
        </span>
      </div>

      {/* Quoted */}
      <div style={colStyle}>
        <span style={{ fontSize: teamPerfDims.statFontSize, fontWeight: 700, color: teamPerfStatStyles.quoted.color }}>
          {u.quoted}
        </span>
      </div>

      {/* Bound */}
      <div style={colStyle}>
        <span style={{ fontSize: teamPerfDims.statFontSize, fontWeight: 700, color: teamPerfStatStyles.bound.color }}>
          {u.bound}
        </span>
      </div>

      {/* Hit Ratio — always textHeading, never threshold-colored */}
      <div style={colStyle}>
        <span style={{ fontSize: teamPerfDims.scoreFontSize, fontWeight: 700, color: colors.textHeading }}>
          {formatHitRatio(u.hitRatioPct)}
        </span>
      </div>

      {/* Days to Quote — threshold-colored */}
      <div style={colStyle}>
        <span style={{ fontSize: teamPerfDims.scoreFontSize, fontWeight: 600, color: dtqColor }}>
          {formatDaysToQuote(u.daysToQuote)}
        </span>
      </div>
    </div>
  );
}
