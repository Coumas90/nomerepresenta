
-- Create a flexible user_events table for tracking specific user behaviors
CREATE TABLE public.user_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index for querying by event type and date
CREATE INDEX idx_user_events_type_created ON public.user_events (event_type, created_at DESC);
CREATE INDEX idx_user_events_session ON public.user_events (session_id);

-- Enable RLS
ALTER TABLE public.user_events ENABLE ROW LEVEL SECURITY;

-- Anyone can insert events (via edge function)
CREATE POLICY "Anyone can insert user events"
ON public.user_events
FOR INSERT
WITH CHECK (true);

-- Only admins can view events
CREATE POLICY "Admins can view user events"
ON public.user_events
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));
