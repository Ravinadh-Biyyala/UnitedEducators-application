# Dashboard Implementation Tracker

> Status of each phase. Update as you complete each one.

## Phases overview

| # | Phase | Status | Spec file | Run? |
|---|---|---|---|---|
| 1 | App Shell + Layout | spec ready | `dashboard-phase-1-app-shell.md` | [ ] |
| 2 | Dashboard Page Skeleton | planned | `dashboard-phase-2-page-skeleton.md` | [ ] |
| 3 | KPI Cards Row | implemented | `dashboard-phase-3-kpi-cards.md` | [x] |  <!-- labels + footer corrected 2026-04-28 -->
| 4 | Submissions Table Panel | planned | `dashboard-phase-4-submissions-table.md` | [ ] |
| 5 | Submission Pipeline Chart | planned | `dashboard-phase-5-pipeline-chart.md` | [ ] |
| 6 | Open Tasks Panel | planned | `dashboard-phase-6-open-tasks.md` | [ ] |
| 7 | Alerts & Flags Panel | planned | `dashboard-phase-7-alerts.md` | [ ] |
| 8 | Portfolio Snapshot + Team Performance | planned | `dashboard-phase-8-snapshot-and-team.md` | [ ] |

## Status legend

- **planned** — not yet specced; will be authored when the previous phase is done
- **spec ready** — PRD written, ready to run with Claude in VS Code
- **in progress** — Claude is generating / you're iterating
- **implemented** — code merged, lint + type-check pass, visually matches Figma

## How to use this tracker

After completing each phase:

1. Verify acceptance criteria in that phase's spec
2. Run `npm run lint && npm run type-check` — both pass
3. Update the row above to `implemented`
4. Tell Claude: *"Phase N is implemented. Generate Phase N+1 spec."*
5. Receive the next phase PRD with the same structure

## Why phased?

- **Each phase is independently shippable.** Phase 1 done = the shell works for every page, even if Dashboard body is empty.
- **Failures stay isolated.** If Phase 4 (the most complex) goes wrong, Phases 1–3 are unaffected.
- **Easier review.** Reviewing a 200-line diff is much faster than a 2,000-line one.
- **Compounds.** Domain components built in early phases (KpiCard, SectionCard) get reused later. Building all at once would mean duplicating them.

## What to do if a phase fails

If Claude's output doesn't satisfy the acceptance criteria:

1. Don't restart from scratch — paste the failures back into the chat and ask Claude to fix specific items
2. If Claude keeps getting one thing wrong, update `_PROMPT.md` or `.cursorrules` so the next phase doesn't hit it
3. Worst case: revert that phase's changes (`git checkout .`) and re-run with a clarified spec

## Dependencies between phases

```
Phase 1 (Shell)
   └─► Phase 2 (Page skeleton)
          ├─► Phase 3 (KPIs)
          ├─► Phase 4 (Submissions table)
          ├─► Phase 5 (Pipeline chart)
          ├─► Phase 6 (Tasks)
          ├─► Phase 7 (Alerts)
          └─► Phase 8 (Snapshot + Team)
```

Phases 3–8 are independent of each other once Phase 2 lands. You could even run them in parallel if you want, though serial keeps the mental model clean.