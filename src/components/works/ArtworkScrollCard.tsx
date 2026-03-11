import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProgressiveImage } from "@/components/ProgressiveImage";
import { ImageSkeleton } from "@/components/ImageSkeleton";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import type { ArtworkData, ArtworkImage } from "@/types";

interface ArtworkScrollCardProps {
  artwork: ArtworkData;
  isVisible?: boolean;
  preloadedImages?: ArtworkImage[];
  eager?: boolean;
  onGalleryNavigate?: (artworkId: string) => void;
  imageOverrides?: { hidden_images?: string[]; image_order?: string[] };
}

// SVG cursor data URIs — minimal chevron arrows
const cursorLeftSvg = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23787874' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m15 18-6-6 6-6'/%3E%3C/svg%3E") 12 12, pointer`;
const cursorRightSvg = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23787874' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m9 18 6-6-6-6'/%3E%3C/svg%3E") 12 12, pointer`;

export const ArtworkScrollCard = ({ artwork, isVisible = true, preloadedImages, eager = false, onGalleryNavigate, imageOverrides }: ArtworkScrollCardProps) => {
  const isMobile = useIsMobile();
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Use preloaded images (from batch query) instead of per-artwork query
  const artworkImages = preloadedImages;

  // Build images array: prefer artwork_images table (has per-image metadata),
  // fall back to legacy artwork fields only when no artwork_images exist
  const allImages = useMemo(() => {
    if (artworkImages && artworkImages.length > 0) {
      // Apply Works-specific overrides: filter hidden, reorder
      let filtered = artworkImages;
      if (imageOverrides?.hidden_images?.length) {
        const hiddenSet = new Set(imageOverrides.hidden_images);
        filtered = filtered.filter(img => !hiddenSet.has(img.id));
      }
      if (imageOverrides?.image_order?.length) {
        const orderMap = new Map(imageOverrides.image_order.map((id, i) => [id, i]));
        filtered = [...filtered].sort((a, b) => {
          const aIdx = orderMap.get(a.id) ?? 9999;
          const bIdx = orderMap.get(b.id) ?? 9999;
          return aIdx - bIdx;
        });
      }
      const mapped = filtered.map(img => ({
        url: img.image_url,
        isMain: img.is_main,
        caption: img.caption ?? null,
        title: img.title ?? null,
        year: img.year ?? null,
        dimensions: img.dimensions ?? null,
        materials: img.materials ?? null,
        isDetail: img.is_detail ?? false,
        altText: img.alt_text ?? null,
      }));
      // If no custom order, ensure non-detail images come before detail images
      if (!imageOverrides?.image_order?.length) {
        mapped.sort((a, b) => {
          if (a.isDetail !== b.isDetail) return a.isDetail ? 1 : -1;
          return 0;
        });
      }
      return mapped;
    }
    // Legacy fallback: no artwork_images rows exist
    const images = [
      { url: artwork.image_url, isMain: true, caption: null as string | null, title: null as string | null, year: null as string | null, dimensions: null as string | null, materials: null as string | null, isDetail: false, altText: null as string | null },
    ];
    if (artwork.image_detail_url) {
      images.push({ url: artwork.image_detail_url, isMain: false, caption: null, title: null, year: null, dimensions: null, materials: null, isDetail: true, altText: null });
    }
    return images.filter(img => img.url);
  }, [artwork.image_url, artwork.image_detail_url, artworkImages]);

  const currentImage = allImages[currentImageIndex]?.url || artwork.image_url;
  const hasNextImage = currentImageIndex < allImages.length - 1;
  const hasPrevImage = currentImageIndex > 0;
  const isViewingDetail = allImages[currentImageIndex]?.isDetail || false;

  // Reset image index when artwork changes
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [artwork.id]);

  // Preload adjacent images so carousel transitions are instant
  useEffect(() => {
    const preloadIndexes = [currentImageIndex - 1, currentImageIndex + 1];
    preloadIndexes.forEach(i => {
      const url = allImages[i]?.url;
      if (url) {
        const img = new Image();
        img.src = url;
      }
    });
  }, [currentImageIndex, allImages]);

  // Navigation handlers
  const goToPrevImage = useCallback(() => {
    if (allImages.length <= 1) return;
    setCurrentImageIndex(prev => prev === 0 ? allImages.length - 1 : prev - 1);
    onGalleryNavigate?.(artwork.id);
  }, [allImages.length, onGalleryNavigate, artwork.id]);

  const goToNextImage = useCallback(() => {
    if (allImages.length <= 1) return;
    setCurrentImageIndex(prev => prev === allImages.length - 1 ? 0 : prev + 1);
    onGalleryNavigate?.(artwork.id);
  }, [allImages.length, onGalleryNavigate, artwork.id]);

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
      <figure className="inline-flex flex-col items-start max-w-[95vw] md:max-w-[60vw] lg:max-w-[50vw] mx-auto overflow-visible">
        {/* Image container with navigation */}
        <div className="relative w-full flex items-center">

          {/* Image + touch/click zones */}
          <div
            ref={containerRef}
            className="flex-1 min-w-0 select-none"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* Image wrapper — shadow and navigation scoped here */}
            <div className="relative">
              {/* Shadow applied directly to image via CSS to avoid Safari frame artifact */}
              
              {/* Main image */}
              {currentImage && (
              <ProgressiveImage
                  src={currentImage}
                  alt={allImages[currentImageIndex]?.altText || artwork.title || "Artwork"}
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

              {/* Mobile tap zones (invisible, no arrows) */}
              {isMobile && allImages.length > 1 && (
                <>
                  <button
                    onClick={goToPrevImage}
                    className="absolute left-0 top-0 bottom-0 w-[30%] z-20 focus:outline-none"
                    aria-label="Previous image"
                  />
                  <button
                    onClick={goToNextImage}
                    className="absolute right-0 top-0 bottom-0 w-[30%] z-20 focus:outline-none"
                    aria-label="Next image"
                  />
                </>
              )}

              {/* Desktop clickable zones with custom cursors */}
              {!isMobile && allImages.length > 1 && (
                <>
                  <button
                    onClick={goToPrevImage}
                    className="absolute top-0 bottom-0 z-20 focus:outline-none -left-[50vw] w-[calc(50%+50vw)]"
                    style={{ cursor: cursorLeftSvg }}
                    aria-label="Previous image"
                  />
                  <button
                    onClick={goToNextImage}
                    className="absolute top-0 bottom-0 z-20 focus:outline-none -right-[50vw] w-[calc(50%+50vw)]"
                    style={{ cursor: cursorRightSvg }}
                    aria-label="Next image"
                  />
                </>
              )}
            </div>
            {/* Mobile dots */}
            {isMobile && allImages.length > 1 && (
              <div className="mt-3 flex gap-1.5">
                {allImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={cn(
                      "w-1.5 h-1.5 rounded-full transition-all duration-300",
                      index === currentImageIndex 
                        ? "bg-stone-900" 
                        : "bg-stone-400"
                    )}
                    aria-label={`Go to image ${index + 1}`}
                  />
                ))}
              </div>
            )}

            {/* Caption row — caption left, pagination right on desktop */}
            <figcaption className="mt-6 md:mt-9 text-left leading-snug">
              <div className="flex justify-between items-start gap-4">
                <div>
                  {allImages[currentImageIndex]?.caption ? (
                    <p className="text-stone-600 text-xs md:text-sm font-bold">
                      {allImages[currentImageIndex].caption}
                    </p>
                  ) : (
                    <>
                      <p className="text-stone-600 text-xs md:text-[15px] font-bold">
                        {allImages[currentImageIndex]?.title || artwork.title}
                        {(allImages[currentImageIndex]?.year || artwork.year) && <>, {allImages[currentImageIndex]?.year || artwork.year}</>}
                        {isViewingDetail && <span className="font-normal text-stone-500"> (DETAIL)</span>}
                      </p>
                      {(allImages[currentImageIndex]?.materials || artwork.materials) && (
                        <p className="text-stone-500 text-xs md:text-sm mt-[2px] md:mt-[6px]">
                          {allImages[currentImageIndex]?.materials || artwork.materials}
                        </p>
                      )}
                      {(allImages[currentImageIndex]?.dimensions || artwork.dimensions) && (
                        <p className="text-stone-500 text-xs md:text-sm mt-[2px] md:mt-[5px]">
                          {allImages[currentImageIndex]?.dimensions || artwork.dimensions}
                        </p>
                      )}
                    </>
                  )}
                </div>
                {!isMobile && allImages.length > 1 && (
                  <p className="text-stone-400 text-[10px] md:text-xs whitespace-nowrap shrink-0" style={{ letterSpacing: '0.5px' }}>
                    [ {currentImageIndex + 1} / {allImages.length} ]
                  </p>
                )}
              </div>
            </figcaption>
          </div>

        </div>
      </figure>
    </article>
  );
};

export default ArtworkScrollCard;
