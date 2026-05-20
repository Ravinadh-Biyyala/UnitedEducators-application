export type AlertSeverity = 'critical' | 'warning' | 'info';

export type AlertFilter = 'all' | 'critical' | 'warning';

export interface Alert {
  id:           string;
  title:        string;
  body:         string;
  submissionId: string;
  severity:     AlertSeverity;
  createdAt:    string;
}

export interface AlertsResponse {
  alerts:      Alert[];
  generatedAt: string;
}

export const ALERT_FILTER_PARAM = 'alertFilter';
export const DEFAULT_ALERT_FILTER: AlertFilter = 'all';

export function isValidAlertFilter(v: string | null): v is AlertFilter {
  return v === 'critical' || v === 'warning';
}
