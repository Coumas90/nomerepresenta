import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useArtworksBySeries } from "@/hooks/useArtworksBySeries";
import { SeriesHeader, SeriesSection } from "@/components/works";
import TriPeelOverlay from "@/components/TriPeelOverlay";

const WorksPage = () => {
  const navigate = useNavigate();
  const { data: seriesWithArtworks, isLoading } = useArtworksBySeries();

  // State para serie activa (detectada por scroll)
  const [activeSeriesId, setActiveSeriesId] = useState<string | null>(null);

  // State para TRI-PEEL overlay
  const [showOverlay, setShowOverlay] = useState(false);

  // Inicializar serie activa al primer render
  useEffect(() => {
    if (seriesWithArtworks?.length && !activeSeriesId) {
      setActiveSeriesId(seriesWithArtworks[0].id);
    }
  }, [seriesWithArtworks, activeSeriesId]);

  // Callback para IntersectionObserver de cada SeriesSection
  const handleSeriesIntersect = useCallback(
    (seriesId: string, isIntersecting: boolean) => {
      if (isIntersecting) {
        setActiveSeriesId(seriesId);
      }
    },
    []
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
