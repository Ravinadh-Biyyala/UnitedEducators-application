# Adding a Persisted Slice

**File location:** `src/app/persist/README.md`

This is the 5-step procedure for adding a new slice that survives
browser refresh. Read this every time. Do not skip steps.

## When NOT to add a slice here

Stop and reconsider if any of these apply:

- ❌ The state is filter / sort / tab / search query state.
  Use `useSearchParams`. See `CLAUDE.md` §X "Filter state — URL params,
  not Redux".
- ❌ The state is RTK Query data (`getSubmissions`, `getTasks`, etc.).
  Persisting RTK Query causes stale-cache and double-eviction bugs.
  Let it refetch on mount.
- ❌ The state is ephemeral (toasts, current modal, transient errors).
  These should not survive refresh.
- ❌ The state contains a raw auth token (JWT, refresh token).
  Tokens belong in `httpOnly` cookies or in-memory store. Persisting
  tokens to `localStorage` exposes them to XSS.

## The 5 steps

### 1. Create the slice

Standard Redux Toolkit slice in `src/store/<name>/<name>Slice.ts`. No
persist-specific code in the slice itself — the slice doesn't know it
will be persisted.

```ts
// src/store/preferences/preferencesSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface PreferencesState {
  density: 'comfortable' | 'compact';
}

const initialState: PreferencesState = { density: 'comfortable' };

export const preferencesSlice = createSlice({
  name: 'preferences',
  initialState,
  reducers: {
    setDensity: (state, action: PayloadAction<PreferencesState['density']>) => {
      state.density = action.payload;
    },
  },
});

export const { setDensity } = preferencesSlice.actions;
export default preferencesSlice.reducer;
```

### 2. Add the slice to the root reducer

In `src/app/store.ts`, register the new reducer:

```ts
const rootReducer = combineReducers({
  auth: authReducer,
  ui: uiReducer,
  preferences: preferencesReducer, // ← new
  [submissionsApi.reducerPath]: submissionsApi.reducer,
  // ...
});
```

### 3. Add the slice name to the whitelist

In `src/app/persist/persistConfig.ts`:

```ts
const PERSIST_WHITELIST = ['auth', 'ui', 'preferences'] as const; // ← added
```

The slice now persists. Refresh the browser — value survives.

### 4. Bump the version + add a migration (if shape evolves later)

If you later change the shape of `PreferencesState` (e.g. add a
`theme` field), bump `PERSIST_VERSION` and add a migration entry:

```ts
const PERSIST_VERSION = 2; // was 1

const migrations = {
  1: (state: any) => state,
  2: (state: any) => ({
    ...state,
    preferences: {
      ...state.preferences,
      theme: state.preferences?.theme ?? 'light', // sensible default
    },
  }),
};
```

Forgetting this step is the #1 cause of "the app broke for users with
old localStorage." Always bump + migrate when shape changes.

### 5. Verify in DevTools

After implementing:

1. Open Chrome DevTools → Application → Local Storage
2. Find the key `persist:underwriter-root`
3. Confirm the new slice appears in the JSON value
4. Confirm RTK Query slices do NOT appear
5. Confirm no auth tokens or sensitive data appear

## Known accepted risks

- **Persisted data is unencrypted in localStorage.** Encryption via
  `redux-persist-transform-encrypt` is deferred until threat model
  demands it. Do not add encryption without a documented reason; the
  decryption key has to live somewhere accessible to JS, which means
  XSS still wins. Encryption mostly helps against casual access to
  the user's machine, not real attacks.

- **No quota handling.** `localStorage` is ~5 MB. We don't currently
  approach this limit. If a future persisted slice (e.g. form drafts
  for many submissions) approaches the limit, add quota checks or
  switch to IndexedDB (`redux-persist` supports both).

- **No cross-tab synchronization.** Changes in one tab don't
  immediately reflect in another tab. The other tab sees the change
  on its next reload. Adding tab sync (`storage` event listener or
  `BroadcastChannel`) is a future enhancement; not currently needed.

## Adding the FORM DRAFT slot (Phase 10+)

When Submission Detail edit drafts ship:

1. Slice path: `src/features/submissions/store/submissionDraftSlice.ts`
2. Shape: `Record<SubmissionId, Partial<Submission>>` — drafts keyed by
   submission ID
3. Whitelist entry: add `'submissionDrafts'` to `PERSIST_WHITELIST`
4. Container reads draft via `useAppSelector(s => s.submissionDrafts[id])`
5. On successful save mutation: dispatch `clearDraft(id)`

Drafts surviving refresh is the canonical reason this infrastructure
exists. Phase 4.5 adds the plumbing; Phase 10+ adds the consumer.