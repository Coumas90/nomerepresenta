import { useRef, useEffect, forwardRef, useState } from "react";
import { ArtworkScrollCard } from "./ArtworkScrollCard";
import { cn } from "@/lib/utils";
import type { ArtworkData, SeriesData, ArtworkImage } from "@/types";

interface SeriesSectionProps {
  series: SeriesData;
  artworks: ArtworkData[];
  isFirst?: boolean;
  onIntersect?: (seriesId: string, isIntersecting: boolean) => void;
  className?: string;
  allArtworkImages?: Record<string, ArtworkImage[]>;
  onGalleryNavigate?: (artworkId: string) => void;
}

export const SeriesSection = forwardRef<HTMLElement, SeriesSectionProps>(
  ({ series, artworks, isFirst = false, onIntersect, className, allArtworkImages, onGalleryNavigate }, ref) => {
    const sectionRef = useRef<HTMLElement>(null);
    const [isNearViewport, setIsNearViewport] = useState(false);

    useEffect(() => {
      if (ref) {
        if (typeof ref === "function") {
          ref(sectionRef.current);
        } else {
          ref.current = sectionRef.current;
        }
      }
    }, [ref]);

    useEffect(() => {
      if (!onIntersect || !sectionRef.current) return;
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            onIntersect(series.id, entry.isIntersecting);
          });
        },
        { rootMargin: "-20% 0px -60% 0px", threshold: 0 }
      );
      observer.observe(sectionRef.current);
      return () => observer.disconnect();
    }, [series.id, onIntersect]);

    useEffect(() => {
      if (!sectionRef.current) return;
      const lazyLoadObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setIsNearViewport(true);
              lazyLoadObserver.unobserve(entry.target);
            }
          });
        },
        { rootMargin: "100% 0px 100% 0px", threshold: 0 }
      );
      lazyLoadObserver.observe(sectionRef.current);
      return () => lazyLoadObserver.disconnect();
    }, []);

    return (
      <section
        ref={sectionRef}
        id={`series-${series.id}`}
        data-series-id={series.id}
        className={cn("scroll-mt-20 pb-28 md:pb-48", className)}
      >
        <div className="space-y-36 md:space-y-56">
          {artworks.map((artwork, artIndex) => (
            <ArtworkScrollCard
              key={artwork.id}
              artwork={artwork}
              isVisible={isNearViewport}
              preloadedImages={allArtworkImages?.[artwork.id]}
              eager={isFirst && artIndex === 0}
              onGalleryNavigate={onGalleryNavigate}
            />
          ))}
        </div>
      </section>
    );
  }
);

SeriesSection.displayName = "SeriesSection";
export default SeriesSection;
