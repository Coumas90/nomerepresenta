import { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebarSkeleton } from "@/components/admin/layout/AdminSidebarSkeleton";
import { AdminHeaderSkeleton } from "@/components/admin/layout/AdminHeaderSkeleton";
import { LoadingSkeleton } from "@/components/admin/LoadingSkeleton";

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { data: userRole, isLoading: roleLoading } = useUserRole(user?.id);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  if (authLoading || roleLoading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <AdminSidebarSkeleton />
          <div className="flex-1 flex flex-col">
            <AdminHeaderSkeleton />
            <main className="flex-1 p-6">
              <LoadingSkeleton type="dashboard" />
            </main>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  if (!user) {
    return null;
  }

  if (requireAdmin && userRole !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="text-center space-y-4 max-w-md">
          <Shield className="h-16 w-16 mx-auto text-destructive" />
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="text-muted-foreground">
            You don't have permission to access this page. Admin privileges are required.
          </p>
          <Button onClick={() => navigate("/")} variant="outline">
            Go to Home
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
