import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { LiveSession, LiveArtworkView, LiveActivity } from "@/types";

// Re-export for backward compatibility
export type { LiveSession, LiveArtworkView, LiveActivity };

export const useRealtimeAnalytics = () => {
  const [activeSessions, setActiveSessions] = useState<LiveSession[]>([]);
  const [recentArtworkViews, setRecentArtworkViews] = useState<LiveArtworkView[]>([]);
  const [liveActivity, setLiveActivity] = useState<LiveActivity[]>([]);
  const [onlineCount, setOnlineCount] = useState(0);

  useEffect(() => {
    // Load initial data for active sessions (last 5 minutes)
    const loadInitialData = async () => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

      const { data: sessions } = await supabase
        .from('analytics_sessions')
        .select('*')
        .gte('started_at', fiveMinutesAgo)
        .order('started_at', { ascending: false });

      if (sessions) {
        setActiveSessions(sessions);
        setOnlineCount(sessions.length);
      }

      const { data: artworkViews } = await supabase
        .from('artwork_views')
        .select(`
          id,
          artwork_id,
          session_id,
          started_at,
          artworks (
            title,
            series (
              name
            )
          )
        `)
        .gte('started_at', fiveMinutesAgo)
        .order('started_at', { ascending: false })
        .limit(10);

      if (artworkViews) {
        setRecentArtworkViews(artworkViews as LiveArtworkView[]);
      }
    };

    loadInitialData();

    // Set up realtime subscriptions
    const sessionsChannel = supabase
      .channel('realtime-sessions')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'analytics_sessions'
        },
        (payload) => {
          const newSession = payload.new as LiveSession;
          setActiveSessions(prev => [newSession, ...prev].slice(0, 20));
          setOnlineCount(prev => prev + 1);
          
          setLiveActivity(prev => [{
            id: newSession.id,
            type: 'session' as const,
            timestamp: newSession.started_at,
            data: newSession
          }, ...prev].slice(0, 50));
        }
      )
      .subscribe();

    const artworkViewsChannel = supabase
      .channel('realtime-artwork-views')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'artwork_views'
        },
        async (payload) => {
          const newView = payload.new;
          
          // Fetch artwork details
          const { data: artworkData } = await supabase
            .from('artworks')
            .select(`
              title,
              series (
                name
              )
            `)
            .eq('id', newView.artwork_id)
            .single();

          const enrichedView: LiveArtworkView = {
            ...newView,
            artwork: artworkData
          } as LiveArtworkView;

          setRecentArtworkViews(prev => [enrichedView, ...prev].slice(0, 10));
          
          setLiveActivity(prev => [{
            id: newView.id,
            type: 'artwork_view' as const,
            timestamp: newView.started_at,
            data: enrichedView
          }, ...prev].slice(0, 50));
        }
      )
      .subscribe();

    const pageViewsChannel = supabase
      .channel('realtime-page-views')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'page_views'
        },
        (payload) => {
          const newPageView = payload.new;
          
          setLiveActivity(prev => [{
            id: newPageView.id,
            type: 'page_view' as const,
            timestamp: newPageView.viewed_at,
            data: newPageView
          }, ...prev].slice(0, 50));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(sessionsChannel);
      supabase.removeChannel(artworkViewsChannel);
      supabase.removeChannel(pageViewsChannel);
    };
  }, []);

  return {
    activeSessions,
    recentArtworkViews,
    liveActivity,
    onlineCount
  };
};
