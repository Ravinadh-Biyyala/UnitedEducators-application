import { ChevronDown } from 'lucide-react';
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import type { ReactNode } from 'react';
import { useFloating, autoUpdate, flip, shift, offset, size } from '@floating-ui/react';
import { inputStyles, selectStyles as s } from '@/theme/tokens';

export interface SelectOption<TId extends string = string> {
  id:        TId;
  label:     string;
  disabled?: boolean;
}

interface SelectProps<TId extends string = string> {
  value:           TId | null;
  onChange:        (id: TId | null) => void;
  options:         SelectOption<TId>[];
  placeholder?:    string;
  leftIcon?:       ReactNode;
  disabled?:       boolean;
  renderOption?:   (opt: SelectOption<TId>) => ReactNode;
  ariaLabel?:      string;
}

export function Select<TId extends string = string>({
  value,
  onChange,
  options,
  placeholder,
  leftIcon,
  disabled,
  renderOption,
  ariaLabel,
}: SelectProps<TId>) {
  const [open, setOpen]               = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const triggerRef                    = useRef<HTMLButtonElement | null>(null);
  const dropdownRef                   = useRef<HTMLDivElement | null>(null);
  const dropdownId                    = useId();

  const selected = useMemo(
    () => options.find((o) => o.id === value) ?? null,
    [options, value],
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

  // Outside click + Escape + Tab + scroll
  useEffect(() => {
    if (!open) return;
    const onMouseDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        triggerRef.current?.contains(target) ||
        dropdownRef.current?.contains(target)
      ) {
        return;
      }
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

  const onTriggerKey = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (!open && (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown')) {
      e.preventDefault();
      setOpen(true);
      const startIdx = options.findIndex((o) => o.id === value);
      setActiveIndex(startIdx >= 0 ? startIdx : 0);
    }
  };

  const onDropdownKey = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, options.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const opt = options[activeIndex];
        if (opt && !opt.disabled) {
          onChange(opt.id);
          setOpen(false);
          triggerRef.current?.focus();
        }
      }
    },
    [activeIndex, options, onChange],
  );

  return (
    <>
      <button
        ref={(el) => { triggerRef.current = el; refs.setReference(el); }}
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? dropdownId : undefined}
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
        onKeyDown={onTriggerKey}
        className="relative w-full text-left cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        style={{
          height:          inputStyles.height,
          backgroundColor: inputStyles.bg,
          border:          `${inputStyles.borderWidth}px solid ${inputStyles.borderColor}`,
          paddingLeft:     leftIcon ? inputStyles.paddingXWithLeftIcon : inputStyles.paddingX,
          paddingRight:    inputStyles.paddingXWithLeftIcon,
          paddingTop:      inputStyles.paddingY,
          paddingBottom:   inputStyles.paddingY,
          fontSize:        inputStyles.textSize,
          lineHeight:      `${inputStyles.textLineHeight}px`,
          fontWeight:      selected ? 500 : inputStyles.placeholderWeight,
          color:           selected ? inputStyles.textColor : inputStyles.placeholderColor,
        }}
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
        <span className="block truncate">
          {selected ? selected.label : placeholder ?? ''}
        </span>
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

      {open &&
        createPortal(
          <div
            id={dropdownId}
            ref={(el) => { dropdownRef.current = el; refs.setFloating(el); }}
            role="listbox"
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
            {options.map((opt, i) => {
              const isActive   = i === activeIndex;
              const isSelected = opt.id === value;
              return (
                <button
                  key={opt.id}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  disabled={opt.disabled}
                  onMouseEnter={() => setActiveIndex(i)}
                  onClick={() => {
                    if (opt.disabled) return;
                    onChange(opt.id);
                    setOpen(false);
                    triggerRef.current?.focus();
                  }}
                  className="block w-full text-left disabled:cursor-not-allowed disabled:opacity-50"
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
                  }}
                >
                  {renderOption ? (
                    renderOption(opt)
                  ) : (
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
                  )}
                </button>
              );
            })}
          </div>,
          document.body,
        )}
    </>
  );
}
