/**
 * Show type definitions
 * Content type for exhibitions/shows with image galleries
 */

/** Show data as used throughout the application */
export interface ShowData {
  id: string;
  title: string;
  slug: string;
  year: string;
  subtitle: string | null;
  description: string | null;
  display_order: number;
  is_published: boolean;
  show_in_menu: boolean;
  created_at: string;
  updated_at: string;
}

/** Show image for gallery display */
export interface ShowImage {
  id: string;
  show_id: string;
  image_url: string;
  display_order: number;
  caption: string | null;
  alt_text: string | null;
  created_at: string | null;
}

/** Input for creating a new show */
export interface CreateShowInput {
  title: string;
  slug: string;
  year?: string;
  subtitle?: string;
  description?: string;
  display_order?: number;
  is_published?: boolean;
  show_in_menu?: boolean;
}

/** Input for updating an existing show */
export type UpdateShowInput = Partial<CreateShowInput>;
