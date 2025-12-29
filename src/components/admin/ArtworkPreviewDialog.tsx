import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import type { ArtworkData, SeriesData } from "@/types";

interface ArtworkPreviewDialogProps {
  artwork: ArtworkData | null;
  series: SeriesData | undefined;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ArtworkPreviewDialog = ({ artwork, series, open, onOpenChange }: ArtworkPreviewDialogProps) => {
  if (!artwork) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{artwork.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Images Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Main Image</p>
              <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                <img
                  src={artwork.image_url}
                  alt={`${artwork.title} - Main`}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Detail Image</p>
              <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                <img
                  src={artwork.image_detail_url}
                  alt={`${artwork.title} - Detail`}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Information Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Year</p>
              <p className="text-base mt-1">{artwork.year}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Series</p>
              <div className="mt-1">
                <Badge variant="secondary">{series?.name || "Unknown"}</Badge>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Dimensions</p>
              <p className="text-base mt-1">{artwork.dimensions}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Display Order</p>
              <p className="text-base mt-1">{artwork.display_order}</p>
            </div>
          </div>

          {/* Technique and Materials */}
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Technique</p>
              <p className="text-base mt-1">{artwork.technique}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Materials</p>
              <p className="text-base mt-1">{artwork.materials}</p>
            </div>
          </div>

          {/* Description */}
          <div>
            <p className="text-sm font-medium text-muted-foreground">Description</p>
            <p className="text-base mt-2 leading-relaxed whitespace-pre-wrap">
              {artwork.description}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ArtworkPreviewDialog;
