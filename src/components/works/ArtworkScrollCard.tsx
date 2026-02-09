import { useState, useEffect, useRef, useMemo } from "react";
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
      { url: artwork.image_url, isMain: true },
      { url: artwork.image_detail_url, isMain: false },
      ...(artworkImages?.map(img => ({ url: img.image_url, isMain: img.is_main })) || [])
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
  const goToPrevImage = () => {
    if (hasPrevImage) {
      setCurrentImageIndex(prev => prev - 1);
    }
  };

  const goToNextImage = () => {
    if (hasNextImage) {
      setCurrentImageIndex(prev => prev + 1);
    }
  };

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
    <article className="w-full flex flex-col items-center">
      {/* Figure: image + caption stacked vertically, normal flow */}
      <figure className="inline-flex flex-col items-start max-w-[90vw] md:max-w-[70vw] lg:max-w-[60vw] mx-auto">
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
        >
          {/* Gallery frame shadow effect */}
          <div className="absolute inset-0 shadow-2xl shadow-stone-900/15 rounded-sm" />
          
          {/* Main image */}
          {currentImage && (
            <ProgressiveImage
              src={currentImage}
              alt={artwork.title || "Artwork"}
              className="relative z-10 w-full [&_img]:max-h-[88vh] [&_img]:md:max-h-[92vh] [&_img]:lg:max-h-[95vh]"
              objectFit="contain"
              eager={false}
              blurUp
              modernFormats
              responsivePreset="full"
              sizes="(max-width: 768px) 90vw, (max-width: 1024px) 70vw, 60vw"
            />
          )}

          {/* Clickable left zone - 30% width */}
          {hasPrevImage && allImages.length > 1 && (
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

          {/* Clickable right zone - 30% width */}
          {hasNextImage && allImages.length > 1 && (
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

          {/* Left Arrow */}
          {showLeftArrow && (
            <div
              className={cn(
                "absolute z-30",
                isMobile ? "pointer-events-auto" : "pointer-events-none"
              )}
              style={isMobile ? {
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)'
              } : {
                left: `${leftArrowX}px`,
                top: `${mousePosition.y}px`,
                transform: 'translate(-50%, -50%)'
              }}
              onClick={isMobile ? goToPrevImage : undefined}
              aria-hidden={!isMobile}
            >
              <div className={cn(isMobile && "bg-black/30 backdrop-blur-sm rounded-full p-2")}>
                <ChevronLeft 
                  size={isMobile ? 32 : 40} 
                  className="text-stone-600 drop-shadow-lg" 
                  strokeWidth={1.5} 
                />
              </div>
            </div>
          )}

          {/* Right Arrow */}
          {showRightArrow && (
            <div
              className={cn(
                "absolute z-30",
                isMobile ? "pointer-events-auto" : "pointer-events-none"
              )}
              style={isMobile ? {
                right: '16px',
                top: '50%',
                transform: 'translateY(-50%)'
              } : {
                left: `${rightArrowX}px`,
                top: `${mousePosition.y}px`,
                transform: 'translate(-50%, -50%)'
              }}
              onClick={isMobile ? goToNextImage : undefined}
              aria-hidden={!isMobile}
            >
              <div className={cn(isMobile && "bg-black/30 backdrop-blur-sm rounded-full p-2")}>
                <ChevronRight 
                  size={isMobile ? 32 : 40} 
                  className="text-stone-600 drop-shadow-lg" 
                  strokeWidth={1.5} 
                />
              </div>
            </div>
          )}

          {/* Image indicator dots */}
          {allImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex gap-2">
              {allImages.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  className={cn(
                    "w-1.5 h-1.5 rounded-full transition-all duration-300",
                    index === currentImageIndex 
                      ? "bg-white scale-125" 
                      : "bg-white/50 hover:bg-white/75"
                  )}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Caption - normal flow, directly under image */}
        <figcaption className="mt-6 md:mt-8 space-y-0 text-left leading-snug">
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
        </figcaption>
      </figure>
    </article>
  );
};

export default ArtworkScrollCard;
