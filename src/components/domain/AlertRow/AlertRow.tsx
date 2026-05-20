import type { Alert } from '@/shared/types';
import { alertRowDims, alertSeverityStyles, colors, fonts } from '@/theme/tokens';

interface AlertRowProps {
  alert:            Alert;
  displayTimestamp: string;
}

export function AlertRow({ alert, displayTimestamp }: AlertRowProps) {
  const s = alertSeverityStyles[alert.severity];

  return (
    <div
      style={{
        height:      alertRowDims.height,
        background:  s.bg,
        borderLeft:  `${alertRowDims.borderWidth}px solid ${s.border}`,
        borderBottom: `1px solid ${colors.borderDefault}`,
        boxSizing:   'border-box',
        padding:     alertRowDims.bodyPadding,
        display:     'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap:         alertRowDims.contentGap,
        fontFamily:  fonts.sans,
      }}
    >
      {/* Line 1: title + timestamp */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: s.titleColor }}>
          {alert.title}
        </span>
        <span style={{ fontSize: 10, fontWeight: 400, color: colors.textMuted }}>
          {displayTimestamp}
        </span>
      </div>

      {/* Line 2: body */}
      <span style={{ fontSize: 11, fontWeight: 400, color: colors.textBody }}>
        {alert.body}
      </span>

      {/* Line 3: submission reference — static styled text, NOT a link */}
      <span style={{ fontSize: 10, fontWeight: 700, color: colors.brandBlueDeep }}>
        {alert.submissionId} →
      </span>
    </div>
  );
}
