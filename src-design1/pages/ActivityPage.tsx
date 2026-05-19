import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import {
  Activity, FileText, CheckCircle2, MessageSquare, Mail,
  Flag, Upload, Edit3, ShieldCheck, DollarSign,
  Filter, Download, ChevronRight, Users, Calendar,
} from "lucide-react";
import { AppShell } from "../components/AppShell";
import type { RoleId } from "../components/AppShell";
import { PageRegister } from "../components/companion/PageRegister";
import { newId, now } from "../components/companion/CompanionContext";
import { useAuth } from "../context/AuthContext";
import { PrimaryWhiteButton } from "../components/DashboardCards";

const N   = "#0123D4";
const G   = "#C9A227";
const BDL = "#DCE3EC";
const TD  = "#1A2530";
const TM  = "#4A5D6E";
const TT  = "#7A8FA3";
const font = "'Source Sans 3', system-ui, sans-serif";

// ─── KPI Tile (Dashboard hover effect) ───────────────────────────────────────
function KPITile({ label, value, sub, accent, icon }: {
  label: string; value: string; sub: string; accent: string; icon: React.ReactNode;
}) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      tabIndex={0}
      role="group"
      aria-label={`${label}: ${value}, ${sub}`}
      style={{
        background: hovered
          ? `linear-gradient(135deg, white 0%, ${accent}08 100%)`
          : "white",
        border: `1px solid ${hovered ? `${accent}40` : BDL}`,
        borderRadius: 10, padding: "14px 16px",
        boxShadow: hovered
          ? `0 2px 6px ${accent}14, 0 1px 2px rgba(15,23,42,0.04)`
          : "0 1px 2px rgba(15,23,42,0.04)",
        transform: hovered ? "translateY(-1px)" : "translateY(0)",
        transition: "background 0.2s ease, border-color 0.2s ease, box-shadow 0.25s ease, transform 0.2s ease",
        position: "relative", overflow: "hidden", outline: "none", cursor: "default",
      }}>
      <span aria-hidden style={{
        position: "absolute", inset: "0 0 auto 0",
        height: hovered ? 4 : 3,
        background: hovered ? accent : `linear-gradient(90deg, ${accent}, ${accent}66)`,
        transition: "height 0.2s ease, background 0.2s ease",
      }}/>
      <div className="flex items-start justify-between gap-2">
        <p style={{
          fontSize: "0.6rem", fontWeight: 700, color: TT,
          textTransform: "uppercase", letterSpacing: "0.09em", lineHeight: 1.3,
        }}>{label}</p>
        <span className="inline-flex items-center justify-center"
          style={{
            width: 30, height: 30, borderRadius: 8,
            background: hovered ? `${accent}1F` : `${accent}10`,
            color: accent,
            transform: hovered ? "scale(1.08)" : "scale(1)",
            transition: "background 0.2s ease, transform 0.2s ease",
          }}>
          {icon}
        </span>
      </div>
      <p style={{
        fontSize: "1.7rem", fontWeight: 800,
        color: hovered ? accent : TD,
        lineHeight: 1.1, marginTop: 6,
        fontVariantNumeric: "tabular-nums",
        transition: "color 0.2s ease",
      }}>{value}</p>
      <div className="inline-flex items-center gap-1 mt-2"
        style={{ fontSize: "0.66rem", color: TT, fontWeight: 600 }}>
        <span>{sub}</span>
      </div>
    </div>
  );
}

type ActivityType =
  | "Submission Created" | "Submission Edited" | "Document Uploaded"
  | "Note Added" | "Email Sent" | "Approval Decided" | "Quote Issued"
  | "Policy Bound" | "Task Completed" | "Risk Assessed";

interface ActivityEvent {
  id: string;
  type: ActivityType;
  actor: string;
  actorInitials: string;
  target: string;
  submission?: string;
  description: string;
  timestamp: string;
  dateBucket: "Today" | "Yesterday" | "Earlier this week" | "Earlier";
  minutesAgo: number;
}

const ALL_EVENTS: ActivityEvent[] = [
  { id: "ev1",  type: "Quote Issued",        actor: "Tom Lee",          actorInitials: "TL", target: "Vanderbilt University",          submission: "SUB-7832", description: "Issued indicative quote of $612,300 (Property + GL).",                       timestamp: "8 min ago",       dateBucket: "Today",              minutesAgo: 8    },
  { id: "ev2",  type: "Approval Decided",    actor: "Director",         actorInitials: "DR", target: "Austin Independent SD",          submission: "SUB-7831", description: "Approved Cyber sublimit increase to $5M.",                                    timestamp: "32 min ago",      dateBucket: "Today",              minutesAgo: 32   },
  { id: "ev3",  type: "Document Uploaded",   actor: "Sarah Mitchell",   actorInitials: "SM", target: "Seattle Public Schools",         submission: "SUB-7835", description: "Uploaded 2024 safety questionnaire (3.2 MB).",                               timestamp: "1 hour ago",      dateBucket: "Today",              minutesAgo: 60   },
  { id: "ev4",  type: "Note Added",          actor: "James Owens",      actorInitials: "JO", target: "Phoenix Charter Academy",        submission: "SUB-7834", description: "“Loss-ratio trend is climbing — flagged for Director review.”",              timestamp: "2 hours ago",     dateBucket: "Today",              minutesAgo: 120  },
  { id: "ev5",  type: "Email Sent",          actor: "Sarah Mitchell",   actorInitials: "SM", target: "Gallagher Education",            submission: "SUB-7829", description: "Sent quote summary to broker (CC: account exec).",                            timestamp: "3 hours ago",     dateBucket: "Today",              minutesAgo: 180  },
  { id: "ev6",  type: "Risk Assessed",       actor: "John Michaels",    actorInitials: "JM", target: "MIT",                             submission: "SUB-7836", description: "Completed appetite review — score 91/100.",                                   timestamp: "Today, 10:14",    dateBucket: "Today",              minutesAgo: 220  },
  { id: "ev7",  type: "Submission Created",  actor: "Sarah Mitchell",   actorInitials: "SM", target: "Stanford University",            submission: "SUB-7841", description: "Created new submission — Higher-Ed renewal package.",                         timestamp: "Today, 09:22",    dateBucket: "Today",              minutesAgo: 270  },
  { id: "ev8",  type: "Task Completed",      actor: "James Owens",      actorInitials: "JO", target: "Riverside Unified SD",            submission: "SUB-7829", description: "Closed T-1047 — Confirmed COPE survey receipt for Lincoln HS.",              timestamp: "Today, 08:48",    dateBucket: "Today",              minutesAgo: 295  },
  { id: "ev9",  type: "Policy Bound",        actor: "Tom Lee",          actorInitials: "TL", target: "Denver Public Schools",          submission: "SUB-7833", description: "Bound policy at $254,900 — effective Jul 01, 2026.",                          timestamp: "Yesterday, 16:30", dateBucket: "Yesterday",         minutesAgo: 1110 },
  { id: "ev10", type: "Submission Edited",   actor: "Sarah Mitchell",   actorInitials: "SM", target: "Riverside Unified SD",            submission: "SUB-7829", description: "Updated effective date — May 30 → Jun 01.",                                   timestamp: "Yesterday, 14:02", dateBucket: "Yesterday",         minutesAgo: 1260 },
  { id: "ev11", type: "Approval Decided",    actor: "Lead UW",          actorInitials: "LU", target: "Seattle Public Schools",         submission: "SUB-7835", description: "Declined 7.5% retention discount — outside guideline.",                       timestamp: "Yesterday, 11:18", dateBucket: "Yesterday",         minutesAgo: 1430 },
  { id: "ev12", type: "Document Uploaded",   actor: "Tom Lee",          actorInitials: "TL", target: "Chicago Lab Schools",             submission: "SUB-7838", description: "Uploaded 5-year claims summary (1.8 MB).",                                    timestamp: "May 11, 2026",     dateBucket: "Earlier this week", minutesAgo: 2880 },
  { id: "ev13", type: "Note Added",          actor: "John Michaels",    actorInitials: "JM", target: "MIT",                             submission: "SUB-7836", description: "“TIV adequacy looks fine against 2024 appraisal — moving to quote.”",         timestamp: "May 11, 2026",     dateBucket: "Earlier this week", minutesAgo: 2920 },
  { id: "ev14", type: "Email Sent",          actor: "James Owens",      actorInitials: "JO", target: "Hub International",               submission: "SUB-7838", description: "Requested updated open-claims detail from broker.",                            timestamp: "May 10, 2026",     dateBucket: "Earlier this week", minutesAgo: 4300 },
  { id: "ev15", type: "Submission Created",  actor: "Tom Lee",          actorInitials: "TL", target: "Boston Latin School",             submission: "SUB-7840", description: "Created new submission — K-12 renewal.",                                       timestamp: "May 09, 2026",     dateBucket: "Earlier this week", minutesAgo: 5760 },
];

const EVENT_STYLE: Record<ActivityType, { color: string; icon: React.ReactNode }> = {
  "Submission Created": { color: N,         icon: <FileText size={13}/>     },
  "Submission Edited":  { color: "#005B99", icon: <Edit3 size={13}/>        },
  "Document Uploaded":  { color: "#8A5C00", icon: <Upload size={13}/>       },
  "Note Added":         { color: TM,        icon: <MessageSquare size={13}/>},
  "Email Sent":         { color: "#005B99", icon: <Mail size={13}/>         },
  "Approval Decided":   { color: G,         icon: <Flag size={13}/>         },
  "Quote Issued":       { color: "#8A5C00", icon: <DollarSign size={13}/>   },
  "Policy Bound":       { color: "#15803D", icon: <ShieldCheck size={13}/>  },
  "Task Completed":     { color: "#15803D", icon: <CheckCircle2 size={13}/> },
  "Risk Assessed":      { color: N,         icon: <ShieldCheck size={13}/>  },
};

export function ActivityPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const role: RoleId = user?.roleId ?? "sr-uw";

  const [tab, setTab] = useState<"all" | "mine" | "team" | "submissions">("all");
  const [typeFilter, setTypeFilter] = useState<ActivityType | "All">("All");

  const myName = user?.name ?? "Sarah Mitchell";

  const filtered = useMemo(() => {
    let list = [...ALL_EVENTS];
    if (tab === "mine")        list = list.filter(e => e.actor === myName);
    if (tab === "team")        list = list.filter(e => ["Sarah Mitchell", "James Owens", "Tom Lee", "John Michaels"].includes(e.actor));
    if (tab === "submissions") list = list.filter(e => !!e.submission);
    if (typeFilter !== "All")  list = list.filter(e => e.type === typeFilter);
    return list.sort((a, b) => a.minutesAgo - b.minutesAgo);
  }, [tab, typeFilter, myName]);

  const grouped = useMemo(() => {
    const buckets: Record<string, ActivityEvent[]> = {};
    for (const e of filtered) {
      if (!buckets[e.dateBucket]) buckets[e.dateBucket] = [];
      buckets[e.dateBucket].push(e);
    }
    return buckets;
  }, [filtered]);

  const counts = {
    all:         ALL_EVENTS.length,
    mine:        ALL_EVENTS.filter(e => e.actor === myName).length,
    team:        ALL_EVENTS.filter(e => ["Sarah Mitchell", "James Owens", "Tom Lee", "John Michaels"].includes(e.actor)).length,
    submissions: ALL_EVENTS.filter(e => !!e.submission).length,
  };

  const todayCount   = ALL_EVENTS.filter(e => e.dateBucket === "Today").length;
  const weekCount    = ALL_EVENTS.filter(e => e.minutesAgo <= 60 * 24 * 7).length;
  const myTodayCount = ALL_EVENTS.filter(e => e.actor === myName && e.dateBucket === "Today").length;
  const boundCount   = ALL_EVENTS.filter(e => e.type === "Policy Bound").length;
  const approvalsCt  = ALL_EVENTS.filter(e => e.type === "Approval Decided").length;
  const docsCount    = ALL_EVENTS.filter(e => e.type === "Document Uploaded").length;

  const kpis = [
    { label: "Events Today",  value: String(todayCount),   sub: "All actions",     accent: N,         icon: <Activity size={16}/>     },
    { label: "My Actions",    value: String(myTodayCount), sub: "Today",           accent: "#005B99", icon: <Users size={16}/>        },
    { label: "Bound",         value: String(boundCount),   sub: "This week",       accent: "#15803D", icon: <ShieldCheck size={16}/>  },
    { label: "Approvals",     value: String(approvalsCt),  sub: "Decided",         accent: G,         icon: <Flag size={16}/>         },
    { label: "Docs Uploaded", value: String(docsCount),    sub: "Last 7d",         accent: "#8A5C00", icon: <Upload size={16}/>       },
    { label: "Events (7d)",   value: String(weekCount),    sub: "Total volume",    accent: "#005B99", icon: <Calendar size={16}/>     },
  ];

  return (
    <AppShell activePage="activity" role={role} onRoleChange={() => {}}>
      <div className="px-4 sm:px-6 lg:px-8 py-5 sm:py-7 space-y-5 sm:space-y-6"
        style={{ fontFamily: font, color: TD, minHeight: "100%", background: "#EEF1F6" }}>

        <PageRegister
          routeKey="page:activity"
          title="Activity"
          subtitle="Audit · events · team feed"
          greeting="Activity feed: 12 events today, 47 your actions this week. Want me to summarize today, show your activity, or break down team-wide?"
          suggestions={[
            { id: "today", label: "Today's activity",  tone: "blue",   icon: "Clock" },
            { id: "mine",  label: "My recent actions", tone: "violet", icon: "Activity" },
            { id: "team",  label: "Team activity",     tone: "gold",   icon: "Users" },
            { id: "docs",  label: "Recent document uploads", tone: "green", icon: "Upload" },
          ]}
          respond={(sid) => {
            if (sid === "today") return [{ id: newId(), role: "agent", kind: "text", ts: now(),
              text: "Activity today (12 events):\n• 09:14 — Reviewed SUB-7829 (you)\n• 09:42 — Note added to SUB-7836 (Devon)\n• 10:05 — Quote letter sent (you)\n• 10:18 — SUB-7833 bound — $158K (Tom)\n• 10:30 — 3 documents uploaded for SUB-7841\n• …7 more entries\n\nMost activity: 10–11 AM." }];
            if (sid === "mine") return [{ id: newId(), role: "agent", kind: "text", ts: now(),
              text: "Your actions today (6): Reviewed SUB-7829 (1.5h) · Sent quote letter to Gallagher · Added note to SUB-7831 · Marked T-1044 complete · Approved SUB-7842 bind authority · Updated lifecycle on SUB-7836 → Quoted." }];
            if (sid === "team") return [{ id: newId(), role: "agent", kind: "text", ts: now(),
              text: "Team activity (last 7d): You 47 · John 52 · Sarah 38 · Tom 29 · James 24. Team avg 38/wk. James & Tom below avg — possible capacity for redistribution." }];
            if (sid === "docs") return [{ id: newId(), role: "agent", kind: "text", ts: now(),
              text: "Recent doc uploads (last 7d): SUB-7841 +3 (broker), SUB-7836 +2 (audited financials), SUB-7829 +1 (loss runs). All processed by intake — none flagged." }];
          }}
        />

        {/* ── HERO ──────────────────────────────────────────────────────────── */}
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
          <div className="relative px-5 sm:px-7 py-5 sm:py-6 flex items-start justify-between gap-3 flex-wrap">
            <div>
              <h1 style={{ fontSize: "1.35rem", fontWeight: 800, color: "white", lineHeight: 1.2 }}>Activity</h1>
              <p style={{ fontSize: "0.80rem", color: "rgba(255,255,255,0.6)", marginTop: 4 }}>
                Workbench-wide audit feed · {todayCount} events today · {weekCount} this week
              </p>
            </div>
            <PrimaryWhiteButton>
              <Download size={14}/>
              Export Feed
            </PrimaryWhiteButton>
          </div>
        </div>

        {/* ── KPI STRIP ─────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {kpis.map((k, i) => (
            <KPITile key={i} label={k.label} value={k.value} sub={k.sub} accent={k.accent} icon={k.icon}/>
          ))}
        </div>

        {/* ── ACTIVITY TIMELINE CARD ────────────────────────────────────────── */}
        <div
          style={{
            background: "white",
            border: `1px solid ${BDL}`,
            borderTop: `3px solid ${N}`,
            borderRadius: 8,
            overflow: "hidden",
            boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
          }}>

          <div className="flex items-center justify-between px-5 py-3 flex-wrap gap-2"
            style={{ borderBottom: `1px solid ${BDL}`, background: "#FAFBFD" }}>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center"
                style={{ width: 24, height: 24, borderRadius: 6, background: `${N}12`, color: N }}>
                <Activity size={13}/>
              </span>
              <h3 style={{ fontSize: "0.74rem", fontWeight: 700, color: TD, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Activity Timeline
              </h3>
            </div>
            <span style={{
              fontSize: "0.68rem", fontWeight: 800, background: `${N}10`, color: N,
              padding: "2px 9px", borderRadius: 10, letterSpacing: "0.02em",
            }}>
              {filtered.length}
            </span>
          </div>

          {/* Toolbar */}
          <div className="flex items-center justify-between px-5 py-2.5 gap-3 flex-wrap"
            style={{ borderBottom: `1px solid ${BDL}` }}>
            <div className="flex items-center gap-1">
              {([
                { id: "all" as const,         label: "All Activity",  count: counts.all         },
                { id: "mine" as const,        label: "My Activity",   count: counts.mine        },
                { id: "team" as const,        label: "Team",          count: counts.team        },
                { id: "submissions" as const, label: "Submissions",   count: counts.submissions },
              ]).map(t => (
                <button key={t.id}
                  onClick={() => setTab(t.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 transition-all"
                  style={{
                    fontSize: "0.74rem", fontWeight: tab === t.id ? 700 : 500,
                    background: tab === t.id ? `${N}10` : "transparent",
                    color: tab === t.id ? N : TM,
                    border: "none", borderRadius: 6, cursor: "pointer", fontFamily: font,
                  }}>
                  {t.label}
                  {t.count > 0 && (
                    <span style={{
                      fontSize: "0.55rem", fontWeight: 800,
                      background: tab === t.id ? N : "#E2E8F0",
                      color: tab === t.id ? "white" : TM,
                      padding: "1px 6px", borderRadius: 8,
                    }}>{t.count}</span>
                  )}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Filter size={12} color={TT}/>
              <select
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value as ActivityType | "All")}
                style={{
                  fontSize: "0.72rem", border: `1px solid ${BDL}`, borderRadius: 5,
                  padding: "6px 10px", color: TM, background: "white", fontFamily: font,
                  cursor: "pointer", outline: "none",
                }}>
                {(["All", "Submission Created", "Submission Edited", "Document Uploaded", "Note Added", "Email Sent", "Approval Decided", "Quote Issued", "Policy Bound", "Task Completed", "Risk Assessed"] as const).map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>

          {/* Timeline */}
          <div className="px-5 sm:px-7 py-5">
            {filtered.length === 0 ? (
              <div className="px-5 py-10 text-center" style={{ fontSize: "0.82rem", color: TT }}>
                No activity matches the current filters.
              </div>
            ) : (["Today", "Yesterday", "Earlier this week", "Earlier"] as const).map(bucket => {
              const events = grouped[bucket];
              if (!events || events.length === 0) return null;
              return (
                <div key={bucket} className="mb-5 last:mb-0">
                  {/* Bucket label */}
                  <div className="flex items-center gap-2 mb-2.5">
                    <span style={{
                      fontSize: "0.64rem", fontWeight: 800, color: TT,
                      textTransform: "uppercase", letterSpacing: "0.1em",
                    }}>
                      {bucket}
                    </span>
                    <span style={{
                      fontSize: "0.58rem", fontWeight: 700, color: TT,
                      background: "#F1F5F9", padding: "1px 7px", borderRadius: 4,
                    }}>
                      {events.length}
                    </span>
                    <div style={{ flex: 1, height: 1, background: "#EEF1F5" }}/>
                  </div>

                  {/* Events */}
                  <ol style={{ listStyle: "none", padding: 0, margin: 0, position: "relative" }}>
                    {/* Vertical rail */}
                    <span aria-hidden style={{
                      position: "absolute",
                      left: 15, top: 6, bottom: 6, width: 2,
                      background: "linear-gradient(to bottom, #DCE3EC 0%, #EEF1F5 100%)",
                    }}/>
                    {events.map((e) => {
                      const style = EVENT_STYLE[e.type];
                      const isClickable = !!e.submission;
                      return (
                        <li key={e.id}
                          onClick={() => { if (isClickable && e.submission) navigate(`/submission/${e.submission}`); }}
                          className={isClickable ? "cursor-pointer group" : ""}
                          style={{
                            position: "relative",
                            padding: "8px 0 8px 44px",
                            transition: "background 0.15s",
                          }}>
                          {/* Node */}
                          <span className="inline-flex items-center justify-center"
                            style={{
                              position: "absolute", left: 0, top: 8,
                              width: 32, height: 32, borderRadius: 8,
                              background: `${style.color}15`, color: style.color,
                              border: `2px solid white`,
                              boxShadow: `0 0 0 1px ${style.color}30`,
                              zIndex: 1,
                            }}>
                            {style.icon}
                          </span>

                          {/* Card */}
                          <div style={{
                            background: "white",
                            border: `1px solid ${BDL}`,
                            borderRadius: 8,
                            padding: "10px 13px",
                            transition: "border-color 0.15s, box-shadow 0.15s",
                          }}
                            className={isClickable ? "group-hover:border-blue-300 group-hover:shadow-sm" : ""}>
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="inline-flex items-center justify-center rounded-full shrink-0"
                                  style={{
                                    width: 18, height: 18,
                                    background: `${N}15`, color: N,
                                    fontSize: "0.5rem", fontWeight: 800,
                                  }}>
                                  {e.actorInitials}
                                </span>
                                <span style={{ fontSize: "0.76rem", fontWeight: 700, color: TD }}>
                                  {e.actor}
                                </span>
                                <span style={{
                                  fontSize: "0.58rem", fontWeight: 700, color: style.color,
                                  background: `${style.color}15`, padding: "1px 7px", borderRadius: 4,
                                  textTransform: "uppercase", letterSpacing: "0.05em",
                                }}>
                                  {e.type}
                                </span>
                              </div>
                              <span style={{ fontSize: "0.62rem", color: TT, whiteSpace: "nowrap" }}>
                                {e.timestamp}
                              </span>
                            </div>
                            <p style={{
                              fontSize: "0.78rem", color: TM, marginTop: 4, lineHeight: 1.5,
                            }}>
                              <span style={{ fontWeight: 700, color: TD }}>{e.target}</span> · {e.description}
                            </p>
                            {e.submission && (
                              <div className="flex items-center gap-1.5 mt-1.5">
                                <span style={{
                                  fontSize: "0.62rem", fontWeight: 700, color: N,
                                  fontFamily: "ui-monospace, monospace",
                                }} className="group-hover:underline">
                                  {e.submission}
                                </span>
                                <ChevronRight size={10} color={BDL}/>
                              </div>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="px-5 py-3 flex items-center justify-between flex-wrap gap-3"
            style={{ borderTop: `1px solid ${BDL}`, background: "#FAFBFD" }}>
            <span style={{ fontSize: "0.72rem", color: TT }}>
              <span style={{ fontWeight: 700, color: TD }}>{filtered.length}</span> of <span style={{ fontWeight: 700, color: N }}>{ALL_EVENTS.length}</span> events shown
            </span>
            <span style={{ fontSize: "0.7rem", color: TT }}>
              Activity is retained for 90 days
            </span>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
