import Header from "@/components/Header";
import triPeel1 from "@/assets/tri-peel-1.png";
import triPeel2 from "@/assets/tri-peel-2.png";
import triPeel3 from "@/assets/tri-peel-3.png";
import triPeel4 from "@/assets/tri-peel-4.jpg";
import triPeel5 from "@/assets/tri-peel-5.jpg";
import triPeel6 from "@/assets/tri-peel-6.jpg";
import triPeel7 from "@/assets/tri-peel-7.jpg";
import triPeel8 from "@/assets/tri-peel-8.jpg";
import triPeel9 from "@/assets/tri-peel-9.jpg";
import triPeel10 from "@/assets/tri-peel-10.jpg";
import triPeel11 from "@/assets/tri-peel-11.jpg";
import triPeel12 from "@/assets/tri-peel-12.jpg";
import triPeel1Detail from "@/assets/tri-peel-1-detail.jpg";

const mockArtworks = [{
  id: 1,
  title: "Tri-Peel I",
  category: "Paintings",
  image: triPeel1,
  imageDetail: triPeel1Detail
}, {
  id: 2,
  title: "Tri-Peel II",
  category: "Paintings",
  image: triPeel2,
  imageDetail: triPeel1Detail
}, {
  id: 3,
  title: "Tri-Peel III",
  category: "Paintings",
  image: triPeel3,
  imageDetail: triPeel1Detail
}, {
  id: 4,
  title: "Tri-Peel IV",
  category: "Paintings",
  image: triPeel4,
  imageDetail: triPeel4
}, {
  id: 5,
  title: "Tri-Peel V",
  category: "Paintings",
  image: triPeel5,
  imageDetail: triPeel5
}, {
  id: 6,
  title: "Tri-Peel VI",
  category: "Paintings",
  image: triPeel6,
  imageDetail: triPeel6
}, {
  id: 7,
  title: "Tri-Peel VII",
  category: "Paintings",
  image: triPeel7,
  imageDetail: triPeel7
}, {
  id: 8,
  title: "Tri-Peel VIII",
  category: "Paintings",
  image: triPeel8,
  imageDetail: triPeel8
}, {
  id: 9,
  title: "Tri-Peel IX",
  category: "Paintings",
  image: triPeel9,
  imageDetail: triPeel9
}, {
  id: 10,
  title: "Tri-Peel X",
  category: "Paintings",
  image: triPeel10,
  imageDetail: triPeel10
}, {
  id: 11,
  title: "Tri-Peel XI",
  category: "Paintings",
  image: triPeel11,
  imageDetail: triPeel11
}, {
  id: 12,
  title: "Tri-Peel XII",
  category: "Paintings",
  image: triPeel12,
  imageDetail: triPeel12
}];
const Index = () => {
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
              {mockArtworks.map(artwork => <div key={artwork.id} className="group cursor-pointer">
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