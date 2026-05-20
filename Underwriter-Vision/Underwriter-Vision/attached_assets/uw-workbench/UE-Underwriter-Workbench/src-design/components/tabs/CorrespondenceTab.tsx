import { useEffect, useMemo, useRef, useState } from "react";
import {
  Mail, MessageSquare, Hash, Users, Phone, FileText,
  Search, Filter, ArrowUp, ArrowDown, Send, Paperclip,
  CheckCircle2, AlertTriangle, Inbox,
} from "lucide-react";
import {
  N, BDL, TD, TM, TT, OK, BAD, WARN,
  SectionCard, font,
} from "../DashboardCards";
import { useSubmissionWorkspaceOptional } from "../../context/SubmissionWorkspaceContext";

// ─── Types ────────────────────────────────────────────────────────────────────
export type Channel = "email" | "slack" | "teams" | "phone" | "internal_note";
export type Direction = "inbound" | "outbound";

interface Attachment {
  name: string;
  sizeKB: number;
}

interface Message {
  id: string;
  threadId: string;
  channel: Channel;
  direction: Direction;
  fromName: string;
  fromEmail?: string;
  toName: string;
  toEmail?: string;
  subject?: string;
  body: string;
  sentAt: string;          // ISO
  attachments?: Attachment[];
  isRead: boolean;
}

interface CorrespondenceThread {
  id: string;
  subject: string;
  channel: Channel;
  participants: string[];
  messages: Message[];
  lastActivityAt: string;
  unreadCount: number;
}

// ─── Channel & direction metadata ─────────────────────────────────────────────
const CHANNEL_META: Record<Channel, { label: string; color: string; bg: string; border: string; icon: React.ReactNode }> = {
  email:         { label: "Email",         color: "#0123D4", bg: "#E0E7FF", border: "#A5B4FC", icon: <Mail size={11}/>          },
  slack:         { label: "Slack",         color: "#611F69", bg: "#F4E5EA", border: "#E5C8D2", icon: <Hash size={11}/>          },
  teams:         { label: "Teams",         color: "#4B53BC", bg: "#E6E8F6", border: "#B5BCE7", icon: <Users size={11}/>          },
  phone:         { label: "Phone",         color: "#15803D", bg: "#E8F5EC", border: "#86EFAC", icon: <Phone size={11}/>          },
  internal_note: { label: "Internal Note", color: "#4A5D6E", bg: "#F1F5F9", border: "#CBD5E1", icon: <FileText size={11}/>       },
};

const DIRECTION_META: Record<Direction, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  inbound:  { label: "Inbound",  color: OK,  bg: "#E8F5EC", icon: <ArrowDown size={10}/> },
  outbound: { label: "Outbound", color: N,   bg: "#E0E7FF", icon: <ArrowUp   size={10}/> },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatRelative = (iso: string): string => {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  const diffMs = Date.now() - d.getTime();
  const m = Math.floor(diffMs / 60000);
  const h = Math.floor(m / 60);
  const dd = Math.floor(h / 24);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  if (dd < 7) return `${dd}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const formatFullDate = (iso: string): string => {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
};

const initialsOf = (name: string): string =>
  name.split(/\s+/).map(s => s[0] ?? "").join("").slice(0, 2).toUpperCase();

const truncate = (s: string, n: number) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

// ─── Mock seed data ───────────────────────────────────────────────────────────
export function buildSeedThreads(): CorrespondenceThread[] {
  const subId = "SUB-7829";
  const m = (overrides: Partial<Message>): Message => ({
    id: overrides.id ?? `msg_${Math.random().toString(36).slice(2, 9)}`,
    threadId: overrides.threadId ?? "",
    channel: overrides.channel ?? "email",
    direction: overrides.direction ?? "inbound",
    fromName: overrides.fromName ?? "",
    fromEmail: overrides.fromEmail,
    toName: overrides.toName ?? "",
    toEmail: overrides.toEmail,
    subject: overrides.subject,
    body: overrides.body ?? "",
    sentAt: overrides.sentAt ?? new Date().toISOString(),
    attachments: overrides.attachments,
    isRead: overrides.isRead ?? true,
  });

  const threads: CorrespondenceThread[] = [
    // 1. Email — broker quote-clarification (multiple messages, attachments)
    {
      id: "th_brk_quote",
      subject: `Quote clarification — Primary GL terms · ${subId}`,
      channel: "email",
      participants: ["T. Owens (Gallagher)", "Maya Khanna"],
      lastActivityAt: "2024-04-18T15:12:00Z",
      unreadCount: 1,
      messages: [
        m({ id: "m1a", threadId: "th_brk_quote", channel: "email", direction: "inbound",
          fromName: "T. Owens", fromEmail: "t.owens@gallaghered.com",
          toName: "Maya Khanna", toEmail: "maya.khanna@ue.org",
          subject: `Quote clarification — Primary GL terms · ${subId}`,
          body: "Hi Maya — wanted to double-check the GL terms before we present to the board. Could you confirm the SIR at $50K vs. $100K and whether SAM is included at the $5M sublimit? Also any chance of a 12% rate decrease vs. expiring? Thanks.",
          sentAt: "2024-04-15T13:04:00Z",
          attachments: [{ name: "Brookfield_Board_Memo.pdf", sizeKB: 412 }],
          isRead: true,
        }),
        m({ id: "m1b", threadId: "th_brk_quote", channel: "email", direction: "outbound",
          fromName: "Maya Khanna", fromEmail: "maya.khanna@ue.org",
          toName: "T. Owens", toEmail: "t.owens@gallaghered.com",
          body: "Tom — confirming: SIR is $50K standard; we can offer $100K for a 7% credit. SAM endorsement is included at $5M sublimit. A 12% reduction is outside our authority at current loss ratio (58%, 2 open claims). Best I can do is hold flat with the SAM enhancement and 3-yr rate lock option.",
          sentAt: "2024-04-16T09:21:00Z",
          isRead: true,
        }),
        m({ id: "m1c", threadId: "th_brk_quote", channel: "email", direction: "inbound",
          fromName: "T. Owens", fromEmail: "t.owens@gallaghered.com",
          toName: "Maya Khanna", toEmail: "maya.khanna@ue.org",
          body: "Understood — let's go with the flat renewal + SAM + 3-yr lock. Member is meeting Thursday so we'll need the formal quote letter by Wednesday EOD. Can you push it through?",
          sentAt: "2024-04-18T15:12:00Z",
          isRead: false,
        }),
      ],
    },

    // 2. Email — broker submission with attachments
    {
      id: "th_brk_app",
      subject: `Renewal application package — Brookfield Day School`,
      channel: "email",
      participants: ["T. Owens (Gallagher)", "Maya Khanna"],
      lastActivityAt: "2024-03-15T10:42:00Z",
      unreadCount: 0,
      messages: [
        m({ id: "m2a", threadId: "th_brk_app", channel: "email", direction: "inbound",
          fromName: "T. Owens", fromEmail: "t.owens@gallaghered.com",
          toName: "Maya Khanna", toEmail: "maya.khanna@ue.org",
          subject: "Renewal application package — Brookfield Day School",
          body: "Attaching the renewal application + 5-year loss runs + financial statements. Coverage lines as discussed: EPL, ELL, GL, Cyber. Effective 6/1/2026.",
          sentAt: "2024-03-15T10:42:00Z",
          isRead: true,
          attachments: [
            { name: "ACORD_125_Application_2024.pdf", sizeKB: 1420 },
            { name: "5_Year_Certified_Loss_Runs.xlsx", sizeKB: 1640 },
            { name: "Audited_Financials_FY23.pdf",     sizeKB: 2440 },
          ],
        }),
      ],
    },

    // 3. Internal Slack — UW + UW Specialist
    {
      id: "th_sl_internal",
      subject: `Internal · Brookfield risk discussion`,
      channel: "slack",
      participants: ["Maya Khanna", "Devon Carter"],
      lastActivityAt: "2024-04-17T18:35:00Z",
      unreadCount: 0,
      messages: [
        m({ id: "m3a", threadId: "th_sl_internal", channel: "slack", direction: "outbound",
          fromName: "Maya Khanna", toName: "Devon Carter",
          body: "Devon — pulled loss runs for Brookfield. 2 open claims (one ELL — Title IX, one GL — slip). Both reserved low. Comfortable with rate hold?",
          sentAt: "2024-04-17T16:08:00Z",
          isRead: true,
        }),
        m({ id: "m3b", threadId: "th_sl_internal", channel: "slack", direction: "inbound",
          fromName: "Devon Carter", toName: "Maya Khanna",
          body: "Pulled their 6yr loss history — 58% loss ratio overall. Frequency normal for Private K-12. I'd hold rate, layer a 3-yr lock to capture them. ELL is the one to watch.",
          sentAt: "2024-04-17T16:32:00Z",
          isRead: true,
        }),
        m({ id: "m3c", threadId: "th_sl_internal", channel: "slack", direction: "outbound",
          fromName: "Maya Khanna", toName: "Devon Carter",
          body: "Agreed. Going to broker with flat + SAM at $5M + 3yr lock option.",
          sentAt: "2024-04-17T18:35:00Z",
          isRead: true,
        }),
      ],
    },

    // 4. Teams — claims analyst
    {
      id: "th_tm_claims",
      subject: `Claims status — Brookfield open files`,
      channel: "teams",
      participants: ["Maya Khanna", "Priya Singh (Claims)"],
      lastActivityAt: "2024-04-14T11:50:00Z",
      unreadCount: 0,
      messages: [
        m({ id: "m4a", threadId: "th_tm_claims", channel: "teams", direction: "outbound",
          fromName: "Maya Khanna", toName: "Priya Singh",
          body: "Priya — anything I should know about the two open Brookfield files before I quote the renewal?",
          sentAt: "2024-04-14T10:22:00Z",
          isRead: true,
        }),
        m({ id: "m4b", threadId: "th_tm_claims", channel: "teams", direction: "inbound",
          fromName: "Priya Singh", toName: "Maya Khanna",
          body: "GL slip claim — reserves $18K, plaintiff has retained counsel but discovery hasn't started. Expected resolve under reserve. ELL Title IX matter — admin investigation only, no suit. Reserves $42K but most for defense. Neither should move the needle.",
          sentAt: "2024-04-14T11:50:00Z",
          isRead: true,
        }),
      ],
    },

    // 5. Phone — call log
    {
      id: "th_ph_member",
      subject: `Member call — coverage walkthrough`,
      channel: "phone",
      participants: ["Maya Khanna", "Eleanor Chen (Brookfield CFO)"],
      lastActivityAt: "2024-04-12T14:00:00Z",
      unreadCount: 0,
      messages: [
        m({ id: "m5a", threadId: "th_ph_member", channel: "phone", direction: "inbound",
          fromName: "Eleanor Chen", toName: "Maya Khanna",
          body: "30-min call. Eleanor walked through their planned facility expansion (new gym + science wing, ~$8M TIV addition). Asked about builder's risk and coverage for student-led robotics activities. I sent a follow-up with property limits and confirmed clubs/extracurriculars are covered under GL.",
          sentAt: "2024-04-12T14:00:00Z",
          isRead: true,
        }),
      ],
    },

    // 6. Outbound email — request missing docs (links to Task 4 chatbot draft-email flow)
    {
      id: "th_brk_missing",
      subject: `Missing documents — Brookfield Day School submission`,
      channel: "email",
      participants: ["Maya Khanna", "T. Owens (Gallagher)"],
      lastActivityAt: "2024-04-19T09:00:00Z",
      unreadCount: 0,
      messages: [
        m({ id: "m6a", threadId: "th_brk_missing", channel: "email", direction: "outbound",
          fromName: "Maya Khanna", fromEmail: "maya.khanna@ue.org",
          toName: "T. Owens", toEmail: "t.owens@gallaghered.com",
          subject: "Missing documents — Brookfield Day School submission",
          body: "Tom — to finalize the renewal we still need: (1) EEO Policy Statement (EPL), (2) Sexual Misconduct Policy (ELL), (3) Property Schedule & Valuations (GL). Let me know if any of these are pending or already on file. Need by Wednesday to keep the timeline.",
          sentAt: "2024-04-19T09:00:00Z",
          isRead: true,
        }),
      ],
    },

    // 7. Internal note — authority referral
    {
      id: "th_in_referral",
      subject: `Authority referral note — pricing exception`,
      channel: "internal_note",
      participants: ["Maya Khanna"],
      lastActivityAt: "2024-04-18T17:25:00Z",
      unreadCount: 0,
      messages: [
        m({ id: "m7a", threadId: "th_in_referral", channel: "internal_note", direction: "outbound",
          fromName: "Maya Khanna", toName: "File",
          body: "Authority referral filed for the 3-year rate lock structure (above standard authority for 12-month policy term). Approval received from UW Manager (J. Halloway) at 5:15pm — referenced in quote letter footer.",
          sentAt: "2024-04-18T17:25:00Z",
          isRead: true,
        }),
      ],
    },
  ];

  return threads;
}

// ═════════════════════════════════════════════════════════════════════════════
//   CorrespondenceTab
// ═════════════════════════════════════════════════════════════════════════════
export function CorrespondenceTab() {
  // Prefer workspace-shared threads (so SubmissionDetail can show the unread badge);
  // fall back to local state if rendered outside a provider.
  const workspace = useSubmissionWorkspaceOptional();
  const [localThreads, setLocalThreads] = useState<CorrespondenceThread[]>(() => buildSeedThreads());
  const threads     = workspace ? workspace.threads    : localThreads;
  const setThreads  = workspace ? workspace.setThreads : setLocalThreads;

  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [channelFilters, setChannelFilters]     = useState<Set<Channel>>(new Set());
  const [directionFilter, setDirectionFilter]   = useState<"all" | Direction>("all");
  const [search, setSearch]                     = useState("");

  // Composer
  const [composerText, setComposerText]       = useState("");
  const [composerChannel, setComposerChannel] = useState<Channel>("email");

  // ── Task 4 handoff: if the chatbot pushed a composer draft, consume it ─────
  useEffect(() => {
    if (!workspace?.pendingComposerDraft) return;
    const draft = workspace.consumePendingComposerDraft();
    if (!draft) return;
    // Find or create a thread matching the subject + channel
    const existing = threads.find(
      t => t.channel === draft.channel && t.subject.toLowerCase() === draft.subject.toLowerCase()
    );
    if (existing) {
      setSelectedThreadId(existing.id);
      setComposerText(draft.body);
      setComposerChannel(draft.channel);
      return;
    }
    const newId = `th_draft_${Date.now()}`;
    const newThread: CorrespondenceThread = {
      id: newId,
      subject: draft.subject,
      channel: draft.channel,
      participants: ["Maya Khanna", draft.to],
      lastActivityAt: new Date().toISOString(),
      unreadCount: 0,
      messages: [],
    };
    setThreads(prev => [newThread, ...prev]);
    setSelectedThreadId(newId);
    setComposerText(draft.body);
    setComposerChannel(draft.channel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspace?.pendingComposerDraft]);

  // Toast / snackbar
  const [toast, setToast] = useState<{ msg: string; tone: "success" | "info" | "error" } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = (msg: string, tone: "success" | "info" | "error" = "success") => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ msg, tone });
    toastTimer.current = setTimeout(() => setToast(null), 2800);
  };

  // Filtered threads
  const filteredThreads = useMemo(() => {
    const q = search.trim().toLowerCase();
    return threads.filter(t => {
      if (channelFilters.size > 0 && !channelFilters.has(t.channel)) return false;
      if (directionFilter !== "all") {
        const hasDir = t.messages.some(m => m.direction === directionFilter);
        if (!hasDir) return false;
      }
      if (q) {
        const hit =
          t.subject.toLowerCase().includes(q) ||
          t.messages.some(m => m.body.toLowerCase().includes(q) || (m.subject ?? "").toLowerCase().includes(q));
        if (!hit) return false;
      }
      return true;
    });
  }, [threads, channelFilters, directionFilter, search]);

  const selectedThread = useMemo(
    () => threads.find(t => t.id === selectedThreadId) ?? null,
    [threads, selectedThreadId]
  );

  // Counters
  const totalMessages = useMemo(() => threads.reduce((s, t) => s + t.messages.length, 0), [threads]);
  const totalUnread   = useMemo(() => threads.reduce((s, t) => s + t.unreadCount, 0), [threads]);
  const lastActivity  = useMemo(() => {
    const all = threads.map(t => new Date(t.lastActivityAt).getTime()).filter(n => !isNaN(n));
    if (all.length === 0) return null;
    return new Date(Math.max(...all)).toISOString();
  }, [threads]);

  // Mark thread read on select
  const handleSelectThread = (id: string) => {
    setSelectedThreadId(id);
    setThreads(prev => prev.map(t => t.id !== id ? t : {
      ...t,
      unreadCount: 0,
      messages: t.messages.map(m => ({ ...m, isRead: true })),
    }));
  };

  const toggleChannel = (c: Channel) => {
    setChannelFilters(prev => {
      const next = new Set(prev);
      if (next.has(c)) next.delete(c); else next.add(c);
      return next;
    });
  };

  const clearAllFilters = () => {
    setChannelFilters(new Set());
    setDirectionFilter("all");
    setSearch("");
  };

  const sendMessage = () => {
    const text = composerText.trim();
    if (!text || !selectedThread) return;
    const newMsg: Message = {
      id: `msg_${Date.now()}`,
      threadId: selectedThread.id,
      channel: composerChannel,
      direction: "outbound",
      fromName: "Maya Khanna",
      fromEmail: "maya.khanna@ue.org",
      toName: selectedThread.participants.find(p => !p.includes("Maya")) ?? "Recipient",
      body: text,
      sentAt: new Date().toISOString(),
      isRead: true,
    };
    setThreads(prev => prev.map(t => t.id !== selectedThread.id ? t : {
      ...t,
      messages: [...t.messages, newMsg],
      lastActivityAt: newMsg.sentAt,
    }));
    setComposerText("");
    showToast(`Message sent via ${CHANNEL_META[composerChannel].label}`, "success");
  };

  const activeFilterCount = channelFilters.size + (directionFilter !== "all" ? 1 : 0) + (search.trim() ? 1 : 0);

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <div className="space-y-5" style={{ fontFamily: font }}>

        {/* ── At-a-glance counters ─────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <CounterTile
            label="Total Messages"
            value={String(totalMessages)}
            sub={`across ${threads.length} thread${threads.length !== 1 ? "s" : ""}`}
            color={N}
            icon={<Mail size={14}/>}
          />
          <CounterTile
            label="Unread"
            value={String(totalUnread)}
            sub={totalUnread > 0 ? "needs your attention" : "all caught up"}
            color={totalUnread > 0 ? WARN : OK}
            icon={<Inbox size={14}/>}
          />
          <CounterTile
            label="Last Activity"
            value={lastActivity ? formatRelative(lastActivity) : "—"}
            sub={lastActivity ? formatFullDate(lastActivity) : "no activity yet"}
            color={TM}
            icon={<MessageSquare size={14}/>}
          />
        </div>

        {/* ── Main two-pane card ───────────────────────────────────────────── */}
        <SectionCard
          title="Correspondence"
          icon={<MessageSquare size={13}/>}
          accent={N}
          noPad
          action={
            totalUnread > 0 ? (
              <span style={{
                fontSize: "0.62rem", fontWeight: 800, color: "white",
                background: WARN, padding: "2px 8px", borderRadius: 10,
                letterSpacing: "0.04em",
              }}>
                {totalUnread} UNREAD
              </span>
            ) : null
          }>

          <div className="flex flex-col lg:flex-row" style={{ minHeight: 560 }}>

            {/* ── Left: filters + thread list ──────────────────────────────── */}
            <aside
              className="lg:flex-col lg:w-[340px] lg:shrink-0 lg:border-r border-b lg:border-b-0"
              style={{ borderColor: BDL, background: "#FAFBFD" }}>

              {/* Filters */}
              <div className="px-4 py-3" style={{ borderBottom: `1px solid ${BDL}`, background: "white" }}>
                {/* Search */}
                <div className="relative mb-2.5">
                  <Search size={12} color={TT}
                    style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }}/>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search subject or message body…"
                    style={{
                      width: "100%", boxSizing: "border-box",
                      padding: "7px 11px 7px 30px",
                      fontSize: "0.74rem",
                      border: `1px solid ${BDL}`,
                      borderRadius: 5,
                      background: "white", color: TD, outline: "none",
                      fontFamily: font,
                    }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = N; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = BDL; }}
                  />
                </div>

                {/* Channel multi-select */}
                <div className="mb-2.5">
                  <div className="flex items-center justify-between mb-1.5">
                    <span style={{
                      fontSize: "0.58rem", fontWeight: 800, color: TT,
                      textTransform: "uppercase", letterSpacing: "0.09em",
                    }}>
                      Channels
                    </span>
                    {channelFilters.size > 0 && (
                      <button
                        onClick={() => setChannelFilters(new Set())}
                        style={{
                          fontSize: "0.62rem", fontWeight: 700, color: N,
                          background: "none", border: "none", cursor: "pointer", padding: 0,
                        }}>
                        clear
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(Object.keys(CHANNEL_META) as Channel[]).map(c => {
                      const m = CHANNEL_META[c];
                      const active = channelFilters.has(c);
                      return (
                        <button
                          key={c}
                          onClick={() => toggleChannel(c)}
                          aria-pressed={active}
                          className="inline-flex items-center gap-1 px-2 py-1 transition-all"
                          style={{
                            fontSize: "0.64rem", fontWeight: 700,
                            background: active ? m.bg : "white",
                            color: active ? m.color : TM,
                            border: `1px solid ${active ? m.border : BDL}`,
                            borderRadius: 4,
                            cursor: "pointer",
                            fontFamily: font,
                          }}>
                          <span style={{ color: m.color, display: "inline-flex" }}>{m.icon}</span>
                          {m.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Direction selector */}
                <div>
                  <div style={{
                    fontSize: "0.58rem", fontWeight: 800, color: TT,
                    textTransform: "uppercase", letterSpacing: "0.09em",
                    marginBottom: 6,
                  }}>
                    Direction
                  </div>
                  <div className="flex items-center gap-1">
                    {(["all", "inbound", "outbound"] as const).map(d => {
                      const active = directionFilter === d;
                      const meta = d === "all" ? null : DIRECTION_META[d];
                      return (
                        <button
                          key={d}
                          onClick={() => setDirectionFilter(d)}
                          aria-pressed={active}
                          className="flex items-center gap-1 px-2.5 py-1 transition-all"
                          style={{
                            flex: 1,
                            fontSize: "0.66rem", fontWeight: 700,
                            background: active ? (meta?.bg ?? `${N}10`) : "white",
                            color: active ? (meta?.color ?? N) : TM,
                            border: `1px solid ${active ? (meta?.color ?? N) : BDL}`,
                            borderRadius: 4,
                            cursor: "pointer",
                            fontFamily: font,
                            justifyContent: "center",
                          }}>
                          {meta && <span style={{ color: meta.color, display: "inline-flex" }}>{meta.icon}</span>}
                          {d === "all" ? "All" : meta!.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {activeFilterCount > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="flex items-center gap-1 mt-2.5"
                    style={{
                      fontSize: "0.66rem", color: TM, fontWeight: 700,
                      background: "none", border: "none", cursor: "pointer", padding: 0,
                    }}>
                    <Filter size={11}/> Clear {activeFilterCount} filter{activeFilterCount !== 1 ? "s" : ""}
                  </button>
                )}
              </div>

              {/* Thread list */}
              <div className="flex-1 overflow-y-auto" style={{ maxHeight: 560 }}>
                {filteredThreads.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 px-4 text-center"
                    style={{ color: TT }}>
                    <Filter size={26}/>
                    <p style={{ fontSize: "0.78rem", fontWeight: 600, color: TM, marginTop: 8 }}>
                      No threads match your filters
                    </p>
                    <button onClick={clearAllFilters}
                      style={{
                        fontSize: "0.72rem", color: N, fontWeight: 700, marginTop: 6,
                        background: "none", border: "none", cursor: "pointer",
                      }}>
                      Clear filters
                    </button>
                  </div>
                ) : (
                  filteredThreads.map(t => (
                    <ThreadRow
                      key={t.id}
                      thread={t}
                      isSelected={selectedThreadId === t.id}
                      onClick={() => handleSelectThread(t.id)}
                    />
                  ))
                )}
              </div>
            </aside>

            {/* ── Right: timeline + composer ────────────────────────────────── */}
            <main className="flex-1 min-w-0 flex flex-col" style={{ background: "white" }}>
              {!selectedThread ? (
                <EmptyState/>
              ) : (
                <ThreadView
                  thread={selectedThread}
                  composerText={composerText}
                  onComposerTextChange={setComposerText}
                  composerChannel={composerChannel}
                  onComposerChannelChange={setComposerChannel}
                  onSend={sendMessage}
                />
              )}
            </main>
          </div>
        </SectionCard>
      </div>

      {/* Toast / snackbar */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed flex items-center gap-2 px-4 py-2.5"
          style={{
            bottom: 24, right: 24, zIndex: 100,
            background: toast.tone === "error" ? BAD : toast.tone === "info" ? N : OK,
            color: "white",
            borderRadius: 8,
            boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
            fontSize: "0.80rem", fontWeight: 600, fontFamily: font,
          }}>
          {toast.tone === "error" ? <AlertTriangle size={14}/> : <CheckCircle2 size={14}/>}
          <span>{toast.msg}</span>
        </div>
      )}
    </>
  );
}

// ─── CounterTile (small KPI for the top counters bar) ─────────────────────────
function CounterTile({ label, value, sub, color, icon }: {
  label: string; value: string; sub: string; color: string; icon: React.ReactNode;
}) {
  return (
    <div style={{
      background: "white",
      border: `1px solid ${BDL}`,
      borderRadius: 8,
      padding: "12px 14px",
      boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
      position: "relative",
      overflow: "hidden",
    }}>
      <span aria-hidden style={{
        position: "absolute", inset: "0 0 auto 0", height: 3,
        background: `linear-gradient(90deg, ${color}, ${color}66)`,
      }}/>
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center justify-center"
          style={{ width: 26, height: 26, background: `${color}12`, color, borderRadius: 6 }}>
          {icon}
        </span>
        <span style={{
          fontSize: "0.58rem", fontWeight: 800, color: TT,
          textTransform: "uppercase", letterSpacing: "0.09em",
        }}>{label}</span>
      </div>
      <div className="mt-1.5">
        <span style={{ fontSize: "1.30rem", fontWeight: 800, color: TD, lineHeight: 1.1 }}>{value}</span>
      </div>
      <div className="mt-1" style={{ fontSize: "0.66rem", color: TT }}>{sub}</div>
    </div>
  );
}

// ─── ThreadRow ────────────────────────────────────────────────────────────────
function ThreadRow({ thread, isSelected, onClick }: {
  thread: CorrespondenceThread; isSelected: boolean; onClick: () => void;
}) {
  const m         = CHANNEL_META[thread.channel];
  const lastMsg   = thread.messages[thread.messages.length - 1];
  const sender    = lastMsg.direction === "inbound" ? lastMsg.fromName : `You → ${lastMsg.toName}`;
  const senderRaw = lastMsg.direction === "inbound" ? lastMsg.fromName : "Maya Khanna";

  return (
    <button
      onClick={onClick}
      onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } }}
      aria-current={isSelected ? "true" : undefined}
      className="w-full text-left transition-all outline-none"
      style={{
        background: isSelected ? `${N}0D` : "transparent",
        borderLeft: `3px solid ${isSelected ? N : "transparent"}`,
        borderBottom: `1px solid ${BDL}`,
        padding: "10px 14px",
        cursor: "pointer",
        fontFamily: font,
      }}
      onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = "white"; }}
      onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = "transparent"; }}>
      <div className="flex items-start gap-2.5">
        {/* Avatar */}
        <span className="inline-flex items-center justify-center shrink-0"
          style={{
            width: 32, height: 32, borderRadius: "50%",
            background: `${m.color}15`, color: m.color,
            fontSize: "0.72rem", fontWeight: 800,
            letterSpacing: "0.02em",
          }}>
          {initialsOf(senderRaw)}
        </span>
        <div className="flex-1 min-w-0">
          {/* Sender row */}
          <div className="flex items-center justify-between gap-2">
            <span className="truncate" style={{
              fontSize: "0.78rem", fontWeight: thread.unreadCount > 0 ? 800 : 700,
              color: TD,
            }}>
              {sender}
            </span>
            <div className="flex items-center gap-1.5 shrink-0">
              <span style={{ fontSize: "0.60rem", color: TT, fontVariantNumeric: "tabular-nums" }}>
                {formatRelative(thread.lastActivityAt)}
              </span>
              {thread.unreadCount > 0 && (
                <span aria-label={`${thread.unreadCount} unread`} style={{
                  width: 8, height: 8, background: WARN,
                  borderRadius: "50%", display: "inline-block",
                }}/>
              )}
            </div>
          </div>
          {/* Subject */}
          <div className="truncate" style={{
            fontSize: "0.74rem", fontWeight: thread.unreadCount > 0 ? 700 : 600,
            color: TD, marginTop: 1,
          }}>
            {thread.subject}
          </div>
          {/* Preview */}
          <div style={{
            fontSize: "0.68rem", color: TT, marginTop: 2, lineHeight: 1.4,
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}>
            {truncate(lastMsg.body, 160)}
          </div>
          {/* Footer: channel badge + message count */}
          <div className="flex items-center gap-1.5 mt-2">
            <span className="inline-flex items-center gap-1"
              style={{
                fontSize: "0.58rem", fontWeight: 700, color: m.color,
                background: m.bg, border: `1px solid ${m.border}`,
                padding: "1px 6px", borderRadius: 3,
                letterSpacing: "0.04em",
              }}>
              {m.icon}
              {m.label}
            </span>
            <span style={{ fontSize: "0.58rem", color: TT, fontWeight: 700 }}>
              {thread.messages.length} msg{thread.messages.length !== 1 ? "s" : ""}
            </span>
            {lastMsg.attachments && lastMsg.attachments.length > 0 && (
              <span className="inline-flex items-center gap-0.5" style={{ fontSize: "0.58rem", color: TT, fontWeight: 700 }}>
                <Paperclip size={9}/>
                {lastMsg.attachments.length}
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

// ─── EmptyState ───────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 px-8 text-center"
      style={{ minHeight: 480, color: TT }}>
      <div className="inline-flex items-center justify-center"
        style={{
          width: 72, height: 72, borderRadius: "50%",
          background: `${N}0A`, color: `${N}80`,
          marginBottom: 16,
        }}>
        <MessageSquare size={32}/>
      </div>
      <h3 style={{ fontSize: "1.05rem", fontWeight: 800, color: TD, marginBottom: 6 }}>
        Select a conversation to read the thread
      </h3>
      <p style={{ fontSize: "0.80rem", color: TT, maxWidth: 360, lineHeight: 1.55 }}>
        All email, Slack, Teams, phone-call, and internal-note correspondence
        tied to this submission appears in the left pane. Click any thread to
        see its full timeline and reply.
      </p>
    </div>
  );
}

// ─── ThreadView (timeline + composer) ─────────────────────────────────────────
function ThreadView({
  thread, composerText, onComposerTextChange, composerChannel, onComposerChannelChange, onSend,
}: {
  thread: CorrespondenceThread;
  composerText: string;
  onComposerTextChange: (v: string) => void;
  composerChannel: Channel;
  onComposerChannelChange: (c: Channel) => void;
  onSend: () => void;
}) {
  const m = CHANNEL_META[thread.channel];
  const timelineRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on thread change OR new message
  useEffect(() => {
    if (timelineRef.current) {
      timelineRef.current.scrollTop = timelineRef.current.scrollHeight;
    }
  }, [thread.id, thread.messages.length]);

  return (
    <div className="flex flex-col flex-1 min-h-0">

      {/* Thread header */}
      <div className="flex items-center gap-3 px-5 py-3"
        style={{ borderBottom: `1px solid ${BDL}`, background: "white" }}>
        <span className="inline-flex items-center justify-center shrink-0"
          style={{ width: 32, height: 32, borderRadius: 8, background: m.bg, color: m.color }}>
          {m.icon}
        </span>
        <div className="flex-1 min-w-0">
          <h3 className="truncate" style={{
            fontSize: "0.92rem", fontWeight: 800, color: TD, lineHeight: 1.2,
          }}>
            {thread.subject}
          </h3>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span style={{
              fontSize: "0.60rem", fontWeight: 700, color: m.color,
              background: m.bg, border: `1px solid ${m.border}`,
              padding: "1px 7px", borderRadius: 3, letterSpacing: "0.04em",
            }}>
              {m.label}
            </span>
            <span style={{ fontSize: "0.68rem", color: TT }}>
              {thread.participants.join(" · ")}
            </span>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div ref={timelineRef}
        className="flex-1 overflow-y-auto px-5 py-4 space-y-4"
        style={{ background: "#FAFBFD", minHeight: 0 }}>
        {thread.messages.map((msg, idx) => (
          <MessageBubble key={msg.id} message={msg}
            showDate={idx === 0 || msg.sentAt.slice(0, 10) !== thread.messages[idx - 1].sentAt.slice(0, 10)}/>
        ))}
      </div>

      {/* Composer */}
      <div className="px-5 py-3"
        style={{ borderTop: `1px solid ${BDL}`, background: "white" }}>
        {/* Channel selector */}
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span style={{
            fontSize: "0.58rem", fontWeight: 800, color: TT,
            textTransform: "uppercase", letterSpacing: "0.09em",
          }}>
            Reply via
          </span>
          <div className="flex items-center gap-1 flex-wrap">
            {(Object.keys(CHANNEL_META) as Channel[]).map(c => {
              const cm = CHANNEL_META[c];
              const active = composerChannel === c;
              return (
                <button
                  key={c}
                  onClick={() => onComposerChannelChange(c)}
                  aria-pressed={active}
                  className="inline-flex items-center gap-1 px-2 py-1 transition-all"
                  style={{
                    fontSize: "0.64rem", fontWeight: 700,
                    background: active ? cm.bg : "white",
                    color: active ? cm.color : TM,
                    border: `1px solid ${active ? cm.border : BDL}`,
                    borderRadius: 4,
                    cursor: "pointer",
                    fontFamily: font,
                  }}>
                  <span style={{ color: cm.color, display: "inline-flex" }}>{cm.icon}</span>
                  {cm.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-end gap-2">
          <textarea
            value={composerText}
            onChange={(e) => onComposerTextChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                onSend();
              }
            }}
            placeholder={`Type your message via ${CHANNEL_META[composerChannel].label}…  (⌘/Ctrl+Enter to send)`}
            rows={2}
            style={{
              flex: 1, boxSizing: "border-box",
              padding: "9px 11px",
              fontSize: "0.80rem",
              border: `1px solid ${BDL}`,
              borderRadius: 6,
              background: "white", color: TD, outline: "none",
              fontFamily: font, resize: "vertical", minHeight: 60,
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = N; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = BDL; }}
          />
          <button
            onClick={onSend}
            disabled={!composerText.trim()}
            className="flex items-center gap-1.5 px-4 py-2.5 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: N, color: "white", borderRadius: 6,
              fontSize: "0.78rem", fontWeight: 700, border: "none",
              cursor: composerText.trim() ? "pointer" : "not-allowed",
              boxShadow: "0 2px 8px rgba(1,35,212,0.22)",
              fontFamily: font,
              alignSelf: "stretch",
            }}>
            <Send size={13}/>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MessageBubble (single message in the timeline) ───────────────────────────
function MessageBubble({ message, showDate }: { message: Message; showDate: boolean }) {
  const cm        = CHANNEL_META[message.channel];
  const dm        = DIRECTION_META[message.direction];
  const isOutbound = message.direction === "outbound";

  return (
    <div>
      {showDate && (
        <div className="flex items-center gap-2 my-3">
          <span style={{ flex: 1, height: 1, background: BDL }}/>
          <span style={{
            fontSize: "0.62rem", fontWeight: 700, color: TT,
            textTransform: "uppercase", letterSpacing: "0.08em",
          }}>
            {new Date(message.sentAt).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
          </span>
          <span style={{ flex: 1, height: 1, background: BDL }}/>
        </div>
      )}
      <div className={`flex items-start gap-2.5 ${isOutbound ? "flex-row-reverse" : ""}`}>
        {/* Avatar */}
        <span className="inline-flex items-center justify-center shrink-0"
          style={{
            width: 30, height: 30, borderRadius: "50%",
            background: `${cm.color}15`, color: cm.color,
            fontSize: "0.68rem", fontWeight: 800,
          }}>
          {initialsOf(message.fromName)}
        </span>
        {/* Bubble */}
        <div className="min-w-0" style={{ maxWidth: "84%", flex: 1 }}>
          {/* Header */}
          <div className={`flex items-center gap-2 mb-1 flex-wrap ${isOutbound ? "justify-end" : ""}`}>
            <span style={{ fontSize: "0.72rem", fontWeight: 700, color: TD }}>
              {message.fromName}
            </span>
            {message.fromEmail && (
              <span style={{ fontSize: "0.62rem", color: TT }}>
                {message.fromEmail}
              </span>
            )}
            <span style={{ fontSize: "0.60rem", color: TT }}>·</span>
            <span style={{ fontSize: "0.62rem", color: TT, fontVariantNumeric: "tabular-nums" }}>
              {formatFullDate(message.sentAt)}
            </span>
            <span className="inline-flex items-center gap-0.5"
              style={{
                fontSize: "0.55rem", fontWeight: 700, color: dm.color,
                background: dm.bg, padding: "1px 5px", borderRadius: 3,
                letterSpacing: "0.05em", textTransform: "uppercase",
              }}>
              {dm.icon}
              {dm.label}
            </span>
          </div>
          {/* Subject (if present and different from thread) */}
          {message.subject && (
            <div style={{
              fontSize: "0.74rem", fontWeight: 700, color: TM,
              marginBottom: 4, textAlign: isOutbound ? "right" : "left",
            }}>
              {message.subject}
            </div>
          )}
          {/* Body */}
          <div style={{
            background: isOutbound ? `${N}08` : "white",
            border: `1px solid ${isOutbound ? `${N}20` : BDL}`,
            borderRadius: 8,
            padding: "10px 12px",
            fontSize: "0.80rem",
            color: TD,
            lineHeight: 1.55,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}>
            {message.body}
          </div>
          {/* Attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div className={`flex flex-wrap gap-1.5 mt-1.5 ${isOutbound ? "justify-end" : ""}`}>
              {message.attachments.map((a, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 px-2 py-1"
                  style={{
                    background: "white",
                    border: `1px solid ${BDL}`,
                    borderRadius: 4,
                    fontSize: "0.66rem", color: TM, fontWeight: 600,
                  }}>
                  <Paperclip size={10} color={TT}/>
                  <span style={{ color: TD, fontWeight: 700 }}>{a.name}</span>
                  <span style={{ color: TT }}>{(a.sizeKB / 1024).toFixed(1)} MB</span>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
