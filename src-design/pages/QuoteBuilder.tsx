import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ChevronRight, CheckCircle2, GraduationCap,
  ShieldCheck, Briefcase, Car, Lock, Globe, Building2,
  UserCheck, Users, ShieldAlert, Plus, Minus, X,
  FileText, ClipboardCheck, ArrowLeft, Edit3, Save,
  AlertCircle, Info, DollarSign, Copy, ChevronDown,
  Send, MessageSquare, Clock, RefreshCw, Unlock,
  CheckSquare, Mail, Calendar, ChevronUp, Eye,
} from "lucide-react";
import { AppShell } from "../components/AppShell";
import type { RoleId } from "../components/AppShell";
import { useAuth } from "../context/AuthContext";
import { PageRegister } from "../components/companion/PageRegister";
import { newId, now } from "../components/companion/CompanionContext";
import type { Suggestion, CompanionMsg } from "../components/companion/CompanionContext";

// ─── Tokens ──────────────────────────────────────────────────────────────────
const N   = "#0123D4";
const G   = "#C9A227";
const GD  = "#A8841C";
const BD  = "#C4CDD8";
const BDL = "#DCE3EC";
const TH  = "#F0F3F8";
const TT  = "#7A8FA3";
const TM  = "#4A5D6E";
const TD  = "#1A2530";
const BG  = "#EEF1F6";
const font = "'Source Sans 3', system-ui, sans-serif";

// ─── Types ────────────────────────────────────────────────────────────────────
type QuoteStatus = "draft" | "issued" | "sent" | "negotiating";

interface Endorsement {
  id: string; label: string; desc: string;
  premium: number; included: boolean;
}
interface CoverageField {
  label: string; value: string;
  type: "select" | "text" | "date"; options?: string[];
}
interface CoverageItem {
  id: string; label: string; desc: string;
  required: boolean; checked: boolean;
  price: number;           // surcharge when selected
  editingPrice: boolean;   // inline price edit mode
}
interface ProductDef {
  id: string; label: string; abbr: string; desc: string;
  icon: React.ReactNode;
  category: "Liability" | "Property & Auto" | "Specialty";
  basePremium: number;
  coverageFields: CoverageField[];
  coverageItems: CoverageItem[];
  endorsements: Endorsement[];
}
type SubTab = "policy" | "endorsements" | "premium";
interface QuoteOption {
  id: string; name: string;
  coverageFields: CoverageField[];
  coverageItems: CoverageItem[];
  endorsements: Endorsement[];
  basePremium: number;
  manualAdjustment: number;
  adjustmentPct: number;
  editingPremium: boolean;
  subTab: SubTab;
}
interface ProductState {
  options: QuoteOption[];
  activeOptionId: string;
}
interface BrokerSend {
  brokerName: string;
  brokerEmail: string;
  expiryDate: string;
  message: string;
  sentAt: string;
}

// ─── Option labels / colors ───────────────────────────────────────────────────
const OPTION_LABELS = ["Option A", "Option B", "Option C", "Option D"];
const OPTION_COLORS = [N, "#7B2FBE", "#1A7A4A", "#B45309"];

// ─── Product catalog ──────────────────────────────────────────────────────────
const PRODUCTS: ProductDef[] = [
  {
    id:"epl", label:"Employment Practices Liability", abbr:"EPL",
    desc:"Discrimination, harassment, wrongful termination & retaliation",
    icon:<UserCheck size={15}/>, category:"Liability", basePremium:14200,
    coverageFields:[
      {label:"Each Claim Limit",       value:"$1,000,000",   type:"select", options:["$500,000","$1,000,000","$2,000,000","$3,000,000"]},
      {label:"Aggregate Limit",        value:"$3,000,000",   type:"select", options:["$1,000,000","$2,000,000","$3,000,000","$5,000,000"]},
      {label:"Retention (Deductible)", value:"$50,000",      type:"select", options:["$10,000","$25,000","$50,000","$100,000","$250,000"]},
      {label:"Retroactive Date",       value:"07/01/2019",   type:"date"},
      {label:"Defense Basis",          value:"Within Limit", type:"select", options:["Within Limit","Outside Limit"]},
      {label:"Coverage Territory",     value:"USA & Canada", type:"select", options:["USA Only","USA & Canada","Worldwide"]},
    ],
    coverageItems:[
      {id:"epl-c1", label:"Claims-Made Coverage",             desc:"Covers claims first made during the policy period",                    required:true,  checked:true,  price:0,    editingPrice:false},
      {id:"epl-c2", label:"Wrongful Termination",             desc:"Actual or constructive wrongful dismissal of an employee",             required:true,  checked:true,  price:0,    editingPrice:false},
      {id:"epl-c3", label:"Discrimination (Title VII)",       desc:"Race, sex, religion, national origin, age & disability discrimination", required:true,  checked:true,  price:0,    editingPrice:false},
      {id:"epl-c4", label:"Harassment / Hostile Work Env.",   desc:"Sexual harassment and hostile work environment claims",                required:false, checked:true,  price:2800, editingPrice:false},
      {id:"epl-c5", label:"Retaliation",                      desc:"Retaliation against employees for protected activity",                 required:false, checked:true,  price:2100, editingPrice:false},
      {id:"epl-c6", label:"Failure to Promote",               desc:"Claims of discriminatory promotional practices",                      required:false, checked:false, price:1400, editingPrice:false},
      {id:"epl-c7", label:"EEOC Charge Defense",              desc:"Defense costs for Equal Employment Opportunity Commission charges",    required:false, checked:false, price:1600, editingPrice:false},
      {id:"epl-c8", label:"Punitive Damages (where insurable)",desc:"Punitive damages coverage where permitted by law",                   required:false, checked:false, price:2200, editingPrice:false},
    ],
    endorsements:[
      {id:"epl-e1", label:"Third-Party EPL",            desc:"Extends coverage to claims by non-employees (vendors, students)", premium:3200, included:false},
      {id:"epl-e2", label:"Wage & Hour Defense",        desc:"Defense costs for wage/hour class action violations",             premium:2800, included:false},
      {id:"epl-e3", label:"Crisis Management",          desc:"PR & communications costs after a covered EPL event",            premium:1500, included:false},
      {id:"epl-e4", label:"Retroactive Date Extension", desc:"Extends retroactive date by 2 additional years",                 premium:4100, included:false},
    ],
  },
  {
    id:"ell", label:"Educators Legal Liability", abbr:"ELL",
    desc:"Professional errors & omissions for educators and administrators",
    icon:<ShieldCheck size={15}/>, category:"Liability", basePremium:16400,
    coverageFields:[
      {label:"Each Claim Limit",   value:"$1,000,000",   type:"select", options:["$500,000","$1,000,000","$2,000,000","$3,000,000"]},
      {label:"Aggregate Limit",    value:"$3,000,000",   type:"select", options:["$1,000,000","$2,000,000","$3,000,000","$5,000,000"]},
      {label:"Retention",          value:"$25,000",      type:"select", options:["$10,000","$25,000","$50,000","$100,000"]},
      {label:"Retroactive Date",   value:"07/01/2018",   type:"date"},
      {label:"Coverage Territory", value:"USA & Canada", type:"select", options:["USA Only","USA & Canada","Worldwide"]},
      {label:"Defense Basis",      value:"Within Limit", type:"select", options:["Within Limit","Outside Limit"]},
    ],
    coverageItems:[
      {id:"ell-c1", label:"Professional Liability (E&O)",       desc:"Negligent acts, errors & omissions by educators",                    required:true,  checked:true,  price:0,    editingPrice:false},
      {id:"ell-c2", label:"Civil Rights Violation Defense",      desc:"Defense for 42 U.S.C. §1983 civil rights claims",                   required:true,  checked:true,  price:0,    editingPrice:false},
      {id:"ell-c3", label:"Special Education (IDEA) Defense",    desc:"Defense for Individuals with Disabilities Education Act claims",     required:true,  checked:true,  price:0,    editingPrice:false},
      {id:"ell-c4", label:"Student Discipline Defense",          desc:"Expulsion, suspension and disciplinary proceeding defense",          required:false, checked:true,  price:2400, editingPrice:false},
      {id:"ell-c5", label:"Academic Decision Liability",         desc:"Graduation, grading, academic standing and enrollment decisions",    required:false, checked:true,  price:1800, editingPrice:false},
      {id:"ell-c6", label:"FERPA Defense",                       desc:"Student privacy and records violation defense",                     required:false, checked:false, price:1200, editingPrice:false},
      {id:"ell-c7", label:"Title IX Defense",                    desc:"Sex discrimination and education program access claims",             required:false, checked:false, price:2000, editingPrice:false},
      {id:"ell-c8", label:"Student Activity Defense",            desc:"Liability arising from school-sponsored student activities",         required:false, checked:false, price:1600, editingPrice:false},
    ],
    endorsements:[
      {id:"ell-e1", label:"Special Education Enhancement", desc:"Enhanced defense sublimit for IDEA/504 plan disputes",      premium:2600, included:false},
      {id:"ell-e2", label:"Student-to-Student Liability",  desc:"Negligent supervision in student altercation claims",       premium:1800, included:false},
      {id:"ell-e3", label:"Online Learning Extension",     desc:"Extends ELL to remote/online instruction activities",       premium:1200, included:false},
      {id:"ell-e4", label:"Tutoring Services Ext.",        desc:"Covers private tutoring programs operated by district",     premium:900,  included:false},
    ],
  },
  {
    id:"gl", label:"General Liability", abbr:"GL",
    desc:"Bodily injury, property damage, personal & advertising injury",
    icon:<ShieldAlert size={15}/>, category:"Liability", basePremium:11200,
    coverageFields:[
      {label:"Each Occurrence",            value:"$1,000,000", type:"select", options:["$1,000,000","$2,000,000"]},
      {label:"General Aggregate",          value:"$3,000,000", type:"select", options:["$2,000,000","$3,000,000","$5,000,000"]},
      {label:"Products/Completed Ops.",    value:"$2,000,000", type:"select", options:["$1,000,000","$2,000,000","$3,000,000"]},
      {label:"Personal & Adv. Injury",     value:"$1,000,000", type:"select", options:["$500,000","$1,000,000","$2,000,000"]},
      {label:"Med. Payments (per person)", value:"$10,000",    type:"select", options:["$5,000","$10,000","$25,000"]},
      {label:"Fire Legal Liability",       value:"$300,000",   type:"select", options:["$100,000","$300,000","$500,000"]},
    ],
    coverageItems:[
      {id:"gl-c1", label:"Premises & Operations",          desc:"Bodily injury and property damage on school premises",              required:true,  checked:true,  price:0,    editingPrice:false},
      {id:"gl-c2", label:"Products & Completed Operations",desc:"Liability arising from products and completed work",               required:true,  checked:true,  price:0,    editingPrice:false},
      {id:"gl-c3", label:"Personal & Advertising Injury",  desc:"Libel, slander, copyright infringement, wrongful eviction",        required:true,  checked:true,  price:0,    editingPrice:false},
      {id:"gl-c4", label:"Medical Payments",               desc:"Medical expenses regardless of fault for on-premises injuries",     required:false, checked:true,  price:1800, editingPrice:false},
      {id:"gl-c5", label:"Fire Legal Liability",           desc:"Damage to rented or borrowed premises caused by fire",              required:false, checked:true,  price:1200, editingPrice:false},
      {id:"gl-c6", label:"Host Liquor Liability",          desc:"Bodily injury from alcohol served at school-sponsored events",      required:false, checked:false, price:1600, editingPrice:false},
      {id:"gl-c7", label:"Contractual Liability",          desc:"Liability assumed under insured contracts and agreements",          required:false, checked:false, price:1100, editingPrice:false},
      {id:"gl-c8", label:"Non-Owned Watercraft",           desc:"Liability for watercraft less than 51 feet not owned by district",  required:false, checked:false, price:800,  editingPrice:false},
    ],
    endorsements:[
      {id:"gl-e1", label:"Sexual Abuse & Molestation",  desc:"SAM liability for the institution and its employees",  premium:8400, included:false},
      {id:"gl-e2", label:"Liquor Liability Extension",  desc:"Events where alcohol is served on district premises",  premium:1600, included:false},
      {id:"gl-e3", label:"Volunteer Liability",         desc:"Extends GL to district-approved volunteer activities", premium:900,  included:false},
      {id:"gl-e4", label:"Broad Form Contractual",      desc:"Broadens contractual liability assumed in contracts",  premium:1100, included:false},
    ],
  },
  {
    id:"ml", label:"Management Liability", abbr:"ML",
    desc:"D&O for board members, trustees & senior administrators",
    icon:<Briefcase size={15}/>, category:"Liability", basePremium:9800,
    coverageFields:[
      {label:"Each Claim Limit",  value:"$2,000,000",   type:"select", options:["$1,000,000","$2,000,000","$3,000,000","$5,000,000"]},
      {label:"Aggregate Limit",   value:"$4,000,000",   type:"select", options:["$2,000,000","$4,000,000","$5,000,000","$10,000,000"]},
      {label:"Retention",         value:"$25,000",      type:"select", options:["$10,000","$25,000","$50,000","$100,000"]},
      {label:"Defense Basis",     value:"Outside Limit",type:"select", options:["Within Limit","Outside Limit"]},
      {label:"Continuity Date",   value:"07/01/2015",   type:"date"},
      {label:"Discovery Period",  value:"12 Months",    type:"select", options:["12 Months","24 Months","36 Months"]},
    ],
    coverageItems:[
      {id:"ml-c1", label:"Directors & Officers Liability",   desc:"Wrongful acts by board members, trustees and senior officials",      required:true,  checked:true,  price:0,    editingPrice:false},
      {id:"ml-c2", label:"Advancement of Defense Costs",     desc:"Defense costs advanced prior to final adjudication",                required:true,  checked:true,  price:0,    editingPrice:false},
      {id:"ml-c3", label:"Entity Coverage",                  desc:"Covers the institution itself for securities and governance claims",  required:false, checked:true,  price:2600, editingPrice:false},
      {id:"ml-c4", label:"Employment Practices (D&O only)",  desc:"D&O-side EPL coverage for discrimination at board level",            required:false, checked:true,  price:1800, editingPrice:false},
      {id:"ml-c5", label:"Fiduciary Liability",              desc:"ERISA fiduciary duty breaches by plan administrators",               required:false, checked:false, price:3200, editingPrice:false},
      {id:"ml-c6", label:"Government Investigation Defense", desc:"Defense costs for regulatory and government investigations",         required:false, checked:false, price:2200, editingPrice:false},
      {id:"ml-c7", label:"Employed Lawyers Coverage",        desc:"In-house counsel acting in a legal/advisory capacity",               required:false, checked:false, price:1600, editingPrice:false},
      {id:"ml-c8", label:"Crisis Event Coverage",            desc:"PR and communication costs following a governance scandal",          required:false, checked:false, price:1400, editingPrice:false},
    ],
    endorsements:[
      {id:"ml-e1", label:"Full Entity Coverage",         desc:"Expands entity coverage to all wrongful act types",        premium:3800, included:false},
      {id:"ml-e2", label:"Employed Lawyers Enhancement", desc:"Increased sublimit for in-house counsel defense",          premium:2200, included:false},
      {id:"ml-e3", label:"Fiduciary Liability",          desc:"Standalone ERISA fiduciary liability coverage",            premium:4600, included:false},
      {id:"ml-e4", label:"Run-Off Coverage (3-yr)",      desc:"Extended reporting period for departing board members",    premium:5100, included:false},
    ],
  },
  {
    id:"property", label:"Property", abbr:"Prop",
    desc:"Buildings, contents, equipment & business interruption",
    icon:<Building2 size={15}/>, category:"Property & Auto", basePremium:18500,
    coverageFields:[
      {label:"Total Insured Value (TIV)", value:"$185,000,000", type:"text"},
      {label:"Building Coverage",         value:"$160,000,000", type:"text"},
      {label:"Contents Coverage",         value:"$18,000,000",  type:"text"},
      {label:"Deductible (All Peril)",    value:"$25,000",      type:"select", options:["$10,000","$25,000","$50,000","$100,000"]},
      {label:"Coinsurance",               value:"90%",          type:"select", options:["80%","90%","100%"]},
      {label:"Valuation Basis",           value:"Replacement Cost", type:"select", options:["Replacement Cost","Actual Cash Value"]},
    ],
    coverageItems:[
      {id:"prop-c1", label:"Buildings & Structures",        desc:"All school buildings including portables and outbuildings",           required:true,  checked:true,  price:0,    editingPrice:false},
      {id:"prop-c2", label:"Business Personal Property",    desc:"Furniture, fixtures, equipment, and inventory",                      required:true,  checked:true,  price:0,    editingPrice:false},
      {id:"prop-c3", label:"Business Income / Extra Exp.",  desc:"Lost revenue and extra expenses during period of restoration",       required:true,  checked:true,  price:0,    editingPrice:false},
      {id:"prop-c4", label:"Ordinance or Law",              desc:"Additional costs to comply with ordinances during rebuild",          required:false, checked:true,  price:4200, editingPrice:false},
      {id:"prop-c5", label:"Valuable Papers & Records",     desc:"Reproduction costs for lost or damaged documents and records",       required:false, checked:false, price:1800, editingPrice:false},
      {id:"prop-c6", label:"Electronic Data Processing",    desc:"Computers, servers, network equipment and electronic media",         required:false, checked:false, price:3200, editingPrice:false},
      {id:"prop-c7", label:"Fine Arts & Collections",       desc:"Scheduled coverage for artwork, trophies and historical artifacts",  required:false, checked:false, price:1400, editingPrice:false},
      {id:"prop-c8", label:"Outdoor Property",              desc:"Fences, signs, antennas and outdoor equipment",                     required:false, checked:false, price:900,  editingPrice:false},
    ],
    endorsements:[
      {id:"prop-e1", label:"Equipment Breakdown", desc:"Mechanical & electrical breakdown including boilers", premium:6200,  included:false},
      {id:"prop-e2", label:"Flood Extension",     desc:"First-dollar flood coverage above NFIP limits",       premium:9800,  included:false},
      {id:"prop-e3", label:"Earthquake",          desc:"Earthquake damage coverage (Zone C rated)",           premium:14200, included:false},
      {id:"prop-e4", label:"Inland Marine",       desc:"Coverage for property in transit and off-premises",   premium:2100,  included:false},
    ],
  },
  {
    id:"auto", label:"Commercial Automobile", abbr:"Auto",
    desc:"Liability & physical damage for school vehicles",
    icon:<Car size={15}/>, category:"Property & Auto", basePremium:7400,
    coverageFields:[
      {label:"Combined Single Limit",    value:"$1,000,000", type:"select", options:["$500,000","$1,000,000","$2,000,000"]},
      {label:"Uninsured Motorist",       value:"$1,000,000", type:"select", options:["$250,000","$500,000","$1,000,000"]},
      {label:"Medical Payments",         value:"$10,000",    type:"select", options:["$5,000","$10,000","$25,000"]},
      {label:"Comprehensive Deductible", value:"$2,500",     type:"select", options:["$1,000","$2,500","$5,000"]},
      {label:"Collision Deductible",     value:"$5,000",     type:"select", options:["$2,500","$5,000","$10,000"]},
      {label:"Number of Vehicles",       value:"48",         type:"text"},
    ],
    coverageItems:[
      {id:"auto-c1", label:"Auto Liability",                desc:"Bodily injury and property damage from vehicle accidents",           required:true,  checked:true,  price:0,    editingPrice:false},
      {id:"auto-c2", label:"Uninsured Motorist",            desc:"Protection when at-fault driver is uninsured or underinsured",      required:true,  checked:true,  price:0,    editingPrice:false},
      {id:"auto-c3", label:"Medical Payments",              desc:"Medical expenses for occupants injured in covered vehicles",         required:true,  checked:true,  price:0,    editingPrice:false},
      {id:"auto-c4", label:"Comprehensive Physical Damage", desc:"Non-collision losses: theft, vandalism, weather, fire",             required:false, checked:true,  price:2400, editingPrice:false},
      {id:"auto-c5", label:"Collision Physical Damage",     desc:"Damage to covered vehicles from collision with another object",     required:false, checked:true,  price:2200, editingPrice:false},
      {id:"auto-c6", label:"Hired Auto Liability",          desc:"Liability for vehicles rented or leased by the district",           required:false, checked:false, price:1200, editingPrice:false},
      {id:"auto-c7", label:"Non-Owned Auto Liability",      desc:"Liability for employee-owned vehicles on district business",        required:false, checked:false, price:1000, editingPrice:false},
      {id:"auto-c8", label:"Towing & Labor",                desc:"Towing and labor costs when a covered vehicle breaks down",         required:false, checked:false, price:400,  editingPrice:false},
    ],
    endorsements:[
      {id:"auto-e1", label:"Hired & Non-Owned Auto",   desc:"Liability for employee-owned & rented vehicles",       premium:2100, included:false},
      {id:"auto-e2", label:"Student Transportation",   desc:"Enhanced coverage for district-operated school buses",  premium:3400, included:false},
      {id:"auto-e3", label:"Drive Other Car Coverage", desc:"Personal auto extension for named executives",          premium:800,  included:false},
      {id:"auto-e4", label:"Gap Coverage",             desc:"Covers gap between ACV and loan/lease balance",         premium:600,  included:false},
    ],
  },
  {
    id:"crime", label:"Crime / Fidelity", abbr:"Crime",
    desc:"Employee dishonesty, forgery, theft & funds transfer fraud",
    icon:<Lock size={15}/>, category:"Specialty", basePremium:3800,
    coverageFields:[
      {label:"Employee Dishonesty",   value:"$500,000",  type:"select", options:["$250,000","$500,000","$1,000,000","$2,000,000"]},
      {label:"Forgery / Alteration",  value:"$500,000",  type:"select", options:["$250,000","$500,000","$1,000,000"]},
      {label:"Money & Securities",    value:"$100,000",  type:"select", options:["$50,000","$100,000","$250,000"]},
      {label:"Computer Fraud",        value:"$500,000",  type:"select", options:["$250,000","$500,000","$1,000,000"]},
      {label:"Deductible",            value:"$5,000",    type:"select", options:["$2,500","$5,000","$10,000","$25,000"]},
      {label:"Discovery Period",      value:"12 Months", type:"select", options:["12 Months","24 Months","36 Months"]},
    ],
    coverageItems:[
      {id:"crime-c1", label:"Employee Dishonesty",              desc:"Theft, embezzlement or fraud by employees or volunteers",         required:true,  checked:true,  price:0,    editingPrice:false},
      {id:"crime-c2", label:"Forgery & Alteration",             desc:"Loss from forged or altered checks, drafts or promissory notes",  required:true,  checked:true,  price:0,    editingPrice:false},
      {id:"crime-c3", label:"Money & Securities (On Premises)", desc:"Theft, destruction or disappearance of money on premises",        required:true,  checked:true,  price:0,    editingPrice:false},
      {id:"crime-c4", label:"Money & Securities (In Transit)",  desc:"Theft of money or securities while being transported",            required:false, checked:true,  price:1200, editingPrice:false},
      {id:"crime-c5", label:"Computer Fraud",                   desc:"Loss from unauthorized computer access and manipulation",         required:false, checked:true,  price:1400, editingPrice:false},
      {id:"crime-c6", label:"Funds Transfer Fraud",             desc:"Fraudulent transfer instructions causing financial loss",         required:false, checked:false, price:1800, editingPrice:false},
      {id:"crime-c7", label:"Social Engineering Fraud",         desc:"Deceptive instruction losses from impersonation schemes",         required:false, checked:false, price:1600, editingPrice:false},
      {id:"crime-c8", label:"Vendor / Client Fraud",            desc:"Impersonation of vendors or clients in financial transactions",   required:false, checked:false, price:1200, editingPrice:false},
    ],
    endorsements:[
      {id:"crime-e1", label:"Social Engineering Fraud",   desc:"Covers losses from deceptive instruction schemes",    premium:2800, included:false},
      {id:"crime-e2", label:"Funds Transfer Fraud",       desc:"Covers unauthorized electronic funds transfers",       premium:3100, included:false},
      {id:"crime-e3", label:"Vendor/Client Fraud",        desc:"Impersonation of vendors or clients in transactions",  premium:1900, included:false},
      {id:"crime-e4", label:"Extended Discovery (12 mo)", desc:"Extended reporting period after policy expiry",        premium:1200, included:false},
    ],
  },
  {
    id:"cyber", label:"Cyber Liability", abbr:"Cyber",
    desc:"Data breach, ransomware, network security & privacy liability",
    icon:<Globe size={15}/>, category:"Specialty", basePremium:8600,
    coverageFields:[
      {label:"Each Claim / Incident",     value:"$2,000,000", type:"select", options:["$1,000,000","$2,000,000","$3,000,000","$5,000,000"]},
      {label:"Aggregate Limit",           value:"$4,000,000", type:"select", options:["$2,000,000","$4,000,000","$5,000,000","$10,000,000"]},
      {label:"Retention",                 value:"$50,000",    type:"select", options:["$25,000","$50,000","$100,000","$250,000"]},
      {label:"Breach Response Sub-limit", value:"$500,000",   type:"select", options:["$250,000","$500,000","$1,000,000"]},
      {label:"Ransomware Sub-limit",      value:"$1,000,000", type:"select", options:["$500,000","$1,000,000","$2,000,000"]},
      {label:"Waiting Period (BI)",       value:"8 Hours",    type:"select", options:["4 Hours","8 Hours","12 Hours","24 Hours"]},
    ],
    coverageItems:[
      {id:"cyber-c1", label:"Network Security Liability",       desc:"Failure to prevent unauthorized access, malware, DoS attacks",   required:true,  checked:true,  price:0,    editingPrice:false},
      {id:"cyber-c2", label:"Privacy Liability",                desc:"Violation of privacy laws and unauthorized disclosure of data",   required:true,  checked:true,  price:0,    editingPrice:false},
      {id:"cyber-c3", label:"First-Party Data Breach Response", desc:"Notification costs, credit monitoring, forensics, PR",           required:true,  checked:true,  price:0,    editingPrice:false},
      {id:"cyber-c4", label:"Business Interruption",            desc:"Lost revenue and extra expenses from a cyber event",             required:false, checked:true,  price:2800, editingPrice:false},
      {id:"cyber-c5", label:"Cyber Extortion / Ransomware",     desc:"Extortion demands, ransom payments and response costs",          required:false, checked:true,  price:2400, editingPrice:false},
      {id:"cyber-c6", label:"Regulatory Defense & Penalties",   desc:"Fines and penalties from FERPA, HIPAA, state privacy regulators",required:false, checked:false, price:2200, editingPrice:false},
      {id:"cyber-c7", label:"Media Liability",                  desc:"Defamation, libel and intellectual property claims in media",     required:false, checked:false, price:1400, editingPrice:false},
      {id:"cyber-c8", label:"Dependent Systems Failure",        desc:"Losses from failure of third-party technology vendors",          required:false, checked:false, price:2000, editingPrice:false},
    ],
    endorsements:[
      {id:"cyber-e1", label:"Ransomware Enhancement",    desc:"Increases ransomware sublimit & adds crisis support",  premium:4200, included:false},
      {id:"cyber-e2", label:"Dependent Systems Failure", desc:"Third-party system failure outage coverage",           premium:3600, included:false},
      {id:"cyber-e3", label:"Reputational Harm",         desc:"Revenue loss from cyber-related reputational damage",  premium:2800, included:false},
      {id:"cyber-e4", label:"Social Engineering",        desc:"Phishing and social engineering financial losses",     premium:3100, included:false},
    ],
  },
  {
    id:"student", label:"Student Accident", abbr:"SA",
    desc:"Medical benefits for students injured in school-sponsored activities",
    icon:<Users size={15}/>, category:"Specialty", basePremium:2800,
    coverageFields:[
      {label:"Maximum Benefit",          value:"$25,000",     type:"select", options:["$10,000","$25,000","$50,000","$100,000"]},
      {label:"Accidental Death Benefit", value:"$10,000",     type:"select", options:["$5,000","$10,000","$25,000"]},
      {label:"Dental Benefit",           value:"$2,500",      type:"select", options:["$1,000","$2,500","$5,000"]},
      {label:"Deductible",               value:"$0",          type:"select", options:["$0","$100","$250","$500"]},
      {label:"Coverage Period",          value:"School Year", type:"select", options:["School Year","24-Hour","Extended Day"]},
      {label:"Enrolled Students",        value:"14,200",      type:"text"},
    ],
    coverageItems:[
      {id:"sa-c1", label:"Accidental Death & Dismemberment", desc:"Death or loss of limb/sight resulting from a covered accident",   required:true,  checked:true,  price:0,    editingPrice:false},
      {id:"sa-c2", label:"Medical Expense Reimbursement",    desc:"Hospital, surgical and physician charges from covered accidents",  required:true,  checked:true,  price:0,    editingPrice:false},
      {id:"sa-c3", label:"Dental Expense",                   desc:"Treatment of damaged teeth resulting from a covered accident",     required:true,  checked:true,  price:0,    editingPrice:false},
      {id:"sa-c4", label:"Physical Therapy",                 desc:"Licensed physical therapist treatment following an accident",      required:false, checked:true,  price:800,  editingPrice:false},
      {id:"sa-c5", label:"Optical Expense",                  desc:"Replacement of eyeglasses or contacts damaged in an accident",     required:false, checked:false, price:400,  editingPrice:false},
      {id:"sa-c6", label:"Interscholastic Sports",           desc:"Enhanced benefits during sanctioned competitive sports activities", required:false, checked:false, price:1200, editingPrice:false},
      {id:"sa-c7", label:"Off-Campus Activities",            desc:"Field trips, competitions and off-site school programs",           required:false, checked:false, price:900,  editingPrice:false},
      {id:"sa-c8", label:"Crisis Response",                  desc:"Counseling services following a traumatic student incident",       required:false, checked:false, price:600,  editingPrice:false},
    ],
    endorsements:[
      {id:"sa-e1", label:"Athletic Team Blanket",      desc:"Blanket coverage for all sanctioned athletic teams",     premium:2400, included:false},
      {id:"sa-e2", label:"Interscholastic Sports",     desc:"Enhanced benefits for competitive sports injuries",      premium:1800, included:false},
      {id:"sa-e3", label:"Off-Campus Activities",      desc:"Extends coverage to field trips and off-site programs",  premium:1100, included:false},
      {id:"sa-e4", label:"Medical Payments Extension", desc:"Increases medical payment sub-limits by 50%",           premium:900,  included:false},
    ],
  },
];

const CATEGORIES = ["Liability","Property & Auto","Specialty"] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n: number) => "$" + n.toLocaleString("en-US",{minimumFractionDigits:0,maximumFractionDigits:0});

function makeOption(product: ProductDef, index: number): QuoteOption {
  return {
    id:`${product.id}-opt-${Date.now()}-${index}`,
    name: OPTION_LABELS[index] ?? `Option ${index+1}`,
    coverageFields: product.coverageFields.map(f=>({...f})),
    coverageItems:  product.coverageItems.map(c=>({...c})),
    endorsements:   product.endorsements.map(e=>({...e})),
    basePremium: product.basePremium,
    manualAdjustment:0, adjustmentPct:0,
    editingPremium:false, subTab:"policy",
  };
}

function initProductState(product: ProductDef): ProductState {
  const opt = makeOption(product,0);
  return {options:[opt], activeOptionId:opt.id};
}

function calcOptionPremium(opt: QuoteOption): number {
  const coveragePrem = opt.coverageItems
    .filter(c => c.checked && !c.required)
    .reduce((a,c) => a + c.price, 0);
  const endoPrem = opt.endorsements.filter(e=>e.included).reduce((a,e)=>a+e.premium,0);
  const base = opt.basePremium + coveragePrem + endoPrem;
  const pctAdj = Math.round(base * opt.adjustmentPct / 100);
  return Math.max(0, base + pctAdj + opt.manualAdjustment);
}

// ─── Send to Broker Modal ─────────────────────────────────────────────────────
function SendToBrokerModal({
  onSend, onClose, totalPremium,
}: {
  onSend: (data: BrokerSend) => void;
  onClose: () => void;
  totalPremium: number;
}) {
  const [brokerName,  setBrokerName]  = useState("Gallagher Education, Inc.");
  const [brokerEmail, setBrokerEmail] = useState("jsmith@gallagheredu.com");
  const [expiryDate,  setExpiryDate]  = useState("2024-05-15");
  const [message, setMessage] = useState(
    `Please find enclosed the quoted terms for Riverside Unified School District for the upcoming policy period. ` +
    `Total quoted premium is ${fmt(totalPremium)}. ` +
    `Please review and revert with any questions or counter-proposals.`
  );
  const [sending, setSending] = useState(false);

  const handleSend = () => {
    setSending(true);
    setTimeout(()=>{
      onSend({brokerName, brokerEmail, expiryDate, message, sentAt: new Date().toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})});
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{background:"rgba(0,0,0,0.45)"}}>
      <div style={{width:560, background:"white", borderRadius:8, overflow:"hidden", boxShadow:"0 20px 60px rgba(0,0,0,0.25)", fontFamily:font, maxHeight:"90vh", overflowY:"auto"}}>
        {/* Header */}
        <div style={{background:N, height:4, backgroundImage:`linear-gradient(90deg,${G} 0%,${GD} 100%)`}}/>
        <div className="flex items-start justify-between px-6 py-5" style={{borderBottom:`1px solid ${BDL}`}}>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center" style={{width:38,height:38,background:`${N}14`,border:`1px solid ${N}25`,color:N}}>
              <Send size={17}/>
            </div>
            <div>
              <h2 style={{fontSize:"1.05rem",fontWeight:700,color:N}}>Send Quote to Broker</h2>
              <p style={{fontSize:"0.72rem",color:TT,marginTop:2}}>Quote will be sent and opened for negotiation</p>
            </div>
          </div>
          <button onClick={onClose} className="hover:opacity-60 transition-opacity p-1">
            <X size={18} color={TT}/>
          </button>
        </div>

        {/* Premium summary banner */}
        <div className="px-6 py-3 flex items-center justify-between"
          style={{background:`${N}08`,borderBottom:`1px solid ${N}20`}}>
          <span style={{fontSize:"0.72rem",fontWeight:600,color:TM}}>Total Quoted Premium</span>
          <span style={{fontSize:"1.25rem",fontWeight:800,color:N,letterSpacing:"-0.01em"}}>{fmt(totalPremium)}</span>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Broker name */}
          <div>
            <label style={{display:"block",fontSize:"0.65rem",fontWeight:700,color:TT,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:6}}>
              Broker / Agency
            </label>
            <input value={brokerName} onChange={e=>setBrokerName(e.target.value)}
              style={{width:"100%",padding:"8px 12px",border:`1px solid ${BD}`,borderRadius:6,fontSize:"0.82rem",fontFamily:font,outline:"none",color:TD}}/>
          </div>

          {/* Broker email */}
          <div>
            <label style={{display:"block",fontSize:"0.65rem",fontWeight:700,color:TT,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:6}}>
              Broker Email
            </label>
            <div className="relative">
              <Mail size={14} color={TT} style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)"}}/>
              <input value={brokerEmail} onChange={e=>setBrokerEmail(e.target.value)} type="email"
                style={{width:"100%",paddingLeft:32,paddingRight:12,paddingTop:8,paddingBottom:8,border:`1px solid ${BD}`,borderRadius:6,fontSize:"0.82rem",fontFamily:font,outline:"none",color:TD}}/>
            </div>
          </div>

          {/* Quote expiry */}
          <div>
            <label style={{display:"block",fontSize:"0.65rem",fontWeight:700,color:TT,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:6}}>
              Quote Expiry Date
            </label>
            <div className="relative">
              <Calendar size={14} color={TT} style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)"}}/>
              <input type="date" value={expiryDate} onChange={e=>setExpiryDate(e.target.value)}
                style={{width:"100%",paddingLeft:32,paddingRight:12,paddingTop:8,paddingBottom:8,border:`1px solid ${BD}`,borderRadius:6,fontSize:"0.82rem",fontFamily:font,outline:"none",color:TD}}/>
            </div>
          </div>

          {/* Message */}
          <div>
            <label style={{display:"block",fontSize:"0.65rem",fontWeight:700,color:TT,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:6}}>
              Cover Message
            </label>
            <textarea value={message} onChange={e=>setMessage(e.target.value)} rows={4}
              style={{width:"100%",padding:"8px 12px",border:`1px solid ${BD}`,borderRadius:6,fontSize:"0.78rem",fontFamily:font,outline:"none",color:TD,resize:"vertical",lineHeight:1.6}}/>
          </div>

          {/* Negotiation notice */}
          <div className="flex items-start gap-2.5 p-3"
            style={{background:"#FFF8E6",border:`1px solid #F0D88A`,borderLeft:`3px solid ${G}`,borderRadius:6}}>
            <MessageSquare size={13} color="#8A5C00" style={{marginTop:1,flexShrink:0}}/>
            <div>
              <p style={{fontSize:"0.72rem",fontWeight:700,color:"#8A5C00"}}>Open for Negotiation</p>
              <p style={{fontSize:"0.68rem",color:"#8A5C00",marginTop:2,lineHeight:1.4}}>
                After sending, this quote will remain open for negotiation. You will be able to revise terms and re-issue once discussions conclude.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4"
          style={{borderTop:`1px solid ${BDL}`,background:TH}}>
          <button onClick={onClose}
            className="px-5 py-2.5 hover:bg-slate-100 transition-colors"
            style={{border:`1px solid ${BD}`,fontSize:"0.80rem",fontWeight:600,color:TM,borderRadius:6}}>
            Cancel
          </button>
          <button onClick={handleSend} disabled={sending}
            className="flex items-center gap-2 px-6 py-2.5 transition-all hover:brightness-95 active:scale-95"
            style={{background:N,color:"white",fontSize:"0.80rem",fontWeight:700,opacity:sending?0.7:1,borderRadius:6}}>
            {sending
              ? <><RefreshCw size={14} className="animate-spin"/> Sending…</>
              : <><Send size={14}/> Send to Broker</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Negotiation Banner ───────────────────────────────────────────────────────
function NegotiationBanner({
  brokerSend, quoteStatus, onOpenNegotiation, onEditQuote,
}: {
  brokerSend: BrokerSend;
  quoteStatus: QuoteStatus;
  onOpenNegotiation: () => void;
  onEditQuote: () => void;
}) {
  const isSent        = quoteStatus === "sent";
  const isNegotiating = quoteStatus === "negotiating";

  return (
    <div className="px-8 py-0">
      <div className="flex items-center justify-between px-5 py-3.5"
        style={{
          background: isNegotiating ? "#FFF8E6" : "#E8F0F9",
          border: `1px solid ${isNegotiating ? "#F0D88A" : "#9ABCD6"}`,
          borderLeft: `4px solid ${isNegotiating ? G : "#005B99"}`,
        }}>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center"
            style={{width:32,height:32,background:isNegotiating?`${G}22`:`${N}18`,border:`1px solid ${isNegotiating?G+"44":N+"30"}`}}>
            {isNegotiating
              ? <MessageSquare size={15} color="#8A5C00"/>
              : <CheckCircle2 size={15} color="#00427A"/>}
          </div>
          <div>
            <p style={{fontSize:"0.80rem",fontWeight:700,color:isNegotiating?"#8A5C00":"#00427A"}}>
              {isNegotiating ? "Under Negotiation" : `Quote Sent to ${brokerSend.brokerName}`}
            </p>
            <p style={{fontSize:"0.68rem",color:isNegotiating?"#A07010":"#00427A",opacity:0.8,marginTop:1}}>
              {isSent
                ? `Sent ${brokerSend.sentAt} · Expires ${new Date(brokerSend.expiryDate).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})} · Awaiting broker response`
                : `Sent ${brokerSend.sentAt} · Broker in discussion · Quote open for revision`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          {isSent && (
            <button onClick={onOpenNegotiation}
              className="flex items-center gap-2 px-4 py-2 transition-all hover:brightness-95"
              style={{background:"#00427A",color:"white",fontSize:"0.75rem",fontWeight:700,borderRadius:6}}>
              <MessageSquare size={12}/> Open for Negotiation
            </button>
          )}
          {isNegotiating && (
            <button onClick={onEditQuote}
              className="flex items-center gap-2 px-4 py-2 transition-all hover:brightness-95 active:scale-95"
              style={{background:G,color:"white",fontSize:"0.75rem",fontWeight:700,boxShadow:"0 2px 8px rgba(201,162,39,0.35)",borderRadius:6}}>
              <Edit3 size={12}/> Edit Quote
            </button>
          )}
          <div className="flex items-center gap-1.5 px-3 py-2"
            style={{background:"rgba(255,255,255,0.6)",border:`1px solid ${isNegotiating?"#F0D88A":"#9ABCD6"}`}}>
            <Eye size={12} color={isNegotiating?"#8A5C00":"#00427A"}/>
            <span style={{fontSize:"0.68rem",fontWeight:600,color:isNegotiating?"#8A5C00":"#00427A"}}>View Only</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ─────��─────────────────────────────────────────────────────
export function QuoteBuilder() {
  const navigate = useNavigate();
  const {id="SUB-7829"} = useParams();
  const { user } = useAuth();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeProductId, setActiveProductId] = useState<string|null>(null);
  const [productStates, setProductStates] = useState<Record<string,ProductState>>({});
  const [quoteStatus, setQuoteStatus] = useState<QuoteStatus>("draft");
  const [brokerSend, setBrokerSend] = useState<BrokerSend|null>(null);
  const [showSendModal, setShowSendModal] = useState(false);
  const [issued, setIssued] = useState(false);

  const isLocked = quoteStatus === "sent" || quoteStatus === "negotiating";

  // ── product selection ─────────────────────────────────────────────────────
  const toggleProduct = (pid: string) => {
    if (isLocked) return;
    setSelectedIds(prev => {
      if (prev.includes(pid)) {
        const next = prev.filter(x => x !== pid);
        setActiveProductId(next.length>0 ? next[next.length-1] : null);
        return next;
      }
      setActiveProductId(pid);
      setProductStates(ps => ({...ps, [pid]: ps[pid] ?? initProductState(PRODUCTS.find(p=>p.id===pid)!)}));
      return [...prev, pid];
    });
  };

  // ── option helpers ────────────────────────────────────────────────────────
  const updateOption = (pid: string, optId: string, patch: Partial<QuoteOption>) => {
    if (isLocked) return;
    setProductStates(ps => ({
      ...ps,
      [pid]: {...ps[pid], options: ps[pid].options.map(o => o.id===optId ? {...o,...patch} : o)},
    }));
  };

  const addOption = (pid: string) => {
    if (isLocked) return;
    const product = PRODUCTS.find(p=>p.id===pid)!;
    const state = productStates[pid];
    if (state.options.length>=4) return;
    const newOpt = makeOption(product, state.options.length);
    setProductStates(ps => ({...ps, [pid]:{options:[...ps[pid].options, newOpt], activeOptionId:newOpt.id}}));
  };

  const duplicateOption = (pid: string, optId: string) => {
    if (isLocked) return;
    const state = productStates[pid];
    if (state.options.length>=4) return;
    const source = state.options.find(o=>o.id===optId)!;
    const newOpt: QuoteOption = {
      ...JSON.parse(JSON.stringify(source)),
      id:`${pid}-opt-${Date.now()}`,
      name:OPTION_LABELS[state.options.length]??`Option ${state.options.length+1}`,
    };
    setProductStates(ps => ({...ps, [pid]:{options:[...ps[pid].options, newOpt], activeOptionId:newOpt.id}}));
  };

  const removeOption = (pid: string, optId: string) => {
    if (isLocked) return;
    const state = productStates[pid];
    if (state.options.length<=1) return;
    const remaining = state.options.filter(o=>o.id!==optId);
    const newActive = state.activeOptionId===optId ? remaining[0].id : state.activeOptionId;
    setProductStates(ps => ({...ps, [pid]:{options:remaining,activeOptionId:newActive}}));
  };

  const setActiveOption = (pid: string, optId: string) =>
    setProductStates(ps => ({...ps, [pid]:{...ps[pid],activeOptionId:optId}}));

  // ── computed ──────────────────────────────────────────────────────────────
  const activeProduct = PRODUCTS.find(p=>p.id===activeProductId);
  const activeState   = activeProductId ? productStates[activeProductId] : null;
  const activeOption  = activeState ? activeState.options.find(o=>o.id===activeState.activeOptionId) : null;

  const totalPremium = selectedIds.reduce((sum,pid)=>{
    const state = productStates[pid];
    if (!state) return sum;
    return sum + calcOptionPremium(state.options.find(o=>o.id===state.activeOptionId)!);
  }, 0);

  // ── broker workflow ───────────────────────────────────────────────────────
  const handleIssueQuote = () => {
    setIssued(true);
    setQuoteStatus("issued");
    setTimeout(()=>setIssued(false), 3000);
  };

  const handleSend = (data: BrokerSend) => {
    setBrokerSend(data);
    setQuoteStatus("sent");
    setShowSendModal(false);
  };

  const handleOpenNegotiation = () => setQuoteStatus("negotiating");

  const handleEditQuote = () => {
    setQuoteStatus("draft");
    setIssued(false);
  };

  // ── render: Policy tab ────────────────────────────────────────────────────
  const renderPolicyTab = (pid: string, opt: QuoteOption) => (
    <div className="space-y-6">
      {/* Coverage Limits */}
      <div>
        <p style={{fontSize:"0.62rem",fontWeight:800,color:TT,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:12}}>
          Coverage Limits & Terms
        </p>
        <div className="grid grid-cols-2 gap-3">
          {opt.coverageFields.map((field, fi)=>(
            <div key={fi}>
              <label style={{display:"block",fontSize:"0.65rem",fontWeight:700,color:TT,textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:5}}>
                {field.label}
              </label>
              {field.type==="select" ? (
                <select value={field.value}
                  disabled={isLocked}
                  onChange={e=>{
                    const updated=opt.coverageFields.map((f,i)=>i===fi?{...f,value:e.target.value}:f);
                    updateOption(pid,opt.id,{coverageFields:updated});
                  }}
                  style={{width:"100%",padding:"7px 10px",border:`1px solid ${BD}`,borderRadius:6,fontSize:"0.80rem",color:TD,background:isLocked?"#F9FAFB":"white",fontFamily:font,outline:"none"}}>
                  {field.options!.map(o=><option key={o} value={o}>{o}</option>)}
                </select>
              ):(
                <input type="text" value={field.value}
                  disabled={isLocked}
                  onChange={e=>{
                    const updated=opt.coverageFields.map((f,i)=>i===fi?{...f,value:e.target.value}:f);
                    updateOption(pid,opt.id,{coverageFields:updated});
                  }}
                  style={{width:"100%",padding:"7px 10px",border:`1px solid ${BD}`,borderRadius:6,fontSize:"0.80rem",color:TD,background:isLocked?"#F9FAFB":"white",fontFamily:font,outline:"none"}}/>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Coverage Checklist with per-item pricing */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <p style={{fontSize:"0.62rem",fontWeight:800,color:TT,textTransform:"uppercase",letterSpacing:"0.1em"}}>
              Coverage Checklist & Pricing
            </p>
            <p style={{fontSize:"0.65rem",color:TT,marginTop:2}}>
              {opt.coverageItems.filter(c=>c.checked).length} of {opt.coverageItems.length} selected
              &nbsp;·&nbsp;
              <span style={{color:"#2E7D32",fontWeight:600}}>
                {fmt(opt.coverageItems.filter(c=>c.checked&&!c.required).reduce((a,c)=>a+c.price,0))} in optional coverage surcharges
              </span>
            </p>
          </div>
          {!isLocked && (
            <div className="flex items-center gap-2">
              <button onClick={()=>updateOption(pid,opt.id,{coverageItems:opt.coverageItems.map(c=>({...c,checked:true}))})}
                style={{fontSize:"0.65rem",color:N,fontWeight:700,borderRadius:6}} className="hover:underline">
                Select all
              </button>
              <span style={{color:BD}}>·</span>
              <button onClick={()=>updateOption(pid,opt.id,{coverageItems:opt.coverageItems.map(c=>c.required?c:{...c,checked:false})})}
                style={{fontSize:"0.65rem",color:TM,fontWeight:600,borderRadius:6}} className="hover:underline">
                Required only
              </button>
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          {opt.coverageItems.map((item, ci)=>(
            <div key={item.id}
              className="transition-all"
              style={{
                background:item.checked?`${N}07`:"white",
                border:`1px solid ${item.checked?N+"30":BDL}`,
                borderLeft:`3px solid ${item.checked?N:"transparent"}`,
                opacity:isLocked&&!item.checked?0.5:1,
              }}>
              {/* Main row */}
              <div className="flex items-start gap-3 px-3 pt-3 pb-2"
                onClick={()=>{
                  if (item.required||isLocked) return;
                  const updated=opt.coverageItems.map((c,i)=>i===ci?{...c,checked:!c.checked}:c);
                  updateOption(pid,opt.id,{coverageItems:updated});
                }}
                style={{cursor:item.required||isLocked?"default":"pointer"}}>
                {/* Checkbox */}
                <div className="flex items-center justify-center shrink-0 mt-0.5"
                  style={{width:16,height:16,background:item.checked?N:"white",border:`2px solid ${item.checked?N:BD}`,transition:"all 0.12s",opacity:item.required?0.7:1}}>
                  {item.checked && <CheckCircle2 size={11} color="white" strokeWidth={3}/>}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p style={{fontSize:"0.78rem",fontWeight:item.checked?700:400,color:item.checked?TD:TM,lineHeight:1.2}}>
                      {item.label}
                    </p>
                    {item.required && (
                      <span style={{fontSize:"0.55rem",fontWeight:700,background:"#E8F0F9",color:"#00427A",border:"1px solid #9ABCD6",padding:"0 6px"}}>
                        REQUIRED
                      </span>
                    )}
                  </div>
                  <p style={{fontSize:"0.68rem",color:TT,marginTop:2,lineHeight:1.4}}>{item.desc}</p>
                </div>
                {/* Price column */}
                <div className="flex flex-col items-end shrink-0 ml-2">
                  {item.required ? (
                    <span style={{fontSize:"0.68rem",fontWeight:600,color:TT,fontStyle:"italic"}}>Included</span>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      {item.editingPrice ? (
                        <div className="flex items-center gap-1">
                          <span style={{fontSize:"0.68rem",color:TT}}>$</span>
                          <input
                            type="number"
                            value={item.price}
                            autoFocus
                            onClick={e=>e.stopPropagation()}
                            onChange={e=>{
                              e.stopPropagation();
                              const updated=opt.coverageItems.map((c,i)=>i===ci?{...c,price:Math.max(0,Number(e.target.value))}:c);
                              updateOption(pid,opt.id,{coverageItems:updated});
                            }}
                            onBlur={()=>{
                              const updated=opt.coverageItems.map((c,i)=>i===ci?{...c,editingPrice:false}:c);
                              updateOption(pid,opt.id,{coverageItems:updated});
                            }}
                            onKeyDown={e=>{
                              if(e.key==="Enter"||e.key==="Escape"){
                                const updated=opt.coverageItems.map((c,i)=>i===ci?{...c,editingPrice:false}:c);
                                updateOption(pid,opt.id,{coverageItems:updated});
                              }
                            }}
                            style={{width:72,padding:"2px 5px",border:`1px solid ${N}`,borderRadius:6,fontSize:"0.75rem",fontFamily:font,outline:"none",textAlign:"right"}}
                          />
                          <button onClick={e=>{
                            e.stopPropagation();
                            const updated=opt.coverageItems.map((c,i)=>i===ci?{...c,editingPrice:false}:c);
                            updateOption(pid,opt.id,{coverageItems:updated});
                          }} className="flex items-center justify-center hover:opacity-70"
                            style={{width:20,height:20,background:`${N}15`,border:`1px solid ${N}30`,borderRadius:6}}>
                            <Save size={10} color={N}/>
                          </button>
                        </div>
                      ) : (
                        <>
                          <span style={{
                            fontSize:"0.80rem",fontWeight:item.checked?700:500,
                            color:item.checked?"#2E7D32":TT,
                          }}>
                            {fmt(item.price)}
                          </span>
                          {!isLocked && (
                            <button
                              onClick={e=>{
                                e.stopPropagation();
                                const updated=opt.coverageItems.map((c,i)=>i===ci?{...c,editingPrice:true}:c);
                                updateOption(pid,opt.id,{coverageItems:updated});
                              }}
                              className="flex items-center justify-center hover:opacity-70 transition-opacity"
                              style={{width:20,height:20,background:TH,border:`1px solid ${BDL}`,borderRadius:6}}
                              title="Edit price">
                              <Edit3 size={10} color={TT}/>
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Price context row (only for checked optional items) */}
              {item.checked && !item.required && (
                <div className="flex items-center justify-between px-3 pb-2 pl-10">
                  <span style={{fontSize:"0.62rem",color:TT}}>
                    Coverage surcharge included in premium
                  </span>
                  <div className="flex items-center gap-1">
                    <Plus size={9} color="#2E7D32"/>
                    <span style={{fontSize:"0.65rem",fontWeight:700,color:"#2E7D32"}}>{fmt(item.price)}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Coverage subtotal */}
        <div className="flex items-center justify-between px-4 py-3 mt-3"
          style={{background:`${N}08`,border:`1px solid ${N}25`,borderLeft:`3px solid ${N}`}}>
          <div className="flex items-center gap-2">
            <CheckSquare size={13} color={N}/>
            <span style={{fontSize:"0.72rem",fontWeight:700,color:N}}>
              Selected Coverage Surcharges
            </span>
          </div>
          <span style={{fontSize:"0.88rem",fontWeight:800,color:N}}>
            {fmt(opt.coverageItems.filter(c=>c.checked&&!c.required).reduce((a,c)=>a+c.price,0))}
          </span>
        </div>

        <div className="flex items-start gap-2 p-3 mt-2"
          style={{background:"#EEF1F6",border:`1px solid ${BDL}`,borderLeft:`3px solid ${N}`}}>
          <Info size={13} color={N} style={{marginTop:1,flexShrink:0}}/>
          <p style={{fontSize:"0.68rem",color:TM,lineHeight:1.5}}>
            Required coverages are always included in the base premium. Click the <Edit3 size={10} style={{display:"inline",verticalAlign:"middle"}}/> icon next to any optional coverage price to adjust the surcharge amount.
          </p>
        </div>
      </div>
    </div>
  );

  // ── render: Endorsements tab ──────────────────────────────────────────────
  const renderEndorsementsTab = (pid: string, opt: QuoteOption) => (
    <div className="space-y-2">
      <p style={{fontSize:"0.70rem",color:TT,marginBottom:12,lineHeight:1.5}}>
        Select optional endorsements. Each adds to the quoted premium.
      </p>
      {opt.endorsements.map((endo,ei)=>(
        <div key={endo.id}
          onClick={()=>{
            if(isLocked) return;
            const updated=opt.endorsements.map((e,i)=>i===ei?{...e,included:!e.included}:e);
            updateOption(pid,opt.id,{endorsements:updated});
          }}
          className="flex items-start gap-3 p-4 transition-all"
          style={{
            cursor:isLocked?"default":"pointer",
            border:`1px solid ${endo.included?N+"55":BD}`,
            background:endo.included?`${N}08`:"white",
            borderLeft:`3px solid ${endo.included?N:"transparent"}`,
            opacity:isLocked&&!endo.included?0.5:1,
          }}>
          <div className="flex items-center justify-center shrink-0 mt-0.5"
            style={{width:18,height:18,background:endo.included?N:"white",border:`2px solid ${endo.included?N:BD}`,transition:"all 0.15s"}}>
            {endo.included && <CheckCircle2 size={12} color="white" strokeWidth={3}/>}
          </div>
          <div className="flex items-center justify-center shrink-0"
            style={{width:28,height:28,background:endo.included?`${N}14`:"#F0F3F8",color:endo.included?N:TT,border:`1px solid ${endo.included?N+"30":BDL}`}}>
            <Plus size={13}/>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <p style={{fontSize:"0.80rem",fontWeight:endo.included?700:500,color:endo.included?N:TD}}>{endo.label}</p>
              <span style={{fontSize:"0.75rem",fontWeight:700,color:endo.included?"#2E7D32":TT,flexShrink:0}}>
                +{fmt(endo.premium)}
              </span>
            </div>
            <p style={{fontSize:"0.70rem",color:TT,marginTop:2,lineHeight:1.4}}>{endo.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );

  // ── render: Premium tab ───────────────────────────────────────────────────
  const renderPremiumTab = (pid: string, opt: QuoteOption) => {
    const coveragePrem = opt.coverageItems.filter(c=>c.checked&&!c.required).reduce((a,c)=>a+c.price,0);
    const endoPrem     = opt.endorsements.filter(e=>e.included).reduce((a,e)=>a+e.premium,0);
    const subTotal     = opt.basePremium + coveragePrem + endoPrem;
    const pctAdj       = Math.round(subTotal * opt.adjustmentPct / 100);
    const final        = Math.max(0, subTotal + pctAdj + opt.manualAdjustment);
    return (
      <div className="space-y-5">
        {/* Breakdown */}
        <div style={{border:`1px solid ${BD}`,borderRadius:8,background:"white",overflow:"hidden"}}>
          <div className="px-5 py-3" style={{background:TH,borderBottom:`1px solid ${BDL}`}}>
            <p style={{fontSize:"0.62rem",fontWeight:700,color:TT,textTransform:"uppercase",letterSpacing:"0.09em"}}>Premium Breakdown</p>
          </div>
          {[
            {label:"Base Premium",                                              val:opt.basePremium, prefix:"",    color:TD},
            {label:`Coverage Surcharges (${opt.coverageItems.filter(c=>c.checked&&!c.required).length} optional)`, val:coveragePrem, prefix:coveragePrem>0?"+ ":"", color:coveragePrem>0?"#2E7D32":TT},
            {label:`Endorsements (${opt.endorsements.filter(e=>e.included).length})`,                               val:endoPrem,     prefix:endoPrem>0?"+ ":"",      color:endoPrem>0?"#2E7D32":TT},
          ].map((row,i)=>(
            <div key={i} className="flex items-center justify-between px-5 py-3" style={{borderBottom:`1px solid ${BDL}`}}>
              <span style={{fontSize:"0.80rem",color:TM}}>{row.label}</span>
              <span style={{fontSize:"0.80rem",fontWeight:500,color:row.color}}>{row.prefix}{fmt(row.val)}</span>
            </div>
          ))}
          <div className="flex items-center justify-between px-5 py-3" style={{background:"#F9FAFB"}}>
            <span style={{fontSize:"0.80rem",color:TM}}>Sub-total</span>
            <span style={{fontSize:"0.80rem",fontWeight:700,color:TD}}>{fmt(subTotal)}</span>
          </div>
        </div>

        {/* Adjustments */}
        <div style={{border:`1px solid ${BD}`,borderRadius:8,background:"white",overflow:"hidden"}}>
          <div className="flex items-center justify-between px-5 py-3" style={{background:TH,borderBottom:`1px solid ${BDL}`}}>
            <p style={{fontSize:"0.62rem",fontWeight:700,color:TT,textTransform:"uppercase",letterSpacing:"0.09em"}}>UW Adjustments</p>
            {!isLocked && (
              <button onClick={()=>updateOption(pid,opt.id,{editingPremium:!opt.editingPremium})}
                className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
                style={{fontSize:"0.68rem",fontWeight:700,color:N,borderRadius:6}}>
                {opt.editingPremium?<><Save size={11}/> Save</>:<><Edit3 size={11}/> Edit</>}
              </button>
            )}
          </div>
          <div className="px-5 py-4 space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label style={{fontSize:"0.70rem",fontWeight:600,color:TM}}>Rate Adjustment (%)</label>
                <span style={{fontSize:"0.70rem",fontWeight:700,color:opt.adjustmentPct<0?"#2E7D32":opt.adjustmentPct>0?"#B45309":TT}}>
                  {opt.adjustmentPct>0?"+":""}{opt.adjustmentPct}% &nbsp;({opt.adjustmentPct<0?"−":opt.adjustmentPct>0?"+":""}{fmt(Math.abs(pctAdj))})
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button disabled={!opt.editingPremium||opt.adjustmentPct<=-30}
                  onClick={()=>updateOption(pid,opt.id,{adjustmentPct:Math.max(-30,opt.adjustmentPct-5)})}
                  style={{width:30,height:30,background:opt.editingPremium?"#FBEAEA":TH,border:`1px solid ${opt.editingPremium?"#E8A8A8":BDL}`,cursor:opt.editingPremium?"pointer":"not-allowed",display:"flex",alignItems:"center",justifyContent:"center",borderRadius:6}}>
                  <Minus size={13} color={opt.editingPremium?"#B91C1C":TT}/>
                </button>
                <div className="flex-1">
                  <div style={{height:6,background:BDL,position:"relative"}}>
                    <div style={{position:"absolute",top:0,height:"100%",left:opt.adjustmentPct<0?`${50+opt.adjustmentPct*(50/30)}%`:"50%",width:`${Math.abs(opt.adjustmentPct)*(50/30)}%`,background:opt.adjustmentPct<0?"#2E7D32":opt.adjustmentPct>0?"#B45309":N}}/>
                    <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:2,height:10,background:BD,marginTop:-2}}/>
                  </div>
                </div>
                <button disabled={!opt.editingPremium||opt.adjustmentPct>=30}
                  onClick={()=>updateOption(pid,opt.id,{adjustmentPct:Math.min(30,opt.adjustmentPct+5)})}
                  style={{width:30,height:30,background:opt.editingPremium?"#E8F5EC":TH,border:`1px solid ${opt.editingPremium?"#93C8A0":BDL}`,cursor:opt.editingPremium?"pointer":"not-allowed",display:"flex",alignItems:"center",justifyContent:"center",borderRadius:6}}>
                  <Plus size={13} color={opt.editingPremium?"#2E7D32":TT}/>
                </button>
                {opt.editingPremium && (
                  <input type="number" min={-30} max={30} value={opt.adjustmentPct}
                    onChange={e=>updateOption(pid,opt.id,{adjustmentPct:Math.max(-30,Math.min(30,Number(e.target.value)))})}
                    style={{width:60,padding:"5px 8px",border:`1px solid ${BD}`,borderRadius:6,fontSize:"0.80rem",fontFamily:font,textAlign:"center",outline:"none"}}/>
                )}
              </div>
              <div className="flex justify-between mt-1">
                <span style={{fontSize:"0.60rem",color:TT}}>−30% max credit</span>
                <span style={{fontSize:"0.60rem",color:TT}}>+30% max debit</span>
              </div>
            </div>
            <div>
              <label style={{display:"block",fontSize:"0.70rem",fontWeight:600,color:TM,marginBottom:6}}>Manual Flat Adjustment ($)</label>
              <div className="flex items-center gap-2">
                <DollarSign size={14} color={TT}/>
                <input type="number" disabled={!opt.editingPremium||isLocked} value={opt.manualAdjustment}
                  onChange={e=>updateOption(pid,opt.id,{manualAdjustment:Number(e.target.value)})}
                  placeholder="e.g. -500 or 1200"
                  style={{flex:1,padding:"7px 10px",border:`1px solid ${opt.editingPremium?BD:BDL}`,borderRadius:6,fontSize:"0.80rem",fontFamily:font,outline:"none",background:opt.editingPremium?"white":"#F9FAFB",color:TD}}/>
              </div>
            </div>
          </div>
        </div>

        {/* Final */}
        <div style={{border:`2px solid ${N}`,borderRadius:8,background:`${N}08`}}>
          <div className="flex items-center justify-between px-5 py-4">
            <div>
              <p style={{fontSize:"0.62rem",fontWeight:700,color:N,textTransform:"uppercase",letterSpacing:"0.09em"}}>Final Quoted Premium</p>
              <p style={{fontSize:"0.70rem",color:TT,marginTop:2}}>
                {opt.adjustmentPct!==0||opt.manualAdjustment!==0?`Adjusted from ${fmt(subTotal)}`:"No adjustments applied"}
              </p>
            </div>
            <p style={{fontSize:"2rem",fontWeight:800,color:N,letterSpacing:"-0.02em"}}>{fmt(final)}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <AppShell activePage="submissions" role={user?.roleId ?? "sr-uw"} onRoleChange={() => {}}>
      <PageRegister
        routeKey={`page:quote-builder:${id ?? "current"}`}
        title="Quote Builder"
        subtitle={`${selectedIds.length} product${selectedIds.length === 1 ? "" : "s"} · $${Math.round(totalPremium).toLocaleString()}`}
        greeting={`Building the quote — ${selectedIds.length} product${selectedIds.length === 1 ? "" : "s"} selected, total ${"$" + Math.round(totalPremium).toLocaleString()}. I can validate the factor band, check authority triggers, or draft an indication letter.`}
        suggestions={[
          { id: "validate", label: "Validate factor band", tone: "blue", icon: "ShieldCheck" },
          { id: "authority", label: "Any authority triggers?", tone: "red", icon: "AlertTriangle" },
          { id: "indication", label: "Draft indication letter", tone: "violet", icon: "Mail" },
          { id: "summary", label: "Summarize the quote", tone: "gold", icon: "Sparkles" },
          { id: "preview", label: "Preview quote", tone: "gold", icon: "FileText" },
        ]}
        respond={(sid) => {
          if (sid === "summary") return [{ id: newId(), role: "agent", kind: "text", ts: now(),
            text: `Quote in progress: ${selectedIds.length} line${selectedIds.length === 1 ? "" : "s"}, total ${"$" + Math.round(totalPremium).toLocaleString()}. Status: ${quoteStatus}. ${selectedIds.length === 0 ? "Add products to begin." : ""}` }];
          if (sid === "authority") {
            const above750 = totalPremium > 750_000;
            return [{ id: newId(), role: "agent", kind: "text", ts: now(),
              text: above750
                ? `Heads up: total premium ${"$" + Math.round(totalPremium).toLocaleString()} crosses the $750K referral trigger. I can route to Robert Chen (Director of UW) with a one-line rationale.`
                : `No authority triggers fired at this premium level (${"$" + Math.round(totalPremium).toLocaleString()}). Standard authority covers it — keep going.` }];
          }
          if (sid === "validate") return [{ id: newId(), role: "agent", kind: "text", ts: now(),
            text: `Factors per line live inside each product card. UE's standard band is roughly 0.85×–1.30×; anything > 1.20× usually needs a rationale memo. Want me to scan the active option?` }];
        }}
        freeText={(text) => {
          const t = text.toLowerCase();
          if (/\b(total|premium|how much|price)\b/.test(t)) {
            return [{ id: newId(), role: "agent", kind: "text", ts: now(),
              text: `Current total: ${"$" + Math.round(totalPremium).toLocaleString()} across ${selectedIds.length} line${selectedIds.length === 1 ? "" : "s"}.` }];
          }
          if (/\b(send|issue|broker|email)\b/.test(t)) {
            return [{ id: newId(), role: "agent", kind: "text", ts: now(),
              text: `When you're ready to send, use the broker dialog at the top right. I'll draft the email if you tap "Draft indication letter".` }];
          }
        }}
        facts={() => [
          `Quote Builder · submission ${id ?? "—"}`,
          `Selected products: ${selectedIds.length} (${selectedIds.join(", ") || "none"})`,
          `Total premium: $${Math.round(totalPremium).toLocaleString()}`,
          `Quote status: ${quoteStatus}${brokerSend ? ` · sent to ${brokerSend.brokerName}` : ""}`,
        ].join("\n")}
      />
      <div style={{fontFamily:font,color:TD,minHeight:"100%",background:BG}}>

        {/* Modal */}
        {showSendModal && (
          <SendToBrokerModal
            totalPremium={totalPremium}
            onSend={handleSend}
            onClose={()=>setShowSendModal(false)}
          />
        )}

        {/* ── HEADER ────────────────────────────────────────────────────────── */}
        <div style={{height:4,background:`linear-gradient(90deg,${G} 0%,${GD} 100%)`}}/>
        <div className="flex items-center justify-between px-8 py-4"
          style={{background:N,borderBottom:"1px solid rgba(255,255,255,0.1)"}}>
          <div className="flex items-center gap-4">
            <button onClick={()=>navigate("/submission/"+id+"?tab=rating")}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              style={{fontSize:"0.78rem",color:"rgba(255,255,255,0.65)",fontWeight:500,borderRadius:6}}>
              <ArrowLeft size={14}/> Back to Underwriting
            </button>
            <span style={{color:"rgba(255,255,255,0.2)"}}>|</span>
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center"
                style={{width:30,height:30,background:"rgba(201,162,39,0.18)",border:`1px solid ${G}44`}}>
                <GraduationCap size={16} color={G}/>
              </div>
              <div>
                <p style={{fontSize:"0.90rem",fontWeight:700,color:"white",lineHeight:1.2}}>Riverside Unified School District</p>
                <p style={{fontSize:"0.68rem",color:"rgba(255,255,255,0.45)"}}>
                  {id} &nbsp;·&nbsp; Gallagher Education, Inc. &nbsp;·&nbsp; Riverside, CA
                </p>
              </div>
            </div>
          </div>

          {/* Stepper */}
          <div className="flex items-center gap-0">
            {["Select Products","Configure Coverage","Review & Issue"].map((step,i)=>{
              const active=i===1; const done=i===0;
              return (
                <div key={step} className="flex items-center">
                  <div className="flex items-center gap-2 px-4 py-1.5"
                    style={{background:active?G:done?"rgba(201,162,39,0.2)":"rgba(255,255,255,0.08)",border:`1px solid ${active?GD:done?G+"44":"rgba(255,255,255,0.12)"}`}}>
                    <div className="flex items-center justify-center"
                      style={{width:18,height:18,background:active?N:done?G:"rgba(255,255,255,0.15)",borderRadius:"50%"}}>
                      {done?<CheckCircle2 size={11} color="white" strokeWidth={3}/>
                           :<span style={{fontSize:"0.60rem",fontWeight:800,color:"white"}}>{i+1}</span>}
                    </div>
                    <span style={{fontSize:"0.68rem",fontWeight:active?700:500,color:active?N:done?G:"rgba(255,255,255,0.5)"}}>{step}</span>
                  </div>
                  {i<2 && <ChevronRight size={12} color="rgba(255,255,255,0.25)"/>}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── NEGOTIATION BANNER ─────────────────────────────────────────────── */}
        {brokerSend && (quoteStatus==="sent"||quoteStatus==="negotiating") && (
          <div className="pt-4">
            <NegotiationBanner
              brokerSend={brokerSend}
              quoteStatus={quoteStatus}
              onOpenNegotiation={handleOpenNegotiation}
              onEditQuote={handleEditQuote}
            />
          </div>
        )}

        {/* ── BODY ──────────────────────────────────────────────────────────── */}
        <div className="flex" style={{minHeight:"calc(100vh - 157px)"}}>

          {/* LEFT: Product selector */}
          <aside style={{width:272,minWidth:272,background:"white",borderRight:`1px solid ${BDL}`,display:"flex",flexDirection:"column"}}>
            <div className="px-5 py-4" style={{borderBottom:`1px solid ${BDL}`,background:TH}}>
              <p style={{fontSize:"0.65rem",fontWeight:700,color:TT,textTransform:"uppercase",letterSpacing:"0.09em"}}>UE Product Lines</p>
              <p style={{fontSize:"0.70rem",color:TM,marginTop:3}}>
                {isLocked?"Quote locked — view only":"Select coverage lines for this submission"}
              </p>
            </div>
            <div style={{flex:1,overflowY:"auto"}}>
              {CATEGORIES.map(cat=>(
                <div key={cat}>
                  <div className="px-5 py-2" style={{background:"#F8FAFC",borderBottom:`1px solid ${BDL}`,borderTop:`1px solid ${BDL}`}}>
                    <span style={{fontSize:"0.57rem",fontWeight:800,color:TT,textTransform:"uppercase",letterSpacing:"0.1em"}}>{cat}</span>
                  </div>
                  {PRODUCTS.filter(p=>p.category===cat).map(product=>{
                    const isSel    = selectedIds.includes(product.id);
                    const isActive = activeProductId===product.id;
                    const state    = productStates[product.id];
                    const activeOpt= state ? state.options.find(o=>o.id===state.activeOptionId) : null;
                    const prem     = activeOpt ? calcOptionPremium(activeOpt) : product.basePremium;
                    const optCount = state?.options.length ?? 0;
                    return (
                      <div key={product.id} className="transition-all cursor-pointer"
                        style={{borderBottom:`1px solid ${BDL}`,background:isActive?`${N}0C`:"white",borderLeft:`3px solid ${isActive?N:"transparent"}`}}>
                        <div className="flex items-start gap-3 px-4 py-3"
                          onClick={()=>{if(!isSel)toggleProduct(product.id);else setActiveProductId(product.id);}}>
                          <div onClick={e=>{e.stopPropagation();toggleProduct(product.id);}}
                            className="flex items-center justify-center shrink-0 mt-0.5"
                            style={{width:17,height:17,background:isSel?N:"white",border:`2px solid ${isSel?N:BD}`,cursor:isLocked?"default":"pointer",transition:"all 0.15s"}}>
                            {isSel && <CheckCircle2 size={11} color="white" strokeWidth={3}/>}
                          </div>
                          <div className="flex items-center justify-center shrink-0"
                            style={{width:28,height:28,background:isSel?`${N}14`:"#F0F3F8",color:isSel?N:TT,border:`1px solid ${isSel?N+"30":BDL}`}}>
                            {product.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <p style={{fontSize:"0.76rem",fontWeight:isSel?700:500,color:isSel?N:TD,lineHeight:1.3}}>{product.label}</p>
                              <span style={{fontSize:"0.54rem",fontWeight:700,background:isSel?N:TH,color:isSel?"white":TT,border:`1px solid ${isSel?N:BDL}`,padding:"0 5px"}}>{product.abbr}</span>
                            </div>
                            {isSel && (
                              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                <div className="flex items-center gap-1">
                                  <DollarSign size={10} color="#2E7D32"/>
                                  <span style={{fontSize:"0.68rem",fontWeight:700,color:"#2E7D32"}}>{fmt(prem)}</span>
                                </div>
                                {optCount>1 && <span style={{fontSize:"0.60rem",color:TT}}>· {optCount} options</span>}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
            <div className="px-5 py-3" style={{borderTop:`1px solid ${BDL}`,background:TH}}>
              <div className="flex items-center justify-between">
                <span style={{fontSize:"0.68rem",color:TT}}>
                  <span style={{fontWeight:700,color:N}}>{selectedIds.length}</span> of {PRODUCTS.length} selected
                </span>
                {selectedIds.length>0 && !isLocked && (
                  <button onClick={()=>{setSelectedIds([]);setActiveProductId(null);}}
                    className="flex items-center gap-1 hover:opacity-70 transition-opacity"
                    style={{fontSize:"0.65rem",color:"#B91C1C",fontWeight:600,borderRadius:6}}>
                    <X size={10}/> Clear
                  </button>
                )}
              </div>
            </div>
          </aside>

          {/* RIGHT: Editor */}
          <div style={{flex:1,minWidth:0,overflowY:"auto",background:BG}}>
            {selectedIds.length===0 ? (
              <div className="flex flex-col items-center justify-center" style={{minHeight:480,gap:12}}>
                <div className="flex items-center justify-center" style={{width:64,height:64,background:TH,border:`1px solid ${BDL}`}}>
                  <ShieldCheck size={28} color={BD}/>
                </div>
                <p style={{fontSize:"1rem",fontWeight:700,color:TM}}>No products selected</p>
                <p style={{fontSize:"0.80rem",color:TT,maxWidth:320,textAlign:"center",lineHeight:1.6}}>
                  Select one or more product lines from the panel on the left to configure coverage, endorsements, and premium.
                </p>
              </div>
            ) : !activeProduct||!activeState||!activeOption ? (
              <div className="flex flex-col items-center justify-center" style={{minHeight:480}}>
                <p style={{fontSize:"0.80rem",color:TT}}>Click a product on the left to configure it.</p>
              </div>
            ) : (
              <div>
                {/* Product editor header */}
                <div className="px-8 pt-6 pb-4" style={{background:"white",borderBottom:`1px solid ${BDL}`}}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center" style={{width:38,height:38,background:`${N}14`,border:`1px solid ${N}30`,color:N}}>
                        {activeProduct.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2 style={{fontSize:"1.05rem",fontWeight:700,color:N}}>{activeProduct.label}</h2>
                          <span style={{fontSize:"0.60rem",fontWeight:700,background:N,color:"white",padding:"1px 8px"}}>{activeProduct.abbr}</span>
                          <span style={{fontSize:"0.60rem",fontWeight:600,background:"#E8F5EC",color:"#1A5C30",border:"1px solid #93C8A0",padding:"1px 8px"}}>{activeProduct.category}</span>
                          {isLocked && (
                            <span style={{fontSize:"0.60rem",fontWeight:700,background:"#FFF8E6",color:"#8A5C00",border:"1px solid #F0D88A",padding:"1px 8px",display:"flex",alignItems:"center",gap:3}}>
                              <Lock size={9}/> {quoteStatus==="sent"?"Sent":"Negotiating"}
                            </span>
                          )}
                        </div>
                        <p style={{fontSize:"0.72rem",color:TT,marginTop:3}}>{activeProduct.desc}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span style={{fontSize:"0.58rem",fontWeight:700,color:TT,textTransform:"uppercase",letterSpacing:"0.09em"}}>{activeOption.name} Premium</span>
                      <span style={{fontSize:"1.60rem",fontWeight:800,color:N,letterSpacing:"-0.01em",lineHeight:1.2}}>
                        {fmt(calcOptionPremium(activeOption))}
                      </span>
                    </div>
                  </div>

                  {/* Option tabs */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span style={{fontSize:"0.62rem",fontWeight:700,color:TT,textTransform:"uppercase",letterSpacing:"0.09em",marginRight:4}}>Options:</span>
                    {activeState.options.map((opt,oi)=>{
                      const isActive=opt.id===activeState.activeOptionId;
                      const color=OPTION_COLORS[oi]??N;
                      return (
                        <div key={opt.id} className="flex items-center">
                          <button onClick={()=>setActiveOption(activeProductId!,opt.id)}
                            className="flex items-center gap-2 px-3 py-1.5 transition-all"
                            style={{background:isActive?color:"white",border:`1.5px solid ${isActive?color:BD}`,color:isActive?"white":TM,fontSize:"0.76rem",fontWeight:isActive?700:500,borderRadius:6}}>
                            <span style={{width:8,height:8,borderRadius:"50%",background:isActive?"rgba(255,255,255,0.6)":color,display:"inline-block",flexShrink:0}}/>
                            {opt.name}
                            <span style={{fontSize:"0.60rem",fontWeight:700,background:isActive?"rgba(255,255,255,0.2)":`${color}18`,color:isActive?"white":color,padding:"0 5px",borderRadius:8}}>
                              {fmt(calcOptionPremium(opt))}
                            </span>
                          </button>
                          {activeState.options.length>1 && !isLocked && (
                            <button onClick={()=>removeOption(activeProductId!,opt.id)}
                              className="flex items-center justify-center hover:opacity-80"
                              style={{width:16,height:16,background:"#FBEAEA",border:"1px solid #E8A8A8",marginLeft:2,borderRadius:6}}>
                              <X size={8} color="#B91C1C"/>
                            </button>
                          )}
                        </div>
                      );
                    })}
                    {activeState.options.length<4 && !isLocked && (
                      <>
                        <button onClick={()=>addOption(activeProductId!)}
                          className="flex items-center gap-1.5 px-3 py-1.5 transition-all hover:brightness-95"
                          style={{border:`1.5px dashed ${BD}`,background:TH,fontSize:"0.72rem",fontWeight:600,color:TM,borderRadius:6}}>
                          <Plus size={11}/> New Option
                        </button>
                        <button onClick={()=>duplicateOption(activeProductId!,activeState.activeOptionId)}
                          className="flex items-center gap-1.5 px-3 py-1.5 transition-all hover:brightness-95"
                          style={{border:`1.5px solid ${BDL}`,background:"white",fontSize:"0.72rem",fontWeight:600,color:TM,borderRadius:6}}>
                          <Copy size={11}/> Duplicate
                        </button>
                      </>
                    )}
                    {activeState.options.length>1 && (
                      <div className="flex items-center gap-1.5 ml-auto">
                        <ChevronDown size={11} color={TT}/>
                        <span style={{fontSize:"0.62rem",color:TT}}>
                          {activeState.options.length} options · {fmt(Math.min(...activeState.options.map(calcOptionPremium)))} – {fmt(Math.max(...activeState.options.map(calcOptionPremium)))}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Sub-tabs */}
                <div style={{background:"white",borderBottom:`1px solid ${BD}`,display:"flex"}}>
                  {(["policy","endorsements","premium"] as SubTab[]).map(tab=>{
                    const labels:Record<SubTab,string>={policy:"Policy & Coverage",endorsements:"Endorsements",premium:"Premium"};
                    const icons:Record<SubTab,React.ReactNode>={policy:<ShieldCheck size={13}/>,endorsements:<Plus size={13}/>,premium:<DollarSign size={13}/>};
                    const isActive=activeOption.subTab===tab;
                    const endoBadge=tab==="endorsements"&&activeOption.endorsements.filter(e=>e.included).length>0;
                    const covCount=activeOption.coverageItems.filter(c=>c.checked).length;
                    return (
                      <button key={tab}
                        onClick={()=>updateOption(activeProductId!,activeOption.id,{subTab:tab})}
                        className="relative flex items-center gap-2 px-5 py-3 transition-all whitespace-nowrap"
                        style={{fontSize:"0.80rem",fontWeight:isActive?700:400,color:isActive?N:TM,background:isActive?"white":"transparent",border:"none",outline:"none",borderRadius:6}}>
                        <span style={{color:isActive?N:TT}}>{icons[tab]}</span>
                        {labels[tab]}
                        {endoBadge && (
                          <span style={{fontSize:"0.55rem",fontWeight:800,background:N,color:"white",borderRadius:10,padding:"1px 6px"}}>
                            {activeOption.endorsements.filter(e=>e.included).length}
                          </span>
                        )}
                        {tab==="policy" && covCount>0 && (
                          <span style={{fontSize:"0.55rem",fontWeight:800,background:"#E8F5EC",color:"#1A5C30",border:"1px solid #93C8A0",borderRadius:10,padding:"1px 6px"}}>
                            {covCount}
                          </span>
                        )}
                        {isActive && <span style={{position:"absolute",bottom:0,left:0,right:0,height:3,background:G,pointerEvents:"none"}}/>}
                      </button>
                    );
                  })}
                </div>

                {/* Tab content */}
                <div className="px-8 py-6">
                  {activeOption.subTab==="policy"       && renderPolicyTab(activeProductId!,activeOption)}
                  {activeOption.subTab==="endorsements" && renderEndorsementsTab(activeProductId!,activeOption)}
                  {activeOption.subTab==="premium"      && renderPremiumTab(activeProductId!,activeOption)}
                </div>

                {/* Comparison table */}
                {activeState.options.length>1 && (
                  <div className="px-8 pb-8">
                    <div style={{border:`1px solid ${BDL}`,borderRadius:8,background:"white",overflow:"hidden"}}>
                      <div className="px-5 py-3" style={{background:TH,borderBottom:`1px solid ${BDL}`}}>
                        <p style={{fontSize:"0.62rem",fontWeight:700,color:TT,textTransform:"uppercase",letterSpacing:"0.09em"}}>Option Comparison</p>
                      </div>
                      <div className="overflow-x-auto">
                        <table style={{width:"100%",borderCollapse:"collapse"}}>
                          <thead>
                            <tr style={{borderBottom:`1px solid ${BDL}`}}>
                              <th style={{padding:"10px 16px",textAlign:"left",fontSize:"0.65rem",fontWeight:700,color:TT,textTransform:"uppercase",letterSpacing:"0.08em",width:200}}>Item</th>
                              {activeState.options.map((opt,oi)=>(
                                <th key={opt.id} style={{padding:"10px 16px",textAlign:"right",fontSize:"0.65rem",fontWeight:700,color:OPTION_COLORS[oi]??N,textTransform:"uppercase",letterSpacing:"0.08em"}}>
                                  {opt.name}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {[
                              {label:"Base Premium",       fn:(o:QuoteOption)=>fmt(o.basePremium),              bg:"#F9FAFB"},
                              {label:"Coverage Surcharges",fn:(o:QuoteOption)=>"+"+fmt(o.coverageItems.filter(c=>c.checked&&!c.required).reduce((a,c)=>a+c.price,0)), bg:"white"},
                              {label:"Endorsements",       fn:(o:QuoteOption)=>"+"+fmt(o.endorsements.filter(e=>e.included).reduce((a,e)=>a+e.premium,0)), bg:"#F9FAFB"},
                              {label:"Coverages Selected", fn:(o:QuoteOption)=>`${o.coverageItems.filter(c=>c.checked).length} / ${o.coverageItems.length}`, bg:"white"},
                              {label:"Rate Adjustment",    fn:(o:QuoteOption)=>`${o.adjustmentPct>0?"+":""}${o.adjustmentPct}%`, bg:"#F9FAFB"},
                            ].map((row,i)=>(
                              <tr key={i} style={{borderBottom:`1px solid ${BDL}`,background:row.bg}}>
                                <td style={{padding:"9px 16px",fontSize:"0.75rem",color:TM,fontWeight:600}}>{row.label}</td>
                                {activeState.options.map(opt=>(
                                  <td key={opt.id} style={{padding:"9px 16px",fontSize:"0.75rem",color:TD,fontWeight:500,textAlign:"right"}}>{row.fn(opt)}</td>
                                ))}
                              </tr>
                            ))}
                            <tr style={{background:`${N}07`}}>
                              <td style={{padding:"11px 16px",fontSize:"0.80rem",color:N,fontWeight:800}}>Final Premium</td>
                              {activeState.options.map((opt,oi)=>(
                                <td key={opt.id} style={{padding:"11px 16px",fontSize:"0.90rem",fontWeight:800,color:OPTION_COLORS[oi]??N,textAlign:"right"}}>
                                  {fmt(calcOptionPremium(opt))}
                                </td>
                              ))}
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* Product switcher */}
                {selectedIds.length>1 && (
                  <div className="flex items-center gap-1.5 px-8 pb-6 flex-wrap">
                    <span style={{fontSize:"0.62rem",color:TT,fontWeight:600,textTransform:"uppercase",letterSpacing:"0.08em",marginRight:4}}>Products:</span>
                    {selectedIds.map(pid=>{
                      const p=PRODUCTS.find(x=>x.id===pid)!;
                      const state=productStates[pid];
                      const opt=state?.options.find(o=>o.id===state.activeOptionId);
                      return (
                        <button key={pid} onClick={()=>setActiveProductId(pid)}
                          className="flex items-center gap-1.5 px-3 py-1.5 transition-all"
                          style={{fontSize:"0.68rem",fontWeight:700,background:pid===activeProductId?N:"white",color:pid===activeProductId?"white":TM,border:`1px solid ${pid===activeProductId?N:BD}`,borderRadius:6}}>
                          {p.abbr}
                          {opt && <span style={{color:pid===activeProductId?"rgba(255,255,255,0.65)":TT,fontWeight:400}}>{fmt(calcOptionPremium(opt))}</span>}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── BOTTOM ACTION BAR ─────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-8 py-4"
          style={{background:"white",borderTop:`2px solid ${BDL}`,position:"sticky",bottom:0,zIndex:20}}>
          <div className="flex items-center gap-6">
            <div>
              <p style={{fontSize:"0.60rem",fontWeight:700,color:TT,textTransform:"uppercase",letterSpacing:"0.09em"}}>Lines Selected</p>
              <p style={{fontSize:"1.10rem",fontWeight:800,color:N}}>{selectedIds.length} Product{selectedIds.length!==1?"s":""}</p>
            </div>
            <div style={{width:1,height:36,background:BDL}}/>
            <div>
              <p style={{fontSize:"0.60rem",fontWeight:700,color:TT,textTransform:"uppercase",letterSpacing:"0.09em"}}>Total Premium</p>
              <p style={{fontSize:"1.50rem",fontWeight:800,color:N,letterSpacing:"-0.02em",lineHeight:1.2}}>{fmt(totalPremium)}</p>
            </div>
            {selectedIds.length>0 && (
              <>
                <div style={{width:1,height:36,background:BDL}}/>
                <div className="flex items-center gap-2 flex-wrap">
                  {selectedIds.map(pid=>{
                    const p=PRODUCTS.find(x=>x.id===pid)!;
                    const state=productStates[pid];
                    const opt=state?.options.find(o=>o.id===state.activeOptionId);
                    const optCount=state?.options.length??0;
                    return (
                      <div key={pid} className="flex items-center gap-1 px-2 py-1"
                        style={{background:`${N}0C`,border:`1px solid ${N}25`,fontSize:"0.60rem",fontWeight:700,color:N}}>
                        {p.abbr}
                        {opt && <span style={{color:TT,fontWeight:400}}>{fmt(calcOptionPremium(opt))}</span>}
                        {optCount>1 && <span style={{color:G,fontWeight:700}}>×{optCount}</span>}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
            {selectedIds.length===0 && (
              <div className="flex items-center gap-1.5 mr-2">
                <AlertCircle size={13} color="#B45309"/>
                <span style={{fontSize:"0.70rem",color:"#B45309"}}>Select at least one product line</span>
              </div>
            )}
            <button onClick={()=>navigate("/submission/"+id)}
              className="px-5 py-2.5 transition-colors hover:bg-slate-50"
              style={{border:`1px solid ${BD}`,fontSize:"0.80rem",fontWeight:600,color:TM,borderRadius:6}}>
              Cancel
            </button>

            {/* Locked state: show edit quote */}
            {quoteStatus==="negotiating" && (
              <button onClick={handleEditQuote}
                className="flex items-center gap-2 px-6 py-2.5 transition-all hover:brightness-95 active:scale-95"
                style={{background:G,color:"white",fontSize:"0.80rem",fontWeight:700,boxShadow:"0 2px 8px rgba(201,162,39,0.35)",borderRadius:6}}>
                <Edit3 size={14}/> Edit Quote
              </button>
            )}

            {/* Sent state: waiting */}
            {quoteStatus==="sent" && (
              <div className="flex items-center gap-2 px-5 py-2.5"
                style={{background:"#E8F0F9",border:"1px solid #9ABCD6",color:"#00427A",fontSize:"0.80rem",fontWeight:700}}>
                <Clock size={14}/> Awaiting Broker Response
              </div>
            )}

            {/* Draft / Issued state */}
            {(quoteStatus==="draft"||quoteStatus==="issued") && (
              <>
                {/* Issue Quote */}
                <button
                  onClick={handleIssueQuote}
                  disabled={selectedIds.length===0}
                  className="flex items-center gap-2 px-6 py-2.5 transition-all hover:brightness-95 active:scale-95"
                  style={{background:selectedIds.length>0?G:"#E5DFC0",color:selectedIds.length>0?"white":"#A09060",fontSize:"0.80rem",fontWeight:700,boxShadow:selectedIds.length>0?"0 2px 8px rgba(201,162,39,0.35)":"none",cursor:selectedIds.length>0?"pointer":"not-allowed",borderRadius:6}}>
                  {issued?<><CheckCircle2 size={14} color="#2E7D32"/> Quote Issued!</>:<><FileText size={14}/> Issue Quote</>}
                </button>

                {/* Send to Broker — only after issuing */}
                {quoteStatus==="issued" && (
                  <button
                    onClick={()=>setShowSendModal(true)}
                    disabled={selectedIds.length===0}
                    className="flex items-center gap-2 px-6 py-2.5 transition-all hover:brightness-95 active:scale-95"
                    style={{background:N,color:"white",fontSize:"0.80rem",fontWeight:700,boxShadow:"0 2px 8px rgba(1,35,212,0.30)",cursor:selectedIds.length>0?"pointer":"not-allowed",borderRadius:6}}>
                    <Send size={14}/> Send to Broker
                  </button>
                )}

                {/* Bind Quote */}
                {quoteStatus==="draft" && (
                  <button
                    onClick={()=>navigate(`/submission/${id}/bind`)}
                    disabled={selectedIds.length===0}
                    className="flex items-center gap-2 px-6 py-2.5 transition-all hover:brightness-95 active:scale-95"
                    style={{background:selectedIds.length>0?N:"#B0BEC5",color:"white",fontSize:"0.80rem",fontWeight:700,boxShadow:selectedIds.length>0?"0 2px 8px rgba(1,35,212,0.30)":"none",cursor:selectedIds.length>0?"pointer":"not-allowed",borderRadius:6}}>
                    <ClipboardCheck size={14}/> Bind Quote
                  </button>
                )}
              </>
            )}
          </div>
        </div>

      </div>
    </AppShell>
  );
}
