import { useNavigate } from 'react-router-dom';
import { SubmissionsListTable } from '@/components/domain';
import { useGetSubmissionsListQuery } from '@/services/submissions/submissionsApi';
import { useSubmissionsUrlState } from '@/features/submissions/hooks/useSubmissionsUrlState';
import type { SubmissionsScope } from '@/shared/types';

interface Props {
  scope: SubmissionsScope;
}

export function SubmissionsListContainer({ scope }: Props) {
  const navigate = useNavigate();
  const { filters, sort, page, pageSize, setSort, setPage } = useSubmissionsUrlState();

  const { data, isLoading, isError } = useGetSubmissionsListQuery({
    scope,
    filters,
    sort,
    page,
    pageSize,
  });

  // Pass the error through to the table so it can render an inline error
  // row (preserves filters/pagination chrome) instead of throwing the whole
  // panel to the ErrorBoundary. ErrorBoundary still catches anything thrown
  // synchronously by the children below.
  return (
    <SubmissionsListTable
      response={data}
      isLoading={isLoading}
      isError={isError}
      sort={sort}
      onSortChange={setSort}
      page={page}
      pageSize={pageSize}
      onPageChange={setPage}
      onRowClick={(id) => navigate(`/submissions/${id}`)}
    />
  );
}
