import { statusStyles, statusLabels } from '@/theme/tokens';
import type { SubmissionStatus } from '@/shared/types';

interface Props {
  status: SubmissionStatus;
}

export function StatusPill({ status }: Props) {
  const s = statusStyles[status];
  return (
    <span
      style={{
        display:        'inline-flex',
        alignItems:     'center',
        gap:            4,
        padding:        '2px 8px',
        background:     s.bg,
        border:         `1px solid ${s.border}`,
        borderRadius:   0,
        fontSize:       11,
        fontWeight:     600,
        color:          s.text,
        whiteSpace:     'nowrap',
      }}
    >
      <span
        style={{
          width:        6,
          height:       6,
          borderRadius: '50%',
          background:   s.dot,
          flexShrink:   0,
        }}
      />
      {statusLabels[status]}
    </span>
  );
}
