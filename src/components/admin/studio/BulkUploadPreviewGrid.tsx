import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { X, CheckCircle } from "lucide-react";
import { BulkUploadItem } from "./types";

interface BulkUploadPreviewGridProps {
  items: BulkUploadItem[];
  isUploading: boolean;
  onRemoveItem: (id: string) => void;
}

export const BulkUploadPreviewGrid = ({
  items,
  isUploading,
  onRemoveItem,
}: BulkUploadPreviewGridProps) => {
  const uploadedCount = items.filter((i) => i.status === "uploaded").length;
  const progressPercent = items.length > 0 ? (uploadedCount / items.length) * 100 : 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {items.length} image{items.length > 1 ? "s" : ""} selected
        </span>
        {isUploading && (
          <span className="text-sm text-muted-foreground">
            {uploadedCount} / {items.length} uploaded
          </span>
        )}
      </div>

      {isUploading && <Progress value={progressPercent} className="h-2" />}

      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
        {items.map((item) => (
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
                onClick={() => onRemoveItem(item.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
