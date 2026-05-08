import { useState } from "react";
import { useNavigate } from "react-router";
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

const N   = "#0123D4";
const G   = "#C9A227";
const TH  = "#F0F3F8";
const BD  = "#C4CDD8";
const BDL = "#DCE3EC";
const TD  = "#1A2530";
const TM  = "#4A5D6E";
const TT  = "#7A8FA3";
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

export function PortfolioPage() {
  const navigate  = useNavigate();
  const { user }  = useAuth();
  const role: RoleId = user?.roleId ?? "sr-uw";
  const [segTab, setSegTab] = useState<"segment" | "geo">("segment");

  const kpis = [
    { label: "Total TIV",          value: "$1.43B",  sub: "Across 39 active accounts", color: N,        icon: <Building2 size={20} color={N} />            },
    { label: "Written Premium YTD",value: "$8.3M",   sub: "+18% vs. prior year",       color: "#2E7D32",icon: <DollarSign size={20} color="#2E7D32" />       },
    { label: "Earned Premium YTD", value: "$7.1M",   sub: "86% earned ratio",          color: "#005B99",icon: <Activity size={20} color="#005B99" />          },
    { label: "Portfolio Hit Ratio",value: "69%",     sub: "+2pp vs. prior year",       color: G,        icon: <Award size={20} color={G} />                  },
    { label: "Avg. Loss Ratio",    value: "54%",     sub: "Within target (≤65%)",      color: "#2E7D32",icon: <TrendingUp size={20} color="#2E7D32" />        },
    { label: "At-Risk Accounts",   value: "4",       sub: "Loss ratio > 70%",          color: "#B91C1C",icon: <AlertTriangle size={20} color="#B91C1C" />     },
  ];

  return (
    <AppShell activePage="portfolio" role={role} onRoleChange={() => {}}>
      <div style={{ fontFamily: font, color: TD }}>

        {/* Page header */}
        <div style={{ background: N, borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
          <div style={{ height: 4, background: `linear-gradient(90deg,${G} 0%,#A8841C 100%)` }} />
          <div className="px-4 sm:px-8 py-4 sm:py-5">
            <h1 style={{ fontSize: "1.35rem", fontWeight: 800, color: "white", lineHeight: 1.2 }}>Portfolio Analytics</h1>
            <p style={{ fontSize: "0.80rem", color: "rgba(255,255,255,0.5)", marginTop: 4 }}>
              Executive view · Real-time exposure, premium, and appetite tracking · Education Practice
            </p>
          </div>

          {/* KPI strip */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6" style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
            {kpis.map((k, i) => (
              <div key={i} className="px-4 sm:px-5 py-3 flex flex-col gap-0.5"
                style={{ borderRight: "1px solid rgba(255,255,255,0.1)" }}>
                <span style={{ fontSize: "0.58rem", fontWeight: 600, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                  {k.label}
                </span>
                <span style={{ fontSize: "1.10rem", fontWeight: 800, color: "white", lineHeight: 1.2 }}>{k.value}</span>
                <span style={{ fontSize: "0.60rem", color: "rgba(255,255,255,0.45)" }}>{k.sub}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="px-4 sm:px-6 lg:px-8 py-5 space-y-5" style={{ background: "#EEF1F6", minHeight: "calc(100vh - 200px)" }}>

          {/* Row 1: Premium trend + Product mix */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2">
              <SectionCard title="Premium Trend — Written vs. Earned vs. Target" icon={<BarChart2 size={13} />} accent={N}>
                <div className="flex items-center gap-5 mb-4">
                  {[{ color: N, label: "Written" }, { color: "#005B99", label: "Earned" }, { color: G, label: "Target" }].map(l => (
                    <div key={l.label} className="flex items-center gap-1.5">
                      <span style={{ width: 10, height: 10, background: l.color, display: "block" }} />
                      <span style={{ fontSize: "0.70rem", color: TM, fontWeight: 600 }}>{l.label} ($M)</span>
                    </div>
                  ))}
                </div>
                <ResponsiveContainer width="100%" height={200}>
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
              <div className="flex items-center gap-1">
                {([{ id: "segment" as const, label: "By Segment" }, { id: "geo" as const, label: "By Geography" }]).map(t => (
                  <button key={t.id}
                    onClick={() => setSegTab(t.id)}
                    className="px-3 py-1.5 transition-all"
                    style={{ fontSize: "0.68rem", fontWeight: 700, background: segTab === t.id ? N : "transparent", color: segTab === t.id ? "white" : TM, border: `1px solid ${segTab === t.id ? N : BD}` }}>
                    {t.label}
                  </button>
                ))}
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
                  {(segTab === "segment" ? SEGMENT_DATA : GEO_DATA).map((row: any, i) => {
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
            <div className="lg:col-span-2">
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
