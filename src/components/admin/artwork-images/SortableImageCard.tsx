import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, GripVertical, Star } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import ImageCaptionEditor from "./ImageCaptionEditor";
import type { ArtworkImage } from "@/types";

interface SortableImageCardProps {
  image: ArtworkImage;
  index: number;
  onDelete: (id: string) => void;
  onSetMain: (id: string) => void;
  onCaptionChange: (id: string, caption: string | null) => void;
}

const SortableImageCard = ({ image, index, onDelete, onSetMain, onCaptionChange }: SortableImageCardProps) => {
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
    cursor: isDragging ? 'grabbing' : 'grab',
  };

  const imageLabel = index === 0 ? "PRINCIPAL" : `IMAGEN ${index + 1}`;

  return (
    <Card 
      ref={setNodeRef} 
      style={style} 
      className="relative group overflow-hidden hover:ring-2 hover:ring-primary/50 transition-all"
      {...attributes} 
      {...listeners}
    >
      <div className="absolute top-2 left-2 z-10 pointer-events-none">
        <div className="bg-background/90 p-1.5 rounded shadow-sm">
          <GripVertical className="h-4 w-4 text-primary" />
        </div>
      </div>
      {isDragging && (
        <div className="absolute inset-0 bg-primary/10 border-2 border-primary border-dashed rounded-lg" />
      )}
      <img
        src={image.image_url}
        alt={`Artwork image ${index + 1}`}
        className="w-full h-40 object-cover pointer-events-none"
      />
      <div 
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1"
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          type="button"
          variant={image.is_main ? "default" : "secondary"}
          size="icon"
          className="h-8 w-8 pointer-events-auto"
          onClick={(e) => {
            e.stopPropagation();
            onSetMain(image.id);
          }}
          title="Marcar como principal"
        >
          <Star className={`h-4 w-4 ${image.is_main ? 'fill-current' : ''}`} />
        </Button>
        <Button
          type="button"
          variant="destructive"
          size="icon"
          className="h-8 w-8 pointer-events-auto"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(image.id);
          }}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      {image.is_main && (
        <div className="absolute bottom-[calc(100%-40px-0.5rem)] left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded z-10 pointer-events-none hidden">
          Principal
        </div>
      )}
      <div className="absolute bottom-2 right-2 bg-background/80 text-xs px-2 py-1 rounded pointer-events-none z-10">
        #{image.display_order}
      </div>
      {/* Caption editor */}
      <div onClick={(e) => e.stopPropagation()} onPointerDown={(e) => e.stopPropagation()}>
        <ImageCaptionEditor
          image={image}
          imageLabel={imageLabel}
          onCaptionChange={onCaptionChange}
        />
      </div>
    </Card>
  );
};

export default SortableImageCard;
