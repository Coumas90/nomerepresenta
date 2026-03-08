import type { PricelistItemWithArtwork } from "@/hooks/usePricelist";

interface PricelistRowProps {
  item: PricelistItemWithArtwork;
  onClick: () => void;
}

export const PricelistRow = ({ item, onClick }: PricelistRowProps) => {
  const { artwork, price } = item;
  if (!artwork) return null;

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
      className="grid grid-cols-[150px_1fr_auto] md:grid-cols-[220px_1fr_auto] gap-8 md:gap-14 items-center py-8 md:py-10 border-b border-stone-300 cursor-pointer hover:bg-stone-200/30 transition-colors px-4 md:px-6"
    >
      {/* Thumbnail — object-contain to never crop */}
      <div className="bg-stone-200/50">
        <img
          src={artwork.image_url}
          alt={artwork.title}
          className="w-full h-auto object-contain"
          loading="lazy"
        />
      </div>

      {/* Info */}
      <div className="space-y-0.5">
        <p className="text-sm md:text-[15px] text-stone-800">
          {artwork.title}{artwork.year ? `, ${artwork.year}` : ""}
        </p>
        {artwork.materials && (
          <p className="text-xs md:text-sm text-stone-500 leading-relaxed">
            {artwork.materials}
          </p>
        )}
        {artwork.dimensions && (
          <p className="text-xs md:text-sm text-stone-500">
            {artwork.dimensions}
          </p>
        )}
      </div>

      {/* Price */}
      <div className="text-right self-center">
        <p className="text-sm md:text-[15px] text-stone-800 whitespace-nowrap">
          {price}
        </p>
      </div>
    </div>
  );
};
