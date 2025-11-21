import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SeriesData {
  id: string;
  name: string;
  description: string | null;
  display_order: number;
}

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
