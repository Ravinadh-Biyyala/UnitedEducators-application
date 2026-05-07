import { Check, Plus, Repeat, RefreshCw } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import {
  submissionTypeCardStyles as s,
  submissionTypeCardData,
  submissionTypeLabels,
} from '@/theme/tokens';
import type { SubmissionType } from '@/shared/types';

interface SubmissionTypeCardProps {
  type:     SubmissionType;
  selected: boolean;
  onClick:  () => void;
}

const ICON_MAP: Record<'Plus' | 'Repeat' | 'RefreshCw', LucideIcon> = {
  Plus,
  Repeat,
  RefreshCw,
};

export function SubmissionTypeCard({ type, selected, onClick }: SubmissionTypeCardProps) {
  const data = submissionTypeCardData[type];
  const Icon = ICON_MAP[data.iconName];

  const bg          = selected ? s.selectedBg          : s.defaultBg;
  const borderColor = selected ? s.selectedBorder      : s.defaultBorder;
  const titleColor  = selected ? s.selectedTitleColor  : s.defaultTitleColor;

  const iconBoxBg     = selected ? s.selectedIconBoxBg     : s.defaultIconBoxBg;
  const iconBoxBorder = selected ? s.selectedIconBoxBorder : s.defaultIconBoxBorder;
  const iconColor     = selected ? s.selectedIconColor     : s.defaultIconColor;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      aria-label={`Select ${submissionTypeLabels[type]}`}
      className="flex flex-col items-start text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      style={{
        flex:            '1 1 0',
        minWidth:        0,
        backgroundColor: bg,
        border:          `${s.borderWidth}px solid ${borderColor}`,
        paddingLeft:     s.paddingX,
        paddingRight:    s.paddingX,
        paddingTop:      s.paddingY,
        paddingBottom:   s.paddingY,
      }}
    >
      <div
        aria-hidden
        className="inline-flex items-center justify-center"
        style={{
          width:           s.iconBoxSize,
          height:          s.iconBoxSize,
          backgroundColor: iconBoxBg,
          border:          `${s.iconBoxBorderWidth}px solid ${iconBoxBorder}`,
        }}
      >
        <Icon size={s.iconSize} color={iconColor} />
      </div>

      <span
        style={{
          marginTop:  s.titleMarginTop,
          fontSize:   s.titleSize,
          lineHeight: `${s.titleLineHeight}px`,
          fontWeight: s.titleWeight,
          color:      titleColor,
        }}
      >
        {data.title}
      </span>

      <span
        style={{
          marginTop:  s.descriptionMarginTop,
          fontSize:   s.descriptionSize,
          lineHeight: `${s.descriptionLineHeight}px`,
          fontWeight: s.descriptionWeight,
          color:      s.descriptionColor,
        }}
      >
        {data.description}
      </span>

      {selected && (
        <span
          className="inline-flex items-center"
          style={{
            marginTop:     s.selectedIndicatorMarginTop,
            gap:           s.selectedIndicatorGap,
            fontSize:      s.selectedIndicatorTextSize,
            lineHeight:    `${s.selectedIndicatorTextLineHeight}px`,
            fontWeight:    s.selectedIndicatorTextWeight,
            letterSpacing: s.selectedIndicatorTextLetterSpacing,
            textTransform: 'uppercase',
            color:         s.selectedIndicatorTextColor,
          }}
        >
          <Check size={s.selectedIndicatorIconSize} aria-hidden />
          {s.selectedIndicatorText}
        </span>
      )}
    </button>
  );
}
