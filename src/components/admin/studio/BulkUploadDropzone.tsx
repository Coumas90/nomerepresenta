import { Label } from "@/components/ui/label";
import { Images } from "lucide-react";

interface BulkUploadDropzoneProps {
  isDragOver: boolean;
  onDragEnter: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const BulkUploadDropzone = ({
  isDragOver,
  onDragEnter,
  onDragLeave,
  onDrop,
  onFileChange,
}: BulkUploadDropzoneProps) => {
  return (
    <div
      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
        isDragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
      }`}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
    >
      <Images className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
      <Label 
        htmlFor="bulk-files" 
        className="cursor-pointer text-sm text-muted-foreground hover:text-foreground block"
      >
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
        onChange={onFileChange}
        className="hidden"
      />
    </div>
  );
};
