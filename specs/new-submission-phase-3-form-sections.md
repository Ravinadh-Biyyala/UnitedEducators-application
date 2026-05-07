# New Submission Phase N3 — Form Sections + Required Banner

> Status: spec ready
> Track: N-track. Prerequisite: N1 + N2 implemented.

## Goal

Replace the post-N2 placeholder form region with the full form: Account & Identity, Policy Dates, Broker & Contacts, Underwriting Team. Add the yellow "Required:" banner to the Actions region. After N3 ships, page is fully populated visually except Submission Documents (N4). Form values become reactive — Sidebar StageProgress checkboxes light up, Summary Preview rows mirror form data, required-fields banner updates dynamically.

## Out of scope

Documents (N4), Create/Cancel button wiring + redirect (N5), a11y polish (N5), partial validation polish (N5).

## Visual scope

| # | Node ID | Element | Source for |
|---|---|---|---|
| 1 | `520-31113` | Account & Identity section | Section layout, AccountSearchInput, Group Input, MultiSelect chip styling |
| 2 | `520-31154` | Policy Dates section | 3× DateInput |
| 3 | `520-31199` | Broker & Contacts section | 2× Select, 2× Input (auto-fill readOnly) |
| 4 | `520-15099` | Underwriting Team section | Person Select with Avatar in dropdown |
| 5 | `520-15260` | Required-fields Alert banner | Alert atom (warning variant) |

## Atoms introduced

5 atoms (4 shared + 1 domain). Build each once, reuse everywhere on this page.

```
components/common/Alert/                ← variants: warning/info/error/success
components/common/Select/               ← single-select dropdown
components/common/MultiSelect/          ← multi-select with chips
components/common/DateInput/            ← native date input wrapper
components/domain/AccountSearchInput/   ← typeahead with debounced query
```

NOT added in N3: `FileDropzone` (N4 reserves).

## Existing atoms reused

`FormField` (12+ uses), `Input` (Group, Email, Phone), `Avatar` (UW Team dropdowns), `SectionPanel` (4× section wrappers), `StatRow` (Summary Preview rows already wired in N2 — values become richer), `ErrorBoundary`/`PanelErrorState`.

## Components introduced / updated

NEW domain components — one per form section:

```
components/domain/AccountIdentitySection/
components/domain/PolicyDatesSection/
components/domain/BrokerContactsSection/
components/domain/UnderwritingTeamSection/
```

UPDATED existing:

- `NewSubmissionForm.tsx` — render all 5 sections in order (Submission Type from N2 stays first; 4 new sections follow)
- `NewSubmissionSidebar.tsx` — Summary Preview rows show real values via reactive lookups
- `NewSubmissionHeader.tsx` (via container) — gold name pill becomes reactive (was always-hidden in N2)
- `NewSubmissionActions.tsx` — was placeholder; render Alert + Create/Cancel button stubs (no onClick)

## Atom contracts

### Alert
- Variants: `warning`/`info`/`error`/`success` driving bg, border, icon glyph, icon color
- Props: `variant`, `children`
- Used 1× in N3 (warning); designed for N5 reuse (error/success on submit)

### Select
- Single-select dropdown with optional left icon, placeholder, clear button, custom `renderOption`
- Props: `value`, `onChange`, `options: Array<{id, label, description?}>`, `placeholder?`, `disabled?`, `id?`, `renderOption?`
- States: empty / filled / open / disabled
- A11y minimum: Enter/Space to open, Arrow up/down for options, Enter to select, Escape to close, outside-click to close
- Internals (NOT exported): `SelectTrigger`, `SelectDropdown`, `SelectOption`. Dropdown via Portal to escape SectionPanel overflow.

### MultiSelect
- Multi-select; chips inside trigger; checkmark on selected options; helper text "X selected" below
- Props: same as Select but `value: string[]` and no `renderOption`
- Click option → toggles in/out (does NOT close dropdown). Click chip × → removes one without opening dropdown.
- Internals (NOT exported): `MultiSelectTrigger`, `MultiSelectChip`, `MultiSelectDropdown`

### DateInput
- Wraps native `<input type="date">` with calendar icon prefix
- Props: `value` (ISO `YYYY-MM-DD`), `onChange`, `min?`, `max?`, `disabled?`, `id?`
- Wrapper has the styling; native chrome is suppressed unless Figma JSON shows otherwise

### AccountSearchInput
- Typeahead with 300ms debounced `useSearchAccountsQuery`
- Props: `value: string | null` (accountId), `onChange: (id, account) => void`, `id?`
- States: empty / typing (dropdown with results) / loading / selected (read-only-like display + secondary line + clear ×)
- Dropdown row: name (primary, bold) + secondary line (city · state · type — exact format from Figma)
- Selected state shows account.name in input + secondary line below + green check + "Account #N resolved" (extract exact string from Figma JSON)
- Internal state: `useState` for query string and dropdown open. Outside-click + Escape close. Selected accountId is the only thing in RHF form state.

## Form integration per section

### Account & Identity
Vertical stack:
- `AccountSearchInput` via `<Controller name="accountId">`
- (If Figma shows it inside `520-31113`) auto-generated submission name read-only display
- 2-col grid (md+, collapses to 1-col): Group `Input` (`register('group')`) + Product Lines `MultiSelect` via `<Controller name="productLines">` with options from `SUBMISSIONS_PRODUCT_LINES_DISPLAY_ORDER`

### Policy Dates
3-col grid (md+, collapses): need-by / effective / expiration via `<Controller>`+`DateInput` each.

Cross-field:
- `effective.min = needByDate || undefined`
- `expiration.min = effectiveDate || undefined`

Auto-default for expiration:
- Component-internal `useRef<boolean>` flag `userEditedExpiration` (defaults false)
- `useEffect` watching `effectiveDate`: if `effectiveDate` set AND (`expirationDate` empty OR `userEditedExpiration === false`) → `setValue('expirationDate', effectiveDate + 1 year)`
- `expiration.onChange`: set `userEditedExpiration.current = true`
- Helper text under expiration FormField: extract verbatim from Figma (likely "Auto-set to +1 year from effective")

### Broker & Contacts
2 rows of 2-col grid:
- Row 1: Brokerage Select + Broker Contact Select (disabled until brokerage selected; placeholder "Select a brokerage first" when disabled)
- Row 2: Email Input + Phone Input (readOnly when contact selected, populated by auto-fill)

Auto-fill effect:
- `useEffect` watching `brokerContactId`: when set → look up contact in brokerage's contacts → `setValue('brokerEmail', email)` + `setValue('brokerPhone', phone)`. When cleared → clear both.

Helper texts (extract verbatim from Figma):
- Under Brokerage when selected: "X contact(s) available"
- Under Broker Contact when selected: green check + "Contact details auto-filled below"

`renderOption` for Brokerage: name (primary) + contact count (secondary). For Contact: name (primary) + email (secondary).

### Underwriting Team
2-col grid: Underwriter Select + Underwriting Specialist Select.

Options:
- Underwriter: `useGetUnderwritersQuery()` filtered by `role === 'underwriter'` (5 entries)
- Specialist: same query filtered by `role === 'specialist'` (5 entries)

`renderOption`: Avatar (initials from name) + name. Trigger when populated shows just name (verify against Figma; if Figma shows Avatar in trigger too, replicate).

### Required-fields banner

Lives in Actions region. Reactive to form values. Rendered only when missing fields > 0.

Content format: "**Required:** {oxfordCommaJoin(missing)}." with "Required:" in heavier weight than rest.

Oxford-comma:
- 1 item: "X"
- 2 items: "X and Y"
- 3+ items: "X, Y, and Z"

Helper utility: `src/features/submissions-new/utils/getMissingRequiredFields.ts` exporting `getMissingRequiredFieldsLabels(values: NewSubmissionFormValues): string[]` returning unfilled labels in order: `Account Name`, `Product Line(s)`, `Need By Date`, `Effective Date`.

## Sidebar reactive updates

| Row | N2 value | N3 value |
|---|---|---|
| NAME | `—` | Generated name if accountId set (lookup + `generateSubmissionName`); `—` otherwise |
| TYPE | `submissionTypeLabels[type]` | unchanged |
| ACCOUNT | `—` | account.name from selected; `—` otherwise |
| PRODUCTS | `—` | `"X selected"` if productLines.length > 0; `—` otherwise |
| BROKER | `—` | brokerage.name from selected; `—` otherwise |
| CONTACT | `—` | contact.name from selected; `—` otherwise |
| EFFECTIVE | `—` | `effectiveDate` ISO string; `—` otherwise |
| STAGE | "Incomplete Submission" | unchanged |
| DOCS | "None" | unchanged (N4 populates) |

Lookup approach: use the same hooks the form uses (`useSearchAccountsQuery({ q: '' })` for accounts, `useGetBrokeragesQuery()` for brokerages — RTK Query dedupes; multiple consumers share cache). For deeper-paged accounts, fall back to `'Loading…'` or raw ID briefly.

## Header reactive name pill

Container subscribes to `accountId` + `type`. When accountId set: look up account → `generateSubmissionName({ accountName, type, year })` → pass to component as `generatedName`. When unset: pass `null`, pill stays hidden (N2 behavior preserved).

## RHF integration patterns

| Field | Pattern |
|---|---|
| `accountId` | `<Controller>` → `AccountSearchInput` |
| `productLines` | `<Controller>` → `MultiSelect` |
| `needByDate` / `effectiveDate` / `expirationDate` | `<Controller>` → `DateInput` |
| `brokerageId` / `brokerContactId` | `<Controller>` → `Select` |
| `underwriterId` / `underwritingSpecialistId` | `<Controller>` → `Select` |
| `group` | `register('group')` → `Input` (uncontrolled) |
| `brokerEmail` / `brokerPhone` | `register(...)` → `Input` (managed via `setValue` from auto-fill) |

## Validation in N3

- Schema runs `onBlur` per N1's `useForm({ mode: 'onBlur' })`
- Inline errors via `FormField`'s `error` prop reading `formState.errors[fieldName]?.message`
- Cross-field refines (need-by ≤ effective < expiration) surface on dependent fields per N1's schema
- Required-fields banner is independent of zod errors — it indicates "what's still missing", not "what's invalid"

## Tokens (section 13.g–13.k)

All TBD until figma-rest fetch. Per Property Strictness Rule, every value comes from JSON.

```ts
// 13.g — Alert (variant-keyed)
alertStyles = {
  warning: { bg, borderColor, iconName, iconColor, textColor, ... },
  info:    { ... },   // populated from colors.* family if Figma doesn't show variant
  error:   { ... },
  success: { ... },
  // Shared dimensions
  paddingX, paddingY, iconSize, borderWidth, iconTextGap,
  fontSize, fontWeight, lineHeight, labelFontWeight (heavier "Required:" lead-in),
}

// 13.h — Select trigger + dropdown
selectStyles = {
  // Trigger
  triggerHeight, triggerPaddingX, triggerBorderColor, triggerBorderWidth,
  triggerBg, triggerTextColor, triggerPlaceholderColor, triggerFontSize,
  triggerIconSize (chevron), triggerIconColor,
  triggerLeftIconSize (optional left), triggerLeftIconColor, triggerGap,
  // Dropdown
  dropdownBg, dropdownBorderColor, dropdownBorderWidth, dropdownMaxHeight,
  dropdownItemHeight, dropdownItemPaddingX, dropdownItemPaddingY, dropdownItemGap,
  dropdownItemFontSize, dropdownItemTextColor,
  dropdownItemHoverBg, dropdownItemSelectedBg, dropdownItemSelectedTextColor,
  dropdownItemSelectedIconColor,
  dropdownDescriptionColor, dropdownDescriptionSize,
  // Disabled
  disabledOpacity,
}

// 13.i — MultiSelect (extends select; chip styling specific)
multiSelectStyles = {
  triggerMinHeight, triggerPaddingX, triggerPaddingY,
  chipBg, chipTextColor, chipFontSize, chipFontWeight,
  chipPaddingX, chipPaddingY, chipHeight, chipGap, chipRowGap,
  chipRemoveIconSize, chipRemoveIconColor,
  helperTextColor, helperTextSize,
  optionCheckIconSize, optionCheckIconColor,
}

// 13.j — DateInput
dateInputStyles = {
  height, paddingX, borderColor, borderWidth, bg,
  fontSize, textColor, placeholderColor,
  iconSize (calendar), iconColor, iconLeftPadding, inputLeftPadding,
}

// 13.k — AccountSearchInput (extends select dropdown patterns)
accountSearchInputStyles = {
  iconSize (building prefix), iconColor,
  resultPrimarySize, resultPrimaryColor, resultPrimaryWeight,
  resultSecondarySize, resultSecondaryColor,
  resultSeparator (· or , — extract from Figma),
  selectedSecondarySize, selectedSecondaryColor,
}
```

## Acceptance criteria

1. All 5 figma-rest node fetches done (520-31113, 520-31154, 520-31199, 520-15099, 520-15260) + JSON Property Dump posted
2. Property Strictness: every TBD filled from JSON
3. lint + type-check pass
4. INDEX adds: `Alert`, `Select`, `MultiSelect`, `DateInput`, `AccountSearchInput`
5. INDEX does NOT add: `FileDropzone`
6. Account search: 300ms debounce, returns top 10, click selects, secondary line shows city · state · type
7. Account selection populates header gold pill with generated name; clear hides it
8. Group input populates RHF state (verifiable in DevTools)
9. MultiSelect: open → check 3 → trigger shows 3 chips → "3 selected" helper → Sidebar PRODUCTS shows "3 selected" → click chip × removes one
10. Date validation: need-by > effective triggers refine error on effective; effective ≥ expiration triggers refine error on expiration
11. Effective auto-defaults expiration to +1 year on first set; manual edit stops auto-default
12. Brokerage select shows 8 brokerages; selection enables Contact select with brokerage's contacts
13. Contact selection auto-fills email + phone (readOnly); clearing brokerage clears all 4 fields
14. Underwriter and Specialist Selects show 5 each with Avatar in dropdown options
15. Required-fields banner: hidden when 4/4 complete; shown otherwise with Oxford-comma list
16. StageProgress checkboxes light up green as fields populate; pill changes from grey "Incomplete" to blue "Complete" at 4/4
17. Summary Preview rows reactive: NAME / ACCOUNT / PRODUCTS / BROKER / CONTACT / EFFECTIVE all populate; TYPE / STAGE / DOCS unchanged from N2
18. 1280/1024/768: no horizontal scroll; field grids collapse 2-col → 1-col; sidebar stacks below form
19. No raw rgb()/hex/px in any new file
20. Throwing inside any 1 form section's component → that region's parent ErrorBoundary catches; rest of form works
21. NEW_SUBMISSION_TRACKER.md row N3 → implemented; new atoms in registry

## What ships after N3

Form is fully functional except documents and submit. User can search accounts, see auto-generated name in header, pick products + dates with cross-field validation, pick brokerage with auto-fill, pick UW team. Banner + Stage Progress + Summary Preview all reactive.