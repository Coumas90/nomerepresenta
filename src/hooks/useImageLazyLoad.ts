import { useEffect, useRef, useState } from "react";

interface UseImageLazyLoadOptions {
  threshold?: number;
  rootMargin?: string;
}

export const useImageLazyLoad = (options: UseImageLazyLoadOptions = {}) => {
  const { threshold = 0.01, rootMargin = "600px" } = options;
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const currentRef = imgRef.current;
    if (!currentRef) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold, rootMargin }
    );

    observer.observe(currentRef);

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [threshold, rootMargin]);

  return { imgRef, isVisible, isLoaded, setIsLoaded };
};
