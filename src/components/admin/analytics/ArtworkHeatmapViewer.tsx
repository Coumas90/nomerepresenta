import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useArtworks } from "@/hooks/useArtworks";
import { useArtworkHeatmap } from "@/hooks/useArtworkHeatmap";
import ArtworkHeatmapOverlay from "@/components/artwork/ArtworkHeatmapOverlay";
import { Eye, TrendingUp } from "lucide-react";

const ArtworkHeatmapViewer = () => {
  const { data: artworks, isLoading: artworksLoading } = useArtworks();
  const [selectedArtworkId, setSelectedArtworkId] = useState<string>('');
  const [timeRange, setTimeRange] = useState<number>(30);
  const [showHeatmap, setShowHeatmap] = useState(true);

  const { data: heatmapData, isLoading: heatmapLoading } = useArtworkHeatmap(
    selectedArtworkId,
    timeRange
  );

  const selectedArtwork = artworks?.find(a => a.id === selectedArtworkId);

  if (artworksLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Artwork Attention Heatmap
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Visual representation of where visitors focus their attention
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Controls */}
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[250px]">
            <label className="text-sm font-medium mb-2 block">Select Artwork</label>
            <Select value={selectedArtworkId} onValueChange={setSelectedArtworkId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose an artwork" />
              </SelectTrigger>
              <SelectContent>
                {artworks?.map(artwork => (
                  <SelectItem key={artwork.id} value={artwork.id}>
                    {artwork.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="w-[150px]">
            <label className="text-sm font-medium mb-2 block">Time Range</label>
            <Select value={String(timeRange)} onValueChange={(v) => setTimeRange(Number(v))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <Button
              variant={showHeatmap ? "default" : "outline"}
              onClick={() => setShowHeatmap(!showHeatmap)}
            >
              <Eye className="h-4 w-4 mr-2" />
              {showHeatmap ? 'Hide' : 'Show'} Heatmap
            </Button>
          </div>
        </div>

        {/* Stats */}
        {selectedArtworkId && heatmapData && (
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="text-sm text-muted-foreground">Data Points</div>
              <div className="text-2xl font-bold">{heatmapData.totalDataPoints.toLocaleString()}</div>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="text-sm text-muted-foreground">Unique Viewers</div>
              <div className="text-2xl font-bold">{heatmapData.uniqueSessions}</div>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="text-sm text-muted-foreground">Hotspots</div>
              <div className="text-2xl font-bold">{heatmapData.points.length}</div>
            </div>
          </div>
        )}

        {/* Heatmap Visualization */}
        {selectedArtworkId && selectedArtwork ? (
          <div className="relative">
            {heatmapLoading ? (
              <Skeleton className="w-full aspect-[4/3]" />
            ) : (
              <div className="relative inline-block">
                <img
                  src={selectedArtwork.image_url}
                  alt={selectedArtwork.title}
                  className="max-w-full h-auto rounded-lg"
                  style={{ maxHeight: '600px' }}
                />
                {showHeatmap && heatmapData && heatmapData.points.length > 0 && (
                  <div className="absolute inset-0">
                    <ArtworkHeatmapOverlay
                      points={heatmapData.points}
                      width={1000}
                      height={(1000 * 3) / 4}
                      opacity={0.7}
                    />
                  </div>
                )}
              </div>
            )}

            {heatmapData && heatmapData.points.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted/50 rounded-lg">
                <p className="text-muted-foreground">
                  No cursor tracking data available for this artwork yet.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center bg-muted/50 rounded-lg">
            <p className="text-muted-foreground">Select an artwork to view its heatmap</p>
          </div>
        )}

        {/* Legend */}
        {showHeatmap && heatmapData && heatmapData.points.length > 0 && (
          <div className="flex items-center gap-4 text-sm">
            <span className="text-muted-foreground">Attention Level:</span>
            <div className="flex items-center gap-2">
              <div className="w-12 h-4 rounded" style={{ background: 'linear-gradient(to right, rgba(255, 200, 0, 0.3), rgba(255, 0, 0, 0.7))' }} />
              <span className="text-xs text-muted-foreground">Low → High</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ArtworkHeatmapViewer;
