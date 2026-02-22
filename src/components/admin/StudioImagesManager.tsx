import { useState, useMemo } from "react";
import { Layers, Plus, Check, X } from "lucide-react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  type CollisionDetection,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useStudioImages } from "@/hooks/useStudioImages";
import { useStudioSeries } from "@/hooks/useStudioSeries";
import { useDeleteStudioImage, useUpdateStudioImage, useUpdateStudioImagesOrder } from "@/hooks/useStudioImageMutations";
import { useUpdateStudioSeriesOrder, useCreateStudioSeries, useDeleteStudioSeries } from "@/hooks/useStudioSeriesMutations";
import type { StudioImage, SeriesData } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { SeriesStudioSection } from "./studio/SeriesStudioSection";
import { ImagePreviewDialog, DeleteImageDialog } from "./studio";

// Custom collision: series drags → series targets, image drags → image + drop-zone targets
const studioCollision: CollisionDetection = (args) => {
  const activeType = args.active.data.current?.type;
  if (!activeType) return closestCenter(args);
  const filtered = args.droppableContainers.filter((c) => {
    const t = c.data.current?.type;
    return activeType === "series" ? t === "series" : t === "image" || t === "series-drop";
  });
  return closestCenter({ ...args, droppableContainers: filtered });
};

// Wrapper to make each series section sortable (for series reorder)
const SortableSeriesItem = ({
  series,
  images,
  onPreviewImage,
  onDeleteImage,
  onDeleteSeries,
}: {
  series: SeriesData;
  images: StudioImage[];
  onPreviewImage: (img: StudioImage) => void;
  onDeleteImage: (id: string) => void;
  onDeleteSeries: () => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: series.id, data: { type: "series" } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <SeriesStudioSection
        seriesId={series.id}
        seriesName={series.name}
        isVisible={series.is_visible !== false}
        images={images}
        onPreviewImage={onPreviewImage}
        onDeleteImage={onDeleteImage}
        onDeleteSeries={onDeleteSeries}
        dragHandleProps={listeners}
      />
    </div>
  );
};

const StudioImagesManager = () => {
  const { data: images = [], isLoading: imagesLoading } = useStudioImages();
  const { data: allSeries = [], isLoading: seriesLoading } = useStudioSeries();
  const deleteMutation = useDeleteStudioImage();
  const updateSeriesOrderMutation = useUpdateStudioSeriesOrder();
  const createSeriesMutation = useCreateStudioSeries();
  const deleteSeriesMutation = useDeleteStudioSeries();
  const updateImageMutation = useUpdateStudioImage();
  const updateImagesOrderMutation = useUpdateStudioImagesOrder();

  const [showNewSeries, setShowNewSeries] = useState(false);
  const [newSeriesName, setNewSeriesName] = useState("");
  const [previewImage, setPreviewImage] = useState<StudioImage | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<string | null>(null);
  const [seriesToDelete, setSeriesToDelete] = useState<string | null>(null);
  const [seriesDeleteDialogOpen, setSeriesDeleteDialogOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDeleteClick = (id: string) => {
    setImageToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (imageToDelete) {
      await deleteMutation.mutateAsync(imageToDelete);
      setDeleteDialogOpen(false);
      setImageToDelete(null);
    }
  };

  // Group images by series
  const imagesBySeries = new Map<string, StudioImage[]>();
  const ungroupedImages: StudioImage[] = [];
  for (const img of images) {
    if (img.series_id) {
      if (!imagesBySeries.has(img.series_id)) imagesBySeries.set(img.series_id, []);
      imagesBySeries.get(img.series_id)!.push(img);
    } else {
      ungroupedImages.push(img);
    }
  }

  // All series in display order
  const sortedSeries = [...allSeries].sort((a, b) => a.display_order - b.display_order);

  // Map image IDs to their series for cross-series detection
  const imageToSeriesMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const img of images) map.set(img.id, img.series_id || "__ungrouped");
    return map;
  }, [images]);

  const isLoading = imagesLoading || seriesLoading;

  // Unified drag handler for both series reorder and image operations
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeType = active.data.current?.type;

    if (activeType === "series") {
      // Series reorder
      const oldIndex = sortedSeries.findIndex((s) => s.id === active.id);
      const newIndex = sortedSeries.findIndex((s) => s.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;
      const reordered = arrayMove(sortedSeries, oldIndex, newIndex);
      updateSeriesOrderMutation.mutate(reordered.map((s, i) => ({ id: s.id, display_order: i })));
    } else if (activeType === "image") {
      const activeId = String(active.id);
      const overId = String(over.id);
      const activeSeriesId = imageToSeriesMap.get(activeId);

      const overType = over.data.current?.type;
      const targetSeriesId = overType === "series-drop"
        ? over.data.current?.seriesId
        : imageToSeriesMap.get(overId);

      if (!activeSeriesId || !targetSeriesId) return;

      if (activeSeriesId === targetSeriesId) {
        // Reorder within same series
        const seriesImages = imagesBySeries.get(activeSeriesId) || [];
        const oldIndex = seriesImages.findIndex((img) => img.id === activeId);
        const newIndex = seriesImages.findIndex((img) => img.id === overId);
        if (oldIndex !== -1 && newIndex !== -1) {
          const reordered = arrayMove(seriesImages, oldIndex, newIndex);
          updateImagesOrderMutation.mutate(reordered.map((img, i) => ({ id: img.id, display_order: i })));
        }
      } else {
        // Move to different series
        const targetImages = imagesBySeries.get(targetSeriesId) || [];
        updateImageMutation.mutate({
          id: activeId,
          series_id: targetSeriesId === "__ungrouped" ? null : targetSeriesId,
          display_order: targetImages.length,
        });
      }
    }
  };

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Loading studio images...</div>;
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold uppercase tracking-wider flex items-center gap-2">
              <Layers className="h-5 w-5" />
              Manage Studio
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {allSeries.length} Series · {images.length} Images · Drag to reorder or move between series
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowNewSeries(true)} disabled={showNewSeries}>
            <Plus className="h-4 w-4 mr-1" /> New Series
          </Button>
        </div>

        {/* Inline new series form */}
        {showNewSeries && (
          <form
            className="flex items-center gap-2"
            onSubmit={async (e) => {
              e.preventDefault();
              const name = newSeriesName.trim();
              await createSeriesMutation.mutateAsync({ name: name || "", description: null, display_order: allSeries.length });
              setNewSeriesName("");
              setShowNewSeries(false);
            }}
          >
            <Input autoFocus placeholder="Series name (optional)…" value={newSeriesName} onChange={(e) => setNewSeriesName(e.target.value)} className="max-w-xs" />
            <Button type="submit" size="icon" variant="ghost" disabled={createSeriesMutation.isPending}>
              <Check className="h-4 w-4" />
            </Button>
            <Button type="button" size="icon" variant="ghost" onClick={() => { setShowNewSeries(false); setNewSeriesName(""); }}>
              <X className="h-4 w-4" />
            </Button>
          </form>
        )}

        {/* Single DndContext for both series reorder and cross-series image drag */}
        <DndContext
          sensors={sensors}
          collisionDetection={studioCollision}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sortedSeries.map((s) => s.id)}
            strategy={verticalListSortingStrategy}
          >
            {sortedSeries.map((series) => (
              <SortableSeriesItem
                key={series.id}
                series={series}
                images={imagesBySeries.get(series.id) || []}
                onPreviewImage={setPreviewImage}
                onDeleteImage={handleDeleteClick}
                onDeleteSeries={() => { setSeriesToDelete(series.id); setSeriesDeleteDialogOpen(true); }}
              />
            ))}
          </SortableContext>

          {/* Ungrouped images */}
          {ungroupedImages.length > 0 && (
            <SeriesStudioSection
              seriesId="__ungrouped"
              seriesName="Unassigned"
              images={ungroupedImages}
              onPreviewImage={setPreviewImage}
              onDeleteImage={handleDeleteClick}
            />
          )}
        </DndContext>
      </div>

      <ImagePreviewDialog
        image={previewImage}
        open={!!previewImage}
        onOpenChange={(open) => !open && setPreviewImage(null)}
      />

      <DeleteImageDialog
        open={deleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteDialogOpen(false)}
        isDeleting={deleteMutation.isPending}
      />

      <AlertDialog open={seriesDeleteDialogOpen} onOpenChange={setSeriesDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Series?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this series. You cannot delete a series that still has images — remove or move them first.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (seriesToDelete) {
                  await deleteSeriesMutation.mutateAsync(seriesToDelete);
                  setSeriesDeleteDialogOpen(false);
                  setSeriesToDelete(null);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default StudioImagesManager;
