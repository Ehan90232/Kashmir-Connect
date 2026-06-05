import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/layout/AppLayout";
import NotFound from "@/pages/not-found";

import Home from "@/pages/Home";
import WorkersList from "@/pages/WorkersList";
import WorkerProfile from "@/pages/WorkerProfile";
import RegisterWorker from "@/pages/RegisterWorker";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Admin from "@/pages/Admin";
import RateWorker from "@/pages/RateWorker";
import Signup from "@/pages/Signup";
import RequestWorker from "@/pages/RequestWorker";

const queryClient = new QueryClient();

function Router() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/workers" component={WorkersList} />
        <Route path="/workers/:id" component={WorkerProfile} />
        <Route path="/register" component={RegisterWorker} />
        <Route path="/login" component={Login} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/admin" component={Admin} />
        <Route path="/rate/:workerId" component={RateWorker} />
        <Route path="/signup" component={Signup} />
        <Route path="/request" component={RequestWorker} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
