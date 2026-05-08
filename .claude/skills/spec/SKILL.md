---
name: "spec"
description: "Generate a structured implementation spec from a /read analysis. Run after /read, before /feature task breakdown."
user-invocable: true
---

# Spec Generator

Generates a structured implementation spec from a /read analysis.
Replaces manual spec writing entirely.
Output matches the format of existing files in specs/.

## Args
$ARGUMENTS = spec filename (without .md), e.g.: dashboard-phase-5-pipeline

## Prerequisite
/read must have been run in this session. Its analysis is the input.
If /read has not been run: ask for the src-design file path, run /read first.

## Output

Write the file to `specs/$ARGUMENTS.md` with this exact structure:

---

# [Human-readable feature name] — [Phase label]

## Goal
[One sentence. User-facing value delivered by this phase only.]

## Design source
`src-design/[file(s) read by /read]`

## Scope
| Path | Purpose | Status |
|------|---------|--------|
[Every file to create or modify. No extras. Exact @/-rooted paths.
status = create | modify]

## Reuse
[Every REUSE and REUSE-EXTEND component from the /read classification.
Format: `src/path/Component` — what it provides, what prop change if EXTEND]

## New files required
[Every NEW-COMMON / NEW-DOMAIN / NEW-LAYOUT / CONTAINER / PAGE.
For each: file path + TypeScript props interface sketch + which src-design component it maps from]

## Data shapes
[Every mock data structure found in src-design, converted to TypeScript interface.
These become the types in src/shared/types/ and the query shapes in src/services/.]

## Token map
| src-design class/var | Resolved value | src/theme token | Tailwind class |
|---|---|---|---|
[From /ctx token map + /read style extraction.
Mark ⚠ TOKEN-GAP for anything unresolved.]

## Behavior
[Bullet list of all interactions extracted in /read Step 7.
Loading states, error states, empty states, click handlers, filter changes.]

## Filter / URL state
[Any filter, tab, sort, pagination state found in the design.
Each becomes a URL search param. Document: param name | type | default | valid values]

## Acceptance criteria

### Layout
[Structural criteria — panels present, dimensions, grid behavior]

### Components  
[Per-component criteria — correct props, correct variants, correct tokens]

### Behavior
[Interaction criteria — clicks work, filters update URL, loading states show]

### Code quality
- [ ] No import boundary violations (CLAUDE.md table)
- [ ] All filter/tab/sort state in URL search params
- [ ] All new containers wrapped in <ErrorBoundary>
- [ ] All new exports added to index.ts barrels
- [ ] No Shadcn/Radix imports anywhere in src/ (use common/ equivalents)
- [ ] No hardcoded hex values or px (tokens and Tailwind only)
- [ ] No useAppSelector/useAppDispatch in components/common or components/domain
- [ ] No useGetXQuery in presentational components

## Out of scope
[Explicit list of things visible in src-design that are NOT part of this phase.
Be specific — prevents scope creep during implementation.]

---

After writing the file, print:
"Spec written → specs/$ARGUMENTS.md
Review it. If correct, run: /feature $ARGUMENTS src-design/[file path]"
