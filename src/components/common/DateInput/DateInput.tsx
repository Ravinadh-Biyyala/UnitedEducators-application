import { Calendar } from 'lucide-react';
import type { ChangeEvent } from 'react';
import { dateInputStyles as d, inputStyles } from '@/theme/tokens';

interface DateInputProps {
  value:    string;                              // ISO YYYY-MM-DD
  onChange: (next: string) => void;
  min?:     string;
  max?:     string;
  ariaLabel?: string;
}

export function DateInput({ value, onChange, min, max, ariaLabel }: DateInputProps) {
  const handle = (e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value);
  return (
    <span
      className="relative block w-full"
      style={{ height: inputStyles.height }}
    >
      <span
        aria-hidden
        className="absolute pointer-events-none flex items-center justify-center"
        style={{
          left:   d.iconLeftOffset,
          top:    d.iconTopOffset,
          width:  d.iconSize,
          height: d.iconSize,
          color:  inputStyles.iconColor,
        }}
      >
        <Calendar size={d.iconSize} />
      </span>
      <input
        type="date"
        value={value}
        onChange={handle}
        min={min}
        max={max}
        aria-label={ariaLabel}
        style={{
          width:           '100%',
          height:          '100%',
          backgroundColor: inputStyles.bg,
          border:          `${inputStyles.borderWidth}px solid ${inputStyles.borderColor}`,
          paddingLeft:     d.nativeInputPaddingLeft,
          paddingRight:    inputStyles.paddingX,
          paddingTop:      inputStyles.paddingY,
          paddingBottom:   inputStyles.paddingY,
          fontSize:        inputStyles.textSize,
          lineHeight:      `${inputStyles.textLineHeight}px`,
          fontWeight:      value ? 500 : inputStyles.placeholderWeight,
          color:           value ? inputStyles.textColor : inputStyles.placeholderColor,
          outline:         'none',
          appearance:      'none',
        }}
      />
    </span>
  );
}
