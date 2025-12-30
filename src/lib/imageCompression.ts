import imageCompression from 'browser-image-compression';
import type { CompressionOptions, CompressionResult } from '@/types';

const DEFAULT_OPTIONS: CompressionOptions = {
  maxSizeMB: 2,
  maxWidthOrHeight: 2400,
  useWebWorker: true,
  fileType: 'image/webp',
  initialQuality: 0.85,
  minSavingsPercent: 20, // If WebP doesn't save at least 20%, try AVIF
};

/**
 * Check if AVIF is supported in the browser
 */
export const supportsAVIF = (): boolean => {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL('image/avif').startsWith('data:image/avif');
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

/**
 * Compress image to a specific format
 */
const compressToFormat = async (
  file: File,
  format: 'image/webp' | 'image/avif',
  options: CompressionOptions
): Promise<{ blob: Blob; extension: string }> => {
  const compressedBlob = await imageCompression(file, {
    maxSizeMB: options.maxSizeMB!,
    maxWidthOrHeight: options.maxWidthOrHeight!,
    useWebWorker: options.useWebWorker!,
    fileType: format,
    initialQuality: options.initialQuality!,
  });

  const extension = format === 'image/avif' ? '.avif' : '.webp';
  return { blob: compressedBlob, extension };
};

/**
 * Compress and convert an image file to WebP format, with AVIF fallback
 * if WebP doesn't achieve enough savings
 */
export const compressImage = async (
  file: File,
  options: CompressionOptions = {}
): Promise<File> => {
  const result = await compressImageWithDetails(file, options);
  return result.file;
};

/**
 * Compress image with detailed result including savings info
 */
export const compressImageWithDetails = async (
  file: File,
  options: CompressionOptions = {}
): Promise<CompressionResult> => {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
  const originalSize = file.size;
  
  // Skip compression for already small files or non-image files
  if (!file.type.startsWith('image/') || file.size < 50 * 1024) {
    return {
      file,
      originalSize,
      compressedSize: file.size,
      savingsPercent: 0,
      format: 'original',
    };
  }

  try {
    console.log(`[Compression] Starting: ${file.name} (${formatFileSize(originalSize)})`);
    
    // First, try WebP compression
    const webpResult = await compressToFormat(file, 'image/webp', mergedOptions);
    const webpSavings = ((1 - webpResult.blob.size / originalSize) * 100);
    
    console.log(`[Compression] WebP: ${formatFileSize(webpResult.blob.size)} (${webpSavings.toFixed(1)}% savings)`);

    // If WebP achieves enough savings, use it
    if (webpSavings >= mergedOptions.minSavingsPercent!) {
      const newFileName = file.name.replace(/\.(jpg|jpeg|png|gif|bmp|tiff?)$/i, '.webp');
      const compressedFile = new File([webpResult.blob], newFileName, {
        type: 'image/webp',
      });
      
      console.log(`[Compression] Using WebP: ${newFileName} - ${webpSavings.toFixed(1)}% smaller`);
      
      return {
        file: compressedFile,
        originalSize,
        compressedSize: compressedFile.size,
        savingsPercent: webpSavings,
        format: 'webp',
      };
    }

    // WebP didn't save enough, try AVIF if supported
    if (supportsAVIF()) {
      console.log(`[Compression] WebP savings (${webpSavings.toFixed(1)}%) below threshold (${mergedOptions.minSavingsPercent}%), trying AVIF...`);
      
      try {
        const avifResult = await compressToFormat(file, 'image/avif', mergedOptions);
        const avifSavings = ((1 - avifResult.blob.size / originalSize) * 100);
        
        console.log(`[Compression] AVIF: ${formatFileSize(avifResult.blob.size)} (${avifSavings.toFixed(1)}% savings)`);

        // Use whichever format achieved better compression
        if (avifSavings > webpSavings) {
          const newFileName = file.name.replace(/\.(jpg|jpeg|png|gif|bmp|tiff?)$/i, '.avif');
          const compressedFile = new File([avifResult.blob], newFileName, {
            type: 'image/avif',
          });
          
          console.log(`[Compression] Using AVIF (better): ${newFileName} - ${avifSavings.toFixed(1)}% smaller`);
          
          return {
            file: compressedFile,
            originalSize,
            compressedSize: compressedFile.size,
            savingsPercent: avifSavings,
            format: 'avif',
          };
        }
      } catch (avifError) {
        console.warn('[Compression] AVIF compression failed, using WebP:', avifError);
      }
    }

    // Fall back to WebP even if savings are low
    const newFileName = file.name.replace(/\.(jpg|jpeg|png|gif|bmp|tiff?)$/i, '.webp');
    const compressedFile = new File([webpResult.blob], newFileName, {
      type: 'image/webp',
    });
    
    console.log(`[Compression] Using WebP (fallback): ${newFileName} - ${webpSavings.toFixed(1)}% smaller`);
    
    return {
      file: compressedFile,
      originalSize,
      compressedSize: compressedFile.size,
      savingsPercent: webpSavings,
      format: 'webp',
    };
  } catch (error) {
    console.error('[Compression] Failed, using original:', error);
    return {
      file,
      originalSize,
      compressedSize: file.size,
      savingsPercent: 0,
      format: 'original',
    };
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
