---
name: "feature"
description: "Full implementation pipeline: /read → speckit-specify → plan.md → speckit-tasks → speckit-implement → /audit → registry update. Pass src-design file path(s) as args."
user-invocable: true
---

# Feature Implementation Pipeline

Merged flow: our design understanding feeds speckit's structured execution engine.

/ctx → /read (understand design) → speckit-specify (business spec) →
write plan.md (architecture-aware) → speckit-tasks (task list) →
speckit-implement (execute) → /audit → update registry + log

## Args
$ARGUMENTS = src-design file path(s), space-separated.

Example:
  /feature src-design/components/tabs/OverviewTab.tsx
  /feature src-design/pages/Submissions.tsx

---

## Stage 0: Context gate
If /ctx has not been run this session: run it silently now, then continue.

---

## Stage 1: Deep understand — run /read
Run /read on every provided src-design file path.
Read everything: layout, component tree, parent context, routing check,
text/icons/labels, mock data types, tokens, behavior, data constants.
Do NOT skip any /read step.

Print the full /read output.

### Data-source classification (run as part of Stage 1)
For every data shape or data constant found in src-design, classify it:

| Class | Condition | Action |
|---|---|---|
| REUSE | RTK Query hook already fetches this (check registry/services) | Import existing hook in container — no new endpoint |
| EXTEND | Right api file exists but lacks this endpoint | Add one queryFn to existing `<domain>Api.ts` |
| NEW | No service file for this domain | Create `services/<domain>/<domain>Api.ts` |

Print the classification table.

---

## Stage 2: Phase split
Complex screens need phases. Split before writing any spec.

| Phase label | Contents |
|---|---|
| Ph-1 Foundation | Shared types, mock files, API endpoints, route registration |
| Ph-2 Shell | Page scaffold, header, breadcrumb, tab nav (no tab content yet) |
| Ph-3+ Tab or Section | One tab/section component + its container per phase |
| Final Polish | Error boundaries, empty states, cross-cutting fixes |

Rules:
- Never mix types/mocks/API with UI in the same phase.
- One tab = one phase. Never two tabs in one phase.
- Simple screen (≤ 5 total tasks) → one phase only.

Print:
  PHASE PLAN
  Ph-1 Foundation  — [N tasks]
  Ph-2 Shell       — [N tasks]
  Ph-3 Overview    — [N tasks]
  ...

──────────────────────────────────────────────────────
PAUSE: "Phase plan ready. [N] phases. Which phase to start? (default: Ph-1)"
Wait for phase selection.
──────────────────────────────────────────────────────

---

## Stage 3: speckit-specify — generate business spec

From the /read analysis and selected phase, generate a natural language
feature description and invoke speckit-specify.

### Build the feature description
Construct a clear, user-facing description covering:
- What screen/feature this is
- What the user can do on it
- Key data displayed
- Key interactions (clicks, filters, navigation)
- Phase scope (e.g. "Foundation only — types, API, routing; no UI yet")

### Invoke
Run: /speckit-specify "[constructed feature description]"

This creates `specs/<NNN>-<feature-name>/spec.md`.
Note the SPECIFY_FEATURE_DIRECTORY from speckit's output.

---

## Stage 4: Write architecture-aware plan.md

DO NOT run /speckit-plan — it produces generic architecture, not ours.
Instead write plan.md directly into SPECIFY_FEATURE_DIRECTORY.

### plan.md must contain all of the following sections:

#### Tech Stack
React 18, TypeScript (strict), Vite, Tailwind CSS,
Redux Toolkit + RTK Query, React Router v6.
No Shadcn/Radix imports in src/. Use src/components/common/ equivalents.

#### Architecture Rules (non-negotiable — treat as hard constraints)
- Import boundaries from CLAUDE.md are enforced. No cross-layer imports.
- Filter/tab/sort/pagination state → URL search params (useSearchParams) only.
- Every container on a multi-panel page → <ErrorBoundary>.
- RTK Query for all server data. No server data in Redux slices.
- All imports use @/ aliases. No ../../../.
- Every new export → nearest index.ts barrel.
- No hardcoded hex or px — tokens and Tailwind classes only.
- No data constants inside domain components — mock data lives in services/<domain>/mocks/.

#### Folder Structure (exact paths for this feature)
Derive from /read parent context detection and /ctx folder ownership rules.
List every new file with its exact src/ path.

Example for OverviewTab:
  src/shared/types/submissionDetail.ts
  src/services/submissions/mocks/submissionDetailMock.ts
  src/services/submissions/submissionsApi.ts  (extend existing)
  src/features/submissions/components/tabs/OverviewTab.tsx
  src/containers/submissions/SubmissionDetailContainer.tsx
  src/features/submissions/pages/SubmissionDetailPage.tsx
  src/app/routes.tsx  (add /submissions/:id route)
  src/features/submissions/index.ts  (barrel update)

#### Component Reuse
List every component from registry.md being reused.
Format: `ComponentName from src/path` — what it provides.

#### Data Sources
Paste the classification table from Stage 1.

#### Routing Changes
List any routes to add/modify with path, component, parent route.

#### Implementation Order
List phases (Ph-1, Ph-2…) with their tasks in dependency order.
Each task: exact file path + one-line description.

#### Anti-patterns (auto-reject during implementation)
- Shadcn/Radix imports in src/
- useAppSelector/useAppDispatch in components/common or components/domain
- useGetXQuery in presentational components
- fetch( or axios. in containers
- Cross-feature imports (features/A → features/B)
- Data constant arrays/objects inside domain components
- Splitting a single boolean state into two separate JSX branches (`{flag ? <A/> : <B/>}` where A and B duplicate structure) — use ONE render path with conditional styles/content (`{!flag && <label/>}` inside a single container)
- Toggling interactive elements (collapse, tabs, accordion) that use `hidden lg:flex` or similar responsive classes — the toggle button must be a SINGLE element always in the DOM, with the icon/label switching via the state variable, never unmounted/remounted between states
- `console.log(...)` or `console.warn(...)` anywhere in src/ — debug artifacts must not be committed
- `useEffect` inside components/domain/ or components/common/ — extract to hooks/<group>/ or container
- `style={{ }}` inline blocks — all styles must be Tailwind className; no inline styles in production
- Local `type X = ...` or `interface X` that duplicates a definition in src/shared/types/ — always import from shared
- List-item components (*Row, *Card, *Item, *Chip) not wrapped in `React.memo(...)` — every map-rendered component must be memoized
- `useState` for `isOpen / visible / show / expanded` inside a domain component — move to useDisclosure() called in the container and passed as props

Write plan.md to SPECIFY_FEATURE_DIRECTORY/plan.md.
Print: "plan.md written to [path]"

---

## Stage 5: speckit-tasks — generate task list

Run: /speckit-tasks

speckit-tasks reads spec.md + plan.md from SPECIFY_FEATURE_DIRECTORY
and generates tasks.md with proper checklist format:
  - [ ] T001 [P] [US1] Description — src/path/to/File.tsx

Print: "tasks.md generated at [path]. Review before proceeding."

──────────────────────────────────────────────────────
PAUSE: Show tasks.md contents.
Ask: "Tasks correct? Adjust anything before implementation starts."
Wait for explicit approval.
──────────────────────────────────────────────────────

---

## Stage 6: speckit-implement — execute tasks

Run: /speckit-implement

speckit-implement reads tasks.md + plan.md from SPECIFY_FEATURE_DIRECTORY.
Because plan.md contains our architecture rules and exact file paths,
it will implement following our conventions.

During execution, additionally enforce:
- Text/labels/headings must match src-design exactly — no paraphrasing.
- Icons must use the Lucide icon name identified in /read Step 7.
- REUSE class data → import existing hook; no new endpoint written.
- EXTEND class data → add only the new endpoint; do not restructure the file.
- NEW class data → create full api file following existing pattern in services/.
- queryFn always imports from the mock file — never inlines data.
- Mock files export: `export const MOCK_<NAME>: Type[] = [...]`

Pre-existing section audit (before closing Stage 6):
For every SectionCard/SectionPanel in both design and current src:
1. title string matches design exactly (character-for-character).
2. Visual style / accent / variant props match.
3. Child content (fields, labels, order) matches.

Interactive behavior audit (before closing Stage 6):
For every toggle/collapse/expand/tab in the implemented component:
1. The controlling state variable is a single boolean or string — not two separate states.
2. The toggle trigger is ONE element always in the DOM — icon/label switch via ternary, never two elements in separate branches.
3. Every piece of text or UI that should show/hide on state change uses `{!flag && ...}` or `{flag && ...}` inline — never inside a `{flag ? <BigBranch/> : <OtherBigBranch/>}` split.
4. Verify that clicking the toggle in BOTH directions (e.g. collapse AND expand) produces the correct visual result.

---

## Stage 7: /audit
Run /audit on all files written.
On any FAIL: fix immediately without asking.

---

## Stage 8: Update registry and session log

**Update `.claude/context/registry.md`**
Add one row per new file to the correct section.
Columns: Component | File | Props | Phase | Page

**Append to `.claude/context/session-log.md`**
Insert above `<!-- session-log-end -->`:

```
## [today's date] — [feature name] Ph-[N] ([Product area] page)
**Design source:** src-design/[file(s)]
**Spec:** [SPECIFY_FEATURE_DIRECTORY]/spec.md
**Tasks:** [SPECIFY_FEATURE_DIRECTORY]/tasks.md

### Files created
| File | Task | Notes |
|------|------|-------|

### Files modified
| File | Task | Change |
|------|------|--------|

### Data sources
| Data | Class | Hook / Endpoint |
|------|-------|-----------------|

---
```

---

## Stage 9: Phase summary

| Task | File | Status | Notes |
|------|------|--------|-------|

"Ph-[N] complete. Spec at [path]. Tasks marked complete in tasks.md.
Registry and session log updated.
Run `npm run type-check` and `npm run lint` — report failures.
Next: Ph-[N+1] — say 'next phase' to continue or run /speckit-implement to resume."

Deviations (if any): [list assumptions made]
