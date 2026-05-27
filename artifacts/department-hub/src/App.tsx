import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth";
import NotFound from "@/pages/not-found";
import { AppLayout } from "@/components/layout/app-layout";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import Events from "@/pages/events";
import EventDetail from "@/pages/event-detail";
import Progress from "@/pages/progress";
import AiInsights from "@/pages/ai-insights";
import Users from "@/pages/users";
import Departments from "@/pages/departments";
import Settings from "@/pages/settings";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function ProtectedRoute({ component: Component }: { component: React.ComponentType<any> }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Redirect to="/login" />;
  return (
    <AppLayout>
      <Component />
    </AppLayout>
  );
}

function Home() {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Redirect to="/login" />;
  return <Redirect to="/dashboard" />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      
      {/* Protected Routes */}
      <Route path="/dashboard"><ProtectedRoute component={Dashboard} /></Route>
      <Route path="/events"><ProtectedRoute component={Events} /></Route>
      <Route path="/events/:id"><ProtectedRoute component={EventDetail} /></Route>
      <Route path="/progress"><ProtectedRoute component={Progress} /></Route>
      <Route path="/ai-insights"><ProtectedRoute component={AiInsights} /></Route>
      <Route path="/users"><ProtectedRoute component={Users} /></Route>
      <Route path="/departments"><ProtectedRoute component={Departments} /></Route>
      <Route path="/settings"><ProtectedRoute component={Settings} /></Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
        </AuthProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;