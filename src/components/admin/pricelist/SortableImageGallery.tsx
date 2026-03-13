import { useState } from "react";
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
import { useUpdateImageOrder } from "@/hooks/useArtworkImages";
import { useToggleCatalogVisibility } from "@/hooks/useToggleCatalogVisibility";
import type { ArtworkImage } from "@/types";

interface SortableImageThumbProps {
  image: ArtworkImage;
  index: number;
  artworkId: string;
}

const SortableImageThumb = ({ image, index, artworkId }: SortableImageThumbProps) => {
  const toggleVisibility = useToggleCatalogVisibility();
  const isImgVisible = (image as any).is_catalog_visible !== false;

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
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group flex-shrink-0 ${!isImgVisible ? "opacity-40" : ""}`}
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
        onClick={() =>
          toggleVisibility.mutate({
            imageId: image.id,
            artworkId,
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
};

interface SortableImageGalleryProps {
  images: ArtworkImage[];
  artworkId: string;
}

const SortableImageGallery = ({ images, artworkId }: SortableImageGalleryProps) => {
  const [localImages, setLocalImages] = useState(images);
  const updateOrder = useUpdateImageOrder();

  // Sync when images prop changes
  if (images.length !== localImages.length || images.some((img, i) => img.id !== localImages[i]?.id)) {
    setLocalImages(images);
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const imageCount = images.length;
  const detailCount = images.filter((img) => img.is_detail).length;

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = localImages.findIndex((img) => img.id === active.id);
    const newIndex = localImages.findIndex((img) => img.id === over.id);
    const reordered = arrayMove(localImages, oldIndex, newIndex);
    setLocalImages(reordered);

    updateOrder.mutate(
      reordered.map((img, idx) => ({
        id: img.id,
        display_order: idx,
        artwork_id: artworkId,
      }))
    );
  };

  return (
    <div className="mt-3 pt-3 border-t border-border">
      <p className="text-xs text-muted-foreground mb-2">
        {imageCount} image{imageCount !== 1 ? "s" : ""}
        {detailCount > 0 ? ` (${detailCount} detail${detailCount !== 1 ? "s" : ""})` : ""}
        {" · drag to reorder"}
      </p>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={localImages.map((img) => img.id)} strategy={horizontalListSortingStrategy}>
          <div className="flex flex-wrap gap-2">
            {localImages.map((img, idx) => (
              <SortableImageThumb
                key={img.id}
                image={img}
                index={idx}
                artworkId={artworkId}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default SortableImageGallery;
