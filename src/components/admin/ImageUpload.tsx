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
  const [file, setFile] = useState<File | null>(null);
  const uploadMutation = useUploadImage();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    const fileName = `${Date.now()}-${file.name}`;
    const url = await uploadMutation.mutateAsync({ file, fileName });
    onUploadComplete(url);
  };

  const handleRemove = () => {
    setFile(null);
    setPreview(null);
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
          {file && (
            <Button
              type="button"
              onClick={handleUpload}
              disabled={uploadMutation.isPending}
              className="mt-2 w-full"
            >
              {uploadMutation.isPending ? "Uploading..." : "Upload Image"}
            </Button>
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
