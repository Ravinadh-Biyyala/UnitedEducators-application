import { TrendingDown, Shield } from "lucide-react";
import { SubmissionDetailsCard } from "../SubmissionDetailsCard";

// ─── Design tokens ────────────────────────────────────────────────────────────
const N   = "#0123D4";
const G   = "#C9A227";
const BD  = "#C4CDD8";
const BDL = "#DCE3EC";
const TH  = "#F0F3F8";
const TD  = "#1A2530";
const TM  = "#4A5D6E";
const TT  = "#7A8FA3";
const font = "'Source Sans 3', system-ui, sans-serif";

// ─── Loss data ────────────────────────────────────────────────────────────────
const lossHistory = [
  { year: "2019", claims: 2, incurred: "$18,400", ratio: "22%", up: false },
  { year: "2020", claims: 1, incurred: "$9,100",  ratio: "11%", up: false },
  { year: "2021", claims: 3, incurred: "$24,700", ratio: "30%", up: true  },
  { year: "2022", claims: 2, incurred: "$16,500", ratio: "20%", up: false },
  { year: "2023", claims: 1, incurred: "$18,500", ratio: "22%", up: true  },
];

const coverages = [
  { name: "General Liability",         limit: "$5,000,000",  aggregateLimit: "$15,000,000", retention: "$100,000", premium: "$28,400" },
  { name: "Property – Buildings",      limit: "$42,000,000", aggregateLimit: "$42,000,000", retention: "$250,000", premium: "$51,200" },
  { name: "Student Accident",          limit: "$500,000",    aggregateLimit: "$2,000,000",  retention: "$50,000",  premium: "$12,800" },
  { name: "Educators Legal Liability", limit: "$3,000,000",  aggregateLimit: "$9,000,000",  retention: "$100,000", premium: "$19,600" },
];

/* ══════════════════════════════════════════════════════════════════════════════
   OVERVIEW TAB
══════════════════════════════════════════════════════════════════════════════ */
export function OverviewTab() {
  return (
    <div className="space-y-5" style={{ fontFamily: font }}>

      {/* ── SUBMISSION DETAILS (interactive 3×3 grid) ──────────────────────── */}
      <SubmissionDetailsCard />

      {/* ── SECONDARY PANELS: Coverage + Loss ──────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-5" style={{ alignItems: "flex-start" }}>

        {/* Coverage Summary */}
        <div className="md:col-span-3"
          style={{
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
                <Shield size={13}/>
              </span>
              <h3 style={{ fontSize: "0.74rem", fontWeight: 700, color: TD, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Coverage Summary
              </h3>
            </div>
          </div>
          <table className="w-full" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: TH }}>
                {["Product", "Limit", "Aggregate Limit", "Retention", "Premium"].map(h => (
                  <th key={h} className="px-5 py-3 text-left"
                    style={{ fontSize: "0.62rem", fontWeight: 700, color: TT, textTransform: "uppercase", letterSpacing: "0.08em", borderBottom: `1px solid ${BDL}` }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {coverages.map((c, i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${BDL}` }}>
                  <td className="px-5 py-3" style={{ fontSize: "0.84rem", color: TD, fontWeight: 500 }}>{c.name}</td>
                  <td className="px-5 py-3" style={{ fontSize: "0.84rem", color: TM }}>{c.limit}</td>
                  <td className="px-5 py-3" style={{ fontSize: "0.84rem", color: TM }}>{c.aggregateLimit}</td>
                  <td className="px-5 py-3" style={{ fontSize: "0.84rem", color: TM }}>{c.retention}</td>
                  <td className="px-5 py-3" style={{ fontSize: "0.84rem", color: N, fontWeight: 700 }}>{c.premium}</td>
                </tr>
              ))}
              <tr style={{ borderTop: `2px solid ${BD}`, background: TH }}>
                <td className="px-5 py-3" colSpan={4} style={{ fontSize: "0.84rem", fontWeight: 700, color: TD }}>
                  Total Estimated Premium
                </td>
                <td className="px-5 py-3" style={{ fontSize: "0.95rem", fontWeight: 800, color: N }}>$112,000</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Right column: Loss Experience */}
        <div className="md:col-span-2" style={{ display: "flex", flexDirection: "column" }}>

          {/* Loss Experience */}
          <div style={{
            background: "white",
            border: `1px solid ${BDL}`,
            borderTop: `3px solid ${G}`,
            borderRadius: 8,
            overflow: "hidden",
            boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
            flex: 1,
          }}>
            <div className="flex items-center justify-between px-5 py-3"
              style={{ borderBottom: `1px solid ${BDL}`, background: "#FAFBFD" }}>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center"
                  style={{ width: 24, height: 24, borderRadius: 6, background: `${G}18`, color: G }}>
                  <TrendingDown size={13}/>
                </span>
                <div>
                  <h3 style={{ fontSize: "0.74rem", fontWeight: 700, color: TD, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    Loss Experience
                  </h3>
                  <p style={{ fontSize: "0.62rem", color: TT, marginTop: 1 }}>5-year summary</p>
                </div>
              </div>
            </div>
            <div className="px-5 pt-4 pb-2">
              <div className="grid grid-cols-4 pb-2.5" style={{ borderBottom: `1px solid ${BDL}` }}>
                {["Year", "Claims", "Incurred", "Ratio"].map(h => (
                  <span key={h} style={{ fontSize: "0.60rem", fontWeight: 700, color: TT, textTransform: "uppercase", letterSpacing: "0.08em" }}>{h}</span>
                ))}
              </div>
              {lossHistory.map((row, i) => (
                <div key={i} className="grid grid-cols-4 py-2.5 items-center"
                  style={{ borderBottom: `1px solid ${BDL}` }}>
                  <span style={{ fontSize: "0.80rem", color: TD, fontWeight: 600 }}>{row.year}</span>
                  <span style={{ fontSize: "0.80rem", color: TM }}>{row.claims}</span>
                  <span style={{ fontSize: "0.80rem", color: TM }}>{row.incurred}</span>
                  <span style={{ fontSize: "0.76rem", fontWeight: 700, color: row.up ? "#B91C1C" : "#2E7D32" }}>
                    {row.ratio}
                  </span>
                </div>
              ))}
            </div>
            <div className="mx-4 mb-4 mt-2 px-4 py-3 flex items-center justify-between"
              style={{ background: "#E8F5EC", border: "1px solid #93C8A0" }}>
              <div className="flex items-center gap-2">
                <TrendingDown size={14} color="#2E7D32" />
                <span style={{ fontSize: "0.76rem", color: "#1A5C30", fontWeight: 600 }}>5-Year Avg. Loss Ratio</span>
              </div>
              <span style={{ fontSize: "0.92rem", fontWeight: 800, color: "#1A5C30" }}>21.0%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}