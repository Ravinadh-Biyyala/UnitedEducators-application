import { priorityStyles } from '@/theme/tokens';
import type { SubmissionPriority } from '@/shared/types';

interface Props {
  priority: SubmissionPriority;
}

export function PriorityChip({ priority }: Props) {
  const s = priorityStyles[priority];
  return (
    <span
      style={{
        display:      'inline-block',
        padding:      '2px 8px',
        background:   s.bg,
        border:       `1px solid ${s.border}`,
        borderRadius: 0,
        fontSize:     11,
        fontWeight:   600,
        color:        s.text,
        whiteSpace:   'nowrap',
      }}
    >
      {priority}
    </span>
  );
}
