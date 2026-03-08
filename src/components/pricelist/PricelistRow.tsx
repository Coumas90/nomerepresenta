import type { PricelistItemWithArtwork } from "@/hooks/usePricelist";

interface PricelistRowProps {
  item: PricelistItemWithArtwork;
  onClick: () => void;
}

export const PricelistRow = ({ item, onClick }: PricelistRowProps) => {
  const { artwork, price } = item;
  if (!artwork) return null;

  // Build materials string, wrapping at "and" like the reference
  const materialsText = artwork.materials || "";

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className="grid grid-cols-[100px_1fr_auto] md:grid-cols-[140px_1fr_auto] gap-4 md:gap-8 items-center py-6 md:py-8 border-b border-stone-300 cursor-pointer hover:bg-stone-200/40 transition-colors"
    >
      {/* Thumbnail */}
      <div className="aspect-[3/4] overflow-hidden bg-stone-200">
        <img
          src={artwork.image_url}
          alt={artwork.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      {/* Info */}
      <div className="space-y-0.5">
        <p className="text-sm md:text-base text-stone-800">
          {artwork.title}{artwork.year ? `, ${artwork.year}` : ""}
        </p>
        {materialsText && (
          <p className="text-xs md:text-sm text-stone-600 leading-relaxed">
            {materialsText}
          </p>
        )}
        {artwork.dimensions && (
          <p className="text-xs md:text-sm text-stone-600">
            {artwork.dimensions}
          </p>
        )}
      </div>

      {/* Price */}
      <div className="text-right">
        <p className="text-sm md:text-base text-stone-800 whitespace-nowrap">
          {price}
        </p>
      </div>
    </div>
  );
};
