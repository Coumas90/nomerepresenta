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

        <div className="container mx-auto px-6 pt-32 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Left Column - Text Content */}
            <div className="space-y-8">
              <div>
                <h1 className="text-5xl lg:text-6xl font-bold tracking-tight uppercase mb-2">
                  {artwork.title}
                </h1>
                <p className="text-xl text-muted-foreground uppercase tracking-wide">
                  {artwork.category}
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Year
                  </h2>
                  <p className="text-lg">{artwork.year}</p>
                </div>

                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Dimensions
                  </h2>
                  <p className="text-lg whitespace-pre-line">
                    {artwork.title}, {artwork.year}
                    {"\n"}{artwork.materials}
                    {"\n"}{artwork.dimensions}
                  </p>
                </div>

                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Technique
                  </h2>
                  <p className="text-lg">{artwork.technique}</p>
                </div>

                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Materials
                  </h2>
                  <p className="text-lg">{artwork.materials}</p>
                </div>

                <div className="pt-4">
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                    About this work
                  </h2>
                  <p className="text-base leading-relaxed">{artwork.description}</p>
                </div>
              </div>
            </div>

            {/* Right Column - Image */}
            <div className="lg:sticky lg:top-32 lg:h-fit">
              <div className="aspect-[4/5] bg-muted overflow-hidden">
                <img
                  src={artwork.imageDetail}
                  alt={artwork.title}
                  className="w-full h-full object-cover"
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
