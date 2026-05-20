# Submissions Phase S3 — Scope Tabs + Filters Drawer

> Status: spec ready
> Phase track: Submissions (S1–S5)
> Prerequisite: S1 implemented (placeholders, services). S2 ideally implemented (header) but S3 is independent of S2.

## Goal

Replace the placeholder for the scope tabs region and rebuild the filters region as an overlay drawer instead of a left sidebar (per v2 design). After S3:

- Scope tabs (My Queue / My Team / All Submissions) drive a URL `scope` param
- A "Filters" button sits in the top-right of the tabs row
- Clicking Filters opens a right-side drawer with all 8 filter groups
- Every filter change writes to URL params; refresh preserves all state
- Reset button clears all filters but keeps scope

The list region still shows its placeholder ("Loading…" until S4 lands). The header region is whatever S2 left it as.

## Visual scope

### 1. Scope tabs row (under header band)

```
┌────────────────────────────────────────────────────────────────────┐
│  My Queue   My Team   All Submissions          5 results [Filters] │
└────────────────────────────────────────────────────────────────────┘
```

- Three tab labels left-aligned
- Active tab: brand blue text + bold + 2px gold underline; inactive: slate-600 + regular
- "X results" count + Filters button right-aligned
- Filters button shows badge with active filter count if > 0 (small gold dot or numeric pill)
- All tokens already in `submissionsScopeTabsStyles`

### 2. Filters drawer (slides in from right when Filters button clicked)

```
┌─────────────────────────┐
│ Filters             [×] │  ← drawer header
├─────────────────────────┤
│ KEYWORD SEARCH          │
│ [search input        ]  │
│                         │
│ STATUS                  │  ← collapsible groups
│ ☐ New                   │
│ ☐ In Review             │
│ ...                     │
│ (8 groups total)        │
├─────────────────────────┤
│           [Reset all]   │  ← footer
└─────────────────────────┘
```

**Drawer dimensions:** width clamped between 320px (min) and 480px (max), preferring 420px. Use `width: clamp(320px, 90vw, 480px)` so on narrow screens the drawer takes ~90% of viewport, on wide screens caps at 480px.

**Drawer height:** full viewport height. Body scrolls vertically if filter list exceeds viewport.

**Backdrop:** semi-transparent slate scrim behind drawer (clicks dismiss). Body scroll locked while open.

### 3. Eight filter groups (in `SUBMISSIONS_FILTER_GROUPS_DISPLAY_ORDER`)

| # | Key | Component | URL param |
|---|---|---|---|
| 1 | `keyword` | Text input with search icon | `q` |
| 2 | `status` | 6 checkboxes with status dot indicators | `status` (comma-separated) |
| 3 | `priority` | 3 checkboxes with priority dot indicators | `priority` (comma-separated) |
| 4 | `products` | 9 checkboxes with product abbreviation | `products` (comma-separated) |
| 5 | `jurisdiction` | 50-state list with text-search filter | `states` (comma-separated 2-letter codes) |
| 6 | `broker` | List with text-search filter | `brokers` (comma-separated) |
| 7 | `underwriter` | List with text-search filter (incl. "Unassigned" option) | `underwriters` (comma-separated) |
| 8 | `submittedDate` | Two `<input type="date">` (From / To) | `submittedFrom`, `submittedTo` (ISO date) |

All checkbox/input styling already in `submissionsFiltersStyles` from S1 — drawer body reuses these.

## Architecture

### Drawer state ownership

Drawer open/close is **local React state in `SubmissionsPage`**. Filter values are URL params. This decouples:
- Drawer transient UI state (open/closed) → `useState`
- Filter persistent state → `useSearchParams`

Closing the drawer does NOT clear filters. Filters set inside the drawer immediately apply (URL updates on each change), so even if the user closes without "applying," their selections persist.

```tsx
function SubmissionsPage() {
  const [filtersOpen, setFiltersOpen] = useState(false);

  return (
    <div className="flex flex-col h-full">
      <ErrorBoundary fallback={<PanelErrorState panelName="Header" />}>
        <SubmissionsHeaderContainer />
      </ErrorBoundary>
      <ErrorBoundary fallback={<PanelErrorState panelName="Tabs" />}>
        <SubmissionsScopeTabsContainer onFiltersClick={() => setFiltersOpen(true)} />
      </ErrorBoundary>
      <ErrorBoundary fallback={<PanelErrorState panelName="List" />}>
        <SubmissionsListContainer />
      </ErrorBoundary>
      {/* Drawer is a portal-rendered overlay, not in geographic flow */}
      <SubmissionsFiltersContainer open={filtersOpen} onOpenChange={setFiltersOpen} />
    </div>
  );
}
```

The Filters region's `ErrorBoundary` moves *inside* the drawer body (around the filter groups), not around the container, since the drawer has no geographic position to render a fallback panel.

### URL state hook

Extract a hook `useSubmissionsUrlState` in `src/features/submissions/hooks/useSubmissionsUrlState.ts`:

```ts
export function useSubmissionsUrlState() {
  const [params, setParams] = useSearchParams();
  return {
    scope: parseScope(params.get('scope')),
    filters: parseFilters(params),
    sort: parseSort(params),
    page: parseInt(params.get('page') ?? '1', 10),
    setScope: (s: SubmissionsScope) => setParams(prev => { ... }),
    setFilter: <K extends keyof SubmissionsFilterParams>(k: K, v: SubmissionsFilterParams[K]) => ...,
    resetFilters: () => setParams(prev => { /* keep scope, clear all filter keys */ }),
    setSort: ...,
    setPage: ...,
  };
}
```

All four containers (header, tabs, filters, list) call this hook. The same query args derive from it, so RTK Query naturally dedupes calls.

**Filter changes reset page to 1** — when any filter is updated, page param drops to 1 in the same `setSearchParams` call, to avoid the "no results on page 3" footgun.

## Files to create / edit

### Create
- `src/components/common/Drawer/Drawer.tsx` — wrapper around shadcn Sheet
- `src/components/common/Drawer/index.ts`
- `src/features/submissions/hooks/useSubmissionsUrlState.ts`
- `src/components/ui/sheet.tsx` (auto-created by `npx shadcn@latest add sheet`)

### Edit
- `src/features/submissions/pages/SubmissionsPage.tsx` — restructure layout, lift drawer state
- `src/containers/submissions/SubmissionsScopeTabsContainer.tsx` — wire tabs to URL, accept `onFiltersClick` prop
- `src/containers/submissions/SubmissionsFiltersContainer.tsx` — render drawer, wire filters to URL
- `src/components/domain/SubmissionsScopeTabs/SubmissionsScopeTabs.tsx` — real implementation
- `src/components/domain/SubmissionsFiltersSidebar/` → **rename folder/file to** `SubmissionsFiltersDrawer/` — real implementation as drawer body
- `src/theme/tokens.ts` — append `submissionsFiltersDrawerStyles`, mark old sidebar tokens `@deprecated`

### Do NOT touch
- `SubmissionsHeader` (S2 territory)
- `SubmissionsListTable` (S4 territory)
- Any dashboard files
- Any S1 service files (mocks, RTK Query endpoints) — already correct

## Component prop contracts

```ts
// SubmissionsScopeTabs
interface SubmissionsScopeTabsProps {
  scope: SubmissionsScope;
  onScopeChange: (s: SubmissionsScope) => void;
  resultsCount: number;
  isLoading: boolean;
  activeFilterCount: number;
  onFiltersClick: () => void;
}

// SubmissionsFiltersDrawer (the body content, not the drawer chrome)
interface SubmissionsFiltersDrawerProps {
  filters: SubmissionsFilterParams;
  onFilterChange: <K extends keyof SubmissionsFilterParams>(k: K, v: SubmissionsFilterParams[K]) => void;
  onResetAll: () => void;
  // Lookup data for select-style filters:
  availableBrokers: string[];
  availableUnderwriters: string[];
}

// Drawer (shared atom)
interface DrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  side?: 'left' | 'right' | 'top' | 'bottom';  // default 'right'
  children: React.ReactNode;
  // Composition: DrawerHeader, DrawerTitle, DrawerClose, DrawerBody, DrawerFooter
}
```

## Available brokers / underwriters

For S3, derive these from the mock list:
```ts
const availableBrokers = Array.from(new Set(MOCK_SUBMISSIONS_LIST.map(s => s.broker))).sort();
const availableUnderwriters = Array.from(
  new Set(MOCK_SUBMISSIONS_LIST.map(s => s.underwriter ?? 'Unassigned'))
).sort();
```

These computations live inside the filters container (or a tiny selector). They're cheap — derived from in-memory mock — so no useMemo needed.

## Tokens to add

Append to section 12 of `tokens.ts`:

```ts
// 12m. Filters drawer (Phase S3)
export const submissionsFiltersDrawerStyles = {
  // Width: clamp via CSS, no fixed pixel
  widthClamp: 'clamp(320px, 90vw, 480px)',  // applied as raw style on Sheet content

  scrimColor: 'rgba(15, 23, 42, 0.4)',
  scrimAnimationMs: 200,
  drawerAnimationMs: 250,

  headerHeight: 56,
  headerPaddingX: 24,
  headerBorderColor: colors.slate200,
  titleColor: colors.slate900,
  titleSize: fontSize.xl,            // 18
  titleWeight: fontWeight.bold,

  closeButtonSize: 32,
  closeIconSize: 20,
  closeIconColor: colors.slate600,

  bodyPaddingX: 24,
  bodyPaddingY: 16,
  bodyMaxHeight: 'calc(100dvh - 56px - 64px)',  // viewport minus header minus footer

  footerHeight: 64,
  footerPaddingX: 24,
  footerBorderTopColor: colors.slate200,

  // Active filter count badge (on the Filters button in scope tabs row)
  filterCountBadgeBg: colors.brandGold,
  filterCountBadgeColor: colors.white,
  filterCountBadgeSize: 16,
  filterCountBadgeFontSize: 10,
  filterCountBadgeFontWeight: fontWeight.bold,
} as const;
```

### Tokens to deprecate (don't remove)

In section 12 add `/** @deprecated since S3 — see submissionsFiltersDrawerStyles */` comments to:
- `submissionsRouteDims.filtersWidth`
- `submissionsFiltersStyles.width`

The rest of `submissionsFiltersStyles` (group headers, checkboxes, inputs, dot sizes, row heights) stays — drawer body reuses these for inner content.

## Responsive plan

Per the universal responsive rules in `SUBMISSIONS_TRACKER.md`:

- **Tabs row:** flex layout. Tab labels stay horizontal at all supported widths (3 short labels always fit). `flex-wrap: nowrap`.
- **Drawer width:** `clamp(320px, 90vw, 480px)`. On a 768px tablet: drawer is ~480px (caps at max). On a 360px viewport: drawer is ~324px (90% of 360 = 324, above min). On a 1920px desktop: drawer is 480px. No reflow ever.
- **Drawer body:** scrolls vertically when content exceeds height. Filter groups always single-column. Date inputs (From/To) stay side-by-side via `flex gap-2`; only stack via `flex-wrap` if drawer is impossibly narrow.
- **Filter groups:** never reflow to multi-column. Always vertically stacked.
- **No hamburger transformations.** Filters button stays a button at all widths; never collapses to icon-only.

## URL param serialization

```
?scope=mine&q=jefferson&status=InReview,PendingInfo&products=EPL,Cyber&states=CA,TX&submittedFrom=2026-03-01&submittedTo=2026-03-15&sort=submitted-desc&page=1
```

- Multi-value: comma-separated, no spaces, no URL-encoding of commas (commas are valid URL chars)
- Empty filter → omit param entirely (don't write `?status=`)
- Date format: ISO `YYYY-MM-DD`
- Status/priority/products: PascalCase identifiers (per S1 refactor)

## Acceptance criteria

1. ✅ `npm run lint` passes
2. ✅ `npm run type-check` passes
3. ✅ `npm run index` regenerated; new public exports: `Drawer` (and its parts), `useSubmissionsUrlState`
4. ✅ At `/submissions`: scope tabs render, "My Queue" active by default (per v2 design)
5. ✅ Clicking each scope tab updates URL `?scope=mine|team|all` and visually toggles active state
6. ✅ Active filter count badge on Filters button reflects actual count (e.g. "2" if status + product line are set)
7. ✅ Clicking Filters button opens drawer from the right
8. ✅ Drawer width adapts: at 1920px desktop ~480px, at 768px tablet ~480px (still capped), at narrow widths uses 90vw
9. ✅ All 8 filter groups render in display order
10. ✅ Each filter writes to URL on change; refresh preserves all selections
11. ✅ Changing any filter resets `page` to 1 in same URL update
12. ✅ Reset button clears all filter params but keeps `scope`
13. ✅ Drawer closes on: backdrop click, Escape, close (×) button
14. ✅ Body scroll is locked while drawer is open
15. ✅ Throwing inside `SubmissionsFiltersDrawer` (filter group rendering) renders an error inside the drawer body, drawer chrome still works
16. ✅ Throwing inside `SubmissionsScopeTabsContainer` triggers `PanelErrorState` for tabs region; drawer/list unaffected
17. ✅ No raw `rgb()`/hex/px in any new component or container file
18. ✅ Page never has horizontal scroll at any supported viewport width (768–∞)
19. ✅ Old `submissionsFiltersStyles.width` and `submissionsRouteDims.filtersWidth` still exist in tokens (but marked @deprecated); unused by new code

## Out of scope (deferred)

- Fancy date range picker (S5 or later — native input is fine for S3)
- Saved filter views ("My open EPL submissions in CA") — future phase
- Drawer animation polish (we get default shadcn animations; refining is S5)
- aria-live announcement for filter result counts (S5)

## Phase S4 preview (next)

S4 implements the list table: sortable column headers, row cards with status edge-stripes, ProductChips, AppetiteBar, Avatar, Unassigned warning, days-color severity, and the new pagination format. It will rely on the URL state hook `useSubmissionsUrlState` from S3 for sort + page params.