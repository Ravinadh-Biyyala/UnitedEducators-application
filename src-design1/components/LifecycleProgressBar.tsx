import { useState, useMemo } from "react";
import {
  Check, AlertTriangle, AlertCircle, ChevronDown, Clock,
  Inbox, FileSearch, FileText, Gavel, FileCheck, Circle,
  XCircle, MinusCircle, Loader2,
} from "lucide-react";

// ─── Design tokens (aligned with src-design) ─────────────────────────────────
const N      = "#0123D4";
const NAVY   = "#0C1D3B";
const BD     = "#C4CDD8";
const BDL    = "#DCE3EC";
const TH     = "#F0F3F8";
const TD     = "#1A2530";
const TM     = "#4A5D6E";
const TT     = "#7A8FA3";
const GREEN  = "#15803D";
const RED    = "#B91C1C";
const AMBER  = "#B45309";
const font   = "'Source Sans 3', system-ui, sans-serif";

// ─── Types ────────────────────────────────────────────────────────────────────
export type SubStageStatus = "completed" | "active" | "pending" | "terminal";

export interface SubStage {
  id: string;
  label: string;
  status: SubStageStatus;
  /** True if this sub-stage exits the lifecycle early (Declined, Cancelled, etc). */
  isTerminal?: boolean;
  /** Free-form note shown on hover/expand. */
  note?: string;
  /** Optional mock timestamp. */
  at?: string;
}

export type PrimaryStageStatus = "completed" | "active" | "pending" | "interrupted";

export interface PrimaryStage {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  status: PrimaryStageStatus;
  /** ID of the sub-stage currently active inside this primary. */
  currentSubId?: string;
  subStages: SubStage[];
}

// ─── Mock lifecycle data ──────────────────────────────────────────────────────
export const DEFAULT_LIFECYCLE: PrimaryStage[] = [
  {
    id: "intake",
    label: "Intake & Triage",
    description: "Verify intake completeness and route the submission for review.",
    icon: <Inbox size={14}/>,
    status: "completed",
    currentSubId: "complete",
    subStages: [
      { id: "incomplete", label: "Incomplete submission", status: "completed", note: "Initial broker upload accepted with 2 missing items.", at: "Apr 14, 2026" },
      { id: "complete",   label: "Complete submission",   status: "completed", note: "All universal intake docs received and validated.",        at: "Apr 15, 2026" },
      { id: "declined",   label: "Declined to Quote",     status: "pending",   isTerminal: true, note: "Submission would exit the flow here if declined at triage." },
    ],
  },
  {
    id: "underwriting",
    label: "Underwriting",
    description: "AI auto-review, supplemental gathering, and underwriter scrub.",
    icon: <FileSearch size={14}/>,
    status: "active",
    currentSubId: "review",
    subStages: [
      { id: "gathering", label: "Information Gathering", status: "completed", note: "Supplemental forms (Cyber, TBI) gathered from broker.",       at: "Apr 16, 2026" },
      { id: "review",    label: "Review in progress",    status: "active",    note: "Dimensional auto-review running. ~2 minutes remaining." },
      { id: "referred",  label: "Referred",              status: "pending",                       note: "Routed to senior UW for limit-adequacy review." },
    ],
  },
  {
    id: "quoting",
    label: "Quoting",
    description: "Build, send, and negotiate the quote with the broker.",
    icon: <FileText size={14}/>,
    status: "pending",
    subStages: [
      { id: "quote-in-progress", label: "Quote in Progress",  status: "pending", note: "Pricing model and coverage structure being assembled." },
      { id: "quote-sent",        label: "Quote Sent",         status: "pending", note: "Quote letter delivered to broker for review." },
      { id: "negotiation",       label: "Quote Negotiation",  status: "pending", note: "Active back-and-forth with broker on limits or retention." },
      { id: "revised",           label: "Revised Quote",      status: "pending", note: "Re-quote issued reflecting negotiated changes." },
    ],
  },
  {
    id: "decision",
    label: "Decision",
    description: "Bind, non-renew, or close the submission.",
    icon: <Gavel size={14}/>,
    status: "pending",
    subStages: [
      { id: "bound",            label: "Bound",                status: "pending", note: "Member accepted the quote — moving to issuance." },
      { id: "non-renewed",      label: "UE Non-Renewed",       status: "pending", isTerminal: true, note: "UE chose not to renew — terminal." },
      { id: "member-declined",  label: "Member Declined",      status: "pending", isTerminal: true, note: "Member declined the quote — terminal." },
      { id: "no-response",      label: "Member no Response",   status: "pending", isTerminal: true, note: "Quote expired without response — terminal." },
    ],
  },
  {
    id: "post-bind",
    label: "Post-Bind",
    description: "Issuance, endorsements, and cancellation handling.",
    icon: <FileCheck size={14}/>,
    status: "pending",
    subStages: [
      { id: "pending-issuance", label: "Pending Issuance", status: "pending", note: "Awaiting policy issuance from carrier system." },
      { id: "issued",           label: "Issued",           status: "pending", note: "Policy bound and issued — active coverage." },
      { id: "cancelled",        label: "Cancelled",        status: "pending", isTerminal: true, note: "Policy cancelled mid-term — terminal." },
      { id: "endorsed",         label: "Endorsed",         status: "pending", note: "Mid-term endorsement applied." },
    ],
  },
];

// ─── Status helpers ───────────────────────────────────────────────────────────
function primaryGlyph(stage: PrimaryStage, idx: number) {
  if (stage.status === "completed")   return <Check size={16} strokeWidth={3}/>;
  if (stage.status === "active")      return <span style={{ width:10, height:10, borderRadius:"50%", background:"white" }}/>;
  if (stage.status === "interrupted") return <AlertTriangle size={15} strokeWidth={2.5}/>;
  return <span style={{ fontSize:"0.78rem", fontWeight:700, color:"#94A3B8" }}>{idx + 1}</span>;
}

function subGlyph(s: SubStage) {
  if (s.status === "completed") return <Check size={11} color={GREEN} strokeWidth={3}/>;
  if (s.status === "active")    return <Loader2 size={11} color={N} className="animate-spin"/>;
  if (s.isTerminal)             return <XCircle size={11} color={RED}/>;
  return <Circle size={11} color="#CBD5E1"/>;
}

function primaryPalette(stage: PrimaryStage) {
  switch (stage.status) {
    case "completed":   return { bg:GREEN,   border:GREEN,   iconColor:"white",   pillBg:"#E8F5EC", pillText:GREEN, label:"Completed" };
    case "active":      return { bg:N,       border:N,       iconColor:"white",   pillBg:"#E0E7FF", pillText:N,     label:"In Progress" };
    case "interrupted": return { bg:RED,     border:RED,     iconColor:"white",   pillBg:"#FEE2E2", pillText:RED,   label:"Interrupted" };
    default:            return { bg:"white", border:"#CBD5E1", iconColor:"#94A3B8", pillBg:"#F1F5F9", pillText:"#64748B", label:"Pending" };
  }
}

// ═════════════════════════════════════════════════════════════════════════════
//   <LifecycleProgressBar />
// ═════════════════════════════════════════════════════════════════════════════
export function LifecycleProgressBar({
  stages = DEFAULT_LIFECYCLE,
  onStageClick,
  defaultExpanded = true,
}: {
  stages?: PrimaryStage[];
  onStageClick?: (stage: PrimaryStage) => void;
  /** When false, the Sub-Stage History panel starts collapsed — only the progress bar shows. */
  defaultExpanded?: boolean;
}) {
  const activeId = stages.find(s => s.status === "active")?.id
                ?? stages.find(s => s.status === "interrupted")?.id
                ?? stages[0]?.id;
  const [selectedId, setSelectedId] = useState<string>(activeId ?? stages[0].id);
  const [hoverId, setHoverId]       = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(defaultExpanded);

  const selected = stages.find(s => s.id === selectedId) ?? stages[0];
  const selectedPalette = primaryPalette(selected);
  const currentSub = selected.subStages.find(x => x.id === selected.currentSubId);

  // Progress: fill to the center of the last completed or active node.
  const lastFilledIdx = useMemo(() => {
    for (let i = stages.length - 1; i >= 0; i--) {
      if (stages[i].status === "completed" || stages[i].status === "active" || stages[i].status === "interrupted") return i;
    }
    return 0;
  }, [stages]);
  const progressPct = (lastFilledIdx / (stages.length - 1)) * 100;
  const hasInterrupt = stages.some(s => s.status === "interrupted");

  // Counts
  const completedCount = stages.filter(s => s.status === "completed").length;

  const handleClick = (stage: PrimaryStage) => {
    setSelectedId(stage.id);
    onStageClick?.(stage);
  };

  return (
    <div style={{
      background:"white", border:`1px solid ${BD}`, borderTop:`3px solid ${N}`,
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
            {completedCount} of {stages.length} primary stages complete · Brookfield Day School
          </p>
        </div>
        <div className="flex items-center gap-2">
          {currentSub && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1"
              style={{ background:"#E0E7FF", borderRadius:3 }}>
              <Clock size={11} color={N}/>
              <span style={{ fontSize:"0.7rem", fontWeight:700, color:N }}>
                Currently: {currentSub.label}
              </span>
            </span>
          )}
          {/* Collapse / expand toggle for the Sub-Stage History panel */}
          <button
            onClick={() => setIsExpanded(e => !e)}
            aria-expanded={isExpanded}
            aria-controls="lifecycle-detail-panel"
            aria-label={isExpanded ? "Collapse Sub-Stage History" : "Expand Sub-Stage History"}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{
              background:"white", border:`1px solid ${BD}`, borderRadius:6,
              fontSize:"0.7rem", fontWeight:700, color:TM,
              cursor:"pointer", fontFamily:font,
            }}>
            {isExpanded ? "Collapse" : "Expand"}
            <ChevronDown size={13}
              style={{
                transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                transition:"transform 0.2s ease",
              }}/>
          </button>
        </div>
      </div>

      {/* ── Horizontal stepper (md+) ───────────────────────────────────────── */}
      <div className="hidden md:block px-6 pt-8 pb-6">
        <ol className="relative" role="list" aria-label="Underwriting lifecycle stages">
          {/* Background track */}
          <div aria-hidden style={{
            position:"absolute", top:18, left:22, right:22,
            height:3, background:"#E5E7EB", borderRadius:2,
          }}/>
          {/* Progress fill */}
          <div aria-hidden style={{
            position:"absolute", top:18, left:22,
            width:`calc((100% - 44px) * ${progressPct} / 100)`,
            height:3,
            background: hasInterrupt
              ? `linear-gradient(90deg, ${GREEN} 0%, ${RED} 100%)`
              : `linear-gradient(90deg, ${GREEN} 0%, ${N} 100%)`,
            borderRadius:2,
            transition:"width 0.7s cubic-bezier(0.4,0,0.2,1)",
          }}/>

          {/* Nodes */}
          <div className="grid relative" style={{
            gridTemplateColumns:`repeat(${stages.length}, 1fr)`,
          }}>
            {stages.map((stage, idx) => {
              const p          = primaryPalette(stage);
              const isSelected = stage.id === selectedId;
              const isActive   = stage.status === "active";
              const isInterr   = stage.status === "interrupted";
              const sub        = stage.subStages.find(x => x.id === stage.currentSubId);

              return (
                <li key={stage.id} className="relative flex flex-col items-center">
                  <button
                    onClick={() => handleClick(stage)}
                    onMouseEnter={() => setHoverId(stage.id)}
                    onMouseLeave={() => setHoverId(null)}
                    onFocus={() => setHoverId(stage.id)}
                    onBlur={() => setHoverId(null)}
                    aria-current={isActive ? "step" : undefined}
                    aria-expanded={isSelected}
                    aria-controls="lifecycle-detail-panel"
                    aria-label={`${stage.label} — ${p.label}${sub ? `, currently ${sub.label}` : ""}. Click to expand history.`}
                    className="relative flex flex-col items-center focus-visible:outline-2 focus-visible:outline-offset-2"
                    style={{
                      background:"none", border:"none", cursor:"pointer",
                      fontFamily:font, padding:0, borderRadius:6,
                    }}>
                    {/* Pulse halo for active */}
                    {isActive && (
                      <span aria-hidden style={{
                        position:"absolute", top:-1, width:40, height:40,
                        borderRadius:"50%", background:N, opacity:0.18,
                        animation:"ueLifecyclePulse 1.6s ease-out infinite",
                      }}/>
                    )}

                    {/* Node circle */}
                    <span className="flex items-center justify-center"
                      style={{
                        width:38, height:38, borderRadius:"50%",
                        background:p.bg, border:`2px solid ${p.border}`,
                        color:p.iconColor,
                        boxShadow: isSelected ? `0 0 0 4px ${p.border}25` : "none",
                        transition:"box-shadow 0.2s, transform 0.2s",
                        transform: isSelected ? "scale(1.04)" : "scale(1)",
                        position:"relative", zIndex:2,
                      }}>
                      {primaryGlyph(stage, idx)}
                    </span>

                    {/* Label below */}
                    <span className="mt-3 text-center px-1"
                      style={{ display:"block", maxWidth:140 }}>
                      <span style={{
                        display:"block", fontSize:"0.74rem", fontWeight:700,
                        color: isSelected ? TD : (stage.status === "pending" ? TT : TM),
                        lineHeight:1.25,
                      }}>
                        {stage.label}
                      </span>
                      <span style={{
                        display:"block", fontSize:"0.58rem", fontWeight:800,
                        color:p.pillText, marginTop:3,
                        textTransform:"uppercase", letterSpacing:"0.06em",
                      }}>
                        {p.label}
                      </span>

                      {/* Active sub-stage pill below label */}
                      {(isActive || isInterr) && sub && (
                        <span aria-hidden className="inline-flex items-center gap-1 mt-1.5"
                          style={{
                            background: isInterr ? "#FEE2E2" : "#E0E7FF",
                            color:      isInterr ? RED      : N,
                            fontSize:"0.62rem", fontWeight:700,
                            padding:"2px 7px", borderRadius:10,
                            maxWidth:140, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis",
                            display:"inline-block",
                          }}>
                          {sub.label}
                        </span>
                      )}
                    </span>
                  </button>

                  {/* Hover / focus tooltip listing sub-stages */}
                  {hoverId === stage.id && (
                    <div role="tooltip"
                      className="absolute z-30"
                      style={{
                        top: 55,
                        left:"50%", transform:"translateX(-50%)",
                        background:"white",
                        border:`1px solid ${BDL}`,
                        boxShadow:"0 10px 28px rgba(15,23,42,0.18)",
                        borderRadius:6, padding:"9px 11px",
                        width:230, pointerEvents:"none",
                      }}>
                      <p style={{ fontSize:"0.7rem", fontWeight:800, color:TD }}>
                        {stage.label}
                      </p>
                      <p style={{ fontSize:"0.62rem", color:TT, marginTop:2, marginBottom:6, lineHeight:1.4 }}>
                        {stage.description}
                      </p>
                      <ul style={{ display:"flex", flexDirection:"column", gap:4 }}>
                        {stage.subStages.map(s => {
                          const isCurrent = s.id === stage.currentSubId;
                          const valueColor = s.status === "completed" ? GREEN
                                          : s.status === "active"    ? N
                                          : s.isTerminal             ? RED
                                          : TM;
                          return (
                            <li key={s.id} className="flex items-center justify-between gap-2"
                              style={{
                                fontSize:"0.66rem",
                                color: isCurrent ? valueColor : TM,
                                fontWeight: isCurrent ? 700 : 500,
                                padding: isCurrent ? "3px 5px" : 0,
                                background: isCurrent ? (s.isTerminal ? "#FEE2E2" : s.status==="completed" ? "#E8F5EC" : "#E0E7FF") : "transparent",
                                borderRadius: 4,
                              }}>
                              <span className="inline-flex items-center gap-1.5 min-w-0">
                                {subGlyph(s)}
                                <span style={{
                                  whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis",
                                }}>
                                  {s.label}
                                </span>
                              </span>
                              {s.isTerminal && (
                                <span style={{
                                  fontSize:"0.5rem", fontWeight:800, color:RED,
                                  textTransform:"uppercase", letterSpacing:"0.06em",
                                  paddingLeft:6,
                                }}>
                                  Exit
                                </span>
                              )}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </li>
              );
            })}
          </div>
        </ol>

        <style>{`
          @keyframes ueLifecyclePulse {
            0%   { transform: scale(0.85); opacity: 0.55; }
            70%  { transform: scale(1.5);  opacity: 0;    }
            100% { transform: scale(1.5);  opacity: 0;    }
          }
        `}</style>
      </div>

      {/* ── Vertical stepper (mobile) ──────────────────────────────────────── */}
      <ol className="md:hidden" aria-label="Underwriting lifecycle stages">
        {stages.map((stage, idx) => {
          const p          = primaryPalette(stage);
          const isSelected = stage.id === selectedId;
          const isActive   = stage.status === "active";
          const sub        = stage.subStages.find(x => x.id === stage.currentSubId);
          const isLast     = idx === stages.length - 1;

          return (
            <li key={stage.id} style={{ borderBottom: isLast ? "none" : `1px solid ${BDL}` }}>
              <button
                onClick={() => handleClick(stage)}
                aria-current={isActive ? "step" : undefined}
                aria-expanded={isSelected}
                className="w-full flex items-center gap-3 px-5 py-3 text-left"
                style={{
                  background: isSelected ? "#FAFBFD" : "white",
                  border:"none", cursor:"pointer", fontFamily:font, borderRadius:6,
                }}>
                <span className="flex items-center justify-center shrink-0"
                  style={{
                    width:32, height:32, borderRadius:"50%",
                    background:p.bg, border:`2px solid ${p.border}`,
                    color:p.iconColor, position:"relative",
                  }}>
                  {isActive && (
                    <span aria-hidden style={{
                      position:"absolute", inset:-3, borderRadius:"50%",
                      background:N, opacity:0.18,
                      animation:"ueLifecyclePulse 1.6s ease-out infinite",
                    }}/>
                  )}
                  {primaryGlyph(stage, idx)}
                </span>
                <span className="flex-1 min-w-0">
                  <span style={{ display:"block", fontSize:"0.84rem", fontWeight:700, color:TD }}>
                    {stage.label}
                  </span>
                  <span style={{
                    display:"block", fontSize:"0.64rem", fontWeight:700,
                    color:p.pillText, marginTop:2,
                    textTransform:"uppercase", letterSpacing:"0.06em",
                  }}>
                    {p.label}{sub ? ` · ${sub.label}` : ""}
                  </span>
                </span>
                <ChevronDown size={16} color={TT}
                  style={{
                    transform: isSelected ? "rotate(180deg)" : "rotate(0deg)",
                    transition:"transform 0.2s",
                  }}/>
              </button>
            </li>
          );
        })}
      </ol>

      {/* ── Detail panel for selected primary (collapsible) ────────────────── */}
      {isExpanded && (
      <div id="lifecycle-detail-panel" role="region"
        aria-labelledby={`lc-detail-${selected.id}`}
        style={{ borderTop:`1px solid ${BDL}`, background:"#FAFBFD" }}>
        <div className="px-5 sm:px-6 py-5">
          {/* Detail header */}
          <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center"
                  style={{
                    width:26, height:26, borderRadius:4,
                    background:selectedPalette.pillBg, color:selectedPalette.pillText,
                  }}>
                  {selected.icon}
                </span>
                <h3 id={`lc-detail-${selected.id}`}
                  style={{ fontSize:"1rem", fontWeight:700, color:TD }}>
                  {selected.label}
                </h3>
              </div>
              <p style={{ fontSize:"0.78rem", color:TM, marginTop:6, maxWidth:720, lineHeight:1.5 }}>
                {selected.description}
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 shrink-0"
              style={{ background:selectedPalette.pillBg, borderRadius:3 }}>
              <span style={{
                width:6, height:6, borderRadius:"50%",
                background:selectedPalette.pillText,
              }}/>
              <span style={{ fontSize:"0.7rem", fontWeight:700, color:selectedPalette.pillText }}>
                {selectedPalette.label}
              </span>
            </span>
          </div>

          {/* Sub-stage timeline */}
          <div style={{ background:"white", border:`1px solid ${BDL}`, borderRadius:4 }}>
            <div className="px-4 py-2.5 flex items-center justify-between gap-2 flex-wrap"
              style={{ borderBottom:`1px solid ${BDL}`, background:TH }}>
              <span style={{
                fontSize:"0.62rem", fontWeight:800, color:TT,
                textTransform:"uppercase", letterSpacing:"0.1em",
              }}>
                Sub-Stage History · {selected.subStages.filter(s => s.status === "completed").length}/{selected.subStages.length}
              </span>
              <span className="inline-flex items-center gap-1"
                style={{ fontSize:"0.66rem", color:TT }}>
                Terminal sub-stages exit the flow
              </span>
            </div>
            <ol>
              {selected.subStages.map((s, i) => {
                const isCurrent = s.id === selected.currentSubId;
                const last = i === selected.subStages.length - 1;
                const valueColor = s.status === "completed" ? GREEN
                                : s.status === "active"    ? N
                                : s.isTerminal             ? RED
                                : TM;
                return (
                  <li key={s.id}
                    style={{
                      borderBottom: last ? "none" : `1px solid ${BDL}`,
                      background: isCurrent
                        ? (s.isTerminal ? "#FFF5F5" : "#F4F7FF")
                        : "white",
                    }}>
                    <div className="flex items-start gap-3 px-4 py-2.5">
                      <span className="flex items-center justify-center shrink-0"
                        style={{
                          width:18, height:18, borderRadius:"50%",
                          background: s.status === "completed" ? "#E8F5EC"
                                   : s.status === "active"    ? "#E0E7FF"
                                   : s.isTerminal             ? "#FEE2E2"
                                   : "#F1F5F9",
                          marginTop:1,
                        }}>
                        {subGlyph(s)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span style={{
                            fontSize:"0.8rem", fontWeight: isCurrent ? 700 : 600,
                            color: valueColor,
                          }}>
                            {s.label}
                          </span>
                          {s.isTerminal && (
                            <span style={{
                              fontSize:"0.55rem", fontWeight:800, color:RED,
                              background:"#FEE2E2", padding:"1px 6px", borderRadius:3,
                              textTransform:"uppercase", letterSpacing:"0.06em",
                            }}>
                              Terminal · Exits Flow
                            </span>
                          )}
                          {isCurrent && !s.isTerminal && s.status === "active" && (
                            <span style={{
                              fontSize:"0.55rem", fontWeight:800, color:N,
                              background:"#E0E7FF", padding:"1px 6px", borderRadius:3,
                              textTransform:"uppercase", letterSpacing:"0.06em",
                            }}>
                              Current
                            </span>
                          )}
                        </div>
                        {s.note && (
                          <p style={{ fontSize:"0.7rem", color:TM, lineHeight:1.45, marginTop:2 }}>
                            {s.note}
                          </p>
                        )}
                      </div>
                      {s.at && (
                        <span className="inline-flex items-center gap-1 shrink-0"
                          style={{ fontSize:"0.66rem", color:TT, fontWeight:600, paddingTop:2 }}>
                          <Clock size={10}/>
                          {s.at}
                        </span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>

          {/* Terminal warning bar if any sub is terminal AND active is terminal */}
          {selected.subStages.some(s => s.status === "active" && s.isTerminal) && (
            <div className="mt-3 flex items-center gap-2 px-3 py-2"
              style={{ background:"#FEE2E2", border:"1px solid #FCA5A5", borderRadius:4 }}>
              <AlertCircle size={13} color={RED}/>
              <span style={{ fontSize:"0.74rem", color:RED, fontWeight:700 }}>
                This stage entered a terminal sub-state — lifecycle has exited the standard flow.
              </span>
            </div>
          )}
        </div>
      </div>
      )}
    </div>
  );
}

// Helper export — render a small status legend (optional, useful in storybooks).
export function LifecycleLegend() {
  const items: { label: string; color: string; icon: React.ReactNode }[] = [
    { label:"Completed",   color:GREEN, icon:<Check size={10} color="white" strokeWidth={3}/> },
    { label:"In Progress", color:N,     icon:<MinusCircle size={10} color="white"/> },
    { label:"Pending",     color:"#94A3B8", icon:<Circle size={10} color="white"/> },
    { label:"Interrupted", color:RED,   icon:<AlertTriangle size={10} color="white"/> },
  ];
  return (
    <div className="flex items-center gap-3 flex-wrap" style={{ fontFamily: font }}>
      {items.map(it => (
        <span key={it.label} className="inline-flex items-center gap-1.5"
          style={{ fontSize:"0.65rem", color:TM, fontWeight:600 }}>
          <span className="inline-flex items-center justify-center"
            style={{ width:14, height:14, borderRadius:"50%", background:it.color }}>
            {it.icon}
          </span>
          {it.label}
        </span>
      ))}
    </div>
  );
}
