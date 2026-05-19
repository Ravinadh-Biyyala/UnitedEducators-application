import { useMemo, useRef, useState } from "react";
import { useLocation } from "react-router";
import {
  Sparkles, Zap, Compass, ClipboardCheck, FileText, Mail,
  TrendingUp, Target, Search, CheckCircle2, Clock, AlertCircle,
  ArrowRight, Copy, Send, Layers, Calendar, Bell, ExternalLink,
  Activity, Flag, Award, Inbox as InboxIcon, BarChart2, ShieldCheck,
  CheckSquare, MessageSquare, ThumbsUp, Plus, Users,
} from "lucide-react";
import {
  useSubmissionWorkspaceOptional,
  type PendingRatingOption,
} from "../context/SubmissionWorkspaceContext";
import {
  MOCK_PAYLOAD,
  DimensionalReview,
  ReviewFlags,
  CompanionSuggestions,
} from "./UnderwritingChatAssistant";

const N    = "#0123D4";
const G    = "#C9A227";
const NAVY = "#0A1828";
const BDL  = "#DCE3EC";
const TD   = "#1A2530";
const TM   = "#4A5D6E";
const TT   = "#7A8FA3";
const OK   = "#15803D";
const WARN = "#B45309";
const BAD  = "#B91C1C";
const font = "'Source Sans 3', system-ui, sans-serif";

// ─── Domain types ─────────────────────────────────────────────────────────────
type TabId =
  // Submission-detail tabs (workspace-aware)
  | "overview" | "rating" | "documents" | "correspondence"
  | "notes" | "tasks" | "approvals" | "audit"
  | "member" | "risk" | "loss"
  // Underwriting Review checklist (list view + per-item analytics pages)
  | "review"
  | "review:loss-run" | "review:financial" | "review:operational"
  | "review:governance" | "review:contractual" | "review:benchmarking"
  // Page-level routes (app-wide adaptive)
  | "dashboard-page" | "submissions-page" | "new-submission-page"
  | "inbox-page" | "tasks-page" | "renewals-page" | "notes-page"
  | "approvals-page" | "notifications-page" | "activity-page"
  | "portfolio-page" | "appetite-page" | "quote-page";

interface Suggestion {
  id: string;
  icon: React.ReactNode;
  label: string;
  description?: string;
  responseKey: string;
}

const TAB_LABELS: Record<TabId, string> = {
  // Submission-detail tab labels
  overview:       "Overview",
  rating:         "Rating",
  documents:      "Documents",
  correspondence: "Correspondence",
  notes:          "Notes",
  tasks:          "Tasks",
  approvals:      "Approvals",
  audit:          "Audit Trail",
  member:         "Member & Broker",
  risk:           "Risk & Exposure",
  loss:           "Loss History",
  // Review checklist
  review:                  "UW Review",
  "review:loss-run":       "Loss Run & Claims",
  "review:financial":      "Financial Review",
  "review:operational":    "Operational & Exposure",
  "review:governance":     "Governance & Mgmt Liability",
  "review:contractual":    "Contractual & Risk Control",
  "review:benchmarking":   "Risk Benchmarking",
  // Page-level labels
  "dashboard-page":      "Dashboard",
  "submissions-page":    "Submissions",
  "new-submission-page": "New Submission",
  "inbox-page":          "Inbox",
  "tasks-page":          "Task Queue",
  "renewals-page":       "Renewals",
  "notes-page":          "Notes",
  "approvals-page":      "Approvals",
  "notifications-page":  "Notifications",
  "activity-page":       "Activity",
  "portfolio-page":      "Portfolio",
  "appetite-page":       "Appetite Rules",
  "quote-page":          "Quote Builder",
};

// ─── URL → page-context detection ─────────────────────────────────────────────
function detectPageContext(pathname: string): TabId | null {
  if (pathname === "/" || pathname === "/dashboard")  return "dashboard-page";
  if (pathname === "/submissions")                     return "submissions-page";
  if (pathname === "/submissions/new")                 return "new-submission-page";
  if (pathname === "/inbox")                           return "inbox-page";
  if (pathname === "/tasks")                           return "tasks-page";
  if (pathname === "/renewals")                        return "renewals-page";
  if (pathname === "/notes")                           return "notes-page";
  if (pathname === "/approvals")                       return "approvals-page";
  if (pathname === "/notifications")                   return "notifications-page";
  if (pathname === "/activity")                        return "activity-page";
  if (pathname === "/portfolio")                       return "portfolio-page";
  if (pathname === "/appetite")                        return "appetite-page";
  if (/^\/submission\/[^/]+\/quote/.test(pathname))    return "quote-page";
  return null;
}

// ─── Suggestion-pack registry ─────────────────────────────────────────────────
const SUGGESTIONS: Partial<Record<TabId, Suggestion[]>> = {
  rating: [
    { id: "rate-5opts",  icon: <Sparkles size={11}/>,     label: "Generate 5 rating options", responseKey: "rate-5opts",
      description: "Produces 5 candidate option cards with limits, retention, premium, endorsements, and a one-click apply." },
    { id: "rate-compare", icon: <TrendingUp size={11}/>,   label: "Compare to last year",      responseKey: "rate-compare" },
    { id: "rate-why",    icon: <Compass size={11}/>,      label: "Explain recommendation",    responseKey: "rate-why" },
    { id: "rate-appetite", icon: <Target size={11}/>,     label: "Run appetite check",        responseKey: "rate-appetite" },
    { id: "rate-byproduct", icon: <Sparkles size={11}/>,  label: "Suggest 5 options based on product", responseKey: "rate-byproduct",
      description: "Generates 5 product-tailored option ideas (limits, retention, endorsements, credits) drawn from the actual coverage lines on this submission." },
  ],
  documents: [
    { id: "doc-review",  icon: <ClipboardCheck size={11}/>, label: "Review documents",        responseKey: "doc-review" },
    { id: "doc-email",   icon: <Mail size={11}/>,           label: "Draft missing-docs email", responseKey: "doc-email",
      description: "Generates a broker-ready email listing the missing required documents. Copy or send via Correspondence." },
    { id: "doc-summary", icon: <FileText size={11}/>,       label: "Summarize this folder",    responseKey: "doc-summary" },
    { id: "doc-stale",   icon: <Clock size={11}/>,          label: "Flag stale documents",     responseKey: "doc-stale" },
  ],
  overview: [
    { id: "ov-summary",     icon: <FileText size={11}/>,    label: "Summarize this submission",     responseKey: "ov-summary" },
    { id: "ov-blockers",    icon: <AlertCircle size={11}/>, label: "What's blocking the quote?",    responseKey: "ov-blockers" },
    { id: "ov-similar",     icon: <Search size={11}/>,      label: "Compare to similar accounts",   responseKey: "ov-similar" },
    { id: "ov-dimensional", icon: <Activity size={11}/>,    label: "Dimensional review",            responseKey: "ov-dimensional",
      description: "AI scoring across Appetite & Member-Fit, Claims History, and Comparable Risk Benchmarking." },
    { id: "ov-flags",       icon: <Flag size={11}/>,        label: "Review flags",                  responseKey: "ov-flags",
      description: "Green flags (positive signals) and red flags with action items." },
    { id: "ov-companions",  icon: <Award size={11}/>,       label: "Companion suggestions",         responseKey: "ov-companions",
      description: "Recommended companion products (BLX, XFF) with underwriter-focused reasoning." },
  ],
  notes: [
    { id: "notes-byauthor", icon: <Layers size={11}/>,      label: "Summarize notes by author", responseKey: "notes-byauthor" },
    { id: "notes-actions",  icon: <CheckCircle2 size={11}/>,label: "Extract action items",      responseKey: "notes-actions" },
  ],
  tasks: [
    { id: "tasks-overdue", icon: <AlertCircle size={11}/>,  label: "What's overdue?",          responseKey: "tasks-overdue" },
    { id: "tasks-prio",   icon: <Target size={11}/>,        label: "Suggest task priorities",  responseKey: "tasks-prio" },
  ],
  // ─── Underwriting Review — list view ───────────────────────────────────────
  review: [
    { id: "rev-status",   icon: <Activity size={11}/>,      label: "Overall review status",    responseKey: "rev-status" },
    { id: "rev-blockers", icon: <AlertCircle size={11}/>,   label: "What's blocking sign-off?", responseKey: "rev-blockers" },
    { id: "rev-outstanding", icon: <FileText size={11}/>,   label: "List outstanding documents", responseKey: "rev-outstanding" },
    { id: "rev-suggest",  icon: <Sparkles size={11}/>,      label: "Suggest approve/refer mix", responseKey: "rev-suggest" },
  ],

  // ─── Underwriting Review — per-checklist analytics pages ──────────────────
  "review:loss-run": [
    { id: "rvl-summary",   icon: <FileText size={11}/>,     label: "Summarize claim trends",       responseKey: "rvl-summary" },
    { id: "rvl-frequency", icon: <Activity size={11}/>,     label: "Frequency vs. severity split", responseKey: "rvl-frequency" },
    { id: "rvl-recurring", icon: <Flag size={11}/>,         label: "Recurring claim types",        responseKey: "rvl-recurring" },
    { id: "rvl-reserves",  icon: <Target size={11}/>,       label: "Reserve adequacy check",       responseKey: "rvl-reserves" },
    { id: "rvl-layers",    icon: <TrendingUp size={11}/>,   label: "Excess layer piercing",        responseKey: "rvl-layers" },
  ],
  "review:financial": [
    { id: "rvf-summary",   icon: <FileText size={11}/>,     label: "Summarize financial health",   responseKey: "rvf-summary" },
    { id: "rvf-sir",       icon: <Target size={11}/>,       label: "SIR funding adequacy",         responseKey: "rvf-sir" },
    { id: "rvf-enrollment",icon: <TrendingUp size={11}/>,   label: "Enrollment & revenue trend",   responseKey: "rvf-enrollment" },
    { id: "rvf-peer",      icon: <Search size={11}/>,       label: "Compare to peer financials",   responseKey: "rvf-peer" },
  ],
  "review:operational": [
    { id: "rvo-summary",   icon: <FileText size={11}/>,     label: "Summarize exposure profile",   responseKey: "rvo-summary" },
    { id: "rvo-athletics", icon: <AlertCircle size={11}/>,  label: "Athletics exposure deep-dive", responseKey: "rvo-athletics" },
    { id: "rvo-studyabroad",icon: <Search size={11}/>,      label: "Study-abroad summary",         responseKey: "rvo-studyabroad" },
    { id: "rvo-locations", icon: <Layers size={11}/>,       label: "Per-location exposure",        responseKey: "rvo-locations" },
  ],
  "review:governance": [
    { id: "rvg-missing",   icon: <AlertCircle size={11}/>,  label: "Outstanding docs needed",      responseKey: "rvg-missing",
      description: "Highlights the Title IX investigation log gap blocking this review." },
    { id: "rvg-titleix",   icon: <Flag size={11}/>,         label: "Title IX compliance status",   responseKey: "rvg-titleix" },
    { id: "rvg-hr",        icon: <ClipboardCheck size={11}/>,label: "HR policy review",            responseKey: "rvg-hr" },
    { id: "rvg-draft",     icon: <Mail size={11}/>,         label: "Draft request for missing log", responseKey: "rvg-draft" },
  ],
  "review:contractual": [
    { id: "rvc-training",  icon: <AlertCircle size={11}/>,  label: "Training completion gaps",     responseKey: "rvc-training" },
    { id: "rvc-coi",       icon: <ClipboardCheck size={11}/>,label: "Vendor COI compliance",       responseKey: "rvc-coi" },
    { id: "rvc-indemnity", icon: <FileText size={11}/>,     label: "Indemnity language summary",   responseKey: "rvc-indemnity" },
    { id: "rvc-credit",    icon: <Award size={11}/>,        label: "Premium credit eligibility",   responseKey: "rvc-credit" },
  ],
  "review:benchmarking": [
    { id: "rvb-compare",   icon: <TrendingUp size={11}/>,   label: "How do we compare to peers?",  responseKey: "rvb-compare" },
    { id: "rvb-toprisks",  icon: <Target size={11}/>,       label: "Top-risk alignment",           responseKey: "rvb-toprisks" },
    { id: "rvb-largeloss", icon: <AlertCircle size={11}/>,  label: "Large-loss vulnerability",     responseKey: "rvb-largeloss" },
    { id: "rvb-cohort",    icon: <Search size={11}/>,       label: "Peer cohort details",          responseKey: "rvb-cohort" },
  ],

  correspondence: [
    { id: "corr-summary", icon: <FileText size={11}/>,      label: "Summarize this thread",   responseKey: "corr-summary" },
    { id: "corr-reply",   icon: <Send size={11}/>,          label: "Draft a reply",            responseKey: "corr-reply" },
    { id: "corr-find",    icon: <Search size={11}/>,        label: "Find emails about…",       responseKey: "corr-find" },
  ],
  approvals: [
    { id: "apv-status",   icon: <Activity size={11}/>,      label: "Approval chain status",    responseKey: "apv-status" },
    { id: "apv-blockers", icon: <AlertCircle size={11}/>,   label: "What's blocking approval?", responseKey: "apv-blockers" },
    { id: "apv-justify",  icon: <FileText size={11}/>,      label: "Draft justification note",  responseKey: "apv-justify" },
    { id: "apv-history",  icon: <Clock size={11}/>,         label: "Prior authority decisions", responseKey: "apv-history" },
  ],
  audit: [
    { id: "aud-recent",   icon: <Clock size={11}/>,         label: "Recent activity",          responseKey: "aud-recent" },
    { id: "aud-who",      icon: <Users size={11}/>,         label: "Who touched this file?",    responseKey: "aud-who" },
    { id: "aud-changes",  icon: <Activity size={11}/>,      label: "Field-level changes",       responseKey: "aud-changes" },
    { id: "aud-export",   icon: <ExternalLink size={11}/>,  label: "Export audit log",          responseKey: "aud-export" },
  ],
  member: [
    { id: "mb-profile",   icon: <FileText size={11}/>,      label: "Member profile summary",    responseKey: "mb-profile" },
    { id: "mb-tenure",    icon: <Clock size={11}/>,         label: "Tenure & retention",        responseKey: "mb-tenure" },
    { id: "mb-broker",    icon: <Users size={11}/>,         label: "Broker performance",        responseKey: "mb-broker" },
    { id: "mb-contacts",  icon: <Mail size={11}/>,          label: "Key contacts",              responseKey: "mb-contacts" },
  ],
  risk: [
    { id: "rk-summary",   icon: <FileText size={11}/>,      label: "Risk profile summary",      responseKey: "rk-summary" },
    { id: "rk-exposure",  icon: <BarChart2 size={11}/>,     label: "Top exposures",             responseKey: "rk-exposure" },
    { id: "rk-controls",  icon: <ShieldCheck size={11}/>,   label: "Risk control posture",      responseKey: "rk-controls" },
    { id: "rk-flags",     icon: <Flag size={11}/>,          label: "Surface risk flags",        responseKey: "rk-flags" },
  ],
  loss: [
    { id: "ls-summary",   icon: <FileText size={11}/>,      label: "Loss history summary",      responseKey: "ls-summary" },
    { id: "ls-trends",    icon: <TrendingUp size={11}/>,    label: "Frequency & severity",      responseKey: "ls-trends" },
    { id: "ls-open",      icon: <AlertCircle size={11}/>,   label: "Open claims status",        responseKey: "ls-open" },
    { id: "ls-largest",   icon: <Target size={11}/>,        label: "Largest losses",            responseKey: "ls-largest" },
  ],

  // ─── Page-level adaptive suggestions (app-wide) ─────────────────────────────
  "dashboard-page": [
    { id: "dash-attention", icon: <AlertCircle size={11}/>, label: "What needs my attention?",  responseKey: "dash-attention" },
    { id: "dash-overdue",   icon: <Clock size={11}/>,       label: "Show overdue items",         responseKey: "dash-overdue" },
    { id: "dash-brief",     icon: <FileText size={11}/>,    label: "Brief me on the pipeline",   responseKey: "dash-brief" },
    { id: "dash-plan",      icon: <Target size={11}/>,      label: "Plan my day",                responseKey: "dash-plan" },
  ],
  "submissions-page": [
    { id: "subs-priority", icon: <Flag size={11}/>,         label: "Filter to high priority",   responseKey: "subs-priority" },
    { id: "subs-stale",    icon: <Clock size={11}/>,        label: "Show stale submissions",    responseKey: "subs-stale" },
    { id: "subs-broker",   icon: <Search size={11}/>,       label: "Find by broker",             responseKey: "subs-broker" },
    { id: "subs-new",      icon: <Plus size={11}/>,         label: "Start a new submission",     responseKey: "subs-new" },
  ],
  "new-submission-page": [
    { id: "new-required",  icon: <CheckCircle2 size={11}/>, label: "What fields are required?", responseKey: "new-required" },
    { id: "new-docs",      icon: <FileText size={11}/>,     label: "Required documents",         responseKey: "new-docs" },
    { id: "new-validate",  icon: <ClipboardCheck size={11}/>, label: "Validate my entries",     responseKey: "new-validate" },
  ],
  "inbox-page": [
    { id: "inbox-unread",  icon: <Mail size={11}/>,         label: "Show unread messages",      responseKey: "inbox-unread" },
    { id: "inbox-triage",  icon: <AlertCircle size={11}/>,  label: "Triage urgent emails",       responseKey: "inbox-triage" },
    { id: "inbox-reply",   icon: <Send size={11}/>,         label: "Draft a reply template",     responseKey: "inbox-reply" },
  ],
  "tasks-page": [
    { id: "tp-overdue",    icon: <AlertCircle size={11}/>,  label: "What's overdue?",            responseKey: "tp-overdue" },
    { id: "tp-priority",   icon: <Target size={11}/>,       label: "Suggest priorities",         responseKey: "tp-priority" },
    { id: "tp-sla",        icon: <Clock size={11}/>,        label: "Tasks at SLA risk",          responseKey: "tp-sla" },
    { id: "tp-reassign",   icon: <Users size={11}/>,        label: "Suggest reassignments",      responseKey: "tp-reassign" },
  ],
  "renewals-page": [
    { id: "ren-expiring", icon: <Calendar size={11}/>,      label: "Expiring this quarter",     responseKey: "ren-expiring" },
    { id: "ren-forecast", icon: <TrendingUp size={11}/>,    label: "Retention forecast",         responseKey: "ren-forecast" },
    { id: "ren-atrisk",   icon: <AlertCircle size={11}/>,   label: "At-risk renewals",           responseKey: "ren-atrisk" },
  ],
  "notes-page": [
    { id: "np-recent",     icon: <Clock size={11}/>,        label: "Recent notes",               responseKey: "np-recent" },
    { id: "np-mine",       icon: <FileText size={11}/>,     label: "My notes",                   responseKey: "np-mine" },
    { id: "np-actions",    icon: <CheckCircle2 size={11}/>, label: "Extract action items",       responseKey: "np-actions" },
  ],
  "approvals-page": [
    { id: "ap-pending",    icon: <Clock size={11}/>,        label: "Pending approvals",          responseKey: "ap-pending" },
    { id: "ap-mine",       icon: <ThumbsUp size={11}/>,     label: "My approval queue",          responseKey: "ap-mine" },
    { id: "ap-sla",        icon: <AlertCircle size={11}/>,  label: "Approval SLA status",        responseKey: "ap-sla" },
  ],
  "notifications-page": [
    { id: "nt-critical",   icon: <AlertCircle size={11}/>,  label: "Critical alerts",            responseKey: "nt-critical" },
    { id: "nt-recent",     icon: <Bell size={11}/>,         label: "Recent notifications",       responseKey: "nt-recent" },
    { id: "nt-settings",   icon: <Sparkles size={11}/>,     label: "Notification settings",      responseKey: "nt-settings" },
  ],
  "activity-page": [
    { id: "ac-today",      icon: <Clock size={11}/>,        label: "Today's activity",           responseKey: "ac-today" },
    { id: "ac-mine",       icon: <Activity size={11}/>,     label: "My recent actions",          responseKey: "ac-mine" },
    { id: "ac-team",       icon: <Users size={11}/>,        label: "Team activity",              responseKey: "ac-team" },
  ],
  "portfolio-page": [
    { id: "pf-lossratio",  icon: <BarChart2 size={11}/>,    label: "Loss ratio by segment",     responseKey: "pf-lossratio" },
    { id: "pf-forecast",   icon: <TrendingUp size={11}/>,   label: "Pipeline forecast",          responseKey: "pf-forecast" },
    { id: "pf-atrisk",     icon: <AlertCircle size={11}/>,  label: "At-risk accounts",           responseKey: "pf-atrisk" },
  ],
  "appetite-page": [
    { id: "ap-rules",      icon: <ShieldCheck size={11}/>,  label: "Show active rules",          responseKey: "appetite-rules" },
    { id: "ap-new",        icon: <Plus size={11}/>,         label: "Suggest a new rule",         responseKey: "appetite-new" },
    { id: "ap-changes",    icon: <Clock size={11}/>,        label: "Recent rule changes",        responseKey: "appetite-changes" },
  ],
  "quote-page": [
    { id: "qp-options",    icon: <Sparkles size={11}/>,     label: "Generate 5 options",         responseKey: "rate-5opts" },
    { id: "qp-compare",    icon: <TrendingUp size={11}/>,   label: "Compare to expiring",        responseKey: "rate-compare" },
    { id: "qp-send",       icon: <Send size={11}/>,         label: "Draft quote letter",         responseKey: "qp-send" },
  ],
};

// ─── Flat suggestion lookup (by responseKey) ─────────────────────────────────
// Used by the follow-up chip system so any response can route to any other
// suggestion regardless of tab.
const ALL_SUGGESTIONS: Record<string, Suggestion> = (() => {
  const out: Record<string, Suggestion> = {};
  for (const list of Object.values(SUGGESTIONS)) {
    if (!list) continue;
    for (const s of list) out[s.responseKey] = s;
  }
  return out;
})();

// ─── Follow-up registry (ChatGPT-style "next question" chips) ────────────────
// Map each responseKey → ordered list of follow-up responseKeys to surface
// after the assistant answers. Picked to advance the user's flow (drill in,
// take an action, or compare across dimensions).
const FOLLOW_UPS: Record<string, string[]> = {
  // Rating
  "rate-5opts":    ["rate-byproduct", "rate-why", "rate-compare"],
  "rate-compare":  ["rate-5opts", "rate-byproduct", "rate-appetite"],
  "rate-why":      ["rate-5opts", "rate-byproduct", "rate-compare"],
  "rate-appetite": ["rate-why", "rate-byproduct", "ov-blockers"],
  "rate-byproduct":["rate-5opts", "rate-why", "rate-appetite"],

  // Documents
  "doc-review":  ["doc-email", "doc-stale", "doc-summary"],
  "doc-email":   ["doc-review", "corr-reply", "ov-blockers"],
  "doc-summary": ["doc-review", "doc-stale"],
  "doc-stale":   ["doc-email", "doc-review"],

  // Overview
  "ov-summary":     ["ov-blockers", "ov-similar", "ov-dimensional"],
  "ov-blockers":    ["doc-email", "tasks-prio", "ov-summary"],
  "ov-similar":     ["ov-dimensional", "rate-compare", "ov-summary"],
  "ov-dimensional": ["ov-flags", "ov-companions", "ov-similar"],
  "ov-flags":       ["ov-blockers", "ov-dimensional", "doc-email"],
  "ov-companions":  ["ov-dimensional", "rate-appetite", "ov-summary"],

  // Notes & tasks
  "notes-byauthor": ["notes-actions", "np-recent"],
  "notes-actions":  ["tasks-prio", "tasks-overdue"],
  "tasks-overdue":  ["tasks-prio", "tp-sla", "tp-reassign"],
  "tasks-prio":     ["tasks-overdue", "tp-sla"],

  // Correspondence
  "corr-summary": ["corr-reply", "corr-find"],
  "corr-reply":   ["corr-find", "doc-email"],
  "corr-find":    ["corr-summary", "corr-reply"],

  // Approvals (submission tab)
  "apv-status":   ["apv-blockers", "apv-history", "apv-justify"],
  "apv-blockers": ["apv-justify", "apv-status"],
  "apv-justify":  ["apv-status", "apv-history"],
  "apv-history":  ["apv-status", "apv-blockers"],

  // Audit
  "aud-recent":  ["aud-who", "aud-changes"],
  "aud-who":     ["aud-changes", "aud-recent"],
  "aud-changes": ["aud-recent", "aud-export"],
  "aud-export":  ["aud-recent", "aud-changes"],

  // Member & Broker
  "mb-profile":  ["mb-tenure", "mb-broker", "mb-contacts"],
  "mb-tenure":   ["mb-profile", "mb-broker"],
  "mb-broker":   ["mb-contacts", "mb-tenure"],
  "mb-contacts": ["mb-broker", "corr-reply"],

  // Risk
  "rk-summary":  ["rk-exposure", "rk-flags", "rk-controls"],
  "rk-exposure": ["rk-flags", "rk-controls"],
  "rk-controls": ["rk-flags", "rk-summary"],
  "rk-flags":    ["rk-controls", "rk-exposure"],

  // Loss
  "ls-summary":  ["ls-trends", "ls-open", "ls-largest"],
  "ls-trends":   ["ls-largest", "ls-open"],
  "ls-open":     ["ls-largest", "ls-trends"],
  "ls-largest":  ["ls-trends", "ls-summary"],

  // UW Review (list + per-dimension)
  "rev-status":      ["rev-blockers", "rev-outstanding", "rev-suggest"],
  "rev-blockers":    ["rev-outstanding", "rvg-draft", "rev-suggest"],
  "rev-outstanding": ["doc-email", "rvg-draft"],
  "rev-suggest":     ["rev-blockers", "rev-status"],
  "rvl-summary":     ["rvl-frequency", "rvl-recurring", "rvl-reserves"],
  "rvl-frequency":   ["rvl-recurring", "rvl-layers"],
  "rvl-recurring":   ["rvl-frequency", "rvl-layers"],
  "rvl-reserves":    ["rvl-layers", "rvl-summary"],
  "rvl-layers":      ["rvl-reserves", "rvl-frequency"],
  "rvf-summary":     ["rvf-sir", "rvf-enrollment", "rvf-peer"],
  "rvf-sir":         ["rvf-enrollment", "rvf-peer"],
  "rvf-enrollment":  ["rvf-peer", "rvf-summary"],
  "rvf-peer":        ["rvf-summary", "rvf-sir"],
  "rvo-summary":     ["rvo-athletics", "rvo-locations", "rvo-studyabroad"],
  "rvo-athletics":   ["rvo-locations", "rvl-recurring"],
  "rvo-studyabroad": ["rvo-locations", "rvo-summary"],
  "rvo-locations":   ["rvo-athletics", "rvo-summary"],
  "rvg-missing":     ["rvg-draft", "rvg-titleix"],
  "rvg-titleix":     ["rvg-missing", "rvc-training"],
  "rvg-hr":          ["rvg-titleix", "rvc-training"],
  "rvg-draft":       ["rvg-missing", "rvg-titleix"],
  "rvc-training":    ["rvc-credit", "rvg-titleix"],
  "rvc-coi":         ["rvc-credit", "rvc-indemnity"],
  "rvc-indemnity":   ["rvc-coi", "rvc-training"],
  "rvc-credit":      ["rvc-training", "rvc-coi"],
  "rvb-compare":     ["rvb-toprisks", "rvb-largeloss", "rvb-cohort"],
  "rvb-toprisks":    ["rvb-largeloss", "rvb-compare"],
  "rvb-largeloss":   ["rvb-toprisks", "rvb-cohort"],
  "rvb-cohort":      ["rvb-compare", "rvb-toprisks"],

  // Page-level
  "dash-attention": ["dash-overdue", "dash-plan", "dash-brief"],
  "dash-overdue":   ["dash-plan", "tasks-prio"],
  "dash-brief":     ["dash-attention", "pf-forecast"],
  "dash-plan":      ["dash-overdue", "dash-attention"],
  "subs-priority":  ["subs-stale", "subs-broker"],
  "subs-stale":     ["subs-priority", "subs-broker"],
  "subs-broker":    ["subs-priority", "subs-stale"],
  "subs-new":       ["new-required", "new-docs"],
  "new-required":   ["new-docs", "new-validate"],
  "new-docs":       ["new-validate", "new-required"],
  "new-validate":   ["new-docs", "new-required"],
  "inbox-unread":   ["inbox-triage", "inbox-reply"],
  "inbox-triage":   ["inbox-reply", "inbox-unread"],
  "inbox-reply":    ["inbox-triage", "corr-reply"],
  "tp-overdue":     ["tp-priority", "tp-sla", "tp-reassign"],
  "tp-priority":    ["tp-overdue", "tp-sla"],
  "tp-sla":         ["tp-reassign", "tp-priority"],
  "tp-reassign":    ["tp-sla", "tp-priority"],
  "ren-expiring":   ["ren-atrisk", "ren-forecast"],
  "ren-forecast":   ["ren-atrisk", "ren-expiring"],
  "ren-atrisk":     ["ren-forecast", "ren-expiring"],
  "np-recent":      ["np-mine", "np-actions"],
  "np-mine":        ["np-recent", "np-actions"],
  "np-actions":     ["tasks-prio", "tasks-overdue"],
  "ap-pending":     ["ap-mine", "ap-sla"],
  "ap-mine":        ["ap-pending", "ap-sla"],
  "ap-sla":         ["ap-pending", "ap-mine"],
  "nt-critical":    ["nt-recent", "dash-attention"],
  "nt-recent":      ["nt-critical", "nt-settings"],
  "nt-settings":    ["nt-critical", "nt-recent"],
  "ac-today":       ["ac-mine", "ac-team"],
  "ac-mine":        ["ac-team", "ac-today"],
  "ac-team":        ["ac-mine", "ac-today"],
  "pf-lossratio":   ["pf-atrisk", "pf-forecast"],
  "pf-forecast":    ["pf-lossratio", "pf-atrisk"],
  "pf-atrisk":      ["pf-lossratio", "pf-forecast"],
  "appetite-rules":   ["appetite-changes", "appetite-new"],
  "appetite-new":     ["appetite-rules", "appetite-changes"],
  "appetite-changes": ["appetite-rules", "appetite-new"],
  "qp-send":          ["rate-5opts", "rate-compare"],
};

function resolveFollowUps(responseKey: string): Suggestion[] {
  const keys = FOLLOW_UPS[responseKey] ?? [];
  return keys.map(k => ALL_SUGGESTIONS[k]).filter((s): s is Suggestion => !!s);
}

// ─── Structured response payloads (rendered as custom components) ─────────────
interface RateOptionCard {
  code: string;          // e.g. "GL - 01" — matches Rating tab naming convention
  index: number;         // 1-based sequence used for chip/avatar display
  limit: string;
  aggregate: string;
  retention: string;
  premium: number;
  changePct: number;
  endorsements: string[];
  schedules: string[];
  memberBenefits: string[];
  notifyOn: string[];
  rationale: string;
}

const SAMPLE_PRODUCT_ID = "gl";
const SAMPLE_PRODUCT_ABBR = "GL";
const SAMPLE_PRODUCT_NAME = "Primary General Liability";

const optionCode = (idx: number) => `${SAMPLE_PRODUCT_ABBR} - ${String(idx).padStart(2, "0")}`;

function buildRateOptions(): RateOptionCard[] {
  return [
    { code: optionCode(1), index: 1, limit: "$1,000,000", aggregate: "$3,000,000", retention: "$25,000",  premium: 28400, changePct: 0,
      endorsements: ["Premises & Operations", "Sexual Abuse & Molestation"],
      schedules: ["All Brookfield campus buildings", "Athletic facilities"],
      memberBenefits: ["Loss Control Visit", "Risk Mgmt Resources"],
      notifyOn: ["uw","us","broker"],
      rationale: "Matches expiring program with no structural changes." },
    { code: optionCode(2), index: 2, limit: "$1,000,000", aggregate: "$2,000,000", retention: "$50,000",  premium: 24200, changePct: -7.0,
      endorsements: ["Premises & Operations", "Liquor Liability Extension"],
      schedules: ["All Brookfield campus buildings"],
      memberBenefits: ["Loss Control Visit"],
      notifyOn: ["uw","broker"],
      rationale: "Higher SIR and reduced aggregate trades premium for retention." },
    { code: optionCode(3), index: 3, limit: "$2,000,000", aggregate: "$5,000,000", retention: "$25,000",  premium: 32100, changePct: 8.8,
      endorsements: ["Premises & Operations", "Sexual Abuse & Molestation", "Volunteer Liability"],
      schedules: ["All Brookfield campus buildings", "Athletic facilities", "Off-campus trips"],
      memberBenefits: ["Loss Control Visit", "Title IX Counsel Hotline", "Risk Mgmt Resources"],
      notifyOn: ["uw","us","broker","member"],
      rationale: "Enhanced limits with SAM and volunteer extensions for board comfort." },
    { code: optionCode(4), index: 4, limit: "$1,000,000", aggregate: "$3,000,000", retention: "$10,000",  premium: 31600, changePct: 7.2,
      endorsements: ["Premises & Operations", "Broad Form Contractual"],
      schedules: ["All Brookfield campus buildings"],
      memberBenefits: ["Loss Control Visit", "Risk Mgmt Resources"],
      notifyOn: ["uw","broker"],
      rationale: "Lower retention is broker-friendly; small premium uplift acceptable." },
    { code: optionCode(5), index: 5, limit: "$1,000,000", aggregate: "$3,000,000", retention: "$50,000",  premium: 26900, changePct: -5.2,
      endorsements: ["Premises & Operations"],
      schedules: ["All Brookfield campus buildings"],
      memberBenefits: ["Risk Mgmt Resources"],
      notifyOn: ["uw"],
      rationale: "Stripped-down baseline — useful as a 'walk-away' anchor option." },
  ];
}

interface DocReviewItem {
  name: string;
  status: "validated" | "flagged" | "missing";
  notes?: string;
}

interface MissingDocsEmail {
  to: string;
  subject: string;
  body: string;
  docs: string[];
}

// ─── Internal chat-message types ──────────────────────────────────────────────
type StructuredPayload =
  | { kind: "rate-options"; productName: string; options: RateOptionCard[] }
  | { kind: "doc-review"; folder: string; items: DocReviewItem[] }
  | { kind: "missing-docs-email"; email: MissingDocsEmail }
  | { kind: "dimensional-review" }
  | { kind: "review-flags" }
  | { kind: "companion-suggestions" };

interface ChatMsg {
  id: string;
  role: "user" | "assistant";
  text?: string;
  payload?: StructuredPayload;
  followUps?: Suggestion[];
  ts: Date;
}

// ─── Response generators (deterministic mocks) ────────────────────────────────
function generateResponse(suggestion: Suggestion): { text?: string; payload?: StructuredPayload } {
  switch (suggestion.responseKey) {
    case "rate-5opts":
      return {
        text: "Here are 5 candidate rating options for " + SAMPLE_PRODUCT_NAME + ". Each one is calibrated against expiring + current loss ratio (58%). Tap any 'Use this option' to load it into the rating tab.",
        payload: { kind: "rate-options", productName: SAMPLE_PRODUCT_NAME, options: buildRateOptions() },
      };
    case "rate-compare":
      return {
        text: "vs. expiring policy (2025 — $26,400 written premium):\n\n• Total exposure ↑ 6.2% (enrollment +52, TIV +$1.8M)\n• Loss ratio 58% (slight ↑ from 54%) — driven by 1 ELL Title IX matter\n• Endorsement set unchanged\n\nIndication: +5.5% to +8% rate is in range. A flat hold is defensible given the long member tenure and stable book.",
      };
    case "rate-why":
      return {
        text: `Recommendation rationale — ${optionCode(1)} (Standard terms):\n\n1. Loss ratio under target (58% < 65%)\n2. No new exposure changes outside normal growth\n3. SAM endorsement remains valuable given exposure profile\n4. 3-yr rate lock captures the account\n5. Broker has signaled board approval likely with flat renewal\n\n${optionCode(1)} balances retention with appropriate coverage.`,
      };
    case "rate-appetite":
      return {
        text: "Appetite check — " + SAMPLE_PRODUCT_NAME + ":\n\n✓ Class code (Private K-12) — IN appetite\n✓ Enrollment 842 — IN range (target ≤2,500)\n✓ Loss ratio 58% — IN appetite (≤65%)\n✓ TIV $185M — IN range\n⚠ SAM exposure $5M sublimit — review with reinsurance for limits >$5M\n\nResult: This account is squarely in our underwriting appetite. Standard authority applies.",
      };
    case "rate-byproduct":
      return {
        text:
          "5 product-tailored option ideas for Brookfield Day School (EPL · ELL · GL · CYBER):\n\n" +
          "1. EPL · Outside-limit defense — Member-side win; UE charges +8–12% on K-12 for this.\n" +
          "2. ELL · Tighten retention $50K → $75K — ~6% premium relief; ELL claim development supports the move.\n" +
          "3. GL · Raise SIR $50K → $75K — Typical 5–7% relief on K-12 GL; documented playground inspection history supports it.\n" +
          "4. Cyber · MFA credit — Verify MFA on email + admin systems to claim the standard 10% credit.\n" +
          "5. ELL · Apply Title IX credit — −3% if mandatory harassment training is current and documented.\n\n" +
          "Each option is drawn from the lines actually on this submission, rotated across products. Tap any to apply it to the Rating tab.",
      };
    case "doc-review":
      return {
        text: "Document review for the active folder:",
        payload: {
          kind: "doc-review",
          folder: "Active folder",
          items: [
            { name: "ACORD 125 Application 2024.pdf",      status: "validated" },
            { name: "Audited Financial Statement FY23.pdf", status: "validated" },
            { name: "5-Year Certified Loss Runs.xlsx",      status: "flagged", notes: "FY19 row appears truncated — confirm with broker." },
            { name: "EEO Policy Statement.pdf",             status: "missing" },
            { name: "Property Schedule & Valuations.xlsx",  status: "missing" },
          ],
        },
      };
    case "doc-email":
      return {
        text: "Drafted a broker-ready email for the missing required documents:",
        payload: {
          kind: "missing-docs-email",
          email: {
            to: "t.owens@gallaghered.com",
            subject: "Missing documents — Brookfield Day School submission",
            body:
`Hi Tom,

To finalize the renewal for Brookfield Day School we still need the following items. Could you please send these by end of day Wednesday so we can hold the original quote timeline?

  1. EEO Policy Statement (EPL)
  2. Sexual Misconduct Policy (ELL)
  3. Property Schedule & Valuations (GL)

If any of these are already on file with a prior carrier and not currently available, let me know and we can discuss alternatives.

Thanks,
Maya Khanna
Sr. Underwriter · Northeast
United Educators`,
            docs: ["EEO Policy Statement (EPL)", "Sexual Misconduct Policy (ELL)", "Property Schedule & Valuations (GL)"],
          },
        },
      };
    case "doc-summary":
      return {
        text: "Folder contents — 6 documents:\n\n• Application — ACORD 125 (validated), Faculty Roster (validated)\n• Financial — Audited FY23 (validated)\n• Loss — 5-Year Runs (flagged — possible row truncation)\n• Compliance — OFAC Screening (validated)\n• Member — Information Profile (in review)\n\n2 of 6 still need action. Coverage by category is complete except Loss (1 flagged) and Compliance (1 missing EEO statement at the product level).",
      };
    case "doc-stale":
      return {
        text: "Stale documents (last modified > 12 months ago):\n\n• EPL Application Supplement.pdf — Mar 2024 (just over 12mo as of today). Refresh recommended.\n• Title IX Coordinator Certification.pdf — Mar 2024. Member should confirm coordinator hasn't changed.\n\nNo other documents in this folder are stale.",
      };
    case "ov-summary":
      return {
        text: "Submission summary — Brookfield Day School (SUB-7829):\n\n• Private K-12 · 842 students · Westport, CT · member since 2014\n• 4 coverage lines: EPL, ELL, GL, Cyber · effective 6/1/2026\n• Expiring premium $132,400 → quoted $142,800 (+7.8%)\n• Loss ratio 58% over 6 years (target ≤65%) · 2 open claims\n• Broker: T. Owens / Gallagher Education · Need-by Apr 28 (7 days)\n• Documents 73% complete · 3 missing required",
      };
    case "ov-blockers":
      return {
        text: "Currently blocking the quote:\n\n1. 3 required documents missing (EEO Policy, Sexual Misconduct Policy, Property Schedule)\n2. Open ELL claim — Title IX investigation. Awaiting closing memo from Claims.\n3. 3-yr rate-lock authority referral — submitted Apr 18, pending UW Manager approval (likely cleared by EOD)",
      };
    case "ov-similar":
      return {
        text: "Comparable accounts in the book (Private K-12, 600–1,200 enrollment, NE region):\n\n• Greenwich Academy — 740 students · 51% LR · renewed flat 2024\n• Choate Rosemary Hall — 920 students · 47% LR · 3% rate decrease\n• Hopkins School — 720 students · 62% LR · flat renewal with SAM enhancement\n\nBrookfield's loss ratio is mid-pack; pricing in line with cohort.",
      };
    case "ov-dimensional":
      return {
        text: "Dimensional auto-review — AI scoring across the three review dimensions:",
        payload: { kind: "dimensional-review" },
      };
    case "ov-flags":
      return {
        text: "Review flags surfaced during the automated underwriting review:",
        payload: { kind: "review-flags" },
      };
    case "ov-companions":
      return {
        text: "Companion products recommended based on the submission's risk profile:",
        payload: { kind: "companion-suggestions" },
      };
    case "notes-byauthor":
      return { text: "Notes by author:\n\n• Maya Khanna (3) — initial review, rate strategy, authority-referral plan\n• Devon Carter (2) — risk discussion, ELL Title IX context\n• Priya Singh (1) — claims status note linked to ELL matter" };
    case "notes-actions":
      return { text: "Action items extracted from notes:\n\n☐ Confirm SAM sublimit at $5M with reinsurance (Maya, by Apr 22)\n☐ Pull Title IX closing memo from Claims (Maya, by Apr 24)\n☐ Send quote letter to broker (Maya, by Apr 24 EOD)\n☐ Schedule loss control visit Q3 (Devon, by Sep)" };
    case "tasks-overdue":
      return { text: "Currently overdue tasks (3):\n\n• Confirm SAM sublimit with reinsurance — 2 days late\n• Pull Title IX closing memo — 1 day late\n• Update lifecycle stage to 'Quoted' — 1 day late\n\nRecommend tackling SAM confirmation first (blocks quote letter)." };
    case "tasks-prio":
      return { text: "Suggested priority order:\n\n1. SAM sublimit confirmation (BLOCKS quote)\n2. Send quote letter (BROKER WAITING)\n3. Title IX closing memo (does not block quote)\n4. Lifecycle stage update (housekeeping)\n5. Q3 loss control visit (scheduling)" };
    case "corr-summary":
      return { text: "Thread summary:\n\nQuote-clarification exchange with broker T. Owens. Two-step negotiation: broker asked for 12% decrease + SIR clarification; you offered a flat renewal with SAM at $5M sublimit and a 3-yr lock option. Broker accepted on Apr 18 — board meeting Thursday, quote letter needed Wednesday EOD." };
    case "corr-reply":
      return { text: "Draft reply:\n\n\"Tom — confirmed. I'll have the formal quote letter to you by EOD Wednesday with the flat renewal, $5M SAM endorsement, and 3-yr rate-lock option attached. Let me know if the board needs any additional materials for the Thursday meeting.\n\nMaya\"" };
    case "corr-find":
      return { text: "Top matches for emails (search broader subject + body):\n\n1. \"Quote clarification — Primary GL terms\" (3 messages, 1 unread)\n2. \"Renewal application package\" (1 message, 3 attachments)\n3. \"Missing documents\" (1 outbound message)\n\nUse the search box on the Correspondence tab for narrower queries." };

    // ─── Dashboard ────────────────────────────────────────────────────────────
    case "dash-attention":
      return { text: "Items needing your attention today:\n\n🔴 2 critical alerts\n  • SUB-7835 Seattle PS — Safety Questionnaire missing (7 days overdue)\n  • SUB-7831 Austin ISD — Review overdue 16 days\n\n🟡 3 overdue tasks\n  • Request missing safety questionnaire (Critical)\n  • Review GASB 68 pension liability (Medium)\n  • Confirm COPE survey receipt (Low)\n\n🔵 4 quotes expiring within 5 days" };
    case "dash-overdue":
      return { text: "All overdue items across your portfolio:\n\n• SUB-7831 — Austin ISD review, 16 days overdue\n• SUB-7835 — Seattle PS docs, 7 days overdue\n• T-1041 — Safety questionnaire request, 1 day late\n• T-1032 — GASB 68 review, 2 days late\n• T-1047 — COPE survey confirm, 1 day late\n\nRecommend tackling SUB-7831 first — escalation risk." };
    case "dash-brief":
      return { text: "Pipeline brief (this week):\n\n• In Review: 12 (↑ 2 vs last week)\n• Quoted: 19 ($4.2M premium)\n• Bound YTD: 31 ($3.1M, on target)\n• Hit Ratio: 72% (+4pp vs last year)\n• Avg days to quote: 4.1d (within SLA)\n\nConversion slowed slightly — 3 price-driven declines this week. Pricing review suggested." };
    case "dash-plan":
      return { text: "Suggested plan for today:\n\n☐ AM — Resolve SUB-7831 escalation (Austin ISD, 16d overdue)\n☐ AM — Send safety questionnaire reminder to broker (Seattle PS)\n☐ Mid-day — Review 3 quotes near expiry (SUB-7830, 7818, 7829)\n☐ PM — GASB 68 pension review (Vanderbilt, 2d late)\n☐ EOD — Update lifecycle stages for the 7 ready-to-quote submissions" };

    // ─── Submissions page ─────────────────────────────────────────────────────
    case "subs-priority":
      return { text: "High & Critical priority submissions (5):\n\n🔴 SUB-7835 — Seattle Public Schools (Critical)\n🟠 SUB-7829 — Riverside Unified School District (High)\n🟠 SUB-7831 — Austin ISD (High)\n🟠 SUB-7839 — Clark County School District (High)\n🟠 SUB-7841 — Cobb County School District (Medium)\n\nFocus order: Critical → SLA-at-risk → newest in-review." };
    case "subs-stale":
      return { text: "Stale submissions (>21 days in queue):\n\n• SUB-7836 — Charlotte-Mecklenburg, 32 days · Quoted, awaiting bind\n• SUB-7841 — Gwinnett County, 30 days · Quoted\n• SUB-7835 — Seattle PS, 28 days · Pending Info\n• SUB-7831 — Austin ISD, 25 days · Pending Info\n\nMost stalls are upstream (docs / member sign-off). Send broker pings." };
    case "subs-broker":
      return { text: "Top brokers by volume in your queue:\n\n• Gallagher Education (4 subs · $312K written)\n• Marsh McLennan (3 subs · $284K)\n• Lockton Companies (2 subs · $327K)\n• Willis Towers Watson (2 subs · $401K)\n• Alliant Insurance (1 sub · $231K)\n\nUse the Filters panel → Broker to narrow further." };
    case "subs-new":
      return { text: "To start a new submission, click the gold **+ New Submission** button in the page header — or navigate to /submissions/new. I'll guide you through Account → Broker → Coverage → Documents." };

    // ─── New Submission ───────────────────────────────────────────────────────
    case "new-required":
      return { text: "Required fields for a submission:\n\n• Account Name\n• Submission Type (New Business / Cross-Sell / Renewal)\n• Products (at least 1 coverage line)\n• Effective Date\n• Need-by Date\n• Broker Contact\n\nOptional but recommended: Loss-run uploads, prior carrier info, Audited financials." };
    case "new-docs":
      return { text: "Documents needed at intake:\n\n📄 Universal\n  • ACORD 125 Application\n  • Audited Financial Statement (most recent fiscal year)\n  • 5–7 year Loss Runs\n\n📄 Per-product (triggered automatically)\n  • EPL → EEO Policy Statement\n  • ELL → Title IX Certification, Sexual Misconduct Policy\n  • GL → Property Schedule, Building Inspection\n  • Cyber → IT Security Policy, Data Breach Response Plan" };
    case "new-validate":
      return { text: "Quick validation pass:\n\n✓ Account is in UE appetite (Private K-12 · 600–2,500 enrollment)\n✓ Effective date is at least 30 days out\n⚠ Loss runs uploaded — verify they cover 5+ years\n⚠ Need-by date is < 14 days — consider rush-handling indicator\n\nFix the ⚠ items before submitting to avoid intake bounce-back." };

    // ─── Inbox ────────────────────────────────────────────────────────────────
    case "inbox-unread":
      return { text: "Unread messages (6):\n\n• T. Owens (Gallagher) — Quote clarification, Mar 18\n• A. Cruz (Marsh) — Loss run follow-up, Mar 17\n• Compliance system — OFAC clearance, Mar 17\n• D. Park (Lockton) — Renewal timeline, Mar 16\n• Claims dept — CLM-2021-027 status, Mar 15\n• System — 3 missing documents notification" };
    case "inbox-triage":
      return { text: "Triage priority (top 3):\n\n1. Claims dept — CLM-2021-027 status (BLOCKS quote for SUB-7829)\n2. T. Owens — Quote clarification (broker waiting since Mar 18)\n3. D. Park — Renewal timeline (board meeting Thursday)\n\nThe rest can wait until tomorrow." };
    case "inbox-reply":
      return { text: "Reply template — \"Quote clarification\":\n\n\"Hi {Broker},\n\nThanks for the quick turnaround. I've reviewed the request and can confirm:\n\n• Limits & retention — {confirmed / adjusted to X}\n• Endorsement set — {standard / with SAM addition}\n• Rate-lock option — available at 3-yr\n\nI'll have the formal quote letter to you by EOD {date}. Let me know if you need anything else for the board meeting.\n\nThanks,\n{Underwriter}\"\n\nCopy and personalize per email." };

    // ─── Tasks page ───────────────────────────────────────────────────────────
    case "tp-overdue":
      return { text: "Overdue tasks (3):\n\n🔴 T-1041 — Safety questionnaire request (Critical, 1d late)\n🔴 T-1032 — GASB 68 pension review (Medium, 2d late)\n🟡 T-1047 — COPE survey confirm (Low, 1d late)\n\nT-1041 blocks the quote — tackle first." };
    case "tp-priority":
      return { text: "Suggested priority order:\n\n1. T-1041 Safety questionnaire (BLOCKS quote · Critical)\n2. T-1044 Send indicative quote to broker (broker waiting)\n3. T-1045 Appetite review — low score flag (Decision needed)\n4. T-1032 GASB 68 review (overdue, doesn't block)\n5. T-1043 TIV adequacy check (informational)\n\nTop 3 are the day's hot items." };
    case "tp-sla":
      return { text: "Tasks at SLA risk (≥80% SLA used):\n\n• T-1041 — 112% (BREACHED)\n• T-1032 — 108% (BREACHED)\n• T-1038 — 95% (3.6h remaining)\n• T-1049 — 90% (7h remaining)\n• T-1045 — 88% (5.8h remaining)\n\n5 tasks; 2 already past SLA. Manager escalation recommended for the 2 breaches." };
    case "tp-reassign":
      return { text: "Reassignment suggestions (workload balance):\n\n• Sarah Mitchell — 5 open tasks (above team avg)\n  → Reassign T-1040 (Earthquake zone confirm) to James Owens (2 open)\n• Tom Lee — 3 tasks (capacity available)\n  → Pull T-1043 (TIV check) from John Michaels\n\nBalances the team without breaking any SLA." };

    // ─── Renewals ─────────────────────────────────────────────────────────────
    case "ren-expiring":
      return { text: "Renewals expiring this quarter (Q3 2024 effective dates):\n\n• Brookfield Day School — Jun 1, 2024 ($142K quoted)\n• Riverside USD — Jul 1, 2024 ($112K)\n• Austin ISD — Aug 1, 2024 ($87K)\n• Denver Public Schools — Jul 1, 2024 ($158K bound)\n• Seattle Public Schools — Jul 1, 2024 ($231K — at risk)\n\nTotal exposure $730K · 3 still actionable." };
    case "ren-forecast":
      return { text: "Retention forecast (rolling 12-month):\n\n• Q1 2024 — 87% retention (above 82% sector)\n• Q2 2024 — 84% projected\n• Q3 2024 — 81% projected (Seattle PS at risk)\n• Q4 2024 — 86% projected\n\nFull-year forecast: ~84%. Push on the 2 at-risk K-12 accounts to lift this back to 86%." };
    case "ren-atrisk":
      return { text: "At-risk renewals (flagged for special handling):\n\n🔴 Seattle Public Schools — pricing pushback, broker exploring market\n🟠 Phoenix Charter Academy — appetite score 41 (below threshold)\n🟠 Clark County School District — declined last year, re-considering\n🟡 Chicago Lab Schools — board change, decision delayed\n\nRecommend underwriter calls on the top 3 within 7 days." };

    // ─── Notes page ───────────────────────────────────────────────────────────
    case "np-recent":
      return { text: "Recent notes (last 7 days):\n\n• SUB-7829 — Maya Khanna · ELL Title IX context update (Mar 18)\n• SUB-7836 — Devon Carter · Risk discussion w/ broker (Mar 17)\n• SUB-7831 — Maya Khanna · Authority referral plan (Mar 17)\n• SUB-7835 — Priya Singh · Claims status link to ELL matter (Mar 16)\n• SUB-7829 — Maya Khanna · Initial review pass (Mar 15)" };
    case "np-mine":
      return { text: "Your notes (last 30 days, 11 entries):\n\n• 4 on SUB-7829 (Riverside USD)\n• 3 on SUB-7836 (Brookfield Day School)\n• 2 on SUB-7831 (Austin ISD)\n• 2 on SUB-7841 (Gwinnett County)\n\nTop themes: rate strategy, Title IX context, authority referrals." };
    case "np-actions":
      return { text: "Action items extracted from recent notes:\n\n☐ Confirm SAM sublimit at $5M with reinsurance (Maya, by Apr 22)\n☐ Pull Title IX closing memo from Claims (Maya, by Apr 24)\n☐ Send quote letter to Gallagher (Maya, by Apr 24 EOD)\n☐ Schedule loss control visit Q3 (Devon, by Sep)\n☐ Update lifecycle stage on SUB-7831 (Maya, today)" };

    // ─── Approvals page ───────────────────────────────────────────────────────
    case "ap-pending":
      return { text: "Pending approvals (4):\n\n• SUB-7829 — 3-yr rate-lock authority (submitted Apr 18 · Manager review)\n• SUB-7831 — Premium $200K+ authority (submitted Apr 16 · Director)\n• SUB-7836 — Reinsurance referral SAM $5M (submitted Apr 17 · Re team)\n• SUB-7842 — Bind authority over $250K (submitted Apr 19 · Manager)\n\nLikely cleared today: SUB-7829, SUB-7842." };
    case "ap-mine":
      return { text: "Your approval queue (2 awaiting):\n\n• SUB-7831 — Authority referral, requested by Maya · 18h pending\n• SUB-7836 — Reinsurance check, requested by Devon · 1d pending\n\nBoth within SLA. Manager dashboard shows 0 escalations." };
    case "ap-sla":
      return { text: "Approval SLA status:\n\n• Avg approval time: 1.8 days (target ≤2)\n• Within-SLA rate: 91% (target ≥85%) ✓\n• Currently at risk: 0 approvals\n• Breached this month: 1 (reinsurance referral, day 4)\n\nTeam performance trending green this month." };

    // ─── Notifications page ───────────────────────────────────────────────────
    case "nt-critical":
      return { text: "Critical alerts (2):\n\n🔴 SUB-7835 — Safety Questionnaire missing (Seattle PS, 7d overdue)\n🔴 SUB-7831 — Review overdue 16 days (Austin ISD, SLA breached)\n\nBoth require action today. Click each to open the submission." };
    case "nt-recent":
      return { text: "Recent notifications (last 24h, 8):\n\n• 2 critical alerts (see above)\n• 3 broker emails received (Gallagher x2, Marsh x1)\n• 1 quote bound (SUB-7833 Denver PS, $158K)\n• 1 approval granted (SUB-7829 3-yr rate-lock)\n• 1 reinsurance reply (SUB-7836 SAM at $5M cleared)" };
    case "nt-settings":
      return { text: "Notification preferences:\n\n• Critical alerts → Push + Email (always)\n• Broker emails → Push when assigned\n• Approval status → Email\n• Quote-bound events → Daily digest\n• Pipeline weekly → Friday 5 PM\n\nAdjust in Settings → Notifications." };

    // ─── Activity page ────────────────────────────────────────────────────────
    case "ac-today":
      return { text: "Activity today (12 events):\n\n• 09:14 — Reviewed SUB-7829 (you)\n• 09:42 — Note added to SUB-7836 (Devon)\n• 10:05 — Quote letter sent to Gallagher (you)\n• 10:18 — SUB-7833 bound — $158K (Tom)\n• 10:30 — 3 documents uploaded by broker for SUB-7841\n• … 7 more entries\n\nTeam was most active 10–11 AM (5 events in that hour)." };
    case "ac-mine":
      return { text: "Your recent actions (today, 6):\n\n• Reviewed SUB-7829 — 1.5h spent\n• Sent quote letter to Gallagher (SUB-7829)\n• Added note to SUB-7831 (authority referral plan)\n• Marked T-1044 complete\n• Approved SUB-7842 bind authority request\n• Updated lifecycle on SUB-7836 → Quoted" };
    case "ac-team":
      return { text: "Team activity heatmap (Team Alpha, last 7 days):\n\n• You — 47 actions\n• John Michaels — 52 actions\n• Sarah Mitchell — 38 actions\n• Tom Lee — 29 actions\n• James Owens — 24 actions\n\nTeam avg 38/wk. James and Tom below avg — possible capacity, candidates for redistribution." };

    // ─── Portfolio page ───────────────────────────────────────────────────────
    case "pf-lossratio":
      return { text: "Loss ratio by segment (5-yr avg):\n\n• K-12 Public — 58% (target ≤65%) ✓\n• Higher Ed — 44% ✓\n• Charter Schools — 72% ⚠ (above target)\n• Private School — 51% ✓\n\nCharter is the outlier. Recent CLM activity in 2 charter accounts is dragging the ratio." };
    case "pf-forecast":
      return { text: "Pipeline forecast (next 90 days):\n\n• In Review — 12 (typical conversion 78%) → 9.4 quotes expected\n• Quoted — 19 (typical bind rate 72%) → 13.7 binds expected\n• Total expected new premium: $1.8M\n• YTD on track for $3.5M new business (target $3.2M) ✓\n\nForecast confidence: high (12-mo trailing accuracy 94%)." };
    case "pf-atrisk":
      return { text: "At-risk accounts (loss ratio > 70%):\n\n• Phoenix Charter Academy — 87% LR · 5-yr · Decline candidate\n• Chicago Lab Schools — 78% LR · 3-yr · Re-rate at renewal\n• San Jose Charter Network — 75% LR · 4-yr · Add SIR increase\n• 1 more in monitoring (under threshold)\n\nTotal exposure at-risk: $187K written premium." };

    // ─── Appetite Rules page ──────────────────────────────────────────────────
    case "appetite-rules":
      return { text: "Active appetite rules (12 total · 3 highlighted):\n\n• Class — Private K-12 (IN) · 600–2,500 enrollment\n• Class — Higher Ed (IN) · ≤25,000 FTE\n• Class — Charter Schools (CAUTION) · loss ratio ≤65%\n• Geography — All US states except FL coastal Tier 1\n• Loss Ratio — max 65% rolling 5-yr\n• TIV per location — max $50M without referral\n\nUse Settings → Appetite to view all 12." };
    case "appetite-new":
      return { text: "Suggested new rule (based on recent decline patterns):\n\nRule: \"Charter Schools — automatic referral when loss ratio ≥ 60%\"\n\nRationale: 3 of last 4 charter accounts with LR ≥ 60% later breached the 65% threshold within 24 months. Early referral catches this 18 months sooner.\n\nReview with leadership before publishing." };
    case "appetite-changes":
      return { text: "Recent rule changes (last 30 days):\n\n• Apr 12 — Added: \"TIV per location > $50M requires referral\"\n• Apr 8 — Tightened: K-12 enrollment min lifted 500 → 600\n• Mar 28 — Removed: Restricted \"single-site academic centers\" (no longer an exclusion)\n\nAll changes signed off by Director (R. Chen)." };

    // ─── Quote builder ────────────────────────────────────────────────────────
    case "qp-send":
      return { text: "Draft quote letter — ready to send:\n\nTo: T. Owens / Gallagher Education\nSubject: Brookfield Day School — Renewal Quote SUB-7829\n\nDear Tom,\n\nPlease find attached our formal quote for the renewal of Brookfield Day School (effective 7/1/2024). Highlights:\n\n  • Limits: $1M / $3M GL\n  • SAM endorsement: $5M sublimit\n  • 3-yr rate-lock option enclosed\n  • Premium: $142,800 (+7.8% indicated)\n\nValid 30 days. Let me know if you need adjustments before the Thursday board meeting.\n\nBest,\nMaya Khanna" };

    // ─── Underwriting Review — list view ──────────────────────────────────────
    case "rev-status":
      return { text: "UW Review checklist — 6 dimensions:\n\n✓ Loss Run & Claims History — Caution (1 recurring trend: athletic slip-falls)\n✓ Financial Document Review — Pass\n✓ Operational & Exposure — Pass (football flagged for monitoring)\n⚠ Governance & Mgmt Liability — Missing docs (Title IX investigation log)\n⚠ Contractual & Risk Control — Caution (Title IX training at 71%, target 85%)\n✓ Comparable Risk Benchmarking — Pass\n\n4 ready to approve · 1 needs broker follow-up · 1 needs training escalation." };
    case "rev-blockers":
      return { text: "Blocking sign-off:\n\n1. Title IX Investigation Log — outstanding from broker. Required for Governance review.\n2. Title IX Training Completion at 71% — below 85% policy threshold. Schedule make-up sessions or document mitigation plan.\n\nNo other blockers. Once these clear, 6/6 reviews can be finalized." };
    case "rev-outstanding":
      return { text: "Outstanding documents across all reviews:\n\n• Title IX Investigation Log (Governance — required)\n\nThat's it. All other required docs are received. 19 of 20 required docs in hand (95%)." };
    case "rev-suggest":
      return { text: "Suggested approve/refer mix:\n\nApprove (4):\n  • Loss Run & Claims — frequency flag noted, mitigations in place\n  • Financial Review — solid margins and SIR funding\n  • Operational & Exposure — football monitoring noted in file\n  • Risk Benchmarking — outperforms peer cohort\n\nRefer (2):\n  • Governance & Mgmt Liability — refer until Title IX log received\n  • Contractual & Risk Control — refer to Sr. UW for training plan signoff\n\nThis would clear the file with documented referrals on the open items." };

    // ─── Underwriting Review — Loss Run & Claims (review:loss-run) ────────────
    case "rvl-summary":
      return { text: "Loss Run & Claims summary (5-yr):\n\n• 12 claims total · $182K incurred · $46K reserves on 2 open\n• Loss Ratio 58% (Target ≤65%) ✓\n• Avg severity $38K · 1 outlier event ($425K TBI / athletics)\n• 4 of 12 claims (33%) are athletic slip-and-falls — recurring trend\n\nFinding: Loss ratio is within appetite; the trend in athletics SOPs should be noted to Risk Control for follow-up." };
    case "rvl-frequency":
      return { text: "Frequency vs. Severity split:\n\nFREQUENCY (claims/yr):\n  2020 — 1 · 2021 — 3 · 2022 — 2 · 2023 — 4 · 2024 — 2\n  5-yr avg: 2.4/yr (peer avg 1.6) — slightly elevated\n\nSEVERITY:\n  Median: $14K · Mean: $38K\n  Top event: $425K (2023, TBI / football)\n  4 events <$10K · 7 events $10K–$50K · 1 event >$100K\n\nThe pattern is mostly low-severity volume with one tail event. Reserves cover the tail risk." };
    case "rvl-recurring":
      return { text: "Recurring claim types:\n\n1. Athletic slip-and-fall — 4 of 12 (33%) ⚠\n   Pattern: wet weather access points + bleacher steps. Indicates an SOP weakness.\n2. Student-on-student incident — 3 of 12 (25%)\n   All resolved at <$15K each; standard supervision matters.\n3. Vehicle damage on premises — 2 of 12\n4. Misc property — 3 of 12\n\nRecommendation: Flag athletic SOPs to Risk Control as a pre-bind action." };
    case "rvl-reserves":
      return { text: "Reserve adequacy check:\n\n• 2 open claims · $46K total reserves · $182K incurred to date\n• Both open <12 months old; reserves established within 30 days of report\n• Carrier reserve methodology aligns with our standards (case + IBNR)\n• Historical reserve development: -3% (slight savings) over 3-yr lookback\n\nFinding: Reserves are adequate. No additional reserve action needed on this submission." };
    case "rvl-layers":
      return { text: "Excess layer piercing — 5-yr history:\n\nPrimary $1M limit: tested by 2 claims, neither breached\n  • $425K TBI event (2023) — closed within primary\n  • $98K Title IX matter (2022) — closed within primary\nExcess $4M xs $1M: untouched in 5-yr period\n\nFinding: No layer piercing. Excess capacity is intact and adequately rated." };

    // ─── Underwriting Review — Financial Review (review:financial) ────────────
    case "rvf-summary":
      return { text: "Financial summary (3-yr):\n\n• Operating margin: 4.8% avg (peer 3.2%) ✓\n• Days cash on hand: 186 (peer 140) ✓\n• Enrollment trend: +6.2% YoY (842 → 894)\n• SIR fund: 112% funded · current actuarial opinion on file\n\nFinding: Institution has the capacity to fund its SIR. No financial flags." };
    case "rvf-sir":
      return { text: "SIR funding adequacy:\n\n• SIR per claim: $50,000\n• Annual expected hit rate (5-yr avg): 2.4 claims ≈ $96K\n• Reserve fund balance: $540K\n• Funded ratio: 112% (target ≥100%) ✓\n• Latest actuarial opinion: 11 months old (current within 12 mo)\n\nThe SIR is well-funded and the actuarial opinion is timely. This satisfies the FDM requirement." };
    case "rvf-enrollment":
      return { text: "Enrollment & revenue trend (5-yr):\n\nYear · Enrollment · Tuition Revenue\n2020 · 802 · $22.1M\n2021 · 818 · $22.6M\n2022 · 829 · $22.9M\n2023 · 842 · $23.6M\n2024 · 894 · $24.6M\n\nCAGR: enrollment +2.2% · revenue +2.7%. Stable upward trend — supports institutional health and member-fit." };
    case "rvf-peer":
      return { text: "Peer financial comparison (K-12 cohort · 47 schools):\n\nMetric           · This account · Peer median\nOperating Margin · 4.8%        · 3.2%\nDays Cash on Hand· 186         · 140\nEnrollment YoY   · +6.2%       · +1.8%\nSIR Funded Ratio · 112%        · 104%\n\nOutperforms peers on every financial metric. Strong member-fit profile." };

    // ─── Underwriting Review — Operational (review:operational) ───────────────
    case "rvo-summary":
      return { text: "Operational & Exposure summary:\n\n• 894 students · 142 staff · 3 campus locations\n• 11 athletic programs (incl. football, basketball)\n• 18 study-abroad placements · 44 IPL/internship placements\n• Labs/research: 31 active student researchers\n\nFinding: Exposure profile is typical for a private K-12 with athletic emphasis. Football remains the primary monitoring point." };
    case "rvo-athletics":
      return { text: "Athletics exposure deep-dive:\n\nProgram-by-program:\n  • Football       — 64 student-athletes ⚠ (TBI risk)\n  • Basketball     — 42 student-athletes\n  • Other (track, soccer, baseball, etc.) — 188 student-athletes\n\nSafety program: Concussion protocol current; baseline neurocognitive testing in place. Athletic trainers on staff (2 FTE).\n\nHistorical: 1 athletic claim has reached primary limits in 5-yr period ($425K TBI, 2023). No claims pending on 2024 season." };
    case "rvo-studyabroad":
      return { text: "Study-abroad summary:\n\n• 18 students currently placed across 6 countries\n• All under master vendor agreements with carrier-vetted providers\n• Pre-departure orientation + 24/7 emergency line documented\n• 0 claims in 5-yr history\n\nRisk profile: low. Vendor agreements transfer most operational liability." };
    case "rvo-locations":
      return { text: "Per-location exposure:\n\nLocation       · TIV       · Enrollment · Claims (5-yr)\nMain campus    · $142M     · 712        · 9\nAthletic annex · $28M      · n/a        · 3\nLower campus   · $15M      · 182        · 0\n\nTotal TIV: $185M. Athletic annex is disproportionate on claims given low TIV — confirms athletic SOP flag from loss run review." };

    // ─── Underwriting Review — Governance (review:governance) ─────────────────
    case "rvg-missing":
      return { text: "Outstanding documents for Governance review:\n\n⚠ Title IX Investigation Log — REQUIRED\n  Status: Not received from broker\n  Impact: Cannot validate Title IX procedural compliance\n  Action: Request from broker; estimated 2-3 day turnaround\n\nAll other Governance docs (HR Handbook, Admissions Procedures, Whistleblower Policy, Campus Security Plan) are received and validated." };
    case "rvg-titleix":
      return { text: "Title IX compliance status:\n\n• 2 Title IX cases reported in 3-yr period\n• Both resolved within institutional procedures\n• Coordinator in place; training completion 71% (below 85% target ⚠)\n• Investigation log: NOT RECEIVED — blocks final sign-off\n\nNext step: Receive investigation log; if procedurally clean, this review can move to approval with a training-completion mitigation plan noted." };
    case "rvg-hr":
      return { text: "HR policy review:\n\n• HR Handbook — received, reviewed within 12 months ✓\n• Tenure & discipline SOPs — multi-step process, signed by HR Director ✓\n• Faculty evaluation protocol — annual cycle ✓\n• Whistleblower policy — active channel with anonymous reporting ✓\n\nCompliance score: 92% (threshold 80%). No HR-related ELL exposure concerns." };
    case "rvg-draft":
      return { text: "Draft request to broker — missing Title IX investigation log:\n\nSubject: SUB-7829 — Missing: Title IX Investigation Log\n\nHi Tom,\n\nWe're finalizing the Governance & Management Liability review on the Brookfield Day School renewal and need the Title IX investigation log to close it out. Please send the most recent 3 years of investigation records (incident summary level is sufficient — full case files not needed).\n\nThis is the last open item before we can move to quote. Targeting receipt by EOW.\n\nThanks,\nMaya" };

    // ─── Underwriting Review — Contractual (review:contractual) ───────────────
    case "rvc-training":
      return { text: "Training completion gaps:\n\nTopic                    · Completion · Target · Status\nTransportation Safety    · 88%        · 85%    · ✓\nTitle IX                 · 71%        · 85%    · ⚠ Gap\nChild Protection         · 92%        · 85%    · ✓\nLab Safety               · 84%        · 85%    · ⚠ Borderline\nCyber Awareness          · 76%        · 85%    · ⚠ Gap\n\nGaps: Title IX (-14 pts), Cyber (-9 pts), Lab Safety (-1 pt).\n\nRecommendation: Document a mitigation plan with completion target dates before approving this review." };
    case "rvc-coi":
      return { text: "Vendor COI compliance:\n\n• 186 active vendors tracked\n• 171 (92%) have current COI on file with Additional Insured status\n• 15 lapsed — Risk Mgmt has them on the 30-day cure cycle\n• Centralized through Risk Mgmt; no decentralized vendor onboarding\n\nFinding: 92% > 90% target ✓. Strong vendor risk transfer posture." };
    case "rvc-indemnity":
      return { text: "Indemnity language summary:\n\n• Master Services Agreement — model indemnity in use, last reviewed by counsel 8 months ago\n• Facility use agreements — broad-form indemnification + AI endorsement required\n• Purchase orders — pass-through indemnity language\n• Waivers — used for off-site/high-risk activities (athletics, field trips, labs)\n\nNo material gaps in contractual risk transfer." };
    case "rvc-credit":
      return { text: "Premium credit eligibility:\n\nCurrent earned credits: $1,400\n  • Vendor COI program ≥90%      — $600 credit ✓\n  • Centralized risk mgmt office  — $400 credit ✓\n  • Crisis comms plan documented  — $400 credit ✓\n\nMissed credits (could be earned):\n  • Training completion ≥85% across all topics — $1,200 credit (currently 79% avg)\n\nIf training gaps are closed at next renewal, total credits could rise to $2,600." };

    // ─── Underwriting Review — Benchmarking (review:benchmarking) ─────────────
    case "rvb-compare":
      return { text: "Peer comparison (K-12 cohort · 47 schools):\n\nMetric            · This account · Peer · Δ\nLoss Ratio        · 58%          · 62%  · -4 pts ✓\nClaim Frequency   · 2.4/yr       · 1.6  · +0.8/yr ⚠\nTraining Complete · 79%          · 82%  · -3 pts ⚠\nCOI Compliance    · 92%          · 88%  · +4 pts ✓\nDays Cash on Hand · 186          · 140  · +46 ✓\n\nOutperforms peers on 3 of 5 metrics. Frequency and training are the two areas to monitor." };
    case "rvb-toprisks":
      return { text: "Top-risk alignment vs. industry survey:\n\nIndustry top 5 risks for K-12 (UE 2025):\n1. Title IX / sexual misconduct ✓ self-reported\n2. Athletic injuries (esp. TBI) ✓ self-reported\n3. Cyber & data privacy ✓ self-reported\n4. Wage & hour litigation ✓ self-reported\n5. Faculty employment disputes ✓ self-reported\n\nResult: 5/5 alignment. No blind spots — institution's self-assessment matches industry data." };
    case "rvb-largeloss":
      return { text: "Large-loss vulnerability scan:\n\nRecent industry large losses (UE peer book, last 24 months):\n  • $4.2M — Title IX class action (mid-sized university)\n  • $2.8M — Athletic TBI settlement (boarding school)\n  • $1.6M — Cyber breach / FERPA (independent school)\n\nThis account's exposure vs. those patterns:\n  • Title IX procedures: solid, but training gap is a soft spot ⚠\n  • Athletic TBI: 1 historical event ($425K) — concussion protocol mitigates forward\n  • Cyber: training 76% (below target) — consider sublimit review\n\nNet: limits and SAM sublimit ($5M) are adequate for the cohort's settlement range." };
    case "rvb-cohort":
      return { text: "Peer cohort details:\n\nCohort: 47 K-12 independent / private schools\nMatching criteria:\n  • Enrollment 600–1,200\n  • Operating budget $20M–$40M\n  • Region: same accreditation council\n  • Product mix: GL + EPL + ELL (this account's bundle)\n\nCohort metrics:\n  • Median loss ratio: 62%\n  • Median premium per student: $36\n  • Median tenure with UE: 7.4 years\n\nThis account ranks in the top quartile on financial discipline and risk control programs." };

    // ─── Approvals tab ────────────────────────────────────────────────────────
    case "apv-status":
      return { text: "Approval chain status:\n\n• 3-yr rate-lock authority — Manager review (submitted Apr 18)\n• Reinsurance SAM $5M — Re team review (submitted Apr 17)\n• Bind authority $250K+ — Manager review (submitted Apr 19)\n\nAll within SLA. Likely cleared today: rate-lock + bind authority." };
    case "apv-blockers":
      return { text: "Blocking approval:\n\n1. SAM $5M reinsurance referral — Re team awaiting actuarial sign-off (1d remaining)\n2. Title IX investigation log — required for Governance review before final approval\n\nNo other blockers in the approval chain." };
    case "apv-justify":
      return { text: "Draft justification — 3-yr rate-lock authority:\n\n• 10-year UE member; loss ratio 58% (under 65% target)\n• Stable enrollment trend (+2.2% CAGR)\n• Solid risk control program (COI 92%, centralized risk mgmt)\n• Broker has committed to flat renewal with board approval\n\nRecommend approval at standard authority + 3-yr lock with annual loss-ratio kickout clause." };
    case "apv-history":
      return { text: "Prior authority decisions on this account:\n\n• 2024 — 3-yr rate-lock granted, no kickouts triggered\n• 2023 — Bind authority $250K+ approved\n• 2022 — SAM endorsement $5M sublimit approved\n• 2021 — New business authority granted\n\nFully clean approval record; no escalations or denials." };

    // ─── Audit tab ────────────────────────────────────────────────────────────
    case "aud-recent":
      return { text: "Recent activity (last 7 days):\n\n• Apr 19 — Maya updated lifecycle → Quoted\n• Apr 19 — Bind authority requested\n• Apr 18 — 3-yr rate-lock referred to Manager\n• Apr 18 — Quote letter sent to broker\n• Apr 17 — Reinsurance SAM referred\n• Apr 16 — Title IX investigation log requested" };
    case "aud-who":
      return { text: "People who touched this file:\n\n• Maya Khanna (Sr UW) — 14 actions · primary owner\n• Devon Carter (Risk) — 3 actions · risk review\n• Priya Singh (Claims) — 2 actions · claim status link\n• Tom Owens (Broker) — 6 inbound uploads\n• System Automation — 9 automated events" };
    case "aud-changes":
      return { text: "Field-level changes (last 30 days):\n\n• Premium: $132,400 → $142,800 (Apr 18, Maya)\n• Limits: unchanged\n• SAM sublimit: $3M → $5M (Apr 17, Maya, with referral)\n• Lifecycle: In Review → Quoted (Apr 19, Maya)\n• Need-by date: Apr 25 → Apr 28 (Apr 12, broker request)" };
    case "aud-export":
      return { text: "Audit log export options:\n\n• CSV — full action stream (recommended for compliance)\n• PDF — narrative summary suitable for file documentation\n• JSON — machine-readable for downstream systems\n\nClick the Export button in the Audit Trail header to choose a format." };

    // ─── Member & Broker tab ──────────────────────────────────────────────────
    case "mb-profile":
      return { text: "Member profile — Brookfield Day School:\n\n• Type: Private K-12 · Founded 1962\n• Enrollment: 842 students · 142 staff\n• Location: Westport, CT · 3 campus locations\n• UE Member since: 2014 (10 years)\n• Member-fit score: 82/100 (top quartile)\n• Designations: Accredited NEASC · Title I non-participant" };
    case "mb-tenure":
      return { text: "Tenure & retention:\n\n• 10 years as UE member\n• Retention every renewal cycle since 2014\n• Avg policy term: 1 year (no multi-year locks until 2024 referral)\n• NPS: 9/10 (last survey Mar 2024)\n• Renewal probability: 94% (model-predicted)" };
    case "mb-broker":
      return { text: "Broker performance — Gallagher Education / T. Owens:\n\n• 4 active submissions in your queue · $312K written\n• Hit ratio with UE: 78% (above 72% team avg)\n• Avg days from submission to bind: 38 (target ≤45)\n• Response SLA: <24h on 92% of requests\n• Strong document quality; minimal back-and-forth" };
    case "mb-contacts":
      return { text: "Key contacts on this account:\n\n• T. Owens — Producer, Gallagher Education · t.owens@gallaghered.com\n• L. Martinez — Account Manager, Gallagher · l.martinez@gallaghered.com\n• Dr. R. Hayes — Head of School, Brookfield · rhayes@brookfield.org\n• K. Park — CFO, Brookfield · kpark@brookfield.org" };

    // ─── Risk & Exposure tab ──────────────────────────────────────────────────
    case "rk-summary":
      return { text: "Risk profile summary:\n\n• Overall risk score: 68/100 (moderate)\n• Top exposures: athletics (TBI), Title IX, cyber\n• Risk control program: strong (COI 92%, centralized mgmt)\n• Loss ratio trend: 58% (improving from 64% 3-yr ago)\n• 0 catastrophic events in 10-yr history\n\nFinding: Manageable risk profile in line with cohort." };
    case "rk-exposure":
      return { text: "Top exposures by line:\n\n🟠 Athletics — 64 football, 42 basketball student-athletes (TBI risk)\n🟠 Title IX — 2 reported cases in 3 years, training at 71%\n🟡 Cyber — 76% training completion (below 85% target)\n🟡 Study abroad — 18 placements across 6 countries (low historical claims)\n🟢 Vendor / contractual — strong COI compliance (92%)" };
    case "rk-controls":
      return { text: "Risk control posture:\n\n✓ Centralized risk management office\n✓ Crisis communications plan documented\n✓ Vendor COI program (92% compliance)\n✓ Concussion protocol + baseline neurocognitive testing\n⚠ Title IX training at 71% (below 85% target)\n⚠ Cyber awareness training at 76% (below 85% target)\n\nRecommendation: Document a training mitigation plan." };
    case "rk-flags":
      return { text: "Active risk flags (3):\n\n🔴 Title IX training gap — 71% completion vs 85% target\n🟠 Athletic claim frequency — 4 of 12 claims (33%) over 5-yr period\n🟡 Cyber awareness training — 76% completion vs 85% target\n\nAll 3 should be addressed in pre-bind underwriting notes." };

    // ─── Loss History tab ─────────────────────────────────────────────────────
    case "ls-summary":
      return { text: "Loss history summary (5-yr):\n\n• 12 claims total · $182K incurred · $46K open reserves\n• Loss ratio: 58% (target ≤65%) ✓\n• 2 open claims · 10 closed\n• Largest event: $425K TBI (2023, football)\n• Recurring trend: athletic slip-and-fall (4 of 12 claims)" };
    case "ls-trends":
      return { text: "Frequency & severity:\n\nFREQUENCY (claims/yr):\n  2020:1 · 2021:3 · 2022:2 · 2023:4 · 2024:2\n  5-yr avg: 2.4/yr (peer 1.6 — slightly elevated)\n\nSEVERITY:\n  Median: $14K · Mean: $38K\n  Top event: $425K (TBI, 2023)\n  Distribution: 4 events <$10K · 7 events $10K–$50K · 1 event >$100K" };
    case "ls-open":
      return { text: "Open claims (2):\n\n• CLM-2024-018 — General Liability slip/fall, athletic facility\n  Reserve: $28K · Incident: Jan 2024 · Status: Discovery\n• CLM-2023-091 — Title IX investigation\n  Reserve: $18K · Incident: Sep 2023 · Status: Awaiting closing memo\n\nBoth open <12 months; reserves established within 30 days of report." };
    case "ls-largest":
      return { text: "Largest losses (top 5):\n\n1. $425K — TBI, football (2023, closed within primary)\n2. $98K — Title IX matter (2022, closed)\n3. $54K — General slip/fall (2021)\n4. $48K — Property damage, athletic annex (2023)\n5. $32K — Student-on-student incident (2022)\n\nLayer piercing: 0 events have pierced excess in 5-yr history." };

    default:
      return { text: "I don't have a specific response for that yet. Try the suggestions or ask a free-text question." };
  }
}

// ═════════════════════════════════════════════════════════════════════════════
//   TabAwareSuggestions
// ═════════════════════════════════════════════════════════════════════════════
export function TabAwareSuggestions() {
  const workspace = useSubmissionWorkspaceOptional();
  const location  = useLocation();

  // Prefer workspace tab (submission detail) → fall back to URL-based page context.
  // When the user has drilled into a specific Underwriting Review checklist item,
  // surface that as a compound key like "review:loss-run" so the chatbot can show
  // suggestions tailored to that analytics page.
  const baseTab: TabId | null =
    (workspace?.activeTab as TabId | undefined) ?? detectPageContext(location.pathname);
  const activeTab: TabId | null =
    baseTab === "review" && workspace?.activeReviewId
      ? (`review:${workspace.activeReviewId}` as TabId)
      : baseTab;

  const suggestions = activeTab ? SUGGESTIONS[activeTab] : undefined;

  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [pendingResponseFor, setPendingResponseFor] = useState<string | null>(null);
  const respondTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Toast for "Copied" feedback inside this panel
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = (msg: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(msg);
    toastTimer.current = setTimeout(() => setToast(null), 1800);
  };

  // Clear in-panel conversation when the tab / page context changes
  const lastTabRef = useRef<TabId | null>(activeTab);
  if (lastTabRef.current !== activeTab) {
    lastTabRef.current = activeTab;
    if (messages.length > 0) setMessages([]);
    if (respondTimer.current) clearTimeout(respondTimer.current);
    setPendingResponseFor(null);
  }

  const handleSuggestionClick = (s: Suggestion) => {
    if (pendingResponseFor) return; // already responding
    const userMsgId = `u_${Date.now()}`;
    setMessages(prev => [
      ...prev,
      { id: userMsgId, role: "user", text: s.label, ts: new Date() },
    ]);
    setPendingResponseFor(userMsgId);
    if (respondTimer.current) clearTimeout(respondTimer.current);
    respondTimer.current = setTimeout(() => {
      const { text, payload } = generateResponse(s);
      const followUps = resolveFollowUps(s.responseKey);
      setMessages(prev => [
        ...prev,
        { id: `a_${Date.now()}`, role: "assistant", text, payload, followUps, ts: new Date() },
      ]);
      setPendingResponseFor(null);
    }, 450 + Math.random() * 200);
  };

  // Handler used by follow-up chips inside an assistant message
  const handleFollowUpClick = (s: Suggestion) => handleSuggestionClick(s);

  // Render if we have ANY context (submission tab OR known app page)
  if (!suggestions || suggestions.length === 0) return null;

  const ctxLabel = activeTab ? (TAB_LABELS[activeTab] ?? activeTab) : "Workspace";

  return (
    <div style={{ padding: "12px 12px 4px", borderBottom: `1px solid ${BDL}`, background: "white", fontFamily: font }}>

      {/* "Helping with" label */}
      <div className="inline-flex items-center gap-1.5 mb-2.5" style={{
        background: `${G}18`, border: `1px solid ${G}55`, color: "#7A4800",
        padding: "3px 9px", borderRadius: 999,
        fontSize: "0.6rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em",
      }}>
        <Sparkles size={10}/>
        Helping with: {ctxLabel}
        {activeTab === "rating" && <span style={{ opacity: 0.7 }}>· {SAMPLE_PRODUCT_NAME}</span>}
      </div>

      {/* Suggestion buttons (1-col stack for narrow panel) */}
      <div className="flex flex-col gap-1.5">
        {suggestions.map(s => (
          <button
            key={s.id}
            onClick={() => handleSuggestionClick(s)}
            title={s.description ?? s.label}
            disabled={!!pendingResponseFor}
            className="flex items-center gap-1.5 px-2.5 py-2 text-left transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            onMouseEnter={(e) => { if (!pendingResponseFor) e.currentTarget.style.background = `${N}08`; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "white"; }}
            style={{
              border: `1px solid ${BDL}`,
              borderRadius: 6,
              background: "white",
              cursor: pendingResponseFor ? "wait" : "pointer",
              fontSize: "0.68rem", fontWeight: 700, color: TD,
              fontFamily: font,
            }}>
            <span style={{ color: N, display: "inline-flex", flexShrink: 0 }}>{s.icon}</span>
            <span className="truncate" style={{ lineHeight: 1.2 }}>{s.label}</span>
          </button>
        ))}
      </div>

      {/* In-panel conversation thread — subtle elevated surface */}
      {messages.length > 0 && (
        <div className="mt-3 space-y-2.5"
          style={{
            background: "linear-gradient(180deg, #F7F8FB 0%, #FAFBFD 100%)",
            border: `1px solid ${BDL}`,
            padding: "10px",
            borderRadius: 10,
            maxHeight: 380,
            overflowY: "auto",
            boxShadow: "inset 0 1px 2px rgba(15,23,42,0.03)",
          }}>
          {messages.map(m => (
            <ChatMsgRow
              key={m.id}
              msg={m}
              workspace={workspace}
              showToast={showToast}
              onFollowUpClick={handleFollowUpClick}
              disabled={!!pendingResponseFor}
            />
          ))}
          {pendingResponseFor && <TypingDots/>}
        </div>
      )}

      {/* Inline toast inside the panel */}
      {toast && (
        <div className="mt-2 inline-flex items-center gap-1 px-2.5 py-1"
          style={{
            background: "#E8F5EC", border: `1px solid #86EFAC`, borderRadius: 4,
            fontSize: "0.66rem", fontWeight: 700, color: OK,
          }}>
          <CheckCircle2 size={11}/> {toast}
        </div>
      )}
    </div>
  );
}

// ─── Rich AI response card (parsed structured blocks) ─────────────────────────
type Block =
  | { kind: "header";    text: string }
  | { kind: "para";      text: string; indent?: number }
  | { kind: "bullet";    text: string; indent?: number }
  | { kind: "status";    tone: "critical" | "warning" | "info" | "success"; text: string }
  | { kind: "check";     tone: "ok" | "warn" | "fail"; text: string }
  | { kind: "todo";      text: string }
  | { kind: "numbered";  number: string; text: string }
  | { kind: "spacer";    size: "sm" | "md" };

function parseAIResponse(text: string): Block[] {
  const lines = text.split("\n");
  const blocks: Block[] = [];

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const trimmed = raw.trim();

    if (!trimmed) {
      if (blocks.length > 0 && blocks[blocks.length - 1].kind !== "spacer") {
        blocks.push({ kind: "spacer", size: "md" });
      }
      continue;
    }

    const indent = (raw.match(/^\s*/)?.[0].length ?? 0) >= 2 ? 1 : 0;

    // Status emoji lines (full-width dot emoji)
    if (trimmed.startsWith("🔴")) {
      blocks.push({ kind: "status", tone: "critical", text: trimmed.slice(2).trim() }); continue;
    }
    if (trimmed.startsWith("🟡")) {
      blocks.push({ kind: "status", tone: "warning", text: trimmed.slice(2).trim() }); continue;
    }
    if (trimmed.startsWith("🟠")) {
      blocks.push({ kind: "status", tone: "warning", text: trimmed.slice(2).trim() }); continue;
    }
    if (trimmed.startsWith("🔵")) {
      blocks.push({ kind: "status", tone: "info", text: trimmed.slice(2).trim() }); continue;
    }
    if (trimmed.startsWith("🟢")) {
      blocks.push({ kind: "status", tone: "success", text: trimmed.slice(2).trim() }); continue;
    }

    // Todo / checkbox
    if (trimmed.startsWith("☐")) {
      blocks.push({ kind: "todo", text: trimmed.slice(1).trim() }); continue;
    }

    // Inline check icons
    const checkMatch = trimmed.match(/^([✓⚠✗×])\s*(.*)$/);
    if (checkMatch) {
      const c = checkMatch[1];
      const tone: "ok" | "warn" | "fail" = c === "✓" ? "ok" : c === "⚠" ? "warn" : "fail";
      blocks.push({ kind: "check", tone, text: checkMatch[2] }); continue;
    }

    // Bullet
    if (trimmed.startsWith("•") || trimmed.startsWith("·")) {
      blocks.push({ kind: "bullet", text: trimmed.slice(1).trim(), indent }); continue;
    }

    // Numbered
    const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
    if (numMatch) {
      blocks.push({ kind: "numbered", number: numMatch[1], text: numMatch[2] }); continue;
    }

    // Header (short line ending with `:`)
    if (trimmed.endsWith(":") && trimmed.length < 80 && !trimmed.includes("·")) {
      blocks.push({ kind: "header", text: trimmed.replace(/:$/, "") }); continue;
    }

    // Paragraph
    blocks.push({ kind: "para", text: trimmed, indent });
  }

  return blocks;
}

const STATUS_PALETTE = {
  critical: { color: BAD,  bg: "#FEE2E2", icon: <AlertCircle size={10}/> },
  warning:  { color: WARN, bg: "#FFFBEB", icon: <AlertCircle size={10}/> },
  info:     { color: N,    bg: "#E0E7FF", icon: <Sparkles  size={10}/> },
  success:  { color: OK,   bg: "#E8F5EC", icon: <CheckCircle2 size={10}/> },
};

function highlightInline(text: string): React.ReactNode {
  // Highlight SUB-XXXX, T-XXXX, currency, and percentages with subtle styling
  const parts = text.split(/(SUB-\d+|T-\d+|CLM-\d{4}-\d+|\$[\d,]+(?:\.\d+)?[KMB]?|\d+(?:\.\d+)?%)/g);
  return parts.map((part, i) => {
    if (/^SUB-\d+$/.test(part) || /^T-\d+$/.test(part) || /^CLM-\d{4}-\d+$/.test(part)) {
      return (
        <span key={i} style={{
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          fontWeight: 700, color: N, fontSize: "0.94em",
        }}>
          {part}
        </span>
      );
    }
    if (/^\$[\d,]+/.test(part)) {
      return <span key={i} style={{ fontWeight: 700, color: TD, fontVariantNumeric: "tabular-nums" }}>{part}</span>;
    }
    if (/^\d+(?:\.\d+)?%$/.test(part)) {
      return <span key={i} style={{ fontWeight: 700, color: TD, fontVariantNumeric: "tabular-nums" }}>{part}</span>;
    }
    return <span key={i}>{part}</span>;
  });
}

function RichAIResponse({ text, onCopy }: { text: string; onCopy: () => void }) {
  const blocks = useMemo(() => parseAIResponse(text), [text]);

  return (
    <div
      style={{
        background: "white",
        border: `1px solid ${BDL}`,
        borderRadius: 10,
        boxShadow: "0 1px 3px rgba(15,23,42,0.05)",
        overflow: "hidden",
        position: "relative",
      }}>

      {/* Subtle gradient accent strip at top */}
      <span aria-hidden style={{
        position: "absolute", inset: "0 0 auto 0", height: 2,
        background: `linear-gradient(90deg, ${N} 0%, ${G} 100%)`,
        opacity: 0.6,
      }}/>

      {/* Header — AI badge */}
      <div className="flex items-center justify-between px-3 pt-2.5 pb-2"
        style={{ borderBottom: `1px solid ${BDL}` }}>
        <div className="inline-flex items-center gap-1.5">
          <span className="inline-flex items-center justify-center"
            style={{
              width: 18, height: 18, borderRadius: "50%",
              background: `linear-gradient(135deg, ${NAVY} 0%, ${N} 100%)`,
              color: "white",
            }}>
            <Sparkles size={10}/>
          </span>
          <span style={{
            fontSize: "0.55rem", fontWeight: 800, color: N,
            letterSpacing: "0.1em", textTransform: "uppercase",
          }}>
            AI Response
          </span>
        </div>
        <button onClick={onCopy}
          aria-label="Copy response"
          className="inline-flex items-center gap-1 px-1.5 py-0.5 transition-colors hover:bg-slate-100"
          style={{
            background: "transparent", border: "none", borderRadius: 3,
            cursor: "pointer", fontFamily: font,
            fontSize: "0.55rem", fontWeight: 700, color: TT,
            textTransform: "uppercase", letterSpacing: "0.06em",
          }}>
          <Copy size={9}/>
          Copy
        </button>
      </div>

      {/* Body */}
      <div className="px-3 py-3 space-y-px">
        {blocks.map((b, i) => <BlockView key={i} block={b}/>)}
      </div>
    </div>
  );
}

function BlockView({ block }: { block: Block }) {
  switch (block.kind) {
    case "header":
      return (
        <p style={{
          fontSize: "0.74rem", fontWeight: 700, color: TD,
          lineHeight: 1.4, margin: "2px 0 4px",
        }}>
          {highlightInline(block.text)}
        </p>
      );

    case "para":
      return (
        <p style={{
          fontSize: "0.7rem", color: TM, lineHeight: 1.55,
          paddingLeft: block.indent ? 14 : 0,
          margin: "1px 0",
        }}>
          {highlightInline(block.text)}
        </p>
      );

    case "bullet":
      return (
        <div className="flex items-start gap-2"
          style={{ paddingLeft: block.indent ? 14 : 0, padding: "2px 0" }}>
          <span aria-hidden style={{
            width: 4, height: 4, borderRadius: "50%",
            background: TT, marginTop: 7, flexShrink: 0,
          }}/>
          <span style={{
            fontSize: "0.7rem", color: TM, lineHeight: 1.55, flex: 1,
          }}>
            {highlightInline(block.text)}
          </span>
        </div>
      );

    case "status": {
      const p = STATUS_PALETTE[block.tone];
      return (
        <div className="flex items-start gap-2"
          style={{
            background: p.bg, borderRadius: 5,
            padding: "5px 8px", margin: "2px 0",
          }}>
          <span style={{ color: p.color, marginTop: 2, flexShrink: 0 }}>
            {p.icon}
          </span>
          <span style={{
            fontSize: "0.7rem", color: TD, lineHeight: 1.5, fontWeight: 500, flex: 1,
          }}>
            {highlightInline(block.text)}
          </span>
        </div>
      );
    }

    case "check": {
      const color = block.tone === "ok" ? OK : block.tone === "warn" ? WARN : BAD;
      const icon  = block.tone === "ok"
        ? <CheckCircle2 size={11} color={OK} strokeWidth={2.5}/>
        : <AlertCircle size={11} color={color}/>;
      return (
        <div className="flex items-start gap-2" style={{ padding: "2px 0" }}>
          <span style={{ marginTop: 2, flexShrink: 0 }}>{icon}</span>
          <span style={{
            fontSize: "0.7rem", color: TM, lineHeight: 1.55, flex: 1,
          }}>
            {highlightInline(block.text)}
          </span>
        </div>
      );
    }

    case "todo":
      return (
        <div className="flex items-start gap-2" style={{ padding: "2px 0" }}>
          <span className="inline-flex items-center justify-center" style={{
            width: 12, height: 12, borderRadius: 2,
            border: `1.5px solid ${TT}`, marginTop: 3, flexShrink: 0,
          }}/>
          <span style={{
            fontSize: "0.7rem", color: TM, lineHeight: 1.55, flex: 1,
          }}>
            {highlightInline(block.text)}
          </span>
        </div>
      );

    case "numbered":
      return (
        <div className="flex items-start gap-2" style={{ padding: "2px 0" }}>
          <span className="inline-flex items-center justify-center"
            style={{
              minWidth: 16, height: 16, borderRadius: "50%",
              background: `${N}10`, color: N,
              fontSize: "0.55rem", fontWeight: 800,
              marginTop: 2, flexShrink: 0, padding: "0 4px",
            }}>
            {block.number}
          </span>
          <span style={{
            fontSize: "0.7rem", color: TM, lineHeight: 1.55, flex: 1,
          }}>
            {highlightInline(block.text)}
          </span>
        </div>
      );

    case "spacer":
      return <div style={{ height: block.size === "sm" ? 4 : 8 }}/>;
  }
}

// ─── Chat message row (text + structured payload) ─────────────────────────────
function ChatMsgRow({ msg, workspace, showToast, onFollowUpClick, disabled }: {
  msg: ChatMsg;
  workspace: ReturnType<typeof useSubmissionWorkspaceOptional>;
  showToast: (m: string) => void;
  onFollowUpClick?: (s: Suggestion) => void;
  disabled?: boolean;
}) {
  if (msg.role === "user") {
    return (
      <div className="flex justify-end">
        <div style={{
          background: `linear-gradient(135deg, ${N} 0%, #2547F4 100%)`,
          color: "white",
          fontSize: "0.7rem", fontWeight: 600,
          padding: "7px 11px",
          borderRadius: 12,
          borderBottomRightRadius: 4,
          maxWidth: "85%", lineHeight: 1.45,
          boxShadow: `0 2px 6px ${N}28`,
        }}>
          {msg.text}
        </div>
      </div>
    );
  }

  const copyResponseText = () => {
    if (!msg.text) return;
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(msg.text).catch(() => {});
    }
    showToast("Copied response");
  };

  return (
    <div>
      {msg.text && <RichAIResponse text={msg.text} onCopy={copyResponseText}/>}
      {msg.payload?.kind === "rate-options" && workspace && (
        <RateOptionsCards payload={msg.payload} workspace={workspace} showToast={showToast}/>
      )}
      {msg.payload?.kind === "doc-review" && (
        <DocReviewChecklist payload={msg.payload}/>
      )}
      {msg.payload?.kind === "missing-docs-email" && workspace && (
        <MissingDocsEmailCard payload={msg.payload} workspace={workspace} showToast={showToast}/>
      )}
      {msg.payload?.kind === "dimensional-review" && (
        <div className="mt-2">
          <DimensionalReview dimensions={MOCK_PAYLOAD.dimensions}/>
        </div>
      )}
      {msg.payload?.kind === "review-flags" && (
        <div className="mt-2">
          <ReviewFlags flags={MOCK_PAYLOAD.flags}/>
        </div>
      )}
      {msg.payload?.kind === "companion-suggestions" && (
        <div className="mt-2">
          <CompanionSuggestions companions={MOCK_PAYLOAD.companions}/>
        </div>
      )}

      {/* ChatGPT-style follow-up chips — render after each assistant response */}
      {msg.followUps && msg.followUps.length > 0 && onFollowUpClick && (
        <div className="mt-2.5">
          <div style={{
            fontSize: "0.54rem",
            fontWeight: 800,
            color: TT,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginBottom: 5,
            display: "flex",
            alignItems: "center",
            gap: 4,
          }}>
            <Sparkles size={9}/> Suggested follow-ups
          </div>
          <div className="flex flex-wrap gap-1.5">
            {msg.followUps.map(s => (
              <button
                key={s.id}
                onClick={() => onFollowUpClick(s)}
                disabled={disabled}
                title={s.description ?? s.label}
                onMouseEnter={(e) => { if (!disabled) { e.currentTarget.style.background = `${N}10`; e.currentTarget.style.borderColor = `${N}55`; } }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "white"; e.currentTarget.style.borderColor = BDL; }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "5px 9px",
                  background: "white",
                  border: `1px solid ${BDL}`,
                  borderRadius: 999,
                  fontSize: "0.64rem",
                  fontWeight: 700,
                  color: N,
                  cursor: disabled ? "wait" : "pointer",
                  opacity: disabled ? 0.55 : 1,
                  fontFamily: font,
                  transition: "background 0.15s, border-color 0.15s",
                }}>
                <span style={{ display: "inline-flex", color: N, flexShrink: 0 }}>{s.icon}</span>
                <span style={{ lineHeight: 1.1 }}>{s.label}</span>
                <ArrowRight size={9} style={{ opacity: 0.6 }}/>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── 5 rating options cards ───────────────────────────────────────────────────
function RateOptionsCards({ payload, workspace, showToast }: {
  payload: Extract<StructuredPayload, { kind: "rate-options" }>;
  workspace: NonNullable<ReturnType<typeof useSubmissionWorkspaceOptional>>;
  showToast: (m: string) => void;
}) {
  return (
    <div className="space-y-2 mt-2">
      {payload.options.map(o => {
        const changeUp = o.changePct >= 0;
        return (
          <div key={o.code}
            style={{
              background: "white",
              border: `1px solid ${BDL}`,
              borderRadius: 8,
              padding: "10px 12px",
              position: "relative",
              overflow: "hidden",
            }}>
            <span aria-hidden style={{
              position: "absolute", inset: "0 0 auto 0", height: 3,
              background: `linear-gradient(90deg, ${N}, ${N}66)`,
            }}/>
            <div className="flex items-center justify-between mb-2" style={{ marginTop: 2 }}>
              <div className="flex items-center gap-1.5 min-w-0">
                <span style={{
                  width: 22, height: 22, borderRadius: 6,
                  background: `${N}12`, color: N,
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.66rem", fontWeight: 800, flexShrink: 0,
                  fontVariantNumeric: "tabular-nums",
                }}>
                  {String(o.index).padStart(2, "0")}
                </span>
                <span style={{ fontSize: "0.74rem", fontWeight: 800, color: TD, whiteSpace: "nowrap" }}>
                  {o.code}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span style={{ fontSize: "0.78rem", fontWeight: 800, color: N, fontVariantNumeric: "tabular-nums" }}>
                  ${o.premium.toLocaleString()}
                </span>
                <span style={{
                  fontSize: "0.6rem", fontWeight: 700,
                  color: changeUp ? WARN : OK,
                }}>
                  {changeUp ? "+" : ""}{o.changePct.toFixed(1)}%
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-1.5 mb-2">
              {[["Limit", o.limit], ["Aggregate", o.aggregate], ["Retention", o.retention]].map(([lbl, val]) => (
                <div key={lbl}>
                  <div style={{ fontSize: "0.52rem", fontWeight: 700, color: TT, textTransform: "uppercase", letterSpacing: "0.08em" }}>{lbl}</div>
                  <div className="truncate" style={{ fontSize: "0.7rem", fontWeight: 700, color: TD }}>{val}</div>
                </div>
              ))}
            </div>

            <p style={{ fontSize: "0.66rem", color: TM, lineHeight: 1.4, marginBottom: 6 }}>
              {o.rationale}
            </p>

            {/* Quick chips */}
            <div className="flex flex-wrap gap-1 mb-2">
              {o.endorsements.slice(0, 3).map((e, i) => (
                <span key={i} style={{
                  fontSize: "0.56rem", fontWeight: 700,
                  background: "#F1F5F9", color: TM,
                  padding: "1px 6px", borderRadius: 3,
                }}>{e}</span>
              ))}
              {o.endorsements.length > 3 && (
                <span style={{ fontSize: "0.56rem", color: TT, fontWeight: 700 }}>
                  +{o.endorsements.length - 3} more
                </span>
              )}
            </div>

            <button
              onClick={() => {
                const pending: PendingRatingOption = {
                  productId: SAMPLE_PRODUCT_ID,
                  optionName: o.code,
                  limit: o.limit,
                  aggregate: o.aggregate,
                  retention: o.retention,
                  premium: o.premium,
                  endorsements: o.endorsements,
                  rationale: o.rationale,
                };
                workspace.setPendingRatingOption(pending);
                workspace.requestTabChange("rating");
                showToast(`Loaded ${o.code} into Rating`);
              }}
              className="w-full flex items-center justify-center gap-1 transition-all active:scale-95"
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 4px 14px rgba(1,35,212,0.30)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 2px 6px rgba(1,35,212,0.20)"; }}
              style={{
                background: N, color: "white", borderRadius: 5,
                fontSize: "0.66rem", fontWeight: 700, border: "none", cursor: "pointer",
                padding: "5px 10px",
                boxShadow: "0 2px 6px rgba(1,35,212,0.20)",
                fontFamily: font,
              }}>
              <ArrowRight size={11}/> Use this option
            </button>
          </div>
        );
      })}
    </div>
  );
}

// ─── Document review checklist ────────────────────────────────────────────────
function DocReviewChecklist({ payload }: { payload: Extract<StructuredPayload, { kind: "doc-review" }> }) {
  const meta = (s: DocReviewItem["status"]) => {
    if (s === "validated") return { color: OK,   bg: "#E8F5EC", icon: <CheckCircle2 size={11}/>, label: "Validated" };
    if (s === "flagged")   return { color: WARN, bg: "#FEF3C7", icon: <AlertCircle  size={11}/>, label: "Flagged"   };
    return                       { color: BAD,  bg: "#FEE2E2", icon: <AlertCircle  size={11}/>, label: "Missing"   };
  };
  return (
    <div className="mt-2 space-y-1.5">
      {payload.items.map((it, i) => {
        const m = meta(it.status);
        return (
          <div key={i}
            style={{
              background: "white",
              border: `1px solid ${BDL}`,
              borderLeft: `3px solid ${m.color}`,
              borderRadius: 5,
              padding: "6px 9px",
            }}>
            <div className="flex items-center justify-between gap-2">
              <span className="truncate" style={{ fontSize: "0.7rem", fontWeight: 700, color: TD }}>
                {it.name}
              </span>
              <span className="inline-flex items-center gap-1 shrink-0"
                style={{
                  background: m.bg, color: m.color,
                  padding: "1px 6px", borderRadius: 3,
                  fontSize: "0.58rem", fontWeight: 700,
                }}>
                {m.icon}{m.label}
              </span>
            </div>
            {it.notes && (
              <div style={{ fontSize: "0.62rem", color: TM, marginTop: 2 }}>
                {it.notes}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Missing-docs email draft ─────────────────────────────────────────────────
function MissingDocsEmailCard({ payload, workspace, showToast }: {
  payload: Extract<StructuredPayload, { kind: "missing-docs-email" }>;
  workspace: NonNullable<ReturnType<typeof useSubmissionWorkspaceOptional>>;
  showToast: (m: string) => void;
}) {
  const e = payload.email;
  const handleCopy = async () => {
    const text = `To: ${e.to}\nSubject: ${e.subject}\n\n${e.body}`;
    try {
      await navigator.clipboard.writeText(text);
      showToast("Email copied to clipboard");
    } catch {
      showToast("Copy not available — select and copy manually");
    }
  };
  const handleOpenInCorrespondence = () => {
    workspace.setPendingComposerDraft({
      channel: "email",
      to: "T. Owens (Gallagher)",
      subject: e.subject,
      body: e.body,
    });
    workspace.requestTabChange("correspondence");
    showToast("Opened in Correspondence");
  };
  return (
    <div className="mt-2" style={{
      background: "white",
      border: `1px solid ${BDL}`,
      borderRadius: 8,
      overflow: "hidden",
    }}>
      <div className="flex items-center gap-2 px-3 py-2" style={{ background: "#FAFBFD", borderBottom: `1px solid ${BDL}` }}>
        <Mail size={11} color={N}/>
        <span style={{ fontSize: "0.62rem", fontWeight: 800, color: TD, textTransform: "uppercase", letterSpacing: "0.06em" }}>
          Drafted Email
        </span>
      </div>
      <div className="px-3 py-2.5 space-y-1.5">
        <div style={{ fontSize: "0.62rem", color: TT }}>
          <span style={{ fontWeight: 700 }}>To:</span> {e.to}
        </div>
        <div style={{ fontSize: "0.7rem", color: TD, fontWeight: 700 }}>
          {e.subject}
        </div>
        <div style={{
          fontSize: "0.7rem", color: TD, lineHeight: 1.55,
          whiteSpace: "pre-wrap",
          background: "#FAFBFD",
          padding: "8px 10px",
          borderRadius: 5,
          border: `1px solid ${BDL}`,
          maxHeight: 200, overflowY: "auto",
        }}>
          {e.body}
        </div>
      </div>
      <div className="flex items-center gap-1.5 px-3 py-2"
        style={{ borderTop: `1px solid ${BDL}`, background: "#FAFBFD" }}>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 px-2.5 py-1 transition-colors hover:bg-white"
          style={{
            border: `1px solid ${BDL}`, background: "white", color: TM,
            fontSize: "0.64rem", fontWeight: 700, borderRadius: 4,
            cursor: "pointer", fontFamily: font,
          }}>
          <Copy size={11}/> Copy
        </button>
        <button
          onClick={handleOpenInCorrespondence}
          className="flex items-center gap-1 px-2.5 py-1 transition-all active:scale-95"
          onMouseEnter={(ev) => { ev.currentTarget.style.boxShadow = "0 4px 14px rgba(1,35,212,0.30)"; }}
          onMouseLeave={(ev) => { ev.currentTarget.style.boxShadow = "0 2px 6px rgba(1,35,212,0.20)"; }}
          style={{
            background: N, color: "white", borderRadius: 4,
            fontSize: "0.64rem", fontWeight: 700, border: "none", cursor: "pointer",
            boxShadow: "0 2px 6px rgba(1,35,212,0.20)",
            fontFamily: font,
          }}>
          <ExternalLink size={11}/> Open in Correspondence
        </button>
      </div>
    </div>
  );
}

// ─── Typing indicator (AI thinking) ───────────────────────────────────────────
function TypingDots() {
  return (
    <div className="inline-flex items-center gap-2"
      style={{
        background: "white",
        border: `1px solid ${BDL}`,
        borderRadius: 10,
        padding: "6px 10px",
        boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
        width: "fit-content",
      }}>
      <span className="inline-flex items-center justify-center"
        style={{
          width: 14, height: 14, borderRadius: "50%",
          background: `linear-gradient(135deg, ${NAVY}, ${N})`,
          color: "white",
        }}>
        <Sparkles size={8}/>
      </span>
      <span className="inline-flex items-center gap-1">
        {[0, 1, 2].map(i => (
          <span key={i} style={{
            width: 5, height: 5, borderRadius: "50%",
            background: N,
            animation: `aiTypingDot 1.3s ease-in-out ${i * 0.16}s infinite`,
          }}/>
        ))}
      </span>
      <span style={{
        fontSize: "0.6rem", color: TT, fontWeight: 600,
        textTransform: "uppercase", letterSpacing: "0.08em",
      }}>
        Thinking
      </span>
      <style>{`
        @keyframes aiTypingDot {
          0%, 80%, 100% { transform: scale(0.7); opacity: 0.4; }
          40%           { transform: scale(1);   opacity: 1;   }
        }
      `}</style>
    </div>
  );
}
