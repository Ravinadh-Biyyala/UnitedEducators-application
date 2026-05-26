import type { InputHTMLAttributes } from 'react';
import { inputStyles, colors } from '@/theme/tokens';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /**
   * `'legacy'` (default) — original Tailwind utility-class look. Used by
   * dashboard / login forms. Keeps existing visuals untouched.
   * `'tokenized'` — N3+ tokenised chrome (height 38.8, slate300 0.8 border,
   * sharp corners, padding 9/11). Use this in N-track form sections.
   */
  variant?:    'legacy' | 'tokenized';
  /** Render a left-icon prefix slot (icon node positioned absolutely). */
  leftIcon?:   React.ReactNode;
  /** Render a right-icon slot (positioned absolutely). */
  rightIcon?:  React.ReactNode;
  /** Visually mute the value (used when "Auto-filled from contact"). */
  mutedValue?: boolean;
  /** When true, sets aria-invalid and renders an error-state border. */
  error?:      boolean;
}

export function Input({
  variant = 'legacy',
  leftIcon,
  rightIcon,
  mutedValue,
  error,
  className = '',
  style,
  'aria-invalid': ariaInvalidProp,
  ...rest
}: InputProps) {
  const ariaInvalid = error || ariaInvalidProp || undefined;
  const isInvalid = Boolean(ariaInvalid);

  if (variant === 'legacy') {
    return (
      <input
        aria-invalid={ariaInvalid}
        className={
          `block w-full rounded-md border px-3 py-2 text-sm ring-custom ` +
          `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-vivid ` +
          (isInvalid ? 'border-rose-500 ' : 'border-gray-300 ') +
          className
        }
        {...rest}
      />
    );
  }

  // tokenized
  const hasLeftIcon = Boolean(leftIcon);
  const borderColor = isInvalid ? colors.dangerRed : inputStyles.borderColor;

  return (
    <span
      className={`relative block w-full ${className}`}
      style={{ height: inputStyles.height }}
    >
      {leftIcon && (
        <span
          aria-hidden
          className="absolute pointer-events-none flex items-center justify-center"
          style={{
            left:   inputStyles.leftIconOffsetX,
            top:    inputStyles.leftIconOffsetY,
            width:  inputStyles.iconSize,
            height: inputStyles.iconSize,
            color:  inputStyles.iconColor,
          }}
        >
          {leftIcon}
        </span>
      )}
      <input
        {...rest}
        aria-invalid={ariaInvalid}
        className="ring-custom focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-vivid focus-visible:ring-offset-0"
        style={{
          width:           '100%',
          height:          '100%',
          backgroundColor: inputStyles.bg,
          border:          `${inputStyles.borderWidth}px solid ${borderColor}`,
          paddingLeft:     hasLeftIcon ? inputStyles.paddingXWithLeftIcon : inputStyles.paddingX,
          paddingRight:    rightIcon   ? inputStyles.paddingXWithLeftIcon : inputStyles.paddingX,
          paddingTop:      inputStyles.paddingY,
          paddingBottom:   inputStyles.paddingY,
          fontSize:        inputStyles.textSize,
          lineHeight:      `${inputStyles.textLineHeight}px`,
          fontWeight:      inputStyles.textWeight,
          color:           mutedValue ? inputStyles.filledMutedColor : inputStyles.textColor,
          outline:         'none',
          ...style,
        }}
      />
      {rightIcon && (
        <span
          aria-hidden
          className="absolute pointer-events-none flex items-center justify-center"
          style={{
            right:  inputStyles.rightIconOffsetX,
            top:    inputStyles.rightIconOffsetY,
            width:  inputStyles.iconSize,
            height: inputStyles.iconSize,
            color:  inputStyles.iconColor,
          }}
        >
          {rightIcon}
        </span>
      )}
    </span>
  );
}
