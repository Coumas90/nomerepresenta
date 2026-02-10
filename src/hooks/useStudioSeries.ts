import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { SeriesData } from "@/types";

export const useStudioSeries = () => {
  return useQuery({
    queryKey: ["studio-series"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("studio_series")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data as SeriesData[];
    },
  });
};
