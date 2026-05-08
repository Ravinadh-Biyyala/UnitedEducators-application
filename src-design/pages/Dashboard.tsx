import { useState, useMemo } from "react";
import { useNavigate }       from "react-router";
import {
  Filter, ChevronDown, ChevronLeft, ArrowUpRight, AlertTriangle,
  CheckCircle2, Clock, TrendingUp, TrendingDown,
  Users, ShieldCheck, AlertCircle, ChevronRight,
  MapPin, DollarSign, Activity, Award, Inbox, BarChart2,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { AppShell } from "../components/AppShell";
import type { RoleId } from "../components/AppShell";
import { useAuth } from "../context/AuthContext";

// ─── Design tokens ────────────────────────────────────────────────────────────
const N   = "#0123D4";
const G   = "#C9A227";
const GD  = "#A8841C";
const TH  = "#F0F3F8";
const BD  = "#C4CDD8";
const BDL = "#DCE3EC";
const TD  = "#1A2530";
const TM  = "#4A5D6E";
const TT  = "#7A8FA3";
const BG  = "#EEF1F6";
const font = "'Source Sans 3', system-ui, sans-serif";

// ─── Types ────────────────────────────────────────────────────────────────────
type SubStatus = "In Review" | "Quoted" | "Bound" | "Declined" | "Pending Info";
type Priority  = "Critical" | "High" | "Medium" | "Low";

interface Submission {
  id: string; member: string; type: string; state: string;
  premium: string; premiumVal: number; status: SubStatus;
  assignee: string; assigneeInitials: string; broker: string;
  submitted: string; effectiveDate: string; appetite: number;
  priority: Priority; docsComplete: boolean; daysOpen: number;
}
interface Task {
  id: number; title: string; submission: string; assignee: string;
  due: string; priority: Priority; overdue: boolean;
}
interface Alert {
  id: number; type: "missing-doc" | "expiring" | "open-claim" | "overdue" | "appetite";
  title: string; body: string; submission: string;
  severity: "critical" | "warning" | "info"; time: string;
}

// ─── Role config ──────────────────────────────────────────────────────────────
const ROLE_NAMES: Record<RoleId, string> = {
  "uw": "Sarah Mitchell", "sr-uw": "John Michaels",
  "lead": "Patricia Hoffman", "director": "Robert Chen",
};

// ─── Submissions ──────────────────────────────────────────────────────────────
const ALL_SUBMISSIONS: Submission[] = [
  { id:"SUB-7829", member:"Riverside Unified School District",  type:"K-12 Public",   state:"CA", premium:"$112,000", premiumVal:112000, status:"In Review",    assignee:"Sarah Mitchell",  assigneeInitials:"SM", broker:"Gallagher Education",  submitted:"Mar 15, 2024", effectiveDate:"Jul 1, 2024",  appetite:92, priority:"High",     docsComplete:true,  daysOpen:11 },
  { id:"SUB-7830", member:"San Diego City Schools",             type:"K-12 Public",   state:"CA", premium:"$284,000", premiumVal:284000, status:"Quoted",        assignee:"Tom Lee",         assigneeInitials:"TL", broker:"Marsh McLennan",       submitted:"Mar 12, 2024", effectiveDate:"Aug 1, 2024",  appetite:88, priority:"Medium",   docsComplete:true,  daysOpen:14 },
  { id:"SUB-7831", member:"Austin Independent School District", type:"K-12 Public",   state:"TX", premium:"$195,000", premiumVal:195000, status:"Pending Info",  assignee:"Sarah Mitchell",  assigneeInitials:"SM", broker:"Willis Towers Watson",  submitted:"Mar 10, 2024", effectiveDate:"Jul 1, 2024",  appetite:74, priority:"High",     docsComplete:false, daysOpen:16 },
  { id:"SUB-7832", member:"Vanderbilt University",              type:"Higher Ed",     state:"TN", premium:"$620,000", premiumVal:620000, status:"In Review",    assignee:"John Michaels",   assigneeInitials:"JM", broker:"Aon",                  submitted:"Mar 8, 2024",  effectiveDate:"Sep 1, 2024",  appetite:85, priority:"Medium",   docsComplete:true,  daysOpen:18 },
  { id:"SUB-7833", member:"Denver Public Schools",              type:"K-12 Public",   state:"CO", premium:"$158,000", premiumVal:158000, status:"Bound",         assignee:"Tom Lee",         assigneeInitials:"TL", broker:"Gallagher Education",  submitted:"Feb 28, 2024", effectiveDate:"Jul 1, 2024",  appetite:91, priority:"Low",      docsComplete:true,  daysOpen:28 },
  { id:"SUB-7834", member:"Phoenix Charter Academy Network",    type:"Charter School",state:"AZ", premium:"$48,000",  premiumVal:48000,  status:"Declined",      assignee:"James Owens",     assigneeInitials:"JO", broker:"Brown & Riding",       submitted:"Mar 1, 2024",  effectiveDate:"Jun 1, 2024",  appetite:41, priority:"Low",      docsComplete:false, daysOpen:25 },
  { id:"SUB-7835", member:"Seattle Public Schools",             type:"K-12 Public",   state:"WA", premium:"$231,000", premiumVal:231000, status:"In Review",    assignee:"Sarah Mitchell",  assigneeInitials:"SM", broker:"Marsh McLennan",       submitted:"Mar 18, 2024", effectiveDate:"Jul 1, 2024",  appetite:87, priority:"Critical", docsComplete:false, daysOpen:8  },
  { id:"SUB-7836", member:"Massachusetts Inst. of Technology",  type:"Higher Ed",     state:"MA", premium:"$890,000", premiumVal:890000, status:"Quoted",        assignee:"John Michaels",   assigneeInitials:"JM", broker:"Aon",                  submitted:"Mar 5, 2024",  effectiveDate:"Jul 1, 2024",  appetite:94, priority:"Medium",   docsComplete:true,  daysOpen:21 },
  { id:"SUB-7837", member:"Broward County Public Schools",      type:"K-12 Public",   state:"FL", premium:"$342,000", premiumVal:342000, status:"In Review",    assignee:"James Owens",     assigneeInitials:"JO", broker:"Hub International",    submitted:"Mar 20, 2024", effectiveDate:"Aug 1, 2024",  appetite:79, priority:"Medium",   docsComplete:true,  daysOpen:6  },
  { id:"SUB-7838", member:"Chicago Lab Schools",                type:"Private School",state:"IL", premium:"$78,000",  premiumVal:78000,  status:"Pending Info",  assignee:"Tom Lee",         assigneeInitials:"TL", broker:"Gallagher Education",  submitted:"Mar 14, 2024", effectiveDate:"Sep 1, 2024",  appetite:68, priority:"Low",      docsComplete:false, daysOpen:12 },
  { id:"SUB-7839", member:"Clark County School District",       type:"K-12 Public",   state:"NV", premium:"$415,000", premiumVal:415000, status:"In Review",    assignee:"Sarah Mitchell",  assigneeInitials:"SM", broker:"Marsh McLennan",       submitted:"Mar 22, 2024", effectiveDate:"Jul 1, 2024",  appetite:82, priority:"High",     docsComplete:true,  daysOpen:4  },
  { id:"SUB-7840", member:"Georgetown University",              type:"Higher Ed",     state:"DC", premium:"$540,000", premiumVal:540000, status:"Quoted",        assignee:"John Michaels",   assigneeInitials:"JM", broker:"Aon",                  submitted:"Mar 6, 2024",  effectiveDate:"Aug 1, 2024",  appetite:90, priority:"Medium",   docsComplete:true,  daysOpen:20 },
  { id:"SUB-7841", member:"Cobb County School District",        type:"K-12 Public",   state:"GA", premium:"$178,000", premiumVal:178000, status:"In Review",    assignee:"Sarah Mitchell",  assigneeInitials:"SM", broker:"Hub International",    submitted:"Mar 19, 2024", effectiveDate:"Jul 1, 2024",  appetite:76, priority:"Medium",   docsComplete:true,  daysOpen:7  },
  { id:"SUB-7842", member:"Boston Public Schools",              type:"K-12 Public",   state:"MA", premium:"$267,000", premiumVal:267000, status:"Bound",         assignee:"James Owens",     assigneeInitials:"JO", broker:"Willis Towers Watson",  submitted:"Feb 20, 2024", effectiveDate:"Jul 1, 2024",  appetite:88, priority:"Low",      docsComplete:true,  daysOpen:36 },
  { id:"SUB-7843", member:"Portland Public Schools",            type:"K-12 Public",   state:"OR", premium:"$144,000", premiumVal:144000, status:"Quoted",        assignee:"Tom Lee",         assigneeInitials:"TL", broker:"Gallagher Education",  submitted:"Mar 9, 2024",  effectiveDate:"Aug 1, 2024",  appetite:83, priority:"Low",      docsComplete:true,  daysOpen:17 },
];

const ALL_TASKS: Task[] = [
  { id:1,  title:"Obtain open claims detail from broker",      submission:"SUB-7829", assignee:"Sarah Mitchell", due:"Apr 20, 2024", priority:"High",    overdue:false },
  { id:2,  title:"Verify background check documentation",      submission:"SUB-7829", assignee:"James Owens",    due:"Apr 22, 2024", priority:"High",    overdue:false },
  { id:3,  title:"Review GASB 68 pension liability report",    submission:"SUB-7832", assignee:"Tom Lee",        due:"Apr 18, 2024", priority:"Medium",  overdue:true  },
  { id:4,  title:"Request missing safety questionnaire",       submission:"SUB-7835", assignee:"Sarah Mitchell", due:"Apr 19, 2024", priority:"Critical",overdue:true  },
  { id:5,  title:"Send indicative quote to Gallagher",         submission:"SUB-7829", assignee:"Sarah Mitchell", due:"May 5, 2024",  priority:"High",    overdue:false },
  { id:6,  title:"Confirm earthquake zone with surveyor",      submission:"SUB-7831", assignee:"Sarah Mitchell", due:"Apr 28, 2024", priority:"Medium",  overdue:false },
  { id:7,  title:"Run TIV adequacy check",                     submission:"SUB-7836", assignee:"John Michaels",  due:"Apr 25, 2024", priority:"Medium",  overdue:false },
  { id:8,  title:"Confirm COPE survey receipt",                submission:"SUB-7832", assignee:"James Owens",    due:"Apr 17, 2024", priority:"Low",     overdue:true  },
];

const ALL_ALERTS: Alert[] = [
  { id:1, type:"missing-doc", title:"Missing: Safety Questionnaire",  body:"SUB-7835 (Seattle PS) — required document not received.", submission:"SUB-7835", severity:"critical", time:"2h ago"  },
  { id:2, type:"overdue",     title:"Review Overdue — 16 Days",       body:"SUB-7831 (Austin ISD) has been pending for 16 days.",    submission:"SUB-7831", severity:"critical", time:"Today"   },
  { id:3, type:"open-claim",  title:"Open Litigation Flagged",        body:"SUB-7829 (Riverside USD) — CLM-2021-027 in mediation.",   submission:"SUB-7829", severity:"warning",  time:"Mar 18"  },
  { id:4, type:"appetite",    title:"Low Appetite Score: 41/100",     body:"SUB-7834 (Phoenix Charter) — below threshold of 50.",    submission:"SUB-7834", severity:"warning",  time:"Mar 25"  },
  { id:5, type:"expiring",    title:"Quote Expiring in 5 Days",       body:"SUB-7830 (San Diego City) quote expires Apr 24.",        submission:"SUB-7830", severity:"warning",  time:"Today"   },
  { id:6, type:"missing-doc", title:"Missing: Background Check Policy",body:"SUB-7838 (Chicago Lab) — compliance doc outstanding.",  submission:"SUB-7838", severity:"info",     time:"3d ago"  },
];

const PIPELINE_DATA = [
  { month:"Oct", submitted:8,  quoted:6,  bound:4  },
  { month:"Nov", submitted:11, quoted:8,  bound:5  },
  { month:"Dec", submitted:7,  quoted:5,  bound:4  },
  { month:"Jan", submitted:14, quoted:10, bound:7  },
  { month:"Feb", submitted:18, quoted:13, bound:9  },
  { month:"Mar", submitted:22, quoted:16, bound:11 },
];

const TEAM_STATS = [
  { name:"Sarah Mitchell",  initials:"SM", role:"Underwriter",    inReview:5, quoted:7,  bound:3, hitRatio:"71%", daysToQuote:"3.8d" },
  { name:"John Michaels",   initials:"JM", role:"Sr. Underwriter",inReview:4, quoted:9,  bound:4, hitRatio:"74%", daysToQuote:"3.2d" },
  { name:"Tom Lee",         initials:"TL", role:"UW Analyst",     inReview:3, quoted:5,  bound:3, hitRatio:"68%", daysToQuote:"4.5d" },
  { name:"James Owens",     initials:"JO", role:"UW Analyst",     inReview:2, quoted:4,  bound:2, hitRatio:"66%", daysToQuote:"4.9d" },
];

const KPIS: Record<RoleId, { label:string; value:string; sub:string; trend:"up"|"down"|"none"; accent:string; icon:React.ReactNode }[]> = {
  "uw": [
    { label:"My In Review",       value:"5",      sub:"Active submissions",       trend:"up",   accent:G,         icon:<Inbox size={20} color={G} />          },
    { label:"Quoted This Month",  value:"7",      sub:"+2 vs. last month",        trend:"up",   accent:"#2E7D32", icon:<CheckCircle2 size={20} color="#2E7D32" /> },
    { label:"Bound This Month",   value:"3",      sub:"$454K premium",            trend:"up",   accent:"#005B99", icon:<ShieldCheck size={20} color="#005B99" />  },
    { label:"Avg. Days to Quote", value:"3.8d",   sub:"−0.4d vs. team avg",      trend:"down", accent:"#2E7D32", icon:<Clock size={20} color="#2E7D32" />        },
    { label:"Hit Ratio (YTD)",    value:"71%",    sub:"+3pp vs. last year",       trend:"up",   accent:N,         icon:<Award size={20} color={N} />             },
  ],
  "sr-uw": [
    { label:"My In Review",       value:"4",      sub:"Active submissions",       trend:"up",   accent:G,         icon:<Inbox size={20} color={G} />          },
    { label:"Quoted This Month",  value:"9",      sub:"+1 vs. last month",        trend:"up",   accent:"#2E7D32", icon:<CheckCircle2 size={20} color="#2E7D32" /> },
    { label:"Bound This Month",   value:"4",      sub:"$1.45M premium",           trend:"up",   accent:"#005B99", icon:<ShieldCheck size={20} color="#005B99" />  },
    { label:"Avg. Days to Quote", value:"3.2d",   sub:"Best on team",             trend:"down", accent:"#2E7D32", icon:<Clock size={20} color="#2E7D32" />        },
    { label:"Hit Ratio (YTD)",    value:"74%",    sub:"+6pp vs. last year",       trend:"up",   accent:N,         icon:<Award size={20} color={N} />             },
  ],
  "lead": [
    { label:"Team In Review",     value:"12",     sub:"Across 4 underwriters",    trend:"up",   accent:G,         icon:<Inbox size={20} color={G} />          },
    { label:"Team Quoted",        value:"19",     sub:"$4.2M total pipeline",     trend:"up",   accent:"#2E7D32", icon:<CheckCircle2 size={20} color="#2E7D32" /> },
    { label:"Bound YTD",          value:"31",     sub:"$3.1M premium bound",      trend:"up",   accent:"#005B99", icon:<ShieldCheck size={20} color="#005B99" />  },
    { label:"Avg. Days to Quote", value:"4.1d",   sub:"−0.6 vs. prior quarter",   trend:"down", accent:"#2E7D32", icon:<Clock size={20} color="#2E7D32" />        },
    { label:"Team Hit Ratio",     value:"72%",    sub:"+4pp vs. prior year",      trend:"up",   accent:N,         icon:<Award size={20} color={N} />             },
  ],
  "director": [
    { label:"Active Submissions", value:"47",     sub:"Portfolio-wide",           trend:"up",   accent:G,         icon:<Inbox size={20} color={G} />          },
    { label:"Quoted Pipeline",    value:"$8.4M",  sub:"23 accounts",              trend:"up",   accent:"#2E7D32", icon:<DollarSign size={20} color="#2E7D32" />   },
    { label:"Bound YTD",          value:"$3.1M",  sub:"31 policies — on target",  trend:"up",   accent:"#005B99", icon:<ShieldCheck size={20} color="#005B99" />  },
    { label:"Portfolio Hit Ratio",value:"69%",    sub:"+2pp vs. prior year",      trend:"up",   accent:N,         icon:<Award size={20} color={N} />             },
    { label:"Avg. Days to Quote", value:"4.1d",   sub:"Within SLA (≤5d)",         trend:"down", accent:"#2E7D32", icon:<Clock size={20} color="#2E7D32" />        },
  ],
};

// ── Helpers ──────────────────────────────────────────────────────────────────
const statusStyle = (s: SubStatus) => {
  const m: Record<SubStatus,{bg:string;text:string;border:string;dot:string}> = {
    "In Review":   {bg:"#FFF8E6",text:"#8A5C00",border:"#F0D88A",dot:"#C9A227"},
    "Quoted":      {bg:"#E8F0F9",text:"#00427A",border:"#9ABCD6",dot:"#005B99"},
    "Bound":       {bg:"#E8F5EC",text:"#1A5C30",border:"#93C8A0",dot:"#2E7D32"},
    "Declined":    {bg:"#FBEAEA",text:"#7A1F1F",border:"#E8A8A8",dot:"#B91C1C"},
    "Pending Info":{bg:"#F0F3F8",text:"#4A5D6E",border:"#C4CDD8",dot:"#7A8FA3"},
  };
  return m[s];
};

const priorityStyle = (p: Priority) => {
  const m: Record<Priority,{bg:string;text:string;border:string}> = {
    Critical:{bg:"#FBEAEA",text:"#7A1F1F",border:"#E8A8A8"},
    High:    {bg:"#FFF8E6",text:"#8A5C00",border:"#F0D88A"},
    Medium:  {bg:"#E8F0F9",text:"#00427A",border:"#9ABCD6"},
    Low:     {bg:TH,        text:TT,        border:BDL      },
  };
  return m[p];
};

const alertSev = (sev: Alert["severity"]) => {
  if (sev==="critical") return {bg:"#FBEAEA",border:"#E8A8A8",dot:"#B91C1C",label:"Critical"};
  if (sev==="warning")  return {bg:"#FFF8E6",border:"#F0D88A",dot:"#B45309",label:"Warning" };
  return                       {bg:"#E8F0F9",border:"#9ABCD6",dot:"#005B99",label:"Info"    };
};

// ─── Shared section card ──────────────────────────────────────────────────────
function SectionCard({title,icon,accent=N,action,children,noPad=false}: {
  title:string; icon?:React.ReactNode; accent?:string;
  action?:React.ReactNode; children:React.ReactNode; noPad?:boolean;
}) {
  return (
    <div style={{background:"white",border:`1px solid ${BD}`,borderTop:`3px solid ${accent}`}}>
      <div className="flex items-center justify-between px-5 py-3" style={{borderBottom:`1px solid ${BDL}`,background:TH}}>
        <div className="flex items-center gap-2">
          {icon && <span style={{color:accent}}>{icon}</span>}
          <h3 style={{fontSize:"0.72rem",fontWeight:700,color:N,textTransform:"uppercase",letterSpacing:"0.08em"}}>{title}</h3>
        </div>
        {action}
      </div>
      {noPad ? children : <div>{children}</div>}
    </div>
  );
}

// ─── Dashboard page ───────────────────────────────────────────────────────────
export function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const activeRole: RoleId = user?.roleId ?? "sr-uw";
  const [subTab, setSubTab]               = useState<"mine"|"team"|"all">("mine");
  const [search, setSearch]               = useState("");
  const [statusFilter, setStatusFilter]   = useState<SubStatus|"All">("All");
  const [showStatusDrop, setShowStatusDrop] = useState(false);
  const [taskFilter, setTaskFilter]       = useState<"all"|"mine"|"overdue">("all");
  const [alertFilter, setAlertFilter]     = useState<"all"|"critical"|"warning">("all");
  const [subPage, setSubPage]             = useState(1);
  const SUB_PER_PAGE = 5;

  const myName = ROLE_NAMES[activeRole];
  const kpis   = KPIS[activeRole];
  const showTeamView = activeRole === "lead" || activeRole === "director";

  const submissions = useMemo(() => {
    let list = ALL_SUBMISSIONS;
    if (subTab === "mine") list = list.filter(s => s.assignee === myName);
    if (subTab === "team" && activeRole !== "director") list = list.filter(s => s.assignee !== "Patricia Hoffman");
    if (search) list = list.filter(s => s.member.toLowerCase().includes(search.toLowerCase()) || s.id.toLowerCase().includes(search.toLowerCase()));
    if (statusFilter !== "All") list = list.filter(s => s.status === statusFilter);
    return list;
  }, [subTab, search, statusFilter, activeRole, myName]);

  const totalSubPages  = Math.ceil(submissions.length / SUB_PER_PAGE);
  const paginatedSubs  = submissions.slice((subPage - 1) * SUB_PER_PAGE, subPage * SUB_PER_PAGE);

  const tasks = useMemo(() => {
    let list = ALL_TASKS;
    if (taskFilter === "mine")    list = list.filter(t => t.assignee === myName);
    if (taskFilter === "overdue") list = list.filter(t => t.overdue);
    return list.slice(0, 6);
  }, [taskFilter, myName]);

  const alerts = useMemo(() => {
    let list = ALL_ALERTS;
    if (alertFilter === "critical") list = list.filter(a => a.severity === "critical");
    if (alertFilter === "warning")  list = list.filter(a => a.severity === "warning");
    return list;
  }, [alertFilter]);

  const critCount    = ALL_ALERTS.filter(a => a.severity === "critical").length;
  const overdueCount = ALL_TASKS.filter(t => t.overdue).length;
  const STATUS_OPTS: (SubStatus|"All")[] = ["All","In Review","Quoted","Bound","Declined","Pending Info"];

  return (
    <AppShell
      activePage="dashboard"
      role={activeRole}
      onRoleChange={() => { }}
      search={search}
      onSearchChange={setSearch}
    >
      {/* ── inner scroll area ──────────────────────────────────────────────── */}
      <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-7 space-y-4 sm:space-y-6" style={{fontFamily:font,color:TD,minHeight:"100%",background:BG}}>

        {/* Page title row */}
        <div className="flex items-end justify-between flex-wrap gap-2">
          <div>
            <h1 style={{fontSize:"1.35rem",fontWeight:800,color:N,lineHeight:1.15}}>Dashboard</h1>
            <p style={{fontSize:"0.80rem",color:TT,marginTop:2}}>
              {myName} · Education Practice &nbsp;·&nbsp; April 19, 2026
            </p>
          </div>
        </div>

        {/* ── KPI STRIP ────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {kpis.map((k, i) => (
            <div key={i} style={{background:"white",border:`1px solid ${BD}`,borderTop:`3px solid ${k.accent}`}} className="px-5 py-4 flex flex-col">
              <div className="flex items-start justify-between mb-3">
                <p style={{fontSize:"0.62rem",fontWeight:700,color:TT,textTransform:"uppercase",letterSpacing:"0.09em",lineHeight:1.4}}>{k.label}</p>
                <div className="flex items-center justify-center shrink-0" style={{width:36,height:36,background:`${k.accent}14`,border:`1px solid ${k.accent}28`}}>
                  {k.icon}
                </div>
              </div>
              <p style={{fontSize:"1.65rem",fontWeight:800,color:k.accent,lineHeight:1.1}}>{k.value}</p>
              <div className="flex items-center gap-1 mt-2">
                {k.trend==="up"   && <TrendingUp size={11} color="#2E7D32" />}
                {k.trend==="down" && <TrendingDown size={11} color="#2E7D32" />}
                <span style={{fontSize:"0.68rem",color:TT}}>{k.sub}</span>
              </div>
            </div>
          ))}
        </div>

        {/* ── MAIN CONTENT GRID ────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">

          {/* LEFT — 2 cols wide */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">

            {/* ── SUBMISSIONS TABLE ──────────────────────────────────────── */}
            <SectionCard
              title="Submissions"
              icon={<Inbox size={13} />}
              accent={N}
              noPad
              action={
                <div className="flex items-center gap-2">
                  <span style={{fontSize:"0.68rem",fontWeight:700,background:N,color:"white",padding:"1px 10px"}}>{submissions.length}</span>
                </div>
              }
            >
              {/* Filter toolbar */}
              <div className="flex items-center justify-between px-5 py-2.5 flex-wrap gap-3" style={{borderBottom:`1px solid ${BDL}`}}>
                {/* Sub tabs */}
                <div className="flex items-center gap-1">
                  {([
                    {id:"mine"as const, label: showTeamView?"Mine":"My Submissions"},
                    {id:"team"as const, label:"Team"},
                    ...(activeRole==="director"?[{id:"all"as const,label:"All"}]:[]),
                  ]).map(t => (
                    <button key={t.id} onClick={()=>{ setSubTab(t.id); setSubPage(1); }} className="px-3.5 py-1.5 transition-all"
                      style={{fontSize:"0.73rem",fontWeight:600,background:subTab===t.id?N:"transparent",color:subTab===t.id?"white":TM,border:`1px solid ${subTab===t.id?N:BD}`}}>
                      {t.label}
                    </button>
                  ))}
                </div>
                {/* Status filter */}
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <button onClick={()=>setShowStatusDrop(v=>!v)} className="flex items-center gap-2 px-3 py-1.5"
                      style={{border:`1px solid ${BD}`,fontSize:"0.73rem",color:TM,background:"white"}}>
                      <Filter size={12} color={TT} />
                      {statusFilter}
                      <ChevronDown size={11} color={TT} />
                    </button>
                    {showStatusDrop && (
                      <div className="absolute right-0 top-full mt-1 z-20" style={{background:"white",border:`1px solid ${BD}`,boxShadow:"0 4px 16px rgba(0,0,0,0.12)",minWidth:160}}>
                        {STATUS_OPTS.map(s=>(
                          <button key={s} onClick={()=>{ setStatusFilter(s); setShowStatusDrop(false); setSubPage(1); }}
                            className="w-full text-left px-4 py-2 hover:bg-slate-50 transition-colors"
                            style={{fontSize:"0.78rem",color:statusFilter===s?N:TM,fontWeight:statusFilter===s?700:400}}>{s}</button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full" style={{borderCollapse:"collapse"}}>
                  <thead>
                    <tr style={{background:TH}}>
                      {["ID","Member / Institution","Type","Assignee","Premium","Status","Priority","Eff. Date",""].map(h=>(
                        <th key={h} className="px-4 py-2.5 text-left whitespace-nowrap"
                          style={{fontSize:"0.58rem",fontWeight:700,color:TT,textTransform:"uppercase",letterSpacing:"0.09em",borderBottom:`1px solid ${BDL}`}}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedSubs.length===0?(
                      <tr><td colSpan={9} className="px-5 py-8 text-center" style={{fontSize:"0.82rem",color:TT}}>No submissions match current filters.</td></tr>
                    ):paginatedSubs.map((s,i)=>{
                      const ss=statusStyle(s.status);
                      const ps=priorityStyle(s.priority);
                      const isMine=s.assignee===myName;
                      return (
                        <tr key={s.id} onClick={()=>navigate("/submission/"+s.id)}
                          className="cursor-pointer hover:bg-slate-50/80 transition-colors"
                          style={{borderBottom:`1px solid ${BDL}`}}>
                          <td className="px-4 py-2.5">
                            <span style={{fontSize:"0.73rem",fontWeight:700,color:"#005B99",fontFamily:"monospace"}}>{s.id}</span>
                          </td>
                          <td className="px-4 py-2.5" style={{maxWidth:200}}>
                            <p style={{fontSize:"0.78rem",fontWeight:600,color:TD,lineHeight:1.3}}>{s.member}</p>
                            <div className="flex items-center gap-1 mt-0.5">
                              <MapPin size={9} color={TT} />
                              <span style={{fontSize:"0.65rem",color:TT}}>{s.state}</span>
                              {!s.docsComplete && <span style={{fontSize:"0.58rem",fontWeight:700,background:"#FBEAEA",color:"#7A1F1F",border:"1px solid #E8A8A8",padding:"0 4px"}}>Docs ⚠</span>}
                            </div>
                          </td>
                          <td className="px-4 py-2.5">
                            <span style={{fontSize:"0.66rem",fontWeight:600,background:TH,color:TM,padding:"2px 7px",border:`1px solid ${BDL}`}}>{s.type}</span>
                          </td>
                          <td className="px-4 py-2.5">
                            <div className="flex items-center gap-1.5">
                              <div className="flex items-center justify-center shrink-0"
                                style={{width:22,height:22,background:isMine?G:BDL,color:isMine?"white":TM,fontSize:"0.55rem",fontWeight:800}}>{s.assigneeInitials}</div>
                              <span style={{fontSize:"0.70rem",color:TM,whiteSpace:"nowrap"}}>{s.assignee.split(" ")[0]}</span>
                            </div>
                          </td>
                          <td className="px-4 py-2.5" style={{fontSize:"0.78rem",fontWeight:700,color:N,whiteSpace:"nowrap"}}>{s.premium}</td>
                          <td className="px-4 py-2.5">
                            <div className="flex items-center gap-1 px-2 py-0.5" style={{background:ss.bg,border:`1px solid ${ss.border}`,whiteSpace:"nowrap"}}>
                              <span className="rounded-full shrink-0" style={{width:5,height:5,background:ss.dot}} />
                              <span style={{fontSize:"0.62rem",fontWeight:700,color:ss.text}}>{s.status}</span>
                            </div>
                          </td>
                          <td className="px-4 py-2.5">
                            <span style={{fontSize:"0.60rem",fontWeight:700,background:ps.bg,color:ps.text,border:`1px solid ${ps.border}`,padding:"1px 6px",textTransform:"uppercase",letterSpacing:"0.04em"}}>{s.priority}</span>
                          </td>
                          <td className="px-4 py-2.5" style={{fontSize:"0.70rem",color:TM,whiteSpace:"nowrap"}}>{s.effectiveDate}</td>
                          <td className="px-4 py-2.5"><ChevronRight size={13} color={TT} /></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {/* Pagination footer */}
              <div className="px-5 py-3 flex items-center justify-between flex-wrap gap-3"
                style={{borderTop:`2px solid ${BDL}`, background:"white"}}>

                {/* Left: range info */}
                <div className="flex items-center gap-3">
                  <span style={{fontSize:"0.72rem", color:TT}}>
                    Showing{" "}
                    <span style={{fontWeight:700, color:TD}}>{submissions.length === 0 ? 0 : (subPage - 1) * SUB_PER_PAGE + 1}</span>
                    {" – "}
                    <span style={{fontWeight:700, color:TD}}>{Math.min(subPage * SUB_PER_PAGE, submissions.length)}</span>
                    {" of "}
                    <span style={{fontWeight:700, color:N}}>{submissions.length}</span>
                    {" submission"}{submissions.length !== 1 ? "s" : ""}
                  </span>
                  {totalSubPages > 1 && (
                    <>
                      <span style={{width:1, height:13, background:BDL, display:"inline-block"}} />
                      <span style={{fontSize:"0.68rem", color:TT}}>
                        Page <span style={{fontWeight:700, color:TD}}>{subPage}</span> of{" "}
                        <span style={{fontWeight:700, color:TD}}>{totalSubPages}</span>
                      </span>
                    </>
                  )}
                </div>

                {/* Right: prev / pages / next */}
                <div className="flex items-center gap-1">
                  {/* Previous */}
                  <button
                    disabled={subPage === 1}
                    onClick={() => setSubPage(p => p - 1)}
                    className="flex items-center gap-1 px-2.5 py-1.5 transition-all hover:bg-slate-50 disabled:opacity-35 disabled:cursor-not-allowed"
                    style={{border:`1px solid ${subPage === 1 ? BDL : BD}`, background:"white", fontSize:"0.72rem", fontWeight:600, color:subPage === 1 ? TT : TM, fontFamily:font}}>
                    <ChevronLeft size={12} /> Prev
                  </button>

                  {/* Page numbers */}
                  {(() => {
                    const pages: (number | "…")[] = [];
                    if (totalSubPages <= 7) {
                      for (let i = 1; i <= totalSubPages; i++) pages.push(i);
                    } else {
                      pages.push(1);
                      if (subPage > 3) pages.push("…");
                      for (let i = Math.max(2, subPage - 1); i <= Math.min(totalSubPages - 1, subPage + 1); i++) pages.push(i);
                      if (subPage < totalSubPages - 2) pages.push("…");
                      pages.push(totalSubPages);
                    }
                    return pages.map((p, i) =>
                      p === "…" ? (
                        <span key={`ellipsis-${i}`} style={{width:28, textAlign:"center", fontSize:"0.72rem", color:TT, lineHeight:"30px"}}>…</span>
                      ) : (
                        <button
                          key={p}
                          onClick={() => setSubPage(p as number)}
                          className={p !== subPage ? "hover:bg-slate-50" : ""}
                          style={{
                            width:30, height:30,
                            border:`1.5px solid ${p === subPage ? N : BDL}`,
                            background: p === subPage ? N : "white",
                            color: p === subPage ? "white" : TM,
                            fontSize:"0.72rem",
                            fontWeight: p === subPage ? 800 : 400,
                            cursor:"pointer",
                            fontFamily:font,
                            transition:"all 0.13s",
                            boxShadow: p === subPage ? `0 2px 6px ${N}35` : "none",
                          }}>
                          {p}
                        </button>
                      )
                    );
                  })()}

                  {/* Next */}
                  <button
                    disabled={subPage === totalSubPages || totalSubPages === 0}
                    onClick={() => setSubPage(p => p + 1)}
                    className="flex items-center gap-1 px-2.5 py-1.5 transition-all hover:bg-slate-50 disabled:opacity-35 disabled:cursor-not-allowed"
                    style={{border:`1px solid ${subPage === totalSubPages || totalSubPages === 0 ? BDL : N}`, background: subPage === totalSubPages || totalSubPages === 0 ? "white" : `${N}08`, fontSize:"0.72rem", fontWeight:600, color: subPage === totalSubPages || totalSubPages === 0 ? TT : N, fontFamily:font}}>
                    Next <ChevronRight size={12} />
                  </button>
                </div>
              </div>
            </SectionCard>

            {/* ── PIPELINE CHART ─────────────────────────────────────────── */}
            <SectionCard title="Submission Pipeline — Last 6 Months" icon={<BarChart2 size={13}/>} accent={G}>
              <div className="px-5 py-5">
                <div className="flex items-center gap-5 mb-4">
                  {[{color:N,label:"Submitted"},{color:"#005B99",label:"Quoted"},{color:"#2E7D32",label:"Bound"}].map(l=>(
                    <div key={l.label} className="flex items-center gap-1.5">
                      <span style={{width:10,height:10,background:l.color,display:"block"}}/>
                      <span style={{fontSize:"0.70rem",color:TM,fontWeight:600}}>{l.label}</span>
                    </div>
                  ))}
                </div>
                <ResponsiveContainer width="100%" height={188}>
                  <BarChart data={PIPELINE_DATA} barGap={3} barCategoryGap="30%">
                    <CartesianGrid key="grid" strokeDasharray="3 3" stroke={BDL} vertical={false}/>
                    <XAxis key="xaxis" dataKey="month" tick={{fontSize:11,fill:TT,fontFamily:font}} axisLine={{stroke:BD}} tickLine={false}/>
                    <YAxis key="yaxis" tick={{fontSize:11,fill:TT,fontFamily:font}} axisLine={false} tickLine={false}/>
                    <Tooltip key="tooltip" contentStyle={{border:`1px solid ${BD}`,borderRadius:0,fontSize:"0.78rem",fontFamily:font}} cursor={{fill:`${N}08`}}/>
                    <Bar key="bar-submitted" dataKey="submitted" fill={N}       name="Submitted"/>
                    <Bar key="bar-quoted"    dataKey="quoted"    fill="#005B99" name="Quoted"/>
                    <Bar key="bar-bound"     dataKey="bound"     fill="#2E7D32" name="Bound"/>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </SectionCard>

            {/* ── TEAM SCOREBOARD (lead / director only) ─────────────────── */}
            {showTeamView && (
              <SectionCard title="Team Performance" icon={<Users size={13}/>} accent={N} noPad>
                <div className="grid grid-cols-6 px-5 py-2.5" style={{background:TH,borderBottom:`1px solid ${BDL}`}}>
                  {["Underwriter","In Review","Quoted","Bound","Hit Ratio","Days to Quote"].map(h=>(
                    <span key={h} style={{fontSize:"0.58rem",fontWeight:700,color:TT,textTransform:"uppercase",letterSpacing:"0.08em"}}>{h}</span>
                  ))}
                </div>
                {TEAM_STATS.map((m,i)=>(
                  <div key={m.name} className="grid grid-cols-6 px-5 py-3 hover:bg-slate-50 transition-colors"
                    style={{borderBottom:i<TEAM_STATS.length-1?`1px solid ${BDL}`:"none"}}>
                    <div className="flex items-center gap-2.5">
                      <div className="flex items-center justify-center shrink-0"
                        style={{width:26,height:26,background:i===0?G:BDL,color:i===0?"white":TM,fontSize:"0.60rem",fontWeight:800}}>{m.initials}</div>
                      <div>
                        <p style={{fontSize:"0.78rem",fontWeight:600,color:TD}}>{m.name.split(" ")[0]}</p>
                        <p style={{fontSize:"0.62rem",color:TT}}>{m.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center"><span style={{fontSize:"0.90rem",fontWeight:700,color:N}}>{m.inReview}</span></div>
                    <div className="flex items-center"><span style={{fontSize:"0.90rem",fontWeight:700,color:"#005B99"}}>{m.quoted}</span></div>
                    <div className="flex items-center"><span style={{fontSize:"0.90rem",fontWeight:700,color:"#2E7D32"}}>{m.bound}</span></div>
                    <div className="flex items-center"><span style={{fontSize:"0.80rem",fontWeight:700,color:TD}}>{m.hitRatio}</span></div>
                    <div className="flex items-center">
                      <span style={{fontSize:"0.80rem",fontWeight:600,color:parseFloat(m.daysToQuote)<=4?"#2E7D32":"#B45309"}}>{m.daysToQuote}</span>
                    </div>
                  </div>
                ))}
              </SectionCard>
            )}
          </div>

          {/* RIGHT — 1 col wide */}
          <div className="space-y-4 sm:space-y-6">

            {/* ── OPEN TASKS ─────────────────────────────────────────────── */}
            <SectionCard
              title="Open Tasks"
              icon={<CheckCircle2 size={13}/>}
              accent={N}
              noPad
              action={
                <div className="flex items-center gap-1">
                  {([{id:"all"as const,label:"All"},{id:"mine"as const,label:"Mine"},{id:"overdue"as const,label:"Overdue"}]).map(f=>(
                    <button key={f.id} onClick={()=>setTaskFilter(f.id)} className="px-2.5 py-1 transition-all"
                      style={{fontSize:"0.62rem",fontWeight:700,background:taskFilter===f.id?N:"transparent",color:taskFilter===f.id?"white":TT,border:taskFilter===f.id?`1px solid ${N}`:`1px solid ${BD}`}}>
                      {f.label}
                      {f.id==="overdue"&&overdueCount>0&&<span style={{marginLeft:3,background:"#B91C1C",color:"white",borderRadius:10,padding:"0 4px",fontSize:"0.55rem"}}>{overdueCount}</span>}
                    </button>
                  ))}
                </div>
              }
            >
              {tasks.length===0?(
                <p className="px-5 py-6 text-center" style={{fontSize:"0.80rem",color:TT}}>No tasks match.</p>
              ):tasks.map((task,i)=>{
                const ps=priorityStyle(task.priority);
                return (
                  <div key={task.id} className="px-5 py-3 hover:bg-slate-50/70 transition-colors"
                    style={{borderBottom:i<tasks.length-1?`1px solid ${BDL}`:"none",background:task.overdue?"#FFFDF4":"white",borderLeft:task.overdue?"3px solid #B45309":"3px solid transparent"}}>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p style={{fontSize:"0.78rem",fontWeight:600,color:task.overdue?"#8A5C00":TD,lineHeight:1.35}}>{task.title}</p>
                      <span style={{fontSize:"0.58rem",fontWeight:700,background:ps.bg,color:ps.text,border:`1px solid ${ps.border}`,padding:"1px 5px",textTransform:"uppercase",flexShrink:0}}>{task.priority}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span style={{fontSize:"0.63rem",fontWeight:700,background:"#E8F0F9",color:"#005B99",padding:"1px 6px"}}>{task.submission}</span>
                      <div className="flex items-center gap-1">
                        {task.overdue?<AlertCircle size={10} color="#B91C1C"/>:<Clock size={10} color={TT}/>}
                        <span style={{fontSize:"0.63rem",color:task.overdue?"#B91C1C":TT,fontWeight:task.overdue?700:400}}>{task.due}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div className="px-5 py-2.5 flex items-center justify-between" style={{borderTop:`1px solid ${BDL}`,background:TH}}>
                <span style={{fontSize:"0.65rem",color:TT}}>{ALL_TASKS.length} total tasks</span>
                <button className="flex items-center gap-1 hover:underline" style={{fontSize:"0.65rem",color:"#005B99",fontWeight:600}}>View all <ArrowUpRight size={9}/></button>
              </div>
            </SectionCard>

            {/* ── ALERTS & FLAGS ─────────────────────────────────────────── */}
            <SectionCard
              title="Alerts & Flags"
              icon={<AlertTriangle size={13}/>}
              accent={G}
              noPad
              action={
                <div className="flex items-center gap-1">
                  {([{id:"all"as const,label:"All"},{id:"critical"as const,label:"Critical"},{id:"warning"as const,label:"Warning"}]).map(f=>(
                    <button key={f.id} onClick={()=>setAlertFilter(f.id)} className="px-2.5 py-1 transition-all"
                      style={{fontSize:"0.62rem",fontWeight:700,background:alertFilter===f.id?G:"transparent",color:alertFilter===f.id?"white":TT,border:alertFilter===f.id?`1px solid ${GD}`:`1px solid ${BD}`}}>
                      {f.label}
                    </button>
                  ))}
                </div>
              }
            >
              {alerts.map((alert,i)=>{
                const sv=alertSev(alert.severity);
                return (
                  <div key={alert.id} onClick={()=>navigate("/submission/"+alert.submission)}
                    className="px-4 py-3 cursor-pointer hover:brightness-98 transition-all"
                    style={{borderBottom:i<alerts.length-1?`1px solid ${BDL}`:"none",background:sv.bg,borderLeft:`3px solid ${sv.dot}`}}>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p style={{fontSize:"0.76rem",fontWeight:700,color:TD,lineHeight:1.3}}>{alert.title}</p>
                      <span style={{fontSize:"0.60rem",color:TT,flexShrink:0}}>{alert.time}</span>
                    </div>
                    <p style={{fontSize:"0.70rem",color:TM,lineHeight:1.5,marginBottom:4}}>{alert.body}</p>
                    <span style={{fontSize:"0.63rem",fontWeight:700,color:"#005B99"}}>{alert.submission} →</span>
                  </div>
                );
              })}
              <div className="px-5 py-2.5 flex items-center justify-between" style={{borderTop:`1px solid ${BDL}`,background:TH}}>
                <span style={{fontSize:"0.65rem",color:TT}}>{critCount} critical · {ALL_ALERTS.filter(a=>a.severity==="warning").length} warnings</span>
                <button className="flex items-center gap-1 hover:underline" style={{fontSize:"0.65rem",color:"#005B99",fontWeight:600}}>View all <ArrowUpRight size={9}/></button>
              </div>
            </SectionCard>

            {/* ── PORTFOLIO SNAPSHOT ─────────────────────────────────────── */}
            <SectionCard title="Portfolio Snapshot" icon={<Activity size={13}/>} accent={N}>
              <div className="px-5 py-1">
                {[
                  {label:"Total Submissions (MTD)", value:"22",     icon:<Inbox size={13} color={N}/>         },
                  {label:"Quoted Pipeline",          value:"$4.2M",  icon:<DollarSign size={13} color="#2E7D32"/>},
                  {label:"Bound YTD",                value:"$3.1M",  icon:<ShieldCheck size={13} color="#005B99"/>},
                  {label:"Avg. Appetite Score",      value:"81/100", icon:<Award size={13} color={G}/>         },
                  {label:"Submissions in SLA",       value:"91%",    icon:<CheckCircle2 size={13} color="#2E7D32"/>},
                  {label:"Docs Incomplete",          value:"4 subs", icon:<AlertCircle size={13} color="#B45309"/>},
                ].map((s,i)=>(
                  <div key={i} className="flex items-center justify-between py-2.5" style={{borderBottom:i<5?`1px solid ${BDL}`:"none"}}>
                    <div className="flex items-center gap-2">{s.icon}<span style={{fontSize:"0.76rem",color:TM}}>{s.label}</span></div>
                    <span style={{fontSize:"0.80rem",fontWeight:700,color:TD}}>{s.value}</span>
                  </div>
                ))}
              </div>
            </SectionCard>

          </div>
        </div>
      </div>
    </AppShell>
  );
}