import { StudioImage } from "@/hooks/useStudioImages";

export interface BulkUploadItem {
  id: string;
  file: File;
  preview: string;
  status: "pending" | "uploading" | "uploaded" | "saving" | "done" | "error";
  url?: string;
  title: string;
  description: string;
}

export interface SortableImageItemProps {
  image: StudioImage;
  onEdit: () => void;
  onDelete: () => void;
  onPreview: () => void;
}

export interface EditImageFormProps {
  image: StudioImage | null;
  onSuccess: () => void;
  onCancel: () => void;
  imagesCount: number;
}

export interface BulkUploadSectionProps {
  onComplete: () => void;
  onCancel: () => void;
  existingImagesCount: number;
}

export interface ImagesListProps {
  images: StudioImage[];
  onEdit: (image: StudioImage) => void;
  onDelete: (id: string) => void;
  onPreview: (image: StudioImage) => void;
  onReorder: (updates: { id: string; display_order: number }[]) => void;
}

export interface ImagePreviewDialogProps {
  image: StudioImage | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export interface DeleteImageDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting?: boolean;
}
