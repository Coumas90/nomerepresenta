import { useCallback } from "react";

type HapticPattern = "light" | "medium" | "heavy" | "success" | "error";

const patterns: Record<HapticPattern, number | number[]> = {
  light: 10,
  medium: 25,
  heavy: 50,
  success: [10, 50, 10],
  error: [50, 100, 50],
};

export function useHapticFeedback() {
  const isSupported = typeof navigator !== "undefined" && "vibrate" in navigator;

  const vibrate = useCallback((pattern: HapticPattern = "light") => {
    if (!isSupported) return false;
    
    try {
      return navigator.vibrate(patterns[pattern]);
    } catch {
      return false;
    }
  }, [isSupported]);

  return {
    isSupported,
    vibrate,
    light: useCallback(() => vibrate("light"), [vibrate]),
    medium: useCallback(() => vibrate("medium"), [vibrate]),
    heavy: useCallback(() => vibrate("heavy"), [vibrate]),
    success: useCallback(() => vibrate("success"), [vibrate]),
    error: useCallback(() => vibrate("error"), [vibrate]),
  };
}
