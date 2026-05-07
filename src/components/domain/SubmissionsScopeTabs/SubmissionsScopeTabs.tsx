import { Filter } from 'lucide-react';
import {
  colors,
  submissionsScopeTabsStyles as ts,
  submissionsScopeLabels,
  submissionsFiltersDrawerStyles as ds,
  SUBMISSIONS_SCOPES_DISPLAY_ORDER,
} from '@/theme/tokens';
import type { SubmissionsScope } from '@/shared/types';
import { cn } from '@/lib/cn';

interface Props {
  scope:              SubmissionsScope;
  onChange:           (scope: SubmissionsScope) => void;
  resultsCount:       number;
  isLoading?:         boolean;
  activeFilterCount?: number;
  onFiltersClick:     () => void;
  filtersOpen?:       boolean;
}

export function SubmissionsScopeTabs({
  scope,
  onChange,
  resultsCount,
  isLoading,
  activeFilterCount,
  onFiltersClick,
  filtersOpen,
}: Props) {
  return (
    <div
      className="flex items-center justify-between bg-white"
      style={{
        height:        ts.height,
        paddingLeft:   ts.paddingX,
        paddingRight:  ts.paddingX,
        borderBottom:  `1px solid ${colors.slate200}`,
      }}
    >
      <div className="flex items-end" style={{ gap: 24, height: ts.tabHeight }}>
        {SUBMISSIONS_SCOPES_DISPLAY_ORDER.map((s) => (
          <ScopeTab
            key={s}
            label={submissionsScopeLabels[s]}
            isActive={scope === s}
            onClick={() => onChange(s)}
          />
        ))}
      </div>

      <div className="flex items-center" style={{ gap: 16 }}>
        <span
          aria-live="polite"
          style={{
            color:    ts.resultsCountColor,
            fontSize: ts.resultsCountSize,
          }}
        >
          {isLoading ? '…' : `${resultsCount} ${resultsCount === 1 ? 'result' : 'results'}`}
        </span>
        <FiltersButton activeFilterCount={activeFilterCount ?? 0} onClick={onFiltersClick} isOpen={filtersOpen ?? false} />
      </div>
    </div>
  );
}

// ── Internal subcomponents ──────────────────────────────────────────────────

function ScopeTab({
  label,
  isActive,
  onClick,
}: {
  label:    string;
  isActive: boolean;
  onClick:  () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'relative inline-flex items-center justify-center cursor-pointer transition-colors bg-transparent border-0 outline-none',
      )}
      style={{
        height:     ts.tabHeight,
        fontSize:   ts.tabFontSize,
        fontWeight: isActive ? ts.activeWeight : ts.inactiveWeight,
        color:      isActive ? ts.activeColor  : ts.inactiveColor,
        padding:    '0 4px',
      }}
    >
      {label}
      {isActive && (
        <span
          aria-hidden
          style={{
            position:        'absolute',
            left:            0,
            right:           0,
            bottom:          0,
            height:          ts.activeUnderlineHeight,
            backgroundColor: ts.activeUnderlineColor,
          }}
        />
      )}
    </button>
  );
}

function FiltersButton({
  activeFilterCount,
  onClick,
  isOpen,
}: {
  activeFilterCount: number;
  onClick:           () => void;
  isOpen:            boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isOpen}
      className="inline-flex items-center justify-center cursor-pointer transition-colors outline-none"
      style={{
        height:          ts.filtersToggleHeight,
        minWidth:        ts.filtersToggleWidth,
        paddingLeft:     12,
        paddingRight:    12,
        gap:             6,
        backgroundColor: isOpen ? colors.brandBlue : ts.filtersToggleBg,
        color:           isOpen ? colors.white     : ts.filtersToggleColor,
        fontSize:        ts.filtersToggleSize,
        fontWeight:      ts.filtersToggleWeight,
        border:          isOpen ? 'none' : `${ts.filtersToggleBorderWidth}px solid ${ts.filtersToggleBorderColor}`,
        borderRadius:    4,
      }}
      aria-label={
        activeFilterCount > 0
          ? `Filters (${activeFilterCount} active)`
          : 'Filters'
      }
    >
      <Filter size={14} />
      <span>Filters</span>
      {activeFilterCount > 0 && (
        <span
          aria-hidden
          className="inline-flex items-center justify-center"
          style={{
            minWidth:        ds.badgeSize,
            height:          ds.badgeSize,
            paddingLeft:     4,
            paddingRight:    4,
            borderRadius:    ds.badgeSize / 2,
            backgroundColor: ds.badgeBg,
            color:           ds.badgeColor,
            fontSize:        ds.badgeFontSize,
            fontWeight:      ds.badgeFontWeight,
            lineHeight:      1,
          }}
        >
          {activeFilterCount}
        </span>
      )}
    </button>
  );
}
