import { motion } from "framer-motion";
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Cell,
} from "recharts";
import {
  Users, FileText, Target, CheckCircle2, DollarSign, Clock,
  PlusCircle, RefreshCw, Info, ArrowUpRight, ArrowDownRight, Building2,
} from "lucide-react";
import { PageBody } from "@/components/Primitives";
import {
  PORTFOLIO_BY_SEGMENT, PORTFOLIO_QUARTERLY, TEAM,
  MONTHLY_BIND_TREND, SALES_FUNNEL, ACCOUNT_SIZE_DIST,
  TOP_BROKERS, DECLINATION_REASONS, GEOGRAPHIC_MIX, DAYS_TO_QUOTE_DIST,
} from "@/lib/mockData";
import { PageRegister } from "@/components/companion/PageRegister";
import { newId, now } from "@/components/companion/CompanionContext";

// ─── Visual primitives matching the reference aesthetic ──────────────────────
const AXIS = "#7A879E";
const GRID = "#E2E6EE";

function KpiBig({ label, value, icon: Icon, delta, deltaTone = "up" }: {
  label: string; value: string; icon: React.ComponentType<{ className?: string }>; delta?: string; deltaTone?: "up" | "down" | "neutral";
}) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-[0_1px_0_rgba(15,23,42,0.04)] hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
        <div className="size-8 rounded-xl bg-primary/8 grid place-items-center text-primary">
          <Icon className="size-4" />
        </div>
      </div>
      <div className="mt-3 font-display text-[28px] font-bold leading-none text-foreground tabular-nums">{value}</div>
      {delta && (
        <div className={`mt-2 inline-flex items-center gap-1 text-[11px] font-semibold ${
          deltaTone === "up" ? "text-emerald-700" : deltaTone === "down" ? "text-rose-600" : "text-muted-foreground"
        }`}>
          {deltaTone === "up" ? <ArrowUpRight className="size-3" /> : deltaTone === "down" ? <ArrowDownRight className="size-3" /> : null}
          {delta}
        </div>
      )}
    </div>
  );
}

function KpiSlim({ label, value, icon: Icon }: {
  label: string; value: string; icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-2xl border bg-card p-4 flex items-center gap-3">
      <div className="size-9 rounded-xl bg-primary/8 grid place-items-center text-primary shrink-0">
        <Icon className="size-4" />
      </div>
      <div className="min-w-0">
        <div className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground leading-tight">{label}</div>
        <div className="font-display text-[20px] font-bold leading-tight text-foreground tabular-nums">{value}</div>
      </div>
    </div>
  );
}

function ChartCard({ title, subtitle, children, info, action }: {
  title: string; subtitle?: string; info?: string; action?: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border bg-card p-5 shadow-[0_1px_0_rgba(15,23,42,0.04)]">
      <header className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <h3 className="font-display font-bold text-[15px] text-foreground leading-tight">{title}</h3>
          {subtitle && <p className="text-[12px] text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {action}
          {info && <span title={info} className="size-5 rounded-full bg-muted/60 grid place-items-center text-muted-foreground"><Info className="size-3" /></span>}
        </div>
      </header>
      {children}
    </section>
  );
}

const tooltipStyle = {
  borderRadius: 10,
  border: "1px solid #E2E6EE",
  fontSize: 12,
  padding: "8px 10px",
  boxShadow: "0 8px 24px -12px rgba(15,23,42,0.18)",
};

// ─── Page ────────────────────────────────────────────────────────────────────
export function Portfolio() {
  // Aggregate KPIs
  const leadVolume = SALES_FUNNEL[0]!.count;
  const quotesIssued = SALES_FUNNEL[2]!.count;
  const bound = SALES_FUNNEL[3]!.count;
  const bindRate = ((bound / quotesIssued) * 100).toFixed(1);
  const closingRatio = ((bound / leadVolume) * 100).toFixed(1);

  return (
    <PageBody className="!pt-6 !max-w-[1500px] mx-auto">
      <PageRegister
        routeKey="portfolio"
        title="Portfolio"
        subtitle="Book performance"
        greeting="Ask me to plot anything — monthly bind trend, loss ratio by segment, broker hit rates. I can also slice by geography or account size."
        suggestions={[
          { id: "bind-trend",  label: "Show monthly bind trend", tone: "blue", icon: "Activity" },
          { id: "by-segment",  label: "Premium by segment",      tone: "gold", icon: "ChartPie" },
          { id: "loss-trend",  label: "Loss-ratio trend",        tone: "blue", icon: "Activity" },
          { id: "team",        label: "Team workload",           tone: "violet", icon: "Users" },
          { id: "open-appetite", label: "Open Appetite",         tone: "blue", icon: "Compass", navigateTo: "/appetite" },
        ]}
        respond={(sid) => {
          if (sid === "bind-trend") return [{ id: newId(), role: "agent", kind: "viz", ts: now(), viz: {
            kind: "linecard",
            title: "Monthly placed premium · trailing 6 months",
            intro: "Placed premium has trended up steadily; bind rate is holding at 26.4% versus a 25% book average.",
            data: MONTHLY_BIND_TREND.slice(-6).map(d => ({ label: d.label.split(" ")[0]!, value: d.value * 1_000 })),
            yFormat: "currency",
            cta: "add-to-dashboard", dashboardHref: "/",
          } }];
          if (sid === "by-segment") return [{ id: newId(), role: "agent", kind: "viz", ts: now(), viz: {
            kind: "donut", title: "Premium by segment ($M)",
            segments: PORTFOLIO_BY_SEGMENT.map((s, i) => ({ label: s.segment, value: s.premium, color: ["#0123D4","#1E40AF","#C9A227","#7B6217","#10B981","#6366F1"][i % 6]! })),
          } }];
          if (sid === "loss-trend") {
            const data = PORTFOLIO_QUARTERLY.map(q => ({ label: q.quarter, value: Math.round((q.claims / q.premium) * 100) }));
            const last = data[data.length - 1]!.value;
            const first = data[0]!.value;
            const delta = last - first;
            return [{ id: newId(), role: "agent", kind: "viz", ts: now(), viz: {
              kind: "linecard",
              title: "Portfolio loss ratio · quarterly",
              intro: `Loss ratio is at ${last}% this quarter, ${delta >= 0 ? "up" : "down"} ${Math.abs(delta)}pp from ${data[0]!.label}. Comfortably inside the 45–60% target band.`,
              data, yFormat: "percent",
              cta: "add-to-dashboard", dashboardHref: "/",
            } }];
          }
          if (sid === "team") return [{ id: newId(), role: "agent", kind: "viz", ts: now(), viz: {
            kind: "bars", title: "Team workload (in review)",
            series: TEAM.slice(0, 6).map(m => ({ label: m.name.split(" ")[0]!, value: m.inReview, tone: m.inReview > 4 ? "red" : "blue" })),
          } }];
          return;
        }}
      />

      {/* Header */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Portfolio · Apr 2026</div>
          <h1 className="font-display text-[28px] font-bold leading-tight">Book performance</h1>
          <p className="text-[13px] text-muted-foreground mt-1">Lead → bind funnel, segment health, and where the book is moving.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="h-9 inline-flex items-center gap-1.5 rounded-xl border bg-card px-3 text-[12.5px] font-semibold hover:bg-muted/40 transition-colors">
            <RefreshCw className="size-3.5" /> Refresh
          </button>
          <button className="h-9 inline-flex items-center gap-1.5 rounded-xl bg-primary text-white px-3 text-[12.5px] font-semibold shadow-sm hover:bg-primary/90 transition-colors">
            Export report
          </button>
        </div>
      </div>

      {/* Headline KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <KpiBig label="Lead volume"   value={leadVolume.toLocaleString()} icon={Users}        delta="+12.4% vs. PY" deltaTone="up" />
        <KpiBig label="Quotes issued" value={quotesIssued.toLocaleString()} icon={FileText}    delta="+8.6% vs. PY"  deltaTone="up" />
        <KpiBig label="Bind rate"     value={`${bindRate}%`}                icon={Target}      delta="+2.1pp vs. PY" deltaTone="up" />
        <KpiBig label="Closing ratio" value={`${closingRatio}%`}            icon={CheckCircle2} delta="−0.4pp vs. PY" deltaTone="down" />
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <KpiSlim label="Premium bound"    value="$87.8M" icon={DollarSign} />
        <KpiSlim label="Avg days to bind" value="15.8"   icon={Clock} />
        <KpiSlim label="New business"     value="$32.4M" icon={PlusCircle} />
        <KpiSlim label="Renewal premium"  value="$55.4M" icon={RefreshCw} />
      </div>

      {/* Sales funnel + Monthly bind trend */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)] gap-4 mb-4">
        <ChartCard title="Sales Funnel" subtitle="Lead to Bind conversion">
          <div className="space-y-3 pt-1">
            {SALES_FUNNEL.map((s, i) => {
              const max = SALES_FUNNEL[0]!.count;
              const pct = (s.count / max) * 100;
              const prev = i > 0 ? SALES_FUNNEL[i - 1]!.count : null;
              const conv = prev ? Math.round((s.count / prev) * 100) : null;
              return (
                <div key={s.stage}>
                  <div className="flex items-baseline justify-between text-[12px] mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="size-2 rounded-sm" style={{ background: s.color }} />
                      <span className="font-semibold text-foreground">{s.stage}</span>
                    </div>
                    <div className="flex items-baseline gap-3 tabular-nums">
                      <span className="font-semibold text-foreground">{s.count.toLocaleString()}</span>
                      {conv !== null && <span className="text-[10.5px] text-muted-foreground">{conv}% →</span>}
                    </div>
                  </div>
                  <div className="h-2.5 rounded-full bg-muted/50 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.7, delay: i * 0.06, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{ background: s.color }}
                    />
                  </div>
                </div>
              );
            })}
            <div className="mt-4 pt-3 border-t flex items-baseline justify-between text-[11.5px]">
              <span className="text-muted-foreground">Lead → Bound</span>
              <span className="font-semibold text-foreground tabular-nums">
                {((SALES_FUNNEL[3]!.count / SALES_FUNNEL[0]!.count) * 100).toFixed(1)}% closing ratio
              </span>
            </div>
          </div>
        </ChartCard>

        <ChartCard title="Monthly Bind Trend" subtitle="Placed premium ($K) · trailing 28 months" info="Total placed premium per month across all segments.">
          <div style={{ width: "100%", height: 280 }}>
            <ResponsiveContainer>
              <LineChart data={MONTHLY_BIND_TREND} margin={{ top: 10, right: 14, bottom: 0, left: -10 }}>
                <CartesianGrid stroke={GRID} vertical={false} strokeDasharray="2 4" />
                <XAxis
                  dataKey="label" stroke={AXIS} fontSize={10.5}
                  tickLine={false} axisLine={false}
                  interval={Math.floor(MONTHLY_BIND_TREND.length / 8)}
                />
                <YAxis
                  stroke={AXIS} fontSize={10.5}
                  tickLine={false} axisLine={false}
                  domain={[0, "dataMax + 100"]}
                  tickFormatter={(v) => v >= 1000 ? `$${(v / 1000).toFixed(1)}K` : `${v}`}
                  width={56}
                />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number) => `$${v.toLocaleString()}K`} labelStyle={{ fontWeight: 600, color: "#3F4E70" }} />
                <Line
                  type="monotone" dataKey="value" stroke="#0123D4"
                  strokeWidth={2.25} dot={{ r: 3, fill: "#0123D4", strokeWidth: 0 }}
                  activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Account size distribution + Premium by segment */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <ChartCard title="Account Size Distribution" subtitle="Bound accounts by premium band">
          <div style={{ width: "100%", height: 240 }}>
            <ResponsiveContainer>
              <BarChart data={ACCOUNT_SIZE_DIST} margin={{ top: 8, right: 10, bottom: 0, left: -16 }}>
                <CartesianGrid stroke={GRID} vertical={false} strokeDasharray="2 4" />
                <XAxis dataKey="band" stroke={AXIS} fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke={AXIS} fontSize={10.5} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v: number, k) => k === "count" ? `${v} accts` : `$${v}M`} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {ACCOUNT_SIZE_DIST.map((_, i) => (
                    <Cell key={i} fill={i >= 4 ? "#0B1A6E" : i >= 2 ? "#0123D4" : "#5C72D6"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Premium by Segment" subtitle="Bound premium share & loss ratio">
          <div className="space-y-3 pt-1">
            {PORTFOLIO_BY_SEGMENT.map((s) => {
              const total = PORTFOLIO_BY_SEGMENT.reduce((a, x) => a + x.premium, 0);
              const pct = (s.premium / total) * 100;
              const lrTone = s.lossRatio < 45 ? "bg-emerald-500" : s.lossRatio < 60 ? "bg-amber-500" : "bg-rose-500";
              return (
                <div key={s.segment}>
                  <div className="flex items-baseline justify-between text-[12px] mb-1.5">
                    <div className="font-semibold text-foreground">{s.segment}</div>
                    <div className="flex items-baseline gap-3 text-muted-foreground tabular-nums">
                      <span><span className="font-semibold text-foreground">${s.premium.toFixed(1)}M</span> · {pct.toFixed(0)}%</span>
                      <span className="text-[11px]">LR <span className="font-semibold text-foreground">{s.lossRatio}%</span></span>
                    </div>
                  </div>
                  <div className="h-2 rounded-full bg-muted/70 overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.7, ease: "easeOut" }} className="h-full rounded-full bg-gradient-to-r from-primary to-[#1E40AF]" />
                  </div>
                  <div className="flex items-center gap-1.5 mt-1 text-[10px] text-muted-foreground">
                    <span className={`inline-block size-1.5 rounded-full ${lrTone}`} />
                    {s.count} accounts
                  </div>
                </div>
              );
            })}
          </div>
        </ChartCard>
      </div>

      {/* Days-to-quote + Declination reasons + Geographic mix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <ChartCard title="Days to Quote" subtitle="Distribution across submissions">
          <div style={{ width: "100%", height: 200 }}>
            <ResponsiveContainer>
              <BarChart data={DAYS_TO_QUOTE_DIST} margin={{ top: 8, right: 8, bottom: 0, left: -22 }}>
                <CartesianGrid stroke={GRID} vertical={false} strokeDasharray="2 4" />
                <XAxis dataKey="bucket" stroke={AXIS} fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke={AXIS} fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} fill="#C9A227" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Declination Reasons" subtitle="Why we said no — last 90 days">
          <div className="space-y-2 pt-1">
            {DECLINATION_REASONS.map((r) => {
              const max = Math.max(...DECLINATION_REASONS.map(x => x.count));
              return (
                <div key={r.reason} className="grid grid-cols-[1fr_auto] items-center gap-3">
                  <div>
                    <div className="text-[12px] font-medium text-foreground/90 mb-1">{r.reason}</div>
                    <div className="h-1.5 rounded-full bg-muted/70 overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${(r.count / max) * 100}%` }} transition={{ duration: 0.6 }} className="h-full rounded-full bg-[#0B1A6E]" />
                    </div>
                  </div>
                  <div className="font-mono-tabular text-[12px] font-semibold tabular-nums">{r.count}</div>
                </div>
              );
            })}
          </div>
        </ChartCard>

        <ChartCard title="Geographic Mix" subtitle="Bound premium by region">
          <div className="space-y-2 pt-1">
            {GEOGRAPHIC_MIX.map((g) => {
              const total = GEOGRAPHIC_MIX.reduce((a, x) => a + x.premium, 0);
              const pct = (g.premium / total) * 100;
              return (
                <div key={g.region} className="grid grid-cols-[80px_1fr_auto] items-center gap-3 text-[12px]">
                  <div className="font-semibold text-foreground/90 truncate">{g.region}</div>
                  <div className="h-2 rounded-full bg-muted/70 overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6 }} className="h-full rounded-full bg-gradient-to-r from-primary to-accent" />
                  </div>
                  <div className="tabular-nums text-muted-foreground"><span className="font-semibold text-foreground">${g.premium.toFixed(1)}M</span> · {g.accounts}</div>
                </div>
              );
            })}
          </div>
        </ChartCard>
      </div>

      {/* Top brokers */}
      <ChartCard title="Top Brokers" subtitle="Submissions, bound count, and hit ratio — last 12 months" action={
        <button className="text-[11px] font-semibold text-primary hover:underline">View all brokers</button>
      }>
        <div className="overflow-hidden rounded-xl border">
          <table className="w-full text-[12.5px]">
            <thead className="bg-muted/40 text-[10px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-2.5 font-semibold">Broker</th>
                <th className="text-right px-3 py-2.5 font-semibold">Submissions</th>
                <th className="text-right px-3 py-2.5 font-semibold">Bound</th>
                <th className="text-right px-3 py-2.5 font-semibold">Premium ($M)</th>
                <th className="text-right px-4 py-2.5 font-semibold">Hit ratio</th>
              </tr>
            </thead>
            <tbody>
              {TOP_BROKERS.map((b, i) => (
                <motion.tr key={b.name} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="border-t hover:bg-muted/20">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="size-7 rounded-lg bg-primary/10 grid place-items-center text-primary"><Building2 className="size-3.5" /></div>
                      <span className="font-semibold">{b.name}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums">{b.submissions}</td>
                  <td className="px-3 py-3 text-right tabular-nums">{b.bound}</td>
                  <td className="px-3 py-3 text-right tabular-nums font-semibold">${b.premium.toFixed(1)}M</td>
                  <td className="px-4 py-3 text-right">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold tabular-nums ${
                      b.hitRatio >= 28 ? "bg-emerald-100 text-emerald-700" : "bg-primary/10 text-primary"
                    }`}>{b.hitRatio}%</span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChartCard>

      {/* Team performance */}
      <section className="mt-4 rounded-2xl border bg-card overflow-hidden shadow-[0_1px_0_rgba(15,23,42,0.04)]">
        <header className="px-5 py-4 border-b">
          <h3 className="font-display font-bold text-[15px]">Underwriter performance</h3>
          <p className="text-[12px] text-muted-foreground mt-0.5">Live workload, hit rate, and turnaround across the team.</p>
        </header>
        <table className="w-full text-[12.5px]">
          <thead className="bg-muted/40 text-[10px] uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="text-left px-5 py-2.5 font-semibold">Underwriter</th>
              <th className="text-right px-3 py-2.5 font-semibold">In Review</th>
              <th className="text-right px-3 py-2.5 font-semibold">Quoted</th>
              <th className="text-right px-3 py-2.5 font-semibold">Bound</th>
              <th className="text-right px-3 py-2.5 font-semibold">Hit ratio</th>
              <th className="text-right px-5 py-2.5 font-semibold">Days to quote</th>
            </tr>
          </thead>
          <tbody>
            {TEAM.map(t => (
              <tr key={t.name} className="border-t hover:bg-muted/20">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-xl bg-gradient-to-br from-primary to-[#1E40AF] text-white grid place-items-center text-[11px] font-bold">{t.initials}</div>
                    <div>
                      <div className="font-semibold">{t.name}</div>
                      <div className="text-[11px] text-muted-foreground">{t.role}</div>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3 text-right tabular-nums">{t.inReview}</td>
                <td className="px-3 py-3 text-right tabular-nums">{t.quoted}</td>
                <td className="px-3 py-3 text-right tabular-nums">{t.bound}</td>
                <td className="px-3 py-3 text-right tabular-nums font-semibold text-primary">{t.hitRatio}%</td>
                <td className="px-5 py-3 text-right tabular-nums">{t.daysToQuote}d</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </PageBody>
  );
}
