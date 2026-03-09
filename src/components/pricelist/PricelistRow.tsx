import { Check } from "lucide-react";
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
}

export const PricelistRow = ({ item, activeCurrency, selected, onSelect, onViewImages }: PricelistRowProps) => {
  const { artwork } = item;
  if (!artwork) return null;

  const priceMap: Record<PricelistCurrency, string> = {
    USD: item.price_usd,
    EUR: item.price_eur,
    BRL: item.price_brl,
  };

  const rawPrice = priceMap[activeCurrency] || item.price;
  const displayPrice = rawPrice
    ? `${CURRENCY_SYMBOLS[activeCurrency]} ${rawPrice}`
    : item.price || "";

  const handleClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('[data-thumbnail]')) {
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
      className={`
        py-5 md:py-10 border-b border-stone-300/60 cursor-pointer transition-all duration-300 px-4 md:px-6
        ${selected ? "bg-stone-200/40" : "hover:bg-stone-200/10"}
      `}
    >
      {/* Mobile: fully stacked layout (hidden in print — desktop grid used instead) */}
      <div className="md:hidden print:hidden">
        <div className="relative" data-thumbnail>
          <img
            src={artwork.image_url}
            alt={artwork.title}
            className="w-full h-auto object-contain"
            loading="lazy"
          />
        </div>
        <div className="mt-3 space-y-0.5">
          <div className="flex items-center gap-2">
            <p className="text-[13px] text-stone-800">
              {artwork.title}{artwork.year ? `, ${artwork.year}` : ""}
            </p>
            <div className={`transition-all duration-300 shrink-0 ${selected ? "opacity-100 scale-100" : "opacity-0 scale-75"}`}>
              <Check className="w-3 h-3 text-stone-500" strokeWidth={2.5} />
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
              <Check className="w-3.5 h-3.5 text-stone-500" strokeWidth={2.5} />
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
