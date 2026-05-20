# New Submission Tracker

> Combined tracker for both submissions phase tracks.
>
> **Two phase tracks:**
> - **S-track (S1–S5)**: Submissions list page (`/submissions`)
> - **N-track (N1–N5)**: New Submission form page (`/submissions/new`)

## S-track — Submissions list page

| # | Phase | Status | Spec file | Run? |
|---|---|---|---|---|
| S1 | Foundation & Route | implemented | `submissions-phase-1-foundation.md` | [x] |
| S2 | Header (blue band + KPI tiles + buttons) | spec ready | `submissions-phase-2-header.md` | [ ] |
| S3 | Scope Tabs + **Filters Drawer** | spec ready | `submissions-phase-3-tabs-filters.md` | [ ] |
| S4 | List Table (sortable + pagination + atoms) | rework needed (see `s4-rework-prompt.md`) | `submissions-phase-4-list-table.md` | [⚠] |
| S5 | Polish (loading skeletons, empty state, a11y) | planned | `submissions-phase-5-polish.md` | [ ] |

## N-track — New Submission form page

| # | Phase | Status | Spec file | Run? |
|---|---|---|---|---|
| N1 | Foundation & Route + RHF/zod scaffold | spec ready | `new-submission-phase-1-foundation.md` | [ ] |
| N2 | Header + Submission Type cards + Sidebar (Stage Progress + Summary Preview) | spec ready | `new-submission-phase-2-header-type-cards.md` | [ ] |
| N3 | Form sections (Account, Policy Dates, Broker, UW Team) + Required banner + introduces `Alert` / `Select` / `MultiSelect` / `DateInput` / `AccountSearchInput` | spec ready | `new-submission-phase-3-form-sections.md` | [ ] |
| N4 | Submission Documents (drag-drop + file list) + introduces `FileDropzone` | spec ready | `new-submission-phase-4-documents.md` | [ ] |
| N5 | Submit + redirect + validation polish + a11y | planned | `new-submission-phase-5-submit-polish.md` | [ ] |

## Notes

- **2026-05-03 (S1):** Foundation route at `/submissions`. Mocks return data. PascalCase status refactor.

- **2026-05-04 (Design v2):** Filter sidebar replaced by drawer. Pagination format updated. TopBar gains "+ New" button. My Queue is default scope.

- **2026-05-04 (figma-rest MCP available):** Each phase makes ≤2 MCP calls in default pattern. **Updated 2026-05-05:** higher-precision phases use node-specific fetches.

- **2026-05-04 (Universal rules locked):** Responsive support tier, Property Strictness Rule, figma-rest usage pattern.

- **2026-05-04 (S2/S3/S4 specs ready).**

- **2026-05-04 (N1 spec ready, rev 2):** RHF + zod scaffold. Mock data inlined verbatim.

- **2026-05-05 (S4 rework needed):** First S4 implementation diverged from Figma in 10 specific ways. Rework prompt at `s4-rework-prompt.md`.

- **2026-05-05 (N2 spec ready):** Builds visual content for header, Submission Type cards, sidebar. 9 user-provided node IDs. Introduces `SectionPanel`, `StageProgress`, `RequiredFieldsCounter`, `SubmissionTypeCard`.

- **2026-05-05 (Code samples removed from prompts):** N2 prompt rev 2 removes JSX implementation samples per user feedback. Specs use behavioral contracts only. N3 and N4 prompts follow same convention.

- **2026-05-05 (N3 spec ready, PENDING):** Form sections phase. 3 of 5 node IDs received. Introduces `Alert`, `Select`, `MultiSelect`, `DateInput`, `AccountSearchInput`. Atom styling inferred from section context. 300ms debounced typeahead.

- **2026-05-05 (Token optimization on N3):** N3 spec + prompt reduced from 62 KB to 36 KB (-42%) without compromising accuracy gates. Pattern: state hard rules once in tracker, behavioral contracts not full prose, compress confirmation tables, remove duplicate ambiguity sections. Applied to N4 from start.

- **2026-05-05 (N4 spec ready):** Submission Documents phase. 5 user-provided node IDs (`520-31072`, `520-31261`, `520-15008`, `520-15009`, `520-14407`). Introduces `FileDropzone`. Eager upload pattern (each file uploads on drop). Per-file error state with retry. Mock includes deterministic failure trigger via filename containing "fail". Schema breaking change: `documentIds: string[]` → `documents: UploadedDocument[]`. Forward-compatible with Azure Blob + presigned URL flow.

- **2026-05-05 (N3 unblocked):** User provided remaining 2 node IDs: Underwriting Team section = `520-15099`, Required-fields Alert banner = `520-15260`. N3 spec/prompt updated; ready to run end-to-end. Recommended run order: N3 → N4 (since N4 was paused waiting on N3 atoms).

## Reuse-First Rule (universal)

Before writing ANY label, input, button, dropdown, card-with-header, or row-with-label-and-value: check `INDEX.md` for an existing atom. If something exists, reuse. Don't build parallels.

### Existing reusable atoms (verify in INDEX before each phase)

| Atom | Path | Used for |
|---|---|---|
| `FormField` | `components/common/FormField/` | Every form input wrapper (label + asterisk + helper + error) |
| `Input` | `components/common/Input/` | Text/email/tel inputs |
| `Button` | `components/common/Button/` | All buttons |
| `Avatar` | `components/common/Avatar/` | Person dropdown items, assigned-to cells |
| `StatRow` | `components/common/StatRow/` | Label/value rows (Summary Preview, etc.) |
| `ErrorBoundary` | `components/common/ErrorBoundary/` | Region wrappers |
| `PanelErrorState` | `components/common/PanelErrorState/` | Region error fallback |
| `StatusBadge` | `components/domain/StatusBadge/` | Status pills (PascalCase variants) |
| `KpiCard` | `components/domain/KpiCard/` | Dashboard KPI panels |
| `CardShell` | `components/common/CardShell/` | Universal panel wrapper (dashboard) |
| `SegmentedTabs` | `components/common/SegmentedTabs/` | Already exists from dashboard |
| `EmptyState` | `components/common/EmptyState/` | Empty result placeholders |

### Wrong patterns — automatic rework

❌ Inline `<label>` + `<input>` markup → use `FormField`
❌ White-card-with-header inline → use `SectionPanel` (N2+)
❌ Bespoke selects → use `Select` / `MultiSelect` (N3+)
❌ Hand-rolled date input → use `DateInput` (N3+)
❌ Inline label/value rows → use `StatRow`
❌ Per-phase reimplementation of an atom that already exists
❌ Pre-written JSX in implementation prompts (added 2026-05-05) — use behavioral contracts only

## Property Strictness Rule (universal)

For every CSS property in any phase's implementation, you MUST point to either:
- (a) an existing token in `tokens.ts` mapping to a Figma property, OR
- (b) an explicit property in figma-rest JSON

If neither: **STOP and ask.** No invented values.

### Common traps

| CSS property | Figma JSON key | When key absent |
|---|---|---|
| `border-radius` | `cornerRadius` | NO border-radius. Sharp corners. |
| `border` (any side) | `strokes[]` non-empty | NO border. |
| `box-shadow` | `effects[type=DROP_SHADOW]` | NO shadow. |
| Inner padding | Auto-layout `paddingLeft/Right/Top/Bottom` | Use 0 / omit. |
| `letter-spacing` | `letterSpacing` | NO override. |
| `text-transform` | `textCase` | NO override. |
| `font-family` | `fontName.family` | Inherit. |
| `opacity` | `opacity` | Use only explicit. |

### Allowed exceptions (interaction states only)

- `cursor: pointer` on clickable elements
- `hover:opacity-80` on buttons (conservative)
- `focus-visible:ring-2 focus-visible:ring-blue-500` Tailwind default

Anything more elaborate → ask first.

## figma-rest MCP usage pattern

### Default (most phases)

Step 1 makes ≤2 calls — one JSON of screen frame + one rendered PNG. JSON is source of truth; PNG is verification only.

### High-precision pattern

When user provides specific node IDs per element, fetch one JSON per node ID (5-9 calls). Used in N2, N3, N4. Trades MCP-call count for property precision.

### Atom-styling inference

When user provides node IDs for sections (not separate atom variants), Claude infers atom styling from atom's appearance inside the section. Saves MCP calls; works because atom is shown in real use context. STOP and ask if two instances of the same atom show different styling.

After Step 1 (or Step 2 for high-precision), no more MCP calls. If a property is missing mid-implementation, STOP and ask.

## Responsive support tier

- Desktop ≥1280px (`xl:`) — pixel-perfect Figma
- Laptop 1024–1279px (`lg:`) — same layout, slight compression
- Tablet 768–1023px (`md:`) — adapted layout, content scrolls if needed
- <768px — **not supported**

### Universal rules

1. No fixed pixel widths on layout containers
2. Content adapts; if it can't, scrolls inside its wrapper
3. At wide viewports, don't waste space (max-w-[1600px] mx-auto where appropriate)
4. No layout reflows or hamburger transformations between supported tiers
5. Tailwind utilities or CSS clamp() only — no hand-written `@media`

## Status legend

- **planned** — not yet specced
- **spec ready** — PRD written, ready to run
- **spec ready (PENDING)** — spec written but blocked on user input
- **in progress** — Claude generating / iterating
- **implemented** — code merged, lint + type-check pass, visually matches Figma
- **rework needed** — code merged but visual divergences identified

## When to STOP and ask (universal protocol)

Stop and surface — don't guess — when:
- A reusable atom listed in spec doesn't exist in INDEX.md
- A figma-rest JSON property has no obvious token mapping
- Two instances of the same atom show different styling within their sections
- A text string from Figma contains characters you can't reproduce reliably
- A Lucide icon name from a Figma layer doesn't exist in lucide-react
- Required-input from user (node IDs etc.) hasn't been provided
- A schema/breaking change might affect files outside the expected list (verify via grep)
- Figma doesn't show a state your contract requires (drag-over, error, hover)

The phase precision only pays off if you stop on the first ambiguity.

## Cross-track shared atom registry

### Existing atoms (predate this tracker)

`FormField`, `Input`, `Button`, `Avatar`, `StatRow`, `ErrorBoundary`, `PanelErrorState`, `StatusBadge`, `KpiCard`, `CardShell`, `SegmentedTabs`, `EmptyState`, `CountBadge`, `ChartLegend`

### Added by S-track

- `Drawer` (S3)
- `Pagination` (S4)
- `SortableColumnHeader` (S4)
- `ProductChips` (S4)
- `AppetiteBar` (S4)

### Added by N-track

- `SectionPanel` (N2)
- `StageProgress` (N2)
- `RequiredFieldsCounter` (N2)
- `SubmissionTypeCard` (N2 — domain)
- `Alert` (N3)
- `Select` (N3)
- `MultiSelect` (N3)
- `DateInput` (N3)
- `AccountSearchInput` (N3 — domain)
- `FileDropzone` (N4)

## Dependencies between phases

```
S-track:                           N-track:
S1 (Foundation) ✓                  N1 (Foundation)         ← spec ready
   └─► S2 (Header)                    └─► N2 (Header+Sidebar+atoms)  ← spec ready
   └─► S3 (Tabs+Drawer)                  └─► N3 (Form sections+atoms) ← spec ready
   └─► S4 (Table) ⚠ rework               └─► N4 (Documents+FileDropzone) ← spec ready
          └─► S5 (Polish)                       └─► N5 (Submit+Polish)
```

### Cross-track dependencies

- N1 depends on S1 + S2 (loosely): S1 for shell + ErrorBoundary; S2 for "+ New Submission" button to navigate
- N1 introduces shared deps: `react-hook-form`, `zod`, `@hookform/resolvers`
- S3's `Drawer` reusable in N-track if needed (not currently planned)

## What ships visually after each phase

### S-track

- After S1 (✓): `/submissions` route renders. 4 placeholder regions. Mocks return data.
- After S2: Blue header band fully rendered.
- After S3: Scope tabs + Filters drawer functional.
- After S4: Full data table with pagination.
- After S5: Polish, empty state, a11y.

### N-track

- After N1: `/submissions/new` route. 4 placeholder regions in 2-column grid. RHF+zod scaffold.
- After N2: Header band + Type cards + Stage Progress + Summary Preview.
- After N3: All form fields functional except documents. Validation + auto-fill + reactive sidebar working.
- After N4: Documents drag-drop with eager upload, retry, view, remove. DOCS row reactive.
- After N5: Create button POSTs, success → redirect, error toast. Cancel confirmation. Final a11y.

## What to do if a phase fails

1. Don't restart — paste failures back, ask Claude to fix specifics
2. If Claude keeps getting one thing wrong, update CLAUDE.md or the prompt
3. Worst case: revert (`git checkout .`) and re-run with clarified spec
4. For visual drift: write a rework prompt listing each divergence (see `s4-rework-prompt.md`)

## Future phases (not yet planned)

- **Submission Detail** (`/submissions/:id`) — first phase with mutations + read.
- **Bulk actions** — multi-select on table rows.
- **Saved filter views** — URL-shareable presets (note: pending decision on URL state convention).
- **Export to CSV/XLSX** — wire the Export button.
- **Fancy date picker** — replace native `<input type="date">`.
- **Account create flow** — when typed name not in mock, offer to create new.