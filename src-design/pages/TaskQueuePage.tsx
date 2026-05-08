import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import {
  CheckCircle2, Clock, AlertCircle, Plus, Filter,
  ChevronRight, ChevronLeft, User, AlertTriangle,
  SlidersHorizontal, Calendar, ArrowUpRight, Users,
  CheckSquare, XCircle,
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

const priorityStyle = (p: Priority) => {
  const m: Record<Priority, { bg: string; text: string; border: string }> = {
    Critical: { bg: "#FBEAEA", text: "#7A1F1F", border: "#E8A8A8" },
    High:     { bg: "#FFF8E6", text: "#8A5C00", border: "#F0D88A" },
    Medium:   { bg: "#E8F0F9", text: "#00427A", border: "#9ABCD6" },
    Low:      { bg: TH,        text: TT,         border: BDL       },
  };
  return m[p];
};

const statusStyle = (s: TaskStatus) => {
  const m: Record<TaskStatus, { bg: string; text: string; border: string; icon: React.ReactNode }> = {
    Overdue:     { bg: "#FBEAEA", text: "#7A1F1F", border: "#E8A8A8", icon: <AlertCircle size={12} color="#B91C1C" /> },
    Open:        { bg: TH,        text: TM,         border: BD,         icon: <Clock size={12} color={TT} />           },
    "In Progress":{ bg: "#E8F0F9", text: "#00427A", border: "#9ABCD6", icon: <Clock size={12} color={N} />            },
    Done:        { bg: "#E8F5EC", text: "#1A5C30", border: "#93C8A0", icon: <CheckCircle2 size={12} color="#2E7D32" />},
  };
  return m[s];
};

export function TaskQueuePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const role: RoleId = user?.roleId ?? "sr-uw";

  const [tab, setTab]           = useState<"my" | "team" | "unassigned" | "overdue">("my");
  const [priority, setPriority] = useState<Priority | "All">("All");
  const [typeFilter, setTypeFilter] = useState<Task["type"] | "All">("All");
  const [page, setPage]         = useState(1);
  const PER_PAGE = 8;

  const myName = user?.name ?? "John Michaels";

  const filtered = useMemo(() => {
    let list = [...ALL_TASKS];
    if (tab === "my")         list = list.filter(t => t.assignee === myName);
    if (tab === "team")       list = list.filter(t => t.team === "Team Alpha");
    if (tab === "unassigned") list = list.filter(t => !t.assignee);
    if (tab === "overdue")    list = list.filter(t => t.status === "Overdue");
    if (priority !== "All")   list = list.filter(t => t.priority === priority);
    if (typeFilter !== "All") list = list.filter(t => t.type === typeFilter);
    return list;
  }, [tab, priority, typeFilter, myName]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const counts = {
    my:         ALL_TASKS.filter(t => t.assignee === myName).length,
    team:       ALL_TASKS.filter(t => t.team === "Team Alpha").length,
    unassigned: 0,
    overdue:    ALL_TASKS.filter(t => t.status === "Overdue").length,
  };

  const kpis = [
    { label: "My Open Tasks",    value: ALL_TASKS.filter(t => t.assignee === myName && t.status !== "Done").length,                       color: N,        icon: <CheckSquare size={18} color={N} />             },
    { label: "Overdue",          value: ALL_TASKS.filter(t => t.status === "Overdue").length,                                              color: "#B91C1C",icon: <AlertCircle size={18} color="#B91C1C" />       },
    { label: "Due Today",        value: ALL_TASKS.filter(t => t.daysUntilDue === 0 && t.status !== "Done").length,                         color: "#B45309",icon: <AlertTriangle size={18} color="#B45309" />     },
    { label: "In Progress",      value: ALL_TASKS.filter(t => t.status === "In Progress").length,                                          color: "#005B99",icon: <Clock size={18} color="#005B99" />             },
    { label: "Completed (MTD)",  value: ALL_TASKS.filter(t => t.status === "Done").length,                                                 color: "#2E7D32",icon: <CheckCircle2 size={18} color="#2E7D32" />     },
    { label: "SLA at Risk",      value: ALL_TASKS.filter(t => t.slaUsedPct >= 80 && t.status !== "Done").length,                           color: G,        icon: <SlidersHorizontal size={18} color={G} />      },
  ];

  return (
    <AppShell activePage="tasks" role={role} onRoleChange={() => {}}>
      <div style={{ fontFamily: font, color: TD }}>

        {/* Page header */}
        <div style={{ background: N, borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
          <div style={{ height: 4, background: `linear-gradient(90deg,${G} 0%,#A8841C 100%)` }} />
          <div className="px-4 sm:px-8 py-4 sm:py-5 flex items-start justify-between gap-3 flex-wrap">
            <div>
              <h1 style={{ fontSize: "1.35rem", fontWeight: 800, color: "white", lineHeight: 1.2 }}>Task Queue</h1>
              <p style={{ fontSize: "0.80rem", color: "rgba(255,255,255,0.5)", marginTop: 4 }}>
                Master task queue · SLA tracking · {ALL_TASKS.filter(t => t.status !== "Done").length} active tasks
              </p>
            </div>
            <button
              className="flex items-center gap-2 px-4 py-2 transition-all hover:brightness-95 shrink-0"
              style={{ background: G, color: "white", fontSize: "0.78rem", fontWeight: 700 }}>
              <Plus size={13} /> New Task
            </button>
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
              </div>
            ))}
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 sm:px-8 py-3 gap-3 flex-wrap"
          style={{ background: "white", borderBottom: `1px solid ${BDL}` }}>
          {/* Tabs */}
          <div className="flex items-center">
            {([
              { id: "my" as const,         label: "My Tasks",    count: counts.my         },
              { id: "team" as const,        label: "Team Tasks",  count: counts.team       },
              { id: "unassigned" as const,  label: "Unassigned",  count: counts.unassigned },
              { id: "overdue" as const,     label: "Overdue",     count: counts.overdue    },
            ]).map(t => (
              <button key={t.id}
                onClick={() => { setTab(t.id); setPage(1); }}
                className="px-3 sm:px-4 py-2 flex items-center gap-2 transition-all"
                style={{
                  fontSize: "0.78rem", fontWeight: tab === t.id ? 700 : 400,
                  color: tab === t.id ? N : TM,
                  borderBottom: `2px solid ${tab === t.id ? G : "transparent"}`,
                  marginBottom: -1,
                }}>
                {t.label}
                {t.count > 0 && (
                  <span style={{
                    fontSize: "0.58rem", fontWeight: 800,
                    background: t.id === "overdue" && t.count > 0 ? "#B91C1C" : tab === t.id ? N : BDL,
                    color: t.id === "overdue" && t.count > 0 ? "white" : tab === t.id ? "white" : TT,
                    padding: "1px 6px",
                  }}>{t.count}</span>
                )}
              </button>
            ))}
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2">
            <select
              value={priority}
              onChange={e => { setPriority(e.target.value as Priority | "All"); setPage(1); }}
              style={{ fontSize: "0.72rem", border: `1px solid ${BD}`, padding: "6px 10px", color: TM, background: "white", fontFamily: font }}>
              {["All", "Critical", "High", "Medium", "Low"].map(p => <option key={p}>{p}</option>)}
            </select>
            <select
              value={typeFilter}
              onChange={e => { setTypeFilter(e.target.value as Task["type"] | "All"); setPage(1); }}
              style={{ fontSize: "0.72rem", border: `1px solid ${BD}`, padding: "6px 10px", color: TM, background: "white", fontFamily: font }}>
              {["All", "Document Request", "Review", "Communication", "Analysis", "Decision"].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>

        {/* Table */}
        <div style={{ background: "white", margin: "16px", border: `1px solid ${BD}`, borderTop: `3px solid ${N}`, overflow: "hidden" }}>
          <div className="overflow-x-auto">
            <table className="w-full" style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: TH }}>
                  {["Priority", "Task", "Submission", "Assignee", "Type", "SLA", "Due Date", "Status", ""].map(h => (
                    <th key={h} className="px-4 py-3 text-left whitespace-nowrap"
                      style={{ fontSize: "0.60rem", fontWeight: 700, color: TT, textTransform: "uppercase", letterSpacing: "0.08em", borderBottom: `1px solid ${BDL}` }}>
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
                ) : paginated.map((task, i) => {
                  const ps = priorityStyle(task.priority);
                  const ss = statusStyle(task.status);
                  const slaColor = task.slaUsedPct >= 100 ? "#B91C1C" : task.slaUsedPct >= 80 ? "#B45309" : "#2E7D32";
                  return (
                    <tr key={task.id}
                      className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                      style={{ borderBottom: `1px solid ${BDL}` }}>
                      <td className="px-4 py-3">
                        <span style={{ fontSize: "0.60rem", fontWeight: 800, background: ps.bg, color: ps.text, border: `1px solid ${ps.border}`, padding: "1px 6px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                          {task.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3" style={{ maxWidth: 280 }}>
                        <p style={{ fontSize: "0.78rem", fontWeight: 600, color: TD, lineHeight: 1.35 }}>{task.title}</p>
                        <p style={{ fontSize: "0.65rem", color: TT, marginTop: 1 }}>{task.member}</p>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => navigate(`/submission/${task.submission}`)}
                          className="hover:underline"
                          style={{ fontSize: "0.72rem", fontWeight: 700, color: "#005B99", fontFamily: "monospace" }}>
                          {task.submission}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <div className="flex items-center justify-center shrink-0"
                            style={{ width: 22, height: 22, background: BDL, color: TM, fontSize: "0.55rem", fontWeight: 800 }}>
                            {task.assigneeInitials}
                          </div>
                          <span style={{ fontSize: "0.70rem", color: TM, whiteSpace: "nowrap" }}>
                            {task.assignee.split(" ")[0]}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span style={{ fontSize: "0.66rem", background: TH, color: TM, border: `1px solid ${BDL}`, padding: "2px 6px", whiteSpace: "nowrap" }}>
                          {task.type}
                        </span>
                      </td>
                      <td className="px-4 py-3" style={{ minWidth: 100 }}>
                        <div className="flex items-center gap-1.5">
                          <div style={{ flex: 1, height: 5, background: BDL, minWidth: 60 }}>
                            <div style={{ height: "100%", width: `${Math.min(task.slaUsedPct, 100)}%`, background: slaColor }} />
                          </div>
                          <span style={{ fontSize: "0.66rem", fontWeight: 700, color: slaColor, whiteSpace: "nowrap" }}>
                            {task.slaUsedPct}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3" style={{ whiteSpace: "nowrap" }}>
                        <div className="flex items-center gap-1">
                          {task.daysUntilDue < 0
                            ? <AlertCircle size={11} color="#B91C1C" />
                            : task.daysUntilDue <= 2
                            ? <AlertTriangle size={11} color="#B45309" />
                            : <Calendar size={11} color={TT} />}
                          <span style={{ fontSize: "0.70rem", color: task.daysUntilDue < 0 ? "#B91C1C" : task.daysUntilDue <= 2 ? "#B45309" : TM, fontWeight: task.daysUntilDue <= 2 ? 700 : 400 }}>
                            {task.due}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 px-2 py-0.5"
                          style={{ background: ss.bg, border: `1px solid ${ss.border}`, whiteSpace: "nowrap" }}>
                          {ss.icon}
                          <span style={{ fontSize: "0.62rem", fontWeight: 700, color: ss.text }}>{task.status}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <ChevronRight size={13} color={TT} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-5 py-3 flex items-center justify-between flex-wrap gap-3"
            style={{ borderTop: `2px solid ${BDL}`, background: "white" }}>
            <span style={{ fontSize: "0.72rem", color: TT }}>
              Showing{" "}
              <span style={{ fontWeight: 700, color: TD }}>{filtered.length === 0 ? 0 : (page - 1) * PER_PAGE + 1}</span>
              {" – "}
              <span style={{ fontWeight: 700, color: TD }}>{Math.min(page * PER_PAGE, filtered.length)}</span>
              {" of "}
              <span style={{ fontWeight: 700, color: N }}>{filtered.length}</span> tasks
            </span>
            <div className="flex items-center gap-1">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                className="flex items-center gap-1 px-2.5 py-1.5 hover:bg-slate-50 disabled:opacity-40 transition-all"
                style={{ border: `1px solid ${BD}`, fontSize: "0.72rem", fontWeight: 600, color: TM }}>
                <ChevronLeft size={12} /> Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)}
                  style={{
                    width: 30, height: 30, border: `1.5px solid ${p === page ? N : BDL}`,
                    background: p === page ? N : "white", color: p === page ? "white" : TM,
                    fontSize: "0.72rem", fontWeight: p === page ? 800 : 400, fontFamily: font,
                  }}>
                  {p}
                </button>
              ))}
              <button disabled={page === totalPages || totalPages === 0} onClick={() => setPage(p => p + 1)}
                className="flex items-center gap-1 px-2.5 py-1.5 hover:bg-slate-50 disabled:opacity-40 transition-all"
                style={{ border: `1px solid ${page === totalPages ? BDL : N}`, background: page === totalPages ? "white" : `${N}08`, fontSize: "0.72rem", fontWeight: 600, color: page === totalPages ? TT : N }}>
                Next <ChevronRight size={12} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
