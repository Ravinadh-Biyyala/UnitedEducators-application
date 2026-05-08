import { TrendingDown, TrendingUp, AlertCircle, CheckCircle2, Clock } from "lucide-react";

const N   = "#0123D4";
const G   = "#C9A227";
const TH  = "#F0F3F8";
const BD  = "#C4CDD8";
const BDL = "#DCE3EC";
const TD  = "#1A2530";
const TM  = "#4A5D6E";
const TT  = "#7A8FA3";

const claims = [
  { id: "CLM-2023-041", date: "Sep 14, 2023", type: "Property – Water Damage",       location: "Lincoln HS",       paid: "$12,400", reserve: "$6,100", total: "$18,500", status: "Closed", alert: false },
  { id: "CLM-2022-019", date: "Mar 02, 2022", type: "General Liability – Slip & Fall", location: "Jefferson Elem.", paid: "$9,200",  reserve: "$0",     total: "$9,200",  status: "Closed", alert: false },
  { id: "CLM-2022-033", date: "Jul 18, 2022", type: "Student Accident – Sports Inj.", location: "Madison MS",      paid: "$5,100",  reserve: "$2,200", total: "$7,300",  status: "Closed", alert: false },
  { id: "CLM-2021-008", date: "Jan 22, 2021", type: "Property – Fire Damage",         location: "Central Admin",   paid: "$16,200", reserve: "$0",     total: "$16,200", status: "Closed", alert: false },
  { id: "CLM-2021-027", date: "May 09, 2021", type: "ELL – Wrongful Termination",    location: "District-Wide",   paid: "$4,700",  reserve: "$3,800", total: "$8,500",  status: "Open",   alert: true  },
  { id: "CLM-2020-014", date: "Jun 30, 2020", type: "Property – Vandalism",           location: "Roosevelt Elem.", paid: "$9,100",  reserve: "$0",     total: "$9,100",  status: "Closed", alert: false },
  { id: "CLM-2019-006", date: "Feb 12, 2019", type: "General Liability – Auto",       location: "District Bus",    paid: "$8,800",  reserve: "$0",     total: "$8,800",  status: "Closed", alert: false },
  { id: "CLM-2019-022", date: "Oct 05, 2019", type: "Student Accident – Field Trip",  location: "Grant MS",        paid: "$7,200",  reserve: "$2,400", total: "$9,600",  status: "Open",   alert: false },
];

const yearSummary = [
  { year: "2019", claims: 2, paid: "$16,000",  reserve: "$2,400", incurred: "$18,400", ratio: "22%", trend: "neutral" },
  { year: "2020", claims: 1, paid: "$9,100",   reserve: "$0",     incurred: "$9,100",  ratio: "11%", trend: "down" },
  { year: "2021", claims: 3, paid: "$24,700",  reserve: "$3,800", incurred: "$24,700", ratio: "30%", trend: "up" },
  { year: "2022", claims: 2, paid: "$14,300",  reserve: "$2,200", incurred: "$16,500", ratio: "20%", trend: "down" },
  { year: "2023", claims: 1, paid: "$12,400",  reserve: "$6,100", incurred: "$18,500", ratio: "22%", trend: "neutral" },
];

export function LossTab() {
  const totalOpen = 2;

  return (
    <div className="space-y-5">

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "5-Yr Incurred Total",  value: "$87,200", color: N,         bg: "#E8F0F9", border: "#9ABCD6" },
          { label: "5-Yr Avg. Loss Ratio", value: "21.0%",   color: "#2E7D32", bg: "#E8F5EC", border: "#93C8A0" },
          { label: "Total Open Claims",    value: "2",        color: "#B45309", bg: "#FFF8E6", border: "#F0D88A" },
          { label: "Total Claims (5yr)",   value: "9",        color: TD,        bg: TH,        border: BD       },
        ].map((s, i) => (
          <div key={i} className="px-5 py-4" style={{ background: s.bg, border: `1px solid ${s.border}`, borderTop: `3px solid ${s.color}` }}>
            <p style={{ fontSize: "0.62rem", fontWeight: 700, color: TT, textTransform: "uppercase", letterSpacing: "0.09em" }}>{s.label}</p>
            <p style={{ fontSize: "1.6rem", fontWeight: 800, color: s.color, lineHeight: 1.25, marginTop: 4 }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Year-by-Year Summary */}
      <div style={{ background: "white", border: `1px solid ${BD}`, borderTop: `3px solid ${N}` }}>
        <div className="px-5 py-3.5" style={{ borderBottom: `1px solid ${BDL}`, background: TH }}>
          <h3 style={{ fontSize: "0.82rem", fontWeight: 700, color: N, textTransform: "uppercase", letterSpacing: "0.06em" }}>Year-by-Year Loss Summary</h3>
        </div>
        <table className="w-full" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: TH }}>
              {["Policy Year", "# Claims", "Paid", "Reserve", "Incurred Total", "Loss Ratio", "Trend"].map((h) => (
                <th key={h} className="px-5 py-3 text-left" style={{ fontSize: "0.62rem", fontWeight: 700, color: TT, textTransform: "uppercase", letterSpacing: "0.08em", borderBottom: `1px solid ${BDL}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {yearSummary.map((row, i) => (
              <tr key={i} style={{ borderBottom: `1px solid ${BDL}` }} className="hover:bg-slate-50 transition-colors">
                <td className="px-5 py-3" style={{ fontSize: "0.875rem", fontWeight: 700, color: N }}>{row.year}</td>
                <td className="px-5 py-3" style={{ fontSize: "0.875rem", color: TM }}>{row.claims}</td>
                <td className="px-5 py-3" style={{ fontSize: "0.875rem", color: TM }}>{row.paid}</td>
                <td className="px-5 py-3" style={{ fontSize: "0.875rem", color: row.reserve === "$0" ? TT : "#B45309" }}>{row.reserve}</td>
                <td className="px-5 py-3" style={{ fontSize: "0.875rem", fontWeight: 600, color: TD }}>{row.incurred}</td>
                <td className="px-5 py-3">
                  <span
                    className="px-2.5 py-0.5"
                    style={{
                      fontSize: "0.78rem", fontWeight: 700,
                      background: row.trend === "up" ? "#FBEAEA" : row.trend === "down" ? "#E8F5EC" : TH,
                      color:      row.trend === "up" ? "#B91C1C" : row.trend === "down" ? "#2E7D32" : TT,
                      border: `1px solid ${row.trend === "up" ? "#E8A8A8" : row.trend === "down" ? "#93C8A0" : BD}`,
                    }}
                  >
                    {row.ratio}
                  </span>
                </td>
                <td className="px-5 py-3">
                  {row.trend === "up"      && <TrendingUp size={15} color="#B91C1C" />}
                  {row.trend === "down"    && <TrendingDown size={15} color="#2E7D32" />}
                  {row.trend === "neutral" && <span style={{ fontSize: "0.75rem", color: TT }}>—</span>}
                </td>
              </tr>
            ))}
            <tr style={{ borderTop: `2px solid ${BD}`, background: TH }}>
              <td className="px-5 py-3" style={{ fontSize: "0.875rem", fontWeight: 700, color: TD }}>5-Year Total</td>
              <td className="px-5 py-3" style={{ fontSize: "0.875rem", fontWeight: 700, color: TD }}>9</td>
              <td className="px-5 py-3" style={{ fontSize: "0.875rem", fontWeight: 700, color: TD }}>$71,700</td>
              <td className="px-5 py-3" style={{ fontSize: "0.875rem", fontWeight: 700, color: "#B45309" }}>$14,500</td>
              <td className="px-5 py-3" style={{ fontSize: "0.95rem", fontWeight: 800, color: N }}>$87,200</td>
              <td className="px-5 py-3" colSpan={2}>
                <span style={{ fontSize: "0.78rem", fontWeight: 700, background: "#E8F5EC", color: "#2E7D32", border: "1px solid #93C8A0", padding: "2px 10px" }}>21.0% avg</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Claim Detail Log */}
      <div style={{ background: "white", border: `1px solid ${BD}`, borderTop: `3px solid ${G}` }}>
        <div className="px-5 py-3.5 flex items-center justify-between" style={{ borderBottom: `1px solid ${BDL}`, background: TH }}>
          <div>
            <h3 style={{ fontSize: "0.82rem", fontWeight: 700, color: N, textTransform: "uppercase", letterSpacing: "0.06em" }}>Claim Detail Log</h3>
            <p style={{ fontSize: "0.72rem", color: TT, marginTop: 2 }}>All claims — 2019 to present</p>
          </div>
          <div className="flex items-center gap-2">
            <span style={{ fontSize: "0.72rem", fontWeight: 700, background: "#FFF8E6", color: "#8A5C00", border: "1px solid #F0D88A", padding: "2px 10px" }}>
              {totalOpen} Open
            </span>
            <span style={{ fontSize: "0.72rem", fontWeight: 700, background: "#E8F5EC", color: "#1A5C30", border: "1px solid #93C8A0", padding: "2px 10px" }}>
              {9 - totalOpen} Closed
            </span>
          </div>
        </div>
        <table className="w-full" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: TH }}>
              {["Claim ID", "Date", "Type", "Location", "Paid", "Reserve", "Total", "Status"].map((h) => (
                <th key={h} className="px-4 py-3 text-left" style={{ fontSize: "0.62rem", fontWeight: 700, color: TT, textTransform: "uppercase", letterSpacing: "0.08em", borderBottom: `1px solid ${BDL}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {claims.map((c, i) => (
              <tr
                key={i}
                style={{ borderBottom: `1px solid ${BDL}`, background: c.alert ? "#FFFDF4" : "white" }}
                className="hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <td className="px-4 py-3" style={{ fontSize: "0.78rem", fontWeight: 700, color: "#005B99" }}>{c.id}</td>
                <td className="px-4 py-3" style={{ fontSize: "0.78rem", color: TM }}>{c.date}</td>
                <td className="px-4 py-3" style={{ fontSize: "0.78rem", color: TD }}>{c.type}</td>
                <td className="px-4 py-3" style={{ fontSize: "0.78rem", color: TM }}>{c.location}</td>
                <td className="px-4 py-3" style={{ fontSize: "0.78rem", color: TD }}>{c.paid}</td>
                <td className="px-4 py-3" style={{ fontSize: "0.78rem", color: c.reserve === "$0" ? TT : "#B45309", fontWeight: c.reserve !== "$0" ? 600 : 400 }}>{c.reserve}</td>
                <td className="px-4 py-3" style={{ fontSize: "0.78rem", fontWeight: 700, color: TD }}>{c.total}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    {c.status === "Closed"
                      ? <CheckCircle2 size={13} color="#2E7D32" />
                      : c.alert
                        ? <AlertCircle size={13} color="#B45309" />
                        : <Clock size={13} color={TT} />
                    }
                    <span style={{
                      fontSize: "0.72rem", fontWeight: 600,
                      color: c.status === "Closed" ? "#2E7D32" : c.alert ? "#B45309" : TM,
                    }}>
                      {c.status}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}