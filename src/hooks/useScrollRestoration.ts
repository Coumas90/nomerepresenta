import { useEffect, useCallback, useRef } from "react";
import { useLocation } from "react-router-dom";

const SCROLL_STORAGE_KEY = "works-scroll-position";

interface ScrollState {
  scrollY: number;
  activeSeriesId: string | null;
  timestamp: number;
}

/**
 * Hook to save and restore scroll position for the Works page.
 * Saves position to sessionStorage before navigating away,
 * and restores it when returning via browser back/forward navigation.
 */
export const useScrollRestoration = (activeSeriesId: string | null) => {
  const location = useLocation();
  const hasRestored = useRef(false);
  const isWorksPage = location.pathname === "/works";

  // Save current scroll position
  const saveScrollPosition = useCallback(() => {
    if (!isWorksPage) return;
    
    const state: ScrollState = {
      scrollY: window.scrollY,
      activeSeriesId,
      timestamp: Date.now(),
    };
    sessionStorage.setItem(SCROLL_STORAGE_KEY, JSON.stringify(state));
  }, [isWorksPage, activeSeriesId]);

  // Restore scroll position if available
  const restoreScrollPosition = useCallback((): boolean => {
    if (!isWorksPage || hasRestored.current) return false;

    const stored = sessionStorage.getItem(SCROLL_STORAGE_KEY);
    if (!stored) return false;

    try {
      const state: ScrollState = JSON.parse(stored);
      
      // Only restore if saved within last 5 minutes
      const fiveMinutes = 5 * 60 * 1000;
      if (Date.now() - state.timestamp > fiveMinutes) {
        sessionStorage.removeItem(SCROLL_STORAGE_KEY);
        return false;
      }

      // Delay to ensure DOM is ready
      requestAnimationFrame(() => {
        window.scrollTo({ top: state.scrollY, behavior: "instant" });
      });
      
      hasRestored.current = true;
      // Clear after restoring
      sessionStorage.removeItem(SCROLL_STORAGE_KEY);
      return true;
    } catch {
      return false;
    }
  }, [isWorksPage]);

  // Clear scroll position (call when navigating away intentionally)
  const clearScrollPosition = useCallback(() => {
    sessionStorage.removeItem(SCROLL_STORAGE_KEY);
  }, []);

  // Save scroll position before page unload or navigation
  useEffect(() => {
    if (!isWorksPage) return;

    const handleBeforeUnload = () => saveScrollPosition();
    
    window.addEventListener("beforeunload", handleBeforeUnload);
    
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      // Save when leaving the page
      saveScrollPosition();
    };
  }, [isWorksPage, saveScrollPosition]);

  return {
    saveScrollPosition,
    restoreScrollPosition,
    clearScrollPosition,
  };
};
