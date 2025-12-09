import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ImagePreviewDialogProps } from "./types";

export const ImagePreviewDialog = ({ image, open, onOpenChange }: ImagePreviewDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden bg-background/95 backdrop-blur-sm">
        {image && (
          <div className="relative">
            <img
              src={image.image_url}
              alt={image.title || "Studio image"}
              className="w-full h-auto max-h-[85vh] object-contain"
            />
            {(image.title || image.description) && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/90 to-transparent p-6 pt-12">
                {image.title && (
                  <h3 className="text-lg font-semibold">{image.title}</h3>
                )}
                {image.description && (
                  <p className="text-sm text-muted-foreground mt-1">{image.description}</p>
                )}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
