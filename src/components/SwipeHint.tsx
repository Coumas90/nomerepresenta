import { useState, useEffect } from "react";
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface SwipeHintProps {
  direction: "vertical" | "horizontal" | "both";
  show?: boolean;
  autoHideAfter?: number; // ms to auto-hide, 0 to never auto-hide
  className?: string;
}

export const SwipeHint = ({ 
  direction, 
  show = true, 
  autoHideAfter = 3000,
  className = "" 
}: SwipeHintProps) => {
  const isMobile = useIsMobile();
  const [isVisible, setIsVisible] = useState(true);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Auto-hide after delay
  useEffect(() => {
    if (autoHideAfter > 0 && isVisible) {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, autoHideAfter);
      return () => clearTimeout(timer);
    }
  }, [autoHideAfter, isVisible]);

  // Hide on any touch interaction
  useEffect(() => {
    const handleInteraction = () => {
      setHasInteracted(true);
      setIsVisible(false);
    };

    window.addEventListener("touchstart", handleInteraction, { once: true });
    window.addEventListener("wheel", handleInteraction, { once: true });

    return () => {
      window.removeEventListener("touchstart", handleInteraction);
      window.removeEventListener("wheel", handleInteraction);
    };
  }, []);

  // Only show on mobile and when conditions are met
  if (!isMobile || !show || !isVisible || hasInteracted) {
    return null;
  }

  return (
    <div 
      className={`pointer-events-none z-30 flex items-center justify-center ${className}`}
      aria-hidden="true"
    >
      {direction === "vertical" && (
        <div className="flex flex-col items-center gap-1 animate-fade-in">
          <ChevronUp className="w-5 h-5 text-white/40 animate-bounce" style={{ animationDelay: "0.1s" }} />
          <span className="text-white/40 text-[10px] tracking-widest uppercase">Swipe</span>
          <ChevronDown className="w-5 h-5 text-white/40 animate-bounce" />
        </div>
      )}

      {direction === "horizontal" && (
        <div className="flex items-center gap-2 animate-fade-in">
          <ChevronLeft className="w-5 h-5 text-white/40 animate-pulse" />
          <span className="text-white/40 text-[10px] tracking-widest uppercase">Swipe</span>
          <ChevronRight className="w-5 h-5 text-white/40 animate-pulse" />
        </div>
      )}

      {direction === "both" && (
        <div className="flex flex-col items-center gap-2 animate-fade-in">
          <ChevronUp className="w-4 h-4 text-white/40 animate-bounce" />
          <div className="flex items-center gap-3">
            <ChevronLeft className="w-4 h-4 text-white/40 animate-pulse" />
            <span className="text-white/40 text-[10px] tracking-widest uppercase">Swipe</span>
            <ChevronRight className="w-4 h-4 text-white/40 animate-pulse" />
          </div>
          <ChevronDown className="w-4 h-4 text-white/40 animate-bounce" />
        </div>
      )}
    </div>
  );
};
