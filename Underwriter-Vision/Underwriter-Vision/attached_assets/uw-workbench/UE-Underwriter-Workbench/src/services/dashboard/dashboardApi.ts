import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from '@/services/baseQuery';
import type { DashboardKpis } from '@/shared/types';

// Mock data so the scaffold runs without a backend.
// Delete this and let the real endpoints take over when the API exists.
const MOCK_KPIS: DashboardKpis = {
  inReview: 47,
  quoted: 23,
  quotedPipeline: 8_400_000,
  quotedAccounts: 23,
  bound: 4,
  boundPremium: 1_450_000,
  avgDaysToQuote: 4.1,
  hitRatio: 69,
};

export const dashboardApi = createApi({
  reducerPath: 'dashboardApi',
  baseQuery,
  tagTypes: ['Kpis'],
  endpoints: (build) => ({
    getKpis: build.query<DashboardKpis, void>({
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      queryFn: async (_arg) => {
        // TODO: replace with `query: () => '/dashboard/kpis'` when API is ready.
        await new Promise((r) => setTimeout(r, 200));
        return { data: MOCK_KPIS };
      },
      providesTags: ['Kpis'],
    }),
  }),
});

export const { useGetKpisQuery } = dashboardApi;
