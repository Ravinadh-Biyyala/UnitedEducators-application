import { Building2, CheckCircle2, MapPin } from 'lucide-react';
import { colors, fonts } from '@/theme/tokens';
import type { MemberDetail, BrokerageDetail, BrokerContact } from '@/shared/types';

export interface MemberBrokerTabProps {
  member:       MemberDetail;
  brokerage:    BrokerageDetail;
  contacts:     BrokerContact[];
  activeView:   'member' | 'brokerage';
  onViewChange: (v: 'member' | 'brokerage') => void;
}

// ── Shared helpers ─────────────────────────────────────────────────────────

function Row({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <div className="flex items-start py-2" style={{ borderBottom: `1px solid ${colors.borderDefault}` }}>
      <span style={{ flex: '0 0 44%', fontSize: '0.775rem', color: colors.textMuted, paddingRight: 8 }}>
        {label}
      </span>
      <span style={{ flex: 1, fontSize: '0.775rem', fontWeight: 500, color: valueColor ?? colors.textHeading }}>
        {value || '—'}
      </span>
    </div>
  );
}

function InfoSection({ title, accent = colors.brandBlue, badge, children }: {
  title: string; accent?: string; badge?: string; children: React.ReactNode;
}) {
  return (
    <div style={{ background: colors.white, border: `1px solid ${colors.borderStrong}`, borderTop: `3px solid ${accent}` }}>
      <div className="flex items-center justify-between px-5 py-3"
        style={{ borderBottom: `1px solid ${colors.borderDefault}`, background: colors.slate100 }}>
        <h3 style={{
          fontSize: '0.80rem', fontWeight: 700,
          color: accent === colors.brandBlue ? colors.brandBlue : colors.textBody,
          textTransform: 'uppercase', letterSpacing: '0.06em',
        }}>
          {title}
        </h3>
        {badge && (
          <span style={{ fontSize: '0.70rem', color: colors.textBody, fontWeight: 500 }}>{badge}</span>
        )}
      </div>
      <div className="px-5 pt-1 pb-3">{children}</div>
    </div>
  );
}

function TwoCol({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10">{children}</div>;
}

function StatCell({ label, value, dot, last }: {
  label: string; value: string; dot?: boolean; last?: boolean;
}) {
  return (
    <div className="px-5 py-3 flex flex-col gap-0.5"
      style={{ borderRight: last ? undefined : `1px solid ${colors.borderDefault}` }}>
      <span style={{ fontSize: '0.60rem', fontWeight: 700, color: colors.textMuted,
        textTransform: 'uppercase', letterSpacing: '0.09em' }}>
        {label}
      </span>
      <span className="flex items-center gap-1.5"
        style={{ fontSize: '0.85rem', fontWeight: 700, color: colors.textHeading }}>
        {dot && (
          <span style={{ width: 7, height: 7, borderRadius: '50%',
            background: colors.successGreen, display: 'inline-block', flexShrink: 0 }} />
        )}
        {value}
      </span>
    </div>
  );
}

// ── Member view ────────────────────────────────────────────────────────────

function MemberView({ member }: { member: MemberDetail }) {
  const { quickStats: qs, accountInfo: ai, institutionProfile: ip, addressInfo: addr } = member;
  return (
    <div className="space-y-4">
      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5"
        style={{ background: colors.white, border: `1px solid ${colors.borderStrong}` }}>
        <StatCell label="Account Record Type" value={qs.accountRecordType} />
        <StatCell label="Member Number"       value={qs.memberNumber} />
        <StatCell label="Physical City"       value={qs.physicalCity} />
        <StatCell label="Status"              value={qs.status} dot />
        <StatCell label="Member Since"        value={qs.memberSince} last />
      </div>

      {/* Account Information */}
      <InfoSection title="Account Information">
        <TwoCol>
          <div>
            <Row label="Account Name"           value={ai.accountName} />
            <Row label="DEC Page Name"          value={ai.decPageName} />
            <Row label="Preferred Account Name" value={ai.preferredAccountName} />
            <Row label="Member Number"          value={ai.memberNumber} />
            <Row label="Parent Account"         value={ai.parentAccount} />
            <Row label="Group"                  value={ai.group} />
            <Row label="Group Number"           value={ai.groupNumber} />
          </div>
          <div>
            <Row label="Account Record Type" value={ai.accountRecordType} />
            <Row label="Account Sub-Type"    value={ai.accountSubType} />
            <Row label="Member Status"       value={ai.memberStatus} />
            <Row label="Account Status"      value={ai.accountStatus} valueColor={colors.successGreen} />
          </div>
        </TwoCol>
      </InfoSection>

      {/* Institution Profile */}
      <InfoSection title="Institution Profile">
        <TwoCol>
          <div>
            <Row label="Institution Type"         value={ip.institutionType} />
            <Row label="Sub-Category"             value={ip.subCategory} />
            <Row label="Boarding Options"         value={ip.boardingOptions} />
            <Row label="Underwriting Track"       value={ip.underwritingTrack} />
            <Row label="Intercollegiate Football" value={ip.intercollegiateFootball} />
          </div>
          <div>
            <Row label="Education Segment" value={ip.educationSegment} />
            <Row label="Total Enrollment"  value={ip.totalEnrollment} />
            <Row label="Renewal Type"      value={ip.renewalType} />
            <Row label="Budget"            value={ip.budget} />
            <Row label="Territory"         value={ip.territory} />
          </div>
        </TwoCol>
      </InfoSection>

      {/* Address Information */}
      <InfoSection title="Address Information">
        <TwoCol>
          <div>
            <Row label="Physical Address 1"       value={addr.physical.address1} />
            <Row label="Physical Address 2"       value={addr.physical.address2} />
            <Row label="Physical City"            value={addr.physical.city} />
            <Row label="Physical State/Province"  value={addr.physical.state} />
            <Row label="Physical Zip/Postal Code" value={addr.physical.zip} />
            <Row label="Physical County"          value={addr.physical.county} />
            <Row label="Physical Country"         value={addr.physical.country} />
          </div>
          <div>
            <Row label="Copy from Physical"
              value={addr.copyFromPhysical ? '✓' : '—'}
              valueColor={addr.copyFromPhysical ? colors.brandBlue : undefined}
            />
            <Row label="Mailing Address 1"        value={addr.mailing.address1} />
            <Row label="Mailing Address 2"        value={addr.mailing.address2} />
            <Row label="Mailing City"             value={addr.mailing.city} />
            <Row label="Mailing State/Province"   value={addr.mailing.state} />
            <Row label="Mailing Zip/Postal Code"  value={addr.mailing.zip} />
            <Row label="Mailing Country"          value={addr.mailing.country} />
          </div>
        </TwoCol>
      </InfoSection>
    </div>
  );
}

// ── Brokerage view ─────────────────────────────────────────────────────────

function BrokerageView({ brokerage, contacts }: { brokerage: BrokerageDetail; contacts: BrokerContact[] }) {
  const { quickStats: qs, accountInfo: ai, addressInfo: addr } = brokerage;
  return (
    <div className="space-y-4">
      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5"
        style={{ background: colors.white, border: `1px solid ${colors.borderStrong}` }}>
        <StatCell label="Account Record Type" value={qs.accountRecordType} />
        <StatCell label="Account ID"          value={qs.accountId} />
        <StatCell label="Physical City"       value={qs.physicalCity} />
        <StatCell label="Physical State"      value={qs.physicalState} />
        <StatCell label="Parent Account"      value={qs.parentAccount} last />
      </div>

      {/* Account Information */}
      <InfoSection title="Account Information" accent={colors.accentGold}>
        <TwoCol>
          <div>
            <Row label="Account Name"           value={ai.accountName} />
            <Row label="Preferred Account Name" value={ai.preferredAccountName} />
            <Row label="Parent Account"         value={ai.parentAccount} />
            <Row label="Account Record Type"    value={ai.accountRecordType} />
            <Row label="Account Sub-Type"       value={ai.accountSubType} />
          </div>
          <div>
            <Row label="Account ID"     value={ai.accountId} />
            <Row label="Account Status" value={ai.accountStatus} valueColor={colors.successGreen} />
            <Row label="Phone"          value={ai.phone} />
            <Row label="Fax"            value={ai.fax} />
          </div>
        </TwoCol>
      </InfoSection>

      {/* Address Information */}
      <InfoSection title="Address Information" accent={colors.accentGold}>
        <TwoCol>
          <div>
            <Row label="Physical Address 1"       value={addr.physical.address1} />
            <Row label="Physical Address 2"       value={addr.physical.address2} />
            <Row label="Physical City"            value={addr.physical.city} />
            <Row label="Physical State/Province"  value={addr.physical.state} />
            <Row label="Physical Zip/Postal Code" value={addr.physical.zip} />
            <Row label="Physical County"          value={addr.physical.county} />
            <Row label="Physical Country"         value={addr.physical.country} />
          </div>
          <div>
            <Row label="Copy from Physical"       value="—" />
            <Row label="Mailing Address 1"        value={addr.mailing.address1} />
            <Row label="Mailing Address 2"        value={addr.mailing.address2} />
            <Row label="Mailing City"             value={addr.mailing.city} />
            <Row label="Mailing State/Province"   value={addr.mailing.state} />
            <Row label="Mailing Zip/Postal Code"  value={addr.mailing.zip} />
            <Row label="Mailing Country"          value={addr.mailing.country} />
          </div>
        </TwoCol>
      </InfoSection>

      {/* Broker Roles */}
      <InfoSection title="Broker Roles" accent={colors.accentGold} badge={`${contacts.length} contacts`}>
        <div className="overflow-x-auto">
          <div className="grid mt-2 mb-1"
            style={{ gridTemplateColumns: '1.2fr 1fr 1.5fr 0.9fr 2fr' }}>
            {['Contact', 'Phone', 'Email', 'Product Access', 'Broker Role'].map((h) => (
              <span key={h} style={{
                fontSize: '0.62rem', fontWeight: 700, color: colors.textMuted,
                textTransform: 'uppercase', letterSpacing: '0.08em',
                paddingBottom: 6, borderBottom: `2px solid ${colors.borderStrong}`,
              }}>
                {h}
              </span>
            ))}
          </div>
          {contacts.map((c, i) => (
            <div key={i} className="grid py-2.5"
              style={{
                gridTemplateColumns: '1.2fr 1fr 1.5fr 0.9fr 2fr',
                borderBottom: `1px solid ${colors.borderDefault}`,
                background: i % 2 === 1 ? colors.slate100 : colors.white,
              }}>
              <span style={{ fontSize: '0.80rem', fontWeight: 600, color: colors.brandBlue }}>{c.name}</span>
              <span style={{ fontSize: '0.78rem', color: colors.textHeading }}>{c.phone}</span>
              <span style={{ fontSize: '0.78rem', color: colors.brandBlue }}>{c.email}</span>
              <span style={{ fontSize: '0.78rem', color: colors.textHeading }}>{c.access}</span>
              <div className="flex flex-wrap gap-1">
                {c.roles.map((r, ri) => (
                  <span key={ri} style={{
                    fontSize: '0.70rem',
                    color: c.highlight ? colors.brandBlue : colors.textBody,
                    fontWeight: c.highlight ? 600 : 400,
                  }}>
                    {r}{ri < c.roles.length - 1 ? ';' : ''}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </InfoSection>
    </div>
  );
}

// ── Main export ────────────────────────────────────────────────────────────

export function MemberBrokerTab({ member, brokerage, contacts, activeView, onViewChange }: MemberBrokerTabProps) {
  return (
    <div className="space-y-4" style={{ fontFamily: fonts.sans }}>

      {/* Toggle cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Member card */}
        <button
          type="button"
          onClick={() => onViewChange('member')}
          className="flex items-center justify-between px-5 py-4 w-full text-left transition-all"
          style={{
            background:  colors.white,
            border:      `1px solid ${activeView === 'member' ? colors.brandBlue : colors.borderStrong}`,
            borderTop:   `3px solid ${colors.brandBlue}`,
            outline:     'none',
            boxShadow:   activeView === 'member' ? `0 0 0 2px ${colors.brandBlueAlpha13}` : 'none',
          }}
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center shrink-0"
              style={{ width: 38, height: 38, background: colors.brandBlueAlpha08, border: `1px solid ${colors.brandBlueAlpha25}` }}>
              <Building2 size={18} color={colors.brandBlue} />
            </div>
            <div>
              <p style={{ fontSize: '0.58rem', fontWeight: 700, color: colors.textMuted,
                textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 2 }}>
                Member
              </p>
              <p style={{ fontSize: '0.95rem', fontWeight: 800, color: colors.textHeading, lineHeight: 1.2 }}>
                {member.accountInfo.accountName}
              </p>
              <p style={{ fontSize: '0.72rem', color: colors.textBody, marginTop: 2 }}>
                {member.quickStats.memberNumber} · {member.quickStats.physicalCity} · Active member
              </p>
            </div>
          </div>
          {activeView === 'member' && <CheckCircle2 size={18} color={colors.brandBlue} />}
        </button>

        {/* Brokerage card */}
        <button
          type="button"
          onClick={() => onViewChange('brokerage')}
          className="flex items-center justify-between px-5 py-4 w-full text-left transition-all"
          style={{
            background:  colors.white,
            border:      `1px solid ${activeView === 'brokerage' ? colors.brandBlue : colors.borderStrong}`,
            borderTop:   `3px solid ${colors.accentGold}`,
            outline:     'none',
            boxShadow:   activeView === 'brokerage' ? `0 0 0 2px ${colors.brandBlueAlpha13}` : 'none',
          }}
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center shrink-0"
              style={{ width: 38, height: 38, background: colors.accentGoldBg, border: `1px solid ${colors.accentGoldBorder}` }}>
              <MapPin size={18} color={colors.accentGold} />
            </div>
            <div>
              <p style={{ fontSize: '0.58rem', fontWeight: 700, color: colors.textMuted,
                textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 2 }}>
                Brokerage
              </p>
              <p style={{ fontSize: '0.95rem', fontWeight: 800, color: colors.textHeading, lineHeight: 1.2 }}>
                {brokerage.accountInfo.accountName}
              </p>
              <p style={{ fontSize: '0.72rem', color: colors.textBody, marginTop: 2 }}>
                ID {brokerage.quickStats.accountId} · {brokerage.quickStats.physicalCity}, {brokerage.quickStats.physicalState} · T. Owens producer
              </p>
            </div>
          </div>
          {activeView === 'brokerage' && <CheckCircle2 size={18} color={colors.brandBlue} />}
        </button>
      </div>

      {/* Active view */}
      {activeView === 'member'
        ? <MemberView member={member} />
        : <BrokerageView brokerage={brokerage} contacts={contacts} />
      }
    </div>
  );
}
