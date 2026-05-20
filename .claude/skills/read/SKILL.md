---
name: "read"
description: "Analyze a src-design TSX file — layout, component tree, routing, content, tokens, types, behavior. Run before /feature to understand the design."
user-invocable: true
---

# Design Reader

Reads one or more src-design files and produces a complete structured analysis.
This is the replacement for Figma MCP. The src-design TSX is the design source of truth.

## Args
$ARGUMENTS = one or more src-design file paths (space-separated), e.g.:
  src-design/components/tabs/OverviewTab.tsx
  src-design/pages/Submissions.tsx src-design/components/tabs/OverviewTab.tsx

## Execution

### Step 1: Read the files
Read every file path listed in $ARGUMENTS.
For each file, also read any local imports from src-design/components/ (not ui/).
Skip src-design/components/ui/ — Shadcn primitives, handled by substitution map.
Skip src-design/context/ — not relevant to production implementation.

### Step 2: Parent context detection
Before anything else, determine where this screen belongs in src/:

a) What product area does this file belong to?
   (submissions, dashboard, login, portfolio, tasks, inbox…)

b) Is this a top-level page OR a subscreen/tab of a parent page?
   - If subscreen/tab → identify the parent page
   - Correct folder: features/<product-area>/components/tabs/ for tabs
   - Correct folder: features/<product-area>/pages/ for subpages

c) Check registry + session-log: does the parent page already exist in src/?
   - YES → note the exact file path, it will be modified to add routing
   - NO → it must be created as part of this implementation

d) Output a one-line context statement:
   "This is a [tab/subpage/page] belonging to [product-area].
    Parent: [parent file path or 'does not exist yet'].
    Folder: [correct target folder in src/]."

### Step 3: Routing check
Check whether navigation TO this screen already exists in src/:

a) Read src/app/routes.tsx (or equivalent routing file).
b) Read the parent page/container identified in Step 2.
c) Answer these questions:
   - Does a route for this screen exist? (YES/NO + path if yes)
   - Does the parent page have a row-click / link / button that navigates here? (YES/NO)
   - If NO to either: flag as ROUTING-GAP

Output:
  Route registered: YES/NO — [path if yes]
  Navigation wired: YES/NO — [where it should be added if no]

### Step 4: Layout structure
Describe the top-level layout:
- Number of columns/panels/sections
- Fixed dimensions if specified (px, rem, %)
- Header / content / footer breakdown
- Tab structure if present (tab labels, active state)

### Step 5: Component tree
Walk the JSX top-down. Produce this table:

| # | Name in design | Origin (Shadcn/custom) | Key props observed | Internal state? | Mock data? |
|---|---|---|---|---|---|

"Internal state" = has useState/useReducer that drives real behavior.
"Mock data" = hardcoded array or object passed as props or used directly.

### Step 6: Production classification
For each component, assign one classification using folder ownership rules from /ctx:

- REUSE:[src/path] — exact match exists in registry
- REUSE-EXTEND:[src/path] — close match, needs new prop
- NEW-COMMON — generic primitive → src/components/common/
- NEW-DOMAIN — business presentational → src/components/domain/
- NEW-FEATURE — used only in this feature → src/features/<f>/components/
- NEW-LAYOUT — shell/nav → src/components/layout/
- CONTAINER — fetches or coordinates state → src/containers/
- PAGE — route-level → src/features/<f>/pages/

### Step 7: Content extraction (text, icons, labels)
List every:
- Heading text and its typography token
- Label / field name (exact string)
- Button label (exact string)
- Icon name (map Lucide icon name from src-design to production import)
- Placeholder text
- Empty state message

These must be reproduced exactly in production — no paraphrasing.

### Step 8: Mock data → type inference
For every hardcoded data structure, infer the TypeScript interface.
These become src/shared/types/ contracts and src/services/ query shapes.

### Step 9: Style extraction + unit conversion
For every Tailwind class, CSS variable, or inline style value found:

**Colors:**
- Look up in token map (loaded by /ctx)
- Mapped → record: raw → token → production Tailwind class
- Unmapped → ⚠ TOKEN-GAP: [raw value]

**Layout units (convert — never copy px directly):**
| Found in src-design | Record as |
|---|---|
| Fixed px width on container | → % or Tailwind fractional or max-w-[X] w-full |
| Fixed px panel/sidebar (e.g. 360px) | → max-w-[360px] w-full |
| Font size px (e.g. 14px) | → Tailwind type scale equivalent |
| Padding/margin px (e.g. 16px) | → Tailwind spacing scale (p-4) |
| Gap px | → Tailwind gap scale |
| Border radius px | → Tailwind rounded scale |
| inline style={{ }} | → rewritten as Tailwind className |

For each converted value, record: raw px → production Tailwind class
Flag anything that has no clean Tailwind equivalent as ⚠ UNIT-GAP: [raw value]

### Step 10: Behavior extraction
- Click handlers → what they trigger
- Conditional renders → what condition, what shows
- Loading / error / empty states → how rendered
- Validation rules → field, rule, error message
- Tab switching → how active tab is tracked

### Output
Print the full structured analysis including:
- Context statement (Step 2)
- Routing check (Step 3)
- Layout, component tree, classification, content, types, tokens, behavior

End with:
"[N] components total. [N] reuse, [N] new. [N] token gaps. Routing gaps: [list or 'none']."
