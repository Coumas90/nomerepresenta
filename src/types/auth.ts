/**
 * Authentication and user type definitions
 * Centralized types for auth-related data structures
 */

import type { Tables } from "@/integrations/supabase/types";
import type { User, Session } from "@supabase/supabase-js";

// ============= Core Database Types =============

/** Profile row from database */
export type Profile = Tables<"profiles">;

/** User role row from database */
export type UserRole = Tables<"user_roles">;

// ============= Application Types =============

/**
 * Application role types.
 */
export type AppRole = "admin" | "user";

/**
 * User with role information.
 */
export interface UserWithRole {
  user: User;
  role: AppRole | null;
  isAdmin: boolean;
}

/**
 * Authentication state.
 */
export interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

/**
 * Login credentials.
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Signup credentials.
 */
export interface SignupCredentials extends LoginCredentials {
  confirmPassword?: string;
}

/**
 * Password reset request.
 */
export interface PasswordResetRequest {
  email: string;
}

/**
 * Password update data.
 */
export interface PasswordUpdateData {
  password: string;
  confirmPassword?: string;
}

// ============= Captcha Types =============

/**
 * Reference handle for HCaptcha component.
 */
export interface HCaptchaRef {
  /** Reset the captcha widget */
  reset: () => void;
}

/**
 * Props for HCaptcha component.
 */
export interface HCaptchaProps {
  /** Callback when captcha is verified */
  onVerify: (token: string) => void;
  /** Callback when captcha expires */
  onExpire?: () => void;
  /** Callback when captcha errors */
  onError?: (error: string) => void;
}
