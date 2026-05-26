import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { paginationStyles as ps, colors } from '@/theme/tokens';

export interface PaginationProps {
  page:          number;
  pageSize:      number;
  total:         number;
  onPageChange:  (page: number) => void;
  itemLabel?:    string;
}

/**
 * Builds the visible page-number window:
 *   [1, ..., current-1, current, current+1, ..., total]
 * Ellipses are returned as the sentinel `null` so the renderer can
 * distinguish them from real page numbers.
 */
function buildPageWindow(current: number, total: number): Array<number | null> {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const window: Array<number | null> = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  if (start > 2) window.push(null);
  for (let i = start; i <= end; i += 1) window.push(i);
  if (end < total - 1) window.push(null);

  window.push(total);
  return window;
}

export function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  itemLabel = 'items',
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start  = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end    = Math.min(page * pageSize, total);
  const canPrev = page > 1;
  const canNext = page < totalPages && total > 0;
  const pageWindow = buildPageWindow(page, totalPages);

  return (
    <nav
      aria-label="Pagination"
      className="flex flex-wrap items-center justify-between gap-y-3"
      style={{
        paddingLeft:    ps.paddingX,
        paddingRight:   ps.paddingX,
        paddingTop:     ps.paddingY,
        paddingBottom:  ps.paddingY,
        backgroundColor: colors.bgSurface,
      }}
    >
      <div className="flex items-center gap-3">
        <span style={{ color: ps.countLabelColor, fontSize: ps.showingLabelSize }}>
          Showing{' '}
          <strong style={{ color: ps.countLabelBoldColor, fontWeight: 700 }}>{start}</strong>
          {' – '}
          <strong style={{ color: ps.countLabelBoldColor, fontWeight: 700 }}>{end}</strong>
          {' of '}
          <strong style={{ color: ps.countLabelBoldColor, fontWeight: 700 }}>{total}</strong>
          {' '}
          {itemLabel}
        </span>
        <span
          aria-hidden
          style={{
            width:           ps.dividerWidth,
            height:          ps.dividerHeight,
            backgroundColor: ps.dividerColor,
          }}
        />
        <span style={{ color: ps.countLabelColor, fontSize: ps.pageOfLabelSize }}>
          Page{' '}
          <strong style={{ color: ps.countLabelBoldColor, fontWeight: 700 }}>{page}</strong>
          {' of '}
          <strong style={{ color: ps.countLabelBoldColor, fontWeight: 700 }}>{totalPages}</strong>
        </span>
      </div>

      <div className="flex items-center" style={{ gap: ps.gap }}>
        {totalPages > 7 && (
          <EdgeButton
            direction="first"
            disabled={!canPrev}
            onClick={() => onPageChange(1)}
          />
        )}
        <PrevNextButton
          direction="prev"
          disabled={!canPrev}
          onClick={() => onPageChange(page - 1)}
        />
        {pageWindow.map((n, i) =>
          n === null ? (
            <span
              key={`ellipsis-${i}`}
              aria-hidden
              className="px-1 text-slate-400"
              style={{ fontSize: ps.inactiveSize }}
            >
              …
            </span>
          ) : (
            <PageNumberButton
              key={n}
              n={n}
              isActive={n === page}
              onClick={() => onPageChange(n)}
            />
          ),
        )}
        <PrevNextButton
          direction="next"
          disabled={!canNext}
          onClick={() => onPageChange(page + 1)}
        />
        {totalPages > 7 && (
          <EdgeButton
            direction="last"
            disabled={!canNext}
            onClick={() => onPageChange(totalPages)}
          />
        )}
      </div>
    </nav>
  );
}

function PrevNextButton({
  direction,
  disabled,
  onClick,
}: {
  direction: 'prev' | 'next';
  disabled:  boolean;
  onClick:   () => void;
}) {
  const Icon = direction === 'prev' ? ChevronLeft : ChevronRight;
  const label = direction === 'prev' ? 'Previous' : 'Next';
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label={`${label} page`}
      className="inline-flex items-center justify-center cursor-pointer disabled:cursor-not-allowed transition-opacity ring-custom focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-vivid"
      style={{
        height:          ps.prevNextHeight,
        paddingLeft:     ps.prevNextPaddingX,
        paddingRight:    ps.prevNextPaddingX,
        gap:             6,
        backgroundColor: colors.bgSurface,
        color:           ps.inactiveColor,
        fontSize:        ps.prevNextSize,
        fontWeight:      ps.prevNextWeight,
        border:          `${ps.inactiveBorderWidth}px solid ${ps.inactiveBorderColor}`,
        opacity:         disabled ? ps.disabledOpacity : 1,
      }}
    >
      {direction === 'prev' && <Icon size={ps.prevNextIconSize} aria-hidden />}
      <span>{label}</span>
      {direction === 'next' && <Icon size={ps.prevNextIconSize} aria-hidden />}
    </button>
  );
}

function EdgeButton({
  direction,
  disabled,
  onClick,
}: {
  direction: 'first' | 'last';
  disabled:  boolean;
  onClick:   () => void;
}) {
  const Icon = direction === 'first' ? ChevronsLeft : ChevronsRight;
  const label = direction === 'first' ? 'First page' : 'Last page';
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label={label}
      className="inline-flex items-center justify-center cursor-pointer disabled:cursor-not-allowed transition-opacity ring-custom focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-vivid"
      style={{
        height:          ps.prevNextHeight,
        width:           ps.prevNextHeight,
        backgroundColor: colors.bgSurface,
        color:           ps.inactiveColor,
        border:          `${ps.inactiveBorderWidth}px solid ${ps.inactiveBorderColor}`,
        opacity:         disabled ? ps.disabledOpacity : 1,
      }}
    >
      <Icon size={ps.prevNextIconSize} aria-hidden />
    </button>
  );
}

function PageNumberButton({
  n,
  isActive,
  onClick,
}: {
  n:        number;
  isActive: boolean;
  onClick:  () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={isActive ? 'page' : undefined}
      aria-label={`${isActive ? 'Current page, page ' : 'Go to page '}${n}`}
      className="inline-flex items-center justify-center cursor-pointer transition-opacity hover:opacity-90 ring-custom focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-vivid"
      style={
        isActive
          ? {
              width:           ps.itemSize,
              height:          ps.itemSize,
              backgroundColor: ps.activeBg,
              color:           ps.activeColor,
              fontSize:        ps.inactiveSize,
              fontWeight:      ps.activeWeight,
              border:          `${ps.inactiveBorderWidth}px solid ${ps.activeBorderColor}`,
              boxShadow:       ps.activeShadow,
            }
          : {
              width:           ps.itemSize,
              height:          ps.itemSize,
              backgroundColor: colors.bgSurface,
              color:           ps.inactiveColor,
              fontSize:        ps.inactiveSize,
              fontWeight:      ps.inactiveWeight,
              border:          `${ps.inactiveBorderWidth}px solid ${ps.inactiveBorderColor}`,
            }
      }
    >
      {n}
    </button>
  );
}
