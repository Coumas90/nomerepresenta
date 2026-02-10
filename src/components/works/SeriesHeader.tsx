import { useRef, useEffect } from "react";
import { Undo2 } from "lucide-react";
import type { SeriesData } from "@/types";

interface SeriesHeaderProps {
  series: SeriesData[];
  activeSeriesId: string | null;
  onSeriesClick: (seriesId: string) => void;
  onClose?: () => void;
}

export const SeriesHeader = ({
  series,
  activeSeriesId,
  onSeriesClick,
  onClose,
}: SeriesHeaderProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // Find active series
  const activeSeries = series.find((s) => s.id === activeSeriesId);
  const otherSeries = series.filter((s) => s.id !== activeSeriesId);

  // Auto-scroll to show active series indicator when it changes
  useEffect(() => {
    if (scrollContainerRef.current && activeSeriesId) {
      const activeButton = scrollContainerRef.current.querySelector(
        `[data-series-id="${activeSeriesId}"]`
      );
      if (activeButton) {
        activeButton.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      }
    }
  }, [activeSeriesId]);

  return (
    <header className="sticky top-0 z-50 bg-stone-100/95 backdrop-blur-sm border-b border-stone-200">
      <div className="flex items-center justify-between px-4 py-3 md:px-6 md:py-4">
        {/* Series navigation: WORKS then all series in fixed order */}
        <div
          ref={scrollContainerRef}
          className="flex items-center gap-4 md:gap-6 overflow-x-auto scrollbar-hide"
        >
          <span className="text-stone-700 font-bold text-sm md:text-base uppercase tracking-widest flex-shrink-0">
            WORKS
          </span>

          {series.map((s) => (
            <button
              key={s.id}
              data-series-id={s.id}
              onClick={() => onSeriesClick(s.id)}
              className={`text-sm md:text-base uppercase tracking-wider transition-colors whitespace-nowrap flex-shrink-0 ${
                s.id === activeSeriesId
                  ? "text-stone-600 font-bold"
                  : "text-stone-400 hover:text-stone-600"
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>

        {/* Close button */}
        <button
          onClick={onClose ?? (() => window.history.back())}
          className="flex-shrink-0 ml-4 text-stone-900 hover:text-stone-600 transition-colors text-lg md:text-xl font-light"
          aria-label="Close works"
        >
          <Undo2 className="w-5 h-5 md:w-6 md:h-6" strokeWidth={1.5} />
        </button>
      </div>
    </header>
  );
};

export default SeriesHeader;

