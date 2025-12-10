import { StudioImage } from "@/hooks/useStudioImages";

/**
 * Represents a single item in the bulk upload queue.
 * Tracks the file, its upload status, and associated metadata.
 */
export interface BulkUploadItem {
  /** Unique identifier for this upload item */
  id: string;
  /** The original file being uploaded */
  file: File;
  /** Base64 preview URL for displaying the image before upload */
  preview: string;
  /** Current status in the upload pipeline */
  status: "pending" | "uploading" | "uploaded" | "saving" | "done" | "error";
  /** Public URL after successful upload to storage */
  url?: string;
  /** User-provided title for the image */
  title: string;
  /** User-provided description for the image */
  description: string;
}

/**
 * Props for the SortableImageItem component.
 * Used in the drag-and-drop sortable image grid.
 */
export interface SortableImageItemProps {
  /** The studio image data to display */
  image: StudioImage;
  /** Callback when edit button is clicked */
  onEdit: () => void;
  /** Callback when delete button is clicked */
  onDelete: () => void;
  /** Callback when preview button is clicked */
  onPreview: () => void;
}

/**
 * Props for the EditImageForm component.
 * Handles editing metadata for existing studio images.
 */
export interface EditImageFormProps {
  /** The image being edited, or null if no image is selected */
  image: StudioImage | null;
  /** Callback when edit is successfully completed */
  onSuccess: () => void;
  /** Callback when edit is cancelled */
  onCancel: () => void;
  /** Total count of images, used for display order validation */
  imagesCount: number;
}

/**
 * Props for the BulkUploadSection component.
 * Manages the complete bulk upload workflow.
 */
export interface BulkUploadSectionProps {
  /** Callback when all uploads are completed successfully */
  onComplete: () => void;
  /** Callback when bulk upload is cancelled */
  onCancel: () => void;
  /** Count of existing images, used for calculating display order */
  existingImagesCount: number;
}

/**
 * Props for the ImagesList component.
 * Displays a sortable grid of studio images.
 */
export interface ImagesListProps {
  /** Array of studio images to display */
  images: StudioImage[];
  /** Callback when an image is selected for editing */
  onEdit: (image: StudioImage) => void;
  /** Callback when an image should be deleted */
  onDelete: (id: string) => void;
  /** Callback when an image should be previewed */
  onPreview: (image: StudioImage) => void;
  /** Callback when images are reordered via drag-and-drop */
  onReorder: (updates: { id: string; display_order: number }[]) => void;
}

/**
 * Props for the ImagePreviewDialog component.
 * Displays a full-size preview of a studio image.
 */
export interface ImagePreviewDialogProps {
  /** The image to preview, or null if dialog should be closed */
  image: StudioImage | null;
  /** Whether the dialog is currently open */
  open: boolean;
  /** Callback to control dialog open state */
  onOpenChange: (open: boolean) => void;
}

/**
 * Props for the DeleteImageDialog component.
 * Confirmation dialog for deleting studio images.
 */
export interface DeleteImageDialogProps {
  /** Whether the dialog is currently open */
  open: boolean;
  /** Callback when deletion is confirmed */
  onConfirm: () => void;
  /** Callback when deletion is cancelled */
  onCancel: () => void;
  /** Whether deletion is in progress */
  isDeleting?: boolean;
}
