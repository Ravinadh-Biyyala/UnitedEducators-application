# Spec: Dashboard Phase 6 — Open Tasks Panel

## §1 Goal

Ship the **Open Tasks panel** on the Dashboard: a 380px-wide card showing
the underwriter's pending tasks, with filter tabs (All / Mine / Overdue),
priority-coded rows, overdue rows visually distinguished (amber bg + red
date), and a footer with total count + "View all" link.

The panel is the second data-driven panel after Submissions (Phase 4) and
introduces three reusable atoms — `CardShell`, `SegmentedTabs`, and
`CountBadge` — that subsequent panels (Phase 5 Pipeline, Phase 7 Recent
Activity, Phase 8 Portfolio) will compose. After this phase, those later
phases become roughly half the work because they don't re-build chrome.

The component is **fully presentational and dumb**:
- It receives an already-filtered `tasks` array
- It receives `totalCount` and `overdueCount` separately
- It does not compute `isOverdue` (the API/container does)
- It does not apply filters (the container does)
- It does not do date math
- Filter state lives in the container; component receives `activeFilter` +
  `onFilterChange` callback

---

## §2 Design source (no MCP)

Figma MCP is not used. All design values come from `src/theme/tokens.ts`.

**New tokens this phase adds** (apply the patch in `tokens.ts` first):

- `cardDims` — shared card shell dimensions (header 49px, footer 36px,
  padding 12px/20px, etc.). Used by every dashboard panel from now on.
- `taskRowVariants` — `{ normal, overdue }` map keyed by row variant.
  Component looks up `taskRowVariants[task.isOverdue ? 'overdue' : 'normal']`.

**Existing tokens this phase reuses:**

- `colors.*` — surfaces, borders, text, brand, danger
- `priorityStyles[priority]` — Critical/High/Medium/Low chips (already
  defined in Phase 4)
- `fonts.sans`, `fonts.mono` (mono only on submission IDs)

**No raw `rgb(...)` or hex strings in component files.**

Reference dimensions from Figma JSON:
- Card outer: 380 × 469
- Header: 378 × 49, padding 12 20
- Task row: 378 × 63, padding 12 20 1 22, internal column gap 4px
- Footer: 378 × 36, padding 10 20

---

## §3 Scope — files this spec creates or modifies

| Path | Action | Purpose |
|---|---|---|
| `src/theme/tokens.ts` | modify | Add `cardDims`, `taskRowVariants`, export `TaskRowVariant` type |
| `src/shared/types/task.ts` | create | `Task`, `TaskPriority`, `TaskFilter` types |
| `src/services/tasks/tasksApi.ts` | create | RTK Query `tasksApi` with `getTasks` endpoint, mock data inline with TODO. **API computes `isOverdue` per task** before returning. |
| `src/components/common/SegmentedTabs/SegmentedTabs.tsx` | create | Generic 2–4 button segmented control. Reusable across Tasks (All/Mine/Overdue), Submissions (Mine/Team/All), Activity (All/Alerts/Updates). |
| `src/components/common/SegmentedTabs/index.ts` | create | barrel |
| `src/components/domain/CountBadge/CountBadge.tsx` | create | Generic round red count pill. Used in Overdue tab and (future) topbar bell. Hides itself when `count === 0`. |
| `src/components/domain/CountBadge/index.ts` | create | barrel |
| `src/components/domain/CardShell/CardShell.tsx` | create | `<CardShell title icon headerRight footer>{children}</CardShell>` — wraps every dashboard panel with header bar + body + footer. **Reusable for all 5 panels.** |
| `src/components/domain/CardShell/index.ts` | create | barrel |
| `src/components/domain/TaskRow/TaskRow.tsx` | create | Single row, takes `task: Task`, looks up `taskRowVariants[task.isOverdue ? 'overdue' : 'normal']` |
| `src/components/domain/TaskRow/index.ts` | create | barrel |
| `src/components/domain/OpenTasksPanel/OpenTasksPanel.tsx` | create | Composes CardShell + SegmentedTabs + TaskRow[]. Pure presentational. |
| `src/components/domain/OpenTasksPanel/index.ts` | create | barrel |
| `src/containers/dashboard/OpenTasksPanelContainer.tsx` | create | Calls `useGetTasksQuery`, holds local filter state, passes filtered tasks + counts to component |
| `src/features/dashboard/pages/DashboardPage.tsx` | modify | Mount `<OpenTasksPanelContainer />` in the right column |
| `src/app/store.ts` | modify | Register `tasksApi.reducerPath` + middleware |

After implementation: run `npm run index` to refresh `INDEX.md`.

**File count: 13 new + 3 modified = 16.** This is over the 5–10 rule of
thumb, BUT 6 of the new files are reusable atoms (CardShell,
SegmentedTabs, CountBadge × 2 for the .tsx + index.ts each) that pay back
in Phases 5 and 7. If you want to split, do CardShell + SegmentedTabs +
CountBadge as a separate "Phase 6a — shared card primitives" spec first,
then this becomes a 7-file phase. Recommended: ship as one phase since
the atoms have no value without a consumer.

---

## §4 Data + behavior

### Task type (`src/shared/types/task.ts`)

```ts
import type { SubmissionPriority } from '@/theme/tokens';

export type TaskPriority = SubmissionPriority; // same 4 values
export type TaskFilter = 'All' | 'Mine' | 'Overdue';

export interface Task {
  id: string;            // e.g. 'TSK-1042'
  title: string;         // e.g. 'Obtain open claims detail from broker'
  submissionId: string;  // e.g. 'SUB-7829'
  dueDate: string;       // pre-formatted by API, e.g. 'Apr 20, 2024'
  priority: TaskPriority;
  isOverdue: boolean;    // computed by API/container, NEVER by component
  isMine: boolean;       // computed by API based on current user
}
```

### API endpoint (`src/services/tasks/tasksApi.ts`)

```ts
export const tasksApi = createApi({
  reducerPath: 'tasksApi',
  baseQuery: baseQuery,
  tagTypes: ['Task'],
  endpoints: (builder) => ({
    getTasks: builder.query<Task[], void>({
      // TODO: replace with real endpoint /api/tasks
      // Real endpoint must compute isOverdue server-side based on
      // current date and task.dueDate. Mock does it inline.
      queryFn: async () => ({ data: MOCK_TASKS }),
      providesTags: ['Task'],
    }),
  }),
});

export const { useGetTasksQuery } = tasksApi;
```

`MOCK_TASKS` is a `Task[]` constant in this file (8 rows covering all 4
priorities + overdue/non-overdue mix). Mock data is the **only** place
rows are hardcoded; the component must work with any array.

### Container (`src/containers/dashboard/OpenTasksPanelContainer.tsx`)

```tsx
export function OpenTasksPanelContainer() {
  const { data: tasks = [] } = useGetTasksQuery();
  const [activeFilter, setActiveFilter] = useState<TaskFilter>('All');

  const filteredTasks = useMemo(() => {
    switch (activeFilter) {
      case 'Mine':    return tasks.filter(t => t.isMine);
      case 'Overdue': return tasks.filter(t => t.isOverdue);
      case 'All':     return tasks;
    }
  }, [tasks, activeFilter]);

  const overdueCount = useMemo(
    () => tasks.filter(t => t.isOverdue).length,
    [tasks],
  );

  return (
    <OpenTasksPanel
      tasks={filteredTasks}
      totalCount={tasks.length}
      overdueCount={overdueCount}
      activeFilter={activeFilter}
      onFilterChange={setActiveFilter}
    />
  );
}
```

Container is < 30 lines. Component does no filtering, no state.

### Component contracts

#### `<SegmentedTabs>` (common, generic)

```tsx
interface SegmentedTabsProps<T extends string> {
  tabs: ReadonlyArray<{
    value: T;
    label: string;
    rightSlot?: ReactNode; // for badges, icons
  }>;
  activeValue: T;
  onChange: (value: T) => void;
  size?: 'sm' | 'md'; // sm = 24px tall (Tasks), md = 31px tall (Submissions)
}
```

- Renders horizontal row of buttons, gap 4px
- Active button: bg `colors.brandBlue`, white text, `colors.brandBlue` border
- Inactive button: white bg, `colors.textMuted` text, 1px `colors.borderStrong` border
- Padding 1px on all buttons
- 10px/700 text (sm) or 12px/600 text (md)
- `rightSlot` renders inside button after label with 4px gap (used by
  Tasks "Overdue" tab to show count badge)
- Generic over `T extends string` so consumer keeps tab union type safety

#### `<CountBadge>` (domain)

```tsx
interface CountBadgeProps {
  count: number;
  hideWhenZero?: boolean; // default true
}
```

- Renders red pill: bg `colors.dangerRed`, white text 9px/700
- Padding 0 4px, height 12px, border-radius 10px (the only rounded thing
  on the card)
- Returns `null` when `count === 0 && hideWhenZero !== false`

#### `<CardShell>` (domain)

```tsx
interface CardShellProps {
  title: string;          // "OPEN TASKS"
  icon: ReactNode;        // <CheckCircle2 size={13} color={colors.brandBlue} />
  width: number;          // 380
  headerRight?: ReactNode;// SegmentedTabs, action buttons, etc.
  footer?: ReactNode;     // <CardFooter left={...} right={...} />
  children: ReactNode;    // body content
}
```

- White bg, 1px `colors.borderStrong` border, padding from `cardDims.innerPadding`
- Header bar: bg `colors.bgMuted`, bottom border `colors.borderDefault`,
  height `cardDims.headerHeight`, padding from `cardDims.headerPadding`
- Title text: 12px/700 `colors.brandBlue` UPPERCASE, 8px gap after icon
- Body: flex column, gap 0, no padding (rows handle their own)
- Footer: bg `colors.bgMuted`, top border `colors.borderDefault`,
  height `cardDims.footerHeight`, padding from `cardDims.footerPadding`
- **No border-radius anywhere**

A separate small `CardFooter` helper is fine (or inline in this spec).
Suggestion: ship a `<CardFooter left right>` sub-component in the same
file since it's used identically by every panel.

#### `<TaskRow>` (domain)

```tsx
interface TaskRowProps {
  task: Task;
  onClick?: (task: Task) => void;
}
```

- Looks up `const variant = taskRowVariants[task.isOverdue ? 'overdue' : 'normal']`
- Outer: row 63px tall, padding 12 20 1 22, bg `variant.bg`,
  1px `variant.borderColor` border, flex column gap 4px
- Top sub-row (justify-between):
  - Left: `task.title` 12px/600, color `variant.titleColor`
  - Right: `<PriorityChip priority={task.priority} />`
- Bottom sub-row (justify-between):
  - Left: SUB id pill — bg `colors.infoBlueBg`, padding 1px 6px,
    text `task.submissionId` 10px/700 `colors.brandBlueDeep`, font `fonts.mono`
  - Right: due-date meta — icon + 4px gap + text
    - If `task.isOverdue`: `AlertCircle` 10px `colors.dangerRed` + date 10px/**700** `colors.dangerRed`
    - Else: `Clock` 10px `colors.textMuted` + date 10px/400 `colors.textMuted`
- Click on row fires `onClick(task)` if provided. No hover effect needed
  this phase (later polish).

#### `<OpenTasksPanel>` (domain — the main component)

```tsx
interface OpenTasksPanelProps {
  tasks: Task[];                // already filtered by container
  totalCount: number;           // count of ALL tasks, unfiltered
  overdueCount: number;         // count of overdue tasks (drives Overdue badge)
  activeFilter: TaskFilter;
  onFilterChange: (f: TaskFilter) => void;
  onTaskClick?: (task: Task) => void;
  onViewAll?: () => void;
}
```

**Rules:**
1. Renders exactly `tasks.length` `<TaskRow>` instances, in order.
2. No filtering, sorting, slicing inside the component.
3. If `tasks.length === 0`, render a single empty-state row spanning the
   body: text "No tasks to show." 11px/400 `colors.textMuted`, padding 20px.
4. Footer left text: `${totalCount} total tasks` (the unfiltered count).
5. Footer right: "View all →" button, calls `onViewAll` if provided.
6. Filter tabs use `<SegmentedTabs size="sm">` with three tabs:
   - `{ value: 'All', label: 'All' }`
   - `{ value: 'Mine', label: 'Mine' }`
   - `{ value: 'Overdue', label: 'Overdue', rightSlot: <CountBadge count={overdueCount} /> }`

---

## §5 Reuse from `INDEX.md`

Existing items to use, do **not** recreate:

- `components/domain/PriorityChip` (Phase 4) — TaskRow imports this
- `components/layout/AppShell`, `PageHeader` — already in place
- `services/baseQuery.ts` — RTK Query base config
- `theme/tokens.ts` — extend (add `cardDims`, `taskRowVariants`); don't fork
- `app/store.ts` — extend, don't recreate; add `tasksApi` reducer + middleware
- `shared/utils/formatCurrency.ts` (Phase 4) — leave alone, not used here

If `INDEX.md` shows `OpenTasksPanel`, `TaskRow`, `CardShell`,
`SegmentedTabs`, or `CountBadge` already exist, **stop and report**
rather than overwriting.

`SegmentedTabs` deliberately replaces the inline scope tabs in Phase 4's
SubmissionsTable — DO NOT refactor SubmissionsTable in this phase. That's
a separate cleanup pass after both phases ship and the abstraction is
proven. Premature shared-component refactors are a known regression
source per HANDOFF.md §8 ("Promote eagerly, not preemptively").

---

## §6 Acceptance criteria

### Visual

1. Card outer is exactly 380px wide.
2. Header bar shows `CheckCircle2` icon + "OPEN TASKS" 12px/700 brand blue.
3. SegmentedTabs row shows 3 buttons: All (active by default), Mine, Overdue.
4. Overdue tab shows a red round badge with `overdueCount` when > 0; hidden when 0.
5. Each task row uses correct variant colors:
   - Normal rows: white bg, default border, dark heading-color title
   - Overdue rows: amber bg `rgb(255, 253, 244)`, amber border `rgb(180, 83, 9)`, amber title `rgb(138, 92, 0)`
6. Each row's priority chip uses the correct `priorityStyles[priority]` colors.
7. Each row's due date treatment:
   - Non-overdue: gray Clock icon + gray 400-weight date
   - Overdue: red AlertCircle icon + red 700-weight date
8. Each row's SUB-id pill is in mono font (`fonts.mono`), blue-deep text, info-blue bg.
9. Footer text shows `${totalCount} total tasks` — uses unfiltered total, not filtered length.
10. No border-radius anywhere except the round count badge.

### Code quality

11. `npm run lint` passes — no boundary violations.
12. `npm run type-check` passes — strict mode, no `any`.
13. **No raw `rgb(...)` or hex strings in component files.** All colors via tokens.
14. `OpenTasksPanel.tsx`, `TaskRow.tsx`, `CardShell.tsx`, `SegmentedTabs.tsx`,
    `CountBadge.tsx` contain zero RTK Query hooks, zero `useAppSelector`,
    zero `useAppDispatch`, zero `fetch`/`axios`, zero date math.
15. `TaskRow` does NOT compute `isOverdue` — it reads `task.isOverdue` and
    looks up the variant.
16. Container is < 30 lines and only does: hook call, filter state,
    derived counts via `useMemo`, prop forwarding.
17. `Task` type is in `shared/types/`, imports `SubmissionPriority` from
    `theme/tokens` (priorities are shared concept; not duplicated).
18. `SegmentedTabs` is generic over `T extends string` — TypeScript
    catches a typo like `setActiveFilter('Overdu')`.

### Behavior

19. Pass `tasks={[]}` → empty-state row renders, footer total reflects `totalCount`.
20. Click "Mine" tab → container filters, component re-renders with
    `tasks.filter(t => t.isMine)`. Footer total UNCHANGED (still `totalCount`).
21. Click "Overdue" tab → component shows only overdue tasks. Overdue
    badge count UNCHANGED.
22. Reorder the input `tasks` array → DOM order changes to match.
23. Click a row → `onTaskClick(task)` fires with that task's data, if provided.
24. With 0 overdue tasks → Overdue tab still renders but badge is hidden.

---

## §7 Out of scope

- ❌ Real backend wiring (mock data; mark with TODO)
- ❌ Refactoring Phase 4 SubmissionsTable to use `SegmentedTabs` — separate cleanup pass
- ❌ Task detail drawer / modal on row click
- ❌ Task creation / editing / deletion
- ❌ Drag-and-drop reordering, multi-select
- ❌ Real-time updates (WebSocket subscriptions)
- ❌ Date math anywhere in components — all computed by API/container
- ❌ Hover states beyond default cursor (later polish)
- ❌ Loading skeletons / error states (separate polish phase)
- ❌ Mobile breakpoints below 768px
- ❌ Unit tests
- ❌ Accessibility audit beyond basic semantic HTML
- ❌ The other 4 dashboard panels (Pipeline Phase 5, Activity Phase 7,
  Portfolio/Team Phase 8, KPI refinement Phase 3) — separate specs
- ❌ MCP / Figma tooling





<!-- 

# Implementation Prompt — Phase 6 Open Tasks Panel

> Paste this into Claude in VS Code, after pasting `HANDOFF.md`,
> `CLAUDE.md`, the freshly regenerated `INDEX.md`, `TRACKER.md`,
> and `specs/dashboard-phase-6-open-tasks.md`.

---

Read these files only, in this order:

1. `INDEX.md`
2. `TRACKER.md`
3. `specs/dashboard-phase-6-open-tasks.md`
4. `CLAUDE.md` (workflow section)
5. `src/theme/tokens.ts` (existing — you will patch it per spec §3)

Then implement `specs/dashboard-phase-6-open-tasks.md` per `CLAUDE.md`
workflow.

## Hard rules for this phase

- **This project does NOT use Figma MCP.** Do not call `get_figma_data` or
  `download_figma_images`. Do not request a Figma URL or node ID. All
  design values live in `src/theme/tokens.ts`. The spec adds two new
  tokens (`cardDims`, `taskRowVariants`) — apply them to `tokens.ts` as
  step 1 before touching any component.

- **Do NOT browse `src/` to "see what exists".** `INDEX.md` is the source
  of truth. If `INDEX.md` is stale (does not reflect Phase 4 components
  like `PriorityChip`, `SubmissionsTable`), stop and tell me to run
  `npm run index`.

- **Do NOT hardcode tasks inside `OpenTasksPanel.tsx` or `TaskRow.tsx`.**
  The component takes `tasks: Task[]` as a prop and renders exactly that
  array, in given order. Mock data lives ONLY in
  `services/tasks/tasksApi.ts`. The component must work for any tasks
  array — empty, one row, or 500 rows.

- **The component is fully dumb.** It does NOT:
  - filter (container does)
  - sort (container does)
  - compute `isOverdue` (API/container does — Q1 answer was b)
  - hold filter state (container does — Q2 answer: container-level filter)
  - do date math, ever
  - call any RTK Query hook, `useAppSelector`, `useAppDispatch`,
    `fetch`, or `axios`

- **No raw colors in components.** Every color, font size, weight, and
  dimension comes from `tokens.ts`. ESLint rejects hex codes; don't trip it.

- **Three-layer flow is mandatory.** Container does data fetching +
  filter state + derived counts. Component renders props. Type lives in
  `shared/types/`.

- **Reuse, don't recreate.** `PriorityChip` already exists from Phase 4 —
  import it, don't rebuild it. If `INDEX.md` shows ANY of `OpenTasksPanel`,
  `TaskRow`, `CardShell`, `SegmentedTabs`, or `CountBadge` already exist,
  STOP and report — don't overwrite.

- **Do NOT refactor `SubmissionsTable` to use the new `SegmentedTabs`
  in this phase.** Spec §7 explicitly forbids it. That's a separate
  cleanup pass after both Phase 4 and Phase 6 are stable.

## Implementation order (suggested)

1. **`src/theme/tokens.ts`** — patch in `cardDims` + `taskRowVariants`
   + `TaskRowVariant` type export (per spec §2 + §3)
2. `src/shared/types/task.ts` — `Task`, `TaskPriority`, `TaskFilter`
3. `src/services/tasks/tasksApi.ts` — RTK Query + 8 mock tasks (mix of
   priorities, mix of overdue/non-overdue, mix of `isMine` true/false)
4. `src/app/store.ts` — register `tasksApi.reducerPath` + middleware
5. `src/components/common/SegmentedTabs/` — generic, type-parameterized,
   used by Tasks now and Activity (Phase 7) later
6. `src/components/domain/CountBadge/` — round red pill, hides at 0
7. `src/components/domain/CardShell/` — header + body + footer wrapper
   (include a small `CardFooter` helper inside the same file or as a
   sub-export — your call, but keep the file count tight)
8. `src/components/domain/TaskRow/` — single row, takes `task: Task`
9. `src/components/domain/OpenTasksPanel/` — composes #5–#8 above
10. `src/containers/dashboard/OpenTasksPanelContainer.tsx` —
    `useGetTasksQuery` + filter state + derived counts via `useMemo`
11. `src/features/dashboard/pages/DashboardPage.tsx` — mount container
    in the right column

## When done

Per `CLAUDE.md` Workflow Step 5:

1. Run `npm run index` to regenerate `INDEX.md`.
2. Update `TRACKER.md`: mark Dashboard Phase 6 as `implemented` with
   today's date.
3. Run `npm run lint` and `npm run type-check` and confirm both pass.
4. Return a summary listing every file created/modified with one-line
   descriptions, plus the §6 acceptance criteria checklist with each
   item marked ✓ or ✗.

If you hit any acceptance criterion you can't satisfy, stop and report
which one and why — don't ship it half-done. -->