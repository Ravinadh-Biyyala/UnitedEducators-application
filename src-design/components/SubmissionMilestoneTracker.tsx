import { useState } from "react";
import {
  Check, AlertTriangle, FileSearch, FileText, ClipboardCheck,
  ListChecks, Send, ChevronRight, Upload, AlertCircle, Clock,
} from "lucide-react";

// ─── Design tokens (aligned with OverviewTab) ────────────────────────────────
const N    = "#0123D4";
const BD   = "#C4CDD8";
const BDL  = "#DCE3EC";
const TH   = "#F0F3F8";
const TD   = "#1A2530";
const TM   = "#4A5D6E";
const TT   = "#5F7080";
const font = "'Source Sans 3', system-ui, sans-serif";

// ─── Types ────────────────────────────────────────────────────────────────────
type MilestoneStatus = "completed" | "in-progress" | "pending" | "blocked";

interface ChecklistItem {
  label: string;
  done: boolean;
  assignee?: string;
}

interface Milestone {
  id: string;
  title: string;
  shortTitle: string;
  description: string;
  status: MilestoneStatus;
  icon: React.ReactNode;
  checklist: ChecklistItem[];
  updatedAt?: string;
}

// ─── Status style map ─────────────────────────────────────────────────────────
const STATUS_STYLE: Record<MilestoneStatus, {
  circleBg: string;
  circleBorder: string;
  iconColor: string;
  pillBg: string;
  pillText: string;
  label: string;
}> = {
  "completed":   { circleBg:"#15803D", circleBorder:"#15803D", iconColor:"white",   pillBg:"#E8F5EC", pillText:"#15803D", label:"Completed" },
  "in-progress": { circleBg:N,         circleBorder:N,         iconColor:"white",   pillBg:"#E0E7FF", pillText:N,         label:"In Progress" },
  "pending":     { circleBg:"white",   circleBorder:"#CBD5E1", iconColor:"#94A3B8", pillBg:"#F1F5F9", pillText:"#64748B", label:"Pending" },
  "blocked":     { circleBg:"#DC2626", circleBorder:"#DC2626", iconColor:"white",   pillBg:"#FEE2E2", pillText:"#B91C1C", label:"Action Required" },
};

// ─── Mock data ────────────────────────────────────────────────────────────────
const MILESTONES: Milestone[] = [
  {
    id: "intake",
    title: "Intake & Document Upload",
    shortTitle: "Intake",
    description: "Verification of baseline requirements — Application, Audited Financials, and 6–7 years of Loss Runs.",
    status: "completed",
    icon: <Upload size={14}/>,
    updatedAt: "Completed Apr 14, 2026",
    checklist: [
      { label: "ACORD 125 application received",         done: true, assignee: "Broker" },
      { label: "Audited financials (FY24)",              done: true, assignee: "Broker" },
      { label: "Loss runs — 6 years",                    done: true, assignee: "Broker" },
      { label: "Schedule of locations & enrollment",     done: true, assignee: "Broker" },
    ],
  },
  {
    id: "auto-review",
    title: "Dimensional Auto-Review",
    shortTitle: "Auto-Review",
    description: "AI analysis of Appetite/Member-Fit, Claims History, and Comparable Risk Benchmarking.",
    status: "in-progress",
    icon: <FileSearch size={14}/>,
    updatedAt: "Started Apr 16 · ~2 min remaining",
    checklist: [
      { label: "Appetite & member-fit scoring",          done: true,  assignee: "Engine" },
      { label: "Claims history pattern analysis",        done: true,  assignee: "Engine" },
      { label: "Comparable risk benchmarking",           done: false, assignee: "Engine" },
      { label: "Risk-score finalization",                done: false, assignee: "Engine" },
    ],
  },
  {
    id: "supplementals",
    title: "Supplemental Addendums",
    shortTitle: "Addendums",
    description: "Collection of dynamically triggered forms (e.g., Human Subjects Research, TBI Warranty).",
    status: "blocked",
    icon: <FileText size={14}/>,
    updatedAt: "Blocked — awaiting documents from broker",
    checklist: [
      { label: "Cyber supplemental",                     done: false, assignee: "Broker" },
      { label: "Human Subjects Research addendum",       done: false, assignee: "Member" },
      { label: "TBI Warranty form",                      done: false, assignee: "Member" },
    ],
  },
  {
    id: "mock-uw",
    title: "Mock Underwriting Review",
    shortTitle: "Mock UW",
    description: "Identification of red/green flags, management-liability scrub, and underlying-insurance verification.",
    status: "pending",
    icon: <ClipboardCheck size={14}/>,
    checklist: [
      { label: "Red / green flag identification",        done: false, assignee: "UW" },
      { label: "Management-liability scrub",             done: false, assignee: "UW" },
      { label: "Underlying-insurance verification",      done: false, assignee: "UW" },
    ],
  },
  {
    id: "actions",
    title: "Action Items & Companion Recommendations",
    shortTitle: "Action Items",
    description: "Resolution of identified gaps and review of additional recommended coverages (e.g., BLX, XFF).",
    status: "pending",
    icon: <ListChecks size={14}/>,
    checklist: [
      { label: "Resolve missing SIR funding statement",  done: false, assignee: "Broker" },
      { label: "Upload Actuarial Opinion",               done: false, assignee: "Broker" },
      { label: "Review BLX (Broad Liability Extension)", done: false, assignee: "UW" },
      { label: "Review XFF (Extended Facility Form)",    done: false, assignee: "UW" },
    ],
  },
  {
    id: "final",
    title: "Final Submission",
    shortTitle: "Submit",
    description: "Package sent to UE Underwriters for final decision and binding.",
    status: "pending",
    icon: <Send size={14}/>,
    checklist: [
      { label: "Final package compiled",                 done: false },
      { label: "Manager sign-off",                       done: false, assignee: "Manager" },
      { label: "Submitted to UE underwriters",           done: false },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function NodeGlyph({ status, index }: { status: MilestoneStatus; index: number }) {
  if (status === "completed")   return <Check size={16} strokeWidth={3}/>;
  if (status === "in-progress") return <span style={{ width:9, height:9, borderRadius:"50%", background:"white" }}/>;
  if (status === "blocked")     return <AlertTriangle size={15} strokeWidth={2.5}/>;
  return <span style={{ fontSize:"0.78rem", fontWeight:700, color:"#94A3B8" }}>{index + 1}</span>;
}

// ─── Component ────────────────────────────────────────────────────────────────
export function SubmissionMilestoneTracker() {
  // Currently active milestone is expanded by default
  const defaultId = MILESTONES.find(m => m.status === "in-progress")?.id
                 ?? MILESTONES.find(m => m.status === "blocked")?.id
                 ?? MILESTONES[0].id;

  const [selectedId, setSelectedId] = useState<string>(defaultId);
  const [hoverId, setHoverId]       = useState<string | null>(null);

  const selected = MILESTONES.find(m => m.id === selectedId) ?? MILESTONES[0];

  // Progress: fill the track to the center of the last filled (completed or in-progress) node
  const lastFilledIdx = (() => {
    for (let i = MILESTONES.length - 1; i >= 0; i--) {
      if (MILESTONES[i].status === "completed" || MILESTONES[i].status === "in-progress") return i;
    }
    return 0;
  })();
  const progressPct = (lastFilledIdx / (MILESTONES.length - 1)) * 100;

  const blockedCount = MILESTONES.filter(m => m.status === "blocked").length;
  const completedCount = MILESTONES.filter(m => m.status === "completed").length;

  return (
    <div style={{
      background:"white", border:`1px solid ${BD}`,
      fontFamily:font,
    }}>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 flex-wrap px-5 py-3.5"
        style={{ borderBottom:`1px solid ${BD}`, background:TH }}>
        <div>
          <h2 style={{ fontSize:"0.95rem", fontWeight:700, color:TD }}>
            Underwriting Lifecycle
          </h2>
          <p style={{ fontSize:"0.72rem", color:TT, marginTop:2 }}>
            {completedCount} of {MILESTONES.length} stages complete · Brookfield Day School
          </p>
        </div>
        <div className="flex items-center gap-2">
          {blockedCount > 0 && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1"
              style={{ background:"#FEE2E2", border:"1px solid #FCA5A5", borderRadius:9999 }}>
              <AlertCircle size={12} color="#B91C1C"/>
              <span style={{ fontSize:"0.7rem", fontWeight:700, color:"#B91C1C" }}>
                {blockedCount} Action Required
              </span>
            </span>
          )}
        </div>
      </div>

      {/* ── Horizontal stepper (md+) ───────────────────────────────────────── */}
      <div className="hidden md:block px-6 pt-7 pb-5">
        <ol className="relative" aria-label="Submission lifecycle stages" role="list">
          {/* Background track */}
          <div aria-hidden style={{
            position:"absolute", top:18, left:22, right:22,
            height:3, background:BDL, borderRadius:2,
          }}/>
          {/* Animated progress fill */}
          <div aria-hidden style={{
            position:"absolute", top:18, left:22,
            width:`calc((100% - 44px) * ${progressPct} / 100)`,
            height:3,
            background:`linear-gradient(90deg, #15803D 0%, ${N} 100%)`,
            borderRadius:2,
            transition:"width 0.7s cubic-bezier(0.4,0,0.2,1)",
          }}/>

          {/* Nodes */}
          <div className="grid relative" style={{
            gridTemplateColumns:`repeat(${MILESTONES.length}, 1fr)`,
          }}>
            {MILESTONES.map((m, idx) => {
              const s          = STATUS_STYLE[m.status];
              const isSelected = m.id === selectedId;
              const isActive   = m.status === "in-progress";

              return (
                <li key={m.id} className="relative flex flex-col items-center">
                  <button
                    onClick={() => setSelectedId(m.id)}
                    onMouseEnter={() => setHoverId(m.id)}
                    onMouseLeave={() => setHoverId(null)}
                    onFocus={() => setHoverId(m.id)}
                    onBlur={() => setHoverId(null)}
                    aria-current={isActive ? "step" : undefined}
                    aria-expanded={isSelected}
                    aria-controls="ue-milestone-detail"
                    aria-label={`${m.title} — ${s.label}`}
                    className="relative flex flex-col items-center"
                    style={{
                      background:"none", border:"none", cursor:"pointer",
                      fontFamily:font, padding:0, borderRadius:6,
                    }}
                  >
                    {/* Pulse for in-progress */}
                    {isActive && (
                      <span aria-hidden style={{
                        position:"absolute", top:-1, width:40, height:40,
                        borderRadius:"50%", background:N, opacity:0.18,
                        animation:"ueMilestonePulse 1.6s ease-out infinite",
                      }}/>
                    )}

                    {/* Node circle */}
                    <span className="flex items-center justify-center"
                      style={{
                        width:38, height:38, borderRadius:"50%",
                        background:s.circleBg, border:`2px solid ${s.circleBorder}`,
                        color:s.iconColor,
                        boxShadow: isSelected ? `0 0 0 4px ${s.circleBorder}25` : "none",
                        transition:"box-shadow 0.2s, transform 0.2s",
                        transform: isSelected ? "scale(1.04)" : "scale(1)",
                        position:"relative", zIndex:2,
                      }}>
                      <NodeGlyph status={m.status} index={idx}/>
                    </span>

                    {/* Label below */}
                    <span className="mt-3 text-center px-1"
                      style={{ display:"block", maxWidth:120 }}>
                      <span style={{
                        display:"block",
                        fontSize:"0.72rem", fontWeight:700,
                        color: isSelected ? TD : (m.status === "pending" ? TT : TM),
                        lineHeight:1.25,
                      }}>
                        {m.shortTitle}
                      </span>
                      <span style={{
                        display:"block",
                        fontSize:"0.58rem", fontWeight:700,
                        color:s.pillText, marginTop:3,
                        textTransform:"uppercase", letterSpacing:"0.06em",
                      }}>
                        {s.label}
                      </span>
                    </span>
                  </button>

                  {/* Hover/focus tooltip */}
                  {hoverId === m.id && (
                    <div role="tooltip" className="absolute z-30"
                      style={{
                        top:50, left:"50%", transform:"translateX(-50%)",
                        background:TD, color:"white",
                        fontSize:"0.7rem", padding:"8px 11px",
                        borderRadius:9999, width:220,
                        boxShadow:"0 8px 24px rgba(0,0,0,0.22)",
                        pointerEvents:"none",
                      }}>
                      <p style={{ fontWeight:700, marginBottom:3 }}>{m.title}</p>
                      <p style={{ opacity:0.9, lineHeight:1.35 }}>{m.description}</p>
                    </div>
                  )}
                </li>
              );
            })}
          </div>
        </ol>

        {/* Pulse keyframes */}
        <style>{`
          @keyframes ueMilestonePulse {
            0%   { transform: scale(0.85); opacity: 0.55; }
            70%  { transform: scale(1.45); opacity: 0;    }
            100% { transform: scale(1.45); opacity: 0;    }
          }
        `}</style>
      </div>

      {/* ── Vertical stepper (mobile) ──────────────────────────────────────── */}
      <ol className="md:hidden" aria-label="Submission lifecycle stages">
        {MILESTONES.map((m, idx) => {
          const s          = STATUS_STYLE[m.status];
          const isSelected = m.id === selectedId;
          const isActive   = m.status === "in-progress";
          const isLast     = idx === MILESTONES.length - 1;

          return (
            <li key={m.id}
              style={{ borderBottom: isLast ? "none" : `1px solid ${BDL}`, position:"relative" }}>
              <button
                onClick={() => setSelectedId(m.id)}
                aria-current={isActive ? "step" : undefined}
                aria-expanded={isSelected}
                className="w-full flex items-center gap-3 px-5 py-3 text-left"
                style={{
                  background: isSelected ? "#FAFBFD" : "white",
                  border:"none", cursor:"pointer", fontFamily:font, borderRadius:6,
                }}
              >
                <span className="flex items-center justify-center shrink-0"
                  style={{
                    width:32, height:32, borderRadius:"50%",
                    background:s.circleBg, border:`2px solid ${s.circleBorder}`,
                    color:s.iconColor, position:"relative",
                  }}>
                  {isActive && (
                    <span aria-hidden style={{
                      position:"absolute", inset:-3,
                      borderRadius:"50%", background:N, opacity:0.18,
                      animation:"ueMilestonePulse 1.6s ease-out infinite",
                    }}/>
                  )}
                  <NodeGlyph status={m.status} index={idx}/>
                </span>
                <span className="flex-1 min-w-0">
                  <span style={{
                    display:"block", fontSize:"0.84rem", fontWeight:700, color:TD,
                  }}>
                    {m.title}
                  </span>
                  <span style={{
                    display:"block", fontSize:"0.66rem", fontWeight:700,
                    color:s.pillText, marginTop:2,
                    textTransform:"uppercase", letterSpacing:"0.06em",
                  }}>
                    {s.label}
                  </span>
                </span>
                <ChevronRight size={16} color={TT}
                  style={{
                    transform: isSelected ? "rotate(90deg)" : "rotate(0deg)",
                    transition:"transform 0.2s",
                  }}/>
              </button>
            </li>
          );
        })}
      </ol>

      {/* ── Detail panel ───────────────────────────────────────────────────── */}
      {selected && (
        <div id="ue-milestone-detail" role="region"
          aria-labelledby={`ms-detail-${selected.id}`}
          style={{ borderTop:`1px solid ${BDL}`, background:"#FAFBFD" }}>
          <div className="px-5 sm:px-6 py-5">
            {/* Detail header */}
            <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center"
                    style={{
                      width:26, height:26, borderRadius:9999,
                      background:STATUS_STYLE[selected.status].pillBg,
                      color:STATUS_STYLE[selected.status].pillText,
                    }}>
                    {selected.icon}
                  </span>
                  <h3 id={`ms-detail-${selected.id}`}
                    style={{ fontSize:"1rem", fontWeight:700, color:TD }}>
                    {selected.title}
                  </h3>
                </div>
                <p style={{ fontSize:"0.78rem", color:TM, marginTop:6, maxWidth:720, lineHeight:1.5 }}>
                  {selected.description}
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 shrink-0"
                style={{ background:STATUS_STYLE[selected.status].pillBg, borderRadius:9999 }}>
                <span style={{
                  width:6, height:6, borderRadius:"50%",
                  background:STATUS_STYLE[selected.status].pillText,
                }}/>
                <span style={{
                  fontSize:"0.7rem", fontWeight:700,
                  color:STATUS_STYLE[selected.status].pillText,
                }}>
                  {STATUS_STYLE[selected.status].label}
                </span>
              </span>
            </div>

            {/* Checklist card */}
            <div style={{ background:"white", border:`1px solid ${BDL}`, borderRadius:4 }}>
              <div className="px-4 py-2.5 flex items-center justify-between gap-2 flex-wrap"
                style={{ borderBottom:`1px solid ${BDL}`, background:TH }}>
                <span style={{
                  fontSize:"0.62rem", fontWeight:800, color:TT,
                  textTransform:"uppercase", letterSpacing:"0.1em",
                }}>
                  Checklist · {selected.checklist.filter(c => c.done).length} of {selected.checklist.length}
                </span>
                {selected.updatedAt && (
                  <span className="inline-flex items-center gap-1.5"
                    style={{ fontSize:"0.68rem", color:TT }}>
                    <Clock size={11}/>
                    {selected.updatedAt}
                  </span>
                )}
              </div>
              <ul>
                {selected.checklist.map((item, i) => (
                  <li key={i}
                    className="flex items-center justify-between gap-3 px-4 py-2.5"
                    style={{
                      borderBottom: i === selected.checklist.length - 1 ? "none" : `1px solid ${BDL}`,
                    }}>
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="flex items-center justify-center shrink-0"
                        style={{
                          width:16, height:16, borderRadius:9999,
                          background: item.done ? "#15803D" : "white",
                          border:`1.5px solid ${item.done ? "#15803D" : "#CBD5E1"}`,
                        }}>
                        {item.done && <Check size={11} color="white" strokeWidth={3}/>}
                      </span>
                      <span style={{
                        fontSize:"0.8rem", color: item.done ? TM : TD,
                        fontWeight:500,
                        textDecoration: item.done ? "line-through" : "none",
                        textDecorationColor: TT,
                      }}>
                        {item.label}
                      </span>
                    </div>
                    {item.assignee && (
                      <span style={{
                        fontSize:"0.64rem", fontWeight:700, color:TT,
                        textTransform:"uppercase", letterSpacing:"0.06em",
                        whiteSpace:"nowrap", paddingLeft:8,
                      }}>
                        {item.assignee}
                      </span>
                    )}
                  </li>
                ))}
              </ul>

              {/* Contextual footer action */}
              {selected.status === "blocked" && (
                <div className="px-4 py-3 flex items-center justify-between gap-3 flex-wrap"
                  style={{ borderTop:`1px solid ${BDL}`, background:"#FFF5F5" }}>
                  <span style={{ fontSize:"0.74rem", color:"#B91C1C", fontWeight:600 }}>
                    Action required to unblock this stage
                  </span>
                  <button className="inline-flex items-center gap-1.5 px-3 py-1.5"
                    style={{
                      background:"#DC2626", color:"white",
                      fontSize:"0.74rem", fontWeight:700, borderRadius:6,
                      border:"none", cursor:"pointer",
                    }}>
                    Request Documents
                    <ChevronRight size={13}/>
                  </button>
                </div>
              )}
              {selected.status === "in-progress" && (
                <div className="px-4 py-3 flex items-center justify-between gap-3 flex-wrap"
                  style={{ borderTop:`1px solid ${BDL}` }}>
                  <span style={{ fontSize:"0.74rem", color:TM }}>
                    Auto-review running — results expected shortly
                  </span>
                  <button className="inline-flex items-center gap-1.5 px-3 py-1.5"
                    style={{
                      background:N, color:"white",
                      fontSize:"0.74rem", fontWeight:700, borderRadius:6,
                      border:"none", cursor:"pointer",
                    }}>
                    View Live Analysis
                    <ChevronRight size={13}/>
                  </button>
                </div>
              )}
              {selected.status === "completed" && (
                <div className="px-4 py-3 flex items-center justify-between gap-3 flex-wrap"
                  style={{ borderTop:`1px solid ${BDL}`, background:"#F5FBF7" }}>
                  <span style={{ fontSize:"0.74rem", color:"#15803D", fontWeight:600 }}>
                    All requirements satisfied
                  </span>
                  <button className="inline-flex items-center gap-1.5 px-3 py-1.5"
                    style={{
                      background:"white", color:TM,
                      fontSize:"0.74rem", fontWeight:600, borderRadius:6,
                      border:`1px solid ${BD}`, cursor:"pointer",
                    }}>
                    View Submitted Documents
                    <ChevronRight size={13}/>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
