/**
 * Utility functions for managing the artwork image cache
 */

const ARTWORK_CACHE_NAME = "artwork-images-cache";

/**
 * Pre-cache a list of image URLs for offline viewing
 */
export const precacheImages = async (urls: string[]): Promise<void> => {
  if (!("caches" in window)) return;

  try {
    const cache = await caches.open(ARTWORK_CACHE_NAME);
    const validUrls = urls.filter((url) => url && url.startsWith("http"));

    // Fetch and cache each image
    await Promise.allSettled(
      validUrls.map(async (url) => {
        try {
          const response = await fetch(url, { mode: "cors" });
          if (response.ok) {
            await cache.put(url, response);
          }
        } catch (e) {
          // Silently fail for individual images
          console.debug(`Failed to cache: ${url}`);
        }
      })
    );
  } catch (error) {
    console.error("Error precaching images:", error);
  }
};

/**
 * Pre-cache images progressively - only cache images not already in cache
 * This avoids redundant network requests and cache writes
 */
export const precacheImagesProgressive = async (urls: string[]): Promise<number> => {
  if (!("caches" in window)) return 0;

  try {
    const cache = await caches.open(ARTWORK_CACHE_NAME);
    const validUrls = urls.filter((url) => url && url.startsWith("http"));
    let cachedCount = 0;

    // Check which URLs are already cached and only fetch new ones
    const results = await Promise.allSettled(
      validUrls.map(async (url) => {
        try {
          // Check if already in cache
          const existingResponse = await cache.match(url);
          if (existingResponse) {
            return false; // Already cached, skip
          }

          // Fetch and cache
          const response = await fetch(url, { mode: "cors" });
          if (response.ok) {
            await cache.put(url, response);
            cachedCount++;
            return true;
          }
          return false;
        } catch (e) {
          console.debug(`Failed to cache: ${url}`);
          return false;
        }
      })
    );

    return cachedCount;
  } catch (error) {
    console.error("Error precaching images:", error);
    return 0;
  }
};

/**
 * Get images for progressive precaching based on current index
 * Returns URLs for adjacent artworks (configurable range)
 */
export const getAdjacentArtworkUrls = <T extends { image_url: string; image_detail_url: string }>(
  artworks: T[],
  currentIndex: number,
  options: { ahead?: number; behind?: number } = {}
): string[] => {
  const { ahead = 2, behind = 1 } = options;
  const urls: string[] = [];

  for (let i = currentIndex - behind; i <= currentIndex + ahead; i++) {
    if (i >= 0 && i < artworks.length) {
      const artwork = artworks[i];
      if (artwork.image_url) urls.push(artwork.image_url);
      if (artwork.image_detail_url) urls.push(artwork.image_detail_url);
    }
  }

  return urls.filter(Boolean);
};

/**
 * Check if an image is already cached
 */
export const isImageCached = async (url: string): Promise<boolean> => {
  if (!("caches" in window)) return false;

  try {
    const cache = await caches.open(ARTWORK_CACHE_NAME);
    const response = await cache.match(url);
    return !!response;
  } catch {
    return false;
  }
};

/**
 * Get cache storage estimate
 */
export const getCacheStorageInfo = async (): Promise<{
  usage: number;
  quota: number;
  usageFormatted: string;
} | null> => {
  if (!("storage" in navigator && "estimate" in navigator.storage)) {
    return null;
  }

  try {
    const estimate = await navigator.storage.estimate();
    const usage = estimate.usage || 0;
    const quota = estimate.quota || 0;

    return {
      usage,
      quota,
      usageFormatted: formatBytes(usage),
    };
  } catch {
    return null;
  }
};

/**
 * Clear all cached artwork images
 */
export const clearArtworkCache = async (): Promise<void> => {
  if (!("caches" in window)) return;

  try {
    await caches.delete(ARTWORK_CACHE_NAME);
  } catch (error) {
    console.error("Error clearing cache:", error);
  }
};

/**
 * Get count of cached images
 */
export const getCachedImageCount = async (): Promise<number> => {
  if (!("caches" in window)) return 0;

  try {
    const cache = await caches.open(ARTWORK_CACHE_NAME);
    const keys = await cache.keys();
    return keys.length;
  } catch {
    return 0;
  }
};

/**
 * Format bytes to human readable string
 */
const formatBytes = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};
