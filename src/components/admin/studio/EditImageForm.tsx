import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X, Upload } from "lucide-react";
import { useCreateStudioImage, useUpdateStudioImage, useUploadStudioImage } from "@/hooks/useStudioImageMutations";
import { useFileDrop } from "@/hooks/useFileDrop";
import type { EditImageFormProps } from "@/types";

export const EditImageForm = ({ image, onSuccess, onCancel, imagesCount }: EditImageFormProps) => {
  const createMutation = useCreateStudioImage();
  const updateMutation = useUpdateStudioImage();
  const uploadMutation = useUploadStudioImage();

  const [formData, setFormData] = useState({
    title: image?.title || "",
    description: image?.description || "",
    image_url: image?.image_url || "",
  });
  const [preview, setPreview] = useState<string | null>(image?.image_url || null);

  const processFile = useCallback(async (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    const fileName = `${Date.now()}-${file.name}`;
    const url = await uploadMutation.mutateAsync({ file, fileName });
    setFormData((prev) => ({ ...prev, image_url: url }));
  }, [uploadMutation]);

  const { isDragOver, handleDragEnter, handleDragLeave, handleDragOver, handleDrop, handleFileInputChange } = useFileDrop({
    onFilesSelected: (files) => {
      if (files[0]) processFile(files[0]);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.image_url) return;

    if (image) {
      await updateMutation.mutateAsync({
        id: image.id,
        title: formData.title || null,
        description: formData.description || null,
        image_url: formData.image_url,
      });
    } else {
      await createMutation.mutateAsync({
        title: formData.title || null,
        description: formData.description || null,
        image_url: formData.image_url,
        display_order: imagesCount,
      });
    }

    onSuccess();
  };

  const clearImage = () => {
    setPreview(null);
    setFormData((prev) => ({ ...prev, image_url: "" }));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{image ? "Edit Image" : "Add New Image"}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onCancel}>
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
                  onClick={clearImage}
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
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <Label htmlFor="studio-file" className="cursor-pointer text-sm text-muted-foreground hover:text-foreground block">
                  Click or drag to upload image
                </Label>
                <input
                  id="studio-file"
                  type="file"
                  accept="image/*"
                  onChange={handleFileInputChange}
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
              {image ? "Update" : "Add"} Image
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
