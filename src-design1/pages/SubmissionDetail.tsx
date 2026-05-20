import { AuditTrailTab }    from "../components/tabs/AuditTrailTab";
import { ApprovalsTab }    from "../components/tabs/ApprovalsTab";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useAuth } from "../context/AuthContext";
import {
  GraduationCap,
  LayoutDashboard, Users, ShieldAlert, TrendingDown,
  FolderOpen, MessageSquare, Mail,
  ClipboardCheck, Clock, Calculator, CheckSquare,
  ShieldCheck, UserCheck, Briefcase, Globe, Lock, Car,
  Building2, Shield, ThumbsUp,
  TrendingUp, Activity, Flag, Calendar, User, Check,
  ChevronRight,
} from "lucide-react";
import { OverviewTab }     from "../components/tabs/OverviewTab";
import { MemberBrokerTab } from "../components/tabs/MemberBrokerTab";
import { RiskTab }         from "../components/tabs/RiskTab";
import { RatingTab }       from "../components/tabs/RatingTab";
import { LossTab }         from "../components/tabs/LossTab";
import { DocumentsTab }    from "../components/tabs/DocumentsTab";
import { NotesTab }        from "../components/tabs/NotesTab";
import { TasksTab }        from "../components/tabs/TasksTab";
import { CorrespondenceTab, buildSeedThreads } from "../components/tabs/CorrespondenceTab";
import { UnderwritingReviewTab } from "../components/tabs/UnderwritingReviewTab";
import { AppShell }        from "../components/AppShell";
import type { RoleId }     from "../components/AppShell";
import { PageRegister }    from "../components/companion/PageRegister";
import { newId, now }      from "../components/companion/CompanionContext";
import type { Suggestion, CompanionMsg } from "../components/companion/CompanionContext";
import { PrimaryButton } from "../components/DashboardCards";
import { SubmissionWorkspaceProvider, useSubmissionWorkspace } from "../context/SubmissionWorkspaceContext";

const N    = "#0123D4";
const G    = "#C9A227";
const BD   = "#C4CDD8";
const BDL  = "#DCE3EC";
const TT   = "#7A8FA3";
const TM   = "#4A5D6E";
const font = "'Source Sans 3', system-ui, sans-serif";

/* ── Product line display catalog (for hero strip) ───────────────────────── */
const PRODUCT_DISPLAY: Record<string, { abbr: string; icon: React.ReactNode; color: string }> = {
  epl:     { abbr: "EPL",   icon: <UserCheck  size={11}/>, color: N          },
  ell:     { abbr: "ELL",   icon: <ShieldCheck size={11}/>, color: N         },
  gl:      { abbr: "GL",    icon: <Shield     size={11}/>, color: N          },
  ml:      { abbr: "ML",    icon: <Briefcase  size={11}/>, color: N          },
  property:{ abbr: "Prop",  icon: <Building2  size={11}/>, color: "#1A7A4A"  },
  auto:    { abbr: "Auto",  icon: <Car        size={11}/>, color: "#1A7A4A"  },
  crime:   { abbr: "Crime", icon: <Lock       size={11}/>, color: "#7B2FBE"  },
  cyber:   { abbr: "Cyber", icon: <Globe      size={11}/>, color: "#7B2FBE"  },
  student: { abbr: "SA",    icon: <Users      size={11}/>, color: "#7B2FBE"  },
};

/* ── Submission data (single source of truth for header) ─────────────────── */
const SUBMISSION = {
  id:              "SUB-7829",
  institutionName: "Brookfield Day School",
  memberNumber:    "473",
  institutionNum:  "ACC-1029",
  memberSince:     "2014",
  memberType:      "Private K-12",
  enrollment:      "842 students",
  location:        "Westport, CT",
  submittedDate:   "March 15, 2024",
  brokerageRef:    "IMA Financial Group",
  brokerageName:   "Gallagher Education, Inc.",
  needByDate:      "Apr 28, 2026",
  needByUrgency:   "7 days",
  effectiveDate:   "Jun 1, 2026",
  expiryDate:      "Jun 1, 2027",
  expiringPremium: "$132,400",
  expiringNote:    "2025 policy",
  quotedPremium:   "$142,800",
  quotedNote:      "+7.8% indicated",
  boundPremium:    "—",
  boundNote:       "Not yet bound",
  lossRatio:       "58%",
  lossRatioNote:   "2 open claims",
  brokerage:       "Marsh McLennan",
  brokerContact:   "T. Owens",
  underwriter:     { name: "Maya Khanna",   title: "Sr. UW · Northeast" },
  uwSpecialist:    { name: "Devon Carter",  title: "Assistant UW"       },
  productLines:    ["epl", "ell", "gl", "cyber"],
};

/* ── Derived: policy year label (e.g. "2026–27") from effective date ─────── */
const POLICY_YEAR_LABEL = (() => {
  const y = new Date(SUBMISSION.effectiveDate).getFullYear();
  return Number.isFinite(y) ? `${y}–${String(y + 1).slice(-2)}` : "—";
})();

/* ── Semantic colors reused from existing tokens in this file ─────────────── */
const POSITIVE = "#2E7D32"; // good/positive (already used in stat grid)
const DANGER   = "#C0392B"; // warning/danger (already used for need-by)
const CAUTION  = "#B45309"; // caution/amber (already used in pages)

/* ── Companion tab-pack: per-tab suggestions, respond, freeText, facts ─────
 * The companion adapts to the currently visible tab so suggestions feel
 * "page-aware" — e.g. on Rating you get rate-band questions, on Loss you
 * get claim/severity questions, etc. */
function buildTabPack(tab: string, S: typeof SUBMISSION, subId: string) {
  const TAB_LABELS: Record<string, string> = {
    overview: "Overview", member: "Member & Broker", documents: "Documents", correspondence: "Correspondence",
    audit: "Audit Trail", "uw-review": "Underwriting Review", review: "UW Review", risk: "Risk", loss: "Loss History",
    rating: "Rating", notes: "Notes", tasks: "Tasks", approvals: "Approvals",
  };
  const tabLabel = TAB_LABELS[tab] ?? "Submission";

  switch (tab) {
    case "rating": return {
      tabLabel,
      greeting: `Rating workspace for ${S.institutionName}. Expiring ${S.expiringPremium} → indicated ${S.quotedPremium} (${S.quotedNote}). Ask me about rate-band positioning, loss-ratio adjustments, or commission impact.`,
      suggestions: [
        { id: "rate-band",     label: "Where is each line vs UE rate band?", tone: "blue",   icon: "Activity" },
        { id: "explain-delta", label: `Explain the ${S.quotedNote} delta`,    tone: "gold",   icon: "TrendingUp" },
        { id: "loss-impact",   label: "How is loss ratio shaping the rate?",  tone: "red",    icon: "AlertTriangle" },
        { id: "commission-fx", label: "Impact of moving commission ±1%",      tone: "violet", icon: "DollarSign" },
        { id: "referral-trig", label: "Any authority/referral triggers?",     tone: "gold",   icon: "Flag" },
        { id: "five-options",  label: "Suggest 5 options based on product",   tone: "violet", icon: "Sparkles" },
      ] as Suggestion[],
      respond: (sid: string): CompanionMsg[] | undefined => {
        if (sid === "rate-band") return [{ id: newId(), role: "agent", kind: "text", ts: now(),
          text: `Across ${S.productLines.join(", ").toUpperCase()}: GL & EPL inside the manual band (0.92–1.12×); ELL pressing the upper edge given ${S.lossRatio} 5-yr LR and ${S.lossRatioNote}; Cyber comfortably credit-side if MFA/EDR/offline backups are documented.` }];
        if (sid === "explain-delta") return [{ id: newId(), role: "agent", kind: "text", ts: now(),
          text: `The ${S.quotedNote} delta on ${S.expiringPremium} comes mostly from ELL (claim development on the open files) and a modest GL rate adequacy adjustment. Property and Cyber are flat-to-credit. Want a per-line breakdown?` }];
        if (sid === "loss-impact") return [{ id: newId(), role: "agent", kind: "viz", ts: now(), viz: {
          kind: "linecard", title: `${S.id} · loss ratio (6Y)`,
          intro: `6-yr loss ratio history. ${S.lossRatioNote} — two open files are still developing reserves.`,
          data: [
            { label: "PY-5", value: 42 }, { label: "PY-4", value: 51 }, { label: "PY-3", value: 49 },
            { label: "PY-2", value: 54 }, { label: "PY-1", value: 61 }, { label: "Cur", value: 58 },
          ],
          yFormat: "percent", cta: "add-to-dashboard", ctaLabel: "Pin to Rating tab", dashboardHref: `/submission/${subId}`,
        } }];
        if (sid === "commission-fx") return [{ id: newId(), role: "agent", kind: "text", ts: now(),
          text: `On ${S.quotedPremium} pre-commission, ±1% commission swings broker take by ~$1,430. Cutting from 12.5% → 11.5% drops broker comp to ~$16,420 — Marsh tier-1 typically requires Producer Relations sign-off below 12.5% on sub-$200K accounts.` }];
        if (sid === "referral-trig") return [{ id: newId(), role: "agent", kind: "text", ts: now(),
          text: `Authority check: ${S.quotedPremium} indicated total is under the $750K referral threshold. Per-line factors all ≤1.18× (clear of the >1.20× referral). No open-claim reserves above $250K disclosed. You're inside authority — no referral required.` }];
        if (sid === "five-options") {
          const POOL: Record<string, { title: string; detail: string }[]> = {
            ell: [
              { title: "ELL · Tighten retention $50K → $75K", detail: "~6% premium relief; ELL claim development supports the move." },
              { title: "ELL · Apply Title IX credit",         detail: "−3% credit if mandatory harassment training is current and documented." },
            ],
            epl: [
              { title: "EPL · Outside-limit defense",         detail: "Member-side win; UE charges +8–12% for outside-limit defense on K-12." },
              { title: "EPL · Retention $25K → $50K",         detail: "~6% premium relief; defensible on the current loss-free EPL track record." },
            ],
            gl: [
              { title: "GL · Raise SIR $50K → $75K",          detail: "Typical 5–7% relief on K-12 GL; playground inspection history supports it." },
              { title: "GL · Risk-Management credit",         detail: "−5% if faculty completed UE's slip/fall e-learning; pull the training roster to confirm." },
            ],
            cyber: [
              { title: "Cyber · MFA credit",                  detail: "Verify MFA on email + admin systems to claim the standard 10% MFA credit." },
              { title: "Cyber · Ransomware sublimit",         detail: "Confirm offline backups tested in last 90 days; unlocks higher ransomware sublimit." },
            ],
            ml: [{ title: "ML · Social media endorsement", detail: "Closes a common gap for school comms / coach social accounts." }],
            property: [{ title: "Property · Sprinkler credit", detail: "Claim the 5% sprinklered credit — 94% coverage qualifies." }],
            auto: [{ title: "Auto · Telematics credit", detail: "Apply if any GPS/dash-cam program in place on the fleet." }],
            crime: [{ title: "Crime · Dual-control credit", detail: "Confirm dual-control on wires above $25K for the standard crime credit." }],
            student: [{ title: "SA · Exclude tackle football", detail: "Saves ~8% on the line; only safe if tackle is not offered." }],
          };
          const lines = S.productLines.map(p => p.toLowerCase());
          const queues = lines.map(l => [...(POOL[l] ?? [])]);
          const picked: { title: string; detail: string }[] = [];
          while (picked.length < 5 && queues.some(q => q.length)) {
            for (const q of queues) {
              if (picked.length >= 5) break;
              const next = q.shift();
              if (next) picked.push(next);
            }
          }
          return [{
            id: newId(), role: "agent", kind: "viz", ts: now(), viz: {
              kind: "checklist",
              title: `5 option ideas · ${lines.map(l => l.toUpperCase()).join(" · ")}`,
              items: picked.slice(0, 5).map(o => ({ ok: false, label: o.title, sub: o.detail })),
            },
          }];
        }
        return undefined;
      },
      freeText: (text: string): CompanionMsg[] | undefined => {
        const t = text.toLowerCase();
        if (/\b(factor|band|rate)\b/.test(t)) return [{ id: newId(), role: "agent", kind: "text", ts: now(),
          text: `Per-line factors today: GL 1.05×, ELL 1.16× (upper edge), Property 0.98×, EPL 1.02×, Cyber 0.88×. ELL is the line to defend — recommend documenting the claim-reserve sensitivity in the file.` }];
        if (/\b(sir|retention|deductible)\b/.test(t)) return [{ id: newId(), role: "agent", kind: "text", ts: now(),
          text: `Current SIR is $50K. Moving GL SIR to $75K typically buys 5–7% premium relief on a school of this size; defensible given the ${S.lossRatio} loss ratio.` }];
        return undefined;
      },
      extraFacts: () => `Per-line factors snapshot (GL 1.05×, ELL 1.16×, Property 0.98×, EPL 1.02×, Cyber 0.88×). Commission tier: 12.5%. SIR: $50K.`,
    };

    case "risk": return {
      tabLabel,
      greeting: `Risk view for ${S.institutionName}. Ask me about exposure, COPE, sprinklers, or red-flag items in the COPE narrative.`,
      suggestions: [
        { id: "exposure-summary", label: "Summarize key exposures",     tone: "blue", icon: "Shield" },
        { id: "cope-flags",       label: "Any COPE red flags?",         tone: "red",  icon: "AlertTriangle" },
        { id: "sprinkler",        label: "Sprinkler / Property credit", tone: "gold", icon: "ShieldCheck" },
        { id: "geo-conc",         label: "Geographic concentration",    tone: "blue", icon: "Globe" },
      ] as Suggestion[],
      respond: (sid: string): CompanionMsg[] | undefined => {
        if (sid === "exposure-summary") return [{ id: newId(), role: "agent", kind: "text", ts: now(),
          text: `Key exposures for ${S.institutionName}: ${S.enrollment} day-students; 4-building campus; mixed masonry/JM construction; outdoor athletics including soccer & track (no tackle football). Cyber exposure: standard K-12 SaaS stack with PowerSchool + Google Workspace.` }];
        if (sid === "cope-flags") return [{ id: newId(), role: "agent", kind: "text", ts: now(),
          text: `Two COPE flags: (1) Jefferson building HVAC system is 27 years old and not budgeted for replacement — recommend subjectivity. (2) Sprinkler coverage at 94% — one wing of the lower school is unsprinklered.` }];
        if (sid === "sprinkler") return [{ id: newId(), role: "agent", kind: "text", ts: now(),
          text: `94% sprinklered qualifies for the standard 5% Property credit. To capture the full 8% credit you'd need 100% coverage and a current inspection within 12 months.` }];
        if (sid === "geo-conc") return [{ id: newId(), role: "agent", kind: "text", ts: now(),
          text: `Single-location risk in ${S.location}. No geo-spread; wind/hail exposure is Northeast-CT moderate. No coastal aggregation concerns.` }];
        return undefined;
      },
    };

    case "loss": return {
      tabLabel,
      greeting: `Loss history for ${S.institutionName} — 6-yr LR ${S.lossRatio} (${S.lossRatioNote}). Ask about open files, severity, or trend.`,
      suggestions: [
        { id: "open-claims",  label: "Open claim detail",         tone: "red",  icon: "AlertTriangle" },
        { id: "lr-trend",     label: "6-year loss ratio trend",   tone: "blue", icon: "Activity" },
        { id: "severity",     label: "Severity vs frequency",     tone: "gold", icon: "TrendingUp" },
        { id: "claim-types",  label: "Loss by coverage line",     tone: "blue", icon: "ChartPie" },
      ] as Suggestion[],
      respond: (sid: string): CompanionMsg[] | undefined => {
        if (sid === "open-claims") return [{ id: newId(), role: "agent", kind: "viz", ts: now(), viz: {
          kind: "checklist", title: `${S.id} · open claims`,
          items: [
            { ok: false, label: "CLM-2023-014 · ELL · mediation pending", sub: "Reserve $145K" },
            { ok: false, label: "CLM-2024-007 · GL · slip-and-fall",       sub: "Reserve $42K"  },
          ],
        } }];
        if (sid === "lr-trend") return [{ id: newId(), role: "agent", kind: "viz", ts: now(), viz: {
          kind: "linecard", title: `${S.id} · 6Y loss ratio`,
          data: [
            { label: "PY-5", value: 42 }, { label: "PY-4", value: 51 }, { label: "PY-3", value: 49 },
            { label: "PY-2", value: 54 }, { label: "PY-1", value: 61 }, { label: "Cur", value: 58 },
          ],
          yFormat: "percent", cta: "add-to-dashboard", ctaLabel: "Pin to Loss tab", dashboardHref: `/submission/${subId}`,
        } }];
        if (sid === "severity") return [{ id: newId(), role: "agent", kind: "text", ts: now(),
          text: `4 claims in the last 6 years. Severity skewed by the 2023 ELL file ($145K reserve). Frequency is normal for a K-12 day school of this size; severity is the watch-item.` }];
        if (sid === "claim-types") return [{ id: newId(), role: "agent", kind: "viz", ts: now(), viz: {
          kind: "donut", title: "Loss by coverage line",
          segments: [
            { label: "ELL", value: 165, color: "#7B2FBE" },
            { label: "GL",  value: 78,  color: N },
            { label: "EPL", value: 22,  color: "#0E5C36" },
            { label: "Property", value: 11, color: G },
          ],
          cta: "add-to-dashboard", ctaLabel: "Pin to Loss tab", dashboardHref: `/submission/${subId}`,
        } }];
        return undefined;
      },
    };

    case "documents": return {
      tabLabel,
      greeting: `Documents tab. ${S.institutionName} (${subId}) — I can check what's missing, what's expiring, or draft a request to ${S.brokerContact}.`,
      suggestions: [
        { id: "doc-status",     label: "What's still missing?",       tone: "red",    icon: "AlertTriangle" },
        { id: "expiring-docs",  label: "Anything expiring soon?",     tone: "gold",   icon: "Clock" },
        { id: "request-docs",   label: "Draft a document request",    tone: "violet", icon: "Mail" },
      ] as Suggestion[],
      respond: (sid: string): CompanionMsg[] | undefined => {
        if (sid === "doc-status") return [{ id: newId(), role: "agent", kind: "viz", ts: now(), viz: {
          kind: "checklist", title: `${subId} · document readiness`,
          items: [
            { ok: true,  label: "ACORD application on file" },
            { ok: true,  label: "6-year loss runs received" },
            { ok: true,  label: "COPE / Schedule of Locations" },
            { ok: false, label: "Safety questionnaire missing", sub: "Request from broker" },
            { ok: false, label: "SIR actuarial opinion pending",  sub: "Outstanding" },
          ],
        } }];
        if (sid === "expiring-docs") return [{ id: newId(), role: "agent", kind: "text", ts: now(),
          text: `Two docs to refresh before quote: sprinkler inspection (last dated 14 months ago) and the cyber security attestation (renewable annually).` }];
        return undefined;
      },
    };

    case "correspondence": return {
      tabLabel,
      greeting: `Correspondence with ${S.brokerage}. Last broker contact: ${S.brokerContact}. Ask me to summarize the thread, draft a reply, or surface unanswered asks.`,
      suggestions: [
        { id: "summarize-thread", label: "Summarize this thread",     tone: "blue",   icon: "Sparkles" },
        { id: "unanswered",       label: "Any open asks from broker?", tone: "red",   icon: "AlertTriangle" },
        { id: "draft-reply",      label: "Draft a follow-up reply",   tone: "violet", icon: "Mail" },
      ] as Suggestion[],
    };

    case "notes": return {
      tabLabel,
      greeting: `Notes for ${S.institutionName}. Ask me to summarize recent notes, draft a new one, or surface unresolved items.`,
      suggestions: [
        { id: "summarize-notes", label: "Summarize all notes",        tone: "blue",   icon: "Sparkles" },
        { id: "open-items",      label: "Unresolved items in notes",  tone: "red",    icon: "AlertTriangle" },
        { id: "draft-note",      label: "Draft a UW file note",       tone: "violet", icon: "FileText" },
      ] as Suggestion[],
    };

    case "tasks": return {
      tabLabel,
      greeting: `Tasks for ${subId}. Need-by ${S.needByDate} (${S.needByUrgency}). What should we focus on?`,
      suggestions: [
        { id: "top-priority", label: "Top 3 priorities right now", tone: "red",    icon: "Flag" },
        { id: "due-today",    label: "Anything due today?",        tone: "gold",   icon: "Clock" },
        { id: "draft-task",   label: "Add a new task",             tone: "violet", icon: "Plus" },
      ] as Suggestion[],
    };

    case "approvals": return {
      tabLabel,
      greeting: `Approvals workspace. I can flag what needs senior sign-off and route requests.`,
      suggestions: [
        { id: "needs-approval", label: "What needs an approver?",      tone: "red",    icon: "Flag" },
        { id: "draft-rationale", label: "Draft an approval rationale", tone: "violet", icon: "FileText" },
        { id: "authority-check", label: "Am I inside authority?",      tone: "blue",   icon: "ShieldCheck" },
      ] as Suggestion[],
    };

    case "audit": return {
      tabLabel,
      greeting: `Audit trail for ${subId}. Ask about recent changes, who touched what, or compliance gaps.`,
      suggestions: [
        { id: "recent-changes", label: "Recent changes (last 7 days)", tone: "blue", icon: "Activity" },
        { id: "compliance",     label: "Any compliance gaps?",         tone: "red",  icon: "AlertTriangle" },
      ] as Suggestion[],
    };

    case "member": return {
      tabLabel,
      greeting: `Member & broker info for ${S.institutionName} (M${S.memberNumber}). Ask about history, broker relationship, or peer comparisons.`,
      suggestions: [
        { id: "member-history", label: "Member history with UE",   tone: "blue",   icon: "User" },
        { id: "broker-tier",    label: `${S.brokerage} tier & book`, tone: "gold", icon: "Briefcase" },
        { id: "peer-compare",   label: "Peers with similar profile", tone: "violet", icon: "Users" },
      ] as Suggestion[],
    };

    default: return {
      tabLabel,
      greeting: `Reading ${S.institutionName} (${subId}): expiring ${S.expiringPremium}, indicated ${S.quotedPremium}, loss ratio ${S.lossRatio}. Want a summary, a broker draft, or a gap check?`,
      suggestions: [
        { id: "summary",      label: "Summarize this submission",   tone: "blue",   icon: "Sparkles" },
        { id: "draft-broker", label: "Draft broker email",          tone: "violet", icon: "Mail" },
        { id: "open-quote",   label: "Open Quote Builder",          tone: "gold",   icon: "FileText", navigateTo: `/submission/${subId}/quote` },
        { id: "checklist",    label: "What's still missing?",       tone: "red",    icon: "AlertTriangle" },
        { id: "loss-ratio",   label: "Why is loss ratio elevated?", tone: "gold",   icon: "Activity" },
      ] as Suggestion[],
    };
  }
}

/* ── Stage groups (mirrors LifecycleProgressBar's DEFAULT_LIFECYCLE) ───── */
const STAGE_GROUPS: { group: string; color: string; options: string[] }[] = [
  { group: "Intake & Triage", color: "#7A8FA3", options: ["Incomplete Submission", "Complete Submission", "Declined to Quote"] },
  { group: "Underwriting",    color: N,         options: ["Information Gathering", "Review In Progress", "Referred"] },
  { group: "Quoting",         color: "#7B2FBE", options: ["Quote In Progress", "Quote Sent", "Quote Negotiation", "Revised Quote"] },
  { group: "Decision",        color: "#1A7A4A", options: ["Bound", "UE Non-Renewed", "Member Declined", "Member No Response"] },
  { group: "Post-Bind",       color: G,         options: ["Pending Issuance", "Issued", "Cancelled", "Endorsed"] },
];

function stageColor(stage: string) {
  return STAGE_GROUPS.find(g => g.options.includes(stage))?.color ?? "#7A8FA3";
}
function groupForStage(stage: string) {
  return STAGE_GROUPS.find(g => g.options.includes(stage))?.group ?? "";
}

const TABS = [
  {id:"overview",      label:"Overview",           icon:<LayoutDashboard size={14}/>},
  {id:"member",        label:"Member & Brokerage", icon:<Users size={14}/>},
  {id:"risk",          label:"Risk & Exposure",    icon:<ShieldAlert size={14}/>},
  {id:"loss",          label:"Loss History",       icon:<TrendingDown size={14}/>},
  {id:"documents",     label:"Documents",          icon:<FolderOpen size={14}/>},
  {id:"rating",        label:"Rating",             icon:<Calculator size={14}/>},
  {id:"correspondence",label:"Correspondence",     icon:<Mail size={14}/>},
  {id:"notes",         label:"Notes",              icon:<MessageSquare size={14}/>},
  {id:"tasks",         label:"Tasks",              icon:<CheckSquare size={14}/>},
  {id:"approvals",     label:"Approvals",          icon:<ThumbsUp size={14}/>},
  {id:"audit",         label:"Audit Trail",        icon:<Clock size={14}/>},
];

/* ── StatCell: icon tile + uppercase micro-label · value · subtitle ──────── */
function StatCell({
  icon, label, value, valueColor, sub, subColor, isLast,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  valueColor?: string;
  sub?: React.ReactNode;
  subColor?: string;
  isLast?: boolean;
}) {
  return (
    <div className="relative flex items-center gap-2 px-3 sm:px-4 py-3 min-w-0">
      <div
        className="flex items-center justify-center shrink-0"
        style={{ width: 24, height: 24, background: "#F0F3F8", borderRadius: 4 }}
      >
        {icon}
      </div>
      <div className="min-w-0 flex flex-col gap-0.5">
        <span
          style={{
            fontSize: "0.56rem", fontWeight: 700, color: TT,
            textTransform: "uppercase", letterSpacing: "0.10em", lineHeight: 1.2,
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontSize: "0.86rem", fontWeight: 700,
            color: valueColor ?? "#1A2530", lineHeight: 1.25,
            wordBreak: "break-word",
          }}
        >
          {value}
        </span>
        {sub && (
          <span
            style={{
              fontSize: "0.66rem", color: subColor ?? TT, lineHeight: 1.35,
              wordBreak: "break-word",
            }}
          >
            {sub}
          </span>
        )}
      </div>
      {/* Inset vertical divider between cells (matches existing border token) */}
      {!isLast && (
        <span
          aria-hidden
          style={{
            position: "absolute", right: 0, top: 10, bottom: 10,
            width: 1, background: BDL,
          }}
        />
      )}
    </div>
  );
}

/* ── Small user-avatar chip ─────────────────────────────────────────────── */
function UserChip({ initials, name }: { initials: string; name: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div
        className="flex items-center justify-center shrink-0"
        style={{
          width: 20, height: 20,
          background: "rgba(255,255,255,0.15)",
          border: "1px solid rgba(255,255,255,0.3)",
          fontSize: "0.50rem", fontWeight: 800,
          color: "white", letterSpacing: "0.02em",
        }}
      >
        {initials}
      </div>
      <span style={{ color: "white", fontSize: "0.88rem", fontWeight: 700 }}>{name}</span>
    </div>
  );
}

/* ── StageDropdown: grouped stage picker (Intake & Triage → Post-Bind) ───── */
function StageDropdown({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const color = stageColor(value);
  const group = groupForStage(value);

  return (
    <div ref={ref} style={{ position: "relative", maxWidth: 360 }}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        style={{
          width: "100%", display: "flex", alignItems: "center", gap: 10,
          padding: "9px 12px", border: `1px solid ${open ? N : BD}`,
          background: "white", cursor: "pointer", fontFamily: font, textAlign: "left",
          borderRadius: 6,
        }}
      >
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: "0.60rem", color: TT, display: "block", lineHeight: 1 }}>{group}</span>
          <span style={{ fontSize: "0.80rem", color: "#1A2530", fontWeight: 600 }}>{value}</span>
        </div>
        <Check size={0} style={{ display: "none" }} />
        <span style={{
          flexShrink: 0,
          transform: open ? "rotate(180deg)" : "rotate(0deg)",
          transition: "transform 0.15s", color: TT, display: "inline-flex",
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </span>
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0,
          background: "white", border: `1px solid ${BD}`, borderRadius: 6,
          boxShadow: "0 8px 24px rgba(0,0,0,0.12)", zIndex: 300,
          maxHeight: 340, overflowY: "auto",
        }}>
          {STAGE_GROUPS.map(g => (
            <div key={g.group}>
              <div style={{
                padding: "7px 12px 4px", background: "#F8FAFC",
                borderBottom: `1px solid ${BDL}`, borderTop: `1px solid ${BDL}`,
              }}>
                <span style={{ fontSize: "0.58rem", fontWeight: 800, color: g.color, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  {g.group}
                </span>
              </div>
              {g.options.map(opt => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => { onChange(opt); setOpen(false); }}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", gap: 10,
                    padding: "8px 14px 8px 20px",
                    background: value === opt ? `${g.color}10` : "transparent",
                    border: "none", cursor: "pointer", fontFamily: font, textAlign: "left",
                    borderBottom: `1px solid ${BDL}`,
                  }}
                  onMouseEnter={e => { if (value !== opt) e.currentTarget.style.background = "#F4F6FA"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = value === opt ? `${g.color}10` : "transparent"; }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: g.color, flexShrink: 0 }} />
                  <span style={{ fontSize: "0.78rem", color: value === opt ? g.color : TM, fontWeight: value === opt ? 700 : 400 }}>{opt}</span>
                  {value === opt && <Check size={12} color={g.color} style={{ marginLeft: "auto" }} />}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Underwriting Review (side nav + content) ─────────────────────────────── */
const UW_SUBTABS = [
  { id: "review",    label: "Review",          icon: <ClipboardCheck size={14}/> },
  { id: "risk",      label: "Risk & Exposure", icon: <ShieldAlert  size={14}/> },
  { id: "loss",      label: "Loss History",    icon: <TrendingDown size={14}/> },
  { id: "rating",    label: "Rating",          icon: <Calculator   size={14}/> },
  { id: "notes",     label: "Notes",           icon: <MessageSquare size={14}/> },
  { id: "tasks",     label: "Tasks",           icon: <CheckSquare  size={14}/> },
  { id: "approvals", label: "Approvals",       icon: <ThumbsUp     size={14}/> },
];


function UWReviewView({
  subTab, setSubTab, productLines,
}: {
  subTab: string;
  setSubTab: (id: string) => void;
  productLines: string[];
}) {
  const renderSub = () => {
    switch (subTab) {
      case "risk":      return <RiskTab/>;
      case "loss":      return <LossTab/>;
      case "rating":    return <RatingTab selectedProductIds={productLines}/>;
      case "notes":     return <NotesTab/>;
      case "tasks":     return <TasksTab/>;
      case "approvals": return <ApprovalsTab/>;
      case "review":    return <UnderwritingReviewTab/>;
      default:          return <UnderwritingReviewTab/>;
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* ── Top tab strip ────────────────────────────────────────────── */}
      <div
        style={{
          background: "white",
          border: `1px solid ${BDL}`,
          borderRadius: 8,
          padding: 6,
          boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
          display: "flex",
          gap: 4,
          overflowX: "auto",
        }}>
        {UW_SUBTABS.map(t => {
          const isActive = subTab === t.id;
          return (
            <button key={t.id}
              onClick={() => setSubTab(t.id)}
              aria-current={isActive ? "page" : undefined}
              className="flex items-center gap-2 transition-all shrink-0"
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.background = `${N}08`;
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.background = "transparent";
              }}
              style={{
                background: isActive ? `${N}0F` : "transparent",
                border: "none",
                borderBottom: `2px solid ${isActive ? N : "transparent"}`,
                borderRadius: 6,
                cursor: "pointer",
                fontFamily: font,
                padding: "7px 12px",
                transition: "background 0.2s ease, border-color 0.2s ease",
              }}>
              <span className="inline-flex items-center justify-center shrink-0"
                style={{
                  width: 22, height: 22, borderRadius: 5,
                  background: isActive ? `${N}15` : "#F0F3F8",
                  color: isActive ? N : TM,
                  transition: "background 0.2s ease",
                }}>
                {t.icon}
              </span>
              <span style={{
                fontSize: "0.78rem",
                fontWeight: isActive ? 700 : 500,
                color: isActive ? N : "#1A2530",
                lineHeight: 1.2,
                whiteSpace: "nowrap",
              }}>
                {t.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Content ──────────────────────────────────────────────────── */}
      <div style={{ minWidth: 0 }}>
        {renderSub()}
      </div>
    </div>
  );
}

export function SubmissionDetail() {
  // One-time seed for the workspace context — keeps the SAME object across renders.
  const initialThreads = useMemo(() => buildSeedThreads(), []);
  return (
    <SubmissionWorkspaceProvider initialThreads={initialThreads}>
      <SubmissionDetailInner/>
    </SubmissionWorkspaceProvider>
  );
}

function SubmissionDetailInner() {
  const navigate  = useNavigate();
  const { id: subIdFromUrl } = useParams<{ id: string }>();
  const { user }  = useAuth();
  // "uw-review" is the default landing page — its side nav exposes the
  // Risk/Loss/Rating/Notes/Tasks/Approvals workspace.
  const [activeTab, setActiveTab] = useState("uw-review");
  const [uwSubTab,  setUwSubTab]  = useState("review");
  // Single shared toggle for both Submission Snapshot + Quick Sections
  const [detailsOpen, setDetailsOpen] = useState(true);
  const [stage, setStage] = useState("Review In Progress");
  const { threads, registerTabChangeHandler, setActiveTab: setWorkspaceActiveTab } = useSubmissionWorkspace();

  // Mirror local activeTab into the workspace context (chatbot reads it).
  // When inside Underwriting Review, surface the inner sub-tab (risk/loss/rating/…)
  // so the chatbot can show the right suggestion pack for that sub-page.
  useEffect(() => {
    const effective = activeTab === "uw-review" ? uwSubTab : activeTab;
    setWorkspaceActiveTab(effective);
  }, [activeTab, uwSubTab, setWorkspaceActiveTab]);

  // Allow other components (e.g. the chatbot) to navigate tabs via the workspace.
  // If the requested tab is a UW Review sub-tab (risk/loss/rating/notes/tasks/approvals),
  // switch the outer tab to uw-review and route the request into the side-nav.
  useEffect(() => {
    const UW_SUB_IDS = new Set(["risk", "loss", "rating", "notes", "tasks", "approvals", "review"]);
    registerTabChangeHandler((tab: string) => {
      if (UW_SUB_IDS.has(tab)) {
        setActiveTab("uw-review");
        setUwSubTab(tab);
      } else {
        setActiveTab(tab);
      }
    });
  }, [registerTabChangeHandler]);

  // Live unread badge for the Correspondence tab
  const unreadCount = threads.reduce((s, t) => s + t.unreadCount, 0);

  const renderTab = () => {
    switch(activeTab){
      case "overview":      return <OverviewTab/>;
      case "member":        return <MemberBrokerTab/>;
      case "documents":     return <DocumentsTab/>;
      case "correspondence":return <CorrespondenceTab/>;
      case "audit":         return <AuditTrailTab/>;
      // Underwriting Review hosts Risk / Loss / Rating / Notes / Tasks / Approvals
      // as a side-nav inside its own page. Default landing tab.
      case "uw-review":     return <UWReviewView subTab={uwSubTab} setSubTab={setUwSubTab} productLines={SUBMISSION.productLines}/>;
      default:              return <UWReviewView subTab={uwSubTab} setSubTab={setUwSubTab} productLines={SUBMISSION.productLines}/>;
    }
  };

  // Effective tab: drives tab-aware companion suggestions/responses below.
  const effectiveTab = activeTab === "uw-review" ? uwSubTab : activeTab;
  const subId = subIdFromUrl ?? SUBMISSION.id;
  const tabPack = buildTabPack(effectiveTab, SUBMISSION, subId);

  return (
    <AppShell activePage="submissions" role={user?.roleId ?? "sr-uw"} onRoleChange={() => {}}>
      <PageRegister
        routeKey={`page:submission:${subId}:${effectiveTab}`}
        title={`${SUBMISSION.institutionName} · ${subId}`}
        subtitle={`${tabPack.tabLabel} · ${SUBMISSION.memberType} · ${SUBMISSION.location}`}
        greeting={tabPack.greeting}
        suggestions={tabPack.suggestions}
        respond={(sid, suggestion) => {
          const tabResp = tabPack.respond?.(sid);
          if (tabResp && tabResp.length) return tabResp;
          if (sid === "summary") return [{ id: newId(), role: "agent", kind: "text", ts: now(),
            text: `${SUBMISSION.institutionName} — ${SUBMISSION.memberType}, ${SUBMISSION.enrollment}, ${SUBMISSION.location}. Expiring ${SUBMISSION.expiringPremium} → indicated ${SUBMISSION.quotedPremium} (${SUBMISSION.quotedNote}). Loss ratio ${SUBMISSION.lossRatio} (${SUBMISSION.lossRatioNote}). Broker: ${SUBMISSION.brokerage} (${SUBMISSION.brokerContact}). Need-by ${SUBMISSION.needByDate} (${SUBMISSION.needByUrgency}).` }];
          if (sid === "checklist") return [{ id: newId(), role: "agent", kind: "viz", ts: now(), viz: {
            kind: "checklist", title: `${subIdFromUrl ?? SUBMISSION.id} · readiness check`,
            items: [
              { ok: true,  label: "ACORD application on file" },
              { ok: true,  label: "6-year loss runs received" },
              { ok: false, label: "Safety questionnaire missing", sub: "Request from broker" },
              { ok: false, label: "SIR actuarial opinion pending", sub: `Requested · still outstanding` },
            ],
          } }];
          if (sid === "loss-ratio") return [{ id: newId(), role: "agent", kind: "text", ts: now(),
            text: `Loss ratio ${SUBMISSION.lossRatio} is driven by ${SUBMISSION.lossRatioNote}. With 2 open claims still developing, factor pressure is real — I'd hold the indicated rate and document the open-reserve sensitivity in the file.` }];

          // Rating-tab follow-up chips emitted by RatingTab when the user toggles
          // a coverage item or endorsement. Keep handlers here so a click never
          // falls through to the generic "Done." reply.
          if (sid === "compare-option") return [{ id: newId(), role: "agent", kind: "text", ts: now(),
            text: `Comparing the active option against the other rating options on file:\n\n• Option A — base coverage · matches expiring · standard credits\n• Option B (active) — adjusted coverage · current edit reflects your toggle\n• Option C — broader limits + SAM endorsement · ~7% higher premium\n\nB sits roughly mid-pack on premium and credits. Want me to draft a rationale for picking it?` }];
          if (sid === "explain-impact") return [{ id: newId(), role: "agent", kind: "text", ts: now(),
            text: `Rate impact of your last change:\n\n• Premium delta is shown inline on the option card.\n• Drivers: coverage item toggle + endorsement set + manual % (currently applied).\n• Authority check: stays within standard SR-UW band as long as the manual % is between -10% and +20%.\n\nTap "Compare to other options" to see how this lands vs. the alternatives.` }];
          if (sid === "preview-quote") return [{ id: newId(), role: "agent", kind: "navigate", ts: now(),
            text: `Opening the quote preview…`,
            href: `/submission/${subIdFromUrl ?? SUBMISSION.id}/quote/preview`,
            label: "Open Quote Preview",
          }];
          if (sid === "what-next") return [{ id: newId(), role: "agent", kind: "text", ts: now(),
            text: `Suggested next steps on this submission:\n\n1. Lock in the active rating option (Rating tab → "Use this option").\n2. Clear the open document gaps (Documents tab).\n3. Draft the broker indication email and send.\n4. Move the lifecycle to "Quoted" once the letter is out.\n\nWant me to start any of these?` }];

          if (sid === "draft-broker") {
            const brokerFirst = SUBMISSION.brokerContact.split(" ").slice(-1)[0] || "there";
            const brokerHandle = SUBMISSION.brokerContact.replace(/[^a-zA-Z]/g, "").toLowerCase();
            const brokerDomain = SUBMISSION.brokerage.toLowerCase().replace(/[^a-z]/g, "") + ".com";
            const brokerEmail = `${brokerHandle}@${brokerDomain}`;
            const acct = SUBMISSION.institutionName;
            const subId = subIdFromUrl ?? SUBMISSION.id;
            const subject = `${acct} (${subId}) renewal — outstanding items before quote`;
            const body =
`Hi ${brokerFirst},

Thanks for sending the ${acct} (${subId}) submission. I've reviewed the file:

  • Expiring premium: ${SUBMISSION.expiringPremium} (${SUBMISSION.expiringNote})
  • Indicated: ${SUBMISSION.quotedPremium} (${SUBMISSION.quotedNote})
  • 6-yr loss ratio: ${SUBMISSION.lossRatio} (${SUBMISSION.lossRatioNote})
  • Lines: ${SUBMISSION.productLines.join(", ").toUpperCase()}
  • Effective: ${SUBMISSION.effectiveDate} · Need-by: ${SUBMISSION.needByDate} (${SUBMISSION.needByUrgency} left)

To finalize the quote, I still need:

  1. Updated safety questionnaire (signed by the head of school)
  2. SIR actuarial opinion supporting the retention level
  3. Confirmation that the two open claims (per the loss runs) remain in mediation

Can you have these to me by ${SUBMISSION.needByDate}? Happy to jump on a call if it's faster.

Best,
${SUBMISSION.underwriter.name}
${SUBMISSION.underwriter.title} · United Educators`;

            return [{ id: newId(), role: "agent", kind: "viz", ts: now(), viz: {
              kind: "playbook",
              title: `Draft email to ${SUBMISSION.brokerContact}`,
              specialist: { name: "Broker Outreach Specialist", role: "Companion · drafted from file", tone: "blue" },
              intro: `Pulled from ${acct}'s submission. Review the draft, edit if needed, then send.`,
              steps: [],
              draft: { kind: "email", to: brokerEmail, subject, body },
              primaryCta: { label: "Send draft", action: "send-draft" },
              contextRef: { label: `${acct} · ${subId}`, href: `/submission/${subId}` },
            } }];
          }
        }}
        freeText={(text) => {
          const tabFree = tabPack.freeText?.(text);
          if (tabFree && tabFree.length) return tabFree;
          const t = text.toLowerCase();
          if (/\b(broker|marsh|gallagher|contact)\b/.test(t)) {
            return [{ id: newId(), role: "agent", kind: "text", ts: now(),
              text: `Broker on file: ${SUBMISSION.brokerage} — ${SUBMISSION.brokerContact}. Want me to draft an outreach email?` }];
          }
          if (/\b(premium|quote|price|expiring)\b/.test(t)) {
            return [{ id: newId(), role: "agent", kind: "text", ts: now(),
              text: `Expiring ${SUBMISSION.expiringPremium} (${SUBMISSION.expiringNote}); current indication ${SUBMISSION.quotedPremium} (${SUBMISSION.quotedNote}). Need-by ${SUBMISSION.needByDate}.` }];
          }
        }}
        facts={() => [
          `Active tab: ${tabPack.tabLabel}`,
          `Account: ${SUBMISSION.institutionName} (${SUBMISSION.id}) · ${SUBMISSION.memberType} · ${SUBMISSION.location}`,
          `Premium: expiring ${SUBMISSION.expiringPremium} → indicated ${SUBMISSION.quotedPremium} (${SUBMISSION.quotedNote})`,
          `Loss ratio ${SUBMISSION.lossRatio} (${SUBMISSION.lossRatioNote})`,
          `Broker: ${SUBMISSION.brokerage} / ${SUBMISSION.brokerContact} · UW: ${SUBMISSION.underwriter.name}`,
          `Need-by ${SUBMISSION.needByDate} (${SUBMISSION.needByUrgency})`,
          `Lines: ${SUBMISSION.productLines.join(", ")}`,
          tabPack.extraFacts ? tabPack.extraFacts() : "",
        ].filter(Boolean).join("\n")}
      />
      <div style={{fontFamily: font, color:"#1A2530"}}>

        {/* ── BREADCRUMB + STAGE DROPDOWN ──────────────────────────────────── */}
        <div className="flex items-center justify-between gap-3 px-4 sm:px-8 py-2.5 flex-wrap"
          style={{background:"white", borderBottom:`1px solid ${BDL}`}}>
          <div className="flex items-center gap-2 min-w-0">
            <button onClick={()=>navigate("/")} className="hover:underline"
              style={{fontSize:"0.75rem",color:TT}}>Dashboard</button>
            <span style={{color:"#C4CDD8",fontSize:"0.75rem"}}>/</span>
            <button onClick={()=>navigate("/submissions")} className="hover:underline"
              style={{fontSize:"0.75rem",color:TT}}>Submissions</button>
            <span style={{color:"#C4CDD8",fontSize:"0.75rem"}}>/</span>
            <span style={{fontSize:"0.75rem",color:N,fontWeight:600}}>{SUBMISSION.institutionName}</span>
            <span style={{color:"#C4CDD8",fontSize:"0.75rem"}}>/</span>
            <span style={{fontSize:"0.75rem",color:G,fontWeight:700}}>
              {TABS.find(t=>t.id===activeTab)?.label}
            </span>
          </div>
          <div className="shrink-0" style={{ minWidth: 240 }}>
            <StageDropdown value={stage} onChange={setStage} />
          </div>
        </div>

        {/* ── HERO ───────────────────────────────────────────────────────── */}
        <div style={{background:"white", borderBottom:`1px solid ${BDL}`}}>
          {/* gold accent bar */}
          <div style={{height:4, background:`linear-gradient(90deg,${G} 0%,#A8841C 100%)`}}/>

          {/* ── Single summary card (edge-to-edge, matches prior grid spacing) ── */}
          <div
            style={{
              position: "relative",
              background: "white",
              borderTop: `1px solid ${BDL}`,
              overflow: "hidden",
            }}
          >

              {/* ── Header row ────────────────────────────────────────── */}
              <div className="flex items-center gap-3 px-4 sm:px-8 py-5 flex-wrap">

                {/* Member avatar/logo square — vertically centered with content */}
                <div
                  className="flex items-center justify-center shrink-0"
                  style={{
                    width: 40, height: 40,
                    background: `${G}18`, border: `2px solid ${G}55`,
                    alignSelf: "center",
                  }}
                >
                  <GraduationCap size={18} color={G}/>
                </div>

                {/* Identity block */}
                <div className="flex-1 min-w-0 flex items-center gap-2.5 flex-wrap">
                  <h1 style={{ color:"#1A2530", fontSize:"1.30rem", fontWeight:800, lineHeight:1.2 }}>
                    {SUBMISSION.institutionName}
                  </h1>
                  {/* Submission ID chip — same style used elsewhere */}
                  <span
                    style={{
                      background:`${G}18`, color:"#8A5C00", border:`1px solid ${G}55`,
                      fontSize:"0.68rem", fontWeight:800, letterSpacing:"0.10em",
                      padding:"2px 10px", textTransform:"uppercase", whiteSpace:"nowrap",
                    }}
                  >
                    {subIdFromUrl ?? SUBMISSION.id}
                  </span>
                  {/* Member number chip — same style used elsewhere */}
                  <span
                    style={{
                      background:`${N}10`, color:"#1A2530", border:`1px solid ${N}25`,
                      fontSize:"0.72rem", fontWeight:700, padding:"2px 8px",
                      whiteSpace:"nowrap",
                    }}
                  >
                    M {SUBMISSION.memberNumber}
                  </span>
                  {/* Muted single-line metadata */}
                  <span
                    style={{
                      color:TM, fontSize:"0.80rem", marginLeft:4,
                      whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis",
                      minWidth:0,
                    }}
                  >
                    {SUBMISSION.memberType} · {SUBMISSION.enrollment} · {SUBMISSION.location} · since {SUBMISSION.memberSince}
                  </span>
                </div>

                {/* Bind Policy — sole action, primary button */}
                <PrimaryButton onClick={()=>navigate(`/submission/${subIdFromUrl ?? SUBMISSION.id}/quote`)}>
                  <ClipboardCheck size={14}/> Bind Policy
                </PrimaryButton>
              </div>

              {/* Solid divider */}
              <div style={{ height:1, background:BDL }}/>

              {/* ── Single shared collapse / expand toggle ─────────────── */}
              <div className="flex items-center justify-between px-4 py-2"
                style={{ background: "#FAFBFD", borderBottom: `1px solid ${BDL}` }}>
                <button
                  onClick={() => setDetailsOpen(v => !v)}
                  aria-expanded={detailsOpen}
                  aria-controls="details-region"
                  className="inline-flex items-center gap-1.5 transition-colors hover:opacity-80"
                  style={{
                    background: "transparent", border: "none", padding: 0,
                    cursor: "pointer", fontFamily: font,
                  }}>
                  <ChevronRight size={12} color={TT}
                    style={{
                      transform: detailsOpen ? "rotate(90deg)" : "rotate(0deg)",
                      transition: "transform 0.2s ease",
                    }}/>
                  <span style={{
                    fontSize: "0.66rem", fontWeight: 800, color: TT,
                    textTransform: "uppercase", letterSpacing: "0.1em",
                  }}>
                    {detailsOpen ? "Hide" : "Show"} Submission Details
                  </span>
                </button>
                <span style={{
                  fontSize: "0.6rem", fontWeight: 600, color: TT,
                }}>
                  10 fields · 5 quick sections
                </span>
              </div>

              {/* ── TWO-SECTION LAYOUT (single toggle controls both) ──── */}
              {detailsOpen && (
              <div id="details-region"
                className="grid grid-cols-1 lg:grid-cols-5 gap-0"
                style={{ background: "white" }}>

                {/* ── Section 1 (60%) — compact 2-col stats + CTA ────── */}
                <div className="lg:col-span-3 px-4 py-3 flex flex-col"
                  style={{ borderRight: `1px solid ${BDL}` }}>
                  <div className="flex items-center justify-between mb-2 shrink-0">
                    <h3 style={{
                      fontSize: "0.62rem", fontWeight: 800, color: TT,
                      textTransform: "uppercase", letterSpacing: "0.1em",
                    }}>
                      Submission Snapshot
                    </h3>
                    <span style={{
                      fontSize: "0.55rem", fontWeight: 700, color: TT,
                      background: "#FAFBFD", border: `1px solid ${BDL}`,
                      padding: "1px 7px", borderRadius: 10,
                    }}>
                      10 fields
                    </span>
                  </div>

                  {/* Stat list — fills remaining height, scrolls if overflow */}
                  <>
                  <div id="submission-snapshot-body"
                    style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3">
                      {[
                        { icon: <TrendingUp size={11}/>,   iconTint: "#E8F5EC", iconColor: POSITIVE, label: "Quoted",          value: SUBMISSION.quotedPremium,                                       sub: SUBMISSION.quotedNote,        subColor: POSITIVE },
                        { icon: <Activity size={11}/>,     iconTint: "#F0F3F8", iconColor: TT,       label: "Expiring",         value: SUBMISSION.expiringPremium,                                     sub: SUBMISSION.expiringNote                       },
                        { icon: <Flag size={11}/>,         iconTint: "#FEE2E2", iconColor: DANGER,   label: "Need-By",          value: SUBMISSION.needByDate,        valueColor: DANGER,                sub: `${SUBMISSION.needByUrgency} left`, subColor: DANGER },
                        { icon: <Calendar size={11}/>,     iconTint: "#F0F3F8", iconColor: TT,       label: "Policy Term",      value: `${SUBMISSION.effectiveDate} – ${SUBMISSION.expiryDate}`,        sub: "12-month"                                    },
                        { icon: <TrendingDown size={11}/>, iconTint: "#FFFBEB", iconColor: CAUTION,  label: "Loss Ratio (6Y)",  value: SUBMISSION.lossRatio,                                            sub: SUBMISSION.lossRatioNote,     subColor: CAUTION  },
                        { icon: <Calendar size={11}/>,     iconTint: "#F0F3F8", iconColor: TT,       label: "Effective",        value: SUBMISSION.effectiveDate,                                        sub: `PY ${POLICY_YEAR_LABEL}`                     },
                        { icon: <Calendar size={11}/>,     iconTint: "#F0F3F8", iconColor: TT,       label: "Expiration",       value: SUBMISSION.expiryDate,                                           sub: "Auto-renews"                                 },
                        { icon: <Shield size={11}/>,       iconTint: "#F0F3F8", iconColor: TT,       label: "Brokerage",        value: SUBMISSION.brokerage,                                            sub: SUBMISSION.brokerContact                      },
                        { icon: <User size={11}/>,         iconTint: "#F0F3F8", iconColor: TT,       label: "Underwriter",      value: SUBMISSION.underwriter.name,                                     sub: SUBMISSION.underwriter.title                  },
                        { icon: <User size={11}/>,         iconTint: "#F0F3F8", iconColor: TT,       label: "UW Specialist",    value: SUBMISSION.uwSpecialist.name,                                    sub: SUBMISSION.uwSpecialist.title                 },
                      ].map((row, i) => (
                        <div key={i} className="flex items-center gap-2 py-1.5"
                          style={{ borderBottom: `1px solid #F1F4F8`, minWidth: 0 }}>
                          <span className="inline-flex items-center justify-center shrink-0"
                            style={{
                              width: 18, height: 18, borderRadius: 4,
                              background: row.iconTint, color: row.iconColor,
                            }}>
                            {row.icon}
                          </span>
                          <span style={{
                            fontSize: "0.55rem", fontWeight: 700, color: TT,
                            textTransform: "uppercase", letterSpacing: "0.07em",
                            whiteSpace: "nowrap",
                          }}>
                            {row.label}
                          </span>
                          <div className="flex items-baseline gap-1 ml-auto min-w-0" style={{ textAlign: "right" }}>
                            <span style={{
                              fontSize: "0.72rem", fontWeight: 700,
                              color: row.valueColor ?? "#1A2530",
                              fontVariantNumeric: "tabular-nums",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                            title={typeof row.value === "string" ? row.value : undefined}>
                              {row.value}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Overview Details CTA — aligned right, anchored to the bottom */}
                  <div className="mt-2.5 flex justify-end shrink-0">
                    <PrimaryButton onClick={() => setActiveTab("overview")}>
                      <LayoutDashboard size={12}/>
                      Overview Details
                    </PrimaryButton>
                  </div>
                  </>
                </div>

                {/* ── Section 2 (40%) — tab shortcut buttons fill height ── */}
                <div className="lg:col-span-2 px-4 py-3 flex flex-col"
                  style={{ background: "#FAFBFD" }}>
                  <div className="flex items-center justify-between mb-2 shrink-0">
                    <h3 style={{
                      fontSize: "0.62rem", fontWeight: 800, color: TT,
                      textTransform: "uppercase", letterSpacing: "0.1em",
                    }}>
                      Quick Sections
                    </h3>
                  </div>
                  <div id="quick-sections-body"
                    className="flex flex-col gap-1.5"
                    style={{ flex: 1, minHeight: 0 }}>
                    {[
                      { id: "uw-review",      label: "Underwriting Review",icon: <ClipboardCheck size={13}/> },
                      { id: "member",         label: "Member & Brokerage", icon: <Users size={13}/>          },
                      { id: "documents",      label: "Documents",          icon: <FolderOpen size={13}/>     },
                      { id: "correspondence", label: "Correspondence",     icon: <Mail size={13}/>           },
                      { id: "audit",          label: "Audit Trail",        icon: <Clock size={13}/>          },
                    ].map(b => {
                      const isActive = activeTab === b.id;
                      const showBadge = b.id === "correspondence" && unreadCount > 0;
                      return (
                        <button
                          key={b.id}
                          onClick={() => setActiveTab(b.id)}
                          className="group flex items-center gap-2 px-2.5 text-left transition-all"
                          onMouseEnter={(e) => {
                            if (!isActive) {
                              e.currentTarget.style.background = `${N}06`;
                              e.currentTarget.style.borderColor = `${N}40`;
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isActive) {
                              e.currentTarget.style.background = "white";
                              e.currentTarget.style.borderColor = BDL;
                            }
                          }}
                          style={{
                            background: isActive ? `${N}0C` : "white",
                            border: `1px solid ${isActive ? N : BDL}`,
                            borderRadius: 6,
                            cursor: "pointer",
                            fontFamily: font,
                            transition: "background 0.2s ease, border-color 0.2s ease",
                            boxShadow: isActive ? `0 1px 3px ${N}20` : "0 1px 2px rgba(15,23,42,0.04)",
                            flex: "1 1 0",
                            minHeight: 0,
                          }}>
                          <span className="inline-flex items-center justify-center shrink-0"
                            style={{
                              width: 22, height: 22, borderRadius: 5,
                              background: isActive ? `${N}15` : "#F0F3F8",
                              color: isActive ? N : TM,
                              transition: "all 0.2s ease",
                            }}>
                            {b.icon}
                          </span>
                          <span style={{
                            fontSize: "0.72rem", fontWeight: 700,
                            color: isActive ? N : "#1A2530",
                            flex: 1,
                          }}>
                            {b.label}
                          </span>
                          {showBadge && (
                            <span style={{
                              fontSize: "0.52rem", fontWeight: 800, color: "white",
                              background: "#B45309",
                              padding: "1px 5px", borderRadius: 9,
                              minWidth: 14, textAlign: "center",
                            }}>
                              {unreadCount}
                            </span>
                          )}
                          <ChevronRight size={12}
                            color={isActive ? N : "#94A3B8"}
                            className="shrink-0 transition-transform group-hover:translate-x-0.5"/>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
              )}
            </div>

        </div>

        {/* Tab nav removed — Overview reached via Section 1's "Overview Details"  */}
        {/* button; Member & Brokerage / Documents / Correspondence / Underwriting */}
        {/* Review / Audit Trail reached via Section 2's quick-section buttons.    */}
        {/* Risk / Loss / Rating / Notes / Tasks / Approvals live inside the       */}
        {/* Underwriting Review side nav.                                          */}

        {/* ── TAB CONTENT ─────────────────────────────────────────────────── */}
        <div className="px-4 sm:px-8 py-6 pb-10" style={{background:"#EEF1F6",minHeight:400}}>
          {renderTab()}
        </div>

      </div>
    </AppShell>
  );
}