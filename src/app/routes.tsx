import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from '@/components/layout';

const DashboardPage = lazy(() =>
  import('@/features/dashboard').then((m) => ({ default: m.DashboardPage })),
);
const LoginPage = lazy(() =>
  import('@/features/login').then((m) => ({ default: m.LoginPage })),
);
const SubmissionsPage = lazy(() =>
  import('@/features/submissions').then((m) => ({ default: m.SubmissionsPage })),
);
const SubmissionsNewPage = lazy(() =>
  import('@/features/submissions').then((m) => ({ default: m.SubmissionsNewPage })),
);
const SubmissionDetailPage = lazy(() =>
  import('@/features/submissions').then((m) => ({ default: m.SubmissionDetailPage })),
);

export function AppRoutes() {
  return (
    <Suspense fallback={<div className="p-6">Loading…</div>}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<AppShell />}>
          <Route path="/dashboard"       element={<DashboardPage />} />
          <Route path="/submissions" element={<Navigate to="/submissions/UE-submission-list-my-queue" replace />} />
          <Route path="/submissions/UE-submission-list-my-queue" element={<SubmissionsPage scope="mine" />} />
          <Route path="/submissions/UE-submission-list-my-team"  element={<SubmissionsPage scope="team" />} />
          <Route path="/submissions/UE-submission-list-all"      element={<SubmissionsPage scope="all" />} />
          <Route path="/submissions/new"  element={<SubmissionsNewPage />} />
          <Route path="/submissions/:id"  element={<SubmissionDetailPage />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
}
