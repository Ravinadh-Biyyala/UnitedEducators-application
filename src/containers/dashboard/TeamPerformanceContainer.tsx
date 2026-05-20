import { useGetTeamPerformanceQuery } from '@/services/teamPerformance/teamPerformanceApi';
import { TeamPerformancePanel } from '@/components/domain/TeamPerformancePanel';

export function TeamPerformanceContainer() {
  const { data } = useGetTeamPerformanceQuery();

  if (!data) return null;

  return <TeamPerformancePanel underwriters={data.underwriters} />;
}
