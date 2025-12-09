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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SortableImageItem } from "./SortableImageItem";
import { ImagesListProps } from "./types";

export const ImagesList = ({ images, onEdit, onDelete, onPreview, onReorder }: ImagesListProps) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = images.findIndex((img) => img.id === active.id);
      const newIndex = images.findIndex((img) => img.id === over.id);

      const newOrder = arrayMove(images, oldIndex, newIndex);
      const updates = newOrder.map((img, index) => ({
        id: img.id,
        display_order: index,
      }));

      onReorder(updates);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Studio Images ({images.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {images.length > 0 ? (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={images.map((img) => img.id)} strategy={verticalListSortingStrategy}>
              {images.map((image) => (
                <SortableImageItem
                  key={image.id}
                  image={image}
                  onEdit={() => onEdit(image)}
                  onDelete={() => onDelete(image.id)}
                  onPreview={() => onPreview(image)}
                />
              ))}
            </SortableContext>
          </DndContext>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No studio images yet. Add your first image above.
          </div>
        )}
      </CardContent>
    </Card>
  );
};
