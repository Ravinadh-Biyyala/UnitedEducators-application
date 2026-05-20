import { useMemo } from 'react';
import { useGetSnapshotQuery } from '@/services/portfolio/portfolioApi';
import type { PortfolioStat, PortfolioStatKey } from '@/shared/types/portfolio';
import { STAT_DISPLAY_ORDER } from '@/shared/types/portfolio';
import { PortfolioSnapshotPanel } from '@/components/domain/PortfolioSnapshotPanel';

export function PortfolioSnapshotContainer() {
  const { data } = useGetSnapshotQuery();

  const orderedStats = useMemo<PortfolioStat[]>(() => {
    if (!data) return [];
    return STAT_DISPLAY_ORDER.map((key) => data.stats[key]);
  }, [data]);

  const handleStatClick = (key: PortfolioStatKey) => {
    // TODO: navigate to filtered Submissions view per stat key — Phase 8 out of scope.
    console.log('[PortfolioSnapshot] stat clicked:', key);
  };

  return (
    <PortfolioSnapshotPanel
      stats={orderedStats}
      onStatClick={handleStatClick}
    />
  );
}
