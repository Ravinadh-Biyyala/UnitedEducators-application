import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, PieChart, Pie, Cell, LineChart, Line, Legend,
} from "recharts";
import {
  DollarSign, TrendingUp, ShieldCheck, Activity,
  Award, AlertTriangle, ChevronRight, ArrowUpRight, Target,
  BarChart2, Globe, Building2,
} from "lucide-react";
import { AppShell } from "../components/AppShell";
import type { RoleId } from "../components/AppShell";
import { useAuth } from "../context/AuthContext";
import { PageRegister } from "../components/companion/PageRegister";
import { PinnedDashboard } from "../components/companion/PinnedDashboard";
import { newId, now } from "../components/companion/CompanionContext";
import type { Suggestion, CompanionMsg } from "../components/companion/CompanionContext";

const N   = "#0123D4";
const G   = "#C9A227";
const TH  = "#F0F3F8";
const BD  = "#C4CDD8";
const BDL = "#DCE3EC";
const TD  = "#1A2530";
const TM  = "#4A5D6E";
const TT  = "#5F7080";
const font = "'Source Sans 3', system-ui, sans-serif";

// ── Mock data ────────────────────────────────────────────────────────────────
const PREMIUM_TREND = [
  { month: "Oct", written: 1.2, earned: 1.1, target: 1.4 },
  { month: "Nov", written: 1.5, earned: 1.3, target: 1.4 },
  { month: "Dec", written: 1.1, earned: 1.4, target: 1.4 },
  { month: "Jan", written: 1.8, earned: 1.5, target: 1.5 },
  { month: "Feb", written: 2.1, earned: 1.7, target: 1.5 },
  { month: "Mar", written: 2.6, earned: 1.9, target: 1.5 },
];

const SEGMENT_DATA = [
  { name: "K-12 Public",     tiv: 412, premium: 3.1, accounts: 22, lossRatio: 58, color: N        },
  { name: "Higher Ed",       tiv: 890, premium: 2.8, accounts: 8,  lossRatio: 44, color: "#005B99" },
  { name: "Charter Schools", tiv: 48,  premium: 0.6, accounts: 5,  lossRatio: 72, color: G        },
  { name: "Private School",  tiv: 78,  premium: 0.8, accounts: 4,  lossRatio: 51, color: "#7B2FBE" },
];

const GEO_DATA = [
  { state: "California",   accounts: 8,  premium: 1.82, tiv: 490, lossRatio: 52 },
  { state: "Texas",        accounts: 5,  premium: 0.95, tiv: 220, lossRatio: 61 },
  { state: "Florida",      accounts: 4,  premium: 0.84, tiv: 198, lossRatio: 48 },
  { state: "New York",     accounts: 3,  premium: 0.72, tiv: 310, lossRatio: 55 },
  { state: "Massachusetts",accounts: 3,  premium: 1.16, tiv: 280, lossRatio: 43 },
  { state: "Illinois",     accounts: 2,  premium: 0.38, tiv: 95,  lossRatio: 67 },
  { state: "Others",       accounts: 14, premium: 2.43, tiv: 835, lossRatio: 57 },
];

const APPETITE_SEGMENTS = [
  { label: "K-12 Public Education",     current: 22, target: 30, pct: 73, color: N,        status: "On Track"   },
  { label: "Higher Education",          current: 8,  target: 10, pct: 80, color: "#005B99", status: "On Track"   },
  { label: "Charter Schools",           current: 5,  target: 8,  pct: 63, color: G,         status: "Behind"     },
  { label: "Private / Independent",     current: 4,  target: 5,  pct: 80, color: "#7B2FBE", status: "On Track"   },
  { label: "California (Geo. Limit)",   current: 8,  target: 10, pct: 80, color: "#2E7D32", status: "On Track"   },
  { label: "Property TIV > $400M",      current: 3,  target: 5,  pct: 60, color: "#B45309", status: "Watch"      },
];

const PRODUCT_MIX = [
  { name: "General Liability",         value: 28, color: N        },
  { name: "Property",                  value: 35, color: "#005B99" },
  { name: "Educators Legal Liability", value: 18, color: G        },
  { name: "Student Accident",          value: 11, color: "#2E7D32" },
  { name: "Cyber / Tech",              value: 8,  color: "#7B2FBE" },
];

function KPITile({ k, onClick, selected = false }: {
  k: { label: string; value: string; sub: string; color: string; icon: React.ReactNode };
  onClick?: () => void;
  selected?: boolean;
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
      aria-label={`${k.label}: ${k.value}, ${k.sub}${clickable ? (active ? " (filter active)" : " (click to filter)") : ""}`}
      style={{
        textAlign: "left", width: "100%", fontFamily: "inherit",
        background: active
          ? `linear-gradient(135deg, ${k.color}12 0%, ${k.color}06 100%)`
          : hovered
          ? `linear-gradient(135deg, white 0%, ${k.color}08 100%)`
          : "white",
        border: `${active ? 1.5 : 1}px solid ${active ? k.color : hovered ? `${k.color}40` : BDL}`,
        borderRadius: 10,
        padding: "14px 16px",
        boxShadow: active
          ? `0 2px 8px ${k.color}22, 0 1px 2px rgba(15,23,42,0.04)`
          : hovered
          ? `0 2px 6px ${k.color}14, 0 1px 2px rgba(15,23,42,0.04)`
          : "0 1px 2px rgba(15,23,42,0.04)",
        transform: hovered && !active ? "translateY(-1px)" : "translateY(0)",
        transition: "background 0.2s ease, border-color 0.2s ease, box-shadow 0.25s ease, transform 0.2s ease",
        position: "relative",
        overflow: "hidden",
        outline: "none",
        cursor: clickable ? "pointer" : "default",
      }}>
      <span aria-hidden style={{
        position: "absolute", inset: "0 0 auto 0",
        height: showActive ? 4 : 3,
        background: showActive
          ? k.color
          : `linear-gradient(90deg, ${k.color}, ${k.color}66)`,
        transition: "height 0.2s ease, background 0.2s ease",
      }} />
      <div className="flex items-start justify-between gap-2">
        <p style={{
          fontSize: "0.6rem", fontWeight: 700, color: active ? k.color : TT,
          textTransform: "uppercase", letterSpacing: "0.09em", lineHeight: 1.3,
        }}>
          {k.label}
        </p>
        <span className="inline-flex items-center justify-center"
          style={{
            width: 30, height: 30, borderRadius: 8,
            background: showActive ? `${k.color}1F` : `${k.color}10`,
            color: k.color,
            transform: showActive ? "scale(1.08)" : "scale(1)",
            transition: "background 0.2s ease, transform 0.2s ease",
          }}>
          {k.icon}
        </span>
      </div>
      <p style={{
        fontSize: "1.55rem", fontWeight: 800,
        color: showActive ? k.color : TD,
        lineHeight: 1.1, marginTop: 6,
        fontVariantNumeric: "tabular-nums",
        transition: "color 0.2s ease",
      }}>
        {k.value}
      </p>
      <div className="inline-flex items-center gap-1 mt-2"
        style={{ fontSize: "0.66rem", color: TT, fontWeight: 600 }}>
        <span>{k.sub}</span>
      </div>
    </button>
  );
}

function SectionCard({ title, icon, accent = N, action, children, noPad = false }: {
  title: string; icon?: React.ReactNode; accent?: string;
  action?: React.ReactNode; children: React.ReactNode; noPad?: boolean;
}) {
  return (
    <div style={{ background: "white", border: `1px solid ${BD}`, borderRadius: 8, overflow: "hidden", height: "100%", display: "flex", flexDirection: "column" }}>
      <div className="flex items-center justify-between px-5 py-3.5 flex-wrap gap-2"
        style={{ borderBottom: `1px solid ${BDL}`, background: "#FAFBFD" }}>
        <div className="flex items-center gap-2.5">
          {icon && (
            <span className="inline-flex items-center justify-center"
              style={{ width: 28, height: 28, background: `${accent}14`, color: accent, borderRadius: 6 }}>
              {icon}
            </span>
          )}
          <h3 style={{ fontSize: "0.86rem", fontWeight: 700, color: TD, letterSpacing: "-0.005em" }}>{title}</h3>
        </div>
        {action}
      </div>
      {noPad ? children : <div className="p-5" style={{ flex: 1, minHeight: 0 }}>{children}</div>}
    </div>
  );
}

export function PortfolioPage() {
  const navigate  = useNavigate();
  const { user }  = useAuth();
  const role: RoleId = user?.roleId ?? "sr-uw";
  const [segTab, setSegTab] = useState<"segment" | "geo">("segment");
  const [atRiskOnly, setAtRiskOnly] = useState(false);

  const kpis = [
    { key: null,         label: "Total TIV",          value: "$1.43B",  sub: "Across 39 active accounts", color: N,        icon: <Building2 size={20} color={N} />            },
    { key: null,         label: "Written Premium YTD",value: "$8.3M",   sub: "+18% vs. prior year",       color: "#2E7D32",icon: <DollarSign size={20} color="#2E7D32" />       },
    { key: null,         label: "Earned Premium YTD", value: "$7.1M",   sub: "86% earned ratio",          color: "#005B99",icon: <Activity size={20} color="#005B99" />          },
    { key: null,         label: "Portfolio Hit Ratio",value: "69%",     sub: "+2pp vs. prior year",       color: G,        icon: <Award size={20} color={G} />                  },
    { key: null,         label: "Avg. Loss Ratio",    value: "54%",     sub: "Within target (≤65%)",      color: "#2E7D32",icon: <TrendingUp size={20} color="#2E7D32" />        },
    { key: "atRisk" as const, label: "At-Risk Accounts",   value: "4",       sub: "Loss ratio > 70%",          color: "#B91C1C",icon: <AlertTriangle size={20} color="#B91C1C" />     },
  ];

  return (
    <AppShell activePage="portfolio" role={role} onRoleChange={() => {}}>
      <div className="px-3 sm:px-4 lg:px-5 py-3 sm:py-4 space-y-3 sm:space-y-4"
        style={{ fontFamily: font, color: TD, minHeight: "100%", background: "#EEF1F6" }}>

        <PageRegister
          routeKey="page:portfolio"
          title="Portfolio"
          subtitle={`Book performance · ${segTab === "segment" ? "by segment" : "by geography"}`}
          greeting={`Book snapshot: ${SEGMENT_DATA.reduce((s, x) => s + x.accounts, 0)} accounts, $${SEGMENT_DATA.reduce((s, x) => s + x.premium, 0).toFixed(1)}M written. Ask for a chart or a segment breakdown.`}
          suggestions={[
            { id: "monthly", label: "Show monthly placed premium", tone: "blue", icon: "BarChart3" },
            { id: "lr", label: "Loss ratio trend", tone: "gold", icon: "Activity" },
            { id: "bind", label: "Bind rate by month", tone: "violet", icon: "ChartPie" },
            { id: "by-segment", label: "Premium by segment", tone: "blue", icon: "ChartPie" },
          ]}
          respond={(sid) => {
            if (sid === "by-segment") return [{ id: newId(), role: "agent", kind: "viz", ts: now(), viz: {
              kind: "donut", title: "Written premium by segment",
              segments: SEGMENT_DATA.map(s => ({ label: s.name, value: s.premium, color: s.color })),
              cta: "add-to-dashboard", ctaLabel: "Add to Portfolio page", dashboardHref: "/portfolio",
            } }];
            if (sid === "monthly") return [{ id: newId(), role: "agent", kind: "viz", ts: now(), viz: {
              kind: "linecard", title: "Monthly placed premium",
              intro: "Written premium by month across the book — steady upward trend versus target.",
              data: PREMIUM_TREND.map(p => ({ label: p.month, value: p.written })),
              yFormat: "currency", cta: "add-to-dashboard", ctaLabel: "Add to Portfolio page", dashboardHref: "/portfolio",
            } }];
            if (sid === "lr") {
              const lrTrend = PREMIUM_TREND.map((p, i) => ({ label: p.month, value: 48 + Math.round(Math.sin(i) * 6) + i }));
              return [{ id: newId(), role: "agent", kind: "viz", ts: now(), viz: {
                kind: "linecard", title: "Loss ratio trend",
                intro: "Book-wide loss ratio trend — within target band.",
                data: lrTrend, yFormat: "percent",
                cta: "add-to-dashboard", ctaLabel: "Add to Portfolio page", dashboardHref: "/portfolio",
              } }];
            }
            if (sid === "bind") {
              const bindTrend = PREMIUM_TREND.map((p, i) => ({ label: p.month, value: 28 + Math.round(Math.cos(i) * 5) + Math.floor(i / 2) }));
              return [{ id: newId(), role: "agent", kind: "viz", ts: now(), viz: {
                kind: "linecard", title: "Bind rate by month",
                intro: "Bind rate by month — tracking the book average.",
                data: bindTrend, yFormat: "percent",
                cta: "add-to-dashboard", ctaLabel: "Add to Portfolio page", dashboardHref: "/portfolio",
              } }];
            }
          }}
          freeText={(text) => {
            const t = text.toLowerCase();
            if (/\b(monthly|premium trend|written premium|placed premium|month-by-month)\b/.test(t)) {
              return [{ id: newId(), role: "agent", kind: "viz", ts: now(), viz: {
                kind: "linecard", title: "Monthly placed premium",
                intro: "Written premium by month across the book — steady upward trend versus target.",
                data: PREMIUM_TREND.map(p => ({ label: p.month, value: p.written })),
                yFormat: "currency", cta: "add-to-dashboard", ctaLabel: "Add to Portfolio page", dashboardHref: "/portfolio",
              } }];
            }
            if (/\b(loss ratio|lr)\b/.test(t)) {
              const avg = Math.round(SEGMENT_DATA.reduce((s, x) => s + x.lossRatio, 0) / SEGMENT_DATA.length);
              const worst = SEGMENT_DATA.reduce((a, b) => a.lossRatio > b.lossRatio ? a : b);
              return [{ id: newId(), role: "agent", kind: "text", ts: now(),
                text: `Average loss ratio across segments: ${avg}%. Highest: ${worst.name} at ${worst.lossRatio}% — that's the one to watch.` }];
            }
            if (/\b(largest|biggest|top segment|biggest book)\b/.test(t)) {
              const top = SEGMENT_DATA.reduce((a, b) => a.premium > b.premium ? a : b);
              return [{ id: newId(), role: "agent", kind: "text", ts: now(),
                text: `${top.name} is the largest segment at $${top.premium}M across ${top.accounts} accounts (loss ratio ${top.lossRatio}%).` }];
            }
            if (/\b(geo|geography|state|states|region)\b/.test(t)) {
              return [{ id: newId(), role: "agent", kind: "viz", ts: now(), viz: {
                kind: "bars", title: "Premium by state", unit: "$M",
                series: GEO_DATA.map(g => ({ label: g.state, value: g.premium, tone: "blue" })),
                cta: "add-to-dashboard", ctaLabel: "Add to Portfolio page", dashboardHref: "/portfolio",
              } }];
            }
          }}
          facts={() => [
            `Portfolio · ${SEGMENT_DATA.reduce((s, x) => s + x.accounts, 0)} accounts · $${SEGMENT_DATA.reduce((s, x) => s + x.premium, 0).toFixed(1)}M written premium`,
            `Segments: ${SEGMENT_DATA.map(s => `${s.name} ($${s.premium}M, LR ${s.lossRatio}%)`).join("; ")}`,
            `Current cut: ${segTab}`,
          ].join("\n")}
        />

        <PinnedDashboard />

        {/* ── HERO ─────────────────────────────────────────────────────────── */}
        <div className="relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${N} 0%, #0E3CE0 50%, #2547F4 100%)`,
            borderRadius: 12,
            color: "white",
            boxShadow: `0 4px 16px ${N}25`,
          }}>
          <div aria-hidden style={{
            position: "absolute", top: -40, right: -40, width: 180, height: 180,
            background: `radial-gradient(circle, ${G}25 0%, transparent 65%)`,
            borderRadius: "50%",
          }} />
          <div className="relative px-4 sm:px-5 py-4 sm:py-5">
            <h1 style={{ fontSize: "1.55rem", fontWeight: 800, lineHeight: 1.15, letterSpacing: "-0.01em" }}>
              Portfolio Analytics
            </h1>
            <p style={{ fontSize: "0.84rem", color: "#C7D2FE", marginTop: 6, maxWidth: 700 }}>
              Executive view · Real-time exposure, premium, and appetite tracking · Education Practice
            </p>
          </div>
        </div>

        {/* ── KPI STRIP ────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {kpis.map((k, i) => (
            <KPITile key={i} k={k}
              onClick={k.key === "atRisk" ? () => setAtRiskOnly(v => !v) : undefined}
              selected={k.key === "atRisk" && atRiskOnly}/>
          ))}
        </div>

        {/* Content */}
        <div className="space-y-5">

          {/* Row 1: Premium trend + Product mix */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 h-full">
              <SectionCard title="Premium Trend — Written vs. Earned vs. Target" icon={<BarChart2 size={13} />} accent={N}>
                <div className="flex flex-col h-full">
                  <div className="flex items-center gap-5 mb-4">
                    {[{ color: N, label: "Written" }, { color: "#005B99", label: "Earned" }, { color: G, label: "Target" }].map(l => (
                      <div key={l.label} className="flex items-center gap-1.5">
                        <span style={{ width: 10, height: 10, background: l.color, display: "block" }} />
                        <span style={{ fontSize: "0.70rem", color: TM, fontWeight: 600 }}>{l.label} ($M)</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ flex: 1, minHeight: 200 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={PREMIUM_TREND} barGap={3} barCategoryGap="28%">
                        <CartesianGrid strokeDasharray="3 3" stroke={BDL} vertical={false} />
                        <XAxis dataKey="month" tick={{ fontSize: 11, fill: TT, fontFamily: font }} axisLine={{ stroke: BD }} tickLine={false} />
                        <YAxis tick={{ fontSize: 11, fill: TT, fontFamily: font }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ border: `1px solid ${BD}`, fontSize: "0.78rem", fontFamily: font }} cursor={{ fill: `${N}08` }} />
                        <Bar dataKey="written" fill={N}        name="Written" />
                        <Bar dataKey="earned"  fill="#005B99"  name="Earned"  />
                        <Bar dataKey="target"  fill={`${G}60`} name="Target"  />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </SectionCard>
            </div>

            <SectionCard title="Product Mix (Premium)" icon={<Activity size={13} />} accent={G}>
              <div className="flex justify-center mb-4">
                <PieChart width={160} height={160}>
                  <Pie data={PRODUCT_MIX} cx={80} cy={80} innerRadius={45} outerRadius={75} dataKey="value" paddingAngle={2}>
                    {PRODUCT_MIX.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                </PieChart>
              </div>
              <div className="space-y-2">
                {PRODUCT_MIX.map((p, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span style={{ width: 9, height: 9, background: p.color, flexShrink: 0, display: "block" }} />
                      <span style={{ fontSize: "0.70rem", color: TM }}>{p.name}</span>
                    </div>
                    <span style={{ fontSize: "0.72rem", fontWeight: 700, color: TD }}>{p.value}%</span>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>

          {/* Row 2: Segment / Geo breakdown */}
          <SectionCard
            title="Exposure & Premium Distribution"
            icon={<Globe size={13} />}
            accent={N}
            noPad
            action={
              <div className="flex items-center gap-2 flex-wrap">
                {atRiskOnly && (
                  <button
                    onClick={() => setAtRiskOnly(false)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 transition-all hover:brightness-95"
                    style={{
                      fontSize: "0.65rem", fontWeight: 700,
                      background: "#FBEAEA", color: "#7A1F1F",
                      border: "1px solid #E8A8A8", borderRadius: 6, cursor: "pointer",
                    }}>
                    At-Risk only · clear ×
                  </button>
                )}
                <div className="flex items-center gap-1">
                  {([{ id: "segment" as const, label: "By Segment" }, { id: "geo" as const, label: "By Geography" }]).map(t => (
                    <button key={t.id}
                      onClick={() => setSegTab(t.id)}
                      className="px-3 py-1.5 transition-all"
                      style={{ fontSize: "0.68rem", fontWeight: 700, background: segTab === t.id ? N : "transparent", color: segTab === t.id ? "white" : TM, border: `1px solid ${segTab === t.id ? N : BD}`, borderRadius: 6 }}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            }
          >
            <div className="overflow-x-auto">
              <table className="w-full" style={{ borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: TH }}>
                    {(segTab === "segment"
                      ? ["Segment", "Accounts", "TIV ($M)", "Written Prem. ($M)", "Loss Ratio", "Trend"]
                      : ["State", "Accounts", "TIV ($M)", "Written Prem. ($M)", "Loss Ratio", ""]
                    ).map(h => (
                      <th key={h} className="px-5 py-3 text-left"
                        style={{ fontSize: "0.60rem", fontWeight: 700, color: TT, textTransform: "uppercase", letterSpacing: "0.08em", borderBottom: `1px solid ${BDL}` }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {((segTab === "segment" ? SEGMENT_DATA : GEO_DATA) as any[])
                    .filter(row => !atRiskOnly || row.lossRatio >= 70)
                    .map((row: any, i) => {
                    const lrColor = row.lossRatio >= 70 ? "#B91C1C" : row.lossRatio >= 60 ? "#B45309" : "#2E7D32";
                    return (
                      <tr key={i} className="hover:bg-slate-50/70 transition-colors"
                        style={{ borderBottom: `1px solid ${BDL}` }}>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            {segTab === "segment" && <span style={{ width: 8, height: 8, background: row.color, display: "block", flexShrink: 0 }} />}
                            <span style={{ fontSize: "0.80rem", fontWeight: 600, color: TD }}>{row.name ?? row.state}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3" style={{ fontSize: "0.80rem", fontWeight: 600, color: TD }}>{row.accounts}</td>
                        <td className="px-5 py-3" style={{ fontSize: "0.80rem", fontWeight: 600, color: N }}>${row.tiv}M</td>
                        <td className="px-5 py-3" style={{ fontSize: "0.80rem", fontWeight: 700, color: "#2E7D32" }}>${row.premium}M</td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <div style={{ width: 60, height: 6, background: BDL }}>
                              <div style={{ height: "100%", width: `${row.lossRatio}%`, background: lrColor }} />
                            </div>
                            <span style={{ fontSize: "0.72rem", fontWeight: 700, color: lrColor }}>{row.lossRatio}%</span>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          {row.lossRatio >= 70 && (
                            <span className="flex items-center gap-1" style={{ fontSize: "0.60rem", fontWeight: 700, color: "#7A1F1F", background: "#FBEAEA", border: "1px solid #E8A8A8", padding: "1px 6px" }}>
                              <AlertTriangle size={9} /> At Risk
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </SectionCard>

          {/* Row 3: Appetite tracking + Accumulation risk */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 h-full">
              <SectionCard title="Appetite Tracking — Progress Toward Strategic Targets" icon={<Target size={13} />} accent={G}>
                <div className="space-y-4">
                  {APPETITE_SEGMENTS.map((seg, i) => (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span style={{ fontSize: "0.78rem", fontWeight: 600, color: TD }}>{seg.label}</span>
                          <span className="px-1.5 py-0.5" style={{
                            fontSize: "0.58rem", fontWeight: 700,
                            background: seg.status === "On Track" ? "#E8F5EC" : seg.status === "Behind" ? "#FBEAEA" : "#FFF8E6",
                            color: seg.status === "On Track" ? "#1A5C30" : seg.status === "Behind" ? "#7A1F1F" : "#8A5C00",
                            border: `1px solid ${seg.status === "On Track" ? "#93C8A0" : seg.status === "Behind" ? "#E8A8A8" : "#F0D88A"}`,
                          }}>
                            {seg.status}
                          </span>
                        </div>
                        <span style={{ fontSize: "0.72rem", color: TT }}>
                          <span style={{ fontWeight: 700, color: TD }}>{seg.current}</span> / {seg.target} accounts ({seg.pct}%)
                        </span>
                      </div>
                      <div style={{ height: 8, background: BDL, position: "relative" }}>
                        <div style={{ height: "100%", width: `${seg.pct}%`, background: seg.color, transition: "width 0.6s ease" }} />
                        {/* Target line */}
                        <div style={{ position: "absolute", right: 0, top: -3, height: 14, width: 2, background: TT }} />
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>
            </div>

            <SectionCard title="Accumulation Risk" icon={<ShieldCheck size={13} />} accent="#B91C1C">
              <div className="space-y-3">
                {[
                  { label: "Max Single State TIV",      value: "$490M",  state: "CA",   risk: "watch",    pct: 34 },
                  { label: "Max Single Account TIV",    value: "$412M",  state: "K-12", risk: "ok",       pct: 28 },
                  { label: "Cat Zone 3 (Earthquake)",   value: "$220M",  state: "CA/WA",risk: "watch",    pct: 15 },
                  { label: "Coastal Exposure (Wind)",   value: "$198M",  state: "FL",   risk: "ok",       pct: 14 },
                  { label: "Named Perils Aggregation",  value: "$908M",  state: "All",  risk: "critical", pct: 63 },
                ].map((r, i) => {
                  const color = r.risk === "critical" ? "#B91C1C" : r.risk === "watch" ? "#B45309" : "#2E7D32";
                  return (
                    <div key={i} className="flex items-center justify-between py-2.5"
                      style={{ borderBottom: `1px solid ${BDL}` }}>
                      <div>
                        <p style={{ fontSize: "0.76rem", fontWeight: 600, color: TD }}>{r.label}</p>
                        <p style={{ fontSize: "0.62rem", color: TT }}>{r.state}</p>
                      </div>
                      <div className="text-right">
                        <p style={{ fontSize: "0.80rem", fontWeight: 700, color }}>{r.value}</p>
                        <p style={{ fontSize: "0.60rem", color, fontWeight: 600 }}>
                          {r.risk === "critical" ? "⚠ High" : r.risk === "watch" ? "Watch" : "OK"}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </SectionCard>
          </div>

        </div>
      </div>
    </AppShell>
  );
}
