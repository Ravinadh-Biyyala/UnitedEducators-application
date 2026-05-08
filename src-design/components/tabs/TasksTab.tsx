import { useState, useRef, useEffect } from "react";
import {
  Clock, AlertCircle, CheckCircle2, Plus, User, X,
  ChevronDown, Search, ChevronRight, RotateCcw,
} from "lucide-react";

/* ── Design tokens ────────────────────────────────────────────────────────── */
const N    = "#0123D4";
const TH   = "#F0F3F8";
const BD   = "#C4CDD8";
const BDL  = "#DCE3EC";
const TD   = "#1A2530";
const TM   = "#4A5D6E";
const TT   = "#7A8FA3";
const font = "'Source Sans 3', system-ui, sans-serif";

/* ── Types ────────────────────────────────────────────────────────────────── */
type Priority   = "High" | "Medium" | "Low";
type TaskStatus = "Open" | "Done";
type TaskType   =
  | "Review" | "Follow-up" | "Communication" | "Decision" | "Document"
  | "Negotiation" | "Quote" | "Referral" | "Underwriting" | "Compliance";

interface Task {
  id: number;
  title: string;
  assignee: string;
  due: string;
  priority: Priority;
  status: TaskStatus;
  type: TaskType;
  notes?: string;
  completedAt?: string;
}

/* ── Constants ────────────────────────────────────────────────────────────── */
const TASK_TYPES: TaskType[] = [
  "Review", "Follow-up", "Communication", "Decision", "Document",
  "Negotiation", "Quote", "Referral", "Underwriting", "Compliance",
];
const PRIORITIES: Priority[] = ["High", "Medium", "Low"];
const ASSIGNEES = [
  "Sarah Mitchell", "James Owens", "Tom Lee", "Devon Carter",
  "Maya Khanna", "Anika Shah", "John Michaels",
];

/* ── Seed data ────────────────────────────────────────────────────────────── */
const SEED_TASKS: Task[] = [
  { id: 1, title: "Obtain updated open claims detail from broker", assignee: "Sarah Mitchell", due: "Apr 20, 2024", priority: "High",   status: "Open", type: "Communication" },
  { id: 2, title: "Verify background check policy documentation",  assignee: "James Owens",   due: "Apr 22, 2024", priority: "High",   status: "Open", type: "Compliance"    },
  { id: 3, title: "Review GASB 68 pension liability report",       assignee: "Tom Lee",        due: "Apr 25, 2024", priority: "Medium", status: "Open", type: "Review"        },
  { id: 4, title: "Confirm earthquake zone rating with surveyor",  assignee: "Sarah Mitchell", due: "Apr 28, 2024", priority: "Medium", status: "Open", type: "Underwriting"  },
  { id: 5, title: "Run TIV adequacy check against 2024 appraisal",assignee: "Tom Lee",        due: "May 01, 2024", priority: "Low",    status: "Open", type: "Document"      },
  { id: 6, title: "Send indicative quote to Gallagher",           assignee: "Sarah Mitchell", due: "May 05, 2024", priority: "High",   status: "Open", type: "Quote"         },
  { id: 7, title: "Confirm COPE survey receipt for Lincoln HS",   assignee: "James Owens",    due: "May 08, 2024", priority: "Low",    status: "Done", type: "Follow-up",     completedAt: "May 3, 2024" },
];

/* ── Style helpers ────────────────────────────────────────────────────────── */
const priorityStyle = (p: Priority) => {
  if (p === "High")   return { bg: "#FBEAEA", text: "#7A1F1F", border: "#E8A8A8" };
  if (p === "Medium") return { bg: "#FFF8E6", text: "#8A5C00", border: "#F0D88A" };
  return { bg: TH, text: TT, border: BD };
};

const statusBadge = (s: TaskStatus) => {
  if (s === "Done") return { bg: "#E8F5EC", text: "#1A5C30", border: "#93C8A0" };
  return { bg: TH, text: TM, border: BD };
};

const typeStyle = (t: TaskType) => {
  const map: Record<TaskType, { text: string; border: string }> = {
    "Review":        { text: "#00427A", border: "#9ABCD6" },
    "Follow-up":     { text: "#8A5C00", border: "#F0D88A" },
    "Communication": { text: "#4A2D80", border: "#C3B8E8" },
    "Decision":      { text: "#7A1F1F", border: "#E8A8A8" },
    "Document":      { text: TM,        border: BD        },
    "Negotiation":   { text: "#8A5C00", border: "#F0D88A" },
    "Quote":         { text: "#00427A", border: "#9ABCD6" },
    "Referral":      { text: "#7A1F1F", border: "#E8A8A8" },
    "Underwriting":  { text: "#00427A", border: "#9ABCD6" },
    "Compliance":    { text: "#1A5C30", border: "#93C8A0" },
  };
  return map[t] ?? { text: TM, border: BD };
};

/* ── Circle Checkbox ──────────────────────────────────────────────────────── */
function TaskCheckbox({ done, onToggle }: { done: boolean; onToggle: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onToggle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      title={done ? "Mark as open" : "Mark as complete"}
      style={{
        width: 20, height: 20, borderRadius: "50%", flexShrink: 0,
        border: done
          ? "2px solid #2E7D32"
          : hovered
          ? "2px solid #2E7D32"
          : `2px solid ${BD}`,
        background: done
          ? "#2E7D32"
          : hovered
          ? "#E8F5EC"
          : "white",
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer", transition: "all 0.15s",
      }}>
      {(done || hovered) && (
        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
          <path d="M1 4L3.8 7L9 1" stroke={done ? "white" : "#2E7D32"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
}

/* ── Custom Select Dropdown ───────────────────────────────────────────────── */
function CustomSelect<T extends string>({
  value, onChange, options, placeholder,
}: {
  value: T | ""; onChange: (v: T) => void; options: T[]; placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-3 py-2.5 text-left"
        style={{ border: `1px solid ${BD}`, background: "white", fontSize: "0.84rem", color: value ? TD : TT, fontFamily: font }}>
        <span>{value || placeholder || "Select…"}</span>
        <ChevronDown size={14} color={TT} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
      </button>
      {open && (
        <div className="absolute left-0 right-0 z-50 mt-0.5 py-1 overflow-y-auto"
          style={{ background: "white", border: `1px solid ${BD}`, boxShadow: "0 6px 24px rgba(0,0,0,0.13)", maxHeight: 220 }}>
          {options.map(opt => (
            <button key={opt} type="button"
              onClick={() => { onChange(opt); setOpen(false); }}
              className="w-full text-left px-4 py-2.5 hover:bg-slate-50 transition-colors"
              style={{ fontSize: "0.84rem", fontFamily: font, background: value === opt ? N : "white", color: value === opt ? "white" : TD }}>
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── New Task Modal ───────────────────────────────────────────────────────── */
interface NewTaskModalProps {
  onClose: () => void;
  onSubmit: (task: Omit<Task, "id" | "status" | "completedAt">) => void;
}

function NewTaskModal({ onClose, onSubmit }: NewTaskModalProps) {
  const [submission, setSubmission] = useState("SUB-10428");
  const [type,       setType]       = useState<TaskType | "">("");
  const [title,      setTitle]      = useState("");
  const [priority,   setPriority]   = useState<Priority | "">("");
  const [assignee,   setAssignee]   = useState<string>("");
  const [due,        setDue]        = useState("");
  const [notes,      setNotes]      = useState("");

  const canSubmit = title.trim() && type && priority && assignee;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit({ title: title.trim(), type: type as TaskType, priority: priority as Priority, assignee, due: due || "TBD", notes });
    onClose();
  };

  return (
    <div onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(15, 25, 40, 0.55)" }}>

      <div className="w-full mx-4"
        style={{ maxWidth: 640, background: "white", border: `1px solid ${BD}`, boxShadow: "0 20px 60px rgba(0,0,0,0.20)" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: `1px solid ${BDL}` }}>
          <h2 style={{ fontSize: "1.05rem", fontWeight: 800, color: TD }}>New task</h2>
          <button onClick={onClose} className="flex items-center justify-center hover:bg-slate-100 transition-colors"
            style={{ width: 28, height: 28, color: TT }}>
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label style={{ fontSize: "0.65rem", fontWeight: 700, color: TT, textTransform: "uppercase", letterSpacing: "0.09em" }}>Submission</label>
                <span style={{ fontSize: "0.65rem", color: TT }}>optional</span>
              </div>
              <input value={submission} onChange={e => setSubmission(e.target.value)} className="w-full px-3 py-2.5 outline-none"
                style={{ fontSize: "0.84rem", border: `1px solid ${BD}`, color: TD, fontFamily: font, background: "white" }} />
            </div>
            <div>
              <label style={{ fontSize: "0.65rem", fontWeight: 700, color: TT, textTransform: "uppercase", letterSpacing: "0.09em", display: "block", marginBottom: 6 }}>Type</label>
              <CustomSelect<TaskType> value={type} onChange={setType} options={TASK_TYPES} placeholder="Select type…" />
            </div>
          </div>

          <div>
            <label style={{ fontSize: "0.65rem", fontWeight: 700, color: TT, textTransform: "uppercase", letterSpacing: "0.09em", display: "block", marginBottom: 6 }}>Task</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Follow up with broker on endorsement request"
              className="w-full px-3 py-2.5 outline-none"
              style={{ fontSize: "0.84rem", border: `1px solid ${BD}`, color: TD, fontFamily: font, background: "white", boxSizing: "border-box" }} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label style={{ fontSize: "0.65rem", fontWeight: 700, color: TT, textTransform: "uppercase", letterSpacing: "0.09em", display: "block", marginBottom: 6 }}>Priority</label>
              <CustomSelect<Priority> value={priority} onChange={setPriority} options={PRIORITIES} placeholder="Select priority…" />
            </div>
            <div>
              <label style={{ fontSize: "0.65rem", fontWeight: 700, color: TT, textTransform: "uppercase", letterSpacing: "0.09em", display: "block", marginBottom: 6 }}>Assignee</label>
              <CustomSelect<string> value={assignee} onChange={setAssignee} options={ASSIGNEES} placeholder="Select assignee…" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label style={{ fontSize: "0.65rem", fontWeight: 700, color: TT, textTransform: "uppercase", letterSpacing: "0.09em" }}>Due Date</label>
              <span style={{ fontSize: "0.65rem", color: TT }}>optional</span>
            </div>
            <input type="date" value={due} onChange={e => setDue(e.target.value)} className="w-full px-3 py-2.5 outline-none"
              style={{ fontSize: "0.84rem", border: `1px solid ${BD}`, color: due ? TD : TT, fontFamily: font, background: "white", boxSizing: "border-box" }} />
          </div>

          <div>
            <label style={{ fontSize: "0.65rem", fontWeight: 700, color: TT, textTransform: "uppercase", letterSpacing: "0.09em", display: "block", marginBottom: 6 }}>Notes</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Context for the task" rows={3}
              className="w-full outline-none resize-y px-3 py-2.5"
              style={{ fontSize: "0.84rem", border: `1px solid ${BD}`, color: TD, fontFamily: font, background: "white", boxSizing: "border-box" }} />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2.5 px-6 py-4" style={{ borderTop: `1px solid ${BDL}`, background: TH }}>
          <button onClick={onClose} className="px-4 py-2 hover:brightness-97 transition-all"
            style={{ fontSize: "0.80rem", fontWeight: 600, color: TM, background: "white", border: `1px solid ${BD}` }}>
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={!canSubmit}
            className="flex items-center gap-1.5 px-5 py-2 transition-all hover:brightness-95 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: N, color: "white", fontSize: "0.80rem", fontWeight: 700 }}>
            <Plus size={13} /> Create task
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Shared row grid ──────────────────────────────────────────────────────── */
const GRID = "40px 1fr 150px 130px 130px 100px";

/* ── Column headers ───────────────────────────────────────────────────────── */
function ColHeaders() {
  return (
    <div className="grid px-5 py-2.5" style={{ gridTemplateColumns: GRID, borderBottom: `1px solid ${BDL}`, background: "#F8FAFC" }}>
      <span />
      {["Task", "Type", "Assignee", "Due Date", "Priority"].map(h => (
        <span key={h} style={{ fontSize: "0.60rem", fontWeight: 700, color: TT, textTransform: "uppercase", letterSpacing: "0.09em" }}>{h}</span>
      ))}
    </div>
  );
}

/* ── Active task row ──────────────────────────────────────────────────────── */
function ActiveRow({ task, onComplete }: { task: Task; onComplete: (id: number) => void }) {
  const ps = priorityStyle(task.priority);
  const ts = typeStyle(task.type);

  return (
    <div className="grid px-5 py-3.5 items-center hover:bg-slate-50/60 transition-colors"
      style={{ gridTemplateColumns: GRID }}>

      {/* Checkbox */}
      <div className="flex items-center">
        <TaskCheckbox done={false} onToggle={() => onComplete(task.id)} />
      </div>

      {/* Title + In Progress badge */}
      <div className="flex flex-col gap-1 pr-4">
        <p style={{ fontSize: "0.83rem", fontWeight: 600, color: TD, lineHeight: 1.4 }}>{task.title}</p>
      </div>

      {/* Type — separate outlined badge */}
      <div>
        <span style={{
          fontSize: "0.72rem", fontWeight: 600,
          background: "white", color: ts.text,
          border: `1.5px solid ${ts.border}`,
          padding: "3px 10px",
          display: "inline-block", width: "fit-content",
          whiteSpace: "nowrap",
        }}>
          {task.type}
        </span>
      </div>

      {/* Assignee */}
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center shrink-0"
          style={{ width: 24, height: 24, background: "#E0E8F0", border: `1px solid ${BD}`, borderRadius: "50%" }}>
          <User size={11} color={N} />
        </div>
        <span style={{ fontSize: "0.75rem", color: TM }}>{task.assignee.split(" ")[0]}</span>
      </div>

      {/* Due date */}
      <div className="flex items-center gap-1.5">
        <Clock size={11} color={TT} />
        <span style={{ fontSize: "0.72rem", color: TM }}>{task.due}</span>
      </div>

      {/* Priority */}
      <span style={{ fontSize: "0.62rem", fontWeight: 700, background: ps.bg, color: ps.text, border: `1px solid ${ps.border}`, padding: "3px 8px", textTransform: "uppercase", letterSpacing: "0.04em", display: "inline-block", width: "fit-content" }}>
        {task.priority}
      </span>
    </div>
  );
}

/* ── Completed task row ───────────────────────────────────────────────────── */
function CompletedRow({ task, onReopen }: { task: Task; onReopen: (id: number) => void }) {
  const ts = typeStyle(task.type);

  return (
    <div className="grid px-5 py-3 items-center hover:bg-slate-50/40 transition-colors group"
      style={{ gridTemplateColumns: GRID }}>

      {/* Checked circle */}
      <div className="flex items-center">
        <TaskCheckbox done={true} onToggle={() => onReopen(task.id)} />
      </div>

      {/* Title + completed date */}
      <div className="flex flex-col gap-0.5 pr-4">
        <p style={{ fontSize: "0.83rem", fontWeight: 500, color: TT, lineHeight: 1.4, textDecoration: "line-through" }}>{task.title}</p>
        {task.completedAt && (
          <span style={{ fontSize: "0.65rem", color: TT }}>Completed {task.completedAt}</span>
        )}
      </div>

      {/* Type */}
      <div>
        <span style={{
          fontSize: "0.72rem", fontWeight: 600,
          background: "white", color: ts.text,
          border: `1.5px solid ${ts.border}`,
          padding: "3px 10px",
          display: "inline-block", width: "fit-content",
          whiteSpace: "nowrap", opacity: 0.6,
        }}>
          {task.type}
        </span>
      </div>

      {/* Assignee */}
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center shrink-0"
          style={{ width: 24, height: 24, background: "#E8F5EC", border: `1px solid #93C8A0`, borderRadius: "50%" }}>
          <User size={11} color="#2E7D32" />
        </div>
        <span style={{ fontSize: "0.75rem", color: TT }}>{task.assignee.split(" ")[0]}</span>
      </div>

      {/* Due date */}
      <div className="flex items-center gap-1.5">
        <Clock size={11} color="#93C8A0" />
        <span style={{ fontSize: "0.72rem", color: TT }}>{task.due}</span>
      </div>

      {/* Reopen button */}
      <button onClick={() => onReopen(task.id)}
        className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ fontSize: "0.65rem", fontWeight: 700, color: TM, background: "white", border: `1px solid ${BD}`, padding: "3px 8px", whiteSpace: "nowrap" }}>
        <RotateCcw size={9} /> Reopen
      </button>
    </div>
  );
}

/* ── Main component ───────────────────────────────────────────────────────── */
export function TasksTab() {
  const [tasks,         setTasks]        = useState<Task[]>(SEED_TASKS);
  const [search,        setSearch]       = useState("");
  const [showModal,     setShowModal]    = useState(false);
  const [completedOpen, setCompletedOpen] = useState(true);
  const nextId = useRef(SEED_TASKS.length + 1);

  const activeTasks    = tasks.filter(t => t.status !== "Done");
  const completedTasks = tasks.filter(t => t.status === "Done");

  const applySearch = (list: Task[]) => {
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter(t =>
      t.title.toLowerCase().includes(q) ||
      t.assignee.toLowerCase().includes(q) ||
      t.type.toLowerCase().includes(q)
    );
  };

  const visibleActive = applySearch(activeTasks);
  const visibleCompleted = applySearch(completedTasks);

  const handleAddTask = (partial: Omit<Task, "id" | "status" | "completedAt">) => {
    setTasks(prev => [{ ...partial, id: nextId.current++, status: "Open" }, ...prev]);
  };

  const handleComplete = (id: number) => {
    const now = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: "Done", completedAt: now } : t));
    setCompletedOpen(true);
  };

  const handleReopen = (id: number) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: "Open", completedAt: undefined } : t));
  };

  return (
    <>
      <div className="space-y-5">

        {/* ── Task table ─────────────────────────────────────────────────── */}
        <div style={{ background: "white", border: `1px solid ${BD}`, borderTop: `3px solid ${N}` }}>

          {/* Toolbar */}
          <div className="px-5 py-3 flex items-center gap-4"
            style={{ borderBottom: `1px solid ${BDL}`, background: TH }}>

            {/* Title + counts */}
            <div className="flex items-center gap-2 shrink-0">
              <span style={{ fontSize: "0.88rem", fontWeight: 700, color: TD }}>Tasks for this submission</span>
              <span style={{ fontSize: "0.78rem", color: TT }}>·</span>
              <span style={{ fontSize: "0.78rem", color: TM }}>
                {activeTasks.length} open
              </span>
              <span style={{ fontSize: "0.78rem", color: TT }}>·</span>
              <span style={{ fontSize: "0.78rem", color: TM }}>
                {completedTasks.length} completed
              </span>
            </div>

            {/* Search */}
            <div className="flex items-center gap-2 flex-1 px-3 py-2"
              style={{ background: "white", border: `1px solid ${BD}` }}>
              <Search size={13} color={TT} />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search tasks…"
                className="flex-1 outline-none bg-transparent"
                style={{ fontSize: "0.82rem", color: TD, fontFamily: font }} />
            </div>

            {/* New task */}
            <button onClick={() => setShowModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 hover:brightness-95 transition-all shrink-0"
              style={{ background: N, color: "white", fontSize: "0.80rem", fontWeight: 700 }}>
              <Plus size={13} /> New task
            </button>
          </div>

          {/* Column headers */}
          <ColHeaders />

          {/* Active rows */}
          {visibleActive.length > 0 ? (
            visibleActive.map((task, idx) => (
              <div key={task.id} style={{ borderBottom: idx < visibleActive.length - 1 || visibleCompleted.length > 0 ? `1px solid ${BDL}` : "none" }}>
                <ActiveRow task={task} onComplete={handleComplete} />
              </div>
            ))
          ) : (
            <div className="px-5 py-8 text-center" style={{ borderBottom: visibleCompleted.length > 0 ? `1px solid ${BDL}` : "none" }}>
              <p style={{ fontSize: "0.84rem", color: TT }}>No active tasks match the current filter.</p>
            </div>
          )}

          {/* ── Completed section ─────────────────────────────────────────── */}
          {visibleCompleted.length > 0 && (
            <>
              {/* Section header */}
              <button
                onClick={() => setCompletedOpen(v => !v)}
                className="w-full flex items-center gap-2.5 px-5 py-3 hover:brightness-97 transition-all text-left"
                style={{ background: "#F0F7F2", borderTop: `2px solid #93C8A0`, borderBottom: completedOpen ? `1px solid ${BDL}` : "none" }}>
                <CheckCircle2 size={14} color="#2E7D32" />
                <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#1A5C30", textTransform: "uppercase", letterSpacing: "0.07em", flex: 1 }}>
                  Completed · {visibleCompleted.length} {visibleCompleted.length === 1 ? "task" : "tasks"}
                </span>
                <ChevronRight size={14} color="#2E7D32"
                  style={{ transform: completedOpen ? "rotate(90deg)" : "none", transition: "transform 0.2s" }} />
              </button>

              {/* Completed rows */}
              {completedOpen && visibleCompleted.map((task, idx) => (
                <div key={task.id} style={{ borderBottom: idx < visibleCompleted.length - 1 ? `1px solid ${BDL}` : "none", background: "#FAFFFE" }}>
                  <CompletedRow task={task} onReopen={handleReopen} />
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {showModal && (
        <NewTaskModal onClose={() => setShowModal(false)} onSubmit={handleAddTask} />
      )}
    </>
  );
}