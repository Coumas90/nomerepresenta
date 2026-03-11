import { useRef, useEffect, forwardRef, useState } from "react";
import { ArtworkScrollCard } from "./ArtworkScrollCard";
import { CarouselBlock } from "./CarouselBlock";
import { cn } from "@/lib/utils";
import type { ArtworkData, ArtworkImage } from "@/types";
import type { WorksBlockDisplay } from "@/hooks/useArtworksBySeries";

interface SeriesSectionProps {
  series: { id: string; name: string; description: string | null };
  blocks: WorksBlockDisplay[];
  /** @deprecated Kept for backward compat; prefer blocks */
  artworks: ArtworkData[];
  isFirst?: boolean;
  onIntersect?: (seriesId: string, isIntersecting: boolean) => void;
  className?: string;
  allArtworkImages?: Record<string, ArtworkImage[]>;
  onGalleryNavigate?: (artworkId: string) => void;
}

export const SeriesSection = forwardRef<HTMLElement, SeriesSectionProps>(
  ({ series, blocks, artworks, isFirst = false, onIntersect, className, allArtworkImages, onGalleryNavigate }, ref) => {
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

    // Use blocks if available, otherwise fall back to artworks as single blocks
    const displayBlocks: WorksBlockDisplay[] = blocks.length > 0
      ? blocks
      : artworks.map((a, i) => ({
          id: a.id,
          block_type: "single" as const,
          display_order: i,
          artworks: [a],
        }));

    let globalArtworkIndex = 0;

    return (
      <section
        ref={sectionRef}
        id={`series-${series.id}`}
        data-series-id={series.id}
        className={cn("scroll-mt-20 pb-28 md:pb-48", className)}
      >
        <div className="space-y-36 md:space-y-56">
          {displayBlocks.map((block) => {
            if (block.block_type === "carousel" && block.artworks.length > 1) {
              const blockIdx = globalArtworkIndex;
              globalArtworkIndex += block.artworks.length;
              return (
                <CarouselBlock
                  key={block.id}
                  artworks={block.artworks}
                  isVisible={isNearViewport}
                  allArtworkImages={allArtworkImages}
                  eager={isFirst && blockIdx === 0}
                  onGalleryNavigate={onGalleryNavigate}
                />
              );
            }
            // Single block: render each artwork as ArtworkScrollCard
            return block.artworks.map((artwork) => {
              const idx = globalArtworkIndex++;
              return (
                <ArtworkScrollCard
                  key={artwork.id}
                  artwork={artwork}
                  isVisible={isNearViewport}
                  preloadedImages={allArtworkImages?.[artwork.id]}
                  eager={isFirst && idx === 0}
                  onGalleryNavigate={onGalleryNavigate}
                />
              );
            });
          })}
        </div>
      </section>
    );
  }
);

SeriesSection.displayName = "SeriesSection";
export default SeriesSection;
