import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAnalyticsStats } from "@/hooks/useAnalyticsStats";
import { Users, Clock, Image, Eye } from "lucide-react";
import VisitorsChart from "./VisitorsChart";

interface AnalyticsOverviewProps {
  startDate: Date;
  endDate: Date;
}

const AnalyticsOverview = ({ startDate, endDate }: AnalyticsOverviewProps) => {
  const { data: stats, isLoading } = useAnalyticsStats(startDate, endDate);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  if (isLoading) {
    return <div className="text-muted-foreground">Cargando estadísticas...</div>;
  }

  const metrics = [
    {
      title: "Visitantes Totales",
      value: stats?.totalVisitors || 0,
      subtitle: "Últimos 30 días",
      icon: Users,
      color: "text-blue-500",
    },
    {
      title: "Sesiones Hoy",
      value: stats?.sessionsToday || 0,
      subtitle: "Visitas de hoy",
      icon: Eye,
      color: "text-green-500",
    },
    {
      title: "Tiempo Promedio",
      value: formatDuration(stats?.avgTimeOnSite || 0),
      subtitle: "Por sesión",
      icon: Clock,
      color: "text-orange-500",
    },
    {
      title: "Obras por Sesión",
      value: stats?.avgArtworksPerSession || 0,
      subtitle: "Promedio visto",
      icon: Image,
      color: "text-purple-500",
    },
  ];

  return (
    <div className="space-y-6">
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

      <VisitorsChart startDate={startDate} endDate={endDate} />
    </div>
  );
};

export default AnalyticsOverview;
