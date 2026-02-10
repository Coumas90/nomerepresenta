import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Undo2 } from "lucide-react";
import { ProgressiveImage } from "@/components/ProgressiveImage";
import { SwipeGestureContainer } from "@/components/SwipeGestureContainer";
import { useBioSettings } from "@/hooks/useBioSettings";

const BioHeroImage = () => {
  const { data: settings } = useBioSettings();
  const imageUrl = settings?.bio_hero_image || "/images/bio-hero.jpeg";
  
  return (
    <ProgressiveImage
      src={imageUrl}
      alt="Ivan Comas - Artist"
      className="aspect-[16/9] md:aspect-[21/9] w-full"
      blurUp
      eager
    />
  );
};
const Bio = () => {
  const navigate = useNavigate();
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsPageLoaded(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = useCallback(() => {
    navigate("/");
  }, [navigate]);

  // Check if scrolled to top for swipe-to-close
  const isAtTop = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return true;
    return container.scrollTop < 50;
  }, []);

  const handleSwipeClose = useCallback(() => {
    if (isAtTop()) {
      handleClose();
    }
  }, [isAtTop, handleClose]);

  return (
    <SwipeGestureContainer
      onSwipeRight={handleSwipeClose}
      enabled
      direction="horizontal"
      className="min-h-screen"
    >
      <div 
        ref={scrollContainerRef}
        className={`min-h-screen bg-stone-50 transition-opacity duration-500 overflow-y-auto ${isPageLoaded ? 'opacity-100' : 'opacity-0'}`}
      >
      {/* Header — matches Works & Studio */}
      <header className="sticky top-0 z-50 bg-stone-100/95 backdrop-blur-sm border-b border-stone-200">
        <div className="flex items-center justify-between px-4 py-3 md:px-6 md:py-4">
          <span className="text-stone-700 font-bold text-sm md:text-base uppercase tracking-widest flex-shrink-0">
            BIO
          </span>
          <button
            onClick={handleClose}
            className="flex-shrink-0 ml-4 text-stone-900 hover:text-stone-600 transition-colors text-lg md:text-xl font-light"
            aria-label="Close and return to landing"
          >
            <Undo2 className="w-5 h-5 md:w-6 md:h-6" strokeWidth={1.5} />
          </button>
        </div>
      </header>

      <main className="pb-16">
        {/* Artist Photo */}
        <div className={`w-full mb-12 md:mb-16 overflow-hidden transition-all duration-700 delay-100 ${isPageLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <BioHeroImage />
        </div>

        <div className="container mx-auto px-6 md:px-8 max-w-4xl">
          {/* Artist Name & Info */}
          <div className={`mb-12 md:mb-16 transition-all duration-700 delay-200 ${isPageLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6">
              Ivan Comas
            </h1>
            <p className="text-stone-500 text-sm md:text-base mb-8">
              b. 1987, Buenos Aires
            </p>
            <div className="space-y-4 text-stone-700 text-base md:text-lg leading-relaxed">
              <p>
                Ivan Comas is a Franco-Argentine artist working between São Paulo and Paris. His practice evolves through layered procedures that merge industrial materials, fragmented text, and the visual residue of dense urban environments. Comas builds stratified surfaces through cycles of inscription, burial, and rupture, developing a material language shaped by years of movement between major cities and long periods of photographic and observational research.
              </p>
              <p>
                Educated at the École des Beaux-Arts de Paris, Comas has developed a body of work that intersects painting, photography, and writing, forming a coherent investigation into memory, architecture, and the rhythm of collapsing structures. His work has been exhibited in Los Angeles, Berlin, Paris, and São Paulo, and is held in private collections in Latin America, Europe, and the United States, including the Jumex and Vergez & Pearson collections.
              </p>
            </div>
          </div>

          {/* Education */}
          <section className={`mb-12 md:mb-16 transition-all duration-700 delay-300 ${isPageLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <h2 className="text-lg md:text-xl font-bold tracking-wide uppercase mb-6 text-stone-900">
              Education
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-[100px_1fr] md:grid-cols-[120px_1fr] gap-4">
                <span className="text-stone-500 text-sm">2007-2012</span>
                <div className="text-sm md:text-base">
                  <span className="font-medium text-stone-900">MFA</span>
                  <span className="text-stone-600">, École Nationale Supérieure des Beaux Arts de Paris</span>
                </div>
              </div>
              <div className="grid grid-cols-[100px_1fr] md:grid-cols-[120px_1fr] gap-4">
                <span className="text-stone-500 text-sm">2011</span>
                <div className="text-sm md:text-base">
                  <span className="font-medium text-stone-900">Exchange program</span>
                  <span className="text-stone-600">, Cooper Union, New York</span>
                </div>
              </div>
            </div>
          </section>

          {/* Solo and Two Person Exhibitions */}
          <section className={`mb-12 md:mb-16 transition-all duration-700 delay-[400ms] ${isPageLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <h2 className="text-lg md:text-xl font-bold tracking-wide uppercase mb-6 text-stone-900">
              Solo and Two Person Exhibitions
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-[100px_1fr] md:grid-cols-[120px_1fr] gap-4">
                <span className="text-stone-500 text-sm">2024</span>
                <div className="text-sm md:text-base">
                  <span className="font-medium text-stone-900">Metronomo</span>
                  <span className="text-stone-600">, Instituto Alto, São Paulo</span>
                </div>
              </div>
              <div className="grid grid-cols-[100px_1fr] md:grid-cols-[120px_1fr] gap-4">
                <span className="text-stone-500 text-sm">2019</span>
                <div className="text-sm md:text-base">
                  <span className="font-medium text-stone-900">A hole in the wall</span>
                  <span className="text-stone-600">, Espacio Abierto, CDMX</span>
                </div>
              </div>
              <div className="grid grid-cols-[100px_1fr] md:grid-cols-[120px_1fr] gap-4">
                <span className="text-stone-500 text-sm">2016</span>
                <div className="text-sm md:text-base">
                  <span className="font-medium text-stone-900">After Sonora</span>
                  <span className="text-stone-600">, Steve Turner, Los Angeles</span>
                </div>
              </div>
              <div className="grid grid-cols-[100px_1fr] md:grid-cols-[120px_1fr] gap-4">
                <span className="text-stone-500 text-sm">2015</span>
                <div className="space-y-2 text-sm md:text-base">
                  <div>
                    <span className="font-medium text-stone-900">Days go by</span>
                    <span className="text-stone-600">, Duve, Berlin</span>
                  </div>
                  <div>
                    <span className="font-medium text-stone-900">Art Berlin Contemporary, ABC</span>
                    <span className="text-stone-600"> (with Steve Turner), Berlin</span>
                  </div>
                  <div>
                    <span className="font-medium text-stone-900">Ivan Comas and Joaquín Boz, ArtBo</span>
                    <span className="text-stone-600">, Bogotá (with Steve Turner)</span>
                  </div>
                  <div>
                    <span className="font-medium text-stone-900">La Brea</span>
                    <span className="text-stone-600">, Steve Turner, Los Angeles</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-[100px_1fr] md:grid-cols-[120px_1fr] gap-4">
                <span className="text-stone-500 text-sm">2014</span>
                <div className="text-sm md:text-base">
                  <span className="font-medium text-stone-900">Recent Works</span>
                  <span className="text-stone-600">, Vergez Collection, Buenos Aires</span>
                </div>
              </div>
            </div>
          </section>

          {/* Selected Group Exhibitions */}
          <section className={`mb-12 md:mb-16 transition-all duration-700 delay-500 ${isPageLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <h2 className="text-lg md:text-xl font-bold tracking-wide uppercase mb-6 text-stone-900">
              Selected Group Exhibitions
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-[100px_1fr] md:grid-cols-[120px_1fr] gap-4">
                <span className="text-stone-500 text-sm">2018</span>
                <div className="text-sm md:text-base">
                  <span className="font-medium text-stone-900">Sun Kiss Choked</span>
                  <span className="text-stone-600">, Y53, Los Angeles</span>
                </div>
              </div>
              <div className="grid grid-cols-[100px_1fr] md:grid-cols-[120px_1fr] gap-4">
                <span className="text-stone-500 text-sm">2017</span>
                <div className="text-sm md:text-base">
                  <span className="font-medium text-stone-900">Monet is my church</span>
                  <span className="text-stone-600">, Dittrich & Schlectriem, Berlin</span>
                </div>
              </div>
              <div className="grid grid-cols-[100px_1fr] md:grid-cols-[120px_1fr] gap-4">
                <span className="text-stone-500 text-sm">2015</span>
                <div className="text-sm md:text-base">
                  <span className="font-medium text-stone-900">UNTITLED</span>
                  <span className="text-stone-600"> (with Steve Turner), Miami Beach</span>
                </div>
              </div>
            </div>
          </section>

          {/* Contact */}
          <section className={`pt-8 border-t border-stone-200 transition-all duration-700 delay-[600ms] ${isPageLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <a 
              href="mailto:contact@ivancomas.com"
              className="text-stone-900 hover:text-stone-600 transition-colors text-sm tracking-widest uppercase"
            >
              contact@ivancomas.com
            </a>
        </section>
        </div>
      </main>
      </div>
    </SwipeGestureContainer>
  );
};

export default Bio;
