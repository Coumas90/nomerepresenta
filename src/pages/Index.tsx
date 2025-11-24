import { useNavigate } from "react-router-dom";
import { Instagram } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import Header from "@/components/Header";
import { useArtworks } from "@/hooks/useArtworks";
import { useSeries } from "@/hooks/useSeries";
import { SeriesSection } from "@/components/SeriesSection";
import { useQueryClient } from "@tanstack/react-query";
import { ArtistStructuredData } from "@/components/seo/ArtistStructuredData";
const Index = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const {
    data: artworks,
    isLoading,
    error
  } = useArtworks();
  const { data: series, isLoading: seriesLoading } = useSeries();
  const [scrollY, setScrollY] = useState(0);
  const [expandedSeries, setExpandedSeries] = useState<Record<string, boolean>>({});
  
  // Group artworks by series
  const artworksBySeries = useMemo(() => {
    if (!artworks || !series) return {};
    
    return series.reduce((acc, s) => {
      acc[s.id] = artworks
        .filter(art => art.series_id === s.id)
        .sort((a, b) => a.display_order - b.display_order);
      return acc;
    }, {} as Record<string, typeof artworks>);
  }, [artworks, series]);

  // Toggle series description
  const toggleSeriesDescription = (seriesId: string) => {
    setExpandedSeries(prev => ({
      ...prev,
      [seriesId]: !prev[seriesId]
    }));
  };

  // Debounce scroll con useMemo
  const scrollTransform = useMemo(() => ({
    bio: `translateY(${Math.min(scrollY * -0.03, 40)}px)`,
    contact: `translateY(${Math.min(scrollY * -0.03, 40)}px)`,
  }), [scrollY]);
  
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Prefetch en hover
  const handleArtworkHover = (artworkId: string, imageUrl: string) => {
    // Prefetch data
    queryClient.prefetchQuery({
      queryKey: ["artwork", artworkId],
      queryFn: async () => {
        const { supabase } = await import("@/integrations/supabase/client");
        const { data } = await supabase
          .from("artworks")
          .select("*")
          .eq("id", artworkId)
          .single();
        return data;
      },
    });
    
    // Prefetch imagen principal
    const img = new Image();
    img.src = imageUrl;
  };
  return <>
      <ArtistStructuredData
        name="Ivan Comas"
        description="Ivan Comas is a Franco-Argentine artist working between São Paulo and Paris. His practice evolves through layered procedures that merge industrial materials, fragmented text, and the visual residue of dense urban environments."
        url="https://ivancomas.lovable.app"
        image="https://ivancomas.lovable.app/images/artworks/tri-peel-1.png"
        birthDate="1987"
        birthPlace="Buenos Aires, Argentina"
        nationality="Franco-Argentine"
        jobTitle="Visual Artist"
        sameAs={[
          "https://instagram.com/ivancomas",
        ]}
      />
      <Header />
      <main className="min-h-screen bg-background">
        {/* Works Section - Organized by Series */}
        <section id="works" className="min-h-screen pt-16 sm:pt-20">
          {(isLoading || seriesLoading) && (
            <div className="container mx-auto px-4 sm:px-6 py-12">
              <div className="text-center py-12">
                <p className="text-sm sm:text-base text-muted-foreground">Loading artworks...</p>
              </div>
            </div>
          )}
          
          {error && (
            <div className="container mx-auto px-4 sm:px-6 py-12">
              <div className="text-center py-12">
                <p className="text-sm sm:text-base text-destructive">Error loading artworks. Please try again.</p>
              </div>
            </div>
          )}

          {series && artworks && !isLoading && !seriesLoading && (
            <>
              {series.map((s) => (
                <SeriesSection
                  key={s.id}
                  series={s}
                  artworks={artworksBySeries[s.id] || []}
                  isDescriptionExpanded={expandedSeries[s.id] || false}
                  onToggleDescription={() => toggleSeriesDescription(s.id)}
                  onArtworkClick={(id) => navigate(`/artwork/${id}`)}
                  onArtworkHover={handleArtworkHover}
                />
              ))}
            </>
          )}

          {series && artworks && artworks.length === 0 && !isLoading && (
            <div className="container mx-auto px-4 sm:px-6 py-12">
              <div className="text-center py-12">
                <p className="text-sm sm:text-base text-muted-foreground">No artworks available yet.</p>
              </div>
            </div>
          )}
        </section>

        {/* Bio Section */}
        <section id="bio" className="pt-12 sm:pt-16 pb-8 sm:pb-12">
          <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 sm:mb-8">
              BIO
            </h1>
            
            <div className="max-w-4xl">
              {/* Artist Name and Origin */}
              <p className="text-base sm:text-lg font-semibold mb-4">
                Ivan Comas (b. 1987, Buenos Aires)
              </p>
              
              {/* Bio Paragraphs */}
              <div className="space-y-6 sm:space-y-8 text-sm sm:text-base leading-relaxed text-muted-foreground mb-12 sm:mb-16">
                <p>
                  is a Franco-Argentine artist working between São Paulo and Paris. His practice evolves through layered procedures that merge industrial materials, fragmented text, and the visual residue of dense urban environments. Comas builds stratified surfaces through cycles of inscription, burial, and rupture, developing a material language shaped by years of movement between major cities and long periods of photographic and observational research.
                </p>
                <p>
                  Educated at the École des Beaux-Arts de Paris, Comas has developed a body of work that intersects painting, photography, and writing, forming a coherent investigation into memory, architecture, and the rhythm of collapsing structures. His work has been exhibited in Los Angeles, Berlin, Paris, and São Paulo, and is held in private collections in Latin America, Europe, and the United States, including the Jumex and Vergez & Pearson collections.
                </p>
              </div>

              {/* Education Section */}
              <div className="mb-12 sm:mb-16">
                <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">EDUCATION</h2>
                <div className="space-y-3 sm:space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr] gap-2 sm:gap-6">
                    <span className="font-semibold text-sm sm:text-base">2007-2012</span>
                    <div className="text-sm sm:text-base">
                      <p>MFA</p>
                      <p className="text-muted-foreground">École Nationale Supérieure des Beaux-Arts de Paris</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr] gap-2 sm:gap-6">
                    <span className="font-semibold text-sm sm:text-base">2011</span>
                    <div className="text-sm sm:text-base">
                      <p>Exchange program</p>
                      <p className="text-muted-foreground">Cooper Union, New York</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Solo and Two Person Exhibitions */}
              <div className="mb-12 sm:mb-16">
                <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">SOLO AND TWO PERSON EXHIBITIONS</h2>
                <div className="space-y-3 sm:space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr] gap-2 sm:gap-6">
                    <span className="font-semibold text-sm sm:text-base">2024</span>
                    <p className="text-sm sm:text-base">
                      <span className="text-foreground">Metronomo</span>, <span className="text-muted-foreground">Instituto Alto, São Paulo</span>
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr] gap-2 sm:gap-6">
                    <span className="font-semibold text-sm sm:text-base">2019</span>
                    <p className="text-sm sm:text-base">
                      <span className="text-foreground">A hole in the wall</span>, <span className="text-muted-foreground">Espacio Abierto, CDMX</span>
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr] gap-2 sm:gap-6">
                    <span className="font-semibold text-sm sm:text-base">2016</span>
                    <p className="text-sm sm:text-base">
                      <a href="http://steveturner.la/exhibition/ivan-comas-3#1" target="_blank" rel="noopener noreferrer" className="text-foreground hover:text-primary transition-colors bio-link">After Sonora</a>, <span className="text-muted-foreground">Steve Turner, Los Angeles</span>
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr] gap-2 sm:gap-6">
                    <span className="font-semibold text-sm sm:text-base">2015</span>
                    <div className="space-y-2 text-sm sm:text-base">
                      <p>
                        <a href="https://www.duveberlin.com/exhibition/days-go-by" target="_blank" rel="noopener noreferrer" className="text-foreground hover:text-primary transition-colors bio-link">Days go by</a>, <span className="text-muted-foreground">Duve, Berlin</span>
                      </p>
                      <p>
                        <span className="text-foreground">Art Berlin Contemporary, ABC</span> <span className="text-muted-foreground">(with Steve Turner), Berlin</span>
                      </p>
                      <p>
                        <span className="text-foreground">Ivan Comas and Joaquín Boz, ArtBo</span>, <span className="text-muted-foreground">Bogotá (with Steve Turner)</span>
                      </p>
                      <p>
                        <a href="http://steveturner.la/exhibition/ivan-comas#1" target="_blank" rel="noopener noreferrer" className="text-foreground hover:text-primary transition-colors bio-link">La Brea</a>, <span className="text-muted-foreground">Steve Turner, Los Angeles</span>
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr] gap-2 sm:gap-6">
                    <span className="font-semibold text-sm sm:text-base">2014</span>
                    <p className="text-sm sm:text-base">
                      <span className="text-foreground">Recent Works</span>, <span className="text-muted-foreground">Vergez Collection, Buenos Aires</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Selected Group Exhibitions */}
              <div>
                <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">SELECTED GROUP EXHIBITIONS</h2>
                <div className="space-y-3 sm:space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr] gap-2 sm:gap-6">
                    <span className="font-semibold text-sm sm:text-base">2018</span>
                    <p className="text-sm sm:text-base">
                      <span className="text-foreground">Sun Kiss Choked</span>, <span className="text-muted-foreground">Y53, Los Angeles</span>
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr] gap-2 sm:gap-6">
                    <span className="font-semibold text-sm sm:text-base">2017</span>
                    <p className="text-sm sm:text-base">
                      <a href="https://dittrich-schlechtriem.com/monet-is-my-church/" target="_blank" rel="noopener noreferrer" className="text-foreground hover:text-primary transition-colors bio-link">Monet is my church</a>, <span className="text-muted-foreground">Dittrich & Schlechtriern, Berlin</span>
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr] gap-2 sm:gap-6">
                    <span className="font-semibold text-sm sm:text-base">2015</span>
                    <p className="text-sm sm:text-base">
                      <span className="text-foreground">UNTITLED</span> <span className="text-muted-foreground">(with Steve Turner), Miami Beach</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="pt-8 sm:pt-12 pb-16 sm:pb-24">
          <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 sm:mb-8">
              CONTACT
            </h1>
            
            <div className="max-w-3xl text-left">
              <div className="space-y-3 sm:space-y-4">
                {/* Email */}
                <a href="mailto:contact@ivancomas.com" className="text-2xl sm:text-3xl font-light text-foreground hover:text-primary transition-colors duration-300 inline-block">
                  contact@ivancomas.com
                </a>

                {/* Location */}
                
              </div>

              {/* Social Media - Solo icono */}
              <div className="mt-8 sm:mt-12">
                <a href="https://instagram.com/manyvices" target="_blank" rel="noopener noreferrer" className="inline-block text-muted-foreground hover:text-foreground transition-colors duration-300" aria-label="Instagram">
                  <Instagram className="w-5 h-5 sm:w-6 sm:h-6" />
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>;
};
export default Index;