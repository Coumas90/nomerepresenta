/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

/**
 * Environment variables available in the application.
 * All VITE_* variables are exposed to the client.
 */
interface ImportMetaEnv {
  /** Supabase project URL */
  readonly VITE_SUPABASE_URL: string;
  /** Supabase anonymous/public key */
  readonly VITE_SUPABASE_PUBLISHABLE_KEY: string;
  /** Supabase project ID */
  readonly VITE_SUPABASE_PROJECT_ID: string;
  /** hCaptcha site key for bot protection */
  readonly VITE_HCAPTCHA_SITE_KEY?: string;
  /** Current mode (development, production, etc.) */
  readonly MODE: string;
  /** Base URL for the app */
  readonly BASE_URL: string;
  /** Whether running in production */
  readonly PROD: boolean;
  /** Whether running in development */
  readonly DEV: boolean;
  /** Whether running in SSR mode */
  readonly SSR: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
