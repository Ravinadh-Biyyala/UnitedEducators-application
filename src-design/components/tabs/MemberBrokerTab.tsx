import { useState } from "react";
import { Building2, CheckCircle2, MapPin, GraduationCap, FileText } from "lucide-react";

const N   = "#0123D4";
const G   = "#C9A227";
const BD  = "#C4CDD8";
const BDL = "#DCE3EC";
const TH  = "#F0F3F8";
const TD  = "#1A2530";
const TM  = "#4A5D6E";
const TT  = "#5F7080";
const font = "'Source Sans 3', system-ui, sans-serif";

/* ── Label/Value row ────────────────────────────────────────────────────── */
function Row({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <div className="flex items-start py-2" style={{ borderBottom: `1px solid ${BDL}` }}>
      <span style={{ flex: "0 0 44%", fontSize: "0.775rem", color: TT, paddingRight: 8 }}>{label}</span>
      <span style={{ flex: 1, fontSize: "0.775rem", fontWeight: 500, color: valueColor ?? TD }}>{value || "—"}</span>
    </div>
  );
}

/* ── Section card ───────────────────────────────────────────────────────── */
function Section({ title, accent = N, badge, icon, children }: {
  title: string; accent?: string; badge?: string; icon?: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <div style={{
      background: "white",
      border: `1px solid ${BDL}`,
      borderRadius: 8,
      overflow: "hidden",
      boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
    }}>
      <div className="flex items-center justify-between px-5 py-3.5"
        style={{ borderBottom: `1px solid ${BDL}`, background: "#FAFBFD" }}>
        <div className="flex items-center gap-2.5">
          {icon && (
            <span className="inline-flex items-center justify-center"
              style={{ width: 26, height: 26, borderRadius: 6, background: `${accent}12`, color: accent }}>
              {icon}
            </span>
          )}
          <h3 style={{ fontSize: "0.86rem", fontWeight: 700, color: TD, letterSpacing: "-0.005em" }}>
            {title}
          </h3>
        </div>
        {badge && (
          <span style={{ fontSize: "0.70rem", color: TM, fontWeight: 500 }}>{badge}</span>
        )}
      </div>
      <div className="px-5 pt-1 pb-3">{children}</div>
    </div>
  );
}

/* ── Two-column layout ──────────────────────────────────────────────────── */
function TwoColGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10">{children}</div>;
}

/* ── Quick stat cell ────────────────────────────────────────────────────── */
function StatCell({ label, value, dot, last }: { label: string; value: string; dot?: boolean; last?: boolean }) {
  return (
    <div className="px-5 py-3 flex flex-col gap-0.5"
      style={{ borderRight: last ? undefined : `1px solid ${BDL}` }}>
      <span style={{ fontSize: "0.60rem", fontWeight: 700, color: TT,
        textTransform: "uppercase", letterSpacing: "0.09em" }}>{label}</span>
      <span className="flex items-center gap-1.5"
        style={{ fontSize: "0.85rem", fontWeight: 700, color: TD }}>
        {dot && <span style={{ width: 7, height: 7, borderRadius: "50%",
          background: "#2E7D32", display: "inline-block", flexShrink: 0 }} />}
        {value}
      </span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MEMBER VIEW
═══════════════════════════════════════════════════════════════════════════ */
function MemberView() {
  return (
    <div className="space-y-4">
      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5"
        style={{ background: "white", border: `1px solid ${BD}`, borderRadius: 8, overflow: "hidden" }}>
        <StatCell label="Account Record Type" value="Institution" />
        <StatCell label="Member Number"       value="473" />
        <StatCell label="Physical City"       value="Westport, CT" />
        <StatCell label="Status"              value="Active" dot />
        <StatCell label="Member Since"        value="2014 · 12 yrs" last />
      </div>

      {/* Account Information */}
      <Section title="Account Information" icon={<FileText size={13}/>}>
        <TwoColGrid>
          <div>
            <Row label="Account Name"           value="Brookfield Day School" />
            <Row label="DEC Page Name"           value="Brookfield Day School" />
            <Row label="Preferred Account Name"  value="Brookfield Day" />
            <Row label="Member Number"           value="473" />
            <Row label="Parent Account"          value="—" />
            <Row label="Group"                   value="—" />
            <Row label="Group Number"            value="—" />
          </div>
          <div>
            <Row label="Account Record Type"  value="Institution" />
            <Row label="Account Sub-Type"     value="Insured" />
            <Row label="Member Status"        value="Member" />
            <Row label="Account Status"       value="Active" valueColor="#2E7D32" />
          </div>
        </TwoColGrid>
      </Section>

      {/* Institution Profile */}
      <Section title="Institution Profile" icon={<GraduationCap size={13}/>}>
        <TwoColGrid>
          <div>
            <Row label="Institution Type"         value="K-12" />
            <Row label="Sub-Category"             value="Private" />
            <Row label="Boarding Options"         value="Day only · No boarding" />
            <Row label="Underwriting Track"       value="Choice" />
            <Row label="Intercollegiate Football" value="N/A" />
          </div>
          <div>
            <Row label="Education Segment" value="Schools / Colleges" />
            <Row label="Total Enrollment"  value="842" />
            <Row label="Renewal Type"      value="Annual" />
            <Row label="Budget"            value="$28,400,000" />
            <Row label="Territory"         value="Northeast" />
          </div>
        </TwoColGrid>
      </Section>

      {/* Address Information */}
      <Section title="Address Information" icon={<MapPin size={13}/>}>
        <TwoColGrid>
          <div>
            <Row label="Physical Address 1"       value="32 Riverside Avenue" />
            <Row label="Physical Address 2"       value="—" />
            <Row label="Physical City"            value="Westport" />
            <Row label="Physical State/Province"  value="CT" />
            <Row label="Physical Zip/Postal Code" value="06880" />
            <Row label="Physical County"          value="Fairfield" />
            <Row label="Physical Country"         value="United States" />
          </div>
          <div>
            <Row label="Copy from Physical"       value="✓" valueColor={N} />
            <Row label="Mailing Address 1"        value="32 Riverside Avenue" />
            <Row label="Mailing Address 2"        value="—" />
            <Row label="Mailing City"             value="Westport" />
            <Row label="Mailing State/Province"   value="CT" />
            <Row label="Mailing Zip/Postal Code"  value="06880" />
            <Row label="Mailing Country"          value="United States" />
          </div>
        </TwoColGrid>
      </Section>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   BROKERAGE VIEW
═══════════════════════════════════════════════════════════════════════════ */
const BROKER_CONTACTS = [
  {
    name: "Tyler Owens",
    phone: "(283) 555-1142",
    email: "towens@marshmma.com",
    access: "All Products",
    roles: ["Contact Manager", "GL Producer", "PL Producer", "ACK Memo"],
    highlight: false,
  },
  {
    name: "Ashleigh Choi",
    phone: "(212) 555-2114",
    email: "achoi@marshmma.com",
    access: "All Products",
    roles: ["Contact Manager", "GL CSR", "PL CSR", "ML CSR"],
    highlight: false,
  },
  {
    name: "Devon Carter",
    phone: "(212) 555-3098",
    email: "dcarter@marshmma.com",
    access: "All Products",
    roles: ["GL CSR", "PL CSR"],
    highlight: true,
  },
  {
    name: "Sandra Rios",
    phone: "(212) 555-4471",
    email: "srios@marshmma.com",
    access: "GL · PL",
    roles: ["All LOB Claims Broker Contact"],
    highlight: false,
  },
];

function BrokerageView() {
  return (
    <div className="space-y-4">
      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5"
        style={{ background: "white", border: `1px solid ${BD}`, borderRadius: 8, overflow: "hidden" }}>
        <StatCell label="Account Record Type" value="Agency · Brokerage" />
        <StatCell label="Account ID"          value="10591" />
        <StatCell label="Physical City"       value="New York" />
        <StatCell label="Physical State"      value="NY" />
        <StatCell label="Parent Account"      value="Marsh & McLennan Companies" last />
      </div>

      {/* Account Information */}
      <Section title="Account Information" icon={<Building2 size={13}/>}>
        <TwoColGrid>
          <div>
            <Row label="Account Name"           value="Marsh McLennan Agency" />
            <Row label="Preferred Account Name" value="Marsh McLennan" />
            <Row label="Parent Account"         value="Marsh & McLennan Companies" />
            <Row label="Account Record Type"    value="Agency · Brokerage" />
            <Row label="Account Sub-Type"       value="Brokerage" />
          </div>
          <div>
            <Row label="Account ID"      value="10591" />
            <Row label="Account Status"  value="Active" valueColor="#2E7D32" />
            <Row label="Phone"           value="(203) 555-1100" />
            <Row label="Fax"             value="(203) 555-1109" />
          </div>
        </TwoColGrid>
      </Section>

      {/* Address Information */}
      <Section title="Address Information" icon={<MapPin size={13}/>}>
        <TwoColGrid>
          <div>
            <Row label="Physical Address 1"       value="1166 Ave of the Americas" />
            <Row label="Physical Address 2"       value="Floor 4" />
            <Row label="Physical City"            value="New York" />
            <Row label="Physical State/Province"  value="NY" />
            <Row label="Physical Zip/Postal Code" value="10036-2708" />
            <Row label="Physical County"          value="—" />
            <Row label="Physical Country"         value="United States" />
          </div>
          <div>
            <Row label="Copy from Physical"       value="—" />
            <Row label="Mailing Address 1"        value="1166 Ave of the Americas" />
            <Row label="Mailing Address 2"        value="Floor 4" />
            <Row label="Mailing City"             value="New York" />
            <Row label="Mailing State/Province"   value="NY" />
            <Row label="Mailing Zip/Postal Code"  value="10036-2708" />
            <Row label="Mailing Country"          value="United States" />
          </div>
        </TwoColGrid>
      </Section>

      {/* Broker Roles */}
      <Section title="Broker Roles" badge="4 contacts">
        <div className="overflow-x-auto">
          {/* Table header */}
          <div className="grid mt-2 mb-1"
            style={{ gridTemplateColumns: "1.2fr 1fr 1.5fr 0.9fr 2fr" }}>
            {["Contact", "Phone", "Email", "Product Access", "Broker Role"].map(h => (
              <span key={h} style={{
                fontSize: "0.62rem", fontWeight: 700, color: TT,
                textTransform: "uppercase", letterSpacing: "0.08em",
                paddingBottom: 6, borderBottom: `2px solid ${BD}`,
              }}>{h}</span>
            ))}
          </div>

          {/* Rows */}
          {BROKER_CONTACTS.map((c, i) => (
            <div key={i} className="grid py-2.5"
              style={{
                gridTemplateColumns: "1.2fr 1fr 1.5fr 0.9fr 2fr",
                borderBottom: `1px solid ${BDL}`,
                background: i % 2 === 1 ? TH : "white",
              }}>
              {/* Contact name */}
              <span style={{ fontSize: "0.80rem", fontWeight: 600, color: N }}>{c.name}</span>
              {/* Phone */}
              <span style={{ fontSize: "0.78rem", color: TD }}>{c.phone}</span>
              {/* Email */}
              <span style={{ fontSize: "0.78rem", color: N }}>{c.email}</span>
              {/* Product Access */}
              <span style={{ fontSize: "0.78rem", color: TD }}>{c.access}</span>
              {/* Broker Roles */}
              <div className="flex flex-wrap gap-1">
                {c.roles.map((r, ri) => (
                  <span key={ri} style={{
                    fontSize: "0.70rem",
                    color: c.highlight ? N : TM,
                    fontWeight: c.highlight ? 600 : 400,
                  }}>
                    {r}{ri < c.roles.length - 1 ? ";" : ""}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN EXPORT
═══════════════════════════════════════════════════════════════════════════ */
export function MemberBrokerTab() {
  const [activeView, setActiveView] = useState<"member" | "brokerage">("member");

  return (
    <div className="space-y-4" style={{ fontFamily: font }}>

      {/* ── TOP SUMMARY TOGGLE CARDS ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Member card */}
        <button
          onClick={() => setActiveView("member")}
          className="flex items-center justify-between px-5 py-4 w-full text-left transition-all"
          style={{
            background: "white",
            border: `1px solid ${activeView === "member" ? N : BD}`,
            outline: "none",
            boxShadow: activeView === "member" ? `0 0 0 2px ${N}22` : "none",
            borderRadius: 6,
          }}>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center shrink-0"
              style={{ width: 38, height: 38, background: "#E8EFF9", border: `1px solid #B8CCE8`, borderRadius: 6 }}>
              <Building2 size={18} color={N} />
            </div>
            <div>
              <p style={{ fontSize: "0.58rem", fontWeight: 700, color: TT,
                textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 2 }}>Member</p>
              <p style={{ fontSize: "0.95rem", fontWeight: 800, color: TD, lineHeight: 1.2 }}>
                Brookfield Day School
              </p>
              <p style={{ fontSize: "0.72rem", color: TM, marginTop: 2 }}>
                473 · Westport, CT · Active member
              </p>
            </div>
          </div>
          {activeView === "member" && <CheckCircle2 size={18} color={N} />}
        </button>

        {/* Brokerage card */}
        <button
          onClick={() => setActiveView("brokerage")}
          className="flex items-center justify-between px-5 py-4 w-full text-left transition-all"
          style={{
            background: "white",
            border: `1px solid ${activeView === "brokerage" ? N : BD}`,
            outline: "none",
            boxShadow: activeView === "brokerage" ? `0 0 0 2px ${N}22` : "none",
            borderRadius: 6,
          }}>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center shrink-0"
              style={{ width: 38, height: 38, background: "#FBF6E8", border: `1px solid #E5D08A`, borderRadius: 6 }}>
              <MapPin size={18} color={G} />
            </div>
            <div>
              <p style={{ fontSize: "0.58rem", fontWeight: 700, color: TT,
                textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 2 }}>Brokerage</p>
              <p style={{ fontSize: "0.95rem", fontWeight: 800, color: TD, lineHeight: 1.2 }}>
                Marsh McLennan Agency
              </p>
              <p style={{ fontSize: "0.72rem", color: TM, marginTop: 2 }}>
                ID 10591 · New York, NY · T. Owens producer
              </p>
            </div>
          </div>
          {activeView === "brokerage" && <CheckCircle2 size={18} color={N} />}
        </button>
      </div>

      {/* ── ACTIVE VIEW CONTENT ───────────────────────────────────────────── */}
      {activeView === "member" ? <MemberView /> : <BrokerageView />}

    </div>
  );
}
