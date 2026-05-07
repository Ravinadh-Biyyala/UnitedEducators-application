import { SubmissionsListTable } from '@/components/domain';
import { useGetSubmissionsListQuery } from '@/services/submissions/submissionsApi';
import { useSubmissionsUrlState } from '@/features/submissions/hooks/useSubmissionsUrlState';
import type { SubmissionsScope } from '@/shared/types';

interface Props {
  scope: SubmissionsScope;
}

export function SubmissionsListContainer({ scope }: Props) {
  const { filters, sort, page, pageSize, setSort, setPage } = useSubmissionsUrlState();

  const { data, isLoading, isError } = useGetSubmissionsListQuery({
    scope,
    filters,
    sort,
    page,
    pageSize,
  });

  if (isError) throw new Error('SubmissionsList query failed');

  return (
    <SubmissionsListTable
      response={data}
      isLoading={isLoading}
      sort={sort}
      onSortChange={setSort}
      page={page}
      pageSize={pageSize}
      onPageChange={setPage}
    />
  );
}
