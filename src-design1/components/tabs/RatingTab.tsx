import { useState, useCallback, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import {
  Check, Plus, X, Info, Shield, FileText, AlertCircle,
  ShieldCheck, UserCheck, Briefcase, Globe, Lock, Car,
  Users, Building2, Send, Mail, GitBranch, Save,
  Copy, CheckCircle2, DollarSign, Layers, ChevronDown,
  BookOpen, Library, Calendar, Bell, Star, Search, Trash2,
  Pencil, Eye, ExternalLink, MoreVertical, AlertTriangle,
} from "lucide-react";
import { useSubmissionWorkspaceOptional } from "../../context/SubmissionWorkspaceContext";
import { useCompanion, newId, now } from "../companion/CompanionContext";

/* ─── Design tokens ─────────────────────────────────────────────────────── */
const N    = "#0123D4";
const G    = "#C9A227";
const BD   = "#C4CDD8";
const BDL  = "#DCE3EC";
const TH   = "#F0F3F8";
const TD   = "#1A2530";
const TM   = "#4A5D6E";
const TT   = "#7A8FA3";
const font = "'Source Sans 3', system-ui, sans-serif";

const OPTION_COLORS  = [N, "#7B2FBE", "#1A7A4A", "#B45309", "#0E7490", "#9D174D", "#4338CA", "#065F46"];

/* ─── Types ─────────────────────────────────────────────────────────────── */
interface CoverageField {
  label: string; value: string;
  type: "select" | "text" | "date"; options?: string[];
}
interface CoverageItem {
  id: string; label: string; desc: string;
  required: boolean; checked: boolean; price: number;
}
interface Endorsement {
  id: string; label: string; desc: string;
  premium: number; included: boolean;
}
interface LibraryEndorsement {
  id: string; label: string; desc: string; premium: number;
}
interface ProductDef {
  id: string; label: string; abbr: string; desc: string;
  icon: React.ReactNode; category: string; categoryColor: string;
  basePremium: number;
  coverageFields: CoverageField[];
  coverageItems: CoverageItem[];
  endorsements: Endorsement[];          // default / informational
}
type OptionStatus = "draft" | "quoted" | "bound" | "declined";
interface ProductOption {
  id: string; label: string; color: string;
  status: OptionStatus;
  coverageFields: CoverageField[];
  coverageItems: CoverageItem[];
  addedEndorsements: Endorsement[];     // from library only
  manualPct: number;
  createdAt: string;
  createdBy: string;
}
type SubTab = "policy" | "endorsements" | "premium" | "schedules" | "memberBenefits" | "notifications";
type QuoteStatus = "draft" | "issued" | "sent" | "referred";

const OPTION_STATUS_META: Record<OptionStatus, { label: string; color: string; bg: string; border: string }> = {
  draft:    { label: "Draft",    color: "#4A5D6E", bg: "#F1F5F9", border: "#CBD5E1" },
  quoted:   { label: "Quoted",   color: "#0123D4", bg: "#E0E7FF", border: "#A5B4FC" },
  bound:    { label: "Bound",    color: "#15803D", bg: "#E8F5EC", border: "#86EFAC" },
  declined: { label: "Declined", color: "#B91C1C", bg: "#FEE2E2", border: "#FCA5A5" },
};

/* ─── Product catalog ───────────────────────────────────────────────────── */
const PRODUCTS: ProductDef[] = [
  {
    id: "epl", label: "Employment Practices Liability", abbr: "EPL",
    desc: "Discrimination, harassment, wrongful termination & retaliation",
    icon: <UserCheck size={16} />, category: "Liability", categoryColor: N,
    basePremium: 14200,
    coverageFields: [
      { label: "Each Claim Limit",       value: "$1,000,000",   type: "select", options: ["$500,000","$1,000,000","$2,000,000","$3,000,000"] },
      { label: "Aggregate Limit",        value: "$3,000,000",   type: "select", options: ["$1,000,000","$2,000,000","$3,000,000","$5,000,000"] },
      { label: "Retention (Deductible)", value: "$50,000",      type: "select", options: ["$10,000","$25,000","$50,000","$100,000","$250,000"] },
      { label: "Retroactive Date",       value: "07/01/2019",   type: "date" },
      { label: "Defense Basis",          value: "Within Limit", type: "select", options: ["Within Limit","Outside Limit"] },
      { label: "Coverage Territory",     value: "USA & Canada", type: "select", options: ["USA Only","USA & Canada","Worldwide"] },
    ],
    coverageItems: [
      { id: "epl-c1", label: "Claims-Made Coverage",             desc: "Covers claims first made during the policy period",                    required: true,  checked: true,  price: 0    },
      { id: "epl-c2", label: "Wrongful Termination",             desc: "Actual or constructive wrongful dismissal of an employee",             required: true,  checked: true,  price: 0    },
      { id: "epl-c3", label: "Discrimination (Title VII)",       desc: "Race, sex, religion, national origin, age & disability discrimination", required: true,  checked: true,  price: 0    },
      { id: "epl-c4", label: "Harassment / Hostile Work Env.",   desc: "Sexual harassment and hostile work environment claims",                required: false, checked: true,  price: 2800 },
      { id: "epl-c5", label: "Retaliation",                      desc: "Retaliation against employees for protected activity",                 required: false, checked: true,  price: 2100 },
      { id: "epl-c6", label: "Failure to Promote",               desc: "Claims of discriminatory promotional practices",                      required: false, checked: false, price: 1400 },
      { id: "epl-c7", label: "EEOC Charge Defense",              desc: "Defense costs for Equal Employment Opportunity Commission charges",    required: false, checked: false, price: 1600 },
      { id: "epl-c8", label: "Punitive Damages (where insurable)",desc: "Punitive damages coverage where permitted by law",                   required: false, checked: false, price: 2200 },
    ],
    endorsements: [
      { id: "epl-e1", label: "Third-Party EPL",            desc: "Extends coverage to claims by non-employees (vendors, students)", premium: 3200, included: false },
      { id: "epl-e2", label: "Wage & Hour Defense",        desc: "Defense costs for wage/hour class action violations",             premium: 2800, included: false },
      { id: "epl-e3", label: "Crisis Management",          desc: "PR & communications costs after a covered EPL event",            premium: 1500, included: false },
      { id: "epl-e4", label: "Retroactive Date Extension", desc: "Extends retroactive date by 2 additional years",                 premium: 4100, included: false },
    ],
  },
  {
    id: "ell", label: "Educators Legal Liability", abbr: "ELL",
    desc: "Professional errors & omissions for educators and administrators",
    icon: <ShieldCheck size={16} />, category: "Liability", categoryColor: N,
    basePremium: 16400,
    coverageFields: [
      { label: "Each Claim Limit",   value: "$1,000,000",   type: "select", options: ["$500,000","$1,000,000","$2,000,000","$3,000,000"] },
      { label: "Aggregate Limit",    value: "$3,000,000",   type: "select", options: ["$1,000,000","$2,000,000","$3,000,000","$5,000,000"] },
      { label: "Retention",          value: "$25,000",      type: "select", options: ["$10,000","$25,000","$50,000","$100,000"] },
      { label: "Retroactive Date",   value: "07/01/2018",   type: "date" },
      { label: "Coverage Territory", value: "USA & Canada", type: "select", options: ["USA Only","USA & Canada","Worldwide"] },
      { label: "Defense Basis",      value: "Within Limit", type: "select", options: ["Within Limit","Outside Limit"] },
    ],
    coverageItems: [
      { id: "ell-c1", label: "Professional Liability (E&O)",    desc: "Negligent acts, errors & omissions by educators",                  required: true,  checked: true,  price: 0    },
      { id: "ell-c2", label: "Civil Rights Violation Defense",  desc: "Defense for 42 U.S.C. §1983 civil rights claims",                 required: true,  checked: true,  price: 0    },
      { id: "ell-c3", label: "Special Education (IDEA) Defense",desc: "Defense for Individuals with Disabilities Education Act claims",   required: true,  checked: true,  price: 0    },
      { id: "ell-c4", label: "Student Discipline Defense",      desc: "Expulsion, suspension and disciplinary proceeding defense",        required: false, checked: true,  price: 2400 },
      { id: "ell-c5", label: "Academic Decision Liability",     desc: "Graduation, grading, academic standing and enrollment decisions",  required: false, checked: true,  price: 1800 },
      { id: "ell-c6", label: "FERPA Defense",                   desc: "Student privacy and records violation defense",                   required: false, checked: false, price: 1200 },
      { id: "ell-c7", label: "Title IX Defense",                desc: "Sex discrimination and education program access claims",           required: false, checked: false, price: 2000 },
      { id: "ell-c8", label: "Student Activity Defense",        desc: "Liability arising from school-sponsored student activities",       required: false, checked: false, price: 1600 },
    ],
    endorsements: [
      { id: "ell-e1", label: "Special Education Enhancement", desc: "Enhanced defense sublimit for IDEA/504 plan disputes",    premium: 2600, included: false },
      { id: "ell-e2", label: "Student-to-Student Liability",  desc: "Negligent supervision in student altercation claims",     premium: 1800, included: false },
      { id: "ell-e3", label: "Online Learning Extension",     desc: "Extends ELL to remote/online instruction activities",     premium: 1200, included: false },
      { id: "ell-e4", label: "Tutoring Services Ext.",        desc: "Covers private tutoring programs operated by district",   premium: 900,  included: false },
    ],
  },
  {
    id: "gl", label: "General Liability", abbr: "GL",
    desc: "Bodily injury, property damage, personal & advertising injury",
    icon: <Shield size={16} />, category: "Liability", categoryColor: N,
    basePremium: 11200,
    coverageFields: [
      { label: "Each Occurrence",            value: "$1,000,000", type: "select", options: ["$1,000,000","$2,000,000"] },
      { label: "General Aggregate",          value: "$3,000,000", type: "select", options: ["$2,000,000","$3,000,000","$5,000,000"] },
      { label: "Products/Completed Ops.",    value: "$2,000,000", type: "select", options: ["$1,000,000","$2,000,000","$3,000,000"] },
      { label: "Personal & Adv. Injury",     value: "$1,000,000", type: "select", options: ["$500,000","$1,000,000","$2,000,000"] },
      { label: "Med. Payments (per person)", value: "$10,000",    type: "select", options: ["$5,000","$10,000","$25,000"] },
      { label: "Fire Legal Liability",       value: "$300,000",   type: "select", options: ["$100,000","$300,000","$500,000"] },
    ],
    coverageItems: [
      { id: "gl-c1", label: "Premises & Operations",          desc: "Bodily injury and property damage on school premises",            required: true,  checked: true,  price: 0    },
      { id: "gl-c2", label: "Products & Completed Operations",desc: "Liability arising from products and completed work",             required: true,  checked: true,  price: 0    },
      { id: "gl-c3", label: "Personal & Advertising Injury",  desc: "Libel, slander, copyright infringement, wrongful eviction",      required: true,  checked: true,  price: 0    },
      { id: "gl-c4", label: "Medical Payments",               desc: "Medical expenses regardless of fault for on-premises injuries",   required: false, checked: true,  price: 1800 },
      { id: "gl-c5", label: "Fire Legal Liability",           desc: "Damage to rented or borrowed premises caused by fire",            required: false, checked: true,  price: 1200 },
      { id: "gl-c6", label: "Host Liquor Liability",          desc: "Bodily injury from alcohol served at school-sponsored events",    required: false, checked: false, price: 1600 },
      { id: "gl-c7", label: "Contractual Liability",          desc: "Liability assumed under insured contracts and agreements",        required: false, checked: false, price: 1100 },
      { id: "gl-c8", label: "Non-Owned Watercraft",           desc: "Liability for watercraft less than 51 feet not owned by district",required: false, checked: false, price: 800  },
    ],
    endorsements: [
      { id: "gl-e1", label: "Sexual Abuse & Molestation", desc: "SAM liability for the institution and its employees",  premium: 8400, included: false },
      { id: "gl-e2", label: "Liquor Liability Extension", desc: "Events where alcohol is served on district premises",  premium: 1600, included: false },
      { id: "gl-e3", label: "Volunteer Liability",        desc: "Extends GL to district-approved volunteer activities", premium: 900,  included: false },
      { id: "gl-e4", label: "Broad Form Contractual",     desc: "Broadens contractual liability assumed in contracts",  premium: 1100, included: false },
    ],
  },
  {
    id: "ml", label: "Management Liability", abbr: "ML",
    desc: "D&O for board members, trustees & senior administrators",
    icon: <Briefcase size={16} />, category: "Liability", categoryColor: N,
    basePremium: 9800,
    coverageFields: [
      { label: "Each Claim Limit",  value: "$2,000,000",    type: "select", options: ["$1,000,000","$2,000,000","$3,000,000","$5,000,000"] },
      { label: "Aggregate Limit",   value: "$4,000,000",    type: "select", options: ["$2,000,000","$4,000,000","$5,000,000","$10,000,000"] },
      { label: "Retention",         value: "$25,000",       type: "select", options: ["$10,000","$25,000","$50,000","$100,000"] },
      { label: "Defense Basis",     value: "Outside Limit", type: "select", options: ["Within Limit","Outside Limit"] },
      { label: "Continuity Date",   value: "07/01/2015",    type: "date" },
      { label: "Discovery Period",  value: "12 Months",     type: "select", options: ["12 Months","24 Months","36 Months"] },
    ],
    coverageItems: [
      { id: "ml-c1", label: "Directors & Officers Liability",  desc: "Wrongful acts by board members, trustees and senior officials",    required: true,  checked: true,  price: 0    },
      { id: "ml-c2", label: "Advancement of Defense Costs",    desc: "Defense costs advanced prior to final adjudication",              required: true,  checked: true,  price: 0    },
      { id: "ml-c3", label: "Entity Coverage",                 desc: "Covers the institution itself for governance claims",             required: false, checked: true,  price: 2600 },
      { id: "ml-c4", label: "Employment Practices (D&O only)", desc: "D&O-side EPL coverage for discrimination at board level",         required: false, checked: true,  price: 1800 },
      { id: "ml-c5", label: "Fiduciary Liability",             desc: "ERISA fiduciary duty breaches by plan administrators",            required: false, checked: false, price: 3200 },
      { id: "ml-c6", label: "Government Investigation Defense",desc: "Defense costs for regulatory and government investigations",      required: false, checked: false, price: 2200 },
      { id: "ml-c7", label: "Employed Lawyers Coverage",       desc: "In-house counsel acting in a legal/advisory capacity",           required: false, checked: false, price: 1600 },
      { id: "ml-c8", label: "Crisis Event Coverage",           desc: "PR and communication costs following a governance scandal",      required: false, checked: false, price: 1400 },
    ],
    endorsements: [
      { id: "ml-e1", label: "Full Entity Coverage",         desc: "Expands entity coverage to all wrongful act types",     premium: 3800, included: false },
      { id: "ml-e2", label: "Employed Lawyers Enhancement", desc: "Increased sublimit for in-house counsel defense",       premium: 2200, included: false },
      { id: "ml-e3", label: "Fiduciary Liability",          desc: "Standalone ERISA fiduciary liability coverage",         premium: 4600, included: false },
      { id: "ml-e4", label: "Run-Off Coverage (3-yr)",      desc: "Extended reporting period for departing board members", premium: 5100, included: false },
    ],
  },
  {
    id: "property", label: "Property", abbr: "Prop",
    desc: "Buildings, contents, equipment & business interruption",
    icon: <Building2 size={16} />, category: "Property & Auto", categoryColor: "#1A7A4A",
    basePremium: 18500,
    coverageFields: [
      { label: "Total Insured Value (TIV)", value: "$185,000,000",    type: "text" },
      { label: "Building Coverage",         value: "$160,000,000",    type: "text" },
      { label: "Contents Coverage",         value: "$18,000,000",     type: "text" },
      { label: "Deductible (All Peril)",    value: "$25,000",         type: "select", options: ["$10,000","$25,000","$50,000","$100,000"] },
      { label: "Coinsurance",               value: "90%",             type: "select", options: ["80%","90%","100%"] },
      { label: "Valuation Basis",           value: "Replacement Cost",type: "select", options: ["Replacement Cost","Actual Cash Value"] },
    ],
    coverageItems: [
      { id: "prop-c1", label: "Buildings & Structures",       desc: "All school buildings including portables and outbuildings",         required: true,  checked: true,  price: 0    },
      { id: "prop-c2", label: "Business Personal Property",   desc: "Furniture, fixtures, equipment, and inventory",                    required: true,  checked: true,  price: 0    },
      { id: "prop-c3", label: "Business Income / Extra Exp.", desc: "Lost revenue and extra expenses during period of restoration",     required: true,  checked: true,  price: 0    },
      { id: "prop-c4", label: "Ordinance or Law",             desc: "Additional costs to comply with ordinances during rebuild",        required: false, checked: true,  price: 4200 },
      { id: "prop-c5", label: "Valuable Papers & Records",    desc: "Reproduction costs for lost or damaged documents and records",     required: false, checked: false, price: 1800 },
      { id: "prop-c6", label: "Electronic Data Processing",   desc: "Computers, servers, network equipment and electronic media",       required: false, checked: false, price: 3200 },
      { id: "prop-c7", label: "Fine Arts & Collections",      desc: "Scheduled coverage for artwork, trophies and historical artifacts",required: false, checked: false, price: 1400 },
      { id: "prop-c8", label: "Outdoor Property",             desc: "Fences, signs, antennas and outdoor equipment",                   required: false, checked: false, price: 900  },
    ],
    endorsements: [
      { id: "prop-e1", label: "Equipment Breakdown", desc: "Mechanical & electrical breakdown including boilers", premium: 6200,  included: false },
      { id: "prop-e2", label: "Flood Extension",     desc: "First-dollar flood coverage above NFIP limits",       premium: 9800,  included: false },
      { id: "prop-e3", label: "Earthquake",          desc: "Earthquake damage coverage (Zone C rated)",           premium: 14200, included: false },
      { id: "prop-e4", label: "Inland Marine",       desc: "Coverage for property in transit and off-premises",   premium: 2100,  included: false },
    ],
  },
  {
    id: "auto", label: "Commercial Automobile", abbr: "Auto",
    desc: "Liability & physical damage for school vehicles",
    icon: <Car size={16} />, category: "Property & Auto", categoryColor: "#1A7A4A",
    basePremium: 7400,
    coverageFields: [
      { label: "Combined Single Limit",    value: "$1,000,000", type: "select", options: ["$500,000","$1,000,000","$2,000,000"] },
      { label: "Uninsured Motorist",       value: "$1,000,000", type: "select", options: ["$250,000","$500,000","$1,000,000"] },
      { label: "Medical Payments",         value: "$10,000",    type: "select", options: ["$5,000","$10,000","$25,000"] },
      { label: "Comprehensive Deductible", value: "$2,500",     type: "select", options: ["$1,000","$2,500","$5,000"] },
      { label: "Collision Deductible",     value: "$5,000",     type: "select", options: ["$2,500","$5,000","$10,000"] },
      { label: "Number of Vehicles",       value: "48",         type: "text" },
    ],
    coverageItems: [
      { id: "auto-c1", label: "Auto Liability",                desc: "Bodily injury and property damage from vehicle accidents",          required: true,  checked: true,  price: 0    },
      { id: "auto-c2", label: "Uninsured Motorist",            desc: "Protection when at-fault driver is uninsured or underinsured",     required: true,  checked: true,  price: 0    },
      { id: "auto-c3", label: "Medical Payments",              desc: "Medical expenses for occupants injured in covered vehicles",        required: true,  checked: true,  price: 0    },
      { id: "auto-c4", label: "Comprehensive Physical Damage", desc: "Non-collision losses: theft, vandalism, weather, fire",            required: false, checked: true,  price: 2400 },
      { id: "auto-c5", label: "Collision Physical Damage",     desc: "Damage to covered vehicles from collision with another object",    required: false, checked: true,  price: 2200 },
      { id: "auto-c6", label: "Hired Auto Liability",          desc: "Liability for vehicles rented or leased by the district",          required: false, checked: false, price: 1200 },
      { id: "auto-c7", label: "Non-Owned Auto Liability",      desc: "Liability for employee-owned vehicles on district business",       required: false, checked: false, price: 1000 },
      { id: "auto-c8", label: "Towing & Labor",                desc: "Towing and labor costs when a covered vehicle breaks down",        required: false, checked: false, price: 400  },
    ],
    endorsements: [
      { id: "auto-e1", label: "Hired & Non-Owned Auto",   desc: "Liability for employee-owned & rented vehicles",       premium: 2100, included: false },
      { id: "auto-e2", label: "Student Transportation",   desc: "Enhanced coverage for district-operated school buses",  premium: 3400, included: false },
      { id: "auto-e3", label: "Drive Other Car Coverage", desc: "Personal auto extension for named executives",          premium: 800,  included: false },
      { id: "auto-e4", label: "Gap Coverage",             desc: "Covers gap between ACV and loan/lease balance",         premium: 600,  included: false },
    ],
  },
  {
    id: "crime", label: "Crime / Fidelity", abbr: "Crime",
    desc: "Employee dishonesty, forgery, theft & funds transfer fraud",
    icon: <Lock size={16} />, category: "Specialty", categoryColor: "#7B2FBE",
    basePremium: 3800,
    coverageFields: [
      { label: "Employee Dishonesty",  value: "$500,000",  type: "select", options: ["$250,000","$500,000","$1,000,000","$2,000,000"] },
      { label: "Forgery / Alteration", value: "$500,000",  type: "select", options: ["$250,000","$500,000","$1,000,000"] },
      { label: "Money & Securities",   value: "$100,000",  type: "select", options: ["$50,000","$100,000","$250,000"] },
      { label: "Computer Fraud",       value: "$500,000",  type: "select", options: ["$250,000","$500,000","$1,000,000"] },
      { label: "Deductible",           value: "$5,000",    type: "select", options: ["$2,500","$5,000","$10,000","$25,000"] },
      { label: "Discovery Period",     value: "12 Months", type: "select", options: ["12 Months","24 Months","36 Months"] },
    ],
    coverageItems: [
      { id: "crime-c1", label: "Employee Dishonesty",              desc: "Theft, embezzlement or fraud by employees or volunteers",       required: true,  checked: true,  price: 0    },
      { id: "crime-c2", label: "Forgery & Alteration",             desc: "Loss from forged or altered checks, drafts or promissory notes",required: true,  checked: true,  price: 0    },
      { id: "crime-c3", label: "Money & Securities (On Premises)", desc: "Theft, destruction or disappearance of money on premises",      required: true,  checked: true,  price: 0    },
      { id: "crime-c4", label: "Money & Securities (In Transit)",  desc: "Theft of money or securities while being transported",          required: false, checked: true,  price: 1200 },
      { id: "crime-c5", label: "Computer Fraud",                   desc: "Loss from unauthorized computer access and manipulation",       required: false, checked: true,  price: 1400 },
      { id: "crime-c6", label: "Funds Transfer Fraud",             desc: "Fraudulent transfer instructions causing financial loss",       required: false, checked: false, price: 1800 },
      { id: "crime-c7", label: "Social Engineering Fraud",         desc: "Deceptive instruction losses from impersonation schemes",       required: false, checked: false, price: 1600 },
      { id: "crime-c8", label: "Vendor / Client Fraud",            desc: "Impersonation of vendors or clients in financial transactions", required: false, checked: false, price: 1200 },
    ],
    endorsements: [
      { id: "crime-e1", label: "Social Engineering Fraud",   desc: "Covers losses from deceptive instruction schemes",    premium: 2800, included: false },
      { id: "crime-e2", label: "Funds Transfer Fraud",       desc: "Covers unauthorized electronic funds transfers",       premium: 3100, included: false },
      { id: "crime-e3", label: "Vendor/Client Fraud",        desc: "Impersonation of vendors or clients in transactions",  premium: 1900, included: false },
      { id: "crime-e4", label: "Extended Discovery (12 mo)", desc: "Extended reporting period after policy expiry",        premium: 1200, included: false },
    ],
  },
  {
    id: "cyber", label: "Cyber Liability", abbr: "Cyber",
    desc: "Data breach, ransomware, network security & privacy liability",
    icon: <Globe size={16} />, category: "Specialty", categoryColor: "#7B2FBE",
    basePremium: 8600,
    coverageFields: [
      { label: "Each Claim / Incident",     value: "$2,000,000", type: "select", options: ["$1,000,000","$2,000,000","$3,000,000","$5,000,000"] },
      { label: "Aggregate Limit",           value: "$4,000,000", type: "select", options: ["$2,000,000","$4,000,000","$5,000,000","$10,000,000"] },
      { label: "Retention",                 value: "$50,000",    type: "select", options: ["$25,000","$50,000","$100,000","$250,000"] },
      { label: "Breach Response Sub-limit", value: "$500,000",   type: "select", options: ["$250,000","$500,000","$1,000,000"] },
      { label: "Ransomware Sub-limit",      value: "$1,000,000", type: "select", options: ["$500,000","$1,000,000","$2,000,000"] },
      { label: "Waiting Period (BI)",       value: "8 Hours",    type: "select", options: ["4 Hours","8 Hours","12 Hours","24 Hours"] },
    ],
    coverageItems: [
      { id: "cyber-c1", label: "Network Security Liability",       desc: "Failure to prevent unauthorized access, malware, DoS attacks",  required: true,  checked: true,  price: 0    },
      { id: "cyber-c2", label: "Privacy Liability",                desc: "Violation of privacy laws and unauthorized disclosure of data",  required: true,  checked: true,  price: 0    },
      { id: "cyber-c3", label: "First-Party Data Breach Response", desc: "Notification costs, credit monitoring, forensics, PR",          required: true,  checked: true,  price: 0    },
      { id: "cyber-c4", label: "Business Interruption",            desc: "Lost revenue and extra expenses from a cyber event",            required: false, checked: true,  price: 2800 },
      { id: "cyber-c5", label: "Cyber Extortion / Ransomware",     desc: "Extortion demands, ransom payments and response costs",         required: false, checked: true,  price: 2400 },
      { id: "cyber-c6", label: "Regulatory Defense & Penalties",   desc: "Fines and penalties from FERPA, HIPAA, state privacy regulators",required: false, checked: false, price: 2200 },
      { id: "cyber-c7", label: "Media Liability",                  desc: "Defamation, libel and intellectual property claims in media",   required: false, checked: false, price: 1400 },
      { id: "cyber-c8", label: "Dependent Systems Failure",        desc: "Losses from failure of third-party technology vendors",         required: false, checked: false, price: 2000 },
    ],
    endorsements: [
      { id: "cyber-e1", label: "Ransomware Enhancement",    desc: "Increases ransomware sublimit & adds crisis support", premium: 4200, included: false },
      { id: "cyber-e2", label: "Dependent Systems Failure", desc: "Third-party system failure outage coverage",           premium: 3600, included: false },
      { id: "cyber-e3", label: "Reputational Harm",         desc: "Revenue loss from cyber-related reputational damage",  premium: 2800, included: false },
      { id: "cyber-e4", label: "Social Engineering",        desc: "Phishing and social engineering financial losses",     premium: 3100, included: false },
    ],
  },
  {
    id: "student", label: "Student Accident", abbr: "SA",
    desc: "Medical benefits for students injured in school-sponsored activities",
    icon: <Users size={16} />, category: "Specialty", categoryColor: "#7B2FBE",
    basePremium: 2800,
    coverageFields: [
      { label: "Maximum Benefit",          value: "$25,000",    type: "select", options: ["$10,000","$25,000","$50,000","$100,000"] },
      { label: "Accidental Death Benefit", value: "$10,000",    type: "select", options: ["$5,000","$10,000","$25,000"] },
      { label: "Dental Benefit",           value: "$2,500",     type: "select", options: ["$1,000","$2,500","$5,000"] },
      { label: "Deductible",               value: "$0",         type: "select", options: ["$0","$100","$250","$500"] },
      { label: "Coverage Period",          value: "School Year",type: "select", options: ["School Year","24-Hour","Sports Only"] },
      { label: "Covered Students",         value: "14,200",     type: "text" },
    ],
    coverageItems: [
      { id: "sa-c1", label: "Accidental Medical Expense",     desc: "Medical expenses for accidental injuries on school premises",    required: true,  checked: true,  price: 0   },
      { id: "sa-c2", label: "Accidental Death & Dismemberment",desc: "Lump-sum benefit for accidental death or loss of limb",        required: true,  checked: true,  price: 0   },
      { id: "sa-c3", label: "School-Time Coverage",           desc: "Injuries during school hours and school-sponsored activities",  required: true,  checked: true,  price: 0   },
      { id: "sa-c4", label: "Athletic Participation",         desc: "Injuries sustained during organized athletic activities",        required: false, checked: true,  price: 800 },
      { id: "sa-c5", label: "Extended Coverage (24-Hour)",    desc: "Extends coverage beyond school hours to all daily activities",  required: false, checked: false, price: 1400 },
      { id: "sa-c6", label: "Catastrophic Coverage",          desc: "Benefit for catastrophic injuries with permanent disability",   required: false, checked: false, price: 1200 },
    ],
    endorsements: [
      { id: "sa-e1", label: "Catastrophic Benefit",     desc: "Additional benefit for catastrophic permanent injuries",  premium: 1600, included: false },
      { id: "sa-e2", label: "Athletic Enhancement",     desc: "Increased limits for varsity athletic injuries",          premium: 2200, included: false },
      { id: "sa-e3", label: "Foreign Student Coverage", desc: "Extends coverage to international exchange students",      premium: 800,  included: false },
    ],
  },
];

/* ─── Endorsements library catalog (per product) ──────────────────────���─── */
const ENDORSEMENTS_LIBRARY: Record<string, LibraryEndorsement[]> = {
  epl: [
    { id: "epl-lib1", label: "School Board Liability",    desc: "Personal liability for board members in employment decisions",    premium: 2400 },
    { id: "epl-lib2", label: "Settlement Consent Waiver", desc: "Allows settlement without insured consent within retention",     premium: 1800 },
    { id: "epl-lib3", label: "Immigration-Related EPL",   desc: "Claims from immigration documentation requirements",              premium: 1100 },
    { id: "epl-lib4", label: "Pre-Litigation Mediation",  desc: "Covers costs of pre-litigation mediation proceedings",            premium: 900  },
    { id: "epl-lib5", label: "Leased Workers Extension",  desc: "Extends coverage to temporary and leased staff",                 premium: 1600 },
  ],
  ell: [
    { id: "ell-lib1", label: "504 Plan Defense Enhancement", desc: "Enhanced sublimit for Section 504 plan disputes",               premium: 1400 },
    { id: "ell-lib2", label: "Teacher Certification Defense",desc: "Defense costs for teaching license revocation proceedings",     premium: 1600 },
    { id: "ell-lib3", label: "Curriculum Liability Ext.",    desc: "Coverage for claims arising from curriculum design or content", premium: 1300 },
    { id: "ell-lib4", label: "International Programs",       desc: "Extends ELL to international student exchange programs",        premium: 2200 },
    { id: "ell-lib5", label: "Parent/Guardian Defense",      desc: "Defense for disputes brought by parents or guardians",          premium: 1100 },
  ],
  gl: [
    { id: "gl-lib1", label: "Assault & Battery",            desc: "Bodily injury from fights or assaults on school property",      premium: 3200 },
    { id: "gl-lib2", label: "Contractors Blanket AI",        desc: "Automatic additional insured for contractors on premises",      premium: 1400 },
    { id: "gl-lib3", label: "Special Events Extension",      desc: "Extends GL to approved off-campus special events",             premium: 1100 },
    { id: "gl-lib4", label: "Athletic Participants",         desc: "Liability for student injuries during athletic events",         premium: 2600 },
    { id: "gl-lib5", label: "Named Perils Extension",        desc: "Expands covered perils beyond standard GL form",               premium: 1800 },
  ],
  ml: [
    { id: "ml-lib1", label: "Bond Call Protection",     desc: "Protection for called or defaulted financial bonds",             premium: 3600 },
    { id: "ml-lib2", label: "Antitrust Defense",        desc: "Defense costs for antitrust law proceedings",                   premium: 2600 },
    { id: "ml-lib3", label: "Social Media Liability",   desc: "D&O coverage for board-level social media decisions",           premium: 1800 },
    { id: "ml-lib4", label: "Cyber Event (D&O)",        desc: "D&O coverage for governance failures related to cyber events",  premium: 2900 },
    { id: "ml-lib5", label: "Compensation Defense",     desc: "Defense for executive compensation disputes",                   premium: 2200 },
  ],
  property: [
    { id: "prop-lib1", label: "Terrorism (TRIA)",         desc: "Physical damage from certified terrorism acts under TRIA",       premium: 4800 },
    { id: "prop-lib2", label: "Debris Removal Enhancement",desc: "Increased debris removal sublimit over standard form",          premium: 2200 },
    { id: "prop-lib3", label: "Spoilage / Refrigeration", desc: "Food spoilage losses from power outage or equipment failure",    premium: 1600 },
    { id: "prop-lib4", label: "Electronic Data Restoration",desc: "Costs to restore lost or corrupted electronic data",           premium: 3400 },
    { id: "prop-lib5", label: "Utility Interruption",     desc: "Losses from off-premises utility service interruption",          premium: 2800 },
  ],
  auto: [
    { id: "auto-lib1", label: "Mobile Equipment Float",     desc: "Coverage for unlisted mobile equipment not on schedule",       premium: 1800 },
    { id: "auto-lib2", label: "Driver Training Vehicles",   desc: "Enhanced coverage for student driver training vehicles",       premium: 2600 },
    { id: "auto-lib3", label: "Chartered Vehicle Coverage", desc: "Coverage for chartered or rented buses for school trips",      premium: 2400 },
    { id: "auto-lib4", label: "Electronic Equipment",       desc: "Coverage for in-vehicle electronic equipment and cameras",     premium: 1200 },
    { id: "auto-lib5", label: "Rental Reimbursement",       desc: "Rental vehicle costs while covered auto is being repaired",    premium: 600  },
  ],
  crime: [
    { id: "crime-lib1", label: "Employee Benefits Plan",  desc: "Covers funds held under employee benefit plans",               premium: 1600 },
    { id: "crime-lib2", label: "Auction Fraud",           desc: "Losses from fraudulent online or in-person auction activity",  premium: 2200 },
    { id: "crime-lib3", label: "Commercial Crime Ext.",   desc: "Extends crime coverage to temporary or contract employees",    premium: 1400 },
    { id: "crime-lib4", label: "Tax Fraud Defense",       desc: "Defense costs for tax fraud or filing inaccuracy allegations", premium: 1800 },
    { id: "crime-lib5", label: "Telephone Fraud",         desc: "Losses from unauthorized use of telephone systems",            premium: 900  },
  ],
  cyber: [
    { id: "cyber-lib1", label: "FERPA Notification Enhancement", desc: "Enhanced FERPA compliance breach notification support",       premium: 2400 },
    { id: "cyber-lib2", label: "Board Incident Response",         desc: "Cyber incident response services tailored for board level",  premium: 3200 },
    { id: "cyber-lib3", label: "Proof of Loss Extension",         desc: "Extended time window to file proof of loss for cyber claims",premium: 1100 },
    { id: "cyber-lib4", label: "Reputational Recovery",           desc: "PR and reputation management after a cyber-related event",   premium: 4800 },
    { id: "cyber-lib5", label: "Student Data Liability",          desc: "Specific sublimit for student PII data breach claims",        premium: 3600 },
  ],
  student: [
    { id: "sa-lib1", label: "Mental Health Coverage", desc: "Medical benefits extending to mental health treatment",           premium: 1400 },
    { id: "sa-lib2", label: "Equipment Coverage",     desc: "Coverage for student equipment losses from accidents",            premium: 800  },
    { id: "sa-lib3", label: "Field Trip Extension",   desc: "Extended coverage for approved off-campus field trips",           premium: 1200 },
    { id: "sa-lib4", label: "Travel Accident",        desc: "Coverage for students traveling for school-sponsored events",     premium: 1600 },
    { id: "sa-lib5", label: "Dental Injury",          desc: "Enhanced dental benefit for traumatic dental injuries",           premium: 700  },
  ],
};

const CATEGORIES = [
  { id: "liability",    label: "Liability",       productIds: ["epl","ell","gl","ml"],          color: N          },
  { id: "property",     label: "Property & Auto", productIds: ["property","auto"],              color: "#1A7A4A"  },
  { id: "specialty",    label: "Specialty",       productIds: ["crime","cyber","student"],       color: "#7B2FBE"  },
];

/* ─── Per-item limit option sets ────────────────────────────────────────── */
const CLAIM_LIMIT_OPTIONS = [
  "No Sublimit", "$25,000", "$50,000", "$100,000", "$250,000",
  "$500,000", "$1,000,000", "$2,000,000", "$3,000,000",
];
const AGGREGATE_LIMIT_OPTIONS = [
  "No Sublimit", "$50,000", "$100,000", "$250,000", "$500,000",
  "$1,000,000", "$2,000,000", "$3,000,000", "$5,000,000",
];
const DEFAULT_ITEM_CLAIM     = "$500,000";
const DEFAULT_ITEM_AGGREGATE = "$1,000,000";

/* ─── Companion advice for coverage-field changes ──────────────────────────
 * Returns a senior-UW comment when the user changes Each Claim Limit,
 * Aggregate, Retention, Retroactive Date, Defense Basis or Coverage
 * Territory. Returning "" suppresses the companion message. */
function adviseCoverageField(
  product: ProductDef,
  optionLabel: string,
  fieldLabel: string,
  before: string,
  after: string,
): string {
  const line = product.abbr;
  const lbl  = fieldLabel.toLowerCase();
  const dollarsNum = (s: string) => Number(s.replace(/[^0-9]/g, "")) || 0;

  // ── Each-claim limit ────────────────────────────────────────────────────
  if (lbl.includes("each claim") || lbl.includes("each incident")) {
    const b = dollarsNum(before), a = dollarsNum(after);
    if (a > b) {
      return `**${line} · ${optionLabel}** — Each-claim limit raised from ${before} → **${after}**. Expect a ~${Math.round(((a - b) / b) * 22)}% premium increase on this line. At ${after} on a K-12 risk you're still inside standard authority; >$5M would trip the senior-UW referral.`;
    }
    return `**${line} · ${optionLabel}** — Each-claim limit lowered from ${before} → **${after}**. Member premium drops, but check the broker's competing tower for shadow limits. At ${after} you have ${a < 1_000_000 ? "below" : "at"} the typical K-12 ${line} benchmark.`;
  }

  // ── Aggregate ───────────────────────────────────────────────────────────
  if (lbl.includes("aggregate")) {
    const b = dollarsNum(before), a = dollarsNum(after);
    if (a > b) {
      return `**${line}** — Aggregate raised to **${after}**. Ratio to each-claim is now ${(a / Math.max(dollarsNum(after) * 0.5, 1)).toFixed(1)}×; common K-12 aggregates run 2–4× the each-claim limit.`;
    }
    return `**${line}** — Aggregate trimmed to **${after}**. Watch for clash risk: a single bad claim year on a $${(a / 1_000_000).toFixed(1)}M aggregate could blow through inside one policy period.`;
  }

  // ── Retention / Deductible ──────────────────────────────────────────────
  if (lbl.includes("retention") || lbl.includes("deductible")) {
    const b = dollarsNum(before), a = dollarsNum(after);
    if (a > b) {
      const pct = Math.min(12, Math.round(((a - b) / Math.max(b, 1)) * 6));
      return `**${line}** — Retention raised ${before} → **${after}**. Typically buys ~${pct}% premium relief on ${line} for a school of this size. Confirm the member's reserve fund can absorb a single ${after} hit before quoting.`;
    }
    return `**${line}** — Retention dropped ${before} → **${after}**. Member premium goes up; on a 6-yr loss ratio of 58% I'd usually push the other direction. Document why you're recommending the lower retention in the file.`;
  }

  // ── Retroactive Date ────────────────────────────────────────────────────
  if (lbl.includes("retroactive")) {
    return `**${line}** — Retroactive date set to **${after}**. Every year of retro coverage you pull back adds ~3–5% to claims-made premium on a ${line} risk. Confirm prior acts coverage isn't already sitting with the expiring carrier.`;
  }

  // ── Defense Basis ───────────────────────────────────────────────────────
  if (lbl.includes("defense")) {
    if (/outside/i.test(after)) {
      return `**${line}** — Defense moved to **Outside Limit**. Big member-side win on a ${line} line — defense costs no longer erode the indemnity bucket. UE typically charges +8–12% for outside-limit defense on K-12.`;
    }
    return `**${line}** — Defense set to **Within Limit**. Standard for K-12 ${line}; keeps premium tight but defense costs eat into the each-claim limit.`;
  }

  // ── Coverage Territory ──────────────────────────────────────────────────
  if (lbl.includes("territory")) {
    if (/worldwide/i.test(after)) {
      return `**${line}** — Territory expanded to **Worldwide**. Material change: confirm the school has international exposure (study-abroad, athletic tours). Triggers a small premium load and may require a sanctions-screening attestation.`;
    }
    if (/usa only/i.test(after)) {
      return `**${line}** — Territory narrowed to **USA Only**. Premium relief ~2–4%. Only safe if you've confirmed no Canadian field trips, study-abroad, or hosted-foreign-student exposure.`;
    }
    return `**${line}** — Coverage Territory set to **${after}**.`;
  }

  return "";
}

/* ─── Helper to make a fresh option from a product def ─────────────────── */
function makeOption(product: ProductDef, idx: number, customName?: string): ProductOption {
  return {
    id: `opt_${Date.now()}_${idx}`,
    label: customName ?? `${product.abbr} - ${String(idx + 1).padStart(2, "0")}`,
    color: OPTION_COLORS[idx % OPTION_COLORS.length],
    status: "draft",
    coverageFields:    product.coverageFields.map(f => ({ ...f })),
    coverageItems:     product.coverageItems.map(ci => ({ ...ci })),
    addedEndorsements: [],
    manualPct: 0,
    createdAt: new Date().toISOString(),
    createdBy: "Maya Khanna",
  };
}

/* ─── Calculate option premium ──────────────────────────────────────────── */
function calcPremium(product: ProductDef, option: ProductOption): number {
  const surcharges = option.coverageItems
    .filter(ci => !ci.required && ci.checked)
    .reduce((s, ci) => s + ci.price, 0);
  const endorsements = option.addedEndorsements
    .filter(e => e.included)
    .reduce((s, e) => s + e.premium, 0);
  const base = product.basePremium + surcharges + endorsements;
  return Math.round(base * (1 + option.manualPct / 100));
}

const fmt = (n: number) => "$" + n.toLocaleString("en-US");

/* ─── Modal overlay ─────────────────────────────────────────────────────── */
function Modal({ onClose, children, wide }: { onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.50)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: "white", border: `1px solid ${BD}`, width: "100%", maxWidth: wide ? 780 : 560, maxHeight: "90vh", overflowY: "auto", fontFamily: font }}>
        {children}
      </div>
    </div>
  );
}

/* ─── Status badge ──────────────────────────────────────────────────────── */
function StatusBadge({ status }: { status: QuoteStatus }) {
  const cfg: Record<QuoteStatus, { label: string; bg: string; text: string; dot: string; border: string }> = {
    draft:    { label: "Draft",    bg: TH,         text: TM,        dot: BD,       border: BD        },
    issued:   { label: "Issued",   bg: "#E8F0F9",  text: "#00427A", dot: N,        border: "#9ABCD6" },
    sent:     { label: "Sent",     bg: "#E8F5EC",  text: "#1A5C30", dot: "#2E7D32",border: "#93C8A0" },
    referred: { label: "Referred", bg: "#FFF8E6",  text: "#7A4800", dot: G,        border: "#F0D88A" },
  };
  const c = cfg[status];
  return (
    <span className="flex items-center gap-1.5 px-3 py-1" style={{ background: c.bg, border: `1px solid ${c.border}`, fontSize: "0.70rem", fontWeight: 700, color: c.text }}>
      <span style={{ width: 6, height: 6, background: c.dot, display: "inline-block", borderRadius: "50%" }} />
      {c.label}
    </span>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════════════════════════════════ */
interface RatingTabProps {
  selectedProductIds?: string[];
}

export function RatingTab({ selectedProductIds }: RatingTabProps) {

  /* ── Visible products in sidebar (from submission, user can add more) ── */
  const initialVisible = selectedProductIds ?? PRODUCTS.map(p => p.id);
  const [visibleProductIds, setVisibleProductIds] = useState<string[]>(initialVisible);

  /* ── Selection & navigation ── */
  /* All visible products are "selected" (in the submission) by default — */
  /* the sidebar is a navigator, not an include/exclude toggle.           */
  const [selected, setSelected]       = useState<Set<string>>(new Set(initialVisible));
  const [activeProductId, setActive]  = useState<string | null>(initialVisible[0] ?? null);

  /* ── Per-product options: productId → options array (seeded with variety) ── */
  const [allOptions, setAllOptions]   = useState<Record<string, ProductOption[]>>(() => {
    const seed: Record<string, ProductOption[]> = {};
    initialVisible.forEach((pid, productIdx) => {
      const product = PRODUCTS.find(p => p.id === pid);
      if (!product) return;
      // Each product gets a Standard option (e.g. "EPL - 01")
      const optA = makeOption(product, 0);
      // First two products get a second variant (higher SIR / lower premium)
      if (productIdx < 2) {
        const optB: ProductOption = {
          ...makeOption(product, 1),
          manualPct: -8,
          status: productIdx === 0 ? "quoted" : "draft",
        };
        // First product also gets a third bound variant for demo coverage
        if (productIdx === 0) {
          const optC: ProductOption = {
            ...makeOption(product, 2),
            manualPct: 12,
            status: "bound",
          };
          seed[pid] = [optA, optB, optC];
        } else {
          seed[pid] = [optA, optB];
        }
      } else {
        seed[pid] = [optA];
      }
    });
    return seed;
  });
  /* ── Active option per product ── */
  const [activeOptId, setActiveOptId] = useState<Record<string, string>>({});
  /* ── Active sub-tab per product ── */
  const [subTabs, setSubTabs]         = useState<Record<string, SubTab>>({});
  /* ── Inline rename state ── */
  const [editingOptId,   setEditingOptId]   = useState<string | null>(null);
  const [editingOptName, setEditingOptName] = useState<string>("");

  /* ── Option dropdown open/close per product ── */
  const [openDropdownPid, setOpenDropdownPid] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  /* ── Per-item sublimits: keyed by "optId::itemId" ── */
  const [itemLimits, setItemLimits] = useState<Record<string, { claimLimit: string; aggregateLimit: string }>>({});

  const getItemLimits = (optId: string, itemId: string) => {
    const key = `${optId}::${itemId}`;
    return itemLimits[key] ?? { claimLimit: DEFAULT_ITEM_CLAIM, aggregateLimit: DEFAULT_ITEM_AGGREGATE };
  };

  const updateItemLimit = (optId: string, itemId: string, field: "claimLimit" | "aggregateLimit", value: string) => {
    const key = `${optId}::${itemId}`;
    setItemLimits(prev => ({
      ...prev,
      [key]: { ...getItemLimits(optId, itemId), [field]: value },
    }));
  };

  /* ── Quote status ── */
  const [quoteStatus, setQuoteStatus] = useState<QuoteStatus>("draft");
  const [quoteNumber, setQuoteNumber] = useState<string | null>(null);

  /* ── Library modals ── */
  const [showProductsLibrary,      setShowProductsLibrary]      = useState(false);
  const [showEndorsementsLibrary,  setShowEndorsementsLibrary]  = useState(false);

  /* ── Issue / Send / Refer modals ── */
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [showSendModal,  setShowSendModal]  = useState(false);
  const [showReferModal, setShowReferModal] = useState(false);
  const [issueDone,  setIssueDone]  = useState(false);
  const [sendDone,   setSendDone]   = useState(false);
  const [referDone,  setReferDone]  = useState(false);

  /* ── Send form ── */
  const [brokerName,  setBrokerName]  = useState("James Whitfield");
  const [brokerEmail, setBrokerEmail] = useState("j.whitfield@gallaghered.com");
  const [sendExpiry,  setSendExpiry]  = useState("2024-05-15");
  const [sendMsg,     setSendMsg]     = useState("Please find attached the quote for Riverside Unified School District. Please advise on preferred terms by the expiry date.");

  /* ── Refer form ── */
  const [referTo,       setReferTo]       = useState("UW Manager");
  const [referCategory, setReferCategory] = useState("Pricing Exception");
  const [referPriority, setReferPriority] = useState("High");
  const [referNotes,    setReferNotes]    = useState("");

  /* ── Per-option kebab menu (which option's actions menu is open) ── */
  const [openKebabId, setOpenKebabId] = useState<string | null>(null);
  const kebabRef = useRef<HTMLDivElement>(null);

  /* ── Task 4 handoff: companion may push a recommended option ── */
  const workspace = useSubmissionWorkspaceOptional();
  useEffect(() => {
    if (!workspace?.pendingRatingOption) return;
    const draft = workspace.consumePendingRatingOption();
    if (!draft) return;
    const product = PRODUCTS.find(p => p.id === draft.productId);
    if (!product) return;
    // Create a new option using the recommended values, slot it in, select it.
    setAllOptions(prev => {
      const opts = prev[draft.productId] ?? [];
      const base = makeOption(product, opts.length, draft.optionName);
      // Map recommended limit/aggregate/retention into the first 3 coverage fields
      const updatedFields = base.coverageFields.map((f, idx) => {
        if (idx === 0) return { ...f, value: draft.limit };
        if (idx === 1) return { ...f, value: draft.aggregate };
        if (idx === 2) return { ...f, value: draft.retention };
        return f;
      });
      const newOpt: ProductOption = { ...base, coverageFields: updatedFields, status: "draft" };
      setActiveOptId(p2 => ({ ...p2, [draft.productId]: newOpt.id }));
      return { ...prev, [draft.productId]: [...opts, newOpt] };
    });
    setActive(draft.productId);
    showToast(`Loaded "${draft.optionName}" from Companion`, "info");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspace?.pendingRatingOption]);
  useEffect(() => {
    if (!openKebabId) return;
    const onDocClick = (e: MouseEvent) => {
      if (kebabRef.current && !kebabRef.current.contains(e.target as Node)) setOpenKebabId(null);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [openKebabId]);

  /* ── Delete confirmation modal state ── */
  const [deleteConfirm, setDeleteConfirm] = useState<{ pid: string; optId: string; label: string } | null>(null);

  /* ── Lightweight toast/snackbar ── */
  const [toast, setToast] = useState<{ msg: string; tone: "success" | "info" | "error" } | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = useCallback((msg: string, tone: "success" | "info" | "error" = "success") => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ msg, tone });
    toastTimer.current = setTimeout(() => setToast(null), 2800);
  }, []);

  /* ── Helpers ── */
  const getProduct = (id: string) => PRODUCTS.find(p => p.id === id)!;

  const getActiveOpt = useCallback((pid: string): ProductOption | undefined => {
    const opts = allOptions[pid] ?? [];
    const aid  = activeOptId[pid];
    return opts.find(o => o.id === aid) ?? opts[0];
  }, [allOptions, activeOptId]);

  /* Toggle product selection */
  const toggleProduct = (pid: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(pid)) {
        next.delete(pid);
        if (activeProductId === pid) {
          const remaining = Array.from(next);
          setActive(remaining.length ? remaining[0] : null);
        }
      } else {
        next.add(pid);
        if (!allOptions[pid]) {
          const product = getProduct(pid);
          const optA    = makeOption(product, 0);
          setAllOptions(prev2 => ({ ...prev2, [pid]: [optA] }));
          setActiveOptId(prev2 => ({ ...prev2, [pid]: optA.id }));
          setSubTabs(prev2 => ({ ...prev2, [pid]: "policy" }));
        }
        setActive(pid);
      }
      return next;
    });
  };

  const navigateTo = (pid: string) => {
    if (selected.has(pid)) setActive(pid);
    else toggleProduct(pid);
  };

  /* Add a new option for active product */
  const addOption = (pid: string, customName?: string) => {
    setAllOptions(prev => {
      const opts    = prev[pid] ?? [];
      const product = getProduct(pid);
      const newOpt  = makeOption(product, opts.length, customName);
      const next    = [...opts, newOpt];
      setActiveOptId(p2 => ({ ...p2, [pid]: newOpt.id }));
      return { ...prev, [pid]: next };
    });
    showToast("Rating option created", "success");
  };

  /* Duplicate a specific option (or active if id omitted) */
  const duplicateOption = (pid: string, srcOptId?: string) => {
    setAllOptions(prev => {
      const opts = prev[pid] ?? [];
      const src  = opts.find(o => o.id === (srcOptId ?? activeOptId[pid])) ?? opts[0];
      if (!src) return prev;
      const idx     = opts.length;
      const product = getProduct(pid);
      const newOpt: ProductOption = {
        ...JSON.parse(JSON.stringify(src)),
        id: `opt_${Date.now()}_${idx}`,
        label: `${product?.abbr ?? "OPT"} - ${String(idx + 1).padStart(2, "0")}`,
        color: OPTION_COLORS[idx % OPTION_COLORS.length],
        status: "draft",
        createdAt: new Date().toISOString(),
      };
      const next = [...opts, newOpt];
      setActiveOptId(p2 => ({ ...p2, [pid]: newOpt.id }));
      return { ...prev, [pid]: next };
    });
    showToast("Option duplicated", "success");
  };

  /* Open delete confirm modal for an option */
  const requestDeleteOption = (pid: string, optId: string) => {
    const opts = allOptions[pid] ?? [];
    if (opts.length <= 1) {
      showToast("At least one option must remain for this product.", "error");
      return;
    }
    const o = opts.find(x => x.id === optId);
    if (!o) return;
    setDeleteConfirm({ pid, optId, label: o.label });
    setOpenKebabId(null);
  };

  /* Confirm + commit delete */
  const commitDeleteOption = () => {
    if (!deleteConfirm) return;
    removeOption(deleteConfirm.pid, deleteConfirm.optId);
    showToast(`Deleted "${deleteConfirm.label}"`, "success");
    setDeleteConfirm(null);
  };

  /* Update an option's status */
  const setOptionStatus = (pid: string, optId: string, status: OptionStatus) => {
    setAllOptions(prev => ({
      ...prev,
      [pid]: (prev[pid] ?? []).map(o => o.id !== optId ? o : { ...o, status }),
    }));
  };

  /* Remove an option */
  const removeOption = (pid: string, optId: string) => {
    setAllOptions(prev => {
      const opts = prev[pid] ?? [];
      if (opts.length <= 1) return prev;
      const next = opts.filter(o => o.id !== optId);
      if (activeOptId[pid] === optId) setActiveOptId(p2 => ({ ...p2, [pid]: next[0].id }));
      return { ...prev, [pid]: next };
    });
  };

  /* Rename an option */
  const renameOption = (pid: string, optId: string, newLabel: string) => {
    const trimmed = newLabel.trim();
    if (!trimmed) return;
    setAllOptions(prev => ({
      ...prev,
      [pid]: (prev[pid] ?? []).map(o => o.id !== optId ? o : { ...o, label: trimmed }),
    }));
  };

  /* Update a coverage field value */
  const updateField = (pid: string, optId: string, fieldIdx: number, value: string) => {
    // Capture previous value + field label so we can produce companion advice.
    const product = PRODUCTS.find(p => p.id === pid);
    const optBefore = (allOptions[pid] ?? []).find(o => o.id === optId);
    const fieldBefore = optBefore?.coverageFields[fieldIdx];
    setAllOptions(prev => ({
      ...prev,
      [pid]: (prev[pid] ?? []).map(o =>
        o.id !== optId ? o : { ...o, coverageFields: o.coverageFields.map((f, i) => i === fieldIdx ? { ...f, value } : f) }
      ),
    }));
    if (product && fieldBefore && fieldBefore.value !== value) {
      const advice = adviseCoverageField(product, optBefore!.label, fieldBefore.label, fieldBefore.value, value);
      if (advice) {
        pushMsg(ratingRouteKey, {
          id: newId(), role: "agent", kind: "text", ts: now(), text: advice,
        });
      }
    }
  };

  /* ── Companion (chatbot) wiring ───────────────────────────────────────── */
  const { id: routeSubId } = useParams<{ id: string }>();
  const subIdForCompanion = routeSubId ?? "SUB-7829";
  const ratingRouteKey = `page:submission:${subIdForCompanion}:rating`;
  const { pushMsg } = useCompanion();

  /* Build a contextual agent message reacting to a coverage-item toggle */
  const buildCoverageSuggestion = (
    product: ProductDef,
    item: CoverageItem,
    nextChecked: boolean,
    newPremium: number,
  ): string => {
    const verb = nextChecked ? "Added" : "Removed";
    const delta = nextChecked
      ? `+${item.price ? `$${item.price.toLocaleString()}` : "$0"}`
      : `-${item.price ? `$${item.price.toLocaleString()}` : "$0"}`;
    const lead = `${verb} **${item.label}** on ${product.abbr}. (${delta}) New option premium: **$${newPremium.toLocaleString()}**.`;

    // Quick contextual coaching per coverage id — keeps it useful, not generic
    const tips: Record<string, { add: string; remove: string }> = {
      "epl-c4": {
        add:    "Harassment is the #2 EPL claim driver — keeping this checked is the norm for K-12 risks.",
        remove: "Heads up: removing Harassment leaves a notable gap for K-12 EPL. Confirm broker has no separate Title VII tower.",
      },
      "epl-c5": {
        add:    "Retaliation tracks closely with discrimination claims — bundling both is standard.",
        remove: "Caution: 56% of EEOC charges include a retaliation count. Removing increases gap exposure.",
      },
      "epl-c6": {
        add:    "Failure-to-Promote is a frequent secondary count on discrimination suits — reasonable add for SR-UW review.",
        remove: "OK — Failure-to-Promote is often bundled with Discrimination. Removing rarely changes the rate sheet much.",
      },
      "epl-c7": {
        add:    "EEOC Charge Defense is cheap relative to a single charge ($1,600 vs ~$30k avg defense). Easy add.",
        remove: "EEOC Charge Defense is one of the most-used EPL sub-coverages — confirm member willing to absorb defense.",
      },
      "epl-c8": {
        add:    "Punitive Damages — verify state insurability before binding (CA/NY restrict).",
        remove: "Punitive Damages — removing has no rate impact in states where uninsurable anyway.",
      },
      "ell-c4": { add: "Standard for districts — discipline appeals are a leading ELL trigger.", remove: "Caution: student-discipline defense is the #1 ELL claim type. Removing is unusual." },
      "ell-c6": { add: "FERPA exposure is rising — cheap to include.", remove: "FERPA claims are infrequent but settle high. Acceptable to remove if broker confirms low data-handling risk." },
      "ell-c7": { add: "Title IX investigations have spiked since 2020 — recommended for any post-secondary risk.", remove: "Caution: Title IX gaps are a referral trigger above $5M limits." },
      "gl-c4":  { add: "Medical Payments at $1,800 is well below avg claim cost — keep.", remove: "OK — many districts self-insure small med-pay claims." },
      "gl-c6":  { add: "Host Liquor only matters if alumni/booster events serve alcohol.", remove: "Fine — if no alcohol served at school-sponsored events." },
    };

    const tip = tips[item.id]?.[nextChecked ? "add" : "remove"];
    return tip ? `${lead}\n\n${tip}` : lead;
  };

  /* Toggle a coverage item */
  const toggleItem = (pid: string, optId: string, itemId: string) => {
    const product = PRODUCTS.find(p => p.id === pid);
    const opt = (allOptions[pid] ?? []).find(o => o.id === optId);
    const item = opt?.coverageItems.find(ci => ci.id === itemId);
    if (!product || !opt || !item || item.required) return;

    const nextChecked = !item.checked;
    // Forecast premium after toggle (sum of checked items + base + endorsements + manualPct)
    const nextItems = opt.coverageItems.map(ci => ci.id === itemId ? { ...ci, checked: nextChecked } : ci);
    const itemsTotal = nextItems.filter(ci => ci.checked).reduce((s, ci) => s + ci.price, 0);
    const endTotal = opt.addedEndorsements.filter(e => e.included).reduce((s, e) => s + e.premium, 0);
    const subtotal = product.basePremium + itemsTotal + endTotal;
    const newPremium = Math.round(subtotal * (1 + opt.manualPct / 100));

    setAllOptions(prev => ({
      ...prev,
      [pid]: (prev[pid] ?? []).map(o =>
        o.id !== optId ? o : { ...o, coverageItems: nextItems }
      ),
    }));

    pushMsg(ratingRouteKey, {
      id: newId(), role: "agent", kind: "text", ts: now(),
      text: buildCoverageSuggestion(product, item, nextChecked, newPremium),
      suggestions: [
        { id: "compare-option", label: "Compare to other options", tone: "blue",  icon: "scale" },
        { id: "explain-impact", label: "Explain rate impact",      tone: "gold",  icon: "info"  },
        { id: "preview-quote",  label: "Preview quote",            tone: "green", icon: "eye"   },
      ],
    });
  };

  /* Toggle an added endorsement */
  const toggleAddedEndorsement = (pid: string, optId: string, eid: string) => {
    const product = PRODUCTS.find(p => p.id === pid);
    const opt = (allOptions[pid] ?? []).find(o => o.id === optId);
    const end = opt?.addedEndorsements.find(e => e.id === eid);
    if (!product || !opt || !end) return;

    const nextIncluded = !end.included;
    const nextEnds = opt.addedEndorsements.map(e => e.id === eid ? { ...e, included: nextIncluded } : e);
    const itemsTotal = opt.coverageItems.filter(ci => ci.checked).reduce((s, ci) => s + ci.price, 0);
    const endTotal = nextEnds.filter(e => e.included).reduce((s, e) => s + e.premium, 0);
    const subtotal = product.basePremium + itemsTotal + endTotal;
    const newPremium = Math.round(subtotal * (1 + opt.manualPct / 100));

    setAllOptions(prev => ({
      ...prev,
      [pid]: (prev[pid] ?? []).map(o =>
        o.id !== optId ? o : { ...o, addedEndorsements: nextEnds }
      ),
    }));

    const verb = nextIncluded ? "Included" : "Excluded";
    const delta = `${nextIncluded ? "+" : "-"}$${end.premium.toLocaleString()}`;
    pushMsg(ratingRouteKey, {
      id: newId(), role: "agent", kind: "text", ts: now(),
      text: `${verb} endorsement **${end.label}** on ${product.abbr}. (${delta}) New option premium: **$${newPremium.toLocaleString()}**.${
        nextIncluded
          ? `\n\nThis endorsement is referral-eligible at SR-UW level — no extra approval needed.`
          : `\n\nRemoved cleanly — the option premium has been recalculated.`
      }`,
      suggestions: [
        { id: "compare-option", label: "Compare to other options", tone: "blue",  icon: "scale" },
        { id: "explain-impact", label: "Explain rate impact",      tone: "gold",  icon: "info"  },
        { id: "preview-quote",  label: "Preview quote",            tone: "green", icon: "eye"   },
      ],
    });
  };

  /* Remove an added endorsement from the option */
  const removeAddedEndorsement = (pid: string, optId: string, eid: string) => {
    setAllOptions(prev => ({
      ...prev,
      [pid]: (prev[pid] ?? []).map(o =>
        o.id !== optId ? o : {
          ...o,
          addedEndorsements: o.addedEndorsements.filter(e => e.id !== eid),
        }
      ),
    }));
  };

  /* Add endorsement from library to active option */
  const addEndorsementFromLibrary = (pid: string, optId: string, libEnd: LibraryEndorsement) => {
    setAllOptions(prev => ({
      ...prev,
      [pid]: (prev[pid] ?? []).map(o => {
        if (o.id !== optId) return o;
        if (o.addedEndorsements.some(e => e.id === libEnd.id)) return o;
        return { ...o, addedEndorsements: [...o.addedEndorsements, { ...libEnd, included: true }] };
      }),
    }));
  };

  /* Update manual adjustment */
  const updateManualPct = (pid: string, optId: string, pct: number) => {
    setAllOptions(prev => ({
      ...prev,
      [pid]: (prev[pid] ?? []).map(o => o.id !== optId ? o : { ...o, manualPct: pct }),
    }));
  };

  /* Select all / required-only convenience */
  const selectAllItems = (pid: string, optId: string, requiredOnly: boolean) => {
    setAllOptions(prev => ({
      ...prev,
      [pid]: (prev[pid] ?? []).map(o =>
        o.id !== optId ? o : {
          ...o,
          coverageItems: o.coverageItems.map(ci => ({ ...ci, checked: requiredOnly ? ci.required : true })),
        }
      ),
    }));
  };

  /* Grand total premium for Issue Quote modal */
  const grandTotal = (optIdx: number) =>
    Array.from(selected).reduce((sum, pid) => {
      const opts = allOptions[pid] ?? [];
      const opt  = opts[optIdx] ?? opts[0];
      if (!opt) return sum;
      return sum + calcPremium(getProduct(pid), opt);
    }, 0);

  /* Issue quote */
  const handleIssueQuote = () => {
    const num = "QTE-" + Date.now().toString().slice(-6);
    setQuoteNumber(num);
    setIssueDone(true);
    setQuoteStatus("issued");
    setTimeout(() => { setShowIssueModal(false); setIssueDone(false); }, 2200);
  };

  const handleSend = () => {
    setSendDone(true);
    setQuoteStatus("sent");
    setTimeout(() => { setShowSendModal(false); setSendDone(false); }, 2000);
  };

  const handleRefer = () => {
    if (!referNotes.trim()) return;
    setReferDone(true);
    setQuoteStatus("referred");
    setTimeout(() => { setShowReferModal(false); setReferDone(false); }, 2000);
  };

  /* ── Router ── */
  const navigate = useNavigate();
  const { id: submissionId } = useParams<{ id: string }>();

  /* Close dropdown when clicking outside */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdownPid(null);
        setEditingOptId(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* Serialize rating state to sessionStorage then navigate to preview */
  const handlePreview = () => {
    const payload = Array.from(selected).map(pid => {
      const product = getProduct(pid);
      const opts    = allOptions[pid] ?? [];
      return {
        id:            product.id,
        label:         product.label,
        abbr:          product.abbr,
        desc:          product.desc,
        categoryColor: product.categoryColor,
        category:      product.category,
        basePremium:   product.basePremium,
        endorsements:  product.endorsements,
        options: opts.map(o => ({
          ...o,
          premium: calcPremium(product, o),
        })),
      };
    });
    sessionStorage.setItem("ratingPreview", JSON.stringify(payload));
    navigate(`/submission/${submissionId}/quote/preview`);
  };

  /* ─── derived ── */
  const activeProduct    = activeProductId ? getProduct(activeProductId) : null;
  const activeOpts       = activeProductId ? (allOptions[activeProductId] ?? []) : [];
  const currentOpt       = activeProductId ? getActiveOpt(activeProductId) : undefined;
  const currentSubTab    = (activeProductId && subTabs[activeProductId]) || "policy";
  const totalSelectedPremium = Array.from(selected).reduce((sum, pid) => {
    const opt = getActiveOpt(pid);
    if (!opt) return sum;
    return sum + calcPremium(getProduct(pid), opt);
  }, 0);

  /* ─── Products available to add from library ── */
  const libraryAvailableProducts = PRODUCTS.filter(p => !visibleProductIds.includes(p.id));

  /* ═══════════════════════════════════════════════════════════════════════
     RENDER
  ═══════════════════════════════════════════════════════════════════════ */
  return (
    <div style={{ fontFamily: font, color: TD }}>

      {/* ── SPLIT PANEL ────────────────────────────────────────────────── */}
      <div className="flex" style={{ background: "white", border: `1px solid ${BD}` }}>

        {/* ══ LEFT SIDEBAR ══════════════════════════════════════════════ */}
        <div className="shrink-0 flex flex-col overflow-y-auto" style={{ width: 292, borderRight: `1px solid ${BD}` }}>

          {/* Sidebar header */}
          <div className="px-4 py-3.5" style={{ borderBottom: `1px solid ${BDL}`, background: "white" }}>
            <div style={{ fontSize: "0.82rem", fontWeight: 800, color: N, textTransform: "uppercase", letterSpacing: "0.12em" }}>Submission Coverage Lines</div>
            <div style={{ fontSize: "0.72rem", color: TT, marginTop: 2 }}>Click a product to view its rating options</div>
          </div>

          {/* Products Library button — below header */}
          <div className="px-3 py-2.5" style={{ borderBottom: `1px solid ${BDL}`, background: "white" }}>
            <button
              onClick={() => setShowProductsLibrary(true)}
              className="w-full flex items-center justify-center gap-2 py-2 transition-all hover:brightness-95"
              style={{ background: N, color: "white", border: "none", cursor: "pointer", fontSize: "0.74rem", fontWeight: 700, fontFamily: font, borderRadius: 6 }}>
              <Library size={13} /> Products Library
            </button>
          </div>

          {/* Category groups — only visible products */}
          <div className="flex-1">
            {CATEGORIES.map(cat => {
              const catProducts = cat.productIds
                .filter(pid => visibleProductIds.includes(pid))
                .map(pid => getProduct(pid));
              if (catProducts.length === 0) return null;
              return (
                <div key={cat.id}>
                  <div className="px-4 py-2" style={{ borderBottom: `1px solid ${BDL}` }}>
                    <span style={{ fontSize: "0.60rem", fontWeight: 800, color: TT, textTransform: "uppercase", letterSpacing: "0.12em" }}>{cat.label}</span>
                  </div>
                  {catProducts.map(product => {
                    const pid      = product.id;
                    const isSel    = selected.has(pid);
                    const isActive = activeProductId === pid;
                    const opt      = getActiveOpt(pid);
                    const premium  = (isSel && opt) ? calcPremium(product, opt) : null;
                    return (
                      <div key={pid}
                        role="button"
                        tabIndex={0}
                        onClick={() => navigateTo(pid)}
                        onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); navigateTo(pid); } }}
                        aria-current={isActive ? "true" : undefined}
                        className="flex items-center gap-3 px-4 py-3 cursor-pointer transition-all outline-none"
                        style={{
                          borderBottom: `1px solid ${BDL}`,
                          borderLeft: isActive ? `3px solid ${cat.color}` : "3px solid transparent",
                          background: isActive ? `${cat.color}08` : isSel ? `${cat.color}03` : "white",
                        }}>
                        {/* Icon */}
                        <div className="shrink-0 flex items-center justify-center"
                          style={{ width: 30, height: 30, background: `${cat.color}10`, border: `1px solid ${cat.color}20`, color: cat.color }}>
                          {product.icon}
                        </div>
                        {/* Name + abbr + option count + premium range */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span style={{ fontSize: "0.80rem", fontWeight: 700, color: isActive ? cat.color : TD, lineHeight: 1.2 }}>{product.label}</span>
                            <span style={{ fontSize: "0.58rem", fontWeight: 700, color: cat.color, background: `${cat.color}12`, border: `1px solid ${cat.color}25`, padding: "1px 5px", letterSpacing: "0.05em" }}>{product.abbr}</span>
                          </div>
                          {(() => {
                            const optsForRow = allOptions[pid] ?? [];
                            const optCount   = optsForRow.length;
                            if (optCount === 0) return null;
                            const premiums   = optsForRow.map(o => calcPremium(product, o));
                            const minP = Math.min(...premiums);
                            const maxP = Math.max(...premiums);
                            return (
                              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                <span style={{
                                  fontSize: "0.58rem", fontWeight: 700, color: cat.color,
                                  background: `${cat.color}10`, padding: "1px 6px", borderRadius: 3,
                                  letterSpacing: "0.04em",
                                }}>
                                  {optCount} option{optCount !== 1 ? "s" : ""}
                                </span>
                                <span style={{ fontSize: "0.70rem", fontWeight: 700, color: TM }}>
                                  {minP === maxP ? fmt(minP) : `${fmt(minP)} – ${fmt(maxP)}`}
                                </span>
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>


        </div>

        {/* ══ RIGHT PANEL ══════════════════════════════════════════════ */}
        <div className="flex-1 overflow-y-auto">

          {/* EMPTY STATE */}
          {!activeProduct && (
            <div className="flex flex-col items-center justify-center py-16" style={{ color: TT }}>
              <div className="flex items-center justify-center mb-5"
                style={{ width: 72, height: 72, background: TH, border: `1.5px solid ${BDL}` }}>
                <ShieldCheck size={30} color={BD} />
              </div>
              <div style={{ fontSize: "1rem", fontWeight: 700, color: TM, marginBottom: 8 }}>No products selected</div>
              <div style={{ fontSize: "0.82rem", color: TT, textAlign: "center", maxWidth: 320, lineHeight: 1.6 }}>
                Select one or more product lines from the panel on the left to configure coverage, endorsements, and premium.
              </div>
            </div>
          )}

          {/* PRODUCT CONFIG PANEL */}
          {activeProduct && currentOpt && (() => {
            const product  = activeProduct;
            const pid      = product.id;
            const opts     = activeOpts;
            const opt      = currentOpt;
            const premium  = calcPremium(product, opt);
            const surcharges = opt.coverageItems.filter(ci => !ci.required && ci.checked).reduce((s, ci) => s + ci.price, 0);
            const selectedItemCount = opt.coverageItems.filter(ci => ci.checked || ci.required).length;
            const addedEndTotal = opt.addedEndorsements.filter(e => e.included).reduce((s, e) => s + e.premium, 0);
            const libEnds = ENDORSEMENTS_LIBRARY[pid] ?? [];
            const alreadyAddedIds = new Set(opt.addedEndorsements.map(e => e.id));
            const libraryAvailableEnds = libEnds.filter(e => !alreadyAddedIds.has(e.id));

            return (
              <div>
                {/* Product header */}
                <div className="flex items-start justify-between gap-4 px-6 py-5"
                  style={{ borderBottom: `1px solid ${BDL}`, background: "white" }}>
                  <div className="flex items-start gap-4">
                    <div className="flex items-center justify-center shrink-0"
                      style={{ width: 44, height: 44, background: `${product.categoryColor}12`, border: `1.5px solid ${product.categoryColor}25`, color: product.categoryColor }}>
                      {product.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 style={{ fontSize: "1.05rem", fontWeight: 800, color: TD }}>{product.label}</h2>
                        <span style={{ fontSize: "0.60rem", fontWeight: 800, color: "white", background: product.categoryColor, padding: "2px 7px", letterSpacing: "0.07em" }}>{product.abbr}</span>
                        <span style={{ fontSize: "0.60rem", fontWeight: 700, color: product.categoryColor, background: `${product.categoryColor}12`, border: `1px solid ${product.categoryColor}25`, padding: "2px 7px" }}>{product.category}</span>
                      </div>
                      <p style={{ fontSize: "0.76rem", color: TT, marginTop: 3 }}>{product.desc}</p>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div style={{ fontSize: "0.58rem", fontWeight: 700, color: TT, textTransform: "uppercase", letterSpacing: "0.10em" }}>{opt.label} Premium</div>
                    <div style={{ fontSize: "1.60rem", fontWeight: 800, color: N, lineHeight: 1.1, marginTop: 2 }}>{fmt(premium)}</div>
                  </div>
                </div>

                {/* ── Options bar: compact dropdown ─────────────────────── */}
                <div className="flex items-center justify-between gap-4 px-6 py-3"
                  style={{ borderBottom: `1px solid ${BDL}`, background: TH }}>

                  {/* Left: label + dropdown selector */}
                  <div className="flex items-center gap-3 min-w-0">
                    <span style={{ fontSize: "0.60rem", fontWeight: 800, color: TT, textTransform: "uppercase", letterSpacing: "0.10em", flexShrink: 0 }}>Option:</span>

                    {/* Dropdown trigger + panel */}
                    <div ref={openDropdownPid === pid ? dropdownRef : undefined} className="relative" style={{ minWidth: 0 }}>
                      {/* Trigger button */}
                      <button
                        onClick={() => setOpenDropdownPid(prev => prev === pid ? null : pid)}
                        className="flex items-center gap-2 px-3 py-1.5 hover:brightness-95 transition-all"
                        style={{ background: "white", border: `1.5px solid ${opt.color}`, color: TD, fontSize: "0.78rem", fontWeight: 700, maxWidth: 280, minWidth: 180, borderRadius: 6 }}>
                        <span style={{ width: 8, height: 8, background: opt.color, borderRadius: "50%", display: "inline-block", flexShrink: 0 }} />
                        <span className="truncate flex-1 text-left">{opt.label}</span>
                        <span style={{ fontSize: "0.72rem", fontWeight: 700, color: opt.color, flexShrink: 0 }}>{fmt(premium)}</span>
                        {opts.length > 1 && (
                          <span style={{ fontSize: "0.65rem", color: TT, background: BDL, padding: "0 5px", borderRadius: 8, flexShrink: 0 }}>{opts.length}</span>
                        )}
                        <ChevronDown size={12} color={TT} style={{ flexShrink: 0, transform: openDropdownPid === pid ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
                      </button>

                      {/* Dropdown panel */}
                      {openDropdownPid === pid && (
                        <div
                          className="absolute left-0 z-50"
                          style={{ top: "calc(100% + 4px)", minWidth: 320, background: "white", border: `1.5px solid ${BD}`, boxShadow: "0 8px 24px rgba(0,0,0,0.12)", borderRadius: 8, overflow: "hidden" }}>
                          {/* Options list */}
                          {opts.map((o, i) => {
                            const isAct     = o.id === opt.id;
                            const isEditing = editingOptId === o.id;
                            const p         = calcPremium(product, o);
                            const sm        = OPTION_STATUS_META[o.status];
                            return (
                              <div key={o.id}
                                style={{ borderBottom: i < opts.length - 1 ? `1px solid ${BDL}` : "none", background: isAct ? `${o.color}08` : "white" }}>
                                {isEditing ? (
                                  /* Inline rename inside dropdown */
                                  <div className="flex items-center gap-1.5 px-3 py-2">
                                    <input
                                      autoFocus
                                      value={editingOptName}
                                      onChange={e => setEditingOptName(e.target.value)}
                                      onKeyDown={e => {
                                        if (e.key === "Enter") { renameOption(pid, o.id, editingOptName); setEditingOptId(null); }
                                        if (e.key === "Escape") setEditingOptId(null);
                                      }}
                                      className="flex-1 px-2 py-1 outline-none"
                                      style={{ border: `1.5px solid ${N}`, fontSize: "0.76rem", color: TD, fontFamily: font, borderRadius: 5 }}
                                    />
                                    <button
                                      onMouseDown={e => { e.preventDefault(); renameOption(pid, o.id, editingOptName); setEditingOptId(null); }}
                                      className="flex items-center justify-center p-1.5"
                                      style={{ background: N, color: "white", border: "none", cursor: "pointer", borderRadius: 5 }}>
                                      <Check size={11} />
                                    </button>
                                    <button
                                      onMouseDown={e => { e.preventDefault(); setEditingOptId(null); }}
                                      className="flex items-center justify-center p-1.5"
                                      style={{ background: "white", color: TT, border: `1px solid ${BD}`, cursor: "pointer", borderRadius: 5 }}>
                                      <X size={11} />
                                    </button>
                                  </div>
                                ) : (
                                  <div
                                    className="flex items-center gap-2 px-3 py-2.5 cursor-pointer group/optrow hover:brightness-97 transition-all"
                                    onClick={() => { setActiveOptId(prev => ({ ...prev, [pid]: o.id })); setOpenDropdownPid(null); }}>
                                    {/* Active indicator */}
                                    <span style={{ width: 8, height: 8, background: o.color, borderRadius: "50%", display: "inline-block", flexShrink: 0, opacity: isAct ? 1 : 0.4 }} />
                                    {/* Name */}
                                    <span className="flex-1 truncate" style={{ fontSize: "0.80rem", fontWeight: isAct ? 700 : 500, color: isAct ? o.color : TM }}>{o.label}</span>
                                    {/* Status badge */}
                                    <span style={{
                                      fontSize: "0.52rem", fontWeight: 800, color: sm.color,
                                      background: sm.bg, border: `1px solid ${sm.border}`,
                                      padding: "1px 6px", borderRadius: 3,
                                      textTransform: "uppercase", letterSpacing: "0.07em",
                                      flexShrink: 0,
                                    }}>
                                      {sm.label}
                                    </span>
                                    {/* Premium */}
                                    <span style={{ fontSize: "0.74rem", fontWeight: 700, color: isAct ? o.color : TT, flexShrink: 0, fontVariantNumeric: "tabular-nums" }}>{fmt(p)}</span>
                                    {/* Actions — visible on row hover */}
                                    <span className="flex items-center gap-1 opacity-0 group-hover/optrow:opacity-100 transition-opacity">
                                      <span
                                        title="Rename"
                                        onClick={e => { e.stopPropagation(); setEditingOptId(o.id); setEditingOptName(o.label); }}
                                        className="flex items-center justify-center p-1 hover:bg-gray-100 cursor-pointer"
                                        style={{ color: TT, borderRadius: 4 }}>
                                        <Pencil size={11} />
                                      </span>
                                      {opts.length > 1 && (
                                        <span
                                          title="Delete"
                                          onClick={e => { e.stopPropagation(); requestDeleteOption(pid, o.id); setOpenDropdownPid(null); }}
                                          className="flex items-center justify-center p-1 hover:bg-red-50 cursor-pointer"
                                          style={{ color: "#B91C1C", borderRadius: 4 }}>
                                          <Trash2 size={11} />
                                        </span>
                                      )}
                                    </span>
                                    {isAct && <Check size={11} color={o.color} style={{ flexShrink: 0 }} />}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                          {/* Footer actions in dropdown */}
                          <div className="flex items-center gap-2 px-3 py-2" style={{ borderTop: `1px solid ${BDL}`, background: TH }}>
                            <button
                              onClick={() => { addOption(pid); setOpenDropdownPid(null); }}
                              className="flex items-center gap-1 px-2.5 py-1 hover:brightness-95 transition-all"
                              style={{ border: `1px solid ${BD}`, background: "white", color: TM, fontSize: "0.72rem", fontWeight: 600, borderRadius: 6, cursor: "pointer" }}>
                              <Plus size={11} /> New Option
                            </button>
                            <button
                              onClick={() => { duplicateOption(pid); setOpenDropdownPid(null); }}
                              className="flex items-center gap-1 px-2.5 py-1 hover:brightness-95 transition-all"
                              style={{ border: `1px solid ${BD}`, background: "white", color: TM, fontSize: "0.72rem", fontWeight: 600, borderRadius: 6, cursor: "pointer" }}>
                              <Copy size={11} /> Duplicate
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: quick actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => addOption(pid)}
                      className="flex items-center gap-1.5 px-3 py-1.5 hover:brightness-95 transition-all"
                      style={{ border: `1.5px solid ${BD}`, background: "white", color: TM, fontSize: "0.72rem", fontWeight: 600, borderRadius: 6, cursor: "pointer" }}>
                      <Plus size={12} /> New Option
                    </button>
                    <button onClick={() => duplicateOption(pid)}
                      className="flex items-center gap-1.5 px-3 py-1.5 hover:brightness-95 transition-all"
                      style={{ border: `1.5px solid ${BD}`, background: "white", color: TM, fontSize: "0.72rem", fontWeight: 600, borderRadius: 6, cursor: "pointer" }}>
                      <Copy size={12} /> Duplicate
                    </button>
                    <button
                      onClick={handlePreview}
                      className="flex items-center gap-1.5 px-3 py-1.5 hover:brightness-95 transition-all"
                      style={{ border: `1.5px solid ${N}`, background: N, color: "white", fontSize: "0.72rem", fontWeight: 700, borderRadius: 6, cursor: "pointer" }}>
                      <Eye size={12} /> Preview Quote
                    </button>
                  </div>
                </div>

                {/* Inline editor anchor — kebab "Edit" scrolls here */}
                <div id="rating-option-editor"/>
                {/* Sub-tab nav */}
                <div className="flex items-center gap-0 overflow-x-auto" style={{ borderBottom: `1px solid ${BD}`, background: "white" }}>
                  {(["policy", "endorsements", "premium", "schedules", "memberBenefits", "notifications"] as SubTab[]).map(tab => {
                    const isAct = currentSubTab === tab;
                    const labels: Record<SubTab, { icon: React.ReactNode; text: string; count?: number }> = {
                      policy:         { icon: <Shield size={13} />,      text: "Policy & Coverage",  count: selectedItemCount },
                      endorsements:   { icon: <Layers size={13} />,      text: "Endorsements",        count: opt.addedEndorsements.filter(e => e.included).length },
                      premium:        { icon: <DollarSign size={13} />,  text: "Premium" },
                      schedules:      { icon: <Calendar size={13} />,    text: "Schedules" },
                      memberBenefits: { icon: <Star size={13} />,        text: "Member Benefits" },
                      notifications:  { icon: <Bell size={13} />,        text: "Notifications" },
                    };
                    const tl = labels[tab];
                    return (
                      <button key={tab}
                        onClick={() => setSubTabs(prev => ({ ...prev, [pid]: tab }))}
                        className="relative flex items-center gap-2 px-5 py-3 transition-all whitespace-nowrap"
                        style={{ fontSize: "0.78rem", fontWeight: isAct ? 700 : 400, color: isAct ? N : TM, background: "transparent", border: "none", outline: "none", borderRadius: 6 }}>
                        <span style={{ color: isAct ? N : TT }}>{tl.icon}</span>
                        {tl.text}
                        {tl.count !== undefined && (
                          <span style={{ fontSize: "0.62rem", fontWeight: 800, color: isAct ? "white" : TT, background: isAct ? N : BD, padding: "1px 6px", borderRadius: 10, minWidth: 18, textAlign: "center" as const }}>{tl.count}</span>
                        )}
                        {isAct && <span style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "2.5px", background: G }} />}
                      </button>
                    );
                  })}
                </div>

                {/* Sub-tab content */}
                <div className="p-6 space-y-6" style={{ background: "#FAFBFE" }}>

                  {/* ════ POLICY & COVERAGE ════ */}
                  {currentSubTab === "policy" && (
                    <>
                      {/* Coverage Limits & Terms */}
                      <div>
                        <div style={{ fontSize: "0.62rem", fontWeight: 800, color: TT, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 14 }}>Coverage Limits & Terms</div>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                          {opt.coverageFields.map((field, idx) => (
                            <div key={field.label}>
                              <label style={{ fontSize: "0.60rem", fontWeight: 700, color: TT, textTransform: "uppercase", letterSpacing: "0.09em", display: "block", marginBottom: 5 }}>{field.label}</label>
                              {field.type === "select" && field.options ? (
                                <div className="relative">
                                  <select
                                    value={field.value}
                                    onChange={e => updateField(pid, opt.id, idx, e.target.value)}
                                    className="w-full px-3 py-2 outline-none appearance-none pr-8"
                                    style={{ border: `1px solid ${BD}`, fontSize: "0.82rem", color: TD, background: "white", cursor: "pointer" }}>
                                    {field.options.map(o => <option key={o} value={o}>{o}</option>)}
                                  </select>
                                  <ChevronDown size={12} color={TT} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                                </div>
                              ) : (
                                <input
                                  type={field.type === "date" ? "date" : "text"}
                                  value={field.value}
                                  onChange={e => updateField(pid, opt.id, idx, e.target.value)}
                                  className="w-full px-3 py-2 outline-none"
                                  style={{ border: `1px solid ${BD}`, fontSize: "0.82rem", color: TD, background: "white" }}
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Coverage Checklist & Pricing */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <div style={{ fontSize: "0.62rem", fontWeight: 800, color: TT, textTransform: "uppercase", letterSpacing: "0.12em" }}>Coverage Checklist & Pricing</div>
                            <div style={{ fontSize: "0.70rem", color: TT, marginTop: 3 }}>
                              <span style={{ fontWeight: 600, color: TM }}>{selectedItemCount} of {opt.coverageItems.length} selected</span>
                              {surcharges > 0 && <span style={{ color: "#B45309", fontWeight: 600 }}> · {fmt(surcharges)} in optional surcharges</span>}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <button onClick={() => selectAllItems(pid, opt.id, false)} style={{ fontSize: "0.72rem", color: N, fontWeight: 700, background: "none", border: "none", cursor: "pointer", borderRadius: 6 }}>Select all</button>
                            <span style={{ color: BDL }}>·</span>
                            <button onClick={() => selectAllItems(pid, opt.id, true)} style={{ fontSize: "0.72rem", color: TT, fontWeight: 600, background: "none", border: "none", cursor: "pointer", borderRadius: 6 }}>Required only</button>
                          </div>
                        </div>
                        <div style={{ border: `1px solid ${BDL}`, background: "white" }}>
                          {opt.coverageItems.map((item, idx) => {
                            const isChecked = item.checked || item.required;
                            return (
                              <div key={item.id}
                                style={{
                                  borderBottom: idx < opt.coverageItems.length - 1 ? `1px solid ${BDL}` : "none",
                                  background: isChecked ? `${product.categoryColor}04` : "white",
                                  borderLeft: isChecked ? `3px solid ${product.categoryColor}` : "3px solid transparent",
                                }}>
                                {/* ── Top row: checkbox + label + price ── */}
                                <div
                                  className="flex items-start gap-3 px-4 pt-3 pb-2 transition-all"
                                  style={{ cursor: item.required ? "default" : "pointer" }}
                                  onClick={() => !item.required && toggleItem(pid, opt.id, item.id)}>
                                  <div className="shrink-0 flex items-center justify-center mt-0.5"
                                    style={{ width: 18, height: 18, background: isChecked ? product.categoryColor : "white", border: `2px solid ${isChecked ? product.categoryColor : BD}`, cursor: item.required ? "default" : "pointer", transition: "all 0.12s" }}>
                                    {isChecked && <Check size={10} color="white" strokeWidth={3} />}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span style={{ fontSize: "0.82rem", fontWeight: isChecked ? 700 : 500, color: isChecked ? TD : TM }}>{item.label}</span>
                                      {item.required && (
                                        <span style={{ fontSize: "0.58rem", fontWeight: 800, color: TT, border: `1px solid ${BD}`, padding: "1px 5px", letterSpacing: "0.06em", flexShrink: 0 }}>REQUIRED</span>
                                      )}
                                    </div>
                                    <p style={{ fontSize: "0.72rem", color: TT, marginTop: 2, lineHeight: 1.4 }}>{item.desc}</p>
                                  </div>
                                  <div className="shrink-0 text-right" style={{ minWidth: 72 }}>
                                    {item.required ? (
                                      <span style={{ fontSize: "0.72rem", color: TT, fontWeight: 500 }}>Included</span>
                                    ) : isChecked ? (
                                      <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#B45309" }}>+{fmt(item.price)}</span>
                                    ) : (
                                      <span style={{ fontSize: "0.72rem", color: TT }}>{fmt(item.price)}</span>
                                    )}
                                  </div>
                                </div>

                                {isChecked && (
                                   <div className="flex items-center gap-4 px-4 pb-3" onClick={e => e.stopPropagation()}>
                                     <div className="flex items-center gap-2">
                                       <label style={{ fontSize: "0.60rem", fontWeight: 700, color: TT, textTransform: "uppercase", letterSpacing: "0.08em", whiteSpace: "nowrap" }}>Claim Limit</label>
                                       <div className="relative">
                                         <select value={getItemLimits(opt.id, item.id).claimLimit} onChange={e => updateItemLimit(opt.id, item.id, "claimLimit", e.target.value)} className="appearance-none outline-none pr-6 pl-2 py-1 cursor-pointer" style={{ border: `1px solid ${BD}`, fontSize: "0.74rem", color: TD, background: "white", minWidth: 110 }}>
                                           {CLAIM_LIMIT_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                                         </select>
                                         <ChevronDown size={10} color={TT} style={{ position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                                       </div>
                                     </div>
                                     <div className="flex items-center gap-2">
                                       <label style={{ fontSize: "0.60rem", fontWeight: 700, color: TT, textTransform: "uppercase", letterSpacing: "0.08em", whiteSpace: "nowrap" }}>Aggregate Limit</label>
                                       <div className="relative">
                                         <select value={getItemLimits(opt.id, item.id).aggregateLimit} onChange={e => updateItemLimit(opt.id, item.id, "aggregateLimit", e.target.value)} className="appearance-none outline-none pr-6 pl-2 py-1 cursor-pointer" style={{ border: `1px solid ${BD}`, fontSize: "0.74rem", color: TD, background: "white", minWidth: 120 }}>
                                           {AGGREGATE_LIMIT_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                                         </select>
                                         <ChevronDown size={10} color={TT} style={{ position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                                       </div>
                                     </div>
                                   </div>
                                 )}
                              </div>
                            );
                          })}
                        </div>

                        {/* Save button */}
                        <div className="flex justify-end mt-4">
                          <button
                            className="flex items-center gap-2 px-5 py-2 transition-all hover:brightness-95"
                            style={{ background: N, color: "white", fontSize: "0.78rem", fontWeight: 700, border: `1.5px solid ${N}`, borderRadius: 6 }}>
                            <Save size={13} /> Save Option
                          </button>
                        </div>
                      </div>
                    </>
                  )}

                  {/* ════ ENDORSEMENTS ════ */}
                  {currentSubTab === "endorsements" && (
                    <div className="space-y-5">

                      {/* Default endorsements (read-only) */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <div style={{ fontSize: "0.62rem", fontWeight: 800, color: TT, textTransform: "uppercase", letterSpacing: "0.12em" }}>Default Endorsements</div>
                            <div style={{ fontSize: "0.70rem", color: TT, marginTop: 2 }}>Standard endorsements attached to this product</div>
                          </div>
                        </div>
                        <div style={{ border: `1px solid ${BDL}`, background: "white" }}>
                          {product.endorsements.map((end, idx) => (
                            <div key={end.id}
                              className="flex items-start gap-3 px-4 py-4"
                              style={{ borderBottom: idx < product.endorsements.length - 1 ? `1px solid ${BDL}` : "none" }}>
                              {/* Default badge icon — not interactive */}
                              <div className="shrink-0 flex items-center justify-center mt-0.5"
                                style={{ width: 18, height: 18, background: `${product.categoryColor}15`, border: `1.5px solid ${product.categoryColor}40` }}>
                                <BookOpen size={9} color={product.categoryColor} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span style={{ fontSize: "0.82rem", fontWeight: 600, color: TM }}>{end.label}</span>
                                  <span style={{ fontSize: "0.58rem", fontWeight: 800, color: product.categoryColor, background: `${product.categoryColor}12`, border: `1px solid ${product.categoryColor}30`, padding: "1px 6px", letterSpacing: "0.06em" }}>DEFAULT</span>
                                </div>
                                <p style={{ fontSize: "0.72rem", color: TT, marginTop: 2, lineHeight: 1.4 }}>{end.desc}</p>
                              </div>
                              <div className="shrink-0 text-right" style={{ minWidth: 72 }}>
                                <span style={{ fontSize: "0.72rem", color: TT, fontWeight: 500 }}>{fmt(end.premium)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Added endorsements from library */}
                      {opt.addedEndorsements.length > 0 && (
                        <div>
                          <div style={{ fontSize: "0.62rem", fontWeight: 800, color: TT, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 12 }}>Added Endorsements</div>
                          <div style={{ border: `1px solid ${BDL}`, background: "white" }}>
                            {opt.addedEndorsements.map((end, idx) => (
                              <div key={end.id}
                                className="flex items-start gap-3 px-4 py-4 cursor-pointer transition-all"
                                style={{
                                  borderBottom: idx < opt.addedEndorsements.length - 1 ? `1px solid ${BDL}` : "none",
                                  background: end.included ? `${product.categoryColor}04` : "white",
                                  borderLeft: end.included ? `3px solid ${product.categoryColor}` : "3px solid transparent",
                                }}
                                onClick={() => toggleAddedEndorsement(pid, opt.id, end.id)}>
                                <div className="shrink-0 flex items-center justify-center mt-0.5"
                                  style={{ width: 18, height: 18, background: end.included ? product.categoryColor : "white", border: `2px solid ${end.included ? product.categoryColor : BD}`, transition: "all 0.12s" }}>
                                  {end.included && <Check size={10} color="white" strokeWidth={3} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <span style={{ fontSize: "0.82rem", fontWeight: end.included ? 700 : 500, color: end.included ? TD : TM }}>{end.label}</span>
                                  <p style={{ fontSize: "0.72rem", color: TT, marginTop: 2, lineHeight: 1.4 }}>{end.desc}</p>
                                </div>
                                <div className="flex items-start gap-2 shrink-0">
                                  <div className="text-right" style={{ minWidth: 60 }}>
                                    <div style={{ fontSize: "0.78rem", fontWeight: 700, color: end.included ? product.categoryColor : TM }}>{end.included ? fmt(end.premium) : `+${fmt(end.premium)}`}</div>
                                    <div style={{ fontSize: "0.60rem", color: TT, marginTop: 1 }}>{end.included ? "Added" : "Add"}</div>
                                  </div>
                                  <button
                                    onClick={e => { e.stopPropagation(); removeAddedEndorsement(pid, opt.id, end.id); }}
                                    className="mt-0.5 p-1 hover:bg-red-50 transition-colors"
                                    style={{ border: "none", background: "none", cursor: "pointer", color: "#B91C1C", borderRadius: 6 }}
                                    title="Remove endorsement">
                                    <X size={12} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                          {addedEndTotal > 0 && (
                            <div className="mt-3 flex items-center justify-between px-4 py-3" style={{ background: `${product.categoryColor}08`, border: `1px solid ${product.categoryColor}20` }}>
                              <span style={{ fontSize: "0.76rem", fontWeight: 700, color: TM }}>Added Endorsement Subtotal</span>
                              <span style={{ fontSize: "0.88rem", fontWeight: 800, color: product.categoryColor }}>+{fmt(addedEndTotal)}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Endorsements Library button */}
                      <button
                        onClick={() => setShowEndorsementsLibrary(true)}
                        disabled={libraryAvailableEnds.length === 0}
                        className="w-full flex items-center justify-center gap-2 py-2.5 transition-all hover:brightness-95 disabled:opacity-50"
                        style={{ background: `${product.categoryColor}12`, border: `1.5px dashed ${product.categoryColor}50`, color: product.categoryColor, cursor: "pointer", fontSize: "0.76rem", fontWeight: 700, fontFamily: font, borderRadius: 6 }}>
                        <Library size={14} />
                        {libraryAvailableEnds.length === 0
                          ? "All library endorsements added"
                          : `Endorsements Library · ${libraryAvailableEnds.length} available`}
                      </button>
                    </div>
                  )}

                  {/* ════ SCHEDULES ════ */}
                  {currentSubTab === "schedules" && (
                    <div className="space-y-5">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <div style={{ fontSize: "0.62rem", fontWeight: 800, color: TT, textTransform: "uppercase", letterSpacing: "0.12em" }}>Coverage Schedules</div>
                            <div style={{ fontSize: "0.70rem", color: TT, marginTop: 2 }}>Scheduled items and locations for this policy option</div>
                          </div>
                          <button className="flex items-center gap-1.5 px-3 py-1.5 hover:brightness-95 transition-all"
                            style={{ background: N, color: "white", border: `1px solid ${N}`, fontSize: "0.72rem", fontWeight: 700, borderRadius: 6 }}>
                            <Plus size={12} /> Add Schedule
                          </button>
                        </div>
                        <div style={{ border: `1px solid ${BDL}`, background: "white" }}>
                          {/* Table header */}
                          <div className="grid px-4 py-2" style={{ gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", background: TH, borderBottom: `1px solid ${BDL}` }}>
                            {["Schedule Name", "Effective Date", "Expiration Date", "Limit", "Status"].map(h => (
                              <span key={h} style={{ fontSize: "0.60rem", fontWeight: 800, color: TT, textTransform: "uppercase", letterSpacing: "0.08em" }}>{h}</span>
                            ))}
                          </div>
                          {[
                            { name: "Main District Campus", eff: "07/01/2026", exp: "07/01/2027", limit: "$5,000,000", status: "Active" },
                            { name: "Athletic Facilities", eff: "07/01/2026", exp: "07/01/2027", limit: "$2,500,000", status: "Active" },
                            { name: "Administration Building", eff: "07/01/2026", exp: "07/01/2027", limit: "$1,000,000", status: "Active" },
                            { name: "Transportation Fleet", eff: "07/01/2026", exp: "07/01/2027", limit: "$750,000", status: "Pending" },
                          ].map((row, i, arr) => (
                            <div key={row.name} className="grid items-center px-4 py-3"
                              style={{ gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", borderBottom: i < arr.length - 1 ? `1px solid ${BDL}` : "none" }}>
                              <span style={{ fontSize: "0.80rem", fontWeight: 600, color: TD }}>{row.name}</span>
                              <span style={{ fontSize: "0.78rem", color: TM }}>{row.eff}</span>
                              <span style={{ fontSize: "0.78rem", color: TM }}>{row.exp}</span>
                              <span style={{ fontSize: "0.78rem", fontWeight: 700, color: N }}>{row.limit}</span>
                              <span style={{ fontSize: "0.68rem", fontWeight: 700,
                                color: row.status === "Active" ? "#1A7A4A" : "#B45309",
                                background: row.status === "Active" ? "#E8F5E9" : "#FFF8E6",
                                border: `1px solid ${row.status === "Active" ? "#81C784" : "#F0D88A"}`,
                                padding: "2px 8px", display: "inline-block" }}>
                                {row.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ════ MEMBER BENEFITS ════ */}
                  {currentSubTab === "memberBenefits" && (() => {
                    const benefits = [
                      {
                        id: "proresponse", title: "ProResponse", selected: true,
                        services: [
                          { name: "Crisis Communications",             start: "7/1/2026", end: "7/1/2027" },
                          { name: "Trauma/Grief Counseling",           start: "7/1/2026", end: "7/1/2027" },
                          { name: "Threat Assessment Case Consultation", start: "7/1/2026", end: "7/1/2027" },
                          { name: "Sexual Misconduct Investigation",   start: "7/1/2026", end: "7/1/2027" },
                        ],
                      },
                    ];
                    return (
                      <div className="space-y-4">
                        <div style={{ border: `1px solid ${BDL}`, background: "white" }}>
                          {/* Table header */}
                          <div className="grid px-4 py-2" style={{ gridTemplateColumns: "40px 1fr 2fr 1fr 1fr", background: TH, borderBottom: `1px solid ${BDL}` }}>
                            {["Select", "Benefit Title", "Included Services", "Benefit Start Date", "Benefit End Date"].map(h => (
                              <span key={h} style={{ fontSize: "0.60rem", fontWeight: 800, color: TT, textTransform: "uppercase", letterSpacing: "0.08em" }}>{h}</span>
                            ))}
                          </div>
                          {benefits.map((b) => (
                            <div key={b.id}>
                              {/* Benefit parent row */}
                              <div className="grid items-center px-4 py-2" style={{ gridTemplateColumns: "40px 1fr 2fr 1fr 1fr", borderBottom: `1px solid ${BDL}`, background: `${product.categoryColor}05` }}>
                                <div className="flex items-center justify-center"
                                  style={{ width: 16, height: 16, background: b.selected ? product.categoryColor : "white", border: `2px solid ${b.selected ? product.categoryColor : BD}` }}>
                                  {b.selected && <Check size={9} color="white" strokeWidth={3} />}
                                </div>
                                <span style={{ fontSize: "0.82rem", fontWeight: 700, color: TD }}>{b.title}</span>
                                <span />
                                <span />
                                <span />
                              </div>
                              {/* Service rows */}
                              {b.services.map((svc, si) => (
                                <div key={svc.name} className="grid items-center px-4 py-2"
                                  style={{ gridTemplateColumns: "40px 1fr 2fr 1fr 1fr", borderBottom: si < b.services.length - 1 ? `1px solid ${BDL}` : "none", paddingLeft: 40 }}>
                                  <span />
                                  <span />
                                  <span style={{ fontSize: "0.78rem", color: N, fontWeight: 500 }}>{svc.name}</span>
                                  <span style={{ fontSize: "0.78rem", color: TM }}>{svc.start}</span>
                                  <span style={{ fontSize: "0.78rem", color: TM }}>{svc.end}</span>
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                        {/* Buttons */}
                        <div className="flex items-center gap-2">
                          <button className="flex items-center gap-1.5 px-3 py-1.5 hover:brightness-95 transition-all"
                            style={{ background: TH, border: `1px solid ${BD}`, color: TM, fontSize: "0.72rem", fontWeight: 600, borderRadius: 6 }}>
                            Fill in
                          </button>
                          <button className="flex items-center gap-1.5 px-3 py-1.5 hover:brightness-95 transition-all"
                            style={{ background: TH, border: `1px solid ${BD}`, color: TM, fontSize: "0.72rem", fontWeight: 600, borderRadius: 6 }}>
                            Modify Options
                          </button>
                          <button className="flex items-center gap-1.5 px-3 py-1.5 hover:brightness-95 transition-all"
                            style={{ background: TH, border: `1px solid ${BD}`, color: "#B91C1C", fontSize: "0.72rem", fontWeight: 600, borderRadius: 6 }}>
                            Delete
                          </button>
                        </div>
                      </div>
                    );
                  })()}

                  {/* ════ NOTIFICATIONS ════ */}
                  {currentSubTab === "notifications" && (() => {
                    const availableNotifications = [
                      { id: "bids",   code: "BIDS",   product: "ALL", name: "BIDS",   desc: "Broker Information Disclosure Statement",          edition: "4/1/2015" },
                      { id: "pmb",    code: "PMB",    product: "ALL", name: "PMB",    desc: "ProResponse Member Benefits",                       edition: "5/1/2022" },
                      { id: "triads", code: "TRIADS", product: "ALL", name: "TRIADS", desc: "Terrorism Risk Insurance Act Disclosure Statement", edition: "4/1/2015" },
                    ];
                    const selectedNotifications = [
                      { id: "triads", label: "TRIADS - Terrorism Risk Insurance Act Disclosure Statement", edition: "4/1/2015" },
                      { id: "bids",   label: "BIDS - Broker Information Disclosure Statement",            edition: "4/1/2015" },
                      { id: "pmb",    label: "PMB - ProResponse Member Benefits",                         edition: "5/1/2022" },
                    ];
                    return (
                      <div className="space-y-6">

                        {/* Available Notifications */}
                        <div>
                          <div style={{ fontSize: "0.62rem", fontWeight: 800, color: "white", textTransform: "uppercase", letterSpacing: "0.10em", background: N, padding: "6px 12px", marginBottom: 0 }}>Available Notifications</div>
                          <div style={{ border: `1px solid ${BDL}`, background: "white" }}>
                            <div className="grid px-4 py-2" style={{ gridTemplateColumns: "40px 80px 100px 1fr 100px", background: TH, borderBottom: `1px solid ${BDL}` }}>
                              {["Select", "Product", "Notification Name", "Notification Description", "Edition Date"].map(h => (
                                <span key={h} style={{ fontSize: "0.60rem", fontWeight: 800, color: TT, textTransform: "uppercase", letterSpacing: "0.07em" }}>{h}</span>
                              ))}
                            </div>
                            {availableNotifications.map((n, i) => (
                              <div key={n.id} className="grid items-center px-4 py-3"
                                style={{ gridTemplateColumns: "40px 80px 100px 1fr 100px", borderBottom: i < availableNotifications.length - 1 ? `1px solid ${BDL}` : "none" }}>
                                <div style={{ width: 16, height: 16, border: `2px solid ${BD}`, background: "white" }} />
                                <span style={{ fontSize: "0.78rem", color: TM }}>{n.product}</span>
                                <span style={{ fontSize: "0.78rem", color: N, fontWeight: 600, cursor: "pointer", textDecoration: "underline" }}>{n.name}</span>
                                <span style={{ fontSize: "0.78rem", color: TM }}>{n.desc}</span>
                                <span style={{ fontSize: "0.78rem", color: TM }}>{n.edition}</span>
                              </div>
                            ))}
                          </div>
                          <div className="mt-3">
                            <button className="flex items-center gap-1.5 px-3 py-1.5 hover:brightness-95 transition-all"
                              style={{ background: TH, border: `1px solid ${BD}`, color: TM, fontSize: "0.72rem", fontWeight: 600, borderRadius: 6 }}>
                              Add Notification
                            </button>
                          </div>
                        </div>

                        {/* Selected Notifications */}
                        <div>
                          <div style={{ fontSize: "0.62rem", fontWeight: 800, color: "white", textTransform: "uppercase", letterSpacing: "0.10em", background: N, padding: "6px 12px", marginBottom: 0 }}>Selected Notifications</div>
                          <div style={{ border: `1px solid ${BDL}`, background: "white" }}>
                            {/* Search */}
                            <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: `1px solid ${BDL}`, background: TH }}>
                              <div className="relative flex-1" style={{ maxWidth: 260 }}>
                                <input placeholder="Search notifications…"
                                  className="w-full px-3 py-1.5 pl-8 outline-none"
                                  style={{ border: `1px solid ${BD}`, fontSize: "0.76rem", color: TD, background: "white" }} />
                                <Search size={12} color={TT} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                              </div>
                              <button className="flex items-center gap-1.5 px-3 py-1.5 hover:brightness-95 transition-all"
                                style={{ background: TH, border: `1px solid ${BD}`, color: TM, fontSize: "0.72rem", fontWeight: 600, borderRadius: 6 }}>
                                <Search size={11} /> Search
                              </button>
                            </div>
                            {/* Column headers */}
                            <div className="grid px-4 py-2" style={{ gridTemplateColumns: "40px 1fr 120px", background: TH, borderBottom: `1px solid ${BDL}` }}>
                              {["Select", "Form", "Edition Date"].map(h => (
                                <span key={h} style={{ fontSize: "0.60rem", fontWeight: 800, color: TT, textTransform: "uppercase", letterSpacing: "0.07em" }}>{h}</span>
                              ))}
                            </div>
                            {selectedNotifications.map((n, i) => (
                              <div key={n.id} className="grid items-center px-4 py-3"
                                style={{ gridTemplateColumns: "40px 1fr 120px", borderBottom: i < selectedNotifications.length - 1 ? `1px solid ${BDL}` : "none" }}>
                                <div style={{ width: 16, height: 16, border: `2px solid ${BD}`, borderRadius: "50%", background: "white" }} />
                                <span style={{ fontSize: "0.78rem", color: TM }}>{n.label}</span>
                                <span style={{ fontSize: "0.78rem", color: TM }}>{n.edition}</span>
                              </div>
                            ))}
                          </div>
                          {/* Action buttons */}
                          <div className="flex items-center gap-2 mt-3">
                            <button className="flex items-center gap-1.5 px-3 py-1.5 hover:brightness-95 transition-all"
                              style={{ background: TH, border: `1px solid ${BD}`, color: "#B91C1C", fontSize: "0.72rem", fontWeight: 600, borderRadius: 6 }}>
                              <Trash2 size={11} /> Delete
                            </button>
                            <button className="flex items-center gap-1.5 px-3 py-1.5 hover:brightness-95 transition-all"
                              style={{ background: N, border: `1px solid ${N}`, color: "white", fontSize: "0.72rem", fontWeight: 600, borderRadius: 6 }}>
                              Preview
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* ════ PREMIUM ════ */}
                  {currentSubTab === "premium" && (
                    <div className="space-y-5">
                      <div>
                        <div style={{ fontSize: "0.62rem", fontWeight: 800, color: TT, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 14 }}>Premium Breakdown — {opt.label}</div>
                        <div style={{ border: `1px solid ${BDL}`, background: "white" }}>
                          <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: `1px solid ${BDL}` }}>
                            <span style={{ fontSize: "0.78rem", color: TM }}>Base Premium</span>
                            <span style={{ fontSize: "0.82rem", fontWeight: 700, color: TD }}>{fmt(product.basePremium)}</span>
                          </div>
                          {surcharges > 0 && (
                            <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: `1px solid ${BDL}` }}>
                              <span style={{ fontSize: "0.78rem", color: TM }}>Optional Coverage Surcharges</span>
                              <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#B45309" }}>+{fmt(surcharges)}</span>
                            </div>
                          )}
                          {addedEndTotal > 0 && (
                            <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: `1px solid ${BDL}` }}>
                              <span style={{ fontSize: "0.78rem", color: TM }}>Added Endorsement Premiums</span>
                              <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#7B2FBE" }}>+{fmt(addedEndTotal)}</span>
                            </div>
                          )}
                          {/* Manual adjustment */}
                          <div className="px-4 py-3" style={{ borderBottom: `1px solid ${BDL}`, background: TH }}>
                            <div className="flex items-center justify-between mb-2">
                              <span style={{ fontSize: "0.78rem", color: TM, fontWeight: 600 }}>Manual Adjustment</span>
                              <div className="flex items-center gap-2">
                                <button onClick={() => updateManualPct(pid, opt.id, Math.max(-30, opt.manualPct - 1))}
                                  style={{ width: 22, height: 22, border: `1px solid ${BD}`, background: "white", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 14, color: TM, borderRadius: 6 }}>−</button>
                                <span style={{ minWidth: 44, textAlign: "center", fontSize: "0.88rem", fontWeight: 800, color: opt.manualPct < 0 ? "#1A7A4A" : opt.manualPct > 0 ? "#B91C1C" : TD }}>
                                  {opt.manualPct > 0 ? "+" : ""}{opt.manualPct}%
                                </span>
                                <button onClick={() => updateManualPct(pid, opt.id, Math.min(30, opt.manualPct + 1))}
                                  style={{ width: 22, height: 22, border: `1px solid ${BD}`, background: "white", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 14, color: TM, borderRadius: 6 }}>+</button>
                              </div>
                            </div>
                            <input type="range" min={-30} max={30} step={1} value={opt.manualPct}
                              onChange={e => updateManualPct(pid, opt.id, parseInt(e.target.value))}
                              className="w-full" style={{ accentColor: product.categoryColor }} />
                            <div className="flex justify-between mt-1">
                              <span style={{ fontSize: "0.58rem", color: TT }}>-30%</span>
                              <span style={{ fontSize: "0.58rem", color: TT }}>+30%</span>
                            </div>
                          </div>
                          <div className="flex items-center justify-between px-4 py-4" style={{ background: `${product.categoryColor}06` }}>
                            <span style={{ fontSize: "0.84rem", fontWeight: 800, color: TD }}>Final Premium — {opt.label}</span>
                            <span style={{ fontSize: "1.20rem", fontWeight: 800, color: product.categoryColor }}>{fmt(premium)}</span>
                          </div>
                        </div>
                      </div>

                      {opts.length > 1 && (
                        <div>
                          <div style={{ fontSize: "0.62rem", fontWeight: 800, color: TT, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 10 }}>Option Comparison</div>
                          <div style={{ border: `1px solid ${BDL}`, background: "white" }}>
                            {opts.map((o, i) => {
                              const p = calcPremium(product, o);
                              const isAct = o.id === opt.id;
                              return (
                                <div key={o.id}
                                  className="flex items-center justify-between px-4 py-3 cursor-pointer"
                                  style={{ borderBottom: i < opts.length - 1 ? `1px solid ${BDL}` : "none", background: isAct ? `${o.color}08` : "white", borderLeft: isAct ? `3px solid ${o.color}` : "3px solid transparent" }}
                                  onClick={() => setActiveOptId(prev => ({ ...prev, [pid]: o.id }))}>
                                  <div className="flex items-center gap-2">
                                    <span style={{ width: 8, height: 8, background: o.color, display: "inline-block", borderRadius: "50%" }} />
                                    <span style={{ fontSize: "0.80rem", fontWeight: isAct ? 700 : 500, color: isAct ? o.color : TM }}>{o.label}</span>
                                    {o.manualPct !== 0 && <span style={{ fontSize: "0.68rem", color: o.manualPct < 0 ? "#1A7A4A" : "#B91C1C", fontWeight: 600 }}>{o.manualPct > 0 ? "+" : ""}{o.manualPct}%</span>}
                                  </div>
                                  <span style={{ fontSize: "0.90rem", fontWeight: 800, color: isAct ? o.color : TD }}>{fmt(p)}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      <div className="flex items-start gap-2 p-3" style={{ background: "#FFF8E6", border: "1px solid #F0D88A" }}>
                        <Info size={12} color="#8A5C00" style={{ flexShrink: 0, marginTop: 1 }} />
                        <p style={{ fontSize: "0.70rem", color: "#7A4800", lineHeight: 1.5 }}>Indicative pricing only. Final premium subject to full underwriting review and actuarial sign-off.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* ── QUOTE SUMMARY BAR ──────────────────────────────────────────── */}
      {selected.size >= 2 && (
        <div className="mt-4" style={{ background: "white", border: `1px solid ${BD}`, borderTop: `3px solid ${N}` }}>
          <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: `1px solid ${BDL}`, background: TH }}>
            <h3 style={{ fontSize: "0.72rem", fontWeight: 800, color: N, textTransform: "uppercase", letterSpacing: "0.08em" }}>Quote Summary — All Products</h3>
            <span style={{ fontSize: "0.68rem", color: TT }}>{selected.size} lines selected</span>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
              {Array.from(selected).map(pid => {
                const prod = getProduct(pid);
                const opt  = getActiveOpt(pid);
                if (!opt) return null;
                const p = calcPremium(prod, opt);
                return (
                  <div key={pid}
                    onClick={() => setActive(pid)}
                    className="p-3 cursor-pointer hover:brightness-97 transition-all"
                    style={{ border: `1.5px solid ${activeProductId === pid ? prod.categoryColor : BDL}`, background: activeProductId === pid ? `${prod.categoryColor}06` : TH }}>
                    <div className="flex items-center gap-2 mb-1">
                      <div style={{ color: prod.categoryColor }}>{prod.icon}</div>
                      <span style={{ fontSize: "0.68rem", fontWeight: 800, color: prod.categoryColor, background: `${prod.categoryColor}12`, padding: "1px 5px" }}>{prod.abbr}</span>
                    </div>
                    <div style={{ fontSize: "0.76rem", fontWeight: 600, color: TD, marginBottom: 2 }}>{prod.label.replace(/ \(.*\)/, "")}</div>
                    <div style={{ fontSize: "0.90rem", fontWeight: 800, color: prod.categoryColor }}>{fmt(p)}</div>
                    <div style={{ fontSize: "0.60rem", color: TT, marginTop: 1 }}>{opt.label}{(allOptions[pid]?.length ?? 0) > 1 ? ` · ${allOptions[pid].length} options` : ""}</div>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-between px-4 py-3" style={{ background: `${N}06`, border: `1px solid ${N}20` }}>
              <span style={{ fontSize: "0.84rem", fontWeight: 800, color: TD }}>Grand Total Premium</span>
              <div className="flex items-center gap-4">
                <span style={{ fontSize: "1.30rem", fontWeight: 800, color: N }}>{fmt(totalSelectedPremium)}</span>
                <button
                  onClick={handlePreview}
                  className="flex items-center gap-2 px-4 py-2 hover:brightness-95 transition-all"
                  style={{ background: N, color: "white", border: `1.5px solid ${N}`, fontSize: "0.78rem", fontWeight: 700, fontFamily: font, borderRadius: 6 }}>
                  <Eye size={14} /> Preview Full Quote <ExternalLink size={12} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════
          PRODUCTS LIBRARY MODAL
      ════════════════════════════════════════════════════════════════ */}
      {showProductsLibrary && (
        <Modal onClose={() => setShowProductsLibrary(false)} wide>
          {/* Header */}
          <div style={{ height: 4, background: `linear-gradient(90deg,${G},#A8841C)` }} />
          <div className="flex items-center justify-between px-6 py-4" style={{ background: N, borderBottom: `1px solid ${BDL}` }}>
            <div className="flex items-center gap-3">
              <div style={{ width: 32, height: 32, background: "rgba(201,162,39,0.18)", border: `1px solid ${G}50`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Library size={16} color={G} />
              </div>
              <div>
                <h2 style={{ fontSize: "0.92rem", fontWeight: 800, color: "white" }}>Products Library</h2>
                <p style={{ fontSize: "0.66rem", color: "rgba(255,255,255,0.5)", marginTop: 1 }}>Browse all UE coverage lines and add to this submission</p>
              </div>
            </div>
            <button onClick={() => setShowProductsLibrary(false)}
              style={{ width: 28, height: 28, background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.20)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "white", borderRadius: 6 }}>
              <X size={14} />
            </button>
          </div>

          {/* Already in submission notice */}
          {visibleProductIds.length > 0 && (
            <div className="px-6 py-3 flex flex-wrap items-center gap-2" style={{ background: TH, borderBottom: `1px solid ${BDL}` }}>
              <span style={{ fontSize: "0.64rem", fontWeight: 700, color: TT, textTransform: "uppercase", letterSpacing: "0.07em" }}>In Submission:</span>
              {visibleProductIds.map(pid => {
                const prod = PRODUCTS.find(p => p.id === pid);
                if (!prod) return null;
                return (
                  <span key={pid} className="flex items-center gap-1 px-2 py-0.5"
                    style={{ background: `${prod.categoryColor}10`, border: `1px solid ${prod.categoryColor}25`, fontSize: "0.66rem", fontWeight: 700, color: prod.categoryColor }}>
                    <Check size={9} /> {prod.abbr}
                  </span>
                );
              })}
            </div>
          )}

          {/* Product grid */}
          <div className="p-5">
            {libraryAvailableProducts.length === 0 ? (
              <div className="flex flex-col items-center py-12 gap-3" style={{ color: TT }}>
                <CheckCircle2 size={36} color="#2E7D32" />
                <p style={{ fontSize: "0.90rem", fontWeight: 700, color: TM }}>All products are in this submission</p>
              </div>
            ) : (
              <div className="space-y-4">
                {CATEGORIES.map(cat => {
                  const catProds = cat.productIds
                    .filter(pid => !visibleProductIds.includes(pid))
                    .map(pid => PRODUCTS.find(p => p.id === pid)!).filter(Boolean);
                  if (catProds.length === 0) return null;
                  return (
                    <div key={cat.id}>
                      <div style={{ fontSize: "0.60rem", fontWeight: 800, color: cat.color, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 8 }}>{cat.label}</div>
                      <div className="grid grid-cols-1 gap-2">
                        {catProds.map(prod => (
                          <div key={prod.id}
                            className="flex items-start gap-4 p-4"
                            style={{ border: `1px solid ${BDL}`, background: "white" }}>
                            <div className="flex items-center justify-center shrink-0"
                              style={{ width: 40, height: 40, background: `${cat.color}10`, border: `1px solid ${cat.color}20`, color: cat.color }}>
                              {prod.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span style={{ fontSize: "0.84rem", fontWeight: 700, color: TD }}>{prod.label}</span>
                                <span style={{ fontSize: "0.60rem", fontWeight: 800, color: cat.color, background: `${cat.color}12`, border: `1px solid ${cat.color}25`, padding: "1px 6px" }}>{prod.abbr}</span>
                              </div>
                              <p style={{ fontSize: "0.73rem", color: TT, lineHeight: 1.4 }}>{prod.desc}</p>
                              <p style={{ fontSize: "0.68rem", color: TM, fontWeight: 600, marginTop: 4 }}>Base: {fmt(prod.basePremium)}</p>
                            </div>
                            <button
                              onClick={() => {
                                setVisibleProductIds(prev => [...prev, prod.id]);
                              }}
                              className="flex items-center gap-1.5 px-4 py-2 transition-all hover:brightness-95 shrink-0"
                              style={{ background: cat.color, color: "white", border: "none", cursor: "pointer", fontSize: "0.74rem", fontWeight: 700, fontFamily: font, borderRadius: 6 }}>
                              <Plus size={12} /> Add to Submission
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <div className="px-6 py-4 flex justify-end" style={{ borderTop: `1px solid ${BDL}`, background: TH }}>
            <button onClick={() => setShowProductsLibrary(false)}
              style={{ padding: "8px 20px", background: N, color: "white", border: "none", cursor: "pointer", fontSize: "0.78rem", fontWeight: 700, fontFamily: font, borderRadius: 6 }}>
              Done
            </button>
          </div>
        </Modal>
      )}

      {/* ════════════════════════════════════════════════════════════════
          ENDORSEMENTS LIBRARY MODAL
      ════════════════════════════════════════════════════════════════ */}
      {showEndorsementsLibrary && activeProduct && currentOpt && (() => {
        const product  = activeProduct;
        const pid      = product.id;
        const opt      = currentOpt;
        const libEnds  = ENDORSEMENTS_LIBRARY[pid] ?? [];
        const alreadyAddedIds = new Set(opt.addedEndorsements.map(e => e.id));
        const available = libEnds.filter(e => !alreadyAddedIds.has(e.id));

        return (
          <Modal onClose={() => setShowEndorsementsLibrary(false)}>
            <div style={{ height: 4, background: `linear-gradient(90deg,${product.categoryColor},${product.categoryColor}AA)` }} />
            <div className="flex items-center justify-between px-6 py-4" style={{ background: product.categoryColor, borderBottom: `1px solid ${BDL}` }}>
              <div className="flex items-center gap-3">
                <div style={{ width: 32, height: 32, background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Library size={16} color="white" />
                </div>
                <div>
                  <h2 style={{ fontSize: "0.92rem", fontWeight: 800, color: "white" }}>Endorsements Library</h2>
                  <p style={{ fontSize: "0.66rem", color: "rgba(255,255,255,0.55)", marginTop: 1 }}>
                    {product.label} · {available.length} endorsement{available.length !== 1 ? "s" : ""} available to add
                  </p>
                </div>
              </div>
              <button onClick={() => setShowEndorsementsLibrary(false)}
                style={{ width: 28, height: 28, background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "white", borderRadius: 6 }}>
                <X size={14} />
              </button>
            </div>

            <div className="p-5 space-y-3">
              {available.length === 0 ? (
                <div className="flex flex-col items-center py-10 gap-3" style={{ color: TT }}>
                  <CheckCircle2 size={32} color="#2E7D32" />
                  <p style={{ fontSize: "0.88rem", fontWeight: 700, color: TM }}>All available endorsements have been added</p>
                </div>
              ) : available.map(libEnd => {
                const isAdded = alreadyAddedIds.has(libEnd.id);
                return (
                  <div key={libEnd.id}
                    className="flex items-start gap-4 p-4"
                    style={{ border: `1px solid ${isAdded ? product.categoryColor + "40" : BDL}`, background: isAdded ? `${product.categoryColor}04` : "white" }}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span style={{ fontSize: "0.84rem", fontWeight: 700, color: TD }}>{libEnd.label}</span>
                      </div>
                      <p style={{ fontSize: "0.73rem", color: TT, lineHeight: 1.4 }}>{libEnd.desc}</p>
                      <p style={{ fontSize: "0.72rem", color: product.categoryColor, fontWeight: 700, marginTop: 5 }}>+{fmt(libEnd.premium)}</p>
                    </div>
                    <button
                      onClick={() => {
                        addEndorsementFromLibrary(pid, opt.id, libEnd);
                      }}
                      disabled={isAdded}
                      className="flex items-center gap-1.5 px-4 py-2 transition-all hover:brightness-95 disabled:opacity-60 shrink-0"
                      style={{ background: isAdded ? `${product.categoryColor}20` : product.categoryColor, color: isAdded ? product.categoryColor : "white", border: isAdded ? `1px solid ${product.categoryColor}40` : "none", cursor: isAdded ? "default" : "pointer", fontSize: "0.74rem", fontWeight: 700, fontFamily: font, borderRadius: 6 }}>
                      {isAdded ? <><Check size={12} /> Added</> : <><Plus size={12} /> Add</>}
                    </button>
                  </div>
                );
              })}
            </div>
            <div className="px-6 py-4 flex justify-end" style={{ borderTop: `1px solid ${BDL}`, background: TH }}>
              <button onClick={() => setShowEndorsementsLibrary(false)}
                style={{ padding: "8px 20px", background: product.categoryColor, color: "white", border: "none", cursor: "pointer", fontSize: "0.78rem", fontWeight: 700, fontFamily: font, borderRadius: 6 }}>
                Done
              </button>
            </div>
          </Modal>
        );
      })()}

      {/* ════════════════════════════════════════════════════════════════
          ISSUE QUOTE MODAL
      ════════════════════════════════════════════════════════════════ */}
      {showIssueModal && (
        <Modal onClose={() => { setShowIssueModal(false); setIssueDone(false); }}>
          <div style={{ height: 4, background: `linear-gradient(90deg,${G},#A8841C)` }} />
          <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${BDL}`, background: N }}>
            <h3 style={{ fontSize: "0.90rem", fontWeight: 800, color: "white" }}>Issue Quote</h3>
            <button onClick={() => { setShowIssueModal(false); setIssueDone(false); }}
              style={{ width: 28, height: 28, background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", borderRadius: 6 }}>
              <X size={14} color="white" />
            </button>
          </div>
          <div className="p-6 space-y-4">
            {issueDone ? (
              <div className="flex flex-col items-center py-8 gap-3">
                <CheckCircle2 size={48} color="#2E7D32" />
                <p style={{ fontSize: "1.0rem", fontWeight: 800, color: "#1A5C30" }}>Quote Issued!</p>
                <p style={{ fontSize: "0.78rem", color: TT }}>Quote number: <strong style={{ color: N }}>{quoteNumber}</strong></p>
              </div>
            ) : (
              <>
                <div style={{ fontSize: "0.78rem", color: TM, lineHeight: 1.6 }}>
                  You are about to issue a formal quote for <strong>{selected.size} product line{selected.size > 1 ? "s" : ""}</strong>.
                  Review the summary below before issuing.
                </div>
                {[0, 1].map(optIdx => {
                  const total = grandTotal(optIdx);
                  const hasOpt = Array.from(selected).some(pid => (allOptions[pid]?.length ?? 0) > optIdx);
                  if (!hasOpt) return null;
                  return (
                    <div key={optIdx} className="px-4 py-3" style={{ background: TH, border: `1px solid ${BDL}` }}>
                      <div style={{ fontSize: "0.64rem", fontWeight: 700, color: TT, textTransform: "uppercase", marginBottom: 6 }}>
                        {`Set ${String(optIdx + 1).padStart(2, "0")}`}
                      </div>
                      <div style={{ fontSize: "1.10rem", fontWeight: 800, color: N }}>{fmt(total)}</div>
                    </div>
                  );
                })}
                <button onClick={handleIssueQuote}
                  className="w-full flex items-center justify-center gap-2 py-3 transition-all hover:brightness-95"
                  style={{ background: G, color: "white", border: "none", cursor: "pointer", fontSize: "0.84rem", fontWeight: 800, fontFamily: font, borderRadius: 6 }}>
                  <FileText size={15} /> Issue Quote
                </button>
              </>
            )}
          </div>
        </Modal>
      )}

      {/* ════════════════════════════════════════════════════════════════
          SEND TO BROKER MODAL
      ════════════════════════════════════════════════════════════════ */}
      {showSendModal && (
        <Modal onClose={() => { setShowSendModal(false); setSendDone(false); }}>
          <div style={{ height: 4, background: `linear-gradient(90deg,${N},${G})` }} />
          <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${BDL}`, background: N }}>
            <h3 style={{ fontSize: "0.90rem", fontWeight: 800, color: "white" }}>Send Quote to Broker</h3>
            <button onClick={() => { setShowSendModal(false); setSendDone(false); }}
              style={{ width: 28, height: 28, background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", borderRadius: 6 }}>
              <X size={14} color="white" />
            </button>
          </div>
          <div className="p-6 space-y-4">
            {sendDone ? (
              <div className="flex flex-col items-center py-8 gap-3">
                <CheckCircle2 size={48} color="#2E7D32" />
                <p style={{ fontSize: "1.0rem", fontWeight: 800, color: "#1A5C30" }}>Quote Sent!</p>
              </div>
            ) : (
              <>
                {[
                  { label: "Broker Name",     value: brokerName,  setter: setBrokerName,  icon: <Users size={13} />  },
                  { label: "Broker Email",    value: brokerEmail, setter: setBrokerEmail, icon: <Mail size={13} />   },
                  { label: "Quote Expiry",    value: sendExpiry,  setter: setSendExpiry,  icon: null, type: "date"   },
                ].map(f => (
                  <div key={f.label}>
                    <label style={{ fontSize: "0.62rem", fontWeight: 700, color: TT, textTransform: "uppercase", letterSpacing: "0.07em", display: "block", marginBottom: 5 }}>{f.label}</label>
                    <div className="relative">
                      {f.icon && <div style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: TT, pointerEvents: "none" }}>{f.icon}</div>}
                      <input type={(f as any).type ?? "text"} value={f.value} onChange={e => f.setter(e.target.value)}
                        style={{ width: "100%", boxSizing: "border-box", paddingLeft: f.icon ? 34 : 11, paddingRight: 11, paddingTop: 9, paddingBottom: 9, border: `1px solid ${BD}`, fontSize: "0.82rem", fontFamily: font, outline: "none", color: TD }} />
                    </div>
                  </div>
                ))}
                <div>
                  <label style={{ fontSize: "0.62rem", fontWeight: 700, color: TT, textTransform: "uppercase", letterSpacing: "0.07em", display: "block", marginBottom: 5 }}>Message</label>
                  <textarea value={sendMsg} onChange={e => setSendMsg(e.target.value)} rows={4}
                    style={{ width: "100%", boxSizing: "border-box", padding: "9px 11px", border: `1px solid ${BD}`, fontSize: "0.82rem", fontFamily: font, outline: "none", color: TD, resize: "vertical" }} />
                </div>
                <button onClick={handleSend}
                  className="w-full flex items-center justify-center gap-2 py-3 transition-all hover:brightness-95"
                  style={{ background: N, color: "white", border: "none", cursor: "pointer", fontSize: "0.84rem", fontWeight: 800, fontFamily: font, borderRadius: 6 }}>
                  <Send size={15} /> Send Quote
                </button>
              </>
            )}
          </div>
        </Modal>
      )}

      {/* ════════════════════════════════════════════════════════════════
          REFER MODAL
      ════════════════════════════════════════════════════════════════ */}
      {showReferModal && (
        <Modal onClose={() => { setShowReferModal(false); setReferDone(false); }}>
          <div style={{ height: 4, background: `linear-gradient(90deg,#F0D88A,${G})` }} />
          <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${BDL}`, background: "#7A4800" }}>
            <h3 style={{ fontSize: "0.90rem", fontWeight: 800, color: "white" }}>Refer Quote</h3>
            <button onClick={() => { setShowReferModal(false); setReferDone(false); }}
              style={{ width: 28, height: 28, background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", borderRadius: 6 }}>
              <X size={14} color="white" />
            </button>
          </div>
          <div className="p-6 space-y-4">
            {referDone ? (
              <div className="flex flex-col items-center py-8 gap-3">
                <CheckCircle2 size={48} color={G} />
                <p style={{ fontSize: "1.0rem", fontWeight: 800, color: "#7A4800" }}>Referred for Review</p>
              </div>
            ) : (
              <>
                {[
                  { label: "Refer To",        value: referTo,       setter: setReferTo,       opts: ["UW Manager","UW Director","Reinsurance","Actuarial","Legal"] },
                  { label: "Referral Reason",  value: referCategory, setter: setReferCategory, opts: ["Pricing Exception","Large Account","Unusual Risk","Capacity Issue","Compliance Review"] },
                  { label: "Priority",         value: referPriority, setter: setReferPriority, opts: ["Critical","High","Medium","Low"] },
                ].map(f => (
                  <div key={f.label}>
                    <label style={{ fontSize: "0.62rem", fontWeight: 700, color: TT, textTransform: "uppercase", letterSpacing: "0.07em", display: "block", marginBottom: 5 }}>{f.label}</label>
                    <div className="relative">
                      <select value={f.value} onChange={e => f.setter(e.target.value)}
                        style={{ width: "100%", padding: "9px 11px", border: `1px solid ${BD}`, fontSize: "0.82rem", fontFamily: font, outline: "none", color: TD, background: "white", appearance: "none", cursor: "pointer" }}>
                        {f.opts.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                      <ChevronDown size={13} color={TT} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                    </div>
                  </div>
                ))}
                <div>
                  <label style={{ fontSize: "0.62rem", fontWeight: 700, color: TT, textTransform: "uppercase", letterSpacing: "0.07em", display: "block", marginBottom: 5 }}>Notes <span style={{ color: "#B91C1C" }}>*</span></label>
                  <textarea value={referNotes} onChange={e => setReferNotes(e.target.value)} rows={4} placeholder="Explain the reason for referral…"
                    style={{ width: "100%", boxSizing: "border-box", padding: "9px 11px", border: `1px solid ${BD}`, fontSize: "0.82rem", fontFamily: font, outline: "none", color: TD, resize: "vertical" }} />
                  {!referNotes.trim() && <p style={{ fontSize: "0.62rem", color: "#B91C1C", marginTop: 4 }}>Notes are required for referral</p>}
                </div>
                <button onClick={handleRefer} disabled={!referNotes.trim()}
                  className="w-full flex items-center justify-center gap-2 py-3 transition-all hover:brightness-95 disabled:opacity-50"
                  style={{ background: G, color: "white", border: "none", cursor: referNotes.trim() ? "pointer" : "default", fontSize: "0.84rem", fontWeight: 800, fontFamily: font, borderRadius: 6 }}>
                  <GitBranch size={15} /> Submit Referral
                </button>
              </>
            )}
          </div>
        </Modal>
      )}

      {/* ── Delete option confirmation modal ─────────────────────────────── */}
      {deleteConfirm && (
        <Modal onClose={() => setDeleteConfirm(null)}>
          <div className="px-5 py-4 flex items-center gap-3" style={{ background: "#FEF2F2", borderBottom: `1px solid #FEE2E2` }}>
            <div className="flex items-center justify-center shrink-0"
              style={{ width: 36, height: 36, background: "#FEE2E2", borderRadius: 8 }}>
              <AlertTriangle size={18} color="#B91C1C"/>
            </div>
            <div className="flex-1">
              <div style={{ fontSize: "0.92rem", fontWeight: 800, color: "#7F1D1D" }}>Delete rating option?</div>
              <div style={{ fontSize: "0.74rem", color: "#991B1B", marginTop: 2 }}>This action cannot be undone.</div>
            </div>
            <button onClick={() => setDeleteConfirm(null)}
              className="flex items-center justify-center p-1.5 hover:bg-red-100 transition-colors"
              style={{ background: "transparent", border: "none", cursor: "pointer", borderRadius: 4 }}>
              <X size={14} color="#7F1D1D"/>
            </button>
          </div>
          <div className="p-5">
            <p style={{ fontSize: "0.84rem", color: TD, lineHeight: 1.55 }}>
              Are you sure you want to delete <strong>{deleteConfirm.label}</strong>?
              Any sublimit settings and added endorsements specific to this option will also be removed.
            </p>
            <div className="flex items-center justify-end gap-2 mt-5">
              <button onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 transition-colors hover:bg-slate-50"
                style={{
                  border: `1px solid ${BD}`, background: "white", color: TM,
                  fontSize: "0.78rem", fontWeight: 700, borderRadius: 6, cursor: "pointer", fontFamily: font,
                }}>
                Cancel
              </button>
              <button onClick={commitDeleteOption}
                className="flex items-center gap-1.5 px-4 py-2 transition-all active:scale-95"
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 4px 14px rgba(185,28,28,0.40)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 2px 8px rgba(185,28,28,0.30)"; }}
                style={{
                  background: "#B91C1C", color: "white", border: "none", cursor: "pointer",
                  fontSize: "0.78rem", fontWeight: 700, borderRadius: 6, fontFamily: font,
                  boxShadow: "0 2px 8px rgba(185,28,28,0.30)",
                }}>
                <Trash2 size={13}/> Delete option
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Toast / snackbar ─────────────────────────────────────────────── */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed flex items-center gap-2 px-4 py-2.5"
          style={{
            bottom: 24, right: 24, zIndex: 100,
            background: toast.tone === "error" ? "#B91C1C" : toast.tone === "info" ? N : "#15803D",
            color: "white",
            borderRadius: 8,
            boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
            fontSize: "0.80rem", fontWeight: 600, fontFamily: font,
          }}>
          {toast.tone === "error" ? <AlertTriangle size={14}/> : <CheckCircle2 size={14}/>}
          <span>{toast.msg}</span>
        </div>
      )}
    </div>
  );
}
