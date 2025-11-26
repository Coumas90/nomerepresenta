import { useEffect, useRef, useState } from "react";
import { Plus, Minus } from "lucide-react";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import { ProgressiveImage } from "@/components/ProgressiveImage";
import { ArtworkData } from "@/hooks/useArtworks";
import { SeriesData } from "@/hooks/useSeries";
import { useAnalytics } from "@/hooks/useAnalytics";

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
  const { trackArtworkView } = useAnalytics();
  const sectionRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [isStuck, setIsStuck] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const trackedArtworksRef = useRef<Set<string>>(new Set());

  // Auto-scroll when description expands
  useEffect(() => {
    if (isDescriptionExpanded && sectionRef.current) {
      // Pequeño delay para que la animación del Collapsible comience
      setTimeout(() => {
        const headerOffset = 80; // Altura del header principal (top-16 sm:top-20 = ~64-80px)
        const sectionTop = sectionRef.current?.getBoundingClientRect().top ?? 0;
        const offsetPosition = window.scrollY + sectionTop - headerOffset;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }, 50);
    }
  }, [isDescriptionExpanded]);

  // Detect when header becomes stuck
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsStuck(!entry.isIntersecting);
      },
      { threshold: 0 }
    );
    
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  // Handle scroll direction for fade effect
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Only hide when scrolling down and header is stuck
      if (currentScrollY > lastScrollY && isStuck) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY, isStuck]);

  // Track artwork views when they enter viewport
  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    
    artworks.forEach((artwork) => {
      const element = document.querySelector(`[data-artwork-id="${artwork.id}"]`);
      if (!element) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && !trackedArtworksRef.current.has(artwork.id)) {
            trackedArtworksRef.current.add(artwork.id);
            trackArtworkView(artwork.id, series.id, { hovered: false });
          }
        },
        { threshold: 0.5 }
      );

      observer.observe(element);
      observers.push(observer);
    });

    return () => observers.forEach(o => o.disconnect());
  }, [artworks, series.id, trackArtworkView]);

  return (
    <div ref={sectionRef} className="mb-16" id={`series-${series.id}`}>
      {/* Sentinel element for intersection detection */}
      <div ref={sentinelRef} className="h-px" />
      
      {/* Sticky Header */}
      <div className={`sticky top-16 sm:top-20 bg-transparent z-40 pt-3 sm:pt-4 pb-4 sm:pb-6 transition-all duration-500 ${
        isVisible ? 'opacity-100 blur-0' : 'opacity-0 blur-sm'
      }`}>
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">
              WORKS <span className="mx-1 sm:mx-2">&gt;</span> {series.name.toUpperCase()}
            </h1>
            
            {/* Only show button if series has description */}
            {series.description && (
            <button
                onClick={onToggleDescription}
                className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 transition-opacity duration-300 hover:opacity-70"
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
                data-artwork-id={artwork.id}
                className="group cursor-pointer animate-fade-in"
                onClick={() => onArtworkClick(artwork.id)}
                onMouseEnter={() => {
                  onArtworkHover(artwork.id, artwork.image_url);
                  // Track hover
                  if (!trackedArtworksRef.current.has(`${artwork.id}-hover`)) {
                    trackedArtworksRef.current.add(`${artwork.id}-hover`);
                    trackArtworkView(artwork.id, series.id, { hovered: true });
                  }
                }}
              >
                <div className="aspect-square overflow-hidden mb-3 sm:mb-4 relative rounded-sm flex items-center justify-center">
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
