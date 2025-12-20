import { 
  LayoutDashboard, 
  BarChart3, 
  Activity, 
  Image, 
  Layers,
  Users,
  Clock,
  FolderOpen,
  Camera,
  Settings
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

const analyticsItems = [
  { title: "Live", url: "/admin?section=analytics-live", icon: Activity },
  { title: "Overview", url: "/admin?section=analytics-overview", icon: BarChart3 },
  { title: "Artworks", url: "/admin?section=analytics-artworks", icon: Image },
  { title: "Series", url: "/admin?section=analytics-series", icon: Layers },
  { title: "Audience", url: "/admin?section=analytics-audience", icon: Users },
  { title: "Sessions", url: "/admin?section=analytics-sessions", icon: Clock },
];

const contentItems = [
  { title: "Artworks", url: "/admin?section=content-artworks", icon: Image },
  { title: "Series", url: "/admin?section=content-series", icon: FolderOpen },
  { title: "Studio", url: "/admin?section=content-studio", icon: Camera },
];

const settingsItems = [
  { title: "Compression", url: "/admin?section=settings-compression", icon: Settings },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const collapsed = state === "collapsed";

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <TooltipProvider>
      <Sidebar className={collapsed ? "w-14" : "w-60"} collapsible="icon">
        <SidebarHeader className={collapsed ? "items-center py-4" : "py-4 px-4"}>
          <div className={collapsed ? "text-center" : ""}>
            <h2 className={`font-bold tracking-tight ${collapsed ? "text-xs" : "text-lg"}`}>
              IVAN COMAS
            </h2>
          </div>
        </SidebarHeader>
        
        <Separator />
        
        <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? "opacity-0" : ""}>
            Main
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink 
                    to="/admin"
                    className="hover:bg-muted/50" 
                    activeClassName="bg-muted text-primary font-medium"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    {!collapsed && <span>Dashboard</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? "opacity-0" : ""}>
            Analytics
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {analyticsItems.map((item) => {
                const menuButton = (
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url}
                      className="hover:bg-muted/50 transition-colors" 
                      activeClassName="bg-muted text-primary font-medium"
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                      {item.title === "Live" && !collapsed && (
                        <span className="ml-auto flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-lg shadow-emerald-500/50"></span>
                        </span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                );

                return (
                  <SidebarMenuItem key={item.title}>
                    {collapsed ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          {menuButton}
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          <p>{item.title}</p>
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      menuButton
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? "opacity-0" : ""}>
            Content
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {contentItems.map((item) => {
                const menuButton = (
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url}
                      className="hover:bg-muted/50 transition-colors" 
                      activeClassName="bg-muted text-primary font-medium"
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                );

                return (
                  <SidebarMenuItem key={item.title}>
                    {collapsed ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          {menuButton}
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          <p>{item.title}</p>
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      menuButton
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className={collapsed ? "opacity-0" : ""}>
            Settings
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsItems.map((item) => {
                const menuButton = (
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url}
                      className="hover:bg-muted/50 transition-colors" 
                      activeClassName="bg-muted text-primary font-medium"
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                );

                return (
                  <SidebarMenuItem key={item.title}>
                    {collapsed ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          {menuButton}
                        </TooltipTrigger>
                        <TooltipContent side="right">
                          <p>{item.title}</p>
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      menuButton
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              {collapsed ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      onClick={handleSignOut}
                      className="w-full justify-center hover:bg-muted/50 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>Sign Out</p>
                  </TooltipContent>
                </Tooltip>
              ) : (
                <Button 
                  variant="ghost" 
                  onClick={handleSignOut}
                  className="w-full justify-start hover:bg-muted/50 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="ml-2">Sign Out</span>
                </Button>
              )}
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
    </TooltipProvider>
  );
}
