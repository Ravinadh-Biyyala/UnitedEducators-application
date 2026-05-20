import { statusLabels, statusStyles } from '@/theme';
import type { SubmissionStatus } from '@/shared/types';

/**
 * S4 rewrite — pill with leading colored dot, matching Figma node
 * 520-29725 (status badges in the submissions list table). Reads bg /
 * border / dot / text color from `statusStyles[status]` (the canonical
 * per-status map). The previous S1 implementation used a generic
 * `<Badge>` with a circle icon; the new shape applies everywhere the
 * badge is used (submissions list AND dashboard table) since both want
 * the same visual treatment.
 */
interface Props {
  status: SubmissionStatus;
}

export function StatusBadge({ status }: Props) {
  const s = statusStyles[status];
  return (
    <span
      className="inline-flex items-center"
      style={{
        backgroundColor: s.bg,
        border:          `0.8px solid ${s.border}`,
        color:           s.text,
        paddingLeft:     8,
        paddingRight:    10,
        paddingTop:      4,
        paddingBottom:   4,
        gap:             6,
        fontSize:        10.88,
        fontWeight:      700,
        lineHeight:      1.5,
      }}
    >
      <span
        aria-hidden
        style={{
          width:           6,
          height:          6,
          borderRadius:    '50%',
          backgroundColor: s.dot,
          flexShrink:      0,
        }}
      />
      {statusLabels[status]}
    </span>
  );
}
