import { AlertTriangle, RefreshCw } from 'lucide-react';
import { colors, fonts } from '@/theme/tokens';

interface Props {
  panelName?: string;
  onRetry?:   () => void;
}

export function PanelErrorState({ panelName, onRetry }: Props) {
  return (
    <div
      style={{
        padding:         24,
        backgroundColor: colors.dangerRedBg,
        border:          `1px solid ${colors.dangerRedBorder}`,
        display:         'flex',
        flexDirection:   'column',
        gap:             12,
        alignItems:      'flex-start',
        fontFamily:      fonts.sans,
      }}
    >
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <AlertTriangle size={16} color={colors.dangerRed} />
        <span style={{ color: colors.dangerRedText, fontSize: 12, fontWeight: 700 }}>
          {panelName ? `${panelName} failed to load` : 'Panel failed to load'}
        </span>
      </div>
      <span style={{ color: colors.textBody, fontSize: 11, fontWeight: 400 }}>
        Something went wrong. The other panels are unaffected.
      </span>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            display:         'flex',
            alignItems:      'center',
            gap:             6,
            padding:         '6px 12px',
            backgroundColor: colors.bgSurface,
            border:          `1px solid ${colors.borderStrong}`,
            color:           colors.textBody,
            fontSize:        11,
            fontWeight:      600,
            cursor:          'pointer',
            fontFamily:      fonts.sans,
          }}
        >
          <RefreshCw size={11} />
          Retry
        </button>
      )}
    </div>
  );
}
