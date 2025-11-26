import { useState } from "react";
import { useImageLazyLoad } from "@/hooks/useImageLazyLoad";

interface ProgressiveImageProps {
  src: string;
  alt: string;
  className?: string;
  onClick?: () => void;
}

export const ProgressiveImage = ({ src, alt, className = "", onClick }: ProgressiveImageProps) => {
  const { imgRef, isVisible, isLoaded, setIsLoaded } = useImageLazyLoad();
  const [error, setError] = useState(false);

  return (
    <div ref={imgRef} className={`relative ${className}`}>
      {/* Placeholder con blur */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-muted animate-pulse" />
      )}
      
      {/* Imagen real */}
      {isVisible && (
        <img
          src={src}
          alt={alt}
          onClick={onClick}
          onLoad={() => setIsLoaded(true)}
          onError={() => setError(true)}
          className={`w-full h-full object-cover transition-opacity duration-500 ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
          loading="lazy"
          decoding="async"
        />
      )}
      
      {/* Fallback para errores */}
      {error && (
        <div className="absolute inset-0 bg-muted flex items-center justify-center">
          <span className="text-xs text-muted-foreground">Failed to load</span>
        </div>
      )}
    </div>
  );
};
