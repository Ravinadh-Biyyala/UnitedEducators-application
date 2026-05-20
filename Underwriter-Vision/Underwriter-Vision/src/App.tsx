import { Switch, Route } from "wouter";
import { MainLayout } from "./layouts/MainLayout";
import { Home } from "./pages/Home";
import { Submissions } from "./pages/Submissions";
import { SubmissionDetail } from "./pages/SubmissionDetail";
import { Inbox } from "./pages/Inbox";
import { Tasks } from "./pages/Tasks";
import { Portfolio } from "./pages/Portfolio";
import { Appetite } from "./pages/Appetite";
import { Login } from "./pages/Login";

export default function App() {
  const base = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";
  
  return (
    <Switch base={base}>
      <Route path="/login" component={Login} />
      <Route>
        <MainLayout>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/submissions" component={Submissions} />
            <Route path="/submission/:id" component={SubmissionDetail} />
            <Route path="/inbox" component={Inbox} />
            <Route path="/tasks" component={Tasks} />
            <Route path="/portfolio" component={Portfolio} />
            <Route path="/appetite" component={Appetite} />
            <Route>
              <div className="flex-1 flex items-center justify-center bg-background min-h-[calc(100vh-64px)]">
                <div className="text-center">
                  <h1 className="text-4xl font-display font-bold text-foreground mb-4">404</h1>
                  <p className="text-muted-foreground">Page not found</p>
                </div>
              </div>
            </Route>
          </Switch>
        </MainLayout>
      </Route>
    </Switch>
  );
}