import { useState, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface HoverNavigationCarouselProps {
  images: Array<{ id: string; image_url: string }>;
  artwork: {
    title: string;
  };
  currentIndex: number;
  onIndexChange: (index: number) => void;
  registerImageRef?: (element: HTMLImageElement | null) => void;
}

export const HoverNavigationCarousel = ({
  images,
  artwork,
  currentIndex,
  onIndexChange,
  registerImageRef,
}: HoverNavigationCarouselProps) => {
  const isMobile = useIsMobile();
  const [mouseZone, setMouseZone] = useState<"left" | "right" | "center">("center");
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const canScrollPrev = currentIndex > 0;
  const canScrollNext = currentIndex < images.length - 1;

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

  const handlePrevious = () => {
    if (canScrollPrev) onIndexChange(currentIndex - 1);
  };

  const handleNext = () => {
    if (canScrollNext) onIndexChange(currentIndex + 1);
  };

  const showLeftArrow = isMobile 
    ? canScrollPrev && images.length > 1
    : isHovering && mouseZone === "left" && canScrollPrev && images.length > 1;
  
  const showRightArrow = isMobile 
    ? canScrollNext && images.length > 1
    : isHovering && mouseZone === "right" && canScrollNext && images.length > 1;

  const containerWidth = containerRef.current?.offsetWidth || 0;
  const leftArrowX = Math.max(32, Math.min(mousePosition.x, containerWidth * 0.3 - 24));
  const rightArrowX = Math.max(containerWidth * 0.7 + 24, Math.min(mousePosition.x, containerWidth - 32));

  const currentImage = images[currentIndex];

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-visible ${
        !isMobile && (mouseZone === "left" || mouseZone === "right") ? "cursor-none" : ""
      }`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => !isMobile && setIsHovering(true)}
      onMouseLeave={() => !isMobile && setIsHovering(false)}
    >
      {/* Image — no fixed aspect ratio, adapts to content */}
      {currentImage && (
        <img
          key={currentImage.id}
          src={currentImage.image_url}
          alt={artwork.title}
          loading="eager"
          decoding="async"
          ref={registerImageRef}
          className="w-full h-auto max-h-[90vh] object-contain"
        />
      )}

      {/* Clickable left zone */}
      {canScrollPrev && images.length > 1 && (
        <div
          role="button"
          tabIndex={0}
          onClick={handlePrevious}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handlePrevious();
            }
          }}
          className="absolute -left-[15vw] top-0 bottom-0 w-[calc(30%+15vw)] z-10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
          aria-label="Previous image"
        />
      )}

      {/* Clickable right zone */}
      {canScrollNext && images.length > 1 && (
        <div
          role="button"
          tabIndex={0}
          onClick={handleNext}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleNext();
            }
          }}
          className="absolute -right-[15vw] top-0 bottom-0 w-[calc(30%+15vw)] z-10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
          aria-label="Next image"
        />
      )}

      {/* Left Arrow */}
      {showLeftArrow && (
        <div
          className={`absolute z-20 ${isMobile ? 'pointer-events-auto' : 'pointer-events-none'}`}
          style={isMobile ? {
            left: '-4px',
            top: '50%',
            transform: 'translateY(-50%)'
          } : {
            left: `${leftArrowX}px`,
            top: `${mousePosition.y}px`,
            transform: 'translate(-50%, -50%)'
          }}
          onClick={isMobile ? handlePrevious : undefined}
          aria-hidden={!isMobile}
        >
          <ChevronLeft 
            size={isMobile ? 20 : 40} 
            className={isMobile ? "text-stone-500" : "text-white drop-shadow-lg"}
            strokeWidth={1.5} 
          />
        </div>
      )}

      {/* Right Arrow */}
      {showRightArrow && (
        <div
          className={`absolute z-20 ${isMobile ? 'pointer-events-auto' : 'pointer-events-none'}`}
          style={isMobile ? {
            right: '-4px',
            top: '50%',
            transform: 'translateY(-50%)'
          } : {
            left: `${rightArrowX}px`,
            top: `${mousePosition.y}px`,
            transform: 'translate(-50%, -50%)'
          }}
          onClick={isMobile ? handleNext : undefined}
          aria-hidden={!isMobile}
        >
          <ChevronRight 
            size={isMobile ? 20 : 40} 
            className={isMobile ? "text-stone-500" : "text-white drop-shadow-lg"}
            strokeWidth={1.5} 
          />
        </div>
      )}
    </div>
  );
};
