// UE Underwriting — Document Review Matrix (As-Is Current State)
// Encodes 40 documents × 10 lifecycle stages with status codes P/C/R/U.
// Source: UE_Document_Review_Matrix.pdf (provided 2026).

export type DocStage =
  | "NB Origination"
  | "Submission Setup"
  | "Pre-Renewal Proc."
  | "Renewal Proc."
  | "App Review"
  | "Quoting & Pricing"
  | "Negotiation & Bind"
  | "Policy Issuance"
  | "Mid-Term Endorse."
  | "BOR / Legal";

export const DOC_STAGES: DocStage[] = [
  "NB Origination",
  "Submission Setup",
  "Pre-Renewal Proc.",
  "Renewal Proc.",
  "App Review",
  "Quoting & Pricing",
  "Negotiation & Bind",
  "Policy Issuance",
  "Mid-Term Endorse.",
  "BOR / Legal",
];

export type DocCategory =
  | "Submission" | "Correspondence" | "Financial" | "Loss Data"
  | "Supplemental" | "UW Internal" | "Policy Docs" | "Legal / Compliance";

export type StatusCode = "P" | "C" | "R" | "U";

// Strict UE palette: blue #0123D4, gold #C9A227, navy #0B1A6E, plus neutral slate for U.
export const STATUS_META: Record<StatusCode, { label: string; long: string; color: string; bg: string }> = {
  P: { label: "Primary",  long: "Primary intake — first received here", color: "#0123D4", bg: "rgba(1,35,212,0.14)" },
  C: { label: "Created",  long: "Created at this stage",                 color: "#C9A227", bg: "rgba(201,162,39,0.20)" },
  R: { label: "Reviewed", long: "Reviewed at this stage",                color: "#0B1A6E", bg: "rgba(11,26,110,0.12)" },
  U: { label: "Updated",  long: "Updated / referenced at this stage",    color: "#5A6B8C", bg: "rgba(90,107,140,0.16)" },
};

export type DocRow = {
  id: number;
  name: string;
  category: DocCategory;
  source: string;            // who creates / owns it
  // partial map: only the stages where the doc has activity
  flow: Partial<Record<DocStage, StatusCode>>;
};

export const DOC_MATRIX: DocRow[] = [
  { id: 1,  name: "Renewal Application (online, UE@Work)",       category: "Submission",         source: "Broker → UE@Work",
    flow: { "Renewal Proc.": "P", "App Review": "R", "Quoting & Pricing": "R" } },
  { id: 2,  name: "PK12 Renewal Application (paper PDF)",         category: "Submission",         source: "Broker → email",
    flow: { "Renewal Proc.": "P", "App Review": "R", "Quoting & Pricing": "R" } },
  { id: 3,  name: "ACORD / UE Application Form",                  category: "Submission",         source: "Broker",
    flow: { "NB Origination": "P", "Submission Setup": "P", "App Review": "R" } },
  { id: 4,  name: "Pre-Underwriting Narrative / Template",        category: "Submission",         source: "TM creates",
    flow: { "NB Origination": "C" } },
  { id: 5,  name: "New Business Task (BD → UW)",                  category: "Correspondence",     source: "BD via Outlook / Service Cloud",
    flow: { "NB Origination": "C", "Submission Setup": "P" } },
  { id: 6,  name: "Audited Financial Statements",                 category: "Financial",          source: "Broker → email",
    flow: { "NB Origination": "P", "Submission Setup": "P", "App Review": "R", "Quoting & Pricing": "R" } },
  { id: 7,  name: "FDM (Financial Distress Monitor) report",      category: "Financial",          source: "HTC/US creates from financials",
    flow: { "App Review": "C", "Quoting & Pricing": "R" } },
  { id: 8,  name: "Loss Run Report (ITD — Since Inception)",      category: "Loss Data",          source: "EDW generated",
    flow: { "Renewal Proc.": "C", "App Review": "C", "Quoting & Pricing": "R" } },
  { id: 9,  name: "Loss Ratio Report (6-year)",                   category: "Loss Data",          source: "EDW generated",
    flow: { "Renewal Proc.": "C", "App Review": "C", "Quoting & Pricing": "R", "Negotiation & Bind": "U" } },
  { id: 10, name: "Loss Ratio Report (ITD)",                      category: "Loss Data",          source: "EDW generated",
    flow: { "Renewal Proc.": "C", "Quoting & Pricing": "R" } },
  { id: 11, name: "Encrypted External Loss Run (for broker)",     category: "Loss Data",          source: "EDW → OneDrive share link",
    flow: { "Renewal Proc.": "C" } },
  { id: 12, name: "TBI Supplemental Application & CMP",           category: "Supplemental",       source: "Broker (football institutions only)",
    flow: { "NB Origination": "P", "App Review": "R", "Quoting & Pricing": "R", "Negotiation & Bind": "U", "Policy Issuance": "U" } },
  { id: 13, name: "Telemedicine Supplemental Application",        category: "Supplemental",       source: "Broker",
    flow: { "App Review": "R", "Quoting & Pricing": "R" } },
  { id: 14, name: "Higher Ed Athletics Supplemental App",         category: "Supplemental",       source: "Broker (Power 4 conference schools)",
    flow: { "App Review": "P", "Quoting & Pricing": "R" } },
  { id: 15, name: "Subscribers Agreement & Power of Attorney",    category: "Submission",         source: "New business only — signed by member",
    flow: { "Negotiation & Bind": "P", "Policy Issuance": "R" } },
  { id: 16, name: "UW Notes Template (Excel)",                    category: "UW Internal",        source: "Downloaded from UW Knowledge Center",
    flow: { "Submission Setup": "C", "Renewal Proc.": "C", "App Review": "C", "Quoting & Pricing": "R" } },
  { id: 17, name: "Member Benefit Report (MBR)",                  category: "UW Internal",        source: "Bot / EDW",
    flow: { "Renewal Proc.": "C", "App Review": "R", "Quoting & Pricing": "U" } },
  { id: 18, name: "Endorsement Lookup Report",                    category: "UW Internal",        source: "EDW generated",
    flow: { "Renewal Proc.": "C", "App Review": "U", "Quoting & Pricing": "R" } },
  { id: 19, name: "Expiring Policy Information Report",           category: "UW Internal",        source: "EDW generated",
    flow: { "Renewal Proc.": "C", "Quoting & Pricing": "R" } },
  { id: 20, name: "Salesforce Submission Record",                 category: "UW Internal",        source: "BD/TM creates → HTC maintains",
    flow: { "NB Origination": "C", "Submission Setup": "U", "Pre-Renewal Proc.": "U", "Renewal Proc.": "U", "Quoting & Pricing": "U", "Negotiation & Bind": "U", "BOR / Legal": "U" } },
  { id: 21, name: "UE@Work Policy Transaction (NBI/Pending)",     category: "UW Internal",        source: "Salesforce integration creates",
    flow: { "Submission Setup": "C", "App Review": "R", "Quoting & Pricing": "U", "Negotiation & Bind": "U", "Policy Issuance": "U", "Mid-Term Endorse.": "U" } },
  { id: 22, name: "2026 Premium Planning Dashboard (Power BI)",   category: "UW Internal",        source: "SharePoint / EDW",
    flow: { "Renewal Proc.": "U", "Quoting & Pricing": "U" } },
  { id: 23, name: "PK12 Rating Spreadsheet",                      category: "UW Internal",        source: "Downloaded from Public School Resources",
    flow: { "Submission Setup": "C", "Renewal Proc.": "C", "Quoting & Pricing": "U" } },
  { id: 24, name: "Policy Issuance Checklist (Excel)",            category: "UW Internal",        source: "UW/US completes at issuance",
    flow: { "Policy Issuance": "C" } },
  { id: 25, name: "Policy Issuance Checklist — RPG (MS Forms)",   category: "UW Internal",        source: "HTC completes via Microsoft Forms",
    flow: { "Policy Issuance": "C" } },
  { id: 26, name: "Policy Compare Document (Hypatia Bot)",        category: "UW Internal",        source: "RPA Bot generates at issuance",
    flow: { "Policy Issuance": "C" } },
  { id: 27, name: "Policy Issuance Folder / Reference Docs",      category: "UW Internal",        source: "SharePoint",
    flow: { "Policy Issuance": "R" } },
  { id: 28, name: "Quote Letter (GhostDraft PDF)",                category: "Policy Docs",        source: "GhostDraft generates via UE@Work",
    flow: { "Quoting & Pricing": "C", "Negotiation & Bind": "U", "Policy Issuance": "R" } },
  { id: 29, name: "Binder (Bind Confirmation)",                   category: "Policy Docs",        source: "GhostDraft / Manual for Pools",
    flow: { "Policy Issuance": "C", "Mid-Term Endorse.": "R" } },
  { id: 30, name: "Invoice (First Notice)",                       category: "Policy Docs",        source: "GhostDraft generates",
    flow: { "Policy Issuance": "C" } },
  { id: 31, name: "Assembled Policy Document (PDF)",              category: "Policy Docs",        source: "GhostDraft / UE@Work generates",
    flow: { "Mid-Term Endorse.": "C" } },
  { id: 32, name: "Amended / Corrected Policy Documents",         category: "Policy Docs",        source: "GhostDraft regenerates after correction",
    flow: { "Mid-Term Endorse.": "C", "BOR / Legal": "C" } },
  { id: 33, name: "Endorsement Forms (Selected)",                 category: "Policy Docs",        source: "Added in UE@Work UW Adjustments tab",
    flow: { "Negotiation & Bind": "U", "Mid-Term Endorse.": "R", "BOR / Legal": "C" } },
  { id: 34, name: "Legal Notice Letters",                         category: "Legal / Compliance", source: "UTC generates via MailMerge",
    flow: { "BOR / Legal": "C" } },
  { id: 35, name: "Legal Notice Spreadsheet",                     category: "Legal / Compliance", source: "UTC generates from UE@Work",
    flow: { "BOR / Legal": "C" } },
  { id: 36, name: "BOR (Broker of Record) Letter — New Broker",   category: "Legal / Compliance", source: "GhostDraft via UE@Work",
    flow: { "BOR / Legal": "C" } },
  { id: 37, name: "Certified Mail Receipt & Green Postal Card",   category: "Legal / Compliance", source: "Physical mail — UTC prepares",
    flow: { "BOR / Legal": "C" } },
  { id: 38, name: "Correspondence Trail (YYYY Renewal / NB)",     category: "Correspondence",     source: "IR — printed by HTC/US/UW",
    flow: { "Pre-Renewal Proc.": "C", "Renewal Proc.": "U", "App Review": "U", "Negotiation & Bind": "U", "Policy Issuance": "U", "Mid-Term Endorse.": "U", "BOR / Legal": "U" } },
  { id: 39, name: "Claims Follow-Up Emails (to Claims Analysts)", category: "Correspondence",     source: "US sends via Outlook",
    flow: { "Renewal Proc.": "C", "App Review": "U" } },
  { id: 40, name: "At-Risk Notes / Flag (Salesforce)",            category: "Correspondence",     source: "UW flags in Salesforce",
    flow: { "BOR / Legal": "C" } },
];

// Map a SubmissionProfile.stage (display label) to the matrix DocStage column.
// Brookfield's stage is "Review In Progress" which maps to App Review.
const STAGE_MAP: Record<string, DocStage> = {
  "New Submission":        "NB Origination",
  "Information Gathering": "Submission Setup",
  "Triage":                "Submission Setup",
  "Review In Progress":    "App Review",
  "Pricing":               "Quoting & Pricing",
  "Quoting":               "Quoting & Pricing",
  "Quote Sent":            "Negotiation & Bind",
  "Quote Negotiation":     "Negotiation & Bind",
  "Bound":                 "Policy Issuance",
  "Declined to Quote":     "App Review",
};

export function currentDocStage(stage: string): DocStage {
  return STAGE_MAP[stage] ?? "App Review";
}

export const CATEGORIES: DocCategory[] = [
  "Submission", "Financial", "Loss Data", "Supplemental",
  "UW Internal", "Policy Docs", "Correspondence", "Legal / Compliance",
];

// Categories use only UE blue, gold, navy + neutral slate.
export const CATEGORY_META: Record<DocCategory, { color: string; icon: "FileText" | "Activity" | "Layers" | "Shield" | "MessageSquare" | "ScrollText" | "GraduationCap" | "BookOpen" }> = {
  "Submission":         { color: "#0123D4", icon: "FileText" },
  "Financial":          { color: "#0B1A6E", icon: "Activity" },
  "Loss Data":          { color: "#C9A227", icon: "Layers" },
  "Supplemental":       { color: "#C9A227", icon: "BookOpen" },
  "UW Internal":        { color: "#0123D4", icon: "Shield" },
  "Policy Docs":        { color: "#0B1A6E", icon: "ScrollText" },
  "Correspondence":     { color: "#5A6B8C", icon: "MessageSquare" },
  "Legal / Compliance": { color: "#0B1A6E", icon: "GraduationCap" },
};

// Quick aggregates used by the Companion.
export function docsForStage(stage: DocStage): DocRow[] {
  return DOC_MATRIX.filter(d => d.flow[stage]);
}
export function expectedAtStage(stage: DocStage, code: StatusCode): DocRow[] {
  return DOC_MATRIX.filter(d => d.flow[stage] === code);
}
export function lifecycleSummary(stage: DocStage) {
  const rows = docsForStage(stage);
  const by = (code: StatusCode) => rows.filter(d => d.flow[stage] === code).length;
  return { total: rows.length, P: by("P"), C: by("C"), R: by("R"), U: by("U") };
}
