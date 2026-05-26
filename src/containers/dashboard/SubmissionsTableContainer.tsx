import { useState } from 'react';
import { useGetSubmissionsQuery } from '@/services/submissions/submissionsApi';
import { SubmissionsTable } from '@/components/domain';
import { PanelErrorState } from '@/components/common/ErrorBoundary/PanelErrorState';
import type { SubmissionStatus } from '@/shared/types';

type Scope = 'Mine' | 'Team' | 'All';
type FilterValue = SubmissionStatus | 'All';

const SCOPE_STATUSES: Record<Scope, SubmissionStatus[] | null> = {
  Mine: ['InReview', 'PendingInfo'],
  Team: null,
  All:  null,
};

export function SubmissionsTableContainer() {
  const { data, isLoading, error, refetch } = useGetSubmissionsQuery();
  const [scope, setScope] = useState<Scope>('Team');
  const [filterStatus, setFilterStatus] = useState<FilterValue>('All');

  if (error) return <PanelErrorState panelName="Submissions" onRetry={refetch} />;
  if (isLoading && !data) {
    return (
      <div
        role="status"
        aria-busy="true"
        aria-label="Loading submissions"
        className="bg-white border border-neutral-200 animate-pulse"
        style={{ minHeight: 240 }}
      />
    );
  }

  const all = data ?? [];
  const scopeFiltered = SCOPE_STATUSES[scope]
    ? all.filter((s) => (SCOPE_STATUSES[scope] as SubmissionStatus[]).includes(s.status))
    : all;
  const rows = (filterStatus === 'All'
    ? scopeFiltered
    : scopeFiltered.filter((s) => s.status === filterStatus)).slice(0, 5);

  return (
    <SubmissionsTable
      submissions={rows}
      scope={scope}
      onScopeChange={(s) => { setScope(s); setFilterStatus('All'); }}
      filterStatus={filterStatus}
      onFilterChange={setFilterStatus}
    />
  );
}
