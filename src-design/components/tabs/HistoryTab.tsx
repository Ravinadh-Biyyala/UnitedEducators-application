import { TrendingUp, TrendingDown, Minus, FileText, ShieldCheck, AlertTriangle, CheckCircle2, RotateCcw } from "lucide-react";

const N   = "#0123D4";
const G   = "#C9A227";
const TH  = "#F0F3F8";
const BD  = "#C4CDD8";
const BDL = "#DCE3EC";
const TD  = "#1A2530";
const TM  = "#4A5D6E";
const TT  = "#7A8FA3";

interface UWAction {
  year: string; policyNo: string; carrier: string; action: string;
  actionType: "increase" | "decrease" | "neutral" | "new";
  detail: string; premium: string; rateChange: string; uwNote: string;
}

const uwHistory: UWAction[] = [
  {
    year: "2024 (Current)", policyNo: "—", carrier: "In Submission",
    action: "New Submission", actionType: "new",
    detail: "Full package renewal. SIR maintained at $50K. Rate guidance: flat to +3%.",
    premium: "$112,000 (Est.)", rateChange: "+3.0% (target)",
    uwNote: "Favorable account. Open claims being monitored. Broker seeking flat — likely to settle at +3%.",
  },
  {
    year: "2023", policyNo: "ZU-EDU-00192847", carrier: "Zurich Insurance",
    action: "Rate Cap Applied", actionType: "neutral",
    detail: "Rate increase capped at 7% per account agreement. Original indicated rate was +14%. TIV increased by $18M due to new gymnasium at Lincoln HS.",
    premium: "$104,500", rateChange: "+7.0% (capped)",
    uwNote: "2021 property loss drove initial +14% indication. Negotiated to 7% cap due to long-term account status. SIR held at $50K.",
  },
  {
    year: "2022", policyNo: "ZU-EDU-00181203", carrier: "Zurich Insurance",
    action: "SIR Increased", actionType: "decrease",
    detail: "Per-occurrence SIR increased from $25,000 to $50,000 to improve loss ratio and reduce primary frequency. Aggregate SIR set at $150,000.",
    premium: "$97,600", rateChange: "+4.5%",
    uwNote: "SIR increase recommended following 2021 fire loss at Central Admin. District accepted higher retention in exchange for rate relief.",
  },
  {
    year: "2021", policyNo: "ZU-EDU-00169450", carrier: "Zurich Insurance",
    action: "Liability Limit Decreased", actionType: "decrease",
    detail: "GL per-occurrence limit reduced from $10M to $5M. Re-underwritten following two ELL claims in 2020-2021. Added abuse & molestation sublimit of $1M.",
    premium: "$93,400", rateChange: "+9.2%",
    uwNote: "Significant rate increase driven by hard market conditions and ELL claim activity. Limit reduction negotiated to manage net exposure.",
  },
  {
    year: "2020", policyNo: "ZU-EDU-00158702", carrier: "Zurich Insurance",
    action: "Flat Renewal", actionType: "neutral",
    detail: "No material changes. Clean loss year. Minor endorsement added for remote learning cyber exposure (COVID-19).",
    premium: "$85,500", rateChange: "0.0% (flat)",
    uwNote: "Excellent loss year. Account remains in appetite. COVID-19 cyber endorsement added — no additional premium.",
  },
  {
    year: "2019", policyNo: "ZU-EDU-00146891", carrier: "Zurich Insurance",
    action: "New Business – Bound", actionType: "new",
    detail: "First year bound with Zurich Education Practice. Prior carrier was Liberty Mutual (exited education market). Full package placed.",
    premium: "$82,200", rateChange: "N/A (new)",
    uwNote: "Account moved from Liberty Mutual upon their exit from K-12 education. Good safety record noted from application.",
  },
];

const priorApplications = [
  { year: "2024", question: "Any litigation pending or threatened?",            answer: "Yes — 1 ELL claim CLM-2021-027 pending mediation",          flag: true  },
  { year: "2024", question: "Material changes to operations since last policy?",answer: "No material changes. New gymnasium added at Lincoln HS.",    flag: false },
  { year: "2024", question: "Have you implemented active shooter protocols?",   answer: "Yes — drills conducted bi-annually at all 34 campuses.",     flag: false },
  { year: "2024", question: "Any known conditions that may give rise to a claim?",answer: "Aging HVAC at Jefferson Elem. — scheduled Q3 2024.",       flag: true  },
  { year: "2023", question: "Any incidents involving abuse or molestation?",    answer: "No incidents reported.",                                     flag: false },
  { year: "2023", question: "Any large-scale property renovations in progress?",answer: "Yes — $14M gymnasium at Lincoln HS, completion Aug 2023.",   flag: false },
];

const actionIcon = (type: UWAction["actionType"]) => {
  if (type === "increase") return <TrendingUp size={15} color="#B91C1C" />;
  if (type === "decrease") return <TrendingDown size={15} color="#B45309" />;
  if (type === "new")      return <ShieldCheck size={15} color={N} />;
  return <Minus size={15} color={TT} />;
};

const actionBadge = (type: UWAction["actionType"]) => {
  if (type === "increase") return { bg: "#FBEAEA", text: "#7A1F1F", border: "#E8A8A8" };
  if (type === "decrease") return { bg: "#FFF8E6", text: "#8A5C00", border: "#F0D88A" };
  if (type === "new")      return { bg: "#E8F0F9", text: "#00427A", border: "#9ABCD6" };
  return { bg: "#E8F5EC", text: "#1A5C30", border: "#93C8A0" };
};

export function HistoryTab() {
  return (
    <div className="space-y-5">

      {/* UW Action Timeline */}
      <div style={{ background: "white", border: `1px solid ${BD}`, borderTop: `3px solid ${N}`, borderRadius: 8, overflow: "hidden" }}>
        <div className="px-5 py-3.5 flex items-center gap-2" style={{ borderBottom: `1px solid ${BDL}`, background: TH }}>
          <RotateCcw size={14} color={N} />
          <div>
            <h3 style={{ fontSize: "0.82rem", fontWeight: 700, color: N, textTransform: "uppercase", letterSpacing: "0.06em" }}>Underwriting Action History</h3>
            <p style={{ fontSize: "0.72rem", color: TT, marginTop: 1 }}>Prior UW decisions, rate changes, and renewal actions — 2019 to present</p>
          </div>
        </div>

        <div>
          {uwHistory.map((row, i) => {
            const ab = actionBadge(row.actionType);
            const isFirst = i === 0;
            return (
              <div
                key={i}
                className="px-5 py-5 hover:bg-slate-50/50 transition-colors"
                style={{
                  borderBottom: i < uwHistory.length - 1 ? `1px solid ${BDL}` : "none",
                  borderLeft: isFirst ? `4px solid ${G}` : `4px solid ${BDL}`,
                }}
              >
                <div className="flex flex-col md:flex-row md:items-start gap-5">
                  {/* Year column */}
                  <div className="shrink-0" style={{ minWidth: 120 }}>
                    <p style={{ fontSize: "0.95rem", fontWeight: 800, color: N }}>{row.year}</p>
                    <p style={{ fontSize: "0.75rem", color: TM, marginTop: 2 }}>{row.carrier}</p>
                    <p style={{ fontSize: "0.7rem", color: TT, marginTop: 1, fontFamily: "monospace" }}>{row.policyNo}</p>
                  </div>

                  {/* Main content */}
                  <div className="flex-1 space-y-2.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      {actionIcon(row.actionType)}
                      <span style={{ fontSize: "0.875rem", fontWeight: 700, color: TD }}>{row.action}</span>
                      <span
                        style={{
                          fontSize: "0.72rem", fontWeight: 700,
                          background: ab.bg, color: ab.text,
                          border: `1px solid ${ab.border}`,
                          padding: "1px 9px",
                        }}
                      >
                        {row.rateChange}
                      </span>
                    </div>
                    <p style={{ fontSize: "0.82rem", color: TM, lineHeight: 1.65 }}>{row.detail}</p>

                    {/* UW Note box */}
                    <div className="p-3" style={{ background: TH, borderLeft: `3px solid ${BD}` }}>
                      <p style={{ fontSize: "0.62rem", fontWeight: 700, color: TT, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>UW Note</p>
                      <p style={{ fontSize: "0.8rem", color: TM, lineHeight: 1.65 }}>{row.uwNote}</p>
                    </div>
                  </div>

                  {/* Premium */}
                  <div className="shrink-0 text-right">
                    <p style={{ fontSize: "0.62rem", fontWeight: 700, color: TT, textTransform: "uppercase", letterSpacing: "0.09em" }}>Premium</p>
                    <p style={{ fontSize: "1rem", fontWeight: 800, color: N, marginTop: 2 }}>{row.premium}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Prior Application Responses */}
      <div style={{ background: "white", border: `1px solid ${BD}`, borderTop: `3px solid ${G}`, borderRadius: 8, overflow: "hidden" }}>
        <div className="px-5 py-3.5 flex items-center gap-2" style={{ borderBottom: `1px solid ${BDL}`, background: TH }}>
          <FileText size={14} color={N} />
          <div>
            <h3 style={{ fontSize: "0.82rem", fontWeight: 700, color: N, textTransform: "uppercase", letterSpacing: "0.06em" }}>Prior Application Responses</h3>
            <p style={{ fontSize: "0.72rem", color: TT, marginTop: 1 }}>Key application questions and insured responses — flagged items highlighted</p>
          </div>
        </div>
        <table className="w-full" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: TH }}>
              {["Year", "Question", "Insured Response", "Flag"].map((h) => (
                <th key={h} className="px-5 py-3 text-left" style={{ fontSize: "0.62rem", fontWeight: 700, color: TT, textTransform: "uppercase", letterSpacing: "0.08em", borderBottom: `1px solid ${BDL}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {priorApplications.map((row, i) => (
              <tr
                key={i}
                style={{ borderBottom: `1px solid ${BDL}`, background: row.flag ? "#FFFDF4" : "white" }}
                className="hover:bg-slate-50/60 transition-colors"
              >
                <td className="px-5 py-3" style={{ fontSize: "0.82rem", fontWeight: 700, color: N }}>{row.year}</td>
                <td className="px-5 py-3" style={{ fontSize: "0.82rem", color: TD, maxWidth: 280 }}>{row.question}</td>
                <td className="px-5 py-3" style={{ fontSize: "0.82rem", color: TM, lineHeight: 1.55 }}>{row.answer}</td>
                <td className="px-5 py-3">
                  {row.flag
                    ? <div className="flex items-center gap-1.5"><AlertTriangle size={14} color="#B45309" /><span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#8A5C00" }}>Review</span></div>
                    : <div className="flex items-center gap-1.5"><CheckCircle2 size={14} color="#2E7D32" /><span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#1A5C30" }}>Clear</span></div>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}