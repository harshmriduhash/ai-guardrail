import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { DemoSessionProvider, useDemoSession } from "@/context/DemoSessionContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

// Pages
import Landing from "./pages/Landing";
import FeaturesPage from "./pages/FeaturesPage";
import PricingPage from "./pages/PricingPage";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Policies from "./pages/Policies";
import Requests from "./pages/Requests";
import Violations from "./pages/Violations";
import AuditLogs from "./pages/AuditLogs";
import ProxyTest from "./pages/ProxyTest";
import ApiDocs from "./pages/ApiDocs";
import NotFound from "./pages/NotFound";

// Demo gate for non-authenticated demo access
import { DemoGate } from "@/components/DemoGate";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isSessionValid } = useDemoSession();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
    </div>;
  }

  // Allow access if user is authenticated OR has valid demo session
  if (!user && !isSessionValid) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}

const AppRoutes = () => (
  <Routes>
    {/* Public marketing pages */}
    <Route path="/" element={<Landing />} />
    <Route path="/features" element={<FeaturesPage />} />
    <Route path="/pricing" element={<PricingPage />} />
    <Route path="/auth" element={<Auth />} />
    <Route path="/demo" element={<DemoGate />} />

    {/* Protected dashboard routes */}
    <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/policies" element={<Policies />} />
      <Route path="/requests" element={<Requests />} />
      <Route path="/violations" element={<Violations />} />
      <Route path="/audit" element={<AuditLogs />} />
      <Route path="/proxy" element={<ProxyTest />} />
      <Route path="/docs" element={<ApiDocs />} />
    </Route>

    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <DemoSessionProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </DemoSessionProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
