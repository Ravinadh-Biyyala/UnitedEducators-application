import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from '@/services/baseQuery';
import type { TeamPerformance } from '@/shared/types/teamPerformance';

const MOCK_TEAM_PERFORMANCE: TeamPerformance = {
  generatedAt: '2026-04-30T00:00:00.000Z',
  underwriters: [
    { id: 'uw-1', name: 'Sarah Mitchell', roleLabel: 'Underwriter',    role: 'lead',     inReview: 5, quoted: 7, bound: 3, hitRatioPct: 71, daysToQuote: 3.8 },
    { id: 'uw-2', name: 'John Martinez',  roleLabel: 'Sr. Underwriter', role: 'standard', inReview: 4, quoted: 9, bound: 4, hitRatioPct: 74, daysToQuote: 3.2 },
    { id: 'uw-3', name: 'Tom Lewis',      roleLabel: 'UW Analyst',      role: 'standard', inReview: 3, quoted: 5, bound: 3, hitRatioPct: 68, daysToQuote: 4.5 },
    { id: 'uw-4', name: "James O'Connor", roleLabel: 'UW Analyst',      role: 'standard', inReview: 2, quoted: 4, bound: 2, hitRatioPct: 66, daysToQuote: 4.9 },
  ],
};

export const teamPerformanceApi = createApi({
  reducerPath: 'teamPerformanceApi',
  baseQuery,
  tagTypes: ['TeamPerformance'],
  endpoints: (builder) => ({
    getTeamPerformance: builder.query<TeamPerformance, void>({
      // TODO: replace with real endpoint /api/team-performance
      // Backend aggregates per underwriter:
      //   inReview / quoted / bound counts, hitRatioPct, daysToQuote
      // Frontend never aggregates from getSubmissions.
      queryFn: async () => ({ data: MOCK_TEAM_PERFORMANCE }),
      providesTags: ['TeamPerformance'],
    }),
  }),
});

export const { useGetTeamPerformanceQuery } = teamPerformanceApi;
