import { useMemo } from 'react';
import { ErrorBoundary } from '@/components/common';
import { SubmissionsFiltersDrawer } from '@/components/domain';
import { MOCK_SUBMISSIONS_LIST } from '@/services/submissions/mocks/submissionsListMock';
import { useSubmissionsUrlState } from '@/features/submissions/hooks/useSubmissionsUrlState';
import { colors, submissionsFiltersStyles as fs, submissionsFiltersDrawerStyles as ds } from '@/theme/tokens';

interface Props {
  onClose: () => void;
}

export function SubmissionsFiltersContainer({ onClose }: Props) {
  const { filters, setFilters, resetFilters, activeFilterCount } =
    useSubmissionsUrlState();

  const availableBrokers = useMemo(
    () =>
      Array.from(
        new Set(
          MOCK_SUBMISSIONS_LIST
            .map((s) => s.broker)
            .filter((b): b is string => typeof b === 'string' && b.length > 0),
        ),
      ).sort(),
    [],
  );

  const availableUnderwriters = useMemo(
    () =>
      Array.from(
        new Set(
          MOCK_SUBMISSIONS_LIST.map((s) =>
            s.assigneeName === '' ? 'Unassigned' : s.assigneeName,
          ),
        ),
      ).sort(),
    [],
  );

  return (
    <aside
      id="filters-drawer"
      aria-label="Submission filters"
      className="flex flex-col shrink-0 bg-white h-full"
      style={{ width: 280, borderRight: `1px solid ${colors.slate200}` }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between shrink-0"
        style={{
          height:       ds.headerHeight,
          paddingLeft:  ds.headerPaddingX,
          paddingRight: ds.headerPaddingX,
          borderBottom: `1px solid ${ds.headerBorderColor}`,
        }}
      >
        <h2
          className="m-0"
          style={{ fontSize: ds.titleSize, fontWeight: ds.titleWeight, color: ds.titleColor }}
        >
          Filters
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close filters"
          className="inline-flex items-center justify-center text-neutral-500 hover:text-neutral-700 rounded ring-custom focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-vivid"
          style={{ width: 32, height: 32 }}
        >
          ×
        </button>
      </div>

      {/* Body — scrollable */}
      <div
        className="flex-1 overflow-y-auto min-h-0"
        style={{
          paddingLeft:   ds.bodyPaddingX,
          paddingRight:  ds.bodyPaddingX,
          paddingTop:    ds.bodyPaddingY,
          paddingBottom: ds.bodyPaddingY,
        }}
      >
        <ErrorBoundary fallback={<FilterBodyError />}>
          <SubmissionsFiltersDrawer
            filters={filters}
            onChange={setFilters}
            availableBrokers={availableBrokers}
            availableUnderwriters={availableUnderwriters}
          />
        </ErrorBoundary>
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-end shrink-0 gap-3"
        style={{
          height:          ds.footerHeight,
          paddingLeft:     ds.footerPaddingX,
          paddingRight:    ds.footerPaddingX,
          borderTop:       `1px solid ${ds.footerBorderColor}`,
          backgroundColor: colors.bgSurface,
        }}
      >
        <button
          type="button"
          onClick={resetFilters}
          disabled={activeFilterCount === 0}
          aria-label={`Reset all ${activeFilterCount} filters`}
          className="cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 transition-opacity rounded ring-custom focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-vivid"
          style={{
            color:      fs.resetColor,
            fontSize:   fs.resetSize,
            fontWeight: fs.resetWeight,
            background: 'transparent',
            border:     'none',
            padding:    '8px 12px',
          }}
        >
          Reset all
        </button>
        <button
          type="button"
          onClick={onClose}
          className="cursor-pointer transition-opacity hover:opacity-90 ring-custom focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-vivid focus-visible:ring-offset-2"
          style={{
            backgroundColor: colors.brandBlue,
            color:           colors.white,
            fontSize:        12,
            fontWeight:      700,
            border:          'none',
            borderRadius:    4,
            padding:         '8px 16px',
            height:          32,
          }}
        >
          Done
        </button>
      </div>
    </aside>
  );
}

function FilterBodyError() {
  return (
    <div
      role="alert"
      style={{ padding: 20, color: colors.dangerRed, fontSize: 13 }}
    >
      Couldn't render filters. Close and reopen the panel, or refresh the page.
    </div>
  );
}
