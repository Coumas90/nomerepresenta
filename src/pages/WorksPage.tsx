import { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useArtworksBySeries } from "@/hooks/useArtworksBySeries";
import { useAllArtworkImages } from "@/hooks/useAllArtworkImages";
import { useScrollRestoration } from "@/hooks/useScrollRestoration";
import { useAnalytics } from "@/hooks/useAnalytics";
import { SeriesHeader, SeriesSection } from "@/components/works";


const WorksPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: seriesWithArtworks, isLoading } = useArtworksBySeries();
  const { data: allArtworkImages } = useAllArtworkImages();
  const { trackUserEvent } = useAnalytics();

  // State para serie activa (detectada por scroll)
  const [activeSeriesId, setActiveSeriesId] = useState<string | null>(null);
  const bottomSentinelRef = useRef<HTMLDivElement>(null);
  const hasTrackedScrollComplete = useRef(false);


  // Track if initial scroll handling has been performed
  const hasInitialized = useRef(false);

  // Scroll restoration hook
  const { restoreScrollPosition, clearScrollPosition } = useScrollRestoration(activeSeriesId);

  // Handle initial scroll: restore saved position OR scroll to hash
  useEffect(() => {
    if (seriesWithArtworks?.length && !hasInitialized.current) {
      // First try to restore saved scroll position (coming back from detail)
      const restored = restoreScrollPosition();
      
      if (restored) {
        // If restored, just set first series as active (will update via intersection)
        setActiveSeriesId(seriesWithArtworks[0].id);
        hasInitialized.current = true;
        return;
      }

      // Otherwise, handle hash-based navigation
      const hash = location.hash.replace("#", "");
      
      if (hash) {
        // Find series by id or by slugified name
        const targetSeries = seriesWithArtworks.find(
          (s) => s.id === hash || s.name.toLowerCase().replace(/\s+/g, "-") === hash.toLowerCase()
        );
        
        if (targetSeries) {
          // Small delay to ensure DOM is ready
          setTimeout(() => {
            const section = document.getElementById(`series-${targetSeries.id}`);
            if (section) {
              section.scrollIntoView({ behavior: "smooth", block: "start" });
              setActiveSeriesId(targetSeries.id);
            }
          }, 100);
          hasInitialized.current = true;
          return;
        }
      }
      
      // No hash or invalid hash - set first series as active
      setActiveSeriesId(seriesWithArtworks[0].id);
      hasInitialized.current = true;
    }
  }, [seriesWithArtworks, location.hash, restoreScrollPosition]);

  // Callback para IntersectionObserver de cada SeriesSection
  // Updates active series and URL hash
  const handleSeriesIntersect = useCallback(
    (seriesId: string, isIntersecting: boolean) => {
      if (isIntersecting) {
        setActiveSeriesId(seriesId);
        
        // Update URL hash without triggering scroll
        const series = seriesWithArtworks?.find((s) => s.id === seriesId);
        if (series) {
          const slug = series.name.toLowerCase().replace(/\s+/g, "-");
          window.history.replaceState(null, "", `/works#${slug}`);
        }
      }
    },
    [seriesWithArtworks]
  );

  // Scroll suave al clickear serie en header
  const handleSeriesClick = useCallback((seriesId: string) => {
    const section = document.getElementById(`series-${seriesId}`);
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);


  // Handler para cerrar página - clear scroll position when intentionally leaving
  const handleClose = useCallback(() => {
    clearScrollPosition();
    navigate("/");
  }, [navigate, clearScrollPosition]);

  // Keyboard listener: ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        navigate("/");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate]);

  // Track works scroll completion
  useEffect(() => {
    const sentinel = bottomSentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasTrackedScrollComplete.current) {
          hasTrackedScrollComplete.current = true;
          trackUserEvent('works_scroll_complete');
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [trackUserEvent]);

  // Loading state - only show on true first load (no cached data at all)
  // React Query's isLoading is false when cache has data, so this only fires on cold start
  if (isLoading && !seriesWithArtworks?.length) {
    return (
      <div className="min-h-screen bg-stone-100" />
    );
  }

  // Empty state
  if (!seriesWithArtworks?.length) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center">
        <p className="text-stone-500">No artworks found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-100">
      {/* Header sticky con navegación de series */}
      <SeriesHeader
        series={seriesWithArtworks}
        activeSeriesId={activeSeriesId}
        onSeriesClick={handleSeriesClick}
        onClose={handleClose}
      />

      {/* Contenido scrolleable */}
      <main className="pt-10 pb-16 md:pb-24">
        {seriesWithArtworks.map((series, index) => (
          <SeriesSection
            key={series.id}
            series={series}
            artworks={series.artworks}
            isFirst={index === 0}
            onIntersect={handleSeriesIntersect}
            allArtworkImages={allArtworkImages}
            onGalleryNavigate={(artworkId) => {
              trackUserEvent('gallery_navigate', { artworkId });
            }}
          />
        ))}
        {/* Scroll completion sentinel */}
        <div ref={bottomSentinelRef} className="h-1" />
      </main>

    </div>
  );
};

export default WorksPage;
