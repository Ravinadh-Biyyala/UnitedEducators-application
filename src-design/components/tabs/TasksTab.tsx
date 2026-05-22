import { useState, useEffect, useRef } from "react";
import {
  Clock, AlertCircle, AlertTriangle, CheckCircle2, Plus, User, X,
  ChevronDown, Search, ChevronRight, RotateCcw,
} from "lucide-react";
import { useSubmissionWorkspace } from "../../context/SubmissionWorkspaceContext";

/* ── Design tokens ────────────────────────────────────────────────────────── */
const N    = "#0123D4";
const TH   = "#F0F3F8";
const BD   = "#C4CDD8";
const BDL  = "#DCE3EC";
const TD   = "#1A2530";
const TM   = "#4A5D6E";
const TT   = "#5F7080";
const font = "'Source Sans 3', system-ui, sans-serif";

/* ── Types ────────────────────────────────────────────────────────────────── */
export type Priority   = "High" | "Medium" | "Low";
export type TaskStatus = "Open" | "Done";
export type TaskType   =
  | "Review" | "Follow-up" | "Communication" | "Decision" | "Document"
  | "Negotiation" | "Quote" | "Referral" | "Underwriting" | "Compliance";

export interface Task {
  id: number;
  title: string;
  assignee: string;
  due: string;
  priority: Priority;
  status: TaskStatus;
  type: TaskType;
  notes?: string;
  completedAt?: string;
  /** Days past due. Positive = overdue by N days; 0 = due today; negative = upcoming. */
  daysOverdue?: number;
  /** True if the task is escalated / blocked waiting on something. */
  blocked?: boolean;
}

/* ── Constants ────────────────────────────────────────────────────────────── */
export const TASK_TYPES: TaskType[] = [
  "Review", "Follow-up", "Communication", "Decision", "Document",
  "Negotiation", "Quote", "Referral", "Underwriting", "Compliance",
];
export const PRIORITIES: Priority[] = ["High", "Medium", "Low"];
export const ASSIGNEES = [
  "Sarah Mitchell", "James Owens", "Tom Lee", "Devon Carter",
  "Maya Khanna", "Anika Shah", "John Michaels",
];

/* ── Seed data ────────────────────────────────────────────────────────────── */
export const SEED_TASKS: Task[] = [
  { id: 1, title: "Obtain updated open claims detail from broker", assignee: "Sarah Mitchell", due: "May 18, 2026", priority: "High",   status: "Open", type: "Communication", daysOverdue: 3,  blocked: true  },
  { id: 2, title: "Verify background check policy documentation",  assignee: "James Owens",   due: "May 19, 2026", priority: "High",   status: "Open", type: "Compliance",    daysOverdue: 2 },
  { id: 3, title: "Review GASB 68 pension liability report",       assignee: "Tom Lee",        due: "May 21, 2026", priority: "Medium", status: "Open", type: "Review",        daysOverdue: 0 },
  { id: 4, title: "Confirm earthquake zone rating with surveyor",  assignee: "Sarah Mitchell", due: "May 25, 2026", priority: "Medium", status: "Open", type: "Underwriting",  daysOverdue: -4 },
  { id: 5, title: "Run TIV adequacy check against 2024 appraisal",assignee: "Tom Lee",        due: "May 28, 2026", priority: "Low",    status: "Open", type: "Document",      daysOverdue: -7 },
  { id: 6, title: "Send indicative quote to Gallagher",           assignee: "Sarah Mitchell", due: "Jun 02, 2026", priority: "High",   status: "Open", type: "Quote",         daysOverdue: -12 },
  { id: 7, title: "Confirm COPE survey receipt for Lincoln HS",   assignee: "James Owens",    due: "May 18, 2026", priority: "Low",    status: "Done", type: "Follow-up",     completedAt: "May 17, 2026" },
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
        style={{ border: `1px solid ${BD}`, background: "white", fontSize: "0.84rem", color: value ? TD : TT, fontFamily: font, borderRadius: 6 }}>
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
              style={{ fontSize: "0.84rem", fontFamily: font, background: value === opt ? N : "white", color: value === opt ? "white" : TD, borderRadius: 6 }}>
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── New Task Modal ───────────────────────────────────────────────────────── */
export interface NewTaskModalProps {
  onClose: () => void;
  onSubmit: (task: Omit<Task, "id" | "status" | "completedAt">) => void;
  defaults?: {
    type?: TaskType;
    title?: string;
    priority?: Priority;
    assignee?: string;
    due?: string;
    notes?: string;
  };
}

export function NewTaskModal({ onClose, onSubmit, defaults }: NewTaskModalProps) {
  // Account + Submission are locked to the current submission workspace context.
  const account    = "Brookfield Day School";
  const submission = "SUB-10428";
  const [type,       setType]       = useState<TaskType | "">(defaults?.type ?? "");
  const [title,      setTitle]      = useState(defaults?.title ?? "");
  const [priority,   setPriority]   = useState<Priority | "">(defaults?.priority ?? "");
  const [assignee,   setAssignee]   = useState<string>(defaults?.assignee ?? "");
  const [due,        setDue]        = useState(defaults?.due ?? "");
  const [notes,      setNotes]      = useState(defaults?.notes ?? "");

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
        style={{ maxWidth: 640, background: "white", border: `1px solid ${BD}`, boxShadow: "0 20px 60px rgba(0,0,0,0.20)", borderRadius: 10, overflow: "hidden" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: `1px solid ${BDL}` }}>
          <h2 style={{ fontSize: "1.05rem", fontWeight: 800, color: TD }}>New task</h2>
          <button onClick={onClose} className="flex items-center justify-center hover:bg-slate-100 transition-colors"
            style={{ width: 28, height: 28, color: TT, borderRadius: 6 }}>
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {/* Account + Submission — locked to current submission context */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label style={{ fontSize: "0.65rem", fontWeight: 700, color: TT, textTransform: "uppercase", letterSpacing: "0.09em", display: "block", marginBottom: 6 }}>Account</label>
              <input
                readOnly
                value={account}
                aria-readonly="true"
                tabIndex={-1}
                className="w-full px-3 py-2.5 outline-none cursor-not-allowed"
                style={{ fontSize: "0.84rem", border: `1px solid ${BD}`, borderRadius: 6, color: TM, fontFamily: font, background: TH }} />
            </div>
            <div>
              <label style={{ fontSize: "0.65rem", fontWeight: 700, color: TT, textTransform: "uppercase", letterSpacing: "0.09em", display: "block", marginBottom: 6 }}>Submission</label>
              <input
                readOnly
                value={submission}
                aria-readonly="true"
                tabIndex={-1}
                className="w-full px-3 py-2.5 outline-none cursor-not-allowed"
                style={{ fontSize: "0.84rem", border: `1px solid ${BD}`, borderRadius: 6, color: TM, fontFamily: font, background: TH }} />
            </div>
          </div>

          <div>
            <label style={{ fontSize: "0.65rem", fontWeight: 700, color: TT, textTransform: "uppercase", letterSpacing: "0.09em", display: "block", marginBottom: 6 }}>Type</label>
            <CustomSelect<TaskType> value={type} onChange={setType} options={TASK_TYPES} placeholder="Select type…" />
          </div>

          <div>
            <label style={{ fontSize: "0.65rem", fontWeight: 700, color: TT, textTransform: "uppercase", letterSpacing: "0.09em", display: "block", marginBottom: 6 }}>Task</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Follow up with broker on endorsement request"
              className="w-full px-3 py-2.5 outline-none"
              style={{ fontSize: "0.84rem", border: `1px solid ${BD}`, borderRadius: 6, color: TD, fontFamily: font, background: "white", boxSizing: "border-box" }} />
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
              style={{ fontSize: "0.84rem", border: `1px solid ${BD}`, borderRadius: 6, color: due ? TD : TT, fontFamily: font, background: "white", boxSizing: "border-box" }} />
          </div>

          <div>
            <label style={{ fontSize: "0.65rem", fontWeight: 700, color: TT, textTransform: "uppercase", letterSpacing: "0.09em", display: "block", marginBottom: 6 }}>Notes</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Context for the task" rows={3}
              className="w-full outline-none resize-y px-3 py-2.5"
              style={{ fontSize: "0.84rem", border: `1px solid ${BD}`, borderRadius: 6, color: TD, fontFamily: font, background: "white", boxSizing: "border-box" }} />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2.5 px-6 py-4" style={{ borderTop: `1px solid ${BDL}`, background: TH }}>
          <button onClick={onClose} className="px-4 py-2 hover:brightness-97 transition-all"
            style={{ fontSize: "0.80rem", fontWeight: 600, color: TM, background: "white", border: `1px solid ${BD}`, borderRadius: 6 }}>
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={!canSubmit}
            className="flex items-center gap-1.5 px-5 py-2 transition-all hover:brightness-95 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: N, color: "white", fontSize: "0.80rem", fontWeight: 700, borderRadius: 6 }}>
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
  const ts = typeStyle(task.type);

  const isOverdue   = (task.daysOverdue ?? -1) > 0;
  const isDueToday  = task.daysOverdue === 0;
  const isBlocked   = !!task.blocked;
  // The row's primary tier: overdue beats due-today beats blocked.
  const tier: "overdue" | "due-today" | "blocked" | "normal" =
    isOverdue ? "overdue"
    : isDueToday ? "due-today"
    : isBlocked ? "blocked"
    : "normal";
  // Urgent = anything that needs the user's attention. Drives scale + action.
  const isUrgent = tier !== "normal";

  const rowBg = tier === "overdue" || tier === "blocked" ? "#FEF2F2"
              : tier === "due-today" ? "#FFFBEB"
              : "white";
  const railColor = tier === "overdue" || tier === "blocked" ? "#B91C1C"
                  : tier === "due-today" ? "#B45309"
                  : "transparent";
  const railWidth = tier === "overdue" ? 5 : tier === "due-today" || tier === "blocked" ? 4 : 0;
  const hoverBg = tier === "overdue" || tier === "blocked" ? "#FEE2E2"
                : tier === "due-today" ? "#FEF3C7"
                : "#F0F6FF";

  // Scale boost for urgent rows — bigger padding, bigger title, etc.
  const rowPadY      = isUrgent ? 18 : 12;
  const titleSize    = tier === "overdue" ? "0.92rem" : isUrgent ? "0.88rem" : "0.82rem";
  const titleWeight  = isUrgent ? 700 : 500;
  const titleColor   = tier === "overdue" || tier === "blocked" ? "#7A1F1F"
                     : tier === "due-today" ? "#92400E"
                     : TD;

  return (
    <div
      className="grid items-center transition-colors"
      style={{
        gridTemplateColumns: GRID,
        background: rowBg,
        padding: `${rowPadY}px 20px`,
      }}
      onMouseEnter={e => { e.currentTarget.style.background = hoverBg; }}
      onMouseLeave={e => { e.currentTarget.style.background = rowBg; }}>

      {/* Checkbox — urgency is already conveyed by the row rail, bg, title weight,
          and the badges next to the title; no need for a redundant leading icon. */}
      <div className="flex items-center">
        <TaskCheckbox done={false} onToggle={() => onComplete(task.id)} />
      </div>

      {/* Title + urgency / blocked pills inline */}
      <div className="flex flex-col gap-1.5 pr-4">
        <p style={{
          fontSize: titleSize,
          fontWeight: titleWeight,
          color: titleColor,
          lineHeight: 1.35,
          letterSpacing: tier === "overdue" ? "-0.005em" : "0",
        }}>
          {task.title}
        </p>
        {(isOverdue || isDueToday || isBlocked) && (
          <div className="flex items-center gap-1.5 flex-wrap">
            {isOverdue && (
              <span style={{
                fontSize: "0.58rem", fontWeight: 800,
                background: "#B91C1C", color: "white",
                padding: "2px 8px", borderRadius: 9,
                textTransform: "uppercase", letterSpacing: "0.05em",
              }}>
                Overdue · {task.daysOverdue}d
              </span>
            )}
            {isDueToday && (
              <span style={{
                fontSize: "0.58rem", fontWeight: 800,
                background: "#B45309", color: "white",
                padding: "2px 8px", borderRadius: 9,
                textTransform: "uppercase", letterSpacing: "0.05em",
              }}>
                Due today
              </span>
            )}
            {/* BLOCKED pill only renders as the sole urgency badge — if a row is
                already OVERDUE or DUE TODAY, don't stack a second redundant pill. */}
            {isBlocked && !isOverdue && !isDueToday && (
              <span style={{
                fontSize: "0.58rem", fontWeight: 800,
                background: "#7A1F1F", color: "white",
                padding: "2px 8px", borderRadius: 9,
                textTransform: "uppercase", letterSpacing: "0.05em",
              }}>
                Blocked
              </span>
            )}
          </div>
        )}
      </div>

      {/* Type chip — full chrome on urgent rows so it stays legible; very muted on normal rows */}
      <div>
        {isUrgent ? (
          <span style={{
            fontSize: "0.68rem", fontWeight: 600,
            color: ts.text,
            background: `${ts.text}10`,
            border: `1px solid ${ts.border}`,
            padding: "3px 10px",
            borderRadius: 9999,
            whiteSpace: "nowrap",
            display: "inline-block",
            width: "fit-content",
          }}>
            {task.type}
          </span>
        ) : (
          <span style={{
            fontSize: "0.7rem", fontWeight: 500,
            color: TM,
            whiteSpace: "nowrap",
          }}>
            {task.type}
          </span>
        )}
      </div>

      {/* Assignee */}
      <div className="flex items-center gap-2">
        <div className="flex items-center justify-center shrink-0"
          style={{ width: 24, height: 24, background: "#E0E8F0", border: `1px solid ${BD}`, borderRadius: "50%" }}>
          <User size={11} color={N} />
        </div>
        <span style={{ fontSize: "0.75rem", color: TM }}>{task.assignee.split(" ")[0]}</span>
      </div>

      {/* Due date — colored + bold on urgent rows; muted on normal */}
      <div className="flex items-center gap-1.5">
        <Clock size={11} color={isOverdue ? "#B91C1C" : isDueToday ? "#B45309" : TT}/>
        <span style={{
          fontSize: "0.72rem",
          color: isOverdue ? "#7A1F1F" : isDueToday ? "#92400E" : TM,
          fontWeight: isUrgent ? 700 : 500,
        }}>
          {task.due}
        </span>
      </div>

      {/* Last cell — urgent rows get an inline action button; normal rows show priority */}
      {isUrgent ? (
        <button
          onClick={(e) => { e.stopPropagation(); onComplete(task.id); }}
          className="hover:brightness-95 transition-all"
          style={{
            background: tier === "overdue" || tier === "blocked" ? "#B91C1C" : "#B45309",
            color: "white",
            border: "none",
            padding: "6px 12px",
            borderRadius: 6,
            fontSize: "0.7rem",
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: font,
            whiteSpace: "nowrap",
            display: "inline-flex", alignItems: "center", gap: 4,
            width: "fit-content",
          }}>
            Resolve <ChevronRight size={11}/>
        </button>
      ) : task.priority === "High" ? (
        <span style={{
          fontSize: "0.55rem", fontWeight: 800,
          background: "#FEF3C7", color: "#92400E",
          padding: "2px 7px", borderRadius: 9,
          textTransform: "uppercase", letterSpacing: "0.05em",
          display: "inline-block", width: "fit-content",
        }}>
          High
        </span>
      ) : (
        <span className="inline-flex items-center gap-1.5"
          style={{ fontSize: "0.7rem", fontWeight: 500, color: TM }}>
          <span style={{
            width: 6, height: 6, borderRadius: "50%",
            background: task.priority === "Medium" ? "#B45309" : TT,
          }}/>
          {task.priority}
        </span>
      )}
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
          fontSize: "0.68rem", fontWeight: 600,
          background: `${ts.text}10`, color: ts.text,
          border: `1px solid ${ts.border}`,
          padding: "3px 10px", borderRadius: 9999,
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
        style={{ fontSize: "0.65rem", fontWeight: 700, color: TM, background: "white", border: `1px solid ${BD}`, padding: "3px 8px", whiteSpace: "nowrap", borderRadius: 6 }}>
        <RotateCcw size={9} /> Reopen
      </button>
    </div>
  );
}

/* ── Urgency tier — single source of truth for sort + banner + row treatment ── */
type UrgencyTier = "overdue" | "due-today" | "blocked" | "normal";
function urgencyTier(t: Task): UrgencyTier {
  if ((t.daysOverdue ?? -1) > 0) return "overdue";
  if (t.daysOverdue === 0) return "due-today";
  if (t.blocked) return "blocked";
  return "normal";
}

/* ── Main component ───────────────────────────────────────────────────────── */
export function TasksTab() {
  const { tasks, addTask, completeTask, reopenTask } = useSubmissionWorkspace();
  const [search,        setSearch]       = useState("");
  const [showModal,     setShowModal]    = useState(false);
  const [completedOpen, setCompletedOpen] = useState(true);
  const [urgentOnly,    setUrgentOnly]   = useState(false);

  const activeTasks    = tasks.filter(t => t.status !== "Done");
  const completedTasks = tasks.filter(t => t.status === "Done");

  // Action-required counts surface across the whole list, not just the filtered view.
  const overdueCount   = activeTasks.filter(t => (t.daysOverdue ?? -1) > 0).length;
  const dueTodayCount  = activeTasks.filter(t => t.daysOverdue === 0).length;
  const blockedCount   = activeTasks.filter(t => t.blocked && (t.daysOverdue ?? -1) <= 0).length;
  const actionCount    = overdueCount + dueTodayCount + blockedCount;

  const applySearch = (list: Task[]) => {
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter(t =>
      t.title.toLowerCase().includes(q) ||
      t.assignee.toLowerCase().includes(q) ||
      t.type.toLowerCase().includes(q)
    );
  };

  // Sort active tasks so urgent items dominate the top of the list, then apply
  // the "show urgent only" filter if toggled, then apply search.
  const tierRank: Record<UrgencyTier, number> = {
    "overdue": 0, "due-today": 1, "blocked": 2, "normal": 3,
  };
  const sortedActive = [...activeTasks].sort((a, b) => tierRank[urgencyTier(a)] - tierRank[urgencyTier(b)]);
  const urgentFiltered = urgentOnly ? sortedActive.filter(t => urgencyTier(t) !== "normal") : sortedActive;
  const visibleActive    = applySearch(urgentFiltered);
  const visibleCompleted = applySearch(completedTasks);

  const handleAddTask = (partial: Omit<Task, "id" | "status" | "completedAt">) => {
    addTask(partial);
  };

  const handleComplete = (id: number) => {
    completeTask(id);
    setCompletedOpen(true);
  };

  const handleReopen = (id: number) => {
    reopenTask(id);
  };

  return (
    <>
      <div className="space-y-5">

        {/* ── Task table ─────────────────────────────────────────────────── */}
        <div style={{
          background: "white",
          border: `1px solid ${BDL}`,
          borderRadius: 8,
          overflow: "hidden",
          boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
        }}>

          {/* Toolbar */}
          <div className="px-5 py-3 flex items-center gap-4"
            style={{ borderBottom: `1px solid ${BDL}`, background: "#FAFBFD" }}>

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
              style={{ background: "white", border: `1px solid ${BD}`, borderRadius: 6 }}>
              <Search size={13} color={TT} />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search tasks…"
                className="flex-1 outline-none bg-transparent"
                style={{ fontSize: "0.82rem", color: TD, fontFamily: font }} />
            </div>

            {/* New task */}
            <button onClick={() => setShowModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 hover:brightness-95 transition-all shrink-0"
              style={{ background: N, color: "white", fontSize: "0.80rem", fontWeight: 700, borderRadius: 6 }}>
              <Plus size={13} /> New task
            </button>
          </div>

          {/* ── Action Required banner — only renders when there's urgent work.
                 Lets the user pivot from "all tasks" to "urgent only" in one click. */}
          {actionCount > 0 && (
            <div
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                gap: 12, flexWrap: "wrap",
                padding: "10px 20px",
                background: overdueCount > 0 ? "#FEF2F2" : "#FFFBEB",
                borderBottom: `1px solid ${overdueCount > 0 ? "#FECACA" : "#FDE68A"}`,
                boxShadow: `inset 4px 0 0 ${overdueCount > 0 ? "#B91C1C" : "#B45309"}`,
              }}>
              <div className="flex items-center gap-2 flex-wrap">
                <AlertCircle size={14} color={overdueCount > 0 ? "#B91C1C" : "#B45309"} />
                <span style={{
                  fontSize: "0.74rem", fontWeight: 800,
                  color: overdueCount > 0 ? "#7A1F1F" : "#92400E",
                  textTransform: "uppercase", letterSpacing: "0.06em",
                }}>
                  Action Required
                </span>
                <span style={{ width: 1, height: 12, background: overdueCount > 0 ? "#FCA5A5" : "#FCD34D" }}/>
                <div className="flex items-center gap-2.5 flex-wrap" style={{ fontSize: "0.72rem" }}>
                  {overdueCount > 0 && (
                    <span style={{ color: "#7A1F1F" }}>
                      <strong style={{ fontWeight: 800 }}>{overdueCount}</strong> overdue
                    </span>
                  )}
                  {dueTodayCount > 0 && (
                    <span style={{ color: "#92400E" }}>
                      <strong style={{ fontWeight: 800 }}>{dueTodayCount}</strong> due today
                    </span>
                  )}
                  {blockedCount > 0 && (
                    <span style={{ color: "#7A1F1F" }}>
                      <strong style={{ fontWeight: 800 }}>{blockedCount}</strong> blocked
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setUrgentOnly(v => !v)}
                className="hover:brightness-95 transition-all"
                style={{
                  background: urgentOnly ? (overdueCount > 0 ? "#B91C1C" : "#B45309") : "white",
                  color: urgentOnly ? "white" : (overdueCount > 0 ? "#7A1F1F" : "#92400E"),
                  border: `1px solid ${overdueCount > 0 ? "#FCA5A5" : "#FCD34D"}`,
                  padding: "5px 12px", borderRadius: 6,
                  fontSize: "0.7rem", fontWeight: 700, cursor: "pointer", fontFamily: font,
                  whiteSpace: "nowrap",
                }}>
                {urgentOnly ? "Show all" : "Show urgent only"}
              </button>
            </div>
          )}

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
                style={{ background: "#F0F7F2", borderTop: `2px solid #93C8A0`, borderBottom: completedOpen ? `1px solid ${BDL}` : "none", borderRadius: 6 }}>
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