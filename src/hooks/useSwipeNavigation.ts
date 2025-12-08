import { useEffect, useRef, useState, useCallback } from "react";

interface UseSwipeNavigationOptions {
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onWheelUp?: () => void;
  onWheelDown?: () => void;
  threshold?: number;
  wheelThreshold?: number;
  cooldown?: number;
  enabled?: boolean;
}

interface UseSwipeNavigationReturn {
  isScrolling: boolean;
  setIsScrolling: (value: boolean) => void;
}

export function useSwipeNavigation({
  onSwipeUp,
  onSwipeDown,
  onSwipeLeft,
  onSwipeRight,
  onWheelUp,
  onWheelDown,
  threshold = 50,
  wheelThreshold = 30,
  cooldown = 600,
  enabled = true,
}: UseSwipeNavigationOptions): UseSwipeNavigationReturn {
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartRef = useRef({ x: 0, y: 0 });

  // Helper to set scrolling state with cooldown
  const triggerWithCooldown = useCallback((callback?: () => void) => {
    if (!callback) return;
    
    setIsScrolling(true);
    callback();
    
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, cooldown);
  }, [cooldown]);

  // Wheel navigation
  useEffect(() => {
    if (!enabled || (!onWheelUp && !onWheelDown)) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      
      if (isScrolling) return;
      if (Math.abs(e.deltaY) < wheelThreshold) return;
      
      if (e.deltaY > 0) {
        triggerWithCooldown(onWheelDown);
      } else {
        triggerWithCooldown(onWheelUp);
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      window.removeEventListener("wheel", handleWheel);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [enabled, onWheelUp, onWheelDown, isScrolling, wheelThreshold, triggerWithCooldown]);

  // Touch/swipe navigation
  useEffect(() => {
    if (!enabled) return;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (isScrolling) return;

      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const deltaX = touchStartRef.current.x - touchEndX;
      const deltaY = touchStartRef.current.y - touchEndY;

      // Determine primary swipe direction
      const isVertical = Math.abs(deltaY) > Math.abs(deltaX);

      if (isVertical && Math.abs(deltaY) > threshold) {
        // Vertical swipe
        if (deltaY > 0 && onSwipeUp) {
          triggerWithCooldown(onSwipeUp);
        } else if (deltaY < 0 && onSwipeDown) {
          triggerWithCooldown(onSwipeDown);
        }
      } else if (!isVertical && Math.abs(deltaX) > threshold) {
        // Horizontal swipe (no cooldown needed for image navigation)
        if (deltaX > 0 && onSwipeLeft) {
          onSwipeLeft();
        } else if (deltaX < 0 && onSwipeRight) {
          onSwipeRight();
        }
      }
    };

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [enabled, onSwipeUp, onSwipeDown, onSwipeLeft, onSwipeRight, isScrolling, threshold, triggerWithCooldown]);

  return {
    isScrolling,
    setIsScrolling,
  };
}
