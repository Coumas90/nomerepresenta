import { useState, useMemo } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, GripVertical } from "lucide-react";
import type { ArtworkImage } from "@/types";

interface SortableImageThumbProps {
  image: ArtworkImage;
  index: number;
  isHidden: boolean;
  onToggleVisibility: () => void;
}

const SortableImageThumb = ({ image, index, isHidden, onToggleVisibility }: SortableImageThumbProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : isHidden ? 0.3 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group flex-shrink-0 ${isHidden ? "ring-1 ring-dashed ring-muted-foreground/30 rounded" : ""}`}
    >
      <div
        {...attributes}
        {...listeners}
        className="absolute top-0.5 left-0.5 bg-background/80 rounded p-0.5 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing z-10"
      >
        <GripVertical className="h-3 w-3 text-muted-foreground" />
      </div>
      <img
        src={image.image_url}
        alt={image.title || `Image ${index + 1}`}
        className="w-20 h-20 object-cover rounded border border-border"
        loading="lazy"
      />
      <div className="absolute bottom-0 left-0 right-0 flex gap-0.5 p-0.5">
        {image.is_main && (
          <Badge variant="secondary" className="text-[8px] px-1 py-0 h-4 bg-background/80">
            Main
          </Badge>
        )}
        {image.is_detail && (
          <Badge variant="default" className="text-[8px] px-1 py-0 h-4">
            Detail
          </Badge>
        )}
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleVisibility();
        }}
        className="absolute top-0.5 right-0.5 bg-background/80 rounded p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
        title={isHidden ? "Show in this pricelist" : "Hide from this pricelist"}
      >
        {isHidden ? (
          <EyeOff className="h-3 w-3 text-muted-foreground" />
        ) : (
          <Eye className="h-3 w-3 text-foreground" />
        )}
      </button>
    </div>
  );
};

interface SortableImageGalleryProps {
  images: ArtworkImage[];
  artworkId: string;
  pricelistItemId: string;
  imageOverrides?: { hidden_images?: string[]; image_order?: string[] } | null;
  onOverridesChange: (overrides: { hidden_images: string[]; image_order: string[] }) => void;
}

const SortableImageGallery = ({ images, artworkId, pricelistItemId, imageOverrides, onOverridesChange }: SortableImageGalleryProps) => {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const hiddenSet = useMemo(
    () => new Set(imageOverrides?.hidden_images || []),
    [imageOverrides?.hidden_images]
  );

  // Apply custom order if it exists
  const orderedImages = useMemo(() => {
    const order = imageOverrides?.image_order;
    if (!order || order.length === 0) return images;

    const imageMap = new Map(images.map((img) => [img.id, img]));
    const ordered: typeof images = [];
    for (const id of order) {
      const img = imageMap.get(id);
      if (img) {
        ordered.push(img);
        imageMap.delete(id);
      }
    }
    for (const img of imageMap.values()) {
      ordered.push(img);
    }
    return ordered;
  }, [images, imageOverrides?.image_order]);

  const visibleCount = orderedImages.filter((img) => !hiddenSet.has(img.id)).length;
  const hiddenCount = orderedImages.length - visibleCount;

  const saveOverrides = (newHidden: string[], newOrder: string[]) => {
    onOverridesChange({ hidden_images: newHidden, image_order: newOrder });
  };

  const toggleVisibility = (imageId: string) => {
    const newHidden = hiddenSet.has(imageId)
      ? [...hiddenSet].filter((id) => id !== imageId)
      : [...hiddenSet, imageId];
    saveOverrides(newHidden, orderedImages.map((img) => img.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = orderedImages.findIndex((img) => img.id === active.id);
    const newIndex = orderedImages.findIndex((img) => img.id === over.id);
    const reordered = arrayMove(orderedImages, oldIndex, newIndex);
    saveOverrides([...hiddenSet], reordered.map((img) => img.id));
  };

  return (
    <div className="mt-3 pt-3 border-t border-border">
      <p className="text-xs text-muted-foreground mb-2">
        {visibleCount} image{visibleCount !== 1 ? "s" : ""}
        {hiddenCount > 0 ? ` · ${hiddenCount} hidden in this pricelist` : ""}
        {" · drag to reorder"}
      </p>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={orderedImages.map((img) => img.id)} strategy={horizontalListSortingStrategy}>
          <div className="flex flex-wrap gap-2">
            {orderedImages.map((img, idx) => (
              <SortableImageThumb
                key={img.id}
                image={img}
                index={idx}
                isHidden={hiddenSet.has(img.id)}
                onToggleVisibility={() => toggleVisibility(img.id)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default SortableImageGallery;
