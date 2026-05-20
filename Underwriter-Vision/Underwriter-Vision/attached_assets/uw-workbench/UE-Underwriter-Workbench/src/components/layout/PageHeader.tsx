import type { ReactNode } from 'react';
import { colors, fonts } from '@/theme/tokens';

interface Props {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function PageHeader({ title, subtitle, action }: Props) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
      <div>
        <h1
          style={{
            fontSize:   26,
            fontWeight: 700,
            color:      colors.brandBlue,
            fontFamily: fonts.sans,
            margin:     0,
            lineHeight: 1.2,
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            style={{
              fontSize:   13,
              fontWeight: 400,
              color:      colors.textMuted,
              fontFamily: fonts.sans,
              marginTop:  4,
              marginBottom: 0,
            }}
          >
            {subtitle}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}
