import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { useArtworks } from "@/hooks/useArtworks";

const Index = () => {
  const navigate = useNavigate();
  const { data: artworks, isLoading, error } = useArtworks();

  return <>
      <Header />
      <main className="min-h-screen bg-background">
        {/* Works Section */}
        <section id="works" className="min-h-screen pt-16 sm:pt-20">
          <div className="sticky top-16 sm:top-20 bg-transparent z-40 pt-3 sm:pt-4 pb-4 sm:pb-6">
            <div className="container mx-auto px-4 sm:px-6">
              <div className="flex items-center justify-between">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight">
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
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 sm:mb-8">BIO</h1>
            <div className="max-w-3xl">
              <p className="text-sm sm:text-base text-muted-foreground">Content coming soon...</p>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="min-h-screen pt-16 sm:pt-20">
          <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 sm:mb-8">CONTACT</h1>
            <div className="max-w-3xl">
              <p className="text-sm sm:text-base text-muted-foreground">Content coming soon...</p>
            </div>
          </div>
        </section>
      </main>
    </>;
};
export default Index;