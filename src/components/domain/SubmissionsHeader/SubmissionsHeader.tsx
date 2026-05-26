import { Download, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  colors,
  submissionsRouteDims,
  submissionsHeaderTileStyles,
  submissionsHeaderTitleStyles,
  submissionsHeaderButtonStyles,
  submissionsHeaderChromeStyles,
  submissionsHeaderTileFormat,
  submissionsHeaderTileLabels,
  SUBMISSIONS_HEADER_TILES_DISPLAY_ORDER,
  type SubmissionsHeaderTileKey,
} from '@/theme/tokens';
import { formatCurrency } from '@/shared/utils';
import type { SubmissionsHeaderStats } from '@/shared/types';

interface SubmissionsHeaderProps {
  stats?:    SubmissionsHeaderStats;
  isLoading?: boolean;
}

export function SubmissionsHeader({ stats, isLoading }: SubmissionsHeaderProps) {
  const tileSeparator = `${submissionsHeaderChromeStyles.separatorWidth}px solid ${submissionsHeaderChromeStyles.separatorColor}`;
  const showSkeleton = isLoading || !stats;

  return (
    <header
      data-testid="submissions-header"
      className="flex flex-col"
      style={{ backgroundColor: colors.brandBlue }}
    >
      <div
        aria-hidden
        style={{
          height:     submissionsHeaderChromeStyles.goldStripHeight,
          background: submissionsHeaderChromeStyles.goldStripGradient,
        }}
      />

      <div
        className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"
        style={{
          paddingLeft:   submissionsRouteDims.headerBandPaddingX,
          paddingRight:  submissionsRouteDims.headerBandPaddingX,
          paddingTop:    submissionsRouteDims.headerBandPaddingY,
          paddingBottom: submissionsRouteDims.headerBandPaddingY,
        }}
      >
        <TitleBlock totalSubmissions={stats?.totalSubmissions ?? 0} />
        <div className="flex shrink-0" style={{ gap: submissionsHeaderButtonStyles.rowGap }}>
          <ExportButton />
          <NewSubmissionButton />
        </div>
      </div>

      <div
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5"
        style={{
          borderTop: tileSeparator,
          minHeight: submissionsHeaderChromeStyles.tilesRowMinHeight,
        }}
      >
        {SUBMISSIONS_HEADER_TILES_DISPLAY_ORDER.map((key, idx) => {
          const isLast = idx === SUBMISSIONS_HEADER_TILES_DISPLAY_ORDER.length - 1;
          return showSkeleton
            ? <HeaderKpiSkeleton key={key} isLast={isLast} />
            : <HeaderKpiTile    key={key} tileKey={key} value={stats[key]} isLast={isLast} />;
        })}
      </div>
    </header>
  );
}

function TitleBlock({ totalSubmissions }: { totalSubmissions: number }) {
  return (
    <div className="flex flex-col" style={{ gap: submissionsHeaderTitleStyles.rowGap }}>
      <h1
        className="m-0"
        style={{
          fontSize:   submissionsHeaderTitleStyles.titleSize,
          fontWeight: submissionsHeaderTitleStyles.titleWeight,
          color:      submissionsHeaderTitleStyles.titleColor,
          lineHeight: 1.2,
        }}
      >
        Submissions
      </h1>
      <p
        className="m-0"
        style={{
          fontSize:   submissionsHeaderTitleStyles.subtitleSize,
          fontWeight: submissionsHeaderTitleStyles.subtitleWeight,
          color:      submissionsHeaderTitleStyles.subtitleColor,
          lineHeight: 1.5,
        }}
      >
        Education insurance underwriting pipeline · {totalSubmissions} total submissions
      </p>
    </div>
  );
}

function ExportButton() {
  return (
    <button
      type="button"
      aria-label="Export submissions"
      className="inline-flex items-center justify-center cursor-pointer transition-opacity hover:opacity-90 ring-custom focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-vivid"
      style={{
        width:           submissionsHeaderButtonStyles.exportWidth,
        height:          submissionsHeaderButtonStyles.exportHeight,
        paddingLeft:     submissionsHeaderButtonStyles.exportPaddingX,
        paddingRight:    submissionsHeaderButtonStyles.exportPaddingX,
        paddingTop:      submissionsHeaderButtonStyles.exportPaddingY,
        paddingBottom:   submissionsHeaderButtonStyles.exportPaddingY,
        backgroundColor: submissionsHeaderButtonStyles.exportBg,
        border:          `${submissionsHeaderButtonStyles.exportBorderWidth}px solid ${submissionsHeaderButtonStyles.exportBorderColor}`,
        color:           submissionsHeaderButtonStyles.exportTextColor,
        fontSize:        submissionsHeaderButtonStyles.fontSize,
        fontWeight:      submissionsHeaderButtonStyles.exportTextWeight,
        gap:             submissionsHeaderButtonStyles.iconTextGap,
      }}
    >
      <Download size={submissionsHeaderButtonStyles.iconSize} />
      Export
    </button>
  );
}

function NewSubmissionButton() {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      aria-label="Create new submission"
      onClick={() => navigate('/submissions/new')}
      className="inline-flex items-center justify-center cursor-pointer transition-opacity hover:opacity-90 ring-custom focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-vivid"
      style={{
        width:           submissionsHeaderButtonStyles.newSubmissionWidth,
        height:          submissionsHeaderButtonStyles.newSubmissionHeight,
        paddingLeft:     submissionsHeaderButtonStyles.newSubmissionPaddingX,
        paddingRight:    submissionsHeaderButtonStyles.newSubmissionPaddingX,
        paddingTop:      submissionsHeaderButtonStyles.newSubmissionPaddingY,
        paddingBottom:   submissionsHeaderButtonStyles.newSubmissionPaddingY,
        backgroundColor: submissionsHeaderButtonStyles.newSubmissionBg,
        color:           submissionsHeaderButtonStyles.newSubmissionTextColor,
        fontSize:        submissionsHeaderButtonStyles.fontSize,
        fontWeight:      submissionsHeaderButtonStyles.newSubmissionTextWeight,
        gap:             submissionsHeaderButtonStyles.iconTextGap,
        boxShadow:       submissionsHeaderButtonStyles.newSubmissionShadow,
        border:          'none',
      }}
    >
      <Plus size={submissionsHeaderButtonStyles.iconSize} />
      New Submission
    </button>
  );
}

interface HeaderKpiTileProps {
  tileKey: SubmissionsHeaderTileKey;
  value:   number;
  isLast:  boolean;
}

function HeaderKpiTile({ tileKey, value, isLast }: HeaderKpiTileProps) {
  const formatter = submissionsHeaderTileFormat[tileKey];
  const display   = formatter === 'currency' ? formatCurrency(value) : String(value);
  return (
    <div
      className="flex flex-col justify-center"
      style={{
        minHeight:     submissionsHeaderTileStyles.height,
        paddingLeft:   submissionsHeaderTileStyles.paddingX,
        paddingRight:  submissionsHeaderTileStyles.paddingX,
        paddingTop:    submissionsHeaderTileStyles.paddingY,
        paddingBottom: submissionsHeaderTileStyles.paddingY,
        gap:           submissionsHeaderTileStyles.gap,
        borderRight:   isLast
          ? undefined
          : `${submissionsHeaderChromeStyles.separatorWidth}px solid ${submissionsHeaderChromeStyles.separatorColor}`,
      }}
    >
      <span
        style={{
          fontSize:   submissionsHeaderTileStyles.labelSize,
          fontWeight: submissionsHeaderTileStyles.labelWeight,
          color:      submissionsHeaderTileStyles.labelColor,
        }}
      >
        {submissionsHeaderTileLabels[tileKey]}
      </span>
      <span
        style={{
          fontSize:   submissionsHeaderTileStyles.valueSize,
          fontWeight: submissionsHeaderTileStyles.valueWeight,
          color:      submissionsHeaderTileStyles.valueColor,
        }}
      >
        {display}
      </span>
    </div>
  );
}

function HeaderKpiSkeleton({ isLast }: { isLast: boolean }) {
  return (
    <div
      className="flex flex-col justify-center"
      style={{
        minHeight:     submissionsHeaderTileStyles.height,
        paddingLeft:   submissionsHeaderTileStyles.paddingX,
        paddingRight:  submissionsHeaderTileStyles.paddingX,
        paddingTop:    submissionsHeaderTileStyles.paddingY,
        paddingBottom: submissionsHeaderTileStyles.paddingY,
        gap:           submissionsHeaderTileStyles.gap,
        borderRight:   isLast
          ? undefined
          : `${submissionsHeaderChromeStyles.separatorWidth}px solid ${submissionsHeaderChromeStyles.separatorColor}`,
      }}
    >
      <div
        className="bg-white/10 animate-pulse rounded-sm"
        style={{ height: submissionsHeaderTileStyles.labelSize, width: '55%' }}
      />
      <div
        className="bg-white/10 animate-pulse rounded-sm"
        style={{ height: submissionsHeaderTileStyles.valueSize, width: '35%' }}
      />
    </div>
  );
}
