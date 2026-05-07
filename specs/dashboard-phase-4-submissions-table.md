# Spec: Dashboard Phase 4 — Submissions Table Panel

## §1 Goal

Ship the **Submissions panel** on the Dashboard: a 783px-wide card containing
a header bar, scope tabs (Mine / Team / All), filter dropdown, a 9-column
table that renders **whatever rows are passed to it** (no hardcoded data),
and a footer with row count + "View all" link.

The table is the largest single component on the dashboard and the
foundation that Phases 5–8 build around. It must be **fully data-driven** —
the presentational component takes a `submissions` array prop and renders
exactly that, in order, with no internal data, no fixtures, no fallbacks.
Mock data is the container's responsibility, not the component's.

---

## §2 Design source (no MCP)

**Figma MCP is not used in this project.** All design values come from
`src/theme/tokens.ts`, which is the single source of truth and was
pre-populated from the Figma JSON exports.

For this phase, use these tokens (already defined):

- Surfaces: `colors.bgSurface`, `colors.bgMuted`, `colors.bgMuted2`
- Borders: `colors.borderDefault`, `colors.borderStrong`
- Text: `colors.textHeading`, `colors.textBody`, `colors.textMuted`
- Brand: `colors.brandBlue`, `colors.brandBlueDeep`
- Status pill styles: `statusStyles` map (keyed by status name)
- Priority chip styles: `priorityStyles` map (keyed by priority name)
- Table column widths: `dims.tableCols`
- Fonts: `fonts.sans`, `fonts.mono` (mono only on submission IDs)

**No hex codes, no inline `rgb(...)` strings in component files.**
If a value isn't in `tokens.ts`, add it there first, then use it.

Reference dimensions (from Figma JSON, encoded in `dims.tableCols`):

| Column | Width |
|---|---|
| ID | 58 |
| Member / Institution | 146 |
| Type | 75 |
| Assignee | 91 |
| Premium | 82 |
| Status | 114 |
| Priority | 87 |
| Eff. Date | 85 |
| Chevron | 45 |
| **Total** | **783** |

---

## §3 Scope — files this spec creates or modifies

| Path | Action | Purpose |
|---|---|---|
| `src/shared/types/submission.ts` | create | `Submission`, `SubmissionStatus`, `SubmissionPriority`, `InstitutionType` types |
| `src/shared/utils/formatCurrency.ts` | create if missing | `formatCurrency(n: number): string` → `$112,000` |
| `src/services/submissions/submissionsApi.ts` | create | RTK Query `submissionsApi` with `getSubmissions` endpoint, mock data inline with TODO |
| `src/components/domain/StatusPill/StatusPill.tsx` | create | `<StatusPill status={...} />`, reads `statusStyles[status]` |
| `src/components/domain/StatusPill/index.ts` | create | barrel |
| `src/components/domain/PriorityChip/PriorityChip.tsx` | create | `<PriorityChip priority={...} />`, reads `priorityStyles[priority]` |
| `src/components/domain/PriorityChip/index.ts` | create | barrel |
| `src/components/domain/SubmissionsTable/SubmissionsTable.tsx` | create | **Pure presentational. Takes `submissions: Submission[]` prop, renders rows as-is.** Composes `StatusPill` + `PriorityChip`. |
| `src/components/domain/SubmissionsTable/index.ts` | create | barrel |
| `src/containers/dashboard/SubmissionsTableContainer.tsx` | create | Calls `useGetSubmissionsQuery()`, passes `data ?? []` to component |
| `src/features/dashboard/pages/DashboardPage.tsx` | modify | Mount `<SubmissionsTableContainer />` in the existing dashboard layout |
| `src/app/store.ts` | modify | Register `submissionsApi.reducerPath` + middleware |

After implementation: run `npm run index` to refresh `INDEX.md`.

---

## §4 Data + behavior

### Submission type (`src/shared/types/submission.ts`)

```ts
export type SubmissionStatus = 'In Review' | 'Quoted' | 'Pending Info' | 'Bound' | 'Declined';
export type SubmissionPriority = 'Critical' | 'High' | 'Medium' | 'Low';
export type InstitutionType = 'K-12 Public' | 'Higher Ed' | 'Charter School' | 'Private School';

export interface Submission {
  id: string;                  // e.g. 'SUB-7829'
  member: string;              // e.g. 'Riverside Unified School District'
  state: string;               // 2-letter, e.g. 'CA'
  type: InstitutionType;
  assigneeInitials: string;    // 2 chars, e.g. 'SM'
  assigneeName: string;        // first name only, e.g. 'Sarah'
  premium: number;             // dollars, e.g. 112000
  status: SubmissionStatus;
  priority: SubmissionPriority;
  effDate: string;             // pre-formatted, e.g. 'Jul 1, 2024'
  docs: boolean;               // true → render red 'Docs ⚠' pill next to state
}
```

### API endpoint (`src/services/submissions/submissionsApi.ts`)

```ts
export const submissionsApi = createApi({
  reducerPath: 'submissionsApi',
  baseQuery: baseQuery,
  tagTypes: ['Submission'],
  endpoints: (builder) => ({
    getSubmissions: builder.query<Submission[], void>({
      // TODO: replace with real endpoint /api/submissions
      queryFn: async () => ({ data: MOCK_SUBMISSIONS }),
      providesTags: ['Submission'],
    }),
  }),
});

export const { useGetSubmissionsQuery } = submissionsApi;
```

`MOCK_SUBMISSIONS` is a `Submission[]` constant in this same file (15 rows
covering all status / priority / institution combinations + `docs:true` on
~3 rows). Mock data is the **only** place rows are hardcoded.

### Container (`src/containers/dashboard/SubmissionsTableContainer.tsx`)

```tsx
export function SubmissionsTableContainer() {
  const { data, isLoading, isError } = useGetSubmissionsQuery();
  // TODO: handle loading/error states properly in a later phase
  return <SubmissionsTable submissions={data ?? []} />;
}
```

### Component (`src/components/domain/SubmissionsTable/SubmissionsTable.tsx`)

**Contract:**

```tsx
interface SubmissionsTableProps {
  submissions: Submission[];
  scope?: 'Mine' | 'Team' | 'All';      // default: 'Team'
  onScopeChange?: (s: Scope) => void;
  onRowClick?: (s: Submission) => void;
  onViewAll?: () => void;
}
```

**Rules:**

1. The component **must render `submissions.length` rows**, in the order
   given. No filtering, no sorting, no slicing inside the component.
2. Footer text must be `Showing {n} of {n} submissions` where `n =
   submissions.length`. Header count badge shows the same number.
3. If `submissions.length === 0`, render an empty state row spanning all
   columns with text "No submissions to show." in `colors.textMuted`.
4. **No fetching, no Redux, no API hooks** — this is a pure presentational
   component. ESLint boundaries will reject violations.

### Cell renderers

- **ID**: `fonts.mono`, 12px / 700, `colors.brandBlueDeep`
- **Member / Institution**: two stacked lines
  - Line 1: name, 12px / 600, `colors.textHeading`
  - Line 2: `MapPin` icon (lucide, 9px, `colors.textMuted`) + state code
    11px / 400 + (if `docs`) red "Docs ⚠" pill (bg `colors.dangerRedBg`,
    border `colors.dangerRedBorder`, text 9px / 700 `colors.dangerRedText`)
- **Type**: small badge, bg `colors.bgMuted`, border `colors.borderDefault`,
  11px / 600 `colors.textBody`, padding 4px 8px
- **Assignee**: 22×22 square avatar bg `colors.borderDefault` with initials
  9px / 700 `colors.textBody` + 6px gap + first name 11px / 400
- **Premium**: 12px / 700 `colors.brandBlue`, formatted via `formatCurrency`
- **Status**: `<StatusPill status={row.status} />`
- **Priority**: `<PriorityChip priority={row.priority} />`
- **Eff. Date**: 11px / 400 `colors.textBody`
- **Last cell**: `ChevronRight` (lucide, 13px, `colors.textMuted`)

### Header bar (above table, inside card)

- Bg `colors.bgMuted`, bottom border `colors.borderDefault`, padding 12px 20px
- Left: `Inbox` icon 14px `colors.brandBlue` + text "SUBMISSIONS" 12px / 700
  `colors.brandBlue` (uppercase, tracking-wide)
- Right: count badge — bg `colors.brandBlue`, white text 11px / 700,
  padding 1px 10px, content = `submissions.length`

### Toolbar row (between header and table)

- Border bottom `colors.borderDefault`, padding 10px 20px
- Left: 3 segmented buttons (gap 4px), 31px tall, padding 1px 12px,
  12px / 600 text. Active button: bg `colors.brandBlue`, white text. Inactive:
  white bg, `colors.textBody` text, 1px `colors.borderStrong` border.
- Right: filter dropdown, 77×31, white bg, 1px `colors.borderStrong`,
  `Filter` icon 12px + "All" 12px / 500 + `ChevronDown` 12px

### Footer (below table, inside card)

- Bg `colors.bgMuted`, top border `colors.borderDefault`, padding 10px 20px
- Left: "Showing {n} of {n} submissions" 11px / 400 `colors.textMuted`
- Right: button "View all →" 11px / 600 `colors.brandBlueDeep` +
  `ChevronRight` 10px

### Card outer

- Width = `dims.submissionsCardWidth` (783px)
- Bg `colors.bgSurface`, 1px border `colors.borderStrong`
- **No border-radius** (squared aesthetic — applies to all cards/badges/pills)

---

## §5 Reuse from `INDEX.md`

Existing items to use, do **not** recreate:

- `components/layout/AppShell` — already wraps the dashboard
- `components/layout/PageHeader` — page title row, already in place
- `services/baseQuery.ts` — RTK Query base config (auth header)
- `theme/tokens.ts` — colors, fonts, dims, statusStyles, priorityStyles
- `app/store.ts` — extend, don't recreate; add `submissionsApi` reducer + middleware
- Phase 1–2 dashboard shell (Sidebar, TopBar) — untouched

If `INDEX.md` shows a `SubmissionsTable`, `StatusPill`, or `PriorityChip`
already exists, **stop and report** rather than overwriting.

---

## §6 Acceptance criteria

### Visual

1. Card outer is exactly 783px wide.
2. Column widths match `dims.tableCols` (verify by inspecting computed styles).
3. Status pills use the correct bg/border/dot/text from `statusStyles` for
   all 5 status values.
4. Priority chips use the correct bg/border/text from `priorityStyles` for
   all 4 priority values.
5. Submission IDs render in the Cousine mono font (verify in DevTools).
6. Rows with `docs: true` show the red "Docs ⚠" pill inline beside the state.
7. Active scope tab is visually distinct (blue bg, white text); inactive
   tabs are white-bg with body-text color.
8. Header count badge and footer count both equal `submissions.length`.
9. No border-radius on cards, pills, badges, avatars (verify in DevTools).

### Code quality

10. `npm run lint` passes — no boundary violations.
11. `npm run type-check` passes — strict mode, no `any`.
12. **No raw `rgb(...)` or hex strings in component files.** Every color
    comes from `tokens.ts`.
13. `SubmissionsTable.tsx` contains zero RTK Query hooks, zero
    `useAppSelector`, zero `useAppDispatch`, zero `fetch`/`axios` calls.
14. Container is < 30 lines and does only: hook call + prop forwarding.
15. `Submission` type is in `shared/types/`, not duplicated in feature folder.

### Behavior

16. Pass `submissions={[]}` → empty-state row renders, count badges show 0.
17. Pass `submissions={[oneRow]}` → exactly one row renders, count = 1.
18. Pass `submissions={[...15 mock rows]}` → all 15 render in given order.
19. Reorder the input array → DOM order changes to match. (Confirms
    component does no internal sorting.)
20. Click a row → `onRowClick(submission)` fires with that row's data, if
    handler is provided. No-op if not.

---

## §7 Out of scope

Explicitly **NOT** part of this phase:

- ❌ Real backend wiring (mock data is fine; mark with `TODO`)
- ❌ Sorting / filtering / search behavior in the table itself
- ❌ Pagination (the count says "Showing 15 of 15" — single page only)
- ❌ Loading skeletons / error states (later polish phase)
- ❌ Row hover details panel / drawer
- ❌ Mobile breakpoints below 768px (desktop-only for now)
- ❌ Unit tests (separate testing phase)
- ❌ Accessibility audit beyond basic semantic HTML (keyboard nav comes later)
- ❌ The other 4 dashboard panels (Pipeline Chart, Tasks, Activity,
  Underwriter Performance) — those are Phases 5–8, separate specs
- ❌ Any modification to MCP config or Figma tooling — this project does
  not use MCP
<!-- 

------------------------------------------------------ -->
  <!-- prompt
  
  
  # Implementation Prompt — Phase 4 Submissions Table

> Paste this into Claude in VS Code, after pasting `HANDOFF.md`,
> `CLAUDE.md`, the freshly regenerated `INDEX.md`, `TRACKER.md`,
> and `specs/dashboard-phase-4-submissions-table.md`.

---

Read these files only, in this order:

1. `INDEX.md`
2. `TRACKER.md`
3. `specs/dashboard-phase-4-submissions-table.md`
4. `CLAUDE.md` (workflow section)
5. `src/theme/tokens.ts` (already exists — design source of truth)

Then implement `specs/dashboard-phase-4-submissions-table.md` per `CLAUDE.md`
workflow.

## Hard rules for this phase

- **This project does NOT use Figma MCP.** Do not call `get_figma_data` or
  `download_figma_images`. Do not request a Figma URL or node ID. All
  design values already live in `src/theme/tokens.ts` (`colors`, `fonts`,
  `fontSize`, `fontWeight`, `dims`, `shadows`, `statusStyles`,
  `priorityStyles`). If a value is missing, add it to `tokens.ts` first,
  then use it.
- **Do NOT browse `src/` to "see what exists".** `INDEX.md` is the source
  of truth. If `INDEX.md` is stale, stop and tell me to run `npm run index`.
- **Do NOT hardcode rows inside `SubmissionsTable.tsx`.** The component
  must take a `submissions: Submission[]` prop and render exactly that
  array, in given order. Mock data lives ONLY in
  `services/submissions/submissionsApi.ts` (the container's data source).
  The presentational component must work for any `submissions` array I
  pass it later — including empty, one row, or 500 rows from a real API.
- **No raw colors in components.** Every color, font size, weight, and
  dimension comes from `tokens.ts`. ESLint will catch hex codes; don't
  trip it.
- **Three-layer flow is mandatory.** `SubmissionsTable.tsx` has zero
  RTK Query hooks, zero `useAppSelector`/`useAppDispatch`, zero
  `fetch`/`axios`. Container does the data fetching. Component renders
  props.
- **Cross-feature imports forbidden.** `Submission` type goes in
  `shared/types/submission.ts` because it'll be reused by Tasks (Phase 6),
  Activity (Phase 7), and Portfolio (Phase 8).

## Implementation order (suggested)

1. `shared/types/submission.ts` — type definitions
2. `shared/utils/formatCurrency.ts` — if not already in INDEX.md
3. `services/submissions/submissionsApi.ts` — RTK Query + 15 mock rows
4. `app/store.ts` — register the new API
5. `components/domain/StatusPill/` — reads from `statusStyles[status]`
6. `components/domain/PriorityChip/` — reads from `priorityStyles[priority]`
7. `components/domain/SubmissionsTable/` — composes the above, takes
   `submissions` prop, no internal data
8. `containers/dashboard/SubmissionsTableContainer.tsx` — calls
   `useGetSubmissionsQuery`, passes `data ?? []` to component
9. `features/dashboard/pages/DashboardPage.tsx` — mount the container

## When done

Per `CLAUDE.md` Workflow Step 5:

1. Run `npm run index` to regenerate `INDEX.md`.
2. Update `TRACKER.md`: mark Dashboard Phase 4 as `implemented` with
   today's date.
3. Run `npm run lint` and `npm run type-check` and confirm both pass.
4. Return a summary listing every file created/modified with one-line
   descriptions, plus the §6 acceptance criteria checklist with each item
   marked ✓ or ✗.

If you hit any acceptance criterion you can't satisfy, stop and report
which one and why — don't ship it half-done.


 -->