import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import { ZoomModal } from "./ZoomModal";

interface InteractiveGalleryProps {
  images: string[];
  alt: string;
}

export const InteractiveGallery = ({ images, alt }: InteractiveGalleryProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hoverZone, setHoverZone] = useState<"left" | "center" | "right" | null>(null);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return;
    
    const rect = imageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    
    if (x < width * 0.33) {
      setHoverZone("left");
    } else if (x > width * 0.67) {
      setHoverZone("right");
    } else {
      setHoverZone("center");
    }
  };

  const handleMouseLeave = () => {
    setHoverZone(null);
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return;
    
    const rect = imageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    
    if (x < width * 0.33) {
      // Left zone - previous image
      handlePrevious();
    } else if (x > width * 0.67) {
      // Right zone - next image
      handleNext();
    } else {
      // Center zone - open zoom modal
      setIsZoomOpen(true);
    }
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  const getCursorClass = () => {
    if (hoverZone === "center") return "cursor-zoom-in";
    if (hoverZone === "left" || hoverZone === "right") return "cursor-pointer";
    return "";
  };

  // Preload adjacent images
  useEffect(() => {
    const preloadImages = () => {
      const prevIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1;
      const nextIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0;
      
      [prevIndex, nextIndex].forEach(idx => {
        const img = new Image();
        img.src = images[idx];
      });
    };
    
    if (images.length > 1) {
      preloadImages();
    }
  }, [currentIndex, images]);

  if (images.length === 0) return null;

  return (
    <>
      <div className="relative w-full max-w-xl group">
        <div
          ref={imageRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick}
          className={`relative ${getCursorClass()}`}
        >
          <img
            src={images[currentIndex]}
            alt={`${alt} - Image ${currentIndex + 1}`}
            loading="lazy"
            decoding="async"
            className="w-full h-auto object-contain transition-opacity duration-300"
          />

          {/* Navigation arrows - only show if multiple images */}
          {images.length > 1 && (
            <>
              {/* Left arrow */}
              <div
                className={`absolute left-4 top-1/2 -translate-y-1/2 transition-opacity duration-200 pointer-events-none ${
                  hoverZone === "left" ? "opacity-100" : "opacity-0"
                }`}
              >
                <div className="bg-background/80 backdrop-blur-sm p-2 rounded-full">
                  <ChevronLeft className="w-6 h-6 text-foreground" />
                </div>
              </div>

              {/* Right arrow */}
              <div
                className={`absolute right-4 top-1/2 -translate-y-1/2 transition-opacity duration-200 pointer-events-none ${
                  hoverZone === "right" ? "opacity-100" : "opacity-0"
                }`}
              >
                <div className="bg-background/80 backdrop-blur-sm p-2 rounded-full">
                  <ChevronRight className="w-6 h-6 text-foreground" />
                </div>
              </div>

              {/* Center zoom icon */}
              <div
                className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-opacity duration-200 pointer-events-none ${
                  hoverZone === "center" ? "opacity-100" : "opacity-0"
                }`}
              >
                <div className="bg-background/80 backdrop-blur-sm p-3 rounded-full">
                  <ZoomIn className="w-8 h-8 text-foreground" />
                </div>
              </div>
            </>
          )}

          {/* Single image zoom icon */}
          {images.length === 1 && (
            <div
              className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-opacity duration-200 pointer-events-none ${
                hoverZone === "center" ? "opacity-100" : "opacity-0"
              }`}
            >
              <div className="bg-background/80 backdrop-blur-sm p-3 rounded-full">
                <ZoomIn className="w-8 h-8 text-foreground" />
              </div>
            </div>
          )}
        </div>

        {/* Image counter */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium">
            {currentIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Zoom Modal */}
      <ZoomModal
        isOpen={isZoomOpen}
        onClose={() => setIsZoomOpen(false)}
        images={images}
        initialIndex={currentIndex}
        alt={alt}
      />
    </>
  );
};
