import { AlertCircle, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import type { ReactNode } from 'react';
import { alertStyles } from '@/theme/tokens';

type AlertVariant = 'warning' | 'info' | 'error' | 'success';

interface AlertProps {
  variant:  AlertVariant;
  children: ReactNode;
}

// Fallback styles for success/info derived from existing palette neighbours.
// Same shape as alertStyles.warning / alertStyles.error so the renderer
// doesn't branch.
const FALLBACK_STYLES: Record<'success' | 'info', typeof alertStyles.warning> = {
  success: {
    ...alertStyles.warning,
    bg:        '#E8F5EC',
    border:    '#93C8A0',
    iconColor: '#1A5C30',
    textColor: '#1A5C30',
  },
  info: {
    ...alertStyles.warning,
    bg:        '#E7EDFF',
    border:    '#B5C5F7',
    iconColor: '#0123D4',
    textColor: '#0E2D9E',
  },
};

const ICONS = {
  warning: AlertTriangle,
  error:   AlertCircle,
  success: CheckCircle,
  info:    Info,
} as const;

export function Alert({ variant, children }: AlertProps) {
  const s = variant === 'warning' || variant === 'error'
    ? alertStyles[variant]
    : FALLBACK_STYLES[variant];
  const Icon = ICONS[variant];
  // Errors are urgent; everything else is polite.
  const ariaLive = variant === 'error' ? 'assertive' : 'polite';

  return (
    <div
      role="alert"
      aria-live={ariaLive}
      aria-atomic="true"
      className="flex items-start"
      style={{
        gap:             s.iconGap,
        paddingLeft:     s.paddingX,
        paddingRight:    s.paddingX,
        paddingTop:      s.paddingY,
        paddingBottom:   s.paddingY,
        backgroundColor: s.bg,
        border:          `${s.borderWidth}px solid ${s.border}`,
      }}
    >
      <Icon
        size={s.iconSize}
        color={s.iconColor}
        aria-hidden
        style={{ flexShrink: 0, marginTop: 2 }}
      />
      <div
        style={{
          fontSize:   s.bodySize,
          lineHeight: `${s.bodyLineHeight}px`,
          fontWeight: s.bodyWeight,
          color:      s.textColor,
        }}
      >
        {children}
      </div>
    </div>
  );
}
