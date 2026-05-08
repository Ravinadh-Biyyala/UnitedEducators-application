import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { AppShell } from "../components/AppShell";
import type { RoleId } from "../components/AppShell";
import { useAuth } from "../context/AuthContext";
import {
  ArrowLeft, Printer, Download, Shield, Layers, Calendar,
  Star, Bell, ChevronDown, ChevronRight, Check, DollarSign,
  AlertCircle, FileText, BookOpen,
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
function OptionCard({ opt, product }: { opt: OptionPayload; product: ProductPayload }) {
  const [openSections, setOpenSections] = useState<Set<SectionKey>>(
    new Set(["policy", "endorsements", "schedules", "memberBenefits", "notifications"])
  );
  const color = product.categoryColor;

  const toggle = (key: SectionKey) => {
    setOpenSections(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  return (
    <div style={{ border: `1.5px solid ${opt.color}40`, background: "white", overflow: "hidden" }}>
      {/* Option header bar */}
      <div className="flex items-center justify-between px-5 py-3"
        style={{ background: opt.color, color: "white" }}>
        <div className="flex items-center gap-3">
          <span style={{ width: 10, height: 10, background: "rgba(255,255,255,0.5)", borderRadius: "50%", display: "inline-block" }} />
          <span style={{ fontSize: "0.88rem", fontWeight: 800, letterSpacing: "0.04em" }}>{opt.label}</span>
        </div>
        <div className="text-right">
          <div style={{ fontSize: "0.58rem", fontWeight: 700, opacity: 0.7, textTransform: "uppercase", letterSpacing: "0.10em" }}>Total Premium</div>
          <div style={{ fontSize: "1.30rem", fontWeight: 800, lineHeight: 1.1 }}>{fmt(opt.premium)}</div>
        </div>
      </div>

      {/* Sections */}
      <div>
        {SECTIONS.map((sec, si) => {
          const isOpen = openSections.has(sec.key);
          return (
            <div key={sec.key} style={{ borderTop: si === 0 ? "none" : `1px solid ${BDL}` }}>
              {/* Section header — clickable */}
              <button
                onClick={() => toggle(sec.key)}
                className="w-full flex items-center justify-between px-5 py-3 hover:brightness-97 transition-all"
                style={{ background: isOpen ? `${opt.color}06` : TH, border: "none", cursor: "pointer", fontFamily: font }}>
                <div className="flex items-center gap-2.5">
                  <span style={{ color: isOpen ? opt.color : TT }}>{sec.icon}</span>
                  <span style={{ fontSize: "0.80rem", fontWeight: isOpen ? 700 : 600, color: isOpen ? opt.color : TM }}>{sec.label}</span>
                </div>
                <span style={{ color: TT }}>
                  {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </span>
              </button>

              {/* Section content */}
              {isOpen && (
                <div className="px-5 py-5" style={{ background: "#FAFBFE", borderTop: `1px solid ${BDL}` }}>
                  {sec.key === "policy"         && <PolicySection opt={opt} color={color} />}
                  {sec.key === "endorsements"   && <EndorsementsSection opt={opt} product={product} />}
                  {sec.key === "schedules"      && <SchedulesSection color={color} />}
                  {sec.key === "memberBenefits" && <MemberBenefitsSection color={color} />}
                  {sec.key === "notifications"  && <NotificationsSection />}
                </div>
              )}
            </div>
          );
        })}
      </div>
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

  useEffect(() => {
    const raw = sessionStorage.getItem("ratingPreview");
    if (raw) {
      const data: ProductPayload[] = JSON.parse(raw);
      setProducts(data);
      setExpandedProducts(new Set(data.map(p => p.id)));
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
                onClick={() => navigate(`/submission/${id}`)}
                className="flex items-center gap-2 hover:opacity-70 transition-opacity"
                style={{ color: N, fontSize: "0.78rem", fontWeight: 700, background: "none", border: "none", cursor: "pointer", fontFamily: font }}>
                <ArrowLeft size={15} /> Back to Submission
              </button>
              <span style={{ color: BDL }}>|</span>
              <div>
                <div className="flex items-center gap-3">
                  <h1 style={{ fontSize: "1.10rem", fontWeight: 800, color: TD }}>Quote Preview</h1>
                  <span style={{ fontSize: "0.68rem", fontWeight: 800, color: N, background: `${N}12`, border: `1px solid ${N}25`, padding: "2px 10px", letterSpacing: "0.06em" }}>{quoteNum}</span>
                  <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "#1A7A4A", background: "#E8F5E9", border: "1px solid #81C784", padding: "2px 8px" }}>DRAFT</span>
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
                style={{ border: `1.5px solid ${BD}`, background: "white", color: TM, fontSize: "0.76rem", fontWeight: 600, fontFamily: font }}>
                <Printer size={14} /> Print
              </button>
              <button
                className="flex items-center gap-2 px-4 py-2 hover:brightness-95 transition-all"
                style={{ border: `1.5px solid ${BD}`, background: "white", color: TM, fontSize: "0.76rem", fontWeight: 600, fontFamily: font }}>
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

          {/* Grand total summary bar */}
          {products.length > 0 && (
            <div className="flex items-center justify-between px-6 py-4"
              style={{ background: N, border: `1px solid ${N}`, color: "white" }}>
              <div>
                <div style={{ fontSize: "0.62rem", fontWeight: 700, opacity: 0.65, textTransform: "uppercase", letterSpacing: "0.10em", marginBottom: 4 }}>Indicative Grand Total (Option 01 Basis)</div>
                <div className="flex items-center gap-6 flex-wrap">
                  {products.map(p => (
                    <div key={p.id} className="flex items-center gap-2">
                      <span style={{ fontSize: "0.68rem", fontWeight: 800, color: G, background: "rgba(201,162,39,0.18)", border: `1px solid ${G}40`, padding: "1px 6px" }}>{p.abbr}</span>
                      <span style={{ fontSize: "0.80rem", fontWeight: 700, opacity: 0.9 }}>{fmt(p.options[0]?.premium ?? 0)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="text-right">
                <div style={{ fontSize: "0.62rem", fontWeight: 700, opacity: 0.65, textTransform: "uppercase", letterSpacing: "0.10em", marginBottom: 3 }}>Grand Total</div>
                <div style={{ fontSize: "2rem", fontWeight: 800, lineHeight: 1 }}>{fmt(grandTotal)}</div>
              </div>
            </div>
          )}

          {/* Product sections */}
          {products.map(product => {
            const isExpanded = expandedProducts.has(product.id);
            return (
              <div key={product.id} style={{ border: `1px solid ${BD}`, background: "white", overflow: "hidden" }}>
                {/* Product header */}
                <div style={{ borderTop: `4px solid ${product.categoryColor}` }}>
                  <button
                    onClick={() => toggleProduct(product.id)}
                    className="w-full flex items-center justify-between px-6 py-4 hover:brightness-97 transition-all"
                    style={{ background: "white", border: "none", cursor: "pointer", fontFamily: font }}>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-between gap-3">
                        <span style={{ fontSize: "0.64rem", fontWeight: 800, color: "white", background: product.categoryColor, padding: "3px 10px", letterSpacing: "0.08em" }}>{product.abbr}</span>
                        <span style={{ fontSize: "1.0rem", fontWeight: 800, color: TD }}>{product.label}</span>
                        <span style={{ fontSize: "0.62rem", fontWeight: 700, color: product.categoryColor, background: `${product.categoryColor}12`, border: `1px solid ${product.categoryColor}25`, padding: "2px 8px" }}>{product.category}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-3">
                        {product.options.map(o => (
                          <div key={o.id} className="flex items-center gap-1.5" title={o.label}>
                            <span style={{ width: 8, height: 8, background: o.color, borderRadius: "50%", display: "inline-block" }} />
                            <span style={{ fontSize: "0.72rem", fontWeight: 700, color: o.color }}>{fmt(o.premium)}</span>
                          </div>
                        ))}
                      </div>
                      <span style={{ color: TT }}>
                        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </span>
                    </div>
                  </button>
                </div>

                {/* Options */}
                {isExpanded && (
                  <div className="space-y-0" style={{ borderTop: `1px solid ${BDL}` }}>
                    {product.options.length === 0 && (
                      <div className="px-6 py-6" style={{ color: TT, fontSize: "0.80rem" }}>No options configured for this product.</div>
                    )}
                    {product.options.map((opt, oi) => (
                      <div key={opt.id} style={{ borderTop: oi > 0 ? `2px dashed ${BDL}` : "none", padding: "24px 24px" }}>
                        <OptionCard opt={opt} product={product} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* Disclaimer footer */}
          {products.length > 0 && (
            <div className="flex items-start gap-3 p-4" style={{ background: "#FFF8E6", border: "1px solid #F0D88A" }}>
              <AlertCircle size={14} color="#8A5C00" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <p style={{ fontSize: "0.76rem", fontWeight: 700, color: "#7A4800", marginBottom: 4 }}>Indicative Pricing Disclaimer</p>
                <p style={{ fontSize: "0.70rem", color: "#7A4800", lineHeight: 1.6 }}>
                  All premiums shown are indicative only and subject to full underwriting review, actuarial sign-off, and final approval.
                  This preview does not constitute a binding quote or commitment to insure. Final terms may vary.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
