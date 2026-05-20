import type { ReactNode } from 'react';
import { labelValueRowStyles as s } from '@/theme/tokens';

interface LabelValueRowProps {
  label: string;
  value: ReactNode;
}

export function LabelValueRow({ label, value }: LabelValueRowProps) {
  return (
    <div className="flex items-baseline justify-between" style={{ gap: 12 }}>
      <span
        style={{
          fontSize:      s.labelSize,
          lineHeight:    `${s.labelLineHeight}px`,
          fontWeight:    s.labelWeight,
          letterSpacing: s.labelLetterSpacing,
          textTransform: 'uppercase',
          color:         s.labelColor,
          flexShrink:    0,
        }}
      >
        {label}
      </span>
      <span
        className="text-right"
        style={{
          fontSize:   s.valueSize,
          lineHeight: `${s.valueLineHeight}px`,
          fontWeight: s.valueWeight,
          color:      s.valueColor,
          minWidth:   0,
        }}
      >
        {value}
      </span>
    </div>
  );
}
