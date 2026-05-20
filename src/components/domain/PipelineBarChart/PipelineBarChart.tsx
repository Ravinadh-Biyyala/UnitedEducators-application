import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { BarRectangleItem } from 'recharts';
import type { PipelineMonthBucket, PipelineSeriesKey } from '@/shared/types/pipeline';
import { niceScale } from '@/shared/utils/niceScale';
import { colors, fonts, chartDims, pipelineSeriesStyles } from '@/theme/tokens';

interface TooltipEntry {
  color?: string;
  name?:  string | number;
  value?: number | string | readonly (number | string)[];
  dataKey?: string | number;
}

function PipelineTooltip({ active, payload, label }: { active?: boolean; payload?: TooltipEntry[]; label?: string | number }) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background:   colors.bgSurface,
        border:       `1px solid ${colors.borderStrong}`,
        borderRadius: 0,
        padding:      '8px 12px',
        fontFamily:   fonts.sans,
      }}
    >
      <div style={{ fontSize: 11, fontWeight: 700, color: colors.textHeading, marginBottom: 4 }}>
        {label}
      </div>
      {payload.map((entry) => (
        <div
          key={String(entry.dataKey)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}
        >
          <span style={{ display: 'inline-block', width: 10, height: 10, background: entry.color ?? 'transparent', flexShrink: 0 }} />
          <span style={{ fontSize: 12, fontWeight: 600, color: colors.textBody }}>
            {entry.name}:&nbsp;
            <span style={{ color: colors.textHeading }}>{entry.value}</span>
          </span>
        </div>
      ))}
    </div>
  );
}

interface PipelineBarChartProps {
  months:      PipelineMonthBucket[];
  series:      readonly PipelineSeriesKey[];
  onBarClick?: (monthIso: string, seriesKey: PipelineSeriesKey) => void;
}

export function PipelineBarChart({ months, series, onBarClick }: PipelineBarChartProps) {
  const data = months.map((m) => ({ ...m }));

  const maxValue = Math.max(0, ...months.flatMap((m) => series.map((s) => m[s])));
  const { niceMax, ticks } = niceScale(maxValue, chartDims.tickCount);

  return (
    <ResponsiveContainer width="100%" height={chartDims.chartHeight}>
      <BarChart
        data={data}
        barCategoryGap={chartDims.barGroupGap}
        barGap={chartDims.barGap}
        margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke={colors.borderDefault}
          vertical={false}
        />
        <XAxis
          dataKey="monthLabel"
          tickLine={false}
          axisLine={{ stroke: colors.borderStrong }}
          tick={{ fill: colors.textMuted, fontSize: 11, fontFamily: fonts.sans }}
        />
        <YAxis
          domain={[0, niceMax]}
          ticks={ticks}
          tickLine={false}
          axisLine={false}
          tick={{ fill: colors.textMuted, fontSize: 11, fontFamily: fonts.sans }}
          width={chartDims.yAxisWidth}
        />
        <Tooltip
          content={(props) => (
            <PipelineTooltip
              active={props.active}
              payload={props.payload as unknown as TooltipEntry[] | undefined}
              label={props.label}
            />
          )}
          cursor={{ fill: colors.bgMuted2 }}
        />
        {series.map((seriesKey) => (
          <Bar
            key={seriesKey}
            dataKey={seriesKey}
            name={pipelineSeriesStyles[seriesKey].label}
            fill={pipelineSeriesStyles[seriesKey].color}
            radius={0}
            onClick={(barData: BarRectangleItem) => {
              if (onBarClick) onBarClick((barData.payload as { monthIso: string }).monthIso, seriesKey);
            }}
            style={{ cursor: onBarClick ? 'pointer' : 'default' }}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
