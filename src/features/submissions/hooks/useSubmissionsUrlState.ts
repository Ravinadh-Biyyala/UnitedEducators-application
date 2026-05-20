import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import type {
  ProductLine,
  SubmissionPriority,
  SubmissionStatus,
  SubmissionsFilterParams,
  SubmissionsScope,
  SubmissionsSort,
} from '@/shared/types';
import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  DEFAULT_SORT,
  parseFilters,
  parsePage,
  parsePageSize,
  parseSort,
} from '@/containers/submissions/submissionsUrlParams';

/**
 * Single source of truth for /submissions URL state.
 *
 * Per CLAUDE.md §X — filter state lives in URL params, not Redux,
 * not container useState. This hook gives every consumer the same
 * derived view of the URL plus typed setters that bake in two
 * cross-cutting rules:
 *
 *   1. Any filter change resets `page` to 1 in the same setSearchParams
 *      call (the new filter result set may have fewer pages).
 *   2. Default values are deleted from the URL, never serialised, so
 *      "mine" / page=1 / sort=submitted-desc never appear in the URL.
 */

const FILTER_KEYS = [
  'q', 'status', 'priority', 'products', 'states',
  'brokers', 'underwriters', 'submittedFrom', 'submittedTo',
] as const;

function writeArrayParam(out: URLSearchParams, key: string, value: readonly string[] | undefined) {
  if (value && value.length > 0) out.set(key, value.join(','));
  else                            out.delete(key);
}

function writeScalarParam(out: URLSearchParams, key: string, value: string | undefined) {
  if (value && value.length > 0) out.set(key, value);
  else                            out.delete(key);
}

function countActiveFilters(f: SubmissionsFilterParams): number {
  let n = 0;
  if (f.q             && f.q.length > 0)            n += 1;
  if (f.status        && f.status.length > 0)       n += 1;
  if (f.priority      && f.priority.length > 0)     n += 1;
  if (f.products      && f.products.length > 0)     n += 1;
  if (f.states        && f.states.length > 0)       n += 1;
  if (f.brokers       && f.brokers.length > 0)      n += 1;
  if (f.underwriters  && f.underwriters.length > 0) n += 1;
  if (f.submittedFrom)                              n += 1;
  if (f.submittedTo)                                n += 1;
  return n;
}

export interface UseSubmissionsUrlStateResult {
  filters:            SubmissionsFilterParams;
  sort:               SubmissionsSort;
  page:               number;
  pageSize:           number;
  activeFilterCount:  number;
  setFilters:         (next: SubmissionsFilterParams) => void;
  resetFilters:       () => void;
  setSort:            (next: SubmissionsSort) => void;
  setPage:            (next: number) => void;
}

export function useSubmissionsUrlState(): UseSubmissionsUrlStateResult {
  const [params, setParams] = useSearchParams();

  const filters  = useMemo(() => parseFilters((k) => params.get(k)), [params]);
  const sort     = parseSort(params.get('sort'), params.get('dir'));
  const page     = parsePage(params.get('page'));
  const pageSize = parsePageSize(params.get('pageSize'));

  const activeFilterCount = useMemo(() => countActiveFilters(filters), [filters]);

  const setFilters = useCallback((next: SubmissionsFilterParams) => {
    const updated = new URLSearchParams(params);
    writeScalarParam(updated, 'q',             next.q);
    writeArrayParam (updated, 'status',        next.status);
    writeArrayParam (updated, 'priority',      next.priority);
    writeArrayParam (updated, 'products',      next.products);
    writeArrayParam (updated, 'states',        next.states);
    writeArrayParam (updated, 'brokers',       next.brokers);
    writeArrayParam (updated, 'underwriters',  next.underwriters);
    writeScalarParam(updated, 'submittedFrom', next.submittedFrom);
    writeScalarParam(updated, 'submittedTo',   next.submittedTo);
    updated.delete('page');
    setParams(updated, { replace: true });
  }, [params, setParams]);

  const resetFilters = useCallback(() => {
    const updated = new URLSearchParams(params);
    FILTER_KEYS.forEach((k) => updated.delete(k));
    updated.delete('page');
    setParams(updated, { replace: true });
  }, [params, setParams]);

  const setSort = useCallback((next: SubmissionsSort) => {
    const updated = new URLSearchParams(params);
    if (next.field === DEFAULT_SORT.field) updated.delete('sort');
    else                                    updated.set('sort', next.field);
    if (next.direction === DEFAULT_SORT.direction) updated.delete('dir');
    else                                            updated.set('dir', next.direction);
    setParams(updated, { replace: true });
  }, [params, setParams]);

  const setPage = useCallback((next: number) => {
    const updated = new URLSearchParams(params);
    if (next === DEFAULT_PAGE) updated.delete('page');
    else                       updated.set('page', String(next));
    setParams(updated, { replace: true });
  }, [params, setParams]);

  return {
    filters,
    sort,
    page,
    pageSize: pageSize ?? DEFAULT_PAGE_SIZE,
    activeFilterCount,
    setFilters,
    resetFilters,
    setSort,
    setPage,
  };
}

// Re-export filter type aliases that consumers commonly need alongside the hook.
export type {
  SubmissionsScope,
  SubmissionsFilterParams,
  SubmissionsSort,
  SubmissionStatus,
  SubmissionPriority,
  ProductLine,
};
