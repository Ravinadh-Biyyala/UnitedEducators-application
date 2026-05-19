// A single representative SubmissionProfile so the brain advisors and
// docMatrix helpers always have something well-typed to chew on, even when
// the page hasn't wired its own real account yet. Loosely modelled on
// Brookfield Day School from the reference fixtures.

import type { SubmissionProfile } from "./companionTypes";

export const SAMPLE_PROFILE: SubmissionProfile = {
  id: "SUB-7829",
  institutionName: "Brookfield Day School",
  memberNumber: "473",
  memberSince: "2014",
  memberType: "Private K-12",
  enrollment: "842 students",
  location: "Westport, CT",
  submittedDate: "March 15, 2026",
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
  claims: [
    { id: "CLM-2023-041", date: "Sep 14, 2023", type: "Property – Water Damage", location: "Lincoln HS", paid: "$12,400", reserve: "$6,100", total: "$18,500", status: "Closed", alert: false },
    { id: "CLM-2021-027", date: "May 09, 2021", type: "ELL – Wrongful Termination", location: "District-Wide", paid: "$4,700", reserve: "$3,800", total: "$8,500", status: "Open", alert: true },
    { id: "CLM-2019-022", date: "Oct 05, 2019", type: "Student Accident – Field Trip", location: "Grant MS", paid: "$7,200", reserve: "$2,400", total: "$9,600", status: "Open", alert: false },
  ],
  coverages: [
    { name: "General Liability",        limit: "$5,000,000",  aggregateLimit: "$15,000,000", retention: "$100,000", premium: "$28,400", factor: 1.04 },
    { name: "Property – Buildings",     limit: "$42,000,000", aggregateLimit: "$42,000,000", retention: "$250,000", premium: "$51,200", factor: 1.06 },
    { name: "Student Accident",         limit: "$500,000",    aggregateLimit: "$2,000,000",  retention: "$50,000",  premium: "$12,800", factor: 0.98 },
    { name: "Educators Legal Liability",limit: "$3,000,000",  aggregateLimit: "$9,000,000",  retention: "$100,000", premium: "$19,600", factor: 1.12 },
    { name: "Cyber & Privacy",          limit: "$2,000,000",  aggregateLimit: "$2,000,000",  retention: "$25,000",  premium: "$30,800", factor: 1.18 },
  ],
  documents: [
    { name: "ACORD Application",          type: "Application", uploaded: "Mar 15, 2026", size: "2.1 MB", status: "Verified", uploadedBy: "Tyler Owens" },
    { name: "6-Year Loss Run",            type: "Loss Run",    uploaded: "Mar 15, 2026", size: "1.4 MB", status: "Verified", uploadedBy: "Tyler Owens" },
    { name: "COPE Survey",                type: "Risk Survey", uploaded: "Mar 16, 2026", size: "3.8 MB", status: "Verified", uploadedBy: "Tyler Owens" },
    { name: "Safety Questionnaire",       type: "Risk Survey", uploaded: "—",            size: "—",      status: "Missing",  uploadedBy: "—" },
    { name: "SIR Actuarial Opinion",      type: "Financial",   uploaded: "—",            size: "—",      status: "Pending",  uploadedBy: "Requested Mar 19" },
  ],
  companions: [
    { code: "BLX", name: "Buffer Excess Liability", teaser: "Recommended — your primary CGL was pierced twice in 2 years.", reasoning: "The 2022–2023 occurrences approached or pierced $1M primary CGL. A BLX buffer absorbs the next severity event before it erodes aggregate." },
    { code: "XFF", name: "Excess Following Form",   teaser: "Suggested — newly expanded athletics adds catastrophic exposure.",  reasoning: "XFF follows underlying forms and provides catastrophic coverage for a single-occurrence loss above primary + buffer." },
  ],
  greenFlags: [
    { title: "Clean 7-year claims history",   source: "Loss runs 2018–2024: 4 closed claims, max incurred $42K." },
    { title: "Strict Title IX Compliance",    source: "FY24 Coordinator certification on file." },
  ],
  redFlags: [
    { title: "Missing SIR funding statement", source: "Buffer Excess Liability requires independent verification of SIR funding.", gap: "Missing SIR funding mechanism statement", action: "Upload SIR Actuarial Opinion", owner: "Broker/User" },
    { title: "Primary CGL pierced in 2 of last 5 years", source: "2022 ($1.05M) and 2023 ($980K) occurrences approached the $1M primary limit.", gap: "Primary CGL adequacy", action: "Review limit adequacy", owner: "Underwriter" },
  ],
  appetiteScore: 82,
  claimsScore: 66,
  benchmarkScore: 62,
};
