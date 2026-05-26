import { AlertOctagon, AlertTriangle, Circle, Dot } from 'lucide-react';
import type { ComponentType } from 'react';
import { priorityStyles } from '@/theme/tokens';
import type { SubmissionPriority } from '@/shared/types';

interface Props {
  priority: SubmissionPriority;
}

// One distinct icon per priority so the signal isn't carried by colour alone.
const ICON: Record<SubmissionPriority, ComponentType<{ size?: number; 'aria-hidden'?: boolean }>> = {
  Critical: AlertOctagon,
  High:     AlertTriangle,
  Medium:   Circle,
  Low:      Dot,
};

export function PriorityChip({ priority }: Props) {
  const s = priorityStyles[priority];
  const Icon = ICON[priority];
  return (
    <span
      aria-label={`${priority} priority`}
      style={{
        display:      'inline-flex',
        alignItems:   'center',
        gap:          4,
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
      <Icon size={10} aria-hidden />
      {priority}
    </span>
  );
}
