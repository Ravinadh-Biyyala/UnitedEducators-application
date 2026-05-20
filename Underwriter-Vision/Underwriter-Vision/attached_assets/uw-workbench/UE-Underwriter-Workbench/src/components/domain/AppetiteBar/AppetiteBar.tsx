import { appetiteBarStyles as bs, appetiteVisualForPercent } from '@/theme/tokens';

export interface AppetiteBarProps {
  percent: number;
}

/**
 * Track + fill + percent label. Fill color flips green↔amber at the
 * threshold defined in `appetiteBarStyles.greenThreshold` (Figma sample
 * shows ≥85% green, <85% amber — the helper isolates the threshold so
 * components don't repeat it). NO border radius — Figma absent.
 */
export function AppetiteBar({ percent }: AppetiteBarProps) {
  const clamped = Math.max(0, Math.min(100, percent));
  const visual  = appetiteVisualForPercent(clamped);

  return (
    <div
      className="inline-flex items-center"
      style={{ width: bs.width, gap: bs.gap }}
    >
      <div
        className="relative"
        style={{
          width:           bs.trackWidth,
          height:          bs.trackHeight,
          backgroundColor: bs.trackBg,
          flexShrink:      0,
        }}
      >
        <div
          style={{
            width:           `${clamped}%`,
            height:          '100%',
            backgroundColor: visual.fill,
          }}
        />
      </div>
      <span
        style={{
          fontSize:   bs.labelSize,
          fontWeight: bs.labelWeight,
          color:      visual.label,
          textAlign:  'right',
          minWidth:   30,
        }}
      >
        {clamped}%
      </span>
    </div>
  );
}
