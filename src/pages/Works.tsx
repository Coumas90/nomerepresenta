import Header from "@/components/Header";
import triPeel1 from "@/assets/tri-peel-1.png";
import triPeel2 from "@/assets/tri-peel-2.png";
import triPeel3 from "@/assets/tri-peel-3.png";

const mockArtworks = [
  { id: 1, title: "Tri-Peel I", category: "Paintings", image: triPeel1 },
  { id: 2, title: "Tri-Peel II", category: "Paintings", image: triPeel2 },
  { id: 3, title: "Tri-Peel III", category: "Paintings", image: triPeel3 },
];

const Works = () => {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        {/* Sticky Breadcrumb */}
        <div className="sticky top-0 bg-background z-40 border-b border-border pt-24 pb-6">
          <div className="container mx-auto px-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold tracking-tight">
                WORKS <span className="mx-2">&gt;</span> TRI-PEEL
              </h1>
              <button className="bg-foreground text-background px-6 py-2 text-sm font-bold tracking-wide hover:opacity-90 transition-opacity">
                FILTERS
              </button>
            </div>
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="container mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mockArtworks.map((artwork) => (
              <div key={artwork.id} className="group cursor-pointer">
                <div className="aspect-square bg-muted overflow-hidden mb-4">
                  <img 
                    src={artwork.image} 
                    alt={artwork.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-medium tracking-wide">{artwork.title}</h3>
                  <p className="text-xs text-muted-foreground">{artwork.category}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
};

export default Works;
