import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff } from "lucide-react";
import { useArtworkImages } from "@/hooks/useArtworkImages";
import { useToggleCatalogVisibility } from "@/hooks/useToggleCatalogVisibility";

interface CatalogImageGalleryProps {
  artworkId: string;
}

export const CatalogImageGallery = ({ artworkId }: CatalogImageGalleryProps) => {
  const { data: images } = useArtworkImages(artworkId);
  const toggleVisibility = useToggleCatalogVisibility();

  if (!images || images.length === 0) {
    return <p className="text-xs text-muted-foreground">No images</p>;
  }

  const detailCount = images.filter((img) => img.is_detail).length;

  return (
    <div>
      <p className="text-xs text-muted-foreground mb-2">
        {images.length} image{images.length !== 1 ? "s" : ""}
        {detailCount > 0 ? ` (${detailCount} detail${detailCount !== 1 ? "s" : ""})` : ""}
      </p>
      <div className="flex flex-wrap gap-2">
        {images.map((img, idx) => {
          const isVisible = (img as any).is_catalog_visible !== false;
          return (
            <div key={img.id} className={`relative group ${!isVisible ? "opacity-40" : ""}`}>
              <img
                src={img.image_url}
                alt={img.title || `Image ${idx + 1}`}
                className="w-20 h-20 object-cover rounded border border-border"
                loading="lazy"
              />
              <div className="absolute bottom-0 left-0 right-0 flex gap-0.5 p-0.5">
                {img.is_main && (
                  <Badge variant="secondary" className="text-[8px] px-1 py-0 h-4 bg-background/80">
                    Main
                  </Badge>
                )}
                {img.is_detail && (
                  <Badge variant="default" className="text-[8px] px-1 py-0 h-4">
                    Detail
                  </Badge>
                )}
              </div>
              <button
                onClick={() =>
                  toggleVisibility.mutate({
                    imageId: img.id,
                    artworkId,
                    visible: !isVisible,
                  })
                }
                className="absolute top-0.5 right-0.5 bg-background/80 rounded p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                title={isVisible ? "Hide from catalog/pricelist" : "Show in catalog/pricelist"}
              >
                {isVisible ? (
                  <Eye className="h-3 w-3 text-foreground" />
                ) : (
                  <EyeOff className="h-3 w-3 text-muted-foreground" />
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
