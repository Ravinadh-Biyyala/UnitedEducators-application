import { useState } from "react";
import {
  ShieldCheck, AlertTriangle, XCircle, CheckCircle2,
  Settings, Lock, Info, ChevronRight, Target,
  Sliders, AlertCircle, Edit2, Eye,
} from "lucide-react";
import { AppShell } from "../components/AppShell";
import type { RoleId } from "../components/AppShell";
import { useAuth } from "../context/AuthContext";

const N   = "#0123D4";
const G   = "#C9A227";
const TH  = "#F0F3F8";
const BD  = "#C4CDD8";
const BDL = "#DCE3EC";
const TD  = "#1A2530";
const TM  = "#4A5D6E";
const TT  = "#7A8FA3";
const font = "'Source Sans 3', system-ui, sans-serif";

type RuleStatus = "In Appetite" | "Watch" | "Out of Appetite";

interface AppetiteRule {
  id: string;
  category: string;
  rule: string;
  threshold: string;
  currentValue: string;
  status: RuleStatus;
  weight: number;
  editable: boolean;
  note?: string;
}

const RULES: AppetiteRule[] = [
  // Loss ratio rules
  { id: "R01", category: "Loss Performance", rule: "5-Year Avg. Loss Ratio",       threshold: "≤ 65%",           currentValue: "54%",             status: "In Appetite",    weight: 20, editable: true  },
  { id: "R02", category: "Loss Performance", rule: "Single-Year Loss Ratio Cap",   threshold: "≤ 80%",           currentValue: "30% (2021 peak)", status: "In Appetite",    weight: 10, editable: true  },
  { id: "R03", category: "Loss Performance", rule: "Open Litigation Claims",        threshold: "≤ 3 active",      currentValue: "2 active",        status: "In Appetite",    weight: 8,  editable: false },
  // Institution type
  { id: "R04", category: "Institution Type", rule: "Eligible Entity Types",         threshold: "K-12, Higher Ed, Charter, Private (SIC 8211–8299)", currentValue: "K-12 Public (SIC 8211)", status: "In Appetite", weight: 15, editable: false },
  { id: "R05", category: "Institution Type", rule: "Charter Schools – Max Accounts",threshold: "≤ 8 per portfolio",currentValue: "5 accounts",     status: "In Appetite",    weight: 5,  editable: true  },
  // Exposure
  { id: "R06", category: "Exposure Limits",  rule: "Max Single-Account TIV",        threshold: "≤ $500M",         currentValue: "$412M",           status: "In Appetite",    weight: 12, editable: true  },
  { id: "R07", category: "Exposure Limits",  rule: "Max Per-State TIV Concentration",threshold: "≤ 40% of portfolio", currentValue: "CA: 34%",      status: "In Appetite",    weight: 8,  editable: true  },
  { id: "R08", category: "Exposure Limits",  rule: "Named Perils Aggregation Limit", threshold: "≤ $1.5B",         currentValue: "$908M (61%)",    status: "In Appetite",    weight: 10, editable: false, note: "Approaching 65% threshold — monitor" },
  // Safety
  { id: "R09", category: "Safety Standards", rule: "Min. Campus Safety Rating",     threshold: "≥ 60/100",        currentValue: "88/100",          status: "In Appetite",    weight: 7,  editable: true  },
  { id: "R10", category: "Safety Standards", rule: "Active Shooter Protocol Required",threshold: "Must have",      currentValue: "Confirmed",       status: "In Appetite",    weight: 5,  editable: false },
  // Ineligible
  { id: "R11", category: "Ineligible Risks", rule: "Accounts with Active EPA/Env. Violations", threshold: "None permitted", currentValue: "None on file", status: "In Appetite", weight: 0, editable: false },
  { id: "R12", category: "Ineligible Risks", rule: "Prior Coverage Declines (2 yrs)", threshold: "None permitted", currentValue: "None on file",   status: "In Appetite",    weight: 0,  editable: false },
  // Authority
  { id: "R13", category: "Authority Limits", rule: "UW Bind Authority (TIV)",       threshold: "≤ $300M (UW), ≤ $600M (Sr. UW), Unlimited (Mgr.)", currentValue: "$412M — requires Sr. UW approval", status: "Watch", weight: 0, editable: true, note: "Current submission at authority limit for Underwriter — must be handled by Sr. UW" },
  { id: "R14", category: "Authority Limits", rule: "Single Policy Premium Cap",      threshold: "≤ $1M (UW), ≤ $3M (Sr. UW)",   currentValue: "$112K (within range)", status: "In Appetite", weight: 0, editable: true },
];

const SCORE_COMPONENTS = [
  { label: "Loss History & Performance",   score: 88, weight: 30, color: "#2E7D32" },
  { label: "Institution Type & Eligibility",score: 95, weight: 20, color: "#2E7D32" },
  { label: "Exposure & TIV",               score: 82, weight: 18, color: "#2E7D32" },
  { label: "Safety & Risk Management",     score: 91, weight: 15, color: "#2E7D32" },
  { label: "Financial Stability",          score: 74, weight: 10, color: G         },
  { label: "Broker Relationship",          score: 88, weight: 7,  color: "#2E7D32" },
];

const statusStyle = (s: RuleStatus) => ({
  "In Appetite": { bg: "#E8F5EC", text: "#1A5C30", border: "#93C8A0", dot: "#2E7D32", icon: <CheckCircle2 size={12} color="#2E7D32" /> },
  "Watch":       { bg: "#FFF8E6", text: "#8A5C00", border: "#F0D88A", dot: G,          icon: <AlertTriangle size={12} color={G} />       },
  "Out of Appetite":{ bg: "#FBEAEA", text: "#7A1F1F", border: "#E8A8A8", dot: "#B91C1C", icon: <XCircle size={12} color="#B91C1C" />    },
}[s]);

const categories = [...new Set(RULES.map(r => r.category))];

function SectionCard({ title, icon, accent = N, action, children, noPad = false }: {
  title: string; icon?: React.ReactNode; accent?: string;
  action?: React.ReactNode; children: React.ReactNode; noPad?: boolean;
}) {
  return (
    <div style={{ background: "white", border: `1px solid ${BD}`, borderTop: `3px solid ${accent}` }}>
      <div className="flex items-center justify-between px-5 py-3.5 flex-wrap gap-2"
        style={{ borderBottom: `1px solid ${BDL}`, background: TH }}>
        <div className="flex items-center gap-2">
          {icon && <span style={{ color: accent }}>{icon}</span>}
          <h3 style={{ fontSize: "0.72rem", fontWeight: 700, color: N, textTransform: "uppercase", letterSpacing: "0.08em" }}>{title}</h3>
        </div>
        {action}
      </div>
      {noPad ? children : <div className="p-5">{children}</div>}
    </div>
  );
}

export function AppetitePage() {
  const { user } = useAuth();
  const role: RoleId = user?.roleId ?? "sr-uw";
  const isAdmin = user?.appRole === "admin" || user?.appRole === "uw_manager";
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [viewMode, setViewMode]             = useState<"rules" | "scoring">("rules");

  const overall = Math.round(
    SCORE_COMPONENTS.reduce((sum, c) => sum + c.score * (c.weight / 100), 0)
  );

  const filteredRules = activeCategory === "All"
    ? RULES
    : RULES.filter(r => r.category === activeCategory);

  const inAppetite   = filteredRules.filter(r => r.status === "In Appetite").length;
  const watch        = filteredRules.filter(r => r.status === "Watch").length;
  const outOfAppetite = filteredRules.filter(r => r.status === "Out of Appetite").length;

  return (
    <AppShell activePage="appetite" role={role} onRoleChange={() => {}}>
      <div style={{ fontFamily: font, color: TD }}>

        {/* Page header */}
        <div style={{ background: N }}>
          <div style={{ height: 4, background: `linear-gradient(90deg,${G} 0%,#A8841C 100%)` }} />
          <div className="px-4 sm:px-8 py-4 sm:py-5 flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 style={{ fontSize: "1.35rem", fontWeight: 800, color: "white", lineHeight: 1.2 }}>Appetite & Rules</h1>
              <p style={{ fontSize: "0.80rem", color: "rgba(255,255,255,0.5)", marginTop: 4 }}>
                Configurable underwriting appetite rules · Score model · Authority limits
              </p>
            </div>
            <div className="flex items-center gap-2">
              {isAdmin ? (
                <button className="flex items-center gap-2 px-4 py-2 hover:brightness-95 transition-all"
                  style={{ background: G, color: "white", fontSize: "0.78rem", fontWeight: 700 }}>
                  <Edit2 size={13} /> Edit Rules
                </button>
              ) : (
                <div className="flex items-center gap-2 px-3 py-2"
                  style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)" }}>
                  <Lock size={12} color="rgba(255,255,255,0.6)" />
                  <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.6)" }}>View only — Admin required to edit</span>
                </div>
              )}
            </div>
          </div>

          {/* Summary strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4" style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
            {[
              { label: "Overall Appetite Score", value: `${overall}/100`,       color: "white" },
              { label: "Rules In Appetite",       value: `${RULES.filter(r => r.status === "In Appetite").length}/${RULES.length}`, color: "white" },
              { label: "Watch Flags",             value: RULES.filter(r => r.status === "Watch").length,                            color: "white" },
              { label: "Out of Appetite",         value: RULES.filter(r => r.status === "Out of Appetite").length,                  color: "white" },
            ].map((s, i) => (
              <div key={i} className="px-5 sm:px-6 py-3 flex flex-col gap-0.5"
                style={{ borderRight: "1px solid rgba(255,255,255,0.1)" }}>
                <span style={{ fontSize: "0.58rem", fontWeight: 600, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: "0.1em" }}>{s.label}</span>
                <span style={{ fontSize: "1.20rem", fontWeight: 800, color: s.color as string, lineHeight: 1.2 }}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="px-4 sm:px-6 lg:px-8 py-5 space-y-5" style={{ background: "#EEF1F6" }}>

          {/* View toggle + category filter */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-1">
              {([{ id: "rules" as const, label: "Appetite Rules", icon: <ShieldCheck size={12}/> }, { id: "scoring" as const, label: "Score Model", icon: <Sliders size={12}/> }]).map(v => (
                <button key={v.id} onClick={() => setViewMode(v.id)}
                  className="flex items-center gap-1.5 px-4 py-2 transition-all"
                  style={{ background: viewMode === v.id ? N : "white", color: viewMode === v.id ? "white" : TM, border: `1px solid ${viewMode === v.id ? N : BD}`, fontSize: "0.78rem", fontWeight: 600 }}>
                  {v.icon}{v.label}
                </button>
              ))}
            </div>
            {viewMode === "rules" && (
              <div className="flex items-center gap-1.5 flex-wrap">
                {["All", ...categories].map(cat => (
                  <button key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className="px-3 py-1.5 transition-all"
                    style={{ fontSize: "0.68rem", fontWeight: activeCategory === cat ? 700 : 500, background: activeCategory === cat ? N : "white", color: activeCategory === cat ? "white" : TM, border: `1px solid ${activeCategory === cat ? N : BDL}` }}>
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Rules view */}
          {viewMode === "rules" && (
            <SectionCard
              title={`Appetite Rules${activeCategory !== "All" ? ` — ${activeCategory}` : ""}`}
              icon={<ShieldCheck size={13} />}
              accent={N}
              noPad
              action={
                <div className="flex items-center gap-3">
                  <span style={{ fontSize: "0.68rem", color: TT }}>
                    <span style={{ color: "#2E7D32", fontWeight: 700 }}>{inAppetite}</span> OK ·{" "}
                    <span style={{ color: "#B45309", fontWeight: 700 }}>{watch}</span> Watch ·{" "}
                    <span style={{ color: "#B91C1C", fontWeight: 700 }}>{outOfAppetite}</span> Out
                  </span>
                </div>
              }
            >
              {categories.filter(cat => activeCategory === "All" || cat === activeCategory).map(cat => (
                <div key={cat}>
                  {/* Category header */}
                  <div className="px-5 py-2.5 flex items-center gap-2"
                    style={{ background: `${N}08`, borderBottom: `1px solid ${BDL}` }}>
                    <span style={{ fontSize: "0.62rem", fontWeight: 800, color: N, textTransform: "uppercase", letterSpacing: "0.1em" }}>{cat}</span>
                  </div>
                  {filteredRules.filter(r => r.category === cat).map((rule, i, arr) => {
                    const ss = statusStyle(rule.status);
                    return (
                      <div key={rule.id}
                        className="hover:bg-slate-50/60 transition-colors"
                        style={{ borderBottom: i < arr.filter(r => r.category === cat).length - 1 ? `1px solid ${BDL}` : `2px solid ${BDL}` }}>
                        <div className="px-5 py-4">
                          <div className="flex items-start justify-between gap-4 flex-wrap">
                            {/* Left */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span style={{ fontSize: "0.62rem", fontWeight: 700, color: TT, fontFamily: "monospace" }}>{rule.id}</span>
                                <span style={{ fontSize: "0.82rem", fontWeight: 600, color: TD }}>{rule.rule}</span>
                                {rule.weight > 0 && (
                                  <span style={{ fontSize: "0.60rem", color: N, background: `${N}10`, border: `1px solid ${N}25`, padding: "1px 5px", fontWeight: 700 }}>
                                    Weight: {rule.weight}%
                                  </span>
                                )}
                                {isAdmin && rule.editable
                                  ? <span style={{ fontSize: "0.60rem", color: "#2E7D32", display: "flex", alignItems: "center", gap: 3 }}><Edit2 size={9}/> Configurable</span>
                                  : <span style={{ fontSize: "0.60rem", color: TT, display: "flex", alignItems: "center", gap: 3 }}><Lock size={9}/> System</span>
                                }
                              </div>
                              <div className="flex items-center gap-4 flex-wrap">
                                <div>
                                  <span style={{ fontSize: "0.60rem", color: TT, textTransform: "uppercase", letterSpacing: "0.07em", fontWeight: 600 }}>Threshold: </span>
                                  <span style={{ fontSize: "0.72rem", color: TM, fontWeight: 500 }}>{rule.threshold}</span>
                                </div>
                                <div>
                                  <span style={{ fontSize: "0.60rem", color: TT, textTransform: "uppercase", letterSpacing: "0.07em", fontWeight: 600 }}>Current: </span>
                                  <span style={{ fontSize: "0.72rem", color: TD, fontWeight: 700 }}>{rule.currentValue}</span>
                                </div>
                              </div>
                              {rule.note && (
                                <div className="flex items-start gap-1.5 mt-2 px-3 py-2"
                                  style={{ background: "#FFF8E6", border: "1px solid #F0D88A" }}>
                                  <Info size={11} color="#B45309" style={{ flexShrink: 0, marginTop: 1 }} />
                                  <span style={{ fontSize: "0.70rem", color: "#7A4800" }}>{rule.note}</span>
                                </div>
                              )}
                            </div>
                            {/* Status badge */}
                            <div className="flex items-center gap-1.5 px-3 py-1.5 shrink-0"
                              style={{ background: ss.bg, border: `1px solid ${ss.border}` }}>
                              {ss.icon}
                              <span style={{ fontSize: "0.66rem", fontWeight: 700, color: ss.text }}>{rule.status}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </SectionCard>
          )}

          {/* Score model view */}
          {viewMode === "scoring" && (
            <div className="space-y-5">
              {/* Overall score */}
              <SectionCard title="Appetite Score Model" icon={<Target size={13} />} accent={G}>
                <div className="flex items-center gap-8 flex-wrap">
                  {/* Score ring */}
                  <div className="flex flex-col items-center shrink-0">
                    <div className="flex items-center justify-center"
                      style={{ width: 100, height: 100, border: `8px solid ${N}`, background: `${N}0A` }}>
                      <div className="text-center">
                        <p style={{ fontSize: "1.8rem", fontWeight: 900, color: N, lineHeight: 1 }}>{overall}</p>
                        <p style={{ fontSize: "0.60rem", color: TT, fontWeight: 600 }}>/ 100</p>
                      </div>
                    </div>
                    <div className="mt-3 px-3 py-1"
                      style={{ background: "#E8F5EC", border: "1px solid #93C8A0" }}>
                      <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "#1A5C30" }}>✓ In Appetite</span>
                    </div>
                  </div>

                  {/* Score components */}
                  <div className="flex-1 space-y-3 min-w-0">
                    {SCORE_COMPONENTS.map((c, i) => (
                      <div key={i}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span style={{ fontSize: "0.78rem", color: TM, fontWeight: 500 }}>{c.label}</span>
                            <span style={{ fontSize: "0.60rem", color: TT }}>({c.weight}% weight)</span>
                          </div>
                          <span style={{ fontSize: "0.78rem", fontWeight: 700, color: c.color }}>{c.score}/100</span>
                        </div>
                        <div style={{ height: 7, background: BDL }}>
                          <div style={{ height: "100%", width: `${c.score}%`, background: c.color, transition: "width 0.6s ease" }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Scoring note */}
                <div className="mt-5 flex items-start gap-2 px-4 py-3"
                  style={{ background: `${N}08`, border: `1px solid ${N}20` }}>
                  <Settings size={13} color={N} style={{ flexShrink: 0, marginTop: 2 }} />
                  <p style={{ fontSize: "0.72rem", color: TM, lineHeight: 1.6 }}>
                    Appetite scores are calculated automatically at submission intake using a weighted model. Score thresholds:{" "}
                    <strong style={{ color: "#2E7D32" }}>≥ 80 — In Appetite</strong>,{" "}
                    <strong style={{ color: "#B45309" }}>60–79 — Watch / Refer</strong>,{" "}
                    <strong style={{ color: "#B91C1C" }}>&lt; 60 — Out of Appetite</strong>.
                    Configurable for scoring weights only (Phase 1). New rule creation requires system configuration.
                  </p>
                </div>
              </SectionCard>

              {/* Authority limits */}
              <SectionCard title="Authority Management — Bind Limits by Role" icon={<Lock size={13} />} accent="#B45309">
                <div className="overflow-x-auto">
                  <table className="w-full" style={{ borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: TH }}>
                        {["Role", "TIV Limit", "Single Premium Cap", "Referral Required Above", "Notes"].map(h => (
                          <th key={h} className="px-5 py-3 text-left"
                            style={{ fontSize: "0.60rem", fontWeight: 700, color: TT, textTransform: "uppercase", letterSpacing: "0.08em", borderBottom: `1px solid ${BDL}` }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { role: "Underwriter (UW)",          tiv: "$300M",  prem: "$1M",        refer: "TIV > $300M",    note: "Must escalate to Sr. UW" },
                        { role: "Sr. Underwriter (Sr. UW)",  tiv: "$600M",  prem: "$3M",        refer: "TIV > $600M",    note: "Must escalate to UW Manager" },
                        { role: "UW Manager",                tiv: "$1.5B",  prem: "$10M",       refer: "TIV > $1.5B",    note: "Escalate to Director" },
                        { role: "Director / Executive",      tiv: "Unlimited", prem: "Unlimited",refer: "None",           note: "Full authority" },
                      ].map((row, i) => (
                        <tr key={i} className="hover:bg-slate-50/60 transition-colors"
                          style={{ borderBottom: `1px solid ${BDL}` }}>
                          <td className="px-5 py-3" style={{ fontSize: "0.80rem", fontWeight: 600, color: TD }}>{row.role}</td>
                          <td className="px-5 py-3" style={{ fontSize: "0.80rem", fontWeight: 700, color: N }}>{row.tiv}</td>
                          <td className="px-5 py-3" style={{ fontSize: "0.80rem", fontWeight: 600, color: TM }}>{row.prem}</td>
                          <td className="px-5 py-3" style={{ fontSize: "0.78rem", color: "#B45309", fontWeight: 600 }}>{row.refer}</td>
                          <td className="px-5 py-3" style={{ fontSize: "0.72rem", color: TT }}>{row.note}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </SectionCard>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}