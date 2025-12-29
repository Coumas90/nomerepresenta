import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { LiveArtworkView } from "@/types";

interface LiveArtworkViewsProps {
  artworkViews: LiveArtworkView[];
}

const LiveArtworkViews = ({ artworkViews }: LiveArtworkViewsProps) => {
  if (artworkViews.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Currently Viewed Artworks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No artworks being viewed right now.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Currently Viewed Artworks
        </CardTitle>
        <p className="text-sm text-muted-foreground">Recent artwork interactions</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {artworkViews.map((view) => (
            <div
              key={view.id}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
            >
              <div className="flex-1 min-w-0">
                <h4 className="font-medium truncate">
                  {view.artwork?.title || 'Unknown Artwork'}
                </h4>
                {view.artwork?.series?.name && (
                  <p className="text-sm text-muted-foreground">
                    {view.artwork.series.name}
                  </p>
                )}
              </div>
              <div className="flex flex-col items-end gap-1">
                <Badge variant="secondary" className="text-xs">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse mr-1" />
                  Live
                </Badge>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatDistanceToNow(new Date(view.started_at), { addSuffix: true })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default LiveArtworkViews;
