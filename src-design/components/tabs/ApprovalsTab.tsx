import { useState, useRef, useEffect } from "react";
import { Plus, X, ChevronDown, Check, Flag } from "lucide-react";

/* ── Design tokens ─────────────────────────────────────────────────────────── */
const N    = "#0123D4";
const BD   = "#C4CDD8";
const BDL  = "#DCE3EC";
const TH   = "#F0F3F8";
const TD   = "#1A2530";
const TM   = "#4A5D6E";
const TT   = "#7A8FA3";
const font = "'Source Sans 3', system-ui, sans-serif";

/* ── Types ─────────────────────────────────────────────────────────────────── */
type ApprovalStatus   = "Pending" | "Approved" | "Declined";
type ApprovalCategory = "Authority — line size" | "Coverage — referral" | "Pricing — rate change" | "Off-appetite" | "Subjectivity waiver" | "Capacity exception" | "Other";
type Urgency          = "High" | "Medium" | "Low";

interface Approval {
  id:          string;
  category:    ApprovalCategory;
  status:      ApprovalStatus;
  dueDate?:    string;
  title:       string;
  requestedBy: string;
  requestedOn: string;
  approver:    string;
  decisionDate?: string;
  note?:       string;
}

/* ── Seed data ─────────────────────────────────────────────────────────────── */
const SEED: Approval[] = [
  {
    id:          "AP-2241",
    category:    "Authority — line size",
    status:      "Pending",
    dueDate:     "Apr 22",
    title:       "CGL limit increase from $1M/$3M → $2M/$5M (Option CGL-5)",
    requestedBy: "Maya Khanna",
    requestedOn: "Apr 19",
    approver:    "Leo Tran (UW Manager)",
  },
  {
    id:          "AP-2237",
    category:    "Coverage — referral",
    status:      "Approved",
    title:       "Sexual & Physical Abuse cover w/ $50K SIR — required referral per playbook",
    requestedBy: "Maya Khanna",
    requestedOn: "Apr 18",
    approver:    "Leo Tran (UW Manager)",
    decisionDate:"Apr 19",
    note:        "Approved with prescribed premises endorsement",
  },
  {
    id:          "AP-2238",
    category:    "Pricing — rate change",
    status:      "Approved",
    title:       "+8% rate change on PL/GL package · Option CGL-2 (Recommended)",
    requestedBy: "Maya Khanna",
    requestedOn: "Apr 17",
    approver:    "Leo Tran (UW Manager)",
    decisionDate:"Apr 18",
    note:        "Within signing authority — informational only",
  },
  {
    id:          "AP-2218",
    category:    "Off-appetite",
    status:      "Declined",
    title:       "Option CGL-6 removes abuse cover — off-appetite per UW manual §4.2",
    requestedBy: "System (rule engine)",
    requestedOn: "Apr 17",
    approver:    "Leo Tran (UW Manager)",
    decisionDate:"Apr 17",
    note:        "Decline — abuse cover required for K-12 segment",
  },
];

/* ── Style helpers ─────────────────────────────────────────────────────────── */
const statusStyle = (s: ApprovalStatus) => {
  if (s === "Pending")  return { bg: "#FFF8E6", text: "#8A5C00", border: "#F0D88A", dot: "#C9A227" };
  if (s === "Approved") return { bg: "#E8F5EC", text: "#1A5C30", border: "#93C8A0", dot: "#2E7D32" };
  return                       { bg: "#FBEAEA", text: "#7A1F1F", border: "#E8A8A8", dot: "#B91C1C" };
};

const categoryStyle = () => ({ bg: "white", text: TM, border: BD });

const REASONS = [
  "Rate change > 10%",
  "Premium > line authority",
  "Appetite exception",
  "Subjectivity waiver",
  "Non-renewal",
  "Capacity exception",
  "Coverage exception",
  "Other",
] as const;
type Reason = typeof REASONS[number];

const AUTHORITY_RULE: Partial<Record<Reason, string>> = {
  "Rate change > 10%":       "Authority rule R-218",
  "Premium > line authority":"Authority rule R-104",
  "Appetite exception":      "Authority rule R-301",
  "Subjectivity waiver":     "Authority rule R-215",
  "Non-renewal":             "Authority rule R-412",
  "Capacity exception":      "Authority rule R-305",
  "Coverage exception":      "Authority rule R-208",
  "Other":                   "",
};

const APPROVERS = ["Leo Tran", "Sarah Mitchell", "James Owens", "Devon Carter", "Maya Khanna"];

/* ── Dropdown helper ───────────────────────────────────────────────────────── */
function SelectField<T extends string>({
  label, value, onChange, options, placeholder, hint, required,
}: {
  label: string; value: T | ""; onChange: (v: T) => void;
  options: readonly T[]; placeholder?: string; hint?: string; required?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label style={{ fontSize: "0.62rem", fontWeight: 700, color: TT, textTransform: "uppercase", letterSpacing: "0.09em" }}>
          {label}
        </label>
        {hint && <span style={{ fontSize: "0.68rem", color: N, fontWeight: 500 }}>{hint}</span>}
        {!required && !hint && <span style={{ fontSize: "0.68rem", color: TT }}>optional</span>}
      </div>
      <div ref={ref} className="relative">
        <button type="button" onClick={() => setOpen(v => !v)}
          className="w-full flex items-center justify-between px-3 py-2.5"
          style={{ border: `1px solid ${BD}`, background: "white", fontSize: "0.84rem", color: value ? TD : TT, fontFamily: font, textAlign: "left" }}>
          <span>{value || placeholder || "Select…"}</span>
          <ChevronDown size={14} color={TT} style={{ transform: open ? "rotate(180deg)" : "none", transition: "0.15s" }} />
        </button>
        {open && (
          <div className="absolute left-0 right-0 z-50 mt-0.5 overflow-y-auto"
            style={{ background: "white", border: `1px solid ${BD}`, boxShadow: "0 6px 24px rgba(0,0,0,0.13)", maxHeight: 220, zIndex: 9999 }}>
            {options.map(opt => (
              <button key={opt} type="button"
                onClick={() => { onChange(opt); setOpen(false); }}
                className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center gap-2"
                style={{ fontSize: "0.84rem", fontFamily: font, background: value === opt ? N : "white", color: value === opt ? "white" : TD }}>
                {value === opt && <Check size={12} />}
                {opt}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── New Approval Modal ────────────────────────────────────────────────────── */
function NewApprovalModal({ onClose, onSubmit }: {
  onClose: () => void;
  onSubmit: (a: Omit<Approval, "id">) => void;
}) {
  const [account,  setAccount]  = useState("Brookfield Day School");
  const [submission, setSub]    = useState("SUB-10428");
  const [reason,   setReason]   = useState<Reason | "">("");
  const [referTo,  setReferTo]  = useState<string>("");
  const [urgency,  setUrgency]  = useState<Urgency | "">("");
  const [needBy,   setNeedBy]   = useState("");
  const [context,  setContext]  = useState("");

  const rule = reason ? (AUTHORITY_RULE[reason] ?? "") : "";
  const canSubmit = account.trim() && reason && referTo && urgency;

  const handleSubmit = () => {
    if (!canSubmit) return;
    const categoryMap: Partial<Record<Reason, ApprovalCategory>> = {
      "Rate change > 10%":       "Pricing — rate change",
      "Premium > line authority":"Authority — line size",
      "Appetite exception":      "Off-appetite",
      "Subjectivity waiver":     "Subjectivity waiver",
      "Capacity exception":      "Capacity exception",
      "Coverage exception":      "Coverage — referral",
      "Other":                   "Other",
    };
    const now = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" });
    onSubmit({
      category:    categoryMap[reason as Reason] ?? "Other",
      status:      "Pending",
      dueDate:     needBy ? new Date(needBy).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : undefined,
      title:       `${reason} — ${account}`,
      requestedBy: "Maya Khanna",
      requestedOn: now,
      approver:    `${referTo} (UW Manager)`,
    });
    onClose();
  };

  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(15, 25, 40, 0.55)" }}>

      <div className="w-full mx-4" style={{ maxWidth: 660, background: "white", border: `1px solid ${BD}`, boxShadow: "0 20px 60px rgba(0,0,0,0.20)" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: `1px solid ${BDL}` }}>
          <h2 style={{ fontSize: "1.05rem", fontWeight: 800, color: TD }}>New approval</h2>
          <button onClick={onClose} className="flex items-center justify-center hover:bg-slate-100 transition-colors"
            style={{ width: 28, height: 28, color: TT }}>
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">

          {/* Account + Submission */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label style={{ fontSize: "0.62rem", fontWeight: 700, color: TT, textTransform: "uppercase", letterSpacing: "0.09em", display: "block", marginBottom: 6 }}>Account</label>
              <input value={account} onChange={e => setAccount(e.target.value)}
                className="w-full px-3 py-2.5 outline-none"
                style={{ fontSize: "0.84rem", border: `1px solid ${BD}`, color: TD, fontFamily: font }} />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label style={{ fontSize: "0.62rem", fontWeight: 700, color: TT, textTransform: "uppercase", letterSpacing: "0.09em" }}>Submission</label>
                <span style={{ fontSize: "0.68rem", color: TT }}>optional</span>
              </div>
              <input value={submission} onChange={e => setSub(e.target.value)}
                className="w-full px-3 py-2.5 outline-none"
                style={{ fontSize: "0.84rem", border: `1px solid ${BD}`, color: TD, fontFamily: font }} />
            </div>
          </div>

          {/* Reason for approval */}
          <SelectField<Reason>
            label="Reason for approval"
            value={reason}
            onChange={setReason}
            options={REASONS}
            placeholder="Select reason…"
            hint={rule || undefined}
            required
          />

          {/* Refer to + Urgency + Need by */}
          <div className="grid grid-cols-3 gap-4">
            <SelectField<string>
              label="Refer to"
              value={referTo}
              onChange={setReferTo}
              options={APPROVERS}
              placeholder="Select approver…"
              required
            />
            <SelectField<Urgency>
              label="Urgency"
              value={urgency}
              onChange={setUrgency}
              options={["High", "Medium", "Low"]}
              placeholder="Select…"
              required
            />
            <div>
              <label style={{ fontSize: "0.62rem", fontWeight: 700, color: TT, textTransform: "uppercase", letterSpacing: "0.09em", display: "block", marginBottom: 6 }}>Need by</label>
              <input type="date" value={needBy} onChange={e => setNeedBy(e.target.value)}
                className="w-full px-3 py-2.5 outline-none"
                style={{ fontSize: "0.84rem", border: `1px solid ${BD}`, color: needBy ? TD : TT, fontFamily: font }} />
            </div>
          </div>

          {/* Context for approver */}
          <div>
            <label style={{ fontSize: "0.62rem", fontWeight: 700, color: TT, textTransform: "uppercase", letterSpacing: "0.09em", display: "block", marginBottom: 6 }}>Context for approver</label>
            <textarea value={context} onChange={e => setContext(e.target.value)}
              placeholder="Why this is being referred, what's been considered, and what decision you need."
              rows={4} className="w-full outline-none resize-y px-3 py-2.5"
              style={{ fontSize: "0.84rem", border: `1px solid ${BD}`, color: TD, fontFamily: font, boxSizing: "border-box" }} />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderTop: `1px solid ${BDL}`, background: TH }}>
          <span style={{ fontSize: "0.75rem", color: N, fontWeight: 500 }}>
            {rule ? `Routed by ${rule.toLowerCase()}` : ""}
          </span>
          <div className="flex items-center gap-2.5">
            <button onClick={onClose} className="px-4 py-2 hover:brightness-97 transition-all"
              style={{ fontSize: "0.80rem", fontWeight: 600, color: TM, background: "white", border: `1px solid ${BD}` }}>
              Cancel
            </button>
            <button onClick={handleSubmit} disabled={!canSubmit}
              className="flex items-center gap-1.5 px-5 py-2 transition-all hover:brightness-95 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: N, color: "white", fontSize: "0.80rem", fontWeight: 700 }}>
              <Flag size={12} /> Send approval
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Approval Card ─────────────────────────────────────────────────────────── */
function ApprovalCard({ approval, onApprove, onDecline }: {
  approval:  Approval;
  onApprove: (id: string) => void;
  onDecline: (id: string) => void;
}) {
  const ss = statusStyle(approval.status);
  const cs = categoryStyle();
  const isPending = approval.status === "Pending";

  return (
    <div style={{ background: "white", border: `1px solid ${BD}`, borderTop: `3px solid ${isPending ? "#C9A227" : approval.status === "Approved" ? "#2E7D32" : "#B91C1C"}` }}>
      <div className="px-5 py-4 flex items-start gap-4">

        {/* Left: all content */}
        <div className="flex-1 min-w-0 space-y-2">

          {/* Row 1: ID · category · status · due date */}
          <div className="flex flex-wrap items-center gap-2">
            <span style={{ fontSize: "0.70rem", fontWeight: 700, color: TT, fontFamily: "monospace", letterSpacing: "0.03em" }}>
              {approval.id}
            </span>
            <span style={{ fontSize: "0.68rem", color: TT }}>·</span>
            <span style={{
              fontSize: "0.68rem", fontWeight: 600, color: cs.text,
              background: cs.bg, border: `1px solid ${cs.border}`,
              padding: "2px 8px",
            }}>
              {approval.category}
            </span>
            {/* Status badge */}
            <span style={{
              fontSize: "0.68rem", fontWeight: 700,
              background: ss.bg, color: ss.text, border: `1px solid ${ss.border}`,
              padding: "2px 8px", display: "inline-flex", alignItems: "center", gap: 5,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: ss.dot, display: "inline-block", flexShrink: 0 }} />
              {approval.status}
            </span>
            {/* Due date chip (Pending only) */}
            {isPending && approval.dueDate && (
              <span style={{ fontSize: "0.68rem", fontWeight: 600, color: "#B91C1C", background: "#FBEAEA", border: "1px solid #E8A8A8", padding: "2px 8px" }}>
                Due {approval.dueDate}
              </span>
            )}
          </div>

          {/* Row 2: Title */}
          <p style={{ fontSize: "1.00rem", fontWeight: 700, color: TD, lineHeight: 1.35 }}>
            {approval.title}
          </p>

          {/* Row 3: Meta */}
          <p style={{ fontSize: "0.75rem", color: TM }}>
            Requested by{" "}
            <span style={{ fontWeight: 700, color: TD }}>{approval.requestedBy}</span>
            {" "}on {approval.requestedOn}
            {" · "}Approver:{" "}
            <span style={{ fontWeight: 700, color: TD }}>{approval.approver}</span>
            {approval.decisionDate && (
              <>
                {" · "}
                <span style={{ fontWeight: 600, color: approval.status === "Approved" ? "#1A5C30" : "#7A1F1F" }}>
                  {approval.status} {approval.decisionDate}
                </span>
              </>
            )}
          </p>

          {/* Row 4: Note */}
          {approval.note && (
            <div style={{ background: "#F8FAFC", border: `1px solid ${BDL}`, padding: "8px 14px" }}>
              <p style={{ fontSize: "0.80rem", color: TM, fontStyle: "italic" }}>"{approval.note}"</p>
            </div>
          )}
        </div>

        {/* Right: Action buttons (Pending only) */}
        {isPending && (
          <div className="flex items-center gap-2 shrink-0 mt-1">
            <button onClick={() => onApprove(approval.id)}
              className="flex items-center gap-1.5 px-4 py-2 hover:brightness-95 transition-all"
              style={{ background: N, color: "white", fontSize: "0.78rem", fontWeight: 700, border: `1px solid ${N}` }}>
              <Check size={12} /> Approve
            </button>
            <button onClick={() => onDecline(approval.id)}
              className="flex items-center gap-1.5 px-4 py-2 hover:bg-slate-50 transition-all"
              style={{ background: "white", color: TM, fontSize: "0.78rem", fontWeight: 600, border: `1px solid ${BD}` }}>
              <X size={12} /> Decline
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Main component ────────────────────────────────────────────────────────── */
export function ApprovalsTab() {
  const [approvals,  setApprovals] = useState<Approval[]>(SEED);
  const [showModal,  setShowModal] = useState(false);
  const nextNum = useRef(2242);

  const pending  = approvals.filter(a => a.status === "Pending");
  const approved = approvals.filter(a => a.status === "Approved");
  const declined = approvals.filter(a => a.status === "Declined");

  // Sort: Pending first, then Approved, then Declined
  const sorted = [...pending, ...approved, ...declined];

  const handleApprove = (id: string) => {
    const now = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" });
    setApprovals(prev => prev.map(a =>
      a.id === id ? { ...a, status: "Approved", decisionDate: now, note: a.note ?? "Approved as submitted" } : a
    ));
  };

  const handleDecline = (id: string) => {
    const now = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" });
    setApprovals(prev => prev.map(a =>
      a.id === id ? { ...a, status: "Declined", decisionDate: now } : a
    ));
  };

  const handleAdd = (partial: Omit<Approval, "id">) => {
    setApprovals(prev => [{ ...partial, id: `AP-${nextNum.current++}` }, ...prev]);
  };

  return (
    <>
      <div className="space-y-4">

        {/* ── Toolbar ──────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between flex-wrap gap-3">

          {/* Summary pills */}
          <div className="flex items-center gap-2">
            {pending.length > 0 && (
              <span className="flex items-center gap-1.5 px-3 py-1.5"
                style={{ background: "#FFF8E6", border: "1px solid #F0D88A", fontSize: "0.75rem", fontWeight: 700, color: "#8A5C00" }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#C9A227", display: "inline-block" }} />
                {pending.length} pending
              </span>
            )}
            {approved.length > 0 && (
              <span className="flex items-center gap-1.5 px-3 py-1.5"
                style={{ background: "#E8F5EC", border: "1px solid #93C8A0", fontSize: "0.75rem", fontWeight: 700, color: "#1A5C30" }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#2E7D32", display: "inline-block" }} />
                {approved.length} approved
              </span>
            )}
            {declined.length > 0 && (
              <span className="flex items-center gap-1.5 px-3 py-1.5"
                style={{ background: "#FBEAEA", border: "1px solid #E8A8A8", fontSize: "0.75rem", fontWeight: 700, color: "#7A1F1F" }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#B91C1C", display: "inline-block" }} />
                {declined.length} declined
              </span>
            )}
            {approvals.length === 0 && (
              <span style={{ fontSize: "0.78rem", color: TT }}>No approvals yet for this submission.</span>
            )}
          </div>

          {/* Request approval button */}
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 hover:brightness-95 transition-all"
            style={{ background: N, color: "white", fontSize: "0.80rem", fontWeight: 700 }}>
            <Plus size={13} /> Request approval
          </button>
        </div>

        {/* ── Approval cards ────────────────────────────────────────────────── */}
        <div className="space-y-3">
          {sorted.map(approval => (
            <ApprovalCard
              key={approval.id}
              approval={approval}
              onApprove={handleApprove}
              onDecline={handleDecline}
            />
          ))}
        </div>
      </div>

      {showModal && (
        <NewApprovalModal onClose={() => setShowModal(false)} onSubmit={handleAdd} />
      )}
    </>
  );
}
