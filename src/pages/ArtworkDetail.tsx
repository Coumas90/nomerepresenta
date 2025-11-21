import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useArtwork } from "@/hooks/useArtworks";
import { useArtworkImages } from "@/hooks/useArtworkImages";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import ImageLightbox from "@/components/ImageLightbox";

const ArtworkDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: artwork, isLoading, error } = useArtwork(id);
  const { data: images } = useArtworkImages(artwork?.id);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleImageClick = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading artwork...</p>
      </main>
    );
  }

  if (error || !artwork) {
    return (
      <main className="min-h-screen bg-background">
        <div className="fixed top-6 right-6 z-50 animate-fade-in">
          <Button 
            onClick={() => navigate("/works")} 
            variant="ghost" 
            className="uppercase tracking-wider text-sm cursor-pointer hover:scale-105 transition-transform duration-200"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            BACK
          </Button>
        </div>
        <div className="container mx-auto px-6 py-16 pt-24">
          <h1 className="text-4xl font-bold mb-8">Artwork not found</h1>
        </div>
      </main>
    );
  }
  return (
    <main className="min-h-screen bg-background">
      <div className="fixed top-6 right-6 z-50 animate-fade-in">
        <Button 
          onClick={() => navigate("/works")} 
          variant="ghost" 
          className="uppercase tracking-wider text-sm cursor-pointer hover:scale-105 transition-transform duration-200"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          BACK
        </Button>
      </div>

      <div className="container mx-auto px-8 lg:px-16 pt-24 pb-24 max-w-7xl">
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
                      {images.map((image, index) => (
                        <CarouselItem key={image.id}>
                          <div 
                            className="cursor-zoom-in group relative"
                            onClick={() => handleImageClick(index)}
                          >
                            <img
                              src={image.image_url}
                              alt={artwork.title}
                              loading="lazy"
                              decoding="async"
                              className="w-full h-auto object-contain transition-transform duration-300 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                              <span className="text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/50 px-4 py-2 rounded-full">
                                Click to zoom
                              </span>
                            </div>
                          </div>
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
                  <div 
                    className="cursor-zoom-in group relative"
                    onClick={() => handleImageClick(0)}
                  >
                    <img
                      src={artwork.image_url}
                      alt={artwork.title}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-auto object-contain transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                      <span className="text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/50 px-4 py-2 rounded-full">
                        Click to zoom
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Lightbox */}
        {images && images.length > 0 ? (
          <ImageLightbox
            images={images}
            currentIndex={lightboxIndex}
            open={lightboxOpen}
            onOpenChange={setLightboxOpen}
            altText={artwork.title}
          />
        ) : (
          <ImageLightbox
            images={[{ id: artwork.id, image_url: artwork.image_url }]}
            currentIndex={0}
            open={lightboxOpen}
            onOpenChange={setLightboxOpen}
            altText={artwork.title}
          />
        )}
      </main>
    );
};

export default ArtworkDetail;