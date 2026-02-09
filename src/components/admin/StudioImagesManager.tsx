import { useState } from "react";
import { Layers } from "lucide-react";
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
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useStudioImages } from "@/hooks/useStudioImages";
import { useSeries } from "@/hooks/useSeries";
import { useDeleteStudioImage } from "@/hooks/useStudioImageMutations";
import { useUpdateSeriesOrder } from "@/hooks/useSeriesMutations";
import type { StudioImage, SeriesData } from "@/types";
import { SeriesStudioSection } from "./studio/SeriesStudioSection";
import { ImagePreviewDialog, DeleteImageDialog } from "./studio";

// Wrapper to make each series section sortable
const SortableSeriesItem = ({
  series,
  images,
  onPreviewImage,
  onDeleteImage,
}: {
  series: SeriesData;
  images: StudioImage[];
  onPreviewImage: (img: StudioImage) => void;
  onDeleteImage: (id: string) => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: series.id });

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
        images={images}
        onPreviewImage={onPreviewImage}
        onDeleteImage={onDeleteImage}
        dragHandleProps={listeners}
      />
    </div>
  );
};

const StudioImagesManager = () => {
  const { data: images = [], isLoading: imagesLoading } = useStudioImages();
  const { data: allSeries = [], isLoading: seriesLoading } = useSeries();
  const deleteMutation = useDeleteStudioImage();
  const updateSeriesOrderMutation = useUpdateSeriesOrder();

  const [previewImage, setPreviewImage] = useState<StudioImage | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
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
  for (const img of images) {
    const key = img.series_id || "__ungrouped";
    if (!imagesBySeries.has(key)) imagesBySeries.set(key, []);
    imagesBySeries.get(key)!.push(img);
  }

  // All series in display order (both with and without images)
  const sortedSeries = [...allSeries].sort((a, b) => a.display_order - b.display_order);

  const ungroupedImages = imagesBySeries.get("__ungrouped") || [];

  const isLoading = imagesLoading || seriesLoading;

  const handleSeriesDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = sortedSeries.findIndex((s) => s.id === active.id);
    const newIndex = sortedSeries.findIndex((s) => s.id === over.id);
    const reordered = arrayMove(sortedSeries, oldIndex, newIndex);
    const updates = reordered.map((s, i) => ({ id: s.id, display_order: i }));
    updateSeriesOrderMutation.mutate(updates);
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
              {allSeries.length} Series · {images.length} Images · Drag to reorder
            </p>
          </div>
        </div>

        {/* Sortable series */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleSeriesDragEnd}
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
              />
            ))}
          </SortableContext>
        </DndContext>

        {/* Ungrouped images */}
        {ungroupedImages.length > 0 && (
          <SeriesStudioSection
            seriesId=""
            seriesName="Ungrouped"
            images={ungroupedImages}
            onPreviewImage={setPreviewImage}
            onDeleteImage={handleDeleteClick}
          />
        )}
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
    </>
  );
};

export default StudioImagesManager;
