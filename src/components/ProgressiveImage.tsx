import { useState } from "react";
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
}

export const ProgressiveImage = ({ 
  src, 
  alt, 
  className = "", 
  onClick, 
  eager = false, 
  skipInternalFade = false,
  skeletonVariant = "shimmer"
}: ProgressiveImageProps) => {
  const { imgRef, isVisible, isLoaded, setIsLoaded } = useImageLazyLoad();
  const [error, setError] = useState(false);

  // If eager is true, load immediately without lazy loading
  const shouldLoad = eager || isVisible;

  return (
    <div ref={imgRef} className={`relative ${className}`}>
      {/* Skeleton loading state */}
      {!isLoaded && !skipInternalFade && (
        <ImageSkeleton 
          className="absolute inset-0" 
          variant={skeletonVariant}
        />
      )}
      
      {/* Actual image */}
      {shouldLoad && (
        <img
          src={src}
          alt={alt}
          onClick={onClick}
          onLoad={() => setIsLoaded(true)}
          onError={() => setError(true)}
          className={`w-full h-full object-cover transition-opacity duration-500 ${
            skipInternalFade ? "opacity-100" : (isLoaded ? "opacity-100" : "opacity-0")
          }`}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
        />
      )}
      
      {/* Error fallback */}
      {error && (
        <div className="absolute inset-0 bg-muted flex items-center justify-center">
          <span className="text-xs text-muted-foreground">Failed to load</span>
        </div>
      )}
    </div>
  );
};