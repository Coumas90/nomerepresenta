import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
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

const artworksData = [
  {
    id: "1",
    title: "Tri-Peel I",
    category: "Paintings",
    year: "2024",
    technique: "Acrylic on canvas",
    materials: "Canvas, acrylic paint",
    dimensions: "100 x 120 cm",
    image: triPeel1,
    imageDetail: triPeel1Detail,
    description: "First piece of the Tri-Peel series exploring abstract forms and color relationships."
  },
  {
    id: "2",
    title: "Tri-Peel II",
    category: "Paintings",
    year: "2024",
    technique: "Acrylic on canvas",
    materials: "Canvas, acrylic paint",
    dimensions: "100 x 120 cm",
    image: triPeel2,
    imageDetail: triPeel1Detail,
    description: "Second exploration in the series, focusing on dynamic composition."
  },
  {
    id: "3",
    title: "Tri-Peel III",
    category: "Paintings",
    year: "2024",
    technique: "Acrylic on canvas",
    materials: "Canvas, acrylic paint",
    dimensions: "100 x 120 cm",
    image: triPeel3,
    imageDetail: triPeel1Detail,
    description: "Third piece continuing the exploration of abstract forms."
  },
  {
    id: "4",
    title: "Tri-Peel IV",
    category: "Paintings",
    year: "2024",
    technique: "Acrylic on canvas",
    materials: "Canvas, acrylic paint",
    dimensions: "80 x 100 cm",
    image: triPeel4,
    imageDetail: triPeel4,
    description: "Bold red forms against dark background."
  },
  {
    id: "5",
    title: "Tri-Peel V",
    category: "Paintings",
    year: "2024",
    technique: "Acrylic on canvas",
    materials: "Canvas, acrylic paint",
    dimensions: "80 x 100 cm",
    image: triPeel5,
    imageDetail: triPeel5,
    description: "Horizontal composition with contrasting elements."
  },
  {
    id: "6",
    title: "Tri-Peel VI",
    category: "Paintings",
    year: "2024",
    technique: "Acrylic on canvas",
    materials: "Canvas, acrylic paint",
    dimensions: "80 x 100 cm",
    image: triPeel6,
    imageDetail: triPeel6,
    description: "Vertical strokes in monochromatic palette."
  },
  {
    id: "7",
    title: "Tri-Peel VII",
    category: "Paintings",
    year: "2024",
    technique: "Acrylic on canvas",
    materials: "Canvas, acrylic paint",
    dimensions: "90 x 110 cm",
    image: triPeel7,
    imageDetail: triPeel7,
    description: "Exploration of geometric abstraction."
  },
  {
    id: "8",
    title: "Tri-Peel VIII",
    category: "Paintings",
    year: "2024",
    technique: "Acrylic on canvas",
    materials: "Canvas, acrylic paint",
    dimensions: "90 x 110 cm",
    image: triPeel8,
    imageDetail: triPeel8,
    description: "Layered composition with depth."
  },
  {
    id: "9",
    title: "Tri-Peel IX",
    category: "Paintings",
    year: "2024",
    technique: "Acrylic on canvas",
    materials: "Canvas, acrylic paint",
    dimensions: "85 x 105 cm",
    image: triPeel9,
    imageDetail: triPeel9,
    description: "Minimalist approach to form and color."
  },
  {
    id: "10",
    title: "Tri-Peel X",
    category: "Paintings",
    year: "2024",
    technique: "Acrylic on canvas",
    materials: "Canvas, acrylic paint",
    dimensions: "85 x 105 cm",
    image: triPeel10,
    imageDetail: triPeel10,
    description: "Complex interplay of shapes."
  },
  {
    id: "11",
    title: "Tri-Peel XI",
    category: "Paintings",
    year: "2024",
    technique: "Acrylic on canvas",
    materials: "Canvas, acrylic paint",
    dimensions: "95 x 115 cm",
    image: triPeel11,
    imageDetail: triPeel11,
    description: "Dynamic energy through gestural marks."
  },
  {
    id: "12",
    title: "Tri-Peel XII",
    category: "Paintings",
    year: "2024",
    technique: "Acrylic on canvas",
    materials: "Canvas, acrylic paint",
    dimensions: "95 x 115 cm",
    image: triPeel12,
    imageDetail: triPeel12,
    description: "Final piece in the series synthesis."
  }
];

const ArtworkDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const artwork = artworksData.find(art => art.id === id);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (!artwork) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-background pt-32">
          <div className="container mx-auto px-6">
            <p className="text-lg">Artwork not found</p>
            <button 
              onClick={() => navigate("/")}
              className="mt-4 text-sm underline"
            >
              Return to gallery
            </button>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background pt-32">
        <div className="container mx-auto px-6 py-12">
          {/* Title and Image Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16">
            {/* Title - Left */}
            <div className="lg:col-span-3">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
                {artwork.title}
              </h1>
              <p className="text-sm tracking-wide uppercase">
                {artwork.year}
              </p>
            </div>

            {/* Image - Center */}
            <div className="lg:col-span-9">
              <div className="aspect-square bg-muted overflow-hidden">
                <img 
                  src={artwork.imageDetail} 
                  alt={artwork.title}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl">
            <div>
              <h3 className="text-xs font-semibold tracking-wide uppercase mb-2 text-muted-foreground">
                Dimensions
              </h3>
              <p className="text-sm">{artwork.dimensions}</p>
            </div>

            <div>
              <h3 className="text-xs font-semibold tracking-wide uppercase mb-2 text-muted-foreground">
                Technique
              </h3>
              <p className="text-sm">{artwork.technique}</p>
            </div>

            <div>
              <h3 className="text-xs font-semibold tracking-wide uppercase mb-2 text-muted-foreground">
                Materials
              </h3>
              <p className="text-sm">{artwork.materials}</p>
            </div>

            <div>
              <h3 className="text-xs font-semibold tracking-wide uppercase mb-2 text-muted-foreground">
                Category
              </h3>
              <p className="text-sm">{artwork.category}</p>
            </div>
          </div>

          {/* Description */}
          <div className="mt-12 max-w-3xl">
            <p className="text-sm leading-relaxed uppercase tracking-wide">
              {artwork.description}
            </p>
          </div>

          {/* Back to Gallery */}
          <div className="mt-16">
            <button 
              onClick={() => navigate("/")}
              className="text-sm tracking-wide uppercase hover:underline transition-all"
            >
              ← Back to Gallery
            </button>
          </div>
        </div>
      </main>
    </>
  );
};

export default ArtworkDetail;
