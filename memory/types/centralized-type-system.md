# Memory: types/centralized-type-system
Updated: 2024-12-30

## Centralized Type System Architecture

All shared TypeScript types are centralized in `src/types/` with a barrel file pattern for clean imports.

### Directory Structure
```
src/types/
├── index.ts          # Barrel file - import all types from here
├── artwork.ts        # Artwork, Series, ArtworkImage types
├── analytics.ts      # Sessions, Views, Heatmaps, Patterns
├── studio.ts         # StudioImage, BulkUpload, component props
├── compression.ts    # CompressionOptions, Results, Batch jobs
├── auth.ts           # Profile, UserRole, Credentials, HCaptcha
└── navigation.ts     # SwipeProgress, SwipeNavigationConfig
```

### Import Pattern
```typescript
// ✅ CORRECT - Always import from barrel file
import type { ArtworkData, SeriesData, StudioImage } from "@/types";

// ❌ WRONG - Never import from individual type files
import type { ArtworkData } from "@/types/artwork";
```

### Type Categories

**artwork.ts** - Core database types derived from Supabase (`Artwork`, `Series`), application interfaces (`ArtworkData`, `SeriesData`, `ArtworkImage`), and form inputs (`CreateArtworkInput`, `UpdateArtworkInput`).

**analytics.ts** - Database session types, statistics interfaces (`AnalyticsOverviewStats`, `ArtworkAnalytics`), realtime types (`LiveSession`, `LiveActivity`), heatmap data, audience demographics, and geographic distribution.

**studio.ts** - Studio image types, `BulkUploadItem` for upload queue tracking, and component prop interfaces (`SortableImageItemProps`, `EditImageFormProps`, etc.).

**compression.ts** - Image compression configuration (`CompressionOptions`), results with metrics (`CompressionResult`, `CompressionResultWithDetails`), and batch processing types (`ImageToRecompress`, `RecompressionProgress`, `BatchRecompressionJob`).

**auth.ts** - User profile and role types, authentication credentials (`LoginCredentials`, `SignupCredentials`), password management, and HCaptcha component types.

**navigation.ts** - Swipe gesture tracking (`SwipeProgress`) and navigation configuration (`SwipeNavigationConfig`).

### Design Principles
1. **Supabase Derivation**: Core types use `Tables<"table_name">` from Supabase types
2. **Separation**: Each file handles one domain
3. **JSDoc**: All types include documentation comments
4. **Barrel Export**: Single import point via `index.ts`

### Adding New Types
1. Identify the appropriate domain file (or create new one)
2. Add type with JSDoc documentation
3. Export from `index.ts` barrel file
4. Import in consuming files from `@/types`
