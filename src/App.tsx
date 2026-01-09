import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useEffect, lazy, Suspense } from "react";
import Landing from "./pages/Landing";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";
import { AdminLoadingFallback } from "./components/admin/AdminLoadingFallback";
import { OfflineIndicator } from "./components/OfflineIndicator";

// Code splitting para páginas públicas
const ArtworkDetail = lazy(() => import("./pages/ArtworkDetail"));
const WorksPage = lazy(() => import("./pages/WorksPage"));
const Studio = lazy(() => import("./pages/Studio"));
const Bio = lazy(() => import("./pages/Bio"));
const Admin = lazy(() => import("./pages/Admin"));
const Auth = lazy(() => import("./pages/Auth"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Install = lazy(() => import("./pages/Install"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos - artworks no cambian frecuentemente
      gcTime: 10 * 60 * 1000, // 10 minutos en cache (anteriormente cacheTime)
      refetchOnWindowFocus: false, // No refetch al volver al tab
      refetchOnMount: false, // No refetch si hay data en cache
    },
  },
});

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
      <OfflineIndicator />
      <BrowserRouter>
        <RecoveryRedirectHandler />
        <Suspense fallback={
          <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-sm text-muted-foreground">Loading...</p>
            </div>
          </div>
        }>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/works" element={
              <Suspense fallback={<div className="min-h-screen bg-stone-100" />}>
                <WorksPage />
              </Suspense>
            } />
            <Route path="/artwork/:id" element={<ArtworkDetail />} />
            <Route path="/studio" element={
              <Suspense fallback={<div className="min-h-screen bg-stone-100" />}>
                <Studio />
              </Suspense>
            } />
            <Route path="/bio" element={
              <Suspense fallback={<div className="min-h-screen bg-background" />}>
                <Bio />
              </Suspense>
            } />
            <Route path="/auth" element={<Auth />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/install" element={<Install />} />
            <Route 
              path="/admin" 
              element={
                <Suspense fallback={<AdminLoadingFallback />}>
                  <ProtectedRoute requireAdmin={true}>
                    <Admin />
                  </ProtectedRoute>
                </Suspense>
              } 
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
