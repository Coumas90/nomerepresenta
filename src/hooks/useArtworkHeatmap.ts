import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { subDays } from 'date-fns';
import type { HeatmapPoint, ArtworkHeatmapData } from '@/types';

export const useArtworkHeatmap = (artworkId: string, days: number = 30) => {
  return useQuery({
    queryKey: ['artwork-heatmap', artworkId, days],
    queryFn: async (): Promise<ArtworkHeatmapData> => {
      const startDate = subDays(new Date(), days);

      const { data: trackingData, error } = await supabase
        .from('artwork_cursor_tracking')
        .select('x_position, y_position, session_id, viewport_width, viewport_height')
        .eq('artwork_id', artworkId)
        .gte('created_at', startDate.toISOString());

      if (error) {
        console.error('Error fetching heatmap data:', error);
        throw error;
      }

      if (!trackingData || trackingData.length === 0) {
        return {
          artworkId,
          points: [],
          totalDataPoints: 0,
          uniqueSessions: 0,
        };
      }

      // Group points into a grid (20x20 grid)
      const gridSize = 20;
      const grid: Map<string, number> = new Map();

      trackingData.forEach(point => {
        // Normalize coordinates to 0-100 range (percentage)
        const x = Math.min(100, Math.max(0, point.x_position));
        const y = Math.min(100, Math.max(0, point.y_position));

        // Calculate grid cell
        const gridX = Math.floor((x / 100) * gridSize);
        const gridY = Math.floor((y / 100) * gridSize);
        const key = `${gridX},${gridY}`;

        grid.set(key, (grid.get(key) || 0) + 1);
      });

      // Find max value for normalization
      const maxValue = Math.max(...Array.from(grid.values()));

      // Convert grid to points array
      const points: HeatmapPoint[] = Array.from(grid.entries()).map(([key, count]) => {
        const [gridX, gridY] = key.split(',').map(Number);
        return {
          x: (gridX / gridSize) * 100 + (50 / gridSize), // Center of grid cell
          y: (gridY / gridSize) * 100 + (50 / gridSize),
          value: count / maxValue, // Normalize to 0-1
        };
      });

      // Count unique sessions
      const uniqueSessions = new Set(trackingData.map(d => d.session_id)).size;

      return {
        artworkId,
        points,
        totalDataPoints: trackingData.length,
        uniqueSessions,
      };
    },
    enabled: !!artworkId,
  });
};
