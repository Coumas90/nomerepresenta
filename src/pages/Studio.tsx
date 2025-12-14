import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { useStudioImages } from "@/hooks/useStudioImages";
import { useImagePreloader } from "@/hooks/useImagePreloader";
import { ProgressiveImage } from "@/components/ProgressiveImage";
import { SwipeHint } from "@/components/SwipeHint";
import { SwipeGestureContainer } from "@/components/SwipeGestureContainer";
import { cn } from "@/lib/utils";

const Studio = () => {
  const navigate = useNavigate();
  const { data: images, isLoading } = useStudioImages();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const prevImageRef = useRef<string | null>(null);

  const currentImage = images?.[currentIndex];
  const hasNext = currentIndex < (images?.length || 0) - 1;
  const hasPrev = currentIndex > 0;

  // Build list of all image URLs for preloading
  const imageUrls = useMemo(() => 
    images?.map(img => img.image_url) || [],
    [images]
  );

  // Preload adjacent images (2 ahead, 1 behind)
  useImagePreloader(imageUrls, currentIndex, {
    preloadAhead: 2,
    preloadBehind: 1,
  });

  // Page load animation
  useEffect(() => {
    const timer = setTimeout(() => setIsPageLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Handle smooth transitions
  useEffect(() => {
    if (currentImage?.image_url && currentImage.image_url !== prevImageRef.current) {
      setIsTransitioning(true);
      const timer = setTimeout(() => {
        setIsTransitioning(false);
        prevImageRef.current = currentImage.image_url;
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [currentImage?.image_url]);

  const goToNext = useCallback(() => {
    if (hasNext && !isScrolling) {
      setIsScrolling(true);
      setCurrentIndex(prev => prev + 1);
      setTimeout(() => setIsScrolling(false), 600);
    }
  }, [hasNext, isScrolling]);

  const goToPrev = useCallback(() => {
    if (hasPrev && !isScrolling) {
      setIsScrolling(true);
      setCurrentIndex(prev => prev - 1);
      setTimeout(() => setIsScrolling(false), 600);
    }
  }, [hasPrev, isScrolling]);

  const handleClose = useCallback(() => {
    navigate("/");
  }, [navigate]);

  // Wheel navigation (desktop)
  useEffect(() => {
    let lastWheelTime = 0;
    const wheelCooldown = 600;

    const handleWheel = (e: WheelEvent) => {
      const now = Date.now();
      if (now - lastWheelTime < wheelCooldown) return;
      
      if (Math.abs(e.deltaY) > 30) {
        lastWheelTime = now;
        if (e.deltaY > 0) {
          goToNext();
        } else {
          goToPrev();
        }
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: true });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [goToNext, goToPrev]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isScrolling) return;
      
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          goToNext();
          break;
        case "ArrowUp":
          e.preventDefault();
          goToPrev();
          break;
        case "ArrowLeft":
        case "Escape":
          handleClose();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToNext, goToPrev, handleClose, isScrolling]);

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

  if (!images?.length) {
    return (
      <div className={`min-h-screen bg-stone-100 flex flex-col transition-opacity duration-500 ${isPageLoaded ? 'opacity-100' : 'opacity-0'}`}>
        {/* Header */}
        <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-6 md:p-8">
          <span className="text-stone-900 text-sm md:text-base font-medium tracking-widest uppercase">
            STUDIO
          </span>
          <button
            onClick={handleClose}
            className="text-stone-900 hover:opacity-70 transition-opacity duration-200 focus:outline-none"
            aria-label="Close and return to landing"
          >
            <X className="w-6 h-6 md:w-7 md:h-7" strokeWidth={1.5} />
          </button>
        </header>
        
        <div className="flex-1 flex items-center justify-center">
          <p className="text-stone-500 text-center">
            No studio images available yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative min-h-screen bg-stone-100 overflow-hidden transition-opacity duration-500 ${isPageLoaded ? 'opacity-100' : 'opacity-0'}`}>
      {/* SwipeGestureContainer for rubber-band effect */}
      <SwipeGestureContainer
        onSwipeUp={goToNext}
        onSwipeDown={goToPrev}
        onSwipeLeft={handleClose}
        onSwipeRight={handleClose}
        enabled
        direction="both"
        isAtStart={!hasPrev}
        isAtEnd={!hasNext}
        showEdgeIndicators
        className="absolute inset-0"
      >
        {/* Background image with AVIF/WebP and responsive srcset */}
        <div
          className={`absolute inset-0 transition-all duration-500 ease-out will-change-transform ${
            isTransitioning ? "opacity-0 scale-[1.02]" : "opacity-100 scale-100"
          }`}
        >
          {currentImage?.image_url && (
            <ProgressiveImage
              src={currentImage.image_url}
              alt={currentImage.title || "Studio image"}
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
      </SwipeGestureContainer>

      {/* Subtle vignette overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-stone-100/40 via-transparent to-stone-100/30 pointer-events-none" />

      {/* Header */}
      <header className={`absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-4 md:p-8 transition-all duration-500 delay-100 ${isPageLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
        <span className="text-stone-900 text-xs md:text-base font-bold tracking-widest uppercase">
          STUDIO
        </span>

        <button
          onClick={handleClose}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center
                     text-stone-900 hover:opacity-70 transition-all duration-200 focus:outline-none
                     -mr-1 md:-mr-3"
          aria-label="Close and return to landing"
        >
          <X className="w-5 h-5 md:w-7 md:h-7" strokeWidth={1.5} />
        </button>
      </header>

      {/* Image title/description overlay */}
      {(currentImage?.title || currentImage?.description) && (
        <div className={`absolute bottom-24 left-6 md:left-8 right-6 md:right-8 z-20 transition-all duration-500 ${isTransitioning ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}>
          {currentImage.title && (
            <h2 className="text-stone-900 text-lg md:text-xl font-medium mb-2">
              {currentImage.title}
            </h2>
          )}
          {currentImage.description && (
            <p className="text-stone-600 text-sm md:text-base max-w-xl">
              {currentImage.description}
            </p>
          )}
        </div>
      )}

      {/* Vertical navigation - simple text arrows */}
      <div className={`absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1 transition-all duration-500 delay-200 ${isPageLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        {/* Up arrow */}
        <button
          onClick={goToPrev}
          disabled={!hasPrev}
          className={cn(
            "min-w-[44px] min-h-[44px] flex items-center justify-center",
            "text-xl font-light select-none transition-all duration-200 focus:outline-none",
            hasPrev ? "text-stone-500 hover:text-stone-800" : "text-stone-300 cursor-default"
          )}
          aria-label="Previous image"
        >
          ^
        </button>
        
        {/* Down arrow */}
        <button
          onClick={goToNext}
          disabled={!hasNext}
          className={cn(
            "min-w-[44px] min-h-[44px] flex items-center justify-center",
            "text-xl font-light select-none transition-all duration-200 focus:outline-none",
            hasNext ? "text-stone-500 hover:text-stone-800" : "text-stone-300 cursor-default"
          )}
          aria-label="Next image"
        >
          v
        </button>
      </div>

      {/* Mobile swipe hint */}
      <SwipeHint 
        direction="vertical" 
        pageContext="studio"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      />
    </div>
  );
};

export default Studio;
