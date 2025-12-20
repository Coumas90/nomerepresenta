import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { compressImageWithDetails, formatFileSize } from '@/lib/imageCompression';
import { getCompressionOptions } from '@/hooks/useCompressionSettings';

export interface ImageToRecompress {
  id: string;
  url: string;
  table: 'artworks' | 'artwork_images' | 'studio_images';
  field: 'image_url' | 'image_detail_url';
  storagePath: string;
}

export interface RecompressionProgress {
  total: number;
  completed: number;
  current: string | null;
  errors: string[];
  savings: {
    originalTotal: number;
    compressedTotal: number;
  };
}

export const useBatchRecompression = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState<RecompressionProgress>({
    total: 0,
    completed: 0,
    current: null,
    errors: [],
    savings: { originalTotal: 0, compressedTotal: 0 },
  });

  const fetchAllImages = async (): Promise<ImageToRecompress[]> => {
    const images: ImageToRecompress[] = [];

    // Fetch artworks (main images)
    const { data: artworks } = await supabase.from('artworks').select('id, image_url, image_detail_url');
    if (artworks) {
      for (const artwork of artworks) {
        if (artwork.image_url) {
          const path = extractStoragePath(artwork.image_url);
          if (path) {
            images.push({
              id: artwork.id,
              url: artwork.image_url,
              table: 'artworks',
              field: 'image_url',
              storagePath: path,
            });
          }
        }
        if (artwork.image_detail_url) {
          const path = extractStoragePath(artwork.image_detail_url);
          if (path) {
            images.push({
              id: artwork.id,
              url: artwork.image_detail_url,
              table: 'artworks',
              field: 'image_detail_url',
              storagePath: path,
            });
          }
        }
      }
    }

    // Fetch artwork_images
    const { data: artworkImages } = await supabase.from('artwork_images').select('id, image_url');
    if (artworkImages) {
      for (const img of artworkImages) {
        const path = extractStoragePath(img.image_url);
        if (path) {
          images.push({
            id: img.id,
            url: img.image_url,
            table: 'artwork_images',
            field: 'image_url',
            storagePath: path,
          });
        }
      }
    }

    // Fetch studio_images
    const { data: studioImages } = await supabase.from('studio_images').select('id, image_url');
    if (studioImages) {
      for (const img of studioImages) {
        const path = extractStoragePath(img.image_url);
        if (path) {
          images.push({
            id: img.id,
            url: img.image_url,
            table: 'studio_images',
            field: 'image_url',
            storagePath: path,
          });
        }
      }
    }

    return images;
  };

  const extractStoragePath = (url: string): string | null => {
    try {
      const match = url.match(/artwork-images\/(.+)$/);
      return match ? match[1] : null;
    } catch {
      return null;
    }
  };

  const recompressImage = async (image: ImageToRecompress): Promise<{ originalSize: number; newSize: number } | null> => {
    try {
      // Download the image
      const response = await fetch(image.url);
      if (!response.ok) throw new Error(`Failed to download: ${response.status}`);
      
      const blob = await response.blob();
      const originalSize = blob.size;
      
      // Create a File from the blob
      const fileName = image.storagePath.split('/').pop() || 'image.jpg';
      const file = new File([blob], fileName, { type: blob.type });

      // Compress with current settings
      const compressionOptions = getCompressionOptions();
      const result = await compressImageWithDetails(file, compressionOptions);

      // Determine new file path
      const extension = result.format === 'avif' ? '.avif' : 
                       result.format === 'webp' ? '.webp' : 
                       fileName.substring(fileName.lastIndexOf('.'));
      
      const basePathWithoutExt = image.storagePath.replace(/\.(jpg|jpeg|png|gif|bmp|tiff?|webp|avif)$/i, '');
      const newPath = `${basePathWithoutExt}${extension}`;

      // Delete old file if path is different
      if (newPath !== image.storagePath) {
        await supabase.storage.from('artwork-images').remove([image.storagePath]);
      }

      // Upload new file
      const { error: uploadError } = await supabase.storage
        .from('artwork-images')
        .upload(newPath, result.file, {
          contentType: result.file.type,
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get new public URL
      const { data: urlData } = supabase.storage
        .from('artwork-images')
        .getPublicUrl(newPath);

      // Update database record
      const { error: updateError } = await supabase
        .from(image.table)
        .update({ [image.field]: urlData.publicUrl })
        .eq('id', image.id);

      if (updateError) throw updateError;

      console.log(`[Recompression] ${image.storagePath}: ${formatFileSize(originalSize)} → ${formatFileSize(result.compressedSize)} (${result.savingsPercent.toFixed(1)}% saved)`);

      return { originalSize, newSize: result.compressedSize };
    } catch (error) {
      console.error(`[Recompression] Failed for ${image.storagePath}:`, error);
      return null;
    }
  };

  const startRecompression = useCallback(async () => {
    setIsRunning(true);
    setProgress({
      total: 0,
      completed: 0,
      current: 'Fetching images...',
      errors: [],
      savings: { originalTotal: 0, compressedTotal: 0 },
    });

    try {
      const images = await fetchAllImages();
      
      setProgress(prev => ({
        ...prev,
        total: images.length,
        current: images.length > 0 ? images[0].storagePath : null,
      }));

      let originalTotal = 0;
      let compressedTotal = 0;
      const errors: string[] = [];

      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        
        setProgress(prev => ({
          ...prev,
          current: image.storagePath,
          completed: i,
        }));

        const result = await recompressImage(image);
        
        if (result) {
          originalTotal += result.originalSize;
          compressedTotal += result.newSize;
        } else {
          errors.push(image.storagePath);
        }

        setProgress(prev => ({
          ...prev,
          completed: i + 1,
          errors,
          savings: { originalTotal, compressedTotal },
        }));
      }

      setProgress(prev => ({
        ...prev,
        current: null,
        completed: images.length,
      }));
    } catch (error) {
      console.error('[Recompression] Fatal error:', error);
      setProgress(prev => ({
        ...prev,
        current: null,
        errors: [...prev.errors, 'Fatal error during recompression'],
      }));
    } finally {
      setIsRunning(false);
    }
  }, []);

  const cancelRecompression = useCallback(() => {
    setIsRunning(false);
  }, []);

  return {
    isRunning,
    progress,
    startRecompression,
    cancelRecompression,
  };
};
