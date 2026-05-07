// ─── Status / priority / institution ──────────────────────────────────────
//
// `SubmissionStatus` is PascalCase. The string form ("In Review",
// "Pending Info") is a *display label* available via
// `statusLabels[status]` from @/theme/tokens. Anywhere status appears in
// UI text, render `statusLabels[status]` — never the raw value.

export type SubmissionStatus =
  | 'New'
  | 'InReview'
  | 'Quoted'
  | 'Bound'
  | 'Declined'
  | 'PendingInfo';

export type SubmissionPriority = 'Critical' | 'High' | 'Medium' | 'Low';

export type InstitutionType = 'K-12 Public' | 'Higher Ed' | 'Charter School' | 'Private School';

export type ProductLine =
  | 'EPL' | 'ELL' | 'GL' | 'ML' | 'Cyber' | 'Property' | 'Crime' | 'Auto' | 'SA';

export interface Submission {
  id: string;
  member: string;
  state: string;
  type: InstitutionType;
  // Empty string in `assigneeInitials` / `assigneeName` => unassigned.
  assigneeInitials: string;
  assigneeName: string;
  premium: number;
  status: SubmissionStatus;
  priority: SubmissionPriority;
  effDate: string;
  docs: boolean;

  // Submissions-route-only fields. Optional on the type so the existing
  // dashboard mock (which doesn't populate them) still satisfies it.
  // The Submissions list mock populates them on every row.
  products?:        ProductLine[];
  appetite?:        number;            // 0–100
  daysOpen?:        number;
  submittedDate?:   string;            // ISO yyyy-MM-dd
  broker?:          string;
  enrolled?:        number;            // Member institution enrollment count (S4)
  submissionType?:  'NewBusiness' | 'CrossSell' | 'Renewal'; // matches SubmissionType in newSubmission.ts
  needByDate?:      string;            // ISO yyyy-MM-dd — NEED BY column
}

// ─── Submissions route (Phase S1) ─────────────────────────────────────────

export type SubmissionsScope = 'mine' | 'team' | 'all';

export type SubmissionsSortField = 'age' | 'needBy' | 'effective';

export type SubmissionsSortDirection = 'asc' | 'desc';

export interface SubmissionsSort {
  field:     SubmissionsSortField;
  direction: SubmissionsSortDirection;
}

// URL-driven filter shape. Every field is optional — the URL omits defaults.
export interface SubmissionsFilterParams {
  q?:             string;
  status?:        SubmissionStatus[];
  priority?:      SubmissionPriority[];
  products?:      ProductLine[];
  states?:        string[];
  brokers?:       string[];
  underwriters?:  string[];          // 'unassigned' | underwriter name
  submittedFrom?: string;
  submittedTo?:   string;
}

export interface SubmissionsHeaderStats {
  totalSubmissions: number;
  inReview:         number;
  quoted:           number;
  boundYtd:         number;
  boundPremiumYtd:  number;
}

export interface SubmissionsListQuery {
  scope:    SubmissionsScope;
  filters:  SubmissionsFilterParams;
  sort:     SubmissionsSort;
  page:     number;     // 1-indexed
  pageSize: number;     // default 10
}

export interface SubmissionsListResponse {
  items:    Submission[];
  total:    number;
  page:     number;
  pageSize: number;
}

export type DaysOpenSeverity = 'normal' | 'warning' | 'critical';
