import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { StudioImage } from "@/types";

export const useStudioImages = () => {
  return useQuery({
    queryKey: ["studio-images"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("studio_images")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) {
        throw error;
      }

      return data as StudioImage[];
    },
  });
};
