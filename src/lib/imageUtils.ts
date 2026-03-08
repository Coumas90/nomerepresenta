/**
 * Modern Image Format Support Detection and Utilities
 * Supports WebP and AVIF with automatic fallbacks
 */

let webpSupported: boolean | null = null;
let avifSupported: boolean | null = null;

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
 * Check if the browser supports AVIF format
 */
export const checkAVIFSupport = (): Promise<boolean> => {
  if (avifSupported !== null) {
    return Promise.resolve(avifSupported);
  }

  return new Promise((resolve) => {
    const avifTestImage = new Image();
    avifTestImage.onload = () => {
      avifSupported = avifTestImage.width === 1;
      resolve(avifSupported);
    };
    avifTestImage.onerror = () => {
      avifSupported = false;
      resolve(false);
    };
    // Smallest valid AVIF image (1x1 pixel)
    avifTestImage.src =
      "data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKBzgABpAQ0AIyDQAAAAAUWghkLxbJ";
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
 * Synchronous check for AVIF support (returns cached result)
 */
export const supportsAVIF = (): boolean => {
  return avifSupported === true;
};

/**
 * Initialize format support detection
 */
export const initFormatSupport = async (): Promise<{
  webp: boolean;
  avif: boolean;
}> => {
  const [webp, avif] = await Promise.all([
    checkWebPSupport(),
    checkAVIFSupport(),
  ]);
  return { webp, avif };
};

/**
 * Convert image URL to WebP format if supported by storage
 * Works with Supabase Storage render transforms
 */
export const getWebPUrl = (src: string): string | null => {
  if (!src) return null;

  // Already a WebP file — no transform needed
  if (/\.webp(\?|$)/i.test(src)) return null;

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
  const webpUrl = src.replace(/\.(jpg|jpeg|png|gif)$/i, ".webp");
  if (webpUrl !== src) {
    return webpUrl;
  }

  return null;
};

/**
 * Convert image URL to AVIF format if supported by storage
 * Works with Supabase Storage render transforms
 */
export const getAVIFUrl = (src: string): string | null => {
  if (!src) return null;

  // Already an AVIF file — no transform needed
  if (/\.avif(\?|$)/i.test(src)) return null;

  // Supabase Storage URLs - add format transform
  if (src.includes("supabase") && src.includes("/storage/")) {
    try {
      const url = new URL(src);
      url.searchParams.set("format", "avif");
      return url.toString();
    } catch {
      return null;
    }
  }

  // For other URLs, check if there's an .avif version available
  const avifUrl = src.replace(/\.(jpg|jpeg|png|gif|webp)$/i, ".avif");
  if (avifUrl !== src) {
    return avifUrl;
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
 * Default responsive image widths
 */
export const RESPONSIVE_WIDTHS = {
  thumbnail: [160, 320],
  small: [320, 480, 640],
  medium: [480, 640, 960, 1280],
  large: [640, 960, 1280, 1920],
  full: [320, 640, 960, 1280, 1920, 2560],
};

/**
 * Default sizes attribute for common layouts
 */
export const RESPONSIVE_SIZES = {
  /** Full width on all screens */
  fullWidth: "100vw",
  /** Full width on mobile, 50% on tablet and up */
  halfWidth: "(min-width: 768px) 50vw, 100vw",
  /** Full width on mobile, third on desktop */
  thirdWidth: "(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw",
  /** Gallery thumbnail */
  thumbnail: "(min-width: 1024px) 20vw, (min-width: 768px) 33vw, 50vw",
  /** Hero/fullscreen image */
  hero: "100vw",
  /** Card image */
  card: "(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 100vw",
};

/**
 * Get image srcset for responsive images
 */
export const getResponsiveSrcSet = (
  src: string,
  widths: number[] = RESPONSIVE_WIDTHS.large,
  format?: "webp" | "avif"
): string => {
  if (!src) return "";

  // Check if URL supports transforms (Supabase Storage)
  const supportsTransforms = src.includes("supabase") && src.includes("/storage/");
  
  if (!supportsTransforms) return "";

  return widths
    .map((width) => {
      const url = getOptimizedImageUrl(src, { width, format });
      return `${url} ${width}w`;
    })
    .join(", ");
};

/**
 * Get WebP srcset for responsive images
 */
export const getWebPSrcSet = (
  src: string,
  widths: number[] = RESPONSIVE_WIDTHS.large
): string => {
  return getResponsiveSrcSet(src, widths, "webp");
};

/**
 * Get AVIF srcset for responsive images
 */
export const getAVIFSrcSet = (
  src: string,
  widths: number[] = RESPONSIVE_WIDTHS.large
): string => {
  return getResponsiveSrcSet(src, widths, "avif");
};

/**
 * Check if URL supports image transforms (Supabase Storage)
 */
export const supportsImageTransforms = (src: string): boolean => {
  return Boolean(src && src.includes("supabase") && src.includes("/storage/"));
};

/**
 * Check if URL is a local/public image (starts with / but not http)
 */
export const isLocalImage = (src: string): boolean => {
  if (!src) return false;
  return src.startsWith("/") && !src.startsWith("//");
};

/**
 * Generate a solid color placeholder as a data URL
 * Used for local images that don't support server-side transforms
 * 
 * @param color - HSL or hex color for the placeholder (default: neutral gray)
 * @returns A tiny data URL that can be used as blur-up placeholder
 */
export const getLocalPlaceholder = (
  color: string = "hsl(30, 5%, 80%)"
): string => {
  // Create a 1x1 pixel SVG with the specified color
  // This is the smallest possible placeholder that works for blur-up
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"><rect width="1" height="1" fill="${color}"/></svg>`;
  const encoded = btoa(svg);
  return `data:image/svg+xml;base64,${encoded}`;
};

/**
 * Generate a gradient placeholder as a data URL
 * Creates a subtle gradient that works well for blur-up effect
 */
export const getGradientPlaceholder = (
  colorTop: string = "hsl(30, 5%, 85%)",
  colorBottom: string = "hsl(30, 5%, 75%)"
): string => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="4" height="4">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style="stop-color:${colorTop}"/>
        <stop offset="100%" style="stop-color:${colorBottom}"/>
      </linearGradient>
    </defs>
    <rect width="4" height="4" fill="url(#g)"/>
  </svg>`;
  const encoded = btoa(svg);
  return `data:image/svg+xml;base64,${encoded}`;
};
