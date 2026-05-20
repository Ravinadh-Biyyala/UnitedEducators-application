import { Check, ChevronDown, X } from 'lucide-react';
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { useFloating, autoUpdate, flip, shift, offset, size } from '@floating-ui/react';
import {
  inputStyles,
  multiSelectStyles as ms,
  selectStyles as s,
} from '@/theme/tokens';

export interface MultiSelectOption<TId extends string = string> {
  id:    TId;
  label: string;
}

interface MultiSelectProps<TId extends string = string> {
  value:        TId[];
  onChange:     (next: TId[]) => void;
  options:      MultiSelectOption<TId>[];
  placeholder?: string;
  ariaLabel?:   string;
}

export function MultiSelect<TId extends string = string>({
  value,
  onChange,
  options,
  placeholder,
  ariaLabel,
}: MultiSelectProps<TId>) {
  const [open, setOpen] = useState(false);
  const triggerRef      = useRef<HTMLButtonElement | null>(null);
  const dropdownRef     = useRef<HTMLDivElement | null>(null);
  const dropdownId      = useId();

  const valueSet     = useMemo(() => new Set(value), [value]);
  const selectedOpts = useMemo(
    () => options.filter((o) => valueSet.has(o.id)),
    [options, valueSet],
  );

  const { refs, floatingStyles } = useFloating({
    open,
    onOpenChange: setOpen,
    whileElementsMounted: autoUpdate,
    placement: 'bottom-start',
    strategy: 'fixed',
    middleware: [
      offset(4),
      flip({ fallbackPlacements: ['top-start'] }),
      shift({ padding: 8 }),
      size({
        apply({ rects, availableHeight, elements }) {
          Object.assign(elements.floating.style, {
            width:     `${rects.reference.width}px`,
            maxHeight: `${Math.min(availableHeight - 8, s.dropdownMaxHeight)}px`,
          });
        },
      }),
    ],
  });

  useEffect(() => {
    if (!open) return;
    const onMouseDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t) || dropdownRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Tab') setOpen(false);
    };
    const onScroll = () => setOpen(false);
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('keydown', onKey);
    window.addEventListener('scroll', onScroll, { capture: true, passive: true });
    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', onScroll, { capture: true });
    };
  }, [open]);

  const toggle = (id: TId) => {
    if (valueSet.has(id)) {
      onChange(value.filter((v) => v !== id));
    } else {
      onChange([...value, id]);
    }
  };

  const removeChip = (id: TId, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(value.filter((v) => v !== id));
  };

  return (
    <div>
      <button
        ref={(el) => { triggerRef.current = el; refs.setReference(el); }}
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? dropdownId : undefined}
        onClick={() => setOpen((o) => !o)}
        className="relative w-full text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        style={{
          minHeight:       inputStyles.height,
          backgroundColor: inputStyles.bg,
          border:          `${inputStyles.borderWidth}px solid ${inputStyles.borderColor}`,
          paddingLeft:     inputStyles.paddingX,
          paddingRight:    inputStyles.paddingXWithLeftIcon,
          paddingTop:      inputStyles.paddingY,
          paddingBottom:   inputStyles.paddingY,
        }}
      >
        {selectedOpts.length === 0 ? (
          <span
            style={{
              fontSize:   inputStyles.placeholderSize,
              lineHeight: `${inputStyles.placeholderLineHeight}px`,
              fontWeight: inputStyles.placeholderWeight,
              color:      inputStyles.placeholderColor,
            }}
          >
            {placeholder ?? ''}
          </span>
        ) : (
          <span className="flex flex-wrap" style={{ gap: ms.chipsRowGap }}>
            {selectedOpts.map((o) => (
              <span
                key={o.id}
                className="inline-flex items-center"
                style={{
                  gap:             ms.chipGap,
                  paddingLeft:     ms.chipPaddingX,
                  paddingRight:    ms.chipPaddingX,
                  paddingTop:      ms.chipPaddingY,
                  paddingBottom:   ms.chipPaddingY,
                  backgroundColor: ms.chipBg,
                  border:          `${ms.chipBorderWidth}px solid ${ms.chipBorderColor}`,
                  fontSize:        ms.chipTextSize,
                  lineHeight:      `${ms.chipTextLineHeight}px`,
                  fontWeight:      ms.chipTextWeight,
                  color:           ms.chipTextColor,
                }}
              >
                {o.label}
                <span
                  role="button"
                  aria-label={`Remove ${o.label}`}
                  tabIndex={0}
                  onClick={(e) => removeChip(o.id, e)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      e.stopPropagation();
                      onChange(value.filter((v) => v !== o.id));
                    }
                  }}
                  className="inline-flex items-center justify-center cursor-pointer"
                >
                  <X size={ms.chipCloseIconSize} color={ms.chipCloseColor} />
                </span>
              </span>
            ))}
          </span>
        )}

        <ChevronDown
          aria-hidden
          size={s.chevronSize}
          color={s.chevronColor}
          style={{
            position: 'absolute',
            right:    inputStyles.rightIconOffsetX,
            top:      inputStyles.rightIconOffsetY,
            transition: 'transform 120ms',
            transform: open ? 'rotate(180deg)' : 'rotate(0)',
          }}
        />
      </button>

      {value.length > 0 && (
        <span
          style={{
            display:       'block',
            marginTop:     ms.helperMarginTop,
            fontSize:      ms.helperSize,
            lineHeight:    `${ms.helperLineHeight}px`,
            fontWeight:    ms.helperWeight,
            letterSpacing: ms.helperLetterSpacing,
            textTransform: 'uppercase',
            color:         ms.helperColor,
          }}
        >
          {value.length} selected
        </span>
      )}

      {open &&
        createPortal(
          <div
            id={dropdownId}
            ref={(el) => { dropdownRef.current = el; refs.setFloating(el); }}
            role="listbox"
            aria-multiselectable
            className="z-[1000] overflow-y-auto"
            style={{
              ...floatingStyles,
              paddingTop:      s.dropdownPaddingY,
              paddingBottom:   s.dropdownPaddingY,
              backgroundColor: s.dropdownBg,
              border:          `${s.dropdownBorderWidth}px solid ${s.dropdownBorderColor}`,
            }}
          >
            {options.map((opt) => {
              const isSelected = valueSet.has(opt.id);
              return (
                <button
                  key={opt.id}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => toggle(opt.id)}
                  className="flex w-full items-center justify-between text-left"
                  style={{
                    paddingLeft:     s.optionPaddingX,
                    paddingRight:    s.optionPaddingX,
                    paddingTop:      s.optionPaddingY,
                    paddingBottom:   s.optionPaddingY,
                    backgroundColor: isSelected ? s.optionSelectedBg : 'transparent',
                  }}
                >
                  <span
                    style={{
                      fontSize:   s.primarySize,
                      lineHeight: `${s.primaryLineHeight}px`,
                      fontWeight: s.primaryWeight,
                      color:      s.primaryColor,
                    }}
                  >
                    {opt.label}
                  </span>
                  {isSelected && <Check size={ms.checkSize} color={ms.checkColor} aria-hidden />}
                </button>
              );
            })}
          </div>,
          document.body,
        )}
    </div>
  );
}
