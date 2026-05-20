import { useState } from "react";
import { MessageSquare, CheckSquare, Plus, AlertCircle, CheckCircle2, Clock, User,
  ArrowRightLeft, TrendingUp, Flag, Send, GitBranch, Info } from "lucide-react";

const N   = "#0123D4";
const G   = "#C9A227";
const TH  = "#F0F3F8";
const BD  = "#C4CDD8";
const BDL = "#DCE3EC";
const TD  = "#1A2530";
const TM  = "#4A5D6E";
const TT  = "#7A8FA3";

type Priority   = "High" | "Medium" | "Low";
type TaskStatus = "Open" | "In Progress" | "Done";

interface Task {
  id: number; title: string; assignee: string; due: string;
  priority: Priority; status: TaskStatus;
}
interface Note {
  id: number; author: string; role: string; date: string;
  type: "UW Note" | "Internal" | "Broker Communication";
  content: string; tag?: string;
}

const tasks: Task[] = [
  { id: 1, title: "Obtain updated open claims detail from broker", assignee: "Sarah Mitchell (UW)", due: "Apr 20, 2024", priority: "High",   status: "Open" },
  { id: 2, title: "Verify background check policy documentation",  assignee: "James Owens (Ops)",  due: "Apr 22, 2024", priority: "High",   status: "Open" },
  { id: 3, title: "Review GASB 68 pension liability report",       assignee: "Tom Lee (UW)",       due: "Apr 25, 2024", priority: "Medium", status: "In Progress" },
  { id: 4, title: "Confirm earthquake zone rating with surveyor",  assignee: "Sarah Mitchell (UW)",due: "Apr 28, 2024", priority: "Medium", status: "Open" },
  { id: 5, title: "Run TIV adequacy check against 2024 appraisal",assignee: "Tom Lee (UW)",       due: "May 01, 2024", priority: "Low",    status: "Open" },
  { id: 6, title: "Send indicative quote to Gallagher",           assignee: "Sarah Mitchell (UW)",due: "May 05, 2024", priority: "High",   status: "In Progress" },
  { id: 7, title: "Confirm COPE survey receipt for Lincoln HS",   assignee: "James Owens (Ops)",  due: "May 08, 2024", priority: "Low",    status: "Done" },
];

const notes: Note[] = [
  {
    id: 1, author: "Sarah Mitchell", role: "Lead Underwriter", date: "Mar 18, 2024", type: "UW Note",
    content: "Initial review complete. Overall account looks favorable — strong loss history and safety program. Main concern is policy complexity score (61/100). Recommending a $50K per-occurrence SIR to manage frequency and hold rate flat with prior year. Will monitor the two open claims (CLM-2021-027 and CLM-2019-022) before binding.",
    tag: "Decision Pending",
  },
  {
    id: 2, author: "Tom Lee", role: "Underwriting Analyst", date: "Mar 17, 2024", type: "UW Note",
    content: "5-year loss runs reviewed and certified. Incurred total is $87,200 with a 21% average loss ratio — well within acceptable parameters for the education segment. No catastrophic single losses observed. Recommend approving at current deductible level with slight upward rate adjustment of ~3% to reflect CPI.",
    tag: "Loss Analysis",
  },
  {
    id: 3, author: "James Whitfield", role: "Gallagher Education", date: "Mar 16, 2024", type: "Broker Communication",
    content: "Confirmed the district is going out to three markets (AIG, Chubb, Zurich) this cycle. They had a prior rate increase of 7% from Zurich last renewal. District is seeking flat or sub-5% increase. Broker notes they have flexibility on SIR if needed to reach pricing target.",
  },
  {
    id: 4, author: "Sarah Mitchell", role: "Lead Underwriter", date: "Mar 15, 2024", type: "Internal",
    content: "Submission received via IVANS. All required documents present except open claims report and background check policy. Flagged James Owens to follow up with broker. SIC 8211 — in appetite. Account assigned to education practice group.",
  },
];

const priorityStyle = (p: Priority) => {
  if (p === "High")   return { bg: "#FBEAEA", text: "#7A1F1F", border: "#E8A8A8" };
  if (p === "Medium") return { bg: "#FFF8E6", text: "#8A5C00", border: "#F0D88A" };
  return { bg: TH, text: TT, border: BD };
};

const taskStatusStyle = (s: TaskStatus) => {
  if (s === "Done")        return { bg: "#E8F5EC", text: "#1A5C30", icon: <CheckCircle2 size={13} color="#2E7D32" /> };
  if (s === "In Progress") return { bg: "#E8F0F9", text: "#00427A", icon: <Clock size={13} color="#005B99" /> };
  return { bg: TH, text: TM, icon: <AlertCircle size={13} color={TT} /> };
};

const noteTypeStyle = (t: Note["type"]) => {
  if (t === "UW Note")              return { bg: "#E8F0F9", text: "#00427A" };
  if (t === "Broker Communication") return { bg: "#E8F5EC", text: "#1A5C30" };
  return { bg: "#F0EEF8", text: "#4A2D80" };
};

export function NotesTasksTab() {
  const [newNote, setNewNote] = useState("");
  const [noteType, setNoteType] = useState<Note["type"]>("UW Note");
  const [referralFlagged, setReferralFlagged] = useState(false);
  const open   = tasks.filter((t) => t.status === "Open").length;
  const inProg = tasks.filter((t) => t.status === "In Progress").length;
  const done   = tasks.filter((t) => t.status === "Done").length;

  // Workflow stages
  const STAGES = [
    "Intake & Triage", "Information Gathering", "Risk Assessment",
    "Referral Review", "Quote Preparation", "Bind",
  ];
  const currentStage = "Risk Assessment";

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-5">

      {/* LEFT: Notes */}
      <div className="md:col-span-3 space-y-5">

        {/* ── Submission Status Tracker ─────────────────────────────────── */}
        <div style={{ background: "white", border: `1px solid ${BD}`, borderTop: `3px solid ${N}`, borderRadius: 8, overflow: "hidden" }}>
          <div className="px-5 py-3.5 flex items-center gap-2" style={{ borderBottom: `1px solid ${BDL}`, background: TH }}>
            <GitBranch size={14} color={N} />
            <h3 style={{ fontSize: "0.82rem", fontWeight: 700, color: N, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Submission Status Tracker
            </h3>
          </div>
          <div className="px-5 py-4">
            <div className="flex items-center gap-0 overflow-x-auto pb-1">
              {STAGES.map((stage, i) => {
                const isDone    = STAGES.indexOf(currentStage) > i;
                const isCurrent = stage === currentStage;
                const isLast    = i === STAGES.length - 1;
                return (
                  <div key={stage} className="flex items-center shrink-0">
                    <div className="flex flex-col items-center" style={{ minWidth: 90 }}>
                      <div className="flex items-center justify-center"
                        style={{
                          width: 28, height: 28,
                          background: isCurrent ? N : isDone ? "#2E7D32" : TH,
                          border: `2px solid ${isCurrent ? N : isDone ? "#2E7D32" : BD}`,
                        }}>
                        {isDone
                          ? <CheckCircle2 size={14} color="white" />
                          : isCurrent
                          ? <span style={{ width: 8, height: 8, background: "white", borderRadius: "50%", display: "block" }} />
                          : <span style={{ width: 6, height: 6, background: BD, borderRadius: "50%", display: "block" }} />
                        }
                      </div>
                      <p style={{ fontSize: "0.58rem", fontWeight: isCurrent ? 700 : 500, color: isCurrent ? N : isDone ? "#2E7D32" : TT, marginTop: 5, textAlign: "center", lineHeight: 1.3, maxWidth: 72 }}>
                        {stage}
                      </p>
                    </div>
                    {!isLast && (
                      <div style={{ flex: 1, height: 2, minWidth: 12, background: isDone ? "#2E7D32" : BDL, marginBottom: 20 }} />
                    )}
                  </div>
                );
              })}
            </div>
            <p style={{ fontSize: "0.68rem", color: TM, marginTop: 8 }}>
              Current stage: <strong style={{ color: N }}>{currentStage}</strong> ·
              In this stage since <strong>Mar 18, 2024</strong> (8 days)
            </p>
          </div>
        </div>

        {/* ── Notes & Communications ───────────────────────────────────── */}
        <div style={{ background: "white", border: `1px solid ${BD}`, borderTop: `3px solid ${N}`, borderRadius: 8, overflow: "hidden" }}>
          <div className="px-5 py-3.5 flex items-center justify-between" style={{ borderBottom: `1px solid ${BDL}`, background: TH }}>
            <div className="flex items-center gap-2">
              <MessageSquare size={14} color={N} />
              <h3 style={{ fontSize: "0.82rem", fontWeight: 700, color: N, textTransform: "uppercase", letterSpacing: "0.06em" }}>Notes & Communications</h3>
            </div>
            <span style={{ fontSize: "0.72rem", color: TT }}>{notes.length} entries</span>
          </div>

          {/* Add note */}
          <div className="px-5 py-4" style={{ borderBottom: `1px solid ${BDL}` }}>
            {/* Note type selector */}
            <div className="flex items-center gap-1.5 mb-3">
              {(["UW Note", "Internal", "Broker Communication"] as Note["type"][]).map(t => (
                <button key={t} onClick={() => setNoteType(t)}
                  className="px-3 py-1 transition-all"
                  style={{ fontSize: "0.66rem", fontWeight: noteType === t ? 700 : 500, background: noteType === t ? N : "white", color: noteType === t ? "white" : TM, border: `1px solid ${noteType === t ? N : BD}`, borderRadius: 6 }}>
                  {t}
                </button>
              ))}
            </div>
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder={`Add a ${noteType.toLowerCase()}… (stamped with name and date)`}
              rows={3}
              className="w-full resize-none outline-none px-4 py-3"
              style={{ fontSize: "0.84rem", background: TH, border: `1px solid ${BD}`, borderRadius: 6, color: TD, fontFamily: "'Source Sans 3', system-ui, sans-serif" }}
            />
            <div className="flex items-center justify-between mt-2">
              <p style={{ fontSize: "0.64rem", color: TT }}>
                Will be stamped: <strong>John Michaels</strong> · {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </p>
              <button
                className="flex items-center gap-1.5 px-4 py-2 transition-all hover:brightness-95"
                style={{ background: N, color: "white", fontSize: "0.80rem", fontWeight: 600, borderRadius: 6 }}
              >
                <Plus size={13} />
                Add Note
              </button>
            </div>
          </div>

          {/* Note list */}
          <div>
            {notes.map((note, idx) => {
              const nts = noteTypeStyle(note.type);
              return (
                <div
                  key={note.id}
                  className="px-5 py-5 hover:bg-slate-50/60 transition-colors"
                  style={{ borderBottom: idx < notes.length - 1 ? `1px solid ${BDL}` : "none" }}
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex items-center justify-center shrink-0"
                        style={{ width: 34, height: 34, background: "#E0E8F0", border: `1px solid ${BD}` }}
                      >
                        <User size={14} color={N} />
                      </div>
                      <div>
                        <p style={{ fontSize: "0.875rem", fontWeight: 700, color: TD }}>{note.author}</p>
                        <p style={{ fontSize: "0.70rem", color: TT }}>{note.role} · {note.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {note.tag && (
                        <span style={{ fontSize: "0.60rem", fontWeight: 700, background: "#E8F0F9", color: "#00427A", border: "1px solid #9ABCD6", padding: "1px 7px" }}>
                          {note.tag}
                        </span>
                      )}
                      <span style={{ fontSize: "0.62rem", fontWeight: 700, background: nts.bg, color: nts.text, padding: "1px 7px" }}>
                        {note.type}
                      </span>
                    </div>
                  </div>
                  <p style={{ fontSize: "0.82rem", color: TM, lineHeight: 1.65 }}>{note.content}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* RIGHT: Tasks + Workflow Actions */}
      <div className="md:col-span-2 space-y-5">

        {/* ── Workflow Actions ──────────────────────────────────────────── */}
        <div style={{ background: "white", border: `1px solid ${BD}`, borderTop: `3px solid ${G}`, borderRadius: 8, overflow: "hidden" }}>
          <div className="px-5 py-3.5 flex items-center gap-2" style={{ borderBottom: `1px solid ${BDL}`, background: TH }}>
            <ArrowRightLeft size={14} color={N} />
            <h3 style={{ fontSize: "0.82rem", fontWeight: 700, color: N, textTransform: "uppercase", letterSpacing: "0.06em" }}>Workflow Actions</h3>
          </div>
          <div className="p-4 space-y-2.5">
            {[
              { icon: <ArrowRightLeft size={13} color={N} />,    label: "Reassign Submission",        sub: "Change assigned underwriter",      bg: `${N}0A`,       border: `${N}25`,       textColor: N        },
              { icon: <TrendingUp size={13} color="#B45309" />,  label: "Escalate to Manager",        sub: "Requires supervisor review",       bg: "#FFF8E608",    border: "#F0D88A",      textColor: "#B45309"},
              { icon: <Send size={13} color="#7B2FBE" />,        label: "Delegate to Analyst",        sub: "Assign a sub-task to analyst",     bg: "#7B2FBE08",    border: "#C3B8E8",      textColor: "#7B2FBE"},
              { icon: <Flag size={13} color="#B91C1C" />,        label: referralFlagged ? "Clear Referral Flag" : "Flag: Referral Required",
                                                                  sub: referralFlagged ? "Remove referral requirement" : "Exceeds authority — needs referral",
                                                                  bg: referralFlagged ? "#E8F5EC08" : "#FBEAEA08",
                                                                  border: referralFlagged ? "#93C8A0" : "#E8A8A8",
                                                                  textColor: referralFlagged ? "#2E7D32" : "#B91C1C",
                                                                  onClick: () => setReferralFlagged(v => !v) },
            ].map((action, i) => (
              <button key={i}
                onClick={action.onClick}
                className="w-full flex items-center gap-3 px-4 py-3 hover:brightness-97 transition-all text-left"
                style={{ background: action.bg, border: `1px solid ${action.border}`, borderRadius: 6 }}>
                <span className="shrink-0">{action.icon}</span>
                <div className="flex-1 min-w-0">
                  <p style={{ fontSize: "0.78rem", fontWeight: 700, color: action.textColor }}>{action.label}</p>
                  <p style={{ fontSize: "0.62rem", color: TT }}>{action.sub}</p>
                </div>
              </button>
            ))}
            {referralFlagged && (
              <div className="flex items-start gap-2 px-3 py-2.5" style={{ background: "#FBEAEA", border: "1px solid #E8A8A8" }}>
                <Flag size={12} color="#B91C1C" style={{ flexShrink: 0, marginTop: 1 }} />
                <p style={{ fontSize: "0.70rem", color: "#7A1F1F", lineHeight: 1.5 }}>
                  <strong>Referral Required</strong> — This submission has been flagged. It will appear in the Referral Queue for supervisor review before a quote can be issued.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── Open Tasks ───────────────────────────────────────────────── */}
        <div style={{ background: "white", border: `1px solid ${BD}`, borderTop: `3px solid ${N}`, borderRadius: 8, overflow: "hidden" }}>
          <div className="px-5 py-3.5 flex items-center justify-between" style={{ borderBottom: `1px solid ${BDL}`, background: TH }}>
            <div className="flex items-center gap-2">
              <CheckSquare size={14} color={N} />
              <h3 style={{ fontSize: "0.82rem", fontWeight: 700, color: N, textTransform: "uppercase", letterSpacing: "0.06em" }}>Open Tasks</h3>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <span style={{ fontSize: "0.60rem", fontWeight: 700, background: "#FBEAEA", color: "#7A1F1F", border: "1px solid #E8A8A8", padding: "1px 6px" }}>{open} Open</span>
                <span style={{ fontSize: "0.60rem", fontWeight: 700, background: "#E8F0F9", color: "#00427A", border: "1px solid #9ABCD6", padding: "1px 6px" }}>{inProg} Active</span>
                <span style={{ fontSize: "0.60rem", fontWeight: 700, background: "#E8F5EC", color: "#1A5C30", border: "1px solid #93C8A0", padding: "1px 6px" }}>{done} Done</span>
              </div>
            </div>
          </div>

          {tasks.map((task, idx) => {
            const ps  = priorityStyle(task.priority);
            const tss = taskStatusStyle(task.status);
            return (
              <div
                key={task.id}
                className="px-5 py-4 hover:bg-slate-50/60 transition-colors"
                style={{
                  borderBottom: idx < tasks.length - 1 ? `1px solid ${BDL}` : "none",
                  opacity: task.status === "Done" ? 0.65 : 1,
                }}
              >
                <div className="flex items-start gap-2.5 mb-1.5">
                  <div className="shrink-0 mt-0.5">{tss.icon}</div>
                  <p style={{ fontSize: "0.82rem", fontWeight: 600, color: task.status === "Done" ? TT : TD, lineHeight: 1.4, textDecoration: task.status === "Done" ? "line-through" : "none" }}>
                    {task.title}
                  </p>
                </div>
                <div className="flex items-center justify-between flex-wrap gap-1 pl-6">
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: "0.62rem", color: TT }}>{task.assignee}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: "0.62rem", fontWeight: 700, background: ps.bg, color: ps.text, border: `1px solid ${ps.border}`, padding: "1px 5px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                      {task.priority}
                    </span>
                    <div className="flex items-center gap-1">
                      <Clock size={10} color={TT} />
                      <span style={{ fontSize: "0.62rem", color: TT }}>{task.due}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          <div className="px-5 py-3 flex justify-end" style={{ borderTop: `1px solid ${BDL}`, background: TH }}>
            <button className="flex items-center gap-1.5 px-3 py-1.5 hover:brightness-95 transition-all"
              style={{ background: N, color: "white", fontSize: "0.72rem", fontWeight: 700, borderRadius: 6 }}>
              <Plus size={11} /> Add Task
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}