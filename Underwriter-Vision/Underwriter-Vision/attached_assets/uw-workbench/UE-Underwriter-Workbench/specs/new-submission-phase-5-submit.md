# New Submission Phase N5 — Submit + Redirect + Cancel

> Status: spec ready
> Track: N-track. Prerequisite: N1–N4 implemented.
> Default Decisions, Form state policy, Validation policy from tracker apply.

## Goal

Wire the Create Submission button to actually submit. On success, navigate to `/submissions`. On error, replace the required-fields banner with an error Alert in the same slot. Cancel button asks browser-native confirmation if the form is dirty.

## Out of scope

a11y polish (focus management, aria-live, keyboard nav) — deferred to a separate polish phase. Toast notifications, custom confirmation modals, undo functionality.

## One Figma fetch needed

Container `520-14447` — the Actions card holding the Required-fields banner, Create Submission button, and Cancel button.

Source for: full-width button styling (both Create primary and Cancel secondary variants), button icons (Plus + back-arrow), button heights, vertical gap between Required banner / Create / Cancel.

Likely outcome: the existing `Button` atom needs a `fullWidth` prop (new, if absent) and `leftIcon` prop (verify N4 added it; if N4 used inline-icon pattern instead, add the prop now).

## Components updated

- `Button.tsx` — verify it supports `fullWidth?: boolean` and `leftIcon?: ReactNode`. If not, extend (low risk; touches dashboard only if existing callers pass these props — verify via grep).
- `NewSubmissionActions.tsx` — Create button onClick triggers submit; Cancel button onClick triggers confirmation + navigate. Both rendered full-width with icons.
- `NewSubmissionActionsContainer.tsx` — owns submit logic, error state, dirty-check, navigation
- `submissionsApi.ts` — `useCreateSubmissionMutation` already exists from N1; add deterministic failure trigger
- Existing `Alert` atom — N3 only populated `warning` variant. N5 adds `error` variant.
- `tokens.ts` — add section 13.m `actionsRegionStyles` for the gaps and any container-specific spacing extracted from `520-14447`.

## Alert variant addition (error)

In `tokens.ts` section 13.g, the `alertStyles.error` block was either set to throw (per N3 variant strategy default) or populated with red family colors. N5 fully populates:
- `bg`: red family (extract from existing `colors.*` if present, else propose `colors.errorAlertBg` etc.)
- `borderColor`, `iconColor`, `textColor`: red family
- `iconName`: `AlertCircle` from lucide

If N3 already populated these speculatively, verify against existing `colors.*` and adjust only if needed.

## Submit flow

In `NewSubmissionActionsContainer`:

1. `useFormContext` for `handleSubmit`, `formState.isDirty`, `formState.isSubmitting`
2. `useCreateSubmissionMutation` returns `[createSubmission, { isLoading, error, reset }]`
3. `useState<string | null>` for `submitError` (the user-facing error message)
4. `useNavigate` from react-router-dom

**On Create click:**
- Call `handleSubmit(onValid)` with `onValid` = async function that:
  - Filters `documents` to `status === 'success'` only
  - Builds `CreateSubmissionPayload` from form values
  - Awaits `createSubmission(payload).unwrap()`
  - On success: `navigate('/submissions')` (or wherever the list page is)
  - On error: `setSubmitError(error.data?.message || 'Failed to create submission. Please try again.')`
- If form invalid (zod errors): RHF won't call `onValid`; existing inline errors show

**Loading state:**
- Create button shows `isSubmitting` state — disabled with text "Creating…" (extract exact text from Figma if shown, else use this default)
- Cancel button stays clickable (user can abort during submit by navigating away — the request continues but UI is gone)

**Error display:**
- When `submitError` is non-null: render `<Alert variant="error">{submitError}</Alert>` in the slot currently holding the required-fields banner
- The two are mutually exclusive: required-fields banner shows ONLY when `missingRequiredFields.length > 0 && !submitError`. Submit error overrides.
- After user edits any field while error is showing: `submitError` clears (subscribe to `formState.isDirty` change after error → reset error)

## Cancel flow

In `NewSubmissionActionsContainer`:

**On Cancel click:**
- If `formState.isDirty`: show `window.confirm('You have unsaved changes. Discard them?')` — if user confirms, navigate; else stay
- If not dirty: navigate immediately to `/submissions` (or browser back — pick navigate for predictability)

## Mock create-submission behavior

Existing `useCreateSubmissionMutation` from N1 returns `{ id, subId }` after 300ms. Add deterministic failure trigger same as N4's upload mock:

If form's `accountId` corresponds to an account whose name contains "fail" (case-insensitive): return error after 300ms instead of success. This lets us test error UI without needing real backend.

Alternatively (simpler): if `formValues.group === 'FAIL_TEST'` → return error. Pick whichever feels less invasive for testing. Document which.

## Render order in Actions region

After N5, the Actions region (right column, below Summary Preview) renders:

1. **Either** required-fields Alert (warning) **OR** submit error Alert (error) — never both
2. Create Submission button (full width)
3. Cancel button (full width, secondary style)

The two Alert states are mutually exclusive; one slot.

## Button styling (from Figma `520-14447`)

Both buttons span full-width of the Actions card.

**Create Submission button:**
- Variant: primary (existing)
- Full-width
- Left icon: `Plus` from lucide
- Label: "Create Submission" (verify exact case from Figma)
- Disabled state: when `isSubmitting`, label changes to loading text (extract verbatim if Figma shows it; else use "Creating…")

**Cancel button:**
- Variant: secondary (existing — outlined/white style)
- Full-width
- Left icon: `ArrowLeft` from lucide (the back-arrow shown in Figma)
- Label: "Cancel"

**Vertical spacing between elements in the Actions card:**
- Gap: Required-banner → Create button (extract from `520-14447` itemSpacing)
- Gap: Create button → Cancel button (same itemSpacing)

## Acceptance criteria

1. Click Create with all required fields filled: form submits, ~300ms loading, navigate to `/submissions`
2. Click Create with required fields missing: form does NOT submit, inline FormField errors show, banner stays in warning state
3. Click Create with mock failure trigger: ~300ms loading, button re-enables, error Alert appears with the mock's error message
4. After error, edit any form field: error Alert clears
5. Required-fields warning + submit error: both never show at the same time
6. Click Cancel with form clean (no edits since load): navigate immediately to `/submissions`
7. Click Cancel with form dirty: browser native confirm dialog appears. Confirm → navigate. Cancel → stay.
8. Successful documents in payload: only `status === 'success'` entries (uploading or error excluded)
9. tokens.ts 13.g: `alertStyles.error` fully populated with red family colors
10. tokens.ts 13.m: `actionsRegionStyles` populated from `520-14447` JSON
11. Both buttons render full-width inside Actions card
12. Create button: primary blue + Plus icon left + "Create Submission" label
13. Cancel button: secondary white + ArrowLeft icon left + "Cancel" label
14. NEW_SUBMISSION_TRACKER.md row N5 → implemented; tracker reflects N-track complete

## What ships after N5

The N-track is feature-complete. The form submits, navigates, errors gracefully, and warns on cancel-with-dirty-state. The next phase is the polish/a11y phase (skeletons, focus management, keyboard nav, screen reader testing).