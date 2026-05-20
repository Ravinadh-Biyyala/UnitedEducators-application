import type { ReactNode } from 'react';
import { colors, cardDims, fonts } from '@/theme/tokens';

interface CardShellProps {
  title: string;
  icon: ReactNode;
  width?: number;
  iconColor?: string;
  headerRight?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}

export interface CardFooterProps {
  left: ReactNode;
  right?: ReactNode;
}

export function CardFooter({ left, right }: CardFooterProps) {
  return (
    <div
      style={{
        display:        'flex',
        justifyContent: 'space-between',
        alignItems:     'center',
        minHeight:      cardDims.footerHeight,
        background:     colors.bgMuted,
        borderTop:      `1px solid ${colors.borderDefault}`,
        padding:        cardDims.footerPadding,
      }}
    >
      <span style={{ fontSize: 11, color: colors.textMuted, fontFamily: fonts.sans }}>
        {left}
      </span>
      {right && (
        <span style={{ fontSize: 11, fontWeight: 600, color: colors.brandBlueDeep, fontFamily: fonts.sans }}>
          {right}
        </span>
      )}
    </div>
  );
}

export function CardShell({ title, icon, width, iconColor = colors.brandBlue, headerRight, footer, children }: CardShellProps) {
  return (
    <div
      style={{
        width,
        background:   colors.bgSurface,
        border:       `1px solid ${colors.borderStrong}`,
        borderRadius: 0,
        display:      'flex',
        flexDirection:'column',
        fontFamily:   fonts.sans,
      }}
    >
      {/* Header */}
      <div
        style={{
          display:        'flex',
          justifyContent: 'space-between',
          alignItems:     'center',
          minHeight:      cardDims.headerHeight,
          background:     colors.bgMuted,
          borderBottom:   `1px solid ${colors.borderDefault}`,
          padding:        cardDims.headerPadding,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ display: 'flex', alignItems: 'center', color: iconColor }}>{icon}</span>
          <span
            style={{
              fontSize:      12,
              fontWeight:    700,
              color:         colors.brandBlue,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            {title}
          </span>
        </div>
        {headerRight}
      </div>

      {/* Body */}
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
        {children}
      </div>

      {/* Footer */}
      {footer}
    </div>
  );
}
