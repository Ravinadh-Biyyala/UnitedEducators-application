# Component Registry
> Auto-maintained by /feature and /ctx skills.
> Primary inventory source — /ctx reads this instead of scanning folders.
> Update this file after every implementation session.

---

## components/common/
| Component | File | Props | Added in | Page |
|-----------|------|-------|----------|------|
| Button | src/components/common/Button.tsx | variant, size, loading, disabled, onClick, children | initial | — |
| Input | src/components/common/Input.tsx | type, label, error, placeholder, value, onChange | initial | — |
| Select | src/components/common/Select.tsx | options, value, onChange, error, label | initial | — |
| MultiSelect | src/components/common/MultiSelect.tsx | options, value, onChange | initial | — |
| DateInput | src/components/common/DateInput.tsx | value, onChange, error | initial | — |
| Modal | src/components/common/Modal.tsx | open, onClose, title, children | initial | — |
| Tabs | src/components/common/Tabs.tsx | tabs[], activeTab, onChange | initial | — |
| Table | src/components/common/Table.tsx | columns[], data[], loading | initial | — |
| FormField | src/components/common/FormField.tsx | label, error, required, children | initial | — |
| Drawer | src/components/common/Drawer.tsx | open, onClose, anchor, children | initial | — |

## components/domain/
| Component | File | Props | Added in | Page |
|-----------|------|-------|----------|------|
| StatusBadge | src/components/domain/StatusBadge.tsx | status: SubmissionStatus | initial | — |
| KpiCard | src/components/domain/KpiCard.tsx | title, value, trend, icon | dashboard-phase-3 | Dashboard |
| SubmissionsTable | src/components/domain/SubmissionsTable.tsx | submissions[], loading, onRowClick | dashboard-phase-4 | Dashboard |
| AlertsPanel | src/components/domain/AlertsPanel.tsx | alerts[], loading | dashboard-phase-? | Dashboard |
| PipelinePanel | src/components/domain/PipelinePanel.tsx | pipeline[], loading | dashboard-phase-5 | Dashboard |
| OpenTasksPanel | src/components/domain/OpenTasksPanel.tsx | tasks[], loading, onFilterChange | dashboard-phase-6 | Dashboard |
| TeamPerformancePanel | src/components/domain/TeamPerformancePanel.tsx | metrics[], loading | dashboard-phase-9 | Dashboard |
| PortfolioSnapshotPanel | src/components/domain/PortfolioSnapshotPanel.tsx | snapshot, loading | dashboard-phase-8 | Dashboard |
| CardShell | src/components/domain/CardShell.tsx | title, actions?, children | initial | — |
| PanelErrorState | src/components/domain/PanelErrorState.tsx | name, onRetry | initial | — |

## components/layout/
| Component | File | Props | Added in | Page |
|-----------|------|-------|----------|------|
| AppShell | src/components/layout/AppShell.tsx | children | dashboard-phase-1 | — |
| Sidebar | src/components/layout/Sidebar.tsx | collapsed, onToggle | dashboard-phase-1 | — |
| TopBar | src/components/layout/TopBar.tsx | user, onMenuClick | dashboard-phase-1 | — |
| PageHeader | src/components/layout/PageHeader.tsx | title, breadcrumbs, actions | initial | — |

## hooks/
| Hook | File | Returns | Added in | Page |
|------|------|---------|----------|------|
| useDisclosure | src/hooks/common/useDisclosure.ts | open, close, toggle, isOpen | initial | — |
| useSubmissionsUrlState | src/hooks/dashboard/useSubmissionsUrlState.ts | filters, setFilters | submissions-s3 | Submissions |
| useDebounce | src/hooks/common/useDebounce.ts | debouncedValue | initial | — |

## containers/
| Container | File | Fetches | Renders | Added in | Page |
|-----------|------|---------|---------|----------|------|
| SubmissionsTableContainer | src/containers/dashboard/SubmissionsTableContainer.tsx | useGetSubmissionsQuery | SubmissionsTable | dashboard-phase-4 | Dashboard |
| KpiRowContainer | src/containers/dashboard/KpiRowContainer.tsx | useGetKpisQuery | KpiCard x5 | dashboard-phase-3 | Dashboard |
| AlertsPanelContainer | src/containers/dashboard/AlertsPanelContainer.tsx | useGetAlertsQuery | AlertsPanel | dashboard-phase-? | Dashboard |
| PipelinePanelContainer | src/containers/dashboard/PipelinePanelContainer.tsx | useGetPipelineQuery | PipelinePanel | dashboard-phase-5 | Dashboard |
| OpenTasksPanelContainer | src/containers/dashboard/OpenTasksPanelContainer.tsx | useGetOpenTasksQuery | OpenTasksPanel | dashboard-phase-6 | Dashboard |
| TeamPerformancePanelContainer | src/containers/dashboard/TeamPerformancePanelContainer.tsx | useGetTeamMetricsQuery | TeamPerformancePanel | dashboard-phase-9 | Dashboard |
| PortfolioSnapshotContainer | src/containers/dashboard/PortfolioSnapshotContainer.tsx | useGetPortfolioSnapshotQuery | PortfolioSnapshotPanel | dashboard-phase-8 | Dashboard |
| NewSubmissionContainer | src/containers/submissions/NewSubmissionContainer.tsx | useCreateSubmissionMutation | NewSubmissionPage form | new-submission-n1 | NewSubmission |

## services/
| API | File | Endpoints | Added in |
|-----|------|-----------|----------|
| submissionsApi | src/services/submissions/submissionsApi.ts | getSubmissions, getSubmission, createSubmission, updateSubmission | submissions-s1 |
| dashboardApi | src/services/dashboard/dashboardApi.ts | getKpis, getAlerts, getPipeline, getOpenTasks, getTeamMetrics, getPortfolioSnapshot | dashboard-phase-3 |

## features/pages/
| Page | File | Route | Added in |
|------|------|-------|----------|
| DashboardPage | src/features/dashboard/pages/DashboardPage.tsx | /dashboard | dashboard-phase-1 |
| SubmissionsPage | src/features/submissions/pages/SubmissionsPage.tsx | /submissions | submissions-s1 |
| NewSubmissionPage | src/features/submissions/pages/NewSubmissionPage.tsx | /submissions/new | new-submission-n1 |

---
<!-- registry-end -->
