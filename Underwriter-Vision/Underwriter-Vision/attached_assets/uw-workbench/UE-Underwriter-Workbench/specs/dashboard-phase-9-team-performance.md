# Spec: Dashboard Phase 9 — Team Performance Table

## §1 Goal

Ship the **Team Performance** card at the bottom of the dashboard: a
783×313 card showing each underwriter's current workload (In Review /
Quoted / Bound counts), Hit Ratio, and Days to Quote. Each row has a
colored avatar driven by underwriter role (gold for `lead`, grey for
`standard`), name + role label, and 5 numeric columns.

The panel is a **fourth consumer of `CardShell`** (after Phases 5, 6,
8). No new atoms are introduced; this is a pure consumer. The
component is the **second table on the dashboard** (after Phase 4
SubmissionsTable). Per the architecture rules, **we do NOT extract a
generic `<Table<T>>` from the diff** — wait for a third table to
appear. The two tables are structurally different (Submissions has 9
narrow cols + status pills + chevron; Team Performance has 6 fixed-width
cols + avatar + role labels). Forcing a shared abstraction now would
leak both schemas into one prop surface.

The component is **fully presentational and dumb**:
- Receives `underwriters: UnderwriterPerformance[]`
- Renders exactly that array, in given order, no aggregation, no sorting
- Does not compute Hit Ratio (backend returns it precomputed as a
  whole-number percent: `71`, not `0.71`)
- Does not branch on role (`underwriterRoleStyles[role]` lookup)
- Does not embed the days-to-quote threshold (reads from
  `daysToQuoteThreshold.fastUnder`)

This is the third consumer of the **xStyles + lookup pattern**
(after `statusStyles`, `priorityStyles`, `pipelineSeriesStyles`,
`portfolioStatStyles`). Pattern is now load-bearing.

---

## §2 Design source (no MCP)

Figma MCP is not used. All design values come from `src/theme/tokens.ts`.

**New tokens this phase adds** (apply patch first):

- `dims.underwriterCardHeight` = 313, `dims.teamPerfCardWidth` = 783
- `colors.warningAmber` = `rgb(180, 83, 9)` — confirmed from Figma JSON
  (the Days-to-Quote amber color). Existing `warningAmberBorder` is
  the same value; the new alias is added because Phase 9 uses this as
  text color, not a border, and naming it accurately matters.
- `teamPerfDims` — column width, row heights, avatar size, font sizes
  for every text element. Reusable by any future table that follows
  the same flat-column layout.
- `underwriterRoleStyles` — `{ lead, standard }` map, each with
  `{ avatarBg, avatarText }`. `Avatar` component looks up by role.
- `teamPerfStatStyles` — `{ inReview, quoted, bound }` map, each with
  `{ color }`. Mirrors `pipelineSeriesStyles` for visual consistency
  but is a separate map because semantics are different (a Pipeline
  series and a TeamPerf column happen to share colors today; they
  shouldn't be coupled).
- `daysToQuoteThreshold` — `{ fastUnder: 4.0, fastColor, slowColor }`.
  Single source of truth for the green/amber cutoff.
- `UnderwriterRole` type — union of `'lead' | 'standard'`.
- `TeamPerfStatKey` type — union of the 3 stat-column keys.

**Existing tokens this phase reuses:**

- `colors.*` — surfaces, borders, text, brand
- `cardDims` (Phase 6) — header padding & dimensions
- `fonts.sans`, `fontSize`, `fontWeight`
- `CardShell` component (Phase 6) — wraps the panel

**No raw `rgb(...)` or hex strings in component files.**

Reference dimensions confirmed from Figma JSON:
- Card outer: 783 × 313, white bg, `borderStrong` 1px border
- Header bar: 782 × 42, bg `bgMuted`, `borderDefault` 1px bottom
- Column-headers row: 782 × 35, bg `bgMuted`, `borderDefault` 1px bottom
- Data row: 782 × 58, white bg, `borderDefault` 1px bottom (none on last)
- Each column: 124px × content height, no gaps between columns
- Avatar: 26 × 26 square, no border-radius
- Avatar→name gap: 10px

---

## §3 Scope — files this spec creates or modifies

| Path | Action | Purpose |
|---|---|---|
| `src/theme/tokens.ts` | modify | Add `dims.*` aliases, `colors.warningAmber`, `teamPerfDims`, `underwriterRoleStyles`, `teamPerfStatStyles`, `daysToQuoteThreshold`, `UnderwriterRole`/`TeamPerfStatKey` types |
| `src/shared/types/teamPerformance.ts` | create | `UnderwriterRole` (re-export), `UnderwriterPerformance`, `TeamPerformance` types, `TEAM_PERF_COL_ORDER` const |
| `src/shared/utils/getInitials.ts` | create | Pure: `getInitials(name) → 'SM'`. 1-2 char output, uppercased. Reusable. |
| `src/shared/utils/formatHitRatio.ts` | create | Pure: `formatHitRatio(percent) → '71%'`. Backend returns whole-number; this just appends `%`. Centralizing now means switching to decimal-percent later is one file edit. |
| `src/shared/utils/formatDaysToQuote.ts` | create | Pure: `formatDaysToQuote(days) → '3.8d'`. Always 1 decimal. |
| `src/services/teamPerformance/teamPerformanceApi.ts` | create | RTK Query `teamPerformanceApi` with `getTeamPerformance` endpoint, mock data inline with TODO. **Backend computes In Review / Quoted / Bound counts + Hit Ratio + Days to Quote per underwriter; frontend never aggregates.** |
| `src/components/domain/Avatar/Avatar.tsx` | create | Generic 26×26 square avatar with initials. Takes `name` + `role`. Looks up `underwriterRoleStyles[role]`. Reusable for any future "people" UI. |
| `src/components/domain/Avatar/index.ts` | create | barrel |
| `src/components/domain/TeamPerformanceRow/TeamPerformanceRow.tsx` | create | One row of the table. Takes `underwriter`. Pure presentational. |
| `src/components/domain/TeamPerformanceRow/index.ts` | create | barrel |
| `src/components/domain/TeamPerformancePanel/TeamPerformancePanel.tsx` | create | Composes `CardShell` + column-headers row + N rows. Pure presentational. |
| `src/components/domain/TeamPerformancePanel/index.ts` | create | barrel |
| `src/containers/dashboard/TeamPerformanceContainer.tsx` | create | Calls `useGetTeamPerformanceQuery`, passes underwriters to component. No aggregation. |
| `src/features/dashboard/pages/DashboardPage.tsx` | modify | Mount `<TeamPerformanceContainer />` at the bottom of the dashboard, wrapped in `<ErrorBoundary>` per Phase 4.5 conventions |
| `src/app/store.ts` | modify | Register `teamPerformanceApi.reducerPath` + middleware |

After implementation: run `npm run index` to refresh `INDEX.md`.

**File count: 11 new + 2 modified = 13.** Slightly over the 5–10 rule
of thumb; most are tiny barrels and pure formatters. Three substantive
components: `Avatar`, `TeamPerformanceRow`, `TeamPerformancePanel`.

---

## §4 Data + behavior

### Type definitions (`src/shared/types/teamPerformance.ts`)

```ts
import type { UnderwriterRole, TeamPerfStatKey } from '@/theme/tokens';

export type { UnderwriterRole, TeamPerfStatKey };

export interface UnderwriterPerformance {
  id:           string;          // backend underwriter ID
  name:         string;          // 'Sarah Mitchell'
  roleLabel:    string;          // 'Underwriter' | 'Sr. Underwriter' | 'UW Analyst'
  role:         UnderwriterRole; // drives avatar color: 'lead' | 'standard'
  inReview:     number;          // count
  quoted:       number;
  bound:        number;
  hitRatioPct:  number;          // 71 (whole number, not 0.71)
  daysToQuote:  number;          // 3.8
}

export interface TeamPerformance {
  underwriters: UnderwriterPerformance[];
  generatedAt:  string;          // ISO timestamp from server
}

/**
 * Frontend-controlled column order. Reordering = edit one line.
 * Note this is the COLUMN order; the component renders one column per key.
 */
export const TEAM_PERF_COL_ORDER = [
  'underwriter',
  'inReview',
  'quoted',
  'bound',
  'hitRatio',
  'daysToQuote',
] as const;

export type TeamPerfColumnKey = (typeof TEAM_PERF_COL_ORDER)[number];
```

### Format helpers (pure functions in `shared/utils/`)

```ts
// getInitials.ts
export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0 || !parts[0]) return '';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// formatHitRatio.ts
export function formatHitRatio(pct: number): string {
  return `${Math.round(pct)}%`;
}

// formatDaysToQuote.ts
export function formatDaysToQuote(days: number): string {
  return `${days.toFixed(1)}d`;
}
```

All three are pure, side-effect-free, trivially testable.

### API endpoint (`src/services/teamPerformance/teamPerformanceApi.ts`)

```ts
export const teamPerformanceApi = createApi({
  reducerPath: 'teamPerformanceApi',
  baseQuery: baseQuery,
  tagTypes: ['TeamPerformance'],
  endpoints: (builder) => ({
    getTeamPerformance: builder.query<TeamPerformance, void>({
      // TODO: replace with real endpoint /api/team-performance
      // Backend aggregates per underwriter:
      //   - inReview / quoted / bound counts (this period)
      //   - hitRatioPct (bound ÷ submissions)
      //   - daysToQuote (avg time from submitted → quoted)
      // Frontend never aggregates from getSubmissions.
      queryFn: async () => ({ data: MOCK_TEAM_PERFORMANCE }),
      providesTags: ['TeamPerformance'],
    }),
  }),
});

export const { useGetTeamPerformanceQuery } = teamPerformanceApi;
```

`MOCK_TEAM_PERFORMANCE` is a `TeamPerformance` constant with 4
underwriters matching the Figma data:

| name | roleLabel | role | inReview | quoted | bound | hitRatioPct | daysToQuote |
|---|---|---|---|---|---|---|---|
| Sarah Mitchell | Underwriter | lead | 5 | 7 | 3 | 71 | 3.8 |
| John Martinez | Sr. Underwriter | standard | 4 | 9 | 4 | 74 | 3.2 |
| Tom Lewis | UW Analyst | standard | 3 | 5 | 3 | 68 | 4.5 |
| James O'Connor | UW Analyst | standard | 2 | 4 | 2 | 66 | 4.9 |

(Note: `John Martinez` has initials JM, `James O'Connor` has initials
JO — both are derivable from the name via `getInitials()`. Backend
sends names; frontend computes initials. No `initials` field on the
type — eliminates a desync risk.)

### Container (`src/containers/dashboard/TeamPerformanceContainer.tsx`)

```tsx
export function TeamPerformanceContainer() {
  const { data } = useGetTeamPerformanceQuery();

  if (!data) return null; // loading state — polish phase

  return (
    <TeamPerformancePanel underwriters={data.underwriters} />
  );
}
```

Container is < 15 lines. No aggregation, no formatting, no ordering
(API returns in the order it should be displayed; if a future spec
needs sorting, the sort is added here, not in the component).

### Component contracts

#### `<Avatar>` (domain — generic, reusable)

```tsx
interface AvatarProps {
  name: string;                    // for initials computation
  role: UnderwriterRole;           // drives bg + text color
  size?: number;                   // default 26 (px); allows reuse at different sizes
}
```

- 26×26 by default, zero border-radius (no `border-radius` anywhere).
- Looks up `style = underwriterRoleStyles[role]`
- `bg = style.avatarBg`, initials text color = `style.avatarText`
- Initials computed via `getInitials(name)`, displayed 10px/700 centered
- Pure stateless. No hover. No click.

This is a generic atom — future "Recent Activity" feed (Phase 7) will
reuse it. Do NOT extend it with role-specific logic; if a future use
case has different role values, that's a different domain — extract a
generic `<InitialsAvatar>` then.

#### `<TeamPerformanceRow>` (domain — main row component)

```tsx
interface TeamPerformanceRowProps {
  underwriter: UnderwriterPerformance;
  isLast?: boolean;                // suppresses bottom border
}
```

**Rules:**
1. Outer div: `teamPerfDims.rowHeight` (58px), flex row, no padding,
   no gaps, `borderDefault` 1px bottom border (suppressed if `isLast`).
2. Six column children, each `teamPerfDims.columnWidth` (124px) wide,
   `align: 'center'` (vertical), default left-aligned content, no
   internal padding (the cell content provides its own).
3. **Underwriter column:** flex row, gap `teamPerfDims.avatarGap` (10),
   align center: `<Avatar name={u.name} role={u.role} />` + flex-column
   stack with name (12/600 textHeading) and `roleLabel` (10/400 textMuted)
4. **In Review column:** number, font 14/700, color
   `teamPerfStatStyles.inReview.color`
5. **Quoted column:** font 14/700, color `teamPerfStatStyles.quoted.color`
6. **Bound column:** font 14/700, color `teamPerfStatStyles.bound.color`
7. **Hit Ratio column:** `formatHitRatio(u.hitRatioPct)`, 13/700, always
   `colors.textHeading`. Never threshold-colored.
8. **Days to Quote column:** `formatDaysToQuote(u.daysToQuote)`, 13/600.
   Color via threshold:
   ```tsx
   const dtqColor = u.daysToQuote < daysToQuoteThreshold.fastUnder
     ? daysToQuoteThreshold.fastColor
     : daysToQuoteThreshold.slowColor;
   ```
9. The component does NOT branch on which underwriter (no `if (name === 'Sarah')`).
10. The component does NOT click-handle anything (Q4 = no click).

#### `<TeamPerformancePanel>` (domain — main component)

```tsx
interface TeamPerformancePanelProps {
  underwriters: UnderwriterPerformance[];
}
```

**Rules:**
1. Wraps in `<CardShell>` with:
   - `title="TEAM PERFORMANCE"`
   - `icon={<Users size={13} />}` — lucide-react Users icon
   - `iconColor={colors.brandBlue}` (default brand blue, NOT gold)
   - `width={dims.teamPerfCardWidth}` (783)
   - **No** `headerRight`, **no** `footer`
2. Body:
   - Column-headers row: 782×35, bg `bgMuted`, `borderDefault` 1px bottom.
     Six column heads, each 124px, font 9/700 uppercase `textMuted`,
     left-aligned. Renders fixed labels: UNDERWRITER, IN REVIEW,
     QUOTED, BOUND, HIT RATIO, DAYS TO QUOTE.
   - For each underwriter: render `<TeamPerformanceRow>`.
   - Last row gets `isLast={true}` to suppress bottom border.
3. **Empty state:** if `underwriters.length === 0`, render an empty-row
   "No team performance data available." 12/400 `textMuted`, in a
   single 58px row.

The column-headers row is part of `TeamPerformancePanel`, NOT a
separate component. It's small, structurally tied to this panel, and
extracting it to a generic `<TableHeaderRow>` would require a second
table consumer that doesn't exist yet.

---

## §5 Reuse from `INDEX.md`

Existing items to use, do **not** recreate:

- `components/domain/CardShell` (Phase 6) — wraps the panel
- `components/common/ErrorBoundary` (Phase 4.5) — wraps the container in DashboardPage
- `components/layout/AppShell`, `PageHeader` — already in place
- `services/baseQuery.ts` — RTK Query base config
- `theme/tokens.ts` — extend (add maps + dims); don't fork
- `app/store.ts` — extend, don't recreate

If `INDEX.md` shows `Avatar`, `TeamPerformanceRow`,
`TeamPerformancePanel`, `TeamPerformanceContainer`,
`teamPerformanceApi`, `getInitials`, `formatHitRatio`, or
`formatDaysToQuote` already exist, **stop and report** rather than
overwriting.

If `INDEX.md` does not yet show Phase 4.5 (`ErrorBoundary`,
`PanelErrorState`), this phase still proceeds — but the
`<ErrorBoundary>` wrapper around `<TeamPerformanceContainer />` is a
soft requirement that becomes hard once Phase 4.5 ships. If 4.5
hasn't shipped, mount the container without ErrorBoundary and
TODO-comment the wrapper.

This phase does NOT touch:
- Phase 4 SubmissionsTable
- Phase 5 PipelinePanel
- Phase 6 OpenTasksPanel
- Phase 8 PortfolioSnapshotPanel

The Avatar atom is intentionally scoped to "underwriters" semantics in
this phase. If Phase 7 Recent Activity needs avatars for activity
actors (which may have different role values), extract a generic
`<InitialsAvatar>` from `<Avatar>` then. Premature generalization is
on the auto-reject list.

---

## §6 Acceptance criteria

### Visual

1. Card outer is exactly 783 × 313.
2. Header bar shows `Users` icon in brand blue + "TEAM PERFORMANCE"
   12px/700 brand blue.
3. Header has no filter tabs, no badge, no right-side controls.
4. Column-headers row: 35px tall, bg `bgMuted`, 1px `borderDefault`
   bottom, 6 columns of 9/700 uppercase muted text: UNDERWRITER,
   IN REVIEW, QUOTED, BOUND, HIT RATIO, DAYS TO QUOTE.
5. Each data row: 58px tall, white bg, 1px `borderDefault` bottom
   (suppressed on last row), 6 columns of 124px each.
6. Sarah's avatar: gold (`accentGold`) bg with white "SM" initials.
7. John's, Tom's, James's avatars: muted grey (`borderDefault`) bg
   with `textBody` initials ("JM", "TL", "JO").
8. Initials are derived from the name via `getInitials()` — verify by
   passing in a one-word name like `"Sarah"` → "SA" (first 2 chars,
   uppercased).
9. Name in 12/600 `textHeading`, role label in 10/400 `textMuted`.
10. In Review numbers in `brandBlue`, Quoted in `brandBlueDeep`, Bound
    in `successGreen`, all 14/700.
11. Hit Ratio in `textHeading` 13/700, always (no threshold coloring).
12. Days to Quote: 13/600, **green when value < 4.0**, **amber when
    value ≥ 4.0**. Mock data: 3.8d→green, 3.2d→green, 4.5d→amber,
    4.9d→amber.
13. No border-radius anywhere — avatar is square.

### Code quality

14. `npm run lint` passes.
15. `npm run type-check` passes — strict mode, no `any`.
16. **No raw `rgb(...)` or hex strings in component files.** All colors via tokens.
17. `TeamPerformancePanel.tsx`, `TeamPerformanceRow.tsx`, `Avatar.tsx`
    contain zero RTK Query hooks, zero `useAppSelector`/`useAppDispatch`,
    zero `fetch`/`axios`, zero aggregation logic.
18. Container is < 15 lines.
19. Format helpers (`getInitials`, `formatHitRatio`, `formatDaysToQuote`)
    are pure functions in `shared/utils/`. No React.
20. `UnderwriterRole`, `TeamPerfStatKey` are derived from
    `underwriterRoleStyles` / `teamPerfStatStyles` keys via `keyof typeof`
    — adding a key without a matching style entry fails TypeScript.
21. The days-to-quote threshold is read from `daysToQuoteThreshold.fastUnder`,
    NOT a hardcoded `4.0` literal in the component.
22. Column order is driven by component JSX order (since it's only one
    component); future need for runtime reordering would extract
    `TEAM_PERF_COL_ORDER` into a `.map()` driver.

### Behavior

23. Pass `underwriters={[]}` → empty-row text renders, no data rows.
24. Pass 1 underwriter → 1 data row, no bottom border on it.
25. Pass 4 underwriters → 4 data rows, last has no bottom border.
26. Reorder the input array → DOM row order changes.
27. Container mounted inside `<ErrorBoundary>` in `DashboardPage` per
    Phase 4.5 conventions.
28. With Sarah only (`role: 'lead'`) → gold avatar with white initials.
29. With Tom only (`role: 'standard'`) → grey avatar with body-text initials.
30. With a hypothetical underwriter at `daysToQuote: 4.0` exactly → amber
    (boundary is inclusive of 4.0 on the slow side; `< 4.0` is the
    strict cutoff).
31. With `daysToQuote: 3.99999` → green.

---

## §7 Out of scope

- ❌ Real backend wiring (mock; mark with TODO)
- ❌ Click handling on rows (Q4 = display-only). When future spec
  enables drill-down, container adds `onUnderwriterClick(id)` and
  routes via URL params per CLAUDE.md cross-panel convention.
- ❌ Sorting columns. If sort is wanted, sort logic goes in the
  container's `useMemo`, not the component.
- ❌ Hit Ratio threshold coloring (Q3 was about days-to-quote only;
  Hit Ratio is always plain heading text per Figma).
- ❌ Hover states beyond the natural cursor.
- ❌ Loading skeletons / error states (separate polish phase; the
  ErrorBoundary handles thrown errors but not loading flicker).
- ❌ Refactoring Phase 4 SubmissionsTable to share atoms with this
  phase. Both tables stay independent until a third consumer makes
  the abstraction worth extracting.
- ❌ Extracting `<InitialsAvatar>` generic — wait for Phase 7 to
  motivate it.
- ❌ Mobile responsive breakpoints below 768px.
- ❌ Accessibility audit beyond semantic HTML.
- ❌ Unit tests (`getInitials`, `formatHitRatio`, `formatDaysToQuote` are
  trivially testable; recommended but not required this phase).
- ❌ MCP / Figma tooling.