import { SubmissionsHeader } from '@/components/domain';
import { useGetSubmissionsHeaderQuery } from '@/services/submissions/submissionsApi';

export function SubmissionsHeaderContainer() {
  const { data, isLoading, isError } = useGetSubmissionsHeaderQuery();

  // Throwing here lets the parent ErrorBoundary render PanelErrorState
  // for just this region instead of crashing the whole page.
  if (isError) throw new Error('SubmissionsHeader query failed');

  return <SubmissionsHeader stats={data} isLoading={isLoading} />;
}
