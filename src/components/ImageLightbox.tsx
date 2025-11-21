import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";

interface ImageLightboxProps {
  images: { id: string; image_url: string }[];
  currentIndex: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  altText: string;
}

const ImageLightbox = ({ images, currentIndex, open, onOpenChange, altText }: ImageLightboxProps) => {
  const [activeIndex, setActiveIndex] = useState(currentIndex);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    setActiveIndex(currentIndex);
    setZoom(1);
  }, [currentIndex, open]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;
      
      if (e.key === "ArrowLeft") {
        handlePrevious();
      } else if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "Escape") {
        onOpenChange(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, activeIndex, images.length]);

  const handlePrevious = () => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
    setZoom(1);
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
    setZoom(1);
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.5, 1));
  };

  if (!images[activeIndex]) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full p-0 bg-black/95 border-none">
        {/* Close Button */}
        <Button
          onClick={() => onOpenChange(false)}
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 z-50 text-white hover:bg-white/20 rounded-full"
        >
          <X className="h-6 w-6" />
        </Button>

        {/* Zoom Controls */}
        <div className="absolute top-4 left-4 z-50 flex gap-2">
          <Button
            onClick={handleZoomOut}
            variant="ghost"
            size="icon"
            disabled={zoom <= 1}
            className="text-white hover:bg-white/20 rounded-full"
          >
            <ZoomOut className="h-5 w-5" />
          </Button>
          <Button
            onClick={handleZoomIn}
            variant="ghost"
            size="icon"
            disabled={zoom >= 3}
            className="text-white hover:bg-white/20 rounded-full"
          >
            <ZoomIn className="h-5 w-5" />
          </Button>
          <span className="text-white text-sm flex items-center px-3 bg-black/50 rounded-full">
            {Math.round(zoom * 100)}%
          </span>
        </div>

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <Button
              onClick={handlePrevious}
              variant="ghost"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 z-50 text-white hover:bg-white/20 rounded-full h-12 w-12"
            >
              <ChevronLeft className="h-8 w-8" />
            </Button>
            <Button
              onClick={handleNext}
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 z-50 text-white hover:bg-white/20 rounded-full h-12 w-12"
            >
              <ChevronRight className="h-8 w-8" />
            </Button>
          </>
        )}

        {/* Image Counter */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 bg-black/50 text-white px-4 py-2 rounded-full text-sm">
            {activeIndex + 1} / {images.length}
          </div>
        )}

        {/* Main Image */}
        <div className="flex items-center justify-center w-full h-full overflow-auto p-4">
          <img
            src={images[activeIndex].image_url}
            alt={`${altText} - Image ${activeIndex + 1}`}
            className="max-w-full max-h-full object-contain transition-transform duration-300 cursor-zoom-in"
            style={{ transform: `scale(${zoom})` }}
            onClick={(e) => {
              if (zoom === 1) {
                handleZoomIn();
              }
            }}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageLightbox;
