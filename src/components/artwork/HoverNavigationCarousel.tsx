import { useState, useEffect } from "react";
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
    api.on("select", () => {
      onIndexChange(api.selectedScrollSnap());
      updateScrollState();
    });
  }, [api, onIndexChange]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;

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

  return (
    <div
      className="relative w-full h-full"
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

      {/* Left Arrow - zona izquierda */}
      {showLeftArrow && (
        <button
          onClick={handlePrevious}
          className="absolute left-8 top-1/2 -translate-y-1/2 z-10 transition-opacity duration-200 hover:scale-110 transform"
          aria-label="Previous image"
        >
          <ChevronLeft size={48} className="text-foreground drop-shadow-lg" strokeWidth={1.5} />
        </button>
      )}

      {/* Right Arrow - zona derecha */}
      {showRightArrow && (
        <button
          onClick={handleNext}
          className="absolute right-8 top-1/2 -translate-y-1/2 z-10 transition-opacity duration-200 hover:scale-110 transform"
          aria-label="Next image"
        >
          <ChevronRight size={48} className="text-foreground drop-shadow-lg" strokeWidth={1.5} />
        </button>
      )}
    </div>
  );
};
