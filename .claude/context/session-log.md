# Session Log
> Auto-updated by /feature at the end of every implementation.
> Each entry: date, page, phase, files created/modified.

---

## 2026-05-05 — new-submission-n3 (NewSubmission page)
**Phase:** New Submission N3 — Form Sections
**Design source:** src-design/pages/NewSubmissionPage.tsx

### Files created
| File | Type | Notes |
|------|------|-------|
| src/components/common/AccountSearchInput.tsx | common | typeahead search input |
| src/components/common/FormField.tsx | common | label + error wrapper |
| src/components/common/Input.tsx | common | base text input |
| src/components/common/MultiSelect.tsx | common | multi-value select |
| src/components/common/Select.tsx | common | single-value select |
| src/components/common/DateInput.tsx | common | date picker input |

### Files modified
| File | Change |
|------|--------|
| src/components/common/index.ts | added 6 new exports |
| src/containers/submissions/NewSubmissionContainer.tsx | wired form sections |

---

## 2026-05-05 — new-submission-n2 (NewSubmission page)
**Phase:** New Submission N2 — Header / Type Cards / Sidebar
**Design source:** src-design/pages/NewSubmissionPage.tsx

### Files created
| File | Type | Notes |
|------|------|-------|
| src/components/common/SectionPanel.tsx | common | collapsible section wrapper |
| src/components/domain/StageProgress.tsx | domain | submission stage stepper |
| src/components/domain/RequiredFieldsCounter.tsx | domain | fields remaining counter |
| src/components/domain/SubmissionTypeCard.tsx | domain | type selection card |
| src/components/domain/LabelValueRow.tsx | domain | label+value display row |

### Files modified
| File | Change |
|------|--------|
| src/components/common/index.ts | added SectionPanel |
| src/components/domain/index.ts | added 4 new exports |
| src/features/submissions/pages/NewSubmissionPage.tsx | added header band + type cards + sidebar |

---

## 2026-05-05 — new-submission-n1 (NewSubmission page)
**Phase:** New Submission N1 — Foundation
**Design source:** src-design/pages/NewSubmissionPage.tsx

### Files created
| File | Type | Notes |
|------|------|-------|
| src/features/submissions/pages/NewSubmissionPage.tsx | page | route scaffold + ErrorBoundary regions |
| src/containers/submissions/NewSubmissionContainer.tsx | container | RHF + zod scaffold |
| src/services/submissions/lookupsApi.ts | service | 3 lookup endpoints |
| src/shared/types/newSubmission.ts | types | full form schema types |

### Files modified
| File | Change |
|------|--------|
| src/app/routes.tsx | added /submissions/new route |
| src/features/submissions/index.ts | exported NewSubmissionPage |

---

## 2026-05-04 — submissions-s3 (Submissions page)
**Phase:** Submissions S3 — Tabs + Filters Drawer
**Design source:** src-design/pages/Submissions.tsx

### Files created
| File | Type | Notes |
|------|------|-------|
| src/components/common/Drawer.tsx | common | right-anchored Radix Dialog drawer |
| src/hooks/dashboard/useSubmissionsUrlState.ts | hook | URL-backed filter state |

### Files modified
| File | Change |
|------|--------|
| src/features/submissions/pages/SubmissionsPage.tsx | added tabs + filters drawer trigger |
| src/containers/submissions/SubmissionsTableContainer.tsx | reads filters from URL |
| src/components/common/index.ts | added Drawer |

---

## 2026-05-04 — submissions-s2 (Submissions page)
**Phase:** Submissions S2 — Header Band
**Design source:** src-design/pages/Submissions.tsx

### Files created
| File | Type | Notes |
|------|------|-------|
| — | — | No new files; all reuse |

### Files modified
| File | Change |
|------|--------|
| src/features/submissions/pages/SubmissionsPage.tsx | added header band with search + buttons |

---

## 2026-04-29 — dashboard-phase-3 (Dashboard page)
**Phase:** Dashboard Phase 3 — KPI Cards Row
**Design source:** src-design/pages/Dashboard.tsx

### Files created
| File | Type | Notes |
|------|------|-------|
| src/components/domain/KpiCard.tsx | domain | KPI card with trend + icon |
| src/containers/dashboard/KpiRowContainer.tsx | container | fetches 5 KPIs |
| src/services/dashboard/dashboardApi.ts | service | getKpis endpoint |
| src/shared/types/dashboard.ts | types | KpiData, TrendDirection |

### Files modified
| File | Change |
|------|--------|
| src/features/dashboard/pages/DashboardPage.tsx | added KPI row |
| src/components/domain/index.ts | added KpiCard |
| src/app/store.ts | registered dashboardApi |

---
<!-- session-log-end: append new sessions above this line -->
