import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { subDays, startOfDay, endOfDay, differenceInDays, eachDayOfInterval } from 'date-fns';

export interface AnalyticsOverviewStats {
  totalVisitors: number;
  sessionsToday: number;
  avgTimeOnSite: number;
  avgArtworksPerSession: number;
  totalPageViews: number;
  uniqueArtworksViewed: number;
  dailyVisitors: DailyVisitors[];
}

export interface DailyVisitors {
  date: string;
  visitors: number;
  sessions: number;
}

export const useAnalyticsStats = (startDate?: Date, endDate?: Date) => {
  const effectiveStartDate = startDate || subDays(new Date(), 30);
  const effectiveEndDate = endDate || new Date();

  return useQuery({
    queryKey: ['analytics-stats', effectiveStartDate.toISOString(), effectiveEndDate.toISOString()],
    queryFn: async (): Promise<AnalyticsOverviewStats> => {
      const todayStart = startOfDay(new Date());

      // Execute all queries in parallel (including daily visitors)
      const [
        { count: totalVisitors },
        { count: sessionsToday },
        { data: sessions },
        { data: artworkCounts },
        { count: totalPageViews },
        { data: uniqueArtworks },
        { data: dailySessions },
      ] = await Promise.all([
        // Total unique visitors (sessions)
        supabase
          .from('analytics_sessions')
          .select('*', { count: 'exact', head: true })
          .gte('started_at', effectiveStartDate.toISOString())
          .lte('started_at', effectiveEndDate.toISOString()),
        
        // Sessions today
        supabase
          .from('analytics_sessions')
          .select('*', { count: 'exact', head: true })
          .gte('started_at', todayStart.toISOString()),
        
        // Average time on site
        supabase
          .from('analytics_sessions')
          .select('total_duration_seconds')
          .gte('started_at', effectiveStartDate.toISOString())
          .lte('started_at', effectiveEndDate.toISOString())
          .not('total_duration_seconds', 'is', null),
        
        // Average artworks per session
        supabase
          .from('artwork_views')
          .select('session_id')
          .gte('started_at', effectiveStartDate.toISOString())
          .lte('started_at', effectiveEndDate.toISOString()),
        
        // Total page views
        supabase
          .from('page_views')
          .select('*', { count: 'exact', head: true })
          .gte('viewed_at', effectiveStartDate.toISOString())
          .lte('viewed_at', effectiveEndDate.toISOString()),
        
        // Unique artworks viewed
        supabase
          .from('artwork_views')
          .select('artwork_id')
          .gte('started_at', effectiveStartDate.toISOString())
          .lte('started_at', effectiveEndDate.toISOString()),
        
        // Daily sessions for chart
        supabase
          .from('analytics_sessions')
          .select('started_at')
          .gte('started_at', effectiveStartDate.toISOString())
          .lte('started_at', effectiveEndDate.toISOString())
          .order('started_at', { ascending: true }),
      ]);

      const avgTimeOnSite = sessions && sessions.length > 0
        ? Math.floor(sessions.reduce((sum, s) => sum + (s.total_duration_seconds || 0), 0) / sessions.length)
        : 0;

      const sessionArtworkMap = new Map<string, number>();
      artworkCounts?.forEach(view => {
        sessionArtworkMap.set(view.session_id, (sessionArtworkMap.get(view.session_id) || 0) + 1);
      });

      const avgArtworksPerSession = sessionArtworkMap.size > 0
        ? Math.floor(Array.from(sessionArtworkMap.values()).reduce((sum, count) => sum + count, 0) / sessionArtworkMap.size)
        : 0;

      const uniqueArtworksViewed = new Set(uniqueArtworks?.map(v => v.artwork_id)).size;

      // Process daily visitors data
      const dailyMap = new Map<string, { visitors: Set<string>; sessions: number }>();
      dailySessions?.forEach(session => {
        const date = startOfDay(new Date(session.started_at)).toISOString().split('T')[0];
        if (!dailyMap.has(date)) {
          dailyMap.set(date, { visitors: new Set(), sessions: 0 });
        }
        const dayData = dailyMap.get(date)!;
        dayData.sessions++;
      });

      // Fill in missing days with all days in range
      const allDays = eachDayOfInterval({ start: effectiveStartDate, end: effectiveEndDate });
      const dailyVisitors: DailyVisitors[] = allDays.map(day => {
        const date = startOfDay(day).toISOString().split('T')[0];
        const dayData = dailyMap.get(date);
        return {
          date,
          visitors: dayData?.sessions || 0,
          sessions: dayData?.sessions || 0,
        };
      });

      return {
        totalVisitors: totalVisitors || 0,
        sessionsToday: sessionsToday || 0,
        avgTimeOnSite,
        avgArtworksPerSession,
        totalPageViews: totalPageViews || 0,
        uniqueArtworksViewed,
        dailyVisitors,
      };
    },
  });
};

export const useDailyVisitors = (startDate?: Date, endDate?: Date) => {
  const effectiveStartDate = startDate || subDays(new Date(), 30);
  const effectiveEndDate = endDate || new Date();

  return useQuery({
    queryKey: ['daily-visitors', effectiveStartDate.toISOString(), effectiveEndDate.toISOString()],
    queryFn: async (): Promise<DailyVisitors[]> => {
      const { data: sessions } = await supabase
        .from('analytics_sessions')
        .select('started_at')
        .gte('started_at', effectiveStartDate.toISOString())
        .lte('started_at', effectiveEndDate.toISOString())
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

      // Fill in missing days with all days in range
      const allDays = eachDayOfInterval({ start: effectiveStartDate, end: effectiveEndDate });
      const result: DailyVisitors[] = allDays.map(day => {
        const date = startOfDay(day).toISOString().split('T')[0];
        const dayData = dailyMap.get(date);
        return {
          date,
          visitors: dayData?.sessions || 0,
          sessions: dayData?.sessions || 0,
        };
      });

      return result;
    },
  });
};
