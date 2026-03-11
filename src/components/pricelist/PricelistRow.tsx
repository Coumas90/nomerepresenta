import { Check, Plus } from "lucide-react";
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

  const priceMap: Record<PricelistCurrency, string> = {
    USD: item.price_usd,
    EUR: item.price_eur,
    BRL: item.price_brl,
  };

  const rawPrice = priceMap[activeCurrency] || item.price;
  const displayPrice = rawPrice
    ? `${CURRENCY_SYMBOLS[activeCurrency]} ${rawPrice}`
    : item.price || "";

  if (!artwork) return null;

  const handleClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    // On desktop, clicking thumbnail opens fullscreen viewer
    if (!isMobile && target.closest('[data-thumbnail]')) {
      onViewImages();
      return;
    }
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
      className={cn(
        "border-b border-stone-300/60 cursor-pointer transition-all duration-300",
        "py-10 px-4 md:py-10 md:px-6",
        selected ? "bg-stone-200/40" : "hover:bg-stone-200/10"
      )}
    >
      {/* Mobile: simple single-image layout */}
      <div className="md:hidden print:hidden relative">
        {/* Selection check — top right of card */}
        <div className={cn(
          "absolute top-0 right-0 z-10 transition-all duration-300",
          selected ? "opacity-100 scale-100" : "opacity-0 scale-75"
        )}>
          <Check className="w-4 h-4 text-stone-600" strokeWidth={2.5} />
        </div>

        <div className="max-w-[85vw] mx-auto">
          <img
            src={artwork.image_url}
            alt={artwork.title}
            className="w-full h-auto object-contain"
            loading="lazy"
            draggable={false}
          />
        </div>

        {/* Info below image — left-aligned with image */}
        <div className="max-w-[85vw] mx-auto mt-3 space-y-0.5">
          <p className="text-[10px] text-stone-600 tracking-wide">
            {artwork.title}{artwork.year ? `, ${artwork.year}` : ""}
          </p>
          {artwork.materials && (
            <p className="text-[9px] text-stone-400 leading-relaxed">
              {artwork.materials}
            </p>
          )}
          {artwork.dimensions && (
            <p className="text-[9px] text-stone-400">
              {artwork.dimensions}
            </p>
          )}
          <p className="text-[10px] text-stone-600 pt-0.5">
            {displayPrice}
          </p>
        </div>
      </div>

      {/* Desktop grid layout (also used for print) */}
      <div className="hidden md:grid print:!grid grid-cols-[220px_1fr_auto] gap-20 items-center">
        <div className="relative group cursor-pointer" data-thumbnail>
          <img
            src={artwork.image_url}
            alt={artwork.title}
            className="w-full h-auto object-contain"
            loading="lazy"
          />
          <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Plus className="w-5 h-5 text-stone-700" strokeWidth={1.5} />
          </div>
        </div>
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <p className="text-[15px] text-stone-800">
              {artwork.title}{artwork.year ? `, ${artwork.year}` : ""}
            </p>
            <div className={cn(
              "transition-all duration-300",
              selected ? "opacity-100 scale-100" : "opacity-0 scale-75"
            )}>
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
