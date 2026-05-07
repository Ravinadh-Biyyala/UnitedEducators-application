import { ArrowLeft, ChevronRight, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  newSubmissionHeaderStyles    as h,
  newSubmissionBreadcrumbStyles as b,
} from '@/theme/tokens';

interface NewSubmissionHeaderProps {
  generatedName: string | null;
}

export function NewSubmissionHeader({ generatedName }: NewSubmissionHeaderProps) {
  return (
    <header data-testid="new-submission-header">
      {/* Blue band */}
      <div
        className="flex items-start justify-between"
        style={{
          backgroundColor: h.bg,
          borderTop:       `${h.accentStripHeight}px solid ${h.accentStripColor}`,
          paddingLeft:     h.paddingX,
          paddingRight:    h.paddingX,
          paddingTop:      h.paddingY,
          paddingBottom:   h.paddingY,
          minHeight:       h.height,
        }}
      >
        <div className="flex items-start" style={{ gap: 16 }}>
          {/* Back link */}
          <Link
            to="/submissions"
            className="inline-flex items-center cursor-pointer hover:opacity-80"
            style={{
              gap:        h.backLinkGap,
              fontSize:   h.backLinkFontSize,
              lineHeight: `${h.backLinkLineHeight}px`,
              fontWeight: h.backLinkFontWeight,
              color:      h.backLinkColor,
              textDecoration: 'none',
            }}
          >
            <ArrowLeft size={h.backLinkIconSize} aria-hidden />
            Submissions
          </Link>

          {/* Separator chevron */}
          <ChevronRight
            size={h.separatorIconSize}
            color={h.backLinkColor}
            aria-hidden
            style={{ marginTop: 2 }}
          />

          {/* Title block */}
          <div className="flex flex-col" style={{ gap: 2 }}>
            <h1
              className="m-0"
              style={{
                fontSize:   h.titleSize,
                lineHeight: `${h.titleLineHeight}px`,
                fontWeight: h.titleWeight,
                color:      h.titleColor,
              }}
            >
              Create New Submission
            </h1>
            <p
              className="m-0"
              style={{
                fontSize:   h.subtitleSize,
                lineHeight: `${h.subtitleLineHeight}px`,
                fontWeight: h.subtitleWeight,
                color:      h.subtitleColor,
              }}
            >
              Initiate the underwriting process · Complete all required fields
            </p>
          </div>
        </div>

        {/* Gold name pill (only when populated) */}
        {generatedName && (
          <span
            className="inline-flex items-center shrink-0"
            style={{
              gap:             h.pillGap,
              paddingLeft:     h.pillPaddingX,
              paddingRight:    h.pillPaddingX,
              paddingTop:      h.pillPaddingY,
              paddingBottom:   h.pillPaddingY,
              backgroundColor: h.pillBg,
              border:          `${h.pillBorderWidth}px solid ${h.pillBorderColor}`,
              minHeight:       h.pillHeight,
            }}
          >
            <FileText size={h.pillIconSize} color={h.pillIconColor} aria-hidden />
            <span
              style={{
                fontSize:   h.pillTextSize,
                lineHeight: `${h.pillTextLineHeight}px`,
                fontWeight: h.pillTextWeight,
                color:      h.pillTextColor,
              }}
            >
              {generatedName}
            </span>
          </span>
        )}
      </div>

      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center"
        style={{
          backgroundColor: b.bg,
          borderBottom:    `${b.borderBottomWidth}px solid ${b.borderBottomColor}`,
          paddingLeft:     b.paddingX,
          paddingRight:    b.paddingX,
          paddingTop:      b.paddingY,
          paddingBottom:   b.paddingY,
          gap:             b.itemGap,
        }}
      >
        <Link
          to="/dashboard"
          style={{
            fontSize:   b.linkSize,
            lineHeight: `${b.linkLineHeight}px`,
            fontWeight: b.linkWeight,
            color:      b.linkColor,
            textDecoration: 'none',
          }}
        >
          Dashboard
        </Link>
        <span
          aria-hidden
          style={{
            fontSize:   b.separatorSize,
            fontWeight: b.separatorWeight,
            color:      b.separatorColor,
          }}
        >
          {b.separatorChar}
        </span>
        <Link
          to="/submissions"
          style={{
            fontSize:   b.linkSize,
            lineHeight: `${b.linkLineHeight}px`,
            fontWeight: b.linkWeight,
            color:      b.linkColor,
            textDecoration: 'none',
          }}
        >
          Submissions
        </Link>
        <span
          aria-hidden
          style={{
            fontSize:   b.separatorSize,
            fontWeight: b.separatorWeight,
            color:      b.separatorColor,
          }}
        >
          {b.separatorChar}
        </span>
        <span
          aria-current="page"
          style={{
            fontSize:   b.currentSize,
            lineHeight: `${b.currentLineHeight}px`,
            fontWeight: b.currentWeight,
            color:      b.currentColor,
          }}
        >
          New Submission
        </span>
      </nav>
    </header>
  );
}
