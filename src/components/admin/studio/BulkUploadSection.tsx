import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { X, Images, CheckCircle } from "lucide-react";
import { useCreateStudioImage, useUploadStudioImage } from "@/hooks/useStudioImageMutations";
import { toast } from "@/hooks/use-toast";
import { BulkUploadItem, BulkUploadSectionProps } from "./types";

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

  const completedCount = bulkItems.filter((item) => item.status === "done").length;
  const progressPercent = bulkItems.length > 0 ? (completedCount / bulkItems.length) * 100 : 0;

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
        )}

        {/* Preview grid - compact mode before upload */}
        {bulkItems.length > 0 && !bulkEditMode && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {bulkItems.length} image{bulkItems.length > 1 ? "s" : ""} selected
              </span>
              {isBulkUploading && (
                <span className="text-sm text-muted-foreground">
                  {bulkItems.filter((i) => i.status === "uploaded").length} / {bulkItems.length} uploaded
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
                  {item.status === "uploaded" && (
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

        {/* Edit mode - show cards with title/description fields */}
        {bulkEditMode && bulkItems.length > 0 && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Add titles and descriptions to your images (optional). Click "Save All" when done.
            </p>
            
            {isSavingBulk && (
              <Progress value={(bulkItems.filter((i) => i.status === "done").length / bulkItems.length) * 100} className="h-2" />
            )}
            
            <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2">
              {bulkItems.filter((item) => item.status === "uploaded" || item.status === "saving" || item.status === "done").map((item) => (
                <Card key={item.id} className={item.status === "done" ? "opacity-60" : ""}>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="relative shrink-0">
                        <img
                          src={item.preview || item.url}
                          alt="Preview"
                          className="w-24 h-24 object-cover rounded-md"
                        />
                        {item.status === "saving" && (
                          <div className="absolute inset-0 bg-background/70 flex items-center justify-center rounded-md">
                            <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
                          </div>
                        )}
                        {item.status === "done" && (
                          <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center rounded-md">
                            <CheckCircle className="h-6 w-6 text-green-500" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 space-y-3">
                        <div>
                          <Label htmlFor={`title-${item.id}`} className="text-xs">Title</Label>
                          <Input
                            id={`title-${item.id}`}
                            value={item.title}
                            onChange={(e) => updateBulkItemMetadata(item.id, "title", e.target.value)}
                            placeholder="Image title (optional)"
                            disabled={item.status !== "uploaded"}
                            className="h-9"
                            maxLength={100}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`desc-${item.id}`} className="text-xs">Description</Label>
                          <Textarea
                            id={`desc-${item.id}`}
                            value={item.description}
                            onChange={(e) => updateBulkItemMetadata(item.id, "description", e.target.value)}
                            placeholder="Brief description (optional)"
                            disabled={item.status !== "uploaded"}
                            rows={2}
                            className="resize-none"
                            maxLength={500}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {!bulkEditMode ? (
            <>
              <Button
                onClick={uploadBulkImages}
                disabled={bulkItems.length === 0 || isBulkUploading || bulkItems.every((i) => i.status !== "pending")}
              >
                {isBulkUploading ? "Uploading..." : `Upload ${bulkItems.filter((i) => i.status === "pending").length} Images`}
              </Button>
              <Button type="button" variant="outline" onClick={handleCancel} disabled={isBulkUploading}>
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={saveBulkImages}
                disabled={isSavingBulk || bulkItems.every((i) => i.status === "done")}
              >
                {isSavingBulk ? "Saving..." : `Save All (${bulkItems.filter((i) => i.status === "uploaded").length} images)`}
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
