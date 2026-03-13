import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limiting: max requests per session per minute
const RATE_LIMIT_WINDOW_MS = 60000;
const MAX_REQUESTS_PER_WINDOW = 100;
const sessionRequestCounts = new Map<string, { count: number; windowStart: number }>();

// Validation schemas
const validateSessionId = (sessionId: string): boolean => {
  // Session ID format: session_{timestamp}_{random}
  const sessionPattern = /^session_\d+_[a-z0-9]{9}$/;
  return typeof sessionId === 'string' && sessionPattern.test(sessionId);
};

const validateFingerprint = (fingerprint: string): boolean => {
  // Fingerprint is a base36 hash
  return typeof fingerprint === 'string' && fingerprint.length > 0 && fingerprint.length < 20;
};

const validateDeviceType = (deviceType: string): boolean => {
  return ['mobile', 'tablet', 'desktop'].includes(deviceType);
};

const validateUUID = (uuid: string): boolean => {
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return typeof uuid === 'string' && uuidPattern.test(uuid);
};

const validatePagePath = (pagePath: string): boolean => {
  return typeof pagePath === 'string' && pagePath.length > 0 && pagePath.length < 500;
};

const sanitizeString = (str: string, maxLength: number = 500): string => {
  if (typeof str !== 'string') return '';
  return str.slice(0, maxLength).trim();
};

// Rate limiting check
const checkRateLimit = (sessionId: string): boolean => {
  const now = Date.now();
  const record = sessionRequestCounts.get(sessionId);
  
  if (!record || now - record.windowStart > RATE_LIMIT_WINDOW_MS) {
    sessionRequestCounts.set(sessionId, { count: 1, windowStart: now });
    return true;
  }
  
  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return false;
  }
  
  record.count++;
  return true;
};

// Clean up old rate limit records periodically
setInterval(() => {
  const now = Date.now();
  for (const [sessionId, record] of sessionRequestCounts.entries()) {
    if (now - record.windowStart > RATE_LIMIT_WINDOW_MS * 2) {
      sessionRequestCounts.delete(sessionId);
    }
  }
}, RATE_LIMIT_WINDOW_MS);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { action, data } = await req.json();
    
    console.log(`[Analytics] Action: ${action}, Session: ${data?.sessionId || 'unknown'}`);

    // Validate session ID for all actions
    if (!data?.sessionId || !validateSessionId(data.sessionId)) {
      console.error('[Analytics] Invalid session ID:', data?.sessionId);
      return new Response(
        JSON.stringify({ error: 'Invalid session ID format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check rate limit
    if (!checkRateLimit(data.sessionId)) {
      console.warn('[Analytics] Rate limit exceeded for session:', data.sessionId);
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    switch (action) {
      case 'create_session': {
        // Validate required fields
        if (!validateFingerprint(data.fingerprint)) {
          return new Response(
            JSON.stringify({ error: 'Invalid fingerprint' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        if (data.deviceType && !validateDeviceType(data.deviceType)) {
          return new Response(
            JSON.stringify({ error: 'Invalid device type' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Check if session already exists
        const { data: existingSession } = await supabase
          .from('analytics_sessions')
          .select('id')
          .eq('session_id', data.sessionId)
          .single();

        if (existingSession) {
          console.log('[Analytics] Session already exists:', data.sessionId);
          return new Response(
            JSON.stringify({ success: true, message: 'Session already exists' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { error } = await supabase.from('analytics_sessions').insert({
          session_id: data.sessionId,
          visitor_fingerprint: sanitizeString(data.fingerprint, 50),
          referrer: data.referrer ? sanitizeString(data.referrer, 2000) : null,
          user_agent: data.userAgent ? sanitizeString(data.userAgent, 500) : null,
          device_type: data.deviceType || 'desktop',
          country: data.country ? sanitizeString(data.country, 10) : null,
          country_name: data.countryName ? sanitizeString(data.countryName, 100) : null,
          city: data.city ? sanitizeString(data.city, 100) : null,
          utm_source: data.utmSource ? sanitizeString(data.utmSource, 200) : null,
          utm_medium: data.utmMedium ? sanitizeString(data.utmMedium, 200) : null,
          utm_campaign: data.utmCampaign ? sanitizeString(data.utmCampaign, 200) : null,
          started_at: new Date().toISOString(),
        });

        if (error) {
          console.error('[Analytics] Error creating session:', error);
          throw error;
        }

        console.log('[Analytics] Session created:', data.sessionId);
        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'update_session_duration': {
        if (typeof data.duration !== 'number' || data.duration < 0 || data.duration > 86400) {
          return new Response(
            JSON.stringify({ error: 'Invalid duration' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { error } = await supabase
          .from('analytics_sessions')
          .update({
            ended_at: new Date().toISOString(),
            total_duration_seconds: Math.floor(data.duration),
          })
          .eq('session_id', data.sessionId);

        if (error) {
          console.error('[Analytics] Error updating session duration:', error);
          throw error;
        }

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'track_page_view': {
        if (!validatePagePath(data.pagePath)) {
          return new Response(
            JSON.stringify({ error: 'Invalid page path' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Verify session exists
        const { data: session } = await supabase
          .from('analytics_sessions')
          .select('id')
          .eq('session_id', data.sessionId)
          .single();

        if (!session) {
          console.error('[Analytics] Session not found for page view:', data.sessionId);
          return new Response(
            JSON.stringify({ error: 'Session not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { error } = await supabase.from('page_views').insert({
          session_id: data.sessionId,
          page_path: sanitizeString(data.pagePath, 500),
          page_name: data.pageName ? sanitizeString(data.pageName, 100) : data.pagePath,
          viewed_at: new Date().toISOString(),
        });

        if (error) {
          console.error('[Analytics] Error tracking page view:', error);
          throw error;
        }

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'update_page_duration': {
        if (!validatePagePath(data.pagePath)) {
          return new Response(
            JSON.stringify({ error: 'Invalid page path' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        if (typeof data.duration !== 'number' || data.duration < 0 || data.duration > 86400) {
          return new Response(
            JSON.stringify({ error: 'Invalid duration' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { error } = await supabase
          .from('page_views')
          .update({ time_on_page_seconds: Math.floor(data.duration) })
          .eq('session_id', data.sessionId)
          .eq('page_path', data.pagePath)
          .order('viewed_at', { ascending: false })
          .limit(1);

        if (error) {
          console.error('[Analytics] Error updating page duration:', error);
          throw error;
        }

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'track_artwork_view': {
        if (!validateUUID(data.artworkId)) {
          return new Response(
            JSON.stringify({ error: 'Invalid artwork ID' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        if (data.seriesId && !validateUUID(data.seriesId)) {
          return new Response(
            JSON.stringify({ error: 'Invalid series ID' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Verify session exists
        const { data: session } = await supabase
          .from('analytics_sessions')
          .select('id')
          .eq('session_id', data.sessionId)
          .single();

        if (!session) {
          console.error('[Analytics] Session not found for artwork view:', data.sessionId);
          return new Response(
            JSON.stringify({ error: 'Session not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Verify artwork exists
        const { data: artwork } = await supabase
          .from('artworks')
          .select('id')
          .eq('id', data.artworkId)
          .single();

        if (!artwork) {
          return new Response(
            JSON.stringify({ error: 'Artwork not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { data: viewData, error } = await supabase
          .from('artwork_views')
          .insert({
            session_id: data.sessionId,
            artwork_id: data.artworkId,
            series_id: data.seriesId || null,
            started_at: new Date().toISOString(),
            clicked_detail: !!data.clickedDetail,
            hovered: !!data.hovered,
          })
          .select()
          .single();

        if (error) {
          console.error('[Analytics] Error tracking artwork view:', error);
          throw error;
        }

        return new Response(
          JSON.stringify({ success: true, viewId: viewData?.id }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'end_artwork_view': {
        if (!validateUUID(data.viewId)) {
          return new Response(
            JSON.stringify({ error: 'Invalid view ID' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        if (typeof data.duration !== 'number' || data.duration < 0 || data.duration > 86400) {
          return new Response(
            JSON.stringify({ error: 'Invalid duration' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { error } = await supabase
          .from('artwork_views')
          .update({
            ended_at: new Date().toISOString(),
            view_duration_seconds: Math.floor(data.duration),
          })
          .eq('id', data.viewId);

        if (error) {
          console.error('[Analytics] Error ending artwork view:', error);
          throw error;
        }

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'track_series_interaction': {
        if (!validateUUID(data.seriesId)) {
          return new Response(
            JSON.stringify({ error: 'Invalid series ID' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Verify session exists
        const { data: session } = await supabase
          .from('analytics_sessions')
          .select('id')
          .eq('session_id', data.sessionId)
          .single();

        if (!session) {
          console.error('[Analytics] Session not found for series interaction:', data.sessionId);
          return new Response(
            JSON.stringify({ error: 'Session not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Verify series exists
        const { data: series } = await supabase
          .from('series')
          .select('id')
          .eq('id', data.seriesId)
          .single();

        if (!series) {
          return new Response(
            JSON.stringify({ error: 'Series not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { error } = await supabase.from('series_interactions').insert({
          session_id: data.sessionId,
          series_id: data.seriesId,
          viewed_at: new Date().toISOString(),
          expanded_description: !!data.expandedDescription,
          artworks_viewed_count: typeof data.artworksViewedCount === 'number' 
            ? Math.min(Math.max(0, Math.floor(data.artworksViewedCount)), 1000) 
            : 0,
        });

        if (error) {
          console.error('[Analytics] Error tracking series interaction:', error);
          throw error;
        }

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'track_studio_scroll': {
        if (!validateUUID(data.seriesId)) {
          return new Response(
            JSON.stringify({ error: 'Invalid series ID' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Verify session exists
        const { data: studioSession } = await supabase
          .from('analytics_sessions')
          .select('id')
          .eq('session_id', data.sessionId)
          .single();

        if (!studioSession) {
          return new Response(
            JSON.stringify({ error: 'Session not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Upsert: only insert if not already tracked for this session+series
        const { error } = await supabase
          .from('studio_scroll_tracking')
          .upsert(
            {
              session_id: data.sessionId,
              series_id: data.seriesId,
              scrolled_at: new Date().toISOString(),
            },
            { onConflict: 'session_id,series_id', ignoreDuplicates: true }
          );

        if (error) {
          console.error('[Analytics] Error tracking studio scroll:', error);
          throw error;
        }

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'track_user_event': {
        const validEventTypes = [
          'bio_scroll_complete',
          'contact_click',
          'works_scroll_complete',
          'gallery_navigate',
          'pricelist_artwork_view',
          'pricelist_select',
          'pricelist_unselect',
          'pricelist_inquiry_open',
          'pricelist_inquiry_sent',
          'pricelist_download_pdf',
        ];

        if (!data.eventType || !validEventTypes.includes(data.eventType)) {
          return new Response(
            JSON.stringify({ error: 'Invalid event type' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Ensure session exists (recover from stale local session IDs)
        const { data: eventSession, error: eventSessionLookupError } = await supabase
          .from('analytics_sessions')
          .select('id')
          .eq('session_id', data.sessionId)
          .maybeSingle();

        if (eventSessionLookupError) {
          console.error('[Analytics] Error checking session for user event:', eventSessionLookupError);
          throw eventSessionLookupError;
        }

        if (!eventSession) {
          const { error: createSessionError } = await supabase.from('analytics_sessions').insert({
            session_id: data.sessionId,
            started_at: new Date().toISOString(),
            device_type: 'desktop',
          });

          if (createSessionError) {
            console.error('[Analytics] Error auto-creating missing session for user event:', createSessionError);
            throw createSessionError;
          }
        }

        const { error } = await supabase.from('user_events').insert({
          session_id: data.sessionId,
          event_type: data.eventType,
          event_data: data.eventData || null,
        });

        if (error) {
          console.error('[Analytics] Error tracking user event:', error);
          throw error;
        }

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'track_cursor': {
        if (!validateUUID(data.artworkId)) {
          return new Response(
            JSON.stringify({ error: 'Invalid artwork ID' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        if (!Array.isArray(data.positions) || data.positions.length === 0 || data.positions.length > 100) {
          return new Response(
            JSON.stringify({ error: 'Invalid positions array' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Validate each position
        const validPositions = data.positions.filter((pos: any) => 
          typeof pos.x === 'number' && pos.x >= 0 && pos.x <= 100 &&
          typeof pos.y === 'number' && pos.y >= 0 && pos.y <= 100 &&
          typeof pos.viewportWidth === 'number' && pos.viewportWidth > 0 && pos.viewportWidth < 10000 &&
          typeof pos.viewportHeight === 'number' && pos.viewportHeight > 0 && pos.viewportHeight < 10000
        );

        if (validPositions.length === 0) {
          return new Response(
            JSON.stringify({ error: 'No valid positions' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const cursorData = validPositions.map((pos: any) => ({
          session_id: data.sessionId,
          artwork_id: data.artworkId,
          x_position: Math.round(pos.x),
          y_position: Math.round(pos.y),
          viewport_width: Math.round(pos.viewportWidth),
          viewport_height: Math.round(pos.viewportHeight),
        }));

        const { error } = await supabase
          .from('artwork_cursor_tracking')
          .insert(cursorData);

        if (error) {
          console.error('[Analytics] Error tracking cursor:', error);
          throw error;
        }

        return new Response(
          JSON.stringify({ success: true, tracked: cursorData.length }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Unknown action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error) {
    console.error('[Analytics] Server error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
