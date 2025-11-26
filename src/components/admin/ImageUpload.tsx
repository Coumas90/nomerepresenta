import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, X } from "lucide-react";
import { useUploadImage } from "@/hooks/useArtworkMutations";

interface ImageUploadProps {
  label: string;
  onUploadComplete: (url: string) => void;
  currentUrl?: string;
}

const ImageUpload = ({ label, onUploadComplete, currentUrl }: ImageUploadProps) => {
  const [preview, setPreview] = useState<string | null>(currentUrl || null);
  const [isUploaded, setIsUploaded] = useState<boolean>(!!currentUrl);
  const uploadMutation = useUploadImage();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Show preview immediately
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);

      // Auto-upload immediately
      try {
        const fileName = `${Date.now()}-${selectedFile.name}`;
        const url = await uploadMutation.mutateAsync({ file: selectedFile, fileName });
        onUploadComplete(url);
        setIsUploaded(true);
      } catch (error) {
        setIsUploaded(false);
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
        <div className="border-2 border-dashed rounded-lg p-8 text-center">
          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <Label
            htmlFor={`file-${label}`}
            className="cursor-pointer text-sm text-muted-foreground hover:text-foreground"
          >
            Click to upload image
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
