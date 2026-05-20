export const formatCurrency = (value: number, currency = 'USD'): string =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(
    value,
  );

export const formatCompactCurrency = (value: number, currency = 'USD'): string =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency, notation: 'compact', maximumFractionDigits: 1 }).format(value);

export const formatPercent = (value: number, fractionDigits = 0): string =>
  `${value.toFixed(fractionDigits)}%`;

export const formatDate = (iso: string): string =>
  new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
