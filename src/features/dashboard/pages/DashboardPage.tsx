import { PageHeader } from '@/components/layout';
import { ErrorBoundary, PanelErrorState } from '@/components/common/ErrorBoundary';
import { colors, fonts } from '@/theme/tokens';
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
        action={
          <button
            style={{
              display:      'flex',
              alignItems:   'center',
              gap:          8,
              height:       44,
              padding:      '0 20px',
              background:   colors.accentGold,
              color:        colors.bgSurface,
              fontSize:     14,
              fontWeight:   700,
              border:       'none',
              borderRadius: 0,
              cursor:       'pointer',
              fontFamily:   fonts.sans,
            }}
          >
            + New Submission
          </button>
        }
      />
      <div className="space-y-6">
        <ErrorBoundary fallback={(_err, reset) => <PanelErrorState panelName="KPI Row" onRetry={reset} />}>
          <KpiRowContainer />
        </ErrorBoundary>
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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
