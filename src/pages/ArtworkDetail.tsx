import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { artworks } from "@/data/artworks";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import ImageGallery from "@/components/artwork/ImageGallery";
import ImageZoomModal from "@/components/artwork/ImageZoomModal";

const ArtworkDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const artwork = artworks.find((art) => art.id === Number(id));
  const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);

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

        <div className="container mx-auto px-6 pt-32 pb-16 max-w-5xl">
          {/* Title Section - Centered */}
          <div className="text-center mb-12">
            <h1 className="text-5xl lg:text-6xl font-bold tracking-tight uppercase mb-3">
              {artwork.title}
            </h1>
            <p className="text-xl text-muted-foreground uppercase tracking-wide">
              {artwork.category}
            </p>
          </div>

          {/* Image Gallery - Centered */}
          <div className="mb-16">
            <ImageGallery
              images={artwork.images}
              artworkTitle={artwork.title}
              onImageClick={() => setIsZoomModalOpen(true)}
            />
          </div>

          {/* Technical Information - Centered Grid */}
          <div className="max-w-3xl mx-auto mb-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Year
                </h2>
                <p className="text-lg">{artwork.year}</p>
              </div>

              <div className="space-y-2">
                <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Dimensions
                </h2>
                <p className="text-lg whitespace-pre-line">
                  {artwork.title}, {artwork.year}
                  {"\n"}{artwork.materials}
                  {"\n"}{artwork.dimensions}
                </p>
              </div>

              <div className="space-y-2">
                <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Technique
                </h2>
                <p className="text-lg">{artwork.technique}</p>
              </div>

              <div className="space-y-2">
                <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Materials
                </h2>
                <p className="text-lg">{artwork.materials}</p>
              </div>
            </div>
          </div>

          {/* Description - Centered */}
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
              About this work
            </h2>
            <p className="text-base leading-relaxed text-muted-foreground">
              {artwork.description}
            </p>
          </div>
        </div>
      </main>

      {/* Zoom Modal */}
      <ImageZoomModal
        images={artwork.images}
        artworkTitle={artwork.title}
        isOpen={isZoomModalOpen}
        onClose={() => setIsZoomModalOpen(false)}
      />
    </>
  );
};

export default ArtworkDetail;
