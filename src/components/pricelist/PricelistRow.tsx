import { useState, useCallback, useRef } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import type { ArtworkImage } from "@/types";
import type { PricelistItemWithArtwork, PricelistCurrency } from "@/hooks/usePricelist";

const CURRENCY_SYMBOLS: Record<PricelistCurrency, string> = {
  USD: "$",
  EUR: "€",
  BRL: "R$",
};

interface PricelistRowProps {
  item: PricelistItemWithArtwork;
  activeCurrency: PricelistCurrency;
  selected?: boolean;
  onSelect?: (id: string) => void;
  onViewImages: () => void;
  images?: ArtworkImage[];
}

export const PricelistRow = ({ item, activeCurrency, selected, onSelect, onViewImages, images = [] }: PricelistRowProps) => {
  const { artwork } = item;
  const isMobile = useIsMobile();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Swipe refs
  const swipeStart = useRef<{ x: number; y: number; time: number } | null>(null);
  const swipeLocked = useRef<"horizontal" | "vertical" | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Build images list
  const allImages = artwork && images.length > 0
    ? images.map(img => img.image_url)
    : artwork ? [artwork.image_url].filter(Boolean) : [];

  const hasMultiple = allImages.length > 1;
  const currentSrc = allImages[currentIndex] || artwork?.image_url || "";
  const priceMap: Record<PricelistCurrency, string> = {
    USD: item.price_usd,
    EUR: item.price_eur,
    BRL: item.price_brl,
  };

  const rawPrice = priceMap[activeCurrency] || item.price;
  const displayPrice = rawPrice
    ? `${CURRENCY_SYMBOLS[activeCurrency]} ${rawPrice}`
    : item.price || "";

  // Navigation
  const goNext = useCallback(() => {
    if (hasMultiple) setCurrentIndex(i => (i + 1) % allImages.length);
  }, [hasMultiple, allImages.length]);

  const goPrev = useCallback(() => {
    if (hasMultiple) setCurrentIndex(i => (i - 1 + allImages.length) % allImages.length);
  }, [hasMultiple, allImages.length]);

  // Touch handlers for mobile swipe
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!isMobile || !hasMultiple) return;
    const t = e.touches[0];
    swipeStart.current = { x: t.clientX, y: t.clientY, time: Date.now() };
    swipeLocked.current = null;
  }, [isMobile, hasMultiple]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!swipeStart.current) return;
    const t = e.touches[0];
    const dx = t.clientX - swipeStart.current.x;
    const dy = t.clientY - swipeStart.current.y;
    if (!swipeLocked.current && (Math.abs(dx) > 10 || Math.abs(dy) > 10)) {
      swipeLocked.current = Math.abs(dx) > Math.abs(dy) ? "horizontal" : "vertical";
    }
    if (swipeLocked.current === "horizontal") {
      e.preventDefault();
      e.stopPropagation();
    }
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!swipeStart.current || swipeLocked.current !== "horizontal") {
      swipeStart.current = null;
      return;
    }
    const t = e.changedTouches[0];
    const dx = t.clientX - swipeStart.current.x;
    const elapsed = Date.now() - swipeStart.current.time;
    const velocity = Math.abs(dx) / elapsed;
    if (Math.abs(dx) > 40 || (velocity > 0.4 && Math.abs(dx) > 15)) {
      if (dx < 0) goNext();
      else goPrev();
    }
    swipeStart.current = null;
    swipeLocked.current = null;
  }, [goNext, goPrev]);

  const handleClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    // On desktop, clicking thumbnail opens fullscreen viewer
    if (!isMobile && target.closest('[data-thumbnail]')) {
      onViewImages();
      return;
    }
    // On mobile, tapping the image area is handled by tap zones — don't select
    if (isMobile && target.closest('[data-thumbnail]')) return;
    onSelect?.(item.artwork_id);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect?.(item.artwork_id);
        }
      }}
      className={`
        py-5 md:py-10 border-b border-stone-300/60 cursor-pointer transition-all duration-300 px-4 md:px-6
        ${selected ? "bg-stone-200/40" : "hover:bg-stone-200/10"}
      `}
    >
      {/* Mobile: stacked layout with inline carousel */}
      <div className="md:hidden print:hidden">
        <div
          ref={containerRef}
          className="relative select-none"
          data-thumbnail
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <img
            src={currentSrc}
            alt={artwork.title}
            className="w-full h-auto object-contain"
            loading="lazy"
            draggable={false}
          />
          {/* Tap zones for navigation */}
          {hasMultiple && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); goPrev(); }}
                className="absolute left-0 top-0 bottom-0 w-[30%] z-20 focus:outline-none"
                aria-label="Previous image"
              />
              <button
                onClick={(e) => { e.stopPropagation(); goNext(); }}
                className="absolute right-0 top-0 bottom-0 w-[30%] z-20 focus:outline-none"
                aria-label="Next image"
              />
            </>
          )}
        </div>

        {/* Dots indicator */}
        {hasMultiple && (
          <div className="mt-2 flex gap-1.5">
            {allImages.map((_, index) => (
              <button
                key={index}
                onClick={(e) => { e.stopPropagation(); setCurrentIndex(index); }}
                className={cn(
                  "w-1.5 h-1.5 rounded-full transition-all duration-300",
                  index === currentIndex ? "bg-stone-900" : "bg-stone-400"
                )}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Info below image */}
        <div className="mt-3 space-y-0.5">
          <div className="flex items-center gap-2">
            <p className="text-[13px] text-stone-800">
              {artwork.title}{artwork.year ? `, ${artwork.year}` : ""}
            </p>
            <div className={`transition-all duration-300 shrink-0 ${selected ? "opacity-100 scale-100" : "opacity-0 scale-75"}`}>
              <Check className="w-4 h-4 text-stone-600" strokeWidth={2.5} />
            </div>
          </div>
          {artwork.materials && (
            <p className="text-xs text-stone-500 leading-relaxed">
              {artwork.materials}
            </p>
          )}
          {artwork.dimensions && (
            <p className="text-xs text-stone-500">
              {artwork.dimensions}
            </p>
          )}
          <p className="text-[13px] text-stone-800 pt-1">
            {displayPrice}
          </p>
        </div>
      </div>

      {/* Desktop grid layout (also used for print) */}
      <div className="hidden md:grid print:!grid grid-cols-[220px_1fr_auto] gap-20 items-center">
        <div className="bg-stone-200/50 relative" data-thumbnail>
          <img
            src={artwork.image_url}
            alt={artwork.title}
            className="w-full h-auto object-contain"
            loading="lazy"
          />
        </div>
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <p className="text-[15px] text-stone-800">
              {artwork.title}{artwork.year ? `, ${artwork.year}` : ""}
            </p>
            <div className={`transition-all duration-300 ${selected ? "opacity-100 scale-100" : "opacity-0 scale-75"}`}>
              <Check className="w-4 h-4 text-stone-600" strokeWidth={2.5} />
            </div>
          </div>
          {artwork.materials && (
            <p className="text-sm text-stone-500 leading-relaxed">
              {artwork.materials}
            </p>
          )}
          {artwork.dimensions && (
            <p className="text-sm text-stone-500">
              {artwork.dimensions}
            </p>
          )}
        </div>
        <div className="text-right self-center">
          <p className="text-[15px] text-stone-800 whitespace-nowrap">
            {displayPrice}
          </p>
        </div>
      </div>
    </div>
  );
};
