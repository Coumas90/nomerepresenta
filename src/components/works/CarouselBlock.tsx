import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { ProgressiveImage } from "@/components/ProgressiveImage";
import { ImageSkeleton } from "@/components/ImageSkeleton";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import type { ArtworkData, ArtworkImage } from "@/types";

interface CarouselBlockProps {
  artworks: ArtworkData[];
  isVisible?: boolean;
  allArtworkImages?: Record<string, ArtworkImage[]>;
  eager?: boolean;
  onGalleryNavigate?: (artworkId: string) => void;
  imageOverridesByArtwork?: Record<string, { hidden_images?: string[]; image_order?: string[] }>;
}

const cursorLeftSvg = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23787874' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m15 18-6-6 6-6'/%3E%3C/svg%3E") 12 12, pointer`;
const cursorRightSvg = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23787874' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m9 18 6-6-6-6'/%3E%3C/svg%3E") 12 12, pointer`;

/**
 * Carousel block: displays multiple artworks in a single carousel.
 * Each artwork shows its own caption/metadata when active.
 */
export const CarouselBlock = ({
  artworks,
  isVisible = true,
  allArtworkImages,
  eager = false,
  onGalleryNavigate,
  imageOverridesByArtwork,
}: CarouselBlockProps) => {
  const isMobile = useIsMobile();
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentArtwork = artworks[currentIndex];

  // For each artwork in the carousel, use its main image
  const images = useMemo(() => {
    return artworks.map((artwork) => {
      let artImages = allArtworkImages?.[artwork.id];
      if (artImages && artImages.length > 0) {
        const overrides = imageOverridesByArtwork?.[artwork.id];
        // Filter hidden images
        if (overrides?.hidden_images?.length) {
          const hiddenSet = new Set(overrides.hidden_images);
          artImages = artImages.filter(img => !hiddenSet.has(img.id));
        }
        // Apply custom order
        if (overrides?.image_order?.length) {
          const orderMap = new Map(overrides.image_order.map((id, i) => [id, i]));
          artImages = [...artImages].sort((a, b) => {
            const aIdx = orderMap.get(a.id) ?? 9999;
            const bIdx = orderMap.get(b.id) ?? 9999;
            return aIdx - bIdx;
          });
        }
        const mainImg = artImages.find((img) => img.is_main) || artImages[0];
        return {
          url: mainImg?.image_url || artwork.image_url,
          altText: mainImg?.alt_text || artwork.title,
        };
      }
      return { url: artwork.image_url, altText: artwork.title };
    });
  }, [artworks, allArtworkImages, imageOverridesByArtwork]);

  const currentImage = images[currentIndex]?.url || currentArtwork?.image_url;

  // Preload adjacent
  useEffect(() => {
    [currentIndex - 1, currentIndex + 1].forEach((i) => {
      const url = images[i]?.url;
      if (url) {
        const img = new Image();
        img.src = url;
      }
    });
  }, [currentIndex, images]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? artworks.length - 1 : prev - 1));
    onGalleryNavigate?.(currentArtwork?.id);
  }, [artworks.length, onGalleryNavigate, currentArtwork?.id]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === artworks.length - 1 ? 0 : prev + 1));
    onGalleryNavigate?.(currentArtwork?.id);
  }, [artworks.length, onGalleryNavigate, currentArtwork?.id]);

  // Mobile swipe
  const swipeStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const swipeLockedRef = useRef<"horizontal" | "vertical" | null>(null);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (!isMobile || artworks.length <= 1) return;
      const touch = e.touches[0];
      swipeStartRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
      swipeLockedRef.current = null;
    },
    [isMobile, artworks.length]
  );

  const touchMoveHandler = useCallback(
    (e: TouchEvent) => {
      if (!isMobile || !swipeStartRef.current || artworks.length <= 1) return;
      const touch = e.touches[0];
      const deltaX = touch.clientX - swipeStartRef.current.x;
      const deltaY = touch.clientY - swipeStartRef.current.y;
      if (!swipeLockedRef.current && (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10)) {
        swipeLockedRef.current = Math.abs(deltaX) > Math.abs(deltaY) ? "horizontal" : "vertical";
      }
      if (swipeLockedRef.current === "horizontal") {
        e.preventDefault();
        e.stopPropagation();
      }
    },
    [isMobile, artworks.length]
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !isMobile || artworks.length <= 1) return;
    el.addEventListener("touchmove", touchMoveHandler, { passive: false });
    return () => el.removeEventListener("touchmove", touchMoveHandler);
  }, [touchMoveHandler, isMobile, artworks.length]);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!isMobile || !swipeStartRef.current || artworks.length <= 1) return;
      if (swipeLockedRef.current !== "horizontal") {
        swipeStartRef.current = null;
        return;
      }
      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - swipeStartRef.current.x;
      const elapsed = Date.now() - swipeStartRef.current.time;
      const velocity = Math.abs(deltaX) / elapsed;
      const triggered = Math.abs(deltaX) > 40 || (velocity > 0.4 && Math.abs(deltaX) > 15);
      if (triggered) {
        if (deltaX < 0) goToNext();
        else goToPrev();
      }
      swipeStartRef.current = null;
      swipeLockedRef.current = null;
    },
    [isMobile, artworks.length, goToNext, goToPrev]
  );

  if (!isVisible) {
    return (
      <article className="w-full flex flex-col items-center">
        <div className="relative w-full max-w-[90vw] md:max-w-[70vw] lg:max-w-[60vw] mx-auto">
          <ImageSkeleton className="w-full h-[55vh] md:h-[60vh] lg:h-[65vh] rounded-sm" variant="shimmer" />
        </div>
      </article>
    );
  }

  return (
    <article className="relative w-full flex flex-col items-center">
      <figure className="inline-flex flex-col items-start max-w-[95vw] md:max-w-[60vw] lg:max-w-[50vw] mx-auto overflow-visible">
        <div className="relative w-full flex items-center">
          <div
            ref={containerRef}
            className="flex-1 min-w-0 select-none"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <div className="relative">
              {currentImage && (
                <ProgressiveImage
                  src={currentImage}
                  alt={images[currentIndex]?.altText || currentArtwork?.title || "Artwork"}
                  className="relative z-10 [&_img]:max-h-[75vh] [&_img]:md:max-h-[80vh] [&_img]:lg:max-h-[85vh]"
                  objectFit="contain"
                  eager={eager}
                  skipInternalFade
                  blurUp={false}
                  modernFormats
                  responsivePreset="full"
                  sizes="(max-width: 768px) 90vw, (max-width: 1024px) 70vw, 60vw"
                />
              )}

              {/* Mobile tap zones */}
              {isMobile && artworks.length > 1 && (
                <>
                  <button onClick={goToPrev} className="absolute left-0 top-0 bottom-0 w-[30%] z-20 focus:outline-none" aria-label="Previous artwork" />
                  <button onClick={goToNext} className="absolute right-0 top-0 bottom-0 w-[30%] z-20 focus:outline-none" aria-label="Next artwork" />
                </>
              )}

              {/* Desktop click zones */}
              {!isMobile && artworks.length > 1 && (
                <>
                  <button onClick={goToPrev} className="absolute top-0 bottom-0 z-20 focus:outline-none -left-[50vw] w-[calc(50%+50vw)]" style={{ cursor: cursorLeftSvg }} aria-label="Previous artwork" />
                  <button onClick={goToNext} className="absolute top-0 bottom-0 z-20 focus:outline-none -right-[50vw] w-[calc(50%+50vw)]" style={{ cursor: cursorRightSvg }} aria-label="Next artwork" />
                </>
              )}
            </div>

            {/* Dots */}
            {artworks.length > 1 && (
              <div className="mt-3 flex gap-1.5">
                {artworks.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={cn(
                      "w-1.5 h-1.5 rounded-full transition-all duration-300",
                      index === currentIndex ? "bg-stone-900" : "bg-stone-400"
                    )}
                    aria-label={`Go to artwork ${index + 1}`}
                  />
                ))}
              </div>
            )}

            {/* Caption for current artwork */}
            <figcaption className="mt-3 md:mt-4 text-left leading-snug">
              <p className="text-stone-600 text-xs md:text-[15px] font-bold">
                {currentArtwork?.title}
                {currentArtwork?.year && <>, {currentArtwork.year}</>}
              </p>
              {currentArtwork?.materials && (
                <p className="text-stone-500 text-xs md:text-sm mt-[2px] md:mt-[6px]">
                  {currentArtwork.materials}
                </p>
              )}
              {currentArtwork?.dimensions && (
                <p className="text-stone-500 text-xs md:text-sm mt-[1px]">
                  {currentArtwork.dimensions}
                </p>
              )}
            </figcaption>
          </div>
        </div>
      </figure>
    </article>
  );
};
