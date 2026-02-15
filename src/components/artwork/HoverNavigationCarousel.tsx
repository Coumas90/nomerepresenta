import { ChevronLeft, ChevronRight } from "lucide-react";

interface HoverNavigationCarouselProps {
  images: Array<{ id: string; image_url: string; alt_text?: string | null }>;
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
  const canScrollPrev = currentIndex > 0;
  const canScrollNext = currentIndex < images.length - 1;
  const hasMultiple = images.length > 1;

  const handlePrevious = () => {
    if (canScrollPrev) onIndexChange(currentIndex - 1);
  };

  const handleNext = () => {
    if (canScrollNext) onIndexChange(currentIndex + 1);
  };

  const currentImage = images[currentIndex];

  return (
    <div className="relative w-full overflow-visible">
      {/* Image */}
      {currentImage && (
        <img
          key={currentImage.id}
          src={currentImage.image_url}
          alt={currentImage.alt_text || artwork.title}
          loading="eager"
          decoding="async"
          ref={registerImageRef}
          className="w-full h-auto max-h-[90vh] object-contain"
        />
      )}

      {/* Left clickable zone — extends 15vw outside the image */}
      {canScrollPrev && hasMultiple && (
        <button
          onClick={handlePrevious}
          className="absolute -left-[15vw] top-0 bottom-0 w-[calc(50%+15vw)] z-10 cursor-pointer focus:outline-none group"
          aria-label="Previous image"
        >
          <ChevronLeft
            size={20}
            className="absolute left-[15vw] top-1/2 -translate-y-1/2 text-stone-400 opacity-0 group-hover:opacity-100 transition-opacity md:opacity-100"
            strokeWidth={1.5}
          />
        </button>
      )}

      {/* Right clickable zone — extends 15vw outside the image */}
      {canScrollNext && hasMultiple && (
        <button
          onClick={handleNext}
          className="absolute -right-[15vw] top-0 bottom-0 w-[calc(50%+15vw)] z-10 cursor-pointer focus:outline-none group"
          aria-label="Next image"
        >
          <ChevronRight
            size={20}
            className="absolute right-[15vw] top-1/2 -translate-y-1/2 text-stone-400 opacity-0 group-hover:opacity-100 transition-opacity md:opacity-100"
            strokeWidth={1.5}
          />
        </button>
      )}
    </div>
  );
};
