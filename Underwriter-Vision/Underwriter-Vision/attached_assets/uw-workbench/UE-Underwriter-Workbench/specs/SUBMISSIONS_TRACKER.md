# Submissions Implementation Tracker

> Status of each phase. Update as you complete each one.
> Separate from `TRACKER.md` (dashboard). Submissions phases are prefixed with `S`.

## Phases overview

| # | Phase | Status | Spec file | Run? |
|---|---|---|---|---|
| S1 | Foundation & Route | implemented | `submissions-phase-1-foundation.md` | [x] |
| S2 | Header (blue band + KPI tiles + buttons) | implemented | `submissions-phase-2-header.md` | [x] |
| S3 | Scope Tabs + Filters Drawer (URL state, all 8 groups) | implemented | `submissions-phase-3-tabs-filters.md` | [x] |
| S4 | List Table (sortable + pagination + atoms) | planned | `submissions-phase-4-list-table.md` | [ ] |
| S5 | Polish (loading skeletons, empty state, a11y) | planned | `submissions-phase-5-polish.md` | [ ] |

## Notes

- **2026-05-03 (S1):** Foundation route mounted at `/submissions` with 4
  ErrorBoundary-wrapped placeholder regions, two new RTK Query endpoints
  (`useGetSubmissionsHeaderQuery`, `useGetSubmissionsListQuery`) backed by a
  25-row mock, and the full submissions token block in `theme/tokens.ts`.
  S1 also included a one-time refactor of `SubmissionStatus` to PascalCase
  identifiers + a `statusLabels` display map. All dashboard and submissions
  code now uses PascalCase status keys (`'InReview'`, `'PendingInfo'`); UI
  text for status reads `statusLabels[status]`.
- **2026-05-04 (S3):** Filters moved from a left sidebar to a right-anchored
  drawer triggered from the tabs row. New shared atom
  `components/common/Drawer/` built on `@radix-ui/react-dialog` (one new
  dep — shadcn was skipped to avoid a heavy init that would have rewritten
  Tailwind config and added 4+ deps). New `useSubmissionsUrlState` hook in
  `features/submissions/hooks/` is the single source of truth for URL
  state — wraps the S1 `submissionsUrlParams.ts` parsers, adds setters
  that auto-reset `page` to 1 on filter change, and computes
  `activeFilterCount` for the badge. `SubmissionsFiltersSidebar` was
  renamed to `SubmissionsFiltersDrawer` (filesystem rename — not a git
  repo). 8 filter groups iterated from
  `SUBMISSIONS_FILTER_GROUPS_DISPLAY_ORDER`; each group's sub-renderer is
  private to the file. `DEFAULT_SCOPE` flipped from `'all'` to `'mine'`
  per spec. New token group `submissionsFiltersDrawerStyles` added (no
  drawer Figma frame was provided, so values derive from S1 tokens +
  standard dialog conventions). `submissionsRouteDims.filtersWidth`,
  `filtersBorderRight`, and `submissionsFiltersStyles.width` marked
  `@deprecated` but kept exported. Drawer body is wrapped in its own
  ErrorBoundary so chrome (header, close, footer) survives a body crash;
  the page-level Filters ErrorBoundary was removed since the drawer is
  now triggered from inside the tabs region. Tiny `cn` helper added at
  `src/lib/cn.ts` (no clsx/tailwind-merge dep).
- **2026-05-04 (S2):** Header band fully rendered against Figma node
  520-29725 (single MCP fetch). Title block + Export / New Submission
  buttons + 5 KPI tiles. Includes Figma chrome the prompt didn't mention:
  4px gold gradient strip on top, 0.8px white-alpha-10 stroke between
  title row and tiles row, 0.8px white-alpha-10 right separator on each
  tile. Three S1 token values were corrected to match live Figma
  (`submissionsHeaderTileStyles.labelColor` opaque-white → 45%-alpha,
  `valueWeight` 700 → 800, and the 182px tile width is now treated as a
  fallback only — desktop uses `lg:grid-cols-5` to divide the band into 5
  equal columns of ~253px). Three new token groups appended to section 12:
  `submissionsHeaderTitleStyles`, `submissionsHeaderButtonStyles`,
  `submissionsHeaderChromeStyles`, plus the `submissionsHeaderTileFormat`
  formatter map. Both buttons are visually interactive but no-op.
  `HeaderKpiTile` / `ExportButton` / `NewSubmissionButton` /
  `HeaderKpiSkeleton` are private to `SubmissionsHeader.tsx` (no separate
  files, no INDEX entries). Other 3 regions still placeholder.

## Status legend

- **planned** — not yet specced; will be authored when previous phase is done
- **spec ready** — PRD written, ready to run with Claude in VS Code
- **in progress** — Claude is generating / iterating
- **implemented** — code merged, lint + type-check pass, visually matches Figma

## How to use this tracker

After completing each phase:

1. Verify acceptance criteria in that phase's spec
2. Run `npm run lint && npm run type-check` — both pass
3. Update the row above to `implemented`
4. Tell Claude: *"Submissions Phase SN is implemented. Generate Phase SN+1 spec."*
5. Receive next phase PRD with the same structure

## What ships visually after each phase

- **After S1:** `/submissions` route renders. 4 ErrorBoundary regions with "Loading…" placeholders. Sidebar highlights Submissions. Mocks return data. **Page is intentionally mostly empty.**
- **After S2:** Blue header band fully rendered with title, Export + New Submission buttons, 5 KPI tiles showing real values from mock.
- **After S3:** Scope tabs (My Queue / My Team / All) and filter sidebar (8 groups) wired to URL params. Filtering and scope switching work; refresh preserves state. List still empty.
- **After S4:** Full data table renders. Sortable columns, pagination, status row stripes, product chips, appetite bar, unassigned warning. Page is feature-complete read-only.
- **After S5:** Loading skeletons replace "Loading…", empty state when no results, keyboard nav, aria-sort on sortable headers, lighthouse a11y ≥ 95.

## Dependencies between phases

```
S1 (Foundation)
   └─► S2 (Header)
   └─► S3 (Tabs + Filters)
   └─► S4 (List Table)
          └─► S5 (Polish)
```

S2/S3/S4 depend on S1 only. They are mutually independent and could ship in any order — but recommend S2 → S3 → S4 because S3's filtering only becomes visible/testable once S4 renders rows. S5 must come last (polishes whatever S2–S4 produced).

## What to do if a phase fails

If Claude's output doesn't satisfy acceptance criteria:

1. Don't restart — paste the failures back and ask Claude to fix specific items
2. If Claude keeps getting one thing wrong, update `CLAUDE.md` or the prompt so the next phase doesn't hit it
3. Worst case: revert that phase (`git checkout .`) and re-run with a clarified spec

## Cross-tracker dependencies

- **Submissions S1 depends on Dashboard Phase 1 (App Shell)** being implemented — needs `AppShell`, `Sidebar`, `TopBar`, `ErrorBoundary`, `PanelErrorState`.
- **Submissions S4 will depend on shared atoms** that get added to `components/common/` and `components/domain/` — `Pagination`, `SortableColumnHeader`, `ProductChips`, `AppetiteBar`. These then become available for future Tasks Queue / Inbox / Portfolio routes.
- **Existing dashboard `useGetSubmissionsQuery`** is untouched. Submissions route uses two NEW queries: `useGetSubmissionsHeaderQuery` and `useGetSubmissionsListQuery`.

## Future phases (not yet planned)

- **S6+ (Submission Detail)** — `/submissions/:id` page. First phase with mutations. Will need its own spec for optimistic vs pessimistic updates, error UX, cache invalidation.
- **Bulk actions** — multi-select on table rows, bulk assign/decline. Likely after detail page lands.
- **Saved filter views** — "My open EPL submissions in CA" presets. URL-shareable.
- **Export to CSV/XLSX** — wire the Export button (currently no-op).