import type { InputHTMLAttributes } from 'react';
import { inputStyles } from '@/theme/tokens';

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
}

export function Input({
  variant = 'legacy',
  leftIcon,
  rightIcon,
  mutedValue,
  className = '',
  style,
  ...rest
}: InputProps) {
  if (variant === 'legacy') {
    return (
      <input
        className={`block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand ${className}`}
        {...rest}
      />
    );
  }

  // tokenized
  const hasLeftIcon = Boolean(leftIcon);
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
        style={{
          width:           '100%',
          height:          '100%',
          backgroundColor: inputStyles.bg,
          border:          `${inputStyles.borderWidth}px solid ${inputStyles.borderColor}`,
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
