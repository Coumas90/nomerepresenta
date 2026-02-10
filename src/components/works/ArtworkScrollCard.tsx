import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProgressiveImage } from "@/components/ProgressiveImage";
import { ImageSkeleton } from "@/components/ImageSkeleton";
import { useArtworkImages } from "@/hooks/useArtworkImages";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils"; // used for indicator dots
import type { ArtworkData } from "@/types";

interface ArtworkScrollCardProps {
  artwork: ArtworkData;
  isVisible?: boolean;
}

// SVG cursor data URIs — minimal chevron arrows
const cursorLeftSvg = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23787874' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m15 18-6-6 6-6'/%3E%3C/svg%3E") 12 12, pointer`;
const cursorRightSvg = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23787874' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m9 18 6-6-6-6'/%3E%3C/svg%3E") 12 12, pointer`;

export const ArtworkScrollCard = ({ artwork, isVisible = true }: ArtworkScrollCardProps) => {
  const isMobile = useIsMobile();
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Fetch additional images for this artwork
  const { data: artworkImages } = useArtworkImages(artwork.id);

  // Build all images array: main image first, then detail, then additional images
  const allImages = useMemo(() => {
    const images = [
      { url: artwork.image_url, isMain: true, caption: null as string | null, title: null as string | null, year: null as string | null, dimensions: null as string | null, materials: null as string | null, isDetail: false },
      { url: artwork.image_detail_url, isMain: false, caption: null as string | null, title: null as string | null, year: null as string | null, dimensions: null as string | null, materials: null as string | null, isDetail: true },
      ...(artworkImages?.map(img => ({ 
        url: img.image_url, 
        isMain: img.is_main, 
        caption: img.caption ?? null,
        title: img.title ?? null,
        year: img.year ?? null,
        dimensions: img.dimensions ?? null,
        materials: img.materials ?? null,
        isDetail: img.is_detail ?? false,
      })) || [])
    ].filter((img, index, self) => 
      // Remove duplicates and nulls
      img.url && index === self.findIndex(i => i.url === img.url)
    );
    return images;
  }, [artwork.image_url, artwork.image_detail_url, artworkImages]);

  const currentImage = allImages[currentImageIndex]?.url || artwork.image_url;
  const hasNextImage = currentImageIndex < allImages.length - 1;
  const hasPrevImage = currentImageIndex > 0;
  const isViewingDetail = allImages[currentImageIndex]?.isDetail || false;

  // Reset image index when artwork changes
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [artwork.id]);

  // Navigation handlers
  const goToPrevImage = useCallback(() => {
    if (hasPrevImage) {
      setCurrentImageIndex(prev => prev - 1);
    }
  }, [hasPrevImage]);

  const goToNextImage = useCallback(() => {
    if (hasNextImage) {
      setCurrentImageIndex(prev => prev + 1);
    }
  }, [hasNextImage]);

  // Mobile swipe handling for horizontal image navigation
  const swipeStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const swipeLockedRef = useRef<"horizontal" | "vertical" | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!isMobile || allImages.length <= 1) return;
    const touch = e.touches[0];
    swipeStartRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
    swipeLockedRef.current = null;
  }, [isMobile, allImages.length]);

  // Use a native event listener for touchmove so we can set { passive: false } and call preventDefault
  const touchMoveHandler = useCallback((e: TouchEvent) => {
    if (!isMobile || !swipeStartRef.current || allImages.length <= 1) return;
    const touch = e.touches[0];
    const deltaX = touch.clientX - swipeStartRef.current.x;
    const deltaY = touch.clientY - swipeStartRef.current.y;

    // Lock direction on first significant movement
    if (!swipeLockedRef.current && (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10)) {
      swipeLockedRef.current = Math.abs(deltaX) > Math.abs(deltaY) ? "horizontal" : "vertical";
    }

    // Prevent vertical scroll when swiping horizontally on the image
    if (swipeLockedRef.current === "horizontal") {
      e.preventDefault();
      e.stopPropagation();
    }
  }, [isMobile, allImages.length]);

  // Attach native touchmove with { passive: false } to allow preventDefault
  useEffect(() => {
    const el = containerRef.current;
    if (!el || !isMobile || allImages.length <= 1) return;
    el.addEventListener("touchmove", touchMoveHandler, { passive: false });
    return () => el.removeEventListener("touchmove", touchMoveHandler);
  }, [touchMoveHandler, isMobile, allImages.length]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!isMobile || !swipeStartRef.current || allImages.length <= 1) return;
    if (swipeLockedRef.current !== "horizontal") {
      swipeStartRef.current = null;
      return;
    }

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - swipeStartRef.current.x;
    const elapsed = Date.now() - swipeStartRef.current.time;
    const velocity = Math.abs(deltaX) / elapsed;
    const threshold = 40;

    const triggered = Math.abs(deltaX) > threshold || (velocity > 0.4 && Math.abs(deltaX) > 15);

    if (triggered) {
      if (deltaX < 0) goToNextImage();
      else goToPrevImage();
    }

    swipeStartRef.current = null;
    swipeLockedRef.current = null;
  }, [isMobile, allImages.length, goToNextImage, goToPrevImage]);


  // Skeleton placeholder when not visible yet
  if (!isVisible) {
    return (
      <article className="w-full flex flex-col items-center">
        <div className="relative w-full max-w-[90vw] md:max-w-[70vw] lg:max-w-[60vw] mx-auto">
          {/* Skeleton image placeholder */}
          <ImageSkeleton
            className="w-full h-[55vh] md:h-[60vh] lg:h-[65vh] rounded-sm"
            variant="shimmer"
          />
        </div>
        
        {/* Skeleton metadata */}
        <div className="mt-6 md:mt-8 space-y-2 w-full max-w-[90vw] md:max-w-[70vw] lg:max-w-[60vw] mx-auto">
          <div className="h-4 w-48 bg-stone-200 rounded animate-pulse" />
          <div className="h-3 w-16 bg-stone-200/70 rounded animate-pulse" />
          <div className="h-3 w-32 bg-stone-200/50 rounded animate-pulse" />
        </div>
      </article>
    );
  }

  return (
    <article className="relative w-full flex flex-col items-center">
      {/* Figure: image + caption stacked vertically, normal flow */}
      <figure className="inline-flex flex-col items-start max-w-[80vw] md:max-w-[60vw] lg:max-w-[50vw] mx-auto overflow-visible">
        {/* Image container with navigation */}
        <div className="relative w-full flex items-center">
          {/* Mobile left arrow — always rendered for centering, invisible when not needed */}
          {isMobile && allImages.length > 1 && (
            <button
              onClick={hasPrevImage ? goToPrevImage : undefined}
              className="flex-shrink-0 w-8 flex items-center justify-center focus:outline-none"
              aria-label="Previous image"
              aria-hidden={!hasPrevImage}
            >
              {hasPrevImage && (
                <ChevronLeft size={18} className="text-stone-400" strokeWidth={1.5} />
              )}
            </button>
          )}

          {/* Image + touch/click zones */}
          <div
            ref={containerRef}
            className="flex-1 min-w-0 select-none"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* Image wrapper — shadow and navigation scoped here */}
            <div className="relative">
              {/* Gallery frame shadow effect */}
              <div className="absolute inset-0 shadow-2xl shadow-stone-900/15 rounded-sm" />
              
              {/* Main image */}
              {currentImage && (
              <ProgressiveImage
                  src={currentImage}
                  alt={artwork.title || "Artwork"}
                  className="relative z-10 w-full [&_img]:max-h-[75vh] [&_img]:md:max-h-[80vh] [&_img]:lg:max-h-[85vh]"
                  objectFit="contain"
                  eager={false}
                  skipInternalFade
                  blurUp={false}
                  modernFormats
                  responsivePreset="full"
                  sizes="(max-width: 768px) 90vw, (max-width: 1024px) 70vw, 60vw"
                />
              )}

              {/* Mobile tap zones (invisible, no arrows) */}
              {isMobile && hasPrevImage && allImages.length > 1 && (
                <button
                  onClick={goToPrevImage}
                  className="absolute left-0 top-0 bottom-0 w-[30%] z-20 focus:outline-none"
                  aria-label="Previous image"
                />
              )}
              {isMobile && hasNextImage && allImages.length > 1 && (
                <button
                  onClick={goToNextImage}
                  className="absolute right-0 top-0 bottom-0 w-[30%] z-20 focus:outline-none"
                  aria-label="Next image"
                />
              )}

              {/* Desktop clickable zones with custom cursors */}
              {!isMobile && hasPrevImage && allImages.length > 1 && (
                <button
                  onClick={goToPrevImage}
                  className="absolute top-0 bottom-0 z-20 focus:outline-none -left-[50vw] w-[calc(50%+50vw)]"
                  style={{ cursor: cursorLeftSvg }}
                  aria-label="Previous image"
                />
              )}
              {!isMobile && hasNextImage && allImages.length > 1 && (
                <button
                  onClick={goToNextImage}
                  className="absolute top-0 bottom-0 z-20 focus:outline-none -right-[50vw] w-[calc(50%+50vw)]"
                  style={{ cursor: cursorRightSvg }}
                  aria-label="Next image"
                />
              )}
            </div>
            {/* Image indicator dots — aligned with image */}
            {allImages.length > 1 && (
              <div className="mt-3 flex gap-1.5">
                {allImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={cn(
                      "w-1 h-1 rounded-full transition-all duration-300",
                      index === currentImageIndex 
                        ? "bg-stone-900" 
                        : "bg-stone-400"
                    )}
                    aria-label={`Go to image ${index + 1}`}
                  />
                ))}
              </div>
            )}

            {/* Caption — aligned with image */}
            <figcaption className="mt-3 md:mt-4 space-y-0 text-left leading-snug">
              {allImages[currentImageIndex]?.caption ? (
                <p className="text-stone-600 text-xs md:text-sm font-bold">
                  {allImages[currentImageIndex].caption}
                </p>
              ) : (
                <>
                  <p className="text-stone-600 text-xs md:text-sm font-bold">
                    {allImages[currentImageIndex]?.title || artwork.title}
                    {(allImages[currentImageIndex]?.year || artwork.year) && <>, {allImages[currentImageIndex]?.year || artwork.year}</>}
                    {isViewingDetail && <span className="font-normal text-stone-500"> (DETAIL)</span>}
                  </p>
                  {(allImages[currentImageIndex]?.materials || artwork.materials) && (
                    <p className="text-stone-500 text-xs md:text-sm">
                      {allImages[currentImageIndex]?.materials || artwork.materials}
                    </p>
                  )}
                  {(allImages[currentImageIndex]?.dimensions || artwork.dimensions) && (
                    <p className="text-stone-500 text-xs md:text-sm">
                      {allImages[currentImageIndex]?.dimensions || artwork.dimensions}
                    </p>
                  )}
                </>
              )}
            </figcaption>
          </div>

          {/* Mobile right arrow — always rendered for centering, invisible when not needed */}
          {isMobile && allImages.length > 1 && (
            <button
              onClick={hasNextImage ? goToNextImage : undefined}
              className="flex-shrink-0 w-8 flex items-center justify-center focus:outline-none"
              aria-label="Next image"
              aria-hidden={!hasNextImage}
            >
              {hasNextImage && (
                <ChevronRight size={18} className="text-stone-400" strokeWidth={1.5} />
              )}
            </button>
          )}
        </div>
      </figure>
    </article>
  );
};

export default ArtworkScrollCard;
