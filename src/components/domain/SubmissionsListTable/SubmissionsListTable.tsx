import { AlertTriangle, ChevronRight, GraduationCap } from 'lucide-react';
import { Pagination, SortableColumnHeader } from '@/components/common';
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

export function SubmissionsListTable({
  response,
  isLoading,
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
  const showEmpty    = !isLoading && items.length === 0;

  const handleSort = (field: string) => {
    const direction: 'asc' | 'desc' =
      sort.field === field && sort.direction === 'desc' ? 'asc' : 'desc';
    onSortChange({ field: field as SubmissionsSortField, direction });
  };

  return (
    <div className="bg-white">
      <div className="overflow-x-auto">
        <div role="table" style={{ minWidth: 'max-content' }}>
          <HeaderRow sort={sort} onSortChange={handleSort} />
          <div role="rowgroup">
            {showSkeleton && Array.from({ length: pageSize }).map((_, i) => <SkeletonRow key={i} />)}
            {showEmpty && <EmptyMessage />}
            {!showSkeleton && !showEmpty && items.map((row) => (
              <SubmissionListRow key={row.id} submission={row} onRowClick={onRowClick} />
            ))}
          </div>
        </div>
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

// ── Header row ──────────────────────────────────────────────────────────────

function HeaderRow({
  sort,
  onSortChange,
}: {
  sort:         SubmissionsSort;
  onSortChange: (field: string) => void;
}) {
  return (
    <div
      role="row"
      className="flex"
      style={{
        height:          dims.headerHeight,
        backgroundColor: dims.headerBg,
        borderBottom:    `${dims.headerBorderWidth}px solid ${dims.headerBorderColor}`,
      }}
    >
      {COLUMN_ORDER.map((col) => (
        <div
          key={col.key}
          role="columnheader"
          className="flex items-center"
          style={{
            width:        dims.colWidths[col.key],
            flexShrink:   0,
            paddingLeft:  dims.headerPaddingX,
            paddingRight: dims.headerPaddingX,
          }}
        >
          {col.sortField ? (
            <SortableColumnHeader
              label={col.label}
              sortKey={col.sortField}
              currentField={sort.field}
              currentDirection={sort.direction}
              onSortChange={onSortChange}
              align={col.align}
            />
          ) : (
            <span
              style={{
                fontSize:      dims.headerFontSize,
                fontWeight:    dims.headerFontWeight,
                color:         dims.headerInactiveColor,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                display:       'block',
                width:         '100%',
                textAlign:     col.align ?? 'left',
              }}
            >
              {col.label}
            </span>
          )}
        </div>
      ))}
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
  return (
    <div
      role="row"
      className="relative flex items-center"
      onClick={() => onRowClick?.(submission.id)}
      style={{
        minHeight:       dims.rowMinHeight,
        backgroundColor: dims.rowBg,
        borderBottom:    `${dims.rowBorderWidth}px solid ${dims.rowBorderColor}`,
        cursor:          onRowClick ? 'pointer' : 'default',
      }}
    >
      <div
        aria-hidden
        style={{
          position:        'absolute',
          left:            0,
          top:             0,
          bottom:          0,
          width:           dims.rowLeftStripeWidth,
          backgroundColor: stripeColor,
        }}
      />
      <Cell width={dims.colWidths.memberInstitution}><MemberCell submission={submission} /></Cell>
      <Cell width={dims.colWidths.type}><TypeCell submission={submission} /></Cell>
      <Cell width={dims.colWidths.products}><ProductChips products={submission.products ?? []} /></Cell>
      <Cell width={dims.colWidths.stage}><StatusBadge status={submission.status} /></Cell>
      <Cell width={dims.colWidths.premium}><PremiumCell submission={submission} /></Cell>
      <Cell width={dims.colWidths.underwriter}><UnderwriterCell submission={submission} /></Cell>
      <Cell width={dims.colWidths.appetite}><AppetiteText percent={submission.appetite ?? 0} /></Cell>
      <Cell width={dims.colWidths.age}><AgeCell days={submission.daysOpen ?? 0} /></Cell>
      <Cell width={dims.colWidths.needBy}><NeedByCell date={submission.needByDate} /></Cell>
      <Cell width={dims.colWidths.effective}><EffectiveCell date={submission.effDate} /></Cell>
    </div>
  );
}

function Cell({ width, children }: { width: string; children: React.ReactNode }) {
  return (
    <div
      role="cell"
      className="flex items-center"
      style={{
        width,
        flexShrink:    0,
        paddingLeft:   dims.cellPaddingX,
        paddingRight:  dims.cellPaddingX,
        paddingTop:    dims.cellPaddingY,
        paddingBottom: dims.cellPaddingY,
      }}
    >
      {children}
    </div>
  );
}

// ── Member cell ─────────────────────────────────────────────────────────────

function MemberCell({ submission }: { submission: Submission }) {
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
          className="truncate"
          style={{ fontSize: mc.nameSize, fontWeight: mc.nameWeight, color: mc.nameColor }}
          title={submission.member}
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
            style={{ fontSize: mc.metaSize, fontWeight: mc.metaWeight, color: mc.metaColor }}
          >
            {submission.broker ?? '—'}
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
      <span style={{ fontSize: pc.amountSize, fontWeight: pc.amountWeight, color: pc.amountColor }}>
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

function appetiteColor(percent: number): string {
  if (percent >= ats.greenThreshold) return ats.colorGreen;
  if (percent >= ats.amberThreshold) return ats.colorAmber;
  return ats.colorRed;
}

function AppetiteText({ percent }: { percent: number }) {
  return (
    <span
      style={{
        fontSize:   ats.size,
        fontWeight: ats.weight,
        color:      appetiteColor(percent),
        textAlign: 'left',
        display:    'block',
        width:      '100%',
      }}
    >
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

function AgeCell({ days }: { days: number }) {
  const sev = severityForDays(days);
  const { color, weight } = daysOpenSeverityStyles[sev];
  return (
    <span style={{ fontSize: dc.daysSize, fontWeight: weight, color, whiteSpace: 'nowrap' }}>
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
    <span style={{ fontSize: nbc.size, fontWeight: nbc.weight, color: nbc.color, whiteSpace: 'nowrap' }}>
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
    <div className="inline-flex items-center" style={{ gap: ec.gap }}>
      <span style={{ fontSize: ec.size, fontWeight: ec.weight, color: ec.color }}>
        {date ? formatEffectiveDate(date) : '—'}
      </span>
      <ChevronRight size={ec.chevronSize} color={ec.chevronColor} aria-hidden />
    </div>
  );
}

// ── Skeleton + empty ────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <div
      role="row"
      className="relative flex items-center"
      style={{
        minHeight:       dims.rowMinHeight,
        backgroundColor: dims.rowBg,
        borderBottom:    `${dims.rowBorderWidth}px solid ${dims.rowBorderColor}`,
      }}
    >
      {COLUMN_ORDER.map((col) => (
        <Cell key={col.key} width={dims.colWidths[col.key]}>
          <div className="bg-neutral-200 animate-pulse" style={{ width: '60%', height: 14 }} />
        </Cell>
      ))}
    </div>
  );
}

function EmptyMessage() {
  return (
    <div
      role="row"
      className="flex items-center justify-center"
      style={{ minHeight: dims.rowMinHeight * 2, color: colors.slate500, fontSize: 13 }}
    >
      No submissions match your filters.
    </div>
  );
}
