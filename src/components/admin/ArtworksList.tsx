import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Edit, Trash2, GripVertical, Plus } from "lucide-react";
import { useArtworks, ArtworkData } from "@/hooks/useArtworks";
import { useSeries } from "@/hooks/useSeries";
import { useDeleteArtwork, useUpdateArtworksOrder } from "@/hooks/useArtworkMutations";
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
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface SortableArtworkItemProps {
  artwork: ArtworkData;
  onEdit: (artwork: ArtworkData) => void;
  onDelete: (id: string) => void;
}

const SortableArtworkItem = ({ artwork, onEdit, onDelete }: SortableArtworkItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: artwork.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg mb-2">
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </div>
      <img
        src={artwork.image_url}
        alt={artwork.title}
        className="w-12 h-12 object-cover rounded"
      />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{artwork.title}</p>
        <p className="text-xs text-muted-foreground">{artwork.year} • {artwork.dimensions}</p>
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => onEdit(artwork)}
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="destructive"
          size="icon"
          onClick={() => onDelete(artwork.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

interface ArtworksListProps {
  onEdit: (artwork: ArtworkData) => void;
  onCreateInSeries: (seriesId: string) => void;
}

const ArtworksList = ({ onEdit, onCreateInSeries }: ArtworksListProps) => {
  const { data: artworks = [], isLoading: artworksLoading } = useArtworks();
  const { data: series = [], isLoading: seriesLoading } = useSeries();
  const deleteMutation = useDeleteArtwork();
  const updateOrderMutation = useUpdateArtworksOrder();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [artworkToDelete, setArtworkToDelete] = useState<string | null>(null);
  const [activeSeries, setActiveSeries] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDeleteClick = (id: string) => {
    setArtworkToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (artworkToDelete) {
      await deleteMutation.mutateAsync(artworkToDelete);
      setDeleteDialogOpen(false);
      setArtworkToDelete(null);
    }
  };

  const handleDragEnd = (event: DragEndEvent, seriesId: string) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const seriesArtworks = artworks.filter(a => a.series_id === seriesId);
      const oldIndex = seriesArtworks.findIndex(a => a.id === active.id);
      const newIndex = seriesArtworks.findIndex(a => a.id === over.id);

      const newOrder = arrayMove(seriesArtworks, oldIndex, newIndex);
      const updates = newOrder.map((artwork, index) => ({
        id: artwork.id,
        display_order: index,
        series_id: seriesId,
      }));

      updateOrderMutation.mutate(updates);
    }
  };

  const getArtworksBySeries = (seriesId: string) => {
    return artworks
      .filter(a => a.series_id === seriesId)
      .sort((a, b) => a.display_order - b.display_order);
  };

  if (artworksLoading || seriesLoading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Artworks by Series</CardTitle>
        </CardHeader>
        <CardContent>
          {series.length > 0 ? (
            <Accordion type="single" collapsible value={activeSeries || undefined} onValueChange={setActiveSeries}>
              {series.map((s) => {
                const seriesArtworks = getArtworksBySeries(s.id);
                return (
                  <AccordionItem key={s.id} value={s.id}>
                    <AccordionTrigger className="text-base font-semibold">
                      {s.name} ({seriesArtworks.length})
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="mb-3">
                        <Button
                          onClick={() => onCreateInSeries(s.id)}
                          variant="outline"
                          className="w-full"
                          size="sm"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          New Artwork in {s.name}
                        </Button>
                      </div>
                      {seriesArtworks.length > 0 ? (
                        <DndContext
                          sensors={sensors}
                          collisionDetection={closestCenter}
                          onDragEnd={(e) => handleDragEnd(e, s.id)}
                        >
                          <SortableContext
                            items={seriesArtworks.map(a => a.id)}
                            strategy={verticalListSortingStrategy}
                          >
                            <div className="space-y-2">
                              {seriesArtworks.map((artwork) => (
                                <SortableArtworkItem
                                  key={artwork.id}
                                  artwork={artwork}
                                  onEdit={onEdit}
                                  onDelete={handleDeleteClick}
                                />
                              ))}
                            </div>
                          </SortableContext>
                        </DndContext>
                      ) : (
                        <div className="text-center py-6 text-muted-foreground text-sm">
                          No artworks in this series yet.
                        </div>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No series found. Create a series first in the Series tab.
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the artwork.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ArtworksList;
