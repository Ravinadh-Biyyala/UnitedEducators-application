import { useState, useMemo } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Clock, AlertTriangle, CheckCircle2 } from "lucide-react";
import { PageBody, SectionTitle, StatusPill } from "@/components/Primitives";
import { TASKS, type Task } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { PageRegister } from "@/components/companion/PageRegister";
import { newId, now, type CompanionMsg } from "@/components/companion/CompanionContext";
import { detectIntent, FALLBACK_HELP } from "@/lib/companionNlu";

const FILTERS = [
  { id: "all", label: "All", fn: (_t: Task) => true },
  { id: "today", label: "Today", fn: (t: Task) => t.due.includes("Apr 19") || t.due.includes("Apr 20") },
  { id: "overdue", label: "Overdue", fn: (t: Task) => t.overdue },
  { id: "critical", label: "Critical", fn: (t: Task) => t.priority === "Critical" },
] as const;

export function Tasks() {
  const [filter, setFilter] = useState<typeof FILTERS[number]["id"]>("all");
  const [done, setDone] = useState<Set<number>>(new Set());

  const list = useMemo(() => TASKS.filter(FILTERS.find(f => f.id === filter)!.fn), [filter]);

  function toggle(id: number) {
    setDone(d => {
      const n = new Set(d);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }

  const overdue = TASKS.filter(t => t.overdue).length;
  const critical = TASKS.filter(t => t.priority === "Critical").length;
  return (
    <PageBody className="!pt-6 !max-w-[1300px] mx-auto">
      <PageRegister
        routeKey="tasks"
        title="Tasks"
        subtitle={`${TASKS.length} active · ${overdue} overdue`}
        greeting="Here's everything on your plate. I can group by submission, surface what's critical, or batch-complete routine items."
        suggestions={[
          { id: "critical", label: "Show critical only", hint: `${critical} tasks`, tone: "red", icon: "AlertTriangle" },
          { id: "overdue", label: "What's overdue?", hint: `${overdue} items`, tone: "gold", icon: "Clock" },
          { id: "by-cat", label: "Break down by category", tone: "blue", icon: "ChartPie" },
          { id: "open-brookfield", label: "Jump to Brookfield", hint: "Today's priority", tone: "violet", icon: "Building2", navigateTo: "/submission/SUB-7829" },
        ]}
        facts={() => {
          const lines = TASKS.map(t => {
            const status = done.has(t.id) ? "done" : t.overdue ? "OVERDUE" : "open";
            return `- [${status}] "${t.title}" · ${t.submissionShort} · ${t.priority} · ${t.category} · due ${t.due} · ${t.assignee}`;
          }).join("\n");
          return `Tasks (${TASKS.length} total, ${done.size} checked off in this session, ${overdue} overdue, ${critical} critical):\n${lines}`;
        }}
        respond={(sid) => {
          if (sid === "by-cat") {
            const cats: Record<string, number> = {};
            TASKS.forEach(t => { cats[t.category] = (cats[t.category] || 0) + 1; });
            const palette = ["#0123D4", "#1E40AF", "#C9A227", "#7B6217", "#10B981"];
            return [{ id: newId(), role: "agent", kind: "viz", ts: now(), viz: {
              kind: "donut", title: "Tasks by category",
              segments: Object.entries(cats).map(([label, value], i) => ({ label, value, color: palette[i % palette.length] })),
            } }];
          }
          if (sid === "overdue" || sid === "critical") {
            const lst = sid === "overdue" ? TASKS.filter(t => t.overdue) : TASKS.filter(t => t.priority === "Critical");
            return [{ id: newId(), role: "agent", kind: "viz", ts: now(), viz: {
              kind: "checklist", title: sid === "overdue" ? "Overdue" : "Critical",
              items: lst.slice(0, 6).map(t => ({ ok: false, label: t.title, sub: `${t.submissionShort} · due ${t.due}` })),
            } }];
          }
          return;
        }}
        freeText={(text) => {
          const intent = detectIntent(text);
          const open = TASKS.filter(t => !done.has(t.id));
          const closed = TASKS.filter(t => done.has(t.id));
          const overdueList = open.filter(t => t.overdue);

          const checklistMsg = (title: string, items: Task[], emptyText: string): CompanionMsg[] => items.length
            ? [{ id: newId(), role: "agent", kind: "viz", ts: now(), viz: {
                kind: "checklist", title,
                items: items.slice(0, 8).map(t => ({
                  ok: done.has(t.id), label: t.title,
                  sub: `${t.submissionShort} · ${t.priority} · due ${t.due}${t.overdue ? " (overdue)" : ""}`,
                })),
              } }]
            : [{ id: newId(), role: "agent", kind: "text", ts: now(), text: emptyText }];

          switch (intent.kind) {
            case "remaining":
              return checklistMsg(
                `${open.length} task${open.length === 1 ? "" : "s"} remaining`,
                open,
                "Inbox zero on tasks — nothing left here. Nice.",
              );
            case "done":
              return checklistMsg(
                `${closed.length} completed this session`,
                closed,
                "You haven't checked anything off in this session yet.",
              );
            case "overdue":
              return checklistMsg(`${overdueList.length} overdue`, overdueList, "Nothing's overdue right now — you're ahead.");
            case "priority": {
              const lst = open.filter(t => t.priority === intent.level);
              return checklistMsg(`${lst.length} ${intent.level.toLowerCase()}`, lst, `No open ${intent.level.toLowerCase()} tasks.`);
            }
            case "count":
              return [{ id: newId(), role: "agent", kind: "text", ts: now(),
                text: `${TASKS.length} total · ${open.length} open · ${closed.length} done · ${overdueList.length} overdue · ${TASKS.filter(t => t.priority === "Critical").length} critical.` }];
            case "next": {
              const next = [...open].sort((a, b) =>
                Number(b.overdue) - Number(a.overdue) ||
                ({ Critical: 0, High: 1, Medium: 2, Low: 3 } as Record<string, number>)[a.priority] -
                ({ Critical: 0, High: 1, Medium: 2, Low: 3 } as Record<string, number>)[b.priority]
              )[0];
              return next
                ? [{ id: newId(), role: "agent", kind: "text", ts: now(),
                    text: `Start with "${next.title}" — ${next.submissionShort}, ${next.priority.toLowerCase()}${next.overdue ? " and overdue" : ""}. Due ${next.due}.` }]
                : [{ id: newId(), role: "agent", kind: "text", ts: now(), text: "Nothing left to start." }];
            }
            case "search": {
              const hits = TASKS.filter(t =>
                [t.title, t.submission, t.submissionShort, t.assignee, t.category].join(" ").toLowerCase().includes(intent.term)
              );
              return checklistMsg(`Matches for "${intent.term}"`, hits, `No tasks mention "${intent.term}".`);
            }
            case "summary":
              return [{ id: newId(), role: "agent", kind: "text", ts: now(),
                text: `${open.length} open of ${TASKS.length} total. ${overdueList.length} overdue, ${TASKS.filter(t => t.priority === "Critical").length} critical. Top owners: ${[...new Set(open.map(t => t.assignee.split(" ")[0]))].slice(0, 3).join(", ")}.` }];
            case "greeting":
              return [{ id: newId(), role: "agent", kind: "text", ts: now(), text: `Hi. ${open.length} open tasks waiting — want me to surface the most urgent?` }];
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
        title="Tasks"
        sub="Every action with an owner and a due date — Companion auto-files reminders when broker promises slip."
      />

      <div className="flex items-center gap-1.5 bg-muted/60 rounded-full p-1 w-max mb-5">
        {FILTERS.map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)} className={cn(
            "px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all",
            filter === f.id ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
          )}>
            {f.label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border bg-card overflow-hidden divide-y">
        {list.map((t, i) => {
          const checked = done.has(t.id);
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}
              className={cn("px-5 py-4 flex items-start gap-4 hover:bg-muted/30 transition-colors", checked && "opacity-50")}
            >
              <button
                onClick={() => toggle(t.id)}
                className={cn(
                  "size-5 rounded-md border-2 grid place-items-center mt-0.5 shrink-0 transition-all",
                  checked ? "bg-primary border-primary" : "border-muted-foreground/40 hover:border-primary"
                )}
              >
                {checked && <CheckCircle2 className="size-3.5 text-white" />}
              </button>
              <div className="flex-1 min-w-0">
                <div className={cn("text-sm font-medium leading-snug", checked && "line-through")}>{t.title}</div>
                <div className="mt-1.5 flex items-center gap-3 flex-wrap text-xs text-muted-foreground">
                  <Link href={`/submission/${t.submission}`} className="font-semibold text-primary hover:underline">{t.submissionShort}</Link>
                  <span>·</span>
                  <span className="capitalize">{t.category}</span>
                  <span>·</span>
                  <span>UW {t.assignee.split(" ")[0]}</span>
                  <span className={cn("ml-auto flex items-center gap-1.5 font-semibold",
                    t.overdue ? "text-rose-600" : "text-foreground/70")}>
                    {t.overdue ? <AlertTriangle className="size-3.5" /> : <Clock className="size-3.5" />}
                    {t.overdue ? "Overdue · " : ""}{t.due}
                  </span>
                </div>
              </div>
              <StatusPill tone={
                t.priority === "Critical" ? "red" : t.priority === "High" ? "gold" :
                t.priority === "Medium" ? "blue" : "gray"
              } size="sm">{t.priority}</StatusPill>
            </motion.div>
          );
        })}
      </div>
    </PageBody>
  );
}
