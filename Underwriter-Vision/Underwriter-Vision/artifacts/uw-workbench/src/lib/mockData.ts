// Mock data lifted from src-design — preserves all sample fields the underwriter depends on.

export type SubStatus = "In Review" | "Quoted" | "Bound" | "Declined" | "Pending Info";
export type Priority = "Critical" | "High" | "Medium" | "Low";
export type Stage =
  | "Incomplete Submission" | "Complete Submission" | "Declined to Quote"
  | "Information Gathering" | "Review In Progress" | "Referred"
  | "Quote In Progress" | "Quote Sent" | "Quote Negotiation" | "Revised Quote"
  | "Bound" | "UE Non-Renewed" | "Member Declined" | "Member No Response"
  | "Pending Issuance" | "Issued" | "Cancelled" | "Endorsed";

export interface Submission {
  id: string;
  member: string;
  shortName: string;
  type: string;
  state: string;
  premium: string;
  premiumVal: number;
  expiringPremium: string;
  status: SubStatus;
  stage: Stage;
  assignee: string;
  assigneeInitials: string;
  broker: string;
  brokerContact: string;
  submitted: string;
  effectiveDate: string;
  expiryDate: string;
  appetite: number;
  priority: Priority;
  docsComplete: boolean;
  daysOpen: number;
  needByDate: string;
  needByUrgency: string;
  enrollment: string;
  city: string;
  productLines: string[];
  lossRatio: string;
  reviewProgress: number; // 0–6 reviews done out of 6
}

export const STAGE_GROUPS: { group: string; color: string; options: Stage[] }[] = [
  { group: "Intake & Triage", color: "#7A8FA3", options: ["Incomplete Submission", "Complete Submission", "Declined to Quote"] },
  { group: "Underwriting", color: "#0123D4", options: ["Information Gathering", "Review In Progress", "Referred"] },
  { group: "Quoting", color: "#7B2FBE", options: ["Quote In Progress", "Quote Sent", "Quote Negotiation", "Revised Quote"] },
  { group: "Decision", color: "#1A7A4A", options: ["Bound", "UE Non-Renewed", "Member Declined", "Member No Response"] },
  { group: "Post-Bind", color: "#C9A227", options: ["Pending Issuance", "Issued", "Cancelled", "Endorsed"] },
];

export function stageColor(stage: Stage): string {
  return STAGE_GROUPS.find(g => g.options.includes(stage))?.color ?? "#7A8FA3";
}
export function stageGroup(stage: Stage): string {
  return STAGE_GROUPS.find(g => g.options.includes(stage))?.group ?? "";
}

export const SUBMISSIONS: Submission[] = [
  { id: "SUB-7829", member: "Brookfield Day School", shortName: "Brookfield Day", type: "Private K-12", state: "CT", premium: "$142,800", premiumVal: 142800, expiringPremium: "$132,400", status: "In Review", stage: "Review In Progress", assignee: "Maya Khanna", assigneeInitials: "MK", broker: "Marsh McLennan Agency", brokerContact: "Tyler Owens", submitted: "Mar 15, 2024", effectiveDate: "Jun 1, 2026", expiryDate: "Jun 1, 2027", appetite: 82, priority: "High", docsComplete: true, daysOpen: 11, needByDate: "Apr 28, 2026", needByUrgency: "7 days", enrollment: "842 students", city: "Westport, CT", productLines: ["EPL","ELL","GL","Cyber"], lossRatio: "58%", reviewProgress: 4 },
  { id: "SUB-7830", member: "San Diego City Schools", shortName: "San Diego CS", type: "K-12 Public", state: "CA", premium: "$284,000", premiumVal: 284000, expiringPremium: "$268,000", status: "Quoted", stage: "Quote Sent", assignee: "Tom Lee", assigneeInitials: "TL", broker: "Marsh McLennan", brokerContact: "Ashleigh Choi", submitted: "Mar 12, 2024", effectiveDate: "Aug 1, 2024", expiryDate: "Aug 1, 2025", appetite: 88, priority: "Medium", docsComplete: true, daysOpen: 14, needByDate: "Apr 24, 2024", needByUrgency: "5 days", enrollment: "98,400 students", city: "San Diego, CA", productLines: ["EPL","ELL","GL","Property"], lossRatio: "42%", reviewProgress: 6 },
  { id: "SUB-7831", member: "Austin Independent School District", shortName: "Austin ISD", type: "K-12 Public", state: "TX", premium: "$195,000", premiumVal: 195000, expiringPremium: "$184,000", status: "Pending Info", stage: "Information Gathering", assignee: "Maya Khanna", assigneeInitials: "MK", broker: "Willis Towers Watson", brokerContact: "S. Patel", submitted: "Mar 10, 2024", effectiveDate: "Jul 1, 2024", expiryDate: "Jul 1, 2025", appetite: 74, priority: "High", docsComplete: false, daysOpen: 16, needByDate: "Apr 20, 2024", needByUrgency: "3 days", enrollment: "73,000 students", city: "Austin, TX", productLines: ["EPL","ELL","GL"], lossRatio: "61%", reviewProgress: 2 },
  { id: "SUB-7832", member: "Vanderbilt University", shortName: "Vanderbilt", type: "Higher Ed", state: "TN", premium: "$620,000", premiumVal: 620000, expiringPremium: "$580,000", status: "In Review", stage: "Review In Progress", assignee: "John Michaels", assigneeInitials: "JM", broker: "Aon", brokerContact: "K. Hartwell", submitted: "Mar 8, 2024", effectiveDate: "Sep 1, 2024", expiryDate: "Sep 1, 2025", appetite: 85, priority: "Medium", docsComplete: true, daysOpen: 18, needByDate: "May 1, 2024", needByUrgency: "12 days", enrollment: "13,500 students", city: "Nashville, TN", productLines: ["EPL","ELL","GL","Property","Cyber"], lossRatio: "54%", reviewProgress: 5 },
  { id: "SUB-7833", member: "Denver Public Schools", shortName: "Denver PS", type: "K-12 Public", state: "CO", premium: "$158,000", premiumVal: 158000, expiringPremium: "$152,000", status: "Bound", stage: "Bound", assignee: "Tom Lee", assigneeInitials: "TL", broker: "Gallagher Education", brokerContact: "L. Riggs", submitted: "Feb 28, 2024", effectiveDate: "Jul 1, 2024", expiryDate: "Jul 1, 2025", appetite: 91, priority: "Low", docsComplete: true, daysOpen: 28, needByDate: "—", needByUrgency: "Bound", enrollment: "88,200 students", city: "Denver, CO", productLines: ["EPL","ELL","GL"], lossRatio: "37%", reviewProgress: 6 },
  { id: "SUB-7834", member: "Phoenix Charter Academy Network", shortName: "Phoenix Charter", type: "Charter School", state: "AZ", premium: "$48,000", premiumVal: 48000, expiringPremium: "$48,000", status: "Declined", stage: "Declined to Quote", assignee: "James Owens", assigneeInitials: "JO", broker: "Brown & Riding", brokerContact: "J. Woods", submitted: "Mar 1, 2024", effectiveDate: "Jun 1, 2024", expiryDate: "Jun 1, 2025", appetite: 41, priority: "Low", docsComplete: false, daysOpen: 25, needByDate: "—", needByUrgency: "Declined", enrollment: "1,420 students", city: "Phoenix, AZ", productLines: ["EPL","GL"], lossRatio: "78%", reviewProgress: 1 },
  { id: "SUB-7835", member: "Seattle Public Schools", shortName: "Seattle PS", type: "K-12 Public", state: "WA", premium: "$231,000", premiumVal: 231000, expiringPremium: "$219,000", status: "In Review", stage: "Information Gathering", assignee: "Maya Khanna", assigneeInitials: "MK", broker: "Marsh McLennan", brokerContact: "T. Owens", submitted: "Mar 18, 2024", effectiveDate: "Jul 1, 2024", expiryDate: "Jul 1, 2025", appetite: 87, priority: "Critical", docsComplete: false, daysOpen: 8, needByDate: "Apr 19, 2024", needByUrgency: "2 days", enrollment: "53,000 students", city: "Seattle, WA", productLines: ["EPL","ELL","GL","Cyber"], lossRatio: "49%", reviewProgress: 3 },
  { id: "SUB-7836", member: "Massachusetts Inst. of Technology", shortName: "MIT", type: "Higher Ed", state: "MA", premium: "$890,000", premiumVal: 890000, expiringPremium: "$840,000", status: "Quoted", stage: "Quote Negotiation", assignee: "John Michaels", assigneeInitials: "JM", broker: "Aon", brokerContact: "K. Hartwell", submitted: "Mar 5, 2024", effectiveDate: "Jul 1, 2024", expiryDate: "Jul 1, 2025", appetite: 94, priority: "Medium", docsComplete: true, daysOpen: 21, needByDate: "Apr 30, 2024", needByUrgency: "10 days", enrollment: "11,900 students", city: "Cambridge, MA", productLines: ["EPL","ELL","GL","Property","Cyber","Crime"], lossRatio: "32%", reviewProgress: 6 },
  { id: "SUB-7837", member: "Broward County Public Schools", shortName: "Broward County", type: "K-12 Public", state: "FL", premium: "$342,000", premiumVal: 342000, expiringPremium: "$321,000", status: "In Review", stage: "Review In Progress", assignee: "James Owens", assigneeInitials: "JO", broker: "Hub International", brokerContact: "M. Fields", submitted: "Mar 20, 2024", effectiveDate: "Aug 1, 2024", expiryDate: "Aug 1, 2025", appetite: 79, priority: "Medium", docsComplete: true, daysOpen: 6, needByDate: "May 4, 2024", needByUrgency: "16 days", enrollment: "271,000 students", city: "Fort Lauderdale, FL", productLines: ["EPL","ELL","GL","Property"], lossRatio: "52%", reviewProgress: 3 },
  { id: "SUB-7838", member: "Chicago Lab Schools", shortName: "Chicago Lab", type: "Private School", state: "IL", premium: "$78,000", premiumVal: 78000, expiringPremium: "$74,000", status: "Pending Info", stage: "Information Gathering", assignee: "Tom Lee", assigneeInitials: "TL", broker: "Gallagher Education", brokerContact: "L. Riggs", submitted: "Mar 14, 2024", effectiveDate: "Sep 1, 2024", expiryDate: "Sep 1, 2025", appetite: 68, priority: "Low", docsComplete: false, daysOpen: 12, needByDate: "May 8, 2024", needByUrgency: "20 days", enrollment: "1,820 students", city: "Chicago, IL", productLines: ["EPL","ELL","GL"], lossRatio: "47%", reviewProgress: 2 },
  { id: "SUB-7840", member: "Georgetown University", shortName: "Georgetown", type: "Higher Ed", state: "DC", premium: "$540,000", premiumVal: 540000, expiringPremium: "$510,000", status: "Quoted", stage: "Quote Sent", assignee: "John Michaels", assigneeInitials: "JM", broker: "Aon", brokerContact: "R. Patel", submitted: "Mar 6, 2024", effectiveDate: "Aug 1, 2024", expiryDate: "Aug 1, 2025", appetite: 90, priority: "Medium", docsComplete: true, daysOpen: 20, needByDate: "Apr 26, 2024", needByUrgency: "8 days", enrollment: "19,800 students", city: "Washington, DC", productLines: ["EPL","ELL","GL","Property","Cyber"], lossRatio: "44%", reviewProgress: 6 },
];

export const ROLES = {
  uw: { label: "Underwriter", name: "Maya Khanna", initials: "MK", title: "Sr. UW · Northeast" },
  "sr-uw": { label: "Sr. Underwriter", name: "John Michaels", initials: "JM", title: "Sr. UW · Higher Ed" },
  lead: { label: "UW Lead", name: "Patricia Hoffman", initials: "PH", title: "Underwriting Lead" },
  director: { label: "Director", name: "Robert Chen", initials: "RC", title: "Director of Underwriting" },
};
export type RoleId = keyof typeof ROLES;

// ── Tasks ──────────────────────────────────────────────────────────────────
export interface Task {
  id: number; title: string; submission: string; submissionShort: string;
  assignee: string; due: string; priority: Priority; overdue: boolean;
  category: "documentation" | "review" | "outreach" | "verification";
}
export const TASKS: Task[] = [
  { id: 1, title: "Obtain open claims detail from broker", submission: "SUB-7829", submissionShort: "Brookfield Day", assignee: "Maya Khanna", due: "Apr 20, 2024", priority: "High", overdue: false, category: "documentation" },
  { id: 2, title: "Verify background check documentation", submission: "SUB-7829", submissionShort: "Brookfield Day", assignee: "James Owens", due: "Apr 22, 2024", priority: "High", overdue: false, category: "verification" },
  { id: 3, title: "Review GASB 68 pension liability report", submission: "SUB-7832", submissionShort: "Vanderbilt", assignee: "Tom Lee", due: "Apr 18, 2024", priority: "Medium", overdue: true, category: "review" },
  { id: 4, title: "Request missing safety questionnaire", submission: "SUB-7835", submissionShort: "Seattle PS", assignee: "Maya Khanna", due: "Apr 19, 2024", priority: "Critical", overdue: true, category: "outreach" },
  { id: 5, title: "Send indicative quote to Gallagher", submission: "SUB-7829", submissionShort: "Brookfield Day", assignee: "Maya Khanna", due: "May 5, 2024", priority: "High", overdue: false, category: "outreach" },
  { id: 6, title: "Confirm earthquake zone with surveyor", submission: "SUB-7831", submissionShort: "Austin ISD", assignee: "Maya Khanna", due: "Apr 28, 2024", priority: "Medium", overdue: false, category: "verification" },
  { id: 7, title: "Run TIV adequacy check", submission: "SUB-7836", submissionShort: "MIT", assignee: "John Michaels", due: "Apr 25, 2024", priority: "Medium", overdue: false, category: "review" },
  { id: 8, title: "Confirm COPE survey receipt", submission: "SUB-7832", submissionShort: "Vanderbilt", assignee: "James Owens", due: "Apr 17, 2024", priority: "Low", overdue: true, category: "documentation" },
  { id: 9, title: "Schedule loss-control inspection", submission: "SUB-7837", submissionShort: "Broward County", assignee: "James Owens", due: "May 2, 2024", priority: "Medium", overdue: false, category: "outreach" },
  { id: 10, title: "Cross-check NAIC code with rating sheet", submission: "SUB-7840", submissionShort: "Georgetown", assignee: "John Michaels", due: "Apr 27, 2024", priority: "Low", overdue: false, category: "review" },
];

// ── Inbox / Correspondence ─────────────────────────────────────────────────
export interface InboxThread {
  id: string;
  from: string;
  fromInitials: string;
  fromOrg: string;
  subject: string;
  preview: string;
  body: string;
  submission: string;
  submissionShort: string;
  time: string;
  unread: boolean;
  category: "broker" | "internal" | "system";
  attachments?: { name: string; size: string }[];
}
export const INBOX: InboxThread[] = [
  { id: "msg-1", from: "Tyler Owens", fromInitials: "TO", fromOrg: "Marsh McLennan", subject: "Brookfield Day — additional loss runs attached", preview: "Hi Maya, please find attached the 2024 supplemental loss run alongside the prior six years. We've also included the Sexual Misconduct addendum draft …", body: "Hi Maya,\n\nPlease find attached the 2024 supplemental loss run alongside the prior six years. We've also included the Sexual Misconduct addendum draft for your review.\n\nLet me know if anything else is required to expedite the quote — bind target remains June 1.\n\nThanks,\nTyler", submission: "SUB-7829", submissionShort: "Brookfield Day", time: "12 min ago", unread: true, category: "broker", attachments: [{ name: "Loss-Run-2024.pdf", size: "1.4 MB" }, { name: "SexMisc-Addendum.pdf", size: "412 KB" }] },
  { id: "msg-2", from: "Karen Hartwell", fromInitials: "KH", fromOrg: "Aon", subject: "Vanderbilt — counter-offer on cyber sublimit", preview: "The risk manager would like to revisit the $5M cyber sublimit. Can we discuss bumping to $7.5M with the matching retention adjustment?", body: "Hi John,\n\nThe risk manager at Vanderbilt would like to revisit the $5M cyber sublimit. Can we discuss bumping to $7.5M with the matching retention adjustment? Happy to set up a 30-min call this week.\n\nKaren", submission: "SUB-7832", submissionShort: "Vanderbilt", time: "1 hr ago", unread: true, category: "broker" },
  { id: "msg-3", from: "Underwriting Bot", fromInitials: "UE", fromOrg: "System", subject: "Comprehension complete — Seattle PS application", preview: "I finished comprehending the Seattle PS application packet. 4 review checks complete, 2 still need attention.", body: "Comprehension complete for Seattle PS (SUB-7835).\n\n• Application form: parsed ✓\n• Loss runs: 4 prior claims totaling $187K detected ✓\n• COPE survey: 12 properties recognized ✓\n• Appetite match: 87% — Strong\n• Missing: Safety Questionnaire (sent reminder to broker)\n• Missing: Background-Check policy (escalated)\n\nReady for your review.", submission: "SUB-7835", submissionShort: "Seattle PS", time: "2 hr ago", unread: true, category: "system" },
  { id: "msg-4", from: "Patricia Hoffman", fromInitials: "PH", fromOrg: "United Educators", subject: "Approval routed — MIT cyber endorsement", preview: "Approving the MIT cyber endorsement at $7.5M — consistent with the recent Northeast Higher-Ed peer cohort. Please proceed to bind.", body: "Maya — approving the MIT cyber endorsement at $7.5M — consistent with the recent Northeast Higher-Ed peer cohort. Please proceed to bind.\n\nPatricia", submission: "SUB-7836", submissionShort: "MIT", time: "Yesterday", unread: false, category: "internal" },
  { id: "msg-5", from: "Lisa Riggs", fromInitials: "LR", fromOrg: "Gallagher Education", subject: "Chicago Lab — coverage clarification", preview: "Quick question on the proposed athletic-trip coverage scope. Are intramural travel exposures included in the base GL?", body: "Hi Tom,\n\nQuick question on the proposed athletic-trip coverage scope. Are intramural travel exposures included in the base GL, or do we need a separate endorsement?\n\nThanks,\nLisa", submission: "SUB-7838", submissionShort: "Chicago Lab", time: "Yesterday", unread: false, category: "broker" },
  { id: "msg-6", from: "Mary Fields", fromInitials: "MF", fromOrg: "Hub International", subject: "Broward County — bound terms confirmation", preview: "Confirming the bound terms for Broward County effective Aug 1. Sending DEC pages by EOD.", body: "James, confirming the bound terms for Broward County effective Aug 1. Sending DEC pages by EOD.\n\nMary", submission: "SUB-7837", submissionShort: "Broward County", time: "2 days ago", unread: false, category: "broker" },
];

// ── Activity feed ──────────────────────────────────────────────────────────
export const ACTIVITY = [
  { id: 1, who: "AI Companion", action: "completed Loss Run analysis on", target: "Brookfield Day", time: "8 min ago", kind: "ai" },
  { id: 2, who: "Tyler Owens", action: "uploaded 2 documents to", target: "Brookfield Day", time: "12 min ago", kind: "broker" },
  { id: 3, who: "John Michaels", action: "sent quote to broker for", target: "Vanderbilt", time: "26 min ago", kind: "uw" },
  { id: 4, who: "Maya Khanna", action: "added internal note to", target: "Seattle PS", time: "1 hr ago", kind: "uw" },
  { id: 5, who: "AI Companion", action: "flagged 2 missing documents on", target: "Austin ISD", time: "2 hr ago", kind: "ai" },
  { id: 6, who: "Patricia Hoffman", action: "approved cyber endorsement for", target: "MIT", time: "Yesterday", kind: "uw" },
];

// ── KPIs by role ───────────────────────────────────────────────────────────
export const KPIS_BY_ROLE = {
  uw: [
    { label: "My In Review", value: "5", sub: "+1 vs. last week", trend: "up" as const, accent: "blue" as const, spark: [3, 4, 3, 5, 4, 5, 5] },
    { label: "Quoted This Month", value: "7", sub: "+2 vs. last month", trend: "up" as const, accent: "green" as const, spark: [2, 3, 5, 4, 6, 6, 7] },
    { label: "Bound This Month", value: "$454K", sub: "3 policies", trend: "up" as const, accent: "blue" as const, spark: [120, 180, 240, 290, 380, 420, 454] },
    { label: "Avg. Days to Quote", value: "3.8d", sub: "−0.4d vs. team", trend: "down" as const, accent: "green" as const, spark: [4.6, 4.5, 4.3, 4.1, 4.0, 3.9, 3.8] },
    { label: "Hit Ratio (YTD)", value: "71%", sub: "+3pp vs. last year", trend: "up" as const, accent: "gold" as const, spark: [62, 64, 66, 67, 69, 70, 71] },
  ],
  "sr-uw": [
    { label: "My In Review", value: "4", sub: "Active", trend: "up" as const, accent: "blue" as const, spark: [4, 5, 4, 5, 4, 4, 4] },
    { label: "Quoted This Month", value: "9", sub: "+1 vs. last month", trend: "up" as const, accent: "green" as const, spark: [4, 5, 6, 7, 8, 8, 9] },
    { label: "Bound This Month", value: "$1.45M", sub: "4 policies", trend: "up" as const, accent: "blue" as const, spark: [400, 600, 800, 1000, 1200, 1350, 1450] },
    { label: "Avg. Days to Quote", value: "3.2d", sub: "Best on team", trend: "down" as const, accent: "green" as const, spark: [4.2, 4.0, 3.8, 3.6, 3.5, 3.3, 3.2] },
    { label: "Hit Ratio (YTD)", value: "74%", sub: "+6pp vs. last year", trend: "up" as const, accent: "gold" as const, spark: [62, 65, 68, 70, 71, 73, 74] },
  ],
  lead: [
    { label: "Team In Review", value: "12", sub: "Across 4 UWs", trend: "up" as const, accent: "blue" as const, spark: [9, 10, 11, 10, 11, 12, 12] },
    { label: "Team Quoted", value: "19", sub: "$4.2M pipeline", trend: "up" as const, accent: "green" as const, spark: [10, 12, 14, 15, 16, 18, 19] },
    { label: "Bound YTD", value: "31", sub: "$3.1M premium", trend: "up" as const, accent: "blue" as const, spark: [10, 14, 18, 22, 25, 28, 31] },
    { label: "Avg. Days to Quote", value: "4.1d", sub: "−0.6 vs. Q1", trend: "down" as const, accent: "green" as const, spark: [4.7, 4.6, 4.5, 4.4, 4.3, 4.2, 4.1] },
    { label: "Team Hit Ratio", value: "72%", sub: "+4pp vs. last year", trend: "up" as const, accent: "gold" as const, spark: [64, 66, 68, 69, 70, 71, 72] },
  ],
  director: [
    { label: "Active Submissions", value: "47", sub: "Portfolio-wide", trend: "up" as const, accent: "blue" as const, spark: [38, 40, 42, 43, 44, 46, 47] },
    { label: "Quoted Pipeline", value: "$8.4M", sub: "23 accounts", trend: "up" as const, accent: "green" as const, spark: [5.2, 5.8, 6.5, 7.0, 7.6, 8.0, 8.4] },
    { label: "Bound YTD", value: "$3.1M", sub: "31 policies", trend: "up" as const, accent: "blue" as const, spark: [0.8, 1.2, 1.6, 2.0, 2.4, 2.8, 3.1] },
    { label: "Portfolio Hit Ratio", value: "69%", sub: "+2pp vs. last year", trend: "up" as const, accent: "gold" as const, spark: [64, 65, 66, 67, 68, 68, 69] },
    { label: "Avg. Days to Quote", value: "4.1d", sub: "Within SLA (≤5d)", trend: "down" as const, accent: "green" as const, spark: [4.8, 4.7, 4.5, 4.4, 4.3, 4.2, 4.1] },
  ],
};

// ── Pipeline by month ──────────────────────────────────────────────────────
export const PIPELINE = [
  { month: "Oct", submitted: 8,  quoted: 6,  bound: 4 },
  { month: "Nov", submitted: 11, quoted: 8,  bound: 5 },
  { month: "Dec", submitted: 7,  quoted: 5,  bound: 4 },
  { month: "Jan", submitted: 14, quoted: 10, bound: 7 },
  { month: "Feb", submitted: 18, quoted: 13, bound: 9 },
  { month: "Mar", submitted: 22, quoted: 16, bound: 11 },
];

// ── Team ───────────────────────────────────────────────────────────────────
export const TEAM = [
  { name: "Maya Khanna", initials: "MK", role: "Sr. Underwriter", inReview: 5, quoted: 7, bound: 3, hitRatio: 71, daysToQuote: 3.8 },
  { name: "John Michaels", initials: "JM", role: "Sr. Underwriter", inReview: 4, quoted: 9, bound: 4, hitRatio: 74, daysToQuote: 3.2 },
  { name: "Tom Lee", initials: "TL", role: "UW Analyst", inReview: 3, quoted: 5, bound: 3, hitRatio: 68, daysToQuote: 4.5 },
  { name: "James Owens", initials: "JO", role: "UW Analyst", inReview: 2, quoted: 4, bound: 2, hitRatio: 66, daysToQuote: 4.9 },
];

// ── Detailed submission profile (for SubmissionDetail) ─────────────────────
export interface SubmissionProfile {
  // Identification
  id: string;
  institutionName: string;
  memberNumber: string;
  memberSince: string;
  memberType: string;
  enrollment: string;
  location: string;
  // Dates / financials
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
  // People
  brokerage: string;
  brokerContact: string;
  underwriter: { name: string; title: string };
  uwSpecialist: { name: string; title: string };
  productLines: string[];
  // Stage
  stage: Stage;
  // Member detail
  member: {
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
  };
  brokerContacts: { name: string; phone: string; email: string; access: string; roles: string[]; highlight: boolean }[];
  // Risk & exposure
  exposure: { label: string; value: string; tone?: "good" | "warning" | "bad" }[];
  property: { label: string; value: string; highlight?: "good" | "warning" }[];
  riskBars: { label: string; score: number; tone: "good" | "warning" | "bad" }[];
  safetyChecks: { section: string; items: { label: string; value: boolean | "partial" }[] }[];
  liabilityExposures: { label: string; value: string; tone: "blue" | "gold" | "good" | "bad" }[];
  // Loss
  claims: { id: string; date: string; type: string; location: string; paid: string; reserve: string; total: string; status: "Open" | "Closed"; alert: boolean }[];
  yearSummary: { year: string; claims: number; paid: string; reserve: string; incurred: string; ratio: string; trend: "up" | "down" | "neutral" }[];
  // Documents
  documents: { name: string; type: string; uploaded: string; size: string; status: "Verified" | "Pending" | "Missing"; uploadedBy: string }[];
  // Coverage / rating
  coverages: { name: string; limit: string; aggregateLimit: string; retention: string; premium: string; factor: number }[];
  // Notes
  notes: { id: number; author: string; initials: string; time: string; body: string; tag: string }[];
  // Approvals
  approvals: { id: number; name: string; role: string; status: "Approved" | "Pending" | "Required"; level: string; note: string; time: string }[];
  // Audit
  audit: { id: number; time: string; actor: string; action: string; target: string }[];
  // AI flags
  greenFlags: { title: string; source: string }[];
  redFlags: { title: string; source: string; gap: string; action: string; owner: "Broker/User" | "System Automation" | "Underwriter" }[];
  companions: { code: string; name: string; teaser: string; reasoning: string }[];
  appetiteScore: number;
  claimsScore: number;
  benchmarkScore: number;
}

export const PROFILE_BROOKFIELD: SubmissionProfile = {
  id: "SUB-7829",
  institutionName: "Brookfield Day School",
  memberNumber: "473",
  memberSince: "2014",
  memberType: "Private K-12",
  enrollment: "842 students",
  location: "Westport, CT",
  submittedDate: "March 15, 2024",
  effectiveDate: "Jun 1, 2026",
  expiryDate: "Jun 1, 2027",
  needByDate: "Apr 28, 2026",
  needByUrgency: "7 days",
  expiringPremium: "$132,400",
  expiringNote: "2025 policy",
  quotedPremium: "$142,800",
  quotedNote: "+7.8% indicated",
  boundPremium: "—",
  boundNote: "Not yet bound",
  lossRatio: "58%",
  lossRatioNote: "2 open claims",
  brokerage: "Marsh McLennan Agency",
  brokerContact: "T. Owens",
  underwriter: { name: "Maya Khanna", title: "Sr. UW · Northeast" },
  uwSpecialist: { name: "Devon Carter", title: "Assistant UW" },
  productLines: ["EPL", "ELL", "GL", "Cyber"],
  stage: "Review In Progress",
  member: {
    accountName: "Brookfield Day School", decPageName: "Brookfield Day School", preferredName: "Brookfield Day",
    parentAccount: "—", institutionType: "K-12", subCategory: "Private", boardingOptions: "Day only · No boarding",
    underwritingTrack: "Choice", educationSegment: "Schools / Colleges", totalEnrollment: "842", renewalType: "Annual",
    budget: "$28,400,000", territory: "Northeast", physicalAddress: "32 Riverside Avenue", physicalCity: "Westport",
    physicalState: "CT", physicalZip: "06880", county: "Fairfield", country: "United States",
  },
  brokerContacts: [
    { name: "Tyler Owens", phone: "(283) 555-1142", email: "towens@marshmma.com", access: "All Products", roles: ["Contact Manager", "GL Producer", "PL Producer", "ACK Memo"], highlight: false },
    { name: "Ashleigh Choi", phone: "(212) 555-2114", email: "achoi@marshmma.com", access: "All Products", roles: ["Contact Manager", "GL CSR", "PL CSR", "ML CSR"], highlight: false },
    { name: "Devon Carter", phone: "(212) 555-3098", email: "dcarter@marshmma.com", access: "All Products", roles: ["GL CSR", "PL CSR"], highlight: true },
    { name: "Sandra Rios", phone: "(212) 555-4471", email: "srios@marshmma.com", access: "GL · PL", roles: ["All LOB Claims Broker Contact"], highlight: false },
  ],
  exposure: [
    { label: "Total Insured Value (TIV)", value: "$412,000,000" },
    { label: "Per-Occurrence SIR", value: "$50,000", tone: "warning" },
    { label: "Annual Aggregate SIR", value: "$150,000", tone: "warning" },
    { label: "Largest Single Location", value: "$28,400,000" },
    { label: "Total Sq. Footage", value: "2,140,000 sq ft" },
    { label: "No. of Buildings", value: "142" },
  ],
  property: [
    { label: "Primary Construction", value: "Masonry / Steel Frame" },
    { label: "Roof Type", value: "Modified Bitumen / TPO" },
    { label: "Year Built (Avg.)", value: "1968 (1942–2019)" },
    { label: "Sprinkler Coverage", value: "94% of Buildings", highlight: "good" },
    { label: "Occupancy Type", value: "Educational (K-12)" },
    { label: "Coinsurance Clause", value: "90% Agreed Value" },
    { label: "Valuation Basis", value: "Replacement Cost Value" },
    { label: "Flood Zone", value: "Zone X – Low Risk", highlight: "good" },
    { label: "Earthquake Zone", value: "Zone 3 – Moderate", highlight: "warning" },
    { label: "Fire Protection Class", value: "Class 3 (ISO)", highlight: "good" },
    { label: "Distance to Fire Stn.", value: "0.8 Miles (Avg.)" },
    { label: "COPE Score", value: "82 / 100", highlight: "good" },
  ],
  riskBars: [
    { label: "Campus Safety Rating", score: 88, tone: "good" },
    { label: "Claims Severity Index", score: 34, tone: "good" },
    { label: "Policy Complexity", score: 61, tone: "warning" },
    { label: "Litigation Exposure", score: 22, tone: "good" },
    { label: "Cyber / Data Risk", score: 48, tone: "warning" },
    { label: "Natural Catastrophe Hazard", score: 39, tone: "good" },
    { label: "Student Injury Frequency", score: 27, tone: "good" },
  ],
  safetyChecks: [
    { section: "Emergency Preparedness", items: [
      { label: "Active Shooter Response Drills", value: true },
      { label: "Fire Evacuation Plan (Current)", value: true },
      { label: "Earthquake/Lockdown Protocol", value: true },
      { label: "Crisis Management Team Active", value: true },
    ]},
    { section: "Physical Security", items: [
      { label: "24/7 Campus Security Personnel", value: true },
      { label: "CCTV Coverage (All Campuses)", value: "partial" },
      { label: "Visitor Check-In System", value: true },
      { label: "Perimeter Fencing", value: true },
    ]},
    { section: "Risk Management Programs", items: [
      { label: "Formal Safety Committee", value: true },
      { label: "Annual Risk Assessment Conducted", value: true },
      { label: "Workers' Comp Safety Program", value: true },
      { label: "Student Supervision Policy", value: true },
      { label: "Background Checks – All Staff", value: true },
      { label: "Playground Safety Inspection", value: "partial" },
    ]},
  ],
  liabilityExposures: [
    { label: "Abuse & Molestation", value: "Endorsed – $1M sublimit", tone: "bad" },
    { label: "Educators Legal Liability", value: "Included – $3M limit", tone: "blue" },
    { label: "Environmental Liability", value: "Excluded – Standalone", tone: "blue" },
    { label: "Student Accident", value: "$500K / $1M Agg.", tone: "good" },
  ],
  claims: [
    { id: "CLM-2023-041", date: "Sep 14, 2023", type: "Property – Water Damage", location: "Lincoln HS", paid: "$12,400", reserve: "$6,100", total: "$18,500", status: "Closed", alert: false },
    { id: "CLM-2022-019", date: "Mar 02, 2022", type: "GL – Slip & Fall", location: "Jefferson Elem.", paid: "$9,200", reserve: "$0", total: "$9,200", status: "Closed", alert: false },
    { id: "CLM-2022-033", date: "Jul 18, 2022", type: "Student Accident – Sports Inj.", location: "Madison MS", paid: "$5,100", reserve: "$2,200", total: "$7,300", status: "Closed", alert: false },
    { id: "CLM-2021-008", date: "Jan 22, 2021", type: "Property – Fire Damage", location: "Central Admin", paid: "$16,200", reserve: "$0", total: "$16,200", status: "Closed", alert: false },
    { id: "CLM-2021-027", date: "May 09, 2021", type: "ELL – Wrongful Termination", location: "District-Wide", paid: "$4,700", reserve: "$3,800", total: "$8,500", status: "Open", alert: true },
    { id: "CLM-2020-014", date: "Jun 30, 2020", type: "Property – Vandalism", location: "Roosevelt Elem.", paid: "$9,100", reserve: "$0", total: "$9,100", status: "Closed", alert: false },
    { id: "CLM-2019-006", date: "Feb 12, 2019", type: "GL – Auto", location: "District Bus", paid: "$8,800", reserve: "$0", total: "$8,800", status: "Closed", alert: false },
    { id: "CLM-2019-022", date: "Oct 05, 2019", type: "Student Accident – Field Trip", location: "Grant MS", paid: "$7,200", reserve: "$2,400", total: "$9,600", status: "Open", alert: false },
  ],
  yearSummary: [
    { year: "2019", claims: 2, paid: "$16,000", reserve: "$2,400", incurred: "$18,400", ratio: "22%", trend: "neutral" },
    { year: "2020", claims: 1, paid: "$9,100", reserve: "$0", incurred: "$9,100", ratio: "11%", trend: "down" },
    { year: "2021", claims: 3, paid: "$24,700", reserve: "$3,800", incurred: "$24,700", ratio: "30%", trend: "up" },
    { year: "2022", claims: 2, paid: "$14,300", reserve: "$2,200", incurred: "$16,500", ratio: "20%", trend: "down" },
    { year: "2023", claims: 1, paid: "$12,400", reserve: "$6,100", incurred: "$18,500", ratio: "22%", trend: "neutral" },
  ],
  documents: [
    { name: "ACORD Application", type: "Application", uploaded: "Mar 15, 2024", size: "2.1 MB", status: "Verified", uploadedBy: "Tyler Owens" },
    { name: "6-Year Loss Run", type: "Loss Run", uploaded: "Mar 15, 2024", size: "1.4 MB", status: "Verified", uploadedBy: "Tyler Owens" },
    { name: "COPE Survey", type: "Risk Survey", uploaded: "Mar 16, 2024", size: "3.8 MB", status: "Verified", uploadedBy: "Tyler Owens" },
    { name: "Audited Financials FY2023", type: "Financial", uploaded: "Mar 16, 2024", size: "5.2 MB", status: "Verified", uploadedBy: "Tyler Owens" },
    { name: "Title IX Coordinator Cert", type: "Compliance", uploaded: "Mar 17, 2024", size: "612 KB", status: "Verified", uploadedBy: "Devon Carter" },
    { name: "Safety Questionnaire", type: "Risk Survey", uploaded: "—", size: "—", status: "Missing", uploadedBy: "—" },
    { name: "SIR Actuarial Opinion", type: "Financial", uploaded: "—", size: "—", status: "Pending", uploadedBy: "Requested Mar 19" },
    { name: "Sexual Misconduct Addendum", type: "Compliance", uploaded: "Apr 18, 2024", size: "412 KB", status: "Pending", uploadedBy: "Tyler Owens" },
  ],
  coverages: [
    { name: "General Liability", limit: "$5,000,000", aggregateLimit: "$15,000,000", retention: "$100,000", premium: "$28,400", factor: 1.04 },
    { name: "Property – Buildings", limit: "$42,000,000", aggregateLimit: "$42,000,000", retention: "$250,000", premium: "$51,200", factor: 1.06 },
    { name: "Student Accident", limit: "$500,000", aggregateLimit: "$2,000,000", retention: "$50,000", premium: "$12,800", factor: 0.98 },
    { name: "Educators Legal Liability", limit: "$3,000,000", aggregateLimit: "$9,000,000", retention: "$100,000", premium: "$19,600", factor: 1.12 },
    { name: "Cyber & Privacy", limit: "$2,000,000", aggregateLimit: "$2,000,000", retention: "$25,000", premium: "$30,800", factor: 1.18 },
  ],
  notes: [
    { id: 1, author: "Maya Khanna", initials: "MK", time: "Apr 18, 10:24 AM", body: "Confirmed with Tyler that SIR actuarial opinion is in process — broker promised by Apr 22. Holding quote until received.", tag: "Underwriting" },
    { id: 2, author: "Devon Carter", initials: "DC", time: "Apr 17, 4:02 PM", body: "Title IX cert verified against state registry — current through FY24. No issues.", tag: "Verification" },
    { id: 3, author: "AI Companion", initials: "UE", time: "Apr 16, 2:11 PM", body: "Flagged: 2 of last 5 years had primary CGL piercing events. Recommend BLX buffer layer above $1M primary.", tag: "AI Insight" },
    { id: 4, author: "Maya Khanna", initials: "MK", time: "Apr 15, 9:47 AM", body: "Pricing committee preview — leaning to +7.8% indicated. No competitor pressure — incumbent for 12 years.", tag: "Pricing" },
  ],
  approvals: [
    { id: 1, name: "Patricia Hoffman", role: "Underwriting Lead", status: "Approved", level: "Standard Authority", note: "Approved within standard authority — no referral needed.", time: "Apr 17, 11:04 AM" },
    { id: 2, name: "Robert Chen", role: "Director of UW", status: "Pending", level: "Cyber Endorsement Referral", note: "Required for cyber sublimit > $1M on Private K-12 segment.", time: "Pending" },
    { id: 3, name: "Reinsurance Treaty", role: "System Check", status: "Approved", level: "Within Treaty", note: "Within facultative treaty — no special placement required.", time: "Apr 15, 8:00 AM" },
  ],
  audit: [
    { id: 1, time: "Apr 18, 10:24 AM", actor: "Maya Khanna", action: "Added internal note", target: "SIR opinion holding pattern" },
    { id: 2, time: "Apr 18, 9:30 AM", actor: "Tyler Owens", action: "Uploaded document", target: "Sexual Misconduct Addendum" },
    { id: 3, time: "Apr 17, 4:02 PM", actor: "Devon Carter", action: "Verified document", target: "Title IX Coordinator Cert" },
    { id: 4, time: "Apr 17, 11:04 AM", actor: "Patricia Hoffman", action: "Approved", target: "Standard authority sign-off" },
    { id: 5, time: "Apr 16, 2:11 PM", actor: "AI Companion", action: "Flagged", target: "CGL primary piercing pattern" },
    { id: 6, time: "Apr 15, 8:00 AM", actor: "System", action: "Reinsurance treaty check", target: "Within treaty" },
    { id: 7, time: "Mar 19, 1:14 PM", actor: "Maya Khanna", action: "Requested document", target: "SIR Actuarial Opinion" },
    { id: 8, time: "Mar 16, 11:42 AM", actor: "AI Companion", action: "Comprehended documents", target: "Application + Loss Runs + COPE" },
    { id: 9, time: "Mar 15, 9:00 AM", actor: "Tyler Owens", action: "Created submission", target: "SUB-7829 Brookfield Day" },
  ],
  greenFlags: [
    { title: "Established Crisis Response Plans", source: "Application §4.2 — documented active-threat protocol, parent-notification chain, annual tabletop drills." },
    { title: "Strict Title IX Compliance", source: "Title IX Coordinator certification on file (FY24). Quarterly training records and grievance log provided." },
    { title: "Clean 7-year claims history — no severity outliers", source: "Loss runs 2018–2024 from Great American: 4 closed claims, max incurred $42K, no reservations on open file." },
  ],
  redFlags: [
    { title: "Missing SIR funding statement for BLX", source: "Buffer Excess Liability requires independent verification of the SIR funding mechanism. Submitted financials reference an SIR but no actuarial opinion confirming reserve adequacy.", gap: "Missing SIR funding mechanism statement", action: "Upload SIR Actuarial Opinion", owner: "Broker/User" },
    { title: "History of primary limits pierced (2 occurrences)", source: "Per 2026 Large Loss Report — 2022 occurrence ($1.05M) and 2023 occurrence ($980K) approached or exceeded $1M primary CGL limits.", gap: "Primary CGL limits pierced in 2 of last 5 years", action: "Review limit adequacy before re-quoting", owner: "Underwriter" },
    { title: "Sexual Misconduct supplemental not yet received", source: "UE standard intake requires the Sexual Misconduct addendum for institutions with residential or athletic programs.", gap: "Sexual Misconduct addendum not on file", action: "Trigger addendum to broker", owner: "System Automation" },
  ],
  companions: [
    { code: "BLX", name: "Buffer Excess Liability", teaser: "Recommended — your primary CGL was pierced twice in 2 years.", reasoning: "The 2022–2023 occurrences approached or pierced $1M primary CGL. A BLX buffer above primary CGL absorbs the next severity event before it erodes the aggregate. Median peer institution carries $5M buffer; pricing typically lands at 18–22% of primary GL premium." },
    { code: "XFF", name: "Excess Following Form", teaser: "Suggested — newly expanded athletics adds catastrophic exposure.", reasoning: "Audited financials disclose a new athletics facility (FY24) and varsity NCAA-NCS roster expansion. XFF follows the form of underlying policies and provides catastrophic coverage for a single-occurrence loss that would burn through both primary and buffer aggregates simultaneously." },
  ],
  appetiteScore: 82,
  claimsScore: 66,
  benchmarkScore: 62,
};

// Map every submission ID to a profile (only Brookfield is fully detailed; rest fall back).
export function getProfile(id: string): SubmissionProfile {
  // For now all profiles share the rich Brookfield data; the header is populated
  // from the submission summary so each looks distinct.
  const sub = SUBMISSIONS.find(s => s.id === id) ?? SUBMISSIONS[0];
  return {
    ...PROFILE_BROOKFIELD,
    id: sub.id,
    institutionName: sub.member,
    memberNumber: sub.id.replace("SUB-", ""),
    memberType: sub.type,
    enrollment: sub.enrollment,
    location: sub.city,
    submittedDate: sub.submitted,
    effectiveDate: sub.effectiveDate,
    expiryDate: sub.expiryDate,
    needByDate: sub.needByDate,
    needByUrgency: sub.needByUrgency,
    expiringPremium: sub.expiringPremium,
    quotedPremium: sub.premium,
    lossRatio: sub.lossRatio,
    brokerage: sub.broker,
    brokerContact: sub.brokerContact,
    productLines: sub.productLines,
    stage: sub.stage,
    appetiteScore: sub.appetite,
  };
}

// ── Comprehension findings (used by upload modal) ──────────────────────────
export const COMPREHENSION_STEPS = [
  "Reading ACORD application…",
  "Parsing 6-year Loss Runs…",
  "Detected 4 prior claims totaling $187K",
  "Recognized COPE survey covering 12 properties",
  "Cross-referenced NAIC code 8211",
  "Verified Title IX Coordinator certification (FY24)",
  "Computing appetite match…",
  "Appetite match: 87% — Strong Fit",
  "Detected 2 occurrences piercing primary CGL (2022, 2023)",
  "Flagged: SIR Actuarial Opinion missing",
  "Flagged: Sexual Misconduct addendum not on file",
  "Suggested companion product: BLX (Buffer Excess Liability)",
];

// ── Portfolio analytics ─────────────────────────────────────────────────────
export const PORTFOLIO_BY_SEGMENT = [
  { segment: "K-12 Public", count: 24, premium: 3.2, lossRatio: 47 },
  { segment: "K-12 Private", count: 12, premium: 1.4, lossRatio: 38 },
  { segment: "Higher Ed", count: 8, premium: 2.8, lossRatio: 51 },
  { segment: "Charter", count: 3, premium: 0.4, lossRatio: 64 },
];

export const PORTFOLIO_QUARTERLY = [
  { quarter: "Q1 23", premium: 1.8, claims: 0.9 },
  { quarter: "Q2 23", premium: 2.1, claims: 1.0 },
  { quarter: "Q3 23", premium: 2.4, claims: 1.1 },
  { quarter: "Q4 23", premium: 2.6, claims: 1.2 },
  { quarter: "Q1 24", premium: 2.9, claims: 1.3 },
];

// ── Extensive portfolio analytics (UW-valuable) ─────────────────────────────
// 28-month bind trend (Jan 2024 → Apr 2026) for the polished line chart.
export const MONTHLY_BIND_TREND = (() => {
  const start = new Date(2024, 0, 1);
  const months: { label: string; value: number }[] = [];
  for (let i = 0; i < 28; i++) {
    const d = new Date(start.getFullYear(), start.getMonth() + i, 1);
    const base = 620 + i * 11; // gentle uptrend in $K
    const seasonal = Math.sin((i / 12) * Math.PI * 2) * 70;
    const noise = (((i * 9301 + 49297) % 233) / 233 - 0.5) * 90;
    months.push({
      label: d.toLocaleString("en-US", { month: "short" }) + " " + String(d.getFullYear()).slice(2),
      value: Math.max(380, Math.round(base + seasonal + noise)),
    });
  }
  return months;
})();

// Lead → Bind sales funnel
export const SALES_FUNNEL = [
  { stage: "Leads",     count: 18200, color: "#DBE1F5" },
  { stage: "Qualified", count:  9650, color: "#A8B6E6" },
  { stage: "Quoted",    count:  8226, color: "#5C72D6" },
  { stage: "Bound",     count:  2172, color: "#0123D4" },
  { stage: "Renewed",   count:  1846, color: "#0B1A6E" },
];

// Account size distribution by premium band ($K)
export const ACCOUNT_SIZE_DIST = [
  { band: "<$25K",      count:  86, premium:  1.4 },
  { band: "$25–50K",    count: 142, premium:  5.7 },
  { band: "$50–100K",   count: 168, premium: 12.9 },
  { band: "$100–250K",  count: 124, premium: 21.8 },
  { band: "$250–500K",  count:  62, premium: 24.4 },
  { band: "$500K–1M",   count:  31, premium: 22.5 },
  { band: "$1M+",       count:  12, premium: 19.8 },
];

// Top brokers / producers
export const TOP_BROKERS = [
  { name: "Marsh McLennan",   submissions: 142, bound: 38, premium: 6.4, hitRatio: 27 },
  { name: "AON",              submissions: 118, bound: 31, premium: 5.2, hitRatio: 26 },
  { name: "Alliant",          submissions:  94, bound: 28, premium: 4.1, hitRatio: 30 },
  { name: "Gallagher",        submissions:  87, bound: 22, premium: 3.6, hitRatio: 25 },
  { name: "Lockton",          submissions:  72, bound: 21, premium: 3.4, hitRatio: 29 },
  { name: "USI Insurance",    submissions:  64, bound: 17, premium: 2.6, hitRatio: 27 },
  { name: "Brown & Brown",    submissions:  58, bound: 14, premium: 2.1, hitRatio: 24 },
];

// Declination reason mix
export const DECLINATION_REASONS = [
  { reason: "Outside appetite",        count: 184 },
  { reason: "Loss history",            count: 121 },
  { reason: "Incomplete submission",   count:  88 },
  { reason: "Pricing — broker walked", count:  74 },
  { reason: "Capacity constraints",    count:  41 },
  { reason: "Other",                   count:  29 },
];

// Geographic mix by region
export const GEOGRAPHIC_MIX = [
  { region: "Northeast",   premium: 78.4, accounts: 142 },
  { region: "Mid-Atlantic", premium: 54.1, accounts:  98 },
  { region: "Southeast",   premium: 46.8, accounts:  86 },
  { region: "Midwest",     premium: 41.2, accounts:  79 },
  { region: "Southwest",   premium: 28.6, accounts:  54 },
  { region: "West",        premium: 18.7, accounts:  32 },
];

// Days-to-quote distribution
export const DAYS_TO_QUOTE_DIST = [
  { bucket: "≤2d",  count:  86 },
  { bucket: "3d",   count: 142 },
  { bucket: "4d",   count: 124 },
  { bucket: "5d",   count:  78 },
  { bucket: "6–7d", count:  46 },
  { bucket: "8d+",  count:  18 },
];

// ── Appetite explorer ───────────────────────────────────────────────────────
export const APPETITE_SEGMENTS = [
  { segment: "K-12 Public · Northeast", appetite: 92, capacity: "Full", trend: "expand", note: "Core target — favorable loss experience and dense broker network." },
  { segment: "K-12 Public · Southeast", appetite: 78, capacity: "Selective", trend: "hold", note: "Watch hurricane CAT exposure; favor masonry construction and high COPE scores." },
  { segment: "K-12 Private · National", appetite: 86, capacity: "Full", trend: "expand", note: "Strong appetite; emphasis on Title IX, athletics, and abuse-prevention programs." },
  { segment: "Higher Ed · R1 Universities", appetite: 81, capacity: "Selective", trend: "hold", note: "Cyber and student misconduct exposures elevated; require enhanced risk profile." },
  { segment: "Higher Ed · Liberal Arts", appetite: 89, capacity: "Full", trend: "expand", note: "Lower complexity, attractive loss patterns." },
  { segment: "Charter Schools", appetite: 54, capacity: "Restricted", trend: "contract", note: "High volatility; only consider with 5+ years operating history and strong governance." },
  { segment: "For-Profit Education", appetite: 22, capacity: "Closed", trend: "decline", note: "Currently outside appetite — declined in last 18 months due to litigation patterns." },
];

// ── UE Real Forms registry (sourced from UE's actual application packets) ──
export type InstitutionTier =
  | "Public_K12" | "Independent_Charter" | "College_LT3000" | "College_GTE3000" | "Other";

export interface UeForm {
  code: string; name: string; file: string; required: boolean; productHint: string;
}

export const UE_FORMS: Record<InstitutionTier, UeForm[]> = {
  Public_K12: [
    { code: "PK12-APP", name: "Public K-12 All-Lines Application", file: "Public_K-12_Schools/public-k12-application.pdf", required: true, productHint: "All-Lines" },
  ],
  Independent_Charter: [
    { code: "IS-ALL", name: "All-Lines Application (Independent / Charter)", file: "Independent_Schools_And_Charter_Schools/all-lines-application.pdf", required: true, productHint: "All-Lines" },
    { code: "IS-SXM", name: "Sexual Misconduct Supplemental", file: "Independent_Schools_And_Charter_Schools/sexual-misconduct-application-independent-charter2.pdf", required: true, productHint: "ELL / Abuse" },
    { code: "IS-FT",  name: "Foreign Terrorism Supplemental", file: "Independent_Schools_And_Charter_Schools/foreign-terrorism-application.pdf", required: false, productHint: "Foreign Travel" },
    { code: "IS-HSR", name: "Human Subjects Research Supplemental", file: "Independent_Schools_And_Charter_Schools/human-subjects-research-application.pdf", required: false, productHint: "Research" },
    { code: "IS-TM",  name: "Telemedicine Supplemental", file: "Independent_Schools_And_Charter_Schools/telemedicine-application.pdf", required: false, productHint: "Health Services" },
  ],
  College_LT3000: [
    { code: "C1-ALL", name: "All-Lines Application (College <3,000)", file: "Colleges_Universities_less_than_3000_students - Copy/all-lines-application.pdf", required: true, productHint: "All-Lines" },
    { code: "C1-SXM", name: "Sexual Misconduct Supplemental (HE)", file: "Colleges_Universities_less_than_3000_students - Copy/sexual-misconduct-application-he.pdf", required: true, productHint: "ELL / Abuse" },
    { code: "C1-IPL", name: "IPL (Information Privacy & Liability) App", file: "Colleges_Universities_less_than_3000_students - Copy/ipl-application.pdf", required: true, productHint: "Cyber" },
    { code: "C1-ATH", name: "Intercollegiate Athletics Supplemental", file: "Colleges_Universities_less_than_3000_students - Copy/intercollegiate-athletics-application.pdf", required: false, productHint: "Athletics" },
    { code: "C1-TBI", name: "Traumatic Brain Injury Supplemental", file: "Colleges_Universities_less_than_3000_students - Copy/traumatic-brain-injury-application.pdf", required: false, productHint: "Athletics" },
    { code: "C1-FT",  name: "Foreign Terrorism Supplemental", file: "Colleges_Universities_less_than_3000_students - Copy/foreign-terrorism-application.pdf", required: false, productHint: "Travel" },
    { code: "C1-HSR", name: "Human Subjects Research Supplemental", file: "Colleges_Universities_less_than_3000_students - Copy/human-subjects-research-application.pdf", required: false, productHint: "Research" },
    { code: "C1-TM",  name: "Telemedicine Supplemental", file: "Colleges_Universities_less_than_3000_students - Copy/telemedicine-application.pdf", required: false, productHint: "Student Health" },
  ],
  College_GTE3000: [
    { code: "C2-ELL", name: "Educators Legal Liability New Business", file: "Colleges_Universities_more_than_3000_students/ell-application.pdf", required: true, productHint: "ELL" },
    { code: "C2-GL",  name: "General Liability New Business", file: "Colleges_Universities_more_than_3000_students/gl-application.pdf", required: true, productHint: "GL" },
    { code: "C2-IPL", name: "IPL (Cyber) New Business Application", file: "Colleges_Universities_more_than_3000_students/ipl-application.pdf", required: true, productHint: "Cyber" },
    { code: "C2-SXM", name: "Sexual Misconduct Supplemental (HE)", file: "Colleges_Universities_more_than_3000_students/sexual-misconduct-application-he.pdf", required: true, productHint: "ELL / Abuse" },
    { code: "C2-ATH", name: "Intercollegiate Athletics Supplemental", file: "Colleges_Universities_more_than_3000_students/intercollegiate-athletics-application.pdf", required: false, productHint: "Athletics" },
    { code: "C2-TBI", name: "Traumatic Brain Injury Supplemental", file: "Colleges_Universities_more_than_3000_students/traumatic-brain-injury-application.pdf", required: false, productHint: "Athletics" },
    { code: "C2-FT",  name: "Foreign Terrorism Supplemental", file: "Colleges_Universities_more_than_3000_students/foreign-terrorism-application.pdf", required: false, productHint: "Travel" },
    { code: "C2-HSR", name: "Human Subjects Research Supplemental", file: "Colleges_Universities_more_than_3000_students/human-subjects-research-application.pdf", required: false, productHint: "Research" },
    { code: "C2-TM",  name: "Telemedicine Supplemental", file: "Colleges_Universities_more_than_3000_students/telemedicine-application.pdf", required: false, productHint: "Student Health" },
  ],
  Other: [
    { code: "OAF-ALL", name: "All-Lines Application (Associations / Foundations / Museums)", file: "Other_Associations_Foundations_Museums/all-lines-application.pdf", required: true, productHint: "All-Lines" },
    { code: "OAF-SXM", name: "Sexual Misconduct Supplemental", file: "Other_Associations_Foundations_Museums/sexual-misconduct-application-he.pdf", required: false, productHint: "Abuse" },
    { code: "OAF-FT",  name: "Foreign Terrorism Supplemental", file: "Other_Associations_Foundations_Museums/foreign-terrorism-application.pdf", required: false, productHint: "Travel" },
  ],
};

export function tierFromType(type: string): InstitutionTier {
  if (type.toLowerCase().includes("k-12 public") || type.toLowerCase().includes("public k-12")) return "Public_K12";
  if (type.toLowerCase().includes("charter") || type.toLowerCase().includes("private k-12") || type.toLowerCase().includes("private school") || type.toLowerCase().includes("independent")) return "Independent_Charter";
  if (type.toLowerCase().includes("higher ed") || type.toLowerCase().includes("university") || type.toLowerCase().includes("college")) return "College_GTE3000";
  return "Other";
}
export function tierLabel(t: InstitutionTier): string {
  return ({ Public_K12: "Public K-12", Independent_Charter: "Independent / Charter", College_LT3000: "College < 3,000", College_GTE3000: "College ≥ 3,000", Other: "Association / Foundation / Museum" })[t];
}

// What the upload pretends to extract from the packet — for New Submission auto-prefill.
export const NEW_SUBMISSION_PREFILL = {
  account: {
    institutionName: "Lakeside Academy",
    decPageName: "Lakeside Academy Inc.",
    preferredName: "Lakeside",
    parentAccount: "—",
    institutionType: "Independent K-12",
    subCategory: "Private",
    boarding: "Day + 7-day boarding",
    educationSegment: "Schools / Colleges",
    enrollment: "1,140",
    renewalType: "New Business",
    address: "215 Lakeside Drive",
    city: "Seattle",
    state: "WA",
    zip: "98112",
    county: "King",
    country: "United States",
    naic: "8211",
  },
  policy: {
    productLines: ["EPL", "ELL", "GL", "Cyber", "Property"] as string[],
    effectiveDate: "Sep 1, 2026",
    expiryDate: "Sep 1, 2027",
    expiringPremium: "$184,200",
    expiringCarrier: "Great American",
    sirPerOcc: "$50,000",
    sirAggregate: "$150,000",
    territory: "Pacific Northwest",
  },
  broker: {
    brokerage: "Marsh McLennan Agency",
    contactName: "Tyler Owens",
    email: "towens@marshmma.com",
    phone: "(206) 555-2418",
    license: "PNW-1142",
    accessLevel: "All Products",
  },
  exposure: {
    tiv: "$214,000,000",
    largestLocation: "$24,800,000",
    sqft: "1,420,000",
    buildings: "38",
    fleetUnits: "12",
    employees: "188",
    students: "1,140",
  },
  loss: {
    years: 6, claimsCount: 6, incurred: "$112,400", openClaims: 1, largestPaid: "$28,400", pierced: 0,
  },
};
