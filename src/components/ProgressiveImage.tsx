import { useState, useEffect } from "react";
import { useImageLazyLoad } from "@/hooks/useImageLazyLoad";
import { ImageSkeleton } from "./ImageSkeleton";

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
}

// Generate a tiny placeholder URL by adding transform params (works with Supabase Storage)
const getTinyPlaceholder = (src: string, width = 20): string => {
  // If it's a Supabase storage URL, we can use render transforms
  if (src.includes('supabase') && src.includes('/storage/')) {
    const url = new URL(src);
    url.searchParams.set('width', width.toString());
    url.searchParams.set('quality', '20');
    return url.toString();
  }
  // For other URLs, return as-is (will use CSS blur instead)
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
}: ProgressiveImageProps) => {
  const { imgRef, isVisible, isLoaded, setIsLoaded } = useImageLazyLoad();
  const [error, setError] = useState(false);
  const [placeholderLoaded, setPlaceholderLoaded] = useState(false);

  // If eager is true, load immediately without lazy loading
  const shouldLoad = eager || isVisible;

  // Use provided placeholder or generate tiny version for blur-up
  const placeholderSrc = placeholder || (blurUp ? getTinyPlaceholder(src) : null);

  // Reset states when src changes
  useEffect(() => {
    setIsLoaded(false);
    setPlaceholderLoaded(false);
    setError(false);
  }, [src, setIsLoaded]);

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
      
      {/* Actual full-resolution image */}
      {shouldLoad && (
        <img
          src={src}
          alt={alt}
          onClick={onClick}
          onLoad={() => setIsLoaded(true)}
          onError={() => setError(true)}
          className={`w-full h-full object-cover transition-all duration-500 ease-out z-20 relative ${
            skipInternalFade ? "opacity-100" : (isLoaded ? "opacity-100 blur-0" : "opacity-0")
          } ${onClick ? 'cursor-pointer' : ''}`}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
        />
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