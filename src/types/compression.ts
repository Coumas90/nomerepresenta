/**
 * Image compression type definitions
 * Centralized types for image compression-related data structures
 */

/**
 * Options for image compression.
 */
export interface CompressionOptions {
  /** Maximum file size in MB */
  maxSizeMB?: number;
  /** Maximum width or height in pixels */
  maxWidthOrHeight?: number;
  /** Whether to use web workers for compression */
  useWebWorker?: boolean;
  /** Target file type */
  fileType?: "image/webp" | "image/avif" | "image/jpeg" | "image/png";
  /** Initial quality (0-1) */
  initialQuality?: number;
  /** Minimum savings percentage to accept (0-100). If not met, try AVIF fallback */
  minSavingsPercent?: number;
}

/**
 * Result of image compression.
 */
export interface CompressionResult {
  /** The compressed file */
  file: File;
  /** Original file size in bytes */
  originalSize: number;
  /** Compressed file size in bytes */
  compressedSize: number;
  /** Percentage saved */
  savingsPercent: number;
  /** Final format used */
  format: "webp" | "avif" | "original";
}

/**
 * Detailed compression result with additional metadata.
 */
export interface CompressionResultWithDetails extends CompressionResult {
  /** Whether AVIF fallback was used */
  usedAvifFallback?: boolean;
  /** Original file name */
  originalName?: string;
}

/**
 * Compression settings stored in localStorage.
 */
export interface CompressionSettings {
  /** Maximum file size in MB */
  maxSizeMB: number;
  /** Maximum width or height */
  maxWidthOrHeight: number;
  /** Initial quality (0-1) */
  initialQuality: number;
  /** Minimum savings threshold to accept compression */
  minSavingsPercent: number;
}

// ============= Batch Recompression Types =============

/**
 * Image queued for recompression.
 */
export interface ImageToRecompress {
  /** Unique identifier */
  id: string;
  /** Current image URL */
  url: string;
  /** Database table containing the image */
  table: "artworks" | "artwork_images" | "studio_images";
  /** Field name in the table */
  field: "image_url" | "image_detail_url";
  /** Path in storage bucket */
  storagePath: string;
}

/**
 * Progress tracking for batch recompression.
 */
export interface RecompressionProgress {
  /** Total images to process */
  total: number;
  /** Completed count */
  completed: number;
  /** Currently processing image URL */
  current: string | null;
  /** Error messages */
  errors: string[];
  /** Savings statistics */
  savings: {
    originalTotal: number;
    compressedTotal: number;
  };
}

/**
 * Batch recompression job status.
 */
export interface BatchRecompressionJob {
  /** Total number of images to process */
  total: number;
  /** Number of images processed */
  processed: number;
  /** Number of successful compressions */
  successful: number;
  /** Number of failed compressions */
  failed: number;
  /** Total bytes saved */
  bytesSaved: number;
  /** Whether the job is currently running */
  isRunning: boolean;
  /** Error messages if any */
  errors: string[];
}
