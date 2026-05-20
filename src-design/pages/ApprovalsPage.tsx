import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Flag, CheckCircle2, XCircle, Clock, AlertTriangle,
  ChevronRight, ChevronLeft, Filter, Check, X,
  ShieldCheck, FileText, DollarSign,
} from "lucide-react";
import { AppShell } from "../components/AppShell";
import type { RoleId } from "../components/AppShell";
import { useAuth } from "../context/AuthContext";
import { PrimaryWhiteButton, RippleButton } from "../components/DashboardCards";

const N   = "#0123D4";
const G   = "#C9A227";
const BDL = "#DCE3EC";
const TD  = "#1A2530";
const TM  = "#4A5D6E";
const TT  = "#7A8FA3";
const font = "'Source Sans 3', system-ui, sans-serif";

// ─── KPI Tile (Dashboard hover effect, click-to-filter) ──────────────────────
function KPITile({ label, value, sub, accent, icon, onClick, selected = false }: {
  label: string; value: string; sub: string; accent: string; icon: React.ReactNode;
  onClick?: () => void; selected?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const clickable = !!onClick;
  const active    = selected;
  const showActive = active || hovered;
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      disabled={!clickable}
      aria-pressed={clickable ? active : undefined}
      aria-label={`${label}: ${value}, ${sub}${clickable ? (active ? " (filter active)" : " (click to filter)") : ""}`}
      style={{
        textAlign: "left", width: "100%", fontFamily: "inherit",
        background: active
          ? `linear-gradient(135deg, ${accent}12 0%, ${accent}06 100%)`
          : hovered
          ? `linear-gradient(135deg, white 0%, ${accent}08 100%)`
          : "white",
        border: `${active ? 1.5 : 1}px solid ${active ? accent : hovered ? `${accent}40` : BDL}`,
        borderRadius: 10, padding: "14px 16px",
        boxShadow: active
          ? `0 2px 8px ${accent}22, 0 1px 2px rgba(15,23,42,0.04)`
          : hovered
          ? `0 2px 6px ${accent}14, 0 1px 2px rgba(15,23,42,0.04)`
          : "0 1px 2px rgba(15,23,42,0.04)",
        transform: hovered && !active ? "translateY(-1px)" : "translateY(0)",
        transition: "background 0.2s ease, border-color 0.2s ease, box-shadow 0.25s ease, transform 0.2s ease",
        position: "relative", overflow: "hidden", outline: "none",
        cursor: clickable ? "pointer" : "default",
      }}>
      <span aria-hidden style={{
        position: "absolute", inset: "0 0 auto 0",
        height: showActive ? 4 : 3,
        background: showActive ? accent : `linear-gradient(90deg, ${accent}, ${accent}66)`,
        transition: "height 0.2s ease, background 0.2s ease",
      }}/>
      <div className="flex items-start justify-between gap-2">
        <p style={{
          fontSize: "0.6rem", fontWeight: 700, color: active ? accent : TT,
          textTransform: "uppercase", letterSpacing: "0.09em", lineHeight: 1.3,
        }}>{label}</p>
        <span className="inline-flex items-center justify-center"
          style={{
            width: 30, height: 30, borderRadius: 8,
            background: showActive ? `${accent}1F` : `${accent}10`,
            color: accent,
            transform: showActive ? "scale(1.08)" : "scale(1)",
            transition: "background 0.2s ease, transform 0.2s ease",
          }}>
          {icon}
        </span>
      </div>
      <p style={{
        fontSize: "1.7rem", fontWeight: 800,
        color: showActive ? accent : TD,
        lineHeight: 1.1, marginTop: 6,
        fontVariantNumeric: "tabular-nums",
        transition: "color 0.2s ease",
      }}>{value}</p>
      <div className="inline-flex items-center gap-1 mt-2"
        style={{ fontSize: "0.66rem", color: TT, fontWeight: 600 }}>
        <span>{sub}</span>
      </div>
    </button>
  );
}

type ApprovalStatus = "Pending" | "Approved" | "Declined" | "Escalated";
type ApprovalType   = "Premium Authority" | "Coverage Exception" | "Limit Increase" | "Appetite Override" | "Discount Approval";

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
  priority: "Critical" | "High" | "Medium" | "Low";
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

const STATUS_STYLE: Record<ApprovalStatus, { bg: string; color: string }> = {
  Pending:   { bg: "#FFF4D6", color: "#8A5C00" },
  Approved:  { bg: "#E8F5EC", color: "#15803D" },
  Declined:  { bg: "#FEE2E2", color: "#B91C1C" },
  Escalated: { bg: "#E0E7FF", color: N },
};

const fmt$ = (n: number) =>
  n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(2)}M`
  : n >= 1_000   ? `$${Math.round(n / 1_000)}K`
  : `$${n}`;

export function ApprovalsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const role: RoleId = user?.roleId ?? "lead";

  const [tab, setTab] = useState<"awaiting" | "mine" | "decided" | "escalated">("awaiting");
  const [typeFilter, setTypeFilter] = useState<ApprovalType | "All">("All");
  const [kpiKey, setKpiKey] = useState<"awaiting" | "slaBreach" | "escalated" | "approved" | "declined" | null>(null);
  const [page, setPage] = useState(1);
  const PER_PAGE = 8;

  const myName = user?.name ?? "Sarah Mitchell";

  const filtered = useMemo(() => {
    let list = [...ALL_APPROVALS];
    if (kpiKey) {
      if (kpiKey === "awaiting")       list = list.filter(a => a.status === "Pending");
      else if (kpiKey === "slaBreach") list = list.filter(a => a.status === "Pending" && a.hoursOpen >= 24);
      else if (kpiKey === "escalated") list = list.filter(a => a.status === "Escalated");
      else if (kpiKey === "approved")  list = list.filter(a => a.status === "Approved");
      else if (kpiKey === "declined")  list = list.filter(a => a.status === "Declined");
    } else {
      if (tab === "awaiting")  list = list.filter(a => a.status === "Pending");
      if (tab === "mine")      list = list.filter(a => a.requester === myName);
      if (tab === "decided")   list = list.filter(a => a.status === "Approved" || a.status === "Declined");
      if (tab === "escalated") list = list.filter(a => a.status === "Escalated");
    }
    if (typeFilter !== "All") list = list.filter(a => a.type === typeFilter);
    return list.sort((a, b) => b.hoursOpen - a.hoursOpen);
  }, [tab, typeFilter, kpiKey, myName]);

  const onKpiClick = (key: NonNullable<typeof kpiKey>) => {
    setKpiKey(prev => prev === key ? null : key);
    setPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const counts = {
    awaiting:  ALL_APPROVALS.filter(a => a.status === "Pending").length,
    mine:      ALL_APPROVALS.filter(a => a.requester === myName).length,
    decided:   ALL_APPROVALS.filter(a => a.status === "Approved" || a.status === "Declined").length,
    escalated: ALL_APPROVALS.filter(a => a.status === "Escalated").length,
  };

  const pendingAmount  = ALL_APPROVALS.filter(a => a.status === "Pending").reduce((s, a) => s + a.amount, 0);
  const approvedToday  = ALL_APPROVALS.filter(a => a.status === "Approved").length;
  const decliedToday   = ALL_APPROVALS.filter(a => a.status === "Declined").length;
  const slaBreached    = ALL_APPROVALS.filter(a => a.status === "Pending" && a.hoursOpen >= 24).length;

  const kpis = [
    { key: "awaiting"  as const, label: "Awaiting Decision", value: String(counts.awaiting),       sub: fmt$(pendingAmount),  accent: "#8A5C00", icon: <Clock size={16}/>         },
    { key: "slaBreach" as const, label: "SLA Breach (24h+)", value: String(slaBreached),           sub: "Pending > 1 day",     accent: "#B91C1C", icon: <AlertTriangle size={16}/> },
    { key: "escalated" as const, label: "Escalated",         value: String(counts.escalated),      sub: "Director queue",      accent: N,         icon: <Flag size={16}/>          },
    { key: "approved"  as const, label: "Approved (MTD)",    value: String(approvedToday),         sub: "This month",          accent: "#15803D", icon: <CheckCircle2 size={16}/>  },
    { key: "declined"  as const, label: "Declined (MTD)",    value: String(decliedToday),          sub: "This month",          accent: "#B91C1C", icon: <XCircle size={16}/>       },
    { key: null,                 label: "Avg Decision Time", value: "18h",                         sub: "Last 30d",            accent: G,         icon: <ShieldCheck size={16}/>   },
  ];

  return (
    <AppShell activePage="approvals" role={role} onRoleChange={() => {}}>
      <div className="px-4 sm:px-6 lg:px-8 py-5 sm:py-7 space-y-5 sm:space-y-6"
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
          <div className="relative px-5 sm:px-7 py-5 sm:py-6 flex items-start justify-between gap-3 flex-wrap">
            <div>
              <h1 style={{ fontSize: "1.35rem", fontWeight: 800, color: "white", lineHeight: 1.2 }}>Approvals</h1>
              <p style={{ fontSize: "0.80rem", color: "rgba(255,255,255,0.6)", marginTop: 4 }}>
                Referrals · Exceptions · Authority requests · {counts.awaiting} awaiting decision
              </p>
            </div>
            <PrimaryWhiteButton>
              <FileText size={14}/>
              Authority Matrix
            </PrimaryWhiteButton>
          </div>
        </div>

        {/* ── KPI STRIP ─────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {kpis.map((k, i) => (
            <KPITile key={i} label={k.label} value={k.value} sub={k.sub} accent={k.accent} icon={k.icon}
              onClick={k.key ? () => onKpiClick(k.key) : undefined}
              selected={!!k.key && kpiKey === k.key}/>
          ))}
        </div>

        {/* ── APPROVALS TABLE CARD ──────────────────────────────────────────── */}
        <div
          style={{
            background: "white",
            border: `1px solid ${BDL}`,
            borderTop: `3px solid ${N}`,
            borderRadius: 8,
            overflow: "hidden",
            boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
          }}>

          <div className="flex items-center justify-between px-5 py-3 flex-wrap gap-2"
            style={{ borderBottom: `1px solid ${BDL}`, background: "#FAFBFD" }}>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center"
                style={{ width: 24, height: 24, borderRadius: 6, background: `${N}12`, color: N }}>
                <Flag size={13}/>
              </span>
              <h3 style={{ fontSize: "0.74rem", fontWeight: 700, color: TD, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Approval Queue
              </h3>
            </div>
            <span style={{
              fontSize: "0.68rem", fontWeight: 800, background: `${N}10`, color: N,
              padding: "2px 9px", borderRadius: 10, letterSpacing: "0.02em",
            }}>
              {filtered.length}
            </span>
          </div>

          <div className="flex items-center justify-between px-5 py-2.5 gap-3 flex-wrap"
            style={{ borderBottom: `1px solid ${BDL}` }}>
            <div className="flex items-center gap-1">
              {([
                { id: "awaiting" as const,  label: "Awaiting",      count: counts.awaiting  },
                { id: "mine" as const,      label: "My Requests",   count: counts.mine      },
                { id: "escalated" as const, label: "Escalated",     count: counts.escalated },
                { id: "decided" as const,   label: "Decided",       count: counts.decided   },
              ]).map(t => (
                <button key={t.id}
                  onClick={() => { setTab(t.id); setKpiKey(null); setPage(1); }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 transition-all"
                  style={{
                    fontSize: "0.74rem", fontWeight: !kpiKey && tab === t.id ? 700 : 500,
                    background: !kpiKey && tab === t.id ? `${N}10` : "transparent",
                    color: !kpiKey && tab === t.id ? N : TM,
                    border: "none", borderRadius: 6, cursor: "pointer", fontFamily: font,
                  }}>
                  {t.label}
                  {t.count > 0 && (
                    <span style={{
                      fontSize: "0.55rem", fontWeight: 800,
                      background: t.id === "escalated" ? "#B91C1C" : !kpiKey && tab === t.id ? N : "#E2E8F0",
                      color: t.id === "escalated" || (!kpiKey && tab === t.id) ? "white" : TM,
                      padding: "1px 6px", borderRadius: 8,
                    }}>{t.count}</span>
                  )}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Filter size={12} color={TT}/>
              <select
                value={typeFilter}
                onChange={e => { setTypeFilter(e.target.value as ApprovalType | "All"); setPage(1); }}
                style={{
                  fontSize: "0.72rem", border: `1px solid ${BDL}`, borderRadius: 5,
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
                  {["Priority", "Request", "Submission", "Type", "Amount", "Requester", "Age", "Status", "Action"].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left whitespace-nowrap"
                      style={{
                        fontSize: "0.58rem", fontWeight: 700, color: TT,
                        textTransform: "uppercase", letterSpacing: "0.09em",
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
                    <td colSpan={9} className="px-5 py-10 text-center" style={{ fontSize: "0.82rem", color: TT }}>
                      No approvals match the current filters.
                    </td>
                  </tr>
                ) : paginated.map((a, idx) => {
                  const status = STATUS_STYLE[a.status];
                  const ageColor =
                    a.hoursOpen >= 48 ? "#B91C1C" :
                    a.hoursOpen >= 24 ? "#B45309" : TM;
                  const priorityDot =
                    a.priority === "Critical" ? "#B91C1C" :
                    a.priority === "High" ? "#B45309" :
                    a.priority === "Medium" ? "#005B99" : TT;
                  const isLast = idx === paginated.length - 1;
                  return (
                    <tr key={a.id}
                      onClick={() => navigate(`/submission/${a.submission}`)}
                      className="cursor-pointer hover:bg-slate-50 transition-colors group"
                      style={{ borderBottom: isLast ? "none" : `1px solid #EEF1F5` }}>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5"
                          style={{ fontSize: "0.62rem", fontWeight: 700, color: priorityDot }}>
                          <span style={{ width: 5, height: 5, borderRadius: "50%", background: priorityDot }}/>
                          {a.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3" style={{ maxWidth: 280 }}>
                        <p style={{ fontSize: "0.8rem", fontWeight: 600, color: TD, lineHeight: 1.35 }}
                          className="group-hover:underline">
                          {a.reason}
                        </p>
                        <p style={{ fontSize: "0.64rem", color: TT, marginTop: 1 }}>{a.account}</p>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={e => { e.stopPropagation(); navigate(`/submission/${a.submission}`); }}
                          className="hover:underline"
                          style={{
                            fontSize: "0.72rem", fontWeight: 700, color: N,
                            fontFamily: "ui-monospace, monospace",
                            background: "none", border: "none", cursor: "pointer", padding: 0,
                          }}>
                          {a.submission}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <span style={{ fontSize: "0.66rem", color: TM, fontWeight: 500, whiteSpace: "nowrap" }}>
                          {a.type}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1"
                          style={{
                            fontSize: "0.78rem", fontWeight: 700, color: TD,
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
                              fontSize: "0.55rem", fontWeight: 800,
                            }}>
                            {a.requesterInitials}
                          </span>
                          <span style={{ fontSize: "0.72rem", color: TD, fontWeight: 500, whiteSpace: "nowrap" }}>
                            {a.requester.split(" ")[0]}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3" style={{ whiteSpace: "nowrap" }}>
                        <span style={{
                          fontSize: "0.72rem", color: ageColor,
                          fontWeight: a.hoursOpen >= 24 ? 700 : 500,
                        }}>
                          {a.hoursOpen < 24 ? `${a.hoursOpen}h` : `${Math.floor(a.hoursOpen / 24)}d ${a.hoursOpen % 24}h`}
                        </span>
                        <p style={{ fontSize: "0.62rem", color: TT, marginTop: 2 }}>{a.raisedDate}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5"
                          style={{
                            background: status.bg, padding: "2px 8px", borderRadius: 4,
                            whiteSpace: "nowrap",
                          }}>
                          <span style={{ width: 5, height: 5, borderRadius: "50%", background: status.color }}/>
                          <span style={{ fontSize: "0.66rem", fontWeight: 700, color: status.color }}>
                            {a.status}
                          </span>
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
                              color="#B91C1C"
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
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-5 py-3 flex items-center justify-between flex-wrap gap-3"
            style={{ borderTop: `1px solid ${BDL}`, background: "#FAFBFD" }}>
            <span style={{ fontSize: "0.72rem", color: TT }}>
              Showing <span style={{ fontWeight: 700, color: TD }}>{filtered.length === 0 ? 0 : (page - 1) * PER_PAGE + 1}</span>
              {" – "}
              <span style={{ fontWeight: 700, color: TD }}>{Math.min(page * PER_PAGE, filtered.length)}</span>
              {" of "}
              <span style={{ fontWeight: 700, color: N }}>{filtered.length}</span> approvals
            </span>
            <div className="flex items-center gap-1">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 hover:bg-slate-100 disabled:opacity-35 disabled:cursor-not-allowed transition-all"
                style={{
                  border: `1px solid ${BDL}`, background: "white", borderRadius: 6,
                  fontSize: "0.7rem", fontWeight: 600, color: page === 1 ? TT : TM,
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
                    fontSize: "0.72rem", fontWeight: p === page ? 800 : 500,
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
                  fontSize: "0.7rem", fontWeight: 600,
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
