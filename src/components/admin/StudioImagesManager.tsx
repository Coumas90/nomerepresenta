import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Edit, Trash2, GripVertical, Plus, X, Upload, Images, CheckCircle } from "lucide-react";
import { useStudioImages, StudioImage } from "@/hooks/useStudioImages";
import {
  useCreateStudioImage,
  useUpdateStudioImage,
  useDeleteStudioImage,
  useUpdateStudioImagesOrder,
  useUploadStudioImage,
} from "@/hooks/useStudioImageMutations";
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
import { toast } from "@/hooks/use-toast";

interface SortableImageItemProps {
  image: StudioImage;
  onEdit: () => void;
  onDelete: () => void;
}

const SortableImageItem = ({ image, onEdit, onDelete }: SortableImageItemProps) => {
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
  };

  return (
    <div ref={setNodeRef} style={style} className="mb-3">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
              <GripVertical className="h-5 w-5 text-muted-foreground" />
            </div>
            <img
              src={image.image_url}
              alt={image.title || "Studio image"}
              className="w-20 h-20 object-cover rounded-md"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base">
                {image.title || "Untitled"}
              </h3>
              {image.description && (
                <p className="text-sm text-muted-foreground truncate">
                  {image.description}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={onEdit}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="destructive" size="icon" onClick={onDelete}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

interface BulkUploadItem {
  id: string;
  file: File;
  preview: string;
  status: "pending" | "uploading" | "done" | "error";
  url?: string;
}

const StudioImagesManager = () => {
  const { data: images = [], isLoading } = useStudioImages();
  const createMutation = useCreateStudioImage();
  const updateMutation = useUpdateStudioImage();
  const deleteMutation = useDeleteStudioImage();
  const updateOrderMutation = useUpdateStudioImagesOrder();
  const uploadMutation = useUploadStudioImage();

  const [showForm, setShowForm] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [editingImage, setEditingImage] = useState<StudioImage | null>(null);
  const [formData, setFormData] = useState({ title: "", description: "", image_url: "" });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  
  // Bulk upload state
  const [bulkItems, setBulkItems] = useState<BulkUploadItem[]>([]);
  const [isBulkUploading, setIsBulkUploading] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = images.findIndex((img) => img.id === active.id);
      const newIndex = images.findIndex((img) => img.id === over.id);

      const newOrder = arrayMove(images, oldIndex, newIndex);
      const updates = newOrder.map((img, index) => ({
        id: img.id,
        display_order: index,
      }));

      updateOrderMutation.mutate(updates);
    }
  };

  const handleEdit = (image: StudioImage) => {
    setEditingImage(image);
    setFormData({
      title: image.title || "",
      description: image.description || "",
      image_url: image.image_url,
    });
    setPreview(image.image_url);
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

  // Single file processing for edit form
  const processFile = async (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    const fileName = `${Date.now()}-${file.name}`;
    const url = await uploadMutation.mutateAsync({ file, fileName });
    setFormData((prev) => ({ ...prev, image_url: url }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processFile(file);
    }
  };

  const handleFileDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith("image/")) {
      await processFile(file);
    }
  };

  // Bulk upload handlers
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

  const uploadBulkImages = async () => {
    if (bulkItems.length === 0) return;
    
    setIsBulkUploading(true);
    let currentOrder = images.length;
    let successCount = 0;
    
    for (const item of bulkItems) {
      setBulkItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, status: "uploading" } : i))
      );
      
      try {
        const fileName = `${Date.now()}-${item.file.name}`;
        const url = await uploadMutation.mutateAsync({ file: item.file, fileName });
        
        await createMutation.mutateAsync({
          title: null,
          description: null,
          image_url: url,
          display_order: currentOrder,
        });
        
        currentOrder++;
        successCount++;
        
        setBulkItems((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, status: "done", url } : i))
        );
      } catch {
        setBulkItems((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, status: "error" } : i))
        );
      }
    }
    
    setIsBulkUploading(false);
    
    if (successCount > 0) {
      toast({
        title: "Upload complete",
        description: `${successCount} image${successCount > 1 ? "s" : ""} uploaded successfully.`,
      });
    }
    
    // Clear completed items after a delay
    setTimeout(() => {
      setBulkItems((prev) => prev.filter((item) => item.status !== "done"));
    }, 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.image_url) return;

    if (editingImage) {
      await updateMutation.mutateAsync({
        id: editingImage.id,
        title: formData.title || null,
        description: formData.description || null,
        image_url: formData.image_url,
      });
    } else {
      await createMutation.mutateAsync({
        title: formData.title || null,
        description: formData.description || null,
        image_url: formData.image_url,
        display_order: images.length,
      });
    }

    handleCancel();
  };

  const handleCancel = () => {
    setShowForm(false);
    setShowBulkUpload(false);
    setEditingImage(null);
    setFormData({ title: "", description: "", image_url: "" });
    setPreview(null);
    setBulkItems([]);
  };

  const completedCount = bulkItems.filter((item) => item.status === "done").length;
  const progressPercent = bulkItems.length > 0 ? (completedCount / bulkItems.length) * 100 : 0;

  if (isLoading) {
    return <div className="text-center py-8">Loading studio images...</div>;
  }

  return (
    <>
      <div className="space-y-6">
        {/* Single Image Form */}
        {showForm && !showBulkUpload && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{editingImage ? "Edit Image" : "Add New Image"}</CardTitle>
                <Button variant="ghost" size="icon" onClick={handleCancel}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>Image</Label>
                  {preview ? (
                    <div className="relative">
                      <img
                        src={preview}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg border"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={() => {
                          setPreview(null);
                          setFormData((prev) => ({ ...prev, image_url: "" }));
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      {uploadMutation.isPending && (
                        <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-lg">
                          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div
                      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                        isDragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                      }`}
                      onDragEnter={(e) => { e.preventDefault(); setIsDragOver(true); }}
                      onDragLeave={(e) => { e.preventDefault(); setIsDragOver(false); }}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={handleFileDrop}
                    >
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <Label htmlFor="studio-file" className="cursor-pointer text-sm text-muted-foreground hover:text-foreground block">
                        Click or drag to upload image
                      </Label>
                      <input
                        id="studio-file"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="title">Title (Optional)</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Studio View"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description"
                    rows={3}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={!formData.image_url || createMutation.isPending || updateMutation.isPending}
                  >
                    {editingImage ? "Update" : "Add"} Image
                  </Button>
                  <Button type="button" variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Bulk Upload */}
        {showBulkUpload && !showForm && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Bulk Upload Images</CardTitle>
                <Button variant="ghost" size="icon" onClick={handleCancel}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Drop zone */}
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isDragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                }`}
                onDragEnter={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={(e) => { e.preventDefault(); setIsDragOver(false); }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleBulkFileDrop}
              >
                <Images className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                <Label htmlFor="bulk-files" className="cursor-pointer text-sm text-muted-foreground hover:text-foreground block">
                  Drop multiple images here or click to select
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  You can select multiple files at once
                </p>
                <input
                  id="bulk-files"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleBulkFileChange}
                  className="hidden"
                />
              </div>

              {/* Preview grid */}
              {bulkItems.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {bulkItems.length} image{bulkItems.length > 1 ? "s" : ""} selected
                    </span>
                    {isBulkUploading && (
                      <span className="text-sm text-muted-foreground">
                        {completedCount} / {bulkItems.length} uploaded
                      </span>
                    )}
                  </div>
                  
                  {isBulkUploading && (
                    <Progress value={progressPercent} className="h-2" />
                  )}
                  
                  <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                    {bulkItems.map((item) => (
                      <div key={item.id} className="relative aspect-square">
                        {item.preview ? (
                          <img
                            src={item.preview}
                            alt="Preview"
                            className="w-full h-full object-cover rounded-md"
                          />
                        ) : (
                          <div className="w-full h-full bg-muted rounded-md animate-pulse" />
                        )}
                        
                        {/* Status overlay */}
                        {item.status === "uploading" && (
                          <div className="absolute inset-0 bg-background/70 flex items-center justify-center rounded-md">
                            <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
                          </div>
                        )}
                        {item.status === "done" && (
                          <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center rounded-md">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          </div>
                        )}
                        {item.status === "error" && (
                          <div className="absolute inset-0 bg-destructive/20 flex items-center justify-center rounded-md">
                            <X className="h-5 w-5 text-destructive" />
                          </div>
                        )}
                        
                        {/* Remove button (only when pending) */}
                        {item.status === "pending" && (
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute -top-1 -right-1 h-5 w-5"
                            onClick={() => removeBulkItem(item.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  onClick={uploadBulkImages}
                  disabled={bulkItems.length === 0 || isBulkUploading || bulkItems.every((i) => i.status === "done")}
                >
                  {isBulkUploading ? "Uploading..." : `Upload ${bulkItems.filter((i) => i.status === "pending").length} Images`}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel} disabled={isBulkUploading}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
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
        <Card>
          <CardHeader>
            <CardTitle>Studio Images ({images.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {images.length > 0 ? (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={images.map((img) => img.id)} strategy={verticalListSortingStrategy}>
                  {images.map((image) => (
                    <SortableImageItem
                      key={image.id}
                      image={image}
                      onEdit={() => handleEdit(image)}
                      onDelete={() => handleDeleteClick(image.id)}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No studio images yet. Add your first image above.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Image?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this studio image.
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

export default StudioImagesManager;
