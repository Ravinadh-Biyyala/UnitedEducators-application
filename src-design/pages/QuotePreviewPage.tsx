import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import type { RoleId } from "../components/AppShell";
import { useAuth } from "../context/AuthContext";
import {
  ArrowLeft, Printer, Download, Shield, Layers, Calendar,
  Star, Bell, ChevronDown, ChevronRight, Check, DollarSign,
  AlertCircle, FileText, BookOpen, Pencil, CheckCircle2, Send, Plus, FileCheck2,
} from "lucide-react";

/* ── Design tokens ──────────────────────────────────────────────────────── */
const N   = "#0123D4";
const G   = "#C9A227";
const BD  = "#C4CDD8";
const BDL = "#DCE3EC";
const TH  = "#F0F3F8";
const TD  = "#1A2530";
const TM  = "#4A5D6E";
const TT  = "#7A8FA3";
const font = "'Source Sans 3', system-ui, sans-serif";

const fmt = (n: number) => "$" + n.toLocaleString("en-US");

/* ── Types (mirror from RatingTab serialized payload) ───────────────────── */
interface CoverageField  { label: string; value: string; type: string; }
interface CoverageItem   { id: string; label: string; desc: string; required: boolean; checked: boolean; price: number; }
interface Endorsement    { id: string; label: string; desc: string; premium: number; included: boolean; }
interface OptionPayload  {
  id: string; label: string; color: string; premium: number;
  coverageFields: CoverageField[];
  coverageItems: CoverageItem[];
  addedEndorsements: Endorsement[];
  manualPct: number;
}
interface ProductPayload {
  id: string; label: string; abbr: string; desc: string;
  categoryColor: string; category: string; basePremium: number;
  endorsements: Endorsement[];
  options: OptionPayload[];
}

type SectionKey = "policy" | "endorsements" | "schedules" | "memberBenefits" | "notifications";

const SECTIONS: { key: SectionKey; icon: React.ReactNode; label: string }[] = [
  { key: "policy",         icon: <Shield size={13} />,     label: "Policy & Coverage"  },
  { key: "endorsements",   icon: <Layers size={13} />,     label: "Endorsements"       },
  { key: "schedules",      icon: <Calendar size={13} />,   label: "Schedules"          },
  { key: "memberBenefits", icon: <Star size={13} />,       label: "Member Benefits"    },
  { key: "notifications",  icon: <Bell size={13} />,       label: "Notifications"      },
];

/* ── Static schedule / benefit / notification mock data ─────────────────── */
const MOCK_SCHEDULES = [
  { name: "Main District Campus",    eff: "07/01/2026", exp: "07/01/2027", limit: "$5,000,000", status: "Active"  },
  { name: "Athletic Facilities",     eff: "07/01/2026", exp: "07/01/2027", limit: "$2,500,000", status: "Active"  },
  { name: "Administration Building", eff: "07/01/2026", exp: "07/01/2027", limit: "$1,000,000", status: "Active"  },
  { name: "Transportation Fleet",    eff: "07/01/2026", exp: "07/01/2027", limit: "$750,000",   status: "Pending" },
];
const MOCK_BENEFITS = [
  { title: "ProResponse", services: [
    "Crisis Communications", "Trauma/Grief Counseling",
    "Threat Assessment Case Consultation", "Sexual Misconduct Investigation",
  ]},
];
const MOCK_NOTIFICATIONS = [
  { code: "TRIADS", label: "TRIADS - Terrorism Risk Insurance Act Disclosure Statement", edition: "4/1/2015" },
  { code: "BIDS",   label: "BIDS - Broker Information Disclosure Statement",            edition: "4/1/2015" },
  { code: "PMB",    label: "PMB - ProResponse Member Benefits",                         edition: "5/1/2022" },
];

/* ═══════════════════════════════════════════════════════════════════════════
   SECTION RENDERERS
═══════════════════════════════════════════════════════════════════════════ */
function PolicySection({ opt, color }: { opt: OptionPayload; color: string }) {
  const included = opt.coverageItems.filter(ci => ci.checked || ci.required);
  const optional = opt.coverageItems.filter(ci => !ci.required);
  return (
    <div className="space-y-5">
      {/* Coverage Limits */}
      <div>
        <div style={{ fontSize: "0.60rem", fontWeight: 800, color: TT, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 10 }}>Coverage Limits & Terms</div>
        <div className="grid grid-cols-2 gap-3">
          {opt.coverageFields.map(f => (
            <div key={f.label} className="px-3 py-2.5" style={{ border: `1px solid ${BDL}`, background: "white" }}>
              <div style={{ fontSize: "0.58rem", fontWeight: 700, color: TT, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>{f.label}</div>
              <div style={{ fontSize: "0.84rem", fontWeight: 700, color: TD }}>{f.value}</div>
            </div>
          ))}
        </div>
      </div>
      {/* Coverage Checklist */}
      <div>
        <div style={{ fontSize: "0.60rem", fontWeight: 800, color: TT, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 10 }}>Coverage Checklist</div>
        <div style={{ border: `1px solid ${BDL}`, background: "white" }}>
          {opt.coverageItems.map((item, i) => {
            const isOn = item.checked || item.required;
            return (
              <div key={item.id} className="flex items-start gap-3 px-4 py-3"
                style={{ borderBottom: i < opt.coverageItems.length - 1 ? `1px solid ${BDL}` : "none", borderLeft: isOn ? `3px solid ${color}` : "3px solid transparent", background: isOn ? `${color}04` : "white" }}>
                <div className="shrink-0 flex items-center justify-center mt-0.5"
                  style={{ width: 16, height: 16, background: isOn ? color : "white", border: `2px solid ${isOn ? color : BD}` }}>
                  {isOn && <Check size={9} color="white" strokeWidth={3} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span style={{ fontSize: "0.80rem", fontWeight: isOn ? 700 : 400, color: isOn ? TD : TT }}>{item.label}</span>
                    {item.required && <span style={{ fontSize: "0.56rem", fontWeight: 800, color: TT, border: `1px solid ${BD}`, padding: "1px 5px", letterSpacing: "0.06em" }}>REQUIRED</span>}
                  </div>
                  <p style={{ fontSize: "0.70rem", color: TT, marginTop: 2, lineHeight: 1.4 }}>{item.desc}</p>
                </div>
                <div className="shrink-0">
                  {item.required
                    ? <span style={{ fontSize: "0.70rem", color: TT }}>Included</span>
                    : isOn
                    ? <span style={{ fontSize: "0.76rem", fontWeight: 700, color: "#B45309" }}>+{fmt(item.price)}</span>
                    : <span style={{ fontSize: "0.70rem", color: TT }}>—</span>}
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-2 flex items-center gap-4 px-1">
          <span style={{ fontSize: "0.70rem", color: TT }}><strong style={{ color: TM }}>{included.length}</strong> of <strong style={{ color: TM }}>{opt.coverageItems.length}</strong> selected</span>
          {optional.filter(c => c.checked).length > 0 && (
            <span style={{ fontSize: "0.70rem", color: "#B45309" }}>
              +{fmt(optional.filter(c => c.checked).reduce((s, c) => s + c.price, 0))} optional surcharges
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function EndorsementsSection({ opt, product }: { opt: OptionPayload; product: ProductPayload }) {
  const color = product.categoryColor;
  return (
    <div className="space-y-4">
      {/* Default endorsements */}
      <div>
        <div style={{ fontSize: "0.60rem", fontWeight: 800, color: TT, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 8 }}>Default Endorsements</div>
        <div style={{ border: `1px solid ${BDL}`, background: "white" }}>
          {product.endorsements.map((end, i) => (
            <div key={end.id} className="flex items-start gap-3 px-4 py-3"
              style={{ borderBottom: i < product.endorsements.length - 1 ? `1px solid ${BDL}` : "none" }}>
              <div className="shrink-0 flex items-center justify-center mt-0.5"
                style={{ width: 16, height: 16, background: `${color}15`, border: `1.5px solid ${color}40` }}>
                <BookOpen size={8} color={color} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span style={{ fontSize: "0.80rem", fontWeight: 600, color: TM }}>{end.label}</span>
                  <span style={{ fontSize: "0.56rem", fontWeight: 800, color: color, background: `${color}12`, border: `1px solid ${color}30`, padding: "1px 5px", letterSpacing: "0.06em" }}>DEFAULT</span>
                </div>
                <p style={{ fontSize: "0.70rem", color: TT, marginTop: 2, lineHeight: 1.4 }}>{end.desc}</p>
              </div>
              <span style={{ fontSize: "0.72rem", color: TT, flexShrink: 0 }}>{fmt(end.premium)}</span>
            </div>
          ))}
        </div>
      </div>
      {/* Added endorsements */}
      {opt.addedEndorsements.length > 0 && (
        <div>
          <div style={{ fontSize: "0.60rem", fontWeight: 800, color: TT, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 8 }}>Added Endorsements</div>
          <div style={{ border: `1px solid ${BDL}`, background: "white" }}>
            {opt.addedEndorsements.map((end, i) => (
              <div key={end.id} className="flex items-start gap-3 px-4 py-3"
                style={{ borderBottom: i < opt.addedEndorsements.length - 1 ? `1px solid ${BDL}` : "none", background: end.included ? `${color}04` : "white", borderLeft: end.included ? `3px solid ${color}` : "3px solid transparent" }}>
                <div className="shrink-0 flex items-center justify-center mt-0.5"
                  style={{ width: 16, height: 16, background: end.included ? color : "white", border: `2px solid ${end.included ? color : BD}` }}>
                  {end.included && <Check size={9} color="white" strokeWidth={3} />}
                </div>
                <div className="flex-1 min-w-0">
                  <span style={{ fontSize: "0.80rem", fontWeight: end.included ? 700 : 500, color: end.included ? TD : TM }}>{end.label}</span>
                  <p style={{ fontSize: "0.70rem", color: TT, marginTop: 2, lineHeight: 1.4 }}>{end.desc}</p>
                </div>
                <span style={{ fontSize: "0.76rem", fontWeight: 700, color: end.included ? color : TT, flexShrink: 0 }}>{end.included ? fmt(end.premium) : `+${fmt(end.premium)}`}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {opt.addedEndorsements.length === 0 && (
        <div className="flex items-center gap-2 px-4 py-3" style={{ background: TH, border: `1px solid ${BDL}` }}>
          <AlertCircle size={13} color={TT} />
          <span style={{ fontSize: "0.74rem", color: TT }}>No additional endorsements added for this option.</span>
        </div>
      )}
    </div>
  );
}

function SchedulesSection({ color }: { color: string }) {
  return (
    <div style={{ border: `1px solid ${BDL}`, background: "white" }}>
      <div className="grid px-4 py-2" style={{ gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", background: TH, borderBottom: `1px solid ${BDL}` }}>
        {["Schedule Name", "Effective Date", "Expiration Date", "Limit", "Status"].map(h => (
          <span key={h} style={{ fontSize: "0.58rem", fontWeight: 800, color: TT, textTransform: "uppercase", letterSpacing: "0.08em" }}>{h}</span>
        ))}
      </div>
      {MOCK_SCHEDULES.map((row, i) => (
        <div key={row.name} className="grid items-center px-4 py-3"
          style={{ gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", borderBottom: i < MOCK_SCHEDULES.length - 1 ? `1px solid ${BDL}` : "none" }}>
          <span style={{ fontSize: "0.78rem", fontWeight: 600, color: TD }}>{row.name}</span>
          <span style={{ fontSize: "0.76rem", color: TM }}>{row.eff}</span>
          <span style={{ fontSize: "0.76rem", color: TM }}>{row.exp}</span>
          <span style={{ fontSize: "0.76rem", fontWeight: 700, color: color }}>{row.limit}</span>
          <span style={{ fontSize: "0.66rem", fontWeight: 700,
            color: row.status === "Active" ? "#1A7A4A" : "#B45309",
            background: row.status === "Active" ? "#E8F5E9" : "#FFF8E6",
            border: `1px solid ${row.status === "Active" ? "#81C784" : "#F0D88A"}`,
            padding: "2px 8px", display: "inline-block" }}>
            {row.status}
          </span>
        </div>
      ))}
    </div>
  );
}

function MemberBenefitsSection({ color }: { color: string }) {
  return (
    <div style={{ border: `1px solid ${BDL}`, background: "white" }}>
      <div className="grid px-4 py-2" style={{ gridTemplateColumns: "32px 1fr 2fr 1fr 1fr", background: TH, borderBottom: `1px solid ${BDL}` }}>
        {["", "Benefit Title", "Included Services", "Start Date", "End Date"].map((h, i) => (
          <span key={i} style={{ fontSize: "0.58rem", fontWeight: 800, color: TT, textTransform: "uppercase", letterSpacing: "0.08em" }}>{h}</span>
        ))}
      </div>
      {MOCK_BENEFITS.map(b => (
        <div key={b.title}>
          <div className="grid items-center px-4 py-2" style={{ gridTemplateColumns: "32px 1fr 2fr 1fr 1fr", background: `${color}06`, borderBottom: `1px solid ${BDL}` }}>
            <div style={{ width: 14, height: 14, background: color, border: `2px solid ${color}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Check size={8} color="white" strokeWidth={3} />
            </div>
            <span style={{ fontSize: "0.82rem", fontWeight: 700, color: TD }}>{b.title}</span>
            <span /><span /><span />
          </div>
          {b.services.map((svc, si) => (
            <div key={svc} className="grid items-center px-4 py-2"
              style={{ gridTemplateColumns: "32px 1fr 2fr 1fr 1fr", borderBottom: si < b.services.length - 1 ? `1px solid ${BDL}` : "none", paddingLeft: 48 }}>
              <span /><span />
              <span style={{ fontSize: "0.76rem", color: N }}>{svc}</span>
              <span style={{ fontSize: "0.76rem", color: TM }}>7/1/2026</span>
              <span style={{ fontSize: "0.76rem", color: TM }}>7/1/2027</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function NotificationsSection() {
  return (
    <div style={{ border: `1px solid ${BDL}`, background: "white" }}>
      <div className="grid px-4 py-2" style={{ gridTemplateColumns: "1fr 120px", background: TH, borderBottom: `1px solid ${BDL}` }}>
        {["Notification Form", "Edition Date"].map(h => (
          <span key={h} style={{ fontSize: "0.58rem", fontWeight: 800, color: TT, textTransform: "uppercase", letterSpacing: "0.08em" }}>{h}</span>
        ))}
      </div>
      {MOCK_NOTIFICATIONS.map((n, i) => (
        <div key={n.code} className="grid items-center px-4 py-3"
          style={{ gridTemplateColumns: "1fr 120px", borderBottom: i < MOCK_NOTIFICATIONS.length - 1 ? `1px solid ${BDL}` : "none" }}>
          <span style={{ fontSize: "0.78rem", color: TM }}>{n.label}</span>
          <span style={{ fontSize: "0.78rem", color: TM }}>{n.edition}</span>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   OPTION PREVIEW CARD
═══════════════════════════════════════════════════════════════════════════ */
function DetailHeader({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: "0.58rem", fontWeight: 800, color: TT, textTransform: "uppercase", letterSpacing: "0.10em", marginBottom: 8 }}>{children}</div>
  );
}

function OptionCard({
  opt, product, selected, onToggleSelect, onEdit,
}: {
  opt: OptionPayload;
  product: ProductPayload;
  selected: boolean;
  onToggleSelect: () => void;
  onEdit: () => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  // First three coverage fields shown inline under the label
  const inlineFields = opt.coverageFields.slice(0, 3);
  const includedEnds = [
    ...product.endorsements.map(e => ({ ...e, kind: "Default" as const })),
    ...opt.addedEndorsements.filter(e => e.included).map(e => ({ ...e, kind: "Added" as const })),
  ];

  return (
    <div
      style={{
        border: `1px solid ${selected ? `${N}40` : BDL}`,
        background: "white",
        borderRadius: 8,
        borderLeft: selected ? `3px solid ${N}` : `1px solid ${selected ? `${N}40` : BDL}`,
        overflow: "hidden",
      }}>
      {/* Row */}
      <div
        onClick={onToggleSelect}
        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-slate-50 transition-all"
        style={{ background: selected ? `${N}06` : "white" }}>
        {/* Checkbox */}
        <div
          onClick={e => { e.stopPropagation(); onToggleSelect(); }}
          className="shrink-0 flex items-center justify-center"
          style={{ width: 18, height: 18, background: selected ? N : "white", border: `2px solid ${selected ? N : BD}`, transition: "all 0.12s", borderRadius: 3 }}
          role="checkbox"
          aria-checked={selected}>
          {selected && <Check size={10} color="white" strokeWidth={3} />}
        </div>
        {/* Title + SELECTED badge + inline coverage fields */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span style={{ fontSize: "0.86rem", fontWeight: 700, color: TD, letterSpacing: "0.02em" }}>{opt.label}</span>
            {selected && (
              <span className="inline-flex items-center gap-1" style={{ fontSize: "0.56rem", fontWeight: 800, color: N, background: `${N}10`, border: `1px solid ${N}30`, padding: "1px 8px", letterSpacing: "0.08em", borderRadius: 4, textTransform: "uppercase" }}>
                <CheckCircle2 size={9} /> Selected
              </span>
            )}
          </div>
          {inlineFields.length > 0 && (
            <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1">
              {inlineFields.map(f => (
                <span key={f.label} style={{ fontSize: "0.70rem", color: TT }}>
                  <span>{f.label}: </span>
                  <span style={{ color: TM, fontWeight: 600 }}>{f.value}</span>
                </span>
              ))}
            </div>
          )}
        </div>
        {/* Premium */}
        <div className="text-right shrink-0">
          <div style={{ fontSize: "0.58rem", fontWeight: 800, color: TT, textTransform: "uppercase", letterSpacing: "0.10em" }}>Premium</div>
          <div style={{ fontSize: "1.05rem", fontWeight: 800, color: selected ? N : TD, lineHeight: 1.1, marginTop: 2 }}>{fmt(opt.premium)}</div>
        </div>
        {/* Edit */}
        <button
          onClick={e => { e.stopPropagation(); onEdit(); }}
          className="shrink-0 flex items-center gap-1 px-2 py-1.5 hover:bg-slate-200 transition-colors"
          style={{ background: "transparent", border: `1px solid ${BD}`, color: TM, fontSize: "0.70rem", fontWeight: 600, fontFamily: font, borderRadius: 6, cursor: "pointer" }}
          title="Edit this option in Underwriting">
          <Pencil size={11} /> Edit
        </button>
        {/* Expand chevron */}
        <button
          onClick={e => { e.stopPropagation(); setIsExpanded(v => !v); }}
          className="shrink-0 flex items-center justify-center hover:bg-slate-200 transition-colors"
          style={{ width: 28, height: 28, background: "transparent", border: "none", color: TT, cursor: "pointer", borderRadius: 6 }}
          aria-expanded={isExpanded}
          title={isExpanded ? "Collapse details" : "Expand details"}>
          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>
      </div>

      {/* Expanded detail */}
      {isExpanded && (() => {
        const selectedItems = opt.coverageItems.filter(ci => ci.checked || ci.required);
        return (
        <div className="px-5 py-4 space-y-5" style={{ borderTop: `1px solid ${BDL}`, background: "#FAFBFE" }}>
          {/* Coverage Terms — all fields */}
          <div>
            <DetailHeader>Coverage Terms</DetailHeader>
            <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
              {opt.coverageFields.map(f => (
                <div key={f.label} className="px-3 py-2.5"
                  style={{ background: "white", border: `1px solid ${BDL}`, borderRadius: 8 }}>
                  <div style={{ fontSize: "0.56rem", fontWeight: 700, color: TT, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 3 }}>{f.label}</div>
                  <div style={{ fontSize: "0.80rem", fontWeight: 700, color: TD }}>{f.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Coverage */}
          <div>
            <DetailHeader>Selected Coverage</DetailHeader>
            <div style={{ background: "white", border: `1px solid ${BDL}`, borderRadius: 8, overflow: "hidden" }}>
              {selectedItems.length === 0 ? (
                <div className="px-3 py-3" style={{ fontSize: "0.72rem", color: TT, fontStyle: "italic" }}>No coverage selected.</div>
              ) : selectedItems.map((ci, i) => (
                <div key={ci.id} className="flex items-center gap-3 px-3 py-2.5"
                  style={{ borderBottom: i < selectedItems.length - 1 ? `1px solid ${BDL}` : "none" }}>
                  <span style={{ fontSize: "0.78rem", color: TD, fontWeight: 600, flex: 1 }}>{ci.label}</span>
                  {ci.required && (
                    <span style={{ fontSize: "0.54rem", fontWeight: 800, color: TT, border: `1px solid ${BD}`, padding: "1px 6px", letterSpacing: "0.06em", borderRadius: 4 }}>REQUIRED</span>
                  )}
                  {!ci.required && ci.price > 0 && (
                    <span style={{ fontSize: "0.70rem", fontWeight: 700, color: "#B45309" }}>+{fmt(ci.price)}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Endorsements */}
          <div>
            <DetailHeader>Endorsements</DetailHeader>
            <div style={{ background: "white", border: `1px solid ${BDL}`, borderRadius: 8, overflow: "hidden" }}>
              {includedEnds.length === 0 ? (
                <div className="px-3 py-3" style={{ fontSize: "0.72rem", color: TT, fontStyle: "italic" }}>No endorsements attached.</div>
              ) : includedEnds.map((e, i) => (
                <div key={e.id} className="flex items-center gap-3 px-3 py-2.5"
                  style={{ borderBottom: i < includedEnds.length - 1 ? `1px solid ${BDL}` : "none" }}>
                  <span style={{ fontSize: "0.78rem", color: TD, fontWeight: 600, flex: 1 }}>{e.label}</span>
                  <span style={{
                    fontSize: "0.54rem",
                    fontWeight: 800,
                    color: e.kind === "Default" ? product.categoryColor : N,
                    background: e.kind === "Default" ? `${product.categoryColor}12` : `${N}12`,
                    border: `1px solid ${e.kind === "Default" ? `${product.categoryColor}30` : `${N}30`}`,
                    padding: "1px 6px",
                    letterSpacing: "0.08em",
                    borderRadius: 4,
                    textTransform: "uppercase",
                  }}>{e.kind}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Schedules */}
          <div>
            <DetailHeader>Schedules</DetailHeader>
            <div style={{ background: "white", border: `1px solid ${BDL}`, borderRadius: 8, overflow: "hidden" }}>
              {MOCK_SCHEDULES.map((s, i) => (
                <div key={s.name} className="flex items-center gap-3 px-3 py-2.5"
                  style={{ borderBottom: i < MOCK_SCHEDULES.length - 1 ? `1px solid ${BDL}` : "none" }}>
                  <span style={{ fontSize: "0.78rem", color: TD, fontWeight: 600, flex: 1 }}>{s.name}</span>
                  <span style={{ fontSize: "0.70rem", color: TT }}>{s.eff} → {s.exp}</span>
                  <span style={{ fontSize: "0.78rem", color: N, fontWeight: 700, minWidth: 100, textAlign: "right" }}>{s.limit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Member Benefits */}
          <div>
            <DetailHeader>Member Benefits</DetailHeader>
            <div style={{ background: "white", border: `1px solid ${BDL}`, borderRadius: 8, overflow: "hidden" }}>
              {MOCK_BENEFITS.map(b => (
                <div key={b.title}>
                  <div className="px-3 py-2.5" style={{ borderBottom: `1px solid ${BDL}`, background: `${product.categoryColor}06` }}>
                    <span style={{ fontSize: "0.80rem", color: TD, fontWeight: 700 }}>{b.title}</span>
                  </div>
                  {b.services.map((svc, si) => (
                    <div key={svc} className="flex items-center gap-2 px-3 py-2"
                      style={{ borderBottom: si < b.services.length - 1 ? `1px solid ${BDL}` : "none", paddingLeft: 28 }}>
                      <Star size={10} color={product.categoryColor} style={{ flexShrink: 0 }} />
                      <span style={{ fontSize: "0.76rem", color: TM }}>{svc}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Notifications */}
          <div>
            <DetailHeader>Notifications</DetailHeader>
            <div style={{ background: "white", border: `1px solid ${BDL}`, borderRadius: 8, overflow: "hidden" }}>
              {MOCK_NOTIFICATIONS.map((n, i) => (
                <div key={n.code} className="flex items-center gap-3 px-3 py-2.5"
                  style={{ borderBottom: i < MOCK_NOTIFICATIONS.length - 1 ? `1px solid ${BDL}` : "none" }}>
                  <span style={{ fontSize: "0.62rem", fontWeight: 800, color: N, background: `${N}10`, border: `1px solid ${N}25`, padding: "1px 7px", letterSpacing: "0.06em", borderRadius: 4, minWidth: 64, textAlign: "center" }}>{n.code}</span>
                  <span style={{ fontSize: "0.76rem", color: TM, flex: 1 }}>{n.label.replace(`${n.code} - `, "")}</span>
                  <span style={{ fontSize: "0.68rem", color: TT }}>{n.edition}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        );
      })()}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════════════════ */
export function QuotePreviewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [products, setProducts] = useState<ProductPayload[]>([]);
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set());
  const [selectedOptions, setSelectedOptions] = useState<Set<string>>(new Set());
  const [creating, setCreating] = useState(false);
  const [created, setCreated]   = useState(false);
  const [sending, setSending]   = useState(false);
  const [sent, setSent]         = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem("ratingPreview");
    if (raw) {
      const data: ProductPayload[] = JSON.parse(raw);
      setProducts(data);
    }
  }, []);

  const grandTotal = products.reduce((sum, p) => sum + (p.options[0]?.premium ?? 0), 0);
  const quoteNum   = "QTE-" + (id ?? "001").padStart(6, "0");
  const today      = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  const toggleProduct = (pid: string) => {
    setExpandedProducts(prev => {
      const next = new Set(prev);
      next.has(pid) ? next.delete(pid) : next.add(pid);
      return next;
    });
  };

  const optionKey = (pid: string, oid: string) => `${pid}::${oid}`;
  const isOptionSelected = (pid: string, oid: string) => selectedOptions.has(optionKey(pid, oid));
  const toggleOptionSelected = (pid: string, oid: string) => {
    setSelectedOptions(prev => {
      const next = new Set(prev);
      const key = optionKey(pid, oid);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };
  const productSelectionState = (p: ProductPayload): "all" | "some" | "none" => {
    const total = p.options.length;
    if (total === 0) return "none";
    const sel = p.options.filter(o => isOptionSelected(p.id, o.id)).length;
    if (sel === 0) return "none";
    if (sel === total) return "all";
    return "some";
  };
  const toggleProductSelection = (p: ProductPayload) => {
    const state = productSelectionState(p);
    setSelectedOptions(prev => {
      const next = new Set(prev);
      if (state === "all") {
        p.options.forEach(o => next.delete(optionKey(p.id, o.id)));
      } else {
        p.options.forEach(o => next.add(optionKey(p.id, o.id)));
      }
      return next;
    });
  };
  const handleEditOption = (pid: string, oid: string) => {
    navigate(`/submission/${id}?tab=rating&focus=${pid}::${oid}`);
  };

  const productsWithSelection = products.filter(p => p.options.some(o => isOptionSelected(p.id, o.id))).length;
  const allProductsHaveSelection = products.length > 0 && productsWithSelection === products.length;
  const selectedTotal = products.reduce((sum, p) => {
    const sel = p.options.filter(o => isOptionSelected(p.id, o.id));
    return sum + sel.reduce((s, o) => s + o.premium, 0);
  }, 0);

  const handleCreateQuote = () => {
    if (!allProductsHaveSelection || creating || created) return;
    setCreating(true);
    setTimeout(() => {
      setCreating(false);
      setCreated(true);
    }, 900);
  };

  const handleSendQuote = () => {
    if (!created || sending || sent) return;
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSent(true);
    }, 900);
  };

  return (
    <AppShell role={(user?.role ?? "underwriter") as RoleId}>
      <div style={{ fontFamily: font, color: TD }}>

        {/* ── Page header ─────────────────────────────────────────── */}
        <div style={{ background: "white", borderBottom: `2px solid ${BDL}` }}>
          {/* Blue accent bar */}
          <div style={{ height: 4, background: `linear-gradient(90deg, ${N} 0%, ${G} 100%)` }} />
          <div className="flex items-center justify-between px-8 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(`/submission/${id}?tab=rating`)}
                className="flex items-center gap-2 hover:opacity-70 transition-opacity"
                style={{ color: N, fontSize: "0.78rem", fontWeight: 700, background: "none", border: "none", cursor: "pointer", fontFamily: font }}>
                <ArrowLeft size={15} /> Back to Underwriting
              </button>
              <span style={{ color: BDL }}>|</span>
              <div>
                <div className="flex items-center gap-3">
                  <h1 style={{ fontSize: "1.10rem", fontWeight: 800, color: TD }}>Quote Preview</h1>
                  <span style={{ fontSize: "0.68rem", fontWeight: 800, color: N, background: `${N}12`, border: `1px solid ${N}25`, padding: "2px 10px", letterSpacing: "0.06em", borderRadius: 4 }}>{quoteNum}</span>
                  <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "#1A7A4A", background: "#E8F5E9", border: "1px solid #81C784", padding: "2px 8px", borderRadius: 4 }}>DRAFT</span>
                </div>
                <p style={{ fontSize: "0.72rem", color: TT, marginTop: 3 }}>
                  Generated {today} · {products.length} product{products.length !== 1 ? "s" : ""} ·&nbsp;
                  {products.reduce((s, p) => s + p.options.length, 0)} option{products.reduce((s, p) => s + p.options.length, 0) !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="flex items-center gap-2 px-4 py-2 hover:brightness-95 transition-all"
                style={{ border: `1.5px solid ${BD}`, background: "white", color: TM, fontSize: "0.76rem", fontWeight: 600, fontFamily: font, borderRadius: 8 }}>
                <Printer size={14} /> Print
              </button>
              <button
                className="flex items-center gap-2 px-4 py-2 hover:brightness-95 transition-all"
                style={{ border: `1.5px solid ${BD}`, background: "white", color: TM, fontSize: "0.76rem", fontWeight: 600, fontFamily: font, borderRadius: 8 }}>
                <Download size={14} /> Download PDF
              </button>
            </div>
          </div>
        </div>

        {/* ── Body ─────────────────────────────────────────────────── */}
        <div className="px-8 py-6 space-y-6" style={{ maxWidth: 1200, margin: "0 auto" }}>

          {/* No data state */}
          {products.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 gap-4" style={{ color: TT }}>
              <FileText size={48} color={BD} />
              <div style={{ fontSize: "1rem", fontWeight: 700, color: TM }}>No rating data found</div>
              <p style={{ fontSize: "0.82rem", color: TT, textAlign: "center", maxWidth: 340 }}>
                Go back to the submission's Rating tab, configure at least one product, and click "Preview Quote".
              </p>
              <button
                onClick={() => navigate(`/submission/${id}`)}
                className="flex items-center gap-2 px-5 py-2 hover:brightness-95 transition-all mt-2"
                style={{ background: N, color: "white", border: "none", cursor: "pointer", fontSize: "0.80rem", fontWeight: 700, fontFamily: font }}>
                <ArrowLeft size={14} /> Go to Submission
              </button>
            </div>
          )}

          {/* Quote summary card */}
          {products.length > 0 && (() => {
            const broker = { name: "Karen Hollis", firm: "Gallagher Education, Inc." };
            const insured = "Brookfield Day School";
            const summaryFields = [
              { label: "Quote No.",  value: quoteNum },
              { label: "Insured",    value: insured },
              { label: "Effective",  value: "07/01/2026 → 07/01/2027" },
              { label: "Broker",     value: `${broker.name} · ${broker.firm}` },
              { label: "Generated",  value: today },
              { label: "Products",   value: `${products.length} line${products.length !== 1 ? "s" : ""}` },
            ];
            return (
              <div style={{ background: "white", border: `1px solid ${BDL}`, borderRadius: 10, overflow: "hidden" }}>
                <div className="grid gap-x-8 gap-y-4 px-6 py-5"
                  style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
                  {summaryFields.map(f => (
                    <div key={f.label}>
                      <div style={{ fontSize: "0.58rem", fontWeight: 800, color: TT, textTransform: "uppercase", letterSpacing: "0.10em", marginBottom: 4 }}>{f.label}</div>
                      <div style={{ fontSize: "0.82rem", fontWeight: 700, color: TD }}>{f.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Product sections */}
          {products.map(product => {
            const isExpanded = expandedProducts.has(product.id);
            const selState   = productSelectionState(product);
            return (
              <div key={product.id} style={{ border: `1px solid ${BD}`, background: "white", overflow: "hidden", borderRadius: 10 }}>
                {/* Product header */}
                <div style={{ borderTop: `4px solid ${product.categoryColor}` }}>
                  <div
                    onClick={() => toggleProduct(product.id)}
                    className="w-full flex items-center justify-between gap-3 px-6 py-4 cursor-pointer hover:bg-slate-50 transition-all"
                    style={{ background: "white", fontFamily: font }}>
                    {/* Master checkbox — select / deselect all options for this product */}
                    <div
                      onClick={e => { e.stopPropagation(); toggleProductSelection(product); }}
                      className="shrink-0 flex items-center justify-center"
                      style={{
                        width: 18, height: 18,
                        background: selState === "none" ? "white" : N,
                        border: `2px solid ${selState === "none" ? BD : N}`,
                        transition: "all 0.12s",
                        borderRadius: 3,
                        cursor: "pointer",
                      }}
                      role="checkbox"
                      aria-checked={selState === "all" ? "true" : selState === "some" ? "mixed" : "false"}
                      title={selState === "all" ? "Deselect all options" : "Select all options"}>
                      {selState === "all"  && <Check size={10} color="white" strokeWidth={3} />}
                      {selState === "some" && <span style={{ width: 8, height: 2, background: "white", display: "block" }} />}
                    </div>
                    <div className="flex items-center gap-3 flex-wrap flex-1 min-w-0">
                      <span style={{ fontSize: "0.64rem", fontWeight: 800, color: "white", background: product.categoryColor, padding: "3px 10px", letterSpacing: "0.08em", borderRadius: 4 }}>{product.abbr}</span>
                      <span style={{ fontSize: "1.0rem", fontWeight: 800, color: TD }}>{product.label}</span>
                      <span style={{ fontSize: "0.62rem", fontWeight: 700, color: product.categoryColor, background: `${product.categoryColor}12`, border: `1px solid ${product.categoryColor}25`, padding: "2px 8px", borderRadius: 4 }}>{product.category}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span style={{ fontSize: "0.72rem", color: TT }}>
                        {product.options.length} option{product.options.length !== 1 ? "s" : ""} · select one or more
                      </span>
                      <span style={{ color: TT }}>
                        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Options */}
                {isExpanded && (
                  <div className="space-y-2 px-4 py-4" style={{ borderTop: `1px solid ${BDL}`, background: "#FAFBFE" }}>
                    {product.options.length === 0 && (
                      <div className="px-2 py-3" style={{ color: TT, fontSize: "0.80rem" }}>No options configured for this product.</div>
                    )}
                    {product.options.map(opt => (
                      <OptionCard
                        key={opt.id}
                        opt={opt}
                        product={product}
                        selected={isOptionSelected(product.id, opt.id)}
                        onToggleSelect={() => toggleOptionSelected(product.id, opt.id)}
                        onEdit={() => handleEditOption(product.id, opt.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* Create Quote action */}
          {products.length > 0 && (
            <div style={{ background: "white", border: `1px solid ${BDL}`, borderRadius: 10, overflow: "hidden" }}>
              {!allProductsHaveSelection && (
                <div className="flex items-start gap-3 px-5 py-3"
                  style={{ background: "#FFF8E6", borderBottom: "1px solid #F0D88A" }}>
                  <AlertCircle size={14} color="#8A5C00" style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <p style={{ fontSize: "0.76rem", fontWeight: 700, color: "#7A4800", marginBottom: 2 }}>Select at least one option for every product</p>
                    <p style={{ fontSize: "0.70rem", color: "#7A4800", lineHeight: 1.5 }}>
                      {productsWithSelection} of {products.length} product{products.length !== 1 ? "s" : ""} ready — pick an option in the remaining {products.length - productsWithSelection} to enable quote creation.
                    </p>
                  </div>
                </div>
              )}
              <div className="flex items-center justify-between gap-4 px-5 py-4">
                <div>
                  <p style={{ fontSize: "0.86rem", fontWeight: 800, color: TD, lineHeight: 1.25 }}>
                    {sent     ? "Quote sent to broker"
                     : created ? "Quote created — ready to send"
                     :           "Ready to create this quote?"}
                  </p>
                  <p style={{ fontSize: "0.72rem", color: TT, marginTop: 3 }}>
                    {created
                      ? <>Quote record <strong style={{ color: TM }}>{quoteNum}</strong></>
                      : selectedOptions.size === 0
                        ? "No options selected yet."
                        : <>Selected: <strong style={{ color: TM }}>{selectedOptions.size}</strong> option{selectedOptions.size !== 1 ? "s" : ""} across <strong style={{ color: TM }}>{productsWithSelection}</strong> product{productsWithSelection !== 1 ? "s" : ""}</>
                    }
                  </p>
                </div>
                {sent ? (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      disabled
                      className="flex items-center gap-2 px-4 py-2.5"
                      style={{ border: "1.5px solid #93C8A0", background: "#E8F5EC", color: "#15803D", fontSize: "0.78rem", fontWeight: 800, fontFamily: font, borderRadius: 8, cursor: "default" }}>
                      <CheckCircle2 size={14} /> Sent
                    </button>
                    <button
                      onClick={() => navigate(`/submission/${id}?tab=rating`)}
                      className="flex items-center gap-2 px-4 py-2.5 transition-all hover:bg-slate-50 active:scale-95"
                      style={{ border: `1.5px solid ${BD}`, background: "white", color: TM, fontSize: "0.78rem", fontWeight: 700, fontFamily: font, borderRadius: 8, cursor: "pointer" }}>
                      <Plus size={14} /> Add Option
                    </button>
                    <button
                      onClick={() => navigate(`/submission/${id}/bind`)}
                      className="flex items-center gap-2 px-4 py-2.5 transition-all active:scale-95"
                      style={{ border: "none", background: N, color: "white", fontSize: "0.78rem", fontWeight: 800, fontFamily: font, borderRadius: 8, cursor: "pointer", boxShadow: `0 2px 10px ${N}35` }}>
                      <FileCheck2 size={14} /> Bind Quote
                    </button>
                  </div>
                ) : created ? (
                  <button
                    onClick={handleSendQuote}
                    disabled={sending}
                    className="flex items-center gap-2 px-5 py-2.5 transition-all active:scale-95 shrink-0"
                    style={{
                      border: "none",
                      background: sending ? `${N}90` : N,
                      color: "white",
                      fontSize: "0.82rem", fontWeight: 800, fontFamily: font, borderRadius: 8,
                      cursor: sending ? "default" : "pointer",
                      boxShadow: `0 2px 10px ${N}35`,
                    }}>
                    {sending
                      ? <>Sending…</>
                      : <><Send size={15} /> Send to Broker</>}
                  </button>
                ) : (
                  <button
                    onClick={handleCreateQuote}
                    disabled={!allProductsHaveSelection || creating}
                    className="flex items-center gap-2 px-5 py-2.5 transition-all active:scale-95 shrink-0"
                    style={{
                      border: "none",
                      background: !allProductsHaveSelection ? BD : (creating ? `${N}90` : N),
                      color: "white",
                      fontSize: "0.82rem", fontWeight: 800, fontFamily: font, borderRadius: 8,
                      cursor: !allProductsHaveSelection ? "not-allowed" : (creating ? "default" : "pointer"),
                      boxShadow: !allProductsHaveSelection ? "none" : `0 2px 10px ${N}35`,
                      opacity: !allProductsHaveSelection ? 0.7 : 1,
                    }}>
                    {creating
                      ? <>Creating…</>
                      : <><FileText size={15} /> Create Quote</>}
                  </button>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </AppShell>
  );
}
