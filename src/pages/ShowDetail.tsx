import { useParams, useNavigate } from "react-router-dom";
import { useShow, useShowImages } from "@/hooks/useShows";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useEffect, useCallback } from "react";
import { Undo2 } from "lucide-react";
import { ShowScrollCard } from "@/components/shows/ShowScrollCard";

const ShowDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data: show, isLoading: showLoading } = useShow(slug);
  const { data: images, isLoading: imagesLoading } = useShowImages(show?.id);
  const { trackPageView } = useAnalytics();

  useEffect(() => {
    if (show) trackPageView(`/shows/${slug}`, show.title);
  }, [show, slug, trackPageView]);

  const handleClose = useCallback(() => navigate("/shows"), [navigate]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") navigate("/shows");
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate]);

  if (showLoading || imagesLoading) {
    return <div className="min-h-screen bg-stone-100" />;
  }

  if (!show) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center">
        <p className="text-stone-500">Show not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-100">
      <header className="sticky top-0 left-0 right-0 z-50 bg-stone-100/95 backdrop-blur-sm border-b border-stone-200" style={{ touchAction: "manipulation" }}>
        <div className="flex items-center justify-between px-4 py-3 md:px-6 md:py-4">
          <span className="text-stone-700 font-bold text-sm md:text-base uppercase tracking-widest">
            {show.title}
          </span>
          <button
            onClick={handleClose}
            className="flex-shrink-0 ml-4 text-stone-900 hover:text-stone-600 transition-colors"
            aria-label="Back to shows"
          >
            <Undo2 className="w-5 h-5 md:w-6 md:h-6" strokeWidth={1.5} />
          </button>
        </div>
      </header>

      <main className="pt-10 pb-16 md:pb-24">
        <ShowScrollCard show={show} images={images || []} isDetailPage />
      </main>
    </div>
  );
};

export default ShowDetail;
