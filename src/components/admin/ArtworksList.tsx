import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Edit, Trash2, GripVertical, Plus, ArrowDownNarrowWide } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useArtworks } from "@/hooks/useArtworks";
import type { ArtworkData } from "@/types";
import { useSeries } from "@/hooks/useSeries";
import { useDeleteArtwork, useUpdateArtworksOrder, useUpdateArtwork } from "@/hooks/useArtworkMutations";
import ArtworkPreviewDialog from "./ArtworkPreviewDialog";
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
  onPreview: (artwork: ArtworkData) => void;
  onToggleVisibility: (artwork: ArtworkData) => void;
}

const SortableArtworkItem = ({ artwork, onEdit, onDelete, onPreview, onToggleVisibility }: SortableArtworkItemProps) => {
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

  const isVisible = artwork.is_visible !== false;

  return (
    <div ref={setNodeRef} style={style} className={`flex items-center gap-3 p-3 bg-muted/50 rounded-lg mb-2 ${!isVisible ? "opacity-60" : ""}`}>
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </div>
      <button
        onClick={() => onPreview(artwork)}
        className="group/img relative"
      >
        <img
          src={artwork.image_url}
          alt={artwork.title}
          className="w-12 h-12 object-cover rounded transition-all duration-200 group-hover/img:ring-2 group-hover/img:ring-primary cursor-pointer"
        />
        <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/20 rounded transition-colors duration-200 flex items-center justify-center">
          <span className="text-white text-xs opacity-0 group-hover/img:opacity-100 transition-opacity duration-200">
            Preview
          </span>
        </div>
      </button>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{artwork.title}</p>
        <p className="text-xs text-muted-foreground">{artwork.year} • {artwork.dimensions}</p>
      </div>
      <div className="flex items-center gap-2">
        <Switch
          checked={isVisible}
          onCheckedChange={() => onToggleVisibility(artwork)}
          aria-label={isVisible ? "Hide artwork" : "Show artwork"}
        />
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
  const updateArtworkMutation = useUpdateArtwork();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [artworkToDelete, setArtworkToDelete] = useState<string | null>(null);
  const [activeSeries, setActiveSeries] = useState<string | null>(null);
  const [previewArtwork, setPreviewArtwork] = useState<ArtworkData | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

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

  const handlePreview = (artwork: ArtworkData) => {
    setPreviewArtwork(artwork);
    setPreviewOpen(true);
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

  const handleSortByYear = (seriesId: string, seriesArtworks: ArtworkData[]) => {
    const sorted = [...seriesArtworks].sort((a, b) => {
      const yearA = parseInt(a.year || "0", 10) || 0;
      const yearB = parseInt(b.year || "0", 10) || 0;
      return yearA - yearB;
    });
    const updates = sorted.map((artwork, index) => ({
      id: artwork.id,
      display_order: index,
      series_id: seriesId,
    }));
    updateOrderMutation.mutate(updates);
  };

  // Memoize artworks grouped by series to avoid recomputing on every render
  const artworksBySeries = useMemo(() => {
    const grouped: Record<string, ArtworkData[]> = {};
    artworks.forEach(artwork => {
      if (!grouped[artwork.series_id]) {
        grouped[artwork.series_id] = [];
      }
      grouped[artwork.series_id].push(artwork);
    });
    // Sort each group by display_order
    Object.keys(grouped).forEach(seriesId => {
      grouped[seriesId].sort((a, b) => a.display_order - b.display_order);
    });
    return grouped;
  }, [artworks]);

  const getArtworksBySeries = (seriesId: string) => {
    return artworksBySeries[seriesId] || [];
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
                      <div className="mb-3 flex gap-2">
                        <Button
                          onClick={() => onCreateInSeries(s.id)}
                          variant="outline"
                          className="flex-1"
                          size="sm"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          New Artwork in {s.name}
                        </Button>
                        {seriesArtworks.length > 1 && (
                          <Button
                            onClick={() => handleSortByYear(s.id, seriesArtworks)}
                            variant="outline"
                            size="sm"
                            title="Sort artworks by year"
                          >
                            <ArrowDownNarrowWide className="mr-2 h-4 w-4" />
                            Sort by Year
                          </Button>
                        )}
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
                                  onPreview={handlePreview}
                                  onToggleVisibility={(a) => updateArtworkMutation.mutate({ id: a.id, is_visible: a.is_visible === false })}
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

      <ArtworkPreviewDialog
        artwork={previewArtwork}
        series={series.find(s => s.id === previewArtwork?.series_id)}
        open={previewOpen}
        onOpenChange={setPreviewOpen}
      />
    </>
  );
};

export default ArtworksList;
