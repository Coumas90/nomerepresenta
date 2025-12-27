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
 * Compression settings stored in the database or config.
 */
export interface CompressionSettings {
  /** Maximum file size in MB */
  maxSizeMB: number;
  /** Maximum width or height */
  maxWidthOrHeight: number;
  /** Initial quality percentage (0-100) */
  quality: number;
  /** Whether AVIF fallback is enabled */
  enableAvifFallback: boolean;
  /** Minimum savings threshold to accept compression */
  minSavingsPercent: number;
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
