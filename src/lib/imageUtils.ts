/**
 * WebP Support Detection and Image Format Utilities
 */

let webpSupported: boolean | null = null;

/**
 * Check if the browser supports WebP format
 */
export const checkWebPSupport = (): Promise<boolean> => {
  if (webpSupported !== null) {
    return Promise.resolve(webpSupported);
  }

  return new Promise((resolve) => {
    const webpTestImage = new Image();
    webpTestImage.onload = () => {
      webpSupported = webpTestImage.width === 1;
      resolve(webpSupported);
    };
    webpTestImage.onerror = () => {
      webpSupported = false;
      resolve(false);
    };
    // Smallest valid WebP image (1x1 pixel)
    webpTestImage.src =
      "data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vv9UAA=";
  });
};

/**
 * Synchronous check for WebP support (returns cached result or assumes support)
 */
export const supportsWebP = (): boolean => {
  if (webpSupported !== null) {
    return webpSupported;
  }
  // Assume modern browser supports WebP, will be verified async
  return true;
};

/**
 * Initialize WebP support detection
 */
export const initWebPSupport = async (): Promise<void> => {
  await checkWebPSupport();
};

/**
 * Convert image URL to WebP format if supported by storage
 * Works with Supabase Storage render transforms
 */
export const getWebPUrl = (src: string): string | null => {
  if (!src) return null;

  // Supabase Storage URLs - add format transform
  if (src.includes("supabase") && src.includes("/storage/")) {
    try {
      const url = new URL(src);
      url.searchParams.set("format", "webp");
      return url.toString();
    } catch {
      return null;
    }
  }

  // For other URLs, check if there's a .webp version available
  // Replace common extensions with .webp
  const webpUrl = src.replace(/\.(jpg|jpeg|png|gif)$/i, ".webp");
  if (webpUrl !== src) {
    return webpUrl;
  }

  return null;
};

/**
 * Get optimized image URL with optional transformations
 */
export const getOptimizedImageUrl = (
  src: string,
  options: {
    width?: number;
    quality?: number;
    format?: "webp" | "avif" | "auto";
  } = {}
): string => {
  if (!src) return src;

  // Supabase Storage URLs - add render transforms
  if (src.includes("supabase") && src.includes("/storage/")) {
    try {
      const url = new URL(src);
      
      if (options.width) {
        url.searchParams.set("width", options.width.toString());
      }
      if (options.quality) {
        url.searchParams.set("quality", options.quality.toString());
      }
      if (options.format && options.format !== "auto") {
        url.searchParams.set("format", options.format);
      }
      
      return url.toString();
    } catch {
      return src;
    }
  }

  return src;
};

/**
 * Get image srcset for responsive images
 */
export const getResponsiveSrcSet = (
  src: string,
  widths: number[] = [320, 640, 960, 1280, 1920]
): string => {
  if (!src || !src.includes("supabase")) return "";

  return widths
    .map((width) => {
      const url = getOptimizedImageUrl(src, { width });
      return `${url} ${width}w`;
    })
    .join(", ");
};
