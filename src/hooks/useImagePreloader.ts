import { useEffect, useRef, useCallback } from "react";

interface PreloadOptions {
  /** Number of images to preload ahead */
  preloadAhead?: number;
  /** Number of images to preload behind */
  preloadBehind?: number;
  /** Maximum number of URLs to keep in the preloaded set (prevents memory bloat) */
  maxCachedUrls?: number;
}

/**
 * Preloads adjacent images for smoother navigation
 * Includes cleanup logic to prevent memory leaks from unbounded Set growth
 */
export const useImagePreloader = (
  images: (string | undefined)[],
  currentIndex: number,
  options: PreloadOptions = {}
) => {
  const { preloadAhead = 2, preloadBehind = 1, maxCachedUrls = 30 } = options;
  const preloadedImages = useRef<Set<string>>(new Set());
  const previousImagesRef = useRef<string[]>([]);

  // Cleanup old URLs when the images array changes significantly
  const cleanupStaleUrls = useCallback((currentImageUrls: string[]) => {
    const currentSet = new Set(currentImageUrls);
    const staleUrls: string[] = [];
    
    // Find URLs that are no longer in the current images list
    preloadedImages.current.forEach((url) => {
      if (!currentSet.has(url)) {
        staleUrls.push(url);
      }
    });
    
    // Remove stale URLs
    staleUrls.forEach((url) => {
      preloadedImages.current.delete(url);
    });
    
    return staleUrls.length;
  }, []);

  // Enforce maximum size by removing oldest entries (FIFO-like behavior)
  const enforceMaxSize = useCallback(() => {
    if (preloadedImages.current.size > maxCachedUrls) {
      const urlsArray = Array.from(preloadedImages.current);
      const urlsToRemove = urlsArray.slice(0, urlsArray.length - maxCachedUrls);
      urlsToRemove.forEach((url) => {
        preloadedImages.current.delete(url);
      });
    }
  }, [maxCachedUrls]);

  useEffect(() => {
    // Filter valid URLs
    const validImages = images.filter((url): url is string => Boolean(url));
    
    // Check if image list changed (different gallery/context)
    const imagesChanged = 
      previousImagesRef.current.length !== validImages.length ||
      !previousImagesRef.current.every((url, i) => url === validImages[i]);
    
    if (imagesChanged) {
      // Cleanup URLs no longer in the current image set
      cleanupStaleUrls(validImages);
      previousImagesRef.current = validImages;
    }

    const imagesToPreload: string[] = [];

    // Collect images to preload (ahead and behind current index)
    for (let i = currentIndex - preloadBehind; i <= currentIndex + preloadAhead; i++) {
      if (i >= 0 && i < images.length && i !== currentIndex) {
        const imageUrl = images[i];
        if (imageUrl && !preloadedImages.current.has(imageUrl)) {
          imagesToPreload.push(imageUrl);
        }
      }
    }

    // Preload images
    imagesToPreload.forEach((url) => {
      const img = new Image();
      img.src = url;
      img.onload = () => {
        preloadedImages.current.add(url);
        // Enforce max size after adding
        enforceMaxSize();
      };
    });

    // Cleanup function when component unmounts
    return () => {
      // Clear the Set to free memory references
      preloadedImages.current.clear();
    };
  }, [images, currentIndex, preloadAhead, preloadBehind, cleanupStaleUrls, enforceMaxSize]);

  return {
    isPreloaded: (url: string) => preloadedImages.current.has(url),
    preloadedCount: preloadedImages.current.size,
    /** Manually clear all preloaded URLs */
    clearPreloaded: () => preloadedImages.current.clear(),
  };
};

/**
 * Preloads a single image and returns loading state
 */
export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
};

/**
 * Preloads multiple images in parallel
 */
export const preloadImages = async (urls: string[]): Promise<void[]> => {
  return Promise.all(urls.filter(Boolean).map(preloadImage));
};
