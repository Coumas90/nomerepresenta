import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useArtwork } from "@/hooks/useArtworks";
import { useArtworkImages } from "@/hooks/useArtworkImages";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, CarouselApi } from "@/components/ui/carousel";

const ArtworkDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: artwork, isLoading, error } = useArtwork(id);
  const { data: images } = useArtworkImages(artwork?.id);
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!api) return;

    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

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
          onClick={() => navigate("/")} 
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
          onClick={() => navigate("/")} 
          variant="ghost" 
          className="uppercase tracking-wider text-sm cursor-pointer hover:scale-105 transition-transform duration-200"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          BACK
        </Button>
      </div>

      <div className="container mx-auto px-6 pt-24 pb-16">
        {/* Mobile: Stack vertical */}
        <div className="lg:hidden flex flex-col gap-8">
          <div className="w-full">
            {images && images.length > 0 ? (
              <Carousel className="w-full" setApi={setApi}>
                <CarouselContent>
                  {images.map((image, index) => {
                    const shouldLoad = Math.abs(index - current) <= 1;
                    
                    return (
                      <CarouselItem key={image.id}>
                        {shouldLoad ? (
                          <img
                            src={image.image_url}
                            alt={artwork.title}
                            loading={index === 0 ? "eager" : "lazy"}
                            decoding="async"
                            className="w-full h-auto object-contain transition-opacity duration-300"
                          />
                        ) : (
                          <div className="w-full aspect-square bg-muted animate-pulse" />
                        )}
                      </CarouselItem>
                    );
                  })}
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
                loading="eager"
                decoding="async"
                className="w-full h-auto object-contain"
              />
            )}
          </div>
          
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold uppercase tracking-wide">
              {artwork.title}
            </h1>
            <p className="text-sm uppercase tracking-wider font-medium">
              {artwork.year}
            </p>
            <div className="text-xs uppercase tracking-wider space-y-0.5">
              <p>{artwork.materials}</p>
              <p>{artwork.dimensions}</p>
            </div>
          </div>
        </div>

        {/* Desktop: Gallery layout con absolute positioning */}
        <div className="hidden lg:block relative min-h-[calc(100vh-140px)]">
          {/* Contenedor flex para centrar imagen */}
          <div className="flex items-center justify-center h-full">
            <div className="w-full max-w-[60vw]">
              {images && images.length > 0 ? (
                <Carousel className="w-full" setApi={setApi}>
                  <CarouselContent>
                    {images.map((image, index) => {
                      const shouldLoad = Math.abs(index - current) <= 1;
                      
                      return (
                        <CarouselItem key={image.id}>
                          {shouldLoad ? (
                            <img
                              src={image.image_url}
                              alt={artwork.title}
                              loading={index === 0 ? "eager" : "lazy"}
                              decoding="async"
                              className="w-full h-auto object-contain transition-opacity duration-300"
                            />
                          ) : (
                            <div className="w-full aspect-square bg-muted animate-pulse" />
                          )}
                        </CarouselItem>
                      );
                    })}
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
                  loading="eager"
                  decoding="async"
                  className="w-full h-auto object-contain"
                />
              )}
            </div>
          </div>

          {/* Info absolute bottom-right */}
          <div className="absolute bottom-12 right-16 text-right space-y-1">
            <h1 className="text-base font-bold uppercase tracking-wide">
              {artwork.title}
            </h1>
            <p className="text-xs uppercase tracking-wider font-medium">
              {artwork.year}
            </p>
            <div className="text-xs uppercase tracking-wider space-y-0.5 font-medium">
              <p>{artwork.materials}</p>
              <p>{artwork.dimensions}</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ArtworkDetail;