import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselApi } from "@/components/ui/carousel";

interface HoverNavigationCarouselProps {
  images: Array<{ id: string; image_url: string }>;
  artwork: {
    title: string;
  };
  currentIndex: number;
  onIndexChange: (index: number) => void;
}

export const HoverNavigationCarousel = ({
  images,
  artwork,
  currentIndex,
  onIndexChange,
}: HoverNavigationCarouselProps) => {
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
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const percentage = (x / rect.width) * 100;

    // Guardar posición exacta del cursor
    setMousePosition({ x, y });

    // Determinar zona
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

  const showLeftArrow = isHovering && mouseZone === "left" && canScrollPrev && images.length > 1;
  const showRightArrow = isHovering && mouseZone === "right" && canScrollNext && images.length > 1;

  // Calcular posiciones de las flechas con límites
  const containerWidth = containerRef.current?.offsetWidth || 0;
  const leftArrowX = Math.max(32, Math.min(mousePosition.x, containerWidth * 0.3 - 24));
  const rightArrowX = Math.max(containerWidth * 0.7 + 24, Math.min(mousePosition.x, containerWidth - 32));

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full ${
        mouseZone === "left" || mouseZone === "right" ? "cursor-none" : ""
      }`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
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

      {/* Zona clickeable izquierda - 30% del ancho */}
      {canScrollPrev && images.length > 1 && (
        <div
          onClick={handlePrevious}
          className="absolute left-0 top-0 bottom-0 w-[30%] z-10 cursor-pointer"
          aria-label="Previous image zone"
        />
      )}

      {/* Zona clickeable derecha - 30% del ancho */}
      {canScrollNext && images.length > 1 && (
        <div
          onClick={handleNext}
          className="absolute right-0 top-0 bottom-0 w-[30%] z-10 cursor-pointer"
          aria-label="Next image zone"
        />
      )}

      {/* Left Arrow - indicador visual que sigue el cursor */}
      {showLeftArrow && (
        <div
          className="absolute z-20 pointer-events-none"
          style={{
            left: `${leftArrowX}px`,
            top: `${mousePosition.y}px`,
            transform: 'translate(-50%, -50%)'
          }}
          aria-hidden="true"
        >
          <ChevronLeft size={40} className="text-foreground drop-shadow-lg" strokeWidth={1.5} />
        </div>
      )}

      {/* Right Arrow - indicador visual que sigue el cursor */}
      {showRightArrow && (
        <div
          className="absolute z-20 pointer-events-none"
          style={{
            left: `${rightArrowX}px`,
            top: `${mousePosition.y}px`,
            transform: 'translate(-50%, -50%)'
          }}
          aria-hidden="true"
        >
          <ChevronRight size={40} className="text-foreground drop-shadow-lg" strokeWidth={1.5} />
        </div>
      )}
    </div>
  );
};
