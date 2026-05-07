# Redux Persist — How to add a new persisted slice

Follow these 5 steps every time you want to persist a new Redux slice.
Missing any step causes stale or broken state on next deploy.

## Step 1 — Confirm the slice should be persisted

Ask: does this state need to survive a hard refresh?

**Safe to persist:**
- User profile / preferences (auth, ui settings)
- Form drafts the user explicitly saved

**Never persist:**
- RTK Query API slices — RTKQ manages cache via tags + invalidation. Persisting
  causes stale data, double-eviction, and silent breakage when API shapes change.
- Filter / sort / search / pagination state — these live in URL params.
- Notifications, toasts, modals — ephemeral by definition.
- Raw auth tokens (JWT, refresh) — use httpOnly cookies or in-memory only.

## Step 2 — Add the slice name to PERSIST_WHITELIST

In `src/app/persist/persistConfig.ts`:

```ts
const PERSIST_WHITELIST = ['auth', 'ui', 'yourNewSlice'] as const;
```

TypeScript enforces the whitelist is `readonly string[]`.

## Step 3 — Bump PERSIST_VERSION

In the same file:

```ts
const PERSIST_VERSION = 2; // was 1
```

Every shape change requires a version bump. No exceptions.

## Step 4 — Add a migration

In the `migrations` map:

```ts
const migrations = {
  1: (state: unknown) => state,
  2: (oldState: unknown) => {
    // Transform old state shape → new state shape.
    // Return the new state. You may need to cast.
    const s = oldState as Record<string, unknown>;
    return { ...s, yourNewSlice: { defaultField: true } };
  },
};
```

## Step 5 — Document the accepted risk

Add a comment to the whitelist entry explaining:
- What data is persisted
- Why it's safe (no PII? no tokens? no ephemeral UI?)
- Who owns the migration contract

---

## Accepted risks (as of Phase 4.5)

| Risk | Decision |
|---|---|
| `auth` slice persists `token: string \| null` (raw JWT in localStorage) | **Accepted for now.** Auth rework is a separate spec. Token is short-lived. Document as known risk. Do not encrypt in this phase. |
| No encryption of persisted data | Accepted. `redux-persist-transform-encrypt` deferred until threat model demands it. |
| SSR incompatibility | Not applicable — app is CSR-only. `PersistGate` is added now; removing it later costs more than adding it now. |
