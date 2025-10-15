import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import Home from "@/pages/Home";
import Landing from "@/pages/Landing";
import Projects from "@/pages/Projects";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  // Always register all routes to avoid 404s during auth loading
  return (
    <Switch>
      <Route path="/">
        {() => (isLoading || !isAuthenticated ? <Landing /> : <Home />)}
      </Route>
      <Route path="/projects">
        {() => (isLoading || !isAuthenticated ? <Landing /> : <Projects />)}
      </Route>
      <Route path="/projects/:id">
        {() => (isLoading || !isAuthenticated ? <Landing /> : <Projects />)}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="relative min-h-screen">
          {/* Theme Toggle - Fixed Position */}
          <div className="fixed top-4 right-4 z-50">
            <ThemeToggle />
          </div>
          
          <Router />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
