# New Submission Phase N1 — Foundation & Route

> Status: spec ready (rev 2 — incorporates S4 rework lessons)
> Phase track: New Submission (N1–N5), separate from list-page S-track
> Prerequisite: S1 (Submissions list foundation) implemented. S2 ideally implemented for navigation wire-up — if not, N1 leaves a TODO for S2.
>
> **Changes from rev 1:**
> - Mock data tables now verbatim in the spec (root-cause fix for S4 mock drift)
> - Reuse-First Rule moved to a Step-1 verification (forces Claude to read `INDEX.md` first)
> - Confirmation table added at end of phase
> - Explicit "do NOT add" list for N2–N5 atoms (prevents scope creep)
> - Property Strictness Rule reminder added even though N1 has minimal styling

## Goal

Mount `/submissions/new` as a new route inside the existing `AppShell`. Wire the existing "+ New Submission" button on `/submissions` to navigate here. Establish the form scaffold (react-hook-form + zod), type definitions, mutation/query stubs, mock lookup data, and 4 ErrorBoundary regions corresponding to the 4 page-level container groups. After N1 ships, navigating to `/submissions/new` shows a mostly-empty page with placeholder regions; visual content lands in N2-N5.

## Out of scope (deferred)

- N2: Header band content + Submission Type cards + sidebar (Stage Progress, Summary Preview)
- N3: All form sections (Account & Identity, Policy Dates, Broker & Contacts, Underwriting Team)
- N4: Document drag-drop + upload
- N5: Submit button wiring, success redirect, error toast, validation polish, a11y

## Reusability inventory

### Existing atoms — verify in INDEX.md before any code (Step 1 of prompt)

These come from S-track or dashboard work. Reuse them, don't redefine:

| Atom | Path | When used (downstream phase) |
|---|---|---|
| `FormField` | `components/common/FormField/` | Wraps every form input — label + asterisk + helper + error (N3) |
| `Input` | `components/common/Input/` | Group, Broker Email, Broker Phone, account search input (N3) |
| `Button` | `components/common/Button/` | + Add Document, Create Submission, Cancel (N4, N5) |
| `Avatar` | `components/common/Avatar/` | Underwriter / specialist person dropdown items (N3) |
| `StatRow` | `components/common/StatRow/` | Each Summary Preview row (N2) |
| `ErrorBoundary` | `components/common/ErrorBoundary/` | 4 region wrappers (N1) |
| `PanelErrorState` | `components/common/PanelErrorState/` | Region error fallback (N1) |
| `StatusBadge` | `components/domain/StatusBadge/` | Stage Progress current-stage tag (N2) |

### Atoms introduced by other N-phases (do NOT add in N1)

N1 must NOT create or export:
- `SectionPanel` — N2 introduces
- `Alert` — N2
- `StageProgress` — N2
- `SubmissionTypeCard` — N2
- `Select` — N3
- `MultiSelect` — N3
- `DateInput` — N3
- `AccountSearchInput` — N3
- `FileDropzone` — N4

### Wrong patterns — automatic rework (apply through all N phases)

❌ Inline `<label>` + `<input>` markup. Use `FormField`.
❌ White-card-with-header markup inline. Use `SectionPanel` (N2+).
❌ Hand-rolled select / dropdown. Use `Select` / `MultiSelect` (N3+).
❌ Hand-rolled date input styling. Use `DateInput` (N3+).
❌ Inline label/value rows in summary panels. Use `StatRow`.
❌ Per-section bespoke markup that duplicates an existing atom.

## Architecture

### Form state ownership

Single `react-hook-form` `<FormProvider>` lives at the page level, owns the entire form state, exposes context to all sections via `useFormContext`. Unlike list page (URL params), form pages need RHF.

**Why RHF + zod (not URL state, not Redux):**
- Form has 15+ fields including nested objects and arrays
- Validation rules cross fields (need-by ≤ effective < expiration)
- Don't expose draft data in URL on every keystroke
- Zod schema doubles as runtime validation + TypeScript type derivation

### Page layout

```tsx
function SubmissionsNewPage() {
  const formMethods = useForm<NewSubmissionFormValues>({
    resolver: zodResolver(newSubmissionSchema),
    defaultValues: NEW_SUBMISSION_DEFAULT_VALUES,
    mode: 'onBlur',
  });

  return (
    <FormProvider {...formMethods}>
      <div
        className="grid grid-cols-1 lg:grid-cols-[1fr_minmax(280px,360px)]"
        style={{ padding: ..., gap: ... }}
      >
        <div className="lg:col-span-2">
          <ErrorBoundary fallback={<PanelErrorState panelName="Header" />}>
            <NewSubmissionHeaderContainer />
          </ErrorBoundary>
        </div>

        <ErrorBoundary fallback={<PanelErrorState panelName="Form" />}>
          <NewSubmissionFormContainer />
        </ErrorBoundary>

        <div className="flex flex-col" style={{ gap: ... }}>
          <ErrorBoundary fallback={<PanelErrorState panelName="Sidebar" />}>
            <NewSubmissionSidebarContainer />
          </ErrorBoundary>
          <ErrorBoundary fallback={<PanelErrorState panelName="Actions" />}>
            <NewSubmissionActionsContainer />
          </ErrorBoundary>
        </div>
      </div>
    </FormProvider>
  );
}
```

In N1, all 4 containers render `<div data-testid="...-placeholder">Loading…</div>`. Real content in N2-N5.

## Files to create

### Routing
- `src/app/router.tsx` — **edit only**, add one route

### Page + containers + components
- `src/features/submissions-new/pages/SubmissionsNewPage.tsx`
- `src/containers/submissions-new/NewSubmissionHeaderContainer.tsx`
- `src/containers/submissions-new/NewSubmissionFormContainer.tsx`
- `src/containers/submissions-new/NewSubmissionSidebarContainer.tsx`
- `src/containers/submissions-new/NewSubmissionActionsContainer.tsx`
- `src/containers/submissions-new/index.ts` (re-exports)
- `src/components/domain/NewSubmissionHeader/{NewSubmissionHeader.tsx, index.ts}`
- `src/components/domain/NewSubmissionForm/{NewSubmissionForm.tsx, index.ts}`
- `src/components/domain/NewSubmissionSidebar/{NewSubmissionSidebar.tsx, index.ts}`
- `src/components/domain/NewSubmissionActions/{NewSubmissionActions.tsx, index.ts}`

### Form schema + types
- `src/features/submissions-new/schema/newSubmissionSchema.ts`
- `src/features/submissions-new/schema/defaultValues.ts`
- `src/shared/types/newSubmission.ts`
- `src/shared/types/index.ts` — re-export

### Service layer
- `src/services/submissions/submissionsApi.ts` — **extend**, add 2 mutations + 3 lookup queries
- `src/services/submissions/mocks/accountsMock.ts` — NEW (verbatim data below)
- `src/services/submissions/mocks/brokeragesMock.ts` — NEW (verbatim data below)
- `src/services/submissions/mocks/underwritersMock.ts` — NEW (verbatim data below)

### Tokens
- `src/theme/tokens.ts` — **extend** with section 13 (`newSubmissionRouteDims` + label maps)

### Wire navigation (conditional on S2 status)
- `src/components/domain/SubmissionsHeader/SubmissionsHeader.tsx` — change New Submission button onClick to `navigate('/submissions/new')`. Edit only if S2 implemented.

## Type definitions

```ts
// src/shared/types/newSubmission.ts
import { z } from 'zod';
import type { newSubmissionSchema } from '@/features/submissions-new/schema/newSubmissionSchema';
import type { ProductLine } from './submissions';  // existing

export type NewSubmissionFormValues = z.infer<typeof newSubmissionSchema>;

export type SubmissionType = 'NewBusiness' | 'CrossSell' | 'Renewal';

export type SubmissionStage =
  | 'IncompleteSubmission'
  | 'IntakeAndTriage'
  | 'Underwriting'
  | 'Quoting'
  | 'Decision'
  | 'PostBind';

export interface AccountLookup {
  id: string;
  name: string;
  city: string;
  state: string;       // 2-letter
  type: string;        // institution type
}

export interface BrokerageLookup {
  id: string;
  name: string;
  contacts: BrokerContactLookup[];
}

export interface BrokerContactLookup {
  id: string;
  name: string;
  email: string;
  phone: string;
  brokerageId: string;
}

export interface UnderwriterLookup {
  id: string;
  name: string;
  role: 'underwriter' | 'specialist';
}

export interface CreateSubmissionPayload {
  type: SubmissionType;
  accountId: string;
  group?: string;
  productLines: ProductLine[];
  needByDate: string;
  effectiveDate: string;
  expirationDate: string;
  brokerageId?: string;
  brokerContactId?: string;
  underwriterId?: string;
  underwritingSpecialistId?: string;
  documentIds: string[];
}

export interface CreateSubmissionResponse {
  id: string;
  subId: string;       // SUB-NNNN format
}

export interface UploadDocumentPayload { file: File; }
export interface UploadDocumentResponse {
  id: string;
  filename: string;
  size: number;
}
```

## Zod schema

```ts
// src/features/submissions-new/schema/newSubmissionSchema.ts
import { z } from 'zod';

export const SUBMISSION_TYPES = ['NewBusiness', 'CrossSell', 'Renewal'] as const;
export const PRODUCT_LINE_VALUES = [
  'EPL', 'ELL', 'GL', 'ML', 'Cyber', 'Property', 'Crime', 'Auto', 'SA',
] as const;

const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD');

export const newSubmissionSchema = z.object({
  type: z.enum(SUBMISSION_TYPES),
  accountId: z.string().min(1, 'Account is required'),
  group: z.string().optional(),
  productLines: z.array(z.enum(PRODUCT_LINE_VALUES)).min(1, 'Select at least one product line'),
  needByDate: dateString,
  effectiveDate: dateString,
  expirationDate: dateString,
  brokerageId: z.string().optional(),
  brokerContactId: z.string().optional(),
  brokerEmail: z.string().email().optional().or(z.literal('')),
  brokerPhone: z.string().optional(),
  underwriterId: z.string().optional(),
  underwritingSpecialistId: z.string().optional(),
  documentIds: z.array(z.string()).default([]),
}).refine(
  data => !data.needByDate || !data.effectiveDate
    || new Date(data.needByDate) <= new Date(data.effectiveDate),
  { message: 'Need-by date must be on or before effective date', path: ['effectiveDate'] },
).refine(
  data => !data.effectiveDate || !data.expirationDate
    || new Date(data.effectiveDate) < new Date(data.expirationDate),
  { message: 'Expiration must be after effective date', path: ['expirationDate'] },
);
```

## Default values

```ts
// src/features/submissions-new/schema/defaultValues.ts
import type { NewSubmissionFormValues } from '@/shared/types';

export const NEW_SUBMISSION_DEFAULT_VALUES: NewSubmissionFormValues = {
  type: 'NewBusiness',          // matches "selected" state in Figma
  accountId: '',
  group: '',
  productLines: [],
  needByDate: '',
  effectiveDate: '',
  expirationDate: '',
  brokerageId: '',
  brokerContactId: '',
  brokerEmail: '',
  brokerPhone: '',
  underwriterId: '',
  underwritingSpecialistId: '',
  documentIds: [],
};
```

## Mock data — VERBATIM (do not regenerate)

The S4 mock drifted because the spec said "30 entries with realistic names" and Claude created entries from imagination. To prevent recurrence, **the entire mock data is listed here**. Copy into the mock files exactly.

### `accountsMock.ts` — 30 entries

```ts
import type { AccountLookup } from '@/shared/types';

export const MOCK_ACCOUNTS: AccountLookup[] = [
  { id: 'acc-001', name: 'Jefferson County Public Schools',     city: 'Louisville',     state: 'KY', type: 'School District' },
  { id: 'acc-002', name: 'Wake County Public School System',    city: 'Raleigh',        state: 'NC', type: 'School District' },
  { id: 'acc-003', name: 'Houston ISD',                         city: 'Houston',        state: 'TX', type: 'School District' },
  { id: 'acc-004', name: 'Riverside Unified School District',   city: 'Riverside',      state: 'CA', type: 'School District' },
  { id: 'acc-005', name: 'Fairfax County Public Schools',       city: 'Fairfax',        state: 'VA', type: 'School District' },
  { id: 'acc-006', name: 'San Diego City Unified SD',           city: 'San Diego',      state: 'CA', type: 'School District' },
  { id: 'acc-007', name: 'Montgomery County Public Schools',    city: 'Rockville',      state: 'MD', type: 'School District' },
  { id: 'acc-008', name: 'Seattle Public Schools',              city: 'Seattle',        state: 'WA', type: 'School District' },
  { id: 'acc-009', name: 'Palm Beach County School District',   city: 'West Palm Beach',state: 'FL', type: 'School District' },
  { id: 'acc-010', name: 'Austin ISD',                          city: 'Austin',         state: 'TX', type: 'School District' },
  { id: 'acc-011', name: 'Boston Public Schools',               city: 'Boston',         state: 'MA', type: 'School District' },
  { id: 'acc-012', name: 'Chicago Public Schools',              city: 'Chicago',        state: 'IL', type: 'School District' },
  { id: 'acc-013', name: 'Denver Public Schools',               city: 'Denver',         state: 'CO', type: 'School District' },
  { id: 'acc-014', name: 'Atlanta Public Schools',              city: 'Atlanta',        state: 'GA', type: 'School District' },
  { id: 'acc-015', name: 'Phoenix Union High School District',  city: 'Phoenix',        state: 'AZ', type: 'School District' },
  { id: 'acc-016', name: 'Stanford University',                 city: 'Stanford',       state: 'CA', type: 'University' },
  { id: 'acc-017', name: 'Yale University',                     city: 'New Haven',      state: 'CT', type: 'University' },
  { id: 'acc-018', name: 'Duke University',                     city: 'Durham',         state: 'NC', type: 'University' },
  { id: 'acc-019', name: 'University of Michigan',              city: 'Ann Arbor',      state: 'MI', type: 'University' },
  { id: 'acc-020', name: 'Vanderbilt University',               city: 'Nashville',      state: 'TN', type: 'University' },
  { id: 'acc-021', name: 'Aspire Public Schools',               city: 'Oakland',        state: 'CA', type: 'Charter Network' },
  { id: 'acc-022', name: 'KIPP Foundation',                     city: 'San Francisco',  state: 'CA', type: 'Charter Network' },
  { id: 'acc-023', name: 'IDEA Public Schools',                 city: 'Weslaco',        state: 'TX', type: 'Charter Network' },
  { id: 'acc-024', name: 'Success Academy Charter Schools',     city: 'New York',       state: 'NY', type: 'Charter Network' },
  { id: 'acc-025', name: 'Uncommon Schools',                    city: 'New York',       state: 'NY', type: 'Charter Network' },
  { id: 'acc-026', name: 'St. Catherine\'s Academy',            city: 'New York',       state: 'NY', type: 'Independent School' },
  { id: 'acc-027', name: 'Phillips Exeter Academy',             city: 'Exeter',         state: 'NH', type: 'Independent School' },
  { id: 'acc-028', name: 'Choate Rosemary Hall',                city: 'Wallingford',    state: 'CT', type: 'Independent School' },
  { id: 'acc-029', name: 'Harmony Science Academy',             city: 'Houston',        state: 'TX', type: 'Charter Network' },
  { id: 'acc-030', name: 'Greenwood Charter Academy',           city: 'Indianapolis',   state: 'IN', type: 'Charter Network' },
];
```

### `brokeragesMock.ts` — 8 brokerages (with contacts)

```ts
import type { BrokerageLookup } from '@/shared/types';

export const MOCK_BROKERAGES: BrokerageLookup[] = [
  {
    id: 'brk-001', name: 'Marsh McLennan',
    contacts: [
      { id: 'bc-001', brokerageId: 'brk-001', name: 'Sarah Goldberg',  email: 'sgoldberg@marshmclennan.com',  phone: '(212) 555-0101' },
      { id: 'bc-002', brokerageId: 'brk-001', name: 'David Park',      email: 'dpark@marshmclennan.com',      phone: '(212) 555-0102' },
      { id: 'bc-003', brokerageId: 'brk-001', name: 'Linda Chen',      email: 'lchen@marshmclennan.com',      phone: '(212) 555-0103' },
    ],
  },
  {
    id: 'brk-002', name: 'Willis Towers Watson',
    contacts: [
      { id: 'bc-004', brokerageId: 'brk-002', name: 'Michael Roberts', email: 'mroberts@wtw.com',             phone: '(312) 555-0201' },
      { id: 'bc-005', brokerageId: 'brk-002', name: 'Jennifer Wu',     email: 'jwu@wtw.com',                  phone: '(312) 555-0202' },
    ],
  },
  {
    id: 'brk-003', name: 'Gallagher Education',
    contacts: [
      { id: 'bc-006', brokerageId: 'brk-003', name: 'Robert Diaz',     email: 'rdiaz@gallagher.com',          phone: '(630) 555-0301' },
      { id: 'bc-007', brokerageId: 'brk-003', name: 'Amanda Foster',   email: 'afoster@gallagher.com',        phone: '(630) 555-0302' },
      { id: 'bc-008', brokerageId: 'brk-003', name: 'Kevin Patel',     email: 'kpatel@gallagher.com',         phone: '(630) 555-0303' },
    ],
  },
  {
    id: 'brk-004', name: 'Lockton Companies',
    contacts: [
      { id: 'bc-009', brokerageId: 'brk-004', name: 'Patricia Nguyen', email: 'pnguyen@lockton.com',          phone: '(816) 555-0401' },
      { id: 'bc-010', brokerageId: 'brk-004', name: 'Thomas Brown',    email: 'tbrown@lockton.com',           phone: '(816) 555-0402' },
    ],
  },
  {
    id: 'brk-005', name: 'Alliant Insurance',
    contacts: [
      { id: 'bc-011', brokerageId: 'brk-005', name: 'Rachel Silverman',email: 'rsilverman@alliant.com',       phone: '(949) 555-0501' },
      { id: 'bc-012', brokerageId: 'brk-005', name: 'James Carter',    email: 'jcarter@alliant.com',          phone: '(949) 555-0502' },
      { id: 'bc-013', brokerageId: 'brk-005', name: 'Sophia Martinez', email: 'smartinez@alliant.com',        phone: '(949) 555-0503' },
    ],
  },
  {
    id: 'brk-006', name: 'Arthur J. Gallagher',
    contacts: [
      { id: 'bc-014', brokerageId: 'brk-006', name: 'Daniel Kim',      email: 'dkim@ajg.com',                 phone: '(630) 555-0601' },
      { id: 'bc-015', brokerageId: 'brk-006', name: 'Emily Johnson',   email: 'ejohnson@ajg.com',             phone: '(630) 555-0602' },
    ],
  },
  {
    id: 'brk-007', name: 'Aon plc',
    contacts: [
      { id: 'bc-016', brokerageId: 'brk-007', name: 'Christopher Lee', email: 'clee@aon.com',                 phone: '(312) 555-0701' },
      { id: 'bc-017', brokerageId: 'brk-007', name: 'Olivia Thompson', email: 'othompson@aon.com',            phone: '(312) 555-0702' },
    ],
  },
  {
    id: 'brk-008', name: 'HUB International',
    contacts: [
      { id: 'bc-018', brokerageId: 'brk-008', name: 'Brian Wallace',   email: 'bwallace@hubinternational.com',phone: '(312) 555-0801' },
      { id: 'bc-019', brokerageId: 'brk-008', name: 'Diana Hayes',     email: 'dhayes@hubinternational.com',  phone: '(312) 555-0802' },
    ],
  },
];
```

### `underwritersMock.ts` — 10 entries

```ts
import type { UnderwriterLookup } from '@/shared/types';

export const MOCK_UNDERWRITERS: UnderwriterLookup[] = [
  { id: 'uw-001', name: 'Robert Chen',         role: 'underwriter' },
  { id: 'uw-002', name: 'John Michaels',       role: 'underwriter' },
  { id: 'uw-003', name: 'Sarah Marquez',       role: 'underwriter' },
  { id: 'uw-004', name: 'Maria Hernandez',     role: 'underwriter' },
  { id: 'uw-005', name: 'James Anderson',      role: 'underwriter' },
  { id: 'uw-006', name: 'Priya Sharma',        role: 'specialist' },
  { id: 'uw-007', name: 'David Thompson',      role: 'specialist' },
  { id: 'uw-008', name: 'Emily Rodriguez',     role: 'specialist' },
  { id: 'uw-009', name: 'Michael O\'Brien',    role: 'specialist' },
  { id: 'uw-010', name: 'Jennifer Whitaker',   role: 'specialist' },
];
```

## Service additions (`submissionsApi.ts`)

Existing endpoints untouched. Add to the `endpoints: builder => ({ ... })` block:

```ts
import { MOCK_ACCOUNTS } from './mocks/accountsMock';
import { MOCK_BROKERAGES } from './mocks/brokeragesMock';
import { MOCK_UNDERWRITERS } from './mocks/underwritersMock';

// Mutation: create submission
createSubmission: builder.mutation<CreateSubmissionResponse, CreateSubmissionPayload>({
  query: (body) => ({ url: '/submissions', method: 'POST', body }),
  queryFn: async (_payload) => {
    await new Promise(r => setTimeout(r, 300));
    const subNumber = 7900 + Math.floor(Math.random() * 100);
    return {
      data: {
        id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `id-${Date.now()}`,
        subId: `SUB-${subNumber}`,
      },
    };
  },
}),

// Mutation: upload document (stub for N4)
uploadDocument: builder.mutation<UploadDocumentResponse, UploadDocumentPayload>({
  query: ({ file }) => {
    const fd = new FormData();
    fd.append('file', file);
    return { url: '/documents', method: 'POST', body: fd };
  },
  queryFn: async ({ file }) => {
    await new Promise(r => setTimeout(r, 500));
    return {
      data: {
        id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `doc-${Date.now()}`,
        filename: file.name,
        size: file.size,
      },
    };
  },
}),

// Lookup: account search (typeahead)
searchAccounts: builder.query<AccountLookup[], { q: string }>({
  query: ({ q }) => ({ url: '/lookup/accounts', params: { q } }),
  queryFn: async ({ q }) => {
    await new Promise(r => setTimeout(r, 100));
    const lower = q.trim().toLowerCase();
    const matches = lower.length === 0
      ? MOCK_ACCOUNTS.slice(0, 10)
      : MOCK_ACCOUNTS.filter(a =>
          a.name.toLowerCase().includes(lower)
          || a.city.toLowerCase().includes(lower)
          || a.type.toLowerCase().includes(lower)
        ).slice(0, 10);
    return { data: matches };
  },
}),

// Lookup: brokerages
getBrokerages: builder.query<BrokerageLookup[], void>({
  query: () => ({ url: '/lookup/brokerages' }),
  queryFn: async () => {
    await new Promise(r => setTimeout(r, 80));
    return { data: MOCK_BROKERAGES };
  },
}),

// Lookup: underwriters
getUnderwriters: builder.query<UnderwriterLookup[], void>({
  query: () => ({ url: '/lookup/underwriters' }),
  queryFn: async () => {
    await new Promise(r => setTimeout(r, 80));
    return { data: MOCK_UNDERWRITERS };
  },
}),
```

Hook exports auto-generated by RTK Query:
- `useCreateSubmissionMutation`
- `useUploadDocumentMutation`
- `useSearchAccountsQuery`
- `useGetBrokeragesQuery`
- `useGetUnderwritersQuery`

## Tokens to add (section 13, NEW)

For N1 only the page-shell dims and label maps. Per Property Strictness Rule, N2-N4 will append visual tokens after their figma-rest fetches.

```ts
// ============================================================
// 13. NEW SUBMISSION ROUTE (Phase N1 foundation; expanded in N2-N4)
// ============================================================

export type SubmissionType = 'NewBusiness' | 'CrossSell' | 'Renewal';
export type SubmissionStage =
  | 'IncompleteSubmission' | 'IntakeAndTriage' | 'Underwriting'
  | 'Quoting' | 'Decision' | 'PostBind';

export const newSubmissionRouteDims = {
  pagePaddingX: 32,
  pagePaddingY: 24,
  columnsGap: 24,
  sidebarMinWidth: 280,
  sidebarMaxWidth: 360,
} as const;

// Type identifier → human label
export const submissionTypeLabels: Record<SubmissionType, string> = {
  NewBusiness: 'New Business',
  CrossSell:   'Cross-Sell',
  Renewal:     'Renewal',
};

export const SUBMISSION_TYPES_DISPLAY_ORDER: SubmissionType[] = [
  'NewBusiness', 'CrossSell', 'Renewal',
];

export const submissionStageLabels: Record<SubmissionStage, string> = {
  IncompleteSubmission: 'Incomplete Submission',
  IntakeAndTriage:      'Intake & Triage',
  Underwriting:         'Underwriting',
  Quoting:              'Quoting',
  Decision:             'Decision',
  PostBind:             'Post-Bind',
};

export const SUBMISSION_STAGES_DISPLAY_ORDER: SubmissionStage[] = [
  'IncompleteSubmission', 'IntakeAndTriage', 'Underwriting',
  'Quoting', 'Decision', 'PostBind',
];
```

## Routing

```tsx
// In src/app/router.tsx
<Route element={<AppShell />}>
  <Route path="/dashboard"        element={<DashboardPage />} />
  <Route path="/submissions"      element={<SubmissionsPage />} />
  <Route path="/submissions/new"  element={<SubmissionsNewPage />} />   {/* ADD */}
</Route>
```

## Library installs

```bash
npm install react-hook-form zod @hookform/resolvers
```

## Acceptance criteria

1. ✅ `npm install` clean — no peer dep warnings
2. ✅ `npm run lint` passes
3. ✅ `npm run type-check` passes
4. ✅ `/submissions/new` renders without console errors
5. ✅ All 4 ErrorBoundary regions render placeholders
6. ✅ Throwing inside any 1 region triggers `PanelErrorState`; other 3 still render
7. ✅ `useCreateSubmissionMutation()` returns `{ id, subId: 'SUB-79XX' }` after ~300ms
8. ✅ `useUploadDocumentMutation()` exists and returns `{ id, filename, size }` after ~500ms
9. ✅ `useSearchAccountsQuery({ q: '' })` returns first 10 accounts
10. ✅ `useSearchAccountsQuery({ q: 'jefferson' })` returns Jefferson County Public Schools as first match
11. ✅ `useGetBrokeragesQuery()` returns 8 brokerages with their contacts
12. ✅ `useGetUnderwritersQuery()` returns 10 underwriters (5 underwriter + 5 specialist)
13. ✅ `<FormProvider>` mounted; `useFormContext()` works in all 4 containers
14. ✅ Default form values match schema; `formState.isValid === false` initially
15. ✅ At 1280px / 1024px / 768px: page never horizontal-scrolls; sidebar stacks below form at narrow widths
16. ✅ All new files in INDEX.md after `npm run index`
17. ✅ tokens.ts cumulative — section 13 appended; sections 1-12 untouched
18. ✅ N1 did NOT add to INDEX: `SectionPanel`, `Alert`, `Select`, `MultiSelect`, `DateInput`, `StageProgress`, `FileDropzone`, `SubmissionTypeCard`, `AccountSearchInput`
19. ✅ (If S2 implemented) "+ New Submission" button on `/submissions` navigates to `/submissions/new`
20. ✅ (If S2 not implemented) note added to NEW_SUBMISSION_TRACKER.md
21. ✅ NEW_SUBMISSION_TRACKER.md updated: N1 row → implemented
22. ✅ Confirmation table posted (per prompt Step 12)

## What ships visually after N1

A mostly-blank `/submissions/new` page with 4 small "Loading…" placeholders in a 2-column layout. Sidebar nav highlights "Submissions". **Intentional.**

## Phase N2 preview

N2 introduces 3 new shared atoms (`SectionPanel`, `Alert`, `StageProgress`) + 1 domain atom (`SubmissionTypeCard`), then uses them for the header band, Submission Type cards, Stage Progress sidebar, and Summary Preview (which uses existing `StatRow`). N2 will require ~7 figma-rest node IDs (provided by user) for high-precision token mapping.