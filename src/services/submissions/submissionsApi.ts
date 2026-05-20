import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from '@/services/baseQuery';
import type {
  AccountLookup,
  BrokerageDetail,
  BrokerageLookup,
  BrokerContact,
  CoverageLine,
  CreateSubmissionPayload,
  CreateSubmissionResponse,
  LossHistoryRow,
  MemberDetail,
  Submission,
  SubmissionDetail,
  SubmissionsHeaderStats,
  SubmissionsListQuery,
  SubmissionsListResponse,
  SubmissionsScope,
  SubmissionsSortField,
  UnderwriterLookup,
  UploadDocumentPayload,
  UploadDocumentResponse,
} from '@/shared/types';
import { MOCK_SUBMISSIONS_LIST } from '@/services/submissions/mocks/submissionsListMock';
import { MOCK_ACCOUNTS } from '@/services/submissions/mocks/accountsMock';
import { MOCK_BROKERAGES } from '@/services/submissions/mocks/brokeragesMock';
import { MOCK_UNDERWRITERS } from '@/services/submissions/mocks/underwritersMock';
import { getMockSubmissionDetail } from '@/services/submissions/mocks/submissionDetailMock';
import { MOCK_COVERAGE_LINES, DEFAULT_COVERAGE_LINES } from '@/services/submissions/mocks/coverageLinesMock';
import { MOCK_LOSS_HISTORY, DEFAULT_LOSS_HISTORY } from '@/services/submissions/mocks/lossHistoryMock';
import { getMockMemberDetail } from '@/services/submissions/mocks/memberDetailMock';
import { getMockBrokerageDetail } from '@/services/submissions/mocks/brokerageDetailMock';
import { MOCK_BROKER_CONTACTS, DEFAULT_BROKER_CONTACTS } from '@/services/submissions/mocks/brokerContactsMock';

// Dashboard panel mock — separate from MOCK_SUBMISSIONS_LIST. The dashboard
// query (`useGetSubmissionsQuery`) is left untouched per Phase S1 hard rule.
// TODO: replace queryFn with query: () => '/api/submissions' when backend is ready.
const MOCK_SUBMISSIONS: Submission[] = [
  { id: 'SUB-7829', member: 'Riverside Unified School District', state: 'CA', type: 'K-12 Public',     assigneeInitials: 'SM', assigneeName: 'Sarah',  premium: 112000, status: 'InReview',    priority: 'Critical', effDate: 'Jul 1, 2024',  docs: true  },
  { id: 'SUB-7830', member: 'UCLA Extension',                    state: 'CA', type: 'Higher Ed',       assigneeInitials: 'MJ', assigneeName: 'Mike',   premium: 245000, status: 'Quoted',       priority: 'High',     effDate: 'Aug 15, 2024', docs: false },
  { id: 'SUB-7831', member: 'Greenwood Charter Academy',         state: 'TX', type: 'Charter School',  assigneeInitials: 'AL', assigneeName: 'Amy',    premium:  67500, status: 'PendingInfo', priority: 'Medium',   effDate: 'Sep 1, 2024',  docs: true  },
  { id: 'SUB-7832', member: "St. Catherine's Academy",           state: 'NY', type: 'Private School',  assigneeInitials: 'RB', assigneeName: 'Robert', premium: 189000, status: 'Bound',        priority: 'Low',      effDate: 'Oct 1, 2024',  docs: false },
  { id: 'SUB-7833', member: 'Chicago Public Schools District 299', state: 'IL', type: 'K-12 Public',   assigneeInitials: 'SM', assigneeName: 'Sarah',  premium: 320000, status: 'Declined',     priority: 'High',     effDate: 'Jan 1, 2025',  docs: false },
  { id: 'SUB-7834', member: 'Stanford University',               state: 'CA', type: 'Higher Ed',       assigneeInitials: 'MJ', assigneeName: 'Mike',   premium: 485000, status: 'InReview',    priority: 'Critical', effDate: 'Feb 15, 2025', docs: true  },
  { id: 'SUB-7835', member: 'Phoenix Rising Charter School',     state: 'AZ', type: 'Charter School',  assigneeInitials: 'AL', assigneeName: 'Amy',    premium:  55000, status: 'Quoted',       priority: 'Medium',   effDate: 'Mar 1, 2025',  docs: false },
  { id: 'SUB-7836', member: 'Montessori Academy of Texas',       state: 'TX', type: 'Private School',  assigneeInitials: 'RB', assigneeName: 'Robert', premium:  98000, status: 'PendingInfo', priority: 'Low',      effDate: 'Apr 1, 2025',  docs: false },
  { id: 'SUB-7837', member: 'Boston Public Schools',             state: 'MA', type: 'K-12 Public',     assigneeInitials: 'JD', assigneeName: 'James',  premium: 275000, status: 'Bound',        priority: 'High',     effDate: 'May 1, 2025',  docs: false },
  { id: 'SUB-7838', member: 'Columbia University',               state: 'NY', type: 'Higher Ed',       assigneeInitials: 'SM', assigneeName: 'Sarah',  premium: 612000, status: 'InReview',    priority: 'Medium',   effDate: 'Jun 1, 2025',  docs: false },
  { id: 'SUB-7839', member: 'Harmony Science Academy',           state: 'TX', type: 'Charter School',  assigneeInitials: 'MJ', assigneeName: 'Mike',   premium:  43000, status: 'Quoted',       priority: 'Critical', effDate: 'Jul 15, 2025', docs: false },
  { id: 'SUB-7840', member: 'Loyola High School',                state: 'CA', type: 'Private School',  assigneeInitials: 'AL', assigneeName: 'Amy',    premium: 156000, status: 'Declined',     priority: 'Low',      effDate: 'Aug 1, 2025',  docs: false },
  { id: 'SUB-7841', member: 'Denver Public Schools',             state: 'CO', type: 'K-12 Public',     assigneeInitials: 'RB', assigneeName: 'Robert', premium: 198000, status: 'PendingInfo', priority: 'High',     effDate: 'Sep 15, 2025', docs: false },
  { id: 'SUB-7842', member: 'Georgia Institute of Technology',   state: 'GA', type: 'Higher Ed',       assigneeInitials: 'JD', assigneeName: 'James',  premium: 378000, status: 'Bound',        priority: 'Medium',   effDate: 'Oct 1, 2025',  docs: false },
  { id: 'SUB-7843', member: 'Aspire Charter Schools',            state: 'CA', type: 'Charter School',  assigneeInitials: 'SM', assigneeName: 'Sarah',  premium:  87500, status: 'InReview',    priority: 'Low',      effDate: 'Nov 1, 2025',  docs: false },
];

// ─── Submissions route mock helpers (Phase S1) ─────────────────────────────

// S4: v2 default current user is John (every Figma row is assigned to JM/John).
// Filtering by `scope: 'mine'` returns the 5 Figma-matched rows.
const CURRENT_USER_NAME = 'John';

function applyScope(rows: Submission[], scope: SubmissionsScope): Submission[] {
  switch (scope) {
    case 'mine':
      return rows.filter((r) => r.assigneeName === CURRENT_USER_NAME);
    case 'team':
      // "Team" = anyone assigned (excludes Unassigned New rows).
      return rows.filter((r) => r.assigneeName !== '');
    case 'all':
      return rows;
  }
}

function applyFilters(
  rows: Submission[],
  f: SubmissionsListQuery['filters'],
): Submission[] {
  let out = rows;

  if (f.q && f.q.trim() !== '') {
    const q = f.q.trim().toLowerCase();
    out = out.filter(
      (r) =>
        r.member.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q) ||
        (r.broker?.toLowerCase().includes(q) ?? false),
    );
  }
  if (f.status && f.status.length > 0) {
    out = out.filter((r) => f.status!.includes(r.status));
  }
  if (f.priority && f.priority.length > 0) {
    out = out.filter((r) => f.priority!.includes(r.priority));
  }
  if (f.products && f.products.length > 0) {
    out = out.filter(
      (r) => r.products?.some((p) => f.products!.includes(p)) ?? false,
    );
  }
  if (f.states && f.states.length > 0) {
    out = out.filter((r) => f.states!.includes(r.state));
  }
  if (f.brokers && f.brokers.length > 0) {
    out = out.filter((r) => (r.broker ? f.brokers!.includes(r.broker) : false));
  }
  if (f.underwriters && f.underwriters.length > 0) {
    out = out.filter((r) => {
      const tag = r.assigneeName === '' ? 'unassigned' : r.assigneeName;
      return f.underwriters!.includes(tag);
    });
  }
  if (f.submittedFrom) {
    out = out.filter((r) => (r.submittedDate ?? '') >= f.submittedFrom!);
  }
  if (f.submittedTo) {
    out = out.filter((r) => (r.submittedDate ?? '') <= f.submittedTo!);
  }

  return out;
}

function sortKey(row: Submission, field: SubmissionsSortField): string | number {
  switch (field) {
    case 'age':       return row.daysOpen ?? 0;
    case 'needBy':    return row.needByDate ?? '';
    case 'effective': return row.effDate;
  }
}

function applySort(
  rows: Submission[],
  sort: SubmissionsListQuery['sort'],
): Submission[] {
  const sign = sort.direction === 'asc' ? 1 : -1;
  return [...rows].sort((a, b) => {
    const av = sortKey(a, sort.field);
    const bv = sortKey(b, sort.field);
    if (av < bv) return -1 * sign;
    if (av > bv) return  1 * sign;
    return 0;
  });
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const submissionsApi = createApi({
  reducerPath: 'submissionsApi',
  baseQuery,
  tagTypes: ['Submission'],
  endpoints: (builder) => ({
    // Existing dashboard panel query — untouched.
    getSubmissions: builder.query<Submission[], void>({
      queryFn: async () => ({ data: MOCK_SUBMISSIONS }),
      providesTags: ['Submission'],
    }),

    // Header KPI strip on /submissions route.
    getSubmissionsHeader: builder.query<SubmissionsHeaderStats, void>({
      queryFn: async () => ({
        data: {
          totalSubmissions: 18,
          inReview:         5,
          quoted:           3,
          boundYtd:         3,
          boundPremiumYtd:  552_200,
        },
      }),
    }),

    // Paginated list query for the /submissions route. Applies
    // scope → filters → sort → page entirely client-side over the mock.
    getSubmissionsList: builder.query<SubmissionsListResponse, SubmissionsListQuery>({
      queryFn: async (params) => {
        await delay(75);
        const scoped   = applyScope(MOCK_SUBMISSIONS_LIST, params.scope);
        const filtered = applyFilters(scoped, params.filters);
        const sorted   = applySort(filtered, params.sort);
        const start    = (params.page - 1) * params.pageSize;
        const items    = sorted.slice(start, start + params.pageSize);
        return {
          data: {
            items,
            total:    filtered.length,
            page:     params.page,
            pageSize: params.pageSize,
          },
        };
      },
      providesTags: ['Submission'],
    }),

    // ─── New Submission route (Phase N1) ──────────────────────────────────

    createSubmission: builder.mutation<CreateSubmissionResponse, CreateSubmissionPayload>({
      // Fail trigger: payload.group === 'FAIL_TEST' → mock 500 error after delay
      queryFn: async (_payload) => {
        await delay(300);
        if (_payload.group === 'FAIL_TEST') {
          return { error: { status: 500, data: { message: 'Mock create-submission failure for testing' } } };
        }
        const subNumber = 7900 + Math.floor(Math.random() * 100);
        const id =
          typeof crypto !== 'undefined' && crypto.randomUUID
            ? crypto.randomUUID()
            : `id-${Date.now()}`;
        return { data: { id, subId: `SUB-${subNumber}` } };
      },
      invalidatesTags: ['Submission'],
    }),

    uploadDocument: builder.mutation<UploadDocumentResponse, UploadDocumentPayload>({
      // Fail trigger: filename containing "fail" (case-insensitive) → mock 400 error
      queryFn: async ({ file }) => {
        await delay(500);
        if (file.name.toLowerCase().includes('fail')) {
          return { error: { status: 400, data: { message: 'Mock upload failed for testing' } } };
        }
        const id =
          typeof crypto !== 'undefined' && crypto.randomUUID
            ? crypto.randomUUID()
            : `doc-${Date.now()}`;
        return {
          data: {
            id,
            filename:    file.name,
            size:        file.size,
            presignedUrl: `https://mock.blob.core.windows.net/submissions/${id}?sig=mock`,
            uploadedAt:  new Date().toISOString(),
          },
        };
      },
    }),

    searchAccounts: builder.query<AccountLookup[], { q: string }>({
      queryFn: async ({ q }) => {
        await delay(100);
        const lower = q.trim().toLowerCase();
        const matches =
          lower.length === 0
            ? MOCK_ACCOUNTS.slice(0, 10)
            : MOCK_ACCOUNTS.filter(
                (a) =>
                  a.name.toLowerCase().includes(lower) ||
                  a.city.toLowerCase().includes(lower) ||
                  a.type.toLowerCase().includes(lower),
              ).slice(0, 10);
        return { data: matches };
      },
    }),

    getBrokerages: builder.query<BrokerageLookup[], void>({
      queryFn: async () => {
        await delay(80);
        return { data: MOCK_BROKERAGES };
      },
    }),

    getUnderwriters: builder.query<UnderwriterLookup[], void>({
      queryFn: async () => {
        await delay(80);
        return { data: MOCK_UNDERWRITERS };
      },
    }),

    // ─── Submission detail (Phase D1) ─────────────────────────────────────
    getSubmissionDetail: builder.query<SubmissionDetail, string>({
      queryFn: async (id) => {
        await delay(80);
        return { data: getMockSubmissionDetail(id) };
      },
      providesTags: (_result, _err, id) => [{ type: 'Submission', id }],
    }),

    getCoverageLines: builder.query<CoverageLine[], string>({
      queryFn: async (id) => {
        await delay(60);
        return { data: MOCK_COVERAGE_LINES[id] ?? DEFAULT_COVERAGE_LINES };
      },
      providesTags: (_result, _err, id) => [{ type: 'Submission', id }],
    }),

    getLossHistory: builder.query<LossHistoryRow[], string>({
      queryFn: async (id) => {
        await delay(60);
        return { data: MOCK_LOSS_HISTORY[id] ?? DEFAULT_LOSS_HISTORY };
      },
      providesTags: (_result, _err, id) => [{ type: 'Submission', id }],
    }),

    // ─── Member & Brokerage tab (Phase D2) ────────────────────────────────
    getMemberDetail: builder.query<MemberDetail, string>({
      queryFn: async (id) => {
        await delay(70);
        return { data: getMockMemberDetail(id) };
      },
      providesTags: (_result, _err, id) => [{ type: 'Submission', id }],
    }),

    getBrokerageDetail: builder.query<BrokerageDetail, string>({
      queryFn: async (id) => {
        await delay(70);
        return { data: getMockBrokerageDetail(id) };
      },
      providesTags: (_result, _err, id) => [{ type: 'Submission', id }],
    }),

    getBrokerContacts: builder.query<BrokerContact[], string>({
      queryFn: async (id) => {
        await delay(60);
        return { data: MOCK_BROKER_CONTACTS[id] ?? DEFAULT_BROKER_CONTACTS };
      },
      providesTags: (_result, _err, id) => [{ type: 'Submission', id }],
    }),
  }),
});

export const {
  useGetSubmissionsQuery,
  useGetSubmissionsHeaderQuery,
  useGetSubmissionsListQuery,
  useCreateSubmissionMutation,
  useUploadDocumentMutation,
  useSearchAccountsQuery,
  useGetBrokeragesQuery,
  useGetUnderwritersQuery,
  useGetSubmissionDetailQuery,
  useGetCoverageLinesQuery,
  useGetLossHistoryQuery,
  useGetMemberDetailQuery,
  useGetBrokerageDetailQuery,
  useGetBrokerContactsQuery,
} = submissionsApi;
