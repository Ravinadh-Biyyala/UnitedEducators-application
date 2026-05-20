import { useState, useRef, useEffect } from "react";
import { Plus, X, ChevronDown, Check, Flag } from "lucide-react";
import { useSubmissionWorkspaceOptional } from "../../context/SubmissionWorkspaceContext";

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

/* Author identity used when an approval is mirrored to the Notes tab. */
const APPROVER_AVATAR_COLOR: Record<string, string> = {
  "Leo Tran":        "#1A7A4A",
  "Sarah Mitchell":  "#7B2FBE",
  "James Owens":     "#B45309",
  "Devon Carter":    "#7B2FBE",
  "Maya Khanna":     N,
};

/* Clickable summary pill that doubles as a status filter on the Approvals list. */
function FilterPill({
  active, onClick, bg, border, text, dot, label,
}: {
  active: boolean;
  onClick: () => void;
  bg: string; border: string; text: string; dot: string;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="flex items-center gap-1.5 px-3 py-1.5 hover:brightness-97 transition-all"
      style={{
        background: bg,
        border: `1px solid ${border}`,
        fontSize: "0.75rem",
        fontWeight: 700,
        color: text,
        borderRadius: 6,
        cursor: "pointer",
        boxShadow: active ? `0 0 0 2px ${border}` : "none",
        outline: "none",
      }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: dot, display: "inline-block" }} />
      {label}
    </button>
  );
}

function authorFromApprover(approver: string): { name: string; initials: string; color: string } {
  // "Leo Tran (UW Manager)" → name "Leo Tran"
  const name = approver.split(/\s*\(/)[0].trim();
  const parts = name.split(/\s+/).filter(Boolean);
  const initials = parts.slice(0, 2).map(p => p[0]?.toUpperCase() ?? "").join("");
  return { name, initials, color: APPROVER_AVATAR_COLOR[name] ?? N };
}

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
          style={{ border: `1px solid ${BD}`, background: "white", fontSize: "0.84rem", color: value ? TD : TT, fontFamily: font, textAlign: "left", borderRadius: 6 }}>
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
                style={{ fontSize: "0.84rem", fontFamily: font, background: value === opt ? N : "white", color: value === opt ? "white" : TD, borderRadius: 6 }}>
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
  // Locked to current submission workspace context.
  const account    = "Brookfield Day School";
  const submission = "SUB-10428";
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

      <div className="w-full mx-4" style={{ maxWidth: 660, background: "white", border: `1px solid ${BD}`, boxShadow: "0 20px 60px rgba(0,0,0,0.20)", borderRadius: 10, overflow: "hidden" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: `1px solid ${BDL}` }}>
          <h2 style={{ fontSize: "1.05rem", fontWeight: 800, color: TD }}>New approval</h2>
          <button onClick={onClose} className="flex items-center justify-center hover:bg-slate-100 transition-colors"
            style={{ width: 28, height: 28, color: TT, borderRadius: 6 }}>
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">

          {/* Account + Submission — locked to current submission context */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label style={{ fontSize: "0.62rem", fontWeight: 700, color: TT, textTransform: "uppercase", letterSpacing: "0.09em", display: "block", marginBottom: 6 }}>Account</label>
              <input
                readOnly
                value={account}
                aria-readonly="true"
                tabIndex={-1}
                className="w-full px-3 py-2.5 outline-none cursor-not-allowed"
                style={{ fontSize: "0.84rem", border: `1px solid ${BD}`, borderRadius: 6, color: TM, fontFamily: font, background: TH }} />
            </div>
            <div>
              <label style={{ fontSize: "0.62rem", fontWeight: 700, color: TT, textTransform: "uppercase", letterSpacing: "0.09em", display: "block", marginBottom: 6 }}>Submission</label>
              <input
                readOnly
                value={submission}
                aria-readonly="true"
                tabIndex={-1}
                className="w-full px-3 py-2.5 outline-none cursor-not-allowed"
                style={{ fontSize: "0.84rem", border: `1px solid ${BD}`, borderRadius: 6, color: TM, fontFamily: font, background: TH }} />
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

          {/* Assign to + Urgency + Approve by */}
          <div className="grid grid-cols-3 gap-4">
            <SelectField<string>
              label="Assign to"
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
              <label style={{ fontSize: "0.62rem", fontWeight: 700, color: TT, textTransform: "uppercase", letterSpacing: "0.09em", display: "block", marginBottom: 6 }}>Approve by</label>
              <input type="date" value={needBy} onChange={e => setNeedBy(e.target.value)}
                className="w-full px-3 py-2.5 outline-none"
                style={{ fontSize: "0.84rem", border: `1px solid ${BD}`, borderRadius: 6, color: needBy ? TD : TT, fontFamily: font }} />
            </div>
          </div>

          {/* Note for Approver */}
          <div>
            <label style={{ fontSize: "0.62rem", fontWeight: 700, color: TT, textTransform: "uppercase", letterSpacing: "0.09em", display: "block", marginBottom: 6 }}>Note for Approver</label>
            <textarea value={context} onChange={e => setContext(e.target.value)}
              placeholder="Why this is being referred, what's been considered, and what decision you need."
              rows={4} className="w-full outline-none resize-y px-3 py-2.5"
              style={{ fontSize: "0.84rem", border: `1px solid ${BD}`, borderRadius: 6, color: TD, fontFamily: font, boxSizing: "border-box" }} />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderTop: `1px solid ${BDL}`, background: TH }}>
          <span style={{ fontSize: "0.75rem", color: N, fontWeight: 500 }}>
            {rule ? `Routed by ${rule.toLowerCase()}` : ""}
          </span>
          <div className="flex items-center gap-2.5">
            <button onClick={onClose} className="px-4 py-2 hover:brightness-97 transition-all"
              style={{ fontSize: "0.80rem", fontWeight: 600, color: TM, background: "white", border: `1px solid ${BD}`, borderRadius: 6 }}>
              Cancel
            </button>
            <button onClick={handleSubmit} disabled={!canSubmit}
              className="flex items-center gap-1.5 px-5 py-2 transition-all hover:brightness-95 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: N, color: "white", fontSize: "0.80rem", fontWeight: 700, borderRadius: 6 }}>
              <Flag size={12} /> Send approval
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Approval Card ─────────────────────────────────────────────────────────── */
function ApprovalCard({ approval, onAction }: {
  approval: Approval;
  onAction: (id: string) => void;
}) {
  const ss = statusStyle(approval.status);
  const cs = categoryStyle();
  const isPending = approval.status === "Pending";

  return (
    <div style={{
      background: "white",
      border: `1px solid ${BDL}`,
      borderTop: `3px solid ${isPending ? "#C9A227" : approval.status === "Approved" ? "#2E7D32" : "#B91C1C"}`,
      borderRadius: 8,
      overflow: "hidden",
      boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
    }}>
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
              padding: "2px 8px", borderRadius: 4,
            }}>
              {approval.category}
            </span>
            {/* Status badge */}
            <span style={{
              fontSize: "0.68rem", fontWeight: 700,
              background: ss.bg, color: ss.text, border: `1px solid ${ss.border}`,
              padding: "2px 8px", borderRadius: 4,
              display: "inline-flex", alignItems: "center", gap: 5,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: ss.dot, display: "inline-block", flexShrink: 0 }} />
              {approval.status}
            </span>
            {/* Due date chip (Pending only) */}
            {isPending && approval.dueDate && (
              <span style={{ fontSize: "0.68rem", fontWeight: 600, color: "#B91C1C", background: "#FBEAEA", border: "1px solid #E8A8A8", padding: "2px 8px", borderRadius: 4 }}>
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
            <div style={{ background: "#F8FAFC", border: `1px solid ${BDL}`, padding: "8px 14px", borderRadius: 6 }}>
              <p style={{ fontSize: "0.80rem", color: TM, fontStyle: "italic" }}>"{approval.note}"</p>
            </div>
          )}
        </div>

        {/* Right: Action button (Pending only) — opens modal to choose Approve or Decline */}
        {isPending && (
          <div className="flex items-center gap-2 shrink-0 mt-1">
            <button onClick={() => onAction(approval.id)}
              className="flex items-center gap-1.5 px-4 py-2 hover:brightness-95 transition-all"
              style={{ background: N, color: "white", fontSize: "0.78rem", fontWeight: 700, border: `1px solid ${N}`, borderRadius: 6 }}>
              Actions <ChevronDown size={12} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Main component ────────────────────────────────────────────────────────── */
export function ApprovalsTab() {
  const workspace = useSubmissionWorkspaceOptional();
  const [approvals,  setApprovals] = useState<Approval[]>(SEED);
  const [showModal,  setShowModal] = useState(false);
  const [actionTarget, setActionTarget] = useState<Approval | null>(null);
  const [statusFilter, setStatusFilter] = useState<ApprovalStatus | "All">("All");
  const nextNum = useRef(2242);

  const pending  = approvals.filter(a => a.status === "Pending");
  const approved = approvals.filter(a => a.status === "Approved");
  const declined = approvals.filter(a => a.status === "Declined");

  // Sort: Pending first, then Approved, then Declined — then apply status filter.
  const sorted = [...pending, ...approved, ...declined]
    .filter(a => statusFilter === "All" || a.status === statusFilter);

  // Clicking an active filter chip clears the filter.
  const toggleFilter = (s: ApprovalStatus) =>
    setStatusFilter(prev => prev === s ? "All" : s);

  // Open the action modal — user picks Approve or Decline, writes a note, then confirms.
  const handleAction = (id: string) => {
    const target = approvals.find(a => a.id === id);
    if (target) setActionTarget(target);
  };

  const handleConfirmAction = (action: "Approve" | "Decline", note: string) => {
    if (!actionTarget) return;
    const now = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const status: ApprovalStatus = action === "Approve" ? "Approved" : "Declined";
    const fallbackNote = action === "Approve" ? "Approved as submitted" : "Declined";
    setApprovals(prev => prev.map(a =>
      a.id === actionTarget.id
        ? { ...a, status, decisionDate: now, note: note.trim() || fallbackNote }
        : a
    ));
    // Mirror the decision as a note in the Notes tab with the matching tag.
    const { name, initials, color } = authorFromApprover(actionTarget.approver);
    const verb = action === "Approve" ? "Approved" : "Declined";
    const tag  = action === "Approve" ? "Approval" : "Decline";
    workspace?.pushPendingNote({
      content: `${verb} ${actionTarget.id} — ${actionTarget.title}.${note.trim() ? ` ${note.trim()}` : ""}`,
      tags: [tag],
      author: name,
      initials,
      avatarColor: color,
    });
    setActionTarget(null);
  };

  const handleAdd = (partial: Omit<Approval, "id">) => {
    setApprovals(prev => [{ ...partial, id: `AP-${nextNum.current++}` }, ...prev]);
  };

  return (
    <>
      <div className="space-y-4">

        {/* ── Toolbar ──────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between flex-wrap gap-3">

          {/* Summary pills — click to filter, click again (or the active one) to clear */}
          <div className="flex items-center gap-2 flex-wrap">
            {pending.length > 0 && (
              <FilterPill
                active={statusFilter === "Pending"}
                onClick={() => toggleFilter("Pending")}
                bg="#FFF8E6" border="#F0D88A" text="#8A5C00" dot="#C9A227"
                label={`${pending.length} pending`}
              />
            )}
            {approved.length > 0 && (
              <FilterPill
                active={statusFilter === "Approved"}
                onClick={() => toggleFilter("Approved")}
                bg="#E8F5EC" border="#93C8A0" text="#1A5C30" dot="#2E7D32"
                label={`${approved.length} approved`}
              />
            )}
            {declined.length > 0 && (
              <FilterPill
                active={statusFilter === "Declined"}
                onClick={() => toggleFilter("Declined")}
                bg="#FBEAEA" border="#E8A8A8" text="#7A1F1F" dot="#B91C1C"
                label={`${declined.length} declined`}
              />
            )}
            {statusFilter !== "All" && (
              <button
                onClick={() => setStatusFilter("All")}
                className="hover:brightness-95 transition-all"
                style={{ fontSize: "0.72rem", fontWeight: 600, color: TM, background: "white", border: `1px solid ${BD}`, padding: "5px 10px", borderRadius: 6 }}>
                Clear filter
              </button>
            )}
            {approvals.length === 0 && (
              <span style={{ fontSize: "0.78rem", color: TT }}>No approvals yet for this submission.</span>
            )}
          </div>

          {/* Request approval button */}
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 hover:brightness-95 transition-all"
            style={{ background: N, color: "white", fontSize: "0.80rem", fontWeight: 700, borderRadius: 6 }}>
            <Plus size={13} /> Request approval
          </button>
        </div>

        {/* ── Approval cards ────────────────────────────────────────────────── */}
        <div className="space-y-3">
          {sorted.length === 0 && statusFilter !== "All" && (
            <div className="flex items-center justify-center"
              style={{ background: "white", border: `1px dashed ${BD}`, borderRadius: 8, padding: "28px 16px", color: TT, fontSize: "0.82rem" }}>
              No {statusFilter.toLowerCase()} approvals.
            </div>
          )}
          {sorted.map(approval => (
            <ApprovalCard
              key={approval.id}
              approval={approval}
              onAction={handleAction}
            />
          ))}
        </div>
      </div>

      {showModal && (
        <NewApprovalModal onClose={() => setShowModal(false)} onSubmit={handleAdd} />
      )}

      {actionTarget && (
        <ActionModal
          approval={actionTarget}
          onClose={() => setActionTarget(null)}
          onConfirm={handleConfirmAction}
        />
      )}
    </>
  );
}

/* ── Action modal (Approve / Decline) ────────────────────────────────────────
   Shown when the underwriter clicks "Actions" on a pending approval card.
   User picks Approve or Decline, writes a note, then confirms. The decision
   is mirrored to the Notes tab tagged "Approval" or "Decline" via the
   shared workspace context. Layout matches the existing approval modal. */
function ActionModal({
  approval, onClose, onConfirm,
}: {
  approval: Approval;
  onClose: () => void;
  onConfirm: (action: "Approve" | "Decline", note: string) => void;
}) {
  const [action, setAction] = useState<"Approve" | "Decline">("Approve");
  const [note, setNote]     = useState("");

  const isApprove = action === "Approve";
  const accent    = isApprove ? "#2E7D32" : "#B91C1C";
  const noteLabel = isApprove ? "Approval note" : "Decline reason";
  const placeholder = isApprove
    ? "Conditions, rationale, or context for this approval. Posted to the Notes tab as an Approval entry."
    : "Reason for declining this request. Posted to the Notes tab as a Decline entry.";
  const tagLabel   = isApprove ? "Approval" : "Decline";
  const confirmBg  = isApprove ? N : "#B91C1C";
  const confirmLbl = isApprove ? "Confirm approval" : "Confirm decline";

  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(15, 25, 40, 0.55)" }}>

      <div className="w-full mx-4"
        style={{ maxWidth: 560, background: "white", border: `1px solid ${BD}`, boxShadow: "0 20px 60px rgba(0,0,0,0.20)", borderRadius: 10, overflow: "hidden" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: `1px solid ${BDL}` }}>
          <div className="flex items-center gap-2">
            {isApprove
              ? <Check size={16} color={accent} />
              : <X size={16} color={accent} />}
            <h2 style={{ fontSize: "1.05rem", fontWeight: 800, color: TD }}>
              {isApprove ? "Approve request" : "Decline request"}
            </h2>
            <span style={{ fontSize: "0.78rem", color: TT }}>· {approval.id}</span>
          </div>
          <button onClick={onClose} className="flex items-center justify-center hover:bg-slate-100 transition-colors"
            style={{ width: 28, height: 28, color: TT, borderRadius: 6 }}>
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">

          {/* Request summary */}
          <div style={{ background: "#F8FAFC", border: `1px solid ${BDL}`, borderRadius: 6, padding: "10px 14px" }}>
            <p style={{ fontSize: "0.62rem", fontWeight: 700, color: TT, textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 4 }}>
              {approval.category}
            </p>
            <p style={{ fontSize: "0.86rem", fontWeight: 700, color: TD, lineHeight: 1.4 }}>
              {approval.title}
            </p>
            <p style={{ fontSize: "0.72rem", color: TM, marginTop: 4 }}>
              Requested by <strong>{approval.requestedBy}</strong> · {approval.requestedOn}
            </p>
          </div>

          {/* Action toggle */}
          <div>
            <label style={{ fontSize: "0.62rem", fontWeight: 700, color: TT, textTransform: "uppercase", letterSpacing: "0.09em", display: "block", marginBottom: 6 }}>
              Decision
            </label>
            <div className="grid grid-cols-2 gap-2">
              <ActionChoice
                selected={isApprove}
                onClick={() => setAction("Approve")}
                color="#2E7D32"
                bg="#E8F5EC"
                border="#93C8A0"
                icon={<Check size={14} />}
                label="Approve"
              />
              <ActionChoice
                selected={!isApprove}
                onClick={() => setAction("Decline")}
                color="#B91C1C"
                bg="#FBEAEA"
                border="#E8A8A8"
                icon={<X size={14} />}
                label="Decline"
              />
            </div>
          </div>

          {/* Note */}
          <div>
            <label style={{ fontSize: "0.62rem", fontWeight: 700, color: TT, textTransform: "uppercase", letterSpacing: "0.09em", display: "block", marginBottom: 6 }}>
              {noteLabel}
            </label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder={placeholder}
              rows={4}
              autoFocus
              className="w-full outline-none resize-y px-3 py-2.5"
              style={{ fontSize: "0.84rem", border: `1px solid ${BD}`, borderRadius: 6, color: TD, fontFamily: font, boxSizing: "border-box" }}
            />
            <p style={{ fontSize: "0.68rem", color: TT, marginTop: 6 }}>
              This note will appear in the Notes tab tagged <strong>{tagLabel}</strong>.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2.5 px-6 py-4" style={{ borderTop: `1px solid ${BDL}`, background: TH }}>
          <button onClick={onClose} className="px-4 py-2 hover:brightness-97 transition-all"
            style={{ fontSize: "0.80rem", fontWeight: 600, color: TM, background: "white", border: `1px solid ${BD}`, borderRadius: 6 }}>
            Cancel
          </button>
          <button onClick={() => onConfirm(action, note)}
            className="flex items-center gap-1.5 px-5 py-2 hover:brightness-95 transition-all"
            style={{ background: confirmBg, color: "white", fontSize: "0.80rem", fontWeight: 700, borderRadius: 6 }}>
            {isApprove ? <Check size={13} /> : <X size={13} />}
            {confirmLbl}
          </button>
        </div>
      </div>
    </div>
  );
}

/* Segmented option used inside the ActionModal to pick Approve vs Decline. */
function ActionChoice({
  selected, onClick, color, bg, border, icon, label,
}: {
  selected: boolean;
  onClick:  () => void;
  color:    string;
  bg:       string;
  border:   string;
  icon:     React.ReactNode;
  label:    string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className="flex items-center justify-center gap-2 px-3 py-2.5 transition-all hover:brightness-97"
      style={{
        background: selected ? bg : "white",
        border: `1.5px solid ${selected ? border : BD}`,
        color: selected ? color : TM,
        fontSize: "0.84rem",
        fontWeight: 700,
        borderRadius: 6,
        boxShadow: selected ? `0 0 0 2px ${border}55` : "none",
        cursor: "pointer",
        outline: "none",
      }}>
      <span style={{ color: selected ? color : TT, display: "inline-flex" }}>{icon}</span>
      {label}
    </button>
  );
}
