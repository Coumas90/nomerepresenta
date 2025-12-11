import { useState, useEffect, useCallback } from "react";
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

type PageContext = "works" | "studio" | "default";

interface SwipeHintProps {
  direction: "vertical" | "horizontal" | "both";
  show?: boolean;
  autoHideAfter?: number; // ms to auto-hide, 0 to never auto-hide
  inactivityDelay?: number; // ms of inactivity before re-showing (default 10000)
  pageContext?: PageContext; // Contextualizes hint per page
  className?: string;
}

const STORAGE_KEY_PREFIX = "swipeHint_seen_";

const getStorageKey = (context: PageContext): string => {
  return `${STORAGE_KEY_PREFIX}${context}`;
};

const getContextualText = (context: PageContext, direction: "vertical" | "horizontal" | "both"): string => {
  if (context === "works") {
    if (direction === "vertical") return "Swipe to browse artworks";
    if (direction === "horizontal") return "Swipe for details";
    return "Swipe to explore";
  }
  if (context === "studio") {
    return "Swipe to browse studio";
  }
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

  // Check sessionStorage on mount to see if hint was already shown
  useEffect(() => {
    const storageKey = getStorageKey(pageContext);
    const seenBefore = sessionStorage.getItem(storageKey) === "true";
    
    if (!seenBefore && isMobile && show) {
      setIsVisible(true);
    }
  }, [pageContext, isMobile, show]);

  // Auto-hide after delay
  useEffect(() => {
    if (autoHideAfter > 0 && isVisible) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        // Mark as seen in sessionStorage
        const storageKey = getStorageKey(pageContext);
        sessionStorage.setItem(storageKey, "true");
      }, autoHideAfter);
      return () => clearTimeout(timer);
    }
  }, [autoHideAfter, isVisible, pageContext]);

  // Hide on interaction and mark as seen
  const handleInteraction = useCallback(() => {
    if (!hasInteracted) {
      setHasInteracted(true);
      setIsVisible(false);
      const storageKey = getStorageKey(pageContext);
      sessionStorage.setItem(storageKey, "true");
    }
  }, [hasInteracted, pageContext]);

  useEffect(() => {
    window.addEventListener("touchstart", handleInteraction, { once: true });
    window.addEventListener("wheel", handleInteraction, { once: true });

    return () => {
      window.removeEventListener("touchstart", handleInteraction);
      window.removeEventListener("wheel", handleInteraction);
    };
  }, [handleInteraction]);

  // Re-show after inactivity (only if hint was already shown once)
  useEffect(() => {
    if (!isMobile || !show || inactivityDelay <= 0) return;

    let inactivityTimer: NodeJS.Timeout;
    let lastActivityTime = Date.now();

    const resetInactivityTimer = () => {
      lastActivityTime = Date.now();
      clearTimeout(inactivityTimer);
      
      inactivityTimer = setTimeout(() => {
        // Only re-show if enough time passed since last activity
        if (Date.now() - lastActivityTime >= inactivityDelay) {
          setIsVisible(true);
          setHasInteracted(false); // Allow new interaction to hide it again
        }
      }, inactivityDelay);
    };

    // Listen for activity
    const activityEvents = ["touchstart", "touchmove", "wheel", "keydown"];
    activityEvents.forEach(event => {
      window.addEventListener(event, resetInactivityTimer, { passive: true });
    });

    // Start initial timer
    resetInactivityTimer();

    return () => {
      clearTimeout(inactivityTimer);
      activityEvents.forEach(event => {
        window.removeEventListener(event, resetInactivityTimer);
      });
    };
  }, [isMobile, show, inactivityDelay]);

  // Only show on mobile and when conditions are met
  if (!isMobile || !show || !isVisible) {
    return null;
  }

  const contextText = getContextualText(pageContext, direction);

  return (
    <div 
      className={`pointer-events-none z-30 flex items-center justify-center ${className}`}
      aria-hidden="true"
    >
      {direction === "vertical" && (
        <div className="flex flex-col items-center gap-1 animate-fade-in">
          <ChevronUp className="w-5 h-5 text-white/40 animate-bounce" style={{ animationDelay: "0.1s" }} />
          <span className="text-white/40 text-[10px] tracking-widest uppercase text-center max-w-[120px]">
            {contextText}
          </span>
          <ChevronDown className="w-5 h-5 text-white/40 animate-bounce" />
        </div>
      )}

      {direction === "horizontal" && (
        <div className="flex items-center gap-2 animate-fade-in">
          <ChevronLeft className="w-5 h-5 text-white/40 animate-pulse" />
          <span className="text-white/40 text-[10px] tracking-widest uppercase text-center max-w-[120px]">
            {contextText}
          </span>
          <ChevronRight className="w-5 h-5 text-white/40 animate-pulse" />
        </div>
      )}

      {direction === "both" && (
        <div className="flex flex-col items-center gap-2 animate-fade-in">
          <ChevronUp className="w-4 h-4 text-white/40 animate-bounce" />
          <div className="flex items-center gap-3">
            <ChevronLeft className="w-4 h-4 text-white/40 animate-pulse" />
            <span className="text-white/40 text-[10px] tracking-widest uppercase text-center max-w-[100px]">
              {contextText}
            </span>
            <ChevronRight className="w-4 h-4 text-white/40 animate-pulse" />
          </div>
          <ChevronDown className="w-4 h-4 text-white/40 animate-bounce" />
        </div>
      )}
    </div>
  );
};
