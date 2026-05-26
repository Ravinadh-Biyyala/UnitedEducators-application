import { requiredFieldsCounterStyles as s } from '@/theme/tokens';

interface RequiredFieldsCounterProps {
  completed: number;
  total:     number;
}

export function RequiredFieldsCounter({ completed, total }: RequiredFieldsCounterProps) {
  return (
    <span
      className="inline-flex items-baseline"
      role="status"
      aria-live="polite"
      aria-atomic="true"
      aria-label={`${completed} of ${total} required fields completed`}
    >
      <span
        aria-hidden
        style={{
          fontSize:   s.completedSize,
          lineHeight: `${s.completedLineHeight}px`,
          fontWeight: s.completedWeight,
          color:      s.completedColor,
        }}
      >
        {completed}
      </span>
      <span
        aria-hidden
        style={{
          fontSize:   s.totalSize,
          lineHeight: `${s.totalLineHeight}px`,
          fontWeight: s.totalWeight,
          color:      s.totalColor,
        }}
      >
        {s.separatorChar}
        {total}
      </span>
    </span>
  );
}
