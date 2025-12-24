import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, X } from "lucide-react";
import { useUploadImage } from "@/hooks/useArtworkMutations";
import { toast } from "sonner";

interface ImageUploadProps {
  label: string;
  onUploadComplete: (url: string) => void;
  currentUrl?: string;
}

const ImageUpload = ({ label, onUploadComplete, currentUrl }: ImageUploadProps) => {
  const [preview, setPreview] = useState<string | null>(currentUrl || null);
  const [isUploaded, setIsUploaded] = useState<boolean>(!!currentUrl);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const uploadMutation = useUploadImage();

  const processFile = async (file: File) => {
    // Show preview immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Auto-upload immediately
    try {
      const fileName = `${Date.now()}-${file.name}`;
      const url = await uploadMutation.mutateAsync({ file, fileName });
      onUploadComplete(url);
      setIsUploaded(true);
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Error al subir la imagen. Por favor intenta de nuevo.");
      setIsUploaded(false);
      setPreview(null);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      await processFile(selectedFile);
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        await processFile(file);
      }
    }
  };

  const handleRemove = () => {
    setPreview(null);
    setIsUploaded(false);
    onUploadComplete("");
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
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
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
          {uploadMutation.isPending && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-lg">
              <div className="text-center">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">Uploading...</p>
              </div>
            </div>
          )}
          {isUploaded && !uploadMutation.isPending && (
            <div className="absolute bottom-2 left-2 bg-green-600 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
              <span>✓</span> Uploaded
            </div>
          )}
        </div>
      ) : (
        <div 
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            isDragOver 
              ? 'border-primary bg-primary/5' 
              : 'border-border hover:border-primary/50'
          }`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <Upload className={`h-8 w-8 mx-auto mb-2 transition-colors ${
            isDragOver ? 'text-primary' : 'text-muted-foreground'
          }`} />
          <Label
            htmlFor={`file-${label}`}
            className="cursor-pointer text-sm text-muted-foreground hover:text-foreground block"
          >
            {isDragOver ? 'Drop image here' : 'Click or drag to upload image'}
          </Label>
          <input
            id={`file-${label}`}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
