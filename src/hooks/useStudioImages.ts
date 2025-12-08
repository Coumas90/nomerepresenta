import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface StudioImage {
  id: string;
  image_url: string;
  title: string | null;
  description: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

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
