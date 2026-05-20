import { ChevronLeft, ChevronRight } from 'lucide-react';
import { paginationStyles as ps, colors } from '@/theme/tokens';

export interface PaginationProps {
  page:          number;
  pageSize:      number;
  total:         number;
  onPageChange:  (page: number) => void;
  itemLabel?:    string;
}

/**
 * S4 — left side: "Showing X – Y of Z items" + divider + "Page A of B".
 * Right side: chevron prev / numbered pages / chevron next. All values
 * read from `paginationStyles`. No invented properties — Figma values
 * verified against node 520-29725.
 */
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

  return (
    <div
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
        <PrevNextButton
          direction="prev"
          disabled={!canPrev}
          onClick={() => onPageChange(page - 1)}
        />
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
          <PageNumberButton
            key={n}
            n={n}
            isActive={n === page}
            onClick={() => onPageChange(n)}
          />
        ))}
        <PrevNextButton
          direction="next"
          disabled={!canNext}
          onClick={() => onPageChange(page + 1)}
        />
      </div>
    </div>
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
  const label = direction === 'prev' ? ' Previous' : 'Next ';
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="inline-flex items-center justify-center cursor-pointer disabled:cursor-not-allowed transition-opacity"
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
      {direction === 'prev' && <Icon size={ps.prevNextIconSize} />}
      <span>{label}</span>
      {direction === 'next' && <Icon size={ps.prevNextIconSize} />}
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
      className="inline-flex items-center justify-center cursor-pointer transition-opacity hover:opacity-90"
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
