import { useState } from 'react';
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

export function SubmissionsPage({ scope }: SubmissionsPageProps) {
  const [filtersOpen, setFiltersOpen] = useState(false);

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
