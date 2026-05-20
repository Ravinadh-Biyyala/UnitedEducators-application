import type { PortfolioStat } from '@/shared/types/portfolio';
import { formatCompactCurrency } from './formatters';

export function formatStatValue(stat: PortfolioStat): string {
  switch (stat.format) {
    case 'count':     return stat.value.toString();
    case 'percent':   return `${stat.value}%`;
    case 'score':     return `${stat.value}/100`;
    case 'subsCount': return `${stat.value} sub${stat.value === 1 ? '' : 's'}`;
    case 'currency':  return formatCompactCurrency(stat.value);
  }
}
