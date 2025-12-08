import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown, X } from "lucide-react";
import { useArtworks } from "@/hooks/useArtworks";
import { useArtworkImages } from "@/hooks/useArtworkImages";
import { useImagePreloader } from "@/hooks/useImagePreloader";
import { useSwipeNavigation } from "@/hooks/useSwipeNavigation";
import { precacheImagesProgressive, getAdjacentArtworkUrls } from "@/lib/cacheUtils";
import TriPeelOverlay from "@/components/TriPeelOverlay";
import { ProgressiveImage } from "@/components/ProgressiveImage";

const WorksFullscreen = () => {
  const navigate = useNavigate();
  const { data: artworks, isLoading } = useArtworks();
  
  const [currentArtworkIndex, setCurrentArtworkIndex] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showOverlay, setShowOverlay] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const prevImageRef = useRef<string | null>(null);

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

  // Build list of all artwork main images for preloading
  const artworkMainImages = useMemo(() => 
    artworks?.map(artwork => artwork.image_url) || [],
    [artworks]
  );

  // Preload adjacent artworks (2 ahead, 1 behind)
  useImagePreloader(artworkMainImages, currentArtworkIndex, {
    preloadAhead: 2,
    preloadBehind: 1,
  });

  // Preload current artwork's detail images
  const currentArtworkDetailImages = useMemo(() => 
    allImages.map(img => img.url),
    [allImages]
  );
  
  useImagePreloader(currentArtworkDetailImages, currentImageIndex, {
    preloadAhead: 1,
    preloadBehind: 1,
  });

  // Progressive caching: only cache adjacent artworks (2 ahead, 1 behind)
  useEffect(() => {
    if (artworks?.length) {
      const adjacentUrls = getAdjacentArtworkUrls(artworks, currentArtworkIndex, {
        ahead: 2,
        behind: 1,
      });
      
      precacheImagesProgressive(adjacentUrls);
    }
  }, [artworks, currentArtworkIndex]);

  // Reset image index when artwork changes
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [currentArtworkIndex]);

  // Handle smooth transitions between images
  useEffect(() => {
    if (currentImage && currentImage !== prevImageRef.current) {
      setIsTransitioning(true);
      const timer = setTimeout(() => {
        setIsTransitioning(false);
        prevImageRef.current = currentImage;
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [currentImage]);

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

  // Swipe and wheel navigation using centralized hook
  const { isScrolling, setIsScrolling } = useSwipeNavigation({
    onSwipeUp: goToNextArtwork,
    onSwipeDown: goToPrevArtwork,
    onSwipeLeft: goToNextImage,
    onSwipeRight: goToPrevImage,
    onWheelUp: goToPrevArtwork,
    onWheelDown: goToNextArtwork,
    enabled: !showOverlay,
  });

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isScrolling) return;
      
      switch (e.key) {
        case "ArrowRight":
          goToNextImage();
          break;
        case "ArrowLeft":
          goToPrevImage();
          break;
        case "ArrowDown":
          e.preventDefault();
          setIsScrolling(true);
          goToNextArtwork();
          setTimeout(() => setIsScrolling(false), 600);
          break;
        case "ArrowUp":
          e.preventDefault();
          setIsScrolling(true);
          goToPrevArtwork();
          setTimeout(() => setIsScrolling(false), 600);
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
  }, [goToNextImage, goToPrevImage, goToNextArtwork, goToPrevArtwork, handleClose, handleOpenOverlay, handleCloseOverlay, showOverlay, isScrolling]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="absolute inset-0 skeleton-shimmer bg-stone-900" />
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          <span className="text-white/40 text-xs tracking-widest uppercase">Loading</span>
        </div>
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

  // Determine if viewing a detail (not the main image)
  const isViewingDetail = currentImageIndex > 0;

  return (
    <div className="relative min-h-screen bg-black overflow-hidden">
      {/* Background artwork image with AVIF/WebP and responsive srcset */}
      <div
        className={`absolute inset-0 transition-all duration-500 ease-out ${
          isTransitioning ? "opacity-0 scale-[1.02]" : "opacity-100 scale-100"
        }`}
      >
        {currentImage && (
          <ProgressiveImage
            src={currentImage}
            alt={currentArtwork?.title || "Artwork"}
            className="w-full h-full"
            eager
            skipInternalFade
            blurUp
            modernFormats
            responsivePreset="full"
            sizes="100vw"
          />
        )}
      </div>

      {/* Subtle vignette overlay - darker when viewing detail */}
      <div 
        className={`absolute inset-0 pointer-events-none transition-opacity duration-500 ${
          isViewingDetail 
            ? "bg-gradient-to-t from-black/40 via-transparent to-black/30" 
            : "bg-gradient-to-t from-black/20 via-transparent to-black/20"
        }`} 
      />
      
      {/* Detail indicator */}
      {isViewingDetail && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20">
          <span className="text-white/50 text-xs tracking-widest uppercase animate-fade-in">
            Detail {currentImageIndex} / {allImages.length - 1}
          </span>
        </div>
      )}

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

      {/* Vertical navigation indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-3">
        {/* Up arrow */}
        {hasPrevArtwork && (
          <button
            onClick={() => {
              if (!isScrolling) {
                setIsScrolling(true);
                goToPrevArtwork();
                setTimeout(() => setIsScrolling(false), 600);
              }
            }}
            className="text-white/40 hover:text-white/70 transition-opacity"
            aria-label="Previous artwork"
          >
            <ChevronUp className="w-5 h-5" strokeWidth={1.5} />
          </button>
        )}
        
        {/* Artwork counter */}
        <span className="text-white/40 text-xs tracking-widest font-light">
          {currentArtworkIndex + 1} / {artworks.length}
        </span>
        
        {/* Down arrow / scroll hint */}
        {hasNextArtwork && (
          <button
            onClick={() => {
              if (!isScrolling) {
                setIsScrolling(true);
                goToNextArtwork();
                setTimeout(() => setIsScrolling(false), 600);
              }
            }}
            className="text-white/40 hover:text-white/70 transition-opacity animate-pulse"
            aria-label="Next artwork"
          >
            <ChevronDown className="w-5 h-5" strokeWidth={1.5} />
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
      <TriPeelOverlay 
        isOpen={showOverlay} 
        onClose={handleCloseOverlay} 
      />
    </div>
  );
};

export default WorksFullscreen;
