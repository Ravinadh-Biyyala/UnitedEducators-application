export type UnderwriterRole   = 'lead' | 'standard';
export type TeamPerfStatKey   = 'inReview' | 'quoted' | 'bound';

export interface UnderwriterPerformance {
  id:          string;
  name:        string;          // 'Sarah Mitchell'
  roleLabel:   string;          // 'Underwriter' | 'Sr. Underwriter' | 'UW Analyst'
  role:        UnderwriterRole; // drives avatar color
  inReview:    number;
  quoted:      number;
  bound:       number;
  hitRatioPct: number;          // whole-number percent: 71, not 0.71
  daysToQuote: number;          // 3.8
}

export interface TeamPerformance {
  underwriters: UnderwriterPerformance[];
  generatedAt:  string;
}

export const TEAM_PERF_COL_ORDER = [
  'underwriter',
  'inReview',
  'quoted',
  'bound',
  'hitRatio',
  'daysToQuote',
] as const;

export type TeamPerfColumnKey = (typeof TEAM_PERF_COL_ORDER)[number];
