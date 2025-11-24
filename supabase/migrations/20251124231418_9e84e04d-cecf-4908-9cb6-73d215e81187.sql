-- Create analytics_sessions table
CREATE TABLE public.analytics_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL UNIQUE,
  visitor_fingerprint text,
  referrer text,
  user_agent text,
  device_type text,
  started_at timestamp with time zone NOT NULL DEFAULT now(),
  ended_at timestamp with time zone,
  total_duration_seconds integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create page_views table
CREATE TABLE public.page_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  page_path text NOT NULL,
  page_name text,
  viewed_at timestamp with time zone NOT NULL DEFAULT now(),
  time_on_page_seconds integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create artwork_views table
CREATE TABLE public.artwork_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  artwork_id uuid NOT NULL REFERENCES public.artworks(id) ON DELETE CASCADE,
  series_id uuid REFERENCES public.series(id) ON DELETE SET NULL,
  started_at timestamp with time zone NOT NULL DEFAULT now(),
  ended_at timestamp with time zone,
  view_duration_seconds integer DEFAULT 0,
  clicked_detail boolean DEFAULT false,
  hovered boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create series_interactions table
CREATE TABLE public.series_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  series_id uuid NOT NULL REFERENCES public.series(id) ON DELETE CASCADE,
  viewed_at timestamp with time zone NOT NULL DEFAULT now(),
  expanded_description boolean DEFAULT false,
  artworks_viewed_count integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.analytics_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artwork_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.series_interactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for analytics_sessions
CREATE POLICY "Admins can view all sessions"
  ON public.analytics_sessions FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can insert sessions"
  ON public.analytics_sessions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update their own session"
  ON public.analytics_sessions FOR UPDATE
  USING (true);

-- RLS Policies for page_views
CREATE POLICY "Admins can view all page views"
  ON public.page_views FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can insert page views"
  ON public.page_views FOR INSERT
  WITH CHECK (true);

-- RLS Policies for artwork_views
CREATE POLICY "Admins can view all artwork views"
  ON public.artwork_views FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can insert artwork views"
  ON public.artwork_views FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update artwork views"
  ON public.artwork_views FOR UPDATE
  USING (true);

-- RLS Policies for series_interactions
CREATE POLICY "Admins can view all series interactions"
  ON public.series_interactions FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can insert series interactions"
  ON public.series_interactions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update series interactions"
  ON public.series_interactions FOR UPDATE
  USING (true);

-- Create indexes for better query performance
CREATE INDEX idx_analytics_sessions_session_id ON public.analytics_sessions(session_id);
CREATE INDEX idx_analytics_sessions_started_at ON public.analytics_sessions(started_at DESC);
CREATE INDEX idx_page_views_session_id ON public.page_views(session_id);
CREATE INDEX idx_page_views_viewed_at ON public.page_views(viewed_at DESC);
CREATE INDEX idx_artwork_views_session_id ON public.artwork_views(session_id);
CREATE INDEX idx_artwork_views_artwork_id ON public.artwork_views(artwork_id);
CREATE INDEX idx_artwork_views_started_at ON public.artwork_views(started_at DESC);
CREATE INDEX idx_series_interactions_session_id ON public.series_interactions(session_id);
CREATE INDEX idx_series_interactions_series_id ON public.series_interactions(series_id);
CREATE INDEX idx_series_interactions_viewed_at ON public.series_interactions(viewed_at DESC);