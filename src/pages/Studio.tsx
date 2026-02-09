import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { useStudioImages, type StudioImageWithSeries } from "@/hooks/useStudioImages";
import { ProgressiveImage } from "@/components/ProgressiveImage";
import { cn } from "@/lib/utils";

/** Map series display_order to Roman numeral labels */
const ROMAN: Record<number, string> = { 0: "I", 1: "II", 2: "III", 3: "IV", 4: "V", 5: "VI" };

const Studio = () => {
  const navigate = useNavigate();
  const { data: images, isLoading } = useStudioImages();
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const [activeSeriesIdx, setActiveSeriesIdx] = useState(0);
  const sectionRefs = useRef<Map<number, HTMLElement>>(new Map());

  useEffect(() => {
    const t = setTimeout(() => setIsPageLoaded(true), 100);
    return () => clearTimeout(t);
  }, []);

  // Group images by series (sorted by series display_order, ungrouped last)
  const groups = useMemo(() => {
    if (!images?.length) return [];
    const map = new Map<string, { label: string; order: number; images: StudioImageWithSeries[] }>();
    const ungrouped: StudioImageWithSeries[] = [];

    for (const img of images) {
      if (!img.series_id) {
        ungrouped.push(img);
        continue;
      }
      const key = img.series_id;
      if (!map.has(key)) {
        map.set(key, {
          label: img.series_name || "Untitled",
          order: img.series_display_order ?? 999,
          images: [],
        });
      }
      map.get(key)!.images.push(img);
    }

    const sorted = [...map.values()].sort((a, b) => a.order - b.order);
    // Assign roman numerals based on sorted position
    const result = sorted.map((g, i) => ({
      ...g,
      roman: ROMAN[i] || `${i + 1}`,
    }));

    if (ungrouped.length) {
      result.push({ label: "Other", order: 999, images: ungrouped, roman: "" });
    }

    return result;
  }, [images]);

  // Intersection observer to detect current series while scrolling
  const setRef = useCallback((idx: number, el: HTMLElement | null) => {
    if (el) sectionRefs.current.set(idx, el);
    else sectionRefs.current.delete(idx);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.getAttribute("data-series-idx"));
            if (!isNaN(idx)) setActiveSeriesIdx(idx);
          }
        }
      },
      { threshold: 0.3 }
    );

    sectionRefs.current.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [groups]);

  const handleClose = useCallback(() => navigate("/"), [navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-stone-400/40 border-t-stone-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!groups.length) {
    return (
      <div className={cn("min-h-screen bg-stone-100 flex flex-col transition-opacity duration-500", isPageLoaded ? "opacity-100" : "opacity-0")}>
        <StudioHeader onClose={handleClose} isPageLoaded={isPageLoaded} />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-stone-500">No studio images available yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("min-h-screen bg-stone-100 transition-opacity duration-500", isPageLoaded ? "opacity-100" : "opacity-0")}>
      <StudioHeader onClose={handleClose} isPageLoaded={isPageLoaded} />

      {/* Content column */}
      <div className="max-w-[90vw] md:max-w-[70vw] lg:max-w-[55vw] mx-auto pt-20 md:pt-24">
        {groups.map((group, idx) => (
          <section
            key={idx}
            ref={(el) => setRef(idx, el)}
            data-series-idx={idx}
          >
            {/* Series label */}
            {group.roman && (
              <div className="py-6 md:py-8">
                <span
                  className={cn(
                    "text-stone-400 text-xs tracking-[0.3em] uppercase transition-all duration-300",
                    activeSeriesIdx === idx && "text-stone-700 font-bold"
                  )}
                >
                  {group.roman}
                </span>
              </div>
            )}

            {/* Images stacked with no gap */}
            <div className="flex flex-col">
              {group.images.map((img) => (
                <div key={img.id} className="w-full leading-[0]">
                  <ProgressiveImage
                    src={img.image_url}
                    alt={img.title || "Studio image"}
                    className="w-full [&_img]:w-full [&_img]:h-auto [&_img]:block"
                    objectFit="contain"
                    eager={false}
                    blurUp
                    modernFormats
                    responsivePreset="full"
                    sizes="(max-width: 768px) 90vw, (max-width: 1024px) 70vw, 55vw"
                  />
                </div>
              ))}
            </div>
          </section>
        ))}

        {/* Bottom breathing room */}
        <div className="h-24" />
      </div>
    </div>
  );
};

/** Minimal sticky header with STUDIO label and close button */
function StudioHeader({ onClose, isPageLoaded }: { onClose: () => void; isPageLoaded: boolean }) {
  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 md:p-8 bg-stone-100/80 backdrop-blur-sm transition-all duration-500 delay-100",
        isPageLoaded ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
      )}
    >
      <span className="text-stone-900 text-xs md:text-base font-bold tracking-widest uppercase">
        STUDIO
      </span>
      <button
        onClick={onClose}
        className="min-w-[44px] min-h-[44px] flex items-center justify-center text-stone-900 hover:opacity-70 transition-opacity duration-200 focus:outline-none"
        aria-label="Close and return to landing"
      >
        <X className="w-5 h-5 md:w-7 md:h-7" strokeWidth={1.5} />
      </button>
    </header>
  );
}

export default Studio;
