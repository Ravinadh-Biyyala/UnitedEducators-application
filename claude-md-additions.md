# CLAUDE.md additions — append after the "Auto-reject patterns" section

> Copy these 4 sections verbatim into `CLAUDE.md` after the existing
> "Auto-reject patterns" section. Renumber subsequent sections.

---

## §X. Filter state — URL params, not Redux, not container useState

**Rule.** Any state that represents "what the user is currently
viewing" — filters, tab selections, sort order, search queries, time
ranges, pagination cursors — lives in **URL search params**, not in
container `useState`, not in Redux.

**Implementation.** Containers read filters via `useSearchParams`,
write via the same hook with `{ replace: true }`. Default values are
omitted from the URL to keep share links clean. Invalid values fall
back to the default via a runtime type guard — URL params are strings;
trust nothing.

**Why.**

- Refresh keeps your filtered view. No "where was I?" friction.
- Share links work. "Send me the Overdue tasks for SUB-7829" is a URL.
- Back button works. Browser navigation = filter history.
- Cross-panel sync is automatic. Two panels reading the same URL param
  stay in sync without prop drilling or a shared store.
- No persist/rehydrate complexity. The browser's URL is already
  persistent.

**Auto-reject.** A container importing `useState` to hold filter,
tab, or query state. A new Redux slice named `dashboardFiltersSlice`
or similar. Filter state passed through props from a page component
into a container.

**Example.** `OpenTasksPanelContainer` reads `taskFilter` from
`useSearchParams`, validates with `isValidTaskFilter`, falls back to
`'All'` if invalid or absent. Pattern reference for all future
filtered containers.

---

## §X. Cross-panel communication — URL params are the bus

**Rule.** When one panel needs to influence another (e.g. clicking
"Quoted Pipeline" on Portfolio Snapshot filters the Submissions table
to status=Quoted), the communication channel is **URL search params**.
Never a shared Redux slice. Never a React Context that spans panels.
Never a callback drilled through `DashboardPage`.

**Implementation.** Source panel writes the param via
`setSearchParams`. Target panel reads via `useSearchParams` and
incorporates the value into its data fetch (e.g. as an arg to
`useGetSubmissionsQuery`).

**Why.**

- Panels stay independent. Source doesn't import target. Target doesn't
  know source exists.
- Shareable. The filtered cross-panel state is a copy-pasteable URL.
- Same pattern as single-panel filters. One mental model, not two.
- Removing a panel doesn't break callers — the URL param just becomes
  unread.

**Auto-reject.** A panel that imports another panel's slice or
selector. A `DashboardContext` provider that holds shared filter state.
A `useDashboardState()` hook that returns coordinated state for
multiple panels.

**Example.** Click `onStatClick('quotedPipeline')` on Portfolio →
container does `setSearchParams({ status: 'Quoted' })` →
`SubmissionsTableContainer` reads `params.get('status')` → passes to
`useGetSubmissionsQuery({ status })`. Zero coupling between
containers.

---

## §X. Persistence — strict whitelist, never blacklist

**Rule.** Redux Persist is configured with a **whitelist** of slice
names that opt in to persistence. Adding a new slice does not persist
it by default. Each addition to the whitelist is a deliberate decision
documented in the persist config.

**The whitelist contains:**
- `auth` — user profile (NOT raw JWT)
- `ui` — sidebar collapsed, theme, density, language
- `forms/*` — submission edit drafts (added when Phase 10+ ships)

**The whitelist NEVER contains:**
- Any RTK Query API slice (`*.reducerPath`). RTK Query manages cache
  lifecycle via tags + invalidation. Persisting it causes stale data,
  double-eviction bugs, and silent breakage when API response shape
  changes between deploys.
- `notifications`, `toasts`, `modals` — ephemeral by definition.
- Filter state — already persisted via URL params (see §X above).

**Versioning.** `persistConfig.version` is bumped every time the shape
of any persisted slice changes. A migration entry is added to the
`migrations` map in `persistConfig.ts`. Forgetting to bump the version
breaks every existing user's localStorage on their next load.

**Sensitive data.** Raw auth tokens (JWTs, refresh tokens) are NEVER
persisted to localStorage. Token storage is the auth layer's
responsibility — `httpOnly` cookies preferred, in-memory acceptable.
Persisted `auth` slice contains user profile only.

**Auto-reject.** `persistReducer(rootReducer, { blacklist: [...] })`.
Adding `submissionsApi.reducerPath` to the whitelist. Persisting a
slice that contains a token. Changing a persisted slice's shape
without bumping `version`.

**Adding a new persisted slice.** See `src/app/persist/README.md` for
the 5-step procedure.

---

## §X. Error boundaries — every panel is a fault domain

**Rule.** Every top-level panel container on a page is wrapped in
`<ErrorBoundary>` with a `<PanelErrorState>` fallback. One panel's
runtime error must not crash the rest of the page.

**Implementation.** `DashboardPage` (and any future page with multiple
panels) renders each panel container inside its own boundary. The
fallback UI shows a small error card with the panel name and a Retry
button that resets the boundary state.

**Why.**

- Production resilience. A malformed API response affecting one
  endpoint shouldn't whitescreen the entire dashboard.
- Independent recovery. User can keep working in 4 panels while 1
  is broken; user can retry just the broken one.
- Better error reporting. `componentDidCatch` per panel gives clear
  attribution when wired to monitoring.

**Auto-reject.** A new panel container mounted in a page without an
`<ErrorBoundary>` wrapper. A single root-level boundary intended to
catch all panel errors (defeats isolation).

**Example.** `DashboardPage` wraps `<SubmissionsTableContainer>`,
`<OpenTasksPanelContainer>`, `<PipelinePanelContainer>` etc. each in
their own boundary. Pattern reference for all future multi-panel pages.

---