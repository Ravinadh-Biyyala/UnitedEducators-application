import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router";
import {
  ArrowLeft, Plus, RefreshCw, ChevronDown, Check,
  Building2, Calendar, TrendingUp,
  User, Mail, Phone, FileText, ChevronRight,
  AlertCircle, X, Search, Lock,
  Paperclip, Trash2, Eye, MessageSquare,
  Sparkles, UploadCloud,
} from "lucide-react";
import { AppShell } from "../components/AppShell";
import { useAuth } from "../context/AuthContext";
import type { RoleId } from "../components/AppShell";

// ── Design tokens ──────────────────────────────────────────────────────────────
const N    = "#0123D4";
const G    = "#C9A227";
const BD   = "#C4CDD8";
const BDL  = "#DCE3EC";
const TH   = "#F0F3F8";
const TT   = "#7A8FA3";
const TM   = "#4A5D6E";
const TD   = "#1A2530";
const font = "'Source Sans 3', system-ui, sans-serif";

// ── Account data ───────────────────────────────────────────────────────────────
interface AccountRecord {
  id: string;
  name: string;
  city: string;
  state: string;
  type: string;
}

const ACCOUNTS: AccountRecord[] = [
  { id: "1001", name: "Riverside Unified School District",    city: "Riverside",     state: "CA", type: "K-12 Public District" },
  { id: "1002", name: "San Diego City Unified SD",            city: "San Diego",     state: "CA", type: "K-12 Public District" },
  { id: "1003", name: "Austin Independent School District",   city: "Austin",        state: "TX", type: "K-12 Public District" },
  { id: "1004", name: "Denver Public Schools",                city: "Denver",        state: "CO", type: "K-12 Public District" },
  { id: "1005", name: "Seattle Public Schools",               city: "Seattle",       state: "WA", type: "K-12 Public District" },
  { id: "1006", name: "Houston Independent School District",  city: "Houston",       state: "TX", type: "K-12 Public District" },
  { id: "1007", name: "Minneapolis Public Schools",           city: "Minneapolis",   state: "MN", type: "K-12 Public District" },
  { id: "1008", name: "Charlotte-Mecklenburg Schools",        city: "Charlotte",     state: "NC", type: "K-12 Public District" },
  { id: "1009", name: "Clark County School District",         city: "Las Vegas",     state: "NV", type: "K-12 Public District" },
  { id: "1010", name: "Broward County Public Schools",        city: "Fort Lauderdale",state: "FL", type: "K-12 Public District" },
  { id: "1011", name: "Fairfax County Public Schools",        city: "Fairfax",       state: "VA", type: "K-12 Public District" },
  { id: "1012", name: "Wake County Public School System",     city: "Cary",          state: "NC", type: "K-12 Public District" },
  { id: "1013", name: "Gwinnett County Public Schools",       city: "Lawrenceville", state: "GA", type: "K-12 Public District" },
  { id: "1014", name: "Montgomery County Public Schools",     city: "Rockville",     state: "MD", type: "K-12 Public District" },
  { id: "1015", name: "Palm Beach County School District",    city: "West Palm Beach",state: "FL", type: "K-12 Public District" },
  { id: "1016", name: "Jefferson County Public Schools",      city: "Louisville",    state: "KY", type: "K-12 Public District" },
  { id: "1017", name: "Hillsborough County Public Schools",   city: "Tampa",         state: "FL", type: "K-12 Public District" },
  { id: "1018", name: "Orange County Public Schools",         city: "Orlando",       state: "FL", type: "K-12 Public District" },
  { id: "2001", name: "University of California, Davis",      city: "Davis",         state: "CA", type: "4-Year University" },
  { id: "2002", name: "Georgetown University",                city: "Washington",    state: "DC", type: "4-Year University" },
  { id: "2003", name: "Portland State University",            city: "Portland",      state: "OR", type: "4-Year University" },
  { id: "2004", name: "Horizon Academy Network",              city: "Phoenix",       state: "AZ", type: "Charter Network" },
  { id: "2005", name: "Pacific Northwest University Consortium", city: "Bellevue",   state: "WA", type: "Consortium" },
];

// ── Broker contact data ────────────────────────────────────────────────────────
interface BrokerContact {
  id: string;
  name: string;
  brokerage: string;
  email: string;
  phone: string;
  role: string;
}

const BROKER_CONTACTS: BrokerContact[] = [
  { id: "b1",  name: "James Whitfield",  brokerage: "Gallagher Education, Inc.",   email: "j.whitfield@gallaghered.com",    phone: "(800) 555-7890", role: "Education & Public Entity" },
  { id: "b2",  name: "Karen Hollis",     brokerage: "Gallagher Education, Inc.",   email: "k.hollis@gallaghered.com",       phone: "(800) 555-7891", role: "K-12 Specialist" },
  { id: "b3",  name: "Robert Singh",     brokerage: "Lockton Companies",           email: "r.singh@lockton.com",            phone: "(816) 555-2400", role: "Education Practice Lead" },
  { id: "b4",  name: "Diana Park",       brokerage: "Lockton Companies",           email: "d.park@lockton.com",             phone: "(816) 555-2401", role: "Risk Manager" },
  { id: "b5",  name: "William Travers",  brokerage: "Marsh McLennan Education",    email: "w.travers@marsh.com",            phone: "(212) 555-4400", role: "Client Executive" },
  { id: "b6",  name: "Angela Cruz",      brokerage: "Marsh McLennan Education",    email: "a.cruz@marsh.com",               phone: "(212) 555-4401", role: "Account Manager" },
  { id: "b7",  name: "Thomas Bradley",   brokerage: "Willis Towers Watson",        email: "t.bradley@wtwco.com",            phone: "(212) 555-8800", role: "Practice Leader" },
  { id: "b8",  name: "Sarah Kim",        brokerage: "Willis Towers Watson",        email: "s.kim@wtwco.com",                phone: "(212) 555-8801", role: "Senior Broker" },
  { id: "b9",  name: "Michael Torres",   brokerage: "Alliant Insurance Services",  email: "m.torres@alliant.com",           phone: "(949) 555-6600", role: "Account Executive" },
  { id: "b10", name: "Rachel Nguyen",    brokerage: "Arthur J. Gallagher & Co.",   email: "r.nguyen@ajg.com",               phone: "(630) 555-7700", role: "Education Practice" },
  { id: "b11", name: "David Okonkwo",    brokerage: "USI Insurance Services",      email: "d.okonkwo@usi.com",              phone: "(914) 555-2200", role: "Managing Director" },
  { id: "b12", name: "Lisa Chen",        brokerage: "HUB International",           email: "l.chen@hubinternational.com",    phone: "(312) 555-3300", role: "Senior Account Exec" },
];

const BROKERAGES = [...new Set(BROKER_CONTACTS.map(b => b.brokerage))];

// ── Account → Broker / UW defaults (auto-populate on account select) ───────────
const ACCOUNT_DEFAULTS: Record<string, { brokerage: string; brokerContactId: string; underwriterId: string; uwSpecialistId: string }> = {
  "1001": { brokerage: "Gallagher Education, Inc.",  brokerContactId: "b1",  underwriterId: "u1", uwSpecialistId: "s1" },
  "1002": { brokerage: "Gallagher Education, Inc.",  brokerContactId: "b2",  underwriterId: "u2", uwSpecialistId: "s2" },
  "1003": { brokerage: "Lockton Companies",          brokerContactId: "b3",  underwriterId: "u3", uwSpecialistId: "s3" },
  "1004": { brokerage: "Lockton Companies",          brokerContactId: "b4",  underwriterId: "u4", uwSpecialistId: "s4" },
  "1005": { brokerage: "Marsh McLennan Education",   brokerContactId: "b5",  underwriterId: "u5", uwSpecialistId: "s1" },
  "1006": { brokerage: "Marsh McLennan Education",   brokerContactId: "b6",  underwriterId: "u6", uwSpecialistId: "s2" },
  "1007": { brokerage: "Willis Towers Watson",       brokerContactId: "b7",  underwriterId: "u1", uwSpecialistId: "s3" },
  "1008": { brokerage: "Willis Towers Watson",       brokerContactId: "b8",  underwriterId: "u2", uwSpecialistId: "s4" },
  "1009": { brokerage: "Alliant Insurance Services", brokerContactId: "b9",  underwriterId: "u3", uwSpecialistId: "s1" },
  "1010": { brokerage: "Arthur J. Gallagher & Co.",  brokerContactId: "b10", underwriterId: "u4", uwSpecialistId: "s2" },
  "1011": { brokerage: "USI Insurance Services",     brokerContactId: "b11", underwriterId: "u5", uwSpecialistId: "s3" },
  "1012": { brokerage: "HUB International",          brokerContactId: "b12", underwriterId: "u6", uwSpecialistId: "s4" },
  "1013": { brokerage: "Gallagher Education, Inc.",  brokerContactId: "b1",  underwriterId: "u1", uwSpecialistId: "s1" },
  "1014": { brokerage: "Lockton Companies",          brokerContactId: "b3",  underwriterId: "u2", uwSpecialistId: "s2" },
  "1015": { brokerage: "Marsh McLennan Education",   brokerContactId: "b5",  underwriterId: "u3", uwSpecialistId: "s3" },
  "1016": { brokerage: "Willis Towers Watson",       brokerContactId: "b7",  underwriterId: "u4", uwSpecialistId: "s4" },
  "1017": { brokerage: "Alliant Insurance Services", brokerContactId: "b9",  underwriterId: "u5", uwSpecialistId: "s1" },
  "1018": { brokerage: "Gallagher Education, Inc.",  brokerContactId: "b2",  underwriterId: "u6", uwSpecialistId: "s2" },
  "2001": { brokerage: "Arthur J. Gallagher & Co.",  brokerContactId: "b10", underwriterId: "u1", uwSpecialistId: "s3" },
  "2002": { brokerage: "USI Insurance Services",     brokerContactId: "b11", underwriterId: "u2", uwSpecialistId: "s4" },
  "2003": { brokerage: "HUB International",          brokerContactId: "b12", underwriterId: "u3", uwSpecialistId: "s1" },
  "2004": { brokerage: "Lockton Companies",          brokerContactId: "b4",  underwriterId: "u4", uwSpecialistId: "s2" },
  "2005": { brokerage: "Marsh McLennan Education",   brokerContactId: "b6",  underwriterId: "u5", uwSpecialistId: "s3" },
};

// ── Stage groups ───────────────────────────────────────────────────────────────
export const STAGE_GROUPS = [
  { group: "Intake & Triage", color: "#7A8FA3", options: ["Incomplete Submission", "Complete Submission", "Declined to Quote"] },
  { group: "Underwriting",    color: N,          options: ["Information Gathering", "Review In Progress", "Referred"] },
  { group: "Quoting",         color: "#7B2FBE",  options: ["Quote In Progress", "Quote Sent", "Quote Negotiation", "Revised Quote"] },
  { group: "Decision",        color: "#1A7A4A",  options: ["Bound", "UE Non-Renewed", "Member Declined", "Member No Response"] },
  { group: "Post-Bind",       color: G,          options: ["Pending Issuance", "Issued", "Cancelled", "Endorsed"] },
];

function stageColor(stage: string) { return STAGE_GROUPS.find(g => g.options.includes(stage))?.color ?? TT; }
function groupForStage(stage: string) { return STAGE_GROUPS.find(g => g.options.includes(stage))?.group ?? ""; }

// ── Submission types ───────────────────────────────────────────────────────────
type SubmissionType = "New Business" | "Cross-Sell";

const SUB_TYPES: { id: SubmissionType; label: string; icon: React.ReactNode; desc: string }[] = [
  { id: "New Business", label: "New Business", icon: <Plus size={16}/>,       desc: "First-time submission from a new member account" },
  { id: "Cross-Sell",   label: "Cross-Sell",   icon: <TrendingUp size={16}/>, desc: "Additional coverage lines for an existing member" },
];

const PRODUCT_GROUPS: { group: string; abbr: string; color: string; products: string[] }[] = [
  {
    group: "General Liability", abbr: "GL", color: "#0123D4",
    products: [
      "Primary General Liability (CGL)",
      "Buffer Excess Liability (BLX)",
      "General Liability Excess (GLX)",
      "Public School Liability (PSL)",
    ],
  },
  {
    group: "Management Liability", abbr: "ML", color: "#7B2FBE",
    products: [
      "Educators Legal Liability (ELL)",
      "Excess Educators Legal Liability (ELX)",
      "Fiduciary Liability (FDL)",
      "Excess Fiduciary Liability (FDX)",
      "School Board Legal (SBL)",
    ],
  },
  {
    group: "Professional Liability", abbr: "PL", color: "#1A7A4A",
    products: [
      "Internships and Professional Services Liability (IPL)",
    ],
  },
  {
    group: "Assumed Reinsurance", abbr: "AR", color: "#B45309",
    products: [
      "Assumed Public School (RPS)",
      "Assumed Higher Education (RPH)",
    ],
  },
  {
    group: "Excess Liability", abbr: "EL", color: "#0E7490",
    products: [
      "Excess Following Form (XFF)",
      "Excess Liability Following Form - Shared Aggregate Limit of Liability (XPG)",
    ],
  },
];

// Flat list for any code that still needs it
const PRODUCT_LINES = PRODUCT_GROUPS.flatMap(g => g.products);

// ── Underwriting team roster ────────────────────────────────────────────────────
const UNDERWRITERS = [
  { id: "u1", name: "Sarah Mitchell",   title: "Underwriter" },
  { id: "u2", name: "John Michaels",    title: "Sr. Underwriter" },
  { id: "u3", name: "Patricia Hoffman", title: "UW Manager" },
  { id: "u4", name: "Robert Chen",      title: "UW Director" },
  { id: "u5", name: "Tom Lee",          title: "Underwriter" },
  { id: "u6", name: "Angela Torres",    title: "Underwriter" },
];

const UW_SPECIALISTS = [
  { id: "s1", name: "David Park",       title: "UW Specialist" },
  { id: "s2", name: "Jessica Turner",   title: "Sr. UW Specialist" },
  { id: "s3", name: "Marcus Webb",      title: "UW Specialist" },
  { id: "s4", name: "Linda Osei",       title: "UW Specialist" },
];

// ── Form state ─────────────────────────────────────────────────────────────────
interface FormState {
  submissionType: SubmissionType;
  accountId: string;
  accountName: string;
  productLines: string[];
  needByDate: string;
  effectiveDate: string;
  expirationDate: string;
  stage: string;
  brokerage: string;
  brokerContactId: string;
  brokerName: string;
  brokerEmail: string;
  brokerPhone: string;
  underwriterId: string;
  uwSpecialistId: string;
  notes: string;
}

const EMPTY: FormState = {
  submissionType: "New Business",
  accountId: "",
  accountName: "",
  productLines: [],
  needByDate: "",
  effectiveDate: "",
  expirationDate: "",
  stage: "Incomplete Submission",
  brokerage: "",
  brokerContactId: "",
  brokerName: "",
  brokerEmail: "",
  brokerPhone: "",
  underwriterId: "",
  uwSpecialistId: "",
  notes: "",
};

// ── Document types ─────────────────────────────────────────────────────────────
const DOC_CATEGORIES = [
  "Application Form", "Loss Runs", "Financial Statements",
  "Safety Survey", "Certificates", "Prior Policy", "Other",
];

interface UploadedDoc {
  id: string; name: string; size: string; category: string; uploadedAt: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────────
function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.64rem", fontWeight: 700, color: TT, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>
      {children}
      {required && <span style={{ color: "#B91C1C" }}>*</span>}
    </label>
  );
}

function TextInput({ value, onChange, placeholder, type = "text", readOnly, disabled, icon }: {
  value: string; onChange?: (v: string) => void; placeholder?: string;
  type?: string; readOnly?: boolean; disabled?: boolean; icon?: React.ReactNode;
}) {
  return (
    <div style={{ position: "relative" }}>
      {icon && <div style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: TT, pointerEvents: "none", zIndex: 1 }}>{icon}</div>}
      <input
        type={type} value={value} readOnly={readOnly || disabled}
        onChange={e => onChange?.(e.target.value)} placeholder={placeholder}
        style={{
          width: "100%", boxSizing: "border-box",
          paddingLeft: icon ? 34 : 11, paddingRight: 11, paddingTop: 9, paddingBottom: 9,
          border: `1px solid ${readOnly || disabled ? BDL : BD}`,
          background: readOnly ? "#F4F6FA" : disabled ? "#F8FAFC" : "white",
          color: (readOnly || disabled) ? TT : TD,
          fontSize: "0.80rem", fontFamily: font, outline: "none", transition: "border-color 0.15s",
          cursor: (readOnly || disabled) ? "default" : "text", opacity: disabled ? 0.6 : 1,
        }}
        onFocus={e => { if (!readOnly && !disabled) e.currentTarget.style.borderColor = N; }}
        onBlur={e => { e.currentTarget.style.borderColor = (readOnly || disabled) ? BDL : BD; }}
      />
    </div>
  );
}

// ── Date Picker Input with clickable calendar icon ─────────────────────────────
function DatePickerInput({ value, onChange, placeholder }: {
  value: string; onChange: (v: string) => void; placeholder?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleIconClick = () => {
    if (inputRef.current) {
      try { (inputRef.current as any).showPicker(); } catch { inputRef.current.focus(); }
    }
  };

  return (
    <div style={{ position: "relative" }}>
      <input
        ref={inputRef}
        type="date"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%", boxSizing: "border-box",
          paddingLeft: 11, paddingRight: 38, paddingTop: 9, paddingBottom: 9,
          border: `1px solid ${BD}`, background: "white", color: value ? TD : TT,
          fontSize: "0.80rem", fontFamily: font, outline: "none", transition: "border-color 0.15s",
          cursor: "pointer",
        }}
        onFocus={e => { e.currentTarget.style.borderColor = N; }}
        onBlur={e => { e.currentTarget.style.borderColor = BD; }}
      />
      <button
        type="button"
        onClick={handleIconClick}
        style={{
          position: "absolute", right: 0, top: 0, bottom: 0, width: 36,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: TH, border: "none", borderLeft: `1px solid ${BD}`,
          cursor: "pointer", color: TT, transition: "background 0.15s",
        }}
        onMouseEnter={e => { e.currentTarget.style.background = BDL; }}
        onMouseLeave={e => { e.currentTarget.style.background = TH; }}
      >
        <Calendar size={13} color={N} />
      </button>
    </div>
  );
}

// ── Searchable Account Dropdown ────────────────────────────────────────────────
function AccountDropdown({ value, onChange }: { value: string; onChange: (id: string, name: string) => void }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const selected = ACCOUNTS.find(a => a.id === value);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (open) { setSearch(""); setTimeout(() => inputRef.current?.focus(), 50); }
  }, [open]);

  const filtered = search.trim()
    ? ACCOUNTS.filter(a =>
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.city.toLowerCase().includes(search.toLowerCase()) ||
        a.state.toLowerCase().includes(search.toLowerCase()) ||
        a.type.toLowerCase().includes(search.toLowerCase()) ||
        a.id.includes(search)
      )
    : ACCOUNTS;

  const handleSelect = (a: AccountRecord) => {
    onChange(a.id, a.name);
    setOpen(false);
    setSearch("");
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("", "");
    setOpen(false);
  };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        style={{
          width: "100%", display: "flex", alignItems: "center", gap: 8,
          padding: "9px 11px", border: `1px solid ${open ? N : BD}`,
          background: "white", cursor: "pointer", fontFamily: font, textAlign: "left",
        }}
      >
        <Building2 size={13} color={TT} style={{ flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
          {selected ? (
            <div>
              <span style={{ fontSize: "0.80rem", color: TD, fontWeight: 600, display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {selected.name}
              </span>
              <span style={{ fontSize: "0.62rem", color: TT }}>#{selected.id} · {selected.city}, {selected.state} · {selected.type}</span>
            </div>
          ) : (
            <span style={{ fontSize: "0.80rem", color: TT }}>Search accounts by name, city, or type…</span>
          )}
        </div>
        {selected ? (
          <span onClick={handleClear} style={{ color: TT, flexShrink: 0, cursor: "pointer", padding: 2, lineHeight: 0, display: "flex" }}>
            <X size={13} />
          </span>
        ) : (
          <ChevronDown size={13} color={TT} style={{ flexShrink: 0, transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.15s" }} />
        )}
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 2px)", left: 0, right: 0,
          background: "white", border: `1px solid ${BD}`,
          boxShadow: "0 8px 28px rgba(0,0,0,0.14)", zIndex: 300,
        }}>
          <div style={{ padding: "8px 10px", borderBottom: `1px solid ${BDL}`, position: "relative" }}>
            <Search size={13} color={TT} style={{ position: "absolute", left: 20, top: "50%", transform: "translateY(-50%)" }} />
            <input
              ref={inputRef}
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, city, state, type…"
              style={{
                width: "100%", boxSizing: "border-box",
                paddingLeft: 28, paddingRight: 8, paddingTop: 6, paddingBottom: 6,
                border: `1px solid ${BD}`, fontSize: "0.78rem", fontFamily: font,
                outline: "none", color: TD,
              }}
              onFocus={e => { e.currentTarget.style.borderColor = N; }}
              onBlur={e => { e.currentTarget.style.borderColor = BD; }}
            />
            {search && (
              <button type="button" onClick={() => setSearch("")} style={{ position: "absolute", right: 18, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer" }}>
                <X size={11} color={TT} />
              </button>
            )}
          </div>

          <div style={{ maxHeight: 280, overflowY: "auto" }}>
            {filtered.length === 0 ? (
              <div style={{ padding: "16px", textAlign: "center", fontSize: "0.78rem", color: TT }}>No accounts found</div>
            ) : filtered.map(a => {
              const isSelected = a.id === value;
              return (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => handleSelect(a)}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", gap: 10,
                    padding: "10px 14px", border: "none", textAlign: "left",
                    background: isSelected ? `${N}10` : "transparent",
                    cursor: "pointer", fontFamily: font, borderBottom: `1px solid ${BDL}`,
                  }}
                  onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = "#F4F6FA"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = isSelected ? `${N}10` : "transparent"; }}
                >
                  <div style={{
                    width: 32, height: 32, flexShrink: 0, display: "flex",
                    alignItems: "center", justifyContent: "center",
                    background: isSelected ? `${N}15` : TH,
                    border: `1px solid ${isSelected ? N + "30" : BDL}`,
                  }}>
                    <Building2 size={13} color={isSelected ? N : TT} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: "0.80rem", fontWeight: isSelected ? 700 : 500, color: isSelected ? N : TD, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {a.name}
                    </div>
                    <div style={{ fontSize: "0.64rem", color: TT, marginTop: 1 }}>
                      #{a.id} &nbsp;·&nbsp; {a.city}, {a.state} &nbsp;·&nbsp; {a.type}
                    </div>
                  </div>
                  {isSelected && <Check size={13} color={N} style={{ flexShrink: 0 }} />}
                </button>
              );
            })}
          </div>

          <div style={{ padding: "6px 12px", background: TH, borderTop: `1px solid ${BDL}` }}>
            <span style={{ fontSize: "0.62rem", color: TT }}>{filtered.length} account{filtered.length !== 1 ? "s" : ""} · Type to filter</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Multi-Select Product Line Dropdown ─────────────────────────────────────────
function ProductMultiSelect({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggle = (p: string) => {
    onChange(value.includes(p) ? value.filter(v => v !== p) : [...value, p]);
  };

  const removeOne = (p: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(value.filter(v => v !== p));
  };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        style={{
          width: "100%", minHeight: 40, display: "flex", alignItems: "flex-start", flexWrap: "wrap", gap: 4,
          padding: "7px 11px", border: `1px solid ${open ? N : BD}`,
          background: "white", cursor: "pointer", fontFamily: font, textAlign: "left",
        }}
      >
        {value.length === 0 ? (
          <span style={{ fontSize: "0.80rem", color: TT, lineHeight: "22px" }}>Select one or more products…</span>
        ) : (
          value.map(p => {
            const grp = PRODUCT_GROUPS.find(g => g.products.includes(p));
            const c   = grp?.color ?? N;
            return (
              <span key={p} style={{
                display: "inline-flex", alignItems: "center", gap: 4,
                padding: "2px 8px", background: `${c}12`, border: `1px solid ${c}30`,
                fontSize: "0.70rem", fontWeight: 600, color: c,
              }}>
                {grp && <span style={{ fontSize: "0.58rem", fontWeight: 800, opacity: 0.75 }}>{grp.abbr}</span>}
                {p}
                <span onClick={e => removeOne(p, e)} style={{ cursor: "pointer", lineHeight: 0 }}>
                  <X size={10} color={c} />
                </span>
              </span>
            );
          })
        )}
        <div style={{ marginLeft: "auto", alignSelf: "center", paddingLeft: 4 }}>
          <ChevronDown size={13} color={TT} style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.15s" }} />
        </div>
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 2px)", left: 0, right: 0,
          background: "white", border: `1px solid ${BD}`,
          boxShadow: "0 8px 24px rgba(0,0,0,0.12)", zIndex: 300,
          maxHeight: 300, overflowY: "auto",
        }}>
          <div style={{ padding: "6px 12px", background: TH, borderBottom: `1px solid ${BDL}` }}>
            <span style={{ fontSize: "0.62rem", fontWeight: 700, color: TT, textTransform: "uppercase", letterSpacing: "0.07em" }}>
              {value.length} selected · click to toggle
            </span>
          </div>
          {PRODUCT_GROUPS.map(grp => (
            <div key={grp.abbr}>
              {/* Group header */}
              <div style={{
                padding: "5px 14px", background: `${grp.color}10`,
                borderBottom: `1px solid ${BDL}`, borderTop: `1px solid ${BDL}`,
                display: "flex", alignItems: "center", gap: 8,
              }}>
                <span style={{
                  fontSize: "0.58rem", fontWeight: 800, color: grp.color,
                  background: `${grp.color}18`, border: `1px solid ${grp.color}40`,
                  padding: "1px 6px", letterSpacing: "0.07em",
                }}>{grp.abbr}</span>
                <span style={{ fontSize: "0.63rem", fontWeight: 700, color: grp.color, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  {grp.group}
                </span>
              </div>
              {/* Products */}
              {grp.products.map((p, pi) => {
                const active = value.includes(p);
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => toggle(p)}
                    style={{
                      width: "100%", display: "flex", alignItems: "center", gap: 10,
                      padding: "8px 14px 8px 20px", border: "none", textAlign: "left",
                      background: active ? `${grp.color}08` : "transparent",
                      cursor: "pointer", fontFamily: font,
                      borderBottom: pi < grp.products.length - 1 ? `1px solid ${BDL}` : "none",
                    }}
                    onMouseEnter={e => { if (!active) e.currentTarget.style.background = "#F4F6FA"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = active ? `${grp.color}08` : "transparent"; }}
                  >
                    <div style={{
                      width: 15, height: 15, flexShrink: 0,
                      background: active ? grp.color : "white",
                      border: `2px solid ${active ? grp.color : BD}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "all 0.13s",
                    }}>
                      {active && <Check size={9} color="white" strokeWidth={3} />}
                    </div>
                    <span style={{ fontSize: "0.78rem", color: active ? grp.color : TM, fontWeight: active ? 700 : 400 }}>{p}</span>
                  </button>
                );
              })}
            </div>
          ))}
          {value.length > 0 && (
            <div style={{ padding: "6px 12px", background: TH, borderTop: `1px solid ${BDL}` }}>
              <button
                type="button"
                onClick={() => onChange([])}
                style={{ fontSize: "0.64rem", fontWeight: 700, color: "#B91C1C", background: "none", border: "none", cursor: "pointer", fontFamily: font }}
              >
                Clear all selections
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Broker Contact Dropdown ────────────────────────────────────────────────────
function BrokerContactDropdown({
  brokerage, value, onChange,
}: {
  brokerage: string;
  value: string;
  onChange: (contact: BrokerContact | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = BROKER_CONTACTS.find(b => b.id === value);

  const filtered = brokerage
    ? BROKER_CONTACTS.filter(b => b.brokerage === brokerage)
    : BROKER_CONTACTS;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
    setOpen(false);
  };

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        style={{
          width: "100%", display: "flex", alignItems: "center", gap: 8,
          padding: "9px 11px", border: `1px solid ${open ? N : BD}`,
          background: "white", cursor: "pointer", fontFamily: font, textAlign: "left",
        }}
      >
        <User size={13} color={TT} style={{ flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          {selected ? (
            <div>
              <span style={{ fontSize: "0.80rem", color: TD, fontWeight: 600, display: "block" }}>{selected.name}</span>
              <span style={{ fontSize: "0.62rem", color: TT }}>{selected.role} · {selected.brokerage}</span>
            </div>
          ) : (
            <span style={{ fontSize: "0.80rem", color: TT }}>
              {brokerage ? `Select contact from ${brokerage.split(",")[0]}…` : "Select a broker contact…"}
            </span>
          )}
        </div>
        {selected ? (
          <span onClick={handleClear} style={{ color: TT, flexShrink: 0, cursor: "pointer", padding: 2, lineHeight: 0, display: "flex" }}>
            <X size={13} />
          </span>
        ) : (
          <ChevronDown size={13} color={TT} style={{ flexShrink: 0, transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.15s" }} />
        )}
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 2px)", left: 0, right: 0,
          background: "white", border: `1px solid ${BD}`,
          boxShadow: "0 8px 24px rgba(0,0,0,0.12)", zIndex: 300,
          maxHeight: 280, overflowY: "auto",
        }}>
          {!brokerage && (
            <div style={{ padding: "6px 12px", background: "#FFF8E6", borderBottom: `1px solid ${BDL}` }}>
              <span style={{ fontSize: "0.62rem", color: "#8A5C00" }}>
                💡 Select a Brokerage first to filter contacts
              </span>
            </div>
          )}
          {filtered.length === 0 ? (
            <div style={{ padding: "14px", textAlign: "center", fontSize: "0.78rem", color: TT }}>
              No contacts for selected brokerage
            </div>
          ) : filtered.map(b => {
            const isSelected = b.id === value;
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => { onChange(b); setOpen(false); }}
                style={{
                  width: "100%", display: "flex", alignItems: "center", gap: 10,
                  padding: "10px 14px", border: "none", textAlign: "left",
                  background: isSelected ? `${N}10` : "transparent",
                  cursor: "pointer", fontFamily: font, borderBottom: `1px solid ${BDL}`,
                }}
                onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = "#F4F6FA"; }}
                onMouseLeave={e => { e.currentTarget.style.background = isSelected ? `${N}10` : "transparent"; }}
              >
                <div style={{
                  width: 32, height: 32, flexShrink: 0, display: "flex",
                  alignItems: "center", justifyContent: "center",
                  background: isSelected ? `${N}15` : TH,
                  border: `1px solid ${isSelected ? N + "30" : BDL}`,
                }}>
                  <User size={13} color={isSelected ? N : TT} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "0.80rem", fontWeight: isSelected ? 700 : 500, color: isSelected ? N : TD }}>{b.name}</div>
                  <div style={{ fontSize: "0.63rem", color: TT, marginTop: 1 }}>{b.role} · {b.brokerage}</div>
                </div>
                {isSelected && <Check size={13} color={N} style={{ flexShrink: 0 }} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Brokerage Select ───────────────────────────────────────────────────────────
function BrokerageDropdown({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        style={{
          width: "100%", display: "flex", alignItems: "center", gap: 8,
          padding: "9px 11px", border: `1px solid ${open ? N : BD}`,
          background: "white", cursor: "pointer", fontFamily: font, textAlign: "left",
        }}
      >
        <Building2 size={13} color={TT} style={{ flexShrink: 0 }} />
        <span style={{ flex: 1, fontSize: "0.80rem", color: value ? TD : TT, fontWeight: value ? 600 : 400 }}>
          {value || "Select a brokerage…"}
        </span>
        {value ? (
          <span onClick={e => { e.stopPropagation(); onChange(""); }} style={{ color: TT, flexShrink: 0, cursor: "pointer", padding: 2, lineHeight: 0, display: "flex" }}>
            <X size={13} />
          </span>
        ) : (
          <ChevronDown size={13} color={TT} style={{ flexShrink: 0, transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.15s" }} />
        )}
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 2px)", left: 0, right: 0,
          background: "white", border: `1px solid ${BD}`,
          boxShadow: "0 8px 24px rgba(0,0,0,0.12)", zIndex: 300,
          maxHeight: 280, overflowY: "auto",
        }}>
          {BROKERAGES.map(b => {
            const isSelected = b === value;
            const contactCount = BROKER_CONTACTS.filter(c => c.brokerage === b).length;
            return (
              <button
                key={b}
                type="button"
                onClick={() => { onChange(b); setOpen(false); }}
                style={{
                  width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "10px 14px", border: "none", textAlign: "left",
                  background: isSelected ? `${N}10` : "transparent",
                  cursor: "pointer", fontFamily: font, borderBottom: `1px solid ${BDL}`,
                }}
                onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = "#F4F6FA"; }}
                onMouseLeave={e => { e.currentTarget.style.background = isSelected ? `${N}10` : "transparent"; }}
              >
                <span style={{ fontSize: "0.80rem", color: isSelected ? N : TM, fontWeight: isSelected ? 700 : 400 }}>{b}</span>
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: "0.64rem", color: TT }}>{contactCount} contact{contactCount !== 1 ? "s" : ""}</span>
                  {isSelected && <Check size={12} color={N} />}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Stage Dropdown ─────────────────────────────────────────────────────────────
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
    <div ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "9px 11px", border: `1px solid ${open ? N : BD}`, background: "white", cursor: "pointer", fontFamily: font, textAlign: "left" }}
      >
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: "0.60rem", color: TT, display: "block", lineHeight: 1 }}>{group}</span>
          <span style={{ fontSize: "0.80rem", color: TD, fontWeight: 600 }}>{value}</span>
        </div>
        <ChevronDown size={14} color={TT} style={{ flexShrink: 0, transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.15s" }} />
      </button>

      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 2px)", left: 0, right: 0, background: "white", border: `1px solid ${BD}`, boxShadow: "0 8px 24px rgba(0,0,0,0.12)", zIndex: 300, maxHeight: 340, overflowY: "auto" }}>
          {STAGE_GROUPS.map(g => (
            <div key={g.group}>
              <div style={{ padding: "7px 12px 4px", background: "#F8FAFC", borderBottom: `1px solid ${BDL}`, borderTop: `1px solid ${BDL}` }}>
                <span style={{ fontSize: "0.58rem", fontWeight: 800, color: g.color, textTransform: "uppercase", letterSpacing: "0.08em" }}>{g.group}</span>
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

// ── Document Upload / Management Component ─────────────────────────────────────
function DocumentsSection({ docs, onChange }: { docs: UploadedDoc[]; onChange: (d: UploadedDoc[]) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [editCat, setEditCat] = useState<string | null>(null);

  const addFile = (file: File) => {
    const kb = file.size / 1024;
    const sizeStr = kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${Math.round(kb)} KB`;
    onChange([...docs, { id: Date.now().toString(), name: file.name, size: sizeStr, category: "Application Form", uploadedAt: "Just now" }]);
  };

  const removeDoc = (id: string) => onChange(docs.filter(d => d.id !== id));
  const updateCategory = (id: string, cat: string) => { onChange(docs.map(d => d.id === id ? { ...d, category: cat } : d)); setEditCat(null); };
  const handleDrop = (e: React.DragEvent) => { e.preventDefault(); setDragOver(false); Array.from(e.dataTransfer.files).forEach(addFile); };
  const extColor = (name: string) => { const e = name.split(".").pop()?.toLowerCase(); return e === "pdf" ? "#B91C1C" : e === "docx" || e === "doc" ? "#1D6EA8" : e === "xlsx" || e === "xls" ? "#1A7A4A" : TT; };
  const ext = (name: string) => name.split(".").pop()?.toUpperCase() ?? "FILE";

  return (
    <div style={{ background: "white", border: `1px solid ${BD}`, borderTop: `3px solid ${N}` }}>
      <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: `1px solid ${BDL}`, background: TH }}>
        <div className="flex items-center gap-2">
          <h3 style={{ fontSize: "0.78rem", fontWeight: 800, color: N, textTransform: "uppercase", letterSpacing: "0.07em" }}>Submission Documents</h3>
          {docs.length > 0 && <span style={{ fontSize: "0.62rem", fontWeight: 700, color: "white", background: N, padding: "1px 7px" }}>{docs.length}</span>}
        </div>
        <button type="button" onClick={() => fileRef.current?.click()}
          className="flex items-center gap-1.5 px-3 py-1.5 hover:brightness-95 transition-all"
          style={{ background: N, color: "white", border: "none", cursor: "pointer", fontSize: "0.70rem", fontWeight: 700, fontFamily: font }}>
          <Plus size={11} /> Add Document
        </button>
      </div>

      <div className="p-5 space-y-3">
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          style={{ border: `2px dashed ${dragOver ? N : BDL}`, background: dragOver ? `${N}06` : "#FAFBFC", padding: "14px", textAlign: "center", cursor: "pointer", transition: "all 0.18s" }}>
          <div className="flex items-center justify-center gap-2.5">
            <Paperclip size={14} color={dragOver ? N : TT} />
            <span style={{ fontSize: "0.76rem", color: dragOver ? N : TT, fontWeight: 600 }}>Drop files here or click to browse</span>
          </div>
          <p style={{ fontSize: "0.62rem", color: TT, marginTop: 4 }}>PDF, DOCX, XLSX, PNG · Max 25 MB per file</p>
        </div>
        <input ref={fileRef} type="file" multiple accept=".pdf,.docx,.xlsx,.png,.jpg,.jpeg" style={{ display: "none" }}
          onChange={e => Array.from(e.target.files ?? []).forEach(addFile)} />

        {docs.length > 0 && (
          <div style={{ border: `1px solid ${BDL}` }}>
            {docs.map((doc, i) => (
              <div key={doc.id} className="flex items-center gap-3 px-4 py-3"
                style={{ borderBottom: i < docs.length - 1 ? `1px solid ${BDL}` : "none", background: i % 2 === 0 ? "white" : "#FAFBFC" }}>
                <div style={{ width: 36, height: 36, flexShrink: 0, background: `${extColor(doc.name)}12`, border: `1px solid ${extColor(doc.name)}25`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: "0.52rem", fontWeight: 900, color: extColor(doc.name), letterSpacing: "0.02em" }}>{ext(doc.name)}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: "0.76rem", fontWeight: 600, color: TD, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{doc.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span style={{ fontSize: "0.62rem", color: TT }}>{doc.size}</span>
                    <span style={{ color: BDL }}>·</span>
                    {editCat === doc.id ? (
                      <select value={doc.category} onChange={e => updateCategory(doc.id, e.target.value)} onBlur={() => setEditCat(null)} autoFocus
                        style={{ fontSize: "0.62rem", color: N, fontFamily: font, border: `1px solid ${N}`, background: "white", padding: "1px 4px", cursor: "pointer" }}>
                        {DOC_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    ) : (
                      <button type="button" onClick={() => setEditCat(doc.id)}
                        style={{ fontSize: "0.62rem", color: N, fontWeight: 600, background: `${N}10`, border: `1px solid ${N}25`, padding: "1px 6px", cursor: "pointer", fontFamily: font }}>
                        {doc.category}
                      </button>
                    )}
                    <span style={{ color: BDL }}>·</span>
                    <span style={{ fontSize: "0.60rem", color: TT }}>{doc.uploadedAt}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button type="button" title="Preview" className="p-1.5 hover:bg-slate-100 transition-colors"
                    style={{ border: "none", background: "none", cursor: "pointer", color: TT }}><Eye size={13} /></button>
                  <button type="button" title="Remove" className="p-1.5 hover:bg-red-50 transition-colors"
                    style={{ border: "none", background: "none", cursor: "pointer", color: "#B91C1C" }}
                    onClick={() => removeDoc(doc.id)}><Trash2 size={13} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
        {docs.length === 0 && (
          <p style={{ fontSize: "0.72rem", color: TT, textAlign: "center", padding: "4px 0" }}>
            No documents attached yet · Drag &amp; drop or click above to add
          </p>
        )}
      </div>
    </div>
  );
}

// ── Section Card ───────────────────────────────────────────────────────────────
function SectionCard({ title, accent = N, children, badge, locked, lockedLabel = "Auto-populated" }: {
  title: string; accent?: string; children: React.ReactNode; badge?: string; locked?: boolean; lockedLabel?: string;
}) {
  return (
    <div style={{ background: "white", border: `1px solid ${BD}`, borderTop: `3px solid ${accent}` }}>
      <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: `1px solid ${BDL}`, background: TH }}>
        <h3 style={{ fontSize: "0.78rem", fontWeight: 800, color: N, textTransform: "uppercase", letterSpacing: "0.07em" }}>{title}</h3>
        {locked ? (
          <div className="flex items-center gap-1.5 px-2.5 py-1" style={{ background: `${N}0A`, border: `1px solid ${N}25` }}>
            <Lock size={10} color={N} />
            <span style={{ fontSize: "0.60rem", fontWeight: 700, color: N, textTransform: "uppercase", letterSpacing: "0.06em" }}>{lockedLabel}</span>
          </div>
        ) : badge ? (
          <span style={{ fontSize: "0.60rem", fontWeight: 700, color: TT, background: BDL, padding: "2px 8px" }}>{badge}</span>
        ) : null}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

// ── Read-Only Display Field (for locked / auto-populated fields) ───────────────
function ReadOnlyDisplayField({ value, subtitle, icon }: {
  value: string; subtitle?: string; icon?: React.ReactNode;
}) {
  const isEmpty = !value;
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 9,
      padding: "9px 11px", border: `1px solid ${BDL}`,
      background: isEmpty ? "#FAFBFC" : "#F4F6FA", cursor: "default",
    }}>
      {icon && <span style={{ color: isEmpty ? BDL : TT, flexShrink: 0 }}>{icon}</span>}
      <div style={{ flex: 1, minWidth: 0 }}>
        {isEmpty ? (
          <span style={{ fontSize: "0.78rem", color: BDL, fontStyle: "italic" }}>
            Select an account above
          </span>
        ) : subtitle ? (
          <>
            <span style={{ fontSize: "0.80rem", color: TM, fontWeight: 600, display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {value}
            </span>
            <span style={{ fontSize: "0.62rem", color: TT }}>{subtitle}</span>
          </>
        ) : (
          <span style={{ fontSize: "0.80rem", color: TM, fontWeight: 600, display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {value}
          </span>
        )}
      </div>
      <Lock size={11} color={isEmpty ? BDL : TT} style={{ flexShrink: 0 }} />
    </div>
  );
}

// ── Inline Select (for UW team selects) ───────────────────────────────────────
function InlineSelect({ value, onChange, options, placeholder }: {
  value: string;
  onChange: (v: string) => void;
  options: { id: string; name: string; title: string }[];
  placeholder: string;
}) {
  return (
    <div style={{ position: "relative" }}>
      <div style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", zIndex: 1 }}>
        <User size={13} color={TT} />
      </div>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          width: "100%", boxSizing: "border-box",
          paddingLeft: 32, paddingRight: 32, paddingTop: 9, paddingBottom: 9,
          border: `1px solid ${BD}`, background: "white",
          color: value ? TD : TT,
          fontSize: "0.80rem", fontFamily: font, outline: "none",
          appearance: "none", cursor: "pointer",
        }}
        onFocus={e => { e.currentTarget.style.borderColor = N; }}
        onBlur={e => { e.currentTarget.style.borderColor = BD; }}
      >
        <option value="">{placeholder}</option>
        {options.map(o => (
          <option key={o.id} value={o.id}>{o.name} — {o.title}</option>
        ))}
      </select>
      <div style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
        <ChevronDown size={13} color={TT} />
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export function NewSubmissionPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const role: RoleId = user?.roleId ?? "sr-uw";

  const [form, setForm]     = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [docs, setDocs]     = useState<UploadedDoc[]>([]);

  const [aiFile, setAiFile]           = useState<File | null>(null);
  const [aiStatus, setAiStatus]       = useState<"idle" | "processing" | "done">("idle");
  const [aiDragOver, setAiDragOver]   = useState(false);
  const aiInputRef                    = useRef<HTMLInputElement>(null);

  const handleAiFile = (file: File) => {
    setAiFile(file);
    setAiStatus("processing");
    setTimeout(() => setAiStatus("done"), 2200);
  };

  // Auto-set expiry when effective date changes
  useEffect(() => {
    if (form.effectiveDate) {
      const d = new Date(form.effectiveDate);
      d.setFullYear(d.getFullYear() + 1);
      setForm(f => ({ ...f, expirationDate: d.toISOString().split("T")[0] }));
    }
  }, [form.effectiveDate]);

  // ── Auto-populate Brokerage, Broker Contact, UW Team on account select ──────
  const handleAccountChange = (id: string, name: string) => {
    const defaults = ACCOUNT_DEFAULTS[id];
    if (defaults) {
      const contact = BROKER_CONTACTS.find(b => b.id === defaults.brokerContactId);
      setForm(f => ({
        ...f,
        accountId: id,
        accountName: name,
        brokerage: defaults.brokerage,
        brokerContactId: defaults.brokerContactId,
        brokerName: contact?.name ?? "",
        brokerEmail: contact?.email ?? "",
        brokerPhone: contact?.phone ?? "",
        underwriterId: defaults.underwriterId,
        uwSpecialistId: defaults.uwSpecialistId,
      }));
    } else {
      setForm(f => ({ ...f, accountId: id, accountName: name }));
    }
    if (errors.accountId) setErrors(e => ({ ...e, accountId: undefined }));
  };

  const handleBrokerContactChange = (contact: BrokerContact | null) => {
    if (contact) {
      setForm(f => ({
        ...f,
        brokerContactId: contact.id,
        brokerName: contact.name,
        brokerEmail: contact.email,
        brokerPhone: contact.phone,
      }));
    } else {
      setForm(f => ({ ...f, brokerContactId: "", brokerName: "", brokerEmail: "", brokerPhone: "" }));
    }
  };

  // When brokerage is manually changed, clear contact
  useEffect(() => {
    // Only clear if brokerage changed and the current contact doesn't belong to it
    const currentContact = BROKER_CONTACTS.find(b => b.id === form.brokerContactId);
    if (currentContact && form.brokerage && currentContact.brokerage !== form.brokerage) {
      setForm(f => ({ ...f, brokerContactId: "", brokerName: "", brokerEmail: "", brokerPhone: "" }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.brokerage]);

  // ── Required field tracking for progress bar ────────────────────────────────
  const REQ_FIELDS = [
    { key: "accountId" as keyof FormState,    label: "Account" },
    { key: "productLines" as keyof FormState, label: "Products" },
    { key: "needByDate" as keyof FormState,   label: "Need By Date" },
    { key: "effectiveDate" as keyof FormState,label: "Effective Date" },
  ];
  const filledCount = useMemo(() => {
    return REQ_FIELDS.filter(f => {
      const v = form[f.key];
      return Array.isArray(v) ? (v as string[]).length > 0 : !!v;
    }).length;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.accountId, form.productLines, form.needByDate, form.effectiveDate]);
  const allRequired = filledCount === REQ_FIELDS.length;

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm(f => ({ ...f, [key]: value }));
    if (errors[key as string]) setErrors(e => ({ ...e, [key]: undefined }));
  };

  const validate = () => {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!form.accountId)              e.accountId    = "Required";
    if (form.productLines.length === 0) e.productLines = "Required";
    if (!form.needByDate)             e.needByDate   = "Required";
    if (!form.effectiveDate)          e.effectiveDate = "Required";
    return e;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setSubmitting(true);
    setTimeout(() => navigate("/submission/SUB-7829"), 900);
  };

  const typeColor = (id: SubmissionType) =>
    id === "New Business" ? N : "#7B2FBE";

  const stageCol = stageColor(form.stage);

  return (
    <AppShell activePage="submissions" role={role} onRoleChange={() => {}}>
      <div style={{ fontFamily: font, color: TD }}>

        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

        {/* ── HEADER ──────────────────────────────────────────────────────── */}
        <div style={{ background: N }}>
          <div style={{ height: 4, background: `linear-gradient(90deg,${G} 0%,#A8841C 100%)` }} />
          <div className="px-8 py-5 flex items-center gap-4">
            <button onClick={() => navigate("/submissions")} className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.78rem", fontWeight: 600 }}>
              <ArrowLeft size={14} /> Submissions
            </button>
            <ChevronRight size={14} color="rgba(255,255,255,0.3)" />
            <div>
              <h1 style={{ fontSize: "1.20rem", fontWeight: 800, color: "white", lineHeight: 1.2 }}>Create New Submission</h1>
              <p style={{ fontSize: "0.76rem", color: "rgba(255,255,255,0.5)", marginTop: 2 }}>
                Initiate the underwriting process · Complete all required fields
              </p>
            </div>
          </div>
        </div>

        {/* ── BREADCRUMB ───────────────────────────────────────────────────── */}
        <div className="flex items-center gap-2 px-8 py-2.5" style={{ background: "white", borderBottom: `1px solid ${BDL}` }}>
          <button onClick={() => navigate("/")} className="hover:underline" style={{ fontSize: "0.75rem", color: TT }}>Dashboard</button>
          <span style={{ color: BD, fontSize: "0.75rem" }}>/</span>
          <button onClick={() => navigate("/submissions")} className="hover:underline" style={{ fontSize: "0.75rem", color: TT }}>Submissions</button>
          <span style={{ color: BD, fontSize: "0.75rem" }}>/</span>
          <span style={{ fontSize: "0.75rem", color: N, fontWeight: 600 }}>New Submission</span>
        </div>

        {/* ── FORM ────────────────────────────────────────────────────────── */}
        <form onSubmit={handleSubmit}>
          <div className="px-8 py-6 pb-10" style={{ background: "#EEF1F6", minHeight: 600 }}>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

              {/* ── LEFT (main form) ─────────────────────────────────────── */}
              <div className="lg:col-span-2 space-y-5">

                {/* Submission Type */}
                <SectionCard title="New Submission Type" accent={N}>
                  <div className="grid grid-cols-2 gap-3">
                    {SUB_TYPES.map(t => {
                      const active = form.submissionType === t.id;
                      const c = typeColor(t.id);
                      return (
                        <button key={t.id} type="button" onClick={() => set("submissionType", t.id)}
                          style={{ padding: "12px 14px", textAlign: "left", border: `1.5px solid ${active ? c : BDL}`, background: active ? `${c}08` : "white", cursor: "pointer", transition: "all 0.15s" }}>
                          <div style={{ width: 28, height: 28, marginBottom: 8, background: active ? `${c}15` : "#F0F3F8", border: `1px solid ${active ? `${c}40` : BDL}`, display: "flex", alignItems: "center", justifyContent: "center", color: active ? c : TT }}>
                            {t.icon}
                          </div>
                          <div style={{ fontSize: "0.78rem", fontWeight: 700, color: active ? c : TD, marginBottom: 2 }}>{t.label}</div>
                          <div style={{ fontSize: "0.63rem", color: TT, lineHeight: 1.4 }}>{t.desc}</div>
                          {active && (
                            <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 4, fontSize: "0.60rem", fontWeight: 700, color: c, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                              <Check size={10} /> Selected
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </SectionCard>

                {/* AI Auto-Fill */}
                <SectionCard title="AI Auto-Fill" accent={N}>
                  <input
                    ref={aiInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.xlsx,.csv"
                    style={{ display: "none" }}
                    onChange={e => { const f = e.target.files?.[0]; if (f) handleAiFile(f); }}
                  />

                  {aiStatus === "idle" && (
                    <div
                      onDragOver={e => { e.preventDefault(); setAiDragOver(true); }}
                      onDragLeave={() => setAiDragOver(false)}
                      onDrop={e => { e.preventDefault(); setAiDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleAiFile(f); }}
                      onClick={() => aiInputRef.current?.click()}
                      style={{
                        border: `2px dashed ${aiDragOver ? N : BDL}`,
                        background: aiDragOver ? "#EEF1FF" : "#F8FAFC",
                        padding: "28px 20px",
                        textAlign: "center",
                        cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>
                        <div style={{ width: 40, height: 40, background: `${N}12`, border: `1px solid ${N}30`, display: "flex", alignItems: "center", justifyContent: "center", color: N }}>
                          <UploadCloud size={20} />
                        </div>
                      </div>
                      <p style={{ fontSize: "0.80rem", fontWeight: 700, color: TD, marginBottom: 4 }}>
                        Drop your submission document here
                      </p>
                      <p style={{ fontSize: "0.70rem", color: TT, marginBottom: 12 }}>
                        PDF, Word, Excel or CSV — the AI will extract and fill the form fields automatically
                      </p>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 16px", background: N, color: "white", fontSize: "0.72rem", fontWeight: 700, cursor: "pointer" }}>
                        <Sparkles size={12} /> Choose File
                      </div>
                    </div>
                  )}

                  {aiStatus === "processing" && (
                    <div style={{ padding: "28px 20px", textAlign: "center", background: "#F8FAFC", border: `1px solid ${BDL}` }}>
                      <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
                        <div style={{ width: 40, height: 40, background: `${N}12`, border: `1px solid ${N}30`, display: "flex", alignItems: "center", justifyContent: "center", color: N, animation: "spin 1.2s linear infinite" }}>
                          <Sparkles size={18} />
                        </div>
                      </div>
                      <p style={{ fontSize: "0.80rem", fontWeight: 700, color: TD, marginBottom: 4 }}>Analysing document…</p>
                      <p style={{ fontSize: "0.70rem", color: TT }}>{aiFile?.name}</p>
                      <div style={{ marginTop: 14, height: 4, background: BDL, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: "60%", background: N, animation: "pulse 1.2s ease-in-out infinite" }} />
                      </div>
                    </div>
                  )}

                  {aiStatus === "done" && (
                    <div style={{ border: `1px solid ${BDL}`, background: "#F8FAFC" }}>
                      <div style={{ padding: "14px 16px", borderBottom: `1px solid ${BDL}`, display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 28, height: 28, background: "#DCFCE7", border: "1px solid #86EFAC", display: "flex", alignItems: "center", justifyContent: "center", color: "#16A34A", flexShrink: 0 }}>
                          <Check size={14} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: "0.78rem", fontWeight: 700, color: TD }}>Fields extracted from {aiFile?.name}</p>
                          <p style={{ fontSize: "0.65rem", color: TT }}>Review the pre-filled values below before submitting</p>
                        </div>
                        <button type="button" onClick={() => { setAiFile(null); setAiStatus("idle"); }}
                          style={{ background: "none", border: "none", cursor: "pointer", color: TT, padding: 2 }}>
                          <X size={14} />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-0" style={{ padding: "12px 16px 14px", gap: 8 }}>
                        {[
                          { label: "Account Name", value: "Riverside Unified School District" },
                          { label: "Effective Date", value: "09/01/2025" },
                          { label: "Product(s)", value: "General Liability, Property" },
                          { label: "Need By Date", value: "08/15/2025" },
                        ].map(row => (
                          <div key={row.label} style={{ padding: "7px 10px", background: "white", border: `1px solid ${BDL}` }}>
                            <p style={{ fontSize: "0.60rem", color: TT, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>{row.label}</p>
                            <p style={{ fontSize: "0.75rem", fontWeight: 600, color: TD }}>{row.value}</p>
                          </div>
                        ))}
                      </div>
                      <div style={{ padding: "0 16px 14px" }}>
                        <button type="button"
                          style={{ width: "100%", padding: "8px", background: N, color: "white", border: "none", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                          <Sparkles size={12} /> Apply to Form
                        </button>
                      </div>
                    </div>
                  )}
                </SectionCard>

                {/* Account (renamed from Account & Identity) */}
                <SectionCard title="Account" accent={N}>
                  <div className="grid grid-cols-1 gap-4">
                    {/* Account Name — searchable dropdown */}
                    <div>
                      <FieldLabel required>Account Name</FieldLabel>
                      <AccountDropdown value={form.accountId} onChange={handleAccountChange} />
                      {errors.accountId && <p style={{ fontSize: "0.62rem", color: "#B91C1C", marginTop: 4 }}>{errors.accountId}</p>}
                      {form.accountName && (
                        <p style={{ fontSize: "0.62rem", color: "#1A7A4A", marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
                          <Check size={10} /> Account #{form.accountId} resolved · Brokerage & team auto-populated
                        </p>
                      )}
                    </div>

                    {/* Product(s) */}
                    <div>
                      <FieldLabel required>Product(s)</FieldLabel>
                      <ProductMultiSelect value={form.productLines} onChange={v => set("productLines", v)} />
                      {errors.productLines && <p style={{ fontSize: "0.62rem", color: "#B91C1C", marginTop: 4 }}>{errors.productLines}</p>}
                      {form.productLines.length > 0 && (
                        <p style={{ fontSize: "0.60rem", color: TT, marginTop: 3 }}>{form.productLines.length} product{form.productLines.length > 1 ? "s" : ""} selected</p>
                      )}
                    </div>

                  </div>
                </SectionCard>

                {/* Policy */}
                <SectionCard title="Policy" accent={N}>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <FieldLabel required>Need By Date</FieldLabel>
                      <DatePickerInput value={form.needByDate} onChange={v => set("needByDate", v)} />
                      {errors.needByDate && <p style={{ fontSize: "0.62rem", color: "#B91C1C", marginTop: 4 }}>{errors.needByDate}</p>}
                    </div>
                    <div>
                      <FieldLabel required>Effective Date</FieldLabel>
                      <DatePickerInput value={form.effectiveDate} onChange={v => set("effectiveDate", v)} />
                      {errors.effectiveDate && <p style={{ fontSize: "0.62rem", color: "#B91C1C", marginTop: 4 }}>{errors.effectiveDate}</p>}
                    </div>
                    <div>
                      <FieldLabel>Expiration Date</FieldLabel>
                      <DatePickerInput value={form.expirationDate} onChange={v => set("expirationDate", v)} />
                      {form.effectiveDate && <p style={{ fontSize: "0.60rem", color: TT, marginTop: 3 }}>Auto-set to +1 year from effective</p>}
                    </div>
                  </div>

                </SectionCard>

                {/* Brokerage — always read-only, auto-populated from account */}
                <SectionCard
                  title="Brokerage"
                  accent={G}
                  locked={true}
                  lockedLabel={form.accountId ? "Auto-populated" : "Account Required"}
                >
                  <div className="grid grid-cols-1 gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <FieldLabel>Brokerage</FieldLabel>
                        <ReadOnlyDisplayField
                          value={form.brokerage}
                          icon={<Building2 size={13} />}
                        />
                      </div>
                      <div>
                        <FieldLabel>Broker Contact</FieldLabel>
                        <ReadOnlyDisplayField
                          value={form.brokerName}
                          subtitle={form.brokerName ? BROKER_CONTACTS.find(b => b.id === form.brokerContactId)?.role : undefined}
                          icon={<User size={13} />}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <FieldLabel>Broker Email</FieldLabel>
                        <ReadOnlyDisplayField
                          value={form.brokerEmail}
                          icon={<Mail size={13} />}
                        />
                      </div>
                      <div>
                        <FieldLabel>Broker Phone</FieldLabel>
                        <ReadOnlyDisplayField
                          value={form.brokerPhone}
                          icon={<Phone size={13} />}
                        />
                      </div>
                    </div>
                  </div>
                </SectionCard>

                {/* Underwriting Team — always read-only, auto-populated from account */}
                <SectionCard
                  title="Underwriting Team"
                  accent={N}
                  locked={true}
                  lockedLabel={form.accountId ? "Auto-populated" : "Account Required"}
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <FieldLabel>Underwriter</FieldLabel>
                      <ReadOnlyDisplayField
                        value={UNDERWRITERS.find(u => u.id === form.underwriterId)?.name || ""}
                        subtitle={form.underwriterId ? UNDERWRITERS.find(u => u.id === form.underwriterId)?.title : undefined}
                        icon={<User size={13} />}
                      />
                    </div>
                    <div>
                      <FieldLabel>Underwriting Specialist</FieldLabel>
                      <ReadOnlyDisplayField
                        value={UW_SPECIALISTS.find(s => s.id === form.uwSpecialistId)?.name || ""}
                        subtitle={form.uwSpecialistId ? UW_SPECIALISTS.find(s => s.id === form.uwSpecialistId)?.title : undefined}
                        icon={<User size={13} />}
                      />
                    </div>
                  </div>
                </SectionCard>

                {/* Notes */}
                <SectionCard title="Notes" accent={N}>
                  <div>
                    <FieldLabel>Internal Notes</FieldLabel>
                    <div style={{ position: "relative" }}>
                      <div style={{ position: "absolute", left: 11, top: 11, pointerEvents: "none", color: TT }}>
                        <MessageSquare size={13} />
                      </div>
                      <textarea
                        value={form.notes}
                        onChange={e => set("notes", e.target.value)}
                        placeholder="Add any internal notes, context, or observations for this submission…"
                        rows={5}
                        style={{
                          width: "100%", boxSizing: "border-box",
                          paddingLeft: 34, paddingRight: 11, paddingTop: 10, paddingBottom: 10,
                          border: `1px solid ${BD}`, background: "white", color: TD,
                          fontSize: "0.80rem", fontFamily: font, outline: "none",
                          resize: "vertical", lineHeight: 1.55, transition: "border-color 0.15s",
                        }}
                        onFocus={e => { e.currentTarget.style.borderColor = N; }}
                        onBlur={e => { e.currentTarget.style.borderColor = BD; }}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <p style={{ fontSize: "0.60rem", color: TT }}>
                        Notes are visible to all underwriting team members
                      </p>
                      <p style={{ fontSize: "0.60rem", color: TT }}>
                        {form.notes.length} characters
                      </p>
                    </div>
                  </div>
                </SectionCard>

                {/* Submission Documents */}
                <DocumentsSection docs={docs} onChange={setDocs} />

              </div>

              {/* ── RIGHT (stage + summary + actions) ───────────────────── */}
              <div className="space-y-5">

                {/* Submission Stage — now editable via dropdown */}
                <SectionCard title="Submission Stage" accent={N}>
                  {/* Stage Dropdown */}
                  <div className="mb-4">
                    <FieldLabel>Current Stage</FieldLabel>
                    <StageDropdown value={form.stage} onChange={v => set("stage", v)} />
                  </div>

                  {/* Stage badge */}
                  <div className="flex items-center gap-2 px-3 py-2 mb-4"
                    style={{ background: `${stageCol}12`, border: `1.5px solid ${stageCol}30` }}>
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: stageCol, flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <span style={{ fontSize: "0.60rem", color: TT, display: "block", lineHeight: 1 }}>{groupForStage(form.stage)}</span>
                      <span style={{ fontSize: "0.80rem", fontWeight: 700, color: stageCol }}>{form.stage}</span>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p style={{ fontSize: "0.58rem", fontWeight: 700, color: TT, textTransform: "uppercase", letterSpacing: "0.06em" }}>Fields</p>
                      <p style={{ fontSize: "1.00rem", fontWeight: 800, color: allRequired ? "#2E7D32" : N, lineHeight: 1 }}>
                        {filledCount}<span style={{ fontSize: "0.65rem", fontWeight: 400, color: TT }}>/{REQ_FIELDS.length}</span>
                      </p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div style={{ height: 5, background: BDL, marginBottom: 14, overflow: "hidden" }}>
                    <div style={{
                      height: "100%",
                      width: `${(filledCount / REQ_FIELDS.length) * 100}%`,
                      background: allRequired ? "#2E7D32" : N,
                      transition: "width 0.3s ease",
                    }} />
                  </div>

                  {/* Required field checklist */}
                  <div className="space-y-1.5">
                    {REQ_FIELDS.map(f => {
                      const v = form[f.key];
                      const done = Array.isArray(v) ? (v as string[]).length > 0 : !!v;
                      return (
                        <div key={f.key} className="flex items-center gap-2">
                          <div className="flex items-center justify-center shrink-0"
                            style={{ width: 16, height: 16, background: done ? "#E8F5EC" : TH, border: `1px solid ${done ? "#93C8A0" : BDL}` }}>
                            <span style={{ fontSize: 9, fontWeight: 800, color: done ? "#2E7D32" : TT }}>{done ? "✓" : "–"}</span>
                          </div>
                          <span style={{ fontSize: "0.72rem", color: done ? TD : TT, fontWeight: done ? 600 : 400 }}>{f.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </SectionCard>

                {/* Summary Preview */}
                <SectionCard title="Summary Preview" accent={G}>
                  <div className="space-y-3">
                    {[
                      { label: "Type",       value: form.submissionType },
                      { label: "Account",    value: form.accountName || "—" },
                      { label: "Products",   value: form.productLines.length > 0 ? `${form.productLines.length} selected` : "—" },
                      { label: "Need By",    value: form.needByDate || "—" },
                      { label: "Effective",  value: form.effectiveDate || "—" },
                      { label: "Brokerage",  value: form.brokerage ? form.brokerage.split(",")[0] : "—" },
                      { label: "Broker",     value: form.brokerName || "—" },
                      { label: "Stage",      value: form.stage },
                      { label: "Docs",       value: docs.length > 0 ? `${docs.length} attached` : "None" },
                    ].map(row => (
                      <div key={row.label} className="flex items-start justify-between gap-2">
                        <span style={{ fontSize: "0.64rem", fontWeight: 700, color: TT, textTransform: "uppercase", letterSpacing: "0.07em", flexShrink: 0 }}>{row.label}</span>
                        <span style={{ fontSize: "0.75rem", color: TD, fontWeight: 600, textAlign: "right", wordBreak: "break-word" }}>{row.value}</span>
                      </div>
                    ))}
                  </div>
                </SectionCard>

                {/* Required reminder */}
                <div className="p-4 flex items-start gap-2.5" style={{ background: "#FFF8E6", border: "1px solid #F0D88A" }}>
                  <AlertCircle size={14} color="#8A5C00" style={{ flexShrink: 0, marginTop: 1 }} />
                  <p style={{ fontSize: "0.72rem", color: "#7A4800", lineHeight: 1.55 }}>
                    <strong>Required:</strong> Account Name, Product(s), Need By Date, and Effective Date.
                  </p>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full flex items-center justify-center gap-2.5 py-3 transition-all active:scale-95"
                    style={{ background: submitting ? `${N}80` : N, color: "white", border: "none", cursor: submitting ? "default" : "pointer", fontSize: "0.85rem", fontWeight: 700, fontFamily: font }}
                  >
                    {submitting ? (
                      <><RefreshCw size={14} style={{ animation: "spin 0.7s linear infinite" }} /> Creating…</>
                    ) : (
                      <><Plus size={15} /> Create Submission</>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate("/submissions")}
                    className="w-full flex items-center justify-center gap-2 py-2.5 hover:bg-slate-50 transition-colors"
                    style={{ background: "white", border: `1px solid ${BD}`, color: TM, fontSize: "0.80rem", fontWeight: 600, fontFamily: font, cursor: "pointer" }}
                  >
                    <ArrowLeft size={13} /> Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
