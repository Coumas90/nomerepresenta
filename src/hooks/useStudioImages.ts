import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { StudioImage } from "@/types";

export interface StudioImageWithSeries extends StudioImage {
  series_name: string | null;
  series_display_order: number | null;
}

export const useStudioImages = () => {
  return useQuery({
    queryKey: ["studio-images"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("studio_images")
        .select("*, series:studio_series!studio_images_series_id_fkey(name, display_order)")
        .order("display_order", { ascending: true });

      if (error) {
        throw error;
      }

      return (data as any[]).map((img): StudioImageWithSeries => ({
        id: img.id,
        image_url: img.image_url,
        title: img.title,
        description: img.description,
        display_order: img.display_order,
        series_id: img.series_id,
        created_at: img.created_at,
        updated_at: img.updated_at,
        series_name: img.series?.name ?? null,
        series_display_order: img.series?.display_order ?? null,
      }));
    },
  });
};
