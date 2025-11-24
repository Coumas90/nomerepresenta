import { SidebarTrigger } from "@/components/ui/sidebar";
import { AdminBreadcrumbs } from "./AdminBreadcrumbs";

export const AdminHeader = () => {
  return (
    <header className="h-14 border-b border-border flex items-center px-4 gap-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <SidebarTrigger className="h-8 w-8" />
      <AdminBreadcrumbs />
    </header>
  );
};
