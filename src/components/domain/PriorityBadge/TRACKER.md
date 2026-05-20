# Implementation Tracker

> **Tracks phased work across every screen in the app.**
> Each screen has its own section. Add a new section when starting a new screen.
> Claude updates this file at the end of every phase per `CLAUDE.md` Workflow Step 5.

## Status legend

- **planned** — not yet specced
- **spec ready** — PRD written in `specs/`, ready to implement
- **in progress** — Claude is generating / iterating
- **implemented** — code merged, lint + type-check pass, visually matches Figma

---

## Dashboard

| # | Phase | Status | Spec file | Completed |
|---|---|---|---|---|
| 1 | App Shell + Layout | implemented | `dashboard-phase-1-app-shell.md` | 2026-04-28 |
| 2 | Dashboard Page Skeleton | implemented | _(implicit — header + grid in place)_ | 2026-04-28 |
| 3 | KPI Cards Row (Figma refinement) | spec ready | `dashboard-phase-3-kpi-cards.md` | — |
| 4 | Submissions Table Panel | planned | `dashboard-phase-4-submissions-table.md` | — |
| 5 | Submission Pipeline Chart | planned | `dashboard-phase-5-pipeline-chart.md` | — |
| 6 | Open Tasks Panel | planned | `dashboard-phase-6-open-tasks.md` | — |
| 7 | Alerts & Flags Panel | planned | `dashboard-phase-7-alerts.md` | — |
| 8 | Portfolio Snapshot + Team Performance | planned | `dashboard-phase-8-snapshot-and-team.md` | — |

---

## Login

| # | Phase | Status | Spec file | Completed |
|---|---|---|---|---|
| 1 | Login Page (single-shot) | spec ready | `login.md` | — |

---

## Submissions

> Add phases here when you start the Submissions list / detail screens.

| # | Phase | Status | Spec file | Completed |
|---|---|---|---|---|
| — | — | — | — | — |

---

## Future screens

When starting a new screen (Tasks, Inbox, Portfolio, Appetite Rules, etc.), copy this template:

```markdown
## <Screen Name>

| # | Phase | Status | Spec file | Completed |
|---|---|---|---|---|
| 1 | <Phase 1 name> | planned | `<screen>-phase-1-<slug>.md` | — |
```