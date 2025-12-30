import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { subDays } from 'date-fns';
import type { ArtworkAnalytics } from '@/types';

export const useTopArtworks = (startDate?: Date, endDate?: Date, limit: number = 10) => {
  const effectiveStartDate = startDate || subDays(new Date(), 30);
  const effectiveEndDate = endDate || new Date();

  return useQuery({
    queryKey: ['top-artworks', effectiveStartDate.toISOString(), effectiveEndDate.toISOString(), limit],
    queryFn: async (): Promise<ArtworkAnalytics[]> => {

      const { data: views } = await supabase
        .from('artwork_views')
        .select(`
          artwork_id,
          view_duration_seconds,
          hovered,
          clicked_detail,
          session_id,
          artworks (
            title,
            series (
              name
            )
          )
        `)
        .gte('started_at', effectiveStartDate.toISOString())
        .lte('started_at', effectiveEndDate.toISOString());

      if (!views || views.length === 0) return [];

      // Aggregate by artwork
      const artworkMap = new Map<string, {
        title: string;
        series_name: string;
        views: number;
        sessions: Set<string>;
        totalDuration: number;
        hovers: number;
        clicks: number;
      }>();

      views.forEach(view => {
        const artworkData = view.artworks as any;
        if (!artworkData) return;

        const key = view.artwork_id;
        if (!artworkMap.has(key)) {
          artworkMap.set(key, {
            title: artworkData.title || 'Unknown',
            series_name: artworkData.series?.name || 'Unknown',
            views: 0,
            sessions: new Set(),
            totalDuration: 0,
            hovers: 0,
            clicks: 0,
          });
        }

        const data = artworkMap.get(key)!;
        data.views++;
        data.sessions.add(view.session_id);
        data.totalDuration += view.view_duration_seconds || 0;
        if (view.hovered) data.hovers++;
        if (view.clicked_detail) data.clicks++;
      });

      // Convert to array and sort by views
      const result: ArtworkAnalytics[] = Array.from(artworkMap.entries())
        .map(([artwork_id, data]) => ({
          artwork_id,
          title: data.title,
          series_name: data.series_name,
          total_views: data.views,
          unique_sessions: data.sessions.size,
          avg_view_duration: data.views > 0 ? Math.floor(data.totalDuration / data.views) : 0,
          total_hovers: data.hovers,
          detail_clicks: data.clicks,
        }))
        .sort((a, b) => b.total_views - a.total_views)
        .slice(0, limit);

      return result;
    },
  });
};

export const useArtworkEngagement = (startDate?: Date, endDate?: Date) => {
  const effectiveStartDate = startDate || subDays(new Date(), 30);
  const effectiveEndDate = endDate || new Date();

  return useQuery({
    queryKey: ['artwork-engagement', effectiveStartDate.toISOString(), effectiveEndDate.toISOString()],
    queryFn: async () => {

      const { data: views } = await supabase
        .from('artwork_views')
        .select(`
          artwork_id,
          view_duration_seconds,
          artworks (
            title
          )
        `)
        .gte('started_at', effectiveStartDate.toISOString())
        .lte('started_at', effectiveEndDate.toISOString())
        .not('view_duration_seconds', 'is', null);

      if (!views || views.length === 0) return [];

      // Group by artwork and calculate average
      const artworkMap = new Map<string, { title: string; durations: number[] }>();

      views.forEach(view => {
        const artworkData = view.artworks as any;
        if (!artworkData || !view.view_duration_seconds) return;

        const key = view.artwork_id;
        if (!artworkMap.has(key)) {
          artworkMap.set(key, {
            title: artworkData.title || 'Unknown',
            durations: [],
          });
        }
        artworkMap.get(key)!.durations.push(view.view_duration_seconds);
      });

      return Array.from(artworkMap.entries())
        .map(([artwork_id, data]) => ({
          artwork_id,
          title: data.title,
          avg_duration: Math.floor(data.durations.reduce((sum, d) => sum + d, 0) / data.durations.length),
          total_views: data.durations.length,
        }))
        .sort((a, b) => b.avg_duration - a.avg_duration)
        .slice(0, 15);
    },
  });
};
