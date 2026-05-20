import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { AlertsResponse } from '@/shared/types/alerts';

// TODO: replace queryFn with real endpoint when backend is ready
export const alertsApi = createApi({
  reducerPath: 'alertsApi',
  baseQuery:   fetchBaseQuery({ baseUrl: '/' }),
  tagTypes:    ['Alerts'],
  endpoints:   (builder) => ({
    getAlerts: builder.query<AlertsResponse, void>({
      queryFn: () => {
        const now      = new Date();
        const hAgo     = (h: number) => new Date(now.getTime() - h * 3_600_000).toISOString();
        const dAgo     = (d: number) => new Date(now.getTime() - d * 86_400_000).toISOString();
        const todayHAgo = (h: number) => {
          const d = new Date(now);
          d.setHours(d.getHours() - h, 0, 0, 0);
          return d.toISOString();
        };

        return {
          data: {
            generatedAt: now.toISOString(),
            alerts: [
              {
                id:           'ALT-001',
                title:        'Missing: Safety Questionnaire',
                body:         'SUB-7835 (Seattle PS) — required document not received.',
                submissionId: 'SUB-7835',
                severity:     'critical',
                createdAt:    hAgo(2),
              },
              {
                id:           'ALT-002',
                title:        'Review Overdue — 16 Days',
                body:         'SUB-7831 (Austin ISD) has been pending for 16 days.',
                submissionId: 'SUB-7831',
                severity:     'critical',
                createdAt:    todayHAgo(5),
              },
              {
                id:           'ALT-003',
                title:        'Open Litigation Flagged',
                body:         'SUB-7829 (Riverside USD) — CLM-2021-027 in mediation.',
                submissionId: 'SUB-7829',
                severity:     'warning',
                createdAt:    '2026-03-18T10:00:00.000Z',
              },
              {
                id:           'ALT-004',
                title:        'Low Appetite Score: 41/100',
                body:         'SUB-7834 (Phoenix Charter) — below threshold of 50.',
                submissionId: 'SUB-7834',
                severity:     'warning',
                createdAt:    '2026-03-25T10:00:00.000Z',
              },
              {
                id:           'ALT-005',
                title:        'Quote Expiring in 5 Days',
                body:         'SUB-7830 (San Diego City) quote expires Apr 24.',
                submissionId: 'SUB-7830',
                severity:     'warning',
                createdAt:    todayHAgo(6),
              },
              {
                id:           'ALT-006',
                title:        'Missing: Background Check Policy',
                body:         'SUB-7838 (Chicago Lab) — compliance doc outstanding.',
                submissionId: 'SUB-7838',
                severity:     'info',
                createdAt:    dAgo(3),
              },
            ],
          },
        };
      },
      providesTags: ['Alerts'],
    }),
  }),
});

export const { useGetAlertsQuery } = alertsApi;
