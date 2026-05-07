import { Search, X } from 'lucide-react';
import {
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { useFloating, autoUpdate, flip, shift, offset, size } from '@floating-ui/react';
import { useDebounce } from '@/hooks/common/useDebounce';
import { useSearchAccountsQuery } from '@/services/submissions/submissionsApi';
import {
  accountSearchInputStyles as a,
  inputStyles,
  selectStyles as s,
} from '@/theme/tokens';
import type { AccountLookup } from '@/shared/types';

interface AccountSearchInputProps {
  value:     AccountLookup | null;
  onChange:  (account: AccountLookup | null) => void;
  ariaLabel?: string;
}

export function AccountSearchInput({ value, onChange, ariaLabel }: AccountSearchInputProps) {
  const [query, setQuery]   = useState('');
  const [open, setOpen]     = useState(false);
  const wrapperRef          = useRef<HTMLDivElement | null>(null);
  const inputRef            = useRef<HTMLInputElement | null>(null);
  const dropdownRef         = useRef<HTMLDivElement | null>(null);
  const dropdownId          = useId();

  const debounced = useDebounce(query, 300);
  const { data: matches = [] } = useSearchAccountsQuery(
    { q: debounced },
    { skip: !open },
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

  // Outside click + Escape + scroll
  useEffect(() => {
    if (!open) return;
    const onMouseDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (wrapperRef.current?.contains(t) || dropdownRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
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

  const select = (acc: AccountLookup) => {
    onChange(acc);
    setQuery('');
    setOpen(false);
  };

  const clear = () => {
    onChange(null);
    setQuery('');
    inputRef.current?.focus();
  };

  // When typing while selected: first keystroke clears selection
  const handleType = (next: string) => {
    if (value) {
      onChange(null);
      setQuery(next);
    } else {
      setQuery(next);
    }
    if (!open) setOpen(true);
  };

  const displayValue = value ? value.name : query;

  return (
    <div
      ref={(el) => { wrapperRef.current = el; refs.setReference(el); }}
    >
      <span
        className="relative block w-full"
        style={{ height: inputStyles.height }}
      >
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
          <Search size={a.searchIconSize} />
        </span>
        <input
          ref={inputRef}
          type="text"
          value={displayValue}
          placeholder={a.placeholder}
          aria-label={ariaLabel ?? 'Account search'}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={open ? dropdownId : undefined}
          onChange={(e) => handleType(e.target.value)}
          onFocus={() => setOpen(true)}
          onClick={() => setOpen(true)}
          style={{
            width:           '100%',
            height:          '100%',
            backgroundColor: inputStyles.bg,
            border:          `${inputStyles.borderWidth}px solid ${inputStyles.borderColor}`,
            paddingLeft:     inputStyles.paddingXWithLeftIcon,
            paddingRight:    inputStyles.paddingXWithLeftIcon,
            paddingTop:      inputStyles.paddingY,
            paddingBottom:   inputStyles.paddingY,
            fontSize:        inputStyles.textSize,
            lineHeight:      `${inputStyles.textLineHeight}px`,
            fontWeight:      value ? 500 : inputStyles.placeholderWeight,
            color:           value ? inputStyles.textColor : inputStyles.textColor,
            outline:         'none',
          }}
        />
        {value && (
          <button
            type="button"
            aria-label="Clear account"
            onClick={clear}
            className="absolute flex items-center justify-center cursor-pointer"
            style={{
              right:  inputStyles.rightIconOffsetX,
              top:    inputStyles.rightIconOffsetY,
              width:  a.clearIconSize,
              height: a.clearIconSize,
              color:  inputStyles.iconColor,
              background: 'transparent',
              border: 'none',
              padding: 0,
            }}
          >
            <X size={a.clearIconSize} />
          </button>
        )}
      </span>

      {value && (
        <span
          style={{
            display:    'block',
            marginTop:  a.selectedSecondaryMarginTop,
            fontSize:   a.selectedSecondarySize,
            lineHeight: `${a.selectedSecondaryLineHeight}px`,
            color:      a.selectedSecondaryColor,
          }}
        >
          {value.city}
          <span aria-hidden style={{ color: a.optionSeparatorColor, padding: '0 4px' }}>
            {a.optionSeparator}
          </span>
          {value.state}
          <span aria-hidden style={{ color: a.optionSeparatorColor, padding: '0 4px' }}>
            {a.optionSeparator}
          </span>
          {value.type}
        </span>
      )}

      {open &&
        createPortal(
          <div
            id={dropdownId}
            ref={(el) => { dropdownRef.current = el; refs.setFloating(el); }}
            role="listbox"
            className="z-[1000] overflow-y-auto"
            style={{
              ...floatingStyles,
              paddingTop:      s.dropdownPaddingY,
              paddingBottom:   s.dropdownPaddingY,
              backgroundColor: s.dropdownBg,
              border:          `${s.dropdownBorderWidth}px solid ${s.dropdownBorderColor}`,
            }}
          >
            {matches.length === 0 ? (
              <div
                style={{
                  paddingLeft:   s.optionPaddingX,
                  paddingRight:  s.optionPaddingX,
                  paddingTop:    s.optionPaddingY,
                  paddingBottom: s.optionPaddingY,
                  fontSize:      s.secondarySize,
                  color:         s.secondaryColor,
                }}
              >
                No accounts match.
              </div>
            ) : (
              matches.map((acc) => (
                <button
                  key={acc.id}
                  type="button"
                  role="option"
                  aria-selected={value?.id === acc.id}
                  onClick={() => select(acc)}
                  className="block w-full text-left"
                  style={{
                    paddingLeft:   s.optionPaddingX,
                    paddingRight:  s.optionPaddingX,
                    paddingTop:    s.optionPaddingY,
                    paddingBottom: s.optionPaddingY,
                    backgroundColor:
                      value?.id === acc.id ? s.optionSelectedBg : 'transparent',
                  }}
                >
                  <span
                    style={{
                      display:    'block',
                      fontSize:   s.primarySize,
                      lineHeight: `${s.primaryLineHeight}px`,
                      fontWeight: 700,
                      color:      s.primaryColor,
                    }}
                  >
                    {acc.name}
                  </span>
                  <span
                    style={{
                      display:    'block',
                      fontSize:   s.secondarySize,
                      lineHeight: `${s.secondaryLineHeight}px`,
                      color:      s.secondaryColor,
                    }}
                  >
                    {acc.city}
                    <span aria-hidden style={{ color: a.optionSeparatorColor, padding: '0 4px' }}>
                      {a.optionSeparator}
                    </span>
                    {acc.state}
                    <span aria-hidden style={{ color: a.optionSeparatorColor, padding: '0 4px' }}>
                      {a.optionSeparator}
                    </span>
                    {acc.type}
                  </span>
                </button>
              ))
            )}
          </div>,
          document.body,
        )}
    </div>
  );
}
