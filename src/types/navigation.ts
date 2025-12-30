/**
 * Navigation and gesture type definitions
 * Centralized types for swipe/gesture-related data structures
 */

/**
 * Progress tracking for swipe gestures.
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

/**
 * Configuration for swipe navigation behavior.
 */
export interface SwipeNavigationConfig {
  /** Threshold distance to trigger navigation */
  threshold: number;
  /** Minimum velocity to trigger navigation */
  velocityThreshold: number;
  /** Whether vertical swipe is enabled */
  enableVertical: boolean;
  /** Whether horizontal swipe is enabled */
  enableHorizontal: boolean;
}
