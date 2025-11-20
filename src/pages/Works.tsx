import Header from "@/components/Header";

const mockArtworks = [
  { id: 1, title: "Leather Jacket", category: "Paintings", image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800" },
  { id: 2, title: "Hooded Work", category: "Sculptures", image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800" },
  { id: 3, title: "Black Jacket", category: "Paintings", image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800" },
  { id: 4, title: "Urban Collection", category: "Drawings", image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800" },
  { id: 5, title: "Street Style", category: "Paintings", image: "https://images.unsplash.com/photo-1548126032-079d9d-b6c4c?w=800" },
  { id: 6, title: "Dark Aesthetic", category: "Installations", image: "https://images.unsplash.com/photo-1520975954732-35dd22299614?w=800" },
  { id: 7, title: "Monochrome", category: "Digital", image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800" },
  { id: 8, title: "Minimal Design", category: "Paintings", image: "https://images.unsplash.com/photo-1608748010899-18f300247112?w=800" },
  { id: 9, title: "Contemporary", category: "Sculptures", image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800" },
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
                WORKS <span className="mx-2">&gt;</span> NEW ARRIVALS
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
