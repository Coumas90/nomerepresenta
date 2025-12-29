import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Images } from "lucide-react";
import { useStudioImages } from "@/hooks/useStudioImages";
import type { StudioImage } from "@/types";
import { useDeleteStudioImage, useUpdateStudioImagesOrder } from "@/hooks/useStudioImageMutations";
import {
  EditImageForm,
  BulkUploadSection,
  ImagesList,
  ImagePreviewDialog,
  DeleteImageDialog,
} from "./studio";

const StudioImagesManager = () => {
  const { data: images = [], isLoading } = useStudioImages();
  const deleteMutation = useDeleteStudioImage();
  const updateOrderMutation = useUpdateStudioImagesOrder();

  const [showForm, setShowForm] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [editingImage, setEditingImage] = useState<StudioImage | null>(null);
  const [previewImage, setPreviewImage] = useState<StudioImage | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<string | null>(null);

  const handleEdit = (image: StudioImage) => {
    setEditingImage(image);
    setShowForm(true);
    setShowBulkUpload(false);
  };

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

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingImage(null);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingImage(null);
  };

  const handleBulkComplete = () => {
    setShowBulkUpload(false);
  };

  const handleBulkCancel = () => {
    setShowBulkUpload(false);
  };

  const handleReorder = (updates: { id: string; display_order: number }[]) => {
    updateOrderMutation.mutate(updates);
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading studio images...</div>;
  }

  return (
    <>
      <div className="space-y-6">
        {/* Single Image Form */}
        {showForm && !showBulkUpload && (
          <EditImageForm
            image={editingImage}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
            imagesCount={images.length}
          />
        )}

        {/* Bulk Upload */}
        {showBulkUpload && !showForm && (
          <BulkUploadSection
            onComplete={handleBulkComplete}
            onCancel={handleBulkCancel}
            existingImagesCount={images.length}
          />
        )}

        {/* Action buttons */}
        {!showForm && !showBulkUpload && (
          <div className="flex gap-3">
            <Button onClick={() => setShowForm(true)} className="flex-1">
              <Plus className="mr-2 h-4 w-4" />
              Add Single Image
            </Button>
            <Button onClick={() => setShowBulkUpload(true)} variant="secondary" className="flex-1">
              <Images className="mr-2 h-4 w-4" />
              Bulk Upload
            </Button>
          </div>
        )}

        {/* Images List */}
        <ImagesList
          images={images}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
          onPreview={setPreviewImage}
          onReorder={handleReorder}
        />
      </div>

      {/* Image Preview Modal */}
      <ImagePreviewDialog
        image={previewImage}
        open={!!previewImage}
        onOpenChange={(open) => !open && setPreviewImage(null)}
      />

      {/* Delete Confirmation Dialog */}
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
