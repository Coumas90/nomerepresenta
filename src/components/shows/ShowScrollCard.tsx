/**
 * ShowScrollCard — reuses the same visual language as ArtworkScrollCard
 * but places the show title ABOVE the carousel.
 */
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { ProgressiveImage } from "@/components/ProgressiveImage";
import { ImageSkeleton } from "@/components/ImageSkeleton";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import type { ShowData, ShowImage } from "@/types/show";

// SVG cursor data URIs — same as ArtworkScrollCard
const cursorLeftSvg = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23787874' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m15 18-6-6 6-6'/%3E%3C/svg%3E") 12 12, pointer`;
const cursorRightSvg = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23787874' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m9 18 6-6-6-6'/%3E%3C/svg%3E") 12 12, pointer`;

interface ShowScrollCardProps {
  show: ShowData;
  images: ShowImage[];
  onNavigate?: () => void;
  isDetailPage?: boolean;
}

export const ShowScrollCard = ({ show, images, onNavigate, isDetailPage = false }: ShowScrollCardProps) => {
  const isMobile = useIsMobile();
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const allImages = useMemo(() => {
    if (!images.length) return [];
    return images.map((img) => ({
      url: img.image_url,
      caption: img.caption ?? null,
      altText: img.alt_text ?? null,
    }));
  }, [images]);

  const currentImage = allImages[currentImageIndex]?.url;

  // Reset on show change
  useEffect(() => { setCurrentImageIndex(0); }, [show.id]);

  // Preload adjacent
  useEffect(() => {
    [currentImageIndex - 1, currentImageIndex + 1].forEach((i) => {
      const url = allImages[i]?.url;
      if (url) { const img = new Image(); img.src = url; }
    });
  }, [currentImageIndex, allImages]);

  const goToPrev = useCallback(() => {
    if (allImages.length <= 1) return;
    setCurrentImageIndex((p) => (p === 0 ? allImages.length - 1 : p - 1));
  }, [allImages.length]);

  const goToNext = useCallback(() => {
    if (allImages.length <= 1) return;
    setCurrentImageIndex((p) => (p === allImages.length - 1 ? 0 : p + 1));
  }, [allImages.length]);

  // Touch swipe
  const swipeStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const swipeLockedRef = useRef<"horizontal" | "vertical" | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!isMobile || allImages.length <= 1) return;
    const t = e.touches[0];
    swipeStartRef.current = { x: t.clientX, y: t.clientY, time: Date.now() };
    swipeLockedRef.current = null;
  }, [isMobile, allImages.length]);

  const touchMoveHandler = useCallback((e: TouchEvent) => {
    if (!isMobile || !swipeStartRef.current || allImages.length <= 1) return;
    const t = e.touches[0];
    const dx = t.clientX - swipeStartRef.current.x;
    const dy = t.clientY - swipeStartRef.current.y;
    if (!swipeLockedRef.current && (Math.abs(dx) > 10 || Math.abs(dy) > 10)) {
      swipeLockedRef.current = Math.abs(dx) > Math.abs(dy) ? "horizontal" : "vertical";
    }
    if (swipeLockedRef.current === "horizontal") { e.preventDefault(); e.stopPropagation(); }
  }, [isMobile, allImages.length]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !isMobile || allImages.length <= 1) return;
    el.addEventListener("touchmove", touchMoveHandler, { passive: false });
    return () => el.removeEventListener("touchmove", touchMoveHandler);
  }, [touchMoveHandler, isMobile, allImages.length]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!isMobile || !swipeStartRef.current || allImages.length <= 1) return;
    if (swipeLockedRef.current !== "horizontal") { swipeStartRef.current = null; return; }
    const t = e.changedTouches[0];
    const dx = t.clientX - swipeStartRef.current.x;
    const elapsed = Date.now() - swipeStartRef.current.time;
    const velocity = Math.abs(dx) / elapsed;
    if (Math.abs(dx) > 40 || (velocity > 0.4 && Math.abs(dx) > 15)) {
      if (dx < 0) goToNext(); else goToPrev();
    }
    swipeStartRef.current = null;
    swipeLockedRef.current = null;
  }, [isMobile, allImages.length, goToNext, goToPrev]);

  if (!allImages.length) {
    return (
      <article className="w-full flex flex-col items-center">
        <div className="max-w-[95vw] md:max-w-[60vw] lg:max-w-[50vw] mx-auto">
          <h3 className="text-stone-600 text-xs md:text-[15px] font-bold uppercase tracking-wider mb-4">
            {show.title}{show.year && <>, {show.year}</>}
          </h3>
          <p className="text-stone-400 text-sm">No images yet</p>
        </div>
      </article>
    );
  }

  return (
    <article className="relative w-full flex flex-col items-center">
      <figure className="inline-flex flex-col items-start max-w-[95vw] md:max-w-[75vw] lg:max-w-[65vw] mx-auto overflow-visible">
        {/* SHOW TITLE — above carousel */}
        <div className="mb-4 md:mb-6">
          {onNavigate ? (
            <button onClick={onNavigate} className="text-left group">
              <h3 className="text-stone-600 text-xs md:text-[15px] font-bold group-hover:text-stone-900 transition-colors">
                {show.title}{show.year && <>, {show.year}</>}
              </h3>
              {show.subtitle && (
                <p className="text-stone-500 text-xs md:text-sm mt-[2px]">{show.subtitle}</p>
              )}
            </button>
          ) : (
            <>
              <h3 className="text-stone-600 text-xs md:text-[15px] font-bold">
                {show.title}{show.year && <>, {show.year}</>}
              </h3>
              {show.subtitle && (
                <p className="text-stone-500 text-xs md:text-sm mt-[2px]">{show.subtitle}</p>
              )}
            </>
          )}
        </div>

        {/* Image container with navigation — same as ArtworkScrollCard */}
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
                  alt={allImages[currentImageIndex]?.altText || show.title}
                  className="relative z-10 [&_img]:max-h-[75vh] [&_img]:md:max-h-[80vh] [&_img]:lg:max-h-[85vh]"
                  objectFit="contain"
                  skipInternalFade
                  blurUp={false}
                  modernFormats
                  responsivePreset="full"
                  sizes="(max-width: 768px) 90vw, (max-width: 1024px) 70vw, 60vw"
                />
              )}

              {/* Mobile tap zones */}
              {isMobile && allImages.length > 1 && (
                <>
                  <button onClick={goToPrev} className="absolute left-0 top-0 bottom-0 w-[30%] z-20 focus:outline-none" aria-label="Previous image" />
                  <button onClick={goToNext} className="absolute right-0 top-0 bottom-0 w-[30%] z-20 focus:outline-none" aria-label="Next image" />
                </>
              )}

              {/* Desktop clickable zones with custom cursors */}
              {!isMobile && allImages.length > 1 && (
                <>
                  <button onClick={goToPrev} className="absolute top-0 bottom-0 z-20 focus:outline-none -left-[50vw] w-[calc(50%+50vw)]" style={{ cursor: cursorLeftSvg }} aria-label="Previous image" />
                  <button onClick={goToNext} className="absolute top-0 bottom-0 z-20 focus:outline-none -right-[50vw] w-[calc(50%+50vw)]" style={{ cursor: cursorRightSvg }} aria-label="Next image" />
                </>
              )}
            </div>

            {/* Dots */}
            {allImages.length > 1 && (
              <div className="mt-3 flex gap-1.5">
                {allImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={cn(
                      "w-1.5 h-1.5 rounded-full transition-all duration-300",
                      index === currentImageIndex ? "bg-stone-900" : "bg-stone-400"
                    )}
                    aria-label={`Go to image ${index + 1}`}
                  />
                ))}
              </div>
            )}

            {/* Caption */}
            {allImages[currentImageIndex]?.caption && (
              <figcaption className="mt-3 md:mt-4 text-left leading-snug">
                <p className="text-stone-600 text-xs md:text-sm font-bold">
                  {allImages[currentImageIndex].caption}
                </p>
              </figcaption>
            )}
          </div>
        </div>

        {/* Description (detail page only) */}
        {isDetailPage && show.description && (
          <p className="mt-6 md:mt-8 text-stone-600 text-sm md:text-base leading-relaxed max-w-prose">
            {show.description}
          </p>
        )}
      </figure>
    </article>
  );
};
