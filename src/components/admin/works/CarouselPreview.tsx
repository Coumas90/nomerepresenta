import { useState } from "react";
import { Button } from "@/components/ui/button";
import { GripVertical, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { CatalogImageGallery } from "@/components/admin/catalog/CatalogImageGallery";
import type { WorksBlockWithItems } from "@/hooks/useWorksBlocks";
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
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type BlockItem = WorksBlockWithItems["items"][0];

const SortableCarouselThumb = ({
  item,
  index,
  onRemove,
}: {
  item: BlockItem;
  index: number;
  onRemove: () => void;
}) => {
  const [showImages, setShowImages] = useState(false);
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div className="flex flex-col items-center">
      <div
        ref={setNodeRef}
        style={style}
        className="relative group flex flex-col items-center"
      >
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing w-full flex justify-center mb-1"
        >
          <GripVertical className="h-3 w-3 text-muted-foreground" />
        </div>
        <div className="relative">
          <img
            src={item.artwork?.image_url || ""}
            alt={item.artwork?.title || ""}
            className="w-24 h-24 object-cover rounded border border-border"
            loading="lazy"
          />
          <span className="absolute top-0.5 left-0.5 bg-background/80 text-[9px] font-medium px-1 rounded">
            {index + 1}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-0.5 right-0.5 h-5 w-5 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={onRemove}
          >
            <Trash2 className="h-3 w-3 text-destructive" />
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground mt-1 max-w-24 truncate text-center">
          {item.artwork?.title || "Unknown"}
        </p>
        <button
          onClick={() => setShowImages(!showImages)}
          className="flex items-center gap-0.5 text-[9px] text-muted-foreground hover:text-foreground transition-colors mt-0.5"
        >
          {showImages ? <ChevronUp className="h-2.5 w-2.5" /> : <ChevronDown className="h-2.5 w-2.5" />}
          {showImages ? "Hide" : "Images"}
        </button>
      </div>
      {showImages && (
        <div className="mt-2 p-2 bg-muted/30 rounded-md w-full min-w-[200px]">
          <CatalogImageGallery artworkId={item.artwork_id} />
        </div>
      )}
    </div>
  );
};

interface CarouselPreviewProps {
  items: BlockItem[];
  onRemoveItem: (itemId: string) => void;
  onReorderItems: (blockId: string, items: { id: string; display_order: number }[]) => void;
  blockId: string;
}

const CarouselPreview = ({ items, onRemoveItem, onReorderItems, blockId }: CarouselPreviewProps) => {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = items.findIndex((i) => i.id === active.id);
    const newIdx = items.findIndex((i) => i.id === over.id);
    const reordered = arrayMove(items, oldIdx, newIdx);
    onReorderItems(
      blockId,
      reordered.map((item, i) => ({ id: item.id, display_order: i }))
    );
  };

  if (items.length === 0) {
    return <p className="text-xs text-muted-foreground text-center py-3">No artworks in this carousel yet.</p>;
  }

  return (
    <div className="border-t border-border/50 pt-3 mt-1">
      <p className="text-[10px] text-muted-foreground mb-2 uppercase tracking-wide">Carousel order — drag to reorder</p>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map((i) => i.id)} strategy={horizontalListSortingStrategy}>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {items.map((item, idx) => (
              <SortableCarouselThumb
                key={item.id}
                item={item}
                index={idx}
                onRemove={() => onRemoveItem(item.id)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default CarouselPreview;
