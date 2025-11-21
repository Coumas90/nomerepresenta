import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Header from "@/components/Header";
import { useArtwork } from "@/hooks/useArtworks";
import { useArtworkImages } from "@/hooks/useArtworkImages";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

const ArtworkDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: artwork, isLoading, error } = useArtwork(id);
  const { data: images } = useArtworkImages(artwork?.id);
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (isLoading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-background pt-20">
          <div className="container mx-auto px-6 py-16">
            <p className="text-muted-foreground">Loading artwork...</p>
          </div>
        </main>
      </>
    );
  }

  if (error || !artwork) {
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
  return <>
      <Header />
      <main className="min-h-screen bg-background">
        <div className="fixed top-20 right-6 z-50 pt-4">
          <Button onClick={() => navigate("/#works")} variant="ghost" className="uppercase tracking-wider text-sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            BACK
          </Button>
        </div>

        <div className="container mx-auto px-8 lg:px-16 pt-32 pb-24 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left Column - Text */}
            <div className="flex flex-col justify-center space-y-4 lg:pl-16 pt-12">
              <div>
                <h1 className="text-5xl font-bold tracking-tight uppercase mb-2 leading-tight lg:text-2xl text-left">
                  {artwork.title}
                </h1>
                <p className="text-base uppercase tracking-widest font-semibold">
                  {artwork.year}
                </p>
              </div>

              <div className="text-xs uppercase tracking-widest leading-loose space-y-0.5 font-medium">
                <p>{artwork.materials}</p>
                <p>{artwork.dimensions}</p>
              </div>
            </div>

            {/* Right Column - Image Gallery */}
            <div className="flex items-center justify-center lg:justify-start">
              <div className="w-full max-w-xl">
                {images && images.length > 0 ? (
                  <Carousel className="w-full">
                    <CarouselContent>
                      {images.map((image) => (
                        <CarouselItem key={image.id}>
                          <img
                            src={image.image_url}
                            alt={artwork.title}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-auto object-contain"
                          />
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    {images.length > 1 && (
                      <>
                        <CarouselPrevious className="left-2" />
                        <CarouselNext className="right-2" />
                      </>
                    )}
                  </Carousel>
                ) : (
                  <img
                    src={artwork.image_url}
                    alt={artwork.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-auto object-contain"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>;
};
export default ArtworkDetail;