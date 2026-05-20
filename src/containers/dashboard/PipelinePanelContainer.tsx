import { useGetPipelineQuery } from '@/services/pipeline/pipelineApi';
import type { PipelineSeriesKey } from '@/shared/types/pipeline';
import { PipelinePanel } from '@/components/domain/PipelinePanel';

export function PipelinePanelContainer() {
  const { data } = useGetPipelineQuery();

  const handleBarClick = (monthIso: string, series: PipelineSeriesKey) => {
    // TODO: navigate to filtered Submissions view — Phase 5 out of scope.
    // e.g. /submissions?month=2024-03&status=Submitted
    console.log('[Pipeline] bar clicked:', monthIso, series);
  };

  if (!data) return null;

  return (
    <PipelinePanel
      months={data.months}
      onBarClick={handleBarClick}
    />
  );
}
