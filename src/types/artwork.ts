/**
 * Artwork and Series type definitions
 * Centralized types for artwork-related data structures
 */

import type { Tables } from "@/integrations/supabase/types";

// ============= Core Database Types (derived from Supabase) =============

/** Artwork row from database */
export type Artwork = Tables<"artworks">;

/** Series row from database */
export type Series = Tables<"series">;

/** Artwork image row from database */
export type ArtworkImageRow = Tables<"artwork_images">;

// ============= Application Types =============

/**
 * Artwork data as used throughout the application.
 * Matches the database row but with guaranteed string for description.
 */
export interface ArtworkData {
  id: string;
  title: string;
  year: string;
  dimensions: string;
  materials: string;
  description: string;
  image_url: string;
  image_detail_url: string;
  series_id: string;
  display_order: number;
}

/**
 * Series data as used throughout the application.
 */
export interface SeriesData {
  id: string;
  name: string;
  description: string | null;
  display_order: number;
  is_visible?: boolean;
}

/**
 * Artwork image with all properties.
 */
export interface ArtworkImage {
  id: string;
  artwork_id: string;
  image_url: string;
  display_order: number;
  is_main: boolean;
  created_at: string;
  caption: string | null;
  title: string | null;
  year: string | null;
  dimensions: string | null;
  materials: string | null;
  is_detail: boolean;
}

/**
 * Artwork with its series information joined.
 */
export interface ArtworkWithSeries extends ArtworkData {
  series?: SeriesData;
}

// ============= Form/Input Types =============

/**
 * Data required to create a new artwork.
 */
export interface CreateArtworkInput {
  title: string;
  year?: string;
  dimensions?: string;
  materials?: string;
  description?: string;
  image_url: string;
  image_detail_url?: string;
  series_id: string;
  display_order?: number;
}

/**
 * Data for updating an existing artwork.
 */
export type UpdateArtworkInput = Partial<CreateArtworkInput>;

/**
 * Data required to create a new series.
 */
export interface CreateSeriesInput {
  name: string;
  description?: string;
  display_order?: number;
}

/**
 * Data for updating an existing series.
 */
export type UpdateSeriesInput = Partial<CreateSeriesInput>;
