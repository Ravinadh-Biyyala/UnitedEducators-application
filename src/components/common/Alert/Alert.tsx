import { AlertCircle, AlertTriangle } from 'lucide-react';
import type { ReactNode } from 'react';
import { alertStyles } from '@/theme/tokens';

type AlertVariant = 'warning' | 'info' | 'error' | 'success';

interface AlertProps {
  variant:  AlertVariant;
  children: ReactNode;
}

export function Alert({ variant, children }: AlertProps) {
  if (variant !== 'warning' && variant !== 'error') {
    throw new Error(
      `Alert variant "${variant}" is not yet implemented. Only "warning" and "error" are supported.`,
    );
  }
  const s = alertStyles[variant];
  const Icon = variant === 'error' ? AlertCircle : AlertTriangle;
  return (
    <div
      role="alert"
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
