import { useState } from "react";
import type { SeriesData, ArtworkImage } from "@/types";
import type { PricelistItemWithArtwork } from "@/hooks/usePricelist";
import { PricelistRow } from "./PricelistRow";
import { PricelistImageViewer } from "./PricelistImageViewer";

interface PricelistContentProps {
  grouped: Map<string, PricelistItemWithArtwork[]>;
  seriesMap: Map<string, SeriesData>;
  allImages?: Record<string, ArtworkImage[]>;
  isLoading: boolean;
  pricelistName?: string;
  seriesName?: string;
}

export const PricelistContent = ({
  grouped,
  seriesMap,
  allImages,
  isLoading,
  pricelistName,
  seriesName,
}: PricelistContentProps) => {
  const [viewingArtworkId, setViewingArtworkId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-stone-400" />
      </div>
    );
  }

  const entries = Array.from(grouped.entries());

  const viewerImages = viewingArtworkId ? allImages?.[viewingArtworkId] || [] : [];
  const viewingItem = entries
    .flatMap(([, items]) => items)
    .find((item) => item.artwork_id === viewingArtworkId);

  return (
    <div className="min-h-screen bg-stone-100">
      <div className="max-w-5xl mx-auto px-6 md:px-12 py-12 md:py-20">
        {/* Single header for the entire pricelist */}
        <div className="flex justify-between items-baseline border-b border-stone-300 pb-8 mb-0">
          <h1 className="text-sm md:text-base font-medium tracking-[0.15em] uppercase text-stone-800">
            IVAN COMAS_ {pricelistName ? pricelistName.toUpperCase() : "PRICELIST"}
          </h1>
          {seriesName && (
            <h2 className="text-sm md:text-base font-medium tracking-[0.15em] uppercase text-stone-800">
              {seriesName.toUpperCase()}
            </h2>
          )}
        </div>

        {entries.map(([seriesId, items]) => (
          <div key={seriesId}>
            {items.map((item) => (
              <PricelistRow
                key={item.id}
                item={item}
                onClick={() => setViewingArtworkId(item.artwork_id)}
              />
            ))}
          </div>
        ))}
        

        {entries.length === 0 && (
          <p className="text-center text-stone-400 text-sm mt-20">
            No items in the pricelist yet.
          </p>
        )}
      </div>

      <PricelistImageViewer
        open={!!viewingArtworkId}
        onOpenChange={(open) => !open && setViewingArtworkId(null)}
        images={viewerImages}
        artworkTitle={viewingItem?.artwork?.title || ""}
      />
    </div>
  );
};
