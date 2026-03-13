import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

const STORAGE_KEY = 'analytics_session_id';

// Generate a simple fingerprint based on browser characteristics
const generateFingerprint = (): string => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('fingerprint', 2, 2);
  }
  
  const fingerprint = [
    navigator.userAgent,
    navigator.language,
    screen.colorDepth,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset(),
    canvas.toDataURL()
  ].join('|');
  
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < fingerprint.length; i++) {
    const char = fingerprint.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
};

const getDeviceType = (): string => {
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet';
  }
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
};

// Server-side validated analytics tracking
const trackAnalytics = async (action: string, data: Record<string, unknown>) => {
  try {
    const response = await supabase.functions.invoke('track-analytics', {
      body: { action, data }
    });
    
    if (response.error) {
      // Silently ignore non-critical analytics errors (e.g. stale session)
      if (import.meta.env.DEV) {
        console.warn('[Analytics] Edge function error:', response.error);
      }
      return null;
    }
    
    return response.data;
  } catch (error) {
    console.error('[Analytics] Request error:', error);
    return null;
  }
};

export const useAnalytics = () => {
  const sessionIdRef = useRef<string | null>(null);
  const sessionStartRef = useRef<Date>(new Date());
  const currentPageStartRef = useRef<Date>(new Date());
  const currentPagePathRef = useRef<string>('');

  // Initialize or get session
  useEffect(() => {
    const abortController = new AbortController();

    const initSession = async () => {
      let sessionId = localStorage.getItem(STORAGE_KEY);
      
      if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem(STORAGE_KEY, sessionId);
        
        // Get geolocation data with AbortController
        let geoData = { country: null, countryName: null, city: null };
        try {
          const geoResponse = await fetch('https://ipapi.co/json/', {
            signal: abortController.signal,
          });
          if (geoResponse.ok) {
            const geo = await geoResponse.json();
            geoData = {
              country: geo.country_code || null,
              countryName: geo.country_name || null,
              city: geo.city || null,
            };
          }
        } catch (error) {
          // Ignore abort errors
          if (error instanceof Error && error.name === 'AbortError') {
            return;
          }
        }
        
        // Capture UTM parameters from URL
        const urlParams = new URLSearchParams(window.location.search);
        const utmSource = urlParams.get('utm_source');
        const utmMedium = urlParams.get('utm_medium');
        const utmCampaign = urlParams.get('utm_campaign');

        // Create new session via Edge Function (server-side validated)
        await trackAnalytics('create_session', {
          sessionId,
          fingerprint: generateFingerprint(),
          referrer: document.referrer || null,
          userAgent: navigator.userAgent,
          deviceType: getDeviceType(),
          country: geoData.country,
          countryName: geoData.countryName,
          city: geoData.city,
          utmSource: utmSource || null,
          utmMedium: utmMedium || null,
          utmCampaign: utmCampaign || null,
        });
      }
      
      sessionIdRef.current = sessionId;
      sessionStartRef.current = new Date();
    };

    initSession();

    // Update session duration on visibility change
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        updateSessionDuration();
      }
    };

    // Update session duration before unload
    const handleBeforeUnload = () => {
      updateSessionDuration();
      updatePageDuration();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      abortController.abort();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const updateSessionDuration = useCallback(async () => {
    if (!sessionIdRef.current) return;

    const duration = Math.floor((new Date().getTime() - sessionStartRef.current.getTime()) / 1000);
    
    await trackAnalytics('update_session_duration', {
      sessionId: sessionIdRef.current,
      duration,
    });
  }, []);

  const updatePageDuration = useCallback(async () => {
    if (!sessionIdRef.current || !currentPagePathRef.current) return;

    const duration = Math.floor((new Date().getTime() - currentPageStartRef.current.getTime()) / 1000);
    
    await trackAnalytics('update_page_duration', {
      sessionId: sessionIdRef.current,
      pagePath: currentPagePathRef.current,
      duration,
    });
  }, []);

  const trackPageView = useCallback(async (pagePath: string, pageName?: string) => {
    if (!sessionIdRef.current) return;

    // Update previous page duration
    if (currentPagePathRef.current) {
      await updatePageDuration();
    }

    currentPagePathRef.current = pagePath;
    currentPageStartRef.current = new Date();

    await trackAnalytics('track_page_view', {
      sessionId: sessionIdRef.current,
      pagePath,
      pageName: pageName || pagePath,
    });
  }, [updatePageDuration]);

  const trackArtworkView = useCallback(async (
    artworkId: string,
    seriesId: string | null,
    options: {
      clickedDetail?: boolean;
      hovered?: boolean;
    } = {}
  ) => {
    if (!sessionIdRef.current) return;

    const result = await trackAnalytics('track_artwork_view', {
      sessionId: sessionIdRef.current,
      artworkId,
      seriesId,
      clickedDetail: options.clickedDetail || false,
      hovered: options.hovered || false,
    });

    return result?.viewId;
  }, []);

  const endArtworkView = useCallback(async (viewId: string, duration: number) => {
    if (!sessionIdRef.current) return;
    
    await trackAnalytics('end_artwork_view', {
      sessionId: sessionIdRef.current,
      viewId,
      duration,
    });
  }, []);

  const trackSeriesInteraction = useCallback(async (
    seriesId: string,
    options: {
      expandedDescription?: boolean;
      artworksViewedCount?: number;
    } = {}
  ) => {
    if (!sessionIdRef.current) return;

    await trackAnalytics('track_series_interaction', {
      sessionId: sessionIdRef.current,
      seriesId,
      expandedDescription: options.expandedDescription || false,
      artworksViewedCount: options.artworksViewedCount || 0,
    });
  }, []);

  const trackStudioScroll = useCallback(async (seriesId: string) => {
    if (!sessionIdRef.current) return;

    await trackAnalytics('track_studio_scroll', {
      sessionId: sessionIdRef.current,
      seriesId,
    });
  }, []);

  const trackUserEvent = useCallback(async (
    eventType: string,
    eventData?: Record<string, unknown>
  ) => {
    if (!sessionIdRef.current) return;

    await trackAnalytics('track_user_event', {
      sessionId: sessionIdRef.current,
      eventType,
      eventData: eventData || null,
    });
  }, []);

  return {
    sessionId: sessionIdRef.current,
    trackPageView,
    trackArtworkView,
    endArtworkView,
    trackSeriesInteraction,
    trackStudioScroll,
    trackUserEvent,
  };
};
