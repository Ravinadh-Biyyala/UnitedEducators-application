---
name: "ctx"
description: "Load full project context — registry, architecture rules, token map, Shadcn substitution map. Run once per session before any /feature or /read call."
user-invocable: true
---

You are a senior frontend engineer who built this codebase from scratch.
You know every file, every pattern, every rule. Execute this loading routine
silently — do not narrate it, just absorb and confirm at the end.

## Load 1: Architecture rules
Read `CLAUDE.md` fully. Every rule is a hard constraint — treat violations
as broken builds, not style preferences.

Key rules to internalize:
- Import boundaries table is strict. No cross-layer imports.
- Filter/tab/sort/pagination state → URL search params only, never useState/Redux.
- Every container on a multi-panel page → wrapped in <ErrorBoundary>.
- RTK Query for all server data. No server data in Redux slices.
- All imports use @/ aliases. Never ../../../.
- Every new export goes through its layer's index.ts barrel.

## Component behaviour rules (derived from audit — prevent recurring violations)

### No console.log in production code
❌ `console.log(...)`, `console.warn(...)` in any component or container.
Only `console.error` is allowed, exclusively inside `ErrorBoundary.componentDidCatch`.
Every other debug log must be removed before a file is considered complete.

### No useEffect in domain or common components
`components/domain/` and `components/common/` are presentational — they receive props
and return JSX. Effects indicate coordination logic (subscriptions, derived async state,
outside-click handlers) that belongs in a container or a dedicated custom hook.
❌ `useEffect` in `components/domain/*` or `components/common/*`
✅ Extract the effect into `hooks/<group>/use<X>.ts` or into the container.

### No dropdown / toggle state in domain components
`useState` for `isOpen`, `open`, `visible`, `show`, `expanded` inside a domain
component means the component owns UI coordination it should not own.
❌ `const [filterOpen, setFilterOpen] = useState(false)` in a domain component
✅ Move to `useDisclosure()` called in the container, passed as props.

### No local type redefinition
If a type already exists in `src/shared/types/`, never redefine it locally in a slice,
container, or component. Import from shared instead.
❌ `type SubmissionScope = 'mine' | 'group'` inside a slice file
✅ `import type { SubmissionScope } from '@/shared/types/submission'`
If a local definition diverges from the shared one → the shared type is wrong; fix it
there and update all usages. Never let two definitions of the same concept coexist.

### No duplicate state sources
If a Redux slice owns a piece of state, do not also write a localStorage hook for
the same value. One source of truth only.
❌ `uiSlice.sidebarCollapsed` in Redux AND `useSidebarCollapsed` reading localStorage
✅ Use the Redux slice exclusively; let redux-persist handle storage.

### List-item components must be memoized
Any component rendered inside a `.map()` loop — `*Row`, `*Card`, `*Item`, `*Chip` —
must be wrapped in `React.memo`. Without it, every parent re-render re-renders the
entire list even when row data hasn't changed.
✅ `export const TaskRow = React.memo(function TaskRow(...) { ... })`

### Feature-only components stay in the feature folder
If a component is used exclusively within one feature (e.g. form sections for the
new submission flow), it belongs in `features/<f>/components/`, not `components/domain/`.
Only promote to `components/domain/` when used in 2+ features.
❌ `components/domain/NewSubmissionHeader/` — used only in submissions-new
✅ `features/submissions/components/NewSubmissionHeader.tsx`

## CSS unit conversion rule (non-negotiable)
src-design px values are REFERENCE only — they communicate design intent, not production values.
Never copy raw px into src/. Convert every value:

| src-design value | Production equivalent |
|---|---|
| Fixed px width on layout containers | %, vw, or Tailwind fractional (w-1/3, w-full) |
| Fixed px sidebar/panel width (e.g. 360px) | max-w-[360px] w-full — compresses on smaller screens |
| Font size in px (e.g. 14px) | Tailwind type scale (text-sm, text-base, text-lg) |
| Padding / margin in px | Tailwind spacing scale (p-4, p-6, gap-4) |
| Min/max height in px | min-h-[Xrem] or min-h-screen |
| Gap in px | Tailwind gap scale (gap-4, gap-6) |
| Border radius in px | Tailwind rounded scale |
| Hardcoded hex color | Token → Tailwind class. Never copy hex. |
| inline style={{ }} blocks | Rewrite as Tailwind classes. No inline styles in production. |

App is desktop-first (≥1024px). Use lg: as base breakpoint, xl: for large desktop.
Never target below lg:.

Auto-reject:
❌ style={{ width: '360px' }}                          → w-[360px] max-w-full
❌ style={{ fontSize: 14 }}                            → text-sm
❌ style={{ padding: '16px 24px' }}                    → py-4 px-6
❌ style={{ display: 'grid', gridTemplateColumns: '1fr 360px' }}
   → className="grid grid-cols-1 xl:grid-cols-[1fr_360px]"

## Load 2: Folder ownership rules (non-negotiable)
A "feature" = a top-level product area (submissions, dashboard, login, portfolio…).
ALL screens, subpages, detail views, and tab components within the same product
area live INSIDE that one feature folder. Never create a sibling feature folder
for a sub-screen.

### Correct folder structure
src/features/submissions/
  pages/
    SubmissionsPage.tsx          ← /submissions (list)
    SubmissionDetailPage.tsx     ← /submissions/:id (detail)
    NewSubmissionPage.tsx        ← /submissions/new (new form)
  components/
    tabs/                        ← tab panels used only in detail view
      OverviewTab.tsx
      DocumentsTab.tsx
      ...
  index.ts

### Hard rejections
❌ features/submissions-detail/   → merge into features/submissions/
❌ features/submissions-new/      → merge into features/submissions/
❌ features/submission-tabs/      → merge into features/submissions/components/tabs/

### Component promotion rule
Used in 1 feature only        → features/<f>/components/
Used in 2+ features           → components/domain/
Generic, no business meaning  → components/common/

### Route nesting rule
Sub-screens are nested routes. Register them as children of the parent route,
not as separate top-level routes:
  /submissions           → SubmissionsPage
  /submissions/new       → NewSubmissionPage      (child of /submissions)
  /submissions/:id       → SubmissionDetailPage   (child of /submissions)
  /submissions/:id/quote → SubmissionQuotePage    (child of /submissions/:id)

## Load 3: Component registry (primary inventory source)
Read `.claude/context/registry.md` fully.
This is your component inventory. Use it for all reuse decisions.
Do NOT scan src/ folders — the registry is the source of truth.
If you write new files this session, you will add them to this registry at the end.

## Load 4: Session log (recent history)
Read `.claude/context/session-log.md`.
This tells you what was built in recent sessions and for which page.
Use it to understand what already exists before proposing new files.

## Load 5: Design token map
Read `src/theme/tokens.ts` and `src/theme/index.ts`.
Read `src-design/styles/theme.css` and `src-design/styles/index.css`.

Build an internal mapping:
  src-design CSS variable → resolved hex → src/theme token name → Tailwind class

FLAG any unmapped value as ⚠ TOKEN-GAP — never invent a token.

## Load 6: Shadcn → common/ substitution map
src-design uses Shadcn/Radix UI. src/ uses custom common/ primitives.

| src-design (Shadcn) | src/ equivalent |
|---|---|
| components/ui/button | components/common/Button |
| components/ui/input | components/common/Input |
| components/ui/select | components/common/Select |
| components/ui/dialog | components/common/Modal |
| components/ui/tabs | components/common/Tabs |
| components/ui/table | components/common/Table |
| components/ui/badge | components/domain/StatusBadge or components/common/Badge |
| components/ui/card | components/common/ or domain/ (context-dependent) |
| components/ui/drawer | components/common/Drawer |
| components/ui/skeleton | components/common/Skeleton |
| components/ui/avatar | components/common/Avatar |
| components/ui/tooltip | components/common/Tooltip |
| components/ui/dropdown-menu | components/common/DropdownMenu |
| components/ui/popover | components/common/Popover |
| components/ui/checkbox | components/common/Checkbox |
| components/ui/separator | components/common/Separator |

If a Shadcn component has no src/ equivalent → flag as NEW-COMMON.

## Confirm
After all loads, respond with exactly:
"Ready. Registry loaded ([N] components, [N] hooks, [N] services, [N] containers). Last session: [date and phase from session-log]."
Then wait.
