import { useNavigate } from "react-router-dom";
import { Instagram } from "lucide-react";
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { useArtworks } from "@/hooks/useArtworks";

const Index = () => {
  const navigate = useNavigate();
  const { data: artworks, isLoading, error } = useArtworks();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return <>
      <Header />
      <main className="min-h-screen bg-background">
        {/* Works Section */}
        <section id="works" className="min-h-screen pt-16 sm:pt-20">
          <div className="sticky top-16 sm:top-20 bg-transparent z-40 pt-3 sm:pt-4 pb-4 sm:pb-6">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="flex items-center justify-between">
                <h1 
                  className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight transition-transform duration-300 ease-out"
                  style={{ 
                    transform: `translateY(${Math.min(scrollY * -0.02, 20)}px)` 
                  }}
                >
                  WORKS <span className="mx-1 sm:mx-2">&gt;</span> TRI-PEEL
                </h1>
              </div>
            </div>
          </div>

          <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
            {isLoading && (
              <div className="text-center py-12">
                <p className="text-sm sm:text-base text-muted-foreground">Loading artworks...</p>
              </div>
            )}
            
            {error && (
              <div className="text-center py-12">
                <p className="text-sm sm:text-base text-destructive">Error loading artworks. Please try again.</p>
              </div>
            )}

            {artworks && artworks.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {artworks.map(artwork => (
                  <div 
                    key={artwork.id} 
                    className="group cursor-pointer animate-fade-in" 
                    onClick={() => navigate(`/artwork/${artwork.id}`)}
                  >
                    <div className="aspect-square bg-muted overflow-hidden mb-3 sm:mb-4 relative rounded-sm">
                      {/* Imagen principal */}
                      <img 
                        src={artwork.image_url} 
                        alt={artwork.title} 
                        className="w-full h-full object-cover absolute inset-0 transition-opacity duration-700 group-hover:opacity-0" 
                        loading="lazy" 
                      />
                      {/* Imagen de detalle/zoom - solo hover en desktop */}
                      <img 
                        src={artwork.image_detail_url} 
                        alt={`${artwork.title} - Detail`} 
                        className="w-full h-full object-cover absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100 hidden sm:block" 
                        loading="lazy" 
                      />
                    </div>
                    {/* En mobile: siempre visible. En desktop: hover */}
                    <div className="space-y-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-300">
                      <h3 className="text-sm sm:text-base font-medium tracking-wide">{artwork.title}</h3>
                      <p className="text-xs sm:text-sm text-muted-foreground">{artwork.year}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {artworks && artworks.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <p className="text-sm sm:text-base text-muted-foreground">No artworks available yet.</p>
              </div>
            )}
          </div>
        </section>

        {/* Bio Section */}
        <section id="bio" className="min-h-screen pt-16 sm:pt-20">
          <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16">
            <h1 
              className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 sm:mb-8 transition-transform duration-300 ease-out"
              style={{ 
                transform: `translateY(${Math.min(scrollY * -0.03, 40)}px)` 
              }}
            >
              BIO
            </h1>
            
            <div className="max-w-4xl animate-fade-in">
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
              <div className="mb-12 sm:mb-16 animate-fade-in">
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
              <div className="mb-12 sm:mb-16 animate-fade-in">
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
                      <span className="text-foreground">After Sonora</span>, <span className="text-muted-foreground">Steve Turner, Los Angeles</span>
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr] gap-2 sm:gap-6">
                    <span className="font-semibold text-sm sm:text-base">2015</span>
                    <div className="space-y-2 text-sm sm:text-base">
                      <p>
                        <span className="text-foreground">Days go by</span>, <span className="text-muted-foreground">Duve, Berlin</span>
                      </p>
                      <p>
                        <span className="text-foreground">Art Berlin Contemporary, ABC</span> <span className="text-muted-foreground">(with Steve Turner), Berlin</span>
                      </p>
                      <p>
                        <span className="text-foreground">Ivan Comas and Joaquín Boz, ArtBo</span>, <span className="text-muted-foreground">Bogotá (with Steve Turner)</span>
                      </p>
                      <p>
                        <span className="text-foreground">La Brea</span>, <span className="text-muted-foreground">Steve Turner, Los Angeles</span>
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
              <div className="animate-fade-in">
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
                      <span className="text-foreground">Monet is my church</span>, <span className="text-muted-foreground">Dittrich & Schlechtriern, Berlin</span>
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
        <section id="contact" className="min-h-screen pt-16 sm:pt-20">
          <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16">
            <h1 
              className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 sm:mb-8 transition-transform duration-300 ease-out"
              style={{ 
                transform: `translateY(${Math.min(scrollY * -0.03, 40)}px)` 
              }}
            >
              CONTACT
            </h1>
            
            <div className="max-w-3xl text-center">
              <div className="space-y-3 sm:space-y-4">
                {/* Email */}
                <a 
                  href="mailto:contact@ivancomas.com"
                  className="text-2xl sm:text-3xl font-light text-foreground hover:text-primary transition-colors duration-300 inline-block opacity-0 animate-fade-in-up"
                >
                  contact@ivancomas.com
                </a>

                {/* Location */}
                <p className="text-sm sm:text-base font-light text-muted-foreground opacity-0 animate-fade-in-up-delay-1">
                  Currently based between São Paulo and Paris
                </p>
              </div>

              {/* Social Media - Solo icono */}
              <div className="mt-8 sm:mt-12 opacity-0 animate-fade-in-up-delay-2">
                <a
                  href="https://instagram.com/ivancomas"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-muted-foreground hover:text-foreground transition-colors duration-300"
                  aria-label="Instagram"
                >
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