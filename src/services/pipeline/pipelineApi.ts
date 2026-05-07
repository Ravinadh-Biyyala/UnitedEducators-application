import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from '@/services/baseQuery';
import type { Pipeline } from '@/shared/types/pipeline';

const MOCK_PIPELINE: Pipeline = {
  generatedAt: '2026-04-29T00:00:00.000Z',
  months: [
    { monthLabel: 'Oct', monthIso: '2023-10', submitted:  8, quoted:  6, bound:  4 },
    { monthLabel: 'Nov', monthIso: '2023-11', submitted: 11, quoted:  8, bound:  5 },
    { monthLabel: 'Dec', monthIso: '2023-12', submitted:  7, quoted:  5, bound:  4 },
    { monthLabel: 'Jan', monthIso: '2024-01', submitted: 14, quoted: 10, bound:  7 },
    { monthLabel: 'Feb', monthIso: '2024-02', submitted: 18, quoted: 13, bound:  9 },
    { monthLabel: 'Mar', monthIso: '2024-03', submitted: 22, quoted: 16, bound: 11 },
  ],
};

export const pipelineApi = createApi({
  reducerPath: 'pipelineApi',
  baseQuery,
  tagTypes: ['Pipeline'],
  endpoints: (builder) => ({
    getPipeline: builder.query<Pipeline, void>({
      // TODO: replace with real endpoint /api/pipeline?range=6m
      // Backend aggregates submission counts per month per status.
      // Frontend never aggregates from getSubmissions.
      queryFn: async () => ({ data: MOCK_PIPELINE }),
      providesTags: ['Pipeline'],
    }),
  }),
});

export const { useGetPipelineQuery } = pipelineApi;
