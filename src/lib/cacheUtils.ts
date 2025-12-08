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
