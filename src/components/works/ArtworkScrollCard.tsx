import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProgressiveImage } from "@/components/ProgressiveImage";
import { ImageSkeleton } from "@/components/ImageSkeleton";
import { useArtworkImages } from "@/hooks/useArtworkImages";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import type { ArtworkData } from "@/types";

interface ArtworkScrollCardProps {
  artwork: ArtworkData;
  isVisible?: boolean;
}

export const ArtworkScrollCard = ({ artwork, isVisible = true }: ArtworkScrollCardProps) => {
  const isMobile = useIsMobile();
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [mouseZone, setMouseZone] = useState<"left" | "right" | "center">("center");
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  // Fetch additional images for this artwork
  const { data: artworkImages } = useArtworkImages(artwork.id);

  // Build all images array: main image first, then detail, then additional images
  const allImages = useMemo(() => {
    const images = [
      { url: artwork.image_url, isMain: true, caption: null as string | null },
      { url: artwork.image_detail_url, isMain: false, caption: null as string | null },
      ...(artworkImages?.map(img => ({ url: img.image_url, isMain: img.is_main, caption: img.caption ?? null })) || [])
    ].filter((img, index, self) => 
      // Remove duplicates and nulls
      img.url && index === self.findIndex(i => i.url === img.url)
    );
    return images;
  }, [artwork.image_url, artwork.image_detail_url, artworkImages]);

  const currentImage = allImages[currentImageIndex]?.url || artwork.image_url;
  const hasNextImage = currentImageIndex < allImages.length - 1;
  const hasPrevImage = currentImageIndex > 0;
  const isViewingDetail = currentImageIndex > 0;

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

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
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
      e.stopPropagation();
    }
  }, [isMobile, allImages.length]);

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

  // Mouse zone detection for desktop arrow following
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isMobile) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const percentage = (x / rect.width) * 100;

    setMousePosition({ x, y });

    if (percentage < 30) {
      setMouseZone("left");
    } else if (percentage > 70) {
      setMouseZone("right");
    } else {
      setMouseZone("center");
    }
  };

  // Arrow visibility logic
  const showLeftArrow = isMobile 
    ? hasPrevImage && allImages.length > 1
    : isHovering && mouseZone === "left" && hasPrevImage && allImages.length > 1;
  
  const showRightArrow = isMobile 
    ? hasNextImage && allImages.length > 1
    : isHovering && mouseZone === "right" && hasNextImage && allImages.length > 1;

  const containerWidth = containerRef.current?.offsetWidth || 0;
  const leftArrowX = Math.max(32, Math.min(mousePosition.x, containerWidth * 0.3 - 24));
  const rightArrowX = Math.max(containerWidth * 0.7 + 24, Math.min(mousePosition.x, containerWidth - 32));

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
      {/* Mobile arrows — outside image, at screen edges */}
      {isMobile && allImages.length > 1 && (
        <>
          {hasPrevImage && (
            <button
              onClick={goToPrevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-30 p-1"
              aria-label="Previous image"
            >
              <ChevronLeft size={24} className="text-stone-600" strokeWidth={1.5} />
            </button>
          )}
          {hasNextImage && (
            <button
              onClick={goToNextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-30 p-1"
              aria-label="Next image"
            >
              <ChevronRight size={24} className="text-stone-600" strokeWidth={1.5} />
            </button>
          )}
        </>
      )}

      {/* Figure: image + caption stacked vertically, normal flow */}
      <figure className="inline-flex flex-col items-start max-w-[80vw] md:max-w-[60vw] lg:max-w-[50vw] mx-auto">
        {/* Image container with carousel overlays */}
        <div
          ref={containerRef}
          className={cn(
            "relative w-full",
            !isMobile && (mouseZone === "left" || mouseZone === "right") ? "cursor-none" : ""
          )}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => !isMobile && setIsHovering(true)}
          onMouseLeave={() => !isMobile && setIsHovering(false)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
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
              blurUp
              modernFormats
              responsivePreset="full"
              sizes="(max-width: 768px) 90vw, (max-width: 1024px) 70vw, 60vw"
            />
          )}

          {/* Clickable left zone - 30% width (desktop only) */}
          {!isMobile && hasPrevImage && allImages.length > 1 && (
            <div
              role="button"
              tabIndex={0}
              onClick={goToPrevImage}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  goToPrevImage();
                }
              }}
              className="absolute left-0 top-0 bottom-0 w-[30%] z-20 cursor-none focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-900/50"
              aria-label="Previous image"
            />
          )}

          {/* Clickable right zone - 30% width (desktop only) */}
          {!isMobile && hasNextImage && allImages.length > 1 && (
            <div
              role="button"
              tabIndex={0}
              onClick={goToNextImage}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  goToNextImage();
                }
              }}
              className="absolute right-0 top-0 bottom-0 w-[30%] z-20 cursor-none focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-900/50"
              aria-label="Next image"
            />
          )}

          {/* Desktop Left Arrow */}
          {!isMobile && allImages.length > 1 && hasPrevImage && (
            <div
              className={cn(
                "absolute z-30 pointer-events-none transition-opacity duration-300 ease-in-out",
                showLeftArrow ? "opacity-100" : "opacity-0"
              )}
              style={{
                left: `${leftArrowX}px`,
                top: `${mousePosition.y}px`,
                transform: 'translate(-50%, -50%)'
              }}
              aria-hidden
            >
              <ChevronLeft 
                size={40} 
                className="text-stone-600 drop-shadow-lg" 
                strokeWidth={1.5} 
              />
            </div>
          )}

          {/* Desktop Right Arrow */}
          {!isMobile && allImages.length > 1 && hasNextImage && (
            <div
              className={cn(
                "absolute z-30 pointer-events-none transition-opacity duration-300 ease-in-out",
                showRightArrow ? "opacity-100" : "opacity-0"
              )}
              style={{
                left: `${rightArrowX}px`,
                top: `${mousePosition.y}px`,
                transform: 'translate(-50%, -50%)'
              }}
              aria-hidden
            >
              <ChevronRight 
                size={40} 
                className="text-stone-600 drop-shadow-lg" 
                strokeWidth={1.5} 
              />
            </div>
          )}
        </div>

        {/* Image indicator dots — below image, above title */}
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

        {/* Caption - normal flow, directly under image */}
        <figcaption className="mt-3 md:mt-4 space-y-0 text-left leading-snug">
          {allImages[currentImageIndex]?.caption ? (
            <p className="text-stone-600 text-xs md:text-sm font-bold">
              {allImages[currentImageIndex].caption}
            </p>
          ) : (
            <>
              <p className="text-stone-600 text-xs md:text-sm font-bold">
                {artwork.title}
                {artwork.year && <>, {artwork.year}</>}
                {isViewingDetail && <span className="font-normal text-stone-500"> (DETAIL)</span>}
              </p>
              {artwork.materials && (
                <p className="text-stone-500 text-xs md:text-sm">
                  {artwork.materials}
                </p>
              )}
              {artwork.dimensions && (
                <p className="text-stone-500 text-xs md:text-sm">
                  {artwork.dimensions}
                </p>
              )}
            </>
          )}
        </figcaption>
      </figure>
    </article>
  );
};

export default ArtworkScrollCard;
