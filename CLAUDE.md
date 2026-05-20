# Project Architecture

React 18 + TS strict, Vite, Tailwind, Redux Toolkit + RTK Query, React Router v6.
UI component library: TBD — keep `components/common/` library-agnostic.

## Folders

```
src/
├── app/              # App.tsx, providers, routes, store composition
├── components/
│   ├── common/       # Pure UI primitives (Button, Input, Modal, Tabs, Table…)
│   ├── domain/       # Business-aware presentational (StatusBadge, KpiCard, SubmissionsTable…)
│   └── layout/       # AppShell, Sidebar, TopBar, PageHeader
├── containers/<f>/   # Smart components: data + state → presentational
├── features/<f>/     # Pages + feature-only components
│   ├── pages/
│   ├── components/   # Used ONLY inside this feature
│   ├── types.ts
│   └── index.ts      # Public barrel
├── hooks/            # Custom hooks, grouped: auth/, common/, <feature>/
├── services/         # RTK Query APIs, axios client, baseQuery
│   └── <f>/<f>Api.ts
├── store/            # Slices for non-server state
│   └── slices/
├── shared/           # Pure TS — no React, no Redux
│   ├── types/
│   ├── utils/
│   └── constants/
├── theme/            # Design tokens
├── styles/           # global.css
├── config/           # env.ts
└── main.tsx
```

## Import boundaries (enforced by ESLint)

| From | Allowed |
|---|---|
| `shared` | `shared` |
| `theme` | nothing |
| `config` | `shared` |
| `services` | `shared`, `config` |
| `store` | `services`, `shared` |
| `hooks` | `services`, `store`, `shared` |
| `components/common` | `shared`, `theme` |
| `components/domain` | `common`, `shared`, `theme` |
| `components/layout` | `common`, `domain`, `hooks`, `shared`, `theme` |
| `containers` | `components/*`, `hooks`, `services`, `store`, `shared`, `theme` |
| `features` | `containers`, `components/*`, `hooks`, `shared`, `theme` |
| `app` | everything |

**Cross-feature rule:** `features/A` ❌ `features/B`. Promote shared components to `components/domain/`. Data hooks via `services/<f>/` are exempt.

**Barrel rule:** Import features only via `@/features/<f>` (the barrel). Never deep-import.

## Where does X go? (first match wins)

1. Generic UI primitive, no business meaning → `components/common/`
2. Presentational, knows business types, no fetching → `components/domain/`
3. App shell (sidebar/header/nav) → `components/layout/`
4. Fetches data / dispatches / coordinates → `containers/<f>/`
5. Route-level page composing containers → `features/<f>/pages/`
6. Reusable stateful logic, no JSX → `hooks/<group>/`
7. API endpoint definition → `services/<f>/`
8. Global UI/auth state → `store/slices/`
9. Pure utility / type / constant → `shared/`

## Three-layer data flow (canonical)

```
Page (features/) → Container (containers/) → Presentational (components/domain|common)
                        ↓
              services/ (defines)  +  store/ (UI state)
```

- **services/** = *defines* API calls (URL, types, cache tags). No React.
- **containers/** = *invokes* API calls + connects Redux. Pass plain props down.
- **presentational** = *renders*. Props in, events out. No fetching, no Redux.

## Naming

| Thing | Convention | Example |
|---|---|---|
| Component | PascalCase | `SubmissionsTable.tsx` |
| Container | `<X>Container.tsx` | `KpiRowContainer.tsx` |
| Page | `<X>Page.tsx` | `DashboardPage.tsx` |
| Hook | `use<X>.ts` | `useDisclosure.ts` |
| Slice | `<x>Slice.ts` | `dashboardFiltersSlice.ts` |
| API | `<f>Api.ts` | `submissionsApi.ts` |
| Path imports | `@/` aliases only — no `../../../` |

## RTK Query rules

- One `createApi` per domain in `services/<f>/<f>Api.ts`.
- Always type as `query<Result, Args>`.
- Use `tagTypes` + `providesTags`/`invalidatesTags` for cache invalidation.
- Export auto-generated hooks (`useGetXQuery`, `useUpdateXMutation`).
- Register reducer + middleware in `app/store.ts`.

## Component rules

- Default to presentational. Containers only when state/data is needed.
- **Promote, don't duplicate.** First use → `features/<f>/components/`. Second use → `components/domain/`.
- No prop drilling >2 levels — if 3+, the parent should be a container.
- Component file >200 lines or container >150 lines → split.
- Every public export goes through the relevant `index.ts` barrel.

## Auto-reject patterns

- ❌ `fetch(` or `axios.` in a container — extract to `services/`
- ❌ `useGetXQuery` in a presentational component — move to container
- ❌ `useAppSelector` / `useAppDispatch` in `components/common` or `components/domain` — move to container
- ❌ `from '@/features/other/...'` deep import — promote to `components/domain/` or use barrel
- ❌ `../../../` — use `@/` aliases
- ❌ Server data in Redux slices — use RTK Query
- ❌ Business logic in `shared/` — utilities only

## Workflow when adding new code

1. **State the layer first** before writing: *"This is a container because it fetches data."*
2. Reuse `common/` and `domain/` aggressively before creating new components.
3. Wire top-down: types → service → slice (if needed) → container → page → route.
4. Declare shared types in `shared/types/`.
5. Add new exports to the relevant `index.ts` barrel.
6. No new top-level folders without asking.
7. If a request would violate the boundary table, **stop and ask** — don't work around it.



§X. Filter state — URL params, not Redux, not container useState
Rule. Any state that represents "what the user is currently
viewing" — filters, tab selections, sort order, search queries, time
ranges, pagination cursors — lives in URL search params, not in
container useState, not in Redux.
Implementation. Containers read filters via useSearchParams,
write via the same hook with { replace: true }. Default values are
omitted from the URL to keep share links clean. Invalid values fall
back to the default via a runtime type guard — URL params are strings;
trust nothing.
Why.

Refresh keeps your filtered view. No "where was I?" friction.
Share links work. "Send me the Overdue tasks for SUB-7829" is a URL.
Back button works. Browser navigation = filter history.
Cross-panel sync is automatic. Two panels reading the same URL param
stay in sync without prop drilling or a shared store.
No persist/rehydrate complexity. The browser's URL is already
persistent.

Auto-reject. A container importing useState to hold filter,
tab, or query state. A new Redux slice named dashboardFiltersSlice
or similar. Filter state passed through props from a page component
into a container.
Example. OpenTasksPanelContainer reads taskFilter from
useSearchParams, validates with isValidTaskFilter, falls back to
'All' if invalid or absent. Pattern reference for all future
filtered containers.

§X. Cross-panel communication — URL params are the bus
Rule. When one panel needs to influence another (e.g. clicking
"Quoted Pipeline" on Portfolio Snapshot filters the Submissions table
to status=Quoted), the communication channel is URL search params.
Never a shared Redux slice. Never a React Context that spans panels.
Never a callback drilled through DashboardPage.
Implementation. Source panel writes the param via
setSearchParams. Target panel reads via useSearchParams and
incorporates the value into its data fetch (e.g. as an arg to
useGetSubmissionsQuery).
Why.

Panels stay independent. Source doesn't import target. Target doesn't
know source exists.
Shareable. The filtered cross-panel state is a copy-pasteable URL.
Same pattern as single-panel filters. One mental model, not two.
Removing a panel doesn't break callers — the URL param just becomes
unread.

Auto-reject. A panel that imports another panel's slice or
selector. A DashboardContext provider that holds shared filter state.
A useDashboardState() hook that returns coordinated state for
multiple panels.
Example. Click onStatClick('quotedPipeline') on Portfolio →
container does setSearchParams({ status: 'Quoted' }) →
SubmissionsTableContainer reads params.get('status') → passes to
useGetSubmissionsQuery({ status }). Zero coupling between
containers.

§X. Persistence — strict whitelist, never blacklist
Rule. Redux Persist is configured with a whitelist of slice
names that opt in to persistence. Adding a new slice does not persist
it by default. Each addition to the whitelist is a deliberate decision
documented in the persist config.
The whitelist contains:

auth — user profile (NOT raw JWT)
ui — sidebar collapsed, theme, density, language
forms/* — submission edit drafts (added when Phase 10+ ships)

The whitelist NEVER contains:

Any RTK Query API slice (*.reducerPath). RTK Query manages cache
lifecycle via tags + invalidation. Persisting it causes stale data,
double-eviction bugs, and silent breakage when API response shape
changes between deploys.
notifications, toasts, modals — ephemeral by definition.
Filter state — already persisted via URL params (see §X above).

Versioning. persistConfig.version is bumped every time the shape
of any persisted slice changes. A migration entry is added to the
migrations map in persistConfig.ts. Forgetting to bump the version
breaks every existing user's localStorage on their next load.
Sensitive data. Raw auth tokens (JWTs, refresh tokens) are NEVER
persisted to localStorage. Token storage is the auth layer's
responsibility — httpOnly cookies preferred, in-memory acceptable.
Persisted auth slice contains user profile only.
Auto-reject. persistReducer(rootReducer, { blacklist: [...] }).
Adding submissionsApi.reducerPath to the whitelist. Persisting a
slice that contains a token. Changing a persisted slice's shape
without bumping version.
Adding a new persisted slice. See src/app/persist/README.md for
the 5-step procedure.

§X. Error boundaries — every panel is a fault domain
Rule. Every top-level panel container on a page is wrapped in
<ErrorBoundary> with a <PanelErrorState> fallback. One panel's
runtime error must not crash the rest of the page.
Implementation. DashboardPage (and any future page with multiple
panels) renders each panel container inside its own boundary. The
fallback UI shows a small error card with the panel name and a Retry
button that resets the boundary state.
Why.

Production resilience. A malformed API response affecting one
endpoint shouldn't whitescreen the entire dashboard.
Independent recovery. User can keep working in 4 panels while 1
is broken; user can retry just the broken one.
Better error reporting. componentDidCatch per panel gives clear
attribution when wired to monitoring.

Auto-reject. A new panel container mounted in a page without an
<ErrorBoundary> wrapper. A single root-level boundary intended to
catch all panel errors (defeats isolation).
Example. DashboardPage wraps <SubmissionsTableContainer>,
<OpenTasksPanelContainer>, <PipelinePanelContainer> etc. each in
their own boundary. Pattern reference for all future multi-panel pages.


Shell command policy
Claude Code does NOT run the following commands during phase execution. The user runs them in a separate terminal and reports results.
Forbidden:

npm run type-check / tsc --noEmit
npm run lint / eslint
npm run dev / vite / any dev server
npm run build / npm run preview
npm test / any test runners
Any long-running watcher process

Why: these commands burn token budget on stdout output that the user can read directly in their terminal. The user runs them post-phase and pastes only failures.
Allowed (cheap, high-value):

grep / rg for verification (e.g. searching for unexpected usages before schema changes)
ls / cat for short, targeted file inspection
npm run index ONLY when explicitly required by a phase prompt (regenerate INDEX.md after new atoms)
File read/write tools (view, str_replace, create_file)

What to do instead of type-check/lint:

After implementing each step, paste back the JSX/TS code you wrote
Trust TypeScript inference; if a type is uncertain, surface it as a question
Don't pre-validate — let the user run validation in their terminal

At the end of a phase, in the confirmation table, replace:

❌ "lint passes ✓" / "type-check passes ✓"
✅ "Code written; user to run lint + type-check in terminal and report results"

If a phase prompt explicitly says "run X command," that's the only exception.
