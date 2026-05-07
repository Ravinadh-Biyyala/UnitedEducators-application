# Dashboard — Phase 3: KPI Cards Row

> **Status:** spec ready
> **Previous:** Phase 1 (shell) implemented · Phase 2 (page skeleton) implicitly done
> **Next:** Phase 4 (Submissions table panel)

## 1. Goal

The KPI row currently renders 5 stub cards via `KpiRowContainer` → `KpiCard` (presentational). The data flow is correct and the layer separation is right — **this phase is purely visual refinement** to match the Figma design.

The 5 cards remain the same: My In Review, Quoted This Month, Bound This Month, Avg Days to Quote, Hit Ratio (YTD). What changes is how they look — typography, icon treatment, trend line styling, internal spacing, card elevation, border treatment.

This phase does NOT change the data flow, container logic, or which props `KpiCard` accepts. It updates `KpiCard` rendering and `KpiRowContainer` icon wiring only.

## 2. Figma source — read in this exact order

The user has provided 4 Figma links. **Use each one for a specific purpose.** Do not pull the same data from multiple links — each has a defined role:

### Link 1 — Dashboard layout & placement (full page context)
```
https://www.figma.com/design/79XQ7SEn2lCXo84Dy5ngVm/Underwriting-Workbench?node-id=320-49328
```
**Node ID:** `320:49328` (full Dashboard frame)
**Use for:** confirming where the KPI row sits within the page, the row's distance from the page header above, and the gap below before the next section. Do NOT pull card-level styling from this — too much data, will pollute extraction.

### Link 2 — KPI row only
```
https://www.figma.com/design/79XQ7SEn2lCXo84Dy5ngVm/Underwriting-Workbench?node-id=320-49426
```
**Node ID:** `320:49426`
**Use for:** row-level layout — gap between cards, total row width, alignment, whether cards are equal-width or auto-fit. Read auto-layout settings of this frame and replicate them in `KpiRowContainer`.

### Link 3 — Single card (definitive source of truth for card visuals)
```
https://www.figma.com/design/79XQ7SEn2lCXo84Dy5ngVm/Underwriting-Workbench?node-id=320-49427
```
**Node ID:** `320:49427`
**Use for:** EVERYTHING about a single card's appearance:
- Card background, border, border-radius, shadow/elevation
- Internal padding (top, right, bottom, left — likely auto-layout)
- Label typography (font family, size, weight, letter-spacing, color, transform — uppercase or not)
- Value typography (the large number — font family, size, weight, color)
- Sub-text and trend typography
- Icon container — background fill, border-radius, dimensions, icon size, icon color
- Spacing between label, value, sub-text (auto-layout gaps)

This is the most important link. Call `get_figma_data` on this node first.

### Link 4 — Dashboard section grouping
```
https://www.figma.com/design/79XQ7SEn2lCXo84Dy5ngVm/Underwriting-Workbench?node-id=320-49414
```
**Node ID:** `320:49414`
**Use for:** any container/section-level styling around the KPI row (background, vertical padding) if it differs from the page-level surface. If this section just inherits page surface color, ignore it for this phase.

### Hard rule — no hardcoded visual values

Every color, spacing, typography, shadow, border-radius value used in `KpiCard` MUST come from `get_figma_data` on the links above. Do NOT guess or eyeball. If a value isn't represented as a Figma variable/style, extract the literal AND add it to `src/theme/tokens.ts` so it's tokenized going forward — then reference the token, not the literal.

### Icon downloads

The card frame at link 3 contains the icon for that specific card. Read the row at link 2 to identify all 5 distinct icons (one per card). Download each via `download_figma_images` to:

```
src/assets/icons/kpi/in-review.svg
src/assets/icons/kpi/quoted.svg
src/assets/icons/kpi/bound.svg
src/assets/icons/kpi/days-to-quote.svg
src/assets/icons/kpi/hit-ratio.svg
```

Filenames follow card semantics, not Figma node names. If you can't determine which icon belongs to which card from the Figma data, ask before guessing.

## 3. Scope — files to create or modify

| Path | Purpose | Status |
|---|---|---|
| `src/components/domain/KpiCard/KpiCard.tsx` | Refine visual rendering — labels, values, icon slot, trend styling | modify |
| `src/components/domain/KpiCard/index.ts` | Barrel — only modify if export name changes (it shouldn't) | no change expected |
| `src/containers/dashboard/KpiRowContainer.tsx` | Pass icon prop to each KpiCard; row gap/grid from Figma row data | modify |
| `src/assets/icons/kpi/*.svg` × 5 | KPI icons downloaded from Figma | create |
| `src/theme/tokens.ts` | Add any color/spacing/typography tokens extracted from Figma if missing | modify (only if needed) |
| `tailwind.config.ts` | Mirror token additions if any | modify (only if needed) |

> **Files NOT to touch:** `services/dashboard/dashboardApi.ts`, `store/slices/dashboardFiltersSlice.ts`, `features/dashboard/pages/DashboardPage.tsx`, anything in `components/layout/` or `components/common/`.

## 4. Data + behavior

No data changes. The container continues to call `useGetKpisQuery()` and pass values to 5 `KpiCard` instances. What's added:

### `KpiCard` prop additions

The component currently accepts `{ label, value, sub?, trend? }`. Add one optional prop:

```ts
{
  label: string;
  value: ReactNode;
  sub?: string;
  trend?: string;
  icon?: ReactNode;     // ← NEW: icon shown per Figma card layout
}
```

Keep all existing props backward-compatible (no required-prop changes).

### `KpiRowContainer` icon wiring

Each of the 5 cards gets a different icon from `src/assets/icons/kpi/`. Import as React components using `vite-plugin-svgr` (already in `package.json`):

```ts
import InReviewIcon from '@/assets/icons/kpi/in-review.svg?react';
```

Pass each via the new `icon` prop on its corresponding `KpiCard`.

### Trend line color logic

The `trend` prop is just a string (e.g., `"+1 vs. last month"` or `"+6pp vs. last year"`). Render trend in the positive (green) color from Figma if the string starts with `+`, otherwise in the neutral/muted text color from Figma. If Figma shows a different color for negative trends, follow Figma — but only set up the conditional, don't hardcode actual data scenarios.

## 5. Reuse — components that already exist

Per `INDEX.md`:

| Component | Source path | How used |
|---|---|---|
| `Card` | `@/components/common` | `KpiCard` already wraps it — keep that |
| `useGetKpisQuery` | `@/services/dashboard` | Already wired in container — no change |
| `formatCurrency`, `formatPercent` | `@/shared/utils` | Already used for value formatting — no change |
| Theme tokens | `@/theme` | All design values reference tokens, never hex literals |

Do not create new components in this phase. The icon is just an SVG passed as a prop, not a new component.

## 6. Acceptance criteria

### Visual (compare against Figma link 3 — single card)
- [ ] Card background, border, border-radius, shadow all match Figma
- [ ] Label uses Figma typography style — font, weight, size, letter-spacing, color, transform
- [ ] Large value (the number) uses Figma's value color and the right weight/size
- [ ] Sub-text and trend text use Figma's secondary text styles
- [ ] Trend with leading `+` rendered in Figma's positive (green) color
- [ ] Icon container matches Figma — background fill, border-radius, dimensions, icon color and size
- [ ] Internal padding and gaps within card match Figma auto-layout values

### Visual (compare against Figma link 2 — row)
- [ ] Row gap between cards matches Figma
- [ ] Cards are equal-width per Figma row layout
- [ ] Total row width and horizontal alignment match

### Visual (compare against Figma link 1 — page)
- [ ] Vertical spacing above the KPI row (under the page header) matches
- [ ] Vertical spacing below the KPI row matches

### Code quality
- [ ] No hex codes anywhere in `KpiCard.tsx` or `KpiRowContainer.tsx` — only token references
- [ ] All extracted Figma values flow through `src/theme/tokens.ts` (and `tailwind.config.ts` if Tailwind utilities are used)
- [ ] All imports use `@/` aliases
- [ ] `KpiCard` props remain backward-compatible (no breaking changes)
- [ ] `KpiCard` does not import Redux, services, or hooks — still purely presentational
- [ ] `KpiRowContainer` is the only file touching the API hook
- [ ] `npm run lint` passes
- [ ] `npm run type-check` passes
- [ ] No console errors

### Layer boundary verification
- [ ] No imports from `@/services/*` in `KpiCard`
- [ ] No `useAppSelector` / `useAppDispatch` in `KpiCard`
- [ ] Icons live in `src/assets/icons/kpi/`, imported via `?react` (svgr) into the container

### Workflow (per CLAUDE.md Step 5)
- [ ] Ran `npm run index` after implementation — INDEX.md regenerated
- [ ] Updated TRACKER.md — Phase 3 row marked `implemented` with today's date
- [ ] Summary returned listing files changed, assumptions made, any unverified criteria

## 7. Out of scope

- Submissions table panel (Phase 4)
- Pipeline chart (Phase 5)
- Tasks / Alerts panels (Phases 6–7)
- Portfolio Snapshot / Team Performance (Phase 8)
- Click behavior on KPI cards (no spec yet — leave as static)
- Tooltips or hover detail panels
- Mobile/tablet layout (desktop ≥1024px only)
