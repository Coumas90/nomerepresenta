/**
 * Studio image type definitions
 * Centralized types for studio-related data structures
 */

import type { Tables } from "@/integrations/supabase/types";

// ============= Core Database Types =============

/** Studio image row from database */
export type StudioImageRow = Tables<"studio_images">;

/** Studio series row from database */
export type StudioSeriesRow = Tables<"studio_series">;

// ============= Application Types =============

/**
 * Studio series as used throughout the application.
 */
export interface StudioSeriesData {
  id: string;
  name: string;
  description: string | null;
  display_order: number;
}

// ============= Application Types =============

/**
 * Studio image as used throughout the application.
 */
export interface StudioImage {
  id: string;
  image_url: string;
  title: string | null;
  description: string | null;
  display_order: number;
  series_id: string | null;
  created_at: string;
  updated_at: string;
}

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

// ============= Form/Input Types =============

/**
 * Data required to create a new studio image.
 */
export interface CreateStudioImageInput {
  image_url: string;
  title?: string;
  description?: string;
  display_order?: number;
}

/**
 * Data for updating an existing studio image.
 */
export interface UpdateStudioImageInput {
  title?: string;
  description?: string;
  display_order?: number;
}

// ============= Component Props Types =============

/**
 * Props for the SortableImageItem component.
 */
export interface SortableImageItemProps {
  image: StudioImage;
  onEdit: () => void;
  onDelete: () => void;
  onPreview: () => void;
}

/**
 * Props for the EditImageForm component.
 */
export interface EditImageFormProps {
  image: StudioImage | null;
  onSuccess: () => void;
  onCancel: () => void;
  imagesCount: number;
}

/**
 * Props for the BulkUploadSection component.
 */
export interface BulkUploadSectionProps {
  onComplete: () => void;
  onCancel: () => void;
  existingImagesCount: number;
}

/**
 * Props for the ImagesList component.
 */
export interface ImagesListProps {
  images: StudioImage[];
  onEdit: (image: StudioImage) => void;
  onDelete: (id: string) => void;
  onPreview: (image: StudioImage) => void;
  onReorder: (updates: { id: string; display_order: number }[]) => void;
}

/**
 * Props for the ImagePreviewDialog component.
 */
export interface ImagePreviewDialogProps {
  image: StudioImage | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Props for the DeleteImageDialog component.
 */
export interface DeleteImageDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting?: boolean;
}
