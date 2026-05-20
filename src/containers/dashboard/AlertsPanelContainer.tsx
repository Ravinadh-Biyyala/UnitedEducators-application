import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useGetAlertsQuery } from '@/services/alerts/alertsApi';
import { AlertsPanel } from '@/components/domain/AlertsPanel';
import { formatAlertTimestamp } from '@/shared/utils';
import {
  ALERT_FILTER_PARAM,
  DEFAULT_ALERT_FILTER,
  isValidAlertFilter,
} from '@/shared/types/alerts';
import type { AlertFilter } from '@/shared/types';

export function AlertsPanelContainer() {
  const { data } = useGetAlertsQuery();
  const [params, setParams] = useSearchParams();

  const raw           = params.get(ALERT_FILTER_PARAM);
  const activeFilter: AlertFilter = isValidAlertFilter(raw) ? raw : DEFAULT_ALERT_FILTER;

  const handleFilterChange = (next: AlertFilter) => {
    setParams((prev) => {
      const updated = new URLSearchParams(prev);
      if (next === DEFAULT_ALERT_FILTER) {
        updated.delete(ALERT_FILTER_PARAM);
      } else {
        updated.set(ALERT_FILTER_PARAM, next);
      }
      return updated;
    }, { replace: true });
  };

  const allAlerts = data?.alerts ?? [];

  const filteredAlerts = useMemo(() => {
    if (activeFilter === 'all') return allAlerts;
    return allAlerts.filter((a) => a.severity === activeFilter);
  }, [allAlerts, activeFilter]);

  const alertTimestamps = useMemo(
    () => Object.fromEntries(allAlerts.map((a) => [a.id, formatAlertTimestamp(a.createdAt)])),
    [allAlerts],
  );

  const totalCriticalCount = allAlerts.filter((a) => a.severity === 'critical').length;
  const totalWarningCount  = allAlerts.filter((a) => a.severity === 'warning').length;

  const handleViewAllClick = () => {
    // TODO: navigate to /alerts page
    console.log('[Alerts] view all clicked');
  };

  if (!data) return null;

  return (
    <AlertsPanel
      alerts={filteredAlerts}
      alertTimestamps={alertTimestamps}
      activeFilter={activeFilter}
      onFilterChange={handleFilterChange}
      totalCriticalCount={totalCriticalCount}
      totalWarningCount={totalWarningCount}
      onViewAllClick={handleViewAllClick}
    />
  );
}
