import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Builder from "@/pages/Builder";
import Preview from "@/pages/Preview";
import ShareForm from "@/pages/ShareForm";
import Login from "@/pages/Login";
import Profile from "@/pages/Profile";
import Landing from "@/pages/Landing";
import { useUser } from "@/hooks/useAuth";
import { Header } from "@/components/Header";

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="login-loading">
        <div className="login-spinner" />
      </div>
    );
  }

  if (!user) return <Redirect to="/login" />;
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/" component={Landing} />
      <Route path="/dashboard">
        <AuthGuard>
          <Home />
        </AuthGuard>
      </Route>
      <Route path="/builder">
        <AuthGuard>
          <Builder />
        </AuthGuard>
      </Route>
      <Route path="/profile">
        <AuthGuard>
          <Profile />
        </AuthGuard>
      </Route>
      <Route path="/builder/:id">
        <AuthGuard>
          <Builder />
        </AuthGuard>
      </Route>
      <Route path="/preview/:id" component={Preview} />
      <Route path="/share/:shareId/:slug?" component={ShareForm} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
