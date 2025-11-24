import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useArtworkEngagement } from "@/hooks/useArtworkAnalytics";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ArtworkEngagementChartProps {
  startDate: Date;
  endDate: Date;
}

const ArtworkEngagementChart = ({ startDate, endDate }: ArtworkEngagementChartProps) => {
  const { data: engagement, isLoading } = useArtworkEngagement(startDate, endDate);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Engagement por Obra (Top 15)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center text-muted-foreground">
            Cargando datos...
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = engagement?.map(e => ({
    title: e.title.length > 20 ? e.title.substring(0, 20) + '...' : e.title,
    duration: e.avg_duration,
    views: e.total_views,
  })) || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tiempo Promedio de Visualización (Top 15)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              type="number" 
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              label={{ value: 'Segundos', position: 'insideBottom', offset: -5 }}
            />
            <YAxis 
              type="category"
              dataKey="title" 
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              width={150}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              formatter={(value: number) => [`${value}s`, 'Duración']}
            />
            <Bar 
              dataKey="duration" 
              fill="hsl(var(--primary))" 
              radius={[0, 4, 4, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default ArtworkEngagementChart;
