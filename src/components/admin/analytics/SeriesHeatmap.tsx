import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSeriesHeatmap } from "@/hooks/useSeriesAnalytics";
import { Flame } from "lucide-react";

interface SeriesHeatmapProps {
  startDate: Date;
  endDate: Date;
}

const SeriesHeatmap = ({ startDate, endDate }: SeriesHeatmapProps) => {
  const { data: series, isLoading } = useSeriesHeatmap(startDate, endDate);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Heatmap de Series</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground">Cargando datos...</div>
        </CardContent>
      </Card>
    );
  }

  // Calculate max values for normalization
  const maxInteractions = Math.max(...(series?.map(s => s.total_interactions) || [1]));
  const maxViews = Math.max(...(series?.map(s => s.total_artwork_views) || [1]));

  const getHeatColor = (value: number, max: number) => {
    const intensity = (value / max) * 100;
    if (intensity >= 80) return 'bg-red-500/20 border-red-500/50 text-red-700 dark:text-red-300';
    if (intensity >= 60) return 'bg-orange-500/20 border-orange-500/50 text-orange-700 dark:text-orange-300';
    if (intensity >= 40) return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-700 dark:text-yellow-300';
    if (intensity >= 20) return 'bg-blue-500/20 border-blue-500/50 text-blue-700 dark:text-blue-300';
    return 'bg-muted/50 border-border text-muted-foreground';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-orange-500" />
          Heatmap de Series por Popularidad
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {series?.map((s) => {
            const heatClass = getHeatColor(s.total_interactions, maxInteractions);
            
            return (
              <div
                key={s.series_id}
                className={`p-4 rounded-lg border-2 transition-all ${heatClass}`}
              >
                <h3 className="font-semibold text-lg mb-3">{s.series_name}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="opacity-80">Interacciones:</span>
                    <span className="font-bold">{s.total_interactions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-80">Descripciones expandidas:</span>
                    <span className="font-bold">{s.description_expansions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-80">Vistas de obras:</span>
                    <span className="font-bold">{s.total_artwork_views}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-80">Sesiones únicas:</span>
                    <span className="font-bold">{s.unique_sessions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-80">Obras/sesión:</span>
                    <span className="font-bold">{s.avg_artworks_per_session}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {(!series || series.length === 0) && (
          <div className="text-center py-8 text-muted-foreground">
            No hay datos disponibles
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SeriesHeatmap;
