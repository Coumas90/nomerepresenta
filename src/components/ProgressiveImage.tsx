import { useState, useEffect, useMemo } from "react";
import { useImageLazyLoad } from "@/hooks/useImageLazyLoad";
import { ImageSkeleton } from "./ImageSkeleton";
import { 
  getWebPUrl, 
  getAVIFUrl,
  getOptimizedImageUrl, 
  getResponsiveSrcSet, 
  getWebPSrcSet,
  getAVIFSrcSet,
  supportsImageTransforms,
  isLocalImage,
  getGradientPlaceholder,
  RESPONSIVE_WIDTHS,
  RESPONSIVE_SIZES,
} from "@/lib/imageUtils";

interface ProgressiveImageProps {
  src: string;
  alt: string;
  className?: string;
  onClick?: () => void;
  eager?: boolean;
  skipInternalFade?: boolean;
  skeletonVariant?: "default" | "shimmer" | "pulse";
  /** Low-res placeholder URL for blur-up effect */
  placeholder?: string;
  /** Enable blur-up effect (uses tiny version of image) */
  blurUp?: boolean;
  /** Enable modern formats (WebP/AVIF) with fallback (default: true) */
  modernFormats?: boolean;
  /** Enable AVIF format (best compression, default: true) */
  avif?: boolean;
  /** Enable WebP format (good compression, wide support, default: true) */
  webp?: boolean;
  /** Sizes attribute for responsive images (e.g., "100vw" or "(min-width: 768px) 50vw, 100vw") */
  sizes?: string;
  /** Enable responsive srcset (default: true for Supabase images) */
  responsive?: boolean;
  /** Preset for responsive widths */
  responsivePreset?: keyof typeof RESPONSIVE_WIDTHS;
  /** Object-fit mode for the image (default: "cover") */
  objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
}

// Generate a placeholder URL based on image type
const getTinyPlaceholder = (src: string, width = 20): string => {
  // For Supabase images, use server-side transform for tiny version
  if (supportsImageTransforms(src)) {
    return getOptimizedImageUrl(src, { width, quality: 20 });
  }
  
  // For local images, use a gradient placeholder (works well with blur-up)
  if (isLocalImage(src)) {
    return getGradientPlaceholder();
  }
  
  // For other URLs (external), return the original (no blur-up effect)
  return src;
};

export const ProgressiveImage = ({ 
  src, 
  alt, 
  className = "", 
  onClick, 
  eager = false, 
  skipInternalFade = false,
  skeletonVariant = "shimmer",
  placeholder,
  blurUp = false,
  modernFormats = true,
  avif = true,
  webp = true,
  sizes = RESPONSIVE_SIZES.fullWidth,
  responsive = true,
  responsivePreset = "large",
  objectFit = "cover",
}: ProgressiveImageProps) => {
  const { imgRef, isVisible, isLoaded, setIsLoaded } = useImageLazyLoad();
  const [error, setError] = useState(false);
  const [placeholderLoaded, setPlaceholderLoaded] = useState(false);
  const [avifFailed, setAvifFailed] = useState(false);
  const [webpFailed, setWebpFailed] = useState(false);

  // If eager is true, load immediately without lazy loading
  const shouldLoad = eager || isVisible;

  // Check if image supports transforms
  const canTransform = useMemo(() => supportsImageTransforms(src), [src]);

  // Use provided placeholder or generate tiny version for blur-up
  const placeholderSrc = placeholder || (blurUp ? getTinyPlaceholder(src) : null);

  // Generate responsive srcset for original format
  const srcSet = useMemo(() => {
    if (!responsive || !canTransform) return undefined;
    return getResponsiveSrcSet(src, RESPONSIVE_WIDTHS[responsivePreset]);
  }, [src, responsive, canTransform, responsivePreset]);

  // Generate AVIF srcset (best compression)
  const avifSrcSet = useMemo(() => {
    if (!modernFormats || !avif || avifFailed || !canTransform) return undefined;
    return getAVIFSrcSet(src, RESPONSIVE_WIDTHS[responsivePreset]);
  }, [src, modernFormats, avif, avifFailed, canTransform, responsivePreset]);

  // Generate single AVIF URL as fallback
  const avifSrc = useMemo(() => {
    if (!modernFormats || !avif || avifFailed) return null;
    return getAVIFUrl(src);
  }, [src, modernFormats, avif, avifFailed]);

  // Generate WebP srcset (good compression, wide support)
  const webpSrcSet = useMemo(() => {
    if (!modernFormats || !webp || webpFailed || !canTransform) return undefined;
    return getWebPSrcSet(src, RESPONSIVE_WIDTHS[responsivePreset]);
  }, [src, modernFormats, webp, webpFailed, canTransform, responsivePreset]);

  // Generate single WebP URL as fallback
  const webpSrc = useMemo(() => {
    if (!modernFormats || !webp || webpFailed) return null;
    return getWebPUrl(src);
  }, [src, modernFormats, webp, webpFailed]);

  // Reset states when src changes
  useEffect(() => {
    setIsLoaded(false);
    setPlaceholderLoaded(false);
    setError(false);
    setAvifFailed(false);
    setWebpFailed(false);
  }, [src, setIsLoaded]);

  const handleImageLoad = () => {
    setIsLoaded(true);
  };

  const handleImageError = () => {
    // Try fallback chain: AVIF -> WebP -> Original
    if ((avifSrc || avifSrcSet) && !avifFailed) {
      setAvifFailed(true);
    } else if ((webpSrc || webpSrcSet) && !webpFailed) {
      setWebpFailed(true);
    } else {
      setError(true);
    }
  };

  const objectFitClass = objectFit === "contain" ? "object-contain" : objectFit === "fill" ? "object-fill" : objectFit === "none" ? "object-none" : objectFit === "scale-down" ? "object-scale-down" : "object-cover";
  const heightClass = objectFit === "contain" ? "h-auto" : "h-full";
  const imageClasses = `w-full ${heightClass} ${objectFitClass} transition-all duration-500 ease-out z-20 relative ${
    skipInternalFade ? "opacity-100" : (isLoaded ? "opacity-100 blur-0" : "opacity-0")
  } ${onClick ? 'cursor-pointer' : ''}`;

  // Determine which formats to show (browsers pick the first supported)
  const showAvif = (avifSrcSet || avifSrc) && !avifFailed;
  const showWebp = (webpSrcSet || webpSrc) && !webpFailed;

  return (
    <div ref={imgRef} className={`relative ${objectFit === "contain" ? "" : "overflow-hidden"} ${className}`}>
      {/* Skeleton loading state - shown until placeholder or main image loads */}
      {!isLoaded && !placeholderLoaded && !skipInternalFade && (
        <ImageSkeleton 
          className="absolute inset-0 z-0" 
          variant={skeletonVariant}
        />
      )}

      {/* Blur-up placeholder image */}
      {placeholderSrc && shouldLoad && !skipInternalFade && (
        <img
          src={placeholderSrc}
          alt=""
          aria-hidden="true"
          onLoad={() => setPlaceholderLoaded(true)}
          className={`absolute inset-0 w-full h-full ${objectFitClass} transition-opacity duration-300 z-10 blur-up-placeholder ${
            placeholderLoaded && !isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}
      
      {/* Main image with AVIF, WebP, and responsive srcset support using picture element */}
      {shouldLoad && (
        <picture>
          {/* AVIF source (best compression) - browsers that support AVIF will use this first */}
          {showAvif && avifSrcSet && (
            <source 
              srcSet={avifSrcSet}
              sizes={sizes}
              type="image/avif"
            />
          )}
          
          {/* Single AVIF source fallback if no srcset */}
          {showAvif && !avifSrcSet && avifSrc && (
            <source 
              srcSet={avifSrc} 
              type="image/avif"
            />
          )}

          {/* WebP source (good compression, wide support) - fallback from AVIF */}
          {showWebp && webpSrcSet && (
            <source 
              srcSet={webpSrcSet}
              sizes={sizes}
              type="image/webp"
            />
          )}
          
          {/* Single WebP source fallback if no srcset */}
          {showWebp && !webpSrcSet && webpSrc && (
            <source 
              srcSet={webpSrc} 
              type="image/webp"
            />
          )}
          
          {/* Fallback image with responsive srcset for browsers that don't support modern formats */}
          <img
            src={src}
            srcSet={srcSet}
            alt={alt}
            onClick={onClick}
            onLoad={handleImageLoad}
            onError={handleImageError}
            className={imageClasses}
            loading={eager ? "eager" : "lazy"}
            decoding="async"
            sizes={sizes}
          />
        </picture>
      )}
      
      {/* Error fallback */}
      {error && (
        <div className="absolute inset-0 bg-muted flex items-center justify-center z-30">
          <span className="text-xs text-muted-foreground">Failed to load</span>
        </div>
      )}
    </div>
  );
};

// Re-export responsive utilities for convenience
export { RESPONSIVE_SIZES, RESPONSIVE_WIDTHS } from "@/lib/imageUtils";
