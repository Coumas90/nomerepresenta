import { useState, useRef, useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogClose,
} from "@/components/ui/dialog";

interface ZoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  initialIndex: number;
  alt: string;
}

export const ZoomModal = ({
  isOpen,
  onClose,
  images,
  initialIndex,
  alt,
}: ZoomModalProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imageContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrentIndex(initialIndex);
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, [initialIndex, isOpen]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY * -0.001;
    const newScale = Math.min(Math.max(1, scale + delta), 3);
    
    if (newScale === 1) {
      setPosition({ x: 0, y: 0 });
    }
    
    setScale(newScale);
  };

  const handleDoubleClick = () => {
    if (scale === 1) {
      setScale(2);
    } else {
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      if (e.key === "ArrowLeft") {
        handlePrevious();
      } else if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentIndex]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[100vw] h-screen p-0 bg-black/95 border-0">
        <div
          ref={imageContainerRef}
          className="relative w-full h-full flex items-center justify-center overflow-hidden"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          onDoubleClick={handleDoubleClick}
        >
          <img
            src={images[currentIndex]}
            alt={`${alt} - Image ${currentIndex + 1}`}
            className="max-w-full max-h-full object-contain select-none transition-transform duration-200"
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
              cursor: scale > 1 ? (isDragging ? "grabbing" : "grab") : "zoom-in",
            }}
            draggable={false}
          />

          {/* Close button */}
          <DialogClose className="absolute top-4 right-4 p-2 bg-background/80 backdrop-blur-sm rounded-full hover:bg-background transition-colors z-50">
            <X className="w-6 h-6" />
          </DialogClose>

          {/* Navigation arrows - only show if multiple images */}
          {images.length > 1 && (
            <>
              <button
                onClick={handlePrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-background/80 backdrop-blur-sm rounded-full hover:bg-background transition-colors z-50"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-background/80 backdrop-blur-sm rounded-full hover:bg-background transition-colors z-50"
                aria-label="Next image"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Image counter */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/80 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium z-50">
              {currentIndex + 1} / {images.length}
            </div>
          )}

          {/* Instructions */}
          <div className="absolute bottom-4 right-4 bg-background/80 backdrop-blur-sm px-4 py-2 rounded-full text-xs font-medium z-50">
            {scale === 1 ? "Double-click to zoom" : "Drag to pan"}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
