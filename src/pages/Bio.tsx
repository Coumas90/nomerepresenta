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

const CVEntry = ({ year, children }: { year: string; children: React.ReactNode }) => (
  <div className="grid grid-cols-[80px_1fr] md:grid-cols-[100px_1fr] gap-x-3 items-baseline">
    <span className="text-stone-500 text-sm">{year}</span>
    <div className="text-sm md:text-base">{children}</div>
  </div>
);

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
      showEdgeIndicators={false}
      className="min-h-screen overflow-visible"
    >
      <div 
        ref={scrollContainerRef}
        className={`min-h-screen bg-stone-50 transition-opacity duration-500 ${isPageLoaded ? 'opacity-100' : 'opacity-0'}`}
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

        <div className="container mx-auto px-4 md:px-8 max-w-4xl">
          {/* Artist Name & Info */}
          <div className={`mb-12 md:mb-16 transition-all duration-700 delay-200 ${isPageLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-1">
              Ivan Comas
            </h1>
            <p className="text-stone-500 text-sm md:text-base mb-1">
              Franco-Argentine
            </p>
            <p className="text-stone-500 text-sm md:text-base mb-8">
              São Paulo / Paris
            </p>
            <div className="space-y-4 text-stone-700 text-base md:text-lg leading-relaxed">
              <p>
                Comas's practice develops through layered procedures that combine industrial materials, fragmented text, and the visual residue of dense urban environments. Through cycles of inscription, burial, and rupture, he builds stratified surfaces that translate prolonged exposure to cities into material structure.
              </p>
              <p>
                Educated at the École des Beaux-Arts de Paris, Comas works across painting, photography, and writing as a single investigative field focused on material systems, residual language, and stratified time. His work has been exhibited in Los Angeles, Berlin, Paris, and São Paulo, and is held in private collections in Latin America, Europe, and the United States, including the Colección Jumex and the Vergez &amp; Pearson collections.
              </p>
            </div>
          </div>

          {/* Education */}
          <section className={`mb-12 md:mb-16 transition-all duration-700 delay-300 ${isPageLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <h2 className="text-lg md:text-xl font-bold tracking-wide uppercase mb-6 text-stone-900">
              Education
            </h2>
            <div className="space-y-3">
              <CVEntry year="2007-2012">
                <span className="font-medium text-stone-900">MFA</span>
                <span className="text-stone-600">, École Nationale Supérieure des Beaux Arts de Paris</span>
              </CVEntry>
              <CVEntry year="2011">
                <span className="font-medium text-stone-900">Exchange program</span>
                <span className="text-stone-600">, Cooper Union, New York</span>
              </CVEntry>
            </div>
          </section>

          {/* Solo and Two Person Exhibitions */}
          <section className={`mb-12 md:mb-16 transition-all duration-700 delay-[400ms] ${isPageLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <h2 className="text-lg md:text-xl font-bold tracking-wide uppercase mb-6 text-stone-900">
              Solo and Two Person Exhibitions
            </h2>
            <div className="space-y-3">
              <CVEntry year="2024">
                <span className="font-medium text-stone-900">Metronomo</span>
                <span className="text-stone-600">, Instituto Alto, São Paulo</span>
              </CVEntry>
              <CVEntry year="2019">
                <span className="font-medium text-stone-900">A hole in the wall</span>
                <span className="text-stone-600">, Espacio Abierto, CDMX</span>
              </CVEntry>
              <CVEntry year="2016">
                <a href="http://steveturner.la/exhibition/ivan-comas-3#1" target="_blank" rel="noopener noreferrer" className="font-medium text-stone-900 underline underline-offset-2 hover:text-stone-600 transition-colors">After Sonora</a>
                <span className="text-stone-600">, Steve Turner, Los Angeles</span>
              </CVEntry>
              <div className="grid grid-cols-[80px_1fr] md:grid-cols-[100px_1fr] gap-x-3 items-baseline">
                <span className="text-stone-500 text-sm">2015</span>
                <div className="space-y-2 text-sm md:text-base">
                  <div>
                    <a href="https://www.duveberlin.com/exhibition/days-go-by" target="_blank" rel="noopener noreferrer" className="font-medium text-stone-900 underline underline-offset-2 hover:text-stone-600 transition-colors">Days go by</a>
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
                    <a href="http://steveturner.la/exhibition/ivan-comas#1" target="_blank" rel="noopener noreferrer" className="font-medium text-stone-900 underline underline-offset-2 hover:text-stone-600 transition-colors">La Brea</a>
                    <span className="text-stone-600">, Steve Turner, Los Angeles</span>
                  </div>
                </div>
              </div>
              <CVEntry year="2014">
                <span className="font-medium text-stone-900">Recent Works</span>
                <span className="text-stone-600">, Vergez Collection, Buenos Aires</span>
              </CVEntry>
            </div>
          </section>

          {/* Selected Group Exhibitions */}
          <section className={`mb-12 md:mb-16 transition-all duration-700 delay-500 ${isPageLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <h2 className="text-lg md:text-xl font-bold tracking-wide uppercase mb-6 text-stone-900">
              Selected Group Exhibitions
            </h2>
            <div className="space-y-3">
              <CVEntry year="2018">
                <span className="font-medium text-stone-900">Sun Kiss Choked</span>
                <span className="text-stone-600">, Y53, Los Angeles</span>
              </CVEntry>
              <CVEntry year="2017">
                <a href="https://dittrich-schlechtriem.com/monet-is-my-church/" target="_blank" rel="noopener noreferrer" className="font-medium text-stone-900 underline underline-offset-2 hover:text-stone-600 transition-colors">Monet is my church</a>
                <span className="text-stone-600">, Dittrich & Schlectriem, Berlin</span>
              </CVEntry>
              <CVEntry year="2015">
                <span className="font-medium text-stone-900">UNTITLED</span>
                <span className="text-stone-600"> (with Steve Turner), Miami Beach</span>
              </CVEntry>
            </div>
          </section>

          {/* Contact */}
          <section className={`pt-8 border-t border-stone-200 transition-all duration-700 delay-[600ms] ${isPageLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <a 
              href="mailto:contact@ivancomas.studio"
              className="text-stone-900 hover:text-stone-600 transition-colors text-sm tracking-widest uppercase"
            >
              contact@ivancomas.studio
            </a>
        </section>
        </div>
      </main>
      </div>
    </SwipeGestureContainer>
  );
};

export default Bio;
