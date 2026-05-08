import { AlertCircle, CheckCircle2, XCircle, ShieldCheck, Flame, Droplets, Building2, Lock, Users } from "lucide-react";

const N   = "#0123D4";
const G   = "#C9A227";
const TH  = "#F0F3F8";
const BD  = "#C4CDD8";
const BDL = "#DCE3EC";
const TD  = "#1A2530";
const TM  = "#4A5D6E";
const TT  = "#7A8FA3";

function Card({ title, accent = N, children }: { title: string; accent?: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "white", border: `1px solid ${BD}`, borderTop: `3px solid ${accent}` }}>
      <div className="px-5 py-3.5" style={{ borderBottom: `1px solid ${BDL}`, background: TH }}>
        <h3 style={{ fontSize: "0.82rem", fontWeight: 700, color: N, textTransform: "uppercase", letterSpacing: "0.06em" }}>{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function Field({ label, value, highlight }: { label: string; value: string; highlight?: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span style={{ fontSize: "0.62rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.09em", color: TT }}>{label}</span>
      <span style={{ fontSize: "0.875rem", fontWeight: highlight ? 700 : 500, color: highlight || TD }}>{value}</span>
    </div>
  );
}

function RiskBar({ label, score, color }: { label: string; score: number; color: string }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span style={{ fontSize: "0.82rem", color: TM, fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: "0.82rem", color, fontWeight: 700 }}>{score}<span style={{ fontWeight: 400, color: TT }}>/100</span></span>
      </div>
      <div className="w-full" style={{ height: 6, background: BDL }}>
        <div style={{ height: 6, width: `${score}%`, background: color, transition: "width 0.6s ease" }} />
      </div>
    </div>
  );
}

function CheckRow({ label, value }: { label: string; value: boolean | "partial" }) {
  return (
    <div className="flex items-center justify-between py-2.5" style={{ borderBottom: `1px solid ${BDL}` }}>
      <span style={{ fontSize: "0.84rem", color: TD }}>{label}</span>
      {value === true    && <CheckCircle2 size={16} color="#2E7D32" />}
      {value === false   && <XCircle size={16} color="#B91C1C" />}
      {value === "partial" && (
        <div className="flex items-center gap-1.5">
          <AlertCircle size={16} color="#B45309" />
          <span style={{ fontSize: "0.72rem", color: "#B45309", fontWeight: 600 }}>Partial</span>
        </div>
      )}
    </div>
  );
}

function SubHead({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-2 mt-4 first:mt-0">
      <span style={{ color: N }}>{icon}</span>
      <span style={{ fontSize: "0.7rem", fontWeight: 700, color: N, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</span>
    </div>
  );
}

export function RiskTab() {
  return (
    <div className="space-y-5">
      {/* Top row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Key Exposure Metrics */}
        <Card title="Key Exposure Metrics" accent={G}>
          <div className="space-y-0">
            {[
              { label: "Total Insured Value (TIV)", value: "$412,000,000", color: N, weight: 800 },
              { label: "Per-Occurrence SIR",        value: "$50,000",       color: "#B45309", weight: 700 },
              { label: "Annual Aggregate SIR",      value: "$150,000",      color: "#B45309", weight: 700 },
              { label: "Largest Single Location",   value: "$28,400,000",   color: TD, weight: 600 },
              { label: "Total Sq. Footage",         value: "2,140,000 sq ft", color: TD, weight: 500 },
              { label: "No. of Buildings",          value: "142",            color: TD, weight: 500 },
            ].map((m, i) => (
              <div key={i} className="flex items-center justify-between py-2.5" style={{ borderBottom: `1px solid ${BDL}` }}>
                <span style={{ fontSize: "0.82rem", color: TT }}>{m.label}</span>
                <span style={{ fontSize: "0.875rem", fontWeight: m.weight, color: m.color }}>{m.value}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Property Details */}
        <div className="md:col-span-2">
          <Card title="Property & Construction Details">
            <div className="grid grid-cols-2 gap-y-5 gap-x-8">
              <Field label="Primary Construction"  value="Masonry / Steel Frame" />
              <Field label="Roof Type"             value="Modified Bitumen / TPO" />
              <Field label="Year Built (Avg.)"     value="1968 (Range: 1942–2019)" />
              <Field label="Sprinkler Coverage"    value="94% of Buildings" highlight="#2E7D32" />
              <Field label="Occupancy Type"        value="Educational (K-12 Public)" />
              <Field label="Coinsurance Clause"    value="90% Agreed Value" />
              <Field label="Valuation Basis"       value="Replacement Cost Value" />
              <Field label="Flood Zone"            value="Zone X – Low Risk" highlight="#2E7D32" />
              <Field label="Earthquake Zone"       value="Zone 3 – Moderate" highlight="#B45309" />
              <Field label="Fire Protection Class" value="Class 3 (ISO)" highlight="#2E7D32" />
              <Field label="Distance to Fire Stn." value="0.8 Miles (Avg.)" />
              <Field label="COPE Score"            value="82 / 100" highlight="#2E7D32" />
            </div>
          </Card>
        </div>
      </div>

      {/* Middle row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Risk Score Breakdown */}
        <Card title="Risk Score Breakdown" accent={G}>
          <div className="space-y-4">
            <RiskBar label="Campus Safety Rating"       score={88} color="#2E7D32" />
            <RiskBar label="Claims Severity Index"      score={34} color="#2E7D32" />
            <RiskBar label="Policy Complexity"          score={61} color="#B45309" />
            <RiskBar label="Litigation Exposure"        score={22} color="#2E7D32" />
            <RiskBar label="Cyber / Data Risk"          score={48} color="#B45309" />
            <RiskBar label="Natural Catastrophe Hazard" score={39} color="#2E7D32" />
            <RiskBar label="Student Injury Frequency"   score={27} color="#2E7D32" />
          </div>
          <div className="mt-5 flex items-center justify-between px-4 py-3" style={{ background: "#E8F0F9", border: `1px solid #9ABCD6` }}>
            <span style={{ fontSize: "0.82rem", color: N, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Overall Risk Score</span>
            <span style={{ fontSize: "1.1rem", fontWeight: 800, color: N }}>74 <span style={{ fontSize: "0.78rem", fontWeight: 400, color: TM }}>/ 100</span></span>
          </div>
        </Card>

        {/* Safety Programs */}
        <Card title="Safety & Security Programs">
          <SubHead icon={<ShieldCheck size={13} />} label="Emergency Preparedness" />
          <CheckRow label="Active Shooter Response Drills"   value={true} />
          <CheckRow label="Fire Evacuation Plan (Current)"   value={true} />
          <CheckRow label="Earthquake/Lockdown Protocol"     value={true} />
          <CheckRow label="Crisis Management Team Active"    value={true} />

          <SubHead icon={<Lock size={13} />} label="Physical Security" />
          <CheckRow label="24/7 Campus Security Personnel"   value={true} />
          <CheckRow label="CCTV Coverage (All Campuses)"     value="partial" />
          <CheckRow label="Visitor Check-In System"          value={true} />
          <CheckRow label="Perimeter Fencing"                value={true} />

          <SubHead icon={<Users size={13} />} label="Risk Management Programs" />
          <CheckRow label="Formal Safety Committee"          value={true} />
          <CheckRow label="Annual Risk Assessment Conducted" value={true} />
          <CheckRow label="Workers' Comp Safety Program"     value={true} />
          <CheckRow label="Student Supervision Policy"       value={true} />
          <CheckRow label="Background Checks – All Staff"    value={true} />
          <CheckRow label="Playground Safety Inspection"     value="partial" />
        </Card>
      </div>

      {/* Bottom */}
      <Card title="Liability & Specialized Exposure Details">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: <Flame size={20} color="#B91C1C" />,   label: "Abuse & Molestation",      value: "Endorsed – $1M sublimit",       bg: "#FBEAEA", border: "#E8A8A8" },
            { icon: <Building2 size={20} color={N} />,     label: "Educators Legal Liability", value: "Included – $3M limit",          bg: "#E8F0F9", border: "#9ABCD6" },
            { icon: <Droplets size={20} color="#0369A1" />,label: "Environmental Liability",   value: "Excluded – Standalone Policy",  bg: "#E0F4FA", border: "#7ACCE8" },
            { icon: <ShieldCheck size={20} color="#2E7D32"/>,label: "Student Accident",        value: "$500K / $1M Agg.",              bg: "#E8F5EC", border: "#93C8A0" },
          ].map((item, i) => (
            <div key={i} className="p-4" style={{ background: item.bg, border: `1px solid ${item.border}` }}>
              <div className="mb-2">{item.icon}</div>
              <p style={{ fontSize: "0.75rem", fontWeight: 700, color: TD, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>{item.label}</p>
              <p style={{ fontSize: "0.82rem", color: TM }}>{item.value}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}