import type { Alert } from '@/shared/types';
import { alertRowDims, alertSeverityStyles, colors, fonts } from '@/theme/tokens';

interface AlertRowProps {
  alert:            Alert;
  displayTimestamp: string;
  onOpen?:          (alert: Alert) => void;
}

export function AlertRow({ alert, displayTimestamp, onOpen }: AlertRowProps) {
  const s = alertSeverityStyles[alert.severity];
  const interactive = !!onOpen;

  const rowStyle: React.CSSProperties = {
    height:         alertRowDims.height,
    background:     s.bg,
    borderLeft:     `${alertRowDims.borderWidth}px solid ${s.border}`,
    borderBottom:   `1px solid ${colors.borderDefault}`,
    boxSizing:      'border-box',
    padding:        alertRowDims.bodyPadding,
    display:        'flex',
    flexDirection:  'column',
    justifyContent: 'center',
    gap:            alertRowDims.contentGap,
    fontFamily:     fonts.sans,
    textAlign:      'left',
    width:          '100%',
    cursor:         interactive ? 'pointer' : 'default',
  };

  const body = (
    <>
      {/* Line 1: title + timestamp */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: s.titleColor }}>{alert.title}</span>
        <span style={{ fontSize: 10, fontWeight: 400, color: colors.textMuted }}>
          {displayTimestamp}
        </span>
      </div>

      {/* Line 2: body */}
      <span style={{ fontSize: 11, fontWeight: 400, color: colors.textBody }}>{alert.body}</span>

      {/* Line 3: submission reference */}
      <span style={{ fontSize: 10, fontWeight: 700, color: colors.brandBlueDeep }}>
        {alert.submissionId}
        {interactive && <span aria-hidden> →</span>}
      </span>
    </>
  );

  if (!interactive) {
    return <div style={rowStyle}>{body}</div>;
  }

  return (
    <button
      type="button"
      onClick={() => onOpen!(alert)}
      aria-label={`Alert: ${alert.title}, ${alert.submissionId}`}
      className="ring-custom focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-vivid hover:brightness-[0.98] transition-all"
      style={{ ...rowStyle, border: 'none', borderLeft: rowStyle.borderLeft, borderBottom: rowStyle.borderBottom }}
    >
      {body}
    </button>
  );
}
