import { SidebarTrigger } from "@/components/ui/sidebar";
import { AdminBreadcrumbs } from "./AdminBreadcrumbs";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const AdminHeader = () => {
  const navigate = useNavigate();

  return (
    <header className="h-14 border-b border-border flex items-center justify-between px-4 gap-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="h-8 w-8" />
        <AdminBreadcrumbs />
      </div>
      
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => navigate("/")}
        className="gap-2"
      >
        <ExternalLink className="h-4 w-4" />
        <span className="hidden sm:inline">View Site</span>
      </Button>
    </header>
  );
};
