import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { subDays, startOfDay, endOfDay } from 'date-fns';

export interface AnalyticsOverviewStats {
  totalVisitors: number;
  sessionsToday: number;
  avgTimeOnSite: number;
  avgArtworksPerSession: number;
  totalPageViews: number;
  uniqueArtworksViewed: number;
}

export interface DailyVisitors {
  date: string;
  visitors: number;
  sessions: number;
}

export const useAnalyticsStats = (days: number = 30) => {
  return useQuery({
    queryKey: ['analytics-stats', days],
    queryFn: async (): Promise<AnalyticsOverviewStats> => {
      const startDate = subDays(new Date(), days);

      // Total unique visitors (sessions)
      const { count: totalVisitors } = await supabase
        .from('analytics_sessions')
        .select('*', { count: 'exact', head: true })
        .gte('started_at', startDate.toISOString());

      // Sessions today
      const todayStart = startOfDay(new Date());
      const { count: sessionsToday } = await supabase
        .from('analytics_sessions')
        .select('*', { count: 'exact', head: true })
        .gte('started_at', todayStart.toISOString());

      // Average time on site
      const { data: sessions } = await supabase
        .from('analytics_sessions')
        .select('total_duration_seconds')
        .gte('started_at', startDate.toISOString())
        .not('total_duration_seconds', 'is', null);

      const avgTimeOnSite = sessions && sessions.length > 0
        ? Math.floor(sessions.reduce((sum, s) => sum + (s.total_duration_seconds || 0), 0) / sessions.length)
        : 0;

      // Average artworks per session
      const { data: artworkCounts } = await supabase
        .from('artwork_views')
        .select('session_id')
        .gte('started_at', startDate.toISOString());

      const sessionArtworkMap = new Map<string, number>();
      artworkCounts?.forEach(view => {
        sessionArtworkMap.set(view.session_id, (sessionArtworkMap.get(view.session_id) || 0) + 1);
      });

      const avgArtworksPerSession = sessionArtworkMap.size > 0
        ? Math.floor(Array.from(sessionArtworkMap.values()).reduce((sum, count) => sum + count, 0) / sessionArtworkMap.size)
        : 0;

      // Total page views
      const { count: totalPageViews } = await supabase
        .from('page_views')
        .select('*', { count: 'exact', head: true })
        .gte('viewed_at', startDate.toISOString());

      // Unique artworks viewed
      const { data: uniqueArtworks } = await supabase
        .from('artwork_views')
        .select('artwork_id')
        .gte('started_at', startDate.toISOString());

      const uniqueArtworksViewed = new Set(uniqueArtworks?.map(v => v.artwork_id)).size;

      return {
        totalVisitors: totalVisitors || 0,
        sessionsToday: sessionsToday || 0,
        avgTimeOnSite,
        avgArtworksPerSession,
        totalPageViews: totalPageViews || 0,
        uniqueArtworksViewed,
      };
    },
  });
};

export const useDailyVisitors = (days: number = 30) => {
  return useQuery({
    queryKey: ['daily-visitors', days],
    queryFn: async (): Promise<DailyVisitors[]> => {
      const startDate = subDays(new Date(), days);

      const { data: sessions } = await supabase
        .from('analytics_sessions')
        .select('started_at')
        .gte('started_at', startDate.toISOString())
        .order('started_at', { ascending: true });

      // Group by day
      const dailyMap = new Map<string, { visitors: Set<string>; sessions: number }>();

      sessions?.forEach(session => {
        const date = startOfDay(new Date(session.started_at)).toISOString().split('T')[0];
        if (!dailyMap.has(date)) {
          dailyMap.set(date, { visitors: new Set(), sessions: 0 });
        }
        const dayData = dailyMap.get(date)!;
        dayData.sessions++;
      });

      // Fill in missing days
      const result: DailyVisitors[] = [];
      for (let i = days - 1; i >= 0; i--) {
        const date = startOfDay(subDays(new Date(), i)).toISOString().split('T')[0];
        const dayData = dailyMap.get(date);
        result.push({
          date,
          visitors: dayData?.sessions || 0,
          sessions: dayData?.sessions || 0,
        });
      }

      return result;
    },
  });
};
