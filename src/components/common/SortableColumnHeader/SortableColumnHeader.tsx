import { ChevronDown, ChevronsUpDown, ChevronUp } from 'lucide-react';
import { sortableColumnHeaderStyles as ss } from '@/theme/tokens';
import { cn } from '@/lib/cn';

/**
 * Returns the WAI-ARIA `aria-sort` value for a `<th>` cell wrapping a
 * `<SortableColumnHeader>`. Consumers do `<th aria-sort={getAriaSort(...)}>`.
 */
export function getAriaSort(
  sortKey: string | undefined,
  currentField: string | undefined,
  currentDirection: 'asc' | 'desc' | undefined,
): 'ascending' | 'descending' | 'none' | undefined {
  if (!sortKey) return undefined;
  if (currentField !== sortKey) return 'none';
  return currentDirection === 'asc' ? 'ascending' : 'descending';
}

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

  // aria-sort lives on the <th> in a real table; this component is the inner
  // button. We surface aria-sort via the wrapping <th>'s default if consumers
  // forward `currentField`/`currentDirection`. For accessible announcement we
  // also add an sr-only suffix to the button label describing current state.
  const sortStateLabel = !isSortable
    ? ''
    : !isActive
    ? ', not sorted, activate to sort ascending'
    : currentDirection === 'asc'
    ? ', sorted ascending, activate to sort descending'
    : ', sorted descending, activate to clear sort';

  return (
    <button
      type="button"
      disabled={!isSortable}
      onClick={() => isSortable && onSortChange!(sortKey!)}
      className={cn(
        'inline-flex items-center w-full bg-transparent border-0 ring-custom focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-vivid rounded',
        align === 'right'  && 'justify-end',
        align === 'center' && 'justify-center',
        isSortable && 'cursor-pointer',
      )}
      style={{
        gap:           ss.gap,
        fontSize:      ss.fontSize,
        fontWeight:    ss.fontWeight,
        color:         isActive ? ss.activeColor : ss.inactiveColor,
      }}
    >
      <span>{label}</span>
      {sortStateLabel && <span className="sr-only">{sortStateLabel}</span>}
      {isSortable && <Chevron size={ss.iconSize} aria-hidden />}
    </button>
  );
}
