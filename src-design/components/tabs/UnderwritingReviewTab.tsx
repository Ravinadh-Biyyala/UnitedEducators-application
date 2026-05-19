import { useEffect, useMemo, useRef, useState } from "react";
import {
  ClipboardCheck, ShieldCheck, Wallet, Activity, Scale, FileSignature,
  BarChart3, CheckCircle2, XCircle, AlertCircle, FileText,
  ChevronRight, ArrowLeft, ThumbsUp, Flag, MinusCircle, FileSearch,
  TrendingUp, Plus, X, ListPlus, Lock,
} from "lucide-react";
import { N, G, BDL, TD, TM, TT, OK, WARN, BAD, font } from "../DashboardCards";
import { useSubmissionWorkspaceOptional } from "../../context/SubmissionWorkspaceContext";
import { NewTaskModal as TasksNewTaskModal } from "./TasksTab";
import { useAuth } from "../../context/AuthContext";

/* ─── Assignable team roster used by the New-Task modal ───────────────────── */
const TEAM_ROSTER: { id: string; name: string; title: string }[] = [
  { id: "u1", name: "Sarah Mitchell",   title: "Underwriter"    },
  { id: "u2", name: "John Michaels",    title: "Sr. Underwriter" },
  { id: "u3", name: "Patricia Hoffman", title: "UW Manager"     },
  { id: "u4", name: "Robert Chen",      title: "UW Director"    },
  { id: "u5", name: "Tom Lee",          title: "Underwriter"    },
  { id: "u6", name: "Angela Torres",    title: "Underwriter"    },
];

/* ─── Task quick-tag palette (mirrors NotesTab convention) ────────────────── */
const TASK_QUICK_TAGS = ["Renewal", "New business", "Loss run", "Risk control", "Subjectivity", "Quote"];
const TASK_TAG_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  "Renewal":      { bg: "#E8F0F9", text: "#00427A", border: "#9ABCD6" },
  "Risk control": { bg: "#F0EEF8", text: "#4A2D80", border: "#C3B8E8" },
  "Loss run":     { bg: "#E8F5EC", text: "#1A5C30", border: "#93C8A0" },
  "Subjectivity": { bg: "#F0EEF8", text: "#4A2D80", border: "#C3B8E8" },
  "Quote":        { bg: "#E8F0F9", text: "#00427A", border: "#9ABCD6" },
  "New business": { bg: "#FFF8E6", text: "#8A5C00", border: "#F0D88A" },
};
const TASK_TAG_FALLBACK = { bg: "#F1F5F9", text: TM, border: "#CBD5E1" };

/* ─── Types ──────────────────────────────────────────────────────────────── */
type ValidationStatus = "pass" | "caution" | "fail" | "missing-docs";
type Decision         = "pending" | "approved" | "referred";

interface Validation {
  doc: string;
  required: boolean;
  received: boolean;
  passed: boolean | null;   // null = not evaluated (doc missing)
  note?: string;
}

interface Metric {
  label: string;
  value: string;
  tone?: "good" | "warn" | "bad" | "neutral";
  hint?: string;
}

interface SubPoint {
  label: string;
  desc: string;
  finding: string;
  tone: "good" | "warn" | "bad" | "neutral";
}

type ChartTone = "good" | "warn" | "bad" | "neutral";
type ChartData =
  | { kind: "bars";    title: string; subtitle?: string; unit?: string;
      bars: { label: string; value: number; tone?: ChartTone; }[]; }
  | { kind: "compare"; title: string; subtitle?: string; unit?: string;
      rows: { label: string; current: number; benchmark: number; }[]; };

interface ReviewItem {
  id: string;
  title: string;
  short: string;
  icon: React.ReactNode;
  status: ValidationStatus;
  subPoints: SubPoint[];
  validations: Validation[];
  metrics: Metric[];
  chart: ChartData;
}

/* ─── Status meta ────────────────────────────────────────────────────────── */
const STATUS_META: Record<ValidationStatus, { label: string; color: string; bg: string; border: string; icon: React.ReactNode }> = {
  pass:           { label: "Pass",          color: OK,   bg: "#E8F5EC", border: "#86EFAC", icon: <CheckCircle2 size={11}/> },
  caution:        { label: "Caution",       color: WARN, bg: "#FFF8E6", border: "#F0D88A", icon: <AlertCircle  size={11}/> },
  fail:           { label: "Fail",          color: BAD,  bg: "#FEE2E2", border: "#FCA5A5", icon: <XCircle      size={11}/> },
  "missing-docs": { label: "Missing Docs",  color: TM,   bg: "#F1F5F9", border: "#CBD5E1", icon: <MinusCircle  size={11}/> },
};

const DECISION_META: Record<Decision, { label: string; color: string; bg: string; border: string }> = {
  pending:  { label: "Pending Decision", color: TM,        bg: "#F1F5F9", border: "#CBD5E1" },
  approved: { label: "Approved",         color: OK,        bg: "#E8F5EC", border: "#86EFAC" },
  referred: { label: "Referred",         color: "#7B2FBE", bg: "#F3E8FF", border: "#D8B4FE" },
};

const TONE_COLOR: Record<NonNullable<Metric["tone"]>, string> = {
  good: OK, warn: WARN, bad: BAD, neutral: TM,
};

/* ─── Seed data (mock — wired to "submitted documents" of this submission) ── */
const REVIEW_DATA: ReviewItem[] = [
  /* 1 ── Loss Run & Claims History */
  {
    id: "loss-run",
    title: "Loss Run & Claims History Analysis",
    short: "Identify frequency/severity patterns, recurring claim types, reserve adequacy, and layer-piercing.",
    icon: <BarChart3 size={15}/>,
    status: "caution",
    subPoints: [
      { label: "Frequency vs. Severity",  desc: "Volume of small claims vs. single catastrophic events.",
        finding: "12 claims in 5-yr; 1 severity event ($425K — TBI / athletics).", tone: "warn" },
      { label: "Trend Identification",     desc: "Recurring claim types suggesting systemic SOP weakness.",
        finding: "Slip-and-fall on athletic facilities — 4 of 12 (33%). Trend flagged.", tone: "warn" },
      { label: "Reserve Adequacy",         desc: "Paid + reserved (Incurred) for open claims.",
        finding: "$182K incurred · $46K reserves on 2 open matters — adequate.", tone: "good" },
      { label: "Layer Piercing",           desc: "Past claims breaching primary into excess layers.",
        finding: "No primary breaches in 5-yr period.", tone: "good" },
    ],
    validations: [
      { doc: "5-Year Loss Runs",          required: true, received: true,  passed: true,
        note: "Carrier-prepared, all 5 years present." },
      { doc: "Open Claims Summary",       required: true, received: true,  passed: true },
      { doc: "Reserve Schedule",          required: true, received: true,  passed: true },
      { doc: "Excess Layer Loss History", required: false, received: true, passed: true },
    ],
    metrics: [
      { label: "5-yr Loss Ratio",  value: "58%",   tone: "good", hint: "Target ≤65%" },
      { label: "Claim Frequency",  value: "2.4/yr", tone: "warn", hint: "Peer avg 1.6" },
      { label: "Avg Severity",     value: "$38K",  tone: "neutral" },
      { label: "Open Claims",      value: "2",     tone: "neutral" },
    ],
    chart: {
      kind: "bars", title: "Claim Count by Year", subtitle: "5-year frequency trend · severity flagged",
      bars: [
        { label: "2020", value: 1, tone: "good" },
        { label: "2021", value: 3, tone: "warn" },
        { label: "2022", value: 2, tone: "good" },
        { label: "2023", value: 4, tone: "bad",  },
        { label: "2024", value: 2, tone: "good" },
      ],
    },
  },

  /* 2 ── Financial Document Review */
  {
    id: "financial",
    title: "Financial Document Review (FDM)",
    short: "Confirm institutional capacity to fund deductibles/SIR and overall member-fit.",
    icon: <Wallet size={15}/>,
    status: "pass",
    subPoints: [
      { label: "Audited Financials",       desc: "Balance sheet and income statement strength.",
        finding: "3-yr trend of positive operating margin (4.8% avg).", tone: "good" },
      { label: "Enrollment & Revenue",     desc: "Stability of tuition revenue and enrollment.",
        finding: "Enrollment +6.2% YoY (842 → 894); tuition revenue $24.6M.", tone: "good" },
      { label: "Funding Mechanisms",       desc: "Actuarial opinion & funding status of internal reserves.",
        finding: "SIR fund 112% funded; actuarial sign-off current.", tone: "good" },
    ],
    validations: [
      { doc: "Audited Financials (3-yr)", required: true, received: true,  passed: true },
      { doc: "Enrollment History",        required: true, received: true,  passed: true },
      { doc: "Actuarial Opinion Letter",  required: true, received: true,  passed: true,
        note: "Dated within 12 months." },
      { doc: "SIR Funding Statement",     required: false, received: true, passed: true },
    ],
    metrics: [
      { label: "Operating Margin", value: "4.8%",  tone: "good" },
      { label: "Enrollment YoY",   value: "+6.2%", tone: "good" },
      { label: "SIR Funding",      value: "112%",  tone: "good", hint: "Target ≥100%" },
      { label: "Days Cash on Hand",value: "186",   tone: "good", hint: "Peer avg 140" },
    ],
    chart: {
      kind: "bars", title: "Enrollment Trend", subtitle: "5-year student count · steady growth",
      bars: [
        { label: "2020", value: 802, tone: "neutral" },
        { label: "2021", value: 818, tone: "neutral" },
        { label: "2022", value: 829, tone: "neutral" },
        { label: "2023", value: 842, tone: "good" },
        { label: "2024", value: 894, tone: "good" },
      ],
    },
  },

  /* 3 ── Operational & Exposure */
  {
    id: "operational",
    title: "Operational & Exposure Review",
    short: "Map physical and programmatic activities to specific liability exposures.",
    icon: <Activity size={15}/>,
    status: "pass",
    subPoints: [
      { label: "Student/Faculty Demographics", desc: "Sum at risk across students, staff, locations.",
        finding: "894 students · 142 staff · 3 campus locations.", tone: "neutral" },
      { label: "High-Risk Programs",           desc: "Athletics, Greek life, study abroad, lab research.",
        finding: "Football & basketball active; no Greek life; 18 study-abroad placements.", tone: "warn" },
      { label: "Experiential Learning",        desc: "Student internships / professional placements.",
        finding: "44 IPL placements — all carry vendor agreements.", tone: "good" },
    ],
    validations: [
      { doc: "Statement of Values (SOV)", required: true, received: true,  passed: true },
      { doc: "Athletic Roster & Sports",  required: true, received: true,  passed: true },
      { doc: "Study Abroad Program List", required: true, received: true,  passed: true },
      { doc: "Internship / IPL Policy",   required: false, received: true, passed: true },
    ],
    metrics: [
      { label: "Total Enrollment",  value: "894",  tone: "neutral" },
      { label: "Athletic Programs", value: "11",   tone: "warn",   hint: "Includes football" },
      { label: "Study Abroad",      value: "18",   tone: "neutral" },
      { label: "Campus Locations",  value: "3",    tone: "neutral" },
    ],
    chart: {
      kind: "bars", title: "High-Risk Program Participation", subtitle: "Headcount by program · football flagged",
      bars: [
        { label: "Football",        value: 64, tone: "bad"  },
        { label: "Basketball",      value: 42, tone: "warn" },
        { label: "Other Athletics", value: 188, tone: "neutral" },
        { label: "Study Abroad",    value: 18, tone: "neutral" },
        { label: "Labs / Research", value: 31, tone: "neutral" },
      ],
    },
  },

  /* 4 ── Governance & Management Liability */
  {
    id: "governance",
    title: "Governance & Management Liability Scrub",
    short: "Review HR, admissions, and Title IX procedures driving ELL/SBL exposure.",
    icon: <Scale size={15}/>,
    status: "missing-docs",
    subPoints: [
      { label: "HR Policies",        desc: "SOPs for tenure, evaluations, disciplinary actions.",
        finding: "Tenure & discipline SOPs current; reviewed within 12 months.", tone: "good" },
      { label: "Admissions Integrity", desc: "Post-scandal protocols and whistleblowing.",
        finding: "Multi-person admissions decisions documented; whistleblower channel active.", tone: "good" },
      { label: "Title IX Compliance",  desc: "Sexual harassment investigation & campus security.",
        finding: "Investigation log not received — required to clear this review.", tone: "bad" },
    ],
    validations: [
      { doc: "HR Handbook",                 required: true, received: true,  passed: true },
      { doc: "Admissions Procedures",       required: true, received: true,  passed: true },
      { doc: "Whistleblower Policy",        required: true, received: true,  passed: true },
      { doc: "Title IX Investigation Log",  required: true, received: false, passed: null,
        note: "Outstanding — request from broker." },
      { doc: "Campus Security Plan",        required: false, received: true, passed: true },
    ],
    metrics: [
      { label: "Open ELL Claims",     value: "1",    tone: "warn" },
      { label: "HR Compliance Score", value: "92%",  tone: "good", hint: "Threshold 80%" },
      { label: "Title IX Cases (3y)", value: "2",    tone: "neutral" },
      { label: "Docs Outstanding",    value: "1",    tone: "bad" },
    ],
    chart: {
      kind: "bars", title: "Title IX Cases by Year", subtitle: "3-year case volume · resolution tracked",
      bars: [
        { label: "2022", value: 0, tone: "good" },
        { label: "2023", value: 1, tone: "warn" },
        { label: "2024", value: 1, tone: "warn" },
      ],
    },
  },

  /* 5 ── Contractual & Risk Control */
  {
    id: "contractual",
    title: "Contractual & Risk Control Review",
    short: "Assess vendor COI program, indemnity language, and training participation.",
    icon: <FileSignature size={15}/>,
    status: "caution",
    subPoints: [
      { label: "COI Management",          desc: "Centralized vendor COI / Additional Insured tracking.",
        finding: "Centralized through Risk Mgmt; 92% of active vendors current.", tone: "good" },
      { label: "Indemnity Language",      desc: "Model indemnity/waiver in facility & PO agreements.",
        finding: "Model indemnity in use; legal review current.", tone: "good" },
      { label: "Training Participation",  desc: "Premium credits via mandatory training completion.",
        finding: "Transportation Safety 88% · Title IX 71% — below 85% target.", tone: "warn" },
    ],
    validations: [
      { doc: "Vendor COI Program Doc",      required: true, received: true,  passed: true },
      { doc: "Master Services Agreement",   required: true, received: true,  passed: true },
      { doc: "Training Completion Records", required: true, received: true,  passed: false,
        note: "Title IX completion 71% — below 85% threshold." },
      { doc: "Waiver Templates",            required: false, received: true, passed: true },
    ],
    metrics: [
      { label: "Vendor COI Current",   value: "92%",  tone: "good", hint: "Target 90%" },
      { label: "Training Completion",  value: "79%",  tone: "warn", hint: "Target 85%" },
      { label: "Vendors Covered",      value: "186",  tone: "neutral" },
      { label: "Premium Credit Earned",value: "$1.4K", tone: "good" },
    ],
    chart: {
      kind: "bars", title: "Training Completion by Topic", subtitle: "% complete · target 85%", unit: "%",
      bars: [
        { label: "Transportation Safety", value: 88, tone: "good" },
        { label: "Title IX",              value: 71, tone: "warn" },
        { label: "Child Protection",      value: 92, tone: "good" },
        { label: "Lab Safety",            value: 84, tone: "warn" },
        { label: "Cyber Awareness",       value: 76, tone: "warn" },
      ],
    },
  },

  /* 6 ── Benchmarking */
  {
    id: "benchmarking",
    title: "Comparable Risk Benchmarking",
    short: "Position the institution against industry data and large-loss patterns.",
    icon: <FileSearch size={15}/>,
    status: "pass",
    subPoints: [
      { label: "Large Loss Reports",  desc: "Vulnerability to social inflation in education claims.",
        finding: "Limits and SAM sublimit align with peer cohort settlements.", tone: "good" },
      { label: "Top Risks Survey",    desc: "Self-reported risks vs. industry benchmark.",
        finding: "Self-reported risks track industry top 5 — no blind spots.", tone: "good" },
    ],
    validations: [
      { doc: "Industry Benchmark Report",   required: false, received: true, passed: true,
        note: "UE 2025 K-12 dataset (peer-matched)." },
      { doc: "Self-Reported Risk Survey",   required: true, received: true,  passed: true },
    ],
    metrics: [
      { label: "Peer Loss Ratio",     value: "62%",  tone: "neutral", hint: "K-12 cohort" },
      { label: "This Account",        value: "58%",  tone: "good",   hint: "Below peer avg" },
      { label: "Top-Risk Alignment",  value: "5/5",  tone: "good" },
      { label: "Peer Cohort Size",    value: "47",   tone: "neutral" },
    ],
    chart: {
      kind: "compare", title: "This Account vs. Peer Cohort",
      subtitle: "K-12 cohort · 47 peer accounts", unit: "%",
      rows: [
        { label: "Loss Ratio",         current: 58, benchmark: 62 },
        { label: "Claim Frequency",    current: 24, benchmark: 16 },
        { label: "Training Completion",current: 79, benchmark: 82 },
        { label: "COI Compliance",     current: 92, benchmark: 88 },
        { label: "Days Cash on Hand",  current: 93, benchmark: 70 },
      ],
    },
  },
];

/* ─── Helpers ────────────────────────────────────────────────────────────── */
function StatusPill({ status }: { status: ValidationStatus }) {
  const m = STATUS_META[status];
  return (
    <span className="inline-flex items-center gap-1" style={{
      background: m.bg, color: m.color, border: `1px solid ${m.border}`,
      padding: "2px 8px", borderRadius: 999,
      fontSize: "0.62rem", fontWeight: 800, letterSpacing: "0.04em",
      textTransform: "uppercase",
    }}>
      {m.icon} {m.label}
    </span>
  );
}

function DecisionPill({ decision }: { decision: Decision }) {
  const m = DECISION_META[decision];
  return (
    <span className="inline-flex items-center gap-1" style={{
      background: m.bg, color: m.color, border: `1px solid ${m.border}`,
      padding: "2px 8px", borderRadius: 999,
      fontSize: "0.6rem", fontWeight: 800, letterSpacing: "0.04em",
      textTransform: "uppercase",
    }}>
      {m.label}
    </span>
  );
}

/* ─── Component ──────────────────────────────────────────────────────────── */
export function UnderwritingReviewTab() {
  const workspace = useSubmissionWorkspaceOptional();
  const { user } = useAuth();
  const [decisions, setDecisions] = useState<Record<string, Decision>>(() =>
    Object.fromEntries(REVIEW_DATA.map(r => [r.id, "pending"]))
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [referFor, setReferFor] = useState<ReviewItem | null>(null);
  const [approveFor, setApproveFor] = useState<ReviewItem | null>(null);

  // Surface which checklist item is open so the chatbot can show
  // suggestions tailored to that specific review.
  useEffect(() => {
    workspace?.setActiveReviewId(selectedId);
    return () => workspace?.setActiveReviewId(null);
  }, [selectedId, workspace]);

  const setDecision = (id: string, d: Decision) =>
    setDecisions(prev => ({ ...prev, [id]: d }));

  // Approve click — second click toggles off; first click opens the approve
  // modal where the underwriter writes a note. Note is pushed to Notes tab
  // and the decision only flips to "approved" on submit.
  const handleApprove = (item: ReviewItem) => {
    if (decisions[item.id] === "approved") {
      setDecision(item.id, "pending");
    } else {
      setApproveFor(item);
    }
  };

  // Refer click — second click toggles off; first click opens the New Task
  // modal pre-filled as a Referral and only marks the decision on submit.
  const handleRefer = (item: ReviewItem) => {
    if (decisions[item.id] === "referred") {
      setDecision(item.id, "pending");
    } else {
      setReferFor(item);
    }
  };

  const selected = useMemo(
    () => REVIEW_DATA.find(r => r.id === selectedId) ?? null,
    [selectedId]
  );

  return (
    <>
      {selected ? (
        <ReviewDetail
          item={selected}
          decision={decisions[selected.id]}
          onBack={() => setSelectedId(null)}
          onApprove={() => handleApprove(selected)}
          onRefer={() => handleRefer(selected)}
        />
      ) : (
        <ReviewList
          decisions={decisions}
          onOpen={(id) => setSelectedId(id)}
          onApprove={handleApprove}
          onRefer={handleRefer}
        />
      )}

      {approveFor && (
        <ApproveModal
          reviewTitle={approveFor.title}
          onClose={() => setApproveFor(null)}
          onSubmit={(note) => {
            const trimmed = note.trim();
            if (trimmed) {
              workspace?.pushPendingNote({
                content: trimmed,
                tags: ["Approval", approveFor.title],
                author: user?.name ?? "John Michaels",
                initials: user?.initials ?? "JM",
                avatarColor: N,
              });
            }
            setDecision(approveFor.id, "approved");
            setApproveFor(null);
          }}
        />
      )}

      {referFor && (
        <TasksNewTaskModal
          defaults={{ type: "Referral", title: `Refer: ${referFor.title}` }}
          onClose={() => setReferFor(null)}
          onSubmit={(partial) => {
            workspace?.addTask(partial);
            setDecision(referFor.id, "referred");
          }}
        />
      )}
    </>
  );
}

/* ═════════════════════════════════════════════════════════════════════════ */
/*  LIST VIEW                                                                */
/* ═════════════════════════════════════════════════════════════════════════ */
function ReviewList({
  decisions, onOpen, onApprove, onRefer,
}: {
  decisions: Record<string, Decision>;
  onOpen: (id: string) => void;
  onApprove: (item: ReviewItem) => void;
  onRefer: (item: ReviewItem) => void;
}) {
  const totals = useMemo(() => {
    const t = { pass: 0, caution: 0, fail: 0, missing: 0, approved: 0, referred: 0, pending: 0 };
    REVIEW_DATA.forEach(r => {
      if (r.status === "pass") t.pass++;
      if (r.status === "caution") t.caution++;
      if (r.status === "fail") t.fail++;
      if (r.status === "missing-docs") t.missing++;
      const d = decisions[r.id];
      if (d === "approved") t.approved++;
      else if (d === "referred") t.referred++;
      else t.pending++;
    });
    return t;
  }, [decisions]);

  return (
    <div style={{ fontFamily: font }} className="flex flex-col gap-4">
      {/* Header / overview strip */}
      <div style={{
        background: "white",
        border: `1px solid ${BDL}`,
        borderRadius: 8,
        padding: "14px 16px",
        boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
      }}>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span style={{
              width: 30, height: 30, borderRadius: 7,
              background: `${N}12`, color: N,
              display: "inline-flex", alignItems: "center", justifyContent: "center",
            }}>
              <ClipboardCheck size={16}/>
            </span>
            <div>
              <h2 style={{ fontSize: "0.95rem", fontWeight: 800, color: TD, lineHeight: 1.1 }}>
                Underwriting Review Checklist
              </h2>
              <p style={{ fontSize: "0.7rem", color: TT, marginTop: 2 }}>
                6 dimensions · validated against submitted documents
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <SummaryChip label="Pass"      n={totals.pass}    tone="good"/>
            <SummaryChip label="Caution"   n={totals.caution} tone="warn"/>
            <SummaryChip label="Fail"      n={totals.fail}    tone="bad"/>
            <SummaryChip label="Missing"   n={totals.missing} tone="neutral"/>
            <span style={{ width: 1, height: 18, background: BDL }}/>
            <SummaryChip label="Approved"  n={totals.approved} tone="good"/>
            <SummaryChip label="Referred"  n={totals.referred} tone="purple"/>
            <SummaryChip label="Pending"   n={totals.pending}  tone="neutral"/>
          </div>
        </div>
      </div>

      {/* Checklist rows */}
      <div style={{
        background: "white",
        border: `1px solid ${BDL}`,
        borderRadius: 8,
        boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
        overflow: "hidden",
      }}>
        {REVIEW_DATA.map((r, idx) => {
          const d = decisions[r.id];
          return (
            <ChecklistRow
              key={r.id}
              item={r}
              idx={idx + 1}
              decision={d}
              isLast={idx === REVIEW_DATA.length - 1}
              onOpen={() => onOpen(r.id)}
              onApprove={() => onApprove(r)}
              onRefer={() => onRefer(r)}
            />
          );
        })}
      </div>
    </div>
  );
}

function SummaryChip({ label, n, tone }: { label: string; n: number; tone: "good" | "warn" | "bad" | "neutral" | "purple" }) {
  const color =
    tone === "good"    ? OK   :
    tone === "warn"    ? WARN :
    tone === "bad"     ? BAD  :
    tone === "purple"  ? "#7B2FBE" : TM;
  const bg =
    tone === "good"    ? "#E8F5EC" :
    tone === "warn"    ? "#FFF8E6" :
    tone === "bad"     ? "#FEE2E2" :
    tone === "purple"  ? "#F3E8FF" : "#F1F5F9";
  return (
    <span className="inline-flex items-center gap-1.5" style={{
      background: bg, color, borderRadius: 999,
      padding: "3px 9px",
      fontSize: "0.62rem", fontWeight: 800, letterSpacing: "0.04em",
      textTransform: "uppercase",
    }}>
      <span style={{ fontVariantNumeric: "tabular-nums", fontWeight: 900 }}>{n}</span> {label}
    </span>
  );
}

function ChecklistRow({
  item, idx, decision, isLast, onOpen, onApprove, onRefer,
}: {
  item: ReviewItem;
  idx: number;
  decision: Decision;
  isLast: boolean;
  onOpen: () => void;
  onApprove: () => void;
  onRefer: () => void;
}) {
  const docsTotal     = item.validations.length;
  const docsReceived  = item.validations.filter(v => v.received).length;
  const docsRequired  = item.validations.filter(v => v.required).length;
  const docsMissing   = item.validations.filter(v => v.required && !v.received).length;

  return (
    <div
      onClick={onOpen}
      className="cursor-pointer transition-colors hover:bg-slate-50"
      style={{
        borderBottom: isLast ? "none" : `1px solid ${BDL}`,
        padding: "14px 16px",
        display: "grid",
        gridTemplateColumns: "auto 1fr auto",
        gap: 14,
        alignItems: "center",
      }}>
      {/* Left: index + icon */}
      <div className="flex items-center gap-3">
        <span style={{
          width: 24, height: 24, borderRadius: 6,
          background: "#F0F3F8", color: TM,
          fontSize: "0.7rem", fontWeight: 800,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          fontVariantNumeric: "tabular-nums",
        }}>
          {String(idx).padStart(2, "0")}
        </span>
        <span style={{
          width: 32, height: 32, borderRadius: 7,
          background: `${N}10`, color: N,
          display: "inline-flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
        }}>
          {item.icon}
        </span>
      </div>

      {/* Middle: title + meta */}
      <div style={{ minWidth: 0 }}>
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span style={{ fontSize: "0.86rem", fontWeight: 800, color: TD }}>
            {item.title}
          </span>
          <StatusPill status={item.status}/>
          <DecisionPill decision={decision}/>
        </div>
        <p style={{ fontSize: "0.72rem", color: TM, lineHeight: 1.4, marginBottom: 6 }}>
          {item.short}
        </p>
        <div className="flex items-center gap-3 flex-wrap" style={{ fontSize: "0.65rem", color: TT }}>
          <span className="inline-flex items-center gap-1">
            <FileText size={10}/>
            <strong style={{ color: TM, fontWeight: 700 }}>{docsReceived}/{docsTotal}</strong> docs received
          </span>
          <span>·</span>
          <span>{docsRequired} required</span>
          {docsMissing > 0 && (
            <>
              <span>·</span>
              <span style={{ color: BAD, fontWeight: 700 }}>{docsMissing} outstanding</span>
            </>
          )}
        </div>
      </div>

      {/* Right: quick actions */}
      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
        <ActionButton tone="approve" active={decision === "approved"}
          onClick={onApprove}/>
        <ActionButton tone="refer"   active={decision === "referred"}
          onClick={onRefer}/>
        <button
          onClick={onOpen}
          className="flex items-center gap-1 transition-all"
          style={{
            background: N, color: "white", border: "none",
            padding: "6px 11px", borderRadius: 6, cursor: "pointer",
            fontSize: "0.7rem", fontWeight: 700, fontFamily: font,
          }}>
          Analytics <ChevronRight size={11}/>
        </button>
      </div>
    </div>
  );
}

function ActionButton({
  tone, active, onClick,
}: {
  tone: "approve" | "refer";
  active: boolean;
  onClick: () => void;
}) {
  const cfg = tone === "approve"
    ? { color: OK,        bg: "#E8F5EC", border: "#86EFAC", icon: <ThumbsUp size={11}/>, label: "Approve" }
    : { color: "#7B2FBE", bg: "#F3E8FF", border: "#D8B4FE", icon: <Flag     size={11}/>, label: "Refer"   };
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1 transition-all"
      style={{
        background: active ? cfg.bg : "white",
        color: active ? cfg.color : TM,
        border: `1px solid ${active ? cfg.border : BDL}`,
        padding: "5px 10px", borderRadius: 6, cursor: "pointer",
        fontSize: "0.66rem", fontWeight: 700, fontFamily: font,
      }}>
      {cfg.icon} {cfg.label}
    </button>
  );
}

/* ═════════════════════════════════════════════════════════════════════════ */
/*  DETAIL / ANALYTICS VIEW                                                  */
/* ═════════════════════════════════════════════════════════════════════════ */
function ReviewDetail({
  item, decision, onBack, onApprove, onRefer,
}: {
  item: ReviewItem;
  decision: Decision;
  onBack: () => void;
  onApprove: () => void;
  onRefer: () => void;
}) {
  const docsTotal    = item.validations.length;
  const docsReceived = item.validations.filter(v => v.received).length;
  const docsPassed   = item.validations.filter(v => v.passed === true).length;
  const docsFailed   = item.validations.filter(v => v.passed === false).length;
  const passRate     = docsTotal ? Math.round((docsPassed / docsTotal) * 100) : 0;

  // Trigger entrance animations on mount.
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, [item.id]);
  useEffect(() => { setReady(false); }, [item.id]);

  // Task modal — opens when a finding's "Task" button is clicked.
  const [taskFor, setTaskFor] = useState<SubPoint | null>(null);

  return (
    <div style={{ fontFamily: font }} className="flex flex-col gap-4">
      <ReviewStyles/>

      {/* Header card with animated gradient stripe */}
      <div
        className="rev-fade-up"
        style={{
          background: "white",
          border: `1px solid ${BDL}`,
          borderRadius: 10,
          padding: 16,
          boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
          position: "relative",
          overflow: "hidden",
        }}>
        <span aria-hidden style={{
          position: "absolute", inset: "0 0 auto 0", height: 3,
          background: `linear-gradient(90deg, ${N}, ${G})`,
          backgroundSize: "200% 100%",
          animation: "revStripe 6s linear infinite",
        }}/>

        <button
          onClick={onBack}
          className="inline-flex items-center gap-1 transition-colors hover:underline mb-3"
          style={{
            background: "transparent", border: "none", cursor: "pointer",
            color: TM, fontSize: "0.72rem", fontWeight: 600, fontFamily: font,
          }}>
          <ArrowLeft size={12}/> Back to checklist
        </button>

        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-3" style={{ flex: 1, minWidth: 240 }}>
            <span style={{
              width: 42, height: 42, borderRadius: 9,
              background: `linear-gradient(135deg, ${N}15, ${N}08)`,
              color: N, border: `1px solid ${N}1F`,
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
              animation: "revPopIn 0.4s ease both",
            }}>
              {item.icon}
            </span>
            <div style={{ minWidth: 0 }}>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h2 style={{ fontSize: "1.02rem", fontWeight: 800, color: TD, lineHeight: 1.15 }}>
                  {item.title}
                </h2>
                <StatusPill status={item.status}/>
                <DecisionPill decision={decision}/>
              </div>
              <p style={{ fontSize: "0.75rem", color: TM, lineHeight: 1.45 }}>
                {item.short}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <DecisionButton
              tone="approve" active={decision === "approved"}
              onClick={onApprove}
            />
            <DecisionButton
              tone="refer" active={decision === "referred"}
              onClick={onRefer}
            />
          </div>
        </div>
      </div>

      {/* KPI row — animated count-up tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {item.metrics.map((m, i) => (
          <MetricTile key={`${item.id}-${i}`} metric={m} delay={i * 60}/>
        ))}
      </div>

      {/* Two-column analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Sub-points */}
        <div
          className="rev-fade-up"
          style={{
            background: "white", border: `1px solid ${BDL}`, borderRadius: 10,
            boxShadow: "0 1px 2px rgba(15,23,42,0.04)", overflow: "hidden",
            animationDelay: "120ms",
          }}>
          <SectionHeader title="Analysis Findings" icon={<ShieldCheck size={13}/>}/>
          <div>
            {item.subPoints.map((sp, i) => (
              <SubPointRow key={i} sp={sp} isLast={i === item.subPoints.length - 1} delay={i * 80} ready={ready} onTask={() => setTaskFor(sp)}/>
            ))}
          </div>
        </div>

        {/* Document validation */}
        <div
          className="rev-fade-up"
          style={{
            background: "white", border: `1px solid ${BDL}`, borderRadius: 10,
            boxShadow: "0 1px 2px rgba(15,23,42,0.04)", overflow: "hidden",
            animationDelay: "180ms",
          }}>
          <SectionHeader
            title="Document Validation"
            icon={<FileText size={13}/>}
            extra={
              <span style={{ fontSize: "0.62rem", fontWeight: 700, color: TM }}>
                <span style={{ color: OK }}>{docsPassed} pass</span>
                {docsFailed > 0 && <> · <span style={{ color: BAD }}>{docsFailed} fail</span></>}
                {" · "}<span>{docsReceived}/{docsTotal} received</span>
              </span>
            }
          />

          {/* Radial gauge + key stats */}
          <div style={{ padding: "16px", borderBottom: `1px solid ${BDL}`, display: "flex", gap: 16, alignItems: "center" }}>
            <RadialGauge value={passRate} ready={ready}/>
            <div className="flex flex-col gap-2 flex-1 min-w-0">
              <GaugeStat label="Validated" n={docsPassed} total={docsTotal} color={OK}/>
              <GaugeStat label="Failed"    n={docsFailed} total={docsTotal} color={BAD}/>
              <GaugeStat label="Outstanding" n={docsTotal - docsReceived} total={docsTotal} color={TM}/>
            </div>
          </div>

          <div>
            {item.validations.map((v, i) => (
              <ValidationRow key={i} v={v} isLast={i === item.validations.length - 1} delay={i * 50} ready={ready}/>
            ))}
          </div>
        </div>
      </div>

      {/* Chart panel — full width */}
      <ChartPanel chart={item.chart} ready={ready}/>

      {/* Task modal — opened from a finding's "Task" button */}
      {taskFor && (
        <NewTaskModal
          subPoint={taskFor}
          reviewTitle={item.title}
          onClose={() => setTaskFor(null)}
        />
      )}
    </div>
  );
}

/* ─── Decision button (larger / hero version for the detail header) ────────── */
function DecisionButton({
  tone, active, onClick,
}: {
  tone: "approve" | "refer";
  active: boolean;
  onClick: () => void;
}) {
  const cfg = tone === "approve"
    ? { color: OK,        bg: "#E8F5EC", border: "#86EFAC", icon: <ThumbsUp size={12}/>, label: "Approve", shadow: `${OK}30` }
    : { color: "#7B2FBE", bg: "#F3E8FF", border: "#D8B4FE", icon: <Flag     size={12}/>, label: "Refer",   shadow: "#7B2FBE30" };
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 transition-all"
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-1px)";
        e.currentTarget.style.boxShadow = active ? `0 6px 16px ${cfg.shadow}` : `0 4px 12px rgba(15,23,42,0.08)`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = active ? `0 3px 10px ${cfg.shadow}` : "none";
      }}
      style={{
        background: active ? cfg.color : "white",
        color: active ? "white" : cfg.color,
        border: `1px solid ${active ? cfg.color : cfg.border}`,
        padding: "8px 14px", borderRadius: 7, cursor: "pointer",
        fontSize: "0.74rem", fontWeight: 700, fontFamily: font,
        transition: "all 0.2s ease",
        boxShadow: active ? `0 3px 10px ${cfg.shadow}` : "none",
      }}>
      {cfg.icon} {cfg.label}
    </button>
  );
}

/* ─── Animated sub-point row ───────────────────────────────────────────────── */
function SubPointRow({
  sp, isLast, delay, ready, onTask,
}: {
  sp: SubPoint; isLast: boolean; delay: number; ready: boolean; onTask: () => void;
}) {
  const color = TONE_COLOR[sp.tone];
  return (
    <div style={{
      padding: "12px 16px",
      borderBottom: isLast ? "none" : `1px solid ${BDL}`,
      position: "relative",
      opacity: ready ? 1 : 0,
      transform: ready ? "translateY(0)" : "translateY(6px)",
      transition: `opacity 0.4s ease ${delay}ms, transform 0.4s ease ${delay}ms`,
    }}>
      {/* Animated tone accent on the left */}
      <span aria-hidden style={{
        position: "absolute", left: 0, top: 10, bottom: 10,
        width: 3, borderRadius: 2,
        background: color,
        transform: ready ? "scaleY(1)" : "scaleY(0)",
        transformOrigin: "top",
        transition: `transform 0.45s cubic-bezier(0.22, 1, 0.36, 1) ${delay + 80}ms`,
      }}/>
      <div className="flex items-start justify-between gap-3 mb-1" style={{ paddingLeft: 8 }}>
        <span style={{ fontSize: "0.78rem", fontWeight: 700, color: TD }}>{sp.label}</span>
        <ToneDot tone={sp.tone}/>
      </div>
      <p style={{ fontSize: "0.7rem", color: TT, lineHeight: 1.4, marginBottom: 4, paddingLeft: 8 }}>
        {sp.desc}
      </p>
      <p style={{
        fontSize: "0.72rem", lineHeight: 1.45, paddingLeft: 8,
        color: sp.tone === "neutral" ? TM : color,
        fontWeight: 600,
      }}>
        → {sp.finding}
      </p>
      <div className="flex justify-end" style={{ marginTop: 6 }}>
        <button
          onClick={onTask}
          className="inline-flex items-center gap-1 transition-all"
          onMouseEnter={(e) => {
            e.currentTarget.style.background = `${N}10`;
            e.currentTarget.style.borderColor = `${N}55`;
            e.currentTarget.style.color = N;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "white";
            e.currentTarget.style.borderColor = BDL;
            e.currentTarget.style.color = TM;
          }}
          style={{
            background: "white",
            color: TM,
            border: `1px solid ${BDL}`,
            padding: "4px 9px", borderRadius: 6, cursor: "pointer",
            fontSize: "0.64rem", fontWeight: 700, fontFamily: font,
            letterSpacing: "0.02em",
          }}>
          <ListPlus size={11}/> Task
        </button>
      </div>
    </div>
  );
}

/* ─── Radial gauge for validation pass-rate ───────────────────────────────── */
function RadialGauge({ value, ready }: { value: number; ready: boolean }) {
  const size  = 88;
  const stroke = 9;
  const r     = (size - stroke) / 2;
  const c     = 2 * Math.PI * r;
  const color = value >= 80 ? OK : value >= 60 ? WARN : BAD;
  const offset = ready ? c * (1 - value / 100) : c;

  const display = useAnimatedNumber(value, ready);

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <defs>
          <linearGradient id="revGaugeGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%"  stopColor={color}/>
            <stop offset="100%" stopColor={color} stopOpacity={0.7}/>
          </linearGradient>
        </defs>
        <circle cx={size/2} cy={size/2} r={r} stroke="#EEF1F5" strokeWidth={stroke} fill="none"/>
        <circle
          cx={size/2} cy={size/2} r={r}
          stroke="url(#revGaugeGrad)" strokeWidth={stroke} fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.22, 1, 0.36, 1)" }}/>
      </svg>
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
      }}>
        <span style={{ fontSize: "1.1rem", fontWeight: 800, color, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
          {Math.round(display)}<span style={{ fontSize: "0.66rem", fontWeight: 700 }}>%</span>
        </span>
        <span style={{ fontSize: "0.52rem", fontWeight: 700, color: TT, textTransform: "uppercase", letterSpacing: "0.07em", marginTop: 2 }}>
          Pass Rate
        </span>
      </div>
    </div>
  );
}

function GaugeStat({ label, n, total, color }: { label: string; n: number; total: number; color: string }) {
  const pct = total === 0 ? 0 : (n / total) * 100;
  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between mb-0.5">
        <span style={{ fontSize: "0.62rem", fontWeight: 700, color: TM, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</span>
        <span style={{ fontSize: "0.74rem", fontWeight: 800, color, fontVariantNumeric: "tabular-nums" }}>{n}</span>
      </div>
      <div style={{ width: "100%", height: 4, background: "#EEF1F5", borderRadius: 2, overflow: "hidden" }}>
        <div style={{
          width: `${pct}%`, height: "100%",
          background: color, borderRadius: 2,
          transition: "width 0.7s cubic-bezier(0.22, 1, 0.36, 1)",
        }}/>
      </div>
    </div>
  );
}

/* ─── Chart panel (bars or compare) ───────────────────────────────────────── */
function ChartPanel({ chart, ready }: { chart: ChartData; ready: boolean }) {
  return (
    <div
      className="rev-fade-up"
      style={{
        background: "white",
        border: `1px solid ${BDL}`,
        borderRadius: 10,
        boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
        overflow: "hidden",
        animationDelay: "240ms",
      }}>
      <SectionHeader
        title={chart.title}
        icon={chart.kind === "compare" ? <TrendingUp size={13}/> : <BarChart3 size={13}/>}
        extra={chart.subtitle && (
          <span style={{ fontSize: "0.62rem", fontWeight: 600, color: TM }}>{chart.subtitle}</span>
        )}
      />
      <div style={{ padding: 16 }}>
        {chart.kind === "bars"
          ? <BarsChart data={chart} ready={ready}/>
          : <CompareChart data={chart} ready={ready}/>}
      </div>
    </div>
  );
}

function BarsChart({
  data, ready,
}: {
  data: Extract<ChartData, { kind: "bars" }>;
  ready: boolean;
}) {
  const max = Math.max(1, ...data.bars.map(b => b.value));
  const unit = data.unit ?? "";
  return (
    <div className="flex flex-col gap-2.5">
      {data.bars.map((b, i) => {
        const color = b.tone ? TONE_COLOR[b.tone] : N;
        const pct   = (b.value / max) * 100;
        return (
          <div key={i}>
            <div className="flex items-center justify-between mb-1">
              <span style={{ fontSize: "0.7rem", fontWeight: 600, color: TM }}>{b.label}</span>
              <span style={{ fontSize: "0.74rem", fontWeight: 800, color, fontVariantNumeric: "tabular-nums" }}>
                {b.value.toLocaleString()}{unit}
              </span>
            </div>
            <div style={{ width: "100%", height: 10, background: "#EEF1F5", borderRadius: 5, overflow: "hidden", position: "relative" }}>
              <div style={{
                position: "absolute", inset: 0,
                width: ready ? `${pct}%` : "0%",
                background: `linear-gradient(to right, ${color}, ${color}B3)`,
                borderRadius: 5,
                boxShadow: `2px 0 8px ${color}40`,
                transition: `width 0.85s cubic-bezier(0.22, 1, 0.36, 1) ${100 + i * 80}ms`,
              }}/>
              {/* Subtle inner highlight stripe */}
              <span aria-hidden style={{
                position: "absolute", left: 0, top: 0, bottom: 0,
                width: ready ? `${pct}%` : "0%",
                background: "linear-gradient(180deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 50%)",
                borderRadius: 5,
                transition: `width 0.85s cubic-bezier(0.22, 1, 0.36, 1) ${100 + i * 80}ms`,
                pointerEvents: "none",
              }}/>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CompareChart({
  data, ready,
}: {
  data: Extract<ChartData, { kind: "compare" }>;
  ready: boolean;
}) {
  const max = Math.max(1, ...data.rows.flatMap(r => [r.current, r.benchmark]));
  const unit = data.unit ?? "";
  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex items-center gap-4" style={{ fontSize: "0.66rem", fontWeight: 700, color: TM }}>
        <span className="inline-flex items-center gap-1.5">
          <span style={{ width: 10, height: 10, borderRadius: 2, background: N }}/> This account
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span style={{ width: 10, height: 10, borderRadius: 2, background: "#9DB2D6" }}/> Peer benchmark
        </span>
      </div>
      {data.rows.map((row, i) => {
        const better = row.current >= row.benchmark;
        const curPct = (row.current / max) * 100;
        const benPct = (row.benchmark / max) * 100;
        return (
          <div key={i}>
            <div className="flex items-center justify-between mb-1">
              <span style={{ fontSize: "0.7rem", fontWeight: 600, color: TM }}>{row.label}</span>
              <span className="inline-flex items-center gap-1.5" style={{ fontSize: "0.7rem", fontVariantNumeric: "tabular-nums" }}>
                <span style={{ fontWeight: 800, color: TD }}>{row.current}{unit}</span>
                <span style={{ fontSize: "0.58rem", color: TT, fontWeight: 700 }}>
                  vs {row.benchmark}{unit}
                </span>
                <span style={{
                  fontSize: "0.56rem", fontWeight: 800, color: better ? OK : WARN,
                  background: better ? "#E8F5EC" : "#FFF8E6",
                  border: `1px solid ${better ? "#86EFAC" : "#F0D88A"}`,
                  padding: "1px 5px", borderRadius: 999,
                  textTransform: "uppercase", letterSpacing: "0.04em",
                }}>
                  {better ? "▲" : "▼"} {Math.abs(row.current - row.benchmark)}{unit}
                </span>
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <div style={{ width: "100%", height: 8, background: "#EEF1F5", borderRadius: 4, overflow: "hidden" }}>
                <div style={{
                  width: ready ? `${curPct}%` : "0%",
                  height: "100%",
                  background: `linear-gradient(to right, ${N}, ${N}B3)`,
                  borderRadius: 4,
                  transition: `width 0.85s cubic-bezier(0.22, 1, 0.36, 1) ${100 + i * 70}ms`,
                  boxShadow: `2px 0 6px ${N}40`,
                }}/>
              </div>
              <div style={{ width: "100%", height: 6, background: "#EEF1F5", borderRadius: 4, overflow: "hidden" }}>
                <div style={{
                  width: ready ? `${benPct}%` : "0%",
                  height: "100%",
                  background: "#9DB2D6",
                  borderRadius: 4,
                  transition: `width 0.85s cubic-bezier(0.22, 1, 0.36, 1) ${160 + i * 70}ms`,
                }}/>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Animated number hook ─────────────────────────────────────────────────── */
function useAnimatedNumber(target: number, ready: boolean, duration = 900): number {
  const [val, setVal] = useState(0);
  const startRef = useRef<number | null>(null);
  const rafRef   = useRef<number | null>(null);

  useEffect(() => {
    if (!ready) { setVal(0); return; }
    startRef.current = null;
    const step = (ts: number) => {
      if (startRef.current === null) startRef.current = ts;
      const t = Math.min(1, (ts - startRef.current) / duration);
      // ease-out-cubic
      const eased = 1 - Math.pow(1 - t, 3);
      setVal(target * eased);
      if (t < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target, ready, duration]);

  return val;
}

function SectionHeader({
  title, icon, extra,
}: {
  title: string;
  icon: React.ReactNode;
  extra?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between" style={{
      padding: "10px 16px",
      borderBottom: `1px solid ${BDL}`,
      background: "#F8FAFC",
    }}>
      <span className="inline-flex items-center gap-1.5" style={{
        fontSize: "0.66rem", fontWeight: 800, color: TM,
        textTransform: "uppercase", letterSpacing: "0.08em",
      }}>
        <span style={{ color: N }}>{icon}</span>
        {title}
      </span>
      {extra}
    </div>
  );
}

/* ─── Metric tile with animated value + hover micro-interaction ──────────── */
function MetricTile({ metric, delay }: { metric: Metric; delay: number }) {
  const color = metric.tone ? TONE_COLOR[metric.tone] : TD;
  const [hover, setHover] = useState(false);
  const [ready, setReady] = useState(false);

  // Parse the numeric portion (if any) for the count-up animation;
  // fall back to instant value when there's no number (e.g. "5/5").
  const parsed = parseMetricValue(metric.value);
  const display = useAnimatedNumber(parsed?.num ?? 0, ready);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), delay);
    return () => clearTimeout(t);
  }, [delay, metric.value]);

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: "white",
        border: `1px solid ${hover ? `${color}55` : BDL}`,
        borderRadius: 10,
        padding: "12px 14px",
        boxShadow: hover ? `0 6px 18px ${color}1F, 0 0 0 1px ${color}10` : "0 1px 2px rgba(15,23,42,0.04)",
        transform: hover ? "translateY(-2px)" : "translateY(0)",
        transition: "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
        position: "relative", overflow: "hidden",
        cursor: "default",
      }}>
      {/* tone accent on top */}
      <span aria-hidden style={{
        position: "absolute", inset: "0 0 auto 0", height: 3,
        background: `linear-gradient(90deg, ${color}, ${color}55)`,
        transform: ready ? "scaleX(1)" : "scaleX(0)",
        transformOrigin: "left",
        transition: "transform 0.6s cubic-bezier(0.22, 1, 0.36, 1)",
      }}/>
      <div style={{ fontSize: "0.58rem", fontWeight: 800, color: TT, textTransform: "uppercase", letterSpacing: "0.09em" }}>
        {metric.label}
      </div>
      <div style={{ fontSize: "1.2rem", fontWeight: 800, color, lineHeight: 1.1, marginTop: 3, fontVariantNumeric: "tabular-nums" }}>
        {parsed
          ? <>{parsed.prefix}{formatAnim(display, parsed)}{parsed.suffix}</>
          : metric.value}
      </div>
      {metric.hint && (
        <div style={{ fontSize: "0.6rem", color: TT, marginTop: 2 }}>{metric.hint}</div>
      )}
    </div>
  );
}

/* Parse strings like "58%", "+6.2%", "$38K", "$1.4K", "186" into animatable parts. */
function parseMetricValue(raw: string): {
  prefix: string; suffix: string; num: number; decimals: number;
} | null {
  const m = raw.match(/^([^\d.+-]*[+-]?)([\d,]+(?:\.\d+)?)([^\d.]*)$/);
  if (!m) return null;
  const prefix = m[1] ?? "";
  const numStr = (m[2] ?? "").replace(/,/g, "");
  const suffix = m[3] ?? "";
  const num = parseFloat(numStr);
  if (!isFinite(num)) return null;
  const decimals = numStr.includes(".") ? (numStr.split(".")[1]?.length ?? 0) : 0;
  return { prefix, suffix, num, decimals };
}

function formatAnim(v: number, p: { decimals: number; num: number }): string {
  if (p.decimals > 0) return v.toFixed(p.decimals);
  // For integers >= 1000 show with grouping.
  return Math.round(v).toLocaleString();
}

function ToneDot({ tone }: { tone: NonNullable<Metric["tone"]> }) {
  const color = TONE_COLOR[tone];
  return (
    <span style={{
      width: 8, height: 8, borderRadius: "50%",
      background: color, flexShrink: 0,
      boxShadow: `0 0 0 3px ${color}25`,
    }}/>
  );
}

function ValidationRow({
  v, isLast, delay = 0, ready = true,
}: {
  v: Validation; isLast: boolean; delay?: number; ready?: boolean;
}) {
  let statusIcon: React.ReactNode;
  let statusColor: string;
  let statusLabel: string;
  if (!v.received) {
    statusIcon = <MinusCircle size={12}/>; statusColor = TM;  statusLabel = "Missing";
  } else if (v.passed === false) {
    statusIcon = <XCircle      size={12}/>; statusColor = BAD; statusLabel = "Fail";
  } else if (v.passed === true) {
    statusIcon = <CheckCircle2 size={12}/>; statusColor = OK;  statusLabel = "Validated";
  } else {
    statusIcon = <AlertCircle  size={12}/>; statusColor = WARN; statusLabel = "Pending";
  }

  return (
    <div style={{
      padding: "10px 16px",
      borderBottom: isLast ? "none" : `1px solid ${BDL}`,
      display: "grid",
      gridTemplateColumns: "1fr auto",
      gap: 10,
      alignItems: "center",
      opacity: ready ? 1 : 0,
      transform: ready ? "translateY(0)" : "translateY(4px)",
      transition: `opacity 0.35s ease ${delay}ms, transform 0.35s ease ${delay}ms`,
    }}>
      <div style={{ minWidth: 0 }}>
        <div className="flex items-center gap-1.5 flex-wrap">
          <span style={{ fontSize: "0.76rem", fontWeight: 700, color: TD }}>{v.doc}</span>
          {v.required && (
            <span style={{
              fontSize: "0.54rem", fontWeight: 800, color: G,
              background: `${G}18`, border: `1px solid ${G}40`,
              padding: "1px 6px", borderRadius: 999,
              textTransform: "uppercase", letterSpacing: "0.06em",
            }}>
              Required
            </span>
          )}
        </div>
        {v.note && (
          <p style={{ fontSize: "0.66rem", color: TT, marginTop: 2, lineHeight: 1.4 }}>{v.note}</p>
        )}
      </div>
      <span className="inline-flex items-center gap-1" style={{
        color: statusColor,
        fontSize: "0.68rem", fontWeight: 700,
        background: `${statusColor}12`, border: `1px solid ${statusColor}40`,
        padding: "2px 8px", borderRadius: 999,
      }}>
        {statusIcon} {statusLabel}
      </span>
    </div>
  );
}

/* ═════════════════════════════════════════════════════════════════════════ */
/*  NEW TASK MODAL — opened from a finding's "Task" button                   */
/* ═════════════════════════════════════════════════════════════════════════ */
function NewTaskModal({
  subPoint, reviewTitle, onClose,
}: {
  subPoint: SubPoint;
  reviewTitle: string;
  onClose: () => void;
}) {
  // Prefill the textarea with the finding so the user has the context inline.
  const seed = `Follow up — ${subPoint.label}: ${subPoint.finding}`;
  const [task, setTask] = useState(seed);
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const tagInputRef = useRef<HTMLInputElement | null>(null);

  // Task type ("task" creates a follow-up for anyone; "refer" routes the
  // finding to another underwriter — the current user is filtered out so
  // you can't refer to yourself).
  const { user } = useAuth();
  const myName = user?.name ?? "";
  const [taskType, setTaskType] = useState<"task" | "refer">("task");
  const assignOptions = useMemo(
    () => (taskType === "refer" ? TEAM_ROSTER.filter(p => p.name !== myName) : TEAM_ROSTER),
    [taskType, myName],
  );
  const [assignTo, setAssignTo] = useState<string>(() =>
    (TEAM_ROSTER.find(p => p.name === myName) ?? TEAM_ROSTER[0]).id,
  );
  // If the user switches to "refer" while their own name is selected, hop to
  // the next available teammate so the dropdown never shows an invalid value.
  useEffect(() => {
    if (!assignOptions.some(p => p.id === assignTo)) {
      setAssignTo(assignOptions[0]?.id ?? "");
    }
  }, [assignOptions, assignTo]);

  // Re-seed if the user opens the modal for a different finding mid-session.
  useEffect(() => {
    setTask(seed);
    setTags([]);
    setTagInput("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subPoint]);

  // ESC closes; focus the textarea on open.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const addTag = (t: string) => {
    const v = t.trim();
    if (!v) return;
    if (!tags.includes(v)) setTags(prev => [...prev, v]);
    setTagInput("");
  };
  const removeTag = (t: string) => setTags(prev => prev.filter(x => x !== t));

  const handleSave = () => {
    if (!task.trim()) return;
    onClose();
  };

  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  const today = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  return (
    <div
      onClick={handleBackdrop}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        background: "rgba(15, 25, 40, 0.55)",
        animation: "revFadeUp 0.2s ease both",
        fontFamily: font,
      }}>
      <div className="w-full mx-4"
        style={{
          maxWidth: 680,
          background: "white",
          border: `1px solid #C4CDD8`,
          borderRadius: 10,
          boxShadow: "0 20px 60px rgba(0,0,0,0.20)",
          animation: "revPopIn 0.22s cubic-bezier(0.22, 1, 0.36, 1) both",
          overflow: "hidden",
        }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: `1px solid ${BDL}` }}>
          <div className="flex items-center gap-3 min-w-0">
            <h2 style={{ fontSize: "1.05rem", fontWeight: 800, color: TD, whiteSpace: "nowrap" }}>New task</h2>
            <span style={{ fontSize: "0.78rem", color: TT, whiteSpace: "nowrap" }}>· {today}</span>
            <span style={{
              fontSize: "0.6rem", fontWeight: 800, color: N,
              background: `${N}12`, border: `1px solid ${N}30`,
              padding: "2px 8px", borderRadius: 999,
              textTransform: "uppercase", letterSpacing: "0.06em",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              maxWidth: 260,
            }}>
              {reviewTitle}
            </span>
          </div>
          <button onClick={onClose}
            className="flex items-center justify-center hover:bg-slate-100 transition-colors"
            style={{ width: 28, height: 28, color: TT, borderRadius: 6, border: "none", background: "transparent", cursor: "pointer" }}>
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          {/* Account + Submission row — locked: this finding is bound to the submission */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label style={{ fontSize: "0.65rem", fontWeight: 700, color: TT, textTransform: "uppercase", letterSpacing: "0.09em" }}>Account</label>
                <span className="inline-flex items-center gap-1" style={{ fontSize: "0.62rem", fontWeight: 700, color: TT }}>
                  <Lock size={9}/> locked
                </span>
              </div>
              <div className="relative">
                <input
                  value="Brookfield Day School"
                  readOnly
                  tabIndex={-1}
                  aria-readonly
                  className="w-full px-3 py-2.5 outline-none cursor-not-allowed"
                  style={{
                    fontSize: "0.84rem", border: `1px solid ${BDL}`, color: TM,
                    fontFamily: font, background: "#F4F6FA", borderRadius: 6,
                    paddingRight: 32,
                  }}
                />
                <Lock size={12} color={TT}
                  style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}/>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label style={{ fontSize: "0.65rem", fontWeight: 700, color: TT, textTransform: "uppercase", letterSpacing: "0.09em" }}>Submission</label>
                <span className="inline-flex items-center gap-1" style={{ fontSize: "0.62rem", fontWeight: 700, color: TT }}>
                  <Lock size={9}/> locked
                </span>
              </div>
              <div className="relative">
                <input
                  value="SUB-7829"
                  readOnly
                  tabIndex={-1}
                  aria-readonly
                  className="w-full px-3 py-2.5 outline-none cursor-not-allowed"
                  style={{
                    fontSize: "0.84rem", border: `1px solid ${BDL}`, color: TM,
                    fontFamily: font, background: "#F4F6FA", borderRadius: 6,
                    paddingRight: 32,
                  }}
                />
                <Lock size={12} color={TT}
                  style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}/>
              </div>
            </div>
          </div>

          {/* Task textarea */}
          <div>
            <label style={{ fontSize: "0.65rem", fontWeight: 700, color: TT, textTransform: "uppercase", letterSpacing: "0.09em", display: "block", marginBottom: 6 }}>Task</label>
            <textarea
              autoFocus
              value={task}
              onChange={e => setTask(e.target.value)}
              placeholder="What did you learn, decide, or need to follow up on?"
              rows={5}
              className="w-full outline-none resize-y px-3 py-3"
              style={{ fontSize: "0.84rem", border: `1px solid #C4CDD8`, color: TD, fontFamily: font, background: "white", boxSizing: "border-box", borderRadius: 6 }}
            />
          </div>

          {/* Task type + Assign to */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label style={{ fontSize: "0.65rem", fontWeight: 700, color: TT, textTransform: "uppercase", letterSpacing: "0.09em", display: "block", marginBottom: 6 }}>
                Task Type
              </label>
              <select
                value={taskType}
                onChange={e => setTaskType(e.target.value as "task" | "refer")}
                className="w-full px-3 py-2.5 outline-none"
                style={{
                  fontSize: "0.84rem", border: `1px solid #C4CDD8`, color: TD,
                  fontFamily: font, background: "white", borderRadius: 6, cursor: "pointer",
                }}>
                <option value="task">Task</option>
                <option value="refer">Refer</option>
              </select>
              <p style={{ fontSize: "0.66rem", color: TT, marginTop: 5, lineHeight: 1.4 }}>
                {taskType === "refer"
                  ? "Routes this finding to another underwriter for follow-up."
                  : "Creates a follow-up to-do on the submission."}
              </p>
            </div>
            <div>
              <label style={{ fontSize: "0.65rem", fontWeight: 700, color: TT, textTransform: "uppercase", letterSpacing: "0.09em", display: "block", marginBottom: 6 }}>
                Assign To
              </label>
              <select
                value={assignTo}
                onChange={e => setAssignTo(e.target.value)}
                className="w-full px-3 py-2.5 outline-none"
                style={{
                  fontSize: "0.84rem", border: `1px solid #C4CDD8`, color: TD,
                  fontFamily: font, background: "white", borderRadius: 6, cursor: "pointer",
                }}>
                {assignOptions.length === 0 ? (
                  <option value="">No teammates available</option>
                ) : (
                  assignOptions.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name === myName ? `${p.name} (you)` : p.name} · {p.title}
                    </option>
                  ))
                )}
              </select>
              {taskType === "refer" && (
                <p style={{ fontSize: "0.66rem", color: TT, marginTop: 5, lineHeight: 1.4 }}>
                  You're hidden from this list while referring.
                </p>
              )}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label style={{ fontSize: "0.65rem", fontWeight: 700, color: TT, textTransform: "uppercase", letterSpacing: "0.09em", display: "block", marginBottom: 6 }}>Tags</label>

            <div className="flex flex-wrap items-center gap-1.5 px-3 py-2 mb-2"
              style={{ border: `1px solid #C4CDD8`, background: "white", minHeight: 40, cursor: "text", borderRadius: 6 }}
              onClick={() => tagInputRef.current?.focus()}>
              {tags.map(tag => {
                const tc = TASK_TAG_COLORS[tag] ?? TASK_TAG_FALLBACK;
                return (
                  <span key={tag} className="flex items-center gap-1 px-2 py-0.5"
                    style={{ fontSize: "0.68rem", fontWeight: 700, background: tc.bg, color: tc.text, border: `1px solid ${tc.border}`, borderRadius: 4 }}>
                    {tag}
                    <button onClick={() => removeTag(tag)}
                      style={{ color: tc.text, display: "flex", alignItems: "center", border: "none", background: "transparent", cursor: "pointer", padding: 0 }}>
                      <X size={9} />
                    </button>
                  </span>
                );
              })}
              <input
                ref={tagInputRef}
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addTag(tagInput); } }}
                placeholder={tags.length === 0 ? "Add tag and press Enter" : ""}
                className="outline-none flex-1 min-w-[120px] bg-transparent"
                style={{ fontSize: "0.82rem", color: TD, fontFamily: font }}
              />
            </div>

            <div className="flex flex-wrap gap-1.5">
              {TASK_QUICK_TAGS.filter(t => !tags.includes(t)).map(tag => (
                <button key={tag} onClick={() => addTag(tag)}
                  className="flex items-center gap-1 px-2.5 py-1 hover:brightness-95 transition-all"
                  style={{ fontSize: "0.70rem", fontWeight: 600, background: "#F4F6FA", color: TM, border: `1px solid #C4CDD8`, borderRadius: 6, cursor: "pointer" }}>
                  <Plus size={9} />
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4"
          style={{ borderTop: `1px solid ${BDL}`, background: "#F4F6FA" }}>
          <p style={{ fontSize: "0.72rem", color: TT }}>
            Tasks are visible to your team and added to the account audit trail.
          </p>
          <div className="flex items-center gap-2">
            <button onClick={onClose}
              className="px-4 py-2 hover:brightness-97 transition-all"
              style={{ fontSize: "0.80rem", fontWeight: 600, color: TM, background: "white", border: `1px solid #C4CDD8`, borderRadius: 6, cursor: "pointer", fontFamily: font }}>
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!task.trim()}
              className="flex items-center gap-1.5 px-4 py-2 transition-all hover:brightness-95 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: N, color: "white", fontSize: "0.80rem", fontWeight: 700, borderRadius: 6, border: "none", cursor: task.trim() ? "pointer" : "not-allowed", fontFamily: font }}>
              <Plus size={13} /> Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═════════════════════════════════════════════════════════════════════════ */
/*  APPROVE MODAL — write a note + approve the finding                       */
/*  The submitted note is pushed to the Notes tab via the workspace context. */
/* ═════════════════════════════════════════════════════════════════════════ */
function ApproveModal({
  reviewTitle, onClose, onSubmit,
}: {
  reviewTitle: string;
  onClose: () => void;
  onSubmit: (note: string) => void;
}) {
  const [note, setNote] = useState("");

  // ESC closes the modal.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const canSubmit = note.trim().length > 0;
  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit(note);
  };

  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  const today = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  return (
    <div
      onClick={handleBackdrop}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        background: "rgba(15, 25, 40, 0.55)",
        animation: "revFadeUp 0.2s ease both",
        fontFamily: font,
      }}>
      <div className="w-full mx-4"
        style={{
          maxWidth: 560,
          background: "white",
          border: `1px solid #C4CDD8`,
          borderRadius: 10,
          boxShadow: "0 20px 60px rgba(0,0,0,0.20)",
          animation: "revPopIn 0.22s cubic-bezier(0.22, 1, 0.36, 1) both",
          overflow: "hidden",
        }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: `1px solid ${BDL}` }}>
          <div className="flex items-center gap-3 min-w-0">
            <span style={{
              width: 30, height: 30, borderRadius: 7,
              background: `${OK}15`, color: OK,
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <ThumbsUp size={15}/>
            </span>
            <h2 style={{ fontSize: "1.05rem", fontWeight: 800, color: TD, whiteSpace: "nowrap" }}>Approve finding</h2>
            <span style={{ fontSize: "0.78rem", color: TT, whiteSpace: "nowrap" }}>· {today}</span>
            <span style={{
              fontSize: "0.6rem", fontWeight: 800, color: OK,
              background: `${OK}15`, border: `1px solid ${OK}40`,
              padding: "2px 8px", borderRadius: 999,
              textTransform: "uppercase", letterSpacing: "0.06em",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              maxWidth: 240,
            }}>
              {reviewTitle}
            </span>
          </div>
          <button onClick={onClose}
            className="flex items-center justify-center hover:bg-slate-100 transition-colors"
            style={{ width: 28, height: 28, color: TT, borderRadius: 6, border: "none", background: "transparent", cursor: "pointer" }}>
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <label style={{
            fontSize: "0.65rem", fontWeight: 700, color: TT,
            textTransform: "uppercase", letterSpacing: "0.09em",
            display: "block", marginBottom: 6,
          }}>
            Approval note
          </label>
          <textarea
            autoFocus
            value={note}
            onChange={e => setNote(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder="Why are you approving this finding? Add any rationale or follow-ups…"
            rows={5}
            className="w-full outline-none resize-y px-3 py-3"
            style={{
              fontSize: "0.84rem", border: `1px solid #C4CDD8`, color: TD,
              fontFamily: font, background: "white", boxSizing: "border-box", borderRadius: 6,
            }}
          />
          <p style={{ fontSize: "0.68rem", color: TT, marginTop: 8, lineHeight: 1.45 }}>
            This note is saved to the <strong style={{ color: TM }}>Notes</strong> tab and tagged
            with <strong style={{ color: TM }}>"Approval"</strong> so the rest of the team can see the rationale.
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4"
          style={{ borderTop: `1px solid ${BDL}`, background: "#F4F6FA" }}>
          <button onClick={onClose}
            className="px-4 py-2 hover:brightness-97 transition-all"
            style={{
              fontSize: "0.80rem", fontWeight: 600, color: TM,
              background: "white", border: `1px solid #C4CDD8`, borderRadius: 6,
              cursor: "pointer", fontFamily: font,
            }}>
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="flex items-center gap-1.5 px-4 py-2 transition-all hover:brightness-95 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: OK, color: "white",
              fontSize: "0.80rem", fontWeight: 700, borderRadius: 6, border: "none",
              cursor: canSubmit ? "pointer" : "not-allowed", fontFamily: font,
            }}>
            <ThumbsUp size={13} /> Approve
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Keyframes & shared CSS ──────────────────────────────────────────────── */
function ReviewStyles() {
  return (
    <style>{`
      @keyframes revFadeUp {
        from { opacity: 0; transform: translateY(8px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      @keyframes revPopIn {
        from { opacity: 0; transform: scale(0.85); }
        to   { opacity: 1; transform: scale(1); }
      }
      @keyframes revStripe {
        0%   { background-position: 0%   0%; }
        100% { background-position: 200% 0%; }
      }
      .rev-fade-up {
        animation: revFadeUp 0.45s cubic-bezier(0.22, 1, 0.36, 1) both;
      }
    `}</style>
  );
}
