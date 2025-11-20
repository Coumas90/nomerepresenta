import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Header from "@/components/Header";
import { artworks } from "@/data/artworks";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const ArtworkDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const artwork = artworks.find((art) => art.id === Number(id));

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (!artwork) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-background pt-20">
          <div className="container mx-auto px-6 py-16">
            <h1 className="text-4xl font-bold mb-8">Artwork not found</h1>
            <Button onClick={() => navigate("/")} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Works
            </Button>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <div className="fixed top-20 right-6 z-50 pt-4">
          <Button
            onClick={() => navigate("/#works")}
            variant="default"
            className="bg-foreground text-background hover:bg-foreground/90"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            BACK TO WORKS
          </Button>
        </div>

        <div className="container mx-auto px-6 pt-32 pb-16 max-w-4xl">
          {/* Centered Layout */}
          <div className="flex flex-col items-center space-y-8">
            {/* Image - Centered and optimized */}
            <div className="w-full max-w-2xl">
              <img
                src={artwork.imageDetail}
                alt={artwork.title}
                loading="lazy"
                decoding="async"
                className="w-full h-auto object-contain"
              />
            </div>

            {/* Minimal Text Info - Centered */}
            <div className="text-center space-y-2 max-w-xl">
              <p className="text-lg leading-relaxed whitespace-pre-line">
                {artwork.title}, {artwork.year}
                {"\n"}{artwork.materials}
                {"\n"}{artwork.dimensions}
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default ArtworkDetail;
