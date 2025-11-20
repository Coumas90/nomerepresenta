import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { artworks } from "@/data/artworks";
const Index = () => {
  const navigate = useNavigate();

  return <>
      <Header />
      <main className="min-h-screen bg-background">
        {/* Works Section */}
        <section id="works" className="min-h-screen pt-20">
          <div className="sticky top-20 bg-transparent z-40 pt-4 pb-6">
            <div className="container mx-auto px-6">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">
                  WORKS <span className="mx-2">&gt;</span> TRI-PEEL
                </h1>
                
              </div>
            </div>
          </div>

          <div className="container mx-auto px-6 py-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {artworks.map(artwork => <div key={artwork.id} className="group cursor-pointer" onClick={() => navigate(`/artwork/${artwork.id}`)}>
                  <div className="aspect-square bg-muted overflow-hidden mb-4 relative">
                    {/* Imagen principal */}
                    <img src={artwork.image} alt={artwork.title} className="w-full h-full object-cover absolute inset-0 transition-opacity duration-700 group-hover:opacity-0" loading="lazy" />
                    {/* Imagen de detalle/zoom */}
                    <img src={artwork.imageDetail} alt={`${artwork.title} - Detail`} className="w-full h-full object-cover absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100" loading="lazy" />
                  </div>
                  <div className="space-y-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <h3 className="text-sm font-medium tracking-wide">{artwork.title}</h3>
                    <p className="text-xs text-muted-foreground">{artwork.category}</p>
                  </div>
                </div>)}
            </div>
          </div>
        </section>

        {/* Bio Section */}
        <section id="bio" className="min-h-screen pt-20">
          <div className="container mx-auto px-6 py-16">
            <h1 className="text-4xl font-bold mb-8">BIO</h1>
            {/* Content goes here */}
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="min-h-screen pt-20">
          <div className="container mx-auto px-6 py-16">
            <h1 className="text-4xl font-bold mb-8">CONTACT</h1>
            {/* Content goes here */}
          </div>
        </section>
      </main>
    </>;
};
export default Index;