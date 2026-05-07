# Spec: Dashboard Phase 8 — Portfolio Snapshot Panel

## §1 Goal

Ship the **Portfolio Snapshot** panel: a 380px-wide card on the dashboard's
right column showing 6 aggregated portfolio metrics (Total Submissions
MTD, Quoted Pipeline, Bound YTD, Avg. Appetite Score, Submissions in SLA,
Docs Incomplete). Each row has a colored icon, label, and bold value;
rows are separated by hairline dividers; no card footer.

The snapshot is the **second consumer of `CardShell`** (built in Phase 6),
which validates that abstraction. It also introduces `StatRow` — a
generic icon-label-value row reusable by any future "key metrics" list
in the app.

**Architectural note** — every metric on this card is an aggregation
over the submissions universe. The same is true of the Phase 3 KPI
cards. Both are served by **dedicated aggregation endpoints**, not by
client-side `useMemo` over the dashboard's submissions list. Reasons:
the dashboard table only loads ~15 rows but "Total Submissions (MTD) =
22"; aggregations need to span the full backend dataset; some metrics
(`appetiteScore`, `daysToQuote`) are computed fields not currently on
the `Submission` type; consistency with Phase 3 reduces architectural
sprawl. Client-side derivation would not scale and would force the
`Submission` type to grow fields it doesn't need for the table.

The relationship between Snapshot and the Submissions list lives at the
**data layer** (both endpoints query the same `submissions` table on
the backend), not the component layer. Stat rows are clickable; click
fires `onStatClick(statKey)` so the container can later route to a
filtered Submissions view (e.g. `/submissions?status=Quoted`). Actual
route wiring is **out of scope** for this phase — container `console.log`s
the stat key for now.

---

## §2 Design source (no MCP)

Figma MCP is not used. All design values come from `src/theme/tokens.ts`.

**New tokens this phase adds** (apply the patch in `tokens.ts` first):

- `dims.portfolioCardHeight` = 289 (header 42 + body 247)
- `statRowDims` — height, padding, icon size, gap (the row's intrinsic
  measurements; reusable by any consumer of `StatRow`)
- `portfolioStatStyles` — map keyed by stat key, value = `{ icon, iconColor }`.
  Adding a stat means adding an entry here; component does NOT branch on
  `if (key === 'foo')`.
- `PortfolioStatKey` type — union of the 6 stat keys, exported so the
  API response type can reuse it.

**Existing tokens this phase reuses:**

- `colors.*` — surfaces, borders, text, brand
- `cardDims` (Phase 6) — header/body padding, header height
- `fonts.sans`, `fontSize`, `fontWeight`
- `CardShell` component (Phase 6) — wraps the panel

Reference dimensions from Figma JSON:
- Card outer: 380 × 289 (header 42 + body 247)
- Header: 378 × 42, padding 12 / 20, no filter tabs, no badge
- Body container: padding 4 / 20 / 0 / 20, flex column gap 0
- Each stat row: 338 × 40, padding 10 0 10 0, justify-between, bottom border `--border-default`
- Last row: same dimensions, **no** bottom border (39px because no padding
  bottom) — handled by `isLast` prop on `StatRow`

**No raw `rgb(...)` or hex strings in component files.**

---

## §3 Scope — files this spec creates or modifies

| Path | Action | Purpose |
|---|---|---|
| `src/theme/tokens.ts` | modify | Add `dims.portfolioCardHeight`, `statRowDims`, `portfolioStatStyles`, `PortfolioStatKey` type |
| `src/shared/types/portfolio.ts` | create | `PortfolioStatKey` (re-export), `PortfolioStat`, `PortfolioSnapshot` types + `STAT_DISPLAY_ORDER` const array |
| `src/shared/utils/formatStatValue.ts` | create | `formatStatValue(stat)` — turns `{ value, format }` into display string. Centralizes currency/percent/count/score formatting. |
| `src/services/portfolio/portfolioApi.ts` | create | RTK Query `portfolioApi` with `getSnapshot` endpoint, mock data inline with TODO. **Backend computes all 6 metrics; frontend never aggregates.** |
| `src/components/domain/StatRow/StatRow.tsx` | create | Generic icon-label-value row. Takes `stat: PortfolioStat`, looks up `portfolioStatStyles[stat.key]`. Reusable for any stat list. |
| `src/components/domain/StatRow/index.ts` | create | barrel |
| `src/components/domain/PortfolioSnapshotPanel/PortfolioSnapshotPanel.tsx` | create | Composes `CardShell` + `StatRow[]`. Pure presentational. |
| `src/components/domain/PortfolioSnapshotPanel/index.ts` | create | barrel |
| `src/containers/dashboard/PortfolioSnapshotContainer.tsx` | create | Calls `useGetSnapshotQuery`, transforms response into ordered `PortfolioStat[]` per `STAT_DISPLAY_ORDER`, passes to component |
| `src/features/dashboard/pages/DashboardPage.tsx` | modify | Mount `<PortfolioSnapshotContainer />` in the right column under existing panels |
| `src/app/store.ts` | modify | Register `portfolioApi.reducerPath` + middleware |

After implementation: run `npm run index` to refresh `INDEX.md`.

**File count: 8 new + 3 modified = 11.** Within the rule of thumb,
since `CardShell` is reused (not rebuilt) and `StatRow` is generic
enough to pay back in future phases.

---

## §4 Data + behavior

### Type definitions (`src/shared/types/portfolio.ts`)

```ts
import type { PortfolioStatKey } from '@/theme/tokens';

export type { PortfolioStatKey };

export type StatFormat =
  | 'count'      // 22
  | 'currency'   // $4.2M
  | 'score'      // 81/100
  | 'percent'    // 91%
  | 'subsCount'; // 4 subs

export interface PortfolioStat {
  key: PortfolioStatKey;
  label: string;       // 'Total Submissions (MTD)'
  value: number;       // 22, 4200000, 81, 91, 4, etc.
  format: StatFormat;  // how to display the value
  // For 'score', the denominator is part of the format convention (out of 100).
  // For 'subsCount', label is 'Docs Incomplete', value 4 → '4 subs'.
}

export interface PortfolioSnapshot {
  stats: Record<PortfolioStatKey, PortfolioStat>;
  generatedAt: string; // ISO timestamp from server, for "last refreshed" UI later
}

/**
 * The display order is a frontend concern, not a backend concern.
 * The API returns a map; the container produces an ordered array using
 * this constant. Reordering rows = edit one line here.
 */
export const STAT_DISPLAY_ORDER: readonly PortfolioStatKey[] = [
  'totalSubmissionsMtd',
  'quotedPipeline',
  'boundYtd',
  'avgAppetiteScore',
  'submissionsInSla',
  'docsIncomplete',
] as const;
```

### Format helper (`src/shared/utils/formatStatValue.ts`)

```ts
import type { PortfolioStat } from '@/shared/types/portfolio';

export function formatStatValue(stat: PortfolioStat): string {
  switch (stat.format) {
    case 'count':     return stat.value.toString();
    case 'percent':   return `${stat.value}%`;
    case 'score':     return `${stat.value}/100`;
    case 'subsCount': return `${stat.value} sub${stat.value === 1 ? '' : 's'}`;
    case 'currency':  return formatCurrencyShort(stat.value);
  }
}

// $4,200,000 → "$4.2M". Uses 1 decimal for M/K, integer for sub-thousand.
function formatCurrencyShort(n: number): string { /* ... */ }
```

### API endpoint (`src/services/portfolio/portfolioApi.ts`)

```ts
export const portfolioApi = createApi({
  reducerPath: 'portfolioApi',
  baseQuery: baseQuery,
  tagTypes: ['PortfolioSnapshot'],
  endpoints: (builder) => ({
    getSnapshot: builder.query<PortfolioSnapshot, void>({
      // TODO: replace with real endpoint /api/portfolio/snapshot
      // The real endpoint MUST aggregate server-side over the full
      // submissions table — never compute these client-side from the
      // dashboard's loaded submissions list.
      queryFn: async () => ({ data: MOCK_SNAPSHOT }),
      providesTags: ['PortfolioSnapshot'],
    }),
  }),
});

export const { useGetSnapshotQuery } = portfolioApi;
```

`MOCK_SNAPSHOT` is a `PortfolioSnapshot` constant in this file with the
6 stats matching the Figma design (22, $4.2M, $3.1M, 81/100, 91%, 4 subs).

### Container (`src/containers/dashboard/PortfolioSnapshotContainer.tsx`)

```tsx
export function PortfolioSnapshotContainer() {
  const { data, isLoading } = useGetSnapshotQuery();

  const orderedStats = useMemo<PortfolioStat[]>(() => {
    if (!data) return [];
    return STAT_DISPLAY_ORDER.map(key => data.stats[key]);
  }, [data]);

  const handleStatClick = (key: PortfolioStatKey) => {
    // TODO: navigate to filtered Submissions view per stat key.
    // Out of scope for Phase 8 — see spec §7.
    console.log('[PortfolioSnapshot] stat clicked:', key);
  };

  return (
    <PortfolioSnapshotPanel
      stats={orderedStats}
      onStatClick={handleStatClick}
    />
  );
}
```

Container is < 30 lines. Component does no aggregation, no formatting
inline (it calls `formatStatValue`), no ordering.

### Component contracts

#### `<StatRow>` (domain — generic, reusable)

```tsx
interface StatRowProps {
  stat: PortfolioStat;
  isLast?: boolean;     // suppresses bottom border
  onClick?: (key: PortfolioStatKey) => void;
}
```

- Looks up `const style = portfolioStatStyles[stat.key]` for icon name + color
- Renders a small icon-name-to-component map locally (Inbox, TrendingUp,
  ShieldCheck, Award, CheckCircle, AlertCircle from lucide-react). This
  keeps tree-shaking working — no dynamic imports.
- Outer: row 40px tall, padding 10 0 10 0, justify-between, align-center
- Bottom border `colors.borderDefault` 1px, suppressed when `isLast`
- Left side (gap 8px, align-center):
  - Icon component, size 13, color `style.iconColor`
  - Label `stat.label` 12px/400 `colors.textBody`
- Right side: `formatStatValue(stat)` 13px/700 `colors.textHeading`
- If `onClick` provided: cursor pointer, on click calls `onClick(stat.key)`
- No hover effect this phase (later polish)

#### `<PortfolioSnapshotPanel>` (domain — main component)

```tsx
interface PortfolioSnapshotPanelProps {
  stats: PortfolioStat[];                            // pre-ordered by container
  onStatClick?: (key: PortfolioStatKey) => void;
}
```

**Rules:**
1. Renders exactly `stats.length` `<StatRow>` instances, in given order.
2. Last row gets `isLast={true}` to suppress bottom border.
3. No filtering, sorting, slicing inside the component.
4. If `stats.length === 0`, render an empty-state row "No portfolio data
   available." 12px/400 `colors.textMuted` with the body padding intact.
5. Wraps in `<CardShell>` with:
   - `title="PORTFOLIO SNAPSHOT"`
   - `icon={<Activity size={13} color={colors.brandBlue} />}`
   - `width={dims.rightColWidth}` (380)
   - **No** `headerRight`, **no** `footer` (this card has neither)
6. Body uses `statRowDims.bodyPadding` for the inner container.

---

## §5 Reuse from `INDEX.md`

Existing items to use, do **not** recreate:

- `components/domain/CardShell` (Phase 6) — wraps the panel
- `components/layout/AppShell`, `PageHeader` — already in place
- `services/baseQuery.ts` — RTK Query base config
- `theme/tokens.ts` — extend (add dims, statRowDims, portfolioStatStyles); don't fork
- `app/store.ts` — extend, don't recreate

If `INDEX.md` shows `PortfolioSnapshotPanel`, `StatRow`, or
`portfolioApi` already exist, **stop and report** rather than overwriting.

`StatRow` is intentionally **generic over `PortfolioStat`**, not
hardcoded to portfolio. If a future phase needs an icon-label-value row
for a different domain, the right call is: extract a more abstract
`StatRowGeneric` from `StatRow` once a second consumer is real, NOT now.
Premature generalization is on the auto-reject list.

This phase does NOT touch:
- Phase 4 SubmissionsTable
- Phase 6 OpenTasksPanel / TaskRow
- Phase 3 KPI cards (also aggregations, but a separate panel)

---

## §6 Acceptance criteria

### Visual

1. Card outer is exactly 380px wide.
2. Header bar shows `Activity` icon + "PORTFOLIO SNAPSHOT" 12px/700 brand blue.
3. Header has no filter tabs, no count badge, no right-side controls.
4. 6 stat rows render in this order: Total Submissions MTD, Quoted
   Pipeline, Bound YTD, Avg. Appetite Score, Submissions in SLA, Docs
   Incomplete.
5. Each row's icon color matches `portfolioStatStyles[key].iconColor`:
   - Total Submissions MTD → blue
   - Quoted Pipeline → green
   - Bound YTD → blue-deep
   - Avg. Appetite Score → gold
   - Submissions in SLA → green
   - Docs Incomplete → amber
6. Each row's value is right-aligned, 13px/700 dark text.
7. Each row's label is left-aligned, 12px/400 body color.
8. Rows 1-5 have a 1px bottom border `colors.borderDefault`. Row 6 has none.
9. No card footer.
10. No border-radius anywhere.

### Code quality

11. `npm run lint` passes — no boundary violations.
12. `npm run type-check` passes — strict mode, no `any`.
13. **No raw `rgb(...)` or hex strings in component files.** All colors via tokens.
14. `PortfolioSnapshotPanel.tsx`, `StatRow.tsx` contain zero RTK Query
    hooks, zero `useAppSelector`, zero `useAppDispatch`,
    zero `fetch`/`axios`, zero aggregation logic.
15. Container is < 30 lines.
16. `formatStatValue` is a pure function in `shared/utils/`.
17. `PortfolioStatKey` is the union derived from `portfolioStatStyles`
    keys — adding a key without a matching `portfolioStatStyles` entry
    fails TypeScript.
18. The display order is a single `STAT_DISPLAY_ORDER` constant, NOT
    sprinkled across the component or container.

### Behavior

19. Pass `stats={[]}` → empty-state row renders.
20. Pass `stats=[oneStat]` → exactly one row renders, no bottom border on it (it's last).
21. Reorder the input array → DOM order changes. (Confirms component
    does no internal sorting.)
22. Click a row → `onStatClick(stat.key)` fires with the stat's key.
23. With `onStatClick={undefined}` → row has no pointer cursor, click is no-op.
24. The 6 mock stats render with correct formatting:
    `22`, `$4.2M`, `$3.1M`, `81/100`, `91%`, `4 subs`.

---

## §7 Out of scope

- ❌ Real backend wiring (mock data; mark with TODO)
- ❌ Route filtering on stat click — container only `console.log`s for now.
  Real navigation lands when Submissions feature page (different feature)
  is built and accepts URL filter params.
- ❌ Refactoring Phase 3 KPI cards to share `StatRow` — separate cleanup spec
- ❌ Loading skeletons / error states (separate polish phase)
- ❌ "Last refreshed N minutes ago" text using `generatedAt` — later polish
- ❌ Polling / refetch on focus — later polish
- ❌ Hover states beyond cursor change — later polish
- ❌ Expand-on-click drill-down panel (drill-down via route navigation only)
- ❌ Mobile breakpoints below 768px
- ❌ Unit tests
- ❌ Accessibility audit beyond basic semantic HTML
- ❌ The other dashboard panels (Phase 5 Pipeline Chart, Phase 7 Recent
  Activity, Phase 9+ Team Performance bottom table)
- ❌ MCP / Figma tooling