import { useState, useEffect, useRef } from "react";
import {
  X, Plus, RefreshCw, ChevronDown, Check,
  Building2, Hash, Calendar, Layers, ArrowRight,
  BookOpen, Repeat2, TrendingUp,
} from "lucide-react";

// ── Design tokens ──────────────────────────────────────────────────────────────
const N    = "#0123D4";
const G    = "#C9A227";
const BDL  = "#DCE3EC";
const BD   = "#C4CDD8";
const TT   = "#7A8FA3";
const TM   = "#4A5D6E";
const TD   = "#1A2530";
const font = "'Source Sans 3', system-ui, sans-serif";

// ── Account lookup (account number → name) ─────────────────────────────────────
const ACCOUNT_LOOKUP: Record<string, string> = {
  "1001": "Riverside Unified School District",
  "1002": "San Diego City Unified SD",
  "1003": "Austin Independent School District",
  "1004": "Denver Public Schools",
  "1005": "Seattle Public Schools",
  "1006": "Houston Independent School District",
  "1007": "Minneapolis Public Schools",
  "1008": "Charlotte-Mecklenburg Schools",
  "1009": "Clark County School District",
  "1010": "Broward County Public Schools",
  "1011": "Fairfax County Public Schools",
  "1012": "Wake County Public School System",
  "1013": "Gwinnett County Public Schools",
  "1014": "Montgomery County Public Schools",
  "1015": "Palm Beach County School District",
  "1016": "Jefferson County Public Schools",
  "1017": "Hillsborough County Public Schools",
  "1018": "Orange County Public Schools",
  "2001": "University of California, Davis",
  "2002": "Georgetown University",
  "2003": "Portland State University",
  "2004": "Horizon Academy Network",
  "2005": "Pacific Northwest University Consortium",
};

// ── Stage groups ───────────────────────────────────────────────────────────────
export const STAGE_GROUPS = [
  {
    group: "Intake & Triage",
    color: "#7A8FA3",
    options: [
      "Incomplete Submission",
      "Complete Submission",
      "Declined to Quote",
    ],
  },
  {
    group: "Underwriting",
    color: N,
    options: [
      "Information Gathering",
      "Review In Progress",
      "Referred",
    ],
  },
  {
    group: "Quoting",
    color: "#7B2FBE",
    options: [
      "Quote In Progress",
      "Quote Sent",
      "Quote Negotiation",
      "Revised Quote",
    ],
  },
  {
    group: "Decision",
    color: "#1A7A4A",
    options: [
      "Bound",
      "UE Non-Renewed",
      "Member Declined",
      "Member No Response",
    ],
  },
  {
    group: "Post-Bind",
    color: G,
    options: [
      "Pending Issuance",
      "Issued",
      "Cancelled",
      "Endorsed",
    ],
  },
];

const ALL_STAGES = STAGE_GROUPS.flatMap(g => g.options);

// ── Submission types ───────────────────────────────────────────────────────────
type SubmissionType = "New Business" | "Cross-Sell" | "Renewal";

const SUB_TYPES: { id: SubmissionType; label: string; icon: React.ReactNode; desc: string }[] = [
  {
    id: "New Business",
    label: "New Business",
    icon: <Plus size={16} />,
    desc: "First-time submission from a new member account",
  },
  {
    id: "Cross-Sell",
    label: "Cross-Sell",
    icon: <TrendingUp size={16} />,
    desc: "Additional lines of coverage for an existing member",
  },
  {
    id: "Renewal",
    label: "Renewal",
    icon: <Repeat2 size={16} />,
    desc: "Renewal of an existing policy for a current member",
  },
];

// ── Form data shape ────────────────────────────────────────────────────────────
interface FormData {
  submissionType: SubmissionType;
  accountNumber: string;
  accountName: string;
  needByDate: string;
  effectiveDate: string;
  expirationDate: string;
  stage: string;
}

const EMPTY_FORM: FormData = {
  submissionType: "New Business",
  accountNumber: "",
  accountName: "",
  needByDate: "",
  effectiveDate: "",
  expirationDate: "",
  stage: "Incomplete Submission",
};

// ── Helpers ────────────────────────────────────────────────────────────────────
function stageColor(stage: string) {
  const group = STAGE_GROUPS.find(g => g.options.includes(stage));
  return group?.color ?? TT;
}

function groupForStage(stage: string) {
  return STAGE_GROUPS.find(g => g.options.includes(stage))?.group ?? "";
}

// ── Sub-components ─────────────────────────────────────────────────────────────
function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label style={{
      display: "block", fontSize: "0.64rem", fontWeight: 700, color: TT,
      textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6,
    }}>
      {children}
      {required && <span style={{ color: "#B91C1C", marginLeft: 3 }}>*</span>}
    </label>
  );
}

function TextInput({
  value, onChange, placeholder, type = "text", readOnly, icon,
}: {
  value: string; onChange?: (v: string) => void;
  placeholder?: string; type?: string;
  readOnly?: boolean; icon?: React.ReactNode;
}) {
  return (
    <div style={{ position: "relative" }}>
      {icon && (
        <div style={{
          position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)",
          color: TT, pointerEvents: "none",
        }}>
          {icon}
        </div>
      )}
      <input
        type={type}
        value={value}
        readOnly={readOnly}
        onChange={e => onChange?.(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%", boxSizing: "border-box",
          paddingLeft: icon ? 34 : 11, paddingRight: 11,
          paddingTop: 9, paddingBottom: 9,
          border: `1px solid ${readOnly ? BDL : BD}`,
          borderRadius: 6,
          background: readOnly ? "#F4F6FA" : "white",
          color: readOnly ? TT : TD,
          fontSize: "0.80rem", fontFamily: font, outline: "none",
          transition: "border-color 0.15s",
          cursor: readOnly ? "default" : "text",
        }}
        onFocus={e => { if (!readOnly) e.currentTarget.style.borderColor = N; }}
        onBlur={e => { e.currentTarget.style.borderColor = readOnly ? BDL : BD; }}
      />
    </div>
  );
}

// Custom grouped stage dropdown
function StageDropdown({
  value, onChange,
}: {
  value: string; onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const color = stageColor(value);
  const group = groupForStage(value);

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
          background: "white", cursor: "pointer", fontFamily: font,
          textAlign: "left", borderRadius: 6,
        }}
      >
        <span style={{
          width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0,
        }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: "0.62rem", color: TT, display: "block", lineHeight: 1 }}>{group}</span>
          <span style={{ fontSize: "0.80rem", color: TD, fontWeight: 600 }}>{value}</span>
        </div>
        <ChevronDown
          size={14}
          color={TT}
          style={{ flexShrink: 0, transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.15s" }}
        />
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 2px)", left: 0, right: 0,
          background: "white", border: `1px solid ${BD}`, borderRadius: 6,
          boxShadow: "0 8px 24px rgba(0,0,0,0.12)", zIndex: 200,
          maxHeight: 340, overflowY: "auto",
        }}>
          {STAGE_GROUPS.map(g => (
            <div key={g.group}>
              {/* Group header */}
              <div style={{
                padding: "7px 12px 4px",
                background: "#F8FAFC",
                borderBottom: `1px solid ${BDL}`,
                borderTop: `1px solid ${BDL}`,
              }}>
                <span style={{
                  fontSize: "0.58rem", fontWeight: 800, color: g.color,
                  textTransform: "uppercase", letterSpacing: "0.08em",
                }}>
                  {g.group}
                </span>
              </div>
              {/* Options */}
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
                    borderRadius: 6,
                  }}
                  onMouseEnter={e => { if (value !== opt) e.currentTarget.style.background = "#F4F6FA"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = value === opt ? `${g.color}10` : "transparent"; }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: g.color, flexShrink: 0 }} />
                  <span style={{ fontSize: "0.78rem", color: value === opt ? g.color : TM, fontWeight: value === opt ? 700 : 400 }}>
                    {opt}
                  </span>
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

// ── Main modal component ───────────────────────────────────────────────────────
interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => void;
}

export function CreateSubmissionModal({ isOpen, onClose, onSubmit }: Props) {
  const [form, setForm]         = useState<FormData>(EMPTY_FORM);
  const [acctError, setAcctError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors]     = useState<Partial<Record<keyof FormData, string>>>({});

  // Auto-populate account name when account number changes
  useEffect(() => {
    const num = form.accountNumber.trim();
    if (num === "") {
      setForm(f => ({ ...f, accountName: "" }));
      setAcctError("");
      return;
    }
    if (!/^\d+$/.test(num)) {
      setAcctError("Account number must be numeric.");
      setForm(f => ({ ...f, accountName: "" }));
      return;
    }
    const name = ACCOUNT_LOOKUP[num];
    if (name) {
      setForm(f => ({ ...f, accountName: name }));
      setAcctError("");
    } else {
      setForm(f => ({ ...f, accountName: "" }));
      setAcctError("No account found for this number.");
    }
  }, [form.accountNumber]);

  // Auto-set expiration = effective + 1 year
  useEffect(() => {
    if (form.effectiveDate) {
      const d = new Date(form.effectiveDate);
      d.setFullYear(d.getFullYear() + 1);
      const yyyy = d.getFullYear();
      const mm   = String(d.getMonth() + 1).padStart(2, "0");
      const dd   = String(d.getDate()).padStart(2, "0");
      setForm(f => ({ ...f, expirationDate: `${yyyy}-${mm}-${dd}` }));
    }
  }, [form.effectiveDate]);

  const set = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm(f => ({ ...f, [key]: value }));
    if (errors[key]) setErrors(e => ({ ...e, [key]: undefined }));
  };

  const validate = () => {
    const e: Partial<Record<keyof FormData, string>> = {};
    if (!form.accountNumber.trim()) e.accountNumber = "Required";
    if (!form.accountName)          e.accountName   = "Must resolve to a valid account";
    if (!form.needByDate)           e.needByDate    = "Required";
    if (!form.effectiveDate)        e.effectiveDate = "Required";
    if (!form.expirationDate)       e.expirationDate = "Required";
    return e;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setSubmitted(true);
    setTimeout(() => {
      onSubmit(form);
      setForm(EMPTY_FORM);
      setSubmitted(false);
      setErrors({});
    }, 800);
  };

  const handleClose = () => {
    setForm(EMPTY_FORM);
    setErrors({});
    setSubmitted(false);
    onClose();
  };

  if (!isOpen) return null;

  const typeColor = (id: SubmissionType) =>
    id === "New Business" ? N : id === "Cross-Sell" ? "#7B2FBE" : "#1A7A4A";

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={handleClose}
        style={{
          position: "fixed", inset: 0, background: "rgba(10,18,30,0.55)",
          zIndex: 900, backdropFilter: "blur(2px)",
        }}
      />

      {/* Modal */}
      <div style={{
        position: "fixed", top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        width: "min(680px, calc(100vw - 48px))",
        maxHeight: "calc(100vh - 64px)",
        background: "white",
        borderRadius: 8, overflow: "hidden",
        display: "flex", flexDirection: "column",
        zIndex: 901, fontFamily: font, overflowY: "auto",
      }}>

        {/* ── Modal header ──────────────────────────────────────────────── */}
        <div style={{ height: 4, background: `linear-gradient(90deg, ${G} 0%, #A8841C 100%)` }} />
        <div style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "16px 24px",
          borderBottom: `1px solid ${BDL}`,
          background: N,
          flexShrink: 0,
        }}>
          <div style={{
            width: 34, height: 34, background: "rgba(201,162,39,0.18)",
            border: `1.5px solid ${G}55`,
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <Plus size={16} color={G} />
          </div>
          <div>
            <h2 style={{ fontSize: "1.0rem", fontWeight: 800, color: "white", lineHeight: 1.2 }}>
              Create New Submission
            </h2>
            <p style={{ fontSize: "0.70rem", color: "rgba(255,255,255,0.50)", marginTop: 2 }}>
              Manually enter submission details to initiate the underwriting process
            </p>
          </div>
          <button
            onClick={handleClose}
            style={{
              marginLeft: "auto", width: 28, height: 28,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.20)",
              cursor: "pointer", color: "white",
              borderRadius: 6,
            }}
          >
            <X size={14} />
          </button>
        </div>

        {/* ── Form body ─────────────────────────────────────────────────── */}
        <form onSubmit={handleSubmit} style={{ padding: "24px 24px 0" }}>

          {/* ── Step 1: Submission Type ──────────────────────────────────── */}
          <div style={{ marginBottom: 24 }}>
            <div style={{
              fontSize: "0.60rem", fontWeight: 800, color: TT,
              textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 10,
            }}>
              Submission Type <span style={{ color: "#B91C1C" }}>*</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
              {SUB_TYPES.map(t => {
                const isActive = form.submissionType === t.id;
                const c = typeColor(t.id);
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => set("submissionType", t.id)}
                    style={{
                      padding: "12px 14px", textAlign: "left",
                      border: `1.5px solid ${isActive ? c : BDL}`,
                      background: isActive ? `${c}08` : "white",
                      cursor: "pointer", transition: "all 0.15s",
                      borderRadius: 6,
                    }}
                  >
                    <div style={{
                      width: 28, height: 28, marginBottom: 8,
                      background: isActive ? `${c}15` : "#F0F3F8",
                      border: `1px solid ${isActive ? `${c}40` : BDL}`,
                      borderRadius: 6,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: isActive ? c : TT,
                    }}>
                      {t.icon}
                    </div>
                    <div style={{ fontSize: "0.78rem", fontWeight: 700, color: isActive ? c : TD, marginBottom: 3 }}>
                      {t.label}
                    </div>
                    <div style={{ fontSize: "0.63rem", color: TT, lineHeight: 1.4 }}>
                      {t.desc}
                    </div>
                    {isActive && (
                      <div style={{
                        marginTop: 8, display: "flex", alignItems: "center", gap: 4,
                        fontSize: "0.60rem", fontWeight: 700, color: c, textTransform: "uppercase", letterSpacing: "0.06em",
                      }}>
                        <Check size={10} /> Selected
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Divider ──────────────────────────────────────────────────── */}
          <div style={{ borderTop: `1px solid ${BDL}`, marginBottom: 20 }} />

          {/* ── Account fields ────────────────────────────────────────────── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>

            {/* Account Number */}
            <div>
              <FieldLabel required>Account Number</FieldLabel>
              <TextInput
                value={form.accountNumber}
                onChange={v => {
                  if (v === "" || /^\d*$/.test(v)) set("accountNumber", v);
                }}
                placeholder="e.g. 1001"
                icon={<Hash size={13} />}
              />
              {acctError && (
                <p style={{ fontSize: "0.62rem", color: "#B91C1C", marginTop: 4 }}>{acctError}</p>
              )}
              {errors.accountNumber && !acctError && (
                <p style={{ fontSize: "0.62rem", color: "#B91C1C", marginTop: 4 }}>{errors.accountNumber}</p>
              )}
              <p style={{ fontSize: "0.60rem", color: TT, marginTop: 3 }}>
                Try: 1001–1018 · 2001–2005
              </p>
            </div>

            {/* Account Name (read-only) */}
            <div>
              <FieldLabel>Account Name</FieldLabel>
              <TextInput
                value={form.accountName}
                placeholder="Auto-populated from account number"
                readOnly
                icon={<Building2 size={13} />}
              />
              {form.accountName && (
                <p style={{ fontSize: "0.62rem", color: "#1A7A4A", marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
                  <Check size={10} /> Account resolved
                </p>
              )}
              {errors.accountName && !form.accountName && (
                <p style={{ fontSize: "0.62rem", color: "#B91C1C", marginTop: 4 }}>{errors.accountName}</p>
              )}
            </div>
          </div>

          {/* ── Date fields ───────────────────────────────────────────────── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 16 }}>

            {/* Need By Date */}
            <div>
              <FieldLabel required>Need By Date</FieldLabel>
              <TextInput
                type="date"
                value={form.needByDate}
                onChange={v => set("needByDate", v)}
                icon={<Calendar size={13} />}
              />
              {errors.needByDate && (
                <p style={{ fontSize: "0.62rem", color: "#B91C1C", marginTop: 4 }}>{errors.needByDate}</p>
              )}
            </div>

            {/* Effective Date */}
            <div>
              <FieldLabel required>Effective Date</FieldLabel>
              <TextInput
                type="date"
                value={form.effectiveDate}
                onChange={v => set("effectiveDate", v)}
                icon={<Calendar size={13} />}
              />
              {errors.effectiveDate && (
                <p style={{ fontSize: "0.62rem", color: "#B91C1C", marginTop: 4 }}>{errors.effectiveDate}</p>
              )}
            </div>

            {/* Expiration Date */}
            <div>
              <FieldLabel required>Expiration Date</FieldLabel>
              <TextInput
                type="date"
                value={form.expirationDate}
                onChange={v => set("expirationDate", v)}
                icon={<Calendar size={13} />}
              />
              {form.effectiveDate && (
                <p style={{ fontSize: "0.60rem", color: TT, marginTop: 3 }}>
                  Auto-set to +1 year from effective
                </p>
              )}
              {errors.expirationDate && (
                <p style={{ fontSize: "0.62rem", color: "#B91C1C", marginTop: 4 }}>{errors.expirationDate}</p>
              )}
            </div>
          </div>

          {/* ── Stage ─────────────────────────────────────────────────────── */}
          <div style={{ marginBottom: 24 }}>
            <FieldLabel required>Stage</FieldLabel>
            <StageDropdown
              value={form.stage}
              onChange={v => set("stage", v)}
            />
          </div>

          {/* ── Footer ────────────────────────────────────────────────────── */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 10,
            padding: "16px 0 20px",
            borderTop: `1px solid ${BDL}`,
            position: "sticky", bottom: 0, background: "white",
          }}>
            <button
              type="button"
              onClick={handleClose}
              style={{
                padding: "9px 20px",
                background: "white", color: TM,
                border: `1px solid ${BD}`, cursor: "pointer",
                fontSize: "0.78rem", fontWeight: 600, fontFamily: font,
                borderRadius: 6,
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitted}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "9px 22px",
                background: submitted ? `${N}80` : N,
                color: "white", border: "none", cursor: submitted ? "default" : "pointer",
                fontSize: "0.78rem", fontWeight: 700, fontFamily: font,
                transition: "background 0.15s",
                borderRadius: 6,
              }}
            >
              {submitted ? (
                <>
                  <RefreshCw size={13} style={{ animation: "spin 0.7s linear infinite" }} />
                  Creating…
                </>
              ) : (
                <>
                  <Plus size={14} />
                  Create Submission
                  <ArrowRight size={13} />
                </>
              )}
            </button>
          </div>
        </form>

        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    </>
  );
}