
# Documento de Onboarding Completo para TRI-PEEL

## Objetivo
Crear un nuevo archivo `ONBOARDING.md` en la raiz del proyecto con documentacion exhaustiva para que cualquier desarrollador nuevo pueda entender y trabajar con la plataforma en el menor tiempo posible. El README.md existente se mantiene como esta.

## Contenido del documento

### 1. Introduccion y Vision del Producto
- Que es TRI-PEEL: portfolio digital para el artista Ivan Comas
- URL publicada: nomerepresenta.lovable.app
- Publico objetivo: coleccionistas, curadores, galerias

### 2. Diagrama de Arquitectura Visual (Mermaid en texto ASCII)
Flujo completo: Usuario -> React SPA -> Lovable Cloud (PostgreSQL + Storage + Edge Functions + Auth)

### 3. Stack Tecnologico Detallado
Tabla con cada tecnologia, version y para que se usa:
- React 18.3 + TypeScript, Vite + PWA, TailwindCSS + Shadcn/ui
- TanStack React Query v5, React Router v6
- Lovable Cloud (PostgreSQL, Auth, Storage, Edge Functions)
- dnd-kit para drag-and-drop, Recharts para graficos, P5.js para fondo generativo
- Workbox para service worker, Zod para validacion, browser-image-compression

### 4. Mapa de Rutas y Navegacion
Tabla con todas las rutas, componente asociado, si es publica/protegida:
- `/` -> Landing (publica)
- `/works` -> WorksPage (publica)
- `/artwork/:id` -> ArtworkDetail (publica)
- `/studio` -> Studio (publica)
- `/bio` -> Bio (publica)
- `/auth` -> Auth (publica)
- `/reset-password` -> ResetPassword (publica)
- `/install` -> Install (publica, PWA)
- `/admin` -> Admin (protegida, requiere rol admin)

### 5. Esquema de Base de Datos
Tablas principales con sus columnas clave:
- **Contenido**: artworks, artwork_images, series, studio_images
- **Analytics**: analytics_sessions, page_views, artwork_views, artwork_cursor_tracking, series_interactions
- **Auth**: profiles, user_roles

### 6. Backend Functions
Las 5 edge functions y que hacen:
- `recommend-artworks` - Recomendaciones de obras
- `send-password-reset` - Email de recuperacion
- `sitemap` - Generacion dinamica de sitemap
- `track-analytics` - Tracking de sesiones
- `verify-captcha` - Verificacion hCaptcha

### 7. Sistema de Tipos
Referencia al sistema centralizado en `src/types/` con barrel file

### 8. Estructura de Carpetas
Arbol completo de `src/` con descripcion de cada directorio

### 9. Hooks Personalizados
Agrupados por categoria: Data Fetching, Mutations, Analytics, Auth, UX, Performance

### 10. Patrones de Codigo
- Code splitting con React.lazy
- React Query con staleTime/gcTime configurados
- Caching de imagenes con service worker (Workbox)
- Compresion de imagenes client-side
- RLS policies y seguridad

### 11. Setup de Desarrollo
Pasos para clonar, instalar y correr el proyecto

### 12. Flujos de Usuario Principales
Visitante publico, admin login, gestion de contenido

### 13. PWA y Offline
Configuracion de service worker, caching strategies

### 14. Seguridad
Auth flow, rate limiting, hCaptcha, RLS

---

## Detalles tecnicos

- **Archivo a crear**: `ONBOARDING.md` en la raiz del proyecto
- **Formato**: Markdown con tablas, diagramas ASCII, bloques de codigo, secciones claramente separadas
- **Idioma**: Ingles (standard para documentacion tecnica)
- **Longitud estimada**: ~400-500 lineas
- **No se modifica** ningun archivo existente, incluyendo README.md
