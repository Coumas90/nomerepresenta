/**
 * Utility functions for managing the artwork image cache
 * Designed to work alongside Workbox runtime caching without duplication
 */

const ARTWORK_CACHE_NAME = "artwork-images-cache";

// Cache names that Workbox might use (from vite.config.ts)
const WORKBOX_CACHE_NAMES = [
  "artwork-images-cache",
  "static-images-cache", 
  "external-images-cache",
];

/**
 * Get base URL without query parameters (for cache matching with ignoreSearch)
 */
const getBaseUrl = (url: string): string => {
  try {
    const parsed = new URL(url);
    return `${parsed.origin}${parsed.pathname}`;
  } catch {
    return url;
  }
};

/**
 * Check if a URL is already cached in any of the relevant caches
 * This checks both our manual cache and Workbox's runtime caches
 */
export const isUrlCachedAnywhere = async (url: string): Promise<boolean> => {
  if (!("caches" in window)) return false;

  try {
    const baseUrl = getBaseUrl(url);
    
    // Check all possible cache names
    for (const cacheName of WORKBOX_CACHE_NAMES) {
      try {
        const cache = await caches.open(cacheName);
        
        // Try exact match first
        const exactMatch = await cache.match(url);
        if (exactMatch) return true;
        
        // Try base URL match (without query params, like Workbox's ignoreSearch)
        if (baseUrl !== url) {
          const baseMatch = await cache.match(baseUrl);
          if (baseMatch) return true;
        }
        
        // For Supabase URLs, also check with different query params
        // since Workbox uses ignoreSearch: true
        if (url.includes("supabase") && url.includes("/storage/")) {
          const keys = await cache.keys();
          const hasMatch = keys.some(request => {
            const cachedBase = getBaseUrl(request.url);
            return cachedBase === baseUrl;
          });
          if (hasMatch) return true;
        }
      } catch {
        // Cache might not exist yet, continue checking others
      }
    }
    
    return false;
  } catch {
    return false;
  }
};

/**
 * Pre-cache a list of image URLs for offline viewing
 * @deprecated Use precacheImagesProgressive instead to avoid cache duplication
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
 * Pre-cache images progressively - only cache images not already in ANY cache
 * This avoids redundant network requests and prevents duplication with Workbox
 */
export const precacheImagesProgressive = async (urls: string[]): Promise<number> => {
  if (!("caches" in window)) return 0;

  try {
    const cache = await caches.open(ARTWORK_CACHE_NAME);
    const validUrls = urls.filter((url) => url && url.startsWith("http"));
    let cachedCount = 0;
    let skippedCount = 0;

    // Check which URLs are already cached (in any cache) and only fetch new ones
    await Promise.allSettled(
      validUrls.map(async (url) => {
        try {
          // Check if already cached anywhere (including Workbox caches)
          const alreadyCached = await isUrlCachedAnywhere(url);
          if (alreadyCached) {
            skippedCount++;
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

    // Debug info (only in development)
    if (skippedCount > 0) {
      console.debug(`Precache: ${cachedCount} new, ${skippedCount} already cached`);
    }

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
 * Check if an image is already cached (in any cache)
 */
export const isImageCached = async (url: string): Promise<boolean> => {
  return isUrlCachedAnywhere(url);
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
 * Clear all cached artwork images (manual cache only, not Workbox)
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
 * Get count of cached images across all relevant caches
 */
export const getCachedImageCount = async (): Promise<number> => {
  if (!("caches" in window)) return 0;

  try {
    let totalCount = 0;
    const seenUrls = new Set<string>();

    for (const cacheName of WORKBOX_CACHE_NAMES) {
      try {
        const cache = await caches.open(cacheName);
        const keys = await cache.keys();
        
        // Deduplicate by base URL
        for (const request of keys) {
          const baseUrl = getBaseUrl(request.url);
          if (!seenUrls.has(baseUrl)) {
            seenUrls.add(baseUrl);
            totalCount++;
          }
        }
      } catch {
        // Cache might not exist
      }
    }

    return totalCount;
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
