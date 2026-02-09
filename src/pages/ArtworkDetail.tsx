import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { useArtwork } from "@/hooks/useArtworks";
import { useArtworkImages } from "@/hooks/useArtworkImages";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, CarouselApi } from "@/components/ui/carousel";
import { HoverNavigationCarousel } from "@/components/artwork/HoverNavigationCarousel";
import { ArtworkStructuredData } from "@/components/seo/ArtworkStructuredData";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useArtworkCursorTracking } from "@/hooks/useArtworkCursorTracking";
const ArtworkDetail = () => {
  const {
    id
  } = useParams();
  const navigate = useNavigate();
  const {
    trackPageView,
    trackArtworkView,
    endArtworkView
  } = useAnalytics();
  const {
    data: artwork,
    isLoading,
    error
  } = useArtwork(id);
  const {
    data: images
  } = useArtworkImages(artwork?.id);
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const viewIdRef = useRef<string | null>(null);
  const startTimeRef = useRef<Date>(new Date());

  // Cursor tracking for heatmap
  const {
    registerImageElement
  } = useArtworkCursorTracking(artwork?.id || '', !!artwork // Only track when artwork is loaded
  );
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Track artwork view
  useEffect(() => {
    if (!artwork) return;
    const initTracking = async () => {
      startTimeRef.current = new Date();
      const viewId = await trackArtworkView(artwork.id, artwork.series_id, {
        clickedDetail: true
      });
      viewIdRef.current = viewId || null;
    };
    initTracking();
    trackPageView(`/artwork/${artwork.id}`, `Artwork - ${artwork.title}`);

    // Cleanup: record duration when leaving
    return () => {
      if (viewIdRef.current) {
        const duration = Math.floor((new Date().getTime() - startTimeRef.current.getTime()) / 1000);
        endArtworkView(viewIdRef.current, duration);
      }
    };
  }, [artwork, trackPageView, trackArtworkView, endArtworkView]);
  useEffect(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);
  if (isLoading) {
    return <main className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading artwork...</p>
      </main>;
  }
  if (error || !artwork) {
    return <main className="min-h-screen bg-background">
        <div className="fixed top-6 right-6 z-50 animate-fade-in">
        <Button onClick={() => navigate("/")} variant="ghost" className="uppercase tracking-wider text-sm cursor-pointer hover:scale-105 transition-transform duration-200">
            <ArrowLeft className="mr-2 h-4 w-4" />
            BACK
          </Button>
        </div>
        <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 pt-24">
          <h1 className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-8">Artwork not found</h1>
        </div>
      </main>;
  }
  return <main className="min-h-screen bg-background">
      <ArtworkStructuredData name={artwork.title} description={artwork.description} image={artwork.image_url} creator="Ivan Comas" dateCreated={artwork.year} artMedium={artwork.materials} artform={artwork.technique} width={artwork.dimensions.split('x')[0]?.trim()} height={artwork.dimensions.split('x')[1]?.trim()} url={`https://ivancomas.lovable.app/artwork/${artwork.id}`} />
      <div className="fixed top-6 right-6 z-50 animate-fade-in">
        <Button onClick={() => navigate("/")} variant="ghost" className="uppercase tracking-wider text-sm cursor-pointer hover:scale-105 transition-transform duration-200">
          <ArrowLeft className="mr-2 h-4 w-4" />
          BACK
        </Button>
      </div>

      <div className="container mx-auto px-4 sm:px-6 min-h-screen flex items-center">
        {/* Mobile: Stack vertical */}
        <div className="lg:hidden flex flex-col gap-8">
          <div className="w-full">
            {images && images.length > 0 ? <Carousel className="w-full" setApi={setApi}>
                <CarouselContent>
                  {images.map((image, index) => {
                const shouldLoad = Math.abs(index - current) <= 1;
                return <CarouselItem key={image.id}>
                        {shouldLoad ? <img src={image.image_url} alt={artwork.title} loading={index === 0 ? "eager" : "lazy"} decoding="async" ref={index === current ? registerImageElement : undefined} className="w-full h-auto object-contain transition-opacity duration-300" /> : <div className="w-full aspect-square bg-muted animate-pulse" />}
                      </CarouselItem>;
              })}
                </CarouselContent>
                {images.length > 1 && <>
                    <CarouselPrevious className="left-2" />
                    <CarouselNext className="right-2" />
                  </>}
              </Carousel> : <img src={artwork.image_url} alt={artwork.title} loading="eager" decoding="async" ref={registerImageElement} className="w-full h-auto object-contain" />}
          </div>
          
          <div className="text-center space-y-2">
            <h1 className="text-xl sm:text-2xl font-bold uppercase tracking-wide">
              {artwork.title}
            </h1>
            <p className="text-xs sm:text-sm uppercase tracking-wider font-medium">
              {artwork.year}
            </p>
            <div className="text-xs uppercase tracking-wider space-y-0.5">
              <p>{artwork.materials}</p>
              <p>{artwork.dimensions}</p>
            </div>
          </div>
        </div>

        {/* Desktop: Gallery layout */}
        <div className="hidden lg:grid place-items-center w-full">
          <div className="grid grid-cols-[1fr_auto] items-end gap-[60px]">
            {/* Contenedor de la imagen */}
            <div className="relative max-w-[60vw]" style={{ maxHeight: '90vh' }}>
              {images && images.length > 0 ? <HoverNavigationCarousel images={images} artwork={artwork} currentIndex={current} onIndexChange={setCurrent} registerImageRef={registerImageElement} /> : <img src={artwork.image_url} alt={artwork.title} loading="eager" decoding="async" ref={registerImageElement} className="w-full h-auto max-h-[90vh] object-contain" />}
            </div>

            {/* Info del artwork */}
            <div className="text-left space-y-1">
              <h1 className="font-bold uppercase tracking-wide text-sm">
                {artwork.title}
              </h1>
              <p className="text-xs uppercase tracking-wider font-normal">
                {artwork.year}
              </p>
              <div className="text-xs uppercase tracking-wider space-y-0.5 font-medium">
                <p className="text-xs font-normal">{artwork.materials}</p>
                <p className="text-xs font-normal font-sans">{artwork.dimensions}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>;
};
export default ArtworkDetail;