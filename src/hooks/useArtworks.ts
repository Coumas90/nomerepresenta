import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ArtworkData {
  id: string;
  title: string;
  year: string;
  dimensions: string;
  technique: string;
  materials: string;
  description: string;
  image_url: string;
  image_detail_url: string;
  series_id: string;
  display_order: number;
}

export const useArtworks = () => {
  return useQuery({
    queryKey: ["artworks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("artworks")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) {
        throw error;
      }

      return data as ArtworkData[];
    },
  });
};

export const useArtwork = (id: string | undefined) => {
  return useQuery({
    queryKey: ["artwork", id],
    queryFn: async () => {
      if (!id) {
        throw new Error("Artwork ID is required");
      }

      const { data, error } = await supabase
        .from("artworks")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        throw error;
      }

      return data as ArtworkData;
    },
    enabled: !!id,
  });
};
