import { PageHeader } from '@/components/layout';
import { ErrorBoundary, PanelErrorState } from '@/components/common/ErrorBoundary';
import {
  AlertsPanelContainer,
  KpiRowContainer,
  OpenTasksPanelContainer,
  PipelinePanelContainer,
  PortfolioSnapshotContainer,
  SubmissionsTableContainer,
  TeamPerformanceContainer,
} from '@/containers/dashboard';

export function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle={`Robert Chen · Education Practice · ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`}
       
        
      />
      <div className="space-y-6">
        <ErrorBoundary fallback={(_err, reset) => <PanelErrorState panelName="KPI Row" onRetry={reset} />}>
          <KpiRowContainer />
        </ErrorBoundary>
<div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-4 items-start">
          <div className="flex flex-col gap-4">
    <ErrorBoundary fallback={(_err, reset) => <PanelErrorState panelName="Submissions" onRetry={reset} />}>
              <SubmissionsTableContainer />
            </ErrorBoundary>
            <ErrorBoundary fallback={(_err, reset) => <PanelErrorState panelName="Pipeline" onRetry={reset} />}>
              <PipelinePanelContainer />
            </ErrorBoundary>
            <ErrorBoundary fallback={(_err, reset) => <PanelErrorState panelName="Team Performance" onRetry={reset} />}>
              <TeamPerformanceContainer />
            </ErrorBoundary>
          </div>
          <div className="flex flex-col gap-4">
   <ErrorBoundary fallback={(_err, reset) => <PanelErrorState panelName="Open Tasks" onRetry={reset} />}>
              <OpenTasksPanelContainer />
            </ErrorBoundary>
            <ErrorBoundary fallback={(_err, reset) => <PanelErrorState panelName="Alerts & Flags" onRetry={reset} />}>
              <AlertsPanelContainer />
            </ErrorBoundary>
            <ErrorBoundary fallback={(_err, reset) => <PanelErrorState panelName="Portfolio Snapshot" onRetry={reset} />}>
              <PortfolioSnapshotContainer />
            </ErrorBoundary>
          </div>
        </div>
      </div>
    </>
  );
}
