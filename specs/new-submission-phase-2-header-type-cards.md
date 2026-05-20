# New Submission Phase N2 — Header, Submission Type, Sidebar

> Status: spec ready
> Phase track: New Submission (N1–N5)
> Prerequisite: N1 implemented (route mounted, ErrorBoundaries with placeholders, FormProvider context, mocks, S2 implemented for navigation if applicable)

## Goal

Replace the placeholder content in 3 of the 4 N1 ErrorBoundary regions with real visual content:

1. **Header region** — blue band with title, subtitle, breadcrumb, and the auto-generated submission name pill
2. **Form region** (only the topmost section) — "Submission Type" SectionPanel containing 3 selectable type cards
3. **Sidebar region** — Stage Progress panel + Summary Preview panel

The **Actions region** stays as placeholder (yellow Required banner + Create/Cancel buttons land in N5 when validation is fully wired).

This phase introduces **5 new shared atoms** (3 of them in `components/common/`, 2 in `components/domain/`):

- `SectionPanel` — used by every form section across N2/N3/N4 and the sidebar panels
- `StageProgress` — vertical 5-step tracker (sidebar)
- `RequiredFieldsCounter` — small "X/Y" display with progress bar (sidebar, inside Stage Progress)
- `SubmissionTypeCard` (domain) — the 3 selectable cards
- (The form section already has `StatRow` from existing dashboard work — we reuse for Summary Preview rows; no new atom there)

## Out of scope (deferred)

- Required-fields warning banner (yellow Alert) — N3 introduces `Alert` once required-fields validation drives it
- Create Submission + Cancel buttons — N5 wires submit logic
- Form fields (Account & Identity, Policy Dates, etc.) — N3
- Submission Documents — N4
- Underwriting Team — N3

## Visual scope from Figma

Each region maps to specific Figma nodes (provided by user):

| Element | Figma node ID | Role |
|---|---|---|
| Header band (blue strip) | `520-31558` | Title "Create New Submission" + subtitle + back link + name pill |
| Breadcrumb row | `520-31580` | Dashboard / Submissions / New Submission |
| "SUBMISSION TYPE" section header | `520-31595` | The section panel's header bar styling |
| Submission Type body | `520-31594` | The 3-card row container — gap, padding, layout |
| New Business card (selected variant) | `520-31600` | Card in selected state — border, fill tint, "✓ SELECTED" indicator |
| Cross-Sell card (default variant) | `520-31613` | Default state, with cross-sell icon |
| Renewal card (default variant) | `520-31622` | Default state, with renewal icon |
| Submission Stage panel | `520-31992` | Right-column upper panel |
| Summary Preview panel | `520-32063` | Right-column middle panel (uses StatRow rows) |

## Architecture

### Components introduced in N2

```
components/common/SectionPanel/
  SectionPanel.tsx     ← shared atom (used by Submission Type, Stage Progress, Summary Preview, and ALL future form sections)
  index.ts

components/common/StageProgress/
  StageProgress.tsx    ← 5-step vertical tracker (could be reused for any multi-step flow)
  index.ts

components/common/RequiredFieldsCounter/
  RequiredFieldsCounter.tsx
  index.ts

components/domain/SubmissionTypeCard/
  SubmissionTypeCard.tsx
  index.ts
```

### Containers / page-level changes

```
containers/submissions-new/NewSubmissionHeaderContainer.tsx     ← N2 wires the breadcrumb + auto-generated name (subscribes to form via useWatch)
containers/submissions-new/NewSubmissionFormContainer.tsx       ← N2 renders ONLY the Submission Type section (other sections come in N3/N4)
containers/submissions-new/NewSubmissionSidebarContainer.tsx    ← N2 wires Stage Progress + Summary Preview to form state via useWatch

components/domain/NewSubmissionHeader/NewSubmissionHeader.tsx   ← Real implementation
components/domain/NewSubmissionForm/NewSubmissionForm.tsx       ← Real, but renders only Submission Type SectionPanel
components/domain/NewSubmissionSidebar/NewSubmissionSidebar.tsx ← Real, renders 2 SectionPanel children
```

### Files NOT touched

- `NewSubmissionActionsContainer` — stays placeholder
- All N1 service / mock / schema / type files — stay as-is
- `tokens.ts` — appended (cumulative); section 13 expanded with N2 visual tokens

## SectionPanel API

```ts
export interface SectionPanelProps {
  title: string;                     // e.g. "SUBMISSION TYPE"
  badge?: number;                    // optional count badge (used by Documents section in N4 — "3" attached)
  action?: React.ReactNode;          // optional right-side button (e.g. "+ Add Document" in N4)
  children: React.ReactNode;
  className?: string;                // for outer panel margin/spacing only — styling is locked
}
```

Renders:
- White card background
- Header row with title + optional badge + optional action
- Divider between header and body
- Body padding from token

The exact dimensions (header height, padding, divider color) come from figma-rest fetch of `520-31595` (header) and `520-31594` (body).

## SubmissionTypeCard API

```ts
export interface SubmissionTypeCardProps {
  type: SubmissionType;              // 'NewBusiness' | 'CrossSell' | 'Renewal'
  selected: boolean;
  onClick: () => void;
}
```

Internal: looks up `submissionTypeCardData[type]` for icon + title + description.

```ts
// Token map populated from Figma fetch
export const submissionTypeCardData: Record<SubmissionType, {
  iconName: string;        // lucide name from Figma layer
  title: string;           // exact text from Figma
  description: string;     // exact text from Figma
}>;
```

Two visual states:
- **Default** (Cross-Sell, Renewal): outline border, no fill tint, no "✓ SELECTED" indicator
- **Selected** (New Business in Figma): brand-blue border, light fill tint, "✓ SELECTED" indicator at bottom

## StageProgress API

```ts
export interface StageProgressProps {
  currentStage: SubmissionStage;          // drives "Current Stage" pill at top
  completedFields: SubmissionRequiredField[];   // ['account', 'products'] etc. (drives green checks)
  totalRequiredFields: number;            // 4
}

export type SubmissionRequiredField = 'account' | 'products' | 'needByDate' | 'effectiveDate';
```

Renders:
- "CURRENT STAGE" label + stage pill ("Incomplete Submission" — grey, or "Complete Submission" — blue)
- "REQUIRED FIELDS" label + counter (uses `RequiredFieldsCounter`)
- Green progress bar showing completed/total fields
- 4 required-field checkboxes (Account / Products / Need By Date / Effective Date) — each with check icon when complete
- Helper text block ("Stage is automatically assigned…")
- 5-step stage timeline (Intake & Triage → Underwriting → Quoting → Decision → Post-Bind)
  - Each step has a state: `'current' | 'pending'`
  - Current step: blue dot + bold text + right-aligned status pill ("Complete Submission" or "Incomplete Submission")
  - Pending steps: grey dot + grey text

## RequiredFieldsCounter API

```ts
export interface RequiredFieldsCounterProps {
  completed: number;    // 0–4
  total: number;        // 4
}
```

Renders the "X/4" text — completed count in brand color, total in slate.

## Summary Preview (no new atom — uses existing StatRow)

The Summary Preview panel renders inside a `SectionPanel` titled "SUMMARY PREVIEW" with body containing 8 `StatRow` instances:

| Row | Label | Value (when populated) | Value (placeholder) |
|---|---|---|---|
| 1 | NAME | auto-generated name | `—` |
| 2 | TYPE | "New Business" | "New Business" (always set, default selected) |
| 3 | ACCOUNT | account name | `—` |
| 4 | PRODUCTS | "X selected" | `—` |
| 5 | BROKER | brokerage name | `—` |
| 6 | CONTACT | contact name | `—` |
| 7 | EFFECTIVE | YYYY-MM-DD | `—` |
| 8 | STAGE | stage label | "Incomplete Submission" |
| 9 | DOCS | "X attached" | "None" |

(That's 9 rows; the screenshot shows 9 — Name, Type, Account, Products, Broker, Contact, Effective, Stage, Docs.)

For N2: most values are `—` because form fields land in N3. Only "TYPE" and "STAGE" can show real values (TYPE from selected card; STAGE always "Incomplete Submission" until N5 logic).

The container subscribes to form state via `useWatch` and passes derived props to the component. The component is pure render.

## Auto-generated submission name

The header band shows a gold pill with text like `Gwinnett County-New-Business-2026`. Format:
```
{accountShortName}-{submissionTypeLabel.replace(' ', '-')}-{currentYear}
```

Where `accountShortName` is the first part of the account name before " Public Schools" / " ISD" / etc. — strip common suffixes:

```ts
function shortenAccountName(name: string): string {
  return name
    .replace(/\s+Public\s+Schools?$/i, '')
    .replace(/\s+ISD$/i, '')
    .replace(/\s+Unified\s+School\s+District$/i, '')
    .replace(/\s+Charter\s+(Schools?|Network|Academy)$/i, '')
    .replace(/\s+School\s+District$/i, '')
    .replace(/\s+University$/i, '')
    .replace(/\s+Academy$/i, '')
    .trim();
}
```

If no account selected: pill shows nothing OR a placeholder "—". Defer the empty-state styling decision to whatever Figma shows in `520-31558` for the "no account" variant. If Figma only shows the populated state: render an empty state with the pill hidden until an account is selected.

When account changes: pill updates reactively via `useWatch({ name: 'accountId' })` + lookup of account name from `useGetSubmissionsListQuery` data or `useSearchAccountsQuery`. (For N2: just hardcode logic that reads accountId; N3 will add the actual account-search wiring.)

For N2 specifically, since accountId can only be empty (no field exists yet), the pill won't render. Document this behavior in the component, hidden behind a conditional. N3 will activate it.

## Tokens to add (section 13.x — append, do NOT pre-populate without Figma data)

The following token slots are reserved. **Values come ONLY from figma-rest fetch in Step 2 of the prompt.** If Figma JSON doesn't contain a property for any of these, STOP and ask — Property Strictness Rule.

```ts
// 13.a — Header band content (extends newSubmissionRouteDims)
export const newSubmissionHeaderStyles = {
  bandHeight: TBD,                    // from 520-31558
  bandPaddingX: TBD,
  bandPaddingY: TBD,
  bandBg: TBD,                        // expected: colors.brandBlue
  titleSize: TBD,
  titleWeight: TBD,
  titleColor: TBD,                    // expected: colors.white
  subtitleSize: TBD,
  subtitleWeight: TBD,
  subtitleColor: TBD,
  backLinkSize: TBD,
  backLinkColor: TBD,
  backLinkIconSize: TBD,
  namePillBg: TBD,                    // expected: colors.brandGold
  namePillTextColor: TBD,
  namePillIconSize: TBD,
  namePillSize: TBD,
  namePillWeight: TBD,
  namePillPaddingX: TBD,
  namePillPaddingY: TBD,
  namePillHeight: TBD,
} as const;

// 13.b — Breadcrumb
export const newSubmissionBreadcrumbStyles = {
  height: TBD,                        // from 520-31580
  paddingX: TBD,
  paddingY: TBD,
  fontSize: TBD,
  inactiveColor: TBD,
  activeColor: TBD,                   // current page (e.g. brandBlue)
  activeWeight: TBD,
  separatorColor: TBD,
  separatorChar: TBD,                 // '/' likely; verify from JSON characters
  gap: TBD,
} as const;

// 13.c — SectionPanel
export const sectionPanelStyles = {
  bg: TBD,                            // from 520-31595 (header) and 520-31594 (body)
  borderColor: TBD,
  headerHeight: TBD,
  headerPaddingX: TBD,
  headerPaddingY: TBD,
  titleSize: TBD,
  titleWeight: TBD,
  titleColor: TBD,                    // expected: colors.brandBlue
  badgeBg: TBD,
  badgeColor: TBD,
  badgeSize: TBD,
  badgeFontSize: TBD,
  badgeFontWeight: TBD,
  badgePaddingX: TBD,
  badgePaddingY: TBD,
  bodyPaddingX: TBD,
  bodyPaddingY: TBD,
  dividerColor: TBD,
  dividerWidth: TBD,
} as const;

// 13.d — SubmissionTypeCard
export const submissionTypeCardStyles = {
  width: TBD,                         // from 520-31600/31613/31622
  minHeight: TBD,
  paddingX: TBD,
  paddingY: TBD,
  defaultBg: TBD,
  defaultBorderColor: TBD,
  defaultBorderWidth: TBD,
  selectedBg: TBD,                    // light tint
  selectedBorderColor: TBD,           // brandBlue
  selectedBorderWidth: TBD,
  iconBoxSize: TBD,
  iconBoxBg: TBD,
  iconBoxBorderColor: TBD,
  iconSize: TBD,
  iconColor: TBD,
  titleSize: TBD,
  titleWeight: TBD,
  titleColor: TBD,
  descriptionSize: TBD,
  descriptionColor: TBD,
  descriptionLineHeight: TBD,
  selectedIndicatorSize: TBD,
  selectedIndicatorColor: TBD,
  selectedIndicatorWeight: TBD,
  selectedIndicatorIconSize: TBD,
  selectedIndicatorGap: TBD,
  rowGap: TBD,                        // gap between cards in the row
} as const;

export const submissionTypeCardData: Record<SubmissionType, {
  iconName: string;
  title: string;
  description: string;
}> = {
  // Populated from Figma fetch — extract the exact text strings from each card node
  NewBusiness: {
    iconName: TBD,                     // from 520-31600
    title: TBD,
    description: TBD,
  },
  CrossSell: {
    iconName: TBD,                     // from 520-31613
    title: TBD,
    description: TBD,
  },
  Renewal: {
    iconName: TBD,                     // from 520-31622
    title: TBD,
    description: TBD,
  },
};

// 13.e — StageProgress
export const stageProgressStyles = {
  // Header row (CURRENT STAGE label + REQUIRED FIELDS counter)
  headerLabelSize: TBD,
  headerLabelColor: TBD,
  headerLabelWeight: TBD,

  // Current stage pill
  currentStagePillHeight: TBD,
  currentStagePillPaddingX: TBD,
  currentStagePillPaddingY: TBD,
  currentStagePillBgIncomplete: TBD,    // grey when incomplete
  currentStagePillBgComplete: TBD,      // blue when complete
  currentStagePillTextColor: TBD,
  currentStagePillFontSize: TBD,
  currentStagePillFontWeight: TBD,
  currentStageDotSize: TBD,
  currentStageDotColor: TBD,

  // Progress bar
  progressBarHeight: TBD,
  progressBarBg: TBD,
  progressBarFillColorComplete: TBD,
  progressBarFillColorPartial: TBD,

  // Required-field checklist row
  checkRowHeight: TBD,
  checkRowGap: TBD,
  checkIconSize: TBD,
  checkIconColorComplete: TBD,           // green
  checkIconColorIncomplete: TBD,         // grey/light
  checkLabelSize: TBD,
  checkLabelColor: TBD,
  checkLabelWeight: TBD,

  // Helper text block ("Stage is automatically assigned...")
  helperBlockBg: TBD,
  helperBlockBorderColor: TBD,
  helperBlockPaddingX: TBD,
  helperBlockPaddingY: TBD,
  helperBlockTextSize: TBD,
  helperBlockTextColor: TBD,

  // Stage timeline row
  timelineDotSize: TBD,
  timelineDotColorCurrent: TBD,
  timelineDotColorPending: TBD,
  timelineRowHeight: TBD,
  timelineLabelSize: TBD,
  timelineLabelColorCurrent: TBD,
  timelineLabelColorPending: TBD,
  timelineLabelWeight: TBD,
  timelineStatusPillSize: TBD,
  timelineStatusPillColor: TBD,
} as const;

// 13.f — RequiredFieldsCounter
export const requiredFieldsCounterStyles = {
  completedSize: TBD,
  completedColor: TBD,
  completedWeight: TBD,
  totalSize: TBD,
  totalColor: TBD,
  separator: TBD,                       // '/' — extract from Figma text
} as const;
```

## Acceptance criteria

1. ✅ figma-rest MCP: 9 node-specific fetches in Step 2 of the prompt (one per node ID; we use specific node fetches not full-screen)
2. ✅ Property Strictness: every TBD in the token blocks above is filled from JSON, not invented
3. ✅ `npm run lint` passes
4. ✅ `npm run type-check` passes
5. ✅ `npm run index` regenerated; new exports: `SectionPanel`, `StageProgress`, `RequiredFieldsCounter`, `SubmissionTypeCard`
6. ✅ N2 did NOT add to INDEX: `Alert`, `Select`, `MultiSelect`, `DateInput`, `AccountSearchInput`, `FileDropzone` (those are N3/N4)
7. ✅ Header band renders: title "Create New Submission", subtitle "Initiate the underwriting process · Complete all required fields", "← Submissions" back link
8. ✅ Breadcrumb renders: Dashboard / Submissions / New Submission with current page bold + brand-colored
9. ✅ Submission Type SectionPanel renders with 3 cards in a row
10. ✅ Cards: clicking changes selection; selected card shows "✓ SELECTED" indicator + blue border + light fill tint; default cards have outline border
11. ✅ Initial state: New Business is selected (matches form default value)
12. ✅ Stage Progress panel renders: "CURRENT STAGE" label + "Incomplete Submission" pill (grey at start), "REQUIRED FIELDS 0/4", 0% progress bar, 4 unchecked required-field rows, helper text block, 5-step timeline with "Intake & Triage" as current
13. ✅ Summary Preview panel renders 9 StatRow rows; only TYPE shows "New Business", others show "—" or appropriate placeholder
14. ✅ Selecting a different type card updates: header pill (auto-generated name updates IF account is set; for N2 always empty so pill hidden), Summary Preview TYPE row, no other state changes
15. ✅ At 1280px / 1024px / 768px: page never horizontal-scrolls; sidebar stacks below form at narrow widths
16. ✅ No raw rgb()/hex/px in any new component file — every value from a token
17. ✅ No invented properties — every CSS property maps to a token populated from Figma JSON
18. ✅ Throwing inside any 1 of the 3 (now-real) regions triggers `PanelErrorState`; other 2 + Actions still work
19. ✅ NEW_SUBMISSION_TRACKER.md updated: N2 row → implemented; new atoms registered in registry
20. ✅ Confirmation table posted (per prompt)

## What ships visually after N2

`/submissions/new` shows:
- Real blue header band with title, subtitle, breadcrumb, back link
- Real "Submission Type" panel with 3 selectable cards (New Business pre-selected)
- Real Stage Progress panel showing 0/4 required fields complete (it always says 0/4 in N2 since no fields exist yet)
- Real Summary Preview panel with TYPE = "New Business" and the rest as placeholders
- Form region's other sections (Account & Identity, Policy Dates, Broker, Documents, UW Team) and Actions region remain "Loading…" placeholders

## Phase N3 preview

N3 introduces `Alert`, `Select`, `MultiSelect`, `DateInput`, `AccountSearchInput`. Builds out 4 form sections: Account & Identity, Policy Dates, Broker & Contacts, Underwriting Team. Each section uses `SectionPanel` from N2. Validation wires through; Stage Progress's required-field checks become reactive. Summary Preview rows populate as user fills form. Required-fields banner appears.