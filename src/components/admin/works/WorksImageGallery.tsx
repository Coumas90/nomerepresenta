import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, GripVertical } from "lucide-react";
import { useArtworkImages } from "@/hooks/useArtworkImages";
import { useUpdateImageOverrides } from "@/hooks/useWorksBlocks";
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

interface WorksImageGalleryProps {
  artworkId: string;
  blockItemId: string;
  imageOverrides?: {
    hidden_images?: string[];
    image_order?: string[];
  } | null;
}

const SortableImageThumb = ({
  image,
  isHidden,
  onToggleVisibility,
}: {
  image: { id: string; image_url: string; title: string | null; is_main: boolean | null; is_detail: boolean; is_install?: boolean; is_catalog_visible?: boolean };
  isHidden: boolean;
  onToggleVisibility: () => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: image.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group ${isHidden ? "opacity-20 ring-1 ring-dashed ring-muted-foreground/30 rounded" : ""}`}
    >
      <div
        {...attributes}
        {...listeners}
        className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 cursor-grab active:cursor-grabbing z-10 bg-background/80 rounded px-0.5"
      >
        <GripVertical className="h-2.5 w-2.5 text-muted-foreground" />
      </div>
        <img
          src={image.image_url}
          alt={image.title || "Image"}
          className="w-28 h-28 object-cover rounded border border-border"
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
        {image.is_install && (
          <Badge variant="outline" className="text-[8px] px-1 py-0 h-4 bg-blue-600/80 text-white border-0">
            Install
          </Badge>
        )}
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleVisibility();
        }}
        className="absolute top-0.5 right-0.5 bg-background/80 rounded p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
        title={isHidden ? "Show in Works" : "Hide from Works"}
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

export const WorksImageGallery = ({ artworkId, blockItemId, imageOverrides }: WorksImageGalleryProps) => {
  const { data: images } = useArtworkImages(artworkId);
  const updateOverrides = useUpdateImageOverrides();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const hiddenSet = useMemo(
    () => new Set(imageOverrides?.hidden_images || []),
    [imageOverrides?.hidden_images]
  );

  // Apply custom order if it exists
  const orderedImages = useMemo(() => {
    if (!images) return [];
    const order = imageOverrides?.image_order;
    if (!order || order.length === 0) return images;

    const imageMap = new Map(images.map((img) => [img.id, img]));
    const ordered: typeof images = [];
    // First add images in the specified order
    for (const id of order) {
      const img = imageMap.get(id);
      if (img) {
        ordered.push(img);
        imageMap.delete(id);
      }
    }
    // Then add any remaining images not in the order
    for (const img of imageMap.values()) {
      ordered.push(img);
    }
    return ordered;
  }, [images, imageOverrides?.image_order]);

  const visibleCount = orderedImages.filter((img) => !hiddenSet.has(img.id) && (img as any).is_catalog_visible !== false).length;
  const hiddenCount = orderedImages.length - visibleCount;

  const saveOverrides = (newHidden: string[], newOrder: string[]) => {
    updateOverrides.mutate({
      blockItemId,
      overrides: {
        hidden_images: newHidden,
        image_order: newOrder,
      },
    });
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
    const oldIdx = orderedImages.findIndex((img) => img.id === active.id);
    const newIdx = orderedImages.findIndex((img) => img.id === over.id);
    const reordered = arrayMove(orderedImages, oldIdx, newIdx);
    saveOverrides([...hiddenSet], reordered.map((img) => img.id));
  };

  if (!images || images.length === 0) {
    return <p className="text-xs text-muted-foreground">No images</p>;
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <p className="text-xs text-muted-foreground">
          {visibleCount} image{visibleCount !== 1 ? "s" : ""}
          {hiddenCount > 0 && ` · ${hiddenCount} hidden in Works`}
        </p>
      </div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={orderedImages.map((img) => img.id)} strategy={horizontalListSortingStrategy}>
          <div className="flex flex-wrap gap-2">
            {orderedImages.map((img) => (
              <SortableImageThumb
                key={img.id}
                image={img}
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
