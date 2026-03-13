import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { ProgressiveImage } from "@/components/ProgressiveImage";
import { ImageSkeleton } from "@/components/ImageSkeleton";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { getOptimizedImageUrl } from "@/lib/imageUtils";
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

  // Flatten all images from all artworks into a single slide list
  const slides = useMemo(() => {
    const result: {
      url: string;
      altText: string;
      title: string;
      year: string;
      materials: string;
      dimensions: string;
      isDetail: boolean;
      artworkId: string;
    }[] = [];

    for (const artwork of artworks) {
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
        for (const img of artImages) {
          result.push({
            url: img.image_url,
            altText: img.alt_text || img.title || artwork.title,
            title: img.title || artwork.title,
            year: img.year || artwork.year,
            materials: img.materials || artwork.materials,
            dimensions: img.dimensions || artwork.dimensions,
            isDetail: img.is_detail,
            artworkId: artwork.id,
          });
        }
      } else {
        result.push({
          url: artwork.image_url,
          altText: artwork.title,
          title: artwork.title,
          year: artwork.year,
          materials: artwork.materials,
          dimensions: artwork.dimensions,
          isDetail: false,
          artworkId: artwork.id,
        });
      }
    }
    return result;
  }, [artworks, allArtworkImages, imageOverridesByArtwork]);

  const currentSlide = slides[currentIndex];
  const currentImage = currentSlide?.url;
  const totalSlides = slides.length;

  // Lock desktop carousel image box to the first rendered slide size to prevent layout jumps
  useEffect(() => {
    if (isMobile) {
      setLockedDimensions(null);
      return;
    }
    if (lockedDimensions || !imageWrapperRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setLockedDimensions({ width, height });
          observer.disconnect();
        }
      }
    });

    observer.observe(imageWrapperRef.current);
    return () => observer.disconnect();
  }, [isMobile, lockedDimensions]);

  useEffect(() => {
    const dpr = window.devicePixelRatio || 1;
    const vw = window.innerWidth;
    const cssWidth = vw <= 768 ? vw * 0.9 : vw <= 1024 ? vw * 0.7 : vw * 0.6;
    const targetPx = cssWidth * dpr;
    const widths = [320, 640, 960, 1280, 1920, 2560];
    const bestWidth = widths.find(w => w >= targetPx) || widths[widths.length - 1];

    [currentIndex - 1, currentIndex + 1].forEach((i) => {
      const wrappedIdx = i < 0 ? totalSlides - 1 : i >= totalSlides ? 0 : i;
      const url = slides[wrappedIdx]?.url;
      if (url) {
        const img = new Image();
        img.src = getOptimizedImageUrl(url, { width: bestWidth, format: "avif" });
        const img2 = new Image();
        img2.src = getOptimizedImageUrl(url, { width: bestWidth, format: "webp" });
      }
    });
  }, [currentIndex, slides, totalSlides]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
    onGalleryNavigate?.(currentSlide?.artworkId);
  }, [totalSlides, onGalleryNavigate, currentSlide?.artworkId]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === totalSlides - 1 ? 0 : prev + 1));
    onGalleryNavigate?.(currentSlide?.artworkId);
  }, [totalSlides, onGalleryNavigate, currentSlide?.artworkId]);

  // Mobile swipe
  const swipeStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const swipeLockedRef = useRef<"horizontal" | "vertical" | null>(null);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (!isMobile || totalSlides <= 1) return;
      const touch = e.touches[0];
      swipeStartRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
      swipeLockedRef.current = null;
    },
    [isMobile, totalSlides]
  );

  const touchMoveHandler = useCallback(
    (e: TouchEvent) => {
      if (!isMobile || !swipeStartRef.current || totalSlides <= 1) return;
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
    [isMobile, totalSlides]
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !isMobile || totalSlides <= 1) return;
    el.addEventListener("touchmove", touchMoveHandler, { passive: false });
    return () => el.removeEventListener("touchmove", touchMoveHandler);
  }, [touchMoveHandler, isMobile, totalSlides]);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!isMobile || !swipeStartRef.current || totalSlides <= 1) return;
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
    [isMobile, totalSlides, goToNext, goToPrev]
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
            <div
              ref={imageWrapperRef}
              className="relative flex items-center justify-center max-w-full"
              style={!isMobile && lockedDimensions ? { width: lockedDimensions.width, minHeight: lockedDimensions.height } : undefined}
            >
              {currentImage && (
                <ProgressiveImage
                  src={currentImage}
                  alt={currentSlide?.altText || "Artwork"}
                  className={cn(
                    "relative z-10 [&_img]:max-h-[75vh] [&_img]:md:max-h-[80vh] [&_img]:lg:max-h-[85vh]",
                    !isMobile && lockedDimensions && "[&_img]:w-full [&_img]:h-full"
                  )}
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
              {isMobile && totalSlides > 1 && (
                <>
                  <button onClick={goToPrev} className="absolute left-0 top-0 bottom-0 w-[30%] z-20 focus:outline-none" aria-label="Previous artwork" />
                  <button onClick={goToNext} className="absolute right-0 top-0 bottom-0 w-[30%] z-20 focus:outline-none" aria-label="Next artwork" />
                </>
              )}

              {/* Desktop click zones */}
              {!isMobile && totalSlides > 1 && (
                <>
                  <button onClick={goToPrev} className="absolute top-0 bottom-0 z-20 focus:outline-none -left-[50vw] w-[calc(50%+50vw)]" style={{ cursor: cursorLeftSvg }} aria-label="Previous artwork" />
                  <button onClick={goToNext} className="absolute top-0 bottom-0 z-20 focus:outline-none -right-[50vw] w-[calc(50%+50vw)]" style={{ cursor: cursorRightSvg }} aria-label="Next artwork" />
                </>
              )}
            </div>

            {/* Mobile pagination */}
            {isMobile && totalSlides > 1 && (
              <div className="mt-3 flex gap-1.5">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={cn(
                      "w-1.5 h-1.5 rounded-full transition-all duration-300",
                      index === currentIndex ? "bg-stone-900" : "bg-stone-400"
                    )}
                    aria-label={`Go to image ${index + 1}`}
                  />
                ))}
              </div>
            )}

            {/* Caption for current slide */}
            {currentSlide && (
              <figcaption className="mt-6 md:mt-9 text-left leading-snug">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <p className="text-stone-500 text-[13px] md:text-[15px] font-bold">
                      {currentSlide.title}
                      {currentSlide.isDetail && <span className="font-normal text-stone-500"> (DETAIL)</span>}
                      {currentSlide.year && <>, {currentSlide.year}</>}
                    </p>
                    {currentSlide.materials && (
                      <p className="text-stone-500 text-[11px] md:text-[13px] mt-[3px] md:mt-[6px]">
                        {currentSlide.materials}
                      </p>
                    )}
                    {currentSlide.dimensions && (
                      <p className="text-stone-500 text-[11px] md:text-[13px] mt-[4px] md:mt-[5px]">
                        {currentSlide.dimensions}
                      </p>
                    )}
                  </div>
                  {!isMobile && totalSlides > 1 && (
                    <p className="text-stone-400 text-[9px] md:text-[11px] whitespace-nowrap shrink-0" style={{ letterSpacing: "0.5px" }}>
                      [ {currentIndex + 1} / {totalSlides} ]
                    </p>
                  )}
                </div>
              </figcaption>
            )}
          </div>
        </div>
      </figure>
    </article>
  );
};
