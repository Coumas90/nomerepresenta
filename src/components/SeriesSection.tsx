import { useEffect, useRef } from "react";
import { Plus, Minus } from "lucide-react";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { ProgressiveImage } from "@/components/ProgressiveImage";
import { ArtworkData } from "@/hooks/useArtworks";
import { SeriesData } from "@/hooks/useSeries";

interface SeriesSectionProps {
  series: SeriesData;
  artworks: ArtworkData[];
  isDescriptionExpanded: boolean;
  onToggleDescription: () => void;
  onArtworkClick: (id: string) => void;
  onArtworkHover: (id: string, imageUrl: string) => void;
}

export const SeriesSection = ({
  series,
  artworks,
  isDescriptionExpanded,
  onToggleDescription,
  onArtworkClick,
  onArtworkHover,
}: SeriesSectionProps) => {
  const sectionRef = useRef<HTMLDivElement>(null);

  // Auto-scroll when description expands
  useEffect(() => {
    if (isDescriptionExpanded && sectionRef.current) {
      sectionRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start',
        inline: 'nearest'
      });
    }
  }, [isDescriptionExpanded]);

  return (
    <div ref={sectionRef} className="mb-16" id={`series-${series.id}`}>
      {/* Sticky Header */}
      <div className="sticky top-16 sm:top-20 bg-transparent z-40 pt-3 sm:pt-4 pb-4 sm:pb-6">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">
              WORKS <span className="mx-1 sm:mx-2">&gt;</span> {series.name.toUpperCase()}
            </h1>
            
            {/* Only show button if series has description */}
            {series.description && (
              <button
                onClick={onToggleDescription}
                className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full hover:bg-accent transition-colors duration-300"
                aria-label={isDescriptionExpanded ? "Collapse description" : "Expand description"}
              >
                {isDescriptionExpanded ? (
                  <Minus className="w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-300" />
                ) : (
                  <Plus className="w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-300" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Collapsible Description */}
      {series.description && (
        <Collapsible open={isDescriptionExpanded}>
          <CollapsibleContent>
            <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 animate-fade-in">
              <p className="text-base sm:text-lg leading-relaxed max-w-4xl text-muted-foreground">
                {series.description}
              </p>
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Artworks Grid - ALWAYS VISIBLE */}
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {artworks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {artworks.map((artwork) => (
              <div
                key={artwork.id}
                className="group cursor-pointer animate-fade-in"
                onClick={() => onArtworkClick(artwork.id)}
                onMouseEnter={() => onArtworkHover(artwork.id, artwork.image_url)}
              >
                <div className="aspect-square bg-muted overflow-hidden mb-3 sm:mb-4 relative rounded-sm">
                  {/* Main image with lazy loading */}
                  <ProgressiveImage
                    src={artwork.image_url}
                    alt={artwork.title}
                    className="absolute inset-0 transition-opacity duration-700 group-hover:opacity-0"
                  />
                  {/* Detail/zoom image - only hover on desktop */}
                  <ProgressiveImage
                    src={artwork.image_detail_url}
                    alt={`${artwork.title} - Detail`}
                    className="absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100 hidden sm:block"
                  />
                </div>
                {/* Mobile: always visible. Desktop: hover */}
                <div className="space-y-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300">
                  <h3 className="text-sm sm:text-base font-medium tracking-wide">
                    {artwork.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    {artwork.year}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-sm sm:text-base text-muted-foreground">
              No artworks in this series yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
