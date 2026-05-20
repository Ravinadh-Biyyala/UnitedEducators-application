import type { ReactNode } from 'react';
import { Card } from '@/components/common';
import { colors } from '@/theme/tokens';

interface Props {
  label: string;
  value: ReactNode;
  sub?: string;
  trend?: string;
  icon?: ReactNode;
  trendPositive?: boolean;
  accentColor?: string;
}

// Trend arrow extracted from Figma SVG (node 320:49427, clip1 viewBox 20.8336 106.265 11 11).
// stroke-width 0.916667, linecap/linejoin round — matches Figma exactly.
function TrendArrow({ positive }: { positive: boolean }) {
  return (
    <svg
      width="11"
      height="11"
      viewBox="20.8336 106.265 11 11"
      fill="none"
      aria-hidden="true"
      style={positive ? undefined : { transform: 'scale(1,-1)' }}
    >
      <path
        d="M30.9332 109.479L27.0311 113.381L24.7357 111.085L21.7517 114.069"
        stroke="currentColor"
        strokeWidth="0.916667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M28.1788 109.479H30.9333V112.233"
        stroke="currentColor"
        strokeWidth="0.916667"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function KpiCard({ label, value, sub, trend, icon, trendPositive, accentColor = colors.kpi.iconContainerBg }: Props) {
  const isPositiveTrend = trendPositive ?? (trend?.startsWith('+') ?? false);

  return (
    <Card className="flex-1 rounded-none shadow-none border-surface-border p-5 flex flex-col">

      {/* ── Top row: label (left) + icon container (right) ── */}
      <div className="flex items-start justify-between gap-3">
        {/* Label — 10px Bold #7A8FA3 */}
        <span
          className="text-neutral-500 font-bold leading-none"
          style={{ fontSize: '10px' }}
        >
          {label}
        </span>

        {/* Icon container — 36×36px solid accentColor bg + border, white icon */}
        {icon && (
          <div
            className="shrink-0 flex items-center justify-center"
            style={{
              width: 36,
              height: 36,
              background: accentColor,
              border: `1px solid ${accentColor}`,
            }}
            aria-hidden="true"
          >
            {icon}
          </div>
        )}
      </div>

      {/* ── Value — 26px Bold accentColor, leading-none ── */}
      <div
        className="mt-4 font-bold leading-none"
        style={{ fontSize: '26px', color: accentColor }}
      >
        {value}
      </div>

      {/* ── Bottom row: trend arrow (accentColor) + subtext (gray) ── */}
      <div className="mt-3 flex items-center gap-1">
        {trend && (
          <>
            {/* Arrow color matches card accent; text is always muted gray per Figma */}
            <span style={{ color: isPositiveTrend ? colors.kpi.trendPositive : colors.neutral[500] }}>
              <TrendArrow positive={isPositiveTrend} />
            </span>
            <span className="text-neutral-500" style={{ fontSize: '11px' }}>
              {trend}
            </span>
          </>
        )}
        {sub && (
          <span className="text-neutral-500" style={{ fontSize: '11px' }}>
            {sub}
          </span>
        )}
      </div>
    </Card>
  );
}
