# TRI-PEEL — Artist Portfolio Platform

<div align="center">

**A modern, performance-optimized digital portfolio platform for contemporary artists**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://reactjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Cloud-3ecf8e.svg)](https://supabase.com/)
[![PWA](https://img.shields.io/badge/PWA-Enabled-purple.svg)](https://web.dev/progressive-web-apps/)

**Project URL**: https://lovable.dev/projects/eb1c9d63-7f08-49ec-993b-0afe8823d058

</div>

---

## Executive Summary

TRI-PEEL is a **Series B-ready** digital portfolio platform designed for contemporary visual artists. Built with enterprise-grade architecture, the platform combines stunning visual presentation with robust analytics, secure authentication, and PWA capabilities for an immersive art discovery experience.

### Product Vision

| Aspect | Description |
|--------|-------------|
| **Purpose** | Provide artists with a premium digital gallery experience that rivals physical exhibitions |
| **Target Audience** | Contemporary visual artists, galleries, collectors, curators |
| **Key Differentiators** | Fullscreen immersive viewing, gesture-based navigation, real-time engagement analytics, artwork cursor heatmaps |
| **Business Model** | SaaS platform for artist portfolio management with tiered analytics |

---

## Technical Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND                                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │   React 18  │  │  Vite 5.x   │  │ TailwindCSS │  │   Shadcn    │    │
│  │   + Router  │  │  + PWA      │  │  + Tokens   │  │     UI      │    │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘    │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                    TanStack React Query                          │    │
│  │         Caching • Prefetching • Optimistic Updates              │    │
│  └─────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          LOVABLE CLOUD                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │  Supabase   │  │    Edge     │  │   Storage   │  │  Real-time  │    │
│  │  PostgreSQL │  │  Functions  │  │   Buckets   │  │  Analytics  │    │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘    │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │              Row Level Security (RLS) Policies                   │    │
│  │        Role-based Access • Admin Functions • Public Read        │    │
│  └─────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
```

### Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | React 18.3 + TypeScript 5.x | Type-safe component architecture |
| **Build** | Vite 5.x + PWA Plugin | Fast builds, service worker, offline support |
| **Styling** | TailwindCSS + Shadcn/ui | Design system with semantic tokens |
| **State** | TanStack Query v5 | Server state management with caching |
| **Backend** | Supabase (Lovable Cloud) | PostgreSQL, Auth, Storage, Edge Functions |
| **Analytics** | Custom hooks + Supabase | Session tracking, heatmaps, engagement metrics |
| **Validation** | Zod | Runtime type validation for forms |
| **Animation** | CSS Keyframes + P5.js | Smooth transitions, generative backgrounds |

---

## Database Schema

### Core Tables

| Table | Purpose | RLS Policy |
|-------|---------|------------|
| `artworks` | Artwork metadata, images, ordering | Public read, Admin write |
| `artwork_images` | Multiple images per artwork | Public read, Admin write |
| `series` | Artwork collections/series | Public read, Admin write |
| `studio_images` | Studio/process documentation | Public read, Admin write |
| `profiles` | User profile data | Owner-only access |
| `user_roles` | Role-based access control | Admin-only access |

### Analytics Tables (with Performance Indexes)

| Table | Purpose | Indexed Columns |
|-------|---------|-----------------|
| `analytics_sessions` | Visitor sessions, geo, device | session_id, created_at, started_at |
| `page_views` | Page navigation tracking | session_id, page_path, created_at |
| `artwork_views` | Artwork engagement metrics | artwork_id, session_id, series_id, created_at |
| `artwork_cursor_tracking` | Mouse movement heatmaps | artwork_id, session_id |
| `series_interactions` | Series engagement data | series_id, session_id, created_at |

---

## Key User Flows

### 1. Public Visitor Flow

```
Landing Page → Works Gallery → Artwork Detail → Series Navigation
      │              │               │
      ▼              ▼               ▼
   Studio        Bio Page      Contact (mailto)
```

### 2. Admin Authentication Flow

```
/auth → Zod Validation → Rate Limit Check → CAPTCHA (if needed)
                                │
                                ▼
                    Supabase Auth → Role Check → /admin Dashboard
```

### 3. Content Management Flow

```
Admin Dashboard → Artworks/Series/Studio → CRUD Operations
                         │
                         ▼
            Image Upload → Compression → Storage → CDN
```

---

## Security & Compliance

### Authentication

| Feature | Implementation | Status |
|---------|---------------|--------|
| Email/Password Auth | Supabase Auth | ✅ Active |
| Password Recovery | Edge Function + Email | ✅ Active |
| Rate Limiting | Client-side with localStorage | ✅ 5 attempts / 15 min |
| CAPTCHA | hCaptcha after 3 failed attempts | ✅ Active |
| Role-Based Access | `user_roles` table + `has_role()` | ✅ Active |
| Session Management | Supabase JWT tokens | ✅ Active |

### Row Level Security (RLS)

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| artworks | Public | Admin | Admin | Admin |
| profiles | Owner | Trigger | Owner | — |
| user_roles | Admin | Admin | — | Admin |
| analytics_* | Admin | Public | Restricted | — |

### Input Validation

- **Forms**: Zod schema validation on all auth forms
- **File Uploads**: Type/size validation with image compression
- **API Calls**: Edge function parameter validation

---

## Security Audit Findings

### 🔴 Critical Issues (0)

No critical security vulnerabilities detected.

### 🟠 High Priority (1)

| Finding | Description | Remediation |
|---------|-------------|-------------|
| Leaked Password Protection | Supabase password breach detection disabled | Enable in Supabase Auth settings |

### 🟡 Medium Priority (6)

| Finding | Description | Remediation |
|---------|-------------|-------------|
| Analytics Data Injection | Public INSERT on analytics tables | Consider server-side session validation |
| Cursor Tracking Privacy | User behavior tracked without explicit consent | Add privacy notice / consent modal |
| View Manipulation | Artwork views could be falsified | Implement rate limiting on analytics inserts |
| Page View Poisoning | Fake page views possible | Add session token validation |
| Series Interaction Falsification | Engagement metrics manipulable | Server-side validation layer |
| Console Logs in Production | 8+ console.log statements active | Wrap in `import.meta.env.DEV` checks |

### 🟢 Low Priority / Info (2)

| Finding | Description | Status |
|---------|-------------|--------|
| Profiles Table Empty | Email protection in place | ✅ Correctly configured |
| Client-side Rate Limiting | Can be bypassed | Acceptable for current scale |

---

## Performance Optimizations

### Frontend

| Optimization | Implementation |
|--------------|----------------|
| Code Splitting | Lazy loading with `React.lazy()` for all routes |
| Image Optimization | Client-side compression (browser-image-compression) |
| Query Caching | 5-min stale time, 10-min gc time |
| Prefetching | Admin data prefetched on login |
| PWA | Service worker with offline fallback |
| Animations | CSS keyframes, `will-change` optimization |

### Backend

| Optimization | Implementation |
|--------------|----------------|
| Database Indexes | 14 indexes on analytics tables |
| Connection Pooling | Supabase managed |
| Edge Caching | CDN for static assets |
| Image CDN | Supabase Storage public bucket |

### Metrics Targets

| Metric | Target | Current |
|--------|--------|---------|
| First Contentful Paint | < 1.5s | TBD |
| Largest Contentful Paint | < 2.5s | TBD |
| Time to Interactive | < 3.0s | TBD |
| Lighthouse Performance | > 90 | TBD |

---

## Accessibility (A11y)

### Implemented

| Feature | Status |
|---------|--------|
| Semantic HTML | ✅ `<header>`, `<nav>`, `<main>`, `<article>` |
| Keyboard Navigation | ✅ Accessible buttons and links |
| Focus Indicators | ✅ `focus-visible:ring-2` on interactive elements |
| ARIA Labels | ✅ Navigation controls, images |
| Color Contrast | ✅ HSL-based design system |
| Responsive Design | ✅ Mobile-first approach |

### Pending

| Feature | Priority |
|---------|----------|
| Screen Reader Testing | Medium |
| Skip Navigation Links | Low |
| Reduced Motion Support | Low |

---

## Project Structure

### Modularity

```
src/
├── components/          # 80+ reusable components
│   ├── admin/          # Admin-specific components (analytics, settings, studio)
│   ├── artwork/        # Artwork display components
│   ├── auth/           # Authentication components (hCaptcha)
│   ├── seo/            # Structured data components
│   └── ui/             # Shadcn UI components (40+ components)
├── hooks/              # 30 custom hooks
├── pages/              # Route components
├── lib/                # Utility functions
└── integrations/       # Supabase client & types
```

### Custom Hooks Architecture

| Category | Hooks |
|----------|-------|
| **Data Fetching** | useArtworks, useSeries, useStudioImages, useArtworkImages |
| **Mutations** | useArtworkMutations, useSeriesMutations, useStudioImageMutations |
| **Analytics** | useAnalytics, useRealtimeAnalytics, useArtworkHeatmap, useArtworkCursorTracking |
| **Auth** | useAuth, useUserRole, useRateLimiter |
| **UX** | useIsMobile, useSwipeNavigation, useHapticFeedback |
| **Performance** | useImagePreloader, useImageLazyLoad, useOfflineStatus, useCompressionSettings |

---

## Improvement Roadmap

### Phase 1: Security Hardening (Week 1-2)

- [ ] Enable leaked password protection in Supabase Auth
- [ ] Add server-side analytics validation via Edge Function
- [ ] Implement privacy consent modal for tracking
- [ ] Wrap remaining console.logs in DEV checks

### Phase 2: Performance Optimization (Week 3-4)

- [ ] Implement Lighthouse CI in deployment
- [ ] Add image srcset for responsive images
- [ ] Optimize LCP with priority hints
- [ ] Add connection preloading for external resources

### Phase 3: Analytics Enhancement (Week 5-6)

- [ ] Server-side session token validation
- [ ] Rate limiting on analytics inserts
- [ ] Anomaly detection for fake data
- [ ] Export functionality for reports (CSV/PDF)

### Phase 4: Accessibility (Week 7-8)

- [ ] WCAG 2.1 AA compliance audit
- [ ] Screen reader testing (NVDA, VoiceOver)
- [ ] Reduced motion preferences (`prefers-reduced-motion`)
- [ ] Skip navigation implementation

### Phase 5: Documentation & Testing (Ongoing)

- [ ] API documentation with OpenAPI spec
- [ ] Component storybook
- [ ] E2E test coverage > 80%
- [ ] Unit test coverage > 70%

---

## Development Setup

### Prerequisites

- Node.js 18+ (install via [nvm](https://github.com/nvm-sh/nvm))
- npm or bun

### Installation

```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to project directory
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm install

# Start development server
npm run dev
```

### Environment

The project uses Lovable Cloud which automatically provides:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_PROJECT_ID`

---

## Deployment

### Lovable Platform

Simply click **Share → Publish** in the [Lovable Project](https://lovable.dev/projects/eb1c9d63-7f08-49ec-993b-0afe8823d058).

### Custom Domain

Navigate to **Project > Settings > Domains** and click **Connect Domain**.

[Read more about custom domains](https://docs.lovable.dev/features/custom-domain#custom-domain)

---

## Metrics & KPIs

### Technical Health

| Metric | Target | Measurement |
|--------|--------|-------------|
| Uptime | 99.9% | Supabase monitoring |
| API Response Time | < 200ms | Edge function logs |
| Error Rate | < 0.1% | Console error tracking |
| Bundle Size | < 500KB gzipped | Build output |

### Business Metrics

| Metric | Purpose |
|--------|---------|
| Session Duration | Engagement quality |
| Artwork Views | Content popularity |
| Cursor Heatmaps | UX optimization |
| Return Visitor Rate | Retention |
| Geographic Distribution | Market insights |

---

## License

Proprietary — All rights reserved.

---

<div align="center">

**Built with ❤️ using [Lovable](https://lovable.dev)**

</div>
