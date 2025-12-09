import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Edit, Trash2, GripVertical, ZoomIn } from "lucide-react";
import { SortableImageItemProps } from "./types";

export const SortableImageItem = ({ image, onEdit, onDelete, onPreview }: SortableImageItemProps) => {
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
    <div ref={setNodeRef} style={style} className="mb-3">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
              <GripVertical className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="relative group cursor-pointer" onClick={onPreview}>
              <img
                src={image.image_url}
                alt={image.title || "Studio image"}
                className="w-20 h-20 object-cover rounded-md transition-opacity group-hover:opacity-75"
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <ZoomIn className="h-6 w-6 text-foreground drop-shadow-lg" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base">
                {image.title || "Untitled"}
              </h3>
              {image.description && (
                <p className="text-sm text-muted-foreground truncate">
                  {image.description}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={onEdit}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="destructive" size="icon" onClick={onDelete}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
