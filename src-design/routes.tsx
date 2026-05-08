import { createBrowserRouter } from "react-router";
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
import { ProtectedRoute }   from "./components/ProtectedRoute";

export const router = createBrowserRouter([
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
]);
