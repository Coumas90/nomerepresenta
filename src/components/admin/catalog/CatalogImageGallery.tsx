import { useState } from "react";
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
  const [showHidden, setShowHidden] = useState(false);

  if (!images || images.length === 0) {
    return <p className="text-xs text-muted-foreground">No images</p>;
  }

  const visibleImages = images.filter((img) => img.is_catalog_visible !== false);
  const hiddenImages = images.filter((img) => img.is_catalog_visible === false);
  const displayImages = showHidden ? images : visibleImages;

  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <p className="text-xs text-muted-foreground">
          {visibleImages.length} image{visibleImages.length !== 1 ? "s" : ""}
          {hiddenImages.length > 0 && ` · ${hiddenImages.length} hidden`}
        </p>
        {hiddenImages.length > 0 && (
          <button
            onClick={() => setShowHidden(!showHidden)}
            className="text-[10px] text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
          >
            {showHidden ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
            {showHidden ? "Hide hidden" : "Show hidden"}
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {displayImages.map((img, idx) => {
          const isVisible = (img as any).is_catalog_visible !== false;
          return (
            <div key={img.id} className={`relative group ${!isVisible ? "opacity-40 ring-1 ring-dashed ring-muted-foreground/30 rounded" : ""}`}>
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
                {(img as any).is_install && (
                  <Badge variant="outline" className="text-[8px] px-1 py-0 h-4 bg-blue-600/80 text-white border-0">
                    Install
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
