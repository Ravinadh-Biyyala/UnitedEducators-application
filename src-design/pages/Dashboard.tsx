import { useState, useMemo, useEffect } from "react";
import { useNavigate }       from "react-router-dom";
import {
  Filter, ChevronDown, ChevronLeft, ChevronRight, ArrowUpRight,
  AlertTriangle, CheckCircle2, Clock, TrendingUp, TrendingDown,
  Users, ShieldCheck, AlertCircle, MapPin, DollarSign, Activity,
  Award, Inbox, Plus, Sparkles, Sun, Calendar,
} from "lucide-react";
import { AppShell } from "../components/AppShell";
import type { RoleId } from "../components/AppShell";
import { useAuth } from "../context/AuthContext";
import { PrimaryWhiteButton, GhostButton } from "../components/DashboardCards";
import { PageRegister } from "../components/companion/PageRegister";
import { newId, now } from "../components/companion/CompanionContext";
import type { Suggestion, CompanionMsg } from "../components/companion/CompanionContext";

// ─── Design tokens ────────────────────────────────────────────────────────────
const N   = "#0123D4";
const G   = "#C9A227";
const TH  = "#F0F3F8";
const BD  = "#C4CDD8";
const BDL = "#DCE3EC";
const TD  = "#1A2530";
const TM  = "#4A5D6E";
const TT  = "#7A8FA3";
const BG  = "#EEF1F6";
const OK  = "#15803D";
const WARN= "#B45309";
const BAD = "#B91C1C";
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
    { label:"My In Review",       value:"5",      sub:"+1 vs. last week", trend:"up",   accent:N,   icon:<Inbox size={16}/>          },
    { label:"Quoted This Month",  value:"7",      sub:"+2 vs. last month",trend:"up",   accent:OK,  icon:<CheckCircle2 size={16}/>   },
    { label:"Bound This Month",   value:"3",      sub:"$454K premium",    trend:"up",   accent:"#005B99", icon:<ShieldCheck size={16}/>},
    { label:"Avg. Days to Quote", value:"3.8d",   sub:"−0.4d vs. team",   trend:"down", accent:OK,  icon:<Clock size={16}/>          },
    { label:"Hit Ratio (YTD)",    value:"71%",    sub:"+3pp vs. last yr", trend:"up",   accent:G,   icon:<Award size={16}/>          },
  ],
  "sr-uw": [
    { label:"My In Review",       value:"4",      sub:"Active",           trend:"up",   accent:N,   icon:<Inbox size={16}/>          },
    { label:"Quoted This Month",  value:"9",      sub:"+1 vs. last month",trend:"up",   accent:OK,  icon:<CheckCircle2 size={16}/>   },
    { label:"Bound This Month",   value:"4",      sub:"$1.45M premium",   trend:"up",   accent:"#005B99", icon:<ShieldCheck size={16}/>},
    { label:"Avg. Days to Quote", value:"3.2d",   sub:"Best on team",     trend:"down", accent:OK,  icon:<Clock size={16}/>          },
    { label:"Hit Ratio (YTD)",    value:"74%",    sub:"+6pp vs. last yr", trend:"up",   accent:G,   icon:<Award size={16}/>          },
  ],
  "lead": [
    { label:"Team In Review",     value:"12",     sub:"Across 4 UWs",     trend:"up",   accent:N,   icon:<Inbox size={16}/>          },
    { label:"Team Quoted",        value:"19",     sub:"$4.2M pipeline",   trend:"up",   accent:OK,  icon:<CheckCircle2 size={16}/>   },
    { label:"Bound YTD",          value:"31",     sub:"$3.1M premium",    trend:"up",   accent:"#005B99", icon:<ShieldCheck size={16}/>},
    { label:"Avg. Days to Quote", value:"4.1d",   sub:"−0.6 vs. Q1",      trend:"down", accent:OK,  icon:<Clock size={16}/>          },
    { label:"Team Hit Ratio",     value:"72%",    sub:"+4pp vs. last yr", trend:"up",   accent:G,   icon:<Award size={16}/>          },
  ],
  "director": [
    { label:"Active Submissions", value:"47",     sub:"Portfolio-wide",   trend:"up",   accent:N,   icon:<Inbox size={16}/>          },
    { label:"Quoted Pipeline",    value:"$8.4M",  sub:"23 accounts",      trend:"up",   accent:OK,  icon:<DollarSign size={16}/>     },
    { label:"Bound YTD",          value:"$3.1M",  sub:"31 policies",      trend:"up",   accent:"#005B99", icon:<ShieldCheck size={16}/>},
    { label:"Portfolio Hit Ratio",value:"69%",    sub:"+2pp vs. last yr", trend:"up",   accent:G,   icon:<Award size={16}/>          },
    { label:"Avg. Days to Quote", value:"4.1d",   sub:"Within SLA (≤5d)", trend:"down", accent:OK,  icon:<Clock size={16}/>          },
  ],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const statusStyle = (s: SubStatus) => {
  const m: Record<SubStatus,{bg:string;text:string;dot:string}> = {
    "In Review":   { bg:"#FFF8E6", text:"#8A5C00", dot:"#C9A227" },
    "Quoted":      { bg:"#E8F0F9", text:"#00427A", dot:"#005B99" },
    "Bound":       { bg:"#E8F5EC", text:"#1A5C30", dot:"#2E7D32" },
    "Declined":    { bg:"#FBEAEA", text:"#7A1F1F", dot:"#B91C1C" },
    "Pending Info":{ bg:"#F0F3F8", text:"#4A5D6E", dot:"#7A8FA3" },
  };
  return m[s];
};

const priorityColor = (p: Priority) => {
  if (p === "Critical") return BAD;
  if (p === "High")     return WARN;
  if (p === "Medium")   return "#005B99";
  return TT;
};

const alertSev = (sev: Alert["severity"]) => {
  if (sev==="critical") return { bg:"#FEF3F2", dot:BAD,  label:"Critical" };
  if (sev==="warning")  return { bg:"#FFFBEB", dot:WARN, label:"Warning"  };
  return                       { bg:"#EFF6FF", dot:"#1E40AF", label:"Info" };
};

// ─── Card chrome ──────────────────────────────────────────────────────────────
function SectionCard({title,icon,accent=N,action,children,noPad=false}: {
  title:string; icon?:React.ReactNode; accent?:string;
  action?:React.ReactNode; children:React.ReactNode; noPad?:boolean;
}) {
  return (
    <div style={{
      background:"white",
      border:`1px solid ${BDL}`,
      borderTop:`3px solid ${accent}`,
      borderRadius:8,
      overflow:"hidden",
      boxShadow:"0 1px 2px rgba(15,23,42,0.04)",
    }}>
      <div className="flex items-center justify-between px-5 py-3"
        style={{ borderBottom:`1px solid ${BDL}`, background:"#FAFBFD" }}>
        <div className="flex items-center gap-2">
          {icon && (
            <span className="inline-flex items-center justify-center"
              style={{ width:24, height:24, borderRadius:6, background:`${accent}12`, color:accent }}>
              {icon}
            </span>
          )}
          <h3 style={{ fontSize:"0.74rem", fontWeight:700, color:TD, textTransform:"uppercase", letterSpacing:"0.08em" }}>
            {title}
          </h3>
        </div>
        {action}
      </div>
      {noPad ? children : <div>{children}</div>}
    </div>
  );
}

// ─── Pipeline graph (modern SVG combo chart) ──────────────────────────────────
function PipelineChart({ data }: { data: typeof PIPELINE_DATA }) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 60);
    return () => clearTimeout(t);
  }, []);

  // Layout — breathing-room paddings
  const W       = 760;
  const H       = 340;
  const padT    = 28;
  const padR    = 70;
  const padB    = 72;
  const padL    = 52;
  const chartW  = W - padL - padR;
  const chartH  = H - padT - padB;

  // Scales
  const maxCount = Math.ceil(Math.max(...data.flatMap(d => [d.submitted, d.quoted, d.bound])) * 1.18 / 5) * 5;
  const yScale   = (v: number) => padT + chartH - (v / maxCount) * chartH;
  const groupW   = chartW / data.length;
  const barW     = 16;
  const barGap   = 4;
  const groupBarsW = barW * 3 + barGap * 2;

  // Conversion line (secondary axis 0–100%)
  const convScale = (v: number) => padT + chartH - (v / 100) * chartH;
  const convPoints = data.map((d, i) => {
    const conv = Math.round((d.bound / d.submitted) * 100);
    return { x: padL + groupW * i + groupW / 2, y: convScale(conv), conv };
  });

  // Smooth path through conversion points
  const convPath = convPoints
    .map((p, i, arr) => {
      if (i === 0) return `M ${p.x} ${p.y}`;
      const prev = arr[i - 1];
      const cpx1 = (prev.x + p.x) / 2;
      const cpx2 = (prev.x + p.x) / 2;
      return `C ${cpx1} ${prev.y}, ${cpx2} ${p.y}, ${p.x} ${p.y}`;
    })
    .join(" ");

  // Y-axis ticks
  const tickCount = 5;
  const ticks = Array.from({ length: tickCount + 1 }, (_, i) => Math.round((maxCount / tickCount) * i));

  return (
    <div className="relative" style={{ width: "100%" }}>
      {/* Legend — evenly spaced with subtle dividers + a pill-style background */}
      <div className="flex items-center flex-wrap mb-6 px-2"
        style={{
          background: "#FAFBFD",
          border: `1px solid ${BDL}`,
          borderRadius: 8,
          padding: "8px 14px",
          gap: 0,
          rowGap: 8,
          justifyContent: "flex-start",
        }}>
        {([
          { kind: "swatch" as const, color: N,         label: "Submitted"    },
          { kind: "swatch" as const, color: "#005B99", label: "Quoted"       },
          { kind: "swatch" as const, color: OK,        label: "Bound"        },
          { kind: "line"   as const, color: G,         label: "Conversion %" },
        ]).map((l, i, arr) => (
          <div key={l.label} className="inline-flex items-center"
            style={{ paddingRight: i === arr.length - 1 ? 0 : 18 }}>
            <span className="inline-flex items-center" style={{ gap: 8 }}>
              {l.kind === "swatch" ? (
                <span style={{ width: 11, height: 11, borderRadius: 3, background: l.color }}/>
              ) : (
                <span style={{ width: 18, height: 2.5, background: l.color, borderRadius: 2 }}/>
              )}
              <span style={{ fontSize: "0.74rem", color: TM, fontWeight: 600, whiteSpace: "nowrap" }}>
                {l.label}
              </span>
            </span>
            {i < arr.length - 1 && (
              <span aria-hidden style={{
                width: 1, height: 14, background: BDL,
                marginLeft: 18,
              }}/>
            )}
          </div>
        ))}
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        height={H}
        preserveAspectRatio="xMidYMid meet"
        style={{ display: "block", overflow: "visible", fontFamily: font }}>

        <defs>
          {/* Gradient fills for each series */}
          <linearGradient id="pl-submitted" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={N} stopOpacity="0.95"/>
            <stop offset="100%" stopColor={N} stopOpacity="0.65"/>
          </linearGradient>
          <linearGradient id="pl-quoted" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#005B99" stopOpacity="0.95"/>
            <stop offset="100%" stopColor="#005B99" stopOpacity="0.65"/>
          </linearGradient>
          <linearGradient id="pl-bound" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={OK} stopOpacity="0.95"/>
            <stop offset="100%" stopColor={OK} stopOpacity="0.65"/>
          </linearGradient>
          {/* Conversion line area fill */}
          <linearGradient id="pl-conv-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={G} stopOpacity="0.18"/>
            <stop offset="100%" stopColor={G} stopOpacity="0"/>
          </linearGradient>
          {/* Soft drop-shadow used on hover */}
          <filter id="pl-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="rgba(15,23,42,0.18)"/>
          </filter>
        </defs>

        {/* Y-axis (count) gridlines + labels — left side */}
        {ticks.map((t, i) => {
          const y = yScale(t);
          return (
            <g key={`y-${i}`}>
              <line
                x1={padL} x2={W - padR}
                y1={y}    y2={y}
                stroke={BDL}
                strokeWidth={1}
                strokeDasharray={i === 0 ? "0" : "3 3"}
              />
              <text
                x={padL - 12} y={y + 3}
                textAnchor="end"
                fontSize="10"
                fill={TT}
                fontWeight="600"
                style={{ fontVariantNumeric: "tabular-nums" }}>
                {t}
              </text>
            </g>
          );
        })}

        {/* Right-side conversion-% axis (0 / 50 / 100) */}
        {[0, 50, 100].map(p => {
          const y = convScale(p);
          return (
            <text
              key={`conv-tick-${p}`}
              x={W - padR + 10}
              y={y + 3}
              textAnchor="start"
              fontSize="9"
              fill={G}
              fontWeight="700"
              style={{ fontVariantNumeric: "tabular-nums" }}>
              {p}%
            </text>
          );
        })}

        {/* Left-axis title */}
        <text
          x={padL - 12}
          y={padT - 12}
          textAnchor="end"
          fontSize="9"
          fontWeight="800"
          fill={TT}
          style={{ letterSpacing: "0.08em", textTransform: "uppercase" }}>
          Count
        </text>

        {/* Bar groups */}
        {data.map((d, i) => {
          const groupCx  = padL + groupW * i + groupW / 2;
          const groupX0  = groupCx - groupBarsW / 2;
          const isHover  = hoverIdx === i;
          const isCurr   = i === data.length - 1;

          const bars = [
            { x: groupX0,                       value: d.submitted, fill: "url(#pl-submitted)", color: N         },
            { x: groupX0 + barW + barGap,       value: d.quoted,    fill: "url(#pl-quoted)",     color: "#005B99" },
            { x: groupX0 + 2 * (barW + barGap), value: d.bound,     fill: "url(#pl-bound)",      color: OK        },
          ];

          return (
            <g
              key={d.month}
              onMouseEnter={() => setHoverIdx(i)}
              onMouseLeave={() => setHoverIdx(null)}
              style={{ cursor: "pointer" }}>

              {/* Hover backdrop */}
              <rect
                x={padL + groupW * i + 2}
                y={padT}
                width={groupW - 4}
                height={chartH}
                fill={isHover ? `${N}06` : "transparent"}
                rx={4}
                style={{ transition: "fill 0.2s ease" }}
              />

              {/* Bars */}
              {bars.map((b, bi) => {
                const fullY = yScale(b.value);
                const animY = animated ? fullY : padT + chartH;
                const animH = animated ? padT + chartH - fullY : 0;
                return (
                  <g key={bi}>
                    <rect
                      x={b.x}
                      y={animY}
                      width={barW}
                      height={animH}
                      rx={3}
                      ry={3}
                      fill={b.fill}
                      filter={isHover ? "url(#pl-shadow)" : undefined}
                      style={{
                        transition: `y ${0.55 + bi * 0.06}s cubic-bezier(0.4,0,0.2,1), height ${0.55 + bi * 0.06}s cubic-bezier(0.4,0,0.2,1), filter 0.2s ease`,
                      }}
                    />
                    {/* Value label on hover */}
                    {isHover && (
                      <text
                        x={b.x + barW / 2}
                        y={fullY - 6}
                        textAnchor="middle"
                        fontSize="10"
                        fontWeight="800"
                        fill={b.color}
                        style={{ fontVariantNumeric: "tabular-nums" }}>
                        {b.value}
                      </text>
                    )}
                  </g>
                );
              })}

              {/* X-axis label */}
              <text
                x={groupCx}
                y={H - padB + 22}
                textAnchor="middle"
                fontSize="11"
                fontWeight={isCurr ? 800 : 700}
                fill={isCurr ? N : TT}
                style={{ letterSpacing: "0.08em", textTransform: "uppercase" }}>
                {d.month}
              </text>

              {/* Current pill — well spaced below month name */}
              {isCurr && (
                <g>
                  <rect
                    x={groupCx - 28} y={H - padB + 36}
                    width={56} height={18}
                    rx={9}
                    fill={`${N}12`}/>
                  <text
                    x={groupCx}
                    y={H - padB + 48}
                    textAnchor="middle"
                    fontSize="9"
                    fontWeight="800"
                    fill={N}
                    style={{ letterSpacing: "0.1em" }}>
                    CURRENT
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* Conversion area fill (under the line) */}
        <path
          d={`${convPath} L ${convPoints[convPoints.length - 1].x} ${padT + chartH} L ${convPoints[0].x} ${padT + chartH} Z`}
          fill="url(#pl-conv-area)"
          style={{
            opacity: animated ? 1 : 0,
            transition: "opacity 0.8s ease 0.5s",
          }}
        />

        {/* Conversion line */}
        <path
          d={convPath}
          fill="none"
          stroke={G}
          strokeWidth={2.2}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            strokeDasharray: 1000,
            strokeDashoffset: animated ? 0 : 1000,
            transition: "stroke-dashoffset 1.2s ease 0.3s",
          }}
        />

        {/* Conversion markers */}
        {convPoints.map((p, i) => {
          const isHover = hoverIdx === i;
          return (
            <g key={`conv-${i}`}>
              <circle
                cx={p.x}
                cy={p.y}
                r={isHover ? 6 : 4}
                fill="white"
                stroke={G}
                strokeWidth={2}
                style={{
                  transition: "r 0.18s ease",
                  opacity: animated ? 1 : 0,
                  transitionDelay: animated ? `${i * 80 + 600}ms` : "0ms",
                }}
              />
              {isHover && (
                <text
                  x={p.x}
                  y={p.y - 12}
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="800"
                  fill={G}
                  style={{ fontVariantNumeric: "tabular-nums" }}>
                  {p.conv}%
                </text>
              )}
            </g>
          );
        })}

        {/* Right-side axis title */}
        <text
          x={W - padR + 10}
          y={padT - 12}
          textAnchor="start"
          fontSize="9"
          fontWeight="800"
          fill={G}
          style={{ letterSpacing: "0.08em", textTransform: "uppercase" }}>
          Conv %
        </text>
      </svg>

      {/* Hover tooltip card */}
      {hoverIdx !== null && (
        <div
          style={{
            position: "absolute",
            bottom: 60,
            left: `${((hoverIdx + 0.5) / data.length) * 100}%`,
            transform: "translateX(-50%)",
            background: "white",
            border: `1px solid ${BDL}`,
            borderRadius: 8,
            padding: "8px 12px",
            boxShadow: "0 8px 24px rgba(15,23,42,0.12)",
            pointerEvents: "none",
            zIndex: 10,
            minWidth: 130,
          }}>
          <div className="flex items-center justify-between gap-3 mb-1.5">
            <span style={{
              fontSize: "0.62rem", fontWeight: 800, color: TT,
              textTransform: "uppercase", letterSpacing: "0.08em",
            }}>
              {data[hoverIdx].month}
            </span>
            {hoverIdx === data.length - 1 && (
              <span style={{
                fontSize: "0.5rem", fontWeight: 800, color: N, background: `${N}10`,
                padding: "1px 5px", borderRadius: 3,
                textTransform: "uppercase", letterSpacing: "0.06em",
              }}>
                Current
              </span>
            )}
          </div>
          <div className="space-y-0.5">
            {[
              { label: "Submitted", value: data[hoverIdx].submitted, color: N         },
              { label: "Quoted",    value: data[hoverIdx].quoted,    color: "#005B99" },
              { label: "Bound",     value: data[hoverIdx].bound,     color: OK        },
            ].map(r => (
              <div key={r.label} className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-1.5">
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: r.color }}/>
                  <span style={{ fontSize: "0.66rem", color: TM, fontWeight: 600 }}>{r.label}</span>
                </span>
                <span style={{
                  fontSize: "0.74rem", fontWeight: 800, color: TD,
                  fontVariantNumeric: "tabular-nums",
                }}>
                  {r.value}
                </span>
              </div>
            ))}
            <div className="flex items-center justify-between gap-3 pt-1 mt-1"
              style={{ borderTop: `1px dashed ${BDL}` }}>
              <span className="inline-flex items-center gap-1.5">
                <span style={{ width: 8, height: 2, background: G, borderRadius: 1 }}/>
                <span style={{ fontSize: "0.62rem", color: TT, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Conv.</span>
              </span>
              <span style={{
                fontSize: "0.78rem", fontWeight: 800,
                color: convPoints[hoverIdx].conv >= 50 ? OK : convPoints[hoverIdx].conv >= 40 ? WARN : BAD,
                fontVariantNumeric: "tabular-nums",
              }}>
                {convPoints[hoverIdx].conv}%
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Pipeline month tile ──────────────────────────────────────────────────────
function PipelineTile({
  month, submitted, quoted, bound, isCurrent,
}: {
  month: string; submitted: number; quoted: number; bound: number; isCurrent: boolean;
}) {
  const conv = Math.round((bound / submitted) * 100);
  const convColor = conv >= 50 ? OK : conv >= 40 ? WARN : BAD;

  return (
    <div style={{ background: "white", padding: 16 }}>
      <div className="flex items-center justify-between mb-2">
        <span style={{
          fontSize: "0.62rem", fontWeight: 800, color: TT,
          textTransform: "uppercase", letterSpacing: "0.1em",
        }}>
          {month}
        </span>
        {isCurrent && (
          <span style={{
            fontSize: "0.5rem", fontWeight: 800, color: N, background: `${N}10`,
            padding: "1px 5px", borderRadius: 3,
            textTransform: "uppercase", letterSpacing: "0.06em",
          }}>
            Current
          </span>
        )}
      </div>

      <div className="space-y-1">
        <div className="flex items-baseline justify-between">
          <span style={{ fontSize: "0.65rem", color: TT, fontWeight: 600 }}>Submitted</span>
          <span style={{ fontSize: "0.86rem", fontWeight: 800, color: TD, fontVariantNumeric: "tabular-nums" }}>
            {submitted}
          </span>
        </div>
        <div className="flex items-baseline justify-between">
          <span style={{ fontSize: "0.65rem", color: TT, fontWeight: 600 }}>Quoted</span>
          <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#005B99", fontVariantNumeric: "tabular-nums" }}>
            {quoted}
          </span>
        </div>
        <div className="flex items-baseline justify-between">
          <span style={{ fontSize: "0.65rem", color: TT, fontWeight: 600 }}>Bound</span>
          <span style={{ fontSize: "0.78rem", fontWeight: 700, color: OK, fontVariantNumeric: "tabular-nums" }}>
            {bound}
          </span>
        </div>
      </div>

      <div className="mt-2.5 pt-2" style={{ borderTop: `1px dashed ${BDL}` }}>
        <div className="flex items-baseline justify-between">
          <span style={{
            fontSize: "0.58rem", color: TT, fontWeight: 700,
            textTransform: "uppercase", letterSpacing: "0.06em",
          }}>
            Conv.
          </span>
          <span style={{
            fontSize: "0.72rem", fontWeight: 800, color: convColor,
            fontVariantNumeric: "tabular-nums",
          }}>
            {conv}%
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── KPI Tile (modern, with minimal hover fill) ───────────────────────────────
function KPITile({ k }: { k: { label:string; value:string; sub:string; trend:"up"|"down"|"none"; accent:string; icon:React.ReactNode } }) {
  const [hovered, setHovered] = useState(false);
  const TrendArrow = k.trend === "down" ? TrendingDown : TrendingUp;
  const trendColor = k.trend === "none" ? TT : OK;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      tabIndex={0}
      role="group"
      aria-label={`${k.label}: ${k.value}, ${k.sub}`}
      style={{
        background: hovered
          ? `linear-gradient(135deg, white 0%, ${k.accent}08 100%)`
          : "white",
        border:`1px solid ${hovered ? `${k.accent}40` : BDL}`,
        borderRadius:10,
        padding:"14px 16px",
        boxShadow: hovered
          ? `0 2px 6px ${k.accent}14, 0 1px 2px rgba(15,23,42,0.04)`
          : "0 1px 2px rgba(15,23,42,0.04)",
        transform: hovered ? "translateY(-1px)" : "translateY(0)",
        transition: "background 0.2s ease, border-color 0.2s ease, box-shadow 0.25s ease, transform 0.2s ease",
        position:"relative", overflow:"hidden",
        outline:"none",
        cursor:"default",
      }}>
      {/* Accent strip at top — grows + saturates on hover */}
      <span aria-hidden style={{
        position:"absolute", inset:"0 0 auto 0",
        height: hovered ? 4 : 3,
        background: hovered
          ? k.accent
          : `linear-gradient(90deg, ${k.accent}, ${k.accent}66)`,
        transition: "height 0.2s ease, background 0.2s ease",
      }}/>
      <div className="flex items-start justify-between gap-2">
        <p style={{
          fontSize:"0.6rem", fontWeight:700, color:TT,
          textTransform:"uppercase", letterSpacing:"0.09em", lineHeight:1.3,
        }}>
          {k.label}
        </p>
        <span className="inline-flex items-center justify-center"
          style={{
            width:30, height:30, borderRadius:8,
            background: hovered ? `${k.accent}1F` : `${k.accent}10`,
            color:k.accent,
            transform: hovered ? "scale(1.08)" : "scale(1)",
            transition: "background 0.2s ease, transform 0.2s ease",
          }}>
          {k.icon}
        </span>
      </div>
      <p style={{
        fontSize:"1.7rem", fontWeight:800,
        color: hovered ? k.accent : TD,
        lineHeight:1.1, marginTop:6,
        fontVariantNumeric:"tabular-nums",
        transition: "color 0.2s ease",
      }}>
        {k.value}
      </p>
      <div className="inline-flex items-center gap-1 mt-2"
        style={{ fontSize:"0.66rem", color:trendColor, fontWeight:600 }}>
        {k.trend !== "none" && <TrendArrow size={11}/>}
        <span>{k.sub}</span>
      </div>
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
  const firstName = myName.split(" ")[0];
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
  const warnCount    = ALL_ALERTS.filter(a => a.severity === "warning").length;
  const overdueCount = ALL_TASKS.filter(t => t.overdue).length;
  const STATUS_OPTS: (SubStatus|"All")[] = ["All","In Review","Quoted","Bound","Declined","Pending Info"];

  // Greeting based on time of day
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const today = new Date().toLocaleDateString("en-US", { weekday:"long", month:"long", day:"numeric", year:"numeric" });

  return (
    <AppShell
      activePage="dashboard"
      role={activeRole}
      onRoleChange={() => {}}
      search={search}
      onSearchChange={setSearch}
    >
      <div className="px-4 sm:px-6 lg:px-8 py-5 sm:py-7 space-y-5 sm:space-y-6"
        style={{ fontFamily:font, color:TD, minHeight:"100%", background:BG }}>

        <PageRegister
          routeKey="page:dashboard"
          title="Dashboard"
          subtitle="Today's workbench"
          greeting="Three things ready: one submission is ready to quote, one referral is past SLA, and two appetite scores moved overnight. Want a chart of today's pipeline?"
          suggestions={[
            { id: "today", label: "Show today's pipeline", tone: "blue", icon: "BarChart3" },
            { id: "urgent", label: "What's urgent?", tone: "red", icon: "AlertTriangle" },
            { id: "open-submissions", label: "Open Submissions", tone: "violet", icon: "InboxIcon", navigateTo: "/submissions" },
            { id: "new-sub", label: "Start a new submission", tone: "gold", icon: "Plus", navigateTo: "/submissions/new" },
          ]}
          respond={(sid) => {
            if (sid === "today") return [{ id: newId(), role: "agent", kind: "viz", ts: now(), viz: {
              kind: "linecard",
              title: "Pipeline · policies bound by month",
              intro: "Strong momentum heading into renewals — bound counts have grown each of the last 6 months.",
              data: [
                { label: "Oct", value: 12 }, { label: "Nov", value: 18 }, { label: "Dec", value: 21 },
                { label: "Jan", value: 24 }, { label: "Feb", value: 28 }, { label: "Mar", value: 34 },
              ],
              yFormat: "number", cta: "add-to-dashboard", dashboardHref: "/",
            } }];
            if (sid === "urgent") return [{ id: newId(), role: "agent", kind: "viz", ts: now(), viz: {
              kind: "checklist", title: "Urgent today",
              items: [
                { ok: false, label: "Brookfield Day School — quote ready", sub: "SUB-7829 · due today", href: "/submission/SUB-7829" },
                { ok: false, label: "Austin ISD — missing questionnaire",   sub: "SUB-7831 · overdue",   href: "/submission/SUB-7831?tab=documents" },
                { ok: false, label: "Seattle PS — safety questionnaire",    sub: "SUB-7835 · 2 days",    href: "/submission/SUB-7835?tab=documents" },
              ],
            } }];
            return;
          }}
          freeText={(text) => {
            const t = text.toLowerCase();
            if (/\b(urgent|overdue|critical|past sla)\b/.test(t)) {
              return [{ id: newId(), role: "agent", kind: "text", ts: now(),
                text: `On the workbench right now: ${critCount} critical alerts, ${warnCount} warnings, ${overdueCount} overdue tasks. Want me to open the overdue queue?` }];
            }
            if (/\b(pipeline|today|summary|overview)\b/.test(t)) {
              return [{ id: newId(), role: "agent", kind: "text", ts: now(),
                text: `Today: ${submissions.length} submissions in view, ${tasks.length} tasks loaded, ${critCount} critical alerts. Tap "Show today's pipeline" for a chart.` }];
            }
          }}
          facts={() => [
            `User: ${myName} · Role: ${activeRole}`,
            `Submissions visible: ${submissions.length} (filter: ${subTab}/${statusFilter})`,
            `Tasks loaded: ${tasks.length} (filter: ${taskFilter}); ${overdueCount} overdue overall`,
            `Alerts: ${critCount} critical, ${warnCount} warnings`,
          ].join("\n")}
        />

        {/* ── HERO GREETING ────────────────────────────────────────────────── */}
        <div className="relative overflow-hidden"
          style={{
            background:`linear-gradient(135deg, ${N} 0%, #0E3CE0 50%, #2547F4 100%)`,
            borderRadius:12,
            color:"white",
            boxShadow:`0 4px 16px ${N}25`,
          }}>
          <div aria-hidden style={{
            position:"absolute", top:-40, right:-40, width:180, height:180,
            background:`radial-gradient(circle, ${G}25 0%, transparent 65%)`,
            borderRadius:"50%",
          }}/>
          <div className="relative px-5 sm:px-7 py-5 sm:py-6 flex items-center justify-between gap-4 flex-wrap">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <Sun size={14} color="#FCD34D"/>
                <span style={{
                  fontSize:"0.62rem", fontWeight:800, letterSpacing:"0.1em",
                  textTransform:"uppercase", color:"#C7D2FE",
                }}>
                  {today}
                </span>
              </div>
              <h1 style={{ fontSize:"1.55rem", fontWeight:800, lineHeight:1.15, letterSpacing:"-0.01em" }}>
                {greeting}, {firstName}.
              </h1>
              <p style={{ fontSize:"0.84rem", color:"#C7D2FE", marginTop:6, maxWidth:600 }}>
                {critCount > 0
                  ? `You have ${critCount} critical alert${critCount>1?"s":""} and ${overdueCount} overdue task${overdueCount!==1?"s":""} waiting.`
                  : "Your queue is clear of critical alerts. Nice work."}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <PrimaryWhiteButton onClick={() => navigate("/submissions/new")}>
                <Plus size={14}/>
                New Submission
              </PrimaryWhiteButton>
            </div>
          </div>
        </div>

        {/* ── KPI STRIP ────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {kpis.map((k, i) => <KPITile key={i} k={k}/>)}
        </div>

        {/* ── MAIN CONTENT — stacked full-width sections ──────────────────── */}
        <div className="space-y-4 sm:space-y-6">

            {/* ── SUBMISSIONS TABLE ──────────────────────────────────────── */}
            <SectionCard
              title="Submissions"
              icon={<Inbox size={13}/>}
              accent={N}
              noPad
              action={
                <span style={{
                  fontSize:"0.68rem", fontWeight:800, background:`${N}10`, color:N,
                  padding:"2px 9px", borderRadius:10, letterSpacing:"0.02em",
                }}>
                  {submissions.length}
                </span>
              }>
              {/* Toolbar */}
              <div className="flex items-center justify-between px-5 py-2.5 gap-3 flex-wrap"
                style={{ borderBottom:`1px solid ${BDL}` }}>
                <div className="flex items-center gap-1">
                  {([
                    { id:"mine" as const, label: showTeamView ? "Mine" : "My Submissions" },
                    { id:"team" as const, label:"Team" },
                    ...(activeRole==="director" ? [{ id:"all" as const, label:"All" }] : []),
                  ]).map(t => (
                    <button key={t.id}
                      onClick={() => { setSubTab(t.id); setSubPage(1); }}
                      className="px-3 py-1.5 transition-all"
                      style={{
                        fontSize:"0.74rem", fontWeight: subTab===t.id ? 700 : 500,
                        background: subTab===t.id ? `${N}10` : "transparent",
                        color: subTab===t.id ? N : TM,
                        border:"none", borderRadius:5, cursor:"pointer", fontFamily:font,
                      }}>
                      {t.label}
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <button onClick={() => setShowStatusDrop(v => !v)}
                    className="inline-flex items-center gap-2 px-3 py-1.5"
                    style={{
                      border:`1px solid ${BD}`, borderRadius:5, fontSize:"0.74rem", color:TM,
                      background:"white", cursor:"pointer", fontFamily:font,
                    }}>
                    <Filter size={12} color={TT}/>
                    {statusFilter}
                    <ChevronDown size={11} color={TT}/>
                  </button>
                  {showStatusDrop && (
                    <div className="absolute right-0 top-full mt-1 z-20"
                      style={{
                        background:"white", border:`1px solid ${BDL}`, borderRadius:6,
                        boxShadow:"0 6px 22px rgba(15,23,42,0.12)", minWidth:170,
                      }}>
                      {STATUS_OPTS.map(s => (
                        <button key={s}
                          onClick={() => { setStatusFilter(s); setShowStatusDrop(false); setSubPage(1); }}
                          className="w-full text-left px-4 py-2 hover:bg-slate-50 transition-colors"
                          style={{
                            fontSize:"0.76rem", color: statusFilter===s ? N : TM,
                            fontWeight: statusFilter===s ? 700 : 500,
                            border:"none", background:"transparent", cursor:"pointer",
                            fontFamily:font,
                          }}>
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full" style={{ borderCollapse:"collapse" }}>
                  <thead>
                    <tr style={{ background:"#FAFBFD" }}>
                      {["ID","Member","Type","Assignee","Premium","Status","Priority","Effective",""].map(h => (
                        <th key={h} className="px-4 py-2.5 text-left whitespace-nowrap"
                          style={{
                            fontSize:"0.58rem", fontWeight:700, color:TT,
                            textTransform:"uppercase", letterSpacing:"0.09em",
                            borderBottom:`1px solid ${BDL}`,
                          }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedSubs.length === 0 ? (
                      <tr><td colSpan={9} className="px-5 py-10 text-center"
                        style={{ fontSize:"0.82rem", color:TT }}>
                        No submissions match current filters.
                      </td></tr>
                    ) : paginatedSubs.map((s, idx) => {
                      const ss = statusStyle(s.status);
                      const pc = priorityColor(s.priority);
                      const isMine = s.assignee === myName;
                      const isLast = idx === paginatedSubs.length - 1;
                      return (
                        <tr key={s.id}
                          onClick={() => navigate("/submission/" + s.id)}
                          className="cursor-pointer hover:bg-slate-50 transition-colors group"
                          style={{ borderBottom: isLast ? "none" : `1px solid #EEF1F5` }}>
                          <td className="px-4 py-3">
                            <span style={{
                              fontSize:"0.72rem", fontWeight:700, color:N,
                              fontFamily:"ui-monospace, monospace",
                            }}>
                              {s.id}
                            </span>
                          </td>
                          <td className="px-4 py-3" style={{ maxWidth:230 }}>
                            <p style={{ fontSize:"0.8rem", fontWeight:600, color:TD, lineHeight:1.3 }}
                              className="group-hover:underline">
                              {s.member}
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <MapPin size={9} color={TT}/>
                              <span style={{ fontSize:"0.65rem", color:TT }}>{s.state}</span>
                              {!s.docsComplete && (
                                <span style={{
                                  fontSize:"0.55rem", fontWeight:800, background:"#FEE2E2",
                                  color:BAD, padding:"1px 5px", borderRadius:3,
                                }}>
                                  Docs ⚠
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span style={{ fontSize:"0.68rem", color:TM, fontWeight:500 }}>
                              {s.type}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5">
                              <span className="inline-flex items-center justify-center rounded-full shrink-0"
                                style={{
                                  width:22, height:22,
                                  background: isMine ? `${N}15` : "#E2E8F0",
                                  color: isMine ? N : TM,
                                  fontSize:"0.55rem", fontWeight:800,
                                }}>
                                {s.assigneeInitials}
                              </span>
                              <span style={{
                                fontSize:"0.72rem", color:TD, fontWeight:500, whiteSpace:"nowrap",
                              }}>
                                {s.assignee.split(" ")[0]}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3"
                            style={{
                              fontSize:"0.8rem", fontWeight:700, color:TD,
                              whiteSpace:"nowrap", fontVariantNumeric:"tabular-nums",
                            }}>
                            {s.premium}
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center gap-1.5"
                              style={{
                                background:ss.bg, padding:"2px 8px", borderRadius:4,
                                whiteSpace:"nowrap",
                              }}>
                              <span className="rounded-full shrink-0"
                                style={{ width:5, height:5, background:ss.dot }}/>
                              <span style={{ fontSize:"0.66rem", fontWeight:700, color:ss.text }}>
                                {s.status}
                              </span>
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center gap-1.5"
                              style={{ fontSize:"0.62rem", fontWeight:700, color:pc }}>
                              <span style={{ width:5, height:5, borderRadius:"50%", background:pc }}/>
                              {s.priority}
                            </span>
                          </td>
                          <td className="px-4 py-3"
                            style={{ fontSize:"0.7rem", color:TM, whiteSpace:"nowrap" }}>
                            {s.effectiveDate}
                          </td>
                          <td className="px-4 py-3">
                            <ChevronRight size={13} color={BD}
                              className="transition-colors group-hover:text-blue-600"/>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="px-5 py-3 flex items-center justify-between flex-wrap gap-3"
                style={{ borderTop:`1px solid ${BDL}`, background:"#FAFBFD" }}>
                <span style={{ fontSize:"0.72rem", color:TT }}>
                  Showing <span style={{ fontWeight:700, color:TD }}>{submissions.length === 0 ? 0 : (subPage - 1) * SUB_PER_PAGE + 1}</span>
                  {" – "}
                  <span style={{ fontWeight:700, color:TD }}>{Math.min(subPage * SUB_PER_PAGE, submissions.length)}</span>
                  {" of "}
                  <span style={{ fontWeight:700, color:N }}>{submissions.length}</span>
                </span>
                <div className="flex items-center gap-1">
                  <button
                    disabled={subPage === 1}
                    onClick={() => setSubPage(p => p - 1)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 hover:bg-slate-100 disabled:opacity-35 disabled:cursor-not-allowed transition-all"
                    style={{
                      border:`1px solid ${BDL}`, background:"white", borderRadius:5,
                      fontSize:"0.7rem", fontWeight:600, color: subPage === 1 ? TT : TM,
                      cursor: subPage === 1 ? "not-allowed" : "pointer", fontFamily:font,
                    }}>
                    <ChevronLeft size={12}/> Prev
                  </button>
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
                    return pages.map((p, i) => p === "…" ? (
                      <span key={`e-${i}`} style={{ width:28, textAlign:"center", fontSize:"0.7rem", color:TT, lineHeight:"30px" }}>…</span>
                    ) : (
                      <button key={p} onClick={() => setSubPage(p as number)}
                        className="hover:brightness-95 transition-all"
                        style={{
                          width:30, height:30, borderRadius:5,
                          background: p === subPage ? N : "white",
                          color: p === subPage ? "white" : TM,
                          border:`1px solid ${p === subPage ? N : BDL}`,
                          fontSize:"0.72rem", fontWeight: p === subPage ? 800 : 500,
                          cursor:"pointer", fontFamily:font,
                          boxShadow: p === subPage ? `0 2px 6px ${N}30` : "none",
                        }}>
                        {p}
                      </button>
                    ));
                  })()}
                  <button
                    disabled={subPage === totalSubPages || totalSubPages === 0}
                    onClick={() => setSubPage(p => p + 1)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 hover:bg-slate-100 disabled:opacity-35 disabled:cursor-not-allowed transition-all"
                    style={{
                      border:`1px solid ${BDL}`, background:"white", borderRadius:5,
                      fontSize:"0.7rem", fontWeight:600,
                      color: subPage === totalSubPages || totalSubPages === 0 ? TT : N,
                      cursor: subPage === totalSubPages || totalSubPages === 0 ? "not-allowed" : "pointer",
                      fontFamily:font,
                    }}>
                    Next <ChevronRight size={12}/>
                  </button>
                </div>
              </div>
            </SectionCard>

            {/* ── OPEN TASKS ─────────────────────────────────────────────── */}
            <SectionCard
              title="Open Tasks"
              icon={<CheckCircle2 size={13}/>}
              accent={N}
              noPad
              action={
                <div className="flex items-center gap-1">
                  {([
                    { id:"all"     as const, label:"All"     },
                    { id:"mine"    as const, label:"Mine"    },
                    { id:"overdue" as const, label:"Overdue" },
                  ]).map(f => (
                    <button key={f.id} onClick={() => setTaskFilter(f.id)}
                      className="inline-flex items-center px-2 py-1 transition-all"
                      style={{
                        fontSize:"0.6rem", fontWeight:700,
                        background: taskFilter===f.id ? `${N}10` : "transparent",
                        color: taskFilter===f.id ? N : TT,
                        border:"none", borderRadius:4, cursor:"pointer", fontFamily:font,
                      }}>
                      {f.label}
                      {f.id === "overdue" && overdueCount > 0 && (
                        <span style={{
                          marginLeft:4, background:BAD, color:"white", borderRadius:8,
                          padding:"0 4px", fontSize:"0.52rem", fontWeight:800,
                        }}>
                          {overdueCount}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              }>
              {tasks.length === 0 ? (
                <p className="px-5 py-8 text-center" style={{ fontSize:"0.8rem", color:TT }}>
                  No tasks match.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-px"
                  style={{ background:BDL }}>
                  {tasks.map((task) => {
                    const pc = priorityColor(task.priority);
                    return (
                      <div key={task.id}
                        className="px-5 py-3 hover:bg-slate-50 transition-colors cursor-pointer"
                        style={{
                          background: task.overdue ? "#FFFBF0" : "white",
                          borderLeft: task.overdue ? `3px solid ${WARN}` : "3px solid transparent",
                        }}>
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <p style={{
                            fontSize:"0.8rem", fontWeight:600,
                            color: task.overdue ? WARN : TD, lineHeight:1.35,
                          }}>
                            {task.title}
                          </p>
                          <span className="inline-flex items-center gap-1 shrink-0"
                            style={{ fontSize:"0.6rem", fontWeight:700, color:pc }}>
                            <span style={{ width:5, height:5, borderRadius:"50%", background:pc }}/>
                            {task.priority}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span style={{
                            fontSize:"0.66rem", fontWeight:700, color:N,
                            fontFamily:"ui-monospace, monospace",
                          }}>
                            {task.submission}
                          </span>
                          <div className="inline-flex items-center gap-1"
                            style={{
                              fontSize:"0.66rem", color: task.overdue ? BAD : TT,
                              fontWeight: task.overdue ? 700 : 500,
                            }}>
                            {task.overdue ? <AlertCircle size={10}/> : <Clock size={10}/>}
                            {task.due}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              <div className="px-5 py-2.5 flex items-center justify-between"
                style={{ borderTop:`1px solid ${BDL}`, background:"#FAFBFD" }}>
                <span style={{ fontSize:"0.65rem", color:TT }}>
                  {ALL_TASKS.length} total tasks
                </span>
                <button onClick={() => navigate("/tasks")}
                  className="inline-flex items-center gap-1 hover:underline"
                  style={{
                    fontSize:"0.66rem", color:N, fontWeight:700,
                    background:"none", border:"none", cursor:"pointer", fontFamily:font,
                  }}>
                  View all <ArrowUpRight size={9}/>
                </button>
              </div>
            </SectionCard>

            {/* ── TEAM PERFORMANCE ────────────────────────────────────────── */}
            {showTeamView && (
              <SectionCard title="Team Performance" icon={<Users size={13}/>} accent={N} noPad>
                <div className="grid grid-cols-6 px-5 py-2.5"
                  style={{ background:"#FAFBFD", borderBottom:`1px solid ${BDL}` }}>
                  {["Underwriter","In Review","Quoted","Bound","Hit Ratio","Days to Quote"].map(h => (
                    <span key={h} style={{
                      fontSize:"0.58rem", fontWeight:700, color:TT,
                      textTransform:"uppercase", letterSpacing:"0.08em",
                    }}>
                      {h}
                    </span>
                  ))}
                </div>
                {TEAM_STATS.map((m, i) => (
                  <div key={m.name}
                    className="grid grid-cols-6 px-5 py-3 hover:bg-slate-50 transition-colors"
                    style={{ borderBottom: i < TEAM_STATS.length - 1 ? `1px solid #EEF1F5` : "none" }}>
                    <div className="flex items-center gap-2.5">
                      <span className="inline-flex items-center justify-center rounded-full shrink-0"
                        style={{
                          width:28, height:28,
                          background: i === 0 ? `${G}20` : `${N}10`,
                          color: i === 0 ? G : N,
                          fontSize:"0.6rem", fontWeight:800,
                        }}>
                        {m.initials}
                      </span>
                      <div className="min-w-0">
                        <p style={{ fontSize:"0.78rem", fontWeight:600, color:TD }}>{m.name.split(" ")[0]}</p>
                        <p style={{ fontSize:"0.62rem", color:TT }}>{m.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center"><span style={{ fontSize:"0.92rem", fontWeight:800, color:N, fontVariantNumeric:"tabular-nums" }}>{m.inReview}</span></div>
                    <div className="flex items-center"><span style={{ fontSize:"0.92rem", fontWeight:800, color:"#005B99", fontVariantNumeric:"tabular-nums" }}>{m.quoted}</span></div>
                    <div className="flex items-center"><span style={{ fontSize:"0.92rem", fontWeight:800, color:OK, fontVariantNumeric:"tabular-nums" }}>{m.bound}</span></div>
                    <div className="flex items-center"><span style={{ fontSize:"0.8rem", fontWeight:700, color:TD }}>{m.hitRatio}</span></div>
                    <div className="flex items-center">
                      <span style={{
                        fontSize:"0.8rem", fontWeight:700,
                        color: parseFloat(m.daysToQuote) <= 4 ? OK : WARN,
                      }}>
                        {m.daysToQuote}
                      </span>
                    </div>
                  </div>
                ))}
              </SectionCard>
            )}
            {/* ── ALERTS & PORTFOLIO — 2-col side by side ───────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">

            {/* ── ALERTS & FLAGS ─────────────────────────────────────────── */}
            <SectionCard
              title="Alerts & Flags"
              icon={<AlertTriangle size={13}/>}
              accent={G}
              noPad
              action={
                <div className="flex items-center gap-1">
                  {([
                    { id:"all"      as const, label:"All"      },
                    { id:"critical" as const, label:"Critical" },
                    { id:"warning"  as const, label:"Warning"  },
                  ]).map(f => (
                    <button key={f.id} onClick={() => setAlertFilter(f.id)}
                      className="px-2 py-1 transition-all"
                      style={{
                        fontSize:"0.6rem", fontWeight:700,
                        background: alertFilter===f.id ? `${G}20` : "transparent",
                        color: alertFilter===f.id ? "#8A5C00" : TT,
                        border:"none", borderRadius:4, cursor:"pointer", fontFamily:font,
                      }}>
                      {f.label}
                    </button>
                  ))}
                </div>
              }>
              {/* Scrollable list — caps card height to match Portfolio Snapshot */}
              <div style={{ maxHeight: 240, overflowY: "auto" }}>
              {alerts.map((alert, i) => {
                const sv = alertSev(alert.severity);
                return (
                  <div key={alert.id}
                    onClick={() => navigate("/submission/" + alert.submission)}
                    className="px-4 py-3 cursor-pointer hover:brightness-95 transition-all"
                    style={{
                      borderBottom: i < alerts.length - 1 ? `1px solid #EEF1F5` : "none",
                      background: sv.bg,
                      borderLeft: `3px solid ${sv.dot}`,
                    }}>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p style={{ fontSize:"0.76rem", fontWeight:700, color:TD, lineHeight:1.3 }}>
                        {alert.title}
                      </p>
                      <span style={{ fontSize:"0.6rem", color:TT, flexShrink:0 }}>
                        {alert.time}
                      </span>
                    </div>
                    <p style={{ fontSize:"0.7rem", color:TM, lineHeight:1.5, marginBottom:4 }}>
                      {alert.body}
                    </p>
                    <span style={{
                      fontSize:"0.62rem", fontWeight:700, color:N,
                      fontFamily:"ui-monospace, monospace",
                    }}>
                      {alert.submission} →
                    </span>
                  </div>
                );
              })}
              </div>
              <div className="px-5 py-2.5 flex items-center justify-between"
                style={{ borderTop:`1px solid ${BDL}`, background:"#FAFBFD" }}>
                <span style={{ fontSize:"0.65rem", color:TT }}>
                  {critCount} critical · {warnCount} warnings
                </span>
                <button className="inline-flex items-center gap-1 hover:underline"
                  style={{
                    fontSize:"0.66rem", color:N, fontWeight:700,
                    background:"none", border:"none", cursor:"pointer", fontFamily:font,
                  }}>
                  View all <ArrowUpRight size={9}/>
                </button>
              </div>
            </SectionCard>

            {/* ── PORTFOLIO SNAPSHOT ─────────────────────────────────────── */}
            <SectionCard title="Portfolio Snapshot" icon={<Activity size={13}/>} accent={N}>
              <div className="px-5 py-1">
                {[
                  { label:"Total Submissions (MTD)", value:"22",     icon:<Inbox size={13}/>,         tint:`${N}10`,        color:N        },
                  { label:"Quoted Pipeline",         value:"$4.2M",  icon:<DollarSign size={13}/>,    tint:"#E8F5EC",       color:OK       },
                  { label:"Bound YTD",               value:"$3.1M",  icon:<ShieldCheck size={13}/>,   tint:"#E8F0F9",       color:"#005B99"},
                  { label:"Avg. Appetite Score",     value:"81/100", icon:<Award size={13}/>,         tint:`${G}18`,        color:G        },
                  { label:"Submissions in SLA",      value:"91%",    icon:<CheckCircle2 size={13}/>,  tint:"#E8F5EC",       color:OK       },
                  { label:"Docs Incomplete",         value:"4 subs", icon:<AlertCircle size={13}/>,   tint:"#FFFBEB",       color:WARN     },
                ].map((s, i) => (
                  <div key={i}
                    className="flex items-center justify-between py-2.5 group hover:bg-slate-50 transition-colors -mx-2 px-2 rounded cursor-pointer"
                    style={{ borderBottom: i < 5 ? `1px solid #EEF1F5` : "none" }}>
                    <div className="flex items-center gap-2.5">
                      <span className="inline-flex items-center justify-center"
                        style={{
                          width:24, height:24, borderRadius:6,
                          background:s.tint, color:s.color,
                        }}>
                        {s.icon}
                      </span>
                      <span style={{ fontSize:"0.76rem", color:TM, fontWeight:500 }}>{s.label}</span>
                    </div>
                    <span style={{ fontSize:"0.82rem", fontWeight:800, color:TD, fontVariantNumeric:"tabular-nums" }}>
                      {s.value}
                    </span>
                  </div>
                ))}
              </div>
            </SectionCard>

            </div>{/* ── close Alerts + Portfolio 2-col grid ─────────────── */}
        </div>
      </div>
    </AppShell>
  );
}
