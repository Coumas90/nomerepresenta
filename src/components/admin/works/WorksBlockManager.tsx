import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Trash2, GripVertical, Image, Images } from "lucide-react";
import { useSeries } from "@/hooks/useSeries";
import {
  useWorksBlocks,
  useCreateWorksBlock,
  useDeleteWorksBlock,
  useReorderWorksBlocks,
  useAddBlockItem,
  useRemoveBlockItem,
  useReorderBlockItems,
  type WorksBlockWithItems,
} from "@/hooks/useWorksBlocks";
import ArtworkPicker from "./ArtworkPicker";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Sortable block item (artwork within a block)
const SortableBlockArtwork = ({
  item,
  onRemove,
}: {
  item: WorksBlockWithItems["items"][0];
  onRemove: () => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-2 p-2 bg-muted/30 rounded-md mb-1">
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>
      <img
        src={item.artwork?.image_url || ""}
        alt={item.artwork?.title || ""}
        className="w-8 h-8 object-cover rounded"
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm truncate">{item.artwork?.title || "Unknown"}</p>
        <p className="text-xs text-muted-foreground">{item.artwork?.year}</p>
      </div>
      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onRemove}>
        <Trash2 className="h-3.5 w-3.5 text-destructive" />
      </Button>
    </div>
  );
};

// Sortable block card
const SortableBlock = ({
  block,
  onDelete,
  onAddArtwork,
  onRemoveItem,
  onReorderItems,
}: {
  block: WorksBlockWithItems;
  onDelete: () => void;
  onAddArtwork: (blockId: string) => void;
  onRemoveItem: (itemId: string) => void;
  onReorderItems: (blockId: string, items: { id: string; display_order: number }[]) => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleItemDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = block.items.findIndex((i) => i.id === active.id);
    const newIdx = block.items.findIndex((i) => i.id === over.id);
    const reordered = arrayMove(block.items, oldIdx, newIdx);
    onReorderItems(
      block.id,
      reordered.map((item, i) => ({ id: item.id, display_order: i }))
    );
  };

  const isCarousel = block.block_type === "carousel";
  const firstArtwork = block.items[0]?.artwork;

  return (
    <div ref={setNodeRef} style={style} className="border rounded-lg p-3 mb-2 bg-background">
      <div className="flex items-center gap-2 mb-2">
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
        {isCarousel ? (
          <Images className="h-4 w-4 text-muted-foreground" />
        ) : (
          <Image className="h-4 w-4 text-muted-foreground" />
        )}
        <span className="text-xs font-medium text-muted-foreground uppercase">
          {isCarousel ? "Carousel" : "Single"} · {block.items.length} artwork{block.items.length !== 1 ? "s" : ""}
        </span>
        <div className="flex-1" />
        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => onAddArtwork(block.id)}>
          <Plus className="h-3 w-3 mr-1" />
          Add
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onDelete}>
          <Trash2 className="h-3.5 w-3.5 text-destructive" />
        </Button>
      </div>

      {block.items.length > 0 ? (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleItemDragEnd}>
          <SortableContext items={block.items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
            {block.items.map((item) => (
              <SortableBlockArtwork key={item.id} item={item} onRemove={() => onRemoveItem(item.id)} />
            ))}
          </SortableContext>
        </DndContext>
      ) : (
        <p className="text-xs text-muted-foreground text-center py-3">No artworks in this block yet.</p>
      )}
    </div>
  );
};

const WorksBlockManager = () => {
  const { data: allBlocks = [], isLoading: blocksLoading } = useWorksBlocks();
  const { data: series = [], isLoading: seriesLoading } = useSeries();
  const createBlock = useCreateWorksBlock();
  const deleteBlock = useDeleteWorksBlock();
  const reorderBlocks = useReorderWorksBlocks();
  const addItem = useAddBlockItem();
  const removeItem = useRemoveBlockItem();
  const reorderItems = useReorderBlockItems();

  const [activeSeries, setActiveSeries] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<{ blockId: string; multiple: boolean } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  // Create a new block type picker
  const [newBlockSeries, setNewBlockSeries] = useState<string | null>(null);
  const [newBlockType, setNewBlockType] = useState<"single" | "carousel" | null>(null);

  const blocksBySeries = useMemo(() => {
    const map = new Map<string, WorksBlockWithItems[]>();
    for (const block of allBlocks) {
      const list = map.get(block.series_id) || [];
      list.push(block);
      map.set(block.series_id, list);
    }
    return map;
  }, [allBlocks]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const handleAddBlock = async (seriesId: string, type: "single" | "carousel") => {
    const seriesBlocks = blocksBySeries.get(seriesId) || [];
    const maxOrder = seriesBlocks.reduce((max, b) => Math.max(max, b.display_order), -1);
    const block = await createBlock.mutateAsync({
      series_id: seriesId,
      block_type: type,
      display_order: maxOrder + 1,
    });
    // Open picker immediately for the new block
    setPickerTarget({ blockId: block.id, multiple: type === "carousel" });
    setPickerOpen(true);
  };

  const handleAddArtwork = (blockId: string) => {
    const block = allBlocks.find((b) => b.id === blockId);
    const isCarousel = block?.block_type === "carousel";
    setPickerTarget({ blockId, multiple: isCarousel });
    setPickerOpen(true);
  };

  const handlePickerSelect = async (artworkIds: string[]) => {
    if (!pickerTarget) return;
    const block = allBlocks.find((b) => b.id === pickerTarget.blockId);
    const startOrder = block?.items.length || 0;
    for (let i = 0; i < artworkIds.length; i++) {
      await addItem.mutateAsync({
        block_id: pickerTarget.blockId,
        artwork_id: artworkIds[i],
        display_order: startOrder + i,
      });
    }
    // If a single block gets more than 1 item, convert to carousel
    if (block && block.block_type === "single" && block.items.length + artworkIds.length > 1) {
      // Auto-upgrade is handled by the admin; keep as-is for now
    }
  };

  const handleBlockDragEnd = (event: DragEndEvent, seriesId: string) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const blocks = blocksBySeries.get(seriesId) || [];
    const oldIdx = blocks.findIndex((b) => b.id === active.id);
    const newIdx = blocks.findIndex((b) => b.id === over.id);
    const reordered = arrayMove(blocks, oldIdx, newIdx);
    reorderBlocks.mutate(reordered.map((b, i) => ({ id: b.id, display_order: i })));
  };

  const handleReorderItems = (blockId: string, items: { id: string; display_order: number }[]) => {
    reorderItems.mutate(items);
  };

  // Get artwork IDs already used in the target block (for excluding in picker)
  const getExcludeIds = () => {
    if (!pickerTarget) return [];
    const block = allBlocks.find((b) => b.id === pickerTarget.blockId);
    return block?.items.map((i) => i.artwork_id) || [];
  };

  if (blocksLoading || seriesLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <>
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold">Works</h2>
          <p className="text-sm text-muted-foreground">
            Manage display blocks for the public Works page. Add single artworks or carousel blocks referencing your Catalog.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Blocks by Series</CardTitle>
          </CardHeader>
          <CardContent>
            {series.length > 0 ? (
              <Accordion type="single" collapsible value={activeSeries || undefined} onValueChange={setActiveSeries}>
                {series.map((s) => {
                  const blocks = blocksBySeries.get(s.id) || [];
                  return (
                    <AccordionItem key={s.id} value={s.id}>
                      <AccordionTrigger className="text-base font-semibold">
                        {s.name} ({blocks.length} block{blocks.length !== 1 ? "s" : ""})
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="flex gap-2 mb-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddBlock(s.id, "single")}
                            disabled={createBlock.isPending}
                          >
                            <Image className="h-3.5 w-3.5 mr-1.5" />
                            Single Block
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddBlock(s.id, "carousel")}
                            disabled={createBlock.isPending}
                          >
                            <Images className="h-3.5 w-3.5 mr-1.5" />
                            Carousel Block
                          </Button>
                        </div>

                        {blocks.length > 0 ? (
                          <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={(e) => handleBlockDragEnd(e, s.id)}
                          >
                            <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
                              {blocks.map((block) => (
                                <SortableBlock
                                  key={block.id}
                                  block={block}
                                  onDelete={() => setDeleteTarget(block.id)}
                                  onAddArtwork={handleAddArtwork}
                                  onRemoveItem={(itemId) => removeItem.mutate(itemId)}
                                  onReorderItems={handleReorderItems}
                                />
                              ))}
                            </SortableContext>
                          </DndContext>
                        ) : (
                          <p className="text-sm text-muted-foreground text-center py-6">
                            No blocks yet. Add a single or carousel block above.
                          </p>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            ) : (
              <p className="text-center py-8 text-muted-foreground">
                No series found. Create series first in Series (Works).
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Artwork Picker */}
      <ArtworkPicker
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        onSelect={handlePickerSelect}
        excludeIds={getExcludeIds()}
        multiple={pickerTarget?.multiple || false}
      />

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Block?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the block from the Works page. The artworks themselves will remain in the Catalog.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteTarget) deleteBlock.mutate(deleteTarget);
                setDeleteTarget(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default WorksBlockManager;
