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
  const [activeIndex, setActiveIndex] = useState(-1);
  const triggerRef      = useRef<HTMLButtonElement | null>(null);
  const dropdownRef     = useRef<HTMLDivElement | null>(null);
  const dropdownId      = useId();
  const typeAheadRef    = useRef<{ query: string; lastAt: number }>({ query: '', lastAt: 0 });

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

  const onTriggerKey = (e: React.KeyboardEvent) => {
    if (!open && (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown')) {
      e.preventDefault();
      setOpen(true);
      setActiveIndex(0);
    }
  };

  const onDropdownKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, options.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Home') {
      e.preventDefault();
      setActiveIndex(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      setActiveIndex(options.length - 1);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const opt = options[activeIndex];
      if (opt) toggle(opt.id);
    } else if (e.key.length === 1 && /\S/.test(e.key)) {
      const now = Date.now();
      const prev = typeAheadRef.current;
      const query = (now - prev.lastAt > 500 ? '' : prev.query) + e.key.toLowerCase();
      typeAheadRef.current = { query, lastAt: now };
      const match = options.findIndex((o) => o.label.toLowerCase().startsWith(query));
      if (match >= 0) setActiveIndex(match);
    }
  };

  const selectAll = () => onChange(options.map((o) => o.id));
  const clearAll = () => onChange([]);

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
        onKeyDown={onTriggerKey}
        className="relative w-full text-left cursor-pointer ring-custom focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-vivid"
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
                <button
                  type="button"
                  aria-label={`Remove ${o.label}`}
                  onClick={(e) => removeChip(o.id, e)}
                  className="inline-flex items-center justify-center cursor-pointer ring-custom focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-vivid rounded"
                >
                  <X size={ms.chipCloseIconSize} color={ms.chipCloseColor} aria-hidden />
                </button>
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
            aria-multiselectable="true"
            aria-label={ariaLabel}
            tabIndex={-1}
            onKeyDown={onDropdownKey}
            className="z-[1000] overflow-y-auto"
            style={{
              ...floatingStyles,
              paddingTop:      s.dropdownPaddingY,
              paddingBottom:   s.dropdownPaddingY,
              backgroundColor: s.dropdownBg,
              border:          `${s.dropdownBorderWidth}px solid ${s.dropdownBorderColor}`,
            }}
          >
            {/* Bulk actions — keeps long option lists usable */}
            {options.length > 4 && (
              <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 text-xs font-medium">
                <button
                  type="button"
                  onClick={selectAll}
                  className="text-brand-vivid hover:underline ring-custom focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-vivid rounded"
                >
                  Select all
                </button>
                <button
                  type="button"
                  onClick={clearAll}
                  disabled={value.length === 0}
                  className="text-slate-500 hover:underline disabled:opacity-40 disabled:cursor-not-allowed ring-custom focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-vivid rounded"
                >
                  Clear
                </button>
              </div>
            )}
            {options.map((opt, i) => {
              const isSelected = valueSet.has(opt.id);
              const isActive   = i === activeIndex;
              return (
                <button
                  key={opt.id}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onMouseEnter={() => setActiveIndex(i)}
                  onClick={() => toggle(opt.id)}
                  className="flex w-full items-center justify-between text-left"
                  style={{
                    paddingLeft:     s.optionPaddingX,
                    paddingRight:    s.optionPaddingX,
                    paddingTop:      s.optionPaddingY,
                    paddingBottom:   s.optionPaddingY,
                    backgroundColor: isSelected
                      ? s.optionSelectedBg
                      : isActive
                      ? s.optionHoverBg
                      : 'transparent',
                    outline: isActive ? '2px solid #0123D4' : 'none',
                    outlineOffset: '-2px',
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
