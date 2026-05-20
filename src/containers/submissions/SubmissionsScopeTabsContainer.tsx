import { useNavigate } from 'react-router-dom';
import { SubmissionsScopeTabs } from '@/components/domain';
import { useGetSubmissionsListQuery } from '@/services/submissions/submissionsApi';
import { useSubmissionsUrlState } from '@/features/submissions/hooks/useSubmissionsUrlState';
import type { SubmissionsScope } from '@/shared/types';

const SCOPE_TO_PATH: Record<SubmissionsScope, string> = {
  mine: '/submissions/UE-submission-list-my-queue',
  team: '/submissions/UE-submission-list-my-team',
  all:  '/submissions/UE-submission-list-all',
};

interface Props {
  scope:          SubmissionsScope;
  onFiltersClick: () => void;
  filtersOpen?:   boolean;
}

export function SubmissionsScopeTabsContainer({ scope, onFiltersClick, filtersOpen }: Props) {
  const navigate = useNavigate();
  const { filters, sort, page, pageSize, activeFilterCount } = useSubmissionsUrlState();

  const { data, isLoading } = useGetSubmissionsListQuery({
    scope,
    filters,
    sort,
    page,
    pageSize,
  });

  return (
    <SubmissionsScopeTabs
      scope={scope}
      onChange={(next) => navigate(SCOPE_TO_PATH[next])}
      resultsCount={data?.total ?? 0}
      isLoading={isLoading}
      activeFilterCount={activeFilterCount}
      onFiltersClick={onFiltersClick}
      filtersOpen={filtersOpen}
    />
  );
}
