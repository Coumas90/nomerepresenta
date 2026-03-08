import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useArtworks } from "@/hooks/useArtworks";
import { useSeries } from "@/hooks/useSeries";
import {
  usePricelistItems,
  useAddPricelistItem,
  useDeletePricelistItem,
  useUpdatePricelistItem,
  useReorderPricelist,
  useUpdatePricelist,
  type Pricelist,
  type PricelistCurrency,
} from "@/hooks/usePricelist";
import { PricelistSortableItem } from "./PricelistSortableItem";
import { PricelistAddDialog } from "./PricelistAddDialog";

interface PricelistEditorProps {
  pricelist: Pricelist;
}

export const PricelistEditor = ({ pricelist }: PricelistEditorProps) => {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const activeCurrency = (pricelist.active_currency || "USD") as PricelistCurrency;
  const { data: items = [] } = usePricelistItems(pricelist.id);
  const { data: artworks = [] } = useArtworks();
  const { data: series = [] } = useSeries();
  const addItem = useAddPricelistItem();
  const deleteItem = useDeletePricelistItem();
  const updateItem = useUpdatePricelistItem();
  const reorder = useReorderPricelist();
  const updatePricelist = useUpdatePricelist();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const seriesMap = new Map(series.map((s) => [s.id, s.name]));

  const existingArtworkIds = new Set(items.map((i) => i.artwork_id));
  const availableArtworks = artworks.filter((a) => !existingArtworkIds.has(a.id));

  const handleAdd = (artworkIds: string[]) => {
    artworkIds.forEach((artworkId, idx) => {
      addItem.mutate({
        pricelist_id: pricelist.id,
        artwork_id: artworkId,
        price: "",
        display_order: items.length + idx,
      });
    });
    setShowAddDialog(false);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    const newOrder = arrayMove(items, oldIndex, newIndex);

    reorder.mutate({
      pricelistId: pricelist.id,
      items: newOrder.map((item, idx) => ({ id: item.id, display_order: idx })),
    });
  };

  const handlePriceChange = (id: string, prices: { price_usd?: string; price_eur?: string; price_brl?: string }) => {
    updateItem.mutate({ id, pricelistId: pricelist.id, updates: prices });
  };

  const handleToggleVisibility = (id: string, isVisible: boolean) => {
    updateItem.mutate({ id, pricelistId: pricelist.id, updates: { is_visible: isVisible } });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Add existing artworks to this pricelist and set their prices.
        </p>
        <Button onClick={() => setShowAddDialog(true)} disabled={availableArtworks.length === 0}>
          <Plus className="mr-2 h-4 w-4" />
          Add Artwork
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Items ({items.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {items.length > 0 ? (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
                {items.map((item) => (
                  <PricelistSortableItem
                    key={item.id}
                    item={item}
                    seriesName={seriesMap.get(item.artwork?.series_id || "") || ""}
                    onDelete={() => deleteItem.mutate({ id: item.id, pricelistId: pricelist.id })}
                    onPriceChange={(price) => handlePriceChange(item.id, price)}
                    onToggleVisibility={(visible) => handleToggleVisibility(item.id, visible)}
                  />
                ))}
              </SortableContext>
            </DndContext>
          ) : (
            <p className="text-center py-8 text-muted-foreground">
              No items yet. Add artworks to this pricelist.
            </p>
          )}
        </CardContent>
      </Card>

      <PricelistAddDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        artworks={availableArtworks}
        seriesMap={seriesMap}
        onAdd={handleAdd}
      />
    </div>
  );
};
