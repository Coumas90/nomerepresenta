import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ArtworkImage } from "@/types";

interface PricelistImageViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  images: ArtworkImage[];
  artworkTitle: string;
}

export const PricelistImageViewer = ({
  open,
  onOpenChange,
  images,
  artworkTitle,
}: PricelistImageViewerProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Reset index when dialog opens
  const handleOpenChange = (val: boolean) => {
    if (val) setCurrentIndex(0);
    onOpenChange(val);
  };

  const hasMultiple = images.length > 1;
  const current = images[currentIndex];

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-5xl p-0 overflow-hidden bg-stone-100 border-stone-300">
        {current && (
          <div className="relative flex items-center justify-center min-h-[50vh] max-h-[90vh]">
            <img
              src={current.image_url}
              alt={current.alt_text || artworkTitle}
              className="max-w-full max-h-[85vh] object-contain"
            />

            {/* Navigation */}
            {hasMultiple && currentIndex > 0 && (
              <button
                onClick={() => setCurrentIndex((i) => i - 1)}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-800 transition-colors"
                aria-label="Previous image"
              >
                <ChevronLeft size={24} strokeWidth={1.5} />
              </button>
            )}
            {hasMultiple && currentIndex < images.length - 1 && (
              <button
                onClick={() => setCurrentIndex((i) => i + 1)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-800 transition-colors"
                aria-label="Next image"
              >
                <ChevronRight size={24} strokeWidth={1.5} />
              </button>
            )}

            {/* Counter */}
            {hasMultiple && (
              <span className="absolute bottom-4 left-4 text-xs text-stone-500">
                {currentIndex + 1} / {images.length}
              </span>
            )}

            {/* Caption */}
            {current.caption && (
              <span className="absolute bottom-4 right-4 text-xs text-stone-500 max-w-[60%] text-right">
                {current.caption}
              </span>
            )}
          </div>
        )}

        {images.length === 0 && (
          <div className="flex items-center justify-center h-64 text-stone-400 text-sm">
            No images available
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
