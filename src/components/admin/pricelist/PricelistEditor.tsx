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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Plus } from "lucide-react";
import { useCatalogArtworks } from "@/hooks/useCatalog";
import { useSeries } from "@/hooks/useSeries";
import type { ArtworkData } from "@/types";
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
import { PricelistSortableItem, type ThumbSize } from "./PricelistSortableItem";
import { PricelistAddDialog } from "./PricelistAddDialog";

interface PricelistEditorProps {
  pricelist: Pricelist;
}

export const PricelistEditor = ({ pricelist }: PricelistEditorProps) => {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [thumbSize, setThumbSize] = useState<ThumbSize>("sm");
  const activeCurrency = (pricelist.active_currency || "USD") as PricelistCurrency;
  const { data: items = [] } = usePricelistItems(pricelist.id);
  const { data: catalogArtworks = [] } = useCatalogArtworks();
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
  const availableArtworks = catalogArtworks
    .filter((a) => !existingArtworkIds.has(a.id))
    .map((a) => ({
      id: a.id,
      title: a.title,
      year: a.year || "",
      dimensions: a.dimensions || "",
      materials: a.materials || "",
      description: "",
      image_url: a.image_url,
      image_detail_url: "",
      series_id: a.series_id,
      display_order: 0,
      is_visible: a.is_visible,
    } as ArtworkData));

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
        <div className="flex items-center gap-4">
          <p className="text-sm text-muted-foreground">
            Add existing artworks to this pricelist and set their prices.
          </p>
          <Select
            value={activeCurrency}
            onValueChange={(val) => updatePricelist.mutate({ id: pricelist.id, updates: { active_currency: val as PricelistCurrency } })}
          >
            <SelectTrigger className="h-8 w-24 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USD">USD</SelectItem>
              <SelectItem value="EUR">EUR</SelectItem>
              <SelectItem value="BRL">R$</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setShowAddDialog(true)} disabled={availableArtworks.length === 0}>
          <Plus className="mr-2 h-4 w-4" />
          Add Artwork
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <ToggleGroup
          type="single"
          value={thumbSize}
          onValueChange={(v) => v && setThumbSize(v as ThumbSize)}
          className="border rounded-md"
        >
          <ToggleGroupItem value="sm" className="text-xs px-2.5 h-7">S</ToggleGroupItem>
          <ToggleGroupItem value="md" className="text-xs px-2.5 h-7">M</ToggleGroupItem>
          <ToggleGroupItem value="lg" className="text-xs px-2.5 h-7">L</ToggleGroupItem>
        </ToggleGroup>
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
                    pricelistId={pricelist.id}
                    key={item.id}
                    item={item}
                    activeCurrency={activeCurrency}
                    thumbSize={thumbSize}
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
