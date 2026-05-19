import { useState } from "react";
import {
  Users, Building2, AlertTriangle, AlertCircle, CheckCircle2, Flag,
  Hash, DollarSign, TrendingDown, ShieldAlert, Sparkles, ChevronRight,
} from "lucide-react";
import {
  N, G, BDL, BD, TD, TM, TT, OK, WARN, BAD,
  SectionCard, KPITile, font, type KPI,
} from "../DashboardCards";

/* ── Group member detail (richer than the intake row) ──────────────────────
   Each row carries enough data to drive per-member quoting + rule routing:
   premium estimate, current loss ratio, the rule-tier the rate sits in,
   and any application issues that block quote-readiness. */
interface GroupMemberDetail {
  id: string;
  name: string;
  memberType: "K-12 Public District" | "K-12 Public School" | "Charter School"
            | "Private K-12" | "4-Year University" | "Community College" | "Consortium";
  state: string;
  enrollment: number;
  products: string[];
  estimatedPremium: number;       // current indicated premium for this member
  lossRatio: number;              // 5-yr loss ratio, 0–100+
  ruleTier: "Standard" | "Preferred" | "Referred" | "Decline";
  issues: string[];               // application issues (missing docs, data gaps)
}

const MEMBERS: GroupMemberDetail[] = [
  { id: "m1", name: "Lincoln High School",     memberType: "K-12 Public School",   state: "TX", enrollment: 1240, products: ["GL", "Prop"],        estimatedPremium: 22400, lossRatio: 41, ruleTier: "Preferred", issues: [] },
  { id: "m2", name: "Madison Academy",         memberType: "Charter School",       state: "TX", enrollment: 380,  products: ["GL"],                estimatedPremium: 6800,  lossRatio: 28, ruleTier: "Preferred", issues: [] },
  { id: "m3", name: "Pinegrove Elementary",    memberType: "K-12 Public School",   state: "TX", enrollment: 612,  products: ["GL", "Prop"],        estimatedPremium: 11900, lossRatio: 54, ruleTier: "Standard",  issues: ["Sprinkler inspection > 12 months old"] },
  { id: "m4", name: "Roosevelt Middle",        memberType: "K-12 Public School",   state: "TX", enrollment: 740,  products: ["GL", "Prop"],        estimatedPremium: 14600, lossRatio: 49, ruleTier: "Standard",  issues: [] },
  { id: "m5", name: "Cedar Charter Network",   memberType: "Charter School",       state: "TX", enrollment: 1820, products: ["GL", "ELL"],         estimatedPremium: 38200, lossRatio: 71, ruleTier: "Referred",  issues: ["Loss ratio missing for PY-1", "ELL open claim > $250K reserve"] },
  { id: "m6", name: "Westlake Academy",        memberType: "Private K-12",         state: "TX", enrollment: 295,  products: ["GL"],                estimatedPremium: 5200,  lossRatio: 18, ruleTier: "Preferred", issues: ["Member type pending verification"] },
  { id: "m7", name: "Travis ISD Annex",        memberType: "K-12 Public District", state: "TX", enrollment: 2150, products: ["GL", "Prop", "ELL"], estimatedPremium: 47800, lossRatio: 62, ruleTier: "Standard",  issues: [] },
];

const GROUP_NAME = "Central Texas Schools Consortium";

const TIER_STYLE: Record<GroupMemberDetail["ruleTier"], { bg: string; color: string; border: string }> = {
  Preferred: { bg: "#E8F5EC", color: OK,   border: "#93C8A0" },
  Standard:  { bg: "#F0F3F8", color: TM,   border: BDL       },
  Referred:  { bg: "#FFF8E6", color: WARN, border: "#F0D88A" },
  Decline:   { bg: "#FBEAEA", color: BAD,  border: "#E8A8A8" },
};

function fmtMoney(n: number): string {
  return n === 0 ? "—" : "$" + n.toLocaleString();
}

function lossColor(lr: number): string {
  if (lr >= 70) return BAD;
  if (lr >= 55) return WARN;
  return OK;
}

export function GroupMembersTab() {
  const [tierFilter, setTierFilter] = useState<GroupMemberDetail["ruleTier"] | "All">("All");
  const [groupBy,    setGroupBy]    = useState<"none" | "type" | "tier">("none");

  const visible = MEMBERS.filter(m => tierFilter === "All" || m.ruleTier === tierFilter);

  const totalPremium    = MEMBERS.reduce((s, m) => s + m.estimatedPremium, 0);
  const totalEnrollment = MEMBERS.reduce((s, m) => s + m.enrollment, 0);
  const totalIssues     = MEMBERS.reduce((s, m) => s + m.issues.length, 0);
  const refTier         = MEMBERS.filter(m => m.ruleTier === "Referred").length;

  // Weighted (premium-weighted) group loss ratio. Stand-in for the real
  // aggregation that the rating service would produce off the loss runs.
  const groupLossRatio = MEMBERS.reduce((s, m) => s + m.lossRatio * m.estimatedPremium, 0) / totalPremium;

  // Member-type aggregates surface the multi-tier rule story: each type has
  // its own LR and authority band, so showing them grouped makes the
  // "multi-layered rules" concept concrete.
  const byType = Array.from(new Set(MEMBERS.map(m => m.memberType))).map(t => {
    const inGroup  = MEMBERS.filter(m => m.memberType === t);
    const premium  = inGroup.reduce((s, m) => s + m.estimatedPremium, 0);
    const wlr      = inGroup.reduce((s, m) => s + m.lossRatio * m.estimatedPremium, 0) / (premium || 1);
    return { type: t, count: inGroup.length, premium, weightedLR: wlr };
  });

  const kpis: KPI[] = [
    { label: "Members",          value: String(MEMBERS.length),                sub: `${byType.length} member types`,                  trend: "none", accent: N,    icon: <Users size={16}/>          },
    { label: "Total Enrollment", value: totalEnrollment.toLocaleString(),      sub: "Across all members",                             trend: "none", accent: G,    icon: <Hash size={16}/>           },
    { label: "Group Premium",    value: fmtMoney(totalPremium),                sub: "Indicated, pre-credit",                          trend: "up",   accent: N,    icon: <DollarSign size={16}/>     },
    { label: "Group Loss Ratio", value: `${groupLossRatio.toFixed(0)}%`,       sub: "Premium-weighted",                               trend: groupLossRatio >= 60 ? "up" : "down", accent: lossColor(groupLossRatio), icon: <TrendingDown size={16}/> },
  ];

  return (
    <div className="space-y-5" style={{ fontFamily: font }}>
      {/* ── Group identity banner ───────────────────────────────────── */}
      <div
        style={{
          background: `linear-gradient(135deg, #7B2FBE10 0%, #7B2FBE05 100%)`,
          border: `1px solid #7B2FBE30`,
          borderLeft: `4px solid #7B2FBE`,
          borderRadius: 8,
          padding: "14px 16px",
        }}
      >
        <div className="flex items-start gap-3">
          <div
            className="flex items-center justify-center shrink-0"
            style={{ width: 36, height: 36, borderRadius: 8, background: "#7B2FBE15", color: "#7B2FBE" }}
          >
            <Users size={18}/>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="flex items-center gap-2 flex-wrap">
              <span style={{ fontSize: "0.60rem", fontWeight: 800, color: "#7B2FBE", textTransform: "uppercase", letterSpacing: "0.09em" }}>
                Group Submission
              </span>
              <span style={{
                fontSize: "0.58rem", fontWeight: 700, color: "#7B2FBE",
                background: "#7B2FBE12", border: "1px solid #7B2FBE30",
                padding: "1px 7px", borderRadius: 10,
              }}>
                Multi-layered rules
              </span>
            </div>
            <p style={{ fontSize: "1.00rem", color: TD, fontWeight: 800, marginTop: 4, lineHeight: 1.3 }}>
              {GROUP_NAME}
            </p>
            <p style={{ fontSize: "0.74rem", color: TM, marginTop: 2, lineHeight: 1.5 }}>
              {MEMBERS.length} members · {byType.length} member types ·
              {" "}rating, eligibility & authority limits evaluated per member tier and at the group level.
            </p>
          </div>
          {refTier > 0 && (
            <div
              className="flex items-center gap-1.5 shrink-0"
              style={{
                background: "#FFF8E6", border: "1px solid #F0D88A",
                padding: "4px 10px", borderRadius: 4,
              }}
            >
              <Flag size={12} color="#8A5C00"/>
              <span style={{ fontSize: "0.66rem", fontWeight: 800, color: "#7A4800" }}>
                {refTier} referral{refTier === 1 ? "" : "s"} pending
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── KPI strip ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map((k, i) => <KPITile key={i} k={k}/>)}
      </div>

      {/* ── Rule tier summary (multi-layered rules made concrete) ──── */}
      <SectionCard title="Performance by Member Type" accent="#7B2FBE" icon={<ShieldAlert size={13}/>} noPad>
        <table className="w-full" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#FAFBFD" }}>
              {["Member Type", "Count", "Group Premium", "Weighted Loss Ratio", "Pricing Tier", "Authority"].map(h => (
                <th
                  key={h}
                  className="px-5 py-2.5 text-left whitespace-nowrap"
                  style={{
                    fontSize: "0.58rem", fontWeight: 700, color: TT,
                    textTransform: "uppercase", letterSpacing: "0.09em",
                    borderBottom: `1px solid ${BDL}`,
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {byType.map((row, i, arr) => {
              const isLast = i === arr.length - 1;
              const tier   = row.weightedLR >= 65 ? "Referred" : row.weightedLR >= 50 ? "Standard" : "Preferred";
              const ts     = TIER_STYLE[tier];
              return (
                <tr
                  key={row.type}
                  className="hover:bg-slate-50 transition-colors"
                  style={{ borderBottom: isLast ? "none" : `1px solid #EEF1F5` }}
                >
                  <td className="px-5 py-3" style={{ fontSize: "0.84rem", color: TD, fontWeight: 700 }}>
                    {row.type}
                  </td>
                  <td className="px-5 py-3" style={{ fontSize: "0.82rem", color: TM, fontVariantNumeric: "tabular-nums" }}>
                    {row.count}
                  </td>
                  <td className="px-5 py-3" style={{ fontSize: "0.82rem", color: TD, fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
                    {fmtMoney(row.premium)}
                  </td>
                  <td className="px-5 py-3">
                    <span style={{
                      fontSize: "0.78rem", fontWeight: 800,
                      color: lossColor(row.weightedLR),
                      fontVariantNumeric: "tabular-nums",
                    }}>
                      {row.weightedLR.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className="inline-flex items-center gap-1.5"
                      style={{
                        background: ts.bg, color: ts.color,
                        border: `1px solid ${ts.border}`,
                        padding: "2px 9px", borderRadius: 4,
                        fontSize: "0.66rem", fontWeight: 800,
                        textTransform: "uppercase", letterSpacing: "0.06em",
                      }}
                    >
                      {tier}
                    </span>
                  </td>
                  <td className="px-5 py-3" style={{ fontSize: "0.74rem", color: TM }}>
                    {tier === "Referred"
                      ? "Sr. UW sign-off required"
                      : tier === "Standard"
                        ? "Within UW authority"
                        : "Auto-renewal eligible"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </SectionCard>

      {/* ── Member roster ──────────────────────────────────────────── */}
      <SectionCard
        title="Member Roster"
        accent={N}
        icon={<Building2 size={13}/>}
        noPad
        action={
          <div className="flex items-center gap-3 flex-wrap">
            {totalIssues > 0 && (
              <span
                className="inline-flex items-center gap-1.5"
                style={{
                  background: "#FFF8E6", color: "#8A5C00",
                  border: "1px solid #F0D88A",
                  padding: "2px 9px", borderRadius: 10,
                  fontSize: "0.66rem", fontWeight: 700,
                }}
              >
                <AlertTriangle size={11}/>
                {totalIssues} application issue{totalIssues === 1 ? "" : "s"}
              </span>
            )}
            <div className="flex items-center gap-1">
              {(["All", "Preferred", "Standard", "Referred"] as const).map(t => {
                const active = tierFilter === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTierFilter(t)}
                    style={{
                      border: `1px solid ${active ? N : BDL}`,
                      background: active ? `${N}10` : "white",
                      color: active ? N : TM,
                      fontSize: "0.66rem", fontWeight: 700,
                      padding: "3px 9px", borderRadius: 4,
                      cursor: "pointer", fontFamily: font,
                    }}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#FAFBFD" }}>
                {["Member", "Type", "State", "Enrollment", "Products", "Est. Premium", "Loss Ratio", "Tier", "Issues"].map(h => (
                  <th
                    key={h}
                    className="px-4 py-2.5 text-left whitespace-nowrap"
                    style={{
                      fontSize: "0.58rem", fontWeight: 700, color: TT,
                      textTransform: "uppercase", letterSpacing: "0.09em",
                      borderBottom: `1px solid ${BDL}`,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map((m, i, arr) => {
                const isLast = i === arr.length - 1;
                const ts     = TIER_STYLE[m.ruleTier];
                return (
                  <tr
                    key={m.id}
                    className="hover:bg-slate-50 transition-colors cursor-pointer"
                    style={{
                      borderBottom: isLast ? "none" : `1px solid #EEF1F5`,
                      background: m.issues.length ? "#FFFBF0" : "white",
                      borderLeft: m.issues.length ? `3px solid ${WARN}` : "3px solid transparent",
                    }}
                  >
                    <td className="px-4 py-3" style={{ fontSize: "0.82rem", fontWeight: 700, color: TD }}>
                      {m.name}
                    </td>
                    <td className="px-4 py-3" style={{ fontSize: "0.74rem", color: TM }}>
                      {m.memberType}
                    </td>
                    <td className="px-4 py-3" style={{ fontSize: "0.74rem", color: TM, fontWeight: 600 }}>
                      {m.state}
                    </td>
                    <td className="px-4 py-3" style={{ fontSize: "0.76rem", color: TD, fontVariantNumeric: "tabular-nums", textAlign: "right" }}>
                      {m.enrollment.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 flex-wrap">
                        {m.products.map(p => (
                          <span
                            key={p}
                            style={{
                              background: "#F1F4F8", color: TM,
                              fontSize: "0.60rem", fontWeight: 700,
                              padding: "2px 6px", borderRadius: 3,
                              letterSpacing: "0.02em",
                            }}
                          >
                            {p}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3" style={{ fontSize: "0.80rem", fontWeight: 700, color: TD, fontVariantNumeric: "tabular-nums", textAlign: "right" }}>
                      {fmtMoney(m.estimatedPremium)}
                    </td>
                    <td className="px-4 py-3">
                      <span style={{
                        fontSize: "0.74rem", fontWeight: 800,
                        color: lossColor(m.lossRatio),
                        fontVariantNumeric: "tabular-nums",
                      }}>
                        {m.lossRatio}%
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="inline-flex items-center gap-1.5"
                        style={{
                          background: ts.bg, color: ts.color,
                          border: `1px solid ${ts.border}`,
                          padding: "2px 8px", borderRadius: 4,
                          fontSize: "0.64rem", fontWeight: 800,
                          textTransform: "uppercase", letterSpacing: "0.06em",
                        }}
                      >
                        {m.ruleTier}
                      </span>
                    </td>
                    <td className="px-4 py-3" style={{ minWidth: 200 }}>
                      {m.issues.length === 0 ? (
                        <span className="inline-flex items-center gap-1" style={{ color: OK, fontSize: "0.70rem", fontWeight: 600 }}>
                          <CheckCircle2 size={11}/> Ready
                        </span>
                      ) : (
                        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                          {m.issues.map((iss, idx) => (
                            <li key={idx} className="flex items-start gap-1.5" style={{ marginBottom: idx < m.issues.length - 1 ? 3 : 0 }}>
                              <AlertCircle size={10} color={WARN} style={{ flexShrink: 0, marginTop: 3 }}/>
                              <span style={{ fontSize: "0.66rem", color: "#7A4800", fontWeight: 600 }}>{iss}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* ── AI insight card (multi-broker, multi-UW detection) ───── */}
      <SectionCard title="AI Account Recognition · Group Signals" accent="#7B2FBE" icon={<Sparkles size={13}/>}>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, fontSize: "0.78rem", color: TD }}>
          {[
            "2 broker contacts detected on the cover packet — verify primary contact before sending the indication letter.",
            "1 underwriter currently assigned · the Charter School tier may need co-assignment to the Education Specialist.",
            `${byType.length} member types in scope — multi-layered eligibility & authority rules will run per member.`,
            "Multi-product quoting active: per-member product mix below feeds the Rating tab as separate line items.",
          ].map((line, i) => (
            <li
              key={i}
              className="flex items-start gap-2"
              style={{
                padding: "8px 0",
                borderBottom: i < 3 ? `1px solid ${BDL}` : "none",
                lineHeight: 1.45,
              }}
            >
              <ChevronRight size={12} color="#7B2FBE" style={{ flexShrink: 0, marginTop: 4 }}/>
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </SectionCard>
    </div>
  );
}
