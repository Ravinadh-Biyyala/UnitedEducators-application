import { BarChart3 } from 'lucide-react';
import type { PipelineMonthBucket, PipelineSeriesKey } from '@/shared/types/pipeline';
import { PIPELINE_SERIES_ORDER } from '@/shared/types/pipeline';
import { colors, dims, fonts, chartDims, pipelineSeriesStyles } from '@/theme/tokens';
import { CardShell } from '@/components/domain/CardShell';
import { ChartLegend } from '@/components/domain/ChartLegend';
import { PipelineBarChart } from '@/components/domain/PipelineBarChart';

interface PipelinePanelProps {
  months:      PipelineMonthBucket[];
  onBarClick?: (monthIso: string, seriesKey: PipelineSeriesKey) => void;
}

const legendItems = PIPELINE_SERIES_ORDER.map((k) => ({
  color: pipelineSeriesStyles[k].color,
  label: pipelineSeriesStyles[k].label,
}));

export function PipelinePanel({ months, onBarClick }: PipelinePanelProps) {
  return (
    <CardShell
      title="SUBMISSION PIPELINE — LAST 6 MONTHS"
      icon={<BarChart3 size={13} />}
      iconColor={colors.accentGold}
      width={dims.pipelineCardWidth}
    >
      <div
        style={{
          padding:       chartDims.bodyPadding,
          display:       'flex',
          flexDirection: 'column',
          gap:           chartDims.bodyGap,
          fontFamily:    fonts.sans,
        }}
      >
        <ChartLegend items={legendItems} />
        {months.length === 0 ? (
          <div style={{ fontSize: 12, fontWeight: 400, color: colors.textMuted }}>
            No pipeline data for this period.
          </div>
        ) : (
          <PipelineBarChart
            months={months}
            series={PIPELINE_SERIES_ORDER}
            onBarClick={onBarClick}
          />
        )}
      </div>
    </CardShell>
  );
}
