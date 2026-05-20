import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQuery } from '@/services/baseQuery';
import type { Task } from '@/shared/types';

// TODO: replace queryFn with query: () => '/api/tasks' when backend is ready.
// Real endpoint must compute isOverdue server-side based on current date.
// Mock computes it inline against 2026-04-29 (project current date).
const MOCK_TASKS: Task[] = [
  { id: 'TSK-1042', title: 'Obtain open claims detail from broker',      submissionId: 'SUB-7829', dueDate: 'Apr 20, 2026', priority: 'Critical', isOverdue: true,  isMine: true  },
  { id: 'TSK-1043', title: 'Review application for Stanford University', submissionId: 'SUB-7834', dueDate: 'Apr 28, 2026', priority: 'High',     isOverdue: true,  isMine: true  },
  { id: 'TSK-1044', title: 'Request loss run history from prior carrier',submissionId: 'SUB-7830', dueDate: 'May 5, 2026',  priority: 'Medium',   isOverdue: false, isMine: true  },
  { id: 'TSK-1045', title: 'Verify enrollment figures with district',    submissionId: 'SUB-7831', dueDate: 'May 10, 2026', priority: 'Low',      isOverdue: false, isMine: false },
  { id: 'TSK-1046', title: 'Confirm effective date with broker',         submissionId: 'SUB-7832', dueDate: 'Apr 15, 2026', priority: 'High',     isOverdue: true,  isMine: false },
  { id: 'TSK-1047', title: 'Gather prior carrier information',           submissionId: 'SUB-7835', dueDate: 'May 20, 2026', priority: 'Medium',   isOverdue: false, isMine: true  },
  { id: 'TSK-1048', title: 'Underwrite Boston Public Schools renewal',   submissionId: 'SUB-7837', dueDate: 'Apr 25, 2026', priority: 'Critical', isOverdue: true,  isMine: false },
  { id: 'TSK-1049', title: "Bind coverage for St. Catherine's Academy",  submissionId: 'SUB-7832', dueDate: 'Jun 1, 2026',  priority: 'Low',      isOverdue: false, isMine: false },
];

export const tasksApi = createApi({
  reducerPath: 'tasksApi',
  baseQuery,
  tagTypes: ['Task'],
  endpoints: (builder) => ({
    getTasks: builder.query<Task[], void>({
      queryFn: async () => ({ data: MOCK_TASKS }),
      providesTags: ['Task'],
    }),
  }),
});

export const { useGetTasksQuery } = tasksApi;
