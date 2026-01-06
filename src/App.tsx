import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { DemoSessionProvider, useDemoSession } from "@/context/DemoSessionContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Policies from "./pages/Policies";
import Requests from "./pages/Requests";
import Violations from "./pages/Violations";
import AuditLogs from "./pages/AuditLogs";
import ProxyTest from "./pages/ProxyTest";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isSessionValid } = useDemoSession();
  
  if (!isSessionValid) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
}

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Index />} />
    <Route element={
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    }>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/policies" element={<Policies />} />
      <Route path="/requests" element={<Requests />} />
      <Route path="/violations" element={<Violations />} />
      <Route path="/audit" element={<AuditLogs />} />
      <Route path="/proxy" element={<ProxyTest />} />
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
