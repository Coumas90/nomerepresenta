import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebarSkeleton } from "./layout/AdminSidebarSkeleton";
import { AdminHeaderSkeleton } from "./layout/AdminHeaderSkeleton";
import { LoadingSkeleton } from "./LoadingSkeleton";

export const AdminLoadingSkeleton = () => {
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
};
