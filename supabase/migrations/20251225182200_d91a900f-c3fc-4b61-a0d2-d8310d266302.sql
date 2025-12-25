-- Add indexes for analytics tables to improve query performance

-- analytics_sessions: commonly queried by session_id and created_at
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_session_id ON public.analytics_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_created_at ON public.analytics_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_started_at ON public.analytics_sessions(started_at DESC);

-- artwork_views: commonly queried by artwork_id, session_id, and created_at
CREATE INDEX IF NOT EXISTS idx_artwork_views_artwork_id ON public.artwork_views(artwork_id);
CREATE INDEX IF NOT EXISTS idx_artwork_views_session_id ON public.artwork_views(session_id);
CREATE INDEX IF NOT EXISTS idx_artwork_views_created_at ON public.artwork_views(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_artwork_views_series_id ON public.artwork_views(series_id);

-- page_views: commonly queried by session_id and page_path
CREATE INDEX IF NOT EXISTS idx_page_views_session_id ON public.page_views(session_id);
CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON public.page_views(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_views_page_path ON public.page_views(page_path);

-- artwork_cursor_tracking: commonly queried by artwork_id and session_id
CREATE INDEX IF NOT EXISTS idx_artwork_cursor_tracking_artwork_id ON public.artwork_cursor_tracking(artwork_id);
CREATE INDEX IF NOT EXISTS idx_artwork_cursor_tracking_session_id ON public.artwork_cursor_tracking(session_id);

-- series_interactions: commonly queried by series_id and session_id
CREATE INDEX IF NOT EXISTS idx_series_interactions_series_id ON public.series_interactions(series_id);
CREATE INDEX IF NOT EXISTS idx_series_interactions_session_id ON public.series_interactions(session_id);
CREATE INDEX IF NOT EXISTS idx_series_interactions_created_at ON public.series_interactions(created_at DESC);