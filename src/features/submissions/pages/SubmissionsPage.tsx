import { useSearchParams } from 'react-router-dom';
import { ErrorBoundary, PanelErrorState } from '@/components/common';
import {
  SubmissionsFiltersContainer,
  SubmissionsHeaderContainer,
  SubmissionsListContainer,
  SubmissionsScopeTabsContainer,
} from '@/containers/submissions';
import type { SubmissionsScope } from '@/shared/types';

interface SubmissionsPageProps {
  scope: SubmissionsScope;
}

const FILTERS_PARAM = 'filters';

export function SubmissionsPage({ scope }: SubmissionsPageProps) {
  // Per §X. Filter state — URL params: the filters drawer open/closed
  // belongs in the URL so refresh, share-link, and back-button all preserve it.
  const [params, setParams] = useSearchParams();
  const filtersOpen = params.get(FILTERS_PARAM) === 'open';
  const setFiltersOpen = (next: boolean | ((prev: boolean) => boolean)) => {
    const resolved = typeof next === 'function' ? next(filtersOpen) : next;
    setParams((prev) => {
      const updated = new URLSearchParams(prev);
      if (resolved) updated.set(FILTERS_PARAM, 'open');
      else updated.delete(FILTERS_PARAM);
      return updated;
    }, { replace: true });
  };

  return (
    <div className="flex flex-col h-full -mx-8 -mt-7">
      <ErrorBoundary fallback={<PanelErrorState panelName="Header" />}>
        <SubmissionsHeaderContainer />
      </ErrorBoundary>

      <ErrorBoundary fallback={<PanelErrorState panelName="Tabs" />}>
        <SubmissionsScopeTabsContainer
          scope={scope}
          filtersOpen={filtersOpen}
          onFiltersClick={() => setFiltersOpen((o) => !o)}
        />
      </ErrorBoundary>

      <div className="flex flex-1">
        {filtersOpen && (
          <ErrorBoundary fallback={<PanelErrorState panelName="Filters" />}>
            <SubmissionsFiltersContainer onClose={() => setFiltersOpen(false)} />
          </ErrorBoundary>
        )}
        <div className="flex-1 min-w-0  overflow-x-auto overflow-y-hidden">
          <ErrorBoundary fallback={<PanelErrorState panelName="List" />}>
            <SubmissionsListContainer scope={scope} />
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
}
