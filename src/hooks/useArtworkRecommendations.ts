import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAnalytics } from './useAnalytics';

export interface ArtworkRecommendation {
  artworkId: string;
  reason: string;
}

export const useArtworkRecommendations = () => {
  const { sessionId } = useAnalytics();

  return useQuery({
    queryKey: ['artwork-recommendations', sessionId],
    queryFn: async (): Promise<ArtworkRecommendation[]> => {
      if (!sessionId) return [];

      const { data, error } = await supabase.functions.invoke('recommend-artworks', {
        body: { sessionId }
      });

      if (error) {
        console.error('Error fetching recommendations:', error);
        throw error;
      }

      return data.recommendations || [];
    },
    enabled: !!sessionId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
