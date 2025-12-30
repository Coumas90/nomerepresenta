# Centralized Type System

> Single source of truth for all TypeScript types in the application.

## Quick Start

```typescript
// ✅ Always import from the barrel file
import type { ArtworkData, SeriesData, StudioImage } from "@/types";

// ❌ Never import from individual files
import type { ArtworkData } from "@/types/artwork"; // Wrong!
```

## Directory Structure

```
src/types/
├── index.ts          # Barrel file - import everything from here
├── artwork.ts        # Artwork, Series, ArtworkImage
├── analytics.ts      # Sessions, Views, Heatmaps, Patterns
├── studio.ts         # StudioImage, BulkUpload, component props
├── compression.ts    # CompressionOptions, Results, Batch jobs
├── auth.ts           # Profile, UserRole, Credentials, HCaptcha
└── navigation.ts     # SwipeProgress, SwipeNavigationConfig
```

## Type Categories

### artwork.ts
Core artwork and series types for the gallery.

| Type | Description |
|------|-------------|
| `Artwork` | Database row from `artworks` table |
| `Series` | Database row from `series` table |
| `ArtworkData` | Application-level artwork with parsed data |
| `SeriesData` | Application-level series representation |
| `ArtworkImage` | Individual image within an artwork |
| `ArtworkWithSeries` | Artwork with nested series data |
| `CreateArtworkInput` | Form data for creating artworks |
| `UpdateArtworkInput` | Form data for updating artworks |

### analytics.ts
Analytics, sessions, and tracking data.

| Type | Description |
|------|-------------|
| `AnalyticsSession` | Visitor session data |
| `ArtworkView` | Individual artwork view event |
| `PageView` | Page navigation event |
| `AnalyticsOverviewStats` | Aggregated dashboard stats |
| `LiveSession` | Real-time active session |
| `HeatmapPoint` | Cursor position data point |
| `DeviceDistribution` | Device type breakdown |
| `CountryData` / `CityData` | Geographic analytics |

### studio.ts
Studio images and admin component props.

| Type | Description |
|------|-------------|
| `StudioImage` | Studio image with metadata |
| `BulkUploadItem` | Item in upload queue |
| `SortableImageItemProps` | Drag-and-drop item props |
| `EditImageFormProps` | Image edit form props |
| `ImagesListProps` | Image list component props |

### compression.ts
Image compression and batch processing.

| Type | Description |
|------|-------------|
| `CompressionOptions` | Compression settings |
| `CompressionResult` | Single compression result |
| `CompressionSettings` | User preferences |
| `ImageToRecompress` | Batch job item |
| `RecompressionProgress` | Batch job status |

### auth.ts
Authentication and user management.

| Type | Description |
|------|-------------|
| `Profile` | User profile data |
| `UserRole` | Role assignment record |
| `AppRole` | Role enum (`admin` \| `user`) |
| `LoginCredentials` | Login form data |
| `SignupCredentials` | Signup form data |
| `HCaptchaRef` | Captcha component ref |

### navigation.ts
Swipe gestures and navigation.

| Type | Description |
|------|-------------|
| `SwipeProgress` | Current swipe state |
| `SwipeNavigationConfig` | Navigation callbacks |

## Design Principles

### 1. Supabase Derivation
Core database types derive from Supabase's generated types:

```typescript
import type { Tables } from "@/integrations/supabase/types";

export type Artwork = Tables<"artworks">;
export type Series = Tables<"series">;
```

### 2. Application vs Database Types
- **Database types** (`Artwork`, `Series`): Raw rows from Supabase
- **Application types** (`ArtworkData`, `SeriesData`): Enriched for UI consumption

### 3. JSDoc Documentation
All types include documentation:

```typescript
/**
 * Represents a studio image for the studio gallery page
 */
export interface StudioImage {
  /** Unique identifier */
  id: string;
  /** Public URL of the image */
  imageUrl: string;
  // ...
}
```

## Adding New Types

### Step 1: Choose the right file
- Art-related → `artwork.ts`
- Tracking/stats → `analytics.ts`
- Studio admin → `studio.ts`
- Image processing → `compression.ts`
- Auth/users → `auth.ts`
- Gestures/nav → `navigation.ts`
- New domain? → Create new file

### Step 2: Define with JSDoc

```typescript
/**
 * Brief description of what this type represents
 */
export interface MyNewType {
  /** Property description */
  propertyName: string;
}
```

### Step 3: Export from barrel file

```typescript
// In index.ts
export type {
  MyNewType,
} from "./myfile";
```

### Step 4: Import in consuming code

```typescript
import type { MyNewType } from "@/types";
```

## Common Patterns

### Form Input Types
Suffix with `Input` for form data:

```typescript
export interface CreateArtworkInput {
  title: string;
  year: string;
  // ...
}
```

### Component Props
Suffix with `Props` for React components:

```typescript
export interface EditImageFormProps {
  image: StudioImage;
  onSave: (data: UpdateStudioImageInput) => void;
}
```

### Database Row Types
Use Supabase's `Tables<>` helper:

```typescript
export type StudioImageRow = Tables<"studio_images">;
```

## Migration Guide

If you find types defined locally in hooks or components:

1. Move the type to the appropriate `src/types/*.ts` file
2. Add JSDoc documentation
3. Export from `index.ts`
4. Update imports in the original file
5. Optionally add re-export for backward compatibility

## Validation

Before committing:

```bash
# Type check
npx tsc --noEmit

# Ensure no circular imports
# All types should flow: supabase/types.ts → src/types/*.ts → components/hooks
```
