import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useHapticFeedback } from "./useHapticFeedback";

/**
 * Progress data during an active swipe gesture
 */
export interface SwipeProgress {
  /** Current delta from start position (negative = up/left, positive = down/right) */
  delta: number;
  /** Progress as percentage (0-1) towards threshold */
  progress: number;
  /** Direction of the swipe */
  direction: "up" | "down" | "left" | "right" | null;
  /** Whether the swipe would trigger if released now */
  wouldTrigger: boolean;
  /** Current velocity in pixels per millisecond */
  velocity: number;
}

interface UseSwipeNavigationOptions {
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onWheelUp?: () => void;
  onWheelDown?: () => void;
  /** Callback fired during swipe gesture with progress data */
  onSwipeProgress?: (progress: SwipeProgress | null) => void;
  /** Base threshold in pixels (will be adjusted based on viewport) */
  threshold?: number;
  wheelThreshold?: number;
  cooldown?: number;
  enabled?: boolean;
  hapticFeedback?: boolean;
  /** Minimum velocity (px/ms) to trigger swipe regardless of distance */
  velocityThreshold?: number;
}

interface UseSwipeNavigationReturn {
  isScrolling: boolean;
  setIsScrolling: (value: boolean) => void;
  /** Current swipe progress (null when not swiping) */
  swipeProgress: SwipeProgress | null;
}

/**
 * Calculate responsive threshold based on viewport size
 * Smaller screens = smaller thresholds for easier swiping
 */
function getResponsiveThreshold(baseThreshold: number): number {
  if (typeof window === "undefined") return baseThreshold;
  
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const smallerDimension = Math.min(viewportWidth, viewportHeight);
  
  // Scale threshold: smaller screens get proportionally smaller thresholds
  // Mobile (<640px): 60-80% of base
  // Tablet (640-1024px): 80-100% of base
  // Desktop (>1024px): 100% of base
  if (smallerDimension < 640) {
    return baseThreshold * (0.6 + (smallerDimension / 640) * 0.2);
  } else if (smallerDimension < 1024) {
    return baseThreshold * (0.8 + ((smallerDimension - 640) / 384) * 0.2);
  }
  return baseThreshold;
}

/**
 * Enhanced swipe navigation hook with velocity detection,
 * responsive thresholds, and progress callbacks
 */
export function useSwipeNavigation({
  onSwipeUp,
  onSwipeDown,
  onSwipeLeft,
  onSwipeRight,
  onWheelUp,
  onWheelDown,
  onSwipeProgress,
  threshold = 50,
  wheelThreshold = 30,
  cooldown = 600,
  enabled = true,
  hapticFeedback = true,
  velocityThreshold = 0.5, // px/ms - fast flicks trigger even with small distance
}: UseSwipeNavigationOptions): UseSwipeNavigationReturn {
  const [isScrolling, setIsScrolling] = useState(false);
  const [swipeProgress, setSwipeProgress] = useState<SwipeProgress | null>(null);
  
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartRef = useRef({ x: 0, y: 0, time: 0 });
  const lastTouchRef = useRef({ x: 0, y: 0, time: 0 });
  const haptic = useHapticFeedback();

  // Calculate responsive threshold
  const responsiveThreshold = useMemo(() => {
    return getResponsiveThreshold(threshold);
  }, [threshold]);

  // Helper to set scrolling state with cooldown and haptic feedback
  const triggerWithCooldown = useCallback((
    callback?: () => void, 
    useHaptic = true,
    intensity: "light" | "medium" | "heavy" = "light"
  ) => {
    if (!callback) return;
    
    // Trigger haptic feedback with appropriate intensity
    if (hapticFeedback && useHaptic) {
      if (intensity === "heavy") {
        haptic.medium();
      } else if (intensity === "medium") {
        haptic.light();
      } else {
        haptic.light();
      }
    }
    
    setIsScrolling(true);
    setSwipeProgress(null);
    onSwipeProgress?.(null);
    callback();
    
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
    }, cooldown);
  }, [cooldown, hapticFeedback, haptic, onSwipeProgress]);

  // Calculate swipe direction from deltas
  const getSwipeDirection = useCallback((deltaX: number, deltaY: number): "up" | "down" | "left" | "right" | null => {
    const isVertical = Math.abs(deltaY) > Math.abs(deltaX);
    
    if (isVertical) {
      if (Math.abs(deltaY) < 5) return null;
      return deltaY > 0 ? "up" : "down";
    } else {
      if (Math.abs(deltaX) < 5) return null;
      return deltaX > 0 ? "left" : "right";
    }
  }, []);

  // Wheel navigation (no haptic - desktop only)
  useEffect(() => {
    if (!enabled || (!onWheelUp && !onWheelDown)) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      
      if (isScrolling) return;
      if (Math.abs(e.deltaY) < wheelThreshold) return;
      
      if (e.deltaY > 0) {
        triggerWithCooldown(onWheelDown, false);
      } else {
        triggerWithCooldown(onWheelUp, false);
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

  // Touch/swipe navigation with velocity detection and progress callbacks
  useEffect(() => {
    if (!enabled) return;

    const handleTouchStart = (e: TouchEvent) => {
      const now = Date.now();
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        time: now,
      };
      lastTouchRef.current = { ...touchStartRef.current };
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isScrolling) return;

      const currentX = e.touches[0].clientX;
      const currentY = e.touches[0].clientY;
      const now = Date.now();
      
      const deltaX = touchStartRef.current.x - currentX;
      const deltaY = touchStartRef.current.y - currentY;
      
      // Calculate instantaneous velocity from last touch point
      const timeDelta = now - lastTouchRef.current.time;
      const distanceDelta = Math.sqrt(
        Math.pow(currentX - lastTouchRef.current.x, 2) + 
        Math.pow(currentY - lastTouchRef.current.y, 2)
      );
      const velocity = timeDelta > 0 ? distanceDelta / timeDelta : 0;
      
      // Update last touch for next velocity calculation
      lastTouchRef.current = { x: currentX, y: currentY, time: now };
      
      // Determine primary direction
      const direction = getSwipeDirection(deltaX, deltaY);
      const isVertical = Math.abs(deltaY) > Math.abs(deltaX);
      const primaryDelta = isVertical ? deltaY : deltaX;
      const progress = Math.min(Math.abs(primaryDelta) / responsiveThreshold, 1);
      
      // Would trigger if released now (either by distance or velocity)
      const wouldTriggerByDistance = Math.abs(primaryDelta) > responsiveThreshold;
      const wouldTriggerByVelocity = velocity > velocityThreshold && Math.abs(primaryDelta) > responsiveThreshold * 0.3;
      const wouldTrigger = wouldTriggerByDistance || wouldTriggerByVelocity;
      
      const progressData: SwipeProgress = {
        delta: primaryDelta,
        progress,
        direction,
        wouldTrigger,
        velocity,
      };
      
      setSwipeProgress(progressData);
      onSwipeProgress?.(progressData);
      
      // Haptic feedback at threshold crossing
      if (wouldTrigger && hapticFeedback) {
        // Light tap when crossing threshold
        haptic.light();
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (isScrolling) {
        setSwipeProgress(null);
        onSwipeProgress?.(null);
        return;
      }

      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const touchEndTime = Date.now();
      
      const deltaX = touchStartRef.current.x - touchEndX;
      const deltaY = touchStartRef.current.y - touchEndY;
      const totalTime = touchEndTime - touchStartRef.current.time;
      
      // Calculate overall velocity
      const totalDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const overallVelocity = totalTime > 0 ? totalDistance / totalTime : 0;

      // Determine primary swipe direction
      const isVertical = Math.abs(deltaY) > Math.abs(deltaX);
      const primaryDelta = isVertical ? Math.abs(deltaY) : Math.abs(deltaX);
      
      // Trigger conditions:
      // 1. Distance exceeds threshold OR
      // 2. Velocity exceeds threshold AND distance > 30% of threshold (prevent accidental triggers)
      const triggeredByDistance = primaryDelta > responsiveThreshold;
      const triggeredByVelocity = overallVelocity > velocityThreshold && primaryDelta > responsiveThreshold * 0.3;
      const shouldTrigger = triggeredByDistance || triggeredByVelocity;
      
      // Determine haptic intensity based on trigger method
      const hapticIntensity: "light" | "medium" | "heavy" = 
        triggeredByVelocity && overallVelocity > velocityThreshold * 2 ? "heavy" :
        triggeredByVelocity ? "medium" : "light";

      if (shouldTrigger) {
        if (isVertical) {
          if (deltaY > 0 && onSwipeUp) {
            triggerWithCooldown(onSwipeUp, true, hapticIntensity);
          } else if (deltaY < 0 && onSwipeDown) {
            triggerWithCooldown(onSwipeDown, true, hapticIntensity);
          }
        } else {
          if (deltaX > 0 && onSwipeLeft) {
            triggerWithCooldown(onSwipeLeft, true, hapticIntensity);
          } else if (deltaX < 0 && onSwipeRight) {
            triggerWithCooldown(onSwipeRight, true, hapticIntensity);
          }
        }
      }
      
      // Clear progress state
      setSwipeProgress(null);
      onSwipeProgress?.(null);
    };

    const handleTouchCancel = () => {
      setSwipeProgress(null);
      onSwipeProgress?.(null);
    };

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    window.addEventListener("touchcancel", handleTouchCancel, { passive: true });

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("touchcancel", handleTouchCancel);
    };
  }, [
    enabled, 
    onSwipeUp, 
    onSwipeDown, 
    onSwipeLeft, 
    onSwipeRight, 
    isScrolling, 
    responsiveThreshold, 
    velocityThreshold,
    triggerWithCooldown, 
    hapticFeedback, 
    haptic,
    onSwipeProgress,
    getSwipeDirection,
  ]);

  return {
    isScrolling,
    setIsScrolling,
    swipeProgress,
  };
}
