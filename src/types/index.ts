/**
 * Centralized type exports
 * 
 * This barrel file exports all shared types from a single location.
 * Import types from here rather than individual files:
 * 
 * @example
 * import type { ArtworkData, SeriesData, AnalyticsOverviewStats } from "@/types";
 */

// Artwork and Series types
export type {
  Artwork,
  Series,
  ArtworkImageRow,
  ArtworkData,
  SeriesData,
  ArtworkImage,
  ArtworkWithSeries,
  CreateArtworkInput,
  UpdateArtworkInput,
  CreateSeriesInput,
  UpdateSeriesInput,
} from "./artwork";

// Analytics types
export type {
  AnalyticsSession,
  ArtworkView,
  PageView,
  SeriesInteraction,
  CursorTracking,
  AnalyticsOverviewStats,
  DailyVisitors,
  ArtworkAnalytics,
  SeriesHeatData,
  LiveSession,
  LiveArtworkView,
  LiveActivity,
  HeatmapPoint,
  ArtworkHeatmapData,
  DeviceDistribution,
  TrafficSource,
  HourlyPattern,
  DailyPattern,
  VisitorPatterns,
  CountryData,
  CityData,
  ArtworkRecommendation,
} from "./analytics";

// Studio types
export type {
  StudioImageRow,
  StudioImage,
  BulkUploadItem,
  CreateStudioImageInput,
  UpdateStudioImageInput,
  SortableImageItemProps,
  EditImageFormProps,
  BulkUploadSectionProps,
  ImagesListProps,
  ImagePreviewDialogProps,
  DeleteImageDialogProps,
} from "./studio";

// Compression types
export type {
  CompressionOptions,
  CompressionResult,
  CompressionResultWithDetails,
  CompressionSettings,
  ImageToRecompress,
  RecompressionProgress,
  BatchRecompressionJob,
} from "./compression";

// Auth types
export type {
  Profile,
  UserRole,
  AppRole,
  UserWithRole,
  AuthState,
  LoginCredentials,
  SignupCredentials,
  PasswordResetRequest,
  PasswordUpdateData,
  HCaptchaRef,
  HCaptchaProps,
} from "./auth";

// Navigation types
export type {
  SwipeProgress,
  SwipeNavigationConfig,
} from "./navigation";
