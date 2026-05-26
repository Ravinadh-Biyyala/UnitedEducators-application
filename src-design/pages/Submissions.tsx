import {
  Search, SlidersHorizontal, X, ChevronDown, ChevronUp,
  ArrowUpDown,
  FileText, Clock, CheckCircle2, XCircle, AlertCircle,
  ChevronRight, ChevronLeft, Filter, RotateCcw, Download, Plus,
  Check, Users, User, GripVertical, FileEdit,
} from "lucide-react";
import { useState, useMemo, useRef, useLayoutEffect, Fragment } from "react";
import { useNavigate } from "react-router-dom";
import {
  AppShell,
} from "../components/AppShell";
import type { RoleId } from "../components/AppShell";
import { useAuth } from "../context/AuthContext";
import { CreateSubmissionModal } from "../components/CreateSubmissionModal";
import { PrimaryWhiteButton, GhostButton } from "../components/DashboardCards";
import { typo } from "../styles/typography";
import { PageRegister } from "../components/companion/PageRegister";
import { newId, now } from "../components/companion/CompanionContext";
import type { Suggestion, CompanionMsg } from "../components/companion/CompanionContext";
import { useSubmissionsList } from "../context/SubmissionsListContext";
import type { Submission, StatusType, SubmissionKindCol } from "../context/SubmissionsListContext";

// ─── Tokens ──────────────────────────────────────────────────────────────────
const N   = "#0123D4";
const G   = "#C9A227";
const BD  = "#C4CDD8";
const BDL = "#DCE3EC";
const TH  = "#F0F3F8";
const TT  = "#5F7080";
const TM  = "#4A5D6E";
const TD  = "#1A2530";
const BG  = "#EEF1F6";
const font = "'Source Sans 3', system-ui, sans-serif";

// ─── Static data ──────────────────────────────────────────────────────────────
// Submission, StatusType and SubmissionKindCol are imported from SubmissionsListContext
// so other pages (e.g. Inbox auto-create) can write into the same store.

const STATUS_CFG: Record<StatusType, { bg: string; text: string; dot: string; border: string; icon: React.ReactNode }> = {
  "New":          { bg:"#F0F3F8", text:TM,        dot:"#7A8FA3", border:BDL,       icon:<FileText size={11}/> },
  "In Review":    { bg:"#FFF8E6", text:"#8A5C00", dot:"#C9A227", border:"#F0D88A", icon:<Clock size={11}/> },
  "Quoted":       { bg:"#E8F0F9", text:"#00427A", dot:"#005B99", border:"#9ABCD6", icon:<FileText size={11}/> },
  "Bound":        { bg:"#E8F5EC", text:"#1A5C30", dot:"#2E7D32", border:"#93C8A0", icon:<CheckCircle2 size={11}/> },
  "Declined":     { bg:"#FBEAEA", text:"#7A1F1F", dot:"#B91C1C", border:"#E8A8A8", icon:<XCircle size={11}/> },
  "Pending Info": { bg:"#FFF3E0", text:"#7A4200", dot:"#E07800", border:"#F5C87A", icon:<AlertCircle size={11}/> },
  // Auto-created submissions that flunked intake validation land here. Amber
  // hue signals "needs review" without the harshness of a Declined / Pending tone.
  "Draft":        { bg:"#FEF3C7", text:"#92400E", dot:"#B45309", border:"#F5C87A", icon:<FileEdit size={11}/> },
};

const KINDS: SubmissionKindCol[] = ["Individual", "Group"];

const PRODUCTS = ["EPL","ELL","GL","ML","Property","Auto","Crime","Cyber","SA"];
// Note: UW_LIST is derived from the live submissions inside the component
// (so auto-created entries from the Inbox show up in the underwriter filter).
// `Draft` is included so users can filter to auto-created submissions awaiting review.
const STATUSES = ["New","Draft","In Review","Quoted","Bound","Declined","Pending Info"] as StatusType[];

type SortKey = "needByDate" | "effective" | "premium";
type SortDir = "asc" | "desc";

// ─── Grid column config ───────────────────────────────────────────────────────
// Single source of truth for the data grid's column metadata. The header row
// and every data row both iterate the user-mutable `colOrder` state (looking
// each key up in `COLUMNS_BY_KEY`) and derive their `gridTemplateColumns`
// from it. To change the DEFAULT order or width, edit this array; the user's
// drag-reordering then mutates only the `colOrder` state at runtime.
type ColKey =
  | "checkbox" | "member" | "needByDate" | "effective"
  | "submissionType" | "products" | "stage" | "underwriter"
  | "premium" | "appetite";

interface ColumnConfig {
  key: ColKey;
  label: string;
  /** CSS grid track size (e.g. "44px", "minmax(140px, 1.05fr)"). */
  width: string;
  /** When set, the header cell renders a sortable button driven by this key. */
  sortKey?: SortKey;
}

const COLUMNS: ColumnConfig[] = [
  { key: "checkbox",       label: "",                     width: "44px" },
  { key: "member",         label: "Member / Institution", width: "minmax(260px, 2.6fr)" },
  { key: "needByDate",     label: "Need By",              width: "minmax(150px, 1.1fr)",  sortKey: "needByDate" },
  { key: "effective",      label: "Effective",            width: "minmax(130px, 0.95fr)", sortKey: "effective"  },
  { key: "submissionType", label: "Type",                 width: "minmax(110px, 0.9fr)"  },
  { key: "products",       label: "Products",             width: "minmax(135px, 1.05fr)" },
  { key: "stage",          label: "Stage",                width: "minmax(115px, 0.95fr)" },
  { key: "underwriter",    label: "Underwriter",          width: "minmax(125px, 1fr)"    },
  { key: "premium",        label: "Premium",              width: "minmax(110px, 0.85fr)", sortKey: "premium" },
  { key: "appetite",       label: "Appetite",             width: "minmax(95px, 0.7fr)"   },
];

// O(1) lookup keyed by ColKey, derived once at module scope.
const COLUMNS_BY_KEY: Record<ColKey, ColumnConfig> =
  Object.fromEntries(COLUMNS.map(c => [c.key, c])) as Record<ColKey, ColumnConfig>;

// Default column order — first render uses this; user drag-reorder mutates the
// `colOrder` state owned by the Submissions component.
const INITIAL_ORDER: ColKey[] = COLUMNS.map(c => c.key);

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
  kinds: SubmissionKindCol[];
  products: string[];
  states: string[];
  brokers: string[];
  assignedTo: string[];
  search: string;
  dateFrom: string;
  dateTo: string;
  premiumFrom: string;
  premiumTo: string;
}

const EMPTY_FILTERS: Filters = {
  statuses: [], kinds: [], products: [], states: [], brokers: [],
  assignedTo: [], search: "", dateFrom: "", dateTo: "",
  premiumFrom: "", premiumTo: "",
};

/** Accordion section — defined at module level so its useState survives parent re-renders */
function FilterSection({ title, count, children, isOpen, onToggle }: {
  title: string; count?: number; children: React.ReactNode;
  isOpen: boolean; onToggle: () => void;
}) {
  return (
    <div style={{ borderBottom:`1px solid ${BDL}` }}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span style={{ fontSize:"0.65rem", fontWeight:800, color:TT, textTransform:"uppercase", letterSpacing:"0.09em" }}>{title}</span>
          {count != null && count > 0 && (
            <span style={{ background:N, color:"white", fontSize:"0.52rem", fontWeight:800, padding:"1px 5px", borderRadius:10 }}>{count}</span>
          )}
        </div>
        {isOpen ? <ChevronUp size={13} color={TT}/> : <ChevronDown size={13} color={TT}/>}
      </button>
      {isOpen && <div className="px-5 pb-4">{children}</div>}
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
type FilterSectionKey = "stage" | "kind" | "underwriter" | "date" | "premium";

function FilterPanel({
  filters, onChange, onReset, uwList,
}: {
  filters: Filters;
  onChange: (f: Filters) => void;
  onReset: () => void;
  uwList: string[];
}) {
  // Accordion: only one section open at a time. Keeps the dropdown a predictable
  // height so expanded content never overflows or visually overlaps neighbouring
  // sections / the popover boundary / the chat companion button.
  const [openSection, setOpenSection] = useState<FilterSectionKey | null>("stage");
  const toggleSection = (key: FilterSectionKey) =>
    setOpenSection(prev => prev === key ? null : key);

  const toggle = <K extends keyof Filters>(key: K, val: string) => {
    const arr = filters[key] as string[];
    onChange({ ...filters, [key]: arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val] });
  };

  return (
    <div style={{ background:"white", border:`1px solid ${BDL}`, borderRadius:8, height:"fit-content", overflow:"hidden" }}>
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

      {/* Keyword Search removed from the dropdown — the toolbar's main search
          box covers the same field, so this was duplicate. */}

      {/* Stage */}
      <FilterSection title="Stage" count={filters.statuses.length}
        isOpen={openSection === "stage"} onToggle={() => toggleSection("stage")}>
        {STATUSES.map(s => {
          const cfg = STATUS_CFG[s];
          return <CheckRow key={s} label={s} checked={filters.statuses.includes(s)} onToggle={() => toggle("statuses", s)} dot={cfg.dot}/>;
        })}
      </FilterSection>

      {/* Kind — Individual vs Group */}
      <FilterSection title="Kind" count={filters.kinds.length}
        isOpen={openSection === "kind"} onToggle={() => toggleSection("kind")}>
        {KINDS.map(k => (
          <CheckRow
            key={k}
            label={k === "Group" ? "Group / Multi-Member" : "Individual"}
            checked={filters.kinds.includes(k)}
            onToggle={() => toggle("kinds", k)}
            dot={k === "Group" ? "#7B2FBE" : "#7A8FA3"}
          />
        ))}
      </FilterSection>

      {/* Assigned Underwriter */}
      <FilterSection title="Assigned Underwriter" count={filters.assignedTo.length}
        isOpen={openSection === "underwriter"} onToggle={() => toggleSection("underwriter")}>
        {uwList.map(u => (
          <CheckRow key={u} label={u} checked={filters.assignedTo.includes(u)} onToggle={() => toggle("assignedTo", u)}/>
        ))}
      </FilterSection>

      {/* Submission Date */}
      <FilterSection title="Submission Date" count={(filters.dateFrom?1:0)+(filters.dateTo?1:0)}
        isOpen={openSection === "date"} onToggle={() => toggleSection("date")}>
        <div className="space-y-2">
          <div>
            <label style={{ display:"block", fontSize:"0.62rem", fontWeight:700, color:TT, marginBottom:4 }}>From</label>
            <input type="date" value={filters.dateFrom}
              onChange={e => onChange({ ...filters, dateFrom:e.target.value })}
              style={{ width:"100%", padding:"6px 8px", border:`1px solid ${BD}`, borderRadius:6, fontSize:"0.76rem", fontFamily:font, outline:"none", color:TD }}/>
          </div>
          <div>
            <label style={{ display:"block", fontSize:"0.62rem", fontWeight:700, color:TT, marginBottom:4 }}>To</label>
            <input type="date" value={filters.dateTo}
              onChange={e => onChange({ ...filters, dateTo:e.target.value })}
              style={{ width:"100%", padding:"6px 8px", border:`1px solid ${BD}`, borderRadius:6, fontSize:"0.76rem", fontFamily:font, outline:"none", color:TD }}/>
          </div>
        </div>
      </FilterSection>

      {/* Premium */}
      <FilterSection title="Premium" count={(filters.premiumFrom?1:0)+(filters.premiumTo?1:0)}
        isOpen={openSection === "premium"} onToggle={() => toggleSection("premium")}>
        <div className="space-y-2">
          <div>
            <label style={{ display:"block", fontSize:"0.62rem", fontWeight:700, color:TT, marginBottom:4 }}>From ($)</label>
            <input type="number" min={0} step={1000} inputMode="numeric"
              value={filters.premiumFrom}
              onChange={e => onChange({ ...filters, premiumFrom:e.target.value })}
              placeholder="0"
              style={{ width:"100%", padding:"6px 8px", border:`1px solid ${BD}`, borderRadius:6, fontSize:"0.76rem", fontFamily:font, outline:"none", color:TD }}/>
          </div>
          <div>
            <label style={{ display:"block", fontSize:"0.62rem", fontWeight:700, color:TT, marginBottom:4 }}>To ($)</label>
            <input type="number" min={0} step={1000} inputMode="numeric"
              value={filters.premiumTo}
              onChange={e => onChange({ ...filters, premiumTo:e.target.value })}
              placeholder="Any"
              style={{ width:"100%", padding:"6px 8px", border:`1px solid ${BD}`, borderRadius:6, fontSize:"0.76rem", fontFamily:font, outline:"none", color:TD }}/>
          </div>
        </div>
      </FilterSection>
    </div>
  );
}

// ─── KPI tile (matches Renewals WindowBucket style) ──────────────────────────
function KpiTile({ label, value, sub, accent, selected = false, onClick }: {
  label: string; value: string; sub?: string; accent: string;
  selected?: boolean; onClick?: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const clickable = !!onClick;
  const active    = selected;
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      disabled={!clickable}
      aria-pressed={clickable ? active : undefined}
      aria-label={`${label}: ${value}${sub ? " — " + sub : ""}${clickable ? (active ? " (filter active)" : " (filter)") : ""}`}
      style={{
        textAlign: "left", width: "100%", fontFamily: "inherit",
        // Active state keeps a plain white background — selection is conveyed
        // entirely by the colored border + top accent + ring shadow.
        background: "white",
        border: `1.5px solid ${active ? accent : hovered && clickable ? `${accent}40` : BDL}`,
        borderRadius: 10,
        padding: "14px 16px",
        boxShadow: active
          ? `0 0 0 1px ${accent}, 0 2px 8px ${accent}22, 0 1px 2px rgba(15,23,42,0.04)`
          : hovered && clickable
          ? `0 2px 6px ${accent}14, 0 1px 2px rgba(15,23,42,0.04)`
          : "0 1px 2px rgba(15,23,42,0.04)",
        transform: hovered && clickable && !active ? "translateY(-1px)" : "translateY(0)",
        transition: "background 0.2s ease, border-color 0.2s ease, box-shadow 0.25s ease, transform 0.2s ease",
        position: "relative", overflow: "hidden", outline: "none",
        cursor: clickable ? "pointer" : "default",
      }}
    >
      <span aria-hidden style={{
        position: "absolute", inset: "0 0 auto 0",
        height: active ? 4 : hovered && clickable ? 4 : 3,
        background: active ? accent : hovered && clickable ? accent : `linear-gradient(90deg, ${accent}, ${accent}66)`,
        transition: "height 0.2s ease, background 0.2s ease",
      }}/>
      <p style={{
        fontSize: "0.6rem", fontWeight: 700,
        color: active ? accent : TT,
        textTransform: "uppercase", letterSpacing: "0.09em", lineHeight: 1.3,
      }}>{label}</p>
      <p style={{
        fontSize: "1.7rem", fontWeight: 800,
        color: active ? accent : hovered && clickable ? accent : TD,
        lineHeight: 1.1, marginTop: 6,
        fontVariantNumeric: "tabular-nums",
        transition: "color 0.2s ease",
      }}>{value}</p>
      {sub && (
        <div className="inline-flex items-center gap-1 mt-2"
          style={{ fontSize: "0.66rem", color: active ? accent : TT, fontWeight: 600 }}>
          <span>{sub}</span>
        </div>
      )}
    </button>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function Submissions() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const role: RoleId = user?.roleId ?? "sr-uw";
  const [filters, setFilters]   = useState<Filters>(EMPTY_FILTERS);
  const [showFilter, setShowFilter] = useState(false);
  const [sortKey, setSortKey]   = useState<SortKey>("needByDate");
  const [sortDir, setSortDir]   = useState<SortDir>("desc");
  const [viewTab, setViewTab]   = useState<"my" | "team" | "all">("my");
  const [page, setPage]         = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  // Submissions live in a shared context so the Inbox auto-create flow can
  // append drafts that show up here without a page refresh.
  const { submissions, addSubmission } = useSubmissionsList();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const PER_PAGE = 5;

  // Filter facet list is derived from the live submissions list so any auto-
  // created entries from the Inbox become filterable immediately.
  const UW_LIST = useMemo(() => [...new Set(submissions.map(s => s.assignedTo))].sort(),  [submissions]);

  const toggleSelect = (id: string) => setSelected(prev => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

  // ─── Column reordering ────────────────────────────────────────────────
  // `colOrder` is the live order rendered by both the header and every data
  // row. The checkbox column is locked at index 0 — drag handlers refuse to
  // accept it as a drag source or land another column before it.
  const [colOrder, setColOrder] = useState<ColKey[]>(INITIAL_ORDER);
  const [draggedKey, setDraggedKey] = useState<ColKey | null>(null);
  const [dragOverKey, setDragOverKey] = useState<ColKey | null>(null);

  // gridTemplateColumns derived from the current order; both the header and
  // each data row read from this so they always stay aligned.
  const gridTemplate = useMemo(
    () => colOrder.map(k => COLUMNS_BY_KEY[k].width).join(" "),
    [colOrder]
  );

  const onColDragStart = (e: React.DragEvent, key: ColKey) => {
    if (key === "checkbox") return;
    setDraggedKey(key);
    e.dataTransfer.effectAllowed = "move";
    // Required for Firefox to initiate the drag at all.
    e.dataTransfer.setData("text/plain", key);
  };

  const onColDragOver = (e: React.DragEvent, key: ColKey) => {
    if (!draggedKey || key === "checkbox" || key === draggedKey) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverKey !== key) setDragOverKey(key);
  };

  const onColDragLeave = (key: ColKey) => {
    if (dragOverKey === key) setDragOverKey(null);
  };

  const onColDrop = (e: React.DragEvent, key: ColKey) => {
    e.preventDefault();
    if (!draggedKey || key === "checkbox" || key === draggedKey) {
      setDraggedKey(null);
      setDragOverKey(null);
      return;
    }
    setColOrder(prev => {
      const next = prev.filter(k => k !== draggedKey);
      const targetIdx = next.indexOf(key);
      next.splice(targetIdx, 0, draggedKey);
      return next;
    });
    setDraggedKey(null);
    setDragOverKey(null);
  };

  const onColDragEnd = () => {
    setDraggedKey(null);
    setDragOverKey(null);
  };

  // ── Filters dropdown anchoring ────────────────────────────────────────────
  // We position the desktop dropdown with `position: fixed` aligned to the
  // table's actual right edge (read off the toolbar) so the popover always
  // covers the rightmost columns of the table — no chevrons / row tails
  // peeking past the popover's right border.
  const toolbarRef = useRef<HTMLDivElement | null>(null);
  const filterBtnRef = useRef<HTMLButtonElement | null>(null);
  const [popoverPos, setPopoverPos] = useState<{ top: number; right: number } | null>(null);
  useLayoutEffect(() => {
    if (!showFilter) return;
    const update = () => {
      const btn = filterBtnRef.current;
      const tb  = toolbarRef.current;
      if (!btn || !tb) return;
      const btnRect = btn.getBoundingClientRect();
      const tbRect  = tb.getBoundingClientRect();
      setPopoverPos({
        top:   btnRect.bottom + 8,
        right: Math.max(window.innerWidth - tbRect.right, 0),
      });
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [showFilter]);

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
    if (filters.kinds.length)       data = data.filter(s => filters.kinds.includes(s.kind));
    if (filters.products.length)    data = data.filter(s => filters.products.some(p => s.products.includes(p)));
    if (filters.states.length)      data = data.filter(s => filters.states.includes(s.state));
    if (filters.brokers.length)     data = data.filter(s => filters.brokers.includes(s.broker));
    if (filters.assignedTo.length)  data = data.filter(s => filters.assignedTo.includes(s.assignedTo));
    if (filters.dateFrom)           data = data.filter(s => s.submitted >= filters.dateFrom);
    if (filters.dateTo)             data = data.filter(s => s.submitted <= filters.dateTo);
    if (filters.premiumFrom !== "") {
      const min = Number(filters.premiumFrom);
      if (!isNaN(min)) data = data.filter(s => s.estimatedPremium >= min);
    }
    if (filters.premiumTo !== "") {
      const max = Number(filters.premiumTo);
      if (!isNaN(max)) data = data.filter(s => s.estimatedPremium <= max);
    }

    // Urgency pre-sort: surface action-needed submissions to the top regardless
    // of the user's chosen sort key. Critical (high+active or blocked+aging) →
    // Warning (aging or medium) → Normal. Within each tier, the user's sort applies.
    const urgencyTier = (s: Submission) => {
      const isActiveStage = s.status === "In Review" || s.status === "Pending Info" || s.status === "New";
      const isBlockedAging = s.status === "Pending Info" && s.daysInQueue >= 14;
      const isHighPriorityActive = s.priority === "High" && isActiveStage;
      const isAging = isActiveStage && s.daysInQueue >= 21;
      if (isHighPriorityActive || isBlockedAging) return 0;
      if (isAging) return 1;
      return 2;
    };

    // sort
    data.sort((a, b) => {
      const tierDiff = urgencyTier(a) - urgencyTier(b);
      if (tierDiff !== 0) return tierDiff;
      let va: number | string = 0, vb: number | string = 0;
      if (sortKey === "needByDate")        { va = a.needByDate; vb = b.needByDate; }
      else if (sortKey === "effective")         { va = a.effective; vb = b.effective; }
      else if (sortKey === "premium")           { va = a.estimatedPremium; vb = b.estimatedPremium; }
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return data;
  }, [filters, sortKey, sortDir, viewTab, submissions]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const allOnPageSelected = paginated.length > 0 && paginated.every(s => selected.has(s.id));
  const toggleSelectPage = () => setSelected(prev => {
    const next = new Set(prev);
    if (allOnPageSelected) paginated.forEach(p => next.delete(p.id));
    else paginated.forEach(p => next.add(p.id));
    return next;
  });

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("desc"); }
    setPage(1);
  };

  const activeFilterCount = [
    filters.statuses, filters.kinds, filters.products, filters.states,
    filters.brokers, filters.assignedTo,
  ].reduce((a, arr) => a + arr.length, 0) + (filters.search ? 1 : 0)
    + (filters.dateFrom ? 1 : 0) + (filters.dateTo ? 1 : 0)
    + (filters.premiumFrom ? 1 : 0) + (filters.premiumTo ? 1 : 0);

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
    ...filters.kinds.map(k => ({ label:`Kind: ${k}`, remove:()=>setFilters(f=>({...f,kinds:f.kinds.filter(x=>x!==k)})) })),
    ...filters.products.map(p => ({ label:`Product: ${p}`, remove:()=>setFilters(f=>({...f,products:f.products.filter(x=>x!==p)})) })),
    ...filters.states.map(s => ({ label:`State: ${s}`, remove:()=>setFilters(f=>({...f,states:f.states.filter(x=>x!==s)})) })),
    ...filters.brokers.map(b => ({ label:`Broker: ${b.split(" ")[0]}…`, remove:()=>setFilters(f=>({...f,brokers:f.brokers.filter(x=>x!==b)})) })),
    ...filters.assignedTo.map(u => ({ label:`UW: ${u.split(" ")[0]}`, remove:()=>setFilters(f=>({...f,assignedTo:f.assignedTo.filter(x=>x!==u)})) })),
    ...(filters.search ? [{ label:`"${filters.search}"`, remove:()=>setFilters(f=>({...f,search:""})) }] : []),
    ...(filters.dateFrom ? [{ label:`From: ${filters.dateFrom}`, remove:()=>setFilters(f=>({...f,dateFrom:""})) }] : []),
    ...(filters.dateTo   ? [{ label:`To: ${filters.dateTo}`,   remove:()=>setFilters(f=>({...f,dateTo:""})) }] : []),
    ...(filters.premiumFrom ? [{ label:`Premium ≥ ${fmt(Number(filters.premiumFrom))}`, remove:()=>setFilters(f=>({...f,premiumFrom:""})) }] : []),
    ...(filters.premiumTo   ? [{ label:`Premium ≤ ${fmt(Number(filters.premiumTo))}`,   remove:()=>setFilters(f=>({...f,premiumTo:""})) }] : []),
  ];

  // KPI summary — derived from the live (context-backed) submissions list so
  // auto-created drafts from the Inbox flow into the tile counts immediately.
  const kpis = useMemo(() => {
    const inReview  = submissions.filter(s=>s.status==="In Review").length;
    const quoted    = submissions.filter(s=>s.status==="Quoted").length;
    const bound     = submissions.filter(s=>s.status==="Bound").length;
    const declined  = submissions.filter(s=>s.status==="Declined").length;
    const open      = submissions.length - bound - declined;
    const newCount  = submissions.filter(s=>s.status==="New").length;
    const awaiting  = submissions.filter(s=>s.status==="Pending Info").length;
    const drafts    = submissions.filter(s=>s.status==="Draft").length;
    return {
      total:     submissions.length,
      inReview, quoted, bound,
      open,
      newThisWeek: newCount,
      awaitingInfo: awaiting,
      readyForReview: inReview,
      drafts,
      avgTimeInQueue: "2.4d",
      slaAtRisk: 3,
      totalPrem: submissions.filter(s=>s.status==="Bound").reduce((a,s)=>a+s.estimatedPremium,0),
    };
  }, [submissions]);

  return (
    <AppShell activePage="submissions" role={role} onRoleChange={() => {}}>
      <PageRegister
        routeKey="page:submissions"
        title="Submissions"
        subtitle={`Queue · ${submissions.length}`}
        greeting={`I'm looking at ${submissions.length} submissions: ${kpis.inReview} in review, ${kpis.quoted} quoted, ${kpis.bound} bound YTD. What would help?`}
        suggestions={[
          { id: "overdue", label: "Show overdue submissions", tone: "red", icon: "AlertTriangle" },
          { id: "by-status", label: "Break down by status", tone: "blue", icon: "ChartPie" },
          { id: "summary", label: "Summarize the queue", tone: "violet", icon: "Sparkles" },
          { id: "new-sub", label: "Start a new submission", tone: "gold", icon: "Plus", navigateTo: "/submissions/new" },
          { id: "open-portfolio", label: "Open Portfolio", tone: "violet", icon: "BarChart3", navigateTo: "/portfolio" },
        ]}
        respond={(sid) => {
          if (sid === "by-status") return [{ id: newId(), role: "agent", kind: "viz", ts: now(), viz: {
            kind: "donut", title: "Submissions by status",
            segments: [
              { label: "In Review", value: kpis.inReview, color: "#B45309" },
              { label: "Quoted",    value: kpis.quoted,   color: "#005B99" },
              { label: "Bound",     value: kpis.bound,    color: "#15803D" },
            ],
          } }];
          if (sid === "summary") return [{ id: newId(), role: "agent", kind: "text", ts: now(),
            text: `${kpis.total} total submissions · ${kpis.inReview} in review · ${kpis.quoted} quoted · ${kpis.bound} bound YTD. Bound premium YTD: ${fmt(kpis.totalPrem)}.` }];
        }}
        freeText={(text) => {
          const t = text.toLowerCase();
          if (/\b(how many|count|total)\b/.test(t)) {
            return [{ id: newId(), role: "agent", kind: "text", ts: now(),
              text: `${submissions.length} submissions match the current view. Of those: ${kpis.inReview} in review, ${kpis.quoted} quoted, ${kpis.bound} bound.` }];
          }
          if (/\b(quoted|in review|bound|declined)\b/.test(t)) {
            return [{ id: newId(), role: "agent", kind: "text", ts: now(),
              text: `Status mix on screen: ${kpis.inReview} in review, ${kpis.quoted} quoted, ${kpis.bound} bound. Want me to filter the table?` }];
          }
        }}
        facts={() => [
          `Submissions view: ${viewTab} · status filter: ${filters.statuses.join(",") || "any"} · search: "${filters.search ?? ""}"`,
          `Visible: ${submissions.length} of ${kpis.total} total`,
          `Status mix: ${kpis.inReview} in review · ${kpis.quoted} quoted · ${kpis.bound} bound (YTD)`,
          `Bound premium YTD: ${fmt(kpis.totalPrem)}`,
        ].join("\n")}
      />
      <div style={{ fontFamily:font, color:TD }}>

        {/* ── HERO + KPI STRIP (Dashboard structure, original Submissions content) ─── */}
        <div className="px-3 sm:px-4 lg:px-5 py-3 sm:py-4 space-y-3 sm:space-y-4"
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
            <div className="relative px-4 sm:px-5 py-4 sm:py-5 flex items-start justify-between gap-3 flex-wrap">
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

          {/* KPI tiles — operational metrics for the queue */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {([
              { label:"Open Submissions",  value:String(kpis.open),           sub:"across all stages",    accent:N,         status: null              as StatusType | null, clickable:true  },
              { label:"New This Week",     value:String(kpis.newThisWeek),    sub:"vs. 14 last week",     accent:"#005B99", status: "New"             as StatusType | null, clickable:true  },
              { label:"Awaiting Info",     value:String(kpis.awaitingInfo),   sub:"broker follow-up",     accent:G,         status: "Pending Info"    as StatusType | null, clickable:true  },
              { label:"Ready for Review",  value:String(kpis.readyForReview), sub:"complete submissions", accent:"#15803D", status: "In Review"       as StatusType | null, clickable:true  },
              { label:"Avg. Time in Queue",value:kpis.avgTimeInQueue,         sub:"rolling 7 days",       accent:"#B45309", status: null              as StatusType | null, clickable:false },
              { label:"SLA At Risk",       value:String(kpis.slaAtRisk),      sub:"within 24h",           accent:"#B91C1C", status: null              as StatusType | null, clickable:false },
            ]).map((k, i) => {
              const isExclusiveOnThisStatus =
                k.status !== null &&
                filters.statuses.length === 1 &&
                filters.statuses[0] === k.status;
              const isOpenActive = k.label === "Open Submissions" && filters.statuses.length === 0;
              const selected = k.clickable && (isOpenActive || isExclusiveOnThisStatus);
              return (
                <KpiTile
                  key={i}
                  label={k.label}
                  value={k.value}
                  sub={k.sub}
                  accent={k.accent}
                  selected={selected}
                  onClick={k.clickable ? () => {
                    setFilters(f => ({
                      ...f,
                      statuses: k.status === null || selected ? [] : [k.status as StatusType],
                    }));
                    setPage(1);
                  } : undefined}
                />
              );
            })}
          </div>

          {/* ── SUBMISSIONS CARD (Dashboard-style chrome) ──────────────────── */}
          <div
            ref={toolbarRef}
            style={{
              background:"white",
              border:`1px solid ${BDL}`,
              borderRadius:8,
              overflow:"hidden",
              boxShadow:"0 1px 2px rgba(15,23,42,0.04)",
            }}>

        {/* ── TOOLBAR ─────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-3 sm:px-5 py-3 gap-3 flex-wrap"
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
                {tab==="my"?"My Submissions":tab==="team"?"My Team":"All"}
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
                borderRadius: 6,
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
              ref={filterBtnRef}
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

        {/* Desktop filter dropdown — fixed to the viewport, right edge aligned
            to the toolbar's right edge (i.e. the table's right edge), so no
            row chevrons or tail content peek past the popover's right border. */}
        {showFilter && popoverPos && (
          <>
            <div
              className="hidden lg:block"
              onClick={() => setShowFilter(false)}
              style={{
                position: "fixed", inset: 0, zIndex: 40,
                background: "transparent",
              }}
            />
            <div
              className="hidden lg:block submissions-filter-popover"
              style={{
                position: "fixed",
                top: popoverPos.top,
                right: popoverPos.right,
                width: 380,
                maxHeight: "70vh",
                overflowY: "auto",
                background: "white",
                border: `1px solid ${BDL}`,
                borderRadius: 10,
                boxShadow: "0 18px 40px rgba(15,23,42,0.22), 0 4px 8px rgba(15,23,42,0.08)",
                zIndex: 50,
              }}>
              <FilterPanel
                filters={filters}
                onChange={f => { setFilters(f); setPage(1); }}
                onReset={() => { setFilters(EMPTY_FILTERS); setPage(1); }}
                uwList={UW_LIST}
              />
            </div>
          </>
        )}

        {/* Active filter chips */}
        {chipsList.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap px-3 sm:px-5 py-2.5"
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

        {/* ── BODY: table only — desktop filter is now a dropdown above ────── */}
        <div className="flex items-start">

          {/* Mobile-only filter drawer (desktop uses the dropdown anchored to the Filters button) */}
          {showFilter && (
            <>
              <div
                className="fixed inset-0 z-30 lg:hidden"
                style={{ background:"rgba(15,23,42,0.4)" }}
                onClick={() => setShowFilter(false)}
              />
              <div className="fixed top-0 left-0 h-full z-40 overflow-y-auto bg-white shadow-2xl lg:hidden"
                style={{ width:272, borderRight:`1px solid ${BDL}`, maxHeight:"100vh" }}>
                <div className="flex items-center justify-between px-5 py-3"
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
                  uwList={UW_LIST}
                />
              </div>
            </>
          )}

          {/* Table */}
          <div style={{ flex:1, minWidth:0 }}>

           {/* Horizontally scrollable region — headers + rows only, pagination stays put */}
           <div style={{ overflowX:"auto" }}>

            {/* Column headers — order is driven by `colOrder` state so a
                user-driven drag-reorder of one header re-renders the whole
                table (header + every row) in the new order. Each header
                (except the locked checkbox) is a draggable handle; a blue
                left-edge marker on the dragover target indicates where the
                column will drop. */}
            <div style={{ background:"#FAFBFD", borderBottom:`1px solid ${BDL}`, position:"sticky", top:0, zIndex:5 }}>
              <div className="grid px-5 py-2.5"
                style={{ gridTemplateColumns: gridTemplate, gap:"0 16px", alignItems:"center", justifyItems:"start" }}>
                {colOrder.map(key => {
                  const col = COLUMNS_BY_KEY[key];
                  const isCheckbox = col.key === "checkbox";
                  const isDragging = draggedKey === col.key;
                  const isDragOver = dragOverKey === col.key && draggedKey !== null;

                  let inner: React.ReactNode;
                  if (isCheckbox) {
                    inner = (
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleSelectPage(); }}
                        aria-label={allOnPageSelected ? "Deselect all on this page" : "Select all on this page"}
                        className="flex items-center justify-center"
                        style={{
                          width:15, height:15,
                          background: allOnPageSelected ? N : "white",
                          border: `2px solid ${allOnPageSelected ? N : BD}`,
                          cursor: "pointer",
                          transition: "all 0.13s",
                        }}>
                        {allOnPageSelected && <Check size={9} color="white" strokeWidth={3}/>}
                      </button>
                    );
                  } else if (col.sortKey) {
                    inner = <SortBtn col={col.sortKey} label={col.label}/>;
                  } else {
                    inner = <ColLabel>{col.label}</ColLabel>;
                  }

                  return (
                    <div
                      key={col.key}
                      draggable={!isCheckbox}
                      onDragStart={(e) => onColDragStart(e, col.key)}
                      onDragOver={(e) => onColDragOver(e, col.key)}
                      onDragLeave={() => onColDragLeave(col.key)}
                      onDrop={(e) => onColDrop(e, col.key)}
                      onDragEnd={onColDragEnd}
                      title={isCheckbox ? undefined : "Drag to reorder"}
                      style={{
                        position: "relative",
                        cursor: isCheckbox ? undefined : (isDragging ? "grabbing" : "grab"),
                        opacity: isDragging ? 0.4 : 1,
                        // Blue left-edge marker indicates the drop slot.
                        borderLeft: isDragOver ? `2px solid ${N}` : "2px solid transparent",
                        // For draggable headers, extend the parent's hit area
                        // 14 px into the inter-column gap so the GripVertical
                        // icon sits INSIDE the parent's draggable surface.
                        // Without this trick, the absolutely-positioned grip
                        // would be visually in the gap but logically outside
                        // any element's bounding box — clicks on it would
                        // fall through to nothing and the drag wouldn't fire.
                        // `marginLeft` pulls the parent visually left;
                        // `paddingLeft` restores the inner content's x-
                        // position so the label still aligns with the data
                        // cells beneath it. Checkbox column is anchored at
                        // its original position with only the standard 2 px
                        // border compensation.
                        marginLeft: isCheckbox ? -2 : -14,
                        paddingLeft: isCheckbox ? 2 : 14,
                        transition: "border-color 0.12s, opacity 0.12s",
                        // Stretch to the grid cell's full vertical so the
                        // drag target captures clicks anywhere on the header.
                        alignSelf: "stretch",
                        display: "flex",
                        alignItems: "center",
                        userSelect: "none",
                      }}
                    >
                      {/* Drag-handle affordance.
                          Positioned absolutely inside the parent's expanded
                          padding area so it visually sits in the column-gap
                          (no header-label shift) while remaining within the
                          parent's bounding box — that means clicks on the
                          grip itself initiate the drag on the parent, same
                          as clicks on the label. No `pointer-events: none`
                          because we *want* the grip to be hittable now. */}
                      {!isCheckbox && (
                        <GripVertical
                          size={11}
                          color={TT}
                          aria-hidden="true"
                          style={{
                            position: "absolute",
                            left: 3,
                            top: "50%",
                            transform: "translateY(-50%)",
                            opacity: 0.5,
                          }}
                        />
                      )}
                      {inner}
                    </div>
                  );
                })}
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
              // Urgency flags still drive the "Need By Date" pill (Critical /
              // High Priority / Aging). The left urgency rail has been removed
              // per design feedback — colored chrome is reserved for the KPI
              // strip up top. These booleans stay because the pill is still
              // useful as inline content.
              const isActiveStage = sub.status === "In Review" || sub.status === "Pending Info" || sub.status === "New";
              const isBlockedAging = sub.status === "Pending Info" && sub.daysInQueue >= 14;
              const isHighPriorityActive = sub.priority === "High" && isActiveStage;
              const isAging = isActiveStage && sub.daysInQueue >= 21;
              const MAX_PRODUCTS = 3;
              const visibleProducts = sub.products.slice(0, MAX_PRODUCTS);
              const overflowCount  = sub.products.length - MAX_PRODUCTS;
              const rowSelected = selected.has(sub.id);

              // Per-cell renderer — keyed by ColKey so the data row can be
              // reshuffled by the user's drag-reorder of column headers
              // without any branch in the row wrapper. Each branch returns
              // the SAME JSX the row used to render inline; only the call
              // site changed (we map colOrder instead of hard-coding order).
              const renderCell = (cellKey: ColKey): React.ReactNode => {
                switch (cellKey) {
                  case "checkbox":
                    return (
                      <div onClick={(e) => e.stopPropagation()} className="flex items-center" style={{ minHeight: 20 }}>
                    <button
                      onClick={() => toggleSelect(sub.id)}
                      aria-label={rowSelected ? `Deselect ${sub.subId}` : `Select ${sub.subId}`}
                      aria-pressed={rowSelected}
                      className="flex items-center justify-center"
                      style={{
                        width:15, height:15,
                        background: rowSelected ? N : "white",
                        border: `2px solid ${rowSelected ? N : BD}`,
                        cursor: "pointer",
                        transition: "all 0.13s",
                      }}>
                      {rowSelected && <Check size={9} color="white" strokeWidth={3}/>}
                    </button>
                      </div>
                    );
                  case "member":
                    return (
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p style={{
                        fontSize:14, lineHeight:"20px", fontWeight:600, color:TD,
                      }} className="group-hover:underline group-hover:decoration-blue-600">
                        {sub.member}
                      </p>
                      {sub.kind === "Group" && (
                        <span
                          className="inline-flex items-center gap-1 shrink-0"
                          title={`${sub.memberCount ?? 0} members in this group submission`}
                          style={{
                            color:"#7B2FBE",
                            fontSize:"0.72rem", fontWeight:700, lineHeight:1,
                          }}
                        >
                          <Users size={10}/>
                          Group · {sub.memberCount ?? "?"}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                      <span style={{
                        fontSize:"0.75rem", lineHeight:"18px", fontWeight:600, color:N,
                        fontFamily:"ui-monospace, SFMono-Regular, Menlo, monospace",
                      }}>
                        {sub.subId}
                      </span>
                      <span style={{
                        fontSize:"0.75rem", lineHeight:"18px", color:TT, fontWeight:400,
                        fontFamily:"ui-monospace, SFMono-Regular, Menlo, monospace",
                      }}>
                        · M-{sub.memberNumber}
                      </span>
                      <span style={{ width:2, height:2, borderRadius:9999, background:BD }}/>
                      <span style={{ fontSize:"0.75rem", lineHeight:"18px", color:TT, fontWeight:500 }}>{sub.state}</span>
                      <span style={{ width:2, height:2, borderRadius:9999, background:BD }}/>
                      <span style={{
                        fontSize:"0.75rem", lineHeight:"18px", color:TT, fontWeight:400,
                      }}>
                        {sub.broker}
                      </span>
                    </div>
                  </div>
                    );
                  case "needByDate":
                    return (
                  <div className="flex flex-col items-start gap-1">
                    <span style={{
                      fontSize:14, lineHeight:"20px", color:TM, fontWeight:500,
                      fontVariantNumeric:"tabular-nums",
                    }}>
                      {sub.needByDate ? new Date(sub.needByDate).toLocaleDateString("en-US",{month:"short",day:"numeric"}) : "—"}
                    </span>
                    {(isBlockedAging || isAging || isHighPriorityActive) && (
                      <span style={{
                        background: isBlockedAging ? "#FEE2E2"
                          : isHighPriorityActive ? "#FEE2E2"
                          : "#FEF3C7",
                        color: isBlockedAging ? "#7A1F1F"
                          : isHighPriorityActive ? "#7A1F1F"
                          : "#92400E",
                        // Asymmetric padding compensates for trailing
                        // letter-spacing on the last uppercase character.
                        padding:"3px 8px 3px 9px", borderRadius:9999,
                        ...typo.overline,
                        display:"inline-flex", alignItems:"center",
                        whiteSpace:"nowrap",
                      }}>
                        {isBlockedAging ? "Critical"
                          : isHighPriorityActive ? "High Priority"
                          : "Aging · " + sub.daysInQueue + "d"}
                      </span>
                    )}
                  </div>
                    );
                  case "effective":
                    return (
                  <div>
                    <span style={{
                      fontSize:14, lineHeight:"20px", color:TM, fontWeight:500,
                      fontVariantNumeric:"tabular-nums",
                    }}>
                      {sub.effective ? new Date(sub.effective).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"2-digit"}) : "—"}
                    </span>
                  </div>
                    );
                  case "submissionType":
                    return (
                  <div>
                    <span style={{
                      fontSize:14, lineHeight:"20px", fontWeight:600,
                      color: sub.submissionType === "New Business" ? N : "#7B2FBE",
                    }}>
                      {sub.submissionType}
                    </span>
                  </div>
                    );
                  case "products":
                    return (
                  <div className="flex items-center gap-1 flex-wrap">
                    <span style={{
                      fontSize:14, lineHeight:"20px", fontWeight:500, color:TM,
                    }}>
                      {visibleProducts.join(" · ")}
                    </span>
                    {overflowCount > 0 && (
                      <span style={{
                        fontSize:"0.78rem", lineHeight:"20px", fontWeight:500, color:TT,
                      }}>
                        +{overflowCount}
                      </span>
                    )}
                  </div>
                    );
                  case "stage":
                    return (
                  <div>
                    {sub.status === "Declined" ? (
                      <span className="inline-flex items-center gap-1.5"
                        style={{
                          background:sc.bg, padding:"3px 8px", borderRadius:9999,
                        }}>
                        <span className="rounded-full" style={{ width:6, height:6, background:sc.dot }}/>
                        <span style={{ fontSize:"0.78rem", lineHeight:"20px", fontWeight:600, color:sc.text }}>
                          {sub.status}
                        </span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5">
                        <span className="rounded-full" style={{ width:6, height:6, background:sc.dot }}/>
                        <span style={{ fontSize:14, lineHeight:"20px", fontWeight:500, color:sc.text }}>
                          {sub.status}
                        </span>
                      </span>
                    )}
                  </div>
                    );
                  case "underwriter":
                    return (
                  <div>
                    {sub.assignedTo === "Unassigned" ? (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center shrink-0 rounded-full"
                          style={{
                            width:22, height:22,
                            background:"#FFF3E0",
                            border:"1px dashed #E07800",
                            color:"#B45309",
                            fontSize:"0.7rem", fontWeight:700,
                            lineHeight:1,
                          }}>
                            ?
                        </div>
                        <span style={{
                          fontSize:14, lineHeight:"20px", color:"#B45309", fontWeight:600,
                        }}>
                          Unassigned
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center shrink-0 rounded-full"
                          style={{
                            width:22, height:22,
                            background:`${N}10`, color:N,
                            fontSize:"0.62rem", fontWeight:700,
                          }}>
                          {sub.assignedTo.split(" ").map(n=>n[0]).join("")}
                        </div>
                        <span style={{
                          fontSize:14, lineHeight:"20px", color:TD, fontWeight:500,
                        }}>
                          {sub.assignedTo.split(" ")[0]}
                        </span>
                      </div>
                    )}
                  </div>
                    );
                  case "premium":
                    return (
                  <div>
                    <span style={{
                      fontSize:14, lineHeight:"20px", fontWeight:600, color:TD,
                      fontVariantNumeric:"tabular-nums", whiteSpace:"nowrap",
                    }}>
                      {fmt(sub.estimatedPremium)}
                    </span>
                  </div>
                    );
                  case "appetite":
                    return (
                  <div className="flex items-center justify-between gap-1 w-full">
                    <span style={{
                      fontSize:15, lineHeight:"20px", fontWeight:700,
                      color: sub.appetiteScore >= 80 ? "#15803D" :
                             sub.appetiteScore >= 60 ? "#B45309" : "#B91C1C",
                      fontVariantNumeric:"tabular-nums",
                    }}>
                      {sub.appetiteScore}%
                    </span>
                    <ChevronRight size={16} color={TT} className="shrink-0 transition-all group-hover:text-blue-600 group-hover:translate-x-0.5"/>
                  </div>
                    );
                }
              };

              return (
                <div
                  key={sub.id}
                  onClick={() => navigate(`/submission/${sub.subId}`)}
                  className="grid px-5 py-3.5 cursor-pointer transition-colors hover:bg-[#F0F6FF] group"
                  style={{
                    gridTemplateColumns: gridTemplate,
                    gap:"0 16px",
                    alignItems:"start",
                    borderBottom: isLast ? "none" : `1px solid ${BDL}`,
                    background: rowSelected ? `${N}06` : "white",
                  }}
                >
                  {colOrder.map(k => (
                    <Fragment key={k}>{renderCell(k)}</Fragment>
                  ))}
                </div>
              );
            })}

           </div>{/* ── close horizontal scroll region ──────────────────── */}

            {/* Pagination */}
            {paginated.length > 0 && (
              <div className="flex items-center justify-between px-6 py-4"
                style={{ background: "white", borderTop: `2px solid ${BDL}` }}>

                {/* Range info — the current page is conveyed by the numbered
                    buttons on the right; no need to also spell out "Page X of Y". */}
                <span style={{ fontSize: "0.78rem", color: TM }}>
                  <span style={{ fontWeight: 700, color: TD }}>{(page - 1) * PER_PAGE + 1}</span>
                  {"–"}
                  <span style={{ fontWeight: 700, color: TD }}>{Math.min(page * PER_PAGE, filtered.length)}</span>
                  {" of "}
                  <span style={{ fontWeight: 700, color: TD }}>{filtered.length}</span>
                  {" submission"}{filtered.length !== 1 ? "s" : ""}
                </span>

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
          addSubmission({
            member: data.accountName,
            needByDate: data.effectiveDate,
            effective: data.effectiveDate,
            expiry: data.expirationDate,
          });
          setShowCreateModal(false);
        }}
      />
    </AppShell>
  );
}