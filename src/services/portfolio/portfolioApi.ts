import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from '@/services/baseQuery';
import type { PortfolioSnapshot } from '@/shared/types/portfolio';

const MOCK_SNAPSHOT: PortfolioSnapshot = {
  generatedAt: '2026-04-29T00:00:00.000Z',
  stats: {
    totalSubmissionsMtd: { key: 'totalSubmissionsMtd', label: 'Total Submissions (MTD)', value: 22,      format: 'count'     },
    quotedPipeline:      { key: 'quotedPipeline',      label: 'Quoted Pipeline',          value: 4200000, format: 'currency'  },
    boundYtd:            { key: 'boundYtd',            label: 'Bound YTD',                value: 3100000, format: 'currency'  },
    avgAppetiteScore:    { key: 'avgAppetiteScore',    label: 'Avg. Appetite Score',      value: 81,      format: 'score'     },
    submissionsInSla:    { key: 'submissionsInSla',    label: 'Submissions in SLA',       value: 91,      format: 'percent'   },
    docsIncomplete:      { key: 'docsIncomplete',      label: 'Docs Incomplete',          value: 4,       format: 'subsCount' },
  },
};

export const portfolioApi = createApi({
  reducerPath: 'portfolioApi',
  baseQuery,
  tagTypes: ['PortfolioSnapshot'],
  endpoints: (builder) => ({
    getSnapshot: builder.query<PortfolioSnapshot, void>({
      // TODO: replace with real endpoint /api/portfolio/snapshot
      // The real endpoint MUST aggregate server-side over the full
      // submissions table — never compute these client-side.
      queryFn: async () => ({ data: MOCK_SNAPSHOT }),
      providesTags: ['PortfolioSnapshot'],
    }),
  }),
});

export const { useGetSnapshotQuery } = portfolioApi;
