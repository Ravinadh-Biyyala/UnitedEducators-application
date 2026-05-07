import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import {
  colors,
  statusLabels,
  statusStyles,
  productLineLabels,
  submissionsFiltersStyles as fs,
  submissionsFilterGroupLabels,
  SUBMISSIONS_FILTER_GROUPS_DISPLAY_ORDER,
  SUBMISSIONS_PRODUCT_LINES_DISPLAY_ORDER,
  type SubmissionsFilterGroupKey,
} from '@/theme/tokens';
import type {
  ProductLine,
  SubmissionPriority,
  SubmissionStatus,
  SubmissionsFilterParams,
} from '@/shared/types';

const STATUSES_DISPLAY_ORDER: SubmissionStatus[] = [
  'New', 'InReview', 'Quoted', 'PendingInfo', 'Bound', 'Declined',
];

const PRIORITIES_DISPLAY_ORDER: SubmissionPriority[] = [
  'Critical', 'High', 'Medium', 'Low',
];

// 50 US states + DC. Centralised here because no other route needs it yet;
// promote to shared/constants if a second route adopts it.
const US_STATES: { code: string; name: string }[] = [
  { code: 'AL', name: 'Alabama' },        { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' },        { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' },     { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' },    { code: 'DE', name: 'Delaware' },
  { code: 'DC', name: 'D.C.' },           { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' },        { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' },          { code: 'IL', name: 'Illinois' },
  { code: 'IN', name: 'Indiana' },        { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' },         { code: 'KY', name: 'Kentucky' },
  { code: 'LA', name: 'Louisiana' },      { code: 'ME', name: 'Maine' },
  { code: 'MD', name: 'Maryland' },       { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' },       { code: 'MN', name: 'Minnesota' },
  { code: 'MS', name: 'Mississippi' },    { code: 'MO', name: 'Missouri' },
  { code: 'MT', name: 'Montana' },        { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' },         { code: 'NH', name: 'New Hampshire' },
  { code: 'NJ', name: 'New Jersey' },     { code: 'NM', name: 'New Mexico' },
  { code: 'NY', name: 'New York' },       { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' },   { code: 'OH', name: 'Ohio' },
  { code: 'OK', name: 'Oklahoma' },       { code: 'OR', name: 'Oregon' },
  { code: 'PA', name: 'Pennsylvania' },   { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' }, { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' },      { code: 'TX', name: 'Texas' },
  { code: 'UT', name: 'Utah' },           { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' },       { code: 'WA', name: 'Washington' },
  { code: 'WV', name: 'West Virginia' },  { code: 'WI', name: 'Wisconsin' },
  { code: 'WY', name: 'Wyoming' },
];

interface SubmissionsFiltersDrawerProps {
  filters:               SubmissionsFilterParams;
  onChange:              (next: SubmissionsFilterParams) => void;
  availableBrokers:      string[];
  availableUnderwriters: string[];
}

export function SubmissionsFiltersDrawer({
  filters,
  onChange,
  availableBrokers,
  availableUnderwriters,
}: SubmissionsFiltersDrawerProps) {
  return (
    <div className="flex flex-col">
      {SUBMISSIONS_FILTER_GROUPS_DISPLAY_ORDER.map((groupKey) => (
        <FilterGroupShell key={groupKey} label={submissionsFilterGroupLabels[groupKey]}>
          <FilterGroupBody
            groupKey={groupKey}
            filters={filters}
            onChange={onChange}
            availableBrokers={availableBrokers}
            availableUnderwriters={availableUnderwriters}
          />
        </FilterGroupShell>
      ))}
    </div>
  );
}

// ── Shell ───────────────────────────────────────────────────────────────────

function FilterGroupShell({
  label,
  children,
}: {
  label:    string;
  children: React.ReactNode;
}) {
  return (
    <section style={{ borderBottom: `1px solid ${fs.groupBorderColor}` }}>
      <header
        className="flex items-center"
        style={{
          height:        fs.groupHeaderHeight,
          paddingLeft:   fs.groupHeaderPaddingX,
          paddingRight:  fs.groupHeaderPaddingX,
          fontSize:      fs.groupHeaderFontSize,
          fontWeight:    fs.groupHeaderWeight,
          color:         fs.groupHeaderColor,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}
      >
        {label}
      </header>
      <div
        style={{
          paddingLeft:   fs.groupBodyPaddingX,
          paddingRight:  fs.groupBodyPaddingX,
          paddingBottom: 12,
        }}
      >
        {children}
      </div>
    </section>
  );
}

// ── Group dispatcher ────────────────────────────────────────────────────────

function FilterGroupBody({
  groupKey,
  filters,
  onChange,
  availableBrokers,
  availableUnderwriters,
}: {
  groupKey:              SubmissionsFilterGroupKey;
  filters:               SubmissionsFilterParams;
  onChange:              (next: SubmissionsFilterParams) => void;
  availableBrokers:      string[];
  availableUnderwriters: string[];
}) {
  switch (groupKey) {
    case 'keyword':
      return <KeywordSearchGroup value={filters.q ?? ''} onChange={(q) => onChange({ ...filters, q: q || undefined })} />;
    case 'status':
      return (
        <CheckboxListGroup
          options={STATUSES_DISPLAY_ORDER.map((s) => ({
            value: s,
            label: statusLabels[s],
            dotColor: statusStyles[s].dot,
          }))}
          selected={filters.status ?? []}
          onToggle={(value) => onChange({ ...filters, status: toggleArray(filters.status, value as SubmissionStatus) })}
        />
      );
    case 'priority':
      return (
        <CheckboxListGroup
          options={PRIORITIES_DISPLAY_ORDER.map((p) => ({ value: p, label: p }))}
          selected={filters.priority ?? []}
          onToggle={(value) => onChange({ ...filters, priority: toggleArray(filters.priority, value as SubmissionPriority) })}
        />
      );
    case 'products':
      return (
        <CheckboxListGroup
          options={SUBMISSIONS_PRODUCT_LINES_DISPLAY_ORDER.map((p) => ({ value: p, label: productLineLabels[p] }))}
          selected={filters.products ?? []}
          onToggle={(value) => onChange({ ...filters, products: toggleArray(filters.products, value as ProductLine) })}
        />
      );
    case 'jurisdiction':
      return (
        <SearchableCheckboxListGroup
          options={US_STATES.map((s) => ({ value: s.code, label: `${s.code} — ${s.name}` }))}
          selected={filters.states ?? []}
          onToggle={(value) => onChange({ ...filters, states: toggleArray(filters.states, value) })}
          placeholder="Search states…"
        />
      );
    case 'broker':
      return (
        <SearchableCheckboxListGroup
          options={availableBrokers.map((b) => ({ value: b, label: b }))}
          selected={filters.brokers ?? []}
          onToggle={(value) => onChange({ ...filters, brokers: toggleArray(filters.brokers, value) })}
          placeholder="Search brokers…"
        />
      );
    case 'underwriter':
      return (
        <SearchableCheckboxListGroup
          options={availableUnderwriters.map((u) => ({ value: u, label: u }))}
          selected={filters.underwriters ?? []}
          onToggle={(value) => onChange({ ...filters, underwriters: toggleArray(filters.underwriters, value) })}
          placeholder="Search underwriters…"
        />
      );
    case 'submittedDate':
      return (
        <SubmittedDateGroup
          from={filters.submittedFrom ?? ''}
          to={filters.submittedTo ?? ''}
          onChange={(from, to) => onChange({
            ...filters,
            submittedFrom: from || undefined,
            submittedTo:   to   || undefined,
          })}
        />
      );
  }
}

// ── Keyword search ──────────────────────────────────────────────────────────

function KeywordSearchGroup({
  value,
  onChange,
  placeholder = 'Submission ID, member, broker…',
}: {
  value:        string;
  onChange:     (next: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="relative">
      <Search
        size={14}
        color={colors.slate500}
        style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }}
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-white outline-none transition-colors focus:border-blue-500"
        style={{
          height:        fs.inputHeight,
          paddingLeft:   fs.inputPaddingLeft,
          paddingRight:  fs.inputPaddingRight,
          border:        `1px solid ${fs.inputBorderColor}`,
          borderRadius:  4,
          fontSize:      12,
          color:         colors.textHeading,
        }}
      />
    </div>
  );
}

// ── Checkbox list (with optional status dot) ────────────────────────────────

interface CheckboxOption {
  value:     string;
  label:     string;
  dotColor?: string;
}

function CheckboxListGroup({
  options,
  selected,
  onToggle,
}: {
  options:  CheckboxOption[];
  selected: readonly string[];
  onToggle: (value: string) => void;
}) {
  return (
    <ul className="flex flex-col" style={{ margin: 0, padding: 0, listStyle: 'none' }}>
      {options.map((opt) => (
        <li key={opt.value}>
          <CheckboxRow
            label={opt.label}
            dotColor={opt.dotColor}
            checked={selected.includes(opt.value)}
            onToggle={() => onToggle(opt.value)}
          />
        </li>
      ))}
    </ul>
  );
}

function CheckboxRow({
  label,
  dotColor,
  checked,
  onToggle,
}: {
  label:    string;
  dotColor?: string;
  checked:  boolean;
  onToggle: () => void;
}) {
  return (
    <label
      className="flex items-center cursor-pointer"
      style={{
        height: fs.rowHeight,
        gap:    fs.checkboxLabelGap,
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onToggle}
        style={{
          width:        fs.checkboxSize,
          height:       fs.checkboxSize,
          borderWidth:  fs.checkboxBorder,
          borderColor:  fs.checkboxBorderColor,
          borderStyle:  'solid',
          borderRadius: 3,
          accentColor:  colors.brandBlue,
          margin:       0,
          flexShrink:   0,
        }}
      />
      {dotColor && (
        <span
          aria-hidden
          style={{
            width:           fs.dotSize,
            height:          fs.dotSize,
            borderRadius:    '50%',
            backgroundColor: dotColor,
            flexShrink:      0,
          }}
        />
      )}
      <span style={{ fontSize: fs.checkboxLabelSize, color: fs.checkboxLabelColor }}>
        {label}
      </span>
    </label>
  );
}

// ── Searchable list (jurisdiction / broker / underwriter) ───────────────────

function SearchableCheckboxListGroup({
  options,
  selected,
  onToggle,
  placeholder,
}: {
  options:     CheckboxOption[];
  selected:    readonly string[];
  onToggle:    (value: string) => void;
  placeholder: string;
}) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [query, options]);

  return (
    <div className="flex flex-col gap-2">
      <KeywordSearchGroup value={query} onChange={setQuery} placeholder={placeholder} />
      <div className="overflow-y-auto" style={{ maxHeight: 180 }}>
        <CheckboxListGroup options={filtered} selected={selected} onToggle={onToggle} />
      </div>
    </div>
  );
}

// ── Submitted date (From / To) ──────────────────────────────────────────────

function SubmittedDateGroup({
  from,
  to,
  onChange,
}: {
  from:     string;
  to:       string;
  onChange: (from: string, to: string) => void;
}) {
  const inputStyle: React.CSSProperties = {
    height:       fs.inputHeight,
    paddingLeft:  8,
    paddingRight: 8,
    border:       `1px solid ${fs.inputBorderColor}`,
    borderRadius: 4,
    fontSize:     12,
    color:        colors.textHeading,
    width:        '100%',
  };
  return (
    <div className="flex gap-2">
      <input
        type="date"
        value={from}
        onChange={(e) => onChange(e.target.value, to)}
        aria-label="Submitted date — from"
        style={inputStyle}
      />
      <input
        type="date"
        value={to}
        onChange={(e) => onChange(from, e.target.value)}
        aria-label="Submitted date — to"
        style={inputStyle}
      />
    </div>
  );
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function toggleArray<T extends string>(current: readonly T[] | undefined, value: T): T[] | undefined {
  const set = new Set<T>(current ?? []);
  if (set.has(value)) set.delete(value);
  else                set.add(value);
  const out = Array.from(set);
  return out.length > 0 ? out : undefined;
}
