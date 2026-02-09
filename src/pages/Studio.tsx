import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useStudioImages, type StudioImageWithSeries } from "@/hooks/useStudioImages";
import { useSeries } from "@/hooks/useSeries";
import { ProgressiveImage } from "@/components/ProgressiveImage";
import type { SeriesData } from "@/types";

const Studio = () => {
  const navigate = useNavigate();
  const { data: images, isLoading: imagesLoading } = useStudioImages();
  const { data: allSeries, isLoading: seriesLoading } = useSeries();
  const [activeSeriesId, setActiveSeriesId] = useState<string | null>(null);
  const sectionRefs = useRef<Map<string, HTMLElement>>(new Map());

  // Build ordered groups: series with images + ungrouped
  const { groups, seriesList } = useMemo(() => {
    if (!images?.length) return { groups: [], seriesList: [] as SeriesData[] };

    // Group by series
    const bySeriesMap = new Map<string, StudioImageWithSeries[]>();
    const ungrouped: StudioImageWithSeries[] = [];

    for (const img of images) {
      if (img.series_id) {
        if (!bySeriesMap.has(img.series_id)) bySeriesMap.set(img.series_id, []);
        bySeriesMap.get(img.series_id)!.push(img);
      } else {
        ungrouped.push(img);
      }
    }

    // Get series objects in display order
    const seriesInOrder = (allSeries || [])
      .filter((s) => bySeriesMap.has(s.id))
      .sort((a, b) => a.display_order - b.display_order);

    const result: { id: string; label: string; images: StudioImageWithSeries[] }[] = [];

    for (const s of seriesInOrder) {
      result.push({ id: s.id, label: s.name, images: bySeriesMap.get(s.id)! });
    }

    // Ungrouped images go at the end
    if (ungrouped.length) {
      result.push({ id: "__ungrouped", label: "", images: ungrouped });
    }

    return { groups: result, seriesList: seriesInOrder };
  }, [images, allSeries]);

  // Set initial active series
  useEffect(() => {
    if (groups.length && !activeSeriesId) {
      setActiveSeriesId(groups[0].id);
    }
  }, [groups, activeSeriesId]);

  // IntersectionObserver for active series detection
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("data-series-id");
            if (id) setActiveSeriesId(id);
          }
        }
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: 0 }
    );
    observerRef.current = observer;
    sectionRefs.current.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [groups]);

  const handleSeriesClick = useCallback((seriesId: string) => {
    const section = document.getElementById(`series-${seriesId}`);
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  const handleClose = useCallback(() => navigate("/"), [navigate]);

  const setRef = useCallback((id: string, el: HTMLElement | null) => {
    if (el) {
      sectionRefs.current.set(id, el);
      observerRef.current?.observe(el);
    } else {
      const prev = sectionRefs.current.get(id);
      if (prev) observerRef.current?.unobserve(prev);
      sectionRefs.current.delete(id);
    }
  }, []);

  const isLoading = imagesLoading || seriesLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-stone-400/40 border-t-stone-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!groups.length) {
    return (
      <div className="min-h-screen bg-stone-100 flex flex-col">
        <StudioSeriesHeader
          series={[]}
          activeSeriesId={null}
          onSeriesClick={() => {}}
          onClose={handleClose}
        />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-stone-500">No studio images available yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-100 overflow-x-hidden">
      <StudioSeriesHeader
        series={seriesList}
        activeSeriesId={activeSeriesId}
        onSeriesClick={handleSeriesClick}
        onClose={handleClose}
      />

      <main className="pt-10">
        {groups.map((group) => (
          <section
            key={group.id}
            id={`series-${group.id}`}
            ref={(el) => setRef(group.id, el)}
            data-series-id={group.id}
            className="scroll-mt-[40px] md:scroll-mt-[44px]"
          >
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
                    sizes="100vw"
                  />
                </div>
              ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
};

/** Studio header — shows "STUDIO" + series names with active bold state */
function StudioSeriesHeader(props: {
  series: SeriesData[];
  activeSeriesId: string | null;
  onSeriesClick: (id: string) => void;
  onClose: () => void;
}) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollContainerRef.current && props.activeSeriesId) {
      const btn = scrollContainerRef.current.querySelector(
        `[data-series-id="${props.activeSeriesId}"]`
      );
      if (btn) btn.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  }, [props.activeSeriesId]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-transparent">
      <div className="flex items-center justify-between px-4 py-2 md:px-6 md:py-3">
        <div
          ref={scrollContainerRef}
          className="flex items-center gap-4 md:gap-6 overflow-x-auto scrollbar-hide"
        >
          <span className="text-stone-700 font-bold text-sm md:text-base uppercase tracking-widest flex-shrink-0">
            STUDIO
          </span>
          {props.series.map((s) => (
            <button
              key={s.id}
              data-series-id={s.id}
              onClick={() => props.onSeriesClick(s.id)}
              className={`text-sm md:text-base uppercase tracking-wider transition-colors whitespace-nowrap flex-shrink-0 ${
                s.id === props.activeSeriesId
                  ? "text-stone-600 font-bold"
                  : "text-stone-400 hover:text-stone-600"
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>

        <button
          onClick={props.onClose}
          className="flex-shrink-0 ml-4 text-stone-900 hover:text-stone-600 transition-colors text-lg md:text-xl font-light"
          aria-label="Close studio"
        >
          ✕
        </button>
      </div>
    </header>
  );
}

export default Studio;
