import { useParams, useNavigate } from "react-router-dom";
import { artworks } from "@/data/artworks";
import { useEffect, useState } from "react";
import Header from "@/components/Header";

const ArtworkDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState(false);

  const artwork = artworks.find((art) => art.id === Number(id));

  useEffect(() => {
    if (!artwork) {
      navigate("/");
      return;
    }
    
    const img = new Image();
    img.src = artwork.image;
    img.onload = () => setIsLoaded(true);
  }, [artwork, navigate]);

  if (!artwork) return null;

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <div 
          className={`container mx-auto px-6 pt-32 pb-24 transition-opacity duration-500 ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* Back Button */}
          <button
            onClick={() => navigate("/")}
            className="group mb-12 flex items-center gap-2 text-sm tracking-widest text-muted-foreground transition-colors hover:text-foreground"
          >
            <span className="transition-transform duration-300 group-hover:-translate-x-1">←</span>
            BACK
          </button>

          {/* Artwork Image */}
          <div className="mx-auto max-w-5xl">
            <div className="aspect-square overflow-hidden bg-muted">
              <img
                src={artwork.image}
                alt={artwork.title}
                className="h-full w-full object-cover"
                loading="eager"
              />
            </div>

            {/* Artwork Info */}
            <div className="mt-12 space-y-3 text-center">
              <h1 className="text-xl font-medium tracking-[0.3em] uppercase text-foreground">
                {artwork.title}
              </h1>
              <p className="text-sm tracking-widest text-muted-foreground">
                {artwork.category}
              </p>
              <div className="flex items-center justify-center gap-2 text-xs tracking-wider text-muted-foreground">
                <span>{artwork.year}</span>
                <span>•</span>
                <span>{artwork.dimensions}</span>
                <span>•</span>
                <span>{artwork.technique}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default ArtworkDetail;
