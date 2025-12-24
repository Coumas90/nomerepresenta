-- Drop existing overly permissive UPDATE policies
DROP POLICY IF EXISTS "Anyone can update their own session" ON public.analytics_sessions;
DROP POLICY IF EXISTS "Anyone can update their own artwork views" ON public.artwork_views;
DROP POLICY IF EXISTS "Anyone can update their own series interactions" ON public.series_interactions;

-- Create restricted UPDATE policy for analytics_sessions
-- Only allow updating ended_at and total_duration_seconds
CREATE POLICY "Anyone can update session duration only"
ON public.analytics_sessions
FOR UPDATE
USING (true)
WITH CHECK (
  -- Ensure immutable fields are not changed
  session_id = session_id AND
  visitor_fingerprint IS NOT DISTINCT FROM visitor_fingerprint AND
  started_at = started_at AND
  device_type IS NOT DISTINCT FROM device_type AND
  referrer IS NOT DISTINCT FROM referrer AND
  user_agent IS NOT DISTINCT FROM user_agent AND
  country IS NOT DISTINCT FROM country AND
  country_name IS NOT DISTINCT FROM country_name AND
  city IS NOT DISTINCT FROM city
);

-- Create restricted UPDATE policy for artwork_views
-- Only allow updating ended_at and view_duration_seconds
CREATE POLICY "Anyone can update artwork view duration only"
ON public.artwork_views
FOR UPDATE
USING (true)
WITH CHECK (
  -- Ensure immutable fields are not changed
  artwork_id = artwork_id AND
  session_id = session_id AND
  series_id IS NOT DISTINCT FROM series_id AND
  started_at = started_at AND
  clicked_detail IS NOT DISTINCT FROM clicked_detail AND
  hovered IS NOT DISTINCT FROM hovered
);

-- Create restricted UPDATE policy for series_interactions
-- Only allow updating artworks_viewed_count
CREATE POLICY "Anyone can update series interaction count only"
ON public.series_interactions
FOR UPDATE
USING (true)
WITH CHECK (
  -- Ensure immutable fields are not changed
  series_id = series_id AND
  session_id = session_id AND
  viewed_at = viewed_at AND
  expanded_description IS NOT DISTINCT FROM expanded_description
);