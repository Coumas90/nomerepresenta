import { useEffect, useRef } from "react";

interface PreloadOptions {
  /** Number of images to preload ahead */
  preloadAhead?: number;
  /** Number of images to preload behind */
  preloadBehind?: number;
}

/**
 * Preloads adjacent images for smoother navigation
 */
export const useImagePreloader = (
  images: (string | undefined)[],
  currentIndex: number,
  options: PreloadOptions = {}
) => {
  const { preloadAhead = 2, preloadBehind = 1 } = options;
  const preloadedImages = useRef<Set<string>>(new Set());

  useEffect(() => {
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
      };
    });
  }, [images, currentIndex, preloadAhead, preloadBehind]);

  return {
    isPreloaded: (url: string) => preloadedImages.current.has(url),
    preloadedCount: preloadedImages.current.size,
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
