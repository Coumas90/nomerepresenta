import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
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

  // Reset index when opening
  useEffect(() => {
    if (open) setCurrentIndex(0);
  }, [open]);

  const close = useCallback(() => onOpenChange(false), [onOpenChange]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight" && currentIndex < images.length - 1) setCurrentIndex((i) => i + 1);
      if (e.key === "ArrowLeft" && currentIndex > 0) setCurrentIndex((i) => i - 1);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, currentIndex, images.length, close]);

  if (!open) return null;

  const hasMultiple = images.length > 1;
  const current = images[currentIndex];

  return (
    <div className="fixed inset-0 z-50 bg-stone-100 flex items-center justify-center">
      {/* Close button */}
      <button
        onClick={close}
        className="absolute top-5 right-5 z-10 p-2 text-stone-400 hover:text-stone-800 transition-colors"
        aria-label="Close"
      >
        <X size={24} strokeWidth={1.5} />
      </button>

      {current ? (
        <>
          <img
            src={current.image_url}
            alt={current.alt_text || artworkTitle}
            className="max-w-[90vw] max-h-[90vh] object-contain"
          />

          {/* Left arrow */}
          {hasMultiple && currentIndex > 0 && (
            <button
              onClick={() => setCurrentIndex((i) => i - 1)}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 text-stone-400 hover:text-stone-800 transition-colors"
              aria-label="Previous image"
            >
              <ChevronLeft size={28} strokeWidth={1.5} />
            </button>
          )}

          {/* Right arrow */}
          {hasMultiple && currentIndex < images.length - 1 && (
            <button
              onClick={() => setCurrentIndex((i) => i + 1)}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-stone-400 hover:text-stone-800 transition-colors"
              aria-label="Next image"
            >
              <ChevronRight size={28} strokeWidth={1.5} />
            </button>
          )}

          {/* Counter */}
          {hasMultiple && (
            <span className="absolute bottom-5 left-5 text-xs text-stone-500">
              {currentIndex + 1} / {images.length}
            </span>
          )}
        </>
      ) : (
        <p className="text-stone-400 text-sm">No images available</p>
      )}
    </div>
  );
};
