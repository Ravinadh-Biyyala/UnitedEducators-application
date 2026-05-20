import type { Submission } from '@/shared/types';

/**
 * Mock data for the Submissions route list.
 *
 * S4 update — replaced the prior 25-row sampler with the EXACT 5 rows
 * shown in Figma node 520-29725 (rows 520:29894, 520:29969, 520:30043,
 * 520:30116, 520:30192). Verbatim member names, sub-IDs, products,
 * premiums, enrollment counts, appetite, days, and submitted dates as
 * extracted from the file. Status, priority, effDate filled in to
 * satisfy the type — Figma only shows status (In Review / Pending Info)
 * which is reproduced; priority/effDate are reasonable defaults.
 *
 * All 5 rows are assigned to JM/John per Figma, so the v2 "current
 * user" (for `scope: 'mine'`) is John — see
 * `submissionsApi.ts > CURRENT_USER_NAME`.
 */
export const MOCK_SUBMISSIONS_LIST: Submission[] = [
  {
    id: 'SUB-7829', member: 'Riverside Unified School District', state: 'CA',
    type: 'K-12 Public', assigneeInitials: 'JM', assigneeName: 'John',
    premium: 102_400, status: 'InReview', priority: 'High',
    effDate: 'Jul 1, 2026', docs: true,
    products: ['EPL', 'ELL', 'GL', 'Cyber'], appetite: 92, daysOpen: 18,
    submittedDate: '2026-03-15', broker: 'Gallagher Education',
    enrolled: 14_200, submissionType: 'Renewal', needByDate: '2026-06-01',
  },
  {
    id: 'SUB-7839', member: 'Fairfax County Public Schools', state: 'VA',
    type: 'K-12 Public', assigneeInitials: 'JM', assigneeName: 'John',
    premium: 96_700, status: 'InReview', priority: 'High',
    effDate: 'Jul 1, 2026', docs: true,
    products: ['EPL', 'ELL', 'ML', 'Cyber'], appetite: 87, daysOpen: 19,
    submittedDate: '2026-03-14', broker: 'Alliant Insurance',
    enrolled: 12_900, submissionType: 'NewBusiness', needByDate: '2026-06-10',
  },
  {
    id: 'SUB-7842', member: 'Montgomery County Public Schools', state: 'MD',
    type: 'K-12 Public', assigneeInitials: 'JM', assigneeName: 'John',
    premium: 88_300, status: 'PendingInfo', priority: 'Medium',
    effDate: 'Aug 1, 2026', docs: false,
    products: ['EPL', 'ELL', 'ML', 'Crime'], appetite: 76, daysOpen: 22,
    submittedDate: '2026-03-11', broker: 'Lockton Companies',
    enrolled: 11_200, submissionType: 'CrossSell', needByDate: '2026-07-15',
  },
  {
    id: 'SUB-7831', member: 'Austin ISD', state: 'TX',
    type: 'K-12 Public', assigneeInitials: 'JM', assigneeName: 'John',
    premium: 87_600, status: 'InReview', priority: 'Medium',
    effDate: 'Aug 1, 2026', docs: true,
    products: ['EPL', 'ELL', 'GL', 'Auto'], appetite: 79, daysOpen: 25,
    submittedDate: '2026-03-08', broker: 'Marsh McLennan',
    enrolled: 11_800, submissionType: 'Renewal', needByDate: '2026-07-20',
  },
  {
    id: 'SUB-7835', member: 'Minneapolis Public Schools', state: 'MN',
    type: 'K-12 Public', assigneeInitials: 'JM', assigneeName: 'John',
    premium: 54_200, status: 'InReview', priority: 'Low',
    effDate: 'Sep 1, 2026', docs: true,
    products: ['EPL', 'GL', 'Crime'], appetite: 81, daysOpen: 28,
    submittedDate: '2026-03-05', broker: 'Gallagher Education',
    enrolled: 7_100, submissionType: 'NewBusiness',
  },
];
