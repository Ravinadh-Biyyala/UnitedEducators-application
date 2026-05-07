import { colors } from '@/theme/tokens';

interface Props {
  count: number;
  hideWhenZero?: boolean;
}

export function CountBadge({ count, hideWhenZero = true }: Props) {
  if (count === 0 && hideWhenZero) return null;
  return (
    <span
      style={{
        display:      'inline-flex',
        alignItems:   'center',
        justifyContent: 'center',
        height:       12,
        minWidth:     14,
        padding:      '0 4px',
        background:   colors.dangerRed,
        color:        '#ffffff',
        fontSize:     9,
        fontWeight:   700,
        borderRadius: 10,
        lineHeight:   1,
      }}
    >
      {count}
    </span>
  );
}
