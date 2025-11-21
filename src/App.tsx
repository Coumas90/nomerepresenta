import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Index from "./pages/Index";
import ArtworkDetail from "./pages/ArtworkDetail";
import Admin from "./pages/Admin";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Component to handle old recovery links that land on root with hash
const RecoveryRedirectHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if we have a recovery token in the URL hash
    const hash = window.location.hash;
    
    if (hash.includes('access_token') && hash.includes('type=recovery')) {
      console.log('🔄 Detected recovery link, redirecting to /reset-password');
      
      // Only redirect if we're not already on /reset-password
      if (location.pathname !== '/reset-password') {
        navigate('/reset-password' + hash, { replace: true });
      }
    }
  }, [navigate, location.pathname]);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <RecoveryRedirectHandler />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/artwork/:id" element={<ArtworkDetail />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute requireAdmin={true}>
                <Admin />
              </ProtectedRoute>
            } 
          />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
