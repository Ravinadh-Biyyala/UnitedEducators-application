import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import {
  Bell, AlertTriangle, CheckCircle2, Clock, AtSign,
  Flag, FileText, CheckCheck,
  Filter, ChevronRight, ShieldAlert, RefreshCw,
} from "lucide-react";
import { AppShell } from "../components/AppShell";
import type { RoleId } from "../components/AppShell";
import { PageRegister } from "../components/companion/PageRegister";
import { newId, now } from "../components/companion/CompanionContext";
import { useAuth } from "../context/AuthContext";
import { PrimaryWhiteButton, RippleButton } from "../components/DashboardCards";

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

type Category = "Mention" | "Approval" | "Task" | "SLA" | "Submission" | "System";
type Severity = "info" | "warn" | "critical" | "success";

interface Notification {
  id: string;
  category: Category;
  severity: Severity;
  title: string;
  body: string;
  actor?: string;
  actorInitials?: string;
  submission?: string;
  timestamp: string;
  minutesAgo: number;
  read: boolean;
}

const ALL_NOTIFS: Notification[] = [
  { id: "n1",  category: "SLA",        severity: "critical", title: "SLA breached on SUB-7835",                             body: "Safety questionnaire request to Hub International is 4 hours past due.",                          actor: "System",            submission: "SUB-7835", timestamp: "4 min ago",  minutesAgo: 4,    read: false },
  { id: "n2",  category: "Approval",   severity: "warn",     title: "Approval required: Premium authority",                  body: "Sarah Mitchell requested approval on a $285,400 premium that exceeds your authority.",            actor: "Sarah Mitchell",    actorInitials: "SM",         submission: "SUB-7829", timestamp: "12 min ago", minutesAgo: 12,   read: false },
  { id: "n3",  category: "Mention",    severity: "info",     title: "James mentioned you on SUB-7834",                       body: "“@John can you take a look at the appetite override request? Director sign-off needed.”",         actor: "James Owens",       actorInitials: "JO",         submission: "SUB-7834", timestamp: "28 min ago", minutesAgo: 28,   read: false },
  { id: "n4",  category: "Task",       severity: "warn",     title: "Task due today: T-1038",                                body: "Obtain updated open claims detail from broker — Gallagher Education.",                              actor: "System",            submission: "SUB-7829", timestamp: "1 hour ago", minutesAgo: 60,   read: false },
  { id: "n5",  category: "Submission", severity: "success",  title: "Quote sent on SUB-7832",                                body: "Indicative quote of $612,300 issued for Vanderbilt University (Property + GL).",                  actor: "Tom Lee",           actorInitials: "TL",         submission: "SUB-7832", timestamp: "2 hours ago", minutesAgo: 120,  read: true  },
  { id: "n6",  category: "Approval",   severity: "success",  title: "Your approval request was approved",                    body: "Director approved the Cyber sublimit increase to $5M on SUB-7831.",                                actor: "Director",          actorInitials: "DR",         submission: "SUB-7831", timestamp: "3 hours ago", minutesAgo: 180,  read: true  },
  { id: "n7",  category: "Submission", severity: "info",     title: "New submission assigned: SUB-7841",                     body: "Stanford University renewal assigned to you — Aon Higher Ed. Need-by date: Jun 18.",              actor: "Lead UW",           actorInitials: "LU",         submission: "SUB-7841", timestamp: "Today, 09:22", minutesAgo: 240,  read: true  },
  { id: "n8",  category: "Mention",    severity: "info",     title: "Sarah mentioned you in Notes",                          body: "“@John flagging this for your review before binding — loss ratio trend is climbing.”",            actor: "Sarah Mitchell",    actorInitials: "SM",         submission: "SUB-7829", timestamp: "Today, 08:48", minutesAgo: 280,  read: true  },
  { id: "n9",  category: "System",     severity: "info",     title: "Daily portfolio brief is ready",                        body: "Your morning portfolio summary for May 13, 2026 has been generated.",                              actor: "Companion",         actorInitials: "AI",         timestamp: "Today, 07:00", minutesAgo: 380, read: true  },
  { id: "n10", category: "SLA",        severity: "warn",     title: "Renewal R-2049 expires in 1 day",                       body: "Chicago Lab Schools (POL-44266) — quote not yet released. Loss ratio 134%.",                       actor: "System",            submission: "SUB-7838", timestamp: "Yesterday",   minutesAgo: 1440, read: true  },
  { id: "n11", category: "Submission", severity: "success",  title: "Bound: SUB-7833",                                       body: "Denver Public Schools policy bound for $254,900 effective Jul 01.",                                actor: "Tom Lee",           actorInitials: "TL",         submission: "SUB-7833", timestamp: "Yesterday",   minutesAgo: 1500, read: true  },
  { id: "n12", category: "System",     severity: "critical", title: "Appetite guideline updated",                            body: "New restrictions on K-12 districts with prior shooter incidents took effect today.",                actor: "Admin",             actorInitials: "AD",         timestamp: "May 11, 2026", minutesAgo: 2880, read: true  },
];

const SEVERITY_STYLE: Record<Severity, { bg: string; color: string; iconBg: string }> = {
  info:     { bg: "white",     color: N,         iconBg: `${N}15`     },
  warn:     { bg: "#FFFBEC",   color: "#8A5C00", iconBg: "#FFF4D6"    },
  critical: { bg: "#FEF6F6",   color: "#B91C1C", iconBg: "#FEE2E2"    },
  success:  { bg: "#F5FBF7",   color: "#15803D", iconBg: "#E8F5EC"    },
};

const CATEGORY_ICON: Record<Category, React.ReactNode> = {
  Mention:    <AtSign size={13}/>,
  Approval:   <Flag size={13}/>,
  Task:       <CheckCircle2 size={13}/>,
  SLA:        <ShieldAlert size={13}/>,
  Submission: <FileText size={13}/>,
  System:     <Bell size={13}/>,
};

export function NotificationsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const role: RoleId = user?.roleId ?? "sr-uw";

  const [tab, setTab] = useState<"all" | "unread" | "mentions" | "critical">("all");
  const [categoryFilter, setCategoryFilter] = useState<Category | "All">("All");
  const [notifs, setNotifs] = useState<Notification[]>(ALL_NOTIFS);

  const markAllRead = () => setNotifs(prev => prev.map(n => ({ ...n, read: true })));
  const markRead    = (id: string) => setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));

  const filtered = useMemo(() => {
    let list = [...notifs];
    if (tab === "unread")   list = list.filter(n => !n.read);
    if (tab === "mentions") list = list.filter(n => n.category === "Mention");
    if (tab === "critical") list = list.filter(n => n.severity === "critical");
    if (categoryFilter !== "All") list = list.filter(n => n.category === categoryFilter);
    return list.sort((a, b) => a.minutesAgo - b.minutesAgo);
  }, [tab, categoryFilter, notifs]);

  const counts = {
    all:      notifs.length,
    unread:   notifs.filter(n => !n.read).length,
    mentions: notifs.filter(n => n.category === "Mention" && !n.read).length,
    critical: notifs.filter(n => n.severity === "critical" && !n.read).length,
  };

  const kpis = [
    { label: "Unread",    value: String(counts.unread),   sub: "Action queue",     accent: N,         icon: <Bell size={16}/>          },
    { label: "Critical",  value: String(counts.critical), sub: "Needs attention",  accent: "#B91C1C", icon: <AlertTriangle size={16}/> },
    { label: "Mentions",  value: String(counts.mentions), sub: "You're tagged",    accent: G,         icon: <AtSign size={16}/>        },
    { label: "Approvals", value: String(notifs.filter(n => n.category === "Approval" && !n.read).length), sub: "Decisions pending",     accent: "#B45309", icon: <Flag size={16}/>          },
    { label: "Today",     value: String(notifs.filter(n => n.minutesAgo <= 480).length), sub: "Last 8 hours",     accent: "#005B99", icon: <Clock size={16}/>         },
    { label: "Resolved",  value: String(notifs.filter(n => n.read).length),               sub: "This week",        accent: "#15803D", icon: <CheckCheck size={16}/>    },
  ];

  return (
    <AppShell activePage="notifications" role={role} onRoleChange={() => {}}>
      <div className="px-4 sm:px-6 lg:px-8 py-5 sm:py-7 space-y-5 sm:space-y-6"
        style={{ fontFamily: font, color: TD, minHeight: "100%", background: "#EEF1F6" }}>

        <PageRegister
          routeKey="page:notifications"
          title="Notifications"
          subtitle="Alerts · mentions · system events"
          greeting="Notifications: 2 critical alerts, 8 events in the last 24 hours. Want me to triage the criticals, summarize recent activity, or tune your settings?"
          suggestions={[
            { id: "critical", label: "Critical alerts",       tone: "red",    icon: "AlertTriangle" },
            { id: "recent",   label: "Recent notifications", tone: "blue",   icon: "Bell" },
            { id: "settings", label: "Notification settings", tone: "violet", icon: "Sparkles" },
            { id: "mentions", label: "Mentions of me",        tone: "gold",   icon: "AtSign" },
          ]}
          respond={(sid) => {
            if (sid === "critical") return [{ id: newId(), role: "agent", kind: "viz", ts: now(), viz: {
              kind: "checklist", title: "Critical alerts",
              items: [
                { ok: false, label: "SUB-7835 — Safety Questionnaire missing", sub: "Seattle PS · 7d overdue" },
                { ok: false, label: "SUB-7831 — Review overdue 16 days",       sub: "Austin ISD · SLA breached" },
              ],
            } }];
            if (sid === "recent") return [{ id: newId(), role: "agent", kind: "text", ts: now(),
              text: "Recent (last 24h, 8): 2 critical alerts · 3 broker emails (Gallagher x2, Marsh) · 1 quote bound (SUB-7833, $158K) · 1 approval granted · 1 reinsurance reply." }];
            if (sid === "settings") return [{ id: newId(), role: "agent", kind: "text", ts: now(),
              text: "Notification preferences:\n• Critical alerts → Push + Email\n• Broker emails → Push when assigned\n• Approval status → Email\n• Quote-bound → Daily digest\n• Pipeline weekly → Fri 5 PM\n\nAdjust in Settings → Notifications." }];
            if (sid === "mentions") return [{ id: newId(), role: "agent", kind: "text", ts: now(),
              text: "Mentions of you today: 3 — Devon tagged you in a SUB-7836 note, Tom in a SUB-7829 thread, and Priya on a SUB-7831 claim status. Want me to open the threads?" }];
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
              <h1 style={{ fontSize: "1.35rem", fontWeight: 800, color: "white", lineHeight: 1.2 }}>Notifications</h1>
              <p style={{ fontSize: "0.80rem", color: "rgba(255,255,255,0.6)", marginTop: 4 }}>
                System alerts · Mentions · Approvals · {counts.unread} unread
              </p>
            </div>
            <PrimaryWhiteButton onClick={markAllRead}>
              <CheckCheck size={14}/>
              Mark All Read
            </PrimaryWhiteButton>
          </div>
        </div>

        {/* ── KPI STRIP ─────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {kpis.map((k, i) => (
            <KPITile key={i} label={k.label} value={k.value} sub={k.sub} accent={k.accent} icon={k.icon}/>
          ))}
        </div>

        {/* ── NOTIFICATIONS CARD ────────────────────────────────────────────── */}
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
                <Bell size={13}/>
              </span>
              <h3 style={{ fontSize: "0.74rem", fontWeight: 700, color: TD, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Notification Stream
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
                { id: "all" as const,      label: "All",       count: counts.all      },
                { id: "unread" as const,   label: "Unread",    count: counts.unread   },
                { id: "mentions" as const, label: "Mentions",  count: counts.mentions },
                { id: "critical" as const, label: "Critical",  count: counts.critical },
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
                      background: t.id === "critical" ? "#B91C1C" : tab === t.id ? N : "#E2E8F0",
                      color: t.id === "critical" || tab === t.id ? "white" : TM,
                      padding: "1px 6px", borderRadius: 8,
                    }}>{t.count}</span>
                  )}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Filter size={12} color={TT}/>
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value as Category | "All")}
                style={{
                  fontSize: "0.72rem", border: `1px solid ${BDL}`, borderRadius: 5,
                  padding: "6px 10px", color: TM, background: "white", fontFamily: font,
                  cursor: "pointer", outline: "none",
                }}>
                {(["All", "Mention", "Approval", "Task", "SLA", "Submission", "System"] as const).map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Stream */}
          <div>
            {filtered.length === 0 ? (
              <div className="px-5 py-12 text-center" style={{ fontSize: "0.82rem", color: TT }}>
                You're all caught up.
              </div>
            ) : filtered.map((n, idx) => {
              const sev = SEVERITY_STYLE[n.severity];
              const isLast = idx === filtered.length - 1;
              return (
                <div key={n.id}
                  onClick={() => {
                    markRead(n.id);
                    if (n.submission) navigate(`/submission/${n.submission}`);
                  }}
                  className="cursor-pointer transition-colors hover:bg-slate-50 group"
                  style={{
                    background: n.read ? "white" : sev.bg,
                    borderBottom: isLast ? "none" : `1px solid #EEF1F5`,
                    borderLeft: n.read ? `3px solid transparent` : `3px solid ${sev.color}`,
                    padding: "12px 18px",
                    display: "flex", alignItems: "flex-start", gap: 12,
                  }}>

                  {/* Icon chip */}
                  <span className="inline-flex items-center justify-center shrink-0"
                    style={{
                      width: 32, height: 32, borderRadius: 8,
                      background: sev.iconBg, color: sev.color, marginTop: 2,
                    }}>
                    {CATEGORY_ICON[n.category]}
                  </span>

                  {/* Body */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 style={{
                        fontSize: "0.84rem",
                        fontWeight: n.read ? 600 : 800,
                        color: TD, lineHeight: 1.3,
                      }} className="group-hover:underline">
                        {n.title}
                      </h4>
                      {!n.read && (
                        <span style={{
                          width: 6, height: 6, borderRadius: "50%", background: N, flexShrink: 0,
                        }}/>
                      )}
                      <span style={{
                        fontSize: "0.58rem", fontWeight: 700, color: sev.color,
                        background: sev.iconBg, padding: "1px 7px", borderRadius: 4,
                        textTransform: "uppercase", letterSpacing: "0.05em",
                      }}>
                        {n.category}
                      </span>
                    </div>
                    <p style={{ fontSize: "0.74rem", color: TM, lineHeight: 1.5, marginTop: 3 }}>
                      {n.body}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                      {n.actor && (
                        <span className="inline-flex items-center gap-1.5" style={{ fontSize: "0.65rem", color: TT }}>
                          {n.actorInitials && (
                            <span className="inline-flex items-center justify-center rounded-full shrink-0"
                              style={{
                                width: 16, height: 16,
                                background: `${N}15`, color: N,
                                fontSize: "0.5rem", fontWeight: 800,
                              }}>
                              {n.actorInitials}
                            </span>
                          )}
                          {n.actor}
                        </span>
                      )}
                      <span style={{ fontSize: "0.65rem", color: TT }}>·</span>
                      <span style={{ fontSize: "0.65rem", color: TT }}>{n.timestamp}</span>
                      {n.submission && (
                        <>
                          <span style={{ fontSize: "0.65rem", color: TT }}>·</span>
                          <span style={{
                            fontSize: "0.65rem", fontWeight: 700, color: N,
                            fontFamily: "ui-monospace, monospace",
                          }}>
                            {n.submission}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Action */}
                  <div className="shrink-0 flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                    {!n.read && (
                      <RippleButton
                        onClick={() => markRead(n.id)}
                        bg="white"
                        bgHover="#F4F6FA"
                        color={TM}
                        border={`1px solid ${BDL}`}
                        rippleColor={`${TT}33`}
                        padding="5px 9px"
                      >
                        <CheckCheck size={11}/> Mark Read
                      </RippleButton>
                    )}
                    <ChevronRight size={13} color={BDL} className="transition-colors group-hover:text-blue-600"/>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="px-5 py-3 flex items-center justify-between flex-wrap gap-3"
            style={{ borderTop: `1px solid ${BDL}`, background: "#FAFBFD" }}>
            <span style={{ fontSize: "0.72rem", color: TT }}>
              <span style={{ fontWeight: 700, color: TD }}>{filtered.length}</span> notifications · <span style={{ fontWeight: 700, color: N }}>{counts.unread}</span> unread
            </span>
            <span className="inline-flex items-center gap-1.5" style={{ fontSize: "0.7rem", color: TT }}>
              <RefreshCw size={11}/> Updates in real time
            </span>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
