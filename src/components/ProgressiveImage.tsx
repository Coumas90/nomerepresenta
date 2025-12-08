import { useState, useEffect, useMemo } from "react";
import { useImageLazyLoad } from "@/hooks/useImageLazyLoad";
import { ImageSkeleton } from "./ImageSkeleton";
import { 
  getWebPUrl, 
  getOptimizedImageUrl, 
  getResponsiveSrcSet, 
  getWebPSrcSet,
  supportsImageTransforms,
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
  /** Enable WebP format with fallback (default: true) */
  webp?: boolean;
  /** Sizes attribute for responsive images (e.g., "100vw" or "(min-width: 768px) 50vw, 100vw") */
  sizes?: string;
  /** Enable responsive srcset (default: true for Supabase images) */
  responsive?: boolean;
  /** Preset for responsive widths */
  responsivePreset?: keyof typeof RESPONSIVE_WIDTHS;
}

// Generate a tiny placeholder URL by adding transform params (works with Supabase Storage)
const getTinyPlaceholder = (src: string, width = 20): string => {
  return getOptimizedImageUrl(src, { width, quality: 20 });
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
  webp = true,
  sizes = RESPONSIVE_SIZES.fullWidth,
  responsive = true,
  responsivePreset = "large",
}: ProgressiveImageProps) => {
  const { imgRef, isVisible, isLoaded, setIsLoaded } = useImageLazyLoad();
  const [error, setError] = useState(false);
  const [placeholderLoaded, setPlaceholderLoaded] = useState(false);
  const [webpFailed, setWebpFailed] = useState(false);

  // If eager is true, load immediately without lazy loading
  const shouldLoad = eager || isVisible;

  // Check if image supports transforms
  const canTransform = useMemo(() => supportsImageTransforms(src), [src]);

  // Use provided placeholder or generate tiny version for blur-up
  const placeholderSrc = placeholder || (blurUp ? getTinyPlaceholder(src) : null);

  // Generate responsive srcset
  const srcSet = useMemo(() => {
    if (!responsive || !canTransform) return undefined;
    return getResponsiveSrcSet(src, RESPONSIVE_WIDTHS[responsivePreset]);
  }, [src, responsive, canTransform, responsivePreset]);

  // Generate WebP srcset for responsive images
  const webpSrcSet = useMemo(() => {
    if (!webp || webpFailed || !canTransform) return undefined;
    return getWebPSrcSet(src, RESPONSIVE_WIDTHS[responsivePreset]);
  }, [src, webp, webpFailed, canTransform, responsivePreset]);

  // Generate single WebP URL as fallback
  const webpSrc = useMemo(() => {
    if (!webp || webpFailed) return null;
    return getWebPUrl(src);
  }, [src, webp, webpFailed]);

  // Reset states when src changes
  useEffect(() => {
    setIsLoaded(false);
    setPlaceholderLoaded(false);
    setError(false);
    setWebpFailed(false);
  }, [src, setIsLoaded]);

  const handleImageLoad = () => {
    setIsLoaded(true);
  };

  const handleImageError = () => {
    if ((webpSrc || webpSrcSet) && !webpFailed) {
      // WebP might have failed, fall back to original format
      setWebpFailed(true);
    } else {
      // Original format failed too
      setError(true);
    }
  };

  const imageClasses = `w-full h-full object-cover transition-all duration-500 ease-out z-20 relative ${
    skipInternalFade ? "opacity-100" : (isLoaded ? "opacity-100 blur-0" : "opacity-0")
  } ${onClick ? 'cursor-pointer' : ''}`;

  return (
    <div ref={imgRef} className={`relative overflow-hidden ${className}`}>
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
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 z-10 blur-up-placeholder ${
            placeholderLoaded && !isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}
      
      {/* Main image with WebP and responsive srcset support using picture element */}
      {shouldLoad && (
        <picture>
          {/* WebP source with responsive srcset - browsers that support WebP will use this */}
          {webpSrcSet && !webpFailed && (
            <source 
              srcSet={webpSrcSet}
              sizes={sizes}
              type="image/webp"
            />
          )}
          
          {/* Single WebP source fallback if no srcset */}
          {!webpSrcSet && webpSrc && !webpFailed && (
            <source 
              srcSet={webpSrc} 
              type="image/webp"
            />
          )}
          
          {/* Fallback image with responsive srcset for browsers that don't support WebP */}
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
