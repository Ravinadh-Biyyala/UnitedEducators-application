import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Flag, AlertTriangle, ChevronRight, ChevronLeft, Filter, Check, X,
  FileText, DollarSign,
} from "lucide-react";
import { AppShell } from "../components/AppShell";
import type { RoleId } from "../components/AppShell";
import { useAuth } from "../context/AuthContext";
import { PrimaryWhiteButton, RippleButton } from "../components/DashboardCards";
import { typo, weight } from "../styles/typography";

const N    = "#0123D4";
const G    = "#C9A227";
const BDL  = "#DCE3EC";
const TD   = "#1A2530";
const TM   = "#4A5D6E";
const TT   = "#5F7080";
const CRIT = "#B91C1C";
const WARN = "#B45309";
const font = "'Source Sans 3', system-ui, sans-serif";

type ApprovalStatus = "Pending" | "Approved" | "Declined" | "Escalated";
type ApprovalType   = "Premium Authority" | "Coverage Exception" | "Limit Increase" | "Appetite Override" | "Discount Approval";
type ApprovalPriority = "Critical" | "High" | "Medium" | "Low";

interface Approval {
  id: string;
  submission: string;
  account: string;
  type: ApprovalType;
  requester: string;
  requesterInitials: string;
  approver: string;
  amount: number;
  reason: string;
  raisedDate: string;
  hoursOpen: number;
  status: ApprovalStatus;
  priority: ApprovalPriority;
}

const ALL_APPROVALS: Approval[] = [
  { id: "AP-3104", submission: "SUB-7829", account: "Riverside Unified School District",  type: "Premium Authority",  requester: "Sarah Mitchell", requesterInitials: "SM", approver: "Lead UW",      amount: 285_400, reason: "Premium exceeds underwriter authority by $35K",                 raisedDate: "Today, 09:14",       hoursOpen: 4,   status: "Pending",   priority: "High"     },
  { id: "AP-3105", submission: "SUB-7834", account: "Phoenix Charter Academy Network",     type: "Appetite Override",   requester: "James Owens",    requesterInitials: "JO", approver: "Director",     amount: 142_800, reason: "Appetite score 41 — outside guideline; broker requesting exception", raisedDate: "Today, 08:02",       hoursOpen: 5,   status: "Pending",   priority: "Critical" },
  { id: "AP-3106", submission: "SUB-7832", account: "Vanderbilt University",               type: "Coverage Exception",  requester: "Tom Lee",        requesterInitials: "TL", approver: "Lead UW",      amount: 612_300, reason: "GASB 68 pension liability rider requested above standard form",      raisedDate: "Yesterday, 16:48",   hoursOpen: 21,  status: "Pending",   priority: "Medium"   },
  { id: "AP-3107", submission: "SUB-7831", account: "Austin Independent School District",  type: "Limit Increase",      requester: "Sarah Mitchell", requesterInitials: "SM", approver: "Lead UW",      amount: 5_000_000, reason: "Increase Cyber sublimit from $2M to $5M",                          raisedDate: "May 11, 2026, 11:30", hoursOpen: 48,  status: "Approved",  priority: "Medium"   },
  { id: "AP-3108", submission: "SUB-7835", account: "Seattle Public Schools",              type: "Discount Approval",   requester: "Sarah Mitchell", requesterInitials: "SM", approver: "Lead UW",      amount: 12_500,  reason: "7.5% retention discount requested by broker (Gallagher)",            raisedDate: "May 11, 2026, 14:22", hoursOpen: 44,  status: "Declined",  priority: "Low"      },
  { id: "AP-3109", submission: "SUB-7836", account: "MIT",                                 type: "Premium Authority",   requester: "John Michaels",  requesterInitials: "JM", approver: "Director",     amount: 980_000, reason: "Higher-Ed schedule above Sr UW authority",                           raisedDate: "Today, 07:55",       hoursOpen: 6,   status: "Pending",   priority: "High"     },
  { id: "AP-3110", submission: "SUB-7833", account: "Denver Public Schools",               type: "Coverage Exception",  requester: "Tom Lee",        requesterInitials: "TL", approver: "Lead UW",      amount: 254_900, reason: "Mold/fungus coverage extension to $250K",                            raisedDate: "Yesterday, 10:15",   hoursOpen: 27,  status: "Approved",  priority: "Medium"   },
  { id: "AP-3111", submission: "SUB-7838", account: "Chicago Lab Schools",                 type: "Appetite Override",   requester: "Tom Lee",        requesterInitials: "TL", approver: "Director",     amount: 96_400,  reason: "Loss ratio trailing 5yr = 134% — broker requesting renewal anyway",  raisedDate: "May 10, 2026, 09:00",  hoursOpen: 76,  status: "Escalated", priority: "Critical" },
  { id: "AP-3112", submission: "SUB-7840", account: "Boston Latin School",                 type: "Limit Increase",      requester: "James Owens",    requesterInitials: "JO", approver: "Lead UW",      amount: 1_000_000, reason: "Increase aggregate from $3M to $4M",                                raisedDate: "Today, 10:42",       hoursOpen: 3,   status: "Pending",   priority: "Medium"   },
  { id: "AP-3113", submission: "SUB-7841", account: "Stanford University",                 type: "Discount Approval",   requester: "John Michaels",  requesterInitials: "JM", approver: "Director",     amount: 62_250,  reason: "5% multi-line credit on $1.2M Higher-Ed package",                     raisedDate: "Today, 11:08",       hoursOpen: 2,   status: "Pending",   priority: "Low"      },
];

const fmt$ = (n: number) =>
  n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(2)}M`
  : n >= 1_000   ? `$${Math.round(n / 1_000)}K`
  : `$${n}`;

// Urgent = anything that should jump the queue. Three independent triggers,
// any of which qualifies: escalated status, critical priority, or pending past
// SLA (≥24h). Items are deduped — a critical+SLA-breached row appears once.
const isUrgent = (a: Approval): boolean =>
  a.status === "Escalated" ||
  (a.status === "Pending" && (a.priority === "Critical" || a.hoursOpen >= 24));

// Why is this urgent? Used to label the urgent card's prominent reason chip.
const urgentReason = (a: Approval): { label: string; tone: "critical" | "warn" } => {
  if (a.status === "Escalated") return { label: "Escalated", tone: "critical" };
  if (a.priority === "Critical") return { label: "Critical priority", tone: "critical" };
  return { label: `SLA breach · ${Math.floor(a.hoursOpen / 24)}d ${a.hoursOpen % 24}h`, tone: "warn" };
};

const ageLabel = (h: number) => h < 24 ? `${h}h` : `${Math.floor(h / 24)}d ${h % 24}h`;

const STATUS_TONE: Record<ApprovalStatus, string> = {
  Pending:   N,
  Approved:  "#15803D",
  Declined:  CRIT,
  Escalated: CRIT,
};

export function ApprovalsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const role: RoleId = user?.roleId ?? "lead";

  const [tab, setTab] = useState<"awaiting" | "mine" | "decided" | "escalated">("awaiting");
  const [typeFilter, setTypeFilter] = useState<ApprovalType | "All">("All");
  const [page, setPage] = useState(1);
  const PER_PAGE = 8;

  const myName = user?.name ?? "Sarah Mitchell";

  // Urgent items live in their own panel above the queue. The main table
  // includes everything (urgent + normal) so users have a single source of
  // truth — the panel just promotes the loud ones, it doesn't hide them from
  // the queue. Sorting puts urgent on top regardless.
  const urgentItems = useMemo(
    () => ALL_APPROVALS.filter(isUrgent).sort((a, b) => b.hoursOpen - a.hoursOpen),
    []
  );

  const filtered = useMemo(() => {
    let list = [...ALL_APPROVALS];
    if (tab === "awaiting")  list = list.filter(a => a.status === "Pending");
    if (tab === "mine")      list = list.filter(a => a.requester === myName);
    if (tab === "decided")   list = list.filter(a => a.status === "Approved" || a.status === "Declined");
    if (tab === "escalated") list = list.filter(a => a.status === "Escalated");
    if (typeFilter !== "All") list = list.filter(a => a.type === typeFilter);
    // Urgent rows always sort to the top so the queue mirrors the panel order.
    return list.sort((a, b) => {
      const ua = isUrgent(a) ? 1 : 0;
      const ub = isUrgent(b) ? 1 : 0;
      if (ua !== ub) return ub - ua;
      return b.hoursOpen - a.hoursOpen;
    });
  }, [tab, typeFilter, myName]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const counts = {
    awaiting:  ALL_APPROVALS.filter(a => a.status === "Pending").length,
    mine:      ALL_APPROVALS.filter(a => a.requester === myName).length,
    decided:   ALL_APPROVALS.filter(a => a.status === "Approved" || a.status === "Declined").length,
    escalated: ALL_APPROVALS.filter(a => a.status === "Escalated").length,
  };

  const urgentCount = urgentItems.length;
  const criticalCount = ALL_APPROVALS.filter(a => a.status === "Pending" && a.priority === "Critical").length;
  const slaBreachCount = ALL_APPROVALS.filter(a => a.status === "Pending" && a.hoursOpen >= 24).length;
  const pendingAmount = ALL_APPROVALS.filter(a => a.status === "Pending").reduce((s, a) => s + a.amount, 0);

  return (
    <AppShell activePage="approvals" role={role} onRoleChange={() => {}}>
      <div className="px-3 sm:px-4 lg:px-5 py-3 sm:py-4 space-y-3 sm:space-y-4"
        style={{ fontFamily: font, color: TD, minHeight: "100%", background: "#EEF1F6" }}>

        {/* ── HERO ──────────────────────────────────────────────────────────── */}
        <div className="relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${N} 0%, #0E3CE0 50%, #2547F4 100%)`,
            borderRadius: 12, color: "white",
            boxShadow: `0 4px 16px ${N}25`,
          }}>
          <div aria-hidden style={{
            position: "absolute", top: -40, right: -40, width: 180, height: 180,
            background: `radial-gradient(circle, ${G}25 0%, transparent 65%)`,
            borderRadius: "50%",
          }}/>
          <div className="relative px-4 sm:px-5 py-4 sm:py-5 flex items-start justify-between gap-3 flex-wrap">
            <div>
              <h1 style={{ fontSize: "1.35rem", fontWeight: 800, color: "white", lineHeight: 1.2 }}>Approval Queue</h1>
              <p style={{ fontSize: "0.80rem", color: "rgba(255,255,255,0.6)", marginTop: 4 }}>
                Referrals · Exceptions · Authority requests · {counts.awaiting} awaiting decision · {fmt$(pendingAmount)} at stake
                {urgentCount > 0 && <> · {urgentCount} urgent</>}
              </p>
            </div>
            <PrimaryWhiteButton>
              <FileText size={14}/>
              Authority Matrix
            </PrimaryWhiteButton>
          </div>
        </div>

        {/* ── Urgent panel ────────────────────────────────────────────────── */}
        {/* Loud red-trimmed panel showing decisions that need action right
            now: escalated, critical priority, or SLA-breached. Replaces the
            spread of color across many KPI tiles with one focused surface. */}
        {urgentCount > 0 && (
          <UrgentPanel
            items={urgentItems}
            onOpen={(sub) => navigate(`/submission/${sub}`)}
            criticalCount={criticalCount}
            slaBreachCount={slaBreachCount}
            escalatedCount={counts.escalated}
          />
        )}

        {/* ── Queue card ──────────────────────────────────────────────────── */}
        <div
          style={{
            background: "white",
            border: `1px solid ${BDL}`,
            borderRadius: 8,
            overflow: "hidden",
            boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
          }}>

          {/* Toolbar — functional filters only (no KPI tiles). */}
          <div className="flex items-center justify-between px-5 py-2.5 gap-3 flex-wrap"
            style={{ borderBottom: `1px solid ${BDL}` }}>
            <div className="flex items-center gap-1">
              {([
                { id: "awaiting" as const,  label: "Awaiting",    count: counts.awaiting  },
                { id: "mine" as const,      label: "My Requests", count: counts.mine      },
                { id: "escalated" as const, label: "Escalated",   count: counts.escalated },
                { id: "decided" as const,   label: "Decided",     count: counts.decided   },
              ]).map(t => {
                const active = tab === t.id;
                const isCritical = t.id === "escalated";
                return (
                  <button key={t.id}
                    onClick={() => { setTab(t.id); setPage(1); }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 transition-all"
                    style={{
                      ...typo.body, fontWeight: active ? weight.bold : weight.medium,
                      background: active ? (isCritical ? `${CRIT}10` : `${N}10`) : "transparent",
                      color: active ? (isCritical ? CRIT : N) : TM,
                      border: "none", borderRadius: 6, cursor: "pointer", fontFamily: font,
                    }}>
                    {t.label}
                    {t.count > 0 && (
                      <span style={{
                        ...typo.overline,
                        background: isCritical ? CRIT : active ? N : "#E2E8F0",
                        color: isCritical || active ? "white" : TM,
                        padding: "1px 7px", borderRadius: 8,
                      }}>{t.count}</span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              <Filter size={12} color={TT}/>
              <select
                value={typeFilter}
                onChange={e => { setTypeFilter(e.target.value as ApprovalType | "All"); setPage(1); }}
                style={{
                  ...typo.bodySm, border: `1px solid ${BDL}`, borderRadius: 5,
                  padding: "6px 10px", color: TM, background: "white", fontFamily: font,
                  cursor: "pointer", outline: "none",
                }}>
                {(["All", "Premium Authority", "Coverage Exception", "Limit Increase", "Appetite Override", "Discount Approval"] as const).map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full" style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#FAFBFD" }}>
                  {["Request", "Submission", "Amount", "Requester", "Age", "Status", "Action"].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left whitespace-nowrap"
                      style={{
                        ...typo.overline, color: TT,
                        borderBottom: `1px solid ${BDL}`,
                      }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-10 text-center" style={{ ...typo.body, color: TT }}>
                      No approvals match the current filters.
                    </td>
                  </tr>
                ) : paginated.map((a, idx) => (
                  <QueueRow
                    key={a.id}
                    approval={a}
                    isLast={idx === paginated.length - 1}
                    onOpen={() => navigate(`/submission/${a.submission}`)}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-5 py-3 flex items-center justify-between flex-wrap gap-3"
            style={{ borderTop: `1px solid ${BDL}`, background: "#FAFBFD" }}>
            <span style={{ ...typo.bodySm, color: TM }}>
              <span style={{ fontWeight: weight.bold, color: TD }}>{filtered.length === 0 ? 0 : (page - 1) * PER_PAGE + 1}</span>
              {"–"}
              <span style={{ fontWeight: weight.bold, color: TD }}>{Math.min(page * PER_PAGE, filtered.length)}</span>
              {" of "}
              <span style={{ fontWeight: weight.bold, color: TD }}>{filtered.length}</span> approvals
            </span>
            <div className="flex items-center gap-1">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 hover:bg-slate-100 disabled:opacity-35 disabled:cursor-not-allowed transition-all"
                style={{
                  border: `1px solid ${BDL}`, background: "white", borderRadius: 6,
                  ...typo.bodySm, fontWeight: weight.semibold, color: page === 1 ? TT : TM,
                  cursor: page === 1 ? "not-allowed" : "pointer", fontFamily: font,
                }}>
                <ChevronLeft size={12}/> Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)}
                  className="hover:brightness-95 transition-all"
                  style={{
                    width: 30, height: 30, borderRadius: 6,
                    background: p === page ? N : "white",
                    color: p === page ? "white" : TM,
                    border: `1px solid ${p === page ? N : BDL}`,
                    ...typo.bodySm, fontWeight: p === page ? weight.heavy : weight.medium,
                    cursor: "pointer", fontFamily: font,
                    boxShadow: p === page ? `0 2px 6px ${N}30` : "none",
                  }}>
                  {p}
                </button>
              ))}
              <button disabled={page === totalPages || totalPages === 0} onClick={() => setPage(p => p + 1)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 hover:bg-slate-100 disabled:opacity-35 disabled:cursor-not-allowed transition-all"
                style={{
                  border: `1px solid ${BDL}`, background: "white", borderRadius: 6,
                  ...typo.bodySm, fontWeight: weight.semibold,
                  color: page === totalPages || totalPages === 0 ? TT : N,
                  cursor: page === totalPages || totalPages === 0 ? "not-allowed" : "pointer",
                  fontFamily: font,
                }}>
                Next <ChevronRight size={12}/>
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

// ─── Urgent panel ────────────────────────────────────────────────────────────
function UrgentPanel({
  items, onOpen, criticalCount, slaBreachCount, escalatedCount,
}: {
  items: Approval[];
  onOpen: (sub: string) => void;
  criticalCount: number;
  slaBreachCount: number;
  escalatedCount: number;
}) {
  return (
    <div
      style={{
        background: "white",
        border: `1px solid ${CRIT}33`,
        borderLeft: `4px solid ${CRIT}`,
        borderRadius: 10,
        overflow: "hidden",
        boxShadow: `0 2px 8px ${CRIT}10`,
      }}
    >
      <div style={{
        padding: "10px 16px",
        background: `${CRIT}08`,
        borderBottom: `1px solid ${CRIT}22`,
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{
            width: 26, height: 26, borderRadius: 7,
            background: CRIT, color: "white",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
          }}>
            <AlertTriangle size={14}/>
          </span>
          <div>
            <h2 style={{ ...typo.overline, fontSize: "0.875rem", color: CRIT }}>
              Needs your decision now
            </h2>
            <p style={{ ...typo.caption, color: TM, marginTop: 4 }}>
              {escalatedCount > 0 && <>{escalatedCount} escalated</>}
              {escalatedCount > 0 && (criticalCount > 0 || slaBreachCount > 0) && " · "}
              {criticalCount > 0 && <>{criticalCount} critical</>}
              {criticalCount > 0 && slaBreachCount > 0 && " · "}
              {slaBreachCount > 0 && <>{slaBreachCount} SLA-breached</>}
            </p>
          </div>
        </div>
        <span style={{
          ...typo.overline,
          background: CRIT, color: "white",
          padding: "3px 10px", borderRadius: 9999,
        }}>
          {items.length} item{items.length === 1 ? "" : "s"}
        </span>
      </div>

      <div>
        {items.map((a, idx) => (
          <UrgentCard
            key={a.id}
            approval={a}
            isLast={idx === items.length - 1}
            onOpen={() => onOpen(a.submission)}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Urgent card ─────────────────────────────────────────────────────────────
function UrgentCard({ approval: a, isLast, onOpen }: {
  approval: Approval;
  isLast: boolean;
  onOpen: () => void;
}) {
  const reason = urgentReason(a);
  const reasonColor = reason.tone === "critical" ? CRIT : WARN;
  const reasonBg    = reason.tone === "critical" ? "#FEE2E2" : "#FEF3C7";

  return (
    <div
      onClick={onOpen}
      className="cursor-pointer transition-colors hover:bg-slate-50 group"
      style={{
        padding: "14px 16px",
        borderBottom: isLast ? "none" : `1px solid #EEF1F5`,
        display: "flex", alignItems: "flex-start", gap: 14, flexWrap: "wrap",
      }}
    >
      <div style={{ flex: "1 1 320px", minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            ...typo.overline, color: reasonColor,
            background: reasonBg, padding: "2px 9px", borderRadius: 9999,
          }}>
            {reason.tone === "critical" && <AlertTriangle size={10}/>}
            {reason.label}
          </span>
          <span style={{ ...typo.caption, color: TT, fontFamily: "ui-monospace, monospace", fontWeight: weight.bold }}>
            {a.id}
          </span>
          <span style={{ ...typo.caption, color: TT }}>·</span>
          <button
            onClick={(e) => { e.stopPropagation(); onOpen(); }}
            style={{
              ...typo.caption, fontWeight: weight.bold, color: N,
              fontFamily: "ui-monospace, monospace",
              background: "none", border: "none", cursor: "pointer", padding: 0,
            }}
            className="hover:underline"
          >
            {a.submission}
          </button>
        </div>
        <p style={{ ...typo.bodyLg, fontWeight: weight.heavy, color: TD, marginTop: 8 }}>
          {a.reason}
        </p>
        <p style={{ ...typo.bodySm, color: TM, marginTop: 4 }}>
          {a.account} · <span style={{ fontWeight: weight.bold, color: TD, fontVariantNumeric: "tabular-nums" }}>{fmt$(a.amount)}</span> · {a.type} · {ageLabel(a.hoursOpen)} open
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0" onClick={e => e.stopPropagation()}>
        <RippleButton
          bg="#15803D"
          bgHover="#0F6D33"
          color="white"
          rippleColor="rgba(255,255,255,0.35)"
          padding="7px 12px"
        >
          <Check size={13}/> Approve
        </RippleButton>
        <RippleButton
          bg="white"
          bgHover="#FEF2F2"
          color={CRIT}
          border={`1px solid #E8A8A8`}
          rippleColor="rgba(185,28,28,0.25)"
          padding="7px 12px"
        >
          <X size={13}/> Decline
        </RippleButton>
      </div>
    </div>
  );
}

// ─── Queue row ───────────────────────────────────────────────────────────────
function QueueRow({ approval: a, isLast, onOpen }: {
  approval: Approval;
  isLast: boolean;
  onOpen: () => void;
}) {
  const urgent = isUrgent(a);
  const decided = a.status === "Approved" || a.status === "Declined";
  const tone = STATUS_TONE[a.status];

  // Visual hierarchy on the row itself:
  // - urgent (escalated/critical/SLA-breached): red left bar + bolder typography
  // - decided (Approved/Declined): muted (lower contrast text) so they don't
  //   compete visually with pending work
  // - normal pending: standard weight
  const leftBar = urgent ? CRIT : "transparent";
  const titleColor = decided ? TM : TD;
  const titleWeight = urgent ? 800 : decided ? 500 : 600;

  return (
    <tr
      onClick={onOpen}
      className="cursor-pointer hover:bg-slate-50 transition-colors group"
      style={{
        borderBottom: isLast ? "none" : `1px solid #EEF1F5`,
        background: urgent ? "#FEF6F605" : "white",
      }}
    >
      <td className="px-4 py-3" style={{ maxWidth: 320, borderLeft: `3px solid ${leftBar}` }}>
        <p style={{ ...typo.body, fontWeight: titleWeight, color: titleColor }}
          className="group-hover:underline">
          {a.reason}
        </p>
        <p style={{ ...typo.caption, color: TT, marginTop: 2 }}>
          {a.account} <span style={{ color: TT }}>· {a.type}</span>
        </p>
      </td>
      <td className="px-4 py-3">
        <button
          onClick={(e) => { e.stopPropagation(); onOpen(); }}
          className="hover:underline"
          style={{
            ...typo.bodySm, fontWeight: weight.bold, color: N,
            fontFamily: "ui-monospace, monospace",
            background: "none", border: "none", cursor: "pointer", padding: 0,
          }}>
          {a.submission}
        </button>
      </td>
      <td className="px-4 py-3">
        <span className="inline-flex items-center gap-1"
          style={{
            ...typo.body, fontWeight: weight.bold, color: decided ? TM : TD,
            fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap",
          }}>
          <DollarSign size={11} color={TT}/>
          {fmt$(a.amount)}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center justify-center rounded-full shrink-0"
            style={{
              width: 22, height: 22,
              background: `${N}15`, color: N,
              ...typo.overline,
            }}>
            {a.requesterInitials}
          </span>
          <span style={{ ...typo.bodySm, color: decided ? TT : TD, whiteSpace: "nowrap" }}>
            {a.requester.split(" ")[0]}
          </span>
        </div>
      </td>
      <td className="px-4 py-3" style={{ whiteSpace: "nowrap" }}>
        <span style={{
          ...typo.bodySm,
          color: a.hoursOpen >= 48 && !decided ? CRIT : a.hoursOpen >= 24 && !decided ? WARN : TM,
          fontWeight: a.hoursOpen >= 24 && !decided ? weight.bold : weight.medium,
        }}>
          {ageLabel(a.hoursOpen)}
        </span>
        <p style={{ ...typo.caption, color: TT, marginTop: 2 }}>{a.raisedDate}</p>
      </td>
      {/* Status column — single status pill, tone-tied to the terminal state.
          Urgency (SLA breach / escalation / critical priority) is already
          communicated by the red left bar and the urgent panel above, so
          this column stays purely about decision state. */}
      <td className="px-4 py-3">
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          ...typo.caption, fontWeight: weight.bold, color: tone,
          background: `${tone}12`,
          padding: "3px 9px", borderRadius: 9999,
          whiteSpace: "nowrap",
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: tone }}/>
          {a.status}
        </span>
      </td>
      <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
        {a.status === "Pending" ? (
          <div className="flex items-center gap-1.5">
            <RippleButton
              bg="#15803D"
              bgHover="#0F6D33"
              color="white"
              rippleColor="rgba(255,255,255,0.35)"
              padding="5px 9px"
            >
              <Check size={11}/> Approve
            </RippleButton>
            <RippleButton
              bg="white"
              bgHover="#FEF2F2"
              color={CRIT}
              border="1px solid #E8A8A8"
              rippleColor="rgba(185,28,28,0.25)"
              padding="5px 9px"
            >
              <X size={11}/> Decline
            </RippleButton>
          </div>
        ) : (
          <ChevronRight size={13} color={BDL} className="transition-colors group-hover:text-blue-600"/>
        )}
      </td>
    </tr>
  );
}
