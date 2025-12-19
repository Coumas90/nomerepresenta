import imageCompression from 'browser-image-compression';

export interface CompressionOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  useWebWorker?: boolean;
  fileType?: 'image/webp' | 'image/jpeg' | 'image/png';
  initialQuality?: number;
}

const DEFAULT_OPTIONS: CompressionOptions = {
  maxSizeMB: 2,
  maxWidthOrHeight: 2400,
  useWebWorker: true,
  fileType: 'image/webp',
  initialQuality: 0.85,
};

/**
 * Compress and convert an image file to WebP format
 * Reduces file size significantly while maintaining quality
 */
export const compressImage = async (
  file: File,
  options: CompressionOptions = {}
): Promise<File> => {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
  
  // Skip compression for already small files or non-image files
  if (!file.type.startsWith('image/') || file.size < 50 * 1024) {
    return file;
  }

  try {
    console.log(`[Compression] Starting: ${file.name} (${formatFileSize(file.size)})`);
    
    const compressedBlob = await imageCompression(file, {
      maxSizeMB: mergedOptions.maxSizeMB!,
      maxWidthOrHeight: mergedOptions.maxWidthOrHeight!,
      useWebWorker: mergedOptions.useWebWorker!,
      fileType: mergedOptions.fileType!,
      initialQuality: mergedOptions.initialQuality!,
    });

    // Create new file with .webp extension
    const newFileName = file.name.replace(/\.(jpg|jpeg|png|gif|bmp|tiff?)$/i, '.webp');
    const compressedFile = new File([compressedBlob], newFileName, {
      type: mergedOptions.fileType!,
    });

    const savings = ((1 - compressedFile.size / file.size) * 100).toFixed(1);
    console.log(
      `[Compression] Complete: ${newFileName} (${formatFileSize(compressedFile.size)}) - ${savings}% smaller`
    );

    return compressedFile;
  } catch (error) {
    console.error('[Compression] Failed, using original:', error);
    return file;
  }
};

/**
 * Compress multiple images in parallel with concurrency limit
 */
export const compressImages = async (
  files: File[],
  options: CompressionOptions = {},
  concurrency = 3
): Promise<File[]> => {
  const results: File[] = [];
  
  for (let i = 0; i < files.length; i += concurrency) {
    const batch = files.slice(i, i + concurrency);
    const compressed = await Promise.all(
      batch.map(file => compressImage(file, options))
    );
    results.push(...compressed);
  }
  
  return results;
};

/**
 * Format file size for display
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

/**
 * Check if WebP is supported in the browser
 */
export const supportsWebP = (): boolean => {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL('image/webp').startsWith('data:image/webp');
};
