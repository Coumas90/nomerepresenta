import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAnalyticsStats } from "@/hooks/useAnalyticsStats";
import VisitorsChart from "./VisitorsChart";
import { Users, Activity, Clock, Eye } from "lucide-react";
import { LoadingSkeleton } from "../LoadingSkeleton";

interface AnalyticsOverviewProps {
  startDate: Date;
  endDate: Date;
}

const AnalyticsOverview = ({ startDate, endDate }: AnalyticsOverviewProps) => {
  const { data: stats, isLoading } = useAnalyticsStats(startDate, endDate);

  if (isLoading) {
    return <LoadingSkeleton type="analytics" />;
  }

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  };

  const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

  const metrics = [
    {
      title: "Total Visitors",
      value: stats?.totalVisitors || 0,
      subtitle: `Last ${daysDiff} days`,
      icon: Users,
      color: "text-blue-500",
    },
    {
      title: "Sessions Today",
      value: stats?.sessionsToday || 0,
      subtitle: "Active sessions",
      icon: Activity,
      color: "text-green-500",
    },
    {
      title: "Average Time",
      value: formatDuration(stats?.avgTimeOnSite || 0),
      subtitle: "On site",
      icon: Clock,
      color: "text-purple-500",
    },
    {
      title: "Artworks/Session",
      value: (stats?.avgArtworksPerSession || 0).toFixed(1),
      subtitle: "Average views",
      icon: Eye,
      color: "text-orange-500",
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.title}
              </CardTitle>
              <metric.icon className={`h-4 w-4 ${metric.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-muted-foreground">
                {metric.subtitle}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Visitors Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <VisitorsChart data={stats?.dailyVisitors || []} />
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsOverview;
