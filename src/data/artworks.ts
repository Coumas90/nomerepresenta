import triPeel1 from "@/assets/tri-peel-1.png";
import triPeel2 from "@/assets/tri-peel-2.png";
import triPeel3 from "@/assets/tri-peel-3.png";
import triPeel1Detail from "@/assets/tri-peel-1-detail.jpg";

export interface Artwork {
  id: number;
  title: string;
  category: string;
  series: string;
  year: string;
  dimensions: string;
  technique: string;
  image: string;
  imageDetail: string;
}

export const artworks: Artwork[] = [
  {
    id: 1,
    title: "Tri-Peel I",
    category: "Paintings",
    series: "TRI-PEEL",
    year: "2024",
    dimensions: "100 × 100 cm",
    technique: "Oil on canvas",
    image: triPeel1,
    imageDetail: triPeel1Detail,
  },
  {
    id: 2,
    title: "Tri-Peel II",
    category: "Paintings",
    series: "TRI-PEEL",
    year: "2024",
    dimensions: "100 × 100 cm",
    technique: "Oil on canvas",
    image: triPeel2,
    imageDetail: triPeel1Detail,
  },
  {
    id: 3,
    title: "Tri-Peel III",
    category: "Paintings",
    series: "TRI-PEEL",
    year: "2024",
    dimensions: "100 × 100 cm",
    technique: "Oil on canvas",
    image: triPeel3,
    imageDetail: triPeel1Detail,
  },
];
