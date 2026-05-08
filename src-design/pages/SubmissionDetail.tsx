import { AuditTrailTab }    from "../components/tabs/AuditTrailTab";
import { ApprovalsTab }    from "../components/tabs/ApprovalsTab";
import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useAuth } from "../context/AuthContext";
import {
  ChevronDown, GraduationCap,
  LayoutDashboard, Users, ShieldAlert, TrendingDown,
  FolderOpen, MessageSquare,
  ClipboardCheck, Clock, Calculator, CheckSquare,
  ShieldCheck, UserCheck, Briefcase, Globe, Lock, Car,
  Building2, Shield, ThumbsUp,
} from "lucide-react";
import { OverviewTab }     from "../components/tabs/OverviewTab";
import { MemberBrokerTab } from "../components/tabs/MemberBrokerTab";
import { RiskTab }         from "../components/tabs/RiskTab";
import { RatingTab }       from "../components/tabs/RatingTab";
import { LossTab }         from "../components/tabs/LossTab";
import { DocumentsTab }    from "../components/tabs/DocumentsTab";
import { NotesTab }        from "../components/tabs/NotesTab";
import { TasksTab }        from "../components/tabs/TasksTab";
import { AppShell }        from "../components/AppShell";
import type { RoleId }     from "../components/AppShell";

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

const STATUS_OPTIONS = ["In Review","Quoted","Bound","Declined","Pending Info"] as const;
type Status = typeof STATUS_OPTIONS[number];

const STATUS_COLORS: Record<Status,{bg:string;text:string;dot:string;border:string}> = {
  "In Review":   {bg:"#FFF8E6",text:"#8A5C00",dot:"#C9A227",border:"#F0D88A"},
  "Quoted":      {bg:"#E8F0F9",text:"#00427A",dot:"#005B99",border:"#9ABCD6"},
  "Bound":       {bg:"#E8F5EC",text:"#1A5C30",dot:"#2E7D32",border:"#93C8A0"},
  "Declined":    {bg:"#FBEAEA",text:"#7A1F1F",dot:"#B91C1C",border:"#E8A8A8"},
  "Pending Info":{bg:"#F0F3F8",text:"#4A5D6E",dot:"#7A8FA3",border:"#C4CDD8"},
};

const TABS = [
  {id:"overview",   label:"Overview",          icon:<LayoutDashboard size={14}/>},
  {id:"member",     label:"Member & Brokerage", icon:<Users size={14}/>},
  {id:"risk",       label:"Risk & Exposure",    icon:<ShieldAlert size={14}/>},
  {id:"loss",       label:"Loss History",       icon:<TrendingDown size={14}/>},
  {id:"documents",  label:"Documents",          icon:<FolderOpen size={14}/>},
  {id:"rating",     label:"Rating",             icon:<Calculator size={14}/>},
  {id:"notes",      label:"Notes",              icon:<MessageSquare size={14}/>},
  {id:"tasks",      label:"Tasks",              icon:<CheckSquare size={14}/>},
  {id:"approvals",  label:"Approvals",          icon:<ThumbsUp size={14}/>},
  {id:"audit",      label:"Audit Trail",        icon:<Clock size={14}/>},
];

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

export function SubmissionDetail() {
  const navigate  = useNavigate();
  const { id: subIdFromUrl } = useParams<{ id: string }>();
  const { user }  = useAuth();
  const [status, setStatus]       = useState<Status>("In Review");
  const [dropOpen, setDropOpen]   = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const sc = STATUS_COLORS[status];

  const renderTab = () => {
    switch(activeTab){
      case "overview":   return <OverviewTab/>;
      case "member":     return <MemberBrokerTab/>;
      case "risk":       return <RiskTab/>;
      case "rating":     return <RatingTab selectedProductIds={SUBMISSION.productLines}/>;
      case "loss":       return <LossTab/>;
      case "documents":  return <DocumentsTab/>;
      case "notes":      return <NotesTab/>;
      case "tasks":      return <TasksTab/>;
      case "approvals":  return <ApprovalsTab/>;
      case "audit":      return <AuditTrailTab/>;
      default:           return <OverviewTab/>;
    }
  };

  return (
    <AppShell activePage="submissions" role={user?.roleId ?? "sr-uw"} onRoleChange={() => {}}>
      <div style={{fontFamily: font, color:"#1A2530"}}>

        {/* ── BREADCRUMB ─────────────────────────────────────────────────── */}
        <div className="flex items-center gap-2 px-4 sm:px-8 py-2.5"
          style={{background:"white", borderBottom:`1px solid ${BDL}`}}>
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

        {/* ── HERO ───────────────────────────────────────────────────────── */}
        <div style={{background:"white", borderBottom:`1px solid ${BDL}`}}>
          {/* gold accent bar */}
          <div style={{height:4, background:`linear-gradient(90deg,${G} 0%,#A8841C 100%)`}}/>

          <div className="px-4 sm:px-8 py-5 flex flex-col md:flex-row md:items-start gap-5">

            {/* Institution icon */}
            <div className="flex items-center justify-center shrink-0 mt-1"
              style={{width:52,height:52,background:`${G}18`,border:`2px solid ${G}55`}}>
              <GraduationCap size={26} color={G}/>
            </div>

            {/* ── Identity Block ────────────────────────────────────────── */}
            <div className="flex-1 min-w-0">

              {/* Row 1: Institution Name + Submission ID badge + Member number */}
              <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
                <h1 style={{color:"#1A2530", fontSize:"1.30rem", fontWeight:800, lineHeight:1.2}}>
                  {SUBMISSION.institutionName}
                </h1>
                {/* Submission ID badge */}
                <span style={{
                  background:`${G}18`, color:"#8A5C00",
                  border:`1px solid ${G}55`, fontSize:"0.68rem", fontWeight:800,
                  letterSpacing:"0.10em", padding:"2px 10px", textTransform:"uppercase",
                  whiteSpace:"nowrap",
                }}>
                  {subIdFromUrl ?? SUBMISSION.id}
                </span>
                {/* Member number inline */}
                <span style={{color:TT, fontSize:"0.82rem"}}>·</span>
                <span style={{color:TM, fontSize:"0.80rem", fontWeight:500}}>Member</span>
                <span style={{
                  background:`${N}10`, color:"#1A2530",
                  border:`1px solid ${N}25`, fontSize:"0.72rem", fontWeight:700,
                  padding:"1px 8px",
                }}>
                  {SUBMISSION.memberNumber}
                </span>
              </div>

              {/* Row 2: Member info — since · type · enrollment · location */}
              <div className="flex flex-wrap items-center gap-1.5"
                style={{color:TM, fontSize:"0.76rem"}}>
                <ClipboardCheck size={11} color={TT}/>
                <span>Member since {SUBMISSION.memberSince}</span>
                <span style={{opacity:0.4}}>·</span>
                <span>{SUBMISSION.memberType}</span>
                <span style={{opacity:0.4}}>·</span>
                <span>{SUBMISSION.enrollment}</span>
                <span style={{opacity:0.4}}>·</span>
                <span>{SUBMISSION.location}</span>
              </div>
            </div>

            {/* ── Action Cluster ────────────────────────────────────────── */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">

              {/* Status dropdown */}
              <div className="relative">
                <button
                  onClick={()=>setDropOpen(v=>!v)}
                  className="flex items-center gap-2.5 px-4 py-2"
                  style={{background:sc.bg, border:`1px solid ${sc.border}`, minWidth:148}}
                >
                  <span className="inline-block rounded-full shrink-0"
                    style={{width:7,height:7,background:sc.dot}}/>
                  <span style={{color:sc.text,fontSize:"0.80rem",fontWeight:600,flex:1,textAlign:"left"}}>
                    {status}
                  </span>
                  <ChevronDown size={12} style={{color:sc.text}}/>
                </button>
                {dropOpen && (
                  <div className="absolute right-0 mt-1 z-50"
                    style={{background:"white",border:`1px solid ${BD}`,
                      boxShadow:"0 4px 20px rgba(0,0,0,0.15)",minWidth:164,top:"100%"}}>
                    {STATUS_OPTIONS.map(s=>{
                      const c=STATUS_COLORS[s];
                      return (
                        <button key={s}
                          onClick={()=>{setStatus(s);setDropOpen(false);}}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left hover:bg-gray-50">
                          <span className="inline-block rounded-full"
                            style={{width:6,height:6,background:c.dot,flexShrink:0}}/>
                          <span style={{color:c.text,fontSize:"0.80rem",fontWeight:500}}>{s}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Bind Policy */}
              <button
                onClick={()=>navigate(`/submission/${subIdFromUrl ?? SUBMISSION.id}/quote`)}
                className="flex items-center gap-2 px-5 py-2 transition-all active:scale-95 hover:brightness-95"
                style={{
                  background:"white",
                  border:`1px solid ${BD}`,
                  color:N,
                  fontSize:"0.80rem", fontWeight:700,
                }}
              >
                <ClipboardCheck size={14}/> Bind Policy
              </button>
            </div>
          </div>

          {/* ── 5 + 5 Stat Grid ──────────────────────────────────────────── */}
          <div className="grid grid-cols-2 sm:grid-cols-5 overflow-hidden"
            style={{borderTop:`1px solid ${BDL}`}}>

            {/* ── ROW 1 ── */}

            {/* EFFECTIVE DATE */}
            <div className="px-4 sm:px-5 py-3 flex flex-col gap-0.5"
              style={{borderRight:`1px solid ${BDL}`,borderBottom:`1px solid ${BDL}`}}>
              <span style={{color:TT,fontSize:"0.56rem",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.10em"}}>Effective Date</span>
              <span style={{color:"#1A2530",fontSize:"0.88rem",fontWeight:700}}>{SUBMISSION.effectiveDate}</span>
            </div>

            {/* EXPIRATION DATE */}
            <div className="px-4 sm:px-5 py-3 flex flex-col gap-0.5"
              style={{borderRight:`1px solid ${BDL}`,borderBottom:`1px solid ${BDL}`}}>
              <span style={{color:TT,fontSize:"0.56rem",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.10em"}}>Expiration Date</span>
              <span style={{color:"#1A2530",fontSize:"0.88rem",fontWeight:700}}>{SUBMISSION.expiryDate}</span>
            </div>

            {/* NEED-BY DATE */}
            <div className="px-4 sm:px-5 py-3 flex flex-col gap-0.5"
              style={{borderRight:`1px solid ${BDL}`,borderBottom:`1px solid ${BDL}`}}>
              <span style={{color:TT,fontSize:"0.56rem",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.10em"}}>Need-By Date</span>
              <span style={{color:"#1A2530",fontSize:"0.88rem",fontWeight:700}}>{SUBMISSION.needByDate}</span>
              <span style={{color:"#C0392B",fontSize:"0.70rem",fontWeight:700}}>{SUBMISSION.needByUrgency}</span>
            </div>

            {/* EXPIRING PREMIUM */}
            <div className="px-4 sm:px-5 py-3 flex flex-col gap-0.5"
              style={{borderRight:`1px solid ${BDL}`,borderBottom:`1px solid ${BDL}`}}>
              <span style={{color:TT,fontSize:"0.56rem",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.10em"}}>Expiring Premium</span>
              <span style={{color:"#1A2530",fontSize:"0.88rem",fontWeight:700}}>{SUBMISSION.expiringPremium}</span>
              <span style={{color:TT,fontSize:"0.68rem"}}>{SUBMISSION.expiringNote}</span>
            </div>

            {/* QUOTED PREMIUM */}
            <div className="px-4 sm:px-5 py-3 flex flex-col gap-0.5"
              style={{borderBottom:`1px solid ${BDL}`}}>
              <span style={{color:TT,fontSize:"0.56rem",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.10em"}}>Quoted Premium</span>
              <span style={{color:"#1A2530",fontSize:"0.88rem",fontWeight:700}}>{SUBMISSION.quotedPremium}</span>
              <span style={{color:"#2E7D32",fontSize:"0.68rem",fontWeight:600}}>{SUBMISSION.quotedNote}</span>
            </div>

            {/* ── ROW 2 ── */}

            {/* BOUND PREMIUM */}
            <div className="px-4 sm:px-5 py-3 flex flex-col gap-0.5"
              style={{borderRight:`1px solid ${BDL}`}}>
              <span style={{color:TT,fontSize:"0.56rem",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.10em"}}>Bound Premium</span>
              <span style={{color:"#1A2530",fontSize:"0.88rem",fontWeight:700}}>{SUBMISSION.boundPremium}</span>
              <span style={{color:TT,fontSize:"0.68rem"}}>{SUBMISSION.boundNote}</span>
            </div>

            {/* LOSS RATIO (6 YR) */}
            <div className="px-4 sm:px-5 py-3 flex flex-col gap-0.5"
              style={{borderRight:`1px solid ${BDL}`}}>
              <span style={{color:TT,fontSize:"0.56rem",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.10em"}}>Loss Ratio (6 yr)</span>
              <span style={{color:"#1A2530",fontSize:"0.88rem",fontWeight:700}}>{SUBMISSION.lossRatio}</span>
              <span style={{color:TT,fontSize:"0.68rem"}}>{SUBMISSION.lossRatioNote}</span>
            </div>

            {/* BROKERAGE */}
            <div className="px-4 sm:px-5 py-3 flex flex-col gap-0.5"
              style={{borderRight:`1px solid ${BDL}`}}>
              <span style={{color:TT,fontSize:"0.56rem",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.10em"}}>Brokerage</span>
              <span style={{color:"#1A2530",fontSize:"0.88rem",fontWeight:700}}>{SUBMISSION.brokerage}</span>
              <span style={{color:TT,fontSize:"0.68rem"}}>{SUBMISSION.brokerContact}</span>
            </div>

            {/* UNDERWRITER */}
            <div className="px-4 sm:px-5 py-3 flex flex-col gap-0.5"
              style={{borderRight:`1px solid ${BDL}`}}>
              <span style={{color:TT,fontSize:"0.56rem",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.10em"}}>Underwriter</span>
              <span style={{color:"#1A2530",fontSize:"0.88rem",fontWeight:700}}>{SUBMISSION.underwriter.name}</span>
              <span style={{color:TT,fontSize:"0.68rem"}}>{SUBMISSION.underwriter.title}</span>
            </div>

            {/* UNDERWRITING SPECIALIST */}
            <div className="px-4 sm:px-5 py-3 flex flex-col gap-0.5">
              <span style={{color:TT,fontSize:"0.56rem",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.10em"}}>Underwriting Specialist</span>
              <span style={{color:"#1A2530",fontSize:"0.88rem",fontWeight:700}}>{SUBMISSION.uwSpecialist.name}</span>
              <span style={{color:TT,fontSize:"0.68rem"}}>{SUBMISSION.uwSpecialist.title}</span>
            </div>

          </div>

          {/* ── Coverage / Product Lines strip ───────────────────────────── */}
          <div className="px-4 sm:px-8 py-3 flex flex-wrap items-center gap-2"
            style={{borderTop:`1px solid ${BDL}`}}>
            <span style={{color:TT,fontSize:"0.56rem",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.10em",marginRight:4}}>
              Coverage Lines
            </span>
            {SUBMISSION.productLines.map(pid => {
              const pd = PRODUCT_DISPLAY[pid];
              if (!pd) return null;
              return (
                <span key={pid}
                  className="flex items-center gap-1.5 px-2.5 py-1"
                  style={{
                    background:`${N}0A`,
                    border:`1px solid ${N}25`,
                    fontSize:"0.68rem", fontWeight:700, color:N,
                  }}>
                  <span style={{color:TT}}>{pd.icon}</span>
                  {pd.abbr}
                </span>
              );
            })}
          </div>
        </div>

        {/* ── TAB NAV ────────────────────────────────────────────────────── */}
        <div style={{background:"white",borderBottom:`1px solid ${BD}`,display:"flex",overflowX:"auto"}}>
          {TABS.map(tab=>{
            const isActive=activeTab===tab.id;
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