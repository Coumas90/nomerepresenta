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
      if (e.key === "ArrowRight") setCurrentIndex((i) => (i + 1) % images.length);
      if (e.key === "ArrowLeft") setCurrentIndex((i) => (i - 1 + images.length) % images.length);
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
        <div className="relative">
          <img
            src={current.image_url}
            alt={current.alt_text || artworkTitle}
            className="max-w-[90vw] max-h-[90vh] object-contain select-none"
          />

          {/* Left clickable zone */}
          {hasMultiple && (
            <button
              onClick={() => setCurrentIndex((i) => (i - 1 + images.length) % images.length)}
              className="absolute -left-[15vw] top-0 bottom-0 w-[calc(50%+15vw)] z-10 cursor-pointer focus:outline-none group"
              aria-label="Previous image"
            >
              <ChevronLeft
                size={20}
                className="absolute left-[15vw] top-1/2 -translate-y-1/2 text-stone-400 opacity-0 group-hover:opacity-100 transition-opacity"
                strokeWidth={1.5}
              />
            </button>
          )}

          {/* Right clickable zone */}
          {hasMultiple && (
            <button
              onClick={() => setCurrentIndex((i) => (i + 1) % images.length)}
              className="absolute -right-[15vw] top-0 bottom-0 w-[calc(50%+15vw)] z-10 cursor-pointer focus:outline-none group"
              aria-label="Next image"
            >
              <ChevronRight
                size={20}
                className="absolute right-[15vw] top-1/2 -translate-y-1/2 text-stone-400 opacity-0 group-hover:opacity-100 transition-opacity"
                strokeWidth={1.5}
              />
            </button>
          )}

          {/* Counter */}
          {hasMultiple && (
            <span className="absolute bottom-5 left-0 text-xs text-stone-500">
              {currentIndex + 1} / {images.length}
            </span>
          )}
        </div>
      ) : (
        <p className="text-stone-400 text-sm">No images available</p>
      )}
    </div>
  );
};
