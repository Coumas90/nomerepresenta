import { useState } from "react";
import { Layers } from "lucide-react";
import { useStudioImages } from "@/hooks/useStudioImages";
import { useSeries } from "@/hooks/useSeries";
import { useDeleteStudioImage } from "@/hooks/useStudioImageMutations";
import type { StudioImage, SeriesData } from "@/types";
import { SeriesStudioSection } from "./studio/SeriesStudioSection";
import { ImagePreviewDialog, DeleteImageDialog } from "./studio";

const StudioImagesManager = () => {
  const { data: images = [], isLoading: imagesLoading } = useStudioImages();
  const { data: allSeries = [], isLoading: seriesLoading } = useSeries();
  const deleteMutation = useDeleteStudioImage();

  const [previewImage, setPreviewImage] = useState<StudioImage | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<string | null>(null);

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

  // Get series that have images, in display order
  const seriesWithImages = allSeries
    .filter((s) => imagesBySeries.has(s.id))
    .sort((a, b) => a.display_order - b.display_order);

  // Series without images (available for upload)
  const seriesWithoutImages = allSeries
    .filter((s) => !imagesBySeries.has(s.id))
    .sort((a, b) => a.display_order - b.display_order);

  const ungroupedImages = imagesBySeries.get("__ungrouped") || [];

  const isLoading = imagesLoading || seriesLoading;

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
              {allSeries.length} Series · {images.length} Images
            </p>
          </div>
        </div>

        {/* Series with images */}
        {seriesWithImages.map((series) => (
          <SeriesStudioSection
            key={series.id}
            seriesId={series.id}
            seriesName={series.name}
            images={imagesBySeries.get(series.id) || []}
            onPreviewImage={setPreviewImage}
            onDeleteImage={handleDeleteClick}
          />
        ))}

        {/* Empty series (still show for uploading) */}
        {seriesWithoutImages.map((series) => (
          <SeriesStudioSection
            key={series.id}
            seriesId={series.id}
            seriesName={series.name}
            images={[]}
            onPreviewImage={setPreviewImage}
            onDeleteImage={handleDeleteClick}
          />
        ))}

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
