# New Submission Phase N4 — Submission Documents

> Status: spec ready
> Track: N-track. Prerequisite: N1 + N2 + N3 implemented.
> Default Decisions from tracker apply (placeholder pattern, variant strategy, helper colors).

## Goal

Replace the placeholder Submission Documents region (deferred since N2) with the full drag-drop file upload section. Users can drop files (or click to browse), each file uploads eagerly per drop, document references accumulate in form state, the section header badge updates with success count, and the Sidebar Summary Preview's DOCS row reflects the count. Failed uploads show error inline with retry. After N4 ships, the form is feature-complete except for the actual Create/Cancel button submit logic (N5).

## Out of scope

Create/Cancel button wiring (N5), success redirect after submit (N5), drag-to-reorder files (future), document type selection beyond default "Application Form" (future), file preview implementation beyond opening the presigned URL (could be deferred to N5).

## Visual scope

User provided 5 node IDs:

| # | Node ID | Element | Source for |
|---|---|---|---|
| 1 | `520-31072` | Submission Documents section panel | Section header (with badge + + Add Document button), overall layout |
| 2 | `520-31261` | Drop zone (drag-drop block) | Empty drop zone styling — paperclip icon + 2-line text + bordered dashed area |
| 3 | `520-15008` | Files-list container | Wrapper holding file rows below drop zone |
| 4 | `520-15009` | Single file row variant | Successful upload row — PDF icon + filename + size + tag + "Just now" + view + remove |
| 5 | `520-14407` | Uploaded file list item | Likely same as #4 or alternate state — fetch and disambiguate |

## Atom introduced

`FileDropzone` — at `src/components/common/FileDropzone/`

NOT added: any other atoms (N5 reserves nothing critical for atoms).

## Existing atoms reused

`SectionPanel` (from N2 — its `badge` and `action` props finally get used; `+ Add Document` button is the action), `Button` (Add Document button + view/remove buttons within file rows), `ErrorBoundary`/`PanelErrorState`, `Alert` (from N3 — variant `error` for upload failures if needed at section level).

## Components introduced / updated

NEW domain component:

```
components/domain/SubmissionDocumentsSection/
  SubmissionDocumentsSection.tsx
  index.ts
```

UPDATED existing:

- `NewSubmissionForm.tsx` — insert `<SubmissionDocumentsSection />` between Broker & Contacts and Underwriting Team (per Figma render order)
- `NewSubmissionSidebar.tsx` — DOCS row in Summary Preview now reads `documentIds.length` from form state; shows `"X attached"` if > 0, else `"None"`
- `submissionsApi.ts` — `useUploadDocumentMutation` extended response shape (see § Mock data shape extension)
- `tokens.ts` — append section 13.l with `fileDropzoneStyles` and `submissionDocumentsStyles`

## Atom contract — `FileDropzone`

**Purpose:** drag-drop zone + uploaded file list. Handles upload lifecycle internally; emits document changes via callback. Used 1× in N4 but designed for reuse.

**Props:**
- `value: UploadedDocument[]` — current document state (lives in form state via RHF Controller)
- `onChange: (docs: UploadedDocument[]) => void` — fires whenever the document list changes (file added, file removed, upload succeeded, upload failed)
- `accept?: string` — accept attribute string for native file input (default `'.pdf,.docx,.xlsx,.png'` — extracted from Figma drop zone hint text)
- `maxSizeBytes?: number` — only used for display in hint text; no client-side enforcement (per user direction Q2)
- `disabled?: boolean`

**`UploadedDocument` type (NEW — add to `src/shared/types/newSubmission.ts`):**
```ts
export interface UploadedDocument {
  clientId: string;              // local UUID assigned on drop, used for keying in React lists
  filename: string;
  size: number;                  // bytes
  status: 'uploading' | 'success' | 'error';
  // Populated on success:
  serverId?: string;             // returned from upload mutation
  presignedUrl?: string;         // returned from upload mutation; used for view button
  uploadedAt?: string;           // ISO timestamp set when upload returns success
  // Populated on error:
  errorMessage?: string;
  // Optional:
  documentTag?: string;          // 'Application Form' default; future: user can change
}
```

**Internal state machine per file:**
- On drop / file picker selection: each file gets `clientId = crypto.randomUUID()`, status `'uploading'`, immediately added to the docs array via onChange
- Mutation fires for each file in parallel
- On mutation success: update that file's entry to `status: 'success'` with `serverId`, `presignedUrl`, `uploadedAt`
- On mutation error: update that file's entry to `status: 'error'` with `errorMessage`
- Retry button (error state): re-fires mutation for that single file, sets status back to `'uploading'`
- Remove button: filters that file out of the array

**Visual states (verify each against Figma JSON):**

| State | Behavior |
|---|---|
| Empty drop zone | Paperclip icon + "Drop files here or click to browse" + "PDF, DOCX, XLSX, PNG · Max 25 MB per file" |
| Drag-over | Border color/style change (extract from Figma if hover variant exists; else ask) |
| Click anywhere on drop zone | Triggers hidden `<input type="file" multiple>` |
| File row — uploading | Filename + size + (optional spinner — extract from Figma if shown; else minimal) |
| File row — success | Filename + size + tag pill ("Application Form") + "Just now" / relative time + view (eye) + remove (trash) buttons |
| File row — error | Same layout but with red error text below row + remove button + retry button (extract retry icon name from Figma; if not present, ask) |

**Internal subcomponents (NOT exported):**
- `DropZone` — the dashed-border drag-drop area (handles drag events + click-to-browse)
- `FileRow` — single file row with all 3 status variants
- `FileIcon` — PDF/DOCX/XLSX/PNG icon by extension (extract icon mapping from Figma; PDF visible in screenshot — verify others)

**Behavioral details:**
- Multi-drop supported (drop 5 files → 5 parallel uploads)
- Drag events: prevent default on `dragover` and `drop`; visually indicate drag-over by toggling a `useState<boolean>` flag on `dragenter` / `dragleave`
- File picker: hidden `<input type="file" multiple accept={accept}>` triggered by ref `.click()`
- Click on drop zone (anywhere except file rows): triggers picker
- Click on view button: `window.open(doc.presignedUrl, '_blank', 'noopener,noreferrer')`
- Click on remove button: removes file from array (no confirmation — file isn't deleted from blob storage by this UI; backend cleanup is separate)
- Click on retry: re-fires upload mutation for the single failed file

**Key consideration:** `FileDropzone` is a **stateless atom** — it doesn't hold its own list. The list lives in form state. `value` in / `onChange` out. This means `useUploadDocumentMutation` calls are made FROM the atom but state is reflected back up. Pattern: atom calls mutation imperatively (via the `[trigger, result]` tuple from RTK Query), updates the docs array via `onChange`. No internal `useState` for the document list itself.

## Mock data shape extension

Existing `useUploadDocumentMutation` from N1 currently returns `{id, filename, size}`. Extend it to:

```ts
export interface UploadDocumentResponse {
  id: string;                  // server-side document ID
  filename: string;
  size: number;
  presignedUrl: string;        // mock value: `https://mock.blob.core.windows.net/submissions/${id}?sig=mock`
  uploadedAt: string;          // ISO timestamp
}
```

When real Azure backend lands: change the mock `queryFn` to actual fetch call against backend that:
1. Requests presigned URL from backend
2. PUTs file to Azure Blob using presigned URL
3. Returns `{id, presignedUrl, ...}` to the UI

For N4 mock: simulate the round-trip with a 500ms delay (already in N1 stub), but also simulate failure occasionally so error state is testable. Suggested approach: 90% success / 10% error in mock; trigger error explicitly via filename containing "fail" for testing (e.g. user can name a file `fail-test.pdf` to verify error UI).

Document this testing convention in the mock file and the spec — Claude Code shouldn't randomize without a deterministic-test-trigger fallback.

## Form integration

In `NewSubmissionForm.tsx`, insert between Broker & Contacts and Underwriting Team:

```
- Submission Type (N2)
- Account & Identity (N3)
- Policy Dates (N3)
- Broker & Contacts (N3)
- Submission Documents (N4) ← NEW
- Underwriting Team (N3)
```

The `SubmissionDocumentsSection` component:
- Uses `<Controller>` to bind the `documentIds` form field to `FileDropzone`
- BUT the form field needs to change shape from `string[]` to `UploadedDocument[]`

**Schema change (`newSubmissionSchema.ts`):**
- Was: `documentIds: z.array(z.string()).default([])`
- Becomes: `documents: z.array(uploadedDocumentSchema).default([])`

Where `uploadedDocumentSchema` is:
```ts
const uploadedDocumentSchema = z.object({
  clientId: z.string(),
  filename: z.string(),
  size: z.number(),
  status: z.enum(['uploading', 'success', 'error']),
  serverId: z.string().optional(),
  presignedUrl: z.string().optional(),
  uploadedAt: z.string().optional(),
  errorMessage: z.string().optional(),
  documentTag: z.string().optional(),
});
```

Default value also changes:
- Was: `documentIds: []`
- Becomes: `documents: []`

**Update `CreateSubmissionPayload` type** to use `documents` instead of `documentIds`. The N5 submit logic will filter to only `status === 'success'` documents and serialize them for the create-submission payload.

**Note for N1 retro-compat:** The schema change is a breaking change to the form state shape. After N4 ships, anything that referenced `documentIds` (currently nothing in N1-N3) needs to use `documents`. Verify by grep before/after.

## Sidebar reactive update

In `NewSubmissionSidebar.tsx`, the DOCS row logic was:
- N2: hardcoded `"None"`
- N4: derive from form state
  - Count `documents.filter(d => d.status === 'success').length`
  - 0 → `"None"`
  - 1 → `"1 attached"`
  - N>1 → `"N attached"`

The badge in the SubmissionDocumentsSection's SectionPanel header uses the same count.

## Section header

`SectionPanel` from N2 renders the section. Uses both optional props for the first time:
- `title`: "SUBMISSION DOCUMENTS"
- `badge`: count of successful uploads (number, only shown when > 0; pass `undefined` when 0)
- `action`: `<Button variant="primary" /* match Figma */ leftIcon={Plus}>Add Document</Button>` — clicking this opens the file picker (same effect as clicking the drop zone)

Verify SectionPanel's existing `badge` prop styling extracted in N2 matches what Figma shows for this specific section. If the badge styling differs from N2's reference (e.g. different padding because this section is smaller): note divergence — but probably it doesn't differ.

## Tokens (section 13.l)

All TBD until figma-rest fetch. Append to tokens.ts.

```ts
// 13.l — FileDropzone + Submission Documents section
fileDropzoneStyles = {
  // Drop zone (empty + drag-over)
  dropZoneBg: TBD,
  dropZoneBorderColor: TBD,
  dropZoneBorderWidth: TBD,
  dropZoneBorderStyle: 'dashed',           // confirm from Figma
  dropZoneHeight: TBD,
  dropZonePaddingX: TBD,
  dropZonePaddingY: TBD,
  dropZoneIconSize: TBD,                    // paperclip
  dropZoneIconColor: TBD,
  dropZoneTitleSize: TBD,                   // "Drop files here or click to browse"
  dropZoneTitleColor: TBD,
  dropZoneTitleWeight: TBD,
  dropZoneHintSize: TBD,                    // "PDF, DOCX, XLSX, PNG · Max 25 MB per file"
  dropZoneHintColor: TBD,
  dropZoneItemGap: TBD,                     // gap between icon, title, hint
  // Drag-over state (extract if Figma has this variant; else ask)
  dropZoneActiveBg: TBD,
  dropZoneActiveBorderColor: TBD,

  // File list container (520-15008)
  listGap: TBD,                             // gap between file rows
  listMarginTop: TBD,                       // gap between drop zone and first file row

  // File row (520-15009 / 520-14407)
  rowHeight: TBD,
  rowPaddingX: TBD,
  rowPaddingY: TBD,
  rowBorderColor: TBD,
  rowBorderWidth: TBD,
  rowBg: TBD,
  rowGap: TBD,                              // gap between icon, name+meta, actions

  // File icon box (the "PDF" red square)
  iconBoxSize: TBD,
  iconBoxBg: TBD,
  iconBoxTextSize: TBD,
  iconBoxTextColor: TBD,
  iconBoxTextWeight: TBD,

  // Filename + meta
  filenameSize: TBD,
  filenameColor: TBD,
  filenameWeight: TBD,
  metaSize: TBD,                            // "965 KB" + tag + "Just now"
  metaColor: TBD,
  metaSeparator: TBD,                       // dot character — extract verbatim
  metaGap: TBD,

  // Document tag pill ("Application Form")
  tagBg: TBD,
  tagColor: TBD,
  tagFontSize: TBD,
  tagFontWeight: TBD,
  tagPaddingX: TBD,
  tagPaddingY: TBD,
  tagHeight: TBD,
  // Property strictness: tag cornerRadius from JSON or 0

  // Action buttons (eye + trash)
  actionGap: TBD,
  viewIconSize: TBD,
  viewIconColor: TBD,
  removeIconSize: TBD,
  removeIconColor: TBD,
  // Hover states only if Figma has interaction variants

  // Error state
  errorBg: TBD,                             // possibly subtle red tint on row
  errorTextSize: TBD,
  errorTextColor: TBD,                      // red
  errorTextMarginTop: TBD,                  // distance below filename row
  retryIconSize: TBD,
  retryIconColor: TBD,
} as const;

submissionDocumentsStyles = {
  // Section-level styling NOT covered by SectionPanel
  // (most likely empty; SectionPanel handles all the chrome)
  // If Figma shows specific spacing between badge / button / etc: add here
} as const;
```

## Acceptance criteria

1. 5 figma-rest fetches + JSON Property Dump posted
2. Property Strictness: every TBD filled from JSON
3. Schema change applied: `documentIds: string[]` → `documents: UploadedDocument[]` in schema, defaults, type definitions, mutation payload
4. lint + type-check pass
5. INDEX adds: `FileDropzone`. INDEX does NOT add: anything else (N4 has only 1 atom).
6. `useUploadDocumentMutation` mock returns extended `{id, filename, size, presignedUrl, uploadedAt}` shape
7. Mock includes deterministic failure: filename containing "fail" returns error response
8. Submission Documents section renders between Broker & Contacts and Underwriting Team in form
9. Section header shows badge count (only when > 0) + "+ Add Document" button on right
10. Click "+ Add Document" or drop zone or "click to browse" → opens file picker
11. Drop 1 file → file row appears in `uploading` state → after ~500ms → state changes to `success` with view + remove buttons + tag + "Just now"
12. Drop 5 files at once → all 5 appear in `uploading` state → all upload in parallel
13. Drop file with "fail" in name → upload returns error → row shows error message + retry + remove
14. Click retry on failed file → state goes back to `uploading` → resolves
15. Click remove on any file → row disappears from list immediately, document filtered from form state
16. Click view (eye) on success file → opens `presignedUrl` in new tab via `window.open(url, '_blank', 'noopener,noreferrer')`
17. Section header badge updates to count of `success` files (failed and uploading don't count)
18. Sidebar Summary Preview DOCS row updates: 0 → "None", 1 → "1 attached", N → "N attached"
19. Drag-over state: dragging file over drop zone visually changes border (only if Figma JSON has this variant; else minimal hover effect)
20. 1280/1024/768: no horizontal scroll; file rows stack vertically; section adapts
21. Throw inside FileDropzone → that section's ErrorBoundary catches; rest of form works
22. NEW_SUBMISSION_TRACKER.md row N4 → implemented; FileDropzone added to atom registry

## What ships after N4

Form is feature-complete except submit logic. User can:
- Drop multiple files → see them upload in parallel with state per file
- Retry failed uploads
- Remove any file (success, uploading, or failed)
- View successfully uploaded files in new tab via presigned URL
- See accurate document count in section badge + sidebar Summary Preview

The Create / Cancel buttons remain visual stubs (N5 wires them).

## Phase N5 preview

N5 wires Create button to `useCreateSubmissionMutation` with full payload (form values + filtered success documents), success → navigate to `/submissions`, error → toast/banner. Cancel button asks confirmation if form is dirty. Final a11y polish.