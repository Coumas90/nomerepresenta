import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Trash2 } from "lucide-react";
import type { StudioImage } from "@/types";

interface SortableThumbProps {
  image: StudioImage;
  index: number;
  onPreview: () => void;
  onDelete: () => void;
}

export const SortableThumb = ({ image, index, onPreview, onDelete }: SortableThumbProps) => {
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
      className="relative aspect-[3/4] rounded-md overflow-hidden group cursor-grab active:cursor-grabbing"
      {...attributes}
      {...listeners}
    >
      <img
        src={image.image_url}
        alt={image.title || "Studio image"}
        className="w-full h-full object-cover"
        onClick={(e) => {
          e.stopPropagation();
          onPreview();
        }}
      />

      {/* Index badge */}
      <span className="absolute top-1 left-1 bg-foreground/70 text-background text-[10px] font-bold px-1.5 py-0.5 rounded">
        {index}
      </span>

      {/* Delete button on hover */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="absolute top-1 right-1 bg-destructive/80 text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Delete image"
      >
        <Trash2 className="h-3 w-3" />
      </button>
    </div>
  );
};
