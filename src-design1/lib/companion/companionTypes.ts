// Type-only extraction from the reference mockData.ts.
// Mirrors SubmissionProfile (and its nested shapes) so underwriterBrain
// and docMatrix can reason about an account without depending on the
// workbench's own mock-data layer.

export type Stage =
  | "New Submission"
  | "Information Gathering"
  | "Triage"
  | "Review In Progress"
  | "Pricing"
  | "Quoting"
  | "Quote Sent"
  | "Quote Negotiation"
  | "Bound"
  | "Declined to Quote";

export interface ClaimRow {
  id: string;
  date: string;
  type: string;
  location: string;
  paid: string;
  reserve: string;
  total: string;
  status: "Open" | "Closed";
  alert: boolean;
}

export interface CoverageRow {
  name: string;
  limit: string;
  aggregateLimit: string;
  retention: string;
  premium: string;
  factor: number;
}

export interface CompanionProduct {
  code: string;
  name: string;
  teaser: string;
  reasoning: string;
}

export interface MemberDetail {
  accountName: string;
  decPageName: string;
  preferredName: string;
  parentAccount: string;
  institutionType: string;
  subCategory: string;
  boardingOptions: string;
  underwritingTrack: string;
  educationSegment: string;
  totalEnrollment: string;
  renewalType: string;
  budget: string;
  territory: string;
  physicalAddress: string;
  physicalCity: string;
  physicalState: string;
  physicalZip: string;
  county: string;
  country: string;
}

export interface DocumentRow {
  name: string;
  type: string;
  uploaded: string;
  size: string;
  status: "Verified" | "Pending" | "Missing";
  uploadedBy: string;
}

export interface RedFlag {
  title: string;
  source: string;
  gap: string;
  action: string;
  owner: "Broker/User" | "System Automation" | "Underwriter";
}

export interface SubmissionProfile {
  id: string;
  institutionName: string;
  memberNumber: string;
  memberSince: string;
  memberType: string;
  enrollment: string;
  location: string;
  submittedDate: string;
  effectiveDate: string;
  expiryDate: string;
  needByDate: string;
  needByUrgency: string;
  expiringPremium: string;
  expiringNote: string;
  quotedPremium: string;
  quotedNote: string;
  boundPremium: string;
  boundNote: string;
  lossRatio: string;
  lossRatioNote: string;
  brokerage: string;
  brokerContact: string;
  underwriter: { name: string; title: string };
  uwSpecialist: { name: string; title: string };
  productLines: string[];
  stage: Stage;
  member: MemberDetail;
  claims: ClaimRow[];
  coverages: CoverageRow[];
  documents: DocumentRow[];
  companions: CompanionProduct[];
  greenFlags: { title: string; source: string }[];
  redFlags: RedFlag[];
  appetiteScore: number;
  claimsScore: number;
  benchmarkScore: number;
}
