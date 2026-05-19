import { useState } from "react";
import {
  CheckCircle2, FileText, MessageSquare, Upload, User,
  AlertTriangle, RotateCcw, Tag, Settings, Filter,
  ArrowRightLeft, Shield, Clock,
} from "lucide-react";

const N   = "#0123D4";
const G   = "#C9A227";
const TH  = "#F0F3F8";
const BD  = "#C4CDD8";
const BDL = "#DCE3EC";
const TD  = "#1A2530";
const TM  = "#4A5D6E";
const TT  = "#7A8FA3";
const font = "'Source Sans 3', system-ui, sans-serif";

type EventType =
  | "status_change" | "document" | "note" | "task"
  | "uw_action" | "system" | "referral" | "override" | "reassign";

interface AuditEvent {
  id: number;
  timestamp: string;
  user: string;
  initials: string;
  role: string;
  eventType: EventType;
  action: string;
  detail: string;
  field?: string;
  from?: string;
  to?: string;
  systemFlag?: boolean;
}

const EVENTS: AuditEvent[] = [
  {
    id: 1,
    timestamp: "Mar 26, 2024 · 09:14 AM",
    user: "John Michaels", initials: "JM", role: "Sr. Underwriter",
    eventType: "status_change",
    action: "Status Changed",
    detail: "Submission status updated.",
    field: "Status", from: "Pending Info", to: "In Review",
  },
  {
    id: 2,
    timestamp: "Mar 25, 2024 · 04:52 PM",
    user: "Sarah Mitchell", initials: "SM", role: "Underwriter",
    eventType: "document",
    action: "Document Uploaded",
    detail: "Open Claims Report received from Gallagher Education and classified automatically.",
    field: "Documents", to: "Open_Claims_Report_Q1_2024.pdf",
  },
  {
    id: 3,
    timestamp: "Mar 25, 2024 · 03:11 PM",
    user: "System", initials: "AI", role: "Automation",
    eventType: "system",
    action: "AI Document Classification",
    detail: "Open Claims Report auto-tagged as 'Loss Runs'. Confidence: 97%. No manual review required.",
    systemFlag: true,
  },
  {
    id: 4,
    timestamp: "Mar 25, 2024 · 11:28 AM",
    user: "James Owens", initials: "JO", role: "UW Analyst",
    eventType: "task",
    action: "Task Completed",
    detail: "Task #7 marked as Done: 'Confirm COPE survey receipt for Lincoln HS'.",
    field: "Task #7", from: "Open", to: "Done",
  },
  {
    id: 5,
    timestamp: "Mar 24, 2024 · 02:45 PM",
    user: "Sarah Mitchell", initials: "SM", role: "Underwriter",
    eventType: "note",
    action: "UW Note Added",
    detail: "Initial review complete. Account looks favorable — strong loss history and safety program. Main concern is policy complexity score (61/100).",
  },
  {
    id: 6,
    timestamp: "Mar 22, 2024 · 10:00 AM",
    user: "System", initials: "AI", role: "Automation",
    eventType: "system",
    action: "Appetite Score Calculated",
    detail: "Appetite score computed at 92/100 based on 14 risk factors. Account classified as 'In Appetite'.",
    field: "Appetite Score", to: "92 / 100",
    systemFlag: true,
  },
  {
    id: 7,
    timestamp: "Mar 21, 2024 · 09:30 AM",
    user: "Patricia Hoffman", initials: "PH", role: "UW Manager",
    eventType: "reassign",
    action: "Submission Reassigned",
    detail: "Submission reassigned from Tom Lee to Sarah Mitchell due to workload rebalancing.",
    field: "Assigned To", from: "Tom Lee", to: "Sarah Mitchell",
  },
  {
    id: 8,
    timestamp: "Mar 20, 2024 · 03:55 PM",
    user: "Sarah Mitchell", initials: "SM", role: "Underwriter",
    eventType: "task",
    action: "Task Created",
    detail: "New task created: 'Request missing safety questionnaire from broker'.",
    field: "Task #4", to: "Open · High Priority",
  },
  {
    id: 9,
    timestamp: "Mar 19, 2024 · 11:02 AM",
    user: "System", initials: "AI", role: "Automation",
    eventType: "system",
    action: "SLA Warning Triggered",
    detail: "Submission has been in 'Pending Info' for 8 days. SLA threshold is 10 days. Automated reminder sent to broker.",
    systemFlag: true,
  },
  {
    id: 10,
    timestamp: "Mar 18, 2024 · 02:33 PM",
    user: "Tom Lee", initials: "TL", role: "UW Analyst",
    eventType: "uw_action",
    action: "Loss Runs Reviewed",
    detail: "5-year loss runs certified. Incurred total $87,200. Average loss ratio 21% — within acceptable range for education segment.",
  },
  {
    id: 11,
    timestamp: "Mar 18, 2024 · 09:15 AM",
    user: "Sarah Mitchell", initials: "SM", role: "Underwriter",
    eventType: "document",
    action: "Document Uploaded",
    detail: "5-Year Certified Loss Runs received from Gallagher Education.",
    field: "Documents", to: "Loss_Runs_2019-2024_Certified.pdf",
  },
  {
    id: 12,
    timestamp: "Mar 17, 2024 · 04:00 PM",
    user: "Patricia Hoffman", initials: "PH", role: "UW Manager",
    eventType: "referral",
    action: "Referral Flag Cleared",
    detail: "TIV referral threshold flag cleared. UW Manager reviewed TIV of $412M against authority limit. Approved to proceed without escalation.",
    field: "Referral Flag", from: "Flagged", to: "Cleared",
  },
  {
    id: 13,
    timestamp: "Mar 16, 2024 · 11:47 AM",
    user: "System", initials: "AI", role: "Automation",
    eventType: "system",
    action: "Duplicate Submission Check",
    detail: "Duplicate check passed. No existing active submissions found for Riverside Unified SD (Member ID: ACC-1029). AI account recognition confirmed: Individual account.",
    systemFlag: true,
  },
  {
    id: 14,
    timestamp: "Mar 15, 2024 · 03:20 PM",
    user: "System", initials: "AI", role: "Automation",
    eventType: "status_change",
    action: "Status Set — Submission Received",
    detail: "Submission received via IVANS email integration. Automatically assigned to Education Practice intake queue.",
    field: "Status", from: "—", to: "Pending Info",
    systemFlag: true,
  },
  {
    id: 15,
    timestamp: "Mar 15, 2024 · 03:20 PM",
    user: "System", initials: "AI", role: "Automation",
    eventType: "document",
    action: "Documents Auto-Classified",
    detail: "3 documents parsed and auto-classified: Application Form (98% confidence), Loss Runs (96%), Safety Survey (91%). 2 documents flagged for manual review.",
    systemFlag: true,
  },
  {
    id: 16,
    timestamp: "Mar 15, 2024 · 03:18 PM",
    user: "System", initials: "AI", role: "Automation",
    eventType: "system",
    action: "Submission Intake — Auto Triage",
    detail: "Submission ingested from broker email. SIC 8211 — in appetite. Assigned to Education Practice group. Priority set to High based on TIV > $400M threshold.",
    systemFlag: true,
  },
];

const EVENT_STYLES: Record<EventType, { bg: string; text: string; border: string; dot: string; icon: React.ReactNode; label: string }> = {
  status_change: { bg: "#E8F0F9", text: "#00427A", border: "#9ABCD6", dot: "#005B99", icon: <Tag size={12}/>,         label: "Status Change" },
  document:      { bg: "#E8F5EC", text: "#1A5C30", border: "#93C8A0", dot: "#2E7D32", icon: <Upload size={12}/>,       label: "Document"     },
  note:          { bg: "#F0EEF8", text: "#4A2D80", border: "#C3B8E8", dot: "#7B2FBE", icon: <MessageSquare size={12}/>,label: "Note"          },
  task:          { bg: "#FFF8E6", text: "#8A5C00", border: "#F0D88A", dot: G,          icon: <CheckCircle2 size={12}/>, label: "Task"          },
  uw_action:     { bg: "#E8F0F9", text: "#00427A", border: "#9ABCD6", dot: N,          icon: <Shield size={12}/>,       label: "UW Action"    },
  system:        { bg: "#F0F3F8", text: "#4A5D6E", border: "#C4CDD8", dot: TT,         icon: <Settings size={12}/>,     label: "System"        },
  referral:      { bg: "#FFF8E6", text: "#8A5C00", border: "#F0D88A", dot: "#B45309",  icon: <AlertTriangle size={12}/>,label: "Referral"      },
  override:      { bg: "#FBEAEA", text: "#7A1F1F", border: "#E8A8A8", dot: "#B91C1C",  icon: <RotateCcw size={12}/>,    label: "Override"      },
  reassign:      { bg: "#E8F0F9", text: "#00427A", border: "#9ABCD6", dot: "#005B99",  icon: <ArrowRightLeft size={12}/>,label: "Reassign"    },
};

const FILTER_OPTIONS: { id: EventType | "all"; label: string }[] = [
  { id: "all",          label: "All Events" },
  { id: "status_change",label: "Status"     },
  { id: "document",     label: "Documents"  },
  { id: "note",         label: "Notes"      },
  { id: "task",         label: "Tasks"      },
  { id: "uw_action",    label: "UW Actions" },
  { id: "system",       label: "System"     },
  { id: "referral",     label: "Referrals"  },
  { id: "reassign",     label: "Reassign"   },
];

export function AuditTrailTab() {
  const [filter, setFilter] = useState<EventType | "all">("all");
  const [showSystem, setShowSystem] = useState(true);

  const filtered = EVENTS.filter(e => {
    if (!showSystem && e.systemFlag) return false;
    if (filter !== "all" && e.eventType !== filter) return false;
    return true;
  });

  return (
    <div className="space-y-5" style={{ fontFamily: font }}>

      {/* Header bar */}
      <div style={{
        background: "white",
        border: `1px solid ${BDL}`,
        borderTop: `3px solid ${N}`,
        borderRadius: 8,
        overflow: "hidden",
        boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
      }}>
        <div className="px-5 py-3 flex items-center justify-between flex-wrap gap-3"
          style={{ borderBottom: `1px solid ${BDL}`, background: "#FAFBFD" }}>
          <div className="flex items-center gap-2">
            <Clock size={14} color={N} />
            <div>
              <h3 style={{ fontSize: "0.82rem", fontWeight: 700, color: N, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Audit Trail
              </h3>
              <p style={{ fontSize: "0.70rem", color: TT, marginTop: 1 }}>
                Complete record of all actions, decisions, and system events — {EVENTS.length} total entries
              </p>
            </div>
          </div>
          {/* System events toggle */}
          <button
            onClick={() => setShowSystem(v => !v)}
            className="flex items-center gap-2 px-3 py-1.5 transition-all"
            style={{
              border: `1px solid ${showSystem ? N : BD}`,
              background: showSystem ? `${N}0C` : "white",
              fontSize: "0.72rem", fontWeight: 600,
              color: showSystem ? N : TM,
              borderRadius: 6,
            }}>
            <Settings size={11} />
            {showSystem ? "Hide" : "Show"} System Events
          </button>
        </div>

        {/* Filter chips */}
        <div className="flex items-center gap-1.5 px-5 py-3 flex-wrap"
          style={{ borderBottom: `1px solid ${BDL}`, background: "#FAFBFC" }}>
          <Filter size={12} color={TT} />
          {FILTER_OPTIONS.map(f => (
            <button key={f.id}
              onClick={() => setFilter(f.id)}
              className="px-3 py-1 transition-all"
              style={{
                fontSize: "0.68rem", fontWeight: filter === f.id ? 700 : 500,
                background: filter === f.id ? N : "white",
                color: filter === f.id ? "white" : TM,
                border: `1px solid ${filter === f.id ? N : BDL}`,
                borderRadius: 6,
              }}>
              {f.label}
            </button>
          ))}
          <span style={{ fontSize: "0.68rem", color: TT, marginLeft: "auto" }}>
            {filtered.length} event{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Event list */}
        {filtered.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p style={{ fontSize: "0.82rem", color: TT }}>No events match the selected filter.</p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-[52px] top-0 bottom-0" style={{ width: 1, background: BDL, zIndex: 0 }} />

            {filtered.map((event, i) => {
              const es = EVENT_STYLES[event.eventType];
              const isSystem = !!event.systemFlag;
              return (
                <div key={event.id}
                  className="flex gap-4 px-5 py-4 relative hover:bg-slate-50/40 transition-colors"
                  style={{ borderBottom: i < filtered.length - 1 ? `1px solid ${BDL}` : "none" }}>

                  {/* Avatar */}
                  <div className="shrink-0 relative z-10" style={{ width: 28 }}>
                    <div className="flex items-center justify-center"
                      style={{
                        width: 28, height: 28,
                        background: isSystem ? TH : es.bg,
                        border: `1.5px solid ${isSystem ? BD : es.border}`,
                        fontSize: "0.52rem", fontWeight: 800,
                        color: isSystem ? TT : es.text,
                      }}>
                      {isSystem ? <Settings size={12} color={TT} /> : event.initials}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 flex-wrap mb-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Event type badge */}
                        <span className="flex items-center gap-1 px-2 py-0.5"
                          style={{ background: es.bg, border: `1px solid ${es.border}`, fontSize: "0.60rem", fontWeight: 700, color: es.text, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                          {es.icon}
                          {es.label}
                        </span>
                        <span style={{ fontSize: "0.82rem", fontWeight: 700, color: TD }}>{event.action}</span>
                      </div>
                      <span style={{ fontSize: "0.68rem", color: TT, whiteSpace: "nowrap" }}>{event.timestamp}</span>
                    </div>

                    {/* User */}
                    <p style={{ fontSize: "0.70rem", color: TM, marginBottom: 5 }}>
                      <span style={{ fontWeight: 600, color: isSystem ? TT : N }}>{event.user}</span>
                      <span style={{ color: TT }}> · {event.role}</span>
                    </p>

                    {/* Detail */}
                    <p style={{ fontSize: "0.80rem", color: TM, lineHeight: 1.6 }}>{event.detail}</p>

                    {/* Field change */}
                    {(event.from || event.to) && (
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        {event.field && (
                          <span style={{ fontSize: "0.60rem", fontWeight: 700, color: TT, textTransform: "uppercase", letterSpacing: "0.07em" }}>
                            {event.field}:
                          </span>
                        )}
                        {event.from && (
                          <span style={{ fontSize: "0.70rem", background: "#FBEAEA", color: "#7A1F1F", border: "1px solid #E8A8A8", padding: "1px 7px" }}>
                            {event.from}
                          </span>
                        )}
                        {event.from && event.to && (
                          <ArrowRightLeft size={11} color={TT} />
                        )}
                        {event.to && (
                          <span style={{ fontSize: "0.70rem", background: "#E8F5EC", color: "#1A5C30", border: "1px solid #93C8A0", padding: "1px 7px" }}>
                            {event.to}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <div className="px-5 py-3 flex items-center justify-between"
          style={{ borderTop: `1px solid ${BDL}`, background: TH }}>
          <span style={{ fontSize: "0.68rem", color: TT }}>
            Showing {filtered.length} of {EVENTS.length} events · Last updated Mar 26, 2024
          </span>
          <button className="flex items-center gap-1.5 hover:underline"
            style={{ fontSize: "0.68rem", color: N, fontWeight: 700, borderRadius: 6 }}>
            <FileText size={11} /> Export Audit Log
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Status Changes",  value: EVENTS.filter(e => e.eventType === "status_change").length,  color: "#005B99", bg: "#E8F0F9" },
          { label: "Documents",       value: EVENTS.filter(e => e.eventType === "document").length,        color: "#2E7D32", bg: "#E8F5EC" },
          { label: "UW Notes & Actions", value: EVENTS.filter(e => e.eventType === "note" || e.eventType === "uw_action").length, color: "#7B2FBE", bg: "#F0EEF8" },
          { label: "System Events",   value: EVENTS.filter(e => e.systemFlag).length,                     color: TM,       bg: TH       },
        ].map((c, i) => (
          <div key={i} className="px-4 py-3"
            style={{ background: "white", border: `1px solid ${BD}`, borderTop: `3px solid ${c.color}`, borderRadius: 8 }}>
            <p style={{ fontSize: "1.45rem", fontWeight: 800, color: c.color, lineHeight: 1.1 }}>{c.value}</p>
            <p style={{ fontSize: "0.66rem", fontWeight: 700, color: TT, marginTop: 4, textTransform: "uppercase", letterSpacing: "0.07em" }}>
              {c.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
