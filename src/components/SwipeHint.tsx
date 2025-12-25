import { useState, useEffect, useCallback, useMemo } from "react";
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

type PageContext = "works" | "studio" | "default";

interface SwipeHintProps {
  direction: "vertical" | "horizontal" | "both";
  show?: boolean;
  autoHideAfter?: number;
  inactivityDelay?: number;
  pageContext?: PageContext;
  className?: string;
}

const STORAGE_KEY_PREFIX = "swipeHint_seen_";

const getStorageKey = (context: PageContext): string => 
  `${STORAGE_KEY_PREFIX}${context}`;

const getContextualText = (context: PageContext, direction: "vertical" | "horizontal" | "both"): string => {
  if (context === "works") {
    if (direction === "vertical") return "Swipe to browse artworks";
    if (direction === "horizontal") return "Swipe for details";
    return "Swipe to explore";
  }
  if (context === "studio") return "Swipe to browse studio";
  return "Swipe";
};

export const SwipeHint = ({ 
  direction, 
  show = true, 
  autoHideAfter = 3000,
  inactivityDelay = 10000,
  pageContext = "default",
  className = "" 
}: SwipeHintProps) => {
  const isMobile = useIsMobile();
  const [isVisible, setIsVisible] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const storageKey = useMemo(() => getStorageKey(pageContext), [pageContext]);

  // Check sessionStorage on mount
  useEffect(() => {
    const seenBefore = sessionStorage.getItem(storageKey) === "true";
    if (!seenBefore && isMobile && show) {
      setIsVisible(true);
    }
  }, [storageKey, isMobile, show]);

  // Auto-hide after delay
  useEffect(() => {
    if (autoHideAfter > 0 && isVisible) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        sessionStorage.setItem(storageKey, "true");
      }, autoHideAfter);
      return () => clearTimeout(timer);
    }
  }, [autoHideAfter, isVisible, storageKey]);

  // Hide on interaction
  const handleInteraction = useCallback(() => {
    if (!hasInteracted) {
      setHasInteracted(true);
      setIsVisible(false);
      sessionStorage.setItem(storageKey, "true");
    }
  }, [hasInteracted, storageKey]);

  useEffect(() => {
    window.addEventListener("touchstart", handleInteraction, { once: true });
    window.addEventListener("wheel", handleInteraction, { once: true });
    return () => {
      window.removeEventListener("touchstart", handleInteraction);
      window.removeEventListener("wheel", handleInteraction);
    };
  }, [handleInteraction]);

  // Re-show after inactivity
  useEffect(() => {
    if (!isMobile || !show || inactivityDelay <= 0) return;

    let inactivityTimer: NodeJS.Timeout;
    let lastActivityTime = Date.now();

    const resetInactivityTimer = () => {
      lastActivityTime = Date.now();
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(() => {
        if (Date.now() - lastActivityTime >= inactivityDelay) {
          setIsVisible(true);
          setHasInteracted(false);
        }
      }, inactivityDelay);
    };

    const activityEvents = ["touchstart", "touchmove", "wheel", "keydown"];
    activityEvents.forEach(event => 
      window.addEventListener(event, resetInactivityTimer, { passive: true })
    );
    resetInactivityTimer();

    return () => {
      clearTimeout(inactivityTimer);
      activityEvents.forEach(event => 
        window.removeEventListener(event, resetInactivityTimer)
      );
    };
  }, [isMobile, show, inactivityDelay]);

  if (!isMobile || !show || !isVisible) return null;

  const contextText = getContextualText(pageContext, direction);
  const showVertical = direction === "vertical" || direction === "both";
  const showHorizontal = direction === "horizontal" || direction === "both";
  const isBoth = direction === "both";
  const iconSize = isBoth ? "w-5 h-5" : "w-6 h-6";

  return (
    <div 
      className={`pointer-events-none z-30 flex items-center justify-center ${className}`}
      aria-hidden="true"
    >
      <div className="bg-black/30 backdrop-blur-sm rounded-xl px-4 py-3">
        <div className={`flex ${showVertical && !showHorizontal ? "flex-col" : ""} items-center gap-${isBoth ? "2" : "1.5"} animate-fade-in`}>
          {showVertical && !showHorizontal && (
            <ChevronUp className={`${iconSize} text-white/70 animate-bounce`} style={{ animationDelay: "0.1s" }} />
          )}
          
          {isBoth && <ChevronUp className={`${iconSize} text-white/70 animate-bounce`} />}
          
          <div className={`flex items-center ${isBoth ? "gap-3" : "gap-2.5"}`}>
            {showHorizontal && (
              <ChevronLeft className={`${iconSize} text-white/70 animate-pulse`} />
            )}
            <span className={`text-white/80 text-[11px] tracking-widest uppercase text-center max-w-[${isBoth ? "120" : "140"}px] font-medium`}>
              {contextText}
            </span>
            {showHorizontal && (
              <ChevronRight className={`${iconSize} text-white/70 animate-pulse`} />
            )}
          </div>
          
          {isBoth && <ChevronDown className={`${iconSize} text-white/70 animate-bounce`} />}
          
          {showVertical && !showHorizontal && (
            <ChevronDown className={`${iconSize} text-white/70 animate-bounce`} />
          )}
        </div>
      </div>
    </div>
  );
};
