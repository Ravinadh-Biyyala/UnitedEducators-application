import {
  Search, SlidersHorizontal, X, ChevronDown, ChevronUp,
  ArrowUpDown,
  FileText, Clock, CheckCircle2, XCircle, AlertCircle,
  ChevronRight, ChevronLeft, Filter, RotateCcw, Download, Plus,
  Check,
} from "lucide-react";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import {
  AppShell,
} from "../components/AppShell";
import type { RoleId } from "../components/AppShell";
import { useAuth } from "../context/AuthContext";
import { CreateSubmissionModal } from "../components/CreateSubmissionModal";
import { PrimaryWhiteButton, GhostButton } from "../components/DashboardCards";

// ─── Tokens ──────────────────────────────────────────────────────────────────
const N   = "#0123D4";
const G   = "#C9A227";
const BD  = "#C4CDD8";
const BDL = "#DCE3EC";
const TH  = "#F0F3F8";
const TT  = "#7A8FA3";
const TM  = "#4A5D6E";
const TD  = "#1A2530";
const BG  = "#EEF1F6";
const font = "'Source Sans 3', system-ui, sans-serif";

// ─── Static data ──────────────────────────────────────────────────────────────
type StatusType = "In Review" | "Quoted" | "Bound" | "Declined" | "Pending Info" | "New";

const STATUS_CFG: Record<StatusType, { bg: string; text: string; dot: string; border: string; icon: React.ReactNode }> = {
  "New":          { bg:"#F0F3F8", text:TM,        dot:"#7A8FA3", border:BDL,       icon:<FileText size={11}/> },
  "In Review":    { bg:"#FFF8E6", text:"#8A5C00", dot:"#C9A227", border:"#F0D88A", icon:<Clock size={11}/> },
  "Quoted":       { bg:"#E8F0F9", text:"#00427A", dot:"#005B99", border:"#9ABCD6", icon:<FileText size={11}/> },
  "Bound":        { bg:"#E8F5EC", text:"#1A5C30", dot:"#2E7D32", border:"#93C8A0", icon:<CheckCircle2 size={11}/> },
  "Declined":     { bg:"#FBEAEA", text:"#7A1F1F", dot:"#B91C1C", border:"#E8A8A8", icon:<XCircle size={11}/> },
  "Pending Info": { bg:"#FFF3E0", text:"#7A4200", dot:"#E07800", border:"#F5C87A", icon:<AlertCircle size={11}/> },
};

interface Submission {
  id: string;
  subId: string;
  member: string;
  broker: string;
  state: string;
  status: StatusType;
  submissionType: "New Business" | "Cross-Sell";
  products: string[];
  assignedTo: string;
  team: string;
  submitted: string;
  needByDate: string;
  effective: string;
  expiry: string;
  estimatedPremium: number;
  enrollmentCount: number;
  appetiteScore: number;
  priority: "High" | "Medium" | "Low";
  daysInQueue: number;
  lastActivity: string;
}

const ALL_SUBMISSIONS: Submission[] = [
  { id:"1",  subId:"SUB-7829", member:"Riverside Unified School District",  broker:"Gallagher Education, Inc.",   state:"CA", status:"In Review",   submissionType:"New Business", products:["EPL","ELL","GL","Cyber"],       assignedTo:"John Michaels",    team:"Team Alpha", submitted:"2024-03-15", needByDate:"2024-05-15", effective:"2024-07-01", expiry:"2025-07-01", estimatedPremium:102400, enrollmentCount:14200, appetiteScore:92, priority:"High",   daysInQueue:18, lastActivity:"2 hours ago"   },
  { id:"2",  subId:"SUB-7830", member:"San Diego City Unified SD",          broker:"Lockton Companies",           state:"CA", status:"Quoted",       submissionType:"Cross-Sell",   products:["EPL","GL","ML","Property"],     assignedTo:"Sarah Mitchell",   team:"Team Alpha", submitted:"2024-03-12", needByDate:"2024-05-10", effective:"2024-07-01", expiry:"2025-07-01", estimatedPremium:148200, enrollmentCount:22400, appetiteScore:88, priority:"High",   daysInQueue:21, lastActivity:"1 day ago"     },
  { id:"3",  subId:"SUB-7831", member:"Austin ISD",                         broker:"Marsh McLennan Education",    state:"TX", status:"In Review",   submissionType:"New Business", products:["EPL","ELL","GL","Auto"],        assignedTo:"John Michaels",    team:"Team Alpha", submitted:"2024-03-08", needByDate:"2024-06-05", effective:"2024-08-01", expiry:"2025-08-01", estimatedPremium:87600,  enrollmentCount:11800, appetiteScore:79, priority:"Medium", daysInQueue:25, lastActivity:"3 days ago"    },
  { id:"4",  subId:"SUB-7832", member:"Denver Public Schools",              broker:"Willis Towers Watson",        state:"CO", status:"Bound",        submissionType:"Cross-Sell",   products:["EPL","ELL","GL","Cyber","SA"],  assignedTo:"Patricia Hoffman", team:"Team Beta",  submitted:"2024-02-28", needByDate:"2024-05-01", effective:"2024-07-01", expiry:"2025-07-01", estimatedPremium:134500, enrollmentCount:18600, appetiteScore:95, priority:"Low",    daysInQueue:0,  lastActivity:"5 days ago"    },
  { id:"5",  subId:"SUB-7833", member:"Seattle Public Schools",             broker:"Alliant Insurance Services",  state:"WA", status:"Pending Info", submissionType:"New Business", products:["EPL","ML","Cyber"],             assignedTo:"Sarah Mitchell",   team:"Team Alpha", submitted:"2024-03-10", needByDate:"2024-06-20", effective:"2024-09-01", expiry:"2025-09-01", estimatedPremium:64800,  enrollmentCount:8200,  appetiteScore:71, priority:"Medium", daysInQueue:23, lastActivity:"Today"         },
  { id:"6",  subId:"SUB-7834", member:"Houston ISD",                        broker:"Arthur J. Gallagher & Co.",   state:"TX", status:"New",          submissionType:"New Business", products:["EPL","ELL","GL"],               assignedTo:"Unassigned",       team:"Team Beta",  submitted:"2024-03-18", needByDate:"2024-06-10", effective:"2024-08-01", expiry:"2025-08-01", estimatedPremium:92100,  enrollmentCount:13500, appetiteScore:84, priority:"High",   daysInQueue:5,  lastActivity:"Today"         },
  { id:"7",  subId:"SUB-7835", member:"Minneapolis Public Schools",         broker:"Gallagher Education, Inc.",   state:"MN", status:"In Review",   submissionType:"Cross-Sell",   products:["EPL","GL","Crime"],             assignedTo:"John Michaels",    team:"Team Alpha", submitted:"2024-03-05", needByDate:"2024-05-12", effective:"2024-07-01", expiry:"2025-07-01", estimatedPremium:54200,  enrollmentCount:7100,  appetiteScore:81, priority:"Medium", daysInQueue:28, lastActivity:"6 hours ago"   },
  { id:"8",  subId:"SUB-7836", member:"Charlotte-Mecklenburg Schools",      broker:"Lockton Companies",           state:"NC", status:"Quoted",       submissionType:"New Business", products:["EPL","ELL","GL","ML","Property"],   assignedTo:"Patricia Hoffman", team:"Team Beta",  submitted:"2024-03-01", needByDate:"2024-06-01", effective:"2024-08-01", expiry:"2025-08-01", estimatedPremium:178900, enrollmentCount:28400, appetiteScore:91, priority:"High",   daysInQueue:32, lastActivity:"2 days ago"    },
  { id:"9",  subId:"SUB-7837", member:"Clark County School District",       broker:"Marsh McLennan Education",    state:"NV", status:"Declined",     submissionType:"New Business", products:["EPL","GL"],                     assignedTo:"Robert Chen",      team:"Team Beta",  submitted:"2024-02-20", needByDate:"2024-04-30", effective:"2024-07-01", expiry:"2025-07-01", estimatedPremium:0,      enrollmentCount:6400,  appetiteScore:38, priority:"Low",    daysInQueue:0,  lastActivity:"2 weeks ago"   },
  { id:"10", subId:"SUB-7838", member:"Broward County Public Schools",      broker:"Willis Towers Watson",        state:"FL", status:"Bound",        submissionType:"Cross-Sell",   products:["EPL","ELL","GL","Auto","SA"],   assignedTo:"Sarah Mitchell",   team:"Team Alpha", submitted:"2024-02-15", needByDate:"2024-04-15", effective:"2024-06-01", expiry:"2025-06-01", estimatedPremium:221300, enrollmentCount:31200, appetiteScore:89, priority:"Low",    daysInQueue:0,  lastActivity:"3 days ago"    },
  { id:"11", subId:"SUB-7839", member:"Fairfax County Public Schools",      broker:"Alliant Insurance Services",  state:"VA", status:"In Review",   submissionType:"New Business", products:["EPL","ELL","ML","Cyber"],       assignedTo:"John Michaels",    team:"Team Alpha", submitted:"2024-03-14", needByDate:"2024-06-25", effective:"2024-09-01", expiry:"2025-09-01", estimatedPremium:96700,  enrollmentCount:12900, appetiteScore:87, priority:"High",   daysInQueue:19, lastActivity:"Yesterday"     },
  { id:"12", subId:"SUB-7840", member:"Wake County Public School System",   broker:"Arthur J. Gallagher & Co.",   state:"NC", status:"New",          submissionType:"New Business", products:["EPL","GL","Cyber"],             assignedTo:"Unassigned",       team:"Team Beta",  submitted:"2024-03-19", needByDate:"2024-06-08", effective:"2024-08-01", expiry:"2025-08-01", estimatedPremium:72400,  enrollmentCount:9800,  appetiteScore:83, priority:"Medium", daysInQueue:4,  lastActivity:"Today"         },
  { id:"13", subId:"SUB-7841", member:"Gwinnett County Public Schools",     broker:"Gallagher Education, Inc.",   state:"GA", status:"Quoted",       submissionType:"Cross-Sell",   products:["EPL","ELL","GL","ML"],          assignedTo:"Patricia Hoffman", team:"Team Beta",  submitted:"2024-03-03", needByDate:"2024-05-20", effective:"2024-07-01", expiry:"2025-07-01", estimatedPremium:112800, enrollmentCount:15600, appetiteScore:90, priority:"Medium", daysInQueue:30, lastActivity:"4 days ago"    },
  { id:"14", subId:"SUB-7842", member:"Montgomery County Public Schools",   broker:"Lockton Companies",           state:"MD", status:"Pending Info", submissionType:"New Business", products:["EPL","ELL","ML","Crime"],       assignedTo:"John Michaels",    team:"Team Alpha", submitted:"2024-03-11", needByDate:"2024-06-30", effective:"2024-09-01", expiry:"2025-09-01", estimatedPremium:88300,  enrollmentCount:11200, appetiteScore:76, priority:"Medium", daysInQueue:22, lastActivity:"Today"         },
  { id:"15", subId:"SUB-7843", member:"Palm Beach County School District",  broker:"Marsh McLennan Education",    state:"FL", status:"In Review",   submissionType:"Cross-Sell",   products:["EPL","GL","SA"],                assignedTo:"Sarah Mitchell",   team:"Team Alpha", submitted:"2024-03-09", needByDate:"2024-06-02", effective:"2024-08-01", expiry:"2025-08-01", estimatedPremium:58900,  enrollmentCount:7600,  appetiteScore:82, priority:"Low",    daysInQueue:24, lastActivity:"Yesterday"     },
  { id:"16", subId:"SUB-7844", member:"Jefferson County Public Schools",    broker:"Willis Towers Watson",        state:"KY", status:"New",          submissionType:"New Business", products:["EPL","ELL","GL"],               assignedTo:"Unassigned",       team:"Team Beta",  submitted:"2024-03-20", needByDate:"2024-05-25", effective:"2024-07-01", expiry:"2025-07-01", estimatedPremium:67200,  enrollmentCount:9100,  appetiteScore:80, priority:"Low",    daysInQueue:3,  lastActivity:"Today"         },
  { id:"17", subId:"SUB-7845", member:"Hillsborough County Public Schools", broker:"Alliant Insurance Services",  state:"FL", status:"Bound",        submissionType:"Cross-Sell",   products:["EPL","ELL","GL","Auto","Cyber"], assignedTo:"Robert Chen",      team:"Team Beta",  submitted:"2024-02-10", needByDate:"2024-04-10", effective:"2024-06-01", expiry:"2025-06-01", estimatedPremium:196400, enrollmentCount:26800, appetiteScore:94, priority:"Low",    daysInQueue:0,  lastActivity:"1 week ago"    },
  { id:"18", subId:"SUB-7846", member:"Orange County Public Schools",       broker:"Arthur J. Gallagher & Co.",   state:"FL", status:"Declined",     submissionType:"New Business", products:["EPL","ML"],                     assignedTo:"Robert Chen",      team:"Team Beta",  submitted:"2024-02-25", needByDate:"2024-04-20", effective:"2024-07-01", expiry:"2025-07-01", estimatedPremium:0,      enrollmentCount:5200,  appetiteScore:42, priority:"Low",    daysInQueue:0,  lastActivity:"3 weeks ago"   },
];

const STATES   = [...new Set(ALL_SUBMISSIONS.map(s => s.state))].sort();
const BROKERS  = [...new Set(ALL_SUBMISSIONS.map(s => s.broker))].sort();
const UW_LIST  = [...new Set(ALL_SUBMISSIONS.map(s => s.assignedTo))].sort();
const PRODUCTS = ["EPL","ELL","GL","ML","Property","Auto","Crime","Cyber","SA"];
const STATUSES = ["New","In Review","Quoted","Bound","Declined","Pending Info"] as StatusType[];
const PRIORITIES = ["High","Medium","Low"] as const;

type SortKey = "daysInQueue" | "needByDate" | "effective";
type SortDir = "asc" | "desc";

const fmt = (n: number) => n === 0 ? "—" : "$" + n.toLocaleString("en-US", { maximumFractionDigits: 0 });

// ─── Filter chip ──────────────────────────────────────────────────────────────
function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1"
      style={{ background:`${N}10`, border:`1px solid ${N}30`, fontSize:"0.68rem", fontWeight:600, color:N }}>
      {label}
      <button onClick={onRemove} className="hover:opacity-60 transition-opacity ml-0.5">
        <X size={10}/>
      </button>
    </div>
  );
}

// ─── Filter panel helpers (module-level so React never re-mounts them) ─────────
interface Filters {
  statuses: StatusType[];
  products: string[];
  states: string[];
  brokers: string[];
  assignedTo: string[];
  priorities: string[];
  search: string;
  dateFrom: string;
  dateTo: string;
}

const EMPTY_FILTERS: Filters = {
  statuses: [], products: [], states: [], brokers: [],
  assignedTo: [], priorities: [], search: "", dateFrom: "", dateTo: "",
};

/** Accordion section — defined at module level so its useState survives parent re-renders */
function FilterSection({ title, count, children }: { title: string; count?: number; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom:`1px solid ${BDL}` }}>
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span style={{ fontSize:"0.65rem", fontWeight:800, color:TT, textTransform:"uppercase", letterSpacing:"0.09em" }}>{title}</span>
          {count != null && count > 0 && (
            <span style={{ background:N, color:"white", fontSize:"0.52rem", fontWeight:800, padding:"1px 5px", borderRadius:10 }}>{count}</span>
          )}
        </div>
        {open ? <ChevronUp size={13} color={TT}/> : <ChevronDown size={13} color={TT}/>}
      </button>
      {open && <div className="px-5 pb-4">{children}</div>}
    </div>
  );
}

/** Single checkbox row — module-level for the same stability reason */
function CheckRow({ label, checked, onToggle, dot, small }: {
  label: string; checked: boolean; onToggle: () => void; dot?: string; small?: boolean;
}) {
  return (
    <label className="flex items-center gap-2.5 py-1 cursor-pointer select-none" onClick={onToggle}>
      <div
        className="flex items-center justify-center shrink-0"
        style={{ width:15, height:15, background:checked?N:"white", border:`2px solid ${checked?N:BD}`, transition:"all 0.13s" }}>
        {checked && <Check size={9} color="white" strokeWidth={3}/>}
      </div>
      {dot && <span className="inline-block rounded-full shrink-0" style={{ width:7, height:7, background:dot }}/>}
      <span style={{ fontSize: small ? "0.70rem" : "0.76rem", color:checked?TD:TM, fontWeight:checked?600:400 }}>{label}</span>
    </label>
  );
}

// ─── Filter panel ─────────────────────────────────────────────────────────────
function FilterPanel({
  filters, onChange, onReset,
}: {
  filters: Filters;
  onChange: (f: Filters) => void;
  onReset: () => void;
}) {
  const toggle = <K extends keyof Filters>(key: K, val: string) => {
    const arr = filters[key] as string[];
    onChange({ ...filters, [key]: arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val] });
  };

  return (
    <div style={{ background:"white", border:`1px solid ${BDL}`, height:"fit-content" }}>
      {/* Panel header */}
      <div className="flex items-center justify-between px-5 py-3"
        style={{ background:TH, borderBottom:`1px solid ${BDL}` }}>
        <div className="flex items-center gap-2">
          <Filter size={13} color={N}/>
          <span style={{ fontSize:"0.65rem", fontWeight:800, color:N, textTransform:"uppercase", letterSpacing:"0.09em" }}>Filters</span>
        </div>
        <button onClick={onReset}
          className="flex items-center gap-1 hover:opacity-70 transition-opacity"
          style={{ fontSize:"0.65rem", color:"#B91C1C", fontWeight:700 }}>
          <RotateCcw size={10}/> Reset
        </button>
      </div>

      {/* Keyword search */}
      <div className="px-5 py-3" style={{ borderBottom:`1px solid ${BDL}` }}>
        <label style={{ display:"block", fontSize:"0.62rem", fontWeight:700, color:TT, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:6 }}>
          Keyword Search
        </label>
        <div className="relative">
          <Search size={13} color={TT} style={{ position:"absolute", left:9, top:"50%", transform:"translateY(-50%)" }}/>
          <input
            value={filters.search}
            onChange={e => onChange({ ...filters, search: e.target.value })}
            placeholder="Member, broker, sub ID…"
            style={{ width:"100%", paddingLeft:30, paddingRight:8, paddingTop:7, paddingBottom:7, border:`1px solid ${BD}`, fontSize:"0.76rem", fontFamily:font, outline:"none", color:TD }}
          />
          {filters.search && (
            <button onClick={() => onChange({ ...filters, search:"" })} style={{ position:"absolute", right:8, top:"50%", transform:"translateY(-50%)" }}>
              <X size={11} color={TT}/>
            </button>
          )}
        </div>
      </div>

      {/* Stage */}
      <FilterSection title="Stage" count={filters.statuses.length}>
        {STATUSES.map(s => {
          const cfg = STATUS_CFG[s];
          return <CheckRow key={s} label={s} checked={filters.statuses.includes(s)} onToggle={() => toggle("statuses", s)} dot={cfg.dot}/>;
        })}
      </FilterSection>

      {/* Priority */}
      <FilterSection title="Priority" count={filters.priorities.length}>
        {PRIORITIES.map(p => (
          <CheckRow key={p} label={p} checked={filters.priorities.includes(p)} onToggle={() => toggle("priorities", p)}
            dot={p==="High"?"#B91C1C":p==="Medium"?"#E07800":"#2E7D32"}/>
        ))}
      </FilterSection>

      {/* Assigned Underwriter */}
      <FilterSection title="Assigned Underwriter" count={filters.assignedTo.length}>
        {UW_LIST.map(u => (
          <CheckRow key={u} label={u} checked={filters.assignedTo.includes(u)} onToggle={() => toggle("assignedTo", u)}/>
        ))}
      </FilterSection>

      {/* Submission Date */}
      <FilterSection title="Submission Date" count={(filters.dateFrom?1:0)+(filters.dateTo?1:0)}>
        <div className="space-y-2">
          <div>
            <label style={{ display:"block", fontSize:"0.62rem", fontWeight:700, color:TT, marginBottom:4 }}>From</label>
            <input type="date" value={filters.dateFrom}
              onChange={e => onChange({ ...filters, dateFrom:e.target.value })}
              style={{ width:"100%", padding:"6px 8px", border:`1px solid ${BD}`, fontSize:"0.76rem", fontFamily:font, outline:"none", color:TD }}/>
          </div>
          <div>
            <label style={{ display:"block", fontSize:"0.62rem", fontWeight:700, color:TT, marginBottom:4 }}>To</label>
            <input type="date" value={filters.dateTo}
              onChange={e => onChange({ ...filters, dateTo:e.target.value })}
              style={{ width:"100%", padding:"6px 8px", border:`1px solid ${BD}`, fontSize:"0.76rem", fontFamily:font, outline:"none", color:TD }}/>
          </div>
        </div>
      </FilterSection>
    </div>
  );
}

// ─── KPI tile (with hover effects matching Dashboard) ────────────────────────
function KpiTile({ label, value, accent }: { label: string; value: string; accent: string }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      tabIndex={0}
      role="group"
      aria-label={`${label}: ${value}`}
      style={{
        background: hovered
          ? `linear-gradient(135deg, white 0%, ${accent}08 100%)`
          : "white",
        border: `1px solid ${hovered ? `${accent}40` : BDL}`,
        borderRadius: 10,
        padding: "14px 16px",
        boxShadow: hovered
          ? `0 2px 6px ${accent}14, 0 1px 2px rgba(15,23,42,0.04)`
          : "0 1px 2px rgba(15,23,42,0.04)",
        transform: hovered ? "translateY(-1px)" : "translateY(0)",
        transition: "background 0.2s ease, border-color 0.2s ease, box-shadow 0.25s ease, transform 0.2s ease",
        position: "relative",
        overflow: "hidden",
        outline: "none",
        cursor: "default",
      }}
    >
      {/* Accent strip — thickens + saturates on hover */}
      <span aria-hidden style={{
        position: "absolute", inset: "0 0 auto 0",
        height: hovered ? 4 : 3,
        background: hovered ? accent : `linear-gradient(90deg, ${accent}, ${accent}66)`,
        transition: "height 0.2s ease, background 0.2s ease",
      }}/>
      <p style={{
        fontSize: "0.6rem", fontWeight: 700, color: TT,
        textTransform: "uppercase", letterSpacing: "0.09em", lineHeight: 1.3,
      }}>
        {label}
      </p>
      <p style={{
        fontSize: "1.7rem", fontWeight: 800,
        color: hovered ? accent : TD,
        lineHeight: 1.1, marginTop: 6,
        fontVariantNumeric: "tabular-nums",
        transition: "color 0.2s ease",
      }}>
        {value}
      </p>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function Submissions() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const role: RoleId = user?.roleId ?? "sr-uw";
  const [filters, setFilters]   = useState<Filters>(EMPTY_FILTERS);
  const [showFilter, setShowFilter] = useState(false);
  const [sortKey, setSortKey]   = useState<SortKey>("daysInQueue");
  const [sortDir, setSortDir]   = useState<SortDir>("desc");
  const [viewTab, setViewTab]   = useState<"my" | "team" | "all">("all");
  const [page, setPage]         = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submissions, setSubmissions] = useState(ALL_SUBMISSIONS);
  const PER_PAGE = 5;

  // ── filtering ──────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let data = [...submissions];

    if (viewTab === "my")   data = data.filter(s => s.assignedTo === "John Michaels");
    if (viewTab === "team") data = data.filter(s => s.team === "Team Alpha");

    if (filters.search) {
      const q = filters.search.toLowerCase();
      data = data.filter(s =>
        s.member.toLowerCase().includes(q) ||
        s.broker.toLowerCase().includes(q) ||
        s.subId.toLowerCase().includes(q)
      );
    }
    if (filters.statuses.length)    data = data.filter(s => filters.statuses.includes(s.status));
    if (filters.priorities.length)  data = data.filter(s => filters.priorities.includes(s.priority));
    if (filters.products.length)    data = data.filter(s => filters.products.some(p => s.products.includes(p)));
    if (filters.states.length)      data = data.filter(s => filters.states.includes(s.state));
    if (filters.brokers.length)     data = data.filter(s => filters.brokers.includes(s.broker));
    if (filters.assignedTo.length)  data = data.filter(s => filters.assignedTo.includes(s.assignedTo));
    if (filters.dateFrom)           data = data.filter(s => s.submitted >= filters.dateFrom);
    if (filters.dateTo)             data = data.filter(s => s.submitted <= filters.dateTo);

    // sort
    data.sort((a, b) => {
      let va: number | string = 0, vb: number | string = 0;
      if (sortKey === "daysInQueue")      { va = a.daysInQueue; vb = b.daysInQueue; }
      else if (sortKey === "needByDate")        { va = a.needByDate; vb = b.needByDate; }
      else if (sortKey === "effective")         { va = a.effective; vb = b.effective; }
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return data;
  }, [filters, sortKey, sortDir, viewTab, submissions]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("desc"); }
    setPage(1);
  };

  const activeFilterCount = [
    filters.statuses, filters.products, filters.states,
    filters.brokers, filters.assignedTo, filters.priorities,
  ].reduce((a, arr) => a + arr.length, 0) + (filters.search ? 1 : 0)
    + (filters.dateFrom ? 1 : 0) + (filters.dateTo ? 1 : 0);

  const SortBtn = ({ col, label }: { col: SortKey; label: string }) => (
    <button onClick={() => handleSort(col)}
      className="flex items-center gap-1 hover:opacity-80 transition-opacity whitespace-nowrap"
      style={{ fontSize:"0.62rem", fontWeight:700, color:sortKey===col?G:TM, textTransform:"uppercase", letterSpacing:"0.08em", background:"none", border:"none", cursor:"pointer", fontFamily:font, padding:0 }}>
      {label}
      {sortKey === col
        ? sortDir === "asc"
          ? <ChevronUp size={11} color={G}/>
          : <ChevronDown size={11} color={G}/>
        : <ArrowUpDown size={11} color={TT}/>
      }
    </button>
  );

  const ColLabel = ({ children }: { children: React.ReactNode }) => (
    <div style={{ fontSize:"0.62rem", fontWeight:700, color:TM, textTransform:"uppercase", letterSpacing:"0.08em" }}>
      {children}
    </div>
  );

  // build active chips
  const chipsList: { label: string; remove: () => void }[] = [
    ...filters.statuses.map(s => ({ label:`Status: ${s}`, remove:()=>setFilters(f=>({...f,statuses:f.statuses.filter(x=>x!==s)})) })),
    ...filters.priorities.map(p => ({ label:`Priority: ${p}`, remove:()=>setFilters(f=>({...f,priorities:f.priorities.filter(x=>x!==p)})) })),
    ...filters.products.map(p => ({ label:`Product: ${p}`, remove:()=>setFilters(f=>({...f,products:f.products.filter(x=>x!==p)})) })),
    ...filters.states.map(s => ({ label:`State: ${s}`, remove:()=>setFilters(f=>({...f,states:f.states.filter(x=>x!==s)})) })),
    ...filters.brokers.map(b => ({ label:`Broker: ${b.split(" ")[0]}…`, remove:()=>setFilters(f=>({...f,brokers:f.brokers.filter(x=>x!==b)})) })),
    ...filters.assignedTo.map(u => ({ label:`UW: ${u.split(" ")[0]}`, remove:()=>setFilters(f=>({...f,assignedTo:f.assignedTo.filter(x=>x!==u)})) })),
    ...(filters.search ? [{ label:`"${filters.search}"`, remove:()=>setFilters(f=>({...f,search:""})) }] : []),
    ...(filters.dateFrom ? [{ label:`From: ${filters.dateFrom}`, remove:()=>setFilters(f=>({...f,dateFrom:""})) }] : []),
    ...(filters.dateTo   ? [{ label:`To: ${filters.dateTo}`,   remove:()=>setFilters(f=>({...f,dateTo:""})) }] : []),
  ];

  // KPI summary
  const kpis = useMemo(() => ({
    total:     ALL_SUBMISSIONS.length,
    inReview:  ALL_SUBMISSIONS.filter(s=>s.status==="In Review").length,
    quoted:    ALL_SUBMISSIONS.filter(s=>s.status==="Quoted").length,
    bound:     ALL_SUBMISSIONS.filter(s=>s.status==="Bound").length,
    totalPrem: ALL_SUBMISSIONS.filter(s=>s.status==="Bound").reduce((a,s)=>a+s.estimatedPremium,0),
  }), []);

  return (
    <AppShell activePage="submissions" role={role} onRoleChange={() => {}}>
      <div style={{ fontFamily:font, color:TD }}>

        {/* ── HERO + KPI STRIP (Dashboard structure, original Submissions content) ─── */}
        <div className="px-4 sm:px-6 lg:px-8 py-5 sm:py-7 space-y-5 sm:space-y-6"
          style={{ background:"#EEF1F6" }}>

          {/* Gradient hero */}
          <div className="relative overflow-hidden"
            style={{
              background:`linear-gradient(135deg, ${N} 0%, #0E3CE0 50%, #2547F4 100%)`,
              borderRadius:12, color:"white",
              boxShadow:`0 4px 16px ${N}25`,
            }}>
            <div aria-hidden style={{
              position:"absolute", top:-40, right:-40, width:180, height:180,
              background:`radial-gradient(circle, ${G}25 0%, transparent 65%)`,
              borderRadius:"50%",
            }}/>
            <div className="relative px-5 sm:px-7 py-5 sm:py-6 flex items-start justify-between gap-3 flex-wrap">
              <div>
                <h1 style={{ fontSize:"1.35rem", fontWeight:800, color:"white", lineHeight:1.2 }}>Submissions</h1>
                <p style={{ fontSize:"0.80rem", color:"rgba(255,255,255,0.6)", marginTop:4 }}>
                  Underwriting Pipeline <span style={{ opacity:0.5, margin:"0 6px" }}>·</span> {kpis.total} Total Submissions
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0 flex-wrap">
                <GhostButton>
                  <Download size={13}/> <span className="hidden sm:inline">Export</span>
                </GhostButton>
                <PrimaryWhiteButton onClick={() => navigate("/submissions/new")}>
                  <Plus size={14}/>
                  <span className="hidden sm:inline">New Submission</span>
                  <span className="sm:hidden">New</span>
                </PrimaryWhiteButton>
              </div>
            </div>
          </div>

          {/* KPI tiles (Dashboard structure + hover effects) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {[
              { label:"Total Submissions",   value:String(kpis.total),    accent:N         },
              { label:"In Review",            value:String(kpis.inReview), accent:"#B45309" },
              { label:"Quoted",               value:String(kpis.quoted),   accent:"#005B99" },
              { label:"Bound (YTD)",         value:String(kpis.bound),    accent:"#15803D" },
              { label:"Bound Premium (YTD)", value:fmt(kpis.totalPrem),    accent:G         },
            ].map((k, i) => (
              <KpiTile key={i} label={k.label} value={k.value} accent={k.accent} />
            ))}
          </div>

          {/* ── SUBMISSIONS CARD (Dashboard-style chrome) ──────────────────── */}
          <div style={{
            background:"white",
            border:`1px solid ${BDL}`,
            borderTop:`3px solid ${N}`,
            borderRadius:8,
            overflow:"hidden",
            boxShadow:"0 1px 2px rgba(15,23,42,0.04)",
          }}>

        {/* ── TOOLBAR ─────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-4 sm:px-8 py-3 gap-3 flex-wrap"
          style={{ background:"white", borderBottom:`1px solid ${BDL}` }}>
          {/* View tabs */}
          <div className="flex items-center">
            {(["my","team","all"] as const).map(tab => (
              <button key={tab}
                onClick={() => { setViewTab(tab); setPage(1); }}
                className="px-3 sm:px-4 py-2 transition-all"
                style={{
                  fontSize:"0.78rem", fontWeight:viewTab===tab?700:400,
                  color:viewTab===tab?N:TM,
                  borderBottom:`2px solid ${viewTab===tab?G:"transparent"}`,
                  marginBottom:-1,
                }}>
                {tab==="my"?"My Queue":tab==="team"?"My Team":"All"}
              </button>
            ))}
          </div>

          {/* Search bar — center of toolbar */}
          <div className="relative flex-1" style={{ maxWidth: 380, minWidth: 180 }}>
            <Search size={14} color={TT} style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }}/>
            <input
              value={filters.search}
              onChange={e => { setFilters(f => ({ ...f, search: e.target.value })); setPage(1); }}
              placeholder="Search member, broker, sub ID…"
              style={{
                width:"100%",
                paddingLeft: 32,
                paddingRight: filters.search ? 30 : 10,
                paddingTop: 7,
                paddingBottom: 7,
                border: `1px solid ${filters.search ? N : BD}`,
                background: filters.search ? `${N}06` : "white",
                fontSize:"0.78rem",
                fontFamily: font,
                outline:"none",
                color: TD,
                transition:"border-color 0.15s",
              }}
            />
            {filters.search && (
              <button
                onClick={() => { setFilters(f => ({ ...f, search:"" })); setPage(1); }}
                style={{ position:"absolute", right:8, top:"50%", transform:"translateY(-50%)" }}
                title="Clear search"
              >
                <X size={12} color={TT}/>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span style={{ fontSize:"0.72rem", color:TT }} className="hidden sm:inline">
              <span style={{ fontWeight:700, color:N }}>{filtered.length}</span> result{filtered.length!==1?"s":""}
              {activeFilterCount > 0 && ` (${activeFilterCount} filter${activeFilterCount>1?"s":""})`}
            </span>
            <button
              onClick={() => setShowFilter(v => !v)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2"
              onMouseEnter={(e) => { e.currentTarget.style.background = showFilter ? `${N}14` : "#FAFBFD"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = showFilter ? `${N}0C` : "white"; }}
              style={{
                border:`1px solid ${showFilter?N:BD}`,
                background:showFilter?`${N}0C`:"white",
                borderRadius:6,
                fontSize:"0.78rem", fontWeight:600,
                color:showFilter?N:TM,
                cursor:"pointer",
                transition:"background 0.2s ease",
              }}>
              <SlidersHorizontal size={13}/>
              Filters
              {activeFilterCount>0 && (
                <span style={{ background:N, color:"white", fontSize:"0.55rem", fontWeight:800, borderRadius:10, padding:"1px 6px" }}>
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Active filter chips */}
        {chipsList.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap px-4 sm:px-8 py-2.5"
            style={{ background:"#F8FAFC", borderBottom:`1px solid ${BDL}` }}>
            <span style={{ fontSize:"0.62rem", fontWeight:700, color:TT, textTransform:"uppercase", letterSpacing:"0.08em" }}>
              Active:
            </span>
            {chipsList.map((c,i) => <Chip key={i} label={c.label} onRemove={c.remove}/>)}
            <button onClick={() => setFilters(EMPTY_FILTERS)}
              className="hover:underline ml-1"
              style={{ fontSize:"0.68rem", color:"#B91C1C", fontWeight:700 }}>
              Clear all
            </button>
          </div>
        )}

        {/* ── BODY: filter panel + table ─────────────────────────────────── */}
        <div className="flex items-start">

          {/* Mobile filter backdrop */}
          {showFilter && (
            <div
              className="fixed inset-0 z-30 lg:hidden"
              style={{ background:"rgba(15,23,42,0.4)" }}
              onClick={() => setShowFilter(false)}
            />
          )}

          {/* Filter panel — mobile: fixed drawer, desktop: sticky inline */}
          {showFilter && (
            <div className="fixed top-0 left-0 h-full z-40 overflow-y-auto bg-white shadow-2xl lg:shadow-none lg:relative lg:top-auto lg:left-auto lg:h-auto lg:z-auto"
              style={{ width:272, borderRight:`1px solid ${BDL}`, maxHeight:"100vh" }}>
              {/* Mobile header */}
              <div className="flex items-center justify-between px-5 py-3 lg:hidden"
                style={{ background:N, borderBottom:"1px solid rgba(255,255,255,0.15)", minHeight:56 }}>
                <span style={{ fontSize:"0.72rem", fontWeight:700, color:"white", textTransform:"uppercase", letterSpacing:"0.08em" }}>Filters</span>
                <button
                  onClick={() => setShowFilter(false)}
                  className="flex items-center justify-center"
                  style={{ width:28, height:28, background:"rgba(255,255,255,0.15)", border:"1px solid rgba(255,255,255,0.25)" }}>
                  <X size={14} color="white" />
                </button>
              </div>
              <FilterPanel
                filters={filters}
                onChange={f => { setFilters(f); setPage(1); }}
                onReset={() => { setFilters(EMPTY_FILTERS); setPage(1); }}
              />
            </div>
          )}

          {/* Table */}
          <div style={{ flex:1, minWidth:0, overflowX:"auto" }}>

            {/* Column headers */}
            <div style={{ background:"#FAFBFD", borderBottom:`1px solid ${BDL}`, position:"sticky", top:0, zIndex:5 }}>
              <div className="grid px-6 py-3"
                style={{ gridTemplateColumns:`2.3fr 0.9fr 1.1fr 0.95fr 0.95fr 0.95fr 0.65fr 0.55fr 0.75fr 0.8fr`, gap:"0 18px", alignItems:"center" }}>
                <ColLabel>Member / Institution</ColLabel>
                <ColLabel>Type</ColLabel>
                <ColLabel>Products</ColLabel>
                <ColLabel>Stage</ColLabel>
                <ColLabel>Premium</ColLabel>
                <ColLabel>Underwriter</ColLabel>
                <ColLabel>Appetite</ColLabel>
                <SortBtn col="daysInQueue"      label="Age"/>
                <SortBtn col="needByDate"       label="Need By"/>
                <SortBtn col="effective"        label="Effective"/>
              </div>
            </div>

            {/* Rows */}
            {paginated.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <div style={{ width:56, height:56, background:TH, border:`1px solid ${BDL}`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <Search size={24} color={BD}/>
                </div>
                <p style={{ fontSize:"0.90rem", fontWeight:700, color:TM }}>No submissions found</p>
                <p style={{ fontSize:"0.78rem", color:TT }}>Try adjusting your filters or search term</p>
                <button onClick={() => setFilters(EMPTY_FILTERS)}
                  style={{ fontSize:"0.75rem", fontWeight:700, color:N }}
                  className="hover:underline">
                  Clear all filters
                </button>
              </div>
            ) : paginated.map((sub, idx) => {
              const sc  = STATUS_CFG[sub.status];
              const isLast = idx === paginated.length - 1;
              const priorityColor =
                sub.priority === "High"   ? "#DC2626" :
                sub.priority === "Medium" ? "#E07800" : null;
              const MAX_PRODUCTS = 3;
              const visibleProducts = sub.products.slice(0, MAX_PRODUCTS);
              const overflowCount  = sub.products.length - MAX_PRODUCTS;
              return (
                <div
                  key={sub.id}
                  onClick={() => navigate(`/submission/${sub.subId}`)}
                  className="grid px-6 py-3.5 cursor-pointer transition-colors hover:bg-slate-50 group"
                  style={{
                    gridTemplateColumns:`2.3fr 0.9fr 1.1fr 0.95fr 0.95fr 0.95fr 0.65fr 0.55fr 0.75fr 0.8fr`,
                    gap:"0 18px",
                    alignItems:"center",
                    borderBottom: isLast ? "none" : `1px solid #EEF1F5`,
                    background:"white",
                    position:"relative",
                  }}
                >
                  {/* Priority marker — subtle left rail, only when High/Medium */}
                  {priorityColor && (
                    <span
                      aria-hidden
                      style={{
                        position:"absolute", left:0, top:10, bottom:10,
                        width:2, background:priorityColor, borderRadius:1,
                      }}
                    />
                  )}

                  {/* Member */}
                  <div className="min-w-0">
                    <p style={{
                      fontSize:"0.86rem", fontWeight:600, color:TD,
                      whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis",
                      lineHeight:1.3,
                    }} className="group-hover:underline group-hover:decoration-blue-600">
                      {sub.member}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1 min-w-0">
                      <span style={{
                        fontSize:"0.66rem", fontWeight:600, color:N,
                        fontFamily:"ui-monospace, SFMono-Regular, Menlo, monospace",
                        letterSpacing:"0.01em",
                      }}>
                        {sub.subId}
                      </span>
                      <span style={{ width:2, height:2, borderRadius:9999, background:BD }}/>
                      <span style={{ fontSize:"0.68rem", color:TT, fontWeight:500 }}>{sub.state}</span>
                      <span style={{ width:2, height:2, borderRadius:9999, background:BD }}/>
                      <span style={{
                        fontSize:"0.68rem", color:TT, fontWeight:400,
                        whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis",
                      }}>
                        {sub.broker}
                      </span>
                    </div>
                  </div>

                  {/* Submission Type — plain colored text, no badge */}
                  <div>
                    <span style={{
                      fontSize:"0.72rem", fontWeight:600,
                      color: sub.submissionType === "New Business" ? N : "#7B2FBE",
                      whiteSpace:"nowrap",
                    }}>
                      {sub.submissionType}
                    </span>
                  </div>

                  {/* Products — uniform neutral chips, no icons, capped at 3 + overflow */}
                  <div className="flex items-center gap-1">
                    {visibleProducts.map(p => (
                      <span key={p}
                        style={{
                          background:"#F1F4F8", color:TM,
                          fontSize:"0.62rem", fontWeight:700,
                          padding:"3px 6px", borderRadius:3,
                          letterSpacing:"0.02em",
                        }}>
                        {p}
                      </span>
                    ))}
                    {overflowCount > 0 && (
                      <span style={{
                        fontSize:"0.62rem", fontWeight:600, color:TT,
                        padding:"3px 2px",
                      }}>
                        +{overflowCount}
                      </span>
                    )}
                  </div>

                  {/* Stage — soft pill, no border */}
                  <div>
                    <span className="inline-flex items-center gap-1.5"
                      style={{
                        background:sc.bg, padding:"3px 8px", borderRadius:3,
                      }}>
                      <span className="rounded-full" style={{ width:6, height:6, background:sc.dot }}/>
                      <span style={{ fontSize:"0.68rem", fontWeight:600, color:sc.text, whiteSpace:"nowrap" }}>
                        {sub.status}
                      </span>
                    </span>
                  </div>

                  {/* Premium */}
                  <div>
                    <p style={{
                      fontSize:"0.86rem", fontWeight:700,
                      color: sub.estimatedPremium > 0 ? TD : TT,
                      lineHeight:1.2,
                    }}>
                      {fmt(sub.estimatedPremium)}
                    </p>
                    <p style={{ fontSize:"0.62rem", color:TT, marginTop:2 }}>
                      {sub.enrollmentCount.toLocaleString()} enrolled
                    </p>
                  </div>

                  {/* Underwriter — soft round avatar */}
                  <div>
                    {sub.assignedTo === "Unassigned" ? (
                      <span style={{ fontSize:"0.72rem", color:"#B45309", fontWeight:600 }}>Unassigned</span>
                    ) : (
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="flex items-center justify-center shrink-0 rounded-full"
                          style={{
                            width:22, height:22,
                            background:`${N}10`, color:N,
                            fontSize:"0.6rem", fontWeight:700,
                          }}>
                          {sub.assignedTo.split(" ").map(n=>n[0]).join("")}
                        </div>
                        <span style={{
                          fontSize:"0.74rem", color:TD, fontWeight:500,
                          whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis",
                        }}>
                          {sub.assignedTo.split(" ")[0]}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Appetite */}
                  <div>
                    <span style={{
                      fontSize:"0.82rem", fontWeight:700,
                      color: sub.appetiteScore >= 80 ? "#15803D" :
                             sub.appetiteScore >= 60 ? "#B45309" : "#B91C1C",
                    }}>
                      {sub.appetiteScore}%
                    </span>
                  </div>

                  {/* Days in queue */}
                  <div>
                    {sub.status === "Bound" || sub.status === "Declined" ? (
                      <span style={{ fontSize:"0.74rem", color:TT }}>—</span>
                    ) : (
                      <span style={{
                        fontSize:"0.78rem", fontWeight:600,
                        color: sub.daysInQueue > 20 ? "#B91C1C" :
                               sub.daysInQueue > 10 ? "#B45309" : TD,
                      }}>
                        {sub.daysInQueue}d
                      </span>
                    )}
                  </div>

                  {/* Need By Date */}
                  <div>
                    <span style={{ fontSize:"0.74rem", color:TM, whiteSpace:"nowrap", fontWeight:500 }}>
                      {sub.needByDate ? new Date(sub.needByDate).toLocaleDateString("en-US",{month:"short",day:"numeric"}) : "—"}
                    </span>
                  </div>

                  {/* Effective Date */}
                  <div className="flex items-center justify-between gap-1">
                    <span style={{ fontSize:"0.74rem", color:TM, whiteSpace:"nowrap", fontWeight:500 }}>
                      {sub.effective ? new Date(sub.effective).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"2-digit"}) : "—"}
                    </span>
                    <ChevronRight size={14} color={BD} className="shrink-0 transition-colors group-hover:text-blue-600"/>
                  </div>
                </div>
              );
            })}

            {/* Pagination */}
            {paginated.length > 0 && (
              <div className="flex items-center justify-between px-6 py-4"
                style={{ background: "white", borderTop: `2px solid ${BDL}` }}>

                {/* Left: range info */}
                <div className="flex items-center gap-3">
                  <span style={{ fontSize: "0.74rem", color: TT }}>
                    Showing{" "}
                    <span style={{ fontWeight: 700, color: TD }}>{(page - 1) * PER_PAGE + 1}</span>
                    {" – "}
                    <span style={{ fontWeight: 700, color: TD }}>{Math.min(page * PER_PAGE, filtered.length)}</span>
                    {" of "}
                    <span style={{ fontWeight: 700, color: N }}>{filtered.length}</span>
                    {" submission"}{filtered.length !== 1 ? "s" : ""}
                  </span>
                  <span style={{ width: 1, height: 14, background: BDL, display: "inline-block" }} />
                  <span style={{ fontSize: "0.70rem", color: TT }}>
                    Page <span style={{ fontWeight: 700, color: TD }}>{page}</span> of{" "}
                    <span style={{ fontWeight: 700, color: TD }}>{totalPages}</span>
                  </span>
                </div>

                {/* Right: prev / page numbers / next */}
                <div className="flex items-center gap-1">

                  {/* Previous */}
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 hover:bg-slate-50 disabled:opacity-35 disabled:cursor-not-allowed"
                    style={{
                      border: `1px solid ${page === 1 ? BDL : BD}`,
                      background: "white", borderRadius: 6,
                      fontSize: "0.78rem", fontWeight: 600, color: page === 1 ? TT : TM,
                      fontFamily: font, cursor: page === 1 ? "not-allowed" : "pointer",
                      transition: "background 0.2s ease",
                    }}>
                    <ChevronLeft size={13} /> Previous
                  </button>

                  {/* Page numbers with ellipsis */}
                  {(() => {
                    const pages: (number | "…")[] = [];
                    if (totalPages <= 7) {
                      for (let i = 1; i <= totalPages; i++) pages.push(i);
                    } else {
                      pages.push(1);
                      if (page > 3)  pages.push("…");
                      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
                      if (page < totalPages - 2) pages.push("…");
                      pages.push(totalPages);
                    }
                    return pages.map((p, i) =>
                      p === "…" ? (
                        <span key={`ellipsis-${i}`}
                          style={{ width: 32, textAlign: "center", fontSize: "0.76rem", color: TT, lineHeight: "32px" }}>
                          …
                        </span>
                      ) : (
                        <button
                          key={p}
                          onClick={() => setPage(p as number)}
                          style={{
                            width: 34, height: 34,
                            border: `1.5px solid ${p === page ? N : BDL}`,
                            background: p === page ? N : "white",
                            color: p === page ? "white" : TM,
                            borderRadius: 6,
                            fontSize: "0.78rem",
                            fontWeight: p === page ? 800 : 400,
                            cursor: "pointer",
                            fontFamily: font,
                            transition: "all 0.13s",
                            boxShadow: p === page ? `0 2px 8px ${N}35` : "none",
                          }}
                          className={p !== page ? "hover:bg-slate-50" : ""}
                        >
                          {p}
                        </button>
                      )
                    );
                  })()}

                  {/* Next */}
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage(p => p + 1)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 hover:bg-slate-50 disabled:opacity-35 disabled:cursor-not-allowed"
                    style={{
                      border: `1px solid ${page === totalPages ? BDL : N}`,
                      background: page === totalPages ? "white" : `${N}08`,
                      borderRadius: 6,
                      fontSize: "0.78rem", fontWeight: 600,
                      color: page === totalPages ? TT : N,
                      fontFamily: font,
                      cursor: page === totalPages ? "not-allowed" : "pointer",
                      transition: "background 0.2s ease",
                    }}>
                    Next <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
          </div>{/* ── close SUBMISSIONS card ─────────────────────────────── */}
        </div>{/* ── close padded container ──────────────────────────────── */}
      </div>
      <CreateSubmissionModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={(data) => {
          const nextId = String(submissions.length + 1);
          const nextSubId = `SUB-${7847 + submissions.length - 18}`;
          const today = new Date().toISOString().split("T")[0];
          const newSub: Submission = {
            id: nextId,
            subId: nextSubId,
            member: data.accountName,
            broker: "Unassigned",
            state: "—",
            status: "New",
            submissionType: "New Business",
            products: [],
            assignedTo: "Unassigned",
            team: "Team Alpha",
            submitted: today,
            needByDate: data.effectiveDate,
            effective: data.effectiveDate,
            expiry: data.expirationDate,
            estimatedPremium: 0,
            enrollmentCount: 0,
            appetiteScore: 0,
            priority: "Medium",
            daysInQueue: 0,
            lastActivity: "Just now",
          };
          setSubmissions(prev => [newSub, ...prev]);
          setShowCreateModal(false);
        }}
      />
    </AppShell>
  );
}