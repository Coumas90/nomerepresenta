import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X } from "lucide-react";
import { useCreateStudioImage, useUploadStudioImage } from "@/hooks/useStudioImageMutations";
import { toast } from "@/hooks/use-toast";
import { BulkUploadItem, BulkUploadSectionProps } from "./types";
import { BulkUploadDropzone } from "./BulkUploadDropzone";
import { BulkUploadPreviewGrid } from "./BulkUploadPreviewGrid";
import { BulkUploadEditMode } from "./BulkUploadEditMode";

export const BulkUploadSection = ({ onComplete, onCancel, existingImagesCount }: BulkUploadSectionProps) => {
  const createMutation = useCreateStudioImage();
  const uploadMutation = useUploadStudioImage();

  const [bulkItems, setBulkItems] = useState<BulkUploadItem[]>([]);
  const [isBulkUploading, setIsBulkUploading] = useState(false);
  const [bulkEditMode, setBulkEditMode] = useState(false);
  const [isSavingBulk, setIsSavingBulk] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleBulkFilesSelect = (files: FileList) => {
    const newItems: BulkUploadItem[] = [];

    Array.from(files).forEach((file) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        const id = `${Date.now()}-${Math.random().toString(36).substring(7)}`;

        reader.onloadend = () => {
          setBulkItems((prev) =>
            prev.map((item) =>
              item.id === id ? { ...item, preview: reader.result as string } : item
            )
          );
        };
        reader.readAsDataURL(file);

        newItems.push({
          id,
          file,
          preview: "",
          status: "pending",
          title: "",
          description: "",
        });
      }
    });

    setBulkItems((prev) => [...prev, ...newItems]);
  };

  const handleBulkFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleBulkFilesSelect(e.target.files);
    }
  };

  const handleBulkFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files) {
      handleBulkFilesSelect(e.dataTransfer.files);
    }
  };

  const removeBulkItem = (id: string) => {
    setBulkItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateBulkItemMetadata = (id: string, field: "title" | "description", value: string) => {
    setBulkItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const uploadBulkImages = async () => {
    if (bulkItems.length === 0) return;

    setIsBulkUploading(true);
    let successCount = 0;

    for (const item of bulkItems) {
      if (item.status !== "pending") continue;

      setBulkItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, status: "uploading" } : i))
      );

      try {
        const fileName = `${Date.now()}-${item.file.name}`;
        const url = await uploadMutation.mutateAsync({ file: item.file, fileName });

        successCount++;

        setBulkItems((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, status: "uploaded", url } : i))
        );
      } catch {
        setBulkItems((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, status: "error" } : i))
        );
      }
    }

    setIsBulkUploading(false);

    if (successCount > 0) {
      setBulkEditMode(true);
      toast({
        title: "Files uploaded",
        description: "Now you can add titles and descriptions before saving.",
      });
    }
  };

  const saveBulkImages = async () => {
    const uploadedItems = bulkItems.filter((item) => item.status === "uploaded" && item.url);
    if (uploadedItems.length === 0) return;

    setIsSavingBulk(true);
    let currentOrder = existingImagesCount;
    let successCount = 0;

    for (const item of uploadedItems) {
      setBulkItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, status: "saving" } : i))
      );

      try {
        await createMutation.mutateAsync({
          title: item.title.trim() || null,
          description: item.description.trim() || null,
          image_url: item.url!,
          display_order: currentOrder,
        });

        currentOrder++;
        successCount++;

        setBulkItems((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, status: "done" } : i))
        );
      } catch {
        setBulkItems((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, status: "error" } : i))
        );
      }
    }

    setIsSavingBulk(false);

    if (successCount > 0) {
      toast({
        title: "Images saved",
        description: `${successCount} image${successCount > 1 ? "s" : ""} added to the gallery.`,
      });

      setTimeout(() => {
        onComplete();
      }, 1500);
    }
  };

  const handleCancel = () => {
    setBulkItems([]);
    setBulkEditMode(false);
    onCancel();
  };

  const pendingCount = bulkItems.filter((i) => i.status === "pending").length;
  const uploadedCount = bulkItems.filter((i) => i.status === "uploaded").length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>
            {bulkEditMode ? "Add Details to Images" : "Bulk Upload Images"}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={handleCancel} disabled={isBulkUploading || isSavingBulk}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Drop zone - only show when not in edit mode */}
        {!bulkEditMode && (
          <BulkUploadDropzone
            isDragOver={isDragOver}
            onDragEnter={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={(e) => { e.preventDefault(); setIsDragOver(false); }}
            onDrop={handleBulkFileDrop}
            onFileChange={handleBulkFileChange}
          />
        )}

        {/* Preview grid - compact mode before upload */}
        {bulkItems.length > 0 && !bulkEditMode && (
          <BulkUploadPreviewGrid
            items={bulkItems}
            isUploading={isBulkUploading}
            onRemoveItem={removeBulkItem}
          />
        )}

        {/* Edit mode - show cards with title/description fields */}
        {bulkEditMode && bulkItems.length > 0 && (
          <BulkUploadEditMode
            items={bulkItems}
            isSaving={isSavingBulk}
            onUpdateMetadata={updateBulkItemMetadata}
          />
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {!bulkEditMode ? (
            <>
              <Button
                onClick={uploadBulkImages}
                disabled={bulkItems.length === 0 || isBulkUploading || pendingCount === 0}
              >
                {isBulkUploading ? "Uploading..." : `Upload ${pendingCount} Images`}
              </Button>
              <Button type="button" variant="outline" onClick={handleCancel} disabled={isBulkUploading}>
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={saveBulkImages}
                disabled={isSavingBulk || uploadedCount === 0}
              >
                {isSavingBulk ? "Saving..." : `Save All (${uploadedCount} images)`}
              </Button>
              <Button type="button" variant="outline" onClick={handleCancel} disabled={isSavingBulk}>
                Cancel
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
