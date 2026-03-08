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
import { Plus } from "lucide-react";
import { useArtworks } from "@/hooks/useArtworks";
import { useSeries } from "@/hooks/useSeries";
import {
  usePricelist,
  useAddPricelistItem,
  useDeletePricelistItem,
  useUpdatePricelistItem,
  useReorderPricelist,
} from "@/hooks/usePricelist";
import { PricelistSortableItem } from "./pricelist/PricelistSortableItem";
import { PricelistAddDialog } from "./pricelist/PricelistAddDialog";

const PricelistManager = () => {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const { data: items = [] } = usePricelist();
  const { data: artworks = [] } = useArtworks();
  const { data: series = [] } = useSeries();
  const addItem = useAddPricelistItem();
  const deleteItem = useDeletePricelistItem();
  const updateItem = useUpdatePricelistItem();
  const reorder = useReorderPricelist();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const seriesMap = new Map(series.map((s) => [s.id, s.name]));

  // Artworks not yet in pricelist
  const existingArtworkIds = new Set(items.map((i) => i.artwork_id));
  const availableArtworks = artworks.filter((a) => !existingArtworkIds.has(a.id));

  const handleAdd = (artworkId: string, price: string) => {
    addItem.mutate({
      artwork_id: artworkId,
      price,
      display_order: items.length,
    });
    setShowAddDialog(false);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    const newOrder = arrayMove(items, oldIndex, newIndex);

    reorder.mutate(
      newOrder.map((item, idx) => ({ id: item.id, display_order: idx }))
    );
  };

  const handlePriceChange = (id: string, price: string) => {
    updateItem.mutate({ id, updates: { price } });
  };

  const handleToggleVisibility = (id: string, isVisible: boolean) => {
    updateItem.mutate({ id, updates: { is_visible: isVisible } });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Pricelist</h2>
          <p className="text-sm text-muted-foreground">
            Manage which artworks appear in the pricelist and their prices.
          </p>
        </div>
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
                    onDelete={() => deleteItem.mutate(item.id)}
                    onPriceChange={(price) => handlePriceChange(item.id, price)}
                    onToggleVisibility={(visible) => handleToggleVisibility(item.id, visible)}
                  />
                ))}
              </SortableContext>
            </DndContext>
          ) : (
            <p className="text-center py-8 text-muted-foreground">
              No items yet. Add artworks to the pricelist.
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

export default PricelistManager;
