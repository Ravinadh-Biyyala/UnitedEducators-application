---
name: "audit"
description: "Run 16-point architecture audit on all files written this session. Auto-fix any failure. Run automatically after /feature or manually after any implementation."
user-invocable: true
---

# Architecture Auditor

Checks all files written in the current session against CLAUDE.md rules.
Run automatically after /feature, or manually after any implementation.

## Execution

Run each check as a targeted grep. Scope: only files written/modified this session.
If session scope is unknown: scan src/components/, src/containers/, src/features/.

---

## Checks

### 1. Redux in wrong layer
grep `useAppSelector\|useAppDispatch` in src/components/common/ and src/components/domain/
→ FAIL if any match. These hooks belong in containers only.

### 2. RTK Query in presentational
grep `useGet.*Query\|use.*Mutation` in src/components/common/ and src/components/domain/
→ FAIL if any match. Data hooks belong in containers only.

### 3. fetch/axios in containers
grep `fetch(\|axios\.` in src/containers/
→ FAIL if any match. Fetching belongs in src/services/ only.

### 4. Cross-feature deep imports
grep `from '@/features/[^']+/[^']+/[^']+'` in src/
→ FAIL if any match. Cross-feature imports must go through the barrel or be promoted to domain/.

### 5. Relative path imports
grep `from '\.\./\.\./` in src/
→ FAIL if any match. All imports must use @/ aliases.

### 6. Filter state in containers
grep `useState.*[Ff]ilter\|useState.*[Tt]ab\|useState.*[Ss]ort\|useState.*[Pp]age` in src/containers/
→ FAIL if any match. All filter/tab/sort/pagination state must use useSearchParams.

### 7. Shadcn imports in src/
grep `from '.*components/ui/'` in src/
→ FAIL if any match. src/ must never import from Shadcn — use common/ equivalents.

### 8. Hardcoded hex values
grep `#[0-9a-fA-F]\{3,6\}` in src/components/ and src/containers/
→ FAIL if any match (excluding comments). All colors must come from tokens.

### 9. ErrorBoundary check
For each new container file written that is mounted in a multi-panel page:
- Read the parent page file
- Verify the container is wrapped in <ErrorBoundary>
→ FAIL if any container is mounted bare.

### 10. Barrel export check
For each new component/hook/container file written:
- Read the nearest index.ts in the same directory or parent layer directory
- Verify the export is present
→ FAIL if any new export is missing from its barrel.

### 11. console.log / console.warn in production code
grep `console\.log\|console\.warn` in src/components/ and src/containers/
→ FAIL if any match (except console.error inside ErrorBoundary.componentDidCatch).
These are debug artifacts — remove before marking a file complete.

### 12. useEffect in domain or common components
grep `useEffect` in src/components/domain/ and src/components/common/
→ FAIL if any match. Effects indicate coordination logic — extract to hooks/<group>/ or container.

### 13. Inline style blocks
grep `style={{` in src/components/ and src/containers/ and src/features/
→ FAIL if any match. All styles must use Tailwind className. No inline style={{ }} in production files.

### 14. Local type redefinition
For each new file in src/: grep `^type \|^interface ` for names that exist in src/shared/types/.
→ FAIL if a locally defined type duplicates a shared type. Remove local definition and import from shared.

### 15. List-item components without React.memo
grep files matching `*Row.tsx\|*Card.tsx\|*Item.tsx\|*Chip.tsx` in src/components/ and src/features/
→ For each matched file, verify it exports via `React.memo(...)`.
→ FAIL if any list-item component is not memoized.

### 16. Dropdown / toggle useState in domain components
grep `useState.*[Oo]pen\|useState.*[Vv]isible\|useState.*[Ss]how\|useState.*[Ee]xpanded` in src/components/domain/
→ FAIL if any match. UI coordination state belongs in a container (via useDisclosure) or a dedicated hook.

---

## Output format

| # | Check | Status | Detail |
|---|-------|--------|--------|
| 1 | Redux in wrong layer | ✓ PASS | — |
| 2 | RTK Query in presentational | ✓ PASS | — |
| 3 | fetch/axios in containers | ✓ PASS | — |
| 4 | Cross-feature imports | ✓ PASS | — |
| 5 | Relative imports | ✓ PASS | — |
| 6 | Filter state in containers | ✓ PASS | — |
| 7 | Shadcn imports in src/ | ✓ PASS | — |
| 8 | Hardcoded hex | ✓ PASS | — |
| 9 | ErrorBoundary | ✓ PASS | — |
| 10 | Barrel exports | ✓ PASS | — |
| 11 | console.log/warn in production | ✓ PASS | — |
| 12 | useEffect in domain/common | ✓ PASS | — |
| 13 | Inline style blocks | ✓ PASS | — |
| 14 | Local type redefinition | ✓ PASS | — |
| 15 | List items missing React.memo | ✓ PASS | — |
| 16 | Dropdown useState in domain | ✓ PASS | — |

On any FAIL: print the exact file + line + suggested fix. Apply the fix immediately.
On all PASS: print "✓ All checks passed."
