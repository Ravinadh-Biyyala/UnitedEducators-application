import { useMemo, useRef, useState, useEffect } from "react";
import {
  Plus, X, ChevronDown, Check, ClipboardList, AlertTriangle, FileText, Trash2,
} from "lucide-react";

/* ── Design tokens ─────────────────────────────────────────────────────────── */
const N    = "#0123D4";
const BD   = "#C4CDD8";
const BDL  = "#DCE3EC";
const TH   = "#F0F3F8";
const TD   = "#1A2530";
const TM   = "#4A5D6E";
const TT   = "#5F7080";
const font = "'Source Sans 3', system-ui, sans-serif";

/* ── Types ─────────────────────────────────────────────────────────────────── */
type ConditionStatus = "Open" | "Satisfied" | "Deferred";
type SubjectivityType = "BIND" | "QUOTE" | "POLICY";

interface ConditionItem {
  id:            string;
  type?:         SubjectivityType;        // present only on subjectivities
  title:         string;
  description?:  string;
  status:        ConditionStatus;
  dateSatisfied?: string;
}

/* ── Constants ─────────────────────────────────────────────────────────────── */
const SUBJ_TYPES: SubjectivityType[] = ["BIND", "QUOTE", "POLICY"];

const TITLE_PRESETS: Record<SubjectivityType, string[]> = {
  BIND:   ["Bind Order", "Cyber Supplemental", "Signed TRIA Disclosure", "Loss Run Update (60 days)", "Wire Confirmation"],
  QUOTE:  ["Updated Application", "Currently Valued Loss Runs", "Statement of Values", "Financials FY"],
  POLICY: ["Signed Policy Application", "Premium Payment", "Compliance Attestation"],
};

const CONTINGENCY_TITLE_PRESETS = [
  "Schedule of Buildings",
  "Updated Safety Questionnaire",
  "Background Check Confirmation",
  "Sprinkler Inspection Report",
];

/* ── Seed data — matches the layout reference (1 / 3 satisfied) ────────────── */
const SEED_SUBJECTIVITIES: ConditionItem[] = [
  {
    id:          "SUBJ-001",
    type:        "BIND",
    title:       "Bind Order",
    description: "Written confirmation of the order, including selected quote option.",
    status:      "Open",
  },
  {
    id:          "SUBJ-002",
    type:        "BIND",
    title:       "Cyber Supplemental",
    description: "Completed cyber supplemental questionnaire from broker.",
    status:      "Open",
  },
  {
    id:            "SUBJ-003",
    type:          "BIND",
    title:         "Signed TRIA Disclosure",
    status:        "Satisfied",
    dateSatisfied: "Apr 20, 2026",
  },
];

const SEED_CONTINGENCIES: ConditionItem[] = [];

/* ── Style helpers ─────────────────────────────────────────────────────────── */
const statusStyle = (s: ConditionStatus) => {
  if (s === "Satisfied") return { bg: "#E8F5EC", text: "#1A5C30", border: "#93C8A0", dot: "#2E7D32" };
  if (s === "Deferred")  return { bg: "#FFF8E6", text: "#8A5C00", border: "#F0D88A", dot: "#C9A227" };
  return                        { bg: TH,        text: TM,        border: BD,        dot: TT       };
};

const typeStyle = (t?: SubjectivityType) => {
  if (t === "QUOTE")  return { bg: "#FFF8E6", text: "#8A5C00", border: "#F0D88A" };
  if (t === "POLICY") return { bg: "#F0EEF8", text: "#4A2D80", border: "#C3B8E8" };
  return                     { bg: `${N}10`,  text: N,         border: `${N}33`  };
};

/* ── Reusable select (matches ApprovalsTab styling) ────────────────────────── */
function SelectField<T extends string>({
  label, value, onChange, options, placeholder, required,
}: {
  label: string;
  value: T | "";
  onChange: (v: T) => void;
  options: readonly T[];
  placeholder?: string;
  required?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label style={{ fontSize: "0.62rem", fontWeight: 700, color: TT, textTransform: "uppercase", letterSpacing: "0.09em" }}>
          {label}
        </label>
        {!required && <span style={{ fontSize: "0.68rem", color: TT }}>optional</span>}
      </div>
      <div ref={ref} className="relative">
        <button type="button" onClick={() => setOpen(v => !v)}
          className="w-full flex items-center justify-between px-3 py-2.5"
          style={{ border: `1px solid ${BD}`, background: "white", fontSize: "0.84rem", color: value ? TD : TT, fontFamily: font, textAlign: "left", borderRadius: 6 }}>
          <span>{value || placeholder || "Select…"}</span>
          <ChevronDown size={14} color={TT} style={{ transform: open ? "rotate(180deg)" : "none", transition: "0.15s" }} />
        </button>
        {open && (
          <div className="absolute left-0 right-0 z-50 mt-0.5 overflow-y-auto"
            style={{ background: "white", border: `1px solid ${BD}`, boxShadow: "0 6px 24px rgba(0,0,0,0.13)", maxHeight: 220, zIndex: 9999, borderRadius: 6 }}>
            {options.map(opt => (
              <button key={opt} type="button"
                onClick={() => { onChange(opt); setOpen(false); }}
                className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center gap-2"
                style={{ fontSize: "0.84rem", fontFamily: font, background: value === opt ? N : "white", color: value === opt ? "white" : TD }}>
                {value === opt && <Check size={12} />}
                {opt}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Inline status dropdown used on each row ───────────────────────────────── */
function StatusDropdown({
  value, onChange,
}: {
  value: ConditionStatus;
  onChange: (v: ConditionStatus) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const ss = statusStyle(value);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="inline-flex items-center gap-1.5 hover:brightness-97 transition-all"
        style={{
          background: ss.bg,
          color: ss.text,
          border: `1px solid ${ss.border}`,
          padding: "3px 8px 3px 9px",
          borderRadius: 999,
          fontSize: "0.72rem",
          fontWeight: 700,
          minWidth: 92,
          justifyContent: "space-between",
          cursor: "pointer",
        }}>
        <span className="inline-flex items-center gap-1.5">
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: ss.dot, display: "inline-block" }} />
          {value}
        </span>
        <ChevronDown size={11} style={{ color: ss.text, transform: open ? "rotate(180deg)" : "none", transition: "0.15s" }} />
      </button>
      {open && (
        <div className="absolute right-0 z-50 mt-1 overflow-hidden"
          style={{ background: "white", border: `1px solid ${BD}`, boxShadow: "0 6px 24px rgba(0,0,0,0.13)", borderRadius: 6, minWidth: 130 }}>
          {(["Open", "Satisfied", "Deferred"] as ConditionStatus[]).map(opt => {
            const s = statusStyle(opt);
            return (
              <button
                key={opt}
                type="button"
                onClick={() => { onChange(opt); setOpen(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-slate-50 text-left"
                style={{ fontSize: "0.78rem", color: TD, fontWeight: 600 }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: s.dot, display: "inline-block" }} />
                {opt}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ── Add Condition Modal ───────────────────────────────────────────────────── */
function AddConditionModal({
  kind, onClose, onSubmit,
}: {
  kind: "subjectivity" | "contingency";
  onClose: () => void;
  onSubmit: (c: Omit<ConditionItem, "id" | "status" | "dateSatisfied">) => void;
}) {
  const isSubj = kind === "subjectivity";
  const heading = isSubj ? "Add Subjectivity" : "Add Contingency";
  const submitLabel = isSubj ? "Add Subjectivity" : "Add Contingency";

  const [type, setType]     = useState<SubjectivityType | "">(isSubj ? "BIND" : "");
  const [preset, setPreset] = useState<string>("Free Text…");
  const [custom, setCustom] = useState("");

  const titleOptions = useMemo(() => {
    const base = isSubj && type ? TITLE_PRESETS[type] : CONTINGENCY_TITLE_PRESETS;
    return ["Free Text…", ...base];
  }, [isSubj, type]);

  const resolvedTitle = preset && preset !== "Free Text…" ? preset : custom.trim();
  const canSubmit = resolvedTitle.length > 0 && (!isSubj || !!type);

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit({
      ...(isSubj && type ? { type: type as SubjectivityType } : {}),
      title: resolvedTitle,
    });
    onClose();
  };

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(15, 25, 40, 0.55)", fontFamily: font }}>
      <div
        className="w-full mx-4"
        style={{ maxWidth: 560, background: "white", border: `1px solid ${BD}`, boxShadow: "0 20px 60px rgba(0,0,0,0.20)", borderRadius: 10 }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4"
          style={{
            borderBottom: `1px solid ${BDL}`,
            borderTopLeftRadius: 10,
            borderTopRightRadius: 10,
            background: "white",
          }}>
          <h2 style={{ fontSize: "1.05rem", fontWeight: 800, color: TD }}>{heading}</h2>
          <button onClick={onClose}
            className="flex items-center justify-center hover:bg-slate-100 transition-colors"
            style={{ width: 28, height: 28, color: TT, borderRadius: 6 }}>
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {isSubj ? (
            <div className="grid grid-cols-2 gap-4">
              <SelectField<SubjectivityType>
                label="Type"
                value={type}
                onChange={setType}
                options={SUBJ_TYPES}
                placeholder="Select type…"
                required
              />
              <SelectField<string>
                label="Title"
                value={preset}
                onChange={setPreset}
                options={titleOptions}
                placeholder="Select…"
                required
              />
            </div>
          ) : (
            <SelectField<string>
              label="Title"
              value={preset}
              onChange={setPreset}
              options={titleOptions}
              placeholder="Select…"
              required
            />
          )}

          {preset === "Free Text…" && (
            <div>
              <label style={{ fontSize: "0.62rem", fontWeight: 700, color: TT, textTransform: "uppercase", letterSpacing: "0.09em", display: "block", marginBottom: 6 }}>
                Custom title
              </label>
              <input
                value={custom}
                onChange={e => setCustom(e.target.value)}
                placeholder={`Enter a title for this ${isSubj ? "subjectivity" : "contingency"}…`}
                className="w-full px-3 py-2.5 outline-none"
                style={{ fontSize: "0.84rem", border: `1px solid ${BD}`, borderRadius: 6, color: TD, fontFamily: font }}
              />
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2.5 px-6 py-4"
          style={{
            borderTop: `1px solid ${BDL}`,
            background: TH,
            borderBottomLeftRadius: 10,
            borderBottomRightRadius: 10,
          }}>
          <button onClick={onClose}
            className="px-4 py-2 hover:brightness-97 transition-all"
            style={{ fontSize: "0.80rem", fontWeight: 600, color: TM, background: "white", border: `1px solid ${BD}`, borderRadius: 6 }}>
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={!canSubmit}
            className="flex items-center gap-1.5 px-5 py-2 transition-all hover:brightness-95 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: N, color: "white", fontSize: "0.80rem", fontWeight: 700, borderRadius: 6 }}>
            <Plus size={13} /> {submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Section card (header + table) ─────────────────────────────────────────── */
function ConditionsSection({
  title, items, kind, onAdd, onStatusChange, onDelete, icon,
}: {
  title: string;
  items: ConditionItem[];
  kind: "subjectivity" | "contingency";
  onAdd: () => void;
  onStatusChange: (id: string, status: ConditionStatus) => void;
  onDelete: (id: string) => void;
  icon: React.ReactNode;
}) {
  const satisfied = items.filter(i => i.status === "Satisfied").length;
  const total = items.length;
  const showTypeCol = kind === "subjectivity";

  return (
    <div style={{
      background: "white",
      border: `1px solid ${BDL}`,
      borderRadius: 8,
      boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
    }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3"
        style={{
          borderBottom: `1px solid ${BDL}`,
          background: "#FAFBFD",
          borderTopLeftRadius: 8,
          borderTopRightRadius: 8,
        }}>
        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center justify-center"
            style={{ width: 24, height: 24, borderRadius: 6, background: `${N}12`, color: N }}>
            {icon}
          </span>
          <h3 style={{ fontSize: "0.92rem", fontWeight: 800, color: TD }}>
            {title}
          </h3>
          {total > 0 && (
            <span style={{
              fontSize: "0.70rem", fontWeight: 700,
              background: "#FFF8E6", color: "#8A5C00", border: "1px solid #F0D88A",
              padding: "2px 8px", borderRadius: 999,
            }}>
              {satisfied} / {total} satisfied
            </span>
          )}
        </div>
        <button onClick={onAdd}
          className="flex items-center gap-1.5 px-3 py-1.5 hover:brightness-95 transition-all"
          style={{ background: N, color: "white", fontSize: "0.76rem", fontWeight: 700, borderRadius: 6 }}>
          <Plus size={12} /> Add
        </button>
      </div>

      {/* Table head */}
      <div className="grid items-center px-5 py-2.5"
        style={{
          gridTemplateColumns: showTypeCol ? "72px 1fr 130px 140px 44px" : "1fr 130px 140px 44px",
          background: TH,
          borderBottom: `1px solid ${BDL}`,
          fontSize: "0.62rem",
          fontWeight: 800,
          color: TT,
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          gap: 16,
        }}>
        {showTypeCol && <span>Type</span>}
        <span>Title &amp; Description</span>
        <span>Status</span>
        <span>Date Satisfied</span>
        <span aria-hidden="true" />
      </div>

      {/* Rows / empty state */}
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center"
          style={{ padding: "44px 16px", color: TT }}>
          <span className="inline-flex items-center justify-center mb-3"
            style={{ width: 36, height: 36, borderRadius: 8, background: TH, color: TT }}>
            <ClipboardList size={18} />
          </span>
          <p style={{ fontSize: "0.84rem", fontWeight: 700, color: TM }}>
            No {kind === "subjectivity" ? "subjectivities" : "contingencies"} yet
          </p>
          <p style={{ fontSize: "0.74rem", color: TT, marginTop: 4 }}>
            Click "+ Add" to create one.
          </p>
        </div>
      ) : (
        items.map((item, idx) => {
          const ts = typeStyle(item.type);
          const isSatisfied = item.status === "Satisfied";
          const isLast = idx === items.length - 1;
          return (
            <div
              key={item.id}
              className="group grid items-center px-5 py-3 transition-colors hover:bg-slate-50"
              style={{
                gridTemplateColumns: showTypeCol ? "72px 1fr 130px 140px 44px" : "1fr 130px 140px 44px",
                borderBottom: isLast ? "none" : `1px solid ${BDL}`,
                gap: 16,
              }}>
              {showTypeCol && (
                <span style={{
                  fontSize: "0.62rem", fontWeight: 800,
                  background: ts.bg, color: ts.text, border: `1px solid ${ts.border}`,
                  padding: "3px 8px", borderRadius: 9999,
                  textTransform: "uppercase", letterSpacing: "0.04em",
                  justifySelf: "start",
                }}>
                  {item.type}
                </span>
              )}
              <div className="min-w-0">
                <p style={{
                  fontSize: "0.86rem",
                  fontWeight: 700,
                  color: isSatisfied ? TT : TD,
                  textDecoration: isSatisfied ? "line-through" : "none",
                  lineHeight: 1.35,
                }}>
                  {item.title}
                </p>
                {item.description && (
                  <p style={{
                    fontSize: "0.76rem",
                    color: TM,
                    marginTop: 2,
                    textDecoration: isSatisfied ? "line-through" : "none",
                    lineHeight: 1.4,
                  }}>
                    {item.description}
                  </p>
                )}
              </div>
              <div>
                <StatusDropdown
                  value={item.status}
                  onChange={(s) => onStatusChange(item.id, s)}
                />
              </div>
              <span style={{ fontSize: "0.80rem", color: item.dateSatisfied ? TD : TT, fontWeight: item.dateSatisfied ? 600 : 400 }}>
                {item.dateSatisfied ?? "—"}
              </span>
              <button
                type="button"
                onClick={() => onDelete(item.id)}
                aria-label={`Delete ${item.title}`}
                title="Delete"
                className="inline-flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
                style={{
                  width: 28, height: 28, borderRadius: 6,
                  background: "transparent", border: "none", cursor: "pointer",
                  color: "#B91C1C", justifySelf: "end",
                }}>
                <Trash2 size={14} />
              </button>
            </div>
          );
        })
      )}
    </div>
  );
}

/* ── Main component ────────────────────────────────────────────────────────── */
export function ConditionsTab() {
  const [subjectivities, setSubjectivities] = useState<ConditionItem[]>(SEED_SUBJECTIVITIES);
  const [contingencies,  setContingencies]  = useState<ConditionItem[]>(SEED_CONTINGENCIES);
  const [modalKind, setModalKind] = useState<"subjectivity" | "contingency" | null>(null);
  const nextSubjNum = useRef(SEED_SUBJECTIVITIES.length + 1);
  const nextContNum = useRef(1);

  const today = () =>
    new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const handleStatusChange = (
    listSetter: React.Dispatch<React.SetStateAction<ConditionItem[]>>,
  ) => (id: string, status: ConditionStatus) => {
    listSetter(prev => prev.map(item =>
      item.id === id
        ? {
            ...item,
            status,
            dateSatisfied: status === "Satisfied" ? today() : undefined,
          }
        : item,
    ));
  };

  const handleDelete = (
    listSetter: React.Dispatch<React.SetStateAction<ConditionItem[]>>,
  ) => (id: string) => {
    listSetter(prev => prev.filter(item => item.id !== id));
  };

  const handleAdd = (partial: Omit<ConditionItem, "id" | "status" | "dateSatisfied">) => {
    if (modalKind === "subjectivity") {
      setSubjectivities(prev => [
        ...prev,
        { ...partial, id: `SUBJ-${String(nextSubjNum.current++).padStart(3, "0")}`, status: "Open" },
      ]);
    } else if (modalKind === "contingency") {
      setContingencies(prev => [
        ...prev,
        { ...partial, id: `CONT-${String(nextContNum.current++).padStart(3, "0")}`, status: "Open" },
      ]);
    }
  };

  return (
    <>
      <div className="space-y-4" style={{ fontFamily: font }}>
        <ConditionsSection
          title="Subjectivities"
          items={subjectivities}
          kind="subjectivity"
          icon={<FileText size={13} />}
          onAdd={() => setModalKind("subjectivity")}
          onStatusChange={handleStatusChange(setSubjectivities)}
          onDelete={handleDelete(setSubjectivities)}
        />

        <ConditionsSection
          title="Contingencies"
          items={contingencies}
          kind="contingency"
          icon={<AlertTriangle size={13} />}
          onAdd={() => setModalKind("contingency")}
          onStatusChange={handleStatusChange(setContingencies)}
          onDelete={handleDelete(setContingencies)}
        />
      </div>

      {modalKind && (
        <AddConditionModal
          kind={modalKind}
          onClose={() => setModalKind(null)}
          onSubmit={handleAdd}
        />
      )}
    </>
  );
}
