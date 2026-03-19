import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, GripVertical, Image, Images, ChevronDown, ChevronUp, Eye, EyeOff } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { WorksImageGallery } from "@/components/admin/works/WorksImageGallery";
import CarouselPreview from "./CarouselPreview";
import type { WorksBlockWithItems, BlockType } from "@/hooks/useWorksBlocks";
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

// Sortable block artwork item
const SortableBlockArtwork = ({
  item,
  onRemove,
}: {
  item: WorksBlockWithItems["items"][0];
  onRemove: () => void;
}) => {
  const [imagesExpanded, setImagesExpanded] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const isArtworkHidden = item.artwork?.is_visible === false;
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : isArtworkHidden ? 0.45 : 1 };

  return (
    <div ref={setNodeRef} style={style} className={`bg-muted/30 rounded-md mb-1 ${isArtworkHidden ? "border border-dashed border-muted-foreground/30" : ""}`}>
      <div className="flex items-center gap-2 p-2">
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
        <img
          src={item.artwork?.image_url || ""}
          alt={item.artwork?.title || ""}
          className="w-32 h-32 object-cover rounded"
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm truncate">
            {item.artwork?.title || "Unknown"}
            {isArtworkHidden && <span className="ml-1.5 text-[10px] text-muted-foreground font-normal">(hidden)</span>}
          </p>
          <div className="flex items-center gap-2">
            <p className="text-xs text-muted-foreground">{item.artwork?.year}</p>
            <button
              onClick={() => setImagesExpanded(!imagesExpanded)}
              className="flex items-center gap-0.5 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
            >
              {imagesExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              {imagesExpanded ? "Hide" : "Images"}
            </button>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onRemove}>
          <Trash2 className="h-3.5 w-3.5 text-destructive" />
        </Button>
      </div>
      {imagesExpanded && (
        <div className="px-3 pb-3 pt-1 border-t border-border/50">
          <WorksImageGallery
            artworkId={item.artwork_id}
            blockItemId={item.id}
            imageOverrides={item.image_overrides as any}
          />
        </div>
      )}
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
  onChangeType,
  onToggleHidden,
}: {
  block: WorksBlockWithItems;
  onDelete: () => void;
  onAddArtwork: (blockId: string) => void;
  onRemoveItem: (itemId: string) => void;
  onReorderItems: (blockId: string, items: { id: string; display_order: number }[]) => void;
  onChangeType: (blockId: string, type: BlockType) => void;
  onToggleHidden: (blockId: string, isHidden: boolean) => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  const isHidden = (block as any).is_hidden === true;

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

  return (
    <div ref={setNodeRef} style={style} className={`border rounded-lg p-3 mb-2 bg-background ${isHidden ? "opacity-50" : ""}`}>
      <div className="flex items-center gap-2 mb-2">
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
        {isCarousel ? (
          <Images className="h-4 w-4 text-muted-foreground" />
        ) : (
          <Image className="h-4 w-4 text-muted-foreground" />
        )}
        <Select
          value={block.block_type}
          onValueChange={(v) => onChangeType(block.id, v as BlockType)}
        >
          <SelectTrigger className="h-7 w-[110px] text-xs uppercase font-medium">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="single">Single</SelectItem>
            <SelectItem value="carousel">Multiple</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground">
          {block.items.length} artwork{block.items.length !== 1 ? "s" : ""}
        </span>
        <div className="flex-1" />
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => onToggleHidden(block.id, !isHidden)}
          title={isHidden ? "Show in public Works" : "Hide from public Works"}
        >
          {isHidden ? <EyeOff className="h-3.5 w-3.5 text-muted-foreground" /> : <Eye className="h-3.5 w-3.5 text-foreground" />}
        </Button>
        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => onAddArtwork(block.id)}>
          <Plus className="h-3 w-3 mr-1" />
          Add
        </Button>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onDelete}>
          <Trash2 className="h-3.5 w-3.5 text-destructive" />
        </Button>
      </div>

      {isCarousel ? (
        <CarouselPreview
          items={block.items}
          blockId={block.id}
          onRemoveItem={onRemoveItem}
          onReorderItems={onReorderItems}
        />
      ) : block.items.length > 0 ? (
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

export default SortableBlock;
