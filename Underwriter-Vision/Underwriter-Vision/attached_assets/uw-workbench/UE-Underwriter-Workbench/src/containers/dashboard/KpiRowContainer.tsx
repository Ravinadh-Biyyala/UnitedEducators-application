import { useGetKpisQuery } from '@/services/dashboard/dashboardApi';
import { KpiCard } from '@/components/domain';
import { Spinner } from '@/components/common';
import { formatCompactCurrency, formatPercent } from '@/shared/utils';
import { colors } from '@/theme/tokens';
import InReviewIcon    from '@/assets/icons/kpi/in-review.svg?react';
import QuotedIcon      from '@/assets/icons/kpi/quoted.svg?react';
import BoundIcon       from '@/assets/icons/kpi/bound.svg?react';
import HitRatioIcon    from '@/assets/icons/kpi/hit-ratio.svg?react';
import DaysToQuoteIcon from '@/assets/icons/kpi/days-to-quote.svg?react';

// Row layout from Figma node 320:49426 (SVG width 1188, 5 cards × 224.8px + 4 × 16px gaps):
// flex row, gap-4 (16px), each card is flex-1 (equal width).
export function KpiRowContainer() {
  const { data, isLoading, error } = useGetKpisQuery();

  if (isLoading) return <div className="py-4"><Spinner /></div>;
  if (error || !data) return <div className="text-sm text-red-600">Failed to load KPIs.</div>;

  return (
    <div className="flex gap-4">
      {/* Card 1 — Active Submissions | gold accent (#C9A227) */}
      <KpiCard
        label="Active Submissions"
        value={data.inReview}
        trend="Portfolio-wide"
        trendPositive={true}
        accentColor={colors.brand.accent}
        icon={<InReviewIcon width={20} height={20} className="text-white" aria-hidden />}
      />

      {/* Card 2 — Quoted Pipeline | green accent (#2E7D32) */}
      <KpiCard
        label="Quoted Pipeline"
        value={formatCompactCurrency(data.quotedPipeline)}
        trend={`${data.quotedAccounts} accounts`}
        trendPositive={true}
        accentColor={colors.kpi.trendPositive}
        icon={<QuotedIcon width={20} height={20} className="text-white" aria-hidden />}
      />

      {/* Card 3 — Bound YTD | blue accent (#005B99) */}
      <KpiCard
        label="Bound YTD"
        value={formatCompactCurrency(data.boundPremium)}
        trend={`${data.bound} policies — on target`}
        trendPositive={true}
        accentColor={colors.kpi.iconBound}
        icon={<BoundIcon width={20} height={20} className="text-white" aria-hidden />}
      />

      {/* Card 4 — Portfolio Hit Ratio | blue accent (#0123D4) */}
      <KpiCard
        label="Portfolio Hit Ratio"
        value={formatPercent(data.hitRatio)}
        trend="+2pp vs. prior year"
        trendPositive={true}
        accentColor={colors.brand.vivid}
        icon={<HitRatioIcon width={20} height={20} className="text-white" aria-hidden />}
      />

      {/* Card 5 — Avg. Days to Quote | green accent (#2E7D32) */}
      <KpiCard
        label="Avg. Days to Quote"
        value={`${data.avgDaysToQuote}d`}
        trend="Within SLA (≤5d)"
        trendPositive={true}
        accentColor={colors.kpi.trendPositive}
        icon={<DaysToQuoteIcon width={20} height={20} className="text-white" aria-hidden />}
      />
    </div>
  );
}
