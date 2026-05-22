import { AlertCircle, CheckCircle2, XCircle, ShieldCheck, Flame, Droplets, Building2, Lock, Users } from "lucide-react";
import { N, G, BDL, TD, TM, TT, OK, WARN, BAD, SectionCard, font } from "../DashboardCards";

function Field({ label, value, highlight }: { label: string; value: string; highlight?: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span style={{ fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.09em", color: TT }}>
        {label}
      </span>
      <span style={{ fontSize: "0.86rem", fontWeight: highlight ? 700 : 500, color: highlight || TD }}>
        {value}
      </span>
    </div>
  );
}

function RiskBar({ label, score, color }: { label: string; score: number; color: string }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span style={{ fontSize: "0.78rem", color: TM, fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: "0.78rem", color, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
          {score}<span style={{ fontWeight: 400, color: TT }}>/100</span>
        </span>
      </div>
      <div style={{ width: "100%", height: 5, background: "#EEF1F5", borderRadius: 9999, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${score}%`, background: color, borderRadius: 9999, transition: "width 0.6s ease" }}/>
      </div>
    </div>
  );
}

function CheckRow({ label, value, isLast }: { label: string; value: boolean | "partial"; isLast?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2.5"
      style={{ borderBottom: isLast ? "none" : `1px solid #EEF1F5` }}>
      <span style={{ fontSize: "0.8rem", color: TD }}>{label}</span>
      {value === true && <CheckCircle2 size={15} color={OK}/>}
      {value === false && <XCircle size={15} color={BAD}/>}
      {value === "partial" && (
        <div className="inline-flex items-center gap-1.5">
          <AlertCircle size={14} color={WARN}/>
          <span style={{ fontSize: "0.7rem", color: WARN, fontWeight: 700 }}>Partial</span>
        </div>
      )}
    </div>
  );
}

function SubHead({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-2 mt-4 first:mt-0 pb-2"
      style={{ borderBottom: `1px solid ${BDL}` }}>
      <span className="inline-flex items-center justify-center"
        style={{ width: 20, height: 20, borderRadius: 5, background: `${N}10`, color: N }}>
        {icon}
      </span>
      <span style={{ fontSize: "0.66rem", fontWeight: 700, color: N, textTransform: "uppercase", letterSpacing: "0.08em" }}>
        {label}
      </span>
    </div>
  );
}

export function RiskTab() {
  return (
    <div className="space-y-5" style={{ fontFamily: font }}>
      {/* Top row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <SectionCard title="Key Exposure Metrics" accent={G}>
          <div>
            {[
              { label: "Total Insured Value (TIV)", value: "$412,000,000", color: N, weight: 800 },
              { label: "Per-Occurrence SIR",        value: "$50,000",       color: WARN, weight: 700 },
              { label: "Annual Aggregate SIR",      value: "$150,000",      color: WARN, weight: 700 },
              { label: "Largest Single Location",   value: "$28,400,000",   color: TD, weight: 600 },
              { label: "Total Sq. Footage",         value: "2,140,000 sq ft", color: TD, weight: 500 },
              { label: "No. of Buildings",          value: "142",            color: TD, weight: 500 },
            ].map((m, i, arr) => (
              <div key={i} className="flex items-center justify-between py-2.5"
                style={{ borderBottom: i === arr.length - 1 ? "none" : `1px solid #EEF1F5` }}>
                <span style={{ fontSize: "0.78rem", color: TT }}>{m.label}</span>
                <span style={{
                  fontSize: "0.86rem", fontWeight: m.weight, color: m.color,
                  fontVariantNumeric: "tabular-nums",
                }}>
                  {m.value}
                </span>
              </div>
            ))}
          </div>
        </SectionCard>

        <div className="md:col-span-2">
          <SectionCard title="Property & Construction Details" accent={N}>
            <div className="grid grid-cols-2 gap-y-5 gap-x-8">
              <Field label="Primary Construction"  value="Masonry / Steel Frame"/>
              <Field label="Roof Type"             value="Modified Bitumen / TPO"/>
              <Field label="Year Built (Avg.)"     value="1968 (Range: 1942–2019)"/>
              <Field label="Sprinkler Coverage"    value="94% of Buildings" highlight={OK}/>
              <Field label="Occupancy Type"        value="Educational (K-12 Public)"/>
              <Field label="Coinsurance Clause"    value="90% Agreed Value"/>
              <Field label="Valuation Basis"       value="Replacement Cost Value"/>
              <Field label="Flood Zone"            value="Zone X – Low Risk" highlight={OK}/>
              <Field label="Earthquake Zone"       value="Zone 3 – Moderate" highlight={WARN}/>
              <Field label="Fire Protection Class" value="Class 3 (ISO)" highlight={OK}/>
              <Field label="Distance to Fire Stn." value="0.8 Miles (Avg.)"/>
              <Field label="COPE Score"            value="82 / 100" highlight={OK}/>
            </div>
          </SectionCard>
        </div>
      </div>

      {/* Middle row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <SectionCard title="Risk Score Breakdown" accent={G}>
          <div className="space-y-4">
            <RiskBar label="Campus Safety Rating"       score={88} color={OK}/>
            <RiskBar label="Claims Severity Index"      score={34} color={OK}/>
            <RiskBar label="Policy Complexity"          score={61} color={WARN}/>
            <RiskBar label="Litigation Exposure"        score={22} color={OK}/>
            <RiskBar label="Cyber / Data Risk"          score={48} color={WARN}/>
            <RiskBar label="Natural Catastrophe Hazard" score={39} color={OK}/>
            <RiskBar label="Student Injury Frequency"   score={27} color={OK}/>
          </div>
          <div className="mt-5 flex items-center justify-between px-4 py-3"
            style={{ background: `${N}08`, borderRadius: 6 }}>
            <span style={{ fontSize: "0.74rem", color: N, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Overall Risk Score
            </span>
            <span style={{ fontSize: "1.2rem", fontWeight: 800, color: N, fontVariantNumeric: "tabular-nums" }}>
              74 <span style={{ fontSize: "0.78rem", fontWeight: 400, color: TM }}>/ 100</span>
            </span>
          </div>
        </SectionCard>

        <SectionCard title="Safety & Security Programs" accent={N}>
          <SubHead icon={<ShieldCheck size={12}/>} label="Emergency Preparedness"/>
          <CheckRow label="Active Shooter Response Drills"   value={true}/>
          <CheckRow label="Fire Evacuation Plan (Current)"   value={true}/>
          <CheckRow label="Earthquake/Lockdown Protocol"     value={true}/>
          <CheckRow label="Crisis Management Team Active"    value={true} isLast/>

          <SubHead icon={<Lock size={12}/>} label="Physical Security"/>
          <CheckRow label="24/7 Campus Security Personnel"   value={true}/>
          <CheckRow label="CCTV Coverage (All Campuses)"     value="partial"/>
          <CheckRow label="Visitor Check-In System"          value={true}/>
          <CheckRow label="Perimeter Fencing"                value={true} isLast/>

          <SubHead icon={<Users size={12}/>} label="Risk Management Programs"/>
          <CheckRow label="Formal Safety Committee"          value={true}/>
          <CheckRow label="Annual Risk Assessment Conducted" value={true}/>
          <CheckRow label="Workers' Comp Safety Program"     value={true}/>
          <CheckRow label="Student Supervision Policy"       value={true}/>
          <CheckRow label="Background Checks – All Staff"    value={true}/>
          <CheckRow label="Playground Safety Inspection"     value="partial" isLast/>
        </SectionCard>
      </div>

      {/* Bottom */}
      <SectionCard title="Liability & Specialized Exposure Details" accent={N}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: <Flame size={18}/>,        color: BAD,        label: "Abuse & Molestation",      value: "Endorsed – $1M sublimit",      bg: "#FEE2E2" },
            { icon: <Building2 size={18}/>,    color: N,          label: "Educators Legal Liability", value: "Included – $3M limit",         bg: "#E0E7FF" },
            { icon: <Droplets size={18}/>,     color: "#0369A1",  label: "Environmental Liability",   value: "Excluded – Standalone Policy", bg: "#E0F4FA" },
            { icon: <ShieldCheck size={18}/>,  color: OK,         label: "Student Accident",          value: "$500K / $1M Agg.",             bg: "#E8F5EC" },
          ].map((item, i) => (
            <div key={i} className="p-4"
              style={{ background: "white", border: `1px solid ${BDL}`, borderRadius: 8 }}>
              <span className="inline-flex items-center justify-center mb-3"
                style={{ width: 32, height: 32, borderRadius: 8, background: item.bg, color: item.color }}>
                {item.icon}
              </span>
              <p style={{
                fontSize: "0.7rem", fontWeight: 800, color: TT,
                textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4,
              }}>
                {item.label}
              </p>
              <p style={{ fontSize: "0.8rem", color: TD, fontWeight: 600 }}>{item.value}</p>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
