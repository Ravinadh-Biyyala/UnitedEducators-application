// Domain types — shared across services, store, components.
// Submission-related types (Submission, SubmissionStatus, SubmissionPriority, InstitutionType)
// live in ./submission.ts for cross-feature reuse.

export type Priority = 'Critical' | 'High' | 'Medium' | 'Low';

// Task type moved to ./task.ts for cross-feature reuse (Phase 6+).


export interface DashboardKpis {
  inReview: number;
  quoted: number;
  quotedPipeline: number;
  quotedAccounts: number;
  bound: number;
  boundPremium: number;
  avgDaysToQuote: number;
  hitRatio: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}
