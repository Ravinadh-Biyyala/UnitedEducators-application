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
import { AppShell }        from "../components/AppShell";
import type { RoleId }     from "../components/AppShell";
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
  const [activeTab, setActiveTab] = useState("overview");
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

  // Live unread badge for the Correspondence tab
  const unreadCount = threads.reduce((s, t) => s + t.unreadCount, 0);

  const renderTab = () => {
    switch(activeTab){
      case "overview":      return <OverviewTab/>;
      case "member":        return <MemberBrokerTab/>;
      case "risk":          return <RiskTab/>;
      case "rating":        return <RatingTab selectedProductIds={SUBMISSION.productLines}/>;
      case "loss":          return <LossTab/>;
      case "documents":     return <DocumentsTab/>;
      case "correspondence":return <CorrespondenceTab/>;
      case "notes":         return <NotesTab/>;
      case "tasks":         return <TasksTab/>;
      case "approvals":     return <ApprovalsTab/>;
      case "audit":         return <AuditTrailTab/>;
      default:              return <OverviewTab/>;
    }
  };

  return (
    <AppShell activePage="submissions" role={user?.roleId ?? "sr-uw"} onRoleChange={() => {}}>
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

              {/* ── Stat row 1 — 5 cells ─────────────────────────────── */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
                <StatCell
                  icon={<TrendingUp size={14} color={POSITIVE}/>}
                  label="Quoted"
                  value={SUBMISSION.quotedPremium}
                  sub={SUBMISSION.quotedNote}
                  subColor={POSITIVE}
                />
                <StatCell
                  icon={<Activity size={14} color={TT}/>}
                  label="Expiring Premium"
                  value={SUBMISSION.expiringPremium}
                  sub={SUBMISSION.expiringNote}
                />
                <StatCell
                  icon={<Flag size={14} color={DANGER}/>}
                  label="Need-By"
                  value={SUBMISSION.needByDate}
                  valueColor={DANGER}
                  sub={`${SUBMISSION.needByUrgency} left`}
                  subColor={DANGER}
                />
                <StatCell
                  icon={<Calendar size={14} color={TT}/>}
                  label="Policy Term"
                  value={`${SUBMISSION.effectiveDate} – ${SUBMISSION.expiryDate}`}
                  sub="12-month"
                />
                <StatCell
                  icon={<TrendingDown size={14} color={CAUTION}/>}
                  label="Loss Ratio (6Y)"
                  value={SUBMISSION.lossRatio}
                  sub={SUBMISSION.lossRatioNote}
                  subColor={CAUTION}
                  isLast
                />
              </div>

              {/* Dashed divider */}
              <div style={{ borderTop:`1px dashed ${BDL}` }}/>

              {/* ── Stat row 2 — 6 cells ─────────────────────────────── */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
                <StatCell
                  icon={<Calendar size={14} color={TT}/>}
                  label="Effective"
                  value={SUBMISSION.effectiveDate}
                  sub={`Policy year ${POLICY_YEAR_LABEL}`}
                />
                <StatCell
                  icon={<Calendar size={14} color={TT}/>}
                  label="Expiration"
                  value={SUBMISSION.expiryDate}
                  sub="Auto-renews"
                />
                <StatCell
                  icon={<ClipboardCheck size={14} color={TT}/>}
                  label="Bound Premium"
                  value={SUBMISSION.boundPremium}
                  sub={SUBMISSION.boundNote}
                />
                <StatCell
                  icon={<Shield size={14} color={TT}/>}
                  label="Brokerage"
                  value={SUBMISSION.brokerage}
                  sub={SUBMISSION.brokerContact}
                />
                <StatCell
                  icon={<User size={14} color={TT}/>}
                  label="Underwriter"
                  value={SUBMISSION.underwriter.name}
                  sub={SUBMISSION.underwriter.title}
                />
                <StatCell
                  icon={<User size={14} color={TT}/>}
                  label="UW Specialist"
                  value={SUBMISSION.uwSpecialist.name}
                  sub={SUBMISSION.uwSpecialist.title}
                  isLast
                />
              </div>
            </div>

        </div>

        {/* ── TAB NAV ────────────────────────────────────────────────────── */}
        <div style={{background:"white",borderBottom:`1px solid ${BD}`,display:"flex",overflowX:"auto"}}>
          {TABS.map(tab=>{
            const isActive = activeTab === tab.id;
            const showUnread = tab.id === "correspondence" && unreadCount > 0;
            return (
              <button key={tab.id} onClick={()=>setActiveTab(tab.id)}
                className="relative flex items-center gap-1.5 px-4 sm:px-5 py-3 whitespace-nowrap shrink-0 transition-all"
                style={{
                  fontSize:"0.78rem", fontWeight:isActive?700:400,
                  color:isActive?N:"#4A5D6E",
                  background:isActive?"#F0F3F8":"transparent",
                  border:"none",
                  outline:"none",
                }}>
                <span style={{color:isActive?N:"#7A8FA3"}}>{tab.icon}</span>
                {tab.label}
                {showUnread && (
                  <span aria-label={`${unreadCount} unread`} style={{
                    fontSize: "0.58rem", fontWeight: 800, color: "white",
                    background: "#B45309",
                    padding: "1px 6px", borderRadius: 10,
                    letterSpacing: "0.02em",
                    minWidth: 16, textAlign: "center",
                  }}>
                    {unreadCount}
                  </span>
                )}
                {isActive && <span style={{position:"absolute",bottom:0,left:0,right:0,height:3,background:G}}/>}
              </button>
            );
          })}
        </div>

        {/* ── TAB CONTENT ─────────────────────────────────────────────────── */}
        <div className="px-4 sm:px-8 py-6 pb-10" style={{background:"#EEF1F6",minHeight:400}}>
          {renderTab()}
        </div>

      </div>
    </AppShell>
  );
}