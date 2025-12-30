import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { DeviceDistribution, TrafficSource, HourlyPattern, DailyPattern } from '@/types';

export const useDeviceDistribution = (startDate: Date, endDate: Date) => {
  return useQuery({
    queryKey: ['device-distribution', startDate.toISOString(), endDate.toISOString()],
    queryFn: async (): Promise<DeviceDistribution[]> => {
      const { data: sessions } = await supabase
        .from('analytics_sessions')
        .select('device_type')
        .gte('started_at', startDate.toISOString())
        .lte('started_at', endDate.toISOString());

      if (!sessions || sessions.length === 0) return [];

      const total = sessions.length;
      const deviceMap = new Map<string, number>();

      sessions.forEach(session => {
        const device = session.device_type || 'unknown';
        deviceMap.set(device, (deviceMap.get(device) || 0) + 1);
      });

      return Array.from(deviceMap.entries())
        .map(([device_type, count]) => ({
          device_type,
          count,
          percentage: Math.round((count / total) * 100),
        }))
        .sort((a, b) => b.count - a.count);
    },
  });
};

export const useTrafficSources = (startDate: Date, endDate: Date) => {
  return useQuery({
    queryKey: ['traffic-sources', startDate.toISOString(), endDate.toISOString()],
    queryFn: async (): Promise<TrafficSource[]> => {
      const { data: sessions } = await supabase
        .from('analytics_sessions')
        .select('referrer, visitor_fingerprint')
        .gte('started_at', startDate.toISOString())
        .lte('started_at', endDate.toISOString());

      if (!sessions || sessions.length === 0) return [];

      const sourceMap = new Map<string, {
        visitors: Set<string>;
        sessions: number;
      }>();

      sessions.forEach(session => {
        let source = 'Direct';
        if (session.referrer) {
          try {
            const url = new URL(session.referrer);
            source = url.hostname;
          } catch {
            source = session.referrer;
          }
        }

        if (!sourceMap.has(source)) {
          sourceMap.set(source, {
            visitors: new Set(),
            sessions: 0,
          });
        }

        const data = sourceMap.get(source)!;
        data.sessions++;
        if (session.visitor_fingerprint) {
          data.visitors.add(session.visitor_fingerprint);
        }
      });

      return Array.from(sourceMap.entries())
        .map(([referrer, data]) => ({
          referrer,
          visitors: data.visitors.size,
          sessions: data.sessions,
        }))
        .sort((a, b) => b.sessions - a.sessions)
        .slice(0, 10);
    },
  });
};

export const useVisitorPatterns = (startDate: Date, endDate: Date) => {
  return useQuery({
    queryKey: ['visitor-patterns', startDate.toISOString(), endDate.toISOString()],
    queryFn: async () => {
      const { data: sessions } = await supabase
        .from('analytics_sessions')
        .select('started_at, visitor_fingerprint')
        .gte('started_at', startDate.toISOString())
        .lte('started_at', endDate.toISOString());

      if (!sessions || sessions.length === 0) {
        return {
          hourly: [] as HourlyPattern[],
          daily: [] as DailyPattern[],
          newVisitors: 0,
          returningVisitors: 0,
        };
      }

      // Hourly patterns
      const hourMap = new Map<number, number>();
      for (let i = 0; i < 24; i++) hourMap.set(i, 0);

      // Daily patterns
      const dayMap = new Map<string, number>();
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      days.forEach(day => dayMap.set(day, 0));

      // Visitor tracking
      const visitorSessions = new Map<string, number>();

      sessions.forEach(session => {
        const date = new Date(session.started_at);
        
        // Hour
        const hour = date.getHours();
        hourMap.set(hour, (hourMap.get(hour) || 0) + 1);
        
        // Day of week
        const dayName = days[date.getDay()];
        dayMap.set(dayName, (dayMap.get(dayName) || 0) + 1);

        // Track visitor sessions
        if (session.visitor_fingerprint) {
          const count = visitorSessions.get(session.visitor_fingerprint) || 0;
          visitorSessions.set(session.visitor_fingerprint, count + 1);
        }
      });

      // Count new vs returning
      let newVisitors = 0;
      let returningVisitors = 0;
      visitorSessions.forEach(count => {
        if (count === 1) newVisitors++;
        else returningVisitors++;
      });

      return {
        hourly: Array.from(hourMap.entries())
          .map(([hour, sessions]) => ({ hour, sessions }))
          .sort((a, b) => a.hour - b.hour),
        daily: Array.from(dayMap.entries())
          .map(([day, sessions]) => ({ day, sessions })),
        newVisitors,
        returningVisitors,
      };
    },
  });
};

export const useBounceRate = (startDate: Date, endDate: Date) => {
  return useQuery({
    queryKey: ['bounce-rate', startDate.toISOString(), endDate.toISOString()],
    queryFn: async () => {
      const { data: sessions } = await supabase
        .from('analytics_sessions')
        .select('session_id')
        .gte('started_at', startDate.toISOString())
        .lte('started_at', endDate.toISOString());

      if (!sessions || sessions.length === 0) return 0;

      const { data: pageViews } = await supabase
        .from('page_views')
        .select('session_id')
        .gte('viewed_at', startDate.toISOString())
        .lte('viewed_at', endDate.toISOString());

      if (!pageViews) return 0;

      const sessionPageCounts = new Map<string, number>();
      pageViews.forEach(pv => {
        sessionPageCounts.set(pv.session_id, (sessionPageCounts.get(pv.session_id) || 0) + 1);
      });

      const bouncedSessions = sessions.filter(s => 
        (sessionPageCounts.get(s.session_id) || 0) <= 1
      ).length;

      return Math.round((bouncedSessions / sessions.length) * 100);
    },
  });
};
