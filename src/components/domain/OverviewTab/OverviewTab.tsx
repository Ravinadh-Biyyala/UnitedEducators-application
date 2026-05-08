import { TrendingDown } from 'lucide-react';
import { colors, fonts, priorityStyles } from '@/theme/tokens';

const LOSS_HISTORY = [
  { year: '2019', claims: 2, incurred: '$18,400', ratio: '22%', up: false },
  { year: '2020', claims: 1, incurred: '$9,100',  ratio: '11%', up: false },
  { year: '2021', claims: 3, incurred: '$24,700', ratio: '30%', up: true  },
  { year: '2022', claims: 2, incurred: '$16,500', ratio: '20%', up: false },
  { year: '2023', claims: 1, incurred: '$18,500', ratio: '22%', up: true  },
];

const COVERAGES = [
  { name: 'General Liability',         limit: '$5,000,000',  aggregateLimit: '$15,000,000', retention: '$100,000', premium: '$28,400' },
  { name: 'Property – Buildings',      limit: '$42,000,000', aggregateLimit: '$42,000,000', retention: '$250,000', premium: '$51,200' },
  { name: 'Student Accident',          limit: '$500,000',    aggregateLimit: '$2,000,000',  retention: '$50,000',  premium: '$12,800' },
  { name: 'Educators Legal Liability', limit: '$3,000,000',  aggregateLimit: '$9,000,000',  retention: '$100,000', premium: '$19,600' },
];

function FieldRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div
      className="flex items-start justify-between gap-3 py-2"
      style={{ borderBottom: `1px solid ${colors.borderDefault}` }}
    >
      <span style={{ fontSize: '0.76rem', color: colors.textMuted, whiteSpace: 'nowrap', paddingTop: 1 }}>
        {label}
      </span>
      <div style={{ fontSize: '0.80rem', fontWeight: 600, color: colors.textHeading, textAlign: 'right' }}>
        {value}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="p-5" style={{ fontFamily: fonts.sans }}>
      <div className="mb-3">
        <span
          style={{
            fontSize:      '0.60rem',
            fontWeight:    800,
            color:         colors.textMuted,
            textTransform: 'uppercase' as const,
            letterSpacing: '0.12em',
          }}
        >
          {title}
        </span>
      </div>
      <div>{children}</div>
    </div>
  );
}

function DotBadge({ label, dotColor, bg, text, border }: {
  label: string; dotColor: string; bg: string; text: string; border: string;
}) {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-0.5"
      style={{ background: bg, border: `1px solid ${border}`, fontSize: '0.72rem', fontWeight: 700, color: text }}
    >
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: dotColor, flexShrink: 0 }} />
      {label}
    </span>
  );
}

function GreenVal({ children }: { children: React.ReactNode }) {
  return <span style={{ color: colors.greenAssigned, fontWeight: 600, fontSize: '0.80rem' }}>{children}</span>;
}
function RedVal({ children }: { children: React.ReactNode }) {
  return <span style={{ color: colors.dangerRed, fontWeight: 600, fontSize: '0.80rem' }}>{children}</span>;
}
function AmberVal({ children }: { children: React.ReactNode }) {
  return <span style={{ color: colors.amber700, fontWeight: 600, fontSize: '0.80rem' }}>{children}</span>;
}

export function OverviewTab() {
  return (
    <div className="space-y-5" style={{ fontFamily: fonts.sans }}>

      {/* ── Main submission details card ──────────────────────────────────── */}
      <div style={{
        background: colors.white,
        border:     `1px solid ${colors.borderStrong}`,
        borderTop:  `3px solid ${colors.brandBlue}`,
      }}>

        {/* Card header */}
        <div
          className="flex items-center gap-2 px-5 py-3.5"
          style={{ borderBottom: `1px solid ${colors.borderStrong}`, background: colors.slate100 }}
        >
          <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: colors.textHeading }}>Submission details</h2>
          <span style={{ fontSize: '0.88rem', color: colors.textMuted, fontWeight: 400 }}>· SUB-10428</span>
        </div>

        {/* Row 1 — Identification / Dates & SLA / Routing & Assignment */}
        <div className="grid grid-cols-3" style={{ borderBottom: `1px solid ${colors.borderStrong}` }}>
          <div style={{ borderRight: `1px solid ${colors.borderDefault}` }}>
            <Section title="Identification">
              <FieldRow label="Submission ID"    value={<span style={{ color: colors.brandBlue, fontWeight: 700 }}>SUB-10428</span>} />
              <FieldRow label="Submission type"  value="Renewal" />
              <FieldRow label="Line of business" value="GL · PL · ML" />
              <FieldRow label="Products"         value={<span style={{ fontWeight: 700 }}>Educators Legal Liability</span>} />
              <FieldRow label="Priority"
                value={
                  <DotBadge
                    label="High"
                    dotColor={priorityStyles.High.border}
                    bg={priorityStyles.High.bg}
                    text={priorityStyles.High.text}
                    border={priorityStyles.High.border}
                  />
                }
              />
            </Section>
          </div>

          <div style={{ borderRight: `1px solid ${colors.borderDefault}` }}>
            <Section title="Dates & SLA">
              <FieldRow label="Submitted"       value="Apr 14, 2026" />
              <FieldRow label="Effective"       value="Jun 1, 2026" />
              <FieldRow label="Expiration"      value="Jun 1, 2027" />
              <FieldRow label="Need-by"         value={<RedVal>Apr 28, 2026</RedVal>} />
              <FieldRow label="Decision target" value="Apr 26, 2026" />
            </Section>
          </div>

          <div>
            <Section title="Routing & Assignment">
              <FieldRow label="Stage"
                value={
                  <DotBadge
                    label="Needs review"
                    dotColor={priorityStyles.Medium.border}
                    bg={priorityStyles.Medium.bg}
                    text={priorityStyles.Medium.text}
                    border={priorityStyles.Medium.border}
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

        {/* Row 2 — Premium / Decision & Authority / Compliance & Documents */}
        <div className="grid grid-cols-3" style={{ borderBottom: `1px solid ${colors.borderStrong}` }}>
          <div style={{ borderRight: `1px solid ${colors.borderDefault}` }}>
            <Section title="Premium">
              <FieldRow label="Expiring premium"  value="$132,400" />
              <FieldRow label="Quoted premium"    value="$142,800" />
              <FieldRow label="Bound premium"     value={<span style={{ color: colors.textMuted }}>—</span>} />
              <FieldRow label="Indicated change"  value={<GreenVal>+7.8%</GreenVal>} />
              <FieldRow label="Commission rate"   value="12%" />
            </Section>
          </div>

          <div style={{ borderRight: `1px solid ${colors.borderDefault}` }}>
            <Section title="Decision & Authority">
              <FieldRow label="Referrals open"
                value={
                  <span>
                    1{' '}
                    <span style={{ fontSize: '0.72rem', color: colors.textMuted, fontWeight: 400 }}>(manager notify)</span>
                  </span>
                }
              />
              <FieldRow label="Approvals needed" value="1 of 4" />
              <FieldRow label="Risk score"
                value={
                  <span>
                    82{' '}
                    <span style={{ fontSize: '0.72rem', color: colors.greenAssigned, fontWeight: 600 }}>· In appetite</span>
                  </span>
                }
              />
              <FieldRow label="Loss propensity" value={<AmberVal>Medium</AmberVal>} />
              <FieldRow label="SLA status"      value={<AmberVal>7 days · at risk</AmberVal>} />
            </Section>
          </div>

          <div>
            <Section title="Compliance & Documents">
              <FieldRow label="Application"
                value={
                  <span>
                    <GreenVal>On file</GreenVal>
                    <span style={{ fontSize: '0.72rem', color: colors.textMuted, fontWeight: 400 }}> · Apr 14</span>
                  </span>
                }
              />
              <FieldRow label="Loss runs"
                value={
                  <span>
                    <GreenVal>5-yr</GreenVal>
                    <span style={{ fontSize: '0.72rem', color: colors.textMuted, fontWeight: 400 }}> · validated</span>
                  </span>
                }
              />
              <FieldRow label="Financials (FY24)"  value={<GreenVal>On file</GreenVal>} />
              <FieldRow label="Cyber supplemental" value={<RedVal>Missing</RedVal>} />
              <FieldRow label="OFAC screening"
                value={
                  <span>
                    <GreenVal>Cleared</GreenVal>
                    <span style={{ fontSize: '0.72rem', color: colors.textMuted, fontWeight: 400 }}> · Apr 14</span>
                  </span>
                }
              />
            </Section>
          </div>
        </div>

        {/* Row 3 — Member / Broker / Broker Contact */}
        <div className="grid grid-cols-3">
          <div style={{ borderRight: `1px solid ${colors.borderDefault}` }}>
            <Section title="Member">
              <FieldRow label="Account"       value={<span style={{ fontWeight: 700 }}>Brookfield Day School</span>} />
              <FieldRow label="Member number" value="473" />
              <FieldRow label="Segment"       value="K-12 · Private · Day" />
              <FieldRow label="Enrollment"    value="842 students" />
              <FieldRow label="Member since"  value="Aug 15, 2019" />
            </Section>
          </div>

          <div style={{ borderRight: `1px solid ${colors.borderDefault}` }}>
            <Section title="Broker">
              <FieldRow label="Brokerage"
                value={<span style={{ fontWeight: 700 }}>Marsh McLennan Agency</span>}
              />
              <FieldRow label="Office"
                value={
                  <span>
                    Stamford, CT
                    <span style={{ fontSize: '0.72rem', color: colors.textMuted, fontWeight: 400 }}> · ID 10591</span>
                  </span>
                }
              />
              <FieldRow label="Producer code" value="MMA-NE-0427" />
              <FieldRow label="Appointment"
                value={
                  <span>
                    <GreenVal>Active</GreenVal>
                    <span style={{ fontSize: '0.72rem', color: colors.textMuted, fontWeight: 400 }}> · Resident CT</span>
                  </span>
                }
              />
              <FieldRow label="YTD bound w/ UE"
                value={
                  <span>
                    $4.2M
                    <span style={{ fontSize: '0.72rem', color: colors.textMuted, fontWeight: 400 }}> · 87% hit ratio</span>
                  </span>
                }
              />
            </Section>
          </div>

          <div>
            <Section title="Broker Contact">
              <FieldRow label="Producer"   value="Tessa Owens" />
              <FieldRow label="Role"       value="Producer of record" />
              <FieldRow label="Permission" value="Full access · Bind" />
              <FieldRow label="Email"
                value={
                  <a
                    href="mailto:t.owens@mma.com"
                    style={{ color: colors.brandBlue, textDecoration: 'none', fontWeight: 600, fontSize: '0.80rem' }}
                  >
                    t.owens@mma.com
                  </a>
                }
              />
              <FieldRow label="Phone"
                value={
                  <a
                    href="tel:2035551142"
                    style={{ color: colors.textHeading, textDecoration: 'none', fontWeight: 600, fontSize: '0.80rem' }}
                  >
                    (203) 555-1142
                  </a>
                }
              />
            </Section>
          </div>
        </div>
      </div>

      {/* ── Secondary panels: Coverage Summary + Loss Experience ─────────── */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-5" style={{ alignItems: 'flex-start' }}>

        {/* Coverage Summary — col-span-3 */}
        <div
          className="md:col-span-3"
          style={{ background: colors.white, border: `1px solid ${colors.borderStrong}`, borderTop: `3px solid ${colors.brandBlue}` }}
        >
          <div className="px-5 py-3.5" style={{ borderBottom: `1px solid ${colors.borderDefault}`, background: colors.slate100 }}>
            <h3 style={{
              fontSize:      '0.78rem',
              fontWeight:    700,
              color:         colors.textHeading,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}>
              Coverage Summary
            </h3>
          </div>
          <table className="w-full" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: colors.slate100 }}>
                {['Product', 'Limit', 'Aggregate Limit', 'Retention', 'Premium'].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3 text-left"
                    style={{
                      fontSize:      '0.62rem',
                      fontWeight:    700,
                      color:         colors.textMuted,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      borderBottom:  `1px solid ${colors.borderDefault}`,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COVERAGES.map((c, i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${colors.borderDefault}` }}>
                  <td className="px-5 py-3" style={{ fontSize: '0.84rem', color: colors.textHeading, fontWeight: 500 }}>{c.name}</td>
                  <td className="px-5 py-3" style={{ fontSize: '0.84rem', color: colors.textBody }}>{c.limit}</td>
                  <td className="px-5 py-3" style={{ fontSize: '0.84rem', color: colors.textBody }}>{c.aggregateLimit}</td>
                  <td className="px-5 py-3" style={{ fontSize: '0.84rem', color: colors.textBody }}>{c.retention}</td>
                  <td className="px-5 py-3" style={{ fontSize: '0.84rem', color: colors.brandBlue, fontWeight: 700 }}>{c.premium}</td>
                </tr>
              ))}
              <tr style={{ borderTop: `2px solid ${colors.borderStrong}`, background: colors.slate100 }}>
                <td className="px-5 py-3" colSpan={4} style={{ fontSize: '0.84rem', fontWeight: 700, color: colors.textHeading }}>
                  Total Estimated Premium
                </td>
                <td className="px-5 py-3" style={{ fontSize: '0.95rem', fontWeight: 800, color: colors.brandBlue }}>$112,000</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Loss Experience — col-span-2 */}
        <div
          className="md:col-span-2"
          style={{ background: colors.white, border: `1px solid ${colors.borderStrong}`, borderTop: `3px solid ${colors.accentGold}` }}
        >
          <div className="px-5 py-3.5" style={{ borderBottom: `1px solid ${colors.borderDefault}`, background: colors.slate100 }}>
            <h3 style={{
              fontSize:      '0.78rem',
              fontWeight:    700,
              color:         colors.textHeading,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}>
              Loss Experience
            </h3>
            <p style={{ fontSize: '0.70rem', color: colors.textMuted, marginTop: 2 }}>5-year summary</p>
          </div>
          <div className="px-5 pt-4 pb-2">
            <div className="grid grid-cols-4 pb-2.5" style={{ borderBottom: `1px solid ${colors.borderDefault}` }}>
              {['Year', 'Claims', 'Incurred', 'Ratio'].map((h) => (
                <span
                  key={h}
                  style={{
                    fontSize:      '0.60rem',
                    fontWeight:    700,
                    color:         colors.textMuted,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}
                >
                  {h}
                </span>
              ))}
            </div>
            {LOSS_HISTORY.map((row, i) => (
              <div
                key={i}
                className="grid grid-cols-4 py-2.5 items-center"
                style={{ borderBottom: `1px solid ${colors.borderDefault}` }}
              >
                <span style={{ fontSize: '0.80rem', color: colors.textHeading, fontWeight: 600 }}>{row.year}</span>
                <span style={{ fontSize: '0.80rem', color: colors.textBody }}>{row.claims}</span>
                <span style={{ fontSize: '0.80rem', color: colors.textBody }}>{row.incurred}</span>
                <span style={{ fontSize: '0.76rem', fontWeight: 700, color: row.up ? colors.dangerRed : colors.successGreen }}>
                  {row.ratio}
                </span>
              </div>
            ))}
          </div>
          <div
            className="mx-4 mb-4 mt-2 px-4 py-3 flex items-center justify-between"
            style={{ background: colors.successGreenBg, border: `1px solid ${colors.successGreenBorder}` }}
          >
            <div className="flex items-center gap-2">
              <TrendingDown size={14} color={colors.successGreen} />
              <span style={{ fontSize: '0.76rem', color: colors.successGreenText, fontWeight: 600 }}>5-Year Avg. Loss Ratio</span>
            </div>
            <span style={{ fontSize: '0.92rem', fontWeight: 800, color: colors.successGreenText }}>21.0%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
