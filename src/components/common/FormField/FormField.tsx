import type { ReactNode } from 'react';
import { formFieldStyles as f } from '@/theme/tokens';

interface Props {
  label:           string;
  error?:          string;
  /** Renders a red asterisk after the label when true. */
  required?:       boolean;
  /** Helper text shown below the field (suppressed when `error` is set). */
  helper?:         ReactNode;
  /** When true, helper renders in `colors.greenAssigned` (e.g. "Auto-filled below"). */
  helperVariant?:  'neutral' | 'success';
  labelClassName?: string;
  children:        ReactNode;
}

export function FormField({
  label,
  error,
  required,
  helper,
  helperVariant = 'neutral',
  labelClassName,
  children,
}: Props) {
  const useTokens = labelClassName === undefined;

  return (
    <label className="block">
      {useTokens ? (
        <span
          className="inline-flex items-center"
          style={{
            gap:           f.labelGap,
            fontSize:      f.labelSize,
            lineHeight:    `${f.labelLineHeight}px`,
            fontWeight:    f.labelWeight,
            letterSpacing: f.labelLetterSpacing,
            textTransform: 'uppercase',
            color:         f.labelColor,
          }}
        >
          {label}
          {required && (
            <span
              aria-hidden
              style={{
                color:      f.asteriskColor,
                fontSize:   f.asteriskSize,
                fontWeight: f.asteriskWeight,
              }}
            >
              *
            </span>
          )}
        </span>
      ) : (
        <span className={labelClassName}>{label}</span>
      )}
      <div style={{ marginTop: f.labelMarginBottom }}>{children}</div>
      {error ? (
        <span
          style={{
            display:    'block',
            marginTop:  f.helperMarginTop,
            fontSize:   f.helperSize,
            lineHeight: `${f.helperLineHeight}px`,
            fontWeight: f.helperWeight,
            color:      'rgb(220, 38, 38)',
          }}
        >
          {error}
        </span>
      ) : helper ? (
        <span
          style={{
            display:    'block',
            marginTop:  f.helperMarginTop,
            fontSize:   f.helperSize,
            lineHeight: `${f.helperLineHeight}px`,
            fontWeight: f.helperWeight,
            color:      helperVariant === 'success' ? f.helperColorSuccess : f.helperColor,
          }}
        >
          {helper}
        </span>
      ) : null}
    </label>
  );
}
