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

export const useAnalytics = () => {
  const sessionIdRef = useRef<string | null>(null);
  const sessionStartRef = useRef<Date>(new Date());
  const currentPageStartRef = useRef<Date>(new Date());
  const currentPagePathRef = useRef<string>('');

  // Initialize or get session
  useEffect(() => {
    const initSession = async () => {
      let sessionId = localStorage.getItem(STORAGE_KEY);
      
      if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem(STORAGE_KEY, sessionId);
        
        // Create new session
        await supabase.from('analytics_sessions').insert({
          session_id: sessionId,
          visitor_fingerprint: generateFingerprint(),
          referrer: document.referrer || null,
          user_agent: navigator.userAgent,
          device_type: getDeviceType(),
          started_at: new Date().toISOString(),
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
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const updateSessionDuration = useCallback(async () => {
    if (!sessionIdRef.current) return;

    const duration = Math.floor((new Date().getTime() - sessionStartRef.current.getTime()) / 1000);
    
    await supabase
      .from('analytics_sessions')
      .update({
        ended_at: new Date().toISOString(),
        total_duration_seconds: duration,
      })
      .eq('session_id', sessionIdRef.current);
  }, []);

  const updatePageDuration = useCallback(async () => {
    if (!sessionIdRef.current || !currentPagePathRef.current) return;

    const duration = Math.floor((new Date().getTime() - currentPageStartRef.current.getTime()) / 1000);
    
    await supabase
      .from('page_views')
      .update({ time_on_page_seconds: duration })
      .eq('session_id', sessionIdRef.current)
      .eq('page_path', currentPagePathRef.current)
      .order('viewed_at', { ascending: false })
      .limit(1);
  }, []);

  const trackPageView = useCallback(async (pagePath: string, pageName?: string) => {
    if (!sessionIdRef.current) return;

    // Update previous page duration
    if (currentPagePathRef.current) {
      await updatePageDuration();
    }

    currentPagePathRef.current = pagePath;
    currentPageStartRef.current = new Date();

    await supabase.from('page_views').insert({
      session_id: sessionIdRef.current,
      page_path: pagePath,
      page_name: pageName || pagePath,
      viewed_at: new Date().toISOString(),
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

    const { data } = await supabase
      .from('artwork_views')
      .insert({
        session_id: sessionIdRef.current,
        artwork_id: artworkId,
        series_id: seriesId,
        started_at: new Date().toISOString(),
        clicked_detail: options.clickedDetail || false,
        hovered: options.hovered || false,
      })
      .select()
      .single();

    return data?.id;
  }, []);

  const endArtworkView = useCallback(async (viewId: string, duration: number) => {
    await supabase
      .from('artwork_views')
      .update({
        ended_at: new Date().toISOString(),
        view_duration_seconds: duration,
      })
      .eq('id', viewId);
  }, []);

  const trackSeriesInteraction = useCallback(async (
    seriesId: string,
    options: {
      expandedDescription?: boolean;
      artworksViewedCount?: number;
    } = {}
  ) => {
    if (!sessionIdRef.current) return;

    await supabase.from('series_interactions').insert({
      session_id: sessionIdRef.current,
      series_id: seriesId,
      viewed_at: new Date().toISOString(),
      expanded_description: options.expandedDescription || false,
      artworks_viewed_count: options.artworksViewedCount || 0,
    });
  }, []);

  return {
    sessionId: sessionIdRef.current,
    trackPageView,
    trackArtworkView,
    endArtworkView,
    trackSeriesInteraction,
  };
};
