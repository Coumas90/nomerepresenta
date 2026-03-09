import { useNavigate } from "react-router-dom";
import { useShows, useAllShowImages } from "@/hooks/useShows";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useEffect, useCallback, useMemo, useState, useRef } from "react";
import { ProgressiveImage } from "@/components/ProgressiveImage";
import { Undo2 } from "lucide-react";
import type { ShowData, ShowImage } from "@/types/show";
import { ShowScrollCard } from "@/components/shows/ShowScrollCard";

const Shows = () => {
  const navigate = useNavigate();
  const { data: shows, isLoading } = useShows(true);
  const { data: allShowImages } = useAllShowImages();
  const { trackPageView } = useAnalytics();

  useEffect(() => {
    trackPageView("/shows", "Shows");
  }, [trackPageView]);

  const handleClose = useCallback(() => navigate("/"), [navigate]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") navigate("/");
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate]);

  if (isLoading) {
    return <div className="min-h-screen bg-stone-100" />;
  }

  if (!shows?.length) {
    return (
      <div className="min-h-screen bg-stone-100 flex flex-col">
        <ShowsHeader onClose={handleClose} />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-stone-500">No shows available yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-100">
      <ShowsHeader onClose={handleClose} />
      <main className="pt-10 pb-16 md:pb-24">
        <div className="space-y-36 md:space-y-56">
          {shows.map((show) => (
            <ShowScrollCard
              key={show.id}
              show={show}
              images={allShowImages?.[show.id] || []}
              onNavigate={() => navigate(`/shows/${show.slug}`)}
            />
          ))}
        </div>
      </main>
    </div>
  );
};

function ShowsHeader({ onClose }: { onClose: () => void }) {
  return (
    <header className="sticky top-0 left-0 right-0 z-50 bg-stone-100/95 backdrop-blur-sm border-b border-stone-200" style={{ touchAction: "manipulation" }}>
      <div className="flex items-center justify-between px-4 py-3 md:px-6 md:py-4">
        <span className="text-stone-700 font-bold text-sm md:text-base uppercase tracking-widest">
          SHOWS
        </span>
        <button
          onClick={onClose}
          className="flex-shrink-0 ml-4 text-stone-900 hover:text-stone-600 transition-colors text-lg md:text-xl font-light"
          aria-label="Close shows"
        >
          <Undo2 className="w-5 h-5 md:w-6 md:h-6" strokeWidth={1.5} />
        </button>
      </div>
    </header>
  );
}

export default Shows;
