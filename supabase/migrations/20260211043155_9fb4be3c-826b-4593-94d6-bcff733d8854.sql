
-- Track which studio series each session scrolled to
CREATE TABLE public.studio_scroll_tracking (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id text NOT NULL,
  series_id uuid NOT NULL REFERENCES public.studio_series(id) ON DELETE CASCADE,
  scrolled_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Unique constraint: one record per session+series pair
CREATE UNIQUE INDEX idx_studio_scroll_unique ON public.studio_scroll_tracking (session_id, series_id);

-- Enable RLS
ALTER TABLE public.studio_scroll_tracking ENABLE ROW LEVEL SECURITY;

-- Admins can read
CREATE POLICY "Admins can view studio scroll tracking"
  ON public.studio_scroll_tracking
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Anyone can insert (anonymous tracking)
CREATE POLICY "Anyone can insert studio scroll tracking"
  ON public.studio_scroll_tracking
  FOR INSERT
  WITH CHECK (true);
