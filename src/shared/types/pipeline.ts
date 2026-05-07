export type PipelineSeriesKey = 'submitted' | 'quoted' | 'bound';

export interface PipelineMonthBucket {
  monthLabel: string;
  monthIso:   string;
  submitted:  number;
  quoted:     number;
  bound:      number;
}

export interface Pipeline {
  months:      PipelineMonthBucket[];
  generatedAt: string;
}

export const PIPELINE_SERIES_ORDER: readonly PipelineSeriesKey[] = [
  'submitted',
  'quoted',
  'bound',
] as const;
