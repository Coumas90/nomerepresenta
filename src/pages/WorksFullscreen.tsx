import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useArtworks } from "@/hooks/useArtworks";
import { useArtworkImages } from "@/hooks/useArtworkImages";

const WorksFullscreen = () => {
  const navigate = useNavigate();
  const { data: artworks, isLoading } = useArtworks();
  
  const [currentArtworkIndex, setCurrentArtworkIndex] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showOverlay, setShowOverlay] = useState(false);

  const currentArtwork = artworks?.[currentArtworkIndex];
  
  // Fetch additional images for the current artwork
  const { data: artworkImages } = useArtworkImages(currentArtwork?.id);

  // Build all images array: main image first, then additional images
  const allImages = currentArtwork
    ? [
        { url: currentArtwork.image_url, isMain: true },
        { url: currentArtwork.image_detail_url, isMain: false },
        ...(artworkImages?.map(img => ({ url: img.image_url, isMain: img.is_main })) || [])
      ].filter((img, index, self) => 
        // Remove duplicates by URL
        index === self.findIndex(i => i.url === img.url)
      )
    : [];

  const currentImage = allImages[currentImageIndex]?.url || currentArtwork?.image_url;
  const hasNextImage = currentImageIndex < allImages.length - 1;
  const hasPrevImage = currentImageIndex > 0;
  const hasNextArtwork = currentArtworkIndex < (artworks?.length || 0) - 1;
  const hasPrevArtwork = currentArtworkIndex > 0;

  // Reset image index when artwork changes
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [currentArtworkIndex]);

  // Navigate to next/previous image (detail)
  const goToNextImage = useCallback(() => {
    if (hasNextImage) {
      setCurrentImageIndex(prev => prev + 1);
    }
  }, [hasNextImage]);

  const goToPrevImage = useCallback(() => {
    if (hasPrevImage) {
      setCurrentImageIndex(prev => prev - 1);
    }
  }, [hasPrevImage]);

  // Navigate to next/previous artwork
  const goToNextArtwork = useCallback(() => {
    if (hasNextArtwork) {
      setCurrentArtworkIndex(prev => prev + 1);
    }
  }, [hasNextArtwork]);

  const goToPrevArtwork = useCallback(() => {
    if (hasPrevArtwork) {
      setCurrentArtworkIndex(prev => prev - 1);
    }
  }, [hasPrevArtwork]);

  // Close and go back to landing
  const handleClose = useCallback(() => {
    navigate("/");
  }, [navigate]);

  // Open TRI-PEEL overlay
  const handleOpenOverlay = useCallback(() => {
    setShowOverlay(true);
  }, []);

  const handleCloseOverlay = useCallback(() => {
    setShowOverlay(false);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowRight":
          goToNextImage();
          break;
        case "ArrowLeft":
          goToPrevImage();
          break;
        case "ArrowDown":
          e.preventDefault();
          goToNextArtwork();
          break;
        case "ArrowUp":
          e.preventDefault();
          goToPrevArtwork();
          break;
        case "Escape":
          if (showOverlay) {
            handleCloseOverlay();
          } else {
            handleClose();
          }
          break;
        case " ":
          e.preventDefault();
          if (!showOverlay) {
            handleOpenOverlay();
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToNextImage, goToPrevImage, goToNextArtwork, goToPrevArtwork, handleClose, handleOpenOverlay, handleCloseOverlay, showOverlay]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!artworks?.length || !currentArtwork) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white/60">No artworks found</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      {/* Background artwork image */}
      <div
        className="absolute inset-0 transition-opacity duration-700 ease-out"
        style={{
          backgroundImage: `url(${currentImage})`,
          backgroundSize: "contain",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />

      {/* Subtle vignette overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-black/20 pointer-events-none" />

      {/* Minimalist Header */}
      <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-6 md:p-8">
        {/* TRI-PEEL - clickable to open overlay */}
        <button
          onClick={handleOpenOverlay}
          className="text-white text-sm md:text-base font-medium tracking-widest uppercase 
                     hover:opacity-70 transition-opacity duration-200 focus:outline-none"
        >
          TRI-PEEL
        </button>

        {/* Close button */}
        <button
          onClick={handleClose}
          className="text-white hover:opacity-70 transition-opacity duration-200 focus:outline-none"
          aria-label="Close and return to landing"
        >
          <X className="w-6 h-6 md:w-7 md:h-7" strokeWidth={1.5} />
        </button>
      </header>

      {/* Left arrow - Previous image/detail */}
      {hasPrevImage && (
        <button
          onClick={goToPrevImage}
          className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20
                     text-white/60 hover:text-white transition-all duration-200
                     focus:outline-none group"
          aria-label="Previous image"
        >
          <ChevronLeft 
            className="w-10 h-10 md:w-12 md:h-12 group-hover:scale-110 transition-transform" 
            strokeWidth={1} 
          />
        </button>
      )}

      {/* Right arrow - Next image/detail */}
      {hasNextImage && (
        <button
          onClick={goToNextImage}
          className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20
                     text-white/60 hover:text-white transition-all duration-200
                     focus:outline-none group"
          aria-label="Next image"
        >
          <ChevronRight 
            className="w-10 h-10 md:w-12 md:h-12 group-hover:scale-110 transition-transform" 
            strokeWidth={1} 
          />
        </button>
      )}

      {/* Vertical scroll indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2">
        {/* Artwork counter */}
        <span className="text-white/40 text-xs tracking-widest">
          {currentArtworkIndex + 1} / {artworks.length}
        </span>
        
        {/* Scroll hint */}
        {hasNextArtwork && (
          <button
            onClick={goToNextArtwork}
            className="text-white/40 hover:text-white/70 transition-opacity animate-pulse"
            aria-label="Next artwork"
          >
            <ChevronRight className="w-5 h-5 rotate-90" strokeWidth={1.5} />
          </button>
        )}
      </div>

      {/* Image indicators (dots) */}
      {allImages.length > 1 && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {allImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                index === currentImageIndex 
                  ? "bg-white scale-110" 
                  : "bg-white/30 hover:bg-white/50"
              }`}
              aria-label={`View image ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* TRI-PEEL Overlay */}
      {showOverlay && (
        <div 
          className="fixed inset-0 z-50 bg-stone-50 flex flex-col animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleCloseOverlay();
          }}
        >
          {/* Overlay Header */}
          <header className="flex items-center justify-between p-6 md:p-8">
            <span className="text-stone-900 text-sm md:text-base font-medium tracking-widest uppercase">
              TRI-PEEL
            </span>
            <button
              onClick={handleCloseOverlay}
              className="text-stone-900 hover:opacity-70 transition-opacity duration-200 focus:outline-none"
              aria-label="Close overlay"
            >
              <X className="w-6 h-6 md:w-7 md:h-7" strokeWidth={1.5} />
            </button>
          </header>

          {/* Overlay Content */}
          <div className="flex-1 flex items-center justify-center px-6 md:px-16 lg:px-32">
            <div className="max-w-2xl text-center">
              <h2 className="text-stone-900 text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-8">
                TRI-PEEL
              </h2>
              <p className="text-stone-600 text-base md:text-lg leading-relaxed">
                TRI-PEEL explores the intersection of organic forms and geometric structures, 
                revealing the hidden patterns that emerge when natural processes meet intentional design. 
                Each piece in this series investigates the tension between chaos and order, 
                inviting viewers to discover their own interpretations within the layered compositions.
              </p>
              <p className="text-stone-500 text-sm mt-8 tracking-wide">
                Mixed media on canvas • 2023-2024
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorksFullscreen;
