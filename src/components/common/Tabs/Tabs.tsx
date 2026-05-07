interface TabOption<T extends string> {
  value: T;
  label: string;
}

interface Props<T extends string> {
  value: T;
  onChange: (v: T) => void;
  options: TabOption<T>[];
}

export function Tabs<T extends string>({ value, onChange, options }: Props<T>) {
  return (
    <div className="inline-flex rounded-md border border-gray-200 bg-gray-50 p-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-3 py-1 text-sm rounded-md transition-colors ${
            opt.value === value ? 'bg-white shadow-sm font-medium' : 'text-gray-600'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
