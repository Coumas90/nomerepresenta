# TRI-PEEL — Developer Onboarding Guide

> Complete technical documentation for new developers joining the TRI-PEEL project.

---

## 1. What is TRI-PEEL?

TRI-PEEL is a **digital portfolio platform** for the visual artist **Iván Comas**. It showcases artwork series, studio process images, and artist biography in an immersive, gallery-like web experience.

- **Live URL**: [nomerepresenta.lovable.app](https://nomerepresenta.lovable.app)
- **Target audience**: Collectors, curators, galleries, art enthusiasts
- **Key features**: Artwork browsing by series, detail views with multi-image carousels, studio gallery, admin dashboard with analytics, PWA support

---

## 2. Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                      USER (Browser)                     │
│  PWA · Service Worker (Workbox) · Offline Support       │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                   REACT SPA (Vite)                      │
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌───────────────────────┐  │
│  │  Pages   │  │Components│  │     Hooks Layer       │  │
│  │ (Router) │  │ (UI/App) │  │ (React Query + Auth)  │  │
│  └──────────┘  └──────────┘  └───────────────────────┘  │
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │         Supabase JS Client (@supabase/js)        │   │
│  └──────────────────────┬───────────────────────────┘   │
└─────────────────────────┼───────────────────────────────┘
                          │ HTTPS
                          ▼
┌─────────────────────────────────────────────────────────┐
│                   LOVABLE CLOUD                         │
│                                                         │
│  ┌────────────┐  ┌─────────┐  ┌──────────────────────┐  │
│  │ PostgreSQL │  │ Storage │  │    Auth (GoTrue)     │  │
│  │  (Tables)  │  │ (Files) │  │  Email + Roles       │  │
│  └────────────┘  └─────────┘  └──────────────────────┘  │
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │            Edge Functions (Deno)                 │   │
│  │  recommend-artworks · track-analytics · sitemap  │   │
│  │  send-password-reset · verify-captcha            │   │
│  └──────────────────────────────────────────────────┘   │
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │          Row Level Security (RLS)                │   │
│  │   Per-table policies · Role-based access         │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

**Data flow**: User interacts with React UI → hooks call Supabase client → client hits Lovable Cloud APIs → PostgreSQL with RLS enforces access → response flows back through React Query cache.

---

## 3. Technology Stack

| Technology | Version | Purpose |
|---|---|---|
| React | 18.3 | UI framework |
| TypeScript | 5.x | Type safety |
| Vite | 6.x | Build tool + dev server |
| vite-plugin-pwa | 1.1 | PWA manifest + service worker generation |
| TailwindCSS | 3.x | Utility-first CSS |
| Shadcn/ui | — | Pre-built accessible UI components (`src/components/ui/`) |
| TanStack React Query | 5.x | Server state management, caching, mutations |
| React Router | 6.x | Client-side routing |
| Supabase JS | 2.84+ | Database client, auth, storage, realtime |
| @dnd-kit | 6.x / 10.x | Drag-and-drop (admin reordering) |
| Recharts | 2.15 | Analytics charts in admin dashboard |
| P5.js | 2.1 | Generative art background on landing page |
| Workbox | 7.4 | Service worker caching strategies |
| browser-image-compression | 2.0 | Client-side image compression before upload |
| Zod | 3.x | Schema validation |
| react-hook-form | 7.x | Form state management |
| hCaptcha | 1.17 | Bot protection on auth forms |
| Framer Motion | — | Page transitions (via `PageTransition` component) |
| Lucide React | 0.462 | Icon library |

---

## 4. Routes & Navigation

| Route | Page Component | Access | Description |
|---|---|---|---|
| `/` | `Landing` | Public | Hero page with generative P5.js background and navigation menu |
| `/works` | `WorksPage` | Public | Artwork gallery organized by series with horizontal scroll |
| `/artwork/:id` | `ArtworkDetail` | Public | Single artwork with multi-image carousel and details |
| `/studio` | `Studio` | Public | Studio/process images gallery with series navigation |
| `/bio` | `Bio` | Public | Artist biography page |
| `/auth` | `Auth` | Public | Login/signup with hCaptcha |
| `/reset-password` | `ResetPassword` | Public | Password reset flow |
| `/install` | `Install` | Public | PWA installation instructions |
| `/admin` | `Admin` | **Protected** | Admin dashboard (requires `admin` role) |
| `*` | `NotFound` | Public | 404 catch-all |

**Code splitting**: All pages except `Landing` use `React.lazy()` for on-demand loading (see `App.tsx`).

**Protected routes**: The `<ProtectedRoute requireAdmin={true}>` component checks auth state and user role before rendering.

---

## 5. Database Schema

### Content Tables

**`artworks`** — Main artwork entries
| Column | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | Auto-generated |
| `title` | text | Required |
| `year` | text | e.g. "2024" |
| `dimensions` | text | e.g. "100x80cm" |
| `materials` | text | Materials used |
| `technique` | text | Artistic technique |
| `description` | text | Nullable |
| `image_url` | text | Main image URL (Storage) |
| `image_detail_url` | text | Detail/zoom image URL |
| `series_id` | UUID (FK → series) | Required |
| `display_order` | integer | Sorting within series |
| `created_at` / `updated_at` | timestamptz | Auto-managed |

**`artwork_images`** — Additional images per artwork (carousel)
| Column | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | |
| `artwork_id` | UUID (FK → artworks) | |
| `image_url` | text | |
| `caption` | text | Nullable |
| `display_order` | integer | |
| `is_main` | boolean | Default false |

**`series`** — Artwork groupings
| Column | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | |
| `name` | text | e.g. "I", "II", "III" |
| `description` | text | Nullable |
| `display_order` | integer | |

**`studio_images`** — Studio/process photos
| Column | Type | Notes |
|---|---|---|
| `id` | UUID (PK) | |
| `image_url` | text | |
| `title` | text | Nullable |
| `description` | text | Nullable |
| `series_id` | UUID (FK → series) | Nullable |
| `display_order` | integer | |

### Analytics Tables

**`analytics_sessions`** — Visitor sessions with geo/device data
- `session_id`, `visitor_fingerprint`, `device_type`, `referrer`
- `country`, `country_name`, `city`
- `started_at`, `ended_at`, `total_duration_seconds`

**`page_views`** — Individual page visits
- `session_id`, `page_path`, `page_name`, `time_on_page_seconds`

**`artwork_views`** — Artwork engagement tracking
- `session_id`, `artwork_id`, `series_id`
- `view_duration_seconds`, `hovered`, `clicked_detail`

**`artwork_cursor_tracking`** — Cursor heatmap data
- `artwork_id`, `session_id`, `x_position`, `y_position`
- `viewport_width`, `viewport_height`

**`series_interactions`** — Series-level engagement
- `series_id`, `session_id`, `expanded_description`, `artworks_viewed_count`

### Auth Tables

**`profiles`** — User profiles (linked to `auth.users` by `id`)
- `id` (UUID, same as auth user), `email`, `created_at`, `updated_at`

**`user_roles`** — Role assignments
- `user_id`, `role` (enum: `admin` | `user`)

**Database function**: `has_role(_role, _user_id)` — checks if a user has a specific role.

---

## 6. Edge Functions (Backend)

All located in `supabase/functions/`:

| Function | Purpose | Trigger |
|---|---|---|
| `recommend-artworks` | Returns artwork recommendations based on viewing patterns | Called from `ArtworkRecommendations` component |
| `track-analytics` | Records session start/end, page views, artwork views | Called by `useAnalytics` hook on navigation |
| `send-password-reset` | Sends password reset email via Auth | Called from Auth page |
| `sitemap` | Dynamically generates `sitemap.xml` from artworks data | HTTP GET |
| `verify-captcha` | Validates hCaptcha tokens server-side | Called during auth flows |

Edge functions are **automatically deployed** when code changes are pushed.

---

## 7. Type System

All shared types live in `src/types/` with a barrel file pattern:

```typescript
// ✅ Always import from barrel file
import type { ArtworkData, SeriesData, StudioImage } from "@/types";

// ❌ Never from individual files
import type { ArtworkData } from "@/types/artwork";
```

| File | Domain |
|---|---|
| `artwork.ts` | Artwork, Series, ArtworkImage, form inputs |
| `analytics.ts` | Sessions, views, heatmaps, live data, geo |
| `studio.ts` | Studio images, bulk upload, component props |
| `compression.ts` | Image compression options and results |
| `auth.ts` | Profiles, roles, credentials, captcha |
| `navigation.ts` | Swipe gestures configuration |

Core database types derive from Supabase's generated types via `Tables<"table_name">`. See `src/types/README.md` for full documentation.

---

## 8. Folder Structure

```
src/
├── assets/                    # Static images imported as ES6 modules
├── components/
│   ├── ui/                    # Shadcn/ui primitives (button, dialog, etc.)
│   ├── admin/                 # Admin dashboard components
│   │   ├── analytics/         # Charts, heatmaps, realtime panels
│   │   ├── layout/            # AdminHeader, Sidebar, Breadcrumbs
│   │   ├── settings/          # Image compression settings
│   │   └── studio/            # Studio image management (CRUD, bulk upload, sorting)
│   ├── artwork/               # Artwork-specific (carousel, heatmap overlay)
│   ├── auth/                  # HCaptcha widget
│   ├── seo/                   # JSON-LD structured data
│   ├── studio/                # Public studio components (header)
│   └── works/                 # Works page components (scroll cards, series sections)
├── data/                      # Static fallback data
├── hooks/                     # All custom hooks (see §9)
├── integrations/
│   └── supabase/
│       ├── client.ts          # ⚠️ Auto-generated, DO NOT EDIT
│       └── types.ts           # ⚠️ Auto-generated, DO NOT EDIT
├── lib/                       # Utilities (cacheUtils, imageCompression, imageUtils)
├── pages/                     # Route-level page components
├── test/                      # Test setup, mocks, utilities
└── types/                     # Centralized type definitions (see §7)

supabase/
├── config.toml                # ⚠️ Auto-generated, DO NOT EDIT
├── functions/                 # Edge functions (Deno runtime)
│   ├── deno.json              # Shared Deno config
│   ├── recommend-artworks/
│   ├── send-password-reset/
│   ├── sitemap/
│   ├── track-analytics/
│   └── verify-captcha/
└── migrations/                # ⚠️ Read-only, managed by platform

public/
├── images/artworks/           # Static artwork images (fallback/legacy)
├── robots.txt
├── sitemap.xml
└── PWA icons (pwa-*.png, maskable-icon-*.png)
```

---

## 9. Custom Hooks

### Data Fetching
| Hook | Purpose |
|---|---|
| `useArtworks` / `useArtwork` | Fetch all artworks or single by ID |
| `useArtworksBySeries` | Artworks grouped by series |
| `useArtworkImages` | Additional images for an artwork |
| `useSeries` | All series with ordering |
| `useStudioImages` | Studio gallery images |
| `useArtworkRecommendations` | AI-powered recommendations |
| `useUserRole` | Current user's role |

### Mutations
| Hook | Purpose |
|---|---|
| `useArtworkMutations` | Create/update/delete/reorder artworks |
| `useSeriesMutations` | Create/update/delete/reorder series |
| `useStudioImageMutations` | CRUD + bulk upload for studio images |

### Analytics
| Hook | Purpose |
|---|---|
| `useAnalytics` | Session tracking, page views |
| `useAnalyticsStats` | Dashboard aggregate stats |
| `useArtworkAnalytics` | Per-artwork engagement data |
| `useArtworkCursorTracking` | Records cursor positions for heatmaps |
| `useArtworkHeatmap` | Fetches heatmap data for visualization |
| `useAudienceAnalytics` | Device/browser distribution |
| `useGeographicAnalytics` | Country/city breakdown |
| `useRealtimeAnalytics` | Live session counts |
| `useSeriesAnalytics` | Series-level engagement |

### Auth & Security
| Hook | Purpose |
|---|---|
| `useAuth` | Auth state, signIn, signUp, signOut |
| `useRateLimiter` | Client-side rate limiting |

### UX & Performance
| Hook | Purpose |
|---|---|
| `useSwipeNavigation` | Touch swipe gesture handling |
| `useHapticFeedback` | Vibration API for mobile |
| `useScrollRestoration` | Preserves scroll position on navigation |
| `useImageLazyLoad` | Intersection Observer lazy loading |
| `useImagePreloader` | Preloads next/prev artwork images |
| `useOfflineStatus` | PWA online/offline detection |
| `useFileDrop` | Drag-and-drop file upload handling |
| `useMobile` | Responsive breakpoint detection |
| `useCompressionSettings` | Image compression preferences |
| `useBatchRecompression` | Bulk image recompression jobs |

---

## 10. Key Code Patterns

### Code Splitting
```typescript
// App.tsx — all non-landing pages are lazy-loaded
const ArtworkDetail = lazy(() => import("./pages/ArtworkDetail"));
const Admin = lazy(() => import("./pages/Admin"));
```

### React Query Configuration
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,    // 5 min — artworks rarely change
      gcTime: 10 * 60 * 1000,      // 10 min cache retention
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    },
  },
});
```

### Supabase Client Usage
```typescript
import { supabase } from "@/integrations/supabase/client";

// Query
const { data, error } = await supabase
  .from("artworks")
  .select("*")
  .order("display_order", { ascending: true });

// Insert
const { error } = await supabase
  .from("artworks")
  .insert({ title, year, series_id, ... });
```

### Image Compression (Client-Side)
Images are compressed before upload using `browser-image-compression`. Settings are configurable in admin under Settings > Image Compression.

### Design System
- All colors use HSL CSS variables defined in `src/index.css`
- Components use semantic tokens: `bg-background`, `text-foreground`, `border-border`
- Never use raw color values in components — always reference design tokens

---

## 11. Development Setup

```bash
# 1. Clone the repository
git clone <repo-url>
cd tri-peel

# 2. Install dependencies
npm install
# or
bun install

# 3. Environment variables
# The .env file is auto-managed by Lovable Cloud.
# Required variables (auto-provided):
#   VITE_SUPABASE_URL
#   VITE_SUPABASE_PUBLISHABLE_KEY
#   VITE_SUPABASE_PROJECT_ID

# 4. Start development server
npm run dev

# 5. Run type checking
npx tsc --noEmit

# 6. Run tests
npm run test
```

### Auto-Generated Files (DO NOT EDIT)
- `.env`
- `supabase/config.toml`
- `src/integrations/supabase/client.ts`
- `src/integrations/supabase/types.ts`

---

## 12. User Flows

### Public Visitor
1. Lands on `/` → sees generative P5.js background with navigation menu
2. Navigates to `/works` → browses artworks by series (horizontal scroll)
3. Clicks artwork → `/artwork/:id` with image carousel, details, recommendations
4. Visits `/studio` → scrolls through studio images with series nav
5. Visits `/bio` → reads artist biography

### Admin Login
1. Navigates to `/auth` → enters email + password + hCaptcha
2. If user has `admin` role → can access `/admin`
3. Protected by `<ProtectedRoute requireAdmin={true}>`

### Content Management (Admin)
1. **Artworks**: Create, edit, delete, reorder. Upload main + detail images. Assign to series.
2. **Series**: Rename (inline edit), reorder (drag-and-drop), create new, delete.
3. **Studio Images**: Upload single or bulk, assign to series, reorder, edit metadata.
4. **Analytics**: View visitor stats, artwork engagement, heatmaps, geographic data, real-time sessions.
5. **Settings**: Configure image compression quality and batch recompression.

---

## 13. PWA & Offline Support

- **Manifest**: Generated by `vite-plugin-pwa` in `vite.config.ts`
- **Service Worker**: Workbox-based, registered in `src/registerSW.ts`
- **Caching Strategies**:
  - Static assets: Cache-first
  - API responses: Network-first with cache fallback
  - Images: Cache-first with expiration
- **Offline Indicator**: `<OfflineIndicator>` component shows banner when offline
- **Install Page**: `/install` provides platform-specific PWA installation instructions

---

## 14. Security

### Authentication Flow
1. User submits email + password on `/auth`
2. hCaptcha token verified server-side via `verify-captcha` edge function
3. Supabase Auth handles session management (JWT tokens in localStorage)
4. Session auto-refreshes via `autoRefreshToken: true`

### Authorization
- **RLS (Row Level Security)**: Enabled on all tables
- **Role checking**: `has_role()` database function + `useUserRole` hook
- **Admin routes**: `<ProtectedRoute>` checks auth + role before rendering

### Rate Limiting
- Client-side rate limiter (`useRateLimiter`) prevents abuse of analytics tracking
- hCaptcha on auth forms prevents bot signups

### Key Security Rules
- Public tables (artworks, series, studio_images): SELECT open, mutations require admin
- Analytics tables: INSERT open (for tracking), SELECT requires admin
- profiles / user_roles: Scoped to own user via `auth.uid()`

---

## 15. Quick Reference

### Common Commands
```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run test         # Run tests
npx tsc --noEmit     # Type check
```

### Key Files to Know
| File | What it does |
|---|---|
| `src/App.tsx` | Root component, routing, providers |
| `src/index.css` | Design tokens (CSS variables) |
| `src/hooks/useAuth.ts` | Auth state management |
| `src/hooks/useArtworks.ts` | Primary data fetching |
| `src/types/index.ts` | Type barrel file |
| `src/components/ProtectedRoute.tsx` | Admin route guard |
| `tailwind.config.ts` | Theme configuration |
| `vite.config.ts` | Build config + PWA settings |

### Database Access Pattern
```
Component → useQuery hook → supabase.from("table") → RLS check → PostgreSQL → cached response
```

---

*Last updated: February 2026*
