# Spec: Dashboard Phase 5 — Submission Pipeline Panel

## §1 Goal

Ship the **Submission Pipeline panel** on the Dashboard: a 783px-wide
card containing a grouped bar chart of submission counts by month and
status, for the last 6 months. Three series — Submitted, Quoted, Bound —
render as colored bars per month bucket. Y-axis auto-scales to data,
X-axis labels months, hover shows a tooltip with all 3 series values,
clicking a bar fires `onBarClick(month, series)`.

The panel is the **second consumer of `CardShell`** (built in Phase 6),
strengthening the abstraction. It introduces the project's first chart,
done via **Recharts** — chosen for ergonomics, TS support, and
out-of-the-box tooltip + axis primitives. Imports are surgical to keep
bundle impact under ~50 KB gzipped.

The component is **fully presentational and dumb**:
- Receives a `Pipeline` object with `months: PipelineMonthBucket[]`
- Renders exactly that data, in given order
- Does not aggregate, group, or compute counts
- Does not do date math (months come pre-formatted as `'Oct'`, `'Nov'` etc.)
- Filter / time-range state would live in the container (none for this phase — fixed last 6 months)

---

## §2 Design source (no MCP)

Figma MCP is not used. All design values come from `src/theme/tokens.ts`.

**New tokens this phase adds** (apply patch first):

- `dims.pipelineCardWidth` = 783, `dims.pipelineCardHeight` = 306
- `chartDims` — body padding, legend layout, chart height, tick count,
  axis dimensions, bar gaps. Reusable by any future chart.
- `pipelineSeriesStyles` — `{ submitted, quoted, bound }` map keyed by
  series key, each with `{ color, label }`. ChartLegend + Recharts
  `<Bar fill={...} />` look up by key.
- `PipelineSeriesKey` type — union of the 3 series keys.

**Existing tokens this phase reuses:**

- `colors.*` — surfaces, borders, text, brand
- `cardDims` (Phase 6) — header padding & dimensions
- `fonts.sans`, `fontSize`, `fontWeight`
- `CardShell` component (Phase 6) — wraps the panel

**`CardShell` modification:** add an optional `iconColor?: string` prop
(default `colors.brandBlue`). The Pipeline panel passes
`colors.accentGold` because the Figma uses a gold bar-chart icon. This
is a 2-line change to `CardShell.tsx`. If `CardShell` does not yet
expose `iconColor`, it must be added as part of this phase. (Treat as a
backward-compatible extension — every existing consumer keeps working.)

**No raw `rgb(...)` or hex strings in component files.**

Reference dimensions:
- Card outer: 783 × 306
- Header: 782 × 42
- Body container: 782 × 261, padding 20 / 20 / 0 / 20, flex column gap 16
- Legend row: 742 × 17
- Chart area: 742 × 188

---

## §3 Scope — files this spec creates or modifies

| Path | Action | Purpose |
|---|---|---|
| `package.json` | modify | Add `recharts` dependency |
| `src/theme/tokens.ts` | modify | Add `dims.pipelineCard*`, `chartDims`, `pipelineSeriesStyles`, `PipelineSeriesKey` |
| `src/components/domain/CardShell/CardShell.tsx` | modify | Add optional `iconColor?: string` prop, default `colors.brandBlue` |
| `src/shared/types/pipeline.ts` | create | `Pipeline`, `PipelineMonthBucket`, `PipelineSeriesKey` (re-export), `PIPELINE_SERIES_ORDER` |
| `src/shared/utils/niceScale.ts` | create | Pure: `niceScale(maxValue, tickCount)` → `{ niceMax, ticks }`. Implements the standard "nice numbers" algorithm. |
| `src/services/pipeline/pipelineApi.ts` | create | RTK Query `pipelineApi` with `getPipeline` endpoint, mock 6 months inline with TODO |
| `src/components/domain/ChartLegend/ChartLegend.tsx` | create | Generic legend row: takes `items: { color, label }[]`. Reusable for any chart. |
| `src/components/domain/ChartLegend/index.ts` | create | barrel |
| `src/components/domain/PipelineBarChart/PipelineBarChart.tsx` | create | Wraps Recharts `<BarChart>`. Takes `months`, `series`. Pure presentational. **Not** generic — domain-specific name reflects scope. If a second bar chart appears later, extract the generic at that point. |
| `src/components/domain/PipelineBarChart/index.ts` | create | barrel |
| `src/components/domain/PipelinePanel/PipelinePanel.tsx` | create | Composes `CardShell` + `ChartLegend` + `PipelineBarChart`. Pure presentational. |
| `src/components/domain/PipelinePanel/index.ts` | create | barrel |
| `src/containers/dashboard/PipelinePanelContainer.tsx` | create | Calls `useGetPipelineQuery`, transforms response, `onBarClick` console.logs |
| `src/features/dashboard/pages/DashboardPage.tsx` | modify | Mount `<PipelinePanelContainer />` in left column under SubmissionsTable |
| `src/app/store.ts` | modify | Register `pipelineApi.reducerPath` + middleware |

After implementation: run `npm run index` to refresh `INDEX.md`.

**File count: 9 new + 4 modified = 13.** Slightly over the 5–10 rule of
thumb, but the new files include 2 reusable atoms (`ChartLegend`,
`niceScale`) and one library hookup (Recharts) that future chart phases
will leverage with zero added cost.

---

## §4 Data + behavior

### Type definitions (`src/shared/types/pipeline.ts`)

```ts
import type { PipelineSeriesKey } from '@/theme/tokens';

export type { PipelineSeriesKey };

export interface PipelineMonthBucket {
  monthLabel: string; // pre-formatted: 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'
  monthIso:   string; // '2024-10' — opaque key for click-through routing
  submitted:  number;
  quoted:     number;
  bound:      number;
}

export interface Pipeline {
  months: PipelineMonthBucket[]; // exactly 6 for this phase, ordered oldest → newest
  generatedAt: string;           // ISO timestamp from server
}

/**
 * Frontend-controlled render order of bars within each month group.
 * Reordering = edit one line.
 */
export const PIPELINE_SERIES_ORDER: readonly PipelineSeriesKey[] = [
  'submitted',
  'quoted',
  'bound',
] as const;
```

### Nice-scale helper (`src/shared/utils/niceScale.ts`)

```ts
export interface NiceScale {
  niceMax: number;   // 24 (for max=22)
  ticks:   number[]; // [0, 6, 12, 18, 24]
}

/**
 * Computes a "nice" round-number max + evenly spaced ticks given a data max.
 * Standard algorithm — handles 0 (returns max=10, ticks 0,2,4,6,8,10),
 * floats, large numbers.
 *
 *   niceScale(22, 5) → { niceMax: 24, ticks: [0, 6, 12, 18, 24] }
 *   niceScale(0,  5) → { niceMax: 10, ticks: [0, 2, 4, 6, 8, 10] }
 *   niceScale(8,  5) → { niceMax: 8,  ticks: [0, 2, 4, 6, 8] }
 *
 * Pure function. No React. Easy to unit test.
 */
export function niceScale(maxValue: number, tickCount: number = 5): NiceScale;
```

The implementer should use the standard "nice number" algorithm
(Heckbert 1990 or equivalent). Test cases listed above must pass.

### API endpoint (`src/services/pipeline/pipelineApi.ts`)

```ts
export const pipelineApi = createApi({
  reducerPath: 'pipelineApi',
  baseQuery: baseQuery,
  tagTypes: ['Pipeline'],
  endpoints: (builder) => ({
    getPipeline: builder.query<Pipeline, void>({
      // TODO: replace with real endpoint /api/pipeline?range=6m
      // Backend aggregates submission counts per month per status.
      // Frontend never aggregates from getSubmissions.
      queryFn: async () => ({ data: MOCK_PIPELINE }),
      providesTags: ['Pipeline'],
    }),
  }),
});

export const { useGetPipelineQuery } = pipelineApi;
```

`MOCK_PIPELINE` is a `Pipeline` constant in this file with 6 month
buckets matching the Figma data:

| monthLabel | monthIso | submitted | quoted | bound |
|---|---|---|---|---|
| Oct | 2023-10 | 8 | 6 | 4 |
| Nov | 2023-11 | 11 | 8 | 5 |
| Dec | 2023-12 | 7 | 5 | 4 |
| Jan | 2024-01 | 14 | 10 | 7 |
| Feb | 2024-02 | 18 | 13 | 9 |
| Mar | 2024-03 | 22 | 16 | 11 |

### Container (`src/containers/dashboard/PipelinePanelContainer.tsx`)

```tsx
export function PipelinePanelContainer() {
  const { data, isLoading } = useGetPipelineQuery();

  const handleBarClick = (
    monthIso: string,
    series: PipelineSeriesKey,
  ) => {
    // TODO: navigate to filtered Submissions view
    // e.g. /submissions?month=2024-03&status=Submitted
    // Out of scope for Phase 5 — see spec §7.
    console.log('[Pipeline] bar clicked:', monthIso, series);
  };

  if (!data) return null; // loading state — polish phase

  return (
    <PipelinePanel
      months={data.months}
      onBarClick={handleBarClick}
    />
  );
}
```

Container is < 30 lines. No aggregation. No grouping. Just plumbing.

### Component contracts

#### `<ChartLegend>` (domain — generic, reusable)

```tsx
interface ChartLegendItem {
  color: string;
  label: string;
}

interface ChartLegendProps {
  items: ChartLegendItem[];
}
```

- Renders horizontal row of legend items, gap `chartDims.legendItemGap` (20px)
- Each item: 10×10 colored square (no border) + 6px gap + label
  11px/600 `colors.textBody`
- Pure stateless. No hover. No click-to-toggle (Recharts has built-in
  legend with toggling but we use this custom one for design fidelity).

#### `<PipelineBarChart>` (domain — wraps Recharts)

```tsx
interface PipelineBarChartProps {
  months: PipelineMonthBucket[];
  series: readonly PipelineSeriesKey[];   // controls render order
  onBarClick?: (monthIso: string, seriesKey: PipelineSeriesKey) => void;
}
```

**Implementation outline:**

```tsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { colors, chartDims, pipelineSeriesStyles } from '@/theme/tokens';
import { niceScale } from '@/shared/utils/niceScale';

export function PipelineBarChart({ months, series, onBarClick }: PipelineBarChartProps) {
  // Transform to recharts shape: each row is one month.
  const data = months.map(m => ({
    monthLabel: m.monthLabel,
    monthIso:   m.monthIso,
    submitted:  m.submitted,
    quoted:     m.quoted,
    bound:      m.bound,
  }));

  // Compute nice y-axis from max value across all series
  const maxValue = Math.max(...months.flatMap(m => series.map(s => m[s])));
  const { niceMax, ticks } = niceScale(maxValue, chartDims.tickCount);

  return (
    <ResponsiveContainer width="100%" height={chartDims.chartHeight}>
      <BarChart
        data={data}
        barCategoryGap={chartDims.barGroupGap}
        barGap={chartDims.barGap}
        margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke={colors.borderDefault}
          vertical={false}
        />
        <XAxis
          dataKey="monthLabel"
          tickLine={false}
          axisLine={{ stroke: colors.borderStrong }}
          tick={{ fill: colors.textMuted, fontSize: 11, fontFamily: fonts.sans }}
        />
        <YAxis
          domain={[0, niceMax]}
          ticks={ticks}
          tickLine={false}
          axisLine={false}
          tick={{ fill: colors.textMuted, fontSize: 11, fontFamily: fonts.sans }}
          width={chartDims.yAxisWidth}
        />
        <Tooltip content={<PipelineTooltip />} cursor={{ fill: colors.bgMuted2 }} />
        {series.map(seriesKey => (
          <Bar
            key={seriesKey}
            dataKey={seriesKey}
            fill={pipelineSeriesStyles[seriesKey].color}
            onClick={(_d, _i, e) => {
              const clicked = data[_i];
              onBarClick?.(clicked.monthIso, seriesKey);
            }}
            style={{ cursor: onBarClick ? 'pointer' : 'default' }}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
```

`PipelineTooltip` is a small inline component that renders Recharts'
tooltip payload using token-driven styling — bg `colors.bgSurface`,
border `colors.borderStrong`, padding 8px 12px, no border-radius. Each
tooltip row: 10×10 swatch + label + value 12px/600.

**Imports must be surgical** — `import { BarChart, Bar, ... } from 'recharts'`,
not `import * as recharts`. Verify bundle impact under 60 KB gzipped via
visualizer (or trust default Recharts ESM tree-shaking).

#### `<PipelinePanel>` (domain — main component)

```tsx
interface PipelinePanelProps {
  months: PipelineMonthBucket[];
  onBarClick?: (monthIso: string, seriesKey: PipelineSeriesKey) => void;
}
```

**Rules:**
1. Wraps in `<CardShell>` with:
   - `title="SUBMISSION PIPELINE — LAST 6 MONTHS"`
   - `icon={<BarChart3 size={13} />}`
   - `iconColor={colors.accentGold}` (gold, not blue)
   - `width={dims.pipelineCardWidth}` (783)
   - **No** `headerRight`, **no** `footer`
2. Body uses `chartDims.bodyPadding`, flex column with `chartDims.bodyGap`.
3. Renders:
   - `<ChartLegend>` with items derived from `PIPELINE_SERIES_ORDER.map(k => pipelineSeriesStyles[k])`
   - `<PipelineBarChart months={months} series={PIPELINE_SERIES_ORDER} onBarClick={onBarClick} />`
4. Empty state: if `months.length === 0`, render text "No pipeline data
   for this period." 12px/400 `colors.textMuted` instead of the chart.

---

## §5 Reuse from `INDEX.md`

Existing items to use, do **not** recreate:

- `components/domain/CardShell` (Phase 6) — extended with `iconColor` prop in this phase
- `components/layout/AppShell`, `PageHeader` — already in place
- `services/baseQuery.ts` — RTK Query base config
- `theme/tokens.ts` — extend (add chartDims, pipelineSeriesStyles, etc); don't fork
- `app/store.ts` — extend, don't recreate

If `INDEX.md` shows `PipelinePanel`, `PipelineBarChart`, `ChartLegend`,
`niceScale`, or `pipelineApi` already exist, **stop and report** rather
than overwriting.

`ChartLegend` is intentionally generic. `PipelineBarChart` is
intentionally domain-specific (named after its use, not abstracted).
**Do NOT pre-extract a `<GenericBarChart>`** — wait for a second chart
to need it, then extract from the diff.

This phase does NOT touch:
- Phase 4 SubmissionsTable
- Phase 6 OpenTasksPanel
- Phase 8 PortfolioSnapshotPanel (but it's the second `CardShell` consumer
  alongside Phase 6 — confirms the abstraction)

---

## §6 Acceptance criteria

### Visual

1. Card outer is exactly 783px wide.
2. Header bar shows `BarChart3` icon in **gold** (`colors.accentGold`)
   + "SUBMISSION PIPELINE — LAST 6 MONTHS" 12px/700 `colors.brandBlue`.
3. Header has no filter tabs, no badge, no right-side controls.
4. Legend row shows 3 items in this order: Submitted (brand blue),
   Quoted (brand blue deep), Bound (success green). Swatches are 10×10
   with no border-radius.
5. Chart renders 6 month groups, each with 3 bars (Submitted/Quoted/Bound).
6. Bar heights match data: Mar's Submitted bar is the tallest; Dec's
   Bound bar is the shortest non-zero.
7. Y-axis ticks are nice numbers — for the mock data (max=22), should
   be 0/6/12/18/24.
8. X-axis labels show "Oct, Nov, Dec, Jan, Feb, Mar".
9. Gridlines are dashed `colors.borderDefault`.
10. No border-radius anywhere (bars are flat-topped rectangles).

### Code quality

11. `npm run lint` passes — no boundary violations.
12. `npm run type-check` passes — strict mode, no `any`.
13. **No raw `rgb(...)` or hex strings in component files.** All colors via tokens.
14. `PipelinePanel.tsx`, `PipelineBarChart.tsx`, `ChartLegend.tsx` contain
    zero RTK Query hooks, zero `useAppSelector`/`useAppDispatch`,
    zero `fetch`/`axios`, zero aggregation logic.
15. Container is < 30 lines.
16. Recharts imports are named imports only (`import { BarChart, ... } from 'recharts'`),
    not namespace imports. This preserves tree-shaking.
17. `niceScale` is a pure function in `shared/utils/`. No React.
18. `PipelineSeriesKey` is the union derived from `pipelineSeriesStyles`
    keys — adding a key to the type without a matching style entry
    fails TypeScript.
19. Bar render order is driven by `PIPELINE_SERIES_ORDER` constant, NOT
    hardcoded inside the component.

### Behavior

20. Pass `months={[]}` → empty-state text renders, no chart.
21. Mock 6 months → 18 bars total render (6 × 3).
22. Reorder the input `months` array → DOM x-axis order changes to match.
23. Hover a bar → tooltip appears showing the month + all 3 series values
    with colored swatches.
24. Click a bar → `onBarClick(monthIso, seriesKey)` fires with that
    bar's data; container `console.log`s in dev.
25. Without `onBarClick` prop → bars have default cursor, click is no-op.
26. With all-zero data → ticks default to 0/2/4/6/8/10, no bars render
    (everything has height 0), x-axis still shows month labels.
27. With max value of 8 → ticks become 0/2/4/6/8 (verified via `niceScale` unit reasoning).

---

## §7 Out of scope

- ❌ Real backend wiring (mock; mark with TODO). Endpoint shape may
  change when real API lands; `Pipeline` type can adapt.
- ❌ Time-range selector (this/last quarter, YTD, custom range) — fixed 6 months
- ❌ Drill-down navigation on bar click — container `console.log`s only
- ❌ Series toggle (clicking legend item to hide a series) — Recharts
  has this built-in via `<Legend />` but we use custom `ChartLegend`
  for design control. Toggle is a later polish phase.
- ❌ Animated entry / transitions — Recharts default is fine, no custom
  animation tuning
- ❌ Mobile responsive breakpoints below 768px (chart uses
  `ResponsiveContainer` for width fluidity but layout is desktop)
- ❌ Accessibility audit — Recharts ships basic a11y; deeper audit later
- ❌ Loading skeletons / error states — separate polish phase
- ❌ Refactoring KPI cards or other panels to use a shared chart
  primitive — premature
- ❌ Other charts (Pipeline by Status horizontal bars in earlier mock,
  if needed, is a separate phase)
- ❌ Unit tests for `niceScale` — recommended but not required this phase
- ❌ MCP / Figma tooling