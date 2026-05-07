import { colors, fonts, chartDims } from '@/theme/tokens';

interface ChartLegendItem {
  color: string;
  label: string;
}

interface ChartLegendProps {
  items: ChartLegendItem[];
}

export function ChartLegend({ items }: ChartLegendProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: chartDims.legendItemGap, fontFamily: fonts.sans }}>
      {items.map((item) => (
        <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ display: 'inline-block', width: 10, height: 10, background: item.color, flexShrink: 0 }} />
          <span style={{ fontSize: 11, fontWeight: 600, color: colors.textBody }}>{item.label}</span>
        </div>
      ))}
    </div>
  );
}
