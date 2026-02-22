import { useRef, useEffect } from "react";
import { Undo2 } from "lucide-react";
import type { SeriesData } from "@/types";

interface StudioHeaderProps {
  series: SeriesData[];
  activeSeriesId: string | null;
  onSeriesClick: (id: string) => void;
  onClose: () => void;
}

export const StudioHeader = ({
  series,
  activeSeriesId,
  onSeriesClick,
  onClose,
}: StudioHeaderProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll active series into view
  useEffect(() => {
    if (scrollContainerRef.current && activeSeriesId) {
      const btn = scrollContainerRef.current.querySelector(
        `[data-series-id="${activeSeriesId}"]`
      );
      if (btn) btn.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  }, [activeSeriesId]);

  return (
    <header className="sticky top-0 left-0 right-0 z-50 bg-stone-100/95 backdrop-blur-sm border-b border-stone-200" style={{ touchAction: "manipulation" }}>
      <div className="flex items-center justify-between px-4 py-3 md:px-6 md:py-4">
        <div
          ref={scrollContainerRef}
          className="flex items-center gap-3 md:gap-5 overflow-x-auto scrollbar-hide"
          style={{ touchAction: "pan-x" }}
        >
          <span className="text-stone-700 font-bold text-sm md:text-base uppercase tracking-widest flex-shrink-0 mr-1 md:mr-3">
            STUDIO
          </span>

          {series.filter((s) => s.name.trim() !== "").map((s) => (
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

        <button
          onClick={onClose}
          className="flex-shrink-0 ml-4 text-stone-900 hover:text-stone-600 transition-colors text-lg md:text-xl font-light"
          aria-label="Close studio"
        >
          <Undo2 className="w-5 h-5 md:w-6 md:h-6" strokeWidth={1.5} />
        </button>
      </div>
    </header>
  );
};
