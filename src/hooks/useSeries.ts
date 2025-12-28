import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { SeriesData } from "@/types";

// Re-export for backward compatibility
export type { SeriesData };

export const useSeries = () => {
  return useQuery({
    queryKey: ["series"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("series")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) {
        throw error;
      }

      return data as SeriesData[];
    },
  });
};
