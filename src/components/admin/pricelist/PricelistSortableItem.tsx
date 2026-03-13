import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { GripVertical, Trash2, Check, ChevronDown, ChevronUp } from "lucide-react";
import { useArtworkImages } from "@/hooks/useArtworkImages";
import type { PricelistItemWithArtwork, PricelistCurrency } from "@/hooks/usePricelist";
import SortableImageGallery from "./SortableImageGallery";

const CURRENCY_LABELS: Record<PricelistCurrency, string> = {
  USD: "$",
  EUR: "€",
  BRL: "R$",
};

export type ThumbSize = "sm" | "md" | "lg";

const THUMB_SIZES: Record<ThumbSize, string> = {
  sm: "w-14 h-14",
  md: "w-24 h-24",
  lg: "w-36 h-36",
};

interface PricelistSortableItemProps {
  item: PricelistItemWithArtwork;
  seriesName: string;
  activeCurrency: PricelistCurrency;
  thumbSize: ThumbSize;
  onDelete: () => void;
  onPriceChange: (prices: { price_usd?: string; price_eur?: string; price_brl?: string }) => void;
  onToggleVisibility: (visible: boolean) => void;
}

export const PricelistSortableItem = ({
  item,
  seriesName,
  activeCurrency,
  thumbSize,
  onDelete,
  onPriceChange,
  onToggleVisibility,
}: PricelistSortableItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const currencyKey = activeCurrency.toLowerCase() as "usd" | "eur" | "brl";
  const currentValue = item[`price_${currencyKey}`] || "";
  const [priceValue, setPriceValue] = useState(currentValue);
  const toggleVisibility = useToggleCatalogVisibility();

  // Fetch all images for this artwork (only when expanded)
  const { data: artworkImages } = useArtworkImages(expanded ? item.artwork_id : undefined);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : item.is_visible ? 1 : 0.5,
  };

  const startEditing = () => {
    setPriceValue(currentValue);
    setIsEditing(true);
  };

  const handleSavePrice = () => {
    onPriceChange({ [`price_${currencyKey}`]: priceValue });
    setIsEditing(false);
  };

  const displayPrice = currentValue
    ? `${CURRENCY_LABELS[activeCurrency]} ${currentValue}`
    : "—";

  const imageCount = artworkImages?.length || 0;
  const detailCount = artworkImages?.filter(img => img.is_detail).length || 0;

  return (
    <div ref={setNodeRef} style={style} className="mb-2 border rounded-lg p-3">
      <div className="flex items-center gap-3">
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </div>

        <img
          src={item.artwork?.image_url || ""}
          alt={item.artwork?.title || ""}
          className={`${THUMB_SIZES[thumbSize]} object-cover rounded`}
        />

        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{item.artwork?.title}</p>
          <p className="text-xs text-muted-foreground">{seriesName}</p>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground mt-0.5 transition-colors"
          >
            {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            {expanded ? "Hide images" : "Show images"}
          </button>
        </div>

        <div className="flex items-center gap-3">
          {/* Price in active currency */}
          <div className="text-center min-w-[80px]">
            {isEditing ? (
              <div className="flex items-center gap-0.5">
                <span className="text-xs text-muted-foreground">{CURRENCY_LABELS[activeCurrency]}</span>
                <Input
                  value={priceValue}
                  onChange={(e) => setPriceValue(e.target.value)}
                  className="w-24 h-7 text-xs"
                  onKeyDown={(e) => e.key === "Enter" && handleSavePrice()}
                  autoFocus
                />
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleSavePrice}>
                  <Check className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <button
                onClick={startEditing}
                className="text-sm font-medium px-2 py-1 rounded hover:bg-muted transition-colors"
              >
                {displayPrice}
              </button>
            )}
          </div>

          <Switch
            checked={item.is_visible}
            onCheckedChange={onToggleVisibility}
            aria-label="Toggle visibility"
          />

          <Button variant="destructive" size="icon" className="h-8 w-8" onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Expanded images gallery */}
      {expanded && artworkImages && (
        <div className="mt-3 pt-3 border-t border-border">
          <p className="text-xs text-muted-foreground mb-2">
            {imageCount} image{imageCount !== 1 ? "s" : ""}{detailCount > 0 ? ` (${detailCount} detail${detailCount !== 1 ? "s" : ""})` : ""}
          </p>
          <div className="flex flex-wrap gap-2">
            {artworkImages.map((img, idx) => {
              const isImgVisible = (img as any).is_catalog_visible !== false;
              return (
                <div key={img.id} className={`relative group ${!isImgVisible ? "opacity-40" : ""}`}>
                  <img
                    src={img.image_url}
                    alt={img.title || `Image ${idx + 1}`}
                    className="w-20 h-20 object-cover rounded border border-border"
                    loading="lazy"
                  />
                  <div className="absolute bottom-0 left-0 right-0 flex gap-0.5 p-0.5">
                    {img.is_main && (
                      <Badge variant="secondary" className="text-[8px] px-1 py-0 h-4 bg-background/80">
                        Main
                      </Badge>
                    )}
                    {img.is_detail && (
                      <Badge variant="default" className="text-[8px] px-1 py-0 h-4">
                        Detail
                      </Badge>
                    )}
                  </div>
                  <button
                    onClick={() =>
                      toggleVisibility.mutate({
                        imageId: img.id,
                        artworkId: item.artwork_id,
                        visible: !isImgVisible,
                      })
                    }
                    className="absolute top-0.5 right-0.5 bg-background/80 rounded p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    title={isImgVisible ? "Hide from catalog/pricelist" : "Show in catalog/pricelist"}
                  >
                    {isImgVisible ? (
                      <Eye className="h-3 w-3 text-foreground" />
                    ) : (
                      <EyeOff className="h-3 w-3 text-muted-foreground" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
