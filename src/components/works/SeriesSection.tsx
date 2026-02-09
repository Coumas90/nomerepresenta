import { useRef, useEffect, forwardRef, useState } from "react";
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
    // Track if section is within extended viewport for lazy loading
    const [isNearViewport, setIsNearViewport] = useState(false);

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

    // IntersectionObserver for detecting active series (header highlight)
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

    // Separate IntersectionObserver for lazy loading images
    // Uses larger margins to preload content before it's visible
    useEffect(() => {
      if (!sectionRef.current) return;

      const lazyLoadObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setIsNearViewport(true);
              // Once loaded, we don't need to observe anymore
              lazyLoadObserver.unobserve(entry.target);
            }
          });
        },
        {
          // Preload when section is within 100% viewport height above/below
          rootMargin: "100% 0px 100% 0px",
          threshold: 0,
        }
      );

      lazyLoadObserver.observe(sectionRef.current);

      return () => {
        lazyLoadObserver.disconnect();
      };
    }, []);

    return (
      <section
        ref={sectionRef}
        id={`series-${series.id}`}
        data-series-id={series.id}
        className={cn("scroll-mt-20 pb-28 md:pb-48", className)}
      >
        {/* Series divider - skip for first series */}
        

        {/* Artworks in this series - only render when near viewport */}
        <div className="space-y-36 md:space-y-56">
          {artworks.map((artwork) => (
            <ArtworkScrollCard
              key={artwork.id}
              artwork={artwork}
              isVisible={isNearViewport}
            />
          ))}
        </div>
      </section>
    );
  }
);

SeriesSection.displayName = "SeriesSection";

export default SeriesSection;
