import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, useLocation } from "react-router";
import {
  ArrowLeft, Plus, RefreshCw, ChevronDown, Check,
  Building2, Calendar, TrendingUp,
  User, Mail, Phone, FileText, ChevronRight,
  AlertCircle, AlertTriangle, X, Search, Lock,
  Paperclip, Trash2, Eye, MessageSquare,
  UploadCloud, Save, ClipboardCheck,
  Users, Sparkles, UserPlus,
} from "lucide-react";
import { AppShell } from "../components/AppShell";
import { PrimaryButton, RippleButton } from "../components/DashboardCards";
import { useAuth } from "../context/AuthContext";
import { useCompanion } from "../context/CompanionContext";
import type { RoleId } from "../components/AppShell";
import { PageRegister } from "../components/companion/PageRegister";
import { newId, now } from "../components/companion/CompanionContext";

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
  { id: "3001", name: "Brookfield Day School",                 city: "Westport",      state: "CT", type: "Private K-12" },
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
  "3001": { brokerage: "Gallagher Education, Inc.",  brokerContactId: "b2",  underwriterId: "u2", uwSpecialistId: "s2" },
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

// ── Submission kind (Individual vs Group) ──────────────────────────────────────
// A "Group" submission represents multiple member accounts on a single packet —
// e.g. a school district consortium, a charter network, a multi-campus risk
// pool. Each member can carry its own product mix, premium, and loss ratio, and
// rating/authority rules apply per-member-type as well as at the group level.
type SubmissionKind = "Individual" | "Group";

const KIND_TYPES: { id: SubmissionKind; label: string; icon: React.ReactNode; desc: string }[] = [
  { id: "Individual", label: "Individual Account",   icon: <User size={16}/>,  desc: "Single member account · one risk profile, one rule set" },
  { id: "Group",      label: "Group / Multi-Member", icon: <Users size={16}/>, desc: "Multiple members on one packet · per-member rating & rules" },
];

const MEMBER_TYPES = [
  "K-12 Public District",
  "K-12 Public School",
  "Charter School",
  "Private K-12",
  "4-Year University",
  "Community College",
  "Consortium",
  "Other",
] as const;
type MemberType = typeof MEMBER_TYPES[number];

interface GroupMember {
  id: string;
  name: string;
  memberType: MemberType;
  state: string;
  enrollment: number;
  productLines: string[];   // product abbreviations
  aiConfidence?: number;    // 0–100, populated by AI parse
  flag?: string;            // optional parse warning
}

interface AIRecognition {
  detectedKind: SubmissionKind;
  kindConfidence: number;      // 0–100
  memberCount: number;
  brokerCount: number;
  underwriterCount: number;
  accountTypes: string[];
  notes: string[];
}

const SAMPLE_PARSED_MEMBERS: GroupMember[] = [
  { id: "gm1", name: "Lincoln High School",     memberType: "K-12 Public School",   state: "TX", enrollment: 1240, productLines: ["GL", "Prop"],        aiConfidence: 96 },
  { id: "gm2", name: "Madison Academy",         memberType: "Charter School",       state: "TX", enrollment: 380,  productLines: ["GL"],                aiConfidence: 88 },
  { id: "gm3", name: "Pinegrove Elementary",    memberType: "K-12 Public School",   state: "TX", enrollment: 612,  productLines: ["GL", "Prop"],        aiConfidence: 94 },
  { id: "gm4", name: "Roosevelt Middle",        memberType: "K-12 Public School",   state: "TX", enrollment: 740,  productLines: ["GL", "Prop"],        aiConfidence: 92 },
  { id: "gm5", name: "Cedar Charter Network",   memberType: "Charter School",       state: "TX", enrollment: 1820, productLines: ["GL", "ELL"],         aiConfidence: 81, flag: "Loss ratio missing" },
  { id: "gm6", name: "Westlake Academy",        memberType: "Private K-12",         state: "TX", enrollment: 295,  productLines: ["GL"],                aiConfidence: 76, flag: "Verify member type" },
  { id: "gm7", name: "Travis ISD Annex",        memberType: "K-12 Public District", state: "TX", enrollment: 2150, productLines: ["GL", "Prop", "ELL"], aiConfidence: 90 },
];

const PRODUCT_ABBRS = ["GL", "Prop", "ELL", "EPL", "Cyber", "Crime", "Auto", "SA", "ML"] as const;

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
  submissionKind: SubmissionKind;
  groupName: string;            // populated when kind=Group (the umbrella account name)
  members: GroupMember[];       // empty when kind=Individual
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

// ── Inbox → New Submission prefill payload (matches Email.extracted in Inbox) ──
interface InboxPrefill {
  institutionName: string;
  state?: string;
  enrollment?: number;
  coverageLines?: string[];
  effectiveDate?: string;
  broker?: string;
  annualPremiumEstimate?: string;
  institutionType?: string;
}

const EMPTY: FormState = {
  submissionType: "New Business",
  submissionKind: "Individual",
  groupName: "",
  members: [],
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

// ── Prefill matching helpers (used when arriving from the Inbox) ───────────────
function findAccountByName(name: string): AccountRecord | undefined {
  const norm = name.toLowerCase().trim();
  // Exact match first, then permissive substring match either direction.
  const exact = ACCOUNTS.find(a => a.name.toLowerCase() === norm);
  if (exact) return exact;
  return ACCOUNTS.find(a => {
    const an = a.name.toLowerCase();
    return an.includes(norm) || norm.includes(an);
  });
}

function parsePrefillDate(raw: string): string {
  // Accepts "July 1, 2026", "2026-07-01", "07/01/2026", etc.
  const d = new Date(raw);
  if (isNaN(d.getTime())) return "";
  return d.toISOString().split("T")[0];
}

function matchProductLine(extracted: string): string | undefined {
  const norm = extracted.toLowerCase().trim();
  // Try a substring match against each canonical product line label.
  return (PRODUCT_GROUPS.flatMap(g => g.products) as string[]).find(p => {
    const head = p.toLowerCase().split("(")[0].trim();
    return head.includes(norm) || norm.includes(head);
  });
}

function findBrokerage(name: string): { brokerage: string; brokerContactId: string; contact: BrokerContact } | undefined {
  const norm = name.toLowerCase().trim();
  const contact = BROKER_CONTACTS.find(b => {
    const head = b.brokerage.toLowerCase().split(",")[0].trim();
    return head.includes(norm) || norm.includes(head);
  });
  return contact ? { brokerage: contact.brokerage, brokerContactId: contact.id, contact } : undefined;
}

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
          borderRadius: 6,
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
      <style>{`
        .ue-date-input::-webkit-calendar-picker-indicator { display: none; -webkit-appearance: none; }
        .ue-date-input::-webkit-inner-spin-button,
        .ue-date-input::-webkit-clear-button { display: none; }
      `}</style>
      <input
        ref={inputRef}
        type="date"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="ue-date-input"
        style={{
          width: "100%", boxSizing: "border-box",
          paddingLeft: 11, paddingRight: 38, paddingTop: 9, paddingBottom: 9,
          border: `1px solid ${BD}`, borderRadius: 6, background: "white", color: value ? TD : TT,
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
          position: "absolute", right: 1, top: 1, bottom: 1, width: 34,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: TH, border: "none", borderLeft: `1px solid ${BD}`,
          borderTopRightRadius: 5, borderBottomRightRadius: 5,
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
          borderRadius: 6,
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
          background: "white", border: `1px solid ${BD}`, borderRadius: 6,
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
                border: `1px solid ${BD}`, borderRadius: 6, fontSize: "0.78rem", fontFamily: font,
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
          padding: "7px 11px", border: `1px solid ${open ? N : BD}`, borderRadius: 6,
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
                borderRadius: 4,
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
          background: "white", border: `1px solid ${BD}`, borderRadius: 6,
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
                  borderRadius: 3,
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
                      borderRadius: 3,
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
          padding: "9px 11px", border: `1px solid ${open ? N : BD}`, borderRadius: 6,
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
          background: "white", border: `1px solid ${BD}`, borderRadius: 6,
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
          borderRadius: 6,
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
          background: "white", border: `1px solid ${BD}`, borderRadius: 6,
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
        style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "9px 11px", border: `1px solid ${open ? N : BD}`, borderRadius: 6, background: "white", cursor: "pointer", fontFamily: font, textAlign: "left" }}
      >
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: "0.60rem", color: TT, display: "block", lineHeight: 1 }}>{group}</span>
          <span style={{ fontSize: "0.80rem", color: TD, fontWeight: 600 }}>{value}</span>
        </div>
        <ChevronDown size={14} color={TT} style={{ flexShrink: 0, transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.15s" }} />
      </button>

      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 2px)", left: 0, right: 0, background: "white", border: `1px solid ${BD}`, borderRadius: 6, boxShadow: "0 8px 24px rgba(0,0,0,0.12)", zIndex: 300, maxHeight: 340, overflowY: "auto" }}>
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
    <div style={{
      background: "white",
      border: `1px solid ${BDL}`,
      borderTop: `3px solid ${N}`,
      borderRadius: 8,
      overflow: "hidden",
      boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
    }}>
      <div className="flex items-center justify-between px-5 py-3"
        style={{ borderBottom: `1px solid ${BDL}`, background: "#FAFBFD" }}>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center"
            style={{ width: 24, height: 24, borderRadius: 6, background: `${N}12`, color: N }}>
            <Paperclip size={13}/>
          </span>
          <h3 style={{ fontSize: "0.74rem", fontWeight: 700, color: TD, textTransform: "uppercase", letterSpacing: "0.08em" }}>Submission Documents</h3>
          {docs.length > 0 && <span style={{ fontSize: "0.62rem", fontWeight: 700, color: "white", background: N, padding: "1px 7px", borderRadius: 4 }}>{docs.length}</span>}
        </div>
        <button type="button" onClick={() => fileRef.current?.click()}
          className="flex items-center gap-1.5 px-3 py-1.5 hover:brightness-95 transition-all"
          style={{ background: N, color: "white", border: "none", borderRadius: 6, cursor: "pointer", fontSize: "0.70rem", fontWeight: 700, fontFamily: font }}>
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
          <div style={{ border: `1px solid ${BDL}`, borderRadius: 6, overflow: "hidden" }}>
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
                        style={{ fontSize: "0.62rem", color: N, fontFamily: font, border: `1px solid ${N}`, borderRadius: 4, background: "white", padding: "1px 4px", cursor: "pointer" }}>
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

// ── AI Account Recognition banner ──────────────────────────────────────────────
// Surfaces what the AI picked out of the uploaded packet: detected submission
// kind (Individual vs Group), member count, broker/UW spread, and the rule
// implication ("multi-tier rules will apply"). Click-through lets the UW
// override the detected kind if the model got it wrong.
function AIRecognitionBanner({
  recognition,
  currentKind,
  onUseDetectedKind,
  onDismiss,
}: {
  recognition: AIRecognition;
  currentKind: SubmissionKind;
  onUseDetectedKind: () => void;
  onDismiss: () => void;
}) {
  const isGroup = recognition.detectedKind === "Group";
  const accent  = isGroup ? "#7B2FBE" : N;
  const matches = currentKind === recognition.detectedKind;
  return (
    <div style={{
      background: `linear-gradient(135deg, ${accent}08 0%, ${accent}03 100%)`,
      border: `1px solid ${accent}30`,
      borderLeft: `4px solid ${accent}`,
      borderRadius: 8,
      padding: "14px 16px",
    }}>
      <div className="flex items-start gap-3">
        <div
          className="flex items-center justify-center shrink-0"
          style={{
            width: 32, height: 32, borderRadius: 8,
            background: `${accent}15`, color: accent,
          }}
        >
          <Sparkles size={16}/>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="flex items-center gap-2 flex-wrap">
            <span style={{ fontSize: "0.60rem", fontWeight: 800, color: accent, textTransform: "uppercase", letterSpacing: "0.09em" }}>
              AI Account Recognition
            </span>
            <span style={{
              fontSize: "0.58rem", fontWeight: 700, color: accent,
              background: `${accent}12`, border: `1px solid ${accent}30`,
              padding: "1px 7px", borderRadius: 10,
            }}>
              {recognition.kindConfidence}% confidence
            </span>
          </div>
          <p style={{ fontSize: "0.84rem", color: TD, fontWeight: 700, marginTop: 4, lineHeight: 1.35 }}>
            Detected: <span style={{ color: accent }}>{recognition.detectedKind === "Group" ? "Group / Multi-Member" : "Individual Account"} submission</span>
            {isGroup && (
              <>
                {" "}· <span style={{ color: TD }}>{recognition.memberCount}&nbsp;members</span>
                {" "}· <span style={{ color: TD }}>{recognition.brokerCount}&nbsp;brokers</span>
              </>
            )}
          </p>
          <ul style={{ fontSize: "0.72rem", color: TM, marginTop: 6, listStyle: "none", padding: 0 }}>
            {recognition.notes.map((n, i) => (
              <li key={i} className="flex items-start gap-1.5" style={{ marginBottom: 2 }}>
                <Check size={11} color={accent} style={{ flexShrink: 0, marginTop: 3 }}/>
                <span>{n}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {!matches && (
            <button
              type="button"
              onClick={onUseDetectedKind}
              className="hover:brightness-95 transition-all"
              style={{
                background: accent, color: "white", border: "none",
                borderRadius: 6, padding: "7px 12px",
                fontSize: "0.70rem", fontWeight: 800, fontFamily: font,
                cursor: "pointer", whiteSpace: "nowrap",
              }}
            >
              Use detected kind
            </button>
          )}
          {matches && (
            <span
              className="inline-flex items-center gap-1"
              style={{
                background: `${accent}12`, color: accent,
                border: `1px solid ${accent}40`, borderRadius: 6,
                padding: "5px 10px",
                fontSize: "0.66rem", fontWeight: 800,
                textTransform: "uppercase", letterSpacing: "0.06em",
              }}
            >
              <Check size={11}/> Applied
            </span>
          )}
          <button
            type="button"
            onClick={onDismiss}
            title="Hide banner"
            style={{
              background: "transparent", border: "none", color: TT,
              padding: 4, cursor: "pointer", display: "flex",
            }}
          >
            <X size={14}/>
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Group Members editor ───────────────────────────────────────────────────────
// Inline editable table of members on a group submission. AI-parsed members
// land here pre-populated; the UW edits name/type/state/enrollment/products
// directly in the row. Per-row warnings (e.g. "Loss ratio missing") surface as
// a small yellow chip so the UW knows what needs broker follow-up before quote.
function GroupMembersEditor({
  members,
  groupName,
  onGroupNameChange,
  onChange,
}: {
  members: GroupMember[];
  groupName: string;
  onGroupNameChange: (v: string) => void;
  onChange: (next: GroupMember[]) => void;
}) {
  const update = (id: string, patch: Partial<GroupMember>) =>
    onChange(members.map(m => m.id === id ? { ...m, ...patch } : m));
  const remove = (id: string) => onChange(members.filter(m => m.id !== id));
  const add = () => onChange([
    ...members,
    { id: `gm-${Date.now()}`, name: "", memberType: "K-12 Public School", state: "", enrollment: 0, productLines: [] },
  ]);

  const totalEnrollment = members.reduce((s, m) => s + (m.enrollment || 0), 0);
  const memberTypeCount = new Set(members.map(m => m.memberType)).size;
  const productUnion    = Array.from(new Set(members.flatMap(m => m.productLines)));

  return (
    <div>
      {/* Group identity row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" style={{ marginBottom: 16 }}>
        <div style={{ gridColumn: "span 2 / span 2" }}>
          <FieldLabel required>Group / Umbrella Name</FieldLabel>
          <TextInput
            value={groupName}
            onChange={onGroupNameChange}
            placeholder="e.g. Central Texas Schools Consortium"
            icon={<Users size={13}/>}
          />
        </div>
        <div>
          <FieldLabel>Members</FieldLabel>
          <div
            className="flex items-center justify-between"
            style={{
              padding: "9px 11px",
              border: `1px solid ${BDL}`,
              borderRadius: 6,
              background: "#FAFBFC",
            }}
          >
            <span style={{ fontSize: "0.80rem", fontWeight: 700, color: TD }}>
              {members.length} <span style={{ fontWeight: 500, color: TT }}>member{members.length === 1 ? "" : "s"}</span>
            </span>
            <span style={{ fontSize: "0.62rem", color: TT, fontWeight: 600 }}>
              {memberTypeCount} type{memberTypeCount === 1 ? "" : "s"} · {productUnion.length} product{productUnion.length === 1 ? "" : "s"}
            </span>
          </div>
        </div>
      </div>

      {/* Roster aggregates */}
      {members.length > 0 && (
        <div
          className="grid grid-cols-2 sm:grid-cols-4 gap-0"
          style={{ background: "white", border: `1px solid ${BDL}`, marginBottom: 14 }}
        >
          {[
            { label: "Members",          value: String(members.length) },
            { label: "Total Enrollment", value: totalEnrollment.toLocaleString() },
            { label: "Member Types",     value: String(memberTypeCount) },
            { label: "Products (Union)", value: productUnion.length ? productUnion.join(" · ") : "—" },
          ].map((s, i, arr) => (
            <div
              key={s.label}
              className="px-4 py-3 flex flex-col gap-0.5"
              style={{ borderRight: i < arr.length - 1 ? `1px solid ${BDL}` : "none" }}
            >
              <span style={{ fontSize: "0.58rem", fontWeight: 700, color: TT, textTransform: "uppercase", letterSpacing: "0.09em" }}>
                {s.label}
              </span>
              <span style={{ fontSize: "0.86rem", fontWeight: 700, color: TD }}>{s.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Members table */}
      <div style={{ border: `1px solid ${BDL}`, borderRadius: 6, overflow: "hidden", background: "white" }}>
        {/* Header */}
        <div
          className="grid"
          style={{
            gridTemplateColumns: "28px minmax(180px, 2fr) minmax(140px, 1.2fr) 60px 100px minmax(160px, 1.6fr) 90px 32px",
            gap: "0 10px",
            alignItems: "center",
            padding: "8px 12px",
            background: "#FAFBFD",
            borderBottom: `1px solid ${BDL}`,
          }}
        >
          {["#", "Member", "Member Type", "State", "Enrollment", "Products", "AI", ""].map((h, i) => (
            <span key={i} style={{ fontSize: "0.58rem", fontWeight: 700, color: TT, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              {h}
            </span>
          ))}
        </div>

        {/* Rows */}
        {members.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center gap-2"
            style={{ padding: "28px 12px", background: "#FAFBFC" }}
          >
            <Users size={20} color={BD}/>
            <p style={{ fontSize: "0.78rem", color: TT, fontWeight: 600 }}>No members yet</p>
            <p style={{ fontSize: "0.66rem", color: TT, marginTop: -4 }}>
              Upload a group packet to auto-parse, or add members manually.
            </p>
          </div>
        ) : members.map((m, idx) => (
          <div key={m.id}>
            <div
              className="grid"
              style={{
                gridTemplateColumns: "28px minmax(180px, 2fr) minmax(140px, 1.2fr) 60px 100px minmax(160px, 1.6fr) 90px 32px",
                gap: "0 10px",
                alignItems: "center",
                padding: "8px 12px",
                background: idx % 2 === 0 ? "white" : "#FAFBFC",
                borderBottom: m.flag ? "none" : (idx < members.length - 1 ? `1px solid ${BDL}` : "none"),
              }}
            >
              <span style={{ fontSize: "0.70rem", fontWeight: 700, color: TT, fontVariantNumeric: "tabular-nums" }}>
                {idx + 1}
              </span>
              <input
                value={m.name}
                onChange={e => update(m.id, { name: e.target.value })}
                placeholder="Member name"
                style={{
                  width: "100%", boxSizing: "border-box",
                  padding: "6px 8px",
                  border: `1px solid ${BDL}`, borderRadius: 4,
                  background: "white", color: TD,
                  fontSize: "0.78rem", fontFamily: font, fontWeight: 600, outline: "none",
                }}
                onFocus={e => { e.currentTarget.style.borderColor = N; }}
                onBlur={e => { e.currentTarget.style.borderColor = BDL; }}
              />
              <select
                value={m.memberType}
                onChange={e => update(m.id, { memberType: e.target.value as MemberType })}
                style={{
                  width: "100%", boxSizing: "border-box",
                  padding: "6px 8px",
                  border: `1px solid ${BDL}`, borderRadius: 4,
                  background: "white", color: TD,
                  fontSize: "0.74rem", fontFamily: font, outline: "none",
                  appearance: "none",
                }}
              >
                {MEMBER_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <input
                value={m.state}
                onChange={e => update(m.id, { state: e.target.value.toUpperCase().slice(0, 2) })}
                placeholder="ST"
                maxLength={2}
                style={{
                  width: "100%", boxSizing: "border-box",
                  padding: "6px 8px",
                  border: `1px solid ${BDL}`, borderRadius: 4,
                  background: "white", color: TD,
                  fontSize: "0.76rem", fontFamily: font, outline: "none",
                  textAlign: "center", textTransform: "uppercase",
                }}
              />
              <input
                type="number"
                value={m.enrollment || ""}
                onChange={e => update(m.id, { enrollment: Number(e.target.value) || 0 })}
                placeholder="0"
                style={{
                  width: "100%", boxSizing: "border-box",
                  padding: "6px 8px",
                  border: `1px solid ${BDL}`, borderRadius: 4,
                  background: "white", color: TD,
                  fontSize: "0.76rem", fontFamily: font, outline: "none",
                  textAlign: "right", fontVariantNumeric: "tabular-nums",
                }}
              />
              <div className="flex items-center gap-1 flex-wrap">
                {PRODUCT_ABBRS.map(p => {
                  const active = m.productLines.includes(p);
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => update(m.id, {
                        productLines: active
                          ? m.productLines.filter(x => x !== p)
                          : [...m.productLines, p],
                      })}
                      style={{
                        fontSize: "0.60rem", fontWeight: 700,
                        padding: "2px 6px", borderRadius: 3,
                        border: `1px solid ${active ? N : BDL}`,
                        background: active ? `${N}12` : "white",
                        color: active ? N : TT,
                        cursor: "pointer",
                        letterSpacing: "0.02em",
                        fontFamily: font,
                      }}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center gap-1">
                {m.aiConfidence != null && (
                  <span
                    style={{
                      fontSize: "0.60rem", fontWeight: 800,
                      color: m.aiConfidence >= 90 ? "#1A7A4A" : m.aiConfidence >= 75 ? "#8A5C00" : "#B91C1C",
                      background: m.aiConfidence >= 90 ? "#E8F5EC" : m.aiConfidence >= 75 ? "#FFF8E6" : "#FBEAEA",
                      padding: "2px 6px", borderRadius: 3,
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {m.aiConfidence}%
                  </span>
                )}
              </div>
              <button
                type="button"
                title="Remove member"
                onClick={() => remove(m.id)}
                style={{
                  background: "none", border: "none", color: "#B91C1C",
                  padding: 4, cursor: "pointer", display: "flex",
                }}
                className="hover:bg-red-50 transition-colors rounded"
              >
                <Trash2 size={13}/>
              </button>
            </div>
            {m.flag && (
              <div
                className="flex items-center gap-1.5"
                style={{
                  padding: "4px 12px 8px 48px",
                  background: idx % 2 === 0 ? "white" : "#FAFBFC",
                  borderBottom: idx < members.length - 1 ? `1px solid ${BDL}` : "none",
                }}
              >
                <AlertCircle size={11} color="#8A5C00"/>
                <span style={{ fontSize: "0.66rem", color: "#7A4800", fontWeight: 600 }}>
                  {m.flag}
                </span>
              </div>
            )}
          </div>
        ))}

        {/* Add row */}
        <button
          type="button"
          onClick={add}
          className="w-full flex items-center justify-center gap-1.5 transition-colors hover:bg-slate-50"
          style={{
            padding: "10px 12px",
            background: "white",
            border: "none",
            borderTop: members.length > 0 ? `1px solid ${BDL}` : "none",
            cursor: "pointer", fontFamily: font,
            color: N, fontSize: "0.74rem", fontWeight: 700,
          }}
        >
          <UserPlus size={13}/> Add member
        </button>
      </div>
    </div>
  );
}

// ── Section Card ───────────────────────────────────────────────────────────────
function SectionCard({ title, accent = N, children, badge, locked, lockedLabel = "Auto-populated", icon }: {
  title: string; accent?: string; children: React.ReactNode; badge?: string; locked?: boolean; lockedLabel?: string; icon?: React.ReactNode;
}) {
  return (
    <div style={{
      background: "white",
      border: `1px solid ${BDL}`,
      borderTop: `3px solid ${accent}`,
      borderRadius: 8,
      boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
    }}>
      <div className="flex items-center justify-between px-5 py-3"
        style={{ borderBottom: `1px solid ${BDL}`, background: "#FAFBFD", borderTopLeftRadius: 5, borderTopRightRadius: 5 }}>
        <div className="flex items-center gap-2">
          {icon && (
            <span className="inline-flex items-center justify-center"
              style={{ width: 24, height: 24, borderRadius: 6, background: `${accent}12`, color: accent }}>
              {icon}
            </span>
          )}
          <h3 style={{ fontSize: "0.74rem", fontWeight: 700, color: TD, textTransform: "uppercase", letterSpacing: "0.08em" }}>{title}</h3>
        </div>
        {locked ? (
          <div className="flex items-center gap-1.5 px-2.5 py-1" style={{ background: `${N}0A`, border: `1px solid ${N}25`, borderRadius: 4 }}>
            <Lock size={10} color={N} />
            <span style={{ fontSize: "0.60rem", fontWeight: 700, color: N, textTransform: "uppercase", letterSpacing: "0.06em" }}>{lockedLabel}</span>
          </div>
        ) : badge ? (
          <div className="flex items-center gap-1.5 px-2.5 py-1" style={{ background: `${N}0A`, border: `1px solid ${N}25`, borderRadius: 4 }}>
            <Lock size={10} color={N} />
            <span style={{ fontSize: "0.60rem", fontWeight: 700, color: N, textTransform: "uppercase", letterSpacing: "0.06em" }}>{badge}</span>
          </div>
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
      padding: "9px 11px", border: `1px solid ${BDL}`, borderRadius: 6,
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
function InlineSelect({ value, onChange, options, placeholder, disabled = false, disabledPlaceholder }: {
  value: string;
  onChange: (v: string) => void;
  options: { id: string; name: string; title: string }[];
  placeholder: string;
  disabled?: boolean;
  disabledPlaceholder?: string;
}) {
  return (
    <div style={{ position: "relative" }}>
      <div style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none", zIndex: 1 }}>
        <User size={13} color={disabled ? BDL : TT} />
      </div>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={disabled}
        style={{
          width: "100%", boxSizing: "border-box",
          paddingLeft: 32, paddingRight: 32, paddingTop: 9, paddingBottom: 9,
          border: `1px solid ${disabled ? BDL : BD}`, borderRadius: 6,
          background: disabled ? "#FAFBFC" : "white",
          color: disabled ? BDL : (value ? TD : TT),
          fontSize: "0.80rem", fontFamily: font, outline: "none",
          appearance: "none", cursor: disabled ? "not-allowed" : "pointer",
          fontStyle: disabled ? "italic" : "normal",
        }}
        onFocus={e => { if (!disabled) e.currentTarget.style.borderColor = N; }}
        onBlur={e => { e.currentTarget.style.borderColor = disabled ? BDL : BD; }}
      >
        <option value="">{disabled && disabledPlaceholder ? disabledPlaceholder : placeholder}</option>
        {options.map(o => (
          <option key={o.id} value={o.id}>{o.name} — {o.title}</option>
        ))}
      </select>
      <div style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
        {disabled
          ? <Lock size={11} color={BDL} />
          : <ChevronDown size={13} color={TT} />}
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export function NewSubmissionPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { setSelectedProducts } = useCompanion();
  const role: RoleId = user?.roleId ?? "sr-uw";

  const [form, setForm]     = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [docs, setDocs]     = useState<UploadedDoc[]>([]);

  /* Inbox prefill: warnings for any field we couldn't auto-populate. */
  const [prefillWarnings, setPrefillWarnings] = useState<string[] | null>(null);
  const [prefillSource,   setPrefillSource]   = useState<string | null>(null);
  const [prefillDismissed, setPrefillDismissed] = useState(false);
  const prefillAppliedRef = useRef(false);

  // Cancel / preview modals
  const [previewOpen, setPreviewOpen]             = useState(false);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);

  const [aiFile, setAiFile]           = useState<File | null>(null);
  const [aiStatus, setAiStatus]       = useState<"idle" | "processing" | "done">("idle");
  const [aiDragOver, setAiDragOver]   = useState(false);
  const aiInputRef                    = useRef<HTMLInputElement>(null);

  // AI account recognition — populated on first doc upload, dismissable by user.
  // Stays around after dismissal so the user can re-open it from the chip.
  const [recognition, setRecognition]         = useState<AIRecognition | null>(null);
  const [recognitionDismissed, setRecognitionDismissed] = useState(false);

  const handleAiFile = (file: File) => {
    setAiFile(file);
    setAiStatus("processing");
    setTimeout(() => setAiStatus("done"), 2200);
  };

  // ── Inbox prefill: pre-populate form fields from the email's extracted data ──
  // Triggered when the user clicks "Create Submission" inside an Inbox AI panel.
  // Anything we can't auto-map (unknown account, unparsable date, coverage line
  // not in the product catalog, missing broker) lands in `prefillWarnings` so
  // the underwriter sees exactly what still needs human input.
  useEffect(() => {
    if (prefillAppliedRef.current) return;
    const state = location.state as { prefill?: InboxPrefill; sourceEmail?: { fromName: string; fromCompany: string; subject: string } } | null;
    const prefill = state?.prefill;
    if (!prefill) return;
    prefillAppliedRef.current = true;

    const warnings: string[] = [];
    const updates: Partial<FormState> = {};

    // Institution → account
    if (prefill.institutionName) {
      const account = findAccountByName(prefill.institutionName);
      if (account) {
        updates.accountId   = account.id;
        updates.accountName = account.name;
        const defaults = ACCOUNT_DEFAULTS[account.id];
        if (defaults) {
          const contact = BROKER_CONTACTS.find(b => b.id === defaults.brokerContactId);
          updates.brokerage       = defaults.brokerage;
          updates.brokerContactId = defaults.brokerContactId;
          updates.brokerName      = contact?.name  ?? "";
          updates.brokerEmail     = contact?.email ?? "";
          updates.brokerPhone     = contact?.phone ?? "";
          updates.underwriterId   = defaults.underwriterId;
          updates.uwSpecialistId  = defaults.uwSpecialistId;
        }
      } else {
        warnings.push(`Institution "${prefill.institutionName}" is not in the account list — please select an account manually.`);
      }
    } else {
      warnings.push("Institution name was not extracted from the email.");
    }

    // Effective date → ISO; expirationDate is auto-set by another effect
    if (prefill.effectiveDate) {
      const iso = parsePrefillDate(prefill.effectiveDate);
      if (iso) {
        updates.effectiveDate = iso;
        updates.needByDate    = iso;
      } else {
        warnings.push(`Could not parse effective date "${prefill.effectiveDate}".`);
      }
    } else {
      warnings.push("Effective date was not extracted from the email.");
    }

    // Coverage lines → canonical product lines (drop any that don't match the catalog)
    if (prefill.coverageLines && prefill.coverageLines.length > 0) {
      const matched: string[] = [];
      const unmatched: string[] = [];
      prefill.coverageLines.forEach(cl => {
        const hit = matchProductLine(cl);
        if (hit) matched.push(hit);
        else unmatched.push(cl);
      });
      if (matched.length > 0) updates.productLines = Array.from(new Set(matched));
      if (unmatched.length > 0) {
        warnings.push(`Coverage line${unmatched.length > 1 ? "s" : ""} not in catalog: ${unmatched.join(", ")}.`);
      }
    } else {
      warnings.push("No coverage lines were extracted from the email.");
    }

    // Broker fallback (only when the account lookup didn't already set it)
    if (!updates.brokerage && prefill.broker) {
      const match = findBrokerage(prefill.broker);
      if (match) {
        updates.brokerage       = match.brokerage;
        updates.brokerContactId = match.brokerContactId;
        updates.brokerName      = match.contact.name;
        updates.brokerEmail     = match.contact.email;
        updates.brokerPhone     = match.contact.phone;
      } else {
        warnings.push(`Broker "${prefill.broker}" is not in the directory — please select a broker contact.`);
      }
    }

    setForm(f => ({ ...f, ...updates }));
    setPrefillWarnings(warnings);
    setPrefillSource(state?.sourceEmail
      ? `${state.sourceEmail.fromName} (${state.sourceEmail.fromCompany}) · ${state.sourceEmail.subject}`
      : "Inbox");
    // Clear router state so a back/forward navigation doesn't re-fire the prefill.
    navigate(location.pathname, { replace: true, state: null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync selected products to CompanionContext so ChatBot can build the checklist
  useEffect(() => {
    setSelectedProducts(form.productLines);
    return () => setSelectedProducts([]);
  }, [form.productLines]);

  // Auto-set expiry when effective date changes
  useEffect(() => {
    if (form.effectiveDate) {
      const d = new Date(form.effectiveDate);
      d.setFullYear(d.getFullYear() + 1);
      setForm(f => ({ ...f, expirationDate: d.toISOString().split("T")[0] }));
    }
  }, [form.effectiveDate]);

  // ── On first document upload, auto-extract policy details ───────────────────
  // Simulates AI extraction from the uploaded submission packet. Only fills
  // fields that are still empty so the user's edits are never overwritten.
  // Also cascades the Brokerage + Underwriting Team defaults bound to the
  // resolved account, mirroring what handleAccountChange does on manual select.
  // For group packets, the file name (or count) is a stand-in for the real
  // parse signal — anything containing "group", "consortium", "district" or
  // more than one doc named "member-…" lands as a group submission.
  const detectKindFromFilename = (names: string[]): SubmissionKind => {
    const joined = names.join(" ").toLowerCase();
    if (/group|consortium|multi[- ]?member|district roster|members? roster|charter network/.test(joined)) return "Group";
    return "Individual";
  };

  const handleDocsChange = (next: UploadedDoc[]) => {
    const firstUpload = docs.length === 0 && next.length > 0;
    setDocs(next);
    if (firstUpload) {
      const kind = detectKindFromFilename(next.map(d => d.name));
      const seededMembers = kind === "Group" ? SAMPLE_PARSED_MEMBERS : [];
      const aggregatedProducts = kind === "Group"
        ? Array.from(new Set(seededMembers.flatMap(m => m.productLines))).map(abbr => {
            // Map short abbrs back to the canonical PRODUCT_LINES strings the form uses.
            const match = PRODUCT_LINES.find(p => p.toUpperCase().includes(`(${abbr.toUpperCase()})`));
            return match ?? "";
          }).filter(Boolean)
        : [];
      setForm(f => {
        const resolvedAccountId   = f.accountId   || "3001";
        const resolvedAccountName = f.accountName || (ACCOUNTS.find(a => a.id === "3001")?.name ?? "Brookfield Day School");
        const defaults = ACCOUNT_DEFAULTS[resolvedAccountId];
        const contact  = defaults ? BROKER_CONTACTS.find(b => b.id === defaults.brokerContactId) : undefined;
        return {
          ...f,
          submissionKind: f.submissionKind === "Individual" && kind === "Group" ? "Group" : f.submissionKind,
          groupName:      f.groupName || (kind === "Group" ? "Central Texas Schools Consortium" : ""),
          members:        f.members.length === 0 ? seededMembers : f.members,
          accountId:     resolvedAccountId,
          accountName:   resolvedAccountName,
          needByDate:    f.needByDate    || "2026-05-14",
          effectiveDate: f.effectiveDate || "2026-05-14",
          productLines:  f.productLines.length === 0
            ? (aggregatedProducts.length ? aggregatedProducts : ["Buffer Excess Liability (BLX)", "General Liability Excess (GLX)"])
            : f.productLines,
          brokerage:       f.brokerage       || defaults?.brokerage       || "",
          brokerContactId: f.brokerContactId || defaults?.brokerContactId || "",
          brokerName:      f.brokerName      || contact?.name             || "",
          brokerEmail:     f.brokerEmail     || contact?.email            || "",
          brokerPhone:     f.brokerPhone     || contact?.phone            || "",
          underwriterId:   f.underwriterId   || defaults?.underwriterId   || "",
          uwSpecialistId:  f.uwSpecialistId  || defaults?.uwSpecialistId  || "",
        };
      });
      // Build the AI recognition banner shown above the form. Real wiring would
      // surface model confidence + provenance; this stand-in shows realistic
      // structure so the UX reads correctly end-to-end.
      const accountTypes = kind === "Group"
        ? Array.from(new Set(seededMembers.map(m => m.memberType)))
        : ["Private K-12"];
      setRecognition({
        detectedKind: kind,
        kindConfidence: kind === "Group" ? 94 : 97,
        memberCount: kind === "Group" ? seededMembers.length : 1,
        brokerCount: kind === "Group" ? 2 : 1,
        underwriterCount: 1,
        accountTypes,
        notes: kind === "Group"
          ? [
              `${seededMembers.length} member rows parsed from packet`,
              `${accountTypes.length} member types detected — multi-tier rules will apply`,
              `2 broker contacts found on cover email — verify primary`,
              `Aggregate enrollment ${seededMembers.reduce((s,m) => s + m.enrollment, 0).toLocaleString()}`,
            ]
          : [
              `Single member account identified`,
              `Standard individual rating rules will apply`,
            ],
      });
      setRecognitionDismissed(false);
      setErrors(e => ({
        ...e,
        accountId:     undefined,
        needByDate:    undefined,
        effectiveDate: undefined,
        productLines:  undefined,
      }));
    }
  };

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
    if (errors[key]) setErrors(e => ({ ...e, [key]: undefined }));
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

  // Cancel-flow handlers
  const handleDiscard = () => {
    setCancelConfirmOpen(false);
    navigate("/submissions");
  };

  const handleSaveDraft = () => {
    try {
      localStorage.setItem(
        "submission:draft",
        JSON.stringify({ form, docs, savedAt: new Date().toISOString() }),
      );
    } catch {
      /* ignore storage errors (private mode, quota, etc.) */
    }
    setCancelConfirmOpen(false);
    navigate("/submissions");
  };

  // Full preview rows (modal). Wider than the in-form Summary Preview.
  const summaryRows = useMemo(() => [
    { label: "Kind",         value: form.submissionKind === "Group"
                                     ? `Group · ${form.members.length} member${form.members.length === 1 ? "" : "s"}`
                                     : "Individual Account" },
    ...(form.submissionKind === "Group"
        ? [{ label: "Group Name", value: form.groupName || "—" }]
        : []),
    { label: "Type",         value: form.submissionType },
    { label: form.submissionKind === "Group" ? "Lead Account" : "Account", value: form.accountName || "—" },
    ...(form.submissionKind === "Group" && form.members.length > 0
        ? [{ label: "Member Types", value: Array.from(new Set(form.members.map(m => m.memberType))).join(", ") },
           { label: "Total Enrollment", value: form.members.reduce((s,m) => s + (m.enrollment || 0), 0).toLocaleString() }]
        : []),
    { label: "Products",     value: form.productLines.length > 0 ? form.productLines.join(", ") : "—" },
    { label: "Need By",      value: form.needByDate || "—" },
    { label: "Effective",    value: form.effectiveDate || "—" },
    { label: "Expiration",   value: form.expirationDate || "—" },
    { label: "Brokerage",    value: form.brokerage || "—" },
    { label: "Broker",       value: form.brokerName || "—" },
    { label: "Broker Email", value: form.brokerEmail || "—" },
    { label: "Broker Phone", value: form.brokerPhone || "—" },
    { label: "Stage",        value: form.stage },
    { label: "Docs count",   value: docs.length > 0 ? `${docs.length} attached` : "None" },
    { label: "Notes",        value: form.notes || "—" },
  ], [form, docs]);

  const typeColor = (id: SubmissionType) =>
    id === "New Business" ? N : "#7B2FBE";

  const stageCol = stageColor(form.stage);

  // ── Companion context: tied to the actual work on this page ──────────────
  // Underwriters are CAPTURING a submission here — not reviewing or quoting.
  // Suggestions help them: extract data from the packet faster, request the
  // right docs from the broker, look up history on the account, sanity-check
  // dates, and confirm the form is safe to save.
  const acct = ACCOUNTS.find(a => a.id === form.accountId);
  const docsByProduct: Record<string, string[]> = {
    "Educators Legal Liability (ELL)":        ["ACORD application", "5-yr loss runs", "Open claims detail", "Title IX / harassment training roster"],
    "General Liability (GL)":                 ["ACORD application", "5-yr loss runs", "Schedule of Locations (COPE)", "Sprinkler / fire-protection report"],
    "Property":                               ["ACORD application", "Statement of Values (TIV)", "Latest appraisal", "Sprinkler / fire-protection report"],
    "Cyber":                                  ["Cyber application", "MFA attestation", "Backup & recovery questionnaire", "Prior cyber loss runs"],
    "Educators Professional Liability (EPL)": ["ACORD application", "5-yr loss runs", "Title IX policy", "Faculty handbook"],
    "Student Accident":                       ["ACORD application", "Athletics participation roster", "Most-recent claim report"],
    "School Board Legal (SBL)":               ["ACORD application", "5-yr loss runs", "Board minutes (last 12 months)", "Litigation summary"],
    "Excess Following Form (XFF)":            ["Primary policy declarations", "Schedule of underlying limits", "5-yr loss runs"],
  };
  const productDocs = Array.from(new Set(form.productLines.flatMap(p => docsByProduct[p] ?? [])));
  const requiredMissing = [
    !form.accountId      && "Account",
    !form.productLines.length && "Product line(s)",
    !form.needByDate     && "Need-by date",
    !form.effectiveDate  && "Effective date",
  ].filter(Boolean) as string[];

  return (
    <AppShell activePage="submissions" role={role} onRoleChange={() => {}}>
      <PageRegister
        routeKey="page:submissions:new"
        title="Create Submission"
        subtitle={form.accountName || form.submissionType}
        greeting={
          docs.length === 0 && !form.accountId
            ? `Got a broker packet to load? Drop it in Documents and I'll pre-fill the account, brokerage, and dates. Or pick an account manually and I'll cascade the defaults.`
            : !form.accountId
              ? `${docs.length} doc${docs.length === 1 ? "" : "s"} uploaded — I can pull the account, brokerage, and policy dates straight from the packet.`
              : !form.productLines.length
                ? `${acct?.name} — auto-populated from the account record. Pick the product line(s) and I'll list the docs you should request from ${form.brokerage || "the broker"}.`
                : `${acct?.name} · ${form.productLines.length} product line${form.productLines.length === 1 ? "" : "s"}. Need a doc checklist for the broker, or want me to sanity-check the dates before you save?`
        }
        suggestions={[
          { id: "extract-packet",   label: "Pull details from uploaded packet", tone: "violet", icon: "Wand2"          },
          { id: "broker-docs",      label: "Documents to request from broker",  tone: "blue",   icon: "FileText"       },
          { id: "account-history",  label: "Show prior UE history on account",  tone: "blue",   icon: "Building2"      },
          { id: "date-sanity",      label: "Sanity-check effective & need-by",  tone: "gold",   icon: "Calendar"       },
          { id: "ready-to-save",    label: "Is this ready to save?",            tone: "red",    icon: "ClipboardCheck" },
        ]}
        respond={(sid) => {
          if (sid === "extract-packet") {
            if (!docs.length) {
              return [{ id: newId(), role: "agent", kind: "text", ts: now(),
                text: `No packet uploaded yet. Drop the broker's email + ACORD into Submission Documents — I'll pull account, brokerage, contact, and effective date straight from page one.` }];
            }
            if (form.accountId && form.brokerage && form.effectiveDate) {
              return [{ id: newId(), role: "agent", kind: "text", ts: now(),
                text: `Already extracted from the packet: ${form.accountName}, brokerage ${form.brokerage}, effective ${form.effectiveDate}. Re-run? Re-upload the cover doc and I'll re-scan.` }];
            }
            const filled: string[] = [];
            if (form.accountId)     filled.push(`account → ${form.accountName}`);
            if (form.brokerage)     filled.push(`brokerage → ${form.brokerage}`);
            if (form.effectiveDate) filled.push(`effective → ${form.effectiveDate}`);
            return [{ id: newId(), role: "agent", kind: "text", ts: now(),
              text: filled.length
                ? `Partial extraction so far: ${filled.join(", ")}. Drop the rest of the packet (loss runs, current dec page) and I'll fill the remaining fields.`
                : `Packet uploaded but extraction hasn't run yet — try re-uploading the cover doc or pick the account manually to cascade brokerage + UW defaults.` }];
          }
          if (sid === "broker-docs") {
            if (!form.productLines.length) {
              return [{ id: newId(), role: "agent", kind: "text", ts: now(),
                text: `Pick the product line(s) first — the document list depends on what's being underwritten.` }];
            }
            return [{ id: newId(), role: "agent", kind: "viz", ts: now(), viz: {
              kind: "checklist", title: `Request from ${form.brokerage || "broker"}`,
              items: productDocs.map(d => ({
                ok: docs.some(u => u.name.toLowerCase().includes(d.split(" ")[0].toLowerCase())),
                label: d,
              })),
            } }];
          }
          if (sid === "account-history") {
            if (!acct) {
              return [{ id: newId(), role: "agent", kind: "text", ts: now(),
                text: `Pick an account first and I'll pull UE's prior submission, policy, and claims history.` }];
            }
            // Light deterministic mock — only Brookfield Day School has a known prior submission in this dataset.
            if (acct.id === "3001") {
              return [{ id: newId(), role: "agent", kind: "text", ts: now(),
                text: `${acct.name} — UE member since 2014. Prior submission SUB-7829 currently in review (quote ready, due today). 6-yr loss ratio 58%, two open ELL claims still developing. Worth flagging this is a renewal-adjacent new submission — confirm with the broker before saving as New Business.`,
                suggestions: [
                  { id: "open-prior", label: "Open prior submission", tone: "blue", icon: "FileSearch", navigateTo: "/submission/SUB-7829" },
                ] }];
            }
            return [{ id: newId(), role: "agent", kind: "text", ts: now(),
              text: `${acct.name} (${acct.type}, ${acct.state}) — no prior UE submission on file. Treat as net-new; expect full underwriting documentation per product line.` }];
          }
          if (sid === "date-sanity") {
            if (!form.effectiveDate) {
              return [{ id: newId(), role: "agent", kind: "text", ts: now(),
                text: `Effective date isn't set yet. Pick that first and I'll check it against the need-by lead time and UE's standard 30-day quote SLA.` }];
            }
            const eff = new Date(form.effectiveDate);
            const today = new Date();
            const daysToEff = Math.round((eff.getTime() - today.getTime()) / 86400000);
            let lead = `Effective date is ${daysToEff} day${daysToEff === 1 ? "" : "s"} out.`;
            if (daysToEff < 14) lead += ` That's inside UE's standard 14-day quote SLA — flag urgency on the file and consider a Pending Info hold while docs come in.`;
            else if (daysToEff > 120) lead += ` That's >120 days out — typical for renewals; no urgency, normal triage cadence.`;
            else lead += ` Comfortable lead time; standard triage cadence applies.`;
            if (form.needByDate) {
              const need = new Date(form.needByDate);
              if (need > eff) lead += ` Heads-up: need-by (${form.needByDate}) is AFTER effective (${form.effectiveDate}) — likely a data-entry slip.`;
            }
            return [{ id: newId(), role: "agent", kind: "text", ts: now(), text: lead }];
          }
          if (sid === "ready-to-save") {
            if (!requiredMissing.length && docs.length > 0) {
              return [{ id: newId(), role: "agent", kind: "text", ts: now(),
                text: `Ready to save. All required fields populated, ${docs.length} doc${docs.length === 1 ? "" : "s"} attached. Hitting Save will route to ${acct?.name ?? "the assigned UW"} for triage.` }];
            }
            return [{ id: newId(), role: "agent", kind: "viz", ts: now(), viz: {
              kind: "checklist", title: "Before saving",
              items: [
                { ok: !!form.accountId,           label: "Account selected" },
                { ok: !!form.productLines.length, label: "Product line(s) chosen" },
                { ok: !!form.needByDate,          label: "Need-by date" },
                { ok: !!form.effectiveDate,       label: "Effective date" },
                { ok: !!form.brokerage,           label: "Brokerage assigned", sub: form.brokerage ? "Auto-populated" : "Pick the account to cascade this" },
                { ok: docs.length > 0,            label: "At least one document attached", sub: docs.length ? `${docs.length} attached` : "Drop the broker packet" },
              ],
            } }];
          }
        }}
        freeText={(text) => {
          const t = text.toLowerCase();
          if (/\b(extract|auto.?fill|pull|read.*packet|scan)\b/.test(t)) {
            return [{ id: newId(), role: "agent", kind: "text", ts: now(),
              text: docs.length
                ? `Re-run extraction on the uploaded packet? Re-upload the cover doc and I'll pull account, brokerage, and policy dates again.`
                : `Drop the broker's email or ACORD into Submission Documents and extraction runs automatically on the first upload.` }];
          }
          if (/\b(document|require|need.{0,5}doc|attach|loss.?run|acord)\b/.test(t)) {
            return [{ id: newId(), role: "agent", kind: "text", ts: now(),
              text: form.productLines.length
                ? `For ${form.productLines.join(" + ")}, expect: ${productDocs.slice(0, 5).join(", ")}.`
                : `Pick a product line and I'll list the docs UE typically needs to bind it.` }];
          }
          if (/\b(history|prior|member.?since|seen.*before|renewal)\b/.test(t)) {
            return [{ id: newId(), role: "agent", kind: "text", ts: now(),
              text: acct
                ? acct.id === "3001"
                  ? `${acct.name} — UE member since 2014. Prior submission SUB-7829 in review; 58% 5-yr loss ratio; 2 open ELL claims still developing.`
                  : `${acct.name} (${acct.type}, ${acct.state}) — no prior UE policy on file. Net-new account.`
                : `Pick an account first and I'll pull the UE history.` }];
          }
          if (/\b(date|effective|need.?by|sla|urgent|lead.?time)\b/.test(t)) {
            if (!form.effectiveDate) return [{ id: newId(), role: "agent", kind: "text", ts: now(),
              text: `Set the effective date and I'll check the lead time against UE's 14-day quote SLA.` }];
            const daysToEff = Math.round((new Date(form.effectiveDate).getTime() - Date.now()) / 86400000);
            return [{ id: newId(), role: "agent", kind: "text", ts: now(),
              text: `Effective date is ${daysToEff} day${daysToEff === 1 ? "" : "s"} out — ${daysToEff < 14 ? "tight" : daysToEff > 120 ? "well outside SLA window" : "comfortable lead time"}.` }];
          }
          if (/\b(save|submit|ready|done|complete)\b/.test(t)) {
            return [{ id: newId(), role: "agent", kind: "text", ts: now(),
              text: requiredMissing.length
                ? `Still need: ${requiredMissing.join(", ")} before this can save.`
                : `All required fields look good. ${docs.length} doc${docs.length === 1 ? "" : "s"} attached.` }];
          }
        }}
      />
      <div style={{ fontFamily: font, color: TD }}>

        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

        {/* ── HEADER ──────────────────────────────────────────────────────── */}
        <div style={{ background: N }}>
          <div style={{ height: 4, background: `linear-gradient(90deg,${G} 0%,#A8841C 100%)` }} />
          <div className="px-8 py-5 flex items-center gap-4">
            <button type="button" onClick={() => navigate("/submissions")} className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.78rem", fontWeight: 600 }}>
              <ArrowLeft size={14} /> Submissions
            </button>
            <div style={{ flex: 1 }}>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 style={{ fontSize: "1.20rem", fontWeight: 800, color: "white", lineHeight: 1.2 }}>
                  Create New Submission
                </h1>
                <span
                  className="inline-flex items-center gap-1.5"
                  style={{
                    background: form.submissionKind === "Group" ? "#7B2FBE" : "rgba(255,255,255,0.18)",
                    border: `1px solid ${form.submissionKind === "Group" ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.25)"}`,
                    color: "white",
                    padding: "2px 9px", borderRadius: 4,
                    fontSize: "0.60rem", fontWeight: 800,
                    letterSpacing: "0.08em", textTransform: "uppercase",
                  }}
                >
                  {form.submissionKind === "Group" ? <Users size={10}/> : <User size={10}/>}
                  {form.submissionKind === "Group"
                    ? `Group · ${form.members.length}`
                    : "Individual"}
                </span>
              </div>
              <p style={{ fontSize: "0.76rem", color: "rgba(255,255,255,0.5)", marginTop: 2 }}>
                Initiate the underwriting process · Complete all required fields
              </p>
            </div>
          </div>
        </div>

        {/* ── BREADCRUMB ───────────────────────────────────────────────────── */}
        <div className="flex items-center gap-2 px-8 py-2.5" style={{ background: "white", borderBottom: `1px solid ${BDL}` }}>
          <button type="button" onClick={() => navigate("/")} className="hover:underline" style={{ fontSize: "0.75rem", color: TT }}>Dashboard</button>
          <span style={{ color: BD, fontSize: "0.75rem" }}>/</span>
          <button type="button" onClick={() => navigate("/submissions")} className="hover:underline" style={{ fontSize: "0.75rem", color: TT }}>Submissions</button>
          <span style={{ color: BD, fontSize: "0.75rem" }}>/</span>
          <span style={{ fontSize: "0.75rem", color: N, fontWeight: 600 }}>New Submission</span>
        </div>

        {/* ── FORM ────────────────────────────────────────────────────────── */}
        <form onSubmit={handleSubmit}>
          <div className="px-8 py-6 pb-10" style={{ background: "#EEF1F6", minHeight: 600 }}>

            <div className="grid grid-cols-1 gap-5">

                {/* Submission Documents */}
                <DocumentsSection docs={docs} onChange={handleDocsChange} />

                {/* Inbox prefill banner — shows what was auto-filled and what's missing */}
                {prefillWarnings && !prefillDismissed && (
                  <div style={{
                    background: prefillWarnings.length > 0 ? "#FFF8E6" : "#E8F5EC",
                    border: `1px solid ${prefillWarnings.length > 0 ? "#F0D88A" : "#93C8A0"}`,
                    borderRadius: 8,
                    padding: "14px 18px",
                  }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                      <div style={{
                        width: 28, height: 28, flexShrink: 0, borderRadius: 6,
                        background: prefillWarnings.length > 0 ? "#F0D88A" : "#93C8A0",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        {prefillWarnings.length > 0
                          ? <AlertTriangle size={14} color="#8A5C00" />
                          : <Sparkles      size={14} color="#1A5C30" />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "0.80rem", fontWeight: 800, color: prefillWarnings.length > 0 ? "#8A5C00" : "#1A5C30" }}>
                          {prefillWarnings.length > 0
                            ? "Form pre-filled from Inbox — some fields need your attention"
                            : "Form pre-filled from Inbox"}
                        </div>
                        {prefillSource && (
                          <div style={{ fontSize: "0.68rem", color: TM, marginTop: 2 }}>
                            Source: {prefillSource}
                          </div>
                        )}
                        {prefillWarnings.length > 0 && (
                          <ul style={{ marginTop: 8, paddingLeft: 16, fontSize: "0.72rem", color: TM, lineHeight: 1.5 }}>
                            {prefillWarnings.map((w, i) => (
                              <li key={i}>{w}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                      <button onClick={() => setPrefillDismissed(true)}
                        style={{ background: "none", border: "none", cursor: "pointer", color: TT, padding: 2, borderRadius: 4 }}
                        title="Dismiss">
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                )}

                {/* AI Account Recognition — appears after first doc upload */}
                {recognition && !recognitionDismissed && (
                  <AIRecognitionBanner
                    recognition={recognition}
                    currentKind={form.submissionKind}
                    onUseDetectedKind={() => {
                      set("submissionKind", recognition.detectedKind);
                      if (recognition.detectedKind === "Group" && form.members.length === 0) {
                        setForm(f => ({
                          ...f,
                          members: SAMPLE_PARSED_MEMBERS,
                          groupName: f.groupName || "Central Texas Schools Consortium",
                        }));
                      }
                    }}
                    onDismiss={() => setRecognitionDismissed(true)}
                  />
                )}

                {/* Submission Type */}
                <SectionCard title="Submission Type" accent={N} icon={<FileText size={13}/>}>
                  <FieldLabel required>Type</FieldLabel>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
                    {SUB_TYPES.map(t => {
                      const isActive = form.submissionType === t.id;
                      const c = typeColor(t.id);
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => set("submissionType", t.id)}
                          style={{
                            padding: "14px 16px", textAlign: "left",
                            border: `1.5px solid ${isActive ? c : BD}`,
                            background: isActive ? `${c}08` : "white",
                            cursor: "pointer", transition: "all 0.15s",
                            borderRadius: 10,
                            fontFamily: font,
                          }}>
                          <div style={{
                            width: 30, height: 30, marginBottom: 10,
                            background: isActive ? `${c}15` : "#F0F3F8",
                            border: `1px solid ${isActive ? `${c}40` : BDL}`,
                            borderRadius: 6,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            color: isActive ? c : TT,
                          }}>
                            {t.icon}
                          </div>
                          <div style={{ fontSize: "0.86rem", fontWeight: 700, color: isActive ? c : TD, marginBottom: 4 }}>
                            {t.label}
                          </div>
                          <div style={{ fontSize: "0.70rem", color: TT, lineHeight: 1.4 }}>
                            {t.desc}
                          </div>
                          {isActive && (
                            <div style={{
                              marginTop: 10, display: "flex", alignItems: "center", gap: 4,
                              fontSize: "0.62rem", fontWeight: 700, color: c,
                              textTransform: "uppercase", letterSpacing: "0.07em",
                            }}>
                              <Check size={11}/> Selected
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </SectionCard>

                {/* Account */}
                <SectionCard title={form.submissionKind === "Group" ? "Group Lead Account" : "Account"} accent={N} icon={<Building2 size={13}/>}>
                  <div className="grid grid-cols-1 gap-4">
                    {/* Account Name — searchable dropdown */}
                    <div>
                      <FieldLabel required>{form.submissionKind === "Group" ? "Group Lead Account" : "Account Name"}</FieldLabel>
                      <AccountDropdown value={form.accountId} onChange={handleAccountChange} />
                      {errors.accountId && <p style={{ fontSize: "0.62rem", color: "#B91C1C", marginTop: 4 }}>{errors.accountId}</p>}
                      {form.accountName && (
                        <p style={{ fontSize: "0.62rem", color: "#1A7A4A", marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
                          <Check size={10} />
                          {form.submissionKind === "Group"
                            ? "Lead account resolved · members listed below · brokerage & team auto-populated from lead"
                            : `Account #${form.accountId} resolved · Brokerage & team auto-populated`}
                        </p>
                      )}
                    </div>
                  </div>
                </SectionCard>

                {/* Group Members editor — only shown for group submissions */}
                {form.submissionKind === "Group" && (
                  <SectionCard
                    title="Group Members"
                    accent="#7B2FBE"
                    icon={<Users size={13}/>}
                    badge={form.members.length > 0 ? `${form.members.length} parsed` : undefined}
                  >
                    <GroupMembersEditor
                      members={form.members}
                      groupName={form.groupName}
                      onGroupNameChange={v => set("groupName", v)}
                      onChange={next => setForm(f => ({ ...f, members: next }))}
                    />
                  </SectionCard>
                )}

                {/* Policy */}
                <SectionCard title="Policy" accent={N} icon={<Calendar size={13}/>}>
                  <div className="grid grid-cols-1 gap-4">
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

                {/* Brokerage — always read-only, auto-populated from account */}
                <SectionCard
                  title="Brokerage"
                  accent={G}
                  locked={true}
                  lockedLabel={form.accountId ? "Auto-populated" : "Account Required"}
                  icon={<Building2 size={13}/>}
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

                {/* Underwriting Team — auto-populated from account, editable once an account is selected */}
                <SectionCard
                  title="Underwriting Team"
                  accent={N}
                  badge={form.accountId ? "Auto-populated" : "Account Required"}
                  icon={<User size={13}/>}
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <FieldLabel>Underwriter</FieldLabel>
                      <InlineSelect
                        value={form.underwriterId}
                        onChange={v => set("underwriterId", v)}
                        options={UNDERWRITERS}
                        placeholder="Select underwriter…"
                        disabled={!form.accountId}
                        disabledPlaceholder="Select an account above"
                      />
                    </div>
                    <div>
                      <FieldLabel>Underwriting Specialist</FieldLabel>
                      <InlineSelect
                        value={form.uwSpecialistId}
                        onChange={v => set("uwSpecialistId", v)}
                        options={UW_SPECIALISTS}
                        placeholder="Select specialist…"
                        disabled={!form.accountId}
                        disabledPlaceholder="Select an account above"
                      />
                    </div>
                  </div>
                </SectionCard>

                {/* Notes */}
                <SectionCard title="Notes" accent={N} icon={<MessageSquare size={13}/>}>
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
                          border: `1px solid ${BD}`, borderRadius: 6, background: "white", color: TD,
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

                {/* Submission Stage (replaces Summary Preview at the bottom) */}
                <SectionCard title="Submission Stage" accent={N} icon={<ClipboardCheck size={13}/>}>
                  {/* Stage Dropdown */}
                  <div>
                    <FieldLabel>Current Stage</FieldLabel>
                    <StageDropdown value={form.stage} onChange={v => set("stage", v)} />
                  </div>
                </SectionCard>

                {/* Required reminder */}
                <div className="p-4 flex items-start gap-2.5" style={{ background: "#FFF8E6", border: "1px solid #F0D88A", borderRadius: 6 }}>
                  <AlertCircle size={14} color="#8A5C00" style={{ flexShrink: 0, marginTop: 1 }} />
                  <p style={{ fontSize: "0.72rem", color: "#7A4800", lineHeight: 1.55 }}>
                    <strong>Required:</strong> Account Name, Product(s), Need By Date, and Effective Date.
                  </p>
                </div>

                {/* Action row — Cancel (left), Preview + Create (right), no card backgrounds */}
                <div className="flex items-center justify-between gap-3">

                  {/* Cancel — neutral outlined ripple */}
                  <RippleButton
                    onClick={() => setCancelConfirmOpen(true)}
                    bg="white"
                    bgHover="#F4F6FA"
                    color={TM}
                    border={`1px solid ${BD}`}
                    rippleColor={`${TT}33`}
                    padding="9px 18px"
                  >
                    <X size={15} /> Cancel
                  </RippleButton>

                  {/* Right group — Preview + Create Submission */}
                  <div className="flex items-center gap-3">

                  {/* Preview — neutral outlined ripple */}
                  <RippleButton
                    onClick={() => setPreviewOpen(true)}
                    bg="white"
                    bgHover="#F4F6FA"
                    color={TM}
                    border={`1px solid ${BD}`}
                    rippleColor={`${TT}33`}
                    padding="9px 16px"
                  >
                    <Eye size={13} /> Preview
                  </RippleButton>

                  {/* Create Submission — primary blue ripple */}
                  {submitting ? (
                    <button
                      type="submit"
                      disabled
                      className="inline-flex items-center gap-1.5"
                      style={{
                        background: `${N}80`, color: "white", border: "none",
                        borderRadius: 6, padding: "9px 18px",
                        fontSize: "0.78rem", fontWeight: 700, fontFamily: font,
                        cursor: "default",
                        boxShadow: "0 2px 8px rgba(1,35,212,0.22)",
                      }}
                    >
                      <RefreshCw size={14} style={{ animation: "spin 0.7s linear infinite" }} /> Creating…
                    </button>
                  ) : (
                    <PrimaryButton>
                      <Plus size={15} /> Create Submission
                    </PrimaryButton>
                  )}
                  </div>
                </div>

            </div>
          </div>
        </form>

        {/* ── PREVIEW MODAL ──────────────────────────────────────────────── */}
        {previewOpen && (
          <div
            onClick={() => setPreviewOpen(false)}
            style={{
              position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)",
              zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center",
              padding: "24px",
            }}
          >
            <div
              onClick={e => e.stopPropagation()}
              style={{
                width: "100%", maxWidth: 720, maxHeight: "85vh",
                background: "white", display: "flex", flexDirection: "column",
                borderRadius: 8, overflow: "hidden",
                boxShadow: "0 18px 48px rgba(0,0,0,0.32)", fontFamily: font,
              }}
            >
              {/* Header */}
              <div
                style={{
                  background: N, color: "white",
                  borderBottom: `4px solid ${G}`,
                  padding: "16px 22px",
                  display: "flex", alignItems: "center", gap: 12,
                }}
              >
                <div
                  className="flex items-center justify-center shrink-0"
                  style={{
                    width: 34, height: 34,
                    background: "rgba(255,255,255,0.14)",
                    border: "1px solid rgba(255,255,255,0.25)",
                  }}
                >
                  <Eye size={16} color="white" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h2 style={{ fontSize: "0.98rem", fontWeight: 800, color: "white", lineHeight: 1.2 }}>
                    Application Preview
                  </h2>
                  <p style={{ fontSize: "0.70rem", color: "rgba(255,255,255,0.7)", marginTop: 2 }}>
                    Review before creating · {filledCount}/{REQ_FIELDS.length} required fields complete
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewOpen(false)}
                  aria-label="Close preview"
                  className="flex items-center justify-center transition-opacity hover:opacity-80"
                  style={{
                    width: 30, height: 30,
                    background: "rgba(255,255,255,0.12)",
                    border: "1px solid rgba(255,255,255,0.22)",
                    color: "white", cursor: "pointer",
                  }}
                >
                  <X size={14} />
                </button>
              </div>

              {/* Body */}
              <div style={{ overflowY: "auto", padding: "20px 22px", flex: 1 }}>
                {/* Stage chip */}
                <div
                  className="inline-flex items-center gap-2 px-3 py-1.5 mb-4"
                  style={{
                    background: `${stageCol}12`,
                    border: `1px solid ${stageCol}30`,
                  }}
                >
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: stageCol, flexShrink: 0 }} />
                  <span style={{ fontSize: "0.58rem", fontWeight: 800, color: stageCol, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    {groupForStage(form.stage)}
                  </span>
                  <span style={{ fontSize: "0.74rem", fontWeight: 700, color: stageCol }}>
                    · {form.stage}
                  </span>
                </div>

                {/* 2-col summary table */}
                <div style={{ border: `1px solid ${BDL}`, borderRadius: 8, overflow: "hidden" }}>
                  {summaryRows.map((row, i) => (
                    <div
                      key={row.label}
                      className="grid grid-cols-3 gap-3 px-4 py-2.5"
                      style={{
                        borderBottom: i < summaryRows.length - 1 ? `1px solid ${BDL}` : "none",
                        background: i % 2 === 0 ? "white" : "#FAFBFC",
                      }}
                    >
                      <span style={{ fontSize: "0.62rem", fontWeight: 700, color: TT, textTransform: "uppercase", letterSpacing: "0.07em" }}>
                        {row.label}
                      </span>
                      <span style={{ gridColumn: "span 2", fontSize: "0.78rem", color: TD, fontWeight: 600, wordBreak: "break-word" }}>
                        {row.value}
                      </span>
                    </div>
                  ))}

                  {/* Attached Docs row */}
                  <div
                    className="grid grid-cols-3 gap-3 px-4 py-2.5"
                    style={{ background: docs.length ? "#FAFBFC" : "white" }}
                  >
                    <span style={{ fontSize: "0.62rem", fontWeight: 700, color: TT, textTransform: "uppercase", letterSpacing: "0.07em" }}>
                      Attached Docs
                    </span>
                    <div style={{ gridColumn: "span 2" }}>
                      {docs.length === 0 ? (
                        <span style={{ fontSize: "0.78rem", color: TT }}>None</span>
                      ) : (
                        <ul style={{ listStyle: "disc", paddingLeft: 18, margin: 0 }}>
                          {docs.map(d => (
                            <li key={d.id} style={{ fontSize: "0.76rem", color: TD, fontWeight: 500, lineHeight: 1.55 }}>
                              {d.name}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div
                className="flex items-center justify-end gap-2 px-5 py-3"
                style={{ background: "#F4F6FA", borderTop: `1px solid ${BDL}` }}
              >
                <RippleButton
                  onClick={() => setPreviewOpen(false)}
                  bg="white"
                  bgHover="#F4F6FA"
                  color={TM}
                  border={`1px solid ${BD}`}
                  rippleColor={`${TT}33`}
                >
                  Close
                </RippleButton>
              </div>
            </div>
          </div>
        )}

        {/* ── CANCEL CONFIRMATION MODAL ──────────────────────────────────── */}
        {cancelConfirmOpen && (
          <div
            onClick={() => setCancelConfirmOpen(false)}
            style={{
              position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)",
              zIndex: 1100, display: "flex", alignItems: "center", justifyContent: "center",
              padding: "24px",
            }}
          >
            <div
              onClick={e => e.stopPropagation()}
              style={{
                width: "100%", maxWidth: 460,
                background: "white",
                borderRadius: 8, overflow: "hidden",
                boxShadow: "0 18px 48px rgba(0,0,0,0.32)", fontFamily: font,
              }}
            >
              {/* Body */}
              <div className="px-6 pt-6 pb-5 flex items-start gap-3">
                <div
                  className="flex items-center justify-center shrink-0"
                  style={{
                    width: 38, height: 38,
                    background: "#FFF8E6",
                    border: "1px solid #F0D88A",
                  }}
                >
                  <AlertTriangle size={18} color="#8A5C00" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ fontSize: "0.95rem", fontWeight: 800, color: TD, lineHeight: 1.25 }}>
                    Discard this submission?
                  </h3>
                  <p style={{ fontSize: "0.76rem", color: TM, marginTop: 6, lineHeight: 1.55 }}>
                    You can save your progress as a draft and pick it back up later, or discard it
                    entirely. Discarded submissions can't be recovered.
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div
                className="flex items-center justify-end gap-2 px-5 py-3"
                style={{ background: "#F4F6FA", borderTop: `1px solid ${BDL}` }}
              >
                <RippleButton
                  onClick={() => setCancelConfirmOpen(false)}
                  bg="white"
                  bgHover="#F4F6FA"
                  color={TM}
                  border={`1px solid ${BD}`}
                  rippleColor={`${TT}33`}
                >
                  Keep Editing
                </RippleButton>
                <RippleButton
                  onClick={handleDiscard}
                  bg="white"
                  bgHover="#FEF2F2"
                  color="#B91C1C"
                  border="1px solid #E8A8A8"
                  rippleColor="rgba(185,28,28,0.25)"
                >
                  Discard
                </RippleButton>
                <PrimaryButton onClick={handleSaveDraft}>
                  <Save size={13} /> Save as Draft
                </PrimaryButton>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
