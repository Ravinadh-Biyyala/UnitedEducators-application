import { useMemo, useRef, useState } from "react";
import {
  Sparkles, Zap, Compass, ClipboardCheck, FileText, Mail,
  TrendingUp, Target, Search, CheckCircle2, Clock, AlertCircle,
  ArrowRight, Copy, Send, Layers, Calendar, Bell, ExternalLink,
} from "lucide-react";
import {
  useSubmissionWorkspaceOptional,
  type PendingRatingOption,
} from "../context/SubmissionWorkspaceContext";

const N    = "#0123D4";
const G    = "#C9A227";
const NAVY = "#0A1828";
const BDL  = "#DCE3EC";
const TD   = "#1A2530";
const TM   = "#4A5D6E";
const TT   = "#7A8FA3";
const OK   = "#15803D";
const WARN = "#B45309";
const BAD  = "#B91C1C";
const font = "'Source Sans 3', system-ui, sans-serif";

// ─── Domain types ─────────────────────────────────────────────────────────────
type TabId =
  | "overview" | "rating" | "documents" | "correspondence"
  | "notes" | "tasks" | "approvals" | "audit"
  | "member" | "risk" | "loss";

interface Suggestion {
  id: string;
  icon: React.ReactNode;
  label: string;
  description?: string;
  responseKey: string;
}

const TAB_LABELS: Record<TabId, string> = {
  overview:       "Overview",
  rating:         "Rating",
  documents:      "Documents",
  correspondence: "Correspondence",
  notes:          "Notes",
  tasks:          "Tasks",
  approvals:      "Approvals",
  audit:          "Audit Trail",
  member:         "Member & Broker",
  risk:           "Risk & Exposure",
  loss:           "Loss History",
};

// ─── Suggestion-pack registry ─────────────────────────────────────────────────
const SUGGESTIONS: Partial<Record<TabId, Suggestion[]>> = {
  rating: [
    { id: "rate-5opts",  icon: <Sparkles size={11}/>,     label: "Generate 5 rating options", responseKey: "rate-5opts",
      description: "Produces 5 candidate option cards with limits, retention, premium, endorsements, and a one-click apply." },
    { id: "rate-compare", icon: <TrendingUp size={11}/>,   label: "Compare to last year",      responseKey: "rate-compare" },
    { id: "rate-why",    icon: <Compass size={11}/>,      label: "Explain recommendation",    responseKey: "rate-why" },
    { id: "rate-appetite", icon: <Target size={11}/>,     label: "Run appetite check",        responseKey: "rate-appetite" },
  ],
  documents: [
    { id: "doc-review",  icon: <ClipboardCheck size={11}/>, label: "Review documents",        responseKey: "doc-review" },
    { id: "doc-email",   icon: <Mail size={11}/>,           label: "Draft missing-docs email", responseKey: "doc-email",
      description: "Generates a broker-ready email listing the missing required documents. Copy or send via Correspondence." },
    { id: "doc-summary", icon: <FileText size={11}/>,       label: "Summarize this folder",    responseKey: "doc-summary" },
    { id: "doc-stale",   icon: <Clock size={11}/>,          label: "Flag stale documents",     responseKey: "doc-stale" },
  ],
  overview: [
    { id: "ov-summary",  icon: <FileText size={11}/>,       label: "Summarize this submission", responseKey: "ov-summary" },
    { id: "ov-blockers", icon: <AlertCircle size={11}/>,    label: "What's blocking the quote?", responseKey: "ov-blockers" },
    { id: "ov-similar",  icon: <Search size={11}/>,         label: "Compare to similar accounts", responseKey: "ov-similar" },
  ],
  notes: [
    { id: "notes-byauthor", icon: <Layers size={11}/>,      label: "Summarize notes by author", responseKey: "notes-byauthor" },
    { id: "notes-actions",  icon: <CheckCircle2 size={11}/>,label: "Extract action items",      responseKey: "notes-actions" },
  ],
  tasks: [
    { id: "tasks-overdue", icon: <AlertCircle size={11}/>,  label: "What's overdue?",          responseKey: "tasks-overdue" },
    { id: "tasks-prio",   icon: <Target size={11}/>,        label: "Suggest task priorities",  responseKey: "tasks-prio" },
  ],
  correspondence: [
    { id: "corr-summary", icon: <FileText size={11}/>,      label: "Summarize this thread",   responseKey: "corr-summary" },
    { id: "corr-reply",   icon: <Send size={11}/>,          label: "Draft a reply",            responseKey: "corr-reply" },
    { id: "corr-find",    icon: <Search size={11}/>,        label: "Find emails about…",       responseKey: "corr-find" },
  ],
};

// ─── Structured response payloads (rendered as custom components) ─────────────
interface RateOptionCard {
  letter: string;
  limit: string;
  aggregate: string;
  retention: string;
  premium: number;
  changePct: number;
  endorsements: string[];
  schedules: string[];
  memberBenefits: string[];
  notifyOn: string[];
  rationale: string;
}

const SAMPLE_PRODUCT_ID = "gl";
const SAMPLE_PRODUCT_NAME = "Primary General Liability";

function buildRateOptions(): RateOptionCard[] {
  return [
    { letter: "A", limit: "$1,000,000", aggregate: "$3,000,000", retention: "$25,000",  premium: 28400, changePct: 0,
      endorsements: ["Premises & Operations", "Sexual Abuse & Molestation"],
      schedules: ["All Brookfield campus buildings", "Athletic facilities"],
      memberBenefits: ["Loss Control Visit", "Risk Mgmt Resources"],
      notifyOn: ["uw","us","broker"],
      rationale: "Matches expiring program with no structural changes." },
    { letter: "B", limit: "$1,000,000", aggregate: "$2,000,000", retention: "$50,000",  premium: 24200, changePct: -7.0,
      endorsements: ["Premises & Operations", "Liquor Liability Extension"],
      schedules: ["All Brookfield campus buildings"],
      memberBenefits: ["Loss Control Visit"],
      notifyOn: ["uw","broker"],
      rationale: "Higher SIR and reduced aggregate trades premium for retention." },
    { letter: "C", limit: "$2,000,000", aggregate: "$5,000,000", retention: "$25,000",  premium: 32100, changePct: 8.8,
      endorsements: ["Premises & Operations", "Sexual Abuse & Molestation", "Volunteer Liability"],
      schedules: ["All Brookfield campus buildings", "Athletic facilities", "Off-campus trips"],
      memberBenefits: ["Loss Control Visit", "Title IX Counsel Hotline", "Risk Mgmt Resources"],
      notifyOn: ["uw","us","broker","member"],
      rationale: "Enhanced limits with SAM and volunteer extensions for board comfort." },
    { letter: "D", limit: "$1,000,000", aggregate: "$3,000,000", retention: "$10,000",  premium: 31600, changePct: 7.2,
      endorsements: ["Premises & Operations", "Broad Form Contractual"],
      schedules: ["All Brookfield campus buildings"],
      memberBenefits: ["Loss Control Visit", "Risk Mgmt Resources"],
      notifyOn: ["uw","broker"],
      rationale: "Lower retention is broker-friendly; small premium uplift acceptable." },
    { letter: "E", limit: "$1,000,000", aggregate: "$3,000,000", retention: "$50,000",  premium: 26900, changePct: -5.2,
      endorsements: ["Premises & Operations"],
      schedules: ["All Brookfield campus buildings"],
      memberBenefits: ["Risk Mgmt Resources"],
      notifyOn: ["uw"],
      rationale: "Stripped-down baseline — useful as a 'walk-away' anchor option." },
  ];
}

interface DocReviewItem {
  name: string;
  status: "validated" | "flagged" | "missing";
  notes?: string;
}

interface MissingDocsEmail {
  to: string;
  subject: string;
  body: string;
  docs: string[];
}

// ─── Internal chat-message types ──────────────────────────────────────────────
type StructuredPayload =
  | { kind: "rate-options"; productName: string; options: RateOptionCard[] }
  | { kind: "doc-review"; folder: string; items: DocReviewItem[] }
  | { kind: "missing-docs-email"; email: MissingDocsEmail };

interface ChatMsg {
  id: string;
  role: "user" | "assistant";
  text?: string;
  payload?: StructuredPayload;
  ts: Date;
}

// ─── Response generators (deterministic mocks) ────────────────────────────────
function generateResponse(suggestion: Suggestion): { text?: string; payload?: StructuredPayload } {
  switch (suggestion.responseKey) {
    case "rate-5opts":
      return {
        text: "Here are 5 candidate rating options for " + SAMPLE_PRODUCT_NAME + ". Each one is calibrated against expiring + current loss ratio (58%). Tap any 'Use this option' to load it into the rating tab.",
        payload: { kind: "rate-options", productName: SAMPLE_PRODUCT_NAME, options: buildRateOptions() },
      };
    case "rate-compare":
      return {
        text: "vs. expiring policy (2025 — $26,400 written premium):\n\n• Total exposure ↑ 6.2% (enrollment +52, TIV +$1.8M)\n• Loss ratio 58% (slight ↑ from 54%) — driven by 1 ELL Title IX matter\n• Endorsement set unchanged\n\nIndication: +5.5% to +8% rate is in range. A flat hold is defensible given the long member tenure and stable book.",
      };
    case "rate-why":
      return {
        text: "Recommendation rationale — Option A (Standard terms):\n\n1. Loss ratio under target (58% < 65%)\n2. No new exposure changes outside normal growth\n3. SAM endorsement remains valuable given exposure profile\n4. 3-yr rate lock captures the account\n5. Broker has signaled board approval likely with flat renewal\n\nOption A balances retention with appropriate coverage.",
      };
    case "rate-appetite":
      return {
        text: "Appetite check — " + SAMPLE_PRODUCT_NAME + ":\n\n✓ Class code (Private K-12) — IN appetite\n✓ Enrollment 842 — IN range (target ≤2,500)\n✓ Loss ratio 58% — IN appetite (≤65%)\n✓ TIV $185M — IN range\n⚠ SAM exposure $5M sublimit — review with reinsurance for limits >$5M\n\nResult: This account is squarely in our underwriting appetite. Standard authority applies.",
      };
    case "doc-review":
      return {
        text: "Document review for the active folder:",
        payload: {
          kind: "doc-review",
          folder: "Active folder",
          items: [
            { name: "ACORD 125 Application 2024.pdf",      status: "validated" },
            { name: "Audited Financial Statement FY23.pdf", status: "validated" },
            { name: "5-Year Certified Loss Runs.xlsx",      status: "flagged", notes: "FY19 row appears truncated — confirm with broker." },
            { name: "EEO Policy Statement.pdf",             status: "missing" },
            { name: "Property Schedule & Valuations.xlsx",  status: "missing" },
          ],
        },
      };
    case "doc-email":
      return {
        text: "Drafted a broker-ready email for the missing required documents:",
        payload: {
          kind: "missing-docs-email",
          email: {
            to: "t.owens@gallaghered.com",
            subject: "Missing documents — Brookfield Day School submission",
            body:
`Hi Tom,

To finalize the renewal for Brookfield Day School we still need the following items. Could you please send these by end of day Wednesday so we can hold the original quote timeline?

  1. EEO Policy Statement (EPL)
  2. Sexual Misconduct Policy (ELL)
  3. Property Schedule & Valuations (GL)

If any of these are already on file with a prior carrier and not currently available, let me know and we can discuss alternatives.

Thanks,
Maya Khanna
Sr. Underwriter · Northeast
United Educators`,
            docs: ["EEO Policy Statement (EPL)", "Sexual Misconduct Policy (ELL)", "Property Schedule & Valuations (GL)"],
          },
        },
      };
    case "doc-summary":
      return {
        text: "Folder contents — 6 documents:\n\n• Application — ACORD 125 (validated), Faculty Roster (validated)\n• Financial — Audited FY23 (validated)\n• Loss — 5-Year Runs (flagged — possible row truncation)\n• Compliance — OFAC Screening (validated)\n• Member — Information Profile (in review)\n\n2 of 6 still need action. Coverage by category is complete except Loss (1 flagged) and Compliance (1 missing EEO statement at the product level).",
      };
    case "doc-stale":
      return {
        text: "Stale documents (last modified > 12 months ago):\n\n• EPL Application Supplement.pdf — Mar 2024 (just over 12mo as of today). Refresh recommended.\n• Title IX Coordinator Certification.pdf — Mar 2024. Member should confirm coordinator hasn't changed.\n\nNo other documents in this folder are stale.",
      };
    case "ov-summary":
      return {
        text: "Submission summary — Brookfield Day School (SUB-7829):\n\n• Private K-12 · 842 students · Westport, CT · member since 2014\n• 4 coverage lines: EPL, ELL, GL, Cyber · effective 6/1/2026\n• Expiring premium $132,400 → quoted $142,800 (+7.8%)\n• Loss ratio 58% over 6 years (target ≤65%) · 2 open claims\n• Broker: T. Owens / Gallagher Education · Need-by Apr 28 (7 days)\n• Documents 73% complete · 3 missing required",
      };
    case "ov-blockers":
      return {
        text: "Currently blocking the quote:\n\n1. 3 required documents missing (EEO Policy, Sexual Misconduct Policy, Property Schedule)\n2. Open ELL claim — Title IX investigation. Awaiting closing memo from Claims.\n3. 3-yr rate-lock authority referral — submitted Apr 18, pending UW Manager approval (likely cleared by EOD)",
      };
    case "ov-similar":
      return {
        text: "Comparable accounts in the book (Private K-12, 600–1,200 enrollment, NE region):\n\n• Greenwich Academy — 740 students · 51% LR · renewed flat 2024\n• Choate Rosemary Hall — 920 students · 47% LR · 3% rate decrease\n• Hopkins School — 720 students · 62% LR · flat renewal with SAM enhancement\n\nBrookfield's loss ratio is mid-pack; pricing in line with cohort.",
      };
    case "notes-byauthor":
      return { text: "Notes by author:\n\n• Maya Khanna (3) — initial review, rate strategy, authority-referral plan\n• Devon Carter (2) — risk discussion, ELL Title IX context\n• Priya Singh (1) — claims status note linked to ELL matter" };
    case "notes-actions":
      return { text: "Action items extracted from notes:\n\n☐ Confirm SAM sublimit at $5M with reinsurance (Maya, by Apr 22)\n☐ Pull Title IX closing memo from Claims (Maya, by Apr 24)\n☐ Send quote letter to broker (Maya, by Apr 24 EOD)\n☐ Schedule loss control visit Q3 (Devon, by Sep)" };
    case "tasks-overdue":
      return { text: "Currently overdue tasks (3):\n\n• Confirm SAM sublimit with reinsurance — 2 days late\n• Pull Title IX closing memo — 1 day late\n• Update lifecycle stage to 'Quoted' — 1 day late\n\nRecommend tackling SAM confirmation first (blocks quote letter)." };
    case "tasks-prio":
      return { text: "Suggested priority order:\n\n1. SAM sublimit confirmation (BLOCKS quote)\n2. Send quote letter (BROKER WAITING)\n3. Title IX closing memo (does not block quote)\n4. Lifecycle stage update (housekeeping)\n5. Q3 loss control visit (scheduling)" };
    case "corr-summary":
      return { text: "Thread summary:\n\nQuote-clarification exchange with broker T. Owens. Two-step negotiation: broker asked for 12% decrease + SIR clarification; you offered a flat renewal with SAM at $5M sublimit and a 3-yr lock option. Broker accepted on Apr 18 — board meeting Thursday, quote letter needed Wednesday EOD." };
    case "corr-reply":
      return { text: "Draft reply:\n\n\"Tom — confirmed. I'll have the formal quote letter to you by EOD Wednesday with the flat renewal, $5M SAM endorsement, and 3-yr rate-lock option attached. Let me know if the board needs any additional materials for the Thursday meeting.\n\nMaya\"" };
    case "corr-find":
      return { text: "Top matches for emails (search broader subject + body):\n\n1. \"Quote clarification — Primary GL terms\" (3 messages, 1 unread)\n2. \"Renewal application package\" (1 message, 3 attachments)\n3. \"Missing documents\" (1 outbound message)\n\nUse the search box on the Correspondence tab for narrower queries." };
    default:
      return { text: "I don't have a specific response for that yet. Try the suggestions or ask a free-text question." };
  }
}

// ═════════════════════════════════════════════════════════════════════════════
//   TabAwareSuggestions
// ═════════════════════════════════════════════════════════════════════════════
export function TabAwareSuggestions() {
  const workspace = useSubmissionWorkspaceOptional();
  const activeTab = (workspace?.activeTab ?? "overview") as TabId;
  const suggestions = SUGGESTIONS[activeTab];

  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [pendingResponseFor, setPendingResponseFor] = useState<string | null>(null);
  const respondTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Toast for "Copied" feedback inside this panel
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = (msg: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(msg);
    toastTimer.current = setTimeout(() => setToast(null), 1800);
  };

  // Clear in-panel conversation when the tab changes (each tab has its own context)
  const lastTabRef = useRef<TabId>(activeTab);
  if (lastTabRef.current !== activeTab) {
    lastTabRef.current = activeTab;
    if (messages.length > 0) setMessages([]);
    if (respondTimer.current) clearTimeout(respondTimer.current);
    setPendingResponseFor(null);
  }

  const handleSuggestionClick = (s: Suggestion) => {
    if (pendingResponseFor) return; // already responding
    const userMsgId = `u_${Date.now()}`;
    setMessages(prev => [
      ...prev,
      { id: userMsgId, role: "user", text: s.label, ts: new Date() },
    ]);
    setPendingResponseFor(userMsgId);
    if (respondTimer.current) clearTimeout(respondTimer.current);
    respondTimer.current = setTimeout(() => {
      const { text, payload } = generateResponse(s);
      setMessages(prev => [
        ...prev,
        { id: `a_${Date.now()}`, role: "assistant", text, payload, ts: new Date() },
      ]);
      setPendingResponseFor(null);
    }, 450 + Math.random() * 200);
  };

  // Don't render if there is no workspace context (i.e. not in a submission)
  if (!workspace) return null;
  if (!suggestions || suggestions.length === 0) return null;

  const ctxLabel = TAB_LABELS[activeTab] ?? activeTab;

  return (
    <div style={{ padding: "12px 12px 4px", borderBottom: `1px solid ${BDL}`, background: "white", fontFamily: font }}>

      {/* "Helping with" label */}
      <div className="inline-flex items-center gap-1.5 mb-2.5" style={{
        background: `${G}18`, border: `1px solid ${G}55`, color: "#7A4800",
        padding: "3px 9px", borderRadius: 999,
        fontSize: "0.6rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em",
      }}>
        <Sparkles size={10}/>
        Helping with: {ctxLabel}
        {activeTab === "rating" && <span style={{ opacity: 0.7 }}>· {SAMPLE_PRODUCT_NAME}</span>}
      </div>

      {/* Suggestion buttons (2-col grid) */}
      <div className="grid grid-cols-2 gap-1.5">
        {suggestions.map(s => (
          <button
            key={s.id}
            onClick={() => handleSuggestionClick(s)}
            title={s.description ?? s.label}
            disabled={!!pendingResponseFor}
            className="flex items-center gap-1.5 px-2.5 py-2 text-left transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            onMouseEnter={(e) => { if (!pendingResponseFor) e.currentTarget.style.background = `${N}08`; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "white"; }}
            style={{
              border: `1px solid ${BDL}`,
              borderRadius: 6,
              background: "white",
              cursor: pendingResponseFor ? "wait" : "pointer",
              fontSize: "0.68rem", fontWeight: 700, color: TD,
              fontFamily: font,
            }}>
            <span style={{ color: N, display: "inline-flex", flexShrink: 0 }}>{s.icon}</span>
            <span className="truncate" style={{ lineHeight: 1.2 }}>{s.label}</span>
          </button>
        ))}
      </div>

      {/* In-panel conversation thread */}
      {messages.length > 0 && (
        <div className="mt-3 space-y-2" style={{ background: "#F7F8FB", padding: "8px", borderRadius: 8 }}>
          {messages.map(m => (
            <ChatMsgRow key={m.id} msg={m} workspace={workspace} showToast={showToast}/>
          ))}
          {pendingResponseFor && <TypingDots/>}
        </div>
      )}

      {/* Inline toast inside the panel */}
      {toast && (
        <div className="mt-2 inline-flex items-center gap-1 px-2.5 py-1"
          style={{
            background: "#E8F5EC", border: `1px solid #86EFAC`, borderRadius: 4,
            fontSize: "0.66rem", fontWeight: 700, color: OK,
          }}>
          <CheckCircle2 size={11}/> {toast}
        </div>
      )}
    </div>
  );
}

// ─── Chat message row (text + structured payload) ─────────────────────────────
function ChatMsgRow({ msg, workspace, showToast }: {
  msg: ChatMsg;
  workspace: NonNullable<ReturnType<typeof useSubmissionWorkspaceOptional>>;
  showToast: (m: string) => void;
}) {
  if (msg.role === "user") {
    return (
      <div className="flex justify-end">
        <div style={{
          background: N, color: "white",
          fontSize: "0.7rem", fontWeight: 600,
          padding: "6px 10px", borderRadius: 10,
          maxWidth: "85%", lineHeight: 1.45,
        }}>
          {msg.text}
        </div>
      </div>
    );
  }

  return (
    <div>
      {msg.text && (
        <div style={{
          background: "white", color: TD,
          fontSize: "0.7rem",
          padding: "8px 10px", borderRadius: 10,
          border: `1px solid ${BDL}`,
          lineHeight: 1.55, whiteSpace: "pre-wrap",
        }}>
          {msg.text}
        </div>
      )}
      {msg.payload?.kind === "rate-options" && (
        <RateOptionsCards payload={msg.payload} workspace={workspace} showToast={showToast}/>
      )}
      {msg.payload?.kind === "doc-review" && (
        <DocReviewChecklist payload={msg.payload}/>
      )}
      {msg.payload?.kind === "missing-docs-email" && (
        <MissingDocsEmailCard payload={msg.payload} workspace={workspace} showToast={showToast}/>
      )}
    </div>
  );
}

// ─── 5 rating options cards ───────────────────────────────────────────────────
function RateOptionsCards({ payload, workspace, showToast }: {
  payload: Extract<StructuredPayload, { kind: "rate-options" }>;
  workspace: NonNullable<ReturnType<typeof useSubmissionWorkspaceOptional>>;
  showToast: (m: string) => void;
}) {
  return (
    <div className="space-y-2 mt-2">
      {payload.options.map(o => {
        const changeUp = o.changePct >= 0;
        return (
          <div key={o.letter}
            style={{
              background: "white",
              border: `1px solid ${BDL}`,
              borderRadius: 8,
              padding: "10px 12px",
              position: "relative",
              overflow: "hidden",
            }}>
            <span aria-hidden style={{
              position: "absolute", inset: "0 0 auto 0", height: 3,
              background: `linear-gradient(90deg, ${N}, ${N}66)`,
            }}/>
            <div className="flex items-center justify-between mb-2" style={{ marginTop: 2 }}>
              <div className="flex items-center gap-1.5">
                <span style={{
                  width: 22, height: 22, borderRadius: 6,
                  background: `${N}12`, color: N,
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.74rem", fontWeight: 800,
                }}>
                  {o.letter}
                </span>
                <span style={{ fontSize: "0.74rem", fontWeight: 800, color: TD }}>
                  Option {o.letter}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span style={{ fontSize: "0.78rem", fontWeight: 800, color: N, fontVariantNumeric: "tabular-nums" }}>
                  ${o.premium.toLocaleString()}
                </span>
                <span style={{
                  fontSize: "0.6rem", fontWeight: 700,
                  color: changeUp ? WARN : OK,
                }}>
                  {changeUp ? "+" : ""}{o.changePct.toFixed(1)}%
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-1.5 mb-2">
              {[["Limit", o.limit], ["Aggregate", o.aggregate], ["Retention", o.retention]].map(([lbl, val]) => (
                <div key={lbl}>
                  <div style={{ fontSize: "0.52rem", fontWeight: 700, color: TT, textTransform: "uppercase", letterSpacing: "0.08em" }}>{lbl}</div>
                  <div className="truncate" style={{ fontSize: "0.7rem", fontWeight: 700, color: TD }}>{val}</div>
                </div>
              ))}
            </div>

            <p style={{ fontSize: "0.66rem", color: TM, lineHeight: 1.4, marginBottom: 6 }}>
              {o.rationale}
            </p>

            {/* Quick chips */}
            <div className="flex flex-wrap gap-1 mb-2">
              {o.endorsements.slice(0, 3).map((e, i) => (
                <span key={i} style={{
                  fontSize: "0.56rem", fontWeight: 700,
                  background: "#F1F5F9", color: TM,
                  padding: "1px 6px", borderRadius: 3,
                }}>{e}</span>
              ))}
              {o.endorsements.length > 3 && (
                <span style={{ fontSize: "0.56rem", color: TT, fontWeight: 700 }}>
                  +{o.endorsements.length - 3} more
                </span>
              )}
            </div>

            <button
              onClick={() => {
                const pending: PendingRatingOption = {
                  productId: SAMPLE_PRODUCT_ID,
                  optionName: `Option ${o.letter} — Companion`,
                  limit: o.limit,
                  aggregate: o.aggregate,
                  retention: o.retention,
                  premium: o.premium,
                  endorsements: o.endorsements,
                  rationale: o.rationale,
                };
                workspace.setPendingRatingOption(pending);
                workspace.requestTabChange("rating");
                showToast(`Loaded Option ${o.letter} into Rating`);
              }}
              className="w-full flex items-center justify-center gap-1 transition-all active:scale-95"
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 4px 14px rgba(1,35,212,0.30)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 2px 6px rgba(1,35,212,0.20)"; }}
              style={{
                background: N, color: "white", borderRadius: 5,
                fontSize: "0.66rem", fontWeight: 700, border: "none", cursor: "pointer",
                padding: "5px 10px",
                boxShadow: "0 2px 6px rgba(1,35,212,0.20)",
                fontFamily: font,
              }}>
              <ArrowRight size={11}/> Use this option
            </button>
          </div>
        );
      })}
    </div>
  );
}

// ─── Document review checklist ────────────────────────────────────────────────
function DocReviewChecklist({ payload }: { payload: Extract<StructuredPayload, { kind: "doc-review" }> }) {
  const meta = (s: DocReviewItem["status"]) => {
    if (s === "validated") return { color: OK,   bg: "#E8F5EC", icon: <CheckCircle2 size={11}/>, label: "Validated" };
    if (s === "flagged")   return { color: WARN, bg: "#FEF3C7", icon: <AlertCircle  size={11}/>, label: "Flagged"   };
    return                       { color: BAD,  bg: "#FEE2E2", icon: <AlertCircle  size={11}/>, label: "Missing"   };
  };
  return (
    <div className="mt-2 space-y-1.5">
      {payload.items.map((it, i) => {
        const m = meta(it.status);
        return (
          <div key={i}
            style={{
              background: "white",
              border: `1px solid ${BDL}`,
              borderLeft: `3px solid ${m.color}`,
              borderRadius: 5,
              padding: "6px 9px",
            }}>
            <div className="flex items-center justify-between gap-2">
              <span className="truncate" style={{ fontSize: "0.7rem", fontWeight: 700, color: TD }}>
                {it.name}
              </span>
              <span className="inline-flex items-center gap-1 shrink-0"
                style={{
                  background: m.bg, color: m.color,
                  padding: "1px 6px", borderRadius: 3,
                  fontSize: "0.58rem", fontWeight: 700,
                }}>
                {m.icon}{m.label}
              </span>
            </div>
            {it.notes && (
              <div style={{ fontSize: "0.62rem", color: TM, marginTop: 2 }}>
                {it.notes}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Missing-docs email draft ─────────────────────────────────────────────────
function MissingDocsEmailCard({ payload, workspace, showToast }: {
  payload: Extract<StructuredPayload, { kind: "missing-docs-email" }>;
  workspace: NonNullable<ReturnType<typeof useSubmissionWorkspaceOptional>>;
  showToast: (m: string) => void;
}) {
  const e = payload.email;
  const handleCopy = async () => {
    const text = `To: ${e.to}\nSubject: ${e.subject}\n\n${e.body}`;
    try {
      await navigator.clipboard.writeText(text);
      showToast("Email copied to clipboard");
    } catch {
      showToast("Copy not available — select and copy manually");
    }
  };
  const handleOpenInCorrespondence = () => {
    workspace.setPendingComposerDraft({
      channel: "email",
      to: "T. Owens (Gallagher)",
      subject: e.subject,
      body: e.body,
    });
    workspace.requestTabChange("correspondence");
    showToast("Opened in Correspondence");
  };
  return (
    <div className="mt-2" style={{
      background: "white",
      border: `1px solid ${BDL}`,
      borderRadius: 8,
      overflow: "hidden",
    }}>
      <div className="flex items-center gap-2 px-3 py-2" style={{ background: "#FAFBFD", borderBottom: `1px solid ${BDL}` }}>
        <Mail size={11} color={N}/>
        <span style={{ fontSize: "0.62rem", fontWeight: 800, color: TD, textTransform: "uppercase", letterSpacing: "0.06em" }}>
          Drafted Email
        </span>
      </div>
      <div className="px-3 py-2.5 space-y-1.5">
        <div style={{ fontSize: "0.62rem", color: TT }}>
          <span style={{ fontWeight: 700 }}>To:</span> {e.to}
        </div>
        <div style={{ fontSize: "0.7rem", color: TD, fontWeight: 700 }}>
          {e.subject}
        </div>
        <div style={{
          fontSize: "0.7rem", color: TD, lineHeight: 1.55,
          whiteSpace: "pre-wrap",
          background: "#FAFBFD",
          padding: "8px 10px",
          borderRadius: 5,
          border: `1px solid ${BDL}`,
          maxHeight: 200, overflowY: "auto",
        }}>
          {e.body}
        </div>
      </div>
      <div className="flex items-center gap-1.5 px-3 py-2"
        style={{ borderTop: `1px solid ${BDL}`, background: "#FAFBFD" }}>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 px-2.5 py-1 transition-colors hover:bg-white"
          style={{
            border: `1px solid ${BDL}`, background: "white", color: TM,
            fontSize: "0.64rem", fontWeight: 700, borderRadius: 4,
            cursor: "pointer", fontFamily: font,
          }}>
          <Copy size={11}/> Copy
        </button>
        <button
          onClick={handleOpenInCorrespondence}
          className="flex items-center gap-1 px-2.5 py-1 transition-all active:scale-95"
          onMouseEnter={(ev) => { ev.currentTarget.style.boxShadow = "0 4px 14px rgba(1,35,212,0.30)"; }}
          onMouseLeave={(ev) => { ev.currentTarget.style.boxShadow = "0 2px 6px rgba(1,35,212,0.20)"; }}
          style={{
            background: N, color: "white", borderRadius: 4,
            fontSize: "0.64rem", fontWeight: 700, border: "none", cursor: "pointer",
            boxShadow: "0 2px 6px rgba(1,35,212,0.20)",
            fontFamily: font,
          }}>
          <ExternalLink size={11}/> Open in Correspondence
        </button>
      </div>
    </div>
  );
}

// ─── Typing indicator ─────────────────────────────────────────────────────────
function TypingDots() {
  return (
    <div className="flex items-center gap-1 px-2 py-1.5">
      {[0, 1, 2].map(i => (
        <span key={i} style={{
          width: 5, height: 5, borderRadius: "50%",
          background: TT, opacity: 0.5,
          animation: `typingDot 1.2s ease-in-out ${i * 0.15}s infinite`,
        }}/>
      ))}
    </div>
  );
}
