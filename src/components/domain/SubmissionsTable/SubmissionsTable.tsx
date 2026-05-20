import { useRef, useState, useEffect } from 'react';
import { Inbox, MapPin, Filter, ChevronDown, ChevronRight } from 'lucide-react';
import { colors, fonts, dims, statusLabels } from '@/theme/tokens';
import { formatCurrency } from '@/shared/utils';
import type { Submission, SubmissionStatus } from '@/shared/types';
import { StatusPill } from '@/components/domain/StatusPill';
import { PriorityChip } from '@/components/domain/PriorityChip';
import { CardShell } from '@/components/domain/CardShell';

type Scope = 'Mine' | 'Team' | 'All';
type FilterValue = SubmissionStatus | 'All';

const STATUS_OPTIONS: FilterValue[] = [
  'All', 'InReview', 'Quoted', 'PendingInfo', 'Bound', 'Declined',
];

function statusOptionLabel(opt: FilterValue): string {
  return opt === 'All' ? 'All' : statusLabels[opt];
}

interface Props {
  submissions: Submission[];
  scope?: Scope;
  onScopeChange?: (s: Scope) => void;
  filterStatus?: FilterValue;
  onFilterChange?: (f: FilterValue) => void;
  onRowClick?: (s: Submission) => void;
  onViewAll?: () => void;
}

const COL = dims.tableCols;

const TH_STYLE: React.CSSProperties = {
  padding:      '6px 8px',
  fontSize:     10,
  fontWeight:   700,
  color:        colors.textMuted,
  textAlign:    'left',
  borderBottom: `1px solid ${colors.borderDefault}`,
  whiteSpace:   'nowrap',
};

export function SubmissionsTable({
  submissions,
  scope = 'Team',
  onScopeChange,
  filterStatus = 'All',
  onFilterChange,
  onRowClick,
  onViewAll,
}: Props) {
  const n = submissions.length;
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!dropdownOpen) return;
    function handleOutside(e: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [dropdownOpen]);

  return (
    <CardShell
      title="SUBMISSIONS"
      icon={<Inbox size={14} />}
      headerRight={
        <span
          style={{
            background:   colors.brandBlue,
            color:        '#ffffff',
            fontSize:     11,
            fontWeight:   700,
            padding:      '1px 10px',
            borderRadius: 0,
          }}
        >
          {n}
        </span>
      }
      footer={
        <div
          style={{
            display:        'flex',
            justifyContent: 'space-between',
            alignItems:     'center',
            background:     colors.bgMuted,
            borderTop:      `1px solid ${colors.borderDefault}`,
            padding:        '10px 20px',
          }}
        >
          <span style={{ fontSize: 11, color: colors.textMuted }}>
            Showing {n} of {n} submissions
          </span>
          <button
            onClick={onViewAll}
            style={{
              display: 'flex', alignItems: 'center', gap: 2,
              fontSize: 11, fontWeight: 600, color: colors.brandBlueDeep,
              background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: fonts.sans, padding: 0,
            }}
          >
            View all →
            <ChevronRight size={10} style={{ color: colors.brandBlueDeep }} aria-hidden />
          </button>
        </div>
      }
    >

      {/* ── Toolbar ── */}
      <div
        style={{
          display:        'flex',
          justifyContent: 'space-between',
          alignItems:     'center',
          borderBottom:   `1px solid ${colors.borderDefault}`,
          padding:        '10px 20px',
        }}
      >
        {/* Scope buttons */}
        <div style={{ display: 'flex', gap: 4 }}>
          {(['Mine', 'Team', 'All'] as Scope[]).map((s) => {
            const active = scope === s;
            return (
              <button
                key={s}
                onClick={() => onScopeChange?.(s)}
                style={{
                  height:       31,
                  padding:      '1px 12px',
                  fontSize:     12,
                  fontWeight:   600,
                  background:   active ? colors.brandBlue : '#ffffff',
                  color:        active ? '#ffffff' : colors.textBody,
                  border:       `1px solid ${active ? colors.brandBlue : colors.borderStrong}`,
                  borderRadius: 0,
                  cursor:       'pointer',
                  fontFamily:   fonts.sans,
                }}
              >
                {s}
              </button>
            );
          })}
        </div>

        {/* Filter dropdown */}
        <div ref={filterRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setDropdownOpen((o) => !o)}
            style={{
              display:      'flex',
              alignItems:   'center',
              gap:          4,
              minWidth:     77,
              height:       31,
              padding:      '0 8px',
              background:   filterStatus !== 'All' ? colors.bgMuted : '#ffffff',
              border:       `1px solid ${filterStatus !== 'All' ? colors.brandBlue : colors.borderStrong}`,
              borderRadius: 0,
              cursor:       'pointer',
              fontFamily:   fonts.sans,
            }}
          >
            <Filter
              size={12}
              style={{ color: filterStatus !== 'All' ? colors.brandBlue : colors.textBody, flexShrink: 0 }}
              aria-hidden
            />
            <span style={{ fontSize: 12, fontWeight: 500, color: filterStatus !== 'All' ? colors.brandBlue : colors.textBody, whiteSpace: 'nowrap' }}>
              {statusOptionLabel(filterStatus)}
            </span>
            <ChevronDown
              size={12}
              style={{ color: filterStatus !== 'All' ? colors.brandBlue : colors.textBody, marginLeft: 'auto', flexShrink: 0 }}
              aria-hidden
            />
          </button>

          {dropdownOpen && (
            <div
              style={{
                position:   'absolute',
                top:        '100%',
                right:      0,
                zIndex:     20,
                marginTop:  2,
                background: '#ffffff',
                border:     `1px solid ${colors.borderStrong}`,
                borderRadius: 0,
                minWidth:   120,
                boxShadow:  '0 4px 8px rgba(0,0,0,0.08)',
              }}
            >
              {STATUS_OPTIONS.map((opt) => {
                const selected = filterStatus === opt;
                return (
                  <button
                    key={opt}
                    onClick={() => { onFilterChange?.(opt); setDropdownOpen(false); }}
                    style={{
                      display:    'block',
                      width:      '100%',
                      padding:    '7px 12px',
                      textAlign:  'left',
                      fontSize:   12,
                      fontWeight: selected ? 600 : 400,
                      color:      selected ? colors.brandBlue : colors.textBody,
                      background: selected ? colors.bgMuted : 'transparent',
                      border:     'none',
                      cursor:     'pointer',
                      fontFamily: fonts.sans,
                    }}
                    onMouseEnter={(e) => { if (!selected) (e.currentTarget as HTMLElement).style.background = colors.bgMuted2; }}
                    onMouseLeave={(e) => { if (!selected) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                  >
                    {statusOptionLabel(opt)}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Table ── */}
      <table
        style={{
          width:          '100%',
          borderCollapse: 'collapse',
          tableLayout:    'fixed',
        }}
      >
        <colgroup>
          <col style={{ width: '7.41%' }} />
          <col style={{ width: '18.65%' }} />
          <col style={{ width: '9.58%' }} />
          <col style={{ width: '11.62%' }} />
          <col style={{ width: '10.47%' }} />
          <col style={{ width: '14.56%' }} />
          <col style={{ width: '11.11%' }} />
          <col style={{ width: '10.86%' }} />
          <col style={{ width: '5.74%' }} />
        </colgroup>
        <thead>
          <tr>
            <th style={TH_STYLE}>ID</th>
            <th style={TH_STYLE}>Member / Institution</th>
            <th style={TH_STYLE}>Type</th>
            <th style={TH_STYLE}>Assignee</th>
            <th style={TH_STYLE}>Premium</th>
            <th style={TH_STYLE}>Status</th>
            <th style={TH_STYLE}>Priority</th>
            <th style={TH_STYLE}>Eff. Date</th>
            <th style={TH_STYLE} />
          </tr>
        </thead>
        <tbody>
          {n === 0 ? (
            <tr>
              <td
                colSpan={9}
                style={{
                  padding:   '24px',
                  textAlign: 'center',
                  fontSize:  12,
                  color:     colors.textMuted,
                }}
              >
                No submissions to show.
              </td>
            </tr>
          ) : (
            submissions.map((row) => (
              <tr
                key={row.id}
                onClick={() => onRowClick?.(row)}
                style={{
                  borderBottom: `1px solid ${colors.borderDefault}`,
                  cursor:       onRowClick ? 'pointer' : 'default',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = colors.bgMuted2; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                {/* ID */}
                <td style={{ padding: '8px 8px', overflow: 'hidden' }}>
                  <span style={{ fontFamily: fonts.mono, fontSize: 12, fontWeight: 700, color: colors.brandBlueDeep }}>
                    {row.id}
                  </span>
                </td>

                {/* Member / Institution */}
                <td style={{ padding: '8px 8px', overflow: 'hidden' }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: colors.textHeading, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {row.member}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginTop: 2, flexWrap: 'nowrap' }}>
                    <MapPin size={9} style={{ color: colors.textMuted, flexShrink: 0 }} aria-hidden />
                    <span style={{ fontSize: 11, color: colors.textMuted }}>{row.state}</span>
                    {row.docs && (
                      <span
                        style={{
                          display:      'inline-block',
                          marginLeft:   4,
                          padding:      '0px 4px',
                          background:   colors.dangerRedBg,
                          border:       `1px solid ${colors.dangerRedBorder}`,
                          borderRadius: 0,
                          fontSize:     9,
                          fontWeight:   700,
                          color:        colors.dangerRedText,
                          whiteSpace:   'nowrap',
                        }}
                      >
                        Docs ⚠
                      </span>
                    )}
                  </div>
                </td>

                {/* Type */}
                <td style={{ padding: '8px 8px', overflow: 'hidden' }}>
                  <span
                    style={{
                      display:      'inline-block',
                      padding:      '4px 8px',
                      background:   colors.bgMuted,
                      border:       `1px solid ${colors.borderDefault}`,
                      borderRadius: 0,
                      fontSize:     11,
                      fontWeight:   600,
                      color:        colors.textBody,
                      whiteSpace:   'nowrap',
                      overflow:     'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth:     '100%',
                    }}
                  >
                    {row.type}
                  </span>
                </td>

                {/* Assignee */}
                <td style={{ padding: '8px 8px', overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        width: 22, height: 22, flexShrink: 0,
                        background: colors.borderDefault, borderRadius: 0,
                        fontSize: 9, fontWeight: 700, color: colors.textBody,
                      }}
                    >
                      {row.assigneeInitials}
                    </span>
                    <span style={{ fontSize: 11, color: colors.textBody }}>{row.assigneeName}</span>
                  </div>
                </td>

                {/* Premium */}
                <td style={{ padding: '8px 8px', overflow: 'hidden' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: colors.brandBlue }}>
                    {formatCurrency(row.premium)}
                  </span>
                </td>

                {/* Status */}
                <td style={{ padding: '8px 8px', overflow: 'hidden' }}>
                  <StatusPill status={row.status} />
                </td>

                {/* Priority */}
                <td style={{ padding: '8px 8px', overflow: 'hidden' }}>
                  <PriorityChip priority={row.priority} />
                </td>

                {/* Eff. Date */}
                <td style={{ padding: '8px 8px', overflow: 'hidden' }}>
                  <span style={{ fontSize: 11, color: colors.textBody }}>{row.effDate}</span>
                </td>

                {/* Chevron */}
                <td style={{ padding: '8px 8px', textAlign: 'center' }}>
                  <ChevronRight size={13} style={{ color: colors.textMuted }} aria-hidden />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

    </CardShell>
  );
}
