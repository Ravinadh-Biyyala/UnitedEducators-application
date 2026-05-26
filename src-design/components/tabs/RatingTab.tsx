import { useState, useCallback, useRef, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  Check, Plus, X, Info, Shield, FileText, AlertCircle,
  ShieldCheck, UserCheck, Briefcase, Globe, Lock, Car,
  Users, Building2, Send, Mail, GitBranch, Save,
  Copy, CheckCircle2, DollarSign, Layers, ChevronDown,
  BookOpen, Library, Calendar, Bell, Star, Search, Trash2,
  Pencil, Eye, ExternalLink, MoreVertical, AlertTriangle, RotateCcw,
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
const TT   = "#5F7080";
const font = "'Source Sans 3', system-ui, sans-serif";

const OPTION_COLORS  = ["#6B8DD6", "#9B7EBD", "#6FAE93", "#D9A06B", "#7BABC4", "#C48BA0", "#8694D9", "#7FB89B"];

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
  /** Has empty fields that must be filled in manually. */
  fillIn?: boolean;
  /** Can be attached multiple times — each instance has its own sequence #. */
  multiUse?: boolean;
}
interface LibraryEndorsement {
  id: string; label: string; desc: string; premium: number;
  /** Requires underwriter fill-in (named insureds, dates, locations, sublimits). */
  fillIn?: boolean;
  /** Can be attached multiple times — each instance has its own sequence #. */
  multiUse?: boolean;
  /** Static sample / developer copy of the endorsement form. Falls back to a computed URL when absent. */
  sampleUrl?: string;
}
interface LibrarySchedule {
  id: string; label: string; desc: string;
  premium: number;
  /** Requires underwriter fill-in (locations, addresses, named insureds, etc.) */
  fillIn?: boolean;
  /** Can be attached multiple times — each instance has its own sequence #. */
  multiUse?: boolean;
  /** Static sample / developer copy of the schedule form. */
  sampleUrl?: string;
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
  addedSchedules:    LibrarySchedule[]; // from schedules library
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

/* ─── Category palette ── All categories use the single brand color N (#0123D4) ── */
const CAT_GL = N;
const CAT_ML = N;
const CAT_PL = N;
const CAT_AR = N;
const CAT_EL = N;

/* ─── Product catalog ───────────────────────────────────────────────────── */
const PRODUCTS: ProductDef[] = [
  /* ════════ General Liability (GL) ════════ */
  {
    id: "cgl", label: "Primary General Liability", abbr: "CGL",
    desc: "Primary BI/PD with premises, operations, products & completed ops",
    icon: <Shield size={16} />, category: "General Liability", categoryColor: CAT_GL,
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
      { id: "cgl-c1", label: "Premises & Operations",           desc: "Bodily injury and property damage on premises",          required: true,  checked: true,  price: 0    },
      { id: "cgl-c2", label: "Products & Completed Operations", desc: "Liability arising from products and completed work",     required: true,  checked: true,  price: 0    },
      { id: "cgl-c3", label: "Personal & Advertising Injury",   desc: "Libel, slander, copyright infringement claims",          required: true,  checked: true,  price: 0    },
      { id: "cgl-c4", label: "Medical Payments",                desc: "Medical expenses regardless of fault",                   required: false, checked: true,  price: 1800 },
      { id: "cgl-c5", label: "Fire Legal Liability",            desc: "Damage to rented or borrowed premises by fire",          required: false, checked: true,  price: 1200 },
      { id: "cgl-c6", label: "Host Liquor Liability",           desc: "Bodily injury from alcohol at sponsored events",         required: false, checked: false, price: 1600 },
    ],
    endorsements: [
      { id: "cgl-e1", label: "Sexual Abuse & Molestation", desc: "SAM liability for the institution and its employees",  premium: 8400, included: false, fillIn: true,  multiUse: true  },
      { id: "cgl-e2", label: "Liquor Liability Extension", desc: "Events where alcohol is served on premises",            premium: 1600, included: false, fillIn: true                  },
      { id: "cgl-e3", label: "Volunteer Liability",        desc: "Extends GL to approved volunteer activities",           premium: 900,  included: false,                multiUse: true  },
      { id: "cgl-e4", label: "Broad Form Contractual",     desc: "Broadens contractual liability assumed in contracts",   premium: 1100, included: false                                 },
    ],
  },
  {
    id: "blx", label: "Buffer Excess Liability", abbr: "BLX",
    desc: "First-layer buffer above primary GL to attach excess towers",
    icon: <Layers size={16} />, category: "General Liability", categoryColor: CAT_GL,
    basePremium: 5800,
    coverageFields: [
      { label: "Limit per Occurrence", value: "$2,000,000",     type: "select", options: ["$1,000,000","$2,000,000","$5,000,000"] },
      { label: "Aggregate Limit",      value: "$2,000,000",     type: "select", options: ["$2,000,000","$5,000,000","$10,000,000"] },
      { label: "Attachment Point",     value: "$1,000,000",     type: "select", options: ["$500,000","$1,000,000","$2,000,000"] },
      { label: "Underlying Policy",    value: "Primary CGL",    type: "select", options: ["Primary CGL","Auto","ELL"] },
      { label: "Form Basis",           value: "Following Form", type: "select", options: ["Following Form","Stand-Alone"] },
      { label: "Coverage Territory",   value: "USA & Canada",   type: "select", options: ["USA Only","USA & Canada","Worldwide"] },
    ],
    coverageItems: [
      { id: "blx-c1", label: "Following Form",         desc: "Follows the terms of the underlying primary policy",      required: true,  checked: true,  price: 0    },
      { id: "blx-c2", label: "Defense Cost Inclusion", desc: "Defense costs included within the limit of liability",    required: true,  checked: true,  price: 0    },
      { id: "blx-c3", label: "Drop-Down Coverage",     desc: "Drops down if primary is exhausted by an unrelated claim",required: false, checked: true,  price: 1400 },
      { id: "blx-c4", label: "Maintenance Deductible", desc: "Self-insured retention for claims piercing the buffer",   required: false, checked: false, price: 900  },
      { id: "blx-c5", label: "Sublimit Pollution",     desc: "$1M sublimit for pollution events",                       required: false, checked: false, price: 1800 },
      { id: "blx-c6", label: "Worldwide Territory",    desc: "Extends territory to worldwide operations",               required: false, checked: false, price: 1200 },
    ],
    endorsements: [
      { id: "blx-e1", label: "Excess Sexual Misconduct", desc: "Excess SAM coverage following primary",        premium: 4200, included: false },
      { id: "blx-e2", label: "Aggregate Reinstatement",  desc: "One automatic reinstatement of the aggregate", premium: 3100, included: false },
      { id: "blx-e3", label: "Auto Buffer Extension",    desc: "Extends buffer to commercial auto liability",  premium: 1800, included: false },
      { id: "blx-e4", label: "Worldwide Territory",      desc: "Worldwide territory endorsement",              premium: 900,  included: false },
    ],
  },
  {
    id: "glx", label: "General Liability Excess", abbr: "GLX",
    desc: "Excess GL tower above primary and buffer policies",
    icon: <Layers size={16} />, category: "General Liability", categoryColor: CAT_GL,
    basePremium: 4400,
    coverageFields: [
      { label: "Limit per Occurrence", value: "$5,000,000",     type: "select", options: ["$5,000,000","$10,000,000","$25,000,000"] },
      { label: "Aggregate Limit",      value: "$5,000,000",     type: "select", options: ["$5,000,000","$10,000,000","$25,000,000"] },
      { label: "Attachment Point",     value: "$3,000,000",     type: "select", options: ["$2,000,000","$3,000,000","$5,000,000"] },
      { label: "Underlying Layer",     value: "Buffer + CGL",   type: "select", options: ["Primary CGL","Buffer + CGL","Stand-Alone"] },
      { label: "Form Basis",           value: "Following Form", type: "select", options: ["Following Form","Stand-Alone"] },
      { label: "Coverage Territory",   value: "USA & Canada",   type: "select", options: ["USA Only","USA & Canada","Worldwide"] },
    ],
    coverageItems: [
      { id: "glx-c1", label: "Following Form",          desc: "Follows the terms of the underlying tower",         required: true,  checked: true,  price: 0    },
      { id: "glx-c2", label: "Higher Limits",           desc: "Extends limits above primary and buffer layers",    required: true,  checked: true,  price: 0    },
      { id: "glx-c3", label: "Drop-Down Coverage",      desc: "Drops down on exhaustion of underlying aggregate",  required: false, checked: true,  price: 2200 },
      { id: "glx-c4", label: "Aggregate Reinstatement", desc: "One automatic reinstatement of the aggregate",      required: false, checked: false, price: 3400 },
      { id: "glx-c5", label: "Defense Outside Limit",   desc: "Defense costs paid outside the limit of liability", required: false, checked: false, price: 1800 },
      { id: "glx-c6", label: "Maintenance Deductible",  desc: "SIR for direct piercing claims",                    required: false, checked: false, price: 1000 },
    ],
    endorsements: [
      { id: "glx-e1", label: "Punitive Damages",          desc: "Adds punitive damages where insurable by law",   premium: 3800, included: false },
      { id: "glx-e2", label: "Sexual Misconduct (Excess)",desc: "Excess SAM coverage following primary",          premium: 5600, included: false },
      { id: "glx-e3", label: "Stand-Alone Form",          desc: "Switches to stand-alone form for select perils", premium: 4200, included: false },
      { id: "glx-e4", label: "Worldwide Territory",       desc: "Worldwide territory extension",                  premium: 1100, included: false },
    ],
  },
  {
    id: "psl", label: "Public School Liability", abbr: "PSL",
    desc: "Statutory liability protection for public school districts",
    icon: <Building2 size={16} />, category: "General Liability", categoryColor: CAT_GL,
    basePremium: 9600,
    coverageFields: [
      { label: "Each Occurrence",        value: "$1,000,000",   type: "select", options: ["$500,000","$1,000,000","$2,000,000"] },
      { label: "Aggregate Limit",        value: "$3,000,000",   type: "select", options: ["$1,000,000","$3,000,000","$5,000,000"] },
      { label: "Retention (Deductible)", value: "$25,000",      type: "select", options: ["$10,000","$25,000","$50,000","$100,000"] },
      { label: "Statutory Cap",          value: "Yes",          type: "select", options: ["Yes","No"] },
      { label: "Defense Basis",          value: "Outside Limit",type: "select", options: ["Within Limit","Outside Limit"] },
      { label: "Coverage Territory",     value: "Statewide",    type: "select", options: ["Statewide","USA & Canada","Worldwide"] },
    ],
    coverageItems: [
      { id: "psl-c1", label: "Statutory Tort Defense",         desc: "Defense for statutory tort claims against the district",  required: true,  checked: true,  price: 0    },
      { id: "psl-c2", label: "Sovereign Immunity Reservation", desc: "Coverage preserves sovereign immunity defenses",          required: true,  checked: true,  price: 0    },
      { id: "psl-c3", label: "Civil Rights Defense",           desc: "Defense for 42 U.S.C. §1983 civil rights claims",         required: true,  checked: true,  price: 0    },
      { id: "psl-c4", label: "Student Discipline Defense",     desc: "Expulsion and disciplinary proceeding defense",           required: false, checked: true,  price: 2200 },
      { id: "psl-c5", label: "Title IX Defense",               desc: "Sex discrimination and education program access claims",  required: false, checked: false, price: 2000 },
      { id: "psl-c6", label: "Athletic Injury Defense",        desc: "Defense for athletic participation injury claims",        required: false, checked: false, price: 1600 },
    ],
    endorsements: [
      { id: "psl-e1", label: "Sexual Abuse Defense",      desc: "Defense costs for sexual abuse allegations",      premium: 6800, included: false },
      { id: "psl-e2", label: "Special Education Defense", desc: "IDEA / 504 plan dispute defense costs",           premium: 2400, included: false },
      { id: "psl-e3", label: "Bond Election Defense",     desc: "Defense for school bond election disputes",       premium: 1800, included: false },
      { id: "psl-e4", label: "Open Meeting Law Defense",  desc: "Defense for alleged open-meeting law violations", premium: 1500, included: false },
    ],
  },

  /* ════════ Management Liability (ML) ════════ */
  {
    id: "ell", label: "Educators Legal Liability", abbr: "ELL",
    desc: "Professional errors & omissions for educators and administrators",
    icon: <ShieldCheck size={16} />, category: "Management Liability", categoryColor: CAT_ML,
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
    id: "elx", label: "Excess Educators Legal Liability", abbr: "ELX",
    desc: "Excess limits following form above primary ELL",
    icon: <Layers size={16} />, category: "Management Liability", categoryColor: CAT_ML,
    basePremium: 7200,
    coverageFields: [
      { label: "Limit per Claim",    value: "$3,000,000",     type: "select", options: ["$2,000,000","$3,000,000","$5,000,000","$10,000,000"] },
      { label: "Aggregate Limit",    value: "$5,000,000",     type: "select", options: ["$3,000,000","$5,000,000","$10,000,000"] },
      { label: "Attachment Point",   value: "$2,000,000",     type: "select", options: ["$1,000,000","$2,000,000","$3,000,000"] },
      { label: "Underlying ELL",     value: "Primary ELL",    type: "select", options: ["Primary ELL","Stand-Alone"] },
      { label: "Form Basis",         value: "Following Form", type: "select", options: ["Following Form","Stand-Alone"] },
      { label: "Coverage Territory", value: "USA & Canada",   type: "select", options: ["USA Only","USA & Canada","Worldwide"] },
    ],
    coverageItems: [
      { id: "elx-c1", label: "Following Form",          desc: "Follows the terms of the primary ELL policy",         required: true,  checked: true,  price: 0    },
      { id: "elx-c2", label: "Higher Limits",           desc: "Extends limits above the primary ELL",                required: true,  checked: true,  price: 0    },
      { id: "elx-c3", label: "Drop-Down Coverage",      desc: "Drops down on exhaustion of primary aggregate",       required: false, checked: true,  price: 1800 },
      { id: "elx-c4", label: "Defense Outside Limit",   desc: "Defense costs paid outside the limit of liability",   required: false, checked: false, price: 1600 },
      { id: "elx-c5", label: "Aggregate Reinstatement", desc: "One automatic reinstatement of the aggregate",        required: false, checked: false, price: 2400 },
      { id: "elx-c6", label: "Punitive Damages",        desc: "Adds punitive damages where insurable",               required: false, checked: false, price: 2200 },
    ],
    endorsements: [
      { id: "elx-e1", label: "Title IX Excess",          desc: "Excess Title IX defense coverage",          premium: 2800, included: false },
      { id: "elx-e2", label: "IDEA Defense Excess",      desc: "Excess limits for IDEA / 504 dispute defense", premium: 1900, included: false },
      { id: "elx-e3", label: "Online Learning Extension",desc: "Excess for remote/online instruction claims", premium: 1200, included: false },
      { id: "elx-e4", label: "Stand-Alone Form",         desc: "Switches to stand-alone form",              premium: 3400, included: false },
    ],
  },
  {
    id: "fdl", label: "Fiduciary Liability", abbr: "FDL",
    desc: "ERISA fiduciary duty breach coverage for plan administrators",
    icon: <Lock size={16} />, category: "Management Liability", categoryColor: CAT_ML,
    basePremium: 4800,
    coverageFields: [
      { label: "Each Claim Limit",       value: "$1,000,000",   type: "select", options: ["$500,000","$1,000,000","$2,000,000","$3,000,000"] },
      { label: "Aggregate Limit",        value: "$3,000,000",   type: "select", options: ["$1,000,000","$2,000,000","$3,000,000","$5,000,000"] },
      { label: "Retention (Deductible)", value: "$15,000",      type: "select", options: ["$5,000","$10,000","$15,000","$25,000","$50,000"] },
      { label: "Retroactive Date",       value: "07/01/2017",   type: "date" },
      { label: "Defense Basis",          value: "Outside Limit",type: "select", options: ["Within Limit","Outside Limit"] },
      { label: "Coverage Territory",     value: "USA & Canada", type: "select", options: ["USA Only","USA & Canada","Worldwide"] },
    ],
    coverageItems: [
      { id: "fdl-c1", label: "ERISA Fiduciary Liability",        desc: "Breach of fiduciary duty under ERISA",                       required: true,  checked: true,  price: 0    },
      { id: "fdl-c2", label: "Settlor Function Defense",         desc: "Defense for plan design and settlor decisions",              required: true,  checked: true,  price: 0    },
      { id: "fdl-c3", label: "Plan Administration Errors",       desc: "Negligent administration of benefit plans",                  required: true,  checked: true,  price: 0    },
      { id: "fdl-c4", label: "Voluntary Compliance Programs",    desc: "Voluntary correction program filing fees and penalties",     required: false, checked: true,  price: 1200 },
      { id: "fdl-c5", label: "HIPAA Defense",                    desc: "Defense for HIPAA privacy breach claims",                    required: false, checked: false, price: 1400 },
      { id: "fdl-c6", label: "Cyber Plan Asset Theft",           desc: "Cyber-related theft of plan assets",                         required: false, checked: false, price: 1800 },
    ],
    endorsements: [
      { id: "fdl-e1", label: "Voluntary Compliance Loss",  desc: "Penalty payments under EBSA voluntary compliance programs", premium: 1600, included: false },
      { id: "fdl-e2", label: "HIPAA / HITECH Defense",     desc: "Enhanced defense for HIPAA privacy and security claims",    premium: 1900, included: false },
      { id: "fdl-e3", label: "Plan Asset Cyber Theft",     desc: "Coverage for cyber theft of participant plan assets",       premium: 2400, included: false },
      { id: "fdl-e4", label: "Retired Trustee Run-Off",    desc: "Run-off coverage for retired plan trustees",                premium: 1100, included: false },
    ],
  },
  {
    id: "fdx", label: "Excess Fiduciary Liability", abbr: "FDX",
    desc: "Excess limits following form above primary fiduciary policy",
    icon: <Layers size={16} />, category: "Management Liability", categoryColor: CAT_ML,
    basePremium: 2400,
    coverageFields: [
      { label: "Limit per Claim",    value: "$2,000,000",     type: "select", options: ["$1,000,000","$2,000,000","$5,000,000","$10,000,000"] },
      { label: "Aggregate Limit",    value: "$3,000,000",     type: "select", options: ["$2,000,000","$3,000,000","$5,000,000"] },
      { label: "Attachment Point",   value: "$1,000,000",     type: "select", options: ["$500,000","$1,000,000","$2,000,000"] },
      { label: "Underlying FDL",     value: "Primary FDL",    type: "select", options: ["Primary FDL","Stand-Alone"] },
      { label: "Form Basis",         value: "Following Form", type: "select", options: ["Following Form","Stand-Alone"] },
      { label: "Coverage Territory", value: "USA & Canada",   type: "select", options: ["USA Only","USA & Canada","Worldwide"] },
    ],
    coverageItems: [
      { id: "fdx-c1", label: "Following Form",          desc: "Follows the primary fiduciary policy",            required: true,  checked: true,  price: 0    },
      { id: "fdx-c2", label: "Higher Limits",           desc: "Extends limits above the primary fiduciary",       required: true,  checked: true,  price: 0    },
      { id: "fdx-c3", label: "Drop-Down Coverage",      desc: "Drops down on exhaustion of primary aggregate",    required: false, checked: true,  price: 800  },
      { id: "fdx-c4", label: "Defense Outside Limit",   desc: "Defense costs paid outside the limit",             required: false, checked: false, price: 600  },
      { id: "fdx-c5", label: "Aggregate Reinstatement", desc: "One reinstatement of the aggregate",               required: false, checked: false, price: 1100 },
      { id: "fdx-c6", label: "Voluntary Compliance",    desc: "Extends voluntary compliance program coverage",    required: false, checked: false, price: 700  },
    ],
    endorsements: [
      { id: "fdx-e1", label: "Run-Off Coverage (3-yr)",  desc: "Extended reporting period for departing fiduciaries", premium: 1800, included: false },
      { id: "fdx-e2", label: "HIPAA Excess",             desc: "Excess limits for HIPAA defense",                    premium: 1100, included: false },
      { id: "fdx-e3", label: "Cyber Plan Asset Theft",   desc: "Excess limits for cyber plan asset theft",           premium: 1400, included: false },
      { id: "fdx-e4", label: "Stand-Alone Form",         desc: "Switches to stand-alone form",                       premium: 1900, included: false },
    ],
  },
  {
    id: "sbl", label: "School Board Legal", abbr: "SBL",
    desc: "Personal liability protection for board members and trustees",
    icon: <Briefcase size={16} />, category: "Management Liability", categoryColor: CAT_ML,
    basePremium: 5400,
    coverageFields: [
      { label: "Each Claim Limit",       value: "$2,000,000",   type: "select", options: ["$1,000,000","$2,000,000","$3,000,000","$5,000,000"] },
      { label: "Aggregate Limit",        value: "$4,000,000",   type: "select", options: ["$2,000,000","$4,000,000","$5,000,000","$10,000,000"] },
      { label: "Retention (Deductible)", value: "$25,000",      type: "select", options: ["$10,000","$25,000","$50,000","$100,000"] },
      { label: "Continuity Date",        value: "07/01/2015",   type: "date" },
      { label: "Defense Basis",          value: "Outside Limit",type: "select", options: ["Within Limit","Outside Limit"] },
      { label: "Discovery Period",       value: "12 Months",    type: "select", options: ["12 Months","24 Months","36 Months"] },
    ],
    coverageItems: [
      { id: "sbl-c1", label: "Directors & Officers Liability",  desc: "Wrongful acts by board members and trustees",          required: true,  checked: true,  price: 0    },
      { id: "sbl-c2", label: "Advancement of Defense Costs",    desc: "Defense costs advanced prior to final adjudication",   required: true,  checked: true,  price: 0    },
      { id: "sbl-c3", label: "Open Meeting Law Defense",        desc: "Defense for alleged open-meeting law violations",      required: true,  checked: true,  price: 0    },
      { id: "sbl-c4", label: "Entity Coverage",                 desc: "Covers the institution itself for governance claims",  required: false, checked: true,  price: 1800 },
      { id: "sbl-c5", label: "Government Investigation Defense",desc: "Defense costs for regulatory investigations",          required: false, checked: false, price: 2200 },
      { id: "sbl-c6", label: "Crisis Event Coverage",           desc: "PR and communication costs after a governance event",  required: false, checked: false, price: 1400 },
    ],
    endorsements: [
      { id: "sbl-e1", label: "Bond Election Defense",   desc: "Defense for school bond election disputes",        premium: 1900, included: false },
      { id: "sbl-e2", label: "Outside Directorship",    desc: "Extends D&O to outside non-profit board service",  premium: 1700, included: false },
      { id: "sbl-e3", label: "Run-Off Coverage (3-yr)", desc: "Extended reporting period for departing trustees", premium: 4800, included: false },
      { id: "sbl-e4", label: "Crisis Communications",   desc: "Board-level crisis communication consulting fees", premium: 1600, included: false },
    ],
  },

  /* ════════ Professional Liability (PL) ════════ */
  {
    id: "ipl", label: "Internships and Professional Services Liability", abbr: "IPL",
    desc: "E&O for internship programs and student professional services",
    icon: <UserCheck size={16} />, category: "Professional Liability", categoryColor: CAT_PL,
    basePremium: 3800,
    coverageFields: [
      { label: "Each Claim Limit",       value: "$1,000,000",   type: "select", options: ["$500,000","$1,000,000","$2,000,000"] },
      { label: "Aggregate Limit",        value: "$2,000,000",   type: "select", options: ["$1,000,000","$2,000,000","$3,000,000"] },
      { label: "Retention (Deductible)", value: "$10,000",      type: "select", options: ["$5,000","$10,000","$25,000","$50,000"] },
      { label: "Retroactive Date",       value: "07/01/2020",   type: "date" },
      { label: "Defense Basis",          value: "Within Limit", type: "select", options: ["Within Limit","Outside Limit"] },
      { label: "Coverage Territory",     value: "USA & Canada", type: "select", options: ["USA Only","USA & Canada","Worldwide"] },
    ],
    coverageItems: [
      { id: "ipl-c1", label: "Internship Program E&O",        desc: "Negligence by interns in covered professional capacity",  required: true,  checked: true,  price: 0    },
      { id: "ipl-c2", label: "Student Clinic Liability",       desc: "Liability for student-operated clinical activities",      required: true,  checked: true,  price: 0    },
      { id: "ipl-c3", label: "Supervisory Negligence",         desc: "Negligent supervision of student professional work",      required: true,  checked: true,  price: 0    },
      { id: "ipl-c4", label: "Allied Health Programs",         desc: "Coverage for nursing/allied health student programs",     required: false, checked: true,  price: 1400 },
      { id: "ipl-c5", label: "Counseling / Therapy Services",  desc: "Coverage for student-run counseling services",            required: false, checked: false, price: 1100 },
      { id: "ipl-c6", label: "Legal Aid Clinics",              desc: "Coverage for student-run legal aid clinics",              required: false, checked: false, price: 1300 },
    ],
    endorsements: [
      { id: "ipl-e1", label: "Allied Health Enhancement",   desc: "Enhanced limits for nursing and allied health interns", premium: 1800, included: false },
      { id: "ipl-e2", label: "International Internships",   desc: "Extends coverage to international internship placements",premium: 2200, included: false },
      { id: "ipl-e3", label: "Counseling Services Ext.",    desc: "Extends to mental-health counseling services",          premium: 1400, included: false },
      { id: "ipl-e4", label: "Sexual Misconduct Defense",   desc: "Defense for sexual misconduct allegations",              premium: 2900, included: false },
    ],
  },

  /* ════════ Assumed Risk (AR) ════════ */
  {
    id: "rps", label: "Assumed Public School", abbr: "RPS",
    desc: "Reinsurance / assumed risk for public school members",
    icon: <Users size={16} />, category: "Assumed Risk", categoryColor: CAT_AR,
    basePremium: 14500,
    coverageFields: [
      { label: "Quota Share %",       value: "50%",            type: "select", options: ["25%","50%","75%","100%"] },
      { label: "Maximum Loss Limit",  value: "$5,000,000",     type: "select", options: ["$2,000,000","$5,000,000","$10,000,000"] },
      { label: "Treaty Inception",    value: "07/01/2026",     type: "date" },
      { label: "Pool Retention",      value: "$250,000",       type: "select", options: ["$100,000","$250,000","$500,000","$1,000,000"] },
      { label: "Ceding Commission",   value: "22%",            type: "select", options: ["18%","20%","22%","25%"] },
      { label: "Coverage Territory",  value: "USA Only",       type: "select", options: ["Statewide","USA Only","USA & Canada"] },
    ],
    coverageItems: [
      { id: "rps-c1", label: "General Liability Layer",   desc: "Assumed share of underlying GL losses",                   required: true,  checked: true,  price: 0    },
      { id: "rps-c2", label: "Auto Liability Layer",      desc: "Assumed share of underlying auto liability losses",       required: true,  checked: true,  price: 0    },
      { id: "rps-c3", label: "Educators Legal Layer",     desc: "Assumed share of underlying ELL losses",                  required: true,  checked: true,  price: 0    },
      { id: "rps-c4", label: "Property Layer",            desc: "Assumed share of property losses",                        required: false, checked: true,  price: 1800 },
      { id: "rps-c5", label: "Crime / Cyber Layer",       desc: "Assumed share of crime and cyber-related losses",         required: false, checked: false, price: 2200 },
      { id: "rps-c6", label: "Catastrophe Cap",           desc: "Annual aggregate catastrophe cap on assumed losses",      required: false, checked: false, price: 1600 },
    ],
    endorsements: [
      { id: "rps-e1", label: "Sexual Abuse Pool",     desc: "Carve-out SAM pool with separate retention",          premium: 6400, included: false },
      { id: "rps-e2", label: "Catastrophe Cover",     desc: "Per-event catastrophe limit for assumed risks",       premium: 4800, included: false },
      { id: "rps-e3", label: "Loss Corridor",         desc: "Quota share corridor between two retention levels",   premium: 2200, included: false },
      { id: "rps-e4", label: "Aggregate Reinstatement",desc: "One automatic reinstatement of the aggregate cap",   premium: 3400, included: false },
    ],
  },
  {
    id: "rph", label: "Assumed Higher Education", abbr: "RPH",
    desc: "Reinsurance / assumed risk for higher education members",
    icon: <Star size={16} />, category: "Assumed Risk", categoryColor: CAT_AR,
    basePremium: 12200,
    coverageFields: [
      { label: "Quota Share %",       value: "40%",            type: "select", options: ["25%","40%","50%","75%"] },
      { label: "Maximum Loss Limit",  value: "$5,000,000",     type: "select", options: ["$2,000,000","$5,000,000","$10,000,000"] },
      { label: "Treaty Inception",    value: "07/01/2026",     type: "date" },
      { label: "Pool Retention",      value: "$500,000",       type: "select", options: ["$250,000","$500,000","$1,000,000"] },
      { label: "Ceding Commission",   value: "20%",            type: "select", options: ["18%","20%","22%","25%"] },
      { label: "Coverage Territory",  value: "USA & Canada",   type: "select", options: ["USA Only","USA & Canada","Worldwide"] },
    ],
    coverageItems: [
      { id: "rph-c1", label: "General Liability Layer", desc: "Assumed share of underlying GL losses",                  required: true,  checked: true,  price: 0    },
      { id: "rph-c2", label: "Educators Legal Layer",   desc: "Assumed share of underlying ELL losses",                 required: true,  checked: true,  price: 0    },
      { id: "rph-c3", label: "Title IX Layer",          desc: "Assumed share of Title IX claim losses",                 required: true,  checked: true,  price: 0    },
      { id: "rph-c4", label: "Property Layer",          desc: "Assumed share of property losses",                       required: false, checked: true,  price: 1600 },
      { id: "rph-c5", label: "Cyber Layer",             desc: "Assumed share of cyber-related losses",                  required: false, checked: false, price: 2400 },
      { id: "rph-c6", label: "Athletics Layer",         desc: "Assumed share of athletics-related losses",              required: false, checked: false, price: 1800 },
    ],
    endorsements: [
      { id: "rph-e1", label: "Title IX Pool Carve-Out", desc: "Carve-out Title IX pool with separate retention",     premium: 4600, included: false },
      { id: "rph-e2", label: "Athletics Catastrophe",   desc: "Catastrophe cover for athletic-related losses",       premium: 3800, included: false },
      { id: "rph-e3", label: "International Programs",  desc: "Extends assumed risk to international programs",      premium: 1900, included: false },
      { id: "rph-e4", label: "Aggregate Reinstatement", desc: "One automatic reinstatement of the aggregate cap",    premium: 2900, included: false },
    ],
  },

  /* ════════ Excess Liability (EL) ════════ */
  {
    id: "xff", label: "Excess Following Form", abbr: "XFF",
    desc: "Excess liability tower following primary policy forms",
    icon: <Layers size={16} />, category: "Excess Liability", categoryColor: CAT_EL,
    basePremium: 6800,
    coverageFields: [
      { label: "Limit per Occurrence",   value: "$10,000,000",    type: "select", options: ["$5,000,000","$10,000,000","$25,000,000","$50,000,000"] },
      { label: "Aggregate Limit",        value: "$10,000,000",    type: "select", options: ["$10,000,000","$25,000,000","$50,000,000"] },
      { label: "Attachment Point",       value: "$5,000,000",     type: "select", options: ["$2,000,000","$5,000,000","$10,000,000"] },
      { label: "Underlying Tower",       value: "CGL + Auto",     type: "select", options: ["CGL Only","CGL + Auto","CGL + Auto + ELL"] },
      { label: "Form Basis",             value: "Following Form", type: "select", options: ["Following Form","Stand-Alone"] },
      { label: "Coverage Territory",     value: "USA & Canada",   type: "select", options: ["USA Only","USA & Canada","Worldwide"] },
    ],
    coverageItems: [
      { id: "xff-c1", label: "Following Form",          desc: "Follows the terms of the underlying tower",         required: true,  checked: true,  price: 0    },
      { id: "xff-c2", label: "Higher Limits",           desc: "Extends limits above the primary tower",            required: true,  checked: true,  price: 0    },
      { id: "xff-c3", label: "Drop-Down Coverage",      desc: "Drops down on exhaustion of underlying aggregate",  required: false, checked: true,  price: 2200 },
      { id: "xff-c4", label: "Defense Outside Limit",   desc: "Defense costs paid outside the limit of liability", required: false, checked: false, price: 1800 },
      { id: "xff-c5", label: "Aggregate Reinstatement", desc: "One automatic reinstatement of the aggregate",      required: false, checked: false, price: 3400 },
      { id: "xff-c6", label: "Maintenance Deductible",  desc: "SIR for direct piercing claims",                    required: false, checked: false, price: 1100 },
    ],
    endorsements: [
      { id: "xff-e1", label: "Punitive Damages",          desc: "Adds punitive damages where insurable by law",     premium: 4200, included: false },
      { id: "xff-e2", label: "Sexual Misconduct (Excess)",desc: "Excess SAM coverage following primary",            premium: 5800, included: false },
      { id: "xff-e3", label: "Stand-Alone Form",          desc: "Switches to stand-alone form for select perils",   premium: 4600, included: false },
      { id: "xff-e4", label: "Worldwide Territory",       desc: "Worldwide territory extension",                    premium: 1200, included: false },
    ],
  },
  {
    id: "xpg", label: "Excess Liability Following Form — Shared Aggregate", abbr: "XPG",
    desc: "Excess following form with a shared aggregate across covered lines",
    icon: <Layers size={16} />, category: "Excess Liability", categoryColor: CAT_EL,
    basePremium: 8200,
    coverageFields: [
      { label: "Limit per Occurrence",   value: "$10,000,000",    type: "select", options: ["$5,000,000","$10,000,000","$25,000,000"] },
      { label: "Shared Aggregate",       value: "$10,000,000",    type: "select", options: ["$10,000,000","$25,000,000","$50,000,000"] },
      { label: "Attachment Point",       value: "$5,000,000",     type: "select", options: ["$2,000,000","$5,000,000","$10,000,000"] },
      { label: "Covered Lines",          value: "CGL · Auto · ELL", type: "select", options: ["CGL · Auto","CGL · Auto · ELL","CGL · Auto · ELL · FDL"] },
      { label: "Form Basis",             value: "Following Form", type: "select", options: ["Following Form","Stand-Alone"] },
      { label: "Coverage Territory",     value: "USA & Canada",   type: "select", options: ["USA Only","USA & Canada","Worldwide"] },
    ],
    coverageItems: [
      { id: "xpg-c1", label: "Shared Aggregate Limit",     desc: "Single aggregate shared across all covered lines",         required: true,  checked: true,  price: 0    },
      { id: "xpg-c2", label: "Following Form (per line)",  desc: "Follows the terms of each underlying covered line",        required: true,  checked: true,  price: 0    },
      { id: "xpg-c3", label: "Higher Limits",              desc: "Extends limits above the covered primary tower",           required: true,  checked: true,  price: 0    },
      { id: "xpg-c4", label: "Drop-Down Coverage",         desc: "Drops down on exhaustion of any underlying aggregate",     required: false, checked: true,  price: 2600 },
      { id: "xpg-c5", label: "Aggregate Reinstatement",    desc: "One automatic reinstatement of the shared aggregate",      required: false, checked: false, price: 4100 },
      { id: "xpg-c6", label: "Cross-Line Defense",         desc: "Defense allocation logic across multiple covered lines",   required: false, checked: false, price: 1800 },
    ],
    endorsements: [
      { id: "xpg-e1", label: "Auto Tower Drop-Down",    desc: "Specific drop-down for the auto tower",            premium: 3400, included: false },
      { id: "xpg-e2", label: "Fiduciary Inclusion",     desc: "Adds fiduciary tower to the shared aggregate",     premium: 4900, included: false },
      { id: "xpg-e3", label: "Punitive Damages",        desc: "Adds punitive damages where insurable",            premium: 4400, included: false },
      { id: "xpg-e4", label: "Worldwide Territory",     desc: "Worldwide territory extension",                    premium: 1500, included: false },
    ],
  },
];

/* ─── Endorsements library catalog (per product) ──────────────────────���─── */
const ENDORSEMENTS_LIBRARY: Record<string, LibraryEndorsement[]> = {
  cgl: [
    { id: "cgl-lib1", label: "Athletic Participants",        desc: "Liability for student injuries during athletic events",          premium: 2600, fillIn: true, multiUse: true },
    { id: "cgl-lib2", label: "Playground Equipment",         desc: "Bodily injury from playground apparatus and surfacing",          premium: 1900, fillIn: true },
    { id: "cgl-lib3", label: "Cafeteria Food Service",       desc: "Foodborne illness and product liability for food service",       premium: 2200 },
    { id: "cgl-lib4", label: "After-School Programs",        desc: "Extends GL to chaperoned after-school clubs and activities",     premium: 1300, multiUse: true },
    { id: "cgl-lib5", label: "Drone Operations Coverage",    desc: "Liability for UAS / drone flights for instruction or filming",   premium: 1400, fillIn: true },
    { id: "cgl-lib6", label: "Premises Pollution Liability", desc: "First- and third-party pollution from school operations",         premium: 2900, fillIn: true },
  ],
  blx: [
    { id: "blx-lib1", label: "Auto Buffer Extension",   desc: "Extends buffer to commercial auto liability",         premium: 1800, fillIn: true },
    { id: "blx-lib2", label: "Worldwide Territory",     desc: "Worldwide territory endorsement",                      premium: 900  },
    { id: "blx-lib3", label: "Aggregate Reinstatement", desc: "One automatic reinstatement of the aggregate",        premium: 3100 },
    { id: "blx-lib4", label: "Maintenance Deductible",  desc: "SIR for direct piercing claims",                       premium: 900,  fillIn: true },
    { id: "blx-lib5", label: "Sublimit Pollution",      desc: "$1M sublimit for pollution events",                    premium: 1800 },
  ],
  glx: [
    { id: "glx-lib1", label: "Punitive Damages",            desc: "Adds punitive damages where insurable by law",       premium: 3800 },
    { id: "glx-lib2", label: "Stand-Alone Form",            desc: "Switches to stand-alone form for select perils",      premium: 4200 },
    { id: "glx-lib3", label: "Worldwide Territory",         desc: "Worldwide territory extension",                       premium: 1100 },
    { id: "glx-lib4", label: "Aggregate Reinstatement",     desc: "Automatic reinstatement of the aggregate",            premium: 3400 },
    { id: "glx-lib5", label: "Defense Outside Limit",       desc: "Defense costs paid outside the limit",                premium: 1800 },
  ],
  psl: [
    { id: "psl-lib1", label: "Bond Election Defense",        desc: "Defense for school bond election disputes",        premium: 1800 },
    { id: "psl-lib2", label: "Open Meeting Law Defense",     desc: "Defense for alleged open-meeting violations",       premium: 1500 },
    { id: "psl-lib3", label: "Title IX Coordinator Defense", desc: "Defense for Title IX coordinator decisions",        premium: 2000 },
    { id: "psl-lib4", label: "Sexual Abuse Defense",         desc: "Defense costs for sexual abuse allegations",        premium: 6800 },
    { id: "psl-lib5", label: "Athletic Injury Defense",      desc: "Defense for athletic participation injury claims",  premium: 1600 },
  ],
  ell: [
    { id: "ell-lib1",  label: "504 Plan Defense Enhancement",    desc: "Enhanced sublimit for Section 504 plan disputes",                     premium: 1400, fillIn: true },
    { id: "ell-lib2",  label: "Teacher Certification Defense",   desc: "Defense costs for teaching license revocation proceedings",           premium: 1600 },
    { id: "ell-lib3",  label: "Curriculum Liability Ext.",       desc: "Coverage for claims arising from curriculum design or content",        premium: 1300 },
    { id: "ell-lib4",  label: "International Programs",          desc: "Extends ELL to international student exchange programs",              premium: 2200, fillIn: true, multiUse: true },
    { id: "ell-lib5",  label: "Parent/Guardian Defense",         desc: "Defense for disputes brought by parents or guardians",                premium: 1100 },
    { id: "ell-lib6",  label: "IEP Implementation Defense",      desc: "Defense for IEP design and implementation disputes",                  premium: 1800, fillIn: true },
    { id: "ell-lib7",  label: "Counselor Liability Enhancement", desc: "Higher sublimit for school counselor and psychologist claims",        premium: 1500 },
    { id: "ell-lib8",  label: "Standardized Testing Disputes",   desc: "Defense for grading, scoring, and testing accommodation claims",      premium: 1200 },
    { id: "ell-lib9",  label: "Vocational Program Coverage",     desc: "Coverage for CTE, internship, and work-study program claims",         premium: 1400, multiUse: true },
    { id: "ell-lib10", label: "Title IX Coordinator Defense",    desc: "Defense for Title IX investigations and coordinator decisions",       premium: 2000, fillIn: true },
    { id: "ell-lib11", label: "Library/Media Specialist Defense",desc: "Defense for collection-development and content-access disputes",      premium: 800  },
    { id: "ell-lib12", label: "Restraint & Seclusion Defense",   desc: "Defense for restraint and seclusion-related student claims",          premium: 2400, fillIn: true },
  ],
  elx: [
    { id: "elx-lib1", label: "Stand-Alone Form",          desc: "Switches to stand-alone form",                    premium: 3400 },
    { id: "elx-lib2", label: "Aggregate Reinstatement",   desc: "One automatic reinstatement of the aggregate",     premium: 2900 },
    { id: "elx-lib3", label: "Title IX Excess",           desc: "Excess Title IX defense coverage",                 premium: 2800 },
    { id: "elx-lib4", label: "IDEA Defense Excess",       desc: "Excess limits for IDEA / 504 dispute defense",     premium: 1900 },
    { id: "elx-lib5", label: "Online Learning Extension", desc: "Excess for remote/online instruction claims",      premium: 1200 },
  ],
  fdl: [
    { id: "fdl-lib1", label: "Voluntary Compliance Loss",  desc: "Penalty payments under EBSA voluntary compliance programs", premium: 1600 },
    { id: "fdl-lib2", label: "HIPAA / HITECH Defense",     desc: "Enhanced defense for HIPAA privacy and security claims",    premium: 1900 },
    { id: "fdl-lib3", label: "Plan Asset Cyber Theft",     desc: "Coverage for cyber theft of participant plan assets",       premium: 2400 },
    { id: "fdl-lib4", label: "Retired Trustee Run-Off",    desc: "Run-off coverage for retired plan trustees",                premium: 1100 },
    { id: "fdl-lib5", label: "Settlor Function Expansion", desc: "Broadens settlor function defense",                         premium: 1300 },
  ],
  fdx: [
    { id: "fdx-lib1", label: "Run-Off Coverage (3-yr)",  desc: "Extended reporting period for departing fiduciaries", premium: 1800 },
    { id: "fdx-lib2", label: "HIPAA Excess",             desc: "Excess limits for HIPAA defense",                    premium: 1100 },
    { id: "fdx-lib3", label: "Cyber Plan Asset Theft",   desc: "Excess limits for cyber plan asset theft",           premium: 1400 },
    { id: "fdx-lib4", label: "Stand-Alone Form",         desc: "Switches to stand-alone form",                       premium: 1900 },
    { id: "fdx-lib5", label: "Drop-Down Enhancement",    desc: "Drops down on multiple covered triggers",            premium: 1500 },
  ],
  sbl: [
    { id: "sbl-lib1", label: "Bond Election Defense",   desc: "Defense for school bond election disputes",        premium: 1900 },
    { id: "sbl-lib2", label: "Outside Directorship",    desc: "Extends D&O to outside non-profit board service",  premium: 1700 },
    { id: "sbl-lib3", label: "Run-Off Coverage (3-yr)", desc: "Extended reporting period for departing trustees", premium: 4800 },
    { id: "sbl-lib4", label: "Crisis Communications",   desc: "Board-level crisis communication consulting fees", premium: 1600 },
    { id: "sbl-lib5", label: "Open Meeting Law Defense",desc: "Defense for alleged open-meeting law violations",  premium: 1500 },
    { id: "sbl-lib6", label: "Books & Records Defense", desc: "Defense for statutory books-and-records demands",  premium: 1500 },
  ],
  ipl: [
    { id: "ipl-lib1", label: "Allied Health Enhancement",  desc: "Enhanced limits for nursing and allied health interns",  premium: 1800 },
    { id: "ipl-lib2", label: "International Internships",  desc: "Extends coverage to international internship placements", premium: 2200 },
    { id: "ipl-lib3", label: "Counseling Services Ext.",   desc: "Extends to mental-health counseling services",           premium: 1400 },
    { id: "ipl-lib4", label: "Sexual Misconduct Defense",  desc: "Defense for sexual misconduct allegations",               premium: 2900 },
    { id: "ipl-lib5", label: "Telehealth Extension",       desc: "Extends to telehealth and remote consultation services", premium: 1300 },
  ],
  rps: [
    { id: "rps-lib1", label: "Sexual Abuse Pool",      desc: "Carve-out SAM pool with separate retention",        premium: 6400 },
    { id: "rps-lib2", label: "Catastrophe Cover",      desc: "Per-event catastrophe limit for assumed risks",     premium: 4800 },
    { id: "rps-lib3", label: "Loss Corridor",          desc: "Quota share corridor between two retention levels", premium: 2200 },
    { id: "rps-lib4", label: "Aggregate Reinstatement",desc: "One automatic reinstatement of the aggregate cap",  premium: 3400 },
    { id: "rps-lib5", label: "Cyber Layer Inclusion",  desc: "Adds cyber to the assumed risk treaty",             premium: 2700 },
  ],
  rph: [
    { id: "rph-lib1", label: "Title IX Pool Carve-Out",  desc: "Carve-out Title IX pool with separate retention",     premium: 4600 },
    { id: "rph-lib2", label: "Athletics Catastrophe",    desc: "Catastrophe cover for athletic-related losses",       premium: 3800 },
    { id: "rph-lib3", label: "International Programs",   desc: "Extends assumed risk to international programs",      premium: 1900 },
    { id: "rph-lib4", label: "Aggregate Reinstatement",  desc: "One automatic reinstatement of the aggregate cap",    premium: 2900 },
    { id: "rph-lib5", label: "Greek Life Carve-Out",     desc: "Carve-out pool for fraternity and sorority losses",   premium: 3300 },
  ],
  xff: [
    { id: "xff-lib1", label: "Punitive Damages",           desc: "Adds punitive damages where insurable by law",   premium: 4200 },
    { id: "xff-lib2", label: "Sexual Misconduct (Excess)", desc: "Excess SAM coverage following primary",          premium: 5800 },
    { id: "xff-lib3", label: "Stand-Alone Form",           desc: "Switches to stand-alone form for select perils", premium: 4600 },
    { id: "xff-lib4", label: "Worldwide Territory",        desc: "Worldwide territory extension",                  premium: 1200 },
    { id: "xff-lib5", label: "Drop-Down Coverage",         desc: "Drops down on exhaustion of underlying aggregate",premium: 2200 },
  ],
  xpg: [
    { id: "xpg-lib1", label: "Auto Tower Drop-Down",   desc: "Specific drop-down for the auto tower",                premium: 3400 },
    { id: "xpg-lib2", label: "Fiduciary Inclusion",    desc: "Adds fiduciary tower to the shared aggregate",         premium: 4900 },
    { id: "xpg-lib3", label: "Punitive Damages",       desc: "Adds punitive damages where insurable",                premium: 4400 },
    { id: "xpg-lib4", label: "Worldwide Territory",    desc: "Worldwide territory extension",                        premium: 1500 },
    { id: "xpg-lib5", label: "Aggregate Reinstatement",desc: "Automatic reinstatement of the shared aggregate",      premium: 4100 },
  ],
};

/* ─── Member benefits (shared across products) ────────────────────────────── */
const MEMBER_BENEFITS: { id: string; bundle: string; name: string; desc: string }[] = [
  { id: "proresponse-crisis-comms",      bundle: "ProResponse", name: "Crisis Communications",               desc: "On-call crisis communications consulting and statement drafting for school incidents" },
  { id: "proresponse-trauma-counseling", bundle: "ProResponse", name: "Trauma/Grief Counseling",             desc: "Onsite trauma and grief counseling services following a covered incident" },
  { id: "proresponse-threat-assessment", bundle: "ProResponse", name: "Threat Assessment Case Consultation", desc: "Expert case consultation on threat assessments involving students or staff" },
  { id: "proresponse-sexual-misconduct", bundle: "ProResponse", name: "Sexual Misconduct Investigation",     desc: "Independent investigator support for sexual misconduct allegations" },
];

/* ─── Notifications (forms attached to every product option) ──────────────── */
const NOTIFICATIONS: { id: string; code: string; desc: string }[] = [
  { id: "triads", code: "TRIADS", desc: "Terrorism Risk Insurance Act Disclosure Statement" },
  { id: "bids",   code: "BIDS",   desc: "Broker Information Disclosure Statement" },
  { id: "pmb",    code: "PMB",    desc: "ProResponse Member Benefits notification" },
];

/* ─── Default schedules (auto-attached to every product option) ──────────── */
const DEFAULT_SCHEDULES: LibrarySchedule[] = [
  { id: "sch-main",      label: "Main District Campus",    desc: "Primary K-12 campus, classrooms, administrative offices and core academic facilities", premium: 0, fillIn: true,                  sampleUrl: "#schedules/samples/sch-main" },
  { id: "sch-athletics", label: "Athletic Facilities",     desc: "Gymnasiums, stadiums, fields and locker rooms used for athletic programs and events",   premium: 0, fillIn: true, multiUse: true, sampleUrl: "#schedules/samples/sch-athletics" },
  { id: "sch-admin",     label: "Administration Building", desc: "District headquarters housing superintendent, business office and board meeting spaces", premium: 0, fillIn: true,                  sampleUrl: "#schedules/samples/sch-admin" },
  { id: "sch-transport", label: "Transportation Fleet",    desc: "School buses, district-owned vehicles and the transportation yard with maintenance bay", premium: 0, fillIn: true,                  sampleUrl: "#schedules/samples/sch-transport" },
];

/* ─── Schedules library catalog (shared across products) ─────────────────── */
const SCHEDULES_LIBRARY: LibrarySchedule[] = [
  { id: "sch-cafeteria",   label: "Food Service & Cafeterias",      desc: "Kitchen facilities, dining halls and central food preparation operations",            premium: 1200,                                sampleUrl: "#schedules/samples/sch-cafeteria"   },
  { id: "sch-maintenance", label: "Maintenance & Grounds",          desc: "Maintenance shops, groundskeeping equipment storage and custodial operations",         premium:  900,                                sampleUrl: "#schedules/samples/sch-maintenance" },
  { id: "sch-aux",         label: "Auxiliary / Off-Site Locations", desc: "Leased classrooms, alternative learning centers and other off-campus instructional sites", premium: 1800, fillIn: true, multiUse: true, sampleUrl: "#schedules/samples/sch-aux"         },
  { id: "sch-tech",        label: "Technology & Data Center",       desc: "District data center, server rooms and centralized IT infrastructure",                 premium: 2400, fillIn: true,                  sampleUrl: "#schedules/samples/sch-tech"        },
  { id: "sch-library",     label: "Library / Media Center",         desc: "Central and school-level library media centers and shared collections",                premium:  600,                                sampleUrl: "#schedules/samples/sch-library"     },
  { id: "sch-performing",  label: "Performing Arts Center",         desc: "Auditoriums, theaters and rehearsal spaces used for performances and assemblies",      premium: 1500, fillIn: true,                  sampleUrl: "#schedules/samples/sch-performing"  },
];

const CATEGORIES = [
  { id: "gl", label: "General Liability",     productIds: ["cgl","blx","glx","psl"],         color: CAT_GL },
  { id: "ml", label: "Management Liability",  productIds: ["ell","elx","fdl","fdx","sbl"],   color: CAT_ML },
  { id: "pl", label: "Professional Liability", productIds: ["ipl"],                           color: CAT_PL },
  { id: "ar", label: "Assumed Risk",          productIds: ["rps","rph"],                     color: CAT_AR },
  { id: "el", label: "Excess Liability",      productIds: ["xff","xpg"],                     color: CAT_EL },
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

/* ─── Coverage-field advisor: senior-UW micro-coaching when a coverage
 * field (limit / aggregate / retention / retro / defense / territory)
 * changes. Returns "" to suppress the companion message. */
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

  if (lbl.includes("each claim") || lbl.includes("each incident")) {
    const b = dollarsNum(before), a = dollarsNum(after);
    if (a > b) {
      return `**${line} · ${optionLabel}** — Each-claim limit raised from ${before} → **${after}**. Expect a ~${Math.round(((a - b) / b) * 22)}% premium increase on this line. At ${after} on a K-12 risk you're still inside standard authority; >$5M would trip the senior-UW referral.`;
    }
    return `**${line} · ${optionLabel}** — Each-claim limit lowered from ${before} → **${after}**. Member premium drops, but check the broker's competing tower for shadow limits. At ${after} you have ${a < 1_000_000 ? "below" : "at"} the typical K-12 ${line} benchmark.`;
  }

  if (lbl.includes("aggregate")) {
    const b = dollarsNum(before), a = dollarsNum(after);
    if (a > b) {
      return `**${line}** — Aggregate raised to **${after}**. Ratio to each-claim is now ${(a / Math.max(dollarsNum(after) * 0.5, 1)).toFixed(1)}×; common K-12 aggregates run 2–4× the each-claim limit.`;
    }
    return `**${line}** — Aggregate trimmed to **${after}**. Watch for clash risk: a single bad claim year on a $${(a / 1_000_000).toFixed(1)}M aggregate could blow through inside one policy period.`;
  }

  if (lbl.includes("retention") || lbl.includes("deductible")) {
    const b = dollarsNum(before), a = dollarsNum(after);
    if (a > b) {
      const pct = Math.min(12, Math.round(((a - b) / Math.max(b, 1)) * 6));
      return `**${line}** — Retention raised ${before} → **${after}**. Typically buys ~${pct}% premium relief on ${line} for a school of this size. Confirm the member's reserve fund can absorb a single ${after} hit before quoting.`;
    }
    return `**${line}** — Retention dropped ${before} → **${after}**. Member premium goes up; on a 6-yr loss ratio of 58% I'd usually push the other direction. Document why you're recommending the lower retention in the file.`;
  }

  if (lbl.includes("retroactive")) {
    return `**${line}** — Retroactive date set to **${after}**. Every year of retro coverage you pull back adds ~3–5% to claims-made premium on a ${line} risk. Confirm prior acts coverage isn't already sitting with the expiring carrier.`;
  }

  if (lbl.includes("defense")) {
    if (/outside/i.test(after)) {
      return `**${line}** — Defense moved to **Outside Limit**. Big member-side win on a ${line} line — defense costs no longer erode the indemnity bucket. UE typically charges +8–12% for outside-limit defense on K-12.`;
    }
    return `**${line}** — Defense set to **Within Limit**. Standard for K-12 ${line}; keeps premium tight but defense costs eat into the each-claim limit.`;
  }

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
    addedSchedules:    [],
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
      <div style={{ background: "white", border: `1px solid ${BD}`, width: "100%", maxWidth: wide ? 780 : 560, maxHeight: "90vh", overflowY: "auto", fontFamily: font, borderRadius: 10, boxShadow: "0 12px 32px rgba(0,0,0,0.18)" }}>
        {children}
      </div>
    </div>
  );
}

/* ─── Fill-in modal ──────────────────────────────────────────────────────
   Lightweight stand-in for the per-endorsement fill-in form. Each endorsement
   defines a small set of mock fields (limits, dates, named insureds) that the
   underwriter must populate. Saving flips the row's chip from "Fill-in" to
   "Filled" — see RatingTab's `filledDefaults` state. */
function FillInModal({
  pid, end, seq, alreadyFilled, onClose, onSave,
}: {
  pid: string; end: { id: string; label: string; multiUse?: boolean }; seq: number;
  alreadyFilled: boolean;
  onClose: () => void; onSave: () => void;
}) {
  // Per-endorsement field templates. Falls back to a generic two-field form.
  const FIELD_TEMPLATES: Record<string, { label: string; placeholder: string; type?: "date" | "text" | "number" }[]> = {
    "cgl-e1": [
      { label: "Coverage Trigger",     placeholder: "Occurrence / Claims-made", type: "text" },
      { label: "Per-Claim Sublimit",   placeholder: "$1,000,000",               type: "text" },
      { label: "Aggregate Sublimit",   placeholder: "$2,000,000",               type: "text" },
      { label: "Retroactive Date",     placeholder: "",                          type: "date" },
      { label: "Named Insured(s)",     placeholder: "Brookfield Day School",     type: "text" },
    ],
    "cgl-e2": [
      { label: "Event Name",           placeholder: "Annual Gala",              type: "text" },
      { label: "Event Date",           placeholder: "",                          type: "date" },
      { label: "Aggregate Limit",      placeholder: "$1,000,000",               type: "text" },
    ],
    "cgl-e3": [
      { label: "Volunteer Group(s)",   placeholder: "Booster Club, PTA",         type: "text" },
      { label: "Sublimit per Volunteer", placeholder: "$250,000",                type: "text" },
    ],
  };
  const fields = FIELD_TEMPLATES[end.id] ?? [
    { label: "Description",          placeholder: "Endorsement-specific details", type: "text" },
    { label: "Effective Date",       placeholder: "",                              type: "date" },
  ];

  const [values, setValues] = useState<string[]>(() => fields.map(() => ""));
  const canSave = values.some(v => v.trim().length > 0);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <Modal onClose={onClose}>
      <div style={{ height: 4, background: N }} />
      <div className="flex items-center justify-between px-6 py-4" style={{ background: N, borderBottom: `1px solid ${BDL}` }}>
        <div className="flex items-center gap-3 min-w-0">
          <div style={{ width: 32, height: 32, background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 6 }}>
            <Pencil size={15} color="white" />
          </div>
          <div className="min-w-0">
            <h2 style={{ fontSize: "0.92rem", fontWeight: 800, color: "white" }}>
              Fill in: {end.label}
              {end.multiUse && (
                <span style={{ marginLeft: 8, fontSize: "0.66rem", fontWeight: 800, color: "rgba(255,255,255,0.85)", background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.3)", padding: "1px 6px", borderRadius: 9999 }}>
                  #{String(seq).padStart(2, "0")}
                </span>
              )}
            </h2>
            <p style={{ fontSize: "0.66rem", color: "rgba(255,255,255,0.55)", marginTop: 1 }}>
              Complete the underwriter fields below and save to mark this endorsement as filled.
            </p>
          </div>
        </div>
        <button onClick={onClose}
          style={{ width: 28, height: 28, background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.20)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "white", borderRadius: 6 }}>
          <X size={14} />
        </button>
      </div>

      <div className="p-5 space-y-4">
        {alreadyFilled && (
          <div className="flex items-start gap-2 px-3 py-2"
            style={{ background: "#E8F5EC", border: "1px solid #93C8A0", borderRadius: 6 }}>
            <CheckCircle2 size={14} color="#1A5C30" style={{ flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: "0.74rem", color: "#1A5C30", fontWeight: 600 }}>
              This instance is already marked as filled. Re-saving will update the captured values.
            </p>
          </div>
        )}
        {fields.map((f, i) => (
          <div key={i}>
            <label style={{ display: "block", fontSize: "0.66rem", fontWeight: 800, color: TT, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5 }}>
              {f.label}
            </label>
            <input
              type={f.type ?? "text"}
              value={values[i]}
              onChange={e => setValues(prev => prev.map((v, idx) => idx === i ? e.target.value : v))}
              placeholder={f.placeholder}
              className="w-full px-3 py-2.5 outline-none"
              style={{ fontSize: "0.84rem", border: `1px solid ${BD}`, borderRadius: 6, color: TD, fontFamily: font, background: "white", boxSizing: "border-box" }}
              autoFocus={i === 0}
            />
          </div>
        ))}
      </div>

      <div className="flex items-center justify-end gap-2 px-6 py-4" style={{ borderTop: `1px solid ${BDL}`, background: TH }}>
        <button onClick={onClose}
          className="px-4 py-2 hover:brightness-97 transition-all"
          style={{ fontSize: "0.80rem", fontWeight: 600, color: TM, background: "white", border: `1px solid ${BD}`, borderRadius: 6, cursor: "pointer", fontFamily: font }}>
          Cancel
        </button>
        <button
          onClick={onSave}
          disabled={!canSave}
          className="flex items-center gap-1.5 px-4 py-2 transition-all hover:brightness-95 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: N, color: "white", fontSize: "0.80rem", fontWeight: 700, borderRadius: 6, border: "none", cursor: canSave ? "pointer" : "not-allowed", fontFamily: font }}>
          <Save size={13} /> Save & mark filled
        </button>
      </div>
    </Modal>
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

  /* ── Deep-link: read ?focus=pid::oid and focus that product + option ── */
  const [searchParams] = useSearchParams();
  useEffect(() => {
    const focus = searchParams.get("focus");
    if (!focus) return;
    const [pid, oid] = focus.split("::");
    if (!pid) return;
    if (!visibleProductIds.includes(pid)) return;
    setActive(pid);
    if (oid && (allOptions[pid] ?? []).some(o => o.id === oid)) {
      setActiveOptId(prev => ({ ...prev, [pid]: oid }));
    }
    // Scroll the editor anchor into view once the tab has had a tick to render.
    setTimeout(() => {
      document.getElementById("rating-option-editor")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);
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

  /* ── Editable default-endorsement premiums: keyed by "pid::eid" ── */
  const [defaultEndOverrides, setDefaultEndOverrides] = useState<Record<string, number>>({});

  /* ── Default-endorsement instances: how many copies of a multi-use endorsement
   *    are attached. Keyed by "pid::eid". Defaults to 1 instance when absent. */
  const [defaultEndInstances, setDefaultEndInstances] = useState<Record<string, number>>({});
  const getInstanceCount = (pid: string, eid: string): number =>
    defaultEndInstances[`${pid}::${eid}`] ?? 1;
  const addInstance = (pid: string, eid: string) =>
    setDefaultEndInstances(prev => ({ ...prev, [`${pid}::${eid}`]: (prev[`${pid}::${eid}`] ?? 1) + 1 }));
  const removeInstance = (pid: string, eid: string, seq: number) => {
    const key = `${pid}::${eid}`;
    const count = defaultEndInstances[key] ?? 1;
    if (count <= 1) return; // never drop below the seed instance
    setDefaultEndInstances(prev => ({ ...prev, [key]: count - 1 }));
    // Re-key filled flags above `seq` down by one so sequence numbers stay tight.
    setFilledDefaults(prev => {
      const next = new Set<string>();
      prev.forEach(k => {
        const [p, e, s] = k.split("::");
        if (p !== pid || e !== eid) { next.add(k); return; }
        const sNum = Number(s);
        if (sNum === seq) return;            // drop the removed one
        if (sNum > seq)  next.add(`${pid}::${eid}::${sNum - 1}`);
        else             next.add(k);
      });
      return next;
    });
  };

  /* ── Filled instances of default endorsements: keys "pid::eid::seq" ── */
  const [filledDefaults, setFilledDefaults] = useState<Set<string>>(new Set());
  const isFilled = (pid: string, eid: string, seq: number) =>
    filledDefaults.has(`${pid}::${eid}::${seq}`);
  const markFilled = (pid: string, eid: string, seq: number) =>
    setFilledDefaults(prev => new Set(prev).add(`${pid}::${eid}::${seq}`));

  /* ── Fill-in modal target (which instance is being edited) ── */
  const [fillInTarget, setFillInTarget] = useState<{ pid: string; end: Endorsement; seq: number } | null>(null);

  /* ── Member-benefit service selections (default: all included) ── */
  const [memberBenefitsExcluded, setMemberBenefitsExcluded] = useState<Set<string>>(new Set());
  const toggleMemberBenefit = (id: string) => {
    setMemberBenefitsExcluded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  /* ── Notification selections (default: all attached) ── */
  const [notificationsExcluded, setNotificationsExcluded] = useState<Set<string>>(new Set());
  const toggleNotification = (id: string) => {
    setNotificationsExcluded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const getDefaultEndPremium = (pid: string, end: Endorsement) => {
    const key = `${pid}::${end.id}`;
    return defaultEndOverrides[key] ?? 0;
  };

  const updateDefaultEndPremium = (pid: string, eid: string, value: number) => {
    const key = `${pid}::${eid}`;
    setDefaultEndOverrides(prev => ({ ...prev, [key]: value }));
  };

  /* ── Quote status ── */
  const [quoteStatus, setQuoteStatus] = useState<QuoteStatus>("draft");
  const [quoteNumber, setQuoteNumber] = useState<string | null>(null);

  /* ── Library modals ── */
  const [showProductsLibrary,      setShowProductsLibrary]      = useState(false);
  const [showEndorsementsLibrary,  setShowEndorsementsLibrary]  = useState(false);
  const [endorsementsLibraryQuery, setEndorsementsLibraryQuery] = useState("");
  const [showSchedulesLibrary,     setShowSchedulesLibrary]     = useState(false);
  const [schedulesLibraryQuery,    setSchedulesLibraryQuery]    = useState("");

  /* ── Per-(option × schedule) instance counts. Key: "pid::optId::sid". Defaults to 1. ── */
  const [scheduleInstances, setScheduleInstances] = useState<Record<string, number>>({});
  const scheduleInstanceKey = (pid: string, optId: string, sid: string) => `${pid}::${optId}::${sid}`;
  const getScheduleInstanceCount = (pid: string, optId: string, sid: string): number =>
    scheduleInstances[scheduleInstanceKey(pid, optId, sid)] ?? 1;
  const addScheduleInstance = (pid: string, optId: string, sid: string) =>
    setScheduleInstances(prev => {
      const k = scheduleInstanceKey(pid, optId, sid);
      return { ...prev, [k]: (prev[k] ?? 1) + 1 };
    });
  const removeScheduleInstance = (pid: string, optId: string, sid: string, seq: number) => {
    const k = scheduleInstanceKey(pid, optId, sid);
    const count = scheduleInstances[k] ?? 1;
    if (count <= 1) return;
    setScheduleInstances(prev => ({ ...prev, [k]: count - 1 }));
    setFilledScheduleInstances(prev => {
      const next = new Set<string>();
      prev.forEach(key => {
        const [p, o, s, q] = key.split("::");
        if (p !== pid || o !== optId || s !== sid) { next.add(key); return; }
        const sNum = Number(q);
        if (sNum === seq) return;
        if (sNum > seq) next.add(`${pid}::${optId}::${sid}::${sNum - 1}`);
        else next.add(key);
      });
      return next;
    });
  };

  /* ── Filled schedule instances: "pid::optId::sid::seq" ── */
  const [filledScheduleInstances, setFilledScheduleInstances] = useState<Set<string>>(new Set());
  const isScheduleFilled = (pid: string, optId: string, sid: string, seq: number) =>
    filledScheduleInstances.has(`${pid}::${optId}::${sid}::${seq}`);
  const markScheduleFilled = (pid: string, optId: string, sid: string, seq: number) =>
    setFilledScheduleInstances(prev => new Set(prev).add(`${pid}::${optId}::${sid}::${seq}`));

  /* ── Editable schedule premiums per (option × schedule). Falls back to library default. ── */
  const [schedulePremiumOverrides, setSchedulePremiumOverrides] = useState<Record<string, number>>({});
  const getSchedulePremium = (pid: string, optId: string, sid: string, fallback: number): number => {
    const k = scheduleInstanceKey(pid, optId, sid);
    return schedulePremiumOverrides[k] ?? fallback;
  };
  const updateSchedulePremium = (pid: string, optId: string, sid: string, value: number) => {
    const k = scheduleInstanceKey(pid, optId, sid);
    setSchedulePremiumOverrides(prev => ({ ...prev, [k]: Math.max(0, value) }));
  };
  const resetSchedulePremium = (pid: string, optId: string, sid: string) => {
    const k = scheduleInstanceKey(pid, optId, sid);
    setSchedulePremiumOverrides(prev => {
      const next = { ...prev };
      delete next[k];
      return next;
    });
  };

  /* ── Schedule fill-in target (which option × schedule × seq is being edited) ── */
  const [scheduleFillInTarget, setScheduleFillInTarget] =
    useState<{ pid: string; optId: string; sched: LibrarySchedule; seq: number } | null>(null);

  /* ── Per-(option × added endorsement) instance counts. Key: "pid::optId::eid". Defaults to 1. ── */
  const [addedEndInstances, setAddedEndInstances] = useState<Record<string, number>>({});
  const addedEndInstanceKey = (pid: string, optId: string, eid: string) => `${pid}::${optId}::${eid}`;
  const getAddedEndInstanceCount = (pid: string, optId: string, eid: string): number =>
    addedEndInstances[addedEndInstanceKey(pid, optId, eid)] ?? 1;
  const addAddedEndInstance = (pid: string, optId: string, eid: string) =>
    setAddedEndInstances(prev => {
      const k = addedEndInstanceKey(pid, optId, eid);
      return { ...prev, [k]: (prev[k] ?? 1) + 1 };
    });
  const removeAddedEndInstance = (pid: string, optId: string, eid: string, seq: number) => {
    const k = addedEndInstanceKey(pid, optId, eid);
    const count = addedEndInstances[k] ?? 1;
    if (count <= 1) return;
    setAddedEndInstances(prev => ({ ...prev, [k]: count - 1 }));
    setFilledAddedEnds(prev => {
      const next = new Set<string>();
      prev.forEach(key => {
        const [p, o, e, q] = key.split("::");
        if (p !== pid || o !== optId || e !== eid) { next.add(key); return; }
        const sNum = Number(q);
        if (sNum === seq) return;
        if (sNum > seq) next.add(`${pid}::${optId}::${eid}::${sNum - 1}`);
        else next.add(key);
      });
      return next;
    });
  };

  /* ── Filled added-endorsement instances: "pid::optId::eid::seq" ── */
  const [filledAddedEnds, setFilledAddedEnds] = useState<Set<string>>(new Set());
  const isAddedEndFilled = (pid: string, optId: string, eid: string, seq: number) =>
    filledAddedEnds.has(`${pid}::${optId}::${eid}::${seq}`);
  const markAddedEndFilled = (pid: string, optId: string, eid: string, seq: number) =>
    setFilledAddedEnds(prev => new Set(prev).add(`${pid}::${optId}::${eid}::${seq}`));

  /* ── Added-endorsement fill-in target (which option × endorsement × seq is being edited) ── */
  const [addedEndFillInTarget, setAddedEndFillInTarget] =
    useState<{ pid: string; optId: string; end: Endorsement; seq: number } | null>(null);

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

  /* ── Companion (chatbot) wiring ───────────────────────────────────────── */
  const { id: routeSubId } = useParams<{ id: string }>();
  const subIdForCompanion = routeSubId ?? "SUB-7829";
  const ratingRouteKey = `page:submission:${subIdForCompanion}:rating`;
  const { pushMsg } = useCompanion();

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
    if (product && fieldBefore && optBefore && fieldBefore.value !== value) {
      const advice = adviseCoverageField(product, optBefore.label, fieldBefore.label, fieldBefore.value, value);
      if (advice) {
        pushMsg(ratingRouteKey, {
          id: newId(), role: "agent", kind: "text", ts: now(), text: advice,
        });
      }
    }
  };

  /* Toggle a coverage item */
  const toggleItem = (pid: string, optId: string, itemId: string) => {
    setAllOptions(prev => ({
      ...prev,
      [pid]: (prev[pid] ?? []).map(o =>
        o.id !== optId ? o : {
          ...o,
          coverageItems: o.coverageItems.map(ci =>
            ci.id !== itemId || ci.required ? ci : { ...ci, checked: !ci.checked }
          ),
        }
      ),
    }));
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

  /* Update the premium amount of an added endorsement */
  const updateAddedEndPremium = (pid: string, optId: string, eid: string, value: number) => {
    setAllOptions(prev => ({
      ...prev,
      [pid]: (prev[pid] ?? []).map(o =>
        o.id !== optId ? o : {
          ...o,
          addedEndorsements: o.addedEndorsements.map(e => e.id !== eid ? e : { ...e, premium: Math.max(0, value) }),
        }
      ),
    }));
  };

  /* Look up the library default premium for an added endorsement (for reset/EDITED detection) */
  const getLibraryDefaultPremium = (pid: string, eid: string): number | null => {
    const lib = ENDORSEMENTS_LIBRARY[pid] ?? [];
    const match = lib.find(l => l.id === eid);
    return match ? match.premium : null;
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

  /* Add schedule from library to active option */
  const addScheduleFromLibrary = (pid: string, optId: string, libSched: LibrarySchedule) => {
    setAllOptions(prev => ({
      ...prev,
      [pid]: (prev[pid] ?? []).map(o => {
        if (o.id !== optId) return o;
        const existing = o.addedSchedules ?? [];
        if (existing.some(s => s.id === libSched.id)) return o;
        return { ...o, addedSchedules: [...existing, { ...libSched }] };
      }),
    }));
  };

  /* Remove an added schedule from the option */
  const removeAddedSchedule = (pid: string, optId: string, sid: string) => {
    setAllOptions(prev => ({
      ...prev,
      [pid]: (prev[pid] ?? []).map(o =>
        o.id !== optId ? o : {
          ...o,
          addedSchedules: (o.addedSchedules ?? []).filter(s => s.id !== sid),
        }
      ),
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
                          background: isActive ? `${cat.color}08` : isSel ? `${cat.color}03` : "white",
                        }}>
                        {/* Name + abbr + option count + premium range */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span style={{ fontSize: "0.80rem", fontWeight: 700, color: isActive ? cat.color : TD, lineHeight: 1.2 }}>{product.label}</span>
                            <span style={{ fontSize: "0.58rem", fontWeight: 700, color: cat.color, background: `${cat.color}12`, border: `1px solid ${cat.color}25`, padding: "1px 5px", letterSpacing: "0.05em", borderRadius: 9999 }}>{product.abbr}</span>
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
                                  background: `${cat.color}10`, padding: "1px 6px", borderRadius: 9999,
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
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 style={{ fontSize: "1.05rem", fontWeight: 800, color: TD }}>{product.label}</h2>
                        <span style={{ fontSize: "0.60rem", fontWeight: 800, color: "white", background: product.categoryColor, padding: "2px 7px", letterSpacing: "0.07em", borderRadius: 9999 }}>{product.abbr}</span>
                        <span style={{ fontSize: "0.60rem", fontWeight: 700, color: product.categoryColor, background: `${product.categoryColor}12`, border: `1px solid ${product.categoryColor}25`, padding: "2px 7px", borderRadius: 9999 }}>{product.category}</span>
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
                                      padding: "1px 6px", borderRadius: 9999,
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
                <div className="flex flex-nowrap items-center gap-0" style={{ borderBottom: `1px solid ${BD}`, background: "white" }}>
                  {/* Premium summary hoisted up in the sub-tab order so it
                      appears BEFORE Member Benefits + Notifications — gives
                      underwriters the priced view of the option before they
                      tweak the value-added attachments. */}
                  {(["policy", "endorsements", "schedules", "premium", "memberBenefits", "notifications"] as SubTab[]).map(tab => {
                    const isAct = currentSubTab === tab;
                    const labels: Record<SubTab, { icon: React.ReactNode; text: string; count?: number }> = {
                      policy:         { icon: <Shield size={13} />,      text: "Coverage",            count: selectedItemCount },
                      endorsements:   { icon: <Layers size={13} />,      text: "Endorsements",        count: product.endorsements.length + opt.addedEndorsements.filter(e => e.included).length },
                      premium:        { icon: <DollarSign size={13} />,  text: "Premium" },
                      schedules:      { icon: <Calendar size={13} />,    text: "Schedules",           count: DEFAULT_SCHEDULES.length + (opt.addedSchedules?.length ?? 0) },
                      memberBenefits: { icon: <Star size={13} />,        text: "Member Benefits",     count: MEMBER_BENEFITS.filter(b => !memberBenefitsExcluded.has(b.id)).length },
                      notifications:  { icon: <Bell size={13} />,        text: "Notifications",       count: NOTIFICATIONS.filter(n => !notificationsExcluded.has(n.id)).length },
                    };
                    const tl = labels[tab];
                    return (
                      <button key={tab}
                        onClick={() => setSubTabs(prev => ({ ...prev, [pid]: tab }))}
                        className="relative flex flex-1 items-center justify-center gap-1.5 px-2 py-3 transition-all whitespace-nowrap min-w-0"
                        style={{ fontSize: "0.74rem", fontWeight: isAct ? 700 : 400, color: isAct ? N : TM, background: "transparent", border: "none", outline: "none", borderRadius: 6 }}>
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
                                    style={{ border: `1px solid ${BD}`, borderRadius: 6, fontSize: "0.82rem", color: TD, background: "white", cursor: "pointer" }}>
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
                                  style={{ border: `1px solid ${BD}`, borderRadius: 6, fontSize: "0.82rem", color: TD, background: "white" }}
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
                        <div style={{ border: `1px solid ${BDL}`, background: "white", borderRadius: 8, overflow: "hidden" }}>
                          {opt.coverageItems.map((item, idx) => {
                            const isChecked = item.checked || item.required;
                            return (
                              <div key={item.id}
                                style={{
                                  borderBottom: idx < opt.coverageItems.length - 1 ? `1px solid ${BDL}` : "none",
                                  background: isChecked ? `${product.categoryColor}04` : "white",
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
                                        <span style={{ fontSize: "0.58rem", fontWeight: 800, color: TT, border: `1px solid ${BD}`, padding: "1px 6px", letterSpacing: "0.06em", flexShrink: 0, borderRadius: 9999 }}>DEFAULT</span>
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
                                         <select value={getItemLimits(opt.id, item.id).claimLimit} onChange={e => updateItemLimit(opt.id, item.id, "claimLimit", e.target.value)} className="appearance-none outline-none pr-6 pl-2 py-1 cursor-pointer" style={{ border: `1px solid ${BD}`, borderRadius: 5, fontSize: "0.74rem", color: TD, background: "white", minWidth: 110 }}>
                                           {CLAIM_LIMIT_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                                         </select>
                                         <ChevronDown size={10} color={TT} style={{ position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                                       </div>
                                     </div>
                                     <div className="flex items-center gap-2">
                                       <label style={{ fontSize: "0.60rem", fontWeight: 700, color: TT, textTransform: "uppercase", letterSpacing: "0.08em", whiteSpace: "nowrap" }}>Aggregate Limit</label>
                                       <div className="relative">
                                         <select value={getItemLimits(opt.id, item.id).aggregateLimit} onChange={e => updateItemLimit(opt.id, item.id, "aggregateLimit", e.target.value)} className="appearance-none outline-none pr-6 pl-2 py-1 cursor-pointer" style={{ border: `1px solid ${BD}`, borderRadius: 5, fontSize: "0.74rem", color: TD, background: "white", minWidth: 120 }}>
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

                      {/* Default endorsements (premium editable) */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <div style={{ fontSize: "0.62rem", fontWeight: 800, color: TT, textTransform: "uppercase", letterSpacing: "0.12em" }}>Default Endorsements</div>
                            <div style={{ fontSize: "0.70rem", color: TT, marginTop: 2 }}>Standard endorsements attached to this product</div>
                          </div>
                        </div>
                        <div style={{ border: `1px solid ${BDL}`, background: "white", borderRadius: 8, overflow: "hidden" }}>
                          {product.endorsements.map((end, idx) => {
                            const currentPremium = getDefaultEndPremium(pid, end);
                            const isOverridden   = currentPremium !== 0;
                            const count          = getInstanceCount(pid, end.id);
                            const seqs           = Array.from({ length: count }, (_, i) => i + 1);
                            return (
                              <div key={end.id}
                                style={{ borderBottom: idx < product.endorsements.length - 1 ? `1px solid ${BDL}` : "none" }}>
                                {seqs.map((seq, sIdx) => {
                                  const filled = isFilled(pid, end.id, seq);
                                  return (
                                    <div key={`${end.id}-${seq}`}
                                      className="flex items-start gap-3 px-4 py-2.5"
                                      style={{ borderTop: sIdx > 0 ? `1px dashed ${BDL}` : "none" }}>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                          {end.multiUse && (
                                            <span style={{
                                              fontSize: "0.58rem", fontWeight: 800, color: TM,
                                              background: TH, border: `1px solid ${BDL}`,
                                              padding: "1px 6px", borderRadius: 9999,
                                              fontVariantNumeric: "tabular-nums",
                                            }}>#{String(seq).padStart(2, "0")}</span>
                                          )}
                                          <a
                                            href="#"
                                            onClick={e => { e.preventDefault(); setFillInTarget({ pid, end, seq }); }}
                                            style={{ fontSize: "0.82rem", fontWeight: 600, color: N, textDecoration: "underline", textUnderlineOffset: 2, cursor: "pointer" }}>
                                            {end.label}
                                          </a>
                                          {sIdx === 0 && (
                                            <span style={{ fontSize: "0.58rem", fontWeight: 800, color: product.categoryColor, background: `${product.categoryColor}12`, border: `1px solid ${product.categoryColor}30`, padding: "1px 6px", letterSpacing: "0.06em", borderRadius: 9999 }}>DEFAULT</span>
                                          )}
                                          {end.fillIn && (
                                            filled ? (
                                              <span style={{ fontSize: "0.58rem", fontWeight: 800, color: "#1A5C30", background: "#E8F5EC", border: "1px solid #93C8A0", padding: "1px 6px", letterSpacing: "0.06em", borderRadius: 9999, textTransform: "uppercase" }}>Filled</span>
                                            ) : (
                                              <span style={{ fontSize: "0.58rem", fontWeight: 800, color: "#8A5C00", background: "#FFF8E6", border: "1px solid #F0D88A", padding: "1px 6px", letterSpacing: "0.06em", borderRadius: 9999, textTransform: "uppercase" }}>Fill-in</span>
                                            )
                                          )}
                                          {end.multiUse && sIdx === 0 && (
                                            <span style={{ fontSize: "0.58rem", fontWeight: 800, color: "#4A2D80", background: "#F0EEF8", border: "1px solid #C3B8E8", padding: "1px 6px", letterSpacing: "0.06em", borderRadius: 9999, textTransform: "uppercase" }}>Multi-use</span>
                                          )}
                                          {isOverridden && sIdx === 0 && (
                                            <span style={{ fontSize: "0.58rem", fontWeight: 700, color: G, background: `${G}15`, border: `1px solid ${G}50`, padding: "1px 6px", letterSpacing: "0.06em", borderRadius: 9999 }}>EDITED</span>
                                          )}
                                        </div>
                                        {sIdx === 0 && (
                                          <p style={{ fontSize: "0.72rem", color: TT, marginTop: 2, lineHeight: 1.35 }}>{end.desc}</p>
                                        )}
                                      </div>
                                      <div className="shrink-0 flex items-center gap-1.5" style={{ minWidth: 120 }}>
                                        {sIdx === 0 && (
                                          <>
                                            <span style={{ fontSize: "0.72rem", color: TT, fontWeight: 600 }}>$</span>
                                            <div style={{ position: "relative", display: "inline-block" }}>
                                              <input
                                                type="number"
                                                min={0}
                                                value={currentPremium}
                                                onChange={e => {
                                                  const v = e.target.value === "" ? 0 : Math.max(0, parseInt(e.target.value, 10) || 0);
                                                  updateDefaultEndPremium(pid, end.id, v);
                                                }}
                                                className="py-1 outline-none text-right"
                                                style={{
                                                  width: 90,
                                                  paddingLeft: 8,
                                                  paddingRight: isOverridden ? 24 : 8,
                                                  border: `1px solid ${isOverridden ? `${G}80` : BD}`,
                                                  background: isOverridden ? `${G}08` : "white",
                                                  borderRadius: 9999,
                                                  fontSize: "0.72rem",
                                                  color: TD,
                                                  fontWeight: 600,
                                                  fontFamily: font,
                                                }}
                                                title="Edit endorsement premium"
                                              />
                                              {isOverridden && (
                                                <button
                                                  onClick={() => updateDefaultEndPremium(pid, end.id, 0)}
                                                  className="hover:bg-slate-100 transition-colors flex items-center justify-center"
                                                  style={{ position: "absolute", right: 4, top: "50%", transform: "translateY(-50%)", width: 16, height: 16, padding: 0, border: "none", background: "none", cursor: "pointer", color: G, borderRadius: 3 }}
                                                  title={`Reset to default (${fmt(end.premium)})`}>
                                                  <RotateCcw size={10} strokeWidth={2.4} />
                                                </button>
                                              )}
                                            </div>
                                          </>
                                        )}
                                        {sIdx > 0 && (
                                          <button
                                            onClick={() => removeInstance(pid, end.id, seq)}
                                            className="p-1 hover:bg-red-50 transition-colors"
                                            style={{ border: "none", background: "none", cursor: "pointer", color: "#B91C1C", borderRadius: 6 }}
                                            title="Remove this instance">
                                            <X size={12} />
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                                {end.multiUse && (
                                  <div className="px-4 pb-2.5 pt-1">
                                    <button
                                      onClick={() => addInstance(pid, end.id)}
                                      className="inline-flex items-center gap-1 transition-all hover:underline"
                                      style={{ fontSize: "0.68rem", fontWeight: 700, color: N, background: "transparent", border: "none", cursor: "pointer", padding: "2px 0", fontFamily: font }}>
                                      <Plus size={11} /> Add another instance
                                    </button>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Added endorsements from library — aggregated across every
                          option of this product. */}
                      {(() => {
                        type Attachment = { opt: ProductOption; end: Endorsement };
                        const productOpts = allOptions[pid] ?? [];
                        const aggRows = new Map<string, { end: Endorsement; attachments: Attachment[] }>();
                        productOpts.forEach(po => {
                          po.addedEndorsements.forEach(e => {
                            const entry = aggRows.get(e.id) ?? { end: e, attachments: [] };
                            entry.attachments.push({ opt: po, end: e });
                            aggRows.set(e.id, entry);
                          });
                        });
                        const rowList = Array.from(aggRows.values());
                        if (rowList.length === 0) return null;
                        return (
                        <div>
                          <div style={{ fontSize: "0.62rem", fontWeight: 800, color: TT, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 12 }}>Added Endorsements</div>
                          <div style={{ border: `1px solid ${BDL}`, background: "white", borderRadius: 8, overflow: "hidden" }}>
                            {rowList.map((row, rIdx) => {
                              const end = row.end;
                              return (
                                <div key={end.id}
                                  style={{ borderBottom: rIdx < rowList.length - 1 ? `1px solid ${BDL}` : "none" }}>
                                  {row.attachments.map((att, aIdx) => {
                                    const optId        = att.opt.id;
                                    const attEnd       = att.end;
                                    const libDefault   = getLibraryDefaultPremium(pid, end.id);
                                    const isOverridden = libDefault !== null && attEnd.premium !== libDefault;
                                    const count        = getAddedEndInstanceCount(pid, optId, end.id);
                                    const seqs         = end.multiUse ? Array.from({ length: count }, (_, i) => i + 1) : [1];
                                    return (
                                      <div key={`${end.id}::${optId}`}
                                        style={{
                                          borderTop: aIdx > 0 ? `1px dashed ${BDL}` : "none",
                                          background: `${product.categoryColor}04`,
                                        }}>
                                        {seqs.map((seq, sIdx) => {
                                          const filled = isAddedEndFilled(pid, optId, end.id, seq);
                                          return (
                                            <div key={`${end.id}::${optId}::${seq}`}
                                              className="flex items-start gap-3 px-4 py-3"
                                              style={{ borderTop: sIdx > 0 ? `1px dashed ${BDL}` : "none" }}>
                                              <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                  {end.multiUse && (
                                                    <span style={{
                                                      fontSize: "0.58rem", fontWeight: 800, color: TM,
                                                      background: TH, border: `1px solid ${BDL}`,
                                                      padding: "1px 6px", borderRadius: 9999,
                                                      fontVariantNumeric: "tabular-nums",
                                                    }}>#{String(seq).padStart(2, "0")}</span>
                                                  )}
                                                  {end.fillIn ? (
                                                    <a
                                                      href="#"
                                                      onClick={e => { e.preventDefault(); setAddedEndFillInTarget({ pid, optId, end, seq }); }}
                                                      style={{ fontSize: "0.82rem", fontWeight: 700, color: N, textDecoration: "underline", textUnderlineOffset: 2, cursor: "pointer" }}>
                                                      {end.label}
                                                    </a>
                                                  ) : (
                                                    <span style={{ fontSize: "0.82rem", fontWeight: 700, color: TD }}>{end.label}</span>
                                                  )}
                                                  {end.fillIn && (
                                                    filled ? (
                                                      <span style={{ fontSize: "0.58rem", fontWeight: 800, color: "#1A5C30", background: "#E8F5EC", border: "1px solid #93C8A0", padding: "1px 6px", letterSpacing: "0.06em", borderRadius: 9999, textTransform: "uppercase" }}>Filled</span>
                                                    ) : (
                                                      <span style={{ fontSize: "0.58rem", fontWeight: 800, color: "#8A5C00", background: "#FFF8E6", border: "1px solid #F0D88A", padding: "1px 6px", letterSpacing: "0.06em", borderRadius: 9999, textTransform: "uppercase" }}>Fill-in</span>
                                                    )
                                                  )}
                                                  {end.multiUse && sIdx === 0 && (
                                                    <span style={{ fontSize: "0.58rem", fontWeight: 800, color: "#4A2D80", background: "#F0EEF8", border: "1px solid #C3B8E8", padding: "1px 6px", letterSpacing: "0.06em", borderRadius: 9999, textTransform: "uppercase" }}>Multi-use</span>
                                                  )}
                                                  {sIdx === 0 && isOverridden && (
                                                    <span style={{ fontSize: "0.58rem", fontWeight: 700, color: G, background: `${G}15`, border: `1px solid ${G}50`, padding: "1px 6px", letterSpacing: "0.06em", borderRadius: 9999 }}>EDITED</span>
                                                  )}
                                                </div>
                                                {sIdx === 0 && (
                                                  <p style={{ fontSize: "0.72rem", color: TT, marginTop: 2, lineHeight: 1.4 }}>{end.desc}</p>
                                                )}
                                                {sIdx === 0 && (
                                                  <div className="flex items-center gap-1.5 flex-wrap" style={{ marginTop: 6 }}>
                                                    <span style={{ fontSize: "0.60rem", fontWeight: 700, color: TT, textTransform: "uppercase", letterSpacing: "0.06em" }}>Attached to:</span>
                                                    <span style={{
                                                      fontSize: "0.62rem", fontWeight: 800, color: "white",
                                                      background: att.opt.color, padding: "1px 7px",
                                                      letterSpacing: "0.04em", borderRadius: 9999,
                                                    }}>{att.opt.label}</span>
                                                  </div>
                                                )}
                                              </div>
                                              <div className="shrink-0 flex items-center gap-1.5" style={{ minWidth: 140 }}>
                                                {sIdx === 0 && (
                                                  <>
                                                    <span style={{ fontSize: "0.72rem", color: product.categoryColor, fontWeight: 700 }}>$</span>
                                                    <div style={{ position: "relative", display: "inline-block" }}>
                                                      <input
                                                        type="number"
                                                        min={0}
                                                        value={attEnd.premium}
                                                        onChange={e => {
                                                          const v = e.target.value === "" ? 0 : Math.max(0, parseInt(e.target.value, 10) || 0);
                                                          updateAddedEndPremium(pid, optId, end.id, v);
                                                        }}
                                                        className="py-1 outline-none text-right"
                                                        style={{
                                                          width: 90,
                                                          paddingLeft: 8,
                                                          paddingRight: isOverridden ? 24 : 8,
                                                          border: `1px solid ${isOverridden ? `${G}80` : BD}`,
                                                          background: isOverridden ? `${G}08` : "white",
                                                          borderRadius: 9999,
                                                          fontSize: "0.74rem",
                                                          color: product.categoryColor,
                                                          fontWeight: 700,
                                                          fontFamily: font,
                                                        }}
                                                        title="Edit endorsement premium"
                                                      />
                                                      {isOverridden && libDefault !== null && (
                                                        <button
                                                          onClick={() => updateAddedEndPremium(pid, optId, end.id, libDefault)}
                                                          className="hover:bg-slate-100 transition-colors flex items-center justify-center"
                                                          style={{ position: "absolute", right: 4, top: "50%", transform: "translateY(-50%)", width: 16, height: 16, padding: 0, border: "none", background: "none", cursor: "pointer", color: G, borderRadius: 3 }}
                                                          title={`Reset to default (${fmt(libDefault)})`}>
                                                          <RotateCcw size={10} strokeWidth={2.4} />
                                                        </button>
                                                      )}
                                                    </div>
                                                  </>
                                                )}
                                                {sIdx === 0 && (
                                                  <button
                                                    onClick={() => removeAddedEndorsement(pid, optId, end.id)}
                                                    className="p-1 hover:bg-red-50 transition-colors"
                                                    style={{ border: "none", background: "none", cursor: "pointer", color: "#B91C1C", borderRadius: 6 }}
                                                    title={`Remove from ${att.opt.label}`}>
                                                    <X size={12} />
                                                  </button>
                                                )}
                                                {sIdx > 0 && (
                                                  <button
                                                    onClick={() => removeAddedEndInstance(pid, optId, end.id, seq)}
                                                    className="p-1 hover:bg-red-50 transition-colors"
                                                    style={{ border: "none", background: "none", cursor: "pointer", color: "#B91C1C", borderRadius: 6 }}
                                                    title="Remove this instance">
                                                    <X size={12} />
                                                  </button>
                                                )}
                                              </div>
                                            </div>
                                          );
                                        })}
                                        {end.multiUse && (
                                          <div className="px-4 pb-2.5 pt-1">
                                            <button
                                              onClick={() => addAddedEndInstance(pid, optId, end.id)}
                                              className="inline-flex items-center gap-1 transition-all hover:underline"
                                              style={{ fontSize: "0.68rem", fontWeight: 700, color: N, background: "transparent", border: "none", cursor: "pointer", padding: "2px 0", fontFamily: font }}>
                                              <Plus size={11} /> Add another instance on {att.opt.label}
                                            </button>
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              );
                            })}
                          </div>
                          {addedEndTotal > 0 && (
                            <div className="mt-3 flex items-center justify-between px-4 py-3" style={{ background: `${product.categoryColor}08`, border: `1px solid ${product.categoryColor}20`, borderRadius: 8 }}>
                              <span style={{ fontSize: "0.76rem", fontWeight: 700, color: TM }}>Added Endorsement Subtotal · {opt.label}</span>
                              <span style={{ fontSize: "0.88rem", fontWeight: 800, color: product.categoryColor }}>+{fmt(addedEndTotal)}</span>
                            </div>
                          )}
                        </div>
                        );
                      })()}

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
                  {currentSubTab === "schedules" && (() => {
                    /* Aggregate every schedule (defaults + added) across every option
                       of this product. Each row is one unique schedule with a list of
                       option attachments. */
                    type Attachment = { opt: ProductOption; isDefault: boolean };
                    const productOpts = allOptions[pid] ?? [];
                    const rows = new Map<string, { sched: LibrarySchedule; attachments: Attachment[] }>();
                    productOpts.forEach(po => {
                      DEFAULT_SCHEDULES.forEach(s => {
                        const entry = rows.get(s.id) ?? { sched: s, attachments: [] };
                        entry.attachments.push({ opt: po, isDefault: true });
                        rows.set(s.id, entry);
                      });
                      (po.addedSchedules ?? []).forEach(s => {
                        const entry = rows.get(s.id) ?? { sched: s, attachments: [] };
                        entry.attachments.push({ opt: po, isDefault: false });
                        rows.set(s.id, entry);
                      });
                    });
                    const orderedSchedIds = [
                      ...DEFAULT_SCHEDULES.map(s => s.id),
                      ...SCHEDULES_LIBRARY.map(s => s.id),
                    ];
                    const rowList = Array.from(rows.values()).sort((a, b) =>
                      orderedSchedIds.indexOf(a.sched.id) - orderedSchedIds.indexOf(b.sched.id),
                    );

                    /* Library availability for the active option only (matches the
                       per-option Add flow the modal drives). */
                    const alreadyOnActive       = new Set((opt.addedSchedules ?? []).map(s => s.id));
                    const librarySchedAvailable = SCHEDULES_LIBRARY.filter(s => !alreadyOnActive.has(s.id));

                    return (
                    <div className="space-y-5">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <div style={{ fontSize: "0.62rem", fontWeight: 800, color: TT, textTransform: "uppercase", letterSpacing: "0.12em" }}>Added Schedules</div>
                            <div style={{ fontSize: "0.70rem", color: TT, marginTop: 2 }}>Defaults and library schedules attached to any option of this product</div>
                          </div>
                        </div>
                        <div style={{ border: `1px solid ${BDL}`, background: "white", borderRadius: 8, overflow: "hidden" }}>
                          {rowList.map((row, rIdx) => {
                            const sched = row.sched;
                            return (
                              <div key={sched.id}
                                style={{ borderBottom: rIdx < rowList.length - 1 ? `1px solid ${BDL}` : "none" }}>
                                {row.attachments.map((att, aIdx) => {
                                  const optLabel = att.opt.label;
                                  const optId    = att.opt.id;
                                  const count    = getScheduleInstanceCount(pid, optId, sched.id);
                                  const seqs     = sched.multiUse ? Array.from({ length: count }, (_, i) => i + 1) : [1];
                                  const libDefault   = sched.premium;
                                  const currentPrem  = getSchedulePremium(pid, optId, sched.id, libDefault);
                                  const isOverridden = currentPrem !== libDefault;

                                  return (
                                    <div key={`${sched.id}::${optId}`}
                                      style={{
                                        borderTop: aIdx > 0 ? `1px dashed ${BDL}` : "none",
                                        background: att.isDefault ? "white" : `${product.categoryColor}04`,
                                      }}>
                                      {seqs.map((seq, sIdx) => {
                                        const filled = isScheduleFilled(pid, optId, sched.id, seq);
                                        return (
                                          <div key={`${sched.id}::${optId}::${seq}`}
                                            className="flex items-start gap-3 px-4 py-3"
                                            style={{ borderTop: sIdx > 0 ? `1px dashed ${BDL}` : "none" }}>
                                            <div className="flex-1 min-w-0">
                                              <div className="flex items-center gap-2 flex-wrap">
                                                {sched.multiUse && (
                                                  <span style={{
                                                    fontSize: "0.58rem", fontWeight: 800, color: TM,
                                                    background: TH, border: `1px solid ${BDL}`,
                                                    padding: "1px 6px", borderRadius: 9999,
                                                    fontVariantNumeric: "tabular-nums",
                                                  }}>#{String(seq).padStart(2, "0")}</span>
                                                )}
                                                {sched.fillIn ? (
                                                  <a
                                                    href="#"
                                                    onClick={e => { e.preventDefault(); setScheduleFillInTarget({ pid, optId, sched, seq }); }}
                                                    style={{ fontSize: "0.82rem", fontWeight: 700, color: N, textDecoration: "underline", textUnderlineOffset: 2, cursor: "pointer" }}>
                                                    {sched.label}
                                                  </a>
                                                ) : (
                                                  <span style={{ fontSize: "0.82rem", fontWeight: 700, color: TD }}>{sched.label}</span>
                                                )}
                                                {sIdx === 0 && att.isDefault && (
                                                  <span style={{ fontSize: "0.58rem", fontWeight: 800, color: product.categoryColor, background: `${product.categoryColor}12`, border: `1px solid ${product.categoryColor}30`, padding: "1px 6px", letterSpacing: "0.06em", borderRadius: 9999 }}>DEFAULT</span>
                                                )}
                                                {sched.fillIn && (
                                                  filled ? (
                                                    <span style={{ fontSize: "0.58rem", fontWeight: 800, color: "#1A5C30", background: "#E8F5EC", border: "1px solid #93C8A0", padding: "1px 6px", letterSpacing: "0.06em", borderRadius: 9999, textTransform: "uppercase" }}>Filled</span>
                                                  ) : (
                                                    <span style={{ fontSize: "0.58rem", fontWeight: 800, color: "#8A5C00", background: "#FFF8E6", border: "1px solid #F0D88A", padding: "1px 6px", letterSpacing: "0.06em", borderRadius: 9999, textTransform: "uppercase" }}>Fill-in</span>
                                                  )
                                                )}
                                                {sched.multiUse && sIdx === 0 && (
                                                  <span style={{ fontSize: "0.58rem", fontWeight: 800, color: "#4A2D80", background: "#F0EEF8", border: "1px solid #C3B8E8", padding: "1px 6px", letterSpacing: "0.06em", borderRadius: 9999, textTransform: "uppercase" }}>Multi-use</span>
                                                )}
                                                {sIdx === 0 && isOverridden && (
                                                  <span style={{ fontSize: "0.58rem", fontWeight: 700, color: G, background: `${G}15`, border: `1px solid ${G}50`, padding: "1px 6px", letterSpacing: "0.06em", borderRadius: 9999 }}>EDITED</span>
                                                )}
                                              </div>
                                              {sIdx === 0 && (
                                                <p style={{ fontSize: "0.72rem", color: TT, marginTop: 2, lineHeight: 1.4 }}>{sched.desc}</p>
                                              )}
                                              {sIdx === 0 && (
                                                <div className="flex items-center gap-1.5 flex-wrap" style={{ marginTop: 6 }}>
                                                  <span style={{ fontSize: "0.60rem", fontWeight: 700, color: TT, textTransform: "uppercase", letterSpacing: "0.06em" }}>Attached to:</span>
                                                  <span style={{
                                                    fontSize: "0.62rem", fontWeight: 800, color: "white",
                                                    background: att.opt.color, padding: "1px 7px",
                                                    letterSpacing: "0.04em", borderRadius: 9999,
                                                  }}>{optLabel}</span>
                                                </div>
                                              )}
                                            </div>
                                            <div className="shrink-0 flex items-center gap-1.5" style={{ minWidth: 130 }}>
                                              {sIdx === 0 && (
                                                <>
                                                  <span style={{ fontSize: "0.72rem", color: TT, fontWeight: 600 }}>$</span>
                                                  <div style={{ position: "relative", display: "inline-block" }}>
                                                    <input
                                                      type="number"
                                                      min={0}
                                                      value={currentPrem}
                                                      onChange={e => {
                                                        const v = e.target.value === "" ? 0 : Math.max(0, parseInt(e.target.value, 10) || 0);
                                                        updateSchedulePremium(pid, optId, sched.id, v);
                                                      }}
                                                      className="py-1 outline-none text-right"
                                                      style={{
                                                        width: 90,
                                                        paddingLeft: 8,
                                                        paddingRight: isOverridden ? 24 : 8,
                                                        border: `1px solid ${isOverridden ? `${G}80` : BD}`,
                                                        background: isOverridden ? `${G}08` : "white",
                                                        borderRadius: 9999,
                                                        fontSize: "0.74rem",
                                                        color: TD,
                                                        fontWeight: 600,
                                                        fontFamily: font,
                                                      }}
                                                      title="Edit schedule premium"
                                                    />
                                                    {isOverridden && (
                                                      <button
                                                        onClick={() => resetSchedulePremium(pid, optId, sched.id)}
                                                        className="hover:bg-slate-100 transition-colors flex items-center justify-center"
                                                        style={{ position: "absolute", right: 4, top: "50%", transform: "translateY(-50%)", width: 16, height: 16, padding: 0, border: "none", background: "none", cursor: "pointer", color: G, borderRadius: 3 }}
                                                        title={`Reset to default (${fmt(libDefault)})`}>
                                                        <RotateCcw size={10} strokeWidth={2.4} />
                                                      </button>
                                                    )}
                                                  </div>
                                                </>
                                              )}
                                              {sIdx === 0 && !att.isDefault && (
                                                <button
                                                  onClick={() => removeAddedSchedule(pid, optId, sched.id)}
                                                  className="p-1 hover:bg-red-50 transition-colors"
                                                  style={{ border: "none", background: "none", cursor: "pointer", color: "#B91C1C", borderRadius: 6 }}
                                                  title={`Remove from ${optLabel}`}>
                                                  <X size={12} />
                                                </button>
                                              )}
                                              {sIdx > 0 && (
                                                <button
                                                  onClick={() => removeScheduleInstance(pid, optId, sched.id, seq)}
                                                  className="p-1 hover:bg-red-50 transition-colors"
                                                  style={{ border: "none", background: "none", cursor: "pointer", color: "#B91C1C", borderRadius: 6 }}
                                                  title="Remove this instance">
                                                  <X size={12} />
                                                </button>
                                              )}
                                            </div>
                                          </div>
                                        );
                                      })}
                                      {sched.multiUse && (
                                        <div className="px-4 pb-2.5 pt-1">
                                          <button
                                            onClick={() => addScheduleInstance(pid, optId, sched.id)}
                                            className="inline-flex items-center gap-1 transition-all hover:underline"
                                            style={{ fontSize: "0.68rem", fontWeight: 700, color: N, background: "transparent", border: "none", cursor: "pointer", padding: "2px 0", fontFamily: font }}>
                                            <Plus size={11} /> Add another instance on {optLabel}
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <button
                        onClick={() => setShowSchedulesLibrary(true)}
                        disabled={librarySchedAvailable.length === 0}
                        className="w-full flex items-center justify-center gap-2 py-2.5 transition-all hover:brightness-95 disabled:opacity-50"
                        style={{ background: `${product.categoryColor}12`, border: `1.5px dashed ${product.categoryColor}50`, color: product.categoryColor, cursor: "pointer", fontSize: "0.76rem", fontWeight: 700, fontFamily: font, borderRadius: 6 }}>
                        <Library size={14} />
                        {librarySchedAvailable.length === 0
                          ? `All library schedules added to ${opt.label}`
                          : `Schedules Library · ${librarySchedAvailable.length} available for ${opt.label}`}
                      </button>
                    </div>
                    );
                  })()}

                  {/* ════ MEMBER BENEFITS ════ */}
                  {currentSubTab === "memberBenefits" && (
                    <div className="space-y-5">
                      {/* Account-level cascade banner — when the global
                          `Member Benefits` toggle in AccountOverviewHeader is
                          OFF, the whole list below is treated as inactive.
                          The banner anchors the cause back to the header so
                          underwriters don't think this product sub-form is
                          broken. */}
                      {workspace && !workspace.memberBenefitsChecked && (
                        <div
                          className="flex items-start gap-2 px-3 py-2"
                          style={{
                            background: "#FFFBEB", border: "1px solid #FDE68A",
                            borderRadius: 6,
                          }}
                        >
                          <AlertCircle size={13} color="#B45309" style={{ marginTop: 1 }} />
                          <div style={{ fontSize: "0.72rem", color: "#92400E", lineHeight: 1.4 }}>
                            <strong>Account-level Member Benefits are turned off.</strong> Toggle
                            the global switch in the Account Overview header to re-enable benefits
                            across every product on this submission.
                          </div>
                        </div>
                      )}

                      <div
                        style={{
                          opacity: workspace && !workspace.memberBenefitsChecked ? 0.55 : 1,
                          pointerEvents: workspace && !workspace.memberBenefitsChecked ? "none" : "auto",
                          transition: "opacity 0.18s",
                        }}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <div style={{ fontSize: "0.62rem", fontWeight: 800, color: TT, textTransform: "uppercase", letterSpacing: "0.12em" }}>Member Benefits</div>
                            <div style={{ fontSize: "0.70rem", color: TT, marginTop: 2 }}>Risk management and value-added services attached to this option</div>
                          </div>
                        </div>

                        <div style={{ border: `1px solid ${BDL}`, background: "white", borderRadius: 8, overflow: "hidden" }}>
                          {MEMBER_BENEFITS.map((svc, idx) => {
                            const selected = !memberBenefitsExcluded.has(svc.id);
                            return (
                              <div key={svc.id}
                                className="flex items-start gap-3 px-4 py-3 cursor-pointer transition-all"
                                style={{
                                  borderBottom: idx < MEMBER_BENEFITS.length - 1 ? `1px solid ${BDL}` : "none",
                                  background: selected ? `${product.categoryColor}04` : "white",
                                }}
                                onClick={() => toggleMemberBenefit(svc.id)}>
                                <div className="shrink-0 flex items-center justify-center mt-0.5"
                                  style={{ width: 16, height: 16, background: selected ? product.categoryColor : "white", border: `2px solid ${selected ? product.categoryColor : BD}`, borderRadius: 9999, transition: "all 0.12s" }}>
                                  {selected && <Check size={9} color="white" strokeWidth={3} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div style={{ fontSize: "0.82rem", fontWeight: selected ? 700 : 500, color: selected ? TD : TM }}>
                                    {svc.bundle} - {svc.name}
                                  </div>
                                  <p style={{ fontSize: "0.72rem", color: TT, marginTop: 2, lineHeight: 1.4 }}>{svc.desc}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ════ NOTIFICATIONS ════ */}
                  {currentSubTab === "notifications" && (
                    <div className="space-y-5">
                      {/* Same cascade banner pattern as Member Benefits — when
                          the global Notifications toggle is OFF, this product
                          sub-form is inactive and the banner explains why. */}
                      {workspace && !workspace.notificationsEnabled && (
                        <div
                          className="flex items-start gap-2 px-3 py-2"
                          style={{
                            background: "#FFFBEB", border: "1px solid #FDE68A",
                            borderRadius: 6,
                          }}
                        >
                          <AlertCircle size={13} color="#B45309" style={{ marginTop: 1 }} />
                          <div style={{ fontSize: "0.72rem", color: "#92400E", lineHeight: 1.4 }}>
                            <strong>Account-level Notifications are turned off.</strong> Toggle
                            the global switch in the Account Overview header to re-enable
                            notifications across every product on this submission.
                          </div>
                        </div>
                      )}

                      <div
                        style={{
                          opacity: workspace && !workspace.notificationsEnabled ? 0.55 : 1,
                          pointerEvents: workspace && !workspace.notificationsEnabled ? "none" : "auto",
                          transition: "opacity 0.18s",
                        }}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <div style={{ fontSize: "0.62rem", fontWeight: 800, color: TT, textTransform: "uppercase", letterSpacing: "0.12em" }}>Notifications</div>
                            <div style={{ fontSize: "0.70rem", color: TT, marginTop: 2 }}>Forms attached to this policy option</div>
                          </div>
                        </div>
                        <div style={{ border: `1px solid ${BDL}`, background: "white", borderRadius: 8, overflow: "hidden" }}>
                          {NOTIFICATIONS.map((n, idx) => {
                            const selected = !notificationsExcluded.has(n.id);
                            return (
                              <div key={n.id}
                                className="flex items-start gap-3 px-4 py-3 cursor-pointer transition-all"
                                style={{
                                  borderBottom: idx < NOTIFICATIONS.length - 1 ? `1px solid ${BDL}` : "none",
                                  background: selected ? `${product.categoryColor}04` : "white",
                                }}
                                onClick={() => toggleNotification(n.id)}>
                                <div className="shrink-0 flex items-center justify-center mt-0.5"
                                  style={{ width: 16, height: 16, background: selected ? product.categoryColor : "white", border: `2px solid ${selected ? product.categoryColor : BD}`, borderRadius: 9999, transition: "all 0.12s" }}>
                                  {selected && <Check size={9} color="white" strokeWidth={3} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div style={{ fontSize: "0.82rem", fontWeight: selected ? 700 : 500, color: selected ? TD : TM }}>{n.code}</div>
                                  <p style={{ fontSize: "0.72rem", color: TT, marginTop: 2, lineHeight: 1.4 }}>{n.desc}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ════ PREMIUM ════ */}
                  {currentSubTab === "premium" && (
                    <div className="space-y-5">
                      <div>
                        <div style={{ fontSize: "0.62rem", fontWeight: 800, color: TT, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 14 }}>Premium Breakdown — {opt.label}</div>
                        <div style={{ border: `1px solid ${BDL}`, background: "white", borderRadius: 8, overflow: "hidden" }}>
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
                          <div style={{ border: `1px solid ${BDL}`, background: "white", borderRadius: 8, overflow: "hidden" }}>
                            {opts.map((o, i) => {
                              const p = calcPremium(product, o);
                              const isAct = o.id === opt.id;
                              return (
                                <div key={o.id}
                                  className="flex items-center justify-between px-4 py-3 cursor-pointer"
                                  style={{ borderBottom: i < opts.length - 1 ? `1px solid ${BDL}` : "none", background: isAct ? `${o.color}08` : "white" }}
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

                      <div className="flex items-start gap-2 p-3" style={{ background: "#FFF8E6", border: "1px solid #F0D88A", borderRadius: 6 }}>
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

      {/* ════════════════════════════════════════════════════════════════
          FILL-IN MODAL — captures the underwriter's manual fields for a
          default endorsement instance. Saving flips its chip to "Filled".
      ════════════════════════════════════════════════════════════════ */}
      {fillInTarget && (
        <FillInModal
          pid={fillInTarget.pid}
          end={fillInTarget.end}
          seq={fillInTarget.seq}
          alreadyFilled={isFilled(fillInTarget.pid, fillInTarget.end.id, fillInTarget.seq)}
          onClose={() => setFillInTarget(null)}
          onSave={() => {
            markFilled(fillInTarget.pid, fillInTarget.end.id, fillInTarget.seq);
            setFillInTarget(null);
          }}
        />
      )}

      {/* Fill-in modal for an added-endorsement instance (option × endorsement × seq) */}
      {addedEndFillInTarget && (
        <FillInModal
          pid={addedEndFillInTarget.pid}
          end={addedEndFillInTarget.end}
          seq={addedEndFillInTarget.seq}
          alreadyFilled={isAddedEndFilled(addedEndFillInTarget.pid, addedEndFillInTarget.optId, addedEndFillInTarget.end.id, addedEndFillInTarget.seq)}
          onClose={() => setAddedEndFillInTarget(null)}
          onSave={() => {
            markAddedEndFilled(addedEndFillInTarget.pid, addedEndFillInTarget.optId, addedEndFillInTarget.end.id, addedEndFillInTarget.seq);
            setAddedEndFillInTarget(null);
          }}
        />
      )}

      {/* Fill-in modal for a scheduled instance (option × schedule × seq) */}
      {scheduleFillInTarget && (
        <FillInModal
          pid={scheduleFillInTarget.pid}
          end={scheduleFillInTarget.sched}
          seq={scheduleFillInTarget.seq}
          alreadyFilled={isScheduleFilled(scheduleFillInTarget.pid, scheduleFillInTarget.optId, scheduleFillInTarget.sched.id, scheduleFillInTarget.seq)}
          onClose={() => setScheduleFillInTarget(null)}
          onSave={() => {
            markScheduleFilled(scheduleFillInTarget.pid, scheduleFillInTarget.optId, scheduleFillInTarget.sched.id, scheduleFillInTarget.seq);
            setScheduleFillInTarget(null);
          }}
        />
      )}

      {/* ════════════════════════════════════════════════════════════════
          PRODUCTS LIBRARY MODAL
      ════════════════════════════════════════════════════════════════ */}
      {showProductsLibrary && (
        <Modal onClose={() => setShowProductsLibrary(false)} wide>
          {/* Header */}
          <div style={{ height: 4, background: N }} />
          <div className="flex items-center justify-between px-6 py-4" style={{ background: N, borderBottom: `1px solid ${BDL}` }}>
            <div className="flex items-center gap-3">
              <div style={{ width: 32, height: 32, background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 6 }}>
                <Library size={16} color="white" />
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
                    style={{ background: `${N}10`, border: `1px solid ${N}25`, fontSize: "0.66rem", fontWeight: 700, color: N, borderRadius: 4 }}>
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
                      <div style={{ fontSize: "0.60rem", fontWeight: 800, color: N, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 8 }}>{cat.label}</div>
                      <div className="grid grid-cols-1 gap-2">
                        {catProds.map(prod => (
                          <div key={prod.id}
                            className="flex items-start gap-4 p-4"
                            style={{ border: `1px solid ${BDL}`, background: "white", borderRadius: 8 }}>
                            <div className="flex items-center justify-center shrink-0"
                              style={{ width: 40, height: 40, background: `${N}10`, border: `1px solid ${N}20`, color: N, borderRadius: 6 }}>
                              {prod.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span style={{ fontSize: "0.84rem", fontWeight: 700, color: TD }}>{prod.label}</span>
                                <span style={{ fontSize: "0.60rem", fontWeight: 800, color: N, background: `${N}12`, border: `1px solid ${N}25`, padding: "1px 6px", borderRadius: 9999 }}>{prod.abbr}</span>
                              </div>
                              <p style={{ fontSize: "0.73rem", color: TT, lineHeight: 1.4 }}>{prod.desc}</p>
                              <p style={{ fontSize: "0.68rem", color: TM, fontWeight: 600, marginTop: 4 }}>Base: {fmt(prod.basePremium)}</p>
                            </div>
                            <button
                              onClick={() => {
                                setVisibleProductIds(prev => [...prev, prod.id]);
                              }}
                              className="flex items-center gap-1.5 px-4 py-2 transition-all hover:brightness-95 shrink-0"
                              style={{ background: N, color: "white", border: "none", cursor: "pointer", fontSize: "0.74rem", fontWeight: 700, fontFamily: font, borderRadius: 6 }}>
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
        // Dual-search: test the query against both the endorsement id
        // (e.g. "ell-lib4") AND the human-readable name/label, plus the
        // existing description for free-text discoverability. Underwriters
        // who remember the code can paste it; underwriters who only know
        // the name still find the form.
        const q = endorsementsLibraryQuery.trim().toLowerCase();
        const visible = q
          ? available.filter(e =>
              e.id.toLowerCase().includes(q) ||
              e.label.toLowerCase().includes(q) ||
              e.desc.toLowerCase().includes(q)
            )
          : available;
        const closeLibrary = () => { setShowEndorsementsLibrary(false); setEndorsementsLibraryQuery(""); };

        return (
          <Modal onClose={closeLibrary}>
            {/* Sticky top: gradient + header + search */}
            <div style={{ position: "sticky", top: 0, zIndex: 20, background: "white" }}>
              <div style={{ height: 4, background: `linear-gradient(90deg,${product.categoryColor},${product.categoryColor}AA)` }} />
              <div className="flex items-center justify-between px-6 py-4" style={{ background: product.categoryColor, borderBottom: `1px solid ${BDL}` }}>
                <div className="flex items-center gap-3">
                  <div style={{ width: 32, height: 32, background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 6 }}>
                    <Library size={16} color="white" />
                  </div>
                  <div>
                    <h2 style={{ fontSize: "0.92rem", fontWeight: 800, color: "white" }}>Endorsements Library</h2>
                    <p style={{ fontSize: "0.66rem", color: "rgba(255,255,255,0.55)", marginTop: 1 }}>
                      {product.label} · {available.length} endorsement{available.length !== 1 ? "s" : ""} available to add
                    </p>
                  </div>
                </div>
                <button onClick={closeLibrary}
                  style={{ width: 28, height: 28, background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "white", borderRadius: 6 }}>
                  <X size={14} />
                </button>
              </div>
              {available.length > 0 && (
                <div className="px-5 py-3" style={{ borderBottom: `1px solid ${BDL}`, background: "white" }}>
                  <div className="relative">
                    <Search size={13} color={TT} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                    <input
                      autoFocus
                      type="text"
                      placeholder="Search endorsements by ID, name, or description…"
                      value={endorsementsLibraryQuery}
                      onChange={e => setEndorsementsLibraryQuery(e.target.value)}
                      className="w-full pl-9 pr-9 py-2 outline-none"
                      style={{ border: `1px solid ${BD}`, borderRadius: 8, background: "white", fontSize: "0.78rem", color: TD, fontFamily: font }}
                    />
                    {endorsementsLibraryQuery && (
                      <button
                        onClick={() => setEndorsementsLibraryQuery("")}
                        className="hover:bg-slate-100 transition-colors flex items-center justify-center"
                        style={{ position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)", width: 22, height: 22, padding: 0, border: "none", background: "none", cursor: "pointer", color: TT, borderRadius: 4 }}
                        title="Clear search">
                        <X size={12} />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Scrollable list */}
            <div className="p-5 space-y-2">
              {available.length === 0 ? (
                <div className="flex flex-col items-center py-10 gap-3" style={{ color: TT }}>
                  <CheckCircle2 size={32} color="#2E7D32" />
                  <p style={{ fontSize: "0.88rem", fontWeight: 700, color: TM }}>All available endorsements have been added</p>
                </div>
              ) : visible.length === 0 ? (
                <div className="flex flex-col items-center py-10 gap-3" style={{ color: TT }}>
                  <Search size={28} color={BD} />
                  <p style={{ fontSize: "0.84rem", fontWeight: 700, color: TM }}>No endorsements match “{endorsementsLibraryQuery}”</p>
                </div>
              ) : visible.map(libEnd => {
                const isAdded   = alreadyAddedIds.has(libEnd.id);
                const sampleUrl = libEnd.sampleUrl ?? `#endorsements/samples/${libEnd.id}`;
                return (
                  <div key={libEnd.id}
                    className="flex items-center gap-4 px-4 py-3"
                    style={{ border: `1px solid ${isAdded ? product.categoryColor + "40" : BDL}`, background: isAdded ? `${product.categoryColor}04` : "white", borderRadius: 8 }}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span style={{ fontSize: "0.84rem", fontWeight: 700, color: TD }}>{libEnd.label}</span>
                        {libEnd.fillIn && (
                          <span style={{ fontSize: "0.58rem", fontWeight: 800, color: "#8A5C00", background: "#FFF8E6", border: "1px solid #F0D88A", padding: "1px 6px", letterSpacing: "0.06em", borderRadius: 9999, textTransform: "uppercase" }}>Fill-in</span>
                        )}
                        {libEnd.multiUse && (
                          <span style={{ fontSize: "0.58rem", fontWeight: 800, color: "#4A2D80", background: "#F0EEF8", border: "1px solid #C3B8E8", padding: "1px 6px", letterSpacing: "0.06em", borderRadius: 9999, textTransform: "uppercase" }}>Multi-use</span>
                        )}
                        {libEnd.premium > 0 && (
                          <span style={{ fontSize: "0.58rem", fontWeight: 800, color: product.categoryColor, background: `${product.categoryColor}12`, border: `1px solid ${product.categoryColor}40`, padding: "1px 6px", letterSpacing: "0.06em", borderRadius: 9999, textTransform: "uppercase" }}>Premium</span>
                        )}
                      </div>
                      <p style={{ fontSize: "0.73rem", color: TT, lineHeight: 1.4, marginTop: 2 }}>{libEnd.desc}</p>
                      <div className="flex items-center gap-3 flex-wrap" style={{ marginTop: 6 }}>
                        <a
                          href={sampleUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 hover:underline"
                          style={{ fontSize: "0.68rem", fontWeight: 700, color: N, textDecoration: "none" }}
                          title="Open the developer / static sample copy of this endorsement">
                          <ExternalLink size={11} /> View sample
                        </a>
                      </div>
                    </div>
                    <button
                      onClick={() => addEndorsementFromLibrary(pid, opt.id, libEnd)}
                      disabled={isAdded}
                      className="flex items-center gap-1.5 px-4 py-2 transition-all hover:brightness-95 disabled:opacity-60 shrink-0"
                      style={{ background: isAdded ? `${product.categoryColor}20` : product.categoryColor, color: isAdded ? product.categoryColor : "white", border: isAdded ? `1px solid ${product.categoryColor}40` : "none", cursor: isAdded ? "default" : "pointer", fontSize: "0.74rem", fontWeight: 700, fontFamily: font, borderRadius: 6 }}>
                      {isAdded ? <><Check size={12} /> Added</> : <><Plus size={12} /> Add</>}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Sticky bottom: Done */}
            <div className="px-6 py-4 flex justify-end" style={{ position: "sticky", bottom: 0, zIndex: 20, borderTop: `1px solid ${BDL}`, background: TH }}>
              <button onClick={closeLibrary}
                style={{ padding: "8px 20px", background: product.categoryColor, color: "white", border: "none", cursor: "pointer", fontSize: "0.78rem", fontWeight: 700, fontFamily: font, borderRadius: 6 }}>
                Done
              </button>
            </div>
          </Modal>
        );
      })()}

      {/* ════════════════════════════════════════════════════════════════
          SCHEDULES LIBRARY MODAL
      ════════════════════════════════════════════════════════════════ */}
      {showSchedulesLibrary && activeProduct && currentOpt && (() => {
        const product   = activeProduct;
        const pid       = product.id;
        const opt       = currentOpt;
        const added     = opt.addedSchedules ?? [];
        const addedIds  = new Set(added.map(s => s.id));
        const available = SCHEDULES_LIBRARY.filter(s => !addedIds.has(s.id));
        const q = schedulesLibraryQuery.trim().toLowerCase();
        const visible = q
          ? available.filter(s => s.label.toLowerCase().includes(q) || s.desc.toLowerCase().includes(q))
          : available;
        const closeLibrary = () => { setShowSchedulesLibrary(false); setSchedulesLibraryQuery(""); };

        return (
          <Modal onClose={closeLibrary}>
            {/* Sticky top: gradient + header + search */}
            <div style={{ position: "sticky", top: 0, zIndex: 20, background: "white" }}>
              <div style={{ height: 4, background: `linear-gradient(90deg,${product.categoryColor},${product.categoryColor}AA)` }} />
              <div className="flex items-center justify-between px-6 py-4" style={{ background: product.categoryColor, borderBottom: `1px solid ${BDL}` }}>
                <div className="flex items-center gap-3">
                  <div style={{ width: 32, height: 32, background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 6 }}>
                    <Calendar size={16} color="white" />
                  </div>
                  <div>
                    <h2 style={{ fontSize: "0.92rem", fontWeight: 800, color: "white" }}>Schedules Library</h2>
                    <p style={{ fontSize: "0.66rem", color: "rgba(255,255,255,0.55)", marginTop: 1 }}>
                      {product.label} · {available.length} schedule{available.length !== 1 ? "s" : ""} available to add
                    </p>
                  </div>
                </div>
                <button onClick={closeLibrary}
                  style={{ width: 28, height: 28, background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "white", borderRadius: 6 }}>
                  <X size={14} />
                </button>
              </div>
              {available.length > 0 && (
                <div className="px-5 py-3" style={{ borderBottom: `1px solid ${BDL}`, background: "white" }}>
                  <div className="relative">
                    <Search size={13} color={TT} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                    <input
                      autoFocus
                      type="text"
                      placeholder="Search schedules by name or description…"
                      value={schedulesLibraryQuery}
                      onChange={e => setSchedulesLibraryQuery(e.target.value)}
                      className="w-full pl-9 pr-9 py-2 outline-none"
                      style={{ border: `1px solid ${BD}`, borderRadius: 8, background: "white", fontSize: "0.78rem", color: TD, fontFamily: font }}
                    />
                    {schedulesLibraryQuery && (
                      <button
                        onClick={() => setSchedulesLibraryQuery("")}
                        className="hover:bg-slate-100 transition-colors flex items-center justify-center"
                        style={{ position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)", width: 22, height: 22, padding: 0, border: "none", background: "none", cursor: "pointer", color: TT, borderRadius: 4 }}
                        title="Clear search">
                        <X size={12} />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Scrollable list */}
            <div className="p-5 space-y-2">
              {available.length === 0 ? (
                <div className="flex flex-col items-center py-10 gap-3" style={{ color: TT }}>
                  <CheckCircle2 size={32} color="#2E7D32" />
                  <p style={{ fontSize: "0.88rem", fontWeight: 700, color: TM }}>All available schedules have been added</p>
                </div>
              ) : visible.length === 0 ? (
                <div className="flex flex-col items-center py-10 gap-3" style={{ color: TT }}>
                  <Search size={28} color={BD} />
                  <p style={{ fontSize: "0.84rem", fontWeight: 700, color: TM }}>No schedules match “{schedulesLibraryQuery}”</p>
                </div>
              ) : visible.map(libSched => {
                const isAdded = addedIds.has(libSched.id);
                return (
                  <div key={libSched.id}
                    className="flex items-center gap-4 px-4 py-3"
                    style={{ border: `1px solid ${isAdded ? product.categoryColor + "40" : BDL}`, background: isAdded ? `${product.categoryColor}04` : "white", borderRadius: 8 }}>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span style={{ fontSize: "0.84rem", fontWeight: 700, color: TD }}>{libSched.label}</span>
                        {libSched.fillIn && (
                          <span style={{ fontSize: "0.58rem", fontWeight: 800, color: "#8A5C00", background: "#FFF8E6", border: "1px solid #F0D88A", padding: "1px 6px", letterSpacing: "0.06em", borderRadius: 9999, textTransform: "uppercase" }}>Fill-in</span>
                        )}
                        {libSched.multiUse && (
                          <span style={{ fontSize: "0.58rem", fontWeight: 800, color: "#4A2D80", background: "#F0EEF8", border: "1px solid #C3B8E8", padding: "1px 6px", letterSpacing: "0.06em", borderRadius: 9999, textTransform: "uppercase" }}>Multi-use</span>
                        )}
                      </div>
                      <p style={{ fontSize: "0.73rem", color: TT, lineHeight: 1.4, marginTop: 2 }}>{libSched.desc}</p>
                      <div className="flex items-center gap-3 flex-wrap" style={{ marginTop: 6 }}>
                        <span style={{ fontSize: "0.72rem", color: TM, fontWeight: 700 }}>{fmt(libSched.premium)}</span>
                        {libSched.sampleUrl && (
                          <a
                            href={libSched.sampleUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 hover:underline"
                            style={{ fontSize: "0.68rem", fontWeight: 700, color: N, textDecoration: "none" }}
                            title="Open the developer / static sample copy of this schedule">
                            <ExternalLink size={11} /> View sample
                          </a>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => addScheduleFromLibrary(pid, opt.id, libSched)}
                      disabled={isAdded}
                      className="flex items-center gap-1.5 px-4 py-2 transition-all hover:brightness-95 disabled:opacity-60 shrink-0"
                      style={{ background: isAdded ? `${product.categoryColor}20` : product.categoryColor, color: isAdded ? product.categoryColor : "white", border: isAdded ? `1px solid ${product.categoryColor}40` : "none", cursor: isAdded ? "default" : "pointer", fontSize: "0.74rem", fontWeight: 700, fontFamily: font, borderRadius: 6 }}>
                      {isAdded ? <><Check size={12} /> Added</> : <><Plus size={12} /> Add</>}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Sticky bottom: Done */}
            <div className="px-6 py-4 flex justify-end" style={{ position: "sticky", bottom: 0, zIndex: 20, borderTop: `1px solid ${BDL}`, background: TH }}>
              <button onClick={closeLibrary}
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
                        style={{ width: "100%", boxSizing: "border-box", paddingLeft: f.icon ? 34 : 11, paddingRight: 11, paddingTop: 9, paddingBottom: 9, border: `1px solid ${BD}`, borderRadius: 6, fontSize: "0.82rem", fontFamily: font, outline: "none", color: TD }} />
                    </div>
                  </div>
                ))}
                <div>
                  <label style={{ fontSize: "0.62rem", fontWeight: 700, color: TT, textTransform: "uppercase", letterSpacing: "0.07em", display: "block", marginBottom: 5 }}>Message</label>
                  <textarea value={sendMsg} onChange={e => setSendMsg(e.target.value)} rows={4}
                    style={{ width: "100%", boxSizing: "border-box", padding: "9px 11px", border: `1px solid ${BD}`, borderRadius: 6, fontSize: "0.82rem", fontFamily: font, outline: "none", color: TD, resize: "vertical" }} />
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
                        style={{ width: "100%", padding: "9px 11px", border: `1px solid ${BD}`, borderRadius: 6, fontSize: "0.82rem", fontFamily: font, outline: "none", color: TD, background: "white", appearance: "none", cursor: "pointer" }}>
                        {f.opts.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                      <ChevronDown size={13} color={TT} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                    </div>
                  </div>
                ))}
                <div>
                  <label style={{ fontSize: "0.62rem", fontWeight: 700, color: TT, textTransform: "uppercase", letterSpacing: "0.07em", display: "block", marginBottom: 5 }}>Notes <span style={{ color: "#B91C1C" }}>*</span></label>
                  <textarea value={referNotes} onChange={e => setReferNotes(e.target.value)} rows={4} placeholder="Explain the reason for referral…"
                    style={{ width: "100%", boxSizing: "border-box", padding: "9px 11px", border: `1px solid ${BD}`, borderRadius: 6, fontSize: "0.82rem", fontFamily: font, outline: "none", color: TD, resize: "vertical" }} />
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
