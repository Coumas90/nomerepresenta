import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, Users, Image, Activity } from "lucide-react";
import { useAnalyticsStats } from "@/hooks/useAnalyticsStats";
import { useArtworks } from "@/hooks/useArtworks";
import VisitorsChart from "./analytics/VisitorsChart";
import { LoadingSkeleton } from "./LoadingSkeleton";
import { useNavigate } from "react-router-dom";

export const DashboardHome = () => {
  const navigate = useNavigate();
  const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const endDate = new Date();
  const { data: stats, isLoading: statsLoading } = useAnalyticsStats(startDate, endDate);
  const { data: artworks, isLoading: artworksLoading } = useArtworks();

  const metrics = statsLoading ? [] : [
    {
      title: "Total Visitors",
      value: stats?.totalVisitors || 0,
      subtitle: "Last 7 days",
      icon: Users,
      iconColor: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950/30",
    },
    {
      title: "Active Sessions",
      value: stats?.sessionsToday || 0,
      subtitle: "Today",
      icon: Activity,
      iconColor: "text-emerald-600",
      bgColor: "bg-emerald-50 dark:bg-emerald-950/30",
    },
    {
      title: "Total Artworks",
      value: artworks?.length || 0,
      subtitle: "Published",
      icon: Image,
      iconColor: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950/30",
    },
    {
      title: "Avg. Engagement",
      value: `${Math.round(stats?.avgTimeOnSite || 0)}s`,
      subtitle: "Time on site",
      icon: TrendingUp,
      iconColor: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-950/30",
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Welcome back! Here's an overview of your portfolio.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsLoading ? (
          <>
            <LoadingSkeleton type="metrics" />
            <LoadingSkeleton type="metrics" />
            <LoadingSkeleton type="metrics" />
            <LoadingSkeleton type="metrics" />
          </>
        ) : (
          metrics.map((metric) => (
            <Card 
              key={metric.title}
              className="transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {metric.title}
                </CardTitle>
                <div className={`p-2.5 rounded-lg ${metric.bgColor}`}>
                  <metric.icon className={`h-5 w-5 ${metric.iconColor}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold tracking-tight">{metric.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {metric.subtitle}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Visitors Trend</CardTitle>
          <CardDescription>Last 7 days activity</CardDescription>
        </CardHeader>
        <CardContent>
          {statsLoading ? (
            <LoadingSkeleton type="chart" />
          ) : (
            <VisitorsChart data={stats?.dailyVisitors || []} />
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => navigate("/admin?section=content-artworks")}
            >
              <Plus className="mr-2 h-4 w-4" />
              New Artwork
            </Button>
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => navigate("/admin?section=content-series")}
            >
              <Plus className="mr-2 h-4 w-4" />
              New Series
            </Button>
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => navigate("/admin?section=analytics-live")}
            >
              <Activity className="mr-2 h-4 w-4" />
              View Live Analytics
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest portfolio updates</CardDescription>
          </CardHeader>
          <CardContent>
            {artworksLoading ? (
              <div className="space-y-3">
                <LoadingSkeleton type="activity" />
                <LoadingSkeleton type="activity" />
                <LoadingSkeleton type="activity" />
              </div>
            ) : artworks && artworks.length > 0 ? (
              <div className="space-y-3">
                {artworks.slice(0, 3).map((artwork) => (
                  <div key={artwork.id} className="flex items-center gap-3">
                    <img 
                      src={artwork.image_url} 
                      alt={artwork.title}
                      className="h-10 w-10 rounded object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{artwork.title}</p>
                      <p className="text-xs text-muted-foreground">{artwork.year}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No artworks yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
