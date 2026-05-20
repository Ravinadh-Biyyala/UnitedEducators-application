import { ChevronDown, ChevronsUpDown, ChevronUp } from 'lucide-react';
import { sortableColumnHeaderStyles as ss } from '@/theme/tokens';
import { cn } from '@/lib/cn';

export interface SortableColumnHeaderProps {
  label:        string;
  sortKey?:     string;
  currentField?: string;
  currentDirection?: 'asc' | 'desc';
  onSortChange?: (field: string) => void;
  align?:       'left' | 'right' | 'center';
}

/**
 * Sortable column header with chevron indicator. When the column is the
 * active sort column the chevron points in the direction of sort
 * (Down = desc, Up = asc); otherwise the inactive chevron is the
 * lucide `ChevronsUpDown` "double-chevron". Glyph identification is a
 * best-guess — Figma JSON does not expose vector path data for header
 * icons. Verify visually and update the imported lucide icons if wrong.
 */
export function SortableColumnHeader({
  label,
  sortKey,
  currentField,
  currentDirection,
  onSortChange,
  align = 'left',
}: SortableColumnHeaderProps) {
  const isSortable = !!sortKey && !!onSortChange;
  const isActive   = !!sortKey && currentField === sortKey;

  const Chevron = !isActive
    ? ChevronsUpDown
    : currentDirection === 'desc' ? ChevronDown : ChevronUp;

  return (
    <button
      type="button"
      disabled={!isSortable}
      onClick={() => isSortable && onSortChange!(sortKey!)}
      className={cn(
        'inline-flex items-center w-full bg-transparent border-0 outline-none',
        align === 'right'  && 'justify-end',
        align === 'center' && 'justify-center',
        isSortable && 'cursor-pointer',
      )}
      style={{
        gap:           ss.gap,
        fontSize:      ss.fontSize,
        fontWeight:    ss.fontWeight,
        color:         isActive ? ss.activeColor : ss.inactiveColor,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
      }}
    >
      <span>{label}</span>
      {isSortable && <Chevron size={ss.iconSize} aria-hidden />}
    </button>
  );
}
