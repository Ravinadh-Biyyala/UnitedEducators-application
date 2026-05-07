# Submissions Phase S4 — List Table

> Status: spec ready
> Phase track: Submissions (S1–S5)
> Prerequisite: S1 implemented. S3 should be implemented before S4 — S4 depends on `useSubmissionsUrlState` hook (sort + page params).

## Goal

Replace the list region placeholder with the full data table: sortable column headers, row cards with status edge stripes, product chips, appetite bar, avatar, unassigned warning, days-color severity, and the new pagination footer. After S4, the submissions page is feature-complete read-only end-to-end.

## Visual scope

### 9 columns (display order)

| Column | Sortable | Width token | Cell content |
|---|---|---|---|
| Member / Institution | yes | `colWidths.memberInstitution` | Icon box + name + sub-id pill + state · broker |
| Products | no | `colWidths.products` | Product chips (1–4, wrapping) |
| Status | yes | `colWidths.status` | `<StatusBadge>` (existing) |
| Est. Premium | yes | `colWidths.estPremium` | Currency + "X enrolled" subtext |
| Assigned To | no | `colWidths.assignedTo` | Avatar + name OR Unassigned warning |
| Appetite | yes | `colWidths.appetite` | Progress bar + percentage |
| Days | yes | `colWidths.days` | "Xd" with severity color + relative timestamp |
| Submitted | yes | `colWidths.submitted` | Date + relative timestamp |
| (chevron) | no | `colWidths.chevron` | Right-arrow icon |

### Row anatomy

- Left edge: 2px stripe colored per `submissionsRowStatusStripes[status]`
- Background: white
- Border bottom: 1px slate-200
- Min height per `submissionsListTableDims.rowMinHeight`
- No click handler (per S1 rule — detail page doesn't exist)

### Pagination footer (NEW v2 format)

Three regions justified across the footer:
- **Left:** "Showing X – Y of Z submissions"
- **Middle:** "Page A of B"
- **Right:** `< Previous` / page numbers / `Next >`

Active page: brand-blue filled. Inactive: slate outlined. Previous/Next disabled at boundaries.

## New shared atoms

- `components/common/Pagination/` — generic, takes `page`/`pageSize`/`total`/`onPageChange`/`itemLabel`
- `components/common/SortableColumnHeader/` — generic, takes `label`/`sortKey?`/`currentSort`/`onSortChange`/`align?`

## New domain atoms

- `components/domain/ProductChips/` — renders 1+ chips with icons, wraps on overflow
- `components/domain/AppetiteBar/` — progress bar + percent label

## Internal subcomponent (NOT exported)

- `SubmissionListRow` lives inside `SubmissionsListTable.tsx`

## Files to create / edit

### Create
- `src/components/common/Pagination/Pagination.tsx` + `index.ts`
- `src/components/common/SortableColumnHeader/SortableColumnHeader.tsx` + `index.ts`
- `src/components/domain/ProductChips/ProductChips.tsx` + `index.ts`
- `src/components/domain/AppetiteBar/AppetiteBar.tsx` + `index.ts`

### Edit
- `src/containers/submissions/SubmissionsListContainer.tsx` — wire `useSubmissionsUrlState`, call `useGetSubmissionsListQuery`, pass props
- `src/components/domain/SubmissionsListTable/SubmissionsListTable.tsx` — replace placeholder with real implementation incl. internal `SubmissionListRow`

### Conditional edit (only if figma-rest fetch confirms missing values)
- `src/theme/tokens.ts` — add tokens ONLY if Figma has a property no existing token covers AND it's required to render. Per the strict rule (below), STOP and ask before adding.

### Do NOT touch
- Service layer (S1 mock + queries already correct)
- Filters drawer / scope tabs (S3 territory)
- Header (S2)
- Existing dashboard `<StatusBadge>` (already supports all 6 PascalCase statuses post-S1 refactor)

## Component prop contracts

```ts
// Pagination
interface PaginationProps {
  page: number;                   // 1-indexed
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  itemLabel?: string;             // 'submissions' | 'tasks' — defaults to 'items'
}

// SortableColumnHeader
interface SortableColumnHeaderProps {
  label: string;
  sortKey?: string;               // absent → non-sortable, no chevron, no click
  currentSort?: { field: string; direction: 'asc' | 'desc' };
  onSortChange?: (field: string) => void;
  align?: 'left' | 'right' | 'center';
}

// ProductChips
interface ProductChipsProps { products: ProductLine[]; }

// AppetiteBar
interface AppetiteBarProps { percent: number; }    // 0–100

// SubmissionsListTable
interface SubmissionsListTableProps {
  items: Submission[];
  isLoading: boolean;
  total: number;
  page: number;
  pageSize: number;
  sort: SubmissionsSort;
  onSortChange: (s: SubmissionsSort) => void;
  onPageChange: (p: number) => void;
}
```

## Sort interaction

Click a sortable header → if same field, toggle direction; if different field, set `direction: 'desc'` (latest/largest first as default).

URL serialization (S3 hook): `?sort=submitted-desc` ⇄ `{ field: 'submitted', direction: 'desc' }`.

## Pagination math

- `totalPages = Math.ceil(total / pageSize) || 1`
- Showing X – Y of Z:
  - `X = total === 0 ? 0 : (page - 1) * pageSize + 1`
  - `Y = Math.min(page * pageSize, total)`
- Previous disabled when `page === 1`
- Next disabled when `page >= totalPages || total === 0`
- For S4: render all page numbers (no ellipsis pattern). Mock has 25 items / 10 = 3 pages max — fits trivially.

## Status edge stripe

```tsx
<div
  className="absolute left-0 top-0 bottom-0"
  style={{
    width: submissionsListTableDims.rowLeftStripeWidth,
    backgroundColor: submissionsRowStatusStripes[submission.status],
  }}
/>
```

## Days severity

```ts
const severity: DaysOpenSeverity =
  days >= daysOpenThresholds.critical ? 'critical' :
  days >= daysOpenThresholds.warning  ? 'warning'  :
  'normal';
const { color, weight } = daysOpenSeverityStyles[severity];
```

(`critical: 21`, `warning: 18` per S1 tokens.)

## Unassigned cell

When `submission.underwriter == null`:
- `<AlertTriangle>` (lucide) + "Unassigned" text
- Both colored per `unassignedStyles.iconColor` / `textColor`

When set: `<Avatar>` (existing) with initials + first name.

## Loading & empty states

- `isLoading && items.length === 0`: render 5 skeleton rows (minimal `animate-pulse`); header renders normally; pagination shows `total = 0`
- `isLoading && items.length > 0` (refetch): keep showing existing rows, do NOT replace with skeletons
- `!isLoading && items.length === 0`: minimal placeholder ("No submissions match your filters.") — S5 polishes

## Responsive

Per universal rules in tracker:
- Table wrapper: `overflow-x-auto`
- Table itself: column widths from tokens (sum ≈ 1014px content + chrome)
- At narrow viewports: table scrolls horizontally inside its wrapper. Page does NOT horizontal-scroll.
- Pagination footer: `flex flex-wrap items-center justify-between gap-y-2`. At narrow widths the 3 regions wrap to multiple lines but never push page wider.
- No column hiding. No row reflow. No card view.

## Property Strictness Rule (NEW — applies to all future phases too)

For every CSS property in your implementation, you must point to one of:
- (a) an existing token in `tokens.ts` that maps to a Figma property, OR
- (b) an explicit property in the figma-rest JSON response

If neither exists and you're tempted to add the property anyway because "it looks like it should be there" — STOP and ask. Common traps:

| CSS property | Figma JSON key | If absent in JSON |
|---|---|---|
| `border-radius` | `cornerRadius` | DO NOT add. Sharp corners. |
| `box-shadow` | `effects` (with type DROP_SHADOW) | DO NOT add. No shadow. |
| `transition` / animations | (no Figma equivalent) | DO NOT add unless required for interactivity |
| `letter-spacing` | `letterSpacing` | DO NOT add. Default spacing. |
| `text-transform` | `textCase` | DO NOT add. Default case. |
| `font-family` | `fontName.family` | DO NOT override. Inherit from app default. |

**Hover/focus styles** are exceptions where conservative defaults are OK (button needs *some* affordance):
- Cursor: `cursor-pointer` on clickable elements (allowed)
- Hover opacity: `hover:opacity-80` or similar minimal change (allowed)
- Focus ring: `focus-visible:ring-2 focus-visible:ring-blue-500` Tailwind default (allowed)
- Anything more elaborate (color shifts, shadows on hover): ask first

## Acceptance criteria

1. ✅ `npm run lint` passes
2. ✅ `npm run type-check` passes
3. ✅ `npm run index` regenerated; `Pagination`, `SortableColumnHeader`, `ProductChips`, `AppetiteBar` appear as new exports
4. ✅ Table renders up to 10 rows on page 1 (or fewer if scope+filters reduce results)
5. ✅ All 9 columns render at correct widths
6. ✅ Status edge stripe color matches `submissionsRowStatusStripes[status]` for each row
7. ✅ ProductChips render 1–4 chips, wrap on overflow, each with correct lucide icon per `productLineIcons[product]`
8. ✅ AppetiteBar fill width = `percent`%, color always `green700`
9. ✅ Days column color matches severity at boundary values 17 / 18 / 20 / 21 / 25
10. ✅ Unassigned cell: AlertTriangle + amber "Unassigned" when null; avatar+name otherwise
11. ✅ Submitted cell: date + relative time using existing `formatDate`
12. ✅ Sortable headers show chevron; click toggles direction or switches field; URL updates
13. ✅ Pagination footer renders 3 regions correctly
14. ✅ Previous/Next disabled at boundaries; page click updates URL via S3 hook
15. ✅ At 1920px / 1280px / 1024px / 768px: page never horizontal-scrolls; table scrolls inside its wrapper at narrowest widths
16. ✅ No raw rgb()/hex/px in any new component file
17. ✅ **Property Strictness:** every CSS property in new code maps to either a token or an explicit Figma JSON property; no invented values
18. ✅ `SubmissionListRow` is internal (not in INDEX)
19. ✅ Throwing inside `SubmissionsListTable` triggers `PanelErrorState` for List region; other 3 regions unaffected
20. ✅ All values in row 1 of the table render exactly: Riverside Unified School District, SUB-7829, EPL/ELL/GL/Cyber, In Review, $102,400, JM John, 92%, 18d, Mar 15

## Out of scope (deferred to S5)

- Loading skeleton refinement
- Empty state polish (Reset CTA)
- aria-sort attributes
- Keyboard nav through rows
- Pagination ellipsis pattern for >7 pages
- Row hover/click affordance beyond cursor
- Detail page navigation
