import { TrendingDown } from "lucide-react";

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

// ─── Field row ────────────────────────────────────────────────────────────────
function FieldRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2"
      style={{ borderBottom: `1px solid ${BDL}` }}>
      <span style={{ fontSize: "0.76rem", color: TT, whiteSpace: "nowrap", paddingTop: 1 }}>
        {label}
      </span>
      <div style={{ fontSize: "0.80rem", fontWeight: 600, color: TD, textAlign: "right" }}>
        {value}
      </div>
    </div>
  );
}

// ─── Section block ────────────────────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="p-5" style={{ fontFamily: font }}>
      <div className="mb-3">
        <span style={{
          fontSize: "0.60rem", fontWeight: 800, color: TT,
          textTransform: "uppercase", letterSpacing: "0.12em",
        }}>
          {title}
        </span>
      </div>
      <div>{children}</div>
    </div>
  );
}

// ─── Badge helpers ────────────────────────────────────────────────────────────
function DotBadge({ label, dotColor, bg, text, border }: {
  label: string; dotColor: string; bg: string; text: string; border: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5"
      style={{ background: bg, border: `1px solid ${border}`, fontSize: "0.72rem", fontWeight: 700, color: text }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: dotColor, flexShrink: 0 }} />
      {label}
    </span>
  );
}

function GreenVal({ children }: { children: React.ReactNode }) {
  return <span style={{ color: "#1A7A4A", fontWeight: 600, fontSize: "0.80rem" }}>{children}</span>;
}
function RedVal({ children }: { children: React.ReactNode }) {
  return <span style={{ color: "#B91C1C", fontWeight: 600, fontSize: "0.80rem" }}>{children}</span>;
}
function AmberVal({ children }: { children: React.ReactNode }) {
  return <span style={{ color: "#B45309", fontWeight: 600, fontSize: "0.80rem" }}>{children}</span>;
}

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

      {/* ── MAIN SUBMISSION DETAILS CARD ───────────────────────────────────── */}
      <div style={{ background: "white", border: `1px solid ${BD}`, borderTop: `3px solid ${N}` }}>

        {/* Card header */}
        <div className="flex items-center gap-2 px-5 py-3.5"
          style={{ borderBottom: `1px solid ${BD}`, background: TH }}>
          <h2 style={{ fontSize: "0.95rem", fontWeight: 700, color: TD }}>Submission details</h2>
          <span style={{ fontSize: "0.88rem", color: TT, fontWeight: 400 }}>· SUB-10428</span>
        </div>

        {/* 3-column grid — Row 1 */}
        <div className="grid grid-cols-3" style={{ borderBottom: `1px solid ${BD}` }}>

          {/* IDENTIFICATION */}
          <div style={{ borderRight: `1px solid ${BDL}` }}>
            <Section title="Identification">
              <FieldRow label="Submission ID"    value={<span style={{ color: N, fontWeight: 700 }}>SUB-10428</span>} />
              <FieldRow label="Submission type"  value="Renewal" />
              <FieldRow label="Line of business" value="GL · PL · ML" />
              <FieldRow label="Products"         value={<span style={{ fontWeight: 700 }}>Educators Legal Liability</span>} />
              <FieldRow label="Priority"
                value={
                  <DotBadge
                    label="High"
                    dotColor="#D97706"
                    bg="#FEF3C7"
                    text="#92400E"
                    border="#FCD34D"
                  />
                }
              />
            </Section>
          </div>

          {/* DATES & SLA */}
          <div style={{ borderRight: `1px solid ${BDL}` }}>
            <Section title="Dates & SLA">
              <FieldRow label="Submitted"       value="Apr 14, 2026" />
              <FieldRow label="Effective"       value="Jun 1, 2026" />
              <FieldRow label="Expiration"      value="Jun 1, 2027" />
              <FieldRow label="Need-by"         value={<RedVal>Apr 28, 2026</RedVal>} />
              <FieldRow label="Decision target" value="Apr 26, 2026" />
            </Section>
          </div>

          {/* ROUTING & ASSIGNMENT */}
          <div>
            <Section title="Routing & Assignment">
              <FieldRow label="Stage"
                value={
                  <DotBadge
                    label="Needs review"
                    dotColor="#D97706"
                    bg="#FEF3C7"
                    text="#92400E"
                    border="#FCD34D"
                  />
                }
              />
              <FieldRow label="Underwriter"    value="Maya Khanna" />
              <FieldRow label="Assistant UW"   value="Devon Carter" />
              <FieldRow label="Claims analyst" value="Anika Shah" />
              <FieldRow label="Days in queue"  value="11 days" />
            </Section>
          </div>
        </div>

        {/* 3-column grid — Row 2 */}
        <div className="grid grid-cols-3" style={{ borderBottom: `1px solid ${BD}` }}>

          {/* PREMIUM */}
          <div style={{ borderRight: `1px solid ${BDL}` }}>
            <Section title="Premium">
              <FieldRow label="Expiring premium"  value="$132,400" />
              <FieldRow label="Quoted premium"    value="$142,800" />
              <FieldRow label="Bound premium"     value={<span style={{ color: TT }}>—</span>} />
              <FieldRow label="Indicated change"  value={<GreenVal>+7.8%</GreenVal>} />
              <FieldRow label="Commission rate"   value="12%" />
            </Section>
          </div>

          {/* DECISION & AUTHORITY */}
          <div style={{ borderRight: `1px solid ${BDL}` }}>
            <Section title="Decision & Authority">
              <FieldRow label="Referrals open"
                value={
                  <span>
                    1{" "}
                    <span style={{ fontSize: "0.72rem", color: TT, fontWeight: 400 }}>(manager notify)</span>
                  </span>
                }
              />
              <FieldRow label="Approvals needed"  value="1 of 4" />
              <FieldRow label="Risk score"
                value={
                  <span>
                    82{" "}
                    <span style={{ fontSize: "0.72rem", color: "#1A7A4A", fontWeight: 600 }}>· In appetite</span>
                  </span>
                }
              />
              <FieldRow label="Loss propensity"  value={<AmberVal>Medium</AmberVal>} />
              <FieldRow label="SLA status"        value={<AmberVal>7 days · at risk</AmberVal>} />
            </Section>
          </div>

          {/* COMPLIANCE & DOCUMENTS */}
          <div>
            <Section title="Compliance & Documents">
              <FieldRow label="Application"
                value={
                  <span>
                    <GreenVal>On file</GreenVal>
                    <span style={{ fontSize: "0.72rem", color: TT, fontWeight: 400 }}> · Apr 14</span>
                  </span>
                }
              />
              <FieldRow label="Loss runs"
                value={
                  <span>
                    <GreenVal>5-yr</GreenVal>
                    <span style={{ fontSize: "0.72rem", color: TT, fontWeight: 400 }}> · validated</span>
                  </span>
                }
              />
              <FieldRow label="Financials (FY24)"    value={<GreenVal>On file</GreenVal>} />
              <FieldRow label="Cyber supplemental"   value={<RedVal>Missing</RedVal>} />
              <FieldRow label="OFAC screening"
                value={
                  <span>
                    <GreenVal>Cleared</GreenVal>
                    <span style={{ fontSize: "0.72rem", color: TT, fontWeight: 400 }}> · Apr 14</span>
                  </span>
                }
              />
            </Section>
          </div>
        </div>

        {/* 3-column grid — Row 3 */}
        <div className="grid grid-cols-3">

          {/* MEMBER */}
          <div style={{ borderRight: `1px solid ${BDL}` }}>
            <Section title="Member">
              <FieldRow label="Account"       value={<span style={{ fontWeight: 700 }}>Brookfield Day School</span>} />
              <FieldRow label="Member number" value="473" />
              <FieldRow label="Segment"       value="K-12 · Private · Day" />
              <FieldRow label="Enrollment"    value="842 students" />
              <FieldRow label="Member since"  value="Aug 15, 2019" />
            </Section>
          </div>

          {/* BROKER */}
          <div style={{ borderRight: `1px solid ${BDL}` }}>
            <Section title="Broker">
              <FieldRow label="Brokerage"
                value={<span style={{ fontWeight: 700 }}>Marsh McLennan Agency</span>}
              />
              <FieldRow label="Office"
                value={
                  <span>
                    Stamford, CT
                    <span style={{ fontSize: "0.72rem", color: TT, fontWeight: 400 }}> · ID 10591</span>
                  </span>
                }
              />
              <FieldRow label="Producer code"  value="MMA-NE-0427" />
              <FieldRow label="Appointment"
                value={
                  <span>
                    <GreenVal>Active</GreenVal>
                    <span style={{ fontSize: "0.72rem", color: TT, fontWeight: 400 }}> · Resident CT</span>
                  </span>
                }
              />
              <FieldRow label="YTD bound w/ UE"
                value={
                  <span>
                    $4.2M
                    <span style={{ fontSize: "0.72rem", color: TT, fontWeight: 400 }}> · 87% hit ratio</span>
                  </span>
                }
              />
            </Section>
          </div>

          {/* BROKER CONTACT */}
          <div>
            <Section title="Broker Contact">
              <FieldRow label="Producer"   value="Tessa Owens" />
              <FieldRow label="Role"       value="Producer of record" />
              <FieldRow label="Permission" value="Full access · Bind" />
              <FieldRow label="Email"
                value={
                  <a href="mailto:t.owens@mma.com"
                    style={{ color: N, textDecoration: "none", fontWeight: 600, fontSize: "0.80rem" }}>
                    t.owens@mma.com
                  </a>
                }
              />
              <FieldRow label="Phone"
                value={
                  <a href="tel:2035551142"
                    style={{ color: TD, textDecoration: "none", fontWeight: 600, fontSize: "0.80rem" }}>
                    (203) 555-1142
                  </a>
                }
              />
            </Section>
          </div>
        </div>
      </div>

      {/* ── SECONDARY PANELS: Coverage + Loss ──────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-5" style={{ alignItems: "flex-start" }}>

        {/* Coverage Summary */}
        <div className="md:col-span-3"
          style={{ background: "white", border: `1px solid ${BD}`, borderTop: `3px solid ${N}` }}>
          <div className="px-5 py-3.5" style={{ borderBottom: `1px solid ${BDL}`, background: TH }}>
            <h3 style={{ fontSize: "0.78rem", fontWeight: 700, color: "#1A2530", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Coverage Summary
            </h3>
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
          <div style={{ background: "white", border: `1px solid ${BD}`, borderTop: `3px solid ${G}`, flex: 1 }}>
            <div className="px-5 py-3.5" style={{ borderBottom: `1px solid ${BDL}`, background: TH }}>
              <h3 style={{ fontSize: "0.78rem", fontWeight: 700, color: "#1A2530", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Loss Experience
              </h3>
              <p style={{ fontSize: "0.70rem", color: TT, marginTop: 2 }}>5-year summary</p>
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