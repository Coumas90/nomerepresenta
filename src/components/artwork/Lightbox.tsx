import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

interface Artwork {
  id: number;
  title: string;
  category: string;
  image: string;
  imageDetail: string;
}

interface LightboxProps {
  artworks: Artwork[];
  selectedIndex: number | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export const Lightbox = ({ artworks, selectedIndex, onClose, onNavigate }: LightboxProps) => {
  const isOpen = selectedIndex !== null;
  const currentArtwork = selectedIndex !== null ? artworks[selectedIndex] : null;

  const handlePrevious = () => {
    if (selectedIndex !== null && selectedIndex > 0) {
      onNavigate(selectedIndex - 1);
    }
  };

  const handleNext = () => {
    if (selectedIndex !== null && selectedIndex < artworks.length - 1) {
      onNavigate(selectedIndex + 1);
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
  }, [isOpen, selectedIndex]);

  if (!currentArtwork) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl w-full h-[90vh] p-0 bg-background/95 backdrop-blur-sm">
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-50 text-foreground hover:bg-background/80"
            onClick={onClose}
          >
            <X className="h-6 w-6" />
          </Button>

          {/* Previous button */}
          {selectedIndex > 0 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 z-50 text-foreground hover:bg-background/80"
              onClick={handlePrevious}
            >
              <ChevronLeft className="h-8 w-8" />
            </Button>
          )}

          {/* Next button */}
          {selectedIndex < artworks.length - 1 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 z-50 text-foreground hover:bg-background/80"
              onClick={handleNext}
            >
              <ChevronRight className="h-8 w-8" />
            </Button>
          )}

          {/* Image */}
          <div className="flex flex-col items-center justify-center w-full h-full p-12">
            <img
              src={currentArtwork.imageDetail}
              alt={currentArtwork.title}
              className="max-w-full max-h-[calc(100%-80px)] object-contain"
            />
            
            {/* Title and category */}
            <div className="mt-6 text-center">
              <h2 className="text-2xl font-bold tracking-tight">{currentArtwork.title}</h2>
              <p className="text-sm text-muted-foreground mt-1">{currentArtwork.category}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
