import { Skeleton } from "@/components/ui/skeleton";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuItem } from "@/components/ui/sidebar";

export const AdminSidebarSkeleton = () => {
  return (
    <Sidebar className="w-60" collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>
            <Skeleton className="h-4 w-16" />
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <Skeleton className="h-9 w-full" />
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>
            <Skeleton className="h-4 w-20" />
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {[...Array(6)].map((_, i) => (
                <SidebarMenuItem key={i}>
                  <Skeleton className="h-9 w-full" />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>
            <Skeleton className="h-4 w-20" />
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {[...Array(2)].map((_, i) => (
                <SidebarMenuItem key={i}>
                  <Skeleton className="h-9 w-full" />
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <Skeleton className="h-10 w-full" />
      </SidebarFooter>
    </Sidebar>
  );
};
