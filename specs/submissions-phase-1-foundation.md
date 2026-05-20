# Submissions Phase S1 — Foundation & Route

> Status: spec ready
> Phase track: Submissions (S1–S5), separate from Dashboard tracker
> Prerequisite: Dashboard Phase 1 (App Shell) implemented — `AppShell`, `Sidebar`, `TopBar` exist

## Goal

Mount `/submissions` as a new route inside the existing `AppShell` outlet, with a skeleton page that renders 4 `<ErrorBoundary>`-wrapped placeholder regions corresponding to the 4 page-level components that will land in S2–S4. No new visual content yet beyond region outlines and "Loading…" placeholders. This phase establishes:

1. Routing entry
2. Service layer (two new RTK Query endpoints with mock data)
3. Type system additions
4. Token additions for the entire submissions feature
5. Empty container shells wired to services
6. Empty pure-render component shells
7. Error boundary topology

## Out of scope (deferred to later phases)

- S2: Header content (title + buttons + 5 KPI tiles)
- S3: Scope tabs + filter sidebar (all 8 filter groups)
- S4: List table (sortable headers, rows, pagination, all atoms)
- S5: Loading skeletons, empty states, a11y polish

## Architecture (unchanged from CLAUDE.md)

Three-layer flow per existing convention:
```
services/submissions/submissionsApi.ts
   └── useGetSubmissionsHeaderQuery()         ← NEW
   └── useGetSubmissionsListQuery(params)     ← NEW
        ↓
containers/submissions/  (data fetching + URL params)
        ↓
components/domain/  (pure render)
```

Existing `useGetSubmissionsQuery` (dashboard) is untouched. The new queries are separate; the dashboard panel and submissions route do not share data shape.

## Files to create

### Routing
- `src/app/router.tsx` (or wherever existing routes live) — **edit only**, add one route

### Service layer
- `src/services/submissions/submissionsApi.ts` — **extend existing file** with two new queries
- `src/services/submissions/mocks/submissionsListMock.ts` — **NEW**, 25 mock submissions for pagination

### Types
- `src/shared/types/submissions.ts` — **extend** with new types
- `src/shared/types/index.ts` — re-export new types

### Tokens
- `src/theme/tokens.ts` — **extend** with submissions-feature tokens (full file delivered, cumulative)

### Page + containers + components (all NEW, all empty shells)
- `src/features/submissions/pages/SubmissionsPage.tsx`
- `src/containers/submissions/SubmissionsHeaderContainer.tsx`
- `src/containers/submissions/SubmissionsScopeTabsContainer.tsx`
- `src/containers/submissions/SubmissionsFiltersContainer.tsx`
- `src/containers/submissions/SubmissionsListContainer.tsx`
- `src/components/domain/SubmissionsHeader/SubmissionsHeader.tsx`
- `src/components/domain/SubmissionsHeader/index.ts`
- `src/components/domain/SubmissionsScopeTabs/SubmissionsScopeTabs.tsx`
- `src/components/domain/SubmissionsScopeTabs/index.ts`
- `src/components/domain/SubmissionsFiltersSidebar/SubmissionsFiltersSidebar.tsx`
- `src/components/domain/SubmissionsFiltersSidebar/index.ts`
- `src/components/domain/SubmissionsListTable/SubmissionsListTable.tsx`
- `src/components/domain/SubmissionsListTable/index.ts`

### Sidebar nav
- `src/components/layout/Sidebar/Sidebar.tsx` — **verify** the existing "Submissions" item points to `/submissions`. If it doesn't, edit it.

## Type additions (`shared/types/submissions.ts`)

```ts
// Existing types untouched. Add:

export type SubmissionsScope = 'mine' | 'team' | 'all';

export type SubmissionsSortField =
  | 'memberInstitution'
  | 'status'
  | 'estPremium'
  | 'appetite'
  | 'days'
  | 'submitted';

export type SubmissionsSortDirection = 'asc' | 'desc';

export interface SubmissionsSort {
  field: SubmissionsSortField;
  direction: SubmissionsSortDirection;
}

// Filter param shape (URL-driven)
export interface SubmissionsFilterParams {
  q?: string;                         // keyword search
  status?: SubmissionStatus[];        // multi-select
  priority?: SubmissionPriority[];    // multi-select
  products?: ProductLine[];           // multi-select
  states?: string[];                  // 2-letter codes
  brokers?: string[];                 // broker IDs or names
  underwriters?: string[];            // 'unassigned' | underwriter ID
  submittedFrom?: string;             // ISO date
  submittedTo?: string;               // ISO date
}

export type ProductLine = 'EPL' | 'ELL' | 'GL' | 'ML' | 'Cyber' | 'Property' | 'Crime' | 'Auto' | 'SA';

// Header KPI strip
export interface SubmissionsHeaderStats {
  totalSubmissions: number;
  inReview: number;
  quoted: number;
  boundYtd: number;
  boundPremiumYtd: number;            // dollars (raw number, format on render)
}

// List query
export interface SubmissionsListQuery {
  scope: SubmissionsScope;
  filters: SubmissionsFilterParams;
  sort: SubmissionsSort;
  page: number;                       // 1-indexed
  pageSize: number;                   // default 10
}

export interface SubmissionsListResponse {
  items: Submission[];
  total: number;
  page: number;
  pageSize: number;
}

// Days-to-submission threshold (from tokens)
export type DaysOpenSeverity = 'normal' | 'warning' | 'critical';
```

## Token additions (`theme/tokens.ts`)

All values from Figma JSON. Cumulative file — do NOT remove existing tokens.

```ts
// ===== Submissions route (Phase S1) =====

export const submissionsRouteDims = {
  // Header band
  headerBandHeight: 156,
  headerBandPaddingX: 32,
  headerBandPaddingY: 20,

  // Scope tabs row
  scopeTabsHeight: 62,
  scopeTabsPaddingX: 32,
  scopeTabsPaddingY: 12,

  // Layout
  filtersWidth: 252,
  filtersBorderRight: 1,

  // List table area (right of filters)
  listMinHeight: 600,
} as const;

export const submissionsHeaderTileStyles = {
  width: 182,
  height: 61,
  paddingX: 24,
  paddingY: 12,
  gap: 2,
  labelColor: colors.white,
  labelSize: 9,
  labelWeight: 600,
  valueColor: colors.white,
  valueSize: 18,
  valueWeight: 700,
} as const;

// 5-tile DISPLAY_ORDER for header
export const SUBMISSIONS_HEADER_TILES_DISPLAY_ORDER = [
  'totalSubmissions',
  'inReview',
  'quoted',
  'boundYtd',
  'boundPremiumYtd',
] as const;

export type SubmissionsHeaderTileKey = typeof SUBMISSIONS_HEADER_TILES_DISPLAY_ORDER[number];

export const submissionsHeaderTileLabels: Record<SubmissionsHeaderTileKey, string> = {
  totalSubmissions: 'Total Submissions',
  inReview: 'In Review',
  quoted: 'Quoted',
  boundYtd: 'Bound (YTD)',
  boundPremiumYtd: 'Bound Premium (YTD)',
};

export const submissionsScopeTabsStyles = {
  height: 62,
  paddingX: 32,
  tabHeight: 37,
  tabFontSize: 13,
  inactiveColor: colors.slate600,        // rgb(74, 93, 110)
  inactiveWeight: 400,
  activeColor: colors.brandBlue,         // rgb(1, 35, 212)
  activeWeight: 700,
  activeUnderlineColor: colors.brandGold, // rgb(201, 162, 39)
  activeUnderlineHeight: 2,
  resultsCountColor: colors.slate600,
  resultsCountSize: 12,
  filtersToggleHeight: 36,
  filtersToggleWidth: 80,
  filtersToggleBg: colors.brandBlue,
  filtersToggleColor: colors.white,
  filtersToggleSize: 12,
  filtersToggleWeight: 600,
} as const;

// 3-scope DISPLAY_ORDER
export const SUBMISSIONS_SCOPES_DISPLAY_ORDER: SubmissionsScope[] = [
  'mine',
  'team',
  'all',
];

export const submissionsScopeLabels: Record<SubmissionsScope, string> = {
  mine: 'My Queue',
  team: 'My Team',
  all: 'All Submissions',
};

export const submissionsFiltersStyles = {
  width: 252,
  groupBorderColor: colors.slate200,     // rgb(220, 227, 236)
  groupHeaderHeight: 40,
  groupHeaderPaddingX: 20,
  groupHeaderFontSize: 10,
  groupHeaderWeight: 700,
  groupHeaderColor: colors.slate500,     // rgb(122, 143, 163)
  groupBodyPaddingX: 20,
  filterBarBg: colors.slate100,          // rgb(240, 243, 248)
  filterBarHeight: 40,
  resetColor: colors.red700,             // rgb(185, 28, 28)
  resetSize: 10,
  resetWeight: 700,
  checkboxSize: 15,
  checkboxBorder: 2,
  checkboxBorderColor: colors.slate300,  // rgb(196, 205, 216)
  checkboxLabelGap: 10,
  checkboxLabelSize: 12,
  checkboxLabelColor: colors.slate600,
  inputHeight: 34,
  inputPaddingLeft: 30,                  // for search icon
  inputPaddingRight: 8,
  inputBorderColor: colors.slate300,
  dotSize: 7,
  rowHeight: 26,
} as const;

// 8 filter groups in display order
export const SUBMISSIONS_FILTER_GROUPS_DISPLAY_ORDER = [
  'keyword',
  'status',
  'priority',
  'products',
  'jurisdiction',
  'broker',
  'underwriter',
  'submittedDate',
] as const;

export type SubmissionsFilterGroupKey = typeof SUBMISSIONS_FILTER_GROUPS_DISPLAY_ORDER[number];

export const submissionsFilterGroupLabels: Record<SubmissionsFilterGroupKey, string> = {
  keyword: 'Keyword Search',
  status: 'Status',
  priority: 'Priority',
  products: 'Product Lines',
  jurisdiction: 'State / Jurisdiction',
  broker: 'Broker',
  underwriter: 'Assigned Underwriter',
  submittedDate: 'Submission Date',
};

export const submissionsListTableDims = {
  rowMinHeight: 80,
  rowPaddingY: 0,
  rowLeftStripeWidth: 2,
  // Column widths sum to 1014 (table content width)
  colWidths: {
    memberInstitution: 197,
    products: 138,
    status: 76,
    estPremium: 98,
    assignedTo: 108,
    appetite: 88,
    days: 79,
    submitted: 69,
    chevron: 12,
  },
  headerHeight: 40,
  headerBg: colors.white,
  headerBorderColor: colors.slate200,
  headerFontSize: 10,
  headerFontWeight: 700,
  headerInactiveColor: colors.slate500,
  headerActiveColor: colors.brandBlue,
} as const;

// Status row left-edge stripe colors (NEW=blue, In Review=amber, Quoted=red,
// Bound=green, Declined=red, Pending Info=amber)
export const submissionsRowStatusStripes: Record<SubmissionStatus, string> = {
  New: colors.brandBlue,
  InReview: colors.amber600,             // rgb(224, 120, 0) — looks orange in JSON but it's the warning amber
  Quoted: colors.red700,
  Bound: colors.green700,
  Declined: colors.red700,
  PendingInfo: colors.amber600,
};

export const productChipStyles = {
  height: 20,
  paddingX: 6,
  paddingY: 2,
  gap: 4,
  bg: colors.brandBlue,
  textColor: colors.white,
  fontSize: 9,
  fontWeight: 700,
  iconSize: 11,
  iconColor: colors.white,
  rowGap: 4,                              // when chips wrap
} as const;

// 9 product lines in display order (consistent ordering across rows)
export const SUBMISSIONS_PRODUCT_LINES_DISPLAY_ORDER: ProductLine[] = [
  'EPL', 'ELL', 'GL', 'ML', 'Cyber', 'Property', 'Crime', 'Auto', 'SA',
];

export const productLineLabels: Record<ProductLine, string> = {
  EPL: 'EPL',
  ELL: 'ELL',
  GL: 'GL',
  ML: 'ML',
  Cyber: 'Cyber',
  Property: 'Property',
  Crime: 'Crime',
  Auto: 'Auto',
  SA: 'SA',
};

export const appetiteBarStyles = {
  width: 88,
  trackHeight: 5,
  trackBg: colors.slate200,
  fillBg: colors.green700,                // always green per design
  labelSize: 11,
  labelWeight: 700,
  labelColor: colors.green700,
  gap: 4,
} as const;

export const paginationStyles = {
  height: 64,
  paddingX: 24,
  paddingY: 16,
  itemSize: 32,
  prevNextWidth: 62,
  gap: 4,
  inactiveBorderColor: colors.slate300,
  inactiveColor: colors.slate600,
  activeBg: colors.brandBlue,
  activeColor: colors.white,
  activeWeight: 700,
  inactiveSize: 12,
  inactiveWeight: 400,
  prevNextSize: 12,
  prevNextWeight: 600,
  countLabelColor: colors.slate500,
  countLabelSize: 12,
} as const;

export const sortableColumnHeaderStyles = {
  fontSize: 10,
  fontWeight: 700,
  inactiveColor: colors.slate500,
  activeColor: colors.brandBlue,
  iconSize: 11,
  gap: 4,
} as const;

// Days-open severity thresholds (confirmed: <18d normal, 18-20 warning, >=21 critical)
export const daysOpenThresholds = {
  warning: 18,
  critical: 21,
} as const;

export const daysOpenSeverityStyles: Record<DaysOpenSeverity, { color: string; weight: number }> = {
  normal:   { color: colors.green700, weight: 700 },
  warning:  { color: colors.amber700, weight: 700 },  // rgb(180, 83, 9)
  critical: { color: colors.red700,   weight: 700 },
};

export const unassignedStyles = {
  iconColor: colors.amber700,
  textColor: colors.amber700,
  textSize: 12,
  textWeight: 600,
  gap: 4,
} as const;
```

## Service additions (`services/submissions/submissionsApi.ts`)

```ts
// Existing useGetSubmissionsQuery untouched.
// Add these two endpoints:

builder.query<SubmissionsHeaderStats, void>({
  query: () => ({ url: '/submissions/header' }),
  // Mock for now:
  queryFn: async () => ({
    data: {
      totalSubmissions: 18,
      inReview: 5,
      quoted: 3,
      boundYtd: 3,
      boundPremiumYtd: 552_200,
    },
  }),
}),

builder.query<SubmissionsListResponse, SubmissionsListQuery>({
  query: (params) => ({ url: '/submissions/list', params }),
  // Mock for now (returns paginated subset, applies scope/filters/sort/page server-side
  // in the mock implementation):
  queryFn: async (params) => {
    const all = MOCK_SUBMISSIONS_LIST;     // 25 entries from mocks/submissionsListMock.ts
    // Apply scope, filters, sort, then paginate.
    // Return shape:
    return {
      data: {
        items: paginated,
        total: filteredTotal,
        page: params.page,
        pageSize: params.pageSize,
      },
    };
  },
}),
```

Mock data file `mocks/submissionsListMock.ts` should contain **25 submissions** matching the Figma rows + 15 additional realistic entries to support 3 pages of pagination at pageSize=10. First 10 entries must match Figma screenshot exactly (Jefferson, Wake, Houston, Riverside, Fairfax, San Diego, Montgomery, Seattle, Palm Beach, Austin).

## Containers (Phase S1 — wired but render placeholders)

Each container:
1. Reads relevant URL params via `useSearchParams`
2. Calls its RTK Query hook (header container only — others read URL only this phase)
3. Renders `<div data-testid="...-placeholder">Loading...</div>` for now
4. Will pass real props to its component in S2/S3/S4

Phase S1 keeps containers minimal — full data wiring in subsequent phases.

## SubmissionsPage layout

```tsx
<div className="submissions-page">
  <ErrorBoundary fallback={<PanelErrorState panelName="Header" />}>
    <SubmissionsHeaderContainer />
  </ErrorBoundary>

  <ErrorBoundary fallback={<PanelErrorState panelName="Tabs" />}>
    <SubmissionsScopeTabsContainer />
  </ErrorBoundary>

  <div className="submissions-page__main">
    <ErrorBoundary fallback={<PanelErrorState panelName="Filters" />}>
      <SubmissionsFiltersContainer />
    </ErrorBoundary>

    <ErrorBoundary fallback={<PanelErrorState panelName="List" />}>
      <SubmissionsListContainer />
    </ErrorBoundary>
  </div>
</div>
```

## Routing change

In existing `router.tsx` (or equivalent):

```tsx
<Route element={<AppShell />}>
  <Route path="/dashboard"   element={<DashboardPage />} />
  <Route path="/submissions" element={<SubmissionsPage />} />   {/* ADD */}
  {/* future S5+: <Route path="/submissions/:id" element={<SubmissionDetailPage />} /> */}
</Route>
```

## Acceptance criteria

1. ✅ `npm run lint` passes
2. ✅ `npm run type-check` passes
3. ✅ Navigating to `/submissions` renders the page without console errors
4. ✅ Sidebar "Submissions" nav item shows active highlight when on `/submissions` (uses NavLink `isActive`)
5. ✅ All 4 regions render their `<ErrorBoundary>` wrapper. Throwing inside any one region shows the `<PanelErrorState>` and does NOT crash the other 3.
6. ✅ `useGetSubmissionsHeaderQuery()` returns the mock 5 stats; visible via React DevTools Redux state
7. ✅ `useGetSubmissionsListQuery({...})` returns paginated mock; calling with page=1 returns 10 items, page=2 returns 8 items, total=18
8. ✅ All new files appear in `INDEX.md` after `npm run index`
9. ✅ `tokens.ts` is cumulative — no existing tokens removed
10. ✅ No raw `rgb()`/hex/px values introduced in component files (ESLint catches this)

## What ships visually after S1

A mostly-blank page at `/submissions` with the sidebar highlighting "Submissions" and 4 small "Loading..." placeholders. **This is intentional** — S2 fills the header, S3 fills the tabs+filters, S4 fills the table.

## Phase S2 preview (next)

S2 implements `SubmissionsHeader` (the blue band): title, Export + New Submission buttons, 5 KPI tiles. Estimated 1 prompt cycle, no architectural decisions remaining.


<!-- # Phase S1 — Submissions Foundation: implementation prompt

> Paste this entire file into Claude in VS Code AFTER the standard paste order from `HANDOFF.md` §5 Step 4:
> 1. `HANDOFF.md`
> 2. `CLAUDE.md`
> 3. Fresh `INDEX.md` (run `npm run index` first)
> 4. `TRACKER.md`
> 5. `specs/submissions-phase-1-foundation.md`
> 6. **THIS FILE**

---

## Hard rules (non-negotiable — violations = automatic rework)

1. **Phase S1 is a foundation phase, not a visual phase.** Do NOT implement S2/S3/S4 content. The 4 region containers must render `<div data-testid="...-placeholder">Loading...</div>` and nothing else. Visual content lands in S2–S4.

2. **No raw colors / pixels / hex / rgb() in component or container files.** Everything from `theme/tokens.ts`. ESLint will reject violations. The only file containing raw values is `tokens.ts` itself.

3. **xStyles + DISPLAY_ORDER pattern is load-bearing.** When a future phase iterates statuses/products/scopes/filter groups, it does so via the DISPLAY_ORDER constant from tokens — never hardcoded arrays in components. Set this up correctly NOW so S2–S4 inherit it.

4. **Cumulative tokens.ts.** Use the `tokens.ts` file delivered in this batch as the new full file. Do NOT cherry-pick the new section and merge by hand — replace the whole file. If something in the existing tokens.ts is missing from the delivered file, that's a bug — flag it back, don't silently merge.

5. **No new useGetSubmissionsQuery for the dashboard.** The existing dashboard panel query is untouched. Add TWO NEW queries: `useGetSubmissionsHeaderQuery` (no args) and `useGetSubmissionsListQuery` (takes SubmissionsListQuery params). Both with mock data per the spec.

6. **Existing AppShell, Sidebar, TopBar are not modified** beyond verifying the Sidebar's "Submissions" item links to `/submissions`. If it already does, make zero edits. If it doesn't, edit only the `to` prop value.

7. **No useState for filter state.** Filter/scope/sort/pagination state lives in URL via `useSearchParams`. In Phase S1 the containers read URL params but don't use them (regions show placeholder). Establish the pattern now.

8. **ErrorBoundary from `@/components/common`** wraps each of the 4 regions individually. Use the existing `PanelErrorState` as fallback. Throwing inside one region must not crash the others — verify this works manually before declaring S1 done.

9. **Mocks in dedicated file.** Don't inline 25 submissions inside `submissionsApi.ts`. Put them in `services/submissions/mocks/submissionsListMock.ts` and import. Header stats can stay inline (it's 5 fields).

10. **Row click = no-op this phase AND going forward until detail page lands.** No navigation. No console.log. The `<SubmissionListRow>` (Phase S4) will simply render without an onClick. Do not add a handler.

11. **`HeaderKpiTile` is internal to `SubmissionsHeader`** — do NOT extract it to its own folder, do NOT add it to INDEX, do NOT extend the existing `KpiCard`. It lives as a non-exported component inside `SubmissionsHeader.tsx`.

12. **Keep S1 component shells minimal.** Each pure component file should be ~10 lines: imports, type, function returning placeholder div. Real implementation is S2/S3/S4.

---

## Implementation order

Follow this order strictly. Each step depends on the previous.

### Step 1 — Tokens (foundation for everything)

Replace `src/theme/tokens.ts` with the delivered file. Run `npm run type-check` — should pass with zero changes elsewhere because section 12 is purely additive.

### Step 2 — Types

Edit `src/shared/types/submissions.ts`. Add the new types per spec:
- `SubmissionsScope`, `SubmissionsSortField`, `SubmissionsSortDirection`, `SubmissionsSort`
- `ProductLine`
- `SubmissionsFilterParams`
- `SubmissionsHeaderStats`
- `SubmissionsListQuery`, `SubmissionsListResponse`
- `DaysOpenSeverity`

Re-export from `src/shared/types/index.ts`.

### Step 3 — Mock data

Create `src/services/submissions/mocks/submissionsListMock.ts`:
- Export `MOCK_SUBMISSIONS_LIST: Submission[]`
- 25 entries minimum
- First 10 entries match Figma row order: Jefferson County (KY, SUB-7844, EPL/ELL/GL, New, Unassigned, $67.2k, 80%, 3d, Mar 20), Wake County (NC, SUB-7840, EPL/GL/Cyber, New, Unassigned, $72.4k, 83%, 4d, Mar 19), Houston ISD (TX, SUB-7834, EPL/ELL/GL, New, Unassigned, $92.1k, 84%, 5d, Mar 18), Riverside Unified (CA, SUB-7829, EPL/ELL/GL/Cyber, In Review, John, $102.4k, 92%, 18d, Mar 15), Fairfax County (VA, SUB-7839, EPL/ELL/ML/Cyber, In Review, John, $96.7k, 87%, 19d, Mar 14), San Diego City (CA, SUB-7830, EPL/GL/ML/Property, Quoted, Sarah, $148.2k, 88%, 21d, Mar 12), Montgomery County (MD, SUB-7842, EPL/ELL/ML/Crime, Pending Info, John, $88.3k, 76%, 22d, Mar 11), Seattle Public (WA, SUB-7833, EPL/ML/Cyber, Pending Info, Sarah, $64.8k, 71%, 23d, Mar 10), Palm Beach (FL, SUB-7843, EPL/GL/SA, In Review, Sarah, $58.9k, 82%, 24d, Mar 9), Austin ISD (TX, SUB-7831, EPL/ELL/GL/Auto, In Review, John, $87.6k, 79%, 25d, Mar 8).
- Remaining 15 entries: realistic variations across all 6 status values, all 9 product lines, varied appetite 60–95%, days 1–35, mix of assigned/unassigned.

### Step 4 — Service layer

Edit `src/services/submissions/submissionsApi.ts`:
- Keep existing `useGetSubmissionsQuery` unchanged
- Add `useGetSubmissionsHeaderQuery` with inline mock returning `{ totalSubmissions: 18, inReview: 5, quoted: 3, boundYtd: 3, boundPremiumYtd: 552_200 }`
- Add `useGetSubmissionsListQuery` with mock implementation that:
  - Imports `MOCK_SUBMISSIONS_LIST`
  - Filters by scope: `mine` → only Robert Chen's, `team` → all team underwriters, `all` → everything
  - Applies filter params (q matches name/sub-id/broker case-insensitive; status/priority/products/states/brokers/underwriters intersect; date range filters submitted)
  - Sorts by sort.field/sort.direction
  - Paginates by page/pageSize, returns `{ items, total: filteredTotal, page, pageSize }`
  - Use 50–150ms `await new Promise(r => setTimeout(r, ...))` to simulate latency

### Step 5 — Containers (4 files, all wired but rendering placeholders)

For each of the 4 containers in `src/containers/submissions/`:
- `SubmissionsHeaderContainer.tsx`:
  ```tsx
  export function SubmissionsHeaderContainer() {
    const { data, isLoading, isError } = useGetSubmissionsHeaderQuery();
    if (isError) throw new Error('Header query failed');  // ErrorBoundary catches
    return <SubmissionsHeader stats={data} isLoading={isLoading} />;
  }
  ```
- `SubmissionsScopeTabsContainer.tsx`: read `?scope=` param via `useSearchParams`, default to `all`. Pass scope + onChange (writes back to URL) to component.
- `SubmissionsFiltersContainer.tsx`: read all 8 filter URL params (`q`, `status`, `priority`, `products`, `states`, `brokers`, `underwriters`, `submittedFrom`, `submittedTo`). Pass current values + onChange handlers to component.
- `SubmissionsListContainer.tsx`: read scope+filters+sort+page from URL. Call `useGetSubmissionsListQuery(params)`. Pass response to component.

In Phase S1, all components render placeholders, but containers MUST be fully wired so S2–S4 only need to fill in the visual layer.

### Step 6 — Components (4 files, placeholder render only)

Each in `src/components/domain/<Name>/<Name>.tsx`. Each ~10 lines:

```tsx
// SubmissionsHeader.tsx
import type { SubmissionsHeaderStats } from '@/shared/types';

interface SubmissionsHeaderProps {
  stats?: SubmissionsHeaderStats;
  isLoading?: boolean;
}

export function SubmissionsHeader({ stats, isLoading }: SubmissionsHeaderProps) {
  return (
    <div data-testid="submissions-header-placeholder">
      Loading… (Phase S2 will render header here)
    </div>
  );
}
```

Same pattern for `SubmissionsScopeTabs`, `SubmissionsFiltersSidebar`, `SubmissionsListTable`. Each gets its full prop interface NOW (matching what containers pass), so S2/S3/S4 just need to fill the JSX, not change signatures.

Each folder gets an `index.ts` that re-exports.

### Step 7 — Page

Create `src/features/submissions/pages/SubmissionsPage.tsx`:

```tsx
import { ErrorBoundary } from '@/components/common';
import { PanelErrorState } from '@/components/common';
import {
  SubmissionsHeaderContainer,
  SubmissionsScopeTabsContainer,
  SubmissionsFiltersContainer,
  SubmissionsListContainer,
} from '@/containers/submissions';

export function SubmissionsPage() {
  return (
    <div className="flex flex-col">
      <ErrorBoundary fallback={<PanelErrorState panelName="Header" />}>
        <SubmissionsHeaderContainer />
      </ErrorBoundary>

      <ErrorBoundary fallback={<PanelErrorState panelName="Tabs" />}>
        <SubmissionsScopeTabsContainer />
      </ErrorBoundary>

      <div className="flex flex-row">
        <ErrorBoundary fallback={<PanelErrorState panelName="Filters" />}>
          <SubmissionsFiltersContainer />
        </ErrorBoundary>

        <ErrorBoundary fallback={<PanelErrorState panelName="List" />}>
          <SubmissionsListContainer />
        </ErrorBoundary>
      </div>
    </div>
  );
}
```

### Step 8 — Routing

In `src/app/router.tsx` (or wherever routes are defined inside `<AppShell>` outlet), add:
```tsx
<Route path="/submissions" element={<SubmissionsPage />} />
```

Verify Sidebar's existing "Submissions" item already navigates to `/submissions`. If yes, no Sidebar edit. If no, change its `to` prop.

### Step 9 — Index regeneration

Run `npm run index`. Verify all new files appear in INDEX.md under correct sections.

### Step 10 — Verify

Run in order:
- `npm run lint` — must pass
- `npm run type-check` — must pass
- `npm run dev` — open browser, navigate to `/submissions`. Should see 4 placeholder regions, sidebar highlighting Submissions, no console errors.

---

## Acceptance criteria checklist

Reply with this checklist filled in once done:

- [ ] `npm run lint` passes
- [ ] `npm run type-check` passes
- [ ] `npm run index` regenerated; all new files appear
- [ ] `/submissions` route renders without errors
- [ ] Sidebar Submissions item highlights when on /submissions
- [ ] All 4 ErrorBoundary regions render
- [ ] Manually throwing inside one region does NOT crash the other 3 (verify by temporarily throwing in one container, observing others still render)
- [ ] `useGetSubmissionsHeaderQuery()` returns expected mock (visible in Redux DevTools)
- [ ] `useGetSubmissionsListQuery({scope:'all',filters:{},sort:{field:'submitted',direction:'desc'},page:1,pageSize:10})` returns 10 items, total=25
- [ ] No raw rgb()/hex/px values in any component or container file (only in tokens.ts)
- [ ] No filter useState anywhere (URL params only)
- [ ] tokens.ts is cumulative — no existing tokens removed
- [ ] HeaderKpiTile, SubmissionListRow, etc. are NOT in INDEX (not exported)
- [ ] TRACKER.md updated with Phase S1 = implemented

## If anything is ambiguous

Stop and ask, don't guess. Ambiguity in S1 propagates through S2–S5. -->