import { combineReducers, configureStore } from '@reduxjs/toolkit';
import {
  persistReducer,
  persistStore,
  FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER,
} from 'redux-persist';
import { rootPersistConfig } from './persist/persistConfig';
import { dashboardApi }   from '@/services/dashboard/dashboardApi';
import { submissionsApi } from '@/services/submissions/submissionsApi';
import { tasksApi }       from '@/services/tasks/tasksApi';
import { portfolioApi }   from '@/services/portfolio/portfolioApi';
import { pipelineApi }         from '@/services/pipeline/pipelineApi';
import { teamPerformanceApi }  from '@/services/teamPerformance/teamPerformanceApi';
import { alertsApi }           from '@/services/alerts/alertsApi';
import { authReducer }             from '@/store/slices/authSlice';
import { dashboardFiltersReducer } from '@/store/slices/dashboardFiltersSlice';
import { uiReducer }               from '@/store/ui/uiSlice';

const rootReducer = combineReducers({
  auth:             authReducer,
  ui:               uiReducer,
  dashboardFilters: dashboardFiltersReducer,
  [dashboardApi.reducerPath]:   dashboardApi.reducer,
  [submissionsApi.reducerPath]: submissionsApi.reducer,
  [tasksApi.reducerPath]:       tasksApi.reducer,
  [portfolioApi.reducerPath]:   portfolioApi.reducer,
  [pipelineApi.reducerPath]:          pipelineApi.reducer,
  [teamPerformanceApi.reducerPath]:   teamPerformanceApi.reducer,
  [alertsApi.reducerPath]:            alertsApi.reducer,
});

// Cast needed: persistReducer wraps state with Partial<S> which conflicts with
// RTK Query middleware typings. RootState is derived from rootReducer directly.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const persistedReducer = persistReducer(rootPersistConfig, rootReducer as any) as any;

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefault) =>
    getDefault({
      serializableCheck: {
        // redux-persist dispatches non-serializable actions during rehydration
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    })
      .concat(dashboardApi.middleware)
      .concat(submissionsApi.middleware)
      .concat(tasksApi.middleware)
      .concat(portfolioApi.middleware)
      .concat(pipelineApi.middleware)
      .concat(teamPerformanceApi.middleware)
      .concat(alertsApi.middleware),
});

export const persistor = persistStore(store);
export type RootState  = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
