import { createBrowserRouter, Outlet } from "react-router";
import { CompanionProvider } from "./components/companion/CompanionContext";
import { Dashboard }        from "./pages/Dashboard";
import { Submissions }      from "./pages/Submissions";
import { SubmissionDetail } from "./pages/SubmissionDetail";
import { QuoteBuilder }       from "./pages/QuoteBuilder";
import { QuotePreviewPage }   from "./pages/QuotePreviewPage";
import { Login }            from "./pages/Login";
import { Unauthorized }     from "./pages/Unauthorized";
import { Inbox }            from "./pages/Inbox";
import { NewSubmissionPage } from "./pages/NewSubmissionPage";
import { TaskQueuePage }    from "./pages/TaskQueuePage";
import { PortfolioPage }    from "./pages/PortfolioPage";
import { AppetitePage }     from "./pages/AppetitePage";
import { RenewalsPage }     from "./pages/RenewalsPage";
import { ApprovalsPage }    from "./pages/ApprovalsPage";
import { NotificationsPage } from "./pages/NotificationsPage";
import { ActivityPage }     from "./pages/ActivityPage";
import { ProtectedRoute }   from "./components/ProtectedRoute";

function RootLayout() {
  return (
    <CompanionProvider>
      <Outlet />
    </CompanionProvider>
  );
}

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
  { path: "/login",        Component: Login },
  { path: "/unauthorized", Component: Unauthorized },
  {
    path: "/",
    element: <ProtectedRoute><Dashboard /></ProtectedRoute>,
  },
  {
    path: "/submissions",
    element: <ProtectedRoute><Submissions /></ProtectedRoute>,
  },
  {
    path: "/submissions/new",
    element: <ProtectedRoute><NewSubmissionPage /></ProtectedRoute>,
  },
  {
    path: "/submission/:id",
    element: <ProtectedRoute><SubmissionDetail /></ProtectedRoute>,
  },
  {
    path: "/submission/:id/quote",
    element: <ProtectedRoute><QuoteBuilder /></ProtectedRoute>,
  },
  {
    path: "/submission/:id/quote/preview",
    element: <ProtectedRoute><QuotePreviewPage /></ProtectedRoute>,
  },
  {
    path: "/inbox",
    element: <ProtectedRoute><Inbox /></ProtectedRoute>,
  },
  {
    path: "/tasks",
    element: <ProtectedRoute><TaskQueuePage /></ProtectedRoute>,
  },
  {
    path: "/portfolio",
    element: <ProtectedRoute><PortfolioPage /></ProtectedRoute>,
  },
  {
    path: "/appetite",
    element: <ProtectedRoute><AppetitePage /></ProtectedRoute>,
  },
  {
    path: "/renewals",
    element: <ProtectedRoute><RenewalsPage /></ProtectedRoute>,
  },
  {
    path: "/approvals",
    element: <ProtectedRoute><ApprovalsPage /></ProtectedRoute>,
  },
  {
    path: "/notifications",
    element: <ProtectedRoute><NotificationsPage /></ProtectedRoute>,
  },
  {
    path: "/activity",
    element: <ProtectedRoute><ActivityPage /></ProtectedRoute>,
  },
    ],
  },
]);
