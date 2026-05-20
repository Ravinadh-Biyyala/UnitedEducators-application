export type PortfolioStatKey =
  | 'totalSubmissionsMtd'
  | 'quotedPipeline'
  | 'boundYtd'
  | 'avgAppetiteScore'
  | 'submissionsInSla'
  | 'docsIncomplete';

export type StatFormat =
  | 'count'
  | 'currency'
  | 'score'
  | 'percent'
  | 'subsCount';

export interface PortfolioStat {
  key:    PortfolioStatKey;
  label:  string;
  value:  number;
  format: StatFormat;
}

export interface PortfolioSnapshot {
  stats:       Record<PortfolioStatKey, PortfolioStat>;
  generatedAt: string;
}

export const STAT_DISPLAY_ORDER: readonly PortfolioStatKey[] = [
  'totalSubmissionsMtd',
  'quotedPipeline',
  'boundYtd',
  'avgAppetiteScore',
  'submissionsInSla',
  'docsIncomplete',
] as const;
