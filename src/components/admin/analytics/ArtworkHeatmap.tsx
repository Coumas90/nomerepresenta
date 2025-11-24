import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTopArtworks } from "@/hooks/useArtworkAnalytics";
import { Skeleton } from "@/components/ui/skeleton";

interface ArtworkHeatmapProps {
  startDate: Date;
  endDate: Date;
}

const ArtworkHeatmap = ({ startDate, endDate }: ArtworkHeatmapProps) => {
  const { data: artworks, isLoading } = useTopArtworks(startDate, endDate, 20);

  const getHeatColor = (value: number, max: number) => {
    const intensity = max > 0 ? value / max : 0;
    if (intensity > 0.75) return 'bg-red-500/20 border-red-500';
    if (intensity > 0.5) return 'bg-orange-500/20 border-orange-500';
    if (intensity > 0.25) return 'bg-yellow-500/20 border-yellow-500';
    return 'bg-green-500/20 border-green-500';
  };

  const getEngagementRate = (hovers: number, clicks: number, views: number) => {
    if (views === 0) return 0;
    return Math.round(((hovers + clicks * 2) / (views * 3)) * 100);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Artwork Engagement Heatmap</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!artworks || artworks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Artwork Engagement Heatmap</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No artwork data available for the selected period.</p>
        </CardContent>
      </Card>
    );
  }

  const maxViews = Math.max(...artworks.map(a => a.total_views));
  const groupedBySeries = artworks.reduce((acc, artwork) => {
    if (!acc[artwork.series_name]) {
      acc[artwork.series_name] = [];
    }
    acc[artwork.series_name].push(artwork);
    return acc;
  }, {} as Record<string, typeof artworks>);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Artwork Engagement Heatmap</CardTitle>
        <p className="text-sm text-muted-foreground">
          Color intensity indicates view count. Engagement score combines hovers and detail clicks.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.entries(groupedBySeries).map(([seriesName, seriesArtworks]) => (
          <div key={seriesName}>
            <h3 className="font-semibold mb-3 text-lg">{seriesName}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {seriesArtworks.map((artwork) => {
                const engagementRate = getEngagementRate(
                  artwork.total_hovers,
                  artwork.detail_clicks,
                  artwork.total_views
                );
                
                return (
                  <div
                    key={artwork.artwork_id}
                    className={`p-4 rounded-lg border-2 transition-all hover:scale-105 ${getHeatColor(artwork.total_views, maxViews)}`}
                  >
                    <h4 className="font-medium text-sm mb-2 line-clamp-1">{artwork.title}</h4>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Views:</span>
                        <span className="font-semibold">{artwork.total_views}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Avg Duration:</span>
                        <span className="font-semibold">{artwork.avg_view_duration}s</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Hovers:</span>
                        <span className="font-semibold">{artwork.total_hovers}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Detail Clicks:</span>
                        <span className="font-semibold">{artwork.detail_clicks}</span>
                      </div>
                      <div className="flex justify-between pt-1 border-t">
                        <span className="text-muted-foreground">Engagement:</span>
                        <span className="font-bold">{engagementRate}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default ArtworkHeatmap;
