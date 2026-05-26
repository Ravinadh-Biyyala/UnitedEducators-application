import { useId, useRef } from 'react';

interface TabOption<T extends string> {
  value: T;
  label: string;
}

interface Props<T extends string> {
  value: T;
  onChange: (v: T) => void;
  options: TabOption<T>[];
  /** Accessible label for the tablist (defaults to "Tabs"). */
  ariaLabel?: string;
}

export function Tabs<T extends string>({ value, onChange, options, ariaLabel = 'Tabs' }: Props<T>) {
  const baseId = useId();
  const buttonsRef = useRef<(HTMLButtonElement | null)[]>([]);

  const focusIndex = (i: number) => {
    const next = ((i % options.length) + options.length) % options.length;
    buttonsRef.current[next]?.focus();
    const opt = options[next];
    if (opt) onChange(opt.value);
  };

  const handleKey = (e: React.KeyboardEvent, current: number) => {
    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault();
        focusIndex(current + 1);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        focusIndex(current - 1);
        break;
      case 'Home':
        e.preventDefault();
        focusIndex(0);
        break;
      case 'End':
        e.preventDefault();
        focusIndex(options.length - 1);
        break;
      default:
        break;
    }
  };

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className="inline-flex rounded-md border border-gray-200 bg-gray-50 p-1"
    >
      {options.map((opt, i) => {
        const selected = opt.value === value;
        return (
          <button
            key={opt.value}
            ref={(el) => { buttonsRef.current[i] = el; }}
            id={`${baseId}-tab-${opt.value}`}
            role="tab"
            type="button"
            aria-selected={selected}
            aria-controls={`${baseId}-panel-${opt.value}`}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(opt.value)}
            onKeyDown={(e) => handleKey(e, i)}
            className={
              'px-3 py-1 text-sm rounded-md transition-colors ring-custom ' +
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-vivid ' +
              (selected ? 'bg-white shadow-sm font-medium' : 'text-gray-600')
            }
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
