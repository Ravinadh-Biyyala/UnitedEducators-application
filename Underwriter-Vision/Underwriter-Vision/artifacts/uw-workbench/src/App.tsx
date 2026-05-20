import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AnimatePresence, motion } from "framer-motion";
import NotFound from "@/pages/not-found";
import { AppShell } from "@/components/AppShell";
import { CompanionProvider } from "@/components/companion/CompanionContext";
import { Home } from "@/pages/Home";
import { Submissions } from "@/pages/Submissions";
import { NewSubmission } from "@/pages/NewSubmission";
import { SubmissionDetail } from "@/pages/SubmissionDetail";
import { SubmissionReview } from "@/pages/SubmissionReview";
import { QuoteBuilder } from "@/pages/QuoteBuilder";
import { QuotePreview } from "@/pages/QuotePreview";
import { Inbox } from "@/pages/Inbox";
import { Tasks } from "@/pages/Tasks";
import { Portfolio } from "@/pages/Portfolio";
import { Appetite } from "@/pages/Appetite";
import { Login } from "@/pages/Login";

const queryClient = new QueryClient();

function ShellRoutes() {
  const [location] = useLocation();
  return (
    <AppShell>
      <AnimatePresence mode="wait">
        <motion.div
          key={location}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        >
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/submissions/new" component={NewSubmission} />
            <Route path="/submissions" component={Submissions} />
            <Route path="/submission/:id/review" component={SubmissionReview} />
            <Route path="/submission/:id/quote/preview" component={QuotePreview} />
            <Route path="/submission/:id/quote" component={QuoteBuilder} />
            <Route path="/submission/:id" component={SubmissionDetail} />
            <Route path="/inbox" component={Inbox} />
            <Route path="/tasks" component={Tasks} />
            <Route path="/portfolio" component={Portfolio} />
            <Route path="/appetite" component={Appetite} />
            <Route component={NotFound} />
          </Switch>
        </motion.div>
      </AnimatePresence>
    </AppShell>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route component={ShellRoutes} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider delayDuration={140}>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <CompanionProvider>
            <Router />
          </CompanionProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
