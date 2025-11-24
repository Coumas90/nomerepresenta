import { ChevronLeft, ChevronRight } from "lucide-react";

interface HoverNavigationArrowsProps {
  showLeft: boolean;
  showRight: boolean;
  onPrevious: () => void;
  onNext: () => void;
}

export const HoverNavigationArrows = ({
  showLeft,
  showRight,
  onPrevious,
  onNext,
}: HoverNavigationArrowsProps) => {
  return (
    <>
      {/* Left Arrow */}
      {showLeft && (
        <button
          onClick={onPrevious}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground opacity-0 hover:opacity-100 transition-opacity duration-300 animate-fade-in z-10"
          aria-label="Previous image"
        >
          <ChevronLeft size={48} strokeWidth={1.5} />
        </button>
      )}

      {/* Right Arrow */}
      {showRight && (
        <button
          onClick={onNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground opacity-0 hover:opacity-100 transition-opacity duration-300 animate-fade-in z-10"
          aria-label="Next image"
        >
          <ChevronRight size={48} strokeWidth={1.5} />
        </button>
      )}
    </>
  );
};
