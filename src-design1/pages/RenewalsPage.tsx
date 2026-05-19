import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import {
  Calendar, RefreshCw, AlertCircle, AlertTriangle,
  ChevronRight, ChevronLeft, Filter,
} from "lucide-react";
import { AppShell } from "../components/AppShell";
import type { RoleId } from "../components/AppShell";
import { PageRegister } from "../components/companion/PageRegister";
import { newId, now } from "../components/companion/CompanionContext";
import { useAuth } from "../context/AuthContext";
import { PrimaryWhiteButton } from "../components/DashboardCards";

const N   = "#0123D4";
const G   = "#C9A227";
const BDL = "#DCE3EC";
const TD  = "#1A2530";
const TM  = "#4A5D6E";
const TT  = "#7A8FA3";
const font = "'Source Sans 3', system-ui, sans-serif";

// ─── Window Bucket (selectable time-window filter tile, Dashboard hover style) ───
function WindowBucket({ label, count, sub, accent, selected, onClick }: {
  label: string; count: number; sub: string; accent: string;
  selected: boolean; onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const active = selected;
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      aria-pressed={active}
      aria-label={`${label}: ${count}`}
      style={{
        textAlign: "left", width: "100%", fontFamily: font,
        background: active
          ? `linear-gradient(135deg, ${accent}12 0%, ${accent}06 100%)`
          : hovered
          ? `linear-gradient(135deg, white 0%, ${accent}08 100%)`
          : "white",
        border: `1.5px solid ${active ? accent : hovered ? `${accent}40` : BDL}`,
        borderRadius: 10,
        padding: "14px 16px",
        boxShadow: active
          ? `0 2px 8px ${accent}22, 0 1px 2px rgba(15,23,42,0.04)`
          : hovered
          ? `0 2px 6px ${accent}14, 0 1px 2px rgba(15,23,42,0.04)`
          : "0 1px 2px rgba(15,23,42,0.04)",
        transform: hovered && !active ? "translateY(-1px)" : "translateY(0)",
        transition: "background 0.2s ease, border-color 0.2s ease, box-shadow 0.25s ease, transform 0.2s ease",
        position: "relative", overflow: "hidden", outline: "none", cursor: "pointer",
      }}>
      <span aria-hidden style={{
        position: "absolute", inset: "0 0 auto 0",
        height: active ? 4 : hovered ? 4 : 3,
        background: active ? accent : hovered ? accent : `linear-gradient(90deg, ${accent}, ${accent}66)`,
        transition: "height 0.2s ease, background 0.2s ease",
      }}/>
      <p style={{
        fontSize: "0.6rem", fontWeight: 700, color: active ? accent : TT,
        textTransform: "uppercase", letterSpacing: "0.09em", lineHeight: 1.3,
      }}>{label}</p>
      <p style={{
        fontSize: "1.7rem", fontWeight: 800,
        color: active ? accent : hovered ? accent : TD,
        lineHeight: 1.1, marginTop: 6,
        fontVariantNumeric: "tabular-nums",
        transition: "color 0.2s ease",
      }}>{count}</p>
      <div className="inline-flex items-center gap-1 mt-2"
        style={{ fontSize: "0.66rem", color: active ? accent : TT, fontWeight: 600 }}>
        <span>{sub}</span>
      </div>
    </button>
  );
}

type RenewalStatus = "Not Started" | "In Progress" | "Quoted" | "Bound" | "At Risk" | "Lost";

interface Renewal {
  id: string;
  policyId: string;
  account: string;
  state: string;
  product: string;
  expiringDate: string;
  daysUntilExpiry: number;
  expiringPremium: number;
  retentionTarget: number;
  status: RenewalStatus;
  assignee: string;
  assigneeInitials: string;
  broker: string;
  lossRatio: number;
}

const ALL_RENEWALS: Renewal[] = [
  { id: "R-2041", policyId: "POL-44182", account: "Riverside Unified School District",  state: "CA", product: "GL + Educators E&O", expiringDate: "May 30, 2026", daysUntilExpiry: 17,  expiringPremium: 285_400, retentionTarget: 95, status: "In Progress", assignee: "Sarah Mitchell",  assigneeInitials: "SM", broker: "Gallagher Education",        lossRatio: 64 },
  { id: "R-2042", policyId: "POL-44209", account: "Phoenix Charter Academy Network",     state: "AZ", product: "GL + EBL",          expiringDate: "May 22, 2026", daysUntilExpiry: 9,   expiringPremium: 142_800, retentionTarget: 90, status: "At Risk",     assignee: "James Owens",     assigneeInitials: "JO", broker: "Marsh K-12",                lossRatio: 118 },
  { id: "R-2043", policyId: "POL-44156", account: "Vanderbilt University",               state: "TN", product: "Property + GL",     expiringDate: "Jun 12, 2026", daysUntilExpiry: 30,  expiringPremium: 612_300, retentionTarget: 92, status: "Quoted",      assignee: "Tom Lee",         assigneeInitials: "TL", broker: "Aon Higher Ed",             lossRatio: 41 },
  { id: "R-2044", policyId: "POL-44301", account: "Seattle Public Schools",              state: "WA", product: "GL + Cyber",        expiringDate: "May 18, 2026", daysUntilExpiry: 5,   expiringPremium: 198_600, retentionTarget: 88, status: "At Risk",     assignee: "Sarah Mitchell",  assigneeInitials: "SM", broker: "Hub International",         lossRatio: 92 },
  { id: "R-2045", policyId: "POL-44078", account: "MIT",                                 state: "MA", product: "Full Schedule",      expiringDate: "Jul 01, 2026", daysUntilExpiry: 49,  expiringPremium: 980_000, retentionTarget: 96, status: "Not Started", assignee: "John Michaels",   assigneeInitials: "JM", broker: "Aon Higher Ed",             lossRatio: 38 },
  { id: "R-2046", policyId: "POL-44244", account: "Austin Independent School District",  state: "TX", product: "GL + EBL + Cyber",  expiringDate: "Jun 04, 2026", daysUntilExpiry: 22,  expiringPremium: 312_500, retentionTarget: 90, status: "In Progress", assignee: "Sarah Mitchell",  assigneeInitials: "SM", broker: "USI Insurance",             lossRatio: 55 },
  { id: "R-2047", policyId: "POL-44119", account: "Denver Public Schools",               state: "CO", product: "GL + Property",      expiringDate: "May 28, 2026", daysUntilExpiry: 15,  expiringPremium: 254_900, retentionTarget: 89, status: "Bound",       assignee: "Tom Lee",         assigneeInitials: "TL", broker: "Lockton Edu",               lossRatio: 47 },
  { id: "R-2048", policyId: "POL-44321", account: "Broward County Public Schools",       state: "FL", product: "Property",           expiringDate: "Jun 20, 2026", daysUntilExpiry: 38,  expiringPremium: 488_200, retentionTarget: 91, status: "Not Started", assignee: "James Owens",     assigneeInitials: "JO", broker: "Marsh K-12",                lossRatio: 72 },
  { id: "R-2049", policyId: "POL-44266", account: "Chicago Lab Schools",                 state: "IL", product: "GL + EBL",          expiringDate: "May 14, 2026", daysUntilExpiry: 1,   expiringPremium: 96_400,  retentionTarget: 85, status: "At Risk",     assignee: "Tom Lee",         assigneeInitials: "TL", broker: "Hub International",         lossRatio: 134 },
  { id: "R-2050", policyId: "POL-44193", account: "Stanford University",                 state: "CA", product: "Full Schedule",      expiringDate: "Jul 18, 2026", daysUntilExpiry: 66,  expiringPremium: 1_245_000, retentionTarget: 97, status: "Quoted",     assignee: "John Michaels",   assigneeInitials: "JM", broker: "Aon Higher Ed",             lossRatio: 32 },
  { id: "R-2051", policyId: "POL-44288", account: "Northwestern University",             state: "IL", product: "GL + Property",     expiringDate: "Jun 30, 2026", daysUntilExpiry: 48,  expiringPremium: 720_400, retentionTarget: 94, status: "In Progress", assignee: "John Michaels",   assigneeInitials: "JM", broker: "Aon Higher Ed",             lossRatio: 49 },
  { id: "R-2052", policyId: "POL-44177", account: "Boston Latin School",                 state: "MA", product: "GL + EBL",          expiringDate: "May 25, 2026", daysUntilExpiry: 12,  expiringPremium: 88_200,  retentionTarget: 87, status: "Lost",        assignee: "Sarah Mitchell",  assigneeInitials: "SM", broker: "Gallagher Education",        lossRatio: 156 },
  { id: "R-2053", policyId: "POL-44215", account: "Oakland Unified School District",     state: "CA", product: "GL + EBL",          expiringDate: "May 09, 2026", daysUntilExpiry: -4,  expiringPremium: 178_300, retentionTarget: 90, status: "At Risk",     assignee: "James Owens",     assigneeInitials: "JO", broker: "Marsh K-12",                lossRatio: 88  },
  { id: "R-2054", policyId: "POL-44339", account: "Rice University",                      state: "TX", product: "Property + GL",     expiringDate: "May 06, 2026", daysUntilExpiry: -7,  expiringPremium: 542_800, retentionTarget: 95, status: "In Progress", assignee: "John Michaels",   assigneeInitials: "JM", broker: "Aon Higher Ed",             lossRatio: 51  },
];

const STATUS_STYLE: Record<RenewalStatus, { bg: string; color: string }> = {
  "Not Started": { bg: "#F1F5F9", color: TM },
  "In Progress": { bg: "#E0E7FF", color: N },
  "Quoted":      { bg: "#FFF4D6", color: "#8A5C00" },
  "Bound":       { bg: "#E8F5EC", color: "#15803D" },
  "At Risk":     { bg: "#FEE2E2", color: "#B91C1C" },
  "Lost":        { bg: "#F1F5F9", color: TT },
};

const fmt$ = (n: number) =>
  n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(2)}M`
  : n >= 1_000   ? `$${Math.round(n / 1_000)}K`
  : `$${n}`;

type WindowId = "all" | "120d" | "90d" | "60d" | "30d" | "overdue";

const inWindow = (days: number, w: WindowId): boolean => {
  if (w === "all")     return true;
  if (w === "overdue") return days < 0;
  if (w === "120d")    return days >= 0 && days <= 120;
  if (w === "90d")     return days >= 0 && days <= 90;
  if (w === "60d")     return days >= 0 && days <= 60;
  if (w === "30d")     return days >= 0 && days <= 30;
  return true;
};

export function RenewalsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const role: RoleId = user?.roleId ?? "sr-uw";

  const [tab, setTab] = useState<"upcoming" | "mine" | "atrisk" | "bound">("upcoming");
  const [statusFilter, setStatusFilter] = useState<RenewalStatus | "All">("All");
  const [windowFilter, setWindowFilter] = useState<WindowId>("all");
  const [page, setPage] = useState(1);
  const PER_PAGE = 8;

  const myName = user?.name ?? "John Michaels";

  const filtered = useMemo(() => {
    let list = [...ALL_RENEWALS];
    if (tab === "upcoming") list = list.filter(r => r.daysUntilExpiry <= 45 && r.status !== "Bound" && r.status !== "Lost");
    if (tab === "mine")     list = list.filter(r => r.assignee === myName);
    if (tab === "atrisk")   list = list.filter(r => r.status === "At Risk");
    if (tab === "bound")    list = list.filter(r => r.status === "Bound");
    if (statusFilter !== "All") list = list.filter(r => r.status === statusFilter);
    if (windowFilter !== "all") list = list.filter(r => inWindow(r.daysUntilExpiry, windowFilter));
    return list.sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);
  }, [tab, statusFilter, windowFilter, myName]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const counts = {
    upcoming: ALL_RENEWALS.filter(r => r.daysUntilExpiry <= 45 && r.status !== "Bound" && r.status !== "Lost").length,
    mine:     ALL_RENEWALS.filter(r => r.assignee === myName).length,
    atrisk:   ALL_RENEWALS.filter(r => r.status === "At Risk").length,
    bound:    ALL_RENEWALS.filter(r => r.status === "Bound").length,
  };

  // Time-window bucket counts — measured against the active pipeline (excl. Bound/Lost).
  const pipeline = ALL_RENEWALS.filter(r => r.status !== "Bound" && r.status !== "Lost");
  const bucketCount = (w: WindowId) => pipeline.filter(r => inWindow(r.daysUntilExpiry, w)).length;
  const bucketExposure = (w: WindowId) =>
    pipeline.filter(r => inWindow(r.daysUntilExpiry, w)).reduce((s, r) => s + r.expiringPremium, 0);

  const windows: { id: WindowId; label: string; accent: string }[] = [
    { id: "all",     label: "All Renewals",    accent: N         },
    { id: "120d",    label: "Within 120 days", accent: "#005B99" },
    { id: "90d",     label: "Within 90 days",  accent: N         },
    { id: "60d",     label: "Within 60 days",  accent: G         },
    { id: "30d",     label: "Within 30 days",  accent: "#B45309" },
    { id: "overdue", label: "Overdue",         accent: "#B91C1C" },
  ];

  return (
    <AppShell activePage="renewals" role={role} onRoleChange={() => {}}>
      <div className="px-4 sm:px-6 lg:px-8 py-5 sm:py-7 space-y-5 sm:space-y-6"
        style={{ fontFamily: font, color: TD, minHeight: "100%", background: "#EEF1F6" }}>

        <PageRegister
          routeKey="page:renewals"
          title="Renewals"
          subtitle="Expiring book · retention forecast"
          greeting="Renewals workbench: 4 expiring in the next 30 days, 3 flagged at-risk. Want me to triage by window, surface the at-risk accounts, or pull the retention forecast?"
          suggestions={[
            { id: "expiring",   label: "Expiring this quarter",  tone: "blue",   icon: "Calendar" },
            { id: "atrisk",     label: "At-risk renewals",       tone: "red",    icon: "AlertTriangle" },
            { id: "forecast",   label: "Retention forecast",     tone: "violet", icon: "TrendingUp" },
            { id: "overdue",    label: "Overdue renewals",       tone: "gold",   icon: "Clock" },
          ]}
          respond={(sid) => {
            if (sid === "expiring") return [{ id: newId(), role: "agent", kind: "text", ts: now(),
              text: "Renewals expiring this quarter:\n• Brookfield Day School — Jun 1 ($142K quoted)\n• Riverside USD — Jul 1 ($112K)\n• Austin ISD — Aug 1 ($87K)\n• Seattle PS — Jul 1 ($231K, at risk)\n\nTotal: $572K · 3 still actionable." }];
            if (sid === "atrisk") return [{ id: newId(), role: "agent", kind: "viz", ts: now(), viz: {
              kind: "checklist", title: "At-risk renewals",
              items: [
                { ok: false, label: "Seattle Public Schools",     sub: "pricing pushback · broker exploring market" },
                { ok: false, label: "Phoenix Charter Academy",    sub: "appetite score 41 (below threshold)" },
                { ok: false, label: "Clark County School District", sub: "declined last year · re-considering" },
              ],
            } }];
            if (sid === "forecast") return [{ id: newId(), role: "agent", kind: "text", ts: now(),
              text: "Retention forecast (rolling 12-mo): Q1 87% · Q2 84% · Q3 81% (Seattle PS risk) · Q4 86%. Full-year ~84%. Push on the top 2 at-risk K-12 accounts to lift this back to 86%." }];
            if (sid === "overdue") return [{ id: newId(), role: "agent", kind: "text", ts: now(),
              text: "No overdue renewals right now. 2 are within 7 days of effective date — Brookfield and Seattle PS — both have outstanding broker actions. Want me to draft the broker pings?" }];
          }}
        />

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
              <h1 style={{ fontSize: "1.35rem", fontWeight: 800, color: "white", lineHeight: 1.2 }}>Renewals</h1>
              <p style={{ fontSize: "0.80rem", color: "rgba(255,255,255,0.6)", marginTop: 4 }}>
                {bucketCount("120d")} accounts renewing in next 120 days · {bucketCount("overdue")} overdue
              </p>
            </div>
            <PrimaryWhiteButton>
              <RefreshCw size={14}/>
              Sync Policy Book
            </PrimaryWhiteButton>
          </div>
        </div>

        {/* ── TIME-WINDOW BUCKETS (clickable filters) ───────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {windows.map(w => {
            const count = bucketCount(w.id);
            const sub = w.id === "all"
              ? `${fmt$(bucketExposure("all"))} exposure`
              : w.id === "overdue"
              ? "Past expiry"
              : `${fmt$(bucketExposure(w.id))} exposure`;
            return (
              <WindowBucket
                key={w.id}
                label={w.label}
                count={count}
                sub={sub}
                accent={w.accent}
                selected={windowFilter === w.id}
                onClick={() => { setWindowFilter(w.id); setPage(1); }}
              />
            );
          })}
        </div>

        {/* ── RENEWALS TABLE CARD ───────────────────────────────────────────── */}
        <div
          style={{
            background: "white",
            border: `1px solid ${BDL}`,
            borderTop: `3px solid ${N}`,
            borderRadius: 8,
            overflow: "hidden",
            boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
          }}>

          {/* Card header */}
          <div className="flex items-center justify-between px-5 py-3 flex-wrap gap-2"
            style={{ borderBottom: `1px solid ${BDL}`, background: "#FAFBFD" }}>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center"
                style={{ width: 24, height: 24, borderRadius: 6, background: `${N}12`, color: N }}>
                <Calendar size={13} />
              </span>
              <h3 style={{ fontSize: "0.74rem", fontWeight: 700, color: TD, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Renewal Pipeline
              </h3>
            </div>
            <span style={{
              fontSize: "0.68rem", fontWeight: 800, background: `${N}10`, color: N,
              padding: "2px 9px", borderRadius: 10, letterSpacing: "0.02em",
            }}>
              {filtered.length}
            </span>
          </div>

          {/* Toolbar */}
          <div className="flex items-center justify-between px-5 py-2.5 gap-3 flex-wrap"
            style={{ borderBottom: `1px solid ${BDL}` }}>
            <div className="flex items-center gap-1">
              {([
                { id: "upcoming" as const, label: "Upcoming",   count: counts.upcoming },
                { id: "mine" as const,     label: "My Renewals",count: counts.mine     },
                { id: "atrisk" as const,   label: "At Risk",    count: counts.atrisk   },
                { id: "bound" as const,    label: "Bound",      count: counts.bound    },
              ]).map(t => (
                <button key={t.id}
                  onClick={() => { setTab(t.id); setPage(1); }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 transition-all"
                  style={{
                    fontSize: "0.74rem", fontWeight: tab === t.id ? 700 : 500,
                    background: tab === t.id ? `${N}10` : "transparent",
                    color: tab === t.id ? N : TM,
                    border: "none", borderRadius: 6, cursor: "pointer", fontFamily: font,
                  }}>
                  {t.label}
                  {t.count > 0 && (
                    <span style={{
                      fontSize: "0.55rem", fontWeight: 800,
                      background: t.id === "atrisk" ? "#B91C1C" : tab === t.id ? N : "#E2E8F0",
                      color: t.id === "atrisk" || tab === t.id ? "white" : TM,
                      padding: "1px 6px", borderRadius: 8,
                    }}>{t.count}</span>
                  )}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Filter size={12} color={TT}/>
              <select
                value={statusFilter}
                onChange={e => { setStatusFilter(e.target.value as RenewalStatus | "All"); setPage(1); }}
                style={{
                  fontSize: "0.72rem", border: `1px solid ${BDL}`, borderRadius: 5,
                  padding: "6px 10px", color: TM, background: "white", fontFamily: font,
                  cursor: "pointer", outline: "none",
                }}>
                {(["All", "Not Started", "In Progress", "Quoted", "Bound", "At Risk", "Lost"] as const).map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full" style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#FAFBFD" }}>
                  {["Policy", "Account", "Product", "Expires", "Premium", "Loss Ratio", "Assignee", "Status", ""].map(h => (
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
                      No renewals match the current filters.
                    </td>
                  </tr>
                ) : paginated.map((r, idx) => {
                  const status = STATUS_STYLE[r.status];
                  const lrColor = r.lossRatio >= 100 ? "#B91C1C" : r.lossRatio >= 75 ? "#B45309" : "#15803D";
                  const dueColor =
                    r.daysUntilExpiry < 0  ? "#B91C1C" :
                    r.daysUntilExpiry <= 14 ? "#B45309" : TM;
                  const isLast = idx === paginated.length - 1;
                  return (
                    <tr key={r.id}
                      onClick={() => navigate(`/submission/${r.id}`)}
                      className="cursor-pointer hover:bg-slate-50 transition-colors group"
                      style={{ borderBottom: isLast ? "none" : `1px solid #EEF1F5` }}>
                      <td className="px-4 py-3">
                        <span style={{
                          fontSize: "0.72rem", fontWeight: 700, color: N,
                          fontFamily: "ui-monospace, monospace",
                        }} className="group-hover:underline">
                          {r.policyId}
                        </span>
                      </td>
                      <td className="px-4 py-3" style={{ maxWidth: 260 }}>
                        <p style={{ fontSize: "0.8rem", fontWeight: 600, color: TD, lineHeight: 1.35 }}>
                          {r.account}
                        </p>
                        <p style={{ fontSize: "0.64rem", color: TT, marginTop: 1 }}>
                          {r.state} · {r.broker}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <span style={{ fontSize: "0.72rem", color: TM, fontWeight: 500, whiteSpace: "nowrap" }}>
                          {r.product}
                        </span>
                      </td>
                      <td className="px-4 py-3" style={{ whiteSpace: "nowrap" }}>
                        <div className="inline-flex items-center gap-1.5">
                          {r.daysUntilExpiry < 0
                            ? <AlertCircle size={11} color="#B91C1C"/>
                            : r.daysUntilExpiry <= 14
                            ? <AlertTriangle size={11} color="#B45309"/>
                            : <Calendar size={11} color={TT}/>}
                          <span style={{
                            fontSize: "0.72rem", color: dueColor,
                            fontWeight: r.daysUntilExpiry <= 14 ? 700 : 500,
                          }}>
                            {r.expiringDate}
                          </span>
                        </div>
                        <p style={{ fontSize: "0.62rem", color: TT, marginTop: 2 }}>
                          {r.daysUntilExpiry < 0 ? `${Math.abs(r.daysUntilExpiry)}d overdue` : `${r.daysUntilExpiry}d left`}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <span style={{
                          fontSize: "0.78rem", fontWeight: 700, color: TD,
                          fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap",
                        }}>
                          {fmt$(r.expiringPremium)}
                        </span>
                      </td>
                      <td className="px-4 py-3" style={{ minWidth: 110 }}>
                        <div className="flex items-center gap-2">
                          <div style={{ flex: 1, height: 4, background: "#EEF1F5", minWidth: 50, borderRadius: 2, overflow: "hidden" }}>
                            <div style={{
                              height: "100%", width: `${Math.min(r.lossRatio, 100)}%`,
                              background: lrColor, borderRadius: 2,
                              transition: "width 0.4s ease",
                            }}/>
                          </div>
                          <span style={{
                            fontSize: "0.66rem", fontWeight: 800, color: lrColor,
                            whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums",
                          }}>
                            {r.lossRatio}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <span className="inline-flex items-center justify-center rounded-full shrink-0"
                            style={{
                              width: 22, height: 22,
                              background: `${N}15`, color: N,
                              fontSize: "0.55rem", fontWeight: 800,
                            }}>
                            {r.assigneeInitials}
                          </span>
                          <span style={{ fontSize: "0.72rem", color: TD, fontWeight: 500, whiteSpace: "nowrap" }}>
                            {r.assignee.split(" ")[0]}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5"
                          style={{
                            background: status.bg, padding: "2px 8px", borderRadius: 4,
                            whiteSpace: "nowrap",
                          }}>
                          <span style={{ width: 5, height: 5, borderRadius: "50%", background: status.color }}/>
                          <span style={{ fontSize: "0.66rem", fontWeight: 700, color: status.color }}>
                            {r.status}
                          </span>
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <ChevronRight size={13} color={BDL} className="transition-colors group-hover:text-blue-600"/>
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
              <span style={{ fontWeight: 700, color: N }}>{filtered.length}</span> renewals
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
