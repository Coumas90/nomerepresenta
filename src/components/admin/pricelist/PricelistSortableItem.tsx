import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { GripVertical, Trash2, Check } from "lucide-react";
import type { PricelistItemWithArtwork } from "@/hooks/usePricelist";

interface PricelistSortableItemProps {
  item: PricelistItemWithArtwork;
  seriesName: string;
  onDelete: () => void;
  onPriceChange: (prices: { price_usd?: string; price_eur?: string; price_brl?: string }) => void;
  onToggleVisibility: (visible: boolean) => void;
}

export const PricelistSortableItem = ({
  item,
  seriesName,
  onDelete,
  onPriceChange,
  onToggleVisibility,
}: PricelistSortableItemProps) => {
  const [editingCurrency, setEditingCurrency] = useState<string | null>(null);
  const [priceValue, setPriceValue] = useState("");

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

  const startEditing = (currency: string, currentValue: string) => {
    setEditingCurrency(currency);
    setPriceValue(currentValue);
  };

  const handleSavePrice = () => {
    if (editingCurrency) {
      onPriceChange({ [`price_${editingCurrency}`]: priceValue });
      setEditingCurrency(null);
    }
  };

  const currencies = [
    { key: "usd", label: "USD", value: item.price_usd },
    { key: "eur", label: "EUR", value: item.price_eur },
    { key: "brl", label: "R$", value: item.price_brl },
  ];

  return (
    <div ref={setNodeRef} style={style} className="mb-2 border rounded-lg p-3">
      <div className="flex items-center gap-3">
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </div>

        <img
          src={item.artwork?.image_url || ""}
          alt={item.artwork?.title || ""}
          className="w-14 h-14 object-cover rounded"
        />

        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{item.artwork?.title}</p>
          <p className="text-xs text-muted-foreground">{seriesName}</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Currency prices */}
          <div className="flex items-center gap-2">
            {currencies.map((c) => (
              <div key={c.key} className="text-center">
                <span className="text-[10px] text-muted-foreground block">{c.label}</span>
                {editingCurrency === c.key ? (
                  <div className="flex items-center gap-0.5">
                    <Input
                      value={priceValue}
                      onChange={(e) => setPriceValue(e.target.value)}
                      className="w-20 h-6 text-xs"
                      onKeyDown={(e) => e.key === "Enter" && handleSavePrice()}
                      autoFocus
                    />
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleSavePrice}>
                      <Check className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <button
                    onClick={() => startEditing(c.key, c.value || "")}
                    className="text-xs font-medium px-1.5 py-0.5 rounded hover:bg-muted transition-colors min-w-[48px]"
                  >
                    {c.value || "—"}
                  </button>
                )}
              </div>
            ))}
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
    </div>
  );
};
