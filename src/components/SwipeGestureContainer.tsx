import React, { useCallback, useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

/**
 * Props for SwipeGestureContainer
 */
interface SwipeGestureContainerProps {
  children: React.ReactNode;
  /** Callback when swipe up is triggered */
  onSwipeUp?: () => void;
  /** Callback when swipe down is triggered */
  onSwipeDown?: () => void;
  /** Callback when swipe left is triggered */
  onSwipeLeft?: () => void;
  /** Callback when swipe right is triggered */
  onSwipeRight?: () => void;
  /** Whether to enable the container */
  enabled?: boolean;
  /** Direction(s) to allow swiping */
  direction?: "vertical" | "horizontal" | "both";
  /** Maximum rubber-band displacement in pixels */
  maxDisplacement?: number;
  /** Resistance factor (higher = harder to pull) */
  resistance?: number;
  /** Whether to show edge indicators */
  showEdgeIndicators?: boolean;
  /** Whether at first item vertically (can't go up/prev) */
  isAtStart?: boolean;
  /** Whether at last item vertically (can't go down/next) */
  isAtEnd?: boolean;
  /** Whether at first item horizontally (can't go left/prev) */
  isAtHorizontalStart?: boolean;
  /** Whether at last item horizontally (can't go right/next) */
  isAtHorizontalEnd?: boolean;
  /** Additional className */
  className?: string;
}

/**
 * Container component that provides rubber-band swipe effects
 * Wraps content and applies visual transform during swipe gestures
 */
export function SwipeGestureContainer({
  children,
  onSwipeUp,
  onSwipeDown,
  onSwipeLeft,
  onSwipeRight,
  enabled = true,
  direction = "vertical",
  maxDisplacement = 100,
  resistance = 2.5,
  showEdgeIndicators = true,
  isAtStart = false,
  isAtEnd = false,
  isAtHorizontalStart,
  isAtHorizontalEnd,
  className,
}: SwipeGestureContainerProps) {
  // Use vertical values as fallback for horizontal if not specified
  const hStart = isAtHorizontalStart ?? isAtStart;
  const hEnd = isAtHorizontalEnd ?? isAtEnd;
  const [transform, setTransform] = useState({ x: 0, y: 0 });
  const [isAnimating, setIsAnimating] = useState(false);
  const [activeDirection, setActiveDirection] = useState<"up" | "down" | "left" | "right" | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef({ x: 0, y: 0, time: 0 });
  const lastTouchRef = useRef({ x: 0, y: 0 });
  const isSwipingRef = useRef(false);

  // Calculate rubber-band displacement with resistance
  const calculateDisplacement = useCallback((delta: number): number => {
    const sign = delta > 0 ? 1 : -1;
    const absDelta = Math.abs(delta);
    // Logarithmic resistance for natural rubber-band feel
    const displaced = maxDisplacement * (1 - Math.exp(-absDelta / (maxDisplacement * resistance)));
    return sign * displaced;
  }, [maxDisplacement, resistance]);

  // Threshold for triggering swipe
  const threshold = 50;
  const velocityThreshold = 0.5;

  useEffect(() => {
    if (!enabled) return;

    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      };
      lastTouchRef.current = { x: touch.clientX, y: touch.clientY };
      isSwipingRef.current = false;
      setIsAnimating(false);
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      const deltaX = touchStartRef.current.x - touch.clientX;
      const deltaY = touchStartRef.current.y - touch.clientY;

      // Determine swipe direction on first significant movement
      if (!isSwipingRef.current && (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10)) {
        const isVertical = Math.abs(deltaY) > Math.abs(deltaX);
        
        if (direction === "vertical" && !isVertical) return;
        if (direction === "horizontal" && isVertical) return;
        
        isSwipingRef.current = true;
      }

      if (!isSwipingRef.current) return;

      const isVertical = Math.abs(deltaY) > Math.abs(deltaX);
      
      // Determine active direction
      if (isVertical) {
        setActiveDirection(deltaY > 0 ? "up" : "down");
      } else {
        setActiveDirection(deltaX > 0 ? "left" : "right");
      }

      // Check if at edge and trying to go further (axis-specific)
      const blockUp = isAtStart && deltaY > 0;
      const blockDown = isAtEnd && deltaY < 0;
      const blockLeft = hStart && deltaX > 0;
      const blockRight = hEnd && deltaX < 0;

      // Apply extra resistance at edges
      const edgeResistance = 
        (blockUp || blockDown || blockLeft || blockRight) ? 5 : 1;

      // Calculate displacement based on direction mode
      let newX = 0;
      let newY = 0;

      if (direction === "vertical" || direction === "both") {
        newY = calculateDisplacement(-deltaY / edgeResistance);
      }
      if (direction === "horizontal" || direction === "both") {
        newX = calculateDisplacement(-deltaX / edgeResistance);
      }

      setTransform({ x: newX, y: newY });
      lastTouchRef.current = { x: touch.clientX, y: touch.clientY };
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!isSwipingRef.current) {
        setTransform({ x: 0, y: 0 });
        setActiveDirection(null);
        return;
      }

      const touch = e.changedTouches[0];
      const deltaX = touchStartRef.current.x - touch.clientX;
      const deltaY = touchStartRef.current.y - touch.clientY;
      const totalTime = Date.now() - touchStartRef.current.time;
      
      // Calculate velocity
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      const velocity = totalTime > 0 ? distance / totalTime : 0;

      const isVertical = Math.abs(deltaY) > Math.abs(deltaX);
      const primaryDelta = isVertical ? Math.abs(deltaY) : Math.abs(deltaX);

      // Check trigger conditions
      const triggeredByDistance = primaryDelta > threshold;
      const triggeredByVelocity = velocity > velocityThreshold && primaryDelta > threshold * 0.3;
      const shouldTrigger = triggeredByDistance || triggeredByVelocity;

      // Animate back to center
      setIsAnimating(true);
      setTransform({ x: 0, y: 0 });

      if (shouldTrigger) {
        // Small delay to show snap-back animation before navigation
        setTimeout(() => {
          if (isVertical) {
            if (deltaY > 0 && onSwipeUp && !isAtStart) {
              onSwipeUp();
            } else if (deltaY < 0 && onSwipeDown && !isAtEnd) {
              onSwipeDown();
            }
          } else {
            if (deltaX > 0 && onSwipeLeft && !hStart) {
              onSwipeLeft();
            } else if (deltaX < 0 && onSwipeRight && !hEnd) {
              onSwipeRight();
            }
          }
        }, 50);
      }

      // Reset after animation
      setTimeout(() => {
        setIsAnimating(false);
        setActiveDirection(null);
        isSwipingRef.current = false;
      }, 300);
    };

    const handleTouchCancel = () => {
      setIsAnimating(true);
      setTransform({ x: 0, y: 0 });
      setActiveDirection(null);
      isSwipingRef.current = false;
      
      setTimeout(() => {
        setIsAnimating(false);
      }, 300);
    };

    container.addEventListener("touchstart", handleTouchStart, { passive: true });
    container.addEventListener("touchmove", handleTouchMove, { passive: true });
    container.addEventListener("touchend", handleTouchEnd, { passive: true });
    container.addEventListener("touchcancel", handleTouchCancel, { passive: true });

    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
      container.removeEventListener("touchcancel", handleTouchCancel);
    };
  }, [
    enabled,
    direction,
    calculateDisplacement,
    isAtStart,
    isAtEnd,
    hStart,
    hEnd,
    onSwipeUp,
    onSwipeDown,
    onSwipeLeft,
    onSwipeRight,
  ]);

  // Calculate progress for indicators
  const progress = Math.min(
    Math.sqrt(transform.x * transform.x + transform.y * transform.y) / maxDisplacement,
    1
  );

  return (
    <div 
      ref={containerRef}
      className={cn("relative overflow-hidden touch-pan-x touch-pan-y", className)}
    >
      {/* Edge indicators - high contrast for dark backgrounds */}
      {showEdgeIndicators && (direction === "vertical" || direction === "both") && (
        <>
          {/* Top edge indicator */}
          <div 
            className={cn(
              "absolute top-0 left-0 right-0 h-1.5 z-50 transition-all duration-200",
              "bg-gradient-to-b from-white/40 to-transparent",
              activeDirection === "down" && progress > 0.2 ? "opacity-100" : "opacity-0"
            )}
            style={{
              transform: `scaleY(${1 + progress * 3})`,
              boxShadow: progress > 0.3 ? "0 0 20px rgba(255,255,255,0.3)" : "none",
            }}
          />
          {/* Bottom edge indicator */}
          <div 
            className={cn(
              "absolute bottom-0 left-0 right-0 h-1.5 z-50 transition-all duration-200",
              "bg-gradient-to-t from-white/40 to-transparent",
              activeDirection === "up" && progress > 0.2 ? "opacity-100" : "opacity-0"
            )}
            style={{
              transform: `scaleY(${1 + progress * 3})`,
              boxShadow: progress > 0.3 ? "0 0 20px rgba(255,255,255,0.3)" : "none",
            }}
          />
        </>
      )}

      {showEdgeIndicators && (direction === "horizontal" || direction === "both") && (
        <>
          {/* Left edge indicator */}
          <div 
            className={cn(
              "absolute top-0 bottom-0 left-0 w-1.5 z-50 transition-all duration-200",
              "bg-gradient-to-r from-white/40 to-transparent",
              activeDirection === "right" && progress > 0.2 ? "opacity-100" : "opacity-0"
            )}
            style={{
              transform: `scaleX(${1 + progress * 3})`,
              boxShadow: progress > 0.3 ? "0 0 20px rgba(255,255,255,0.3)" : "none",
            }}
          />
          {/* Right edge indicator */}
          <div 
            className={cn(
              "absolute top-0 bottom-0 right-0 w-1.5 z-50 transition-all duration-200",
              "bg-gradient-to-l from-white/40 to-transparent",
              activeDirection === "left" && progress > 0.2 ? "opacity-100" : "opacity-0"
            )}
            style={{
              transform: `scaleX(${1 + progress * 3})`,
              boxShadow: progress > 0.3 ? "0 0 20px rgba(255,255,255,0.3)" : "none",
            }}
          />
        </>
      )}

      {/* Content with rubber-band transform */}
      <div
        className={cn(
          "w-full h-full",
          isAnimating && "transition-transform duration-300 ease-out"
        )}
        style={{
          transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
          willChange: isSwipingRef.current ? "transform" : "auto",
        }}
      >
        {children}
      </div>

      {/* Progress indicator dot - high contrast */}
      {progress > 0 && activeDirection && (
        <div 
          className={cn(
            "absolute z-50 w-3 h-3 rounded-full bg-white/70 transition-opacity",
            progress > 0.4 ? "opacity-100" : "opacity-60"
          )}
          style={{
            // Position based on direction
            ...(activeDirection === "up" && { bottom: "24px", left: "50%", transform: "translateX(-50%)" }),
            ...(activeDirection === "down" && { top: "24px", left: "50%", transform: "translateX(-50%)" }),
            ...(activeDirection === "left" && { right: "24px", top: "50%", transform: "translateY(-50%)" }),
            ...(activeDirection === "right" && { left: "24px", top: "50%", transform: "translateY(-50%)" }),
            // Scale based on progress
            scale: `${0.6 + progress * 1.4}`,
            boxShadow: "0 0 10px rgba(255,255,255,0.5)",
          }}
        />
      )}
    </div>
  );
}
