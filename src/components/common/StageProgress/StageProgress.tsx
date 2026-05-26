import { RequiredFieldsCounter } from '@/components/common/RequiredFieldsCounter';
import {
  stageProgressStyles as s,
  submissionStageLabels,
  STAGE_TIMELINE_DISPLAY_ORDER,
} from '@/theme/tokens';
import type { SubmissionStage } from '@/shared/types';

export type SubmissionRequiredField = 'account' | 'products' | 'needByDate' | 'effectiveDate';

interface StageProgressProps {
  currentStage:        SubmissionStage;
  completedFields:     SubmissionRequiredField[];
  totalRequiredFields: number;
}

const REQUIRED_FIELD_ORDER: SubmissionRequiredField[] = [
  'account',
  'products',
  'needByDate',
  'effectiveDate',
];

const REQUIRED_FIELD_LABELS: Record<SubmissionRequiredField, string> = {
  account:       'Account',
  products:      'Products',
  needByDate:    'Need By Date',
  effectiveDate: 'Effective Date',
};

export function StageProgress({
  currentStage,
  completedFields,
  totalRequiredFields,
}: StageProgressProps) {
  const completedCount  = completedFields.length;
  const allComplete     = completedCount === totalRequiredFields;
  const fillPercent     = totalRequiredFields === 0 ? 0 : (completedCount / totalRequiredFields) * 100;
  const pillText        = allComplete ? submissionStageLabels[currentStage] : s.pillIncompleteText;

  return (
    <div
      style={{
        paddingLeft:   s.bodyPaddingX,
        paddingRight:  s.bodyPaddingX,
        paddingTop:    s.bodyPaddingY,
        paddingBottom: s.bodyPaddingY,
      }}
    >
      {/* Top row: Current Stage + Required Fields counter */}
      <div className="flex items-start justify-between" style={{ gap: s.topRowGap }}>
        <div className="flex flex-col" style={{ minWidth: 0, flex: '1 1 auto' }}>
          <span
            style={{
              fontSize:   s.labelSize,
              lineHeight: `${s.labelLineHeight}px`,
              fontWeight: s.labelWeight,
              color:      s.labelColor,
            }}
          >
            Current Stage
          </span>
          <CurrentStagePill text={pillText} marginTop={s.pillMarginTop} />
        </div>
        <div className="flex flex-col items-end">
          <span
            style={{
              fontSize:   s.labelSize,
              lineHeight: `${s.labelLineHeight}px`,
              fontWeight: s.labelWeight,
              color:      s.labelColor,
            }}
          >
            Required Fields
          </span>
          <RequiredFieldsCounter completed={completedCount} total={totalRequiredFields} />
        </div>
      </div>

      {/* Progress bar */}
      <div
        role="progressbar"
        aria-valuenow={Math.round(fillPercent)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Required fields progress: ${completedCount} of ${totalRequiredFields} complete`}
        style={{
          marginTop:       s.progressBarMarginTop,
          height:          s.progressBarHeight,
          backgroundColor: s.progressBarTrackBg,
        }}
      >
        <div
          aria-hidden
          style={{
            width:           `${fillPercent}%`,
            height:          '100%',
            backgroundColor: s.progressBarFillColor,
          }}
        />
      </div>

      {/* Required-field checklist */}
      <div
        className="flex flex-col"
        style={{ marginTop: s.checklistMarginTop, gap: s.checklistRowGap }}
      >
        {REQUIRED_FIELD_ORDER.map((f) => (
          <ChecklistRow key={f} field={f} done={completedFields.includes(f)} />
        ))}
      </div>

      {/* Helper text block */}
      <div
        style={{
          marginTop:       s.helperMarginTop,
          paddingLeft:     s.helperPaddingX,
          paddingRight:    s.helperPaddingX,
          paddingTop:      s.helperPaddingY,
          paddingBottom:   s.helperPaddingY,
          backgroundColor: s.helperBg,
          border:          `${s.helperBorderWidth}px solid ${s.helperBorderColor}`,
        }}
      >
        <p
          className="m-0"
          style={{
            fontSize:   s.helperTextSize,
            lineHeight: `${s.helperTextLineHeight}px`,
            fontWeight: s.helperTextWeight,
            color:      s.helperTextColor,
          }}
        >
          {s.helperText}
        </p>
      </div>

      {/* Stage timeline */}
      <div
        className="flex flex-col"
        style={{ marginTop: s.timelineMarginTop, gap: s.timelineRowGap }}
      >
        {STAGE_TIMELINE_DISPLAY_ORDER.map((stage) => (
          <TimelineRow
            key={stage}
            stage={stage}
            isCurrent={stage === currentStage}
          />
        ))}
      </div>
    </div>
  );
}

// ── Internal subcomponents (not exported) ─────────────────────────────────

function CurrentStagePill({ text, marginTop }: { text: string; marginTop: number }) {
  return (
    <span
      className="inline-flex items-center"
      style={{
        marginTop,
        alignSelf:       'flex-start',
        gap:             s.pillGap,
        paddingLeft:     s.pillPaddingX,
        paddingRight:    s.pillPaddingX,
        paddingTop:      s.pillPaddingY,
        paddingBottom:   s.pillPaddingY,
        backgroundColor: s.pillBg,
        border:          `${s.pillBorderWidth}px solid ${s.pillBorderColor}`,
      }}
    >
      <span
        aria-hidden
        style={{
          width:           s.pillDotSize,
          height:          s.pillDotSize,
          borderRadius:    s.pillDotBorderRadius,
          backgroundColor: s.pillDotColor,
        }}
      />
      <span
        style={{
          fontSize:   s.pillTextSize,
          lineHeight: `${s.pillTextLineHeight}px`,
          fontWeight: s.pillTextWeight,
          color:      s.pillTextColor,
        }}
      >
        {text}
      </span>
    </span>
  );
}

function ChecklistRow({ field, done }: { field: SubmissionRequiredField; done: boolean }) {
  return (
    <div className="flex items-center" style={{ gap: s.checklistRowItemGap }}>
      <span
        aria-hidden
        className="inline-flex items-center justify-center"
        style={{
          width:           s.checklistBoxSize,
          height:          s.checklistBoxSize,
          backgroundColor: done ? s.checklistBoxCompleteBg     : s.checklistBoxIncompleteBg,
          border:          `${s.checklistBoxBorderWidth}px solid ${done ? s.checklistBoxCompleteBorder : s.checklistBoxIncompleteBorder}`,
        }}
      >
        {done && (
          <span
            style={{
              fontSize:   s.checklistCheckSize,
              lineHeight: `${s.checklistCheckLineHeight}px`,
              fontWeight: s.checklistCheckWeight,
              color:      s.checklistCheckColor,
            }}
          >
            ✓
          </span>
        )}
      </span>
      <span
        style={{
          fontSize:   s.checklistLabelSize,
          lineHeight: `${s.checklistLabelLineHeight}px`,
          fontWeight: s.checklistLabelWeight,
          color:      s.checklistLabelColor,
        }}
      >
        {REQUIRED_FIELD_LABELS[field]}
      </span>
    </div>
  );
}

function TimelineRow({ stage, isCurrent }: { stage: SubmissionStage; isCurrent: boolean }) {
  return (
    <div
      className="flex items-center justify-between"
      style={{
        gap:             s.timelineRowItemGap,
        paddingLeft:     s.timelineRowPaddingX,
        paddingRight:    s.timelineRowPaddingX,
        paddingTop:      s.timelineRowPaddingY,
        paddingBottom:   s.timelineRowPaddingY,
        backgroundColor: isCurrent ? s.timelineCurrentBg : 'transparent',
        border:          `${s.timelineCurrentBorderWidth}px solid ${isCurrent ? s.timelineCurrentBorderColor : 'transparent'}`,
      }}
    >
      <div className="flex items-center" style={{ gap: s.timelineRowItemGap, minWidth: 0 }}>
        <span
          aria-hidden
          style={{
            width:           s.timelineDotSize,
            height:          s.timelineDotSize,
            borderRadius:    s.timelineDotBorderRadius,
            backgroundColor: isCurrent ? s.timelineCurrentDotColor : s.timelinePendingDotColor,
            flexShrink:      0,
          }}
        />
        <span
          style={{
            fontSize:   isCurrent ? s.timelineCurrentLabelSize       : s.timelinePendingLabelSize,
            lineHeight: `${isCurrent ? s.timelineCurrentLabelLineHeight : s.timelinePendingLabelLineHeight}px`,
            fontWeight: isCurrent ? s.timelineCurrentLabelWeight     : s.timelinePendingLabelWeight,
            color:      isCurrent ? s.timelineCurrentLabelColor      : s.timelinePendingLabelColor,
          }}
        >
          {submissionStageLabels[stage]}
        </span>
      </div>
      {isCurrent && (
        <span
          style={{
            fontSize:   s.timelineCurrentRightTextSize,
            lineHeight: `${s.timelineCurrentRightTextLineHeight}px`,
            fontWeight: s.timelineCurrentRightTextWeight,
            color:      s.timelineCurrentRightTextColor,
          }}
        >
          {s.timelineCurrentRightText}
        </span>
      )}
    </div>
  );
}
