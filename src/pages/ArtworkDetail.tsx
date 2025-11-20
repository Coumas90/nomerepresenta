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
            variant="ghost"
            className="uppercase tracking-wider text-sm"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            BACK
          </Button>
        </div>

        <div className="container mx-auto px-8 lg:px-16 pt-32 pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
            {/* Left Column - Text */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <h1 className="text-4xl lg:text-5xl font-bold tracking-tight uppercase mb-3">
                  {artwork.title}
                </h1>
                <p className="text-sm uppercase tracking-wider text-muted-foreground">
                  {artwork.year}
                </p>
              </div>

              <div className="text-sm uppercase tracking-wide leading-relaxed space-y-1">
                <p>{artwork.materials}</p>
                <p>{artwork.dimensions}</p>
              </div>
            </div>

            {/* Right Column - Image */}
            <div className="lg:col-span-7 flex items-start justify-center">
              <div className="w-full max-w-2xl">
                <img
                  src={artwork.imageDetail}
                  alt={artwork.title}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-auto object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default ArtworkDetail;
