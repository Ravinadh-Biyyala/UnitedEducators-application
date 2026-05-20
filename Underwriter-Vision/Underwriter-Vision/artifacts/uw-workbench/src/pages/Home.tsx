import { Fragment, useMemo } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  Sparkles, ArrowRight, AlertCircle, Clock, Users,
  Activity, Bot, ChevronRight, Inbox, FileCheck2, ShieldCheck,
} from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { PageBody } from "@/components/Primitives";
import { MetricTile, StatusPill, statusTone, Sparkline, StageRail } from "@/components/Primitives";
import { useRole } from "@/hooks/useRole";
import { KPIS_BY_ROLE, SUBMISSIONS, TASKS, ACTIVITY, PIPELINE, TEAM, ROLES } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { PageRegister } from "@/components/companion/PageRegister";
import { PinnedDashboard } from "@/components/companion/PinnedDashboard";
import { newId, now, type CompanionMsg } from "@/components/companion/CompanionContext";
import { detectIntent, FALLBACK_HELP } from "@/lib/companionNlu";

export function Home() {
  const { roleId } = useRole();
  const role = ROLES[roleId];
  const kpis = KPIS_BY_ROLE[roleId];

  const mySubmissions = useMemo(
    () => SUBMISSIONS.filter(s => roleId === "uw" ? s.assignee === "Maya Khanna" :
                                  roleId === "sr-uw" ? s.assignee === "John Michaels" :
                                  true).slice(0, 5),
    [roleId]
  );
  const urgentTasks = TASKS.filter(t => t.priority === "Critical" || t.overdue).slice(0, 4);

  return (
    <PageBody className="!max-w-[1500px] mx-auto !pt-6">
      <PageRegister
        routeKey="home"
        title="Workbench"
        subtitle={`Good morning, ${role.name.split(" ")[0]}`}
        greeting={`Three things ready: Brookfield is ready to quote, one referral is past SLA, and two appetite scores moved overnight. Want me to plot today, or jump straight to Brookfield?`}
        suggestions={[
          { id: "brookfield", label: "Open Brookfield Day School", hint: "Today's priority", tone: "blue", icon: "Building2", navigateTo: "/submission/SUB-7829" },
          { id: "today", label: "Show today's pipeline", tone: "gold", icon: "BarChart3" },
          { id: "urgent", label: "What's urgent?", hint: `${urgentTasks.length} items`, tone: "red", icon: "AlertTriangle" },
          { id: "new-sub", label: "Start a new submission", tone: "violet", icon: "Plus", navigateTo: "/submissions/new" },
        ]}
        facts={() => {
          const open = SUBMISSIONS.filter(s => s.status !== "Bound" && s.status !== "Declined");
          const overdue = TASKS.filter(t => t.overdue);
          const critical = TASKS.filter(t => t.priority === "Critical");
          const subLines = SUBMISSIONS.slice(0, 12).map(s =>
            `  · ${s.id} ${s.shortName} (${s.type}, ${s.state}) — ${s.status}, ${s.premium}, owner ${s.assignee}`
          ).join("\n");
          const taskLines = urgentTasks.map(t => `  · "${t.title}" · ${t.submissionShort} · due ${t.due}${t.overdue ? " (OVERDUE)" : ""}`).join("\n");
          const pipe = PIPELINE.map(p => `${p.month}:${p.bound}`).join(" ");
          return `Role: ${role.name} (${role.title}).
Pipeline (bound by month): ${pipe}.
Submissions: ${SUBMISSIONS.length} total, ${open.length} open. Top of queue:\n${subLines}
Tasks: ${TASKS.length} total, ${overdue.length} overdue, ${critical.length} critical. Urgent now:\n${taskLines}`;
        }}
        respond={(sid) => {
          if (sid === "today") return [{ id: newId(), role: "agent", kind: "viz", ts: now(), viz: {
            kind: "linecard",
            title: "Pipeline · policies bound by month",
            intro: `${PIPELINE[PIPELINE.length - 1]!.bound} policies bound this month — momentum has nearly tripled since October on stronger broker activity.`,
            data: PIPELINE.map(p => ({ label: p.month, value: p.bound })),
            yFormat: "number",
            cta: "add-to-dashboard", dashboardHref: "/",
          } }];
          if (sid === "urgent") return [{ id: newId(), role: "agent", kind: "viz", ts: now(), viz: {
            kind: "checklist", title: "Urgent today",
            items: urgentTasks.map(t => ({ ok: false, label: t.title, sub: `${t.submissionShort} · ${t.due}` })),
          } }];
          return;
        }}
        freeText={(text) => {
          const intent = detectIntent(text);
          const open = SUBMISSIONS.filter(s => s.status !== "Bound" && s.status !== "Declined");
          const overdue = TASKS.filter(t => t.overdue);
          const critical = TASKS.filter(t => t.priority === "Critical");

          switch (intent.kind) {
            case "remaining":
            case "next":
              return [{ id: newId(), role: "agent", kind: "viz", ts: now(), viz: {
                kind: "checklist", title: "What I'd tackle next",
                items: urgentTasks.map(t => ({ ok: false, label: t.title, sub: `${t.submissionShort} · ${t.due}` })),
              } }] as CompanionMsg[];
            case "overdue":
              return [{ id: newId(), role: "agent", kind: "viz", ts: now(), viz: {
                kind: "checklist", title: `${overdue.length} overdue`,
                items: overdue.slice(0, 6).map(t => ({ ok: false, label: t.title, sub: `${t.submissionShort} · was due ${t.due}` })),
              } }] as CompanionMsg[];
            case "priority":
              return [{ id: newId(), role: "agent", kind: "viz", ts: now(), viz: {
                kind: "checklist", title: `${critical.length} critical`,
                items: critical.slice(0, 6).map(t => ({ ok: false, label: t.title, sub: `${t.submissionShort} · ${t.due}` })),
              } }] as CompanionMsg[];
            case "count":
              return [{ id: newId(), role: "agent", kind: "text", ts: now(),
                text: `Today: ${open.length} open submissions, ${TASKS.length} tasks (${overdue.length} overdue, ${critical.length} critical).` }];
            case "search": {
              const term = intent.term;
              const hits = SUBMISSIONS.filter(s =>
                [s.id, s.member, s.shortName, s.broker, s.assignee].join(" ").toLowerCase().includes(term)
              );
              if (hits.length === 1) {
                return [{ id: newId(), role: "agent", kind: "navigate", ts: now(),
                  text: `Found ${hits[0].member} (${hits[0].id}) — ${hits[0].status}.`,
                  href: `/submission/${hits[0].id}`, label: `Open ${hits[0].shortName}` }];
              }
              if (hits.length > 1) {
                return [{ id: newId(), role: "agent", kind: "viz", ts: now(), viz: {
                  kind: "checklist", title: `${hits.length} matches for "${term}"`,
                  items: hits.slice(0, 6).map(s => ({ ok: false, label: `${s.shortName} · ${s.id}`, sub: `${s.status} · ${s.premium}` })),
                } }];
              }
              return [{ id: newId(), role: "agent", kind: "text", ts: now(), text: `No submission mentions "${term}".` }];
            }
            case "summary":
              return [{ id: newId(), role: "agent", kind: "text", ts: now(),
                text: `${open.length} open submissions, $${(SUBMISSIONS.reduce((a, s) => a + s.premiumVal, 0) / 1_000_000).toFixed(1)}M total in pipeline. ${overdue.length} overdue tasks, ${critical.length} critical. Brookfield is ready to quote.` }];
            case "greeting":
              return [{ id: newId(), role: "agent", kind: "text", ts: now(), text: `Hi ${role.name.split(" ")[0]}. Want today's pipeline or to jump to Brookfield?` }];
            case "thanks":
              return [{ id: newId(), role: "agent", kind: "text", ts: now(), text: "Anytime." }];
            case "help":
              return [{ id: newId(), role: "agent", kind: "text", ts: now(), text: FALLBACK_HELP }];
            default:
              return;
          }
        }}
      />
      {/* Hero greeting */}
      <motion.section
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        className="@container relative overflow-hidden rounded-3xl hero-mesh text-white p-6 @lg:p-7 @3xl:p-8 mb-6"
      >
        {/* Subtle aurora wash */}
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-16 size-[460px] rounded-full bg-accent/15 blur-[120px]" />
          <div className="absolute -bottom-32 -left-10 size-[380px] rounded-full bg-primary/30 blur-[110px]" />
        </div>

        <div className="relative z-10 grid grid-cols-1 @4xl:grid-cols-[minmax(0,1fr)_360px] @5xl:grid-cols-[minmax(0,1fr)_400px] gap-6 @4xl:gap-10 items-center">
          {/* Left: greeting */}
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur rounded-full px-3 py-1.5 text-[11px] font-semibold mb-4 border border-white/20">
              <Sparkles className="size-3.5 text-accent" />
              <span>Companion has 3 things ready for you</span>
            </div>
            <h1 className="font-display text-3xl @lg:text-4xl @5xl:text-[42px] font-bold leading-[1.08] tracking-tight">
              Good morning, {role.name.split(" ")[0]}.
            </h1>
            <p className="font-display text-xl @lg:text-2xl @5xl:text-[28px] font-semibold leading-[1.18] text-white/70 mt-1.5">
              Five accounts await your attention today.
            </p>
            <p className="mt-4 text-white/75 text-[13px] leading-relaxed max-w-xl">
              One referral is past SLA, two appetite scores were updated overnight,
              and Brookfield Day School is ready to quote.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <Link href="/submission/SUB-7829" className="inline-flex items-center gap-2 h-10 px-5 rounded-full bg-white text-primary font-semibold text-sm shadow-lg hover:scale-[1.02] transition-transform">
                Continue Brookfield Day
                <ArrowRight className="size-4" />
              </Link>
              <Link href="/submissions" className="inline-flex items-center gap-2 h-10 px-5 rounded-full bg-white/10 backdrop-blur border border-white/30 text-white font-semibold text-sm hover:bg-white/15 transition-colors">
                View all submissions
              </Link>
            </div>
          </div>

          {/* Right: Companion brief — meaningful, curated, brand-glass.
              Stacks below the greeting on narrow hero widths; sits to the right at @4xl+ */}
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative rounded-2xl overflow-hidden border border-white/15 bg-white/[0.06] backdrop-blur-xl shadow-[0_20px_60px_-20px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.12)]"
          >
            <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-accent/60 to-transparent" />
            <div className="px-5 py-3.5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] uppercase tracking-[0.14em] font-bold text-white/70">Companion brief</span>
              </div>
              <span className="text-[10px] text-white/50">Just now</span>
            </div>

            <ul className="divide-y divide-white/10">
              {[
                { l: "Brookfield Day School ready to quote", sub: "Packet read · zero gaps · 89/100 appetite", icon: ShieldCheck, tone: "bg-emerald-400/15 text-emerald-300", href: "/submission/SUB-7829", cta: "Open" },
                { l: "Brentwood Academy referral past SLA", sub: "Awaiting Robert Chen · 28h elapsed", icon: AlertCircle, tone: "bg-accent/20 text-accent", href: "/submission/SUB-7821", cta: "Nudge" },
                { l: "2 appetite scores moved overnight", sub: "Cyber re-weighting on K-12 cohort", icon: Activity, tone: "bg-primary/25 text-white", href: "/appetite", cta: "Review" },
              ].map((b) => {
                const Icon = b.icon;
                return (
                  <li key={b.l}>
                    <Link href={b.href} className="group flex items-center gap-3 px-5 py-3 hover:bg-white/[0.06] transition-colors">
                      <span className={cn("size-8 rounded-xl grid place-items-center shrink-0", b.tone)}>
                        <Icon className="size-4" />
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-semibold leading-tight text-white truncate">{b.l}</div>
                        <div className="text-[11px] text-white/55 mt-0.5 truncate">{b.sub}</div>
                      </div>
                      <span className="text-[11px] font-semibold text-accent opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center gap-1">
                        {b.cta} <ArrowRight className="size-3" />
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>

            <div className="px-5 py-2.5 border-t border-white/10 flex items-center justify-between bg-white/[0.03]">
              <div className="text-[10px] text-white/55">
                Pipeline <span className="font-semibold text-white">$8.4M</span> · Quote in <span className="font-semibold text-white">3.8d</span>
              </div>
              <span className="text-[10px] uppercase tracking-wider font-bold text-accent">Live</span>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Conversion funnel strip — "today at a glance" */}
      <FunnelStrip />

      {/* Pinned-by-you dashboard — only renders when the user has pinned vizzes
          via the Companion's "Add to Dashboard" CTA. */}
      <PinnedDashboard />

      {/* KPI grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {kpis.map((k, i) => (
          <motion.div key={k.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
            <MetricTile {...k} />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Smart queue */}
        <div className="lg:col-span-2 space-y-6">
          {/* Companion picks */}
          <section className="rounded-2xl border bg-card overflow-hidden">
            <div className="px-5 py-4 border-b flex items-center justify-between bg-gradient-to-r from-primary/5 via-accent/5 to-transparent">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="size-4 text-accent" />
                  <h3 className="font-display font-bold text-lg">Companion picks for you</h3>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Ranked by impact, urgency, and fit with your appetite.</p>
              </div>
              <Link href="/submissions" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">See all <ChevronRight className="size-3.5" /></Link>
            </div>
            <ul className="divide-y">
              {mySubmissions.map((s, i) => (
                <motion.li
                  key={s.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                >
                  <Link href={`/submission/${s.id}`} className="group block px-5 py-4 hover:bg-muted/40 transition-colors">
                      <div className="flex items-start gap-4">
                        <div className="size-11 rounded-xl bg-gradient-to-br from-primary/15 to-accent/15 grid place-items-center text-primary font-bold font-display text-sm shrink-0">
                          {s.shortName.split(" ").map(w => w[0]).slice(0, 2).join("")}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-foreground truncate">{s.member}</span>
                            <StatusPill tone={statusTone(s.status)} size="sm">{s.status}</StatusPill>
                            {s.priority === "Critical" && <StatusPill tone="red" size="sm">Critical · {s.needByUrgency}</StatusPill>}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1 flex items-center gap-3 flex-wrap">
                            <span>{s.id}</span>
                            <span>·</span>
                            <span>{s.type} · {s.state}</span>
                            <span>·</span>
                            <span>{s.broker}</span>
                            <span>·</span>
                            <span>Need by {s.needByDate}</span>
                          </div>
                          <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
                            <Stat label="Quoted Premium" value={s.premium} />
                            <Stat label="Appetite" value={`${s.appetite}/100`} tone={s.appetite > 80 ? "good" : s.appetite > 60 ? "warn" : "bad"} />
                            <Stat label="Loss Ratio" value={s.lossRatio} />
                            <Stat label="Reviews" value={`${s.reviewProgress}/6`} />
                          </div>
                          <div className="mt-3">
                            <StageRail current={stageGroupOf(s.stage)} compact />
                          </div>
                        </div>
                        <ArrowRight className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-2" />
                      </div>
                  </Link>
                </motion.li>
              ))}
            </ul>
          </section>

          {/* Pipeline chart */}
          <section className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-card via-card to-primary/[0.04] p-5">
            <div className="absolute -top-24 -right-24 size-64 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 size-64 rounded-full bg-accent/5 blur-3xl pointer-events-none" />
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-display font-bold text-lg">Pipeline trend</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Submitted · Quoted · Bound — last 6 months</p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <Legend dot="#0123D4" label="Submitted" />
                <Legend dot="#C9A227" label="Quoted" />
                <Legend dot="#10B981" label="Bound" />
              </div>
            </div>
            <div style={{ width: "100%", height: 240 }}>
              <ResponsiveContainer>
                <AreaChart data={PIPELINE} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="g-sub" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#0123D4" stopOpacity={0.34} />
                      <stop offset="100%" stopColor="#0123D4" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="g-q" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#C9A227" stopOpacity={0.34} />
                      <stop offset="100%" stopColor="#C9A227" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="g-b" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10B981" stopOpacity={0.34} />
                      <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="hsl(var(--border))" vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} fontSize={11} />
                  <YAxis stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} fontSize={11} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))", fontSize: 12 }} />
                  <Area type="monotone" dataKey="submitted" stroke="#0123D4" strokeWidth={2.5} fill="url(#g-sub)" />
                  <Area type="monotone" dataKey="quoted" stroke="#C9A227" strokeWidth={2.5} fill="url(#g-q)" />
                  <Area type="monotone" dataKey="bound" stroke="#10B981" strokeWidth={2.5} fill="url(#g-b)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>

        {/* Right column: tasks + activity + team */}
        <div className="space-y-6">
          {/* Urgent tasks */}
          <section className="rounded-2xl border bg-card overflow-hidden">
            <div className="px-5 py-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="size-4 text-rose-600" />
                <h3 className="font-display font-bold">Urgent Today</h3>
              </div>
              <Link href="/tasks" className="text-xs text-primary font-semibold hover:underline">All</Link>
            </div>
            <ul className="divide-y">
              {urgentTasks.map(t => (
                <li key={t.id} className="px-5 py-3 hover:bg-muted/40 transition-colors">
                  <div className="flex items-start gap-3">
                    <span className={cn("mt-1 size-2 rounded-full shrink-0",
                      t.priority === "Critical" ? "bg-rose-500" : t.overdue ? "bg-amber-500" : "bg-primary"
                    )} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-snug">{t.title}</p>
                      <div className="text-[11px] text-muted-foreground mt-1 flex items-center gap-2 flex-wrap">
                        <span className="font-medium">{t.submissionShort}</span>
                        <span>·</span>
                        <Clock className="size-3" />
                        <span className={cn(t.overdue && "text-rose-600 font-semibold")}>
                          {t.overdue ? "Overdue" : "Due"} {t.due}
                        </span>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* Activity feed */}
          <section className="rounded-2xl border bg-card overflow-hidden">
            <div className="px-5 py-4 border-b flex items-center gap-2">
              <Activity className="size-4 text-primary" />
              <h3 className="font-display font-bold">Live activity</h3>
            </div>
            <ul className="px-5 py-3 space-y-3">
              {ACTIVITY.map(a => (
                <li key={a.id} className="flex items-start gap-3 text-sm">
                  <span className={cn(
                    "size-7 rounded-lg grid place-items-center shrink-0 text-xs font-semibold",
                    a.kind === "ai" ? "bg-gradient-to-br from-primary to-accent text-white" :
                    a.kind === "broker" ? "bg-amber-100 text-amber-800" :
                    "bg-primary/10 text-primary"
                  )}>
                    {a.kind === "ai" ? <Bot className="size-3.5" /> : a.who.split(" ").map(w=>w[0]).slice(0,2).join("")}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="leading-snug">
                      <span className="font-semibold">{a.who}</span>{" "}
                      <span className="text-muted-foreground">{a.action}</span>{" "}
                      <span className="font-semibold">{a.target}</span>
                    </p>
                    <span className="text-[10px] text-muted-foreground">{a.time}</span>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* Team */}
          <section className="rounded-2xl border bg-card overflow-hidden">
            <div className="px-5 py-4 border-b flex items-center gap-2">
              <Users className="size-4 text-primary" />
              <h3 className="font-display font-bold">Team performance</h3>
            </div>
            <ul className="divide-y">
              {TEAM.map(t => (
                <li key={t.name} className="px-5 py-3 flex items-center gap-3">
                  <div className="size-9 rounded-xl bg-gradient-to-br from-primary to-[#1E40AF] text-white grid place-items-center text-xs font-bold shrink-0">
                    {t.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate">{t.name}</div>
                    <div className="text-[11px] text-muted-foreground">{t.role}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold font-mono-tabular">{t.hitRatio}%</div>
                    <div className="text-[10px] text-muted-foreground">hit ratio</div>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </PageBody>
  );
}

function FunnelStrip() {
  const last = PIPELINE[PIPELINE.length - 1];
  const prev = PIPELINE[PIPELINE.length - 2];
  const stages = [
    { key: "submitted", label: "Submitted", value: last.submitted, prev: prev.submitted, icon: Inbox,       dot: "#0123D4" },
    { key: "quoted",    label: "Quoted",    value: last.quoted,    prev: prev.quoted,    icon: FileCheck2,  dot: "#C9A227" },
    { key: "bound",     label: "Bound",     value: last.bound,     prev: prev.bound,     icon: ShieldCheck, dot: "#0B1A6E" },
  ];
  const conv = (a: number, b: number) => `${Math.round((b / a) * 100)}%`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
      className="mb-6 rounded-xl border bg-card p-4 shadow-[0_1px_2px_rgba(11,26,110,0.04),0_8px_24px_-12px_rgba(11,26,110,0.10)]"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-baseline gap-2">
          <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-bold">Conversion funnel</div>
          <span className="text-[10px] text-muted-foreground">·</span>
          <h3 className="font-display text-[13px] font-bold text-foreground">{last.month}</h3>
        </div>
        <div className="hidden md:flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <span className="inline-block size-1.5 rounded-full bg-emerald-500/70" />
          Live
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_auto_1fr] gap-2 md:gap-2 items-stretch">
        {stages.map((s, i) => {
          const delta = s.value - s.prev;
          const positive = delta >= 0;
          return (
            <Fragment key={s.key}>
              <motion.div
                initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 + i * 0.06 }}
                className="relative overflow-hidden rounded-lg border bg-background/40 px-3.5 py-3 hover:border-foreground/20 transition-colors"
              >
                <div className="absolute inset-y-0 left-0 w-[3px]" style={{ background: s.dot }} />
                <div className="absolute -top-10 -right-10 size-24 rounded-full opacity-[0.07] blur-2xl pointer-events-none" style={{ background: s.dot }} />
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                    <span className="size-5 rounded-md grid place-items-center border" style={{ color: s.dot, borderColor: `${s.dot}26`, background: `${s.dot}10` }}>
                      <s.icon className="size-3" />
                    </span>
                    {s.label}
                  </div>
                  <span
                    className="text-[10px] font-bold font-mono-tabular px-1.5 h-4 rounded inline-flex items-center"
                    style={positive ? { color: s.dot, background: `${s.dot}14` } : { color: "var(--muted-foreground)", background: "rgba(0,0,0,0.04)" }}
                  >
                    {positive ? "+" : ""}{delta}
                  </span>
                </div>
                <div className="relative mt-1.5 font-display text-[24px] font-bold leading-none font-mono-tabular text-foreground">
                  {s.value}
                </div>
              </motion.div>
              {i < stages.length - 1 && (
                <div className="hidden md:flex flex-col items-center justify-center px-0.5 text-muted-foreground">
                  <div className="text-[9px] uppercase tracking-wider font-bold text-foreground/70">{conv(s.value, stages[i + 1].value)}</div>
                  <ArrowRight className="size-3 mt-0.5 opacity-60" />
                </div>
              )}
            </Fragment>
          );
        })}
      </div>
    </motion.div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "good" | "warn" | "bad" }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</div>
      <div className={cn("font-mono-tabular text-sm font-semibold mt-0.5",
        tone === "good" && "text-emerald-700",
        tone === "warn" && "text-amber-700",
        tone === "bad" && "text-rose-700",
      )}>{value}</div>
    </div>
  );
}

function Legend({ dot, label }: { dot: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-muted-foreground">
      <span className="size-2 rounded-full" style={{ background: dot }} />
      <span>{label}</span>
    </span>
  );
}

function stageGroupOf(stage: string): string {
  if (["Information Gathering", "Review In Progress", "Referred"].includes(stage)) return "Underwriting";
  if (["Quote In Progress", "Quote Sent", "Quote Negotiation", "Revised Quote"].includes(stage)) return "Quoting";
  if (["Bound", "UE Non-Renewed", "Member Declined", "Member No Response"].includes(stage)) return "Decision";
  if (["Pending Issuance", "Issued", "Cancelled", "Endorsed"].includes(stage)) return "Post-Bind";
  return "Intake & Triage";
}
