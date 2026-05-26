import type { NewSubmissionFormValues } from '@/shared/types';

export function getMissingRequiredFieldsLabels(
  values: Partial<NewSubmissionFormValues>,
): string[] {
  const missing: string[] = [];
  if (!values.accountId)                             missing.push('Account Name');
  if (!values.productLines || values.productLines.length === 0) missing.push('Product Line(s)');
  if (!values.needByDate)                            missing.push('Need By Date');
  if (!values.effectiveDate)                         missing.push('Effective Date');
  if (!values.expirationDate)                        missing.push('Expiration Date');
  return missing;
}

/**
 * Joins a list with Oxford-comma rules:
 *   1 → "X"
 *   2 → "X and Y"
 *   3+ → "X, Y, and Z"
 */
export function oxfordCommaJoin(items: string[]): string {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
}
