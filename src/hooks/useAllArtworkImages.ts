import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { ArtworkImage } from "@/types";

/**
 * Fetches ALL artwork_images in a single query, grouped by artwork_id.
 * Eliminates N+1 queries when rendering the works gallery.
 */
export const useAllArtworkImages = () => {
  return useQuery({
    queryKey: ["all-artwork-images"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("artwork_images")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;

      // Group by artwork_id for O(1) lookup
      const grouped: Record<string, ArtworkImage[]> = {};
      for (const img of (data as ArtworkImage[])) {
        if (!grouped[img.artwork_id]) {
          grouped[img.artwork_id] = [];
        }
        grouped[img.artwork_id].push(img);
      }
      return grouped;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
