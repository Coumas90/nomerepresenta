import { useRef, useEffect, forwardRef } from "react";
import { ArtworkScrollCard } from "./ArtworkScrollCard";
import { SerieDivider } from "./SerieDivider";
import { cn } from "@/lib/utils";
import type { ArtworkData, SeriesData } from "@/types";

interface SeriesSectionProps {
  series: SeriesData;
  artworks: ArtworkData[];
  isFirst?: boolean;
  onIntersect?: (seriesId: string, isIntersecting: boolean) => void;
  className?: string;
}

export const SeriesSection = forwardRef<HTMLElement, SeriesSectionProps>(
  ({ series, artworks, isFirst = false, onIntersect, className }, ref) => {
    const sectionRef = useRef<HTMLElement>(null);

    // Merge refs
    useEffect(() => {
      if (ref) {
        if (typeof ref === "function") {
          ref(sectionRef.current);
        } else {
          ref.current = sectionRef.current;
        }
      }
    }, [ref]);

    // IntersectionObserver for detecting active series
    useEffect(() => {
      if (!onIntersect || !sectionRef.current) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            onIntersect(series.id, entry.isIntersecting);
          });
        },
        {
          // Trigger when section enters top portion of viewport
          rootMargin: "-20% 0px -60% 0px",
          threshold: 0,
        }
      );

      observer.observe(sectionRef.current);

      return () => {
        observer.disconnect();
      };
    }, [series.id, onIntersect]);

    return (
      <section
        ref={sectionRef}
        id={`series-${series.id}`}
        data-series-id={series.id}
        className={cn("scroll-mt-20", className)}
      >
        {/* Series divider - skip for first series */}
        {!isFirst && <SerieDivider seriesName={series.name} showName />}

        {/* Artworks in this series */}
        <div className="space-y-16 md:space-y-24">
          {artworks.map((artwork) => (
            <ArtworkScrollCard
              key={artwork.id}
              artwork={artwork}
              isVisible
            />
          ))}
        </div>
      </section>
    );
  }
);

SeriesSection.displayName = "SeriesSection";

export default SeriesSection;
