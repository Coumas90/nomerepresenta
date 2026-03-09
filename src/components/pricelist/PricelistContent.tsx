import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Undo2, Download } from "lucide-react";
import type { SeriesData, ArtworkImage } from "@/types";
import type { PricelistItemWithArtwork, PricelistCurrency } from "@/hooks/usePricelist";
import { PricelistRow } from "./PricelistRow";
import { PricelistImageViewer } from "./PricelistImageViewer";

interface PricelistContentProps {
  grouped: Map<string, PricelistItemWithArtwork[]>;
  seriesMap: Map<string, SeriesData>;
  allImages?: Record<string, ArtworkImage[]>;
  isLoading: boolean;
  pricelistName?: string;
  seriesName?: string;
  activeCurrency?: PricelistCurrency;
}

export const PricelistContent = ({
  grouped,
  seriesMap,
  allImages,
  isLoading,
  pricelistName,
  seriesName,
  activeCurrency = "USD",
}: PricelistContentProps) => {
  const navigate = useNavigate();
  const [viewingArtworkId, setViewingArtworkId] = useState<string | null>(null);

  const headerTitle = `IVAN COMAS / ${pricelistName ? pricelistName.toUpperCase() : "PRICELIST"}${seriesName ? ` / ${seriesName.toUpperCase()}` : ""}`;

  const handleDownloadPdf = useCallback(() => {
    document.title = headerTitle;
    window.print();
  }, [headerTitle]);

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
      {/* Sticky header — hidden when printing */}
      <div className="sticky top-0 bg-stone-100/95 backdrop-blur border-b border-stone-200 z-10 px-6 md:px-12 py-3 md:py-4 flex items-center justify-between print:hidden">
        <div className="flex items-baseline gap-4">
          <span className="text-xs md:text-sm font-medium tracking-[0.15em] uppercase text-stone-800">
            {headerTitle}
          </span>
        </div>
        <button
          onClick={() => navigate("/")}
          className="text-stone-700 hover:text-stone-900 transition-colors"
        >
          <Undo2 className="w-5 md:w-6 h-5 md:h-6" />
        </button>
      </div>

      {/* Print-only header title */}
      <div className="hidden print:block px-10 pt-12 pb-4 border-b border-stone-300">
        <h1 className="text-sm font-medium tracking-[0.15em] uppercase text-stone-800">
          {headerTitle}
        </h1>
      </div>

      <div className="max-w-5xl mx-auto px-6 md:px-12 py-6 md:py-10 print:px-10 print:py-4 print:max-w-none">
        {entries.map(([seriesId, items]) => (
          <div key={seriesId}>
            {items.map((item) => (
              <PricelistRow
                key={item.id}
                item={item}
                activeCurrency={activeCurrency}
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

      {/* Download PDF button at bottom */}
      <div className="max-w-5xl mx-auto px-6 md:px-12 pb-12 print:hidden">
        <button
          onClick={handleDownloadPdf}
          className="flex items-center gap-2 text-stone-500 hover:text-stone-800 transition-colors text-xs tracking-wide uppercase"
        >
          <span>Download to PDF</span>
          <Download className="w-4 h-4" />
        </button>
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
