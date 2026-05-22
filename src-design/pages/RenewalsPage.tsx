import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar, RefreshCw, AlertCircle, AlertTriangle,
  ChevronRight, ChevronLeft, Filter,
  Activity, TrendingDown, FileCheck,
} from "lucide-react";
import { AppShell } from "../components/AppShell";
import type { RoleId } from "../components/AppShell";
import { useAuth } from "../context/AuthContext";
import { PrimaryWhiteButton } from "../components/DashboardCards";

const N   = "#0123D4";
const G   = "#C9A227";
const BDL = "#DCE3EC";
const TD  = "#1A2530";
const TM  = "#4A5D6E";
const TT  = "#5F7080";
const font = "'Source Sans 3', system-ui, sans-serif";

// ─── Health Metric tile (op-health strip — matches KPITile chrome) ──────────
function HealthMetric({
  label, value, sub, tone, icon, action, onClick,
}: {
  label: string; value: string | number; sub: string;
  tone: "red" | "amber" | "green";
  icon: React.ReactNode;
  action?: string;
  onClick?: () => void;
}) {
  const accent =
    tone === "red"   ? "#B91C1C" :
    tone === "amber" ? "#B45309" : "#15803D";
  const interactive = !!onClick;
  const [hovered, setHovered] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!interactive}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      aria-label={`${label}: ${value}, ${sub}`}
      style={{
        textAlign: "left", width: "100%", fontFamily: font,
        background: hovered
          ? `linear-gradient(135deg, white 0%, ${accent}08 100%)`
          : "white",
        border: `1px solid ${hovered ? `${accent}40` : BDL}`,
        borderRadius: 10,
        padding: "14px 16px",
        boxShadow: hovered
          ? `0 2px 6px ${accent}14, 0 1px 2px rgba(15,23,42,0.04)`
          : "0 1px 2px rgba(15,23,42,0.04)",
        transform: hovered && interactive ? "translateY(-1px)" : "translateY(0)",
        transition: "background 0.2s ease, border-color 0.2s ease, box-shadow 0.25s ease, transform 0.2s ease",
        position: "relative", overflow: "hidden", outline: "none",
        cursor: interactive ? "pointer" : "default",
      }}
    >
      {/* Top accent strip — matches KPITile chrome */}
      <span aria-hidden style={{
        position: "absolute", inset: "0 0 auto 0",
        height: hovered ? 4 : 3,
        background: hovered ? accent : `linear-gradient(90deg, ${accent}, ${accent}66)`,
        transition: "height 0.2s ease, background 0.2s ease",
      }}/>
      <div className="flex items-start justify-between gap-2">
        <p style={{
          fontSize: "0.6rem", fontWeight: 700, color: TT,
          textTransform: "uppercase", letterSpacing: "0.09em", lineHeight: 1.3,
        }}>
          {label}
        </p>
        <span className="inline-flex items-center justify-center"
          style={{
            width: 30, height: 30, borderRadius: 8,
            background: hovered ? `${accent}1F` : `${accent}10`,
            color: accent,
            transform: hovered ? "scale(1.08)" : "scale(1)",
            transition: "background 0.2s ease, transform 0.2s ease",
          }}>
          {icon}
        </span>
      </div>
      <p style={{
        fontSize: "1.7rem", fontWeight: 800,
        color: hovered ? accent : TD,
        lineHeight: 1.1, marginTop: 6,
        fontVariantNumeric: "tabular-nums",
        transition: "color 0.2s ease",
      }}>
        {value}
      </p>
      <div className="inline-flex items-center gap-1 mt-2"
        style={{ fontSize: "0.66rem", color: TT, fontWeight: 600 }}>
        <span>{sub}</span>
      </div>
      {action && (
        <p style={{
          fontSize: "0.66rem", color: accent, marginTop: 4,
          fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 3,
        }}>
          {action}
          {interactive && <ChevronRight size={11}/>}
        </p>
      )}
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

  const windows: { id: WindowId; label: string; accent: string }[] = [
    { id: "all",     label: "All Renewals",    accent: N         },
    { id: "120d",    label: "Within 120 days", accent: "#005B99" },
    { id: "90d",     label: "Within 90 days",  accent: N         },
    { id: "60d",     label: "Within 60 days",  accent: G         },
    { id: "30d",     label: "Within 30 days",  accent: "#B45309" },
    { id: "overdue", label: "Overdue",         accent: "#B91C1C" },
  ];

  // ── Operational health metrics — derived from the active pipeline (excl. Bound/Lost) ──
  const overduePipe   = pipeline.filter(r => r.daysUntilExpiry < 0);
  const atRiskPipe    = pipeline.filter(r => r.status === "At Risk");
  const highLRPipe    = pipeline.filter(r => r.lossRatio >= 100);
  const within60      = pipeline.filter(r => r.daysUntilExpiry >= 0 && r.daysUntilExpiry <= 60);
  const within60Quoted = within60.filter(r => r.status === "Quoted").length;
  const quoteCoverage = within60.length > 0
    ? Math.round((within60Quoted / within60.length) * 100)
    : 0;
  const QUOTE_TARGET  = 70;

  const overdueExposure = overduePipe.reduce((s, r) => s + r.expiringPremium, 0);
  const atRiskExposure  = atRiskPipe.reduce((s, r) => s + r.expiringPremium, 0);
  const highLRExposure  = highLRPipe.reduce((s, r) => s + r.expiringPremium, 0);
  const totalAtRisk     = overdueExposure + atRiskExposure;

  return (
    <AppShell activePage="renewals" role={role} onRoleChange={() => {}}>
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
              <h1 style={{ fontSize: "1.35rem", fontWeight: 800, color: "white", lineHeight: 1.2 }}>Renewals</h1>
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, marginTop: 8 }}>
                {overduePipe.length > 0 && (
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: 5,
                    background: "rgba(239,68,68,0.22)",
                    border: "1px solid rgba(254,202,202,0.5)",
                    padding: "3px 10px", borderRadius: 9999,
                    fontSize: "0.66rem", fontWeight: 800, color: "#FFD9D9",
                    textTransform: "uppercase", letterSpacing: "0.06em",
                  }}>
                    <AlertCircle size={11}/> {overduePipe.length} Overdue
                  </span>
                )}
                {atRiskPipe.length > 0 && (
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: 5,
                    background: "rgba(251,146,60,0.22)",
                    border: "1px solid rgba(254,215,170,0.5)",
                    padding: "3px 10px", borderRadius: 9999,
                    fontSize: "0.66rem", fontWeight: 800, color: "#FFE0B5",
                    textTransform: "uppercase", letterSpacing: "0.06em",
                  }}>
                    <AlertTriangle size={11}/> {atRiskPipe.length} At Risk
                  </span>
                )}
                <span style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.72)" }}>
                  {bucketCount("120d")} renewing in 120 days
                  {totalAtRisk > 0 && (
                    <> · <span style={{ color: "#FFD9D9", fontWeight: 700 }}>{fmt$(totalAtRisk)} at risk</span></>
                  )}
                </span>
              </div>
            </div>
            <PrimaryWhiteButton>
              <RefreshCw size={14}/>
              Sync Policy Book
            </PrimaryWhiteButton>
          </div>
        </div>

        {/* ── OPERATIONAL HEALTH STRIP ──────────────────────────────────────── */}
        {/* Action-oriented risk surface: each tile is a "you need to look at this"
            signal, separate from the time-window filters below (which slice the
            same pipeline by remaining-days). Cards with a meaningful filter map
            to setting that filter so the table jumps to the matching subset. */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <HealthMetric
            tone="red"
            icon={<AlertCircle size={14}/>}
            label="Overdue"
            value={overduePipe.length}
            sub={overduePipe.length > 0 ? `${fmt$(overdueExposure)} past expiry` : "None"}
            action={overduePipe.length > 0 ? "Triage now" : undefined}
          />
          <HealthMetric
            tone="red"
            icon={<AlertTriangle size={14}/>}
            label="At-Risk Exposure"
            value={fmt$(atRiskExposure)}
            sub={`${atRiskPipe.length} ${atRiskPipe.length === 1 ? "policy" : "policies"}`}
            action={atRiskPipe.length > 0 ? "Escalate / re-engage" : undefined}
          />
          <HealthMetric
            tone={highLRPipe.length > 0 ? "amber" : "green"}
            icon={<TrendingDown size={14}/>}
            label="Loss Ratio > 100%"
            value={highLRPipe.length}
            sub={highLRPipe.length > 0 ? `${fmt$(highLRExposure)} to reprice` : "Book is healthy"}
            action={highLRPipe.length > 0 ? "Reprice with care" : undefined}
          />
          <HealthMetric
            tone={quoteCoverage >= QUOTE_TARGET ? "green" : quoteCoverage >= 50 ? "amber" : "red"}
            icon={<FileCheck size={14}/>}
            label="Quote Coverage · <60d"
            value={`${quoteCoverage}%`}
            sub={`${within60Quoted} of ${within60.length} quoted`}
            action={quoteCoverage >= QUOTE_TARGET ? "On track" : `Target ${QUOTE_TARGET}% — behind`}
          />
        </div>

        {/* ── TIME-WINDOW FILTER PILLS ──────────────────────────────────────── */}
        {/* Compact filter row — the big KPI tiles above already surface the
            critical signals; this is just a time-slice filter, not a stat. */}
        <div className="flex items-center gap-2 flex-wrap">
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            fontSize: "0.60rem", fontWeight: 700, color: TT,
            textTransform: "uppercase", letterSpacing: "0.07em",
          }}>
            <Calendar size={11}/> Window
          </span>
          {windows.map(w => {
            const count  = bucketCount(w.id);
            const active = windowFilter === w.id;
            const accent = w.accent;
            return (
              <button
                key={w.id}
                type="button"
                onClick={() => { setWindowFilter(w.id); setPage(1); }}
                aria-pressed={active}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  padding: "5px 11px",
                  background: active ? `${accent}10` : "white",
                  color: active ? accent : TM,
                  border: `1px solid ${active ? `${accent}55` : BDL}`,
                  borderRadius: 9999,
                  fontSize: "0.74rem", fontWeight: active ? 700 : 500,
                  cursor: "pointer", fontFamily: font, outline: "none",
                  transition: "background 0.15s ease, border-color 0.15s ease, color 0.15s ease",
                }}
                onMouseEnter={e => {
                  if (!active) (e.currentTarget as HTMLElement).style.borderColor = `${accent}55`;
                }}
                onMouseLeave={e => {
                  if (!active) (e.currentTarget as HTMLElement).style.borderColor = BDL;
                }}
              >
                {w.label}
                <span style={{
                  fontSize: "0.58rem", fontWeight: 800,
                  background: w.id === "overdue" ? "#B91C1C" : active ? accent : "#E2E8F0",
                  color:      w.id === "overdue" || active ? "white" : TM,
                  padding: "1px 7px", borderRadius: 9999,
                  fontVariantNumeric: "tabular-nums",
                }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── RENEWALS TABLE CARD ───────────────────────────────────────────── */}
        <div
          style={{
            background: "white",
            border: `1px solid ${BDL}`,
            borderRadius: 8,
            overflow: "hidden",
            boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
          }}>

          {/* Card header — surfaces the filtered slice's exposure & risk mix */}
          {(() => {
            const filteredExposure = filtered.reduce((s, r) => s + r.expiringPremium, 0);
            const filteredCritical = filtered.filter(r =>
              r.daysUntilExpiry < 0 || r.status === "At Risk" || r.lossRatio >= 100
            ).length;
            return (
              <div className="flex items-center justify-between px-5 py-3 flex-wrap gap-2"
                style={{ borderBottom: `1px solid ${BDL}`, background: "#FAFBFD" }}>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center"
                    style={{ width: 24, height: 24, borderRadius: 6, background: `${N}12`, color: N }}>
                    <Calendar size={13} />
                  </span>
                  <h3 style={{ fontSize: "0.86rem", fontWeight: 700, color: TD, letterSpacing: "-0.005em" }}>
                    Renewal Pipeline
                  </h3>
                  <span style={{ fontSize: "0.70rem", color: TT }}>
                    · {fmt$(filteredExposure)} exposure
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {filteredCritical > 0 && (
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: 4,
                      fontSize: "0.62rem", fontWeight: 800,
                      background: "#FEE2E2", color: "#B91C1C",
                      padding: "2px 9px", borderRadius: 9999,
                      textTransform: "uppercase", letterSpacing: "0.05em",
                    }}>
                      <Activity size={10}/> {filteredCritical} critical
                    </span>
                  )}
                  <span style={{
                    fontSize: "0.68rem", fontWeight: 800, background: `${N}10`, color: N,
                    padding: "2px 9px", borderRadius: 10, letterSpacing: "0.02em",
                  }}>
                    {filtered.length}
                  </span>
                </div>
              </div>
            );
          })()}

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
                  // Row-level urgency rail: red when overdue / At Risk / loss-ratio >=100,
                  // amber when expiring within 14d or loss-ratio >= 75.
                  const isCritical =
                    r.daysUntilExpiry < 0 || r.status === "At Risk" || r.lossRatio >= 100;
                  const isWarning  =
                    !isCritical && (r.daysUntilExpiry <= 14 || r.lossRatio >= 75);
                  const railColor  = isCritical ? "#B91C1C" : isWarning ? "#B45309" : "transparent";
                  // At-Risk / overdue rows get a subtle red wash so they pop while scanning.
                  const rowTint    = r.status === "At Risk" ? "#FFF6F6"
                                   : r.daysUntilExpiry < 0  ? "#FFFAFA" : undefined;
                  const isLast = idx === paginated.length - 1;
                  return (
                    <tr key={r.id}
                      onClick={() => navigate(`/submission/${r.id}`)}
                      className="cursor-pointer hover:bg-[#F0F6FF] transition-colors group"
                      style={{
                        borderBottom: isLast ? "none" : `1px solid #EEF1F5`,
                        background: rowTint,
                      }}>
                      <td className="px-4 py-3"
                        style={{ borderLeft: `3px solid ${railColor}` }}>
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
                        {r.daysUntilExpiry < 0 ? (
                          <span style={{
                            display:"inline-block", marginTop:2,
                            background:"#FEE2E2", color:"#7A1F1F",
                            padding:"1px 6px", borderRadius:9,
                            fontSize:"0.52rem", fontWeight:800,
                            textTransform:"uppercase", letterSpacing:"0.05em",
                          }}>
                            Overdue · {Math.abs(r.daysUntilExpiry)}d
                          </span>
                        ) : r.daysUntilExpiry <= 14 ? (
                          <span style={{
                            display:"inline-block", marginTop:2,
                            background:"#FEF3C7", color:"#92400E",
                            padding:"1px 6px", borderRadius:9,
                            fontSize:"0.52rem", fontWeight:800,
                            textTransform:"uppercase", letterSpacing:"0.05em",
                          }}>
                            Due in {r.daysUntilExpiry}d
                          </span>
                        ) : (
                          <p style={{ fontSize: "0.62rem", color: TT, marginTop: 2 }}>
                            {r.daysUntilExpiry}d left
                          </p>
                        )}
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
                        {r.status === "At Risk" || r.status === "Lost" ? (
                          <span className="inline-flex items-center gap-1.5"
                            style={{
                              background: status.bg, padding: "2px 8px", borderRadius: 9999,
                              whiteSpace: "nowrap",
                            }}>
                            <span style={{ width: 5, height: 5, borderRadius: "50%", background: status.color }}/>
                            <span style={{ fontSize: "0.66rem", fontWeight: 700, color: status.color }}>
                              {r.status}
                            </span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5" style={{ whiteSpace: "nowrap" }}>
                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: status.color }}/>
                            <span style={{ fontSize: "0.72rem", fontWeight: 500, color: status.color }}>
                              {r.status}
                            </span>
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <ChevronRight size={15} color={TT} className="transition-all group-hover:text-blue-600 group-hover:translate-x-0.5"/>
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
            <span style={{ fontSize: "0.78rem", color: TM }}>
              <span style={{ fontWeight: 700, color: TD }}>{filtered.length === 0 ? 0 : (page - 1) * PER_PAGE + 1}</span>
              {"–"}
              <span style={{ fontWeight: 700, color: TD }}>{Math.min(page * PER_PAGE, filtered.length)}</span>
              {" of "}
              <span style={{ fontWeight: 700, color: TD }}>{filtered.length}</span> renewals
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
