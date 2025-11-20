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

export interface Artwork {
  id: number;
  title: string;
  category: string;
  year: string;
  dimensions: string;
  technique: string;
  materials: string;
  description: string;
  image: string;
  imageDetail: string;
}

export const artworks: Artwork[] = [
  {
    id: 1,
    title: "Tri-Peel I",
    category: "Paintings",
    year: "2024",
    dimensions: "120 x 100 cm",
    technique: "Mixed media on canvas",
    materials: "Acrylic, oil pastels, canvas",
    description: "The first piece in the Tri-Peel series explores the intersection of geometric forms and organic textures. Through layered application of mixed media, this work creates a dialogue between structure and spontaneity.",
    image: triPeel1,
    imageDetail: triPeel1Detail
  },
  {
    id: 2,
    title: "Tri-Peel II",
    category: "Paintings",
    year: "2024",
    dimensions: "120 x 100 cm",
    technique: "Mixed media on canvas",
    materials: "Acrylic, oil pastels, canvas",
    description: "Building upon the foundational concepts of the series, this piece delves deeper into the relationship between color and form. The layering technique creates depth and movement within a seemingly static composition.",
    image: triPeel2,
    imageDetail: triPeel1Detail
  },
  {
    id: 3,
    title: "Tri-Peel III",
    category: "Paintings",
    year: "2024",
    dimensions: "120 x 100 cm",
    technique: "Mixed media on canvas",
    materials: "Acrylic, oil pastels, canvas",
    description: "The third iteration examines the balance between order and chaos. Through deliberate mark-making and controlled accidents, the work invites contemplation on the nature of creation itself.",
    image: triPeel3,
    imageDetail: triPeel1Detail
  },
  {
    id: 4,
    title: "Tri-Peel IV",
    category: "Paintings",
    year: "2024",
    dimensions: "150 x 120 cm",
    technique: "Mixed media on canvas",
    materials: "Acrylic, oil pastels, canvas, collage elements",
    description: "This larger format piece expands the visual language of the series. The introduction of collage elements adds a new dimension to the exploration of texture and layering.",
    image: triPeel4,
    imageDetail: triPeel4
  },
  {
    id: 5,
    title: "Tri-Peel V",
    category: "Paintings",
    year: "2024",
    dimensions: "150 x 120 cm",
    technique: "Mixed media on canvas",
    materials: "Acrylic, oil pastels, canvas, collage elements",
    description: "Continuing the expanded format, this work explores the tension between fragmentation and unity. Each section speaks its own language while contributing to a cohesive whole.",
    image: triPeel5,
    imageDetail: triPeel5
  },
  {
    id: 6,
    title: "Tri-Peel VI",
    category: "Paintings",
    year: "2024",
    dimensions: "150 x 120 cm",
    technique: "Mixed media on canvas",
    materials: "Acrylic, oil pastels, canvas, spray paint",
    description: "The introduction of spray paint techniques brings an urban energy to the series. This piece bridges the gap between studio practice and street art aesthetics.",
    image: triPeel6,
    imageDetail: triPeel6
  },
  {
    id: 7,
    title: "Tri-Peel VII",
    category: "Paintings",
    year: "2024",
    dimensions: "180 x 150 cm",
    technique: "Mixed media on canvas",
    materials: "Acrylic, oil pastels, canvas, spray paint",
    description: "A monumental piece that pushes the boundaries of the series. The scale allows for a more immersive experience, drawing the viewer into its complex layered world.",
    image: triPeel7,
    imageDetail: triPeel7
  },
  {
    id: 8,
    title: "Tri-Peel VIII",
    category: "Paintings",
    year: "2024",
    dimensions: "180 x 150 cm",
    technique: "Mixed media on canvas",
    materials: "Acrylic, oil pastels, canvas, spray paint, charcoal",
    description: "Charcoal marks add gestural energy to the composition. This piece represents a more expressive turn in the series, embracing spontaneity and raw emotion.",
    image: triPeel8,
    imageDetail: triPeel8
  },
  {
    id: 9,
    title: "Tri-Peel IX",
    category: "Paintings",
    year: "2024",
    dimensions: "180 x 150 cm",
    technique: "Mixed media on canvas",
    materials: "Acrylic, oil pastels, canvas, spray paint, charcoal",
    description: "This work synthesizes all previous explorations in the series. The convergence of techniques creates a rich, textured surface that rewards close inspection.",
    image: triPeel9,
    imageDetail: triPeel9
  },
  {
    id: 10,
    title: "Tri-Peel X",
    category: "Paintings",
    year: "2024",
    dimensions: "200 x 160 cm",
    technique: "Mixed media on canvas",
    materials: "Acrylic, oil pastels, canvas, spray paint, charcoal, ink",
    description: "The largest piece in the series represents a culmination of ideas. The addition of ink work adds fine detail that contrasts with the bold gestural marks.",
    image: triPeel10,
    imageDetail: triPeel10
  },
  {
    id: 11,
    title: "Tri-Peel XI",
    category: "Paintings",
    year: "2024",
    dimensions: "200 x 160 cm",
    technique: "Mixed media on canvas",
    materials: "Acrylic, oil pastels, canvas, spray paint, charcoal, ink",
    description: "This penultimate piece reflects on the journey of the series. It speaks to themes of memory, accumulation, and transformation through its complex layering.",
    image: triPeel11,
    imageDetail: triPeel11
  },
  {
    id: 12,
    title: "Tri-Peel XII",
    category: "Paintings",
    year: "2024",
    dimensions: "200 x 160 cm",
    technique: "Mixed media on canvas",
    materials: "Acrylic, oil pastels, canvas, spray paint, charcoal, ink",
    description: "The final piece in the series brings closure while opening new possibilities. It represents both an ending and a beginning, embodying the cyclical nature of artistic practice.",
    image: triPeel12,
    imageDetail: triPeel12
  }
];
