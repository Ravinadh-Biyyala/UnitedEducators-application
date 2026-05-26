import { AlertTriangle, ChevronRight, GraduationCap } from 'lucide-react';
import { Pagination, SortableColumnHeader } from '@/components/common';
import { getAriaSort } from '@/components/common/SortableColumnHeader';
import { ProductChips } from '@/components/domain/ProductChips';
import { StatusBadge } from '@/components/domain/StatusBadge';
import {
  colors,
  daysOpenSeverityStyles,
  daysOpenThresholds,
  submissionsListAssignedCellStyles  as ac,
  submissionsListDaysCellStyles       as dc,
  submissionsListEffectiveCellStyles  as ec,
  submissionsListMemberCellStyles     as mc,
  submissionsListNeedByCellStyles     as nbc,
  submissionsListPremiumCellStyles    as pc,
  submissionsListTypePillStyles       as tp,
  submissionsListTableDims            as dims,
  submissionsRowStatusStripes,
  submissionTypeLabels,
  appetiteTextStyles                  as ats,
  unassignedStyles,
} from '@/theme/tokens';
import { formatCurrency } from '@/shared/utils';
import type {
  DaysOpenSeverity,
  Submission,
  SubmissionsListResponse,
  SubmissionsSort,
  SubmissionsSortField,
} from '@/shared/types';

interface SubmissionsListTableProps {
  response?:    SubmissionsListResponse;
  isLoading?:   boolean;
  isError?:     boolean;
  sort:         SubmissionsSort;
  onSortChange: (next: SubmissionsSort) => void;
  page:         number;
  pageSize:     number;
  onPageChange: (page: number) => void;
  onRowClick?:  (id: string) => void;
}

const COLUMN_ORDER: {
  key:        keyof typeof dims.colWidths;
  label:      string;
  sortField?: SubmissionsSortField;
  align?:     'left' | 'right' | 'center';
}[] = [
  { key: 'memberInstitution', label: 'Member / Institution' },
  { key: 'type',              label: 'Type' },
  { key: 'products',          label: 'Products' },
  { key: 'stage',             label: 'Stage' },
  { key: 'premium',           label: 'Premium' },
  { key: 'underwriter',       label: 'Underwriter' },
  { key: 'appetite',          label: 'Appetite',  align: 'center' },
  { key: 'age',               label: 'Age',       sortField: 'age' },
  { key: 'needBy',            label: 'Need By',   sortField: 'needBy' },
  { key: 'effective',         label: 'Effective', sortField: 'effective' },
];

const cellPaddingStyle = {
  paddingLeft:   dims.cellPaddingX,
  paddingRight:  dims.cellPaddingX,
  paddingTop:    dims.cellPaddingY,
  paddingBottom: dims.cellPaddingY,
} as const;

export function SubmissionsListTable({
  response,
  isLoading,
  isError,
  sort,
  onSortChange,
  page,
  pageSize,
  onPageChange,
  onRowClick,
}: SubmissionsListTableProps) {
  const items = response?.items ?? [];
  const total = response?.total ?? 0;
  const showSkeleton = isLoading && items.length === 0;
  const showError    = !isLoading && isError;
  const showEmpty    = !isLoading && !isError && items.length === 0;

  const handleSort = (field: string) => {
    const direction: 'asc' | 'desc' =
      sort.field === field && sort.direction === 'desc' ? 'asc' : 'desc';
    onSortChange({ field: field as SubmissionsSortField, direction });
  };

  return (
    <div className="bg-white">
      <div className="overflow-x-auto">
        <table
          className="text-sm leading-relaxed border-collapse"
          style={{ minWidth: 'max-content', width: '100%' }}
        >
          <caption className="sr-only">Submissions list</caption>
          <colgroup>
            {COLUMN_ORDER.map((col) => (
              <col key={col.key} style={{ width: dims.colWidths[col.key] }} />
            ))}
          </colgroup>
          <thead>
            <tr
              style={{
                height:          dims.headerHeight,
                backgroundColor: dims.headerBg,
                borderBottom:    `${dims.headerBorderWidth}px solid ${dims.headerBorderColor}`,
              }}
            >
              {COLUMN_ORDER.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  aria-sort={getAriaSort(col.sortField, sort.field, sort.direction)}
                  style={{
                    paddingLeft:  dims.headerPaddingX,
                    paddingRight: dims.headerPaddingX,
                    textAlign:    col.align ?? 'left',
                    fontWeight:   dims.headerFontWeight,
                  }}
                >
                  {col.sortField ? (
                    <SortableColumnHeader
                      label={col.label}
                      sortKey={col.sortField}
                      currentField={sort.field}
                      currentDirection={sort.direction}
                      onSortChange={handleSort}
                      align={col.align}
                    />
                  ) : (
                    <span
                      style={{
                        fontSize:   dims.headerFontSize,
                        fontWeight: dims.headerFontWeight,
                        color:      dims.headerInactiveColor,
                        display:    'block',
                      }}
                    >
                      {col.label}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {showSkeleton && Array.from({ length: pageSize }).map((_, i) => <SkeletonRow key={i} />)}
            {showError && <ErrorMessage />}
            {showEmpty && <EmptyMessage />}
            {!showSkeleton && !showError && !showEmpty && items.map((row) => (
              <SubmissionListRow key={row.id} submission={row} onRowClick={onRowClick} />
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ borderTop: `${dims.paginationBorderWidth}px solid ${dims.paginationBorderColor}` }}>
        <Pagination
          page={page}
          pageSize={pageSize}
          total={total}
          onPageChange={onPageChange}
          itemLabel="submissions"
        />
      </div>
    </div>
  );
}

// ── Data row ────────────────────────────────────────────────────────────────

function SubmissionListRow({
  submission,
  onRowClick,
}: {
  submission: Submission;
  onRowClick?: (id: string) => void;
}) {
  const stripeColor = submissionsRowStatusStripes[submission.status];
  const interactive = !!onRowClick;
  return (
    <tr
      tabIndex={interactive ? 0 : undefined}
      role={interactive ? 'button' : undefined}
      aria-label={interactive ? `Open submission ${submission.id}, ${submission.member}` : undefined}
      onClick={interactive ? () => onRowClick(submission.id) : undefined}
      onKeyDown={
        interactive
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onRowClick(submission.id);
              }
            }
          : undefined
      }
      className="ring-custom focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-vivid"
      style={{
        position:        'relative',
        minHeight:       dims.rowMinHeight,
        backgroundColor: dims.rowBg,
        borderBottom:    `${dims.rowBorderWidth}px solid ${dims.rowBorderColor}`,
        borderLeft:      `${dims.rowLeftStripeWidth}px solid ${stripeColor}`,
        cursor:          interactive ? 'pointer' : 'default',
      }}
    >
      <td style={cellPaddingStyle}><MemberCell submission={submission} /></td>
      <td style={cellPaddingStyle}><TypeCell submission={submission} /></td>
      <td style={cellPaddingStyle}><ProductChips products={submission.products ?? []} /></td>
      <td style={cellPaddingStyle}><StatusBadge status={submission.status} /></td>
      <td style={cellPaddingStyle}><PremiumCell submission={submission} /></td>
      <td style={cellPaddingStyle}><UnderwriterCell submission={submission} /></td>
      <td style={{ ...cellPaddingStyle, textAlign: 'center' }}><AppetiteText percent={submission.appetite ?? 0} /></td>
      <td style={cellPaddingStyle}><AgeCell days={submission.daysOpen ?? 0} /></td>
      <td style={cellPaddingStyle}><NeedByCell date={submission.needByDate} /></td>
      <td style={cellPaddingStyle}><EffectiveCell date={submission.effDate} /></td>
    </tr>
  );
}

// ── Member cell ─────────────────────────────────────────────────────────────

function MemberCell({ submission }: { submission: Submission }) {
  const brokerLabel = submission.broker ?? '—';
  return (
    <div className="flex items-start" style={{ gap: mc.rowGap }}>
      <div
        aria-hidden
        className="inline-flex items-center justify-center shrink-0"
        style={{
          width:           mc.iconBoxSize,
          height:          mc.iconBoxSize,
          backgroundColor: mc.iconBoxBg,
          border:          `${mc.iconBoxBorderWidth}px solid ${mc.iconBoxBorderColor}`,
        }}
      >
        <GraduationCap size={mc.iconSize} color={mc.iconColor} />
      </div>
      <div className="flex flex-col" style={{ gap: mc.blockGap, minWidth: 0 }}>
        <span
          title={submission.member}
          style={{ fontSize: mc.nameSize, fontWeight: mc.nameWeight, color: mc.nameColor, wordBreak: 'break-word' }}
        >
          {submission.member}
        </span>
        <div className="flex items-center" style={{ gap: mc.metaRowGap }}>
          <span
            className="inline-flex items-center shrink-0"
            style={{
              paddingLeft:     mc.subIdPaddingX,
              paddingRight:    mc.subIdPaddingX,
              paddingTop:      mc.subIdPaddingY,
              paddingBottom:   mc.subIdPaddingY,
              backgroundColor: mc.subIdBg,
              border:          `${mc.subIdBorderWidth}px solid ${mc.subIdBorderColor}`,
              fontSize:        mc.subIdSize,
              fontWeight:      mc.subIdWeight,
              color:           mc.subIdColor,
              lineHeight:      1,
              whiteSpace:      'nowrap',
            }}
          >
            {submission.id}
          </span>
          <span style={{ fontSize: mc.metaSize, fontWeight: mc.metaWeight, color: mc.metaColor }}>
            {submission.state}
          </span>
          <span aria-hidden style={{ color: mc.metaSeparatorColor }}>·</span>
          <span
            className="truncate"
            title={brokerLabel}
            style={{ fontSize: mc.metaSize, fontWeight: mc.metaWeight, color: mc.metaColor }}
          >
            {brokerLabel}
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Type cell ────────────────────────────────────────────────────────────────

function TypeCell({ submission }: { submission: Submission }) {
  if (!submission.submissionType) return <span style={{ color: colors.slate500, fontSize: tp.textSize }}>—</span>;
  return (
    <span
      className="inline-flex items-center"
      style={{
        backgroundColor: tp.bg,
        border:          `${tp.borderWidth}px solid ${tp.borderColor}`,
        color:           tp.textColor,
        fontSize:        tp.textSize,
        fontWeight:      tp.textWeight,
        paddingLeft:     tp.paddingX,
        paddingRight:    tp.paddingX,
        paddingTop:      tp.paddingY,
        paddingBottom:   tp.paddingY,
        lineHeight:      1.5,
        whiteSpace:      'nowrap',
      }}
    >
      {submissionTypeLabels[submission.submissionType]}
    </span>
  );
}

// ── Premium cell ────────────────────────────────────────────────────────────

function PremiumCell({ submission }: { submission: Submission }) {
  return (
    <div className="flex flex-col" style={{ gap: pc.rowGap }}>
      <span
        className="tabular-nums"
        style={{ fontSize: pc.amountSize, fontWeight: pc.amountWeight, color: pc.amountColor }}
      >
        {formatCurrency(submission.premium)}
      </span>
      {typeof submission.enrolled === 'number' && (
        <span style={{ fontSize: pc.subtitleSize, fontWeight: pc.subtitleWeight, color: pc.subtitleColor }}>
          {submission.enrolled.toLocaleString('en-US')} enrolled
        </span>
      )}
    </div>
  );
}

// ── Underwriter cell ────────────────────────────────────────────────────────

function UnderwriterCell({ submission }: { submission: Submission }) {
  if (submission.assigneeName === '' || submission.assigneeInitials === '') {
    return (
      <div className="inline-flex items-center" style={{ gap: unassignedStyles.gap }}>
        <AlertTriangle size={14} color={unassignedStyles.iconColor} aria-hidden />
        <span style={{ fontSize: unassignedStyles.textSize, fontWeight: unassignedStyles.textWeight, color: unassignedStyles.textColor }}>
          Unassigned
        </span>
      </div>
    );
  }
  return (
    <div className="inline-flex items-center" style={{ gap: ac.rowGap }}>
      <span
        aria-hidden
        className="inline-flex items-center justify-center"
        style={{
          width:           ac.avatarSize,
          height:          ac.avatarSize,
          backgroundColor: ac.avatarBg,
          color:           ac.avatarTextColor,
          fontSize:        ac.avatarTextSize,
          fontWeight:      ac.avatarTextWeight,
          flexShrink:      0,
        }}
      >
        {submission.assigneeInitials}
      </span>
      <span style={{ fontSize: ac.nameSize, fontWeight: ac.nameWeight, color: ac.nameColor }}>
        {submission.assigneeName}
      </span>
    </div>
  );
}

// ── Appetite text cell ──────────────────────────────────────────────────────

type AppetiteBand = 'favorable' | 'caution' | 'restricted';

function appetiteBand(percent: number): AppetiteBand {
  if (percent >= ats.greenThreshold) return 'favorable';
  if (percent >= ats.amberThreshold) return 'caution';
  return 'restricted';
}

function appetiteColor(band: AppetiteBand): string {
  if (band === 'favorable') return ats.colorGreen;
  if (band === 'caution') return ats.colorAmber;
  return ats.colorRed;
}

const APPETITE_LABEL: Record<AppetiteBand, string> = {
  favorable: 'In appetite',
  caution: 'Caution',
  restricted: 'Out of appetite',
};

function AppetiteText({ percent }: { percent: number }) {
  const band = appetiteBand(percent);
  const color = appetiteColor(band);
  const label = APPETITE_LABEL[band];
  const symbol = band === 'favorable' ? '●' : band === 'caution' ? '▲' : '■';
  return (
    <span
      aria-label={`${label}: ${percent}%`}
      className="tabular-nums"
      style={{
        fontSize:   ats.size,
        fontWeight: ats.weight,
        color,
        display:    'inline-flex',
        alignItems: 'center',
        gap:        4,
      }}
    >
      <span aria-hidden>{symbol}</span>
      {percent}%
    </span>
  );
}

// ── Age cell ────────────────────────────────────────────────────────────────

function severityForDays(days: number): DaysOpenSeverity {
  if (days >= daysOpenThresholds.critical) return 'critical';
  if (days >= daysOpenThresholds.warning)  return 'warning';
  return 'normal';
}

const AGE_LABEL: Record<DaysOpenSeverity, string> = {
  normal: 'On track',
  warning: 'Aging',
  critical: 'Critical',
};

function AgeCell({ days }: { days: number }) {
  const sev = severityForDays(days);
  const { color, weight } = daysOpenSeverityStyles[sev];
  const label = AGE_LABEL[sev];
  const showIcon = sev !== 'normal';
  return (
    <span
      aria-label={`${label}: ${days} days open`}
      className="inline-flex items-center gap-1 tabular-nums"
      style={{ fontSize: dc.daysSize, fontWeight: weight, color, whiteSpace: 'nowrap' }}
    >
      {showIcon && <AlertTriangle size={11} aria-hidden />}
      {days}d
    </span>
  );
}

// ── Need By cell ────────────────────────────────────────────────────────────

function formatNeedByDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function NeedByCell({ date }: { date?: string }) {
  if (!date) return <span style={{ fontSize: nbc.size, color: nbc.color }}>—</span>;
  return (
    <span
      className="tabular-nums"
      style={{ fontSize: nbc.size, fontWeight: nbc.weight, color: nbc.color, whiteSpace: 'nowrap' }}
    >
      {formatNeedByDate(date)}
    </span>
  );
}

// ── Effective cell ──────────────────────────────────────────────────────────

function formatEffectiveDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });
}

function EffectiveCell({ date }: { date?: string }) {
  return (
    <div className="inline-flex items-center tabular-nums" style={{ gap: ec.gap }}>
      <span style={{ fontSize: ec.size, fontWeight: ec.weight, color: ec.color }}>
        {date ? formatEffectiveDate(date) : '—'}
      </span>
      <ChevronRight size={ec.chevronSize} color={ec.chevronColor} aria-hidden />
    </div>
  );
}

// ── Skeleton + empty + error ────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <tr
      aria-hidden
      style={{
        minHeight:       dims.rowMinHeight,
        backgroundColor: dims.rowBg,
        borderBottom:    `${dims.rowBorderWidth}px solid ${dims.rowBorderColor}`,
      }}
    >
      {COLUMN_ORDER.map((col) => (
        <td key={col.key} style={cellPaddingStyle}>
          <div className="bg-neutral-200 animate-pulse" style={{ width: '60%', height: 14 }} />
        </td>
      ))}
    </tr>
  );
}

function EmptyMessage() {
  return (
    <tr>
      <td
        colSpan={COLUMN_ORDER.length}
        className="text-center"
        style={{ minHeight: dims.rowMinHeight * 2, padding: 32, color: colors.slate500, fontSize: 13 }}
      >
        No submissions match your filters.
      </td>
    </tr>
  );
}

function ErrorMessage() {
  return (
    <tr>
      <td
        colSpan={COLUMN_ORDER.length}
        className="text-center"
        style={{ minHeight: dims.rowMinHeight * 2, padding: 32, color: '#B91C1C', fontSize: 13 }}
      >
        Unable to load submissions. Refresh the page to try again.
      </td>
    </tr>
  );
}
