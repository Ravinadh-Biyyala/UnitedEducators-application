import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell, AlertTriangle, CheckCircle2, AtSign,
  Flag, FileText, CheckCheck,
  Filter, ChevronRight, ShieldAlert,
} from "lucide-react";
import { AppShell } from "../components/AppShell";
import type { RoleId } from "../components/AppShell";
import { useAuth } from "../context/AuthContext";
import {
  useNotifications,
  type Notification,
  type NotificationCategory,
  type NotificationSeverity,
} from "../context/NotificationsContext";
import { PrimaryWhiteButton, RippleButton } from "../components/DashboardCards";
import { typo, weight } from "../styles/typography";

// ─── Tokens ──────────────────────────────────────────────────────────────────
const N   = "#0123D4";
const G   = "#C9A227";
const BDL = "#DCE3EC";
const TD  = "#1A2530";
const TM  = "#4A5D6E";
const TT  = "#5F7080";
const CRIT = "#B91C1C";
const WARN = "#B45309";
const font = "'Source Sans 3', system-ui, sans-serif";

// Two-tier severity hierarchy.
//   - "loud"  → critical: red bar, tinted bg, red chip, pulse dot
//   - "muted" → warn/info/success: no background tint, no colored chip on the
//               row itself. Warn keeps a thin amber accent on the icon chip;
//               info/success are fully neutral. This collapses the previous
//               4-color treatment into a clear "act now vs read later" split.
type SeverityTier = "loud" | "muted";

const tierFor = (s: NotificationSeverity): SeverityTier =>
  s === "critical" ? "loud" : "muted";

const CATEGORY_ICON: Record<NotificationCategory, React.ReactNode> = {
  Mention:    <AtSign size={13}/>,
  Approval:   <Flag size={13}/>,
  Task:       <CheckCircle2 size={13}/>,
  SLA:        <ShieldAlert size={13}/>,
  Submission: <FileText size={13}/>,
  System:     <Bell size={13}/>,
};

// Subtle per-category icon tint used on muted rows so the stream still has
// scannable category cues without flooding the row with color.
const CATEGORY_ACCENT: Record<NotificationCategory, string> = {
  Mention:    N,
  Approval:   WARN,
  Task:       TM,
  SLA:        WARN,
  Submission: N,
  System:     TM,
};

export function NotificationsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const role: RoleId = user?.roleId ?? "sr-uw";

  const {
    notifications,
    unreadCount,
    criticalUnreadCount,
    actionableUnreadCount,
    markRead,
    markAllRead,
  } = useNotifications();

  const [tab, setTab] = useState<"all" | "unread" | "mentions" | "critical">("all");
  const [categoryFilter, setCategoryFilter] = useState<NotificationCategory | "All">("All");

  const filtered = useMemo(() => {
    let list = [...notifications];
    if (tab === "unread")   list = list.filter(n => !n.read);
    if (tab === "mentions") list = list.filter(n => n.category === "Mention");
    if (tab === "critical") list = list.filter(n => n.severity === "critical");
    if (categoryFilter !== "All") list = list.filter(n => n.category === categoryFilter);
    return list.sort((a, b) => a.minutesAgo - b.minutesAgo);
  }, [tab, categoryFilter, notifications]);

  const counts = {
    all:      notifications.length,
    unread:   unreadCount,
    mentions: notifications.filter(n => n.category === "Mention" && !n.read).length,
    critical: criticalUnreadCount,
  };

  return (
    <AppShell activePage="notifications" role={role} onRoleChange={() => {}}>
      <div className="px-3 sm:px-4 lg:px-5 py-3 sm:py-4 space-y-3 sm:space-y-4"
        style={{ fontFamily: font, color: TD, minHeight: "100%", background: "#EEF1F6" }}>

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
          <div className="relative px-4 sm:px-5 py-4 sm:py-5 flex items-start justify-between gap-3 flex-wrap">
            <div>
              <h1 style={{ fontSize: "1.35rem", fontWeight: 800, color: "white", lineHeight: 1.2 }}>Notifications</h1>
              <p style={{ fontSize: "0.80rem", color: "rgba(255,255,255,0.6)", marginTop: 4 }}>
                System alerts · Mentions · Approvals · {actionableUnreadCount} actionable{criticalUnreadCount > 0 && <> · {criticalUnreadCount} critical</>}
              </p>
            </div>
            {unreadCount > 0 && (
              <PrimaryWhiteButton onClick={markAllRead}>
                <CheckCheck size={14}/>
                Mark all read
              </PrimaryWhiteButton>
            )}
          </div>
        </div>

        {/* ── Stream card ─────────────────────────────────────────────────── */}
        <div
          style={{
            background: "white",
            border: `1px solid ${BDL}`,
            borderRadius: 8,
            overflow: "hidden",
            boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
          }}>

          {/* Toolbar — functional filters only (no KPI tiles). */}
          <div className="flex items-center justify-between px-5 py-2.5 gap-3 flex-wrap"
            style={{ borderBottom: `1px solid ${BDL}` }}>
            <div className="flex items-center gap-1">
              {([
                { id: "all" as const,      label: "All",       count: counts.all      },
                { id: "unread" as const,   label: "Unread",    count: counts.unread   },
                { id: "mentions" as const, label: "Mentions",  count: counts.mentions },
                { id: "critical" as const, label: "Critical",  count: counts.critical },
              ]).map(t => {
                const active = tab === t.id;
                const isCritical = t.id === "critical";
                return (
                  <button key={t.id}
                    onClick={() => setTab(t.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 transition-all"
                    style={{
                      ...typo.body, fontWeight: active ? weight.bold : weight.medium,
                      background: active ? (isCritical ? `${CRIT}10` : `${N}10`) : "transparent",
                      color: active ? (isCritical ? CRIT : N) : TM,
                      border: "none", borderRadius: 6, cursor: "pointer", fontFamily: font,
                    }}>
                    {t.label}
                    {t.count > 0 && (
                      <span style={{
                        ...typo.overline,
                        background: isCritical ? CRIT : active ? N : "#E2E8F0",
                        color: isCritical || active ? "white" : TM,
                        padding: "1px 7px", borderRadius: 8,
                      }}>{t.count}</span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              <Filter size={12} color={TT}/>
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value as NotificationCategory | "All")}
                style={{
                  ...typo.bodySm, border: `1px solid ${BDL}`, borderRadius: 5,
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
              <div className="px-5 py-12 text-center" style={{ ...typo.body, color: TT }}>
                You're all caught up.
              </div>
            ) : filtered.map((n, idx) => (
              <StreamRow
                key={n.id}
                n={n}
                isLast={idx === filtered.length - 1}
                onOpen={() => {
                  markRead(n.id);
                  if (n.submission) navigate(`/submission/${n.submission}`);
                }}
                onMarkRead={() => markRead(n.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

// ─── Stream row ──────────────────────────────────────────────────────────────
function StreamRow({ n, isLast, onOpen, onMarkRead }: {
  n: Notification;
  isLast: boolean;
  onOpen: () => void;
  onMarkRead: () => void;
}) {
  const tier = tierFor(n.severity);
  const loud = tier === "loud";
  const categoryAccent = CATEGORY_ACCENT[n.category];
  // Warn gets a thin amber tick on the left bar even though it's a "muted" tier
  // — this preserves an "elevated but not critical" cue without flooding the
  // row with color.
  const leftBar = !n.read && loud ? CRIT
                : !n.read && n.severity === "warn" ? WARN
                : "transparent";
  const background = !n.read && loud ? "#FEF6F6" : "white";

  return (
    <div
      onClick={onOpen}
      className="cursor-pointer transition-colors hover:bg-slate-50 group"
      style={{
        background,
        borderBottom: isLast ? "none" : `1px solid #EEF1F5`,
        borderLeft: `3px solid ${leftBar}`,
        padding: "12px 18px",
        display: "flex", alignItems: "flex-start", gap: 12,
      }}>

      {/* Icon chip — color only when loud; otherwise neutral with a faint
          category accent so the icon still reads at a glance. */}
      <span className="inline-flex items-center justify-center shrink-0"
        style={{
          width: 32, height: 32, borderRadius: 8,
          background: loud ? "#FEE2E2" : "#F1F3F8",
          color: loud ? CRIT : categoryAccent,
          marginTop: 2,
        }}>
        {CATEGORY_ICON[n.category]}
      </span>

      {/* Body */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="flex items-center gap-2 flex-wrap">
          <h4 style={{
            ...typo.bodyLg,
            fontWeight: n.read ? weight.semibold : loud ? weight.heavy : weight.bold,
            color: TD,
          }} className="group-hover:underline">
            {n.title}
          </h4>
          {!n.read && (
            <span style={{
              width: 6, height: 6, borderRadius: "50%",
              background: loud ? CRIT : N,
              flexShrink: 0,
            }}/>
          )}
          {/* Loud-tier critical badge — kept ONLY on critical rows. Removing
              the per-row colored category pill on muted rows is the biggest
              single contributor to "easier to read at a glance." */}
          {loud && (
            <span style={{
              ...typo.overline, color: "white",
              background: CRIT, padding: "2px 8px", borderRadius: 9999,
              display: "inline-flex", alignItems: "center", gap: 4,
            }}>
              <AlertTriangle size={10}/> Critical
            </span>
          )}
        </div>
        <p style={{ ...typo.body, color: TM, marginTop: 4 }}>
          {n.body}
        </p>
        <div className="flex items-center gap-2 mt-2 flex-wrap" style={{ ...typo.caption, color: TT }}>
          {/* Category text label — uncolored, just for context. */}
          <span style={{ fontWeight: weight.bold, color: TM }}>{n.category}</span>
          <span>·</span>
          {n.actor && (
            <>
              <span className="inline-flex items-center gap-1.5">
                {n.actorInitials && (
                  <span className="inline-flex items-center justify-center rounded-full shrink-0"
                    style={{
                      width: 18, height: 18,
                      background: `${N}15`, color: N,
                      ...typo.overline,
                    }}>
                    {n.actorInitials}
                  </span>
                )}
                {n.actor}
              </span>
              <span>·</span>
            </>
          )}
          <span>{n.timestamp}</span>
          {n.submission && (
            <>
              <span>·</span>
              <span style={{
                fontWeight: weight.bold, color: N,
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
            onClick={onMarkRead}
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
}
