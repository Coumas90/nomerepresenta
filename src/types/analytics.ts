/**
 * Analytics and Session type definitions
 * Centralized types for analytics-related data structures
 */

import type { Tables } from "@/integrations/supabase/types";

// ============= Core Database Types (derived from Supabase) =============

/** Analytics session row from database */
export type AnalyticsSession = Tables<"analytics_sessions">;

/** Artwork view row from database */
export type ArtworkView = Tables<"artwork_views">;

/** Page view row from database */
export type PageView = Tables<"page_views">;

/** Series interaction row from database */
export type SeriesInteraction = Tables<"series_interactions">;

/** Cursor tracking row from database */
export type CursorTracking = Tables<"artwork_cursor_tracking">;

// ============= Statistics Types =============

/**
 * Overview statistics for the analytics dashboard.
 */
export interface AnalyticsOverviewStats {
  totalVisitors: number;
  sessionsToday: number;
  avgTimeOnSite: number;
  avgArtworksPerSession: number;
  totalPageViews: number;
  uniqueArtworksViewed: number;
  dailyVisitors: DailyVisitors[];
}

/**
 * Daily visitor count data point.
 */
export interface DailyVisitors {
  date: string;
  visitors: number;
  sessions: number;
}

/**
 * Artwork performance analytics.
 */
export interface ArtworkAnalytics {
  artwork_id: string;
  title: string;
  series_name: string;
  total_views: number;
  unique_sessions: number;
  avg_view_duration: number;
  total_hovers: number;
  detail_clicks: number;
}

/**
 * Series interaction heat data.
 */
export interface SeriesHeatData {
  series_id: string;
  series_name: string;
  total_interactions: number;
  description_expansions: number;
  total_artwork_views: number;
  avg_artworks_per_session: number;
  unique_sessions: number;
}

// ============= Realtime Types =============

/**
 * Live session data for realtime analytics.
 */
export interface LiveSession {
  id: string;
  session_id: string;
  device_type: string | null;
  country_name: string | null;
  city: string | null;
  started_at: string;
}

/**
 * Live artwork view with optional artwork details.
 */
export interface LiveArtworkView {
  id: string;
  artwork_id: string;
  session_id: string;
  started_at: string;
  artwork?: {
    title: string;
    series?: {
      name: string;
    };
  };
}

/**
 * Live activity feed item.
 * Note: data uses 'any' for backward compatibility with existing code.
 * Consider migrating to strict union type: LiveSession | LiveArtworkView | PageView
 */
export interface LiveActivity {
  id: string;
  type: "session" | "artwork_view" | "page_view";
  timestamp: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
}

// ============= Heatmap Types =============

/**
 * Single point on an artwork heatmap.
 */
export interface HeatmapPoint {
  x: number;
  y: number;
  value: number;
}

/**
 * Complete heatmap data for an artwork.
 */
export interface ArtworkHeatmapData {
  artworkId: string;
  points: HeatmapPoint[];
  totalDataPoints: number;
  uniqueSessions: number;
}

// ============= Audience Types =============

/**
 * Device distribution data.
 */
export interface DeviceDistribution {
  device_type: string;
  count: number;
  percentage: number;
}

/**
 * Traffic source data.
 */
export interface TrafficSource {
  referrer: string;
  visitors: number;
  sessions: number;
}

/**
 * Hourly visitor pattern.
 */
export interface HourlyPattern {
  hour: number;
  sessions: number;
}

/**
 * Daily visitor pattern.
 */
export interface DailyPattern {
  day: string;
  sessions: number;
}

/**
 * Combined visitor patterns.
 */
export interface VisitorPatterns {
  hourly: HourlyPattern[];
  daily: DailyPattern[];
  newVisitors: number;
  returningVisitors: number;
}

// ============= Geographic Types =============

/**
 * Country-level geographic distribution data.
 * Uses snake_case to match database column naming convention.
 */
export interface CountryData {
  country: string;
  country_name: string;
  visitors: number;
  sessions: number;
  avg_duration: number;
}

/**
 * City-level geographic data.
 */
export interface CityData {
  city: string;
  country_name: string;
  visitors: number;
}

// ============= Recommendation Types =============

/**
 * AI-generated artwork recommendation.
 */
export interface ArtworkRecommendation {
  artworkId: string;
  reason: string;
}
