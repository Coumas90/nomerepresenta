import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Eye, EyeOff, GripVertical } from "lucide-react";
import type { ShowData } from "@/types/show";

interface SortableShowItemProps {
  show: ShowData;
  onEdit: (show: ShowData) => void;
  onDelete: (id: string) => void;
}

const SortableShowItem = ({ show, onEdit, onDelete }: SortableShowItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: show.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className="cursor-pointer hover:bg-muted/50 transition-colors"
      onClick={() => onEdit(show)}
    >
      <CardContent className="py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            className="cursor-grab active:cursor-grabbing touch-none text-muted-foreground hover:text-foreground"
            {...attributes}
            {...listeners}
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="h-4 w-4" />
          </button>
          {show.is_published ? (
            <Eye className="h-4 w-4 text-green-600" />
          ) : (
            <EyeOff className="h-4 w-4 text-muted-foreground" />
          )}
          <div>
            <p className="font-medium">{show.title}</p>
            <p className="text-xs text-muted-foreground">
              {show.year} · /{show.slug}
              {!show.is_published && " · Draft"}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            if (confirm("Delete this show?")) onDelete(show.id);
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default SortableShowItem;
