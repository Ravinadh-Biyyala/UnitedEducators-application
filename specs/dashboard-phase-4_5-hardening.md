# Spec: Dashboard Phase 4.5 — Hardening

## §1 Goal

Before shipping more dashboard panels (Phase 5 Pipeline, Phase 7 Recent
Activity, Phase 9 Underwriter Performance, Phase 10+ Submission
Detail), close 4 architectural gaps that will become expensive to
retrofit later:

1. **Error boundaries per panel** — one panel's runtime error must not
   crash the entire dashboard.
2. **URL-driven filter state** — filters live in `useSearchParams`, not
   container `useState`, not Redux. Sets the precedent before more
   filtered containers ship.
3. **Redux Persist infrastructure with strict whitelist** — auth and
   UI prefs survive refresh; RTK Query cache, filters, and ephemeral
   UI explicitly do NOT persist. Add now while only `authSlice` exists.
4. **Document all 3 conventions in `CLAUDE.md`** — so future contributors
   (humans or Claude sessions) follow the patterns automatically.

This phase is **all refactor + infrastructure**. No new visual
components. No new entities. The user-visible diff is: dashboard URL
now contains `?taskFilter=All` after clicking the Tasks tab; if a
panel ever throws, the user sees a small error card instead of a white
screen; auth survives a hard refresh.

---

## §2 Design source (no MCP)

Not applicable. No visual changes. All design tokens stay as-is.

---

## §3 Scope — files this spec creates or modifies

| Path | Action | Purpose |
|---|---|---|
| `package.json` | modify | Add `redux-persist` dependency |
| `src/app/persist/persistConfig.ts` | create | Root persist config: key, version, storage, whitelist, migrate |
| `src/app/persist/README.md` | create | "How to add a new persisted slice" — 5 steps. Copy-paste reference. |
| `src/app/store.ts` | modify | Wrap reducer with `persistReducer`, ignore persist actions in middleware serializability check |
| `src/main.tsx` | modify | Wrap `<App>` with `<PersistGate persistor={persistor}>` |
| `src/store/ui/uiSlice.ts` | create | Stub UI prefs slice (sidebar collapsed, theme). Exists so it can be added to whitelist. Even if empty initially, it establishes the slot. |
| `src/store/ui/index.ts` | create | barrel |
| `src/components/common/ErrorBoundary/ErrorBoundary.tsx` | create | Class component with `componentDidCatch`. Takes `fallback` prop. |
| `src/components/common/ErrorBoundary/PanelErrorState.tsx` | create | The fallback UI: small error card with "Something went wrong loading this panel." + retry button. Uses tokens. |
| `src/components/common/ErrorBoundary/index.ts` | create | barrel exporting both |
| `src/containers/dashboard/OpenTasksPanelContainer.tsx` | modify | Replace `useState<TaskFilter>` with `useSearchParams` for `taskFilter` param. Component contract unchanged. |
| `src/features/dashboard/pages/DashboardPage.tsx` | modify | Wrap each panel container in `<ErrorBoundary fallback={<PanelErrorState panelName="..." />}>` |
| `CLAUDE.md` | modify | Append 4 new convention sections (see §4 below for verbatim content) |

After implementation: run `npm run index` to refresh `INDEX.md`.

**File count: 7 new + 5 modified = 12.** Slightly over the 5–10 rule
of thumb, but most are tiny (barrel exports, stub slice, single-purpose
util). The actual implementation work is concentrated in 3 files:
`persistConfig.ts`, `ErrorBoundary.tsx`, `OpenTasksPanelContainer.tsx`.

---

## §4 Behavior + contracts

### 4.1 Redux Persist setup

#### `src/app/persist/persistConfig.ts`

```ts
import storage from 'redux-persist/lib/storage'; // localStorage by default
import { createMigrate } from 'redux-persist';
import type { PersistConfig } from 'redux-persist';

/**
 * STRICT WHITELIST. Only slices listed here are persisted.
 *
 * Why whitelist (not blacklist):
 * - Adding a new slice without thinking persists it by default = leak risk
 *   (e.g. accidentally persisting a JWT, or notifications)
 * - Whitelist forces a deliberate decision for each new slice
 *
 * NEVER add to this list:
 * - Any RTK Query API slice (*.reducerPath) — RTKQ manages its own cache
 *   lifecycle; persisting causes stale-cache, double-eviction, and
 *   silent breakage when API response shape changes between deploys.
 * - Notifications / toasts / modals — ephemeral by definition;
 *   showing yesterday's "Saved!" toast on today's refresh is broken UX.
 * - Filter state — filters live in URL params (useSearchParams), not Redux.
 *
 * SAFE to add:
 * - auth (user profile; NOT raw JWT — token belongs in httpOnly cookie or
 *   short-lived memory store)
 * - ui (sidebar collapsed, theme, density, language)
 * - forms/* drafts (Phase 10+ — submission detail edit drafts)
 */
const PERSIST_WHITELIST = ['auth', 'ui'] as const;

/**
 * Migrations run when the persisted state's version is older than the
 * current version. Each migration takes the old state and returns the
 * new state shape.
 *
 * RULE: every time you change the shape of a persisted slice, BUMP THE
 * VERSION below and add a migration entry. Forgetting to bump means
 * every existing user's localStorage breaks the app on next load.
 */
const PERSIST_VERSION = 1;

const migrations = {
  // 1: initial version, no-op
  1: (state: any) => state,
};

export const rootPersistConfig: PersistConfig<any> = {
  key: 'underwriter-root',
  version: PERSIST_VERSION,
  storage,
  whitelist: [...PERSIST_WHITELIST],
  migrate: createMigrate(migrations, { debug: import.meta.env.DEV }),
};
```

#### `src/app/store.ts` — modifications

```ts
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import {
  persistReducer,
  persistStore,
  FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER,
} from 'redux-persist';
import { rootPersistConfig } from './persist/persistConfig';

const rootReducer = combineReducers({
  auth: authReducer,
  ui: uiReducer,
  [submissionsApi.reducerPath]: submissionsApi.reducer,
  [tasksApi.reducerPath]: tasksApi.reducer,
  // ...other RTK Query slices
});

const persistedReducer = persistReducer(rootPersistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (gDM) =>
    gDM({
      serializableCheck: {
        // redux-persist dispatches non-serializable actions during rehydrate
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    })
      .concat(submissionsApi.middleware)
      .concat(tasksApi.middleware),
      // ...other API middleware
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

#### `src/main.tsx` — wrap with PersistGate

```tsx
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './app/store';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <App />
      </PersistGate>
    </Provider>
  </StrictMode>,
);
```

`loading={null}` means render nothing during rehydration. Acceptable
because rehydration is sub-100ms with `localStorage`. If perceived as
flash, swap to a small `<AppLoadingShell />` later. Don't over-engineer
this in v1.

#### `src/store/ui/uiSlice.ts` — stub

```ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UiState {
  sidebarCollapsed: boolean;
  // theme, density, language, etc. land here later
}

const initialState: UiState = {
  sidebarCollapsed: false,
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.sidebarCollapsed = action.payload;
    },
  },
});

export const { setSidebarCollapsed } = uiSlice.actions;
export default uiSlice.reducer;
```

The slice is intentionally minimal. Its job in this phase is to **exist
so it can be whitelisted**. Future phases add real prefs.

### 4.2 Error boundaries per panel

#### `src/components/common/ErrorBoundary/ErrorBoundary.tsx`

```tsx
import { Component, ReactNode, ErrorInfo } from 'react';

interface Props {
  fallback: ReactNode | ((error: Error, reset: () => void) => ReactNode);
  onError?: (error: Error, info: ErrorInfo) => void;
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.props.onError?.(error, info);
    // TODO: report to error monitoring (Sentry / Datadog) when wired
    // eslint-disable-next-line no-console
    console.error('[ErrorBoundary]', error, info);
  }

  reset = () => this.setState({ error: null });

  render() {
    if (this.state.error) {
      const { fallback } = this.props;
      return typeof fallback === 'function'
        ? fallback(this.state.error, this.reset)
        : fallback;
    }
    return this.props.children;
  }
}
```

#### `src/components/common/ErrorBoundary/PanelErrorState.tsx`

```tsx
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { colors, fonts, fontSize, fontWeight } from '@/theme/tokens';

interface Props {
  panelName?: string;
  onRetry?: () => void;
}

export function PanelErrorState({ panelName, onRetry }: Props) {
  return (
    <div style={{
      padding: 24,
      backgroundColor: colors.dangerRedBg,
      border: `1px solid ${colors.dangerRedBorder}`,
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      alignItems: 'flex-start',
      fontFamily: fonts.sans,
    }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <AlertTriangle size={16} color={colors.dangerRed} />
        <span style={{
          color: colors.dangerRedText,
          fontSize: fontSize['12'],
          fontWeight: fontWeight.bold,
        }}>
          {panelName ? `${panelName} failed to load` : 'Panel failed to load'}
        </span>
      </div>
      <span style={{
        color: colors.textBody,
        fontSize: fontSize['11'],
        fontWeight: fontWeight.regular,
      }}>
        Something went wrong. The other panels are unaffected.
      </span>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 12px',
            backgroundColor: colors.bgSurface,
            border: `1px solid ${colors.borderStrong}`,
            color: colors.textBody,
            fontSize: fontSize['11'],
            fontWeight: fontWeight.semibold,
            cursor: 'pointer',
          }}
        >
          <RefreshCw size={11} />
          Retry
        </button>
      )}
    </div>
  );
}
```

#### `DashboardPage.tsx` — wrap each panel

```tsx
<ErrorBoundary fallback={(_err, reset) =>
  <PanelErrorState panelName="Submissions" onRetry={reset} />
}>
  <SubmissionsTableContainer />
</ErrorBoundary>

<ErrorBoundary fallback={(_err, reset) =>
  <PanelErrorState panelName="Open Tasks" onRetry={reset} />
}>
  <OpenTasksPanelContainer />
</ErrorBoundary>

// ...and so on for every panel
```

Each panel becomes a fault domain. One panel's `undefined.foo` doesn't
take down the dashboard.

### 4.3 URL-driven filter state — Tasks migration

#### `src/containers/dashboard/OpenTasksPanelContainer.tsx`

**Before** (current):
```tsx
const [activeFilter, setActiveFilter] = useState<TaskFilter>('All');
```

**After**:
```tsx
import { useSearchParams } from 'react-router-dom';

const TASK_FILTER_PARAM = 'taskFilter';
const DEFAULT_FILTER: TaskFilter = 'All';

function isValidTaskFilter(v: string | null): v is TaskFilter {
  return v === 'All' || v === 'Mine' || v === 'Overdue';
}

export function OpenTasksPanelContainer() {
  const { data: tasks = [] } = useGetTasksQuery();
  const [params, setParams] = useSearchParams();

  const raw = params.get(TASK_FILTER_PARAM);
  const activeFilter: TaskFilter = isValidTaskFilter(raw) ? raw : DEFAULT_FILTER;

  const setActiveFilter = (next: TaskFilter) => {
    setParams(prev => {
      const updated = new URLSearchParams(prev);
      if (next === DEFAULT_FILTER) {
        updated.delete(TASK_FILTER_PARAM); // keep URL clean
      } else {
        updated.set(TASK_FILTER_PARAM, next);
      }
      return updated;
    }, { replace: true }); // don't pollute browser history with filter changes
  };

  // ... rest unchanged: filteredTasks useMemo, overdueCount useMemo, return JSX
}
```

**Three things to call out about this migration:**

1. **Validation on read.** URLs can contain anything (`?taskFilter=lol`).
   The `isValidTaskFilter` guard ensures invalid values fall back to
   the default. Never trust URL params as typed.
2. **Default value omitted from URL.** When filter is `'All'` (the
   default), don't add it to the URL. Cleaner share links.
3. **`{ replace: true }`.** Filter changes shouldn't add browser
   history entries. Otherwise the back button cycles through every
   filter the user clicked, which is annoying.

The component contract is **unchanged**. `OpenTasksPanel` still
receives `activeFilter` + `onFilterChange` as props. Refactor is
container-internal.

### 4.4 CLAUDE.md updates

Append the 4 new convention sections to `CLAUDE.md`. Verbatim content
is in the file `claude-md-additions.md` accompanying this spec.
Insertion point: after the existing "Auto-reject patterns" section,
before the "Quick Reference" section. The 4 new sections are:

- §X: Filter state — URL params, not Redux, not container useState
- §X: Cross-panel communication — URL params are the bus
- §X: Persistence — strict whitelist, never blacklist
- §X: Error boundaries — every panel is a fault domain

Renumber subsequent sections accordingly.

---

## §5 Reuse from `INDEX.md`

Existing items to use, do **not** recreate:

- `app/store.ts` — extend, don't fork. Wrap existing reducer.
- `theme/tokens.ts` — read-only this phase
- All Phase 4 / Phase 6 components — left alone except for the Tasks
  container internals (which preserve component contract)

If `INDEX.md` shows `ErrorBoundary`, `PanelErrorState`, `uiSlice`,
`persistConfig`, or any of these utilities already exist, **stop and
report** rather than overwriting.

If `INDEX.md` does not yet show Phase 6 (`OpenTasksPanelContainer`),
this phase cannot proceed — Phase 6 must ship first. Stop and report.

---

## §6 Acceptance criteria

### Persistence

1. After a hard refresh (Cmd+Shift+R), authenticated user remains
   authenticated (assumes `authSlice` is wired with user data).
2. After a hard refresh, sidebar collapsed state (if changed) persists.
3. RTK Query cache is NOT persisted: open DevTools Application →
   Local Storage → only `auth` and `ui` keys appear in the persisted blob.
4. Filter state is NOT persisted: changing `?taskFilter=Overdue` and
   refreshing keeps the URL filter (because URL persists), but the
   localStorage blob does not contain `taskFilter`.
5. Bumping `PERSIST_VERSION` to 2 with no migration handler purges old
   state on next load (verify by inspection — not a runtime assertion).
6. `<PersistGate>` wraps `<App>` in `main.tsx`.
7. Middleware ignores `FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER`
   in `serializableCheck`.

### Error boundaries

8. Each panel container in `DashboardPage` is wrapped in
   `<ErrorBoundary>` with a `<PanelErrorState>` fallback.
9. Throwing an error inside one panel (verify by temporarily adding
   `throw new Error('test')` in a container) shows the error card for
   that panel only — other panels render normally.
10. Clicking "Retry" on the error card resets the boundary's error state
    and re-renders the panel.
11. `componentDidCatch` logs to console with `[ErrorBoundary]` prefix.

### URL-driven filters

12. Loading the dashboard with `?taskFilter=Overdue` shows the Tasks
    panel with "Overdue" tab active.
13. Clicking a Tasks tab updates the URL (`?taskFilter=Mine`).
14. Clicking the "All" tab REMOVES the param from the URL (default value).
15. Loading with an invalid value (`?taskFilter=lol`) renders with
    "All" active and does not throw.
16. Filter changes use `replace: true` — back button does NOT cycle
    through filter history.
17. The `OpenTasksPanel` component (presentational) is **unchanged** in
    this phase. Its props, behavior, and rendering stay identical.

### Code quality

18. `npm run lint` passes.
19. `npm run type-check` passes.
20. `npm run build` succeeds.
21. No new raw `rgb()` or hex strings in any file.
22. No `useState` for filter state in any container in `containers/dashboard/`.
23. `redux-persist` appears in `dependencies`, not `devDependencies`.

### Documentation

24. `CLAUDE.md` contains the 4 new sections, inserted at the correct
    location.
25. `src/app/persist/README.md` exists and lists the 5 steps to add a
    new persisted slice.

---

## §7 Out of scope

- ❌ Persisting the `authSlice` requires the slice to exist; if
  `authSlice` is currently a stub or missing fields, do NOT extend it
  in this phase. Persist whatever shape exists today; broader auth
  work is a separate spec.
- ❌ Encryption of persisted data (`redux-persist-transform-encrypt`).
  Premature; revisit when threat model demands it. Document as known
  accepted risk in `persist/README.md`.
- ❌ SSR support. PersistGate is added regardless because removing it
  later costs more than adding it now.
- ❌ Migrating filters in any OTHER container besides Tasks. Phase 5
  Pipeline (already specced) does not yet have filters; when Phase 7
  Activity ships with filters, it will follow the URL pattern from
  day one because CLAUDE.md is now updated.
- ❌ Testing infrastructure (Vitest, RTL). Hardening is a refactor;
  testing is a separate phase.
- ❌ Sentry / Datadog wiring inside `componentDidCatch`. Add when
  monitoring is procured. Marked with TODO.
- ❌ Refactoring `useState` from any non-filter use case. Local state
  for things like "modal open" is fine in `useState` and should stay there.
- ❌ Persisting form drafts. The `forms/*` slot in the whitelist is
  documented but no `forms` slice is created in this phase.
- ❌ Cross-panel URL coordination (e.g. clicking Portfolio Snapshot's
  "Quoted Pipeline" filtering Submissions table). Pattern is documented
  but consumers wire it later.