import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Trash2, ArrowRightLeft } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { StudioImage } from "@/types";

interface SeriesOption {
  id: string;
  name: string;
}

interface SortableThumbProps {
  image: StudioImage;
  index: number;
  onPreview: () => void;
  onDelete: () => void;
  seriesOptions?: SeriesOption[];
  currentSeriesId?: string;
  onMoveTo?: (imageId: string, targetSeriesId: string) => void;
}

export const SortableThumb = ({ image, index, onPreview, onDelete, seriesOptions, currentSeriesId, onMoveTo }: SortableThumbProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.id, data: { type: "image", seriesId: currentSeriesId } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const otherSeries = seriesOptions?.filter(s => s.id !== currentSeriesId) || [];

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

      {/* Action buttons on hover */}
      <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {/* Move to series */}
        {otherSeries.length > 0 && onMoveTo && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
                className="bg-foreground/70 text-background rounded-full p-0.5"
                aria-label="Move to series"
              >
                <ArrowRightLeft className="h-3 w-3" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[120px]">
              {otherSeries.map(s => (
                <DropdownMenuItem
                  key={s.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onMoveTo(image.id, s.id);
                  }}
                >
                  {s.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Delete */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          onPointerDown={(e) => e.stopPropagation()}
          className="bg-destructive/80 text-destructive-foreground rounded-full p-0.5"
          aria-label="Delete image"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
};
