import { useState, useEffect, useCallback, useRef } from "react";
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
  const touchStartX = useRef(0);
  const touchDeltaX = useRef(0);

  useEffect(() => {
    if (open) setCurrentIndex(0);
  }, [open]);

  const close = useCallback(() => onOpenChange(false), [onOpenChange]);

  const goNext = useCallback(() => {
    if (images.length > 1) setCurrentIndex((i) => (i + 1) % images.length);
  }, [images.length]);

  const goPrev = useCallback(() => {
    if (images.length > 1) setCurrentIndex((i) => (i - 1 + images.length) % images.length);
  }, [images.length]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, close, goNext, goPrev]);

  // Touch swipe handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
  }, []);

  const handleTouchEnd = useCallback(() => {
    const SWIPE_THRESHOLD = 50;
    if (touchDeltaX.current < -SWIPE_THRESHOLD) goNext();
    else if (touchDeltaX.current > SWIPE_THRESHOLD) goPrev();
  }, [goNext, goPrev]);

  if (!open) return null;

  const hasMultiple = images.length > 1;
  const current = images[currentIndex];

  return (
    <div
      className="fixed inset-0 z-50 bg-stone-100 flex items-center justify-center select-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Close button */}
      <button
        onClick={close}
        className="absolute top-5 right-5 z-20 p-2 text-stone-400 hover:text-stone-800 transition-colors"
        aria-label="Close"
      >
        <X size={24} strokeWidth={1.5} />
      </button>

      {current ? (
        <div className="relative overflow-visible">
          <img
            src={current.image_url}
            alt={current.alt_text || artworkTitle}
            className="max-w-[90vw] max-h-[90vh] object-contain select-none pointer-events-none"
            draggable={false}
          />

          {/* Left invisible clickable zone */}
          {hasMultiple && (
            <button
              onClick={goPrev}
              className="hidden md:block absolute -left-[50vw] top-0 bottom-0 w-[calc(50%+50vw)] z-10 cursor-pointer focus:outline-none"
              aria-label="Previous image"
            />
          )}

          {/* Right invisible clickable zone */}
          {hasMultiple && (
            <button
              onClick={goNext}
              className="hidden md:block absolute -right-[50vw] top-0 bottom-0 w-[calc(50%+50vw)] z-10 cursor-pointer focus:outline-none"
              aria-label="Next image"
            />
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
