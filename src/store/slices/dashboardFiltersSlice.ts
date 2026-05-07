import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

type SubmissionScope = 'mine' | 'group';
type TaskScope = 'all' | 'mine' | 'overdue';
type AlertScope = 'all' | 'critical' | 'warning';

interface DashboardFiltersState {
  submissionsScope: SubmissionScope;
  tasksScope: TaskScope;
  alertsScope: AlertScope;
}

const initialState: DashboardFiltersState = {
  submissionsScope: 'mine',
  tasksScope: 'all',
  alertsScope: 'all',
};

const dashboardFiltersSlice = createSlice({
  name: 'dashboardFilters',
  initialState,
  reducers: {
    setSubmissionsScope(state, action: PayloadAction<SubmissionScope>) {
      state.submissionsScope = action.payload;
    },
    setTasksScope(state, action: PayloadAction<TaskScope>) {
      state.tasksScope = action.payload;
    },
    setAlertsScope(state, action: PayloadAction<AlertScope>) {
      state.alertsScope = action.payload;
    },
  },
});

export const { setSubmissionsScope, setTasksScope, setAlertsScope } =
  dashboardFiltersSlice.actions;
export const dashboardFiltersReducer = dashboardFiltersSlice.reducer;
