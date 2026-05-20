# Submissions Phase S2 — Header (blue band)

> Status: spec ready
> Phase track: Submissions (S1–S5)
> Prerequisite: S1 implemented — `SubmissionsPage`, 4 ErrorBoundary regions, `useGetSubmissionsHeaderQuery` returning mock stats

## Goal

Replace the S1 placeholder in the header region with the real blue header band: page title, subtitle, two action buttons (Export, New Submission), and 5 KPI tiles. After this phase ships, navigating to `/submissions` shows a fully-rendered header band on top, with the other 3 regions still showing "Loading…" placeholders.

## Visual scope

Three sub-regions, top to bottom of the band:

1. **Title block** (left)
   - "Submissions" — H1, white, bold, 22px
   - "Education insurance underwriting pipeline · {N} total submissions" — subtitle, white, regular, 13px
   - The total count comes from `stats.totalSubmissions`

2. **Action buttons** (right of title block, same row at desktop)
   - **Export** — white outline, transparent fill, white text, `Download` icon (lucide), 90×36
   - **New Submission** — gold fill (`brandGold`), white text, `Plus` icon (lucide), 152×35, gold shadow
   - Both currently no-op (no detail page or export logic yet — rule 4 below)

3. **KPI tiles row** (full width, below the title+buttons row)
   - 5 tiles in `SUBMISSIONS_HEADER_TILES_DISPLAY_ORDER`
   - Each tile: label (uppercase, 9px, semibold, white) + value (18px, bold, white)
   - Format per `submissionsHeaderTileFormat`: 4 are `count`, `boundPremiumYtd` is `currencyCompact` (e.g. `$552,200` or `$552K` depending on existing `formatCurrency` behavior — match what dashboard already does)

## Responsive plan

Header band must work on desktop, laptop, and tablet (≥768px). Mobile (<768px) not supported per project decision.

| Breakpoint | Tailwind | Layout |
|---|---|---|
| Desktop ≥1280px | `xl:` | Title + buttons in one row, 5 KPI tiles in one row at fixed 182px |
| Laptop 1024–1279px | `lg:` | Same as desktop, tiles compress via `min-w-[140px]` and `flex-1` |
| Tablet 768–1023px | `md:` | Title + buttons stack vertically OR remain in row if width allows; KPI tiles wrap to **3+2** layout via grid |
| <768px | — | Out of scope. Acceptable to overflow horizontally. |

Use Tailwind utilities only — no hand-written `@media` queries. Use flex/grid with `min-width` constraints rather than fixed widths where practical.

## Architecture

Container reads the query, component renders pure JSX. Internal `HeaderKpiTile` is non-exported (lives inside `SubmissionsHeader.tsx`).

```
SubmissionsHeaderContainer
  └─ useGetSubmissionsHeaderQuery()
  └─ <SubmissionsHeader stats={data} isLoading={isLoading} />

SubmissionsHeader.tsx
  ├─ Title block
  ├─ ExportButton (internal)
  ├─ NewSubmissionButton (internal)
  └─ HeaderKpiTile × 5 (internal, mapped over DISPLAY_ORDER)
```

## Files to create / edit

### Edit
- `src/containers/submissions/SubmissionsHeaderContainer.tsx` — replace placeholder render with real component call (already wired to query in S1)
- `src/components/domain/SubmissionsHeader/SubmissionsHeader.tsx` — replace placeholder div with real implementation

### Possibly add (only if figma-rest fetch reveals missing values)
- `src/theme/tokens.ts` — add `submissionsHeaderButtonStyles.iconTextGap` if Figma shows a specific value distinct from existing flex gap

### Do NOT create
- `HeaderKpiTile.tsx` as separate file — inline inside `SubmissionsHeader.tsx`
- `index.ts` re-exports for internal subcomponents
- INDEX entries for non-exported tiles/buttons

## Component prop contracts

```ts
// SubmissionsHeader.tsx (already typed from S1, just verify)
interface SubmissionsHeaderProps {
  stats?: SubmissionsHeaderStats;
  isLoading?: boolean;
}

// Internal — not exported
interface HeaderKpiTileProps {
  tileKey: SubmissionsHeaderTileKey;
  value: number;
}
```

## Loading state

Show a 5-tile skeleton when `isLoading && !stats` (use the same dimensions as real tiles, replace text with grey shimmer blocks). Keep the title and buttons rendered (no need to skeleton the static parts). S5 will replace this with a more polished skeleton system.

For S2 a minimal skeleton is fine: render the tile shell with `bg-white/10 animate-pulse` for label and value placeholders.

## Empty / error state

Container's existing `if (isError) throw new Error(...)` from S1 is sufficient — ErrorBoundary catches and renders `PanelErrorState`. No additional handling needed at S2.

## Acceptance criteria

1. ✅ `npm run lint` passes
2. ✅ `npm run type-check` passes
3. ✅ `/submissions` renders blue header band matching Figma at 1280px viewport (compare side-by-side with Figma frame)
4. ✅ At 1280px: title + buttons in one row, 5 KPI tiles in one row at 182px each
5. ✅ At 1024px: same row layout, tiles slightly compressed but all 5 visible
6. ✅ At 900px (tablet): tiles wrap to 2 rows (3+2 or 2+3), no horizontal scroll on the band
7. ✅ Title shows real total: `Education insurance underwriting pipeline · 18 total submissions` (where 18 comes from mock)
8. ✅ All 5 KPI tile values match mock: 18, 5, 3, 3, $552,200 (or `$552K` if `currencyCompact` uses K-suffix)
9. ✅ Export button shows Download icon + "Export" text, white outline
10. ✅ New Submission button shows Plus icon + "New Submission" text, gold fill, gold shadow
11. ✅ Both buttons are clickable (cursor-pointer, hover state) but their onClick is no-op for now
12. ✅ No raw `rgb()`/hex/px in the new component file — all from tokens
13. ✅ Loading skeleton renders for ~50–150ms during initial mock fetch (visible in dev)
14. ✅ Throwing inside the container still triggers `PanelErrorState` (regression check)
15. ✅ Other 3 regions still show "Loading…" placeholders unchanged

## Out of scope (deferred)

- Wiring the Export button to actual export logic (post-S5, separate phase)
- Wiring the New Submission button to a detail/create page (S6+)
- Real loading skeleton (S5)
- Aria labels / focus management (S5)

## Phase S3 preview (next)

S3 implements scope tabs (My Queue / My Team / All Submissions) + the new **Filters drawer** (replacing the v1 sidebar). This will introduce a `Drawer` primitive shared atom and the URL-state pattern for all 8 filter groups.