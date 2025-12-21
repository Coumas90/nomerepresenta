import { useState, useCallback, useEffect } from 'react';

interface RateLimitState {
  attempts: number;
  lastAttempt: number;
  lockedUntil: number | null;
}

interface RateLimiterConfig {
  maxAttempts: number;
  windowMs: number;
  lockoutMs: number;
  storageKey: string;
}

const DEFAULT_CONFIG: RateLimiterConfig = {
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000, // 15 minutes
  lockoutMs: 15 * 60 * 1000, // 15 minute lockout
  storageKey: 'auth_rate_limit',
};

export const useRateLimiter = (config: Partial<RateLimiterConfig> = {}) => {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  const { maxAttempts, windowMs, lockoutMs, storageKey } = mergedConfig;

  const getStoredState = (): RateLimitState => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Invalid stored data, reset
    }
    return { attempts: 0, lastAttempt: 0, lockedUntil: null };
  };

  const [state, setState] = useState<RateLimitState>(getStoredState);

  // Persist state to localStorage
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(state));
  }, [state, storageKey]);

  // Check if currently locked
  const isLocked = useCallback((): boolean => {
    const now = Date.now();
    
    // Check if lockout has expired
    if (state.lockedUntil && now >= state.lockedUntil) {
      setState({ attempts: 0, lastAttempt: 0, lockedUntil: null });
      return false;
    }
    
    return state.lockedUntil !== null && now < state.lockedUntil;
  }, [state]);

  // Get remaining lockout time in seconds
  const getRemainingLockoutTime = useCallback((): number => {
    if (!state.lockedUntil) return 0;
    const remaining = Math.ceil((state.lockedUntil - Date.now()) / 1000);
    return Math.max(0, remaining);
  }, [state.lockedUntil]);

  // Get remaining attempts
  const getRemainingAttempts = useCallback((): number => {
    const now = Date.now();
    
    // Reset attempts if window has passed
    if (now - state.lastAttempt > windowMs) {
      return maxAttempts;
    }
    
    return Math.max(0, maxAttempts - state.attempts);
  }, [state, windowMs, maxAttempts]);

  // Record a failed attempt
  const recordFailedAttempt = useCallback((identifier?: string): { blocked: boolean; remainingAttempts: number } => {
    const now = Date.now();
    
    // Reset if window has passed
    let newAttempts = state.attempts;
    if (now - state.lastAttempt > windowMs) {
      newAttempts = 0;
    }
    
    newAttempts += 1;
    
    // Calculate lockout with exponential backoff
    let lockedUntil: number | null = null;
    if (newAttempts >= maxAttempts) {
      // Exponential backoff: 15min, 30min, 60min, etc.
      const lockoutMultiplier = Math.pow(2, Math.floor(newAttempts / maxAttempts) - 1);
      lockedUntil = now + (lockoutMs * lockoutMultiplier);
      
      console.warn(`🔒 Rate limit exceeded for ${identifier || 'user'}. Locked until ${new Date(lockedUntil).toLocaleTimeString()}`);
    }
    
    const newState = {
      attempts: newAttempts,
      lastAttempt: now,
      lockedUntil,
    };
    
    setState(newState);
    
    return {
      blocked: lockedUntil !== null,
      remainingAttempts: Math.max(0, maxAttempts - newAttempts),
    };
  }, [state, windowMs, maxAttempts, lockoutMs]);

  // Record successful attempt (reset counter)
  const recordSuccess = useCallback(() => {
    setState({ attempts: 0, lastAttempt: 0, lockedUntil: null });
  }, []);

  // Check if attempt is allowed
  const canAttempt = useCallback((): boolean => {
    return !isLocked() && getRemainingAttempts() > 0;
  }, [isLocked, getRemainingAttempts]);

  // Format remaining time as human-readable string
  const formatRemainingTime = useCallback((): string => {
    const seconds = getRemainingLockoutTime();
    if (seconds <= 0) return '';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  }, [getRemainingLockoutTime]);

  return {
    isLocked,
    canAttempt,
    getRemainingAttempts,
    getRemainingLockoutTime,
    formatRemainingTime,
    recordFailedAttempt,
    recordSuccess,
    attempts: state.attempts,
  };
};
