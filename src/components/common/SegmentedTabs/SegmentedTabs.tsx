import type { ReactNode } from 'react';
import { colors, fonts } from '@/theme/tokens';

interface Tab<T extends string> {
  value: T;
  label: string;
  rightSlot?: ReactNode;
}

interface Props<T extends string> {
  tabs: ReadonlyArray<Tab<T>>;
  activeValue: T;
  onChange: (value: T) => void;
  size?: 'sm' | 'md';
}

export function SegmentedTabs<T extends string>({
  tabs,
  activeValue,
  onChange,
  size = 'md',
}: Props<T>) {
  const height  = size === 'sm' ? 24 : 31;
  const fontSize = size === 'sm' ? 10 : 12;
  const fontWeight = size === 'sm' ? 700 : 600;

  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {tabs.map((tab) => {
        const active = activeValue === tab.value;
        return (
          <button
            key={tab.value}
            onClick={() => onChange(tab.value)}
            style={{
              display:      'inline-flex',
              alignItems:   'center',
              gap:          4,
              height,
              padding:      '1px 10px',
              fontSize,
              fontWeight,
              background:   active ? colors.brandBlue : '#ffffff',
              color:        active ? '#ffffff' : colors.textMuted,
              border:       `1px solid ${active ? colors.brandBlue : colors.borderStrong}`,
              borderRadius: 0,
              cursor:       'pointer',
              fontFamily:   fonts.sans,
              whiteSpace:   'nowrap',
            }}
          >
            {tab.label}
            {tab.rightSlot}
          </button>
        );
      })}
    </div>
  );
}
