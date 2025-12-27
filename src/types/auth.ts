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
