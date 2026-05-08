import { useState, useRef, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router";
import {
  Bot, X, Send, ChevronRight, ChevronLeft,
  RotateCcw, LayoutDashboard, Inbox, FileText, Calculator,
  Sparkles, AlertCircle, BookOpen, MessageSquare,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

// ── Design tokens ──────────────────────────────────────────────────────────────
const N    = "#0123D4";
const G    = "#C9A227";
const BDL  = "#DCE3EC";
const TM   = "#4A5D6E";
const TT   = "#7A8FA3";
const font = "'Source Sans 3', system-ui, sans-serif";

// ── Page context definitions ───────────────────────────────────────────────────
interface PageContext {
  id: string;
  label: string;
  icon: React.ReactNode;
  accentColor: string;
  welcomeTitle: string;
  welcomeBody: string;
  chips: { label: string; prompt: string }[];
}

function buildPageContexts(userName: string, userRole: string): Record<string, PageContext> {
  return {
    dashboard: {
      id: "dashboard",
      label: "Dashboard Intelligence",
      icon: <LayoutDashboard size={13} />,
      accentColor: N,
      welcomeTitle: `Good to see you, ${userName.split(" ")[0]}!`,
      welcomeBody: "I can help you interpret your portfolio KPIs, surface at-risk submissions, and guide you to the right workflows.",
      chips: [
        { label: "What needs my attention today?", prompt: "What submissions or tasks need my immediate attention based on my current portfolio?" },
        { label: "Explain renewal rate trends", prompt: "Can you explain what the renewal rate trends on the dashboard mean for our education portfolio?" },
        { label: "Go to Submissions", prompt: "Take me to the Submissions list page." },
        { label: "Show overdue submissions", prompt: "Which submissions are overdue or past their review deadline?" },
      ],
    },
    submissions: {
      id: "submissions",
      label: "Submissions Assistant",
      icon: <Inbox size={13} />,
      accentColor: "#7B2FBE",
      welcomeTitle: "Submissions Assistant",
      welcomeBody: "I can help you filter, triage, and prioritize your submissions queue — or walk you through any submission status.",
      chips: [
        { label: "What do the status badges mean?", prompt: "Can you explain all the submission status badges — New, In Review, Quote Issued, Bound, Declined, Referred?" },
        { label: "How to filter by coverage type?", prompt: "How do I filter submissions by coverage type in the filter panel?" },
        { label: "Which are highest priority?", prompt: "Which submissions in my queue should I prioritize first and why?" },
        { label: "Referred vs Declined?", prompt: "What is the difference between a Referred and Declined submission status?" },
      ],
    },
    detail: {
      id: "detail",
      label: "Submission Review",
      icon: <FileText size={13} />,
      accentColor: "#1A7A4A",
      welcomeTitle: "Submission Review Assistant",
      welcomeBody: "I can help you analyze this submission's risk profile, interpret loss history, and determine the right underwriting action.",
      chips: [
        { label: "What coverage is required?", prompt: "What standard coverages should a K-12 school district submission typically require?" },
        { label: "Interpret the loss history", prompt: "How should I interpret a 5-year loss history for this type of educational institution?" },
        { label: "Red flags to watch for", prompt: "What are common underwriting red flags in education submissions I should check?" },
        { label: "Should I refer or quote?", prompt: "What factors would lead me to refer this submission rather than issuing a direct quote?" },
      ],
    },
    quote: {
      id: "quote",
      label: "Quote Builder Copilot",
      icon: <Calculator size={13} />,
      accentColor: G,
      welcomeTitle: "Quote Builder Copilot",
      welcomeBody: "I can help you structure coverage options, validate pricing, compare quote scenarios, and guide you through the broker negotiation stages.",
      chips: [
        { label: "GL limits for K-12?", prompt: "What are the recommended General Liability limits for a K-12 school district with 5,000 students?" },
        { label: "Explain negotiation stages", prompt: "Walk me through the broker negotiation workflow stages: Draft, Issued, Sent, Negotiating." },
        { label: "When to add cyber coverage?", prompt: "Under what circumstances should I add Cyber Liability coverage to an education quote?" },
        { label: "Deductible best practices", prompt: "What deductible levels are standard for property coverage in education sector quotes?" },
      ],
    },
  };
}

// ── Simulated AI response engine ───────────────────────────────────────────────
const RESPONSE_LIBRARY: Record<string, string> = {
  "attention|priority|urgent|overdue": "Based on your current portfolio, **3 submissions are flagged as urgent**:\n\n• **SUB-7835** (Seattle PS) — Missing Safety Questionnaire, blocking quote issuance\n• **SUB-7831** (Austin ISD) — Review overdue by 16 days, escalation risk\n• **SUB-7830** (San Diego City) — Quote expiring in 5 days, broker follow-up needed\n\nI'd recommend tackling SUB-7835 first since the missing document is the only blocker.",
  "renewal|trend|kpi": "Your **renewal rate of 87.3%** is above the education sector average of ~82%. The slight 1.2% dip from last quarter likely reflects 2 large districts that went to market.\n\nKey drivers to watch:\n• Loss ratio trending up (+3.1%) — may indicate underpricing in the Property line\n• New submissions +12% YoY suggests appetite expansion is working",
  "status|badge|new|review|issued|bound|declined|referred": "Here's what each status badge means:\n\n🔵 **New** — Received, not yet reviewed\n🟡 **In Review** — Assigned UW is actively evaluating\n🟣 **Quote Issued** — Quote generated, pending broker delivery\n🟢 **Bound** — Policy bound, active coverage\n🔴 **Declined** — Submission declined, outside appetite\n🟠 **Referred** — Escalated to senior UW or committee for decision\n\nReferred ≠ Declined — a referred submission still has a path to binding.",
  "filter|coverage type|search": "To filter by coverage type:\n\n1. Click **Show Filters** at the top of the Submissions page\n2. Expand the **Coverage Type** section in the filter panel\n3. Check the coverage lines you want (GL, Property, Cyber, EPL, etc.)\n4. Active filters appear as chips below the search bar\n\nYou can combine multiple coverage filters — the table updates instantly.",
  "refer|decline|difference": "**Referred** means the submission needs review by a senior UW or committee but can still be quoted and bound after review.\n\n**Declined** means the risk is outside appetite entirely and no quote will be issued.\n\nKey referral triggers: enrollment > 10,000, loss ratio > 75%, or prior non-renewal by another carrier.",
  "coverage|required|standard|k-12|district": "Standard coverages for a K-12 school district submission typically include:\n\n• **General Liability** — $1M/$3M aggregate minimum\n• **Educators Legal Liability (EPL)** — Covers employment practices and educator conduct\n• **Property** — Building and contents, including tech equipment\n• **Cyber Liability** — Student PII is a significant exposure\n• **Auto Liability** — School bus fleets require careful review\n• **Umbrella/Excess** — Recommend $5M+ for districts over 2,500 students",
  "loss history|interpret|5-year": "When reviewing 5-year loss history:\n\n• **Loss Ratio < 50%** — Favorable, supports standard pricing\n• **Loss Ratio 50–70%** — Acceptable, monitor frequency trends\n• **Loss Ratio > 70%** — Referral trigger, investigate root causes\n\nA high single-year loss with documented corrective action is less concerning than persistent frequency.",
  "red flag|flags|watch|check": "Common underwriting red flags in education submissions:\n\n🚩 **Prior non-renewal** by another carrier\n🚩 **Loss ratio > 75%** in any of the last 3 years\n🚩 **Pending litigation** not disclosed in application\n🚩 **Enrollment decline > 15%** — financial instability signal\n🚩 **No cybersecurity policy** for districts with student data systems\n🚩 **Charter school** with less than 3 years operating history",
  "negotiation|stages|draft|issued|sent|negotiating": "The broker negotiation workflow has 4 stages:\n\n**1. Draft** — Quote is being built internally, not yet visible to broker\n**2. Issued** — Quote finalized and ready to send; you can still revise\n**3. Sent** — Quote delivered to broker; negotiation clock starts\n**4. Negotiating** — Broker has countered; use the comparison panel to evaluate options\n\nTypical cycle time: 5–10 business days from Sent to Bound.",
  "cyber|cyber liability|when": "Add Cyber Liability coverage when:\n\n• District manages **student PII** in SIS/LMS platforms\n• District has **1,000+ connected devices** on network\n• Any **prior data breach** or ransomware incident\n• District uses **third-party cloud vendors** for records\n\nMinimum recommended: **$1M** for districts under 5,000 students, **$3M** for larger districts.",
  "deductible|property|standard": "Standard property deductible levels for education sector:\n\n• **Small districts** (<1,000 students): $5,000–$10,000\n• **Mid-size districts** (1,000–5,000): $10,000–$25,000\n• **Large districts** (5,000+): $25,000–$100,000\n\nA $50K vs $10K deductible on a large district typically saves 8–12% on property premium.",
  "gl limits|general liability|recommended": "Recommended GL limits for a K-12 district with 5,000 students:\n\n• **Per Occurrence**: $1,000,000\n• **General Aggregate**: $3,000,000\n• **Products/Completed Ops**: $1,000,000\n\nFor districts with high extracurricular exposure, consider an **Umbrella of $5M** above primary GL.",
};

const DEFAULT_RESPONSES = [
  "I can help you with underwriting questions, submission analysis, quote structuring, and navigation within the platform. Could you tell me more about what you're working on?",
  "As a United Educators underwriting assistant, I can help you interpret risk data, understand coverage requirements, and guide you through workflows. What would be most helpful right now?",
];

function detectNavigation(prompt: string): string | undefined {
  const lower = prompt.toLowerCase();
  if (lower.includes("go to submissions") || lower.includes("take me to submission") || lower.includes("submissions page")) return "/submissions";
  if (lower.includes("go to dashboard") || lower.includes("take me to dashboard")) return "/";
  if (lower.includes("go to inbox") || lower.includes("take me to inbox")) return "/inbox";
  if (lower.includes("go to tasks") || lower.includes("take me to tasks") || lower.includes("task queue")) return "/tasks";
  if (lower.includes("go to portfolio") || lower.includes("take me to portfolio")) return "/portfolio";
  if (lower.includes("go to appetite") || lower.includes("take me to appetite")) return "/appetite";
  return undefined;
}

const NAV_LABELS: Record<string, string> = {
  "/submissions": "Submissions list",
  "/": "Dashboard",
  "/inbox": "Inbox",
  "/tasks": "Task Queue",
  "/portfolio": "Portfolio",
  "/appetite": "Appetite Rules",
};

function simulateResponse(prompt: string): { text: string; navigateTo?: string } {
  const navigateTo = detectNavigation(prompt);
  if (navigateTo) return { text: `Navigating you to the ${NAV_LABELS[navigateTo] ?? "page"} now!`, navigateTo };
  const lower = prompt.toLowerCase();
  for (const [keys, response] of Object.entries(RESPONSE_LIBRARY)) {
    if (keys.split("|").some(k => lower.includes(k))) return { text: response };
  }
  return { text: DEFAULT_RESPONSES[Math.floor(Math.random() * DEFAULT_RESPONSES.length)] };
}

// ── Anthropic API integration ──────────────────────────────────────────────────
const ANTHROPIC_MODEL = "claude-sonnet-4-20250514";
const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";

function getAnthropicApiKey(): string | undefined {
  // @ts-ignore — import.meta.env is provided by Vite
  const key = (import.meta as any).env?.VITE_ANTHROPIC_API_KEY as string | undefined;
  return key && key.trim().length > 0 ? key.trim() : undefined;
}

function buildSystemPrompt(ctx: PageContext, userName: string, userRole: string): string {
  return [
    "You are an AI underwriting assistant embedded in the United Educators Underwriting Workbench, a specialty insurance application for K-12 districts, charter schools, higher education, and private schools.",
    `The user is ${userName} (${userRole}).`,
    `They are currently viewing the "${ctx.label}" view of the application.`,
    "",
    "Your responsibilities:",
    "- Help interpret submission data, loss histories, appetite scores, and risk indicators.",
    "- Explain coverage lines (GL, EPL, ELL, Property, Cyber, Auto, Crime, Student Accident).",
    "- Suggest next actions for triage, referrals, quotes, and broker communication.",
    "- Be concise and concrete: prefer short bulleted lists with specific numbers and thresholds.",
    "- Ground every claim in plausible underwriting practice for the education sector. If you do not know, say so.",
    "- Never fabricate specific submission IDs, dollar amounts, or claim details unless they appear in the user's question.",
    "",
    "Formatting: short paragraphs, bullets prefixed with '• ', and **bold** for emphasis. No headings or code blocks.",
    "Length: keep responses under 180 words unless explicitly asked for more detail.",
  ].join("\n");
}

async function callAnthropic(
  prompt: string,
  history: { role: "user" | "assistant"; text: string }[],
  ctx: PageContext,
  userName: string,
  userRole: string
): Promise<string> {
  const apiKey = getAnthropicApiKey();
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY_MISSING");

  const messages = [...history, { role: "user" as const, text: prompt }]
    .map(m => ({ role: m.role, content: m.text }));
  while (messages.length > 0 && messages[0].role !== "user") messages.shift();

  const res = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true",
    },
    body: JSON.stringify({
      model: ANTHROPIC_MODEL,
      max_tokens: 600,
      system: buildSystemPrompt(ctx, userName, userRole),
      messages,
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Anthropic API ${res.status}: ${detail.slice(0, 200)}`);
  }

  const data = await res.json();
  const text = Array.isArray(data?.content)
    ? data.content.filter((b: any) => b?.type === "text").map((b: any) => b.text).join("\n").trim()
    : "";
  if (!text) throw new Error("ANTHROPIC_EMPTY_RESPONSE");
  return text;
}

// ── Message type ───────────────────────────────────────────────────────────────
interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  ts: Date;
}

// ── Markdown-lite renderer ─────────────────────────────────────────────────────
function RenderText({ text, accentColor }: { text: string; accentColor: string }) {
  const lines = text.split("\n");
  return (
    <>
      {lines.map((line, i) => {
        const parts = line.split(/(\*\*[^*]+\*\*)/g).map((part, j) =>
          part.startsWith("**") && part.endsWith("**")
            ? <strong key={j}>{part.slice(2, -2)}</strong>
            : <span key={j}>{part}</span>
        );
        const isEmpty = line === "";
        const isBullet = line.startsWith("• ");
        const isEmoji = /^[🚩🔵🟡🟣🟢🔴🟠📍]/.test(line);
        return (
          <div
            key={i}
            style={{ marginTop: i === 0 ? 0 : isEmpty ? 6 : isBullet || isEmoji ? 4 : 2 }}
          >
            {isBullet ? (
              <span style={{ display: "flex", gap: 6, alignItems: "flex-start" }}>
                <span style={{ color: accentColor, marginTop: 1, flexShrink: 0 }}>•</span>
                <span>{line.slice(2).split(/(\*\*[^*]+\*\*)/g).map((p, k) =>
                  p.startsWith("**") && p.endsWith("**") ? <strong key={k}>{p.slice(2,-2)}</strong> : <span key={k}>{p}</span>
                )}</span>
              </span>
            ) : isEmpty ? null : parts}
          </div>
        );
      })}
    </>
  );
}

// ── ChatBot panel component ────────────────────────────────────────────────────
export function ChatBot() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user }  = useAuth();

  const [isOpen,     setIsOpen]     = useState(false);
  const [messages,   setMessages]   = useState<Message[]>([]);
  const [input,      setInput]      = useState("");
  const [isTyping,   setIsTyping]   = useState(false);
  const [prevPageId, setPrevPageId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef       = useRef<HTMLTextAreaElement>(null);

  const userName = user?.name ?? "Underwriter";
  const userRole = user?.roleLabel ?? "Underwriter";
  const contexts = buildPageContexts(userName, userRole);

  const getContext = useCallback((pathname: string): PageContext => {
    if (/\/submission\/[^/]+\/quote/.test(pathname)) return contexts.quote;
    if (/\/submission\/[^/]+/.test(pathname))        return contexts.detail;
    if (pathname === "/submissions")                  return contexts.submissions;
    return contexts.dashboard;
  }, [userName, userRole]);

  const ctx = getContext(location.pathname);

  // Page-change transition message
  useEffect(() => {
    if (!isOpen) return;
    if (prevPageId !== null && prevPageId !== ctx.id) {
      setMessages(prev => [...prev, {
        id: `sys-${Date.now()}`,
        role: "assistant",
        text: `📍 **Context updated to ${ctx.label}**\n\n${ctx.welcomeBody}`,
        ts: new Date(),
      }]);
    }
    setPrevPageId(ctx.id);
  }, [ctx.id, isOpen]);

  // Show welcome on first open
  const handleOpen = () => {
    setIsOpen(true);
    setPrevPageId(ctx.id);
    if (messages.length === 0) {
      setMessages([{
        id: "welcome",
        role: "assistant",
        text: `**${ctx.welcomeTitle}**\n\n${ctx.welcomeBody}`,
        ts: new Date(),
      }]);
    }
    setTimeout(() => inputRef.current?.focus(), 150);
  };

  const handleClose = () => setIsOpen(false);

  const handleReset = () => {
    setMessages([{
      id: `welcome-${Date.now()}`,
      role: "assistant",
      text: `**${ctx.welcomeTitle}**\n\n${ctx.welcomeBody}`,
      ts: new Date(),
    }]);
    setInput("");
  };

  useEffect(() => {
    if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    // Capture history BEFORE we mutate state so the API call sees prior turns
    // without the new user message duplicated.
    const historyForApi = messages.map(m => ({ role: m.role, text: m.text }));

    setMessages(prev => [...prev, { id: `u-${Date.now()}`, role: "user", text: trimmed, ts: new Date() }]);
    setInput("");
    setIsTyping(true);

    // Detect navigation up-front so we can route after the response is shown.
    const navigateTo = detectNavigation(trimmed);

    let responseText: string;
    try {
      // Try real Anthropic API first.
      responseText = await callAnthropic(trimmed, historyForApi, ctx, userName, userRole);
    } catch (err) {
      // Graceful fallback: simulated context-aware responses.
      await new Promise(r => setTimeout(r, 700 + Math.random() * 500));
      responseText = simulateResponse(trimmed).text;
    }

    setMessages(prev => [...prev, { id: `a-${Date.now()}`, role: "assistant", text: responseText, ts: new Date() }]);
    setIsTyping(false);
    if (navigateTo) setTimeout(() => navigate(navigateTo), 600);
  }, [ctx, navigate, messages, userName, userRole]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  };

  // ── Closed state: slim vertical tab strip ─────────────────────────────────
  if (!isOpen) {
    return (
      <div
        style={{
          width: 44,
          minWidth: 44,
          height: "100vh",
          background: "white",
          borderLeft: `1px solid ${BDL}`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          fontFamily: font,
        }}
      >
        <button
          onClick={handleOpen}
          title="Open AI Assistant"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 8,
            padding: "14px 0",
            cursor: "pointer",
            background: "transparent",
            border: "none",
            width: "100%",
          }}
        >
          {/* Accent top bar on tab */}
          <div style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: 44,
            height: 3,
            background: ctx.accentColor,
          }} />
          <div style={{
            width: 32,
            height: 32,
            background: ctx.accentColor,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}>
            <Bot size={16} color="white" />
            {/* Gold pulse dot */}
            <span style={{
              position: "absolute",
              top: 4,
              right: 4,
              width: 7,
              height: 7,
              background: G,
              borderRadius: "50%",
              border: "1.5px solid white",
              animation: "pulse-dot 2s infinite",
            }} />
          </div>
          {/* Rotated label */}
          <span style={{
            writingMode: "vertical-rl",
            textOrientation: "mixed",
            transform: "rotate(180deg)",
            fontSize: "0.60rem",
            fontWeight: 700,
            color: TM,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            marginTop: 4,
          }}>
            AI Assistant
          </span>
          <ChevronLeft size={12} color={TT} />
        </button>

        <style>{`
          @keyframes pulse-dot {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.5; transform: scale(0.75); }
          }
          @keyframes typing-dot {
            0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
            40% { opacity: 1; transform: scale(1); }
          }
        `}</style>
      </div>
    );
  }

  // ── Open state: full panel ─────────────────────────────────────────────────
  return (
    <div
      style={{
        width: "clamp(320px, 25vw, 480px)",
        minWidth: 320,
        height: "100vh",
        background: "white",
        borderLeft: `1px solid ${BDL}`,
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        fontFamily: font,
        overflow: "hidden",
      }}
    >
      {/* ── Context bar ───────────────────────────────────────────────────── */}
      <div style={{ borderTop: `3px solid ${ctx.accentColor}`, background: "white", borderBottom: `1px solid ${BDL}`, flexShrink: 0 }}>
        {/* Header row */}
        <div className="flex items-center gap-2 px-4 py-3">
          <div style={{
            width: 30, height: 30,
            background: `${ctx.accentColor}15`,
            border: `1px solid ${ctx.accentColor}35`,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: ctx.accentColor, flexShrink: 0,
          }}>
            {ctx.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div style={{ fontSize: "0.70rem", fontWeight: 800, color: ctx.accentColor, textTransform: "uppercase", letterSpacing: "0.07em", lineHeight: 1.1 }}>
              {ctx.label}
            </div>
            <div style={{ fontSize: "0.60rem", color: TT, marginTop: 1 }}>
              AI Underwriting Assistant · {userRole}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={handleReset} title="Reset conversation"
              style={{ width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${BDL}`, background: "transparent", cursor: "pointer", color: TT }}>
              <RotateCcw size={11} />
            </button>
            <button onClick={handleClose} title="Collapse assistant"
              style={{ width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${BDL}`, background: "transparent", cursor: "pointer", color: TT }}>
              <ChevronRight size={11} />
            </button>
          </div>
        </div>
        {/* UE Intelligence sub-strip */}
        <div style={{
          background: `${ctx.accentColor}08`, borderTop: `1px solid ${ctx.accentColor}20`,
          padding: "4px 16px", display: "flex", alignItems: "center", gap: 5,
        }}>
          <Sparkles size={9} color={ctx.accentColor} />
          <span style={{ fontSize: "0.57rem", color: ctx.accentColor, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>
            UE Intelligence · Contextual AI
          </span>
          <span style={{ fontSize: "0.57rem", color: TT, marginLeft: "auto" }}>
            {ctx.id.charAt(0).toUpperCase() + ctx.id.slice(1)} context
          </span>
        </div>
      </div>

      {/* ── Messages ──────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, overflowY: "auto", padding: 14, display: "flex", flexDirection: "column", gap: 12, background: "#F8FAFC" }}>
        {messages.map(msg => (
          <div key={msg.id} style={{ display: "flex", flexDirection: msg.role === "user" ? "row-reverse" : "row", gap: 8, alignItems: "flex-start" }}>
            {/* Avatar */}
            <div style={{
              width: 26, height: 26, flexShrink: 0, marginTop: 2,
              background: msg.role === "assistant" ? ctx.accentColor : TM,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "0.56rem", fontWeight: 800, color: "white",
            }}>
              {msg.role === "assistant" ? <Bot size={13} color="white" /> : (user?.initials ?? "U")}
            </div>
            {/* Bubble */}
            <div style={{
              maxWidth: "83%",
              padding: "9px 11px",
              background: msg.role === "user" ? N : "white",
              color: msg.role === "user" ? "white" : "#1A2530",
              border: msg.role === "user" ? "none" : `1px solid ${BDL}`,
              borderLeft: msg.role === "assistant" ? `3px solid ${ctx.accentColor}` : undefined,
              fontSize: "0.73rem",
              lineHeight: 1.58,
              boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
            }}>
              <RenderText text={msg.text} accentColor={msg.role === "user" ? "white" : ctx.accentColor} />
              <div style={{ fontSize: "0.56rem", color: msg.role === "user" ? "rgba(255,255,255,0.55)" : TT, marginTop: 5, textAlign: "right" }}>
                {msg.ts.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
            <div style={{ width: 26, height: 26, background: ctx.accentColor, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Bot size={13} color="white" />
            </div>
            <div style={{ padding: "10px 14px", background: "white", border: `1px solid ${BDL}`, borderLeft: `3px solid ${ctx.accentColor}`, display: "flex", alignItems: "center", gap: 5 }}>
              {[0, 0.2, 0.4].map((delay, i) => (
                <span key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: TT, display: "inline-block", animation: `typing-dot 1.2s infinite ${delay}s` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ── Suggestion chips ──────────────────────────────────────────────── */}
      <div style={{ padding: "10px 12px 8px", borderTop: `1px solid ${BDL}`, background: "white", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 7 }}>
          <BookOpen size={9} color={TT} />
          <span style={{ fontSize: "0.58rem", fontWeight: 700, color: TT, textTransform: "uppercase", letterSpacing: "0.06em" }}>Suggested</span>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
          {ctx.chips.map((chip, i) => (
            <button
              key={i}
              onClick={() => sendMessage(chip.prompt)}
              disabled={isTyping}
              style={{
                padding: "4px 9px",
                border: `1px solid ${ctx.accentColor}40`,
                background: `${ctx.accentColor}08`,
                color: ctx.accentColor,
                fontSize: "0.63rem",
                fontWeight: 600,
                cursor: isTyping ? "not-allowed" : "pointer",
                opacity: isTyping ? 0.5 : 1,
                transition: "all 0.15s",
                fontFamily: font,
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
              onMouseEnter={e => { if (!isTyping) { (e.currentTarget as HTMLElement).style.background = `${ctx.accentColor}18`; } }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = `${ctx.accentColor}08`; }}
            >
              <ChevronRight size={8} />
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Input area ────────────────────────────────────────────────────── */}
      <div style={{ padding: "10px 12px 12px", background: "white", borderTop: `1px solid ${BDL}`, flexShrink: 0 }}>
        <div style={{
          display: "flex", alignItems: "flex-end", gap: 8,
          border: `1.5px solid ${input ? ctx.accentColor : BDL}`,
          padding: "7px 8px 7px 11px",
          background: "#F8FAFC",
          transition: "border-color 0.2s",
        }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Ask about ${ctx.id === "dashboard" ? "your portfolio…" : ctx.id === "submissions" ? "submissions…" : ctx.id === "detail" ? "this submission…" : "quote building…"}`}
            disabled={isTyping}
            rows={1}
            style={{
              flex: 1, background: "transparent", border: "none", outline: "none",
              resize: "none", fontSize: "0.75rem", color: "#1A2530",
              fontFamily: font, lineHeight: 1.5, maxHeight: 72, overflowY: "auto",
            }}
            onInput={e => {
              const el = e.currentTarget;
              el.style.height = "auto";
              el.style.height = Math.min(el.scrollHeight, 72) + "px";
            }}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isTyping}
            style={{
              width: 30, height: 30, flexShrink: 0,
              background: input.trim() && !isTyping ? ctx.accentColor : BDL,
              border: "none", cursor: input.trim() && !isTyping ? "pointer" : "not-allowed",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "background 0.2s",
            }}
          >
            <Send size={13} color="white" />
          </button>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 5 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
            <AlertCircle size={8} color={TT} />
            <span style={{ fontSize: "0.56rem", color: TT }}>Advisory only — verify before binding.</span>
          </div>
          <span style={{ fontSize: "0.56rem", color: TT }}>⏎ to send</span>
        </div>
      </div>

      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.75); }
        }
        @keyframes typing-dot {
          0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
