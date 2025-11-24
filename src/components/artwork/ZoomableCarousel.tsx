import { useState, useEffect } from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselApi } from "@/components/ui/carousel";
import { ZoomControls } from "./ZoomControls";
import { HoverNavigationArrows } from "./HoverNavigationArrows";

interface ZoomableCarouselProps {
  images: Array<{ id: string; image_url: string }>;
  title: string;
  currentIndex: number;
}

export const ZoomableCarousel = ({ images, title, currentIndex }: ZoomableCarouselProps) => {
  const [api, setApi] = useState<CarouselApi>();
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0, percentage: 50 });
  const [isHovering, setIsHovering] = useState(false);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  useEffect(() => {
    if (!api) return;

    const updateScrollState = () => {
      setCanScrollPrev(api.canScrollPrev());
      setCanScrollNext(api.canScrollNext());
    };

    updateScrollState();
    api.on("select", updateScrollState);

    return () => {
      api.off("select", updateScrollState);
    };
  }, [api]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    const percentage = (x / width) * 100;

    setMousePosition({ x, y: e.clientY - rect.top, percentage });
  };

  const handleMouseEnter = () => setIsHovering(true);
  const handleMouseLeave = () => {
    setIsHovering(false);
    setIsZoomed(false);
  };

  const handleZoomToggle = () => setIsZoomed(!isZoomed);

  const scrollPrev = () => api?.scrollPrev();
  const scrollNext = () => api?.scrollNext();

  // Determinar si mostrar flecha izquierda o derecha
  const showLeftArrow = isHovering && !isZoomed && mousePosition.percentage < 30 && canScrollPrev;
  const showRightArrow = isHovering && !isZoomed && mousePosition.percentage > 70 && canScrollNext;

  return (
    <div
      className="relative max-w-[60vw] max-h-[calc(100vh-200px)] overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
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
                    alt={title}
                    loading={index === 0 ? "eager" : "lazy"}
                    decoding="async"
                    className={`w-full h-full max-h-[calc(100vh-200px)] object-contain transition-all duration-500 ease-out ${
                      isZoomed ? "scale-[2] cursor-zoom-out" : "scale-100 cursor-zoom-in"
                    }`}
                    onClick={handleZoomToggle}
                  />
                ) : (
                  <div className="w-full aspect-square bg-muted animate-pulse" />
                )}
              </CarouselItem>
            );
          })}
        </CarouselContent>
      </Carousel>

      {/* Zoom Controls */}
      {isHovering && !isZoomed && (
        <ZoomControls isZoomed={isZoomed} onToggle={handleZoomToggle} />
      )}

      {/* Hover Navigation Arrows */}
      <HoverNavigationArrows
        showLeft={showLeftArrow}
        showRight={showRightArrow}
        onPrevious={scrollPrev}
        onNext={scrollNext}
      />
    </div>
  );
};
