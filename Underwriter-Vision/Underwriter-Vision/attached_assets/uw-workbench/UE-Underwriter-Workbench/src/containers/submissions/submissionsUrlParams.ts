/**
 * URL-param parsing helpers for the /submissions route.
 *
 * Filter / scope / sort / pagination state lives in the URL (per CLAUDE.md
 * §X URL params, not Redux). These helpers validate strings coming from
 * `useSearchParams` and fall back to defaults when the URL contains an
 * invalid value.
 */

import type {
  ProductLine,
  SubmissionPriority,
  SubmissionStatus,
  SubmissionsFilterParams,
  SubmissionsSort,
  SubmissionsSortDirection,
  SubmissionsSortField,
} from '@/shared/types';

const STATUSES: readonly SubmissionStatus[] = [
  'New', 'InReview', 'Quoted', 'Bound', 'Declined', 'PendingInfo',
];
const PRIORITIES: readonly SubmissionPriority[] = ['Critical', 'High', 'Medium', 'Low'];
const PRODUCTS: readonly ProductLine[] = [
  'EPL', 'ELL', 'GL', 'ML', 'Cyber', 'Property', 'Crime', 'Auto', 'SA',
];
const SORT_FIELDS: readonly SubmissionsSortField[] = ['age', 'needBy', 'effective'];

// Scope is now path-based (not a URL param). These defaults apply to
// sort / pagination only.
export const DEFAULT_SORT: SubmissionsSort = { field: 'age', direction: 'desc' };
export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_SIZE = 10;

function isOneOf<T extends string>(value: string | null, allowed: readonly T[]): value is T {
  return value !== null && (allowed as readonly string[]).includes(value);
}

function readCsv<T extends string>(
  raw: string | null,
  allowed: readonly T[],
): T[] | undefined {
  if (!raw) return undefined;
  const items = raw
    .split(',')
    .map((s) => s.trim())
    .filter((s): s is T => (allowed as readonly string[]).includes(s));
  return items.length > 0 ? items : undefined;
}

export function parseSort(
  fieldRaw: string | null,
  dirRaw:   string | null,
): SubmissionsSort {
  const field: SubmissionsSortField = isOneOf(fieldRaw, SORT_FIELDS)
    ? fieldRaw
    : DEFAULT_SORT.field;
  const direction: SubmissionsSortDirection =
    dirRaw === 'asc' || dirRaw === 'desc' ? dirRaw : DEFAULT_SORT.direction;
  return { field, direction };
}

export function parsePage(raw: string | null): number {
  if (!raw) return DEFAULT_PAGE;
  const n = Number(raw);
  return Number.isInteger(n) && n >= 1 ? n : DEFAULT_PAGE;
}

export function parsePageSize(raw: string | null): number {
  if (!raw) return DEFAULT_PAGE_SIZE;
  const n = Number(raw);
  return Number.isInteger(n) && n >= 1 ? n : DEFAULT_PAGE_SIZE;
}

export function parseFilters(read: (key: string) => string | null): SubmissionsFilterParams {
  const q = read('q')?.trim() ?? undefined;
  return {
    q:             q && q.length > 0 ? q : undefined,
    status:        readCsv<SubmissionStatus>(read('status'), STATUSES),
    priority:      readCsv<SubmissionPriority>(read('priority'), PRIORITIES),
    products:      readCsv<ProductLine>(read('products'), PRODUCTS),
    states:        read('states')?.split(',').map((s) => s.trim()).filter(Boolean) ?? undefined,
    brokers:       read('brokers')?.split(',').map((s) => s.trim()).filter(Boolean) ?? undefined,
    underwriters:  read('underwriters')?.split(',').map((s) => s.trim()).filter(Boolean) ?? undefined,
    submittedFrom: read('submittedFrom') ?? undefined,
    submittedTo:   read('submittedTo')   ?? undefined,
  };
}
