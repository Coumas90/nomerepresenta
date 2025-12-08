import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselApi } from "@/components/ui/carousel";
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
  const [api, setApi] = useState<CarouselApi>();
  const [mouseZone, setMouseZone] = useState<"left" | "right" | "center">("center");
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!api) return;

    const updateScrollState = () => {
      setCanScrollPrev(api.canScrollPrev());
      setCanScrollNext(api.canScrollNext());
    };

    updateScrollState();
    api.on("select", () => {
      onIndexChange(api.selectedScrollSnap());
      updateScrollState();
    });
  }, [api, onIndexChange]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isMobile) return; // Ignore mouse events on mobile
    
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
    if (api && canScrollPrev) {
      api.scrollPrev();
    }
  };

  const handleNext = () => {
    if (api && canScrollNext) {
      api.scrollNext();
    }
  };

  // Desktop: show arrows following cursor in hover zones
  // Mobile: always show arrows when navigation is possible
  const showLeftArrow = isMobile 
    ? canScrollPrev && images.length > 1
    : isHovering && mouseZone === "left" && canScrollPrev && images.length > 1;
  
  const showRightArrow = isMobile 
    ? canScrollNext && images.length > 1
    : isHovering && mouseZone === "right" && canScrollNext && images.length > 1;

  const containerWidth = containerRef.current?.offsetWidth || 0;
  const leftArrowX = Math.max(32, Math.min(mousePosition.x, containerWidth * 0.3 - 24));
  const rightArrowX = Math.max(containerWidth * 0.7 + 24, Math.min(mousePosition.x, containerWidth - 32));

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full ${
        !isMobile && (mouseZone === "left" || mouseZone === "right") ? "cursor-none" : ""
      }`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => !isMobile && setIsHovering(true)}
      onMouseLeave={() => !isMobile && setIsHovering(false)}
    >
      <Carousel className="w-full h-full max-h-[calc(100vh-200px)]" setApi={setApi}>
        <CarouselContent className="h-full">
          {images.map((image, index) => {
            const shouldLoad = Math.abs(index - currentIndex) <= 1;

            return (
              <CarouselItem key={image.id} className="flex items-center justify-center h-full">
                {shouldLoad ? (
                  <img
                    src={image.image_url}
                    alt={artwork.title}
                    loading={index === 0 ? "eager" : "lazy"}
                    decoding="async"
                    ref={index === currentIndex && registerImageRef ? registerImageRef : undefined}
                    className="w-full h-full max-h-[calc(100vh-200px)] object-contain transition-opacity duration-300"
                  />
                ) : (
                  <div className="w-full aspect-square bg-muted animate-pulse" />
                )}
              </CarouselItem>
            );
          })}
        </CarouselContent>
      </Carousel>

      {/* Clickable left zone - 30% width */}
      {canScrollPrev && images.length > 1 && (
        <div
          onClick={handlePrevious}
          className="absolute left-0 top-0 bottom-0 w-[30%] z-10"
          aria-label="Previous image zone"
        />
      )}

      {/* Clickable right zone - 30% width */}
      {canScrollNext && images.length > 1 && (
        <div
          onClick={handleNext}
          className="absolute right-0 top-0 bottom-0 w-[30%] z-10"
          aria-label="Next image zone"
        />
      )}

      {/* Left Arrow - Mobile: fixed position, Desktop: follows cursor */}
      {showLeftArrow && (
        <div
          className={`absolute z-20 ${isMobile ? 'pointer-events-auto' : 'pointer-events-none'}`}
          style={isMobile ? {
            left: '16px',
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
          <div className={`${isMobile ? 'bg-black/30 backdrop-blur-sm rounded-full p-2' : ''}`}>
            <ChevronLeft 
              size={isMobile ? 32 : 40} 
              className="text-white drop-shadow-lg" 
              strokeWidth={1.5} 
            />
          </div>
        </div>
      )}

      {/* Right Arrow - Mobile: fixed position, Desktop: follows cursor */}
      {showRightArrow && (
        <div
          className={`absolute z-20 ${isMobile ? 'pointer-events-auto' : 'pointer-events-none'}`}
          style={isMobile ? {
            right: '16px',
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
          <div className={`${isMobile ? 'bg-black/30 backdrop-blur-sm rounded-full p-2' : ''}`}>
            <ChevronRight 
              size={isMobile ? 32 : 40} 
              className="text-white drop-shadow-lg" 
              strokeWidth={1.5} 
            />
          </div>
        </div>
      )}
    </div>
  );
};
