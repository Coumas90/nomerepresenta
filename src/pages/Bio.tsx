import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Undo2 } from "lucide-react";
import { useAnalytics } from "@/hooks/useAnalytics";
import { ProgressiveImage } from "@/components/ProgressiveImage";
import { SwipeGestureContainer } from "@/components/SwipeGestureContainer";
import { useBioSettings } from "@/hooks/useBioSettings";
import { useBioCvEntries, type BioCvEntry } from "@/hooks/useBioCvEntries";

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

const CVEntryFromData = ({ entry }: { entry: BioCvEntry }) => (
  <CVEntry year={entry.year}>
    {entry.link ? (
      <a href={entry.link} target="_blank" rel="noopener noreferrer" className="font-medium text-stone-900 underline underline-offset-2 hover:text-stone-600 transition-colors">
        {entry.title}
      </a>
    ) : (
      <span className="font-medium text-stone-900">{entry.title}</span>
    )}
    {entry.venue && <span className="text-stone-600">{entry.venue}</span>}
  </CVEntry>
);

const CVSection = ({ title, entries, delay }: { title: string; entries: BioCvEntry[]; delay: string }) => {
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setIsPageLoaded(true), 50);
    return () => clearTimeout(timer);
  }, []);

  if (!entries.length) return null;

  // Group entries by year for multi-entry years
  const grouped: { year: string; items: BioCvEntry[] }[] = [];
  entries.forEach((entry) => {
    const last = grouped[grouped.length - 1];
    if (last && last.year === entry.year) {
      last.items.push(entry);
    } else {
      grouped.push({ year: entry.year, items: [entry] });
    }
  });

  return (
    <section className={`mb-12 md:mb-16 transition-all duration-700 ${delay} ${isPageLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
      <h2 className="text-lg md:text-xl font-bold tracking-wide uppercase mb-6 text-stone-900">
        {title}
      </h2>
      <div className="space-y-3">
        {grouped.map((group) =>
          group.items.length === 1 ? (
            <CVEntryFromData key={group.items[0].id} entry={group.items[0]} />
          ) : (
            <div key={group.year + group.items[0].id} className="grid grid-cols-[80px_1fr] md:grid-cols-[100px_1fr] gap-x-3 items-baseline">
              <span className="text-stone-500 text-sm">{group.year}</span>
              <div className="space-y-2 text-sm md:text-base">
                {group.items.map((entry) => (
                  <div key={entry.id}>
                    {entry.link ? (
                      <a href={entry.link} target="_blank" rel="noopener noreferrer" className="font-medium text-stone-900 underline underline-offset-2 hover:text-stone-600 transition-colors">
                        {entry.title}
                      </a>
                    ) : (
                      <span className="font-medium text-stone-900">{entry.title}</span>
                    )}
                    {entry.venue && <span className="text-stone-600">{entry.venue}</span>}
                  </div>
                ))}
              </div>
            </div>
          )
        )}
      </div>
    </section>
  );
};

const Bio = () => {
  const navigate = useNavigate();
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const bottomSentinelRef = useRef<HTMLDivElement>(null);
  const hasTrackedScrollComplete = useRef(false);
  const hasTrackedContactClick = useRef(false);
  const { data: settings } = useBioSettings();
  const { data: cvEntries } = useBioCvEntries();
  const { trackUserEvent } = useAnalytics();

  const bioText = settings?.bio_text || "";

  const educationEntries = (cvEntries || []).filter((e) => e.section === "education");
  const soloEntries = (cvEntries || []).filter((e) => e.section === "solo_exhibitions");
  const groupEntries = (cvEntries || []).filter((e) => e.section === "group_exhibitions");

  useEffect(() => {
    const timer = setTimeout(() => setIsPageLoaded(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // Track scroll completion (user read the whole bio)
  useEffect(() => {
    const sentinel = bottomSentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasTrackedScrollComplete.current) {
          hasTrackedScrollComplete.current = true;
          trackUserEvent('bio_scroll_complete');
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [trackUserEvent]);

  const handleContactClick = useCallback(() => {
    if (!hasTrackedContactClick.current) {
      hasTrackedContactClick.current = true;
      trackUserEvent('contact_click', { source: 'bio' });
    }
  }, [trackUserEvent]);

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
      {/* Header */}
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
        <div className={`w-full md:mb-16 overflow-hidden transition-all duration-700 delay-100 ${isPageLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <BioHeroImage />
        </div>

        <div className="mx-auto px-6 pt-7 md:px-8 md:pt-8 max-w-3xl">
          {/* Artist Name & Info */}
          <div className={`mb-12 md:mb-16 transition-all duration-700 delay-200 ${isPageLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-1 md:mb-[15px]">
              Ivan Comas
            </h1>
            <p className="text-stone-500 text-sm md:text-base mb-1">
              Franco-Argentine
            </p>
            <p className="text-stone-500 text-sm md:text-base mb-8">
              São Paulo / Paris
            </p>
            {bioText && (
              <div className="space-y-4 text-stone-700 text-base md:text-lg leading-relaxed md:text-justify">
                {bioText.split("\n\n").map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            )}
          </div>

          {/* CV Sections */}
          <CVSection title="Education" entries={educationEntries} delay="delay-300" />
          <CVSection title="Solo Exhibitions" entries={soloEntries} delay="delay-[400ms]" />
          <CVSection title="Group Exhibitions" entries={groupEntries} delay="delay-500" />

          {/* Contact */}
          <section className={`pt-8 border-t border-stone-200 transition-all duration-700 delay-[600ms] ${isPageLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <a 
              href="mailto:contact@ivancomas.studio"
              onClick={handleContactClick}
              className="text-stone-900 hover:text-stone-600 transition-colors text-sm tracking-widest uppercase"
            >
              contact@ivancomas.studio
            </a>
          </section>

          {/* Scroll completion sentinel */}
          <div ref={bottomSentinelRef} className="h-1" />
        </div>
      </main>
      </div>
    </SwipeGestureContainer>
  );
};

export default Bio;
