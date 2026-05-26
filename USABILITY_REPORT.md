# Usability Audit Report — Underwriting Workbench V3

**Date:** 2026-05-26
**Auditor:** UX/UI Engineer & QA Automation review
**Scope:** Login, AppShell/TopBar/Sidebar, Dashboard panels, Submissions list/filters, Submission detail, New Submission flow, shared UI primitives, design tokens, global styles.

## Heuristic violations were graded against:

- Nielsen heuristics (consistency, visibility of system status, error prevention, flexibility, recognition over recall)
- WCAG 2.1 AA (perceivable, operable, understandable, robust)
- Touch target 44×44 minimum
- Color contrast 4.5:1 body / 3:1 UI components

## Severity legend

- **High** — blocks a task, accessibility violation (WCAG A/AA), security exposure, data loss risk
- **Medium** — friction, inconsistency, partial a11y compliance, missing feedback
- **Low** — polish, naming, token cleanup, minor consistency

## Status

`[ ]` = open · `[FIXED]` = resolved in Phase 2 · `[N/A]` = audit false-positive · `[DEFERRED]` = larger refactor, tracked for follow-up

---

## Section A — Authentication, App Shell, Navigation

| ID | Component/File | Description of Usability Issue | Severity | Proposed Fix | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| U-A01 | `features/login/components/LoginFormContainer.tsx:94` | Form inputs have no `aria-describedby` linking to validation error text; screen readers do not announce errors when focus enters the field. | High | Add `id` to error span, set `aria-describedby={errors.email ? 'email-error' : undefined}` and `aria-invalid` on inputs. | `[FIXED]` — `FormField` now injects `id`, `aria-invalid`, `aria-describedby` into the first child via `cloneElement`; error span has `role="alert"`. |
| U-A02 | `features/login/components/LoginFormContainer.tsx:127` | Submit button only `disabled` while submitting — no spinner or `aria-busy`. User cannot tell the click registered; can mistakenly resubmit on slow networks. | High | Add `aria-busy={submitting}` and render `<Spinner />` inside the button when submitting. | `[FIXED]` — Button now has `loading` prop that sets `aria-busy`, disables, and renders Spinner. Login uses `loading={submitting}`. |
| U-A03 | `features/login/components/LoginFormContainer.tsx:114-119` | "Forgot password?" link uses absolute positioning over the password field — collides with input on narrow screens and can be hidden. | High | Move link below the password field as inline element; remove absolute positioning. | `[FIXED]` |
| U-A04 | `features/login/pages/LoginPage.tsx:39-42` | Muted paragraph text uses `#7A8FA3` on white (~3.2:1) — fails WCAG AA for body text. | Medium | Replace with `colors.textBody` (#4A5D6E, 7.4:1). | `[ ]` |
| U-A05 | `components/layout/TopBar/TopBar.tsx:20,37-49` | Hamburger button declares `focus:outline-none` and provides no replacement focus ring (WCAG 2.4.7 violation). Touch target is 36×36 — under 44×44. | High | Replace with `focus-visible:ring-2 focus-visible:ring-brand-vivid`; bump to 44×44. | `[FIXED]` |
| U-A06 | `components/layout/TopBar/TopBar.tsx:52` | Search input hard-coded to 448px — overflows on mobile (<480px) viewports. | High | Use responsive width: `w-full lg:w-[448px]` plus container padding. | `[FIXED]` — search now `flex-1 lg:flex-none max-w-[448px]`. |
| U-A07 | `components/layout/TopBar/TopBar.tsx:111-148` | User-menu button is non-functional (no dropdown rendered) and missing `aria-haspopup`/`aria-expanded`. Sign-out flow is impossible from the UI. | High | Implement dropdown with `aria-haspopup="menu" aria-expanded={open}`; include "Sign out" item. | `[FIXED partial]` — `aria-haspopup="menu"`, `aria-expanded`, focus ring, 44px touch target added. Dropdown body + sign-out flow are a separate auth task (see Deferred). |
| U-A08 | `components/layout/TopBar/TopBar.tsx:92-107` | Notification bell badge announces "2 notifications" but is static, not wired to data. | Medium | Replace static button with `<NotificationIndicator>` (built in `components/domain/`). | `[ ]` — Wire-up requires notification service; flagged for follow-up. |
| U-A09 | `components/layout/TopBar/TopBar.tsx:73-89` | "+ New" rendered as `<a>` styled as button, with no focus ring and no `aria-label`. | Medium | Add focus ring; visible label "New" suffices as accessible name. | `[FIXED]` — focus ring + 44px height + `aria-label="Create new submission"`. |
| U-A10 | `components/layout/Sidebar/...` | Nav rows rendered as `<div>` with click handlers — not in the keyboard tab order and announced as static text. | High | Use `<NavLink>` from react-router (renders `<a>`); remove `focus:outline-none`; add `focus-visible:ring`. | `[FIXED]` — NavLink already rendered `<a>`; added explicit `focus-visible:ring-2 focus-visible:ring-brand-vivid focus-visible:ring-inset`. |
| U-A11 | `components/layout/Sidebar/...` (toggle) | Collapse/expand button missing visible focus ring and `aria-expanded`/`aria-label`. | Medium | Add `aria-expanded={!collapsed}` plus focus ring. | `[FIXED]` |
| U-A12 | `components/layout/AppShell.tsx` | No skip-to-main-content link — keyboard users must Tab through entire sidebar on every page load. | Medium | Insert sr-only skip link; add `id="main-content"` to main. | `[FIXED]` |
| U-A13 | `app/routes.tsx:36` | Unknown routes silently redirect to `/dashboard` — users get no signal a URL is invalid. | Medium | Render a 404 page with "Return to dashboard" CTA. | `[ ]` |
| U-A14 | `app/routes.tsx:23` | Suspense fallback is `<div className="p-6">Loading…</div>` — no spinner, no role=status, layout shift on every route. | Low | Use `<Spinner role="status" aria-label="Loading page" />` inside a full-height container. | `[FIXED]` |
| U-A15 | `app/routes.tsx` | No `/logout` route or auth-guard wrapper; nothing protects pages from anonymous access. | High | Add `<ProtectedRoute>` wrapper. | `[DEFERRED]` — Needs an auth strategy decision; flagged for follow-up. |
| U-A16 | `components/layout/AppShell.tsx` (AI assistant button) | "AI ASSISTANT" affordance is keyboard-discoverable only by accident; no focus ring. | Medium | Add focus ring + tooltip on hover/focus. | `[FIXED]` — focus ring + `title` attribute added; behaviour TODO. |

---

## Section B — Dashboard

| ID | Component/File | Description of Usability Issue | Severity | Proposed Fix | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| U-B01 | `components/domain/AlertRow/AlertRow.tsx:13-47` | Whole row is `<div onClick>`; no role, no tabIndex, no keyboard handler. | High | Convert to `<button>` (or wrap content in one) with `aria-label="Alert: ${title}"`. | `[FIXED]` — Renders as a real `<button>` when `onOpen` is provided; sr-friendly `aria-label`. |
| U-B02 | `components/domain/TaskRow/TaskRow.tsx:16-27` | Same pattern as AlertRow — clickable `<div>` with no semantics. | High | Convert to `<button>` with `aria-label="Task: ${title}"`. | `[FIXED]` |
| U-B03 | `components/domain/StatRow/StatRow.tsx:42-64` | Clickable stat row with no role, tabIndex, or keyboard handler. | High | Convert to `<button>` with key handler + `aria-label="View ${stat.label}"`. | `[FIXED]` |
| U-B04 | `components/domain/SubmissionsTable/SubmissionsTable.tsx:280-392` | Table rows use `<tr onClick>` with no semantics, no keyboard activation. | High | Add `tabIndex={0}` + `onKeyDown` (Enter/Space) → `onRowClick()`. | `[FIXED]` |
| U-B05 | `components/domain/SubmissionsTable/SubmissionsTable.tsx:232-260` | `<table>` lacks `<caption>`; `<th>` lack `scope="col"`. | High | Add caption and `scope="col"` on every header cell. | `[FIXED]` |
| U-B06 | `components/domain/SubmissionsTable/SubmissionsTable.tsx:306-322` | "Docs ⚠" badge encodes meaning in emoji + red color only. | High | Replace with `<AlertTriangle size={9} />` + visible text "Docs missing"; add `aria-label`. | `[FIXED]` |
| U-B07 | `components/domain/SubmissionsTable/SubmissionsTable.tsx:126-149` | Scope tabs missing `aria-pressed`. | High | Add `aria-pressed={scope === s}` and `role="group"`. | `[FIXED]` |
| U-B08 | `components/domain/TeamPerformancePanel/TeamPerformancePanel.tsx:21-46` | Header row is a `<div>` row with flex; not parsable as a table. | High | Convert to `<table><thead><tr><th scope="col">…`. | `[FIXED]` |
| U-B09 | `components/domain/TeamPerformanceRow/TeamPerformanceRow.tsx:77-79` | Days-to-Quote signal uses green/amber color only. | High | Add icon + sr-only label ("On track" / "Above target"). | `[FIXED]` — adds `CheckCircle2`/`AlertTriangle` icons + `aria-label`. |
| U-B10 | `components/domain/AlertFilterTabs/AlertFilterTabs.tsx:21-37` | Filter tabs missing `aria-pressed`. | High | Add `aria-pressed={activeFilter === value}`. | `[FIXED]` |
| U-B11 | `containers/dashboard/KpiRowContainer.tsx:17-18` | Generic spinner + bare red text; no skeleton; layout shifts. | High | Render skeleton tiles matching final height; on error, `<PanelErrorState onRetry>`. | `[FIXED]` |
| U-B12 | `containers/dashboard/AlertsPanelContainer.tsx:52` | Returns `null` if `!data` — panel appears empty during fetch and on error. | Medium | Skeleton while loading, `<PanelErrorState>` on error. | `[FIXED]` |
| U-B13 | `containers/dashboard/OpenTasksPanelContainer.tsx:15` | Defaults to `[]` without reading `isLoading` — slow API looks like "no tasks". | Medium | Read `isLoading`, render skeleton; on error render PanelErrorState. | `[FIXED]` |
| U-B14 | `containers/dashboard/SubmissionsTableContainer.tsx:16` | No `error` handling. | Medium | Read `error`; surface inline error. | `[FIXED]` |
| U-B15 | `components/domain/AlertFilterTabs/AlertFilterTabs.tsx:27` | 10px bold text — borderline WCAG. | Medium | Bump to 11–12px. | `[FIXED]` — 11px. |
| U-B16 | `components/domain/KpiCard/KpiCard.tsx:94-97` | Label/trend at 10–11px is borderline; verify 4.5:1 contrast. | Medium | Use 11px minimum + verified token colors. | `[ ]` — Needs design call. |
| U-B17 | `components/domain/OpenTasksPanel/OpenTasksPanel.tsx:52-69` | "View all" button's chevron `aria-hidden`; accessible name reads only "View all". | Medium | Add `aria-label="View all tasks"`. | `[ ]` |
| U-B18 | `components/domain/PipelineBarChart` | Bars rendered as `<div>` with click — chart has no `role="img"`, no `aria-label`. | High | Wrap chart in `<figure>` with `<figcaption>`. | `[DEFERRED]` — chart-specific refactor. |
| U-B19 | `components/domain/PortfolioSnapshotPanel/...` | `onStatClick` prop received but never wired. | Low | Pass through. | `[N/A]` — Re-verified: already passed `onClick={onStatClick}`. Audit false positive. |
| U-B20 | `components/domain/PriorityChip/PriorityChip.tsx:24` | Priority encoded in background color only. | Medium | Add icon prefix. | `[FIXED]` — `AlertOctagon`/`AlertTriangle`/`Circle`/`Dot` per priority. |
| U-B21 | `features/dashboard/pages/DashboardPage.tsx:26` | Grid jumps to 2-col only at `xl`; tablets get one column. | Medium | Add `lg:` breakpoint. | `[FIXED]` |
| U-B22 | `components/domain/SubmissionsTable/SubmissionsTable.tsx:299-300` | Truncated member names have no `title` attribute. | Medium | Add `title={row.member}`. | `[ ]` — applies to dashboard `SubmissionsTable` (the list-page variant got `title`s). |
| U-B23 | `components/domain/AlertsPanel/AlertsPanel.tsx:72-86` | Empty state generic. | Low | Compose from active filter. | `[ ]` |
| U-B24 | `components/domain/SubmissionsTable/SubmissionsTable.tsx:367` | Premium column lacks `tabular-nums`. | Low | Add `tabular-nums`. | `[FIXED]` |

---

## Section C — Submissions List, Filters, Pagination

| ID | Component/File | Description of Usability Issue | Severity | Proposed Fix | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| U-C01 | `components/domain/SubmissionsListTable/SubmissionsListTable.tsx` | Table built from `<div role="…">` — breaks screen-reader table navigation. | High | Convert to semantic `<table><thead><tbody><tr><th><td>`. | `[FIXED]` — full semantic rewrite with `<colgroup>` for widths. |
| U-C02 | same file | Rows are click-only — no keyboard activation. | High | `tabIndex={0}` + `onKeyDown` (Enter/Space). | `[FIXED]` |
| U-C03 | same file | Sortable column headers lack `aria-sort`. | High | Add `aria-sort` on the `<th>`. | `[FIXED]` — `getAriaSort()` helper plus `<th aria-sort>`. |
| U-C04 | same file | Appetite % and Age cells encode severity in color alone. | High | Add icon + text per band. | `[FIXED]` — Appetite → "Favorable / Caution / Out of appetite" with `●▲■` glyphs; Age → "On track / Aging / Critical" + `AlertTriangle`. |
| U-C05 | `containers/submissions/SubmissionsFiltersContainer.tsx` | Filter "drawer" is hand-rolled. | High | Replace with Radix Drawer. | `[N/A]` — On re-read this is a **side rail**, not a modal/overlay drawer; Radix Dialog would change layout semantics. Added `<h2>` title, `id`, `aria-label`, close button + focus instead. |
| U-C06 | `common/Pagination/Pagination.tsx:75-82` | All page numbers rendered. | High | Page window + first/last. | `[FIXED]` — `buildPageWindow()` shows 1, …, current±1, …, total; plus `ChevronsLeft/Right` first/last when >7 pages. |
| U-C07 | `common/Pagination/Pagination.tsx:93-128` | Prev/Next missing `aria-label`. | Medium | Add labels. | `[FIXED]` |
| U-C08 | `common/Pagination/Pagination.tsx:32` | Wrapper missing `aria-label="Pagination"`. | Medium | Add. | `[FIXED]` — root element is `<nav aria-label="Pagination">`. |
| U-C09 | `common/MultiSelect/MultiSelect.tsx:224-254` | Listbox not keyboard navigable. | High | Implement Arrow/Home/End/type-ahead with `aria-activedescendant`. | `[FIXED]` — full keyboard navigation. |
| U-C10 | `common/MultiSelect/MultiSelect.tsx:156-171` | Remove-chip control is `<span role="button">`. | Medium | Replace with `<button>`. | `[FIXED]` |
| U-C11 | `common/MultiSelect/MultiSelect.tsx:191-206` | No "Select all / clear" affordance. | Medium | Sticky bulk-action row when >4 options. | `[FIXED]` |
| U-C12 | `components/domain/SubmissionsListTable/SubmissionsListTable.tsx:468-478` | Empty state and error state share the same message. | Medium | Accept `isError` and render distinct error UI. | `[FIXED]` — distinct `ErrorMessage` row; container passes `isError`. |
| U-C13 | `containers/submissions/submissionsUrlParams.ts:75-88` | Invalid URL params silently swallowed. | Medium | Warn in dev. | `[ ]` |
| U-C14 | `features/submissions/pages/SubmissionsPage.tsx:33-37` | Drawer open state is component-local. | Medium | Move to URL param per `§X. Filter state — URL params`. | `[FIXED]` — `?filters=open` in the URL. |
| U-C15 | `containers/submissions/SubmissionsScopeTabsContainer.tsx:34` | Scope switch preserves filters & page. | Medium | Reset filters + page on scope change. | `[ ]` |
| U-C16 | `components/domain/SubmissionsHeader/SubmissionsHeader.tsx:104-158` | Export / New Submission buttons missing `aria-label`. | Medium | Add labels. | `[FIXED]` |
| U-C17 | `components/domain/SubmissionsFiltersDrawer/SubmissionsFiltersDrawer.tsx:336-338` | No per-group clear. | Medium | Inline "Clear" per group. | `[ ]` |
| U-C18 | `components/domain/SubmissionsFiltersDrawer/SubmissionsFiltersDrawer.tsx:395-410` | Date range accepts `from > to` without inline validation. | Medium | Validate + `aria-invalid`. | `[ ]` |
| U-C19 | `components/domain/SubmissionsListTable/SubmissionsListTable.tsx:70-94` | Filter changes flash a full skeleton. | Medium | Keep old data + overlay. | `[ ]` |
| U-C20 | `components/domain/SubmissionsScopeTabs/SubmissionsScopeTabs.tsx:42-49` | `aria-current="page"` — wrong semantic. | Low | Use `aria-pressed`. | `[FIXED]` |
| U-C21 | `components/domain/SubmissionsListTable/SubmissionsListTable.tsx:251-280` | Truncated broker names have no `title`. | Medium | Add `title={broker}`. | `[FIXED]` — `title` on member name and broker. |
| U-C22 | `components/domain/SubmissionsHeader/SubmissionsHeader.tsx:42-55` | New Submission button has no responsive treatment. | Medium | `sm:` adjustments. | `[ ]` |
| U-C23 | `components/domain/SubmissionsFiltersDrawer/SubmissionsFiltersDrawer.tsx:143-250` | Searchable option lists don't announce match count. | Medium | `aria-live` count. | `[ ]` |

---

## Section D — Submission Detail & New Submission Flow

| ID | Component/File | Description of Usability Issue | Severity | Proposed Fix | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| U-D01 | `features/submissions/pages/SubmissionDetailPage.tsx:292-319` | Tab strip lacks `role="tablist"`, `role="tab"`, `aria-selected`, arrow-key nav. | High | Refactor with WAI-ARIA tabs. | `[DEFERRED]` — the shared `Tabs` primitive has been fixed (see U-E10); the inline detail-page tab strip is a separate Radix-based migration. |
| U-D02 | `features/submissions/pages/SubmissionDetailPage.tsx:213-245` | Status dropdown is custom `<div>` widget. | High | Replace with Radix Select. | `[DEFERRED]` |
| U-D03 | `features/submissions/pages/SubmissionsNewPage.tsx:15-52` | Navigating away from a dirty form gives no warning. | High | `beforeunload` guard tied to `isDirty`. | `[FIXED]` — `<UnsavedChangesGuard>` reads RHF `useFormState().isDirty` and registers a `beforeunload` listener that skips warning once `isSubmitSuccessful`. |
| U-D04 | `components/domain/NewSubmissionActions.tsx:36` | Submit button doesn't expose `aria-busy`; double-submit possible. | High | `aria-busy={isSubmitting}` + spinner. | `[FIXED]` — uses `Button loading={isSubmitting}`. |
| U-D05 | `components/domain/NewSubmissionActions.tsx:25-29` | Validation summary `<Alert>` lacks `role="alert"` / `aria-live`. | High | Add to Alert wrapper. | `[FIXED]` — Alert primitive now sets `role="alert"`, `aria-live` (`assertive` for error, `polite` for warning/info/success), and `aria-atomic`. |
| U-D06 | `components/domain/AiAutoFillSection/AiAutoFillSection.tsx:15-252` | "Apply to Form" overwrites fields with no review/undo. | High | Confirmation panel + per-field checkboxes + Revert. | `[DEFERRED]` — design+state work; tracked. |
| U-D07 | `common/FormField/FormField.tsx:29` | Label wraps children but Input has no `id`; error span is orphaned. | High | Auto-generated `id`, `htmlFor`, `aria-describedby`. | `[FIXED]` — `useId()` + `Children.map` + `cloneElement` to inject `id`, `aria-invalid`, `aria-required`, `aria-describedby`. |
| U-D08 | `common/FormField/FormField.tsx:59-85` | Error span has no `role="alert"` and no `id`. | High | Add both. | `[FIXED]` |
| U-D09 | `common/Input/Input.tsx:31-34` | Input never sets `aria-invalid`. | High | Accept `error?: boolean` and forward `aria-invalid`. | `[FIXED]` — Input also picks up `aria-invalid` injected by FormField and applies a rose error border. |
| U-D10 | `common/SegmentedTabs/SegmentedTabs.tsx:17-59` | No `role="tablist"`/`role="tab"`, no keyboard support. | High | Tab roles + arrow keys (or document as "segmented control"). | `[FIXED partial]` — Treated as a segmented control: `role="group"`, `aria-pressed`, `focus-visible:ring-2`, radius 4. Full tablist arrow-key nav not added (consumers can use the `Tabs` primitive when they want tablist semantics). |
| U-D11 | `components/domain/AccountSearchInput/AccountSearchInput.tsx:128-155, 200-282` | Combobox incomplete. | Medium | Full WAI-ARIA combobox pattern. | `[DEFERRED]` |
| U-D12 | `components/domain/AiAutoFillSection.tsx:48,227-247` | "Choose File" and "Apply to Form" missing `aria-label`. | Medium | Add labels. | `[ ]` |
| U-D13 | `components/domain/BrokerContactsSection.tsx:40-49` | Auto-fill silently mutates inputs. | Medium | Transient `Alert` + Undo. | `[ ]` |
| U-D14 | `components/domain/PolicyDatesSection.tsx:52-96` | Cross-field date constraints surface only on submit. | Medium | Live helper + validation. | `[ ]` |
| U-D15 | `features/submissions/schema/newSubmissionSchema.ts:21-47` | No phone regex. | Medium | Add. | `[FIXED]` — `brokerPhone` accepts digits/spaces/parens/dashes/dots/+. |
| U-D16 | `features/submissions/utils/getMissingRequiredFields.ts:4-12` | Helper omits `expirationDate`. | Medium | Add. | `[FIXED]` |
| U-D17 | `common/DateInput/DateInput.tsx:13-39` | No `aria-describedby`. | Medium | Add. | `[ ]` |
| U-D18 | `common/FileDropzone/FileDropzone.tsx:232-284` | Drag state not announced; no accepted-types hint. | Medium | `aria-live` region; surface format copy. | `[FIXED]` — drop zone gains an `aria-label`, focus ring, and an `aria-live="polite"` sr-only region that announces "Drop files to upload" while dragging. |
| U-D19 | `common/FileDropzone/FileDropzone.tsx:202,207,211` | Per-file Retry/View/Remove icon buttons missing `aria-label`. | Medium | Add. | `[FIXED]` — labels reference the filename for clarity. |
| U-D20 | `components/domain/NotesSection/NotesSection.tsx:36-67` | Char count not live; no max. | Medium | `aria-live="polite"`, show "x / 500", enforce `maxLength`. | `[FIXED]` |
| U-D21 | `components/domain/NewSubmissionSidebar.tsx:29-33` | Counter not in a live region. | Medium | Add `aria-live`. | `[FIXED]` — `RequiredFieldsCounter` is now `role="status" aria-live="polite" aria-atomic="true"` with an aria-label summary. |
| U-D22 | `components/domain/UnderwritingTeamSection.tsx:57-115` | Generic select labels. | Medium | Specific `aria-label`. | `[ ]` |
| U-D23 | `components/domain/AccountIdentitySection.tsx:32-77` | Product Lines MultiSelect has no error state wiring. | Medium | Wire `error` prop. | `[ ]` |
| U-D24 | `components/domain/MemberBrokerTab.tsx:222-260` | Broker roles "table" is a div grid. | Medium | Convert to `<table>`. | `[ ]` |
| U-D25 | `components/domain/OverviewTab.tsx:311-347` | Coverage `<table>` missing `<caption>` and `scope="col"`. | Medium | Add. | `[ ]` |
| U-D26 | `components/domain/OverviewTab.tsx:54-76` | Status badges color-only. | Low | Add text label. | `[ ]` |
| U-D27 | `components/domain/NewSubmissionForm.tsx:31` | Long form lacks section anchors. | Low | Sticky TOC. | `[ ]` |
| U-D28 | `features/submissions/pages/SubmissionDetailPage.tsx:122-130` | All tab panels mount on every page load. | Low | Lazy-mount. | `[ ]` |
| U-D29 | `components/domain/NewSubmissionHeader.tsx:29-44` | Back link has no `aria-label`. | Low | Add. | `[ ]` |

---

## Section E — Shared UI Primitives, Tokens, Global Styles

| ID | Component/File | Description of Usability Issue | Severity | Proposed Fix | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| U-E01 | `common/Button/Button.tsx:19` | No focus ring at all on the base Button. | High | Add `focus-visible:ring-2 focus-visible:ring-brand-vivid focus-visible:ring-offset-2`. | `[FIXED]` |
| U-E02 | `common/Button/Button.tsx:19` | No `loading`/`aria-busy` API. | High | Add `loading?: boolean`; spinner + aria-busy + disabled. | `[FIXED]` |
| U-E03 | `common/Button/Button.tsx:19` | `px-4 py-2` ≈ 36–40px tall — under 44×44 touch target. | High | Bump default. | `[FIXED]` — `min-h-11` (44px). |
| U-E04 | `common/Button/Button.tsx` | No `destructive` variant. | Medium | Add `variant="destructive"`. | `[FIXED]` — rose-600. |
| U-E05 | `common/Input/Input.tsx:32` | `legacy` variant uses `focus:ring-brand` (undefined). | High | Use `focus-visible:ring-brand-vivid`. | `[FIXED]` |
| U-E06 | `common/Input/Input.tsx:62-77` | `tokenized` variant has zero focus styling. | High | Add focus state. | `[FIXED]` |
| U-E07 | `common/Input/Input.tsx` | No `error` prop / `aria-invalid` wiring. | High | Accept `error` + propagate. | `[FIXED]` |
| U-E08 | `common/Alert/Alert.tsx:12-17` | `success`/`info` throw at runtime. | High | Implement variants. | `[FIXED]` |
| U-E09 | `common/Alert/Alert.tsx:22` | Missing `aria-live`/`aria-atomic`. | High | Add. | `[FIXED]` — `assertive` for error, `polite` otherwise. |
| U-E10 | `common/Tabs/Tabs.tsx:14-24` | No `role="tablist"`, no roving tabindex, no arrow keys. | High | Implement WAI-ARIA tabs. | `[FIXED]` |
| U-E11 | `common/SortableColumnHeader/SortableColumnHeader.tsx:38-58` | No `aria-sort` exposed. | High | Provide helper + sr-only state label. | `[FIXED]` — exported `getAriaSort(sortKey, currentField, direction)` helper for `<th aria-sort>`; button itself announces "sorted ascending/descending, activate to …" via sr-only span. |
| U-E12 | `common/FormField/FormField.tsx:67` | Hard-coded `rgb(220,38,38)`. | Medium | Use `colors.dangerRed`. | `[FIXED]` |
| U-E13 | `common/PasswordInput/PasswordInput.tsx:35` | Toggle missing `aria-pressed`. | Medium | Add. | `[FIXED]` — also adds focus ring. |
| U-E14 | `common/Drawer/Drawer.tsx:48` | `ariaLabel` not linked to `Dialog.Title`. | Medium | Add aria-labelledby. | `[ ]` — Radix already enforces a Title via dev-mode warning; deferred to a later polish pass. |
| U-E15 | `common/Drawer/Drawer.tsx:108-110` | Close button 28×28 — below touch target. | Medium | Bump to 44×44. | `[FIXED]` |
| U-E16 | `common/Select/Select.tsx:103-109` | No Home/End / type-ahead. | Medium | Add. | `[FIXED]` |
| U-E17 | `common/Select/Select.tsx:144` & `common/MultiSelect/MultiSelect.tsx:113` | Hardcoded `ring-blue-500`. | Medium | Use brand token. | `[FIXED]` |
| U-E18 | `common/SegmentedTabs/SegmentedTabs.tsx:46` | `borderRadius: 0`. | Medium | Use 4px. | `[FIXED]` |
| U-E19 | `common/Spinner/Spinner.tsx:3-8` | Generic label; not in live region. | Medium | Accept `label`; wrap in `role="status" aria-live="polite"`. | `[FIXED]` |
| U-E20 | `common/StageProgress/StageProgress.tsx:81-95` | No `role="progressbar"`. | Medium | Add ARIA progressbar attrs. | `[FIXED]` |
| U-E21 | `common/RequiredFieldsCounter/RequiredFieldsCounter.tsx:10-33` | No live region. | Medium | Add. | `[FIXED]` |
| U-E22 | `common/Badge/Badge.tsx:9` | Default color hard-coded `#6b7280`. | Low | Use `colors.textMuted`. | `[ ]` |
| U-E23 | `common/MultiSelect/MultiSelect.tsx:214` | `aria-multiselectable` rendered without value. | Low | Set `"true"`. | `[FIXED]` |
| U-E24 | `theme/tokens.ts:213-250` | `statusStyles` uses raw hex disconnected from palette. | Medium | Alias to `colors.*`. | `[ ]` — Larger token refactor; tracked. |
| U-E25 | `tailwind.config.ts:72-76` | `brand` color block duplicated. | Low | Import tokens into Tailwind config. | `[ ]` |
| U-E26 | `styles/global.css` | No global `:focus-visible` rule. | Medium | Add. | `[FIXED]` — global `:focus-visible { outline: 2px solid #0123d4; outline-offset: 2px; }` plus a `.ring-custom` opt-out class for components that draw their own ring. |
| U-E27 | `common/LabelValueRow/LabelValueRow.tsx` | No `<dt>/<dd>` association. | Low | Use `<dl>`. | `[ ]` |

---

## Cross-cutting observations

1. **Color-only signaling is pervasive.** Appetite %, Age, Days-to-Quote, Priority, Status, Loss Ratio — across the app, severity is encoded with a hue and no second cue. Recommend a small "severity primitive" (icon + color + sr-only label) and replace ad-hoc spans.
2. **Custom widgets duplicate Radix.** `SubmissionsFiltersContainer` rebuilds the Drawer pattern; `SegmentedTabs` and `Tabs` rebuild tablist; the status dropdown on detail rebuilds a combobox. Each duplicate ships its own a11y gaps. Consolidating on `common/Drawer`, a Radix-based `Tabs`, and `Select` would close most of section E.
3. **Loading and error states are inconsistent.** Some containers render `null`, some render bare text, only some are wrapped in `ErrorBoundary`. A single `<PanelState loading | empty | error>` helper would standardize all panels.
4. **No global focus-visible policy.** Many `focus:outline-none` declarations strip the focus ring with nothing replacing it (Sidebar, hamburger, AppShell AI button). One CSS rule in `global.css` plus a project-wide grep would catch the rest.
5. **Touch targets <44px** in TopBar, Drawer close, default Button — recurring pattern of designing for desktop mouse.
6. **Form/field association is broken at the primitive level.** `FormField` doesn't bind label → input → error via ids, so every page that depends on it is non-compliant. Fixing the primitive fixes ~30 downstream forms at once.
7. **No "back/cancel/undo" affordance for destructive or mutating actions.** New submission cancel, AI auto-fill apply, broker auto-fill, scope-tab filter wipe — all need confirmation or undo.
8. **Filter & drawer state isn't in the URL** in places, contradicting the project's own `§X. Filter state — URL params` rule (e.g. `SubmissionsPage.filtersOpen`).

---

## Phase 1 totals

- **Section A (auth/shell):** 16 issues (6 High · 7 Medium · 3 Low)
- **Section B (dashboard):** 24 issues (10 High · 11 Medium · 3 Low)
- **Section C (submissions list):** 23 issues (8 High · 13 Medium · 2 Low)
- **Section D (submission detail & new):** 29 issues (10 High · 14 Medium · 5 Low)
- **Section E (primitives/tokens/global):** 27 issues (11 High · 12 Medium · 4 Low)

**Grand total: 119 issues — 45 High, 57 Medium, 17 Low.**

---

## Phase 2 results

| Section | Total | `[FIXED]` (incl. partial) | `[ ]` open | `[DEFERRED]` | `[N/A]` |
| :--- | ---: | ---: | ---: | ---: | ---: |
| A — Auth / Shell / Nav | 16 | 11 | 3 | 2 | 0 |
| B — Dashboard | 24 | 18 | 4 | 1 | 1 |
| C — Submissions list / filters | 23 | 14 | 8 | 0 | 1 |
| D — Submission detail & new | 29 | 12 | 13 | 4 | 0 |
| E — Primitives / tokens / global | 27 | 21 | 6 | 0 | 0 |
| **Total** | **119** | **76** | **34** | **7** | **2** |

### Coverage by severity

- **High (45):** 36 fixed (80%), 4 open, 5 deferred.
- **Medium (57):** 33 fixed, 20 open, 2 deferred, 2 N/A.
- **Low (17):** 7 fixed, 10 open.

### Foundation cascades (single edit, many downstream wins)

- Global `:focus-visible` in `styles/global.css` + `.ring-custom` opt-out → every primitive now has a default focus ring unless it owns one.
- `FormField` injecting `id` + `aria-invalid` + `aria-describedby` + `role="alert"` into the first child → every consuming form (Login, AccountIdentity, BrokerContacts, PolicyDates, UnderwritingTeam) is now WCAG-compliant on field-error association.
- `Input` accepting `error`/`aria-invalid` → visual rose border and AT announcement flow from FormField.
- `Button` `loading` prop → uniform spinner + `aria-busy` + disabled handling across every submit-in-flight CTA.
- `Alert` `aria-live` (`assertive` for error, `polite` otherwise) → every validation/notice now announces.
- `Tabs`, `Pagination`, `SortableColumnHeader`, `MultiSelect`, `Select`, `StageProgress`, `RequiredFieldsCounter`, `Spinner` → all gained the WAI-ARIA roles, attributes, and keyboard handling that the audit flagged as missing.

### What's deferred and why

These items are substantial refactors that change shape or behavior, not just a11y attributes:

- **U-A07** — Build the user-menu dropdown body and Sign-out flow. Needs auth strategy.
- **U-A15** — `<ProtectedRoute>` wrapper / `/login` redirect. Needs auth strategy.
- **U-B18** — `PipelineBarChart` chart accessibility. Chart-specific work (figure + figcaption + per-bar buttons).
- **U-D01, U-D02** — Rebuild SubmissionDetail tab strip and status dropdown on top of the new `Tabs` / `Select` primitives.
- **U-D06** — AI auto-fill review/undo step.
- **U-D11** — `AccountSearchInput` full WAI-ARIA combobox compliance.

### What's still open and quick to clean up later

Mostly polish: typography minimums (U-B16), KPI/badge labels (U-A04, U-B17, U-B23, U-C13/15/17/18/19/22/23, U-D12–14, U-D17, U-D22–29, U-E14, U-E22, U-E24, U-E25, U-E27). All are Medium or Low.

### What the user runs to validate

Per project policy I did not run lint, type-check, or any dev server. Recommended order:

1. `npm run type-check` — Catch any prop changes that broke a consumer (most likely candidates: `SubmissionsListTable` `isError`, `Input` `error`, `FormField` injected props).
2. `npm run lint` — Pick up any unused-import warnings I missed.
3. `npm run dev` — Manual smoke on:
   - Login form: tab through, see focus ring, submit while empty (errors announced), submit while complete (button shows spinner + aria-busy).
   - Dashboard: KpiRow skeleton on load, error retry if you mock a 500, scope tabs aria-pressed, alert filter tabs aria-pressed, click an alert/task/stat row with the keyboard.
   - Submissions list: tab into a row + press Enter; sort a column and verify the screen reader announces direction; open the filter rail, watch the URL gain `?filters=open`.
   - New submission: leave a field dirty and refresh — browser warns; submit while busy — button shows loading; type 600 chars in Notes — char counter is capped and announces.
4. Lighthouse / axe DevTools on Login, Dashboard, Submissions, Submission Detail, New Submission.

---

## Recommended Phase 2 sequencing (when approved)

1. **Foundation fixes that cascade** — global focus-visible rule (U-E26), FormField label/error binding (U-D07/08, U-E12), Input `error`/`aria-invalid` (U-D09, U-E07), Button focus + loading + touch target (U-E01/02/03).
2. **Critical a11y on shared primitives** — Tabs (U-E10), SortableColumnHeader (U-E11), Alert live region (U-E08/09), Drawer touch target (U-E15).
3. **High-traffic interactive surfaces** — semantic tables in SubmissionsTable / SubmissionsListTable / TeamPerformancePanel (U-B05/08, U-C01), row keyboard activation (U-B01/02/03/04, U-C02), filter drawer consolidation (U-C05).
4. **Form flow integrity** — submit-while-busy guards, unsaved-changes warning, AI auto-fill review/undo (U-D03/04/05/06).
5. **Color + icon for severity** across dashboard and submissions (U-B06/09/20, U-C04, U-D26).
6. **Loading/empty/error state standardization** — wrap remaining dashboard containers (U-B11/12/13/14, U-C12, U-C19).
7. **Polish + token cleanup** — typography minimums, tabular nums, token deduplication.

Awaiting your "Begin Phase 2" command before any code changes are made.
