import storage from 'redux-persist/lib/storage';
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
 * - Notifications / toasts / modals — ephemeral by definition.
 * - Filter state — filters live in URL params (useSearchParams), not Redux.
 *
 * SAFE to add:
 * - auth (user profile; NOT raw JWT — token belongs in httpOnly cookie)
 * - ui (sidebar collapsed, theme, density, language)
 * - forms/* drafts (Phase 10+ — submission detail edit drafts)
 *
 * See src/app/persist/README.md for the 5-step procedure to add a slice.
 */
const PERSIST_WHITELIST = ['auth', 'ui'] as const;

/**
 * Bump this version every time the shape of a persisted slice changes.
 * Add a migration entry below. Forgetting to bump breaks existing users'
 * localStorage on their next load.
 */
const PERSIST_VERSION = 1;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const migrations: Record<number, (state: any) => any> = {
  // 1: initial version — no-op
  1: (state) => state,
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const rootPersistConfig: PersistConfig<any> = {
  key:       'underwriter-root',
  version:   PERSIST_VERSION,
  storage,
  whitelist: [...PERSIST_WHITELIST],
  migrate:   createMigrate(migrations, { debug: import.meta.env.DEV }),
};
