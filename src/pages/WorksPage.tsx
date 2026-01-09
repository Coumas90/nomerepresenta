import { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useArtworksBySeries } from "@/hooks/useArtworksBySeries";
import { SeriesHeader, SeriesSection } from "@/components/works";
import TriPeelOverlay from "@/components/TriPeelOverlay";

const WorksPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: seriesWithArtworks, isLoading } = useArtworksBySeries();

  // State para serie activa (detectada por scroll)
  const [activeSeriesId, setActiveSeriesId] = useState<string | null>(null);

  // State para TRI-PEEL overlay
  const [showOverlay, setShowOverlay] = useState(false);

  // Track if initial scroll from hash has been performed
  const hasScrolledToHash = useRef(false);

  // Handle initial hash scroll when data loads
  useEffect(() => {
    if (seriesWithArtworks?.length && !hasScrolledToHash.current) {
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
          hasScrolledToHash.current = true;
          return;
        }
      }
      
      // No hash or invalid hash - set first series as active
      setActiveSeriesId(seriesWithArtworks[0].id);
      hasScrolledToHash.current = true;
    }
  }, [seriesWithArtworks, location.hash]);

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

  // Handlers para TRI-PEEL overlay
  const handleOpenOverlay = useCallback(() => setShowOverlay(true), []);
  const handleCloseOverlay = useCallback(() => setShowOverlay(false), []);

  // Handler para cerrar página
  const handleClose = useCallback(() => navigate("/"), [navigate]);

  // Keyboard listeners: ESC y SPACE
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showOverlay) {
          handleCloseOverlay();
        } else {
          navigate("/");
        }
      }
      if (e.key === " " && !showOverlay) {
        e.preventDefault();
        handleOpenOverlay();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showOverlay, handleCloseOverlay, handleOpenOverlay, navigate]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-stone-400/40 border-t-stone-600 rounded-full animate-spin" />
          <span className="text-stone-500 text-xs tracking-widest uppercase">
            Loading
          </span>
        </div>
      </div>
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
        onTriPeelClick={handleOpenOverlay}
        onClose={handleClose}
      />

      {/* Contenido scrolleable */}
      <main className="pt-20 pb-16 md:pb-24">
        {seriesWithArtworks.map((series, index) => (
          <SeriesSection
            key={series.id}
            series={series}
            artworks={series.artworks}
            isFirst={index === 0}
            onIntersect={handleSeriesIntersect}
          />
        ))}
      </main>

      {/* TRI-PEEL Overlay */}
      <TriPeelOverlay isOpen={showOverlay} onClose={handleCloseOverlay} />
    </div>
  );
};

export default WorksPage;
