import { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppShell } from "../components/AppShell";
import type { RoleId } from "../components/AppShell";
import { useAuth } from "../context/AuthContext";
import {
  ArrowLeft, Send, CheckCircle2,
  Mail, FileText, AlertCircle, Building2,
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
const OK  = "#15803D";
const font = "'Source Sans 3', system-ui, sans-serif";

const fmt = (n: number) => "$" + n.toLocaleString("en-US");

/* ── Types (mirror the RatingTab payload, same as QuotePreviewPage) ─────── */
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

/* ── Mock broker recipient (would come from submission record in real app) */
const BROKER = {
  name:     "T. Owens",
  company:  "Gallagher Education, Inc.",
  email:    "t.owens@gallaghered.com",
};

/* ═══════════════════════════════════════════════════════════════════════════
   PAGE
═══════════════════════════════════════════════════════════════════════════ */
export function BindQuotePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [products, setProducts]       = useState<ProductPayload[]>([]);
  const [selections, setSelections]   = useState<Record<string, string>>({});
  const [issuanceStatus, setIssuance] = useState<"idle" | "processing" | "sent">("idle");

  // Pull the same payload the Preview uses
  useEffect(() => {
    const raw = sessionStorage.getItem("ratingPreview");
    if (raw) {
      const data: ProductPayload[] = JSON.parse(raw);
      setProducts(data);
      // Default-select the first option for each product
      const initial: Record<string, string> = {};
      data.forEach(p => { if (p.options[0]) initial[p.id] = p.options[0].id; });
      setSelections(initial);
    }
  }, []);

  const selectedTotal = useMemo(() => {
    return products.reduce((sum, p) => {
      const optId = selections[p.id];
      const opt = p.options.find(o => o.id === optId);
      return sum + (opt?.premium ?? 0);
    }, 0);
  }, [products, selections]);

  const allProductsHaveSelection =
    products.length > 0 && products.every(p => !!selections[p.id]);

  const handleIssue = () => {
    setIssuance("processing");
    setTimeout(() => setIssuance("sent"), 1300);
  };

  const quoteNum = "QTE-" + (id ?? "001").padStart(6, "0");
  const today    = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  return (
    <AppShell role={(user?.role ?? "underwriter") as RoleId}>
      <div style={{ fontFamily: font, color: TD }}>

        {/* ── Header ────────────────────────────────────────────────── */}
        <div style={{ background: "white", borderBottom: `2px solid ${BDL}` }}>
          <div style={{ height: 4, background: `linear-gradient(90deg, ${N} 0%, ${G} 100%)` }} />
          <div className="flex items-center justify-between px-8 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(`/submission/${id}?tab=rating`)}
                className="flex items-center gap-2 hover:opacity-70 transition-opacity"
                style={{ color: N, fontSize: "0.78rem", fontWeight: 700, background: "none", border: "none", cursor: "pointer", fontFamily: font, borderRadius: 6 }}>
                <ArrowLeft size={15} /> Back to Underwriting
              </button>
              <span style={{ color: BDL }}>|</span>
              <div>
                <div className="flex items-center gap-3">
                  <h1 style={{ fontSize: "1.10rem", fontWeight: 800, color: TD }}>Bind Quote</h1>
                  <span style={{ fontSize: "0.68rem", fontWeight: 800, color: N, background: `${N}12`, border: `1px solid ${N}25`, padding: "2px 10px", letterSpacing: "0.06em" }}>{quoteNum}</span>
                  {issuanceStatus === "sent"
                    ? <span style={{ fontSize: "0.68rem", fontWeight: 700, color: OK, background: "#E8F5E9", border: `1px solid #81C784`, padding: "2px 8px" }}>ISSUED</span>
                    : <span style={{ fontSize: "0.68rem", fontWeight: 700, color: "#7A4800", background: "#FFF8E6", border: "1px solid #F0D88A", padding: "2px 8px" }}>READY TO ISSUE</span>}
                </div>
                <p style={{ fontSize: "0.72rem", color: TT, marginTop: 3 }}>
                  Prepared {today} · {products.length} product{products.length !== 1 ? "s" : ""} · Select one option per product
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Body ─────────────────────────────────────────────────── */}
        <div className="px-8 py-6 space-y-6" style={{ maxWidth: 1100, margin: "0 auto" }}>

          {/* No-data state */}
          {products.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 gap-4" style={{ color: TT }}>
              <FileText size={48} color={BD} />
              <div style={{ fontSize: "1rem", fontWeight: 700, color: TM }}>No quote data found</div>
              <p style={{ fontSize: "0.82rem", color: TT, textAlign: "center", maxWidth: 360 }}>
                Build and preview a quote from the submission's Rating tab before binding.
              </p>
              <button
                onClick={() => navigate(`/submission/${id}`)}
                className="flex items-center gap-2 px-5 py-2 hover:brightness-95 transition-all mt-2"
                style={{ background: N, color: "white", border: "none", cursor: "pointer", fontSize: "0.80rem", fontWeight: 700, fontFamily: font, borderRadius: 6 }}>
                <ArrowLeft size={14} /> Go to Submission
              </button>
            </div>
          )}

          {/* ── Success state ──────────────────────────────────────── */}
          {products.length > 0 && issuanceStatus === "sent" && (
            <div style={{ background: "white", border: `1px solid #81C784`, borderTop: `4px solid ${OK}`, borderRadius: 8, overflow: "hidden", boxShadow: "0 2px 8px rgba(21,128,61,0.10)" }}>
              <div className="px-8 py-7 flex flex-col items-center text-center gap-3"
                style={{ background: "linear-gradient(180deg, #F0FAF3 0%, white 100%)" }}>
                <div style={{ width: 56, height: 56, borderRadius: "50%", background: "#E8F5E9", border: `2px solid #81C784`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <CheckCircle2 size={30} color={OK} />
                </div>
                <h2 style={{ fontSize: "1.20rem", fontWeight: 800, color: OK }}>Issuance Document Sent</h2>
                <p style={{ fontSize: "0.82rem", color: TM, lineHeight: 1.55, maxWidth: 540 }}>
                  The binding issuance package for <strong style={{ color: TD }}>{quoteNum}</strong> has been delivered to the broker.
                  They will receive confirmation shortly and can proceed to bind.
                </p>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 mt-1"
                  style={{ background: "white", border: `1px solid ${BDL}`, borderRadius: 6 }}>
                  <Mail size={13} color={N} />
                  <span style={{ fontSize: "0.74rem", color: TD, fontWeight: 600 }}>{BROKER.name} · {BROKER.company}</span>
                  <span style={{ color: BDL }}>·</span>
                  <span style={{ fontSize: "0.72rem", color: N, fontFamily: "ui-monospace, monospace" }}>{BROKER.email}</span>
                </div>
              </div>

              {/* Selected bind summary */}
              <div className="px-8 py-5" style={{ borderTop: `1px solid ${BDL}`, background: "#FAFBFE" }}>
                <div style={{ fontSize: "0.60rem", fontWeight: 800, color: TT, textTransform: "uppercase", letterSpacing: "0.10em", marginBottom: 10 }}>
                  Bound Selections
                </div>
                <div className="space-y-2">
                  {products.map(p => {
                    const opt = p.options.find(o => o.id === selections[p.id]);
                    if (!opt) return null;
                    return (
                      <div key={p.id} className="flex items-center justify-between px-4 py-3"
                        style={{ background: "white", border: `1px solid ${BDL}`, borderRadius: 6 }}>
                        <div className="flex items-center gap-3">
                          <span style={{ fontSize: "0.62rem", fontWeight: 800, color: "white", background: p.categoryColor, padding: "2px 8px", letterSpacing: "0.06em" }}>{p.abbr}</span>
                          <span style={{ fontSize: "0.82rem", fontWeight: 700, color: TD }}>{p.label}</span>
                          <span style={{ fontSize: "0.68rem", color: TT }}>·</span>
                          <span style={{ fontSize: "0.74rem", fontWeight: 600, color: TM }}>{opt.label}</span>
                        </div>
                        <span style={{ fontSize: "0.86rem", fontWeight: 800, color: OK, fontVariantNumeric: "tabular-nums" }}>{fmt(opt.premium)}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center justify-between px-4 py-3 mt-3"
                  style={{ background: `${OK}10`, border: `1.5px solid ${OK}50`, borderRadius: 6 }}>
                  <span style={{ fontSize: "0.78rem", fontWeight: 700, color: TD }}>Total Bound Premium</span>
                  <span style={{ fontSize: "1.10rem", fontWeight: 800, color: OK, fontVariantNumeric: "tabular-nums" }}>{fmt(selectedTotal)}</span>
                </div>
              </div>

              <div className="px-8 py-4 flex items-center justify-end gap-2" style={{ borderTop: `1px solid ${BDL}` }}>
                <button onClick={() => navigate(`/submission/${id}`)}
                  className="flex items-center gap-2 px-5 py-2 hover:brightness-95 transition-all"
                  style={{ background: N, color: "white", border: "none", cursor: "pointer", fontSize: "0.78rem", fontWeight: 700, fontFamily: font, borderRadius: 6 }}>
                  <ArrowLeft size={13} /> Return to Submission
                </button>
              </div>
            </div>
          )}

          {/* ── Selection state ────────────────────────────────────── */}
          {products.length > 0 && issuanceStatus !== "sent" && (
            <>
              {/* Summary bar */}
              <div className="flex items-center justify-between px-6 py-4"
                style={{ background: N, border: `1px solid ${N}`, color: "white", borderRadius: 6 }}>
                <div>
                  <div style={{ fontSize: "0.62rem", fontWeight: 700, opacity: 0.65, textTransform: "uppercase", letterSpacing: "0.10em", marginBottom: 4 }}>Selected Options Total</div>
                  <div className="flex items-center gap-3 flex-wrap">
                    {products.map(p => {
                      const opt = p.options.find(o => o.id === selections[p.id]);
                      return (
                        <div key={p.id} className="flex items-center gap-2">
                          <span style={{ fontSize: "0.66rem", fontWeight: 800, color: G, background: "rgba(201,162,39,0.20)", border: `1px solid ${G}40`, padding: "1px 6px" }}>{p.abbr}</span>
                          <span style={{ fontSize: "0.78rem", fontWeight: 700, opacity: 0.9 }}>
                            {opt ? `${opt.label} · ${fmt(opt.premium)}` : "— not selected"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="text-right">
                  <div style={{ fontSize: "0.62rem", fontWeight: 700, opacity: 0.65, textTransform: "uppercase", letterSpacing: "0.10em", marginBottom: 3 }}>Total Premium</div>
                  <div style={{ fontSize: "1.80rem", fontWeight: 800, lineHeight: 1 }}>{fmt(selectedTotal)}</div>
                </div>
              </div>

              {/* Product cards with single-select radios */}
              {products.map(product => (
                <div key={product.id}
                  style={{ background: "white", border: `1px solid ${BD}`, borderTop: `4px solid ${product.categoryColor}`, borderRadius: 8, overflow: "hidden" }}>
                  {/* Product header */}
                  <div className="flex items-center justify-between px-6 py-3.5"
                    style={{ borderBottom: `1px solid ${BDL}`, background: "#FAFBFD" }}>
                    <div className="flex items-center gap-3">
                      <span style={{ fontSize: "0.64rem", fontWeight: 800, color: "white", background: product.categoryColor, padding: "3px 10px", letterSpacing: "0.08em" }}>{product.abbr}</span>
                      <span style={{ fontSize: "0.96rem", fontWeight: 800, color: TD }}>{product.label}</span>
                      <span style={{ fontSize: "0.62rem", fontWeight: 700, color: product.categoryColor, background: `${product.categoryColor}12`, border: `1px solid ${product.categoryColor}25`, padding: "2px 8px" }}>{product.category}</span>
                    </div>
                    <span style={{ fontSize: "0.68rem", color: TT }}>
                      {product.options.length} option{product.options.length !== 1 ? "s" : ""} · select one
                    </span>
                  </div>

                  {/* Options as radio rows */}
                  <div role="radiogroup" aria-label={`${product.label} options`}>
                    {product.options.length === 0 && (
                      <div className="px-6 py-6" style={{ color: TT, fontSize: "0.80rem" }}>
                        No options configured for this product.
                      </div>
                    )}
                    {product.options.map((opt, oi) => {
                      const isSelected = selections[product.id] === opt.id;
                      return (
                        <label key={opt.id}
                          className="flex items-center gap-4 px-6 py-4 cursor-pointer transition-all"
                          style={{
                            borderBottom: oi < product.options.length - 1 ? `1px solid ${BDL}` : "none",
                            background: isSelected ? "#c1d5ff20" : "white",
                            borderLeft: isSelected ? `3px solid ${N}` : "3px solid transparent",
                          }}>
                          <input
                            type="radio"
                            name={`opt-${product.id}`}
                            value={opt.id}
                            checked={isSelected}
                            onChange={() => setSelections(s => ({ ...s, [product.id]: opt.id }))}
                            style={{ width: 18, height: 18, accentColor: N, cursor: "pointer", flexShrink: 0 }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span style={{ width: 10, height: 10, background: opt.color, borderRadius: "50%", display: "inline-block", flexShrink: 0 }} />
                              <span style={{ fontSize: "0.88rem", fontWeight: 700, color: TD }}>{opt.label}</span>
                              {isSelected && (
                                <span className="inline-flex items-center gap-1"
                                  style={{ fontSize: "0.58rem", fontWeight: 800, color: N, background: `${N}12`, border: `1px solid ${N}30`, padding: "1px 6px", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                                  <CheckCircle2 size={9} /> Selected
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                              {opt.coverageFields.slice(0, 3).map(f => (
                                <span key={f.label} style={{ fontSize: "0.66rem", color: TT }}>
                                  <span style={{ color: TT }}>{f.label}:</span>{" "}
                                  <span style={{ color: TM, fontWeight: 600 }}>{f.value}</span>
                                </span>
                              ))}
                              {opt.addedEndorsements.filter(e => e.included).length > 0 && (
                                <span style={{ fontSize: "0.66rem", color: TM }}>
                                  +{opt.addedEndorsements.filter(e => e.included).length} endorsement{opt.addedEndorsements.filter(e => e.included).length === 1 ? "" : "s"}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <div style={{ fontSize: "0.58rem", fontWeight: 700, color: TT, textTransform: "uppercase", letterSpacing: "0.10em" }}>Premium</div>
                            <div style={{ fontSize: "1.10rem", fontWeight: 800, color: isSelected ? N : TD, fontVariantNumeric: "tabular-nums" }}>{fmt(opt.premium)}</div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Action bar */}
              <div className="flex items-center justify-between px-6 py-4 flex-wrap gap-3"
                style={{ background: "white", border: `1px solid ${BD}`, borderTop: `3px solid ${G}`, borderRadius: 8 }}>
                <div className="flex items-start gap-2.5">
                  <Building2 size={16} color={N} style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <div style={{ fontSize: "0.74rem", fontWeight: 700, color: TD }}>Issuance recipient</div>
                    <div style={{ fontSize: "0.70rem", color: TT, marginTop: 2 }}>
                      {BROKER.name} · {BROKER.company}
                      <span style={{ color: BDL, margin: "0 6px" }}>·</span>
                      <span style={{ color: N, fontFamily: "ui-monospace, monospace" }}>{BROKER.email}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {!allProductsHaveSelection && (
                    <span className="inline-flex items-center gap-1.5"
                      style={{ fontSize: "0.70rem", color: "#8A5C00", background: "#FFF8E6", border: "1px solid #F0D88A", padding: "4px 10px", borderRadius: 4 }}>
                      <AlertCircle size={11} /> Select an option for every product
                    </span>
                  )}
                  <button
                    onClick={handleIssue}
                    disabled={!allProductsHaveSelection || issuanceStatus === "processing"}
                    className="flex items-center gap-2 px-6 py-2.5 transition-all"
                    style={{
                      background: allProductsHaveSelection ? G : "#E5DFC0",
                      color: allProductsHaveSelection ? "white" : "#A09060",
                      fontSize: "0.84rem", fontWeight: 700,
                      border: "none", cursor: allProductsHaveSelection && issuanceStatus !== "processing" ? "pointer" : "not-allowed",
                      boxShadow: allProductsHaveSelection ? "0 2px 8px rgba(201,162,39,0.35)" : "none",
                      borderRadius: 6, fontFamily: font,
                    }}>
                    {issuanceStatus === "processing"
                      ? <>Sending…</>
                      : <><Send size={14} /> Issue & Send to Broker</>}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}
