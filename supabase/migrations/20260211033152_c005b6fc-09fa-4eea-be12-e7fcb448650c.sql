-- Add UTM tracking columns to analytics_sessions
ALTER TABLE public.analytics_sessions
ADD COLUMN utm_source text DEFAULT NULL,
ADD COLUMN utm_medium text DEFAULT NULL,
ADD COLUMN utm_campaign text DEFAULT NULL;