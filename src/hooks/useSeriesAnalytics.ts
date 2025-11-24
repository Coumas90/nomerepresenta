import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { subDays } from 'date-fns';

export interface SeriesHeatData {
  series_id: string;
  series_name: string;
  total_interactions: number;
  description_expansions: number;
  total_artwork_views: number;
  avg_artworks_per_session: number;
  unique_sessions: number;
}

export const useSeriesHeatmap = (startDate?: Date, endDate?: Date) => {
  const effectiveStartDate = startDate || subDays(new Date(), 30);
  const effectiveEndDate = endDate || new Date();

  return useQuery({
    queryKey: ['series-heatmap', effectiveStartDate.toISOString(), effectiveEndDate.toISOString()],
    queryFn: async (): Promise<SeriesHeatData[]> => {

      // Get series interactions
      const { data: interactions } = await supabase
        .from('series_interactions')
        .select(`
          series_id,
          expanded_description,
          artworks_viewed_count,
          session_id,
          series (
            name
          )
        `)
        .gte('viewed_at', effectiveStartDate.toISOString())
        .lte('viewed_at', effectiveEndDate.toISOString());

      // Get artwork views per series
      const { data: artworkViews } = await supabase
        .from('artwork_views')
        .select('series_id, session_id')
        .gte('started_at', effectiveStartDate.toISOString())
        .lte('started_at', effectiveEndDate.toISOString())
        .not('series_id', 'is', null);

      if (!interactions || interactions.length === 0) return [];

      // Aggregate by series
      const seriesMap = new Map<string, {
        name: string;
        interactions: number;
        expansions: number;
        sessions: Set<string>;
        artworkViews: number;
        totalArtworksViewed: number;
      }>();

      interactions.forEach(interaction => {
        const seriesData = interaction.series as any;
        if (!seriesData) return;

        const key = interaction.series_id;
        if (!seriesMap.has(key)) {
          seriesMap.set(key, {
            name: seriesData.name || 'Unknown',
            interactions: 0,
            expansions: 0,
            sessions: new Set(),
            artworkViews: 0,
            totalArtworksViewed: 0,
          });
        }

        const data = seriesMap.get(key)!;
        data.interactions++;
        if (interaction.expanded_description) data.expansions++;
        data.sessions.add(interaction.session_id);
        data.totalArtworksViewed += interaction.artworks_viewed_count || 0;
      });

      // Add artwork views
      artworkViews?.forEach(view => {
        if (!view.series_id) return;
        const data = seriesMap.get(view.series_id);
        if (data) {
          data.artworkViews++;
        }
      });

      // Convert to array and calculate metrics
      const result: SeriesHeatData[] = Array.from(seriesMap.entries())
        .map(([series_id, data]) => ({
          series_id,
          series_name: data.name,
          total_interactions: data.interactions,
          description_expansions: data.expansions,
          total_artwork_views: data.artworkViews,
          avg_artworks_per_session: data.sessions.size > 0
            ? Math.floor(data.totalArtworksViewed / data.sessions.size)
            : 0,
          unique_sessions: data.sessions.size,
        }))
        .sort((a, b) => b.total_interactions - a.total_interactions);

      return result;
    },
  });
};
