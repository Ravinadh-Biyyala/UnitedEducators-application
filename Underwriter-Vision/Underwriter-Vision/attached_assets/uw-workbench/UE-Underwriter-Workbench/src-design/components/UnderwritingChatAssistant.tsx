import { useState } from "react";
import {
  Sparkles, CheckCircle2, AlertTriangle, ChevronDown,
  Plus, FileText, ChevronRight, ArrowDown, User, Cog,
  ShieldCheck, AlertCircle, Upload, Target, Activity,
  Layers, Info, Check, X,
} from "lucide-react";

// ─── Design tokens (aligned with ChatBot.tsx) ────────────────────────────────
const NAVY  = "#0C1D3B";
const BLUE  = "#0123D4";
const GREEN = "#1A7A4A";
const RED   = "#B91C1C";
const BDL   = "#DCE3EC";
const TM    = "#4A5D6E";
const TT    = "#7A8FA3";
const font  = "'Source Sans 3', system-ui, sans-serif";

// ─── Public types ─────────────────────────────────────────────────────────────
export type ActionOwner = "Broker/User" | "System Automation" | "Underwriter";

export type ReviewFlagAction = {
  gap: string;
  requiredAction: string;
  assignedOwner: ActionOwner;
  ctaLabel?: string; // optional override; defaults to "Take Action"
};

export type ReviewFlag = {
  id: string;
  type: "green" | "red";
  title: string;
  source: string;
  actionItem?: ReviewFlagAction; // only meaningful on red flags
};

export type CompanionSuggestion = {
  id: string;
  code: string;       // e.g. "BLX"
  name: string;       // "Buffer Excess Liability"
  teaser: string;     // one-line summary
  reasoning: string;  // underwriter-focused justification
};

export type DimensionTone   = "good" | "moderate" | "elevated" | "neutral";
export type FindingTone     = "positive" | "warning" | "critical" | "info";

export type DimensionFinding = {
  tone: FindingTone;
  text: string;
};

export type Dimension = {
  id: string;
  label: string;
  icon: React.ReactNode;
  score: number;     // 0-100
  rating: string;    // qualitative label
  tone: DimensionTone;
  findings: DimensionFinding[];
};

export type AssistantPayload = {
  summary: string;
  dimensions: Dimension[];
  flags: ReviewFlag[];
  companions: CompanionSuggestion[];
};

// ─── Tone palettes for dimensional review ─────────────────────────────────────
const TONE_PALETTE: Record<DimensionTone, {
  bg: string; border: string; text: string; dot: string; chipBg: string;
}> = {
  good:     { bg:"#F0FAF4", border:"#BFE2CB", text:"#0E5C36", dot:GREEN,     chipBg:"#DCF1E3" },
  moderate: { bg:"#FFFBEB", border:"#FCD34D", text:"#92400E", dot:"#D97706", chipBg:"#FEF3C7" },
  elevated: { bg:"#FEF3F2", border:"#F5C6CB", text:"#7F1D1D", dot:RED,       chipBg:"#FEE2E2" },
  neutral:  { bg:"#F7F9FC", border:BDL,        text:NAVY,     dot:BLUE,      chipBg:"#EBF0FB" },
};

const FINDING_ICON: Record<FindingTone, React.ReactNode> = {
  positive: <Check size={11} color={GREEN}/>,
  warning:  <AlertTriangle size={11} color="#D97706"/>,
  critical: <X size={11} color={RED} strokeWidth={3}/>,
  info:     <Info size={11} color={BLUE}/>,
};

// ─── Owner config (icon + palette per assignee) ───────────────────────────────
const OWNER_CFG: Record<ActionOwner, {
  icon: React.ReactNode;
  label: string;
  color: string;
  bg: string;
  border: string;
}> = {
  "Broker/User":       { icon:<User size={11}/>,        label:"Broker / User",      color:"#0E5390", bg:"#E0EAF7", border:"#B9CDE8" },
  "System Automation": { icon:<Cog size={11}/>,         label:"System Automation",  color:"#5B21B6", bg:"#EDE3FB", border:"#D0BFF0" },
  "Underwriter":       { icon:<ShieldCheck size={11}/>, label:"Underwriter",        color:"#0E5C36", bg:"#DCF1E3", border:"#B5DDC2" },
};

// ─── Mock AI response payload ─────────────────────────────────────────────────
const MOCK_PAYLOAD: AssistantPayload = {
  summary:
    "I've finished the automated review of the 3 documents you uploaded — Application, Audited Financials, and 6-year Loss Runs. Here are the dimensional scores, the flags I surfaced, and a couple of companion products worth considering.",
  dimensions: [
    {
      id: "dim-appetite",
      label: "Appetite & Member-Fit",
      icon: <Target size={12}/>,
      score: 82,
      rating: "Strong Fit",
      tone: "good",
      findings: [
        { tone: "positive", text: "Private K-12 institution type aligns with UE's core education appetite." },
        { tone: "positive", text: "No excluded operations identified in application." },
        { tone: "positive", text: "Centralized COI tracking documented — UE green flag." },
        { tone: "info",     text: "UE member since 2019 — 6-year continuous history." },
      ],
    },
    {
      id: "dim-claims",
      label: "Claims History",
      icon: <Activity size={12}/>,
      score: 66,
      rating: "Moderate Concern",
      tone: "moderate",
      findings: [
        { tone: "positive", text: "6-year loss runs received and verified — complete history." },
        { tone: "warning",  text: "Claim frequency 1.8/yr — above 1.2 sector median." },
        { tone: "warning",  text: "2 open claims · combined reserves $305K." },
        { tone: "positive", text: "Loss ratio 68% — below 70% referral threshold." },
      ],
    },
    {
      id: "dim-benchmark",
      label: "Comparable Risk Benchmarking",
      icon: <Layers size={12}/>,
      score: 62,
      rating: "At Market · 62nd %ile",
      tone: "neutral",
      findings: [
        { tone: "info",     text: "Estimated $187K · peer median $182K (4 institutions cohort)." },
        { tone: "info",     text: "Peer cohort: Northeast private K-12, enrollment 500–900." },
        { tone: "positive", text: "GL loss ratio aligns with peer median for the education sector." },
        { tone: "positive", text: "Safety score 91/100 qualifies for safety credit modifier." },
      ],
    },
  ],
  flags: [
    {
      id: "g1",
      type: "green",
      title: "Established Crisis Response Plans",
      source:
        "Application §4.2 — Administrative Practices: documented active-threat protocol, parent-notification chain, and tabletop drill cadence (annual).",
    },
    {
      id: "g2",
      type: "green",
      title: "Strict Title IX Compliance",
      source:
        "Title IX Coordinator certification on file (FY24). Quarterly training records and grievance log provided in supplemental upload.",
    },
    {
      id: "g3",
      type: "green",
      title: "Clean 7-year claims history — no severity outliers",
      source:
        "Loss runs 2018–2024 from Great American: 4 closed claims, max incurred $42K, no reservations on open file.",
    },
    {
      id: "r1",
      type: "red",
      title: "Missing statement describing SIR funding mechanism for BLX",
      source:
        "Buffer Excess Liability (BLX) requires independent verification of the Self-Insured Retention funding mechanism. The submitted financials reference an SIR but do not include an actuarial opinion confirming reserve adequacy.",
      actionItem: {
        gap: "Missing statement describing SIR funding mechanism for BLX",
        requiredAction: "Upload SIR Actuarial Opinion",
        assignedOwner: "Broker/User",
        ctaLabel: "Upload Document",
      },
    },
    {
      id: "r2",
      type: "red",
      title: "History of primary limits pierced (2 occurrences)",
      source:
        "Referencing 2026 Large Loss Report trends — 2022 occurrence ($1.05M) and 2023 occurrence ($980K) approached or exceeded $1M primary CGL limits.",
      actionItem: {
        gap: "Primary CGL limits pierced in 2 of last 5 years",
        requiredAction: "Review limit adequacy before re-quoting",
        assignedOwner: "Underwriter",
        ctaLabel: "Open Review",
      },
    },
    {
      id: "r3",
      type: "red",
      title: "Sexual Misconduct supplemental not yet received",
      source:
        "UE standard intake requires the Sexual Misconduct Application addendum for institutions with residential or athletic programs. The submission has not yet triggered the form.",
      actionItem: {
        gap: "Sexual Misconduct Application addendum not on file",
        requiredAction: "Trigger Sexual Misconduct addendum to broker",
        assignedOwner: "System Automation",
        ctaLabel: "Trigger Now",
      },
    },
  ],
  companions: [
    {
      id: "c1",
      code: "BLX",
      name: "Buffer Excess Liability",
      teaser: "Recommended — your primary CGL limits were pierced twice in 2 years.",
      reasoning:
        "The Loss Report shows two occurrences in 2022–2023 that approached or pierced your $1M primary CGL limits. A BLX buffer layer placed above primary CGL absorbs the next severity event before it erodes your aggregate. Median peer institution (private K-12, 600–900 enrollment) carries a $5M buffer; pricing typically lands at 18–22% of primary GL premium.",
    },
    {
      id: "c2",
      code: "XFF",
      name: "Excess Following Form",
      teaser: "Suggested — newly expanded athletics program adds catastrophic exposure.",
      reasoning:
        "Audited financials disclose a new athletics facility (FY24) and a varsity NCAA-NCS roster expansion. XFF follows the form of underlying policies and provides catastrophic coverage for a single-occurrence loss that would burn through both primary and buffer aggregates simultaneously.",
    },
  ],
};

// ═════════════════════════════════════════════════════════════════════════════
//   <DimensionalReview />
//   Clean text-based replacement for the legacy donut/bar charts.
// ═════════════════════════════════════════════════════════════════════════════
export function DimensionalReview({ dimensions }: { dimensions: Dimension[] }) {
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setCollapsedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:9 }} role="group" aria-label="Dimensional underwriting review">
      <div className="flex items-center justify-between">
        <span style={{
          fontSize:"0.6rem", fontWeight:800, color:TT,
          textTransform:"uppercase", letterSpacing:"0.1em",
        }}>
          Dimensional Review
        </span>
        <span style={{ fontSize:"0.62rem", color:TT, fontWeight:600 }}>
          {dimensions.length} dimensions analyzed
        </span>
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
        {dimensions.map(d => {
          const t          = TONE_PALETTE[d.tone];
          const isOpen     = !collapsedIds.has(d.id);
          const panelId    = `dim-panel-${d.id}`;

          return (
            <div key={d.id}
              style={{
                background:t.bg,
                border:`1px solid ${t.border}`,
                borderRadius:8,
                fontFamily:font,
                overflow:"hidden",
                transition:"background 0.15s ease",
              }}>
              {/* Header — clickable toggle */}
              <button
                onClick={() => toggle(d.id)}
                aria-expanded={isOpen}
                aria-controls={panelId}
                aria-label={`${d.label}: ${d.rating}, score ${d.score} of 100. ${isOpen ? "Collapse" : "Expand"} findings.`}
                className="w-full flex items-center justify-between gap-2 px-3 py-2.5 text-left focus-visible:outline-2 focus-visible:outline-offset-2"
                style={{
                  background:"transparent", border:"none", cursor:"pointer",
                  fontFamily:font, borderRadius:6,
                }}>
                <div className="flex items-center gap-2 min-w-0">
                  <span className="inline-flex items-center justify-center shrink-0"
                    style={{
                      width:22, height:22, borderRadius:6,
                      background:t.chipBg, color:t.text,
                    }}>
                    {d.icon}
                  </span>
                  <span style={{
                    fontSize:"0.76rem", fontWeight:700, color:NAVY,
                    whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis",
                  }}>
                    {d.label}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span style={{
                    fontSize:"0.7rem", color:TM, fontWeight:600,
                  }}>
                    <span style={{ color:NAVY, fontWeight:800 }}>{d.score}</span>
                    <span style={{ color:TT }}>/100</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5"
                    style={{
                      fontSize:"0.6rem", fontWeight:700, color:t.text,
                      background:t.chipBg, padding:"2px 7px", borderRadius:3,
                      whiteSpace:"nowrap",
                    }}>
                    <span style={{ width:5, height:5, borderRadius:"50%", background:t.dot }}/>
                    {d.rating}
                  </span>
                  <ChevronDown size={12} color={t.text} aria-hidden
                    style={{
                      transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.2s ease",
                    }}/>
                </div>
              </button>

              {/* Findings list */}
              {isOpen && (
                <ul id={panelId}
                  className="px-3 pb-3"
                  style={{
                    display:"flex", flexDirection:"column", gap:5,
                    borderTop:`1px dashed ${t.border}`, paddingTop:8,
                  }}>
                  {d.findings.map((f, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span aria-hidden style={{ marginTop:2, flexShrink:0 }}>
                        {FINDING_ICON[f.tone]}
                      </span>
                      <span style={{ fontSize:"0.7rem", color:TM, lineHeight:1.5 }}>
                        {f.text}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
//   <ReviewFlags />
// ═════════════════════════════════════════════════════════════════════════════
export function ReviewFlags({
  flags,
  onActionClick,
}: {
  flags: ReviewFlag[];
  onActionClick?: (flag: ReviewFlag) => void;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const green = flags.filter(f => f.type === "green");
  const red   = flags.filter(f => f.type === "red");

  const renderFlag = (f: ReviewFlag) => {
    const isExpanded = expandedId === f.id;
    const isGreen    = f.type === "green";
    const palette = isGreen
      ? { bg:"#F0FAF4", border:"#BFE2CB", icon:GREEN, text:"#0E5C36" }
      : { bg:"#FEF3F2", border:"#F5C6CB", icon:RED,   text:"#7F1D1D" };

    return (
      <div key={f.id}
        style={{
          background: palette.bg,
          border: `1px solid ${palette.border}`,
          borderRadius: 8,
          fontFamily: font,
          transition: "background 0.15s ease",
        }}>
        {/* Header row — clickable toggle */}
        <button
          onClick={() => setExpandedId(isExpanded ? null : f.id)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setExpandedId(isExpanded ? null : f.id);
            }
          }}
          aria-expanded={isExpanded}
          aria-controls={`flag-detail-${f.id}`}
          aria-label={`${isGreen ? "Green flag" : "Red flag"}: ${f.title}. ${isExpanded ? "Collapse" : "Expand"} details.`}
          className="w-full text-left flex items-start gap-2 px-3 py-2.5 hover:brightness-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2"
          style={{
            background:"transparent", border:"none", cursor:"pointer",
            fontFamily:font, borderRadius:6,
          }}>
          {isGreen
            ? <CheckCircle2 size={14} color={palette.icon} style={{ marginTop:2, flexShrink:0 }}/>
            : <AlertTriangle size={14} color={palette.icon} style={{ marginTop:2, flexShrink:0 }}/>}
          <div className="flex-1 min-w-0">
            <p style={{ fontSize:"0.76rem", fontWeight:700, color:palette.text, lineHeight:1.35 }}>
              {f.title}
            </p>
            {!isExpanded && !isGreen && f.actionItem && (
              <span className="inline-flex items-center gap-1 mt-1.5"
                style={{
                  fontSize:"0.6rem", fontWeight:700, color:palette.icon,
                }}>
                <AlertCircle size={10}/>
                Action required
              </span>
            )}
          </div>
          <ChevronDown
            size={13}
            color={palette.icon}
            aria-hidden
            style={{
              flexShrink:0, marginTop:3,
              transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s ease",
            }}/>
        </button>

        {/* Expanded panel */}
        {isExpanded && (
          <div id={`flag-detail-${f.id}`} className="px-3 pb-3">
            {/* — Source / Reasoning ─────────────────────────────────────── */}
            <div style={{ paddingTop:8, borderTop:`1px dashed ${palette.border}` }}>
              <span style={{
                fontSize:"0.56rem", fontWeight:800, color:palette.text,
                textTransform:"uppercase", letterSpacing:"0.08em",
              }}>
                Source / Reasoning
              </span>
              <p style={{ fontSize:"0.70rem", color:TM, marginTop:4, lineHeight:1.5 }}>
                {f.source}
              </p>
            </div>

            {/* — Action Item (red flags only) ───────────────────────────── */}
            {f.actionItem && <ActionItemBlock flag={f} action={f.actionItem} onClick={() => onActionClick?.(f)}/>}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
      <div className="flex items-center justify-between">
        <span style={{
          fontSize:"0.6rem", fontWeight:800, color:TT,
          textTransform:"uppercase", letterSpacing:"0.1em",
        }}>
          Review Flags
        </span>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5"
            style={{ fontSize:"0.62rem", fontWeight:700, color:GREEN }}>
            <span style={{ width:6, height:6, borderRadius:"50%", background:GREEN }}/>
            {green.length} green
          </span>
          <span className="inline-flex items-center gap-1.5"
            style={{ fontSize:"0.62rem", fontWeight:700, color:RED }}>
            <span style={{ width:6, height:6, borderRadius:"50%", background:RED }}/>
            {red.length} red
          </span>
        </div>
      </div>

      {/* Red flags first (prominence) */}
      {red.length > 0 && (
        <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
          {red.map(renderFlag)}
        </div>
      )}
      {/* Green flags */}
      {green.length > 0 && (
        <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
          {green.map(renderFlag)}
        </div>
      )}
    </div>
  );
}

// ─── ActionItemBlock ─────────────────────────────────────────────────────────
// Renders the Gap → Required Action → Owner mapping plus a primary CTA.
function ActionItemBlock({
  flag, action, onClick,
}: {
  flag: ReviewFlag;
  action: ReviewFlagAction;
  onClick: () => void;
}) {
  const owner = OWNER_CFG[action.assignedOwner];

  const Step = ({
    label, icon, text, textColor = NAVY, valueBg = "white",
  }: {
    label: string;
    icon: React.ReactNode;
    text: string;
    textColor?: string;
    valueBg?: string;
  }) => (
    <div className="flex items-start gap-2 px-2.5 py-2"
      style={{ background:valueBg, border:`1px solid ${BDL}`, borderRadius:6 }}>
      <span className="inline-flex items-center justify-center shrink-0"
        style={{ width:18, height:18, marginTop:1 }}>
        {icon}
      </span>
      <div className="flex-1 min-w-0">
        <span style={{
          fontSize:"0.55rem", fontWeight:800, color:TT,
          textTransform:"uppercase", letterSpacing:"0.08em", display:"block",
        }}>
          {label}
        </span>
        <p style={{ fontSize:"0.7rem", color:textColor, lineHeight:1.4, marginTop:1, fontWeight:600 }}>
          {text}
        </p>
      </div>
    </div>
  );

  return (
    <div className="mt-3" role="group"
      aria-label={`Action required: ${action.requiredAction}, assigned to ${owner.label}`}>
      {/* Section header */}
      <div className="flex items-center justify-between mb-2 pt-2"
        style={{ borderTop:`1px solid #F5C6CB` }}>
        <span className="inline-flex items-center gap-1.5"
          style={{
            fontSize:"0.58rem", fontWeight:800, color:RED,
            textTransform:"uppercase", letterSpacing:"0.09em",
          }}>
          <AlertCircle size={11}/>
          Suggested Action Item
        </span>
        <span style={{
          fontSize:"0.55rem", fontWeight:700, color:TT,
          letterSpacing:"0.04em",
        }}>
          Gap&nbsp;→&nbsp;Action&nbsp;→&nbsp;Owner
        </span>
      </div>

      {/* Mapping chain */}
      <div className="flex flex-col">
        <Step
          label="Identified Gap"
          icon={<AlertCircle size={12} color={RED}/>}
          text={action.gap}/>
        <div className="flex justify-center" aria-hidden style={{ padding:"3px 0" }}>
          <ArrowDown size={11} color={TT}/>
        </div>
        <Step
          label="Required Action"
          icon={<Upload size={12} color={BLUE}/>}
          text={action.requiredAction}/>
        <div className="flex justify-center" aria-hidden style={{ padding:"3px 0" }}>
          <ArrowDown size={11} color={TT}/>
        </div>
        <Step
          label="Assigned Owner"
          icon={
            <span className="inline-flex items-center justify-center"
              style={{
                width:18, height:18, borderRadius:4,
                background:owner.bg, color:owner.color,
                border:`1px solid ${owner.border}`,
              }}>
              {owner.icon}
            </span>
          }
          text={owner.label}
          textColor={owner.color}/>
      </div>

      {/* Primary CTA */}
      <button
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        aria-label={`${action.ctaLabel ?? "Take Action"}: ${action.requiredAction}, assigned to ${owner.label}`}
        className="w-full mt-3 inline-flex items-center justify-between gap-2 px-3 py-2 transition-all hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2"
        style={{
          background:RED, color:"white", border:"none", borderRadius:6,
          fontSize:"0.72rem", fontWeight:700, cursor:"pointer", fontFamily:font,
          boxShadow:"0 2px 6px rgba(185,28,28,0.25)",
        }}>
        <span className="inline-flex items-center gap-2">
          <AlertTriangle size={12}/>
          {action.ctaLabel ?? "Take Action"}: {action.requiredAction}
        </span>
        <ChevronRight size={14}/>
      </button>

      {/* Re-state owner mapping in plain text for screen readers */}
      <p className="sr-only">
        Mapping for flag &quot;{flag.title}&quot;: gap &quot;{action.gap}&quot; resolves to action &quot;{action.requiredAction}&quot; assigned to {owner.label}.
      </p>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
//   <CompanionSuggestions />
// ═════════════════════════════════════════════════════════════════════════════
export function CompanionSuggestions({
  companions,
  onAdd,
  onTrigger,
}: {
  companions: CompanionSuggestion[];
  onAdd?: (c: CompanionSuggestion) => void;
  onTrigger?: (c: CompanionSuggestion) => void;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [added, setAdded]           = useState<Set<string>>(new Set());

  const handleAdd = (c: CompanionSuggestion) => {
    setAdded(prev => {
      const next = new Set(prev);
      next.add(c.id);
      return next;
    });
    onAdd?.(c);
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:9 }}>
      <div className="flex items-center justify-between">
        <span style={{
          fontSize:"0.6rem", fontWeight:800, color:TT,
          textTransform:"uppercase", letterSpacing:"0.1em",
        }}>
          Companion Suggestions
        </span>
        <span style={{ fontSize:"0.62rem", color:TT, fontWeight:600 }}>
          {companions.length} recommended
        </span>
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        {companions.map(c => {
          const isExpanded = expandedId === c.id;
          const isAdded    = added.has(c.id);

          return (
            <div key={c.id}
              style={{
                background:"white",
                border:`1px solid ${BDL}`,
                borderLeft:`3px solid ${BLUE}`,
                borderRadius:8,
                padding:"11px 12px",
                fontFamily:font,
              }}>
              <div className="flex items-start gap-3">
                <span className="inline-flex items-center justify-center shrink-0"
                  style={{
                    width:36, height:36, borderRadius:6,
                    background:"#EBF0FB", color:BLUE,
                    fontSize:"0.66rem", fontWeight:800,
                    letterSpacing:"0.04em",
                  }}>
                  {c.code}
                </span>
                <div className="flex-1 min-w-0">
                  <p style={{ fontSize:"0.82rem", fontWeight:700, color:NAVY, lineHeight:1.3 }}>
                    {c.name}
                  </p>
                  <p style={{ fontSize:"0.71rem", color:TM, marginTop:3, lineHeight:1.45 }}>
                    {c.teaser}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setExpandedId(isExpanded ? null : c.id)}
                aria-expanded={isExpanded}
                aria-controls={`companion-reasoning-${c.id}`}
                className="inline-flex items-center gap-1 mt-2.5"
                style={{
                  background:"none", border:"none", padding:0, cursor:"pointer",
                  fontSize:"0.68rem", fontWeight:700, color:BLUE,
                  fontFamily:font, borderRadius:6,
                }}>
                {isExpanded ? "Hide reasoning" : "View reasoning"}
                <ChevronDown size={12}
                  style={{
                    transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform 0.2s",
                  }}/>
              </button>

              {isExpanded && (
                <div id={`companion-reasoning-${c.id}`}
                  className="mt-2 px-3 py-2.5"
                  style={{
                    background:"#F7F9FC",
                    border:`1px solid ${BDL}`,
                    borderRadius:6,
                  }}>
                  <span style={{
                    fontSize:"0.56rem", fontWeight:800, color:TT,
                    textTransform:"uppercase", letterSpacing:"0.08em",
                  }}>
                    Underwriter rationale
                  </span>
                  <p style={{ fontSize:"0.72rem", color:TM, marginTop:4, lineHeight:1.55 }}>
                    {c.reasoning}
                  </p>
                </div>
              )}

              <div className="flex items-center gap-2 mt-3 flex-wrap">
                <button
                  onClick={() => !isAdded && handleAdd(c)}
                  disabled={isAdded}
                  aria-label={isAdded ? `${c.code} added to submission` : `Add ${c.code} to submission`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 transition-all"
                  style={{
                    background: isAdded ? "#E8F5EC" : BLUE,
                    color:      isAdded ? GREEN     : "white",
                    border: isAdded ? "1px solid #BFE2CB" : "none",
                    borderRadius: 6,
                    fontSize: "0.72rem", fontWeight: 700,
                    cursor: isAdded ? "default" : "pointer",
                    fontFamily: font,
                  }}>
                  {isAdded
                    ? <><CheckCircle2 size={12}/> Added to submission</>
                    : <><Plus size={12}/> Add to Submission</>}
                </button>
                <button
                  onClick={() => onTrigger?.(c)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5"
                  style={{
                    background:"white", color:TM,
                    border:`1px solid ${BDL}`,
                    borderRadius:6,
                    fontSize:"0.72rem", fontWeight:600,
                    cursor:"pointer",
                    fontFamily:font,
                  }}>
                  <FileText size={12}/>
                  Trigger Application
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
//   <UnderwritingChatAssistant />
// ═════════════════════════════════════════════════════════════════════════════
export function UnderwritingChatAssistant({
  payload = MOCK_PAYLOAD,
}: {
  payload?: AssistantPayload;
}) {
  return (
    <div
      role="region"
      aria-label="Automated underwriting review"
      style={{
        background:"white",
        border:`1px solid ${BDL}`,
        borderRadius:12,
        padding:14,
        fontFamily:font,
        display:"flex",
        flexDirection:"column",
        gap:14,
        boxShadow:"0 1px 3px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.04)",
      }}>
      <div className="flex items-start gap-2.5">
        <span className="inline-flex items-center justify-center shrink-0"
          style={{
            width:28, height:28, borderRadius:"50%",
            background:`linear-gradient(135deg, ${NAVY}, ${BLUE})`,
            color:"white",
          }}>
          <Sparkles size={14}/>
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span style={{ fontSize:"0.72rem", fontWeight:800, color:NAVY }}>
              UW Companion
            </span>
            <span style={{
              fontSize:"0.55rem", fontWeight:800, color:BLUE,
              background:"#EBF0FB", padding:"2px 6px", borderRadius:4,
              textTransform:"uppercase", letterSpacing:"0.07em",
            }}>
              Auto-Review Complete
            </span>
          </div>
          <p style={{ fontSize:"0.78rem", color:TM, lineHeight:1.5, marginTop:5 }}>
            {payload.summary}
          </p>
        </div>
      </div>

      <div style={{ height:1, background:BDL }}/>

      <DimensionalReview dimensions={payload.dimensions}/>

      <div style={{ height:1, background:BDL }}/>

      <ReviewFlags flags={payload.flags}/>

      <div style={{ height:1, background:BDL }}/>

      <CompanionSuggestions companions={payload.companions}/>
    </div>
  );
}
