import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import {
  Mail, Search, Paperclip, Star, RefreshCw,
  ChevronRight, X, Sparkles, FileText, Copy,
  AlertTriangle, CheckCircle, Clock, Building2,
  Users, Shield, Car, Wifi, Briefcase, ArrowRight,
  Download, Eye, MoreHorizontal, Inbox as InboxIcon,
  Send, Archive, Trash2, Filter,
  Plus, Loader2, Check, ExternalLink, Globe,
  BookOpen, ZapIcon,
} from "lucide-react";
import { AppShell } from "../components/AppShell";

// ── Design tokens ──────────────────────────────────────────────────────────────
const N    = "#0123D4";
const G    = "#C9A227";
const BDL  = "#DCE3EC";
const BD   = "#C4CDD8";
const TM   = "#4A5D6E";
const TT   = "#7A8FA3";
const font = "'Source Sans 3', system-ui, sans-serif";

// ── Mock data ──────────────────────────────────────────────────────────────────
interface Attachment { name: string; size: string; type: "pdf" | "xlsx" | "docx" | "img" }
interface Email {
  id: string;
  from: { name: string; company: string; email: string; initials: string; color: string };
  to: string;
  cc?: string;
  subject: string;
  preview: string;
  body: string;
  date: string;
  unread: boolean;
  flagged: boolean;
  folder: "inbox" | "sent" | "archive";
  tags: string[];
  attachments: Attachment[];
  extracted?: {
    institutionName: string; state: string; enrollment: number;
    coverageLines: string[]; effectiveDate: string; broker: string;
    annualPremiumEstimate?: string; institutionType?: string;
  };
  potentialDuplicates?: { id: string; name: string; match: number; reason: string; status: string }[];
}

const MOCK_EMAILS: Email[] = [
  {
    id: "e1",
    from: { name: "Marcus Webb", company: "Gallagher Education", email: "m.webb@gallagher.com", initials: "MW", color: "#7B2FBE" },
    to: "sarah.mitchell@ue.org",
    subject: "New Submission — Riverside Unified School District",
    preview: "Please find attached the completed ACORD application and 5-year loss runs for Riverside USD. They are looking for coverage effective July 1, 2026.",
    body: `Hi Sarah,\n\nHope you're doing well. I'm submitting a new account on behalf of Riverside Unified School District (RUSD) — one of California's larger K-12 districts.\n\nKey details:\n• Institution: Riverside Unified School District\n• Location: Riverside, CA\n• Enrollment: ~42,500 students across 54 campuses\n• Desired effective date: July 1, 2026\n• Coverage lines requested: General Liability ($2M/$5M), Property (RCV, TIV ~$890M), Cyber Liability ($3M), Commercial Auto (fleet of 187 buses)\n\nAttached you'll find:\n1. Completed ACORD 125/126 application\n2. 5-year certified loss runs (2021–2025)\n3. Property schedule with building values\n\nRUSD has been with their current carrier for 6 years. They're going to market primarily on pricing — their current expiring premium is ~$2.1M across all lines. They're a strong account with a solid safety culture and no major losses.\n\nPlease let me know if you need anything additional to begin the underwriting review.\n\nBest,\nMarcus`,
    date: "2026-04-27T09:14:00",
    unread: true, flagged: true, folder: "inbox",
    tags: ["broker", "new-submission", "k12"],
    attachments: [
      { name: "Riverside_USD_ACORD_App.pdf", size: "2.4 MB", type: "pdf" },
      { name: "Loss_Runs_2021-2025.pdf", size: "1.1 MB", type: "pdf" },
      { name: "Property_Schedule.xlsx", size: "340 KB", type: "xlsx" },
    ],
    extracted: {
      institutionName: "Riverside Unified School District",
      state: "CA", enrollment: 42500,
      coverageLines: ["General Liability", "Property", "Cyber Liability", "Commercial Auto"],
      effectiveDate: "July 1, 2026", broker: "Gallagher Education",
      annualPremiumEstimate: "$2,100,000", institutionType: "K-12 Public School District",
    },
    potentialDuplicates: [
      { id: "SUB-7814", name: "Riverside USD — 2025 Renewal", match: 94, reason: "Same institution name & state", status: "Bound" },
      { id: "SUB-7802", name: "Riverside Unified — Cyber Only", match: 71, reason: "Partial name match, same broker", status: "Declined" },
    ],
  },
  {
    id: "e2",
    from: { name: "Priya Nair", company: "Lockton Companies", email: "p.nair@lockton.com", initials: "PN", color: "#1A7A4A" },
    to: "sarah.mitchell@ue.org",
    subject: "Charter School Submission — Horizon Academy Network (TX)",
    preview: "Attached please find the submission package for Horizon Academy Network, a growing charter network in Texas with 8 campuses and ~6,200 students.",
    body: `Dear Sarah,\n\nI'm reaching out with a new charter school submission for your consideration.\n\nAccount Overview:\n• Institution: Horizon Academy Network\n• Type: Charter School Network (8 campuses)\n• Location: Austin & San Antonio, TX\n• Enrollment: 6,200 students (growing — projecting 7,500 by 2027)\n• Years in operation: 5 years\n• Desired effective: September 1, 2026\n\nCoverage requested:\n• Educators Legal Liability (EPL) — $1M/$3M\n• General Liability — $1M/$3M\n• Cyber Liability — $1M (first time purchasing)\n• D&O / Management Liability — $2M\n\nNote: Horizon had one EPL claim in 2023 (wrongful termination, settled for $85K). Full details in the loss run attached. Their HR has since implemented a structured disciplinary process.\n\nThey're a motivated account. Let me know if you'd like to set up a call with the CFO.\n\nThanks,\nPriya`,
    date: "2026-04-26T16:42:00",
    unread: true, flagged: false, folder: "inbox",
    tags: ["broker", "charter", "new-submission"],
    attachments: [
      { name: "Horizon_Academy_Application.pdf", size: "1.8 MB", type: "pdf" },
      { name: "EPL_Loss_Run_2021-2025.pdf", size: "680 KB", type: "pdf" },
      { name: "Horizon_Financials_2025.pdf", size: "920 KB", type: "pdf" },
    ],
    extracted: {
      institutionName: "Horizon Academy Network",
      state: "TX", enrollment: 6200,
      coverageLines: ["Educators Legal Liability", "General Liability", "Cyber Liability", "D&O"],
      effectiveDate: "September 1, 2026", broker: "Lockton Companies",
      institutionType: "Charter School Network",
    },
    potentialDuplicates: [
      { id: "SUB-7788", name: "Horizon Academy — Austin Campus", match: 68, reason: "Similar name, same state", status: "Declined" },
    ],
  },
  {
    id: "e3",
    from: { name: "Derek Solano", company: "USI Insurance", email: "d.solano@usi.com", initials: "DS", color: "#B45309" },
    to: "sarah.mitchell@ue.org",
    subject: "Re: Quote Status — Austin ISD (SUB-7831)",
    preview: "Following up on the quote for Austin ISD. The district risk manager is asking for an update — they have a board meeting next week.",
    body: `Hi Sarah,\n\nJust following up on SUB-7831 (Austin ISD). The district's risk manager, Janet Flores, is asking for a status update — they have a board meeting on May 6th where they'll be discussing insurance renewals.\n\nThe expiring premium is $1.4M across GL, Property, and Auto. If you can have a quote by end of week, that would give us time to present options.\n\nAre there any outstanding items on your end? Happy to jump on a quick call if that helps.\n\nThanks,\nDerek`,
    date: "2026-04-25T11:20:00",
    unread: false, flagged: true, folder: "inbox",
    tags: ["broker", "follow-up", "quote"],
    attachments: [],
    potentialDuplicates: [],
  },
  {
    id: "e4",
    from: { name: "Amanda Osei", company: "Marsh McLennan", email: "a.osei@marsh.com", initials: "AO", color: "#0123D4" },
    to: "sarah.mitchell@ue.org",
    subject: "New Market Submission — Pacific Northwest University Consortium",
    preview: "We represent a consortium of 4 small liberal arts colleges in WA/OR seeking admitted market placement for their 2026-27 policy year.",
    body: `Hello Sarah,\n\nI'm reaching out on behalf of the Pacific Northwest University Consortium — a group of 4 small liberal arts colleges (combined enrollment ~9,800) seeking market placement for their 2026-27 policy year.\n\nMembers:\n1. Cascade College, Portland OR (2,100 students)\n2. Olympic University, Olympia WA (2,800 students)\n3. Rainier Liberal Arts, Tacoma WA (2,400 students)\n4. Evergreen Valley College, Eugene OR (2,500 students)\n\nRequested coverages:\n• Property (scheduled basis, TIV $340M)\n• General Liability\n• Educators Professional Liability\n• Cyber — $5M limit (all 4 institutions have had minor incidents)\n• Student Accident\n\nThis is a clean account — combined loss ratio under 40% over 5 years. Current carrier is non-renewing due to appetite change (not loss-driven).\n\nFull submissions for each entity attached.\n\nBest,\nAmanda`,
    date: "2026-04-24T14:05:00",
    unread: false, flagged: false, folder: "inbox",
    tags: ["broker", "higher-ed", "consortium", "new-submission"],
    attachments: [
      { name: "PNW_Consortium_Master_App.pdf", size: "4.1 MB", type: "pdf" },
      { name: "All_Entities_Loss_Runs.pdf", size: "2.3 MB", type: "pdf" },
      { name: "Property_Schedules_Combined.xlsx", size: "890 KB", type: "xlsx" },
      { name: "Cyber_Incident_Reports.pdf", size: "560 KB", type: "pdf" },
    ],
    extracted: {
      institutionName: "Pacific Northwest University Consortium",
      state: "WA/OR", enrollment: 9800,
      coverageLines: ["Property", "General Liability", "Educators Professional Liability", "Cyber", "Student Accident"],
      effectiveDate: "July 1, 2026", broker: "Marsh McLennan",
      institutionType: "Higher Education Consortium",
    },
    potentialDuplicates: [],
  },
  {
    id: "e5",
    from: { name: "Tom Beckett", company: "Brown & Riding", email: "t.beckett@bandr.com", initials: "TB", color: "#7B2FBE" },
    to: "sarah.mitchell@ue.org",
    subject: "Appetite Question — Tribal College, New Mexico",
    preview: "Quick question before I submit — does UE write tribal colleges? We have an interesting account in NM that's been non-renewed by 2 carriers.",
    body: `Hi Sarah,\n\nBefore I put together a full submission package, I wanted to do a quick appetite check.\n\nDo you write tribal colleges / tribally controlled community colleges? Specifically:\n\n• Institution: Diné College (tribally controlled, Navajo Nation)\n• Location: Tsaile, AZ / Shiprock, NM\n• Enrollment: ~1,400 students\n• Type: 2-year community college\n• Unique exposures: Located on tribal lands, some sovereign immunity considerations\n\nThey've been non-renewed by their last 2 carriers — one due to a property cat exposure (wildfire zone), the other due to a management dispute (resolved).\n\nIf you have appetite here, I'll put together a full submission. If not, totally understood.\n\nThanks for the quick check,\nTom`,
    date: "2026-04-23T10:15:00",
    unread: false, flagged: false, folder: "inbox",
    tags: ["broker", "appetite", "tribal"],
    attachments: [
      { name: "Dine_College_Overview.pdf", size: "420 KB", type: "pdf" },
    ],
    potentialDuplicates: [],
  },
  {
    id: "e6",
    from: { name: "Notifications", company: "UE Platform", email: "noreply@ue.org", initials: "UE", color: N },
    to: "sarah.mitchell@ue.org",
    subject: "Automated Alert: SUB-7835 Missing Documents — 72hr Deadline",
    preview: "The Safety Questionnaire for SUB-7835 (Seattle Public Schools) remains outstanding. Broker has not responded in 5 days.",
    body: `This is an automated notification from the UE Underwriting Platform.\n\nSubmission: SUB-7835 — Seattle Public Schools\nAssigned UW: Sarah Mitchell\nStatus: In Review — BLOCKED\n\nMissing Item: Safety & Risk Management Questionnaire\nFirst requested: April 20, 2026\nBroker: Kevin Lin, Alliant Insurance\nBroker email: k.lin@alliant.com\n\nThe 72-hour deadline for document receipt expires: April 30, 2026 at 5:00 PM PT\n\nIf the document is not received by the deadline, the submission will be automatically moved to Referred status for escalation.\n\nAction required: Follow up with broker or escalate internally.\n\nThis is an automated message — do not reply.`,
    date: "2026-04-23T08:00:00",
    unread: false, flagged: false, folder: "inbox",
    tags: ["automated", "alert"],
    attachments: [],
    potentialDuplicates: [],
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────────
function formatDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diffDays === 0) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return d.toLocaleDateString([], { weekday: "short" });
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

function AttachIcon({ type }: { type: Attachment["type"] }) {
  const colors: Record<string, string> = { pdf: "#B91C1C", xlsx: "#1A7A4A", docx: "#0123D4", img: "#B45309" };
  return (
    <div style={{
      width: 28, height: 28, background: `${colors[type] ?? TT}15`,
      border: `1px solid ${colors[type] ?? TT}30`,
      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
    }}>
      <FileText size={13} color={colors[type] ?? TT} />
    </div>
  );
}

type AIPanel = "none" | "create" | "parse" | "duplicates";

// ── Main Inbox page ────────────────────────────────────────────────────────────
export function Inbox() {
  const navigate = useNavigate();
  const [selected, setSelected]       = useState<Email>(MOCK_EMAILS[0]);
  const [search, setSearch]           = useState("");
  const [folder, setFolder]           = useState<"inbox" | "sent" | "archive">("inbox");
  const [activePanel, setActivePanel] = useState<AIPanel>("none");
  const [aiLoading, setAiLoading]     = useState<AIPanel>("none");
  const [aiDone, setAiDone]           = useState<Set<AIPanel>>(new Set());
  const [emails, setEmails]           = useState(MOCK_EMAILS);

  const filtered = useMemo(() =>
    emails.filter(e =>
      e.folder === folder &&
      (search === "" || e.subject.toLowerCase().includes(search.toLowerCase()) ||
        e.from.name.toLowerCase().includes(search.toLowerCase()) ||
        e.from.company.toLowerCase().includes(search.toLowerCase()))
    ),
    [emails, folder, search]
  );

  const unreadCount = emails.filter(e => e.folder === "inbox" && e.unread).length;

  // Mark as read when opened
  const openEmail = (email: Email) => {
    setSelected(email);
    setActivePanel("none");
    setAiDone(new Set());
    if (email.unread) {
      setEmails(prev => prev.map(e => e.id === email.id ? { ...e, unread: false } : e));
    }
  };

  // Toggle flag
  const toggleFlag = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEmails(prev => prev.map(em => em.id === id ? { ...em, flagged: !em.flagged } : em));
  };

  // Simulate AI action
  const triggerAI = (panel: AIPanel) => {
    if (activePanel === panel) { setActivePanel("none"); return; }
    setAiLoading(panel);
    setActivePanel("none");
    setTimeout(() => {
      setAiLoading("none");
      setActivePanel(panel);
      setAiDone(prev => new Set(prev).add(panel));
    }, 1400);
  };

  const coverageIcon = (c: string) => {
    if (c.includes("Liability")) return <Shield size={11} />;
    if (c.includes("Property")) return <Building2 size={11} />;
    if (c.includes("Cyber")) return <Wifi size={11} />;
    if (c.includes("Auto")) return <Car size={11} />;
    if (c.includes("EPL") || c.includes("Educators")) return <BookOpen size={11} />;
    if (c.includes("D&O")) return <Briefcase size={11} />;
    return <Shield size={11} />;
  };

  const FOLDERS = [
    { id: "inbox" as const, label: "Inbox", icon: InboxIcon, count: unreadCount },
    { id: "sent"  as const, label: "Sent",  icon: Send,    count: 0 },
    { id: "archive" as const, label: "Archive", icon: Archive, count: 0 },
  ];

  return (
    <AppShell activePage="inbox" search="" onSearchChange={() => {}}>
      {/* ── Three-column email layout ──────────────────────────────────────── */}
      <div style={{ display: "flex", height: "100%", background: "#EEF1F6", fontFamily: font, overflow: "hidden" }}>

        {/* ── Col 1: Folder + Email list (320px) ──────────────────────────── */}
        <div style={{
          width: 320, minWidth: 300, flexShrink: 0,
          display: "flex", flexDirection: "column",
          background: "white", borderRight: `1px solid ${BDL}`, height: "100%", overflow: "hidden",
        }}>
          {/* List header */}
          <div style={{ padding: "14px 16px 10px", borderBottom: `1px solid ${BDL}`, flexShrink: 0, background: "white" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontSize: "0.80rem", fontWeight: 800, color: "#1A2530", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Inbox
              </span>
              <div style={{ display: "flex", gap: 4 }}>
                <button style={{ width: 26, height: 26, border: `1px solid ${BDL}`, background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 6 }}>
                  <RefreshCw size={12} color={TT} />
                </button>
                <button style={{ width: 26, height: 26, border: `1px solid ${BDL}`, background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 6 }}>
                  <Filter size={12} color={TT} />
                </button>
              </div>
            </div>

            {/* Folder tabs */}
            <div style={{ display: "flex", gap: 2, marginBottom: 10 }}>
              {FOLDERS.map(f => (
                <button key={f.id} onClick={() => setFolder(f.id)}
                  style={{
                    flex: 1, padding: "5px 0", fontSize: "0.66rem", fontWeight: 700, cursor: "pointer",
                    background: folder === f.id ? N : "transparent",
                    color: folder === f.id ? "white" : TM,
                    border: `1px solid ${folder === f.id ? N : BDL}`,
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
                    borderRadius: 6,
                  }}>
                  <f.icon size={10} />
                  {f.label}
                  {f.count > 0 && (
                    <span style={{
                      background: folder === f.id ? "rgba(255,255,255,0.3)" : N,
                      color: "white", fontSize: "0.55rem", fontWeight: 800,
                      borderRadius: 20, padding: "1px 5px", minWidth: 16, textAlign: "center",
                    }}>{f.count}</span>
                  )}
                </button>
              ))}
            </div>

            {/* Search */}
            <div style={{ position: "relative" }}>
              <Search size={12} color={TT} style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)" }} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search emails…"
                style={{
                  width: "100%", paddingLeft: 28, paddingRight: 10, paddingTop: 7, paddingBottom: 7,
                  border: `1px solid ${BDL}`, fontSize: "0.74rem", color: "#1A2530",
                  background: "#F4F6FA", outline: "none", fontFamily: font,
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>

          {/* Email list */}
          <div style={{ flex: 1, overflowY: "auto" }}>
            {filtered.length === 0 && (
              <div style={{ padding: 24, textAlign: "center" }}>
                <Mail size={28} color={BD} style={{ margin: "0 auto 8px" }} />
                <p style={{ fontSize: "0.74rem", color: TT }}>No emails found</p>
              </div>
            )}
            {filtered.map(email => (
              <div
                key={email.id}
                onClick={() => openEmail(email)}
                style={{
                  padding: "12px 14px",
                  borderBottom: `1px solid ${BDL}`,
                  cursor: "pointer",
                  background: selected.id === email.id ? `${N}08` : email.unread ? "#FAFBFF" : "white",
                  borderLeft: selected.id === email.id ? `3px solid ${N}` : `3px solid transparent`,
                  transition: "background 0.12s",
                  position: "relative",
                }}
              >
                {/* Unread dot */}
                {email.unread && (
                  <div style={{
                    position: "absolute", top: 14, left: 5,
                    width: 6, height: 6, borderRadius: "50%", background: N,
                  }} />
                )}

                <div style={{ display: "flex", gap: 9, alignItems: "flex-start" }}>
                  {/* Avatar */}
                  <div style={{
                    width: 32, height: 32, background: email.from.color,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0, fontSize: "0.60rem", fontWeight: 800, color: "white",
                  }}>
                    {email.from.initials}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Row 1: name + date + flag */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 1 }}>
                      <span style={{ fontSize: "0.74rem", fontWeight: email.unread ? 700 : 600, color: "#1A2530", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 150 }}>
                        {email.from.name}
                      </span>
                      <div style={{ display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
                        <span style={{ fontSize: "0.60rem", color: TT }}>{formatDate(email.date)}</span>
                        <button onClick={e => toggleFlag(email.id, e)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, lineHeight: 1, borderRadius: 6 }}>
                          <Star size={11} fill={email.flagged ? G : "none"} color={email.flagged ? G : BD} />
                        </button>
                      </div>
                    </div>

                    {/* Company */}
                    <div style={{ fontSize: "0.62rem", color: TT, marginBottom: 3 }}>{email.from.company}</div>

                    {/* Subject */}
                    <div style={{ fontSize: "0.71rem", fontWeight: email.unread ? 700 : 500, color: email.unread ? "#1A2530" : TM, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 3 }}>
                      {email.subject}
                    </div>

                    {/* Preview */}
                    <div style={{ fontSize: "0.63rem", color: TT, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", lineHeight: 1.45 }}>
                      {email.preview}
                    </div>

                    {/* Footer: tags + attachment */}
                    <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 5 }}>
                      {email.attachments.length > 0 && (
                        <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: "0.58rem", color: TT }}>
                          <Paperclip size={9} /> {email.attachments.length}
                        </span>
                      )}
                      {email.tags.filter(t => t !== "broker").slice(0, 2).map(tag => (
                        <span key={tag} style={{
                          fontSize: "0.55rem", fontWeight: 700, padding: "1px 5px",
                          background: tag === "new-submission" ? `${N}12` : tag === "follow-up" ? "#B4530912" : "#F0F3F8",
                          color: tag === "new-submission" ? N : tag === "follow-up" ? "#B45309" : TT,
                          border: `1px solid ${tag === "new-submission" ? `${N}30` : tag === "follow-up" ? "#B4530930" : BDL}`,
                          textTransform: "uppercase", letterSpacing: "0.05em",
                        }}>{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Col 2: Email viewer ──────────────────────────────────────────── */}
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", height: "100%", overflow: "hidden", background: "#F4F6FA" }}>

          {/* Email viewer header */}
          <div style={{
            background: "white", borderBottom: `1px solid ${BDL}`, flexShrink: 0,
            padding: "14px 20px", borderTop: `3px solid ${N}`,
          }}>
            {/* Subject */}
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 10 }}>
              <h2 style={{ fontSize: "0.94rem", fontWeight: 800, color: "#1A2530", lineHeight: 1.35, flex: 1 }}>
                {selected.subject}
              </h2>
              <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                <button style={{ width: 28, height: 28, border: `1px solid ${BDL}`, background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 6 }}>
                  <Archive size={13} color={TT} />
                </button>
                <button style={{ width: 28, height: 28, border: `1px solid ${BDL}`, background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 6 }}>
                  <Trash2 size={13} color={TT} />
                </button>
                <button style={{ width: 28, height: 28, border: `1px solid ${BDL}`, background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 6 }}>
                  <MoreHorizontal size={13} color={TT} />
                </button>
              </div>
            </div>

            {/* From / To */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <div style={{
                width: 34, height: 34, background: selected.from.color, flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "0.62rem", fontWeight: 800, color: "white",
              }}>
                {selected.from.initials}
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#1A2530" }}>{selected.from.name}</span>
                  <span style={{ fontSize: "0.64rem", color: TT }}>·</span>
                  <span style={{ fontSize: "0.64rem", color: TT }}>{selected.from.company}</span>
                </div>
                <div style={{ fontSize: "0.62rem", color: TT }}>
                  {selected.from.email} → {selected.to}
                </div>
              </div>
              <div style={{ marginLeft: "auto", fontSize: "0.63rem", color: TT }}>
                {new Date(selected.date).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}
              </div>
            </div>

            {/* Attachments */}
            {selected.attachments.length > 0 && (
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
                {selected.attachments.map((att, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "5px 10px 5px 7px",
                    border: `1px solid ${BDL}`, background: "#F8FAFC", cursor: "pointer",
                  }}>
                    <AttachIcon type={att.type} />
                    <div>
                      <div style={{ fontSize: "0.66rem", fontWeight: 700, color: "#1A2530" }}>{att.name}</div>
                      <div style={{ fontSize: "0.58rem", color: TT }}>{att.size}</div>
                    </div>
                    <Download size={11} color={TT} style={{ marginLeft: 4 }} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── AI Action Toolbar ────────────────────────────────────────────── */}
          <div style={{
            background: "white", borderBottom: `1px solid ${BDL}`, padding: "10px 20px",
            display: "flex", alignItems: "center", gap: 8, flexShrink: 0,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5, marginRight: 4 }}>
              <Sparkles size={12} color={G} />
              <span style={{ fontSize: "0.62rem", fontWeight: 800, color: TM, textTransform: "uppercase", letterSpacing: "0.07em" }}>
                AI Actions
              </span>
            </div>

            {/* Create Submission */}
            <AIActionButton
              icon={<Plus size={13} />}
              label="Create Submission"
              color={N}
              active={activePanel === "create"}
              loading={aiLoading === "create"}
              done={aiDone.has("create")}
              disabled={!selected.extracted}
              onClick={() => triggerAI("create")}
              tooltip={!selected.extracted ? "No structured data extractable from this email" : undefined}
            />

            {/* Parse Attachments */}
            <AIActionButton
              icon={<FileText size={13} />}
              label="Parse Attachments"
              color="#7B2FBE"
              active={activePanel === "parse"}
              loading={aiLoading === "parse"}
              done={aiDone.has("parse")}
              disabled={selected.attachments.length === 0}
              onClick={() => triggerAI("parse")}
              tooltip={selected.attachments.length === 0 ? "No attachments in this email" : undefined}
            />

            {/* Check Duplicates */}
            <AIActionButton
              icon={<Copy size={13} />}
              label="Check Duplicates"
              color="#1A7A4A"
              active={activePanel === "duplicates"}
              loading={aiLoading === "duplicates"}
              done={aiDone.has("duplicates")}
              disabled={false}
              onClick={() => triggerAI("duplicates")}
            />

            {activePanel !== "none" && (
              <button
                onClick={() => setActivePanel("none")}
                style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 4, fontSize: "0.64rem", color: TT, background: "none", border: "none", cursor: "pointer", borderRadius: 6 }}>
                <X size={11} /> Close panel
              </button>
            )}
          </div>

          {/* ── AI Result Panel ──────────────────────────────────────────────── */}
          {(activePanel !== "none" || aiLoading !== "none") && (
            <AIResultPanel
              panel={activePanel !== "none" ? activePanel : aiLoading}
              loading={aiLoading !== "none"}
              email={selected}
              onCreateSubmission={() => navigate("/submissions")}
              onClose={() => setActivePanel("none")}
            />
          )}

          {/* Email body */}
          <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>
            <div style={{
              background: "white", border: `1px solid ${BDL}`,
              padding: "24px 28px", fontSize: "0.82rem", color: "#1A2530",
              lineHeight: 1.75, whiteSpace: "pre-wrap", fontFamily: font,
            }}>
              {selected.body}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

// ── AI Action Button ───────────────────────────────────────────────────────────
function AIActionButton({
  icon, label, color, active, loading, done, disabled, onClick, tooltip,
}: {
  icon: React.ReactNode; label: string; color: string; active: boolean;
  loading: boolean; done: boolean; disabled: boolean; onClick: () => void; tooltip?: string;
}) {
  return (
    <div style={{ position: "relative" }} title={tooltip}>
      <button
        onClick={onClick}
        disabled={disabled || loading}
        style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "6px 13px",
          background: active ? color : "white",
          color: active ? "white" : disabled ? BD : color,
          border: `1.5px solid ${active ? color : disabled ? BDL : `${color}60`}`,
          cursor: disabled || loading ? "not-allowed" : "pointer",
          fontSize: "0.72rem", fontWeight: 700, fontFamily: font,
          opacity: disabled ? 0.5 : 1,
          transition: "all 0.15s",
          borderRadius: 6,
        }}
        onMouseEnter={e => { if (!disabled && !active && !loading) (e.currentTarget as HTMLElement).style.background = `${color}10`; }}
        onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = "white"; }}
      >
        {loading ? <Loader2 size={13} style={{ animation: "spin 0.8s linear infinite" }} /> : icon}
        {label}
        {done && !active && <Check size={11} color={color} />}
      </button>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ── AI Result Panel ────────────────────────────────────────────────────────────
function AIResultPanel({
  panel, loading, email, onCreateSubmission, onClose,
}: {
  panel: AIPanel; loading: boolean; email: Email;
  onCreateSubmission: () => void; onClose: () => void;
}) {
  if (loading) {
    return (
      <div style={{
        background: "#F8FAFC", borderBottom: `1px solid ${BDL}`,
        padding: "18px 24px", display: "flex", alignItems: "center", gap: 12, flexShrink: 0,
      }}>
        <Loader2 size={16} color={N} style={{ animation: "spin 0.8s linear infinite" }} />
        <div>
          <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#1A2530" }}>
            {panel === "create" ? "Extracting submission data…" : panel === "parse" ? "Parsing attachments with OCR…" : "Scanning submission database…"}
          </div>
          <div style={{ fontSize: "0.63rem", color: TT, marginTop: 2 }}>UE Intelligence is analyzing this email</div>
        </div>
      </div>
    );
  }

  if (panel === "create") return <CreateSubmissionPanel email={email} onCreate={onCreateSubmission} onClose={onClose} />;
  if (panel === "parse") return <ParseAttachmentsPanel email={email} onClose={onClose} />;
  if (panel === "duplicates") return <CheckDuplicatesPanel email={email} onClose={onClose} />;
  return null;
}

// ── Create Submission Panel ────────────────────────────────────────────────────
function CreateSubmissionPanel({ email, onCreate, onClose }: { email: Email; onCreate: () => void; onClose: () => void }) {
  const ex = email.extracted;
  if (!ex) return null;

  const fields = [
    { label: "Institution Name", value: ex.institutionName, conf: 98, icon: <Building2 size={11} /> },
    { label: "Institution Type", value: ex.institutionType ?? "K-12 Public", conf: 91, icon: <BookOpen size={11} /> },
    { label: "State / Territory", value: ex.state, conf: 99, icon: <Globe size={11} /> },
    { label: "Enrollment", value: ex.enrollment.toLocaleString() + " students", conf: 95, icon: <Users size={11} /> },
    { label: "Effective Date", value: ex.effectiveDate, conf: 97, icon: <Clock size={11} /> },
    { label: "Producing Broker", value: ex.broker, conf: 99, icon: <Briefcase size={11} /> },
    ...(ex.annualPremiumEstimate ? [{ label: "Expiring Premium", value: ex.annualPremiumEstimate, conf: 82, icon: <ZapIcon size={11} /> }] : []),
  ];

  const confColor = (c: number) => c >= 95 ? "#1A7A4A" : c >= 80 ? "#B45309" : "#B91C1C";
  const confBg    = (c: number) => c >= 95 ? "#E8F5EC" : c >= 80 ? "#FEF3C7" : "#FEE2E2";

  return (
    <div style={{ background: "#F0F7FF", borderBottom: `1px solid ${BDL}`, flexShrink: 0, borderLeft: `3px solid ${N}` }}>
      {/* Panel header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px 8px", borderBottom: `1px solid ${BDL}` }}>
        <div style={{ width: 22, height: 22, background: N, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Plus size={12} color="white" />
        </div>
        <div>
          <span style={{ fontSize: "0.72rem", fontWeight: 800, color: N, textTransform: "uppercase", letterSpacing: "0.06em" }}>Create Submission</span>
          <span style={{ fontSize: "0.62rem", color: TT, marginLeft: 8 }}>· AI extracted {fields.length} fields with high confidence</span>
        </div>
        <button onClick={onClose} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: TT, borderRadius: 6 }}>
          <X size={13} />
        </button>
      </div>

      <div style={{ padding: "12px 18px 14px" }}>
        {/* Coverage lines */}
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: "0.60rem", fontWeight: 700, color: TT, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 5 }}>
            Coverage Lines Detected
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {ex.coverageLines.map(c => (
              <span key={c} style={{
                display: "flex", alignItems: "center", gap: 4,
                padding: "3px 9px", fontSize: "0.65rem", fontWeight: 600,
                background: `${N}10`, color: N, border: `1px solid ${N}30`,
              }}>
                {c}
              </span>
            ))}
          </div>
        </div>

        {/* Extracted fields grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 6, marginBottom: 12 }}>
          {fields.map(f => (
            <div key={f.label} style={{
              background: "white", border: `1px solid ${BDL}`,
              padding: "7px 10px", display: "flex", flexDirection: "column", gap: 3,
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 4, color: TT }}>
                  {f.icon}
                  <span style={{ fontSize: "0.59rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>{f.label}</span>
                </div>
                <span style={{
                  fontSize: "0.57rem", fontWeight: 800, padding: "1px 5px",
                  background: confBg(f.conf), color: confColor(f.conf),
                }}>{f.conf}%</span>
              </div>
              <div style={{ fontSize: "0.74rem", fontWeight: 700, color: "#1A2530" }}>{f.value}</div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            onClick={onCreate}
            style={{
              display: "flex", alignItems: "center", gap: 6, padding: "8px 18px",
              background: N, color: "white", border: "none", cursor: "pointer",
              fontSize: "0.75rem", fontWeight: 700, fontFamily: font,
              borderRadius: 6,
            }}>
            <Plus size={14} /> Create Submission
            <ArrowRight size={13} />
          </button>
          <button style={{
            padding: "8px 14px", background: "white", border: `1px solid ${BDL}`,
            cursor: "pointer", fontSize: "0.72rem", color: TM, fontFamily: font,
            borderRadius: 6,
          }}>
            Edit Fields First
          </button>
          <span style={{ fontSize: "0.62rem", color: TT, marginLeft: 4 }}>
            Submission will be pre-populated with extracted data
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Parse Attachments Panel ────────────────────────────────────────────────────
function ParseAttachmentsPanel({ email, onClose }: { email: Email; onClose: () => void }) {
  const [selected, setSelected] = useState(0);

  const PARSED = [
    {
      name: email.attachments[0]?.name ?? "Document",
      type: "ACORD Application",
      color: "#B91C1C",
      fields: [
        { label: "Named Insured", value: email.extracted?.institutionName ?? "—" },
        { label: "Mailing Address", value: "3380 14th St, Riverside CA 92501" },
        { label: "Website", value: "www.riversideunified.org" },
        { label: "FEIN", value: "95-6001602" },
        { label: "Entity Type", value: "Public School District" },
        { label: "Annual Revenue", value: "$1.2B (operating budget)" },
        { label: "Full-Time Employees", value: "5,400" },
        { label: "Part-Time Employees", value: "620" },
        { label: "Desired Eff. Date", value: "07/01/2026" },
        { label: "Prior Carrier", value: "Travelers Companies" },
      ],
    },
    {
      name: email.attachments[1]?.name ?? "Loss Runs",
      type: "Loss Run Report",
      color: "#B91C1C",
      fields: [
        { label: "Policy Years", value: "2021–2025 (5 years)" },
        { label: "2025 Losses", value: "$142,000 (3 claims)" },
        { label: "2024 Losses", value: "$87,500 (2 claims)" },
        { label: "2023 Losses", value: "$310,000 (1 claim — slip/fall)" },
        { label: "2022 Losses", value: "$44,200 (2 claims)" },
        { label: "2021 Losses", value: "$0 (no losses)" },
        { label: "5-Yr Total Incurred", value: "$583,700" },
        { label: "5-Yr Loss Ratio", value: "~27% (favorable)" },
        { label: "Open Claims", value: "0" },
        { label: "Largest Single Loss", value: "$310,000 · 2023 GL" },
      ],
    },
    {
      name: email.attachments[2]?.name ?? "Property Schedule",
      type: "Property Schedule",
      color: "#1A7A4A",
      fields: [
        { label: "# of Locations", value: "54 campuses" },
        { label: "Total Insured Value", value: "$892,400,000" },
        { label: "Largest Single Location", value: "Poly High School — $41M" },
        { label: "Construction Type", value: "Mix: Frame, Masonry, Sprinklered" },
        { label: "Year Built Range", value: "1952 – 2019" },
        { label: "CAT Zone", value: "Earthquake Zone 4 (CA)" },
        { label: "Roof Update", value: "18 of 54 roofs updated post-2015" },
        { label: "Sprinkler Coverage", value: "62% of buildings" },
        { label: "Security", value: "Monitored alarm, 40% with CCTV" },
        { label: "Contents / BPP", value: "$68,500,000 aggregate" },
      ],
    },
  ];

  const current = PARSED[selected] ?? PARSED[0];

  return (
    <div style={{ background: "#F9F0FF", borderBottom: `1px solid ${BDL}`, flexShrink: 0, borderLeft: "3px solid #7B2FBE", maxHeight: 300, display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px 8px", borderBottom: `1px solid ${BDL}`, flexShrink: 0 }}>
        <div style={{ width: 22, height: 22, background: "#7B2FBE", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <FileText size={12} color="white" />
        </div>
        <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "#7B2FBE", textTransform: "uppercase", letterSpacing: "0.06em" }}>Parse Attachments</span>
        <span style={{ fontSize: "0.62rem", color: TT, marginLeft: 4 }}>· {email.attachments.length} documents processed via OCR</span>
        <button onClick={onClose} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: TT, borderRadius: 6 }}>
          <X size={13} />
        </button>
      </div>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Doc tabs */}
        <div style={{ width: 180, flexShrink: 0, borderRight: `1px solid ${BDL}`, background: "white", overflowY: "auto" }}>
          {PARSED.map((doc, i) => (
            <button key={i} onClick={() => setSelected(i)}
              style={{
                width: "100%", padding: "10px 12px", textAlign: "left", cursor: "pointer",
                background: selected === i ? "#7B2FBE10" : "transparent",
                borderLeft: `3px solid ${selected === i ? "#7B2FBE" : "transparent"}`,
                border: "none", borderBottom: `1px solid ${BDL}`, fontFamily: font,
                borderRadius: 6,
              }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                <FileText size={11} color={doc.color} />
                <span style={{ fontSize: "0.62rem", fontWeight: 700, color: "#7B2FBE", textTransform: "uppercase", letterSpacing: "0.04em" }}>{doc.type}</span>
              </div>
              <div style={{ fontSize: "0.63rem", color: TM, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{doc.name}</div>
            </button>
          ))}
        </div>

        {/* Parsed fields */}
        <div style={{ flex: 1, overflowY: "auto", padding: "10px 16px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 5 }}>
            {current.fields.map(f => (
              <div key={f.label} style={{ background: "white", border: `1px solid ${BDL}`, padding: "6px 10px" }}>
                <div style={{ fontSize: "0.59rem", fontWeight: 700, color: TT, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>{f.label}</div>
                <div style={{ fontSize: "0.72rem", fontWeight: 600, color: "#1A2530" }}>{f.value}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
            <button style={{
              display: "flex", alignItems: "center", gap: 5, padding: "6px 12px",
              background: "#7B2FBE", color: "white", border: "none", cursor: "pointer",
              fontSize: "0.68rem", fontWeight: 700, fontFamily: font,
              borderRadius: 6,
            }}>
              <Download size={11} /> Export Parsed Data
            </button>
            <button style={{
              display: "flex", alignItems: "center", gap: 5, padding: "6px 12px",
              background: "white", color: TM, border: `1px solid ${BDL}`, cursor: "pointer",
              fontSize: "0.68rem", fontFamily: font,
              borderRadius: 6,
            }}>
              <Eye size={11} /> View Raw Document
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Check Duplicates Panel ─────────────────────────────────────────────────────
function CheckDuplicatesPanel({ email, onClose }: { email: Email; onClose: () => void }) {
  const hasDuplicates = email.potentialDuplicates && email.potentialDuplicates.length > 0;

  const allChecks = [
    { label: "Institution name match", done: true, found: hasDuplicates },
    { label: "Broker + state combination", done: true, found: hasDuplicates },
    { label: "Effective date proximity (±90 days)", done: true, found: false },
    { label: "FEIN / EIN match", done: true, found: false },
    { label: "Coverage line overlap", done: true, found: hasDuplicates },
  ];

  const statusColor: Record<string, string> = { Bound: "#1A7A4A", Declined: "#B91C1C", "In Review": "#B45309", "Quote Issued": "#7B2FBE" };
  const statusBg: Record<string, string>    = { Bound: "#E8F5EC", Declined: "#FEE2E2", "In Review": "#FEF3C7", "Quote Issued": "#F3E8FF" };

  return (
    <div style={{ background: "#F0FBF5", borderBottom: `1px solid ${BDL}`, flexShrink: 0, borderLeft: "3px solid #1A7A4A" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px 8px", borderBottom: `1px solid ${BDL}` }}>
        <div style={{ width: 22, height: 22, background: "#1A7A4A", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Copy size={12} color="white" />
        </div>
        <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "#1A7A4A", textTransform: "uppercase", letterSpacing: "0.06em" }}>Check Duplicates</span>
        <span style={{ fontSize: "0.62rem", color: TT, marginLeft: 4 }}>
          · {hasDuplicates ? `${email.potentialDuplicates!.length} potential match${email.potentialDuplicates!.length > 1 ? "es" : ""} found` : "No duplicates found"}
        </span>
        <button onClick={onClose} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: TT, borderRadius: 6 }}>
          <X size={13} />
        </button>
      </div>

      <div style={{ display: "flex", gap: 0 }}>
        {/* Checks list */}
        <div style={{ width: 240, flexShrink: 0, borderRight: `1px solid ${BDL}`, padding: "10px 14px" }}>
          <div style={{ fontSize: "0.60rem", fontWeight: 700, color: TT, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
            Scan Results
          </div>
          {allChecks.map((c, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 7 }}>
              <div style={{
                width: 16, height: 16, flexShrink: 0,
                background: c.found ? "#FEE2E2" : "#E8F5EC",
                border: `1px solid ${c.found ? "#B91C1C30" : "#93C8A030"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {c.found
                  ? <AlertTriangle size={9} color="#B91C1C" />
                  : <CheckCircle size={9} color="#1A7A4A" />}
              </div>
              <span style={{ fontSize: "0.65rem", color: c.found ? "#B91C1C" : TM, fontWeight: c.found ? 700 : 400 }}>
                {c.label}
              </span>
            </div>
          ))}
        </div>

        {/* Matches */}
        <div style={{ flex: 1, padding: "10px 16px" }}>
          {!hasDuplicates ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "16px 0", gap: 6 }}>
              <CheckCircle size={28} color="#1A7A4A" />
              <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#1A7A4A" }}>No duplicates found</span>
              <span style={{ fontSize: "0.65rem", color: TT }}>This appears to be a new unique submission. Safe to proceed.</span>
            </div>
          ) : (
            <>
              <div style={{ fontSize: "0.60rem", fontWeight: 700, color: TT, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
                Potential Matches in System
              </div>
              {email.potentialDuplicates!.map((dup, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 10, padding: "9px 12px",
                  background: "white", border: `1px solid ${BDL}`, marginBottom: 6,
                  borderLeft: `3px solid ${dup.match >= 90 ? "#B91C1C" : "#B45309"}`,
                }}>
                  {/* Match % gauge */}
                  <div style={{ textAlign: "center", flexShrink: 0 }}>
                    <div style={{ fontSize: "1.0rem", fontWeight: 800, color: dup.match >= 90 ? "#B91C1C" : "#B45309", lineHeight: 1 }}>{dup.match}%</div>
                    <div style={{ fontSize: "0.55rem", color: TT }}>match</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                      <span style={{ fontSize: "0.72rem", fontWeight: 700, color: N, cursor: "pointer", textDecoration: "underline" }}>{dup.id}</span>
                      <span style={{
                        fontSize: "0.58rem", fontWeight: 800, padding: "1px 6px",
                        background: statusBg[dup.status] ?? "#F0F3F8",
                        color: statusColor[dup.status] ?? TT,
                      }}>{dup.status}</span>
                    </div>
                    <div style={{ fontSize: "0.68rem", color: "#1A2530", fontWeight: 600 }}>{dup.name}</div>
                    <div style={{ fontSize: "0.61rem", color: TT, marginTop: 2 }}>{dup.reason}</div>
                  </div>
                  <button style={{
                    display: "flex", alignItems: "center", gap: 4, padding: "5px 9px",
                    border: `1px solid ${BDL}`, background: "white", cursor: "pointer",
                    fontSize: "0.64rem", color: N, fontFamily: font, fontWeight: 600,
                    borderRadius: 6,
                  }}>
                    <ExternalLink size={10} /> View
                  </button>
                </div>
              ))}
              <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                <button style={{
                  display: "flex", alignItems: "center", gap: 5, padding: "6px 12px",
                  background: "#1A7A4A", color: "white", border: "none", cursor: "pointer",
                  fontSize: "0.68rem", fontWeight: 700, fontFamily: font,
                  borderRadius: 6,
                }}>
                  <Plus size={11} /> Proceed as New Submission
                </button>
                <button style={{
                  display: "flex", alignItems: "center", gap: 5, padding: "6px 12px",
                  background: "white", color: TM, border: `1px solid ${BDL}`, cursor: "pointer",
                  fontSize: "0.68rem", fontFamily: font,
                  borderRadius: 6,
                }}>
                  <Copy size={11} /> Merge with Existing
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}