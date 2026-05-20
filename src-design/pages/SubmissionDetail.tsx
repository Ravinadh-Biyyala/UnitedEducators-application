import { AuditTrailTab }    from "../components/tabs/AuditTrailTab";
import { ApprovalsTab }    from "../components/tabs/ApprovalsTab";
import { ConditionsTab }   from "../components/tabs/ConditionsTab";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard, Users, ShieldAlert, TrendingDown,
  FolderOpen, MessageSquare, Mail,
  ClipboardCheck, Clock, Calculator, CheckSquare,
  ShieldCheck, UserCheck, Briefcase, Globe, Lock, Car,
  Building2, Shield, ThumbsUp, ListChecks,
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
import { TasksTab, SEED_TASKS } from "../components/tabs/TasksTab";
import { CorrespondenceTab, buildSeedThreads } from "../components/tabs/CorrespondenceTab";
import { UnderwritingReviewTab } from "../components/tabs/UnderwritingReviewTab";
import { GroupMembersTab } from "../components/tabs/GroupMembersTab";
import { AppShell }        from "../components/AppShell";
import type { RoleId }     from "../components/AppShell";
import { SubmissionWorkspaceProvider, useSubmissionWorkspace } from "../context/SubmissionWorkspaceContext";
import { PageRegister }    from "../components/companion/PageRegister";
import { newId, now }      from "../components/companion/CompanionContext";
import type { Suggestion, CompanionMsg } from "../components/companion/CompanionContext";

const N    = "#0123D4";
const G    = "#C9A227";
const BD   = "#C4CDD8";
const BDL  = "#DCE3EC";
const TT   = "#7A8FA3";
const TM   = "#4A5D6E";
const font = "'Source Sans 3', system-ui, sans-serif";

/* ── Product line display catalog (for hero strip) ───────────────────────── */
const PRODUCT_DISPLAY: Record<string, { abbr: string; icon: ReactNode; color: string }> = {
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
  productLines:    ["cgl", "ell", "sbl", "ipl"],
};

/* ── Group submission registry ────────────────────────────────────────────
   Submission IDs that represent group / multi-member packets. The detail page
   uses this to: (a) show a "Group" pill in the hero, (b) surface the
   Group Members quick section + tab, and (c) feed per-member loss data into
   the LossTab "By Member" toggle. Real wiring would derive this from the
   submission record itself. */
const GROUP_SUBMISSIONS: Record<string, { groupName: string; memberCount: number }> = {
  "SUB-7830": { groupName: "San Diego Unified Risk Pool",          memberCount: 14 },
  "SUB-7831": { groupName: "Central Texas Schools Consortium",     memberCount: 7  },
  "SUB-7841": { groupName: "Mountain West Charter Network",        memberCount: 11 },
  "SUB-7845": { groupName: "Pacific Coast Higher-Ed Pool",         memberCount: 6  },
};

/* ── Per-member loss ratios for the LossTab "By Member" view. Keyed by the
   group submission id; aligned with the roster in GroupMembersTab so the
   numbers tell a coherent story across tabs. */
const GROUP_MEMBER_LOSS: Record<string, { name: string; memberType: string; products: string[]; lossRatio: number; trend: "up" | "down" | "neutral" }[]> = {
  "SUB-7831": [
    { name: "Lincoln High School",     memberType: "K-12 Public School",   products: ["GL", "Prop"],        lossRatio: 41, trend: "down"    },
    { name: "Madison Academy",         memberType: "Charter School",       products: ["GL"],                lossRatio: 28, trend: "down"    },
    { name: "Pinegrove Elementary",    memberType: "K-12 Public School",   products: ["GL", "Prop"],        lossRatio: 54, trend: "neutral" },
    { name: "Roosevelt Middle",        memberType: "K-12 Public School",   products: ["GL", "Prop"],        lossRatio: 49, trend: "down"    },
    { name: "Cedar Charter Network",   memberType: "Charter School",       products: ["GL", "ELL"],         lossRatio: 71, trend: "up"      },
    { name: "Westlake Academy",        memberType: "Private K-12",         products: ["GL"],                lossRatio: 18, trend: "down"    },
    { name: "Travis ISD Annex",        memberType: "K-12 Public District", products: ["GL", "Prop", "ELL"], lossRatio: 62, trend: "up"      },
  ],
};

/* ── Tab-aware Companion pack: per-tab greeting, suggestions, responders.
 *    The Submission Detail companion uses this so the chips/responses are
 *    "page-aware" — e.g. on Rating you get rate-band questions, on Loss you
 *    get claim/severity questions, etc. */
function buildTabPack(tab: string, S: typeof SUBMISSION, subId: string) {
  const TAB_LABELS: Record<string, string> = {
    overview: "Details", member: "Member & Broker", members: "Group Members",
    documents: "Documents", correspondence: "Correspondence",
    audit: "Audit Trail", review: "Underwriting Review", risk: "Risk", loss: "Loss History",
    rating: "Underwriting", notes: "Notes", tasks: "Tasks", approvals: "Approvals",
    conditions: "Conditions",
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
              items: picked.slice(0, 5).map(o => ({ ok: false, label: o.title, sub: o.detail, href: `/submission/${subId}?tab=rating` })),
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
            { ok: false, label: "CLM-2023-014 · ELL · mediation pending", sub: "Reserve $145K", href: `/submission/${subId}?tab=loss` },
            { ok: false, label: "CLM-2024-007 · GL · slip-and-fall",       sub: "Reserve $42K",  href: `/submission/${subId}?tab=loss` },
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
            { ok: true,  label: "ACORD application on file",          href: `/submission/${subId}?tab=documents` },
            { ok: true,  label: "6-year loss runs received",           href: `/submission/${subId}?tab=loss` },
            { ok: true,  label: "COPE / Schedule of Locations",        href: `/submission/${subId}?tab=documents` },
            { ok: false, label: "Safety questionnaire missing",        sub: "Request from broker", href: `/submission/${subId}?tab=documents` },
            { ok: false, label: "SIR actuarial opinion pending",       sub: "Outstanding",         href: `/submission/${subId}?tab=documents` },
          ],
        } }];
        if (sid === "expiring-docs") return [{ id: newId(), role: "agent", kind: "text", ts: now(),
          text: `Two docs to refresh before quote: sprinkler inspection (last dated 14 months ago) and the cyber security attestation (renewable annually).` }];
        if (sid === "request-docs") return [{ id: newId(), role: "agent", kind: "text", ts: now(),
          text: `Draft to ${S.brokerContact} (${S.brokerage}):\n\nSubject: ${subId} — outstanding documents for ${S.institutionName}\n\nHi ${S.brokerContact.split(" ")[0]},\n\nTo finalize ${S.institutionName}'s renewal quote, we still need the following:\n\n1. Completed safety questionnaire (current version on file is missing)\n2. SIR actuarial opinion supporting the retention level\n3. Updated sprinkler inspection (current report > 12 months old)\n4. Refreshed cyber security attestation (annual)\n\nCould you have these to me by ${S.needByDate}? Happy to jump on a quick call if it's easier.\n\nThanks,\nSarah`,
          suggestions: [
            { id: "send-via-correspondence", label: "Open in Correspondence", tone: "violet", icon: "Mail", navigateTo: `/submission/${subId}?tab=correspondence` },
            { id: "doc-status", label: "What's still missing?", tone: "red", icon: "AlertTriangle" },
          ],
        }];
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

    case "members": return {
      tabLabel,
      greeting: `Group roster for this submission. Compare members by performance, rule tier, or product mix — and surface what's blocking quote-readiness.`,
      suggestions: [
        { id: "worst-lr",      label: "Members with worst loss ratio",  tone: "red",    icon: "TrendingUp"   },
        { id: "tier-spread",   label: "How many members in each tier?", tone: "blue",   icon: "ShieldCheck"  },
        { id: "issues-only",   label: "Show only members with issues",  tone: "gold",   icon: "AlertTriangle"},
        { id: "by-product",    label: "Members by product mix",         tone: "violet", icon: "ChartPie"     },
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

/* ── Semantic colors reused from existing tokens in this file ─────────────── */
const POSITIVE = "#2E7D32"; // good/positive (already used in stat grid)
const DANGER   = "#C0392B"; // warning/danger (already used for need-by)
const CAUTION  = "#B45309"; // caution/amber (already used in pages)

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
  {id:"review",        label:"Review",             icon:<ClipboardCheck size={13}/>},
  {id:"overview",      label:"Details",            icon:<LayoutDashboard size={13}/>},
  {id:"member",        label:"Member & Brokerage", icon:<Users size={13}/>},
  {id:"members",       label:"Group Members",      icon:<Users size={13}/>},
  {id:"risk",          label:"Risk & Exposure",    icon:<ShieldAlert size={13}/>},
  {id:"loss",          label:"Loss History",       icon:<TrendingDown size={13}/>},
  {id:"conditions",    label:"Conditions",         icon:<ListChecks size={13}/>},
  {id:"rating",        label:"Underwriting",       icon:<Calculator size={13}/>},
  {id:"documents",     label:"Documents",          icon:<FolderOpen size={13}/>},
  {id:"correspondence",label:"Correspondence",     icon:<Mail size={13}/>},
  {id:"notes",         label:"Notes",              icon:<MessageSquare size={13}/>},
  {id:"tasks",         label:"Tasks",              icon:<CheckSquare size={13}/>},
  {id:"approvals",     label:"Approvals",          icon:<ThumbsUp size={13}/>},
  {id:"audit",         label:"Audit Trail",        icon:<Clock size={13}/>},
];

/* ── StatCell: icon tile + uppercase micro-label · value · subtitle ──────── */
function StatCell({
  icon, label, value, valueColor, sub, subColor, isLast,
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  valueColor?: string;
  sub?: ReactNode;
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

export function SubmissionDetail() {
  // One-time seed for the workspace context — keeps the SAME object across renders.
  const initialThreads = useMemo(() => buildSeedThreads(), []);
  return (
    <SubmissionWorkspaceProvider initialThreads={initialThreads} initialTasks={SEED_TASKS}>
      <SubmissionDetailInner/>
    </SubmissionWorkspaceProvider>
  );
}

function SubmissionDetailInner() {
  const navigate  = useNavigate();
  const { id: subIdFromUrl } = useParams<{ id: string }>();
  const location  = useLocation();
  const navState  = (location.state ?? {}) as { freshFromInbox?: boolean; institutionName?: string };
  const subIdResolved = subIdFromUrl ?? SUBMISSION.id;
  const groupInfo = GROUP_SUBMISSIONS[subIdResolved];
  const isGroup   = !!groupInfo;
  const groupMemberLoss = isGroup ? (GROUP_MEMBER_LOSS[subIdResolved] ?? []) : [];
  const displayInstitutionName = navState.freshFromInbox && navState.institutionName
    ? navState.institutionName
    : (groupInfo?.groupName ?? SUBMISSION.institutionName);
  const { user }  = useAuth();
  // "review" is the default landing tab.
  const [activeTab, setActiveTab] = useState("review");
  const [detailsOpen, setDetailsOpen] = useState(true);
  const [stage, setStage] = useState("Review In Progress");
  const { threads, registerTabChangeHandler, setActiveTab: setWorkspaceActiveTab } = useSubmissionWorkspace();

  // Mirror local activeTab into the workspace context (chatbot reads it).
  useEffect(() => {
    setWorkspaceActiveTab(activeTab);
  }, [activeTab, setWorkspaceActiveTab]);

  // Allow other components (e.g. the chatbot) to navigate tabs via the workspace.
  useEffect(() => {
    registerTabChangeHandler((tab: string) => setActiveTab(tab));
  }, [registerTabChangeHandler]);

  // Deep-link support — `?tab=docs` switches to the Documents tab on mount /
  // route change. Used by Companion checklist items that redirect into a
  // specific tab of the submission workspace.
  useEffect(() => {
    const tab = new URLSearchParams(location.search).get("tab");
    if (tab) setActiveTab(tab);
  }, [location.search]);

  // Live unread badge for the Correspondence tab
  const unreadCount = threads.reduce((s, t) => s + t.unreadCount, 0);

  const renderTab = () => {
    switch(activeTab){
      case "overview":      return <OverviewTab/>;
      case "review":        return <UnderwritingReviewTab/>;
      case "risk":          return <RiskTab/>;
      case "loss":          return <LossTab groupMembers={groupMemberLoss}/>;
      case "rating":        return <RatingTab selectedProductIds={SUBMISSION.productLines}/>;
      case "notes":         return <NotesTab/>;
      case "tasks":         return <TasksTab/>;
      case "approvals":     return <ApprovalsTab/>;
      case "conditions":    return <ConditionsTab/>;
      case "member":        return <MemberBrokerTab/>;
      case "members":       return <GroupMembersTab/>;
      case "documents":     return <DocumentsTab/>;
      case "correspondence":return <CorrespondenceTab/>;
      case "audit":         return <AuditTrailTab/>;
      default:              return <UnderwritingReviewTab/>;
    }
  };

  // Effective tab: drives tab-aware companion suggestions/responses below.
  const effectiveTab = activeTab;
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
          if (sid === "checklist") {
            const sId = subIdFromUrl ?? SUBMISSION.id;
            return [{ id: newId(), role: "agent", kind: "viz", ts: now(), viz: {
              kind: "checklist", title: `${sId} · readiness check`,
              items: [
                { ok: true,  label: "ACORD application on file",         href: `/submission/${sId}?tab=documents` },
                { ok: true,  label: "6-year loss runs received",          href: `/submission/${sId}?tab=loss` },
                { ok: false, label: "Safety questionnaire missing",       sub: "Request from broker",            href: `/submission/${sId}?tab=documents` },
                { ok: false, label: "SIR actuarial opinion pending",      sub: `Requested · still outstanding`,  href: `/submission/${sId}?tab=documents` },
              ],
            } }];
          }
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
            const subIdLocal = subIdFromUrl ?? SUBMISSION.id;
            const subject = `${acct} (${subIdLocal}) renewal — outstanding items before quote`;
            const body =
`Hi ${brokerFirst},

Thanks for sending the ${acct} (${subIdLocal}) submission. I've reviewed the file:

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
              contextRef: { label: `${acct} · ${subIdLocal}`, href: `/submission/${subIdLocal}` },
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
            <span style={{fontSize:"0.75rem",color:N,fontWeight:600}}>{displayInstitutionName}</span>
            <span style={{color:"#C4CDD8",fontSize:"0.75rem"}}>/</span>
            <span style={{fontSize:"0.75rem",color:G,fontWeight:700}}>
              {TABS.find(t=>t.id===activeTab)?.label}
            </span>
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
            }}
          >

              {/* ── Header row ────────────────────────────────────────── */}
              <div className="flex items-center gap-3 px-4 sm:px-8 py-3 flex-wrap">

                {/* Identity block */}
                <div className="flex-1 min-w-0 flex items-center gap-2.5 flex-wrap">
                  <h1 style={{ color:"#1A2530", fontSize:"1.15rem", fontWeight:800, lineHeight:1.2 }}>
                    {displayInstitutionName}
                  </h1>
                  {/* Submission ID chip — same style used elsewhere */}
                  <span
                    style={{
                      background:`${G}18`, color:"#8A5C00", border:`1px solid ${G}55`,
                      fontSize:"0.68rem", fontWeight:800, letterSpacing:"0.10em",
                      padding:"2px 10px", borderRadius:6,
                      textTransform:"uppercase", whiteSpace:"nowrap",
                    }}
                  >
                    {subIdFromUrl ?? SUBMISSION.id}
                  </span>
                  {/* Member number chip — same style used elsewhere */}
                  <span
                    style={{
                      background:`${N}10`, color:"#1A2530", border:`1px solid ${N}25`,
                      fontSize:"0.72rem", fontWeight:700, padding:"2px 8px",
                      borderRadius:6, whiteSpace:"nowrap",
                    }}
                  >
                    M {SUBMISSION.memberNumber}
                  </span>
                  {/* Group pill — only on group submissions */}
                  {isGroup && (
                    <span
                      className="inline-flex items-center gap-1.5"
                      style={{
                        background:"#7B2FBE15", color:"#7B2FBE",
                        border:"1px solid #7B2FBE40",
                        fontSize:"0.66rem", fontWeight:800,
                        letterSpacing:"0.08em", textTransform:"uppercase",
                        padding:"2px 9px", borderRadius:6, whiteSpace:"nowrap",
                      }}
                      title={`Group submission · ${groupInfo!.memberCount} members`}
                    >
                      <Users size={11}/>
                      Group · {groupInfo!.memberCount}
                    </span>
                  )}
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

                {/* Status dropdown — replaces the Bind Quote button */}
                <div className="shrink-0" style={{ minWidth: 240 }}>
                  <StageDropdown value={stage} onChange={setStage} />
                </div>
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
                  10 fields
                </span>
              </div>

              {/* ── Submission Snapshot (full width) ──────────────────── */}
              {detailsOpen && (
              <div id="details-region"
                style={{ background: "white" }}>

                {/* ── Snapshot — KPI strip + dates row + people row ──────── */}
                <div className="px-4 py-4">
                  {(() => {
                    const lossNum = parseInt(String(SUBMISSION.lossRatio).replace(/[^0-9]/g, ""), 10) || 0;
                    const ringR = 22;
                    const ringC = 2 * Math.PI * ringR;
                    const initials = (s: string) => s.split(/\s+/).slice(0, 2).map(w => w[0]).join("").toUpperCase();

                    const kpiTiles = [
                      { label: "Expiring Premium", value: SUBMISSION.expiringPremium, valueColor: "#1A2530", sub: SUBMISSION.expiringNote, subColor: TT,        iconBg: "#F0F3F8", iconColor: TT,       icon: <Activity size={12}/> },
                      { label: "Quoted Premium",   value: SUBMISSION.quotedPremium,   valueColor: N,         sub: SUBMISSION.quotedNote,   subColor: POSITIVE,  iconBg: `${N}12`,  iconColor: N,        icon: <TrendingUp size={12}/> },
                      { label: "Bound Premium",   value: "—",                         valueColor: TT,        sub: "Not yet bound",         subColor: TT,        iconBg: "#F0F3F8", iconColor: TT,       icon: <Check size={12}/> },
                    ];

                    return (
                      <div className="flex flex-col gap-3.5">
                        {/* ── KPI strip ──────────────────────────────────── */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                          {kpiTiles.map(t => (
                            <div key={t.label}
                              style={{
                                background: "#FAFBFD", border: `1px solid ${BDL}`,
                                borderRadius: 8, padding: "12px 14px",
                              }}>
                              <div className="flex items-center justify-between mb-1.5">
                                <span style={{ fontSize: "0.56rem", fontWeight: 800, color: TT, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                                  {t.label}
                                </span>
                                <span className="inline-flex items-center justify-center"
                                  style={{ width: 22, height: 22, borderRadius: 5, background: t.iconBg, color: t.iconColor }}>
                                  {t.icon}
                                </span>
                              </div>
                              <div style={{ fontSize: "1.55rem", fontWeight: 800, color: t.valueColor, fontVariantNumeric: "tabular-nums", lineHeight: 1.1 }}>
                                {t.value}
                              </div>
                              <div style={{ fontSize: "0.66rem", fontWeight: 600, color: t.subColor, marginTop: 2 }}>
                                {t.sub}
                              </div>
                            </div>
                          ))}

                          {/* Loss Ratio tile (with ring) */}
                          <div style={{
                            background: "#FAFBFD", border: `1px solid ${BDL}`,
                            borderRadius: 8, padding: "12px 14px",
                          }}>
                            <div className="flex items-center justify-between mb-1.5">
                              <span style={{ fontSize: "0.56rem", fontWeight: 800, color: TT, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                                Loss Ratio · 6Y
                              </span>
                              <span className="inline-flex items-center justify-center"
                                style={{ width: 22, height: 22, borderRadius: 5, background: `${CAUTION}18`, color: CAUTION }}>
                                <TrendingDown size={12}/>
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="relative shrink-0" style={{ width: 52, height: 52 }}>
                                <svg width="52" height="52" viewBox="0 0 52 52">
                                  <circle cx="26" cy="26" r={ringR} fill="none" stroke="#F0F3F8" strokeWidth="5"/>
                                  <circle cx="26" cy="26" r={ringR} fill="none"
                                    stroke={CAUTION} strokeWidth="5" strokeLinecap="round"
                                    strokeDasharray={ringC}
                                    strokeDashoffset={ringC * (1 - lossNum / 100)}
                                    transform="rotate(-90 26 26)"/>
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center"
                                  style={{ fontSize: "0.76rem", fontWeight: 800, color: CAUTION, fontVariantNumeric: "tabular-nums" }}>
                                  {lossNum}%
                                </div>
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span style={{ fontSize: "0.98rem", fontWeight: 800, color: "#1A2530", lineHeight: 1.1 }}>
                                  {SUBMISSION.lossRatioNote}
                                </span>
                                <span style={{ fontSize: "0.62rem", fontWeight: 600, color: TT, marginTop: 2 }}>
                                  6-year average
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* ── Dates + People row (single row of 6) ───────── */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-x-5 gap-y-3"
                          style={{ borderTop: `1px solid ${BDL}`, paddingTop: 12 }}>
                          {/* Effective Date */}
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="inline-flex items-center justify-center shrink-0"
                              style={{ width: 30, height: 30, borderRadius: 7, background: "#F0F3F8", color: TT }}>
                              <Calendar size={14}/>
                            </span>
                            <div className="flex flex-col min-w-0">
                              <span style={{ fontSize: "0.55rem", fontWeight: 800, color: TT, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                                Effective Date
                              </span>
                              <span style={{ fontSize: "0.92rem", fontWeight: 700, color: "#1A2530", fontVariantNumeric: "tabular-nums", lineHeight: 1.15 }}>
                                {SUBMISSION.effectiveDate}
                              </span>
                              <span style={{ fontSize: "0.6rem", fontWeight: 600, color: TT, marginTop: 1 }}>
                                Policy start
                              </span>
                            </div>
                          </div>

                          {/* Expiration Date */}
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="inline-flex items-center justify-center shrink-0"
                              style={{ width: 30, height: 30, borderRadius: 7, background: "#F0F3F8", color: TT }}>
                              <Calendar size={14}/>
                            </span>
                            <div className="flex flex-col min-w-0">
                              <span style={{ fontSize: "0.55rem", fontWeight: 800, color: TT, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                                Expiration Date
                              </span>
                              <span style={{ fontSize: "0.92rem", fontWeight: 700, color: "#1A2530", fontVariantNumeric: "tabular-nums", lineHeight: 1.15 }}>
                                {SUBMISSION.expiryDate}
                              </span>
                              <span style={{ fontSize: "0.6rem", fontWeight: 600, color: TT, marginTop: 1 }}>
                                Auto-renews
                              </span>
                            </div>
                          </div>

                          {/* Need-By Date */}
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="inline-flex items-center justify-center shrink-0"
                              style={{ width: 30, height: 30, borderRadius: 7, background: "#FEE2E2", color: DANGER }}>
                              <Flag size={14}/>
                            </span>
                            <div className="flex flex-col min-w-0">
                              <span style={{ fontSize: "0.55rem", fontWeight: 800, color: TT, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                                Need-By Date
                              </span>
                              <span style={{ fontSize: "0.92rem", fontWeight: 700, color: DANGER, fontVariantNumeric: "tabular-nums", lineHeight: 1.15 }}>
                                {SUBMISSION.needByDate}
                              </span>
                              <span className="inline-block mt-0.5"
                                style={{
                                  fontSize: "0.55rem", fontWeight: 800, color: DANGER,
                                  background: "#FEE2E2", border: `1px solid ${DANGER}40`,
                                  padding: "1px 6px", borderRadius: 9,
                                  textTransform: "uppercase", letterSpacing: "0.06em",
                                  alignSelf: "flex-start",
                                }}>
                                {SUBMISSION.needByUrgency} left
                              </span>
                            </div>
                          </div>

                          {/* Brokerage */}
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="inline-flex items-center justify-center shrink-0"
                              style={{ width: 30, height: 30, borderRadius: 7, background: `${N}12`, color: N }}>
                              <Shield size={14}/>
                            </span>
                            <div className="flex flex-col min-w-0">
                              <span style={{ fontSize: "0.55rem", fontWeight: 800, color: TT, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                                Brokerage
                              </span>
                              <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#1A2530", lineHeight: 1.15, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                {SUBMISSION.brokerage}
                              </span>
                              <span style={{ fontSize: "0.6rem", fontWeight: 600, color: TT, marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                {SUBMISSION.brokerContact}
                              </span>
                            </div>
                          </div>

                          {/* Underwriter + UW Specialist */}
                          {[
                            { label: "Underwriter",            person: SUBMISSION.underwriter },
                            { label: "Underwriting Specialist", person: SUBMISSION.uwSpecialist },
                          ].map(p => (
                            <div key={p.label} className="flex items-center gap-3 min-w-0">
                              <span className="inline-flex items-center justify-center shrink-0"
                                style={{
                                  width: 30, height: 30, borderRadius: "50%",
                                  background: `${N}15`, color: N,
                                  fontSize: "0.62rem", fontWeight: 800, letterSpacing: "0.03em",
                                }}>
                                {initials(p.person.name)}
                              </span>
                              <div className="flex flex-col min-w-0">
                                <span style={{ fontSize: "0.55rem", fontWeight: 800, color: TT, textTransform: "uppercase", letterSpacing: "0.1em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                  {p.label}
                                </span>
                                <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#1A2530", lineHeight: 1.15, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                  {p.person.name}
                                </span>
                                <span style={{ fontSize: "0.6rem", fontWeight: 600, color: TT, marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                  {p.person.title}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
              )}
            </div>

        </div>

        {/* ── PRIMARY TAB STRIP ──────────────────────────────────────────── */}
        {/* Single flat tab row — no sub-strip. Order: Review → Risk → Loss   */}
        {/* → Rating → Notes → Tasks → Approvals → Member & Brokerage →       */}
        {/* (Group Members) → Documents → Correspondence → Audit Trail.       */}
        <div className="px-4 sm:px-8 pt-4" style={{ background: "#EEF1F6" }}>
          <div
            style={{
              background: "white",
              border: `1px solid ${BDL}`,
              borderRadius: 8,
              padding: 4,
              boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
              display: "flex",
              gap: 1,
            }}>
            {TABS.filter(t => t.id !== "members" || isGroup).map(t => {
              const isActive = activeTab === t.id;
              const showBadge = t.id === "correspondence" && unreadCount > 0;
              return (
                <button key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  aria-current={isActive ? "page" : undefined}
                  className="flex items-center justify-center gap-1.5 transition-all"
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
                    padding: "6px 8px",
                    flex: "1 1 0",
                    minWidth: 0,
                    transition: "background 0.2s ease, border-color 0.2s ease",
                  }}>
                  <span className="inline-flex items-center justify-center shrink-0"
                    style={{
                      width: 18, height: 18, borderRadius: 4,
                      background: isActive ? `${N}15` : "#F0F3F8",
                      color: isActive ? N : TM,
                      transition: "background 0.2s ease",
                    }}>
                    {t.icon}
                  </span>
                  <span style={{
                    fontSize: "0.72rem",
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? N : "#1A2530",
                    lineHeight: 1.2,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}>
                    {t.label}
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
                </button>
              );
            })}
          </div>
        </div>

        {/* ── TAB CONTENT ─────────────────────────────────────────────────── */}
        <div className="px-4 sm:px-8 py-6 pb-10" style={{background:"#EEF1F6",minHeight:400}}>
          {renderTab()}
        </div>

      </div>
    </AppShell>
  );
}