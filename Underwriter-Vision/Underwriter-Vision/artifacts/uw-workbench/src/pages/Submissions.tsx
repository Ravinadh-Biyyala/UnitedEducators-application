import { useState, useMemo } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Search, Filter, Plus, ArrowUpRight, LayoutGrid, List } from "lucide-react";
import { PageBody, SectionTitle, StatusPill, statusTone, StageRail } from "@/components/Primitives";
import { SUBMISSIONS, type Submission } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { PageRegister } from "@/components/companion/PageRegister";
import { detectIntent, FALLBACK_HELP } from "@/lib/companionNlu";
import { newId, now, type CompanionMsg } from "@/components/companion/CompanionContext";

const VIEWS = [
  { id: "all", label: "All", count: SUBMISSIONS.length },
  { id: "mine", label: "Mine", count: SUBMISSIONS.filter(s => s.assignee === "Maya Khanna").length },
  { id: "review", label: "In Review", count: SUBMISSIONS.filter(s => s.status === "In Review").length },
  { id: "quoted", label: "Quoted", count: SUBMISSIONS.filter(s => s.status === "Quoted").length },
  { id: "pending", label: "Pending Info", count: SUBMISSIONS.filter(s => s.status === "Pending Info").length },
  { id: "bound", label: "Bound", count: SUBMISSIONS.filter(s => s.status === "Bound").length },
] as const;

export function Submissions() {
  const [view, setView] = useState<typeof VIEWS[number]["id"]>("all");
  const [q, setQ] = useState("");
  const [layout, setLayout] = useState<"table" | "grid">("table");

  const filtered = useMemo(() => {
    let list = SUBMISSIONS;
    if (view === "mine") list = list.filter(s => s.assignee === "Maya Khanna");
    if (view === "review") list = list.filter(s => s.status === "In Review");
    if (view === "quoted") list = list.filter(s => s.status === "Quoted");
    if (view === "pending") list = list.filter(s => s.status === "Pending Info");
    if (view === "bound") list = list.filter(s => s.status === "Bound");
    if (q) {
      const t = q.toLowerCase();
      list = list.filter(s => [s.id, s.member, s.broker, s.assignee, s.type, s.state].join(" ").toLowerCase().includes(t));
    }
    return list;
  }, [view, q]);

  return (
    <PageBody className="!pt-6">
      <PageRegister
        routeKey="submissions"
        title="Submissions"
        subtitle={`${filtered.length} of ${SUBMISSIONS.length}`}
        greeting="Your full queue. I can spin up a new submission from a broker packet, sort by SLA risk, or surface anything sitting too long."
        suggestions={[
          { id: "new", label: "Start a new submission", hint: "Drop docs → I'll prefill everything", tone: "blue", icon: "Plus", navigateTo: "/submissions/new" },
          { id: "sla", label: "What's slipping SLA?", hint: "Order by need-by urgency", tone: "red", icon: "AlertTriangle" },
          { id: "appetite", label: "Show appetite distribution", hint: "Across this queue", tone: "gold", icon: "ChartPie" },
          { id: "open-brookfield", label: "Open Brookfield (SUB-7829)", hint: "Today's priority", tone: "violet", icon: "Building2", navigateTo: "/submission/SUB-7829" },
        ]}
        facts={() => {
          const lines = SUBMISSIONS.slice(0, 30).map(s =>
            `- ${s.id} · ${s.member} (${s.shortName}) · ${s.type} · ${s.state} · ${s.status} · premium ${s.premium} · broker ${s.broker} · owner ${s.assignee}`
          ).join("\n");
          return `Submissions queue (showing ${Math.min(30, SUBMISSIONS.length)} of ${SUBMISSIONS.length}; current view "${view}", search "${q || "—"}"):\n${lines}`;
        }}
        respond={(sid) => {
          if (sid === "sla") return [{ id: newId(), role: "agent", kind: "viz", ts: now(),
            viz: { kind: "bars", title: "Days remaining (top 5)", series: SUBMISSIONS.slice(0, 5).map(s => ({
              label: s.shortName, value: parseInt(s.needByUrgency) || 14,
              tone: (parseInt(s.needByUrgency) || 14) <= 5 ? "red" : (parseInt(s.needByUrgency) || 14) <= 10 ? "gold" : "green",
            })), unit: "d" } }];
          if (sid === "appetite") {
            const buckets = { strong: 0, fit: 0, watch: 0, decline: 0 };
            SUBMISSIONS.forEach(s => s.appetite >= 80 ? buckets.strong++ : s.appetite >= 65 ? buckets.fit++ : s.appetite >= 45 ? buckets.watch++ : buckets.decline++);
            return [{ id: newId(), role: "agent", kind: "viz", ts: now(), viz: { kind: "donut", title: "Appetite distribution", segments: [
              { label: "Strong (≥80)", value: buckets.strong, color: "#0123D4" },
              { label: "Fit (65-79)", value: buckets.fit, color: "#1E40AF" },
              { label: "Watch (45-64)", value: buckets.watch, color: "#C9A227" },
              { label: "Decline (<45)", value: buckets.decline, color: "#E11D48" },
            ] } }];
          }
          return;
        }}
        freeText={(text) => {
          const intent = detectIntent(text);
          const open = SUBMISSIONS.filter(s => s.status !== "Bound" && s.status !== "Declined");
          const slipping = [...SUBMISSIONS].sort((a, b) => (parseInt(a.needByUrgency) || 99) - (parseInt(b.needByUrgency) || 99));
          const list = (title: string, rows: Submission[], emptyText: string): CompanionMsg[] => rows.length
            ? [{ id: newId(), role: "agent", kind: "viz", ts: now(), viz: {
                kind: "checklist", title,
                items: rows.slice(0, 8).map(s => ({
                  ok: s.status === "Bound", label: `${s.shortName} · ${s.id}`,
                  sub: `${s.status} · ${s.premium} · ${s.broker} · need by ${s.needByDate}`,
                })),
              } }]
            : [{ id: newId(), role: "agent", kind: "text", ts: now(), text: emptyText }];

          switch (intent.kind) {
            case "remaining":
              return list(`${open.length} open submissions`, open, "Queue is clear — every submission is bound or declined.");
            case "overdue": {
              const od = SUBMISSIONS.filter(s => (parseInt(s.needByUrgency) || 99) <= 5);
              return list(`${od.length} slipping SLA (≤5 days)`, od, "Nothing is slipping SLA right now.");
            }
            case "priority": {
              const lst = SUBMISSIONS.filter(s => intent.level === "Critical" ? s.priority === "Critical" : s.priority === "High" || s.priority === "Critical");
              return list(`${lst.length} ${intent.level.toLowerCase()}`, lst, `No ${intent.level.toLowerCase()} submissions.`);
            }
            case "count":
              return [{ id: newId(), role: "agent", kind: "text", ts: now(),
                text: `${SUBMISSIONS.length} total · ${open.length} open · ${SUBMISSIONS.filter(s => s.status === "Quoted").length} quoted · ${SUBMISSIONS.filter(s => s.status === "Bound").length} bound.` }];
            case "next":
              return slipping[0]
                ? [{ id: newId(), role: "agent", kind: "navigate", ts: now(),
                    text: `Highest urgency is ${slipping[0].shortName} (${slipping[0].id}) — need by ${slipping[0].needByDate}.`,
                    href: `/submission/${slipping[0].id}`, label: `Open ${slipping[0].shortName}` }]
                : [{ id: newId(), role: "agent", kind: "text", ts: now(), text: "Nothing pressing." }];
            case "search": {
              const term = intent.term;
              const hits = SUBMISSIONS.filter(s =>
                [s.id, s.member, s.shortName, s.broker, s.assignee, s.type, s.state].join(" ").toLowerCase().includes(term)
              );
              if (hits.length === 1) {
                const h = hits[0];
                return [{ id: newId(), role: "agent", kind: "navigate", ts: now(),
                  text: `Found ${h.member} (${h.id}) — ${h.status}, ${h.premium}.`,
                  href: `/submission/${h.id}`, label: `Open ${h.shortName}` }];
              }
              return list(`${hits.length} matches for "${term}"`, hits, `No submissions match "${term}".`);
            }
            case "summary": {
              const totalPrem = SUBMISSIONS.reduce((a, s) => a + s.premiumVal, 0);
              const brokerCounts: Record<string, number> = {};
              SUBMISSIONS.forEach(s => { brokerCounts[s.broker] = (brokerCounts[s.broker] || 0) + 1; });
              const topBroker = Object.entries(brokerCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
              return [{ id: newId(), role: "agent", kind: "text", ts: now(),
                text: `${SUBMISSIONS.length} submissions · $${(totalPrem / 1_000_000).toFixed(1)}M total premium · ${open.length} open · top broker: ${topBroker}.` }];
            }
            case "greeting":
              return [{ id: newId(), role: "agent", kind: "text", ts: now(), text: `Hi. Your queue has ${open.length} open submissions. Want the SLA risk view?` }];
            case "thanks":
              return [{ id: newId(), role: "agent", kind: "text", ts: now(), text: "Anytime." }];
            case "help":
              return [{ id: newId(), role: "agent", kind: "text", ts: now(), text: FALLBACK_HELP }];
            default:
              return;
          }
        }}
      />
      <SectionTitle
        eyebrow="Workbench"
        title="Submissions"
        sub="Every submission, every stage — one queue. Filter, search, and dive into any account."
        action={
          <Link href="/submissions/new" className="hidden md:inline-flex items-center gap-2 h-10 px-4 rounded-full bg-primary text-primary-foreground font-semibold text-sm shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-shadow">
            <Plus className="size-4" /> New submission
          </Link>
        }
      />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="flex items-center gap-1.5 bg-muted/60 rounded-full p-1 overflow-x-auto scroll-hidden">
          {VIEWS.map(v => (
            <button
              key={v.id}
              onClick={() => setView(v.id)}
              className={cn(
                "px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap",
                view === v.id ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {v.label} <span className="ml-1.5 opacity-60">{v.count}</span>
            </button>
          ))}
        </div>
        <div className="relative flex-1 min-w-[240px] max-w-md ml-auto">
          <Search className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="search" value={q} onChange={e => setQ(e.target.value)}
            placeholder="Search by member, broker, ID…"
            className="w-full h-10 pl-10 pr-3 rounded-full bg-muted/60 border border-transparent focus:bg-background focus:border-primary/30 focus:outline-none text-sm"
          />
        </div>
        <button className="h-10 px-4 rounded-full bg-muted/60 hover:bg-muted text-sm font-medium flex items-center gap-2">
          <Filter className="size-4" /> Filters
        </button>
        <div className="flex items-center bg-muted/60 rounded-full p-1">
          <button onClick={() => setLayout("table")} className={cn("size-8 rounded-full grid place-items-center", layout==="table" && "bg-white shadow-sm")}>
            <List className="size-4" />
          </button>
          <button onClick={() => setLayout("grid")} className={cn("size-8 rounded-full grid place-items-center", layout==="grid" && "bg-white shadow-sm")}>
            <LayoutGrid className="size-4" />
          </button>
        </div>
      </div>

      {layout === "table" ? <TableView rows={filtered} /> : <GridView rows={filtered} />}
    </PageBody>
  );
}

function TableView({ rows }: { rows: Submission[] }) {
  return (
    <div className="rounded-2xl border bg-card overflow-hidden">
      <div className="overflow-x-auto scroll-thin">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-[10px] uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="text-left px-5 py-3 font-semibold">Member · ID</th>
              <th className="text-left px-3 py-3 font-semibold">Type</th>
              <th className="text-left px-3 py-3 font-semibold">Stage</th>
              <th className="text-right px-3 py-3 font-semibold">Premium</th>
              <th className="text-right px-3 py-3 font-semibold">Appetite</th>
              <th className="text-right px-3 py-3 font-semibold">Loss</th>
              <th className="text-left px-3 py-3 font-semibold">Need by</th>
              <th className="text-left px-3 py-3 font-semibold">UW</th>
              <th className="text-left px-5 py-3 font-semibold">Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((s, i) => (
              <motion.tr
                key={s.id}
                initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}
                className="border-t hover:bg-muted/40 transition-colors group"
              >
                <td className="px-5 py-3.5">
                  <Link href={`/submission/${s.id}`} className="block">
                    <div className="font-semibold text-foreground group-hover:text-primary transition-colors">{s.member}</div>
                    <div className="text-[11px] text-muted-foreground mt-0.5">{s.id} · {s.broker}</div>
                  </Link>
                </td>
                <td className="px-3 py-3.5">
                  <div className="text-xs text-foreground/80">{s.type}</div>
                  <div className="text-[11px] text-muted-foreground">{s.city}</div>
                </td>
                <td className="px-3 py-3.5">
                  <StatusPill tone={statusTone(s.stage)} size="sm">{s.stage}</StatusPill>
                </td>
                <td className="px-3 py-3.5 text-right font-mono-tabular font-semibold">{s.premium}</td>
                <td className="px-3 py-3.5 text-right">
                  <span className={cn("font-mono-tabular text-sm font-semibold",
                    s.appetite >= 80 ? "text-emerald-700" : s.appetite >= 60 ? "text-amber-700" : "text-rose-700")}>
                    {s.appetite}
                  </span>
                </td>
                <td className="px-3 py-3.5 text-right font-mono-tabular text-xs">{s.lossRatio}</td>
                <td className="px-3 py-3.5">
                  <div className="text-xs">{s.needByDate}</div>
                  <div className={cn("text-[10px]", s.needByUrgency.includes("day") && parseInt(s.needByUrgency) <= 5 ? "text-rose-600 font-semibold" : "text-muted-foreground")}>
                    {s.needByUrgency}
                  </div>
                </td>
                <td className="px-3 py-3.5">
                  <div className="flex items-center gap-2">
                    <span className="size-7 rounded-full bg-gradient-to-br from-primary to-[#1E40AF] text-white text-[10px] font-bold grid place-items-center">{s.assigneeInitials}</span>
                    <span className="text-xs">{s.assignee.split(" ")[0]}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <StatusPill tone={statusTone(s.status)} size="sm">{s.status}</StatusPill>
                </td>
                <td className="px-3 py-3.5">
                  <Link href={`/submission/${s.id}`} className="text-muted-foreground hover:text-primary inline-flex"><ArrowUpRight className="size-4" /></Link>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function GridView({ rows }: { rows: Submission[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {rows.map((s, i) => (
        <motion.div key={s.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
          <Link href={`/submission/${s.id}`} className="block rounded-2xl border bg-card p-5 lift-card group">
              <div className="flex items-start gap-3">
                <div className="size-11 rounded-xl bg-gradient-to-br from-primary/15 to-accent/15 grid place-items-center text-primary font-bold text-sm shrink-0">
                  {s.shortName.split(" ").map(w => w[0]).slice(0, 2).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate group-hover:text-primary transition-colors">{s.member}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">{s.id} · {s.type} · {s.state}</div>
                </div>
                <StatusPill tone={statusTone(s.status)} size="sm">{s.status}</StatusPill>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <Mini label="Premium" value={s.premium} />
                <Mini label="Appetite" value={`${s.appetite}`} tone={s.appetite > 80 ? "good" : "warn"} />
                <Mini label="Loss" value={s.lossRatio} />
              </div>
              <div className="mt-4">
                <StageRail current={stageGroupOf(s.stage)} compact />
              </div>
              <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
                <span>UW {s.assignee.split(" ")[0]}</span>
                <span>Need by {s.needByDate}</span>
              </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}

function Mini({ label, value, tone }: { label: string; value: string; tone?: "good" | "warn" }) {
  return (
    <div className="rounded-lg bg-muted/40 py-2">
      <div className={cn("font-mono-tabular text-sm font-bold",
        tone === "good" && "text-emerald-700", tone === "warn" && "text-amber-700")}>{value}</div>
      <div className="text-[9px] uppercase tracking-wider text-muted-foreground mt-0.5">{label}</div>
    </div>
  );
}

function stageGroupOf(stage: string): string {
  if (["Information Gathering", "Review In Progress", "Referred"].includes(stage)) return "Underwriting";
  if (["Quote In Progress", "Quote Sent", "Quote Negotiation", "Revised Quote"].includes(stage)) return "Quoting";
  if (["Bound", "UE Non-Renewed", "Member Declined", "Member No Response"].includes(stage)) return "Decision";
  if (["Pending Issuance", "Issued", "Cancelled", "Endorsed"].includes(stage)) return "Post-Bind";
  return "Intake & Triage";
}
