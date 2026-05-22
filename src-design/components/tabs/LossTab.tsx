import { useState } from "react";
import { TrendingDown, TrendingUp, AlertCircle, CheckCircle2, Clock, FileText, DollarSign, AlertTriangle, Hash, Users } from "lucide-react";
import { N, G, BDL, TD, TM, TT, OK, WARN, BAD, SectionCard, KPITile, font, type KPI } from "../DashboardCards";

/* ── Per-member loss row (passed in by the parent when the submission is a
   group). Drives the "By Member" view on the Year-by-Year card. */
export interface GroupMemberLoss {
  name: string;
  memberType: string;
  products: string[];
  lossRatio: number;
  trend: "up" | "down" | "neutral";
}

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

export function LossTab({ groupMembers }: { groupMembers?: GroupMemberLoss[] }) {
  const totalOpen = 2;
  const isGroup   = !!groupMembers && groupMembers.length > 0;
  const [yearView, setYearView] = useState<"year" | "member">("year");

  const kpis: KPI[] = [
    { label: "5-Yr Incurred Total",  value: "$87,200", sub: "Total paid + reserves", trend: "up",   accent: N,    icon: <DollarSign size={16}/>     },
    { label: "5-Yr Avg. Loss Ratio", value: "21.0%",   sub: "Below 70% threshold",    trend: "down", accent: OK,   icon: <TrendingDown size={16}/>   },
    { label: "Total Open Claims",    value: "2",       sub: "Active reserves",        trend: "none", accent: WARN, icon: <AlertTriangle size={16}/>  },
    { label: "Total Claims (5yr)",   value: "9",       sub: "All claim activity",     trend: "none", accent: G,    icon: <Hash size={16}/>           },
  ];

  return (
    <div className="space-y-5" style={{ fontFamily: font }}>
      {/* Summary KPIs — modern */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((k, i) => <KPITile key={i} k={k}/>)}
      </div>

      {/* Year-by-Year (or per-member, on group submissions) */}
      <SectionCard
        title={isGroup && yearView === "member" ? "Loss Ratio by Member" : "Year-by-Year Loss Summary"}
        accent={N}
        icon={<FileText size={13}/>}
        noPad
        action={isGroup ? (
          <div className="inline-flex items-center" style={{ background: "white", border: `1px solid ${BDL}`, borderRadius: 6, padding: 2 }}>
            {([
              { id: "year",   label: "By Year",   icon: <FileText size={11}/> },
              { id: "member", label: "By Member", icon: <Users size={11}/>    },
            ] as const).map(opt => {
              const active = yearView === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setYearView(opt.id)}
                  className="inline-flex items-center gap-1.5"
                  style={{
                    background: active ? N : "transparent",
                    color: active ? "white" : TM,
                    border: "none", borderRadius: 9999,
                    padding: "4px 9px",
                    fontSize: "0.66rem", fontWeight: 800,
                    fontFamily: font,
                    cursor: "pointer",
                    transition: "background 0.15s ease",
                    textTransform: "uppercase", letterSpacing: "0.06em",
                  }}
                >
                  {opt.icon}
                  {opt.label}
                </button>
              );
            })}
          </div>
        ) : undefined}
      >
        {isGroup && yearView === "member" ? (
          <table className="w-full" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#FAFBFD" }}>
                {["Member", "Member Type", "Products", "Loss Ratio", "Trend"].map(h => (
                  <th key={h} className="px-5 py-2.5 text-left whitespace-nowrap"
                    style={{
                      fontSize: "0.58rem", fontWeight: 700, color: TT,
                      textTransform: "uppercase", letterSpacing: "0.09em",
                      borderBottom: `1px solid ${BDL}`,
                    }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {groupMembers!.map((m, i, arr) => {
                const ratioColor = m.lossRatio >= 70 ? BAD : m.lossRatio >= 55 ? WARN : OK;
                const ratioBg    = m.lossRatio >= 70 ? "#FEE2E2" : m.lossRatio >= 55 ? "#FFF8E6" : "#E8F5EC";
                const isLast     = i === arr.length - 1;
                return (
                  <tr key={m.name} className="hover:bg-slate-50 transition-colors"
                    style={{ borderBottom: isLast ? "none" : `1px solid #EEF1F5` }}>
                    <td className="px-5 py-3" style={{ fontSize: "0.84rem", fontWeight: 700, color: TD }}>
                      {m.name}
                    </td>
                    <td className="px-5 py-3" style={{ fontSize: "0.76rem", color: TM }}>
                      {m.memberType}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1 flex-wrap">
                        {m.products.map(p => (
                          <span key={p} style={{
                            background: "#F1F4F8", color: TM,
                            fontSize: "0.60rem", fontWeight: 700,
                            padding: "2px 6px", borderRadius: 9999,
                            letterSpacing: "0.02em",
                          }}>
                            {p}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span style={{
                        fontSize: "0.78rem", fontWeight: 800,
                        color: ratioColor,
                        background: ratioBg,
                        padding: "2px 9px", borderRadius: 9999,
                        fontVariantNumeric: "tabular-nums",
                      }}>
                        {m.lossRatio}%
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {m.trend === "up"   && <TrendingUp size={14} color={BAD}/>}
                      {m.trend === "down" && <TrendingDown size={14} color={OK}/>}
                      {m.trend === "neutral" && <span style={{ fontSize: "0.74rem", color: TT }}>—</span>}
                    </td>
                  </tr>
                );
              })}
              <tr style={{ background: "#FAFBFD", borderTop: `1px solid ${BDL}` }}>
                <td className="px-5 py-3" style={{ fontSize: "0.84rem", fontWeight: 800, color: TD }}>
                  Group (weighted)
                </td>
                <td className="px-5 py-3" colSpan={2} style={{ fontSize: "0.74rem", color: TT }}>
                  {groupMembers!.length} members
                </td>
                <td className="px-5 py-3" colSpan={2}>
                  {(() => {
                    const wlr = groupMembers!.reduce((s, m) => s + m.lossRatio, 0) / groupMembers!.length;
                    const c   = wlr >= 70 ? BAD : wlr >= 55 ? WARN : OK;
                    const bg  = wlr >= 70 ? "#FEE2E2" : wlr >= 55 ? "#FFF8E6" : "#E8F5EC";
                    return (
                      <span style={{
                        fontSize: "0.78rem", fontWeight: 800, color: c,
                        background: bg, padding: "2px 10px", borderRadius: 9999,
                      }}>
                        {wlr.toFixed(1)}% avg
                      </span>
                    );
                  })()}
                </td>
              </tr>
            </tbody>
          </table>
        ) : (
        <table className="w-full" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#FAFBFD" }}>
              {["Policy Year", "# Claims", "Paid", "Reserve", "Incurred Total", "Loss Ratio", "Trend"].map(h => (
                <th key={h} className="px-5 py-2.5 text-left whitespace-nowrap"
                  style={{
                    fontSize: "0.58rem", fontWeight: 700, color: TT,
                    textTransform: "uppercase", letterSpacing: "0.09em",
                    borderBottom: `1px solid ${BDL}`,
                  }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {yearSummary.map((row, i, arr) => (
              <tr key={i} className="hover:bg-slate-50 transition-colors"
                style={{ borderBottom: i === arr.length - 1 ? "none" : `1px solid #EEF1F5` }}>
                <td className="px-5 py-3" style={{ fontSize: "0.86rem", fontWeight: 800, color: N, fontVariantNumeric: "tabular-nums" }}>
                  {row.year}
                </td>
                <td className="px-5 py-3" style={{ fontSize: "0.82rem", color: TD, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
                  {row.claims}
                </td>
                <td className="px-5 py-3" style={{ fontSize: "0.82rem", color: TM, fontVariantNumeric: "tabular-nums" }}>{row.paid}</td>
                <td className="px-5 py-3" style={{
                  fontSize: "0.82rem", color: row.reserve === "$0" ? TT : WARN,
                  fontWeight: row.reserve === "$0" ? 400 : 600,
                  fontVariantNumeric: "tabular-nums",
                }}>
                  {row.reserve}
                </td>
                <td className="px-5 py-3" style={{ fontSize: "0.84rem", fontWeight: 700, color: TD, fontVariantNumeric: "tabular-nums" }}>
                  {row.incurred}
                </td>
                <td className="px-5 py-3">
                  <span style={{
                    fontSize: "0.7rem", fontWeight: 800,
                    background:
                      row.trend === "up" ? "#FEE2E2" :
                      row.trend === "down" ? "#E8F5EC" : "#F1F5F9",
                    color:
                      row.trend === "up" ? BAD :
                      row.trend === "down" ? OK : TT,
                    padding: "2px 8px", borderRadius: 9999,
                  }}>
                    {row.ratio}
                  </span>
                </td>
                <td className="px-5 py-3">
                  {row.trend === "up"      && <TrendingUp size={14} color={BAD}/>}
                  {row.trend === "down"    && <TrendingDown size={14} color={OK}/>}
                  {row.trend === "neutral" && <span style={{ fontSize: "0.74rem", color: TT }}>—</span>}
                </td>
              </tr>
            ))}
            <tr style={{ background: "#FAFBFD", borderTop: `1px solid ${BDL}` }}>
              <td className="px-5 py-3" style={{ fontSize: "0.84rem", fontWeight: 800, color: TD }}>5-Year Total</td>
              <td className="px-5 py-3" style={{ fontSize: "0.84rem", fontWeight: 800, color: TD, fontVariantNumeric: "tabular-nums" }}>9</td>
              <td className="px-5 py-3" style={{ fontSize: "0.84rem", fontWeight: 800, color: TD, fontVariantNumeric: "tabular-nums" }}>$71,700</td>
              <td className="px-5 py-3" style={{ fontSize: "0.84rem", fontWeight: 800, color: WARN, fontVariantNumeric: "tabular-nums" }}>$14,500</td>
              <td className="px-5 py-3" style={{ fontSize: "0.94rem", fontWeight: 800, color: N, fontVariantNumeric: "tabular-nums" }}>$87,200</td>
              <td className="px-5 py-3" colSpan={2}>
                <span style={{
                  fontSize: "0.74rem", fontWeight: 800, color: OK,
                  background: "#E8F5EC", padding: "2px 10px", borderRadius: 9999,
                }}>
                  21.0% avg
                </span>
              </td>
            </tr>
          </tbody>
        </table>
        )}
      </SectionCard>

      {/* Claim Detail Log */}
      <SectionCard
        title="Claim Detail Log"
        accent={G}
        icon={<Clock size={13}/>}
        noPad
        action={
          <div className="flex items-center gap-2">
            <span style={{
              fontSize: "0.66rem", fontWeight: 700, background: "#FFFBEB", color: WARN,
              padding: "2px 9px", borderRadius: 10,
            }}>
              {totalOpen} Open
            </span>
            <span style={{
              fontSize: "0.66rem", fontWeight: 700, background: "#E8F5EC", color: OK,
              padding: "2px 9px", borderRadius: 10,
            }}>
              {9 - totalOpen} Closed
            </span>
          </div>
        }>
        <div className="overflow-x-auto">
          <table className="w-full" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#FAFBFD" }}>
                {["Claim ID", "Date", "Type", "Location", "Paid", "Reserve", "Total", "Status"].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left whitespace-nowrap"
                    style={{
                      fontSize: "0.58rem", fontWeight: 700, color: TT,
                      textTransform: "uppercase", letterSpacing: "0.09em",
                      borderBottom: `1px solid ${BDL}`,
                    }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {claims.map((c, i, arr) => {
                const isLast = i === arr.length - 1;
                return (
                  <tr key={c.id}
                    className="hover:bg-slate-50 transition-colors cursor-pointer"
                    style={{
                      borderBottom: isLast ? "none" : `1px solid #EEF1F5`,
                      background: c.alert ? "#FEF2F2" : "white",
                      borderLeft: c.alert ? `3px solid #B91C1C` : "3px solid transparent",
                    }}>
                    <td className="px-4 py-3" style={{
                      fontSize: "0.72rem", fontWeight: 700, color: N,
                      fontFamily: "ui-monospace, monospace",
                    }}>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span>{c.id}</span>
                        {c.alert && (
                          <span style={{
                            background: "#FEE2E2", color: "#7A1F1F",
                            padding: "1px 6px", borderRadius: 9,
                            fontSize: "0.52rem", fontWeight: 800,
                            textTransform: "uppercase", letterSpacing: "0.05em",
                            fontFamily: font,
                          }}>
                            Flagged
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3" style={{ fontSize: "0.74rem", color: TM, whiteSpace: "nowrap" }}>{c.date}</td>
                    <td className="px-4 py-3" style={{ fontSize: "0.76rem", color: TD, fontWeight: 500 }}>{c.type}</td>
                    <td className="px-4 py-3" style={{ fontSize: "0.74rem", color: TM }}>{c.location}</td>
                    <td className="px-4 py-3" style={{ fontSize: "0.76rem", color: TD, fontVariantNumeric: "tabular-nums" }}>
                      {c.paid}
                    </td>
                    <td className="px-4 py-3" style={{
                      fontSize: "0.76rem", color: c.reserve === "$0" ? TT : WARN,
                      fontWeight: c.reserve !== "$0" ? 600 : 400,
                      fontVariantNumeric: "tabular-nums",
                    }}>
                      {c.reserve}
                    </td>
                    <td className="px-4 py-3" style={{
                      fontSize: "0.78rem", fontWeight: 800, color: TD,
                      fontVariantNumeric: "tabular-nums",
                    }}>
                      {c.total}
                    </td>
                    <td className="px-4 py-3">
                      {c.alert ? (
                        <span className="inline-flex items-center gap-1.5"
                          style={{
                            background: "#FEE2E2",
                            padding: "2px 8px", borderRadius: 9999,
                          }}>
                          <AlertCircle size={11} color="#B91C1C"/>
                          <span style={{
                            fontSize: "0.68rem", fontWeight: 700, color: "#7A1F1F",
                          }}>
                            {c.status}
                          </span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5" style={{ whiteSpace: "nowrap" }}>
                          <span style={{
                            width: 6, height: 6, borderRadius: "50%",
                            background: c.status === "Closed" ? OK : "#7A8FA3",
                          }}/>
                          <span style={{
                            fontSize: "0.72rem", fontWeight: 500,
                            color: c.status === "Closed" ? OK : TM,
                          }}>
                            {c.status}
                          </span>
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
