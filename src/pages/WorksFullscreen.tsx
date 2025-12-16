import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { useArtworks } from "@/hooks/useArtworks";
import { useArtworkImages } from "@/hooks/useArtworkImages";
import { useImagePreloader } from "@/hooks/useImagePreloader";
import { precacheImagesProgressive, getAdjacentArtworkUrls } from "@/lib/cacheUtils";
import TriPeelOverlay from "@/components/TriPeelOverlay";
import { ProgressiveImage } from "@/components/ProgressiveImage";
import { SwipeHint } from "@/components/SwipeHint";
import { SwipeGestureContainer } from "@/components/SwipeGestureContainer";
import { cn } from "@/lib/utils";

const WorksFullscreen = () => {
  const navigate = useNavigate();
  const { data: artworks, isLoading } = useArtworks();
  
  const [currentArtworkIndex, setCurrentArtworkIndex] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showOverlay, setShowOverlay] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
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

  // Handle smooth transitions between images with elegant timing
  useEffect(() => {
    if (currentImage && currentImage !== prevImageRef.current) {
      setIsTransitioning(true);
      // Longer fade-out for elegance
      const timer = setTimeout(() => {
        setIsTransitioning(false);
        prevImageRef.current = currentImage;
      }, 150);
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
    if (hasNextArtwork && !isScrolling) {
      setIsScrolling(true);
      setCurrentArtworkIndex(prev => prev + 1);
      setTimeout(() => setIsScrolling(false), 600);
    }
  }, [hasNextArtwork, isScrolling]);

  const goToPrevArtwork = useCallback(() => {
    if (hasPrevArtwork && !isScrolling) {
      setIsScrolling(true);
      setCurrentArtworkIndex(prev => prev - 1);
      setTimeout(() => setIsScrolling(false), 600);
    }
  }, [hasPrevArtwork, isScrolling]);

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

  // Wheel navigation (desktop)
  useEffect(() => {
    if (showOverlay) return;

    let lastWheelTime = 0;
    const wheelCooldown = 600;

    const handleWheel = (e: WheelEvent) => {
      const now = Date.now();
      if (now - lastWheelTime < wheelCooldown) return;
      
      if (Math.abs(e.deltaY) > 30) {
        lastWheelTime = now;
        if (e.deltaY > 0) {
          goToNextArtwork();
        } else {
          goToPrevArtwork();
        }
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: true });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [showOverlay, goToNextArtwork, goToPrevArtwork]);

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
  }, [goToNextImage, goToPrevImage, goToNextArtwork, goToPrevArtwork, handleClose, handleOpenOverlay, handleCloseOverlay, showOverlay, isScrolling]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center">
        <div className="absolute inset-0 skeleton-shimmer bg-stone-200" />
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-stone-400/40 border-t-stone-600 rounded-full animate-spin" />
          <span className="text-stone-500 text-xs tracking-widest uppercase">Loading</span>
        </div>
      </div>
    );
  }

  if (!artworks?.length || !currentArtwork) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center">
        <p className="text-stone-500">No artworks found</p>
      </div>
    );
  }

  // Determine if viewing a detail (not the main image)
  const isViewingDetail = currentImageIndex > 0;

  return (
    <div className="relative min-h-screen bg-stone-100 overflow-hidden">
      {/* SwipeGestureContainer for rubber-band effect */}
      <SwipeGestureContainer
        onSwipeUp={goToNextArtwork}
        onSwipeDown={goToPrevArtwork}
        onSwipeLeft={goToNextImage}
        onSwipeRight={goToPrevImage}
        enabled={!showOverlay}
        direction={allImages.length > 1 ? "both" : "vertical"}
        isAtStart={!hasPrevArtwork}
        isAtEnd={!hasNextArtwork}
        isAtHorizontalStart={!hasPrevImage}
        isAtHorizontalEnd={!hasNextImage}
        showEdgeIndicators
        className="absolute inset-0 flex items-center justify-center px-8 py-16 md:px-16 lg:px-24"
      >
        {/* Centered gallery layout - symmetric padding */}
        <div className="flex flex-col items-center justify-center w-full">
          {/* Artwork image as framed gallery piece with elegant transitions */}
          <div
            className={cn(
              "relative mx-auto transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)]",
              isTransitioning 
                ? "opacity-0 scale-[0.97] blur-[2px]" 
                : "opacity-100 scale-100 blur-0"
            )}
          >
            {/* Gallery frame shadow effect - subtle and refined */}
            <div className="absolute inset-0 shadow-2xl shadow-stone-900/15 rounded-sm transition-shadow duration-700" />
            
            {currentImage && (
              <ProgressiveImage
                src={currentImage}
                alt={currentArtwork?.title || "Artwork"}
                className="relative z-10 mx-auto w-auto h-auto max-w-[90vw] md:max-w-[70vw] lg:max-w-[60vw] max-h-[55vh] md:max-h-[60vh] lg:max-h-[65vh] object-contain shadow-xl"
                eager
                skipInternalFade
                blurUp
                modernFormats
                responsivePreset="full"
                sizes="(max-width: 768px) 90vw, (max-width: 1024px) 70vw, 60vw"
              />
            )}
          </div>

          {/* Artwork metadata - left-aligned below image like gallery references */}
          <div 
            className={cn(
              "mt-6 md:mt-8 space-y-0.5 text-left w-full max-w-[90vw] md:max-w-[70vw] lg:max-w-[60vw] mx-auto transition-all duration-500 delay-100",
              isTransitioning ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
            )}
          >
            <h2 className="text-stone-900 text-sm md:text-base font-semibold uppercase tracking-wider">
              {currentArtwork.title}
            </h2>
            <p className="text-stone-600 text-xs md:text-sm">
              {currentArtwork.year}
            </p>
            <p className="text-stone-500 text-xs md:text-sm uppercase tracking-wide">
              {currentArtwork.technique}
              {currentArtwork.materials && ` · ${currentArtwork.materials}`}
            </p>
            <p className="text-stone-400 text-xs md:text-sm">
              {currentArtwork.dimensions}
            </p>
            {isViewingDetail && (
              <p className="text-stone-900 text-xs font-medium uppercase tracking-wide pt-1">(DETAIL)</p>
            )}
          </div>
        </div>
      </SwipeGestureContainer>

      {/* Minimalist Header with subtle entrance animation */}
      <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4 md:p-8 animate-fade-in">
        {/* TRI-PEEL - horizontal on all devices, smaller on mobile */}
        <button
          onClick={handleOpenOverlay}
          className="text-stone-900 text-[10px] md:text-base font-bold tracking-widest uppercase 
                     hover:opacity-60 transition-all duration-300 focus:outline-none"
        >
          TRI-PEEL
        </button>

        {/* Close button - enhanced touch target */}
        <button
          onClick={handleClose}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center
                     text-stone-900 hover:opacity-60 hover:rotate-90 transition-all duration-300 focus:outline-none
                     -mr-1 md:-mr-3"
          aria-label="Close and return to landing"
        >
          <X className="w-5 h-5 md:w-7 md:h-7" strokeWidth={1.5} />
        </button>
      </header>

      {/* Left arrow - Previous image/detail - hidden on mobile, subtle styling */}
      {allImages.length > 1 && (
        <button
          onClick={goToPrevImage}
          disabled={!hasPrevImage}
          className={cn(
            "hidden md:flex absolute left-6 lg:left-10 top-1/2 -translate-y-1/2 z-20",
            "min-w-[44px] min-h-[44px] items-center justify-center",
            "text-2xl font-extralight select-none",
            "transition-all duration-300 ease-out focus:outline-none",
            hasPrevImage 
              ? "text-stone-400 hover:text-stone-700 hover:-translate-x-0.5" 
              : "text-stone-300/30 cursor-default"
          )}
          aria-label="Previous image"
        >
          &lt;
        </button>
      )}

      {/* Right arrow - Next image/detail - hidden on mobile, subtle styling */}
      {allImages.length > 1 && (
        <button
          onClick={goToNextImage}
          disabled={!hasNextImage}
          className={cn(
            "hidden md:flex absolute right-6 lg:right-10 top-1/2 -translate-y-1/2 z-20",
            "min-w-[44px] min-h-[44px] items-center justify-center",
            "text-2xl font-extralight select-none",
            "transition-all duration-300 ease-out focus:outline-none",
            hasNextImage 
              ? "text-stone-400 hover:text-stone-700 hover:translate-x-0.5" 
              : "text-stone-300/30 cursor-default"
          )}
          aria-label="Next image"
        >
          &gt;
        </button>
      )}

      {/* Vertical navigation removed - scroll/swipe only like gallery references */}

      {/* Mobile swipe hints */}
      <SwipeHint 
        direction={allImages.length > 1 ? "both" : "vertical"} 
        show={!showOverlay}
        pageContext="works"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      />

      {/* TRI-PEEL Overlay */}
      <TriPeelOverlay 
        isOpen={showOverlay} 
        onClose={handleCloseOverlay} 
      />
    </div>
  );
};

export default WorksFullscreen;
