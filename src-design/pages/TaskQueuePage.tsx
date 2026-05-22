import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle2, Clock, AlertCircle, Plus, Filter,
  ChevronRight, ChevronLeft, User, AlertTriangle,
  SlidersHorizontal, Calendar, ArrowUpRight, Users,
  CheckSquare, XCircle,
} from "lucide-react";
import { AppShell } from "../components/AppShell";
import type { RoleId } from "../components/AppShell";
import { useAuth } from "../context/AuthContext";
import { PrimaryWhiteButton } from "../components/DashboardCards";
import { PageRegister } from "../components/companion/PageRegister";
import { newId, now } from "../components/companion/CompanionContext";
import type { Suggestion, CompanionMsg } from "../components/companion/CompanionContext";

const N   = "#0123D4";
const G   = "#C9A227";
const BDL = "#DCE3EC";
const TD  = "#1A2530";
const TM  = "#4A5D6E";
const TT  = "#5F7080";
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
        // Selection is conveyed by border + ring shadow + colored text only.
        // Background stays white in all states.
        background: "white",
        border: `${active ? 1.5 : 1}px solid ${active ? accent : hovered ? `${accent}40` : BDL}`,
        borderRadius: 10,
        padding: "14px 16px",
        boxShadow: active
          // Double-ring glow on the active filter card — matches the
          // Submissions page so the active KPI reads as "currently filtering"
          // at a glance, even across pages.
          ? `0 0 0 1px ${accent}, 0 2px 8px ${accent}22, 0 1px 2px rgba(15,23,42,0.04)`
          : hovered
          ? `0 2px 6px ${accent}14, 0 1px 2px rgba(15,23,42,0.04)`
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
        background: showActive ? accent : `linear-gradient(90deg, ${accent}, ${accent}66)`,
        transition: "height 0.2s ease, background 0.2s ease",
      }}/>
      <div className="flex items-start justify-between gap-2">
        <p style={{
          fontSize: "0.6rem", fontWeight: 700, color: active ? accent : TT,
          textTransform: "uppercase", letterSpacing: "0.09em", lineHeight: 1.3,
        }}>
          {label}
        </p>
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
      }}>
        {value}
      </p>
      <div className="inline-flex items-center gap-1 mt-2"
        style={{ fontSize: "0.66rem", color: active ? accent : TT, fontWeight: 600 }}>
        <span>{sub}</span>
      </div>
    </button>
  );
}

type Priority   = "Critical" | "High" | "Medium" | "Low";
type TaskStatus = "Open" | "In Progress" | "Done" | "Overdue";

interface Task {
  id: string;
  title: string;
  submission: string;
  member: string;
  assignee: string;
  assigneeInitials: string;
  team: string;
  due: string;
  daysUntilDue: number;
  priority: Priority;
  status: TaskStatus;
  type: "Document Request" | "Review" | "Communication" | "Analysis" | "Decision";
  slaHours: number;
  slaUsedPct: number;
}

const ALL_TASKS: Task[] = [
  { id: "T-1041", title: "Request missing safety questionnaire from broker",     submission: "SUB-7835", member: "Seattle Public Schools",             assignee: "Sarah Mitchell",  assigneeInitials: "SM", team: "Team Alpha", due: "Apr 19, 2024", daysUntilDue: -1, priority: "Critical", status: "Overdue",     type: "Document Request", slaHours: 48,  slaUsedPct: 112 },
  { id: "T-1038", title: "Obtain updated open claims detail from broker",         submission: "SUB-7829", member: "Riverside Unified School District",  assignee: "Sarah Mitchell",  assigneeInitials: "SM", team: "Team Alpha", due: "Apr 20, 2024", daysUntilDue: 0,  priority: "High",     status: "Open",        type: "Document Request", slaHours: 72,  slaUsedPct: 95 },
  { id: "T-1039", title: "Verify background check policy documentation",          submission: "SUB-7829", member: "Riverside Unified School District",  assignee: "James Owens",     assigneeInitials: "JO", team: "Team Alpha", due: "Apr 22, 2024", daysUntilDue: 2,  priority: "High",     status: "Open",        type: "Document Request", slaHours: 72,  slaUsedPct: 78 },
  { id: "T-1032", title: "Review GASB 68 pension liability report",               submission: "SUB-7832", member: "Vanderbilt University",              assignee: "Tom Lee",         assigneeInitials: "TL", team: "Team Alpha", due: "Apr 18, 2024", daysUntilDue: -2, priority: "Medium",   status: "Overdue",     type: "Review",           slaHours: 96,  slaUsedPct: 108 },
  { id: "T-1043", title: "Run TIV adequacy check against 2024 appraisal",         submission: "SUB-7836", member: "MIT",                                assignee: "John Michaels",   assigneeInitials: "JM", team: "Team Alpha", due: "Apr 25, 2024", daysUntilDue: 5,  priority: "Medium",   status: "In Progress", type: "Analysis",         slaHours: 96,  slaUsedPct: 45 },
  { id: "T-1044", title: "Send indicative quote to Gallagher Education",           submission: "SUB-7829", member: "Riverside Unified School District",  assignee: "Sarah Mitchell",  assigneeInitials: "SM", team: "Team Alpha", due: "May 05, 2024", daysUntilDue: 15, priority: "High",     status: "In Progress", type: "Communication",    slaHours: 120, slaUsedPct: 30 },
  { id: "T-1040", title: "Confirm earthquake zone rating with surveyor",           submission: "SUB-7831", member: "Austin Independent School District", assignee: "Sarah Mitchell",  assigneeInitials: "SM", team: "Team Alpha", due: "Apr 28, 2024", daysUntilDue: 8,  priority: "Medium",   status: "Open",        type: "Analysis",         slaHours: 96,  slaUsedPct: 20 },
  { id: "T-1045", title: "Appetite review — low score flag (41/100)",              submission: "SUB-7834", member: "Phoenix Charter Academy Network",   assignee: "James Owens",     assigneeInitials: "JO", team: "Team Alpha", due: "Apr 22, 2024", daysUntilDue: 2,  priority: "High",     status: "Open",        type: "Decision",         slaHours: 48,  slaUsedPct: 88 },
  { id: "T-1046", title: "Review ELL claims detail — CLM-2021-027",               submission: "SUB-7829", member: "Riverside Unified School District",  assignee: "John Michaels",   assigneeInitials: "JM", team: "Team Alpha", due: "Apr 30, 2024", daysUntilDue: 10, priority: "High",     status: "In Progress", type: "Review",           slaHours: 72,  slaUsedPct: 55 },
  { id: "T-1047", title: "Confirm COPE survey receipt for Lincoln HS",             submission: "SUB-7829", member: "Riverside Unified School District",  assignee: "James Owens",     assigneeInitials: "JO", team: "Team Alpha", due: "May 08, 2024", daysUntilDue: 18, priority: "Low",      status: "Done",        type: "Document Request", slaHours: 168, slaUsedPct: 100 },
  { id: "T-1048", title: "Validate property schedule completeness",                submission: "SUB-7837", member: "Broward County Public Schools",      assignee: "James Owens",     assigneeInitials: "JO", team: "Team Beta",  due: "Apr 24, 2024", daysUntilDue: 4,  priority: "Medium",   status: "Open",        type: "Review",           slaHours: 96,  slaUsedPct: 60 },
  { id: "T-1049", title: "Request updated financials from Chicago Lab",            submission: "SUB-7838", member: "Chicago Lab Schools",               assignee: "Tom Lee",         assigneeInitials: "TL", team: "Team Beta",  due: "Apr 21, 2024", daysUntilDue: 1,  priority: "Medium",   status: "Open",        type: "Document Request", slaHours: 72,  slaUsedPct: 90 },
  { id: "T-1050", title: "Bind policy confirmation — Denver Public Schools",       submission: "SUB-7833", member: "Denver Public Schools",             assignee: "Tom Lee",         assigneeInitials: "TL", team: "Team Beta",  due: "Apr 26, 2024", daysUntilDue: 6,  priority: "Low",      status: "Done",        type: "Decision",         slaHours: 48,  slaUsedPct: 100 },
];

export function TaskQueuePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const role: RoleId = user?.roleId ?? "sr-uw";

  const [tab, setTab]           = useState<"my" | "team" | "unassigned" | "overdue">("my");
  const [priority, setPriority] = useState<Priority | "All">("All");
  const [typeFilter, setTypeFilter] = useState<Task["type"] | "All">("All");
  const [kpiKey, setKpiKey]     = useState<"myOpen" | "overdue" | "dueToday" | "inProgress" | "completed" | "slaRisk" | null>(null);
  const [page, setPage]         = useState(1);
  const PER_PAGE = 8;

  const myName = user?.name ?? "John Michaels";

  const filtered = useMemo(() => {
    let list = [...ALL_TASKS];
    if (kpiKey) {
      if (kpiKey === "myOpen")          list = list.filter(t => t.assignee === myName && t.status !== "Done");
      else if (kpiKey === "overdue")    list = list.filter(t => t.status === "Overdue");
      else if (kpiKey === "dueToday")   list = list.filter(t => t.daysUntilDue === 0 && t.status !== "Done");
      else if (kpiKey === "inProgress") list = list.filter(t => t.status === "In Progress");
      else if (kpiKey === "completed")  list = list.filter(t => t.status === "Done");
      else if (kpiKey === "slaRisk")    list = list.filter(t => t.slaUsedPct >= 80 && t.status !== "Done");
    } else {
      if (tab === "my")         list = list.filter(t => t.assignee === myName);
      if (tab === "team")       list = list.filter(t => t.team === "Team Alpha");
      if (tab === "unassigned") list = list.filter(t => !t.assignee);
      if (tab === "overdue")    list = list.filter(t => t.status === "Overdue");
    }
    if (priority !== "All")   list = list.filter(t => t.priority === priority);
    if (typeFilter !== "All") list = list.filter(t => t.type === typeFilter);
    return list;
  }, [tab, priority, typeFilter, kpiKey, myName]);

  const onKpiClick = (key: NonNullable<typeof kpiKey>) => {
    setKpiKey(prev => prev === key ? null : key);
    setPage(1);
  };

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const counts = {
    my:         ALL_TASKS.filter(t => t.assignee === myName).length,
    team:       ALL_TASKS.filter(t => t.team === "Team Alpha").length,
    unassigned: 0,
    overdue:    ALL_TASKS.filter(t => t.status === "Overdue").length,
  };

  const kpis = [
    { key: "myOpen"     as const, label: "My Open Tasks",    value: String(ALL_TASKS.filter(t => t.assignee === myName && t.status !== "Done").length), sub: "Active",          accent: N,         icon: <CheckSquare size={16}/>       },
    { key: "overdue"    as const, label: "Overdue",          value: String(ALL_TASKS.filter(t => t.status === "Overdue").length),                       sub: "Past due",        accent: "#B91C1C", icon: <AlertCircle size={16}/>       },
    { key: "dueToday"   as const, label: "Due Today",        value: String(ALL_TASKS.filter(t => t.daysUntilDue === 0 && t.status !== "Done").length),  sub: "Today",           accent: "#B45309", icon: <AlertTriangle size={16}/>     },
    { key: "inProgress" as const, label: "In Progress",      value: String(ALL_TASKS.filter(t => t.status === "In Progress").length),                   sub: "Active work",     accent: "#005B99", icon: <Clock size={16}/>             },
    { key: "completed"  as const, label: "Completed (MTD)",  value: String(ALL_TASKS.filter(t => t.status === "Done").length),                          sub: "This month",      accent: "#15803D", icon: <CheckCircle2 size={16}/>      },
    { key: "slaRisk"    as const, label: "SLA at Risk",      value: String(ALL_TASKS.filter(t => t.slaUsedPct >= 80 && t.status !== "Done").length),    sub: "≥80% SLA used",   accent: G,         icon: <SlidersHorizontal size={16}/> },
  ];

  return (
    <AppShell activePage="tasks" role={role} onRoleChange={() => {}}>
      <div className="px-3 sm:px-4 lg:px-5 py-3 sm:py-4 space-y-3 sm:space-y-4"
        style={{ fontFamily: font, color: TD, minHeight: "100%", background: "#EEF1F6" }}>

        <PageRegister
          routeKey="page:tasks"
          title="Tasks"
          subtitle={`${ALL_TASKS.filter(t => t.status !== "Done").length} active · ${ALL_TASKS.filter(t => t.status === "Overdue").length} overdue`}
          greeting={`Task queue: ${ALL_TASKS.filter(t => t.status !== "Done").length} active, ${ALL_TASKS.filter(t => t.status === "Overdue").length} overdue, ${ALL_TASKS.filter(t => t.priority === "Critical").length} critical. Want a playbook on one?`}
          suggestions={[
            { id: "overdue", label: "Show overdue", tone: "red", icon: "AlertTriangle" },
            { id: "critical", label: "Critical only", tone: "blue", icon: "Flag" },
            { id: "next", label: "What's next?", tone: "violet", icon: "ArrowRight" },
            { id: "sla", label: "SLA at risk", tone: "gold", icon: "Clock" },
          ]}
          respond={(sid) => {
            if (sid === "overdue") {
              const od = ALL_TASKS.filter(t => t.status === "Overdue");
              return [{ id: newId(), role: "agent", kind: "viz", ts: now(), viz: {
                kind: "checklist", title: `${od.length} overdue task${od.length === 1 ? "" : "s"}`,
                items: od.slice(0, 5).map(t => ({ ok: false, label: t.title, sub: `${t.member} · due ${t.due}`, href: `/submission/${t.submission}?tab=tasks` })),
              } }];
            }
            if (sid === "critical") {
              const c = ALL_TASKS.filter(t => t.priority === "Critical");
              return [{ id: newId(), role: "agent", kind: "text", ts: now(),
                text: `${c.length} critical task${c.length === 1 ? "" : "s"}: ${c.map(t => t.title).slice(0, 3).join("; ")}.` }];
            }
            if (sid === "next") {
              const open = ALL_TASKS.filter(t => t.status !== "Done").sort((a, b) => b.slaUsedPct - a.slaUsedPct)[0];
              return [{ id: newId(), role: "agent", kind: "text", ts: now(),
                text: open ? `Start with "${open.title}" on ${open.member} — SLA at ${open.slaUsedPct}%. Ask "walk me through this" for the specialist playbook.` : "Queue is empty — good place to be." }];
            }
            if (sid === "sla") {
              const risky = ALL_TASKS.filter(t => t.slaUsedPct >= 80 && t.status !== "Done");
              return [{ id: newId(), role: "agent", kind: "text", ts: now(),
                text: `${risky.length} task${risky.length === 1 ? "" : "s"} at ≥80% SLA. Top: "${risky[0]?.title ?? "—"}" (${risky[0]?.slaUsedPct ?? 0}%).` }];
            }
          }}
          freeText={(text) => {
            const t = text.toLowerCase();
            if (/\b(how many|count|total)\b/.test(t)) {
              return [{ id: newId(), role: "agent", kind: "text", ts: now(),
                text: `${ALL_TASKS.length} total, ${ALL_TASKS.filter(x => x.status !== "Done").length} active, ${ALL_TASKS.filter(x => x.status === "Overdue").length} overdue.` }];
            }
            if (/\b(done|finished|completed)\b/.test(t)) {
              return [{ id: newId(), role: "agent", kind: "text", ts: now(),
                text: `${ALL_TASKS.filter(x => x.status === "Done").length} task${ALL_TASKS.filter(x => x.status === "Done").length === 1 ? "" : "s"} done so far.` }];
            }
          }}
          facts={() => [
            `Tasks · ${ALL_TASKS.length} total`,
            `Active: ${ALL_TASKS.filter(t => t.status !== "Done").length} · Overdue: ${ALL_TASKS.filter(t => t.status === "Overdue").length} · Done: ${ALL_TASKS.filter(t => t.status === "Done").length}`,
            `Critical: ${ALL_TASKS.filter(t => t.priority === "Critical").length} · SLA ≥80%: ${ALL_TASKS.filter(t => t.slaUsedPct >= 80 && t.status !== "Done").length}`,
          ].join("\n")}
        />

        {/* ── HERO (Dashboard structure, original Task Queue content) ──────── */}
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
              <h1 style={{ fontSize: "1.35rem", fontWeight: 800, color: "white", lineHeight: 1.2 }}>Task Queue</h1>
              <p style={{ fontSize: "0.80rem", color: "rgba(255,255,255,0.6)", marginTop: 4 }}>
                Master task queue · SLA tracking · {ALL_TASKS.filter(t => t.status !== "Done").length} active tasks
              </p>
            </div>
            <PrimaryWhiteButton>
              <Plus size={14}/>
              New Task
            </PrimaryWhiteButton>
          </div>
        </div>

        {/* ── KPI STRIP — modern tiles with Dashboard hover effect ─────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {kpis.map((k, i) => (
            <KPITile key={i} label={k.label} value={k.value} sub={k.sub} accent={k.accent} icon={k.icon}
              onClick={() => onKpiClick(k.key)}
              selected={kpiKey === k.key}/>
          ))}
        </div>

        {/* ── TASK QUEUE CARD (Dashboard-style chrome) ─────────────────────── */}
        <div
          style={{
            background: "white",
            border: `1px solid ${BDL}`,
            borderRadius: 8,
            overflow: "hidden",
            boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
          }}>

          {/* Card header — icon chip + title + count chip */}
          <div className="flex items-center justify-between px-5 py-3 flex-wrap gap-2"
            style={{ borderBottom: `1px solid ${BDL}`, background: "#FAFBFD" }}>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center"
                style={{ width: 24, height: 24, borderRadius: 6, background: `${N}12`, color: N }}>
                <CheckSquare size={13} />
              </span>
              <h3 style={{ fontSize: "0.86rem", fontWeight: 700, color: TD, letterSpacing: "-0.005em" }}>
                Task Queue
              </h3>
            </div>
            <span style={{
              fontSize: "0.68rem", fontWeight: 800, background: `${N}10`, color: N,
              padding: "2px 9px", borderRadius: 10, letterSpacing: "0.02em",
            }}>
              {filtered.length}
            </span>
          </div>

          {/* Toolbar — pill tabs + filter dropdowns */}
          <div className="flex items-center justify-between px-5 py-2.5 gap-3 flex-wrap"
            style={{ borderBottom: `1px solid ${BDL}` }}>
            <div className="flex items-center gap-1">
              {([
                { id: "my" as const,          label: "My Tasks",    count: counts.my         },
                { id: "team" as const,        label: "Team Tasks",  count: counts.team       },
                { id: "unassigned" as const,  label: "Unassigned",  count: counts.unassigned },
                { id: "overdue" as const,     label: "Overdue",     count: counts.overdue    },
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
                      background: t.id === "overdue" ? "#B91C1C" : !kpiKey && tab === t.id ? N : "#E2E8F0",
                      color: t.id === "overdue" || (!kpiKey && tab === t.id) ? "white" : TM,
                      padding: "1px 6px", borderRadius: 8,
                    }}>
                      {t.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Filter dropdowns — rounded, soft borders */}
            <div className="flex items-center gap-2">
              <select
                value={priority}
                onChange={e => { setPriority(e.target.value as Priority | "All"); setPage(1); }}
                style={{
                  fontSize: "0.72rem", border: `1px solid ${BDL}`, borderRadius: 5,
                  padding: "6px 10px", color: TM, background: "white", fontFamily: font,
                  cursor: "pointer", outline: "none",
                }}>
                {["All", "Critical", "High", "Medium", "Low"].map(p => <option key={p}>{p}</option>)}
              </select>
              <select
                value={typeFilter}
                onChange={e => { setTypeFilter(e.target.value as Task["type"] | "All"); setPage(1); }}
                style={{
                  fontSize: "0.72rem", border: `1px solid ${BDL}`, borderRadius: 5,
                  padding: "6px 10px", color: TM, background: "white", fontFamily: font,
                  cursor: "pointer", outline: "none",
                }}>
                {["All", "Document Request", "Review", "Communication", "Analysis", "Decision"].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full" style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#FAFBFD" }}>
                  {["Priority", "Task", "Submission", "Assignee", "Type", "SLA", "Due Date", "Status", ""].map(h => (
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
                      No tasks match the current filters.
                    </td>
                  </tr>
                ) : paginated.map((task, idx) => {
                  // SLA bar — kept muted for normal usage, gets louder at risk thresholds.
                  const slaColor = task.slaUsedPct >= 100 ? "#B91C1C" : task.slaUsedPct >= 80 ? "#B45309" : "#9AA5B5";
                  const priorityDot =
                    task.priority === "Critical" ? "#B91C1C" :
                    task.priority === "High" ? "#B45309" :
                    task.priority === "Medium" ? "#005B99" : TT;
                  const statusColor =
                    task.status === "Overdue" ? "#B91C1C" :
                    task.status === "Done" ? "#15803D" :
                    task.status === "In Progress" ? N : TM;
                  // Row-level urgency tier — drives rail + soft bg so the entire row
                  // reads as urgent at a glance rather than via three competing chips.
                  const isOverdue   = task.status === "Overdue" || task.daysUntilDue < 0;
                  const isAtRisk    = !isOverdue && (task.daysUntilDue <= 2 || task.slaUsedPct >= 80);
                  const rowBg       = isOverdue ? "#FEF2F2" : isAtRisk ? "#FFFBEB" : "white";
                  const rowHoverBg  = isOverdue ? "#FEE2E2" : isAtRisk ? "#FEF3C7" : "#F0F6FF";
                  const railColor   = isOverdue ? "#B91C1C" : isAtRisk ? "#B45309" : null;
                  const railWidth   = isOverdue ? 5 : isAtRisk ? 4 : 0;
                  // Scale boost — urgent rows visibly larger than normal so the urgency
                  // reads in scale, not only in hue.
                  const cellPadY    = isOverdue ? 18 : isAtRisk ? 14 : 12;
                  const titleSize   = isOverdue ? "0.9rem" : "0.8rem";
                  const titleWeight = isOverdue ? 700 : 600;
                  const titleColor  = isOverdue ? "#7A1F1F" : TD;
                  const isLast = idx === paginated.length - 1;
                  return (
                    <tr key={task.id}
                      onClick={() => navigate(`/submission/${task.submission}`)}
                      className="cursor-pointer transition-colors group"
                      onMouseEnter={e => { e.currentTarget.style.background = rowHoverBg; }}
                      onMouseLeave={e => { e.currentTarget.style.background = rowBg; }}
                      style={{
                        borderBottom: isLast ? "none" : `1px solid #EEF1F5`,
                        background: rowBg,
                      }}>
                      <td style={{ padding: `${cellPadY}px 16px` }}>
                        <div className="flex items-center gap-2">
                          {isOverdue && <AlertCircle size={14} color="#B91C1C" />}
                          {isAtRisk && !isOverdue && <AlertTriangle size={14} color="#B45309" />}
                          <span className="inline-flex items-center gap-1.5"
                            style={{ fontSize: "0.7rem", fontWeight: 500, color: TM }}>
                            <span style={{ width: 5, height: 5, borderRadius: "50%", background: priorityDot }} />
                            {task.priority}
                          </span>
                        </div>
                      </td>
                      <td style={{ maxWidth: 280, padding: `${cellPadY}px 16px` }}>
                        <p style={{ fontSize: titleSize, fontWeight: titleWeight, color: titleColor, lineHeight: 1.35, letterSpacing: isOverdue ? "-0.005em" : "0" }}
                          className="group-hover:underline">
                          {task.title}
                        </p>
                        <p style={{ fontSize: "0.64rem", color: TT, marginTop: 1 }}>{task.member}</p>
                      </td>
                      <td style={{ padding: `${cellPadY}px 16px` }}>
                        <button
                          onClick={(e) => { e.stopPropagation(); navigate(`/submission/${task.submission}`); }}
                          className="hover:underline"
                          style={{
                            fontSize: "0.72rem", fontWeight: 700, color: N,
                            fontFamily: "ui-monospace, monospace",
                            background: "none", border: "none", cursor: "pointer", padding: 0, borderRadius: 6,
                          }}>
                          {task.submission}
                        </button>
                      </td>
                      <td style={{ padding: `${cellPadY}px 16px` }}>
                        <div className="flex items-center gap-1.5">
                          <span className="inline-flex items-center justify-center rounded-full shrink-0"
                            style={{
                              width: 22, height: 22,
                              background: `${N}15`, color: N,
                              fontSize: "0.55rem", fontWeight: 800,
                            }}>
                            {task.assigneeInitials}
                          </span>
                          <span style={{ fontSize: "0.72rem", color: TD, fontWeight: 500, whiteSpace: "nowrap" }}>
                            {task.assignee.split(" ")[0]}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: `${cellPadY}px 16px` }}>
                        <span style={{ fontSize: "0.66rem", color: TM, fontWeight: 500, whiteSpace: "nowrap" }}>
                          {task.type}
                        </span>
                      </td>
                      <td style={{ minWidth: 110, padding: `${cellPadY}px 16px` }}>
                        <div className="flex items-center gap-2">
                          <div style={{ flex: 1, height: 4, background: "#EEF1F5", minWidth: 50, borderRadius: 2, overflow: "hidden" }}>
                            <div style={{
                              height: "100%", width: `${Math.min(task.slaUsedPct, 100)}%`,
                              background: slaColor, borderRadius: 2,
                              transition: "width 0.4s ease",
                            }} />
                          </div>
                          <span style={{
                            fontSize: "0.66rem", fontWeight: 800, color: slaColor,
                            whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums",
                          }}>
                            {task.slaUsedPct}%
                          </span>
                        </div>
                      </td>
                      <td style={{ whiteSpace: "nowrap", padding: `${cellPadY}px 16px` }}>
                        <div className="inline-flex items-center gap-1.5">
                          {task.daysUntilDue < 0
                            ? <AlertCircle size={11} color="#B91C1C" />
                            : task.daysUntilDue <= 2
                            ? <AlertTriangle size={11} color="#B45309" />
                            : <Calendar size={11} color={TT} />}
                          <span style={{
                            fontSize: "0.72rem",
                            color: task.daysUntilDue < 0 ? "#B91C1C" : task.daysUntilDue <= 2 ? "#B45309" : TM,
                            fontWeight: task.daysUntilDue <= 2 ? 700 : 500,
                          }}>
                            {task.due}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: `${cellPadY}px 16px` }}>
                        {task.status === "Overdue" ? (
                          <span style={{
                            background: "#B91C1C", color: "white",
                            padding: "3px 9px", borderRadius: 9,
                            fontSize: "0.6rem", fontWeight: 800,
                            textTransform: "uppercase", letterSpacing: "0.05em",
                            whiteSpace: "nowrap",
                          }}>
                            Overdue
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5" style={{ whiteSpace: "nowrap" }}>
                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: statusColor }} />
                            <span style={{ fontSize: "0.72rem", fontWeight: 500, color: statusColor }}>
                              {task.status}
                            </span>
                          </span>
                        )}
                      </td>
                      <td style={{ padding: `${cellPadY}px 16px` }}>
                        <ChevronRight size={15} color={TT} className="transition-all group-hover:text-blue-600 group-hover:translate-x-0.5" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination — Dashboard style */}
          <div className="px-5 py-3 flex items-center justify-between flex-wrap gap-3"
            style={{ borderTop: `1px solid ${BDL}`, background: "#FAFBFD" }}>
            <span style={{ fontSize: "0.78rem", color: TM }}>
              <span style={{ fontWeight: 700, color: TD }}>{filtered.length === 0 ? 0 : (page - 1) * PER_PAGE + 1}</span>
              {"–"}
              <span style={{ fontWeight: 700, color: TD }}>{Math.min(page * PER_PAGE, filtered.length)}</span>
              {" of "}
              <span style={{ fontWeight: 700, color: TD }}>{filtered.length}</span> tasks
            </span>
            <div className="flex items-center gap-1">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 hover:bg-slate-100 disabled:opacity-35 disabled:cursor-not-allowed transition-all"
                style={{
                  border: `1px solid ${BDL}`, background: "white", borderRadius: 6,
                  fontSize: "0.7rem", fontWeight: 600, color: page === 1 ? TT : TM,
                  cursor: page === 1 ? "not-allowed" : "pointer", fontFamily: font,
                }}>
                <ChevronLeft size={12} /> Prev
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
                Next <ChevronRight size={12} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
