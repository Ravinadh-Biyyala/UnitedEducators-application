import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ChevronDown, GraduationCap, LayoutDashboard, Users, ShieldAlert,
  TrendingDown, FolderOpen, MessageSquare, Calculator, CheckSquare,
  Clock, ThumbsUp, ShieldCheck, UserCheck, Briefcase, Globe, Lock,
  Car, Building2, Shield, ClipboardCheck,
} from 'lucide-react';
import { ErrorBoundary, PanelErrorState } from '@/components/common';
import { OverviewTab } from '@/components/domain/OverviewTab';
import { MemberBrokerTabContainer } from '@/containers/submissions';
import {
  colors, fonts, statusStyles,
  newSubmissionBreadcrumbStyles as b,
} from '@/theme/tokens';
import type { SubmissionStatus } from '@/theme/tokens';

// ── Mock data ─────────────────────────────────────────────────────────────────
const SUBMISSION = {
  id:              'SUB-7829',
  institutionName: 'Brookfield Day School',
  memberNumber:    '473',
  memberSince:     '2014',
  memberType:      'Private K-12',
  enrollment:      '842 students',
  location:        'Westport, CT',
  needByDate:      'Apr 28, 2026',
  needByUrgency:   '7 days',
  effectiveDate:   'Jun 1, 2026',
  expiryDate:      'Jun 1, 2027',
  expiringPremium: '$132,400',
  expiringNote:    '2025 policy',
  quotedPremium:   '$142,800',
  quotedNote:      '+7.8% indicated',
  boundPremium:    '—',
  boundNote:       'Not yet bound',
  lossRatio:       '58%',
  lossRatioNote:   '2 open claims',
  brokerage:       'Marsh McLennan',
  brokerContact:   'T. Owens',
  underwriter:     { name: 'Maya Khanna',  title: 'Sr. UW · Northeast' },
  uwSpecialist:    { name: 'Devon Carter', title: 'Assistant UW'        },
  productLines:    ['epl', 'ell', 'gl', 'cyber'],
};

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS_OPTIONS: SubmissionStatus[] = ['InReview', 'Quoted', 'Bound', 'Declined', 'PendingInfo'];

const STATUS_LABELS: Record<SubmissionStatus, string> = {
  New: 'New', InReview: 'In Review', Quoted: 'Quoted',
  Bound: 'Bound', Declined: 'Declined', PendingInfo: 'Pending Info',
};

// ── Tabs ──────────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'overview',   label: 'Overview',           icon: <LayoutDashboard size={14} /> },
  { id: 'member',     label: 'Member & Brokerage',  icon: <Users          size={14} /> },
  { id: 'risk',       label: 'Risk & Exposure',     icon: <ShieldAlert    size={14} /> },
  { id: 'loss',       label: 'Loss History',        icon: <TrendingDown   size={14} /> },
  { id: 'documents',  label: 'Documents',           icon: <FolderOpen     size={14} /> },
  { id: 'rating',     label: 'Rating',              icon: <Calculator     size={14} /> },
  { id: 'notes',      label: 'Notes',               icon: <MessageSquare  size={14} /> },
  { id: 'tasks',      label: 'Tasks',               icon: <CheckSquare    size={14} /> },
  { id: 'approvals',  label: 'Approvals',           icon: <ThumbsUp       size={14} /> },
  { id: 'audit',      label: 'Audit Trail',         icon: <Clock          size={14} /> },
];

// ── Product line display catalog ──────────────────────────────────────────────
const PRODUCT_DISPLAY: Record<string, { abbr: string; icon: React.ReactNode }> = {
  epl:      { abbr: 'EPL',   icon: <UserCheck  size={11} /> },
  ell:      { abbr: 'ELL',   icon: <ShieldCheck size={11} /> },
  gl:       { abbr: 'GL',    icon: <Shield     size={11} /> },
  ml:       { abbr: 'ML',    icon: <Briefcase  size={11} /> },
  property: { abbr: 'Prop',  icon: <Building2  size={11} /> },
  auto:     { abbr: 'Auto',  icon: <Car        size={11} /> },
  crime:    { abbr: 'Crime', icon: <Lock       size={11} /> },
  cyber:    { abbr: 'Cyber', icon: <Globe      size={11} /> },
  student:  { abbr: 'SA',    icon: <Users      size={11} /> },
};

// ── StatCell ──────────────────────────────────────────────────────────────────
function StatCell({
  label, value, note, noteColor, borderRight = true, borderBottom = false,
}: {
  label: string; value: string; note?: string;
  noteColor?: string; borderRight?: boolean; borderBottom?: boolean;
}) {
  return (
    <div
      className="px-5 py-3 flex flex-col gap-0.5"
      style={{
        borderRight:  borderRight  ? `1px solid ${colors.borderDefault}` : undefined,
        borderBottom: borderBottom ? `1px solid ${colors.borderDefault}` : undefined,
      }}
    >
      <span style={{ color: colors.textMuted, fontSize: '0.56rem', fontWeight: 600 }}>{label}</span>
      <span style={{ color: colors.textHeading, fontSize: '0.88rem', fontWeight: 700 }}>{value}</span>
      {note && <span style={{ fontSize: '0.68rem', color: noteColor ?? colors.textMuted }}>{note}</span>}
    </div>
  );
}

// ── Coming-soon stub for unimplemented tabs ───────────────────────────────────
function ComingSoon({ label }: { label: string }) {
  return (
    <div
      className="flex items-center justify-center"
      style={{ minHeight: 200, color: colors.textMuted, fontSize: '0.85rem', fontFamily: fonts.sans }}
    >
      {label} — coming soon
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export function SubmissionDetailPage() {
  const { id }                              = useParams<{ id: string }>();
  const [status, setStatus]                 = useState<SubmissionStatus>('InReview');
  const [dropOpen, setDropOpen]             = useState(false);
  const [activeTab, setActiveTab]           = useState('overview');

  const sc             = statusStyles[status];
  const activeTabLabel = TABS.find((t) => t.id === activeTab)?.label ?? 'Overview';

  const renderTab = () => {
    const subId = id ?? SUBMISSION.id;
    if (activeTab === 'overview') return <OverviewTab />;
    if (activeTab === 'member')   return <MemberBrokerTabContainer submissionId={subId} />;
    return <ComingSoon label={activeTabLabel} />;
  };

  return (
    <div className="flex flex-col -mx-8 -mt-7" style={{ fontFamily: fonts.sans, color: colors.textHeading }}>

      {/* ── Breadcrumb ────────────────────────────────────────────────────── */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center"
        style={{
          background:   b.bg,
          borderBottom: `${b.borderBottomWidth}px solid ${b.borderBottomColor}`,
          paddingLeft:  b.paddingX,
          paddingRight: b.paddingX,
          paddingTop:   b.paddingY,
          paddingBottom: b.paddingY,
          gap:          b.itemGap,
        }}
      >
        <Link to="/dashboard" style={{ fontSize: b.linkSize, fontWeight: b.linkWeight, color: b.linkColor, textDecoration: 'none' }}>Dashboard</Link>
        <span style={{ color: b.separatorColor, fontSize: b.separatorSize }}>{b.separatorChar}</span>
        <Link to="/submissions" style={{ fontSize: b.linkSize, fontWeight: b.linkWeight, color: b.linkColor, textDecoration: 'none' }}>Submissions</Link>
        <span style={{ color: b.separatorColor, fontSize: b.separatorSize }}>{b.separatorChar}</span>
        <span style={{ fontSize: b.linkSize, fontWeight: 600, color: colors.brandBlue }}>{SUBMISSION.institutionName}</span>
        <span style={{ color: b.separatorColor, fontSize: b.separatorSize }}>{b.separatorChar}</span>
        <span style={{ fontSize: b.linkSize, fontWeight: 700, color: colors.accentGold }}>{activeTabLabel}</span>
      </nav>

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <div style={{ background: colors.white, borderBottom: `1px solid ${colors.borderDefault}` }}>

        {/* Gold gradient accent bar */}
        <div style={{ height: 4, background: `linear-gradient(90deg, ${colors.accentGold} 0%, ${colors.brandGoldDark} 100%)` }} />

        {/* Identity + actions row */}
        <div className="px-8 py-5 flex flex-col md:flex-row md:items-start gap-5">

          {/* Institution icon */}
          <div
            className="flex items-center justify-center shrink-0 mt-1"
            style={{ width: 52, height: 52, background: colors.accentGoldBg, border: `2px solid ${colors.accentGoldBorder}` }}
          >
            <GraduationCap size={26} color={colors.accentGold} />
          </div>

          {/* Identity block */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
              <h1 style={{ color: colors.textHeading, fontSize: '1.30rem', fontWeight: 800, lineHeight: 1.2 }}>
                {SUBMISSION.institutionName}
              </h1>
              <span style={{
                background: colors.accentGoldBg, color: colors.accentGoldText,
                border: `1px solid ${colors.accentGoldBorder}`, fontSize: '0.68rem', fontWeight: 800,
                letterSpacing: '0.10em', padding: '2px 10px', textTransform: 'uppercase', whiteSpace: 'nowrap',
              }}>
                {id ?? SUBMISSION.id}
              </span>
              <span style={{ color: colors.textMuted, fontSize: '0.82rem' }}>·</span>
              <span style={{ color: colors.textBody, fontSize: '0.80rem', fontWeight: 500 }}>Member</span>
              <span style={{
                background: colors.brandBlueAlpha08, color: colors.textHeading,
                border: `1px solid ${colors.brandBlueAlpha25}`, fontSize: '0.72rem', fontWeight: 700, padding: '1px 8px',
              }}>
                {SUBMISSION.memberNumber}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5" style={{ color: colors.textBody, fontSize: '0.76rem' }}>
              <ClipboardCheck size={11} color={colors.textMuted} />
              <span>Member since {SUBMISSION.memberSince}</span>
              <span style={{ opacity: 0.4 }}>·</span>
              <span>{SUBMISSION.memberType}</span>
              <span style={{ opacity: 0.4 }}>·</span>
              <span>{SUBMISSION.enrollment}</span>
              <span style={{ opacity: 0.4 }}>·</span>
              <span>{SUBMISSION.location}</span>
            </div>
          </div>

          {/* Action cluster */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">

            {/* Status dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setDropOpen((v) => !v)}
                className="flex items-center gap-2.5 px-4 py-2"
                style={{ background: sc.bg, border: `1px solid ${sc.border}`, minWidth: 148 }}
              >
                <span className="inline-block rounded-full shrink-0" style={{ width: 7, height: 7, background: sc.dot }} />
                <span style={{ color: sc.text, fontSize: '0.80rem', fontWeight: 600, flex: 1, textAlign: 'left' }}>
                  {STATUS_LABELS[status]}
                </span>
                <ChevronDown size={12} style={{ color: sc.text }} />
              </button>
              {dropOpen && (
                <div className="absolute right-0 z-50" style={{
                  background: colors.white, border: `1px solid ${colors.borderStrong}`,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.15)', minWidth: 164, top: '100%', marginTop: 4,
                }}>
                  {STATUS_OPTIONS.map((s) => {
                    const c = statusStyles[s];
                    return (
                      <button key={s} type="button"
                        onClick={() => { setStatus(s); setDropOpen(false); }}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left hover:bg-gray-50"
                      >
                        <span className="inline-block rounded-full" style={{ width: 6, height: 6, background: c.dot, flexShrink: 0 }} />
                        <span style={{ color: c.text, fontSize: '0.80rem', fontWeight: 500 }}>{STATUS_LABELS[s]}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Bind Policy */}
            <button
              type="button"
              className="flex items-center gap-2 px-5 py-2 hover:brightness-95 active:scale-95"
              style={{ background: colors.white, border: `1px solid ${colors.borderStrong}`, color: colors.brandBlue, fontSize: '0.80rem', fontWeight: 700 }}
            >
              <ClipboardCheck size={14} /> Bind Policy
            </button>
          </div>
        </div>

        {/* 5 + 5 stat grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 overflow-hidden" style={{ borderTop: `1px solid ${colors.borderDefault}` }}>
          <StatCell label="Effective Date"   value={SUBMISSION.effectiveDate}   borderBottom />
          <StatCell label="Expiration Date"  value={SUBMISSION.expiryDate}      borderBottom />
          <StatCell label="Need-By Date"     value={SUBMISSION.needByDate}      note={SUBMISSION.needByUrgency} noteColor={colors.dangerRed} borderBottom />
          <StatCell label="Expiring Premium" value={SUBMISSION.expiringPremium} note={SUBMISSION.expiringNote}  borderBottom />
          <StatCell label="Quoted Premium"   value={SUBMISSION.quotedPremium}   note={SUBMISSION.quotedNote} noteColor={colors.successGreen} borderRight={false} borderBottom />
          <StatCell label="Bound Premium"    value={SUBMISSION.boundPremium}    note={SUBMISSION.boundNote} />
          <StatCell label="Loss Ratio (6 yr)" value={SUBMISSION.lossRatio}     note={SUBMISSION.lossRatioNote} />
          <StatCell label="Brokerage"        value={SUBMISSION.brokerage}       note={SUBMISSION.brokerContact} />
          <StatCell label="Underwriter"      value={SUBMISSION.underwriter.name}   note={SUBMISSION.underwriter.title} />
          <StatCell label="Underwriting Specialist" value={SUBMISSION.uwSpecialist.name} note={SUBMISSION.uwSpecialist.title} borderRight={false} />
        </div>

        {/* Coverage lines strip */}
        <div className="px-8 py-3 flex flex-wrap items-center gap-2" style={{ borderTop: `1px solid ${colors.borderDefault}` }}>
          <span style={{ color: colors.textMuted, fontSize: '0.56rem', fontWeight: 600, marginRight: 4 }}>
            Coverage Lines
          </span>
          {SUBMISSION.productLines.map((pid) => {
            const pd = PRODUCT_DISPLAY[pid];
            if (!pd) return null;
            return (
              <span key={pid} className="flex items-center gap-1.5 px-2.5 py-1"
                style={{ background: colors.brandBlueAlpha03, border: `1px solid ${colors.brandBlueAlpha13}`, fontSize: '0.68rem', fontWeight: 700, color: colors.brandBlue }}>
                <span style={{ color: colors.textMuted }}>{pd.icon}</span>
                {pd.abbr}
              </span>
            );
          })}
        </div>
      </div>

      {/* ── Tab nav ───────────────────────────────────────────────────────── */}
      <div style={{ background: colors.white, borderBottom: `1px solid ${colors.borderStrong}`, display: 'flex', overflowX: 'auto' }}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className="relative flex items-center gap-1.5 px-5 py-3 whitespace-nowrap shrink-0"
              style={{
                fontSize:   '0.78rem',
                fontWeight: isActive ? 700 : 400,
                color:      isActive ? colors.brandBlue : colors.textBody,
                background: isActive ? colors.slate100 : 'transparent',
                border:     'none',
                outline:    'none',
                cursor:     'pointer',
              }}
            >
              <span style={{ color: isActive ? colors.brandBlue : colors.textMuted }}>{tab.icon}</span>
              {tab.label}
              {isActive && (
                <span style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: colors.accentGold }} />
              )}
            </button>
          );
        })}
      </div>

      {/* ── Tab content ───────────────────────────────────────────────────── */}
      <div className="px-8 py-6 pb-10" style={{ background: colors.bgMuted, minHeight: 400 }}>
        <ErrorBoundary fallback={<PanelErrorState panelName={activeTabLabel} />}>
          {renderTab()}
        </ErrorBoundary>
      </div>

    </div>
  );
}
