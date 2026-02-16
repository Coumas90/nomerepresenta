import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useStudioImages, type StudioImageWithSeries } from "@/hooks/useStudioImages";
import { useStudioSeries } from "@/hooks/useStudioSeries";
import { ProgressiveImage } from "@/components/ProgressiveImage";
import { StudioHeader } from "@/components/studio/StudioHeader";
import { useAnalytics } from "@/hooks/useAnalytics";
import type { SeriesData } from "@/types";

const Studio = () => {
  const navigate = useNavigate();
  const { data: images, isLoading: imagesLoading } = useStudioImages();
  const { data: allSeries, isLoading: seriesLoading } = useStudioSeries();
  const { trackPageView, trackStudioScroll } = useAnalytics();
  const [activeSeriesId, setActiveSeriesId] = useState<string | null>(null);
  const sectionRefs = useRef<Map<string, HTMLElement>>(new Map());
  const trackedSeriesRef = useRef<Set<string>>(new Set());

  // Build ordered groups: series with images + ungrouped
  const { groups, seriesList } = useMemo(() => {
    if (!images?.length) return { groups: [], seriesList: [] as SeriesData[] };

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

    const seriesInOrder = (allSeries || [])
      .filter((s) => bySeriesMap.has(s.id) && s.is_visible !== false)
      .sort((a, b) => a.display_order - b.display_order);

    const result: { id: string; label: string; images: StudioImageWithSeries[] }[] = [];

    for (const s of seriesInOrder) {
      result.push({ id: s.id, label: s.name, images: bySeriesMap.get(s.id)! });
    }

    if (ungrouped.length) {
      result.push({ id: "__ungrouped", label: "", images: ungrouped });
    }

    return { groups: result, seriesList: seriesInOrder };
  }, [images, allSeries]);

  // Set initial active series + track page view
  useEffect(() => {
    if (groups.length && !activeSeriesId) {
      setActiveSeriesId(groups[0].id);
    }
    trackPageView('/studio', 'Studio');
  }, [groups, activeSeriesId, trackPageView]);

  // IntersectionObserver for active series detection
  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastObserverRef = useRef<IntersectionObserver | null>(null);
  useEffect(() => {
    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      let topEntry: IntersectionObserverEntry | null = null;
      for (const entry of entries) {
        if (entry.isIntersecting) {
          if (!topEntry || entry.boundingClientRect.top < topEntry.boundingClientRect.top) {
            topEntry = entry;
          }
          const seriesId = entry.target.getAttribute("data-series-id");
          if (seriesId && seriesId !== "__ungrouped" && !trackedSeriesRef.current.has(seriesId)) {
            trackedSeriesRef.current.add(seriesId);
            trackStudioScroll(seriesId);
          }
        }
      }
      if (topEntry) {
        const id = topEntry.target.getAttribute("data-series-id");
        if (id) setActiveSeriesId(id);
      }
    };

    // Main observer for most sections
    const observer = new IntersectionObserver(handleIntersection, {
      rootMargin: "-56px 0px -70% 0px",
      threshold: 0,
    });

    // A second observer with a generous bottom margin for the last section,
    // so it activates as soon as its first image enters the viewport
    const lastObserver = new IntersectionObserver(handleIntersection, {
      rootMargin: "-56px 0px 0px 0px",
      threshold: 0,
    });

    observerRef.current = observer;
    lastObserverRef.current = lastObserver;

    const lastGroupId = groups.length ? groups[groups.length - 1].id : null;

    sectionRefs.current.forEach((el, id) => {
      if (id === lastGroupId) {
        lastObserver.observe(el);
      } else {
        observer.observe(el);
      }
    });

    return () => {
      observer.disconnect();
      lastObserver.disconnect();
    };
  }, [groups, trackStudioScroll]);

  const handleSeriesClick = useCallback((seriesId: string) => {
    const section = document.getElementById(`series-${seriesId}`);
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  const handleClose = useCallback(() => navigate("/"), [navigate]);

  const lastGroupId = groups.length ? groups[groups.length - 1].id : null;

  const setRef = useCallback((id: string, el: HTMLElement | null) => {
    const obs = id === lastGroupId ? lastObserverRef.current : observerRef.current;
    if (el) {
      sectionRefs.current.set(id, el);
      obs?.observe(el);
    } else {
      const prev = sectionRefs.current.get(id);
      if (prev) obs?.unobserve(prev);
      sectionRefs.current.delete(id);
    }
  }, [lastGroupId]);

  const isLoading = imagesLoading || seriesLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-100" />
    );
  }

  if (!groups.length) {
    return (
      <div className="min-h-screen bg-stone-100 flex flex-col">
        <StudioHeader
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
    <div className="min-h-screen bg-stone-100">
      <StudioHeader
        series={seriesList}
        activeSeriesId={activeSeriesId}
        onSeriesClick={handleSeriesClick}
        onClose={handleClose}
      />

      <main className="overflow-x-clip">
        {groups.map((group) => (
          <section
            key={group.id}
            id={`series-${group.id}`}
            className="scroll-mt-[48px] md:scroll-mt-[56px]"
          >
            <div className="flex flex-col">
              {group.images.map((img, imgIndex) => (
                <div
                  key={img.id}
                  className="w-full leading-[0]"
                  {...(imgIndex === 0 ? {
                    ref: (el: HTMLDivElement | null) => setRef(group.id, el),
                    "data-series-id": group.id
                  } : {})}
                >
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

export default Studio;
